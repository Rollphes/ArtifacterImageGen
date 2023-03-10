import {
  Client,
  ComponentType,
  MentionableSelectMenuBuilder,
  MentionableSelectMenuComponentData,
} from 'discord.js'

import { MentionableSelectMenuInteractionExecute } from '@/lib/interaction'

interface CustomMentionableSelectMenuComponentData
  extends Omit<MentionableSelectMenuComponentData, 'type'> {
  execute: MentionableSelectMenuInteractionExecute
  type?: ComponentType.MentionableSelect
}

export class CustomMentionableSelectMenuBuilder extends MentionableSelectMenuBuilder {
  public execute: MentionableSelectMenuInteractionExecute = async () => {}
  constructor(
    public client: Client,
    data: CustomMentionableSelectMenuComponentData
  ) {
    super(Object.assign({ type: ComponentType.MentionableSelect }, data))
    if (!data.execute) return this
    this.client.interactionExecute.set(data.customId, {
      componentType: ComponentType.MentionableSelect,
      customId: data.customId,
      execute: data.execute,
    })
    this.execute = data.execute
  }

  setExecute(execute: MentionableSelectMenuInteractionExecute): this {
    this.execute = execute
    return this
  }
}
