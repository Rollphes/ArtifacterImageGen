import { Client } from '@/lib/enkaManager/client/Client'
import { EnkaManagerjsError } from '@/lib/enkaManager/errors/EnkaManagerjsError'
import { PropType } from '@/lib/enkaManager/types/types'

export class ItemStats {
  readonly name: string
  readonly value: number
  readonly propType: PropType

  constructor(client: Client, propId: PropType, value: number) {
    if (!client.textMap)
      throw new EnkaManagerjsError(
        'ManagerError',
        'Client.deploy() may not have been executed.'
      )
    this.propType = propId
    this.name = client.textMap[propId]
    this.value = value
  }
}
