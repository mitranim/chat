import React from 'react'
import Firebase from 'firebase'
import {reactiveRender} from 'symphony'
import {renderTo, Spinner, on} from './utils'
import {read, dispatch} from './store'
import {MessageList} from './message-list'

@renderTo('[data-render-chat]')
@reactiveRender
export class Chat extends React.Component {
  render () {
    const auth = read('auth')
    const authReady = read('authReady')
    const messageIds = read('messageIds')
    const messagesReady = read('messagesReady')
    const sending = read('sending')
    const error = read('error')

    if (!authReady || !messagesReady) {
      return <Spinner style={{fontSize: '3em', lineHeight: '3em'}} />
    }

    return (
      <div className='chat-container'>
        <h2 className='text-center'>
          <span>🎉🎊💥</span>
          <a href='https://github.com/Mitranim/chat' target='_blank' className='pull-right fa fa-github' />
        </h2>

        {messageIds.length ?
        <p>Total messages: {messageIds.length}</p> :
        <p>There are no messages yet. Be the first!</p>}

        {messageIds.length ?
        <MessageList messageIds={messageIds} /> : null}

        {/* Error messages go here */}
        {error ?
        <div className='alert alert-warning'>
          <button type='button' className='close fa fa-times' data-dismiss='alert' />
          {error}
        </div> : null}

        {/* If authed, display the post form */}
        {auth ?
        <form className='input-group' onSubmit={::this.send}>
          <input autoFocus type='text' className='form-control' placeholder='type your message...'
                 name='message' ref='input' disabled={sending} />
          <span className='input-group-btn'>
            <button type='submit' className='btn btn-default' disabled={sending}>Send</button>
          </span>
        </form> : null}

        {/* Auth status or buttons */}
        <div className='help-block'>
          {auth ?
          <p>Authed as {auth.fullName}. <a onClick={() => {dispatch({type: 'logout'})}} className='pointer'>Logout.</a></p> :
          <p>
            <span>Log in to post: </span>
            <a className='fa fa-twitter pointer' onClick={() => {dispatch({type: 'loginTwitter'})}} />
            <span> </span>
            <a className='fa fa-facebook pointer' onClick={() => {dispatch({type: 'loginFacebook'})}} />
          </p>}
        </div>
      </div>
    )
  }

  send (event) {
    event.preventDefault()

    const body = this.refs.input.value
    if (!body) return
    const auth = read('auth')
    if (!auth) return

    dispatch({
      type: 'send',
      value: {
        userId: auth.uid,
        authorName: auth.fullName,
        body,
        timestamp: Firebase.ServerValue.TIMESTAMP
      }
    })
  }

  @on('sendSuccess')
  onSendSuccess () {
    this.refs.input.value = ''
  }

  @on('sendDone')
  onSendDone () {
    setTimeout(() => {this.refs.input.focus()})
  }
}
