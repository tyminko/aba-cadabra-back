import {AbaEvent, AbaEventRef} from "./AbaEvent"

export interface Programme extends AbaEvent {
  events: AbaEventRef[]
}
