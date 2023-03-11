import sharp, { OverlayOptions } from 'sharp'
import { GenerationOptions } from 'text-to-svg'

import { WeaponMain } from '@/lib/buildCard/pic/parts/Weapon/WeaponMain'
import { textToSVG } from '@/lib/buildCard/pic/TextPicGenerator'
import {
  PartsConfigTypes,
  Position,
} from '@/lib/buildCard/types/PartsConfigType'
import { convertStatValue } from '@/lib/buildCard/util/StatusValueConverter'
import { AvatarInfo, ItemStats, Weapon as EnkaWeapon } from '@/lib/enkaManager'

export class Weapon implements PartsConfigTypes {
  readonly partsName: string = 'weapon'
  readonly position: Position = {
    top: 30,
    left: 1420,
  }
  readonly parts: PartsConfigTypes[] = [new WeaponMain()]

  async partsCreate(avatarInfo: AvatarInfo) {
    const weaponData: EnkaWeapon = avatarInfo.weapon

    const backgroundBuffer: Buffer = this.getBackgroundBuffer()
    const compositeArray: OverlayOptions[] = []

    compositeArray.push(await this.getLevelOverlayOptions(weaponData))
    compositeArray.push(
      await this.getBaseAtkOverlayOptions(weaponData.mainStat)
    )
    if (weaponData.subStat) {
      compositeArray.push(
        await this.getSubStatOverlayOptions(weaponData.subStat)
      )
    }
    compositeArray.push(await this.getRefinementRankOverlayOptions(weaponData))

    return await sharp(backgroundBuffer)
      .composite(compositeArray)
      .png()
      .toBuffer()
  }

  private getBackgroundBuffer(): Buffer {
    const backgroundSvg: string =
      '<svg width="460" height="180" xmlns="http://www.w3.org/2000/svg"/>'
    return Buffer.from(backgroundSvg)
  }

  private async getLevelOverlayOptions(
    weaponData: EnkaWeapon
  ): Promise<OverlayOptions> {
    const backgroundBuffer: Buffer = this.getLevelBackgroundBuffer()
    const levelSvgOverlayOptions: OverlayOptions =
      this.getLevelTextOverlayOptions(weaponData.level)

    const inputBuffer = await sharp(backgroundBuffer)
      .composite([levelSvgOverlayOptions])
      .toBuffer()

    return {
      input: inputBuffer,
      top: 50,
      left: 160,
    }
  }

  private getLevelBackgroundBuffer(): Buffer {
    const svg: string =
      '<svg width="80" height="30" xmlns="http://www.w3.org/2000/svg">' +
      ` <rect width="80" height="30" rx="5" ry="5" fill="black" />` +
      '</svg>'

    return Buffer.from(svg)
  }

  private getLevelTextOverlayOptions(level: number): OverlayOptions {
    const baseLevelText: string = 'Lv.'
    const levelText: string = baseLevelText + String(level)

    const generationOptions: GenerationOptions = {
      fontSize: 24,
      anchor: 'left top',
      attributes: {
        fill: 'white',
      },
    }
    const levelSvgBuffer: Buffer = Buffer.from(
      textToSVG.getSVG(levelText, generationOptions)
    )

    return {
      input: levelSvgBuffer,
    }
  }

  private async getRefinementRankOverlayOptions(
    weaponData: EnkaWeapon
  ): Promise<OverlayOptions> {
    const refinementRankValue: string = String(weaponData.refinementRank + 1)

    const backgroundBuffer: Buffer = this.getRefinementRankBackgroundBuffer()
    const textOverlayOptions: OverlayOptions =
      this.getRefinementRankTextOverlayOptions(refinementRankValue)

    const refinementRankBuffer: Buffer = await sharp(backgroundBuffer)
      .composite([textOverlayOptions])
      .toBuffer()

    return {
      input: refinementRankBuffer,
      top: 15,
      left: 10,
    }
  }

  private getRefinementRankBackgroundBuffer(): Buffer {
    const svg: string =
      '<svg width="45" height="30" xmlns="http://www.w3.org/2000/svg">' +
      ` <rect width="45" height="30" rx="5" ry="5" fill="black"/>` +
      '</svg>'

    return Buffer.from(svg)
  }

  private getRefinementRankTextOverlayOptions(
    refinementRankValue: string
  ): OverlayOptions {
    const baseRefinementRankText: string = 'R'
    const refinementRankText: string =
      baseRefinementRankText + refinementRankValue

    const generationOptions: GenerationOptions = {
      fontSize: 24,
      anchor: 'left top',
      attributes: {
        fill: 'white',
      },
    }
    const textBuffer: Buffer = Buffer.from(
      textToSVG.getSVG(refinementRankText, generationOptions)
    )

    return {
      input: textBuffer,
    }
  }

  private async getSubStatOverlayOptions(
    subStat: ItemStats
  ): Promise<OverlayOptions> {
    const statPropType = subStat.propType
    const statValue: string = convertStatValue(statPropType, subStat.value)

    const backgroundBuffer: Buffer = this.getStatBackground()

    const compositeArray: OverlayOptions[] = []
    compositeArray.push(this.getStatValueOverlayOptions(statValue))

    const inputBuffer: Buffer = await sharp(backgroundBuffer)
      .composite(compositeArray)
      .toBuffer()

    return {
      input: inputBuffer,
      top: 125,
      left: 210,
    }
  }

  private async getBaseAtkOverlayOptions(
    mainStat: ItemStats
  ): Promise<OverlayOptions> {
    const statPropType = mainStat.propType
    const statValue = convertStatValue(statPropType, mainStat.value)

    const backgroundBuffer: Buffer = this.getStatBackground()

    const compositeArray: OverlayOptions[] = []
    compositeArray.push(this.getStatValueOverlayOptions(statValue))

    const inputBuffer: Buffer = await sharp(backgroundBuffer)
      .composite(compositeArray)
      .toBuffer()

    return {
      input: inputBuffer,
      top: 90,
      left: 210,
    }
  }

  private getStatBackground(): Buffer {
    const baseSvg: string = '<svg width="222" height="30"/>'
    return Buffer.from(baseSvg)
  }

  private getStatValueOverlayOptions(value: string): OverlayOptions {
    const generationOptions: GenerationOptions = {
      fontSize: 24,
      anchor: 'left top',
      attributes: {
        fill: 'white',
      },
    }
    const valueBuffer: Buffer = Buffer.from(
      textToSVG.getSVG(value, generationOptions)
    )

    return {
      input: valueBuffer,
      gravity: 'east',
    }
  }
}
