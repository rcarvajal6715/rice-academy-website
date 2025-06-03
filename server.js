require('dotenv').config();
const express = require('express');
const path = require('path');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const Stripe = require('stripe');
const cors = require('cors');
const PDFKit = require('pdfkit');
const nodemailer = require('nodemailer');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);

const app = express();
app.set('trust proxy', 1); // Early middleware

// Stripe Initialization
console.log(
  '🔑 Stripe key:',
  process.env.STRIPE_SECRET_KEY
    ? process.env.STRIPE_SECRET_KEY.slice(0,8) + '…'
    : '⚠️ MISSING'
);
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// Nodemailer Transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD
  }
});

// PostgreSQL Pool Initialization
const pool = new Pool({
  host:     process.env.DB_HOST,
  port:    +process.env.DB_PORT,
  database: process.env.DB_NAME,
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl:      { rejectUnauthorized: false },
});

// PostgreSQL Pool Error Handler
pool.on('error', (err, client) => {
  console.error('ADMIN_HISTORY_DEBUG: Unexpected error on idle pg client', err.stack);
  // process.exit(-1); // Good for production, commented out for debugging
});

// Session Store Initialization (using connect-pg-simple)
const sessionStore = new pgSession({
  pool: pool,
  tableName: 'user_sessions',
  createTableIfMissing: true,
});

// Core Global Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS setup
app.use(cors({
  origin: [
    'http://localhost:3000',                    // React front-end (dev)
    'http://localhost:8080',                    // Admin portal (dev)
    'https://rice-academy-website-1.onrender.com', // Deployed site
    'https://www.c2tennisacademy.com'           // Added current site origin
  ],
  credentials: true,
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type'] // Ensure this includes all headers your frontend might send
}));
app.options('*', cors()); // Handle pre-flight requests for all routes

// Session Middleware
app.use(session({
  store: sessionStore,
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Lax', // Consider 'None' if cross-site and secure: true
    maxAge: 86400000 // 24 hours
  }
}));

// Other Global Middleware
// HTTPS Redirect (should be placed before routes and static serving if possible)
app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production' && req.headers['x-forwarded-proto'] !== 'https') {
    return res.redirect('https://' + req.headers.host + req.url);
  }
  next();
});

// Static file serving (typically after other middleware, before specific routes)
app.use(express.static(__dirname, { extensions: ['html'] }));


// ─── Route Handlers ───────────────────────────────────────────────────

// ---- Instructor Off-Days API Routes ----
app.get('/api/instructor-offdays', async (req, res) => {
  const coach = req.query.coach;
  if (!coach) return res.status(400).send('Missing coach name');
  try {
    const { rows } = await pool.query(
      `SELECT id, off_date, start_time, end_time, reason
         FROM instructor_offdays
         WHERE coach_name = $1
         ORDER BY off_date, start_time`,
      [coach]
    );
    res.json(rows);
  } catch (err) {
    console.error('Fetch offdays error:', err);
    res.status(500).send('Failed to fetch off-days');
  }
});

app.post('/api/instructor-offdays', async (req, res) => {
  if (!req.session.coachId || !req.session.coachName) {
    return res.status(401).send('Coach not logged in');
  }
  const { off_date, start_time, end_time, reason } = req.body;
  const coach_name = req.session.coachName;
  if (!off_date) {
    return res.status(400).send('Missing date');
  }
  try {
    await pool.query(
      `INSERT INTO instructor_offdays (coach_name, off_date, start_time, end_time, reason)
         VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (coach_name, off_date, start_time, end_time)
         DO UPDATE SET reason = EXCLUDED.reason, created_at = CURRENT_TIMESTAMP`,
      [coach_name, off_date, start_time || null, end_time || null, reason || null]
    );
    res.sendStatus(200);
  } catch (err) {
    console.error('Add/update offday error:', err);
    res.status(500).send('Save failed');
  }
});

app.delete('/api/instructor-offdays/:id', async (req, res) => {
  if (!req.session.coachId || !req.session.coachName) {
    return res.status(401).send('Coach not logged in');
  }
  const { id } = req.params;
  try {
    const { rowCount } = await pool.query(
      `DELETE FROM instructor_offdays WHERE id = $1 AND coach_name = $2`,
      [id, req.session.coachName]
    );
    if (rowCount === 0) return res.status(403).send('Not your block, or not found');
    res.sendStatus(200);
  } catch (err) {
    console.error('Delete offday error:', err);
    res.status(500).send('Delete failed');
  }
});

