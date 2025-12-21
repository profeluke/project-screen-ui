import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  TextInput, 
  ScrollView,
  StyleSheet 
} from 'react-native';
import { Check, Square, Mic } from 'lucide-react-native';
import { Checklist, ChecklistItem, CheckboxItem, TextInputItem, MultipleChoiceItem } from '../types';

interface ChecklistViewProps {
  checklist: Checklist;
  onChecklistUpdate: (updatedChecklist: Checklist) => void;
}

export const ChecklistView: React.FC<ChecklistViewProps> = ({
  checklist,
  onChecklistUpdate
}) => {
  const [localChecklist, setLocalChecklist] = useState<Checklist>(checklist);

  const updateItem = (itemId: string, updates: any) => {
    const updatedItems = localChecklist.items.map(item => {
      if (item.id === itemId) {
        return { ...item, ...updates } as ChecklistItem;
      }
      return item;
    });
    
    // Calculate completed count
    const completedCount = updatedItems.filter(item => {
      if (item.type === 'checkbox') {
        return (item as CheckboxItem).checked;
      } else if (item.type === 'text') {
        return (item as TextInputItem).value.trim() !== '';
      } else if (item.type === 'multiple_choice') {
        const mcItem = item as MultipleChoiceItem;
        return mcItem.selectedOption !== undefined || (mcItem.allowOther && mcItem.otherValue?.trim());
      }
      return false;
    }).length;

    const updatedChecklist = {
      ...localChecklist,
      items: updatedItems,
      completedCount
    };

    setLocalChecklist(updatedChecklist);
    onChecklistUpdate(updatedChecklist);
  };

  const renderCheckboxItem = (item: CheckboxItem) => (
    <View key={item.id} style={styles.checklistItem}>
      <TouchableOpacity
        style={styles.checkboxContainer}
        onPress={() => updateItem(item.id, { checked: !item.checked })}
      >
        <View style={[styles.checkbox, item.checked && styles.checkboxChecked]}>
          {item.checked && <Check size={16} color="#FFFFFF" />}
        </View>
        <View style={styles.itemContent}>
          <Text style={[styles.itemTitle, item.checked && styles.itemTitleCompleted]}>
            {item.title}
            {item.required && <Text style={styles.requiredIndicator}> *</Text>}
          </Text>
          {item.description && (
            <Text style={[styles.itemDescription, item.checked && styles.itemDescriptionCompleted]}>
              {item.description}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    </View>
  );

  const renderTextInputItem = (item: TextInputItem) => (
    <View key={item.id} style={styles.checklistItem}>
      <View style={styles.textInputContainer}>
        <Text style={styles.itemTitle}>
          {item.title}
          {item.required && <Text style={styles.requiredIndicator}> *</Text>}
        </Text>
        <TextInput
          style={[
            styles.textInput,
            item.multiline && styles.textInputMultiline
          ]}
          value={item.value}
          onChangeText={(text) => updateItem(item.id, { value: text })}
          placeholder={item.placeholder || 'Enter text...'}
          multiline={item.multiline}
          numberOfLines={item.multiline ? 3 : 1}
        />
      </View>
    </View>
  );

  const renderMultipleChoiceItem = (item: MultipleChoiceItem) => (
    <View key={item.id} style={styles.checklistItem}>
      <View style={styles.multipleChoiceContainer}>
        <Text style={styles.itemTitle}>
          {item.title}
          {item.required && <Text style={styles.requiredIndicator}> *</Text>}
        </Text>
        <View style={styles.optionsContainer}>
          {item.options.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={styles.optionButton}
              onPress={() => updateItem(item.id, { selectedOption: index, otherValue: '' })}
            >
              <View style={[
                styles.radioButton,
                item.selectedOption === index && styles.radioButtonSelected
              ]}>
                {item.selectedOption === index && (
                  <View style={styles.radioButtonInner} />
                )}
              </View>
              <Text style={styles.optionText}>{option}</Text>
            </TouchableOpacity>
          ))}
          {item.allowOther && (
            <View style={styles.otherOptionContainer}>
              <TouchableOpacity
                style={styles.optionButton}
                onPress={() => updateItem(item.id, { selectedOption: undefined })}
              >
                <View style={[
                  styles.radioButton,
                  item.selectedOption === undefined && item.otherValue && styles.radioButtonSelected
                ]}>
                  {item.selectedOption === undefined && item.otherValue && (
                    <View style={styles.radioButtonInner} />
                  )}
                </View>
                <Text style={styles.optionText}>Other:</Text>
              </TouchableOpacity>
              <TextInput
                style={styles.otherInput}
                value={item.otherValue || ''}
                onChangeText={(text) => updateItem(item.id, { otherValue: text, selectedOption: undefined })}
                placeholder="Specify..."
                onFocus={() => updateItem(item.id, { selectedOption: undefined })}
              />
            </View>
          )}
        </View>
      </View>
    </View>
  );

  const renderItem = (item: ChecklistItem) => {
    switch (item.type) {
      case 'checkbox':
        return renderCheckboxItem(item as CheckboxItem);
      case 'text':
        return renderTextInputItem(item as TextInputItem);
      case 'multiple_choice':
        return renderMultipleChoiceItem(item as MultipleChoiceItem);
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {/* Header with title and speak button */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.checklistTitle}>{localChecklist.title}</Text>
          <Text style={styles.progressText}>
            {localChecklist.completedCount} of {localChecklist.totalCount} completed
          </Text>
        </View>
        <TouchableOpacity style={styles.speakButton}>
          <Mic size={16} color="#64748B" />
          <Text style={styles.speakButtonText}>Speak</Text>
        </TouchableOpacity>
      </View>

      {/* Checklist items */}
      <ScrollView 
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={true}
        bounces={false}
      >
        <View style={styles.itemsContainer}>
          {localChecklist.items.map(renderItem)}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  titleContainer: {
    flex: 1,
    marginRight: 16,
  },
  checklistTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 20,
    color: '#1E293B',
    marginBottom: 4,
  },
  progressText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#64748B',
  },
  speakButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 20,
  },
  speakButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#64748B',
  },
  scrollContainer: {
    flex: 1,
  },
  itemsContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    gap: 20,
  },
  checklistItem: {
    backgroundColor: '#FFFFFF',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#1E293B',
    lineHeight: 24,
  },
  itemTitleCompleted: {
    color: '#64748B',
    textDecorationLine: 'line-through',
  },
  itemDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
    marginTop: 4,
  },
  itemDescriptionCompleted: {
    textDecorationLine: 'line-through',
  },
  requiredIndicator: {
    color: '#EF4444',
  },
  textInputContainer: {
    gap: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1E293B',
    backgroundColor: '#FFFFFF',
  },
  textInputMultiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  multipleChoiceContainer: {
    gap: 12,
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  radioButton: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    borderColor: '#3B82F6',
  },
  radioButtonInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3B82F6',
  },
  optionText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#1E293B',
    flex: 1,
  },
  otherOptionContainer: {
    gap: 8,
  },
  otherInput: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1E293B',
    backgroundColor: '#FFFFFF',
    marginLeft: 28,
  },
}); 