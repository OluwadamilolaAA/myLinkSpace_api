# MyLinkSpace API

MyLinkSpace is a REST API for managing user accounts and personal bookmarks. It is built with Express 5, TypeScript, Prisma ORM 7, and PostgreSQL.

## Features

- Account registration, login, logout, and password reset
- Cookie-based user sessions
- Profile updates, password changes, and account deletion
- Create, search, filter, archive, restore, update, and delete bookmarks
- Bookmark categories and tags
- Request validation, rate limiting, security headers, CORS, and origin checks

## Requirements

- Node.js and npm
- PostgreSQL
- A Resend API key and configured sender address for password reset emails

## Setup

1. Install dependencies:

   ```sh
   npm install
   ```

2. Create a `.env` file in the project root and set the required configuration:

   ```dotenv
   DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?schema=public"
   CLIENT_ORIGIN="http://localhost:3000"
   RESEND_API_KEY="your-resend-api-key"
   EMAIL_FROM="MyLinkSpace <noreply@example.com>"
   PORT=5000
   NODE_ENV=development
   ```

   `DATABASE_URL`, `CLIENT_ORIGIN`, `RESEND_API_KEY`, and `EMAIL_FROM` should be configured for your environment. `PORT` defaults to `5000`. Set `NODE_ENV=production` when deploying so session cookies use the `Secure` flag. Use a sender address permitted by your Resend account.

3. Generate the Prisma Client and apply database migrations:

   ```sh
   npm run db:generate
   npm run db:migrate
   ```

4. Start the development server:

   ```sh
   npm run dev
   ```

The server listens at `http://localhost:5000` by default. Check `GET /api/v1/health` to confirm it is running.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Run the API with `tsx` watch mode |
| `npm run build` | Compile TypeScript into `dist` |
| `npm start` | Run the compiled server |
| `npm run db:generate` | Generate the Prisma Client |
| `npm run db:migrate` | Create and apply development database migrations |
| `npm run db:studio` | Open Prisma Studio |

## API

All endpoints are prefixed with `/api/v1`.

### Health

| Method | Path | Authentication |
| --- | --- | --- |
| `GET` | `/health` | No |

### Authentication

| Method | Path | Authentication |
| --- | --- | --- |
| `POST` | `/auth/register` | No |
| `POST` | `/auth/login` | No |
| `POST` | `/auth/logout` | Yes |
| `POST` | `/auth/forgot-password` | No |
| `POST` | `/auth/reset-password` | No |

Successful login sets the `mylinkspace_session` cookie. It is HTTP-only, uses `SameSite=Lax`, and is marked `Secure` in production. Browser clients should send requests with credentials enabled. Password reset emails use the configured Resend account.

### User

All user endpoints require authentication.

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/user/me` | Get the current user's profile |
| `PATCH` | `/user/me` | Update the profile |
| `PATCH` | `/user/me/password` | Change the password |
| `DELETE` | `/user/me` | Delete the account |

### Bookmarks

All bookmark endpoints require authentication. Bookmark IDs are UUIDs.

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/bookmark` | List bookmarks |
| `POST` | `/bookmark` | Create a bookmark |
| `GET` | `/bookmark/:id` | Get a bookmark |
| `PATCH` | `/bookmark/:id` | Update a bookmark |
| `DELETE` | `/bookmark/:id` | Delete a bookmark |
| `PATCH` | `/bookmark/:id/archive` | Archive a bookmark |
| `PATCH` | `/bookmark/:id/restore` | Restore a bookmark |
| `PATCH` | `/bookmark/restore-all` | Restore all archived bookmarks |

The list endpoint accepts these query parameters:

| Parameter | Values / default |
| --- | --- |
| `search` | Optional text search |
| `category` | Optional category filter |
| `tag` | Optional tag filter |
| `archived` | `true` or `false`; defaults to `false` |
| `sort` | `newest` or `title`; defaults to `newest` |
| `page` | Positive page number; defaults to `1` |
| `limit` | `1`–`100`; defaults to `20` |

Bookmark creation accepts a title, an HTTP or HTTPS URL, a category, and optional description and tags. A bookmark can have up to eight tags.

## Project structure

- `src/app.ts` configures Express middleware and mounts API routes.
- `src/server.ts` connects to PostgreSQL and starts the server.
- `src/modules/` contains the authentication, user, and bookmark route/controller/service code.
- `src/middlewares/` contains authentication, validation, security, rate-limiting, and error middleware.
- `src/lib/` configures Prisma and Resend.
- `prisma/schema.prisma` defines the database models; `prisma/migrations/` contains database migrations.
