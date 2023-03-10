import sharp, { OverlayOptions } from 'sharp'
import { GenerationOptions } from 'text-to-svg'

import { textToSVG } from '@/lib/buildCard/pic/TextPicGenerator'
import {
  PartsConfigTypes,
  Position,
} from '@/lib/buildCard/types/PartsConfigType'
import { AvatarInfo } from '@/lib/enkaManager'

export class Level implements PartsConfigTypes {
  readonly partsName: string = 'Level'
  readonly position: Position = {
    top: 0,
    left: 0,
  }

  async partsCreate(avatarInfo: AvatarInfo) {
    const background = this.getBackgroundBuffer()

    const compositeArray: OverlayOptions[] = []

    compositeArray.push(this.getAvatarLvOverlayOptions(avatarInfo.level))
    compositeArray.push(
      this.getLoveLvOverlayOptions(avatarInfo.friendShipLevel)
    )

    return await sharp(background).composite(compositeArray).toBuffer()
  }

  private getLoveLvOverlayOptions(lv: number): OverlayOptions {
    const textOptions: GenerationOptions = {
      x: 15,
      fontSize: 25,
      anchor: 'center top',
      attributes: { fill: 'white' },
    }
    const svg: string = textToSVG.getPath(String(lv), textOptions)
    const buffer: Buffer = Buffer.from(
      `<svg width="30" height="30">${svg}</svg>`
    )
    return {
      input: buffer,
      top: 74,
      left: 142,
    }
  }

  private getAvatarLvOverlayOptions(lv: number): OverlayOptions {
    const textOptions: GenerationOptions = {
      fontSize: 25,
      anchor: 'top',
      attributes: { fill: 'white' },
    }
    const buffer: Buffer = Buffer.from(
      textToSVG.getSVG(String(lv), textOptions)
    )
    return {
      input: buffer,
      top: 75,
      left: 73,
    }
  }

  private getBackgroundBuffer(): Buffer {
    const backgroundSvg: string =
      '<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg"/>'
    return Buffer.from(backgroundSvg)
  }
}
