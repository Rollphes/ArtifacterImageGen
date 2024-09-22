import {
  Artifact,
  CharacterDetail,
  FightPropType,
  StatProperty,
} from 'genshin-manager'
import sharp from 'sharp'

import {
  scoringArtifact,
  ScoringType,
} from '@/lib/buildCard/util/ScoringArtifact'
import { statusIconPath } from '@/lib/buildCard/util/StatusIcon'
import { textToSVG } from '@/lib/imageCreator/textToSVG'
import {
  PartsConfigTypes,
  Position,
} from '@/lib/imageCreator/types/PartsConfigType'

export class SvgContent implements PartsConfigTypes {
  public readonly partsName: string = 'svgContent'
  public readonly position: Position = {
    top: 0,
    left: 0,
  }
  private readonly characterDetail: CharacterDetail
  private readonly uid: string
  private readonly type: ScoringType

  constructor(
    characterDetail: CharacterDetail,
    uid: string,
    type: ScoringType,
  ) {
    this.characterDetail = characterDetail
    this.uid = uid
    this.type = type
  }

  public async partsCreate(): Promise<Buffer> {
    const svgs: string[] = []

    svgs.push(this.getCharLvSvg())
    svgs.push(this.getCharFriendShipLvSvg())
    svgs.push(this.getStatusSvg())
    svgs.push(this.getWeaponSvg())
    svgs.push(this.getSkillLevelSvg())
    svgs.push(this.getSetBonusSvg())
    svgs.push(this.getScoringTypeSvg())
    svgs.push(
      this.getTotalScoreSvg(
        +this.characterDetail.artifacts
          .reduce(
            (result, artifact) => result + scoringArtifact(artifact, this.type),
            0,
          )
          .toFixed(1),
      ),
    )
    this.characterDetail.artifacts.forEach((artifact) => {
      svgs.push(this.getArtifactValueSvg(artifact))
    })

    return await sharp(
      Buffer.from(`<svg width="1920" height="1080">${svgs.join('')}</svg>`),
    ).toBuffer()
  }

  //Lv
  private getCharLvSvg(): string {
    return textToSVG.getPath(String(this.characterDetail.level), {
      x: 73,
      y: 75,
      fontSize: 25,
      anchor: 'top',
      attributes: { fill: 'white' },
    })
  }

  private getCharFriendShipLvSvg(): string {
    return textToSVG.getPath(String(this.characterDetail.friendShipLevel), {
      x: 157,
      y: 74,
      fontSize: 25,
      anchor: 'center top',
      attributes: { fill: 'white' },
    })
  }

  //Status
  private getStatusSvg(): string {
    const x = 790
    const y = 60
    const combatStatus = this.characterDetail.combatStatus
    const statusData: {
      type: FightPropType
      resultText: string
      baseText?: string
      diff?: number
    }[] = [
      {
        type: 'FIGHT_PROP_HP',
        resultText: combatStatus.maxHealth.valueText,
        baseText: combatStatus.healthBase.valueText,
        diff: combatStatus.maxHealth.value - combatStatus.healthBase.value,
      },
      {
        type: 'FIGHT_PROP_ATTACK',
        resultText: combatStatus.attack.valueText,
        baseText: combatStatus.attackBase.valueText,
        diff: combatStatus.attack.value - combatStatus.attackBase.value,
      },
      {
        type: 'FIGHT_PROP_DEFENSE',
        resultText: combatStatus.defense.valueText,
        baseText: combatStatus.defenseBase.valueText,
        diff: combatStatus.defense.value - combatStatus.defenseBase.value,
      },
      {
        type: 'FIGHT_PROP_ELEMENT_MASTERY',
        resultText: combatStatus.elementMastery.valueText,
      },
      {
        type: 'FIGHT_PROP_CRITICAL',
        resultText: combatStatus.critRate.valueText,
      },
      {
        type: 'FIGHT_PROP_CRITICAL_HURT',
        resultText: combatStatus.critDamage.valueText,
      },
      {
        type: 'FIGHT_PROP_CHARGE_EFFICIENCY',
        resultText: combatStatus.chargeEfficiency.valueText,
      },
      {
        type: combatStatus.sortedDamageBonus[0].type,
        resultText: combatStatus.sortedDamageBonus[0].valueText,
      },
    ]
    if (combatStatus.sortedDamageBonus[0].value === 0) statusData.pop()
    const svg = statusData
      .map((data, i) =>
        this.getStatSvg(
          i,
          data.type,
          data.resultText,
          data.baseText,
          data.diff,
        ),
      )
      .join('')
    return `<g transform="translate(${x}, ${y})">${svg}</g>`
  }

