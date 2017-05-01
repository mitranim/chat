const {Agent, get, patch} = require('prax')
const {fbOn, deiniter} = require('../utils')
const {firebase} = require('./firebase')

export class Messages extends Agent {
  constructor (env, prevState) {
    super({
      value: get(prevState, 'value'),
      error: get(prevState, 'error'),
      synced: Boolean(get(prevState, 'synced')),
      pendingDeleteId: get(prevState, 'pendingDeleteId'),
    })
    this.env = env
  }

  onInit () {
    // Resetting subscriptions on logout/login ensures that we don't get "stuck"
    // due to a permission error.
    this.swap(patch, {
      authSub: deiniter(firebase.auth().onAuthStateChanged(() => {
        this.swap(patch, {
          sub: deiniter(fbOn({
            ref: firebase.database().ref('messages'),
            type: 'value',
            onNext: snap => {
              this.swap(patch, {
                // Unsorted, could be a problem
                value: snap.val(),
                error: null,
                synced: true,
              })
            },
            onError: error => {
              console.warn(error)
              this.swap(patch, {error})
            },
          })),
        })
      })),
    })
  }

  onDeinit () {
    this.swap(patch, {authSub: null, sub: null})
  }

  maybeDeleteMessage (messageId) {
    this.swap(patch, {pendingDeleteId: messageId})
  }

  deleteMessage (messageId) {
    if (!messageId || this.deref().deletingMsgRef) return

    const deletingMsgRef = firebase.database().ref('messages').child(messageId)

    this.swap(patch, {deletingMsgRef})

    deletingMsgRef.remove(error => {
      this.swap(patch, {deletingMsgRef: null, error, pendingDeleteId: null})
    })
  }
}
