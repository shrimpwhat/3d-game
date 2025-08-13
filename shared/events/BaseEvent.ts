import type { EventType } from "../types";

export class BaseEvent<T = object> {
  type: EventType;
  data: T;

  constructor(type: EventType, data: T) {
    this.type = type;
    this.data = data;
  }
}
