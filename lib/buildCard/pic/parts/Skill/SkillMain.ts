import sharp, { OverlayOptions } from 'sharp'

import {
  PartsConfigTypes,
  Position,
} from '@/lib/buildCard/types/PartsConfigType'
import { AvatarInfo } from '@/lib/enkaManager'
import { Skill as EnkaSkill } from '@/lib/enkaManager/structures/Skill'

export class SkillMain implements PartsConfigTypes {
  readonly partsName: string = 'skillMain'
  readonly position: Position = {
    top: 0,
    left: 0,
  }
  private topList: number[] = [30, 135, 240]

  async partsCreate(avatarInfo: AvatarInfo) {
    const skills = avatarInfo.skills
    const background = this.getBackgroundBuffer()

    const compositeArray: OverlayOptions[] = []

    await Promise.all(
      skills.map(async (skill, index) => {
        compositeArray.push(
          await this.getSkillBackOverlayOptions(this.topList[index])
        )
        compositeArray.push(
          await this.getIconOverlayOptions(skill, this.topList[index])
        )
      })
    )

    return await sharp(background).composite(compositeArray).toBuffer()
  }

  getCachePath(avatarInfo: AvatarInfo) {
    const avatar = avatarInfo.avatar
    return `./lib/buildCard/image/cache/skill-${avatar.avatarId}.png`
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

  private async getIconOverlayOptions(
    skill: EnkaSkill,
    y: number
  ): Promise<OverlayOptions> {
    const rawIcon = await skill.fetchIconBuffer()
    const resizeIcon: Buffer = await sharp(rawIcon).resize(49, 49).toBuffer()
    return {
      input: resizeIcon,
      top: y + 20,
      left: 15 + 25,
    }
  }

  private getBackgroundBuffer(): Buffer {
    const backgroundSvg: string =
      '<svg width="150" height="350" xmlns="http://www.w3.org/2000/svg"/>'
    return Buffer.from(backgroundSvg)
  }
}
