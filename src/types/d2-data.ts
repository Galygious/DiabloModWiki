/**
 * Core Diablo 2 Mod Data Types
 * 
 * These interfaces define the structure of data parsed from d2modgen files
 */

// === CORE BASE TYPES ===

export interface D2ModInfo {
  name: string;
  version: string;
  author?: string;
  description?: string;
  generatedBy?: string;
  generatedAt?: string;
}

export interface D2Stats {
  [key: string]: number | string;
}

// === ITEM TYPES ===

export interface UniqueItem {
  index: string;
  name: string;
  type: string;
  code: string;
  enabled: boolean;
  spawnable: boolean;
  rare: boolean;
  carries: boolean;
  costmult: number;
  costdiv: number;
  chrtransform: boolean;
  invtransform: boolean;
  flippyfile: string;
  invfile: string;
  dropsound: string;
  dropsfxframe: number;
  usesound: string;
  lvl: number;
  lvlreq: number;
  rarity: number;
  spawnstack: number;
  minstack: number;
  maxstack: number;
  prop1?: string;
  par1?: string;
  min1?: number;
  max1?: number;
  prop2?: string;
  par2?: string;
  min2?: number;
  max2?: number;
  prop3?: string;
  par3?: string;
  min3?: number;
  max3?: number;
  prop4?: string;
  par4?: string;
  min4?: number;
  max4?: number;
  prop5?: string;
  par5?: string;
  min5?: number;
  max5?: number;
  prop6?: string;
  par6?: string;
  min6?: number;
  max6?: number;
  prop7?: string;
  par7?: string;
  min7?: number;
  max7?: number;
  prop8?: string;
  par8?: string;
  min8?: number;
  max8?: number;
  prop9?: string;
  par9?: string;
  min9?: number;
  max9?: number;
  prop10?: string;
  par10?: string;
  min10?: number;
  max10?: number;
  prop11?: string;
  par11?: string;
  min11?: number;
  max11?: number;
  prop12?: string;
  par12?: string;
  min12?: number;
  max12?: number;
}

export interface SetItem {
  index: string;
  name: string;
  type: string;
  item: string;
  rarity: number;
  lvl: number;
  lvlreq: number;
  chrtransform: boolean;
  invtransform: boolean;
  invfile: string;
  flippyfile: string;
  dropsound: string;
  dropsfxframe: number;
  usesound: string;
  costmult: number;
  costdiv: number;
  // Set bonuses and properties
  prop1?: string;
  par1?: string;
  min1?: number;
  max1?: number;
  // ... additional properties (up to prop9)
  aprop1a?: string;
  apar1a?: string;
  amin1a?: number;
  amax1a?: number;
  // ... additional set bonuses
}

export interface ArmorItem {
  name: string;
  version: number;
  compactsave: boolean;
  rarity: number;
  spawnable: boolean;
  minac: number;
  maxac: number;
  absorbs: number;
  speed: number;
  reqstr: number;
  block: number;
  durability: number;
  nodurability: boolean;
  level: number;
  levelreq: number;
  cost: number;
  gamblecost: number;
  code: string;
  namestr: string;
  magicLvl: number;
  autoPrefix: number;
  alternateGfx: string;
  openBetaGfx: string;
  normalcode: string;
  ubercode: string;
  ultracode: string;
  spelloffs: number;
  component: number;
  invwidth: number;
  invheight: number;
  hasinv: boolean;
  gemsockets: number;
  gemapplytype: number;
  flippyfile: string;
  invfile: string;
  uniqueinvfile: string;
  setinvfile: string;
  rArm: number;
  lArm: number;
  torso: number;
  legs: number;
  rSPad: number;
  lSPad: number;
  useable: boolean;
  throwable: boolean;
  stackable: boolean;
  minstack: number;
  maxstack: number;
  type: string;
  type2: string;
  dropsound: string;
  dropsfxframe: number;
  usesound: string;
  unique: boolean;
  transparent: number;
  transtbl: number;
  lightradius: number;
  belt: number;
  autobelt: boolean;
  stackable_bool: boolean;
  spawnable_bool: boolean;
  spellicon: number;
  pSpell: number;
  state: string;
  cstate1: string;
  cstate2: string;
  len: number;
  stat1: string;
  calc1: string;
  stat2: string;
  calc2: string;
  stat3: string;
  calc3: string;
}

