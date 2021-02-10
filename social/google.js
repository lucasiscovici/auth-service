import {
  GoogleSignin,
  statusCodes,
} from '@react-native-community/google-signin'

GoogleSignin.configure({
  webClientId:
    '240782133733-cgrt6b2l7ugtu4p3lb5j6vo325l9r9o4.apps.googleusercontent.com', // client ID of type WEB for your server (needed to verify user ID and offline access)
  // accountName: '', // [Android] specifies an account name on the device that should be used
  iosClientId:
    '240782133733-itgu11uf2pel1bvgfk60pi17qmj8u6j9.apps.googleusercontent.com', // [iOS] optional, if you want to specify the client ID of type iOS (otherwise, it is taken from GoogleService-Info.plist)
})

export const login = async ({
  errorCB = () => {},
  callback = () => {},
  ...props
} = {}) => {
  try {
    const userInfo = await GoogleSignin.signIn()
    const token = await GoogleSignin.getTokens()
    callback(token)
  } catch (error) {
    if (error.code === statusCodes.SIGN_IN_CANCELLED) {
      // user cancelled the login flow
      throw new Error('google.cancelled')
    } else if (error.code === statusCodes.IN_PROGRESS) {
      // operation (e.g. sign in) is in progress already
      errorCB(error)
    } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
      // play services not available or outdated
      errorCB(error)
    } else {
      errorCB(error)
      // some other error happened
    }
  }
}

export const logout = async () => {
  await GoogleSignin.revokeAccess()
  await GoogleSignin.signOut()
}

export const backend = 'google-oauth2'
