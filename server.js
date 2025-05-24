require('dotenv').config();
const express = require('express');
const path = require('path');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const Stripe = require('stripe');

console.log(
  '🔑 Stripe key:',
  process.env.STRIPE_SECRET_KEY
    ? process.env.STRIPE_SECRET_KEY.slice(0,8) + '…'
    : '⚠️ MISSING'
);
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const cors = require('cors');
const PDFKit = require('pdfkit');
const nodemailer = require('nodemailer');
// at the top, after you require nodemailer:
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD
  }
});
const session = require('express-session');

const app = express();
app.set('trust proxy', 1);


// ─── Initialize Postgres pool ─────────────────────────────
const pool = new Pool({
  host:     process.env.DB_HOST,
  port:    +process.env.DB_PORT,
  database: process.env.DB_NAME,
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl:      { rejectUnauthorized: false },
});
// ────────────────────────────────────────────────────────────


// ---- Instructor Off-Days API ----
// Requires: instructor_offdays table migrated into PostgreSQL before use

// Get all off-days for a specific coach (for use in both portals)
app.get('/api/instructor-offdays', async (req, res) => {
  const coach = req.query.coach;
  if (!coach) return res.status(400).send('Missing coach name');
  // Optionally: Only allow viewing offdays for current coach if !isAdmin, but for now it's public for booking page

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

// Add or update an off-day (if same (coach, date, time) exists, update it)
// Auth: must be logged in as this coach (ensure req.session.coachName matches body.coach_name)
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
    // Upsert: insert or replace if exists (by unique index)
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

// Delete an off-day (coach can remove a block for a specific day or slot)
app.delete('/api/instructor-offdays/:id', async (req, res) => {
  if (!req.session.coachId || !req.session.coachName) {
    return res.status(401).send('Coach not logged in');
  }
  const { id } = req.params;

  try {
    // Only delete if record belongs to this coach
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

// ─── Parse JSON & URL-encoded bodies, serve .html files ─────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname, { extensions: ['html'] }));
// ──────────────────────────────────────────────────────────────────────--

app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production' && req.headers['x-forwarded-proto'] !== 'https') {
    return res.redirect('https://' + req.headers.host + req.url);
  }
  next();
});

 
// ─── CORS: allow credentials from both React AND Admin HTML ─────────
app.use(cors({
  origin: [
    'http://localhost:3000',                    // React front-end (dev)
    'http://localhost:8080',                    // Admin portal (dev)
    'https://rice-academy-website-1.onrender.com' // Your deployed site
  ],
  credentials: true,
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type']
}));
// enable preflight for all routes
app.options('*', cors());

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Lax', // allows browser to send the cookie on same-site requests
    maxAge: 86400000
  }
}));


app.post('/api/register', async (req, res) => {
  const { first_name, last_name, email, phone, username, password, students } = req.body;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // hash the password first
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
  isCoach: false  // ✅ Important for proper redirection logic on the frontend
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
    res.status(500).send('Server error during coach login.');
  }
});


app.post('/api/logout', (req, res) => {
  req.session.destroy(() => {
    res.status(200).send('Logged out');
  });
});

app.post('/api/admin/lessons', async (req, res) => {
  const { program, coachName, date, time, student } = req.body;
  console.log('🎾 Adding lesson via admin for coach:', coachName);

  try {
    await pool.query(
      'INSERT INTO bookings (email, program, coach, date, time, student, paid, session_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
      ['', program, coachName, date, time, student, false, null]
    );
    res.status(200).send('Lesson added successfully');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error adding lesson');
  }
});


app.post('/api/availability', async (req, res) => {
  if (!req.session.coachId || !req.session.coachName) {
    return res.status(401).send('Coach not logged in');
  }

  const coachName = req.session.coachName;
  const { days, times } = req.body;

  try {
    const client = await pool.connect();
    await client.query('BEGIN');

    // Delete previous entries
    await client.query('DELETE FROM instructor_offdays WHERE coach_name = $1', [coachName]);

    // Insert full day blocks
    for (const date of days || []) {
      await client.query(
        'INSERT INTO instructor_offdays (coach_name, off_date) VALUES ($1, $2)',
        [coachName, date]
      );
    }

    // Insert time blocks
    for (const block of times || []) {
      await client.query(
        `INSERT INTO instructor_offdays (coach_name, off_date, start_time, end_time)
         VALUES ($1, $2, $3, $4)`,
        [coachName, block.date, block.start, block.end]
      );
    }

    await client.query('COMMIT');
    client.release();

    res.status(200).send('Availability saved');
  } catch (err) {
    console.error('Save availability error:', err);
    res.status(500).send('Failed to save availability');
  }
});


