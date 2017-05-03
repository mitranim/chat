import {PraxComponent} from 'prax'
import {LoginButtons} from './auth'
import {LoadingIndicator} from './loading-indicator'

export class Profile extends PraxComponent {
  subrender ({deref}) {
    const {user, synced} = deref(this.env.deref().auth)

    return (
      <div className='page-wide padding-1 children-margin-1-v'>
        <h2 className='row-between-center children-margin-1-h'>
          <span>{user ? 'Profile' : null}</span>
          <LoadingIndicator enabled={!synced} className='font-1' />
        </h2>
        {user ?
        <div>Welcome, {user.displayName}!</div> :
        synced ?
        <div className='row-center-center'>
          <LoginButtons />
        </div>
        : null}
      </div>
    )
  }
}
