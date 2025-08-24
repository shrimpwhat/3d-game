import { createClient } from "redis";

declare const self: Worker;

const publisher = createClient({ url: "redis://localhost:6379" });
const subscriber = createClient({ url: "redis://localhost:6379" });

await publisher.connect();
await subscriber.connect();

self.onmessage = ({ data }) => {
  console.log(data);
  publisher.publish("server-events", JSON.stringify(data));
};

subscriber.subscribe("client-events", (message) => {
  try {
    const payload = JSON.parse(message);
    postMessage(payload);
  } catch {}
});
