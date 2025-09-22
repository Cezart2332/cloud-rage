mp.events.addCommand("pos", (player) => {
    const pos = player.position;
    console.log(`X: ${pos.x} Y: ${pos.y} Z: ${pos.z}`);
    player.outputChatBox(`X: ${pos.x} Y: ${pos.y} Z: ${pos.z}`);
})


