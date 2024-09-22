import { CharacterDetail } from 'genshin-manager'
import sharp, { OverlayOptions } from 'sharp'

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
    const resizeArt = await sharp(rawArt)
      .extract({
        left: 289,
        top: 0,
        width: 1439,
        height: 1024,
      })
      .resize(1079, 768)
      .toBuffer()

    return {
      input: resizeArt,
      blend: 'in',
      top: 0,
      left: 0,
    }
  }
}
