import {
  ActionRowBuilder,
  AttachmentBuilder,
  ButtonStyle,
  Client,
  EmbedBuilder,
  SelectMenuComponentOptionData,
  StringSelectMenuInteraction,
  TextChannel,
  TextInputStyle,
} from 'discord.js'
import { GuildMemberRoleManager } from 'discord.js'
import fs from 'fs'
import {
  CharacterDetail,
  Element,
  EnkaData,
  EnkaManager,
  EnkaManagerError,
  EnkaNetworkError,
  FightPropType,
  PlayerDetail,
  Weapon,
} from 'genshin-manager'

import { BuildCard, ScoringType } from '@/lib/buildCard'
import { PartsCreator } from '@/lib/imageCreator'
import {
  CustomButtonBuilder,
  CustomModalBuilder,
  CustomStringSelectMenuBuilder,
} from '@/lib/interaction'
import { env, getFirstMessage } from '@/lib/util'

export class BuildCardPanel {
  public enkaManager: EnkaManager = new EnkaManager()
  /**
   * @param key userId
   * @param value uid
   */
  private inputCache: Map<string, string> = new Map()

  private buildChannel?: TextChannel
  private secretSelectLogger: Map<string, number[]> = new Map()

  constructor(private readonly client: Client) {}

  public async deploy(): Promise<void> {
    this.buildChannel = (await this.client.channels
      .fetch(env.BUILD_CHANNEL_ID)
      .catch(() => {})) as TextChannel
    if (!this.buildChannel) return
    const messageToGenerateCard = await getFirstMessage(
      this.buildChannel.messages,
    )
    const embedToGenerateCard = new EmbedBuilder()
      .setTitle('📇ビルドカード')
      .setDescription(
        '### ⚖スコア計算式\n' +
          '> 本機能ではスコア平滑化の為、以下のように計算式を調整しています。\n' +
          '> `スコア = 会心率×2 + 会心ダメージ + HP`\n' +
          '> `スコア = 会心率×2 + 会心ダメージ + 攻撃力`\n' +
          '> `スコア = 会心率×2 + 会心ダメージ + 防御力`\n' +
          '> `スコア = 会心率×2 + 会心ダメージ + 元素熟知×0.25`\n' +
          '> `スコア = 会心率×2 + 会心ダメージ + 元素チャージ`\n',
      )
    const messageOption = {
      embeds: [embedToGenerateCard],
      components: [
        new ActionRowBuilder<CustomButtonBuilder>().addComponents([
          this.createButton(),
        ]),
      ],
    }
    if (!messageToGenerateCard || !messageToGenerateCard.author.bot) {
      await this.buildChannel.bulkDelete(100)
      await this.buildChannel.send(messageOption)
    } else {
      await messageToGenerateCard.edit(messageOption)
    }
  }

  private uidInputModal(userId: string): CustomModalBuilder {
    const uid = this.inputCache.get(userId)
    return new CustomModalBuilder(this.client, {
      customId: 'buildCard-uidInputModal',
      title: 'UID入力画面',
      components: [
        {
          components: [
            {
              customId: 'InputUID',
              label: '原神のUIDを記入ください',
              style: TextInputStyle.Short,
              minLength: 9,
              maxLength: 10,
              required: true,
              value: uid ? String(uid) : undefined,
            },
          ],
        },
      ],
      execute: async (interaction): Promise<void> => {
        this.secretSelectLogger.delete(interaction.user.id)

        await interaction.deferReply({ ephemeral: true })
        if (!interaction.guild || !interaction.member) return
        const inputUid = interaction.fields.getTextInputValue('InputUID')

        if (isNaN(+inputUid) || !/1?\d{9}/.test(inputUid)) {
          await interaction.editReply(
            'UIDが正しく無いぞ!もう一度最初からやり直してくれよな!!',
          )
          return
        }

        const embed = new EmbedBuilder()
        const enkaData = await this.enkaFetch(+inputUid)
        if (enkaData instanceof EmbedBuilder) {
          await interaction.editReply({
            embeds: [enkaData],
            components: [],
            files: [],
          })
          return
        }

        this.inputCache.set(interaction.member.user.id, inputUid)

        if (enkaData.characterDetails.length > 0) {
          embed
            .setTitle(enkaData.playerDetail.nickname)
            .setDescription(enkaData.playerDetail.signature || '未設定')
            .setThumbnail(enkaData.playerDetail.profilePicture.icon.url)
            .setImage(enkaData.playerDetail.nameCard.pictures[1].url)
            .setFields(
              {
                name: '世界ランク',
                value: `${enkaData.playerDetail.worldLevel}`,
                inline: true,
              },
              {
                name: '冒険ランク',
                value: `${enkaData.playerDetail.level}`,
                inline: true,
              },
              {
                name: 'アチーブメント',
                value: `${enkaData.playerDetail.finishAchievementNum}`,
                inline: true,
              },
            )
            .setTimestamp(enkaData.nextShowCaseDate)
            .setFooter({
              text: `Powered by Enka.Network:データ更新予定時刻`,
            })
          await interaction.editReply({
            content: '',
            embeds: [embed],
            components: [
              new ActionRowBuilder<CustomStringSelectMenuBuilder>().addComponents(
                [this.characterSelectMenu(enkaData.characterDetails)],
              ),
            ],
          })
        } else {
          embed
            .setTitle('🚫プロフィールが未公開又は未設定です')
            .setDescription(
              'プロフィールが設定されていないか非表示に設定されているぞ!!\nこの状態だとビルドカードは生成出来ないから再設定しれくれよな!!',
            )
            .setFields({ name: 'UID', value: `${inputUid}` })
            .setImage('attachment://Howto.png')
            .setFooter({ text: `Powered by Enka.Network` })
          await interaction.editReply({
            embeds: [embed],
            files: ['./lib/buildCard/image/Howto.png'],
          })
        }
      },
    })
  }

