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

// ── Objects (book vocabulary with real illustrations) ────────────────────────
const OBJECTS: LangWord[] = [
  {
    id: "fox", english: "Fox", category: "objects", image: asset("/characters/FOX 1.png"),
    translations: { es: "zorro", pt: "raposa", it: "volpe", fr: "renard", zh: "狐狸", en: "fox" },
  },
  {
    id: "fish", english: "Fish", category: "objects", image: asset("/book-objects/flying-fish.png"),
    translations: { es: "pez", pt: "peixe", it: "pesce", fr: "poisson", zh: "鱼", en: "fish" },
  },
  {
    id: "drum", english: "Drum", category: "objects", image: asset("/book-objects/jamaica-steel-drum.png"),
    translations: { es: "tambor", pt: "tambor", it: "tamburo", fr: "tambour", zh: "鼓", en: "drum" },
  },
  {
    id: "tuba", english: "Tuba", category: "objects", image: asset("/book-objects/tuba.png"),
    translations: { es: "tuba", pt: "tuba", it: "tuba", fr: "tuba", zh: "大号", en: "tuba" },
  },
  {
    id: "mask", english: "Mask", category: "objects", image: asset("/book-objects/KOREA-MASK.png"),
    translations: { es: "máscara", pt: "máscara", it: "maschera", fr: "masque", zh: "面具", en: "mask" },
  },
  {
    id: "skis", english: "Skis", category: "objects", image: asset("/book-objects/swiss-skiis.png"),
    translations: { es: "esquís", pt: "esquis", it: "sci", fr: "skis", zh: "滑雪板", en: "skis" },
  },
  {
    id: "pizza", english: "Pizza", category: "objects", image: asset("/book-objects/pizza.png"),
    translations: { es: "pizza", pt: "pizza", it: "pizza", fr: "pizza", zh: "披萨", en: "pizza" },
  },
  {
    id: "plane", english: "Plane", category: "objects", image: asset("/book-objects/plane.png"),
    translations: { es: "avión", pt: "avião", it: "aereo", fr: "avion", zh: "飞机", en: "plane" },
  },
  {
    id: "compass", english: "Compass", category: "objects", image: asset("/book-objects/compass.png"),
    translations: { es: "brújula", pt: "bússola", it: "bussola", fr: "boussole", zh: "指南针", en: "compass" },
  },
  {
    id: "penguin", english: "Penguin", category: "objects", image: asset("/book-objects/SOUTH-AFRICA-PENGUIN.png"),
    translations: { es: "pingüino", pt: "pinguim", it: "pinguino", fr: "pingouin", zh: "企鹅", en: "penguin" },
  },
  {
    id: "elephant", english: "Elephant", category: "objects", image: asset("/book-objects/ELEPHANT.png"),
    translations: { es: "elefante", pt: "elefante", it: "elefante", fr: "éléphant", zh: "大象", en: "elephant" },
  },
  {
    id: "sombrero", english: "Sombrero", category: "objects", image: asset("/book-objects/mexico-hat.png"),
    translations: { es: "sombrero", pt: "sombrero", it: "sombrero", fr: "sombrero", zh: "宽边帽", en: "sombrero" },
  },
];

