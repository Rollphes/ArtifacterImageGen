import { ArtifactType, CharacterDetail } from 'genshin-manager'
import sharp from 'sharp'

import {
  scoringArtifact,
  ScoringType,
} from '@/lib/buildCard/util/ScoringArtifact'
import {
  PartsConfigTypes,
  Position,
} from '@/lib/imageCreator/types/PartsConfigType'

abstract class ArtifactScoreRankParts implements PartsConfigTypes {
  private readonly characterDetail: CharacterDetail
  private readonly type: ScoringType

  public abstract readonly partsName: string
  public abstract readonly artifactType: ArtifactType
  public abstract readonly position: Position

  constructor(characterDetail: CharacterDetail, type: ScoringType) {
    this.characterDetail = characterDetail
    this.type = type
  }

  public async partsCreate(): Promise<Buffer> {
    const artifact = this.characterDetail.artifacts.find(
      (artifact) => artifact.type === this.artifactType,
    )

    if (!artifact) return Buffer.from('<svg width="1" height="1"/>')
    return await sharp(
      `./lib/buildCard/image/scoringRank/${this.getScoreRank(
        scoringArtifact(artifact, this.type),
      )}.png`,
    )
      .png()
      .resize(42, 42)
      .toBuffer()
  }

  private getScoreRank(score: number): string {
    const rankBorder = {
      EQUIP_BRACER: [40, 45, 50],
      EQUIP_NECKLACE: [40, 45, 50],
      EQUIP_SHOES: [35, 40, 45],
      EQUIP_RING: [37, 40, 45],
      EQUIP_DRESS: [30, 35, 40],
    }
    const rank: string[] = ['B', 'A', 'S', 'SS']

    const rankIndex: number = rankBorder[this.artifactType].findIndex(
      (val) => score < val,
    )

    return rankIndex !== -1 ? rank[rankIndex] : rank[rank.length - 1]
  }
}

export class ArtifactScoreRankBracer extends ArtifactScoreRankParts {
  public readonly partsName = 'ArtifactScoreRankBracer'
  public readonly artifactType = 'EQUIP_BRACER'
  public readonly position = {
    top: 1013,
    left: 85,
  }
}

export class ArtifactScoreRankNecklace extends ArtifactScoreRankParts {
  public readonly partsName = 'ArtifactScoreRankNecklace'
  public readonly artifactType = 'EQUIP_NECKLACE'
  public readonly position = {
    top: 1013,
    left: 459,
  }
}

export class ArtifactScoreRankShoes extends ArtifactScoreRankParts {
  public readonly partsName = 'ArtifactScoreRankShoes'
  public readonly artifactType = 'EQUIP_SHOES'
  public readonly position = {
    top: 1013,
    left: 833,
  }
}

export class ArtifactScoreRankRing extends ArtifactScoreRankParts {
  public readonly partsName = 'ArtifactScoreRankRing'
  public readonly artifactType = 'EQUIP_RING'
  public readonly position = {
    top: 1013,
    left: 1205,
  }
}

export class ArtifactScoreRankDress extends ArtifactScoreRankParts {
  public readonly partsName = 'ArtifactScoreRankDress'
  public readonly artifactType = 'EQUIP_DRESS'
  public readonly position = {
    top: 1013,
    left: 1577,
  }
}
