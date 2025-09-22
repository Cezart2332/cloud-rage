
  const el = (id)=>document.getElementById(id);
  const q = (sel)=>document.querySelector(sel);

  function setName(name){ const n=el('hudName'); if(n) n.textContent = String(name||''); }
  function setLevel(level){ const l=el('hudLevel'); if(l) l.textContent = `Lv ${Number(level||0)}`; }
  function setMoney(money){
    const mWrap=el('hudMoney');
    if(mWrap){
      const val = mWrap.querySelector('.val');
      if(val) val.textContent = Number(money||0).toLocaleString('en-US', { maximumFractionDigits: 0 });
      mWrap.classList.remove('pulse'); mWrap.offsetHeight; mWrap.classList.add('pulse');
    }
  }
  function setOnline(count){ const o=el('hudOnline'); if(o){ const v=o.querySelector('.val'); if(v) v.textContent = Number(count||0); } }
  function setVisible(v){ const root=document.getElementById('hud'); if(root) root.style.display = v? 'block':'none'; }
  function setLevelProgress(pct){
    const progress = q('.progress');
    const bar = q('.progress .fill');
    const clamped = Math.max(0, Math.min(100, Number(pct||0)));
    if(bar) bar.style.width = clamped + '%';
    if(progress){ progress.classList.remove('active'); progress.offsetHeight; progress.classList.add('active'); }
  }
  function setXP(pct){ const x=el('hudXP'); if(x){ const c=Math.max(0,Math.min(100,Number(pct||0))); x.textContent = c + '%'; } }
  function setTheme(theme){
    // theme: { accent?, accent2?, money?, fg?, fgDim? }
    const r = document.documentElement;
    if(theme && typeof theme === 'object'){
      if(theme.accent) r.style.setProperty('--accent', theme.accent);
      if(theme.accent2) r.style.setProperty('--accent-2', theme.accent2);
      if(theme.money) r.style.setProperty('--money', theme.money);
      if(theme.fg) r.style.setProperty('--fg', theme.fg);
      if(theme.fgDim) r.style.setProperty('--fg-dim', theme.fgDim);
    }
  }
  function levelUp(){
    // quick flash via shine
    const progress = q('.progress');
    if(progress){ progress.classList.remove('active'); progress.offsetHeight; progress.classList.add('active'); }
  }

  // Digital clock functionality
  function updateClock(){
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const clockEl = el('hudClock');
    if(clockEl) clockEl.textContent = `${hours}:${minutes}:${seconds}`;
  }

  // Update clock immediately and then every second
  updateClock();
  setInterval(updateClock, 1000);

  function formatMoney(v){
    const num = Number(v||0);
    return '$' + num.toLocaleString('en-US', { maximumFractionDigits: 0 });
  }

