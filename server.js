// server.js
require('dotenv').config();

const express    = require('express');
const path       = require('path');
const mysql      = require('mysql2/promise');
const bcrypt     = require('bcrypt');
const Stripe     = require('stripe');
const PDFKit     = require('pdfkit');
const nodemailer = require('nodemailer');

const app    = express();
const PORT   = process.env.PORT || 8080;
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

app.get('/test-db', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT NOW() AS time');
    res.send(`✅ Database connected! Server time is: ${rows[0].time}`);
  } catch (error) {
    console.error('❌ Database connection error:', error);
    res.status(500).send('Failed to connect to the database.');
  }
});

// ─── MIDDLEWARE ────────────────────────────────────────────────────────────────
// Serve your static frontend assets
app.use(express.static(path.join(__dirname)));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── MYSQL POOL ────────────────────────────────────────────────────────────────
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// ─── AUTH & DATA ROUTES ────────────────────────────────────────────────────────

// 1) User Registration
app.post('/api/register', async (req, res) => {
  const { first_name, last_name, email, phone, username, password } = req.body;
  if (!first_name || !last_name || !email || !phone || !username || !password) {
    return res.status(400).send('All fields are required.');
  }
  try {
    const hash = await bcrypt.hash(password, 10);
    await pool.execute(
      'INSERT INTO users (first_name,last_name,email,phone,username,password_hash) VALUES (?,?,?,?,?,?)',
      [first_name, last_name, email, phone, username, hash]
    );
    res.status(200).send('Registration successful.');
  } catch (err) {
    console.error('Registration Error:', err);
    res.status(500).send('Server error during registration.');
  }
});

// 2) Login
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).send('Username and password required.');
  }
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );
    if (
      rows.length === 0 ||
      !(await bcrypt.compare(password, rows[0].password_hash))
    ) {
      return res.status(401).send('Invalid username or password.');
    }
    res.status(200).send(`Welcome, ${rows[0].first_name}`);
  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).send('Server error during login.');
  }
});

// 3) Legacy Class Signup
app.post('/api/signup', async (req, res) => {
  const { name, email, program, preferred_date } = req.body;
  if (!name || !email || !program || !preferred_date) {
    return res.status(400).send('Missing required fields.');
  }
  try {
    await pool.execute(
      'INSERT INTO class_signups (name,email,program,preferred_date) VALUES (?,?,?,?)',
      [name, email, program, preferred_date]
    );
    res.status(200).send('Class signup successful.');
  } catch (err) {
    console.error('Signup Error:', err);
    res.status(500).send('Signup failed: Database error.');
  }
});

// 4) Contact Form (phone removed)
app.post('/api/contact', async (req, res) => {
  const { first_name, last_name, email, message } = req.body;
  try {
    await pool.execute(
      'INSERT INTO contacts (first_name,last_name,email,message) VALUES (?,?,?,?)',
      [first_name, last_name, email, message]
    );
    res.status(200).send('Message received.');
  } catch (err) {
    console.error('Contact Error:', err);
    res.status(500).send('Failed to submit contact form.');
  }
});

// ─── STRIPE PAYMENT & INVOICE ──────────────────────────────────────────────────

// A) Create a Stripe Checkout session **and** insert into bookings
const PRODUCTS = {
  'Private Lessons': {
    product:     'prod_SGqWZcPazEgan4',
    unit_amount: 8000,
  },
  'Summer Camp / Group Lessons': {
    product:     'prod_SGqXbV7zZkw33O',
    unit_amount: 3000,
  },
};

app.post('/api/create-payment', async (req, res) => {
  const { email, program, coach, date, time } = req.body;
  const entry = PRODUCTS[program];
  if (!entry) {
    return res.status(400).send('Unknown program selected.');
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email:       email,
      line_items: [{
        price_data: {
          currency:    'usd',
          product:     entry.product,
          unit_amount: entry.unit_amount,
        },
        quantity: 1,
      }],
      mode:        'payment',
      metadata:    { program, coach, date, time },
      success_url: `${req.protocol}://${req.get('host')}/success.html`,
      cancel_url:  `${req.protocol}://${req.get('host')}/cancel.html`,
    });

    await pool.execute(
      `INSERT INTO bookings
         (email, program, coach, date, time, session_id, paid)
       VALUES (?,       ?,       ?,     ?,    ?,    ?,          0)`,
      [email, program, coach || '', date, time, session.id]
    );

    res.json({ url: session.url });
  } catch (err) {
    console.error('Payment Creation Error:', err);
    res.status(500).send('Payment creation failed.');
  }
});

// B) Stripe webhook to mark booking paid & send invoice
app.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      req.headers['stripe-signature'],
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('⚠️ Webhook signature mismatch.', err.message);
    return res.sendStatus(400);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    await pool.execute(
      'UPDATE bookings SET paid = 1 WHERE session_id = ?',
      [session.id]
    );
    await sendInvoiceEmail(session.customer_email, session);
  }
  res.sendStatus(200);
});

// C) Generate and email a PDF invoice
async function sendInvoiceEmail(toEmail, session) {
  const doc = new PDFKit();
  const buffers = [];
  doc.on('data', buffers.push.bind(buffers));
  doc.on('end', async () => {
    const pdfData = Buffer.concat(buffers);
    const transporter = nodemailer.createTransport({
      host:   process.env.SMTP_HOST,
      port:  +process.env.SMTP_PORT,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
    await transporter.sendMail({
      from:    `"Rice Tennis Academy" <${process.env.SMTP_USER}>`,
      to:      toEmail,
      subject: `Invoice for ${session.metadata.program}`,
      text:    'Thank you for your payment. Your invoice is attached.',
      attachments: [{
        filename: `invoice-${session.id}.pdf`,
        content:  pdfData,
      }]
    });
    console.log(`📧 Invoice sent to ${toEmail}`);
  });

  // Build PDF
  doc.fontSize(20).text('Rice Tennis Academy', { align: 'center' });
  doc.moveDown();
  doc.fontSize(14).text(`Invoice #${session.id}`);
  doc.text(`Date: ${new Date(session.created * 1000).toLocaleDateString()}`);
  doc.moveDown();
  doc.text(`Program: ${session.metadata.program}`);
  doc.text(`Coach: ${session.metadata.coach || '—'}`);
  doc.text(`Date of session: ${session.metadata.date}`);
  doc.text(`Time: ${session.metadata.time}`);
  doc.text(`Amount: $${(session.amount_total / 100).toFixed(2)}`);
  doc.moveDown(2);
  doc.text('Thank you for your business!');
  doc.end();
}

// ─── FALLBACK & START ──────────────────────────────────────────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});


















