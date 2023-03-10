import sharp, { OverlayOptions } from 'sharp'

import {
  PartsConfigTypes,
  Position,
} from '@/lib/buildCard/types/PartsConfigType'

export class SkillBackground implements PartsConfigTypes {
  readonly partsName: string = 'skillBackground'
  readonly position: Position = {
    top: 0,
    left: 0,
  }

  async partsCreate() {
    const background = this.getBackgroundBuffer()

    const compositeArray: OverlayOptions[] = []

    for (const y of [330, 435, 540]) {
      compositeArray.push(await this.getSkillBackOverlayOptions(y))
    }

    return await sharp(background).composite(compositeArray).toBuffer()
  }

  private async getSkillBackOverlayOptions(y: number): Promise<OverlayOptions> {
    return {
      input: await sharp(`./lib/buildCard/image/SkillBack.png`)
        .resize(98, 90)
        .png()
        .toBuffer(),
      top: y,
      left: 15,
    }
  }

  private getBackgroundBuffer(): Buffer {
    const backgroundSvg: string =
      '<svg width="150" height="650" xmlns="http://www.w3.org/2000/svg"/>'
    return Buffer.from(backgroundSvg)
  }
}
