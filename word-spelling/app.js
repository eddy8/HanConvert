const WORD_BANKS_URL = "words/word-banks.json";
const WORD_BANKS_ASSET_VERSION = "20260609-1";

const GRADE_LABELS = {
  p1: "小学一年级",
  p2: "小学二年级",
  p3: "小学三年级",
  p4: "小学四年级",
  p5: "小学五年级",
  p6: "小学六年级",
  j1: "初中一年级",
  j2: "初中二年级",
  j3: "初中三年级",
};

const WORD_MEANINGS = {
  ability: "能力",
  accident: "事故；意外",
  achieve: "实现；达到",
  achievement: "成就",
  active: "积极的；活跃的",
  advantage: "优势；优点",
  advice: "建议",
  afternoon: "下午",
  agree: "同意",
  alone: "独自的；单独地",
  angry: "生气的",
  animal: "动物",
  answer: "答案；回答",
  ant: "蚂蚁",
  apple: "苹果",
  arrive: "到达",
  art: "美术；艺术",
  article: "文章",
  artist: "艺术家",
  attention: "注意；关注",
  autumn: "秋天",
  bag: "包",
  balance: "平衡",
  banana: "香蕉",
  basketball: "篮球",
  beautiful: "美丽的",
  big: "大的",
  bike: "自行车",
  bird: "鸟",
  black: "黑色；黑色的",
  blue: "蓝色；蓝色的",
  book: "书",
  borrow: "借入",
  boy: "男孩",
  bread: "面包",
  breakfast: "早餐",
  bright: "明亮的；聪明的",
  brother: "兄弟",
  bus: "公共汽车",
  cake: "蛋糕",
  camera: "照相机",
  capital: "首都；大写字母",
  car: "汽车",
  careful: "小心的；仔细的",
  cat: "猫",
  center: "中心",
  chair: "椅子",
  challenge: "挑战",
  chicken: "鸡；鸡肉",
  chinese: "中文；中国人的",
  cinema: "电影院",
  city: "城市",
  class: "班级；课",
  clever: "聪明的",
  close: "关闭；接近的",
  cloudy: "多云的",
  cold: "冷的；寒冷",
  communicate: "交流；沟通",
  community: "社区",
  compare: "比较",
  competition: "比赛；竞争",
  complete: "完成；完整的",
  computer: "电脑",
  condition: "条件；状况",
  confidence: "信心",
  connect: "连接",
  consider: "考虑",
  cool: "凉爽的；酷的",
  country: "国家；乡村",
  creative: "有创造力的",
  culture: "文化",
  dad: "爸爸",
  daily: "每日的；日常的",
  dance: "跳舞",
  danger: "危险",
  decision: "决定",
  delicious: "美味的",
  describe: "描述",
  desk: "书桌",
  develop: "发展",
  diary: "日记",
  different: "不同的",
  dinner: "晚餐",
  direction: "方向",
  discovery: "发现",
  discussion: "讨论",
  doctor: "医生",
  dog: "狗",
  door: "门",
  draw: "画画",
  dream: "梦想；做梦",
  duck: "鸭子",
  ear: "耳朵",
  earth: "地球；土地",
  education: "教育",
  egg: "鸡蛋",
  eight: "八",
  either: "也；两者之一",
  email: "电子邮件",
  encourage: "鼓励",
  energy: "能量；精力",
  engineer: "工程师",
  english: "英语；英国的",
  enough: "足够的",
  environment: "环境",
  eraser: "橡皮",
  evening: "晚上",
  examination: "考试",
  example: "例子",
  excellent: "优秀的",
  exercise: "锻炼；练习",
  experience: "经验；经历",
  explain: "解释",
  expression: "表达；表情",
  eye: "眼睛",
  face: "脸",
  family: "家庭",
  famous: "著名的",
  farmer: "农民",
  favorite: "最喜欢的",
  festival: "节日",
  fever: "发烧",
  fish: "鱼",
  foot: "脚",
  football: "足球",
  foreign: "外国的",
  forest: "森林",
  friend: "朋友",
  fruit: "水果",
  future: "未来",
  general: "普通的；总的",
  girl: "女孩",
  government: "政府",
  grammar: "语法",
  grandma: "奶奶；外婆",
  grandpa: "爷爷；外公",
  green: "绿色；绿色的",
  habit: "习惯",
  hand: "手",
  happy: "高兴的",
  healthy: "健康的",
  history: "历史",
  holiday: "假日",
  homework: "家庭作业",
  horse: "马",
  hospital: "医院",
  hot: "热的",
  hotel: "旅馆",
  hungry: "饥饿的",
  imagination: "想象力",
  important: "重要的",
  improve: "提高；改善",
  independent: "独立的",
  influence: "影响",
  information: "信息",
  instead: "代替；反而",
  interesting: "有趣的",
  international: "国际的",
  internet: "互联网",
  interview: "采访；面试",
  introduce: "介绍",
  journey: "旅行；旅程",
  juice: "果汁",
  jump: "跳",
  keyboard: "键盘",
  knowledge: "知识",
  language: "语言",
  lesson: "课；教训",
  library: "图书馆",
  lion: "狮子",
  literature: "文学",
  long: "长的",
  look: "看",
  lunch: "午餐",
  magazine: "杂志",
  manager: "经理",
  market: "市场",
  math: "数学",
  medicine: "药；医学",
  menu: "菜单",
  message: "信息；消息",
  milk: "牛奶",
  mom: "妈妈",
  monkey: "猴子",
  moon: "月亮",
  morning: "早晨",
  motivation: "动力；积极性",
  mountain: "山",
  museum: "博物馆",
  music: "音乐",
  natural: "自然的",
  nature: "自然",
  necessary: "必要的",
  night: "夜晚",
  nine: "九",
  noodle: "面条",
  nose: "鼻子",
  ocean: "海洋",
  open: "打开；开放的",
  opinion: "意见；观点",
  opportunity: "机会",
  orange: "橙子；橙色",
  paint: "画；涂",
  panda: "熊猫",
  paragraph: "段落",
  park: "公园",
  patient: "病人；有耐心的",
  pen: "钢笔",
  pencil: "铅笔",
  performance: "表演；表现",
  personality: "个性；性格",
  phone: "电话",
  picture: "图片；照片",
  pilot: "飞行员",
  plane: "飞机",
  planet: "行星",
  polite: "有礼貌的",
  pollution: "污染",
  population: "人口",
  possible: "可能的",
  practice: "练习",
  prepare: "准备",
  problem: "问题",
  pronounce: "发音",
  protect: "保护",
  purple: "紫色；紫色的",
  purpose: "目的",
  question: "问题",
  quiet: "安静的",
  rabbit: "兔子",
  rainy: "下雨的",
  read: "读",
  recent: "最近的",
  recycle: "回收利用",
  red: "红色；红色的",
  research: "研究",
  responsible: "负责的",
  restaurant: "餐馆",
  review: "复习；评论",
  rice: "米饭；大米",
  river: "河流",
  rocket: "火箭",
  room: "房间",
  ruler: "尺子",
  run: "跑",
  sad: "伤心的",
  safety: "安全",
  school: "学校",
  science: "科学",
  scientific: "科学的",
  scientist: "科学家",
  screen: "屏幕",
  season: "季节",
  seven: "七",
  sheep: "羊",
  ship: "船",
  short: "短的；矮的",
  simple: "简单的",
  sing: "唱歌",
  sister: "姐妹",
  small: "小的",
  snowy: "下雪的",
  solution: "解决办法",
  space: "太空；空间",
  special: "特别的",
  sport: "运动",
  spring: "春天",
  star: "星星",
  station: "车站",
  story: "故事",
  street: "街道",
  strong: "强壮的",
  student: "学生",
  subject: "科目；主题",
  suggest: "建议",
  summer: "夏天",
  sun: "太阳",
  sunny: "晴朗的",
  swim: "游泳",
  table: "桌子",
  teacher: "老师",
  technology: "技术",
  ten: "十",
  thirsty: "口渴的",
  ticket: "票",
  tiger: "老虎",
  today: "今天",
  tomorrow: "明天",
  toothache: "牙痛",
  traditional: "传统的",
  train: "火车；训练",
  translate: "翻译",
  travel: "旅行",
  university: "大学",
  valuable: "有价值的",
  vegetable: "蔬菜",
  volunteer: "志愿者",
  warm: "温暖的",
  water: "水",
  weak: "虚弱的",
  weather: "天气",
  white: "白色；白色的",
  window: "窗户",
  windy: "有风的",
  winter: "冬天",
  wonderful: "精彩的；极好的",
  worker: "工人",
  write: "写",
  writer: "作家",
  yellow: "黄色；黄色的",
  yesterday: "昨天",
};

