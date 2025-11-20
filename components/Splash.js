import React, { useEffect, useRef } from 'react';
import { View, Image, StyleSheet, Animated } from 'react-native';

export default function Splash({ onFinish }) {
  const scaleAnim = useRef(new Animated.Value(0.5)).current; // Initial scale: 0.5 (smaller)
  const opacityAnim = useRef(new Animated.Value(1)).current; // Initial opacity: 1

  useEffect(() => {
    // Zoom in
    Animated.timing(scaleAnim, {
      toValue: 1, // Full size
      duration: 600, // Fast zoom-in (0.6 seconds)
      useNativeDriver: true,
    }).start();

    // After a delay, fade out and notify App.js to hide splash

    const timer = setTimeout(() => {
      Animated.timing(opacityAnim, {
        toValue: 0, // Fade out
        duration: 300, // Very fast fade-out (0.2 seconds)
        useNativeDriver: true,
      }).start(() => {
        onFinish(); // Notify App.js to hide splash
      });
    }, 1200); // Total duration before fade-out

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.logoContainer, { opacity: opacityAnim, transform: [{ scale: scaleAnim }] }]}>
        <Image
          source={require('../assets/Logo_Creindia.jpg')}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f8f6ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 300,
    height:250,
  },
});