import {ProfileRef} from "./Profile"

export interface AttachmentPointer {
  url: string
  dimensions?: {}
}

export interface Attachment {
  type: string
  caption?: string
  srcSet: {
    full?: AttachmentPointer
    preview?: AttachmentPointer
    original?: AttachmentPointer
  }
}

export interface Post {
  author: ProfileRef
  title: string
  content: string
  excerpt?: string
  created: number
  modified: number
  status: string
  thumbnail?: string
  attachments?: {[k: string]: Attachment}
  date?: number
  endDate?: number
  participants?: ProfileRef[]
  countNumber?: number | string
}

export interface PostRef {
  postId: string
  postType: string,
  status?: string
  author?: ProfileRef
  title?: string
  excerpt?: string
  thumbnail?: Attachment
  date?: number
  endDate?: number
  participants?: ProfileRef[]
  countNumber?: number | string
}
