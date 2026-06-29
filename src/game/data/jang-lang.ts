import { asset } from "@/lib/asset";

export type LangCode = "es" | "pt" | "it" | "fr" | "zh" | "en";

export type LangWord = {
  id: string;
  english: string;
  category: string;
  emoji?: string;
  image?: string;
  translations: Record<LangCode, string>;
};

// ── Objects ──────────────────────────────────────────────────────────────────
const OBJECTS: LangWord[] = [
  { id: "fox",      english: "Fox",      category: "objects", image: asset("/characters/FOX 1.png"),                  translations: { es: "zorro",      pt: "raposa",        it: "volpe",      fr: "renard",    zh: "狐狸",  en: "fox"      } },
  { id: "fish",     english: "Fish",     category: "objects", image: asset("/book-objects/flying-fish.png"),           translations: { es: "pez",        pt: "peixe",         it: "pesce",      fr: "poisson",   zh: "鱼",    en: "fish"     } },
  { id: "drum",     english: "Drum",     category: "objects", image: asset("/book-objects/jamaica-steel-drum.png"),    translations: { es: "tambor",     pt: "tambor",        it: "tamburo",    fr: "tambour",   zh: "鼓",    en: "drum"     } },
  { id: "tuba",     english: "Tuba",     category: "objects", image: asset("/book-objects/tuba.png"),                  translations: { es: "tuba",       pt: "tuba",          it: "tuba",       fr: "tuba",      zh: "大号",  en: "tuba"     } },
  { id: "mask",     english: "Mask",     category: "objects", image: asset("/book-objects/KOREA-MASK.png"),            translations: { es: "máscara",    pt: "máscara",       it: "maschera",   fr: "masque",    zh: "面具",  en: "mask"     } },
  { id: "skis",     english: "Skis",     category: "objects", image: asset("/book-objects/swiss-skiis.png"),           translations: { es: "esquís",     pt: "esquis",        it: "sci",        fr: "skis",      zh: "滑雪板", en: "skis"    } },
  { id: "pizza",    english: "Pizza",    category: "objects", image: asset("/book-objects/pizza.png"),                 translations: { es: "pizza",      pt: "pizza",         it: "pizza",      fr: "pizza",     zh: "披萨",  en: "pizza"    } },
  { id: "plane",    english: "Plane",    category: "objects", image: asset("/book-objects/plane.png"),                 translations: { es: "avión",      pt: "avião",         it: "aereo",      fr: "avion",     zh: "飞机",  en: "plane"    } },
  { id: "compass",  english: "Compass",  category: "objects", image: asset("/book-objects/compass.png"),               translations: { es: "brújula",    pt: "bússola",       it: "bussola",    fr: "boussole",  zh: "指南针", en: "compass" } },
  { id: "penguin",  english: "Penguin",  category: "objects", image: asset("/book-objects/SOUTH-AFRICA-PENGUIN.png"), translations: { es: "pingüino",   pt: "pinguim",       it: "pinguino",   fr: "pingouin",  zh: "企鹅",  en: "penguin"  } },
  { id: "elephant", english: "Elephant", category: "objects", image: asset("/book-objects/ELEPHANT.png"),              translations: { es: "elefante",   pt: "elefante",      it: "elefante",   fr: "éléphant",  zh: "大象",  en: "elephant" } },
  { id: "sombrero", english: "Sombrero", category: "objects", image: asset("/book-objects/mexico-hat.png"),            translations: { es: "sombrero",   pt: "sombrero",      it: "sombrero",   fr: "sombrero",  zh: "宽边帽", en: "sombrero"} },
  { id: "book",     english: "Book",     category: "objects", emoji: "📚",                                             translations: { es: "libro",      pt: "livro",         it: "libro",      fr: "livre",     zh: "书",    en: "book"     } },
  { id: "house",    english: "House",    category: "objects", emoji: "🏠",                                             translations: { es: "casa",       pt: "casa",          it: "casa",       fr: "maison",    zh: "房子",  en: "house"    } },
  { id: "car",      english: "Car",      category: "objects", emoji: "🚗",                                             translations: { es: "coche",      pt: "carro",         it: "macchina",   fr: "voiture",   zh: "汽车",  en: "car"      } },
  { id: "tree",     english: "Tree",     category: "objects", emoji: "🌳",                                             translations: { es: "árbol",      pt: "árvore",        it: "albero",     fr: "arbre",     zh: "树",    en: "tree"     } },
  { id: "flower",   english: "Flower",   category: "objects", emoji: "🌸",                                             translations: { es: "flor",       pt: "flor",          it: "fiore",      fr: "fleur",     zh: "花",    en: "flower"   } },
  { id: "star",     english: "Star",     category: "objects", emoji: "⭐",                                             translations: { es: "estrella",   pt: "estrela",       it: "stella",     fr: "étoile",    zh: "星星",  en: "star"     } },
  { id: "moon",     english: "Moon",     category: "objects", emoji: "🌙",                                             translations: { es: "luna",       pt: "lua",           it: "luna",       fr: "lune",      zh: "月亮",  en: "moon"     } },
  { id: "sun",      english: "Sun",      category: "objects", emoji: "☀️",                                             translations: { es: "sol",        pt: "sol",           it: "sole",       fr: "soleil",    zh: "太阳",  en: "sun"      } },
  { id: "umbrella", english: "Umbrella", category: "objects", emoji: "☂️",                                             translations: { es: "paraguas",   pt: "guarda-chuva",  it: "ombrello",   fr: "parapluie", zh: "雨伞",  en: "umbrella" } },
  { id: "key",      english: "Key",      category: "objects", emoji: "🔑",                                             translations: { es: "llave",      pt: "chave",         it: "chiave",     fr: "clé",       zh: "钥匙",  en: "key"      } },
  { id: "clock",    english: "Clock",    category: "objects", emoji: "🕐",                                             translations: { es: "reloj",      pt: "relógio",       it: "orologio",   fr: "horloge",   zh: "时钟",  en: "clock"    } },
  { id: "door",     english: "Door",     category: "objects", emoji: "🚪",                                             translations: { es: "puerta",     pt: "porta",         it: "porta",      fr: "porte",     zh: "门",    en: "door"     } },
  { id: "bicycle",  english: "Bicycle",  category: "objects", emoji: "🚲",                                             translations: { es: "bicicleta",  pt: "bicicleta",     it: "bicicletta", fr: "vélo",      zh: "自行车", en: "bicycle" } },
];