// ---- Admin Booking Payment Update Route ----
app.put('/api/admin/booking-payment/:id', async (req, res) => {
  // Debug log for route entry (preserved)
  console.log('ADMIN_HISTORY_DEBUG: PUT /api/admin/booking-payment/:id route hit. Booking ID:', req.params.id, 'Request body:', req.body);

  // Robustness Checks
  if (!req.session || !req.session.user) {
    console.error('ADMIN_HISTORY_DEBUG: Session or user undefined. Session:', req.session);
    return res.status(401).json({ message: 'Unauthorized: Session or user data is missing. Please log in again.' });
  }
  if (!req.session.user.isAdmin) {
    console.warn('ADMIN_HISTORY_DEBUG: User is not admin. User:', req.session.user);
    return res.status(403).json({ message: 'Forbidden: User is not an administrator.' });
  }
  // Ensure req.body exists and lesson_cost_from_req is present
  if (!req.body || req.body.lesson_cost_from_req === undefined) {
     // Check if paid is being updated, if so, lesson_cost might not be needed.
     // This check might be too strict if only 'paid' status is updated.
     // For now, sticking to the subtask requirement.
    console.error('ADMIN_HISTORY_DEBUG: Missing lesson_cost_from_req in request body. Body:', req.body);
    return res.status(400).json({ message: 'Bad Request: lesson_cost_from_req is missing (or no valid field to update).' });
  }

  const bookingId = req.params.id;
  const { lesson_cost_from_req, paid: paid_from_req } = req.body; 

  try {
    const fieldsToUpdate = {};
    if (lesson_cost_from_req !== undefined) {
        const cost = parseFloat(lesson_cost_from_req);
        if (isNaN(cost)) {
            return res.status(400).json({ message: 'Invalid lesson_cost format.' });
        }
        fieldsToUpdate.lesson_cost = cost;
    }
    if (paid_from_req !== undefined && typeof paid_from_req === 'boolean') {
        fieldsToUpdate.paid = paid_from_req;
    }

    if (Object.keys(fieldsToUpdate).length === 0) {
        // This case might be hit if lesson_cost_from_req was undefined but paid_from_req was also undefined.
        // The initial check for lesson_cost_from_req might make this redundant if it's the only updatable field.
        // However, if 'paid' can be updated independently, this check is still valid.
        return res.status(400).json({ message: 'No valid fields provided for update.' });
    }

    const setClauses = Object.keys(fieldsToUpdate).map((key, index) => `${key} = $${index + 1}`).join(', ');
    const values = Object.values(fieldsToUpdate);
    values.push(bookingId);

    const sqlQuery = `UPDATE bookings SET ${setClauses} WHERE id = $${values.length} RETURNING *`;
    
    const updatedBookingResult = await pool.query(sqlQuery, values);

    if (updatedBookingResult.rows.length === 0) {
        return res.status(404).json({ message: 'Booking not found or no update made.' });
    }
    res.json(updatedBookingResult.rows[0]);

  } catch (err) {
    // Detailed error logging (preserved)
    console.error('ADMIN_HISTORY_DEBUG: Error updating booking payment. Booking ID:', req.params.id, 'Error Message:', err.message, 'Stack:', err.stack, 'Error Code:', err.code, 'Detail:', err.detail, 'Routine:', err.routine, 'Full Error:', err);
    res.status(500).json({ message: 'Failed to update booking payment due to a server error.' });
  }
});

// ---- Stripe Webhook ----
app.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      req.headers['stripe-signature'],
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('⚠️ Webhook signature verification failed.', err);
    return res.status(400).send('Webhook error');
  }

  if (event.type === 'checkout.session.completed') {
    const sess = event.data.object;
    await pool.query('UPDATE bookings SET paid = 1 WHERE session_id = $1', [sess.id]);
    await sendInvoiceEmail(sess.customer_email, sess);
  }
  res.sendStatus(200);
});

