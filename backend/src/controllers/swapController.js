const mongoose = require('mongoose');
const SwapRequest = require('../models/SwapRequest');
const Event = require('../models/Event');
const { notifyUser } = require('../socket');

exports.createSwapRequest = async (req, res) => {
  const { myEventId, theirEventId } = req.body;
  if (!myEventId || !theirEventId) return res.status(400).json({ message: 'Missing fields' });
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const myEvent = await Event.findById(myEventId).session(session);
    const theirEvent = await Event.findById(theirEventId).session(session);
    if (!myEvent || !theirEvent) {
      await session.abortTransaction();
      return res.status(404).json({ message: 'One or both events not found' });
    }
    if (String(myEvent.owner) !== String(req.user._id)) {
      await session.abortTransaction();
      return res.status(403).json({ message: 'You do not own the myEventId event' });
    }
    if (myEvent.status !== Event.Status.SWAPPABLE || theirEvent.status !== Event.Status.SWAPPABLE) {
      await session.abortTransaction();
      return res.status(400).json({ message: 'Both events must be SWAPPABLE' });
    }
    // create swap request
    const swap = new SwapRequest({ requester: req.user._id, responder: theirEvent.owner, myEvent: myEvent._id, theirEvent: theirEvent._id });
    await swap.save({ session });
    // set both events to SWAP_PENDING
    myEvent.status = Event.Status.SWAP_PENDING;
    theirEvent.status = Event.Status.SWAP_PENDING;
    await myEvent.save({ session });
    await theirEvent.save({ session });
  await session.commitTransaction();
  // notify the responder in real-time (if connected)
  try { notifyUser(theirEvent.owner, 'swap-request', swap); } catch (e) { /* ignore notify errors */ }
  return res.json(swap);
  } catch (err) {
    console.error(err);
    await session.abortTransaction();
    return res.status(500).json({ message: 'Server error' });
  } finally {
    session.endSession();
  }
};

exports.getIncomingAndOutgoing = async (req, res) => {
  try {
    const incoming = await SwapRequest.find({ responder: req.user._id }).populate('requester responder myEvent theirEvent');
    const outgoing = await SwapRequest.find({ requester: req.user._id }).populate('requester responder myEvent theirEvent');
    return res.json({ incoming, outgoing });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.respondToSwap = async (req, res) => {
  const { requestId } = req.params;
  const { accept } = req.body;
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const swap = await SwapRequest.findById(requestId).session(session);
    if (!swap) {
      await session.abortTransaction();
      return res.status(404).json({ message: 'Swap request not found' });
    }
    if (String(swap.responder) !== String(req.user._id)) {
      await session.abortTransaction();
      return res.status(403).json({ message: 'Not authorized to respond to this request' });
    }
    if (swap.status !== SwapRequest.Status?.PENDING && swap.status !== 'PENDING') {
      await session.abortTransaction();
      return res.status(400).json({ message: 'Swap request already handled' });
    }
    const myEvent = await Event.findById(swap.myEvent).session(session);
    const theirEvent = await Event.findById(swap.theirEvent).session(session);
    if (!myEvent || !theirEvent) {
      await session.abortTransaction();
      return res.status(404).json({ message: 'One or both events not found' });
    }
    if (!accept) {
      swap.status = SwapRequest.Status.REJECTED;
      myEvent.status = Event.Status.SWAPPABLE;
      theirEvent.status = Event.Status.SWAPPABLE;
      await swap.save({ session });
      await myEvent.save({ session });
      await theirEvent.save({ session });
      await session.commitTransaction();
      return res.json({ message: 'Rejected' });
    }
    // Accept: swap owners and set status back to BUSY
    const requesterId = swap.requester;
    const responderId = swap.responder;
    myEvent.owner = responderId; // myEvent (offered by requester) goes to responder
    theirEvent.owner = requesterId; // theirEvent (offered by responder) goes to requester
    myEvent.status = Event.Status.BUSY;
    theirEvent.status = Event.Status.BUSY;
    swap.status = SwapRequest.Status.ACCEPTED;
    await myEvent.save({ session });
    await theirEvent.save({ session });
    await swap.save({ session });
  await session.commitTransaction();
  // notify the requester that their request was accepted
  try { notifyUser(requesterId, 'swap-accepted', swap); } catch (e) { /* ignore */ }
  return res.json({ message: 'Accepted' });
  } catch (err) {
    console.error(err);
    await session.abortTransaction();
    return res.status(500).json({ message: 'Server error' });
  } finally {
    session.endSession();
  }
};
