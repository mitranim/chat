const {Agent, MessageQue, derefIn} = require('prax')
const {Nav} = require('./features/nav')
const {Dom} = require('./features/dom')
const {Auth} = require('./features/auth')
const {Messages} = require('./features/messages')
const {Participants} = require('./features/participants')
const {MessageForm} = require('./features/message-form')

export class Env extends Agent {
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

    if (prevEnv) prevEnv.deinit()

    this.deref().dom.init()
  }
}
