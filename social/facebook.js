import { AccessToken } from 'react-native-fbsdk'
import { LoginManager } from 'react-native-fbsdk'

export const login = ({
  errorCB = () => {},
  callback = () => {},
  ...props
} = {}) => {
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
  LoginManager.logOut()
}

export const backend = 'facebook'
