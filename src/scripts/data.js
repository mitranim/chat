import _ from 'lodash'
import {createStore} from 'redux'
import {readAtPath, replaceAtPath, mergeAtRoot} from 'emerge'
import {Source} from 'prax-react'

/**
 * Store
 */

// Central data store. This is the only place where state can be mutated.
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
})

export const dispatch = store.dispatch

if (window.developmentMode) {
  window.store = store
}

/**
 * Reactive data sources
 */

const readers = Object.create(null)

class Reader {
  constructor (path, store) {
    this.path = path
    this.store = store
    this.source = new Source()
    this.check()
  }

  read () {
    return this.source.read()
  }

  check () {
    const value = readAtPath(this.store.getState(), this.path)
    // Thanks to emerge's referential equality, `===` is equivalent to deep
    // equality between current and previous state.
    if (value !== this.source.value) this.source.write(value)
  }
}

// Reactive data source that reads data from the central store at the given
// path. Example usage:
// const value = read('one', 2, 'three')
export function read (...path) {
  const pt = path.join('.')
  return (readers[pt] || (readers[pt] = new Reader(path, store))).read()
}

if (window.developmentMode) {
  window.read = read
}

// On each change, update reactive data sources and purge any unneeded ones.
store.subscribe(() => {
  _.each(readers, (reader, key) => {
    if (reader.source.beacon.readers.length) reader.check()
    else delete readers[key]
  })
})
