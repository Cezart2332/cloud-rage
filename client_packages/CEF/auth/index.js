//Create browser
var loginBrowser = mp.browsers.new('package://CEF/auth/index.html'); 

//Create camera
let camera = mp.cameras.new("camera", new mp.Vector3(-957.93798828125, -2493.306884765625, 44.44485092163086), new mp.Vector3(-10, 0, 15), 55);
camera.pointAtCoord(-956.0208740234375, -2490.068603515625, 42.049659729003906); //
camera.setActive(true);
mp.gui.chat.activate(false);
mp.game.cam.renderScriptCams(true, false, 0, true, false); 
 
setTimeout(() => {
    
    mp.gui.cursor.visible = true;   

}, 1000);

mp.events.add("checkData", (state, pass, age, email, gender) => {
    // Pass all parameters including email to server
    mp.events.callRemote("loginConnectPlayer", Number(state), String(pass || ''), String(age || ''), String(email || ''), String(gender || 'male'));
})




mp.events.add("updateText", (type, text) =>{
    if(type === 'error') {
       loginBrowser.execute(`showError(${JSON.stringify(text)})`);
    }
    else if(type === 'success') {
        loginBrowser.execute(`showSuccess(${JSON.stringify(text)})`);
    }
    else if(type === 'info') {
        loginBrowser.execute(`showInfo(${JSON.stringify(text)})`);
    }
})



mp.events.add("destroyLoginBrowser", () => { 

    if(loginBrowser)
    {
        //Destroy browser
        loginBrowser.destroy();
        loginBrowser = null;

        mp.gui.cursor.visible = false;   
 
        //Destroy camera 
        if(camera)
        {
            camera.destroy();
            camera = null;
        }
       
        //camera.destroy();
        mp.game.cam.renderScriptCams(false, false, 3000, true, true); 

        mp.gui.chat.activate(true);

        //Hide cursor
        mp.gui.cursor.visible = false;  
 
        mp.players.local.freezePosition(false);   
    } 
});
  