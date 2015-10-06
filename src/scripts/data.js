import _ from 'lodash'
import Firebase from 'firebase'
import Reflux from 'reflux'

export const rootRef = new Firebase('https://incandescent-torch-3438.firebaseio.com')

export const chatRef = rootRef.child('chat')

// Authentication store.
export const auth = Reflux.createStore({
  // Main data.
  data: null,

  // Flips after the first data read.
  ready: false,

  init () {
    rootRef.onAuth(authData => {
      // Regard 'anonymous' as not logged in.
      if (authData && authData.provider === 'anonymous') authData = null
      this.data = authData
      this.ready = true
      this.trigger()
    })
  },

  getFullName () {
    if (!this.data) return ''
    const details = this.data[this.data.provider]
    return details && details.displayName || ''
  }
})

// Chat messages store.
export const messages = Reflux.createStore({
  // Main data.
  data: [],

  // Flips after the first data read.
  ready: false,

  init () {
    chatRef.on('value', snap => {
      this.data = this.transformMessages(snap.val())
      this.ready = true
      this.trigger()
    })
  },

  // Sorts the received messages and enriches them with extra data.
  transformMessages (messageMap) {
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
})

if (window.developmentMode) {
  window.Firebase = Firebase
  window.Reflux = Reflux
  window.rootRef = rootRef
  window.chatRef = chatRef
  window.auth = auth
  window.messages = messages
}
