const mongoose = require('mongoose');
const request = require('supertest');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = require('../src/testServer'); // small express app for testing
const User = require('../src/models/User');
const Event = require('../src/models/Event');
const SwapRequest = require('../src/models/SwapRequest');

describe('Swap flow', () => {
  let server;
  let tokenA, tokenB, userA, userB;
  let eventA, eventB;

  beforeAll(async () => {
    // connect to in-memory mongo if available, else skip
    const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/slot-swapper-test';
    await mongoose.connect(uri, { dbName: 'slotSwapperTest', useNewUrlParser: true, useUnifiedTopology: true });
  });

  afterAll(async () => {
    await mongoose.connection.db.dropDatabase();
    await mongoose.disconnect();
  });

  test('create users and events and perform swap accept', async () => {
    userA = new User({ name: 'A', email: 'a@example.com', passwordHash: await bcrypt.hash('pass', 8) });
    userB = new User({ name: 'B', email: 'b@example.com', passwordHash: await bcrypt.hash('pass', 8) });
    await userA.save(); await userB.save();
    tokenA = jwt.sign({ id: userA._id }, process.env.JWT_SECRET || 'secret');
    tokenB = jwt.sign({ id: userB._id }, process.env.JWT_SECRET || 'secret');

    eventA = new Event({ title: 'A event', startTime: new Date(), endTime: new Date(Date.now()+3600000), status: Event.Status.SWAPPABLE, owner: userA._id });
    eventB = new Event({ title: 'B event', startTime: new Date(), endTime: new Date(Date.now()+3600000), status: Event.Status.SWAPPABLE, owner: userB._id });
    await eventA.save(); await eventB.save();

    // create swap request (A requests B's slot)
    const res = await request(app).post('/api/swap-request').set('Authorization', `Bearer ${tokenA}`).send({ myEventId: eventA._id.toString(), theirEventId: eventB._id.toString() });
    expect(res.status).toBe(200);
    const swap = await SwapRequest.findOne({ requester: userA._id });
    expect(swap).toBeTruthy();

    // responder accepts
    const res2 = await request(app).post(`/api/swap-response/${swap._id}`).set('Authorization', `Bearer ${tokenB}`).send({ accept: true });
    expect(res2.status).toBe(200);
    const updatedA = await Event.findById(eventA._id);
    const updatedB = await Event.findById(eventB._id);
    // owners swapped
    expect(String(updatedA.owner)).toBe(String(userB._id));
    expect(String(updatedB.owner)).toBe(String(userA._id));
  }, 20000);
});
