# Contextual Onboarding Flow

## Overview

The Contextual Onboarding flow is one of three onboarding experiences in the CompanyCam app prototype. It's designed around the philosophy of **"Learn as I work"** — progressively revealing features and collecting profile information in a way that feels natural and contextually relevant.

Unlike traditional onboarding that front-loads all questions before showing value, this flow personalizes the experience based on user responses and adapts subsequent screens accordingly.

---

## Flow Architecture

### Entry Point
Users select "Contextual Onboarding" from the flow selection screen, which shows:
- **Icon**: MapPin (green, `#10B981`)
- **Title**: "Contextual Onboarding"
- **Subtitle**: "Learn as I work"

### State Management
```typescript
const [contextualStep, setContextualStep] = useState(0);
```
The flow uses a single integer state to track progress through 20 possible screens (steps 0-19).

---

## Step-by-Step Flow

### Phase 1: Authentication & Identity (Steps 0-2)

#### Step 0: Welcome Screen
**Component**: `renderContextualWelcome()`

**Visual Design**:
- CompanyCam logo at top
- Bold headline: "Do good work. Capture it. Grow your business."
- Tagline: "The #1 most used app for contractors"
- Two auth buttons with distinct styling

**UI Elements**:
| Element | Style |
|---------|-------|
| Google Sign-In | White background, Google "G" logo, full-width |
| Email Sign-In | White background, Mail icon, full-width |
| Terms text | Small gray text with blue links |

**Flow Logic**: Both auth buttons advance to Step 2 (skipping Step 1 in this path).

---

#### Step 1: Setup Intro (Optional)
**Component**: `renderCustomSetupIntro()`

**Purpose**: Build anticipation with value preview

**Content**:
- Headline: "60-second account setup"
- Three benefit rows with colored icons:
  - ✓ "Personalized for your trade" (green checkmark)
  - ⚡ "Ready to go in minutes" (yellow bolt)
  - 👥 "Built for your team" (purple users)

**Design Pattern**: Uses `setupBenefitRow` and `setupBenefitIcon` styles with colored circular backgrounds.

---

#### Step 2: Phone Number Input
**Component**: `renderNamePhone()`

**Visual Design**:
- Blue context label: "60-second setup • Personalized for your trade"
- Headline: "What's your phone number?"
- Subheadline explaining passwordless login
- Large phone input with placeholder "(555) 123-4567"

**Form Behavior**:
- Auto-focus on mount
- Phone-pad keyboard type
- Validation: requires 10+ characters
- Continue button disabled until valid

**UX Pattern**: Uses `KeyboardAvoidingView` with bottom-pinned continue button.

---

### Phase 2: Trade & Company Profile (Steps 3-6)

#### Step 3: Trade Selector
**Component**: `renderTradeSelector()`

**Design Philosophy**: Extensive trade coverage to make every contractor feel recognized.

**Trade Categories** (43 total trades):
| Category | Trades |
|----------|--------|
| Popular | Roofing, General Contractor, HVAC, Plumbing, Electrical, Landscaping |
| Construction | Carpentry, Framing, Drywall, Concrete, Masonry, Siding, Insulation, Demolition |
| Finishing | Painting, Flooring, Tile & Stone, Cabinetry, Countertops, Trim & Molding |
| Systems | Fire Protection, Solar, Security Systems, Low Voltage |
| Exterior | Windows & Doors, Gutters, Fencing, Decks & Patios, Pools, Irrigation, Hardscaping |
| Landscaping | Lawn Care, Tree Service, Snow Removal |
| Specialty | Restoration, Remodeling, New Construction, Commercial, Industrial |
| Services | Property Maintenance, Handyman, Home Inspection, Pest Control, Cleaning, Moving |

**UI Features**:
- Search bar with clear button
- Each trade has unique icon and color
- Multi-select with checkmark indicators
- Floating continue button shows selection count
- "No results" state offers "Other" option

**Icon System**: Uses Lucide icons with trade-specific colors (e.g., Roofing = HardHat blue, HVAC = Wind red).

---

#### Step 4: Trade-Specific Integrations
**Component**: `renderTradeIntegrations()`

**Personalization Logic**: Displays integrations relevant to the user's selected trade(s).

**Integration Mapping** (example):
```typescript
'roofing': ['AccuLynx', 'JobNimbus', 'Roofr', 'HOVER', 'One Click Contractor']
'hvac': ['ServiceTitan', 'Housecall Pro', 'Jobber', 'FieldPulse', 'QuickBooks Online']
'restoration': ['Xcelerate', 'iRestore', 'Dash (Cotality)', 'IssueID', 'QuickBooks Online']
```

**OAuth-Enabled Integrations**:
QuickBooks Online, Google Calendar, Google Drive, Dropbox, Salesforce, HubSpot, monday.com, Zapier, SharePoint, Jobber, Housecall Pro, ServiceTitan, Procore

