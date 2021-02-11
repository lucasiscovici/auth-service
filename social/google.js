let googleConfigured = false;
export const login = async ({
  errorCB = () => {},
  callback = () => {},
  configuration = {},
  ...props
} = {}) => {
  const {
  GoogleSignin,
  statusCodes,
} = require.resolve('@react-native-community/google-signin');
  try {
    if(Object.keys(configuration).length==0){
      console.error("auth-service: google need configuration")
    }
    GoogleSignin.configure(configuration)
    googleConfigured=true;
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
  const {
  GoogleSignin,
  statusCodes,
} = require.resolve('@react-native-community/google-signin');
   if(!googleConfigured){
      console.error("auth-service: google need configuration")
    }
  await GoogleSignin.revokeAccess()
  await GoogleSignin.signOut()
}

export const backend = 'google-oauth2'