export interface WeaponItem {
  name: string;
  type: string;
  type2: string;
  code: string;
  alternategfx: string;
  pspell: number;
  state: string;
  cstate1: string;
  cstate2: string;
  stat1: string;
  stat2: string;
  stat3: string;
  calc1: string;
  calc2: string;
  calc3: string;
  len: number;
  '2handed': boolean;
  '2handmindam': number;
  '2handmaxdam': number;
  mindam: number;
  maxdam: number;
  '1or2handed': boolean;
  '2handedwclass': string;
  wclass: string;
  hitclass: number;
  '2handhitclass': number;
  speed: number;
  strbonus: number;
  dexbonus: number;
  reqstr: number;
  reqdex: number;
  durability: number;
  nodurability: boolean;
  level: number;
  levelreq: number;
  cost: number;
  gamblecost: number;
  rarity: number;
  spawnable: boolean;
  minstack: number;
  maxstack: number;
  spawnstack: number;
  flippyfile: string;
  invfile: string;
  uniqueinvfile: string;
  setinvfile: string;
  hasinv: boolean;
  gemsockets: number;
  gemapplytype: number;
  namestr: string;
  version: number;
  autoprefix: number;
  normalcode: string;
  ubercode: string;
  ultracode: string;
  component: number;
  invwidth: number;
  invheight: number;
  useable: boolean;
  stackable: boolean;
  usesound: string;
  dropsound: string;
  dropsfxframe: number;
  unique: boolean;
  magicLvl: number;
  Transform: number;
  InvTrans: number;
  compactsave: boolean;
  SkipName: boolean;
  Nameable: boolean;
  BetterGem: string;
  rArm: number;
  lArm: number;
  Torso: number;
  Legs: number;
  rSPad: number;
  lSPad: number;
  minmisdam: number;
  maxmisdam: number;
  missiletype: number;
  range: number;
  PermStoreItem: boolean;
  multibuy: boolean;
  Transmogrify: boolean;
  TMogType: string;
  TMogMin: number;
  TMogMax: number;
  usagestat: string;
  throwable: boolean;
  reload: number;
  reequip: boolean;
  autostack: boolean;
  manathrow: boolean;
  project: boolean;
  quivered: boolean;
  scourged: boolean;
  Sockets: boolean;
  transbl: number;
  lightradius: number;
  belt: number;
  quest: number;
  questdiffcheck: boolean;
  spellicon: number;
  spelliconseq: number;
  spelltype: number;
  spellsnd: string;
  spelllvlsound: number;
  spelldesccalc: string;
  spelldescstr: string;
  spelldescstr2: string;
  spelldesccol: number;
  spelldescline: number;
  spellrange: string;
  beta1: boolean;
  invcolor1: string;
  invcolor2: string;
  invcolor3: string;
  invcolor4: string;
  invcolor5: string;
  invcolor6: string;
  invcolor7: string;
  invcolor8: string;
}

// === SKILL TYPES ===

