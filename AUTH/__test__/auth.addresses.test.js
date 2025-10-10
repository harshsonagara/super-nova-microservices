const request = require('supertest');
const app = require('../src/app');
const userModel = require('../src/models/user.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

describe('GET /api/auth/users/me/addresses', () => {

    async function createUserAndToken() {
        const password = 'Secret123!';
        const hash = await bcrypt.hash(password, 10);

        const user = await userModel.create({
            username: 'john_doe',
            email: 'john@gmail.com',
            password: hash,
            fullName: { firstName: 'john', lastName: 'doe' }
        });

        const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
        return { user, token };
    }

    it(' requires auth (401 without cookie)', async () => {
        const res = await request(app).get('/api/auth/users/me/addresses');
        expect(res.status).toBe(401);
    });

    it('GET returns list of addresses and indicates default', async () => {
        const { user, token } = await createUserAndToken();

        // seed two addresses and mark one default
        user.addresses.push(
            { street: "123 Main St", city: "A", state: "GUJ", pincode: "360510", country: "INDIA", isDefault: true },
            { street: "13 hasrjhsv", city: "B", state: "GUJ", pincode: "360510", country: "INDIA", isDefault: true }
        );
        await user.save();

        const res = await request(app)
            .get('/api/auth/users/me/addresses')
            .set('Cookie', `token=${token}`);

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body.addresses)).toBe(true);
        expect(res.body.addresses.length).toBeGreaterThan(0);
        expect(res.body.addresses.length).toBe(2);
        expect('defaultAddressId' in res.body || res.body.addresses.some(a => a.isDefault === true)).toBe(true);
    });
});

describe('POST /api/auth/users/me/addresses', () => {

    async function createUserAndToken() {
        const password = 'Secret123!';
        const hash = await bcrypt.hash(password, 10);

        const user = await userModel.create({
            username: 'john_doe',
            email: 'john@gmail.com',
            password: hash,
            fullName: { firstName: 'john', lastName: 'doe' }
        });

        const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
        return { user, token };
    }
    it('validates pincode and phone and returns 400 on invalid input', async () => {
        const { token } = await createUserAndToken();

        const res = await request(app)
            .post('/api/auth/users/me/addresses')
            .set('Cookie', `token=${token}`)
            .send({
                street: "a23",
                city: "hello",
                state: "world",
                zip: 6598,
                country: "UK",
                isDefault: true
            });

        expect(res.status).toBe(400);
        expect(res.body.error || res.body.message).toBeDefined();
    });

    it(' adds an address and can set it as default', async () => {
        const { user, token } = await createUserAndToken();

        // existing default
        user.addresses.push({
            street: "leg",
            city: 'zara',
            state: "Guj",
            pincode: "123456",
            country: "india",
            isDefault: true
        });
        await user.save();

        const res = await request(app)
            .post('/api/auth/users/me/addresses')
            .set('Cookie', `token=${token}`)
            .send({
                street: 'New',
                city: 'C',
                state: 'S',
                pincode: '213456',
                country: 'X',
                isDefault: true
            });

        expect(res.status).toBe(201);
        expect(res.body.address).toBeDefined();
        expect(res.body.address.street).toBe('New');
        expect(res.body.address.isDefault).toBe(true);
    });
});

describe('DELETE /api/auth/users/me/addresses/:addressId', () => {

    async function createUserAndToken() {
        const password = 'Secret123!';
        const hash = await bcrypt.hash(password, 10);

        const user = await userModel.create({
            username: 'john_doe',
            email: 'john@gmail.com',
            password: hash,
            fullName: { firstName: 'john', lastName: 'doe' }
        });

        const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
        return { user, token };
    }

    it('removes an address; return 200 and updates list', async () => {
        const { user, token } = await createUserAndToken();

        user.addresses.push({ street: 'ToDelete', city: 'C', state: 'S', pincode: '312456', country: 'X', isDefault: true });
        await user.save();

        const addrId = user.addresses[0]._id;

        const res = await request(app)
            .delete(`/api/auth/users/me/addresses/${addrId}`)
            .set('Cookie', `token=${token}`);

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body.addresses)).toBe(true);
        // ensure removed
        const found = res.body.addresses.find(a => String(a._id) === String(addrId));
        expect(found).toBeUndefined();
    });

    it('returns 404 when address not found', async () => {
        const { token } = await createUserAndToken();

        const fakeId = '0000000';

        const res = await request(app)
            .delete(`/api/auth/users/me/addresses/${fakeId}`)
            .set('Cookie', `token=${token}`);

        expect(res.status).toBe(404);
    });

});
