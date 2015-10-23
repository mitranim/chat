import React from 'react'
import Firebase from 'firebase'

import {rootRef, chatRef, auth, messages} from './data'
import {renderTo, reactive, Spinner} from './utils'
import {MessageList} from './message-list'

@renderTo('[data-render-chat]')
export class Chat extends React.Component {
  @reactive
  updateState () {
    this.setState({
      auth: auth.read(),
      messages: messages.read()
    })
  }

  componentWillMount () {
    // Used to prevent accidental double send.
    this.setState({syncing: false})
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
        <MessageList authData={this.state.auth} messages={this.state.messages} handleError={this.handleError} /> : null}

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
                 name='message' ref='message' disabled={this.state.syncing} />
          <span className='input-group-btn'>
            <button type='submit' className='btn btn-default' disabled={this.state.syncing}>Send</button>
          </span>
        </form> : null}

        {/* Auth status or buttons */}
        <div className='help-block'>
          {this.state.auth ?
          <p>Authed as {this.state.auth.fullName}. <a onClick={::this.logout} className='pointer'>Logout.</a></p> :
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
    if (!this.state.auth) return

    const body = this.refs.message.value

    // Ignore an empty body.
    if (!body) return

    const message = {
      userId: this.state.auth.uid,
      authorName: this.state.auth.fullName,
      body: body,
      timestamp: Firebase.ServerValue.TIMESTAMP
    }

    // Indicate loading.
    this.setState({syncing: true})

    chatRef.push(message, err => {
      this.handleError(err)
      this.setState({syncing: false})

      if (!err) {
        const input = this.refs.message
        // Wipe it clean.
        input.value = ''
        // Restore the focus that was lost while the input was disabled.
        input.focus()
      }
    })
  }

  logout () {
    rootRef.unauth()
  }

  loginWithTwitter () {
    rootRef.authWithOAuthRedirect('twitter', this.handleError)
  }

  loginWithFacebook () {
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
