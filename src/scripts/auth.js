import {rootRef, parseError} from './utils'

export function transducer (action, dispatch) {
  const {type} = action

  switch (type) {
    case 'logout': {
      rootRef.unauth()
      return
    }

    case 'loginTwitter': {
      rootRef.authWithOAuthRedirect('twitter', err => {
        if (err) dispatch({type: 'patch', value: {error: parseError(err)}})
      })
      return
    }

    case 'loginFacebook': {
      rootRef.authWithOAuthRedirect('facebook', err => {
        if (err) dispatch({type: 'patch', value: {error: parseError(err)}})
      })
      return
    }

    case 'init': {
      rootRef.onAuth(authData => {
        // Regard 'anonymous' as not logged in.
        if (authData && authData.provider === 'anonymous') authData = null

        dispatch({
          type: 'patch',
          value: {
            auth: transformAuthData(authData),
            authReady: true
          }
        })
      })
      break
    }
  }

  return action
}

function transformAuthData (data) {
  if (data) {
    const details = data[data.provider]
    data.fullName = details && details.displayName || ''
  }
  return data
}
