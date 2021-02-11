export const STORE_TOKENS = 'OAUTH_STORE_TOKENS'

export const STORE_BACKEND = 'OAUTH_STORE_BACKEND'

export const RECEIVE_LOGOUT = 'OAUTH_RECEIVE_LOGOUT'

export const TEST_EXPIRE_ACCESS_TOKEN = 'OAUTH_TEST_EXPIRE_ACCESS_TOKEN'

export const TEST_EXPIRE_REFRESH_TOKEN = 'OAUTH_TEST_EXPIRE_REFRESH_TOKEN'

export const DELETE_ACCESS_TOKEN = 'OAUTH_DELETE_ACCESS_TOKEN'

export const authInitialState = {
  accessToken: null,
  expiresIn: null,
  refreshToken: null,
  backend: null,
}

function auth_reducer(state = authInitialState, action) {
  switch (action.type) {
    case STORE_BACKEND:
      return {
        ...state,
        backend: action.backend,
      }
    case STORE_TOKENS:
      return {
        ...state,
        accessToken: action.accessToken,
        expiresIn: action.expiresIn,
        refreshToken: action.refreshToken,
      }
    case DELETE_ACCESS_TOKEN:
      return {
        ...state,
        accessToken: action.accessToken,
        expiresIn: action.expiresIn,
      }
    case RECEIVE_LOGOUT:
      return {
        ...state,
        ...authInitialState,
      }
    case TEST_EXPIRE_ACCESS_TOKEN:
      return {
        ...state,
        expiresIn: Math.floor(Date.now() / 1000) - 1000, // 1000 second before now
      }
    case TEST_EXPIRE_REFRESH_TOKEN:
      return {
        ...state,
        refreshToken: 'WQDpCTEgRvvVhKevfqIVgtdjP3XUEFqCNKD6oLZA-5DiX',
      }
    default:
      return state
  }
}

export const storeBackend = (backend) => ({
  type: STORE_BACKEND,
  backend,
})

export const storeTokens = (tokens) => ({
  type: STORE_TOKENS,
  ...tokens,
})

export const deleteAccessToken = () => ({
  type: DELETE_ACCESS_TOKEN,
})

export const logout = () => ({
  type: RECEIVE_LOGOUT,
})

export const testExpireAccessToken = () => ({
  type: TEST_EXPIRE_ACCESS_TOKEN,
})
export const testExpireRefreshToken = () => ({
  type: TEST_EXPIRE_REFRESH_TOKEN,
})

const auth_reducer_name = 'oauth'

export { auth_reducer_name, auth_reducer }
