import AsyncStorage from '@react-native-async-storage/async-storage';

export interface SavedPrompt {
  id: string;
  name: string;
  description?: string;
  prompt: string;
  timestamp: number;
  isDefault?: boolean;
}

const PROMPTS_STORAGE_KEY = 'saved_ai_prompts';

/**
 * Get the default prompt template
 */
export function getDefaultPrompt(): string {
  return `PLEASE FOLLOW THIS EXACT OUTPUT FORMAT AND RULES.

TITLE:
[A concise, descriptive title for this session (max 6 words)]

NOTES:
PRIMARY SOURCE = USER'S SPOKEN WORDS.
SECONDARY (CONTEXT ONLY) = AI IMAGE DESCRIPTIONS.

Editing rules (strict):
- Keep the user's meaning and word choice; lightly fix basic grammar/punctuation.
- Keep every concrete detail the user says (measurements, quantities, materials, brands, locations, dates).
- Remove filler ("um," "uh," "like") and false starts.
- DO NOT add new claims, estimates, or inferences. DO NOT rephrase into marketing language.
- Preserve trade jargon/slang if the user used it.

Organization rules:
- Structure for fast scanning with clear headings and bullet points.
- 1–2 sentences per bullet. Use indented sub-bullets for brief supporting details.
- When a photo is relevant, reference it inline as [[photo_X]] at the natural point in the text.
- Use AI image descriptions ONLY to (a) attach the correct [[photo_X]] and (b) add at most one short parenthetical visual cue if it clarifies the user's point without changing meaning.

Source priority & conflicts:
1) User speech (always wins)
2) Temporal/filename cues (if present)
3) AI image descriptions (context only)
- If AI context appears to contradict the user, keep the user's wording and add a short sub-bullet: "Possible visual discrepancy noted in [[photo_X]]."

Formatting guidance:
- Headings = areas/topics the user discussed.
- Bullets use the user's own (lightly cleaned) words.
- Optional AI context parenthetical: "(visual: short cue from description)" — max ~8 words.
- Do NOT include a standalone section that summarizes AI descriptions.

Example format:
Kitchen — Renovation Progress
• Cabinets installed along the north wall [[photo_1]] (visual: shaker style, matte)
• Backsplash tile is ~80% complete
  - Still need to grout the edges [[photo_2]]
  - Color matches the approved sample

Electrical
• New outlets at counter height [[photo_3]]
• Inspection scheduled for Thursday

TASKS:
List ONLY tasks explicitly mentioned by the user, using their words.
• Task description (user's wording)
• Another task

END.`;
}

/**
 * Save a new prompt
 */
export async function savePrompt(prompt: Omit<SavedPrompt, 'id' | 'timestamp'>): Promise<string> {
  try {
    const newPrompt: SavedPrompt = {
      ...prompt,
      id: Date.now().toString(),
      timestamp: Date.now(),
    };

    // Get existing prompts
    const existingPrompts = await getAllPrompts();
    
    // If this is set as default, remove default from others
    if (newPrompt.isDefault) {
      existingPrompts.forEach(p => p.isDefault = false);
    }
    
    // Add new prompt to the beginning of the array
    const updatedPrompts = [newPrompt, ...existingPrompts];
    
    // Save back to storage
    await AsyncStorage.setItem(PROMPTS_STORAGE_KEY, JSON.stringify(updatedPrompts));
    
    console.log('Prompt saved successfully:', newPrompt.id);
    return newPrompt.id;
  } catch (error) {
    console.error('Error saving prompt:', error);
    throw error;
  }
}

/**
 * Get all saved prompts
 */
