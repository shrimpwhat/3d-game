import path from "path";
import Game from "./game";
import RAPIER from "@dimforge/rapier3d-compat";
import { EventTypeMap, type GameEvent } from "../shared/types";
import type { MessageEvent } from "bun";

declare const self: Worker;

const redisWorker = new Worker(path.resolve(__dirname, "redis", "index.ts"), {
  smol: true,
});

await RAPIER.init();
const game = new Game(publish);

function publish(data: unknown) {
  redisWorker.postMessage(data);
}

self.onmessage = ({ data: { type, data } }: MessageEvent<GameEvent>) => {
  switch (type) {
    case EventTypeMap.SPAWN_PLAYER:
      game.spawnPlayer(data);
      break;
    case EventTypeMap.PLAYER_MOVE:
      game.spawnPlayer(data);
      break;
  }
};
