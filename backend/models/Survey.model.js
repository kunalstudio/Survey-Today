const mongoose = require('mongoose');

// ─── Question Sub-Schema ───────────────────────────────────────
const questionSchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
  type: {
    type: String,
    required: true,
    enum: ['multiple_choice', 'checkbox', 'short_text', 'long_text', 'scale', 'rating', 'yes_no', 'date', 'dropdown'],
  },
  text: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  required: { type: Boolean, default: false },
  order: { type: Number, default: 0 },

  // For MCQ, checkbox, dropdown
  options: [
    {
      _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
      text: { type: String, required: true },
      value: { type: String },
    },
  ],

  // For scale / rating
  scaleMin: { type: Number, default: 1 },
  scaleMax: { type: Number, default: 10 },
  scaleMinLabel: { type: String, default: '' },
  scaleMaxLabel: { type: String, default: '' },

  // Conditional logic
  logic: {
    enabled: { type: Boolean, default: false },
    conditions: [
      {
        questionId: mongoose.Schema.Types.ObjectId,
        operator: { type: String, enum: ['equals', 'not_equals', 'contains'] },
        value: mongoose.Schema.Types.Mixed,
        action: { type: String, enum: ['show', 'hide', 'skip_to'] },
        targetId: mongoose.Schema.Types.ObjectId,
      },
    ],
  },
});

// ─── Survey Schema ─────────────────────────────────────────────
const surveySchema = new mongoose.Schema(
  {
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Survey title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: { type: String, default: '', maxlength: 2000 },
    slug: { type: String, unique: true, sparse: true },
    status: {
      type: String,
      enum: ['draft', 'active', 'closed', 'archived'],
      default: 'draft',
    },

    questions: [questionSchema],

    settings: {
      isPublic: { type: Boolean, default: false },
      allowAnonymous: { type: Boolean, default: true },
      requireLogin: { type: Boolean, default: false },
      oneResponsePerUser: { type: Boolean, default: true },
      showProgressBar: { type: Boolean, default: true },
      shuffleQuestions: { type: Boolean, default: false },
      confirmationMessage: { type: String, default: 'Thank you for completing this survey!' },
      redirectUrl: { type: String, default: '' },
    },

    expiresAt: { type: Date, default: null },

    // Stats (denormalized for quick reads)
    stats: {
      totalResponses: { type: Number, default: 0 },
      completedResponses: { type: Number, default: 0 },
      averageCompletionTime: { type: Number, default: 0 }, // seconds
    },

    publishedAt: Date,
    closedAt: Date,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Index for fast queries
surveySchema.index({ creator: 1, status: 1 });
surveySchema.index({ status: 1, 'settings.isPublic': 1 });
// `slug` has `unique: true` on the field above, which creates an index.
// Avoid declaring the same index twice to prevent duplicate-index warnings.

// Auto-generate slug from title
surveySchema.pre('save', function (next) {
  if (this.isModified('title') && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 60) + '-' + Date.now().toString(36);
  }
  next();
});

// When status changes to active, set publishedAt
surveySchema.pre('save', function (next) {
  if (this.isModified('status')) {
    if (this.status === 'active' && !this.publishedAt) this.publishedAt = new Date();
    if (this.status === 'closed') this.closedAt = new Date();
  }
  next();
});

module.exports = mongoose.model('Survey', surveySchema);
