const {PraxComponent, get, byPath, patch, ifthen} = require('prax')
const {mix, bindValue, onlyString, formatDate, formatTime, isEscapeEvent,
  reachedBottom, scrollToBottom, addEvent} = require('../utils')
const {LoadingIndicator} = require('./loading-indicator')
const {Modal, ModalBody} = require('./modal')
const {ErrorPanels} = require('./misc')

export class Messages extends PraxComponent {
  constructor () {
    super(...arguments)
    this.state = {bottom: true}
    this.updateScrollState = this.updateScrollState.bind(this)
    this.scrollToBottom = this.scrollToBottom.bind(this)
  }

  subrender ({deref}) {
    const {props, state: {bottom}} = this
    const refs = this.env.deref()

    const messages = deref(byPath(refs.messages, ['value']))
    const synced = deref(byPath(refs.messages, ['synced']))
    const error = deref(byPath(refs.messages, ['error']))

    return (
      <div {...mix({className: 'col-between-stretch children-margin-1-v padding-1'}, props)}>
        <div className='flex-1 col-start-stretch children-margin-1-v'>
          <h2 className='row-between-center children-margin-1-h'>
            <span>Messages</span>
            <LoadingIndicator enabled={!synced && !error} />
          </h2>

          {error ?
          <ErrorPanels errors={[error]} /> : null}

          {_.isEmpty(messages) && synced && !error ?
          <div className='flex-1 row-center-center text-center'>
            <h3>The chat is empty. Leave the first message!</h3>
          </div> :

          synced ?
          <div className='flex-1 relative col-between-stretch'>
            <div
              className='children-margin-1-v overflow-y-scroll'
              onScroll={this.updateScrollState}
              ref='messageList'>
              {_.map(messages, (message, key) => (
                <Message messageId={key} message={message} key={key} />
              ))}
            </div>
            {!bottom ?
            <button
            className='circle interact-04-bg shadow-drop abs-bottom-center'
              style={{width: '3rem', height: '3rem'}}
              onClick={this.scrollToBottom}>
              <span className='fa fa-chevron-down' />
            </button> : null}
          </div>
          : null}
        </div>

        <MessageDeleteModal />

        <MessageForm onSubmit={this.scrollToBottom} />
      </div>
    )
  }

  updateScrollState () {
    const list = this.refs.messageList
    this.setState({bottom: list && reachedBottom(list)})
  }

  scrollToBottom () {
    if (!this.state.bottom) {
      this.setState({bottom: true})
    }
    else {
      const list = this.refs.messageList
      if (list) scrollToBottom(list)
    }
  }

  componentDidMount () {
    this.scrollToBottom()
  }

  componentDidUpdate () {
    if (this.state.bottom) this.scrollToBottom()
  }
}

class Message extends PraxComponent {
  subrender ({deref}) {
    const {props: {messageId, message: {author: {uid, displayName, photoURL}, body, createdAt}}} = this
    const refs = this.env.deref()
    const userId = deref(byPath(refs.auth, ['user', 'uid']))
    const my = userId && (uid === userId)

    return (
      <div className='row-between-stretch children-margin-0x5-h'>
        <div className='width-2em'>
          <span
            className='inline-block width-100p square bg-cover'
            style={{backgroundImage: photoURL ? `url(${photoURL})` : null}}
            />
        </div>
        <div className='flex-8 col-start-stretch children-margin-0x25-v'>
          <span className='row-start-stretch children-margin-0x5-h font-0x8 fg-54'>
            {my ?
            <span className='weight-bold'>me</span> :
            <span>{displayName}</span>}
            <span>{formatDate(createdAt)}</span>
            <span>{formatTime(createdAt)}</span>
          </span>
          <span>{body}</span>
        </div>
        <span className='flex-1 text-right padding-0x5-h'>
          {my ?
          <button
            className='fg-54 interact-04-bg padding-0x5'
            onClick={() => {
              refs.messages.swap(patch, {pendingDeleteId: messageId})
            }}>×</button> : null}
        </span>
      </div>
    )
  }
}

class MessageDeleteModal extends PraxComponent {
  subrender ({deref}) {
    const {messages} = this.env.deref()

    const pendingDeleteId = deref(byPath(messages, ['pendingDeleteId']))

    if (!pendingDeleteId) return null

    const deleting = Boolean(deref(byPath(messages, ['deletingMsgRef'])))

    return (
      <Modal open onClick={this.cancel}>
        <ModalBody>
          <div className='padding-1 row-between-center children-margin-1-h'>
            <span>Delete message?</span>
            <button
              className='padding-0x5 interact-bg-red children-margin-0x5-h'
              onClick={() => {
                messages.deleteMessage(pendingDeleteId)
              }}
              autoFocus
              disabled={deleting}>
              <span className='fa fa-trash' />
              <span>Delete</span>
            </button>
            <button
              className='padding-0x5 interact-bg-04 cursor-pointer'
              onClick={this.cancel}>
              Esc
            </button>
          </div>
        </ModalBody>
      </Modal>
    )
  }

  componentWillMount () {
    this.cancel = this.cancel.bind(this)
    this.unsub = addEvent(document, 'keydown', ifthen(isEscapeEvent, this.cancel))
    super.componentWillMount()
  }

  componentWillUnmount () {
    this.unsub()
    super.componentWillUnmount()
  }

  cancel () {
    this.env.deref().messages.swap(patch, {pendingDeleteId: null})
  }
}

class MessageForm extends PraxComponent {
  subrender ({deref}) {
    const {env, props: {onSubmit, ...props}} = this
    const {auth, messageForm} = env.deref()
    const {user, synced: authSynced} = deref(auth)
    const {fields, msgRef: sending, error} = deref(messageForm)
    const hasUser = user && authSynced
    const inert = !hasUser || sending || !onlyString(get(fields, 'body')).trim()

    return (
      <div className='col-start-stretch children-margin-0x5-v'>
        {error ?
        <ErrorPanels errors={[error]} /> : null}
        <form
          {...mix({className: 'row-between-stretch flex-shrink-none'}, props)}
          onSubmit={event => {
            event.preventDefault()
            messageForm.submit()
            if (onSubmit) onSubmit()
          }}>
          <input
            className='flex-12'
            autoFocus
            placeholder={hasUser ? 'Type your message here...' : 'Login to send messages'}
            disabled={!hasUser}
            readOnly={sending}
            {...bindValue({
              deref,
              atom: messageForm,
              path: ['fields', 'body'],
            })}
            onKeyDown={ifthen(isEscapeEvent, messageForm.clear.bind(messageForm))} />
          {sending ?
          <LoadingIndicator enabled className='flex-1 padding-0x5' /> :
          <button
            type='submit'
            className={`flex-1 padding-0x5 ${inert ? 'fg-54' : 'fg-87'}`}
            disabled={inert}>
            ⏎
          </button>}
        </form>
      </div>
    )
  }
}
