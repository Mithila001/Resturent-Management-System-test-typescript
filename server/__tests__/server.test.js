const request = require('supertest');
const app = require('../app');

// Mock the DB connection to avoid actual DB calls during simple app tests
jest.mock('../config/db', () => jest.fn());

describe('Server API Smoke Test', () => {
    it('GET / should return 200 and welcome message', async () => {
        const res = await request(app).get('/');
        expect(res.statusCode).toEqual(200);
        expect(res.text).toContain('Restaurant Ordering System API is running');
    });
});