**UI States**:
| State | Button Style |
|-------|-------------|
| OAuth available | Blue "Connect" button |
| Manual setup needed | Gray "How to Connect" button |
| Connected | Green checkmark |

**Extended View**: "View all integrations" expands to full list with trade filter pills and search.

---

#### Step 5: Company Name
**Component**: `renderCompanyName()`

**Dynamic Content**: Uses selected trade to personalize the question.
- With trade: "What's the name of your roofing company?"
- Without trade: "What's the name of your company?"

**Form Behavior**:
- Auto-focus, auto-capitalize words
- Submit on keyboard "done"
- Continue button disabled until non-empty

---

#### Step 6: Company Size
**Component**: `renderCompanySize()`

**Size Options**:
| ID | Label |
|----|-------|
| solo | Just me |
| 2-5 | 2–5 |
| 6-10 | 6–10 |
| 11-25 | 11–25 |
| 26-50 | 26–50 |
| 51-100 | 51–100 |
| 101-500 | 101–500 |
| 500+ | 500+ |

**Branching Logic**:
- **Solo users** → Skip role selection (Step 7) and team invites (Step 8), go directly to Pathways (Step 9)
- **Teams** → Continue to role selection (Step 7)

**Copy**: "A 3-person crew and a 300-person company work very differently. We'll set things up to match how you operate."

---

### Phase 3: Role & Team Setup (Steps 7-8)

#### Step 7: Role Selector
**Component**: `renderRoleSelector()`

