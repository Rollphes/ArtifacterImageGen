import CharactersJson from '@/lib/enkaManager/json/characters.json'
import NamecardsJson from '@/lib/enkaManager/json/namecards.json'
import TextMapJson from '@/lib/enkaManager/json/ys.json'
import { EnkaData } from '@/lib/enkaManager/structures/EnkaData'
import { APICharData } from '@/lib/enkaManager/types/APITypes'

export class Client {
  readonly imageBashPath = './lib/enkaManager/ui/'
  readonly imageFileType = '.png'
  readonly enkaURL = 'https://enka.network'
  readonly enkaUiURL = 'https://enka.network/ui/'
  readonly enkaUidURL = 'https://enka.network/api/uid/'
  readonly cache: Map<number, EnkaData> = new Map()
  charDatas?: {
    [key in string]: APICharData
  }
  textMap?: {
    [key in string]: string
  }
  nameCards?: {
    [key in string]: { icon: string }
  }
  previouslyFetchTime: number = new Date().getTime()

  private deployCharData() {
    this.charDatas = CharactersJson as {
      [key in string]: APICharData
    }
  }

  private deployTextMap() {
    const textMaps = TextMapJson
    this.textMap = textMaps.ja
  }

  private deployNameCards() {
    this.nameCards = NamecardsJson as {
      [key in string]: { icon: string }
    }
  }

  deploy() {
    this.deployCharData()
    this.deployTextMap()
    this.deployNameCards()
  }

  async fetch(uid: number) {
    const previousData = this.cache.get(uid)
    if (
      previousData &&
      previousData.avatarInfoList &&
      new Date().getTime() < previousData.createTimeStamp + 5 * 60 * 1000
    )
      return new Promise<EnkaData>((resolve) => {
        resolve(previousData)
      })
    const enkaData = new EnkaData(uid)
    await enkaData.fetch(this)
    this.cache.set(enkaData.uid, enkaData)
    return enkaData
  }
}
