export const initialAuthState = {
  isAuthenticated: false,
  isLoading: false,
}

export const reducer = (state = initialAuthState, action) => {
  switch (action.type) {
    case 'AUTH0_INTERNAL_LOADING_START':
      return {
        ...state,
        isLoading: true,
      }
    case 'AUTH0_INTERNAL_INITIALISED':
      return {
        ...state,
        isAuthenticated: true,
      }
    case 'AUTH0_INTERNAL_LOADING_END':
      return {
        ...state,
        isLoading: false,
      }
    case 'AUTH0_INTERNAL_LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        isLoading: false,
      }
    default:
      return state
  }
}
const auth_reducer_name = 'auth0-internal'

const auth_reducer = reducer
export { auth_reducer_name, auth_reducer }
