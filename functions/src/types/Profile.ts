import {Attachment} from "./Post"

export interface Profile {
  type?: string
  displayName: string
  photo?: Attachment
  photoURL?: string
  searchIndices?: string[]
  text?: string
  attachments?: Attachment[]
}

export interface ProfileRef {
  uid: string
  displayName: string
  photo?: Attachment
}
