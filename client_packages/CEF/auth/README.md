# RAGE:MP Auth CEF UI

A modern Login/Register UI with a transparent background (won’t block GTA V). Blue/dark-cyan theme, subtle animations, password reveal, and strength meter.

## Files
- `index.html` — Main UI document
- `assets/style.css` — Blue/dark-cyan glassmorphism card, subtle transitions, strength meter, reveal buttons
- `assets/ui.js` — Tab switching, validation, strength meter, password reveal, and `mp.trigger` event calls

## Integration (Client-side)
Create the browser in your client-side code and show/hide as needed:

```js
// client_packages/xxx/client.js
let authBrowser = null;

mp.events.add('auth:show', () => {
  if (authBrowser) return;
  authBrowser = mp.browsers.new('package://CEF/auth/index.html');
  mp.gui.cursor.show(true, true);
});

mp.events.add('auth:hide', () => {
  if (!authBrowser) return;
  authBrowser.destroy();
  authBrowser = null;
  mp.gui.cursor.show(false, false);
});

// Optionally switch tab from code
mp.events.add('auth:setTab', (name) => {
  if (authBrowser)
    authBrowser.execute(`AuthUI.setTab('${name}')`);
});

// Receive CEF events and forward to server
mp.events.add('cef:auth:login', (password) => {
  mp.events.callRemote('server:auth:login', password);
});

mp.events.add('cef:auth:register', (email, age, gender, password) => {
  mp.events.callRemote('server:auth:register', email, parseInt(age), gender, password);
});
```

## Events sent from UI to client
- `cef:auth:login` — `(password)`
- `cef:auth:register` — `(email, age, gender, password)`

## Notes
- Background is fully transparent to avoid blocking the GTA V world.
- Blue/dark-cyan theme; adjust colors in `:root` CSS variables.
- Register form includes password with strength meter and confirmation.
- All inputs are labeled and validated client-side; also validate on server.
