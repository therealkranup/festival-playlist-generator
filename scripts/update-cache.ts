/**
 * Update festival cache with FULL lineups (fixes trimmed artist lists).
 * Deletes existing entries and re-caches with complete data.
 *
 * Usage: npx tsx scripts/update-cache.ts
 */

import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || "";
const SPOTIFY_ID = process.env.SPOTIFY_CLIENT_ID || "";
const SPOTIFY_SECRET = process.env.SPOTIFY_CLIENT_SECRET || "";

if (!SUPABASE_URL || !SUPABASE_KEY) { console.error("Missing Supabase config"); process.exit(1); }
if (!SPOTIFY_ID || !SPOTIFY_SECRET) { console.error("Missing Spotify config"); process.exit(1); }

interface FestivalData {
  name: string; year: number; location: string; dates: string;
  country: string; genre: string; artists: string[];
}

const FESTIVALS: FestivalData[] = [
  // DENMARK
  {
    name: "Roskilde Festival", year: 2026, location: "Roskilde, Denmark", dates: "Jun 27 - Jul 4",
    country: "Denmark", genre: "All genres",
    artists: ["The Cure","Gorillaz","Lily Allen","David Byrne","Zara Larsson","Wolf Alice","EsDeeKid","JADE","Ethel Cain","Kneecap","Lykke Li","Little Simz","Napalm Death","Addison Rae","Yung Lean","Clipse","Young Miko","Uncle Acid & The Deadbeats","The Zawose Queens","Rizwan-Muazzam Qawwali","Los Mirlos","Liniker","Marwan Moussa","Honningbarna","Tobias Rahim","Bruno Berle","Tessa","Bad Gyal","BB Trickz"]
  },
  {
    name: "Copenhell", year: 2026, location: "Copenhagen, Denmark", dates: "Jun 24 - 27",
    country: "Denmark", genre: "Metal/Rock",
    artists: ["Iron Maiden","Bring Me The Horizon","Twisted Sister","Volbeat","A Perfect Circle","Alice Cooper","Anthrax","Mastodon","Trivium","Papa Roach","P.O.D.","Social Distortion","Ice Nine Kills","Babymetal","Black Label Society","Suicidal Tendencies","Loathe","Malevolence","The Pretty Reckless","Tom Morello","Sepultura","Static-X","Queensrÿche","Alestorm","Soilwork","All Them Witches","Bury Tomorrow","Calva Louise","Chopper","Defecto","Dogma","End It","Gridiron","Iotunn","Katla","Konvent","Kublai Khan TX","Neckbreakker","Paleface Swiss","Powerplant","Scimitar","Six Feet Under","Slay Squad","Split","The Browning","Thrown","Trollfest","Vexed","Voice of Baceprot","Gaerea","Black Oak County","Imminence","Djerv","Eyehategod"]
  },
  {
    name: "Smukfest", year: 2026, location: "Skanderborg, Denmark", dates: "Aug 2 - 9",
    country: "Denmark", genre: "Pop/Rock/Electronic",
    artists: ["Robbie Williams","Lewis Capaldi","Lukas Graham","D-A-D","Drew Sycamore","Tom Odell","The Minds of 99","Peter Sommer","Kesi","Lars Lilholt Band","Hej Matematik","Ulige Numre","Zar Paulo","Annika","Artigeardit","Augusta Schackinger","Benny Jamz","Dina Ögon","Gnags","Gobs","Halberg","Karoline Mousing","Katinka","KEDDE","Laurie Wright","Mille","MORTEN","Ozzy","Poul Krebs","Rosa","Saveus","Sofie1998","Von Quar","Simon Kvamm","Ray Dee Ohh"]
  },
  {
    name: "NorthSide", year: 2026, location: "Aarhus, Denmark", dates: "Jun 4 - 6",
    country: "Denmark", genre: "Pop/Rock/Electronic",
    artists: ["Jack White","Big Thief","Charlotte de Witte","Empire of the Sun","IDLES","Skepta","Ashnikko","Father John Misty","Goose","Viagra Boys","Primal Scream","Sudan Archives","Tinlicker","Baxter Dury","Thomas Helmig","Alex Vargas","Blaue Blume","CMAT","Jonah Blacksmith","Kalaset","Patina","Sienna Spiro","Uro","Aphaca","Ashes of Billy","Carl Knast","Elias Rønnenfelt","Florence Road","Kayak","The Lottery Winners","Red Leather","Rigmor","Skullcrusher"]
  },
  {
    name: "Tinderbox", year: 2026, location: "Odense, Denmark", dates: "Jun 25 - 27",
    country: "Denmark", genre: "Pop/Rock/Hip-hop",
    artists: ["Charlie Puth","Jamiroquai","The Offspring","Pitbull","Rasmus Seebach","Thomas Helmig","CamelPhat","Moby","Alesso","Latto","Afrojack","White Lies","Dogstar","Jonah Blacksmith","Aphaca","Berg","Blaue Blume","Agents of Time","Marten Hørger"]
  },
  {
    name: "Distortion", year: 2026, location: "Copenhagen, Denmark", dates: "Jun 3 - 7",
    country: "Denmark", genre: "Electronic",
    artists: ["Peggy Gou","Sara Landry","Carlita","Whomadewho","Innellea","KI/KI","Marlon Hoffstadt","Axel Boman","Kesi","Parra for Cuva","Charlie Sparks","Anetha","Pegassi","Shlømo","Monkey Safari","Funk Tribu","Isolee","Alignment","Adam Ten","Rune Rask","Emil Kruse","Lord Siva","Sira Jovina","Von Quar"]
  },
  {
    name: "Heartland Festival", year: 2026, location: "Kværndrup, Denmark", dates: "Jun 18 - 20",
    country: "Denmark", genre: "Culture/Music",
    artists: ["Nick Cave and the Bad Seeds","4 Non Blondes","Manic Street Preachers","Snail Mail","Spleen United","The Minds Of 99","LP","Malk de Koijn","Katinka","DON WEST","Gnags","Jason Isbell and the 400 Unit","Hugorm","Max McNown","Pil","Guldimund","Mille"]
  },
  // GERMANY
  {
    name: "Wacken Open Air", year: 2026, location: "Wacken, Germany", dates: "Jul 29 - Aug 1",
    country: "Germany", genre: "Metal",
    artists: ["Def Leppard","Judas Priest","Powerwolf","In Flames","Lamb of God","Emperor","Europe","Sepultura","Airbourne","Running Wild","Grand Magus","Pig Destroyer","Mantar","Orbit Culture","Paleface Swiss","Thrown","Of Mice & Men","Fit For An Autopsy","Thundermother","The Gathering","Faun","Savatage","Nevermore","Allt","Any Given Day","Blood Command","Blood Fire Death","Broken By The Scream","Einherjer","Future Palace","Gutalax","Insanity Alert","H-Blockx","Kupfergold","Luna Kills","Ten56","The Hardkiss"]
  },
  {
    name: "Rock am Ring", year: 2026, location: "Nürburgring, Germany", dates: "Jun 5 - 7",
    country: "Germany", genre: "Rock/Metal/Alt",
    artists: ["Linkin Park","Iron Maiden","Limp Bizkit","Volbeat","Papa Roach","Bad Omens","Electric Callboy","Sabaton","The Offspring","A Perfect Circle","Architects","Babymetal","Breaking Benjamin","Mastodon","The Hives","Hollywood Undead","Ice Nine Kills","Social Distortion","The Pretty Reckless","Alter Bridge","Bush","Don Broco","Drain","Loathe","Malevolence","Marteria","Tom Morello","Alter Bridge","Ankor","Bad Nerves","Badflower","Basement","Bilmuri","Black Veil Brides","Blood Incantation","Bloodywood","Boundaries","Bury Tomorrow","Catch Your Breath","Danko Jones","Dying Wish","Ecca Vandal","Ego Kill Talent","Finch","Gatecreeper","H-Blockx","High Vis","Kublai Khan TX","Landmvrks","Magnolia Park","Palaye Royale","Paleface Swiss","Set It Off","Slay Squad","Sondaschule","TesseracT","The Funeral Portrait","The Garden","The Plot In You"]
  },
  {
    name: "Rock im Park", year: 2026, location: "Nuremberg, Germany", dates: "Jun 5 - 7",
    country: "Germany", genre: "Rock/Metal/Alt",
    artists: ["Linkin Park","Iron Maiden","Limp Bizkit","Bad Omens","Electric Callboy","Papa Roach","Sabaton","The Offspring","Volbeat","Ice Nine Kills","Landmvrks","Marteria","Three Days Grace","Tom Morello","A Perfect Circle","Hollywood Undead","Social Distortion","Alter Bridge","The Pretty Reckless","Babymetal","Breaking Benjamin","Badflower","Basement","Bilmuri","Bury Tomorrow","Dying Wish","Ecca Vandal","H-Blockx","High Vis","Max Grimm","Palaye Royale","Paleface Swiss","The Garden","The Subways","Thornhill","Wargasm","Finch","Bad Nerves","Black Veil Brides","Blood Incantation","Bloodywood","Boundaries","Catch Your Breath","Ego Kill Talent"]
  },
  {
    name: "Airbeat One", year: 2026, location: "Neustadt-Glewe, Germany", dates: "Jul 8 - 12",
    country: "Germany", genre: "EDM/Hardstyle",
    artists: ["Charlotte de Witte","Amelie Lens","Boris Brejcha","Scooter","Timmy Trumpet","Vini Vici","W&W","Paul van Dyk","ATB","Hardwell","Angerfist","Da Tweekaz","Ran-D","Kölsch","Vintage Culture","Innellea","Westbam","Cascada","Neelix","Dash Berlin","Marlon Hoffstadt","Prada2000","Alfred Heinrichs","Artbat","Brennan Heart","HBz","Holy Priest","Lilly Palmer","Will Sparks","Andrew Rayel","Ben Nicky","Blastoyz","Einmusik","HNTR","Korolova","Layla Benitez","Marten Hørger","Pretty Pink"]
  },
  {
    name: "Splash! Festival", year: 2026, location: "Gräfenhainichen, Germany", dates: "Jul 2 - 4",
    country: "Germany", genre: "Hip-hop",
    artists: ["Gunna","Destroy Lonely","OG Keemo","Jazeek","Quavo","Ski Mask The Slump God","Haftbefehl","EsDeeKid","Symba","Molly Santana"]
  },
  // UK
  {
    name: "Download Festival", year: 2026, location: "Donington, UK", dates: "Jun 10 - 14",
    country: "UK", genre: "Metal/Rock",
    artists: ["Guns N' Roses","Linkin Park","Limp Bizkit","Cypress Hill","Electric Callboy","Pendulum","Hollywood Undead","Trivium","Babymetal","Bad Omens","Ice Nine Kills","The Pretty Reckless","Architects","Behemoth","Mastodon","Tom Morello","Social Distortion","A Day To Remember","Scooter","The All-American Rejects","Halestorm","Cavalera","Static-X","Drain","Drowning Pool","P.O.D.","Bush","Feeder","Ash","Hot Milk","Bloodywood","Kublai Khan TX","Paleface Swiss","Scene Queen","South Arcade","Thornhill","Landmvrks","Black Veil Brides","Set It Off","Caskets","We Came As Romans","Periphery","Creeper","Silent Planet","Dogstar","Mammoth","Catch Your Breath","Ego Kill Talent","Story of the Year","Sleep Theory","Marmozets","Magnolia Park","Blood Incantation","Gatecreeper","Boundaries","Ankor","Corrosion of Conformity","BAND-MAID","Cavalera","Spineshank"]
  },
  {
    name: "Reading Festival", year: 2026, location: "Reading, UK", dates: "Aug 27 - 30",
    country: "UK", genre: "Rock/Alt/Pop",
    artists: ["Charli XCX","Chase & Status","Dave","Florence + The Machine","Fontaines DC","Raye","Gunna","Loyle Carner","Declan McKenna","Maisie Peters","Holly Humberstone","Viagra Boys","Men I Trust","James Marriott","Arthur Hill","Julia Wolf","Clara La San","Cruz Beckham","Violet Grohl"]
  },
  {
    name: "Leeds Festival", year: 2026, location: "Leeds, UK", dates: "Aug 27 - 30",
    country: "UK", genre: "Rock/Alt/Pop",
    artists: ["Charli XCX","Chase & Status","Dave","Florence + The Machine","Fontaines DC","Raye","Gunna","Loyle Carner","Declan McKenna","Maisie Peters","Holly Humberstone","Kasabian","The Lathums","James Marriott","Julia Wolf","Clara La San"]
  },
  {
    name: "Isle of Wight Festival", year: 2026, location: "Newport, UK", dates: "Jun 18 - 21",
    country: "UK", genre: "Pop/Rock",
    artists: ["Lewis Capaldi","Calvin Harris","The Cure","Teddy Swims","Wet Leg","The Kooks","Tom Grennan","The Last Dinner Party","Feeder","Rick Astley","Two Door Cinema Club","Perrie","Joel Corry","Rita Ora","Circa Waves","Ash","Level 42","Anastacia","KT Tunstall","Sex Pistols","David Gray","Shed Seven","Starsailor","Suzanne Vega","Alessi Rose","The Twilight Sad","Good Neighbours","Maxïmo Park","Nathan Evans","Saint PHNX"]
  },
  // BELGIUM
  {
    name: "Tomorrowland", year: 2026, location: "Boom, Belgium", dates: "Jul 17 - 26",
    country: "Belgium", genre: "EDM",
    artists: ["Calvin Harris","David Guetta","Martin Garrix","Fisher","John Summit","Hardwell","Dimitri Vegas & Like Mike","Sara Landry","Lost Frequencies","Kaskade","Patrick Topping","Amelie Lens","Charlotte de Witte","Peggy Gou","Solomun","Vintage Culture","Sebastian Ingrosso","Henri PFR","Kevin de Vries","Agents of Time","Chainsmokers","NOVAH","Marlon Hoffstadt","The Blessed Madonna","HAAi","Oscar and the Wolf","Job Jobse","Avalon Emerson","Ben UFO","Modeselektor","Sasha","Matisse & Sadko","Wade","Nico Moreno","I Hate Models","Holy Priest","Maddix","BYORN","Shlømo","Dom Dolla"]
  },
  {
    name: "Pukkelpop", year: 2026, location: "Hasselt, Belgium", dates: "Aug 20 - 23",
    country: "Belgium", genre: "Alt/Rock/Electronic",
    artists: ["Tyler, The Creator","Florence + The Machine","Deftones","Zara Larsson","YUNGBLUD","Turnstile","Pendulum","Major Lazer","Soulwax","Wet Leg","The Hives","Amyl and The Sniffers","Parcels","JPEGMAFIA","Denzel Curry","Earl Sweatshirt","Underworld","Dom Dolla","Purple Disco Machine","Lambrini Girls","Deafheaven","Blood Orange","John Summit","Kelis","Wednesday","Sombr","KI/KI","Adriatique","NOVAH","Kettama","Basement","Fiddlehead","Jane Remover","Joy Orbison","Maribou State","Merol","Ninajirachi","Show Me The Body","Speed","Wunderhorse","Chat Pile","Dimension","Kurt Vile","Ravyn Lenae","Sprints","Trash Talk","Violet Grohl","Wilkinson"]
  },
  {
    name: "Graspop Metal Meeting", year: 2026, location: "Dessel, Belgium", dates: "Jun 18 - 21",
    country: "Belgium", genre: "Metal",
    artists: ["Def Leppard","Megadeth","Bring Me The Horizon","Sabaton","Volbeat","Limp Bizkit","The Offspring","Electric Callboy","Bad Omens","Architects","Ice Nine Kills","Alice Cooper","Anthrax","Breaking Benjamin","Hollywood Undead","Mastodon","Alter Bridge","Babymetal","Bush","Foreigner","Europe","Lacuna Coil","Pennywise","Behemoth","Drain","Periphery","A Day To Remember","Leprous","Accept","Avatar","Battle Beast","Black Label Society","Bloodywood","Carpenter Brut","Catch Your Breath","Corrosion Of Conformity","Cult Of Luna","Death To All","Decapitated","Drowning Pool","Ego Kill Talent","Elder","Extreme","Feuerschwanz","Future Palace","Gaerea","Gatecreeper","Harm's Way","Kadavar","Kanonenfieber","Kublai Khan TX","Lagwagon","Lakeview","Letlive","Life Of Agony","Lionheart","Loathe","Magnolia Park","Mammoth","Moonspell","Mouth Culture","P.O.D.","Sex Pistols","Cradle Of Filth","Orden Ogan"]
  },
  // NETHERLANDS
  {
    name: "Lowlands", year: 2026, location: "Biddinghuizen, Netherlands", dates: "Aug 21 - 23",
    country: "Netherlands", genre: "All genres",
    artists: ["Tyler, The Creator","Lorde","Major Lazer","Turnstile","Blood Orange","JPEGMAFIA","Amyl & The Sniffers","Parcels","Kneecap","Clipse","Ravyn Lenae","Geese","Floating Points","Nia Archives","Maribou State","Dijon","Eefje de Visser","S10","Steel Pulse","Wunderhorse","Violent Magic Orchestra","Antoon","Cobrah","Dove Ellis","Guilt Trip","Maruja","Speed","Sombr","President","Richie Hawtin"]
  },
  {
    name: "Pinkpop", year: 2026, location: "Landgraaf, Netherlands", dates: "Jun 19 - 21",
    country: "Netherlands", genre: "Rock/Pop",
    artists: ["Foo Fighters","The Cure","Twenty One Pilots","Editors","Teddy Swims","Yungblud","Zara Larsson","Franz Ferdinand","IDLES","The Pretty Reckless","Wet Leg","Dogstar","White Lies","Sofi Tukker","Giant Rooks","Sleep Theory","The Plot In You","Royel Otis","Alessi Rose","Fat Dog","Kingfishr","Roxy Dekker","Di-Rect","Suzan & Freek","Bente","HAEVN","Lauren Spencer Smith","Max McNown","Ski Aggu","The Beaches","The Haunted Youth"]
  },
  {
    name: "Amsterdam Dance Event", year: 2026, location: "Amsterdam, Netherlands", dates: "Oct 21 - 25",
    country: "Netherlands", genre: "Electronic",
    artists: ["David Guetta","Hardwell","Armin van Buuren","Afrojack","Solomun","Maceo Plex","KI/KI","Jean-Michel Jarre"]
  },
  // SPAIN
  {
    name: "Primavera Sound", year: 2026, location: "Barcelona, Spain", dates: "Jun 4 - 6",
    country: "Spain", genre: "Indie/Alt/Pop",
    artists: ["The Cure","Doja Cat","The xx","Gorillaz","Massive Attack","My Bloody Valentine","Addison Rae","Skrillex","Bad Gyal","PinkPantheress","Peggy Gou","Little Simz","Big Thief","Slowdive","Wet Leg","Father John Misty","Blood Orange","Alex G","Ethel Cain","Lola Young","Kneecap","Viagra Boys","Knocked Loose","Dijon","Yard Act","Amaarae","Buscabulla"]
  },
  {
    name: "Sónar", year: 2026, location: "Barcelona, Spain", dates: "Jun 18 - 20",
    country: "Spain", genre: "Electronic",
    artists: ["Kelis","Skepta","Charlotte de Witte","Joy Orbison","Nia Archives","Boys Noize","Amelie Lens","Marcel Dettmann","MK","TSHA","FJAAK","Cabaret Voltaire","Sammy Virji","Gerd Janson","Julianna Barwick","Mary Lattimore","DJ Gigola","Chris Stussy","Namasenda","Funk Tribu","Kettama","Kittin"]
  },
  {
    name: "Mad Cool", year: 2026, location: "Madrid, Spain", dates: "Jul 8 - 11",
    country: "Spain", genre: "Rock/Pop/Electronic",
    artists: ["Foo Fighters","Florence + The Machine","Twenty One Pilots","Lorde","Nick Cave & The Bad Seeds","Kings Of Leon","The War On Drugs","Halsey","Teddy Swims","Pixies","The Black Crowes","David Byrne","A Perfect Circle","Interpol","Sigrid","Kasabian","Wolf Alice","Moby","The Last Dinner Party","Holly Humberstone","The Vaccines","Pulp","Jennie","Polo & Pan","Richie Hawtin","Nina Kraviz","The Warning","Jalen Ngonda","Matt Berninger","The Reytons","Jehnny Beth","Palaye Royale","Dogstar","Hot Milk"]
  },
  // FRANCE
  {
    name: "Hellfest", year: 2026, location: "Clisson, France", dates: "Jun 18 - 21",
    country: "France", genre: "Metal/Rock",
    artists: ["Iron Maiden","Bring Me The Horizon","Limp Bizkit","The Offspring","Deep Purple","Sabaton","Volbeat","Bad Omens","Papa Roach","Megadeth","Architects","Alice Cooper","Opeth","Helloween","A Perfect Circle","The Hives","Breaking Benjamin","Tom Morello","Rise Against","The Pretty Reckless","Sepultura","Anthrax","Three Days Grace","Social Distortion","Mastodon","Behemoth","Napalm Death","Mayhem","Ultra Vomit","The Dillinger Escape Plan","Hatebreed","The Adicts","Kadavar","Cult Of Luna","Down","Acid Bath","Igorrr","Blood Incantation","Deicide","Skáld"]
  },
  {
    name: "Rock en Seine", year: 2026, location: "Paris, France", dates: "Aug 26 - 30",
    country: "France", genre: "Rock/Indie",
    artists: ["Tyler, The Creator","Nick Cave & The Bad Seeds","The Cure","Lorde","Deftones","Wet Leg","Franz Ferdinand","Interpol","Turnstile","Slowdive","Amyl and The Sniffers","Biffy Clyro","Tash Sultana","Lambrini Girls","Ravyn Lenae","Kurt Vile","AFI","Mannequin Pussy","Dry Cleaning","Djo","Sombr","Fcukers","Landmvrks","Sam Quealy","CMAT","Miki","The Black Keys","Wilco","Bertrand Belin"]
  },
  // SCANDINAVIA
  {
    name: "Sweden Rock Festival", year: 2026, location: "Sölvesborg, Sweden", dates: "Jun 3 - 6",
    country: "Sweden", genre: "Rock/Metal",
    artists: ["Iron Maiden","Volbeat","Bring Me The Horizon","Joan Jett and the Blackhearts","The Offspring","Helloween","Babymetal","Saxon","Savatage","Tom Morello","Social Distortion","The Hellacopters","Yngwie Malmsteen","Foreigner","Down","Three Days Grace","Trivium","Black Label Society","Alestorm","Static-X","Candlemass","Evergrey","Michael Monroe","Overkill","Forbidden","Clawfinger","Treat","Magnus Uggla","The Halo Effect","Wilmer X","Adept","The Poodles","Eclipse","Crashed"]
  },
  {
    name: "Way Out West", year: 2026, location: "Gothenburg, Sweden", dates: "Aug 13 - 15",
    country: "Sweden", genre: "Indie/Pop/Electronic",
    artists: ["The Cure","Gorillaz","Lorde","Nick Cave & The Bad Seeds","Moby","Lily Allen","Zara Larsson","The xx","Clipse","Blood Orange","Lykke Li","Wilco","Four Tet","Ezra Collective","Maribou State","Ravyn Lenae","The Hives","Geese","Dijon","Jane Remover","Veronica Maggio","Anna von Hausswolff","Bonnie Prince Billy","DJ Koze","Current Joys","Oklou","Lambrini Girls","Jalen Ngonda","Smerz","Nu Genea","Alessi Rose","Arthur Verocai","Fcukers","Yaeger","Rochelle Jordan","Ash Lauryn","DJ Boring","DJ Gigola","Kettama","Ninajirachi","Annahstasia","Peder Mannerfelt"]
  },
  {
    name: "Tons of Rock", year: 2026, location: "Oslo, Norway", dates: "Jun 24 - 27",
    country: "Norway", genre: "Metal/Rock",
    artists: ["Iron Maiden","Bring Me the Horizon","Limp Bizkit","Alice Cooper","Twisted Sister","Mayhem","Anthrax","The Offspring","Trivium","Babymetal","A Perfect Circle","Suicidal Tendencies","The Hives","Tom Morello","Sepultura","The Pretty Reckless","Queensrÿche","Blood Incantation","Leprous","Rival Sons","Behemoth","Elder","Gaerea","The Warning","D-A-D","Pain","The Funeral Portrait","Imminence","Audrey Horne","Eivør","Gatecreeper","Kublai Khan TX","Paleface Swiss","Possessed","President","Raga Rockers","Slay Squad","The Baboon Show","The Carburetors","W.A.S.P.","Black Label Society","Yungblud"]
  },
  {
    name: "Inferno Metal Festival", year: 2026, location: "Oslo, Norway", dates: "Apr 2 - 5",
    country: "Norway", genre: "Metal",
    artists: ["Mayhem","Deicide","Enslaved","Cult of Luna","Old Man's Child","The Kovenant","Kanonenfieber","Tormentor","Samael","Primordial","Incantation","Hulder","Møl","Funeral","Mork","Firespawn","Darvaza","Der Weg einer Freiheit","Auðn","Whoredom Rife","Svarttjern","1914","Groza","Sadistic Intent","Nite","Perchta","Hierophant","Zatokrev","Bizarrekult","Malum","Katla"]
  },
  // EASTERN EUROPE
  {
    name: "Sziget Festival", year: 2026, location: "Budapest, Hungary", dates: "Aug 11 - 15",
    country: "Hungary", genre: "All genres",
    artists: ["Florence + The Machine","Twenty One Pilots","Bring Me The Horizon","Lewis Capaldi","Zara Larsson","Peggy Gou","Skepta","Jorja Smith","Sigrid","Wolf Alice","Soulwax","Biffy Clyro","Tash Sultana","Parcels","Dom Dolla","Underworld","Vintage Culture","Sub Focus","Dimension","Loyle Carner","Ashnikko","Charlotte Cardin","Dijon","Nia Archives","Sombr","Natasha Bedingfield","Argy","BBNO$","Chet Faker","Dixon","Funk Tribu","Indira Paganotto","Joris Voorn","Richie Hawtin","Sara Landry","Trym","Whomadewho","Baby Lasagna"]
  },
  {
    name: "EXIT Festival", year: 2025, location: "Novi Sad, Serbia", dates: "Jul 10 - 13",
    country: "Serbia", genre: "Electronic/Rock",
    artists: ["The Prodigy","Tiësto","Eric Prydz","DJ Snake","Solomun","Amelie Lens","Nina Kraviz","Boris Brejcha","Sara Landry","Loreen","Hurts","Sex Pistols","Bob Geldof","Indira Paganotto","Mau P"]
  },
  {
    name: "Pol'and'Rock Festival", year: 2025, location: "Czaplinek, Poland", dates: "Jul 31 - Aug 2",
    country: "Poland", genre: "Rock/All genres",
    artists: ["Fear Factory","Saxon","Wolfmother","Agnostic Front","Royal Republic","Burning Spear","Spidergawd","Dope","Spiderbait","Hunter","Ich Troje","Mrozu","Babylon Circus","The Scratch"]
  },
  // AUSTRIA/SWITZERLAND
  {
    name: "Nova Rock", year: 2026, location: "Nickelsdorf, Austria", dates: "Jun 11 - 14",
    country: "Austria", genre: "Rock/Metal",
    artists: ["Iron Maiden","The Cure","Bring Me The Horizon","Volbeat","Bad Omens","Sabaton","Papa Roach","Architects","The Offspring","Trivium","A Perfect Circle","Anthrax","The Hives","Tom Morello","Sepultura","Ice Nine Kills","Three Days Grace","Social Distortion","Breaking Benjamin","The Pretty Reckless","Hollywood Undead","All Time Low","Alter Bridge","Mastodon","Black Label Society","Static-X","Kaleo","Royal Republic","Sex Pistols","A Day To Remember","Black Veil Brides","Bad Nerves","Madsen","Magnolia Park","Kanonenfieber","The Rasmus","Kublai Khan TX","Bilmuri","Feine Sahne Fischfilet","Future Palace","Thrown","Catch Your Breath","Just Mustard","President","The Plot In You","Lemo","Dartagnan","Soft Play","Mammoth","Roy Bianco & Die Abbrunzati Boys"]
  },
  {
    name: "Paléo Festival", year: 2026, location: "Nyon, Switzerland", dates: "Jul 21 - 26",
    country: "Switzerland", genre: "All genres",
    artists: ["Katy Perry","The Cure","Gorillaz","Lorde","Twenty One Pilots","Morcheeba","Bob Sinclar","Amelie Lens","Timmy Trumpet","The Last Dinner Party","Zaz","Asaf Avidan","Vanessa Paradis","Orelsan","GIMS","The Young Gods","Julien Clerc","Disiz","Feu! Chatterton","Adèle Castillon","Eivør","Kendal","Mosimann"]
  },
];

