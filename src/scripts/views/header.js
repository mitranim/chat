import {PraxComponent} from 'prax'
// import {NavLink} from './link'
import {LoginButtons, LogoutButton} from './auth'
import {LoadingIndicator} from './loading-indicator'

export class Header extends PraxComponent {
  subrender ({deref}) {
    const {user, synced} = deref(this.env.deref().auth)

    return (
      <div className='row-between-stretch' style={{height: '4rem'}}>
        {/* <div className='row-start-stretch'>
          <NavLink to='/' exact className={linkClassName}>Home</NavLink>
        </div> */}
        <div className='padding-1 row-center-center font-3'>Chat Demo</div>
        <div className='flex-1' />
        {user ?
        <UserInfo user={user} /> :
        !synced ?
        <LoadingIndicator className='font-1 padding-0x5' /> :
        <LoginButtons />}
      </div>
    )
  }
}

class UserInfo extends PraxComponent {
  subrender () {
    const {props: {user}} = this

    if (!user) return null

    const {displayName, photoURL} = user

    return (
      <span className='row-between-stretch'>
        {/* <NavLink
          to='/profile'
          className={`${linkClassName} children-margin-0x5-h`}>
          {photoURL ?
          <span
            className='inline-block square-2em bg-cover circle'
            style={{backgroundImage: `url(${photoURL})`}} /> : null}
          <span>{displayName}</span>
        </NavLink> */}
        <div className='padding-1 row-center-center children-margin-0x5-h'>
          {photoURL ?
          <span
            className='inline-block square-2em bg-cover circle'
            style={{backgroundImage: `url(${photoURL})`}} /> : null}
          <span>{displayName}</span>
        </div>
        <LogoutButton />
      </span>
    )
  }
}

// const linkClassName = 'padding-1 row-center-center interact-04-bg'