app.get('/api/admin/lessons', async (req, res) => {
  if (!req.session.user?.isAdmin) {
    return res.status(403).send('Forbidden');
  }
  try {
    const { rows } = await pool.query(`
      SELECT id, program, coach, date, time, student, paid
      FROM bookings
      ORDER BY date DESC, time DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching all lessons:', err);
    res.status(500).send('Error fetching lessons');
  }
});

app.delete('/api/admin/lessons/:id', async (req, res) => {
  if (!req.session.user?.isAdmin) {
    return res.status(403).send('Forbidden');
  }
  try {
    await pool.query('DELETE FROM bookings WHERE id = $1', [req.params.id]);
    res.sendStatus(200);
  } catch (err) {
    console.error('Error deleting booking:', err);
    res.status(500).send('Error deleting booking');
  }
});


app.get('/api/my-lessons', async (req, res) => {
  // ensure this is a logged-in coach
  if (!req.session.coachId) {
    return res.status(401).send('Unauthorized');
  }

  const coachName = req.session.coachName.trim();

  try {
    const { rows } = await pool.query(
      `SELECT
         id,        -- include the primary key so you can delete by it
         program,
         coach,
         date,
         time,
         student
       FROM bookings
       WHERE LOWER(coach) = LOWER($1)
       ORDER BY date DESC, time DESC`,
      [coachName]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to fetch lessons.');
  }
});

app.post('/api/signup', async (req, res) => {
  const { name, email, program, preferred_date } = req.body;
  try {
    await pool.query(
  'INSERT INTO class_signups (name, email, program, preferred_date) VALUES ($1, $2, $3, $4)',
  [name, email, program, preferred_date]
);
    res.status(200).send('Class signup successful.');
  } catch (err) {
    console.error(err);
    res.status(500).send('Signup failed.');
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
    res.status(500).send('Contact submission failed.');
  }
});

const PRODUCTS = {
  'Tennis Private':        { product: 'prod_SLdhVg9OLZ9ZXg', unit_amount: 8000 },
  'Summer Camp - Day Pass':  { product: 'prod_SLdiXatBCgPcdq', unit_amount: 3000 },
  'Summer Camp - Week Pass': { product: 'prod_SLdiTQnw5R0ZRz', unit_amount: 13000 },
  'Kids Camp - Day Pass':    { product: 'prod_SLdiVIknjyel8g', unit_amount: 4000 },
  'Kids Camp - Week Pass':   { product: 'prod_SLdjv2pREH95vy', unit_amount: 11000 },
};

app.post('/api/delete-lesson', async (req, res) => {
  const { program, date, time, student } = req.body;
  try {
    await pool.query(
      'DELETE FROM bookings WHERE program=$1 AND date=$2 AND time=$3 AND student=$4',
      [program, date, time, student]
    );
    res.status(200).send('Lesson deleted');
  } catch (err) {
    console.error('Error deleting lesson:', err);
    res.status(500).send('Failed to delete lesson');
  }
});

app.post('/api/coach/lessons', async (req, res) => {
  // make sure they’re logged in as a coach
  if (!req.session.coachId) {
    return res.status(401).send('Unauthorized');
  }

  const { program, date, time, student } = req.body;

  try {
    await pool.query(
      `INSERT INTO bookings
         (email, program, coach, date, time, student, paid, session_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        '',                            // no email on coach‐added lessons
        program,
        req.session.coachName,         // coach’s full_name from login
        date,
        time,
        student || '',
        false,                         // always unpaid
        null                           // no Stripe session_id
      ]
    );
    res.sendStatus(200);
  } catch (err) {
    console.error('Error adding coach lesson:', err);
    res.status(500).send('Error adding lesson');
  }
});

app.get('/api/check-session', (req, res) => {
  if (req.session.user || req.session.coachId) {
    // figure out which portal they get
    const isCoach = !!req.session.coachId;
    const isAdmin = req.session.user?.isAdmin || false;
    const firstName = req.session.user?.firstName || null;
    return res.json({
      loggedIn: true,
      isCoach,
      isAdmin,
      firstName
    });
  }
  // not logged in
  res.status(401).json({ loggedIn: false });
});