export interface Skill {
  skill: string;
  Id: number;
  charclass: string;
  skillname: string;
  skilldesc: string;
  srvstfunc: number;
  srvdofunc: number;
  prgstack: boolean;
  srvprgfunc1: number;
  srvprgfunc2: number;
  srvprgfunc3: number;
  prgcalc1: string;
  prgcalc2: string;
  prgcalc3: string;
  prgdam: string;
  srvmissile: string;
  decquant: boolean;
  lob: boolean;
  srvmissilea: string;
  srvmissileb: string;
  srvmissilec: string;
  srvoverlay: string;
  aurafilter: number;
  aurastate: string;
  auratargetstate: string;
  auralencalc: string;
  aurarangecalc: string;
  aurastat1: string;
  aurastatcalc1: string;
  aurastat2: string;
  aurastatcalc2: string;
  aurastat3: string;
  aurastatcalc3: string;
  aurastat4: string;
  aurastatcalc4: string;
  aurastat5: string;
  aurastatcalc5: string;
  aurastat6: string;
  aurastatcalc6: string;
  auraevent1: string;
  auraeventfunc1: number;
  auraevent2: string;
  auraeventfunc2: number;
  auraevent3: string;
  auraeventfunc3: number;
  passivestate: string;
  passiveitype: string;
  passivestat1: string;
  passivecalc1: string;
  passivestat2: string;
  passivecalc2: string;
  passivestat3: string;
  passivecalc3: string;
  passivestat4: string;
  passivecalc4: string;
  passivestat5: string;
  passivecalc5: string;
  passiveevent: string;
  passiveeventfunc: number;
  summon: string;
  pettype: string;
  petmax: string;
  summode: string;
  sumskill1: string;
  sumsk1calc: string;
  sumskill2: string;
  sumsk2calc: string;
  sumskill3: string;
  sumsk3calc: string;
  sumskill4: string;
  sumsk4calc: string;
  sumskill5: string;
  sumsk5calc: string;
  sumumod: string;
  sumoverlay: string;
  stsuccessonly: boolean;
  stsound: string;
  stsoundclass: string;
  stsounddelay: boolean;
  weaponsnd: boolean;
  dosound: string;
  dosoundA: string;
  dosoundB: string;
  castoverlay: string;
  tgtoverlay: string;
  tgtsound: string;
  prgoverlay: string;
  prgsound: string;
  cltovrlya: string;
  cltovrlayb: string;
  cltstfunc: number;
  cltdofunc: number;
  cltprgfunc1: number;
  cltprgfunc2: number;
  cltprgfunc3: number;
  cltmissile: string;
  cltmissilea: string;
  cltmissileb: string;
  cltmissilec: string;
  cltmissiled: string;
  cltcalc1: string;
  cltcalc2: string;
  cltcalc3: string;
  warp: boolean;
  immediate: boolean;
  enhanceable: boolean;
  attackrank: number;
  noammo: boolean;
  range: string;
  weapsel: number;
  itypea1: string;
  itypea2: string;
  itypea3: string;
  etypea1: string;
  etypea2: string;
  itypeb1: string;
  itypeb2: string;
  itypeb3: string;
  etypeb1: string;
  etypeb2: string;
  anim: string;
  seqtrans: string;
  monanim: string;
  seqnum: number;
  seqinput: number;
  durability: boolean;
  UseAttackRate: boolean;
  LineOfSight: boolean;
  TargetableOnly: boolean;
  SearchEnemyXY: boolean;
  SearchEnemyNear: boolean;
  SearchOpenXY: boolean;
  SelectProc: number;
  TargetCorpse: boolean;
  TargetPet: boolean;
  TargetAlly: boolean;
  TargetItem: boolean;
  AttackNoMana: boolean;
  TgtPlaceCheck: boolean;
  ItemEffect: number;
  ItemCltEffect: number;
  ItemTgtDo: number;
  ItemTarget: number;
  ItemCheckStart: boolean;
  ItemCltCheckStart: boolean;
  ItemCastSound: string;
  ItemCastOverlay: string;
  skpoints: number;
  reqlevel: number;
  maxlvl: number;
  reqstr: number;
  reqdex: number;
  reqint: number;
  reqvit: number;
  reqskill1: string;
  reqskill2: string;
  reqskill3: string;
  restrict: number;
  State1: string;
  State2: string;
  State3: string;
  delay: number;
  leftskill: boolean;
  repeat: boolean;
  checkfunc: number;
  nocostinstate: boolean;
  usemanaondo: boolean;
  startmana: number;
  minmana: number;
  manashift: number;
  mana: string;
  lvlmana: string;
  interrupt: boolean;
  InTown: boolean;
  aura: boolean;
  periodic: boolean;
  perdelay: string;
  finishing: boolean;
  passive: boolean;
  progressive: boolean;
  GeneralFlag: boolean;
  scroll: boolean;
  calc1: string;
  calc2: string;
  calc3: string;
  calc4: string;
  Param1: number;
  Param2: number;
  Param3: number;
  Param4: number;
  Param5: number;
  Param6: number;
  Param7: number;
  Param8: number;
  InGame: boolean;
  ToHit: string;
  LevToHit: string;
  ToHitCalc: string;
  ResultFlags: number;
  HitFlags: number;
  HitClass: number;
  kick: boolean;
  HitShift: number;
  SrcDam: number;
  MinDam: string;
  MinLevDam1: string;
  MinLevDam2: string;
  MinLevDam3: string;
  MinLevDam4: string;
  MinLevDam5: string;
  MaxDam: string;
  MaxLevDam1: string;
  MaxLevDam2: string;
  MaxLevDam3: string;
  MaxLevDam4: string;
  MaxLevDam5: string;
  DmgSymPerCalc: string;
  EType: string;
  EMin: string;
  EMinLev1: string;
  EMinLev2: string;
  EMinLev3: string;
  EMinLev4: string;
  EMinLev5: string;
  EMax: string;
  EMaxLev1: string;
  EMaxLev2: string;
  EMaxLev3: string;
  EMaxLev4: string;
  EMaxLev5: string;
  EDmgSymPerCalc: string;
  ELen: string;
  ELevLen1: string;
  ELevLen2: string;
  ELevLen3: string;
  ELenSymPerCalc: string;
  aitype: number;
  aibonus: number;
  costmult: number;
  costdiv: number;
}

