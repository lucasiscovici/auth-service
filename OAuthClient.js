import Auth from './auth'
// import AuthError from 'react-native-auth0/src/auth/authError';
// import jwtDecoder from 'jwt-decode';
import { backends } from './social'

export default class OAuthClient {
  constructor({
    domain,
    clientId,
    clientSecret,
    baseUrlAuth,
    authState = {},
    setAuthState,
    configuration,
  } = {}) {
    this.client = new Auth({
      clientId,
      clientSecret,
      baseUrl: baseUrlAuth,
    })
    this.logout = this.logout.bind(this)
    this.configuration = configuration
  }

  setAuth(authState, setAuthState) {
    this.setAuthState = setAuthState
    this.authState = authState
  }

  async logout(callbackError = () => {}) {
    if(this.backend){
      await new Promise((resolve, reject) =>
            backends[backend].logout({ callback: resolve, errorCB: () => {}}),
          )
    }
    if (this?.authState?.accessToken) {
      this.client.webAuth
        .clearSession({ token: this?.authState?.accessToken })
        .catch(callbackError)
    }
  }

  async loginWithUsernamePassword(username, password) {
    // const { accessToken: socialToken } = await new Promise((resolve, reject) =>
    //   // backends[backend].login({ callback: resolve, errorCB: () => {} }),
    // )
    const backend = 'password'
    const {
      access_token: accessToken,
      expires_in: expiresIn,
      refresh_token: refreshToken,
    } = await this.client.auth.login({
      username,
      password,
    })
    // const expiresIn = jwtDecoder(accessToken).exp;

    await this.setAuthState({
      ...this.authState,
      accessToken,
      expiresIn: Math.floor(Date.now() / 1000) + expiresIn,
      refreshToken,
      backend,
    })
    return {
      accessToken,
      expiresIn: Math.floor(Date.now() / 1000) + expiresIn,
      refreshToken,
      backend,
    }
  }

  async loginWithBackend({ backend } = {}) {
    const { accessToken: socialToken } = await new Promise((resolve, reject) =>
      backends[backend].login({ callback: resolve, errorCB: () => {}, configuration: this.configuration[backend] }),
    )
    this.backend = backend;
    const {
      access_token: accessToken,
      expires_in: expiresIn,
      refresh_token: refreshToken,
    } = await this.client.webAuth.authorize({
      accessTokenSocial: socialToken,
      backend,
    })
    // const expiresIn = jwtDecoder(accessToken).exp;

    await this.setAuthState({
      ...this.authState,
      accessToken,
      expiresIn: Math.floor(Date.now() / 1000) + expiresIn,
      refreshToken,
      backend,
    })
    return {
      accessToken,
      expiresIn: Math.floor(Date.now() / 1000) + expiresIn,
      refreshToken,
      backend,
    }
  }

  /* getTokensSilently
     Give an access token if possible else return null

     - We check if an access token is present
     - We check if access token is expired
     - We check if refresh token is present
     - We check if refresh token is expired (AuthError)

   return
     access token or null
     if null : all tokens (access, refresh) are expired :
       - if access token is expired and no refresh token is present
       - if access token is expired and refresh token is expired (AuthError)
   throw Error
  */
  async getTokensSilently({
    authState: authState_ = null,
    ignoreCache = false,
    scope: scope_ = null,
    debug = false,
  } = {}) {
    const scope = scope_ ?? this.scope
    var authState = authState_ ?? this.authState
    if (authState_ && this.authState) {
      authState = { ...this.authState, ...authState_ }
    }

    const getAccessTokenFromAuthState = () => {
      const expiresIn = authState?.expiresIn ?? null
      const accessToken = authState?.accessToken ?? null

      return expiresIn && accessToken
        ? expiresIn < Math.floor(Date.now() / 1000)
          ? null
          : { accessToken, expiresIn }
        : null
    }

    if (!ignoreCache) {
      const access_token_with_expires = getAccessTokenFromAuthState()
      if (access_token_with_expires) {
        return {
          ...access_token_with_expires,
          refreshToken: authState.refreshToken,
        }
      }
    }
    if (!authState?.refreshToken) return null
    try {
      const {
        access_token: accessToken,
        expires_in: expiresIn,
        refresh_token: refreshToken,
      } = await this.client.auth.refreshToken({
        refreshToken: authState.refreshToken,
      })
      // console.log(accessToken);
      // const expiresIn = jwtDecoder(accessToken).exp;
      const newState = {
        ...authState,
        accessToken,
        expiresIn: Math.floor(Date.now() / 1000) + expiresIn,
        refreshToken,
      }

      await this.setAuthState(newState)
      return newState
    } catch (e) {
      const error = e
      if (debug) console.log(e)
      // if (e instanceof AuthError) {
      //   return null;
      // }
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        if ([400, 401].includes(error.response.status)) {
          return null
        }
        console.log(error.response.data)
        console.log(error.response.status)
        console.log(error.response.headers)
      }
      if (debug) console.log('OAuthClient—error: ', e)
      throw e
    }
  }

  // async getUserInfo({authState: authState_ = null}) {
  //   const authState = authState_ ?? this.authState;
  //   if (authState.accessToken) {
  //     const infos = await this.client.auth.userInfo({
  //       token: authState.accessToken,
  //     });
  //     return infos;
  //   }
  //   return null;
  // }
}
