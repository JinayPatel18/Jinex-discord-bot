const { SlashCommandBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('verify')
        .setDescription('Send verification message in the verify channel (Admin only)')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        // Find the verify channel from settings or by name
        let verifyChannel;
        
        // Try to get from settings first
        const { getSettings } = require('../models/Settings');
        const settings = getSettings(interaction.guildId);
        
        if (settings?.verifyChannel) {
            verifyChannel = interaction.guild.channels.cache.get(settings.verifyChannel);
        }
        
        // If not in settings, try to find by name
        if (!verifyChannel) {
            verifyChannel = interaction.guild.channels.cache.find(ch => ch.name === 'verify');
        }
        
        if (!verifyChannel) {
            return interaction.reply({
                content: '❌ Please create a #verify channel first or run `/setup channel type:verify channel:#verify`',
                ephemeral: true
            });
        }

        // Create the verification embed
        const embed = new EmbedBuilder()
            .setColor(0x00FF00)
            .setTitle('🔐 Verification Required')
            .setDescription('Click the button below to verify yourself and gain access to the server!')
            .addFields(
                { name: 'Why Verify?', value: 'This helps us prevent bots and raids.', inline: true },
                { name: 'After Verification', value: 'You will get access to all channels.', inline: true },
                { name: 'Need Help?', value: 'Contact a moderator if you have issues.', inline: true }
            )
            .setFooter({ text: 'Click the button below to verify' })
            .setTimestamp();

        // Create the verify button
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('verify')
                    .setLabel('✅ Verify Me')
                    .setStyle(ButtonStyle.Success)
                    .setEmoji('✅')
            );

        // Send the message to the verify channel
        await verifyChannel.send({
            embeds: [embed],
            components: [row]
        });

        // Confirm to the admin
        await interaction.reply({
            content: `✅ Verification message sent to ${verifyChannel}!`,
            ephemeral: true
        });
    }
};