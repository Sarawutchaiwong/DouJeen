// Shared progression data for the Chinese discovery game.
// Chinese headwords, pinyin, and English glosses come from the CC-CEDICT
// release cited below. Physical-process notes cite their own factual sources.

import ITEM_ENTRIES from './items.json';
import RECIPE_ENTRIES from './recipes.json';

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
    id: 'hsk-vocabulary',
    citation: 'Chinese Testing International. New HSK Levels 1–4 Vocabulary List.',
    url: 'https://www.chinesetest.cn/userfiles/file/cihui.pdf',
    scope: 'Pedagogical priority and HSK 1–2 labels for essential beginner vocabulary.',
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
    id: 'usgs-mountains',
    citation: 'U.S. Geological Survey. Geology of Rocky Mountain National Park.',
    url: 'https://www.usgs.gov/geology-and-ecology-of-national-parks/geology-rocky-mountain-national-park',
    scope: 'Rock, sediment, uplift, erosion, and mountain formation.',
  }),
  Object.freeze({
    id: 'nasa-sun',
    citation: 'NASA. Studying the Sun.',
    url: 'https://www.nasa.gov/science-research/heliophysics/studying-the-sun/',
    scope: 'How solar light and energy drive Earth’s seasons, weather, climate, and ocean currents.',
  }),
  Object.freeze({
    id: 'noaa-tides',
    citation: 'NOAA NESDIS. What Causes Tides?',
    url: 'https://www.nesdis.noaa.gov/about/k-12-education/oceans-coasts/what-causes-tides',
    scope: 'The relationship between the Moon, Sun, and Earth’s oceans.',
  }),
  Object.freeze({
    id: 'noaa-lightning',
    citation: 'National Oceanic and Atmospheric Administration. How Lightning is Created.',
    url: 'https://prod-01-alb-www-noaa.woc.noaa.gov/jetstream/lightning/how-lightning-is-created',
    scope: 'Lightning development in storm clouds and the sound of thunder.',
  }),
  Object.freeze({
    id: 'noaa-precipitation-forms',
    citation: 'NOAA NESDIS. What Is Precipitation?',
    url: 'https://www.nesdis.noaa.gov/about/k-12-education/atmosphere/what-precipitation',
    scope: 'How air temperature determines rain, snow, hail, and other precipitation.',
  }),
  Object.freeze({
    id: 'usda-plant-growth',
    citation: 'USDA Natural Resources Conservation Service. Your Food and You.',
    url: 'https://www.nrcs.usda.gov/sites/default/files/2024-03/Montana-Your-Food-and-You.pdf',
    scope: 'How plants use healthy soil, water, and sunlight to grow food.',
  }),
  Object.freeze({
    id: 'epa-papermaking',
    citation: 'U.S. Environmental Protection Agency. Paper Making and Recycling.',
    url: 'https://archive.epa.gov/wastes/conserve/materials/paper/web/html/papermaking.html',
    scope: 'Wood fiber, water, pulp, and the process used to make paper.',
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


export const RECIPE_CATEGORIES = Object.freeze([
  'First Reactions',
  'Weather Cycle',
  'Earth & Materials',
  'Human World',
  'Sea Connections',
  'Living World',
  'Food & Daily Life',
  'People & Learning',
  'Home & Places',
  'Travel & Technology',
  'Time & Routine',
  'Nature & Plants',
  'Animals',
  'Body & Senses',
  'Feelings',
  'Colors',
  'Sky & Space',
  'Food & Cooking',
  'City & Market',
  'Culture & Arts',
]);

export const RECIPES = Object.freeze(Object.fromEntries(
  RECIPE_ENTRIES.map((recipe) => {
    const result = ITEMS[recipe.result];
    if (!result) throw new Error(`Missing item data for recipe result: ${recipe.result}`);
    const completeRecipe = Object.freeze({
      ...result,
      ...recipe,
      factSourceId: recipe.factSourceId ?? DICTIONARY_SOURCE_ID,
    });
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
