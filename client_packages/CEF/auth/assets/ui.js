
  const $ = (sel, el=document) => el.querySelector(sel);
  const $$ = (sel, el=document) => Array.from(el.querySelectorAll(sel));

  const tabs = $$('.tab');
  const forms = $$('.form');
  const message = $('#message');

  function setTab(name){
    tabs.forEach(t => t.classList.toggle('active', t.dataset.tab === name));
    forms.forEach(f => f.classList.toggle('active', f.id === (name + 'Form')));
    message.textContent = '';
    if (name === 'login') {
      // Focus the single login password input regardless of type (password/text)
      const lp = $('#loginForm .input-wrap input');
      if (lp) lp.focus();
    } else {
      const re = $('#regEmail');
      if (re) re.focus();
    }
  }

  tabs.forEach(t => t.addEventListener('click', () => setTab(t.dataset.tab)));

  // Submit handlers -> frontend only (no RAGE:MP calls)
  $('#loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    // Grab value from the login password input regardless of shown type
    const lp = $('#loginForm .input-wrap input');
    const password = (lp && typeof lp.value === 'string' ? lp.value : '').trim();
    if(password.length < 4){ return showError('Parola trebuie să aibă cel puțin 4 caractere.'); }

    // Gather additional fields (even if from the register form) to match event signature
    const ageEl = document.getElementById('regAge');
    const emailEl = document.getElementById('regEmail');
    const age = ageEl ? ageEl.value : '';
    const email = emailEl ? emailEl.value : '';
    const gender = (document.querySelector('input[name="gender"]:checked') || {}).value || 'male';

    // state 1 = login
    try { if (typeof mp !== 'undefined' && mp && mp.trigger) mp.trigger('checkData', 1, password, age, email, gender); } catch(_) {}
    showInfo('Se verifică datele de autentificare...');
  });

  $('#registerForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = $('#regEmail').value.trim();
    const age = parseInt($('#regAge').value, 10);
    // First password input inside register form (exclude confirm #regPassword2), regardless of type
    const regInputs = $$('#registerForm .input-wrap input');
    const rp = regInputs.find(i => i.id !== 'regPassword2') || null;
    const password = rp ? String(rp.value) : '';
    const password2 = $('#regPassword2').value;
    const gender = $('input[name="gender"]:checked')?.value || 'male';

    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return showError('Introdu un email valid.');
    if(!Number.isFinite(age) || age < 13 || age > 120) return showError('Introdu o vârstă validă (13-120).');
    if(password.length < 6) return showError('Parola trebuie să aibă cel puțin 6 caractere.');
    if(password !== password2) return showError('Parolele nu coincid.');

    // state 0 = register
    try { if (typeof mp !== 'undefined' && mp && mp.trigger) mp.trigger('checkData', 0, password, String(age), email, gender); } catch(_) {}
    showInfo('Se trimit datele de înregistrare...');
  });

  function setRegisterErrorBox(text){
    const box = document.getElementById('registerError');
    if(!box) return;
    if(text){
      box.textContent = text;
      box.classList.remove('hidden');
    } else {
      box.textContent = '';
      box.classList.add('hidden');
    }
  }

  function showError(msg){
    const isRegister = $('#registerForm').classList.contains('active');
    if(isRegister) setRegisterErrorBox(msg);
    message.textContent = msg; message.className = 'message error';
  }
  function showInfo(msg){
    setRegisterErrorBox('');
    message.textContent = msg; message.className = 'message';
  }
  function showSuccess(msg){
    setRegisterErrorBox('');
    message.textContent = msg; message.className = 'message success';
  }

  // default to login
  setTab('login');

  // Reveal password buttons
  $$('.reveal-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const wrap = btn.closest('.input-wrap');
      const input = wrap ? wrap.querySelector('input[type="password"], input[type="text"]') : null;
      if(!input) return;
      const showing = input.type === 'password' ? 'text' : 'password';
      input.type = showing;
      btn.classList.toggle('on', input.type === 'text');
      btn.setAttribute('aria-label', input.type === 'text' ? 'Ascunde parola' : 'Arată parola');
    });
  });

  // Strength meter for register password
  const strengthBars = $$('.strength .bar');
  const pwStrengthLabel = document.getElementById('pwStrengthLabel');
  const regPw = (function(){
    // first password field inside register form regardless of type, excluding confirm field
    const inputs = $$('#registerForm .input-wrap input');
    return inputs.find(i => i.id !== 'regPassword2') || null;
  })();
  if (regPw) {
    regPw.addEventListener('input', () => {
      const score = scorePassword(regPw.value);
      strengthBars.forEach((b,i) => b.classList.toggle('active', i < score));
      if (pwStrengthLabel) pwStrengthLabel.textContent = ['Foarte slabă','Slabă','Bună','Puternică','Excelentă'][score] || 'Slabă';
    });
  }

  function scorePassword(pw){
    let s = 0; if(!pw) return s;
    if(pw.length >= 6) s++;
    if(/[A-Z]/.test(pw)) s++;
    if(/[0-9]/.test(pw)) s++;
    if(/[^A-Za-z0-9]/.test(pw)) s++;
    if(pw.length >= 12) s++;
    return Math.min(s, 4);
  }

  // Caps Lock indicators
  function handleCaps(el, indicatorId){
    const ind = document.getElementById(indicatorId);
    if(!el || !ind) return;
    el.addEventListener('keyup', (e) => {
      if(typeof e.getModifierState === 'function'){
        const on = e.getModifierState('CapsLock');
        ind.hidden = !on;
      }
    });
    el.addEventListener('blur', () => ind.hidden = true);
  }

  const loginPwEl = $('#loginForm .input-wrap input');
  handleCaps(loginPwEl, 'capsLogin');
  handleCaps(regPw, 'capsReg1');
  handleCaps(document.getElementById('regPassword2'), 'capsReg2');



