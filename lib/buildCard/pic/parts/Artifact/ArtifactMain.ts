import sharp, { OverlayOptions } from 'sharp'
import { GenerationOptions } from 'text-to-svg'

import { textToSVG } from '@/lib/buildCard/pic/TextPicGenerator'
import {
  PartsConfigTypes,
  Position,
} from '@/lib/buildCard/types/PartsConfigType'
import { statusIconSVG } from '@/lib/buildCard/util/StatusIcon'
import { Artifact, ArtifactType, AvatarInfo, PropType } from '@/lib/enkaManager'

export class ArtifactMain implements PartsConfigTypes {
  readonly partsName: ArtifactType
  readonly position: Position = {
    top: 0,
    left: 0,
  }
  constructor(name: ArtifactType) {
    this.partsName = name
  }

  async partsCreate(avatarInfo: AvatarInfo) {
    const artifact = avatarInfo.artifacts.find(
      (artifact) => artifact.type == this.partsName
    )

    const backgroundBuffer: Buffer = this.getBackgroundBuffer()

    const images: OverlayOptions[] = []
    if (artifact) {
      images.push(await this.createArtifactImages(artifact))
      images.push(await this.getMainStatNameOverlayOptions(artifact))
      images.push(this.getLevelBackgroundOverlayOptions())
    }

    return await sharp(backgroundBuffer).composite(images).toBuffer()
  }

  getCachePath(avatarInfo: AvatarInfo) {
    const artifact = avatarInfo.artifacts.find(
      (artifact) => artifact.type == this.partsName
    )
    if (artifact) {
      return `./lib/buildCard/image/cache/artifact-${this.getArtifactSetId(
        artifact
      )}-${this.getArtifactTypeId(artifact)}-${artifact.mainStats.propType}.png`
    } else {
      return ''
    }
  }

  private getArtifactSetId(artifact: Artifact) {
    const artifactIconUrl: string = artifact.iconURL
    const artifactIdIndex: number = 2
    const splitIconUrl = artifactIconUrl.split(/_|\.png/g)
    return splitIconUrl[artifactIdIndex]
  }

  private getArtifactTypeId(artifact: Artifact) {
    const artifactIconUrl: string = artifact.iconURL
    const artifactIdIndex: number = 3
    const splitIconUrl = artifactIconUrl.split(/_|\.png/g)
    return splitIconUrl[artifactIdIndex]
  }

  private getBackgroundBuffer(): Buffer {
    const svg =
      '<svg width="350" height="300" xmlns="http://www.w3.org/2000/svg"/>'

    return Buffer.from(svg)
  }

  private async getMainStatNameOverlayOptions(
    artifact: Artifact
  ): Promise<OverlayOptions> {
    const backgroundSvg: string = '<svg width="255" height="40"></svg>'
    const backgroundBuffer: Buffer = Buffer.from(backgroundSvg)

    const compositeArray: OverlayOptions[] = []

    compositeArray.push(getTextOverlayOptions(artifact))
    compositeArray.push({
      top: 8,
      left: 255 - Math.floor(getTextWidth(artifact)) - 30,
      input: await this.createStatusIconBuffer(artifact.mainStats.propType),
    })

    const inputBuffer: Buffer = await sharp(backgroundBuffer)
      .composite(compositeArray)
      .toBuffer()

    return {
      input: inputBuffer,
      top: 5,
      left: 90,
    }

    function getTextOverlayOptions(artifact: Artifact): OverlayOptions {
      const statName: string = artifact.mainStats.name
      const generationOptions: GenerationOptions = {
        fontSize: 30,
        anchor: 'top',
        attributes: {
          fill: 'white',
        },
      }
      return {
        gravity: 'east',
        input: Buffer.from(textToSVG.getSVG(statName, generationOptions)),
      }
    }
    function getTextWidth(artifact: Artifact): number {
      const statName: string = artifact.mainStats.name
      const generationOptions: GenerationOptions = {
        fontSize: 30,
        anchor: 'top',
      }
      return textToSVG.getWidth(statName, generationOptions)
    }
  }

  private getLevelBackgroundOverlayOptions(): OverlayOptions {
    const backgroundBuffer: Buffer = getBackgroundBuffer()

    return {
      input: backgroundBuffer,
      top: 100,
      left: 300,
    }

    function getBackgroundBuffer(): Buffer {
      const svg: string =
        '<svg width="45" height="23" xmlns="http://www.w3.org/2000/svg">' +
        `  <rect width="45" height="23" rx="3" ry="3" fill="black"/>` +
        '</svg>'

      return Buffer.from(svg)
    }
  }

  async createArtifactImages(artifact: Artifact): Promise<OverlayOptions> {
    const maskBuffer: Buffer = this.getArtifactIconMaskBuffer()

    const artifactIconBuf = await sharp(await artifact.fetchIconBuffer())
      .resize(330, 330)
      .extract({
        top: 50,
        left: 90,
        width: 330 - 90,
        height: 330 - 50,
      })
      .toBuffer()

    const maskedArtifactIconBuf: Buffer = await sharp(maskBuffer)
      .composite([
        {
          top: 0,
          left: 0,
          input: artifactIconBuf,
          blend: 'in',
        },
      ])
      .toBuffer()
    return {
      input: maskedArtifactIconBuf,
      top: 0,
      left: 0,
    }
  }

  private getArtifactIconMaskBuffer(): Buffer {
    const svg: string =
      '<svg width="240" height="280" xmlns="http://www.w3.org/2000/svg">' +
      '<linearGradient id="g01">' +
      '  <stop offset="0.1" stop-color="black" stop-opacity="1" />' +
      '  <stop offset="0.95" stop-color="white" stop-opacity="0" />' +
      '</linearGradient>' +
      '<rect x="0" y="0" width="240" rx="15" ry="15" height="280" fill="url(#g01)" opacity="0.8"></rect>' +
      '</svg>'

    return Buffer.from(svg)
  }

  private async createStatusIconBuffer(type: PropType): Promise<Buffer> {
    const buffer = await sharp(Buffer.from(statusIconSVG(type)))
      .resize(25, 25)
      .toBuffer()
    return buffer
  }
}