// === MONSTER TYPES ===

export interface Monster {
  Id: string;
  BaseId: string;
  NextInClass: string;
  TransLvl: number;
  NameStr: string;
  MonStatsEx: string;
  MonProp: string;
  MonType: string;
  AI: string;
  DescStr: string;
  Code: number;
  enabled: boolean;
  rangedtype: boolean;
  placespawn: boolean;
  spawn: string;
  spawnx: number;
  spawny: number;
  spawnmode: string;
  minion1: string;
  minion2: string;
  SetBoss: boolean;
  BossXfer: boolean;
  PartyMin: number;
  PartyMax: number;
  MinGrp: number;
  MaxGrp: number;
  sparsePopulate: number;
  speed: number;
  runspeed: number;
  MissA1: string;
  MissA2: string;
  MissS1: string;
  MissS2: string;
  MissS3: string;
  MissS4: string;
  MissC: string;
  MissSQ: string;
  Align: number;
  isSpawn: boolean;
  isMelee: boolean;
  npc: boolean;
  interact: boolean;
  hasInventory: boolean;
  inTown: boolean;
  lUndead: boolean;
  hUndead: boolean;
  demon: boolean;
  flying: boolean;
  opendoors: boolean;
  boss: boolean;
  primeevil: boolean;
  killable: boolean;
  switchai: boolean;
  noAura: boolean;
  nomultishot: boolean;
  neverCount: boolean;
  petIgnore: boolean;
  deathDmg: boolean;
  genericSpawn: boolean;
  zoo: boolean;
  SendSkills: string;
  Skill1: string;
  Sk1mode: string;
  Sk1lvl: number;
  Skill2: string;
  Sk2mode: string;
  Sk2lvl: number;
  Skill3: string;
  Sk3mode: string;
  Sk3lvl: number;
  Skill4: string;
  Sk4mode: string;
  Sk4lvl: number;
  Skill5: string;
  Sk5mode: string;
  Sk5lvl: number;
  Skill6: string;
  Sk6mode: string;
  Sk6lvl: number;
  Skill7: string;
  Sk7mode: string;
  Sk7lvl: number;
  Skill8: string;
  Sk8mode: string;
  Sk8lvl: number;
  Drain: string;
  coldeffect: string;
  ResDm: number;
  ResMa: number;
  ResFi: number;
  ResLi: number;
  ResCo: number;
  ResPo: number;
  DamageRegen: number;
  SkillDamage: number;
  noRatio: boolean;
  NoShldBlock: boolean;
  ToBlock: number;
  Crit: number;
  minHP: number;
  maxHP: number;
  AC: number;
  Exp: number;
  A1TH: number;
  A1DT: number;
  A1DM: number;
  A2TH: number;
  A2DT: number;
  A2DM: number;
  S1TH: number;
  S1DT: number;
  S1DM: number;
  El1Mode: string;
  El1Type: string;
  El1Pct: number;
  El1Min: number;
  El1Max: number;
  El1Dur: number;
  El2Mode: string;
  El2Type: string;
  El2Pct: number;
  El2Min: number;
  El2Max: number;
  El2Dur: number;
  El3Mode: string;
  El3Type: string;
  El3Pct: number;
  El3Min: number;
  El3Max: number;
  El3Dur: number;
  TreasureClass1: string;
  TreasureClass1Prob: string;
  TreasureClass2: string;
  TreasureClass2Prob: string;
  TreasureClass3: string;
  TreasureClass3Prob: string;
  TreasureClass4: string;
  TreasureClass4Prob: string;
  TCQuestId: number;
  TCQuestCP: number;
  SplEndDeath: boolean;
  SplGetModeChart: boolean;
  SplEndGeneric: boolean;
  SplClientEnd: boolean;
}

