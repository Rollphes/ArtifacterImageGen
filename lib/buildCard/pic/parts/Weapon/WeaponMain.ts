import sharp, { OverlayOptions } from 'sharp'
import { GenerationOptions } from 'text-to-svg'

import { textToSVG } from '@/lib/buildCard/pic/TextPicGenerator'
import {
  PartsConfigTypes,
  Position,
} from '@/lib/buildCard/types/PartsConfigType'
import { statusIconSVG } from '@/lib/buildCard/util/StatusIcon'
import {
  AvatarInfo,
  ItemStats,
  PropType,
  Weapon as EnkaWeapon,
} from '@/lib/enkaManager'

export class WeaponMain implements PartsConfigTypes {
  readonly partsName: string = 'weaponMain'
  readonly position: Position = {
    top: 0,
    left: 0,
  }

  async partsCreate(avatarInfo: AvatarInfo): Promise<Buffer> {
    const weaponData: EnkaWeapon = avatarInfo.weapon

    const weaponBackground: Buffer = this.getBackgroundBuffer()

    const compositeArray: OverlayOptions[] = []
    compositeArray.push(await this.getIconOverlayOptions(weaponData))
    compositeArray.push(await this.getRarityOverlayOptions(weaponData))
    compositeArray.push(this.getNameOverlayOptions(weaponData))
    compositeArray.push(
      await this.getBaseAtkOverlayOptions(weaponData.mainStat)
    )
    if (weaponData.subStat != undefined)
      compositeArray.push(
        await this.getSubStatOverlayOptions(weaponData.subStat)
      )

    return sharp(weaponBackground).composite(compositeArray).toBuffer()
  }

  getCachePath(avatarInfo: AvatarInfo) {
    const weapon = avatarInfo.weapon
    return `./lib/buildCard/image/cache/weapon-${weapon.id}${
      weapon.promoteLevel >= 2 ? '-awaken' : ''
    }.png`
  }

  private getBackgroundBuffer(): Buffer {
    const backgroundSvg: string =
      '<svg width="393" height="173" xmlns="http://www.w3.org/2000/svg"/>'
    return Buffer.from(backgroundSvg)
  }

  private async getIconOverlayOptions(
    weaponData: EnkaWeapon
  ): Promise<OverlayOptions> {
    const rawIcon: Buffer = await weaponData.fetchIconBuffer()
    const resizeIcon: Buffer = await sharp(rawIcon).resize(131, 131).toBuffer()
    return {
      input: resizeIcon,
      top: 14,
      left: 10,
    }
  }

  private async getRarityOverlayOptions(
    weaponData: EnkaWeapon
  ): Promise<OverlayOptions> {
    const rarity: number = weaponData.rarity

    const rarityBuffer = await sharp(
      `./lib/buildCard/image/rarity/${rarity}.png`
    )
      .png()
      .toBuffer()

    return {
      input: rarityBuffer,
      top: 140,
      left: 0,
    }
  }

  private getNameOverlayOptions(weaponData: EnkaWeapon): OverlayOptions {
    const weaponName: string = weaponData.name
    const generationOptions: GenerationOptions = {
      fontSize: 24,
      anchor: 'left top',
      attributes: {
        fill: 'white',
      },
    }
    const textBuffer: Buffer = Buffer.from(
      textToSVG.getSVG(weaponName, generationOptions)
    )

    return {
      input: textBuffer,
      top: 20,
      left: 160,
    }
  }

  private async getSubStatOverlayOptions(
    subStat: ItemStats
  ): Promise<OverlayOptions> {
    const statPropType = subStat.propType
    const statName = subStat.name.replace('元素チャージ効率', '元チャ効率')

    const backgroundBuffer: Buffer = this.getStatBackground()

    const compositeArray: OverlayOptions[] = []
    compositeArray.push(await this.getStatIconOverlayOptions(statPropType))
    compositeArray.push(this.getStatTextOverlayOptions(statName))

    const inputBuffer: Buffer = await sharp(backgroundBuffer)
      .composite(compositeArray)
      .toBuffer()

    return {
      input: inputBuffer,
      top: 123,
      left: 175,
    }
  }

  private async getBaseAtkOverlayOptions(
    mainStat: ItemStats
  ): Promise<OverlayOptions> {
    const statPropType = mainStat.propType
    const statName = mainStat.name

    const backgroundBuffer: Buffer = this.getStatBackground()

    const compositeArray: OverlayOptions[] = []
    compositeArray.push(await this.getStatIconOverlayOptions(statPropType))
    compositeArray.push(this.getStatTextOverlayOptions(statName))

    const inputBuffer: Buffer = await sharp(backgroundBuffer)
      .composite(compositeArray)
      .toBuffer()

    return {
      input: inputBuffer,
      top: 88,
      left: 175,
    }
  }

  private getStatBackground(): Buffer {
    const baseSvg: string =
      '<svg width="222" height="30">' +
      ' <rect width="222" height="30" fill-opacity="0"/> ' +
      '</svg>'

    return Buffer.from(baseSvg)
  }

  private async getStatIconOverlayOptions(
    type: PropType
  ): Promise<OverlayOptions> {
    const inputBuffer: Buffer = await sharp(Buffer.from(statusIconSVG(type)))
      .resize(20, 20)
      .toBuffer()

    return {
      input: inputBuffer,
      gravity: 'west',
    }
  }

  private getStatTextOverlayOptions(text: string): OverlayOptions {
    const generationOptions: GenerationOptions = {
      fontSize: 24,
      anchor: 'left top',
      attributes: {
        fill: 'white',
      },
    }

    const textBuffer: Buffer = Buffer.from(
      textToSVG.getSVG(text, generationOptions)
    )

    return {
      input: textBuffer,
      top: 2,
      left: 25,
    }
  }
}
