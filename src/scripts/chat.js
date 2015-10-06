import React, {PropTypes} from 'react'
import _ from 'lodash'
import Firebase from 'firebase'
import {renderTo, Component, Spinner} from './utils'
import {rootRef, chatRef, auth, messages} from './data'

export class MessageList extends React.Component {
  static propTypes = {
    authData: PropTypes.object,
    messages: PropTypes.array,
    handleError: PropTypes.func
  }

  // Scroll to the bottom after the first render.
  componentDidMount () {
    window.requestAnimationFrame(() => {
      this.scrollToBottom()
    })
  }

  // Scroll to the bottom when messages change.
  componentWillReceiveProps (props, state) {
    if (props && props.messages) {
      if (!_.isEqual(props.messages, this.props.messages)) {
        window.requestAnimationFrame(() => {
          this.scrollToBottom()
        })
      }
    }
  }

  render () {
    return (
      <div className='list-group messages-list'>
        {_.map(messages.data, message => (
          <div className={
                `list-group-item row-between-center
                 ${this.ownMessage(message) ? 'list-group-item-success' : 'list-group-item-info'}`}
               key={message.id}>
            <div className='flex-1 typographic-container'>
              <p>
                <strong>{message.authorName}</strong>
                <span className='text-muted'> at {new Date(message.timestamp).toLocaleString()}</span>
              </p>
              <p>{message.body}</p>
              {_.map(message.imageUrls, url => (
                <img src={url} className='message-image-embed' onLoad={::this.scrollToBottom} key={url} />
              ))}
            </div>

            {/* For own messages, display a dismiss button */}
            {this.ownMessage(message) ?
            <button className='flex-none close fa fa-times' onClick={() => {this.deleteMessage(message.id)}} /> : null}
          </div>
        ))}
      </div>
    )
  }

  deleteMessage (id) {
    chatRef.child(id).remove(this.props.handleError)
  }

  ownMessage (message) {
    return !!auth.data && !!message.userId && (message.userId === auth.data.uid)
  }

  scrollToBottom () {
    const list = React.findDOMNode(this)
    list.scrollTop = list.scrollHeight - list.getBoundingClientRect().height
  }
}

@renderTo('[data-render-chat]')
export class Chat extends Component {
  subscriptions = [auth, messages]

  componentWillMount () {
    super.componentWillMount()
    // Used to indicate loading. We're still letting Firebase to do an
    // optimistic update and add the message to the chat window, but we're going
    // to block the form to prevent the user from accidentally sending more than
    // one message.
    this.setState({syncing: false})
  }

  render () {
    if (!auth.ready || !messages.ready) return <Spinner style={{fontSize: '3em', lineHeight: '3em'}} />

    return (
      <div className='chat-container'>
        <h2 className='text-center'>
          <span>🎉🎊💥</span>
          <a href='https://github.com/Mitranim/chat' target='_blank' className='pull-right fa fa-github' />
        </h2>

        {messages.data.length ?
        <p>Total messages: {messages.data.length}</p> :
        <p>There are no messages yet. Be the first!</p>}

        {messages.data.length ?
        <MessageList authData={auth.data} messages={messages.data} handleError={this.handleError} /> : null}

        {/* Error messages go here */}
        {this.state.error ?
        <div className='alert alert-warning'>
          <button type='button' className='close fa fa-times' data-dismiss='alert' />
          {typeof this.state.error === 'string' ?
          this.state.error :
          'An unexpected error has occurred.'}
        </div> : null}

        {/* If authed, display the post form */}
        {auth.data ?
        <form className='input-group' onSubmit={::this.send}>
          <input autoFocus type='text' className='form-control' placeholder='type your message...'
                 name='message' ref='message' disabled={this.state.syncing} />
          <span className='input-group-btn'>
            <button type='submit' className='btn btn-default' disabled={this.state.syncing}>Send</button>
          </span>
        </form> : null}

        {/* Auth status or buttons */}
        <div className='help-block'>
          {auth.data ?
          <p>Authed as {auth.getFullName()}. <a onClick={::this.logout} className='pointer'>Logout.</a></p> :
          <p>
            <span>Log in to post: </span>
            <a className='fa fa-twitter pointer' onClick={::this.loginWithTwitter} />
            <span> </span>
            <a className='fa fa-facebook pointer' onClick={::this.loginWithFacebook} />
          </p>}
        </div>
      </div>
    )
  }

  send (event) {
    event.preventDefault()

    // There might be a race condition between logging out / updating auth store
    // / re-rendering the component / clicking submit leading to this event
    // happening when the user is logged out.
    if (!auth.data) return

    const input = React.findDOMNode(this.refs.message)
    const body = input.value

    // Ignore an empty body.
    if (!body) return

    const message = {
      userId: auth.data.uid,
      authorName: auth.getFullName(),
      body: body,
      timestamp: Firebase.ServerValue.TIMESTAMP
    }

    // Indicate loading.
    this.setState({syncing: true})

    chatRef.push(message, err => {
      this.handleError(err)
      this.setState({syncing: false})
      if (!err) {
        // Find the DOM node again. Can't guarantee that our earlier reference
        // hasn't been replaced by React during this async operation.
        const input = React.findDOMNode(this.refs.message)
        // Wipe it clean.
        input.value = ''
        // Restore focus (lost while the input was disabled).
        input.focus()
      }
    })
  }

  logout (event) {
    event.preventDefault()
    rootRef.unauth()
  }

  loginWithTwitter (event) {
    event.preventDefault()
    rootRef.authWithOAuthRedirect('twitter', this.handleError)
  }

  loginWithFacebook (event) {
    event.preventDefault()
    rootRef.authWithOAuthRedirect('facebook', this.handleError)
  }

  handleError = err => {
    if (err) {
      console.error(err)
      // Firebase returns Error instances; we need to extract the message to
      // display it.
      if (err instanceof Error && err.message) err = err.message
      this.setState({error: err})
    }
  }
}
