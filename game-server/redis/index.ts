import { createClient } from "redis";
import { parentPort } from "worker_threads";
import { type BaseEvent } from "../../shared/types";

const publisher = createClient({ url: "redis://localhost:6379" });
const subscriber = createClient({ url: "redis://localhost:6379" });

await publisher.connect();
await subscriber.connect();

parentPort?.on("message", (payload) => {
  publisher.publish("server-events", JSON.stringify(payload));
});

subscriber.subscribe("client-events", (message) => {
  try {
    const payload: BaseEvent = JSON.parse(message);
    parentPort?.postMessage(payload);
  } catch {}
});
