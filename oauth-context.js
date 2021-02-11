import { createContext } from 'react'
// import { initialAuthState } from './auth0-internal-state'

const stub = () => {
  throw new Error('You forgot to wrap your component in <OAuthProvider>.')
}

const initialContext = {
  OAuthBasic: stub,
}

const OAuthContext = createContext(initialContext)

export default OAuthContext
