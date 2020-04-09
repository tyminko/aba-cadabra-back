import * as admin from 'firebase-admin'
import * as functions from 'firebase-functions'
import * as profile from './profile'

import {UserData} from '../types/UserData'
import {UserRecord} from 'firebase-functions/lib/providers/auth'

interface Claims {
  role: string
}

if (!admin.apps.length) {
  admin.initializeApp()
}

const userFields = [
  'displayName',
  'email',
  'password',
  'phoneNumber',
  'photoURL',
  'emailVerified',
  'disabled'
]

export async function add(data: { [k: string]: any }) {
  if (!data.email) {
    throw new functions.https.HttpsError('invalid-argument', 'Required filed (Email) is empty.')
  }
  if (!data.password) {
    throw new functions.https.HttpsError('invalid-argument', 'Required filed (Password) is empty.')
  }

  const dataToAdd = parseUserFields(data)
  const userRecord = await admin.auth().createUser(dataToAdd)
  if (data.role) {
    await admin.auth().setCustomUserClaims(userRecord.uid, {role: data.role})
  }
  return userDataFromRecord(userRecord, data.role)
}

export async function update(data: { [k: string]: any }) {
  if (!data.id) {
    throw new functions.https.HttpsError('invalid-argument', 'Required user ID.')
  }
  const fieldsToUpdate = parseUserFields(data)
  if (objectIsEmpty(fieldsToUpdate)) {
    throw new functions.https.HttpsError('invalid-argument', 'No fields to update.')
  }
  const user = await admin.auth().updateUser(data.id, fieldsToUpdate)
  if (data.role) {
    await admin.auth().setCustomUserClaims(data.id, {role: data.role})
  }
  await profile.update(user)
  return userDataFromRecord(user, data.role)
}

export async function get(id: string) {
  try {
    const user = await admin.auth().getUser(id)
    return userDataFromRecord(user, '')
  } catch (error) {
    return {error}
  }
}

export function remove(id: string) {
  return admin.auth().deleteUser(id)
    .then(() => true)
    .catch(error => ({error}))
}

export async function all(recordsPerPage?: number, nextPageToken?: string) {
  try {
    const list = await admin.auth().listUsers(recordsPerPage, nextPageToken)
    return Array.from(list.users).map(record => {
      const claims = (record.customClaims || {}) as Claims
      return userDataFromRecord(record, claims.role || '')
    })
  } catch (error) {
    return {error}
  }
}

function parseUserFields(data: { [k: string]: any }) {
  return userFields.reduce((res: { [k: string]: any }, field) => {
    if (data[field]) res[field] = data[field]
    return res
  }, {})
}

function objectIsEmpty(o: Object) {
  return Object.keys(o).length === 0
}

function userDataFromRecord(record: UserRecord, role: string): UserData {
  const {uid, displayName, email, emailVerified, phoneNumber, photoURL, disabled} = record
  return {uid, displayName, email, emailVerified, phoneNumber, photoURL, disabled, role}
}
