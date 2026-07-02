# URL Shortener with Analytics

A secure backend service that shortens long URLs and tracks detailed click analytics (timestamp, IP-based location, device/browser/OS) whenever a shortened link is accessed.

Built with **Node.js**, **Express 5**, and **MongoDB (Mongoose)**.

## Features

- Shorten any valid `http`/`https` URL into a unique 6-character code
- Automatic redirect from short URL to original URL
- Analytics engine that captures on every click:
  - Timestamp
  - IP-based country/city (via `geoip-lite`)
  - Browser, OS, and device type (via `ua-parser-js`)
- Duplicate detection — shortening the same URL twice returns the existing short link
- Security hardening:
  - `helmet` for secure HTTP headers
  - Rate limiting on all `/api` routes
  - Request sanitization against NoSQL operator injection
  - SSRF protection — blocks shortening URLs that resolve to private/internal IPs
  - Request body size limit

## Tech Stack

| Layer | Tool |
|---|---|
| Runtime | Node.js |
| Framework | Express 5 |
| Database | MongoDB + Mongoose |
| Short code generation | nanoid |
| Analytics parsing | ua-parser-js, geoip-lite |
| Security | helmet, express-rate-limit, custom sanitize middleware |

## Project Structure

```
.
├── app.js                     # Express app setup, middleware, routes
├── server.js                  # Entry point, DB connection, server start
├── config/
│   └── database.js            # MongoDB connection
├── controllers/
│   ├── urlController.js       # Shorten + redirect logic
│   ├── analyticsController.js # Analytics aggregation logic
│   └── errorController.js     # Centralized error handler
├── middleware/
│   └── sanitize.js            # Strips NoSQL-injection-prone keys
├── models/
│   ├── url.js                 # URL schema
│   └── analytics.js           # Analytics schema
├── routes/
│   ├── urlRouter.js           # POST /api/v1/url/shorten
│   ├── analyticsRouter.js     # GET /api/v1/analytics/:shortCode
│   └── redirectRouter.js      # GET /:shortCode
└── utils/
    ├── appError.js
    ├── catchAsync.js
    ├── collectAnalytics.js
    ├── generateShortCode.js
    └── isPrivateIP.js         # SSRF guard
```

## Getting Started

### Prerequisites

- Node.js 18+
- A MongoDB database (local or [MongoDB Atlas](https://www.mongodb.com/atlas))

### Installation

```bash
git clone https://github.com/M-Subhaaan/InternGrow_URL_Shortener.git
cd InternGrow_URL_Shortener
npm install
```

### Environment Variables

Copy `empty.env` to `.env` and fill in your values:

```bash
cp empty.env .env
```

```
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/url_shortener
```

### Run locally

```bash
# Development (auto-restart on changes)
npm run dev

# Production
npm start
```

The server starts at `http://localhost:3000` (or whatever `PORT` you set).

## API Reference

### 1. Shorten a URL

```
POST /api/v1/url/shorten
Content-Type: application/json
```

**Request body:**
```json
{
  "url": "https://www.example.com/some/very/long/path"
}
```

**Success response — `201 Created`:**
```json
{
  "status": "success",
  "message": "Short URL Created Successfully",
  "data": {
    "originalUrl": "https://www.example.com/some/very/long/path",
    "shortCode": "aB3xQ9",
    "shortUrl": "http://localhost:3000/aB3xQ9"
  }
}
```

**If the URL was already shortened before — `200 OK`:**
```json
{
  "status": "success",
  "message": "Short URL Already Exists",
  "data": {
    "originalUrl": "https://www.example.com/some/very/long/path",
    "shortCode": "aB3xQ9",
    "shortUrl": "http://localhost:3000/aB3xQ9"
  }
}
```

**Error responses:**
- `400` — missing URL, invalid format, unsupported protocol, or URL resolves to a private/internal address

### 2. Redirect to original URL

```
GET /:shortCode
```

Redirects (`302`) to the original URL and logs an analytics entry (IP, location, browser, OS, device, timestamp).

- `404` — short code not found

### 3. Get analytics for a short URL

```
GET /api/v1/analytics/:shortCode
```

**Success response — `200 OK`:**
```json
{
  "success": true,
  "data": {
    "originalUrl": "https://www.example.com/some/very/long/path",
    "shortCode": "aB3xQ9",
    "shortUrl": "http://localhost:3000/aB3xQ9",
    "totalClicks": 42,
    "lastClicked": "2026-06-30T10:15:00.000Z",
    "countries": [
      { "_id": "PK", "count": 30 },
      { "_id": "US", "count": 12 }
    ],
    "browsers": [
      { "_id": "Chrome", "count": 35 },
      { "_id": "Safari", "count": 7 }
    ],
    "devices": [
      { "_id": "Desktop", "count": 25 },
      { "_id": "mobile", "count": 17 }
    ],
    "operatingSystems": [
      { "_id": "Windows", "count": 20 },
      { "_id": "iOS", "count": 15 },
      { "_id": "Android", "count": 7 }
    ]
  }
}
```

- `404` — short code not found

## Security Notes

- **Rate limiting**: 50 requests per 15 minutes per IP on all `/api` routes
- **SSRF protection**: URLs that resolve to localhost or private IP ranges (`10.x`, `172.16–31.x`, `192.168.x`, etc.) are rejected before being stored
- **Sanitization**: request body/params/query are stripped of `$`-prefixed and dotted keys to prevent MongoDB operator injection
- **Body size limit**: JSON payloads capped at 10kb

## License

ISC
