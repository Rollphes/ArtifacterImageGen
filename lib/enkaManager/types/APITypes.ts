import {
  ArtifactType,
  ElementKeys,
  PropEnum,
  PropType,
  ValueOf,
} from '@/lib/enkaManager/types/types'

export interface APICostume {
  sideIconName: string
  icon: string
  art: string
  avatarId: number
}

export interface APIShowAvatarInfo {
  avatarId: number
  level: number
  costumeId?: number
}

export interface APIPlayerInfo {
  nickname: string
  level: number
  signature?: string
  worldLevel?: number
  nameCardId: number
  finishAchievementNum?: number
  towerFloorIndex?: number
  towerLevelIndex?: number
  showAvatarInfoList?: APIShowAvatarInfo[]
  showNameCardIdList?: number[]
  profilePicture?: APIProfilePicture
}

export interface APIProfilePicture {
  avatarId?: number
  costumeId?: number
}

export interface APIProp {
  type: number
  ival: string
  val?: string
}

export interface APIReliquary {
  level: number
  mainPropId: number
  appendPropIdList?: number[]
}

export interface APIWeapon {
  level: number
  promoteLevel?: number
  affixMap?: { [key in string]: number }
}

export interface APIReliquaryFlat {
  nameTextMapHash: string
  setNameTextMapHash: string
  rankLevel: number
  reliquaryMainstat: APIReliquaryMainstat
  reliquarySubstats?: APIItemStats[]
  itemType: 'ITEM_RELIQUARY'
  icon: string
  equipType: ArtifactType
}
export interface APIWeaponFlat {
  nameTextMapHash: string
  rankLevel: number
  weaponStats: APIItemStats[]
  itemType: 'ITEM_WEAPON'
  icon: string
}

export interface APIItemStats {
  appendPropId: PropType
  statValue: number
}

export interface APIReliquaryMainstat {
  mainPropId: PropType
  statValue: number
}

export interface APIReliquaryEquip {
  itemId: number
  reliquary: APIReliquary
  flat: APIReliquaryFlat
}
export interface APIWeaponEquip {
  itemId: number
  weapon: APIWeapon
  flat: APIWeaponFlat
}

export interface APIAvatarInfo {
  avatarId: number
  costumeId?: number
  propMap: { [key in PropEnum]: APIProp }
  talentIdList?: number[]
  fightPropMap: { [key in number]: number }
  skillDepotId: number
  inherentProudSkillList: number[]
  skillLevelMap: { [key in string]: number }
  proudSkillExtraLevelMap?: { [key in string]: number } //凸によって伸びるスキルレベル key:ProudMapのvalueに連携(スキルマップに折込予定)
  equipList: (APIReliquaryEquip | APIWeaponEquip)[]
  fetterInfo: {
    expLevel: number
  }
}

export interface APIEnkaData {
  playerInfo: APIPlayerInfo
  avatarInfoList?: APIAvatarInfo[]
  ttl: number
  uid: number
}

export interface APICharData {
  Element: ValueOf<typeof ElementKeys>
  Consts: string[]
  SkillOrder: number[]
  Skills: { [key in string]: string }
  ProudMap: { [key in string]: number } //key:スキルID value:proudSkillExtraLevelMapに連動
  NameTextMapHash: number
  SideIconName: string
  QualityType: string
  Costumes?: { [key in string]: APICostume }
}
