// Shared progression data for the Chinese discovery game.
// Chinese headwords, pinyin, and English glosses come from the CC-CEDICT
// release cited below. Physical-process notes cite their own factual sources.

export const BIBLIOGRAPHY = Object.freeze([
  Object.freeze({
    id: 'cc-cedict-2026-07-18',
    citation: 'MDBG. CC-CEDICT Chinese-English Dictionary. Release 2026-07-18 06:57 GMT.',
    url: 'https://www.mdbg.net/chinese/dictionary?page=cc-cedict',
    license: 'Creative Commons Attribution-ShareAlike 4.0 International',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
    scope: 'Simplified Chinese headwords, standard Mandarin pinyin, and English definitions.',
  }),
  Object.freeze({
    id: 'usgs-clay',
    citation: 'U.S. Geological Survey. Environmental Characteristics of Clays and Clay Mineral Deposits.',
    url: 'https://pubs.usgs.gov/info/clays/',
    scope: 'How clay minerals interact with water and become workable mud or ceramic material.',
  }),
  Object.freeze({
    id: 'noaa-clouds',
    citation: 'National Oceanic and Atmospheric Administration. How Clouds Form.',
    url: 'https://prod-01-alb-www-noaa.woc.noaa.gov/jetstream/clouds/how-clouds-form',
    scope: 'Water vapor, condensation nuclei, cloud droplets, and atmospheric motion.',
  }),
  Object.freeze({
    id: 'noaa-precipitation',
    citation: 'National Oceanic and Atmospheric Administration. Precipitation.',
    url: 'https://prod-01-alb-www-noaa.woc.noaa.gov/jetstream/atmosphere/precipitation',
    scope: 'How cloud droplets grow and fall as rain.',
  }),
  Object.freeze({
    id: 'noaa-waves',
    citation: 'NOAA National Ocean Service. Why does the ocean have waves?',
    url: 'https://oceanservice.noaa.gov/facts/wavesinocean.html',
    scope: 'Wind transferring energy to surface water to create waves.',
  }),
  Object.freeze({
    id: 'usgs-wind-erosion',
    citation: 'U.S. Geological Survey. Wind erosion and dust from U.S. drylands.',
    url: 'https://www.usgs.gov/publications/wind-erosion-and-dust-us-drylands-a-review-causes-consequences-and-solutions-a',
    scope: 'Wind erosion, airborne soil, sand, and dust.',
  }),
  Object.freeze({
    id: 'usgs-rock-cycle',
    citation: 'U.S. Geological Survey. Rock Types and the Rock Cycle.',
    url: 'https://www.usgs.gov/educational-resources/whats-new-weeks-9-12',
    scope: 'Rock melting into lava and lava cooling into igneous rock.',
  }),
  Object.freeze({
    id: 'usgs-lava-cooling',
    citation: 'U.S. Geological Survey. Lava-Cooling Operations during the 1973 Eruption of Eldfell Volcano.',
    url: 'https://pubs.usgs.gov/of/1997/of97-724/lavacool.html',
    scope: 'Water removing heat from lava and accelerating solidification.',
  }),
  Object.freeze({
    id: 'usgs-weathering',
    citation: 'U.S. Geological Survey. Geology of Great Sand Dunes National Park.',
    url: 'https://www.usgs.gov/geology-and-ecology-of-national-parks/geology-great-sand-dunes-national-park',
    scope: 'Weathering, erosion, wind, water, sediment, and sand formation.',
  }),
  Object.freeze({
    id: 'corning-glass',
    citation: 'Corning. How Glass is Made.',
    url: 'https://www.corning.com/worldwide/en/innovation/materials-science/glass/how-glass-made.html',
    scope: 'Sand melting at high temperature and cooling into glass.',
  }),
  Object.freeze({
    id: 'brick-manufacturing',
    citation: 'Brick Industry Association. Manufacturing of Brick.',
    url: 'https://www.gobrick.com/media/file/9-manufacturing-of-brick.pdf',
    scope: 'Clay or shale being formed, dried, and fired into durable brick.',
  }),
  Object.freeze({
    id: 'infinite-craft',
    citation: 'Agarwal, Neal. Infinite Craft.',
    url: 'https://neal.fun/infinite-craft/',
    scope: 'Interaction reference: four starter elements, a free canvas, and a discovery-only item library.',
  }),
]);

