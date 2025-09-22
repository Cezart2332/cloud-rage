require('./CEF/auth/index.js');
require('./CEF/Hud/index.js');
require('./noclip')
require('./CEF/admin/index.js')
mp.gui.chat.show(false); //Disables default RageMP Chat
const chat = mp.browsers.new('package://CEF/chat/index.html');
chat.markAsChat();

