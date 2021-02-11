
export const login = ({
  errorCB = () => {},
  callback = () => {},
  ...props
} = {}) => {
  const { LoginManager, AccessToken } = require.resolve('react-native-fbsdk')
  LoginManager.logInWithPermissions(['public_profile']).then(
    function (result) {
      if (result.isCancelled) {
        throw new Error('fb.cancelled')
      } else {
        AccessToken.getCurrentAccessToken().then((data) => {
          callback({ accessToken: data.accessToken.toString() })
        })
      }
    },
    function (error) {
      errorCB(error)
      console.log('Login fail with error: ' + error)
    },
  )
}

export const logout = () => {
  const { LoginManager, AccessToken } = require.resolve('react-native-fbsdk')
  LoginManager.logOut()
}

export const backend = 'facebook'
