# Vocabulary Bibliography

DouJeen's vocabulary dataset uses the following source for every simplified
Chinese headword, Mandarin pinyin reading, and English definition shown in the
game and answer key.

1. MDBG. *CC-CEDICT Chinese-English Dictionary*. Release 2026-07-18 06:57 GMT.
   124,724 entries. <https://www.mdbg.net/chinese/dictionary?page=cc-cedict>
   Licensed under the [Creative Commons Attribution-ShareAlike 4.0
   International License](https://creativecommons.org/licenses/by-sa/4.0/).

## Dataset method

- Each `sourcePinyin` value in `src/app/data.js` is copied from the matching
  simplified-Chinese CC-CEDICT headword in the release above.
- Display pinyin is generated from `sourcePinyin`; it is not entered as a
  separate, manually guessed value.
- Each English label and definition selects the relevant sense from that same
  CC-CEDICT entry.
- Every recipe concatenates its two ordered ingredients exactly. For example,
  `火` + `山` produces the attested headword `火山`; reversing the order does
  not silently produce the same word.
- Multi-stage recipes require the attested shorter word first, such as `火山`
  + `口` producing `火山口`.

Vocabulary data adapted from CC-CEDICT remains available under CC BY-SA 4.0.
