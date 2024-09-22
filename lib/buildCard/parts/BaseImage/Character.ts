import { CharacterDetail } from 'genshin-manager'
import sharp, { ExtendOptions, OverlayOptions, ResizeOptions } from 'sharp'

import {
  PartsConfigTypes,
  Position,
} from '@/lib/imageCreator/types/PartsConfigType'

export class Character implements PartsConfigTypes {
  public readonly partsName: string = 'character'
  public readonly position: Position = {
    top: -45,
    left: -160,
  }
  private readonly characterDetail: CharacterDetail

  constructor(characterDetail: CharacterDetail) {
    this.characterDetail = characterDetail
  }

  public async partsCreate(): Promise<Buffer> {
    const characterBackground = await this.getBackgroundBuffer(
      this.characterDetail.id,
    )

    return sharp(characterBackground)
      .composite([await this.getArtOverlayOptions(this.characterDetail)])
      .toBuffer()
  }

  private async getBackgroundBuffer(
    avatarId: string | number,
  ): Promise<Buffer> {
    if (avatarId === 10000078) {
      return await sharp(`./lib/buildCard/image/Alhaitham.png`)
        .png()
        .resize(1079, 768)
        .toBuffer()
    } else {
      return await sharp(`./lib/buildCard/image/CharacterMask.png`)
        .png()
        .resize(1079, 768)
        .toBuffer()
    }
  }

  private async getArtOverlayOptions(
    characterDetail: CharacterDetail,
  ): Promise<OverlayOptions> {
    const rawArt = await characterDetail.costume.art.fetchBuffer()
    const { width, height } = await sharp(rawArt).metadata()
    const resizeOption: ResizeOptions = {
      width: 1079,
      height: 768,
      background: { r: 255, g: 255, b: 255, alpha: 0 },
    }
    const extendOption: ExtendOptions = {
      top: 0,
      left: 0,
      bottom: 0,
      right: 0,
      background: { r: 255, g: 255, b: 255, alpha: 0 },
    }
    const aspectRatio = (width ?? 0) / (height ?? 0)
    if (aspectRatio === 2) {
      resizeOption.fit = 'cover'
    } else {
      resizeOption.fit = 'contain'
      extendOption.top = 50
    }
    const extendedArt = await sharp(rawArt).extend(extendOption).toBuffer()
    const resizeArt = await sharp(extendedArt)
      .extract({
        left: 289,
        top: 0,
        width: 1439,
        height: 1024,
      })
      .resize(resizeOption)
      .toBuffer()

    return {
      input: resizeArt,
      blend: 'in',
      top: 0,
      left: 0,
    }
  }
}
