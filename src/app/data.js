// Shared vocabulary data for the laboratory and answer key.
// Headwords, numbered Mandarin pinyin, and English glosses are transcribed from
// the CC-CEDICT release identified in BIBLIOGRAPHY. Display pinyin is generated
// from that numbered source value so tone marks cannot drift independently.

export const BIBLIOGRAPHY = Object.freeze([
  Object.freeze({
    id: 'cc-cedict-2026-07-18',
    citation: 'MDBG. CC-CEDICT Chinese-English Dictionary. Release 2026-07-18 06:57 GMT.',
    url: 'https://www.mdbg.net/chinese/dictionary?page=cc-cedict',
    license: 'Creative Commons Attribution-ShareAlike 4.0 International',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
    scope: 'Simplified Chinese headwords, standard Mandarin pinyin, and English definitions.',
  }),
]);

const SOURCE_ID = BIBLIOGRAPHY[0].id;
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
  const match = syllable.toLowerCase().replaceAll('u:', 'ü').match(/^([a-zü]+)([1-5])$/u);
  if (!match) return syllable.toLowerCase().replaceAll('u:', 'ü');

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

const defineEntry = ({ sourcePinyin, sourceDefinition, ...entry }) =>
  Object.freeze({
    ...entry,
    pinyin: formatPinyin(sourcePinyin),
    sourceId: SOURCE_ID,
    sourcePinyin,
    sourceDefinition,
  });

const BASE_ENTRIES = [
  { char: '火', sourcePinyin: 'huo3', name: 'Fire', sourceDefinition: 'fire', emoji: '🔥' },
  { char: '山', sourcePinyin: 'shan1', name: 'Mountain', sourceDefinition: 'mountain; hill', emoji: '⛰️' },
  { char: '口', sourcePinyin: 'kou3', name: 'Mouth', sourceDefinition: 'mouth', emoji: '👄' },
  { char: '灰', sourcePinyin: 'hui1', name: 'Ash', sourceDefinition: 'ash', emoji: '🌫️' },
  { char: '海', sourcePinyin: 'hai3', name: 'Sea', sourceDefinition: 'ocean; sea', emoji: '🌊' },
  { char: '水', sourcePinyin: 'shui3', name: 'Water', sourceDefinition: 'water', emoji: '💧' },
  { char: '边', sourcePinyin: 'bian1', name: 'Side', sourceDefinition: 'side; edge; margin; border; boundary', emoji: '↔️' },
  { char: '大', sourcePinyin: 'da4', name: 'Big', sourceDefinition: 'big; large; great', emoji: '🐘' },
  { char: '风', sourcePinyin: 'feng1', name: 'Wind', sourceDefinition: 'wind', emoji: '🌬️' },
  { char: '果', sourcePinyin: 'guo3', name: 'Fruit', sourceDefinition: 'fruit', emoji: '🍎' },
  { char: '气', sourcePinyin: 'qi4', name: 'Air', sourceDefinition: 'gas; air', emoji: '💨' },
  { char: '雨', sourcePinyin: 'yu3', name: 'Rain', sourceDefinition: 'rain', emoji: '🌧️' },
  { char: '小', sourcePinyin: 'xiao3', name: 'Small', sourceDefinition: 'small; tiny', emoji: '🐭' },
  { char: '天', sourcePinyin: 'tian1', name: 'Sky', sourceDefinition: 'day; sky; heaven', emoji: '🌤️' },
  { char: '空', sourcePinyin: 'kong1', name: 'Empty', sourceDefinition: 'empty; air; sky', emoji: '🫧' },
  { char: '白', sourcePinyin: 'bai2', name: 'White', sourceDefinition: 'white', emoji: '⚪' },
  { char: '云', sourcePinyin: 'yun2', name: 'Cloud', sourceDefinition: 'cloud', emoji: '☁️' },
  { char: '黑', sourcePinyin: 'hei1', name: 'Black', sourceDefinition: 'black; dark', emoji: '⚫' },
  { char: '夜', sourcePinyin: 'ye4', name: 'Night', sourceDefinition: 'night', emoji: '🌃' },
  { char: '月', sourcePinyin: 'yue4', name: 'Moon', sourceDefinition: 'moon; month', emoji: '🌙' },
  { char: '光', sourcePinyin: 'guang1', name: 'Light', sourceDefinition: 'light; ray', emoji: '✨' },
  { char: '日', sourcePinyin: 'ri4', name: 'Sun', sourceDefinition: 'sun; day', emoji: '☀️' },
  { char: '人', sourcePinyin: 'ren2', name: 'Person', sourceDefinition: 'person; people', emoji: '🧑' },
  { char: '家', sourcePinyin: 'jia1', name: 'Home', sourceDefinition: 'home; family', emoji: '🏠' },
  { char: '国', sourcePinyin: 'guo2', name: 'Country', sourceDefinition: 'country; nation; state', emoji: '🗺️' },
  { char: '中', sourcePinyin: 'zhong1', name: 'Middle', sourceDefinition: 'middle; center', emoji: '🎯' },
  { char: '学', sourcePinyin: 'xue2', name: 'Study', sourceDefinition: 'to learn; to study', emoji: '📖' },
  { char: '生', sourcePinyin: 'sheng1', name: 'Life', sourceDefinition: 'to live; life; student (bound form)', emoji: '🌱' },
  { char: '校', sourcePinyin: 'xiao4', name: 'School', sourceDefinition: 'school; college (bound form)', emoji: '🏫' },
  { char: '电', sourcePinyin: 'dian4', name: 'Electricity', sourceDefinition: 'electricity; electric', emoji: '⚡' },
  { char: '话', sourcePinyin: 'hua4', name: 'Speech', sourceDefinition: 'spoken words; speech; talk', emoji: '💬' },
  { char: '脑', sourcePinyin: 'nao3', name: 'Brain', sourceDefinition: 'brain; mind; head', emoji: '🧠' },
  { char: '影', sourcePinyin: 'ying3', name: 'Image', sourceDefinition: 'picture; image; film; movie', emoji: '🎞️' },
  { char: '视', sourcePinyin: 'shi4', name: 'View', sourceDefinition: 'to look at', emoji: '👀' },
  { char: '车', sourcePinyin: 'che1', name: 'Vehicle', sourceDefinition: 'car; vehicle', emoji: '🚗' },
  { char: '手', sourcePinyin: 'shou3', name: 'Hand', sourceDefinition: 'hand', emoji: '✋' },
  { char: '机', sourcePinyin: 'ji1', name: 'Machine', sourceDefinition: 'machine; mechanism (bound form)', emoji: '⚙️' },
  { char: '场', sourcePinyin: 'chang3', name: 'Place', sourceDefinition: 'large place used for a specific purpose', emoji: '📍' },
  { char: '飞', sourcePinyin: 'fei1', name: 'Fly', sourceDefinition: 'to fly', emoji: '🪽' },
  { char: '站', sourcePinyin: 'zhan4', name: 'Station', sourceDefinition: 'station', emoji: '🚉' },
];