// ── Sayings ──────────────────────────────────────────────────────────────────
const SAYINGS: LangWord[] = [
  { id: "hello",           english: "Hello",                 category: "sayings", emoji: "👋", translations: { es: "hola",                    pt: "olá",                    it: "ciao",                 fr: "bonjour",             zh: "你好",         en: "hello"                } },
  { id: "goodbye",         english: "Goodbye",               category: "sayings", emoji: "👋", translations: { es: "adiós",                   pt: "tchau",                  it: "arrivederci",          fr: "au revoir",           zh: "再见",         en: "goodbye"              } },
  { id: "thank-you",       english: "Thank you",             category: "sayings", emoji: "🙏", translations: { es: "gracias",                 pt: "obrigado",               it: "grazie",               fr: "merci",               zh: "谢谢",         en: "thank you"            } },
  { id: "please",          english: "Please",                category: "sayings", emoji: "🤲", translations: { es: "por favor",               pt: "por favor",              it: "per favore",           fr: "s'il vous plaît",     zh: "请",           en: "please"               } },
  { id: "yes",             english: "Yes",                   category: "sayings", emoji: "✅", translations: { es: "sí",                      pt: "sim",                    it: "sì",                   fr: "oui",                 zh: "是",           en: "yes"                  } },
  { id: "no",              english: "No",                    category: "sayings", emoji: "❌", translations: { es: "no",                      pt: "não",                    it: "no",                   fr: "non",                 zh: "不",           en: "no"                   } },
  { id: "sorry",           english: "Sorry",                 category: "sayings", emoji: "😔", translations: { es: "lo siento",               pt: "desculpe",               it: "mi dispiace",          fr: "désolé",              zh: "对不起",       en: "sorry"                } },
  { id: "excuse-me",       english: "Excuse me",             category: "sayings", emoji: "🙋", translations: { es: "perdón",                  pt: "com licença",            it: "scusa",                fr: "pardon",              zh: "不好意思",     en: "excuse me"            } },
  { id: "how-are-you",     english: "How are you?",          category: "sayings", emoji: "😊", translations: { es: "¿cómo estás?",            pt: "como vai?",              it: "come stai?",           fr: "comment ça va?",      zh: "你好吗？",     en: "how are you?"         } },
  { id: "i-love-you",      english: "I love you",            category: "sayings", emoji: "❤️", translations: { es: "te quiero",               pt: "eu te amo",              it: "ti voglio bene",       fr: "je t'aime",           zh: "我爱你",       en: "i love you"           } },
  { id: "good-morning",    english: "Good morning",          category: "sayings", emoji: "🌅", translations: { es: "buenos días",             pt: "bom dia",                it: "buongiorno",           fr: "bonjour",             zh: "早上好",       en: "good morning"         } },
  { id: "good-night",      english: "Good night",            category: "sayings", emoji: "🌙", translations: { es: "buenas noches",           pt: "boa noite",              it: "buonanotte",           fr: "bonne nuit",          zh: "晚安",         en: "good night"           } },
  { id: "good-afternoon",  english: "Good afternoon",        category: "sayings", emoji: "🌤️", translations: { es: "buenas tardes",           pt: "boa tarde",              it: "buon pomeriggio",      fr: "bon après-midi",      zh: "下午好",       en: "good afternoon"       } },
  { id: "welcome",         english: "Welcome",               category: "sayings", emoji: "🎉", translations: { es: "bienvenido",              pt: "bem-vindo",              it: "benvenuto",            fr: "bienvenue",           zh: "欢迎",         en: "welcome"              } },
  { id: "cheers",          english: "Cheers!",               category: "sayings", emoji: "🥂", translations: { es: "salud",                   pt: "saúde",                  it: "salute",               fr: "santé",               zh: "干杯",         en: "cheers"               } },
  { id: "happy-birthday",  english: "Happy birthday",        category: "sayings", emoji: "🎂", translations: { es: "feliz cumpleaños",         pt: "feliz aniversário",      it: "buon compleanno",      fr: "joyeux anniversaire", zh: "生日快乐",     en: "happy birthday"       } },
  { id: "congratulations", english: "Congratulations",       category: "sayings", emoji: "🎊", translations: { es: "felicidades",             pt: "parabéns",               it: "congratulazioni",      fr: "félicitations",       zh: "恭喜",         en: "congratulations"      } },
  { id: "youre-welcome",   english: "You're welcome",        category: "sayings", emoji: "😄", translations: { es: "de nada",                 pt: "de nada",                it: "prego",                fr: "de rien",             zh: "不客气",       en: "you're welcome"       } },
  { id: "see-you-later",   english: "See you later",         category: "sayings", emoji: "✌️", translations: { es: "hasta luego",             pt: "até logo",               it: "a dopo",               fr: "à bientôt",           zh: "回头见",       en: "see you later"        } },
  { id: "see-you-tomorrow",english: "See you tomorrow",      category: "sayings", emoji: "📅", translations: { es: "hasta mañana",            pt: "até amanhã",             it: "a domani",             fr: "à demain",            zh: "明天见",       en: "see you tomorrow"     } },
  { id: "dont-understand", english: "I don't understand",   category: "sayings", emoji: "🤷", translations: { es: "no entiendo",             pt: "não entendo",            it: "non capisco",          fr: "je ne comprends pas", zh: "我不懂",       en: "i don't understand"   } },
  { id: "nice-to-meet-you",english: "Nice to meet you",      category: "sayings", emoji: "🤝", translations: { es: "mucho gusto",             pt: "prazer em conhecer",     it: "piacere",              fr: "enchanté",            zh: "很高兴认识你", en: "nice to meet you"     } },
  { id: "im-hungry",       english: "I'm hungry",            category: "sayings", emoji: "😋", translations: { es: "tengo hambre",            pt: "estou com fome",         it: "ho fame",              fr: "j'ai faim",           zh: "我饿了",       en: "i'm hungry"           } },
  { id: "help",            english: "Help!",                 category: "sayings", emoji: "🆘", translations: { es: "ayuda",                   pt: "ajuda",                  it: "aiuto",                fr: "au secours",          zh: "救命",         en: "help"                 } },
  { id: "whats-your-name", english: "What's your name?",    category: "sayings", emoji: "🏷️", translations: { es: "¿cómo te llamas?",        pt: "como você se chama?",    it: "come ti chiami?",      fr: "comment tu t'appelles?", zh: "你叫什么名字？", en: "what's your name?"  } },
  { id: "where-bathroom",  english: "Where's the bathroom?", category: "sayings", emoji: "🚻", translations: { es: "¿dónde está el baño?",    pt: "onde é o banheiro?",     it: "dov'è il bagno?",      fr: "où sont les toilettes?", zh: "厕所在哪里？", en: "where's the bathroom?" } },
  { id: "how-much",        english: "How much does it cost?",category: "sayings", emoji: "💰", translations: { es: "¿cuánto cuesta?",          pt: "quanto custa?",          it: "quanto costa?",        fr: "combien ça coûte?",   zh: "多少钱？",     en: "how much does it cost?" } },
  { id: "beautiful",       english: "Beautiful!",            category: "sayings", emoji: "✨", translations: { es: "hermoso",                 pt: "lindo",                  it: "bellissimo",           fr: "magnifique",          zh: "美丽",         en: "beautiful"            } },
];

