import {
  ApplicationCommandData,
  ApplicationCommandType,
  ChatInputCommandInteraction,
  Client,
  Guild,
  MessageContextMenuCommandInteraction,
  UserContextMenuCommandInteraction,
} from 'discord.js'

type executeTypes =
  | {
      type?: ApplicationCommandType.ChatInput
      execute: (interaction: ChatInputCommandInteraction) => Promise<void>
    }
  | {
      type: ApplicationCommandType.Message
      execute: (
        interaction: MessageContextMenuCommandInteraction
      ) => Promise<void>
    }
  | {
      type: ApplicationCommandType.User
      execute: (interaction: UserContextMenuCommandInteraction) => Promise<void>
    }
export type CustomApplicationCommandData = ApplicationCommandData & {
  ephemeral?: boolean
  deferReply?: boolean
} & executeTypes

export const commandDatas: CustomApplicationCommandData[] = []
export default async (client: Client, guild: Guild) => {
  await guild.commands.set(commandDatas)
}
