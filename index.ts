import { registerRootComponent } from 'expo';
import { Platform } from 'react-native';

// On native (iOS/Android) make sure `crypto.getRandomValues` is available
// for libraries like `uuid`. Guard the import for web.
if (Platform.OS !== 'web') {
	// Use require so bundlers don't try to resolve this for web builds.
	// eslint-disable-next-line @typescript-eslint/no-var-requires
	require('react-native-get-random-values');
}

import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
