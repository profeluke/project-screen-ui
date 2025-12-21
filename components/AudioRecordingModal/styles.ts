import { StyleSheet, Dimensions } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  innerContainer: {
    flex: 1,
  },
  flexContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  scrollContent: {
    flex: 1,
    minHeight: 0,
  },
  scrollContentContainer: {
    paddingHorizontal: 0,
    paddingTop: 8,
    paddingBottom: 120,
  },
  handleIndicator: {
    backgroundColor: '#CBD5E1',
    width: 40,
  },
  bottomSheetBackground: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 16,
  },
  
  // Live wavelength
  liveWavelengthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    height: 20,
  },
  liveWavelengthBar: {
    width: 3,
    backgroundColor: 'white',
    borderRadius: 2,
  },
  
  // Top row
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginRight: 16,
  },
  
  // Voice button
  voiceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginRight: 16,
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#F1F5F9',
    borderRadius: 24,
  },
  voiceButtonActive: {
    backgroundColor: 'black',
  },
  voiceButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 15,
    color: '#1E293B',
  },
  voiceButtonTextActive: {
    color: '#FFFFFF',
  },
  
  // Processing
  processingIndicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    marginRight: 16,
    paddingVertical: 12,
  },
  processingText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 15,
    color: '#64748B',
  },
  
  // Mode dropdown
  modeDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 24,
    gap: 8,
  },
  modeText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 20,
    color: '#1E293B',
  },
  
  // Empty state
  emptyStateContainer: {
    paddingHorizontal: 32,
    paddingVertical: 36,
    marginTop: 60,
  },
  emptyStateCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 48,
  },
  emptyStateContent: {
    alignItems: 'center',
  },
  emptyStateTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 20,
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 12,
  },
  emptyStateDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  emptyStateActions: {
    gap: 20,
    alignItems: 'center',
    marginBottom: 32,
  },
  emptyStateAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  emptyStateActionText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#475569',
  },
  emptyStateGotItButton: {
    backgroundColor: '#6366F1',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  emptyStateGotItButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  
  // Timeline
  timelineContainer: {
    marginTop: 12,
    paddingHorizontal: 16,
    marginLeft: 16,
    gap: 16,
    paddingBottom: 16,
  },
  timelineGroup: {
    backgroundColor: '#FFFFFF',
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  timelinePhotoWrapper: {
    position: 'relative',
    width: 88,
    height: 88,
  },
  timelinePhoto: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    backgroundColor: '#E5E7EB',
  },
  timelineSinglePhotoWrapper: {
    position: 'relative',
    width: 80,
    height: 80,
  },
  timelineSinglePhoto: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
    backgroundColor: '#E5E7EB',
  },
  timelinePhotoAnalyzingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timelinePhotoAnalyzedIndicator: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  
  // Timeline notes
  timelineNote: {
    backgroundColor: 'transparent',
    padding: 0,
    paddingLeft: 16,
    paddingRight: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  timelineNoteIcon: {
    marginTop: 3,
  },
  timelineNoteText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#334155',
    lineHeight: 22,
    flex: 1,
  },
  timelineNoteSeamless: {
    backgroundColor: 'transparent',
    padding: 0,
  },
  timelineNoteEditTextInputSeamless: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#334155',
    lineHeight: 24,
    padding: 0,
    paddingLeft: 16,
    paddingRight: 16,
    paddingVertical: 8,
  },
  audioEditingRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    paddingLeft: 16,
    paddingRight: 16,
    paddingVertical: 8,
  },
  timelineAudioEditTextInputSeamless: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#334155',
    lineHeight: 24,
    padding: 0,
    flex: 1,
  },
  
  // Bullet points
  bulletPointList: {
    flex: 1,
    gap: 8,
  },
  bulletPointItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  bulletPointDot: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#334155',
    lineHeight: 22,
  },
  bulletPointText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#334155',
    lineHeight: 22,
    flex: 1,
  },
  
  // Document container
  documentContainer: {
    padding: 0,
    position: 'relative',
    marginBottom: 20,
    marginTop: 8,
  },
  documentTextInput: {
    backgroundColor: 'transparent',
    padding: 0,
    paddingLeft: 32,
    paddingRight: 32,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#334155',
    textAlignVertical: 'top',
    lineHeight: 24,
    minHeight: 32,
  },
  
  // Floating button
  floatingButtonContainer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  floatingGenerateButton: {
    backgroundColor: '#6366F1',
    borderRadius: 28,
    paddingVertical: 18,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#6366F1',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  floatingButtonIcon: {
    marginRight: 4,
  },
  floatingGenerateButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: '#FFFFFF',
  },
  
  // Finish tooltip
  finishTooltipContainer: {
    marginBottom: 12,
    alignItems: 'center',
  },
  finishTooltip: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    maxWidth: '80%',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  finishTooltipCloseButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    padding: 4,
    zIndex: 1,
  },
  finishTooltipText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#FFFFFF',
    lineHeight: 20,
    textAlign: 'center',
    paddingRight: 24,
  },
  finishTooltipArrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#1F2937',
    marginTop: -1,
  },
  
  // Photo detail
  photoDetailContainer: {
    flex: 1,
    padding: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#1E293B',
    marginLeft: 4,
  },
  photoDetailImage: {
    width: '100%',
    height: 250,
    borderRadius: 12,
    marginBottom: 20,
  },
  photoDetailContent: {
    flex: 1,
  },
  photoDetailTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: '#1E293B',
    marginBottom: 12,
  },
  analyzingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  analyzingText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#64748B',
  },
  photoDetailDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#334155',
    lineHeight: 24,
  },
  
  // Mode selection modal
  modeSelectionModal: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modeSelectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modeSelectionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: '#1E293B',
  },
  modeSelectionCloseButton: {
    padding: 8,
  },
  modeSelectionContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  modeSelectionSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#64748B',
    marginBottom: 24,
  },
  modeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  modeOptionActive: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
  },
  modeOptionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  modeOptionContent: {
    flex: 1,
  },
  modeOptionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#1E293B',
    marginBottom: 4,
  },
  modeOptionDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#64748B',
  },
  modeOptionCheckIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  enhancedDocumentContainer: {
    flex: 1,
    padding: 0,
    marginTop: 8,
  },
}); 