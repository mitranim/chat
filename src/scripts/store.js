import {createStore, applyMiddleware} from 'redux'
import {createMiddleware, immute, replaceAtPath, mergeAtRoot, createReader} from 'symphony'

/**
 * Transducing middleware
 */

import {transducer as auth} from './auth'
import {transducer as im} from './im'

const create = applyMiddleware(createMiddleware(auth, im))(createStore)

/**
 * Store
 */

// Central store. This is the only place where application state can be changed.
// The state is completely immutable. Each mutation produces a new tree,
// preserving as many original references as possible, which enables very
// precise view updates (encapsulated in symphony's createReader and other
// reactive utilities).
const store = create((state, {type, value, path}) => {
  switch (type) {
    case 'set': {
      return replaceAtPath(state, value, path)
    }
    case 'patch': {
      return mergeAtRoot(state, value)
    }
  }
  return state
},
immute({
  auth: null,
  messages: {},
  messageIds: [],

  authReady: false,
  messagesReady: false,
  sending: false,
  error: null
}))

store.dispatch({type: 'init'})

export const dispatch = store.dispatch
export const read = createReader(store)

/**
 * Utils
 */

if (window.developmentMode) {
  window.store = store
  window.read = read
}