const DICTIONARY_SOURCE_ID = BIBLIOGRAPHY[0].id;
const RECIPE_SEPARATOR = '\u001F';

const TONE_MARKS = Object.freeze({
  a: ['a', 'ā', 'á', 'ǎ', 'à'],
  e: ['e', 'ē', 'é', 'ě', 'è'],
  i: ['i', 'ī', 'í', 'ǐ', 'ì'],
  o: ['o', 'ō', 'ó', 'ǒ', 'ò'],
  u: ['u', 'ū', 'ú', 'ǔ', 'ù'],
  ü: ['ü', 'ǖ', 'ǘ', 'ǚ', 'ǜ'],
});

const markSyllable = (syllable) => {
  const normalized = syllable.toLowerCase().replaceAll('u:', 'ü');
  const match = normalized.match(/^([a-zü]+)([1-5])$/u);
  if (!match) return normalized;

  const [, letters, toneText] = match;
  const tone = Number(toneText);
  if (tone === 5) return letters;

  let vowelIndex = letters.indexOf('a');
  if (vowelIndex === -1) vowelIndex = letters.indexOf('e');
  if (vowelIndex === -1 && letters.includes('ou')) vowelIndex = letters.indexOf('o');
  if (vowelIndex === -1) {
    for (let index = letters.length - 1; index >= 0; index -= 1) {
      if (TONE_MARKS[letters[index]]) {
        vowelIndex = index;
        break;
      }
    }
  }

  if (vowelIndex === -1) return letters;
  const vowel = letters[vowelIndex];
  return `${letters.slice(0, vowelIndex)}${TONE_MARKS[vowel][tone]}${letters.slice(vowelIndex + 1)}`;
};

export const formatPinyin = (numberedPinyin) =>
  numberedPinyin.split(/\s+/u).map(markSyllable).join(' ');

const defineItem = ({ sourcePinyin, ...item }) => Object.freeze({
  ...item,
  pinyin: formatPinyin(sourcePinyin),
  sourceId: DICTIONARY_SOURCE_ID,
  sourcePinyin,
});

