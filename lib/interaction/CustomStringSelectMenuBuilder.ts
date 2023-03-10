import {
  Client,
  ComponentType,
  StringSelectMenuBuilder,
  StringSelectMenuComponentData,
} from 'discord.js'

import { StringSelectMenuInteractionExecute } from '@/lib/interaction'

interface CustomStringSelectMenuComponentData
  extends Omit<StringSelectMenuComponentData, 'type'> {
  execute: StringSelectMenuInteractionExecute
  type?: ComponentType.StringSelect
}

export class CustomStringSelectMenuBuilder extends StringSelectMenuBuilder {
  public execute: StringSelectMenuInteractionExecute = async () => {}
  constructor(
    public client: Client,
    data: CustomStringSelectMenuComponentData
  ) {
    super(Object.assign({ type: ComponentType.StringSelect }, data))
    if (!data.execute) return this
    this.client.interactionExecute.set(data.customId, {
      componentType: ComponentType.StringSelect,
      customId: data.customId,
      execute: data.execute,
    })
    this.execute = data.execute
  }

  setExecute(execute: StringSelectMenuInteractionExecute): this {
    this.execute = execute
    return this
  }
}
