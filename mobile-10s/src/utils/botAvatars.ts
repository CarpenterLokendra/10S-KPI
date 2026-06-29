export const BOT_NAMES = ['Alice', 'Bob', 'Charlie', 'Diana'];

// Bot colors for avatar gradient circles
export const BOT_COLOR_MAP: { [key: string]: string } = {
  Alice: '#a855f7',    // Purple
  Bob: '#3b82f6',      // Blue
  Charlie: '#10b981',  // Green
  Diana: '#f97316',    // Orange
};

// Helper to get bot name and color by index
export const getBotInfo = (index: number) => {
  const botName = BOT_NAMES[index % BOT_NAMES.length];
  return {
    name: botName,
    color: BOT_COLOR_MAP[botName],
  };
};