const WORD_BANKS = {
  p1: [
    ["cat", "/kæt/"],
    ["dog", "/dɔːɡ/"],
    ["bag", "/bæɡ/"],
    ["pen", "/pen/"],
    ["book", "/bʊk/"],
    ["desk", "/desk/"],
    ["red", "/red/"],
    ["blue", "/bluː/"],
    ["green", "/ɡriːn/"],
    ["yellow", "/ˈjeləʊ/"],
    ["apple", "/ˈæpl/"],
    ["banana", "/bəˈnɑːnə/"],
    ["milk", "/mɪlk/"],
    ["cake", "/keɪk/"],
    ["egg", "/eɡ/"],
    ["fish", "/fɪʃ/"],
    ["bird", "/bɜːrd/"],
    ["ant", "/ænt/"],
    ["sun", "/sʌn/"],
    ["moon", "/muːn/"],
    ["star", "/stɑːr/"],
    ["hand", "/hænd/"],
    ["foot", "/fʊt/"],
    ["eye", "/aɪ/"],
    ["ear", "/ɪr/"],
    ["nose", "/noʊz/"],
    ["face", "/feɪs/"],
    ["boy", "/bɔɪ/"],
    ["girl", "/ɡɜːrl/"],
    ["mom", "/mɑːm/"],
    ["dad", "/dæd/"],
    ["run", "/rʌn/"],
    ["jump", "/dʒʌmp/"],
    ["sing", "/sɪŋ/"],
    ["look", "/lʊk/"],
  ],
  p2: [
    ["class", "/klæs/"],
    ["school", "/skuːl/"],
    ["teacher", "/ˈtiːtʃər/"],
    ["student", "/ˈstuːdnt/"],
    ["pencil", "/ˈpensl/"],
    ["ruler", "/ˈruːlər/"],
    ["eraser", "/ɪˈreɪsər/"],
    ["chair", "/tʃer/"],
    ["table", "/ˈteɪbl/"],
    ["window", "/ˈwɪndoʊ/"],
    ["door", "/dɔːr/"],
    ["room", "/ruːm/"],
    ["family", "/ˈfæməli/"],
    ["brother", "/ˈbrʌðər/"],
    ["sister", "/ˈsɪstər/"],
    ["grandma", "/ˈɡrænmɑː/"],
    ["grandpa", "/ˈɡrænpɑː/"],
    ["friend", "/frend/"],
    ["happy", "/ˈhæpi/"],
    ["sad", "/sæd/"],
    ["angry", "/ˈæŋɡri/"],
    ["hungry", "/ˈhʌŋɡri/"],
    ["thirsty", "/ˈθɜːrsti/"],
    ["small", "/smɔːl/"],
    ["big", "/bɪɡ/"],
    ["long", "/lɔːŋ/"],
    ["short", "/ʃɔːrt/"],
    ["white", "/waɪt/"],
    ["black", "/blæk/"],
    ["orange", "/ˈɔːrɪndʒ/"],
    ["purple", "/ˈpɜːrpl/"],
    ["seven", "/ˈsevn/"],
    ["eight", "/eɪt/"],
    ["nine", "/naɪn/"],
    ["ten", "/ten/"],
  ],
  p3: [
    ["animal", "/ˈænɪml/"],
    ["tiger", "/ˈtaɪɡər/"],
    ["lion", "/ˈlaɪən/"],
    ["monkey", "/ˈmʌŋki/"],
    ["rabbit", "/ˈræbɪt/"],
    ["panda", "/ˈpændə/"],
    ["horse", "/hɔːrs/"],
    ["sheep", "/ʃiːp/"],
    ["duck", "/dʌk/"],
    ["chicken", "/ˈtʃɪkɪn/"],
    ["water", "/ˈwɔːtər/"],
    ["juice", "/dʒuːs/"],
    ["bread", "/bred/"],
    ["rice", "/raɪs/"],
    ["noodle", "/ˈnuːdl/"],
    ["fruit", "/fruːt/"],
    ["vegetable", "/ˈvedʒtəbl/"],
    ["car", "/kɑːr/"],
    ["bus", "/bʌs/"],
    ["bike", "/baɪk/"],
    ["train", "/treɪn/"],
    ["plane", "/pleɪn/"],
    ["ship", "/ʃɪp/"],
    ["morning", "/ˈmɔːrnɪŋ/"],
    ["afternoon", "/ˌæftərˈnuːn/"],
    ["evening", "/ˈiːvnɪŋ/"],
    ["night", "/naɪt/"],
    ["today", "/təˈdeɪ/"],
    ["tomorrow", "/təˈmɔːroʊ/"],
    ["yesterday", "/ˈjestərdeɪ/"],
    ["open", "/ˈoʊpən/"],
    ["close", "/kloʊz/"],
    ["write", "/raɪt/"],
    ["read", "/riːd/"],
    ["draw", "/drɔː/"],
  ],
  p4: [
    ["weather", "/ˈweðər/"],
    ["sunny", "/ˈsʌni/"],
    ["cloudy", "/ˈklaʊdi/"],
    ["windy", "/ˈwɪndi/"],
    ["rainy", "/ˈreɪni/"],
    ["snowy", "/ˈsnoʊi/"],
    ["season", "/ˈsiːzn/"],
    ["spring", "/sprɪŋ/"],
    ["summer", "/ˈsʌmər/"],
    ["autumn", "/ˈɔːtəm/"],
    ["winter", "/ˈwɪntər/"],
    ["warm", "/wɔːrm/"],
    ["cool", "/kuːl/"],
    ["cold", "/koʊld/"],
    ["hot", "/hɑːt/"],
    ["city", "/ˈsɪti/"],
    ["country", "/ˈkʌntri/"],
    ["street", "/striːt/"],
    ["market", "/ˈmɑːrkɪt/"],
    ["hospital", "/ˈhɑːspɪtl/"],
    ["station", "/ˈsteɪʃn/"],
    ["library", "/ˈlaɪbreri/"],
    ["museum", "/mjuˈziːəm/"],
    ["park", "/pɑːrk/"],
    ["cinema", "/ˈsɪnəmə/"],
    ["music", "/ˈmjuːzɪk/"],
    ["sport", "/spɔːrt/"],
    ["football", "/ˈfʊtbɔːl/"],
    ["basketball", "/ˈbæskɪtbɔːl/"],
    ["swim", "/swɪm/"],
    ["dance", "/dæns/"],
    ["paint", "/peɪnt/"],
    ["quiet", "/ˈkwaɪət/"],
    ["careful", "/ˈkerfl/"],
    ["clever", "/ˈklevər/"],
  ],
  p5: [
    ["subject", "/ˈsʌbdʒɪkt/"],
    ["science", "/ˈsaɪəns/"],
    ["history", "/ˈhɪstri/"],
    ["math", "/mæθ/"],
    ["English", "/ˈɪŋɡlɪʃ/"],
    ["Chinese", "/ˌtʃaɪˈniːz/"],
    ["art", "/ɑːrt/"],
    ["lesson", "/ˈlesn/"],
    ["homework", "/ˈhoʊmwɜːrk/"],
    ["question", "/ˈkwestʃən/"],
    ["answer", "/ˈænsər/"],
    ["practice", "/ˈpræktɪs/"],
    ["story", "/ˈstɔːri/"],
    ["picture", "/ˈpɪktʃər/"],
    ["holiday", "/ˈhɑːlədeɪ/"],
    ["travel", "/ˈtrævl/"],
    ["ticket", "/ˈtɪkɪt/"],
    ["hotel", "/hoʊˈtel/"],
    ["restaurant", "/ˈrestrɑːnt/"],
    ["menu", "/ˈmenjuː/"],
    ["breakfast", "/ˈbrekfəst/"],
    ["lunch", "/lʌntʃ/"],
    ["dinner", "/ˈdɪnər/"],
    ["delicious", "/dɪˈlɪʃəs/"],
    ["healthy", "/ˈhelθi/"],
    ["exercise", "/ˈeksərsaɪz/"],
    ["doctor", "/ˈdɑːktər/"],
    ["medicine", "/ˈmedɪsn/"],
    ["fever", "/ˈfiːvər/"],
    ["toothache", "/ˈtuːθeɪk/"],
    ["strong", "/strɔːŋ/"],
    ["weak", "/wiːk/"],
    ["famous", "/ˈfeɪməs/"],
    ["beautiful", "/ˈbjuːtɪfl/"],
    ["different", "/ˈdɪfrənt/"],
  ],
  p6: [
    ["future", "/ˈfjuːtʃər/"],
    ["dream", "/driːm/"],
    ["pilot", "/ˈpaɪlət/"],
    ["engineer", "/ˌendʒɪˈnɪr/"],
    ["scientist", "/ˈsaɪəntɪst/"],
    ["artist", "/ˈɑːrtɪst/"],
    ["writer", "/ˈraɪtər/"],
    ["farmer", "/ˈfɑːrmər/"],
    ["worker", "/ˈwɜːrkər/"],
    ["manager", "/ˈmænɪdʒər/"],
    ["computer", "/kəmˈpjuːtər/"],
    ["internet", "/ˈɪntərnet/"],
    ["message", "/ˈmesɪdʒ/"],
    ["email", "/ˈiːmeɪl/"],
    ["phone", "/foʊn/"],
    ["camera", "/ˈkæmərə/"],
    ["keyboard", "/ˈkiːbɔːrd/"],
    ["screen", "/skriːn/"],
    ["planet", "/ˈplænɪt/"],
    ["earth", "/ɜːrθ/"],
    ["space", "/speɪs/"],
    ["rocket", "/ˈrɑːkɪt/"],
    ["energy", "/ˈenərdʒi/"],
    ["nature", "/ˈneɪtʃər/"],
    ["forest", "/ˈfɔːrɪst/"],
    ["river", "/ˈrɪvər/"],
    ["mountain", "/ˈmaʊntn/"],
    ["ocean", "/ˈoʊʃn/"],
    ["protect", "/prəˈtekt/"],
    ["recycle", "/ˌriːˈsaɪkl/"],
    ["danger", "/ˈdeɪndʒər/"],
    ["safety", "/ˈseɪfti/"],
    ["important", "/ɪmˈpɔːrtnt/"],
    ["possible", "/ˈpɑːsəbl/"],
    ["interesting", "/ˈɪntrəstɪŋ/"],
  ],
  j1: [
    ["ability", "/əˈbɪləti/"],
    ["active", "/ˈæktɪv/"],
    ["advice", "/ədˈvaɪs/"],
    ["agree", "/əˈɡriː/"],
    ["alone", "/əˈloʊn/"],
    ["arrive", "/əˈraɪv/"],
    ["borrow", "/ˈbɑːroʊ/"],
    ["bright", "/braɪt/"],
    ["capital", "/ˈkæpɪtl/"],
    ["center", "/ˈsentər/"],
    ["culture", "/ˈkʌltʃər/"],
    ["daily", "/ˈdeɪli/"],
    ["describe", "/dɪˈskraɪb/"],
    ["diary", "/ˈdaɪəri/"],
    ["either", "/ˈiːðər/"],
    ["enough", "/ɪˈnʌf/"],
    ["example", "/ɪɡˈzæmpl/"],
    ["festival", "/ˈfestɪvl/"],
    ["foreign", "/ˈfɔːrən/"],
    ["grammar", "/ˈɡræmər/"],
    ["habit", "/ˈhæbɪt/"],
    ["improve", "/ɪmˈpruːv/"],
    ["instead", "/ɪnˈsted/"],
    ["journey", "/ˈdʒɜːrni/"],
    ["language", "/ˈlæŋɡwɪdʒ/"],
    ["magazine", "/ˈmæɡəziːn/"],
    ["natural", "/ˈnætʃrəl/"],
    ["opinion", "/əˈpɪnjən/"],
    ["patient", "/ˈpeɪʃnt/"],
    ["polite", "/pəˈlaɪt/"],
    ["recent", "/ˈriːsnt/"],
    ["review", "/rɪˈvjuː/"],
    ["simple", "/ˈsɪmpl/"],
    ["special", "/ˈspeʃl/"],
    ["valuable", "/ˈvæljuəbl/"],
  ],
  j2: [
    ["accident", "/ˈæksɪdənt/"],
    ["achieve", "/əˈtʃiːv/"],
    ["advantage", "/ədˈvæntɪdʒ/"],
    ["article", "/ˈɑːrtɪkl/"],
    ["attention", "/əˈtenʃn/"],
    ["balance", "/ˈbæləns/"],
    ["community", "/kəˈmjuːnəti/"],
    ["compare", "/kəmˈper/"],
    ["complete", "/kəmˈpliːt/"],
    ["condition", "/kənˈdɪʃn/"],
    ["connect", "/kəˈnekt/"],
    ["decision", "/dɪˈsɪʒn/"],
    ["develop", "/dɪˈveləp/"],
    ["education", "/ˌedʒuˈkeɪʃn/"],
    ["environment", "/ɪnˈvaɪrənmənt/"],
    ["excellent", "/ˈeksələnt/"],
    ["experience", "/ɪkˈspɪriəns/"],
    ["explain", "/ɪkˈspleɪn/"],
    ["favorite", "/ˈfeɪvərɪt/"],
    ["general", "/ˈdʒenrəl/"],
    ["introduce", "/ˌɪntrəˈduːs/"],
    ["knowledge", "/ˈnɑːlɪdʒ/"],
    ["medicine", "/ˈmedɪsn/"],
    ["necessary", "/ˈnesəseri/"],
    ["paragraph", "/ˈpærəɡræf/"],
    ["pollution", "/pəˈluːʃn/"],
    ["population", "/ˌpɑːpjuˈleɪʃn/"],
    ["prepare", "/prɪˈper/"],
    ["problem", "/ˈprɑːbləm/"],
    ["pronounce", "/prəˈnaʊns/"],
    ["purpose", "/ˈpɜːrpəs/"],
    ["research", "/rɪˈsɜːrtʃ/"],
    ["solution", "/səˈluːʃn/"],
    ["suggest", "/səɡˈdʒest/"],
    ["valuable", "/ˈvæljuəbl/"],
  ],
  j3: [
    ["achievement", "/əˈtʃiːvmənt/"],
    ["challenge", "/ˈtʃælɪndʒ/"],
    ["communicate", "/kəˈmjuːnɪkeɪt/"],
    ["confidence", "/ˈkɑːnfɪdəns/"],
    ["consider", "/kənˈsɪdər/"],
    ["creative", "/kriˈeɪtɪv/"],
    ["discovery", "/dɪˈskʌvəri/"],
    ["encourage", "/ɪnˈkɜːrɪdʒ/"],
    ["energy", "/ˈenərdʒi/"],
    ["examination", "/ɪɡˌzæmɪˈneɪʃn/"],
    ["expression", "/ɪkˈspreʃn/"],
    ["government", "/ˈɡʌvərnmənt/"],
    ["imagination", "/ɪˌmædʒɪˈneɪʃn/"],
    ["independent", "/ˌɪndɪˈpendənt/"],
    ["information", "/ˌɪnfərˈmeɪʃn/"],
    ["influence", "/ˈɪnfluəns/"],
    ["international", "/ˌɪntərˈnæʃnəl/"],
    ["interview", "/ˈɪntərvjuː/"],
    ["knowledge", "/ˈnɑːlɪdʒ/"],
    ["literature", "/ˈlɪtrətʃər/"],
    ["motivation", "/ˌmoʊtɪˈveɪʃn/"],
    ["opportunity", "/ˌɑːpərˈtuːnəti/"],
    ["performance", "/pərˈfɔːrməns/"],
    ["personality", "/ˌpɜːrsəˈnæləti/"],
    ["responsible", "/rɪˈspɑːnsəbl/"],
    ["scientific", "/ˌsaɪənˈtɪfɪk/"],
    ["technology", "/tekˈnɑːlədʒi/"],
    ["traditional", "/trəˈdɪʃənl/"],
    ["translate", "/trænzˈleɪt/"],
    ["university", "/ˌjuːnɪˈvɜːrsəti/"],
    ["volunteer", "/ˌvɑːlənˈtɪr/"],
    ["wonderful", "/ˈwʌndərfl/"],
    ["direction", "/dəˈrekʃn/"],
    ["discussion", "/dɪˈskʌʃn/"],
    ["competition", "/ˌkɑːmpəˈtɪʃn/"],
  ],
};

