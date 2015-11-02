import React from 'react'
import {render} from 'react-dom'
import _ from 'lodash'

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
