# Contact Form App

A simple Node.js + Express + MongoDB application that:
- saves form submissions to MongoDB
- sends the submission to your email
- sends a thank-you email back to the user

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy `.env.example` to `.env` and update values:

```bash
copy .env.example .env
```

3. Update `.env` values:
- `MONGO_URI` — your MongoDB connection string
- `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_SECURE`, `EMAIL_USER`, `EMAIL_PASS` — SMTP settings from your email provider (e.g., for Gmail: smtp.gmail.com, 587, false; for Zoho: smtp.zoho.com, 587, false)
- `EMAIL_RECEIVER` — the email address that receives submissions
- `PORT` — optional server port

   **Note:** If using Zoho Mail, use `smtp.zoho.com` as host. Ensure your password is an app password if 2FA is enabled.

4. Start the server:

```bash
npm start
```

5. Open the app in your browser:

```
http://localhost:3000
```

## Testing with Postman

Import `Contact_Form_API.postman_collection.json` into Postman to test the API endpoints.

### Endpoints

- `GET /health` — health check
- `POST /submit` — accepts `name`, `email`, `whatsapp`, `country`, `message`- `POST /send-bulk` — send email to multiple recipients

## Bulk Email Endpoint

**POST** `/send-bulk`

Send the same email content to multiple recipients.

**Request body:**
```json
{
  "emails": ["user1@example.com", "user2@example.com"],
  "subject": "Email Subject",
  "text": "Plain text content",
  "html": "<html>Optional HTML content</html>"
}
```

**Required fields:** `emails` (array), `subject`, `text`
**Optional fields:** `html`

**Response:**
```json
{
  "success": true,
  "message": "Email sent to 2 recipient(s)",
  "recipients": 2,
  "messageId": "..."
}
```
## Notes

- The frontend form is served from `public/index.html`
- The MongoDB model is in `models/Contact.js`
- Email is sent via `nodemailer`
