migrate-dev:
	pnpm exec  prisma migrate dev
migrate-deploy:
	pnpm exec  prisma migrate deploy
migrate-reset:
	pnpm exec  prisma migrate reset
prisma-generate:
	pnpm exec prisma generate
prod:
	pnpm run build
	pnpm run start
dev:
	pnpm run dev
test:
	pnpm run test
test-coverage:
	pnpm run test -- --coverage
format:
	pnpm run format
