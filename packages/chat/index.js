mp.events.add("playerChat", (player, message) => {
    mp.players.broadcast(`${player.name}: ${message}`);
});