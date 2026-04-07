const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { saveSetting, getSettings } = require('../models/Settings');
const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, '..', 'settings.db'));

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setup')
        .setDescription('Setup the bot for this server (Admin only)')
        .addSubcommand(sub => sub
            .setName('channel')
            .setDescription('Setup channels')
            .addStringOption(option => option
                .setName('type')
                .setDescription('Channel type')
                .setRequired(true)
                .addChoices(
                    { name: 'Welcome Channel', value: 'welcome' },
                    { name: 'Verify Channel', value: 'verify' },
                    { name: 'Logs Channel', value: 'logs' },
                    { name: 'Rules Channel', value: 'rules' }
                ))
            .addChannelOption(option => option
                .setName('channel')
                .setDescription('Select the channel')
                .setRequired(true)))
        .addSubcommand(sub => sub
            .setName('role')
            .setDescription('Setup roles')
            .addStringOption(option => option
                .setName('type')
                .setDescription('Role type')
                .setRequired(true)
                .addChoices(
                    { name: 'Member Role (after verify)', value: 'member' },
                    { name: 'Unverified Role', value: 'unverified' },
                    { name: 'Moderator Role', value: 'mod' },
                    { name: 'Admin Role', value: 'admin' }
                ))
            .addRoleOption(option => option
                .setName('role')
                .setDescription('Select the role')
                .setRequired(true)))
        .addSubcommand(sub => sub
            .setName('show')
            .setDescription('Show current setup'))
        .addSubcommand(sub => sub
            .setName('reset')
            .setDescription('Reset all settings'))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const guildId = interaction.guildId;

        // Defer reply to prevent timeout (important!)
        await interaction.deferReply({ ephemeral: false });

        try {
            if (subcommand === 'channel') {
                const type = interaction.options.getString('type');
                const channel = interaction.options.getChannel('channel');
                
                saveSetting(guildId, `${type}Channel`, channel.id);
                
                const embed = new EmbedBuilder()
                    .setColor(0x00FF00)
                    .setTitle('✅ Channel Configured')
                    .setDescription(`${type.charAt(0).toUpperCase() + type.slice(1)} channel set to ${channel}`)
                    .setTimestamp();
                
                await interaction.editReply({ embeds: [embed] });
            }
            
            else if (subcommand === 'role') {
                const type = interaction.options.getString('type');
                const role = interaction.options.getRole('role');
                
                saveSetting(guildId, `${type}Role`, role.id);
                
                const embed = new EmbedBuilder()
                    .setColor(0x00FF00)
                    .setTitle('✅ Role Configured')
                    .setDescription(`${type.charAt(0).toUpperCase() + type.slice(1)} role set to ${role.name}`)
                    .setTimestamp();
                
                await interaction.editReply({ embeds: [embed] });
            }
            
            else if (subcommand === 'show') {
                const settings = getSettings(guildId);
                
                if (!settings || Object.values(settings).every(v => v === null)) {
                    return interaction.editReply({ 
                        content: '❌ No setup found! Use `/setup channel` and `/setup role` to configure the bot.'
                    });
                }
                
                const embed = new EmbedBuilder()
                    .setColor(0x0099FF)
                    .setTitle('📋 Bot Setup Configuration')
                    .addFields(
                        { name: 'Welcome Channel', value: settings.welcomeChannel ? `<#${settings.welcomeChannel}>` : '❌ Not set', inline: true },
                        { name: 'Verify Channel', value: settings.verifyChannel ? `<#${settings.verifyChannel}>` : '❌ Not set', inline: true },
                        { name: 'Mod Logs Channel', value: settings.logsChannel ? `<#${settings.logsChannel}>` : '❌ Not set', inline: true },
                        { name: 'Rules Channel', value: settings.rulesChannel ? `<#${settings.rulesChannel}>` : '❌ Not set', inline: true },
                        { name: 'Member Role', value: settings.memberRole ? `<@&${settings.memberRole}>` : '❌ Not set', inline: true },
                        { name: 'Unverified Role', value: settings.unverifiedRole ? `<@&${settings.unverifiedRole}>` : '❌ Not set', inline: true },
                        { name: 'Moderator Role', value: settings.modRole ? `<@&${settings.modRole}>` : '❌ Not set', inline: true },
                        { name: 'Admin Role', value: settings.adminRole ? `<@&${settings.adminRole}>` : '❌ Not set', inline: true }
                    )
                    .setTimestamp();
                
                await interaction.editReply({ embeds: [embed] });
            }
            
            else if (subcommand === 'reset') {
                const stmt = db.prepare('DELETE FROM guild_settings WHERE guildId = ?');
                stmt.run(guildId);
                
                const embed = new EmbedBuilder()
                    .setColor(0xFF0000)
                    .setTitle('🔄 Settings Reset')
                    .setDescription('All bot settings have been reset. Use `/setup` again to configure.')
                    .setTimestamp();
                
                await interaction.editReply({ embeds: [embed] });
            }
        } catch (error) {
            console.error('Setup error:', error);
            await interaction.editReply({ 
                content: '❌ An error occurred while running this command. Check the console for details.' 
            });
        }
    }
};