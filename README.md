# Auth0 in react-native

## Auth0Provider

Auth0Provider manage for us the redux auth0 state

## Auth0ProviderBasic

Auth0ProviderBasic don't manage for us the redux auth0 state (we have to pass the state and the setState)

# With Auth0Provider

## SetUp Auth0Provider

In you App.js inside the redux provider

```jsx
import { Auth0Provider } from "@/auth";
...
 <Provider store={store}>
 ...
	 <Auth0Provider
	      domain='<AUTH0 DOMAIN>'
	      clientId='<CLIENT ID>'
	      audience='<AUDIENCE>'
	      scope='<SCOPE>'
	    >
	      ...
	    </Auth0Provider>
 ...
 <Provider>
 ...
```

## SetUp redux reducer

Add the Auth0 reducer to your reducers

```jsx
import { auth0_reducer, auth0_reducer_name } from '@/auth'

const rootReducer = combineReducers({
  ...
  [auth0_reducer_name]: auth0_reducer,
});


```

### SetUp persistConfig (redux-persist)

If you use redux-persist and you have a whitelist add auth0_reducer_name

```jsx
import { auth0_reducer_name } from '@/auth'
import { persistReducer } from 'redux-persist';

const persistConfig = {
	...
	whitelist: [...,auth0_reducer_name ],
	...
};
const persistedReducer = persistReducer(persistConfig, rootReducer);

```

## Usage

```jsx
import { useAuth0 } from '@/auth'

const {
	getAccessTokenSilently,
	isAuthenticated,
	logout,
	loginWithWebView,
	isLoading,
} = useAuth0()

const tokens = await getAccessTokenSilently() // {accessToken, expiresIn, refreshToken} OR null if all tokens expired
isAuthenticated // true or false
await loginWithWebView() // show login/signUp View; return {accessToken, expiresIn, refreshToken}
logout() // clear tokens and internal state
isLoading // true or false
```

## configuration
```js
configure({
	facebook:{
		appId:'',
	},
	google: {
	    webClientId:
	      '', // client ID of type WEB for your server (needed to verify user ID and offline access)
	    // accountName: '', // [Android] specifies an account name on the device that should be used
	    iosClientId:
	      '', // [iOS] optional, if you want to specify the client ID of type iOS (otherwise, it is taken from GoogleService-Info.plist)
  }
})
```

## Tests

```jsx
import {
	testExpireAccessToken,
	testExpireRefreshToken,
} from '@/auth/auth0-state';
...
const dispatch = useDispatch();
setTimeout(async () => {
	console.log('i will expire access token');
	await dispatch(testExpireAccessToken());
}, 10000);

setTimeout(async () => {
	console.log('i will expire access token');
	await dispatch(testExpireAccessToken());
	console.log('i will destroy refresh token');
	await dispatch(testExpireRefreshToken());
}, 30000);
...
```
