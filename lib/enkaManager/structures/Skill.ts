import { Client } from '@/lib/enkaManager/client/Client'
import { EnkaManagerjsError } from '@/lib/enkaManager/errors/EnkaManagerjsError'
import { fetchImage } from '@/lib/enkaManager/util/fetchImage'

export class Skill {
  private readonly imageBashPath: string
  private readonly imageFileType: string
  private readonly iconName: string
  readonly extraLevel: number
  readonly level: number
  readonly iconURL: string

  constructor(
    client: Client,
    charId: number | string,
    skillId: number,
    level: number,
    proudSkillExtraLevelMap?: { [key in string]: number }
  ) {
    if (!client.charDatas)
      throw new EnkaManagerjsError(
        'ManagerError',
        'Client.deploy() may not have been executed.'
      )
    const charData = client.charDatas[charId]
    const proudId = charData.ProudMap[skillId]
    this.imageBashPath = client.imageBashPath
    this.imageFileType = client.imageFileType
    this.iconName = charData.Skills[skillId]
    this.extraLevel = proudSkillExtraLevelMap
      ? proudSkillExtraLevelMap[proudId] || 0
      : 0
    this.level = level + this.extraLevel
    this.iconURL = client.enkaUiURL + this.iconName + this.imageFileType
  }

  async fetchIconBuffer() {
    const imagePath = this.imageBashPath + this.iconName + this.imageFileType
    return await fetchImage(imagePath, this.iconURL)
  }
}
