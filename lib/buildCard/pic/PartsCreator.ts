import fs from 'fs'
import sharp, { OverlayOptions } from 'sharp'

import { PartsConfigTypes } from '@/lib/buildCard/types/PartsConfigType'
import { ScoringType } from '@/lib/buildCard/util/ScoringArtifact'
import { AvatarInfo } from '@/lib/enkaManager'
export class PartsCreator {
  private readonly avatarInfo: AvatarInfo
  private readonly uid: string
  private readonly scoringType: ScoringType

  constructor(avatarInfo: AvatarInfo, uid: string, type: ScoringType) {
    this.uid = uid
    this.avatarInfo = avatarInfo
    this.scoringType = type
  }

  async create(parts: PartsConfigTypes): Promise<Buffer> {
    const cachePath = parts.getCachePath
      ? parts.getCachePath(this.avatarInfo, this.scoringType)
      : undefined
    if (cachePath && fs.existsSync(cachePath)) {
      return await sharp(cachePath).png().toBuffer()
    } else if (parts.parts) {
      const partsComposites = await Promise.all(
        parts.parts.map(async (p) => {
          const data = await this.getComposite(p)
          return data
        })
      )
      const b = await parts.partsCreate(
        this.avatarInfo,
        this.uid,
        this.scoringType
      )
      const buffer = await sharp(Buffer.from(b))
        .composite(partsComposites)
        .toBuffer()
      if (cachePath) fs.writeFileSync(cachePath, buffer)
      return buffer
    } else {
      const buffer = await parts.partsCreate(
        this.avatarInfo,
        this.uid,
        this.scoringType
      )
      if (cachePath) fs.writeFileSync(cachePath, buffer)
      return buffer
    }
  }

  async getComposite(parts: PartsConfigTypes): Promise<OverlayOptions> {
    return {
      input: await this.create(parts),
      blend: parts.blend != null ? parts.blend : 'over',
      top: parts.position.top,
      left: parts.position.left,
    }
  }
}
