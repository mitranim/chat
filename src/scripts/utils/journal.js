import createBrowserHistory from 'history/createBrowserHistory'

const baseNode = document.querySelector('head base')

const baseHref = (baseNode && baseNode.getAttribute('href')) || ''

// Creating a journal only once should safeguard against accidental leaks.
if (!window.app.journal) {
  window.app.journal = createBrowserHistory({
    basename: baseHref || null,
  })
}

export const {journal} = window.app

export const originHref = baseHref
  ? `${window.location.origin}${baseHref}`
  : window.location.origin
