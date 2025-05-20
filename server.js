require('dotenv').config();
const express = require('express');
const path = require('path');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const Stripe = require('stripe');
const cors = require('cors');
const PDFKit = require('pdfkit');
const nodemailer = require('nodemailer');
const twilio      = require('twilio')(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);
const session = require('express-session');

const app = express();
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
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
    'http://localhost:3000', // your React front-end
    'http://localhost:8080'  // your Admin portal
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
  const { student, email, program, coach, date, time } = req.body;
  const entry = PRODUCTS[program];
  if (!entry) return res.status(400).send('Invalid program.');

  try {
    // 1️⃣ FREE program: just insert & notify coach
    if (entry.unit_amount === 0) {
      await pool.query(
        `INSERT INTO bookings 
           (email, program, coach, date, time, session_id, paid, student) 
         VALUES ($1,$2,$3,$4,$5,NULL,TRUE,$6)`,
        [email, program, coach, date, time, student]
      );

      // fetch coach phone
      const { rows } = await pool.query(
        'SELECT phone FROM coaches WHERE full_name = $1',
        [coach]
      );

      // debug
      console.log('📱 Twilio from:', process.env.TWILIO_PHONE_NUMBER);
      console.log('📱 Twilio to:', rows[0]?.phone);

      // send coach an SMS
      if (rows.length && rows[0].phone) {
        await twilio.messages.create({
          from: process.env.TWILIO_PHONE_NUMBER,
          to:   rows[0].phone,
          body: `New booking: ${student} | ${program} on ${date} at ${time}`
        });
      } else {
        console.warn('⚠️ No phone found for coach:', coach);
      }

      return res.json({ url: '/success.html' });
    }

    // 2️⃣ PAID program: create Stripe session
    const sessionObj = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: email,
      line_items: [{
        price_data: {
          currency: 'usd',
          product: entry.product,
          unit_amount: entry.unit_amount
        },
        quantity: 1
      }],
      mode: 'payment',
      metadata: { student, program, coach, date, time },
      success_url: `${req.protocol}://${req.get('host')}/success.html`,
      cancel_url:  `${req.protocol}://${req.get('host')}/cancel.html`
    });

    // record the booking (paid=false for now)
    await pool.query(
      `INSERT INTO bookings 
         (email, program, coach, date, time, session_id, paid, student) 
       VALUES ($1,$2,$3,$4,$5,$6,FALSE,$7)`,
      [email, program, coach, date, time, sessionObj.id, student]
    );

    // fetch coach phone
    const { rows } = await pool.query(
      'SELECT phone FROM coaches WHERE full_name = $1',
      [coach]
    );

    // debug
    console.log('📱 Twilio from:', process.env.TWILIO_PHONE_NUMBER);
    console.log('📱 Twilio to:', rows[0]?.phone);

    // send coach an SMS
    if (rows.length && rows[0].phone) {
      await twilio.messages.create({
        from: process.env.TWILIO_PHONE_NUMBER,
        to:   rows[0].phone,
        body: `New paid booking: ${student} | ${program} on ${date} at ${time}`
      });
    } else {
      console.warn('⚠️ No phone found for coach:', coach);
    }

    // finally send back the Stripe checkout URL
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
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: +process.env.SMTP_PORT,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      }
    });
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
