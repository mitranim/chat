import {Component} from 'react'
// Core utilities.
import {createAtom, createMb} from 'prax'
// Immutability utilities.
import {immute, replaceAtPath, mergeAtPath} from 'prax'

/**
 * State
 */

// Contains the entire application state. The data is immutable, and can only be
// changed in the core writer, based on the messages received through the
// message bus. Performs efficient change detection for precise view updates.
//
// We pass the optional initial state. Subsequent update create a new immutable
// tree every time, preserving as many previous references as possible.
export const atom = createAtom(immute({
  auth: null,
  messages: {},
  messageIds: [],

  chat: {
    sending: false,
    error: null,
    text: ''
  },

  authReady: false,
  messagesReady: false
}))

export const {read, watch, stop} = atom

/**
 * Message Bus
 */

const mb = createMb(
  {type: 'set', path: x => x instanceof Array}, ({value, path}) => {
    atom.write(replaceAtPath(read(), value, path))
  },

  {type: 'patch'}, ({value, path}) => {
    atom.write(mergeAtPath(read(), value, path || []))
  }
)

// Input and connection to the message bus. All "commands" in the application
// are sent through `send` to the factos that have connected to the bus with
// `match`.
export const {send, match} = mb

// Application logic.
require('./factors/auth')
require('./factors/chat')

send('init')

/**
 * Rendering
 */

import {createAuto, createReactiveRender} from 'prax/react'

// Decorates a React component to become truly reactive. It will precisely track
// the atom data accessed in its `render` method and re-render when it changes.
export const reactiveRender = createReactiveRender(atom)

// Special case of `reactiveRender` that creates a component out of a function.
// Useful for components that only have the `render` method.
export const auto = createAuto(Component, atom)

/**
 * Utils
 */

if (window.developmentMode) {
  window.atom = atom
  window.mb = mb
}
