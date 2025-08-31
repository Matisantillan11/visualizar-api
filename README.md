# 📚 Visualizar API

Visualizar is an innovative educational platform that leverages augmented reality to inspire children to read more books. Instead of directly displaying copyrighted books within the mobile application, Visualizar creates engaging 3D renders and interactive visual content that tells children about books in a more interesting and immersive way.

The platform aims to bridge the gap between traditional reading and modern technology, making literature discovery more exciting for young readers through AR experiences while respecting intellectual property rights.

## 🛠️ Technology Stack

- **Backend Framework**: [NestJS](https://nestjs.com/) with TypeScript
- **Database**: PostgreSQL with [Prisma](https://www.prisma.io/) ORM
- **Authentication**: [Clerk](https://clerk.com/) for secure user management
- **Media Storage**: Google Cloud Platform (GCP) Storage
- **Deployment**: [Railway](https://railway.app/) for initial deployment
- **Package Manager**: pnpm

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v18 or higher)
- pnpm
- PostgreSQL
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd visualizar-api
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory and configure the following variables:
   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/visualizar"
   
   # Clerk Authentication
   CLERK_SECRET_KEY="your_clerk_secret_key"
   
   # Google Cloud Storage
   GCP_PROJECT_ID="your_gcp_project_id"
   GCP_STORAGE_BUCKET="your_storage_bucket"
   GCP_KEY_FILE="path_to_your_service_account_key.json"
   
   # Application
   PORT=3000
   NODE_ENV=development
   ```

4. **Database Setup**
> [!IMPORTANT]
> isma will be implemented in the future.
>

   ```bash
   # Generate Prisma client
   pnpm prisma generate
   
   # Run database migrations
   pnpm prisma migrate dev
   
   # (Optional) Seed the database
   pnpm prisma db seed
   ```

5. **Start the development server**
   ```bash
   pnpm run start:dev
   ```

The API will be available at `http://localhost:3000`

## 🏗️ Architecture

Visualizar API follows a **modular architecture** pattern, promoting separation of concerns and maintainability. The project is organized into the following structure:

```
src/
├── modules/
│   ├── auth/          # Authentication & authorization
│   ├── users/         # User management
│   ├── books/         # Book catalog & metadata
│   ├── authors/       # Author information
│   ├── institutions/  # Schools & educational institutions
│   ├── students/      # Student profiles & progress
│   └── teachers/      # Teacher accounts & classroom management
├── shared/
│   ├── guards/        # Authentication & authorization guards
│   ├── interceptors/  # Request/response interceptors
│   └── pipes/         # Data validation & transformation
└── main.ts           # Application entry point
```

### Key Architectural Principles

- **Modular Design**: Each feature is encapsulated in its own module
- **Dependency Injection**: Leveraging NestJS's powerful DI container
- **Database Layer**: Prisma ORM for type-safe database operations
- **Authentication Layer**: Clerk integration for secure user management
- **Media Handling**: GCP Storage for scalable file management

## 🧰 Useful Commands

### Development
```bash
# Start development server with hot reload
pnpm run start:dev

# e2e tests
$ pnpm run test:e2e

# Build the application
pnpm run build
```

### Database
# Generate Prisma client
> [!NOTE]
> Prisma will be implemented in the future.


### Testing
```bash
# Run unit tests
pnpm run test

# Run tests in watch mode
pnpm run test:watch

# Run e2e tests
pnpm run test:e2e

# Generate test coverage report
pnpm run test:cov
```

### Code Quality
```bash
# Lint code
pnpm run lint

# Format code
pnpm run format

# Type check
pnpm run type-check
```





## 📞 Contact

For questions, suggestions, or collaboration opportunities, please reach out:

**Matias Santillan**  
📧 Email: [matias1.santillan@gmail.com](mailto:matias1.santillan@gmail.com)

---

**Note**: This project does not include a license and is intended for educational and research purposes as part of a thesis project.