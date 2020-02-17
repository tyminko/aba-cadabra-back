import {AbaEvent, AbaEventRef} from "./AbaEvent"

export interface Salon extends AbaEvent {
  countNumber: number | string
}

export interface SalonRef extends AbaEventRef {
  countNumber: number | string
}
