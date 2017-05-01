const {TaskQue, byPath, putIn, patchBy,
  ifelse, id, val, bind, foldl, rest, every, pipe, test,
  is, isFunction, isString, isNatural, isFinite, isObject, isList, isBoolean, validate} = require('prax')

export function bindValue ({deref, atom, path, transform = id, fallback = ''}) {
  validate(isFunction, deref)
  validate(isObject, atom)
  validate(isFunction, atom.swap)
  validate(isPath, path)

  return {
    value: reify(deref(byPath(atom, path)), fallback),
    onChange ({target: {value}}) {
      const newValue = transform(value)
      atom.swap(putIn, path, is(newValue, fallback) ? null : newValue)
    },
  }
}

function isPath (value) {
  return isList(value) && every(isString, value)
}

function reify (value, fallback) {
  return value == null ? fallback : value
}

export function jsonEncode (value) {
  try {return JSON.stringify(value)}
  catch (_) {return 'null'}
}

export function jsonDecode (value) {
  try {return JSON.parse(value)}
  catch (_) {return null}
}

export const mix = rest(bind(foldl, mixClassName, {}))

function mixClassName (prev, next) {
  return patchBy(mixClassName_, prev, next)
}

function mixClassName_ (prev, next, key) {
  return key === 'className'
    ? `${onlyString(prev)} ${onlyString(next)}`.trim()
    : patchBy(mixClassName_, prev, next)
}

export const onlyString = ifelse(isString, id, val(''))

// Pixel measurements are inaccurate when the browser is zoomed in or out, so we
// have to use a small non-zero value in some geometry checks.
const PX_ERROR_MARGIN = 3

export function smoothScrollY (velocity, getDeltaY) {
  validate(isNatural, velocity)
  validate(isFunction, getDeltaY)

  // Used to track deltaY changes between frames.
  let lastDeltaY

  return doEachFrameWhile(function smoothScrollStep () {
    const deltaY = getDeltaY()

    if (
      !isFinite(deltaY) ||
      // Couldn't move, must have reached the end.
      isFinite(lastDeltaY) && Math.abs(lastDeltaY - deltaY) <= PX_ERROR_MARGIN ||
      // Close enough.
      Math.abs(deltaY) <= PX_ERROR_MARGIN
    ) {
      return false
    }

    lastDeltaY = deltaY

    window.scrollBy(0, limitTo(velocity, deltaY))

    return true
  })
}

export function getHeaderHeight () {
  const header = document.getElementById('header')
  return !header
    ? null
    // Adds a few extra pixels for the shadow
    : header.getBoundingClientRect().height + 6
}

export function smoothScrollYToSelector (velocity, selector) {
  return smoothScrollY(velocity, () => {
    const elem = document.querySelector(selector)
    return !elem ? null : elem.getBoundingClientRect().top - (getHeaderHeight() | 0)
  })
}

export function smoothScrollToTop (velocity) {
  return smoothScrollY(velocity, getDocumentTop)
}

export function scrollYToSelector (selector) {
  const elem = document.querySelector(selector)
  if (!elem) return
  window.scrollTo(window.scrollX, elemOffsetY(elem) - (getHeaderHeight() | 0))
}

export function scrollToBottom (elem) {
  elem.scrollTop = Math.max(99999999, elem.scrollHeight - elem.clientHeight)
}

function elemOffsetY (elem) {
  return elem.getBoundingClientRect().top + window.pageYOffset - document.documentElement.clientTop
}

function getDocumentTop () {
  return document.documentElement.getBoundingClientRect().top
}

// `limit` must be positive.
// ---|-----|-----0-----|-----|---
//   num  limit       limit  num
function limitTo (limit, num) {
  return num > 0
    ? Math.min(limit, num)
    : Math.max(-limit, num)
}

export function doEachFrameWhile (fun) {
  let i = 0
  let id

  id = requestAnimationFrame(function run () {
    if (++i === 300) {
      throw Error('Task has been running for 300 frames, aborting: ' + fun)
    }
    if (fun()) id = requestAnimationFrame(run)
  })

  return function abort () {
    cancelAnimationFrame(id)
  }
}

export const unexpectedError = {
  name: 'Unexpected Error',
  message: 'An unexpected error has occurred',
}

export function addEvent (target, name, fun, useCapture = false) {
  validate(isFunction, fun)
  validate(isBoolean, useCapture)

  target.addEventListener(name, fun, useCapture)

  return function removeEvent () {
    target.removeEventListener(name, fun, useCapture)
  }
}

export function addClass (name, elem) {
  if (elem && elem.classList) elem.classList.add(name)
}

export function removeClass (name, elem) {
  if (elem && elem.classList) elem.classList.remove(name)
}

// Key names = `event.key`.
// Key codes = `event.keyCode`.
// No `event.key` support in WebKit:
// https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key#Browser_compatibility
export const KEY_CODES_US = {
  Tab:        9,
  Enter:      13,
  Escape:     27,
  ArrowLeft:  37,
  ArrowUp:    38,
  ArrowRight: 39,
  ArrowDown:  40,
  j:          74,
  k:          75,
}

export const KEY_NAMES_US = _.invert(KEY_CODES_US)

export function eventKeyName ({keyCode}) {
  return KEY_NAMES_US[keyCode]
}

export function fbOn ({ref, type, onNext, onError}) {
  validate(isObject, ref)
  validate(isFunction, onNext)
  if (onError) {
    ref.on(type, onNext, onError)
  }
  else {
    ref.on(type, onNext)
  }
  return () => {ref.off(type, onNext)}
}

export function deiniter (deinit) {
  // The extra prototype layer tells Emerge to treat this object atomically.
  return Object.create({deinit})
}

export function formatTimestamp (timestamp) {
  return new Date(timestamp).toISOString()
}

export function formatDate (timestamp) {
  const match = new Date(timestamp).toISOString().match(/(\d\d\d\d-\d\d-\d\d)/)
  return match ? match[1] : ''
}

export function formatTime (timestamp) {
  const match = new Date(timestamp).toISOString().match(/(\d\d:\d\d):\d\d/)
  return match ? match[1] : ''
}

export function reachedBottom (elem) {
  const distanceToBottomEdge = elem.scrollHeight - (elem.clientHeight + elem.scrollTop)
  return Math.abs(distanceToBottomEdge) <= PX_ERROR_MARGIN
}

export function stopPropagation (event) {
  event.stopPropagation()
}

export const isEscapeEvent = pipe(eventKeyName, test('Escape'))

export class Interval {
  constructor (delay, fun) {
    validate(isNatural, delay)
    validate(isFunction, fun)
    this.delay = delay
    this.fun = fun
    this.id = null
  }

  init () {
    clearInterval(this.id)
    this.id = setInterval(this.fun, this.delay)
  }

  deinit () {
    clearInterval(this.id)
    this.id = null
  }

  static initNow (delay, fun) {
    const interval = new Interval(delay, fun)
    fun()
    interval.init()
    return interval
  }
}

// WTB better name
export class CleanupQue extends TaskQue {
  constructor () {
    super()
    this.dam()
  }

  flush () {
    if (this.state !== this.state.FLUSHING) {
      try {super.flush()}
      finally {this.dam()}
    }
  }

  deinit () {
    this.flush()
  }
}
