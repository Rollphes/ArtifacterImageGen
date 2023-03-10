export type ValueOf<T> = T[keyof T]

export enum PropEnum {
  XP = 1001,
  Ascension = 1002,
  Level = 4001,
}

export const ElementKeys = {
  Phys: 'Physical',
  Pyro: 'Fire',
  Electro: 'Electric',
  Cryo: 'Ice',
  Anemo: 'Wind',
  Hydro: 'Water',
  Geo: 'Rock',
  Dendro: 'Grass',
} as const

export type ArtifactType =
  | 'EQUIP_BRACER'
  | 'EQUIP_NECKLACE'
  | 'EQUIP_SHOES'
  | 'EQUIP_RING'
  | 'EQUIP_DRESS'

export const FightPropIds = {
  BaseHP: 1, //基礎HP
  ParamHP: 2, //合計HP+
  ParamHPPercent: 3, //合計HP%
  BaseATK: 4, //基礎攻撃力
  ParamATK: 5, //合計攻撃力+
  ParamATKPercent: 6, //合計攻撃力%
  BaseDEF: 7, //基礎防御力
  ParamDEF: 8, //合計防御+
  ParamDEFPercent: 9, //合計防御%
  CRITRate: 20, //会心率
  CRITDMG: 22, //会心ダメージ
  EnergyRecharge: 23, //元素チャージ
  //FIGHT_PROP_ELEMENT_MASTERY : 24
  //FIGHT_PROP_ELEMENT_MASTERY : 25
  HealingBonus: 26,
  IncomingHealingBonus: 27,
  ElementalMastery: 28, //EnkaOrigin
  PhysicalRES: 29,
  PhysicalDMGBonus: 30,
  PyroDMGBonus: 40,
  ElectroDMGBonus: 41,
  HydroDMGBonus: 42,
  DendroDMGBonus: 43,
  AnemoDMGBonus: 44,
  GeoDMGBonus: 45,
  CryoDMGBonus: 46,
  PyroRES: 50,
  ElectroRES: 51,
  HydroRES: 52,
  DendroRES: 53,
  AnemoRES: 54,
  GeoRES: 55,
  CryoRES: 56,
  PyroEnergyCost: 70, //EnkaOrigin
  ElectroEnergyCost: 71, //EnkaOrigin
  HydroEnergyCost: 72, //EnkaOrigin
  DendroEnergyCost: 73, //EnkaOrigin
  AnemoEnergyCost: 74, //EnkaOrigin
  CryoEnergyCost: 75, //EnkaOrigin
  GeoEnergyCost: 76, //EnkaOrigin
  MaxHP: 2000, //EnkaOrigin
  ATK: 2001, //EnkaOrigin
  DEF: 2002, //EnkaOrigin
} as const

export type FightPropKeys = keyof typeof FightPropIds

export type PropType =
  | 'FIGHT_PROP_BASE_HP'
  | 'FIGHT_PROP_HP'
  | 'FIGHT_PROP_HP_PERCENT'
  | 'FIGHT_PROP_BASE_ATTACK'
  | 'FIGHT_PROP_ATTACK'
  | 'FIGHT_PROP_ATTACK_PERCENT'
  | 'FIGHT_PROP_BASE_DEFENSE'
  | 'FIGHT_PROP_DEFENSE'
  | 'FIGHT_PROP_DEFENSE_PERCENT'
  | 'FIGHT_PROP_BASE_SPEED'
  | 'FIGHT_PROP_SPEED_PERCENT'
  | 'FIGHT_PROP_CRITICAL'
  | 'FIGHT_PROP_ANTI_CRITICAL'
  | 'FIGHT_PROP_CRITICAL_HURT'
  | 'FIGHT_PROP_CHARGE_EFFICIENCY'
  | 'FIGHT_PROP_ADD_HURT'
  | 'FIGHT_PROP_SUB_HURT'
  | 'FIGHT_PROP_HEAL_ADD'
  | 'FIGHT_PROP_HEALED_ADD'
  | 'FIGHT_PROP_ELEMENT_MASTERY'
  | 'FIGHT_PROP_PHYSICAL_SUB_HURT'
  | 'FIGHT_PROP_PHYSICAL_ADD_HURT'
  | 'FIGHT_PROP_FIRE_ADD_HURT'
  | 'FIGHT_PROP_ELEC_ADD_HURT'
  | 'FIGHT_PROP_WATER_ADD_HURT'
  | 'FIGHT_PROP_GRASS_ADD_HURT'
  | 'FIGHT_PROP_WIND_ADD_HURT'
  | 'FIGHT_PROP_ROCK_ADD_HURT'
  | 'FIGHT_PROP_ICE_ADD_HURT'
  | 'FIGHT_PROP_FIRE_SUB_HURT'
  | 'FIGHT_PROP_ELEC_SUB_HURT'
  | 'FIGHT_PROP_WATER_SUB_HURT'
  | 'FIGHT_PROP_GRASS_SUB_HURT'
  | 'FIGHT_PROP_WIND_SUB_HURT'
  | 'FIGHT_PROP_ROCK_SUB_HURT'
  | 'FIGHT_PROP_ICE_SUB_HURT'
  | 'FIGHT_PROP_EFFECT_HIT'
  | 'FIGHT_PROP_EFFECT_RESIST'
  | 'FIGHT_PROP_FREEZE_SHORTEN'
  | 'FIGHT_PROP_DIZZY_SHORTEN'
  | 'FIGHT_PROP_SKILL_CD_MINUS_RATIO'
  | 'FIGHT_PROP_SHIELD_COST_MINUS_RATIO'
  | 'FIGHT_PROP_CUR_HP'
  | 'FIGHT_PROP_MAX_HP'
  | 'FIGHT_PROP_CUR_ATTACK'
  | 'FIGHT_PROP_CUR_DEFENSE'
  | 'FIGHT_PROP_CUR_SPEED'

export interface ReliquaryAffixExcelConfigTypes {
  id: number
  depotId: number
  groupId: number
  propType: string
  propValue: number
  weight: number
  upgradeWeight: number
}
