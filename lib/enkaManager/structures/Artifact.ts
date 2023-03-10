import { Client } from '@/lib/enkaManager/client/Client'
import { EnkaManagerjsError } from '@/lib/enkaManager/errors/EnkaManagerjsError'
import { ItemStats } from '@/lib/enkaManager/structures/ItemStats'
import { APIReliquaryEquip } from '@/lib/enkaManager/types/APITypes'
import { ArtifactType } from '@/lib/enkaManager/types/types'
import { ReliquaryAffixExcelConfigTypes } from '@/lib/enkaManager/types/types'
import { fetchImage } from '@/lib/enkaManager/util/fetchImage'
import { reliquaryAffixExcelConfig } from '@/lib/enkaManager/util/ReliquaryAffixExcelConfig'

export class Artifact {
  private readonly imageBashPath: string
  private readonly imageFileType: string
  private readonly iconName: string
  readonly type: ArtifactType
  readonly itemId: number
  readonly setName: string
  readonly level: number
  readonly rarity: number
  readonly mainStats: ItemStats
  readonly subStats: ItemStats[]
  readonly appendPropList: ReliquaryAffixExcelConfigTypes[]
  readonly iconURL: string

  constructor(client: Client, data: APIReliquaryEquip, id: number) {
    if (!client.textMap)
      throw new EnkaManagerjsError(
        'ManagerError',
        'Client.deploy() may not have been executed.'
      )
    const setNameHash = data.flat.setNameTextMapHash
    this.itemId = id
    this.imageBashPath = client.imageBashPath
    this.imageFileType = client.imageFileType
    this.type = data.flat.equipType
    this.setName = client.textMap[setNameHash]
    this.level = data.reliquary.level - 1
    this.rarity = data.flat.rankLevel
    this.mainStats = new ItemStats(
      client,
      data.flat.reliquaryMainstat.mainPropId,
      data.flat.reliquaryMainstat.statValue
    )
    this.subStats =
      data.flat.reliquarySubstats?.map(
        (stats) => new ItemStats(client, stats.appendPropId, stats.statValue)
      ) || []
    this.appendPropList =
      data.reliquary.appendPropIdList
        ?.map((appendPropId) =>
          reliquaryAffixExcelConfig.find((affix) => affix.id == appendPropId)
        )
        .filter((v): v is ReliquaryAffixExcelConfigTypes => v !== undefined) ||
      []
    this.iconName = data.flat.icon
    this.iconURL = client.enkaUiURL + this.iconName + this.imageFileType
  }

  async fetchIconBuffer() {
    const imagePath = this.imageBashPath + this.iconName + this.imageFileType
    return await fetchImage(imagePath, this.iconURL)
  }
}
