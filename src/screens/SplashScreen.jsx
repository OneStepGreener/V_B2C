import React, { useEffect } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  StatusBar,
  ImageBackground,
} from 'react-native';
import { APP_CONFIG } from '../utils/config';

const { width, height } = Dimensions.get('window');

const SplashScreen = ({ navigation }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('DriverLogin');
    }, APP_CONFIG.SPLASH_DURATION);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <ImageBackground 
      source={require('../../assets/splash-screen.png')}
      style={styles.container}
      resizeMode="cover"
    >
      <StatusBar barStyle="light-content" backgroundColor="#1a4d2e" />
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: APP_CONFIG.COLORS.ACCENT_GREEN,
  },
});

export default SplashScreen; 