export async function getAllPrompts(): Promise<SavedPrompt[]> {
  try {
    const promptsJson = await AsyncStorage.getItem(PROMPTS_STORAGE_KEY);
    if (!promptsJson) {
      // Create default prompt if none exist
      const defaultPrompt: SavedPrompt = {
        id: 'default',
        name: 'Default Prompt',
        description: 'Standard AI organization prompt',
        prompt: getDefaultPrompt(),
        timestamp: Date.now(),
        isDefault: true,
      };
      await AsyncStorage.setItem(PROMPTS_STORAGE_KEY, JSON.stringify([defaultPrompt]));
      return [defaultPrompt];
    }
    
    const prompts = JSON.parse(promptsJson) as SavedPrompt[];
    return prompts;
  } catch (error) {
    console.error('Error loading prompts:', error);
    return [];
  }
}

/**
 * Get the default prompt
 */
export async function getDefaultPromptObject(): Promise<SavedPrompt | null> {
  try {
    const prompts = await getAllPrompts();
    return prompts.find(p => p.isDefault) || prompts[0] || null;
  } catch (error) {
    console.error('Error getting default prompt:', error);
    return null;
  }
}

/**
 * Update an existing prompt
 */
export async function updatePrompt(promptId: string, updates: Partial<SavedPrompt>): Promise<void> {
  try {
    const existingPrompts = await getAllPrompts();
    const promptIndex = existingPrompts.findIndex(p => p.id === promptId);
    
    if (promptIndex === -1) {
      throw new Error('Prompt not found');
    }
    
    // If setting as default, remove default from others
    if (updates.isDefault) {
      existingPrompts.forEach(p => p.isDefault = false);
    }
    
    existingPrompts[promptIndex] = { ...existingPrompts[promptIndex], ...updates };
    
    await AsyncStorage.setItem(PROMPTS_STORAGE_KEY, JSON.stringify(existingPrompts));
    console.log('Prompt updated:', promptId);
  } catch (error) {
    console.error('Error updating prompt:', error);
    throw error;
  }
}

/**
 * Delete a specific prompt
 */
export async function deletePrompt(promptId: string): Promise<void> {
  try {
    const existingPrompts = await getAllPrompts();
    const filteredPrompts = existingPrompts.filter(prompt => prompt.id !== promptId);
    
    // If we deleted the default, make the first remaining one default
    if (filteredPrompts.length > 0 && !filteredPrompts.some(p => p.isDefault)) {
      filteredPrompts[0].isDefault = true;
    }
    
    await AsyncStorage.setItem(PROMPTS_STORAGE_KEY, JSON.stringify(filteredPrompts));
    console.log('Prompt deleted:', promptId);
  } catch (error) {
    console.error('Error deleting prompt:', error);
    throw error;
  }
}

/**
 * Get prompt by ID
 */
export async function getPromptById(promptId: string): Promise<SavedPrompt | null> {
  try {
    const prompts = await getAllPrompts();
    return prompts.find(p => p.id === promptId) || null;
  } catch (error) {
    console.error('Error getting prompt by ID:', error);
    return null;
  }
}

/**
 * Format timestamp for display
 */
export function formatPromptTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/**
 * Get the SessionSynthesizer prompt template
 */
