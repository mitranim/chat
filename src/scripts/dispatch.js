import {storeDispatch} from './store'
import {transducer as auth} from './auth'
import {transducer as im} from './im'

export const dispatch = createTransducingDispatch(storeDispatch, combineTransducers(auth, im))

if (window.developmentMode) {
  window.dispatch = dispatch
}

/**
 * Utils
 */

function createTransducingDispatch (finalDispatch, transducer) {
  return function dispatch (action) {
    if (action === undefined) return
    validate(action)
    const prev = action
    action = transducer(action)
    if (action === undefined) return
    validate(action)

    if (isPromise(action)) return action.then(dispatch)

    if (action instanceof Array) {
      let bumper

      action.forEach(step => {
        if (bumper) {
          bumper = bumper.then(() => dispatch(step))
        } else {
          step = dispatch(step)
          if (isPromise(step)) bumper = step
        }
      })

      return bumper
    }

    if (isPlainObject(action)) {
      if (action === prev) return finalDispatch(action)
      return dispatch(action)
    }

    throw Error(`Unexpected end of sequence for action: ${action}`)
  }
}

function combineTransducers (...transducers) {
  return action => {
    let i = -1
    while (++i < transducers.length) {
      const result = transducers[i](action)
      if (result !== action) return result
    }
    return action
  }
}

// If it quacks like a duck...
function isPromise (value) {
  return value != null && typeof value.then === 'function' && typeof value.catch === 'function'
}

function isPlainObject (value) {
  return !!value && (value.constructor === Object || !value.constructor)
}

function validate (action) {
  if (!(action instanceof Array) && !isPromise(action) && (!isPlainObject(action) || !action.type)) {
    throw TypeError(`Expected an array, a promise, a plain object with a \`type\` property, or \`undefined\`; got: ${action}`)
  }
}
