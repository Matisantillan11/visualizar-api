<div align="center">

<img src="./assets/images/visualizar-icon.png" height="100px" width="auto" />

# Visualizar API - by Matias Santillan

[About](#-about) ✦ [Tech Stack](#-tech-stack) ✦ [Getting Started](#-getting-started) ✦ [Commands](#-commands) ✦ [How it Works](#-how-it-works) ✦ [License](#-license)

</div>

## 📖 About

**Visualizar API** is the backend for frontend (BFF) that powers the [Visualizar](https://github.com/Matisantillan11/visualizar) mobile app and the [Visualizar Dashboard](https://github.com/Matisantillan11/visualizar-next-dashboard) admin panel.

Built as part of a university thesis project, this API handles everything from authentication and user management to the book catalog, book request workflows, and email notifications — providing a unified backend for both client applications.

## 🛠 Tech Stack

| Technology                                                                                                                            | Purpose                                                                                                                                                                                  |
| ------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [NestJS](https://nestjs.com/) (v11)                                                                                                   | Progressive Node.js framework for building scalable server-side applications. Provides a modular architecture with dependency injection, guards, interceptors, and pipes out of the box. |
| [Prisma](https://www.prisma.io/) (v6)                                                                                                 | Next-generation ORM for type-safe database access. Handles schema modeling, migrations, and query building with full TypeScript support.                                                 |
| [PostgreSQL](https://www.postgresql.org/) via [Supabase](https://supabase.com/)                                                       | Relational database hosted on Supabase. Provides a managed PostgreSQL instance with connection pooling via PgBouncer.                                                                    |
| [Supabase Auth](https://supabase.com/docs/guides/auth)                                                                                | Passwordless authentication via email OTP. Handles user sessions, JWT tokens, and secure login flows — ideal for young students who may not manage complex passwords.                    |
| [SendGrid](https://sendgrid.com/)                                                                                                     | Transactional email service for welcome emails, book request notifications, approval/rejection alerts, and book publication updates.                                                     |
| [Swagger / OpenAPI](https://swagger.io/) via [@nestjs/swagger](https://docs.nestjs.com/openapi)                                       | Automatic API documentation. Provides an interactive UI at `/api` for exploring and testing all available endpoints.                                                                     |
| [class-validator](https://github.com/typestack/class-validator) + [class-transformer](https://github.com/typestack/class-transformer) | Request validation and transformation. Ensures incoming data matches expected shapes through DTO decorators and global validation pipes.                                                 |

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [pnpm](https://pnpm.io/)
- A [Supabase](https://supabase.com/) project (for database and authentication)
- A [SendGrid](https://sendgrid.com/) account (for email notifications)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/Matisantillan11/visualizar-api.git
   cd visualizar-api
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Set up environment variables:

   Create a `.env` file in the root directory with the required variables:

   ```bash
   # Database
   DATABASE_URL=<database_url>


   # Supabase
   SUPABASE_URL=<supabase_url>
   SUPABASE_ANON_KEY=<your_supabase_anon_key>
   SUPABASE_SR_KEY=<your_supabase_service_role_key>

   # SendGrid
   SENDGRID_API_KEY=<your_sendgrid_api_key>
   SENDGRID_FROM_EMAIL=<your_sender_email>
   SENDGRID_ENABLED=true
   ```

4. Generate the Prisma client and run migrations:

   ```bash
   pnpm run prisma:generate
   pnpm run prisma:migrate
   ```

5. Start the development server:

   ```bash
   pnpm run start:dev
   ```

6. Open `http://localhost:8080/api` to explore the API documentation via Swagger.

## 🧞 Commands

| Command                    | Action                                          |
| -------------------------- | ----------------------------------------------- |
| `pnpm run start:dev`       | Start the server in watch mode (development)    |
| `pnpm run start:prod`      | Start the server in production mode             |
| `pnpm run build`           | Build the project for production                |
| `pnpm run lint`            | Run the linter and auto-fix issues              |
| `pnpm run format`          | Format code with Prettier                       |
| `pnpm run test`            | Run unit tests with Jest                        |
| `pnpm run test:watch`      | Run tests in watch mode                         |
| `pnpm run test:e2e`        | Run end-to-end tests                            |
| `pnpm run test:cov`        | Generate test coverage report                   |
| `pnpm run prisma:generate` | Generate the Prisma client                      |
| `pnpm run prisma:migrate`  | Run database migrations                         |
| `pnpm run prisma:push`     | Push schema changes without creating migrations |

## 📝 How it Works

### Authentication

The API uses a **passwordless email OTP** flow powered by Supabase Auth. Users receive a 6-digit verification code via email — no passwords required. The system also tracks OTP attempts and blocks accounts after repeated failures to prevent abuse.

### Role-based Access Control

The API supports four user roles, each with different permissions:

- **Students** can browse books assigned to their course and access 3D AR content.
- **Teachers** can manage books for their courses and submit new book requests.
- **Institutions** can oversee their courses and associated users.
- **Admins** have full access to manage users, books, courses, and approve or reject book requests.

Authorization is enforced through custom guards (`JwtAuthGuard`, `RolesGuard`) applied at the controller level.

### Book Request Workflow

Teachers can request new books to be added to the catalog. Each request follows a structured lifecycle:

1. **Pending** — The teacher submits a request with book details.
2. **Approved** — An admin reviews and approves the request; the teacher is notified via email.
3. **Published** — The book is made available in the catalog with its 3D models; all relevant teachers are notified.

All status changes are tracked through audit trails for transparency.

### Email Notifications

The API integrates with SendGrid to send transactional emails at key moments: welcome emails on registration, approval/rejection notifications for book requests, and publication alerts when new books become available.

### API Documentation

The full API is documented with Swagger and available at the `/api` endpoint when the server is running. It provides an interactive interface to explore endpoints, view request/response schemas, and test API calls directly from the browser.

## 🔑 License

Created by [Matias Santillan](https://github.com/Matisantillan11) as a university thesis project.
