import { useContext, useReducer, useMemo, useRef, useState } from 'react'
import OAuthContext from './oauth-context'
import { useIsomorphicLayoutEffect } from 'react-redux/src/utils/useIsomorphicLayoutEffect'
import { auth_reducer_name } from './auth-state'
const useOAuthBasic = () => {
  const { OAuthBasic, isAuthenticated, isLoading } = useContext(OAuthContext)
  return { OAuthBasic, isAuthenticated, isLoading }
}

const refEquality = (a, b) => a === b

function useSelectorWithStoreAndSubscription(
  OAuthBasic,
  selector,
  name,
  equalityFn = refEquality,
) {
  const [, forceRender] = useReducer((s) => s + 1, 0)

  // const subscription = useMemo(() => new Subscription(store, contextSub), [
  //   store,
  //   contextSub,
  // ])

  const latestSubscriptionCallbackError = useRef()
  const latestSelector = useRef()
  const latestStoreState = useRef()
  const latestSelectedState = useRef()

  const storeState = OAuthBasic.innerState
  let selectedState

  try {
    if (
      selector !== latestSelector.current ||
      storeState !== latestStoreState.current ||
      latestSubscriptionCallbackError.current
    ) {
      selectedState = selector(storeState)
    } else {
      selectedState = latestSelectedState.current
    }
  } catch (err) {
    if (latestSubscriptionCallbackError.current) {
      err.message += `\nThe error may be correlated with this previous error:\n${latestSubscriptionCallbackError.current.stack}\n\n`
    }

    throw err
  }

  useIsomorphicLayoutEffect(() => {
    latestSelector.current = selector
    latestStoreState.current = storeState
    latestSelectedState.current = selectedState
    latestSubscriptionCallbackError.current = undefined
  })

  useIsomorphicLayoutEffect(() => {
    function checkForUpdates() {
      try {
        const newSelectedState = latestSelector.current(OAuthBasic.innerState)
        console.log(
          name,
          newSelectedState,
          latestSelectedState.current,
          equalityFn(newSelectedState, latestSelectedState.current),
        )
        if (equalityFn(newSelectedState, latestSelectedState.current)) {
          return
        }

        latestSelectedState.current = newSelectedState
      } catch (err) {
        // we ignore all errors here, since when the component
        // is re-rendered, the selectors are called again, and
        // will throw again, if neither props nor store state
        // changed
        latestSubscriptionCallbackError.current = err
      }

      forceRender()
    }

    OAuthBasic.setCb(name, checkForUpdates)

    checkForUpdates()

    return () => OAuthBasic.setCb(name)
  }, [OAuthBasic])

  return selectedState
}

const useAuth = () => {
  const { OAuthBasic, isAuthenticated, isLoading } = useOAuthBasic()

  // const isAuthenticated = useSelectorWithStoreAndSubscription(
  //   OAuthBasic,
  //   (state) => state.isAuthenticated,
  //   'isAuthenticated',
  // )
  // const isLoading = useSelectorWithStoreAndSubscription(
  //   OAuthBasic,
  //   (state) => state.isLoading,
  //   'isLoading',
  // )
  // const isAuthenticated = useSelector(
  //   (state) => state[auth_reducer_name].isAuthenticated,
  // )
  // const isLoading = useSelector((state) => state[auth_reducer_name].isLoading)

  return {
    isAuthenticated,
    isLoading,
    loginWithBackend: OAuthBasic.loginWithBackend,
    getAccessTokenSilently: OAuthBasic.getAccessTokenSilently,
    logout: OAuthBasic.logout,
    loginWithUsernamePassword: OAuthBasic.loginWithUsernamePassword,
  }
}

export default useAuth
