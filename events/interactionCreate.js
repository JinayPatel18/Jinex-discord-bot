const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { getSettings } = require('../models/Settings');

module.exports = {
    name: 'interactionCreate',
    async execute(interaction) {
        // Handle slash commands
        if (interaction.isChatInputCommand()) {
            const command = interaction.client.commands.get(interaction.commandName);
            if (!command) return;
            try {
                await command.execute(interaction);
            } catch (error) {
                console.error(error);
                await interaction.reply({ content: 'There was an error!', ephemeral: true });
            }
        }
        
        // Handle verification button
        if (interaction.isButton() && interaction.customId === 'verify') {
            try {
                await interaction.deferReply({ ephemeral: true });
                
                const settings = getSettings(interaction.guildId);
                
                // AUTO-DETECT roles by name
                const unverifiedRole = settings?.unverifiedRole 
                    ? interaction.guild.roles.cache.get(settings.unverifiedRole)
                    : interaction.guild.roles.cache.find(r => r.name === 'Unverified');
                    
                const memberRole = settings?.memberRole
                    ? interaction.guild.roles.cache.get(settings.memberRole)
                    : interaction.guild.roles.cache.find(r => r.name === 'Member');
                
                // AUTO-DETECT channels by name
                const welcomeChannel = interaction.guild.channels.cache.find(ch => ch.name === 'welcome');
                const rulesChannel = interaction.guild.channels.cache.find(ch => ch.name === 'rules');
                const setupChannel = interaction.guild.channels.cache.find(ch => ch.name === 'setup');
                const foodChannel = interaction.guild.channels.cache.find(ch => ch.name === 'food-drinks');
                const mediaChannel = interaction.guild.channels.cache.find(ch => ch.name === 'media');
                
                // Assign/remove roles
                if (unverifiedRole && interaction.member.roles.cache.has(unverifiedRole.id)) {
                    await interaction.member.roles.remove(unverifiedRole);
                }
                if (memberRole) {
                    await interaction.member.roles.add(memberRole);
                }
                
                await interaction.editReply({ 
                    content: '✅ You have been verified! Welcome to the server!' 
                });
                
                // Send welcome message with auto-detected channels
                if (welcomeChannel) {
                    const welcomeEmbed = new EmbedBuilder()
                        .setColor(0xFF69B4)
                        .setTitle(`✨ Welcome ${interaction.user.username}! ✨`)
                        .setDescription(`Hey ${interaction.user}! Welcome to **${interaction.guild.name}**! We're so happy to have you in our growing community! 🎉
                        
If you enjoy the streams as much as we do, this is the perfect place to hang out and have fun!`)
                        .addFields(
                            { name: '📋 Get Started', value: 'Here are some things to get you started:', inline: false },
                            { name: '📜 Read the Rules', value: rulesChannel ? `${rulesChannel}` : '📜 Please read the rules', inline: false },
                            { name: '📱 Follow Jinuu69', value: '[Twitter](https://twitter.com/jinuu69) | [Twitch](https://twitch.tv/jinuu69) | [YouTube](https://youtube.com/jinuu69)', inline: false },
                            { name: '💻 Share Your Setup', value: setupChannel ? `${setupChannel}` : '💻 Share your setup', inline: false },
                            { name: '🍕 Food & Drinks', value: foodChannel ? `${foodChannel}` : '🍕 Share food pics', inline: false },
                            { name: '🎬 Media & Clips', value: mediaChannel ? `${mediaChannel}` : '🎬 Share media', inline: false },
                            { name: '🎮 Start Exploring', value: 'Now you can explore the server on your own! 🚀', inline: false }
                        )
                        .setThumbnail(interaction.guild.iconURL())
                        .setFooter({ text: 'Welcome to the community! 🎉' })
                        .setTimestamp();

                    await welcomeChannel.send({ 
                        content: `${interaction.user}`,
                        embeds: [welcomeEmbed] 
                    });
                }
                
            } catch (error) {
                console.error('Verification error:', error);
                await interaction.editReply({ 
                    content: '❌ There was an error verifying you. Please contact an admin.' 
                });
            }
        }
    }
};