// ── Colors ───────────────────────────────────────────────────────────────────
const COLORS: LangWord[] = [
  { id: "red",       english: "Red",       category: "colors", emoji: "🔴", translations: { es: "rojo",        pt: "vermelho",  it: "rosso",     fr: "rouge",      zh: "红色", en: "red"       } },
  { id: "blue",      english: "Blue",      category: "colors", emoji: "🔵", translations: { es: "azul",        pt: "azul",      it: "blu",       fr: "bleu",       zh: "蓝色", en: "blue"      } },
  { id: "green",     english: "Green",     category: "colors", emoji: "🟢", translations: { es: "verde",       pt: "verde",     it: "verde",     fr: "vert",       zh: "绿色", en: "green"     } },
  { id: "yellow",    english: "Yellow",    category: "colors", emoji: "🟡", translations: { es: "amarillo",    pt: "amarelo",   it: "giallo",    fr: "jaune",      zh: "黄色", en: "yellow"    } },
  { id: "orange",    english: "Orange",    category: "colors", emoji: "🟠", translations: { es: "naranja",     pt: "laranja",   it: "arancione", fr: "orange",     zh: "橙色", en: "orange"    } },
  { id: "purple",    english: "Purple",    category: "colors", emoji: "🟣", translations: { es: "morado",      pt: "roxo",      it: "viola",     fr: "violet",     zh: "紫色", en: "purple"    } },
  { id: "pink",      english: "Pink",      category: "colors", emoji: "🩷", translations: { es: "rosa",        pt: "rosa",      it: "rosa",      fr: "rose",       zh: "粉色", en: "pink"      } },
  { id: "white",     english: "White",     category: "colors", emoji: "⬜", translations: { es: "blanco",      pt: "branco",    it: "bianco",    fr: "blanc",      zh: "白色", en: "white"     } },
  { id: "black",     english: "Black",     category: "colors", emoji: "⬛", translations: { es: "negro",       pt: "preto",     it: "nero",      fr: "noir",       zh: "黑色", en: "black"     } },
  { id: "brown",     english: "Brown",     category: "colors", emoji: "🟤", translations: { es: "marrón",      pt: "marrom",    it: "marrone",   fr: "marron",     zh: "棕色", en: "brown"     } },
  { id: "gray",      english: "Gray",      category: "colors", emoji: "🩶", translations: { es: "gris",        pt: "cinza",     it: "grigio",    fr: "gris",       zh: "灰色", en: "gray"      } },
  { id: "gold",      english: "Gold",      category: "colors", emoji: "🌟", translations: { es: "dorado",      pt: "dourado",   it: "dorato",    fr: "or",         zh: "金色", en: "gold"      } },
  { id: "silver",    english: "Silver",    category: "colors", emoji: "🥈", translations: { es: "plateado",    pt: "prateado",  it: "argento",   fr: "argent",     zh: "银色", en: "silver"    } },
  { id: "turquoise", english: "Turquoise", category: "colors", emoji: "🩵", translations: { es: "turquesa",    pt: "turquesa",  it: "turchese",  fr: "turquoise",  zh: "青绿色", en: "turquoise"} },
  { id: "navy",      english: "Navy blue", category: "colors", emoji: "🫐", translations: { es: "azul marino",  pt: "azul-marinho", it: "blu navy", fr: "bleu marine", zh: "海军蓝", en: "navy blue" } },
  { id: "beige",     english: "Beige",     category: "colors", emoji: "🏜️", translations: { es: "beige",       pt: "bege",      it: "beige",     fr: "beige",      zh: "米色", en: "beige"     } },
];

