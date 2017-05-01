const Firebase = require('firebase')
const {Agent, get, patch} = require('prax')
const {deiniter} = require('../utils')
const {firebase} = require('./firebase')

export class Auth extends Agent {
  constructor (env, prevState) {
    super({
      user: get(prevState, 'user'),
      error: get(prevState, 'error'),
      synced: Boolean(get(prevState, 'synced')),
      loggingIn: get(prevState, 'loggingIn'),
      loggingOut: get(prevState, 'loggingOut'),
    })
    this.env = env
    this.providers = {
      twitter: new Firebase.auth.TwitterAuthProvider(),
      facebook: new Firebase.auth.FacebookAuthProvider(),
    }
  }

  onInit () {
    this.swap(patch, {
      sub: deiniter(firebase.auth().onAuthStateChanged(user => {
        this.swap(patch, {
          synced: true,
          user: user ? user.toJSON() : null,
        })
      })),
    })
  }

  onDeinit () {
    this.swap(patch, {sub: null})
  }

  login (providerName) {
    const provider = this.providers[providerName]

    if (!provider) throw Error(`Unknown auth provider: ${providerName}`)

    const {loggingIn, loggingOut} = this.deref()
    if (loggingIn || loggingOut) return

    this.swap(patch, {
      loggingIn: firebase.auth().signInWithPopup(provider)
        .then(({user}) => {
          this.swap(patch, {loggingIn: null, error: null})
          return user
        })
        .catch(error => {
          this.swap(patch, {loggingIn: null, error})
          console.warn(error)
          return error
        }),
    })
  }

  logout () {
    const {loggingIn, loggingOut} = this.deref()
    if (loggingIn || loggingOut) return

    this.swap(patch, {
      loggingOut: firebase.auth().signOut()
        .then(() => {
          this.swap(patch, {loggingOut: null})
        })
        .catch(error => {
          this.swap(patch, {loggingOut: null})
          console.warn(error)
          throw error
        }),
    })
  }
}

export function shortUser (user) {
  return user ? _.pick(user, ['uid', 'displayName', 'photoURL']) : null
}
