import { db } from './db'
import { UserRecord } from 'firebase-functions/lib/providers/auth'
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
  const profile = db.collection(PATH).doc(user.uid)
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
  if (Object.keys(fields).length) {
    return profile.update(fields).then(() => {
      if (fields.displayName) {
        return updateAuthors(user.uid, fields.displayName)
      }
      return null
    })
  }
  return null
}

export function remove (id: string): Promise<any> {
  return db.collection(PATH).doc(id).delete()
}

async function updateAuthors (uid: string, displayName: string) {
  const batch = db.batch()
  await db.collection('posts').where('author.uid', '==', uid)
    .get()
    .then(snapshot => {
      snapshot.forEach(doc => {
        batch.update(db.collection('posts').doc(doc.id), { 'author.displayName': displayName })
      })
    })
  return batch.commit()
}
