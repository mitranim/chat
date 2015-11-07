import Firebase from 'firebase'
import {createStore} from 'redux'
import {immute, replaceAtPath, mergeAtRoot, createReader} from 'symphony'
import {createEmitter} from './utils'

/**
 * Store
 */

// Central store. This is the only place where application state can be changed.
// The state is completely immutable. Each mutation produces a new tree,
// preserving as many original references as possible, which enables very
// precise view updates (encapsulated in symphony's createReader and other
// reactive utilities).
const store = createStore((state, {type, value, path}) => {
  switch (type) {
    case 'set': {
      return replaceAtPath(state, value, path)
    }
    case 'patch': {
      return mergeAtRoot(state, value)
    }
  }
  return state
}, immute({
  auth: null,
  messages: {},
  messageIds: [],

  authReady: false,
  messagesReady: false,
  sending: false,
  error: null
}))

export const storeDispatch = store.dispatch
export const read = createReader(store)

/**
 * Connection
 */

export const rootRef = new Firebase('https://incandescent-torch-3438.firebaseio.com')

/**
 * Utils
 */

// Application-wide event emitter.
export const emit = createEmitter('sendSuccess', 'sendDone')
export const on = emit.decorator

if (window.developmentMode) {
  window.store = store
  window.read = read
  window.emit = emit
  window.on = on
}
