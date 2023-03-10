import sharp from 'sharp'

import { Character } from '@/lib/buildCard/pic/parts/BaseImage/Character'
import { Love } from '@/lib/buildCard/pic/parts/BaseImage/Love'
import { NameLv } from '@/lib/buildCard/pic/parts/BaseImage/NameLv'
import { Shadow } from '@/lib/buildCard/pic/parts/BaseImage/Shadow'
import {
  PartsConfigTypes,
  Position,
} from '@/lib/buildCard/types/PartsConfigType'
import { AvatarInfo } from '@/lib/enkaManager'

export class BaseImage implements PartsConfigTypes {
  readonly partsName: string = 'baseImage'
  readonly position: Position = {
    top: 0,
    left: 0,
  }
  readonly parts = [new Character(), new Shadow(), new NameLv(), new Love()]

  async partsCreate(avatarInfo: AvatarInfo) {
    const element: string = avatarInfo.avatar.element
    return await sharp(`./lib/buildCard/image/Base/${element}.png`)
      .png()
      .toBuffer()
  }

  getCachePath(avatarInfo: AvatarInfo) {
    const avatar = avatarInfo.avatar
    return `./lib/buildCard/image/cache/base-${
      avatar.costumeId
        ? `${avatar.avatarId}-${avatar.costumeId}`
        : avatar.avatarId
    }.png`
  }
}
