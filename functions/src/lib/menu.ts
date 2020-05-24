import * as functions from 'firebase-functions'
import { db } from './db'
import * as admin from 'firebase-admin'
import {DocumentSnapshot} from "firebase-functions/lib/providers/firestore"
const fieldValue = admin.firestore.FieldValue

export const syncMenuToProgrammes = functions.firestore
  .document('programmes/{programmeId}')
  .onWrite((change, context) => {
    updateMenu(change, context.params.programmeId, 'programme')
  })

export const syncMenuToPages = functions.firestore
  .document('pages/{pageId}')
  .onWrite((change, context) => {
    updateMenu(change, context.params.pageId, 'programme')
  })

function updateMenu (docChange: functions.Change<DocumentSnapshot>, itemId: string, itemType: string) {
  const oldDoc = docChange.before.exists ? docChange.before.data() : null
  const newDoc = docChange.after.exists ? docChange.after.data() : null

  if (!oldDoc && !newDoc) return

  const oldMenuPath = oldDoc ? `settings/${oldDoc.status}Menu` : ''
  const newMenuPath = newDoc ? `settings/${newDoc.status}Menu` : ''
  const itemPath = `items/${itemId}`

  // CREATE
  if (!oldDoc) {
    return db.doc(newMenuPath).update({ [`${itemPath}/title`]: (newDoc || {}).title, [`${itemPath}/type`]: itemType })
  }

  // DELETE
  if (!newDoc || newDoc.status === 'draft' || newDoc.status === 'trash') {
    return db.doc(oldMenuPath).update({ [itemPath]: fieldValue.delete() })
  }

  // UPDATE
  if (newDoc.status !== oldDoc.status) {
    const batch = db.batch()
    batch.update(db.doc(oldMenuPath), { [itemPath]: fieldValue.delete() })
    batch.update(db.doc(newMenuPath), { [`${itemPath}/title`]: newDoc.title, [`${itemPath}/type`]: itemType })
    return batch.commit()
  }

  if (newDoc.title !== oldDoc.title) {
    return db.doc(newMenuPath).update({ [`${itemPath}/title`]: newDoc.title })
  }

  return null
}