// ── Sayings ──────────────────────────────────────────────────────────────────
const SAYINGS: LangWord[] = [
  {
    id: "hello", english: "Hello", category: "sayings", emoji: "👋",
    translations: { es: "hola", pt: "olá", it: "ciao", fr: "bonjour", zh: "你好", en: "hello" },
  },
  {
    id: "goodbye", english: "Goodbye", category: "sayings", emoji: "👋",
    translations: { es: "adiós", pt: "tchau", it: "arrivederci", fr: "au revoir", zh: "再见", en: "goodbye" },
  },
  {
    id: "thank-you", english: "Thank you", category: "sayings", emoji: "🙏",
    translations: { es: "gracias", pt: "obrigado", it: "grazie", fr: "merci", zh: "谢谢", en: "thank you" },
  },
  {
    id: "please", english: "Please", category: "sayings", emoji: "🤲",
    translations: { es: "por favor", pt: "por favor", it: "per favore", fr: "s'il vous plaît", zh: "请", en: "please" },
  },
  {
    id: "yes", english: "Yes", category: "sayings", emoji: "✅",
    translations: { es: "sí", pt: "sim", it: "sì", fr: "oui", zh: "是", en: "yes" },
  },
  {
    id: "no", english: "No", category: "sayings", emoji: "❌",
    translations: { es: "no", pt: "não", it: "no", fr: "non", zh: "不", en: "no" },
  },
  {
    id: "sorry", english: "Sorry", category: "sayings", emoji: "😔",
    translations: { es: "lo siento", pt: "desculpe", it: "mi dispiace", fr: "désolé", zh: "对不起", en: "sorry" },
  },
  {
    id: "excuse-me", english: "Excuse me", category: "sayings", emoji: "🙋",
    translations: { es: "perdón", pt: "com licença", it: "scusa", fr: "pardon", zh: "不好意思", en: "excuse me" },
  },
  {
    id: "how-are-you", english: "How are you?", category: "sayings", emoji: "😊",
    translations: { es: "¿cómo estás?", pt: "como vai?", it: "come stai?", fr: "comment ça va?", zh: "你好吗？", en: "how are you?" },
  },
  {
    id: "i-love-you", english: "I love you", category: "sayings", emoji: "❤️",
    translations: { es: "te quiero", pt: "eu te amo", it: "ti voglio bene", fr: "je t'aime", zh: "我爱你", en: "i love you" },
  },
  {
    id: "good-morning", english: "Good morning", category: "sayings", emoji: "🌅",
    translations: { es: "buenos días", pt: "bom dia", it: "buongiorno", fr: "bonjour", zh: "早上好", en: "good morning" },
  },
  {
    id: "good-night", english: "Good night", category: "sayings", emoji: "🌙",
    translations: { es: "buenas noches", pt: "boa noite", it: "buonanotte", fr: "bonne nuit", zh: "晚安", en: "good night" },
  },
];

// ── Colors ───────────────────────────────────────────────────────────────────
const COLORS: LangWord[] = [
  { id: "red",    english: "Red",    category: "colors", emoji: "🔴", translations: { es: "rojo",     pt: "vermelho", it: "rosso",     fr: "rouge",  zh: "红色", en: "red"    } },
  { id: "blue",   english: "Blue",   category: "colors", emoji: "🔵", translations: { es: "azul",     pt: "azul",     it: "blu",       fr: "bleu",   zh: "蓝色", en: "blue"   } },
  { id: "green",  english: "Green",  category: "colors", emoji: "🟢", translations: { es: "verde",    pt: "verde",    it: "verde",     fr: "vert",   zh: "绿色", en: "green"  } },
  { id: "yellow", english: "Yellow", category: "colors", emoji: "🟡", translations: { es: "amarillo", pt: "amarelo",  it: "giallo",    fr: "jaune",  zh: "黄色", en: "yellow" } },
  { id: "orange", english: "Orange", category: "colors", emoji: "🟠", translations: { es: "naranja",  pt: "laranja",  it: "arancione", fr: "orange", zh: "橙色", en: "orange" } },
  { id: "purple", english: "Purple", category: "colors", emoji: "🟣", translations: { es: "morado",   pt: "roxo",     it: "viola",     fr: "violet", zh: "紫色", en: "purple" } },
  { id: "pink",   english: "Pink",   category: "colors", emoji: "🩷", translations: { es: "rosa",     pt: "rosa",     it: "rosa",      fr: "rose",   zh: "粉色", en: "pink"   } },
  { id: "white",  english: "White",  category: "colors", emoji: "⬜", translations: { es: "blanco",   pt: "branco",   it: "bianco",    fr: "blanc",  zh: "白色", en: "white"  } },
  { id: "black",  english: "Black",  category: "colors", emoji: "⬛", translations: { es: "negro",    pt: "preto",    it: "nero",      fr: "noir",   zh: "黑色", en: "black"  } },
  { id: "brown",  english: "Brown",  category: "colors", emoji: "🟤", translations: { es: "marrón",   pt: "marrom",   it: "marrone",   fr: "marron", zh: "棕色", en: "brown"  } },
];