const ROUND_SIZE = 30;
const OXFORD_AUDIO_BASE_URL = "https://ssl.gstatic.com/dictionary/static/sounds/oxford/";
const YOUDAO_AUDIO_BASE_URL = "https://dict.youdao.com/dictvoice";
const LOCAL_LETTER_AUDIO_BASE_PATH = "audio/";
const LETTER_AUDIO_KEYS = "abcdefghijklmnopqrstuvwxyz".split("");
const CORRECT_ADVANCE_DELAY_MS = 2200;

let activeAudio = null;
let activeAudioCleanup = null;
let playbackToken = 0;
let feedbackAudioContext = null;
let suppressAutoFocusUntil = 0;
const letterAudioCache = new Map();

const state = {
  grade: "p1",
  round: [],
  roundId: 0,
  index: 0,
  letters: [],
  results: [],
  wordAudioSource: "oxford",
  showWord: true,
  showMeaning: true,
  autoReadWord: true,
  uiFeedbackSound: true,
  lastAutoReadKey: "",
  wordBanks: {},
  wordBankLabels: {},
};

const els = {
  gradeSelect: document.querySelector("#grade-select"),
  wordAudioSourceSelect: document.querySelector("#word-audio-source-select"),
  showWordToggle: document.querySelector("#show-word-toggle"),
  showMeaningToggle: document.querySelector("#show-meaning-toggle"),
  autoReadToggle: document.querySelector("#auto-read-toggle"),
  uiFeedbackToggle: document.querySelector("#ui-feedback-toggle"),
  newRoundButton: document.querySelector("#new-round-button"),
  gradeName: document.querySelector("#grade-name"),
  currentIndex: document.querySelector("#current-index"),
  roundTotal: document.querySelector("#round-total"),
  wordLength: document.querySelector("#word-length"),
  wordDisplay: document.querySelector("#word-display"),
  phoneticDisplay: document.querySelector("#phonetic-display"),
  meaningDisplay: document.querySelector("#meaning-display"),
  exampleDisplay: document.querySelector("#example-display"),
  speakWordButton: document.querySelector("#speak-word-button"),
  speakMeaningButton: document.querySelector("#speak-meaning-button"),
  spellWordButton: document.querySelector("#spell-word-button"),
  letterBoxes: document.querySelector("#letter-boxes"),
  letterInput: document.querySelector("#letter-input"),
  feedback: document.querySelector("#feedback"),
  clearButton: document.querySelector("#clear-button"),
  previousButton: document.querySelector("#previous-button"),
  nextButton: document.querySelector("#next-button"),
  scoreValue: document.querySelector("#score-value"),
  scoreText: document.querySelector("#score-text"),
  answeredCount: document.querySelector("#answered-count"),
  remainingCount: document.querySelector("#remaining-count"),
  wordMap: document.querySelector("#word-map"),
};

