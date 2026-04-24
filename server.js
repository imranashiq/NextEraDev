const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const nodemailer = require('nodemailer');
const Contact = require('./models/Contact');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

if (!process.env.MONGO_URI) {
  console.error('Missing MONGO_URI in .env');
  process.exit(1);
}

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('MongoDB connected');
}).catch((error) => {
  console.error('MongoDB connection error:', error);
  process.exit(1);
});

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT || 587),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.post('/submit', async (req, res) => {
  try {
    const { name, email, phone, budget, services, message } = req.body;

    if (!name || !email || !phone || !budget || !services || !message) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    const contact = new Contact({ name, email, phone, budget, services, message });
    await contact.save();

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_RECEIVER,
      subject: 'New Contact Form Submission',
      text: `New submission:\n\nName: ${name}\nEmail: ${email}\nPhone: ${phone}\nBudget: ${budget}\nServices: ${Array.isArray(services) ? services.join(', ') : services}\nMessage:\n${message}`,
    };

    await transporter.sendMail(mailOptions);

    const thankYouOptions = {
      from: {
        name: 'NextEra',
        address: process.env.EMAIL_USER,
      },
      to: email,
      subject: 'Thank you for contacting us',
      text: `Hi ${name},\n\nThank you for submitting your project details. We have received your message and will be in touch soon.\n\nBest regards,\nTeam NextEra Dev`,
    };

    await transporter.sendMail(thankYouOptions);

    res.json({ success: true, message: 'Submission received. Thank you!' });
  } catch (error) {
    console.error('Submit error:', error);
    res.status(500).json({ error: 'Unable to process submission right now.' });
  }
});

app.post('/send-bulk', async (req, res) => {
  try {
    const { emails, subject, text, html } = req.body;

    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return res.status(400).json({ error: 'Emails array is required and must not be empty.' });
    }

    if (!subject || !text) {
      return res.status(400).json({ error: 'Subject and text are required.' });
    }

    const mailOptions = {
      from: {
        name: 'NextEra',
        address: process.env.EMAIL_USER,
      },
      to: emails.join(','),
      subject: subject,
      text: text,
      ...(html && { html: html }),
    //   headers: {
    //     'X-Mailer': 'NextEra Dev Mailer',
    //   },
    };

    const info = await transporter.sendMail(mailOptions);

    res.json({
      success: true,
      message: `Email sent to ${emails.length} recipient(s)`,
      recipients: emails.length,
      messageId: info.messageId,
    });
  } catch (error) {
    console.error('Bulk email error:', error);
    res.status(500).json({ error: 'Unable to send bulk emails right now.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;