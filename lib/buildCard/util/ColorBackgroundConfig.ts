import { Color } from 'sharp'

import {
  artifactBackground,
  skillLvBackground,
} from '@/lib/buildCard/json/backgroundColorConfig.json'
import { ElementBackgroundByElementTypes } from '@/lib/buildCard/types/BackgroundColorConfigTypes'

export const artifactBackgroundConfig: ElementBackgroundByElementTypes =
  artifactBackground
export const skillLvBackgroundConfig: Color = skillLvBackground
