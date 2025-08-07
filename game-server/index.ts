import path from "path";
import Game from "./game";
import RAPIER from "@dimforge/rapier3d-compat";
import { Worker, parentPort } from "worker_threads";
import { EventTypeMap, type BaseEvent } from "../shared/types";

const redisWorker = new Worker(path.resolve(__dirname, "redis", "index.ts"));

await RAPIER.init();
const game = new Game(publish);

function publish(data: unknown) {
  redisWorker.postMessage(data);
}

parentPort?.on("message", (event: BaseEvent) => {
  switch (event.type) {
    case EventTypeMap.INIT_PLAYER:
      game.spawnPlayer();
      break;
  }
});