  private characterSelectMenu(
    characterDetails: CharacterDetail[],
  ): CustomStringSelectMenuBuilder {
    const characterSelectMenuOption = characterDetails.map(
      (character, index): SelectMenuComponentOptionData => {
        return {
          label: character.name,
          description: `Lv${character.level}`,
          value: String(index),
        }
      },
    )
    return new CustomStringSelectMenuBuilder(this.client, {
      customId: 'buildCard-characterSelectMenu',
      placeholder: 'キャラクターを選択',
      minValues: 1,
      maxValues: 1,
      options: characterSelectMenuOption,
      execute: async (interaction): Promise<void> => {
        await interaction.deferUpdate()
        if (!interaction.guild) return
        if (!interaction.member) return
        const enkaData = await this.enkaFetch(+interaction.member.user.id)
        if (enkaData instanceof EmbedBuilder) {
          await interaction.editReply({
            embeds: [enkaData],
            components: [],
            files: [],
          })
          return
        }
        if (!enkaData.characterDetails.length) {
          const embed = new EmbedBuilder()
            .setTitle('🚫プロフィールが未公開又は未設定です')
            .setDescription(
              'プロフィールが設定されていないか非表示に設定されているぞ!!\nこの状態だとビルドカードは生成出来ないから再設定しれくれよな!!',
            )
            .setFields({
              name: 'UID',
              value: `${+interaction.member.user.id}`,
            })
            .setImage('attachment://Howto.png')
            .setFooter({ text: `Powered by Enka.Network` })
          await interaction.editReply({
            embeds: [embed],
            files: ['./lib/buildCard/image/Howto.png'],
          })
          return
        }
        if (enkaData.characterDetails.length <= +interaction.values[0]) return
        const character = enkaData.characterDetails[+interaction.values[0]]

        const embed = new CharacterEmbedBuilder(
          enkaData.playerDetail,
          character,
        )

        this.secretSelectMenuAppend(interaction.user.id, interaction)

        await interaction.editReply({
          content: '',
          embeds: [embed],
          components: [
            new ActionRowBuilder<CustomStringSelectMenuBuilder>().addComponents(
              [this.characterSelectMenu(enkaData.characterDetails)],
            ),
            new ActionRowBuilder<CustomStringSelectMenuBuilder>().addComponents(
              [this.scoringTypeSelectMenu()],
            ),
          ],
          files: [],
        })
      },
    })
  }

