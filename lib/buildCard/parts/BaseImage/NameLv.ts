import { CharacterDetail } from 'genshin-manager'
import sharp, { OverlayOptions } from 'sharp'

import { textToSVG } from '@/lib/imageCreator/textToSVG'
import {
  PartsConfigTypes,
  Position,
} from '@/lib/imageCreator/types/PartsConfigType'

export class NameLv implements PartsConfigTypes {
  public readonly partsName: string = 'nameLv'
  public readonly position: Position = {
    top: 0,
    left: 0,
  }
  private readonly characterDetail: CharacterDetail

  constructor(characterDetail: CharacterDetail) {
    this.characterDetail = characterDetail
  }

  public async partsCreate(): Promise<Buffer> {
    const name = this.characterDetail.name

    const nameLvBackground = this.getBackgroundBuffer()

    const compositeArray: OverlayOptions[] = []

    compositeArray.push(this.getNameOverlayOptions(name))
    compositeArray.push(this.getLvOverlayOptions())

    return await sharp(nameLvBackground).composite(compositeArray).toBuffer()
  }

  private getNameOverlayOptions(name: string): OverlayOptions {
    const buffer: Buffer = Buffer.from(
      textToSVG.getSVG(name, {
        fontSize: 48,
        anchor: 'top',
        attributes: { fill: 'white' },
      }),
    )
    return {
      input: buffer,
      top: 20,
      left: 30,
    }
  }

  private getLvOverlayOptions(): OverlayOptions {
    const buffer: Buffer = Buffer.from(
      textToSVG.getSVG(`Lv.`, {
        fontSize: 25,
        anchor: 'top',
        attributes: { fill: 'white' },
      }),
    )
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
