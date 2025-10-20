const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const productModel = require('../src/models/product.model')



let mongo;

beforeAll(async () => {
    mongo = await MongoMemoryServer.create();
    const uri = mongo.getUri();
    process.env.MONGO_URI = uri;
    process.env.JWT_SECRET='your_secret'
    await mongoose.connect(uri);
    // Ensure text indexes for $text search are available
    await productModel.syncIndexes();
});

afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongo.stop();
});

afterEach(async () => {
    const collections = await mongoose.connection.db.collections();
    for (const c of collections) await c.deleteMany({});
});