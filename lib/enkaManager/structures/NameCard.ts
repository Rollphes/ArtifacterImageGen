import { Client } from '@/lib/enkaManager/client/Client'
import { EnkaManagerjsError } from '@/lib/enkaManager/errors/EnkaManagerjsError'
import { fetchImage } from '@/lib/enkaManager/util/fetchImage'

export class NameCard {
  private readonly imageBashPath: string
  private readonly imageFileType: string
  private readonly iconName: string
  readonly iconURL: string

  constructor(client: Client, cardId: number) {
    if (!client.nameCards)
      throw new EnkaManagerjsError(
        'ManagerError',
        'Client.deploy() may not have been executed.'
      )
    const cardData = client.nameCards[cardId]
    this.imageBashPath = client.imageBashPath
    this.imageFileType = client.imageFileType
    this.iconName = cardData.icon
    this.iconURL = client.enkaUiURL + this.iconName + this.imageFileType
  }

  async fetchIconBuffer() {
    const imagePath = this.imageBashPath + this.iconName + this.imageFileType
    return await fetchImage(imagePath, this.iconURL)
  }
}
