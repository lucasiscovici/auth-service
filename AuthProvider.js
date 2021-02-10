import React from 'react'

import { useSelector, useDispatch } from 'react-redux'
import Auth0ProviderBasic from '@/auth/Auth0ProviderBasic'
import {
  storeTokens,
  logout,
  auth_reducer_name,
  storeBackend,
} from '@/auth/auth-state'
import { AsyncAlertOneButton } from './utils'

const Auth0Provider = ({
  children,
  textAlertBeforeExpiredLogout, // logout because tokens are expired
  textAlertBeforeLogout, // logout because user is logged out
  ...auth0props
}) => {
  const { accessToken, expiresIn, refreshToken, backend } = useSelector(
    (state) => state[auth_reducer_name],
  )
  // const state = useSelector((state) => state)

  const dispatch = useDispatch()

  const setAuthState = React.useCallback(
    async ({ backend: backendInner, ...tokens } = {}) => {
      await dispatch(storeBackend(backendInner))
      return dispatch(storeTokens(tokens))
    },
    [dispatch],
  )

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

  return (
    <Auth0ProviderBasic
      {...auth0props}
      authState={{ accessToken, expiresIn, refreshToken, backend }}
      setAuthState={setAuthState}
      callbackBeforeLogout={logoutAuth}
      logoutIfTokensExpired
      autostart={accessToken || expiresIn || refreshToken}
    >
      {children}
    </Auth0ProviderBasic>
  )
}

export default Auth0Provider
