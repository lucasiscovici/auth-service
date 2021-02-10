import React, { useCallback, useEffect, useReducer, useState } from 'react'
import Auth0Context from './auth0-context'
import { reducer, initialAuthState } from './auth0-internal-state'
import Client from './Auth0Client'
import { awaitGently } from './utils'

/**
 * ```jsx
 * <Auth0Provider
 *   domain={domain}
 *   clientId={clientId}
 *   authState={authState}
 *   setAuthState={setAuthState}
 *   callbackIfLogout={callbackIfLogout}
 *   logoutIfTokensExpired
 *   <MyApp />
 * </Auth0Provider>
 * ```
 *
 * Provides the Auth0Context to its child components.
 */
const Auth0ProviderBasic = (opts_auth0 = {}) => {
  const {
    children,
    clientId,
    clientSecret,
    baseUrlAuth,
    authState,
    setAuthState = async () => {},
    logoutIfTokensExpired = false,
    callbackAfterLogout = async (type) => {}, // type : expired, logout
    callbackBeforeLogout = async (type) => {}, // type : expired, logout
    debug = false,
    addToProvider = {},
    autostart = true,
  } = opts_auth0

  const [client] = useState(
    () =>
      new Client({
        clientId,
        clientSecret,
        baseUrlAuth,
        authState,
        setAuthState,
      }),
  )

  const getTokensSilently = React.useCallback(
    async (...res) => {
      try {
        return await client.getTokensSilently(...res)
      } catch (e) {
        if (debug) console.log('Auth0Provider-Error: ', e)
        throw e
      }
    },
    [client, debug],
  )

  const [state, dispatch] = useReducer(reducer, initialAuthState)

  useEffect(() => {
    if (client) {
      client.authState = authState
    }
  }, [client, authState])

  const getAccessTokenSilently = useCallback(
    async (...res) => {
      const tokens = await getTokensSilently(...res)
      if (!tokens && logoutIfTokensExpired) {
        await logout('expired')
        return null
      }
      return tokens?.accessToken ?? tokens?.access_token
    },
    [getTokensSilently, logout, logoutIfTokensExpired],
  )

  // When view appear check if the token exist
  useEffect(() => {
    ;(async () => {
      if (!autostart) return
      await dispatch({ type: 'LOADING_START' })
      const tokens = await getAccessTokenSilently()
      // if tokens is null -> all tokens (access, refresh) are expired
      if (tokens) {
        await dispatch({ type: 'INITIALISED' })
      }

      await dispatch({ type: 'LOADING_END' })
    })()
  }, [client, getTokensSilently, dispatch, logoutIfTokensExpired])

  const loginWithBackend = useCallback(
    async (backend) => {
      try {
        await dispatch({ type: 'LOADING_START' })
        const tokens = await client.loginWithBackend(backend)
        await dispatch({ type: 'INITIALISED' })
        return tokens
      } catch (e) {
        if (e.error !== 'a0.session.user_cancelled') {
          throw e
        }
      } finally {
        await dispatch({ type: 'LOADING_END' })
      }
    },
    [client, dispatch],
  )

  const logout = useCallback(
    async (type = 'logout', ...opts) => {
      await awaitGently(callbackBeforeLogout(type))
      await client.logout(...opts)
      await dispatch({ type: 'LOGOUT' })
      await awaitGently(callbackAfterLogout(type))
    },
    [client, dispatch, callbackBeforeLogout, callbackAfterLogout],
  )

  return (
    <Auth0Context.Provider
      value={{
        ...addToProvider,
        ...state,
        getAccessTokenSilently,
        loginWithBackend,
        logout,
      }}
    >
      {children}
    </Auth0Context.Provider>
  )
}
export default Auth0ProviderBasic
