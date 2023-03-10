import sharp, { OverlayOptions } from 'sharp'
import { GenerationOptions } from 'text-to-svg'

import { textToSVG } from '@/lib/buildCard/pic/TextPicGenerator'
import {
  PartsConfigTypes,
  Position,
} from '@/lib/buildCard/types/PartsConfigType'
import { AvatarInfo } from '@/lib/enkaManager'
import { Skill as EnkaSkill } from '@/lib/enkaManager/structures/Skill'

export class SkillLevel implements PartsConfigTypes {
  readonly partsName: string = 'skillLevel'
  readonly position: Position = {
    top: 0,
    left: 0,
  }
  private topList: number[] = [30, 135, 240]

  async partsCreate(avatarInfo: AvatarInfo) {
    const skills = avatarInfo.skills
    const background = this.getBackgroundBuffer()

    const compositeArray: OverlayOptions[] = []

    skills.map((skill, index) => {
      compositeArray.push(this.getLvOverlayOptions(skill, this.topList[index]))
    })

    return await sharp(background).composite(compositeArray).toBuffer()
  }

  private getLvOverlayOptions(skill: EnkaSkill, y: number): OverlayOptions {
    const textOptions: GenerationOptions = {
      x: 49,
      fontSize: 16,
      anchor: 'center top',
      attributes: { fill: skill.extraLevel > 0 ? 'aqua' : 'white' },
    }
    const svg: string = textToSVG.getPath(`Lv.${skill.level}`, textOptions)
    const buffer: Buffer = Buffer.from(
      `<svg width="98" height="20">${svg}</svg>`
    )
    return {
      input: buffer,
      top: y + 70,
      left: 15,
    }
  }

  private getBackgroundBuffer(): Buffer {
    const backgroundSvg: string =
      '<svg width="150" height="350" xmlns="http://www.w3.org/2000/svg"/>'
    return Buffer.from(backgroundSvg)
  }
}