  private scoringTypeSelectMenu(): CustomStringSelectMenuBuilder {
    return new CustomStringSelectMenuBuilder(this.client, {
      customId: 'buildCard-scoringTypeSelectMenu',
      placeholder: 'ビルドカードを生成',
      minValues: 1,
      maxValues: 1,
      options: [
        {
          label: 'HP換算',
          description: 'HP換算でスコアを計算し画像を生成',
          value: 'HP',
        },
        {
          label: '攻撃力換算',
          description: '攻撃力換算でスコアを計算し画像を生成',
          value: 'ATK',
        },
        {
          label: '防御力換算',
          description: '防御力換算でスコアを計算し画像を生成',
          value: 'DEF',
        },
        {
          label: '元素熟知換算',
          description: '元素熟知換算でスコアを計算し画像を生成',
          value: 'EM',
        },
        {
          label: '元素チャージ換算',
          description: '元素チャージ換算でスコアを計算し画像を生成',
          value: 'ER',
        },
      ],
      execute: async (interaction): Promise<void> => {
        this.secretSelectLogger.delete(interaction.user.id)

        await interaction.deferUpdate()
        if (!interaction.message.embeds.length) return
        const characterName = interaction.message.embeds[0].data.author?.name
        if (!characterName) return
        await Promise.all([
          (async (): Promise<void> => {
            await interaction.editReply({
              content: '処理中だぞ!!ちょっとまってくれよな!!',
              embeds: [],
              components: [],
              files: [],
            })
          })(),
          (async (): Promise<void> => {
            const startTime = new Date().getTime() //log
            if (!interaction.guild) return
            if (!interaction.member) return
            const enkaData = await this.enkaFetch(+interaction.member.user.id)
            if (enkaData instanceof EmbedBuilder) {
              await interaction.editReply({
                embeds: [enkaData],
                components: [],
                files: [],
              })
              return
            }
            if (!enkaData.characterDetails.length) {
              const embed = new EmbedBuilder()
                .setTitle('🚫プロフィールが未公開又は未設定です')
                .setDescription(
                  'プロフィールが設定されていないか非表示に設定されているぞ!!\nこの状態だとビルドカードは生成出来ないから再設定しれくれよな!!',
                )
                .setFields({
                  name: 'UID',
                  value: `${+interaction.member.user.id}`,
                })
                .setImage('attachment://Howto.png')
                .setFooter({ text: `Powered by Enka.Network` })
              await interaction.editReply({
                embeds: [embed],
                files: ['./lib/buildCard/image/Howto.png'],
              })
              return
            }
            const character = enkaData.characterDetails.find(
              (character) => character.name === characterName,
            )
            if (!character) return

            const buffer = await new PartsCreator().create(
              new BuildCard(
                character,
                String(enkaData.uid),
                interaction.values[0] as ScoringType,
              ),
            )
            const generateTime = new Date().getTime() - startTime
            fs.appendFileSync(
              './buildCard.log',
              new Date().toISOString() +
                ` ${interaction.user.id} ${+interaction.member.user.id} ${generateTime}ms usualMethod\n`,
            )
            const embed = new EmbedBuilder()
              .setAuthor({
                name: character.name,
                iconURL: character.costume.icon.url,
              })
              .setDescription(
                `${enkaData.playerDetail.nickname}・世界ランク${enkaData.playerDetail.worldLevel}・冒険ランク${enkaData.playerDetail.level}`,
              )
              .setImage('attachment://buildCard.png')

            await interaction.editReply({
              content: '',
              embeds: [embed],
              components: [
                new ActionRowBuilder<CustomStringSelectMenuBuilder>().addComponents(
                  [this.characterSelectMenu(enkaData.characterDetails)],
                ),
                new ActionRowBuilder<CustomStringSelectMenuBuilder>().addComponents(
                  [this.scoringTypeSelectMenu()],
                ),
              ],
              files: [
                new AttachmentBuilder(buffer, {
                  name: 'buildCard.png',
                }),
              ],
            })
          })(),
        ])
      },
    })
  }

