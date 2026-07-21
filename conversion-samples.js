const SIMPLIFIED_SAMPLE = "这个软件使用鼠标管理硬盘里的文件和网络数据，出租车司机正在录制视频。";
const TRADITIONAL_SAMPLE = "這個軟件使用鼠標管理硬盤裏的文件和網絡數據，出租車司機正在錄製視頻。";
const TAIWAN_SAMPLE = "這套軟體使用滑鼠管理硬碟裡的檔案與網路資料，計程車司機正在錄製影片。";
const HONG_KONG_SAMPLE = "這套軟件使用滑鼠管理硬碟裏的文件與網絡數據，的士司機正在錄製影片。";
const JAPANESE_SHINJITAI_SAMPLE =
  "日本語の新字体と旧字体を変換します。国、学、会、広、読、気、体、戦などの漢字表記を確認できます。";
const JAPANESE_KYUJITAI_SAMPLE =
  "日本語の新字體と舊字體を變換します。國、學、會、廣、讀、氣、體、戰などの漢字表記を確認できます。";

export const CONVERSION_SAMPLES = Object.freeze({
  s2t: SIMPLIFIED_SAMPLE,
  s2tw: SIMPLIFIED_SAMPLE,
  s2twp: SIMPLIFIED_SAMPLE,
  s2hk: SIMPLIFIED_SAMPLE,
  s2hkp: SIMPLIFIED_SAMPLE,
  t2s: TRADITIONAL_SAMPLE,
  t2tw: TRADITIONAL_SAMPLE,
  t2hk: TRADITIONAL_SAMPLE,
  tw2s: TAIWAN_SAMPLE,
  tw2sp: TAIWAN_SAMPLE,
  tw2t: TAIWAN_SAMPLE,
  hk2s: HONG_KONG_SAMPLE,
  hk2sp: HONG_KONG_SAMPLE,
  hk2t: HONG_KONG_SAMPLE,
  jp2t: JAPANESE_SHINJITAI_SAMPLE,
  t2jp: JAPANESE_KYUJITAI_SAMPLE
});

export function getConversionSample(config) {
  return CONVERSION_SAMPLES[config] || CONVERSION_SAMPLES.s2t;
}
