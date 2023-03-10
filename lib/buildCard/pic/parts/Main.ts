import sharp from 'sharp'

// import {
//   ArtifactBracer,
//   ArtifactDress,
//   ArtifactNecklace,
//   ArtifactRing,
//   ArtifactShoes,
// } from '@/lib/buildCard/pic/parts/Artifact'
import { BaseImage } from '@/lib/buildCard/pic/parts/BaseImage'
// import { Level } from '@/lib/buildCard/pic/parts/Level'
// import { SetBonus } from '@/lib/buildCard/pic/parts/SetBonus'
// import { Skill } from '@/lib/buildCard/pic/parts/Skill'
// import { Status } from '@/lib/buildCard/pic/parts/Status'
// import { Talent } from '@/lib/buildCard/pic/parts/Talent'
// import { TotalScore } from '@/lib/buildCard/pic/parts/TotalScore'
// import { Uid } from '@/lib/buildCard/pic/parts/Uid'
// import { Weapon } from '@/lib/buildCard/pic/parts/Weapon'
import {
  PartsConfigTypes,
  Position,
} from '@/lib/buildCard/types/PartsConfigType'

export class Main implements PartsConfigTypes {
  readonly partsName: string = 'main'
  readonly position: Position = {
    top: 0,
    left: 0,
  }

  partsCreate() {
    return sharp({
      create: {
        width: 1920,
        height: 1080,
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 1 },
      },
    })
      .png()
      .toBuffer()
  }

  readonly parts = [
    new BaseImage(),
    // new Level(),
    // new Weapon(),
    // new Skill(),
    // new Talent(),
    // new SetBonus(),
    // new TotalScore(), //TODO:数値以外なら出来る
    // new Status(), //TODO:数値以外なら行ける
    // new Uid(),
    // new ArtifactBracer(),
    // new ArtifactNecklace(),
    // new ArtifactShoes(),
    // new ArtifactRing(),
    // new ArtifactDress(),
  ]
}
