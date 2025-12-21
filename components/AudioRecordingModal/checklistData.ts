import { Checklist, ChecklistModeOption } from './types';

// Safety Inspection Checklist
const safetyChecklist: Checklist = {
  id: 'safety',
  title: 'Safety Inspection Checklist',
  description: 'Comprehensive safety inspection for construction sites',
  items: [
    {
      id: 'safety-1',
      type: 'checkbox',
      title: 'Hard hats are worn by all personnel',
      checked: false,
      required: true,
      description: 'Verify all workers have proper head protection'
    },
    {
      id: 'safety-2',
      type: 'checkbox',
      title: 'Safety barriers are properly installed',
      checked: false,
      required: true
    },
    {
      id: 'safety-3',
      type: 'multiple_choice',
      title: 'Fire extinguisher condition',
      options: ['Excellent', 'Good', 'Fair', 'Needs replacement'],
      required: true
    },
    {
      id: 'safety-4',
      type: 'text',
      title: 'Emergency exit route verification',
      value: '',
      placeholder: 'Describe the verified exit routes...',
      multiline: true,
      required: true
    },
    {
      id: 'safety-5',
      type: 'checkbox',
      title: 'First aid kit is accessible and stocked',
      checked: false,
      required: true
    },
    {
      id: 'safety-6',
      type: 'multiple_choice',
      title: 'Overall safety compliance rating',
      options: ['Fully Compliant', 'Minor Issues', 'Major Issues', 'Non-Compliant'],
      allowOther: true,
      required: true
    },
    {
      id: 'safety-7',
      type: 'text',
      title: 'Additional safety concerns',
      value: '',
      placeholder: 'Note any additional safety issues...',
      multiline: true
    },
    {
      id: 'safety-8',
      type: 'checkbox',
      title: 'All power tools have safety guards',
      checked: false,
      required: true
    },
    {
      id: 'safety-9',
      type: 'checkbox',
      title: 'MSDS sheets are available for all chemicals',
      checked: false,
      required: true
    },
    {
      id: 'safety-10',
      type: 'text',
      title: 'Inspector name and certification',
      value: '',
      placeholder: 'Enter inspector details...',
      required: true
    }
  ],
  completedCount: 0,
  totalCount: 10
};

// Quality Control Checklist
const qualityChecklist: Checklist = {
  id: 'quality',
  title: 'Quality Control Checklist',
  description: 'Quality assurance inspection for construction work',
  items: [
    {
      id: 'quality-1',
      type: 'multiple_choice',
      title: 'Foundation concrete cure time',
      options: ['< 7 days', '7-14 days', '14-21 days', '> 21 days'],
      required: true
    },
    {
      id: 'quality-2',
      type: 'checkbox',
      title: 'Rebar placement meets specifications',
      checked: false,
      required: true,
      description: 'Check spacing, coverage, and tie patterns'
    },
    {
      id: 'quality-3',
      type: 'text',
      title: 'Concrete slump test results',
      value: '',
      placeholder: 'Enter slump test measurements...',
      required: true
    },
    {
      id: 'quality-4',
      type: 'checkbox',
      title: 'Electrical rough-in inspected',
      checked: false,
      required: true
    },
    {
      id: 'quality-5',
      type: 'multiple_choice',
      title: 'Framing level and square tolerance',
      options: ['Within 1/8"', 'Within 1/4"', 'Within 1/2"', 'Exceeds tolerance'],
      required: true
    },
    {
      id: 'quality-6',
      type: 'text',
      title: 'Material quality notes',
      value: '',
      placeholder: 'Notes on material quality and defects...',
      multiline: true
    },
    {
      id: 'quality-7',
      type: 'checkbox',
      title: 'Insulation properly installed',
      checked: false,
      required: true
    },
    {
      id: 'quality-8',
      type: 'multiple_choice',
      title: 'Drywall finish quality',
      options: ['Level 5 (highest)', 'Level 4', 'Level 3', 'Level 2', 'Unacceptable'],
      allowOther: true,
      required: true
    },
    {
      id: 'quality-9',
      type: 'checkbox',
      title: 'Windows and doors operate smoothly',
      checked: false,
      required: true
    },
    {
      id: 'quality-10',
      type: 'text',
      title: 'Measurements verification',
      value: '',
      placeholder: 'Record critical measurements...',
      required: true
    }
  ],
  completedCount: 0,
  totalCount: 10
};

// Project Handover Checklist
const handoverChecklist: Checklist = {
  id: 'handover',
  title: 'Project Handover Checklist',
  description: 'Final handover inspection and documentation',
  items: [
    {
      id: 'handover-1',
      type: 'checkbox',
      title: 'All permits and approvals obtained',
      checked: false,
      required: true
    },
    {
      id: 'handover-2',
      type: 'checkbox',
      title: 'Final inspection completed',
      checked: false,
      required: true
    },
    {
      id: 'handover-3',
      type: 'multiple_choice',
      title: 'Client walkthrough status',
      options: ['Completed - Approved', 'Completed - Minor items', 'Completed - Major items', 'Not completed'],
      required: true
    },
    {
      id: 'handover-4',
      type: 'text',
      title: 'Warranty documentation',
      value: '',
      placeholder: 'List warranty items and periods...',
      multiline: true,
      required: true
    },
    {
      id: 'handover-5',
      type: 'checkbox',
      title: 'Operation manuals provided',
      checked: false,
      required: true
    },
    {
      id: 'handover-6',
      type: 'checkbox',
      title: 'As-built drawings delivered',
      checked: false,
      required: true
    },
    {
      id: 'handover-7',
      type: 'text',
      title: 'Punch list items',
      value: '',
      placeholder: 'List any remaining punch list items...',
      multiline: true
    },
    {
      id: 'handover-8',
      type: 'multiple_choice',
      title: 'Client satisfaction rating',
      options: ['Excellent', 'Good', 'Satisfactory', 'Needs improvement'],
      allowOther: true,
      required: true
    },
    {
      id: 'handover-9',
      type: 'checkbox',
      title: 'Final payment processed',
      checked: false,
      required: true
    },
    {
      id: 'handover-10',
      type: 'text',
      title: 'Project completion notes',
      value: '',
      placeholder: 'Final notes and observations...',
      multiline: true
    }
  ],
  completedCount: 0,
  totalCount: 10
};

// Export the checklist mode options
export const checklistModeOptions: ChecklistModeOption[] = [
  {
    id: 'safety',
    label: 'Safety Inspection Checklist',
    icon: 'CheckSquare',
    description: `${safetyChecklist.completedCount} of ${safetyChecklist.totalCount} completed`,
    type: 'checklist',
    checklist: safetyChecklist
  },
  {
    id: 'quality',
    label: 'Quality Control Checklist',
    icon: 'CheckSquare',
    description: `${qualityChecklist.completedCount} of ${qualityChecklist.totalCount} completed`,
    type: 'checklist',
    checklist: qualityChecklist
  },
  {
    id: 'handover',
    label: 'Project Handover Checklist',
    icon: 'CheckSquare',
    description: `${handoverChecklist.completedCount} of ${handoverChecklist.totalCount} completed`,
    type: 'checklist',
    checklist: handoverChecklist
  }
];

export { safetyChecklist, qualityChecklist, handoverChecklist }; 