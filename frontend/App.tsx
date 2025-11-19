
import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, SafeAreaView } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const { width, height } = Dimensions.get('window');

type LavaBubbleProps = {
  size: number;
  color: string;
  delay: number;
  duration: number;
  startX: number;
  startY: number;
};

const LavaBubble: React.FC<LavaBubbleProps> = ({ size, color, delay, duration, startX, startY }) => {
  const translateY = useRef(new Animated.Value(startY)).current;
  const translateX = useRef(new Animated.Value(startX)).current;
  const scale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Animación vertical (subida y bajada)
    Animated.loop(
      Animated.sequence([
        Animated.timing(translateY, {
          toValue: startY - height * 0.4,
          duration: duration,
          delay: delay,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: startY,
          duration: duration,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Animación horizontal (movimiento lateral)
    Animated.loop(
      Animated.sequence([
        Animated.timing(translateX, {
          toValue: startX + 40,
          duration: duration * 0.6,
          delay: delay,
          useNativeDriver: true,
        }),
        Animated.timing(translateX, {
          toValue: startX - 40,
          duration: duration * 0.8,
          useNativeDriver: true,
        }),
        Animated.timing(translateX, {
          toValue: startX,
          duration: duration * 0.6,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Animación de escala (pulsación)
    Animated.loop(
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.2,
          duration: duration * 0.5,
          delay: delay,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 0.8,
          duration: duration * 0.5,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [translateY, translateX, scale, delay, duration, startX, startY]);

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          opacity: 0.5,
        },
        {
          transform: [{ translateX }, { translateY }, { scale }],
        },
      ]}
    />
  );
};

const WelcomeScreen = () => {
  // Generar burbujas con diferentes tamaños, posiciones y duraciones
  const bubbles = [
    { size: 100, color: '#4F8EF7', delay: 0, duration: 4000, startX: width * 0.1, startY: height * 0.7 },
    { size: 80, color: '#6DD5FA', delay: 500, duration: 5000, startX: width * 0.7, startY: height * 0.8 },
    { size: 120, color: '#4F8EF7', delay: 1000, duration: 4500, startX: width * 0.4, startY: height * 0.6 },
    { size: 90, color: '#6DD5FA', delay: 1500, duration: 5500, startX: width * 0.8, startY: height * 0.5 },
    { size: 70, color: '#4F8EF7', delay: 2000, duration: 4800, startX: width * 0.2, startY: height * 0.4 },
    { size: 110, color: '#6DD5FA', delay: 2500, duration: 5200, startX: width * 0.6, startY: height * 0.9 },
  ];

  return (
    <LinearGradient colors={["#4F8EF7", "#6DD5FA", "#FFFFFF"]} style={styles.container}>
      {/* Burbujas de lava animadas en el fondo */}
      <View style={styles.lavaContainer} pointerEvents="none">
        {bubbles.map((bubble, index) => (
          <LavaBubble
            key={index}
            size={bubble.size}
            color={bubble.color}
            delay={bubble.delay}
            duration={bubble.duration}
            startX={bubble.startX}
            startY={bubble.startY}
          />
        ))}
      </View>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.logoContainer}>
          <View style={[styles.logo, styles.logoPlaceholder]}>
            <Text style={styles.logoPlaceholderText}>Logo</Text>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  lavaContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    top: 0,
    zIndex: 0,
  },
  safeArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    zIndex: 1,
  },
  logoContainer: {
    marginBottom: 32,
  },
  logo: {
    width: 120,
    height: 120,
  },
  logoPlaceholder: {
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 60,
  },
  logoPlaceholderText: {
    color: '#888',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default WelcomeScreen;