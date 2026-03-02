# Todo CRUD Backend Server
A RESTful CRUD API built with Express.js and TypeScript, using Drizzle ORM + SQLite for persistence and Redis for caching.

_Note 1: I used one of my base express projects to build this API, so eventually it will contain some other features that are not related to the problem description, including loggers and some middlewares to handle common API behavior_
_Note 2: Since the "resource" that the problem mentioned is not proper, so I assumed it as a todo list instead, with all CRUD actions included just like as the requirement_



## Prerequisites

- Redis (optional — app degrades gracefully)
- SQLite (optional, directly installed in the deps). Since its a simple API, apparently.

## Setup

```
yarn install
yarn dev           # auto-migrates on start
```

## API Endpoints

Base URL: `http://localhost:3000`

### Todos CRUD

- `POST /todos`: Create a todo
- `GET /todos`: List todos (filtered)
- `GET /todos/:id`: Get todo details
- `PUT /todos/:id`: Update a todo
- `DELETE /todos/:id`: Delete a todo

Request payload: Check `src/schemas/todo.schema.ts` for more details

### Create Todo

```
curl -X POST http://localhost:3000/todos \
  -H "Content-Type: application/json" \
  -d '{"title": "Buy groceries", "description": "Milk, eggs", "priority": "high", "due_date": "2026-03-05T18:00:00.000Z"}'
```

### List Todos (with filters)

```
curl "http://localhost:3000/todos?status=pending&priority=high&sortBy=due_date&sortOrder=asc"
```                            

### Update Todo

```
curl -X PUT http://localhost:3000/todos/<id> \
  -H "Content-Type: application/json" \
  -d '{"status": "completed"}'
```

### Delete Todo

```
curl -X DELETE http://localhost:3000/todos/<id>
```