// ── Numbers ──────────────────────────────────────────────────────────────────
const NUMBERS: LangWord[] = [
  { id: "one",       english: "One",       category: "numbers", emoji: "1️⃣",  translations: { es: "uno",         pt: "um",      it: "uno",          fr: "un",       zh: "一",  en: "one"       } },
  { id: "two",       english: "Two",       category: "numbers", emoji: "2️⃣",  translations: { es: "dos",         pt: "dois",    it: "due",          fr: "deux",     zh: "二",  en: "two"       } },
  { id: "three",     english: "Three",     category: "numbers", emoji: "3️⃣",  translations: { es: "tres",        pt: "três",    it: "tre",          fr: "trois",    zh: "三",  en: "three"     } },
  { id: "four",      english: "Four",      category: "numbers", emoji: "4️⃣",  translations: { es: "cuatro",      pt: "quatro",  it: "quattro",      fr: "quatre",   zh: "四",  en: "four"      } },
  { id: "five",      english: "Five",      category: "numbers", emoji: "5️⃣",  translations: { es: "cinco",       pt: "cinco",   it: "cinque",       fr: "cinq",     zh: "五",  en: "five"      } },
  { id: "six",       english: "Six",       category: "numbers", emoji: "6️⃣",  translations: { es: "seis",        pt: "seis",    it: "sei",          fr: "six",      zh: "六",  en: "six"       } },
  { id: "seven",     english: "Seven",     category: "numbers", emoji: "7️⃣",  translations: { es: "siete",       pt: "sete",    it: "sette",        fr: "sept",     zh: "七",  en: "seven"     } },
  { id: "eight",     english: "Eight",     category: "numbers", emoji: "8️⃣",  translations: { es: "ocho",        pt: "oito",    it: "otto",         fr: "huit",     zh: "八",  en: "eight"     } },
  { id: "nine",      english: "Nine",      category: "numbers", emoji: "9️⃣",  translations: { es: "nueve",       pt: "nove",    it: "nove",         fr: "neuf",     zh: "九",  en: "nine"      } },
  { id: "ten",       english: "Ten",       category: "numbers", emoji: "🔟",  translations: { es: "diez",        pt: "dez",     it: "dieci",        fr: "dix",      zh: "十",  en: "ten"       } },
  { id: "eleven",    english: "Eleven",    category: "numbers", emoji: "1️⃣1️⃣", translations: { es: "once",        pt: "onze",    it: "undici",       fr: "onze",     zh: "十一", en: "eleven"   } },
  { id: "twelve",    english: "Twelve",    category: "numbers", emoji: "1️⃣2️⃣", translations: { es: "doce",        pt: "doze",    it: "dodici",       fr: "douze",    zh: "十二", en: "twelve"   } },
  { id: "thirteen",  english: "Thirteen",  category: "numbers", emoji: "1️⃣3️⃣", translations: { es: "trece",       pt: "treze",   it: "tredici",      fr: "treize",   zh: "十三", en: "thirteen" } },
  { id: "fourteen",  english: "Fourteen",  category: "numbers", emoji: "1️⃣4️⃣", translations: { es: "catorce",     pt: "quatorze",it: "quattordici",  fr: "quatorze", zh: "十四", en: "fourteen" } },
  { id: "fifteen",   english: "Fifteen",   category: "numbers", emoji: "1️⃣5️⃣", translations: { es: "quince",      pt: "quinze",  it: "quindici",     fr: "quinze",   zh: "十五", en: "fifteen"  } },
  { id: "sixteen",   english: "Sixteen",   category: "numbers", emoji: "1️⃣6️⃣", translations: { es: "dieciséis",   pt: "dezesseis",it: "sedici",      fr: "seize",    zh: "十六", en: "sixteen"  } },
  { id: "seventeen", english: "Seventeen", category: "numbers", emoji: "1️⃣7️⃣", translations: { es: "diecisiete",  pt: "dezessete",it: "diciassette", fr: "dix-sept", zh: "十七", en: "seventeen"} },
  { id: "eighteen",  english: "Eighteen",  category: "numbers", emoji: "1️⃣8️⃣", translations: { es: "dieciocho",   pt: "dezoito", it: "diciotto",     fr: "dix-huit", zh: "十八", en: "eighteen" } },
  { id: "nineteen",  english: "Nineteen",  category: "numbers", emoji: "1️⃣9️⃣", translations: { es: "diecinueve",  pt: "dezenove",it: "diciannove",   fr: "dix-neuf", zh: "十九", en: "nineteen" } },
  { id: "twenty",    english: "Twenty",    category: "numbers", emoji: "2️⃣0️⃣", translations: { es: "veinte",      pt: "vinte",   it: "venti",        fr: "vingt",    zh: "二十", en: "twenty"   } },
];

