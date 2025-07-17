import React, { useEffect, useRef, useState } from 'react';
import { View, Animated, Easing, Dimensions } from 'react-native';
import Svg, { 
  Path, 
  Circle, 
  Rect, 
  Defs, 
  LinearGradient, 
  Stop,
  G,
  ClipPath
} from 'react-native-svg';

const { width: screenWidth } = Dimensions.get('window');

const AnimatedMemoryBoxLogo = ({ 
  size = 120, 
  animated = true, 
  interactive = false,
  onAnimationComplete 
}) => {
  const heartPulse = useRef(new Animated.Value(1)).current;
  const boxRotation = useRef(new Animated.Value(0)).current;
  const sparkleOpacity = useRef(new Animated.Value(0)).current;
  const heartSlide = useRef(new Animated.Value(0)).current;
  
  const [isPressed, setIsPressed] = useState(false);

  useEffect(() => {
    if (!animated) return;

    // Heart pulsing animation
    const heartAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(heartPulse, {
          toValue: 1.2,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(heartPulse, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    // Box subtle rotation
    const boxAnimation = Animated.loop(
      Animated.timing(boxRotation, {
        toValue: 1,
        duration: 6000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    // Sparkle effect
    const sparkleAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(sparkleOpacity, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(sparkleOpacity, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );

    // Heart sliding into box animation (login effect)
    const slideAnimation = Animated.sequence([
      Animated.delay(1000),
      Animated.timing(heartSlide, {
        toValue: 1,
        duration: 2000,
        easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
        useNativeDriver: true,
      }),
      Animated.timing(heartSlide, {
        toValue: 0,
        duration: 1000,
        easing: Easing.bezier(0.55, 0.06, 0.68, 0.19),
        useNativeDriver: true,
      }),
    ]);

    heartAnimation.start();
    boxAnimation.start();
    sparkleAnimation.start();
    
    // Run slide animation once on mount
    slideAnimation.start(() => {
      if (onAnimationComplete) {
        onAnimationComplete();
      }
    });

    return () => {
      heartAnimation.stop();
      boxAnimation.stop();
      sparkleAnimation.stop();
    };
  }, [animated]);

  const handlePress = () => {
    if (!interactive) return;
    
    setIsPressed(true);
    
    // Create a bounce effect on press
    Animated.sequence([
      Animated.timing(heartPulse, {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(heartPulse, {
        toValue: 1.3,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(heartPulse, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsPressed(false);
    });
  };

  const boxRotationInterpolation = boxRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const heartSlideX = heartSlide.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, size * 0.3, 0],
  });

  const heartSlideY = heartSlide.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, -size * 0.1, 0],
  });

  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      {/* Memory Box Container */}
      <Animated.View
        style={{
          transform: [{ rotate: boxRotationInterpolation }],
        }}
      >
        <Svg width={size} height={size} viewBox="0 0 120 120">
          <Defs>
            {/* Box Gradient */}
            <LinearGradient id="boxGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="#6366F1" />
              <Stop offset="50%" stopColor="#8B5CF6" />
              <Stop offset="100%" stopColor="#A855F7" />
            </LinearGradient>
            
            {/* Heart Gradient */}
            <LinearGradient id="heartGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="#EF4444" />
              <Stop offset="50%" stopColor="#F87171" />
              <Stop offset="100%" stopColor="#FCA5A5" />
            </LinearGradient>

            {/* Sparkle Gradient */}
            <LinearGradient id="sparkleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="#FEF08A" />
              <Stop offset="100%" stopColor="#FBBF24" />
            </LinearGradient>
          </Defs>

          {/* Main Memory Box */}
          <G>
            {/* Box Shadow */}
            <Rect
              x="22"
              y="27"
              width="76"
              height="66"
              rx="12"
              fill="rgba(0,0,0,0.1)"
            />
            
            {/* Main Box */}
            <Rect
              x="20"
              y="25"
              width="76"
              height="66"
              rx="12"
              fill="url(#boxGradient)"
              stroke="#4F46E5"
              strokeWidth="2"
            />

            {/* Box Lid */}
            <Rect
              x="18"
              y="20"
              width="80"
              height="12"
              rx="6"
              fill="#4338CA"
            />

            {/* Box Handle */}
            <Circle
              cx="60"
              cy="26"
              r="4"
              fill="#312E81"
            />

            {/* Memory Slots (inside box) */}
            <Rect x="30" y="35" width="8" height="12" rx="2" fill="rgba(255,255,255,0.3)" />
            <Rect x="42" y="35" width="8" height="12" rx="2" fill="rgba(255,255,255,0.3)" />
            <Rect x="54" y="35" width="8" height="12" rx="2" fill="rgba(255,255,255,0.3)" />
            <Rect x="66" y="35" width="8" height="12" rx="2" fill="rgba(255,255,255,0.3)" />
            <Rect x="78" y="35" width="8" height="12" rx="2" fill="rgba(255,255,255,0.3)" />
          </G>
        </Svg>
      </Animated.View>

      {/* Animated Heart */}
      <Animated.View
        style={{
          position: 'absolute',
          transform: [
            { scale: heartPulse },
            { translateX: heartSlideX },
            { translateY: heartSlideY },
          ],
        }}
        onTouchStart={handlePress}
      >
        <Svg width={size * 0.4} height={size * 0.4} viewBox="0 0 48 48">
          {/* Heart Shape */}
          <Path
            d="M24 42.7l-2.1-1.9C10.8 30.72 4 24.55 4 17c0-6.2 4.8-11 11-11 3.11 0 6.05 1.46 8 3.74 1.95-2.28 4.89-3.74 8-3.74 6.2 0 11 4.8 11 11 0 7.55-6.8 13.72-17.9 23.8L24 42.7z"
            fill="url(#heartGradient)"
            stroke="#DC2626"
            strokeWidth="1"
          />
        </Svg>
      </Animated.View>

      {/* Sparkle Effects */}
      <Animated.View
        style={{
          position: 'absolute',
          opacity: sparkleOpacity,
        }}
      >
        <Svg width={size} height={size} viewBox="0 0 120 120">
          {/* Top Sparkles */}
          <Circle cx="30" cy="15" r="2" fill="url(#sparkleGradient)" />
          <Circle cx="90" cy="20" r="1.5" fill="url(#sparkleGradient)" />
          <Circle cx="105" cy="45" r="1" fill="url(#sparkleGradient)" />
          
          {/* Side Sparkles */}
          <Circle cx="10" cy="60" r="1.5" fill="url(#sparkleGradient)" />
          <Circle cx="110" cy="70" r="2" fill="url(#sparkleGradient)" />
          
          {/* Bottom Sparkles */}
          <Circle cx="25" cy="105" r="1" fill="url(#sparkleGradient)" />
          <Circle cx="95" cy="100" r="1.5" fill="url(#sparkleGradient)" />
        </Svg>
      </Animated.View>
    </View>
  );
};

export default AnimatedMemoryBoxLogo;