// ─── Helpers ────────────────────────────────────────────────────────

function generateSearchKeys(name: string, year: number): string[] {
  const base = name.toLowerCase().trim();
  const keys = new Set<string>();
  keys.add(base); keys.add(`${base} ${year}`);
  const withoutFestival = base.replace(/\s*festival\s*/gi, "").trim();
  if (withoutFestival !== base) { keys.add(withoutFestival); keys.add(`${withoutFestival} ${year}`); }
  if (!base.includes("festival")) { keys.add(`${base} festival`); keys.add(`${base} festival ${year}`); }
  const words = base.split(/\s+/).filter((w) => w.length >= 4);
  words.forEach((w) => keys.add(w));
  return Array.from(keys);
}

async function supabaseRequest(path: string, options: RequestInit = {}) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Supabase error ${res.status}: ${err}`);
  }
  const text = await res.text();
  if (!text || text.trim() === "") return null;
  return JSON.parse(text);
}

// ─── Spotify ────────────────────────────────────────────────────────

let spotifyToken: string | null = null;
let spotifyTokenExpiry = 0;

async function getSpotifyToken(): Promise<string> {
  if (spotifyToken && Date.now() < spotifyTokenExpiry) return spotifyToken;
  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${SPOTIFY_ID}:${SPOTIFY_SECRET}`).toString("base64")}`,
    },
    body: "grant_type=client_credentials",
  });
  const data = await res.json();
  spotifyToken = data.access_token;
  spotifyTokenExpiry = Date.now() + (data.expires_in - 60) * 1000;
  return spotifyToken!;
}

async function spotifyFetch(path: string): Promise<any> {
  const token = await getSpotifyToken();
  const res = await fetch(`https://api.spotify.com/v1${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.status === 429) {
    const retryAfter = parseInt(res.headers.get("Retry-After") || "5", 10);
    console.log(`    Rate limited, waiting ${retryAfter}s...`);
    await new Promise((r) => setTimeout(r, retryAfter * 1000));
    return spotifyFetch(path);
  }
  if (!res.ok) return null;
  return res.json();
}

