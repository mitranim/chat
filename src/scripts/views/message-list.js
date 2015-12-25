import _ from 'lodash'
import React, {PropTypes} from 'react'
import {findDOMNode} from 'react-dom'
import {send, auto, reactiveRender} from '../core'

// The component is automatically updated when the message it accesses through
// the `read` function is changed. (For that to happen, the message would have
// to be edited.) It's never updated willy-nilly.
const Message = auto((props, read) => {
  const message = read('messages', props.id)
  if (!message) return null
  const own = message.userId && message.userId === read('auth', 'uid')

  return (
    <div className={`list-group-item row-between-center
                    ${own ? 'list-group-item-success' : 'list-group-item-info'}`}>
      <div className='flex-1 typographic-container'>
        <p>
          <strong>{message.authorName}</strong>
          <span className='text-muted'> at {new Date(message.timestamp).toLocaleString()}</span>
        </p>
        <p>{message.body}</p>
        {_.map(message.imageUrls, url => (
          <img src={url} className='message-image-embed' onLoad={props.scrollToBottom} key={url} />
        ))}
      </div>

      {/* For own messages, display a dismiss button */}
      {own ?
      <button className='flex-none close fa fa-times'
              onClick={() => {send({type: 'chat/delete', id: message.id})}} /> : null}
    </div>
  )
})

Message.propTypes = {
  id: PropTypes.string.isRequired,
  scrollToBottom: PropTypes.func.isRequired
}

@reactiveRender
export class MessageList extends React.Component {
  // Scroll to bottom after first render.
  componentDidMount () {
    this.scrollToBottom()
  }

  // Scroll to bottom on each change in the message ids.
  componentDidUpdate () {
    this.scrollToBottom()
  }

  render (read) {
    const messageIds = read('messageIds')
    return (
      <div className='list-group messages-list'>
        {_.map(messageIds, id => (
          <Message id={id} scrollToBottom={this.scrollToBottom} key={id} />
        ))}
      </div>
    )
  }

  scrollToBottom = () => {
    window.requestAnimationFrame(() => {
      const list = findDOMNode(this)
      if (list) list.scrollTop = list.scrollHeight - list.getBoundingClientRect().height
    })
  }
}
