# Japanese Kanji data notice

`index.json` is derived from KANJIDIC2 and KRADFILE, copyright James William
Breen and the Electronic Dictionary Research and Development Group (EDRDG).
The source and derived data are available under Creative Commons
Attribution-ShareAlike 4.0.

- KANJIDIC2: https://www.edrdg.org/kanjidic/kanjd2index_legacy.html
- KRADFILE: https://www.edrdg.org/krad/kradinf.html
- Licence: https://www.edrdg.org/edrdg/licence.html

The EDRDG licence requires regularly updated dictionary data. Refresh the
source files and regenerate `index.json` at least monthly:

```sh
python3 scripts/generate-japanese-kanji-data.py \
  /path/to/kanjidic2.xml.gz /path/to/kradfile.gz
```
