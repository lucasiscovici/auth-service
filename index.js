import React from 'react'
import AuthProviderOriginal from './OAuthProvider'
import useAuth from './useAuth'
// import useAxiosInterceptor from './useAxiosInterceptor'
import OAuthBasic from './OAuthBasic'
import { axiosInterceptor } from './axiosInterceptor'

export {
  // AuthProvider,
  useAuth,
  // useAxiosInterceptor,
  // auth_reducer,
  // auth_reducer_name,
}
import { auth_reducer, auth_reducer_name } from './oauth-state'
import {
  auth_reducer as auth_reducer_inner,
  auth_reducer_name as auth_reducer_name_inner,
} from './oauth-internal-state'

const authServiceReducers = {
  [auth_reducer_name]: auth_reducer,
  [auth_reducer_name_inner]: auth_reducer_inner,
}

export const configure = ({
  Authorization = 'Bearer',
  textAlertBeforeExpiredLogout, // logout because tokens are expired
  textAlertBeforeLogout, // logout because user is logged out
  configuration = {}, // facebook, google
  ...providerProps
} = {}) => {
  const authBasic = new OAuthBasic(providerProps, configuration)
  const ai = axiosInterceptor(authBasic)
  const config = {
    authServiceReducers,
    setStore: (store) => {
      authBasic.setDispatch(store.dispatch)
    },
    apiService: {
      Authorization,
      getToken: async () => authBasic.getAccessTokenSilently(),
      interceptors: (instance) => ai(instance),
    },
    authModule: {
      authModule: {
        config: {
          persist: {
            // whitelist: [auth_reducer_name, auth_reducer_name_inner],
          },
        },
        reducers: {
          ...authServiceReducers,
        },
      },
    },
    AuthProvider: ({ children }) => {
      return (
        <AuthProviderOriginal
          {...{
            oauthBasic: authBasic,
            textAlertBeforeExpiredLogout, // logout because tokens are expired
            textAlertBeforeLogout,
          }}
        >
          {children}
        </AuthProviderOriginal>
      )
    },
  }
  return { config }
}
