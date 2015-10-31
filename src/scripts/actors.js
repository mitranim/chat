import _ from 'lodash'
import Firebase from 'firebase'
import {createSignals, createDecorator, registerDecorators} from 'rapt-react'
import {dispatch} from './data'

/**
 * Published signals
 */

export const signals = createSignals(dispatch, {  // eslint-disable-line
  set: _ => ({type: 'set', ..._}),
  patch: _ => ({type: 'patch', ..._}),
  send: {},
  delete: {},
  logout: {},
  login: {twitter: {}, facebook: {}}
})

if (window.developmentMode) {
  window.signals = signals
}

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

signals.logout.action(() => {rootRef.unauth()})

signals.login.twitter.action(() => new Promise((resolve, reject) => {
  rootRef.authWithOAuthRedirect('twitter', err => {
    if (err) reject(err)
    else resolve()
  })
}))

signals.login.facebook.action(() => new Promise((resolve, reject) => {
  rootRef.authWithOAuthRedirect('facebook', err => {
    if (err) reject(err)
    else resolve()
  })
}))

/**
 * Messages
 */

chatRef.on('value', snap => {
  dispatch({
    type: 'patch',
    value: {
      messages: transformMessages(snap.val()),
      messagesReady: true
    }
  })
})

// Sorts the received messages and enriches them with extra data.
function transformMessages (messageMap) {
  const messages = _.map(messageMap, (message, id) => ({
    ...message,
    id,
    // Find links to images, if any.
    imageUrls: typeof message.body === 'string' ?
               message.body.match(/https?:\/\/\S+\.(?:jpg|jpeg|png|gif|bmp)/ig) : []
  }))
  // Ensure that messages are ordered by timestamps.
  return _.sortBy(messages, 'timestamp')
}

signals.send.action(message => new Promise((resolve, reject) => {
  chatRef.push(message, err => {
    if (err) reject(err)
    else resolve()
  })
}))

signals.send.action(() => ({
  type: 'patch',
  value: {sending: true}
}))

signals.send.done(() => ({
  type: 'patch',
  value: {sending: false}
}))

signals.delete.action(id => new Promise((resolve, reject) => {
  chatRef.child(id).remove(err => {
    if (err) reject(err)
    else resolve()
  })
}))

/**
 * Decorators
 */

export const action = createDecorator('action')
registerDecorators(action, signals, {decorator: action})

export const error = createDecorator('error')
registerDecorators(error, signals, {decorator: error})

export const done = createDecorator('done')
registerDecorators(done, signals, {decorator: done})
