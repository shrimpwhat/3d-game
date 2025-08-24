import type { StatusMap } from "elysia";
import { isProduction } from "elysia/error";
import pino from "pino";

export const logger = pino({
  level: isProduction ? "info" : "trace",
  transport: isProduction ? undefined : { target: "pino-pretty" },
});

export function logRequest({
  method,
  route,
  status,
  body,
}: {
  method: string;
  route: string;
  status?: keyof StatusMap | number;
  body?: unknown;
}) {
  logger.error(method + " " + status + " " + route);
  if (body) {
    logger.debug(body);
  }
}
