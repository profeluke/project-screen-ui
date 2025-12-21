import React from 'react';
import { View } from 'react-native';
import { styles } from '../styles';

interface LiveWavelengthProps {
  power: number;
}

export const LiveWavelength: React.FC<LiveWavelengthProps> = ({ power }) => {
  const barHeights = [
    Math.max(4, Math.min(16, power * 0.6)),
    Math.max(6, Math.min(20, power * 1.0)),
    Math.max(4, Math.min(16, power * 0.8)),
  ];
  
  return (
    <View style={styles.liveWavelengthContainer}>
      {barHeights.map((height, index) => (
        <View
          key={index}
          style={[
            styles.liveWavelengthBar,
            { height },
          ]}
        />
      ))}
    </View>
  );
}; 