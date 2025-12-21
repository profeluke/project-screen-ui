export interface TimelineEvent {
  type: 'speech' | 'photo' | 'note';
  start?: number;
  end?: number;
  time?: number;
  text?: string;
  ai_desc?: string;
}

export interface SpeechBlock {
  start: number;
  end: number;
  speech: string;
  text: string;
  photos: Array<{
    time: number;
    ai_desc: string;
  }>;
}

export interface PhotoBlock {
  start: number;
  end: number;
  speech: '';
  text: '';
  photos: Array<{
    time: number;
    ai_desc: string;
  }>;
}

export type Block = SpeechBlock | PhotoBlock;

/**
 * Converts chronological timeline events into speech-anchored blocks
 * @param events Chronological array of timeline events
 * @returns Array of blocks with photos grouped into speech segments
 */
export function timelineToBlocks(events: TimelineEvent[]): Block[] {
  const blocks: Block[] = [];
  const orphanedPhotos: TimelineEvent[] = [];

  // First pass: create speech blocks
  events.forEach(event => {
    if (event.type === 'speech' && event.start !== undefined && event.end !== undefined && event.text) {
      const speechBlock: SpeechBlock = {
        start: event.start,
        end: event.end,
        speech: event.text,
        text: event.text,
        photos: []
      };
      blocks.push(speechBlock);
    }
  });

  // Second pass: assign photos to speech blocks
  events.forEach(event => {
    if (event.type === 'photo' && event.time !== undefined && event.ai_desc) {
      let assigned = false;
      
      // Try to find a speech block that contains this photo
      for (const block of blocks) {
        if (block.start <= event.time && event.time <= block.end) {
          block.photos.push({
            time: event.time,
            ai_desc: event.ai_desc
          });
          assigned = true;
          break;
        }
      }
      
      // If photo doesn't fit any speech window, mark as orphaned
      if (!assigned) {
        orphanedPhotos.push(event);
      }
    }
  });

  // Third pass: create standalone blocks for orphaned photos
  orphanedPhotos.forEach(photo => {
    if (photo.time !== undefined && photo.ai_desc) {
      const photoBlock: PhotoBlock = {
        start: photo.time,
        end: photo.time,
        speech: '',
        text: '',
        photos: [{
          time: photo.time,
          ai_desc: photo.ai_desc
        }]
      };
      blocks.push(photoBlock);
    }
  });

  // Sort blocks by start time
  blocks.sort((a, b) => a.start - b.start);

  return blocks;
}

/**
 * Helper function to format time in MM:SS format
 */
export function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
} 