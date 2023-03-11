import { Client } from '@/lib/enkaManager/client/Client'
import { EnkaManagerjsError } from '@/lib/enkaManager/errors/EnkaManagerjsError'
import { Artifact } from '@/lib/enkaManager/structures/Artifact'
import { fetchImage } from '@/lib/enkaManager/util/fetchImage'

const oneSetBonusIds: number[] = [15009, 15010, 15011, 15013]

export class SetBonus {
  private readonly imageBashPath: string
  private readonly imageFileType: string
  private readonly iconName: string
  readonly setId: number
  readonly iconURL: string
  readonly setName: string
  readonly count: number

  constructor(client: Client, setId: number, setName: string, count: number) {
    if (!client.textMap)
      throw new EnkaManagerjsError(
        'ManagerError',
        'Client.deploy() may not have been executed.'
      )
    this.imageBashPath = client.imageBashPath
    this.imageFileType = client.imageFileType
    this.setName = setName
    this.iconName = `UI_RelicIcon_${setId}_${count == 1 ? 3 : 4}`
    this.iconURL = client.enkaUiURL + this.iconName + this.imageFileType
    this.setId = setId
    this.count = count
  }
  async fetchIconBuffer() {
    const imagePath = this.imageBashPath + this.iconName + this.imageFileType
    return await fetchImage(imagePath, this.iconURL)
  }
}

const getArtifactSetId = (artifact: Artifact): string => {
  const artifactIconUrl: string = artifact.iconURL
  const artifactIdIndex: number = 2
  const splitIconUrl = artifactIconUrl.split('_')

  return splitIconUrl[artifactIdIndex]
}

export const searchActiveSetBonus = (
  client: Client,
  artifacts: Artifact[]
): SetBonus[] => {
  const artifactIds: string[] = artifacts.map((artifact) =>
    getArtifactSetId(artifact)
  )
  const countIds: { [key: string]: number } = {}
  artifactIds.forEach((value) => {
    if (value in countIds) countIds[value]++
    else countIds[value] = 1
  })

  const setNames: { [key: string]: string } = {}
  artifacts.forEach((artifact) => {
    setNames[getArtifactSetId(artifact)] = artifact.setName
  })

  const setBonusActiveArtifactIds: string[] = Object.keys(countIds)
    .sort((a, b) => +a - +b)
    .filter((value) => {
      if (oneSetBonusIds.includes(+value)) {
        countIds[value] = 1
        return value
      } else if (countIds[value] >= 4) {
        countIds[value] = 4
        return value
      } else if (countIds[value] >= 2) {
        countIds[value] = 2
        return value
      }
    })

  return setBonusActiveArtifactIds.map((id) => {
    return new SetBonus(client, +id, setNames[id], countIds[id])
  })
}
