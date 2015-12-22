import React from 'react'
import {renderTo, Spinner} from '../utils'
import {read, send, auto} from '../core'
import {MessageList} from './message-list'

renderTo('[data-render-chat]')(auto(props => {
  const auth = read('auth')
  const authReady = read('authReady')
  const messageIds = read('messageIds')
  const messagesReady = read('messagesReady')
  const {text, error, sending} = read('chat')

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
      <MessageList /> : null}

      {/* Error messages go here */}
      {error ?
      <div className='alert alert-warning'>
        <button type='button' className='close fa fa-times' data-dismiss='alert' />
        {error}
      </div> : null}

      {/* If authed, display the post form */}
      {auth ?
      <form className='input-group' onSubmit={sendMessage}>
        <input autoFocus type='text' className='form-control' placeholder='type your message...'
               value={text} onChange={onChange} />
        <span className='input-group-btn'>
          <button type='submit' className='btn btn-default' disabled={sending}>Send</button>
        </span>
      </form> : null}

      {/* Auth status or buttons */}
      <div className='help-block'>
        {auth ?
        <p>Authed as {auth.fullName}. <a onClick={() => {send({type: 'logout'})}} className='pointer'>Logout.</a></p> :
        <p>
          <span>Log in to post: </span>
          <a className='fa fa-twitter pointer' onClick={() => {login('twitter')}} />
          <span> </span>
          <a className='fa fa-facebook pointer' onClick={() => {login('facebook')}} />
        </p>}
      </div>
    </div>
  )
}))

function login (provider) {
  send({type: 'login', provider})
}

function onChange ({target: {value}}) {
  send({type: 'set', path: ['chat', 'text'], value})
}

function sendMessage (event) {
  event.preventDefault()
  send('chat/send')
}
