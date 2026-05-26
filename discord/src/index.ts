import 'dotenv/config'
import {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  SlashCommandBuilder,
  EmbedBuilder,
  Events,
} from 'discord.js'
import { kodariApi } from './api.js'

const token = process.env.DISCORD_TOKEN
const clientId = process.env.DISCORD_CLIENT_ID

if (!token || !clientId) {
  console.error('DISCORD_TOKEN and DISCORD_CLIENT_ID are required')
  process.exit(1)
}

const commands = [
  new SlashCommandBuilder()
    .setName('balance')
    .setDescription('Check your Kodari token balance'),
  new SlashCommandBuilder()
    .setName('daily')
    .setDescription('Claim your daily Kodari token reward'),
  new SlashCommandBuilder()
    .setName('link')
    .setDescription('Link your Discord account to Kodari'),
].map((c) => c.toJSON())

async function registerCommands() {
  const rest = new REST({ version: '10' }).setToken(token!)
  await rest.put(Routes.applicationCommands(clientId!), { body: commands })
  console.log('Slash commands registered')
}

const client = new Client({ intents: [GatewayIntentBits.Guilds] })

client.once(Events.ClientReady, (c) => {
  console.log(`Kodari Discord bot logged in as ${c.user.tag}`)
})

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return

  const discordId = interaction.user.id
  const username = interaction.user.username
  const displayName = interaction.user.displayName ?? username

  try {
    if (interaction.commandName === 'link') {
      const { user } = await kodariApi.linkUser(discordId, username, displayName)
      const embed = new EmbedBuilder()
        .setColor(0x5090ff)
        .setTitle('Account linked')
        .setDescription(
          `Welcome **${user.username}**! You have **${user.tokenBalance}** tokens.\nBuild at https://kodari.ai`
        )
      await interaction.reply({ embeds: [embed], ephemeral: true })
      return
    }

    if (interaction.commandName === 'balance') {
      const { user } = await kodariApi.getUser(discordId)
      const embed = new EmbedBuilder()
        .setColor(0x5090ff)
        .setTitle(`${user.displayName}'s balance`)
        .addFields({ name: 'Tokens', value: String(user.tokenBalance), inline: true })
      await interaction.reply({ embeds: [embed], ephemeral: true })
      return
    }

    if (interaction.commandName === 'daily') {
      const result = await kodariApi.claimDaily(discordId)
      const embed = new EmbedBuilder()
        .setColor(0x22c55e)
        .setTitle('Daily reward claimed!')
        .setDescription(`+${result.credited} tokens · Balance: **${result.balance}**`)
      await interaction.reply({ embeds: [embed], ephemeral: true })
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Something went wrong'
    await interaction.reply({
      content: msg.includes('not found')
        ? 'Link your account first with `/link`, then sign in at kodari.ai'
        : msg,
      ephemeral: true,
    })
  }
})

registerCommands()
  .then(() => client.login(token))
  .catch(console.error)