// ── Animals ──────────────────────────────────────────────────────────────────
const ANIMALS: LangWord[] = [
  { id: "cat",       english: "Cat",       category: "animals", emoji: "🐱", translations: { es: "gato",      pt: "gato",      it: "gatto",      fr: "chat",       zh: "猫",   en: "cat"       } },
  { id: "dog",       english: "Dog",       category: "animals", emoji: "🐶", translations: { es: "perro",     pt: "cachorro",  it: "cane",       fr: "chien",      zh: "狗",   en: "dog"       } },
  { id: "bird",      english: "Bird",      category: "animals", emoji: "🐦", translations: { es: "pájaro",    pt: "pássaro",   it: "uccello",    fr: "oiseau",     zh: "鸟",   en: "bird"      } },
  { id: "horse",     english: "Horse",     category: "animals", emoji: "🐴", translations: { es: "caballo",   pt: "cavalo",    it: "cavallo",    fr: "cheval",     zh: "马",   en: "horse"     } },
  { id: "butterfly", english: "Butterfly", category: "animals", emoji: "🦋", translations: { es: "mariposa",  pt: "borboleta", it: "farfalla",   fr: "papillon",   zh: "蝴蝶", en: "butterfly" } },
  { id: "lion",      english: "Lion",      category: "animals", emoji: "🦁", translations: { es: "león",      pt: "leão",      it: "leone",      fr: "lion",       zh: "狮子", en: "lion"      } },
  { id: "tiger",     english: "Tiger",     category: "animals", emoji: "🐯", translations: { es: "tigre",     pt: "tigre",     it: "tigre",      fr: "tigre",      zh: "老虎", en: "tiger"     } },
  { id: "rabbit",    english: "Rabbit",    category: "animals", emoji: "🐰", translations: { es: "conejo",    pt: "coelho",    it: "coniglio",   fr: "lapin",      zh: "兔子", en: "rabbit"    } },
  { id: "snake",     english: "Snake",     category: "animals", emoji: "🐍", translations: { es: "serpiente", pt: "cobra",     it: "serpente",   fr: "serpent",    zh: "蛇",   en: "snake"     } },
  { id: "turtle",    english: "Turtle",    category: "animals", emoji: "🐢", translations: { es: "tortuga",   pt: "tartaruga", it: "tartaruga",  fr: "tortue",     zh: "乌龟", en: "turtle"    } },
  { id: "bear",      english: "Bear",      category: "animals", emoji: "🐻", translations: { es: "oso",       pt: "urso",      it: "orso",       fr: "ours",       zh: "熊",   en: "bear"      } },
  { id: "monkey",    english: "Monkey",    category: "animals", emoji: "🐒", translations: { es: "mono",      pt: "macaco",    it: "scimmia",    fr: "singe",      zh: "猴子", en: "monkey"    } },
  { id: "giraffe",   english: "Giraffe",   category: "animals", emoji: "🦒", translations: { es: "jirafa",    pt: "girafa",    it: "giraffa",    fr: "girafe",     zh: "长颈鹿", en: "giraffe" } },
  { id: "whale",     english: "Whale",     category: "animals", emoji: "🐋", translations: { es: "ballena",   pt: "baleia",    it: "balena",     fr: "baleine",    zh: "鲸鱼", en: "whale"     } },
  { id: "frog",      english: "Frog",      category: "animals", emoji: "🐸", translations: { es: "rana",      pt: "sapo",      it: "rana",       fr: "grenouille", zh: "青蛙", en: "frog"      } },
  { id: "owl",       english: "Owl",       category: "animals", emoji: "🦉", translations: { es: "búho",      pt: "coruja",    it: "gufo",       fr: "hibou",      zh: "猫头鹰", en: "owl"     } },
  { id: "bee",       english: "Bee",       category: "animals", emoji: "🐝", translations: { es: "abeja",     pt: "abelha",    it: "ape",        fr: "abeille",    zh: "蜜蜂", en: "bee"       } },
  { id: "sheep",     english: "Sheep",     category: "animals", emoji: "🐑", translations: { es: "oveja",     pt: "ovelha",    it: "pecora",     fr: "mouton",     zh: "绵羊", en: "sheep"     } },
  { id: "cow",       english: "Cow",       category: "animals", emoji: "🐄", translations: { es: "vaca",      pt: "vaca",      it: "mucca",      fr: "vache",      zh: "奶牛", en: "cow"       } },
  { id: "duck",      english: "Duck",      category: "animals", emoji: "🦆", translations: { es: "pato",      pt: "pato",      it: "anatra",     fr: "canard",     zh: "鸭子", en: "duck"      } },
  { id: "wolf",      english: "Wolf",      category: "animals", emoji: "🐺", translations: { es: "lobo",      pt: "lobo",      it: "lupo",       fr: "loup",       zh: "狼",   en: "wolf"      } },
  { id: "octopus",   english: "Octopus",   category: "animals", emoji: "🐙", translations: { es: "pulpo",     pt: "polvo",     it: "polpo",      fr: "pieuvre",    zh: "章鱼", en: "octopus"   } },
  { id: "parrot",    english: "Parrot",    category: "animals", emoji: "🦜", translations: { es: "loro",      pt: "papagaio",  it: "pappagallo", fr: "perroquet",  zh: "鹦鹉", en: "parrot"    } },
  { id: "shark",     english: "Shark",     category: "animals", emoji: "🦈", translations: { es: "tiburón",   pt: "tubarão",   it: "squalo",     fr: "requin",     zh: "鲨鱼", en: "shark"     } },
  { id: "deer",      english: "Deer",      category: "animals", emoji: "🦌", translations: { es: "ciervo",    pt: "veado",     it: "cervo",      fr: "cerf",       zh: "鹿",   en: "deer"      } },
];

