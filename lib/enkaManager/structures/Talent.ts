import { Client } from '@/lib/enkaManager/client/Client'
import { EnkaManagerjsError } from '@/lib/enkaManager/errors/EnkaManagerjsError'
import { fetchImage } from '@/lib/enkaManager/util/fetchImage'

export class Talent {
  private readonly imageBashPath: string
  private readonly imageFileType: string
  private readonly iconName: string
  readonly iconURL: string
  readonly locked: boolean

  constructor(
    client: Client,
    charId: number | string,
    index: number,
    locked: boolean
  ) {
    if (!client.charDatas)
      throw new EnkaManagerjsError(
        'ManagerError',
        'Client.deploy() may not have been executed.'
      )
    const charData = client.charDatas[charId]
    this.imageBashPath = client.imageBashPath
    this.imageFileType = client.imageFileType
    this.iconName = charData.Consts[index]
    this.iconURL = client.enkaUiURL + this.iconName + this.imageFileType
    this.locked = locked
  }

  async fetchIconBuffer() {
    const imagePath = this.imageBashPath + this.iconName + this.imageFileType
    return await fetchImage(imagePath, this.iconURL)
  }
}
