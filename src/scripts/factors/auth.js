import {rootRef, parseError} from '../utils'
import {send, match} from '../core'

match('init', () => {
  rootRef.onAuth(authData => {
    // Regard 'anonymous' as not logged in.
    if (authData && authData.provider === 'anonymous') authData = null

    send({
      type: 'patch',
      value: {
        auth: transformAuthData(authData),
        authReady: true
      }
    })
  })
})

match({type: 'logout'}, () => {rootRef.unauth()})

match({type: 'login', provider: Boolean}, ({provider}) => {
  rootRef.authWithOAuthRedirect(provider, err => {
    if (err) send({type: 'patch', value: {error: parseError(err)}})
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
