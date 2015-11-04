import _ from 'lodash'
import Firebase from 'firebase'
import {createSignals, createDecorator} from 'symphony'
import {dispatch} from './store'
export * from './store'

/**
 * Published signals
 */

export const signals = createSignals(dispatch, {  // eslint-disable-line
  set (action, out) {
    out({type: 'set', ...action})
  },
  patch (action, out) {
    out({type: 'patch', ...action})
  },
  send: {success: {}},
  delete: {},
  logout: {},
  login: {twitter: {}, facebook: {}}
})

/**
 * Subscriptions
 */

const rootRef = new Firebase('https://incandescent-torch-3438.firebaseio.com')
const chatRef = rootRef.child('chat')

/**
 * Auth
 */

rootRef.onAuth(authData => {
  // Regard 'anonymous' as not logged in.
  if (authData && authData.provider === 'anonymous') authData = null
  dispatch({
    type: 'patch',
    value: {
      auth: transformAuthData(authData),
      authReady: true
    }
  })
})

function transformAuthData (data) {
  if (data) {
    const details = data[data.provider]
    data.fullName = details && details.displayName || ''
  }
  return data
}

signals.logout.subscribe(() => {rootRef.unauth()})

signals.login.twitter.subscribe((x, out) => {
  out(new Promise((resolve, reject) => {
    rootRef.authWithOAuthRedirect('twitter', err => {
      if (err) reject(err)
      else resolve()
    })
  }))
})

signals.login.facebook.subscribe((x, out) => {
  out(new Promise((resolve, reject) => {
    rootRef.authWithOAuthRedirect('facebook', err => {
      if (err) reject(err)
      else resolve()
    })
  }))
})

/**
 * Messages
 */

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

function parseError (err) {
  // Firebase returns Error instances; we need to extract the message to
  // display it.
  if (err instanceof Error && err.message) err = err.message
  return typeof err === 'string' && err || 'An unexpected error has occurred.'
}

signals.send.subscribe((message, out) => {
  out({
    type: 'patch',
    value: {sending: true, error: null}
  })

  out(new Promise(resolve => {
    chatRef.push(message, err => {
      if (err) {
        resolve({type: 'patch', value: {error: parseError(err)}})
      } else {
        signals.send.success()
        resolve()
      }
    })
  }))

  out({
    type: 'patch',
    value: {sending: false}
  })
})

signals.delete.subscribe((id, out) => {
  out(new Promise((resolve, reject) => {
    chatRef.child(id).remove(err => {
      if (err) reject(err)
      else resolve()
    })
  }))
})

/**
 * Decorators
 */

export const on = createDecorator('subscribe', signals)
export const done = createDecorator('done', signals)

/**
 * Utils
 */

if (window.developmentMode) {
  window.signals = signals
}
