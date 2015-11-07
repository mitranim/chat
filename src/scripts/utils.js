import Firebase from 'firebase'
import _ from 'lodash'
import React from 'react'
import {render} from 'react-dom'
import {createPure, createEmitter} from 'symphony'

// Connection.
export const rootRef = new Firebase('https://incandescent-torch-3438.firebaseio.com')

// Creates a reactively updating component from a pure function.
export const pure = createPure(React.Component)

// Application-wide event emitter.
export const emit = createEmitter('sendSuccess', 'sendDone')
export const on = emit.decorator

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

if (window.developmentMode) {
  window.emit = emit
  window.on = on
}
