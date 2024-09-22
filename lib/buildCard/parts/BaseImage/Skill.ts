import { CharacterDetail, CharacterSkill as EnkaSkill } from 'genshin-manager'
import sharp, { OverlayOptions } from 'sharp'

import {
  PartsConfigTypes,
  Position,
} from '@/lib/imageCreator/types/PartsConfigType'

export class Skill implements PartsConfigTypes {
  public readonly partsName: string = 'skill'
  public readonly position: Position = {
    top: 0,
    left: 0,
  }
  private topList: number[] = [330, 435, 540]
  private readonly characterDetail: CharacterDetail

  constructor(characterDetail: CharacterDetail) {
    this.characterDetail = characterDetail
  }

  public async partsCreate(): Promise<Buffer> {
    const skills = this.characterDetail.skills

    const skillBackground = this.getBackgroundBuffer()

    const compositeArray: OverlayOptions[] = []

    await Promise.all(
      skills.map(async (skill, index) => {
        compositeArray.push(
          await this.getSkillBackOverlayOptions(this.topList[index]),
        )
        compositeArray.push(
          await this.getIconOverlayOptions(skill, this.topList[index]),
        )
      }),
    )

    return await sharp(skillBackground).composite(compositeArray).toBuffer()
  }

  private getBackgroundBuffer(): Buffer {
    const backgroundSvg: string =
      '<svg width="150" height="630" xmlns="http://www.w3.org/2000/svg"></svg>'
    return Buffer.from(backgroundSvg)
  }

  private async getIconOverlayOptions(
    skill: EnkaSkill,
    y: number,
  ): Promise<OverlayOptions> {
    const rawIcon = await skill.icon.fetchBuffer()
    const resizeIcon: Buffer = await sharp(rawIcon).resize(49, 49).toBuffer()
    return {
      input: resizeIcon,
      top: y + 20,
      left: 15 + 25,
    }
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
}
