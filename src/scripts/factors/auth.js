import {rootRef, parseError} from '../utils'
import {set, match} from '../core'

match('init', () => {
  rootRef.onAuth(authData => {
    // Regard 'anonymous' as not logged in.
    if (authData && authData.provider === 'anonymous') authData = null

    set(['auth'], transformAuthData(authData))
    set(['authReady'], true)
  })
})

match('logout', () => {rootRef.unauth()})

match({type: 'login', provider: Boolean}, ({provider}) => {
  rootRef.authWithOAuthRedirect(provider, err => {
    if (err) set(['chat', 'error'], parseError(err))
  })
})

/**
 * Utils
 */

function transformAuthData (data) {
  if (data) {
    const details = data[data.provider]
    data.fullName = details && details.displayName || ''
  }
  return data
}
