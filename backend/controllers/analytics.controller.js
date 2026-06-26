const Survey = require('../models/Survey.model');
const Response = require('../models/Response.model');
const AppError = require('../middleware/AppError');

/**
 * @desc    Get survey analytics summary
 * @route   GET /api/surveys/:surveyId/analytics/summary
 * @access  Private (owner)
 */
exports.getSummary = async (req, res, next) => {
  try {
    const survey = await Survey.findById(req.params.surveyId);
    if (!survey) return next(new AppError('Survey not found.', 404));
    if (!survey.creator.equals(req.user._id) && req.user.role !== 'admin') {
      return next(new AppError('Not authorized.', 403));
    }

    const [total, completed, inProgress, abandoned, avgTimeResult] = await Promise.all([
      Response.countDocuments({ survey: survey._id }),
      Response.countDocuments({ survey: survey._id, status: 'completed' }),
      Response.countDocuments({ survey: survey._id, status: 'in_progress' }),
      Response.countDocuments({ survey: survey._id, status: 'abandoned' }),
      Response.aggregate([
        { $match: { survey: survey._id, status: 'completed', completionTime: { $exists: true, $gt: 0 } } },
        { $group: { _id: null, avg: { $avg: '$completionTime' } } },
      ]),
    ]);

    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    const dropOffRate    = total > 0 ? Math.round((abandoned / total) * 100) : 0;
    const avgTime = avgTimeResult[0]?.avg ? Math.round(avgTimeResult[0].avg) : 0;

    res.json({
      success: true,
      summary: {
        totalResponses: total,
        completedResponses: completed,
        inProgress,
        abandoned,
        completionRate,
        dropOffRate,
        averageCompletionTime: avgTime, // seconds
        questions: survey.questions.length,
        status: survey.status,
        publishedAt: survey.publishedAt,
        closedAt: survey.closedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get aggregated results per question
 * @route   GET /api/surveys/:surveyId/analytics/questions
 * @access  Private (owner)
 */
exports.getQuestionAnalytics = async (req, res, next) => {
  try {
    const survey = await Survey.findById(req.params.surveyId);
    if (!survey) return next(new AppError('Survey not found.', 404));
    if (!survey.creator.equals(req.user._id) && req.user.role !== 'admin') {
      return next(new AppError('Not authorized.', 403));
    }

    const responses = await Response.find({
      survey: survey._id,
      status: 'completed',
    }).select('answers');

    const questionMap = {};
    survey.questions.forEach((q) => {
      questionMap[q._id.toString()] = {
        questionId: q._id,
        text: q.text,
        type: q.type,
        required: q.required,
        totalAnswers: 0,
        skipped: 0,
        data: {}, // For MCQ/checkbox: { optionText: count }
        values: [], // For text/scale/rating: raw values
      };
    });

    const totalCompleted = responses.length;

    responses.forEach((response) => {
      const answeredIds = new Set(response.answers.map((a) => a.questionId.toString()));

      response.answers.forEach((answer) => {
        const qid = answer.questionId.toString();
        if (!questionMap[qid]) return;
        const qStats = questionMap[qid];
        qStats.totalAnswers++;

        const q = survey.questions.id(answer.questionId);
        if (!q) return;

        if (['multiple_choice', 'dropdown', 'yes_no'].includes(q.type)) {
          const val = String(answer.value);
          qStats.data[val] = (qStats.data[val] || 0) + 1;
        } else if (q.type === 'checkbox') {
          const vals = Array.isArray(answer.value) ? answer.value : [answer.value];
          vals.forEach((v) => {
            qStats.data[v] = (qStats.data[v] || 0) + 1;
          });
        } else {
          // text, scale, rating, date
          qStats.values.push(answer.value);
        }
      });

      // Count skipped (in completed responses where a question has no answer)
      Object.keys(questionMap).forEach((qid) => {
        if (!answeredIds.has(qid)) {
          questionMap[qid].skipped++;
        }
      });
    });

    // Convert to chart-friendly format
    const analytics = Object.values(questionMap).map((q) => ({
      questionId: q.questionId,
      text: q.text,
      type: q.type,
      required: q.required,
      totalAnswers: q.totalAnswers,
      skipped: q.skipped,
      responseRate: totalCompleted > 0 ? Math.round((q.totalAnswers / totalCompleted) * 100) : 0,
      chartData: Object.entries(q.data).map(([label, count]) => ({
        label,
        count,
        percentage: q.totalAnswers > 0 ? Math.round((count / q.totalAnswers) * 100) : 0,
      })),
      average:
        q.values.length > 0
          ? parseFloat((q.values.reduce((sum, v) => sum + Number(v), 0) / q.values.length).toFixed(2))
          : null,
      // Include raw values for text questions (up to 200)
      textValues: ['short_text', 'long_text'].includes(q.type) ? q.values.slice(0, 200) : undefined,
    }));

    res.json({ success: true, analytics, totalCompleted });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Export responses as CSV
 * @route   GET /api/surveys/:surveyId/analytics/export
 * @access  Private (owner)
 */
exports.exportCSV = async (req, res, next) => {
  try {
    const survey = await Survey.findById(req.params.surveyId);
    if (!survey) return next(new AppError('Survey not found.', 404));
    if (!survey.creator.equals(req.user._id)) return next(new AppError('Not authorized.', 403));

    const responses = await Response.find({ survey: survey._id, status: 'completed' })
      .populate('respondent', 'name email')
      .lean();

    // Build CSV header
    const headers = [
      'Response ID',
      'Respondent Email',
      'Respondent Name',
      'Submitted At',
      'Completion Time (s)',
      ...survey.questions.map((q) => q.text),
    ];

    const rows = responses.map((r) => {
      const answerMap = {};
      r.answers.forEach((a) => {
        answerMap[a.questionId.toString()] = Array.isArray(a.value)
          ? a.value.join('; ')
          : String(a.value ?? '');
      });

      return [
        r._id,
        r.respondent?.email || 'Anonymous',
        r.respondent?.name || 'Anonymous',
        r.submittedAt ? new Date(r.submittedAt).toISOString() : '',
        r.completionTime || '',
        ...survey.questions.map((q) => answerMap[q._id.toString()] || ''),
      ];
    });

    const csvLines = [headers, ...rows].map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    );
    const csv = csvLines.join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="survey-${survey._id}-responses.csv"`);
    res.send(csv);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Export responses as structured JSON
 * @route   GET /api/surveys/:surveyId/analytics/export-json
 * @access  Private (owner)
 */
exports.exportJSON = async (req, res, next) => {
  try {
    const survey = await Survey.findById(req.params.surveyId);
    if (!survey) return next(new AppError('Survey not found.', 404));
    if (!survey.creator.equals(req.user._id)) return next(new AppError('Not authorized.', 403));

    const responses = await Response.find({ survey: survey._id, status: 'completed' })
      .populate('respondent', 'name email')
      .lean();

    // Build question lookup
    const questionLookup = {};
    survey.questions.forEach((q) => {
      questionLookup[q._id.toString()] = { text: q.text, type: q.type };
    });

    const structured = responses.map((r) => ({
      responseId: r._id,
      respondent: r.respondent
        ? { name: r.respondent.name, email: r.respondent.email }
        : 'Anonymous',
      submittedAt: r.submittedAt,
      completionTime: r.completionTime,
      answers: r.answers.map((a) => ({
        questionId: a.questionId,
        question: questionLookup[a.questionId.toString()]?.text || 'Unknown',
        type: questionLookup[a.questionId.toString()]?.type,
        value: a.value,
      })),
    }));

    res.setHeader('Content-Disposition', `attachment; filename="survey-${survey._id}-responses.json"`);
    res.json({
      success: true,
      survey: { title: survey.title, id: survey._id },
      totalResponses: responses.length,
      responses: structured,
    });
  } catch (error) {
    next(error);
  }
};
