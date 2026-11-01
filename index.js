import { registerRootComponent } from 'expo';
import TrackPlayer from 'react-native-track-player';

import App from './App';

// Register the playback service
TrackPlayer.registerPlaybackService(() => require('./service'));

registerRootComponent(App);