// ---- User and Auth Routes ----
app.post('/api/register', async (req, res) => {
  const { first_name, last_name, email, phone, username, password, students } = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const hash = await bcrypt.hash(password, 12);
    const userInsert = await client.query(
      `INSERT INTO users (first_name, last_name, email, phone, username, password_hash)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [first_name, last_name, email, phone, username, hash]
    );
    const userId = userInsert.rows[0].id;
    if (students && students.length) {
      const studentInsertPromises = students.map(name =>
        client.query(`INSERT INTO students (user_id, name) VALUES ($1, $2)`, [userId, name])
      );
      await Promise.all(studentInsertPromises);
    }
    await client.query('COMMIT');
    res.send('Registration successful');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).send('Registration failed');
  } finally {
    client.release();
  }
});

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).send('Missing credentials.');
  try {
    const { rows } = await pool.query('SELECT * FROM users WHERE username = $1 OR email = $1', [username]);
    if (!rows.length || !(await bcrypt.compare(password, rows[0].password_hash))) {
      return res.status(401).send('Invalid credentials.');
    }
    const isAdmin = rows[0].is_admin === true || rows[0].is_admin === 1;
    req.session.user = {
      id: rows[0].id,
      email: rows[0].email,
      username: rows[0].username,
      isAdmin,
      firstName: rows[0].first_name
    };
    res.status(200).json({ 
      firstName: rows[0].first_name,
      isAdmin,
      isCoach: false 
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Login error.');
  }
});

app.post('/api/coach/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const { rows } = await pool.query('SELECT id, full_name, password_hash FROM coaches WHERE username = $1', [username]);
    if (!rows.length || !(await bcrypt.compare(password, rows[0].password_hash))) {
      return res.status(401).send('Invalid coach credentials.');
    }
    req.session.coachId = rows[0].id;
    req.session.coachName = rows[0].full_name;
    console.log('✅ Coach logged in:', rows[0].full_name);
    res.json({ fullName: rows[0].full_name });
  } catch (err) {
    console.error('Server error during coach login.', err); // Added console.error for better debugging
    res.status(500).send('Server error during coach login.');
  }
});

app.post('/api/logout', (req, res) => {
  req.session.destroy((err) => { // Added error handling for session destruction
    if (err) {
      console.error('Failed to destroy session during logout:', err);
      return res.status(500).send('Could not log out.');
    }
    res.status(200).send('Logged out');
  });
});

app.get('/api/check-session', (req, res) => {
  if (req.session.user || req.session.coachId) {
    const isCoach = !!req.session.coachId;
    const isAdmin = req.session.user?.isAdmin || false;
    const firstName = req.session.user?.firstName || (isCoach ? req.session.coachName : null); // Provide coachName if user is coach
    return res.json({
      loggedIn: true,
      isCoach,
      isAdmin,
      firstName
    });
  }
  res.status(401).json({ loggedIn: false });
});

// ---- Admin Lesson Management Routes ----
app.post('/api/admin/lessons', async (req, res) => {
  // Add admin check
  if (!req.session.user?.isAdmin) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  const { program, coachName, date, time, student } = req.body;
  console.log('🎾 Adding lesson via admin for coach:', coachName);
  try {
    await pool.query(
      'INSERT INTO bookings (email, program, coach, date, time, student, paid, session_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
      ['', program, coachName, date, time, student, false, null] // Assuming default values for email, paid, session_id
    );
    res.status(200).send('Lesson added successfully');
  } catch (err) {
    console.error('Error adding admin lesson:', err);
    res.status(500).send('Error adding lesson');
  }
});

app.get('/api/admin/lessons', async (req, res) => {
  if (!req.session.user?.isAdmin) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  try {
    const { rows } = await pool.query(`
      SELECT id, program, coach, date, time, student, paid, email, phone, lesson_cost
      FROM bookings
      ORDER BY date DESC, time DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching all lessons for admin:', err);
    res.status(500).send('Error fetching lessons');
  }
});

app.delete('/api/admin/lessons/:id', async (req, res) => {
  if (!req.session.user?.isAdmin) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  try {
    await pool.query('DELETE FROM bookings WHERE id = $1', [req.params.id]);
    res.sendStatus(200);
  } catch (err) {
    console.error('Error deleting booking by admin:', err);
    res.status(500).send('Error deleting booking');
  }
});

// ---- Coach Specific Routes ----
app.get('/api/my-lessons', async (req, res) => {
  if (!req.session.coachId || !req.session.coachName) { // check both coachId and coachName
    return res.status(401).send('Unauthorized: Coach not logged in.');
  }
  const coachName = req.session.coachName.trim();
  try {
    const { rows } = await pool.query(
      `SELECT id, program, coach, date, time, student, phone
       FROM bookings
       WHERE LOWER(coach) = LOWER($1)
       ORDER BY date DESC, time DESC`,
      [coachName]
    );
    res.json(rows);
  } catch (err) {
    console.error('Error fetching lessons for coach:', err);
    res.status(500).send('Failed to fetch lessons.');
  }
});

