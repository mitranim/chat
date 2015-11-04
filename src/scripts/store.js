import {createStore} from 'redux'
import {immute, replaceAtPath, mergeAtRoot, createReader} from 'symphony'

/**
 * Store
 */

// Central store. This is the only place where application state can be changed.
// The state is completely immutable. Each mutation produces a new tree,
// preserving as many original references as possible, which enables very
// precise view updates (encapsulated in symphony's createReader and other
// reactive utilities).
const store = createStore((state, action) => {
  switch (action.type) {
    case 'set': {
      state = replaceAtPath(state, action.value, action.path)
      break
    }
    case 'patch': {
      state = mergeAtRoot(state, action.value)
      break
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

export const dispatch = store.dispatch
export const read = createReader(store)

/**
 * Utils
 */

if (window.developmentMode) {
  window.store = store
  window.read = read
}
