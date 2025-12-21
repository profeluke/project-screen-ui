import React from 'react';
import { View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

interface StateOutlineProps {
  state: string;
  size?: number;
  color?: string;
}

// Accurate SVG path data for US state outlines
// Nebraska path based on actual geographical boundaries
// ViewBox is set to match the state's natural aspect ratio
const STATE_PATHS: Record<string, { path: string; viewBox: string }> = {
  // Nebraska - accurate geographical outline
  // Source: Verified SVG path data
  // Features: Panhandle in northwest, Missouri River eastern border, characteristic shape
  NE: {
    path: 'M486.09787,240.70058L489.32848,247.72049L489.19985,250.02301L492.65907,255.51689L495.37836,258.66923L490.32888,258.66923L446.84632,257.73055L406.05946,256.84025L383.80724,256.05638L384.88001,234.72853L352.56177,231.80828L356.9056,187.79842L372.45193,188.82723L392.57072,189.97033L410.40329,191.11345L434.18005,192.25656L444.92531,191.79932L446.98291,194.08554L451.78399,197.05764L452.9271,197.97213L457.27093,196.60039L461.15752,196.14315L463.90099,195.91452L465.72997,197.28626L469.7874,198.88662L472.75949,200.48698L473.21674,202.08734L474.13123,204.14494L475.96021,204.14494L476.75819,204.19111L477.65242,208.87293L480.57268,217.34085L481.14521,221.09756L483.6687,224.87181L484.23829,229.98595L485.84553,234.22632L486.09787,240.70058Z',
    viewBox: '347.56177 182.79842 152.81659 80.87081',
  },
  
  // Colorado (simple rectangle - it's actually rectangular)
  CO: {
    path: 'M0,0 L100,0 L100,100 L0,100 Z',
    viewBox: '0 0 100 100',
  },
  
  // Wyoming (also rectangular)
  WY: {
    path: 'M0,0 L100,0 L100,100 L0,100 Z',
    viewBox: '0 0 100 100',
  },
  
  // Default fallback
  DEFAULT: {
    path: 'M10,10 L90,10 L90,90 L10,90 Z',
    viewBox: '0 0 100 100',
  },
};

export default function StateOutline({ state, size = 24, color = '#000000' }: StateOutlineProps) {
  const stateData = STATE_PATHS[state] || STATE_PATHS.DEFAULT;
  
  // Parse viewBox to calculate aspect ratio
  const viewBoxParts = stateData.viewBox.split(' ').map(Number);
  const viewBoxWidth = viewBoxParts[2] || 100;
  const viewBoxHeight = viewBoxParts[3] || 100;
  const aspectRatio = viewBoxWidth / viewBoxHeight;
  
  // Calculate dimensions maintaining aspect ratio
  // For wide states like Nebraska, fit within the size while maintaining ratio
  const svgWidth = size;
  const svgHeight = size / aspectRatio;
  
  return (
    <View style={{ 
      width: size, 
      height: size, 
      justifyContent: 'center', 
      alignItems: 'center' 
    }}>
      <Svg 
        width={svgWidth} 
        height={svgHeight}
        viewBox={stateData.viewBox}
        preserveAspectRatio="xMidYMid meet"
      >
        <Path
          d={stateData.path}
          fill={color}
          strokeWidth={0}
        />
      </Svg>
    </View>
  );
}

