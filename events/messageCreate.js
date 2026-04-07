const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');

// Cooldown tracking for anti-spam
const messageCooldowns = new Map();

// Bad words list (add your own)
const badWords = ['badword1', 'badword2', 'insult']; // Replace with actual words
const badWordPattern = new RegExp(`\\b(${badWords.join('|')})\\b`, 'gi');

module.exports = {
    name: 'messageCreate',
    async execute(message) {
        // Ignore bot messages and DMs
        if (message.author.bot || !message.guild) return;

        // Ignore messages from moderators/admins
        if (message.member.permissions.has(PermissionFlagsBits.ModerateMembers)) return;

        // --- BAD WORD FILTER ---
        if (badWordPattern.test(message.content)) {
            await message.delete();
            
            const warningEmbed = new EmbedBuilder()
                .setColor(0xFF0000)
                .setTitle('⛔ Message Deleted')
                .setDescription(`${message.author}, your message was deleted for containing inappropriate language.`)
                .setTimestamp();
            
            await message.channel.send({ embeds: [warningEmbed] });
            
            // Log to mod logs
            const modLogChannel = message.guild.channels.cache.find(c => c.name === 'mod-logs');
            if (modLogChannel) {
                const logEmbed = new EmbedBuilder()
                    .setColor(0xFF0000)
                    .setTitle('Message Filtered')
                    .addFields(
                        { name: 'User', value: message.author.tag },
                        { name: 'Channel', value: message.channel.name },
                        { name: 'Content', value: message.content.substring(0, 500) }
                    )
                    .setTimestamp();
                modLogChannel.send({ embeds: [logEmbed] });
            }
            return;
        }

        // --- ANTI-SPAM ---
        const userId = message.author.id;
        const now = Date.now();
        
        if (!messageCooldowns.has(userId)) {
            messageCooldowns.set(userId, []);
        }
        
        const userMessages = messageCooldowns.get(userId);
        userMessages.push(now);
        
        // Keep only messages from last 5 seconds
        const recentMessages = userMessages.filter(timestamp => now - timestamp < 5000);
        messageCooldowns.set(userId, recentMessages);
        
        if (recentMessages.length > 5) {
            await message.delete();
            
            const spamEmbed = new EmbedBuilder()
                .setColor(0xFF0000)
                .setTitle('🚫 Spam Detected')
                .setDescription(`${message.author}, please slow down! You are sending messages too quickly.`)
                .setTimestamp();
            
            await message.channel.send({ embeds: [spamEmbed] });
            
            // Timeout for spam
            if (message.member.moderatable) {
                await message.member.timeout(5 * 60 * 1000, 'Spamming');
            }
            
            // Clear cooldown for this user to prevent immediate re-spam
            messageCooldowns.set(userId, []);
        }
    }
};