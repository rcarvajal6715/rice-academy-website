// test_expenses.js
const request = require('supertest');
const app = require('./server'); // Ensure server.js exports app

// Dynamically import chai
let expect;
let agent; // Declare agent at a higher scope
before(async () => { // This 'before' is equivalent to 'beforeAll' for the suite
  const chai = await import('chai');
  expect = chai.expect;
});

describe('POST /api/admin/expenses', () => {
    // agent is now declared globally

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
            .send({ description: 'Test Expense Normal', amount: 120.50, period: '2024-02', expense_date: '2024-02-15' })
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
                    expect(res.body.expense.expense_date).to.equal('2024-02-15'); // New assertion
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

    it('should return 400 if expense_date is missing', (done) => {
        agent
            .post('/api/admin/expenses')
            .send({ description: 'Test Missing Expense Date', amount: 100, period: '2023-08' }) // No expense_date
            .expect(400)
            .end((err, res) => {
                if (err) return done(err);
                // This message comes from the updated combined check for required fields
                expect(res.body.message).to.equal('Bad Request: expense_date, description (non-empty), amount, and period (YYYY-MM) are required.');
                done();
            });
    });

    it('should return 400 for invalid expense_date format (e.g., YYYY/MM/DD)', (done) => {
        agent
            .post('/api/admin/expenses')
            .send({ description: 'Test Invalid Format ED', amount: 100, period: '2023-08', expense_date: '2023/08/15' })
            .expect(400)
            .end((err, res) => {
                if (err) return done(err);
                expect(res.body.message).to.equal('Invalid expense_date format. Use YYYY-MM-DD.');
                done();
            });
    });

    it('should return 400 for invalid expense_date value (e.g., 2023-02-30)', (done) => {
        agent
            .post('/api/admin/expenses')
            .send({ description: 'Test Invalid Value ED', amount: 100, period: '2023-02', expense_date: '2023-02-30' })
            .expect(400)
            .end((err, res) => {
                if (err) return done(err);
                expect(res.body.message).to.equal('Invalid expense_date value (e.g., day out of range or not a real date).');
                done();
            });
    });

    it('should return 400 if period is missing', (done) => {
        agent // Use the agent
            .post('/api/admin/expenses')
            .send({ description: 'Test Missing Period', amount: 100, expense_date: '2023-08-15' }) // No period, but has expense_date
            .expect(400)
            .end((err, res) => {
                if (err) return done(err);
                expect(res.body.message).to.equal('Bad Request: expense_date, description (non-empty), amount, and period (YYYY-MM) are required.');
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

describe('GET /api/admin/expenses', () => {
    // Note: 'agent' is assumed to be defined and logged in from the 'before' hook
    // in the 'POST /api/admin/expenses' describe block.
    // If running this suite independently, a similar login mechanism would be needed here.

    it('should fetch all expenses successfully (as admin)', (done) => {
        agent
            .get('/api/admin/expenses')
            .end((err, res) => {
                if (res.status === 401) {
                    console.warn("WARN: Test 'should fetch all expenses successfully (as admin)' received 401. Admin login in a preceding 'before' hook might have failed.");
                }
                expect(res.status).to.equal(200, `Expected 200 but got ${res.status}. Admin login might have failed if 401.`);
                if (res.status === 200) {
                    expect(res.body).to.be.an('array');
                    // Further checks can be added if we know what data to expect
                    // For now, just check if it's an array and doesn't error out.
                }
                done(err);
            });
    });

    it('should fetch expenses for a specific valid period (as admin)', (done) => {
        // This test assumes the 'period' column exists and the data format is correct.
        // It might be good to add some test data first for more robust testing.
        agent
            .get('/api/admin/expenses?period=2024-03') // Example period
            .end((err, res) => {
                if (res.status === 401) {
                    console.warn("WARN: Test 'should fetch expenses for a specific valid period (as admin)' received 401.");
                }
                expect(res.status).to.equal(200, `Expected 200 but got ${res.status}.`);
                if (res.status === 200) {
                    expect(res.body).to.be.an('array');
                    // If expenses for this period exist, they should be here.
                    // If not, an empty array is expected.
                    // Example: Check if all returned expenses match the period
                    res.body.forEach(expense => {
                        expect(expense.period.startsWith('2024-03')).to.be.true;
                    });
                }
                done(err);
            });
    });

    it('should return an empty array if no expenses match the period (as admin)', (done) => {
        agent
            .get('/api/admin/expenses?period=1900-01') // A period unlikely to have expenses
            .end((err, res) => {
                 if (res.status === 401) {
                    console.warn("WARN: Test 'should return an empty array if no expenses match the period (as admin)' received 401.");
                }
                expect(res.status).to.equal(200, `Expected 200 but got ${res.status}.`);
                 if (res.status === 200) {
                    expect(res.body).to.be.an('array').that.is.empty;
                }
                done(err);
            });
    });

    it('should return 400 for invalid period format (e.g., YYYY-M)', (done) => {
        agent
            .get('/api/admin/expenses?period=2023-7')
            .expect(400)
            .end((err, res) => {
                if (err) return done(err);
                expect(res.body.message).to.equal('Invalid period format. Use YYYY-MM.');
                done();
            });
    });
    
    it('should return 400 for invalid period format (e.g., YYYY/MM)', (done) => {
        agent
            .get('/api/admin/expenses?period=2023/07')
            .expect(400)
            .end((err, res) => {
                if (err) return done(err);
                expect(res.body.message).to.equal('Invalid period format. Use YYYY-MM.');
                done();
            });
    });

    it('should return 401 if user is not admin (simulated by no active admin session)', (done) => {
        // Uses request(app) directly, NOT the agent, to simulate no session
        request(app) // Assuming 'request' and 'app' are available as in other tests
            .get('/api/admin/expenses')
            .end((err, res) => {
                 if (res.status === 401) {
                    expect(res.body.message).to.equal('Unauthorized: Admin access required.');
                } else {
                    // This path might be taken if the global 'before' hook for login somehow affects even non-agent requests,
                    // or if there's default permissive behavior. The primary check is for 401.
                    console.warn(`INFO: Test 'should return 401 for GET expenses' received ${res.status} instead of 401. Check auth enforcement.`);
                    return done(new Error(`Expected 401 for non-admin access but got ${res.status}. Response: ${JSON.stringify(res.body)}`));
                }
                done(err);
            });
    });
});
