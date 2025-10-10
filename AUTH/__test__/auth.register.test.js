const request = require('supertest');
const app = require('../src/app');


describe('POST /api/auth/register', () => {

    it('creates a user and return 201 with user (no password)', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                username: 'john_doe',
                email: 'john@example.com',
                password: 'secret123!',
                fullName: { firstName: 'John', lastName: 'Doe' }
            });
        expect(res.status).toBe(201);
        expect(res.body.user).toBeDefined();
        expect(res.body.user.username).toBe('john_doe');
        expect(res.body.user.email).toBe('john@example.com');
        expect(res.body.user.password).toBeUndefined();

    });


    it('rejects duplicate username/email with 409', async () => {

        const payload = {
            username: 'john_doe',
            email: 'john@example.com',
            password: 'secret123!',
            fullName: { firstName: 'John', lastName: 'Doe' }
        }

        await request(app).post('/api/auth/register').send(payload).expect(201)

        const res = await request(app).post('/api/auth/register').send(payload);
        expect(res.status).toBe(409);
        expect(res.body.error).toBeDefined();
    });

    it('validation for missing fields with 400', async () => {
        const res = await request(app).post('/api/auth/register').send({});
        expect(res.status).toBe(400);
        expect(res.body.error).toBeDefined();
    });

})