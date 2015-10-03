import React, {PropTypes} from 'react'

if (window.developmentMode) {
  window.React = React
}

// React class decorator that causes it to be rendered at each element that
// matches the given CSS selector.
export function renderTo (selector: string) {
  return (Component: typeof React.Component) => {
    onDocumentReady(() => {
      [].slice.call(document.querySelectorAll(selector)).forEach(element => {
        React.render(<Component />, element)
      })
    })
  }
}

// Executes the given callback after the document is fully loaded, or
// immediately (synchronously) if it's already loaded.
function onDocumentReady (callback: () => void): void {
  if (/loaded|complete|interactive/.test(document.readyState)) callback()
  document.addEventListener('DOMContentLoaded', function cb () {
    document.removeEventListener('DOMContentLoaded', cb)
    callback()
  })
}

// Reactive component that automatically subscribes to / unsubscribes from
// Reflux stores and actions.
export class Component extends React.Component {
  // Should be specified by the subclass.
  subscriptions = []

  // Utility properties.
  _unsubs = []
  _awaitingUpdate = false

  // Uses throttling to prevent the UI from updating more than once per event
  // loop tick. This prevents unnecessary work when multiple subscriptions
  // update at once.
  _forceUpdate = () => {
    if (this._awaitingUpdate) return
    this._awaitingUpdate = true
    setTimeout(() => {
      this._awaitingUpdate = false
      this.forceUpdate()
    }, 0)
  }

  componentWillMount () {
    this.subscriptions.forEach(sub => {
      this._unsubs.push(sub.listen(this._forceUpdate))
    })
  }

  componentWillUnmount () {
    while (this._unsubs.length) this._unsubs.shift()()
  }
}

// Loading indicator.
export class Spinner extends React.Component {
  static propTypes = {
    style: PropTypes.object
  }

  render () {
    return (
      <div className='text-center' style={this.props.style || null}>
        <div className='fa fa-spinner fa-spin' />
      </div>
    )
  }
}
