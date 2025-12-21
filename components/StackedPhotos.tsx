import React from 'react';
import { View, Image, StyleSheet, ViewStyle, ImageSourcePropType } from 'react-native';

interface StackedPhotosProps {
  photos: ImageSourcePropType[];
  size?: number;
  style?: ViewStyle;
}

const StackedPhotos: React.FC<StackedPhotosProps> = ({ 
  photos, 
  size = 80,
  style 
}) => {
  // Take the first 3 photos, or use what we have
  const displayPhotos = photos.slice(0, 3);
  
  // Different rotation angles for each photo to create the "tossed" effect
  // Bottom photo has more rotation, top photo is slightly less rotated
  const rotations = ['-12deg', '8deg', '-4deg'];
  const positions = [
    { bottom: 0, left: 0 },        // Bottom photo
    { bottom: 5, left: 6 },         // Middle photo  
    { bottom: 10, left: 3 }         // Top photo
  ];

  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      {displayPhotos.map((photo, index) => (
        <View
          key={index}
          style={[
            styles.photoWrapper,
            {
              transform: [{ rotate: rotations[index] }],
              bottom: positions[index].bottom,
              left: positions[index].left,
              zIndex: index,
            }
          ]}
        >
          <Image
            source={photo}
            style={[
              styles.photo,
              {
                width: size * 0.85,
                height: size * 0.85,
              }
            ]}
          />
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  photoWrapper: {
    position: 'absolute',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  photo: {
    borderRadius: 10,
    backgroundColor: '#fff',
    borderWidth: 3,
    borderColor: '#fff',
  },
});

export default StackedPhotos;
