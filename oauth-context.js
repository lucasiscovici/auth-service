import { createContext } from 'react'
// import { initialAuthState } from './auth0-internal-state'

const stub = () => {
  throw new Error('You forgot to wrap your component in <Auth0Provider>.')
}

const initialContext = {
  OAuthBasic: stub,
}

const Auth0Context = createContext(initialContext)

export default Auth0Context
