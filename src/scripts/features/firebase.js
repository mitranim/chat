const Firebase = require('firebase')
const {FIREBASE_CONFIG} = require('../config')

if (!window.app.firebase) {
  const firebase = Firebase.initializeApp(FIREBASE_CONFIG)
  window.app.firebase = firebase
}

export const {firebase} = window.app

export const {database: {ServerValue: {TIMESTAMP}}} = Firebase