// ── Food ─────────────────────────────────────────────────────────────────────
const FOOD: LangWord[] = [
  { id: "apple",      english: "Apple",      category: "food", emoji: "🍎", translations: { es: "manzana",   pt: "maçã",       it: "mela",         fr: "pomme",           zh: "苹果",  en: "apple"      } },
  { id: "bread",      english: "Bread",      category: "food", emoji: "🍞", translations: { es: "pan",       pt: "pão",        it: "pane",         fr: "pain",            zh: "面包",  en: "bread"      } },
  { id: "banana",     english: "Banana",     category: "food", emoji: "🍌", translations: { es: "plátano",   pt: "banana",     it: "banana",       fr: "banane",          zh: "香蕉",  en: "banana"     } },
  { id: "cheese",     english: "Cheese",     category: "food", emoji: "🧀", translations: { es: "queso",     pt: "queijo",     it: "formaggio",    fr: "fromage",         zh: "奶酪",  en: "cheese"     } },
  { id: "egg",        english: "Egg",        category: "food", emoji: "🥚", translations: { es: "huevo",     pt: "ovo",        it: "uovo",         fr: "œuf",             zh: "鸡蛋",  en: "egg"        } },
  { id: "cake",       english: "Cake",       category: "food", emoji: "🎂", translations: { es: "pastel",    pt: "bolo",       it: "torta",        fr: "gâteau",          zh: "蛋糕",  en: "cake"       } },
  { id: "rice",       english: "Rice",       category: "food", emoji: "🍚", translations: { es: "arroz",     pt: "arroz",      it: "riso",         fr: "riz",             zh: "米饭",  en: "rice"       } },
  { id: "chocolate",  english: "Chocolate",  category: "food", emoji: "🍫", translations: { es: "chocolate", pt: "chocolate",  it: "cioccolato",   fr: "chocolat",        zh: "巧克力", en: "chocolate" } },
  { id: "juice",      english: "Juice",      category: "food", emoji: "🥤", translations: { es: "jugo",      pt: "suco",       it: "succo",        fr: "jus",             zh: "果汁",  en: "juice"      } },
  { id: "tomato",     english: "Tomato",     category: "food", emoji: "🍅", translations: { es: "tomate",    pt: "tomate",     it: "pomodoro",     fr: "tomate",          zh: "番茄",  en: "tomato"     } },
  { id: "milk",       english: "Milk",       category: "food", emoji: "🥛", translations: { es: "leche",     pt: "leite",      it: "latte",        fr: "lait",            zh: "牛奶",  en: "milk"       } },
  { id: "water",      english: "Water",      category: "food", emoji: "💧", translations: { es: "agua",      pt: "água",       it: "acqua",        fr: "eau",             zh: "水",    en: "water"      } },
  { id: "coffee",     english: "Coffee",     category: "food", emoji: "☕", translations: { es: "café",      pt: "café",       it: "caffè",        fr: "café",            zh: "咖啡",  en: "coffee"     } },
  { id: "tea",        english: "Tea",        category: "food", emoji: "🍵", translations: { es: "té",        pt: "chá",        it: "tè",           fr: "thé",             zh: "茶",    en: "tea"        } },
  { id: "soup",       english: "Soup",       category: "food", emoji: "🍲", translations: { es: "sopa",      pt: "sopa",       it: "zuppa",        fr: "soupe",           zh: "汤",    en: "soup"       } },
  { id: "chicken",    english: "Chicken",    category: "food", emoji: "🍗", translations: { es: "pollo",     pt: "frango",     it: "pollo",        fr: "poulet",          zh: "鸡肉",  en: "chicken"    } },
  { id: "potato",     english: "Potato",     category: "food", emoji: "🥔", translations: { es: "papa",      pt: "batata",     it: "patata",       fr: "pomme de terre",  zh: "土豆",  en: "potato"     } },
  { id: "carrot",     english: "Carrot",     category: "food", emoji: "🥕", translations: { es: "zanahoria", pt: "cenoura",    it: "carota",       fr: "carotte",         zh: "胡萝卜", en: "carrot"    } },
  { id: "strawberry", english: "Strawberry", category: "food", emoji: "🍓", translations: { es: "fresa",     pt: "morango",    it: "fragola",      fr: "fraise",          zh: "草莓",  en: "strawberry" } },
  { id: "lemon",      english: "Lemon",      category: "food", emoji: "🍋", translations: { es: "limón",     pt: "limão",      it: "limone",       fr: "citron",          zh: "柠檬",  en: "lemon"      } },
  { id: "ice-cream",  english: "Ice cream",  category: "food", emoji: "🍦", translations: { es: "helado",    pt: "sorvete",    it: "gelato",       fr: "glace",           zh: "冰淇淋", en: "ice cream" } },
  { id: "cookie",     english: "Cookie",     category: "food", emoji: "🍪", translations: { es: "galleta",   pt: "biscoito",   it: "biscotto",     fr: "biscuit",         zh: "饼干",  en: "cookie"     } },
  { id: "mushroom",   english: "Mushroom",   category: "food", emoji: "🍄", translations: { es: "hongo",     pt: "cogumelo",   it: "fungo",        fr: "champignon",      zh: "蘑菇",  en: "mushroom"   } },
  { id: "corn",       english: "Corn",       category: "food", emoji: "🌽", translations: { es: "maíz",      pt: "milho",      it: "mais",         fr: "maïs",            zh: "玉米",  en: "corn"       } },
  { id: "mango",      english: "Mango",      category: "food", emoji: "🥭", translations: { es: "mango",     pt: "manga",      it: "mango",        fr: "mangue",          zh: "芒果",  en: "mango"      } },
];

