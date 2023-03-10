import { Blend } from 'sharp'

import { ScoringType } from '@/lib/buildCard/util/ScoringArtifact'
import { AvatarInfo } from '@/lib/enkaManager'

export interface PartsConfigTypes {
  readonly partsName: string
  readonly position: Position
  blend?: Blend
  parts?: PartsConfigTypes[]

  partsCreate(
    avatarInfo: AvatarInfo,
    uid: string,
    scoringType: ScoringType
  ): Buffer | Promise<Buffer>
  getCachePath?: (avatarInfo: AvatarInfo, scoringType: ScoringType) => string
}

export interface Position {
  top: number
  left: number
}
