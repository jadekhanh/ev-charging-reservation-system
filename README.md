# ev-charging-reservation-system
Inspired by Tesla Superchargers, this is a scalable backend system for managing EV charging station reservations, real-time charger availability, temporary reservation holds, and concurrent booking workflows. 

The project is built with the following tech stacks: TypeScript, Node.js, Express.js, PostgreSQL, Prisma, Redis, Docker, and RESTful APIs.

Developed by Phuong Khanh Tran

## Features
### Authentication & Authorization
- JWT authentication with bcrypt password hashing
- Role-based route protection for ADMIN and CUSTOMER users
- Authenticated `/me` endpoint for session validation
- Ownership checks preventing users from accessing and modifying other users’ reservations

### Charging Station & Charger Management
- Full CRUD operations for users, stations, chargers, and reservations
- Support for NACS and CCS charger connector types
- Charger power level support (LEVEL_2, DC_FAST)
- Charger status tracking (AVAILABLE, IN_USE, OUT_OF_SERVICE)
- Station metadata management including location and charger capacity

### Reservation Workflows
- Create, confirm, view, cancel, and delete reservations
- Temporary reservation holds before booking confirmation
- Transaction-safe reservation confirmation using Prisma transactions
- Reservation status tracking (CONFIRMED, CANCELLED)
- Customer reservation history support

### Availability & Scheduling
- Search available stations within requested date/time ranges
- Search available chargers at a station based on overlapping reservation logic
- Generate available charger time slots for a specific date
- Automatic filtering of unavailable chargers with conflicting reservations

### Redis-based Concurrency Handling
- Temporary Redis-backed reservation holds before booking confirmation
- Automatic expiration of inactive reservation holds after 5 minutes
- Reservation holds and confirmation conflict checks to prevent concurrent double booking

### Validation, Middleware & API Infrastructure
- Zod-based request validation for request body, query params, and route params
- Centralized error handling middleware
- Global API rate limiting middleware
- RESTful API architecture with modular route/controller/service organization
- Dockerized PostgreSQL and Redis infrastructure

## Database
Seed database includes: 1 admin, 5 customers, 5 stations, 3 chargers, and 2 reservations

### Stations
Each station has the following fields:
- name
- address
- city
- state
- zip code
- chargers

### Users
Each user has the following fields:
- email
- password hash
- role: ADMIN or CUSTOMER

### Chargers
Each charger has the following fields:
- station id
- connector type: NACS or CCS
- power level: LEVEL_2 or DC_FAST
- status: AVAILABLE, IN_USE, or OUT_OF_SERVICE

### Reservations
Each reservation has the following fields:
- user id
- station id
- charger id
- start time
- end time
- status: CONFIRMED or CANCELLED

## Testing
The project includes automated API and integration tests using Jest and Supertest. Test coverage includes:
- Authentication flows: registration, login, duplicate users, invalid credentials, and protected `/me` route
- Role-based authorization for admin and customer routes
- Station CRUD operations and request validation
- Reservation workflows: hold, confirm, view, cancel, and admin delete
- Ownership checks to prevent customers from accessing or canceling other users' reservations
- Redis-backed reservation hold conflict prevention
- Concurrency tests for simultaneous booking attempts on the same charger/time slot
- Availability tests for available chargers, available stations, time-slot generation, overlapping reservations, invalid query parameters, and unauthenticated requests

### Terminal 1
To start PostgreSQL and Redis containers:
```
docker compose up -d
```

To stop containers:
```
docker compose down
```

### Terminal 2
To set up Prisma database:
```
npx prisma generate
npx prisma migrate dev --name init
npm run db:seed
```

To run backend tests:
```
npm test
```

To stop backend:
```
Ctrl + C
```

## Tech Stacks
- Language & Runtime: TypeScript, Node.js
- Backend Framework: Express.js, RESTful APIs
- Database: PostgreSQL
- ORM: Prisma ORM for schema handling, database access, and transaction-safe reservation booking
- Caching & Locking: Redis for temporary reservation holds and concurrency-safe booking locks
- Authentication & Authorization: JWT authentication, bcrypt password hashing, role-based access control
- Validation & Middleware: Zod request validation, centralized error handling, not-found handling, global rate limiting
- Testing: Jest and Supertest for API, integration, authorization, reservation workflow, availability, and concurrency testing
- Infrastructure: Docker and Docker Compose for PostgreSQL, Redis, and backend environment setup

## Run Instructions
### Create .env file in project root
```
PORT=5000
DATABASE_URL="postgresql://postgres:password@localhost:5432/ev_charging_db"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="your_jwt_secret"
NODE_ENV="development"
```

### Install dependencies
```
npm install
```

### Terminal 1 
To start PostgreSQL and Redis containers:
```
docker compose up -d
```

To stop containers:
```
docker compose down
```

### Terminal 2
To set up Prisma database:
```
npx prisma generate
npx prisma migrate dev --name init
npm run db:seed
```

To start backend server:
```
npm run dev
```

To stop backend:
```
Ctrl + C
```