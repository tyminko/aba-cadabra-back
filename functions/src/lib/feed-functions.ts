import {db} from "./db"
import {Change} from "firebase-functions/lib/cloud-functions"
import {DocumentSnapshot} from "firebase-functions/lib/providers/firestore"
import {Attachment, PostRef} from "../types/Post"
import {AbaEventRef} from "../types/AbaEvent"
import {SalonRef} from "../types/Salon"

export function updateEventOrProgramme (change:Change<DocumentSnapshot>, pr: string) {
  const diff = eventRefDiff(change.before.data(), change.after.data())
  return Object.keys(diff).length ? updateFeedRecord(diff, pr + change.after.id) : null
}

export function makePostRef ( post: FirebaseFirestore.DocumentData|undefined, id: string): PostRef|null {
  if (!post) return null
  const ref: PostRef = {
    postId: id,
    postType: post.type || 'post',
  }
  if (post.date || post.endDate) {
    ref.date = post.date || post.endDate
  } else {
    ref.date = post.created || new Date().getTime()
  }
  if (post.status) ref.status = post.status
  if (post.author) ref.author = post.author
  if (post.countNumber) ref.countNumber = post.countNumber
  if (post.title) ref.title = post.title
  if (post.excerpt) ref.excerpt = post.excerpt
  if (post.attachments) {
    if (post.thumbnail && post.attachments.hasOwnProperty(post.thumbnail)) {
      ref.thumbnail = post.attachments[post.thumbnail]
    } else {
      const firstVisualAttachment = Object.values(post.attachments as {[k: string]: Attachment}).find(attachment => {
        return (attachment.type || '').startsWith('image/') ||
          attachment.srcSet.hasOwnProperty('full') ||
          attachment.srcSet.hasOwnProperty('preview')
      })
      if (firstVisualAttachment) {
        ref.thumbnail = firstVisualAttachment
      }
    }
  }
  return ref
}

export function makeEventRef ( post: FirebaseFirestore.DocumentData|undefined, id: string): AbaEventRef|null {
  if (!post) return null
  const eventRef = makePostRef(post, id) as AbaEventRef
  if (!eventRef) return null
  eventRef.postType = 'event'
  if (post.status) eventRef.status = post.status
  return eventRef
}

export function makeSalonRef ( post: FirebaseFirestore.DocumentData|undefined, id: string): SalonRef|null {
  if (!post) return null
  const salonRef = makeEventRef(post, id) as SalonRef
  if (!salonRef) return null
  salonRef.postType = 'salon'
  if (post.countNumber) salonRef.countNumber = post.countNumber
  return salonRef
}

export function makeProgrammeRef ( post: FirebaseFirestore.DocumentData|undefined, id: string): AbaEventRef|null {
  if (!post) return null
  const progRef = makeEventRef(post, id)
  if (!progRef) return null
  progRef.postType = 'programme'
  return progRef
}

export function postRefDiff (
  before: FirebaseFirestore.DocumentData|undefined,
  after: FirebaseFirestore.DocumentData|undefined
): PostRef|{} {
  return getDifference((before || {}), (after || {}), ['author', 'title', 'excerpt', 'thumbnail', 'status', 'date'])
}

export function eventRefDiff (
  before: FirebaseFirestore.DocumentData|undefined,
  after: FirebaseFirestore.DocumentData|undefined
): AbaEventRef|{} {
  return getDifference((before || {}), (after || {}), ['date', 'endDate'], postRefDiff(before, after))
}

export function salonRefDiff (
  before: FirebaseFirestore.DocumentData|undefined,
  after: FirebaseFirestore.DocumentData|undefined
): SalonRef|{} {
  return getDifference((before || {}), (after || {}), ['countNumber'], eventRefDiff(before, after))
}

export function getDifference (
  before: FirebaseFirestore.DocumentData,
  after: FirebaseFirestore.DocumentData,
  propsToCheck: string[],
  diff?: {[k:string]:any}): {[k:string]:any} {

  return (propsToCheck).reduce((res, key): any => {
    if (after[key] !== before[key]) res[key] = after[key]
    return res
  }, diff || {})
}

export const setFeedRecord = (postRef: any, id: string) => {
  return db.collection('feed').doc(id).set(postRef)
}
export const updateFeedRecord = (postRef: any, id: string) => {
  return db.collection('feed').doc(id).update(postRef)
}
export const deleteFeedRecord = (id: string) => {
  return db.collection('feed').doc(id).delete()
}