// === GEMS AND MISC ITEMS ===

export interface Gem {
  name: string;
  letter: string;
  transform: number;
  code: string;
  nummods: number;
  weaponMod1Code: string;
  weaponMod1Param: string;
  weaponMod1Min: number;
  weaponMod1Max: number;
  weaponMod2Code: string;
  weaponMod2Param: string;
  weaponMod2Min: number;
  weaponMod2Max: number;
  weaponMod3Code: string;
  weaponMod3Param: string;
  weaponMod3Min: number;
  weaponMod3Max: number;
  helmMod1Code: string;
  helmMod1Param: string;
  helmMod1Min: number;
  helmMod1Max: number;
  helmMod2Code: string;
  helmMod2Param: string;
  helmMod2Min: number;
  helmMod2Max: number;
  helmMod3Code: string;
  helmMod3Param: string;
  helmMod3Min: number;
  helmMod3Max: number;
  shieldMod1Code: string;
  shieldMod1Param: string;
  shieldMod1Min: number;
  shieldMod1Max: number;
  shieldMod2Code: string;
  shieldMod2Param: string;
  shieldMod2Min: number;
  shieldMod2Max: number;
  shieldMod3Code: string;
  shieldMod3Param: string;
  shieldMod3Min: number;
  shieldMod3Max: number;
}

// === LOCALIZATION TYPES ===

export interface LocalizedStrings {
  [key: string]: string;
}

export interface ItemNames extends LocalizedStrings {}
export interface SkillNames extends LocalizedStrings {}
export interface MonsterNames extends LocalizedStrings {}

// === SKILL LOOKUP TYPES ===
export type SkillLookup = Record<string, string>; // skill ID -> skill name
export type SkillTabLookup = Record<string, string>; // tab ID -> tab name
export type SkillDescLookup = Record<string, {
  name: string;
  stringName: string;
  iconCel: number;
  shortDesc: string;
  longDesc: string;
}>; // skill ID -> detailed skill info
export type ItemTypeLookup = Record<string, string>; // item type code -> item type name
export type ItemModifierLookup = Record<string, {
  id: number;
  Key: string;
  enUS: string;
  [locale: string]: any;
}>; // modifier key -> localized descriptions
export type PropertiesLookup = Record<string, any>; // property code -> property data including stat mapping  
export type ItemStatCostLookup = Record<string, any>; // stat name -> stat cost data including desc string ID

// === PARSED DATA CONTAINERS ===

