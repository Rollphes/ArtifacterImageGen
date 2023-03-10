import { Client } from '@/lib/enkaManager/client/Client'
import { Avatar } from '@/lib/enkaManager/structures/Avatar'
import { NameCard } from '@/lib/enkaManager/structures/NameCard'
import { ShowAvatarInfo } from '@/lib/enkaManager/structures/ShowAvatarInfo'
import { APIPlayerInfo } from '@/lib/enkaManager/types/APITypes'

export class PlayerInfo {
  readonly nickname: string
  readonly level: number
  readonly signature: string
  readonly worldLevel: number
  readonly nameCard: NameCard
  readonly finishAchievementNum: number
  readonly towerFloorIndex: number
  readonly towerLevelIndex: number
  readonly showAvatarInfoList: ShowAvatarInfo[]
  readonly showNameCardList: NameCard[]
  readonly profilePicture: Avatar

  constructor(client: Client, data: APIPlayerInfo) {
    this.nickname = data.nickname
    this.level = data.level
    this.signature = data.signature || ''
    this.worldLevel = data.worldLevel || 0
    this.nameCard = new NameCard(client, data.nameCardId)
    this.finishAchievementNum = data.finishAchievementNum || 0
    this.towerFloorIndex = data.towerFloorIndex || 0
    this.towerLevelIndex = data.towerLevelIndex || 0
    this.showAvatarInfoList = data.showAvatarInfoList
      ? data.showAvatarInfoList.map((v) => new ShowAvatarInfo(client, v))
      : []
    this.showNameCardList = data.showNameCardIdList
      ? data.showNameCardIdList.map((v) => new NameCard(client, v))
      : []
    this.profilePicture = new Avatar(
      client,
      data.profilePicture?.avatarId || 10000005,
      data.profilePicture?.costumeId
    )
  }
}