  private async enkaFetch(uid: number): Promise<EnkaData | EmbedBuilder> {
    try {
      return await this.enkaManager.fetchAll(uid)
    } catch (e) {
      const embed = new EmbedBuilder().setFooter({
        text: `Powered by Enka.Network`,
      })
      if (e instanceof EnkaManagerError) {
        embed
          .setTitle('🚫UIDのフォーマットが違います')
          .setDescription(
            'UIDが正しく無いぞ!もう一度最初からやり直してくれよな!!',
          )
          .setFields({ name: 'UID', value: String(uid) })
        return embed
      }
      if (e instanceof EnkaNetworkError) {
        switch (e.statusCode) {
          case 400:
            embed
              .setTitle('🚫該当ユーザーが見つかりませんでした')
              .setDescription(
                'UIDが間違っていないか？もう一度確認してみてくれ!!\nErrorCode:400_UID_FORMAT_CHAUNENN',
              )
              .setFields({ name: 'UID', value: String(uid) })
            break
          case 404:
            embed
              .setTitle('🚫該当ユーザーが見つかりませんでした')
              .setDescription(
                'UIDが間違っていないか？もう一度確認してみてくれ!!\nErrorCode:404_SONNA_UID_SHIRAN',
              )
              .setFields({ name: 'UID', value: String(uid) })
            break
          case 424:
            embed
              .setTitle('⚠原神サーバーのエラー⚠')
              .setDescription(
                `ゲームサーバーのエラーにより処理が停止しています。\n時間を置いてお試しください。\n要因:ゲームメンテナンス等\nErrorCode:424_GENSHIN_MAINTENANCE_CHOIMATE`,
              )
            break
          case 429:
            embed
              .setTitle('⚠EnkaNetWorkのエラー⚠')
              .setDescription(
                `過剰リクエストによりサービスが停止しています。\n時間を置いてお試しください。\nErrorCode:429_KAJOU_NI_ENKA_NETWORK_TUKAISUGITA`,
              )
            break
          case 500:
            embed
              .setTitle('⚠EnkaNetWorkのエラー⚠')
              .setDescription(
                `サーバーエラーにより処理が停止しています。\n時間を置いてお試しください。\nErrorCode:500_ENKA_NETWORK_DOWN_SHITORU`,
              )
            break
          case 503:
            embed
              .setTitle('⚠EnkaNetWorkのエラー⚠')
              .setDescription(
                `サーバーエラーにより処理が停止しています。\n時間を置いてお試しください。\nErrorCode:500_ENKA_NETWORK_YABAI_DOWN_SHITORU`,
              )
            break
          default:
            embed
              .setTitle('⚠エラーが発生しました⚠')
              .setDescription(
                `ErrorCode:NANYA_KONO_ERROR\nStatus:${e.statusCode}`,
              )
            break
        }
        return embed
      } else {
        throw e
      }
    }
  }

  private createButton(): CustomButtonBuilder {
    return new CustomButtonBuilder(this.client, {
      customId: 'buildCard-createButton',
      style: ButtonStyle.Success,
      label: 'ビルドカードを生成する!!',
      emoji: '🔨',
      execute: async (interaction): Promise<void> => {
        if (
          !interaction.member ||
          !(interaction.member.roles instanceof GuildMemberRoleManager)
        )
          return
        await interaction.showModal(this.uidInputModal(interaction.user.id))
      },
    })
  }

  private secretSelectMenuAppend(
    userId: string,
    interaction: StringSelectMenuInteraction,
  ): void {
    const secretSelectLogger = this.secretSelectLogger.get(userId)
    if (!secretSelectLogger) {
      this.secretSelectLogger.set(userId, [+interaction.values[0] + 1])
      return
    }
    if (secretSelectLogger.length >= 4) secretSelectLogger.shift()

    secretSelectLogger.push(+interaction.values[0] + 1)
    this.secretSelectLogger.set(userId, secretSelectLogger)
  }
}

class CharacterEmbedBuilder extends EmbedBuilder {
  private embedColorConfig: { [key in Element]: `#${string}` } = {
    Cryo: '#00ffff',
    Anemo: '#00ff7f',
    Electro: '#ff00ff',
    Hydro: '#0000ff',
    Geo: '#daa520',
    Pyro: '#ff0000',
    Dendro: '#00ff00',
    Phys: '#808080', //don't use
  }

  constructor(playerInfo: PlayerDetail, character: CharacterDetail) {
    super()
    const constellationCount = character.constellations.filter(
      (constellation) => !constellation.locked,
    ).length
    this.setAuthor({
      name: character.name,
      iconURL: character.costume.icon.url,
    })
    this.setDescription(
      `${playerInfo.nickname}・世界ランク${playerInfo.worldLevel}・冒険ランク${playerInfo.level}`,
    )
    this.setThumbnail(character.weapon.icon.url)
    this.setFields(
      {
        name: '武器',
        value:
          `Lv.${character.weapon.level} **${character.weapon.name}** R${character.weapon.refinementRank}\n` +
          this.weaponStatusText(character.weapon),
      },
      { name: 'ステータス', value: this.characterStatusText(character) },
      {
        name: '命ノ星座',
        value: `[${
          '<:Con_true:1034419483814678558>'.repeat(constellationCount) +
          '<:Con_false:1034419486469668874>'.repeat(6 - constellationCount)
        }]`,
        inline: true,
      },
      {
        name: '天賦',
        value: `${character.skills
          .map((skill) =>
            skill.extraLevel > 0 ? `**${skill.level}**` : skill.level,
          )
          .join('/')}`,
        inline: true,
      },
    )
    this.setFooter({
      text: `Lv.${character.level}/90・好感度${character.friendShipLevel}`,
    })
    this.setColor(this.embedColorConfig[character.element as Element])
  }

