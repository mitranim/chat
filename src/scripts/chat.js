import React from 'react'
import Firebase from 'firebase'
import {reactive} from 'prax-react'

import {read} from './data'
import {renderTo, Spinner} from './utils'
import {signals, done, error} from './actors'
import {MessageList} from './message-list'

@renderTo('[data-render-chat]')
export class Chat extends React.Component {
  @reactive
  update () {
    this.setState({
      auth: read('auth'),
      authReady: read('authReady'),
      messages: read('messages'),
      messagesReady: read('messagesReady'),
      sending: read('sending')
    })
  }

  render () {
    if (!this.state.authReady || !this.state.messagesReady) {
      return <Spinner style={{fontSize: '3em', lineHeight: '3em'}} />
    }

    return (
      <div className='chat-container'>
        <h2 className='text-center'>
          <span>🎉🎊💥</span>
          <a href='https://github.com/Mitranim/chat' target='_blank' className='pull-right fa fa-github' />
        </h2>

        {this.state.messages.length ?
        <p>Total messages: {this.state.messages.length}</p> :
        <p>There are no messages yet. Be the first!</p>}

        {this.state.messages.length ?
        <MessageList authData={this.state.auth} messages={this.state.messages} onError={::this.onError} /> : null}

        {/* Error messages go here */}
        {this.state.error ?
        <div className='alert alert-warning'>
          <button type='button' className='close fa fa-times' data-dismiss='alert' />
          {typeof this.state.error === 'string' ?
          this.state.error :
          'An unexpected error has occurred.'}
        </div> : null}

        {/* If authed, display the post form */}
        {this.state.auth ?
        <form className='input-group' onSubmit={::this.send}>
          <input autoFocus type='text' className='form-control' placeholder='type your message...'
                 name='message' ref='input' disabled={this.state.sending} />
          <span className='input-group-btn'>
            <button type='submit' className='btn btn-default' disabled={this.state.sending}>Send</button>
          </span>
        </form> : null}

        {/* Auth status or buttons */}
        <div className='help-block'>
          {this.state.auth ?
          <p>Authed as {this.state.auth.fullName}. <a onClick={() => {signals.logout()}} className='pointer'>Logout.</a></p> :
          <p>
            <span>Log in to post: </span>
            <a className='fa fa-twitter pointer' onClick={() => {signals.login.twitter()}} />
            <span> </span>
            <a className='fa fa-facebook pointer' onClick={() => {signals.login.facebook()}} />
          </p>}
        </div>
      </div>
    )
  }

  send (event) {
    event.preventDefault()

    const body = this.refs.input.value
    if (!body) return

    signals.send({
      userId: this.state.auth.uid,
      authorName: this.state.auth.fullName,
      body,
      timestamp: Firebase.ServerValue.TIMESTAMP
    })
  }

  @done.send
  onSendDone () {
    this.refs.input.value = ''
    this.refs.input.focus()
  }

  @error.send
  @error.login.twitter
  @error.login.facebook
  onError (err) {
    console.error(err)
    // Firebase returns Error instances; we need to extract the message to
    // display it.
    if (err instanceof Error && err.message) err = err.message
    this.setState({error: err})
  }
}