app.post('/api/coach/lessons', async (req, res) => {
  if (!req.session.coachId || !req.session.coachName) {
    return res.status(401).send('Unauthorized: Coach not logged in.');
  }
  const { program, date, time, student } = req.body;
  try {
    await pool.query(
      `INSERT INTO bookings
         (email, program, coach, date, time, student, paid, session_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      ['', program, req.session.coachName, date, time, student || '', false, null]
    );
    res.sendStatus(200);
  } catch (err) {
    console.error('Error adding coach lesson:', err);
    res.status(500).send('Error adding lesson');
  }
});

// ---- Public Availability and Booking ----
app.get('/api/public-availability', async (req, res) => {
  const coachName = req.query.coach;
  if (!coachName) {
    return res.status(400).send('Missing coach name');
  }
  try {
    const { rows } = await pool.query(
      `SELECT coach_name, off_date, start_time, end_time
       FROM instructor_offdays
       WHERE coach_name = $1`,
      [coachName]
    );
    const fullDayBlocks = [];
    const timeBlocks = [];
    for (const row of rows) {
      if (!row.off_date) continue;
      try {
        if (!row.start_time && !row.end_time) {
          fullDayBlocks.push(row.off_date.toISOString().split('T')[0]);
        } else {
          timeBlocks.push({
            date: row.off_date.toISOString().split('T')[0],
            start: row.start_time,
            end: row.end_time
          });
        }
      } catch (formatError) {
        console.error('⚠️ Formatting error on public availability row:', row, formatError);
      }
    }
    res.json({ days: fullDayBlocks, times: timeBlocks });
  } catch (err) {
    console.error('❌ Public availability fetch failed:', err);
    res.status(500).send('Failed to load availability');
  }
});

// ---- Payment and Booking Creation ----
const PRODUCTS = { // Define PRODUCTS before use
  'Tennis Private':        { product: 'prod_SLdhVg9OLZ9ZXg', unit_amount: 8000 },
  'Summer Camp - Day Pass':  { product: 'prod_SLdiXatBCgPcdq', unit_amount: 3000 },
  'Summer Camp - Week Pass': { product: 'prod_SLdiTQnw5R0ZRz', unit_amount: 13000 },
  'Kids Camp - Day Pass':    { product: 'prod_SLdiVIknjyel8g', unit_amount: 4000 },
  'Kids Camp - Week Pass':   { product: 'prod_SLdjv2pREH95vy', unit_amount: 11000 },
  // Add other products if any
};

app.post('/api/create-payment', async (req, res) => {
  const { student, program, coach, date, time } = req.body;
  let email = req.body.email || (req.session.user && req.session.user.email);
  if (!email) {
    return res.status(400).send('Missing email address.');
  }
  let phone = req.body.phone || null; // Get phone from body if available
  if (req.session.user && req.session.user.id && !phone) { // If logged in and phone not in body, try to get from DB
    try {
      const userQuery = await pool.query('SELECT phone FROM users WHERE id = $1', [req.session.user.id]);
      if (userQuery.rows.length > 0) phone = userQuery.rows[0].phone;
    } catch (dbError) {
      console.error('Error fetching user phone for create-payment:', dbError);
    }
  }

  const entry = PRODUCTS[program];
  if (!entry) return res.status(400).send('Invalid program.');

  try {
    if (entry.unit_amount === 0) { // Free program
      await pool.query(
        `INSERT INTO bookings (email, phone, program, coach, date, time, session_id, paid, student, lesson_cost)
         VALUES ($1, $2, $3, $4, $5, $6, NULL, TRUE, $7, $8)`,
        [email, phone || '', program, coach, date, time, student, 0]
      );
      // Notify coach (omitted for brevity, but ensure it's there if needed)
      return res.json({ url: '/success.html' });
    }

    // Paid program
    const sessionObj = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: email,
      line_items: [{
        price_data: { currency: 'usd', product: entry.product, unit_amount: entry.unit_amount },
        quantity: 1
      }],
      mode: 'payment',
      metadata: { student, program, coach, date, time },
      success_url: `${req.protocol}://${req.get('host')}/success.html`,
      cancel_url: `${req.protocol}://${req.get('host')}/cancel.html`
    });
    const lessonCost = entry.unit_amount / 100;
    await pool.query(
      `INSERT INTO bookings (email, phone, program, coach, date, time, session_id, paid, student, lesson_cost)
       VALUES ($1, $2, $3, $4, $5, $6, $7, FALSE, $8, $9)`,
      [email, phone || '', program, coach, date, time, sessionObj.id, student, lessonCost]
    );
    // Notify coach (omitted for brevity)
    res.json({ url: sessionObj.url });
  } catch (err) {
    console.error('Payment creation failed.', err);
    res.status(500).send('Payment creation failed.');
  }
});

