# Copilot Instructions

- **Stack**: Bun + Elysia HTTP API with Postgres via `postgres` client; bootstrap in [../src/index.ts](../src/index.ts) and schema creation in [../src/db.ts](../src/db.ts).
- **Swagger**: OpenAPI UI served at `/docs` from [../src/index.ts](../src/index.ts); keep docs accurate when adding routes.
- **Env config**: Validated with zod in [../src/config.ts](../src/config.ts); required vars include `DATABASE_URL`, `JWT_SECRET`, `REFRESH_TOKEN_SECRET`; defaults for `PORT` (3000), access/refresh expiries.
- **DB bootstrap**: Local helper script [../scripts/create_db.sql](../scripts/create_db.sql) creates `elysia_todo` DB/role; app auto-creates tables on start via `ensureSchema()` in [../src/db.ts](../src/db.ts).
- **Data model**: Tables `users` and `todos` with timestamps; todos reference users and index on `user_id`.
- **Running**: `bun run dev` for watch mode; `bun run src/index.ts` for prod-like start; `bun test` for unit tests (see package.json scripts).
- **Auth tokens**: Three JWT issuers in [../src/index.ts](../src/index.ts) (`accessJwt`, `refreshJwt`, `rememberRefreshJwt`) using @elysiajs/jwt; access token protects routes, refresh tokens carry a random `token` value.
- **Access control**: `requireUser()` in [../src/authGuard.ts](../src/authGuard.ts) expects `Authorization: Bearer <access token>`, verifies against DB, throws `HttpError` on failure.
- **Auth flows**: Registration/login/refresh/logout live in [../src/routes/authRoutes.ts](../src/routes/authRoutes.ts); refresh compares hashed refresh token in DB via bcrypt helpers in [../src/security.ts](../src/security.ts), issues new access+refresh pair, and handles long-lived remember-me tokens.
- **User routes**: `/me` prefixed endpoints in [../src/routes/userRoutes.ts](../src/routes/userRoutes.ts) read/update/delete the current user; email uniqueness enforced; password change nulls stored refresh token hash.
- **Todo routes**: CRUD under `/todos` in [../src/routes/todoRoutes.ts](../src/routes/todoRoutes.ts); all operations scoped to the authenticated user and return 403 if IDs mismatch.
- **Validation**: Request schemas defined with `t.Object` in route files; prefer reusing this style when adding endpoints. Use `Static<typeof schema>` for typed bodies/queries.
- **Domain rule**: `validateTodoPatch()` in [../src/todoRules.ts](../src/todoRules.ts) forbids editing title/description of completed todos unless unchecking; `applyTodoPatch()` updates `updatedAt` and enforces rule—reuse for business logic changes.
- **Persistence pattern**: Repos in [../src/repositories](../src/repositories) use tagged-template SQL with camel-case transforms; update helpers build dynamic `SET` clauses and return full records. Maintain this style for new queries.
- **Errors**: Throw `HttpError` or `assert()` from [../src/httpError.ts](../src/httpError.ts); `onError` hook in [../src/index.ts](../src/index.ts) serializes `{message, code}` and sets status—prefer this over generic errors.
- **Types**: Shared shapes in [../src/types.ts](../src/types.ts) for `UserRecord`, `TodoRecord`, `Pagination`; keep in sync with SQL selections.
- **Passwords/tokens**: Hashing and comparison via bcrypt wrappers in [../src/security.ts](../src/security.ts); refresh tokens store only hashes in DB.
- **Pagination**: Todo list honors `limit` (capped at 50) and `offset` query params; return payload includes `items` and `pagination` counts.
- **Testing**: Existing unit tests cover security and todo rules in [../src/__tests__](../src/__tests__); add similar Bun tests when adjusting domain logic or hashing.
- **Conventions**: Prefer throwing `HttpError` for client errors (400/401/403/404/409), validate inputs with `t.Object`, and keep response shapes simple objects (no envelopes beyond necessary fields).
- **Observability**: Startup logs service host/port in [../src/index.ts](../src/index.ts); no other logging—add minimal, structured logs if needed.
- **Docs updates**: When adding/altering routes, ensure request/response schemas and swagger metadata reflect changes so `/docs` stays accurate.

Feedback welcome—tell me if any sections need clarification or if a key workflow is missing.
