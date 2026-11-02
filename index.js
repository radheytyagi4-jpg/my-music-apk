import TrackPlayer from 'react-native-track-player';

// Register the playback service
TrackPlayer.registerPlaybackService(() => require('./service'));

// Let Expo Router handle the rest
import 'expo-router/entry';