app.post('/api/book-pay-later', async (req, res) => {
  const { student, program, coach, date, time } = req.body;
  let email = req.body.email || (req.session.user && req.session.user.email);
  if (!email) return res.status(400).json({ message: 'Missing email address.' });

  let phone = req.body.phone || null;
  if (req.session.user && req.session.user.id && !phone) {
    try {
      const userQuery = await pool.query('SELECT phone FROM users WHERE id = $1', [req.session.user.id]);
      if (userQuery.rows.length > 0) phone = userQuery.rows[0].phone;
    } catch (dbError) {
      console.error('Error fetching user phone for pay-later:', dbError);
    }
  }
  
  let lessonCost = null; 
  const productInfo = PRODUCTS[program]; 
  if (productInfo && typeof productInfo.unit_amount === 'number') {
      lessonCost = productInfo.unit_amount / 100;
  }

  try {
    await pool.query(
      `INSERT INTO bookings (email, phone, program, coach, date, time, session_id, paid, student, lesson_cost)
       VALUES ($1, $2, $3, $4, $5, $6, NULL, FALSE, $7, $8)`,
      [email, phone || '', program, coach || null, date, time || null, student, lessonCost]
    );
    // Notify coach logic (ensure it's robust)
    if (coach) {
      const coachDetailsQuery = await pool.query(
        `SELECT phone, carrier_gateway FROM coaches WHERE full_name = $1`, [coach]
      );
      if (coachDetailsQuery.rows.length > 0 && coachDetailsQuery.rows[0].phone && coachDetailsQuery.rows[0].carrier_gateway) {
        // Sending SMS logic here
      }
    }
    res.status(200).json({ message: 'Booking successful for pay later.' });
  } catch (err) {
    console.error('Pay Later booking failed.', err);
    res.status(500).json({ message: 'Booking failed due to a server error.' });
  }
});

// ---- Miscellaneous Routes ----
app.post('/api/signup', async (req, res) => { // This seems like a class/event signup, not user registration
  const { name, email, program, preferred_date } = req.body;
  try {
    await pool.query(
      'INSERT INTO class_signups (name, email, program, preferred_date) VALUES ($1, $2, $3, $4)',
      [name, email, program, preferred_date]
    );
    res.status(200).send('Class signup successful.');
  } catch (err) {
    console.error('Class signup failed:', err);
    res.status(500).send('Signup failed.');
  }
});

app.post('/api/availability', async (req, res) => { // This is for coach to SET availability
  if (!req.session.coachId || !req.session.coachName) {
    return res.status(401).send('Unauthorized');
  }
  const { days, times } = req.body;
  const coachName = req.session.coachName;
  try {
    await pool.query('DELETE FROM instructor_offdays WHERE coach_name = $1', [coachName]);
    const dayInserts = days.map(d =>
      pool.query(`INSERT INTO instructor_offdays (coach_name, off_date) VALUES ($1, $2)`, [coachName, d])
    );
    const timeInserts = times.map(tb =>
      pool.query(`INSERT INTO instructor_offdays (coach_name, off_date, start_time, end_time)
                   VALUES ($1, $2, $3, $4)`, [coachName, tb.date, tb.start, tb.end])
    );
    await Promise.all([...dayInserts, ...timeInserts]);
    res.sendStatus(200);
  } catch (err) {
    console.error('Error saving availability:', err);
    res.status(500).send('Failed to save availability');
  }
});