async function init() {
  await loadWordBanks();
  populateWordBankSelect();

  els.gradeSelect.value = state.grade;
  els.gradeSelect.addEventListener("change", () => {
    state.grade = els.gradeSelect.value;
    startRound();
    playUiFeedback("switchGrade", `已经换到${wordBankLabel(state.grade)}。`);
  });
  els.wordAudioSourceSelect.value = state.wordAudioSource;
  els.wordAudioSourceSelect.addEventListener("change", () => {
    state.wordAudioSource = els.wordAudioSourceSelect.value;
    stopPlayback();
    const sourceName = state.wordAudioSource === "youdao" ? "有道" : "Oxford";
    playUiFeedback("soft", `单词发音已切换到${sourceName}。`);
  });
  els.showWordToggle.checked = state.showWord;
  els.showWordToggle.addEventListener("change", () => {
    state.showWord = els.showWordToggle.checked;
    render();
    playUiFeedback("soft", state.showWord ? "现在显示单词。" : "现在隐藏单词。");
  });
  els.showMeaningToggle.checked = state.showMeaning;
  els.showMeaningToggle.addEventListener("change", () => {
    state.showMeaning = els.showMeaningToggle.checked;
    render();
    playUiFeedback("soft", state.showMeaning ? "现在显示中文释义。" : "现在隐藏中文释义。");
  });
  els.autoReadToggle.checked = state.autoReadWord;
  els.autoReadToggle.addEventListener("change", () => {
    state.autoReadWord = els.autoReadToggle.checked;
    stopPlayback();
    if (state.autoReadWord) {
      state.lastAutoReadKey = "";
      render();
    } else {
      playUiFeedback("soft", "自动听单词已关闭。");
    }
  });
  els.uiFeedbackToggle.checked = state.uiFeedbackSound;
  els.uiFeedbackToggle.addEventListener("change", () => {
    state.uiFeedbackSound = els.uiFeedbackToggle.checked;
    stopPlayback();
    if (state.uiFeedbackSound) playUiFeedback("soft", "操作提示音已开启。");
  });
  els.newRoundButton.addEventListener("click", () => {
    startRound();
    playUiFeedback("soft", "新的单词已经准备好啦。");
  });
  els.speakWordButton.addEventListener("click", () => {
    playCurrentWord();
  });
  els.speakMeaningButton.addEventListener("click", () => {
    speakFallback(spokenMeaning(currentWord().meaning), 0.95, "zh-CN");
  });
  els.spellWordButton.addEventListener("click", speakSpelling);
  els.clearButton.addEventListener("click", clearAnswer);
  els.previousButton.addEventListener("click", () => moveBy(-1));
  els.nextButton.addEventListener("click", () => moveBy(1));
  els.letterInput.addEventListener("keydown", handleKeyDown);
  els.letterInput.addEventListener("input", handleTextInput);
  document.addEventListener("pointerdown", handleInteractivePointerDown, true);
  document.addEventListener("focusin", handleInteractiveFocus, true);
  document.addEventListener("click", handleDocumentClick);
  document.addEventListener("keydown", (event) => {
    if (event.target === els.letterInput || isInteractiveTarget(event.target)) return;
    if (/^[a-zA-Z]$/.test(event.key) || event.key === "Backspace") {
      els.letterInput.focus();
      handleKeyDown(event);
    }
  });

  preloadLetterAudio();
  startRound();
}

