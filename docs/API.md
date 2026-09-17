# BrandLink Hub API

## Authentication

Authentication uses a short-lived 15-minute JWT access token and a 7-day rotating refresh token. Both are issued only as `httpOnly` cookies; cookies are `secure` in production and use `sameSite: lax`. Access tokens are never stored in browser storage.

Sensitive authentication endpoints use a strict IP rate limit of 10 requests per 15 minutes. Public testimonial submission uses a moderate limit of 10 requests per 15 minutes, while normal API traffic uses the standard API limiter.

### POST /api/auth/signup
Creates an account with `name`, `email`, and a password containing at least 8 characters, including uppercase, lowercase, and a number. The password is bcrypt-hashed and a 24-hour email-verification token is created.

Development responses include `verification.simulated: true` and the temporary token. The server also logs the simulated email. Production responses do not return the token.

### POST /api/auth/login
Validates the email and password, requires a verified email address, creates a short-lived access session and persisted refresh session, and returns only `{ id, name, email }`. Passwords and refresh tokens are never included in the response.

### POST /api/auth/verify-email
Body: `{ "token": "..." }`. Verifies the simulated email token and marks the account as verified.

### POST /api/auth/reset-password
Accepts `{ "token": "...", "password": "..." }`. The reset token must be valid and unexpired, and the new password must meet the signup policy. All refresh sessions are revoked, existing access sessions are invalidated, cookies are cleared, and the user must log in again.

### POST /api/auth/signup
Request body:
- name: string
- email: string
- password: string

Response:
- 201 with user details and httpOnly cookies

### POST /api/auth/login
Request body:
- email: string
- password: string

### GET /api/auth/me
Requires auth cookies or Bearer token.

### POST /api/auth/logout
Clears auth cookies.

### POST /api/auth/forgot-password
Request body:
- email: string

### POST /api/auth/reset-password
Request body:
- token: string
- password: string

## Spaces

### GET /api/spaces/mine
Requires auth.

### POST /api/spaces/create
Requires auth. Creates an additional branded public collection page. Accepts JSON or multipart form data with an optional `logo` image (maximum 5 MB).

Space fields include `name`, `slug`, `description`, `logo`, `customPrompt`, `avatarEnabled`, `starRatingEnabled`, `customQuestions`, and `brandColor`. Slugs are normalized to lowercase URL-safe values, and duplicate slugs return `409`.

### GET /api/spaces/public/:slug
Public endpoint for a brand space summary and rating stats.

### GET /api/spaces/public/:slug/wall
Public review wall data for approved testimonials.

## Testimonials

Testimonials persist `space`, `clientName`, `email`, `companyRole`, `rating`, `reviewText`, `avatar`, `customAnswers`, `status`, `isFeatured`, `isLiked`, and timestamps. Status values are `pending`, `approved`, `rejected`, and `archived`; indexes cover `space`, `status`, `rating`, `createdAt`, and common space/status/date queries.

Database relationships use ObjectId references: `Space.owner` references `User._id`, and `Testimonial.space` references `Space._id`. User and Space models expose virtual `spaces` and `testimonials` relationships for population when needed.

### POST /api/testimonials/submit/:slug
Public submission endpoint for customers; no login is required. Accepts multipart form data with customer details, an optional `avatar` image, rating when enabled, and JSON-encoded `customAnswers` for the Space's custom questions.

### POST /api/public/spaces/:spaceSlug/testimonials
Canonical public submission endpoint. Requires no owner authentication, applies a 15-minute/IP submission rate limit, validates the Space and customer input, sanitizes text, validates email/rating/file settings, and always creates a `pending` testimonial. Public requests cannot set `status`, `featured`, or moderation actions. Request body and upload field sizes are bounded, and a honeypot field filters simple bots.

### GET /api/public/spaces/:spaceSlug/testimonials/approved
Unauthenticated widget endpoint. Returns only approved testimonials for the Space.

### GET /api/testimonials/inbox
Requires auth. Returns review queue for owner space.

### GET /api/spaces/:spaceId/testimonials
Requires auth. Returns testimonials for a Space owned by the current user. Supports optional `status`, `search`, `rating`, `page`, and `limit` filters. `rating` accepts `1` through `5`; all filters can be combined. Search is case-insensitive across client name, review text, company role, and email. Pagination defaults to page `1`, limit `10`, and caps limit at `100`.

The response includes `data` and `pagination: { page, limit, total, totalPages }`.
It also includes `metrics: { totalReviews, approvedReviews, averageRating, distribution }`, where distribution contains approved-only `{ star, count }` entries for stars 5 through 1.

### GET /api/spaces/:spaceId/metrics
Requires auth and Space ownership. Calculates approved-only `averageRating`, `totalReviews`, and a `distribution` object with counts for ratings `5` through `1` directly from MongoDB data.

All private Space operations verify the authenticated owner from the database. This includes update, delete, private testimonial listing, moderation, metrics, and embed configuration. Embed settings are available at `GET/PATCH /api/spaces/:spaceId/embed`.

## Embed Generator

The authenticated dashboard route `/dashboard/spaces/:spaceId/embed` generates a copy-paste HTML snippet with theme (`light`, `dark`, `auto`), layout (`grid`, `carousel`, `badge`), rating/avatar visibility, featured-only mode, and testimonial count attributes. The script URL uses `VITE_APP_URL` when configured and otherwise the current deployed origin. The generated `widget.js` asset loads only approved public testimonials.

### PATCH /api/testimonials/:testimonialId/status
Requires auth. Body: `{ "status": "approved" }`. Allowed values: `pending`, `approved`, `rejected`, `archived`.

### PATCH /api/testimonials/:testimonialId/featured
Requires auth. Body: `{ "featured": true }`.

### PATCH /api/testimonials/:testimonialId/liked
Requires auth. Body: `{ "liked": true }`.

### PATCH /api/testimonials/:id/moderate
Requires auth.
Body example:
{
  "action": "approve"
}

Supported actions:
- approve
- reject
- archive
- feature
- unfeature
- like
- unlike

The API verifies that the authenticated owner owns the testimonial's Space before applying any action.

## Authentication

### POST /api/auth/refresh
Rotates the HTTP-only refresh-token session and issues a new short-lived access token. The old session is invalidated. Reuse of an invalidated refresh token revokes all active sessions for that user.

### POST /api/auth/forgot-password
Sends a simulated development email unless SMTP variables are configured.

## Environment

Set `MONGO_URI` to a MongoDB Atlas connection string in production. Optional SMTP variables are `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASSWORD`, and `SMTP_FROM`.

Credentialed CORS allows the development client `http://localhost:5173`. In production, set `CLIENT_URL` to the exact deployed frontend origin. Wildcard `*` is rejected when auth cookies are enabled.

Zod validation is applied consistently on the client forms and backend routes. Backend validation runs before controllers for authentication, Space management, public testimonial submissions, and moderation mutations.

Errors are handled centrally by Express and return `{ success: false, message }`. Validation errors may include an `errors` array of field messages. Production responses never include stack traces, database errors, or generic internal exception details.

Image uploads accept JPG, JPEG, PNG, and WebP files up to 5 MB. MIME type, extension, and file signature are checked. Uploads use memory storage and pass through `server/services/storage.js`, which can be replaced with a Cloudinary or object-storage adapter without changing controllers.

## Health

### GET /api/health
Returns server health state.
