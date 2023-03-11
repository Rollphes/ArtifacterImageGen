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
import { statusIconSVG } from '@/lib/buildCard/util/StatusIcon'
import { convertStatValue } from '@/lib/buildCard/util/StatusValueConverter'
import {
  Artifact,
  ArtifactType,
  AvatarInfo,
  ItemStats,
  PropType,
  ReliquaryAffixExcelConfigTypes,
} from '@/lib/enkaManager'

export class ArtifactValue implements PartsConfigTypes {
  readonly partsName: string = 'ArtifactMain'
  readonly position: Position = {
    top: 0,
    left: 0,
  }

  constructor(name: ArtifactType) {
    this.partsName = name
  }

  async partsCreate(avatarInfo: AvatarInfo, uid: string, type: ScoringType) {
    const artifact = avatarInfo.artifacts.find(
      (artifact) => artifact.type == this.partsName
    )

    const backgroundBuffer: Buffer = this.getBackgroundBuffer()

    const images: OverlayOptions[] = []

    if (artifact) {
      images.push(await this.getMainStatValueOverlayOptions(artifact))
      images.push(this.getLevelOverlayOptions(artifact))
      images.push(await this.getScoreOverlayOptions(artifact, type))
      await Promise.all(
        artifact.subStats.map(async (subStat) => {
          const index = artifact.subStats.indexOf(subStat)
          images.push(
            await this.getSubStatOverlayOptions(
              subStat,
              artifact.appendPropList,
              index
            )
          )
        })
      )
    }

    return await sharp(backgroundBuffer).composite(images).toBuffer()
  }

  private getBackgroundBuffer(): Buffer {
    const svg =
      '<svg width="358" height="413" xmlns="http://www.w3.org/2000/svg"/>'
    return Buffer.from(svg)
  }

  private async getScoreOverlayOptions(
    artifact: Artifact,
    type: ScoringType
  ): Promise<OverlayOptions> {
    const backgroundBuffer: Buffer = getBackgroundBuffer()

    const overlayOptions: OverlayOptions[] = []

    const artifactScore = scoringArtifact(artifact, type)

    overlayOptions.push({
      top: 20,
      left: 343 - Math.floor(getScoreWidth(artifactScore)) - 76 - 10,
      input: Buffer.from(getTextSvg()),
    })
    overlayOptions.push({
      gravity: 'southeast',
      input: Buffer.from(getScoreSvg(artifactScore)),
    })
    overlayOptions.push({
      top: 5,
      left: 56,
      input: await sharp(
        `./lib/buildCard/image/scoringRank/${getScoreRank(
          artifactScore,
          artifact.type
        )}.png`
      )
        .png()
        .resize(42, 42)
        .toBuffer(),
    })

    const inputBuffer: Buffer = await sharp(backgroundBuffer)
      .composite(overlayOptions)
      .toBuffer()

    return {
      input: inputBuffer,
      top: 362,
      left: 0,
    }

    function getBackgroundBuffer(): Buffer {
      const svg: string = '<svg width="343" height="51"/>'

      return Buffer.from(svg)
    }

    function getTextSvg(): string {
      const text: string = 'Score'
      const generationOptions: GenerationOptions = {
        fontSize: 26,
        anchor: 'top',
        attributes: { fill: '#A0A0A0' },
      }
      return textToSVG.getSVG(text, generationOptions)
    }

    function getScoreSvg(score: number): string {
      const scoreText: string = score.toFixed(1)
      const generationOptions: GenerationOptions = {
        fontSize: 32,
        anchor: 'top',
        attributes: { fill: 'white' },
      }
      return textToSVG.getSVG(scoreText, generationOptions)
    }

    function getScoreWidth(score: number): number {
      const scoreText: string = score.toFixed(1)
      const generationOptions: GenerationOptions = {
        fontSize: 32,
        anchor: 'top',
      }
      return textToSVG.getWidth(scoreText, generationOptions)
    }

    function getScoreRank(score: number, type: ArtifactType): string {
      const rankBorder = {
        EQUIP_BRACER: [40, 45, 50],
        EQUIP_NECKLACE: [40, 45, 50],
        EQUIP_SHOES: [35, 40, 45],
        EQUIP_RING: [37, 40, 45],
        EQUIP_DRESS: [30, 35, 40],
      }
      const rank: string[] = ['B', 'A', 'S', 'SS']

      const rankIndex: number = rankBorder[type].findIndex((val) => score < val)

      return rankIndex != -1 ? rank[rankIndex] : rank[rank.length - 1]
    }
  }