  private getStatSvg(
    index: number,
    type: FightPropType,
    resultValueText: string,
    baseValueText?: string,
    diffValue?: number,
  ): string {
    const svgs: string[] = []
    const y = 71 * index
    const statNameMap: Partial<{ [key in FightPropType]: string }> = {
      FIGHT_PROP_FIRE_ADD_HURT: '炎元素ダメージ',
      FIGHT_PROP_ELEC_ADD_HURT: '雷元素ダメージ',
      FIGHT_PROP_WATER_ADD_HURT: '水元素ダメージ',
      FIGHT_PROP_GRASS_ADD_HURT: '草元素ダメージ',
      FIGHT_PROP_WIND_ADD_HURT: '風元素ダメージ',
      FIGHT_PROP_ROCK_ADD_HURT: '岩元素ダメージ',
      FIGHT_PROP_ICE_ADD_HURT: '氷元素ダメージ',
      FIGHT_PROP_PHYSICAL_SUB_HURT: '物理ダメージ',
    }

    svgs.push(this.getStatNameSvg(statNameMap[type] ?? ''))
    if (statNameMap[type]) svgs.push(this.createStatusIcon(type, 2, 2, 5))

    svgs.push(this.getStatBaseValueSvg(resultValueText))
    if (baseValueText && diffValue) {
      const convertLeftDetailValueText = baseValueText
      const convertRightDetailValueText =
        (+diffValue.toFixed()).toLocaleString()
      svgs.push(
        this.getStatDetailValueSvg(
          convertLeftDetailValueText,
          convertRightDetailValueText,
        ),
      )
    }

    return `<g transform="translate(0, ${y})">${svgs.join('')}</g>`
  }

  private getStatNameSvg(name: string): string {
    return textToSVG.getPath(name, {
      x: 55,
      y: 5,
      fontSize: 25,
      anchor: 'top',
      attributes: { fill: 'white' },
    })
  }

  private getStatBaseValueSvg(value: string): string {
    return textToSVG.getPath(value, {
      x: 575,
      y: 0,
      fontSize: 25,
      anchor: 'right top',
      attributes: { fill: 'white' },
    })
  }

  private getStatDetailValueSvg(leftValue: string, rightValue: string): string {
    const x = 575
    const y = 45
    const rightX = textToSVG.getWidth(rightValue, { fontSize: 12 })
    const leftSvg = textToSVG.getPath(leftValue + '+', {
      x: x - rightX,
      y: y,
      fontSize: 12,
      anchor: 'right bottom',
      attributes: { fill: 'white' },
    })
    const rightSvg = textToSVG.getPath(rightValue, {
      x: x,
      y: y,
      fontSize: 12,
      anchor: 'right bottom',
      attributes: { fill: '#42a22c' },
    })
    return leftSvg + rightSvg
  }

