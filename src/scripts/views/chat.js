const {PraxComponent} = require('prax')
const {Messages} = require('./messages')
const {Participants} = require('./participants')

export class Chat extends PraxComponent {
  subrender () {
    return (
      <div className='flex-1 row-between-stretch padding-1 children-margin-1-h'>
        <Messages className='flex-3' />
        <Participants className='flex-1' />
      </div>
    )
  }
}
