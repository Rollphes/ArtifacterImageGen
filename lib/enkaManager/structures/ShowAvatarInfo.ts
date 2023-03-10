import { Client } from '@/lib/enkaManager/client/Client'
import { Avatar } from '@/lib/enkaManager/structures/Avatar'
import { APIShowAvatarInfo } from '@/lib/enkaManager/types/APITypes'

export class ShowAvatarInfo {
  readonly avatar: Avatar
  readonly level: number

  constructor(client: Client, data: APIShowAvatarInfo) {
    this.avatar = new Avatar(client, data.avatarId, data.costumeId)
    this.level = data.level
  }
}
