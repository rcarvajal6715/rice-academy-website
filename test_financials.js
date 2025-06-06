// test_expenses.js
const request = require('supertest');
const app = require('./server'); // Ensure server.js exports app

// Dynamically import chai
let expect;
before(async () => { // This 'before' is equivalent to 'beforeAll' for the suite
  const chai = await import('chai');
  expect = chai.expect;
});

describe('POST /api/admin/expenses', () => {
    let agent; // Declare agent

    before(async () => { // Hook for admin login (Mocha uses 'before' for 'beforeAll' in BDD)
        agent = request.agent(app);
        try {
            const loginRes = await agent
                .post('/api/login') // Admin login route
                .send({ username: 'testadmin', password: 'password' }); // Placeholder credentials

            if (loginRes.status !== 200 || !loginRes.body.isAdmin) {
                console.warn(`WARN: Admin login failed in beforeAll (status: ${loginRes.status}, body: ${JSON.stringify(loginRes.body)}). Tests requiring admin rights might fail or respond with 401.`);
            } else {
                console.log("INFO: Admin login successful in beforeAll.");
            }
        } catch (err) {
            console.error("ERROR: Admin login request failed in beforeAll:", err.message);
            // This might happen if the server isn't fully ready or DB issues.
        }
    });

    it('should add an expense successfully (as admin)', (done) => {
        agent // Use the agent
            .post('/api/admin/expenses')
            .send({ description: 'Test Expense Normal', amount: 120.50, period: '2024-02' })
            .end((err, res) => {
                if (res.status === 401) {
                    console.warn("WARN: Test 'should add an expense successfully (as admin)' received 401. This likely means the admin login in beforeAll failed.");
                }
                expect(res.status).to.equal(201, `Expected 201 but got ${res.status}. Admin login in beforeAll might have failed if 401.`);
                if (res.status === 201) {
                    expect(res.body.message).to.equal('Expense added successfully.');
                    expect(res.body.expense).to.have.property('id');
                    expect(res.body.expense.description).to.equal('Test Expense Normal');
                    expect(String(res.body.expense.amount)).to.equal('120.50');
                    expect(res.body.expense.period).to.equal('2024-02-01');
                }
                done(err);
            });
    });

    it('should return 400 for invalid period format (YYYY-M)', (done) => {
        agent // Use the agent
            .post('/api/admin/expenses')
            .send({ description: 'Test Period Format 1', amount: 100, period: '2023-8' })
            .expect(400)
            .end((err, res) => {
                if (err) return done(err);
                expect(res.body.message).to.equal('Invalid period format. Use YYYY-MM.');
                done();
            });
    });

    it('should return 400 for invalid period format (YY-MM)', (done) => {
        agent // Use the agent
            .post('/api/admin/expenses')
            .send({ description: 'Test Period Format 2', amount: 100, period: '23-08' })
            .expect(400)
            .end((err, res) => {
                if (err) return done(err);
                expect(res.body.message).to.equal('Invalid period format. Use YYYY-MM.');
                done();
            });
    });
    
    it('should return 400 for invalid period format (YYYY/MM)', (done) => {
        agent // Use the agent
            .post('/api/admin/expenses')
            .send({ description: 'Test Period Format 3', amount: 100, period: '2023/08' })
            .expect(400)
            .end((err, res) => {
                if (err) return done(err);
                expect(res.body.message).to.equal('Invalid period format. Use YYYY-MM.');
                done();
            });
    });

    it('should return 400 for period with invalid month (e.g., 2023-13)', (done) => {
        agent // Use the agent
            .post('/api/admin/expenses')
            .send({ description: 'Test Invalid Month 1', amount: 100, period: '2023-13' })
            .expect(400)
            .end((err, res) => {
                if (err) return done(err);
                expect(res.body.message).to.equal('Invalid period (cannot form a real date).');
                done();
            });
    });

    it('should return 400 for period with invalid month (e.g., 2023-00)', (done) => {
        agent // Use the agent
            .post('/api/admin/expenses')
            .send({ description: 'Test Invalid Month 2', amount: 100, period: '2023-00' })
            .expect(400)
            .end((err, res) => {
                if (err) return done(err);
                expect(res.body.message).to.equal('Invalid period (cannot form a real date).');
                done();
            });
    });

    it('should return 400 if description is missing', (done) => {
        agent // Use the agent
            .post('/api/admin/expenses')
            .send({ amount: 100, period: '2023-08' }) // No description
            .expect(400)
            .end((err, res) => {
                if (err) return done(err);
                expect(res.body.message).to.equal('Bad Request: description (non-empty), amount, and period (YYYY-MM) are required.');
                done();
            });
    });
    
    it('should return 400 if description is an empty string', (done) => {
        agent // Use the agent
            .post('/api/admin/expenses')
            .send({ description: '', amount: 100, period: '2023-08' })
            .expect(400)
            .end((err, res) => {
                if (err) return done(err);
                expect(res.body.message).to.equal('Bad Request: description (non-empty), amount, and period (YYYY-MM) are required.');
                done();
            });
    });

    it('should return 400 if description is only whitespace', (done) => {
        agent // Use the agent
            .post('/api/admin/expenses')
            .send({ description: '   ', amount: 100, period: '2023-08' })
            .expect(400)
            .end((err, res) => {
                if (err) return done(err);
                expect(res.body.message).to.equal('Bad Request: description (non-empty), amount, and period (YYYY-MM) are required.');
                done();
            });
    });

    it('should return 400 if amount is missing', (done) => {
        agent // Use the agent
            .post('/api/admin/expenses')
            .send({ description: 'Test Missing Amount', period: '2023-08' }) // No amount
            .expect(400)
            .end((err, res) => {
                if (err) return done(err);
                expect(res.body.message).to.equal('Bad Request: description (non-empty), amount, and period (YYYY-MM) are required.');
                done();
            });
    });

    it('should return 400 if amount is null', (done) => {
        agent // Use the agent
            .post('/api/admin/expenses')
            .send({ description: 'Test Null Amount', amount: null, period: '2023-08' })
            .expect(400)
            .end((err, res) => {
                if (err) return done(err);
                expect(res.body.message).to.equal('Bad Request: description (non-empty), amount, and period (YYYY-MM) are required.');
                done();
            });
    });

    it('should return 400 if amount is not a number', (done) => {
        agent // Use the agent
            .post('/api/admin/expenses')
            .send({ description: 'Test Invalid Amount Type', amount: 'not-a-number', period: '2023-08' })
            .expect(400)
            .end((err, res) => {
                if (err) return done(err);
                expect(res.body.message).to.equal('Bad Request: amount must be a valid positive number.');
                done();
            });
    });

    it('should return 400 if amount is zero', (done) => {
        agent // Use the agent
            .post('/api/admin/expenses')
            .send({ description: 'Test Zero Amount', amount: 0, period: '2023-08' })
            .expect(400)
            .end((err, res) => {
                if (err) return done(err);
                expect(res.body.message).to.equal('Bad Request: amount must be a valid positive number.');
                done();
            });
    });

    it('should return 400 if amount is negative', (done) => {
        agent // Use the agent
            .post('/api/admin/expenses')
            .send({ description: 'Test Negative Amount', amount: -75, period: '2023-08' })
            .expect(400)
            .end((err, res) => {
                if (err) return done(err);
                expect(res.body.message).to.equal('Bad Request: amount must be a valid positive number.');
                done();
            });
    });

    it('should return 400 if amount exceeds maximum value (99999999.99)', (done) => {
        agent // Use the agent
            .post('/api/admin/expenses')
            .send({ description: 'Test Max Amount Exceeded', amount: 100000000, period: '2023-09' }) // 100,000,000
            .expect(400)
            .end((err, res) => {
                if (err) return done(err);
                expect(res.body.message).to.equal('Bad Request: amount exceeds the maximum allowed value (99999999.99).');
                done();
            });
    });

    it('should return 400 if period is missing', (done) => {
        agent // Use the agent
            .post('/api/admin/expenses')
            .send({ description: 'Test Missing Period', amount: 100 }) // No period
            .expect(400)
            .end((err, res) => {
                if (err) return done(err);
                expect(res.body.message).to.equal('Bad Request: description (non-empty), amount, and period (YYYY-MM) are required.');
                done();
            });
    });

    it('should return 401 if user is not admin (simulated by no active admin session)', (done) => {
        // This test uses request(app) directly, NOT the agent, to simulate no session
        request(app) 
            .post('/api/admin/expenses')
            .send({ description: 'Test No Auth Access', amount: 50, period: '2024-01' })
            .end((err, res) => {
                if (res.status === 401) {
                    expect(res.body.message).to.equal('Unauthorized: Admin access required.');
                } else {
                    console.warn(`INFO: Test 'should return 401' received ${res.status} instead of 401. Check auth enforcement.`);
                    return done(new Error(`Expected 401 for non-admin access but got ${res.status}. Response: ${JSON.stringify(res.body)}`));
                }
                done(err);
            });
    });
});
