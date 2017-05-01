const {PraxComponent, ifthen} = require('prax')
const {maybeAddProps, stopPropagation, mix, addEvent, isEscapeEvent} = require('../utils')

/**
 * TODO
 *   block body scroll when modal is open
 */

export class Modal extends PraxComponent {
  subrender () {
    const {props: {open, children, className, style, ...props}} = this

    return !open ? null : (
      <div
        className={className || 'overlay row-center-center bg-30'}
        style={style || {margin: 0, overflow: 'auto'}}
        {...props}>
        {/*
          Without max-width and max-height, Chrome miscalculates the size of the
          scroll area if and only if the enclosing fixed element is also a flex
          container with vertical centering (!).
        */}
        <div style={{maxWidth: '100vw', maxHeight: '100vh'}}>
          {children}
        </div>
      </div>
    )
  }
}

export class StatefulModal extends PraxComponent {
  constructor () {
    super(...arguments)
    this.state = {open: false}
    this.open = this.open.bind(this)
    this.close = this.close.bind(this)
  }

  subrender () {
    const {props: {children, ...props}, state: {open}} = this

    return (
      <Modal
        {...props}
        children={maybeAddProps({modal: this}, React.Children.only(children))}
        open={open}
        />
    )
  }

  componentWillMount () {
    this.unsub = addEvent(document, 'keydown', ifthen(isEscapeEvent, this.close))
    super.componentWillMount()
  }

  componentWillUnmount () {
    this.unsub()
    super.componentWillUnmount()
  }

  open () {
    this.setState({open: true})
  }

  close () {
    this.setState({open: false})
  }
}

export function ModalBody ({children, className, style, ...props}) {
  return (
    <div className={className || 'container padding-1-h padding-2-v'} style={style}>
      <div className='bg-white shadow-drop-thick col-stretch' onClick={stopPropagation}>
        {maybeAddProps(props, children)}
      </div>
    </div>
  )
}

export function ModalCloseButton ({modal, ...props}) {
  return (
    <button
      {...mix({
        type: 'button',
        className: 'padding-0x5 interact-bg-04 cursor-pointer',
        onClick: modal && modal.close,
      }, props)}>
      Esc
    </button>
  )
}

export function ModalBodyFitToScreen ({children, className, ...props}) {
  // Vertical stretch acts like a hybrid between max-height and height. It
  // allows the container to scale vertically but also gives the children a
  // height value (as opposed to max-height, which doesn't).
  return (
    <div
      className={className ||
        'container padding-1-h padding-4-v row-center-stretch height-100vh'}>
      <div className='bg-white shadow-drop-thick row-center-stretch' onClick={stopPropagation}>
        {maybeAddProps(props, children)}
      </div>
    </div>
  )
}

// Expands modal horizontally without exceeding ancestral `max-width`.
export const modalStrutX = <div style={{width: '100vw', overflowX: 'hidden', margin: 0}} />
