var adminPanel = null;
mp.events.add("openAdminMenu", (adminLevel, players) => { 
    console.log("Client received openAdminMenu:", adminLevel, players);
    
    // Close existing panel if open
    if(adminPanel) {
        adminPanel.destroy();
        adminPanel = null;
    }
    
    adminPanel = mp.browsers.new('package://CEF/admin/index.html'); 
    mp.gui.chat.activate(false);
    mp.gui.cursor.visible = true;   
    
    // Wait longer for CEF to fully load
    setTimeout(() => {
        console.log("Setting data in CEF:", adminLevel, players);
        adminPanel.execute(`hideAdminPanel();`);
        adminPanel.execute(`showAdminPanel(${adminLevel}, ${JSON.stringify(players)});`);
    }, 500);
});

mp.events.add("kickPlayerClient", (target, reason) => {
    console.log("Client received kickPlayerClient with:", target, reason);
    mp.events.callRemote("kickPlayer", target, reason);
})

mp.events.add("closeAdminPanel", () => {
	if(adminPanel) {
        adminPanel.destroy();
        mp.gui.chat.activate(true);
        adminPanel = null;
        mp.gui.cursor.visible = false;   
    }
});