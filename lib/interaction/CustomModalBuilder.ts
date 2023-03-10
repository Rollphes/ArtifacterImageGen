import {
  BaseComponentData,
  Client,
  ComponentType,
  ModalBuilder,
  ModalComponentData,
  TextInputComponentData,
} from 'discord.js'

import { ModalSubmitInteractionExecute } from '@/lib/interaction'

interface CustomActionRowData<T extends CustomTextInputComponentData>
  extends Omit<BaseComponentData, 'type'> {
  components: T[]
  type?: ComponentType.ActionRow
}

interface CustomTextInputComponentData
  extends Omit<TextInputComponentData, 'type'> {
  type?: ComponentType.TextInput
}

interface CustomModalComponentData
  extends Omit<ModalComponentData, 'components'> {
  execute?: ModalSubmitInteractionExecute
  components: CustomActionRowData<CustomTextInputComponentData>[]
}

export class CustomModalBuilder extends ModalBuilder {
  public execute: ModalSubmitInteractionExecute = async () => {}
  constructor(public client: Client, data: CustomModalComponentData) {
    const modalData: ModalComponentData = {
      customId: data.customId,
      title: data.title,
      components: data.components.map((component) => {
        return {
          type: ComponentType.ActionRow,
          components: component.components.map((component) => {
            return Object.assign({ type: ComponentType.TextInput }, component)
          }),
        }
      }),
    }
    super(modalData)
    if (!data.customId || !data.execute) return this
    this.client.interactionExecute.set(data.customId, {
      componentType: ComponentType.TextInput,
      customId: data.customId,
      execute: data.execute,
    })
    this.execute = data.execute
  }

  setExecute(execute: ModalSubmitInteractionExecute): this {
    this.execute = execute
    return this
  }
}
