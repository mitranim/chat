import React, {PropTypes} from 'react'
import {findDOMNode} from 'react-dom'
import _ from 'lodash'
import {chatRef} from './data'

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
        {_.map(this.props.messages, message => (
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
    return !!this.props.authData && !!message.userId && (message.userId === this.props.authData.uid)
  }

  scrollToBottom () {
    const list = findDOMNode(this)
    list.scrollTop = list.scrollHeight - list.getBoundingClientRect().height
  }
}
