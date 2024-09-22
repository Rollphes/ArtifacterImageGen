import {
  CharacterCostume,
  CharacterDetail,
  CharacterInfo,
  Client,
} from 'genshin-manager'

import { BaseImage } from '@/lib/buildCard/parts/BaseImage'
import { PartsCreator } from '@/lib/imageCreator'

async function createCache(): Promise<void> {
  const client = new Client({
    defaultLanguage: 'JP',
    downloadLanguages: ['JP'],
    assetCacheFolderPath: './cache',
  })
  await client.deploy()
  console.log('creating cache...')

  const costumeCount = CharacterCostume.allCostumeIds.length
  const travelerSkillDepotCount =
    CharacterInfo.getTravelerSkillDepotIds(10000005).length
  const allProgressCount = costumeCount * 7 + travelerSkillDepotCount * 7
  let nowProgressCount = 0

  for (const costumeId of CharacterCostume.allCostumeIds) {
    const costume = new CharacterCostume(costumeId)
    const characterId = costume.characterId
    if ([10000005, 10000007].includes(characterId)) continue
    const info = new CharacterInfo(characterId)
    const skillMap: { [key in number]: number } = {}
    const proudMap: { [key in number]: number } = {}
    info.skillOrder.forEach((skillId) => {
      skillMap[skillId] = 10
    })
    info.proudMap.forEach((value, key) => {
      proudMap[key] = value
    })

    for (let i = 0; i < 7; i++) {
      console.log(`progress: ${++nowProgressCount}/${allProgressCount}`)
      const constellationIds = info.constellationIds.slice(0, i)
      const buildCard = new PartsCreator()
      console.log(
        `create start ${info.name} ${costume.name} ${constellationIds.length}`,
      )
      await buildCard.create(
        new BaseImage(
          new CharacterDetail({
            avatarId: info.id,
            costumeId: costumeId,
            propMap: {
              4001: { val: '0' },
              1001: { val: '0' },
              1002: { val: '0' },
            },
            talentIdList: constellationIds,
            fightPropMap: {},
            skillDepotId: info.depotId,
            skillLevelMap: skillMap,
            proudSkillExtraLevelMap: proudMap,
            equipList: [
              {
                itemId: 14511,
                weapon: {
                  level: 90,
                  promoteLevel: 6,
                  affixMap: {
                    '114511': 4,
                  },
                },
              },
            ],
            fetterInfo: { expLevel: 0 },
          }),
        ),
      )
      console.log(`done: ${nowProgressCount}/${allProgressCount}\n`)
    }
  }
  console.log('start traveler')
  for (const characterId of [10000005, 10000007]) {
    for (const skillDepotId of CharacterInfo.getTravelerSkillDepotIds(
      characterId,
    )) {
      const info = new CharacterInfo(characterId, skillDepotId)
      if (info.element === undefined) continue
      const skillMap: { [key in number]: number } = {}
      const proudMap: { [key in number]: number } = {}
      info.skillOrder.forEach((skillId) => {
        skillMap[skillId] = 10
      })
      info.proudMap.forEach((value, key) => {
        proudMap[key] = value
      })

      for (let i = 0; i < 7; i++) {
        console.log(`progress: ${++nowProgressCount}/${allProgressCount}`)
        const constellationIds = info.constellationIds.slice(0, i)
        const buildCard = new PartsCreator()
        console.log(`create start ${info.name} ${constellationIds.length}`)
        await buildCard.create(
          new BaseImage(
            new CharacterDetail({
              avatarId: info.id,
              costumeId: info.defaultCostumeId,
              propMap: {
                4001: { val: '0' },
                1001: { val: '0' },
                1002: { val: '0' },
              },
              talentIdList: constellationIds,
              fightPropMap: {},
              skillDepotId: info.depotId,
              skillLevelMap: skillMap,
              proudSkillExtraLevelMap: proudMap,
              equipList: [
                {
                  itemId: 14511,
                  weapon: {
                    level: 90,
                    promoteLevel: 6,
                    affixMap: {
                      '114511': 4,
                    },
                  },
                },
              ],
              fetterInfo: { expLevel: 0 },
            }),
          ),
        )
        console.log(`done: ${nowProgressCount}/${allProgressCount}\n`)
      }
    }
  }

  console.log('done baseImage cache!')
}
void createCache()
