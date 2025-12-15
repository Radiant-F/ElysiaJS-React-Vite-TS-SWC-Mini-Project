import { Elysia } from "elysia";
import swagger from "@elysiajs/swagger";
import jwt from "@elysiajs/jwt";
import { config } from "./config";
import { ensureSchema } from "./db";
import { authRoutes } from "./routes/authRoutes";
import { userRoutes } from "./routes/userRoutes";
import { todoRoutes } from "./routes/todoRoutes";
import { HttpError } from "./httpError";

await ensureSchema();

const app = new Elysia()
  .use(
    swagger({
      path: "/docs",
      documentation: {
        info: {
          title: "Todo API",
          version: "1.0.0",
        },
      },
    })
  )
  .use(
    jwt({
      name: "accessJwt",
      secret: config.JWT_SECRET,
      exp: config.ACCESS_TOKEN_EXPIRES_IN,
    })
  )
  .use(
    jwt({
      name: "refreshJwt",
      secret: config.REFRESH_TOKEN_SECRET,
      exp: config.REFRESH_TOKEN_EXPIRES_IN,
    })
  )
  .use(
    jwt({
      name: "rememberRefreshJwt",
      secret: config.REFRESH_TOKEN_SECRET,
      exp: config.REMEMBER_REFRESH_TOKEN_EXPIRES_IN,
    })
  )
  .onError(({ error, set }) => {
    if (error instanceof HttpError) {
      set.status = error.status;
      return { message: error.message, code: error.code };
    }
  })
  .get("/", () => ({
    status: "Hey there cutie. Documentation is available at /docs.",
  }))
  .use(authRoutes)
  .use(userRoutes)
  .use(todoRoutes)
  .listen(config.PORT);

console.log(
  `🦊 Elysia todo API running at ${app.server?.hostname}:${app.server?.port}`
);
