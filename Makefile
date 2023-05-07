migrate-dev:
	npx prisma migrate:dev
migrate-deploy:
	npx prisma migrate deploy
migrate-reset:
	npx prisma migrate reset
prisma-generate:
	npx prisma generate
prod:
	npm run build
	npm run start
dev:
	npm run dev
test:
	npm run test
test-coverage:
	npm run test -- --coverage