  //WeaponLevel
  private getWeaponSvg(): string {
    const x = 1420
    const y = 30
    const weaponData = this.characterDetail.weapon
    const svgs: string[] = []
    svgs.push(
      textToSVG.getPath(`Lv.${weaponData.level}`, {
        x: 200,
        y: 50,
        fontSize: 25,
        anchor: 'center top',
        attributes: { fill: 'white' },
      }),
    )
    svgs.push(
      textToSVG.getPath(`R${weaponData.refinementRank}`, {
        x: 33,
        y: 15,
        fontSize: 25,
        anchor: 'center top',
        attributes: { fill: 'white' },
      }),
    )
    svgs.push(this.getWeaponValueSvg(weaponData.stats[0], 175, 90))
    if (weaponData.stats.length > 1)
      svgs.push(this.getWeaponValueSvg(weaponData.stats[1], 175, 125))

    return `<g transform="translate(${x}, ${y})">${svgs.join('')}</g>`
  }

  private getWeaponValueSvg(stat: StatProperty, x: number, y: number): string {
    return textToSVG.getPath(stat.valueText, {
      x:
        x +
        40 +
        textToSVG.getWidth(
          stat.name.replace('元素チャージ効率', '元チャ効率'),
          { fontSize: 24 },
        ),
      y: y,
      fontSize: 24,
      anchor: 'top',
      attributes: { fill: 'white' },
    })
  }

  //SkillLevel
  private getSkillLevelSvg(): string {
    const x = 65
    const yList = [330, 435, 540]
    const svgs: string[] = []
    this.characterDetail.skills.forEach((skill, i) => {
      svgs.push(
        textToSVG.getPath(`Lv.${skill.level}`, {
          x: x,
          y: yList[i] + 80,
          fontSize: 18,
          anchor: 'center',
          attributes: {
            fill: skill.extraLevel > 0 ? 'aqua' : 'white',
          },
        }),
      )
    })
    return svgs.join('')
  }

  //SetBonus
  private getSetBonusSvg(): string {
    const x = 1540
    const y = 225
    const yList = [[0], [-20, 20], [-35, 0, 35]]
    const svgs: string[] = []
    const setBonus = [
      ...this.characterDetail.setBonus.fourSetBonus.map((v) => ({
        artifact: v,
        count: 4,
      })),
      ...this.characterDetail.setBonus.twoSetBonus.map((v) => ({
        artifact: v,
        count: 2,
      })),
      ...this.characterDetail.setBonus.oneSetBonus.map((v) => ({
        artifact: v,
        count: 1,
      })),
    ]
    const setBonusLength = setBonus.length

    setBonus.forEach((bonus, index) => {
      const y = yList[setBonusLength][index]
      svgs.push(
        textToSVG.getPath(bonus.artifact.setName || '', {
          y: y + 56,
          fontSize: 22,
          anchor: 'top',
          attributes: { fill: 'rgb(0,255,0)' },
        }),
      )
      svgs.push(
        this.getRectText(
          String(bonus.count),
          20,
          'white',
          280,
          y + 56,
          45,
          26,
          'black',
          5,
        ),
      )
    })

    return `<g transform="translate(${x}, ${y})">${svgs.join('')}</g>`
  }

  //TotalScore
  private getScoringTypeSvg(): string {
    const scoringNames = {
      ATK: '攻撃力換算',
      DEF: '防御力換算',
      HP: 'HP換算',
      EM: '元素熟知換算',
      ER: '元素チャージ換算',
    }
    return textToSVG.getPath(scoringNames[this.type], {
      x: 1865,
      y: 587,
      fontSize: 24,
      anchor: 'right top',
      attributes: { fill: 'white' },
    })
  }

  private getTotalScoreSvg(score: number): string {
    return textToSVG.getPath(String(score), {
      x: 1655,
      y: 420,
      fontSize: 80,
      anchor: 'center top',
      attributes: { fill: 'white' },
    })
  }