export interface ParsedModData {
  modInfo: D2ModInfo;
  uniqueItems: UniqueItem[];
  setItems: SetItem[];
  setDefinitions: SetDefinition[];
  armor: ArmorItem[];
  weapons: WeaponItem[];
  skills: Skill[];
  monsters: Monster[];
  gems: Gem[];
  itemNames: ItemNames;
  skillNames: SkillNames;
  monsterNames: MonsterNames;
  skillLookup: SkillLookup;
  skillTabLookup: SkillTabLookup;
  skillDescLookup: SkillDescLookup;
  itemTypeLookup: ItemTypeLookup;
  itemModifierLookup: ItemModifierLookup;
  propertiesLookup: PropertiesLookup;
  itemStatCostLookup: ItemStatCostLookup;
  [key: string]: any; // For additional data files
}

// === WIKI GENERATION TYPES ===

export interface WikiConfig {
  siteName: string;
  description: string;
  theme: 'dark' | 'light' | 'auto';
  baseUrl: string;
  outputDir: string;
  features: {
    search: boolean;
    itemComparison: boolean;
    skillCalculator: boolean;
    damageCalculator: boolean;
    characterPlanner: boolean;
  };
  customPages?: CustomPage[];
}

export interface CustomPage {
  title: string;
  path: string;
  content: string;
  category?: string;
  order?: number;
}

export interface WikiPage {
  title: string;
  path: string;
  content: string;
  category: string;
  data?: any;
  template: string;
}

// === SEARCH TYPES ===

export interface SearchableItem {
  id: string;
  type: 'unique' | 'set' | 'armor' | 'weapon' | 'skill' | 'monster' | 'gem';
  name: string;
  description?: string;
  level?: number;
  category?: string;
  keywords: string[];
  data: any;
}

export interface SearchIndex {
  items: SearchableItem[];
  categories: string[];
  types: string[];
}

// === ERROR TYPES ===

export interface ParseError {
  file: string;
  line?: number;
  column?: number;
  message: string;
  type: 'warning' | 'error' | 'fatal';
}

export interface ValidationResult {
  valid: boolean;
  errors: ParseError[];
  warnings: ParseError[];
}

// === SET DEFINITIONS ===

export interface SetDefinition {
  index: string;  // Set name (e.g., "Tal Rasha's Wrappings")
  name: string;   // Display name
  version: number; // 0 for classic, 100 for expansion
  
  // 2-piece bonuses
  PCode2a?: string;
  PParam2a?: string;
  PMin2a?: number;
  PMax2a?: number;
  PCode2b?: string;
  PParam2b?: string;
  PMin2b?: number;
  PMax2b?: number;
  
  // 3-piece bonuses
  PCode3a?: string;
  PParam3a?: string;
  PMin3a?: number;
  PMax3a?: number;
  PCode3b?: string;
  PParam3b?: string;
  PMin3b?: number;
  PMax3b?: number;
  
  // 4-piece bonuses
  PCode4a?: string;
  PParam4a?: string;
  PMin4a?: number;
  PMax4a?: number;
  PCode4b?: string;
  PParam4b?: string;
  PMin4b?: number;
  PMax4b?: number;
  
  // 5-piece bonuses
  PCode5a?: string;
  PParam5a?: string;
  PMin5a?: number;
  PMax5a?: number;
  PCode5b?: string;
  PParam5b?: string;
  PMin5b?: number;
  PMax5b?: number;
  
  // Full set bonuses (FCode1-8)
  FCode1?: string;
  FParam1?: string;
  FMin1?: number;
  FMax1?: number;
  FCode2?: string;
  FParam2?: string;
  FMin2?: number;
  FMax2?: number;
  FCode3?: string;
  FParam3?: string;
  FMin3?: number;
  FMax3?: number;
  FCode4?: string;
  FParam4?: string;
  FMin4?: number;
  FMax4?: number;
  FCode5?: string;
  FParam5?: string;
  FMin5?: number;
  FMax5?: number;
  FCode6?: string;
  FParam6?: string;
  FMin6?: number;
  FMax6?: number;
  FCode7?: string;
  FParam7?: string;
  FMin7?: number;
  FMax7?: number;
  FCode8?: string;
  FParam8?: string;
  FMin8?: number;
  FMax8?: number;
} 