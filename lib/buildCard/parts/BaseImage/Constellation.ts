import {
  CharacterConstellation,
  CharacterDetail,
  Element,
} from 'genshin-manager'
import sharp, { OverlayOptions } from 'sharp'

import {
  PartsConfigTypes,
  Position,
} from '@/lib/imageCreator/types/PartsConfigType'

export class Constellation implements PartsConfigTypes {
  public readonly partsName: string = 'constellation'
  public readonly position: Position = {
    top: 0,
    left: 667,
  }
  private topList: number[] = [83, 176, 269, 362, 455, 548]
  private readonly characterDetail: CharacterDetail

  constructor(characterDetail: CharacterDetail) {
    this.characterDetail = characterDetail
  }

  public async partsCreate(): Promise<Buffer> {
    const element = this.characterDetail.element as Element
    const constellations = this.characterDetail.constellations

    const talentBackground = this.getBackgroundBuffer()

    const compositeArray: OverlayOptions[] = []

    await Promise.all(
      constellations.map(async (talent, index) =>
        compositeArray.push(
          await this.getTalentOverlayOptions(
            talent,
            element,
            this.topList[index],
          ),
        ),
      ),
    )

    return await sharp(talentBackground).composite(compositeArray).toBuffer()
  }

  private getBackgroundBuffer(): Buffer {
    return Buffer.from(
      '<svg width="100" height="650" xmlns="http://www.w3.org/2000/svg"/>',
    )
  }

  private async getTalentOverlayOptions(
    constellation: CharacterConstellation,
    element: string,
    y: number,
  ): Promise<OverlayOptions> {
    const iconBackground = await this.getIconBackgroundBuffer(
      element,
      constellation.locked,
    )
    const buffer = await sharp(iconBackground)
      .composite([await this.getIconOverlayOptions(constellation)])
      .toBuffer()
    return {
      input: buffer,
      top: y,
      left: 0,
    }
  }

  private async getIconOverlayOptions(
    constellation: CharacterConstellation,
  ): Promise<OverlayOptions> {
    const rawIcon = await constellation.icon.fetchBuffer()
    const resizeIcon: Buffer = await sharp(rawIcon).resize(45, 45).toBuffer()
    return {
      input: resizeIcon,
      top: 21,
      left: 20,
    }
  }

  private async getIconBackgroundBuffer(
    element: string,
    locked: boolean,
  ): Promise<Buffer> {
    const backgroundPath: string = locked
      ? `./lib/buildCard/image/talent/${element}-lock.png`
      : `./lib/buildCard/image/talent/${element}-unlock.png`

    return await sharp(backgroundPath).resize(88, 90).toBuffer()
  }
}
