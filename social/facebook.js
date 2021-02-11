export const login = ({
  errorCB = () => {},
  callback = () => {},
  ...props
} = {}) => {
  try {
    require.resolve("react-native-fbsdk");
  } catch (e) {
    console.error(
      "auth-service: if you want use facebook backend, you have to install react-native-fbsdk and configure it"
    );
    throw e;
  }
  const { LoginManager, AccessToken } = require("react-native-fbsdk");
  LoginManager.logInWithPermissions(["public_profile"]).then(
    function (result) {
      if (result.isCancelled) {
        throw new Error("fb.cancelled");
      } else {
        AccessToken.getCurrentAccessToken().then((data) => {
          callback({ accessToken: data.accessToken.toString() });
        });
      }
    },
    function (error) {
      errorCB(error);
      console.log("Login fail with error: " + error);
    }
  );
};

export const logout = () => {
  try {
    require.resolve("react-native-fbsdk");
  } catch (e) {
    console.error(
      "auth-service: if you want use facebook backend, you have to install react-native-fbsdk and configure it"
    );
    throw e;
  }
  const { LoginManager, AccessToken } = require("react-native-fbsdk");
  LoginManager.logOut();
};

export const backend = "facebook";