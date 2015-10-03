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
  data: {},

  // Total number of messages.
  count: 0,

  // Flips after the first data read.
  ready: false,

  init () {
    chatRef.on('value', snap => {
      this.data = snap.val()
      this.count = snap.numChildren()
      this.ready = true
      this.trigger()
    })
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
