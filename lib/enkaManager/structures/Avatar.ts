import { Client } from '@/lib/enkaManager/client/Client'
import { EnkaManagerjsError } from '@/lib/enkaManager/errors/EnkaManagerjsError'
import { ElementKeys } from '@/lib/enkaManager/types/types'
import { fetchImage } from '@/lib/enkaManager/util/fetchImage'
import { getKeyByValue } from '@/lib/enkaManager/util/getKeyByValue'

export class Avatar {
  private readonly imageBashPath: string
  private readonly imageFileType: string
  private readonly iconName: string
  private readonly sideIconName: string
  private readonly artName: string
  readonly element: keyof typeof ElementKeys
  readonly name: string
  readonly avatarId: number | string
  readonly costumeId?: number
  readonly sideIconURL: string
  readonly iconURL: string
  readonly artURL: string

  constructor(client: Client, charId: number | string, costumeId?: number) {
    if (!client.charDatas || !client.textMap)
      throw new EnkaManagerjsError(
        'ManagerError',
        'Client.deploy() may not have been executed.'
      )
    const charData = client.charDatas[charId]
    const hash = charData.NameTextMapHash
    this.imageBashPath = client.imageBashPath
    this.imageFileType = client.imageFileType
    this.element = getKeyByValue(
      ElementKeys,
      charData.Element
    ) as keyof typeof ElementKeys
    this.name = client.textMap[hash]
    this.avatarId = charId
    this.costumeId = costumeId
    this.sideIconName =
      charData.Costumes && costumeId
        ? charData.Costumes[costumeId].sideIconName
        : charData.SideIconName
    const avatarName = (
      /(?<=UI_AvatarIcon_Side_).*?$/.exec(this.sideIconName) as RegExpExecArray
    )[0]
    this.iconName = 'UI_AvatarIcon_' + avatarName
    this.artName =
      charData.Costumes && costumeId
        ? charData.Costumes[costumeId].art
        : 'UI_Gacha_AvatarImg_' + avatarName
    this.sideIconURL = client.enkaUiURL + this.sideIconName + this.imageFileType
    this.iconURL = client.enkaUiURL + this.iconName + this.imageFileType
    this.artURL = client.enkaUiURL + this.artName + this.imageFileType
  }

  async fetchSideIconBuffer() {
    const imagePath =
      this.imageBashPath + this.sideIconName + this.imageFileType
    return await fetchImage(imagePath, this.sideIconURL)
  }

  async fetchIconBuffer() {
    const imagePath = this.imageBashPath + this.iconName + this.imageFileType
    return await fetchImage(imagePath, this.iconURL)
  }

  async fetchArtBuffer() {
    const imagePath = this.imageBashPath + this.artName + this.imageFileType
    return await fetchImage(imagePath, this.artURL)
  }
}