interface TrackData {
  id: string; name: string; artist: string; albumName: string;
  albumArt: string; previewUrl: string | null; spotifyUri: string;
  durationMs: number; popularity: number;
}

interface ArtistResultData {
  name: string; found: boolean; spotifyId?: string; imageUrl?: string; tracks: TrackData[];
}

async function getArtistTracks(artistName: string): Promise<ArtistResultData> {
  const searchData = await spotifyFetch(`/search?q=${encodeURIComponent(artistName)}&type=artist&limit=1`);
  const artist = searchData?.artists?.items?.[0];
  if (!artist) return { name: artistName, found: false, tracks: [] };
  const topData = await spotifyFetch(`/artists/${artist.id}/top-tracks?market=US`);
  const tracks: TrackData[] = (topData?.tracks || []).map((t: any) => ({
    id: t.id, name: t.name, artist: t.artists[0]?.name || "",
    albumName: t.album.name, albumArt: t.album.images?.[0]?.url || "",
    previewUrl: t.preview_url, spotifyUri: t.uri,
    durationMs: t.duration_ms, popularity: t.popularity ?? 0,
  }));
  return { name: artist.name, found: true, spotifyId: artist.id, imageUrl: artist.images?.[0]?.url || "", tracks };
}

// ─── Main ────────────────────────────────────────────────────────────