// ── Numbers ──────────────────────────────────────────────────────────────────
const NUMBERS: LangWord[] = [
  { id: "one",   english: "One",   category: "numbers", emoji: "1️⃣", translations: { es: "uno",    pt: "um",     it: "uno",     fr: "un",     zh: "一", en: "one"   } },
  { id: "two",   english: "Two",   category: "numbers", emoji: "2️⃣", translations: { es: "dos",    pt: "dois",   it: "due",     fr: "deux",   zh: "二", en: "two"   } },
  { id: "three", english: "Three", category: "numbers", emoji: "3️⃣", translations: { es: "tres",   pt: "três",   it: "tre",     fr: "trois",  zh: "三", en: "three" } },
  { id: "four",  english: "Four",  category: "numbers", emoji: "4️⃣", translations: { es: "cuatro", pt: "quatro", it: "quattro", fr: "quatre", zh: "四", en: "four"  } },
  { id: "five",  english: "Five",  category: "numbers", emoji: "5️⃣", translations: { es: "cinco",  pt: "cinco",  it: "cinque",  fr: "cinq",   zh: "五", en: "five"  } },
  { id: "six",   english: "Six",   category: "numbers", emoji: "6️⃣", translations: { es: "seis",   pt: "seis",   it: "sei",     fr: "six",    zh: "六", en: "six"   } },
  { id: "seven", english: "Seven", category: "numbers", emoji: "7️⃣", translations: { es: "siete",  pt: "sete",   it: "sette",   fr: "sept",   zh: "七", en: "seven" } },
  { id: "eight", english: "Eight", category: "numbers", emoji: "8️⃣", translations: { es: "ocho",   pt: "oito",   it: "otto",    fr: "huit",   zh: "八", en: "eight" } },
  { id: "nine",  english: "Nine",  category: "numbers", emoji: "9️⃣", translations: { es: "nueve",  pt: "nove",   it: "nove",    fr: "neuf",   zh: "九", en: "nine"  } },
  { id: "ten",   english: "Ten",   category: "numbers", emoji: "🔟", translations: { es: "diez",   pt: "dez",    it: "dieci",   fr: "dix",    zh: "十", en: "ten"   } },
];

// ── Animals ──────────────────────────────────────────────────────────────────
const ANIMALS: LangWord[] = [
  { id: "cat",       english: "Cat",       category: "animals", emoji: "🐱", translations: { es: "gato",      pt: "gato",      it: "gatto",     fr: "chat",     zh: "猫",  en: "cat"       } },
  { id: "dog",       english: "Dog",       category: "animals", emoji: "🐶", translations: { es: "perro",     pt: "cachorro",  it: "cane",      fr: "chien",    zh: "狗",  en: "dog"       } },
  { id: "bird",      english: "Bird",      category: "animals", emoji: "🐦", translations: { es: "pájaro",    pt: "pássaro",   it: "uccello",   fr: "oiseau",   zh: "鸟",  en: "bird"      } },
  { id: "horse",     english: "Horse",     category: "animals", emoji: "🐴", translations: { es: "caballo",   pt: "cavalo",    it: "cavallo",   fr: "cheval",   zh: "马",  en: "horse"     } },
  { id: "butterfly", english: "Butterfly", category: "animals", emoji: "🦋", translations: { es: "mariposa",  pt: "borboleta", it: "farfalla",  fr: "papillon", zh: "蝴蝶", en: "butterfly" } },
  { id: "lion",      english: "Lion",      category: "animals", emoji: "🦁", translations: { es: "león",      pt: "leão",      it: "leone",     fr: "lion",     zh: "狮子", en: "lion"      } },
  { id: "tiger",     english: "Tiger",     category: "animals", emoji: "🐯", translations: { es: "tigre",     pt: "tigre",     it: "tigre",     fr: "tigre",    zh: "老虎", en: "tiger"     } },
  { id: "rabbit",    english: "Rabbit",    category: "animals", emoji: "🐰", translations: { es: "conejo",    pt: "coelho",    it: "coniglio",  fr: "lapin",    zh: "兔子", en: "rabbit"    } },
  { id: "snake",     english: "Snake",     category: "animals", emoji: "🐍", translations: { es: "serpiente", pt: "cobra",     it: "serpente",  fr: "serpent",  zh: "蛇",  en: "snake"     } },
  { id: "turtle",    english: "Turtle",    category: "animals", emoji: "🐢", translations: { es: "tortuga",   pt: "tartaruga", it: "tartaruga", fr: "tortue",   zh: "乌龟", en: "turtle"    } },
];

