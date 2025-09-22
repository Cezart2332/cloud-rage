var hud


mp.events.add("activateHud", (name, money, level, onlinePlayers) => { 
    hud = mp.browsers.new('package://CEF/Hud/index.html'); 
    hud.execute(`setName('${name}');`);
    hud.execute(`setMoney('${money}');`);
    hud.execute(`setLevel('${level}');`);
    hud.execute(`setOnline('${onlinePlayers}');`);

 })

 mp.events.add("updateHud", (name,money, level, onlinePlayers) => {
    if(hud) {
        hud.execute(`setName('${name}');`);
        hud.execute(`setMoney('${money}');`);
        hud.execute(`setLevel('${level}');`);
        hud.execute(`setOnline('${onlinePlayers}');`);
    }
})

mp.events.add("deactivateHud", () => {
    if(hud) {
        hud.destroy();
        hud = null;
    }
})