// ── Family ───────────────────────────────────────────────────────────────────
const FAMILY: LangWord[] = [
  { id: "mom",         english: "Mom",         category: "family", emoji: "👩",     translations: { es: "mamá",       pt: "mãe",     it: "mamma",       fr: "maman",      zh: "妈妈", en: "mom"         } },
  { id: "dad",         english: "Dad",         category: "family", emoji: "👨",     translations: { es: "papá",       pt: "pai",     it: "papà",        fr: "papa",       zh: "爸爸", en: "dad"         } },
  { id: "brother",     english: "Brother",     category: "family", emoji: "👦",     translations: { es: "hermano",    pt: "irmão",   it: "fratello",    fr: "frère",      zh: "哥哥", en: "brother"     } },
  { id: "sister",      english: "Sister",      category: "family", emoji: "👧",     translations: { es: "hermana",    pt: "irmã",    it: "sorella",     fr: "sœur",       zh: "姐姐", en: "sister"      } },
  { id: "baby",        english: "Baby",        category: "family", emoji: "👶",     translations: { es: "bebé",       pt: "bebê",    it: "bambino",     fr: "bébé",       zh: "宝宝", en: "baby"        } },
  { id: "grandmother", english: "Grandmother", category: "family", emoji: "👵",     translations: { es: "abuela",     pt: "avó",     it: "nonna",       fr: "grand-mère", zh: "奶奶", en: "grandmother" } },
  { id: "grandfather", english: "Grandfather", category: "family", emoji: "👴",     translations: { es: "abuelo",     pt: "avô",     it: "nonno",       fr: "grand-père", zh: "爷爷", en: "grandfather" } },
  { id: "son",         english: "Son",         category: "family", emoji: "🧒",     translations: { es: "hijo",       pt: "filho",   it: "figlio",      fr: "fils",       zh: "儿子", en: "son"         } },
  { id: "daughter",    english: "Daughter",    category: "family", emoji: "👧",     translations: { es: "hija",       pt: "filha",   it: "figlia",      fr: "fille",      zh: "女儿", en: "daughter"    } },
  { id: "family",      english: "Family",      category: "family", emoji: "👨‍👩‍👧‍👦", translations: { es: "familia",    pt: "família", it: "famiglia",    fr: "famille",    zh: "家人", en: "family"      } },
  { id: "aunt",        english: "Aunt",        category: "family", emoji: "👩",     translations: { es: "tía",        pt: "tia",     it: "zia",         fr: "tante",      zh: "阿姨", en: "aunt"        } },
  { id: "uncle",       english: "Uncle",       category: "family", emoji: "👨",     translations: { es: "tío",        pt: "tio",     it: "zio",         fr: "oncle",      zh: "叔叔", en: "uncle"       } },
  { id: "cousin",      english: "Cousin",      category: "family", emoji: "🧑",     translations: { es: "primo",      pt: "primo",   it: "cugino",      fr: "cousin",     zh: "表兄弟", en: "cousin"    } },
  { id: "friend",      english: "Friend",      category: "family", emoji: "🤝",     translations: { es: "amigo",      pt: "amigo",   it: "amico",       fr: "ami",        zh: "朋友", en: "friend"      } },
  { id: "teacher",     english: "Teacher",     category: "family", emoji: "🍎",     translations: { es: "maestro",    pt: "professor",it: "insegnante", fr: "professeur", zh: "老师", en: "teacher"     } },
  { id: "husband",     english: "Husband",     category: "family", emoji: "🤵",     translations: { es: "esposo",     pt: "marido",  it: "marito",      fr: "mari",       zh: "丈夫", en: "husband"     } },
  { id: "wife",        english: "Wife",        category: "family", emoji: "👰",     translations: { es: "esposa",     pt: "esposa",  it: "moglie",      fr: "femme",      zh: "妻子", en: "wife"        } },
  { id: "neighbor",    english: "Neighbor",    category: "family", emoji: "🏘️",     translations: { es: "vecino",     pt: "vizinho", it: "vicino",      fr: "voisin",     zh: "邻居", en: "neighbor"    } },
  { id: "twins",       english: "Twins",       category: "family", emoji: "👯",     translations: { es: "gemelos",    pt: "gêmeos",  it: "gemelli",     fr: "jumeaux",    zh: "双胞胎", en: "twins"     } },
];

