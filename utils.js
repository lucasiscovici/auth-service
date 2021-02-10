import { Alert } from 'react-native'

export const awaitGently = async (rep) => rep

export const AsyncAlertOneButton = async (title, message, textButton = 'ok') =>
  new Promise((resolve) => {
    Alert.alert(
      title,
      message,
      [
        {
          text: textButton,
          onPress: () => {
            resolve()
          },
        },
      ],
      { cancelable: false },
    )
  })
