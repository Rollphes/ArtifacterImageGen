import sharp from 'sharp'

import { ArtifactMain } from '@/lib/buildCard/pic/parts/Artifact/ArtifactMain'
import { ArtifactValue } from '@/lib/buildCard/pic/parts/Artifact/ArtifactValue'
import {
  PartsConfigTypes,
  Position,
} from '@/lib/buildCard/types/PartsConfigType'
import { ArtifactType } from '@/lib/enkaManager'

abstract class ArtifactParts implements PartsConfigTypes {
  abstract readonly position: Position
  abstract readonly partsName: ArtifactType
  abstract readonly parts: PartsConfigTypes[]

  async partsCreate() {
    const backgroundBuffer: Buffer = this.getBackgroundBuffer()

    return await sharp(backgroundBuffer).toBuffer()
  }

  private getBackgroundBuffer(): Buffer {
    const svg =
      '<svg width="358" height="413" xmlns="http://www.w3.org/2000/svg"/>'

    return Buffer.from(svg)
  }
}

export class ArtifactBracer extends ArtifactParts {
  readonly partsName = 'EQUIP_BRACER'
  readonly parts = [
    new ArtifactMain(this.partsName),
    new ArtifactValue(this.partsName),
  ]
  readonly position = {
    top: 648,
    left: 30,
  }
}

export class ArtifactNecklace extends ArtifactParts {
  readonly partsName = 'EQUIP_NECKLACE'
  readonly parts = [
    new ArtifactMain(this.partsName),
    new ArtifactValue(this.partsName),
  ]
  readonly position = {
    top: 648,
    left: 404,
  }
}

export class ArtifactShoes extends ArtifactParts {
  readonly partsName = 'EQUIP_SHOES'
  readonly parts = [
    new ArtifactMain(this.partsName),
    new ArtifactValue(this.partsName),
  ]
  readonly position = {
    top: 648,
    left: 778,
  }
}

export class ArtifactRing extends ArtifactParts {
  readonly partsName = 'EQUIP_RING'
  readonly parts = [
    new ArtifactMain(this.partsName),
    new ArtifactValue(this.partsName),
  ]
  readonly position = {
    top: 648,
    left: 1150,
  }
}

export class ArtifactDress extends ArtifactParts {
  readonly partsName = 'EQUIP_DRESS'
  readonly parts = [
    new ArtifactMain(this.partsName),
    new ArtifactValue(this.partsName),
  ]
  readonly position = {
    top: 648,
    left: 1522,
  }
}