export const LANG_WORDS: LangWord[] = [
  ...OBJECTS,
  ...SAYINGS,
  ...COLORS,
  ...NUMBERS,
  ...ANIMALS,
  ...FOOD,
  ...FAMILY,
];

export type CategorySlug = "objects" | "sayings" | "colors" | "numbers" | "animals" | "food" | "family";

export type CategoryDef = {
  slug: CategorySlug;
  label: string;
  emoji: string;
  accent: string;
};

export const LANG_CATEGORIES: CategoryDef[] = [
  { slug: "objects",  label: "Objects",  emoji: "📚", accent: "#6366f1" },
  { slug: "sayings",  label: "Sayings",  emoji: "💬", accent: "#ec4899" },
  { slug: "colors",   label: "Colors",   emoji: "🎨", accent: "#f97316" },
  { slug: "numbers",  label: "Numbers",  emoji: "🔢", accent: "#8b5cf6" },
  { slug: "animals",  label: "Animals",  emoji: "🐾", accent: "#22c55e" },
  { slug: "food",     label: "Food",     emoji: "🍎", accent: "#ef4444" },
  { slug: "family",   label: "Family",   emoji: "👨‍👩‍👧", accent: "#f59e0b" },
];

export const LANG_CONFIG: Record<LangCode, { name: string; flag: string; accent: string; speechCode: string }> = {
  es: { name: "Spanish",    flag: "🇪🇸", accent: "#C60B1E", speechCode: "es-ES" },
  pt: { name: "Portuguese", flag: "🇧🇷", accent: "#009C3B", speechCode: "pt-BR" },
  it: { name: "Italian",    flag: "🇮🇹", accent: "#009246", speechCode: "it-IT" },
  fr: { name: "French",     flag: "🇫🇷", accent: "#002395", speechCode: "fr-FR" },
  zh: { name: "Chinese",    flag: "🇨🇳", accent: "#DE2910", speechCode: "zh-CN" },
  en: { name: "English",    flag: "🇺🇸", accent: "#3C3B6E", speechCode: "en-US" },
};

export function getWordsByCategory(slug: CategorySlug): LangWord[] {
  return LANG_WORDS.filter((w) => w.category === slug);
}

// ── Progress tracking ─────────────────────────────────────────────────────────

export const MASTERY_THRESHOLD = 2;
const STORAGE_KEY = "jang-lang-progress";

export type ProgressStore = Record<string, Record<string, number>>;

export function loadProgress(): ProgressStore {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}"); }
  catch { return {}; }
}

export function saveProgress(store: ProgressStore): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

export function recordCorrect(store: ProgressStore, lang: LangCode, wordId: string): ProgressStore {
  const count = store[lang]?.[wordId] ?? 0;
  return { ...store, [lang]: { ...(store[lang] ?? {}), [wordId]: count + 1 } };
}

export function isMastered(store: ProgressStore, lang: LangCode, wordId: string): boolean {
  return (store[lang]?.[wordId] ?? 0) >= MASTERY_THRESHOLD;
}

export function getCategoryMastery(
  store: ProgressStore, lang: LangCode, slug: CategorySlug
): { mastered: number; total: number } {
  const words = getWordsByCategory(slug);
  return { mastered: words.filter((w) => isMastered(store, lang, w.id)).length, total: words.length };
}
