import fetch from 'node-fetch'

import { Client } from '@/lib/enkaManager/client/Client'
import { EnkaManagerjsError } from '@/lib/enkaManager/errors/EnkaManagerjsError'
import { AvatarInfo } from '@/lib/enkaManager/structures/AvatarInfo'
import { PlayerInfo } from '@/lib/enkaManager/structures/PlayerInfo'
import { APIEnkaData } from '@/lib/enkaManager/types/APITypes'
import { sleep } from '@/lib/util'

export class EnkaData {
  readonly uid: number
  playerInfo?: PlayerInfo
  avatarInfoList?: AvatarInfo[]
  createTimeStamp: number

  constructor(uid: number) {
    if (uid < 100000000 || uid > 999999999)
      throw new EnkaManagerjsError(
        'ManagerError',
        `The UID format is not correct(${uid})`
      )
    this.uid = uid
    this.createTimeStamp = new Date().getTime()
  }

  private async requestLimiter(client: Client) {
    const diffTime = new Date().getTime() - client.previouslyFetchTime
    client.previouslyFetchTime = new Date().getTime()
    if (diffTime < 1000) await sleep(1200 - diffTime)
  }

  async fetch(client: Client) {
    const err = new EnkaManagerjsError('APIError')
    const url = client.enkaUidURL + `${this.uid}`
    await this.requestLimiter(client)
    const res = await fetch(url)
    if (!res.ok) {
      if (res.status == 404) {
        err.setResponse(res, 'The user with that UID does not exist.')
        throw err
      } else {
        err.setResponse(res, 'Client or Server error.')
        throw err
      }
    }
    const result = (await res.json()) as APIEnkaData

    if (Object.keys(result).length) {
      this.playerInfo = new PlayerInfo(client, result.playerInfo)
      this.avatarInfoList = result.avatarInfoList?.map(
        (data) => new AvatarInfo(client, data)
      )
      this.createTimeStamp = new Date().getTime()
    }
    return this
  }
}
