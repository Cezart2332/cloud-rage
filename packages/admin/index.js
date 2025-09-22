const { PrismaClient } = require('.prisma/client')

const prisma = new PrismaClient()


mp.events.addCommand("admin", (player) => {
    console.log("Player admin level:", player.data.admin);
    if(!player.data.admin || player.data.admin < 1) {
        player.outputChatBox("{#ff4444}You don't have admin permissions!");
        return;
    }

    let players = [];
    mp.players.forEach(p => {
        if(p.id !== player.id) players.push({ id: p.id, name: p.name });
    });
    player.call("openAdminMenu", [player.data.admin, players]);
})

mp.events.add("kickPlayer", (player, target, reason) => {
    console.log("kickPlayer event received from player:", player.name);
    console.log("Target to kick:", target, "Reason:", reason);
    
    // Convert target to number if it's a string
    const targetId = parseInt(target);
    console.log("Parsed target ID:", targetId);
    
    let targetPlayer = mp.players.at(targetId);
    console.log("Found target player:", targetPlayer ? targetPlayer.name : "NOT FOUND");
    
    if(targetPlayer) {
        targetPlayer.kick(reason || "No reason provided");
        mp.players.broadcast(`{#ff6b6b}Player ${targetPlayer.name} has been kicked by ${player.name}. Reason: ${reason || "No reason provided"}`);
        console.log(`Successfully kicked ${targetPlayer.name}`);
    } else {
        console.log("Target player not found with ID:", targetId);
        player.outputChatBox("{#ff4444}Target player not found!");
    }
});

mp.events.add("setAdmin", async (player, targetId, newLevel) => {
    const targetIdNum = parseInt(targetId);
    const newLevelNum = parseInt(newLevel);
    const targetPlayer = mp.players.at(targetIdNum);

    // Permission checks
    if (!player.data || typeof player.data.admin !== 'number' || player.data.admin < 6) {
        return player.outputChatBox("{#ff4444}You don't have permission to set admin levels!");
    }
    if (!targetPlayer) {
        return player.outputChatBox("{#ff4444}Target player not found!");
    }
    if (isNaN(newLevelNum) || newLevelNum < 0) {
        return player.outputChatBox("{#ff4444}Invalid admin level!");
    }
    if (newLevelNum >= player.data.admin) {
        return player.outputChatBox("{#ff4444}You cannot set an admin level equal to or higher than your own!");
    }
    if (targetPlayer.data && typeof targetPlayer.data.admin === 'number' && targetPlayer.data.admin >= player.data.admin) {
        return player.outputChatBox("{#ff4444}You cannot change the admin level of a player with equal or higher admin level!");
    }

    targetPlayer.data.admin = newLevelNum;
    targetPlayer.outputChatBox(`{#44ff44}Your admin level has been set to ${newLevelNum} by ${player.name}`);
    player.outputChatBox(`{#44ff44}You have set ${targetPlayer.name}'s admin level to ${newLevelNum}`);
    console.log(`${player.name} set ${targetPlayer.name}'s admin level to ${newLevelNum}`);
    try {
        await prisma.user.update({
            where: { name: targetPlayer.name },
            data: { admin: newLevelNum }
        });
    } catch (e) {
        console.log('Failed to persist admin level change:', e.message || e);
    }
});