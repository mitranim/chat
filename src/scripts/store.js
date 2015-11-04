import {createStore} from 'redux'
import {replaceAtPath, mergeAtRoot, createReader} from 'symphony'

/**
 * Store
 */

// Central data store. This is the only place where the state can be changed.
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
}, {
  auth: null,
  messages: {},
  messageIds: [],

  authReady: false,
  messagesReady: false,
  sending: false,
  error: null
})

export const dispatch = store.dispatch
export const read = createReader(store)

if (window.developmentMode) {
  window.store = store
  window.read = read
}