  //Artifact
  private getArtifactValueSvg(artifact: Artifact): string {
    const xMap = {
      EQUIP_BRACER: 30,
      EQUIP_NECKLACE: 404,
      EQUIP_SHOES: 778,
      EQUIP_RING: 1150,
      EQUIP_DRESS: 1522,
    }
    const y = 648
    const svgs: string[] = []
    svgs.push(
      textToSVG.getPath(artifact.mainStat.valueText, {
        x: 345,
        y: 40,
        fontSize: 52,
        anchor: 'right top',
        attributes: { fill: 'white' },
      }),
      this.getRectText(
        `+${artifact.level}`,
        20,
        'white',
        300,
        100,
        45,
        23,
        'black',
        3,
      ),
    )

    artifact.subStats.forEach((subStat, i) => {
      const y = 163 + 50 * i
      svgs.push(this.createStatusIcon(subStat.type, 1.714, 15, y))
      svgs.push(
        textToSVG.getPath(
          subStat.name.replace('元素チャージ効率', '元チャ効率'),
          {
            x: 50,
            y: y,
            fontSize: 24,
            anchor: 'top',
            attributes: { fill: 'white' },
          },
        ),
      )
      svgs.push(
        textToSVG.getPath(subStat.valueText, {
          x: 345,
          y: y,
          fontSize: 24,
          anchor: 'right top',
          attributes: { fill: 'white' },
        }),
      )
      const thisAppendPropList = artifact.appendProps.filter(
        (appendProp) => appendProp.type === subStat.type,
      )
      const appendPropText = thisAppendPropList
        .map((thisAppendProp) => {
          const type = thisAppendProp.type
          const value =
            1 > thisAppendProp.value
              ? thisAppendProp.value * 100
              : thisAppendProp.value
          const valueText = type.match(/_PERCENT|_CRITICAL|_CHARGE|_ADD/g)
            ? new Intl.NumberFormat('ja', {
                maximumFractionDigits: 1,
                minimumFractionDigits: 1,
              }).format(Math.round(value * 10) / 10)
            : new Intl.NumberFormat('ja', {
                maximumFractionDigits: 0,
              }).format(Math.round(value * 10) / 10)
          return valueText
        })
        .join('+')
      svgs.push(
        textToSVG.getPath(appendPropText, {
          x: 345,
          y: y + 30,
          fontSize: 11,
          anchor: 'right top',
          attributes: { fill: '#cccccc' },
        }),
      )
    })

    svgs.push(
      textToSVG.getPath('Score', {
        x:
          345 -
          textToSVG.getWidth(scoringArtifact(artifact, this.type).toFixed(1), {
            fontSize: 35,
          }) -
          10,
        y: 410,
        fontSize: 24,
        anchor: 'right bottom',
        attributes: { fill: '#A0A0A0' },
      }),
    )

    svgs.push(
      textToSVG.getPath(scoringArtifact(artifact, this.type).toFixed(1), {
        x: 345,
        y: 413,
        fontSize: 36,
        anchor: 'right bottom',
        attributes: { fill: 'white' },
      }),
    )

    return `<g transform="translate(${xMap[artifact.type]}, ${y})">${svgs.join('')}</g>`
  }

  //util
  private createStatusIcon(
    type: FightPropType,
    size: number,
    x: number,
    y: number,
  ): string {
    const svg = statusIconPath(type, size)
    return `<g transform="translate(${x}, ${y})">${svg}</g>`
  }

  private getRectText(
    text: string,
    fontSize: number,
    textColor: string,
    x: number,
    y: number,
    width: number,
    height: number,
    rectColor: string,
    r?: number,
    rectOpacity?: number,
  ): string {
    const rectSvg = `
      <rect
        width="${width}"
        height="${height}"
        rx="${r || 0}"
        ry="${r || 0}"
        fill="${rectColor}"
        fill-opacity="${rectOpacity || 1}"
      />`
    const textSvg = textToSVG.getPath(text, {
      x: Math.floor(width / 2),
      y: Math.floor(height / 2),
      fontSize: fontSize,
      anchor: 'center middle',
      attributes: { fill: textColor },
    })
    return `<g transform="translate(${x}, ${y})">${rectSvg + textSvg}</g>`
  }
}
