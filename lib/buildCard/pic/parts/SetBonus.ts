import sharp, { OverlayOptions } from 'sharp'
import { GenerationOptions } from 'text-to-svg'

import { textToSVG } from '@/lib/buildCard/pic/TextPicGenerator'
import {
  PartsConfigTypes,
  Position,
} from '@/lib/buildCard/types/PartsConfigType'
import { AvatarInfo } from '@/lib/enkaManager'
import { SetBonus as EnkaSetBonus } from '@/lib/enkaManager'

export class SetBonus implements PartsConfigTypes {
  readonly partsName: string = 'setBonus'
  readonly position: Position = {
    top: 225,
    left: 1540,
  }
  private topList = [[0], [-20, 20], [-35, 0, 35]]

  async partsCreate(avatarInfo: AvatarInfo) {
    const setBonus = avatarInfo.setBonus
    const background = this.getBackgroundBuffer()

    const compositeArray: OverlayOptions[] = []

    setBonus.forEach((v, index) => {
      const top = this.topList[setBonus.length][index]
      compositeArray.push(this.getSetBonusNameOverlayOptions(v, top))
      compositeArray.push(this.getSetBonusCountOverlayOptions(v, top))
    })

    return await sharp(background).composite(compositeArray).toBuffer()
  }

  private getSetBonusNameOverlayOptions(
    setBonus: EnkaSetBonus,
    y: number
  ): OverlayOptions {
    const textOptions: GenerationOptions = {
      fontSize: 22,
      anchor: 'top',
      attributes: { fill: 'rgb(0,255,0)' },
    }
    const svg: string = textToSVG.getPath(setBonus.setName, textOptions)
    const buffer: Buffer = Buffer.from(
      `<svg width="200" height="30">${svg}</svg>`
    )
    return {
      input: buffer,
      top: y + 56,
      left: 0,
    }
  }

  private getSetBonusCountOverlayOptions(
    setBonus: EnkaSetBonus,
    y: number
  ): OverlayOptions {
    const textOptions: GenerationOptions = {
      x: 15,
      fontSize: 20,
      anchor: 'center top',
      attributes: { fill: 'white' },
    }
    const svg: string = textToSVG.getPath(String(setBonus.count), textOptions)
    const buffer: Buffer = Buffer.from(
      `<svg width="200" height="30">
        <rect width="30" height="22" fill="black" rx="5" ry="5"/>
        ${svg}
      </svg>`
    )
    return {
      input: buffer,
      top: y + 56,
      left: 250,
    }
  }

  private getBackgroundBuffer(): Buffer {
    const backgroundSvg: string =
      '<svg width="300" height="100" xmlns="http://www.w3.org/2000/svg"/>'
    return Buffer.from(backgroundSvg)
  }
}
