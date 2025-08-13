import { PlayerMoveEvent } from "./PlayerMoveEvent";
import { PlayerSpawnEvent } from "./PlayerSpawnEvent";
import { SnapshotEvent } from "./SnapshotEvent";

export * from "./BaseEvent";

export type GameEvent = PlayerMoveEvent | PlayerSpawnEvent | SnapshotEvent;

export { PlayerMoveEvent, PlayerSpawnEvent, SnapshotEvent };
