import {
  ApplicationCommandType,
  Client,
  ComponentType,
  DiscordAPIError,
  HTTPError,
  Interaction,
} from 'discord.js'

import { InteractionExecuteData } from '@/lib/interaction'

export class InteractionExecute {
  private cache: Map<string, InteractionExecuteData>

  constructor(private readonly client: Client) {
    this.cache = new Map()
  }

  public set(customId: string, data: InteractionExecuteData): void {
    this.cache.set(customId, data)
  }

  public async run(interaction: Interaction): Promise<void> {
    await Promise.all([
      this.messageComponentRun(interaction),
      this.autoCompleteRun(interaction),
      this.commandRun(interaction),
    ])
  }

  private async messageComponentRun(interaction: Interaction): Promise<void> {
    if (!interaction.isModalSubmit() && !interaction.isMessageComponent())
      return
    const interactionExecute = this.cache.get(interaction.customId)
    if (!interactionExecute || !interactionExecute.execute) return

    try {
      switch (interactionExecute.componentType) {
        case ComponentType.Button:
          if (interaction.isButton())
            await interactionExecute.execute(interaction)
          break
        case ComponentType.StringSelect:
          if (interaction.isStringSelectMenu())
            await interactionExecute.execute(interaction)
          break
        case ComponentType.UserSelect:
          if (interaction.isUserSelectMenu())
            await interactionExecute.execute(interaction)
          break
        case ComponentType.RoleSelect:
          if (interaction.isRoleSelectMenu())
            await interactionExecute.execute(interaction)
          break
        case ComponentType.ChannelSelect:
          if (interaction.isChannelSelectMenu())
            await interactionExecute.execute(interaction)
          break
        case ComponentType.MentionableSelect:
          if (interaction.isMentionableSelectMenu())
            await interactionExecute.execute(interaction)
          break
        case ComponentType.TextInput:
          if (interaction.isModalSubmit())
            await interactionExecute.execute(interaction)
          break
      }
    } catch (err) {
      this.interactionErrorCatch(err, interaction)
    }
  }

  private async commandRun(interaction: Interaction): Promise<void> {
    if (!interaction.isCommand()) return
    const command = this.client.commandList.find(
      (v) => v.name === interaction.commandName,
    )
    if (!command || !command.execute) return

    if (command.deferReply !== false)
      await interaction.deferReply({ ephemeral: command.ephemeral })

    try {
      switch (command.type) {
        case ApplicationCommandType.User:
          if (interaction.isUserContextMenuCommand())
            await command.execute(interaction)
          break
        case ApplicationCommandType.Message:
          if (interaction.isMessageContextMenuCommand())
            await command.execute(interaction)
          break
        default:
          if (interaction.isChatInputCommand())
            await command.execute(interaction)
          break
      }
    } catch (err) {
      this.interactionErrorCatch(err, interaction)
    }
  }

  private async autoCompleteRun(interaction: Interaction): Promise<void> {
    if (!interaction.isAutocomplete()) return
    const command = this.client.commandList.find(
      (v) => v.name === interaction.commandName,
    )
    if (
      !command ||
      (command.type !== ApplicationCommandType.ChatInput &&
        command.type !== undefined)
    )
      return
    if (!command || !command.autoComplete) return

    try {
      await command.autoComplete(interaction)
    } catch (err) {
      this.interactionErrorCatch(err, interaction)
    }
  }

  private interactionErrorCatch(err: unknown, interaction: Interaction): void {
    if (
      !(err instanceof HTTPError && err.message === 'Service Unavailable') &&
      !(err instanceof DiscordAPIError && err.message === 'Unknown interaction')
    )
      throw err

    if (interaction.isCommand())
      console.error(`ErrorInteractionCommandName => ${interaction.commandName}`)

    if (interaction.isModalSubmit() || interaction.isMessageComponent())
      console.error(`ErrorInteractionCustomId => ${interaction.customId}`)
    if (interaction.isAutocomplete()) {
      console.error(
        `ErrorInteractionAutoCompleteCommandName => ${interaction.commandName}`,
      )
    }
    console.error(err)
  }
}
