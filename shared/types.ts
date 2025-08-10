type Vector3 = { x: number; y: number; z: number };
type Vector4 = Vector3 & { w: number };

export type EventType = 0 | 1;

export const EventTypeMap = {
  SPAWN_PLAYER: 0,
  PLAYER_MOVE: 1,
} as const;

export interface BaseEvent {
  type: EventType;
  data: any;
}

export interface SpawnPlayerEvent extends BaseEvent {
  type: 0;
  data: { id: string };
}

export interface PlayerMoveEvent extends BaseEvent {
  type: 1;
  data: {
    id: string;
    velocity: Vector3;
    rotation: Vector4;
  };
}

export type GameEvent = SpawnPlayerEvent | PlayerMoveEvent;