async function main() {
  console.log(`\n🔄 Updating cache for ${FESTIVALS.length} festivals with FULL lineups\n`);

  let successCount = 0, failCount = 0;

  for (let i = 0; i < FESTIVALS.length; i++) {
    const fest = FESTIVALS[i];
    console.log(`\n[${i + 1}/${FESTIVALS.length}] ${fest.name} ${fest.year} — ${fest.artists.length} artists`);

    // Delete existing festival_tracks and festival entry
    try {
      const existing = await supabaseRequest(
        `festivals?name=eq.${encodeURIComponent(fest.name)}&year=eq.${fest.year}&select=id`
      );
      if (existing && existing.length > 0) {
        const id = existing[0].id;
        await supabaseRequest(`festival_tracks?festival_id=eq.${id}`, { method: "DELETE" });
        await supabaseRequest(`festivals?id=eq.${id}`, { method: "DELETE" });
        console.log(`  🗑 Deleted old cache (id: ${id})`);
      }
    } catch (err) {
      console.error(`  ⚠ Error deleting old:`, err);
    }

    // Insert fresh festival
    const searchKeys = generateSearchKeys(fest.name, fest.year);
    let festivalRow: any;
    try {
      const rows = await supabaseRequest("festivals", {
        method: "POST",
        headers: { Prefer: "return=representation" } as any,
        body: JSON.stringify({
          name: fest.name, year: fest.year, location: fest.location,
          dates: fest.dates, country: fest.country, genre: fest.genre,
          artists: fest.artists, search_keys: searchKeys,
        }),
      });
      festivalRow = rows[0];
      console.log(`  ✓ Saved festival (${fest.artists.length} artists)`);
    } catch (err) {
      console.error(`  ❌ Failed to save festival:`, err);
      failCount++;
      continue;
    }

    // Fetch Spotify tracks
    console.log(`  🎶 Fetching Spotify tracks...`);
    const artistResults: ArtistResultData[] = [];
    const allTracks: TrackData[] = [];
    const notFound: string[] = [];

    for (let j = 0; j < fest.artists.length; j += 5) {
      const batch = fest.artists.slice(j, j + 5);
      const results = await Promise.all(batch.map(getArtistTracks));
      artistResults.push(...results);
      for (const r of results) {
        if (r.found) allTracks.push(...r.tracks);
        else notFound.push(r.name);
      }
      process.stdout.write(`    ${Math.min(j + 5, fest.artists.length)}/${fest.artists.length} artists\r`);
      await new Promise((r) => setTimeout(r, 150));
    }

    const seen = new Set<string>();
    const uniqueTracks = allTracks.filter((t) => { if (seen.has(t.id)) return false; seen.add(t.id); return true; });
    uniqueTracks.sort((a, b) => b.popularity - a.popularity);
    const totalDurationMs = uniqueTracks.reduce((sum, t) => sum + t.durationMs, 0);

    console.log(`\n  ✓ ${uniqueTracks.length} unique tracks, ${notFound.length} not found`);
    if (notFound.length > 0) console.log(`    Not found: ${notFound.join(", ")}`);

    try {
      await supabaseRequest("festival_tracks", {
        method: "POST",
        headers: { Prefer: "return=minimal" } as any,
        body: JSON.stringify({
          festival_id: festivalRow.id, tracks: uniqueTracks,
          artist_results: artistResults, total_duration_ms: totalDurationMs,
          not_found_artists: notFound,
        }),
      });
      console.log(`  ✅ Cached!`);
      successCount++;
    } catch (err) {
      console.error(`  ❌ Failed to save tracks:`, err);
      failCount++;
    }

    await new Promise((r) => setTimeout(r, 300));
  }

  console.log(`\n${"─".repeat(50)}`);
  console.log(`✅ Done! ${successCount} updated, ${failCount} failed`);
}

main().catch(console.error);
