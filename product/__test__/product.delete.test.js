const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const app = require('../src/app');
const productModel = require('../src/models/product.model');

// Mock imagekit service to avoid ESM uuid import during tests
jest.mock('../src/services/imagekit.service', () => ({
    uploadImage: jest.fn(async () => ({ url: 'https://ik.mock/x', thumbnail: 'https://ik.mock/t', id: 'file_x' })),
}));

describe('DELETE /api/products/:id (SELLER)', () => {

    let sellerId1;
    let sellerId2;

    const signToken = (id, role = 'seller') => jwt.sign({ id, role }, process.env.JWT_SECRET);

    beforeAll(async () => {
        sellerId1 = new mongoose.Types.ObjectId();
        sellerId2 = new mongoose.Types.ObjectId();
    });

    const createProduct = (overrides = {}) => {
        return productModel.create({
            title: overrides.title ?? 'To Delete',
            description: overrides.description ?? 'Delete me',
            price: overrides.price ?? { amount: 10, currency: 'USD' },
            seller: overrides.seller ?? sellerId1,
            images: overrides.images ?? [],
        });
    };

    it('requires authentication (401) when no token provided', async () => {
        const prod = await createProduct();
        const res = await request(app)
            .delete(`/api/products/${prod._id}`);
        expect(res.status).toBe(401);
    });

    it('requires seller role (403) when role is not seller', async () => {
        const prod = await createProduct();
        const token = signToken(sellerId1.toHexString(), 'user');
        const res = await request(app)
            .delete(`/api/products/${prod._id}`)
            .set('Authorization', `Bearer ${token}`);
        expect(res.status).toBe(403);
    });

    it('returns 400 for invalid product id', async () => {
        const token = signToken(sellerId1.toHexString(), 'seller');
        const res = await request(app)
            .delete('/api/products/not-a-valid-id')
            .set('Authorization', `Bearer ${token}`);
        expect(res.status).toBe(400);
    });

    it('returns 404 when product not found', async () => {
        const token = signToken(sellerId1.toHexString(), 'seller');
        const missingId = new mongoose.Types.ObjectId().toHexString();
        const res = await request(app)
            .delete(`/api/products/${missingId}`)
            .set('Authorization', `Bearer ${token}`);
        expect(res.status).toBe(404);
    });

    it("forbids deleting another seller's product (403)", async () => {
        const otherProd = await createProduct({ seller: sellerId2 });
        const token = signToken(sellerId1.toHexString(), 'seller');
        const res = await request(app)
            .delete(`/api/products/${otherProd._id}`)
            .set('Authorization', `Bearer ${token}`);
        expect(res.status).toBe(403);
    });

    it('deletes product and returns 200 with confirmation', async () => {
        const prod = await createProduct();
        const token = signToken(sellerId1.toHexString(), 'seller');

        const res = await request(app)
            .delete(`/api/products/${prod._id}`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        // Expect either a message or data null; flexible for your implementation
        expect(res.body.message || res.body.data).toBeDefined();

        const found = await productModel.findById(prod._id);
        expect(found).toBeNull();
    });

});