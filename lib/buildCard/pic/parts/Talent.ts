import sharp, { OverlayOptions } from 'sharp'

import {
  PartsConfigTypes,
  Position,
} from '@/lib/buildCard/types/PartsConfigType'
import { AvatarInfo } from '@/lib/enkaManager'
import { Talent as EnkaTalent } from '@/lib/enkaManager/structures/Talent'

export class Talent implements PartsConfigTypes {
  readonly partsName: string = 'talent'
  readonly position: Position = {
    top: 0,
    left: 667,
  }
  private topList: number[] = [83, 176, 269, 362, 455, 548]

  async partsCreate(avatarInfo: AvatarInfo) {
    const element = avatarInfo.avatar.element
    const talents = avatarInfo.talentList

    const talentBackground = this.getBackgroundBuffer()

    const compositeArray: OverlayOptions[] = []

    await Promise.all(
      talents.map(async (talent, index) =>
        compositeArray.push(
          await this.getTalentOverlayOptions(
            talent,
            element,
            this.topList[index]
          )
        )
      )
    )

    return await sharp(talentBackground).composite(compositeArray).toBuffer()
  }

  getCachePath(avatarInfo: AvatarInfo) {
    const talentCount = avatarInfo.talentList.filter(
      (talent) => !talent.locked
    ).length
    const avatar = avatarInfo.avatar
    return `./lib/buildCard/image/cache/talent-${avatar.avatarId}-c${talentCount}.png`
  }

  private getBackgroundBuffer(): Buffer {
    const backgroundSvg: string =
      '<svg width="100" height="650" xmlns="http://www.w3.org/2000/svg"></svg>'
    return Buffer.from(backgroundSvg)
  }

  private async getTalentOverlayOptions(
    talent: EnkaTalent,
    element: string,
    y: number
  ): Promise<OverlayOptions> {
    const iconBackground = await this.getIconBackgroundBuffer(
      element,
      talent.locked
    )
    const buffer = await sharp(iconBackground)
      .composite([await this.getIconOverlayOptions(talent)])
      .toBuffer()
    return {
      input: buffer,
      top: y,
      left: 0,
    }
  }

  private async getIconOverlayOptions(
    talent: EnkaTalent
  ): Promise<OverlayOptions> {
    const rawIcon = await talent.fetchIconBuffer()
    const resizeIcon: Buffer = await sharp(rawIcon).resize(45, 45).toBuffer()
    return {
      input: resizeIcon,
      top: 21,
      left: 20,
    }
  }

  private async getIconBackgroundBuffer(
    element: string,
    locked: boolean
  ): Promise<Buffer> {
    const backgroundPath: string = locked
      ? `./lib/buildCard/image/talent/${element}-lock.png`
      : `./lib/buildCard/image/talent/${element}-unlock.png`

    return await sharp(backgroundPath).resize(88, 90).toBuffer()
  }
}
