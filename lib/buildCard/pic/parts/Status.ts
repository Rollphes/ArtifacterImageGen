import sharp, { OverlayOptions } from 'sharp'
import { GenerationOptions } from 'text-to-svg'

import { textToSVG } from '@/lib/buildCard/pic/TextPicGenerator'
import {
  PartsConfigTypes,
  Position,
} from '@/lib/buildCard/types/PartsConfigType'
import { statusIconSVG } from '@/lib/buildCard/util/StatusIcon'
import { convertStatValue } from '@/lib/buildCard/util/StatusValueConverter'
import { AvatarInfo, FightPropKeys, PropType } from '@/lib/enkaManager'

export class Status implements PartsConfigTypes {
  readonly partsName: string = 'status'
  readonly position: Position = {
    top: 65,
    left: 790,
  }

  async partsCreate(avatarInfo: AvatarInfo) {
    const textMap = avatarInfo.client.textMap
    if (!textMap) return Buffer.from('')
    const statusBackground = this.getBackgroundBuffer()
    const fightProp = avatarInfo.fightPropMap
    const [DMGBonusName, DMGBonusType, DMGBonusValue] = this.getDMGBonusData(
      textMap,
      fightProp
    )

    const compositeArray: OverlayOptions[] = []

    compositeArray.push(
      await this.getBaseStatOverlayOptions(
        0,
        'FIGHT_PROP_HP',
        fightProp.MaxHP || 0,
        fightProp.BaseHP || 0,
        fightProp.ParamHP || 0,
        fightProp.ParamHPPercent || 0
      )
    )
    compositeArray.push(
      await this.getBaseStatOverlayOptions(
        1,
        'FIGHT_PROP_ATTACK',
        fightProp.ATK || 0,
        fightProp.BaseATK || 0,
        fightProp.ParamATK || 0,
        fightProp.ParamATKPercent || 0
      )
    )
    compositeArray.push(
      await this.getBaseStatOverlayOptions(
        2,
        'FIGHT_PROP_DEFENSE',
        fightProp.DEF || 0,
        fightProp.BaseDEF || 0,
        fightProp.ParamDEF || 0,
        fightProp.ParamDEFPercent || 0
      )
    )
    compositeArray.push(
      await this.getStatOverlayOptions(
        3,
        'FIGHT_PROP_ELEMENT_MASTERY',
        fightProp.ElementalMastery
      )
    )
    compositeArray.push(
      await this.getStatOverlayOptions(
        4,
        'FIGHT_PROP_CRITICAL',
        (fightProp.CRITRate || 0) * 100
      )
    )
    compositeArray.push(
      await this.getStatOverlayOptions(
        5,
        'FIGHT_PROP_CRITICAL_HURT',
        (fightProp.CRITDMG || 0) * 100
      )
    )
    compositeArray.push(
      await this.getStatOverlayOptions(
        6,
        'FIGHT_PROP_CHARGE_EFFICIENCY',
        (fightProp.EnergyRecharge || 0) * 100
      )
    )
    compositeArray.push(
      await this.getStatOverlayOptions(
        7,
        DMGBonusType,
        DMGBonusValue,
        DMGBonusName
      )
    )

    return await sharp(statusBackground).composite(compositeArray).toBuffer()
  }

  private getBackgroundBuffer(): Buffer {
    const backgroundSvg: string =
      '<svg width="575" height="550" xmlns="http://www.w3.org/2000/svg"/>'
    return Buffer.from(backgroundSvg)
  }

  private async getBaseStatOverlayOptions(
    index: number,
    type: PropType,
    resultValue: number,
    baseValue: number,
    PramValue: number,
    PramPercent: number
  ): Promise<OverlayOptions> {
    const statBackground = this.getStatBackgroundBuffer()
    const convertValue = convertStatValue(type, resultValue)
    const convertLeftDetailValue = convertStatValue(type, baseValue)
    const convertRightDetailValue = convertStatValue(
      type,
      PramValue + PramPercent * baseValue
    )

    const compositeArray: OverlayOptions[] = []

    compositeArray.push(this.getBaseValueOverlayOptions(convertValue))
    compositeArray.push(
      await this.getDetailOverlayOptions(
        convertLeftDetailValue,
        convertRightDetailValue
      )
    )

    const buffer: Buffer = await sharp(statBackground)
      .composite(compositeArray)
      .toBuffer()
    return {
      input: buffer,
      top: 71 * index,
      left: 0,
    }
  }

  private async getStatOverlayOptions(
    index: number,
    type: PropType,
    value?: number,
    name?: string
  ): Promise<OverlayOptions> {
    const statBackground = this.getStatBackgroundBuffer()
    const convertValue = convertStatValue(type, value || 0)

    const compositeArray: OverlayOptions[] = []

    if (name) {
      compositeArray.push(await this.createStatusIcon(type))
      compositeArray.push(this.getNameOverlayOptions(name))
    }
    compositeArray.push(this.getValueOverlayOptions(convertValue))

    const buffer = await sharp(statBackground)
      .composite(compositeArray)
      .toBuffer()
    return {
      input: buffer,
      top: 71 * index,
      left: 0,
    }
  }

