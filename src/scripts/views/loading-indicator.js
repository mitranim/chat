import {findDOMNode} from 'react-dom'
import {PraxComponent} from 'prax'

export class LoadingIndicator extends PraxComponent {
  constructor () {
    super(...arguments)
    this.startCycle = this.startCycle.bind(this)
    this.onTransitionEnd = this.onTransitionEnd.bind(this)
  }

  subrender () {
    if (!this.state || !this.state.visible) return null

    const {className, style} = this.props

    return (
      <span
        className={`row-center-center children-margin-letter-h flex-shrink-none ${className || ''}`}
        style={style}
        onTransitionEnd={this.onTransitionEnd}>
        <span style={pipStyle}>●</span>
        <span style={pipStyle}>●</span>
        <span style={pipStyle}>●</span>
      </span>
    )
  }

  setup ({enabled}) {
    if (enabled && !(this.state && this.state.visible)) {
      this.setState({visible: true})
      // Delaying by one frame ensures the CSS transitions will actually
      // animate. It appears that CSS transitions finish instantly if started in
      // the same call stack where the DOM nodes were created.
      cancelAnimationFrame(this.timerId)
      this.timerId = requestAnimationFrame(this.startCycle)
    }
  }

  startCycle () {
    const elem = findDOMNode(this)
    if (elem && elem.firstChild) scaleUp(elem.firstChild)
  }

  onTransitionEnd ({target: pip}) {
    const nextPip = pip.nextElementSibling

    if (isScaledUp(pip)) {
      scaleDown(pip)
      if (nextPip) scaleUp(nextPip)
      return
    }

    const finishedFullCycle = isScaledDown(pip) && !nextPip

    if (finishedFullCycle) {
      if (this.props.enabled) this.startCycle()
      else this.setState({visible: false})
    }
  }

  componentWillUnmount () {
    cancelAnimationFrame(this.timerId)
    super.componentWillUnmount()
  }
}

const pipStyle = {display: 'inline-block', transition: 'all 0.2s ease-out'}

function isScaledUp (elem) {
  return /scale/.test(elem.style.transform)
}

function isScaledDown (elem) {
  return !isScaledUp(elem)
}

function scaleUp (elem) {
  elem.style.transform = 'scale(1.5)'
}

function scaleDown (elem) {
  elem.style.transform = ''
}
