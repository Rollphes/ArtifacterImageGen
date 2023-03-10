import { Color } from 'sharp'

import {
  artifactBackground,
  colorBackground,
  nameLvBackground,
  refinementRankBackground,
  setBonusBackground,
  setBonusLine,
  skillLvBackground,
  talentBackground,
  totalScoreBackground,
  totalScoreLine,
  weaponBackground,
  weaponLevelBackground,
  weaponRarity,
} from '@/lib/buildCard/json/backgroundColorConfig.json'
import { ElementBackgroundByElementTypes } from '@/lib/buildCard/types/BackgroundColorConfigTypes'

export const colorBackgroundConfig: ElementBackgroundByElementTypes =
  colorBackground
export const artifactBackgroundConfig: ElementBackgroundByElementTypes =
  artifactBackground
export const weaponBackgroundConfig: ElementBackgroundByElementTypes =
  weaponBackground
export const rarityConfig: ElementBackgroundByElementTypes = weaponRarity
export const weaponLevelBackgroundConfig: ElementBackgroundByElementTypes =
  weaponLevelBackground
export const refinementRankBackgroundConfig: ElementBackgroundByElementTypes =
  refinementRankBackground
export const setBonusBackgroundConfig: ElementBackgroundByElementTypes =
  setBonusBackground
export const setBonusLineConfig: ElementBackgroundByElementTypes = setBonusLine
export const nameLvBackgroundConfig: ElementBackgroundByElementTypes =
  nameLvBackground
export const totalScoreBackgroundConfig: ElementBackgroundByElementTypes =
  totalScoreBackground
export const totalScoreLineConfig: ElementBackgroundByElementTypes =
  totalScoreLine
export const talentBackgroundConfig: ElementBackgroundByElementTypes =
  talentBackground
export const skillLvBackgroundConfig: Color = skillLvBackground
