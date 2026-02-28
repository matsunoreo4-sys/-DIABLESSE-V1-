// === groupevents.js ===
const { isJidGroup } = require('@whiskeysockets/baileys');

const defaultProfilePics = [
  'https://i.ibb.co/KhYC4FY/1221bc0bdd2354b42b293317ff2adbcf-icon.png',
  'https://i.ibb.co/KhYC4FY/1221bc0bdd2354b42b293317ff2adbcf-icon.png',
  'https://i.ibb.co/KhYC4FY/1221bc0bdd2354b42b293317ff2adbcf-icon.png',
];

// Newsletter context (for forwarded-style look)
const getContextInfo = (mentionedJids) => ({
  mentionedJid: mentionedJids,
  forwardingScore: 999,
  isForwarded: true,
  forwardedNewsletterMessageInfo: {
    newsletterJid: '120363378786516098@newsletter',
    newsletterName: "ᴅɪᴀʙʟᴇssᴇ  - ",
    serverMessageId: 200,
  },
});

module.exports = async (conn, update) => {
  try {
    const { id, participants, action } = update;
    if (!id || !isJidGroup(id) || !participants) return;

    const groupMetadata = await conn.groupMetadata(id);
    const groupName = groupMetadata.subject || "Group";
    const desc = groupMetadata.desc || "No Description available.";
    const groupMembersCount = groupMetadata.participants?.length || 0;
    const timestamp = new Date().toLocaleString();

    for (const participant of participants) {
      const userName = participant.split("@")[0];

      // Try to fetch profile picture
      let userPpUrl;
      try {
        userPpUrl = await conn.profilePictureUrl(participant, "image");
      } catch {
        userPpUrl = defaultProfilePics[Math.floor(Math.random() * defaultProfilePics.length)];
      }

      // === WELCOME ===
      if (action === "add") {
        const welcomeText = `
╭───✦ 🧃 *ᴡᴇʟᴄᴏᴍᴇ ʜᴏᴍɪᴇ* ✦───
│ 👋 Hey @${userName}!
│ 🏠 Welcome to: *${groupName}*
│ 🔢 Member #: *${groupMembersCount}*
│ 🕒 Joined: *${timestamp}*
│ 
│ 📝 Group Description:
│ ${desc}
│ 
╰✦ ᴘᴏᴡᴇʀᴇᴅ ʙʏ *ᴅɪᴀʙʟᴇssᴇ* ✦─
        `.trim();

        await conn.sendMessage(id, {
          image: { url: userPpUrl },
          caption: welcomeText,
          mentions: [participant],
          contextInfo: getContextInfo([participant]),
        });
      }

      // === GOODBYE ===
      else if (action === "remove") {
        const goodbyeText = `
╭───✦ 🏃 *ɢᴏᴏᴅʙʏᴇ* ✦───
│ 👋 Farewell @${userName}!
│ 🏠 You left: *${groupName}*
│ 🕒 Time: *${timestamp}*
│ 
╰✦ ᴘᴏᴡᴇʀᴇᴅ ʙʏ *ᴅɪᴀʙʟᴇssᴇ* ✦─
        `.trim();

        await conn.sendMessage(id, {
          image: { url: userPpUrl },
          caption: goodbyeText,
          mentions: [participant],
          contextInfo: getContextInfo([participant]),
        });
      }
    }
  } catch (err) {
    console.error("GroupEvents error:", err);
  }
};
