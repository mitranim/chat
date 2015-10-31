import {createSignals, createDecorator, registerDecorators} from 'rapt-react'
import {dispatch} from './store'

/**
 * Published signals
 */

export const signals = createSignals(dispatch, {  // eslint-disable-line
  set: _ => ({type: 'set', ..._}),
  patch: _ => ({type: 'patch', ..._}),
  send: {},
  delete: {},
  logout: {},
  login: {twitter: {}, facebook: {}}
})

if (window.developmentMode) {
  window.signals = signals
}

/**
 * Decorators
 */

export const action = createDecorator('action')
registerDecorators(action, signals, {decorator: action})

export const error = createDecorator('error')
registerDecorators(error, signals, {decorator: error})

export const done = createDecorator('done')
registerDecorators(done, signals, {decorator: done})
