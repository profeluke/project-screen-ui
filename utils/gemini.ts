import * as FileSystem from 'expo-file-system/legacy';

const GOOGLE_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
// Use Gemini 2.x/2.5 Flash Lite by default; let env override for flexibility
const GEMINI_VISION_MODEL = process.env.EXPO_PUBLIC_GEMINI_VISION_MODEL || 'gemini-2.5-flash-lite';
const GEMINI_TEXT_MODEL = process.env.EXPO_PUBLIC_GEMINI_TEXT_MODEL || GEMINI_VISION_MODEL;

const GEMINI_VISION_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_VISION_MODEL}:generateContent?key=${GOOGLE_API_KEY}`;
const GEMINI_TEXT_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_TEXT_MODEL}:generateContent?key=${GOOGLE_API_KEY}`;

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{ text?: string }>;
    };
  }>;
  promptFeedback?: {
    blockReason: string;
    safetyRatings: any[];
  };
}

export interface GeminiDocumentHypothesis {
  isDocument?: boolean;
  documentType?: string;
  confidence?: number;
  title?: string | null;
}

export interface GeminiVisionResult {
  description: string;
  documentHypothesis?: GeminiDocumentHypothesis;
  suggestedTags?: string[];
}

export interface SpeechIntentSuggestion {
  suggestedTaskTitle?: string;
  suggestedTaskDescription?: string;
  taskConfidence?: number;
  suggestedTags?: string[];
  tagsConfidence?: number;
}

const stripMarkdownCodeFence = (text: string) => {
  const trimmed = text.trim();
  if (trimmed.startsWith('```')) {
    return trimmed.replace(/^```[a-zA-Z]*\s*/, '').replace(/```\s*$/, '').trim();
  }
  return trimmed;
};

const extractCandidateText = (data: GeminiResponse): string | null => {
  const parts = data.candidates?.[0]?.content?.parts;
  if (!parts || parts.length === 0) return null;
  const combined = parts.map(part => part.text ?? '').join('').trim();
  return combined.length > 0 ? combined : null;
};

const parseJson = <T>(text: string): T | null => {
  try {
    return JSON.parse(stripMarkdownCodeFence(text));
  } catch (error) {
    console.warn('Failed to parse Gemini JSON response', error);
    return null;
  }
};

const normalizeTags = (tags: unknown): string[] | undefined => {
  if (!Array.isArray(tags)) return undefined;
  const normalized = tags
    .map(tag => (typeof tag === 'string' ? tag.trim() : ''))
    .filter(Boolean);
  return normalized.length > 0 ? normalized : undefined;
};

/**
 * Get an AI description for an image using Gemini.
 * @param imageUri The local URI of the image file.
 * @returns Structured vision insights or null if unavailable.
 */
export async function getGeminiVision(imageUri: string): Promise<GeminiVisionResult | null> {
  try {
    const base64ImageData = await FileSystem.readAsStringAsync(imageUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    if (!GOOGLE_API_KEY || GOOGLE_API_KEY === 'your_gemini_api_key_here') {
      console.warn('No image analysis provider configured');
      return null;
    }

    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: `You analyze images captured on construction sites. Describe what you see factually in <=25 words.

Classify if the image is a document (e.g., printed sheet, checklist, receipt, blueprint, permit, invoice) versus a regular scene.

Respond ONLY in JSON with this shape:
{
  "description": string,
  "document_hypothesis": {
    "is_document": boolean,
    "document_type": "document" | "checklist" | "receipt" | "blueprint" | "form" | "notes" | "other" | "photo",
    "confidence": number (0-1),
    "title": string | null // keep <=5 words when type is "notes"
  },
  "surface_tags": string[] // up to 5 short nouns or categories, lowercase
}

If unsure about a title, return null. When document_type is "notes", provide a concise title (≤4 words). Do not include markdown fences.`
            },
            {
              inline_data: { mime_type: 'image/jpeg', data: base64ImageData },
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.2,
        topK: 32,
        topP: 1,
        maxOutputTokens: 256,
        stopSequences: [],
      },
    };

    const response = await fetch(GEMINI_VISION_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      console.error('Gemini API Error:', JSON.stringify(errorBody, null, 2));
      throw new Error(`API Error: ${response.status}`);
    }

    const data: GeminiResponse = await response.json();
    const rawText = extractCandidateText(data);
    if (!rawText) {
      return null;
    }

    const parsed = parseJson<{
      description?: string;
      document_hypothesis?: {
        is_document?: boolean;
        document_type?: string;
        confidence?: number;
        title?: string | null;
      };
      surface_tags?: string[];
    }>(rawText);

    if (!parsed) {
      return {
        description: rawText,
      };
    }

    const hypothesis = parsed.document_hypothesis;

    const result: GeminiVisionResult = {
      description: (parsed.description ?? rawText).trim(),
      documentHypothesis: hypothesis
        ? {
            isDocument: hypothesis.is_document,
            documentType: hypothesis.document_type,
            confidence: typeof hypothesis.confidence === 'number' ? hypothesis.confidence : undefined,
            title: typeof hypothesis.title === 'string' ? hypothesis.title.trim() : null,
          }
        : undefined,
      suggestedTags: normalizeTags(parsed.surface_tags),
    };

    return result;
  } catch (error) {
    console.error('Error in getGeminiVision:', error);
    return null;
  }
}

/**
 * Analyze transcribed speech to infer potential tasks or tags.
 * @param transcription The transcribed speech text.
 */