  private getStatBackgroundBuffer(): Buffer {
    const backgroundSvg: string =
      '<svg width="575" height="45" xmlns="http://www.w3.org/2000/svg"/>'
    return Buffer.from(backgroundSvg)
  }

  private async getDetailOverlayOptions(
    leftValue: string,
    rightValue: string
  ): Promise<OverlayOptions> {
    const leftBuffer = this.getDetailTextBuffer(leftValue + '+', 'white')
    const rightBuffer = this.getDetailTextBuffer(rightValue, '#00ff00')

    const leftWidth = ((await sharp(leftBuffer).metadata()).width || 0) - 2
    const rightWidth = (await sharp(rightBuffer).metadata()).width || 0

    const detailBackgroundBuffer = this.getDetailBackgroundBuffer(
      leftWidth + rightWidth
    )

    const buffer = await sharp(detailBackgroundBuffer)
      .composite([
        {
          input: leftBuffer,
          top: 0,
          left: 0,
        },
        {
          input: rightBuffer,
          top: 0,
          left: leftWidth,
        },
      ])
      .toBuffer()
    return {
      input: buffer,
      gravity: 'southeast',
    }
  }
  private getDetailBackgroundBuffer(width: number): Buffer {
    const backgroundSvg: string = `<svg width="${width}" height="15" xmlns="http://www.w3.org/2000/svg"/>`
    return Buffer.from(backgroundSvg)
  }

  private getNameOverlayOptions(name: string): OverlayOptions {
    const textOptions: GenerationOptions = {
      fontSize: 25,
      anchor: 'top',
      attributes: { fill: 'white' },
    }
    const buffer: Buffer = Buffer.from(textToSVG.getSVG(name, textOptions))
    return {
      input: buffer,
      top: 5,
      left: 55,
    }
  }
  private getValueOverlayOptions(value: string): OverlayOptions {
    const textOptions: GenerationOptions = {
      fontSize: 25,
      anchor: 'top',
      attributes: { fill: 'white' },
    }
    const buffer: Buffer = Buffer.from(textToSVG.getSVG(value, textOptions))
    return {
      input: buffer,
      gravity: 'northeast',
    }
  }

  private getBaseValueOverlayOptions(value: string): OverlayOptions {
    const textOptions: GenerationOptions = {
      fontSize: 25,
      anchor: 'top',
      attributes: { fill: 'white' },
    }
    const buffer: Buffer = Buffer.from(textToSVG.getSVG(value, textOptions))
    return {
      input: buffer,
      gravity: 'northeast',
    }
  }

  private getDetailTextBuffer(value: string, color: string): Buffer {
    const textOptions: GenerationOptions = {
      fontSize: 12,
      anchor: 'top',
      attributes: { fill: color },
    }
    return Buffer.from(textToSVG.getSVG(value, textOptions))
  }

  private async createStatusIcon(type: PropType): Promise<OverlayOptions> {
    const buffer = await sharp(Buffer.from(statusIconSVG(type)))
      .resize(25, 25)
      .toBuffer()
    return {
      input: buffer,
      top: 7,
      left: 5,
    }
  }

  private getDMGBonusData(
    textMap: { [key in string]: string },
    fightProp: Partial<{
      [key in FightPropKeys]: number
    }>
  ): [string, PropType, number] {
    const dmgBonusTypes: { [key in string]: PropType } = {
      PhysicalDMGBonus: 'FIGHT_PROP_PHYSICAL_ADD_HURT',
      PyroDMGBonus: 'FIGHT_PROP_FIRE_ADD_HURT',
      ElectroDMGBonus: 'FIGHT_PROP_ELEC_ADD_HURT',
      HydroDMGBonus: 'FIGHT_PROP_WATER_ADD_HURT',
      DendroDMGBonus: 'FIGHT_PROP_GRASS_ADD_HURT',
      AnemoDMGBonus: 'FIGHT_PROP_WIND_ADD_HURT',
      GeoDMGBonus: 'FIGHT_PROP_ROCK_ADD_HURT',
      CryoDMGBonus: 'FIGHT_PROP_ICE_ADD_HURT',
      HealingBonus: 'FIGHT_PROP_HEAL_ADD',
    }
    const result = Object.entries(fightProp).reduce(
      ([maxName, maxValue], [name, value]) => {
        if (maxValue < value && Object.keys(dmgBonusTypes).includes(name))
          return [name, value]
        else return [maxName, maxValue]
      },
      ['', -1]
    )

    return [
      textMap[dmgBonusTypes[result[0]]],
      dmgBonusTypes[result[0]],
      result[1] * 100,
    ]
  }
}
