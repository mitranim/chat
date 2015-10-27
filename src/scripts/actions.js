import {createActions} from 'rapt'

/**
 * Published actions
 */

export const actions = createActions({
  send: {},
  delete: {},
  logout: {},
  login: {twitter: {}, facebook: {}}
})

register(actions, on)
function register (actions, target) {
  if (typeof actions === 'object' && actions || typeof actions === 'function') {
    Object.keys(actions).forEach(key => {
      if (typeof actions[key] === 'function') {
        target[key] = on(actions[key])
        register(actions[key], target[key])
      }
    })
  }
}

/**
 * Utils
 */

export function on (...listenables) {
  return function (target, name, definition) {
    let {value: func} = definition
    if (typeof func !== 'function') return

    const {componentWillMount: pre, componentWillUnmount: post} = target

    target.componentWillMount = function () {
      if (typeof pre === 'function') pre.call(this)
      if (!isBound(this[name])) this[name] = func.bind(this)
      listenables.forEach(listenable => {
        listenable.listen(this[name])
      })
    }

    target.componentWillUnmount = function () {
      listenables.forEach(listenable => {
        listenable.stop(this[name])
      })
      if (typeof post === 'function') post.call(this)
    }
  }
}

export function isBound (func) {
  return typeof func === 'function' && (!func.prototype || /^bound\b/.test(func.name))
}