const ITEM_ENTRIES = [
  { char: '水', sourcePinyin: 'shui3', name: 'Water', sourceDefinition: 'water', emoji: '💧' },
  { char: '火', sourcePinyin: 'huo3', name: 'Fire', sourceDefinition: 'fire', emoji: '🔥' },
  { char: '风', sourcePinyin: 'feng1', name: 'Wind', sourceDefinition: 'wind', emoji: '🌬️' },
  { char: '土', sourcePinyin: 'tu3', name: 'Earth', sourceDefinition: 'earth; dust; clay', emoji: '🌍' },
  { char: '黏土', sourcePinyin: 'nian2 tu3', name: 'Clay', sourceDefinition: 'clay', emoji: '🟤' },
  { char: '蒸汽', sourcePinyin: 'zheng1 qi4', name: 'Steam', sourceDefinition: 'steam', emoji: '♨️' },
  { char: '波浪', sourcePinyin: 'bo1 lang4', name: 'Wave', sourceDefinition: 'wave', emoji: '🌊' },
  { char: '沙尘', sourcePinyin: 'sha1 chen2', name: 'Airborne Dust', sourceDefinition: 'airborne sand and dust', emoji: '🌫️' },
  { char: '熔岩', sourcePinyin: 'rong2 yan2', name: 'Lava', sourceDefinition: 'lava', emoji: '🌋' },
  { char: '河', sourcePinyin: 'he2', name: 'River', sourceDefinition: 'river', emoji: '🏞️' },
  { char: '砖', sourcePinyin: 'zhuan1', name: 'Brick', sourceDefinition: 'brick; tile', emoji: '🧱' },
  { char: '泥', sourcePinyin: 'ni2', name: 'Mud', sourceDefinition: 'mud; clay; paste; pulp', emoji: '🟫' },
  { char: '云', sourcePinyin: 'yun2', name: 'Cloud', sourceDefinition: 'cloud', emoji: '☁️' },
  { char: '雨', sourcePinyin: 'yu3', name: 'Rain', sourceDefinition: 'rain', emoji: '🌧️' },
  { char: '暴风雨', sourcePinyin: 'bao4 feng1 yu3', name: 'Rainstorm', sourceDefinition: 'rainstorm; storm; tempest', emoji: '⛈️' },
  { char: '岩石', sourcePinyin: 'yan2 shi2', name: 'Rock', sourceDefinition: 'rock', emoji: '🪨' },
  { char: '沙', sourcePinyin: 'sha1', name: 'Sand', sourceDefinition: 'sand; granule; powder', emoji: '🏜️' },
  { char: '玻璃', sourcePinyin: 'bo1 li5', name: 'Glass', sourceDefinition: 'glass', emoji: '🪟' },
  { char: '沙滩', sourcePinyin: 'sha1 tan1', name: 'Beach', sourceDefinition: 'beach; sandy shore', emoji: '🏖️' },
  { char: '海岸', sourcePinyin: 'hai3 an4', name: 'Coast', sourceDefinition: 'coastal; seacoast', emoji: '🌅' },
  { char: '河岸', sourcePinyin: 'he2 an4', name: 'Riverbank', sourceDefinition: 'riverside; river bank', emoji: '🌿' },
  { char: '海洋', sourcePinyin: 'hai3 yang2', name: 'Ocean', sourceDefinition: 'ocean', emoji: '🌊' },
  { char: '墙', sourcePinyin: 'qiang2', name: 'Wall', sourceDefinition: 'wall', emoji: '🧱' },
  { char: '窗', sourcePinyin: 'chuang1', name: 'Window', sourceDefinition: 'window', emoji: '🪟' },
  { char: '房子', sourcePinyin: 'fang2 zi5', name: 'House', sourceDefinition: 'house; building; apartment; room', emoji: '🏠' },
  { char: '壁炉', sourcePinyin: 'bi4 lu2', name: 'Fireplace', sourceDefinition: 'fireplace', emoji: '🔥' },
  { char: '村庄', sourcePinyin: 'cun1 zhuang1', name: 'Village', sourceDefinition: 'village; hamlet', emoji: '🏘️' },
  { char: '城市', sourcePinyin: 'cheng2 shi4', name: 'City', sourceDefinition: 'city; town', emoji: '🏙️' },
  { char: '港口', sourcePinyin: 'gang3 kou3', name: 'Port', sourceDefinition: 'port; harbor', emoji: '⚓' },
  { char: '船', sourcePinyin: 'chuan2', name: 'Boat', sourceDefinition: 'boat; vessel; ship', emoji: '⛵' },
  { char: '帆船', sourcePinyin: 'fan1 chuan2', name: 'Sailboat', sourceDefinition: 'sailboat', emoji: '⛵' },
  { char: '陶器', sourcePinyin: 'tao2 qi4', name: 'Pottery', sourceDefinition: 'pottery', emoji: '🏺' },
  { char: '天气', sourcePinyin: 'tian1 qi4', name: 'Weather', sourceDefinition: 'weather', emoji: '🌤️' },
  { char: '雨天', sourcePinyin: 'yu3 tian1', name: 'Rainy Day', sourceDefinition: 'rainy day; rainy weather', emoji: '🌧️' },
  { char: '家', sourcePinyin: 'jia1', name: 'Home', sourceDefinition: 'home; family', emoji: '🏡' },
  { char: '社区', sourcePinyin: 'she4 qu1', name: 'Community', sourceDefinition: 'community; neighborhood', emoji: '🏘️' },
  { char: '海', sourcePinyin: 'hai3', name: 'Sea', sourceDefinition: 'ocean; sea', emoji: '🌊' },
  { char: '海风', sourcePinyin: 'hai3 feng1', name: 'Sea Breeze', sourceDefinition: 'sea breeze', emoji: '🌬️' },
  { char: '海水', sourcePinyin: 'hai3 shui3', name: 'Seawater', sourceDefinition: 'seawater', emoji: '💧' },
];

