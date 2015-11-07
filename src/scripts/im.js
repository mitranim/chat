import _ from 'lodash'
import {storeDispatch, emit, rootRef} from './store'
import {parseError} from './utils'

const chatRef = rootRef.child('chat')

export function transducer (action) {
  const {type, value} = action

  switch (type) {
    case 'sendSequence': {
      return [
        {type: 'patch', value: {sending: true}},
        {type: 'send', value},
        {type: 'patch', value: {sending: false}}
      ]
    }

    case 'send': {
      return new Promise(resolve => {
        chatRef.push(value, err => {
          if (err) {
            resolve({type: 'patch', value: {error: parseError(err)}})
          } else {
            resolve()
            emit('sendSuccess')
          }
          emit('sendDone')
        })
      })
    }

    case 'delete': {
      return new Promise(resolve => {
        chatRef.child(value).remove(err => {
          if (err) {
            resolve({type: 'patch', value: {error: parseError(err)}})
          } else {
            resolve()
          }
        })
      })
    }
  }

  return action
}

/**
 * Loading
 */

chatRef.on('value', snap => {
  const messages = transformMessages(snap.val())
  // Sorted by timestamps.
  const messageIds = _.map(_.sortBy(messages, 'timestamp'), 'id')

  storeDispatch({
    type: 'patch',
    value: {
      messages,
      messageIds,
      messagesReady: true
    }
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
