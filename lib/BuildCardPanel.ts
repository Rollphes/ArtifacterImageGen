import {
  ActionRowBuilder,
  AttachmentBuilder,
  ButtonStyle,
  Client,
  EmbedBuilder,
  SelectMenuComponentOptionData,
  TextChannel,
  TextInputStyle,
} from 'discord.js'
import fs from 'fs'

import {
  convertStatValue,
  Main,
  PartsCreator,
  ScoringType,
} from '@/lib/buildCard'
import {
  AvatarInfo,
  FightPropKeys,
  PlayerInfo,
  PropType,
  Weapon,
} from '@/lib/enkaManager'
import {
  CustomButtonBuilder,
  CustomModalBuilder,
  CustomStringSelectMenuBuilder,
} from '@/lib/interaction'
import { findGuildTextChannel, getFirstMessage } from '@/lib/util'

export class BuildCardPanel {
  private readonly BUILD_CHANNEL_ID = process.env.build_channel as string
  private readonly client: Client
  private buildChannel?: TextChannel
  private mainParts = new Main()

  constructor(client: Client) {
    this.client = client
  }

  private uidInputModal(userId: string) {
    const uid = this.client.inputCache.get(+userId)
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
              maxLength: 9,
              required: true,
              value: uid ? String(uid) : undefined,
            },
          ],
        },
      ],
      execute: async (interaction) => {
        await interaction.deferReply({ ephemeral: true })
        if (!interaction.guild || !interaction.member) return
        const inputUid = interaction.fields.getTextInputValue('InputUID')

        if (
          isNaN(+inputUid) ||
          +inputUid < 100000000 ||
          +inputUid > 999999999
        ) {
          await interaction.editReply(
            'UIDが正しく無いぞ!もう一度最初からやり直してくれよな!!'
          )
          return
        }

        const enkaData = await interaction.client.enkaNetwork.validationFetch(
          +inputUid
        )

        if (enkaData instanceof EmbedBuilder) {
          await interaction.editReply({
            content: '',
            embeds: [enkaData],
          })
          return
        }

        this.client.inputCache.set(+interaction.member.user.id, +inputUid)

        if (!enkaData.avatarInfoList) {
          const embed = new EmbedBuilder()
            .setTitle('🚫プロフィールが未公開又は未設定です')
            .setDescription(
              'プロフィールが設定されていないか非表示に設定されているぞ!!\nこの状態だとビルドカードは生成出来ないから再設定しれくれよな!!'
            )
            .setFields({ name: 'UID', value: `${inputUid}` })
            .setFooter({ text: `Powered by Enka.Network` })
            .setImage('attachment://Howto.png')
          await interaction.editReply({
            embeds: [embed],
            files: ['./lib/buildCard/image/Howto.png'],
          })
          return
        }

        const playerData = enkaData.playerInfo
        if (!playerData) return
        const avatarIcon = playerData.profilePicture.iconURL
        const embed = new EmbedBuilder()
          .setTitle(playerData.nickname)
          .setDescription(playerData.signature || '未設定')
          .setThumbnail(avatarIcon)
          .setImage(playerData.nameCard.iconURL)
          .setFields(
            {
              name: '世界ランク',
              value: `${playerData.worldLevel || 0}`,
              inline: true,
            },
            { name: '冒険ランク', value: `${playerData.level}`, inline: true },
            {
              name: 'アチーブメント',
              value: `${playerData.finishAchievementNum || 0}`,
              inline: true,
            }
          )
          .setFooter({ text: `Powered by Enka.Network` })

        await interaction.editReply({
          content: '',
          embeds: [embed],
          components: [
            new ActionRowBuilder<CustomStringSelectMenuBuilder>().addComponents(
              [this.characterSelectMenu(enkaData.avatarInfoList)]
            ),
          ],
        })
      },
    })
  }

  private characterSelectMenu(avatarInfoList: AvatarInfo[]) {
    const characterSelectMenuOption = avatarInfoList.map(
      (character, index): SelectMenuComponentOptionData => {
        return {
          label: character.avatar.name,
          description: `Lv${character.level}`,
          value: String(index),
        }
      }
    )
    return new CustomStringSelectMenuBuilder(this.client, {
      customId: 'buildCard-characterSelectMenu',
      placeholder: 'キャラクターを選択',
      minValues: 1,
      maxValues: 1,
      options: characterSelectMenuOption,
      execute: async (interaction) => {
        await interaction.deferUpdate()
        if (!interaction.guild) return
        if (!interaction.member) return
        const uid = this.client.inputCache.get(+interaction.member.user.id)
        if (!uid) return
        const enkaData = this.client.enkaNetwork.cache.get(uid)
        if (!enkaData || !enkaData.avatarInfoList || !enkaData.playerInfo)
          return
        if (enkaData.avatarInfoList.length <= +interaction.values[0]) return
        const character = enkaData.avatarInfoList[+interaction.values[0]]

        const embed = new CharacterEmbedBuilder(enkaData.playerInfo, character)

        await interaction.editReply({
          content: '',
          embeds: [embed],
          components: [
            new ActionRowBuilder<CustomStringSelectMenuBuilder>().addComponents(
              [this.characterSelectMenu(enkaData.avatarInfoList)]
            ),
            new ActionRowBuilder<CustomStringSelectMenuBuilder>().addComponents(
              [this.scoringTypeSelectMenu()]
            ),
          ],
          files: [],
        })
      },
    })
  }

  private scoringTypeSelectMenu() {
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
      execute: async (interaction) => {
        await interaction.deferUpdate()
        if (!interaction.message.embeds.length) return
        const characterName = interaction.message.embeds[0].data.author?.name
        if (!characterName) return
        await interaction.editReply({
          content: '処理中だぞ!!ちょっとまってくれよな!!',
          embeds: [],
          components: [],
          files: [],
        })
        if (!interaction.guild) return
        if (!interaction.member) return
        const uid = this.client.inputCache.get(+interaction.member.user.id)
        if (!uid) return
        fs.appendFileSync(
          'buildCard.log',
          new Date().toISOString() + ` ${interaction.user.id} ${uid}\n`
        )
        const enkaData = this.client.enkaNetwork.cache.get(uid)
        if (!enkaData || !enkaData.avatarInfoList || !enkaData.playerInfo)
          return
        const character = enkaData.avatarInfoList.find(
          (character) => character.avatar.name == characterName
        )
        if (!character) return

        const buildCard = new PartsCreator(
          character,
          String(enkaData.uid),
          interaction.values[0] as ScoringType
        )
        const buffer = await buildCard.create(this.mainParts)
        const embed = new EmbedBuilder()
          .setAuthor({
            name: character.avatar.name,
            iconURL: character.avatar.iconURL,
          })
          .setDescription(
            `${enkaData.playerInfo.nickname}・世界ランク${enkaData.playerInfo.worldLevel}・冒険ランク${enkaData.playerInfo.level}`
          )
          .setImage('attachment://buildCard.png')

        await interaction.editReply({
          content: '',
          embeds: [embed],
          components: [
            new ActionRowBuilder<CustomStringSelectMenuBuilder>().addComponents(
              [this.characterSelectMenu(enkaData.avatarInfoList)]
            ),
            new ActionRowBuilder<CustomStringSelectMenuBuilder>().addComponents(
              [this.scoringTypeSelectMenu()]
            ),
          ],
          files: [new AttachmentBuilder(buffer, { name: 'buildCard.png' })],
        })
      },
    })
  }

  private createButton() {
    return new CustomButtonBuilder(this.client, {
      customId: 'buildCard-createButton',
      style: ButtonStyle.Success,
      label: 'ビルドカードを生成する!!',
      emoji: '🔨',
      execute: async (interaction) => {
        await interaction.showModal(this.uidInputModal(interaction.user.id))
      },
    })
  }

  async deploy() {
    this.buildChannel = (await findGuildTextChannel(
      this.client,
      this.BUILD_CHANNEL_ID
    )) as TextChannel
    if (!this.buildChannel) return
    const messageToGenerateCard = await getFirstMessage(
      this.buildChannel.messages
    )
    const embedToGenerateCard = new EmbedBuilder()
      .setTitle('📇ビルドカード')
      .setDescription(
        '⚠**注意事項**\n' +
          '> **・ビルドカードを生成した時点で利用規約に同意したものとします。**\n' +
          '> **・ビルドカードに記載のURL及びロゴを改変する行為(切り取りを含む)は禁止されています。**\n' +
          '> **・利用規約に違反した場合、BOTの悪用と同様の対処(BAN)を行います。**\n' +
          '\n' +
          '⚖**スコア計算式**\n' +
          '> 本機能ではスコア平滑化の為、以下のように計算式を調整しています。\n' +
          '> `スコア = 会心率×2 + 会心ダメージ + HP`\n' +
          '> `スコア = 会心率×2 + 会心ダメージ + 攻撃力`\n' +
          '> `スコア = 会心率×2 + 会心ダメージ + 防御力×0.8`\n' +
          '> `スコア = 会心率×2 + 会心ダメージ + 元素熟知×0.25`\n' +
          '> `スコア = 会心率×2 + 会心ダメージ + 元素チャージ×0.9`\n'
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
}

class CharacterEmbedBuilder extends EmbedBuilder {
  private embedColorConfig: { [key: string]: `#${string}` } = {
    Cryo: '#00ffff',
    Anemo: '#00ff7f',
    Electro: '#ff00ff',
    Hydro: '#0000ff',
    Geo: '#daa520',
    Pyro: '#ff0000',
    Dendro: '#00ff00',
  }

  constructor(playerInfo: PlayerInfo, character: AvatarInfo) {
    super()
    const talentCount = character.talentList.filter(
      (talent) => !talent.locked
    ).length
    this.setAuthor({
      name: character.avatar.name,
      iconURL: character.avatar.iconURL,
    })
    this.setDescription(
      `${playerInfo.nickname}・世界ランク${playerInfo.worldLevel}・冒険ランク${playerInfo.level}`
    )
    this.setThumbnail(character.weapon.iconURL)
    this.setFields(
      {
        name: '武器',
        value:
          `Lv.${character.weapon.level} **${character.weapon.name}** R${
            character.weapon.refinementRank + 1
          }\n` + this.weaponStatusText(character.weapon),
      },
      { name: 'ステータス', value: this.characterStatusText(character) },
      {
        name: '命ノ星座',
        value: `[${
          '<:Con_true:1034419483814678558>'.repeat(talentCount) +
          '<:Con_false:1034419486469668874>'.repeat(6 - talentCount)
        }]`,
        inline: true,
      },
      {
        name: '天賦',
        value: `${character.skills
          .map((skill) =>
            skill.extraLevel > 0 ? `**${skill.level}**` : skill.level
          )
          .join('/')}`,
        inline: true,
      }
    )
    this.setFooter({
      text: `Lv.${character.level}/90・好感度${character.friendShipLevel}`,
    })
    this.setColor(this.embedColorConfig[character.avatar.element])
  }

  private weaponStatusText(weapon: Weapon) {
    return (
      `<:ATK:1034111750854946886> 基礎攻撃力:${weapon.mainStat.value}\n` +
      (weapon.subStat
        ? `${this.getWeaponSubEmoji(weapon.subStat.name)} ${
            weapon.subStat.name
          }:${convertStatValue(weapon.subStat.propType, weapon.subStat.value)}`
        : '')
    )
  }

  private characterStatusText(character: AvatarInfo) {
    const fightProp = character.fightPropMap
    if (!character.client.textMap) return ''
    const [DMGBonusPropType, DMGBonusValue] = this.getDMGBonusData(fightProp)
    const DMGBonusEmoji = this.getDMGBonusEmoji(DMGBonusPropType)
    const DMGBonusName = character.client.textMap[DMGBonusPropType]

    return (
      `<:HP:1034111772879224982> HP上限:${convertStatValue(
        'FIGHT_PROP_HP',
        fightProp.MaxHP || 0
      )}(${convertStatValue(
        'FIGHT_PROP_HP',
        fightProp.BaseHP || 0
      )}+${convertStatValue(
        'FIGHT_PROP_HP',
        (fightProp.ParamHP || 0) +
          (fightProp.ParamHPPercent || 0) * (fightProp.BaseHP || 0)
      )})\n` +
      `<:ATK:1034111750854946886> 攻撃力:${convertStatValue(
        'FIGHT_PROP_ATTACK',
        fightProp.ATK || 0
      )}(${convertStatValue(
        'FIGHT_PROP_ATTACK',
        fightProp.BaseATK || 0
      )}+${convertStatValue(
        'FIGHT_PROP_ATTACK',
        (fightProp.ParamATK || 0) +
          (fightProp.ParamATKPercent || 0) * (fightProp.BaseATK || 0)
      )})\n` +
      `<:DEF:1034111757981077514> 防御力:${convertStatValue(
        'FIGHT_PROP_DEFENSE',
        fightProp.DEF || 0
      )}(${convertStatValue(
        'FIGHT_PROP_DEFENSE',
        fightProp.BaseDEF || 0
      )}+${convertStatValue(
        'FIGHT_PROP_DEFENSE',
        (fightProp.ParamDEF || 0) +
          (fightProp.ParamDEFPercent || 0) * (fightProp.BaseDEF || 0)
      )})\n` +
      `<:EM:1034111763148443678> 元素熟知:${convertStatValue(
        'FIGHT_PROP_ELEMENT_MASTERY',
        fightProp.ElementalMastery || 0
      )}\n` +
      `<:CR:1034111754495598685> 会心率:${convertStatValue(
        'FIGHT_PROP_CRITICAL',
        (fightProp.CRITRate || 0) * 100
      )}\n` +
      `<:CD:1034111752499122206> 会心ダメージ:${convertStatValue(
        'FIGHT_PROP_CRITICAL_HURT',
        (fightProp.CRITDMG || 0) * 100
      )}\n` +
      `<:ER:1034111765044273162> 元素チャージ効率:${convertStatValue(
        'FIGHT_PROP_CHARGE_EFFICIENCY',
        (fightProp.EnergyRecharge || 0) * 100
      )}\n` +
      (DMGBonusName && DMGBonusEmoji
        ? `${DMGBonusEmoji} ${DMGBonusName}:${convertStatValue(
            DMGBonusPropType,
            DMGBonusValue
          )}`
        : '')
    )
  }
  private getDMGBonusData(
    fightProp: Partial<{
      [key in FightPropKeys]: number
    }>
  ): [PropType, number] {
    const dmgBonusTypes: { [key in string]: PropType } = {
      PhysicalDMGBonus: 'FIGHT_PROP_PHYSICAL_ADD_HURT',
      PyroDMGBonus: 'FIGHT_PROP_FIRE_ADD_HURT',
      ElectroDMGBonus: 'FIGHT_PROP_ELEC_ADD_HURT',
      HydroDMGBonus: 'FIGHT_PROP_WATER_ADD_HURT',
      DendroDMGBonus: 'FIGHT_PROP_GRASS_ADD_HURT',
      AnemoDMGBonus: 'FIGHT_PROP_WIND_ADD_HURT',
      GeoDMGBonus: 'FIGHT_PROP_ROCK_ADD_HURT',
      CryoDMGBonus: 'FIGHT_PROP_ICE_ADD_HURT',
    }
    const result = Object.entries(fightProp).reduce(
      ([maxName, maxValue], [name, value]) => {
        if (maxValue < value && Object.keys(dmgBonusTypes).includes(name))
          return [name, value]
        else return [maxName, maxValue]
      },
      ['', -1]
    )

    return [dmgBonusTypes[result[0]], result[1] * 100]
  }

  private getDMGBonusEmoji(propType: PropType) {
    const dmgBonusEmojis: Partial<{ [key in PropType]: string }> = {
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

  private getWeaponSubEmoji(name: string) {
    const weaponSubEmojis: { [key in string]: string } = {
      物理ダメージ: '<:Physical:1034111776255639592>',
      元素チャージ効率: '<:ER:1034111765044273162>',
      元素熟知: '<:EM:1034111763148443678>',
      会心率: '<:CR:1034111754495598685>',
      会心ダメージ: '<:CD:1034111752499122206>',
      HP: '<:HP_P:1034120891233226884>',
      攻撃力: '<:ATK_P:1034120888221708378>',
      防御力: '<:DEF_P:1034120889761009816>',
    }
    return weaponSubEmojis[name]
  }
}
