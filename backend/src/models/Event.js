const mongoose = require('mongoose');

const EventStatus = {
  BUSY: 'BUSY',
  SWAPPABLE: 'SWAPPABLE',
  SWAP_PENDING: 'SWAP_PENDING'
};

const EventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  status: { type: String, enum: Object.values(EventStatus), default: EventStatus.BUSY },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  // optional timezone identifier (IANA), e.g. 'America/Los_Angeles'. Stored for client display/choices.
  timezone: { type: String, required: false }
}, { timestamps: true });

EventSchema.statics.Status = EventStatus;

module.exports = mongoose.model('Event', EventSchema);
