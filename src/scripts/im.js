import _ from 'lodash'
import {rootRef, emit, parseError} from './utils'

const chatRef = rootRef.child('chat')

export function transducer (action, dispatch) {
  const {type, value} = action

  switch (type) {
    case 'send': {
      return [
        {type: 'patch', value: {sending: true}},
        {type: '_send', value},
        {type: 'patch', value: {sending: false}}
      ]
    }

    case '_send': {
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

    case 'init': {
      chatRef.on('value', snap => {
        const messages = transformMessages(snap.val())
        // Sorted by timestamps.
        const messageIds = _.map(_.sortBy(messages, 'timestamp'), 'id')

        dispatch({
          type: 'patch',
          value: {
            messages,
            messageIds,
            messagesReady: true
          }
        })
      })
      break
    }
  }

  return action
}

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
