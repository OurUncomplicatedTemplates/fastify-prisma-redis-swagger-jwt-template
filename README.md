# Project

[![Coverage Status](https://frederikpyt.github.io/fastify-prisma-redis-swagger-jwt-template/badge.svg)](https://frederikpyt.github.io/fastify-prisma-redis-swagger-jwt-template)

## API documentation (Swagger)

Open [http://localhost:3000/api/docs](http://localhost:3000/api/docs) to view it in the browser.

## Available Scripts

In the project directory, you can run:

### `make dev` 

To start the app in dev mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### `make prod`

Build & runs production.

### `make test`

Run the test cases.

### `make test-coverage`

Run the test cases with code coverage.

### `make prisma-generate`

Generate/regenerate the prisma client. This should be done after changing the prisma schema.

### `make migrate-dev`

Migrate the prisma schema to the database and test database. This should only be run in the dev environment.

### `make migrate-reset`

Clears the database and applies migrations. This should only be run in the dev environment.

### `make migrate-deploy`

Deploys the pending migrations to the databases.

## Learn More

To learn Fastify, check out the [Fastify documentation](https://www.fastify.io/docs/latest/).
