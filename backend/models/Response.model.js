const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const answerSchema = new mongoose.Schema({
  questionId: { type: mongoose.Schema.Types.ObjectId, required: true },
  questionType: String,
  value: mongoose.Schema.Types.Mixed, // string, array, number depending on type
});

const responseSchema = new mongoose.Schema(
  {
    survey: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Survey',
      required: true,
    },
    respondent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null, // null = anonymous
    },
    // Anonymous session token
    sessionToken: {
      type: String,
      default: () => uuidv4(),
      unique: true,
    },
    status: {
      type: String,
      enum: ['in_progress', 'completed', 'abandoned'],
      default: 'in_progress',
    },
    answers: [answerSchema],
    startedAt: { type: Date, default: Date.now },
    submittedAt: Date,
    completionTime: Number, // seconds
    metadata: {
      ipAddress: String,
      userAgent: String,
    },
  },
  { timestamps: true }
);

responseSchema.index({ survey: 1, status: 1 });
responseSchema.index({ survey: 1, respondent: 1 });
// `sessionToken` is declared with `unique: true` on the field, which creates
// an index. Remove the explicit index declaration to avoid duplicate-index warnings.

// On submit, calculate completion time
responseSchema.pre('save', function (next) {
  if (this.isModified('status') && this.status === 'completed') {
    this.submittedAt = new Date();
    this.completionTime = Math.round((this.submittedAt - this.startedAt) / 1000);
  }
  next();
});

module.exports = mongoose.model('Response', responseSchema);
