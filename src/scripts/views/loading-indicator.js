import {findDOMNode} from 'react-dom'
import {PraxComponent, isFunction} from 'prax'

export class LoadingIndicator extends PraxComponent {
  constructor () {
    super(...arguments)
    this.onCycleEnd = this.onCycleEnd.bind(this)
  }

  subrender () {
    const {props: {enabled: __, ...props}, state: {enabled}} = this

    if (!enabled) return null

    return (
      <LoadingIndicatorJS {...props} onCycleEnd={this.onCycleEnd} />
    )
  }

  componentWillMount () {
    this.setState({enabled: this.props.enabled})
  }

  componentWillReceiveProps ({enabled}) {
    if (enabled) this.setState({enabled})
  }

  onCycleEnd (loadingIndicator) {
    if (this.props.enabled) loadingIndicator.startCycle()
    else this.setState({enabled: false})
  }
}

export class LoadingIndicatorJS extends PraxComponent {
  constructor () {
    super(...arguments)
    this.startCycle = this.startCycle.bind(this)
    this.onTransitionEnd = this.onTransitionEnd.bind(this)
  }

  subrender () {
    const {className, style} = this.props
    return (
      <span
        className={`row-center-center children-margin-scale-up-h ${className || ''}`}
        style={style}
        onTransitionEnd={this.onTransitionEnd}>
        <span className='inline-block fg-blue transition-0x2'>●</span>
        <span className='inline-block fg-blue transition-0x2'>●</span>
        <span className='inline-block fg-blue transition-0x2'>●</span>
      </span>
    )
  }

  componentDidMount () {
    // Delaying by one frame ensures the CSS transitions will actually animate.
    // Otherwise they finish instantly.
    this.timerId = requestAnimationFrame(this.startCycle)
  }

  componentWillUnmount () {
    cancelAnimationFrame(this.timerId)
    super.componentWillUnmount()
  }

  startCycle () {
    const elem = findDOMNode(this)
    if (elem && elem.firstChild) scaleUp(elem.firstChild)
  }

  onTransitionEnd ({target: pip}) {
    const {props: {onCycleEnd}} = this
    const nextPip = pip.nextElementSibling

    if (isScaledUp(pip)) {
      scaleDown(pip)
      if (nextPip) scaleUp(nextPip)
    }
    else if (isScaledDown(pip) && !nextPip && isFunction(onCycleEnd)) {
      onCycleEnd(this)
    }
  }
}

const scaleUpClass = 'scale-up'
const scaleDownClass = 'scale-none'

function isScaledUp (elem) {
  return elem.classList.contains(scaleUpClass)
}

function isScaledDown (elem) {
  return elem.classList.contains(scaleDownClass)
}

function scaleUp (elem) {
  elem.classList.remove(scaleDownClass)
  elem.classList.add(scaleUpClass)
}

function scaleDown (elem) {
  elem.classList.remove(scaleUpClass)
  elem.classList.add(scaleDownClass)
}