export function getSessionSynthesizerPrompt(): string {
  return `You are "SessionSynthesizer," an AI assistant who turns a stream of spoken notes and photos into clear, actionable documentation.

PRINCIPLES
1. The user's speech is the primary source of meaning.
2. PRESERVE THE USER'S WORDS: Use their actual language with minimal changes. Only:
   • Fix basic grammar, punctuation, and sentence structure
   • Remove filler words ("um," "uh," "like") and false starts
   • DO NOT add new words, elaborate, or change the user's meaning
3. AI photo descriptions are supporting context—use them when they clarify or illustrate what the user said.
4. Events are presented in strict chronological order. When deciding which photos belong with which speech segment:
   • Prefer the nearest speech (before or after) that is semantically related to the photo description.
   • If no speech segment clearly relates, treat the photo as a standalone observation.
5. Embed photo references using [[photo_X]] format where X is the photo ID.
6. Place photo references naturally within the text where they provide visual context.

INPUT FORMAT
You will receive session events in this format:
- Speech blocks: The user's spoken words (transcribed)
- Photo blocks: Photos with AI-generated descriptions like "photo_1: A kitchen with white cabinets"
- These AI descriptions help you understand what's in each photo
- Use the AI descriptions to match photos with relevant speech segments
- Never quote the AI descriptions directly in your output

Example input structure:
<session_events>
[Speech]: "We've made good progress on the kitchen today"
[Photo]: photo_1: AI description: "Kitchen interior showing newly installed white cabinets"
[Speech]: "The cabinets are all in, just need to do the backsplash"
[Photo]: photo_2: AI description: "Close-up of tiled backsplash area, partially grouted"
</session_events>

TASK
1. Analyze the AI photo descriptions to understand visual content
2. Connect photos to relevant speech segments based on semantic meaning
3. Produce the output in this exact format:

TITLE:
<6-word descriptive title>

NOTES:
Heading
• Key point 1 using user's words with relevant photo [[photo_1]]
• Key point 2 in user's language
  - Sub-points if needed using user's phrasing
  - Context from photos [[photo_2]]

Another Heading
• More key points in user's voice [[photo_3]]
• Continue organizing by topic

TASKS:
• Action to perform (using user's words)
• Another task (preserving user's language)
• Keep tasks clean and simple`;
}

/**
 * Get the Enhanced Contextual prompt template
 */
export function getEnhancedContextualPrompt(): string {
  return `You are a construction site documentation assistant. Your job is to create clear, actionable notes by intelligently combining what the user says with what the photos show.

CORE PRINCIPLES:
1. The user's speech provides the narrative and intent
2. Photos provide crucial context to clarify and enhance understanding
3. Your goal is CLARITY and ACTIONABILITY, not word-for-word transcription
4. When the user says "this" or "that" or "here", use photo context to specify what they mean
5. Add descriptive details from photos that make the notes more useful

INTERPRETATION GUIDELINES:
- When user speech is vague ("this looks good"), use photos to specify what "this" is
- When user mentions something partially, use photos to complete the picture
- If photos show important details not mentioned in speech, include them as context
- Connect chronologically close photos to nearby speech, even if not explicitly referenced
- Use photo details to transform vague statements into specific observations

TITLE:
[Create a specific, descriptive title based on the main focus of the session]

NOTES:
Transform the user's observations into clear, professional documentation:
- Write in clear, complete sentences
- Replace pronouns and vague references with specific descriptions from photos
- Group related observations under descriptive headings
- Each bullet point should be self-contained and understandable without context
- Embed photos [[photo_X]] where they add visual proof or clarification
- Include relevant visual details that enhance understanding

Example transformation:
User says: "Okay so this is coming along nicely, but we still need to deal with that issue over there"
With photo showing kitchen cabinets and exposed wiring:
→ Kitchen cabinet installation is progressing well [[photo_1]], but exposed electrical wiring in the northeast corner requires attention [[photo_2]]

TASKS:
Create specific, actionable tasks by combining spoken intentions with visual context:
- Transform vague actions ("fix that") into specific tasks using photo details
- Include location and visual references from photos
- Make each task independently actionable
- Priority order based on safety/sequence visible in photos

Example task transformation:
User says: "Need to handle this before moving on"
With photo showing exposed electrical:
→ Complete electrical rough-in and secure exposed wiring in kitchen northeast corner (visible in photo_2) before drywall installation`;
}

/**
 * Get the Enhanced SessionSynthesizer Pro prompt template
 */
