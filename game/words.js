// Curated list of common 5-letter English words.
// Used to pick the secret answer / decoy word, AND as the dictionary
// that incoming chat guesses are checked against before they are
// accepted onto the board (see engine.js submitGuess()).
// (No offensive or obscure words - safe for a public livestream.)
export const WORDS = [
  "about", "above", "abuse", "acorn", "actor", "acute", "admit", "adopt", "adore", "adorn", "adult", "afoot",
  "after", "again", "agent", "agile", "agree", "ahead", "aisle", "alarm", "album", "alert", "alike", "alive",
  "allot", "allow", "alloy", "alone", "along", "alter", "amber", "amend", "among", "amuse", "angel", "anger",
  "angle", "angry", "angst", "annoy", "apart", "apple", "apply", "aptly", "arena", "argue", "arise", "armor",
  "aroma", "array", "arrow", "ashen", "aside", "asset", "atlas", "audio", "audit", "avoid", "awake", "award",
  "aware", "awash", "awful", "axiom", "bacon", "badge", "baker", "balmy", "banjo", "barge", "basic", "basil",
  "basis", "batch", "baton", "beach", "beard", "beast", "begin", "being", "belly", "belts", "bench", "berry",
  "birth", "bison", "black", "blade", "blame", "blank", "blast", "blaze", "bleed", "blend", "bless", "blind",
  "blitz", "bloat", "block", "blood", "bloom", "blown", "blues", "blunt", "board", "boast", "bonus", "boost",
  "booth", "booty", "bossy", "bound", "brain", "brand", "brave", "bread", "break", "breed", "brick", "bride",
  "brief", "bring", "brisk", "broad", "broke", "brook", "broth", "brown", "brunt", "brush", "buddy", "build",
  "built", "bulge", "bumpy", "bunch", "bunny", "burly", "burst", "cabin", "cable", "cadet", "camel", "canal",
  "candy", "canoe", "caper", "carol", "carve", "catch", "cause", "cease", "chain", "chair", "chalk", "champ",
  "chant", "chaos", "charm", "chart", "chase", "cheap", "check", "cheer", "chess", "chest", "chief", "child",
  "chill", "chirp", "choir", "choke", "chomp", "chore", "chose", "chunk", "civic", "civil", "claim", "clash",
  "class", "clean", "clear", "clerk", "click", "cliff", "climb", "cling", "clock", "close", "cloth", "cloud",
  "clown", "cluck", "coach", "coast", "cobra", "comet", "const", "corny", "cough", "could", "count", "coupe",
  "court", "cover", "covet", "crack", "craft", "cramp", "crane", "crank", "crash", "crave", "crawl", "crazy",
  "cream", "credo", "creek", "crepe", "crest", "crime", "crisp", "crook", "cross", "crowd", "crown", "crude",
  "cruel", "crumb", "crush", "crypt", "cubic", "curly", "curry", "curve", "cycle", "daily", "dance", "dealt",
  "death", "debut", "decay", "decoy", "defer", "delay", "delta", "demon", "dense", "depth", "derby", "diary",
  "digit", "dingo", "dirty", "disco", "dizzy", "dodge", "donor", "donut", "doubt", "douse", "dowel", "dozen",
  "draft", "drain", "drama", "drank", "drape", "drawl", "drawn", "dread", "dream", "dregs", "dress", "dried",
  "drift", "drill", "drink", "drive", "droop", "drove", "drown", "drunk", "dryer", "dunce", "dusky", "eager",
  "eagle", "early", "earth", "easel", "eaten", "ebony", "ebook", "edges", "eject", "elbow", "elder", "elect",
  "elite", "elope", "email", "empty", "enact", "ended", "enjoy", "enter", "entry", "epoxy", "equal", "equip",
  "erase", "erode", "error", "essay", "ether", "event", "every", "evoke", "exact", "exalt", "exert", "exile",
  "exist", "extra", "fable", "faced", "facet", "facts", "faint", "fairy", "faith", "false", "fancy", "fault",
  "fauna", "favor", "feast", "feign", "fella", "fence", "fetal", "fetch", "fever", "fiber", "field", "fiery",
  "fifth", "fifty", "fight", "final", "finch", "finer", "first", "fixed", "flags", "flair", "flake", "flame",
  "flank", "flash", "fleck", "fleet", "flesh", "flick", "flint", "float", "flock", "flood", "floor", "flour",
  "flout", "flows", "fluid", "flute", "focus", "foray", "force", "forge", "forgo", "forte", "forth", "forum",
  "found", "foyer", "frail", "frame", "frank", "fresh", "frisk", "front", "frost", "froze", "fruit", "fudge",
  "fungi", "gauge", "gauze", "gears", "gecko", "geese", "genre", "giant", "girth", "given", "gives", "glare",
  "glass", "gleam", "globe", "glory", "glove", "gnome", "going", "goofy", "gouge", "grace", "grade", "grain",
  "grand", "grant", "grape", "graph", "grasp", "grass", "grave", "gravy", "graze", "great", "greed", "green",
  "greet", "grief", "grill", "grimy", "grind", "grips", "groin", "groom", "grope", "gross", "group", "grout",
  "grove", "growl", "grown", "guard", "guess", "guest", "guide", "gully", "gusto", "habit", "hairy", "happy",
  "harsh", "haste", "haven", "hazel", "heard", "heart", "heavy", "hedge", "heist", "hence", "herbs", "hewer",
  "hills", "hinge", "hippo", "hoard", "hobby", "hoist", "hokey", "holly", "honey", "honky", "honor", "horse",
  "hotel", "hound", "house", "hovel", "hover", "human", "humid", "humor", "hurry", "hyena", "icing", "ideal",
  "igloo", "image", "imply", "index", "india", "inept", "infer", "inner", "input", "irony", "issue", "ivory",
  "jaded", "jazzy", "jelly", "joint", "joker", "jolly", "judge", "juice", "jumbo", "jumpy", "junky", "kayak",
  "kiosk", "knead", "kneel", "knelt", "knife", "knock", "known", "label", "labor", "laden", "lager", "lance",
  "large", "laser", "latch", "later", "latex", "laugh", "layer", "learn", "least", "leave", "legal", "lemon",
  "level", "lever", "light", "limit", "linen", "liver", "llama", "loamy", "lobby", "local", "lodge", "logic",
  "loopy", "loose", "lover", "lower", "loyal", "lucky", "lumpy", "lunar", "lunch", "lupus", "lying", "lymph",
  "macho", "magic", "major", "maker", "mango", "manic", "manor", "march", "marsh", "match", "mauve", "maybe",
  "mayor", "meant", "medal", "media", "mercy", "merge", "merit", "metal", "meter", "might", "mince", "minor",
  "minty", "minus", "mixed", "mocha", "model", "modem", "mogul", "money", "month", "moral", "mossy", "motto",
  "mould", "mount", "mouse", "mouth", "moved", "movie", "mucus", "mulch", "mural", "music", "naive", "naked",
  "nasal", "nasty", "naval", "nerve", "never", "newel", "newer", "newly", "nifty", "night", "noble", "noise",
  "nomad", "noose", "north", "notch", "novel", "nudge", "nurse", "nylon", "nymph", "obese", "ocean", "offal",
  "offer", "often", "olden", "olive", "onion", "onset", "opera", "opine", "orbit", "order", "organ", "other",
  "ought", "ounce", "outer", "ovary", "owlet", "owner", "ozone", "pagan", "panel", "panic", "paper", "party",
  "paste", "patch", "patio", "pause", "peace", "peach", "pearl", "pedal", "penny", "pesky", "petty", "phase",
  "phone", "photo", "piano", "piece", "piety", "pilot", "pitch", "pixel", "pizza", "place", "plaid", "plain",
  "plank", "plant", "plate", "plaza", "plead", "pluck", "plumb", "podge", "point", "poise", "poker", "polar",
  "polka", "porch", "pound", "power", "prank", "press", "price", "pride", "prime", "print", "prior", "prize",
  "probe", "proof", "proud", "prove", "prowl", "prude", "psalm", "pudgy", "pulse", "punch", "pupil", "purse",
  "quack", "quail", "quart", "queen", "query", "quest", "queue", "quick", "quiet", "quilt", "quirk", "quite",
  "quota", "quote", "radar", "radii", "radio", "raise", "rally", "ranch", "range", "rangy", "rapid", "ratio",
  "reach", "react", "ready", "realm", "rebel", "redid", "refer", "reign", "relax", "relay", "remit", "reply",
  "rerun", "reset", "retch", "retro", "retry", "rhino", "rhyme", "rider", "ridge", "rifle", "right", "rigid",
  "rigor", "rinse", "risky", "rival", "river", "roast", "robot", "rocky", "rogue", "roman", "roomy", "roost",
  "rough", "round", "route", "royal", "rugby", "ruler", "rumba", "rural", "rusty", "sable", "saggy", "saint",
  "salad", "salon", "salsa", "sandy", "sassy", "sauce", "sauna", "scale", "scarf", "scary", "scene", "scent",
  "scoop", "scope", "score", "scout", "scowl", "scrap", "screw", "seals", "seats", "sense", "serif", "serve",
  "seven", "shade", "shake", "shall", "shame", "shape", "shard", "share", "shark", "sharp", "shear", "sheep",
  "sheet", "shelf", "shell", "shift", "shine", "shirt", "shock", "shoot", "shore", "short", "shout", "shown",
  "shrew", "shrub", "shrug", "siege", "sight", "silky", "silly", "since", "sixth", "sixty", "skate", "skill",
  "skimp", "skirt", "skull", "slack", "slate", "sleek", "sleep", "slice", "slide", "slime", "slope", "slots",
  "slush", "small", "smart", "smell", "smile", "smirk", "smoke", "snack", "snake", "snarl", "sneak", "sniff",
  "snoop", "snowy", "soggy", "solar", "solid", "sonic", "sooty", "sound", "south", "space", "spade", "spare",
  "spark", "speak", "spear", "speed", "spell", "spend", "spent", "spice", "spike", "spilt", "spine", "spite",
  "split", "spoil", "spoke", "spoon", "sport", "spray", "sprig", "spurn", "squad", "stack", "staff", "stage",
  "staid", "stain", "stake", "stalk", "stall", "stamp", "stand", "stare", "stark", "start", "state", "stays",
  "steak", "steal", "steam", "steel", "steep", "steer", "stein", "stern", "stick", "stiff", "still", "sting",
  "stock", "stone", "stood", "store", "storm", "story", "stove", "strap", "straw", "strip", "stuck", "study",
  "stuff", "stump", "style", "suave", "sugar", "suite", "sunny", "sunup", "super", "surge", "surly", "swamp",
  "swarm", "swear", "sweat", "sweep", "sweet", "swept", "swift", "swing", "sword", "synod", "tabby", "table",
  "taboo", "taffy", "taken", "tangy", "tarot", "taste", "taxes", "teach", "teams", "tempo", "tenth", "tepid",
  "thank", "theft", "their", "theme", "there", "these", "thick", "thigh", "thing", "think", "third", "thorn",
  "those", "three", "threw", "throw", "thrum", "thumb", "thump", "tibia", "tiger", "tight", "timer", "tipsy",
  "tired", "title", "toady", "toast", "today", "token", "tonal", "tonic", "torso", "touch", "tough", "tower",
  "toxic", "trace", "track", "trade", "trail", "train", "trait", "tramp", "trash", "tread", "treat", "trend",
  "trial", "tribe", "trick", "tried", "trove", "truck", "truly", "trunk", "trust", "truth", "tryst", "tulip",
  "tulle", "tumor", "tutor", "twice", "twine", "twist", "ultra", "uncle", "under", "undue", "unfit", "unify",
  "union", "unity", "until", "upper", "upset", "urban", "urged", "usage", "usher", "using", "usual", "usury",
  "utter", "vague", "valid", "valve", "vapid", "vapor", "vault", "venom", "venue", "verge", "verse", "vicar",
  "video", "vinyl", "viola", "viral", "virus", "visit", "vital", "vivid", "vocal", "vodka", "voice", "voter",
  "vouch", "wager", "wagon", "waist", "watch", "water", "wedge", "whack", "wharf", "wheat", "wheel", "where",
  "which", "while", "whine", "whisk", "white", "whole", "whose", "widen", "widow", "width", "wimpy", "witch",
  "witty", "woken", "woman", "words", "world", "worry", "worse", "worth", "would", "wound", "woven", "wrath",
  "wrist", "write", "wrong", "wrung", "yacht", "yearn", "yield", "yodel", "young", "youth", "zebra", "zesty",
  "zonal",
];

const WORD_SET = new Set(WORDS);

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
  return WORD_SET.has(String(w).toLowerCase());
}