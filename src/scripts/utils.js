import _ from 'lodash'
import React from 'react'
import {render} from 'react-dom'
import {createPure} from 'symphony'

// Creates a reactively updating component from a pure function.
export const pure = createPure(React.Component)

// React class decorator that causes the given component to be rendered at each
// element that matches the given CSS selector.
export function renderTo (selector: string) {
  return (Component: typeof React.Component) => {
    onDocumentReady(() => {
      _.each(document.querySelectorAll(selector), element => {
        render(<Component />, element)
      })
    })
  }
}

// Executes the given callback after the document is fully loaded, or
// immediately (synchronously) if it's already loaded.
function onDocumentReady (callback: () => void): void {
  if (/loaded|complete|interactive/.test(document.readyState)) {
    callback()
  } else {
    document.addEventListener('DOMContentLoaded', function cb () {
      document.removeEventListener('DOMContentLoaded', cb)
      callback()
    })
  }
}

// Loading indicator.
export const Spinner = props => {
  const {className = 'text-center', ...other} = props

  return (
    <div className={className} {...other}>
      <div className='fa fa-spinner fa-spin' />
    </div>
  )
}

export function parseError (err) {
  // Firebase returns Error instances; we need to extract the message to
  // display it.
  if (err instanceof Error && err.message) err = err.message
  return typeof err === 'string' && err || 'An unexpected error has occurred.'
}

// Creates a synchronous event emitter with optional strict event names for
// subscribers and emitters.
export function createEmitter (...eventNames) {
  const map = Object.create(null)

  const strict = !!eventNames.length
  if (strict) {
    eventNames.forEach(name => {
      if (typeof name !== 'string') {
        throw TypeError(`Expected event name to be a string, got: ${name}`)
      }
      map[name] = []
    })
    Object.freeze(map)
  }

  function check (name) {
    if (strict) {
      if (!(name in map)) {
        throw Error(`Event \`${name}\` not found in the list of permitted events: [${Object.keys(map).join(', ')}]`)
      }
    } else {
      if (!map[name]) map[name] = []
    }
    return map[name]
  }

  function emitter (name) {
    const subs = check(name)
    subs.forEach(sub => {sub()})
  }

  emitter.on = (name, func) => {
    const subs = check(name)
    if (typeof func === 'function') {
      if (!~subs.indexOf(func)) subs.push(func)
    }
    return () => {
      const index = subs.indexOf(func)
      if (~index) subs.splice(index, 1)
    }
  }

  emitter.decorator = createDecorator(emitter)
  return emitter
}

function createDecorator (emitter) {
  return function (...names) {
    return function (target, methodName, definition) {
      let {value: func} = definition
      if (typeof func !== 'function') return

      // Probably a class derived from `React.Component`.
      if (target.constructor && target.constructor !== Object) {
        const {componentWillMount: pre, componentWillUnmount: post} = target
        let unsubs

        target.componentWillMount = function () {
          if (typeof pre === 'function') pre.call(this)
          if (!isBound(this[methodName])) this[methodName] = func.bind(this)
          unsubs = names.map(name => emitter.on(name, this[methodName]))
        }

        target.componentWillUnmount = function () {
          unsubs.forEach(unsub => {unsub()})
          if (typeof post === 'function') post.call(this)
        }

        return
      }

      // Probably an oldschool React class.
      if (typeof target === 'object' && typeof target.displayName === 'string') {
        if (!target.mixins) target.mixins = []
        let unsubs

        target.mixins.push({
          componentWillMount () {
            unsubs = names.map(name => emitter.on(name, this[methodName]))
          },
          componentWillUnmount () {
            unsubs.forEach(unsub => {unsub()})
          }
        })

        return
      }

      // Probably a plain object whose purpose we don't know.
      if (!isBound(func)) func = definition.value = func.bind(target)
      names.map(name => {emitter.on(name, func)})
    }
  }
}

export function isBound (func) {
  return typeof func === 'function' && (!func.prototype || /^bound\b/.test(func.name))
}
