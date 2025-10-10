const request = require('supertest');
const app = require('../src/app');
const userModel = require('../src/models/user.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

describe('POST /api/auth/login', () => {

    it('logs in with correct credentials and returns 200 with user and sets cookies', async () => {

        //seed the user 
        const password = "secret123!";
        const hash = await bcrypt.hash(password, 10);

        await userModel.create({
            username: 'john_doe',
            email: 'john@example.com',
            password: hash,
            fullName: { firstName: 'John', lastName: 'Doe' }
        });

        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'john@example.com',
                password
            });

        expect(res.status).toBe(200);
        expect(res.body.user).toBeDefined();
        expect(res.body.user.email).toBe('john@example.com');

        // cookie should be set

        const setCookies = res.headers['set-cookie'];

        // cookie should contain a token and be HttpOnly
        const cookiesJoined = setCookies.join(';');
        const tokenMatch = cookiesJoined.match(/token=([^;]+)/);
        expect(tokenMatch).toBeTruthy();
        const token = tokenMatch ? tokenMatch[1] : null;
        expect(typeof token).toBe('string');
        expect(token.length).toBeGreaterThan(10);
        expect(cookiesJoined).toMatch(/HttpOnly/i);

        // decode token payload without verifying signature to sanity-check claims
        const decoded = jwt.decode(token);
        expect(decoded).toBeDefined();
        // if server embeds email or id, one of these is likely present — check at least one exists
        const hasIdOrEmail = decoded && (decoded.id || decoded._id || decoded.email || decoded.userId);
        expect(hasIdOrEmail).toBeTruthy();
    });

    it('rejects wrong password with 401', async () => {

        const password = "secret123!";
        const hash = await bcrypt.hash(password, 10);

        await userModel.create({
            username: 'john_doe',
            email: 'john@example.com',
            password: hash,
            fullName: { firstName: 'John', lastName: 'Doe' }
        });

        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'john@example.com',
                password: 'wrongpassword'
            });

        expect(res.status).toBe(401);
        expect(res.body.message).toBe("Invalid credentials");
    });

    // it("validates missing fields with 400", async () => {
    //     const res = await request(app)
    //         .post('/api/auth/login')
    //         .send({});

    //     expect(res.status).toBe(400);
    //     // Check for the 'message' property instead of 'errors'
    //     expect(res.body.message).toBeDefined();
    //     expect(typeof res.body.message).toBe('string');
    //     expect(res.body.message.length).toBeGreaterThan(0);
    // });

    it('rejects login for non-existent user with 401', async () => {
        // do not seed any user
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'noone@example.com',
                password: 'doesntmatter'
            });

        expect(res.status).toBe(401);
        // be permissive: server should return a message indicating invalid credentials
        expect(res.body.message).toBeDefined();
        expect(res.body.message).toMatch(/invalid credentials/i);
    });

    it('sets an HttpOnly token cookie on successful login and the token is well-formed', async () => {
        const password = 'anotherSecret!1';
        const hash = await bcrypt.hash(password, 10);

        await userModel.create({
            username: 'jane_doe',
            email: 'jane@example.com',
            password: hash,
            fullName: { firstName: 'Jane', lastName: 'Doe' }
        });

        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'jane@example.com',
                password
            });

        expect(res.status).toBe(200);

        const setCookies = res.headers['set-cookie'];
        expect(setCookies).toBeDefined();

        const cookiesJoined = setCookies.join(';');
        expect(cookiesJoined).toMatch(/HttpOnly/i);
        expect(cookiesJoined).toMatch(/token=/);

        const tokenMatch = cookiesJoined.match(/token=([^;]+)/);
        expect(tokenMatch).toBeTruthy();
        const token = tokenMatch[1];
        // JWTs are three-part dot-separated strings
        expect(token.split('.').length).toBe(3);
    });

});