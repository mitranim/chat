import React from 'react'
import Firebase from 'firebase'

import {auth, messages} from './data'
import {renderTo, reactive, Spinner} from './utils'
import {actions, on} from './actions'
import {MessageList} from './message-list'

@renderTo('[data-render-chat]')
export class Chat extends React.Component {
  state = {}

  @reactive
  update () {
    this.setState({
      auth: auth.read(),
      messages: messages.read()
    })
  }

  render () {
    if (!auth.ready || !messages.ready) {
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
                 name='message' ref='input' disabled={this.state.syncing} />
          <span className='input-group-btn'>
            <button type='submit' className='btn btn-default' disabled={this.state.syncing}>Send</button>
          </span>
        </form> : null}

        {/* Auth status or buttons */}
        <div className='help-block'>
          {this.state.auth ?
          <p>Authed as {this.state.auth.fullName}. <a onClick={actions.logout} className='pointer'>Logout.</a></p> :
          <p>
            <span>Log in to post: </span>
            <a className='fa fa-twitter pointer' onClick={actions.login.twitter} />
            <span> </span>
            <a className='fa fa-facebook pointer' onClick={actions.login.facebook} />
          </p>}
        </div>
      </div>
    )
  }

  send (event) {
    event.preventDefault()

    const body = this.refs.input.value
    if (!body) return

    this.setState({syncing: true})

    actions.send({
      userId: this.state.auth.uid,
      authorName: this.state.auth.fullName,
      body,
      timestamp: Firebase.ServerValue.TIMESTAMP
    })
  }

  @on.send.success
  onSendSuccess () {
    this.setState({syncing: false})
    const {input} = this.refs
    input.value = ''
    input.focus()
  }

  @on.send.error
  onSendError () {
    this.setState({syncing: false})
  }

  @on.send.error
  @on.login.twitter.error
  @on.login.facebook.error
  onError (err) {
    console.error(err)
    // Firebase returns Error instances; we need to extract the message to
    // display it.
    if (err instanceof Error && err.message) err = err.message
    this.setState({error: err})
  }
}
