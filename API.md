# TestimonialHub REST API

Base URL: `http://localhost:5000`

All responses are JSON unless noted. Authenticated requests use the `httpOnly` `accessToken` cookie (or `Authorization: Bearer <access-token>`). The refresh token is rotated by `POST /api/auth/refresh`.

## Common responses

Successful responses include `success: true`. Errors use:

```json
{ "success": false, "message": "Human-readable error" }
```

Validation failures may also include `errors`. Common status codes are `400` invalid input, `401` missing/expired auth, `403` forbidden, `404` not found, `409` duplicate resource, and `429` rate limited.

## Authentication

| Method | Endpoint | Auth | Body |
|---|---|---|---|
| POST | `/api/auth/signup` | No | `{ "name", "email", "password" }` |
| POST | `/api/auth/verify-email` | No | `{ "token" }` |
| POST | `/api/auth/login` | No | `{ "email", "password" }` |
| POST | `/api/auth/refresh` | Refresh cookie | None |
| POST | `/api/auth/logout` | No | None |
| POST | `/api/auth/forgot-password` | No | `{ "email" }` |
| POST | `/api/auth/reset-password` | No | `{ "token", "password" }` |
| GET | `/api/auth/me` | Yes | None |

Example login:

```bash
curl -i -c cookies.txt -H "Content-Type: application/json" \
  -d '{"email":"ava@example.com","password":"StrongPass1"}' \
  http://localhost:5000/api/auth/login
```

Signup does not issue authentication cookies. Successful login and successful email verification issue secure HTTP-only access and refresh cookies. The refresh endpoint rotates the refresh session and returns a new access cookie. If refresh fails, clients should clear local session state and send the user to /login.

### Email verification flow

1. POST /api/auth/signup creates the account as unverified and creates a verification token valid for 24 hours. Signup does not issue authentication cookies.
2. In development, the verification email is simulated: the token is logged by the server and returned as verification.token so the flow can be tested locally. verification.simulated is true when no usable SMTP delivery occurs.
3. In production, the token is never returned in the API response. Configure the SMTP environment variables so the user receives the verification email.
4. Submit the token to POST /api/auth/verify-email. A successful request marks the account as verified, clears the one-time token, issues the access and refresh httpOnly cookies, and returns the public user. The user can go directly to the dashboard without logging in again.
5. Verification tokens expire after 24 hours. An invalid or expired token returns 400. Attempting to log in before verification returns 403 with code EMAIL_NOT_VERIFIED.

Development signup response example:

    {
      "success": true,
      "message": "Account created. Verification email simulated.",
      "verification": {
        "simulated": true,
        "expiresIn": "24h",
        "token": "temporary-development-token"
      },
      "user": {
        "id": "665...",
        "name": "Ava Morgan",
        "email": "ava@example.com"
      }
    }

Verification request:

    curl -i -c cookies.txt -H "Content-Type: application/json" -d '{"token":"temporary-development-token"}' http://localhost:5000/api/auth/verify-email

Successful verification response:

    {
      "success": true,
      "message": "Email verified successfully",
      "user": {
        "id": "665...",
        "name": "Ava Morgan",
        "email": "ava@example.com"
      }
    }

## Spaces

| Method | Endpoint | Auth | Body / query |
|---|---|---|---|
| GET | `/api/spaces` | Yes | None |
| POST | `/api/spaces` | Yes | Space body; JSON or multipart with optional `logo` |
| GET | `/api/spaces/:spaceId` | Yes, owner | None |
| PATCH | `/api/spaces/:spaceId` | Yes, owner | Partial space body; JSON or multipart |
| DELETE | `/api/spaces/:spaceId` | Yes, owner | None |
| GET | `/api/spaces/:spaceId/metrics` | Yes, owner | None |

Space body example:

```json
{
  "name": "Acme Corp",
  "slug": "acme-corp",
  "description": "Customer stories from Acme.",
  "customPrompt": "What changed for you?",
  "brandColor": "#A8C96F",
  "avatarEnabled": true,
  "starRatingEnabled": true,
  "customQuestions": ["What did you like most?"]
}
```

Example response:

```json
{
  "success": true,
  "space": { "id": "665...", "name": "Acme Corp", "slug": "acme-corp" }
}
```

The legacy aliases `/api/spaces/mine` and `/api/spaces/create` are also supported. Space mutations verify ownership. Duplicate slugs return `409`.

## Testimonials

| Method | Endpoint | Auth | Body / query |
|---|---|---|---|
| GET | `/api/spaces/:spaceId/testimonials` | Yes, owner | `status`, `search`, `rating`, `page`, `limit` |
| PATCH | `/api/testimonials/:testimonialId/status` | Yes, owner | `{ "status": "approved" }` |
| PATCH | `/api/testimonials/:testimonialId/featured` | Yes, owner | `{ "featured": true }` |
| PATCH | `/api/testimonials/:testimonialId/liked` | Yes, owner | `{ "liked": true }` |
| DELETE | `/api/testimonials/:testimonialId` | Yes, owner | None |
| GET | `/api/testimonials/inbox` | Yes | Optional `page`, `limit` |

Testimonial status values are `pending`, `approved`, `rejected`, and `archived`. Listing defaults to `page=1` and `limit=10`, capped at `100`.

Example moderation request:

```bash
curl -X PATCH -b cookies.txt -H "Content-Type: application/json" \
  -d '{"status":"approved"}' \
  http://localhost:5000/api/testimonials/665...
```

The response contains the updated testimonial. Public submissions are always created with `status: "pending"`; clients cannot publish directly.

## Public endpoints

| Method | Endpoint | Auth | Body |
|---|---|---|---|
| GET | `/api/public/spaces/:spaceSlug` | No | None |
| POST | `/api/public/spaces/:spaceSlug/testimonials` | No | Multipart testimonial form |
| GET | `/api/public/spaces/:spaceSlug/testimonials/approved` | No | None |

Submission fields include `name`, `email`, `role`, `company`, `review`, optional `rating`, `customAnswers`, and optional image file `avatar`. The canonical submission example:

```bash
curl -X POST -F "name=Alex Morgan" \
  -F "email=alex@example.com" -F "role=Head of Product" \
  -F "rating=5" -F "review=The team saved us hours every week." \
  http://localhost:5000/api/public/spaces/acme-corp/testimonials
```

Successful submissions return `201` and a pending testimonial. The legacy aliases `/api/testimonials/submit/:slug`, `/api/spaces/public/:slug`, and `/api/spaces/public/:slug/wall` remain available.

## Metrics

`GET /api/spaces/:spaceId/metrics` returns approved-only metrics:

```json
{
  "success": true,
  "averageRating": 4.8,
  "totalReviews": 24,
  "distribution": { "5": 20, "4": 3, "3": 1, "2": 0, "1": 0 }
}
```

## Health

`GET /api/health` requires no authentication and returns `{ "success": true, "message": "Server is running" }`.
