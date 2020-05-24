import { db } from './db'
import { UserRecord } from 'firebase-functions/lib/providers/auth'
import { withUserSearchIndices } from '../config'
import makeSearchIndices from './indices'
import {Profile} from '../types/Profile'

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
  const oldName = (profileData || {}).displayName || ''
  const newName = user.displayName || ''

  const fields: {[k:string]: any} = {}

  if (newName !== oldName) {
    fields.displayName = newName
    if (withUserSearchIndices) {
      fields.searchIndices = makeSearchIndices(fields.displayName.toLocaleLowerCase())
    }
  } else if (withUserSearchIndices && !(profileData || {}).hasOwnProperty('searchIndices')) {
    fields.searchIndices = makeSearchIndices(fields.displayName.toLocaleLowerCase())
  }

  if (Object.keys(fields).length) {
    if (newName !== oldName) {
      let batch = db.batch()
      batch.update(profile, fields)
      batch = await updateAuthors(user.uid, newName, batch)
      batch = await updateNameInReferences('posts', 'participants', user.uid, newName, oldName, batch)
      batch = await updateNameInReferences('pages', 'relatedPeople', user.uid, newName, oldName, batch)
      return batch.commit()
    } else {
      return profile.update(fields)
    }
  }
  return null
}

export function remove (id: string): Promise<any> {
  return db.collection(PATH).doc(id).delete()
}

export async function updateAuthors (
  uid: string,
  displayName: string,
  batch: FirebaseFirestore.WriteBatch) : Promise<FirebaseFirestore.WriteBatch>
{
  await db.collection('posts').where('author.uid', '==', uid)
    .get()
    .then(snapshot => {
      snapshot.forEach(doc => {
        batch.update(db.collection('posts').doc(doc.id), { 'author.displayName': displayName })
      })
    })
  return batch
}

export async function updateNameInReferences (
  collectionName: string,
  fieldName: string,
  uid: string,
  newName: string,
  oldName: string,
  batch: FirebaseFirestore.WriteBatch) : Promise<FirebaseFirestore.WriteBatch>
{
  const collectionRef = db.collection(collectionName)
  await collectionRef
    .where(fieldName, 'array-contains', { id: uid, displayName: oldName })
    .get()
    .then(snapshot => {
      snapshot.forEach(doc => {
        const data = doc.data()
        const index = data[fieldName].findIndex((item: {id: string}) => item.id === uid)
        if (index > -1) {
          const fieldValue = [...data[fieldName]]
          fieldValue[index] = { id: uid, displayName: newName }
          batch.update(collectionRef.doc(doc.id), { [fieldName]: fieldValue })
        }
      })
    })
  return batch
}