async function loadWordBanks() {
  state.wordBanks = fallbackWordBanks();
  state.wordBankLabels = { ...GRADE_LABELS };

  try {
    const response = await fetch(`${WORD_BANKS_URL}?v=${WORD_BANKS_ASSET_VERSION}`);
    if (!response.ok) throw new Error(`词库加载失败：${response.status}`);

    const payload = await response.json();
    const nextBanks = {};
    const nextLabels = {};

    (payload.banks || []).forEach((bank) => {
      const words = (bank.words || []).map(normalizeWordItem).filter((item) => item.word);
      if (!bank.id || !words.length) return;
      nextBanks[bank.id] = words;
      nextLabels[bank.id] = `${bank.label || bank.id} (${words.length})`;
    });

    const firstBankId = Object.keys(nextBanks)[0];
    if (firstBankId) {
      state.wordBanks = nextBanks;
      state.wordBankLabels = nextLabels;
      state.grade = firstBankId;
    }
  } catch (error) {
    console.info("使用内置词库。", error);
  }
}

function populateWordBankSelect() {
  els.gradeSelect.innerHTML = "";
  Object.entries(state.wordBankLabels).forEach(([value, label]) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = label;
    els.gradeSelect.append(option);
  });
}

function fallbackWordBanks() {
  return Object.fromEntries(
    Object.entries(WORD_BANKS).map(([bankId, words]) => [
      bankId,
      words.map(([word, phonetic]) =>
        normalizeWordItem({
          word,
          phonetic,
          meaning: WORD_MEANINGS[word.toLowerCase()] || "暂无释义",
        }),
      ),
    ]),
  );
}

