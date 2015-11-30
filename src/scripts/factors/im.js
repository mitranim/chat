import _ from 'lodash'
import Firebase from 'firebase'
import {multimatch, match, pipe} from 'prax'
import {rootRef, parseError} from '../utils'

const chatRef = rootRef.child('chat')

export default (read, send) => pipe(
  multimatch('init', next => msg => {
    next(msg)

    chatRef.on('value', snap => {
      const messages = transformMessages(snap.val())
      // Sorted by timestamps.
      const messageIds = _.map(_.sortBy(messages, 'timestamp'), 'id')

      send({
        type: 'patch',
        value: {
          messages,
          messageIds,
          messagesReady: true
        }
      })
    })
  }),

  match('send', () => {
    const input = messageInput()
    if (!input) return
    const value = input.value.trim()
    if (!value) return
    const auth = read('auth')
    if (!auth) return

    send({
      type: 'send',
      value: {
        userId: auth.uid,
        authorName: auth.fullName,
        body: value,
        timestamp: Firebase.ServerValue.TIMESTAMP
      }
    })
  }),

  match({type: 'send'}, ({value}) => {
    send({type: 'patch', value: {sending: true}})

    chatRef.push(value, err => {
      if (err) {
        send({type: 'patch', value: {error: parseError(err)}})
      } else {
        send('send/success')
      }
      send('send/done')
    })
  }),

  match('send/success', () => {
    if (messageInput()) messageInput().value = ''
  }),

  match('send/done', () => {
    send({type: 'patch', value: {sending: false}})
    window.requestAnimationFrame(() => {
      if (messageInput()) messageInput().focus()
    })
  }),

  match({type: 'delete', id: Boolean}, ({id}) => {
    chatRef.child(id).remove(err => {
      if (err) {
        send({type: 'patch', value: {error: parseError(err)}})
      }
    })
  })
)

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

function messageInput () {
  return document.querySelector('#messageInput')
}