export async function analyzeSpeechIntent(transcription: string): Promise<SpeechIntentSuggestion | null> {
  if (!transcription || !transcription.trim()) {
    return null;
  }

  if (!GOOGLE_API_KEY || GOOGLE_API_KEY === 'your_gemini_api_key_here') {
    console.warn('No speech intent provider configured');
    return null;
  }

  try {
    const trimmed = transcription.trim();

    const prompt = `You analyze short transcribed voice notes captured by users who are dictating observations or to-do thoughts. Decide whether the note implies a follow-up task, even if the speaker does not explicitly say "make a task," and whether they mention tags to apply to related photos.

Return ONLY strict JSON (no markdown) in this format:
{
  "create_task": {
    "should_create": boolean,
    "title": string | null,
    "description": string | null,
    "confidence": number
  },
  "apply_tags": {
    "should_tag": boolean,
    "tags": string[],
    "confidence": number
  }
}

Task titles must be <=12 words and imperative. Task descriptions <=25 words describing what needs to happen. Return nulls/empty arrays when uncertain.

Transcription: """${trimmed}"""`;

    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.1,
        topK: 32,
        topP: 1,
        maxOutputTokens: 256,
        stopSequences: [],
      },
    };

    const response = await fetch(GEMINI_TEXT_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      console.error('Gemini speech intent API Error:', JSON.stringify(errorBody, null, 2));
      return null;
    }

    const data: GeminiResponse = await response.json();
    const rawText = extractCandidateText(data);

    if (!rawText) {
      console.warn('Gemini speech intent returned no content');
      return null;
    }

    const parsed = parseJson<{
      create_task?: {
        should_create?: boolean;
        title?: string | null;
        description?: string | null;
        confidence?: number;
      };
      apply_tags?: {
        should_tag?: boolean;
        tags?: string[];
        confidence?: number;
      };
    }>(rawText);

    if (!parsed) {
      return null;
    }

    const suggestion: SpeechIntentSuggestion = {};

    if (parsed.create_task?.should_create && parsed.create_task.title) {
      const title = parsed.create_task.title.trim();
      if (title.length > 0) {
        suggestion.suggestedTaskTitle = title;
        const description = parsed.create_task.description?.trim();
        if (description) {
          suggestion.suggestedTaskDescription = description;
        }
        suggestion.taskConfidence = typeof parsed.create_task.confidence === 'number' ? parsed.create_task.confidence : undefined;
      }
    }

    if (parsed.apply_tags?.should_tag && parsed.apply_tags.tags) {
      const tags = normalizeTags(parsed.apply_tags.tags);
      if (tags && tags.length > 0) {
        suggestion.suggestedTags = tags;
        suggestion.tagsConfidence = typeof parsed.apply_tags.confidence === 'number' ? parsed.apply_tags.confidence : undefined;
      }
    }

    if (!suggestion.suggestedTaskTitle && (!suggestion.suggestedTags || suggestion.suggestedTags.length === 0)) {
      return null;
    }

    return suggestion;
  } catch (error) {
    console.error('Error analyzing speech intent:', error);
    return null;
  }
}

export interface SessionSummaryResult {
  summary: string;
  suggestions: Array<{
    type: 'capture' | 'document' | 'checklist' | 'task';
    label: string;
  }>;
}

/**
 * Summarize a capture session given photo descriptions and voice notes.
 * Returns a short summary and actionable suggestions.
 */
export async function getSessionSummary(
  photoDescriptions: string[],
  voiceNotes: string[]
): Promise<SessionSummaryResult | null> {
  if (photoDescriptions.length === 0 && voiceNotes.length === 0) {
    return null;
  }

  if (!GOOGLE_API_KEY || GOOGLE_API_KEY === 'your_gemini_api_key_here') {
    console.warn('No Gemini API key configured for session summary');
    return null;
  }

  try {
    const photoPart = photoDescriptions.length > 0
      ? `Photos captured:\n${photoDescriptions.map((d, i) => `${i + 1}. ${d}`).join('\n')}`
      : 'No photos captured yet.';

    const notesPart = voiceNotes.length > 0
      ? `Voice notes:\n${voiceNotes.map((n, i) => `${i + 1}. ${n}`).join('\n')}`
      : '';

    const prompt = `You are an AI assistant for a construction site documentation app. A user has been capturing photos and voice notes on a job site. Summarize what they appear to be documenting, then suggest 2-4 next actions they could take.

${photoPart}
${notesPart}

Respond ONLY in strict JSON (no markdown fences):
{
  "summary": string, // 1-2 sentences describing what they're documenting
  "suggestions": [
    {
      "type": "capture" | "document" | "checklist" | "task",
      "label": string // short action label, <=8 words
    }
  ]
}

"capture" = suggest something else to photograph.
"document" = suggest generating a document (proposal, work order, report, etc).
"checklist" = suggest creating a checklist or punch list.
"task" = suggest creating a follow-up task.

Keep suggestions practical and specific to what they've captured so far.`;

    const requestBody = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.3,
        topK: 32,
        topP: 1,
        maxOutputTokens: 512,
      },
    };

    const response = await fetch(GEMINI_TEXT_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      console.error('Gemini session summary API Error:', JSON.stringify(errorBody, null, 2));
      return null;
    }

    const data: GeminiResponse = await response.json();
    const rawText = extractCandidateText(data);
    if (!rawText) return null;

    const parsed = parseJson<{
      summary?: string;
      suggestions?: Array<{
        type?: string;
        label?: string;
      }>;
    }>(rawText);

    if (!parsed?.summary) return null;

    const validTypes = new Set(['capture', 'document', 'checklist', 'task']);
    const suggestions = (parsed.suggestions ?? [])
      .filter(s => s.label && s.type && validTypes.has(s.type))
      .map(s => ({
        type: s.type as 'capture' | 'document' | 'checklist' | 'task',
        label: s.label!,
      }));

    return {
      summary: parsed.summary.trim(),
      suggestions,
    };
  } catch (error) {
    console.error('Error getting session summary:', error);
    return null;
  }
}