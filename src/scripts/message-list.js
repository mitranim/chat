import _ from 'lodash'
import React, {PropTypes} from 'react'
import {findDOMNode} from 'react-dom'
import {pure} from './utils'
import {read} from './store'
import {dispatch} from './dispatch'

const Message = pure(props => {
  const message = read('messages', props.id)
  if (!message) return null

  return (
    <div className={
          `list-group-item row-between-center
           ${ownMessage(message) ? 'list-group-item-success' : 'list-group-item-info'}`}>
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
      {ownMessage(message) ?
      <button className='flex-none close fa fa-times'
              onClick={() => {dispatch({type: 'delete', value: message.id})}} /> : null}
    </div>
  )
})

export class MessageList extends React.Component {
  static propTypes = {
    messageIds: PropTypes.arrayOf(PropTypes.string)
  }

  // Scroll to bottom after first render.
  componentDidMount () {
    this.scrollToBottom()
  }

  // Scroll to bottom on each data change.
  componentDidUpdate () {
    this.scrollToBottom()
  }

  render () {
    return (
      <div className='list-group messages-list'>
        {_.map(this.props.messageIds, id => (
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

function ownMessage (message) {
  const auth = read('auth')
  return !!auth && !!message.userId && (message.userId === auth.uid)
}
