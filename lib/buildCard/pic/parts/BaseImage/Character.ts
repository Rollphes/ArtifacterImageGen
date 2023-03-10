import sharp, { OverlayOptions } from 'sharp'

import {
  PartsConfigTypes,
  Position,
} from '@/lib/buildCard/types/PartsConfigType'
import { Avatar, AvatarInfo } from '@/lib/enkaManager'

export class Character implements PartsConfigTypes {
  readonly partsName: string = 'character'
  readonly position: Position = {
    top: -45,
    left: -160,
  }

  async partsCreate(avatarInfo: AvatarInfo) {
    const avatar = avatarInfo.avatar

    const characterBackground = await this.getBackgroundBuffer(avatar.avatarId)

    return sharp(characterBackground)
      .composite([await this.getArtOverlayOptions(avatar)])
      .toBuffer()
  }

  private async getBackgroundBuffer(
    avatarId: string | number
  ): Promise<Buffer> {
    if (avatarId == 10000078) {
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

  private async getArtOverlayOptions(avatar: Avatar): Promise<OverlayOptions> {
    const rawArt = await avatar.fetchArtBuffer()
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
