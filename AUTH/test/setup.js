const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

// Prevent tests from opening a real Redis connection. Jest's hoisting will
// replace the real module with this mock before any requires.
jest.mock('../src/db/redis', () => ({
    set: jest.fn().mockResolvedValue('OK'),
    quit: jest.fn().mockResolvedValue(undefined),
    on: jest.fn()
}));

const redis = require('../src/db/redis'); // <- now this is the mocked client

let mongo;

beforeAll(async () => {
    mongo = await MongoMemoryServer.create();
    const uri = mongo.getUri();
    process.env.MONGO_URI = uri;
    process.env.JWT_SECRET = "test_jwt_secret" // Set a test JWT secret
    await mongoose.connect(uri);
});

afterEach(async () => {
    const collections = await mongoose.connection.db.collections();
    for (const collection of collections) {
        await collection.deleteMany({});
    }
});

afterAll(async () => {
    await mongoose.connection.close();
    if (mongo) await mongo.stop();
    if (redis && typeof redis.quit === 'function') {
        await redis.quit(); //  close Redis connection
    }
});

