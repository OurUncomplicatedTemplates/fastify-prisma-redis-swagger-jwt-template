## API documentation (Swagger)
Open [http://localhost:3000/api/docs](http://localhost:3000/api/docs) to view it in the browser.

## Available Scripts

In the project directory, you can run:

### `npm run dev`

To start the app in dev mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### `npm start`

For production mode

### `npm run test`

Run the test cases.

### `npx prisma generate`

Generate/regenerate the prisma client. This should be done after changing the prisma schema.

### `npm run migrate:dev`

Migrate the prisma schema to the database and test database. This should only be run in the dev environment.

### `npx prisma migrate reset`

Clears the database and applies migrations. This should only be run in the dev environment.

### `npx prisma migrate deploy`

Deploys the pending migrations to the databases.

## Learn More

To learn Fastify, check out the [Fastify documentation](https://www.fastify.io/docs/latest/).
