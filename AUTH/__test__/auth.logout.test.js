const app = require('../src/app');
const request = require('supertest');
const bcrypt = require('bcryptjs');
const userModel = require('../src/models/user.model');


describe('GET /api/auth/logout', () => {

    beforeAll(() => {
        process.env.NODE_ENV = 'production'; // Force secure mode for tests
    });


    it('clears the auth cookie and returns 200 when logged in', async () => {

        // seed and login to get cookie
        const password = 'Secret123';
        const hash = await bcrypt.hash(password, 10);

        await userModel.create({
            username: "logout_user",
            email: 'logout@gmail.com',
            password: hash,
            fullName: {
                firstName: 'Log',
                lastName: 'Out'
            }
        });

        const loginres = await request(app)
            .post('/api/auth/login')
            .send({ email: "logout@gmail.com", password });

        expect(loginres.status).toBe(200);

        const cookies = loginres.headers['set-cookie'];
        expect(cookies).toBeDefined();


        const res = await request(app)
            .get('/api/auth/logout')
            .set('Cookie', cookies);

        expect(res.status).toBe(200);

        const setCookie = res.headers['set-cookie'] || [];

        const cookieStr = setCookie.join(';');

        expect(cookieStr).toMatch(/token=;/);
        expect(cookieStr.toLowerCase()).toMatch(/expires=/);

    });


    it('is idempotent: return 200 even without auth cookies', async () => {
        const res = await request(app).get('/api/auth/logout');
        expect(res.status).toBe(200);
    })
});