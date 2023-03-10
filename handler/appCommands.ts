import {
  ApplicationCommandData,
  ApplicationCommandOptionType,
  ApplicationCommandType,
  Attachment,
  ChatInputCommandInteraction,
  Client,
  EmbedBuilder,
  Guild,
  Message,
  MessageContextMenuCommandInteraction,
  PermissionFlagsBits,
  TextInputStyle,
  UserContextMenuCommandInteraction,
} from 'discord.js'

import { CustomModalBuilder } from '@/lib/interaction'

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

export const commandDatas: CustomApplicationCommandData[] = [
  {
    name: 'embed',
    description: 'Embed送信(Json)',
    deferReply: false,
    defaultMemberPermissions: PermissionFlagsBits.Administrator,
    execute: async (interaction) => {
      if (interaction.user.id != BOT_CREATOR_ID) {
        await interaction.reply(`このコマンドは管理者用だぞ!!`)
        return
      }
      await interaction.showModal(embedCommandModal(interaction.client))
    },
  },
]
export default async (client: Client, guild: Guild) => {
  await guild.commands.set(commandDatas)
}
