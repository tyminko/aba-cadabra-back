import {ProfileRef} from "./Profile"

export interface AttachmentPointer {
  url: string
  dimensions?: {}
}

export interface Attachment {
  mime?: string
  caption?: string
  full?: AttachmentPointer
  preview?: AttachmentPointer
  original?: AttachmentPointer
}

export interface Post {
  author: ProfileRef
  title: string
  content: string
  excerpt?: string
  created: number
  modified: number
  status: string
  thumbnail?: Attachment
  gallery?: {[k: string]: Attachment}
  attachments?: {[k: string]: Attachment}
}

export interface PostRef {
  postId: string
  postType: string,
  author?: ProfileRef
  title?: string
  excerpt?: string
  thumbnail?: Attachment
  date?: number
  status?: string
}
