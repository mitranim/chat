import {Component} from 'react'
// Core utilities.
import {createAtom, createMb} from 'prax'
// Extras.
import {asyncStrategy} from 'prax/async'

/**
 * State
 */

// Contains the entire application state. The data is immutable and can only be
// updated through atom methods. Performs efficient change detection for precise
// view updates.
//
// We pass the optional initial state. Subsequent update create a new immutable
// tree every time, preserving as many previous references as possible.
const atom = createAtom({
  auth: null,
  messages: {},
  messageIds: [],

  chat: {
    sending: false,
    error: '',
    text: ''
  },

  authReady: false,
  messagesReady: false
}, asyncStrategy)

export const {read, set, patch} = atom

/**
 * Message Bus
 */

// Event system with fancy pattern matching.
const mb = createMb()

export const {send, match} = mb

/**
 * App Logic
 */

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