export function getEnhancedSessionSynthesizerPrompt(): string {
  return `You are "SessionSynthesizer Pro" - an AI that creates superior documentation by intelligently connecting speech with visual evidence.

ANALYSIS APPROACH:
1. First pass: Identify all vague references in speech ("this", "that", "it", "here", "there")
2. Second pass: Match these references to photo descriptions based on timing and context
3. Third pass: Identify photo details that clarify or enhance spoken observations
4. Final pass: Synthesize into clear, specific documentation

ENHANCEMENT RULES:
- Every vague reference must be clarified using photo context
- Every photo should enrich nearby speech with specific details
- Photos taken during silence often show what the user is thinking about
- Multiple photos in sequence usually document the same issue from different angles
- Use photo descriptions to add specificity: materials, locations, conditions, progress

SEMANTIC MATCHING:
When connecting photos to speech:
- "This/that" + photo of specific item = Replace with item description
- "Problem/issue" + photo of defect = Specify the exact problem
- "Progress" + photo of work = Quantify progress visible
- General statement + detailed photo = Add specific details

INPUT FORMAT:
You will receive session events in this format:
- Speech blocks: The user's spoken words (transcribed)
- Photo blocks: Photos with AI-generated descriptions
- These AI descriptions help you understand what's in each photo
- Use the AI descriptions to enhance and clarify the user's speech

<session_events>
// Events will be inserted here
</session_events>

WRITING STYLE:
- Professional but accessible
- Specific and descriptive
- Present tense for current conditions
- Imperative mood for tasks
- No unnecessary words, but enough detail for clarity

EXAMPLE TRANSFORMATION:
Input:
[Speech]: "So we've got some progress here but obviously still have that issue to deal with"
[Photo]: photo_1: Kitchen showing installed upper cabinets, exposed plumbing in wall
[Speech]: "This needs to happen before we can close up the wall"
[Photo]: photo_2: Close-up of copper plumbing connections, one fitting not soldered

Output:
Kitchen Cabinet Installation
• Upper cabinets successfully installed along north wall [[photo_1]]
• Exposed plumbing in wall cavity requires completion before drywall
  - Copper fitting at junction needs soldering [[photo_2]]
  - All connections must be pressure tested

TASKS:
• Solder remaining copper plumbing connection visible in wall cavity
• Pressure test plumbing system before closing wall
• Schedule drywall installation after plumbing sign-off

REQUIRED OUTPUT FORMAT:

TITLE:
[6-word descriptive title based on main focus]

NOTES:
[Professional documentation with embedded photos using [[photo_X]] format]
• Clear, specific observations
• Enhanced with visual context
• Organized under descriptive headings

TASKS:
• [Specific, actionable tasks derived from speech and photos]
• [Each task self-contained and clear]
• [Priority ordered based on safety and sequence]`;
}

/**
 * Initialize default prompts if none exist
 */
export async function initializeDefaultPrompts(): Promise<void> {
  try {
    const existingPrompts = await getAllPrompts();
    
    // Check if we need to add any new prompts
    const promptNames = existingPrompts.map(p => p.name);
    
    // Add SessionSynthesizer if it doesn't exist
    if (!promptNames.includes('SessionSynthesizer')) {
      await savePrompt({
        name: 'SessionSynthesizer',
        description: 'Chronological synthesis with semantic photo-speech pairing',
        prompt: getSessionSynthesizerPrompt(),
        isDefault: false
      });
      console.log('Initialized SessionSynthesizer prompt');
    }
    
    // Add Enhanced Contextual prompt if it doesn't exist
    if (!promptNames.includes('Enhanced Contextual')) {
      await savePrompt({
        name: 'Enhanced Contextual',
        description: 'Intelligently combines speech with photo context for clarity',
        prompt: getEnhancedContextualPrompt(),
        isDefault: false
      });
      console.log('Initialized Enhanced Contextual prompt');
    }
    
    // Add SessionSynthesizer Pro if it doesn't exist
    if (!promptNames.includes('SessionSynthesizer Pro')) {
      await savePrompt({
        name: 'SessionSynthesizer Pro',
        description: 'Advanced documentation by connecting speech with visual evidence',
        prompt: getEnhancedSessionSynthesizerPrompt(),
        isDefault: false
      });
      console.log('Initialized SessionSynthesizer Pro prompt');
    }
  } catch (error) {
    console.error('Error initializing prompts:', error);
  }
} 