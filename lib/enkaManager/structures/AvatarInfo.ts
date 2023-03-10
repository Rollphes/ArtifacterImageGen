import { Client } from '@/lib/enkaManager/client/Client'
import { EnkaManagerjsError } from '@/lib/enkaManager/errors/EnkaManagerjsError'
import { Artifact } from '@/lib/enkaManager/structures/Artifact'
import { Avatar } from '@/lib/enkaManager/structures/Avatar'
import { fightProp } from '@/lib/enkaManager/structures/FightProp'
import {
  searchActiveSetBonus,
  SetBonus,
} from '@/lib/enkaManager/structures/SetBonus'
import { Skill } from '@/lib/enkaManager/structures/Skill'
import { Talent } from '@/lib/enkaManager/structures/Talent'
import { Weapon } from '@/lib/enkaManager/structures/Weapon'
import {
  APIAvatarInfo,
  APIReliquaryEquip,
  APIWeaponEquip,
} from '@/lib/enkaManager/types/APITypes'
import { FightPropKeys, PropEnum } from '@/lib/enkaManager/types/types'

export class AvatarInfo {
  readonly client: Client
  readonly avatar: Avatar
  readonly level: number
  readonly levelXp: number
  readonly ascension: number
  readonly talentList: Talent[]
  readonly skills: Skill[]
  readonly fightPropMap: Partial<{
    [key in FightPropKeys]: number
  }>
  readonly weapon: Weapon
  readonly artifacts: Artifact[]
  readonly setBonus: SetBonus[]
  readonly friendShipLevel: number

  constructor(client: Client, data: APIAvatarInfo) {
    if (!client.charDatas)
      throw new EnkaManagerjsError(
        'ManagerError',
        'Client.deploy() may not have been executed.'
      )
    const convertAvatarId = [10000005, 10000007].includes(data.avatarId)
      ? `${data.avatarId}-${
          data.skillDepotId || String(data.avatarId)[7] + '04'
        }`
      : data.avatarId
    this.client = client
    this.avatar = new Avatar(client, convertAvatarId, data.costumeId)
    this.level = +(data.propMap[PropEnum.Level].val || 0)
    this.levelXp = +(data.propMap[PropEnum.XP].val || 0)
    this.ascension = +(data.propMap[PropEnum.Ascension].val || 0)
    this.talentList =
      [...Array<undefined>(6)].map((_, index) => {
        return new Talent(
          client,
          convertAvatarId,
          index,
          index + 1 > (data.talentIdList?.length || 0)
        )
      }) || []

    const skillOrder = client.charDatas[convertAvatarId].SkillOrder
    this.skills = skillOrder
      .map(
        (key) =>
          new Skill(
            client,
            convertAvatarId,
            key,
            data.skillLevelMap[key],
            data.proudSkillExtraLevelMap
          )
      )
      .filter(
        (skill) => skill.iconURL != 'https://enka.network/ui/undefined.png'
      )

    this.fightPropMap = fightProp(data.fightPropMap)
    const weaponData = data.equipList.find(
      (equip): equip is APIWeaponEquip => equip.flat.itemType == 'ITEM_WEAPON'
    )
    if (!weaponData)
      throw new EnkaManagerjsError('APIError', 'weapon is undefined')
    this.weapon = new Weapon(client, weaponData)
    const artifactDatas = data.equipList.filter(
      (equip): equip is APIReliquaryEquip =>
        equip.flat.itemType == 'ITEM_RELIQUARY'
    )
    this.artifacts = artifactDatas.map(
      (data) => new Artifact(client, data, data.itemId)
    )
    this.setBonus = searchActiveSetBonus(client, this.artifacts)
    this.friendShipLevel = data.fetterInfo.expLevel
  }
}
