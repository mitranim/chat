import React from 'react'
import {render} from 'react-dom'
import _ from 'lodash'
import {autorun, stop} from 'rapt'

if (window.developmentMode) {
  window.React = React
}

// React class decorator that causes it to be rendered at each element that
// matches the given CSS selector.
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

/**
 * Component method decorator for reactive updates. Usage:
 *   class X extends React.Component {
 *     @reactive
 *     updateMe () {
 *       ...
 *     }
 *   }
 */
export function reactive (prototype, name, {value: reactiveFunc}) {
  if (typeof reactiveFunc !== 'function') return
  const {componentWillMount: pre, componentWillUnmount: post} = prototype

  prototype.componentWillMount = function () {
    if (typeof pre === 'function') pre.call(this)
    this[name] = reactiveFunc.bind(this)
    autorun(this[name])
  }

  prototype.componentWillUnmount = function () {
    stop(this[name])
    if (typeof post === 'function') post.call(this)
  }
}

// Loading indicator.
export const Spinner = props => {
  let {className = 'text-center', ...other} = props

  return (
    <div className={className} {...other}>
      <div className='fa fa-spinner fa-spin' />
    </div>
  )
}
