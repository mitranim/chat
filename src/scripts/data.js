import _ from 'lodash'
import Firebase from 'firebase'
import {Source} from 'prax'
import {actions} from './actions'

export const rootRef = new Firebase('https://incandescent-torch-3438.firebaseio.com')

export const chatRef = rootRef.child('chat')

/**
 * Auth
 */

export const auth = new Source(null)

rootRef.onAuth(authData => {
  // Regard 'anonymous' as not logged in.
  if (authData && authData.provider === 'anonymous') authData = null
  auth.ready = true
  auth.write(transformAuthData(authData))
})

function transformAuthData (data) {
  if (data) {
    const details = data[data.provider]
    data.fullName = details && details.displayName || ''
  }
  return data
}

actions.logout.listen(() => {rootRef.unauth()})

actions.login.twitter.listen(() => new Promise((resolve, reject) => {
  rootRef.authWithOAuthRedirect('twitter', (err, authData) => {
    if (err) reject(err)
    else resolve(authData)
  })
}))

actions.login.facebook.listen(() => new Promise((resolve, reject) => {
  rootRef.authWithOAuthRedirect('facebook', (err, authData) => {
    if (err) reject(err)
    else resolve(authData)
  })
}))

/**
 * Messages
 */

export const messages = new Source([])

chatRef.on('value', snap => {
  messages.ready = true
  messages.write(transformMessages(snap.val()))
})

// Sorts the received messages and enriches them with extra data.
function transformMessages (messageMap) {
  // Ensure that messages are ordered by timestamps.
  return _.sortBy(_.map(messageMap, (message, id) => ({
    ...message,
    id,
    // Find links to images, if any.
    imageUrls: typeof message.body === 'string' ?
               message.body.match(/https?:\/\/\S+\.(?:jpg|jpeg|png|gif|bmp)/ig) : []
  })), 'timestamp')
}

actions.send.listen(message => new Promise((resolve, reject) => {
  chatRef.push(message, err => {
    if (err) reject(err)
    else resolve()
  })
}))

actions.delete.listen(id => new Promise((resolve, reject) => {
  chatRef.child(id).remove(err => {
    if (err) reject(err)
    else resolve()
  })
}))

/**
 * Utils
 */

if (window.developmentMode) {
  window.Firebase = Firebase
  window.rootRef = rootRef
  window.chatRef = chatRef
  window.auth = auth
  window.messages = messages
}
