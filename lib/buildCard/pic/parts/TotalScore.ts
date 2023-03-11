import sharp, { OverlayOptions } from 'sharp'
import { GenerationOptions } from 'text-to-svg'

import { textToSVG } from '@/lib/buildCard/pic/TextPicGenerator'
import {
  PartsConfigTypes,
  Position,
} from '@/lib/buildCard/types/PartsConfigType'
import {
  scoringArtifact,
  ScoringType,
} from '@/lib/buildCard/util/ScoringArtifact'
import { Artifact, AvatarInfo } from '@/lib/enkaManager'

export class TotalScore implements PartsConfigTypes {
  readonly partsName: string = 'totalScore'
  readonly position: Position = {
    top: 340,
    left: 1420,
  }

  async partsCreate(
    avatarInfo: AvatarInfo,
    uid: string,
    type: ScoringType
  ): Promise<Buffer> {
    const scoringNames = {
      ATK: '攻撃力換算',
      DEF: '防御力換算',
      HP: 'HP換算',
      EM: '元素熟知換算',
      ER: '元素チャージ換算',
    }

    const artifacts: Artifact[] = avatarInfo.artifacts

    const artifactScores: number[] = artifacts.map((artifact) =>
      scoringArtifact(artifact, type)
    )
    const totalScore: number = +artifactScores
      .reduce((sum, val) => sum + val, 0)
      .toFixed(1)

    const backgroundBuffer: Buffer = this.getBackgroundBuffer()

    const overlayOptions: OverlayOptions[] = []
    overlayOptions.push(this.getScoreOverlayOptions(totalScore))
    overlayOptions.push(this.getScoringTypeOverlayOptions(scoringNames[type]))
    overlayOptions.push(
      await this.getRankOverlayOptions(this.getScoreRank(totalScore))
    )

    return sharp(backgroundBuffer).composite(overlayOptions).toBuffer()
  }

  getBackgroundBuffer(): Buffer {
    const svg: string = '<svg width="455" height="275"/>'

    return Buffer.from(svg)
  }

  private getScoreOverlayOptions(score: number): OverlayOptions {
    const textOptions: GenerationOptions = {
      x: 125,
      fontSize: 80,
      anchor: 'center top',
      attributes: { fill: 'white' },
    }
    const svg = textToSVG.getPath(String(score), textOptions)
    const buffer: Buffer = Buffer.from(
      `<svg width="250" height="100">${svg}</svg>`
    )
    return {
      input: buffer,
      top: 80,
      left: 110,
    }
  }

  private getScoringTypeOverlayOptions(typeName: string): OverlayOptions {
    const textOptions: GenerationOptions = {
      fontSize: 24,
      anchor: 'top',
      attributes: { fill: 'white' },
    }
    const buffer: Buffer = Buffer.from(textToSVG.getSVG(typeName, textOptions))
    return {
      input: buffer,
      gravity: 'southeast',
    }
  }
  private async getRankOverlayOptions(rank: string): Promise<OverlayOptions> {
    const buffer = await sharp(`./lib/buildCard/image/scoringRank/${rank}.png`)
      .png()
      .resize(62, 62)
      .toBuffer()
    return {
      input: buffer,
      top: 4,
      left: 386,
    }
  }

  private getScoreRank(score: number): string {
    const rankBorder: number[] = [180, 200, 220]
    const rank: string[] = ['B', 'A', 'S', 'SS']

    const rankIndex: number = rankBorder.findIndex((val) => score < val)

    return rankIndex != -1 ? rank[rankIndex] : rank[rank.length - 1]
  }
}
