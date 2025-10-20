const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const productModel = require('../src/models/product.model');

// Mock imagekit service to avoid ESM uuid import during tests
jest.mock('../src/services/imagekit.service', () => ({
    uploadImage: jest.fn(async () => ({ url: 'https://ik.mock/x', thumbnail: 'https://ik.mock/t', id: 'file_x' })),
}));



describe('GET /api/products/:id', () => {

    const createProduct = (overrides = {}) => {
        return productModel.create({
            title: overrides.title ?? 'ById Product',
            description: overrides.description ?? 'Desc',
            price: overrides.price ?? { amount: 42, currency: 'USD' },
            seller: overrides.seller ?? new mongoose.Types.ObjectId(),
            images: overrides.images ?? [],
        });
    };

    it('returns 400 for invalid object id', async () => {
        const res = await request(app).get('/api/products/not-a-valid-id');
        expect(res.status).toBe(400);
        expect(res.body.message).toMatch(/invalid product id/i);
    });

    it('returns 404 when product not found', async () => {
        const id = new mongoose.Types.ObjectId().toHexString();
        const res = await request(app).get(`/api/products/${id}`);
        expect(res.status).toBe(404);
        expect(res.body.message).toMatch(/not found/i);
    });

    it('returns product when found', async () => {
        const product = await createProduct({ title: 'Found Product' });
        const res = await request(app).get(`/api/products/${product._id}`);
        expect(res.status).toBe(200);
        expect(res.body?.data?._id).toBe(product._id.toString());
        expect(res.body?.data?.title).toBe('Found Product');
    });
    
});