export const ITEMS = Object.freeze(Object.fromEntries(
  ITEM_ENTRIES.map((item) => [item.char, defineItem(item)])
));

export const STARTER_ITEMS = Object.freeze(['水', '火', '风', '土']);

export const BASE_CHARS = Object.freeze(Object.fromEntries(
  STARTER_ITEMS.map((item) => [item, ITEMS[item]])
));

const canonicalIngredients = (first, second) => [first, second].sort((a, b) => a.localeCompare(b, 'zh-Hans-CN'));

export const makeRecipeKey = (first, second) => canonicalIngredients(first, second).join(RECIPE_SEPARATOR);
export const getRecipeIngredients = (key) => key.split(RECIPE_SEPARATOR);

const RECIPE_ENTRIES = [
  { ingredients: ['水', '土'], result: '黏土', category: 'First Reactions', factSourceId: 'usgs-clay', explanation: 'Water makes clay-rich earth sticky and workable.' },
  { ingredients: ['水', '火'], result: '蒸汽', category: 'First Reactions', factSourceId: 'noaa-clouds', explanation: 'Heat changes liquid water into water vapor.' },
  { ingredients: ['水', '风'], result: '波浪', category: 'First Reactions', factSourceId: 'noaa-waves', explanation: 'Wind transfers energy to surface water and creates waves.' },
  { ingredients: ['风', '土'], result: '沙尘', category: 'First Reactions', factSourceId: 'usgs-wind-erosion', explanation: 'Wind erosion lifts fine soil into airborne dust.' },
  { ingredients: ['火', '土'], result: '熔岩', category: 'First Reactions', factSourceId: 'usgs-rock-cycle', explanation: 'Enough heat melts rock; molten rock at the surface is lava.' },
  { ingredients: ['水', '水'], result: '河', category: 'First Reactions', explanation: 'Flowing water gathers into a larger body: a river.' },

  { ingredients: ['黏土', '火'], result: '砖', category: 'Earth & Materials', factSourceId: 'brick-manufacturing', explanation: 'Clay is shaped, dried, and fired into durable brick.' },
  { ingredients: ['黏土', '水'], result: '泥', category: 'Earth & Materials', factSourceId: 'usgs-clay', explanation: 'Adding water to clay-rich earth produces mud.' },
  { ingredients: ['蒸汽', '沙尘'], result: '云', category: 'Weather Cycle', factSourceId: 'noaa-clouds', explanation: 'Water vapor condenses on tiny dust particles to form cloud droplets.' },
  { ingredients: ['云', '水'], result: '雨', category: 'Weather Cycle', factSourceId: 'noaa-precipitation', explanation: 'Cloud droplets grow until they are heavy enough to fall as rain.' },
  { ingredients: ['雨', '风'], result: '暴风雨', category: 'Weather Cycle', factSourceId: 'noaa-precipitation', explanation: 'Strong wind and heavy rain come together in a rainstorm.' },
  { ingredients: ['云', '风'], result: '天气', category: 'Weather Cycle', factSourceId: 'noaa-clouds', explanation: 'Wind moves moisture and helps shape changing weather.' },
  { ingredients: ['天气', '雨'], result: '雨天', category: 'Weather Cycle', factSourceId: 'noaa-precipitation', explanation: 'Rain turns the day into rainy weather.' },

  { ingredients: ['熔岩', '水'], result: '岩石', category: 'Earth & Materials', factSourceId: 'usgs-lava-cooling', explanation: 'Water removes heat from lava, helping it solidify into rock.' },
  { ingredients: ['岩石', '风'], result: '沙', category: 'Earth & Materials', factSourceId: 'usgs-weathering', explanation: 'Wind and weathering break rock down into sediment such as sand.' },
  { ingredients: ['沙', '火'], result: '玻璃', category: 'Earth & Materials', factSourceId: 'corning-glass', explanation: 'Glass begins with sand melted at very high temperature.' },
  { ingredients: ['沙', '水'], result: '沙滩', category: 'Earth & Materials', factSourceId: 'usgs-weathering', explanation: 'Deposited sand and water meet at a beach.' },
  { ingredients: ['波浪', '沙滩'], result: '海岸', category: 'Earth & Materials', factSourceId: 'noaa-waves', explanation: 'Waves shape the boundary where land meets water: the coast.' },
  { ingredients: ['河', '土'], result: '河岸', category: 'Earth & Materials', explanation: 'Earth beside a river forms its bank.' },
  { ingredients: ['河', '河'], result: '海洋', category: 'Earth & Materials', explanation: 'Many rivers ultimately feed the ocean.' },
  { ingredients: ['泥', '火'], result: '陶器', category: 'Earth & Materials', factSourceId: 'usgs-clay', explanation: 'Clay-rich mud can be shaped and fired as pottery.' },

  { ingredients: ['砖', '砖'], result: '墙', category: 'Human World', explanation: 'Bricks are assembled into a wall.' },
  { ingredients: ['墙', '玻璃'], result: '窗', category: 'Human World', explanation: 'Glass set into a wall creates a window.' },
  { ingredients: ['墙', '窗'], result: '房子', category: 'Human World', explanation: 'Walls and windows form the shell of a house.' },
  { ingredients: ['砖', '火'], result: '壁炉', category: 'Human World', explanation: 'Brick safely contains a household fire in a fireplace.' },
  { ingredients: ['房子', '房子'], result: '村庄', category: 'Human World', explanation: 'A group of houses forms a village.' },
  { ingredients: ['村庄', '村庄'], result: '城市', category: 'Human World', explanation: 'As settlements grow together, they become a city.' },
  { ingredients: ['城市', '水'], result: '港口', category: 'Human World', explanation: 'A city connected to navigable water can form a port.' },
  { ingredients: ['港口', '水'], result: '船', category: 'Human World', explanation: 'A port and open water imply a boat.' },
  { ingredients: ['船', '风'], result: '帆船', category: 'Human World', explanation: 'Wind powers a sailboat through its sails.' },
  { ingredients: ['房子', '壁炉'], result: '家', category: 'Human World', explanation: 'A warm, lived-in house becomes a home.' },
  { ingredients: ['家', '家'], result: '社区', category: 'Human World', explanation: 'Homes together form a community.' },

  { ingredients: ['海岸', '海洋'], result: '海', category: 'Sea Connections', explanation: 'A coast borders a large body of seawater: the sea.' },
  { ingredients: ['海', '风'], result: '海风', category: 'Sea Connections', factSourceId: 'noaa-waves', explanation: 'Air moving from the sea is a sea breeze.' },
  { ingredients: ['海', '水'], result: '海水', category: 'Sea Connections', explanation: 'Water in the sea is seawater.' },
];

export const RECIPE_CATEGORIES = Object.freeze([
  'First Reactions',
  'Weather Cycle',
  'Earth & Materials',
  'Human World',
  'Sea Connections',
]);

export const RECIPES = Object.freeze(Object.fromEntries(
  RECIPE_ENTRIES.map((recipe) => {
    const result = ITEMS[recipe.result];
    if (!result) throw new Error(`Missing item data for recipe result: ${recipe.result}`);
    const completeRecipe = Object.freeze({ ...result, ...recipe });
    return [makeRecipeKey(...recipe.ingredients), completeRecipe];
  })
));

export const DISCOVERABLE_ITEMS = Object.freeze([
  ...new Set(Object.values(RECIPES).map(({ result }) => result)),
]);

export const getRecipe = (first, second) => RECIPES[makeRecipeKey(first, second)] ?? null;
export const getData = (text) => ITEMS[text] ?? Object.freeze({
  char: text,
  pinyin: '?',
  emoji: '✨',
  name: 'Unknown',
  sourceDefinition: 'Unknown',
});