function normalizeWordItem(item) {
  const word = String(item.word || "").trim();
  if (!/^[A-Za-z]+$/.test(word)) return { word: "" };
  return {
    word,
    phonetic: String(item.phonetic || "").trim(),
    meaning: String(item.meaning || "暂无释义").trim(),
    example: String(item.example || "").trim(),
  };
}

function activeWordBank() {
  return state.wordBanks[state.grade] || [];
}

function wordBankLabel(bankId) {
  return state.wordBankLabels[bankId] || bankId;
}

function startRound() {
  stopPlayback();
  const bank = activeWordBank();
  state.round = shuffle(bank).slice(0, ROUND_SIZE);
  state.roundId += 1;
  state.index = 0;
  state.results = Array(state.round.length).fill(null);
  state.letters = [];
  els.roundTotal.textContent = String(state.round.length);
  render();
}

function currentWord() {
  return state.round[state.index] || {
    word: "",
    phonetic: "",
    meaning: "暂无释义",
    example: "",
  };
}

function displayWord(word) {
  return state.showWord ? word : "*".repeat(word.length);
}

function spokenMeaning(meaning) {
  return String(meaning || "暂无释义")
    .replace(/\b(?:abbr|adj|adv|art|aux|conj|det|int|interj|n|num|pl|prep|pron|sing|v|vi|vt)\s*\./gi, "。")
    //.replace(/[()[\]【】]/g, " ")
    //.replace(/\s*[;；,，、]\s*/g, "；")
    .replace(/\s+/g, " ")
    .replace(/^[。；,，、\s]+|[。；,，、\s]+$/g, "")
    .trim() || "暂无释义";
}

function playCurrentWord() {
  const word = currentWord().word;
  return playDictionaryAudio(word, { preferLocalLetterAudio: false }).catch(() => speakFallback(word, 0.9));
}

function autoReadCurrentWord() {
  if (!state.autoReadWord || !currentWord()) return;
  const readKey = `${state.roundId}:${state.index}`;
  if (state.lastAutoReadKey === readKey) return;
  state.lastAutoReadKey = readKey;

  window.setTimeout(() => {
    if (state.autoReadWord && state.lastAutoReadKey === readKey) {
      playCurrentWord();
    }
  }, 180);
}

