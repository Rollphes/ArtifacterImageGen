import sharp from 'sharp'

import {
  PartsConfigTypes,
  Position,
} from '@/lib/buildCard/types/PartsConfigType'

export class Love implements PartsConfigTypes {
  readonly partsName: string = 'love'
  readonly position: Position = {
    top: 0,
    left: 0,
  }

  async partsCreate() {
    return await sharp(`./lib/buildCard/image/Love.png`).png().toBuffer()
  }
}
