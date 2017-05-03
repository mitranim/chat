const {render} = require('react-dom')
const {Agent, PraxComponent, seq, pipeAnd, bind} = require('prax')
const {CleanupQue, addEvent, removeClass, addClass, eventKeyName} = require('../utils')
const {Root} = require('../views')

export class Dom extends Agent {
  constructor (env) {
    super({cleanup: new CleanupQue()})
    this.env = env
  }

  init () {
    const {env} = this
    const {mq} = env.deref()
    const {cleanup} = this.deref()

    PraxComponent.prototype.env = env

    const rootNode = document.getElementById('root')

    // Assuming the root never changes (it's hardcoded into index.html), we
    // don't need to unmount on cleanup. Just render over it; react-router 4+
    // happily supports this.
    if (rootNode) render(<Root />, rootNode)

    cleanup.push(seq(
      addEvent(window, 'keydown', pipeAnd(eventKeyName, keyEvent, mq.push)),

      addEvent(window, 'keydown', seq(
        bind(removeClass, 'last-input-mouse', document.body),
        bind(addClass, 'last-input-mouse', document.body),
      )),

      // addEvent(window, 'click', seq(
      //   bind(removeClass, 'last-input-mouse', document.body),
      //   bind(addClass, 'last-input-keyboard', document.body),
      // )),

      addEvent(window, 'mousemove', seq(
        bind(removeClass, 'last-input-keyboard', document.body),
        bind(addClass, 'last-input-mouse', document.body),
      )),
    ))
  }
}

function keyEvent (eventKeyName) {
  return {type: `key/${eventKeyName}`}
}
