import {
  Client,
  ComponentType,
  UserSelectMenuBuilder,
  UserSelectMenuComponentData,
} from 'discord.js'

import { UserSelectMenuInteractionExecute } from '@/lib/interaction'

interface CustomUserSelectMenuComponentData
  extends Omit<UserSelectMenuComponentData, 'type'> {
  execute: UserSelectMenuInteractionExecute
  type?: ComponentType.UserSelect
}

export class CustomUserSelectMenuBuilder extends UserSelectMenuBuilder {
  public execute: UserSelectMenuInteractionExecute = async () => {}
  constructor(public client: Client, data: CustomUserSelectMenuComponentData) {
    super(Object.assign({ type: ComponentType.UserSelect }, data))
    if (!data.execute) return this
    this.client.interactionExecute.set(data.customId, {
      componentType: ComponentType.UserSelect,
      customId: data.customId,
      execute: data.execute,
    })
    this.execute = data.execute
  }

  setExecute(execute: UserSelectMenuInteractionExecute): this {
    this.execute = execute
    return this
  }
}
