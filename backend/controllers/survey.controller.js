const Survey = require('../models/Survey.model');
const Response = require('../models/Response.model');
const AppError = require('../middleware/AppError');

/**
 * @desc    Get all surveys (public + user's own)
 * @route   GET /api/surveys
 * @access  Public / Private
 */
exports.getSurveys = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    const skip = (page - 1) * limit;

    let query = {};

    if (req.user) {
      // Logged in: show user's own surveys
      query.creator = req.user._id;
      if (status) query.status = status;
    } else {
      // Not logged in: only public active surveys
      query['settings.isPublic'] = true;
      query.status = 'active';
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const [surveys, total] = await Promise.all([
      Survey.find(query)
        .populate('creator', 'name email avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Survey.countDocuments(query),
    ]);

    res.json({
      success: true,
      count: surveys.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: Number(page),
      surveys,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single survey by ID or slug
 * @route   GET /api/surveys/:id
 * @access  Public / Private
 */
exports.getSurvey = async (req, res, next) => {
  try {
    const { id } = req.params;
    const isObjectId = id.match(/^[0-9a-fA-F]{24}$/);

    const survey = await Survey.findOne(
      isObjectId ? { _id: id } : { slug: id }
    ).populate('creator', 'name email avatar');

    if (!survey) return next(new AppError('Survey not found.', 404));

    // Private survey — only creator can view
    const isOwner = req.user && survey.creator._id.equals(req.user._id);
    const isAdmin = req.user && req.user.role === 'admin';

    if (!survey.settings.isPublic && !isOwner && !isAdmin) {
      return next(new AppError('You do not have access to this survey.', 403));
    }

    res.json({ success: true, survey });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new survey
 * @route   POST /api/surveys
 * @access  Private
 */
exports.createSurvey = async (req, res, next) => {
  try {
    const survey = await Survey.create({ ...req.body, creator: req.user._id });
    res.status(201).json({ success: true, survey });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a survey
 * @route   PUT /api/surveys/:id
 * @access  Private (owner only)
 */
exports.updateSurvey = async (req, res, next) => {
  try {
    let survey = await Survey.findById(req.params.id);
    if (!survey) return next(new AppError('Survey not found.', 404));

    if (!survey.creator.equals(req.user._id) && req.user.role !== 'admin') {
      return next(new AppError('Not authorized to update this survey.', 403));
    }

    // Can't edit active/closed surveys (only settings)
    if (survey.status === 'active' && req.body.questions) {
      return next(new AppError('Cannot edit questions of a live survey. Close it first.', 400));
    }

    // Prevent changing creator
    delete req.body.creator;

    survey = await Survey.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json({ success: true, survey });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a survey
 * @route   DELETE /api/surveys/:id
 * @access  Private (owner only)
 */
exports.deleteSurvey = async (req, res, next) => {
  try {
    const survey = await Survey.findById(req.params.id);
    if (!survey) return next(new AppError('Survey not found.', 404));

    if (!survey.creator.equals(req.user._id) && req.user.role !== 'admin') {
      return next(new AppError('Not authorized to delete this survey.', 403));
    }

    // Also delete all responses
    await Response.deleteMany({ survey: survey._id });
    await survey.deleteOne();

    res.json({ success: true, message: 'Survey and all its responses have been deleted.' });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Publish a draft survey → active
 * @route   PATCH /api/surveys/:id/publish
 * @access  Private (owner only)
 */
exports.publishSurvey = async (req, res, next) => {
  try {
    const survey = await Survey.findById(req.params.id);
    if (!survey) return next(new AppError('Survey not found.', 404));
    if (!survey.creator.equals(req.user._id)) return next(new AppError('Not authorized.', 403));
    if (survey.questions.length === 0) return next(new AppError('Add at least one question before publishing.', 400));
    if (survey.status !== 'draft') return next(new AppError('Only draft surveys can be published.', 400));

    survey.status = 'active';
    await survey.save();

    res.json({ success: true, message: 'Survey is now live!', survey });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Close an active survey
 * @route   PATCH /api/surveys/:id/close
 * @access  Private (owner only)
 */
exports.closeSurvey = async (req, res, next) => {
  try {
    const survey = await Survey.findById(req.params.id);
    if (!survey) return next(new AppError('Survey not found.', 404));
    if (!survey.creator.equals(req.user._id)) return next(new AppError('Not authorized.', 403));
    if (survey.status !== 'active') return next(new AppError('Only active surveys can be closed.', 400));

    survey.status = 'closed';
    await survey.save();

    res.json({ success: true, message: 'Survey closed.', survey });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Duplicate a survey as a new draft
 * @route   POST /api/surveys/:id/duplicate
 * @access  Private
 */
exports.duplicateSurvey = async (req, res, next) => {
  try {
    const original = await Survey.findById(req.params.id);
    if (!original) return next(new AppError('Survey not found.', 404));

    const duplicateData = original.toObject();
    delete duplicateData._id;
    delete duplicateData.slug;
    delete duplicateData.stats;
    delete duplicateData.publishedAt;
    delete duplicateData.closedAt;
    duplicateData.title = `${original.title} (Copy)`;
    duplicateData.status = 'draft';
    duplicateData.creator = req.user._id;

    const duplicate = await Survey.create(duplicateData);
    res.status(201).json({ success: true, survey: duplicate });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add a question to a survey
 * @route   POST /api/surveys/:id/questions
 * @access  Private (owner only)
 */
exports.addQuestion = async (req, res, next) => {
  try {
    const survey = await Survey.findById(req.params.id);
    if (!survey) return next(new AppError('Survey not found.', 404));
    if (!survey.creator.equals(req.user._id)) return next(new AppError('Not authorized.', 403));
    if (survey.status !== 'draft') return next(new AppError('Can only edit questions in draft mode.', 400));

    const order = survey.questions.length; // Append to end
    survey.questions.push({ ...req.body, order });
    await survey.save();

    res.status(201).json({ success: true, questions: survey.questions });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a question
 * @route   PUT /api/surveys/:id/questions/:questionId
 * @access  Private (owner only)
 */
exports.updateQuestion = async (req, res, next) => {
  try {
    const survey = await Survey.findById(req.params.id);
    if (!survey) return next(new AppError('Survey not found.', 404));
    if (!survey.creator.equals(req.user._id)) return next(new AppError('Not authorized.', 403));

    const question = survey.questions.id(req.params.questionId);
    if (!question) return next(new AppError('Question not found.', 404));

    Object.assign(question, req.body);
    await survey.save();

    res.json({ success: true, questions: survey.questions });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a question
 * @route   DELETE /api/surveys/:id/questions/:questionId
 * @access  Private (owner only)
 */
exports.deleteQuestion = async (req, res, next) => {
  try {
    const survey = await Survey.findById(req.params.id);
    if (!survey) return next(new AppError('Survey not found.', 404));
    if (!survey.creator.equals(req.user._id)) return next(new AppError('Not authorized.', 403));
    if (survey.status !== 'draft') return next(new AppError('Can only edit questions in draft mode.', 400));

    survey.questions.pull({ _id: req.params.questionId });
    await survey.save();

    res.json({ success: true, questions: survey.questions });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Reorder questions
 * @route   PATCH /api/surveys/:id/questions/reorder
 * @access  Private (owner only)
 */
exports.reorderQuestions = async (req, res, next) => {
  try {
    const survey = await Survey.findById(req.params.id);
    if (!survey) return next(new AppError('Survey not found.', 404));
    if (!survey.creator.equals(req.user._id)) return next(new AppError('Not authorized.', 403));

    const { orderedIds } = req.body; // Array of question IDs in new order
    orderedIds.forEach((qid, index) => {
      const q = survey.questions.id(qid);
      if (q) q.order = index;
    });

    survey.questions.sort((a, b) => a.order - b.order);
    await survey.save();

    res.json({ success: true, questions: survey.questions });
  } catch (error) {
    next(error);
  }
};
