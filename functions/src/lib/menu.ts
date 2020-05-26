import * as functions from 'firebase-functions'
import { db } from './db'
import * as admin from 'firebase-admin'
import {DocumentSnapshot} from "firebase-functions/lib/providers/firestore"

type menuDoc = admin.firestore.DocumentData

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

  if (!newDoc) return null

  // CREATE
  if (!oldMenuPath && newMenuPath) {
    return db.doc(newMenuPath).update(newItemFields(itemId, itemType, newDoc))
  }

  // MOVE TO ANOTHER MENU
  if (oldMenuPath !== newMenuPath) {
    const batch = db.batch()
    batch.update(db.doc(oldMenuPath), {[itemPath]: fieldValue.delete()})
    batch.update(db.doc(newMenuPath), newItemFields(itemId, itemType, newDoc))
    return batch.commit()
  }

  // UPDATE
  if (oldDoc) {
    const updatedFields = updatedItemFields(itemPath, itemType, newDoc, oldDoc)
    if (updatedFields) {
      return db.doc(newMenuPath).update(updatedFields)
    }
  }

  return null
}

function menuPath (doc?: menuDoc|null): string {
  if (!doc) return ''
  return doc.status === 'public' || doc.status === 'internal' ? `settings/${doc.status}Menu` : ''
}

function newItemFields (itemId: string, itemType: string, newDoc: menuDoc) {
  const itemPath = `items.${itemId}`
  const newFields = {
    [`${itemPath}.id`]: itemId,
    [`${itemPath}.title`]: newDoc.title,
    [`${itemPath}.type`]: itemType
  }
  if (itemType === 'programme') {
    newFields[`${itemPath}.singlePostLabel`] = newDoc.singlePostLabel
  }
  return newFields
}

function updatedItemFields (itemPath: string, itemType: string, newDoc: menuDoc, oldDoc: menuDoc) {
  const fields: {[k:string]: any} = {}
  if (newDoc.title !== oldDoc.title) {
    fields[`${itemPath}.title`] = newDoc.title
  }
  if (itemType === 'programme' && newDoc.singlePostLabel !== oldDoc.singlePostLabel) {
    fields[`${itemPath}.singlePostLabel`] = newDoc.singlePostLabel
  }
  return Object.keys(fields).length ? fields : null
}
