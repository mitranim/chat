import _ from 'lodash'
import Firebase from 'firebase'
import {rootRef, parseError} from '../utils'
import {read, set, patch, match} from '../core'

const chatRef = rootRef.child('chat')

match('init', () => {
  chatRef.on('value', snap => {
    const messages = transformMessages(snap.val())
    // Sorted by timestamps.
    const messageIds = _.map(_.sortBy(messages, 'timestamp'), 'id')

    patch([], {
      messages,
      messageIds,
      messagesReady: true
    })
  })
})

match('chat/send', () => {
  const text = read('chat', 'text').trim()
  if (!text) return
  const auth = read('auth')
  if (!auth) return

  set(['chat', 'sending'], true)

  const msg = {
    userId: auth.uid,
    authorName: auth.fullName,
    body: text,
    timestamp: Firebase.ServerValue.TIMESTAMP
  }

  chatRef.push(msg, err => {
    set(['chat', 'sending'], false)
    if (err) set(['chat', 'error'], parseError(err))
    else set(['chat', 'text'], '')
  })
})

match({type: 'chat/delete', id: Boolean}, ({id}) => {
  chatRef.child(id).remove(err => {
    if (err) set(['chat', 'error'], parseError(err))
  })
})

/**
 * Utils
 */

// Adds IDs and image URLs to messages.
function transformMessages (messages) {
  return _.mapValues(messages, (message, id) => ({
    ...message,
    id,
    // Find links to images, if any.
    imageUrls: typeof message.body === 'string' ?
               message.body.match(/https?:\/\/\S+\.(?:jpg|jpeg|png|gif|bmp)/ig) : []
  }))
}