  private weaponStatusText(weapon: Weapon): string {
    return (
      `<:ATK:1034111750854946886> 基礎攻撃力:${weapon.stats[0].valueText}\n` +
      (weapon.stats.length > 1
        ? `${this.getWeaponSubEmoji(weapon.stats[1].type)} ${
            weapon.stats[1].name
          }:${weapon.stats[1].valueText}`
        : '')
    )
  }

  private characterStatusText(character: CharacterDetail): string {
    const combatStatus = character.combatStatus
    const damageBonusEmoji = this.getDMGBonusEmoji(
      character.combatStatus.sortedDamageBonus[0].type,
    )
    const damageBonusName = character.combatStatus.sortedDamageBonus[0].name

    const healthDiff = (+(
      combatStatus.maxHealth.value - combatStatus.healthBase.value
    ).toFixed()).toLocaleString()
    const attackDiff = (+(
      combatStatus.attack.value - combatStatus.attackBase.value
    ).toFixed()).toLocaleString()
    const defenseDiff = (+(
      combatStatus.defense.value - combatStatus.defenseBase.value
    ).toFixed()).toLocaleString()
    return (
      `<:HP:1034111772879224982> HP上限:${combatStatus.maxHealth.valueText}(${combatStatus.healthBase.valueText}+${healthDiff})\n` +
      `<:ATK:1034111750854946886> 攻撃力:${combatStatus.attack.valueText}(${combatStatus.attackBase.valueText}+${attackDiff})\n` +
      `<:DEF:1034111757981077514> 防御力:${combatStatus.defense.valueText}(${combatStatus.defenseBase.valueText}+${defenseDiff})\n` +
      `<:EM:1034111763148443678> 元素熟知:${combatStatus.elementMastery.valueText}\n` +
      `<:CR:1034111754495598685> 会心率:${combatStatus.critRate.valueText}\n` +
      `<:CD:1034111752499122206> 会心ダメージ:${combatStatus.critDamage.valueText}\n` +
      `<:ER:1034111765044273162> 元素チャージ効率:${combatStatus.chargeEfficiency.valueText}\n` +
      (character.combatStatus.sortedDamageBonus[0].value > 0
        ? `${damageBonusEmoji} ${damageBonusName}:${character.combatStatus.sortedDamageBonus[0].valueText}`
        : '')
    )
  }

  private getDMGBonusEmoji(propType: FightPropType): string | undefined {
    const dmgBonusEmojis: Partial<{ [key in FightPropType]: string }> = {
      FIGHT_PROP_PHYSICAL_ADD_HURT: '<:Physical:1034111776255639592>',
      FIGHT_PROP_FIRE_ADD_HURT: '<:Pyro:1034111777912389744>',
      FIGHT_PROP_ELEC_ADD_HURT: '<:Electro:1034111761500094595>',
      FIGHT_PROP_WATER_ADD_HURT: '<:Hydro:1034111774854758440>',
      FIGHT_PROP_GRASS_ADD_HURT: '<:Dendro:1034111759902048336>',
      FIGHT_PROP_WIND_ADD_HURT: '<:Anemo:1034111749273686016>',
      FIGHT_PROP_ROCK_ADD_HURT: '<:Geo:1034111767015604276>',
      FIGHT_PROP_ICE_ADD_HURT: '<:Cryo:1034111756370460702>',
    }
    return dmgBonusEmojis[propType]
  }

  private getWeaponSubEmoji(propType: FightPropType): string | undefined {
    const weaponSubEmojis: Partial<{ [key in FightPropType]: string }> = {
      FIGHT_PROP_PHYSICAL_ADD_HURT: '<:Physical:1034111776255639592>',
      FIGHT_PROP_CHARGE_EFFICIENCY: '<:ER:1034111765044273162>',
      FIGHT_PROP_ELEMENT_MASTERY: '<:EM:1034111763148443678>',
      FIGHT_PROP_CRITICAL: '<:CR:1034111754495598685>',
      FIGHT_PROP_CRITICAL_HURT: '<:CD:1034111752499122206>',
      FIGHT_PROP_HP_PERCENT: '<:HP_P:1034120891233226884>',
      FIGHT_PROP_ATTACK_PERCENT: '<:ATK_P:1034120888221708378>',
      FIGHT_PROP_DEFENSE_PERCENT: '<:DEF_P:1034120889761009816>',
    }
    return weaponSubEmojis[propType]
  }
}
