// Curated list of common 5-letter English words.
// Used to pick the secret answer and the per-guess decoy word.
// (No offensive or obscure words - safe for a public livestream.)
export const WORDS = [
  "about", "above", "abuse", "actor", "acute", "admit", "adopt", "adult", "after", "again", "agent", "agree",
  "ahead", "alarm", "album", "alert", "alike", "alive", "allow", "alone", "along", "alter", "amber", "amend",
  "among", "angel", "anger", "angle", "angry", "apart", "apple", "apply", "arena", "argue", "arise", "armor",
  "aroma", "array", "arrow", "aside", "asset", "audio", "audit", "avoid", "awake", "award", "aware", "badge",
  "baker", "basic", "basis", "batch", "beach", "beard", "beast", "begin", "being", "belts", "bench", "birth",
  "black", "blade", "blame", "blank", "blast", "blaze", "bleed", "blend", "bless", "blind", "block", "blood",
  "bloom", "blown", "blues", "blunt", "board", "boast", "boost", "booth", "bound", "brain", "brand", "brave",
  "bread", "break", "breed", "brick", "bride", "brief", "bring", "broad", "broke", "brook", "brown", "brush",
  "build", "built", "bunch", "burst", "cabin", "cable", "candy", "canal", "canoe", "carve", "catch", "cause",
  "cease", "chain", "chair", "chalk", "champ", "chaos", "charm", "chart", "chase", "cheap", "check", "cheer",
  "chess", "chest", "chief", "child", "chill", "chirp", "choir", "chose", "chunk", "civil", "claim", "clash",
  "class", "clean", "clear", "clerk", "click", "cliff", "climb", "cling", "clock", "close", "cloth", "cloud",
  "clown", "coach", "coast", "could", "count", "court", "cover", "covet", "crack", "craft", "crane", "crash",
  "crawl", "crazy", "cream", "credo", "creek", "crest", "crime", "crisp", "cross", "crowd", "crown", "crude",
  "cruel", "crush", "curve", "cycle", "daily", "dance", "dealt", "death", "debut", "decay", "delay", "delta",
  "demon", "dense", "depth", "derby", "diary", "digit", "dirty", "disco", "dizzy", "donor", "doubt", "dozen",
  "draft", "drain", "drama", "drank", "drawn", "dread", "dream", "dress", "dried", "drift", "drill", "drink",
  "drive", "drove", "drown", "drunk", "dryer", "eager", "eagle", "early", "earth", "easel", "ebony", "edges",
  "elbow", "elder", "elect", "elite", "email", "empty", "enact", "ended", "enjoy", "enter", "entry", "equal",
  "equip", "erase", "error", "essay", "event", "every", "exact", "exile", "exist", "extra", "fable", "faced",
  "facts", "faint", "fairy", "faith", "false", "fancy", "fault", "favor", "feast", "fence", "fetch", "fever",
  "fiber", "field", "fiery", "fifth", "fifty", "fight", "final", "finch", "finer", "first", "fixed", "flags",
  "flake", "flame", "flash", "fleet", "flesh", "flick", "flint", "float", "flock", "flood", "floor", "flour",
  "flows", "fluid", "flute", "focus", "force", "forge", "forgo", "forth", "forum", "found", "frame", "frank",
  "fresh", "front", "frost", "fruit", "gauge", "gears", "geese", "genre", "giant", "girth", "given", "gives",
  "glare", "glass", "gleam", "globe", "glory", "glove", "going", "grace", "grade", "grain", "grand", "grant",
  "grape", "graph", "grasp", "grass", "grave", "graze", "great", "greed", "green", "greet", "grief", "grill",
  "grind", "grips", "grope", "gross", "group", "grove", "growl", "grown", "guard", "guess", "guest", "guide",
  "habit", "hairy", "happy", "harsh", "haste", "haven", "heard", "heart", "heavy", "hedge", "hence", "herbs",
  "hills", "hobby", "hoist", "honey", "honor", "horse", "hotel", "hound", "house", "hover", "human", "humor",
  "hurry", "ideal", "image", "imply", "index", "inner", "input", "issue", "ivory", "jazzy", "jelly", "joint",
  "joker", "judge", "juice", "jumbo", "jumpy", "junky", "kayak", "kneel", "knife", "knock", "known", "label",
  "labor", "laden", "lance", "large", "laser", "latch", "later", "laugh", "layer", "learn", "least", "leave",
  "legal", "lemon", "level", "lever", "light", "limit", "linen", "liver", "lobby", "local", "lodge", "logic",
  "loose", "lover", "lower", "loyal", "lucky", "lunar", "lunch", "lying", "magic", "major", "maker", "mango",
  "march", "marsh", "match", "maybe", "mayor", "meant", "medal", "media", "mercy", "merge", "merit", "metal",
  "meter", "might", "mince", "minor", "minus", "mixed", "model", "money", "month", "moral", "mould", "mount",
  "mouse", "mouth", "moved", "movie", "mural", "music", "naive", "naked", "nasty", "naval", "nerve", "never",
  "newer", "newly", "night", "noble", "noise", "north", "notch", "novel", "nurse", "nymph", "ocean", "offer",
  "often", "olive", "onset", "opera", "orbit", "order", "organ", "other", "ought", "ounce", "outer", "owner",
  "ozone", "panel", "panic", "paper", "party", "patch", "pause", "peace", "pearl", "pedal", "penny", "phase",
  "phone", "photo", "piano", "piece", "pilot", "pitch", "pizza", "place", "plain", "plank", "plant", "plate",
  "plaza", "plead", "pluck", "point", "poise", "poker", "polar", "porch", "pound", "power", "press", "price",
  "pride", "prime", "print", "prior", "prize", "probe", "proof", "proud", "prove", "pulse", "punch", "pupil",
  "purse", "quack", "quail", "quart", "queen", "query", "quest", "queue", "quick", "quiet", "quilt", "quite",
  "quota", "quote", "radar", "radio", "raise", "rally", "ranch", "range", "rapid", "ratio", "reach", "react",
  "ready", "realm", "rebel", "refer", "reign", "relax", "relay", "remit", "reply", "reset", "retro", "rhyme",
  "rider", "ridge", "rifle", "right", "rigid", "rinse", "rival", "river", "roast", "robot", "rocky", "rogue",
  "roman", "roost", "rough", "round", "route", "royal", "ruler", "rural", "rusty", "saint", "salad", "salon",
  "sandy", "sauce", "scale", "scarf", "scary", "scene", "scent", "scoop", "scope", "score", "scout", "scrap",
  "screw", "seals", "seats", "sense", "serve", "seven", "shade", "shake", "shall", "shame", "shape", "share",
  "shark", "sharp", "shear", "sheep", "sheet", "shelf", "shell", "shift", "shine", "shirt", "shock", "shoot",
  "shore", "short", "shout", "shown", "shrub", "sight", "silly", "since", "sixth", "sixty", "skate", "skill",
  "skirt", "skull", "slack", "slate", "sleek", "sleep", "slice", "slide", "slime", "slope", "slots", "small",
  "smart", "smell", "smile", "smoke", "snack", "snake", "sneak", "snowy", "solar", "solid", "sonic", "sound",
  "south", "space", "spade", "spare", "spark", "speak", "spear", "speed", "spell", "spend", "spice", "spike",
  "spine", "spite", "split", "spoil", "spoke", "sport", "spray", "squad", "stack", "staff", "stage", "stain",
  "stake", "stamp", "stand", "stare", "start", "state", "stays", "steak", "steal", "steam", "steel", "steep",
  "steer", "stern", "stick", "stiff", "still", "sting", "stock", "stone", "stood", "store", "storm", "story",
  "stove", "strap", "straw", "strip", "stuck", "study", "stuff", "style", "sugar", "suite", "sunny", "super",
  "surge", "swamp", "swarm", "swear", "sweat", "sweep", "sweet", "swept", "swift", "swing", "sword", "table",
  "taken", "taste", "taxes", "teach", "teams", "tempo", "tenth", "thank", "theft", "their", "theme", "there",
  "these", "thick", "thing", "think", "third", "those", "three", "threw", "throw", "thumb", "thump", "tiger",
  "tight", "timer", "tired", "title", "toast", "today", "token", "tonic", "touch", "tough", "tower", "toxic",
  "trace", "track", "trade", "trail", "train", "trait", "tramp", "trash", "tread", "treat", "trend", "trial",
  "tribe", "trick", "tried", "truck", "truly", "trunk", "trust", "truth", "tulip", "tumor", "tutor", "twice",
  "twist", "ultra", "uncle", "under", "undue", "union", "unity", "until", "upper", "upset", "urban", "usage",
  "usher", "using", "usual", "utter", "vague", "valid", "valve", "vapor", "vault", "venue", "verse", "video",
  "vinyl", "viral", "virus", "visit", "vital", "vivid", "vocal", "voice", "voter", "vouch", "wagon", "waist",
  "watch", "water", "wheat", "wheel", "where", "which", "while", "whine", "white", "whole", "whose", "widen",
  "widow", "width", "witty", "woman", "world", "worry", "worse", "worth", "would", "wound", "woven", "wrist",
  "write", "wrong", "yield", "young", "youth", "zebra", "zesty",
];

export function randomWord(exclude = []) {
  const ex = new Set(exclude);
  let w;
  let guard = 0;
  do {
    w = WORDS[Math.floor(Math.random() * WORDS.length)];
    guard++;
  } while (ex.has(w) && guard < 200);
  return w;
}

export function isKnownWord(w) {
  return WORDS.includes(String(w).toLowerCase());
}