// Enhanced Memory Box Logo Component
import React from 'react';
import { View } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Path, Circle, Rect } from 'react-native-svg';

export const MemoryBoxLogo = ({ width = 120, height = 120, animated = false }) => {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={width} height={height} viewBox="0 0 120 120">
        <Defs>
          {/* Gradient for the box */}
          <LinearGradient id="boxGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#FFD54F" stopOpacity="1" />
            <Stop offset="50%" stopColor="#FFCC02" stopOpacity="1" />
            <Stop offset="100%" stopColor="#FFA000" stopOpacity="1" />
          </LinearGradient>
          
          {/* Gradient for the heart */}
          <LinearGradient id="heartGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#42A5F5" stopOpacity="1" />
            <Stop offset="50%" stopColor="#2196F3" stopOpacity="1" />
            <Stop offset="100%" stopColor="#1976D2" stopOpacity="1" />
          </LinearGradient>

          {/* Shadow gradient */}
          <LinearGradient id="shadowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#000000" stopOpacity="0.1" />
            <Stop offset="100%" stopColor="#000000" stopOpacity="0.3" />
          </LinearGradient>
        </Defs>

        {/* Box shadow */}
        <Path
          d="M25 75 L95 75 L90 85 L30 85 Z"
          fill="url(#shadowGradient)"
        />

        {/* Main box body */}
        <Path
          d="M20 45 L100 45 L95 75 L25 75 Z"
          fill="url(#boxGradient)"
          stroke="#E65100"
          strokeWidth="1"
        />

        {/* Box front face */}
        <Rect
          x="25"
          y="50"
          width="70"
          height="25"
          fill="#FFB300"
          stroke="#E65100"
          strokeWidth="1"
        />

        {/* Box lid (open) */}
        <Path
          d="M20 45 L100 45 L95 35 L25 35 Z"
          fill="#FFCC02"
          stroke="#E65100"
          strokeWidth="1"
        />

        {/* Box lid side */}
        <Path
          d="M95 35 L100 45 L95 45 Z"
          fill="#FF8F00"
        />

        {/* Heart floating above */}
        <Path
          d="M50 25 C45 20, 35 20, 35 30 C35 35, 50 45, 50 45 C50 45, 65 35, 65 30 C65 20, 55 20, 50 25 Z"
          fill="url(#heartGradient)"
          stroke="#0D47A1"
          strokeWidth="1"
        />

        {/* Small sparkles */}
        <Circle cx="30" cy="25" r="2" fill="#FFD54F" opacity="0.8" />
        <Circle cx="80" cy="20" r="1.5" fill="#42A5F5" opacity="0.8" />
        <Circle cx="85" cy="35" r="1" fill="#FFD54F" opacity="0.8" />
        <Circle cx="25" cy="35" r="1" fill="#42A5F5" opacity="0.8" />

        {/* Memory items inside box */}
        {/* Photo icon */}
        <Rect x="70" y="55" width="8" height="6" fill="#E1F5FE" stroke="#0277BD" strokeWidth="0.5" />
        <Circle cx="72" cy="57" r="1" fill="#0277BD" />
        
        {/* Letter/note */}
        <Rect x="45" y="58" width="6" height="8" fill="#FFF9C4" stroke="#F57F17" strokeWidth="0.5" />
        <Path d="M45 58 L51 61 L51 58 Z" fill="#FFEB3B" />
      </Svg>
    </View>
  );
};

export const MemoryBoxLogoText = ({ width = 200, height = 60, color = '#1A237E' }) => {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={width} height={height} viewBox="0 0 200 60">
        <Defs>
          <LinearGradient id="textGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor="#1A237E" stopOpacity="1" />
            <Stop offset="50%" stopColor="#3F51B5" stopOpacity="1" />
            <Stop offset="100%" stopColor="#2196F3" stopOpacity="1" />
          </LinearGradient>
        </Defs>
        
        {/* Memory text */}
        <text
          x="15"
          y="35"
          fontSize="24"
          fontWeight="700"
          fontFamily="system-ui, -apple-system, sans-serif"
          fill="url(#textGradient)"
        >
          Memory
        </text>
        
        {/* Box text */}
        <text
          x="120"
          y="35"
          fontSize="24"
          fontWeight="700"
          fontFamily="system-ui, -apple-system, sans-serif"
          fill="url(#textGradient)"
        >
          Box
        </text>
      </Svg>
    </View>
  );
};

export default MemoryBoxLogo;
