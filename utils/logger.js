const { EmbedBuilder } = require('discord.js');

async function logAction(guild, action, target, moderator, reason) {
    const logChannel = guild.channels.cache.find(c => c.name === 'mod-logs');
    if (!logChannel) return;

    const colors = {
        warn: 0xFFA500,
        timeout: 0xFFA500,
        ban: 0xFF0000,
        unban: 0x00FF00,
        kick: 0xFF0000
    };

    const embed = new EmbedBuilder()
        .setColor(colors[action] || 0x0099FF)
        .setTitle(`📋 ${action.toUpperCase()} Action`)
        .addFields(
            { name: 'Target', value: target.tag || target.user?.tag || 'Unknown', inline: true },
            { name: 'Moderator', value: moderator.tag, inline: true },
            { name: 'Reason', value: reason || 'No reason provided' }
        )
        .setTimestamp();

    await logChannel.send({ embeds: [embed] });
}

module.exports = { logAction };