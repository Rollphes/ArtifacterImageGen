import {
  CharacterDetail,
  FightPropType,
  StatProperty,
  Weapon as EnkaWeapon,
} from 'genshin-manager'
import sharp, { OverlayOptions } from 'sharp'

import { statusIconPath } from '@/lib/buildCard/util/StatusIcon'
import { textToSVG } from '@/lib/imageCreator/textToSVG'
import {
  PartsConfigTypes,
  Position,
} from '@/lib/imageCreator/types/PartsConfigType'

export class Weapon implements PartsConfigTypes {
  public readonly partsName: string = 'weapon'
  public readonly position: Position = {
    top: 30,
    left: 1420,
  }
  private readonly characterDetail: CharacterDetail

  constructor(characterDetail: CharacterDetail) {
    this.characterDetail = characterDetail
  }

  public async partsCreate(): Promise<Buffer> {
    const weaponData: EnkaWeapon = this.characterDetail.weapon

    const backgroundBuffer: Buffer = this.getBackgroundBuffer()
    const compositeArray: OverlayOptions[] = []

    compositeArray.push(await this.getIconOverlayOptions(weaponData))
    compositeArray.push(await this.getRarityOverlayOptions(weaponData))
    compositeArray.push(this.getNameOverlayOptions(weaponData))
    compositeArray.push(this.getRefinementRankOverlayOptions())
    compositeArray.push(
      await this.getBaseAtkOverlayOptions(weaponData.stats[0]),
    )
    if (weaponData.stats.length > 1) {
      compositeArray.push(
        await this.getSubStatOverlayOptions(weaponData.stats[1]),
      )
    }

    return await sharp(backgroundBuffer)
      .composite(compositeArray)
      .png()
      .toBuffer()
  }

  public getCachePath(): string {
    const weapon = this.characterDetail.weapon
    return `./lib/buildCard/image/cache/weapon-${weapon.id}${
      weapon.promoteLevel >= 2 ? '-awaken' : ''
    }.png`
  }

  private async getIconOverlayOptions(
    weaponData: EnkaWeapon,
  ): Promise<OverlayOptions> {
    const rawIcon: Buffer = await weaponData.icon.fetchBuffer()
    const resizeIcon: Buffer = await sharp(rawIcon).resize(131, 131).toBuffer()
    return {
      input: resizeIcon,
      top: 14,
      left: 10,
    }
  }

  private async getRarityOverlayOptions(
    weaponData: EnkaWeapon,
  ): Promise<OverlayOptions> {
    const rarity: number = weaponData.rarity

    const rarityBuffer = await sharp(
      `./lib/buildCard/image/rarity/${rarity}.png`,
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
    const textBuffer: Buffer = Buffer.from(
      textToSVG.getSVG(weaponName, {
        fontSize: 24,
        anchor: 'left top',
        attributes: {
          fill: 'white',
        },
      }),
    )

    return {
      input: textBuffer,
      top: 20,
      left: 160,
    }
  }

  private async getSubStatOverlayOptions(
    subStat: StatProperty,
  ): Promise<OverlayOptions> {
    const statName = subStat.name.replace('元素チャージ効率', '元チャ効率')

    const backgroundBuffer: Buffer = this.getStatBackground()

    const compositeArray: OverlayOptions[] = []
    compositeArray.push(await this.getStatIconOverlayOptions(subStat.type))
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
    mainStat: StatProperty,
  ): Promise<OverlayOptions> {
    const backgroundBuffer: Buffer = this.getStatBackground()

    const compositeArray: OverlayOptions[] = []
    compositeArray.push(await this.getStatIconOverlayOptions(mainStat.type))
    compositeArray.push(this.getStatTextOverlayOptions(mainStat.name))

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
    type: FightPropType,
  ): Promise<OverlayOptions> {
    const inputBuffer: Buffer = await sharp(
      Buffer.from(
        `<svg width="20" height="20">${statusIconPath(type, 1.428)}</svg>`,
      ),
    ).toBuffer()

    return {
      input: inputBuffer,
      gravity: 'west',
    }
  }

  private getStatTextOverlayOptions(text: string): OverlayOptions {
    const textBuffer: Buffer = Buffer.from(
      textToSVG.getSVG(text, {
        fontSize: 24,
        anchor: 'left top',
        attributes: {
          fill: 'white',
        },
      }),
    )

    return {
      input: textBuffer,
      top: 2,
      left: 25,
    }
  }

  private getRefinementRankOverlayOptions(): OverlayOptions {
    const backgroundBuffer: Buffer = this.getRefinementRankBackgroundBuffer()

    return {
      input: backgroundBuffer,
      top: 15,
      left: 10,
    }
  }

  private getRefinementRankBackgroundBuffer(): Buffer {
    return Buffer.from(
      `<svg width="45" height="30" xmlns="http://www.w3.org/2000/svg">
        <rect width="45" height="30" rx="5" ry="5" fill="black"/>
        </svg>`,
    )
  }

  private getBackgroundBuffer(): Buffer {
    return Buffer.from(
      `<svg width="460" height="180" xmlns="http://www.w3.org/2000/svg">
        <rect x="160" y="50" width="80" height="30" rx="5" ry="5" fill="black" />
        </svg>`,
    )
  }
}
