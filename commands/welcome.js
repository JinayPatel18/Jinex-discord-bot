const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('welcome')
        .setDescription('Send a welcome message to a user')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to welcome')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

    async execute(interaction) {
        const targetUser = interaction.options.getUser('user');
        const member = await interaction.guild.members.fetch(targetUser.id);
        
        const welcomeChannel = interaction.guild.channels.cache.find(ch => ch.name === 'welcome');
        
        if (!welcomeChannel) {
            return interaction.reply({ 
                content: '❌ Could not find #welcome channel!', 
                ephemeral: true 
            });
        }

        const welcomeEmbed = new EmbedBuilder()
            .setColor(0xFF69B4)
            .setTitle(`✨ Welcome ${targetUser.username}! ✨`)
            .setDescription(`Hey ${targetUser}! Welcome to **${interaction.guild.name}**! We're so happy to have you in our growing community! 🎉
            
If you enjoy the streams as much as we do, this is the perfect place to hang out and have fun!`)
            .addFields(
                { name: '📋 Get Started', value: 'Here are some things to get you started:', inline: false },
                { name: '📜 Read the Rules', value: '<#YOUR_RULES_CHANNEL_ID>', inline: true },
                { name: '📱 Follow Jinuu69', value: '[Twitter](https://twitter.com/jinuu69) | [Twitch](https://twitch.tv/jinuu69)', inline: true },
                { name: '💻 Share Your Setup', value: '<#YOUR_SETUP_CHANNEL_ID>', inline: true },
                { name: '🍕 Food & Drinks', value: '<#YOUR_FOOD_CHANNEL_ID>', inline: true },
                { name: '🎬 Media & Clips', value: '<#YOUR_MEDIA_CHANNEL_ID>', inline: true }
            )
            .setThumbnail(interaction.guild.iconURL())
            .setTimestamp();

        await welcomeChannel.send({ 
            content: `${targetUser}`,
            embeds: [welcomeEmbed] 
        });

        await interaction.reply({ 
            content: `✅ Welcome message sent to ${targetUser} in ${welcomeChannel}!`, 
            ephemeral: true 
        });
    }
};