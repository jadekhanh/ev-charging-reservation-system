# ev-charging-reservation-system
Inspired by Tesla Superchargers, this is scalable backend system for managing EV charging station reservations, real-time charger availability, temporary reservation holds, and concurrent booking workflows. 

The project is built with the following tech stacks: TypeScript, Node.js, Express.js, PostgreSQL, Prisma, Redis, Docker, and RESTful APIs.

Developed by Phuong Khanh Tran

## Features
### User Authentication
- There are 2 types of users: Admin and Customer
- Users registration and login are built with JWT-based authentication and password hasing with bcrypt
#### Admin
- create/update/delete stations
- create/update/delete chargers
- view/update/delete reservations
#### Customer
- view stations, chargers, and availability
- search and hold availability slots
- confirm/view/cancel/delete reservations

### Charging Station Management
- Create and manage EV charging stations
- Configure charger types and charging speeds
- Tracker charger availability and operational status
- Manage station metadata: location, operating hours, charger capacity

### Reservation System
Reservation system support the following features for each customer:
1. Reserve charging time slots
2. Cancel and reschedule reservations
3. View past booking history
4. Prevent double booking conflicts
5. Support temporary reservation holds before confirmation

### Redis-based Concurrency Handling
- Leveraged with Redis, the reservation system supports temporary reservation locking
- Inactive reservation holds (after 5 minutes) automatically expire
- Concurrent users cannot reserve the same charger slot

### Availability & Scheduling
- Query available charging station by: location, date, charger type, time range
- Waitlist support for fully booked time slots

## Design
### Station
Database has 5 stations.

### Users
Database has 1 admin and 5 customers.

### Charger
For each station, database has 3 chargers with the following fields:
#### Connection Type
- NACS
- CCS
#### Power Level
- LEVEL_2
- DC_FAST
#### Status
- AVAILABLE
- IN_USE
- OUT_OF_SERVICE

## Tech Stacks
- RESTful backend architecture using Express.js
- API route organization
- JSON request/response handling
- PostgreSQL relational database schema with the following entities: users, charging stations, reservations, schedules, reservation holds
- Prima ORM for schema handling and database access
- Jest and Supertest for automated API testing to validate the following features: authentication flows, reservation worlflows, authorization permissions, concurrency-safe booking behavior
- Inacteractive API documentation with Swagger/OpenAPI
- Dockerized environment infrastructure for backend API, PostgreSQL, Redis

## Run Instructions
### First-time only setup commands
```
npm install
npx prisma generate
npx prisma migrate dev --name init
```

### Terminal 1: Starts PostgreSQL and Redis
To start:
```
docker compose up -d
```
To end:
```
docker compose down
```

### Terminal 2: Starts Express backend server
To start:
```
npm run dev
```

To end:
Ctrl + C

