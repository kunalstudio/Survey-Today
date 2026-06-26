const Survey = require('../models/Survey.model');
const Response = require('../models/Response.model');
const AppError = require('../middleware/AppError');

/**
 * @desc    Start a response session
 * @route   POST /api/surveys/:surveyId/responses/start
 * @access  Public / Private
 */
exports.startResponse = async (req, res, next) => {
  try {
    const survey = await Survey.findById(req.params.surveyId);
    if (!survey) return next(new AppError('Survey not found.', 404));
    if (survey.status !== 'active') return next(new AppError('This survey is not accepting responses.', 400));

    // Check if expired
    if (survey.expiresAt && survey.expiresAt < new Date()) {
      return next(new AppError('This survey has expired.', 400));
    }

    // Check one-response-per-user
    if (survey.settings.oneResponsePerUser && req.user) {
      const existing = await Response.findOne({
        survey: survey._id,
        respondent: req.user._id,
        status: 'completed',
      });
      if (existing) return next(new AppError('You have already completed this survey.', 400));
    }

    const response = await Response.create({
      survey: survey._id,
      respondent: req.user ? req.user._id : null,
      metadata: {
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      },
    });

    // Increment totalResponses when session starts
    await Survey.findByIdAndUpdate(req.params.surveyId, {
      $inc: { 'stats.totalResponses': 1 },
    });

    res.status(201).json({
      success: true,
      sessionToken: response.sessionToken,
      responseId: response._id,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Save partial answers (autosave)
 * @route   PATCH /api/surveys/:surveyId/responses/:responseId/answers
 * @access  Public (via sessionToken)
 */
exports.saveAnswers = async (req, res, next) => {
  try {
    const response = await Response.findOne({
      _id: req.params.responseId,
      sessionToken: req.headers['x-session-token'],
    });

    if (!response) return next(new AppError('Response session not found or invalid token.', 404));
    if (response.status === 'completed') return next(new AppError('This response has already been submitted.', 400));
    if (response.status === 'abandoned') return next(new AppError('This response session was abandoned.', 400));

    // Merge answers (overwrite existing answers for same questionId)
    const { answers } = req.body;
    answers.forEach((newAnswer) => {
      const existingIndex = response.answers.findIndex(
        (a) => a.questionId.toString() === newAnswer.questionId
      );
      if (existingIndex >= 0) {
        response.answers[existingIndex] = newAnswer;
      } else {
        response.answers.push(newAnswer);
      }
    });

    await response.save();
    res.json({ success: true, message: 'Answers saved.' });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Submit final response
 * @route   POST /api/surveys/:surveyId/responses/:responseId/submit
 * @access  Public (via sessionToken)
 */
exports.submitResponse = async (req, res, next) => {
  try {
    const survey = await Survey.findById(req.params.surveyId);
    if (!survey) return next(new AppError('Survey not found.', 404));

    const response = await Response.findOne({
      _id: req.params.responseId,
      sessionToken: req.headers['x-session-token'],
    });

    if (!response) return next(new AppError('Response session not found.', 404));
    if (response.status === 'completed') return next(new AppError('Already submitted.', 400));
    if (response.status === 'abandoned') return next(new AppError('This session was abandoned.', 400));

    // Validate required questions
    const requiredQuestions = survey.questions.filter((q) => q.required);
    const answeredIds = response.answers.map((a) => a.questionId.toString());
    const missingRequired = requiredQuestions.filter((q) => !answeredIds.includes(q._id.toString()));

    if (missingRequired.length > 0) {
      return next(new AppError(`Please answer all required questions. Missing: ${missingRequired.map((q) => q.text).join(', ')}`, 400));
    }

    // Merge any final answers from submission payload
    const { answers } = req.body;
    if (answers && Array.isArray(answers)) {
      answers.forEach((newAnswer) => {
        const idx = response.answers.findIndex((a) => a.questionId.toString() === newAnswer.questionId);
        if (idx >= 0) response.answers[idx] = newAnswer;
        else response.answers.push(newAnswer);
      });
    }

    response.status = 'completed';
    await response.save(); // pre-save hook calculates completionTime + submittedAt

    // ── Update denormalized stats ─────────────────────────────
    // Recalculate averageCompletionTime using aggregation
    const [avgResult] = await Response.aggregate([
      {
        $match: {
          survey: survey._id,
          status: 'completed',
          completionTime: { $exists: true, $gt: 0 },
        },
      },
      { $group: { _id: null, avg: { $avg: '$completionTime' }, count: { $sum: 1 } } },
    ]);

    await Survey.findByIdAndUpdate(req.params.surveyId, {
      $inc: { 'stats.completedResponses': 1 },
      $set: {
        'stats.averageCompletionTime': avgResult ? Math.round(avgResult.avg) : 0,
      },
    });

    res.json({
      success: true,
      message: survey.settings.confirmationMessage,
      redirectUrl: survey.settings.redirectUrl,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Abandon a response session
 * @route   PATCH /api/surveys/:surveyId/responses/:responseId/abandon
 * @access  Public (via sessionToken)
 */
exports.abandonResponse = async (req, res, next) => {
  try {
    const response = await Response.findOne({
      _id: req.params.responseId,
      sessionToken: req.headers['x-session-token'],
    });

    if (!response) return next(new AppError('Response session not found.', 404));
    if (response.status === 'completed') return next(new AppError('Cannot abandon an already-completed response.', 400));

    response.status = 'abandoned';
    await response.save();

    // Decrement totalResponses since this was never completed
    await Survey.findByIdAndUpdate(req.params.surveyId, {
      $inc: { 'stats.totalResponses': -1 },
    });

    res.json({ success: true, message: 'Response session marked as abandoned.' });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all responses for a survey (owner only)
 * @route   GET /api/surveys/:surveyId/responses
 * @access  Private (owner)
 */
exports.getResponses = async (req, res, next) => {
  try {
    const survey = await Survey.findById(req.params.surveyId);
    if (!survey) return next(new AppError('Survey not found.', 404));
    if (!survey.creator.equals(req.user._id) && req.user.role !== 'admin') {
      return next(new AppError('Not authorized.', 403));
    }

    const { page = 1, limit = 20, status } = req.query;
    const query = { survey: req.params.surveyId };
    if (status) query.status = status;

    const [responses, total] = await Promise.all([
      Response.find(query)
        .populate('respondent', 'name email')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit)),
      Response.countDocuments(query),
    ]);

    res.json({ success: true, responses, total, pages: Math.ceil(total / limit) });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a single response
 * @route   DELETE /api/surveys/:surveyId/responses/:responseId
 * @access  Private (owner)
 */
exports.deleteResponse = async (req, res, next) => {
  try {
    const survey = await Survey.findById(req.params.surveyId);
    if (!survey) return next(new AppError('Survey not found.', 404));
    if (!survey.creator.equals(req.user._id)) return next(new AppError('Not authorized.', 403));

    // Fetch before deleting so we know the status
    const response = await Response.findById(req.params.responseId);
    if (!response) return next(new AppError('Response not found.', 404));

    const wasCompleted = response.status === 'completed';
    const wasStarted   = response.status !== 'abandoned'; // started but not completed = counted in totalResponses

    await response.deleteOne();

    // Only decrement counters that were actually incremented
    const statUpdate = {};
    if (wasStarted)    statUpdate['stats.totalResponses']    = -1;
    if (wasCompleted)  statUpdate['stats.completedResponses'] = -1;

    if (Object.keys(statUpdate).length > 0) {
      await Survey.findByIdAndUpdate(req.params.surveyId, { $inc: statUpdate });
    }

    // Recalculate averageCompletionTime after deletion
    if (wasCompleted) {
      const [avgResult] = await Response.aggregate([
        {
          $match: {
            survey: survey._id,
            status: 'completed',
            completionTime: { $exists: true, $gt: 0 },
          },
        },
        { $group: { _id: null, avg: { $avg: '$completionTime' } } },
      ]);
      await Survey.findByIdAndUpdate(req.params.surveyId, {
        $set: { 'stats.averageCompletionTime': avgResult ? Math.round(avgResult.avg) : 0 },
      });
    }

    res.json({ success: true, message: 'Response deleted.' });
  } catch (error) {
    next(error);
  }
};
