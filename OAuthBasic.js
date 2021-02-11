// import React, { useCallback, useEffect, useReducer, useState } from 'react'
import OAuthContext from './oauth-context'
import { reducer, initialAuthState } from './oauth-internal-state'
import Client from './OAuthClient'
import { awaitGently } from './utils'
import { createStore } from 'redux'

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
export default class OAuthBasic {
  constructor(opts_oauth = {}, configuration={}) {
    const {
      clientId,
      clientSecret,
      baseUrlAuth,
      // authState,
      // setAuthState = async () => {},
      logoutIfTokensExpired = false,
      callbackAfterLogout = async (type) => {}, // type : expired, logout
      callbackBeforeLogout = async (type) => {}, // type : expired, logout
      debug = false,
      addToProvider = {},
      autostart = true,
    } = opts_oauth
    this.debug = debug
    this.cb = {}
    this.configuration = configuration
    this.autostart = autostart
    this.callbackAfterLogout = callbackAfterLogout
    this.callbackBeforeLogout = callbackBeforeLogout
    this.logoutIfTokensExpired = logoutIfTokensExpired
    this.client = new Client({
      clientId,
      clientSecret,
      baseUrlAuth,
      configuration
      // authState,
      // setAuthState,
    })
    // this.store = createStore(reducer, initialAuthState)
    // this.innerState = this.store.getState()
    // this.innerDispatch = this.store.dispatch
    // console.log(this.innerDispatch, this.store, this.store.dispatch)
    // const that = this
    // this.store.subscribe(() => {
    //   that.innerState = that.store.getState()
    //   console.log(that.cb)
    //   Object.entries(that.cb).forEach(([k, v]) => v(that.innerState))
    // })

    this.loginWithUsernamePassword = this.loginWithUsernamePassword.bind(this)
    this.getAccessTokenSilently = this.getAccessTokenSilently.bind(this)
    this.loginWithBackend = this.loginWithBackend.bind(this)
    this.logout = this.logout.bind(this)
    this.setCallbackAfterLogout = this.setCallbackAfterLogout.bind(this)
    this.setCallbackBeforeLogout = this.setCallbackBeforeLogout.bind(this)
  }

  setCb(name, cb) {
    if (name && cb) {
      this.cb[name] = cb
    } else {
      delete this.cb[name]
    }
  }

  setDispatch(dispatch) {
    this.dispatch = dispatch
  }

  setAutoStart(autostart) {
    this.autostart = autostart
  }
  setCallbackAfterLogout(callbackAfterLogout) {
    this.callbackAfterLogout = callbackAfterLogout
  }
  setCallbackBeforeLogout(callbackBeforeLogout) {
    this.callbackBeforeLogout = callbackBeforeLogout
  }
  setLogoutIfTokensExpired(logoutIfTokensExpired) {
    this.logoutIfTokensExpired = logoutIfTokensExpired
  }

  setAuth(authState, setAuthState) {
    this.authState = authState
    this.setAuthState = setAuthState
    this.client.setAuth(authState, setAuthState)
  }

  setAuthInternal(authState) {
    this.innerState = authState
    // this.setInnerState = setAuthState
    // this.client.setAuth(authState, setAuthState)
  }

  getAuth() {
    return {
      ...this.addToProvider,
      ...this.innerState,
      getAccessTokenSilently: this.getAccessTokenSilently,
      loginWithBackend: this.loginWithBackend,
      logout: this.logout,
    }
  }

  async init() {
    // When view appear check if the token exist

    if (!this.autostart) {
      return
    }
    this.dispatch({ type: 'OAUTH_INTERNAL_LOADING_START' })
    const tokens = await this.getAccessTokenSilently()
    // if tokens is null -> all tokens (access, refresh) are expired
    if (tokens) {
      this.dispatch({ type: 'OAUTH_INTERNAL_INITIALISED' })
    }

    this.dispatch({ type: 'OAUTH_INTERNAL_LOADING_END' })
  }

  updateClientAuth(authState) {
    this.client.authState = authState
  }

  async getTokensSilently(...res) {
    try {
      return await this.client.getTokensSilently(...res)
    } catch (e) {
      if (this.debug) {
        console.log('OAuthProvider-Error: ', e)
      }
      throw e
    }
  }
  async getAccessTokenSilently(...res) {
    const tokens = await this.getTokensSilently(...res)
    if (!tokens && this.logoutIfTokensExpired) {
      await this.logout('expired')
      return null
    }
    return tokens?.accessToken ?? tokens?.access_token
  }
  async loginWithBackend(backend) {
    try {
      this.dispatch({ type: 'OAUTH_INTERNAL_LOADING_START' })
      const tokens = await this.client.loginWithBackend(backend)
      this.dispatch({ type: 'OAUTH_INTERNAL_INITIALISED' })
      return tokens
    } catch (e) {
      if (e.error !== 'a0.session.user_cancelled') {
        throw e
      }
    } finally {
      this.dispatch({ type: 'OAUTH_INTERNAL_LOADING_END' })
    }
  }

  async loginWithUsernamePassword(username, password) {
    try {
      this.dispatch({ type: 'OAUTH_INTERNAL_LOADING_START' })
      const tokens = await this.client.loginWithUsernamePassword(
        username,
        password,
      )
      this.dispatch({ type: 'OAUTH_INTERNAL_INITIALISED' })
      return tokens
    } catch (e) {
      if (e.error !== 'a0.session.user_cancelled') {
        throw e
      }
    } finally {
      this.dispatch({ type: 'OAUTH_INTERNAL_LOADING_END' })
    }
  }

  async logout(type = 'logout', ...opts) {
    await awaitGently(this.callbackBeforeLogout(type))
    await awaitGently(this.client.logout(...opts))
    this.dispatch({ type: 'OAUTH_INTERNAL_LOGOUT' })
    await awaitGently(this.callbackAfterLogout(type))
  }
}