function shuffle(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function render() {
  const item = currentWord();
  const length = item.word.length;
  syncInputValue();
  els.gradeName.textContent = wordBankLabel(state.grade);
  els.currentIndex.textContent = String(state.index + 1);
  els.wordDisplay.textContent = displayWord(item.word);
  els.phoneticDisplay.textContent = item.phonetic;
  els.meaningDisplay.textContent = item.meaning;
  els.meaningDisplay.hidden = !state.showMeaning;
  els.exampleDisplay.textContent = item.example;
  els.exampleDisplay.hidden = !state.showMeaning || !item.example;
  els.wordLength.textContent = `${length} 个字母`;
  els.letterBoxes.style.setProperty("--letter-count", String(length));
  els.letterBoxes.innerHTML = "";

  for (let i = 0; i < length; i += 1) {
    const box = document.createElement("div");
    box.className = "letter-box";
    box.textContent = state.letters[i] || "";
    if (i === state.letters.length && state.letters.length < length) box.classList.add("active");
    if (state.results[state.index] === true) box.classList.add("correct");
    if (state.results[state.index] === false) box.classList.add("wrong");
    els.letterBoxes.append(box);
  }

  if (state.results[state.index] === true) {
    setFeedback("太棒了，拼对啦！", "success");
  } else if (state.results[state.index] === false) {
    setFeedback("差一点点，改一改再试。", "error");
  } else {
    setFeedback("听一听，再把字母放进格子里。", "neutral");
  }

  renderProgress();
  autoReadCurrentWord();
  requestAnimationFrame(focusInput);
}

function renderProgress() {
  const correct = state.results.filter((result) => result === true).length;
  const answered = state.results.filter((result) => result !== null).length;
  const remaining = state.round.length - answered;

  els.scoreValue.textContent = String(correct);
  els.scoreText.textContent = `${correct} / ${state.round.length}`;
  els.answeredCount.textContent = String(answered);
  els.remainingCount.textContent = String(remaining);
  els.wordMap.innerHTML = "";

  state.results.forEach((result, index) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = "map-dot";
    dot.textContent = String(index + 1);
    dot.setAttribute("aria-label", `第 ${index + 1} 个单词`);
    if (index === state.index) dot.classList.add("current");
    if (result === true) dot.classList.add("done");
    if (result === false) dot.classList.add("missed");
    dot.addEventListener("click", () => {
      state.index = index;
      state.letters = [];
      render();
    });
    els.wordMap.append(dot);
  });
}

function handleKeyDown(event) {
  if (event.key === "Backspace") {
    event.preventDefault();
    if (state.letters.length > 0) {
      state.letters.pop();
      state.results[state.index] = null;
      render();
    }
    return;
  }

  if (!/^[a-zA-Z]$/.test(event.key)) return;

  event.preventDefault();
  const expectedLength = currentWord().word.length;
  if (state.letters.length >= expectedLength) return;
  state.letters.push(event.key.toLowerCase());
  updateBoxesOnly();

  if (state.letters.length === expectedLength) {
    checkAnswer();
  }
}

function updateBoxesOnly() {
  syncInputValue();
  const boxes = [...els.letterBoxes.children];
  boxes.forEach((box, index) => {
    box.textContent = state.letters[index] || "";
    box.classList.toggle("active", index === state.letters.length && state.letters.length < boxes.length);
    box.classList.remove("correct", "wrong");
  });
}

function handleTextInput() {
  const expectedLength = currentWord().word.length;
  const typedLetters = els.letterInput.value.toLowerCase().replace(/[^a-z]/g, "");
  state.letters = typedLetters.slice(0, expectedLength).split("");
  updateBoxesOnly();

  if (state.letters.length === expectedLength) {
    checkAnswer();
  }
}

function checkAnswer() {
  const answer = state.letters.join("");
  const expected = currentWord().word.toLowerCase();
  const correct = answer === expected;
  state.results[state.index] = correct;

  if (correct) {
    markBoxes("correct");
    setFeedback("太棒了，拼对啦！", "success");
    playUiFeedback("correct", "太棒了，拼对啦。");
    renderProgress();
    window.setTimeout(() => {
      if (state.index < state.round.length - 1) moveBy(1);
      else render();
    }, CORRECT_ADVANCE_DELAY_MS);
  } else {
    markBoxes("wrong");
    setFeedback("差一点点，按删除键改一改。", "error");
    playUiFeedback("wrong", "差一点点，再试一次。");
    renderProgress();
  }
}

function markBoxes(className) {
  [...els.letterBoxes.children].forEach((box) => box.classList.add(className));
}

function setFeedback(message, type) {
  els.feedback.textContent = message;
  els.feedback.className = `feedback ${type}`;
}

function clearAnswer() {
  state.letters = [];
  state.results[state.index] = null;
  render();
}

function moveBy(delta) {
  const nextIndex = Math.min(Math.max(state.index + delta, 0), state.round.length - 1);
  if (nextIndex === state.index) return;
  stopPlayback();
  state.index = nextIndex;
  state.letters = [];
  render();
}

async function speakSpelling() {
  const token = stopPlayback();
  const letters = currentWord().word.toLowerCase().split("");
  setAudioButtonsDisabled(true);

  try {
    for (const letter of letters) {
      if (token !== playbackToken) return;
      await playDictionaryAudio(letter, { interrupt: false, token, preferLocalLetterAudio: true }).catch(() => {
        speakFallback(letter, 0.85);
      });
      await pause(180);
    }
  } finally {
    if (token === playbackToken) setAudioButtonsDisabled(false);
  }
}

