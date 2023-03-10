import {
  ApplicationCommandType,
  Client,
  ComponentType,
  Interaction,
  InteractionType,
} from 'discord.js'

import { InteractionExecuteData } from '@/lib/interaction'

export class InteractionExecute {
  private readonly client: Client
  private cache: Map<string, InteractionExecuteData>

  constructor(client: Client) {
    this.client = client
    this.cache = new Map()
  }

  set(customId: string, data: InteractionExecuteData) {
    this.cache.set(customId, data)
  }

  async run(interaction: Interaction) {
    if (interaction.type == InteractionType.ApplicationCommand) {
      const command = this.client.commandList.find(
        (v) => v.name === interaction.commandName
      )
      if (!command || !command.execute) return
      if (command.deferReply != false)
        await interaction.deferReply({ ephemeral: command.ephemeral })
      switch (command.type) {
        case ApplicationCommandType.User:
          if (!interaction.isUserContextMenuCommand()) return
          await command.execute(interaction)
          break
        case ApplicationCommandType.Message:
          if (!interaction.isMessageContextMenuCommand()) return
          await command.execute(interaction)
          break
        default:
          if (!interaction.isChatInputCommand()) return
          await command.execute(interaction)
          break
      }
    } else if (
      interaction.isModalSubmit() ||
      interaction.isMessageComponent()
    ) {
      const InteractionExecute = this.cache.get(interaction.customId)
      if (!InteractionExecute || !InteractionExecute.execute) return
      switch (InteractionExecute.componentType) {
        case ComponentType.Button:
          if (!interaction.isButton()) return
          await InteractionExecute.execute(interaction)
          break
        case ComponentType.StringSelect:
          if (!interaction.isStringSelectMenu()) return
          await InteractionExecute.execute(interaction)
          break
        case ComponentType.UserSelect:
          if (!interaction.isUserSelectMenu()) return
          await InteractionExecute.execute(interaction)
          break
        case ComponentType.RoleSelect:
          if (!interaction.isRoleSelectMenu()) return
          await InteractionExecute.execute(interaction)
          break
        case ComponentType.MentionableSelect:
          if (!interaction.isMentionableSelectMenu()) return
          await InteractionExecute.execute(interaction)
          break
        case ComponentType.ChannelSelect:
          if (!interaction.isChannelSelectMenu()) return
          await InteractionExecute.execute(interaction)
          break
        case ComponentType.TextInput:
          if (!interaction.isModalSubmit()) return
          await InteractionExecute.execute(interaction)
          break
      }
    }
  }
}
