import * as functions from 'firebase-functions'
import * as feed from "./feed-functions"

const POST_PATH = 'post/{id}'
const POST_PREFIX = 'p-'
const EVENT_PATH = 'events/{id}'
const EVENT_PREFIX = 'e-'
const SALON_PATH = 'salons/{id}'
const SALON_PREFIX = 's-'
const PROG_PATH = 'programme/{id}'
const PROG_PREFIX = 'pr-'

// POST
export const createPost = functions.firestore.document(POST_PATH).onCreate(snapshot => {
  return feed.setFeedRecord(feed.makePostRef(snapshot.data(), snapshot.id), POST_PREFIX + snapshot.id)
})

export const updatePost = functions.firestore.document(POST_PATH).onUpdate(change => {
  return feed.setFeedRecord(feed.makePostRef(change.after.data(), change.after.id), POST_PREFIX + change.after.id)
  // const diff = feed.postRefDiff(change.before.data(), change.after.data())
  // return Object.keys(diff).length ? feed.updateFeedRecord(diff, prefix + change.after.id) : null
})

export const deletePost = functions.firestore.document(POST_PATH).onDelete(snapshot => {
  return feed.deleteFeedRecord(POST_PREFIX + snapshot.id)
})

// EVENT
export const createEvent = functions.firestore.document(EVENT_PATH).onCreate(snapshot => {
  return feed.setFeedRecord(feed.makeEventRef(snapshot.data(), snapshot.id), EVENT_PREFIX + snapshot.id)
})

export const updateEvent = functions.firestore.document(EVENT_PATH).onUpdate(change => {
  return feed.setFeedRecord(feed.makeEventRef(change.after.data(), change.after.id), EVENT_PREFIX + change.after.id)
  // return feed.updateEventOrProgramme(change, prefix)
})

export const deleteEvent = functions.firestore.document(EVENT_PATH).onDelete(snapshot => {
  return feed.deleteFeedRecord(EVENT_PREFIX + snapshot.id)
})

// SALON
export const createSalon = functions.firestore.document(SALON_PATH).onCreate(snapshot => {
  return feed.setFeedRecord(feed.makeSalonRef(snapshot.data(), snapshot.id), SALON_PREFIX + snapshot.id)
})

export const updateSalon = functions.firestore.document(SALON_PATH).onUpdate(change => {
  return feed.setFeedRecord(feed.makeSalonRef(change.after.data(), change.after.id), SALON_PREFIX + change.after.id)
  // const diff = feed.salonRefDiff(change.before.data(), change.after.data())
  // return Object.keys(diff).length ? feed.updateFeedRecord(diff, prefix + change.after.id) : null
})

export const deleteSalon = functions.firestore.document(SALON_PATH).onDelete(snapshot => {
  return feed.deleteFeedRecord(SALON_PREFIX + snapshot.id)
})

// PROGRAMME
export const createProgramme = functions.firestore.document(PROG_PATH).onCreate(snapshot => {
  return feed.setFeedRecord(feed.makeProgrammeRef(snapshot.data(), snapshot.id), PROG_PREFIX + snapshot.id)
})

export const updateProgramme = functions.firestore.document(PROG_PATH).onUpdate(change => {
  return feed.setFeedRecord(feed.makeProgrammeRef(change.after.data(), change.after.id), PROG_PREFIX + change.after.id)
  // return feed.updateEventOrProgramme(change, prefix)
})

export const deleteProgramme = functions.firestore.document(PROG_PATH).onDelete(snapshot => {
  return feed.deleteFeedRecord(PROG_PREFIX + snapshot.id)
})