app.post('/api/create-payment', async (req, res) => {
  // 1) Pull student, program, coach, date, time from the form
  const { student, program, coach, date, time } = req.body;

  // 2) Determine email: use form field if present, otherwise session
  let email = req.body.email || (req.session.user && req.session.user.email);
  if (!email) {
    return res.status(400).send('Missing email address.');
  }

  // 3) Look up the product entry
  const entry = PRODUCTS[program];
  if (!entry) {
    return res.status(400).send('Invalid program.');
  }

  try {
    // ——— FREE program branch ———
    if (entry.unit_amount === 0) {
      // a) Insert booking as paid
      await pool.query(
        `INSERT INTO bookings
           (email, program, coach, date, time, session_id, paid, student)
         VALUES ($1, $2, $3, $4, $5, NULL, TRUE, $6)`,
        [email, program, coach, date, time, student]
      );

      // b) Notify coach via email-to-SMS
      const { rows } = await pool.query(
        `SELECT phone, carrier_gateway
           FROM coaches
          WHERE full_name = $1`,
        [coach]
      );
      if (rows[0]?.phone && rows[0]?.carrier_gateway) {
        const smsTo = `${rows[0].phone.replace(/\D/g, '')}@${rows[0].carrier_gateway}`;
        await transporter.sendMail({
          from: `"C2 Tennis Academy" <${process.env.GMAIL_USER}>`,
          to: smsTo,
          text: `New booking: ${student} | ${program} on ${date} at ${time}`
        });
      }

      // c) Send client to success page
      return res.json({ url: '/success.html' });
    }

    // ——— PAID program branch ———
    // a) Create Stripe Checkout session
    const sessionObj = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email:       email,
      line_items: [{
        price_data: {
          currency:     'usd',
          product:      entry.product,
          unit_amount:  entry.unit_amount
        },
        quantity: 1
      }],
      mode:       'payment',
      metadata:   { student, program, coach, date, time },
      success_url: `${req.protocol}://${req.get('host')}/success.html`,
      cancel_url:  `${req.protocol}://${req.get('host')}/cancel.html`
    });

    // b) Record the booking as unpaid until webhook marks it paid
    await pool.query(
      `INSERT INTO bookings
         (email, program, coach, date, time, session_id, paid, student)
       VALUES ($1, $2, $3, $4, $5, $6, FALSE, $7)`,
      [email, program, coach, date, time, sessionObj.id, student]
    );

    // c) Notify coach via email-to-SMS
    const { rows } = await pool.query(
      `SELECT phone, carrier_gateway
         FROM coaches
        WHERE full_name = $1`,
      [coach]
    );
    if (rows[0]?.phone && rows[0]?.carrier_gateway) {
      const smsTo = `${rows[0].phone.replace(/\D/g, '')}@${rows[0].carrier_gateway}`;
      await transporter.sendMail({
        from: `"C2 Tennis Academy" <${process.env.GMAIL_USER}>`,
        to: smsTo,
        text: `New booking: ${student} | ${program} on ${date} at ${time}`
      });
    }

    // d) Return the Stripe checkout URL
    res.json({ url: sessionObj.url });

  } catch (err) {
    console.error('Payment creation failed.', err);
    res.status(500).send('Payment creation failed.');
  }
});



async function sendInvoiceEmail(toEmail, session) {
  const doc = new PDFKit();
  const buffers = [];

  doc.on('data', buffers.push.bind(buffers));
  doc.on('end', async () => {
    const pdfData = Buffer.concat(buffers);
    await transporter.sendMail({
      from: `"C2 Tennis Academy" <${process.env.SMTP_USER}>`,
      to: toEmail,
      subject: `Invoice for ${session.metadata.program}`,
      text: 'Thank you for your payment. Your invoice is attached.',
      attachments: [
        { filename: `invoice-${session.id}.pdf`, content: pdfData }
      ]
    });
  });

  doc.fontSize(20).text('C2 Tennis Academy', { align: 'center' });
  doc.moveDown();
  doc.fontSize(14).text(`Invoice #${session.id}`);
  doc.text(`Date: ${new Date(session.created * 1000).toLocaleDateString()}`);
  doc.text(`Program: ${session.metadata.program}`);
  doc.text(`Coach: ${session.metadata.coach || '—'}`);
  doc.text(`Date of session: ${session.metadata.date}`);
  doc.text(`Time: ${session.metadata.time}`);
  doc.text(`Amount: $${(session.amount_total / 100).toFixed(2)}`);
  doc.end();
}

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/:page', (req, res) => {
  const filePath = path.join(__dirname, `${req.params.page}.html`);
  res.sendFile(filePath, err => {
    if (err) res.status(404).send('Page not found');
  });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on http://0.0.0.0:${PORT}`);
});
