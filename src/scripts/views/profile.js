import {PraxComponent} from 'prax'
import {LoginButtons} from './auth'
import {LoadingIndicator} from './loading-indicator'

export class Profile extends PraxComponent {
  subrender ({deref}) {
    const {user, synced} = deref(this.env.deref().auth)

    return (
      <div className='page-wide padding-1'>
        {user ?
        <ProfilePage user={user} synced={synced} /> :
        !synced ?
        <LoadingIndicator /> :
        <div className='row-center-center'>
          <LoginButtons />
        </div>}
      </div>
    )
  }
}

class ProfilePage extends PraxComponent {
  subrender () {
    const {props: {user, synced}} = this

    return (
      <div className='children-margin-1-v'>
        <h2 className='row-between-center children-margin-1-h'>
          <span>Profile</span>
          {!synced ?
          <LoadingIndicator className='font-1' /> : null}
        </h2>
        <div>Welcome, {user.displayName}!</div>
      </div>
    )
  }
}
