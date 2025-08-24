import jwt from "@elysiajs/jwt";
import { Elysia, t } from "elysia";
import { sql } from "bun";
import { logger, logRequest } from "./logger";

const APP_SECRET = process.env.APP_SECRET;
if (!APP_SECRET) throw new Error("APP_SECRET env is not set");

new Elysia()
  .use(jwt({ name: "jwt", secret: APP_SECRET }))
  .onError(({ code, error, request, path, set, status }) => {
    if (code === "VALIDATION") logger.debug(error.message);
    else if (code === "NOT_FOUND") {
      logRequest({
        method: request.method,
        route: path,
        status: 404,
      });
    } else {
      logRequest({
        method: request.method,
        route: path,
        status: set.status,
      });
    }
  })
  .post(
    "/login",
    async ({ jwt, body, cookie: { token }, status }) => {
      if (token?.value) return status(403, "Already authenticated");

      const res: string[] =
        await sql`select id, login from users where login = ${body.login}`;
      if (res.length) {
      }
    },
    {
      body: t.Object({ login: t.String() }),
      cookie: t.Cookie({ token: t.Optional(t.String()) }),
    }
  )
  .get("/verifyToken", async ({ jwt, cookie: { token } }) => {
    const res = await jwt.verify(token?.value);
    return Boolean(res);
  })
  .ws("/ws", {
    beforeHandle: ({ cookie, jwt }) => {},
  })
  .listen(3000);
