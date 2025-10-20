const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const app = require('../src/app');
const productModel = require('../src/models/product.model');


// Mock imagekit service to avoid ESM uuid import during tests
jest.mock('../src/services/imagekit.service', () => ({
    uploadImage: jest.fn(async () => ({ url: 'https://ik.mock/x', thumbnail: 'https://ik.mock/t', id: 'file_x' })),
}));


describe('GET /api/products/seller (SELLER)', () => {

    let sellerId1;
    let sellerId2;
    
    const signToken = (id, role = 'seller') => jwt.sign({ id, role }, process.env.JWT_SECRET);

    sellerId1 = new mongoose.Types.ObjectId();
    sellerId2 = new mongoose.Types.ObjectId();

    const createProduct = (overrides = {}) => {
        return productModel.create({
            title: overrides.title ?? 'My Product',
            description: overrides.description ?? 'Mine',
            price: overrides.price ?? { amount: 10, currency: 'USD' },
            seller: overrides.seller ?? sellerId1,
            images: overrides.images ?? [],
        });
    };

    it('requires authentication (401) when no token provided ', async () => {
        const res = await request(app).get('/api/products/seller');
        expect(res.status).toBe(401);
    });

    it('requires seller role (403) when role is not seller', async () => {
        const token = signToken(sellerId1.toHexString(), 'user');
        const res = await request(app)
            .get('/api/products/seller')
            .set('Authorization', `Bearer ${token}`);
        expect(res.status).toBe(403);
    });

    it('lists only products owned by the authenticated seller', async () => {
        await Promise.all([
            createProduct({ title: 'A1', seller: sellerId1 }),
            createProduct({ title: 'A2', seller: sellerId1 }),
            createProduct({ title: 'B1', seller: sellerId2 }),
        ]);
        const token = signToken(sellerId1.toHexString(), 'seller');
        const res = await request(app)
            .get('/api/products/seller')
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        console.log(res.body.data);
        
        expect(Array.isArray(res.body.data)).toBe(true);
        const titles = res.body.data.map(p => p.title).sort();
        expect(titles).toEqual(['A1', 'A2']);
    });

    it('supports pagination with skip and limit', async () => {
        await Promise.all([
            createProduct({ title: 'P1', seller: sellerId1 }),
            createProduct({ title: 'P2', seller: sellerId1 }),
            createProduct({ title: 'P3', seller: sellerId1 }),
            createProduct({ title: 'P4', seller: sellerId1 }),
        ]);
        const token = signToken(sellerId1.toHexString(), 'seller');

        let res = await request(app)
            .get('/api/products/seller')
            .set('Authorization', `Bearer ${token}`)
            .query({ limit: '2' });
        expect(res.status).toBe(200);
        expect(res.body.data.length).toBe(2);

        res = await request(app)
            .get('/api/products/seller')
            .set('Authorization', `Bearer ${token}`)
            .query({ skip: '2', limit: '2' });
        expect(res.status).toBe(200);
        expect(res.body.data.length).toBe(2);
    });

});