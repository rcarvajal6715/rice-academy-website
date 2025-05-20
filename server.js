require('dotenv').config();
const express = require('express');
const path = require('path');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const Stripe = require('stripe');
const PDFKit = require('pdfkit');
const nodemailer = require('nodemailer');
const session = require('express-session');

const app = express();
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
app.set('trust proxy', 1);

app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production' && req.headers['x-forwarded-proto'] !== 'https') {
    return res.redirect('https://' + req.headers.host + req.url);
  }
  next();
});


app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',  // Only secure in production
    sameSite: 'Lax',
    maxAge: 86400000
  }
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));


const pool = new Pool({
  host: process.env.DB_HOST,
  port: +process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: {
    rejectUnauthorized: false,
  },
});

app.post('/api/register', async (req, res) => {
  const { first_name, last_name, email, phone, username, password, students } = req.body;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const userInsert = await client.query(
      `INSERT INTO users (first_name, last_name, email, phone, username, password)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [first_name, last_name, email, phone, username, password]
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
  const { program, coach, date, time, student } = req.body; // ✅ define variables first
  console.log('🎾 Adding lesson via admin for coach:', coach); // ✅ now you can use it

  try {
    await pool.query(
      'INSERT INTO bookings (email, program, coach, date, time, student, paid, session_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
      ['', program, coach, date, time, student, false, null]
    );
    res.status(200).send('Lesson added successfully');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error adding lesson');
  }
});

app.get('/api/my-lessons', async (req, res) => {
  const coachName = (req.session.coachName || '').trim();

  if (!req.session.coachId || !coachName) {
    return res.status(401).send('Unauthorized');
  }

  try {
    const { rows } = await pool.query(
      'SELECT program, coach, date, time, student FROM bookings WHERE LOWER(coach) = LOWER($1) ORDER BY date DESC',
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
  'Private Lessons':             { product: 'prod_SGqWZcPazEgan4', unit_amount: 8000 },
  'Summer Camp / Group Lessons - Day Pass': { product: 'prod_SGqXbV7zZkw33O', unit_amount: 3000 },
  'Summer Camp / Group Lessons - Week':     { product: 'prod_SLLPWS9GEdr2zu', unit_amount: 13000 },
  'Test Program':                { product: 'prod_SLLQnEM6GvCWTe', unit_amount: 0 },  // ✅ Add this line
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

app.post('/api/create-payment', async (req, res) => {
  const { email, program, coach, date, time, student } = req.body;
  const entry = PRODUCTS[program];
  if (!entry) return res.status(400).send('Invalid program.');

  try {
    // Handle FREE program logic
    if (entry.unit_amount === 0) {
      await pool.query(
        'INSERT INTO bookings (email, program, coach, date, time, session_id, paid, student) VALUES ($1, $2, $3, $4, $5, NULL, true, $6)',
        [email, program, coach, date, time, student]
      );
      return res.json({ url: '/success.html' });  // ✅ redirect manually to success
    }

    // Stripe payment for paid programs
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
      metadata: { program, coach, date, time },
      success_url: `${req.protocol}://${req.get('host')}/success.html`,
      cancel_url: `${req.protocol}://${req.get('host')}/cancel.html`,
    });

    await pool.query(
      'INSERT INTO bookings (email, program, coach, date, time, session_id, paid, student) VALUES ($1, $2, $3, $4, $5, $6, false, $7)',
      [email, program, coach || '', date, time, sessionObj.id, student || '']
    );

    res.json({ url: sessionObj.url });
  } catch (err) {
    console.error(err);
    res.status(500).send('Payment creation failed.');
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
    return res.status(400).send('Webhook error');
  }

  if (event.type === 'checkout.session.completed') {
    const sess = event.data.object;
    await pool.query('UPDATE bookings SET paid = 1 WHERE session_id = $1', [sess.id]);
    await sendInvoiceEmail(sess.customer_email, sess);
  }

  res.sendStatus(200);
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

const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on http://0.0.0.0:${PORT}`);
});
