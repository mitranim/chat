const {Agent, MessageQue, bindAll, derefIn, deinit} = require('prax')
const {Nav} = require('./features/nav')
const {Dom} = require('./features/dom')
const {Auth} = require('./features/auth')
const {Messages} = require('./features/messages')
const {Participants} = require('./features/participants')
const {MessageForm} = require('./features/message-form')

export class Env extends Agent {
  constructor () {
    super()
    bindAll(this)
  }

  init (prevEnv) {
    this.reset({
      mq: new MessageQue(),
      nav: new Nav(this),
      auth: new Auth(this, derefIn(prevEnv, ['auth'])),
      messages: new Messages(this, derefIn(prevEnv, ['messages'])),
      participants: new Participants(this, derefIn(prevEnv, ['participants'])),
      messageForm: new MessageForm(this, derefIn(prevEnv, ['messageForm'])),
      dom: new Dom(this),
    })

    deinit(prevEnv)

    this.deref().dom.init()
  }

  send (msg) {
    this.deref().mq.push(this, msg)
  }

  addEffect () {
    return this.deref().mq.subscribe(...arguments)
  }

  removeEffect () {
    return this.deref().mq.unsubscribe(...arguments)
  }
}