export const BASE_CHARS = Object.freeze(Object.fromEntries(
  BASE_ENTRIES.map((entry) => [entry.char, defineEntry(entry)])
));

export const makeRecipeKey = (first, second) => `${first}${RECIPE_SEPARATOR}${second}`;
export const getRecipeIngredients = (key) => key.split(RECIPE_SEPARATOR);

const RECIPE_ENTRIES = [
  // Nature and weather
  { ingredients: ['火', '山'], result: '火山', sourcePinyin: 'huo3 shan1', name: 'Volcano', sourceDefinition: 'volcano', emoji: '🌋', category: 'Nature & Weather' },
  { ingredients: ['火山', '口'], result: '火山口', sourcePinyin: 'huo3 shan1 kou3', name: 'Volcanic Crater', sourceDefinition: 'volcanic crater', emoji: '🌋⭕', category: 'Nature & Weather' },
  { ingredients: ['火山', '灰'], result: '火山灰', sourcePinyin: 'huo3 shan1 hui1', name: 'Volcanic Ash', sourceDefinition: 'volcanic ash', emoji: '🌋🌫️', category: 'Nature & Weather' },
  { ingredients: ['海', '水'], result: '海水', sourcePinyin: 'hai3 shui3', name: 'Seawater', sourceDefinition: 'seawater', emoji: '🌊💧', category: 'Nature & Weather' },
  { ingredients: ['海', '边'], result: '海边', sourcePinyin: 'hai3 bian1', name: 'Seaside', sourceDefinition: 'coast; seaside; seashore; beach', emoji: '🏖️', category: 'Nature & Weather' },
  { ingredients: ['大', '海'], result: '大海', sourcePinyin: 'da4 hai3', name: 'Ocean', sourceDefinition: 'sea; ocean', emoji: '🌊🐋', category: 'Nature & Weather' },
  { ingredients: ['海', '风'], result: '海风', sourcePinyin: 'hai3 feng1', name: 'Sea Breeze', sourceDefinition: 'sea breeze', emoji: '🌊🌬️', category: 'Nature & Weather' },
  { ingredients: ['水', '果'], result: '水果', sourcePinyin: 'shui3 guo3', name: 'Fruit', sourceDefinition: 'fruit', emoji: '🍉', category: 'Nature & Weather' },
  { ingredients: ['水', '气'], result: '水气', sourcePinyin: 'shui3 qi4', name: 'Water Vapor', sourceDefinition: 'water vapor; steam', emoji: '♨️', category: 'Nature & Weather' },
  { ingredients: ['雨', '水'], result: '雨水', sourcePinyin: 'yu3 shui3', name: 'Rainwater', sourceDefinition: 'rainwater; rainfall; rain', emoji: '🌧️💧', category: 'Nature & Weather' },
  { ingredients: ['大', '雨'], result: '大雨', sourcePinyin: 'da4 yu3', name: 'Heavy Rain', sourceDefinition: 'heavy rain', emoji: '⛈️', category: 'Nature & Weather' },
  { ingredients: ['小', '雨'], result: '小雨', sourcePinyin: 'xiao3 yu3', name: 'Light Rain', sourceDefinition: 'light rain; drizzle', emoji: '🌦️', category: 'Nature & Weather' },
  { ingredients: ['风', '雨'], result: '风雨', sourcePinyin: 'feng1 yu3', name: 'Wind and Rain', sourceDefinition: 'wind and rain; the elements', emoji: '🌬️🌧️', category: 'Nature & Weather' },
  { ingredients: ['大', '风'], result: '大风', sourcePinyin: 'da4 feng1', name: 'Gale', sourceDefinition: 'gale', emoji: '💨🌳', category: 'Nature & Weather' },
  { ingredients: ['天', '气'], result: '天气', sourcePinyin: 'tian1 qi4', name: 'Weather', sourceDefinition: 'weather', emoji: '🌤️🌡️', category: 'Nature & Weather' },
  { ingredients: ['天', '空'], result: '天空', sourcePinyin: 'tian1 kong1', name: 'Sky', sourceDefinition: 'sky', emoji: '🌌', category: 'Nature & Weather' },
  { ingredients: ['空', '气'], result: '空气', sourcePinyin: 'kong1 qi4', name: 'Air', sourceDefinition: 'air; atmosphere', emoji: '🫧💨', category: 'Nature & Weather' },
  { ingredients: ['白', '云'], result: '白云', sourcePinyin: 'bai2 yun2', name: 'White Cloud', sourceDefinition: 'white cloud', emoji: '☁️🤍', category: 'Nature & Weather' },
  { ingredients: ['黑', '夜'], result: '黑夜', sourcePinyin: 'hei1 ye4', name: 'Night', sourceDefinition: 'night', emoji: '🌑', category: 'Nature & Weather' },
  { ingredients: ['月', '光'], result: '月光', sourcePinyin: 'yue4 guang1', name: 'Moonlight', sourceDefinition: 'moonlight', emoji: '🌙✨', category: 'Nature & Weather' },
  { ingredients: ['日', '光'], result: '日光', sourcePinyin: 'ri4 guang1', name: 'Sunlight', sourceDefinition: 'sunlight', emoji: '☀️✨', category: 'Nature & Weather' },

  // People and places
  { ingredients: ['人', '口'], result: '人口', sourcePinyin: 'ren2 kou3', name: 'Population', sourceDefinition: 'population; people', emoji: '👥', category: 'People & Places' },
  { ingredients: ['家', '人'], result: '家人', sourcePinyin: 'jia1 ren2', name: 'Family Member', sourceDefinition: 'family member', emoji: '👨‍👩‍👧‍👦', category: 'People & Places' },
  { ingredients: ['国', '家'], result: '国家', sourcePinyin: 'guo2 jia1', name: 'Country', sourceDefinition: 'country; nation; state', emoji: '🌐', category: 'People & Places' },
  { ingredients: ['中', '国'], result: '中国', sourcePinyin: 'Zhong1 guo2', name: 'China', sourceDefinition: 'China', emoji: '🇨🇳', category: 'People & Places' },
  { ingredients: ['中国', '人'], result: '中国人', sourcePinyin: 'Zhong1 guo2 ren2', name: 'Chinese Person', sourceDefinition: 'Chinese person', emoji: '🇨🇳🧑', category: 'People & Places' },

  // Learning
  { ingredients: ['学', '生'], result: '学生', sourcePinyin: 'xue2 sheng5', name: 'Student', sourceDefinition: 'student; schoolchild', emoji: '🧑‍🎓', category: 'Learning' },
  { ingredients: ['大', '学'], result: '大学', sourcePinyin: 'da4 xue2', name: 'University', sourceDefinition: 'university; college', emoji: '🎓', category: 'Learning' },
  { ingredients: ['大学', '生'], result: '大学生', sourcePinyin: 'da4 xue2 sheng1', name: 'University Student', sourceDefinition: 'university student; college student', emoji: '🎓🧑', category: 'Learning' },
  { ingredients: ['中', '学'], result: '中学', sourcePinyin: 'zhong1 xue2', name: 'Middle School', sourceDefinition: 'middle school', emoji: '🏫📘', category: 'Learning' },
  { ingredients: ['中学', '生'], result: '中学生', sourcePinyin: 'zhong1 xue2 sheng1', name: 'Middle-School Student', sourceDefinition: 'middle-school student; high school student', emoji: '📘🧑', category: 'Learning' },
  { ingredients: ['小', '学'], result: '小学', sourcePinyin: 'xiao3 xue2', name: 'Primary School', sourceDefinition: 'elementary school; primary school', emoji: '🏫✏️', category: 'Learning' },
  { ingredients: ['小学', '生'], result: '小学生', sourcePinyin: 'xiao3 xue2 sheng1', name: 'Primary-School Student', sourceDefinition: 'primary school student; schoolchild', emoji: '✏️🧑', category: 'Learning' },
  { ingredients: ['学', '校'], result: '学校', sourcePinyin: 'xue2 xiao4', name: 'School', sourceDefinition: 'school', emoji: '🏫', category: 'Learning' },

  // Technology and transport
  { ingredients: ['电', '话'], result: '电话', sourcePinyin: 'dian4 hua4', name: 'Telephone', sourceDefinition: 'telephone; phone call; phone number', emoji: '☎️', category: 'Technology & Transport' },
  { ingredients: ['电', '脑'], result: '电脑', sourcePinyin: 'dian4 nao3', name: 'Computer', sourceDefinition: 'computer', emoji: '💻', category: 'Technology & Transport' },
  { ingredients: ['电', '影'], result: '电影', sourcePinyin: 'dian4 ying3', name: 'Movie', sourceDefinition: 'movie; film', emoji: '🎬', category: 'Technology & Transport' },
  { ingredients: ['电', '视'], result: '电视', sourcePinyin: 'dian4 shi4', name: 'Television', sourceDefinition: 'television; TV', emoji: '📺', category: 'Technology & Transport' },
  { ingredients: ['电', '车'], result: '电车', sourcePinyin: 'dian4 che1', name: 'Electric Vehicle', sourceDefinition: 'tram; streetcar; trolleybus; electric car; e-bike', emoji: '🚋', category: 'Technology & Transport' },
  { ingredients: ['手', '机'], result: '手机', sourcePinyin: 'shou3 ji1', name: 'Mobile Phone', sourceDefinition: 'cell phone; mobile phone', emoji: '📱', category: 'Technology & Transport' },
  { ingredients: ['机', '场'], result: '机场', sourcePinyin: 'ji1 chang3', name: 'Airport', sourceDefinition: 'airport; airfield', emoji: '🛫', category: 'Technology & Transport' },
  { ingredients: ['飞', '机'], result: '飞机', sourcePinyin: 'fei1 ji1', name: 'Airplane', sourceDefinition: 'airplane', emoji: '✈️', category: 'Technology & Transport' },
  { ingredients: ['飞机', '场'], result: '飞机场', sourcePinyin: 'fei1 ji1 chang3', name: 'Airport', sourceDefinition: 'airport', emoji: '✈️🛬', category: 'Technology & Transport' },
  { ingredients: ['火', '车'], result: '火车', sourcePinyin: 'huo3 che1', name: 'Train', sourceDefinition: 'train', emoji: '🚂', category: 'Technology & Transport' },
  { ingredients: ['火车', '站'], result: '火车站', sourcePinyin: 'huo3 che1 zhan4', name: 'Train Station', sourceDefinition: 'train station', emoji: '🚂🚉', category: 'Technology & Transport' },
  { ingredients: ['车', '站'], result: '车站', sourcePinyin: 'che1 zhan4', name: 'Station', sourceDefinition: 'rail station; bus stop', emoji: '🚏', category: 'Technology & Transport' },
];

export const RECIPE_CATEGORIES = Object.freeze([
  'Nature & Weather',
  'People & Places',
  'Learning',
  'Technology & Transport',
]);

export const RECIPES = Object.freeze(Object.fromEntries(
  RECIPE_ENTRIES.map((entry) => {
    const recipe = defineEntry(entry);
    return [makeRecipeKey(...recipe.ingredients), recipe];
  })
));

export const getRecipe = (first, second) => RECIPES[makeRecipeKey(first, second)] ?? null;

export const getData = (text) => {
  if (BASE_CHARS[text]) return BASE_CHARS[text];
  const recipe = Object.values(RECIPES).find(({ result }) => result === text);
  if (recipe) return { char: recipe.result, ...recipe };
  return { char: text, pinyin: '?', emoji: '✨', name: 'Unknown' };
};
