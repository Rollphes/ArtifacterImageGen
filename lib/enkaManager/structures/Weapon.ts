import { Client } from '@/lib/enkaManager/client/Client'
import { EnkaManagerjsError } from '@/lib/enkaManager/errors/EnkaManagerjsError'
import { ItemStats } from '@/lib/enkaManager/structures/ItemStats'
import { APIWeaponEquip } from '@/lib/enkaManager/types/APITypes'
import { fetchImage } from '@/lib/enkaManager/util/fetchImage'

export class Weapon {
  private readonly imageBashPath: string
  private readonly imageFileType: string
  private readonly iconName: string
  readonly name: string
  readonly id: number
  readonly level: number
  readonly promoteLevel: number
  readonly refinementRank: number
  readonly rarity: number
  readonly mainStat: ItemStats
  readonly subStat?: ItemStats
  readonly iconURL: string

  constructor(client: Client, data: APIWeaponEquip) {
    if (!client.textMap)
      throw new EnkaManagerjsError(
        'ManagerError',
        'Client.deploy() may not have been executed.'
      )
    const hash = data.flat.nameTextMapHash
    this.id = data.itemId
    this.imageBashPath = client.imageBashPath
    this.imageFileType = client.imageFileType
    this.name = client.textMap[hash]
    this.level = data.weapon.level
    this.promoteLevel = data.weapon.promoteLevel || 0
    const affixMap = data.weapon.affixMap
    this.refinementRank = affixMap ? affixMap[data.itemId + 100000] : 0
    this.rarity = data.flat.rankLevel
    const weaponMainStat = data.flat.weaponStats[0]
    this.mainStat = new ItemStats(
      client,
      weaponMainStat.appendPropId,
      weaponMainStat.statValue
    )
    const weaponSubStat = data.flat.weaponStats[1]
    this.subStat = weaponSubStat
      ? new ItemStats(
          client,
          weaponSubStat.appendPropId,
          weaponSubStat.statValue
        )
      : undefined
    this.iconName =
      this.promoteLevel >= 2 ? data.flat.icon + '_Awaken' : data.flat.icon
    this.iconURL = client.enkaUiURL + this.iconName + this.imageFileType
  }

  async fetchIconBuffer() {
    const imagePath = this.imageBashPath + this.iconName + this.imageFileType
    return await fetchImage(imagePath, this.iconURL)
  }
}
