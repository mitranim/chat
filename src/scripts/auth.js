import {storeDispatch, rootRef} from './store'
import {parseError} from './utils'

export function transducer (action) {
  const {type} = action

  switch (type) {
    case 'logout': {
      rootRef.unauth()
      return
    }
    case 'loginTwitter': {
      rootRef.authWithOAuthRedirect('twitter', err => {
        if (err) storeDispatch({type: 'patch', value: {error: parseError(err)}})
      })
      return
    }
    case 'loginFacebook': {
      rootRef.authWithOAuthRedirect('facebook', err => {
        if (err) storeDispatch({type: 'patch', value: {error: parseError(err)}})
      })
      return
    }
  }

  return action
}

rootRef.onAuth(authData => {
  // Regard 'anonymous' as not logged in.
  if (authData && authData.provider === 'anonymous') authData = null

  storeDispatch({
    type: 'patch',
    value: {
      auth: transformAuthData(authData),
      authReady: true
    }
  })
})

function transformAuthData (data) {
  if (data) {
    const details = data[data.provider]
    data.fullName = details && details.displayName || ''
  }
  return data
}
