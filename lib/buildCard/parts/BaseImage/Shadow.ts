import sharp from 'sharp'

import {
  PartsConfigTypes,
  Position,
} from '@/lib/imageCreator/types/PartsConfigType'

export class Shadow implements PartsConfigTypes {
  public readonly partsName: string = 'shadow'
  public readonly position: Position = {
    top: 0,
    left: 0,
  }

  public async partsCreate(): Promise<Buffer> {
    return await sharp(`./lib/buildCard/image/Shadow.png`).png().toBuffer()
  }
}
