import { CharacterDetail, Element } from 'genshin-manager'
import sharp from 'sharp'

import { Character } from '@/lib/buildCard/parts/BaseImage/Character'
import { Constellation } from '@/lib/buildCard/parts/BaseImage/Constellation'
import { Love } from '@/lib/buildCard/parts/BaseImage/Love'
import { NameLv } from '@/lib/buildCard/parts/BaseImage/NameLv'
import { Shadow } from '@/lib/buildCard/parts/BaseImage/Shadow'
import { Skill } from '@/lib/buildCard/parts/BaseImage/Skill'
import {
  PartsConfigTypes,
  Position,
} from '@/lib/imageCreator/types/PartsConfigType'

export class BaseImage implements PartsConfigTypes {
  public readonly partsName: string = 'baseImage'
  public readonly position: Position = {
    top: 0,
    left: 0,
  }
  public readonly parts: PartsConfigTypes[] = []
  private readonly characterDetail: CharacterDetail

  constructor(characterDetail: CharacterDetail) {
    this.characterDetail = characterDetail
    this.parts.push(
      new Character(this.characterDetail),
      new Shadow(),
      new NameLv(this.characterDetail),
      new Love(),
      new Skill(this.characterDetail),
      new Constellation(this.characterDetail),
    )
  }

  public async partsCreate(): Promise<Buffer> {
    const element = this.characterDetail.element as Element
    return await sharp(`./lib/buildCard/image/base/${element}.png`)
      .png()
      .toBuffer()
  }

  public getCachePath(): string {
    const constellationCount = this.characterDetail.constellations.filter(
      (constellation) => !constellation.locked,
    ).length
    return `./lib/buildCard/image/cache/base-${
      this.characterDetail.costume.id !== this.characterDetail.defaultCostumeId
        ? `${this.characterDetail.costume.id}`
        : `${this.characterDetail.costume.id}${
            [10000005, 10000007].includes(this.characterDetail.id)
              ? `-${this.characterDetail.depotId}`
              : ''
          }`
    }-c${constellationCount}.png`
  }
}
