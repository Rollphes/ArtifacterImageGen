import { EmbedBuilder } from 'discord.js'

import { Client, EnkaManagerjsError } from '@/lib/enkaManager'

export class CustomEnkaNetwork extends Client {
  async validationFetch(uid: number) {
    const enkaData = await this.fetch(uid).catch((e) => {
      if (e instanceof EnkaManagerjsError) {
        if (/\[5..\]/.test(e.status || '')) return 'enkaServerError'
        if (/\[424\]/.test(e.status || '')) return 'mhyServerError'
        console.error(e)
        return 'otherError'
      } else {
        throw e
      }
    })

    const embed = new EmbedBuilder()
    if (enkaData == 'mhyServerError')
      return embed
        .setTitle('⚠原神サーバーのエラー⚠')
        .setDescription(
          `ゲームサーバーのエラーにより処理が停止しています。\n時間を置いてお試しください。\n要因:ゲームメンテナンス等`
        )
        .setFooter({ text: `Powered by Enka.Network` })

    if (enkaData == 'enkaServerError')
      return embed
        .setTitle('⚠EnkaNetWorkのエラー⚠')
        .setDescription(
          `サーバーエラーにより処理が停止しています。\n時間を置いてお試しください。`
        )
        .setFooter({ text: `Powered by Enka.Network` })

    if (enkaData == 'otherError')
      return embed
        .setTitle('⚠エラーが発生しました⚠')
        .setFooter({ text: `Powered by Enka.Network` })

    if (!enkaData)
      return embed
        .setTitle('🚫該当ユーザーが見つかりませんでした')
        .setDescription('UIDが間違っていないか？もう一度確認してみてくれ!!')
        .setFields({ name: 'UID', value: `${uid}` })
        .setFooter({ text: `Powered by Enka.Network` })
    return enkaData
  }
}
