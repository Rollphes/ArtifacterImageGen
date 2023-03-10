import sharp from 'sharp'

import {
  PartsConfigTypes,
  Position,
} from '@/lib/buildCard/types/PartsConfigType'

export class Shadow implements PartsConfigTypes {
  readonly partsName: string = 'shadow'
  readonly position: Position = {
    top: 0,
    left: 0,
  }

  async partsCreate() {
    return await sharp(`./lib/buildCard/image/Shadow.png`).png().toBuffer()
  }
}
