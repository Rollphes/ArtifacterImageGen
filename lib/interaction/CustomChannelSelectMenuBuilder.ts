import {
  ChannelSelectMenuBuilder,
  ChannelSelectMenuComponentData,
  Client,
  ComponentType,
} from 'discord.js'

import { ChannelSelectMenuInteractionExecute } from '@/lib/interaction'

interface CustomChannelSelectMenuComponentData
  extends Omit<ChannelSelectMenuComponentData, 'type'> {
  execute: ChannelSelectMenuInteractionExecute
  type?: ComponentType.ChannelSelect
}

export class CustomChannelSelectMenuBuilder extends ChannelSelectMenuBuilder {
  constructor(
    public client: Client,
    data: CustomChannelSelectMenuComponentData,
  ) {
    super(Object.assign({ type: ComponentType.ChannelSelect }, data))
    if (!data.execute) return this
    this.client.interactionExecute.set(data.customId, {
      componentType: ComponentType.ChannelSelect,
      customId: data.customId,
      execute: data.execute,
    })
    this.execute = data.execute
  }

  public execute: ChannelSelectMenuInteractionExecute = async () => {}

  public setExecute(execute: ChannelSelectMenuInteractionExecute): this {
    this.execute = execute
    return this
  }
}
