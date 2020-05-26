import * as functions from 'firebase-functions'
import { db } from './db'
import * as admin from 'firebase-admin'
import {DocumentSnapshot} from "firebase-functions/lib/providers/firestore"

const fieldValue = admin.firestore.FieldValue

export const syncToProgrammes = functions.firestore
  .document('programmes/{programmeId}')
  .onWrite((change, context) => {
    return updateMenu(change, context.params.programmeId, 'programme')
  })

export const syncToPages = functions.firestore
  .document('pages/{pageId}')
  .onWrite((change, context) => {
    return updateMenu(change, context.params.pageId, 'page')
  })

function updateMenu (docChange: functions.Change<DocumentSnapshot>, itemId: string, itemType: string) {
  const oldDoc = docChange.before.exists ? docChange.before.data() : null
  const newDoc = docChange.after.exists ? docChange.after.data() : null

  const oldMenuPath = menuPath(oldDoc)
  const newMenuPath = menuPath(newDoc)

  if(!oldMenuPath && !newMenuPath) return null

  const itemPath = `items.${itemId}`

  // DELETE
  if (!newMenuPath && oldMenuPath) {
    return db.doc(oldMenuPath).update({ [itemPath]: fieldValue.delete() })
  }
  if (newDoc) {
    // CREATE
    if (!oldMenuPath && newMenuPath) {
      return db.doc(newMenuPath).update({
        [`${itemPath}.id`]: itemId,
        [`${itemPath}.title`]: newDoc.title,
        [`${itemPath}.type`]: itemType
      })
    }

    // UPDATE
    if (oldMenuPath !== newMenuPath) {
      const batch = db.batch()
      batch.update(db.doc(oldMenuPath), {[itemPath]: fieldValue.delete()})
      batch.update(db.doc(newMenuPath), {[`${itemPath}.title`]: newDoc.title, [`${itemPath}.type`]: itemType})
      return batch.commit()
    }

    if (oldDoc && newDoc.title !== oldDoc.title) {
      return db.doc(newMenuPath).update({[`${itemPath}.title`]: newDoc.title})
    }
  }

  return null
}

function menuPath (doc?: admin.firestore.DocumentData|null): string {
  if (!doc) return ''
  return doc.status === 'public' || doc.status === 'internal' ? `settings/${doc.status}Menu` : ''
}
