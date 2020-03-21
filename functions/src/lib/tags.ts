import {firestore} from 'firebase-functions'
import {withTagSearchIndices} from '../config'
import makeSearchIndices from './indices'

export const onTagCreate = firestore.document('tags/{tagId}')
  .onCreate((snap, context) => {
    const tag = snap.data() || {}
    if (withTagSearchIndices && tag.title) {
      return snap.ref.set({
        searchIndices: makeSearchIndices(tag.title.toLocaleLowerCase())
      }, {merge: true})
    }
    return null
  })
