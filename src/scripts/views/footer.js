const {PraxComponent} = require('prax')

export class Footer extends PraxComponent {
  subrender () {
    return (
      <div className='padding-1 row-between-stretch fg-54'>
        <span className='flex-1 children-margin-0x25-h'>
          <span>Powered by</span>
          <a href={'https://firebase.google.com'} target='_blank'>Firebase</a>,
          <a href={'https://facebook.github.io/react/'} target='_blank'>React</a>,
          <a href={'https://mitranim.com/prax/'} target='_blank'>Prax</a>
        </span>
        <span className='text-right'>
          <a href='https://github.com/Mitranim/chat' target='_blank' className='children-margin-0x25-h'>
            <span>Source</span>
            <span className='fa fa-github' />
          </a>
        </span>
      </div>
    )
  }
}
