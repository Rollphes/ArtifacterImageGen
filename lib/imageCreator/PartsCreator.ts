import fs from 'fs'
import sharp, { OverlayOptions } from 'sharp'

import { PartsConfigTypes } from '@/lib/imageCreator/types/PartsConfigType'

export class PartsCreator {
  constructor() {}

  public async create(parts: PartsConfigTypes): Promise<Buffer> {
    const cachePath = parts.getCachePath ? parts.getCachePath() : undefined

    if (cachePath && fs.existsSync(cachePath))
      return await sharp(cachePath).toBuffer()

    const buffer = await parts.partsCreate()

    const result = parts.parts
      ? await this.getPartsComposites(buffer, parts.parts)
      : buffer

    if (cachePath) fs.writeFileSync(cachePath, result)

    return result
  }

  private async getComposite(parts: PartsConfigTypes): Promise<OverlayOptions> {
    return {
      input: await this.create(parts),
      blend: parts.blend !== null ? parts.blend : 'over',
      top: parts.position.top,
      left: parts.position.left,
    }
  }

  private async getPartsComposites(
    baseImg: Buffer,
    parts: PartsConfigTypes[],
  ): Promise<Buffer> {
    const partsComposites = await Promise.all(
      parts.map((p) => this.getComposite(p)),
    )
    return await sharp(Buffer.from(baseImg))
      .composite(partsComposites)
      .toBuffer()
  }
}
