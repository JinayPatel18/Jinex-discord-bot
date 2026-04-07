const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Ban a user from the server')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to ban')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for the ban')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

    async execute(interaction) {
        const targetUser = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason') || 'No reason provided';

        const member = await interaction.guild.members.fetch(targetUser.id);
        
        if (!member.bannable) {
            return interaction.reply({ content: 'I cannot ban this user. They may have a higher role than me.', ephemeral: true });
        }

        await member.ban({ reason: `${reason} - Banned by ${interaction.user.tag}` });

        const embed = new EmbedBuilder()
            .setColor(0xFF0000)
            .setTitle('🔨 User Banned')
            .addFields(
                { name: 'User', value: targetUser.tag },
                { name: 'Reason', value: reason },
                { name: 'Moderator', value: interaction.user.tag }
            )
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });

        try {
            await targetUser.send(`🔨 You have been banned from **${interaction.guild.name}**. Reason: ${reason}`);
        } catch (dmError) {
            console.log(`Could not DM user ${targetUser.tag}`);
        }
    }
};