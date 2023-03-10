import sharp from 'sharp'

import { SkillLevel } from '@/lib/buildCard/pic/parts/Skill/SkillLevel'
import { SkillMain } from '@/lib/buildCard/pic/parts/Skill/SkillMain'
import {
  PartsConfigTypes,
  Position,
} from '@/lib/buildCard/types/PartsConfigType'

export class Skill implements PartsConfigTypes {
  readonly partsName: string = 'skill'
  readonly position: Position = {
    top: 300,
    left: 0,
  }
  readonly parts: PartsConfigTypes[] = [new SkillMain(), new SkillLevel()]

  async partsCreate() {
    const skillBackground = this.getBackgroundBuffer()

    return await sharp(skillBackground).toBuffer()
  }

  private getBackgroundBuffer(): Buffer {
    const backgroundSvg: string =
      '<svg width="150" height="350" xmlns="http://www.w3.org/2000/svg"></svg>'
    return Buffer.from(backgroundSvg)
  }
}
