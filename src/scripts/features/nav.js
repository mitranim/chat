import {Agent, equal, put} from 'prax'
import {journal, smoothScrollYToSelector, smoothScrollToTop, patchQuery, addToQuery} from '../utils'

export class Nav extends Agent {
  constructor (env) {
    super({location: journal.location, lastAction: journal.action})
    this.env = env
    this.unsub = journal.listen(location => {
      this.swap(put, {prevLocation: this.deref().location, location, lastAction: journal.action})
      adjustScrollPosition(this.deref())
    })
  }

  push (location) {
    journal.push(location)
  }

  replace (location) {
    journal.replace(location)
  }

  queryPush (query) {
    journal.push(patchQuery(journal.location, query))
  }

  queryReplace (query) {
    journal.replace(patchQuery(journal.location, query))
  }

  queryKeyPush (key, query) {
    journal.push(addToQuery(journal.location, key, query))
  }

  queryKeyReplace (key, query) {
    journal.replace(addToQuery(journal.location, key, query))
  }

  deinit () {
    this.unsub()
    super.deinit()
  }
}

function adjustScrollPosition ({prevLocation: prev, location: next, lastAction}) {
  if (!prev && next && next.hash) {
    // Probably initial page load. We need to adjust the scroll position
    // because the browser doesn't account for the fixed header. If the page
    // got refreshed in-place, Chrome will overwrite this with the previous
    // scroll position, after a brief flicker. Haven't tested other browsers.
    smoothScrollYToSelector(120, next.hash)
    return
  }

  if (!prev || !next) return

  // HMR
  if (equal(prev, next)) return

  if (lastAction === 'POP') {
    // Stimulate the browser to restore the scroll position.
    forceLayoutHeight()
    return
  }

  if (next.hash) {
    smoothScrollYToSelector(120, next.hash)
    return
  }

  smoothScrollToTop(120)
}

function forceLayoutHeight () {
  // Force height measurement to ensure proper scroll restoration when
  // navigating back and forward. This must be done after a rendering phase.
  document.body.scrollHeight
}
