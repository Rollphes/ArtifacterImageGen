import { CharacterDetail } from 'genshin-manager'
import sharp from 'sharp'

import {
  ArtifactBracer,
  ArtifactDress,
  ArtifactNecklace,
  ArtifactRing,
  ArtifactShoes,
} from '@/lib/buildCard/parts/Artifact'
import {
  ArtifactScoreRankBracer,
  ArtifactScoreRankDress,
  ArtifactScoreRankNecklace,
  ArtifactScoreRankRing,
  ArtifactScoreRankShoes,
} from '@/lib/buildCard/parts/ArtifactScoreRank'
import { BaseImage } from '@/lib/buildCard/parts/BaseImage'
import { SvgContent } from '@/lib/buildCard/parts/SvgContent'
import { TotalScoreRank } from '@/lib/buildCard/parts/TotalScoreRank'
import { Weapon } from '@/lib/buildCard/parts/Weapon'
import { ScoringType } from '@/lib/buildCard/util/ScoringArtifact'
import {
  PartsConfigTypes,
  Position,
} from '@/lib/imageCreator/types/PartsConfigType'

export class BuildCard implements PartsConfigTypes {
  public readonly partsName: string = 'main'
  public readonly position: Position = {
    top: 0,
    left: 0,
  }
  public readonly parts: PartsConfigTypes[] = []

  constructor(
    characterDetail: CharacterDetail,
    uid: string,
    type: ScoringType,
  ) {
    this.parts.push(
      new BaseImage(characterDetail),
      new Weapon(characterDetail),
      new ArtifactBracer(characterDetail),
      new ArtifactNecklace(characterDetail),
      new ArtifactShoes(characterDetail),
      new ArtifactRing(characterDetail),
      new ArtifactDress(characterDetail),
      new ArtifactScoreRankBracer(characterDetail, type),
      new ArtifactScoreRankNecklace(characterDetail, type),
      new ArtifactScoreRankShoes(characterDetail, type),
      new ArtifactScoreRankRing(characterDetail, type),
      new ArtifactScoreRankDress(characterDetail, type),
      new TotalScoreRank(characterDetail, type),
      new SvgContent(characterDetail, uid, type),
    )
  }

  public partsCreate(): Promise<Buffer> {
    return sharp({
      create: {
        width: 1920,
        height: 1080,
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 1 },
      },
    })
      .png()
      .toBuffer()
  }
}
