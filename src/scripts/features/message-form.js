const {Agent, get, patch} = require('prax')
const {firebase, TIMESTAMP} = require('./firebase')
const {shortUser} = require('./auth')

export class MessageForm extends Agent {
  constructor (env, prevState) {
    super({
      fields: get(prevState, 'fields'),
      error: get(prevState, 'error'),
      msgRef: get(prevState, 'msgRef'),
    })
    this.env = env
  }

  clear () {
    if (this.deref().msgRef) return
    this.swap(patch, {fields: null, error: null})
  }

  submit () {
    const {msgRef, fields} = this.deref()

    if (msgRef) return

    const {currentUser} = firebase.auth()

    if (!currentUser) return

    const message = {
      ...fields,
      author: shortUser(currentUser),
      createdAt: TIMESTAMP,
    }

    if (!message.body || !message.author.uid) return

    this.swap(patch, {
      msgRef: firebase.database().ref('messages').push(message, error => {
        this.swap(patch, {msgRef: null, fields: null, error})
      }),
    })
  }
}
