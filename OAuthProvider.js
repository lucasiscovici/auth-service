import React from 'react'

import { useSelector, useDispatch } from 'react-redux'
// import Auth0ProviderBasic from '@/auth/Auth0ProviderBasic'
import OAuthContext from './oauth-context'

import {
  storeTokens,
  logout,
  auth_reducer_name,
  storeBackend,
} from './oauth-state'
import { auth_reducer_name as auth_reducer_name_inner } from './oauth-internal-state'
import { AsyncAlertOneButton } from './utils'

const OAuthProvider = ({
  children,
  oauthBasic,
  textAlertBeforeExpiredLogout, // logout because tokens are expired
  textAlertBeforeLogout, // logout because user is logged out
  ...oauthprops
}) => {
  const ff = useSelector((state) => state)
  const { accessToken, expiresIn, refreshToken, backend } = useSelector(
    (state) => state[auth_reducer_name],
  )

  const { isAuthenticated, isLoading } = useSelector(
    (state) => state[auth_reducer_name_inner],
  )

  const [OAuthBasic] = React.useState(() => oauthBasic)

  // const state = useSelector((state) => state)

  const dispatch = useDispatch()

  const setAuthState = React.useCallback(
    async ({ backend: backendInner, ...tokens } = {}) => {
      await dispatch(storeBackend(backendInner))
      return dispatch(storeTokens(tokens))
    },
    [dispatch],
  )
  // OAuthBasic.setAuth(
  //   { accessToken, expiresIn, refreshToken, backend },
  //   setAuthState,
  // )

  const logoutAuth = React.useCallback(
    async (type) => {
      if (textAlertBeforeExpiredLogout && type === 'expired') {
        await AsyncAlertOneButton(null, textAlertBeforeExpiredLogout)
      }
      if (textAlertBeforeLogout && type === 'logout') {
        await AsyncAlertOneButton(null, textAlertBeforeLogout)
      }
      return dispatch(logout())
    },
    [dispatch, textAlertBeforeExpiredLogout, textAlertBeforeLogout],
  )

  React.useEffect(() => {
    // console.log(OAuthBasic)
    OAuthBasic.setAuth(
      { accessToken, expiresIn, refreshToken, backend },
      setAuthState,
    )
  }, [OAuthBasic, setAuthState, accessToken, expiresIn, refreshToken, backend])

  React.useEffect(() => {
    OAuthBasic.setCallbackBeforeLogout(logoutAuth)
  }, [OAuthBasic, logoutAuth])

  React.useEffect(() => {
    OAuthBasic.init()
  }, [])

  const contextValue = React.useMemo(() => {
    // const subscription = new Subscription(store)
    // subscription.onStateChange = subscription.notifyNestedSubs
    return {
      OAuthBasic,
      isAuthenticated,
      isLoading,
      // subscription,
    }
  }, [OAuthBasic, isAuthenticated, isLoading])
  return (
    <OAuthContext.Provider value={contextValue}>
      {children}
    </OAuthContext.Provider>
  )
}

export default OAuthProvider