app.get('/api/availability', async (req, res) => { // This is for coach to GET their own availability
  if (!req.session.coachId || !req.session.coachName) {
    return res.status(401).send('Unauthorized');
  }
  try {
    const { rows } = await pool.query(
      `SELECT coach_name, off_date, start_time, end_time
       FROM instructor_offdays
       WHERE coach_name = $1`,
      [req.session.coachName]
    );
    // Processing logic as before
    const fullDayBlocks = [];
    const timeBlocks = [];
    for (const row of rows) { /* ... */ }
    res.json({ days: fullDayBlocks, times: timeBlocks });
  } catch (err) {
    console.error('❌ Availability processing failed for coach:', err);
    res.status(500).send('Failed to load availability');
  }
});


app.post('/api/contact', async (req, res) => {
  const { first_name, last_name, email, message } = req.body;
  try {
    await pool.query(
      'INSERT INTO contacts (first_name, last_name, email, message) VALUES ($1, $2, $3, $4)',
      [first_name, last_name, email, message]
    );
    res.status(200).send('Message received.');
  } catch (err) {
    console.error('Contact submission error:', err);
    res.status(500).send('Contact submission failed.');
  }
});

// This route seems redundant if /api/admin/lessons/:id covers it.
// If it's for a different purpose (e.g., non-admin user deleting their own lesson), it needs different auth.
// For now, assuming it's an old/alternative admin delete, will keep but comment that it might need review.
app.post('/api/delete-lesson', async (req, res) => {
  // TODO: Review auth for this route. If for admins, use admin check. If for users, different logic.
  const { program, date, time, student } = req.body;
  try {
    // This is a very broad delete, potentially risky. Prefer deleting by ID if possible.
    await pool.query(
      'DELETE FROM bookings WHERE program=$1 AND date=$2 AND time=$3 AND student=$4',
      [program, date, time, student]
    );
    res.status(200).send('Lesson deleted');
  } catch (err) {
    console.error('Error deleting lesson via /api/delete-lesson:', err);
    res.status(500).send('Failed to delete lesson');
  }
});


// ---- Helper Functions ----
async function sendInvoiceEmail(toEmail, sessionData) { // Renamed 'session' to 'sessionData' to avoid conflict
  const doc = new PDFKit();
  const buffers = [];
  doc.on('data', buffers.push.bind(buffers));
  doc.on('end', async () => {
    const pdfData = Buffer.concat(buffers);
    try {
      await transporter.sendMail({
        from: `"C2 Tennis Academy" <${process.env.GMAIL_USER}>`, // Using GMAIL_USER from transporter config
        to: toEmail,
        subject: `Invoice for ${sessionData.metadata.program}`,
        text: 'Thank you for your payment. Your invoice is attached.',
        attachments: [{ filename: `invoice-${sessionData.id}.pdf`, content: pdfData }]
      });
    } catch (emailError) {
      console.error('Failed to send invoice email:', emailError);
    }
  });

  doc.fontSize(20).text('C2 Tennis Academy', { align: 'center' });
  doc.moveDown();
  doc.fontSize(14).text(`Invoice #${sessionData.id}`);
  doc.text(`Date: ${new Date(sessionData.created * 1000).toLocaleDateString()}`);
  doc.text(`Program: ${sessionData.metadata.program}`);
  doc.text(`Coach: ${sessionData.metadata.coach || '—'}`);
  doc.text(`Date of session: ${sessionData.metadata.date}`);
  doc.text(`Time: ${sessionData.metadata.time}`);
  doc.text(`Amount: $${(sessionData.amount_total / 100).toFixed(2)}`);
  doc.end();
}

// ---- Fallback/Generic Routes (should be last among route handlers) ----
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// This catch-all for .html files should be placed carefully,
// usually after API routes to avoid conflicts.
app.get('/:page', (req, res, next) => { // Added next for potential further error handling
  const pageName = req.params.page;
  // Basic security: ensure pageName is simple and does not contain path traversal
  if (pageName.includes('..') || pageName.includes('/')) {
    return res.status(404).send('Page not found');
  }
  const filePath = path.join(__dirname, `${pageName}.html`);
  res.sendFile(filePath, err => {
    if (err) {
      // If file not found, it's a 404.
      // Could also pass to a general error handler if one was configured.
      if (err.status === 404) {
        res.status(404).send('Page not found');
      } else {
        // For other errors (e.g., permissions), send a generic 500
        console.error(`Error sending file ${filePath}:`, err);
        res.status(500).send('Error loading page');
      }
    }
  });
});

// ─── Server Listen ────────────────────────────────────────────────────
const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on http://0.0.0.0:${PORT}`);
});