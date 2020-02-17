import * as admin from 'firebase-admin'
import * as functions from 'firebase-functions'
import * as users from './user-functions'

import * as profile from './profile'
import { rootEmail } from '../config'

if (!admin.apps.length) {
  admin.initializeApp()
}

export const add = functions.https.onCall((data, context) => {
  if (!context.auth || context.auth.token.role !== 'admin') {
    throw new functions.https.HttpsError('failed-precondition', 'Unauthorized access.')
  } else {
    return users.add(data)
  }
})

export const update = functions.https.onCall((data, context) => {
  if (!context.auth || context.auth.token.role !== 'admin') {
    throw new functions.https.HttpsError('failed-precondition', 'Unauthorized access.')
  } else {
    return users.update(data)
  }
})

export const get = functions.https.onCall((id, context) => {
  if (!context.auth || context.auth.token.role !== 'admin') {
    throw new functions.https.HttpsError('failed-precondition', 'Unauthorized access.')
  } else {
    return users.get(id)
  }
})

export const all = functions.https.onCall((data, context) => {
  if (!context.auth || context.auth.token.role !== 'admin') {
    throw new functions.https.HttpsError('failed-precondition', 'Unauthorized access.')
  } else {
    return users.all((data||{}).recordsPerPage, (data||{}).nextPageToken)
  }
})

export const remove = functions.https.onCall((id, context) => {
  if (!context.auth || context.auth.token.role !== 'admin') {
    throw new functions.https.HttpsError('failed-precondition', 'Unauthorized access.')
  } else {
    return users.remove(id)
  }
})

export const createProfile = functions.auth.user().onCreate(async user => {
  await profile.create(user)
  if (user.email === rootEmail) {
    return admin.auth().setCustomUserClaims(user.uid, { role: 'admin' })
  }
  return null
})

export const removeProfile = functions.auth.user().onDelete(user => profile.remove(user.uid))
