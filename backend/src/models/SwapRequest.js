const mongoose = require('mongoose');

const SwapStatus = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED'
};

const SwapRequestSchema = new mongoose.Schema({
  requester: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  responder: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  myEvent: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  theirEvent: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  status: { type: String, enum: Object.values(SwapStatus), default: SwapStatus.PENDING }
}, { timestamps: true });

SwapRequestSchema.statics.Status = SwapStatus;

module.exports = mongoose.model('SwapRequest', SwapRequestSchema);
