const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('timeout')
        .setDescription('Timeout a user for a specified duration')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to timeout')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('duration')
                .setDescription('Duration in minutes (1-40320)')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for the timeout')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

    async execute(interaction) {
        const targetUser = interaction.options.getUser('user');
        const durationMinutes = interaction.options.getInteger('duration');
        const reason = interaction.options.getString('reason') || 'No reason provided';

        if (durationMinutes < 1 || durationMinutes > 40320) {
            return interaction.reply({ content: 'Duration must be between 1 and 40320 minutes (28 days).', ephemeral: true });
        }

        const member = await interaction.guild.members.fetch(targetUser.id);
        
        if (!member.moderatable) {
            return interaction.reply({ content: 'I cannot moderate this user. They may have a higher role than me.', ephemeral: true });
        }

        const durationMs = durationMinutes * 60 * 1000;
        
        await member.timeout(durationMs, reason);

        const embed = new EmbedBuilder()
            .setColor(0xFFA500)
            .setTitle('🔇 User Timed Out')
            .addFields(
                { name: 'User', value: targetUser.tag },
                { name: 'Duration', value: `${durationMinutes} minutes` },
                { name: 'Reason', value: reason },
                { name: 'Moderator', value: interaction.user.tag }
            )
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });

        try {
            await targetUser.send(`🔇 You have been timed out in **${interaction.guild.name}** for ${durationMinutes} minutes. Reason: ${reason}`);
        } catch (dmError) {
            console.log(`Could not DM user ${targetUser.tag}`);
        }
    }
};