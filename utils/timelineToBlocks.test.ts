import { timelineToBlocks, TimelineEvent, Block, formatTime } from './timelineToBlocks';

describe('timelineToBlocks', () => {
  test('should handle photo inside speech window', () => {
    const events: TimelineEvent[] = [
      {
        type: 'speech',
        start: 0,
        end: 10,
        text: 'Let me show you this room'
      },
      {
        type: 'photo',
        time: 5,
        ai_desc: 'A messy bedroom with clothes on the floor'
      }
    ];

    const blocks = timelineToBlocks(events);

    expect(blocks).toHaveLength(1);
    expect(blocks[0]).toEqual({
      start: 0,
      end: 10,
      speech: 'Let me show you this room',
      text: 'Let me show you this room',
      photos: [{
        time: 5,
        ai_desc: 'A messy bedroom with clothes on the floor'
      }]
    });
  });

  test('should handle photo outside speech window', () => {
    const events: TimelineEvent[] = [
      {
        type: 'speech',
        start: 0,
        end: 5,
        text: 'This is the first thing'
      },
      {
        type: 'photo',
        time: 10,
        ai_desc: 'A kitchen counter with dishes'
      }
    ];

    const blocks = timelineToBlocks(events);

    expect(blocks).toHaveLength(2);
    
    // Speech block
    expect(blocks[0]).toEqual({
      start: 0,
      end: 5,
      speech: 'This is the first thing',
      text: 'This is the first thing',
      photos: []
    });
    
    // Orphaned photo block
    expect(blocks[1]).toEqual({
      start: 10,
      end: 10,
      speech: '',
      text: '',
      photos: [{
        time: 10,
        ai_desc: 'A kitchen counter with dishes'
      }]
    });
  });

  test('should handle multiple photos within one speech segment', () => {
    const events: TimelineEvent[] = [
      {
        type: 'speech',
        start: 0,
        end: 20,
        text: 'Let me walk through this entire room'
      },
      {
        type: 'photo',
        time: 3,
        ai_desc: 'Left side of the room'
      },
      {
        type: 'photo',
        time: 10,
        ai_desc: 'Center of the room'
      },
      {
        type: 'photo',
        time: 17,
        ai_desc: 'Right side of the room'
      }
    ];

    const blocks = timelineToBlocks(events);

    expect(blocks).toHaveLength(1);
    expect(blocks[0]).toEqual({
      start: 0,
      end: 20,
      speech: 'Let me walk through this entire room',
      text: 'Let me walk through this entire room',
      photos: [
        { time: 3, ai_desc: 'Left side of the room' },
        { time: 10, ai_desc: 'Center of the room' },
        { time: 17, ai_desc: 'Right side of the room' }
      ]
    });
  });

  test('should handle complex mixed scenario', () => {
    const events: TimelineEvent[] = [
      {
        type: 'speech',
        start: 0,
        end: 8,
        text: 'First I need to check this area'
      },
      {
        type: 'photo',
        time: 5,
        ai_desc: 'Photo during first speech'
      },
      {
        type: 'photo',
        time: 12,
        ai_desc: 'Photo between speeches'
      },
      {
        type: 'speech',
        start: 15,
        end: 25,
        text: 'Now let me show you the next section'
      },
      {
        type: 'photo',
        time: 20,
        ai_desc: 'Photo during second speech'
      },
      {
        type: 'photo',
        time: 22,
        ai_desc: 'Another photo during second speech'
      }
    ];

    const blocks = timelineToBlocks(events);

    expect(blocks).toHaveLength(3);
    
    // First speech block
    expect(blocks[0]).toEqual({
      start: 0,
      end: 8,
      speech: 'First I need to check this area',
      text: 'First I need to check this area',
      photos: [{
        time: 5,
        ai_desc: 'Photo during first speech'
      }]
    });
    
    // Orphaned photo block
    expect(blocks[1]).toEqual({
      start: 12,
      end: 12,
      speech: '',
      text: '',
      photos: [{
        time: 12,
        ai_desc: 'Photo between speeches'
      }]
    });
    
    // Second speech block
    expect(blocks[2]).toEqual({
      start: 15,
      end: 25,
      speech: 'Now let me show you the next section',
      text: 'Now let me show you the next section',
      photos: [
        { time: 20, ai_desc: 'Photo during second speech' },
        { time: 22, ai_desc: 'Another photo during second speech' }
      ]
    });
  });

  test('should handle empty events array', () => {
    const events: TimelineEvent[] = [];
    const blocks = timelineToBlocks(events);
    expect(blocks).toHaveLength(0);
  });

  test('should handle speech only (no photos)', () => {
    const events: TimelineEvent[] = [
      {
        type: 'speech',
        start: 0,
        end: 10,
        text: 'Just talking, no photos'
      }
    ];

    const blocks = timelineToBlocks(events);

    expect(blocks).toHaveLength(1);
    expect(blocks[0]).toEqual({
      start: 0,
      end: 10,
      speech: 'Just talking, no photos',
      text: 'Just talking, no photos',
      photos: []
    });
  });

  test('should handle photos only (no speech)', () => {
    const events: TimelineEvent[] = [
      {
        type: 'photo',
        time: 5,
        ai_desc: 'First photo'
      },
      {
        type: 'photo',
        time: 10,
        ai_desc: 'Second photo'
      }
    ];

    const blocks = timelineToBlocks(events);

    expect(blocks).toHaveLength(2);
    expect(blocks[0]).toEqual({
      start: 5,
      end: 5,
      speech: '',
      text: '',
      photos: [{ time: 5, ai_desc: 'First photo' }]
    });
    expect(blocks[1]).toEqual({
      start: 10,
      end: 10,
      speech: '',
      text: '',
      photos: [{ time: 10, ai_desc: 'Second photo' }]
    });
  });
});

describe('formatTime', () => {
  test('should format seconds correctly', () => {
    expect(formatTime(0)).toBe('0:00');
    expect(formatTime(30)).toBe('0:30');
    expect(formatTime(60)).toBe('1:00');
    expect(formatTime(125)).toBe('2:05');
    expect(formatTime(3661)).toBe('61:01');
  });
}); 