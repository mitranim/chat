const {PraxComponent} = require('prax')
const {Messages} = require('./messages')
const {Participants} = require('./participants')

export class Chat extends PraxComponent {
  subrender () {
    return (
      <div className='flex-1 row-between-stretch children-margin-2-h'>
        <Messages className='flex-3' />
        <Participants className='flex-1' />
      </div>
    )
  }
}
