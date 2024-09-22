import { CharacterDetail } from 'genshin-manager'
import sharp from 'sharp'

import {
  scoringArtifact,
  ScoringType,
} from '@/lib/buildCard/util/ScoringArtifact'
import {
  PartsConfigTypes,
  Position,
} from '@/lib/imageCreator/types/PartsConfigType'

export class TotalScoreRank implements PartsConfigTypes {
  public readonly partsName: string = 'totalScoreRank'
  public readonly position: Position = {
    top: 344,
    left: 1806,
  }
  private readonly characterDetail: CharacterDetail
  private readonly type: ScoringType

  constructor(characterDetail: CharacterDetail, type: ScoringType) {
    this.characterDetail = characterDetail
    this.type = type
  }

  public async partsCreate(): Promise<Buffer> {
    const totalScore = this.characterDetail.artifacts.reduce(
      (result, artifact) => result + scoringArtifact(artifact, this.type),
      0,
    )

    return await sharp(
      `./lib/buildCard/image/scoringRank/${this.getScoreRank(+totalScore)}.png`,
    )
      .png()
      .resize(62, 62)
      .toBuffer()
  }

  private getScoreRank(score: number): string {
    const rankBorder: number[] = [180, 200, 220]
    const rank: string[] = ['B', 'A', 'S', 'SS']

    const rankIndex: number = rankBorder.findIndex((val) => score < val)

    return rankIndex !== -1 ? rank[rankIndex] : rank[rank.length - 1]
  }
}
