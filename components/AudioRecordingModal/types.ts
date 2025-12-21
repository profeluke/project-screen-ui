export type CapturedItem =
  | {
      id: string;
      type: 'photo';
      uri: string;
      timestamp?: number;
      aiDescription?: string;
      aiDocumentTitle?: string;
      aiDocumentType?: string;
      aiDocumentConfidence?: number;
      aiDocumentIsDocument?: boolean;
      aiSuggestedTags?: string[];
      aiSuggestedTaskDescription?: string;
      aiSuggestedTagsConfidence?: number;
      aiSuggestedTaskTitle?: string;
      aiSuggestedTaskConfidence?: number;
      isAnalyzing?: boolean;
      photoId?: string;
      capturedAt: number;
    }
  | {
      id: string;
      type: 'audio';
      transcription: string;
      duration: number;
      uri?: string;
      segments?: Array<{ start: number; end: number; text: string }>;
      capturedAt: number;
    }
  | {
      id: string;
      type: 'note';
      bulletPoints: string[];
      source?: 'manual' | 'transcription';
      capturedAt: number;
    }
  | { id: string; type: 'organized'; content: string; photos: Array<any>; tasks: Array<any>; rawData: any; promptSent?: string; capturedAt: number; };

// Checklist types
export interface ChecklistItemBase {
  id: string;
  title: string;
  required?: boolean;
}

export interface CheckboxItem extends ChecklistItemBase {
  type: 'checkbox';
  checked: boolean;
  description?: string;
}

export interface TextInputItem extends ChecklistItemBase {
  type: 'text';
  value: string;
  placeholder?: string;
  multiline?: boolean;
}

export interface MultipleChoiceItem extends ChecklistItemBase {
  type: 'multiple_choice';
  options: string[];
  selectedOption?: number;
  allowOther?: boolean;
  otherValue?: string;
}

export type ChecklistItem = CheckboxItem | TextInputItem | MultipleChoiceItem;

export interface Checklist {
  id: string;
  title: string;
  description: string;
  items: ChecklistItem[];
  completedCount: number;
  totalCount: number;
}

export interface ChecklistModeOption {
  id: string;
  label: string;
  icon: string;
  description: string;
  type: 'checklist';
  checklist: Checklist;
} 