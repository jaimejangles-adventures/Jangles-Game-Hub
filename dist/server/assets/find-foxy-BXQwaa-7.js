import { r as reactExports, V as jsxRuntimeExports } from "./server-HtPeGmJD.js";
import { u as useStamps, m as motion, a as burstCorrect, b as burstFinale, e as exclamHurray, c as exclamWayToGo, d as exclamYouDidIt, f as exclamYouGotIt } from "./JEFF_-_Exclamations_-_You_got_it_-DDyK2YH4.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
const findFoxyMusic = "/assets/FIND_FOXY_1-BH1Ycm6w.wav";
const planeImg = "/assets/plane-DsPgG9Xe.png";
const foxyLogo = "/assets/FOX%201-BG98qB3m.png";
const FIND_FOXY_FLAGS = {
  Argentina: "🇦🇷",
  Australia: "🇦🇺",
  Barbados: "🇧🇧",
  France: "🇫🇷",
  Ghana: "🇬🇭",
  Indonesia: "🇮🇩",
  Italy: "🇮🇹",
  Jamaica: "🇯🇲",
  Japan: "🇯🇵",
  Kenya: "🇰🇪",
  Mexico: "🇲🇽",
  Nepal: "🇳🇵",
  Peru: "🇵🇪",
  "South Africa": "🇿🇦",
  "South Korea": "🇰🇷",
  Spain: "🇪🇸",
  "Sri Lanka": "🇱🇰",
  Switzerland: "🇨🇭",
  "United Kingdom": "🇬🇧",
  USA: "🇺🇸",
  Brazil: "🇧🇷",
  Chile: "🇨🇱",
  Colombia: "🇨🇴",
  "New Zealand": "🇳🇿",
  China: "🇨🇳",
  India: "🇮🇳",
  Austria: "🇦🇹",
  Germany: "🇩🇪",
  Ireland: "🇮🇪",
  Canada: "🇨🇦"
};
const FIND_FOXY_COUNTRIES = [
  {
    name: "Argentina",
    beginner: {
      casey: "Which country is so famous for the Tango dance that people come from all over the world just to learn it?",
      clues: [
        { e: "💃", t: "People here do a beautiful dance called the Tango!" },
        { e: "⚽", t: "Soccer is the favourite sport here and they have won the World Cup!" },
        { e: "⛰️", t: "This country has the biggest mountains in South America called the Andes!" }
      ]
    },
    intermediate: {
      casey: "Which South American country is the birthplace of the Tango dance and home to the famous Buenos Aires?",
      clues: [
        { e: "💃", t: "The Tango dance was invented here and started in the capital city, Buenos Aires!" },
        { e: "⚽", t: "This country has won the FIFA World Cup and is amazing at football!" },
        { e: "🥩", t: "People here love to eat beef and have big barbecues called asados!" }
      ]
    },
    advanced: {
      casey: "Which South American country has a capital whose name means 'fair winds' in Spanish and gave the world the Tango?",
      clues: [
        { e: "🏙️", t: "The capital city means 'fair winds' in Spanish and is one of South America's most vibrant cities!" },
        { e: "💃", t: "The Tango was invented here and is now a UNESCO World Cultural Heritage dance!" },
        { e: "🌎", t: "This is the 8th largest country in the world and shares the Andes mountains with its neighbour to the west!" }
      ]
    },
    distractors: ["Brazil", "Chile", "Peru", "Colombia"],
    fact: "Argentina is the birthplace of the Tango! Capital: Buenos Aires, which means 'fair winds'. They have also won the World Cup! 💃"
  },
  {
    name: "Australia",
    beginner: {
      casey: "Which country has animals that carry their babies in a special pouch and can hop faster than you can run?",
      clues: [
        { e: "🦘", t: "Kangaroos live here and carry babies in a pouch!" },
        { e: "🐨", t: "Fluffy koalas sleep in eucalyptus trees here!" },
        { e: "🎾", t: "Jaime and Zany Dad Jeff played tennis in Melbourne in this country!" }
      ]
    },
    intermediate: {
      casey: "Which country is the only place on Earth where kangaroos live in the wild, and has the world's biggest coral reef?",
      clues: [
        { e: "🦘", t: "Kangaroos only live in this country. You will not find them wild anywhere else!" },
        { e: "🎾", t: "A famous tennis tournament called the Australian Open is held in Melbourne here!" },
        { e: "🌊", t: "The Great Barrier Reef, the world's biggest coral reef, is found here!" }
      ]
    },
    advanced: {
      casey: "Which country has its capital in Canberra, yet its most famous city is Sydney — and there are more kangaroos than people?",
      clues: [
        { e: "🏛️", t: "The capital is Canberra, but Sydney and Melbourne are bigger and more famous cities!" },
        { e: "🦘", t: "Kangaroos only exist here and there are actually more kangaroos than people in this country!" },
        { e: "🎾", t: "Jaime and Zany Dad Jeff played tennis in Melbourne at the famous Australian Open!" }
      ]
    },
    distractors: ["New Zealand", "Indonesia", "South Africa", "Canada"],
    fact: "Kangaroos only exist in Australia! Capital: Canberra. Home of the Great Barrier Reef and the Melbourne tennis Open! 🦘"
  },
  {
    name: "Barbados",
    beginner: {
      casey: "Which tiny Caribbean island has a national symbol that leaps right out of the sea and actually glides through the air?",
      clues: [
        { e: "🐟", t: "The national symbol of this island is a fish that can leap and glide through the air!" },
        { e: "🌊", t: "This is a beautiful Caribbean island surrounded by warm turquoise water!" },
        { e: "🎣", t: "Jaime and Zany Dad Jeff went fishing here in a place called Oistins!" }
      ]
    },
    intermediate: {
      casey: "Which Caribbean island is famous for its flying fish national symbol, and is also the birthplace of superstar Rihanna?",
      clues: [
        { e: "🐟", t: "The flying fish is the national symbol of this small Caribbean island!" },
        { e: "🌴", t: "This island was ruled by England for a very long time before becoming fully independent!" },
        { e: "🎤", t: "The world-famous singer Rihanna was born and grew up on this island!" }
      ]
    },
    advanced: {
      casey: "Which Caribbean island nation has its capital in Bridgetown and made history in 2021 by becoming a republic?",
      clues: [
        { e: "🏙️", t: "The capital city is Bridgetown, one of the oldest cities built by Europeans in the Americas!" },
        { e: "🐟", t: "The flying fish is the national symbol and appears on stamps, money, and the coat of arms!" },
        { e: "🌍", t: "This island made history in 2021 by removing the monarchy and becoming a fully independent republic!" }
      ]
    },
    distractors: ["Jamaica", "Brazil", "Colombia", "Mexico"],
    fact: "Barbados is a Caribbean island whose national symbol is the flying fish! Capital: Bridgetown. Rihanna is from here! 🐟"
  },
  {
    name: "France",
    beginner: {
      casey: "Which country has a very tall iron tower that is one of the most famous landmarks in the whole world?",
      clues: [
        { e: "🗼", t: "There is a very tall tower made of iron here that is famous around the world!" },
        { e: "🥐", t: "People here eat yummy crescent-shaped bread called croissants for breakfast!" },
        { e: "🎈", t: "Jaime and Zany Dad Jeff rode a hot air balloon near the famous iron tower here!" }
      ]
    },
    intermediate: {
      casey: "Which European country is known as the City of Light and makes over 1,500 types of cheese — more than anywhere else on Earth?",
      clues: [
        { e: "🗼", t: "The Eiffel Tower in Paris is one of the most visited places in the whole world!" },
        { e: "🧀", t: "This country makes over 1,500 types of cheese, more than any other country on Earth!" },
        { e: "🎨", t: "This country is famous for amazing art. One museum here holds the Mona Lisa!" }
      ]
    },
    advanced: {
      casey: "Which European country's capital is known as the City of Light, and where bonjour is how you say hello?",
      clues: [
        { e: "🏙️", t: "The capital is Paris, one of the most visited cities on Earth, known as the City of Light!" },
        { e: "🧀", t: "This country produces over 1,500 types of cheese, more than anywhere else on Earth!" },
        { e: "🗼", t: "The Eiffel Tower was built in 1889 as a temporary structure, but people loved it so much they kept it!" }
      ]
    },
    distractors: ["Spain", "Italy", "United Kingdom", "Switzerland"],
    fact: "France has the Eiffel Tower in Paris and produces over 1,500 types of cheese! Capital: Paris, the City of Light! 🗼"
  },
  {
    name: "Ghana",
    beginner: {
      casey: "Which West African country was the very first in all of Africa to gain its independence?",
      clues: [
        { e: "⭐", t: "This flag has red, gold, and green stripes with a black star in the middle!" },
        { e: "💍", t: "Jaime and Zany Dad Jeff visited a colourful jewellery market here in a city called Accra!" },
        { e: "🌍", t: "This country in West Africa was the very first in Africa to gain independence!" }
      ]
    },
    intermediate: {
      casey: "Which African country has a capital called Accra, a flag with a bold black star, and the famous Azonto dance?",
      clues: [
        { e: "⭐", t: "This was the first country in all of Africa to gain its independence, a hugely important moment!" },
        { e: "💃", t: "A popular song and dance called the Azonto comes from here and is so much fun!" },
        { e: "🎨", t: "This country is famous for colourful Kente cloth worn at celebrations!" }
      ]
    },
    advanced: {
      casey: "Which West African country is famous for its colourful Kente cloth and is one of the world's biggest producers of cocoa?",
      clues: [
        { e: "🏙️", t: "The capital is Accra. Jaime and Zany Dad Jeff visited its famous colourful jewellery market!" },
        { e: "💃", t: "The Azonto spread from this country all over Africa and the world!" },
        { e: "🍫", t: "This country is one of the world's biggest producers of cocoa, the main ingredient in chocolate!" }
      ]
    },
    distractors: ["South Africa", "Kenya", "Colombia", "Brazil"],
    fact: "Ghana was the first African country to gain independence! Capital: Accra, famous for the Azonto dance and Kente cloth! 🌍"
  },
  {
    name: "Indonesia",
    beginner: {
      casey: "Which country is made up of more than 17,000 islands — more than any other country in the entire world?",
      clues: [
        { e: "🏝️", t: "This country is made up of thousands and thousands of islands, more than any other!" },
        { e: "🎨", t: "Jaime and Zany Dad Jeff visited their friend Bima in Bali and did drawings together!" },
        { e: "🎵", t: "A musical instrument called a gamelan is played here and sounds a bit like a xylophone!" }
      ]
    },
    intermediate: {
      casey: "Which is the largest island country on Earth, home to over 17,000 islands and the beautiful island of Bali?",
      clues: [
        { e: "🏝️", t: "This country is made up of over 17,000 islands and is the largest island country in the world!" },
        { e: "🎵", t: "The gamelan is a traditional instrument here and makes a magical sound with bells and drums!" },
        { e: "👥", t: "This is the 4th most populated country in the world with over 270 million people!" }
      ]
    },
    advanced: {
      casey: "Which Southeast Asian country has a capital called Jakarta, over 17,000 islands, and is home to the world's largest lizard?",
      clues: [
        { e: "🏙️", t: "The capital is Jakarta, though this country is moving its capital to a new city called Nusantara!" },
        { e: "🏝️", t: "This country is made up of over 17,000 islands, more than any other nation on Earth!" },
        { e: "🐉", t: "The Komodo dragon, the world's largest lizard, only lives on islands in this country!" }
      ]
    },
    distractors: ["Australia", "India", "China", "Japan"],
    fact: "Indonesia is made up of over 17,000 islands! Bima the illustrator is from here! Capital: Jakarta! 🏝️"
  },
  {
    name: "Italy",
    beginner: {
      casey: "Which country has a famous tower that leans sideways instead of standing straight up — and is also where pizza was invented?",
      clues: [
        { e: "🍕", t: "Pizza was invented in this country. Yummy!" },
        { e: "↗️", t: "There is a famous tower here that leans sideways instead of standing straight up!" },
        { e: "🏛️", t: "Jaime and Zany Dad Jeff sang near a giant old arena called the Colosseum here!" }
      ]
    },
    intermediate: {
      casey: "Which European country invented both pasta and pizza, and has a famous tower in Pisa that refuses to stand straight?",
      clues: [
        { e: "🍝", t: "Pasta was invented here, and the capital is Rome!" },
        { e: "↗️", t: "The Leaning Tower of Pisa started leaning because the ground underneath was too soft!" },
        { e: "🏟️", t: "The Colosseum in Rome is nearly 2,000 years old and once held 80,000 people!" }
      ]
    },
    advanced: {
      casey: "Which European country is known as the Eternal City and has more UNESCO World Heritage Sites than anywhere else on Earth?",
      clues: [
        { e: "🏙️", t: "The capital is Rome, also known as the Eternal City, said to have been built on seven hills!" },
        { e: "🍝", t: "This country is the birthplace of pasta!" },
        { e: "🏛️", t: "This country has more UNESCO World Heritage Sites than any other country in the world!" }
      ]
    },
    distractors: ["Spain", "France", "Switzerland", "Germany"],
    fact: "Italy is the birthplace of pasta! Capital: Rome, the Eternal City. Home to the Leaning Tower of Pisa! 🍕"
  },
  {
    name: "Jamaica",
    beginner: {
      casey: "Which sunny Caribbean island is famous for Reggae music, spicy Jerk Chicken, and a flag with a big gold X?",
      clues: [
        { e: "🍗", t: "Jaime and Zany Dad Jeff ate spicy Jerk Chicken here. It smells amazing on the grill!" },
        { e: "🟡", t: "The flag here has a big X shape with black, gold, and green colours!" },
        { e: "🥁", t: "A kind of music called Reggae was born on this island and has a great bouncy beat!" }
      ]
    },
    intermediate: {
      casey: "Which Caribbean island is the birthplace of Reggae music and the home country of Usain Bolt, the world's fastest human?",
      clues: [
        { e: "🎵", t: "Reggae music was born on this island. The famous Bob Marley was from here!" },
        { e: "🍗", t: "Jerk Chicken is the most famous food here, cooked on a grill with spicy island seasonings!" },
        { e: "🏃", t: "Usain Bolt, the fastest human ever recorded, grew up on this island!" }
      ]
    },
    advanced: {
      casey: "Which Caribbean island has a capital called Kingston and gave the world both Reggae music and Bob Marley?",
      clues: [
        { e: "🏙️", t: "The capital is Kingston, the largest city and cultural heart of this Caribbean island!" },
        { e: "🎵", t: "Kingston is the birthplace of Reggae music and the legendary Bob Marley!" },
        { e: "🏃", t: "Usain Bolt, the fastest human ever recorded, was born and raised on this island!" }
      ]
    },
    distractors: ["Barbados", "Colombia", "Brazil", "Mexico"],
    fact: "Jamaica is the birthplace of Reggae music and Bob Marley! Capital: Kingston. Famous for Jerk Chicken! 🎵"
  },
  {
    name: "Japan",
    beginner: {
      casey: "Which country is the only place in the world where slurping your noodles loudly is considered polite?",
      clues: [
        { e: "🍣", t: "Jaime and Zany Dad Jeff ate sushi here while the chef diced fresh fish at the counter!" },
        { e: "🌸", t: "Beautiful pink cherry blossom trees bloom here every spring!" },
        { e: "🗻", t: "There is a tall snowy volcano here shaped like a perfect triangle. It is very famous!" }
      ]
    },
    intermediate: {
      casey: "Which island country invented sushi, has cherry blossoms every spring, and where slurping noodles is good manners?",
      clues: [
        { e: "🍜", t: "It is polite to slurp your noodles here. The louder, the better!" },
        { e: "🌸", t: "Cherry blossom season here is so beautiful that people picnic under the pink trees!" },
        { e: "🤖", t: "This country is one of the world's leaders in robots and amazing technology!" }
      ]
    },
    advanced: {
      casey: "Which country has the world's most populated city as its capital and is made up of around 6,800 islands?",
      clues: [
        { e: "🏙️", t: "The capital is Tokyo, the most populated city in the entire world!" },
        { e: "🍜", t: "It is polite to slurp your noodles when eating here!" },
        { e: "🗾", t: "This country is made up of about 6,800 islands and sits on the Pacific Ring of Fire!" }
      ]
    },
    distractors: ["South Korea", "China", "Indonesia", "Australia"],
    fact: "In this country it is polite to slurp your noodles! Capital: Tokyo, the most populated city in the world! 🍜"
  },
  {
    name: "Kenya",
    beginner: {
      casey: "Which East African country is home to an incredible 36,000 elephants and the world-famous Masai Mara wildlife reserve?",
      clues: [
        { e: "🐘", t: "Jaime and Zany Dad Jeff went on safari and saw real elephants here at the Masai Mara!" },
        { e: "🦁", t: "Lions, elephants, zebras, and giraffes all roam the wide grasslands here!" },
        { e: "🌿", t: "The Masai Mara is a famous wildlife park here where the Great Migration happens!" }
      ]
    },
    intermediate: {
      casey: "Which East African country has 36,000 elephants and has produced some of the greatest long-distance runners in history?",
      clues: [
        { e: "🐘", t: "This country is home to an incredible 36,000 elephants!" },
        { e: "🏃", t: "This country has some of the world's greatest long-distance runners, including many Olympic champions!" },
        { e: "🌍", t: "The Masai Mara is this country's most famous wildlife reserve and home to the Great Migration!" }
      ]
    },
    advanced: {
      casey: "Which East African country has a capital called Nairobi, 36,000 elephants, and world-record marathon runners?",
      clues: [
        { e: "🏙️", t: "The capital is Nairobi, and this country is home to an incredible 36,000 elephants!" },
        { e: "🦁", t: "The Masai Mara hosts the Great Migration, with over 2 million wildebeest crossing the Mara River every year!" },
        { e: "🏃", t: "Runners from this country have dominated marathons and long-distance races for decades!" }
      ]
    },
    distractors: ["South Africa", "Ghana", "India", "Indonesia"],
    fact: "This country has 36,000 elephants and the world's greatest long-distance runners! Capital: Nairobi, home of the Masai Mara! 🐘"
  },
  {
    name: "Mexico",
    beginner: {
      casey: "Which North American country is famous for tasty tacos, colourful mariachi music, and the flag with an eagle on a cactus?",
      clues: [
        { e: "🌮", t: "Yummy tacos and tortillas were invented in this country!" },
        { e: "🎸", t: "Jaime played mariachi music in Tulum. Musicians here wear big colourful hats called sombreros!" },
        { e: "🦅", t: "The flag here is green, white, and red with an eagle sitting on a cactus in the middle!" }
      ]
    },
    intermediate: {
      casey: "Which North American country is home to the world's largest pyramid by volume and celebrates the amazing Day of the Dead?",
      clues: [
        { e: "🔺", t: "The world's largest pyramid by volume is in a town called Cholula in this country!" },
        { e: "🎸", t: "Mariachi music comes from here, with trumpets, violins, and guitars!" },
        { e: "💀", t: "Day of the Dead is a beautiful celebration here to remember and honour loved ones!" }
      ]
    },
    advanced: {
      casey: "Which country has one of North America's largest capital cities and a pyramid in Cholula that is even bigger than Egypt's?",
      clues: [
        { e: "🏙️", t: "The capital is one of the largest cities in North America, sitting between the USA and Central America!" },
        { e: "🔺", t: "The world's largest pyramid is in Cholula, bigger than Egypt's pyramids by volume!" },
        { e: "🌵", t: "This country is home to over half of all cactus species in the world!" }
      ]
    },
    distractors: ["Peru", "Colombia", "Chile", "Brazil"],
    fact: "This country has the world's largest pyramid in Cholula! Capital: Mexico City. Famous for mariachi and tacos! 🌮"
  },
  {
    name: "Nepal",
    beginner: {
      casey: "Which country is home to Mount Everest, the tallest mountain in the entire world?",
      clues: [
        { e: "🏔️", t: "The tallest mountain in the world, Mount Everest, is in this country!" },
        { e: "🧗", t: "Jaime and Zany Dad Jeff wore orange hiking suits to climb the snowy mountain here!" },
        { e: "🔻", t: "This country has the only national flag in the world that is not a rectangle. It looks like two triangles stacked up!" }
      ]
    },
    intermediate: {
      casey: "Which Asian country is the only one in the world whose national flag is not a rectangle — and has Mount Everest too?",
      clues: [
        { e: "🏔️", t: "Mount Everest is 8,848 metres tall and about 60 million years old!" },
        { e: "🔻", t: "This country has the only national flag in the world that is not rectangular!" },
        { e: "🧘", t: "This is the birthplace of Buddha, one of the world's most important religious figures!" }
      ]
    },
    advanced: {
      casey: "Which small Asian country has a capital called Kathmandu, the world's only pennant-shaped flag, and 8 of the 10 tallest mountains?",
      clues: [
        { e: "🏙️", t: "The capital is Kathmandu, home of Mount Everest, which is 8,848 metres tall and 60 million years old!" },
        { e: "🔻", t: "This country's pennant-shaped flag is the only non-rectangular national flag in the world!" },
        { e: "🏔️", t: "This country has 8 of the world's 10 highest mountains, including Everest, Kangchenjunga, and Lhotse!" }
      ]
    },
    distractors: ["India", "Sri Lanka", "China", "Indonesia"],
    fact: "Mount Everest is here, 8,848 metres tall and 60 million years old! Capital: Kathmandu. Only non-rectangular national flag! 🏔️"
  },
  {
    name: "Peru",
    beginner: {
      casey: "Which South American country has a mysterious ancient city called Machu Picchu built high up in the mountains?",
      clues: [
        { e: "🦙", t: "Fluffy animals called llamas and alpacas live in the mountains here!" },
        { e: "🏔️", t: "There is a magical lost city called Machu Picchu built high in the mountains here!" },
        { e: "🎵", t: "Jaime and Zany Dad Jeff played pan flutes here, long pipes that make a beautiful echoing sound!" }
      ]
    },
    intermediate: {
      casey: "Which South American country has the lost Inca city of Machu Picchu sitting 2,430 metres above sea level?",
      clues: [
        { e: "🏛️", t: "Machu Picchu sits an incredible 2,430 metres above sea level!" },
        { e: "🦙", t: "Llamas were used for thousands of years in this country as pack animals to carry heavy loads!" },
        { e: "🌊", t: "The Amazon River, the world's largest river by water flow, begins in this country!" }
      ]
    },
    advanced: {
      casey: "Which South American country has its capital in Lima and gave the world potatoes, tomatoes, and quinoa?",
      clues: [
        { e: "🏙️", t: "The capital is Lima, and Machu Picchu here sits 2,430 metres above sea level!" },
        { e: "🏛️", t: "Machu Picchu was built by the Inca Empire around 1450 and then mysteriously abandoned 100 years later!" },
        { e: "🌽", t: "Potatoes, tomatoes, and quinoa were all originally grown here and are now eaten all around the world!" }
      ]
    },
    distractors: ["Colombia", "Chile", "Brazil", "Argentina"],
    fact: "Machu Picchu is here, 2,430 metres above sea level! Capital: Lima. Home of llamas and pan flutes! 🦙"
  },
  {
    name: "South Africa",
    beginner: {
      casey: "Which African country is the only place in the world where penguins actually live on a warm sunny beach?",
      clues: [
        { e: "🐧", t: "Penguins actually live on the beach here in Africa. Surprise!" },
        { e: "🌈", t: "This country is called the Rainbow Nation because of all its wonderful different people!" },
        { e: "⛵", t: "Jaime and Zany Dad Jeff sailed around and spotted penguins in Cape Town!" }
      ]
    },
    intermediate: {
      casey: "Which is the only country in the world with three capital cities — and has African penguins living on its beaches?",
      clues: [
        { e: "🏛️", t: "This country has three capitals: Bloemfontein, Cape Town, and Pretoria!" },
        { e: "🐧", t: "African penguins live on the beaches here and are the only penguin species found in Africa!" },
        { e: "🦁", t: "You can see the Big Five on safari here: lion, elephant, rhino, leopard, and buffalo!" }
      ]
    },
    advanced: {
      casey: "Which southernmost African country is the only nation with three capitals: Bloemfontein, Cape Town, and Pretoria?",
      clues: [
        { e: "🏙️", t: "This country has three capitals: Bloemfontein, Cape Town, and Pretoria!" },
        { e: "💎", t: "This country is one of the world's top producers of gold and diamonds!" },
        { e: "🏉", t: "Rugby is massive here, and the Springboks have won multiple Rugby World Cup championships!" }
      ]
    },
    distractors: ["Kenya", "Ghana", "Australia", "India"],
    fact: "This country has three capitals: Bloemfontein, Cape Town, and Pretoria. Penguins live on its beaches! 🐧"
  },
  {
    name: "South Korea",
    beginner: {
      casey: "Which Asian country is the home of K-Pop, one of the most popular music styles in the whole world?",
      clues: [
        { e: "🎭", t: "Jaime and Zany Dad Jeff tried on lots of fun traditional masks here!" },
        { e: "🎵", t: "K-Pop is the most popular kind of music in this country. So catchy!" },
        { e: "🥢", t: "Spicy kimchi, fermented cabbage, is eaten with almost every meal here!" }
      ]
    },
    intermediate: {
      casey: "Which East Asian country is the birthplace of K-Pop, kimchi, and tech giant Samsung?",
      clues: [
        { e: "🎵", t: "K-Pop is the most popular genre of music here. BTS is from this country!" },
        { e: "🎭", t: "Traditional mask dances called Talchum are performed here, and the masks have funny expressions!" },
        { e: "📱", t: "This country is one of the most technologically advanced in the world. Samsung was founded here!" }
      ]
    },
    advanced: {
      casey: "Which East Asian country has a capital called Seoul and is the place where BTS and K-Pop conquered the world?",
      clues: [
        { e: "🏙️", t: "The capital is Seoul, and K-Pop is the most popular genre of music here!" },
        { e: "🎭", t: "Jaime and Zany Dad Jeff tried on traditional Talchum masks at a market here. The expressions were hilarious!" },
        { e: "🏆", t: "This country co-hosted the FIFA World Cup in 2002 and finished 4th, the best result ever for an Asian team!" }
      ]
    },
    distractors: ["China", "Japan", "Indonesia", "India"],
    fact: "This country is where K-Pop was born! Capital: Seoul. Jaime and Zany Dad Jeff tried on Talchum masks here! 🎭"
  },
  {
    name: "Spain",
    beginner: {
      casey: "Which country holds the world's biggest food fight every year, where thousands of people throw tomatoes at each other?",
      clues: [
        { e: "🍅", t: "This country has the world's biggest food fight called La Tomatina, where everyone throws tomatoes!" },
        { e: "💃", t: "Flamenco is a beautiful stomping dance from here with colourful dresses and stamping feet!" },
        { e: "🏗️", t: "Jaime and Zany Dad Jeff visited the stunning Sagrada Familia church here, still being built since 1882!" }
      ]
    },
    intermediate: {
      casey: "Which European country is home to La Tomatina, the world's biggest food fight, and the stomping Flamenco dance?",
      clues: [
        { e: "🍅", t: "La Tomatina is the world's biggest food fight and happens right here every year!" },
        { e: "💃", t: "Flamenco dancing originated in the south of this country with stomping feet and spinning skirts!" },
        { e: "🏗️", t: "The Sagrada Familia in Barcelona has been under construction since 1882 and is still not finished!" }
      ]
    },
    advanced: {
      casey: "Which European country has a capital called Madrid and has won the UEFA European Championship a record four times?",
      clues: [
        { e: "🏙️", t: "The capital is Madrid, home to La Tomatina, the biggest food fight in the world!" },
        { e: "🍅", t: "La Tomatina takes place in the town of Bunol, where 40,000 people throw 150,000 tomatoes in one hour!" },
        { e: "🏆", t: "This country won the FIFA World Cup in 2010 and has won the UEFA European Championship 4 times, a record!" }
      ]
    },
    distractors: ["Italy", "France", "United Kingdom", "Germany"],
    fact: "This country has La Tomatina, the world's biggest food fight! Capital: Madrid. Flamenco dancing is from here! 🍅"
  },
  {
    name: "Sri Lanka",
    beginner: {
      casey: "Which teardrop-shaped island near the tip of India is famous for amazing spice markets and colourful elephant festivals?",
      clues: [
        { e: "🌶️", t: "Jaime and Zany Dad Jeff visited a market bursting with yummy spices here. The smells were amazing!" },
        { e: "🐘", t: "Elephants are very special here and parade through colourful festivals!" },
        { e: "🎵", t: "Elefante played a sitar here, a beautiful stringed instrument from this part of the world!" }
      ]
    },
    intermediate: {
      casey: "Which teardrop-shaped Asian island is the only country with two capital cities and world-famous Ceylon tea?",
      clues: [
        { e: "🏛️", t: "This country has two capitals: Colombo and Sri Jayawardenepura Kotte!" },
        { e: "🍵", t: "This is one of the biggest producers of tea in the world. The tea is called Ceylon tea!" },
        { e: "🐘", t: "The elephant is the national animal here and appears in many traditional festivals and parades!" }
      ]
    },
    advanced: {
      casey: "Which teardrop-shaped island nation has two capitals — Colombo and Sri Jayawardenepura Kotte — and a lion on its flag?",
      clues: [
        { e: "🏙️", t: "This country famously has two capitals: Colombo and Sri Jayawardenepura Kotte!" },
        { e: "🍵", t: "This country is the world's 4th largest tea producer. The tea is called Ceylon tea!" },
        { e: "🦁", t: "The flag here features a golden lion holding a sword, one of the most striking national flags in the world!" }
      ]
    },
    distractors: ["India", "Indonesia", "Nepal", "Japan"],
    fact: "This country has two capitals: Colombo and Sri Jayawardenepura Kotte! Famous for spices and Ceylon tea! 🌶️"
  },
  {
    name: "Switzerland",
    beginner: {
      casey: "Which European country is famous for snowy Alps mountains, melted cheese fondue, and the most amazing chocolate in the world?",
      clues: [
        { e: "⛷️", t: "Jaime and Zany Dad Jeff went skiing on the beautiful snowy Alps mountains here!" },
        { e: "🧀", t: "Fondue, melted cheese in a pot for dipping bread, is the most famous food from here!" },
        { e: "🔴", t: "This flag is red with a white cross in the middle, one of the most recognisable flags in the world!" }
      ]
    },
    intermediate: {
      casey: "Which European country is famous for luxury watches, cheese fondue, and a very long wooden instrument called the alphorn?",
      clues: [
        { e: "🎺", t: "The alphorn is a very long wooden instrument traditionally blown here to soothe cattle!" },
        { e: "🧀", t: "This country is famous for cheese fondue and chocolate, two of the world's greatest foods!" },
        { e: "⏱️", t: "The watches made in this country are the most famous in the world and have been crafted here for hundreds of years!" }
      ]
    },
    advanced: {
      casey: "Which tiny European country has a capital called Bern, is officially neutral in wars, and has a flag that is the reverse of the Red Cross symbol?",
      clues: [
        { e: "🏙️", t: "The capital is Bern, where the alphorn is traditionally blown to soothe cattle!" },
        { e: "🌐", t: "This country is home to many international organisations, including the Red Cross, whose flag is the reverse of this flag!" },
        { e: "🏦", t: "This country is famous for its banks, watches, chocolate, and for being officially neutral in wars!" }
      ]
    },
    distractors: ["Austria", "Germany", "France", "Italy"],
    fact: "The alphorn is traditionally blown here to soothe cattle! Capital: Bern. Famous for fondue, chocolate, and skiing! ⛷️"
  },
  {
    name: "United Kingdom",
    beginner: {
      casey: "Which country has tall guards in big black furry hats who stand perfectly still outside a royal palace?",
      clues: [
        { e: "💂", t: "Tall guards wearing big black furry hats stand very still outside the palace here!" },
        { e: "🏰", t: "Jaime and Zany Dad Jeff visited a famous old tower and a drawbridge here, the Tower of London and Tower Bridge!" },
        { e: "👑", t: "This country has a King and the Royal Family. They wave from palace balconies!" }
      ]
    },
    intermediate: {
      casey: "Which country is actually four countries in one — England, Scotland, Wales, and Northern Ireland — all under one flag?",
      clues: [
        { e: "🌍", t: "This is actually four countries in one: England, Scotland, Wales, and Northern Ireland!" },
        { e: "🏰", t: "The Tower of London is over 900 years old and was once a prison for royalty!" },
        { e: "🎸", t: "The Beatles, the Rolling Stones, and Adele all came from here. It is a music superpower!" }
      ]
    },
    advanced: {
      casey: "Which country has London as its capital and once built the largest empire in history, covering 26% of the world?",
      clues: [
        { e: "🏙️", t: "The capital is London, and this country includes England, Scotland, Wales, and Northern Ireland!" },
        { e: "🏰", t: "The Tower of London has housed famous prisoners including Anne Boleyn and Guy Fawkes!" },
        { e: "🌍", t: "At its height, the empire built from this island nation was the largest in history, covering 26% of the world!" }
      ]
    },
    distractors: ["Ireland", "Australia", "Germany", "France"],
    fact: "This country includes England, Scotland, Wales, and Northern Ireland! Capital: London, home of the Tower of London! 🏰"
  },
  {
    name: "USA",
    beginner: {
      casey: "Which country is home to New Orleans, the city where Jazz music was born, and the giant green Statue of Liberty?",
      clues: [
        { e: "🎷", t: "Jaime and Zany Dad Jeff played jazz music in New Orleans, the city where jazz was invented!" },
        { e: "🗽", t: "There is a giant green lady called the Statue of Liberty in a famous city called New York!" },
        { e: "🔵", t: "This flag has red and white stripes and a blue corner filled with white stars!" }
      ]
    },
    intermediate: {
      casey: "Which huge country was the first to land humans on the Moon, and has 50 states stretching from frozen Alaska to tropical Hawaii?",
      clues: [
        { e: "🎷", t: "New Orleans is the birthplace of Jazz. Jaime and Zany Dad Jeff played jazz right on the streets there!" },
        { e: "🚀", t: "This country was the first to land people on the Moon, way back in 1969!" },
        { e: "🌎", t: "This country has 50 states, from frozen Alaska all the way to tropical Hawaii!" }
      ]
    },
    advanced: {
      casey: "Which 50-state country has its capital in Washington D.C. and has landed 12 humans on the Moon?",
      clues: [
        { e: "🏙️", t: "The capital is Washington D.C., and New Orleans here is the birthplace of Jazz!" },
        { e: "🌍", t: "This country is the world's third largest by area and the third most populated!" },
        { e: "🚀", t: "This country's space program has landed 12 humans on the Moon, starting with Neil Armstrong in 1969!" }
      ]
    },
    distractors: ["Canada", "Mexico", "Australia", "United Kingdom"],
    fact: "New Orleans is the birthplace of Jazz! Capital: Washington D.C. Home of the Statue of Liberty! 🎷"
  }
];
const FIND_FOXY_CORRECT_CUES = ["Hurray!", "Way to go!", "You did it!", "You got it!"];
const FIND_FOXY_LEVEL_LABELS = {
  beginner: "🌱 Beginner",
  intermediate: "🗺 Traveller",
  advanced: "🏆 Champion"
};
const EXCLAMATION_SRCS = [exclamHurray, exclamWayToGo, exclamYouDidIt, exclamYouGotIt];
const CASEY_IMAGES = ["/art/characters.jpg", "/art/characters.jpg", "/art/characters.jpg", "/art/characters.jpg"];
const TOTAL_STOPS = FIND_FOXY_COUNTRIES.length;
const COUNTRY_MUSIC = {
  "Argentina": "/music/ARGENTINA DRUMS AND HORNS_1.2.wav",
  "Australia": "/music/Jamie Jangles_Daniel_Australia.wav",
  "Barbados": "/music/BARBADOS_2.wav",
  "France": "/music/FRANCE.wav",
  "Ghana": "/music/GHANA.wav",
  "Indonesia": "/music/INDONESIA.wav",
  "Italy": "/music/ITALY.wav",
  "Jamaica": "/music/JAMAICA.wav",
  "Japan": "/music/JAPAN.wav",
  "Kenya": "/music/KENYA.wav",
  "Mexico": "/music/MEXICO.wav",
  "Nepal": "/music/NEPAL.wav",
  "Peru": "/music/PERU.wav",
  "South Africa": "/music/SOUTH AFRICA_1.2.wav",
  "South Korea": "/music/SOUTH KOREA.wav",
  "Spain": "/music/SPAIN1.2.wav",
  "Sri Lanka": "/music/SRI LANKA_1.1.wav",
  "Switzerland": "/music/SWITZERLAND.wav",
  "United Kingdom": "/music/UK.wav",
  "USA": "/music/NEW ORLEANS.wav"
};
function generateClouds(count = 9) {
  const used = [];
  return Array.from({ length: count }, () => {
    let top;
    let tries = 0;
    do {
      top = 4 + Math.random() * 78;
      tries++;
    } while (tries < 30 && used.some((t) => Math.abs(t - top) < 9));
    used.push(top);
    return {
      top: `${top.toFixed(1)}%`,
      width: `${(4 + Math.random() * 7).toFixed(1)}rem`,
      duration: Math.round(55 + Math.random() * 55),
      delay: -Math.round(Math.random() * 65)
    };
  });
}
const CLOUDS = generateClouds();
function shuffle(values) {
  const next = [...values];
  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
  }
  return next;
}
function nextPlane(previousKey, lastBottom, lastDirection) {
  const bottoms = [10, 17, 25, 33, 41, 50, 58];
  const sizes = [110, 130, 150, 170];
  let bottom = lastBottom;
  while (bottom === lastBottom) {
    bottom = bottoms[Math.floor(Math.random() * bottoms.length)];
  }
  return {
    key: previousKey + 1,
    bottom,
    duration: Math.round(55 + Math.random() * 20),
    size: sizes[Math.floor(Math.random() * sizes.length)],
    start: -(120 + Math.floor(Math.random() * 90)),
    direction: lastDirection === "ltr" ? "rtl" : "ltr"
  };
}
function cueQueue(previous) {
  return shuffle(previous);
}
function playTone() {
  if (typeof window === "undefined") return;
  const AudioContextCtor = window.AudioContext ?? window.webkitAudioContext;
  if (!AudioContextCtor) return;
  const audioContext = new AudioContextCtor();
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  oscillator.type = "triangle";
  oscillator.frequency.setValueAtTime(660, audioContext.currentTime);
  oscillator.frequency.linearRampToValueAtTime(880, audioContext.currentTime + 0.18);
  gain.gain.setValueAtTime(1e-3, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.06, audioContext.currentTime + 0.04);
  gain.gain.exponentialRampToValueAtTime(1e-3, audioContext.currentTime + 0.28);
  oscillator.connect(gain);
  gain.connect(audioContext.destination);
  oscillator.start();
  oscillator.stop(audioContext.currentTime + 0.3);
  void audioContext.resume().catch(() => void 0);
}
function FindFoxyGame() {
  const [phase, setPhase] = reactExports.useState("setup");
  const [difficulty, setDifficulty] = reactExports.useState("beginner");
  const [playerName, setPlayerName] = reactExports.useState("Explorer");
  const [order, setOrder] = reactExports.useState([]);
  const [currentIndex, setCurrentIndex] = reactExports.useState(0);
  const [score, setScore] = reactExports.useState(0);
  const [streak, setStreak] = reactExports.useState(0);
  const [stamps, setStamps] = reactExports.useState(0);
  const [, addGlobalStamps] = useStamps();
  const [revealedClueCount, setRevealedClueCount] = reactExports.useState(0);
  const [locked, setLocked] = reactExports.useState(false);
  const [wrongChoice, setWrongChoice] = reactExports.useState(null);
  const [answers, setAnswers] = reactExports.useState([]);
  const [cueText, setCueText] = reactExports.useState(null);
  const [cueStack, setCueStack] = reactExports.useState([]);
  const [plane, setPlane] = reactExports.useState(() => nextPlane(0, -1, "rtl"));
  const planeLaunchRef = reactExports.useRef(null);
  const planeKeyRef = reactExports.useRef(0);
  const planeDirectionRef = reactExports.useRef("ltr");
  const planeDurationRef = reactExports.useRef(60);
  const lastBottomRef = reactExports.useRef(-1);
  const exclamQueueRef = reactExports.useRef([]);
  const bgMusicRef = reactExports.useRef(null);
  const countryMusicRef = reactExports.useRef(null);
  function playExclamation() {
    if (exclamQueueRef.current.length === 0) {
      exclamQueueRef.current = shuffle([...EXCLAMATION_SRCS]);
    }
    const src = exclamQueueRef.current.shift();
    new Audio(src).play().catch(() => void 0);
  }
  function stopCountryMusic() {
    if (countryMusicRef.current) {
      countryMusicRef.current.pause();
      countryMusicRef.current = null;
    }
  }
  const currentCountry = phase === "setup" ? null : FIND_FOXY_COUNTRIES[order[currentIndex]];
  const currentLevel = currentCountry ? currentCountry[difficulty] : null;
  reactExports.useEffect(() => {
    if (!currentCountry) return;
    const optionSet = shuffle([currentCountry.name, ...shuffle(currentCountry.distractors).slice(0, 3)]);
    setAnswers(optionSet);
    setLocked(false);
    setWrongChoice(null);
    setCueText(null);
    setRevealedClueCount(0);
  }, [currentCountry]);
  reactExports.useEffect(() => {
    if (phase !== "playing" || !currentLevel) return;
    const maxClues = currentLevel.clues.length;
    if (revealedClueCount >= maxClues) return;
    const delay = revealedClueCount === 0 ? 5e3 : 3e3;
    const id = window.setTimeout(() => {
      setRevealedClueCount((n) => Math.min(n + 1, maxClues));
    }, delay);
    return () => window.clearTimeout(id);
  }, [phase, revealedClueCount, currentLevel]);
  reactExports.useEffect(() => {
    const schedule = (delayMs) => {
      planeLaunchRef.current = window.setTimeout(() => {
        const next = nextPlane(planeKeyRef.current, lastBottomRef.current, planeDirectionRef.current);
        planeKeyRef.current = next.key;
        lastBottomRef.current = next.bottom;
        planeDirectionRef.current = next.direction;
        planeDurationRef.current = next.duration;
        setPlane(next);
        schedule(next.duration * 1e3 + 4e3 + Math.floor(Math.random() * 5e3));
      }, delayMs);
    };
    schedule(500);
    return () => {
      if (planeLaunchRef.current != null) window.clearTimeout(planeLaunchRef.current);
    };
  }, []);
  reactExports.useEffect(() => {
    if (phase === "setup") {
      if (bgMusicRef.current) {
        bgMusicRef.current.pause();
        bgMusicRef.current.currentTime = 0;
      }
      return;
    }
    if (phase === "passport") {
      bgMusicRef.current?.pause();
      return;
    }
    if (!bgMusicRef.current) {
      const audio = new Audio(findFoxyMusic);
      audio.loop = true;
      audio.volume = 0.35;
      bgMusicRef.current = audio;
    }
    bgMusicRef.current.play().catch(() => void 0);
    return () => {
      bgMusicRef.current?.pause();
    };
  }, [phase]);
  reactExports.useMemo(
    () => Array.from({ length: TOTAL_STOPS }, (_, index) => index < stamps),
    [stamps]
  );
  function startGame(nextDifficulty) {
    setDifficulty(nextDifficulty);
    setPlayerName("Explorer");
    setOrder(shuffle(FIND_FOXY_COUNTRIES.map((_, index) => index)));
    setCurrentIndex(0);
    setScore(0);
    setStreak(0);
    setStamps(0);
    setLocked(false);
    setWrongChoice(null);
    setCueText(null);
    setCueStack(cueQueue(FIND_FOXY_CORRECT_CUES));
    setPhase("playing");
  }
  function handleAnswer(choice) {
    if (!currentCountry || locked) return;
    setLocked(true);
    if (choice === currentCountry.name) {
      const streakBonus = streak >= 2 ? 5 : 0;
      setStamps((value) => value + 1);
      addGlobalStamps(1);
      setScore((value) => value + 10 + streakBonus);
      setStreak((value) => value + 1);
      setCueStack((previous) => {
        const nextQueue = previous.length === 0 ? cueQueue(FIND_FOXY_CORRECT_CUES) : [...previous];
        const [nextCue, ...rest] = nextQueue;
        setCueText(nextCue ?? null);
        return rest;
      });
      playTone();
      burstCorrect();
      const countryName = currentCountry.name;
      window.setTimeout(() => {
        setPhase("passport");
        playExclamation();
        bgMusicRef.current?.pause();
        stopCountryMusic();
        const musicSrc = COUNTRY_MUSIC[countryName];
        if (musicSrc) {
          const audio = new Audio(musicSrc);
          audio.volume = 0.65;
          countryMusicRef.current = audio;
          audio.play().catch(() => void 0);
        }
      }, 500);
      return;
    }
    setWrongChoice(choice);
    setStreak(0);
    window.setTimeout(() => {
      setLocked(false);
      setWrongChoice(null);
    }, 700);
  }
  function handlePassportNext() {
    stopCountryMusic();
    bgMusicRef.current?.play().catch(() => void 0);
    if (currentIndex >= TOTAL_STOPS - 1) {
      setPhase("win");
      burstFinale();
      return;
    }
    setCurrentIndex((value) => value + 1);
    setPhase("playing");
  }
  function resetGame() {
    stopCountryMusic();
    setPhase("setup");
    setScore(0);
    setStreak(0);
    setStamps(0);
    setCurrentIndex(0);
    setWrongChoice(null);
    setLocked(false);
    setCueText(null);
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "find-foxy", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "find-foxy__sky", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "find-foxy__rainbow" }),
      CLOUDS.map((cloud, index) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: "find-foxy__cloud",
          style: {
            top: cloud.top,
            width: cloud.width,
            animationDuration: `${cloud.duration}s`,
            animationDelay: `${cloud.delay}s`
          }
        },
        index
      ))
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: `find-foxy__plane-wrap find-foxy__plane-wrap--${plane.direction}`,
        style: {
          ["--ff-plane-bottom"]: `${plane.bottom}%`,
          ["--ff-plane-duration"]: `${plane.duration}s`,
          ["--ff-plane-start"]: `${plane.start}px`
        },
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          "img",
          {
            src: planeImg,
            alt: "",
            "aria-hidden": true,
            className: `find-foxy__plane${plane.direction === "ltr" ? " find-foxy__plane--flipped" : ""}`,
            style: { width: `${plane.size}px`, height: "auto", display: "block" }
          }
        )
      },
      plane.key
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "find-foxy__content", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "find-foxy__header", children: [
        phase === "setup" && /* @__PURE__ */ jsxRuntimeExports.jsx("img", { className: "find-foxy__subtitle", src: foxyLogo, alt: "Find Foxy" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "find-foxy__tagline", children: "Find Foxy!" })
      ] }),
      phase === "setup" && /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "find-foxy__panel", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "find-foxy__intro", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "find-foxy__casey-wrap", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "find-foxy__casey-stack", children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: "/art/world_tour.png", alt: "World Tour", style: { width: "9rem", display: "block" } }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "find-foxy__bubble-stack", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "find-foxy__bubble-big", children: "🚨 FOXY IS MISSING!" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "find-foxy__bubble-gold", children: "Collect all 20 Jangles Pass stamps to save the day! 🌍✈️" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "find-foxy__section-label", children: "Choose your level!" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "find-foxy__difficulty-grid", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: "find-foxy__difficulty", "data-tone": "beginner", onClick: () => startGame("beginner"), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "find-foxy__difficulty-icon", children: "🌱" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "find-foxy__difficulty-title", children: "Beginner Explorer" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "find-foxy__difficulty-copy", children: "Simple clues for young adventurers." })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: "find-foxy__difficulty", "data-tone": "intermediate", onClick: () => startGame("intermediate"), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "find-foxy__difficulty-icon", children: "🗺️" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "find-foxy__difficulty-title", children: "World Traveller" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "find-foxy__difficulty-copy", children: "Trickier. Use what you know." })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: "find-foxy__difficulty", "data-tone": "advanced", onClick: () => startGame("advanced"), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "find-foxy__difficulty-icon", children: "🏆" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "find-foxy__difficulty-title", children: "Jangles Champion" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "find-foxy__difficulty-copy", children: "Capitals, facts, harder clues." })
              ] })
            ] })
          ] })
        ] })
      ] }) }),
      phase !== "setup" && currentCountry && currentLevel && /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "find-foxy__stat-row", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "find-foxy__stat-chip find-foxy__stat-chip--stamps", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "find-foxy__stat-icon", children: "🎫" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "find-foxy__stat-value", children: stamps }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "find-foxy__stat-of", children: [
            "/",
            TOTAL_STOPS
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "find-foxy__stat-chip find-foxy__stat-chip--streak", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "find-foxy__stat-icon", children: "🔥" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "find-foxy__stat-value", children: streak })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "find-foxy__stat-chip find-foxy__stat-chip--level", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "find-foxy__stat-icon", children: difficulty === "beginner" ? "🌱" : difficulty === "intermediate" ? "🗺️" : "🏆" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "find-foxy__stat-label", children: FIND_FOXY_LEVEL_LABELS[difficulty] })
        ] })
      ] }),
      (phase === "playing" || phase === "passport") && currentCountry && currentLevel && /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "find-foxy__game-card", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "find-foxy__destination", children: [
          "Destination ",
          currentIndex + 1,
          " of ",
          TOTAL_STOPS
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "find-foxy__question-block", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "find-foxy__question-eyebrow", children: "🦊 Where is Foxy hiding?" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "find-foxy__casey-row", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "find-foxy__casey-stack", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              "img",
              {
                className: "find-foxy__casey-photo find-foxy__casey-photo--small",
                src: CASEY_IMAGES[currentIndex % CASEY_IMAGES.length],
                alt: "Casey Bea Jangles"
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "find-foxy__speech find-foxy__speech--question", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "find-foxy__casey-copy", children: currentLevel.casey }),
              cueText && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "find-foxy__cue", children: [
                "🎉 ",
                cueText
              ] })
            ] })
          ] })
        ] }),
        !locked && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-1.5 sm:gap-2", children: currentLevel.clues.map((clue, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          motion.div,
          {
            initial: false,
            animate: i < revealedClueCount ? { opacity: 1, x: 0 } : { opacity: 0, x: -12 },
            transition: { duration: 0.32 },
            className: "grid items-start gap-2 rounded-xl bg-[#FFFBF0] px-3 py-2 text-sm font-bold leading-snug",
            style: { gridTemplateColumns: "auto 1fr", border: "2px solid #1a1a1a", borderLeft: "4px solid #FBBF24" },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-base leading-snug", children: clue.e }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: clue.t })
            ]
          },
          `${currentCountry.name}-${i}`
        )) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "find-foxy__section-label mt-2", children: "🌍 Which country is Foxy hiding in?" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "find-foxy__answers", children: answers.map((answer) => {
          const isCorrect = locked && !wrongChoice && answer === currentCountry.name;
          const isWrong = wrongChoice === answer;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              className: `find-foxy__answer${isCorrect ? " is-correct" : ""}${isWrong ? " is-wrong" : ""}`,
              disabled: locked && !wrongChoice,
              onClick: () => handleAnswer(answer),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "find-foxy__answer-flag", children: FIND_FOXY_FLAGS[answer] ?? "🌍" }),
                answer
              ]
            },
            answer
          );
        }) }),
        wrongChoice && /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { className: "find-foxy__wrong", initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "find-foxy__wrong-title", children: "Oops! Try again!" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "find-foxy__wrong-button", onClick: () => setWrongChoice(null), children: "Try Again!" })
        ] })
      ] }),
      phase === "passport" && currentCountry && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "find-foxy__overlay", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "find-foxy__passport-book", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "find-foxy__passport-cover", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("img", { className: "find-foxy__passport-logo", src: foxyLogo, alt: "Find Foxy" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "find-foxy__passport-title", children: "Jangles Pass" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "find-foxy__passport-subtitle", children: "World Tour ✈ Official" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "find-foxy__passport-page", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "find-foxy__passport-header", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "find-foxy__page-number", children: [
              "Entry ",
              currentIndex + 1,
              " of ",
              TOTAL_STOPS
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "find-foxy__country-flag", children: FIND_FOXY_FLAGS[currentCountry.name] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "find-foxy__country-name", children: currentCountry.name })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "find-foxy__stamp", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "find-foxy__stamp-top", children: "Jangles Pass" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "find-foxy__stamp-emoji", children: "✈️" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "find-foxy__passport-found", children: "Found!" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "find-foxy__stamp-number", children: [
              currentIndex + 1,
              " / ",
              TOTAL_STOPS
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "find-foxy__passport-fact", children: currentCountry.fact }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "find-foxy__passport-next", onClick: handlePassportNext, children: currentIndex === TOTAL_STOPS - 1 ? "See My Full Jangles Pass! 🎉" : "Board the Plane! ✈" })
        ] })
      ] }) }),
      phase === "win" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "find-foxy__overlay", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "find-foxy__full-passport", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "find-foxy__full-passport-cover", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("img", { className: "find-foxy__passport-logo", src: foxyLogo, alt: "Find Foxy" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "find-foxy__full-passport-title", children: "Jangles Pass" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "find-foxy__full-passport-name", children: playerName }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "find-foxy__full-passport-subtitle", children: "World Tour ✈ Complete" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "find-foxy__full-score-pill", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "find-foxy__full-score-val", children: score }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "find-foxy__full-score-lbl", children: "stars" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "find-foxy__full-passport-pages", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "find-foxy__full-pages-header", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            "🎉 All ",
            order.length,
            " stamps collected!"
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "find-foxy__full-stamp-grid", children: order.map((countryIdx, visitIdx) => {
            const country = FIND_FOXY_COUNTRIES[countryIdx];
            return /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "div",
              {
                className: "find-foxy__full-stamp-card",
                style: { animationDelay: `${visitIdx * 0.04}s` },
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "find-foxy__full-stamp-circle", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "find-foxy__full-stamp-flag", children: FIND_FOXY_FLAGS[country.name] ?? "🌍" }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "find-foxy__full-stamp-num", children: [
                    "#",
                    visitIdx + 1
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "find-foxy__full-stamp-name", children: country.name })
                ]
              },
              country.name
            );
          }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "find-foxy__play-again", onClick: resetGame, children: "Fly Again!" })
        ] })
      ] }) })
    ] })
  ] });
}
function FindFoxyRoute() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(FindFoxyGame, {});
}
export {
  FindFoxyRoute as component
};