function playDictionaryAudio(entry, options = {}) {
  const token = options.interrupt === false ? options.token : stopPlayback();
  const audioKey = normalizeAudioKey(entry);

  if (!audioKey) {
    return Promise.reject(new Error("Missing audio key"));
  }

  return new Promise((resolve, reject) => {
    const audio = getDictionaryAudio(audioKey, options.preferLocalLetterAudio === true);
    let settled = false;
    activeAudio = audio;

    const cleanup = () => {
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
      if (activeAudioCleanup === finish) activeAudioCleanup = null;
    };
    const finish = (error) => {
      if (settled) return;
      settled = true;
      cleanup();
      if (activeAudio === audio) activeAudio = null;
      if (error) reject(error);
      else resolve();
    };
    const handleEnded = () => finish();
    const handleError = () => finish(new Error(`Audio not available: ${audioKey}`));

    activeAudioCleanup = finish;
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);

    resetAudio(audio);
    audio.play().catch((error) => {
      finish(error);
    });
  }).finally(() => {
    if (token === playbackToken && options.interrupt !== false) {
      setAudioButtonsDisabled(false);
    }
  });
}

function preloadLetterAudio() {
  LETTER_AUDIO_KEYS.forEach((letter) => {
    if (letterAudioCache.has(letter)) return;
    const audio = new Audio(localLetterAudioUrl(letter));
    audio.preload = "auto";
    audio.load();
    letterAudioCache.set(letter, audio);
  });
}

function getDictionaryAudio(audioKey, preferLocalLetterAudio = false) {
  if (preferLocalLetterAudio && LETTER_AUDIO_KEYS.includes(audioKey)) {
    let audio = letterAudioCache.get(audioKey);
    if (!audio) {
      audio = new Audio(localLetterAudioUrl(audioKey));
      audio.preload = "auto";
      letterAudioCache.set(audioKey, audio);
    }
    return audio;
  }

  return new Audio(dictionaryAudioUrl(audioKey));
}

function dictionaryAudioUrl(audioKey) {
  if (state.wordAudioSource === "youdao") {
    return `${YOUDAO_AUDIO_BASE_URL}?audio=${encodeURIComponent(audioKey)}&type=2`;
  }

  return `${OXFORD_AUDIO_BASE_URL}${encodeURIComponent(audioKey)}--_us_1.mp3`;
}

function localLetterAudioUrl(letter) {
  return `${LOCAL_LETTER_AUDIO_BASE_PATH}${letter}.mp3`;
}

function normalizeAudioKey(entry) {
  return String(entry).toLowerCase().replace(/[^a-z]/g, "");
}

function stopPlayback() {
  playbackToken += 1;
  const audioToStop = activeAudio;
  if (audioToStop) resetAudio(audioToStop);
  if (activeAudioCleanup) {
    activeAudioCleanup();
    activeAudioCleanup = null;
  }
  activeAudio = null;
  window.speechSynthesis?.cancel?.();
  setAudioButtonsDisabled(false);
  return playbackToken;
}

function resetAudio(audio) {
  audio.pause();
  try {
    audio.currentTime = 0;
  } catch {
    // Some browsers reject currentTime changes before metadata is available.
  }
}

function pause(milliseconds) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, milliseconds);
  });
}

function setAudioButtonsDisabled(disabled) {
  els.speakWordButton.disabled = disabled;
  els.speakMeaningButton.disabled = disabled;
  els.spellWordButton.disabled = disabled;
}

function playUiFeedback(kind, message) {
  if (!state.uiFeedbackSound) return;
  playUiTone(kind);
  if (message) speakFallback(message, 1.05, "zh-CN");
}

function playUiTone(kind) {
  try {
    feedbackAudioContext ||= new (window.AudioContext || window.webkitAudioContext)();
    const context = feedbackAudioContext;
    const now = context.currentTime;
    const notes =
      kind === "correct"
        ? [
            [523.25, 0],
            [659.25, 0.08],
            [783.99, 0.16],
          ]
        : kind === "wrong"
          ? [
              [246.94, 0],
              [196, 0.12],
            ]
          : [[392, 0]];

    notes.forEach(([frequency, offset]) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = kind === "wrong" ? "triangle" : "sine";
      oscillator.frequency.setValueAtTime(frequency, now + offset);
      gain.gain.setValueAtTime(0.0001, now + offset);
      gain.gain.exponentialRampToValueAtTime(0.08, now + offset + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + offset + 0.18);
      oscillator.connect(gain).connect(context.destination);
      oscillator.start(now + offset);
      oscillator.stop(now + offset + 0.2);
    });
  } catch {
    // AudioContext can be unavailable in older browsers; speech feedback remains available.
  }
}

function speakFallback(text, rate, lang = "en-US") {
  if (!("speechSynthesis" in window)) {
    setFeedback("当前浏览器不支持语音播放。", "error");
    return;
  }

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = rate;
  const voices = window.speechSynthesis.getVoices();
  const preferredVoice = voices.find((voice) => voice.lang.toLowerCase().startsWith(lang.toLowerCase()));
  if (preferredVoice) utterance.voice = preferredVoice;
  window.speechSynthesis.speak(utterance);
}

function focusInput() {
  if (Date.now() < suppressAutoFocusUntil) return;
  if (document.activeElement !== els.letterInput && isInteractiveTarget(document.activeElement)) return;
  els.letterInput.focus({ preventScroll: true });
}

function handleInteractivePointerDown(event) {
  if (isInteractiveTarget(event.target)) suppressAutoFocus(1200);
}

function handleInteractiveFocus(event) {
  if (event.target !== els.letterInput && isInteractiveTarget(event.target)) suppressAutoFocus(1200);
}

function suppressAutoFocus(milliseconds) {
  suppressAutoFocusUntil = Math.max(suppressAutoFocusUntil, Date.now() + milliseconds);
}

function handleDocumentClick(event) {
  if (isInteractiveTarget(event.target)) return;
  focusInput();
}

function isInteractiveTarget(target) {
  if (!(target instanceof Element)) return false;
  return Boolean(target.closest("button, select, input, textarea, a, label"));
}

function syncInputValue() {
  els.letterInput.value = state.letters.join("");
}

window.speechSynthesis?.addEventListener?.("voiceschanged", () => {});
init();
