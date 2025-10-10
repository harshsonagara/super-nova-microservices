const request = require('supertest');
const app = require('../src/app');
const userModel = require('../src/models/user.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


describe('GET /api/auth/me', () => {

    it('returns 401 when no token cookie is provided', async () => {
        const res = await request(app)
            .get('/api/auth/me');

        expect(res.status).toBe(401);
    });

    it('returns 401 for an invalid token in cookie', async () => {
        const faketoken = jwt.sign({ id: '000000000000000000000' }, 'wrong secret')
        const res = await request(app)
            .get('/api/auth/me')
            .set('Cookie', [`token=${faketoken}`]);

        expect(res.status).toBe(401);

    });

    it('returns 200 and the authenticated user when a valid token cookie is provided', async () => {
        const password = 'passForMe1!';
        const hash = await bcrypt.hash(password, 10);

        const user = await userModel.create({
            username: 'me_user',
            email: 'me@example.com',
            password: hash,
            fullName: { firstName: 'Me', lastName: 'User' }
        });

        const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });

        const res = await request(app)
            .get('/api/auth/me')
            .set('Cookie', `token=${token}`);

        expect(res.status).toBe(200);
        expect(res.body.user).toBeDefined();
        expect(res.body.user.email).toBe('me@example.com');
        // password should not be returned
        expect(res.body.user.password).toBeUndefined();
    });


    it('returns 401 when token references a non-existent user', async () => {
      
        const token = jwt.sign({ id: 'hello', email: 'ghost@example.com' }, process.env.JWT_SECRET, { expiresIn: '1h' });

        const res = await request(app)
            .get('/api/auth/me')
            .set('Cookie', `token=${token}`)
            .send();

        expect(res.status).toBe(401);
        expect(res.body.message || res.body.error).toBeDefined();
    });

});