// ── Food ─────────────────────────────────────────────────────────────────────
const FOOD: LangWord[] = [
  { id: "apple",     english: "Apple",     category: "food", emoji: "🍎", translations: { es: "manzana",  pt: "maçã",      it: "mela",       fr: "pomme",    zh: "苹果",  en: "apple"     } },
  { id: "bread",     english: "Bread",     category: "food", emoji: "🍞", translations: { es: "pan",      pt: "pão",       it: "pane",       fr: "pain",     zh: "面包",  en: "bread"     } },
  { id: "banana",    english: "Banana",    category: "food", emoji: "🍌", translations: { es: "plátano",  pt: "banana",    it: "banana",     fr: "banane",   zh: "香蕉",  en: "banana"    } },
  { id: "cheese",    english: "Cheese",    category: "food", emoji: "🧀", translations: { es: "queso",    pt: "queijo",    it: "formaggio",  fr: "fromage",  zh: "奶酪",  en: "cheese"    } },
  { id: "egg",       english: "Egg",       category: "food", emoji: "🥚", translations: { es: "huevo",    pt: "ovo",       it: "uovo",       fr: "œuf",      zh: "鸡蛋",  en: "egg"       } },
  { id: "cake",      english: "Cake",      category: "food", emoji: "🎂", translations: { es: "pastel",   pt: "bolo",      it: "torta",      fr: "gâteau",   zh: "蛋糕",  en: "cake"      } },
  { id: "rice",      english: "Rice",      category: "food", emoji: "🍚", translations: { es: "arroz",    pt: "arroz",     it: "riso",       fr: "riz",      zh: "米饭",  en: "rice"      } },
  { id: "chocolate", english: "Chocolate", category: "food", emoji: "🍫", translations: { es: "chocolate",pt: "chocolate", it: "cioccolato", fr: "chocolat", zh: "巧克力", en: "chocolate" } },
  { id: "juice",     english: "Juice",     category: "food", emoji: "🥤", translations: { es: "jugo",     pt: "suco",      it: "succo",      fr: "jus",      zh: "果汁",  en: "juice"     } },
  { id: "tomato",    english: "Tomato",    category: "food", emoji: "🍅", translations: { es: "tomate",   pt: "tomate",    it: "pomodoro",   fr: "tomate",   zh: "番茄",  en: "tomato"    } },
];

// ── Family ───────────────────────────────────────────────────────────────────
const FAMILY: LangWord[] = [
  { id: "mom",         english: "Mom",         category: "family", emoji: "👩", translations: { es: "mamá",       pt: "mãe",    it: "mamma",       fr: "maman",      zh: "妈妈", en: "mom"         } },
  { id: "dad",         english: "Dad",         category: "family", emoji: "👨", translations: { es: "papá",       pt: "pai",    it: "papà",        fr: "papa",       zh: "爸爸", en: "dad"         } },
  { id: "brother",     english: "Brother",     category: "family", emoji: "👦", translations: { es: "hermano",    pt: "irmão",  it: "fratello",    fr: "frère",      zh: "哥哥", en: "brother"     } },
  { id: "sister",      english: "Sister",      category: "family", emoji: "👧", translations: { es: "hermana",    pt: "irmã",   it: "sorella",     fr: "sœur",       zh: "姐姐", en: "sister"      } },
  { id: "baby",        english: "Baby",        category: "family", emoji: "👶", translations: { es: "bebé",       pt: "bebê",   it: "bambino",     fr: "bébé",       zh: "宝宝", en: "baby"        } },
  { id: "grandmother", english: "Grandmother", category: "family", emoji: "👵", translations: { es: "abuela",     pt: "avó",    it: "nonna",       fr: "grand-mère", zh: "奶奶", en: "grandmother" } },
  { id: "grandfather", english: "Grandfather", category: "family", emoji: "👴", translations: { es: "abuelo",     pt: "avô",    it: "nonno",       fr: "grand-père", zh: "爷爷", en: "grandfather" } },
  { id: "son",         english: "Son",         category: "family", emoji: "🧒", translations: { es: "hijo",       pt: "filho",  it: "figlio",      fr: "fils",       zh: "儿子", en: "son"         } },
  { id: "daughter",    english: "Daughter",    category: "family", emoji: "👧", translations: { es: "hija",       pt: "filha",  it: "figlia",      fr: "fille",      zh: "女儿", en: "daughter"    } },
  { id: "family",      english: "Family",      category: "family", emoji: "👨‍👩‍👧‍👦", translations: { es: "familia",    pt: "família",it: "famiglia",    fr: "famille",    zh: "家人", en: "family"      } },
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
