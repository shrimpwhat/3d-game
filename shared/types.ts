export type EventType = 0;

export const EventTypeMap = {
  INIT_PLAYER: 0,
} as const;

export interface BaseEvent {
  type: EventType;
  data: object;
}
