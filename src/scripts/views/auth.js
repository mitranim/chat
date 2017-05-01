import {PraxComponent} from 'prax'

export class LoginButtons extends PraxComponent {
  subrender () {
    return (
      <span>
        <button
          className='cursor-pointer padding-1 aria-label-position-left'
          aria-label='Login with Twitter'
          onClick={() => {
            this.env.deref().auth.login('twitter')
          }}>
          <span className='fa fa-twitter' />
        </button>
        <button
          className='cursor-pointer padding-1 aria-label-position-left'
          aria-label='Login with Facebook'
          onClick={() => {
            this.env.deref().auth.login('facebook')
          }}>
          <span className='fa fa-facebook' />
        </button>
      </span>
    )
  }
}

export class LogoutButton extends PraxComponent {
  subrender () {
    return (
      <button
        className='cursor-pointer padding-0x5 aria-label-position-left'
        aria-label='Logout'
        onClick={() => {
          this.env.deref().auth.logout()
        }}>
        <span className='fa fa-sign-out' />
      </button>
    )
  }
}
