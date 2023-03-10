import sharp, { OverlayOptions } from 'sharp'
import { GenerationOptions } from 'text-to-svg'

import { textToSVG } from '@/lib/buildCard/pic/TextPicGenerator'
import {
  PartsConfigTypes,
  Position,
} from '@/lib/buildCard/types/PartsConfigType'
import { AvatarInfo } from '@/lib/enkaManager'

export class NameLv implements PartsConfigTypes {
  readonly partsName: string = 'nameLv'
  readonly position: Position = {
    top: 0,
    left: 0,
  }
  async partsCreate(avatarInfo: AvatarInfo) {
    const name = avatarInfo.avatar.name

    const nameLvBackground = this.getBackgroundBuffer()

    const compositeArray: OverlayOptions[] = []

    compositeArray.push(this.getNameOverlayOptions(name))
    compositeArray.push(this.getLvOverlayOptions())

    return await sharp(nameLvBackground).composite(compositeArray).toBuffer()
  }

  private getNameOverlayOptions(name: string): OverlayOptions {
    const textOptions: GenerationOptions = {
      fontSize: 48,
      anchor: 'top',
      attributes: { fill: 'white' },
    }
    const buffer: Buffer = Buffer.from(textToSVG.getSVG(name, textOptions))
    return {
      input: buffer,
      top: 20,
      left: 30,
    }
  }

  private getLvOverlayOptions(): OverlayOptions {
    const str = `Lv.`
    const textOptions: GenerationOptions = {
      fontSize: 25,
      anchor: 'top',
      attributes: { fill: 'white' },
    }
    const buffer: Buffer = Buffer.from(textToSVG.getSVG(str, textOptions))
    return {
      input: buffer,
      top: 75,
      left: 36,
    }
  }

  private getBackgroundBuffer(): Buffer {
    const backgroundSvg: string =
      '<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg"/>'
    return Buffer.from(backgroundSvg)
  }
}
