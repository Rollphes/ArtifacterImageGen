import {
  Artifact,
  ArtifactType,
  CharacterDetail,
  FightPropType,
} from 'genshin-manager'
import sharp, { OverlayOptions } from 'sharp'

import { statusIconPath } from '@/lib/buildCard/util/StatusIcon'
import { textToSVG } from '@/lib/imageCreator/textToSVG'
import {
  PartsConfigTypes,
  Position,
} from '@/lib/imageCreator/types/PartsConfigType'

abstract class ArtifactParts implements PartsConfigTypes {
  private readonly characterDetail: CharacterDetail

  public abstract readonly partsName: ArtifactType
  public abstract readonly position: Position

  constructor(characterDetail: CharacterDetail) {
    this.characterDetail = characterDetail
  }

  public async partsCreate(): Promise<Buffer> {
    const artifact = this.characterDetail.artifacts.find(
      (artifact) => artifact.type === this.partsName,
    )

    const backgroundBuffer = this.getBackgroundBuffer()

    const images: OverlayOptions[] = []
    if (artifact) {
      images.push(await this.createArtifactImages(artifact))
      images.push(await this.getSvgContent(artifact))
    }

    return await sharp(backgroundBuffer).composite(images).toBuffer()
  }

  public getCachePath(): string {
    const artifact = this.characterDetail.artifacts.find(
      (artifact) => artifact.type === this.partsName,
    )
    if (artifact)
      return `./lib/buildCard/image/cache/artifact-${artifact.setId}-${artifact.type}-${artifact.mainStat.type}.png`
    else return ''
  }

  private getBackgroundBuffer(): Buffer {
    return Buffer.from('<svg width="350" height="300"/>')
  }

  private async getSvgContent(artifact: Artifact): Promise<OverlayOptions> {
    const backgroundSvg: string = '<svg width="255" height="40"></svg>'
    const backgroundBuffer: Buffer = Buffer.from(backgroundSvg)

    const compositeArray: OverlayOptions[] = []

    compositeArray.push({
      gravity: 'east',
      input: Buffer.from(
        textToSVG.getSVG(artifact.mainStat.name, {
          fontSize: 30,
          anchor: 'top',
          attributes: {
            fill: 'white',
          },
        }),
      ),
    })
    compositeArray.push({
      top: 5,
      left:
        255 -
        Math.floor(
          textToSVG.getWidth(artifact.mainStat.name, {
            fontSize: 30,
            anchor: 'top',
          }),
        ) -
        30,
      input: await this.createStatusIconBuffer(artifact.mainStat.type),
    })

    const inputBuffer: Buffer = await sharp(backgroundBuffer)
      .composite(compositeArray)
      .toBuffer()

    return {
      input: inputBuffer,
      top: 5,
      left: 90,
    }
  }

  private async createArtifactImages(
    artifact: Artifact,
  ): Promise<OverlayOptions> {
    const maskBuffer = this.getArtifactIconMaskBuffer()

    const artifactIconBuf = await sharp(await artifact.icon.fetchBuffer())
      .resize(330, 330)
      .modulate({
        brightness: 0.6,
        saturation: 0.6,
      })
      .extract({
        top: 80,
        left: 70,
        height: 330 - 80,
        width: 330 - 70,
      })
      .toBuffer()

    const maskedArtifactIconBuf = await sharp(maskBuffer)
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
    return Buffer.from(
      `<svg width="260" height="250">
        <linearGradient id="g01">
          <stop offset="0" stop-color="black" stop-opacity="1" />
          <stop offset="0.5" stop-color="black" stop-opacity="1" />
          <stop offset="1" stop-color="black" stop-opacity="0" />
        </linearGradient>
        <rect x="0" y="0" width="240" height="280" rx="15" ry="15" fill="url(#g01)"/>
      </svg>`,
    )
  }

  private async createStatusIconBuffer(type: FightPropType): Promise<Buffer> {
    const buffer = await sharp(
      Buffer.from(
        `<svg width="28" height="28">${statusIconPath(type, 2)}</svg>`,
      ),
    ).toBuffer()
    return buffer
  }
}

export class ArtifactBracer extends ArtifactParts {
  public readonly partsName = 'EQUIP_BRACER'
  public readonly position = {
    top: 648,
    left: 30,
  }
}

export class ArtifactNecklace extends ArtifactParts {
  public readonly partsName = 'EQUIP_NECKLACE'
  public readonly position = {
    top: 648,
    left: 404,
  }
}

export class ArtifactShoes extends ArtifactParts {
  public readonly partsName = 'EQUIP_SHOES'
  public readonly position = {
    top: 648,
    left: 778,
  }
}

export class ArtifactRing extends ArtifactParts {
  public readonly partsName = 'EQUIP_RING'
  public readonly position = {
    top: 648,
    left: 1150,
  }
}

export class ArtifactDress extends ArtifactParts {
  public readonly partsName = 'EQUIP_DRESS'
  public readonly position = {
    top: 648,
    left: 1522,
  }
}
