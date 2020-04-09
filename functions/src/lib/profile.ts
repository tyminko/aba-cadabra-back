import { db } from './db'
import { UserRecord } from 'firebase-functions/lib/providers/auth'
import  * as admin from 'firebase-admin/lib'
import { withUserSearchIndices } from '../config'
import makeSearchIndices from './indices'
import {Profile} from "../types/Profile"

const PATH = 'profiles'

export function create (user: UserRecord) {
  const profileData: Profile = {
    displayName: (user.displayName || user.email) as string,
    photoURL: user.photoURL,
  }
  if ( withUserSearchIndices ) {
    profileData.searchIndices = makeSearchIndices((user.displayName || '').toLocaleLowerCase())
  }
  return db.collection(PATH).doc(user.uid).set(profileData)
}

export async function update (user: UserRecord) {
  const profile: admin.firestore.DocumentReference = db.collection(PATH).doc(user.uid)
  const profileData = await profile.get().then(snap => snap.data())
  const fields: {[k:string]: any} = {}
  if ((profileData || {}).displayName !== user.displayName) {
    fields.displayName = user.displayName
    if (withUserSearchIndices) {
      fields.searchIndices = makeSearchIndices(fields.displayName.toLocaleLowerCase())
    }
  }
  if (withUserSearchIndices &&
    !(profileData || {}).hasOwnProperty('searchIndices') &&
    !fields.hasOwnProperty('searchIndices')){
      fields.searchIndices = makeSearchIndices(fields.displayName.toLocaleLowerCase())
  }
  return Object.keys(fields).length ? profile.update(fields) : null
}

export function remove (id: string): Promise<any> {
  return db.collection(PATH).doc(id).delete()
}
