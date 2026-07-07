// Shared game data — single source of truth for play page and guide page.

export const BASE_CHARS = {
  '气': { char: '气', pinyin: 'qì', emoji: '💨', name: 'Air' },
  '土': { char: '土', pinyin: 'tǔ', emoji: '🌱', name: 'Dirt' },
  '火': { char: '火', pinyin: 'huǒ', emoji: '🔥', name: 'Fire' },
  '水': { char: '水', pinyin: 'shuǐ', emoji: '💧', name: 'Water' },
};

export const RECIPES = {
  // --- THERMODYNAMICS & STATES OF MATTER ---
  '火水': { 
    result: '汽', pinyin: 'qì', name: 'Steam', emoji: '♨️', 
    category: 'States of Matter', note: 'Liquid water turns to gas when heated.' 
  },
  '水气': { 
    result: '冰', pinyin: 'bīng', name: 'Ice', emoji: '🧊', 
    category: 'States of Matter', note: 'Water solidifies in cold air.' 
  },
  '气水': { 
    result: '雾', pinyin: 'wù', name: 'Fog', emoji: '🌫️', 
    category: 'States of Matter', note: 'Water vapor condenses into tiny droplets.' 
  },
  

  // --- CHEMISTRY & MATERIAL SCIENCE ---
  '土土': { 
    result: '石', pinyin: 'shí', name: 'Stone', emoji: '🪨', 
    category: 'Materials', note: 'Compressed earth forms solid rock.' 
  },
  '石火': { 
    result: '金', pinyin: 'jīn', name: 'Metal', emoji: '🔩', 
    category: 'Materials', note: 'High heat extracts metal from ore.' 
  },
  
  '木火': { 
    result: '炭', pinyin: 'tàn', name: 'Charcoal', emoji: '🖤', 
    category: 'Materials', note: 'Wood carbonizes when burned without oxygen.' 
  },
 
  '土火': { 
    result: '砖', pinyin: 'zhuān', name: 'Brick', emoji: '🧱', 
    category: 'Materials', note: 'Clay hardens into ceramic when fired.' 
  },
  '石水': { 
    result: '砂', pinyin: 'shā', name: 'Sand', emoji: '⏳', 
    category: 'Materials', note: 'Stone erodes into fine grains over time.' 
  },

  // --- PHYSICAL MIXES & BIOLOGY ---
  '水土': { 
    result: '木', pinyin: 'mù', name: 'Wood', emoji: '🪵', 
    category: 'Physical Mixes & Biology', note: 'Plants grow by absorbing water and nutrients.' 
  },
  
  
  '气土': { 
    result: '尘', pinyin: 'chén', name: 'Dust', emoji: '🌪️', 
    category: 'Physical Mixes & Biology', note: 'Fine particles of earth suspended in air.' 
  },
  '气气': { 
    result: '风', pinyin: 'fēng', name: 'Wind', emoji: '🌬️', 
    category: 'Physical Mixes & Biology', note: 'Pressure gradients causing fluid movement.' 
  },
  '土水': { 
    result: '泥', pinyin: 'ní', name: 'Mud', emoji: '🟤', 
    category: 'Physical Mixes & Biology', note: 'A thick suspension of soil and water.' 
  },
};

// Utility: look up data for any character (base or discovered)
export const getData = (char) => {
  if (BASE_CHARS[char]) return BASE_CHARS[char];
  const recipe = Object.values(RECIPES).find(r => r.result === char);
  if (recipe) return { char: recipe.result, ...recipe };
  return { char, pinyin: '?', emoji: '✨', name: 'Unknown' };
};

/*
 Ensure emojis are unique across base chars and recipe results.
 If a duplicate is detected, pick a similar alternative from a small map.
 This runs at module load so UI always sees unique emojis.
*/
(() => {
  const used = new Set();

  // Start with base chars so they keep their chosen emoji
  Object.values(BASE_CHARS).forEach((b) => {
    if (b.emoji) used.add(b.emoji);
  });

  const alternatives = {
    '🌱': ['🌿', '🌳', '🌲'],
    '💨': ['💨', '🌬️'],
    '🔥': ['♨️', '🔥'],
    '💧': ['💦', '💧'],
    '🪨': ['🪵', '⛰️', '🪨'],
  };

  const fallbackPool = ['✨','🔸','🔹','⚪','🟤','🟠','🪵','🌿','🌳','🌲','💦','🌬️','♨️','🪨','🪙'];
  let fallbackIdx = 0;

  const pickAlternative = (orig) => {
    const list = alternatives[orig] || [];
    for (const e of list) {
      if (!used.has(e)) return e;
    }
    // fallback pool
    while (fallbackIdx < fallbackPool.length) {
      const e = fallbackPool[fallbackIdx++];
      if (!used.has(e)) return e;
    }
    // last resort: return original
    return orig;
  };

  Object.values(RECIPES).forEach((r) => {
    if (!r || !r.emoji) return;
    if (used.has(r.emoji)) {
      const alt = pickAlternative(r.emoji);
      r.emoji = alt;
    }
    used.add(r.emoji);
  });
})();