  private async getSubStatOverlayOptions(
    subStat: ItemStats,
    appendPropList: ReliquaryAffixExcelConfigTypes[],
    index: number
  ): Promise<OverlayOptions> {
    const top: number = 163 + index * 50
    const left: number = 15
    const iconSize: number = 24
    const statName: string = subStat.name.replace(
      '元素チャージ効率',
      '元チャ効率'
    )
    const statPropType: PropType = subStat.propType
    const statValue: string = convertStatValue(statPropType, subStat.value)

    const backgroundBuffer: Buffer = getBackgroundBuffer()

    const compositeArray: OverlayOptions[] = []
    compositeArray.push(await getIconOverlayOptions(statPropType, iconSize))
    compositeArray.push(getStatNameOverlayOptions(statName, iconSize))
    compositeArray.push(getStatValueOverlayOptions(statValue))
    compositeArray.push(
      getStatAppendPropOverlayOptions(statPropType, appendPropList)
    )

    const inputBuffer: Buffer = await sharp(backgroundBuffer)
      .composite(compositeArray)
      .toBuffer()

    return {
      input: inputBuffer,
      top: top,
      left: left,
    }

    function getBackgroundBuffer(): Buffer {
      const svg: string = '<svg width="330" height="42"/>'
      return Buffer.from(svg)
    }

    async function getIconOverlayOptions(
      type: PropType,
      iconSize: number
    ): Promise<OverlayOptions> {
      const inputBuffer: Buffer = await sharp(Buffer.from(statusIconSVG(type)))
        .resize(iconSize, iconSize)
        .toBuffer()

      return {
        top: 5,
        left: 0,
        input: inputBuffer,
      }
    }

    function getStatNameOverlayOptions(
      statName: string,
      iconSize: number
    ): OverlayOptions {
      const left: number = iconSize + 10
      const generationOptions: GenerationOptions = {
        fontSize: 26,
        anchor: 'left top',
        attributes: {
          fill: 'white',
        },
      }
      const inputBuffer: Buffer = Buffer.from(
        textToSVG.getSVG(statName, generationOptions)
      )

      return {
        input: inputBuffer,
        top: 0,
        left: left,
      }
    }

    function getStatValueOverlayOptions(statValue: string): OverlayOptions {
      const generationOptions: GenerationOptions = {
        fontSize: 26,
        anchor: 'left top',
        attributes: {
          fill: 'white',
          opacity: '0.8',
        },
      }
      const inputBuffer: Buffer = Buffer.from(
        textToSVG.getSVG(statValue, generationOptions)
      )

      return {
        input: inputBuffer,
        gravity: 'northeast',
      }
    }

    function getStatAppendPropOverlayOptions(
      statPropType: PropType,
      appendPropList: ReliquaryAffixExcelConfigTypes[]
    ): OverlayOptions {
      const thisAppendPropList = appendPropList.filter(
        (appendProp) => appendProp.propType == statPropType
      )
      const text = thisAppendPropList
        .map((thisAppendProp) =>
          convertStatAppendValue(
            thisAppendProp.propType as PropType,
            thisAppendProp.propValue
          )
        )
        .join('+')
      const generationOptions: GenerationOptions = {
        fontSize: 11,
        anchor: 'left top',
        attributes: {
          fill: 'white',
          opacity: '0.75',
        },
      }
      const inputBuffer: Buffer = Buffer.from(
        textToSVG.getSVG(text, generationOptions)
      )

      return {
        input: inputBuffer,
        gravity: 'southeast',
      }
    }
    function convertStatAppendValue(
      statType: PropType,
      statValue: string | number
    ): string {
      const value = +statValue
      return statType.match(/_PERCENT|_CRITICAL|_CHARGE|_ADD/g)
        ? new Intl.NumberFormat('ja', {
            maximumFractionDigits: 1,
            minimumFractionDigits: 1,
          }).format(value * 100 + 0)
        : new Intl.NumberFormat('ja', {
            maximumFractionDigits: 0,
          }).format(value + 0)
    }
  }

  private async getMainStatValueOverlayOptions(
    artifact: Artifact
  ): Promise<OverlayOptions> {
    const statPropType: PropType = artifact.mainStats.propType
    const statValue: string = String(artifact.mainStats.value)
    const formatStatValue: string = convertStatValue(statPropType, statValue)
    const backgroundBuffer = Buffer.from('<svg width="200" height="100"/>')

    const generationOptions: GenerationOptions = {
      fontSize: 52,
      anchor: 'top',
      attributes: {
        fill: 'white',
      },
    }
    const inputBuffer: Buffer = Buffer.from(
      textToSVG.getSVG(formatStatValue, generationOptions)
    )

    return {
      top: 20,
      left: 150,
      input: await sharp(backgroundBuffer)
        .composite([
          {
            gravity: 'east',
            input: inputBuffer,
          },
        ])
        .toBuffer(),
    }
  }

  private getLevelOverlayOptions(artifact: Artifact): OverlayOptions {
    const level: string = String(artifact.level)

    const text: string = '+' + level
    const generationOptions: GenerationOptions = {
      x: 22,
      fontSize: 19,
      anchor: 'center top',
      attributes: {
        fill: 'white',
      },
    }
    const svg = textToSVG.getPath(text, generationOptions)
    return {
      top: 100,
      left: 300,
      input: Buffer.from(`<svg width="45" height="23">${svg}</svg>`),
    }
  }
}