**Predefined Roles**:
| Role | Icon | Color |
|------|------|-------|
| Owner | Briefcase | Blue (#3B82F6) |
| Sales | Users | Green (#10B981) |
| Marketing | Sparkles | Purple (#A855F7) |
| Admin | FileText | Amber (#F59E0B) |
| Operations | Construction | Sky (#0EA5E9) |
| Field / Crew | HardHat | Red (#EF4444) |

**Custom Role**: Text input with "e.g. Project Manager, Estimator..." placeholder.

**Design**: Uses same card style as trade selector with checkmark on selection.

---

#### Step 8: Role-Based Team Invites
**Component**: `renderInviteByRole()`

**Dynamic Role Suggestions**: Based on user's role, suggests complementary roles to invite.

| User's Role | Suggested Invites |
|-------------|-------------------|
| Owner | Field / Crew, Operations Manager |
| Operations | Field / Crew, Owner / Boss |
| Field / Crew | Owner / Boss, Operations Manager |
| Sales | Field / Crew, Owner / Boss |
| Admin | Field / Crew, Owner / Boss |

**UI Components**:
1. **Role List**: Shows user's role (marked "You") + suggested roles
2. **Invite Buttons**: "Invite" or "Edit" depending on state
3. **Add Custom Role**: Input to add roles not in suggestions
4. **Bottom Sheet**: Appears when tapping "Invite" with:
   - Role-specific value message
   - "Choose from Contacts" option
   - Manual email/phone input
   - "Add to Team" confirmation

**Value Messages by Role**:
- Owner: "They'll see every job photo in real-time—no more chasing updates."
- Operations: "They'll track progress across all jobs without leaving their desk."
- Field/Crew: "They'll capture work on-site so the office always knows what's happening."

**Social Proof**: "3+ million photos captured daily by teams like yours"

**Free Seats Messaging**: "These seats are included with your account — no extra cost."

---

### Phase 4: Personalized Activation (Step 9)

#### Step 9: Personalized Pathways
**Component**: `renderPersonalizedPathways()`

**Purpose**: Offer role-appropriate next steps instead of generic "explore the app."

**Pathways by Role**:

| Role | Pathway 1 (Recommended) | Pathway 2 | Pathway 3 |
|------|------------------------|-----------|-----------|
| Owner | Import camera roll | Connect software | AI Capture Notes |
| Sales | Import camera roll | Connect software | AI Capture Notes |
| Marketing | Import camera roll | Turn docs into checklists | Connect software |
| Admin | Turn docs into checklists | Connect software | Import camera roll |
| Operations | Turn docs into checklists | AI Capture Notes | Connect software |
| Field/Crew | Import camera roll | AI Capture Notes | Turn docs into checklists |

**Pathway Actions**:
- `magic-sync` → Alert explaining camera roll import
- `connect-software` → Goes to Step 4 (integrations)
- `ai-walkthrough` → Goes to Step 16 (voice note demo)
- `ai-checklists` → Alert explaining checklist creation

**Design**: Card-based with icon, title, description, and chevron. First card has "Recommended" badge.

---

### Phase 5: Feature Demos (Steps 10-19)

These steps demonstrate core product features through interactive experiences.

#### Steps 10-11: Location Setup
- **Step 10** (`renderLocationPermission`): Explains auto-organization by location with bullet benefits
- **Step 11** (`renderLocationSuccess`): Confirmation screen

#### Steps 12-14: Camera & First Capture
- **Step 12** (`renderCameraPermission`): Permission request with value explanation
- **Step 13** (`renderFirstCapture`): Simulated camera view with shutter button
- **Step 14** (`renderAutoOrganizedJob`): Shows mock job card created from capture

#### Steps 15-17: Voice Notes & AI
- **Step 15** (`renderVoiceNote`):
  - Tap-to-record interface with pulsing animation
  - Timer display during recording
  - AI processing spinner after recording
- **Step 16** (`renderAiNoteResult`): Shows AI-generated structured note with Issue/Action/Priority fields
- **Step 17** (`renderReportPreview`): Mock shareable report preview

#### Steps 18-19: Account & Completion
- **Step 18** (`renderAccountCreation`): Email/password/company form
- **Step 19** (`renderFirstRealJobChoice`): Four options for starting real usage

---

## Visual Design System

### Color Palette
| Usage | Color | Hex |
|-------|-------|-----|
| Primary Blue | Links, buttons, selected states | #3B82F6 |
| Success Green | Checkmarks, connected states | #10B981 |
| Warning Amber | Caution, energy icons | #F59E0B |
| Purple | Premium features, AI | #7C3AED |
| Red | Recording, alerts | #EF4444 |
| Slate Gray | Secondary text | #64748B |
| Light Gray | Borders, disabled | #94A3B8 |

### Typography
- **Headlines**: Inter-Bold, 24-28px
- **Body**: Inter-Regular, 16px
- **Labels**: Inter-Medium, 14px
- **Tiny Text**: Inter-Regular, 12px, gray

### Component Patterns
| Pattern | Usage |
|---------|-------|
| `iconCircle` | 40px circles with colored backgrounds for icons |
| `iconCircleBig` | 96px circles for hero illustrations |
| `tradeCard` | Horizontal cards with icon + label + checkmark |
| `primaryButton` | Full-width blue button, 56px height |
| `bottomButtonContainer` | Sticky footer with button + optional helper text |

---

## Progress Indicator

**Appears**: Steps 3-9 only

**Progress Calculation**:
```typescript
// Steps 0-2: No progress bar
// Steps 3-8: Progress from 55% to 100%
// Steps 8+: 100%
const currentProgress = 55 + ((step - 3) / 5) * 45;
```

**Design**: Thin horizontal bar at top, animated fill.

---

## Navigation Pattern

### Back Button
- Consistent placement in `screenHeader`
- Uses `ChevronLeft` icon
- Default behavior: decrement `contextualStep`
- Custom handlers for branching paths

### Forward Navigation
- Primary buttons advance to next step
- Selection actions (trade, role, size) auto-advance after brief delay
- Some paths skip steps based on user profile (e.g., solo users skip team invites)

---

## Key UX Principles

1. **Progressive Disclosure**: Only ask what's needed for the current context
2. **Immediate Personalization**: Trade selection immediately affects integration suggestions
3. **Role-Aware Messaging**: Copy adapts to speak to each role's priorities
4. **Value Before Commitment**: Feature demos before account creation
5. **Skippable Steps**: Most steps have "Skip" or "Continue" options
6. **Multi-Select Support**: Trades allow multiple selections
7. **Smart Defaults**: First pathway is marked "Recommended"

---

## Data Flow

```
Step 0-2: Authentication
    ↓
Step 3: selectedTrades[] → affects integrations, pathways
    ↓
Step 4: selectedIntegrations[] → connected software
    ↓
Step 5: companyName → used in copy
    ↓
Step 6: companySize → branching logic (solo vs team)
    ↓
Step 7: selectedRole → affects team suggestions, pathways
    ↓
Step 8: roleInvites{} → team member contacts by role
    ↓
Step 9: Personalized pathways based on all above data
    ↓
Steps 10-19: Feature demos (location, camera, voice, AI, reports)
```

---

## Technical Implementation Notes

### Keyboard Handling
Steps with text input use `KeyboardAvoidingView` with:
- `behavior="padding"` on iOS
- `behavior="height"` on Android
- `keyboardShouldPersistTaps="handled"` for scroll views

### Contacts Integration
Team invites can pull from device contacts via `expo-contacts`:
- Requests permission on tap
- Uses `presentContactPickerAsync()` for native picker
- Extracts email (preferred) or phone number
- Stores display name alongside contact info

### Bottom Sheet
Role invite sheet uses `@gorhom/bottom-sheet`:
- 55% snap point
- Custom backdrop with tap-to-close
- `BottomSheetTextInput` for proper keyboard handling

---

## File Location
`screens/OnboardingScreen.tsx` — Lines 566-2486 contain the contextual flow renderers.
