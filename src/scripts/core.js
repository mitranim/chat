import {Component} from 'react'
// Core utilities.
import {createAtom, createFq} from 'prax'
// Immutability utilities.
import {immute, replaceAtPath, mergeAtPath} from 'prax'

/**
 * State
 */

// Contains the entire application state. The data is immutable, and can only be
// changed in the core writer, based on the messages received through the
// message bus (factor queue). Has support for efficient change detection, which
// we exploit to update our views.
//
// The initial state is optional. Subsequent update create a new immutable tree
// every time, preserving as many previous references as possible.
export const atom = createAtom(immute({
  auth: null,
  messages: {},
  messageIds: [],

  authReady: false,
  messagesReady: false,
  sending: false,
  error: null
}))

export const {read, watch, stop} = atom

/**
 * FQ
 */

import auth from './factors/auth'
import im from './factors/im'

const writer = read => next => msg => {
  if (msg === 'init') return
  const {type, value, path} = msg

  switch (type) {
    case 'set':
      next(replaceAtPath(read(), value, path))
      break
    case 'patch':
      next(mergeAtPath(read(), value, path || []))
      break
    default:
      console.warn('Discarding unrecognised message:', msg)
  }
}

// Lazy generator of the factor queue. Can be imported and connected to mock
// input and output for testing in isolation.
export const fq = createFq(auth, im, writer)

// Input to the factor queue. All "commands" in the application are sent through
// it to the factors. Messages that eventually arrive to the writer have a
// chance to change the atom.
export const send = fq(atom.read, atom.write)

send('init')

/**
 * Rendering
 */

import {createAuto} from 'prax/react'

// Creates a React component out of a pure function. The component will
// automatically and efficiently track atom updates and re-render when needed.
export const auto = createAuto(Component, atom)

/**
 * Utils
 */

if (window.developmentMode) {
  window.atom = atom
  window.send = send
}
