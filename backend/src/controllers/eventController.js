const Event = require('../models/Event');

exports.createEvent = async (req, res) => {
  const { title, startTime, endTime, status } = req.body;
  if (!title || !startTime || !endTime) return res.status(400).json({ message: 'Missing fields' });
  try {
    const ev = new Event({ title, startTime, endTime, status: status || Event.Status.BUSY, owner: req.user._id });
    await ev.save();
    return res.json(ev);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.getMyEvents = async (req, res) => {
  try {
    const events = await Event.find({ owner: req.user._id }).sort({ startTime: 1 });
    return res.json(events);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.updateEvent = async (req, res) => {
  const { id } = req.params;
  try {
    const ev = await Event.findOne({ _id: id, owner: req.user._id });
    if (!ev) return res.status(404).json({ message: 'Event not found' });
    const up = req.body;
    Object.assign(ev, up);
    await ev.save();
    return res.json(ev);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteEvent = async (req, res) => {
  const { id } = req.params;
  try {
    const ev = await Event.findOneAndDelete({ _id: id, owner: req.user._id });
    if (!ev) return res.status(404).json({ message: 'Event not found' });
    return res.json({ message: 'Deleted' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.getSwappableSlots = async (req, res) => {
  try {
    const EventModel = Event;
    const slots = await EventModel.find({ owner: { $ne: req.user._id }, status: EventModel.Status.SWAPPABLE }).populate('owner', 'name email');
    return res.json(slots);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};
