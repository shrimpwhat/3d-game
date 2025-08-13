export type Vector3 = { x: number; y: number; z: number };
export type Vector4 = Vector3 & { w: number };

export type EventType = 0 | 1 | 2;

export const EventTypeMap = {
  SPAWN_PLAYER: 0,
  PLAYER_MOVE: 1,
  SNAPSHOT_EVENT: 2,
} as const;

export interface Entity {
  id: string;
  position: Vector3;
  velocity: Vector3;
  rotation: Vector4;
}
