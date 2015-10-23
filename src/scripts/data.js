import _ from 'lodash'
import Firebase from 'firebase'
import {Source} from 'rapt'

export const rootRef = new Firebase('https://incandescent-torch-3438.firebaseio.com')

export const chatRef = rootRef.child('chat')

// Authentication store.
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

// Chat messages store.
export const messages = new Source([])

chatRef.on('value', snap => {
  messages.ready = true
  messages.write(transformMessages(snap.val()))
})

// Sorts the received messages and enriches them with extra data.
function transformMessages (messageMap) {
  // Ensure that messages are ordered by timestamps.
  return _.sortBy(_.map(messageMap, (message, id) => (
    _.assign({}, message, {
      id: id,
      // Find links to images, if any.
      imageUrls: typeof message.body === 'string' ?
                 message.body.match(/https?:\/\/\S+\.(?:jpg|jpeg|png|gif|bmp)/ig) : []
    })
  )), 'timestamp')
}

if (window.developmentMode) {
  window.Firebase = Firebase
  window.rootRef = rootRef
  window.chatRef = chatRef
  window.auth = auth
  window.messages = messages
}
