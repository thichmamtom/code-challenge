# Todo CRUD Backend Server
A RESTful CRUD API built with Express.js and TypeScript, using Drizzle ORM + PostgreSQL for persistence and Redis for caching.

_Note 1: I used one of my base express projects to build this API, so eventually it will contain some other features that are not related to the problem description, including loggers and some middlewares to handle common API behavior_
_Note 2: Since the "resource" that the problem mentioned is not proper, so I assumed it as a todo list instead, with all CRUD actions included just like as the requirement_

## Prerequisites

- **PostgreSQL** — running instance (default: `localhost:5432`), with database created
- Redis (optional — app degrades gracefully)

## Setup

```bash
yarn install
yarn db:push        # sync schema to database
yarn dev            # start dev server
```

### Environment Variables

Copy `.env.example` to `.env` and adjust as needed:

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3000` | Server port |
| `DATABASE_URL` | `postgres://postgres:postgres@localhost:5432/problem5` | PostgreSQL connection string to the created database |
| `REDIS_URL` | `redis://localhost:6379` | Redis connection string |
| `NODE_ENV` | `development` | Environment |

### Database Migrations

```bash
yarn db:push        # Push schema directly to DB (fast, for development)
yarn db:generate    # Generate SQL migration files from schema changes

yarn db:migrate     # Apply generated migration files (for production)
```

## API Endpoints

Base URL: `http://localhost:3000`

### Todos CRUD

- `POST /api/todos`: Create a todo
- `GET /api/todos`: List todos (filtered)
- `GET /api/todos/:id`: Get todo details
- `PUT /api/todos/:id`: Update a todo
- `DELETE /api/todos/:id`: Delete a todo

Request payload: Check `src/schemas/todo.schema.ts` for more details

### Create Todo

```
curl -X POST http://localhost:3000/api/todos \
  -H "Content-Type: application/json" \
  -d '{"title": "Buy groceries", "description": "Milk, eggs", "priority": "high", "due_date": "2026-03-05T18:00:00.000Z"}'
```

### List Todos (with filters)

```
curl "http://localhost:3000/api/todos?status=pending&priority=high&sortBy=due_date&sortOrder=asc"
```                            

### Update Todo

```
curl -X PUT http://localhost:3000/api/todos/<id> \
  -H "Content-Type: application/json" \
  -d '{"status": "completed"}'
```

### Delete Todo

```
curl -X DELETE http://localhost:3000/api/todos/<id>
```