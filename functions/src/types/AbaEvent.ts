import {Post, PostRef} from "./Post"
import {ProfileRef} from "./Profile"

export interface AbaEvent extends Post{
  date: number
  endDate?: number
  participants?: ProfileRef[]
  supportedBy?: { name: string, id: string }
}

export interface AbaEventRef extends PostRef{
  date: number
  endDate?: number
}
