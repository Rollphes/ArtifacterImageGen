import sharp from 'sharp'

import {
  PartsConfigTypes,
  Position,
} from '@/lib/imageCreator/types/PartsConfigType'

export class Love implements PartsConfigTypes {
  public readonly partsName: string = 'love'
  public readonly position: Position = {
    top: 0,
    left: 0,
  }

  public async partsCreate(): Promise<Buffer> {
    return await sharp(`./lib/buildCard/image/Love.png`).png().toBuffer()
  }
}
