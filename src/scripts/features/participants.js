const {Agent, get, patch} = require('prax')
const {fbOn, deiniter, Interval} = require('../utils')
const {firebase, TIMESTAMP} = require('./firebase')
const {shortUser} = require('./auth')

export class Participants extends Agent {
  constructor (env, prevState) {
    super({
      value: get(prevState, 'value'),
      error: get(prevState, 'error'),
      synced: Boolean(get(prevState, 'synced')),
    })
    this.env = env
  }

  onInit () {
    // Resetting subscriptions on logout/login ensures that we don't get "stuck"
    // due to a permission error.
    this.swap(patch, {
      authSub: deiniter(firebase.auth().onAuthStateChanged(user => {
        this.swap(patch, {
          hearbeatInterval: user && Interval.initNow(2000, () => {
            firebase.database().ref('participants').child(user.uid).set({
              user: shortUser(user),
              lastActiveAt: TIMESTAMP,
            })
          }),

          queryInterval: Interval.initNow(5000, () => {
            this.swap(patch, {
              querySub: deiniter(fbOn({
                ref: firebase.database()
                  .ref('participants')
                  .orderByChild('lastActiveAt')
                  .startAt(Date.now() - 5000),
                type: 'value',
                onNext: snap => {
                  this.swap(patch, {
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
          }),
        })
      })),
    })
  }

  onDeinit () {
    this.reset(null)
  }
}
