import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { ScanText, ArrowRight } from 'lucide-react-native';

type ScanInterstitialScreenProps = {
  onContinue: () => void;
};

const ScanInterstitialScreen: React.FC<ScanInterstitialScreenProps> = ({ onContinue }) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <ScanText size={64} color="#3B82F6" />
        </View>
        
        <Text style={styles.title}>Turn Anything into a Page</Text>
        
        <View style={styles.featuresContainer}>
          <Text style={styles.featureText}>
            • Capture printed or handwritten documents
          </Text>
          <Text style={styles.featureText}>
            • Any kind: proposals, receipts, notes, etc
          </Text>
          <Text style={styles.featureText}>
            • Edit, update, and share your documents
          </Text>
          <Text style={styles.featureText}>
            • Store everything securely in CompanyCam
          </Text>
        </View>
        
      </View>
      
      <View style={styles.descriptionContainer}>
        <Text style={styles.descriptionText}>
          Simply point your camera at any document or handwritten note, and we'll convert it into a digital document you can edit and share.
        </Text>
      </View>
      
      <TouchableOpacity style={styles.actionButton} onPress={onContinue}>
        <Text style={styles.actionButtonText}>Capture Document</Text>
        <ArrowRight size={20} color="#FFFFFF" style={styles.actionButtonIcon} />
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.cancelButton} onPress={onContinue}>
        <Text style={styles.cancelButtonText}>Cancel</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 24,
  },
  featuresContainer: {
    alignSelf: 'stretch',
    marginBottom: 32,
  },
  featureText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#334155',
    marginBottom: 12,
    lineHeight: 24,
  },
  descriptionContainer: {
    width: '100%',
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  descriptionText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 24,
  },
  actionButton: {
    backgroundColor: '#3B82F6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginHorizontal: 24,
    marginBottom: 12,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    marginRight: 8,
  },
  actionButtonIcon: {
    marginLeft: 4,
  },
  cancelButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginHorizontal: 24,
    marginBottom: 16,
  },
  cancelButtonText: {
    color: '#64748B',
    fontSize: 16,
    fontFamily: 'Inter-Medium',
  },
});

export default ScanInterstitialScreen;
