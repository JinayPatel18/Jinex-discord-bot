const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('guide')
        .setDescription('Send the server guide/welcome message (Admin only)')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        // Create the welcome embed
        const welcomeEmbed = new EmbedBuilder()
            .setColor(0xFF69B4) // Pink color (change to your preference)
            .setTitle('✨ Welcome to Jinuu69\'s Server! ✨')
            .setDescription(`Hey <@${interaction.user.id}>! Welcome to **Jinuu69's server**! We're so happy to have you in our growing community! 🎉
            
If you enjoy the streams as much as we do, this is the perfect place to hang out and have fun!`)

            .addFields(
                { 
                    name: '📋 Get Started', 
                    value: 'Read and accept the rules to unlock more channels!',
                    inline: false
                },
                { 
                    name: '📜 Rules', 
                    value: '<#YOUR_RULES_CHANNEL_ID>',
                    inline: true
                },
                { 
                    name: '📱 Follow Jinuu69', 
                    value: '[Twitter](https://twitter.com/jinuu69) | [Twitch](https://twitch.tv/jinuu69) | [YouTube](https://youtube.com/jinuu69)',
                    inline: true
                },
                { 
                    name: '💻 Share Your Setup', 
                    value: '<#YOUR_SETUP_CHANNEL_ID>',
                    inline: true
                },
                { 
                    name: '🍕 Food & Drinks', 
                    value: '<#YOUR_FOOD_CHANNEL_ID>',
                    inline: true
                },
                { 
                    name: '🎬 Funny Clips & Media', 
                    value: '<#YOUR_MEDIA_CHANNEL_ID>',
                    inline: true
                },
                { 
                    name: '🎮 Start Exploring', 
                    value: 'Now you can explore the server on your own! Check out all the channels and join the fun! 🚀',
                    inline: false
                }
            )
            .setThumbnail(interaction.guild.iconURL())
            .setFooter({ text: 'Welcome to the community! 🎉' })
            .setTimestamp();

        // Create buttons for quick actions
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('read_rules')
                    .setLabel('📜 Read Rules')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('follow_socials')
                    .setLabel('📱 Follow Socials')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId('start_exploring')
                    .setLabel('🎮 Start Exploring')
                    .setStyle(ButtonStyle.Secondary)
            );

        // Send to welcome channel
        const welcomeChannel = interaction.guild.channels.cache.find(ch => ch.name === 'welcome');
        
        if (welcomeChannel) {
            await welcomeChannel.send({
                content: `<@${interaction.user.id}>`,
                embeds: [welcomeEmbed],
                components: [row]
            });
            
            await interaction.reply({
                content: `✅ Welcome guide sent to ${welcomeChannel}!`,
                ephemeral: true
            });
        } else {
            await interaction.reply({
                content: `❌ Could not find #welcome channel!`,
                ephemeral: true
            });
        }
    }
};