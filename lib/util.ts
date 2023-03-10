import { ChannelType, Client, MessageManager } from 'discord.js'

export const findGuildTextChannel = async (
  client: Client,
  channelId: string
) => {
  const channel = await (async () => {
    try {
      return await client.channels.fetch(channelId)
    } catch (e) {
      return
    }
  })()
  if (!channel) return
  if (
    channel.type == ChannelType.GuildText ||
    channel.type == ChannelType.GuildPublicThread
  )
    return channel
  return
}

export const getFirstMessage = async (messages: MessageManager) => {
  return (
    await messages.fetch({
      after: '0',
      limit: 1,
    })
  ).first()
}
