const {cloneElement} = require('react')
const {equalBy, is, bind, test} = require('prax')

const isCustomElement = test({type: _.isFunction})

export function maybeAddProps (props, element) {
  return isCustomElement(element) ? cloneElement(element, props) : element
}

export function addProps (props, element) {
  return cloneElement(element, props)
}

export function deepMapElement (fun, element) {
  return _.isArray(element)
    ? deepMapElements(fun, element)
    : deepMapChildren(fun, fun(element))
}

function deepMapElements (fun, elements) {
  return elements.map(bind(deepMapElement, fun))
}

function deepMapChildren (fun, element) {
  return !element || !element.props || !element.props.children
    ? element
    : _.isArray(element.props.children)
    ? replaceChildren(element, deepMapElements(fun, element.props.children))
    : replaceChild(element, deepMapElement(fun, element.props.children))
}

function replaceChildren (element, children) {
  return equalBy(is, element.props.children, children)
    ? element
    : cloneElement(element, {children})
}

function replaceChild (element, child) {
  return is(element.props.children, child)
    ? element
    : cloneElement(element, {children: child})
}
