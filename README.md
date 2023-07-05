1. start up with docker compose in supabase directory
2. pnpm install
3. config .env
4. run database migration with `npx prisma db push`
5. run command to generate database type with
   `npx supabase gen types typescript --db-url "postgresql://supabase_admin:your-super-secret-and-long-postgres-password@localhost:5432/postgres?schema=public&pgbouncer=true" --schema public > supabase/types.ts`
6. pnpm dev
