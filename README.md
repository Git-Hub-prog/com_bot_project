# TestimonialHub

TestimonialHub is a full-stack customer testimonial platform. Teams create branded Spaces, collect feedback through public forms, moderate submissions, and publish approved customer stories on a shareable Wall of Love or embedded website widget.

## Features

- Authentication with secure HTTP-only cookies
- Email verification simulation for local development
- Rotating refresh tokens with automatic access-token renewal
- Password reset flow
- Space creation, editing, deletion, and branding
- Public testimonial collection forms
- Validated image uploads for logos and customer avatars
- Testimonial moderation and approval workflow
- Search and status filters
- Rating filters and rating distribution metrics
- Wall of Love for approved testimonials
- Embed Generator for grid, carousel, and badge widgets

## Tech Stack

### Frontend

- React 19
- Vite
- Axios with refresh-token interceptors
- Zod client-side validation
- Responsive CSS and accessible semantic UI

### Backend

- Node.js
- Express 5
- REST API
- Multer for multipart image uploads
- Nodemailer for email delivery or development simulation

### Database and security

- MongoDB with Mongoose
- JWT access and refresh tokens
- HTTP-only, credentialed cookies
- bcrypt password hashing
- Helmet security headers
- CORS configuration
- Express rate limiting
- Input validation and upload signature checks

## Project structure

```text
client/       React/Vite frontend
server/       Express/Mongoose API
docs/         Extended documentation
API.md        REST API reference
```

## Installation

Requirements: Node.js 18+, npm, and a MongoDB database. MongoDB Atlas is recommended for hosted environments.

```bash
git clone <repository-url>
cd testimonialhub
npm install

cd client
npm install

cd ../server
npm install
```

Create the environment file from the included template:

```bash
cp .env.example .env
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Set at minimum: `NODE_ENV`, `PORT`, `MONGO_URI`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, and `CLIENT_URL`. The server also includes `server/.env.example`.

Never commit `.env` or real credentials. Environment files are ignored while example templates remain tracked.

## Running locally

Run the backend and frontend in separate terminals:

```bash
cd server
npm run dev
```

```bash
cd client
npm run dev
```

The frontend runs at `http://localhost:5173`, the API at `http://localhost:5000`, and health is available at `GET /api/health`.

### Seed demo data

With a development `MONGO_URI` configured, seed a verified demo owner, an Acme Corp Space, and testimonials covering pending, approved, rejected, archived, featured, and liked states:

```bash
cd server
npm run seed
```

Demo login: `demo@testimonialhub.local` / `DemoPass1`. The seed is safe to rerun for the demo Space; it refreshes that Space's testimonials and never runs when `NODE_ENV=production`.

For a production frontend build:

```bash
cd client
npm run build
npm run preview
```

## API documentation

See [API.md](API.md) for endpoint methods, authentication requirements, request and response formats, query parameters, errors, and cURL examples.

## Deployment

### Frontend

Build the client with `npm run build` from `client/`, then deploy `client/dist` to a static host such as Vercel, Netlify, Cloudflare Pages, or an object-storage CDN. Configure the frontend API URL when the backend uses a different origin.

### Backend

Deploy `server/` to a Node-compatible service such as Render, Railway, Fly.io, or a container platform. Install dependencies and run `npm start`. The service must expose the configured `PORT` and should use `GET /api/health` for readiness checks.

### MongoDB Atlas

Create an Atlas cluster and least-privilege database user, allow the backend service's network access, and set `MONGO_URI` to the Atlas connection string.

### Production environment

Configure the variables from `.env.example` as hosting-provider secrets:

- Use long random JWT secrets and set `NODE_ENV=production`.
- Set `CLIENT_URL` to the exact deployed frontend origin; wildcard CORS is not supported with credentialed cookies.
- Use HTTPS with `COOKIE_SECURE=true`.
- Configure SMTP variables for real email delivery.
- Set upload limits appropriate for the host.

After deployment, verify login, refresh, logout, public collection, moderation, and `/api/health`.
