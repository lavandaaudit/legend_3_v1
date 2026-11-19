/* VIKTOR LEGEND 2 — main.js: цикл, керування, взаємодії, панелі, діалоги, HUD */
IB.showScene=(icon,title,text,nonblock)=>{
  const sc={icon,title,text,nonblock:!!nonblock};
  if(IB._sceneOpen){(IB._sceneQueue=IB._sceneQueue||[]).push(sc);return;}
  IB._openScene(sc);
};
IB._openScene=(sc)=>{
  IB._sceneOpen=true;IB._sceneNonblock=!!sc.nonblock;
  IB.$('scene-icon').textContent=sc.icon;
  IB.$('scene-title').textContent=sc.title;
  IB.$('scene-text').textContent=sc.text;
  IB.$('scene').classList.remove('hidden');
  IB.SFX.ui&&IB.SFX.ui();
  /* v2.3: сцени гулянки не заважають ходити і самі закриваються */
  if(IB._sceneNonblock){if(IB._sceneTmr)clearTimeout(IB._sceneTmr);IB._sceneTmr=setTimeout(IB.closeScene,6000);}
};
IB.closeScene=()=>{
  IB._sceneOpen=false;IB._sceneNonblock=false;
  if(IB._sceneTmr){clearTimeout(IB._sceneTmr);IB._sceneTmr=null;}
  IB.$('scene').classList.add('hidden');
  const q=IB._sceneQueue&&IB._sceneQueue.shift();
  if(q)IB._openScene(q);
};

IB.MAIN=(function(){
  let cv,g,last=0,acc=0,hudT=0,autoT=0;
  let mode='boot';
  let menuIdx=0,dlgIdx=0;
  let channel=null; /* рубка дров: {prop,t} */
  const KEY={KeyW:'w',ArrowUp:'up',KeyS:'s',ArrowDown:'down',KeyA:'a',ArrowLeft:'left',KeyD:'d',ArrowRight:'right',
    ShiftLeft:'shift',ShiftRight:'shift',KeyE:'e',KeyM:'m',KeyQ:'q',KeyI:'i',KeyV:'fs',KeyP:'ph',KeyG:'grp',KeyJ:'jrnl',
    KeyT:'t',Tab:'tab',Escape:'esc',Enter:'enter',Space:'space',Digit1:'1',Digit2:'2',Digit3:'3',Digit4:'4',
    KeyF:'f',KeyR:'srch',KeyB:'camp',KeyX:'atk',Digit5:'5',Digit6:'6',Digit7:'7',Digit8:'8',Digit9:'9'};
  const keys={},pressed={};

  window.addEventListener('keydown',ev=>{
    const k=KEY[ev.code];
    if(k){if(!keys[k])pressed[k]=true;keys[k]=true;
      if(['tab','esc','space','enter','e','m','q','1','2','3','4','up','down','left','right'].indexOf(k)>=0)ev.preventDefault();}
    IB.AUDIO.init();
  },{passive:false});
  window.addEventListener('keyup',ev=>{const k=KEY[ev.code];if(k)keys[k]=false;});
  window.addEventListener('blur',()=>{for(const k in keys)keys[k]=false;});
  /* BOOT: старт тапом/кліком (мобільні, вбудовані переглядачі) */
  window.addEventListener('pointerdown',()=>{if(mode==='boot'&&bootReady)toTitle();});

  /* сенсорне керування */
  function bindTouch(){
    const pad=IB.$('dpad');if(!pad)return;
    const knob=IB.$('dpad-knob');
    const btns={a:'e',x:'atk',q:'q',f:'f'};
    document.querySelectorAll('[data-tk]').forEach(el=>{
      const k=btns[el.dataset.tk];
      const toggleMode=k==='shift';
      let lastPointerT=0;
      const on=ev=>{ev.preventDefault();lastPointerT=performance.now();
        if(toggleMode){keys[k]=!keys[k];el.classList.toggle('on',keys[k]);if(keys[k])pressed[k]=true;return;}
        if(!keys[k])pressed[k]=true;keys[k]=true;el.classList.add('on');};
      const off=ev=>{ev.preventDefault();keys[k]=false;el.classList.remove('on');};
      el.addEventListener('touchstart',on,{passive:false});
      el.addEventListener('touchend',off,{passive:false});
      el.addEventListener('touchcancel',off,{passive:false});
      el.addEventListener('mousedown',on);
      el.addEventListener('mouseup',off);
      el.addEventListener('mouseleave',off);
      /* fallback для синтетичних кліків (тест/деякі браузери) */
      el.addEventListener('click',ev=>{
        if(performance.now()-lastPointerT<500)return;
        on(ev);setTimeout(()=>off(ev),90);
      });
    });
    let cx=0,cy=0,pid=null;
    const setKnob=(dx,dy)=>{if(knob)knob.style.transform='translate('+(dx*24)+'px,'+(dy*24)+'px)';};
    const start=ev=>{ev.preventDefault();const t=ev.changedTouches?ev.changedTouches[0]:ev;const r=pad.getBoundingClientRect();
      cx=r.left+r.width/2;cy=r.top+r.height/2;touch.active=true;if(t.identifier!==undefined)pid=t.identifier;pad.classList.add('on');};
    const move=ev=>{
      if(!touch.active)return;ev.preventDefault();
      let t=null;
      if(ev.changedTouches){for(const tt of ev.changedTouches)if(tt.identifier===pid)t=tt;if(!t)return;}
      else t=ev;
      let dx=(t.clientX-cx)/38,dy=(t.clientY-cy)/38;
      const l=IB.M.hypot(dx,dy);if(l>1){dx/=l;dy/=l;}
      touch.x=dx;touch.y=dy;
      keys.w=dy<-0.3;keys.up=keys.w;keys.s=dy>0.3;keys.down=keys.s;
      keys.a=dx<-0.3;keys.left=keys.a;keys.d=dx>0.3;keys.right=keys.d;
      setKnob(dx,dy);
    };
    const end=ev=>{ev.preventDefault();touch.active=false;touch.x=touch.y=0;pid=null;
      keys.w=keys.s=keys.a=keys.d=keys.up=keys.down=keys.left=keys.right=false;setKnob(0,0);pad.classList.remove('on');};
    pad.addEventListener('touchstart',start,{passive:false});
    pad.addEventListener('touchmove',move,{passive:false});
    pad.addEventListener('touchend',end,{passive:false});
    pad.addEventListener('touchcancel',end,{passive:false});
    pad.addEventListener('mousedown',start);
    window.addEventListener('mousemove',ev=>{if(touch.active&&pid===null)move(ev);});
    window.addEventListener('mouseup',ev=>{if(touch.active&&pid===null)end(ev);});
  }
  const touch={x:0,y:0,active:false};
  function moveVec(){
    let x=0,y=0;
    if(keys.a||keys.left)x-=1;if(keys.d||keys.right)x+=1;
    if(keys.w||keys.up)y-=1;if(keys.s||keys.down)y+=1;
    if(touch.active){x+=touch.x;y+=touch.y;}
    const l=IB.M.hypot(x,y);if(l>1){x/=l;y/=l;}
    return {x,y};
  }
  function consume(k){if(pressed[k]){pressed[k]=false;return true;}return false;}
  function clearP(){for(const k in pressed)pressed[k]=false;}

  /* ---------- BOOT ---------- */
  function bootSeq(){
    const b=IB.$('boot');
    /* i3-main-patch */
    const lines=['IBONARIUM MODEL IK-1601','16-BIT OK','RAM 128K OK','КАРТРИДЖ: LEGEND 3 «МОРЕ МОРЕ»','БАЗА • АДРЕСИ • СМС-ПОПАПИ • v24.0','','ГЕНЕРАЦІЯ: КЕРУВАННЯ І ПОРАДИ У ЗАСТАВЦІ • ТЕЛЕФОН І КАРТА ПО СЕРЕДИНІ...'];
    b.innerHTML=lines.map(l=>'<div class="bline '+(l.includes('КАРТРИДЖ')?'gold':(l?'':'dim'))+'">'+l+'</div>').join('')+'<div class="bline dim blink">███</div>';
    setTimeout(()=>{
      try{IB.genWorld();}catch(e){console.error(e);b.innerHTML+='<div class="bline" style="color:red">ПОМИЛКА ГЕНЕРАЦІЇ: '+e.message+'</div>';return;}
      const fin=()=>{b.innerHTML+='<div class="bline gold">✓ ГОТОВО — ЖМИ БУДЬ-ЯКУ КЛАВІШУ</div>';bootReady=true;
        /* v11: калібрування прив'язки авто до дороги (прозорі відступи спрайтів) */
        if(IB.computeCarPads){try{IB.computeCarPads();}catch(e){}}
      };
      /* v1.3: чекаємо декодування активів першої частини (макс 2.5с) */
      if(IB.IMG_READY)IB.IMG_READY.then(fin,fin);else fin();
    },700);
  }
  let bootReady=false;
  function toTitle(){
    mode='title';
    IB.$('boot').classList.add('hidden');
    IB.$('title').classList.remove('hidden');
    drawLogo();
    const items=[];
    /* v18 М6: ТРИ СЛОТИ ЗБЕРЕЖЕНЬ — слот вибирається на заставці */
    for(let si=0;si<3;si++){
      const inf=IB.saveInfo(si);
      const lbl=inf?('СЛОТ '+(si+1)+': ПРОДОВЖИТИ — ДЕНЬ '+inf.day+' • ₴'+IB.M.round(inf.money))
                   :('СЛОТ '+(si+1)+': НОВА ВІДПУСТКА');
      items.push({t:lbl,f:()=>{
        IB.G.slot=si;
        IB.genWorld();
        if(!IB.loadGame(si))newGame();
        startGame();
      }});
    }
    items.push({t:'НОВА ВІДПУСТКА (АКТИВНИЙ СЛОТ '+((IB.G.slot||0)+1)+')',f:()=>{newGame();startGame();}});
    /* v13: стартова сторінка як у частини 1 — КЕРУВАННЯ повним описом */
    items.push({t:'КЕРУВАННЯ',f:()=>{IB.openControls();}});
    items.push({t:'ПРО ГРУ ТА АСЕТИ',f:()=>{IB.openAboutPanel();}});
    buildMenu(items);
  }
  function buildMenu(items){
    const m=IB.$('menu');
    m.innerHTML='';
    items.forEach((it,i)=>{
      const d=document.createElement('div');
      d.className='mi'+(i===menuIdx?' sel':'');
      d.textContent=it.t;
      d.onclick=()=>{menuIdx=i;IB.SFX.ui();it.f();};
      m.appendChild(d);
    });
    IB._menuItems=items;
  }
  function drawLogo(){
    const c=IB.$('logo'),lg=c.getContext('2d');
    lg.imageSmoothingEnabled=false;
    /* v27: НАЗВА ГРИ — «LEGEND 3 «МОРЕ МОРЕ»» (гравець: «назва LEGEND 3
       «МОРЕ МОРЕ» на стартовій заставці і всюди міняй назву»); шрифти
       малі, темні плашки — видно на будь-якому екрані і будь-якому фоні */
    lg.fillStyle='#0a1420';lg.fillRect(0,0,320,150);
    lg.fillStyle='#2a4a6a';lg.fillRect(0,0,320,64);
    lg.fillStyle='rgba(240,152,92,0.55)';lg.fillRect(0,48,320,16);
    lg.fillStyle='rgba(248,232,160,0.35)';lg.beginPath();lg.arc(228,30,22,0,7);lg.fill();
    lg.fillStyle='#f8e8a0';lg.beginPath();lg.arc(228,30,15,0,7);lg.fill();
    lg.strokeStyle='#f0f2f4';lg.lineWidth=1;
    const gull=(gx,gy,s)=>{lg.beginPath();lg.arc(gx-s,gy,s,3.4,6.0);lg.stroke();lg.beginPath();lg.arc(gx+s,gy,s,3.4,6.0);lg.stroke();};
    gull(52,26,4);gull(84,38,3);gull(122,22,3);gull(268,52,3);gull(292,34,3);
    const towers=[[4,58,20,34],[28,66,16,26],[48,54,22,40],[74,62,14,28],[92,58,18,34],[114,68,16,24],[236,60,18,32],[258,54,22,40],[284,64,16,28],[304,58,14,30]];
    for(const t of towers){
      const tx2=t[0],ty2=t[1],tw2=t[2],th2=t[3];
      lg.fillStyle='#5a6a7e';lg.fillRect(tx2,ty2,tw2,th2);
      lg.fillStyle='#8a8274';lg.fillRect(tx2,ty2-1,tw2,1);
      const rnd2=((tx2*13+th2)%97)/97;
      for(let r=0;r<Math.floor(th2/7);r++)for(let cI=0;cI<Math.floor(tw2/6);cI++){
        const lit=((r*7+cI*3+tx2)%97)/97<0.4;
        lg.fillStyle=lit?'#f0c060':'#3a4a5c';
        lg.fillRect(tx2+2+cI*6,ty2+3+r*7,3,4);
      }
      if(rnd2>0.5){lg.fillStyle='#6e6862';lg.fillRect(tx2+Math.floor(tw2/2),ty2-6,1,6);}
    }
    lg.fillStyle='#1e5464';lg.fillRect(0,92,320,26);
    lg.fillStyle='#2a6a78';lg.fillRect(0,92,320,8);
    for(let i=0;i<10;i++){
      lg.fillStyle='rgba(238,247,248,0.5)';
      lg.fillRect(14+i*30+(i%2)*10,98+(i%3)*7,14,2);
    }
    lg.fillStyle='#d4c088';lg.fillRect(0,118,320,32);
    lg.fillStyle='#c8b078';for(let i=0;i<30;i++)lg.fillRect((i*53)%318,122+(i*17)%22,2,1);
    lg.fillStyle='#e05a5a';lg.beginPath();lg.arc(58,116,9,3.14,0);lg.fill();
    lg.fillStyle='#d8d0c0';lg.fillRect(57,116,2,10);
    lg.fillStyle='#3aa0e0';lg.beginPath();lg.arc(86,118,8,3.14,0);lg.fill();
    lg.fillStyle='#d8d0c0';lg.fillRect(85,118,2,10);
    lg.fillStyle='#8a6a48';lg.fillRect(258,102,3,16);
    lg.fillStyle='#4e9440';
    for(const f of [[-9,-6],[9,-6],[0,-10],[-6,-2],[6,-2]])lg.fillRect(259+f[0],100+f[1],7,3);
    /* v27: ТЕКСТ НАЗВИ — «LEGEND 3 «МОРЕ МОРЕ»» малим шрифтом на темній плашці */
    const band=(y,h,a)=>{lg.fillStyle='rgba(5,10,18,'+a+')';lg.fillRect(0,y,320,h);};
    band(3,33,0.74);
    lg.font='8px monospace';lg.fillStyle='#f0d050';lg.textAlign='center';
    lg.fillText('L E G E N D   3',160,13);
    lg.font='14px monospace';lg.fillStyle='#7ce0e8';
    lg.fillText('М О Р Е   М О Р Е',160,30);
    band(31,12,0.62);
    lg.font='7px monospace';lg.fillStyle='#f0d050';
    lg.fillText('ВІДПУСТКА НА ЧОРНОМОРСЬКУ',160,40);
    band(92,12,0.58);
    lg.font='7px monospace';lg.fillStyle='#d8e2d6';
    lg.fillText('ЛЕГЕНДА • TOXIC • PABLO • DIIN • ROCK',160,101);
    band(132,12,0.58);
    lg.fillStyle='#9aa88e';
    lg.fillText('ЧОРНОМОРСЬК • ОДЕСА 25 КМ • ЧАЙКИ • СОНЦЕ І МОРЕ',160,141);
    lg.textAlign='left';
  }
  function newGame(){
    IB.genWorld();
    const sp=IB.W.SPAWNS[IB.ri(0,IB.W.SPAWNS.length-1)];
    IB.spawnTeam(sp.x,sp.y);
    IB.spawnVillagers();IB.spawnAnimals();IB.spawnFishes();IB.spawnGangs();
    IB.E.team.forEach(h=>{if(!IB.walkable(h.x,h.y)){const q=IB.snapToReach(IB.M.round(h.x),IB.M.round(h.y));
      h.x=q.x;h.y=q.y;h.tx=q.x;h.ty=q.y;h.target=null;}});
    IB.G.mode='game';IB.G.t=6;IB.G.day=1;
    IB.G.money=100000;IB.G.home=null;IB.G.tan=0;
    IB.G.quests={done:[],active:'q1',side:{}};
    IB.G.flags={};IB.G.album=[];IB.G.stamps={};IB.G.arts=[];
    /* v18: нове літо — чисті стани нових систем */
    IB.G.romance={};IB.G.rivals=null;IB.G.marek=null;
    IB.G.chips={e:1,p:1,q:1};IB.G._dateGirls=[];IB.G._actSeen=1;
    IB.G.jtab='quests';IB.G.mapLy={tasks:1,people:1,city:1};
    IB.G.stats={fish:0,wood:0,berries:0,parties:0,arts:0,gulyankaStories:0,trips:0,photos:0,
      football:0,volley:0,trash:0,gym:0,mail:0,wheel:0,carousel:0,tramp:0,surf:0,autodrom:0,train:0,limanFish:0,
      poker:0,darts:0,pingpong:0,bball:0,
      gullFeed:0,fightWin:0,second:0,walks:0};  /* v3.0 */
    IB.G.spawn={x:sp.x,y:sp.y};
    /* v5.0 «МІСТО-ТЕЛЕФОН»: кишені, квартири, маршрутка, чати, квести */
    IB.PHONE.chats={};IB.PHONE.unread=0;
    IB.initPockets&&IB.initPockets();
    IB.G.homes=[];IB.G.side={};IB.G.solo={active:false};
    IB.spawnMarsh&&IB.spawnMarsh();
    IB.ensureChat&&IB.ensureChat('team');
    IB.sms&&IB.sms('team','П\'ЯТЕРКА','Ми в місті! Пишіть СМС (P або кнопка 📱 справа вгорі): зустрічі, таксі, маршрутка, квартири, квести.');
    IB.sms&&IB.sms('taxi','ТАКСІ «ЧОРНОМОРЕЦЬ»','Вітаємо! Виклик — вкладка ТАКСІ. Поїздки по всьому Чорноморську.');
    IB.sms&&IB.sms('vera','Віра (ріелтор)','Офіс «БІЛЯ МОРЕ» — просп. Миру, центр. Виклич ТАКСІ (додаток ТАКСІ — пункт «РІЕЛТОР») і воно довезе. Квартири: оренда НА МІСЯЦЬ або купівля;)');
    IB.journalAdd('🚐','Трилогія, частина 3. З Києва — НА МОРЕ! Група приїхала в ЧОРНОМОРСЬК о 6-й ранковій.');
    IB.journalAdd('🛏','Гаманець: ₴100 000 на всю відпустку. План: дійти до ПЛЯЖУ, знайти ріелтора і оселитися.');
    IB.banner('ЧОРНОМОРСЬК. 6 РАНКУ. ЛІТО.');
    IB.toast('Спавн: '+sp.name+' • P/📱 — ТЕЛЕФОН (СМС, таксі, житло, квести) • E — дія • TAB — карта','gold');
  }
  function startGame(){
    setTimeout(()=>{if(IB.chipShow&&mode==='game')IB.chipShow();},1200); /* v18 М7: чіпи першого дня */
    IB.$('title').classList.add('hidden');
    IB.$('hud').classList.remove('hidden');
    mode='game';
    IB.MUSIC.day();
    IB.bindPhoneUI&&IB.bindPhoneUI();
    /* v11.0 «КОМПАКТНО СТАРТ»: телефон — ЗГОРНУТОЮ пігулкою ☎ справа, карта-вікно — ЗАКРИТЕ.
       Обидва — СПЛИВАЮЧІ ВІКНА: тапни ☎/🧭 зліва — відкриються поверх міста. */
    IB.phoneShow&&IB.phoneShow(true);
    IB.closePhone&&IB.closePhone();
    const mpn=IB.$('map-panel'); if(mpn)mpn.classList.add('hidden');
    IB.initHomes&&IB.initHomes();
    drawFaceOnce();
    /* v10.0: поповер героя шапки — ІНФО І ВИБІР на іконках */
    if(!IB.$('hero-pop')){
      const hp=document.createElement('div');
      hp.id='hero-pop';hp.classList.add('hidden');
      const hud=IB.$('hud');if(hud)hud.appendChild(hp);
    }
    IB.toast('Завдання: '+IB.questT(),'gold');
  }

  /* ---------- HUD ---------- */
  function drawFaceOnce(){
    /* v8.0: обличчя всіх героїв — маленькі іконки в шапці зліва */
    for(let i=0;i<IB.E.team.length&&i<5;i++){
      const fc=IB.$('hf-'+i);
      if(fc&&IB.E.team[i].look)IB.drawFace(fc.getContext('2d'),IB.E.team[i].look,16);
    }
  }
  /* v8.0: компактне «₴20К» для іконок у шапці */
  IB.fmtMoney=(n)=>{n=IB.M.round(+n||0);
    if(n>=1000)return '₴'+(n>=100000?String(IB.M.round(n/1000)):(n/1000).toFixed(1).replace('.0',''))+'К';
    return '₴'+n;};
  /* v10.0: ІНФО І ВИБІР НА ІКОНКАХ ГЕРОЇВ — поповер шапки (частина інфи і
     вибору перенесена З телефона: повна довідка + «ГРАТИ ЗА НЬОГО»/СКІЛИ/СМС) */
  const GANG_NAMES={port:'«ПОРТОВІ»',bronx:'«БРОНКОВІ»',vv13:'«ВВ13»'};
  const SK_NAMES={str:'СИЛА',vit:'ВИТРИВАЛІСТЬ',charm:'ШАРМ',tech:'ТЕХНІКА',inst:'ІНСТИНКТ',luck:'УДАЧА'};
  IB.heroPop=(i)=>{
    const pop=IB.$('hero-pop');
    const h=IB.E.team[i];
    if(!pop||!h)return;
    if(!pop.classList.contains('hidden')&&pop.dataset.h===String(i)){pop.classList.add('hidden');return;}
    IB.initSkills&&IB.initSkills(h);
    let topK='str',topLv=0;
    for(const k in (h.skills||{})){const lv=IB.skillLv?IB.skillLv(h,k):0;if(lv>topLv){topLv=lv;topK=k;}}
    const esc2=(s)=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;');
    pop.dataset.h=String(i);
    pop.innerHTML=
      '<div class="hp-head"><canvas id="hp-face" width="20" height="20"></canvas><div class="hp-id"><b style="color:'+(h.def.nameColor||'#f0d050')+'">'+esc2(h.name)+'</b><i>'+esc2(h.def.talent||'')+(i===0?' • ЛІДЕР':'')+'</i></div><button id="hp-x" title="Закрити">✖</button></div>'+
      '<div class="hp-stats">СИЛИ '+IB.M.round(h.hp)+'% • ЇЖА '+IB.M.round(h.food)+'% • ВОДА '+IB.M.round(h.water)+'% • НАСТРІЙ '+IB.M.round(h.mood)+'%</div>'+
      '<div class="hp-row">💰 кишеня: ₴'+(h.pocket||0)+(h.gang?' • ⚔ '+GANG_NAMES[h.gang]:'')+'</div>'+
      '<div class="hp-row">🏆 репутація: '+(h.rep||0)+' — '+(IB.repLvl?IB.repLvl(h.rep||0):'')+'</div>'+
      '<div class="hp-row">💪 '+SK_NAMES[topK]+' '+(topLv||0)+' ур. • очок: '+(h.skillPts||0)+'</div>'+
      '<div class="hp-row">🏠 '+(h.flat?esc2(h.flat):'квартири ще нема')+'</div>'+
      '<div class="hp-btns">'+
        (i>0?'<button class="phq" id="hp-lead">👑 ГРАТИ ЗА НЬОГО</button>':'<span class="hp-cur">граєш за нього</span>')+
        '<button class="phq" id="hp-sk">💪 СКІЛИ</button>'+
        '<button class="phq" id="hp-sms">✉ СМС</button>'+
      '</div>';
    pop.classList.remove('hidden');
    const fc=IB.$('hp-face');
    if(fc&&h.look)IB.drawFace(fc.getContext('2d'),h.look,20);
    const x=IB.$('hp-x');if(x)x.onclick=()=>pop.classList.add('hidden');
    const ld=IB.$('hp-lead');
    if(ld)ld.onclick=()=>{
      IB.E.team.forEach(t2=>{t2.task=t2===h?'leader':'follow';t2.field=null;});
      const old=IB.E.team[0];IB.E.team[i]=old;IB.E.team[0]=h;
      IB.G.gmode='all';IB.G.solo={active:false};
      IB.soloMode&&IB.soloMode(false);
      IB.toast('👑 Тепер граєш за '+h.name+' («'+h.def.talent+'»)','gold');
      IB.journalAdd&&IB.journalAdd('👑','Граємо за '+h.name+'.');
      pop.classList.add('hidden');drawFaceOnce();
    };
    const sk=IB.$('hp-sk');
    if(sk)sk.onclick=()=>{if(IB.PHONE)IB.PHONE._skHero=h.id;IB.openPhoneApp&&IB.openPhoneApp('skills');pop.classList.add('hidden');};
    const sm=IB.$('hp-sms');
    if(sm)sm.onclick=()=>{if(IB.PHONE)IB.PHONE.chat=h.id;IB.ensureChat&&IB.ensureChat(h.id);IB.openPhoneApp&&IB.openPhoneApp('sms');pop.classList.add('hidden');};
  };
  function updateHUD(){
    const L=IB.E.team[0];
    /* v8.0: УСІ ПОКАЗНИКИ ГЕРОЇВ — ШАПКА ЗЛІВА, маленькі іконки (5 чіпів) */
    for(let i=0;i<IB.E.team.length&&i<5;i++){
      const h=IB.E.team[i];
      const set=(id,v)=>{const el=IB.$('hb-'+i+'-'+id);
        if(el)el.style.setProperty('--v',IB.M.max(0,IB.M.min(100,v))+'%');};
      set('hp',h.hp);set('hu',h.food);set('wa',h.water);set('mo',h.mood);
      const pk=IB.$('hp-'+i);
      if(pk)pk.textContent=IB.fmtMoney(h.pocket!==undefined?h.pocket:(IB.HERO_DEFS[i]||{}).pocket||0)+(h.gang?' ⚔':'');
      const ch=document.getElementById('hchip-'+i);
      if(ch){
        const bad=h.food<20||h.water<20||h.frozen;
        ch.classList.toggle('bad',!!bad);
        ch.title=h.name+(i===0?' — ЛІДЕР':'')+' • СИЛИ '+IB.M.round(h.hp)+'% • ЇЖА '+IB.M.round(h.food)+'% • ВОДА '+IB.M.round(h.water)+'% • НАСТРІЙ '+IB.M.round(h.mood)+'% • кишеня ₴'+(h.pocket!==undefined?h.pocket:20000)+' • репутація '+(h.rep||0)+(h.gang?' • банда '+h.gang.toUpperCase():'')+' • клік — ІНФО І ВИБІР';
      }
    }
    const md=IB.$('hud-mode');
    if(md){md.textContent=IB.G.gmode==='one'?'🌞':'👥';
      md.title=IB.G.gmode==='one'?'Режим: ЗА ОДНОГО (решта живе своє життя)':'Режим: ЗА ВСІХ (пʼятірка разом)';}
    IB.$('hud-clock').textContent=IB.clockStr();
    /* v19.0: чип ФАЗИ ДОБИ поруч з годинником (іконка + назва у тултіпі) */
    {
      const phE=IB.$('hud-phase');
      if(phE&&IB.dayPhase){const ph=IB.dayPhase();phE.textContent=ph.icon;phE.title='Фаза доби: '+ph.name+' • '+IB.clockStr();}
    }
    IB.$('hud-day').firstChild.textContent='ДЕНЬ '+IB.G.day+' ';
    const wx=IB.WX.cur();
    const wxe=IB.$('hud-wx');
    wxe.textContent=wx.label;
    wxe.className='wxs '+wx.cls;
    IB.$('hud-money').textContent='₴'+IB.G.money;
    IB.$('hud-mtitle').textContent=IB.questT();
    IB.$('hud-mob').textContent=IB.W.zoneAt(L.x,L.y);
    if(IB.G.party.active)IB.alertBox('🔥 ГУЛЯНКА '+IB.G.party.t.toFixed(1)+'/8 — '+IB.PARTY_PHASES[IB.M.min(IB.G.party.hour,7)].n,'al-fun');
    else if(IB.G.trip.active)IB.alertBox('✦ ТРІП: '+IB.G.trip.t.toFixed(1)+' / 6 ГОД','al-fun');
    else if(IB.G.dateAway&&IB.G.dateAway.length)IB.alertBox('💃 НА ГУЛЯНЦІ: '+IB.G.dateAway.map(d=>d.hid.toUpperCase()+' + '+d.girl+' (до '+IB.clockStr(d.endT)+')').join(' • '),'al-fun');
    else if(IB.G.search)IB.alertBox('🔊 ГУКАЄМО: '+IB.G.search.lost.join(', ')+' — біжать на голоси','al-warn');
    else if(IB.G.hangover>0)IB.alertBox('😵 ПОХМІЛЛЯ (до 12:00) — вода/їжа/розсіл','al-warn');
    else if(IB.G.frozenMate)IB.alertBox('❄ '+IB.G.frozenMate.name+' ЗАМЕРЗАЄ — СИНІЙ МАРКЕР!','al-red');
    else if(IB.G.wx.type==='storm')IB.alertBox('🌊 ШТОРМ! У МОРЕ НЕ ЛІЗТИ','al-red');
    else if(IB.G.wx.type==='thunder')IB.alertBox('⛈ ГРОЗА — СХОВАЙСЯ ПІД ДАХ','al-red');
    else if(IB.G.wx.type==='heat')IB.alertBox('🥵 СПЕКА — ВОДА/КРЕМ/ТІНЬ','al-warn');
    else IB.alertBox('');
    /* v17.0: мінімапи НІМАЄ (прибрана з HUD — є кнопка 🧭 КАРТА) */
    /* v11: годинник/батарея телефона тікають (phoneTickUI раніше не викликався) */
    IB.phoneTickUI&&IB.phoneTickUI();
    /* v8.0: 🗺 КАРТА-ПАНЕЛЬ ПРАВОРУЧ (зверху, над телефоном) — тік 0.5 с */
    if(!updateHUD.mpT||performance.now()-updateHUD.mpT>500){
      updateHUD.mpT=performance.now();
      const mc=IB.$('mp-canvas');
      if(mc&&IB.drawGpsAny)IB.drawGpsAny(mc);
      const mz=IB.$('mp-zone');
      if(mz)mz.textContent=IB.W.zoneAt(L.x,L.y);
    }
  }
  /* (v8.0: велика панель heroes справа ПРИБРАНА — усі показники в шапці зліва) */

  /* ---------- РУХ ЛІДЕРА ---------- */
  function updateLeader(dt){
    const L=IB.E.team[0];
    /* v2.3: під час гулянки МОЖНА ХОДИТИ (тріп і сцен-картки чіпляють, як і було) */
    if(IB.G.trip.active||(IB._sceneOpen&&!IB._sceneNonblock)||mode!=='game'){L.fr=0;return;}
    /* v17.0: сонячний удар — лідер ЛЕЖИТЬ у тіні (коротке дійство) до відходу */
    if(L.lying>0){L.fr=0;return;}
    /* v6.0: GPS-маршрут із телефона — веде лідера вулицями */
    if(IB.G.nav){
      const nav=IB.G.nav;
      const done=IB.walkField(L,nav.field,dt,IB.heroSpeed(L)*0.95);
      if(done||IB.dist(L.x,L.y,nav.x,nav.y)<2.2){
        IB.G.nav=null;
        IB.toast('🗺 Прибув: '+(nav.name||'точка'),'gold');
        IB.sms('team','GPS','Ти на місці: '+(nav.name||'точка'));
      }
      if(keys.a||keys.d||keys.w||keys.s)IB.G.nav=null;  /* ручне керування перебиває */
      else return;
    }
    const mv=moveVec();
    L.running=!!keys.shift;
    const spd=IB.heroSpeed(L)*(mv.x||mv.y?1:0);
    if(channel){channel.t+=dt;promptChannel();
      if(channel.t>=channel.dur){finishChannel();}
      if(mv.x||mv.y){channel=null;}
      return;
    }
    /* v18: АВТО-ВИХІД З МОРЯ (E → 🏊 ВИЙТИ З МОРЯ) — герой сам пливе
       до найближчого берега, поки гравець не керує */
    if(IB._swimExit&&L.swim){
      const dxe=IB._swimExit.x-L.x,dye=IB._swimExit.y-L.y,dde=IB.M.hypot(dxe,dye);
      const stp=1.9*dt;
      /* v18-фікс: СКАСУВАННЯ ТІЛЬКИ НА СУХОДОЛІ — якщо курс «з'їли» дробові
         координати у воді, рухаємо на північ (берег завжди на півночі від моря) */
      if(dde<0.7){L.y-=stp;}
      else{L.x+=dxe/dde*stp;L.y+=dye/dde*stp;}
      const tNow=IB.W.at(L.x,L.y);
      if(tNow!==0&&tNow!==16){
        L.swim=false;L.wetT=25;IB._swimExit=null;
        IB.toast('ВИЙШЛИ З МОРЯ 🌊 — мокрі, але щасливі','gold');IB.SFX.splash();
      }else L.dir=dye<0?'u':(IB.M.abs(dxe)>IB.M.abs(dye)?(dxe>0?'r':'l'):'d');
      mv.x=0;mv.y=0;
    }
    if(mv.x||mv.y){
      const nx=L.x+mv.x*spd*dt, ny=L.y+mv.y*spd*dt;
      const hereT=IB.W.at(L.x,L.y);
      const nextT=IB.W.at(nx,ny);
      const inWater=nextT===0||nextT===16;   /* v2.0: лиман теж вода */
      const curH=IB.W.elevAt(L.x,L.y);
      let ok=true;
      /* v18: плавець, що пливе ДО берега, витягується на будь-який берег
         навіть крізь лежак/парасолку (фікс «з моря вийти не можу») */
      const wantOut=L.swim&&(nextT===1||nextT===13||nextT===12||nextT===14||nextT===10);
      if(!inWater){
        const dh=IB.W.elevAt(nx,ny)-curH;
        if(IB.M.abs(dh)>1.01&&!wantOut)ok=false;
        if(!IB.walkable(nx,ny)&&!wantOut)ok=false;
      }else{
        /* i3: шторм блокує тільки ВХІД у море — хто вже плаває, вільно виходить */
        if((IB.G.wx.type==='storm'||IB.G.wx.type==='thunder')&&!L.swim){
          ok=false;
          if(!L._stormT||performance.now()-L._stormT>4000){L._stormT=performance.now();
            IB.toast('ШТОРМ! У таке море не лізуть — рятівник свистить','red');IB.SFX.alert();}
        }
      }
      /* окремі осі */
      if(ok){L.x=nx;L.y=ny;}
      else{
        let slid=false;
        if(!inWater&&IB.walkable(nx,L.y)&&IB.M.abs(IB.W.elevAt(nx,L.y)-curH)<=1.01){L.x=nx;slid=true;}
        else if(!inWater&&IB.walkable(L.x,ny)&&IB.M.abs(IB.W.elevAt(L.x,ny)-curH)<=1.01){L.y=ny;slid=true;}
        /* v18: У ВОДІ рух і ковзання РОБЛЯТЬ (раніше слайдинг у воді був
           вимкнений — пропси біля берега тримали плавця «пасткою») */
        else if(inWater&&wantOut){L.x=nx;L.y=ny;slid=true;}
        else if(inWater){
          const nxT=IB.W.at(nx,L.y),nyT=IB.W.at(L.x,ny);
          if(nxT===0||nxT===16){L.x=nx;slid=true;}
          else if(nyT===0||nyT===16){L.y=ny;slid=true;}
          else {L.x=nx;L.y=ny;slid=true;}
        }
        /* v2.2: ковзання по перешкоді — 6 напрямків навколо курсу (вихід із хащів) */
        if(!slid&&(mv.x||mv.y)){
          const base=IB.M.atan2(mv.y,mv.x),st=IB.M.hypot(mv.x,mv.y)*spd*dt;
          for(const off of [0.5,-0.5,1.0,-1.0,1.6,-1.6]){
            const ex=L.x+IB.M.cos(base+off)*st,ey=L.y+IB.M.sin(base+off)*st;
            const exT=IB.W.at(ex,ey);
            if(inWater&&(exT===0||exT===16||exT===1||exT===13)){L.x=ex;L.y=ey;slid=true;break;}
            if(!inWater&&IB.walkable(ex,ey)&&IB.M.abs(IB.W.elevAt(ex,ey)-curH)<=1.01){L.x=ex;L.y=ey;slid=true;break;}
          }
        }
      }
      if(ok&&inWater&&!L.swim){L.swim=true;IB.SFX.splash();
        if(nextT===16){IB.toast('Ти в ЛИМАНІ! Вода каламутна, але тепла і своя','fun');IB.G.flags.limanSwim=true;IB.questCheck();}
        else IB.toast('Ти в МОРІ! Солона вода — освіжає','fun');
        if(nextT!==16&&!IB.G.flags.swum){IB.G.flags.swum=true;IB.questCheck();}}
      if(ok&&!inWater&&L.swim){L.swim=false;L.wetT=25;IB.toast('Ноги дістали дна — вийшли з моря 🌊','');}
      if(ok&&inWater){
        L.mood=IB.clamp(L.mood+dt*0.6,0,100);
        if(IB.hStr()>=12&&IB.hStr()<17&&(IB.G.wx.type==='sun'||IB.G.wx.type==='heat')&&IB.nightFactor()<0.2){
          L.mood=IB.clamp(L.mood+dt*1.2,0,100);
          if(IB.M.random()<dt*0.15)IB.floatMsg(L.x,L.y,'🌊');
        }
      }
      if(mv.y>0)L.dir='d';else if(mv.y<0)L.dir='u';
      else if(mv.x>0)L.dir='r';else if(mv.x<0)L.dir='l';
      L.frT+=dt*(L.running?10:7);L.fr=1+((L.frT|0)%2);
      if(IB.M.random()<dt*2&&L.running)IB.SFX.step();
    }else{L.fr=0;L.frT=0;}
    /* персонажі не виходять за карту */
    L.x=IB.clamp(L.x,1,IB.W.W-2);L.y=IB.clamp(L.y,1,IB.W.H-2);
  }

  /* ---------- ВЗАЄМОДІЇ (E) ---------- */
  /* v16: скан ОДНОГО пропса → дія (спільно для interactTarget і interactList) */
  function propTarget(p){
      if(p.type==='bush'&&p.berries)return {kind:'bush',p,label:'Зірвати ягоди'};
      if(p.type==='mush'&&!p.taken)return {kind:'mush',p,label:'Зібрати мідії'};
      if(p.type==='triph')return {kind:'triph',p,label:'Знайти «П\'ять Хвиль»?!'};
      if(p.type==='herb'&&!p.taken)return {kind:'herb',p,label:'Зібрати водорості'};
      if(p.type==='wood'&&p.amt>0)return {kind:'wood',p,label:'Рубати дрова'};
      if(p.type==='flower')return {kind:'flower',p,label:'Нюхнути квітку'};
      /* i3: пляж/курорт */
      if(p.type==='trash')return {kind:'trash',p,label:'Зібрати сміття (пакет)'};
      if(p.type==='towel'||p.type==='lounger')return {kind:'sunbathe',p,label:'ЗАГРЯТИ — сонце або ДІЙСТВО (засмага '+(IB.G.tan|0)+'/100)'};
      if(p.type==='umb')return {kind:'umb',p,label:'Тінь парасолки — відпочити'};
      if(p.type==='net')return {kind:'vball',p,label:'ВОЛЕЙБОЛ 2×2 через сітку'};
      if(p.type==='goal')return {kind:'football',p,label:'⚽ ФУТБОЛ 3×2 — ПАС І УДАР (матч)'};
      if(p.type==='catam')return {kind:'catam',p,label:'КАТАМАРАН — прокат (₴150)'};
      if(p.type==='paras')return {kind:'paras',p,label:'ПАРАШЮТ ЗА КАТЕРОМ (₴600)'};
      if(p.type==='bin')return {kind:'bin',p,label:'Здати сміття (+₴8/пакет)'};
      /* v2.0: луна-парк, пляж, пошта, таблички */
      if(p.type==='wheel')return {kind:'wheel',p,label:'КОЛЕСО ОГЛЯДУ — прокат (₴80)'};
      if(p.type==='carousel')return {kind:'carousel',p,label:'КАРУСЕЛЬ — прокат (₴40)'};
      if(p.type==='autodrom')return {kind:'autodrom',p,label:'АВТОВДРОМ — заїзд (₴60)'};
      if(p.type==='tramp')return {kind:'tramp',p,label:'БАТУТ — стрибки (₴50/10 хв)'};
      if(p.type==='train')return {kind:'train',p,label:'ПАРОВОЗИК «Юний Данченко» (₴30)'};
      if(p.type==='surf')return {kind:'surf',p,label:'СЕРФ — прокат на хвилі (₴120)'};
      if(p.type==='jetski')return {kind:'jetski',p,label:'ГІДРОЦИКЛ — гонки по хвилях (₴250)'};
      if(p.type==='beachbar')return {kind:'beachbar',p,label:'БАР «ШЕЙКЕР» — меню'};
      if(p.type==='shawarma')return {kind:'shawarma',p,label:'🌯 ШАУРМА — купити (₴65)'};
      if(p.type==='dsign')return {kind:'dsign',p,label:'Табличка району — прочитати'};
      if(p.type==='mail')return {kind:'mail',p,label:'ДОСТАВИТИ ЛИСТ (пошта, +₴25)'};
      /* v3.0 */
      if(p.type==='gullfeed')return {kind:'gullfeed',p,label:'КОРМІТИ ЧАЙОК (хліб ×'+(IB.G.inv.bread||0)+')'};
      /* v18: стапелі «Паллади», буй баржі, кіноекран, ярмарок */
      if(p.type==='palhull')return {kind:'palhull',p,label:IB.G.flags.palLaunched?'⚓ «ПАЛЛАДА» НА ВОДІ — розглядати':'⚓ СТАПЕЛІ «ПАЛЛАДИ» — будівництво (С2)'};
      if(p.type==='wreckbuoy')return {kind:'wreck',p,label:'🤿 БАРЖ-СКЛАД «АЛЬБАТРОС» — пірнути (С5)'};
      if(p.type==='screen')return {kind:'cinema',p,label:'🎬 КІНО НА ПІСКУ — сісти (₴40)'};
      if(p.type==='stall')return {kind:'stall',p,label:'🏪 ЯРМАРОК СЕЛ — купити смаколики'};
      /* v14/v16: козирок, пінг-понг, баскетбол 3×2 */
      if(p.type==='canopy')return {kind:'canopy',p,label:'КОЗИРОК — сховатись у тінь (перегрів −)'};
      if(p.type==='pingpong')return {kind:'pingpong',p,label:'ПІНГ-ПОНГ — партія на пляжі (₴25 за перемогу)'};
      if(p.type==='bball')return {kind:'bball',p,label:'🏀 БАСКЕТБОЛ 3×2 — ПАС І КИДОК (матч)'};
      /* v5.0: ЗУПИНКА №7 */
      if(p.type==='bstop')return {kind:'bstop',p,label:'🚏 ЗУПИНКА №7 — маршрутка (телефон)'};
      return null;
  }
  function interactTarget(){
    const L=IB.E.team[0];
    const tx=IB.M.floor(L.x),ty=IB.M.floor(L.y);
    /* NPC — найвищий пріоритет */
    let bestNpc=null,bnd=1e9;
    for(const n of IB.E.npcs){
      const dd=IB.dist(L.x,L.y,n.x,n.y);
      if(dd<1.6&&dd<bnd){bnd=dd;bestNpc=n;}
    }
    if(bestNpc)return {kind:'npc',n:bestNpc,label:'Говорити: '+bestNpc.name};
    if(IB.E.tourist&&!IB.E.tourist.follow&&IB.dist(L.x,L.y,IB.E.tourist.x,IB.E.tourist.y)<2)
      return {kind:'tourist',label:'Допомогти туристу'};
    /* пропси навколо */
    for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){
      const p=IB.W.propAt(tx+dx,ty+dy);
      if(!p)continue;
      if(IB.dist(L.x,L.y,p.x+0.5,p.y+0.5)>1.7)continue;
      const pt=propTarget(p);
      if(pt)return pt;
      /* (спільна логіка в propTarget — v16) */
      if(false&&p.type==='bush'&&p.berries)return {kind:'bush',p,label:'Зірвати ягоди'};
      if(p.type==='mush'&&!p.taken)return {kind:'mush',p,label:'Зібрати мідії'};
      if(p.type==='triph')return {kind:'triph',p,label:'Знайти «П\'ять Хвиль»?!'};
      if(p.type==='herb'&&!p.taken)return {kind:'herb',p,label:'Зібрати водорості'};
      if(p.type==='wood'&&p.amt>0)return {kind:'wood',p,label:'Рубати дрова'};
      if(p.type==='flower')return {kind:'flower',p,label:'Нюхнути квітку'};
      /* i3: пляж/курорт */
      if(p.type==='trash')return {kind:'trash',p,label:'Зібрати сміття (пакет)'};
      if(p.type==='towel'||p.type==='lounger')return {kind:'sunbathe',p,label:'ЗАГОРЯТИ (засмага '+(IB.G.tan|0)+'/100)'};
      if(p.type==='umb')return {kind:'umb',p,label:'Тінь парасолки — відпочити'};
      if(p.type==='net')return {kind:'vball',p,label:'ВОЛЕЙБОЛ 2×2 через сітку'};
      if(p.type==='goal')return {kind:'football',p,label:'ФУТБОЛ 2×3 з місцевими'};
      if(p.type==='catam')return {kind:'catam',p,label:'КАТАМАРАН — прокат (₴150)'};
      if(p.type==='paras')return {kind:'paras',p,label:'ПАРАШЮТ ЗА КАТЕРОМ (₴600)'};
      if(p.type==='bin')return {kind:'bin',p,label:'Здати сміття (+₴8/пакет)'};
      /* v2.0 «РАЙОНИ І ЛЮДИ»: луна-парк, пляж, пошта, таблички */
      if(p.type==='wheel')return {kind:'wheel',p,label:'КОЛЕСО ОГЛЯДУ — прокат (₴80)'};
      if(p.type==='carousel')return {kind:'carousel',p,label:'КАРУСЕЛЬ — прокат (₴40)'};
      if(p.type==='autodrom')return {kind:'autodrom',p,label:'АВТОВДРОМ — заїзд (₴60)'};
      if(p.type==='tramp')return {kind:'tramp',p,label:'БАТУТ — стрибки (₴50/10 хв)'};
      if(p.type==='train')return {kind:'train',p,label:'ПАРОВОЗИК «Юний Данченко» (₴30)'};
      if(p.type==='surf')return {kind:'surf',p,label:'СЕРФ — прокат на хвилі (₴120)'};
      if(p.type==='jetski')return {kind:'jetski',p,label:'ГІДРОЦИКЛ — гонки по хвилях (₴250)'};
      if(p.type==='beachbar')return {kind:'beachbar',p,label:'БАР «ШЕЙКЕР» — меню'};
      if(p.type==='dsign')return {kind:'dsign',p,label:'Табличка району — прочитати'};
      if(p.type==='mail')return {kind:'mail',p,label:'ДОСТАВИТИ ЛИСТ (пошта, +₴25)'};
      /* v3.0 «ПАНЕЛІ І ЧАЙКИ» */
      if(p.type==='gullfeed')return {kind:'gullfeed',p,label:'КОРМІТИ ЧАЙОК (хліб ×'+(IB.G.inv.bread||0)+')'};
      /* v14: НОВІ АКТИВНОСТІ — козирок, пінг-понг, баскетбол 3×3 */
      if(p.type==='canopy')return {kind:'canopy',p,label:'КОЗИРОК — сховатись у тінь (перегрів −)'};
      if(p.type==='pingpong')return {kind:'pingpong',p,label:'ПІНГ-ПОНГ — партія на пляжі (₴25 за перемогу)'};
      if(p.type==='bball')return {kind:'bball',p,label:'БАСКЕТБОЛ 3×3 — кидок у дворі'};
      /* v5.0: ЗУПИНКА №7 */
      if(p.type==='bstop')return {kind:'bstop',p,label:'🚏 ЗУПИНКА №7 — маршрутка (телефон)'};
    }
    /* будівлі — двері */
    let bestDoor=null,bdd=1e9,blbl='';
    for(const b of IB.W.buildings){
      const dd=IB.dist(L.x,L.y,b.door.x,b.door.y+0.5);
      if(dd<1.6&&dd<bdd){bdd=dd;
        /* i3: назви будівель Чорноморська */
        const DL={shop:'Крамниця',kiosk:'Кіоск',bar:'Бар',forge:'Ковальня',farm:'Садиба',chapel:'Каплиця',
          molfar:'Хатка лоцмана',ruin:'Руїни',bronx:'БРОНКС',panel5:'Житловий будинок',panel9:'Житловий будинок',hotel:'Готель',
          cine:'Кінотеатр',museum:'Музей',realtor:'Ріелтор',idalnya:'Їдальня',gym:'Качалка',
          hotdog:'Хот-дог',voda:'Кіоск',port:'Морвокзал',yacht:'Яхт-клуб',market:'Ринок',
          vokzal:'Вокзал',cafe:'Кафе',hostel:'Хостел',lighthouse:'Маяк',house:'Хата',well:'Колодязь',
          post:'Укрпошта',gallery:'Музей Білого',cityhall:'Місцька рада',zavod:'Завод «Паллада»',
          school:'Школа №3',poly:'Поліклініка',club:'КЛУБ «МАЯК»',
          portadm:'Адміністрація порту',warehouse:'Склад порту',fishplant:'Рибцех',dockyard:'Док-майстерня',medport:'Медпункт порту',portcant:'Їдальня порту',fuelstore:'Склад пального',gatehouse:'КПП порту',pokerbar:'Бар «Пірат»'};
        blbl=DL[b.type]||'Зайти';
        bestDoor=b;}
    }
    if(bestDoor){
      /* v24.0: двері нашої бази — окремий підпис, щоб гравець бачив дім */
      if(IB.isBaseBuilding&&IB.isBaseBuilding(bestDoor))
        return {kind:'door',b:bestDoor,label:'🏠 НАША БАЗА — увійти (відпочинок, їжа, склад)'};
      return {kind:'door',b:bestDoor,label:blbl+' — увійти'};
    }
    if(IB.E.tourist&&!IB.E.tourist.follow&&IB.dist(L.x,L.y,IB.E.tourist.x,IB.E.tourist.y)<2)
      return {kind:'tourist',label:'Допомогти туристу'};
    /* артефакти світу */
    for(const a of IB.ARTIFACTS){
      if(!a.world||IB.artHas(a.id))continue;
      if(a.hidden&&!(IB.G.vision>0||IB.G.trip.active||IB.G.flags.molfarKnown))continue;
      if(IB.dist(L.x,L.y,a.x,a.y)<1.7)return {kind:'art',a,label:'ВЗЯТИ: '+a.name};
    }
    /* вода поруч */
    if(!L.swim){
      for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){
        const wt=IB.W.at(tx+dx,ty+dy);
        if(wt===0)return {kind:'water',x:tx+dx,y:ty+dy,label:'МОРЕ: рибалка / купатися / фото'};
        if(wt===16)return {kind:'water',x:tx+dx,y:ty+dy,label:'ЛИМАН: рибалка / купатися',liman:true};
      }
    }
    /* v2.0: ПРИМОРСЬКІ СХОДИ — E: пройти 155 сходинок */
    {
      let onStairs=false;
      for(let dy=-1;dy<=1&&!onStairs;dy++)for(let dx=-1;dx<=1;dx++){
        if(IB.W.at(tx+dx,ty+dy)===15){onStairs=true;break;}
      }
      if(onStairs&&!IB.G.flags.stairsDone)return {kind:'stairs',label:'ПРИМОРСЬКІ СХОДИ — пройти 155 сходинок'};
    }
    /* v1.2: фото-точки */
    let bph=null,bpd=1e9;
    for(const s of (IB.W.PHOTO_SPOTS||[])){
      if(!(s.x>0))continue;
      const dd=IB.dist(L.x,L.y,s.x,s.y);
      if(dd<3.4&&dd<bpd){bpd=dd;bph=s;}
    }
    if(bph&&!channel)return {kind:'photo',s:bph,label:'ФОТО ГРУПИ: '+bph.name};
  /* v17.0: таборів нема (ніякого табору в Чорноморську) */
    return null;
  }
  function promptText(){
    if(channel)return (channel.label==='sunbathe'?'Загоряємо на сонці... ':'Рубаємо дрова... ')+IB.M.round(channel.t/channel.dur*100)+'%';
    const t=interactTarget();
    if(!t){
      const L=IB.E.team[0];
      if(L.swim)return 'ПЛИВИ ДО БЕРЕГА • E — 🏊 ВИЙТИ З МОРЯ';
      return null;
    }
    return '[E] '+t.label;
  }
  function promptChannel(){
    if(mode!=='game'||IB._sceneOpen){IB.$('prompt').classList.add('hidden');return;}
    const p=promptText();
    const el=IB.$('prompt');
    if(p){el.textContent=p;el.classList.remove('hidden');}
    else el.classList.add('hidden');
  }
  /* ===== v16.0: СПЛИВАЮЧЕ МЕНЮ «ДІЯ» — E = ГОЛОВНА КНОПКА =====
     збираємо ВСЕ, що поруч (NPC/пропси/двері/море/таксі) → список тапами.
     Один варіант → виконуємо одразу; кілька → меню вибору (#actmenu). */
  const actMenuEl=()=>IB.$('actmenu');
  IB.actMenuOpen=()=>{const el=actMenuEl();return el&&!el.classList.contains('hidden');};
  IB.closeActMenu=()=>{const el=actMenuEl();if(el)el.classList.add('hidden');};
  function openActMenu(items){
    const el=actMenuEl();if(!el){items[0].f();return;}
    let h='<div class="am-cap"><b>✋ ДІЯ — ВИБЕРИ ('+items.length+')</b><button class="am-x" data-amx="1">✖</button></div>';
    items.slice(0,9).forEach((it,i)=>{
      h+='<button class="phq" data-am="'+i+'">'+(i+1)+'. '+it.label+'</button>';
    });
    h+='<div class="am-foot">'+
      '<button class="phq" data-qk="party">🎉 ГУЛЯНКА</button>'+
      '<button class="phq" data-qk="bag">🎒 БАГАЖ</button>'+
      '<button class="phq" data-qk="srch">🔊 ГУКАТИ</button>'+
      '<button class="phq" data-qk="torch">🔦 СВІТЛО</button></div>';
    el.innerHTML=h;el.classList.remove('hidden');
    IB._actItems=items.slice(0,9); /* v16: цифри 1-9 — швидкий вибір */
    el.querySelectorAll('[data-am]').forEach(b=>{b.onclick=(ev)=>{ev.stopPropagation();IB.closeActMenu();items[+b.dataset.am].f();};});
    el.querySelectorAll('[data-qk]').forEach(b=>{b.onclick=(ev)=>{ev.stopPropagation();IB.closeActMenu();
      const qk=b.dataset.qk;
      if(qk==='party')IB.startParty();else if(qk==='bag'&&IB.openPhoneApp)IB.openPhoneApp('bag');
      else if(qk==='srch')IB.startSearch();else if(qk==='torch')IB.toggleTorch();};});
    const x=el.querySelector('[data-amx]');if(x)x.onclick=(ev)=>{ev.stopPropagation();IB.closeActMenu();};
    IB.SFX.ui&&IB.SFX.ui();
  }
  function interactList(){
    const L=IB.E.team[0];
    const tx=IB.M.floor(L.x),ty=IB.M.floor(L.y);
    const out=[];
    const seen=new Set();
    const push=(key,label,f)=>{if(seen.has(key))return;seen.add(key);out.push({label,f});};
    /* таксі, що чекає — ПЕРШИМ пунктом (вибір «всі або один») */
    if(IB.TAXI&&IB.TAXI.state==='wait'&&IB.TAXI.car&&IB.dist(IB.TAXI.car.x,IB.TAXI.car.y,L.x,L.y)<=3.2)
      push('taxi','🚕 СІСТИ У ТАКСИ — вибір пасажирів',()=>{IB.taxiBoard&&IB.taxiBoard();});
    /* v18: ПЛАВАЄШ — головна дія: ВИЙТИ З МОРЯ (авто-пошук берега) */
    if(L.swim)push('swimout','🏊 ВИЙТИ З МОРЯ — пливу до берега',()=>IB.swimOut&&IB.swimOut());
    /* NPC (до 3 найближчих) */
    const npcs=IB.E.npcs.map(n=>({n,d:IB.dist(L.x,L.y,n.x,n.y)})).filter(o=>o.d<2.2).sort((a,b)=>a.d-b.d).slice(0,3);
    for(const o of npcs){const n=o.n;push('npc:'+n.name,'💬 Говорити: '+n.name,()=>runInteract({kind:'npc',n,label:'Говорити: '+n.name}));}
    if(IB.E.tourist&&!IB.E.tourist.follow&&IB.dist(L.x,L.y,IB.E.tourist.x,IB.E.tourist.y)<2)
      push('tourist','🧭 Допомогти туристу',()=>runInteract({kind:'tourist'}));
    /* пропси 3×3 — усі дії */
    for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){
      const pr=IB.W.propAt(tx+dx,ty+dy);
      if(!pr)continue;
      if(IB.dist(L.x,L.y,pr.x+0.5,pr.y+0.5)>1.9)continue;
      const t=propTarget(pr);
      if(t)push('p:'+t.kind+':'+pr.x+','+pr.y,t.label,()=>runInteract(t));
    }
    /* двері — до 2 найближчих */
    const doors=IB.W.buildings.map(b=>({b,d:IB.dist(L.x,L.y,b.door.x,b.door.y+0.5)})).filter(o=>o.d<1.7).sort((a,b)=>a.d-b.d).slice(0,2);
    const DL2={shop:'Крамниця',kiosk:'Кіоск',bar:'Бар',forge:'Ковальня',farm:'Садиба',chapel:'Каплиця',
      molfar:'Хатка лоцмана',ruin:'Руїни',bronx:'БРОНКС',panel5:'Житловий будинок',panel9:'Житловий будинок',hotel:'Готель',
      cine:'Кінотеатр',museum:'Музей',realtor:'Ріелтор',idalnya:'Їдальня',gym:'Качалка',
      hotdog:'Хот-дог',voda:'Кіоск',port:'Морвокзал',yacht:'Яхт-клуб',market:'Ринок',
      vokzal:'Вокзал',cafe:'Кафе',hostel:'Хостел',lighthouse:'Маяк',house:'Хата',well:'Колодязь',
      post:'Укрпошта',gallery:'Музей Білого',cityhall:'Місцька рада',zavod:'Завод «Паллада»',
      school:'Школа №3',poly:'Поліклініка',club:'КЛУБ «МАЯК»',
      portadm:'Адміністрація порту',warehouse:'Склад порту',fishplant:'Рибцех',dockyard:'Док-майстерня',medport:'Медпункт порту',portcant:'Їдальня порту',fuelstore:'Склад пального',gatehouse:'КПП порту',pokerbar:'Бар «Пірат»'};
    for(const o of doors){
      const isB=IB.isBaseBuilding&&IB.isBaseBuilding(o.b);
      push('d:'+o.b.type+':'+o.b.x+','+o.b.y, isB?'🏠 НАША БАЗА — увійти (відпочинок, їжа, склад)':'🚪 '+DL2[o.b.type]+' — увійти',()=>runInteract({kind:'door',b:o.b,label:'вхід'}));
    }
    /* артефакти */
    for(const a of IB.ARTIFACTS){
      if(!a.world||IB.artHas(a.id))continue;
      if(a.hidden&&!(IB.G.vision>0||IB.G.trip.active||IB.G.flags.molfarKnown))continue;
      if(IB.dist(L.x,L.y,a.x,a.y)<1.7){push('art:'+a.id,'✦ ВЗЯТИ: '+a.name,()=>runInteract({kind:'art',a}));break;}
    }
    /* вода поруч */
    if(!L.swim){
      for(let dy=-1;dy<=1&&!seen.has('water');dy++)for(let dx=-1;dx<=1;dx++){
        const wt=IB.W.at(tx+dx,ty+dy);
        if(wt===0){push('water','🌊 МОРЕ: рибалка / купатися / фото',()=>runInteract({kind:'water',x:tx+dx,y:ty+dy}));break;}
        if(wt===16){push('water','🌊 ЛИМАН: рибалка / купатися',()=>runInteract({kind:'water',x:tx+dx,y:ty+dy,liman:true}));break;}
      }
    }
    /* сходи */
    {
      let onStairs=false;
      for(let dy=-1;dy<=1&&!onStairs;dy++)for(let dx=-1;dx<=1;dx++){if(IB.W.at(tx+dx,ty+dy)===15){onStairs=true;break;}}
      if(onStairs&&!IB.G.flags.stairsDone)push('stairs','🪜 ПРИМОРСЬКІ СХОДИ — 155 сходинок',()=>runInteract({kind:'stairs'}));
    }
    /* фото-точки */
    let bph=null,bpd=1e9;
    for(const s of (IB.W.PHOTO_SPOTS||[])){if(!(s.x>0))continue;const dd=IB.dist(L.x,L.y,s.x,s.y);if(dd<3.4&&dd<bpd){bpd=dd;bph=s;}}
    if(bph&&!channel)push('photo','📷 ФОТО ГРУПИ: '+bph.name,()=>runInteract({kind:'photo',s:bph}));
    /* v17.0: табору НІМАЄ (ніякого табору в Чорноморську) */
    return out;
  }
  function doInteract(){
    IB.chipDone&&IB.chipDone('e');
    /* v18: E закриває радіальне колесо; v16: закриває actmenu */
    if(IB.radialOpen&&IB.radialOpen()){closeRadial();return;}
    if(IB.actMenuOpen&&IB.actMenuOpen()){IB.closeActMenu();return;}
    const pd=IB.$('ph-dlg');
    if(pd&&!pd.classList.contains('hidden'))return;
    if(IB.taxiBoard&&IB.taxiBoard()){
      /* таксі-діалог відкрився (ph-dlg) — ок; якщо ні (далеко) — йдемо у меню */
      if(pd&&!pd.classList.contains('hidden'))return;
    }
    const items=interactList();
    if(!items.length)return;
    if(items.length===1)items[0].f();
    else openRadial(items); /* v18 М2: радіальне колесо частих дій */
  }
  /* ---------- v18 М2: РАДІАЛЬНЕ МЕНЮ E — 6 секторів навколо джойстика ----------
     Часті дії — одним тапом (сектори ≥44px), рідкі — кнопкою «УСІ ДІЇ»
     у звичному списку. Клавіатура: 1-6. */
  function openRadial(items){
    closeRadial();
    const freq=[
      items[0],
      {label:'🍕 ЇСТИ',f:()=>hotbar('1')},
      {label:'💧 ПИТИ',f:()=>hotbar('2')},
      items[1],
      {label:'🎉 ГУЛЯНКА',f:()=>{startParty&&startParty();}},
      {label:'✋ УСІ ДІЇ ('+items.length+')',f:()=>openActMenu(items)}
    ].filter(Boolean).slice(0,6);
    const el=document.createElement('div');
    el.id='radial';
    const pos=[[-78,-96],[78,-96],[-104,0],[104,0],[-78,72],[78,72]];
    freq.forEach((it,i)=>{
      const b=document.createElement('button');
      b.className='rsec';
      b.style.left='calc(50% + '+pos[i][0]+'px)';
      b.style.top='calc(50% + '+pos[i][1]+'px)';
      b.textContent=it.label;
      b.onclick=(ev)=>{ev.stopPropagation();closeRadial();it.f();};
      el.appendChild(b);
    });
    const xc=document.createElement('button');
    xc.id='radial-x';xc.textContent='✖';
    xc.onclick=(ev)=>{ev.stopPropagation();closeRadial();};
    el.appendChild(xc);
    const crt=document.getElementById('crt');
    if(crt)crt.appendChild(el);else document.body.appendChild(el);
    IB._radialItems=freq;
    IB.SFX.ui&&IB.SFX.ui();
  }
  function closeRadial(){
    const el=document.getElementById('radial');
    if(el)el.remove();
    IB._radialItems=null;
  }
  IB.closeRadial=closeRadial;
  IB.radialOpen=()=>!!document.getElementById('radial');
  function runInteract(t){
    /* v18: нові дії — стапелі, барж, кіно, ярмарок, будівлі пляжу, суперники */
    if(t.kind==='palhull')return openPalhull();
    if(t.kind==='wreck')return openWreck();
    if(t.kind==='cinema')return openCinemaNight();
    if(t.kind==='stall')return openStall();
    if(t.kind==='door'&&t.b&&t.b.type==='beachbld')return openBeachBld(t.b);
    if(t.kind==='npc'&&t.n&&t.n.rival)return openRival(t.n);
    switch(t.kind){
      case 'bush':{
        t.p.berries=false;IB.G.inv.berries++;IB.G.stats.berries++;
        IB.SFX.berry();IB.floatMsg(L.x,L.y,'+1🫐');
        IB.toast('Ягоди зірвано (усього: '+IB.G.inv.berries+')');
        setTimeout(()=>{t.p.berries=true;},90000);
        break;}
      case 'mush':{
        t.p.taken=true;IB.G.inv.mush++;
        IB.SFX.berry();IB.floatMsg(L.x,L.y,'+1🍄');
        IB.toast('Мідії зібрано (усього: '+IB.G.inv.mush+')');
        if(L.id&&IB.E.team.find(h=>h.id==='maksym')&&IB.M.random()<0.12){IB.G.inv.trip5++;IB.toast('ROCK знаходить коктейль «П\'ЯТЬ ХВИЛЬ»?!','fun');IB.journalAdd('✦','ROCK знайшов легендарний курортний коктейль «П\'ять Хвиль».');}
        break;}
      case 'triph':{
        t.p.taken=true;IB.G.inv.trip5++;
        IB.SFX.find();IB.banner('ЗНАЙДЕНО КОКТЕЙЛЬ «П\'ЯТЬ ХВИЛЬ»!');
        IB.journalAdd('✦','Знайдено легендарний коктейль «П\'ять Хвиль» — фішка бару «Шейкер». Тепер можна провести Ніч П\'яти Зірок.');
        IB.toast('Використай у таборі ввечері зі всією групою','fun');
        break;}
      case 'herb':{
        t.p.taken=true;IB.G.inv.herb++;
        IB.SFX.berry();IB.floatMsg(L.x,L.y,'+1🌿');
        IB.toast('Водорості зібрано (усього: '+IB.G.inv.herb+')');
        break;}
      case 'wood':{
        const dur=1.8/IB.G.axetier;
        channel={prop:t.p,t:0,dur,label:'wood'};
        break;}
      case 'flower':{
        L.mood=IB.clamp(L.mood+4,0,100);IB.SFX.bird();
        IB.floatMsg(L.x,L.y,'😊');break;}
      /* ================= i3: КУРОРТНІ ДІЇ ================= */
      case 'trash':{
        t.p.taken=true;IB.G.inv.trash++;IB.G.stats.trash=(IB.G.stats.trash||0)+1;
        IB.W.props.splice(IB.W.props.indexOf(t.p),1);IB.W.grid.delete(t.p.y*IB.W.W+t.p.x);
        IB.SFX.chop();IB.floatMsg(L.x,L.y,'+1🗑');
        IB.toast('Пакетів сміття: '+IB.G.inv.trash+' (здай у бак — ₴8/шт)');
        IB.questCheck();break;}
      case 'bin':{
        if(!(IB.G.inv.trash>0)){IB.toast('Сміття немає — збирай купки на піску','red');break;}
        const ntr=IB.G.inv.trash;IB.G.inv.trash=0;const got=ntr*8;
        IB.G.money+=got;IB.SFX.coin();
        IB.toast('Здано '+ntr+' пакетів: +₴'+got,'gold');IB.questCheck();break;}
      case 'umb':{
        for(const h of IB.E.team)h.heat=IB.clamp((h.heat||0)-30,0,120);
        L.mood=IB.clamp(L.mood+4,0,100);
        IB.toast('Тінь парасолки: перегрів спадає, настрій +4');break;}
      case 'sunbathe':{
        /* v16: загоряти ЯК РАНІШЕ або ЗРОБИТИ ДІЙСТВО-ГУЛЯНКУ (засмага + бігають + море + музика) */
        openPanel('🏖 ЗАГОРЯННЯ',panelList([
          {t:'🌞 ПРОСТО ЗАГРЯТИ (2 год на сонці)',f:()=>{closePanel();channel={prop:t.p,t:0,dur:7,label:'sunbathe'};}},
          {t:'🎉 ЗАСМАГА-ДІЙСТВО — ГУЛЯНКА НА ПЛЯЖІ (3 год)',f:()=>{closePanel();IB.startSunShow&&IB.startSunShow();}},
          {t:'✖ Ні, потім',f:closePanel},
        ]));
        break;}
      case 'vball':startVolleyIso();break;
      case 'football':startFootball();break;
      case 'catam':startCatam();break;
      case 'paras':startParas();break;
      case 'canopy':{
        for(const h of IB.E.team)h.heat=IB.clamp((h.heat||0)-38,0,120);
        L.mood=IB.clamp(L.mood+3,0,100);
        IB.toast('Козирок дає густу тінь: перегрів спадає швидко','gold');break;}
      case 'pingpong':startPingPong();break;
      case 'bball':startBball();break;
      case 'door':openBuilding(t.b);break;
      case 'bstop':IB.openPhone('marsh');break;   /* v5.0 */
      case 'npc':openNpc(t.n);break;
      case 'tourist':{
        IB.E.tourist.follow=true;IB.E.tourist.found=true;
        IB.banner('ТУРИСТ СЛІДУЄ ЗА ТОБОЮ — ВЕДИ ДО РЯТУВАЛЬНОЇ ВИШКИ');
        IB.toast('Приведи його до рятувальника Степана на пляжі');
        break;}
      case 'art':{
        IB.pickArtifact(t.a);
        break;}
      case 'water':openWaterMenu(t);break;
      /* ===== v2.0: луна-парк, пляж, пошта, місто ===== */
      case 'wheel':{
        if(IB.G.money<80){IB.toast('Колесо огляду — ₴80','red');break;}
        IB.G.money-=80;IB.G.stats.wheel=(IB.G.stats.wheel||0)+1;timeSkip(1);
        for(const h of IB.E.team)h.mood=IB.clamp(h.mood+10,0,100);
        IB.SFX.coin();
        IB.banner('КОЛЕСО ОГЛЯДУ — ПАНОРАМА МІСТА');
        IB.toast('З кабінки видно ВСЕ: порт, пляж, лиман, маяк і море до горизонту','gold');
        IB.journalAdd('🎡','Колесо огляду луна-парку «Проспект Миру». PABLO боявся дивитись униз.');
        IB.photoTaken({id:'sp_wheel_view',name:'ВИД З КОЛЕСА ОГЛЯДУ',kind:'lunapark',x:L.x,y:L.y});
        IB.questCheck();break;}
      case 'carousel':{
        if(IB.G.money<40){IB.toast('Карусель — ₴40','red');break;}
        IB.G.money-=40;IB.G.stats.carousel=(IB.G.stats.carousel||0)+1;timeSkip(1);
        for(const h of IB.E.team)h.mood=IB.clamp(h.mood+7,0,100);
        IB.SFX.coin();IB.toast('Карусель! Коні летять, музика грає — літо в чистому вигляді','fun');
        IB.questCheck();break;}
      case 'autodrom':{
        if(IB.G.money<60){IB.toast('Автодром — ₴60','red');break;}
        IB.G.money-=60;IB.G.stats.autodrom=(IB.G.stats.autodrom||0)+1;timeSkip(1);
        for(const h of IB.E.team)h.mood=IB.clamp(h.mood+8,0,100);
        IB.SFX.coin();IB.banner('АВТОВДРОМ — БАМПЕР ДО БАМПЕРА');
        IB.toast('PABLO таранить всіх. Суддя махає руками, але сміється','fun');
        IB.questCheck();break;}
      case 'tramp':{
        if(IB.G.money<50){IB.toast('Батут — ₴50 за 10 хв','red');break;}
        IB.G.money-=50;IB.G.stats.tramp=(IB.G.stats.tramp||0)+1;timeSkip(1);
        for(const h of IB.E.team){h.mood=IB.clamp(h.mood+9,0,100);h.heat=IB.clamp((h.heat||0)+6,0,120);}
        IB.SFX.coin();IB.toast('Батут! Стрибки до неба — 50 грн за 10 хвилин щастя','fun');
        IB.questCheck();break;}
      case 'train':{
        if(IB.G.money<30){IB.toast('Паровозик — ₴30','red');break;}
        IB.G.money-=30;IB.G.stats.train=(IB.G.stats.train||0)+1;timeSkip(1);
        for(const h of IB.E.team)h.mood=IB.clamp(h.mood+7,0,100);
        IB.SFX.coin();IB.banner('ПАРОВОЗИК «ЮНИЙ ДАНЧЕНКО» — ПУ'+'ЧОК!');
        IB.toast('Свисток, дим, колія по Молодіжному парку. Малеча аплодує ЛЕГЕНДАМ','fun');
        IB.questCheck();break;}
      case 'surf':{
        if(IB.G.money<120){IB.toast('Серф — ₴120','red');break;}
        if(IB.G.wx.type==='storm'){IB.toast('Рятувальник: «При такій хвилі серф — тільки з божевільними!»','red');break;}
        IB.G.money-=120;IB.G.stats.surf=(IB.G.stats.surf||0)+1;timeSkip(2);
        for(const h of IB.E.team){h.mood=IB.clamp(h.mood+11,0,100);h.heat=IB.clamp((h.heat||0)-10,0,120);}
        IB.SFX.splash();IB.banner('СЕРФ — ЛОВИ ХВИЛЮ!');
        IB.toast('Хвиля підняла — TOXIC встав із першої спроби, решта пили морську воду','gold');
        IB.journalAdd('🏄','Серф на Центральному пляжі: хвилі, бризки і сіль на зубах.');
        IB.questCheck();break;}
      case 'jetski':{
        if(IB.G.money<250){IB.toast('Гідроцикл — ₴250','red');break;}
        if(IB.G.wx.type==='storm'){IB.toast('У таку хвилю гідроцикл не дають — рятувальний пост','red');break;}
        IB.G.money-=250;IB.G.stats.jetski=(IB.G.stats.jetski||0)+1;timeSkip(2);
        for(const h of IB.E.team)h.mood=IB.clamp(h.mood+10,0,100);
        IB.SFX.splash();IB.banner('ГІДРОЦИКЛ — ГАЗ!');
        IB.toast('Бризки до хмар, чайки відлітають. DIIN зробив коло навколо буя — рекорд','fun');
        IB.questCheck();break;}
      case 'beachbar':{
        const disc=IB.friendDiscount();
        openDialog('БАР «ШЕЙКЕР» (пляж)','«Оксана: свіжі напої, тінь і музика. '+
          (disc?'Для вас — знижка друга 20%!':'Для своїх — кайф.')+'»',[
          {t:'Лимонад «Хвиля» (₴20)',f:()=>{if(IB.G.money<20){IB.toast('Мало ₴','red');return;}IB.G.money-=20;IB.G.inv.lemon++;IB.SFX.coin();IB.toast('Лимонад куплено');closeDlg();}},
          {t:'Пиво локальне (₴35)',f:()=>{if(IB.G.money<35){IB.toast('Мало ₴','red');return;}IB.G.money-=35;IB.G.inv.beer++;IB.SFX.coin();IB.toast('Пиво холодне, як бриз','fun');closeDlg();}},
          {t:'Вода 6-pack (₴30)',f:()=>{if(IB.G.money<30){IB.toast('Мало ₴','red');return;}IB.G.money-=30;IB.G.inv.water++;IB.SFX.coin();IB.toast('Вода в запасі');closeDlg();}},
          {t:'Морозиво (₴30)',f:()=>{if(IB.G.money<30){IB.toast('Мало ₴','red');return;}IB.G.money-=30;IB.G.inv.moroz++;IB.SFX.coin();IB.toast('Пломбір тане швидше, ніж сонце сідає');closeDlg();}},
          {t:'Вийти',f:closeDlg}]);break;}
      case 'dsign':
        if((t.p.name||'').indexOf('ОДЕСА')>=0){
          /* v3.0: знак «ОДЕСА 25 КМ» — довгий перехід виконано */
          if(!IB.G.flags.odesaWalk){
            IB.G.flags.odesaWalk=true;
            IB.banner('ТРАСА ОДЕСА — ЧОРНОМОРСЬК • ВИ ДОЙШЛИ!');
            IB.toast('«ОДЕСА 25 КМ». Далі — только маршруткою (автостанція). Це була довга прогулянка!','gold');
            IB.journalAdd('🚏','Дійшли до тракти на Одесу. Далеко, зате панорама полів — як справжнім курортникам.');
            IB.photoTaken({id:'sp_odesa_photo',name:'ТРАСА «ОДЕСА 25 КМ»',kind:'odesa',x:L.x,y:L.y});
            IB.questCheck();
          }else IB.toast('Тракта на Одесу. Соняшники кивають','gold');
          IB.SFX.ui();break;
        }
        IB.toast('РАЙОН: '+(t.p.name||'ЧОРНОМОРСЬК'),'gold');
        IB.SFX.ui();break;
      case 'gullfeed':
        IB.feedGulls();break;
      case 'shawarma':{
        /* v16: ШАУРМА на пляжі — ₴65, їжа +35, настрій +6 */
        if(!IB.payShared(65)){IB.toast('Шаурма коштує ₴65 — у касі не вистачає','red');break;}
        IB.G.inv.shawarma=(IB.G.inv.shawarma||0)+1;
        const sh=IB.E.team[0];sh.food=IB.clamp(sh.food+35,0,100);sh.mood=IB.clamp(sh.mood+6,0,100);
        IB.SFX.eat&&IB.SFX.eat();IB.floatMsg(sh.x,sh.y,'🌯');
        IB.toast('🌯 Шаурма з гриля! Соус, помідор, м\'ясо — смачно (−₴65)','gold');
        IB.journalAdd&&IB.journalAdd('🌯','Шаурма на пляжі — ₴65.');
        break;}
      case 'mail':
        IB.mailDeliver(t.p);break;
      case 'stairs':
        IB.G.flags.stairsDone=true;timeSkip(0.5);
        L.mood=IB.clamp(L.mood+6,0,100);
        IB.banner('155 СХОДОНОК ПРИМОРСЬКИХ СХОДІВ');
        IB.toast('Згори — площа з концертами, знизу — пісок і море. Серце б\'ється частіше','gold');
        IB.journalAdd('🪜','Пройшли Приморські сходи — як у реальному Чорноморську, 155 сходинок.');
        IB.questCheck();break;
      case 'camp':openCampMenu(t.c);break;
      case 'photo':IB.photoTaken(t.s);break;
    }
  }
  function finishChannel(){
    const ch=channel;channel=null;
    if(ch.label==='wood'&&ch.prop.amt>0){
      ch.prop.amt--;
      IB.G.inv.wood++;IB.G.stats.wood++;
      IB.SFX.chop();
      IB.floatMsg(IB.E.team[0].x,IB.E.team[0].y,'+1🌲');
      IB.toast('Дрова: '+IB.G.inv.wood);
      if(ch.prop.amt<=0){
        IB.W.props.splice(IB.W.props.indexOf(ch.prop),1);
        IB.W.grid.delete(ch.prop.y*IB.W.W+ch.prop.x);
      }
    }
    /* i3: ЗАГОРЯННЯ — 2 години на сонці */
    else if(ch.label==='sunbathe'){
      IB.G.tan=IB.clamp((IB.G.tan||0)+IB.rnd(9,14),0,100);
      IB.G.t=(IB.G.t+2)%24;
      for(const h of IB.E.team){
        h.water=IB.clamp(h.water-8,0,100);h.mood=IB.clamp(h.mood+6,0,100);
        if((IB.G.wx.type==='sun'||IB.G.wx.type==='heat')&&IB.G.flags.creamDay!==IB.G.day)
          h.heat=IB.clamp((h.heat||0)+16,0,120);
      }
      IB.SFX.fire();
      IB.toast('2 години на сонці: засмага '+(IB.G.tan|0)+'/100 • вода −8','gold');
      IB.questCheck();
    }
  }

  /* ---------- v18: ВИХІД З МОРЯ ---------- */
  IB.swimOut=()=>{
    const L=IB.E.team[0];
    if(!L||!L.swim){IB.toast('Ти не в воді','');return;}
    const px=IB.M.floor(L.x),py=IB.M.floor(L.y);
    for(let r=1;r<=16;r++){
      let best=null,bd=1e9;
      for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++){
        if(IB.M.max(IB.M.abs(dx),IB.M.abs(dy))!==r)continue;
        const x=px+dx,y=py+dy,t=IB.W.at(x,y);
        if(t===0||t===16)continue;
        const d2=dx*dx+dy*dy;
        if(d2<bd){bd=d2;best={x,y};}
      }
      if(best){
        IB._swimExit={x:best.x+0.5,y:best.y+0.5};
        IB.toast('🏊 Пливу до берега — гей, вода солона!','gold');
        return;
      }
    }
    IB.toast('Берег далеко — пливи сам у бік суходолу','red');
  };

  /* ---------- ВОДА ---------- */
  function openWaterMenu(t){
    /* i3: меню ЧОРНОГО МОРЯ; v2.0 — Сухий лиман має своє меню */
    const storm=(IB.G.wx.type==='storm'||IB.G.wx.type==='thunder');
    if(t.liman){
      const opts=[
        {t:'Рибалка на лимані (карась, пісочник)',f:()=>{closePanel();IB.startFishing();}},
        {t:storm?'Скупатися у лимані — можна і в шторм (лиман тихий)':"Скупатися у лимані (тиха каламутна вода)",f:()=>{
          const L=IB.E.team[0];L.swim=true;IB.SFX.splash();closePanel();
          IB.G.flags.limanSwim=true;IB.toast('Лиман! Вода м\'яка — коли виходиш, ноги в мулі','fun');IB.questCheck();}},
        {t:'ФОТО групи на тлі лиману',f:()=>{closePanel();
          IB.photoTaken({id:'sp_liman_sw',name:'СУХИЙ ЛИМАН',kind:'liman',x:IB.E.team[0].x,y:IB.E.team[0].y});}},
      ];
      openPanel('ЛИМАН — '+IB.W.zoneAt(t.x,t.y),panelList(opts));
      return;
    }
    const opts=[
      {t:'Рибалка з берега (E у момент клювання)',f:()=>{closePanel();IB.startFishing();}},
      {t:storm?'Скупатися — НЕМОЖЛИВО, шторм!':'Скупатися (настрій +, у спеку — кайф)',f:()=>{
        if(storm){IB.toast('Шторм! Рятувальник зафукиває — ніякого моря','red');return;}
        const L=IB.E.team[0];L.swim=true;IB.SFX.splash();closePanel();IB.toast('Пливи! Море тепле','fun');}},
      {t:'Пострибати по хвилях (настрій +)',f:()=>{
        const L=IB.E.team[0];L.mood=IB.clamp(L.mood+6,0,100);L.hp=IB.clamp(L.hp-4,0,100);
        IB.SFX.splash();IB.floatMsg(L.x,L.y,'🌊');closePanel();IB.toast('Бризки, сміх, сіль на губах','fun');}},
      {t:'ФОТО групи на тлі моря',f:()=>{closePanel();
        IB.photoTaken({id:'sp_sea',name:'ЧОРНЕ МОРЕ З БЕРЕГА',kind:'sea',x:IB.E.team[0].x,y:IB.E.team[0].y});}},
      {t:'Змити сіль (якщо запас води є)',f:()=>{const L=IB.E.team[0];
        if(IB.G.inv.water<1){IB.toast('Прісної води немає — купи 6-pack','red');return;}
        IB.G.inv.water--;L.mood=IB.clamp(L.mood+5,0,100);IB.toast('Смита, але щаслива');closePanel();}},
    ];
    openPanel('МОРE — '+IB.W.zoneAt(t.x,t.y),panelList(opts));
  }

  /* ---------- КЕМПІНГ-МЕНЮ ---------- */
  const BUILD_COSTS={fire:{wood:5,n:'Вогнище'},tent:{wood:8,n:'Намет'},well:{wood:6,n:'Колодязь'},
    farm:{wood:4,n:'Грядка (ферма)'},table:{wood:3,n:'Стіл + казан'},dry:{wood:3,n:'Сушилка'}};
  function cost(k){const c=BUILD_COSTS[k].wood;const hasMaster=IB.E.team.some(h=>h.id==='petro');return hasMaster?IB.M.ceil(c*0.75):c;}
  function openCampMenu(c){
    const cc=IB.G.camps[c.id];
    const opts=[];
    /* будівництво */
    for(const k in BUILD_COSTS){
      if(k==='fire'&&(cc.fire)){continue;}
      if(cc[k]&&k!=='fire'){continue;}
      opts.push({t:'Збудувати: '+BUILD_COSTS[k].n+' ('+cost(k)+' дерева)'+(IB.E.team.some(h=>h.id==='petro')?' [DIIN: −25%]':''),
        f:()=>{
          if(IB.G.inv.wood<cost(k)){IB.toast('Треба '+cost(k)+' дерева','red');return;}
          IB.G.inv.wood-=cost(k);
          if(k==='fire'){cc.fire=true;cc.fuel=40;}
          else if(k==='farm'){cc.farm.built=true;cc[k]=true;}
          else cc[k]=true;
          IB.SFX.build();IB.banner('ЗБУДОВАНО: '+BUILD_COSTS[k].n);
          IB.journalAdd('🔨','У «'+c.name+'» збудовано: '+BUILD_COSTS[k].n);
          IB.SYS.questCheck&&0;
          IB.questCheck();
          openCampMenu(c);
        }});
    }
    /* користування */
    if(cc.fire){
      opts.push({t:'Підкинути дров у вогонь (+40 палива) [є: '+IB.G.inv.wood+']',
        f:()=>{if(IB.G.inv.wood<1){IB.toast('Немає дров','red');return;}IB.G.inv.wood--;cc.fuel+=40;IB.SFX.fire();
          IB.toast('Вогонь розгорівся');IB.questCheck();openCampMenu(c);}});
    }
    if(cc.farm.built){
      if(!cc.farm.planted)opts.push({t:'Посадити картоплю (1 шт) [є: '+IB.G.inv.potato+']',
        f:()=>{if(IB.G.inv.potato<1){IB.toast('Немає картоплі — купи в садибі або зірви з грядки іншого табору','red');return;}
          IB.G.inv.potato--;cc.farm.planted=true;cc.farm.grow=0;cc.farm.ready=false;
          IB.toast('Посаджено! Дозріє за ~1.5 доби (або доручення «ферма» прискорює)');openCampMenu(c);}});
      else if(cc.farm.ready)opts.push({t:'ЗІБРАТИ ВРОЖАЙ!',f:()=>{
        const n=4+IB.ri(0,2);IB.G.inv.potato+=n;cc.farm.planted=false;cc.farm.ready=false;cc.farm.grow=0;
        IB.G.flags.harvest=true;IB.SFX.done();IB.banner('ВРОЖАЙ КАРТОПЛІ: +'+n);
        IB.journalAdd('🥔','Зібрали врожай картоплі (+'+n+'). Грядка біля моря працює.');
        IB.questCheck();openCampMenu(c);}});
      else opts.push({t:'Грядка росте: стадія '+cc.farm.stage+'/3 (доручення «ферма» прискорює)',f:null});
    }
    if(cc.table)opts.push({t:'Готувати їжу (казан)',f:()=>openCookMenu(c)});
    if(cc.tent)opts.push({t:'Спати до ранку (3)',f:()=>{closePanel();IB.sleepTillMorning(true);IB.saveGame();}});
    if(cc.well)opts.push({t:'Набрати води з колодязя (+5)',f:()=>{IB.G.inv.water=IB.M.min((IB.G.inv.water||0)+5,10);IB.SFX.drink();IB.toast('Запас води: '+IB.G.inv.water);openCampMenu(c);}});
    if(cc.dry)opts.push({t:'Підвісити рибу для сушки (1 риба → смакота)',f:()=>{if(IB.G.inv.fishraw<1){IB.toast('Немає сирої риби','red');return;}
      IB.G.inv.fishraw--;IB.G.inv.cookfish++;IB.SFX.fire();IB.toast('Сушена риба готова!');openCampMenu(c);}});
    opts.push({t:'Гулянка тут (Q)',f:()=>{closePanel();IB.startParty();}});
    if(IB.G.inv.trip5>0)opts.push({t:'✦ Ніч П\'яти Зірок («П\'ять Хвиль» є!)',f:()=>{closePanel();IB.startTrip();}});
    openPanel('ТАБІР «'+c.name+'»',panelList(opts));
  }
  function openCookMenu(c){
    let html='<div class="prow head"><span class="nm">РЕЦЕПТИ (плитка — де завгодно)</span></div>';
    IB.RECIPES.forEach((r,i)=>{
      const have=Object.keys(r.need).every(k=>(IB.G.inv[k]||0)>=r.need[k]);
      const need=Object.keys(r.need).map(k=>k+' ×'+r.need[k]).join(', ');
      html+='<div class="prow click" data-cook="'+i+'"><span class="nm">'+r.n+'</span><span class="ds">'+need+'</span><span class="'+(have?'ok':'no')+'">'+(have?'Готуємо!':'мало')+'</span></div>';
    });
    openPanel('КУХНЯ — РЕЦЕПТИ',html);
    bindCook(c);
  }
  function bindCook(c){
    IB.$('panel-body').querySelectorAll('[data-cook]').forEach(el=>{
      el.onclick=()=>{if(IB.cook(+el.dataset.cook))openCookMenu(c);};
    });
  }

  /* ---------- БУДІВЛІ СЕЛ ---------- */
  /* i3: цінники курорту */
  const SHOP_BUY=[['bread','Хліб',12],['brinza','Бринза',25],['eggs','Яйця',8],['canned','Консерви',28],
    ['beer','Пиво',35],['wine','Вино',60],['vodka','Горілка',70],['nalyva','Наливка',45],['rozsol','Розсіл',25],['kava','Кава',25]];
  const SHOP_SELL=[['berries','Ягоди',3],['mush','Мідії',6],['herb','Водорості',4],['fishraw','Риба (сира)',14],['potato','Картопля',2],['trash','Сміття (кг)',3]];
  const CITY_SHOPS={
    shop:{n:'ПРОДУКТИ 24',buy:[['bread','Хліб',12],['canned','Консерви',28],['eggs','Яйця',8],
      ['water','Вода 6-pack',30],['kava','Кава',25],['corn','Кукурудза',18],['melon','Арбуз',40]],
      sell:[['fishraw','Риба (сира)',14],['trash','Сміття (кг)',3]]},
    market:{n:'ПРИМОРСЬКИЙ РИНОК',buy:[['melon','Арбуз (великий)',35],['corn','Кукурудза',15],
      ['bread','Пампушки з часником',15],['eggs','Яйця',7],['canned','Консерви',25],
      ['potato','Картопля',8],['water','Вода 6-pack',28],['beer','Пиво локальне',30]],
      sell:[['fishraw','Риба (сира)',14],['berries','Ягоди',4],['mush','Мідії',8],['trash','Сміття (кг)',3]]},
    hotdog:{n:'ХОТ-ДОГ',buy:[['hotdog','Хот-дог класичний',45],['shav','Шаурма',75],
      ['corn','Корн-дог',30],['lemon','Лимонад',25],['moroz','Морозиво',25]],sell:[]},
    voda:{n:'КІОСК ВОДИ/МОРОЗИВО',buy:[['water','Вода 6-pack',30],['juice','Сік «Яблуня»',20],
      ['lemon','Лимонад «Хвиля»',18],['moroz','Морозиво пломбір',25],
      ['cream','КРЕМ від сонця (день)',90]],sell:[]},
    /* v3.0: СЕКОНДХЕНД «АЛЬБАТРОС» — модний курортний лук за копійки */
    second:{n:'СЕКОНДХЕНД «АЛЬБАТРОС»',buy:[
      ['sec_t','Майка «ЧОРНОМОРСЬК 90» (кг)',15],['sec_p','Штани-карго (кг)',20],
      ['sec_h','Панама «Паллада» (кг)',10],['sec_g','Сукня «Принца по-одеськи» (кг)',25]],
      sell:[['fishraw','Риба (сира)',14],['trash','Сміття (кг)',3]]},
  };
  function openBuilding(b){
    /* i3-main2-patch: у Чорноморську майже все — заходимо ВСЕРЕДИНУ */
    if(b.type==='house'){
      const lines=['Хазяїн: «Курорт, легендарні! Квартири — у Віри, ріелтор «Біля Море», центр.»',
        'Сусідка: «На Бронкс дивіться — хата з двором, до пляжу двісті кроків.»',
        'Дід на лавці: «Рибалка з хвилерізу зранку — бичок іде, як з автомату.»',
        'Пані: «У спеку — крем і вода. А то сонячний удар, як торік у Сонячному.»'];
      const line=IB.pick(lines,b.x*7+b.y);
      openPanel('ХАТА — РОЗМОВА', '<div class="pcard"><div class="ds">'+line+'</div></div>');
      const L0=IB.E.team[0];L0.mood=IB.clamp(L0.mood+3,0,100);
      return;
    }
    if(b.type==='lighthouse'){
      openPanel('СТАРИЙ МАЯК','<div class="pcard"><div class="ds">Вгору 84 сходинки. З верхівки — весь Чорноморськ: порт, пірс, смуга піску і Чорне море до горизонту. Здається, звідси видно навіть Київ — якщо дуже захотіти.</div></div>');
      IB.photoTaken({id:'sp_light_view',name:'ВИД З МАЯКА',kind:'lighthouse',x:b.door.x,y:b.door.y});
      return;
    }
    /* i3-home-guard: оселя — тільки для тих, хто орендував (v24: БАЗА) */
    if(b.type==='bronx'||b.type==='panel5'||b.type==='hostel'){
      const own=IB.isBaseBuilding&&IB.isBaseBuilding(b);
      if(!own){
        openDialog('ДВЕРІ','«Оселя здається через ріелтора. Офіс «БІЛЯ МОРЕ» — у центрі, агентка Віра. Оренда — НА МІСЯЦЬ (30 днів). Готель — через рецепцію.»',[{t:'Зрозуміло',f:closeDlg}]);
        return;
      }
      return enterInterior(b);
    }
    return enterInterior(b);
  }
  function openBuildingOld(b){
    if(b.type==='house'){
      const lines=['Господиня: «Ой, легендарні гості з міста! Заходьте, тільки обід наш — свій.»',
        'Дід: «У Києві тепер тихо? А в лимані завжди так. Камиш, вода і риба — усі живі.»',
        'Хлопець: «Кажуть, старий лоцман Марек на молу знає, де скарби затонулих барж. Хто з ним заговорить — той скарби бачитиме.»',
        'Пані: «Як шторм на море піде — сидіть у кафе з кавою. Море не прощає гордих.»'];
      const line=IB.pick(lines,b.x*7+b.y);
      openPanel('ХАТА — РОЗМОВА', '<div class="pcard"><div class="ds">'+line+'</div></div>');
      const L=IB.E.team[0];L.mood=IB.clamp(L.mood+3,0,100);
      return;
    }
    if(b.type==='chapel'){
      if(IB.G.flags['pray'+IB.G.day]){openPanel('КАПЛИЦЯ','<div class="pcard"><div class="ds">Ви вже молилися сьогодні. Свічка тихо тріщить.</div></div>');return;}
      IB.G.flags['pray'+IB.G.day]=true;
      for(const h of IB.E.team)h.mood=IB.clamp(h.mood+10,0,100);
      IB.SFX.bell();
      openPanel('КАПЛИЦЯ','<div class="pcard"><div class="ds">Дзвін каплиці гуде над долиною. Настрій групи +10. Гори чують.</div></div>');
      return;
    }
    if(b.type==='shop')return openShop(b);
    if(b.type==='bar')return openBar(b);
    if(b.type==='forge')return openForge(b);
    if(b.type==='farm')return openFarmstead(b);
  }
  function shopRows(){
    let html='<div class="prow head"><span class="nm">КУПИТИ</span><span class="ds">ціна</span><span class="ok">₴'+IB.G.money+'</span></div>';
    SHOP_BUY.forEach(([k,n,p],i)=>{
      html+='<div class="prow click" data-buy="'+k+'"><span class="nm">'+n+'</span><span class="ds">₴'+p+'</span><span class="'+(IB.G.money>=p?'ok':'no')+'">'+(IB.G.money>=p?'☑':'мало ₴')+'</span></div>';
    });
    html+='<div class="prow head"><span class="nm">ПРОДАТИ</span><span class="ds">ціна</span><span class="ok">в наявності</span></div>';
    SHOP_SELL.forEach(([k,n,p])=>{
      const q=IB.G.inv[k]||0;
      html+='<div class="prow click'+(q?'':' cant')+'" data-sell="'+k+'"><span class="nm">'+n+'</span><span class="ds">₴'+p+'</span><span class="'+(q?'ok':'no')+'">×'+q+'</span></div>';
    });
    return html;
  }
  function shopRows(cfg){
    const CB=(cfg&&cfg.buy)||SHOP_BUY, CS=(cfg&&cfg.sell)||SHOP_SELL, ttl=(cfg&&cfg.n)||'КРАМНИЦЯ';
    let html='<div class="prow head"><span class="nm">'+ttl+' — КУПИТИ</span><span class="ds">ціна</span><span class="ok">₴'+IB.G.money+'</span></div>';
    CB.forEach(([k,n,p])=>{
      html+='<div class="prow click" data-buy="'+k+'"><span class="nm">'+n+'</span><span class="ds">₴'+p+'</span><span class="'+(IB.G.money>=p?'ok':'no')+'">'+(IB.G.money>=p?'☑':'мало ₴')+'</span></div>';
    });
    if(CS.length){
      html+='<div class="prow head"><span class="nm">ПРОДАТИ</span><span class="ds">ціна</span><span class="ok">в наявності</span></div>';
      CS.forEach(([k,n,p])=>{
        const q=IB.G.inv[k]||0;
        html+='<div class="prow click'+(q?'':' cant')+'" data-sell="'+k+'"><span class="nm">'+n+'</span><span class="ds">₴'+p+'</span><span class="'+(q?'ok':'no')+'">×'+q+'</span></div>';
      });
    }
    return html;
  }
  function openShop(b){
    const cfg=CITY_SHOPS[b.type]||null;
    openPanel((cfg&&cfg.n||'КРАМНИЦЯ')+(b.label?' • '+b.label:''),shopRows(cfg));
    bindShop(cfg,b);  /* v3.0: передаємо b — перерисовка панелі після купівлі */
  }
  function bindShop(cfg,b){
    const CB=(cfg&&cfg.buy)||SHOP_BUY, CS=(cfg&&cfg.sell)||SHOP_SELL;
    const disc=IB.friendDiscount();   /* v2.0: друга знижка 20% поруч */
    IB.$('panel-body').querySelectorAll('[data-buy]').forEach(el=>{
      el.onclick=()=>{
        const row=CB.find(x=>x[0]===el.dataset.buy);if(!row)return;
        const [k,n,p0]=row;
        const p=Math.round(p0*(1-disc));
        if(IB.G.money<p){IB.toast('Не вистачає ₴','red');return;}
        IB.G.money-=p;IB.G.inv[k]=(IB.G.inv[k]||0)+1;
        if(disc)IB.toast('Друг поруч: знижка 20% (₴'+p0+' → ₴'+p+')','gold');
        if(k==='bread')IB.G.flags.boughtBread=true;
        if(k&&k.indexOf('sec_')===0){  /* v3.0: модний лук секондхенду */
          IB.G.stats.second=(IB.G.stats.second||0)+1;
          IB.E.team[0].mood=IB.clamp(IB.E.team[0].mood+6,0,100);
          IB.toast('МОДНИК: речей з «Альбатроса» — '+IB.G.stats.second+'. Стиль за копійки!','gold');
          IB.questCheck();
        }
        if(k==='cream'){IB.G.flags.creamDay=IB.G.day;IB.toast('КРЕМ нанесено: група не перегрівається до кінця дня','gold');}
        IB.SFX.coin();IB.toast('Куплено: '+n);
        openShop(b);
      };
    });
    IB.$('panel-body').querySelectorAll('[data-sell]').forEach(el=>{
      el.onclick=()=>{
        const row=CS.find(x=>x[0]===el.dataset.sell);if(!row)return;
        const [k,n,p]=row;
        if(!(IB.G.inv[k]>0))return;
        IB.G.inv[k]--;IB.G.money+=p;
        IB.SFX.coin();IB.toast('Продано: '+n+' +₴'+p);
        openShop(b);
      };
    });
  }
  const BAR_BUY=[['yushka','Юшка з бичкив (їжа)',65],['banosh','Плов портовий (їжа)',55],['rozsol','Розсіл',30],
    ['beer','Пиво холодне',35],['wine','Вино домашнє',60],['vodka','Горілка',70],['nalyva','Наливка',45]];
  function openBar(b){
    let html='<div class="prow head"><span class="nm">МЕНЮ КОРЧМИ</span><span class="ds">«'+b.label+'»</span><span class="ok">₴'+IB.G.money+'</span></div>';
    BAR_BUY.forEach(([k,n,p])=>{
      html+='<div class="prow click" data-buy="'+k+'"><span class="nm">'+n+'</span><span class="ds">₴'+p+'</span><span class="'+(IB.G.money>=p?'ok':'no')+'">'+(IB.G.money>=p?'☑':'мало ₴')+'</span></div>';
    });
    html+='<div class="prow head"><span class="nm">ПРОДАТИ ВЛОВЛЕНЕ/ЗІБРАНЕ</span></div>';
    SHOP_SELL.forEach(([k,n,p])=>{
      const q=IB.G.inv[k]||0;
      html+='<div class="prow click'+(q?'':' cant')+'" data-sell="'+k+'"><span class="nm">'+n+'</span><span class="ds">₴'+p+'</span><span class="'+(q?'ok':'no')+'">×'+q+'</span></div>';
    });
    html+='<div class="pcard"><b>Бармен Юрко:</b> <span class="ds">«Гулянку починайте у себе в таборі — але напитки беріть тут! Накупив на 8 монет — розкажу про Скрипку Легеня» (куплено на '+(IB.G.flags.barSpent||0)+')</span></div>';
    openPanel('КОРЧМА',html);
    IB.$('panel-body').querySelectorAll('[data-buy]').forEach(el=>{
      el.onclick=()=>{
        const [k,n,p]=BAR_BUY.find(x=>x[0]===el.dataset.buy);
        if(IB.G.money<p){IB.toast('Не вистачає ₴','red');return;}
        IB.G.money-=p;
        if(k==='yushka'||k==='banosh'){IB.G.inv[k]++;}
        else IB.G.inv[k]=(IB.G.inv[k]||0)+1;
        IB.G.flags.barSpent=(IB.G.flags.barSpent||0)+p;
        IB.SFX.coin();IB.toast('Куплено: '+n);
        IB.SYS_Q.questCheck();
        if(IB.SIDES.violin.need()&&!IB.G.flags.violinGiven){IB.G.flags.violinGiven=true;IB.SIDES.violin.give();}
        openBar(b);
      };
    });
    IB.$('panel-body').querySelectorAll('[data-sell]').forEach(el=>{
      el.onclick=()=>{
        const [k,n,p]=SHOP_SELL.find(x=>x[0]===el.dataset.sell);
        if(!(IB.G.inv[k]>0))return;
        IB.G.inv[k]--;IB.G.money+=p;IB.SFX.coin();IB.toast('Продано: '+n+' +₴'+p);
        openBar(b);
      };
    });
  }
  function openForge(b){
    const disc=IB.G.flags.forgeDiscount?0.5:1;
    let html='<div class="prow head"><span class="nm">КОВАЛЬНЯ ДМИТРА</span><span class="ok">₴'+IB.G.money+'</span></div>';
    if(IB.G.axetier===1)html+='<div class="prow click" data-axe="2"><span class="nm">Сокира-«двійка»</span><span class="ds">рубка ×2 швидше • ₴'+IB.M.round(40*disc)+'</span><span class="'+(IB.G.money>=40*disc?'ok':'no')+'"></span></div>';
    if(IB.G.axetier===2)html+='<div class="prow click" data-axe="3"><span class="nm">Сокира-«трійка» ЛЕГЕНДА</span><span class="ds">рубка ×3 • ₴'+IB.M.round(100*disc)+'</span><span class="'+(IB.G.money>=100*disc?'ok':'no')+'"></span></div>';
    if(IB.G.axetier>=3)html+='<div class="prow"><span class="nm">Топір в ідеалі</span><span class="ok">✔</span></div>';
    html+='<div class="pcard"><span class="ds">«Принеси мені 6 дров — зроблю знижку», — коваля Дмитра доручення (панель ГРУПА → побачиш «!» над ним).</span></div>';
    openPanel('КОВАЛЬНЯ',html);
    IB.$('panel-body').querySelectorAll('[data-axe]').forEach(el=>{
      el.onclick=()=>{
        const price=(+el.dataset.axe===2?40:100)*disc;
        if(IB.G.money<price){IB.toast('Не вистачає ₴','red');return;}
        IB.G.money-=price;IB.G.axetier=+el.dataset.axe;
        IB.SFX.build();IB.banner('СОКИРА ПРОПОЛЕНА: ТІР '+IB.G.axetier);
        IB.journalAdd('🪓','Куплено сокиру тіру '+IB.G.axetier+' у майстерні порту.');
        openForge(b);
      };
    });
  }
  function openFarmstead(b){
    let html='<div class="prow head"><span class="nm">САДИБА (Грибівка)</span><span class="ok">₴'+IB.G.money+'</span></div>';
    [['brinza','Бринза домашня',12],['eggs','Яйця',4],['potato','Картопля на посадку',5]].forEach(([k,n,p])=>{
      html+='<div class="prow click" data-buy="'+k+'|'+p+'"><span class="nm">'+n+'</span><span class="ds">₴'+p+'</span><span class="'+(IB.G.money>=p?'ok':'no')+'"></span></div>';
    });
    html+='<div class="prow head"><span class="nm">ПРОДАТИ</span></div>';
    [['berries','Ягоди',3],['mush','Мідії',6],['fishraw','Риба',7]].forEach(([k,n,p])=>{
      const q=IB.G.inv[k]||0;
      html+='<div class="prow click'+(q?'':' cant')+'" data-sell="'+k+'|'+p+'"><span class="nm">'+n+'</span><span class="ds">₴'+p+'</span><span class="'+(q?'ok':'no')+'">×'+q+'</span></div>';
    });
    html+='<div class="pcard"><span class="ds">Господиня Марічка: «Картоплю — на посадку. Пані будуть з помічників!»</span></div>';
    openPanel('САДИБА',html);
    IB.$('panel-body').querySelectorAll('[data-buy]').forEach(el=>{
      el.onclick=()=>{
        const [k,p]=el.dataset.buy.split('|');p=+p;
        if(IB.G.money<p){IB.toast('Не вистачає ₴','red');return;}
        IB.G.money-=p;IB.G.inv[k]=(IB.G.inv[k]||0)+1;IB.SFX.coin();openFarmstead(b);
      };
    });
    IB.$('panel-body').querySelectorAll('[data-sell]').forEach(el=>{
      el.onclick=()=>{
        const [k,p]=el.dataset.sell.split('|');p=+p;
        if(!(IB.G.inv[k]>0))return;
        IB.G.inv[k]--;IB.G.money+=p;IB.SFX.coin();openFarmstead(b);
      };
    });
  }

  /* ===== i3-main-v31: ЗАПРОШЕННЯ від людей — вечірка / гулянка / тусі / чайки ===== */
  IB.showInvite=(inv)=>{
    if(!inv)return;
    if(mode!=='game'){return;}
    openDialog('👥 ЗАПРОШЕННЯ — '+inv.n,inv.txt,[
      {t:inv.opt,f:()=>{
        const L=IB.E.team[0];
        if(inv.k==='beach'){
          const hour=IB.hStr();
          if((IB.W.at(L.x,L.y)===1||IB.W.at(L.x,L.y)===13)&&hour>=17){IB.startParty();}
          else{
            for(const h of IB.E.team)h.mood=IB.clamp(h.mood+IB.ri(8,14),0,100);
            timeSkip(2);
            IB.showScene('🔥','ГУЛЯНКА З МІСЦЕВИМИ','Компанія з пляжу показала, як ганяти чайок від рушників. Розповіли, де брати найсолодші арбузи, і змінили вам кава на лимонад. Час пролетів — 2 години.');
            IB.journalAdd('🔥','Гулянка з місцевими на пляжі ('+IB.clockStr()+') — настрій підняли.');
          }
          IB.G.stats.invites=(IB.G.stats.invites||0)+1;
          IB.questCheck();
        }else if(inv.k==='walk'){
          for(const h of IB.E.team)h.mood=IB.clamp(h.mood+IB.ri(9,15),0,100);
          timeSkip(1.5);
          IB.showScene('🌃','Гулянка МІСТОМ з новими друзями','Проспект Миру ввечері: нові житлові будинки світяться вікнами, луна-парк крутиться порожньо, таксі гуде без причин. Хлопці з двору показали баскетбольні ворота — «тугрикові».');
          IB.journalAdd('🌃','Гулянка містом з місцевими ('+IB.clockStr()+').');
          IB.G.stats.invites=(IB.G.stats.invites||0)+1;
          IB.questCheck();
        }else if(inv.k==='club'){
          for(const h of IB.E.team)h.mood=IB.clamp(h.mood+IB.ri(10,16),0,100);
          timeSkip(2);
          IB.G.flags.clubVisit=true;
          IB.showScene('🎧','ТУСІ У КЛУБІ «МАЯК»','Столик броньований, діджей Іверо крикнув «ЛЕГЕНДАРНІ У ЗАЛІ!» — бас впав так, що келихи піщали. Марічка подарувала всім неонові браслети.');
          IB.journalAdd('🎧','Тусі у «Маяку» за запрошенням Марічки ('+IB.clockStr()+').');
          IB.G.stats.invites=(IB.G.stats.invites||0)+1;
          IB.questCheck();
        }else if(inv.k==='gulls'){
          if((IB.G.inv.bread||0)<1){IB.G.inv.bread=(IB.G.inv.bread||0)+2;IB.toast('Галя дала хліба на двох','gold');}
          for(const h of IB.E.team)h.mood=IB.clamp(h.mood+7,0,100);
          IB.feedGulls&&IB.feedGulls();
          IB.G.stats.invites=(IB.G.stats.invites||0)+1;
          IB.questCheck();
        }
        closeDlg();
      }},
      {t:'Не сьогодні',f:()=>{IB.toast('Компанія розуміє: «Буває. Наступного разу!»');closeDlg();}}]);
  };

  /* ================= i3-main2-patch: СЕРВІСИ КУРОРТУ ================= */
  IB.addStamp=addStamp; /* штампи «Море-Тур» доступні морським розвагам */
  /* ==================== v24.0: РІЕЛТОР — ОРЕНДА ЗА МІСЯЦЬ (30 ДНІВ) ====================
   Гравець: «ВАРТІСТЬ — не в день а за місяць, ми знімаємо на 30 днів,
   ріелтор нагадує через 30 днів — можна оплатити далі або виїхати». */
  const RENT_OPTS=[
    {id:'hostel',label:'ХОСТЕЛ «ХВИЛЬКА» — КІМНАТА',rent:3000,desc:'ліжка на п\'ятьох, душ спільний, сусіди-рибалки'},
    {id:'panel5',label:'ЖИТЛОВИЙ БУДИНОК — КВАРТИРА',rent:12000,desc:'окрема квартира, кухня, ВИД НА МОРЕ'},
    {id:'hotel',label:'ГОТЕЛЬ «ЧОРНОМОРЕЦЬ» — НОМЕР',rent:22000,desc:'сніданок, прибирання, кондиціонер'},
    {id:'bronx',label:'БРОНКС — ХАТА З ДВОРОМ',rent:30000,desc:'200 м до пляжу, патіо, мангал, гойдалка'},
  ];
  function rentHome(o){
    if(IB.G.money<o.rent){IB.toast('Не вистачає ₴'+o.rent+' на МІСЯЦЬ оренди','red');return;}
    IB.G.money-=o.rent;
    IB.G.home={id:o.id,label:o.label,rent:o.rent,expDay:IB.G.day+30};
    /* v24.0: база записується у СПІЛЬНИЙ реєстр житла — нагадування Віри,
       оплата/виїзд у чаті, і СКЛАД пропадає при виїзді */
    const b=IB.W.buildings.find(bb=>bb.type===o.id);
    if(b&&IB.G.homes){
      IB.G.homes=IB.G.homes.filter(hm=>hm.b!==b);
      IB.G.homes.push({id:'house_'+o.id,b,addr:o.label,mode:'rent',rent:o.rent,expDay:IB.G.day+30,
        door:{x:b.door.x,y:b.door.y},occupants:[]});
    }
    IB.visitPlace&&IB.visitPlace('БАЗА: '+o.label,b?b.door.x:IB.E.team[0].x,b?b.door.y:IB.E.team[0].y);
    IB.banner('🏠 ОСЕЛИЛИСЬ НА 30 ДНІВ: '+o.label);
    IB.journalAdd('🏠','Оренда: '+o.label+' — ₴'+o.rent+'/МІС (30 днів). БАЗА п\'ятірки: відпочинок, їжа, гулянка, склад. На карті 🏠.');
    IB.sms('vera','Віра (ріелтор)','Ключі від '+o.label+' — НА 30 ДНІВ (₴'+o.rent+'/міс). За 3 дні до кінця нагадаю: оплати далі або виїжджайте (склад пропаде). БАЗА вже на КАРТІ 🏠 і у ТАКСІ — заселяйтесь!');
    IB.sms('team','П\'ЯТЕРКА','Це наша БАЗА! Заходим: відпочинок, їжа, гулянка — всі заряжджаються. Склад — все що знімаємо — теж тут.');
    for(const h of IB.E.team)h.mood=IB.clamp(h.mood+12,0,100);
    IB.SFX.done();IB.saveGame();IB.questCheck();
  }
  function openRealtor(){
    let h='<div class="pcard"><div class="ds"><b>АГЕНТКА ВІРА:</b> «Є варіанти на будь-який гаманець. ОРЕНДА ЗА МІСЯЦЬ (30 днів) — оплата вперед. За 3 дні до кінця нагадаю: продовжуєте або виїжджаєте (склад пропаде). БРОНКС — найкрутіше: до пляжу двісті кроків!»</div></div>';
    RENT_OPTS.forEach((o,i)=>{
      h+='<div class="prow click" data-rent="'+i+'"><span class="nm">'+o.label+'</span><span class="ds">'+o.desc+'</span><span class="'+(IB.G.money>=o.rent?'ok':'no')+'">₴'+o.rent+'/МІС</span></div>';
    });
    if(IB.G.home)h+='<div class="pcard"><b>Зараз орендуєте:</b> '+IB.G.home.label+' (сплачено до дня '+IB.G.home.expDay+' — ще '+(IB.G.home.expDay-IB.G.day)+' дн.)<br><small>🔑 Оплатити далі або 📦 виїхати — у чаті Віри (телефон) або у ЖИТЛО.</small></div>';
    openPanel('РІЕЛТОР «БІЛЯ МОРЕ» — КВАРТИРИ (ОРЕНДА ЗА МІСЯЦЬ)',h);
    IB.$('panel-body').querySelectorAll('[data-rent]').forEach(el=>{
      el.onclick=()=>{rentHome(RENT_OPTS[+el.dataset.rent]);openRealtor();};
    });
  }
  function timeSkip(hrs){
    IB.G.t=(IB.G.t+hrs)%24;
    for(const h of IB.E.team){
      h.food=IB.clamp(h.food-hrs*4,0,100);h.water=IB.clamp(h.water-hrs*5,0,100);
    }
  }
  /* v16: startFootball — реальний МАТЧ 3×2 (пас і удар) — рушій нижче */
  function startVolley(){
    closePanel();
    const L=IB.E.team[0];
    const win=IB.M.random()<0.5+(L.mood-50)/200;
    IB.G.stats.volley=(IB.G.stats.volley||0)+1;
    L.mood=IB.clamp(L.mood+(win?10:-2),0,100);L.hp=IB.clamp(L.hp-8,0,100);
    timeSkip(1);
    IB.SFX.done();
    IB.showScene('🏐',win?'ВОЛЕЙБОЛ — ВЗЯЛИ СЕТ!':'ВОЛЕЙБОЛ — сет не твій',win?
      'DIIN блискавично закрив сітку, TOXIC подавав так, що пісок димів. Турнір пляжу складається!':
      'Суперник — бронзові дядьки з качалки. Пас був, аміжха відбувалась — але засмага гарантована.');
    IB.journalAdd('🏐','Волейбол через сітку: '+(win?'взяли':'програли')+' сет.');
    IB.questCheck();
  }
  /* ================= v14: НОВІ АКТИВНОСТІ =================
     ПОКЕР (бар «Пірат», місто) — виграш грошей; ДАРТС (бар «Пірат»);
     ПІНГ-ПОНГ (пляж); БАСКЕТБОЛ 3×3 (двори). */
  function pokerDeck(){
    const SU=['♠','♥','♦','♣'],RK=['2','3','4','5','6','7','8','9','10','J','Q','K','A'];
    const d=[];
    for(const s of SU)for(const r of RK)d.push(r+s);
    for(let i=d.length-1;i>0;i--){const j=(IB.hsh(i,IB.G.day,77)*1e4|0)%(i+1);const t=d[i];d[i]=d[j];d[j]=t;}
    return d;
  }
  function pokerRank(hand){
    /* → [категорія, тай-брейк...]: 8 стріт-флеш … 0 старша */
    const val=c=>['2','3','4','5','6','7','8','9','10','J','Q','K','A'].indexOf(c.slice(0,-1));
    const su=c=>c.slice(-1);
    const vs=hand.map(val).sort((a,b)=>a-b);
    const flush=hand.every(c=>su(c)===su(hand[0]));
    const straight=vs[4]===vs[0]+4||(vs.join()==='8,9,10,11,12');
    const cnt={};for(const v of vs)cnt[v]=(cnt[v]||0)+1;
    const groups=Object.values(cnt).sort((a,b)=>b-a);
    const kick=Object.keys(cnt).map(Number).sort((a,b)=>b-a);
    let cat=0;
    if(straight&&flush)cat=8;
    else if(groups[0]===4)cat=7;
    else if(groups[0]===3&&groups[1]===2)cat=6;
    else if(flush)cat=5;
    else if(straight)cat=4;
    else if(groups[0]===3)cat=3;
    else if(groups[0]===2&&groups[1]===2)cat=2;
    else if(groups[0]===2)cat=1;
    return [cat,...kick,...vs.slice().reverse()];
  }
  function pokerCmp(a,b){for(let i=0;i<a.length;i++){if((a[i]||0)!==(b[i]||0))return (a[i]||0)-(b[i]||0);}return 0;}
  function pokerName(r){
    return ['Старша карта','Пара','Дві пари','Сет','Стріт','Флеш','Фул-хаус','Каре','СТРІТ-ФЛЕШ'][r[0]];
  }
  function pokerHandStr(hand){return hand.join('  ');}
  /* стан покерного столу */
  let PK=null;
  function startPoker(){
    if(PKH){PKH=null;mode='game';}
    const L=IB.E.team[0];
    openDialog('🃏 ПОКЕР — ТЕХАСЬКИЙ ХОЛДЕМ • БАР «ПІРАТ»',
      'Бармен: «Задня кімната. Стіл на п\'ятеро: ти, Мурзик, Гопчик, Оксана і сам діджей Іверо. Фішки = гроші 1:1. Блайнди, флоп, терн, рівер — як в онлайн-румі.»',[
      {t:'🃏 СТІЛ ₴100 (фішки 1:1)',f:()=>holdemStart(100)},
      {t:'🃏 СТІЛ ₴500 (серйозно)',f:()=>holdemStart(500)},
      {t:'🃏 СТІЛ ₴2000 (ВА-БАНК)',f:()=>holdemStart(2000)},
      {t:'Піду повз',f:closeDlg}]);
  }
  /* ================= v16.0: ТЕХАСЬКИЙ ХОЛДЕМ (як онлайн-покер) =================
     5 гравців: ТИ + Мурзик/Гопчик/Оксана/Іверо. Фішки 1:1 з гривнею.
     Блайнди sb/bb, 2 карти в руки, флоп(3)-терн-рівер, ФОЛД/КОЛ/РАЙЗ/ВА-БАНК,
     найкраща п\'ятірка з 7 карт, банк і спліти. */
  function holdemBest(cards){
    /* найкраща п\'ятірка з 5..7 карт: перебір комбінацій */
    let best=null;
    const N=cards.length;
    const idx=[0,1,2,3,4];
    const combos=(start,depth)=>{};
    if(N<=5)return pokerRank(cards);
    /* 21 комбінація для 7, 6 для 6 */
    const pick=[];
    const rec=(s,need)=>{
      if(need===0){const r=pokerRank(pick.slice());if(!best||pokerCmp(r,best)>0)best=r;return;}
      for(let i=s;i<=N-need;i++){pick.push(cards[i]);rec(i+1,need-1);pick.pop();}
    };
    rec(0,5);
    return best;
  }
  function holdemCardVal(c){return ['2','3','4','5','6','7','8','9','10','J','Q','K','A'].indexOf(c.slice(0,-1));}
  let PKH=null;
  IB.holdemStart=holdemStart;   /* v16: хук для тестів */
  IB.holdemState=()=>PKH;
  function holdemStart(st){
    if(IB.G.money<st){IB.toast('У спільній касі менше ₴'+st+' — спочатку зароби','red');closeDlg();return;}
    IB.G.money-=st;
    const bb=IB.M.max(10,IB.M.round(st/10));
    PKH={buy:st,bb:bb,sb:IB.M.max(5,bb>>1),deck:[],community:[],pot:0,stage:'deal',
      dealer:IB.ri(0,4),turn:0,betNeed:0,btns:[],msg:'Застільні фішки: ₴'+st+' у кожного',t:0,
      hands:0,players:[]};
    PKH.players.push({nm:'ТИ',chips:st,hole:[],bet:0,fold:false,allin:false,acted:false,hero:true,lastAct:''});
    for(const nm of ['Мурзик','Гопчик','Оксана','Іверо'])
      PKH.players.push({nm,chips:st,hole:[],bet:0,fold:false,allin:false,acted:false,lastAct:''});
    closeDlg();
    mode='poker';
    IB.toast('🃏 Холдем: блайнди ₴'+PKH.sb+'/₴'+bb+'. Фішки = гроші 1:1','gold');
    holdemDeal();
  }
  function holdemPost(pl,amt){
    const a=IB.M.min(amt,pl.chips);
    pl.chips-=a;pl.bet+=a;PKH.pot+=a;
    if(pl.chips<=0){pl.chips=0;pl.allin=true;}
    return a;
  }
  function holdemDeal(){
    PKH.deck=pokerDeck();PKH.community=[];PKH.pot=0;PKH.stage='preflop';
    PKH.hands++;
    for(const pl of PKH.players){pl.hole=[];pl.bet=0;pl.fold=false;pl.allin=false;pl.acted=false;pl.lastAct='';pl.eval=null;pl.evalHint=null;}
    const n=PKH.players.length;
    PKH.dealer=(PKH.dealer+1)%n;
    const sbI=(PKH.dealer+1)%n,bbI=(PKH.dealer+2)%n;
    PKH.sbP=sbI;PKH.bbP=bbI;
    holdemPost(PKH.players[sbI],PKH.sb);PKH.players[sbI].lastAct='SB ₴'+PKH.sb;
    holdemPost(PKH.players[bbI],PKH.bb);PKH.players[bbI].lastAct='BB ₴'+PKH.bb;
    for(let r=0;r<2;r++)for(const pl of PKH.players)pl.hole.push(PKH.deck.pop());
    PKH.betNeed=PKH.bb;
    PKH.turn=(bbI+1)%n;
    PKH.msg='Роздача: блайнди ₴'+PKH.sb+'/₴'+PKH.bb+' — ставки префлоп';
    IB.SFX.ui&&IB.SFX.ui();
  }
  function holdemActive(){return PKH.players.filter(pl=>!pl.fold&&!pl.allin);}
  function holdemRoundDone(){
    const act=holdemActive();
    if(act.length<=1)return true;
    for(const pl of act)if(!pl.acted||pl.bet<PKH.betNeed)return false;
    return true;
  }
  function holdemAI(pl){
    const toCall=PKH.betNeed-pl.bet;
    const potOdds=toCall/(PKH.pot+IB.M.max(1,toCall));
    let strength;
    if(PKH.stage==='preflop'){
      const v1=holdemCardVal(pl.hole[0]),v2=holdemCardVal(pl.hole[1]);
      const hi=(IB.M.max(v1,v2)+1)/13,lo=(IB.M.min(v1,v2)+1)/13;
      strength=0.28+hi*0.5+lo*0.18+(v1===v2?0.28:0)+(IB.M.abs(v1-v2)===1&&hi>0.6?0.06:0);
      strength-=potOdds*0.5;
    }else{
      const r=holdemBest(pl.hole.concat(PKH.community));
      const cat=r[0];
      strength=0.18+cat*0.13+(r[1]||0)/26;
      strength-=potOdds*0.45;
    }
    strength+=IB.rnd(-0.12,0.16); /* характер: Оксана акуратна, Іверо буйний */
    if(pl.nm==='Іверо')strength+=0.08;
    if(pl.nm==='Оксана')strength-=0.05;
    const a=pl.chips+pl.bet;
    if(strength<0.30){
      if(toCall<=0){pl.lastAct='ЧЕК';}
      else if(potOdds>0.35||toCall>=pl.chips){pl.fold=true;pl.lastAct='ФОЛД';}
      else{holdemPost(pl,toCall);pl.lastAct='КОЛ ₴'+toCall;}
    }else if(strength<0.52){
      if(toCall>0){holdemPost(pl,toCall);pl.lastAct='КОЛ ₴'+toCall;}
      else pl.lastAct='ЧЕК';
    }else if(strength<0.72){
      if(IB.M.random()<0.5&&pl.chips>PKH.bb*2){
        const target=PKH.betNeed+PKH.bb*2;
        const put=IB.M.min(IB.M.max(target-pl.bet,0),pl.chips);
        if(put>0){holdemPost(pl,put);PKH.betNeed=IB.M.max(PKH.betNeed,pl.bet);pl.lastAct='РАЙЗ ₴'+pl.bet;}
        else if(toCall>0){holdemPost(pl,toCall);pl.lastAct='КОЛ ₴'+toCall;}
        else pl.lastAct='ЧЕК';
      }else{
        if(toCall>0){holdemPost(pl,toCall);pl.lastAct='КОЛ ₴'+toCall;}
        else pl.lastAct='ЧЕК';
      }
    }else{
      const raise=PKH.betNeed+PKH.bb*IB.ri(2,4);
      const put=IB.M.min(IB.M.max(raise,toCall+PKH.bb),pl.chips+pl.bet-pl.bet);
      holdemPost(pl,put);
      PKH.betNeed=IB.M.max(PKH.betNeed,pl.bet);
      pl.lastAct='РАЙЗ ₴'+pl.bet;
    }
    pl.acted=true;
  }
  function holdemStep(){
    /* прогін раунду ставок; повертає true, якщо хід_hero — чекаємо тапу */
    for(let guard=0;guard<24;guard++){
      if(holdemRoundDone()){holdemNextStage();return false;}
      const pl=PKH.players[PKH.turn];
      if(pl.fold||pl.allin){PKH.turn=(PKH.turn+1)%PKH.players.length;continue;}
      if(pl.bet>=PKH.betNeed&&pl.acted){PKH.turn=(PKH.turn+1)%PKH.players.length;continue;}
      if(pl.hero)return true;   /* хід гравця — чекаємо кнопку */
      holdemAI(pl);
      PKH.turn=(PKH.turn+1)%PKH.players.length;
      return false;
    }
    holdemNextStage();return false;
  }
  function holdemNextStage(){
    for(const pl of PKH.players){pl.bet=0;pl.acted=false;}
    PKH.betNeed=0;
    const alive=PKH.players.filter(pl=>!pl.fold);
    if(alive.length<=1){
      const w=alive[0];
      w.chips+=PKH.pot;
      PKH.msg='💸 '+w.nm+' забирає банк ₴'+PKH.pot+' (усі зкинули)';
      PKH.pot=0;PKH.stage='done';
      return;
    }
    if(PKH.stage==='preflop'){PKH.stage='flop';
      PKH.community.push(PKH.deck.pop(),PKH.deck.pop(),PKH.deck.pop());
      PKH.msg='🎲 ФЛОП: '+PKH.community.join('  ');
    }else if(PKH.stage==='flop'){PKH.stage='turn';
      PKH.community.push(PKH.deck.pop());
      PKH.msg='🎲 ТЕРН: '+PKH.community[3];
    }else if(PKH.stage==='turn'){PKH.stage='river';
      PKH.community.push(PKH.deck.pop());
      PKH.msg='🎲 РІВЕР: '+PKH.community[4];
    }else{holdemShowdown();return;}
    PKH.turn=(PKH.dealer+1)%PKH.players.length;
    IB.SFX.ui&&IB.SFX.ui();
  }
  function holdemShowdown(){
    PKH.stage='showdown';
    const lines=[];
    let best=null,winners=[];
    for(const pl of PKH.players){
      if(pl.fold){lines.push(pl.nm+': зкинув');continue;}
      const r=holdemBest(pl.hole.concat(PKH.community));
      pl.eval=r;
      const nm=r?(pokerName(r)||'—'):'—';
      lines.push(pl.nm+': '+pl.hole.join(' ')+(pl.allin?' (ва-банк)':'')+' — '+nm);
      if(!best||pokerCmp(r,best)>0){best=r;winners=[pl];}
      else if(pokerCmp(r,best)===0)winners.push(pl);
    }
    const share=Math.floor(PKH.pot/winners.length);
    for(const w of winners){w.chips+=share;}
    PKH.pot-=share*winners.length;
    if(PKH.pot>0&&winners.length)winners[0].chips+=PKH.pot;
    PKH.pot=0;
    const hero=PKH.players[0];
    const win=winners.some(w=>w.hero);
    PKH.msg=(win?'🃏 БАНК ТВІЙ! ':'🃏 Банк забрав '+winners.map(w=>w.nm).join(' + ')+'. ')+
      (winners[0].eval?pokerName(winners[0].eval):'')+' — '+lines.join(' • ');
    PKH.stage='done';
    IB.G.stats.poker=(IB.G.stats.poker||0)+1;
    IB.journalAdd&&IB.journalAdd('🃏','Холдем у «Піраті»: рука №'+PKH.hands+' — '+(win?'ВИГРАШ':'програш')+'.');
    IB.SFX.done&&IB.SFX.done();
  }
  IB.holdemAct=(kind)=>{
    if(!PKH||PKH.stage==='deal'||PKH.stage==='done')return;
    const hero=PKH.players[0];
    if(PKH.players[PKH.turn]!==hero||hero.fold||hero.allin)return;
    const toCall=PKH.betNeed-hero.bet;
    if(kind==='fold'){hero.fold=true;hero.lastAct='ФОЛД';}
    else if(kind==='call'){
      if(toCall<=0)hero.lastAct='ЧЕК';
      else{holdemPost(hero,toCall);hero.lastAct='КОЛ ₴'+toCall;}
    }else if(kind==='raise'){
      const put=IB.M.min(toCall+PKH.bb*2,hero.chips);
      holdemPost(hero,put);
      PKH.betNeed=IB.M.max(PKH.betNeed,hero.bet);
      hero.lastAct='РАЙЗ ₴'+hero.bet;
    }else if(kind==='allin'){
      holdemPost(hero,hero.chips);
      PKH.betNeed=IB.M.max(PKH.betNeed,hero.bet);
      hero.lastAct='ВА-БАНК!';
    }
    hero.acted=true;
    IB.SFX.ui&&IB.SFX.ui();
    PKH.turn=(PKH.turn+1)%PKH.players.length;
    PKH.wait=0;
  };
  IB.holdemNextHand=()=>{
    if(!PKH)return;
    const hero=PKH.players[0];
    if(hero.chips<=0){IB.holdemStand();return;}
    if(PKH.players.slice(1).every(pl=>pl.chips<=0)){
      IB.toast('🃏 Стіл обіднів — усі місцеві без фішок! Ти забрав їхні гроші','gold');
      IB.holdemStand();return;
    }
    for(const pl of PKH.players)if(pl.chips<PKH.bb)pl.chips+=PKH.buy/2; /* докупляємо фішок місцевим */
    holdemDeal();
  };
  IB.holdemStand=(escKey)=>{
    if(!PKH)return;
    const hero=PKH.players[0];
    const back=hero.chips;
    IB.G.money+=back;
    const net=IB.M.round(back-PKH.buy);
    IB.toast('🃏 Ти встаєш з-за столу: фішки → ₴'+back+' ('+(net>=0?'+':'')+net+' ₴)','gold');
    IB.showScene('🃏','ПОКЕР: ТИ ВСТАВ З-ЗА СТОЛУ','Бармен міняє фішки на ₴'+back+'. Рук зіграно: '+PKH.hands+'. «Мурзик вимагає реваншу щоп\'ятниці». '+(net>=0?'Вечір у плюсі!':'Наступного разу — акуратніше з блефом.'));
    IB.journalAdd&&IB.journalAdd('🃏','Холдем завершено: рук '+PKH.hands+', баланс '+(net>=0?'+':'')+net+' ₴.');
    PKH=null;mode='game';IB.questCheck&&IB.questCheck();
  };
  IB.holdemTap=(mx,my)=>{
    if(!PKH)return;
    for(const b of PKH.btns)if(mx>=b.x&&mx<=b.x+b.w&&my>=b.y&&my<=b.y+b.h){b.f();return;}
  };
  /* ---------- v18.6: ВЕЛИКІ СЕНСОРНІ КНОПКИ РЕЖИМІВ ІГОР ----------
     Гравець (з телефона): «режими ігор — не вистачає кнопок на мобільному,
     збільшуй кнопки УДАР / ПАС». У матчі 3×2 і в покері звичайний actpad
     ховається, замість нього — великі кнопки справа (#matchpad / #pokerpad). */
  IB.matchAct=(kind)=>{
    if(mode==='vball'&&VB){vbAct(kind);return;}
    if(!MT)return;
    const b=MT.ball;
    if(kind==='pass'){
      if(b.owner&&b.owner.team===0)mtPass(b.owner);
      else if(!b.free)IB.toast('М\'яч не у нас — відбирай!');
    }else if(kind==='kick'){
      if(b.owner&&b.owner.team===0)mtShoot(b.owner);
      else IB.toast('Спершу візьми м\'яч!');
    }else if(kind==='end'){
      mtEnd(null,MT.score[0]+':'+MT.score[1]);
    }
  };
  IB.pokerAct=(kind)=>{
    if(!PKH)return;
    if(kind==='fold'||kind==='call'||kind==='raise'||kind==='allin')IB.holdemAct(kind);
    else if(kind==='next'&&PKH.stage==='done')IB.holdemNextHand();
    else if(kind==='stand')IB.holdemStand(true);
  };
  IB.syncPads=(()=>{
    let sig='';
    const sync=()=>{
      const mp=IB.$('matchpad'),pp=IB.$('pokerpad'),ap=IB.$('actpad'),dp=IB.$('dpad');
      if(!mp||!pp)return;
      const m=(mode==='match'||mode==='vball'),p=mode==='poker';
      let heroTurn=false,done=false,toCall=0,raise=0;
      if(p&&PKH){
        const hero=PKH.players[0];
        heroTurn=PKH.stage!=='done'&&PKH.players[PKH.turn]===hero&&!hero.fold&&!hero.allin;
        done=PKH.stage==='done';
        toCall=PKH.betNeed-hero.bet;
        raise=toCall+PKH.bb*2;
      }
      const show=mode==='clubshow';
      const s=(m?'m':p?'p':show?'s':'-')+(heroTurn?'h':'-')+(done?'d':'-')+'|'+toCall+'|'+raise;
      if(s===sig)return;
      sig=s;
      mp.classList.toggle('show',m);
      pp.classList.toggle('show',p);
      const sx=IB.$('show-x');if(sx)sx.classList.toggle('show',show);
      if(ap)ap.style.display=(m||p||show)?'none':'';
      if(dp)dp.style.display=p?'none':'';
      const kl=IB.$('mp-kicklbl');if(kl&&m)kl.textContent=((MT&&MT.type==='foot')||mode==='vball')?'УДАР':'КИДОК';
      const a1=IB.$('pk-acts'),a2=IB.$('pk-acts2'),dn=IB.$('pk-done');
      if(a1)a1.style.display=heroTurn?'flex':'none';
      if(a2)a2.style.display=heroTurn?'flex':'none';
      if(dn)dn.style.display=done?'flex':'none';
      const cl=IB.$('pk-calllbl');if(cl)cl.textContent=heroTurn?(toCall>0?('КОЛ ₴'+toCall):'ЧЕК'):'КОЛ';
      const rl=IB.$('pk-raiselbl');if(rl)rl.textContent=heroTurn?('РАЙЗ ₴'+raise):'РАЙЗ';
    };
    return sync;
  })();
  function bindPads(){
    const padBtn=(id,f)=>{
      const el=IB.$(id);if(!el)return;
      let lastT=0;
      const on=ev=>{ev.preventDefault();lastT=performance.now();f();};
      el.addEventListener('touchstart',on,{passive:false});
      el.addEventListener('mousedown',on);
      el.addEventListener('click',ev=>{if(performance.now()-lastT<500)return;ev.preventDefault();f();});
    };
    padBtn('mp-pass',()=>IB.matchAct('pass'));
    padBtn('mp-kick',()=>IB.matchAct('kick'));
    padBtn('mp-end',()=>IB.matchAct('end'));
    padBtn('pk-fold',()=>IB.pokerAct('fold'));
    padBtn('pk-call',()=>IB.pokerAct('call'));
    padBtn('pk-raise',()=>IB.pokerAct('raise'));
    padBtn('pk-allin',()=>IB.pokerAct('allin'));
    padBtn('pk-next',()=>IB.pokerAct('next'));
    padBtn('pk-stand',()=>IB.pokerAct('stand'));
    padBtn('show-x',()=>IB.clubShowEnd&&IB.clubShowEnd());
  }
  IB.holdemKeys=(dt)=>{
    if(!PKH)return;
    if(consume('1'))IB.holdemAct('fold');
    if(consume('2'))IB.holdemAct('call');
    if(consume('3'))IB.holdemAct('raise');
    if(consume('4'))IB.holdemAct('allin');
    if(PKH.stage==='done'){
      if(consume('e')||consume('enter')||consume('space'))IB.holdemNextHand();
    }
  };
  function holdemDrawCard(g,x,y,c,big){
    const w=big?26:20,h=big?36:28;
    const su=c.slice(-1);
    const red=(su==='♥'||su==='♦');
    g.fillStyle='#f6f3e8';IB.P(g,x,y,w,h,'#f6f3e8');
    g.strokeStyle='#20242a';g.lineWidth=1;g.strokeRect(x+0.5,y+0.5,w-1,h-1);
    g.fillStyle=red?'#d03a3a':'#20242a';
    g.font='bold '+(big?9:7)+'px monospace';
    g.fillText(c.slice(0,-1),x+3,y+(big?11:9));
    g.font=(big?10:8)+'px monospace';
    g.fillText(su,x+3,y+(big?24:20));
  }
  IB.drawHoldem=(g,dt)=>{
    IB.holdemKeys&&IB.holdemKeys(dt);
    if(!PKH){mode='game';return;}
    const VW2=IB.GFX.VW||480,VH2=IB.GFX.VH||336;
    /* прогін AI-ходів з паузою */
    PKH.t+=dt;
    if(PKH.stage!=='done'&&PKH.stage!=='deal'){
      const cur=PKH.players[PKH.turn];
      const heroTurn=cur&&cur.hero&&!cur.fold&&!cur.allin;
      if(!heroTurn){
        if(PKH.t>0.7){PKH.t=0;holdemStep();}
      }else{PKH.t=0;}
      if(holdemRoundDone()&&PKH.stage!=='done'&&PKH.stage!=='showdown'){
        if(PKH.t>0.45){PKH.t=0;holdemNextStage();}
      }
    }
    /* стіл */
    g.fillStyle='#0b0f14';g.fillRect(0,0,VW2,VH2);
    const cx=VW2/2,cy=VH2*0.34,rw=IB.M.min(VW2*0.44,190),rh=rw*0.62;
    g.fillStyle='#184a34';g.beginPath();g.ellipse(cx,cy,rw,rh,0,0,7);g.fill();
    g.strokeStyle='#7a5a2e';g.lineWidth=6;g.stroke();
    g.strokeStyle='#2e2013';g.lineWidth=2;g.beginPath();g.ellipse(cx,cy,rw-5,rh-5,0,0,7);g.stroke();
    g.fillStyle='#e8dcb0';g.font='6px monospace';g.textAlign='center';
    g.fillText('БАР «ПІРАТ» • ТЕХАСЬКИЙ ХОЛДЕМ ₴'+PKH.buy,cx,cy-rh+14);
    g.fillText('БАНК: ₴'+PKH.pot+' • БЛАЙНДИ ₴'+PKH.sb+'/₴'+PKH.bb,cx,cy-2);
    /* спільні карти */
    const cw=20,ch=28;
    for(let i=0;i<5;i++){
      const x=cx-((5*cw+16)/2)+i*(cw+4);
      if(PKH.community[i])holdemDrawCard(g,x,cy+8,PKH.community[i],false);
      else{g.fillStyle='#12201980';IB.P(g,x,cy+8,cw,ch,'#122019');g.strokeStyle='#24402e';g.strokeRect(x+0.5,cy+8.5,cw-1,ch-1);}
    }
    /* місця */
    const seats=[];
    const n=PKH.players.length;
    for(let i=0;i<n;i++){
      const ang=-Math.PI/2+i*(Math.PI*2/n)*0.86+(i===0?0:0.12);
      seats.push({x:cx+IB.M.cos(ang)*(rw+18),y:cy+IB.M.sin(ang)*(rh+26),i});
    }
    PKH.btns=[];
    for(const s of seats){
      const pl=PKH.players[s.i];
      const isHero=!!pl.hero;
      g.textAlign='center';
      g.fillStyle=pl.fold?'#5a6068':(isHero?'#f0d050':'#c8d8d0');
      g.font='bold 7px monospace';
      g.fillText(pl.nm+(PKH.dealer===s.i?' • D':''),s.x,s.y-16);
      g.font='6px monospace';
      g.fillStyle='#9ab0a8';
      g.fillText('фішки ₴'+pl.chips+(pl.bet?' • ставка ₴'+pl.bet:''),s.x,s.y-7);
      if(pl.lastAct&&PKH.stage!=='done'){g.fillStyle=pl.fold?'#e07060':'#7ce0e8';g.fillText(pl.lastAct,s.x,s.y+34);}
      /* карти */
      if(pl.hole.length){
        if(isHero||PKH.stage==='showdown'){
          holdemDrawCard(g,s.x-cw-2,s.y-4,pl.hole[0],isHero);
          holdemDrawCard(g,s.x+2,s.y-4,pl.hole[1],isHero);
        }else{
          g.fillStyle='#1a3a5a';IB.P(g,s.x-cw-2,s.y-2,cw,ch-2,'#1a3a5a');IB.P(g,s.x+2,s.y-2,cw,ch-2,'#1a3a5a');
          g.strokeStyle='#3e5a78';g.strokeRect(s.x-cw-2+0.5,s.y-2+0.5,cw-1,ch-3);g.strokeRect(s.x+2+0.5,s.y-2+0.5,cw-1,ch-3);
          g.fillStyle='#3e5a78';g.font='7px monospace';g.fillText('★',s.x-cw/2,s.y+12);g.fillText('★',s.x+cw/2+2,s.y+12);
        }
      }
      /* оцінка руки героя (підказка) */
      if(isHero&&pl.hole.length&&PKH.stage!=='preflop'&&pl.eval===undefined&&!pl.fold){
        pl.evalHint=holdemBest(pl.hole.concat(PKH.community));
      }
      if(isHero&&pl.evalHint&&!pl.fold){
        g.fillStyle='#e8d050';g.font='6px monospace';
        g.fillText('у тебе: '+(pokerName(pl.evalHint)||'—'),s.x,s.y+44);
      }
    }
    /* хід гравця — кнопки (v18.6: коли показані ВЕЛИКІ сенсорні кнопки
       #pokerpad — канвас-кнопки не малюємо, щоб не дублювати) */
    const hero=PKH.players[0];
    const heroTurn=PKH.stage!=='done'&&PKH.players[PKH.turn]===hero&&!hero.fold&&!hero.allin;
    const padEl=IB.$('pokerpad'),padShow=!!(padEl&&padEl.classList.contains('show'));
    if(PKH.stage==='done'){
      if(!padShow){
        holdemBtn(g,VW2/2-120,VH2-74,110,30,'▶ НОВА РОЗДАЧА (E)',()=>IB.holdemNextHand());
        holdemBtn(g,VW2/2+10,VH2-74,110,30,'🏁 ВСТАТИ (+фішки)',()=>IB.holdemStand());
      }
    }else if(heroTurn){
      const toCall=PKH.betNeed-hero.bet;
      if(!padShow){
        holdemBtn(g,VW2/2-176,VH2-74,84,30,'✖ ФОЛД (1)',()=>IB.holdemAct('fold'));
        holdemBtn(g,VW2/2-88,VH2-74,84,30,toCall>0?'✔ КОЛ ₴'+toCall+' (2)':'✔ ЧЕК (2)',()=>IB.holdemAct('call'));
        holdemBtn(g,VW2/2,VH2-74,84,30,'⬆ РАЙЗ ₴'+(toCall+PKH.bb*2)+' (3)',()=>IB.holdemAct('raise'));
        holdemBtn(g,VW2/2+88,VH2-74,88,30,'💥 ВА-БАНК (4)',()=>IB.holdemAct('allin'));
      }
    }else{
      g.fillStyle='#78908a';g.font='7px monospace';
      g.fillText('Хід: '+((PKH.players[PKH.turn]||{}).nm||'—')+'...',cx,VH2-58);
    }
    /* повідомлення */
    g.textAlign='center';g.font='6.5px monospace';g.fillStyle='#c8d8d0';
    const msg=PKH.msg||'';
    const mlen=IB.M.max(20,IB.M.floor(VW2/4.2));
    for(let i=0;i*mlen<msg.length;i++)g.fillText(msg.slice(i*mlen,(i+1)*mlen),cx,VH2-44+i*8);
    g.fillStyle='#78908a';g.fillText('ESC — встати з-за столу',cx,VH2-8);
    g.textAlign='left';
  };
  function holdemBtn(g,x,y,w,h,label,f){
    if(!PKH)return;
    PKH.btns.push({x,y,w,h,f});
    g.fillStyle='#1e3040';IB.P(g,x,y,w,h,'#1e3040');
    g.strokeStyle='#f0d050';g.lineWidth=1.4;g.strokeRect(x+0.5,y+0.5,w-1,h-1);
    g.fillStyle='#f0d050';g.font='6.5px monospace';g.textAlign='center';
    g.fillText(label,x+w/2,y+h/2+2.4);
    g.textAlign='left';
  }

  /* ================= v16.0: МАТЧІ ОКРЕМИМИ РЕЖИМАМИ =================
     ⚽ ФУТБОЛ 3×2 — ПАС І УДАР; 🏀 БАСКЕТБОЛ 3×2 — ПАС І КИДОК.
     Джойстик/WASD веде активного гравця, E — пас, ✊ (X) — удар/кидок.
     Поле, ворота/кошик, рахунок, час 90с, ставки з місцевими. */
  let MT=null;
  const MT_TEAM='#f0d050',MT_OPP='#e05a5a',MT_GK='#3aa0e0';
  function startFootball(){
    closePanel();closeDlg();IB.closeActMenu&&IB.closeActMenu();
    const L=IB.E.team[0];
    MT={type:'foot',W:100,H:64,score:[0,0],t:90,stake:60,
      ball:{x:48,y:32,vx:0,vy:0,owner:null,free:false,cool:0},
      ps:[],msg:'⚽ ФУТБОЛ 3×2 — ПАС (E) І УДАР (✊). НАПАДАЄМО ВПРАВО!',end:0,flash:0,shake:0};
    /* наші: лідер + 2 (польові) + воротар не рахується у 3×2? — 3 поля: GK-роль у одного з трьох */
    MT.ps.push({x:48,y:32,team:0,hero:L,sp:20,nm:L.name,dir:1});           /* активний з м'ячем */
    const mates=IB.E.team.filter(h=>h!==L);
    MT.ps.push({x:26,y:22,team:0,hero:mates[0]||null,sp:17,nm:mates[0]?mates[0].name:'DIIN',role:'gk',dir:1});
    MT.ps.push({x:30,y:42,team:0,hero:mates[1]||null,sp:18,nm:mates[1]?mates[1].name:'PABLO',dir:1});
    MT.ps.push({x:74,y:24,team:1,sp:16,nm:'МЕСНИЙ 1',dir:-1});
    MT.ps.push({x:74,y:40,team:1,sp:16,nm:'МЕСНИЙ 2',dir:-1});
    for(const pl of MT.ps){pl.kx=pl.x;pl.ky=pl.y;} /* v16: кік-оф позиції */
    if(!IB.payPocket(L.id,60)){IB.toast('Нужна ₴60 на ставку місцевим','red');MT=null;return;}
    mode='match';IB.toast('⚽ МАТЧ ПОЧАВСЯ! Ставка ₴60 — перемога ₴150','gold');IB.SFX.done&&IB.SFX.done();
  }
  function startBball(){
    closePanel();closeDlg();IB.closeActMenu&&IB.closeActMenu();
    const L=IB.E.team[0];
    MT={type:'bball',W:50,H:50,score:[0,0],t:75,stake:60,
      ball:{x:25,y:38,vx:0,vy:0,owner:null,free:false,cool:0,arc:0,good:false,tx:0,ty:0},
      ps:[],msg:'🏀 БАСКЕТБОЛ 3×2 — ПАС (E) І КИДОК (✊). КОШИК ВГОРІ!',end:0,flash:0,shake:0};
    const mates=IB.E.team.filter(h=>h!==L);
    MT.ps.push({x:25,y:38,team:0,hero:L,sp:20,nm:L.name,dir:-1});
    MT.ps.push({x:12,y:30,team:0,hero:mates[0]||null,sp:18,nm:mates[0]?mates[0].name:'TOXIC',dir:-1});
    MT.ps.push({x:38,y:30,team:0,hero:mates[1]||null,sp:18,nm:mates[1]?mates[1].name:'ROCK',dir:-1});
    MT.ps.push({x:20,y:14,team:1,sp:16,nm:'ДВІРОВИЙ',dir:1});
    MT.ps.push({x:30,y:14,team:1,sp:16,nm:'КАЧОК',dir:1});
    for(const pl of MT.ps){pl.kx=pl.x;pl.ky=pl.y;} /* v16: кік-оф позиції */
    if(!IB.payPocket(L.id,60)){IB.toast('Нужна ₴60 на ставку','red');MT=null;return;}
    MT.ball.owner=MT.ps[0];
    mode='match';IB.toast('🏀 МАТЧ ПОЧАВСЯ! Ставка ₴60 — перемога ₴150','gold');IB.SFX.done&&IB.SFX.done();
  }
  function mtEnd(win,sc){
    const L=IB.E.team[0];const st=MT.stake;mode='game';
    IB.G.stats[MT.type==='foot'?'football':'bball']=(IB.G.stats[MT.type==='foot'?'football':'bball']||0)+1;
    /* v18 С3: матч проти «Східних» — перемога рахується у суперництві;
       v18 С7: день баскетболу — приз ×2 */
    const evBasket=(IB.eventToday&&IB.eventToday()==='basket'&&MT.type==='bball');
    const winPay=evBasket?180:90;
    if(win){L.pocket=(L.pocket||0)+st+winPay;L.mood=IB.clamp(L.mood+14,0,100);
      if(IB.rivalMatch&&MT.type==='foot'){const R=IB.G.rivals=IB.G.rivals||{met:false,wins:{f:0,b:0,r:0},finale:0};R.wins.f=(R.wins.f||0)+1;IB.toast('«Східні» знесені на їхньому ж майданчику!','gold');}
      IB.tx&&IB.tx(L.name,winPay,'перемога у '+(MT.type==='foot'?'футболі':'баскетболі')+' 3×2');
      IB.banner(MT.type==='foot'?'⚽ ПЕРЕМОГА У ФУТБОЛІ 3×2!':'🏀 ПЕРЕМОГА В БАСКЕТБОЛІ 3×2!');
      IB.showScene(MT.type==='foot'?'⚽':'🏀','МАТЧ ВИГРАНО '+sc,'Місцеві віддають ставку і ₴'+winPay+' зверху: «Вчіть пасу, панове!» Пісок летить, пляж гуде — ЛЕГЕНДАРНІ БЕРЕТЬ ДОЩАТКУ.');
      IB.journalAdd(MT.type==='foot'?'⚽':'🏀','Матч 3×2: '+sc+' — перемога, +₴'+winPay+' у кишеню.');
    }else if(win===false){L.mood=IB.clamp(L.mood-4,0,100);
      if(IB.rivalMatch&&MT.type==='foot')IB.toast('«Східні» святкують. Реванш — обов\'язковий','red');
      IB.banner(MT.type==='foot'?'⚽ МАТЧ ПРОГРАНО':'🏀 МАТЧ ПРОГРАНО');
      IB.showScene('😔','МАТЧ ПРОГРАНО '+sc,'Ставка ₴60 залишилась у місцевих. «Реванш завтра!» — крикнуть вслід. Зате засмага ідеально рівна.');
      IB.journalAdd(MT.type==='foot'?'⚽':'🏀','Матч 3×2: '+sc+' — програш ставки ₴60.');
    }else{
      L.pocket=(L.pocket||0)+st;
      IB.showScene('🤝','НІЧИЯ '+sc,'Ставку повертають: «Ніхто не переміг — все чесно». М\'яч до останньої секунди літав над піском.');
      IB.journalAdd('🤝','Матч 3×2: нічия '+sc+'.');
    }
    L.hp=IB.clamp(L.hp-12,0,100);L.water=IB.clamp(L.water-12,0,100);
    for(const h of IB.E.team)h.mood=IB.clamp(h.mood+6,0,100);
    IB.skillXP&&IB.skillXP(L,'str',10);
    IB.rivalMatch=false;
    MT=null;IB.questCheck&&IB.questCheck();
  }
  function mtGoal(side){ /* side 0 = забили у праві ворота (наші гол), 1 = у ліві */
    MT.score[side===0?0:1]++;
    MT.flash=1;MT.shake=0.5;
    MT.msg=side===0?'⚽ ГОООЛ! ЛЕГЕНДАРНІ!':'⚽ ГОЛ МІСЦЕВИХ...';
    IB.SFX.done&&IB.SFX.done();
    const b=MT.ball;
    b.owner=null;b.free=false;b.vx=0;b.vy=0;b.cool=0.8;
    if(MT.score[0]>=5||MT.score[1]>=5){setTimeout(()=>{if(MT)mtEnd(MT.score[0]>MT.score[1],MT.score[0]+':'+MT.score[1]);},900);MT.msg+=' — МАТЧ ЗАВЕРШЕНО!';return;}
    /* кік-оф */
    for(const pl of MT.ps){pl.x=pl.kx;pl.y=pl.ky;}
    b.x=MT.W/2;b.y=MT.H/2;
  }
  function mtBasket(good,team){
    MT.flash=1;
    if(good){MT.score[team||0]+=2;MT.msg=team?'🏀 Місцеві забили...':'🏀 КИДОК ЗАРАХОВАНО! +2';IB.SFX.done&&IB.SFX.done();
      if(MT.score[1]>=12&&!MT.end){MT.end=1;setTimeout(()=>{if(MT)mtEnd(false,MT.score[0]+':'+MT.score[1]);},700);MT.msg+=' — МАТЧ ЗАВЕРШЕНО!';}}
    else{MT.msg='🏀 Мимо — відбій!';}
    const b=MT.ball;b.owner=null;b.free=true;b.arc=0;b.cool=0.5;
    b.x=25;b.y=8;b.vx=(IB.M.random()*2-1)*6;b.vy=IB.rnd(5,9);
    if(MT.score[0]>=12){setTimeout(()=>{if(MT)mtEnd(true,MT.score[0]+':'+MT.score[1]);},700);MT.msg+=' — МАТЧ ЗАВЕРШЕНО!';}
  }
  function mtDist(a,b){return IB.M.hypot(a.x-b.x,a.y-b.y);}
  function mtPass(pl){
    const b=MT.ball;
    const mates=MT.ps.filter(o=>o.team===0&&o!==pl);
    let best=null,bs=-1e9;
    for(const m of mates){
      const fwd=MT.type==='foot'?(m.x-pl.x):(pl.y-m.y);
      const s=fwd*1.2-mtDist(pl,m)*0.35;
      if(s>bs){bs=s;best=m;}
    }
    if(!best)return;
    const d=IB.M.max(1,mtDist(pl,best));
    b.owner=null;b.free=true;b.cool=0.15;
    b.vx=(best.x-pl.x)/d*30;b.vy=(best.y-pl.y)/d*30;
    b.passTo=best;
    MT.msg='↔ Пас на '+best.nm;
    IB.SFX.ui&&IB.SFX.ui();
  }
  function mtShoot(pl){
    const b=MT.ball;
    if(MT.type==='foot'){
      const gy=32+IB.rnd(-3,3)*(pl.hero&&IB.skillLv?IB.M.max(0.4,1-(IB.skillLv(pl.hero,'str')||0)*0.08):1);
      const d=IB.M.max(1,IB.M.hypot(100-pl.x,gy-pl.y));
      b.owner=null;b.free=true;b.cool=0.2;
      b.vx=(100-pl.x)/d*46;b.vy=(gy-pl.y)/d*46;
      MT.msg='🔥 УДАР!';
    }else{
      const dist=IB.M.hypot(pl.x-25,pl.y-3);
      const sk=(pl.hero&&IB.skillLv)?(IB.skillLv(pl.hero,'str')||0)*0.06:0;
      const def=MT.ps.some(o=>o.team===1&&mtDist(o,pl)<5)?0.18:0;
      const good=IB.M.random()<(IB.M.max(0.08,0.85-dist*0.012+sk-def));
      b.owner=null;b.free=true;b.arc=1;b.good=good;b.shootTeam=0;
      b.tx=25;b.ty=3;
      MT.msg=good?'🏀 КИДОК!':'🏀 Кидок...';
    }
    IB.SFX.ui&&IB.SFX.ui();
  }
  IB.startMatch={foot:startFootball,bball:startBball}; /* v16: хук для тестів */
  IB.matchKeys=(dt)=>{
    if(!MT)return;
    const mv=moveVec();
    const b=MT.ball;
    /* активний гравець: власник м'яча, інакше найближчий наш */
    let ctrl=b.owner&&b.owner.team===0?b.owner:null;
    if(!ctrl){let bd=1e9;for(const pl of MT.ps){if(pl.team!==0)continue;const d=mtDist(pl,b);if(d<bd){bd=d;ctrl=pl;}}}
    MT.ctrl=ctrl;
    if(ctrl){
      const sp=(keys.shift?ctrl.sp*1.28:ctrl.sp);
      ctrl.x=IB.clamp(ctrl.x+mv.x*sp*dt,1,MT.W-1);
      ctrl.y=IB.clamp(ctrl.y+mv.y*sp*dt,1,MT.H-1);
      if(mv.x||mv.y)ctrl.dir=MT.type==='foot'?(mv.x||0.0001):(mv.y||0.0001);
      if(b.owner===ctrl){
        b.x=ctrl.x+(MT.type==='foot'?ctrl.dir*1.3:0);
        b.y=ctrl.y+(MT.type==='foot'?0:1.4);
        b.vx=b.vy=0;
      }
    }
    if(consume('e')||consume('enter')){
      if(b.owner&&b.owner.team===0)mtPass(b.owner);
      else if(!b.free)IB.toast('М\'яч не у нас — відбирай!');
    }
    if(consume('atk')||consume('space')){
      if(b.owner&&b.owner.team===0)mtShoot(b.owner);
      else IB.toast('Спершу візьми м\'яч!');
    }
    if(consume('esc')){mtEnd(null,MT.score[0]+':'+MT.score[1]);}
  };
  IB.matchTick=(dt)=>{
    if(!MT)return;
    const b=MT.ball;
    MT.t-=dt;
    if(MT.flash>0)MT.flash-=dt*1.4;
    if(MT.shake>0)MT.shake-=dt;
    if(MT.t<=0&&!MT.end){MT.end=1;const s=MT.score;setTimeout(()=>{if(MT)mtEnd(s[0]>s[1]?true:(s[0]===s[1]?null:false),s[0]+':'+s[1]);},400);return;}
    if(b.cool>0)b.cool-=dt;
    /* вільний м'яч */
    if(b.free){
      b.x+=b.vx*dt;b.y+=b.vy*dt;b.vx*=0.985;b.vy*=0.985;
      if(MT.type==='foot'){
        if(b.x<0.9||b.x>MT.W-0.9){
          const inMouth=b.y>24&&b.y<40;
          if(inMouth&&b.x>MT.W-0.9&&b.vx>0)mtGoal(0);
          else if(inMouth&&b.x<0.9&&b.vx<0)mtGoal(1);
          else{b.x=IB.clamp(b.x,1.2,MT.W-1.2);b.vx*=-0.5;}
        }
        if(b.y<1||b.y>MT.H-1){b.y=IB.clamp(b.y,1,MT.H-1);b.vy*=-0.5;}
        if(IB.M.abs(b.vx)<0.6&&IB.M.abs(b.vy)<0.6){b.free=false;b.vx=0;b.vy=0;}
      }else{
        if(b.arc){b.arc+=dt*2.6;
          if(b.arc>=1){b.arc=0;mtBasket(b.good,b.shootTeam||0);}
        }else{
          b.x+=b.vx*dt;b.y+=b.vy*dt;
          if(b.y<1){b.y=1;b.vy*=-0.5;}
          if(b.x<1||b.x>MT.W-1){b.x=IB.clamp(b.x,1,MT.W-1);b.vx*=-0.5;}
          if(IB.M.abs(b.vx)<0.5&&IB.M.abs(b.vy)<0.5){b.free=false;}
        }
      }
      /* підбір */
      if(!b.arc&&b.cool<=0){
        for(const pl of MT.ps){
          if(mtDist(pl,b)<1.8){b.owner=pl;b.free=false;b.passTo=null;break;}
        }
      }
    }
    /* AI: партнери і суперники */
    let oppHas=b.owner&&b.owner.team===1;
    for(const pl of MT.ps){
      if(pl===MT.ctrl)continue;
      if(pl.team===0){
        if(pl.role==='gk'){ /* тримає ворота */
          const gx=MT.type==='foot'?8:12;
          pl.x+=(gx-pl.x)*dt*2;
          const ty=IB.clamp(b.y,20,44);
          pl.y+=(ty-pl.y)*dt*2.2;
          if(!b.owner&&mtDist(pl,b)<2.2&&b.cool<=0){b.owner=pl;b.free=false;}
          continue;
        }
        if(b.owner===pl)continue;
        if(b.owner&&b.owner.team===0){ /* тримаєм м'яч: розкриваємось */
          const o=b.owner;
          const tx=MT.type==='foot'?IB.clamp(o.x+14,2,MT.W-6):IB.clamp(o.x+(pl.x<25?4:-4),2,48);
          const ty=MT.type==='foot'?IB.clamp(o.y+(pl.y<o.y?-9:9),2,MT.H-2):IB.clamp(o.y-10,2,48);
          pl.x+=(tx-pl.x)*dt*1.6;pl.y+=(ty-pl.y)*dt*1.6;
        }else{ /* відбір/підбір: до м'яча */
          const d=IB.M.max(0.5,mtDist(pl,b));
          pl.x+=(b.x-pl.x)/d*pl.sp*dt;pl.y+=(b.y-pl.y)/d*pl.sp*dt;
        }
      }else{
        if(b.owner===pl){ /* ведемо до наших воріт і б\'ємо */
          const gx=MT.type==='foot'?0:25, gy=MT.type==='foot'?32:3;
          const d=IB.M.max(0.5,IB.M.hypot(gx-pl.x,gy-pl.y));
          pl.x+=(gx-pl.x)/d*pl.sp*0.85*dt;pl.y+=(gy-pl.y)/d*pl.sp*0.85*dt;
          const gd=MT.type==='foot'?IB.M.abs(pl.x-0):IB.M.hypot(pl.x-25,pl.y-3);
          if(gd<(MT.type==='foot'?24:9)&&IB.M.random()<dt*1.1){
            const b2=MT.ball;
            if(MT.type==='foot'){
              const ty=32+IB.rnd(-4,4);const dd=IB.M.max(1,IB.M.hypot(pl.x,ty-pl.y));
              b2.owner=null;b2.free=true;b2.cool=0.2;b2.vx=(0-pl.x)/dd*42;b2.vy=(ty-pl.y)/dd*42;
            }else{
              const good=IB.M.random()<(IB.M.hypot(pl.x-25,pl.y-3)<12?0.5:0.3);
              b2.owner=null;b2.free=true;b2.arc=1;b2.good=good;b2.shootTeam=1;
              b2.tx=25;b2.ty=3;
              MT.msg='🏀 Кидок місцевих!';
            }
          }
        }else{
          const chase=(b.owner&&b.owner.team===1)?(IB.M.abs(pl.x-b.x)>18):true;
          const tx2=chase?b.x:(b.x+(MT.type==='foot'?-8:6));
          const d=IB.M.max(0.5,IB.M.hypot(tx2-pl.x,b.y-pl.y));
          pl.x+=(tx2-pl.x)/d*pl.sp*dt;pl.y+=(b.y-pl.y)/d*pl.sp*dt;
        }
      }
      pl.x=IB.clamp(pl.x,1,MT.W-1);pl.y=IB.clamp(pl.y,1,MT.H-1);
    }
    /* відбирання м'яча у власника */
    if(b.owner){
      for(const pl of MT.ps){
        if(pl.team===b.owner.team||pl===b.owner)continue;
        if(mtDist(pl,b.owner)<2.1&&b.cool<=0&&IB.M.random()<dt*(pl.team===1?0.55:0.5)){
          b.owner=pl;b.free=false;b.cool=0.4;
          MT.msg=pl.team===0?'✊ Відібрав '+pl.nm+'!':'✊ Місцеві відібрали...';
          break;
        }
      }
    }
    if(MT.type==='foot'&&MT.score[1]>=5&&!MT.end){MT.end=1;setTimeout(()=>{if(MT)mtEnd(false,MT.score[0]+':'+MT.score[1]);},600);}
  };
  IB.drawMatch=(g,dt)=>{
    IB.matchTick&&IB.matchTick(dt);
    if(!MT){mode='game';return;}
    const VW2=IB.GFX.VW||480,VH2=IB.GFX.VH||336;
    g.fillStyle='#08101c';g.fillRect(0,0,VW2,VH2);
    const shake=MT.shake>0?IB.M.sin(performance.now()*0.07)*3:0;
    g.save();g.translate(shake,0);
    const mx=IB.M.max(14,VW2*0.1),mtop=IB.M.max(34,VH2*0.1),mbot=IB.M.max(58,VH2*0.16);
    const fw=VW2-mx*2,fh=VH2-mtop-mbot;
    const X=u=>mx+u/MT.W*fw,Y=u=>mtop+u/MT.H*fh;
    /* поле */
    if(MT.type==='foot'){
      for(let i=0;i<10;i++){g.fillStyle=i%2?'#2e7a3e':'#2f8142';g.fillRect(mx+i*fw/10,mtop,fw/10+1,fh);}
      g.strokeStyle='#e8f0e8';g.lineWidth=2;g.strokeRect(mx,mtop,fw,fh);
      g.beginPath();g.moveTo(mx+fw/2,mtop);g.lineTo(mx+fw/2,mtop+fh);g.stroke();
      g.beginPath();g.arc(mx+fw/2,mtop+fh/2,IB.M.min(fh/4,18),0,7);g.stroke();
      /* ворота */
      for(const side of [0,1]){
        const gx=side?mx+fw:mx;
        g.fillStyle='#f0f0ea';g.fillRect(gx-2,Y(24)-2,4,Y(40)-Y(24)+4);
        g.strokeStyle='#f0f0ea';g.lineWidth=1;
        for(let i=1;i<6;i++){const yy=Y(24)+(Y(40)-Y(24))*i/6;g.beginPath();g.moveTo(gx,yy);g.lineTo(gx+(side?10:-10),yy);g.stroke();}
      }
    }else{
      g.fillStyle='#c8843c';g.fillRect(mx,mtop,fw,fh);
      for(let i=0;i<6;i++){g.fillStyle=i%2?'#c8843c':'#bd7c36';g.fillRect(mx+i*fw/6,mtop,fw/6+1,fh);}
      g.strokeStyle='#f4ead8';g.lineWidth=2;g.strokeRect(mx,mtop,fw,fh);
      g.beginPath();g.arc(mx+fw/2,mtop+fh/2,IB.M.min(fh/3.4,16),0,7);g.stroke();
      /* трисекундна зона + кошик вгорі */
      g.strokeRect(mx+fw*0.3,mtop,fw*0.4,fh*0.24);
      const hx=X(25),hy=Y(3);
      g.fillStyle='#e8e8e2';g.fillRect(hx-10,hy-6,20,7);
      g.strokeStyle='#e07038';g.lineWidth=2.4;
      g.beginPath();g.ellipse(hx,hy+4,6,2.4,0,0,7);g.stroke();
      g.strokeStyle='#e8e8e255';g.lineWidth=1;
      for(let i=-5;i<=5;i+=2){g.beginPath();g.moveTo(hx+i,hy+6);g.lineTo(hx+i*0.4,hy+12);g.stroke();}
    }
    /* гравці */
    for(const pl of MT.ps){
      const px=X(pl.x),py=Y(pl.y);
      g.fillStyle='rgba(0,0,0,0.3)';g.beginPath();g.ellipse(px,py+4,6,2.6,0,0,7);g.fill();
      const col=pl.team===0?(pl.role==='gk'?MT_GK:MT_TEAM):MT_OPP;
      g.fillStyle=col;g.beginPath();g.arc(px,py,5.6,0,7);g.fill();
      g.fillStyle='#101820';g.font='bold 6px monospace';g.textAlign='center';
      g.fillText(pl.nm.slice(0,2).toUpperCase(),px,py+2);
      if(pl===MT.ctrl){g.strokeStyle='#ffffff';g.lineWidth=1.6;g.beginPath();g.arc(px,py,8.4,0,7);g.stroke();
        g.fillStyle='#f0d050';g.fillText('▼',px,py-11);}
      g.textAlign='left';
    }
    /* м'яч */
    const b=MT.ball;
    const bx=X(b.x),by=Y(b.y)-(b.arc?IB.M.sin(b.arc*Math.PI)*fh*0.28:0);
    g.fillStyle='rgba(0,0,0,0.3)';g.beginPath();g.ellipse(X(b.x),Y(b.y)+2,3.4,1.5,0,0,7);g.fill();
    g.fillStyle='#f8f8f2';g.beginPath();g.arc(bx,by,3.4,0,7);g.fill();
    g.fillStyle='#20242a';g.beginPath();g.arc(bx+1,by-1,1,0,7);g.fill();
    g.restore();
    /* TABLO */
    const tw=IB.M.min(220,VW2-40);
    g.fillStyle='#0a0e14ee';IB.P(g,VW2/2-tw/2,6,tw,26,'#0a0e14ee');g.strokeStyle='#3e5568';g.strokeRect(VW2/2-tw/2,6,tw,26);
    g.font='bold 10px monospace';g.textAlign='center';g.fillStyle='#f0d050';
    const tt=IB.M.max(0,IB.M.ceil(MT.t));
    g.fillText('ЛЕГЕНДАРНІ '+MT.score[0]+' : '+MT.score[1]+' МІСЦЕВІ   '+tt+'с',VW2/2,23);
    /* повідомлення */
    g.font='7px monospace';g.fillStyle='#c8d8d0';
    g.fillText(MT.msg.slice(0,64),VW2/2,VH2-30);
    g.fillStyle='#78908a';
    g.fillText('E — ПАС • ✊ — '+(MT.type==='foot'?'УДАР':'КИДОК')+' • SHIFT — БІГ • ESC — ЗАВЕРШИТИ • НА ТЕЛЕФОНІ — ВЕЛИКІ КНОПКИ СПРАВА',VW2/2,VH2-16);
    if(MT.flash>0){g.fillStyle='rgba(255,240,180,'+(MT.flash*0.35)+')';g.fillRect(0,0,VW2,VH2);}
    g.textAlign='left';
  };

  function startDarts(){
    const L=IB.E.team[0];
    /* 3 кидки: удача/інстинкт качають точність */
    const luck=((L.skills.luck?L.skills.luck.xp:0)+(L.skills.inst?L.skills.inst.xp:0))/40;
    let total=0,throws=[];
    for(let i=0;i<3;i++){
      const s=IB.M.round(IB.clamp(IB.rnd(8,24)+IB.rnd(0,luck*6),5,60)/1);
      throws.push(s);total+=s;
    }
    IB.G.stats.darts=(IB.G.stats.darts||0)+1;
    const win=total>=45;
    if(win){IB.G.money+=60;L.mood=IB.clamp(L.mood+8,0,100);}
    else L.mood=IB.clamp(L.mood+2,0,100);
    IB.skillXP&&IB.skillXP(L,'inst',4);
    IB.SFX.done();
    IB.showScene('🎯',win?'ДАРТС — ВІДМІННО! +₴60':'ДАРТС — '+total+' очок',
      win?'Сімка з того завхозу платить ₴60: «Такий меткий — тільки в нашому «Піраті»!» Зал гуде.':
      'Кидки: '+throws.join(' + ')+' = '+total+'. До призу (45+) не дотягнув — але настрій гуд і наступний сет за тобою.');
    IB.journalAdd('🎯','Дартс у «Піраті»: '+total+' очок'+(win?', виграш ₴60':'.'));
    IB.questCheck();
  }
  function startPingPong(){
    const L=IB.E.team[0];
    const win=IB.M.random()<0.45+((L.skills.tech?L.skills.tech.xp:0)+(L.skills.luck?L.skills.luck.xp:0))/300;
    IB.G.stats.pingpong=(IB.G.stats.pingpong||0)+1;
    timeSkip(0.5);
    if(win){IB.G.money+=25;L.mood=IB.clamp(L.mood+8,0,100);L.hp=IB.clamp(L.hp-4,0,100);
      IB.SFX.done();
      IB.showScene('🏓','ПІНГ-ПОНГ — ПЕРЕМОГА 2:1!','Місцевий качок з Північного масиву платить ₴25 і просить реванш. TOXIC коментує кожну подачу. Засмага іде ідеально.');
      IB.journalAdd('🏓','Пінг-понг на пляжі: перемога 2:1 (+₴25).');
    }else{L.mood=IB.clamp(L.mood+4,0,100);L.hp=IB.clamp(L.hp-4,0,100);
      IB.SFX.done();
      IB.showScene('🏓','ПІНГ-ПОНГ — 1:2','Мяч три рази пішов у вітер, двічі — у пісок. Партія не твоя, але сміх і спека — за тебе.');
      IB.journalAdd('🏓','Пінг-понг на пляжі: 1:2 (програш).');
    }
    IB.questCheck();
  }
  /* v16: startBball — реальний МАТЧ 3×2 (пас і кидок) — рушій вище */
  function startCatam(){
    if(IB.G.money<150){IB.toast('Катамаран — ₴150, а гаманець тонкий','red');return;}
    if(IB.G.wx.type==='storm'||IB.G.wx.type==='thunder'){IB.toast('У шторм катамарани не випускають','red');return;}
    IB.G.money-=150;closePanel();timeSkip(2);
    const L=IB.E.team[0];
    L.mood=IB.clamp(L.mood+12,0,100);L.hp=IB.clamp(L.hp-6,0,100);L.water=IB.clamp(L.water-6,0,100);
    IB.SFX.splash();
    IB.addStamp(IB.W.ROUTES.find(r=>r.id==='r_catam'));
    IB.photoTaken({id:'sp_catam',name:'КАТАМАРАН — ПРОГУЛЯНКА',kind:'sea',x:L.x,y:L.y});
    /* дельфіни — шанс */
    if(IB.M.random()<0.6){
      IB.G.flags.dolphins=true;
      if(!IB.E.dolphins)IB.E.dolphins=[];
      for(let i=0;i<3;i++)IB.E.dolphins.push({x:L.x+IB.rnd(-4,4),y:IB.clamp(L.y+IB.rnd(2,6),129,IB.W.H-4),t:0,life:20});
      IB.banner('ДЕЛЬФІНИ СТРИБАЮТЬ ПОРЯД!');
      IB.journalAdd('🐬','З катамарана побачили дельфінів — вся група пищала.');
    } else IB.toast('Бризки, чайки, сонце — кайф','fun');
    IB.questCheck();
  }
  function startParas(){
    if(IB.G.money<600){IB.toast('Парашют — ₴600. Підроби на смітті!','red');return;}
    if(IB.G.wx.type==='storm'||IB.G.wx.type==='thunder'){IB.toast('У шторм парашут не відкривають','red');return;}
    IB.G.money-=600;closePanel();timeSkip(2);
    const L=IB.E.team[0];
    L.mood=IB.clamp(L.mood+20,0,100);L.hp=IB.clamp(L.hp-8,0,100);
    IB.G.flags.paras=true;
    IB.SFX.done();
    IB.addStamp(IB.W.ROUTES.find(r=>r.id==='r_par'));
    IB.photoTaken({id:'sp_paras',name:'ПАРАШЮТ — 100 М НАД МОРЕМ',kind:'sea',x:L.x,y:L.y});
    IB.showScene('🪂','ПАРАШЮТ ЗА КАТЕРОМ','Сто метрів над Чорним морем: порт — як іграшковий, пірс — линва, море — до краю світу. ROCK кричав пісню, чайки кричали у відповідь.');
    IB.journalAdd('🪂','Політ на парашуті за катером. Небо і море — в одному кадрі.');
    IB.questCheck();
  }
  function openCanteen(b){
    let h='<div class="prow head"><span class="nm">ЇДАЛЬНЯ «ХВИЛЯ» — РОЗДАЧА</span><span class="ok">₴'+IB.G.money+'</span></div>';
    [['lunch','Комплексний обід (борщ+каша+компот)',80],['corn','Кукурудза відварна',20],
     ['moroz','Морозиво',25],['lemon','Компот',15]].forEach(([k,n,p])=>{
      h+='<div class="prow click" data-buy="'+k+'|'+p+'"><span class="nm">'+n+'</span><span class="ds">₴'+p+'</span><span class="'+(IB.G.money>=p?'ok':'no')+'"></span></div>';
    });
    /* v18.7: ЇЖА-ДІЙСТВО у їдальні */
    h+='<div class="prow click" data-meal="200"><span class="nm">🍚 КОМПЛЕКСИ НА ВСІХ — обід-дійство</span><span class="ds">₴200 на п\'ятірку • година-півтори • Люда і борщі</span><span class="ok">▶</span></div>';
    openPanel('ЇДАЛЬНЯ «ХВИЛЯ»',h);
    IB.$('panel-body').querySelectorAll('[data-meal]').forEach(el=>{
      el.onclick=()=>{
        const pr=+el.dataset.meal;
        closePanel();
        IB.startMeal(pr,'ЇДАЛЬНЯ «ХВИЛЯ»');
      };
    });
    IB.$('panel-body').querySelectorAll('[data-buy]').forEach(el=>{
      el.onclick=()=>{
        const [k,p]=el.dataset.buy.split('|');const pr=+p;
        if(IB.G.money<pr){IB.toast('Не вистачає ₴','red');return;}
        IB.G.money-=pr;IB.G.inv[k]=(IB.G.inv[k]||0)+1;IB.SFX.eat();openCanteen(b);
      };
    });
  }
  function openGym(b){
    const L=IB.E.team[0];
    let h='<div class="prow head"><span class="nm">КАЧАЛКА «АТЛЕТ» — тренувань: '+(IB.G.stats.gym||0)+'</span><span class="ok">₴'+IB.G.money+'</span></div>';
    h+='<div class="prow click" data-w="1"><span class="nm">ШТАНГА — важкий підхід</span><span class="ds">сили −, настрій +, тіло дзвенить</span><span class="ok">▶</span></div>';
    h+='<div class="prow click" data-w="2"><span class="nm">ВЕЛОТРЕНАЖЕР — кардіо</span><span class="ds">легше, але потово</span><span class="ok">▶</span></div>';
    h+='<div class="prow click" data-w="3"><span class="nm">КУЛЄР — водички (безкоштовно)</span><span class="ds">вода +15</span><span class="ok">💧</span></div>';
    openPanel('КАЧАЛКА «АТЛЕТ»',h);
    IB.$('panel-body').querySelectorAll('[data-w]').forEach(el=>{
      el.onclick=()=>{
        const w=el.dataset.w;
        if(w==='3'){IB.drink(L,'water');IB.G.inv.water=IB.M.min((IB.G.inv.water||0)+3,10);IB.toast('Банки поповнено');openGym(b);return;}
        timeSkip(1);
        if(w==='1'){L.hp=IB.clamp(L.hp-15,0,100);L.mood=IB.clamp(L.mood+8,0,100);L.water=IB.clamp(L.water-10,0,100);}
        else{L.hp=IB.clamp(L.hp-8,0,100);L.mood=IB.clamp(L.mood+5,0,100);L.water=IB.clamp(L.water-7,0,100);}
        IB.G.stats.gym=(IB.G.stats.gym||0)+1;
        IB.SFX.done();IB.toast('Тренування №'+IB.G.stats.gym+' — пляж буде шокований','gold');
        IB.questCheck();openGym(b);
      };
    });
  }
  function openCine(b){
    let h='<div class="prow head"><span class="nm">КІНОТЕАТР «МОРЕ-ФІЛЬМ» — сеанс о '+(IB.hStr()<20?'20:00':'22:00')+'</span><span class="ok">₴'+IB.G.money+'</span></div>';
    h+='<div class="prow click" data-t="1"><span class="nm">КВИТОК: «Курортний ромашка» (комедія)</span><span class="ds">₴120 • 2 год • попкорн у подарунок</span><span class="'+(IB.G.money>=120?'ok':'no')+'"></span></div>';
    h+='<div class="prow click" data-t="2"><span class="nm">БУФЕТ: попкорн великий</span><span class="ds">₴40</span><span class="'+(IB.G.money>=40?'ok':'no')+'"></span></div>';
    openPanel('КІНОТЕАТР «МОРЕ-ФІЛЬМ»',h);
    IB.$('panel-body').querySelectorAll('[data-t]').forEach(el=>{
      el.onclick=()=>{
        const t=el.dataset.t;
        if(t==='2'){
          if(IB.G.money<40){IB.toast('Не вистачає ₴','red');return;}
          IB.G.money-=40;IB.G.inv.popcorn=(IB.G.inv.popcorn||0)+1;IB.SFX.coin();openCine(b);return;
        }
        if(IB.G.money<120){IB.toast('Квиток — ₴120','red');return;}
        IB.G.money-=120;IB.G.inv.popcorn=(IB.G.inv.popcorn||0)+1;
        timeSkip(2);
        for(const hh of IB.E.team)hh.mood=IB.clamp(hh.mood+15,0,100);
        IB.SFX.done();
        IB.addStamp(IB.W.ROUTES.find(r=>r.id==='r_cine'));
        IB.showScene('🎬','ВЕЧІРНІЙ СЕАНС','Комедія про курорт, в якій усі впізнали себе. Зал сміявся так, що тріщали стіни. TOXIC плакав від сміху на попкорні.');
        IB.journalAdd('🎬','Вечірній сеанс у «Море-фільм» — комедія про курорт.');
        IB.questCheck();
      };
    });
  }
  function openMuseum(b){
    if(IB.G.flags.museumTour){IB.toast('Екскурсію вже пройшли — Тетяна все розказала','fun');return;}
    let h='<div class="prow head"><span class="nm">МУЗЕЙ ПОРТУ І МОРЕ</span><span class="ok">₴'+IB.G.money+'</span></div>';
    h+='<div class="prow click" data-m="1"><span class="nm">ЕКСКУРСІЯ з екскурсоводом</span><span class="ds">₴60 • 1 год • історія Іллічівськ→Чорноморськ</span><span class="'+(IB.G.money>=60?'ok':'no')+'"></span></div>';
    openPanel('МУЗЕЙ ПОРТУ І МОРЕ',h);
    IB.$('panel-body').querySelectorAll('[data-m]').forEach(el=>{
      el.onclick=()=>{
        if(IB.G.money<60){IB.toast('Квиток — ₴60','red');return;}
        IB.G.money-=60;IB.G.flags.museumTour=true;timeSkip(1);
        for(const hh of IB.E.team)hh.mood=IB.clamp(hh.mood+8,0,100);
        IB.addStamp(IB.W.ROUTES.find(r=>r.id==='r_museum'));
        IB.SFX.done();
        IB.showScene('⚓','МУЗЕЙ ПОРТУ І МОРЕ','Кораблі в пляшках, карта Чорного моря 1893 року і штормові щоденники лоцманів. DIIN довго дивився на гвинт старого пароплава — і мовчав.');
        IB.journalAdd('⚓','Екскурсія в музеї порту: Іллічівськ → Чорноморськ.');
        IB.questCheck();
      };
    });
  }
  function openHotel(b){
    const own=IB.G.home&&IB.G.home.id==='hotel';
    let h='<div class="prow head"><span class="nm">ГОТЕЛЬ «ЧОРНОМОРЕЦЬ» — РЕСЕПШН</span><span class="ok">₴'+IB.G.money+'</span></div>';
    if(own){
      h+='<div class="prow click" data-h="1"><span class="nm">Спати до ранку (номер)</span><span class="ds">сніданок зранку</span><span class="ok">🛏</span></div>';
      h+='<div class="prow click" data-h="2"><span class="nm">Душ і кондиціонер</span><span class="ds">перегрів −, настрій +</span><span class="ok">🚿</span></div>';
    }else{
      h+='<div class="prow click" data-h="3"><span class="nm">НОМЕР на добу</span><span class="ds">₴1500 • сніданок, прибирання</span><span class="'+(IB.G.money>=1500?'ok':'no')+'"></span></div>';
      h+='<div class="pcard"><span class="ds">Адміністратор: «Або за рецепцією, або у Віри-ріелтора — ціни однакові, але в неї кава краща.»</span></div>';
    }
    openPanel('ГОТЕЛЬ «ЧОРНОМОРЕЦЬ»',h);
    IB.$('panel-body').querySelectorAll('[data-h]').forEach(el=>{
      el.onclick=()=>{
        const t=el.dataset.h;
        if(t==='1'){closePanel();IB.sleepTillMorning(true);IB.saveGame();return;}
        if(t==='2'){for(const hh of IB.E.team){hh.heat=IB.clamp((hh.heat||0)-50,0,120);hh.mood=IB.clamp(hh.mood+6,0,100);}
          IB.toast('Душ, кондиціонер — люди оживають','gold');openHotel(b);return;}
        if(t==='3'){
          if(IB.G.money<1500){IB.toast('Номер — ₴1500','red');return;}
          rentHome(RENT_OPTS.find(o=>o.id==='hotel'));closePanel();
        }
      };
    });
  }
  function openPort(b){
    let h='<div class="prow head"><span class="nm">МОРЕВАКЗАЛ — КАСА</span><span class="ok">₴'+IB.G.money+'</span></div>';
    h+='<div class="prow click" data-p="1"><span class="nm">Екскурсія на ПОРОМІ</span><span class="ds">₴300 • 4 год • порт з води, маяк, дельфіни</span><span class="'+(IB.G.money>=300?'ok':'no')+'"></span></div>';
    /* v18 С8: КАР'ЄРА ПОРТУ — вантажник → приймальник → док-майстерня → кранівник */
    const CRv=IB.portCareer();
    h+='<div class="prow click" data-p="2"><span class="nm">ЗМІНА: '+CRv.name.toUpperCase()+' (робота)</span><span class="ds">2 год • +₴'+CRv.pay+' • кар\'єра '+CRv.lvl+'/3 (змін: '+(IB.G.stats.pshift||0)+')</span><span class="ok">💰</span></div>';
    if(CRv.lvl>=2)h+='<div class="prow click" data-p="3"><span class="nm">🏗 КРАН: ЗМІНА КРАНІВНИКА (міні-гра точності)</span><span class="ds">₴'+CRv.cranePay+' за зміну</span><span class="ok">🏗</span></div>';
    else h+='<div class="prow"><span class="nm">🏗 КРАН — ЗМІНА КРАНІВНИКА</span><span class="ds">відкриється після 6 змін у порту</span><span class="no"></span></div>';
    openPanel('МОРЕВАКЗАЛ',h);
    IB.$('panel-body').querySelectorAll('[data-p]').forEach(el=>{
      el.onclick=()=>{
        const t=el.dataset.p;
        if(t==='1'){
          const r=IB.W.ROUTES.find(r=>r.id==='r_ferry');
          if(IB.G.money<300){IB.toast('Пором — ₴300','red');return;}
          IB.G.money-=300;closePanel();timeSkip(4);
          const L=IB.E.team[0];L.mood=IB.clamp(L.mood+14,0,100);
          IB.addStamp(r);
          IB.photoTaken({id:'sp_ferry',name:'ПОРТ З ВОДИ — ПОРОМ',kind:'port',x:L.x,y:L.y});
          if(IB.M.random()<0.7){
            IB.G.flags.dolphins=true;
            IB.banner('ДЕЛЬФІНИ БІЛЯ ПОРОМА!');
            IB.journalAdd('🐬','Пором йшов, а дельфіни йшли поруч бортом до борту.');
          }
          IB.showScene('⛴','МОРСЬКА ПРОГУЛЯНКА','Порт з води — це інше місто: крани як маяки, контейнери як будинки, чайки махають крилами. PABLO весь вихід стояв на носі.');
          IB.questCheck();
          return;
        }
        if(t==='2'){
          timeSkip(2);
          const L=IB.E.team[0];
          const CR=IB.portCareer();
          L.hp=IB.clamp(L.hp-20,0,100);L.mood=IB.clamp(L.mood-4,0,100);L.water=IB.clamp(L.water-12,0,100);
          IB.G.stats.pshift=(IB.G.stats.pshift||0)+1;
          IB.G.money+=CR.pay;IB.G.flags.portShift=true;
          IB.SFX.coin();
          IB.toast('Зміна закінчилась: +₴'+CR.pay+' — '+CR.name+' (кар\'єра порту '+CR.lvl+'/3) • бонус у Петра','gold');
          IB.journalAdd('📦','Зміна в порту ('+CR.name+'): контейнери не самі себе носять.');
          IB.questCheck();
        }
        if(t==='3'){
          const CR=IB.portCareer();
          if(CR.lvl<2){IB.toast('Кран довіряють досвідченим — працюй зміни','red');return;}
          closePanel();craneGame(CR.cranePay);
        }
      };
    });
  }
  function openYacht(b){
    let h='<div class="prow head"><span class="nm">ЯХТ-КЛУБ «ВІТЕР» — КАПІТАН</span><span class="ok">₴'+IB.G.money+'</span></div>';
    h+='<div class="prow click" data-y="1"><span class="nm">РИБАЛКА В МОРІ (човен)</span><span class="ds">₴120 • 3 год • бичі, камбала, пеламіда</span><span class="'+(IB.G.money>=120?'ok':'no')+'"></span></div>';
    openPanel('ЯХТ-КЛУБ «ВІТЕР»',h);
    IB.$('panel-body').querySelectorAll('[data-y]').forEach(el=>{
      el.onclick=()=>{
        if(IB.G.money<120){IB.toast('Човен — ₴120','red');return;}
        if(IB.G.wx.type==='storm'){IB.toast('Капітан: «У шторм я в море не виходжу. Сиди.»','red');return;}
        IB.G.money-=120;closePanel();timeSkip(3);
        const n=IB.ri(2,4);
        IB.G.inv.fishraw+=n;IB.G.stats.fish+=n;
        const L=IB.E.team[0];L.mood=IB.clamp(L.mood+10,0,100);
        IB.SFX.fish();
        IB.addStamp(IB.W.ROUTES.find(r=>r.id==='r_boat'));
        IB.toast('Рибалка в морі: +'+n+' риби!','gold');
        IB.journalAdd('🐟','Вихід у море з яхт-клубу: '+n+' рибин у торбах.');
        IB.questCheck();
      };
    });
  }
  function openVokzal(b){
    openDialog('ЧЕРГОВИЙ ВОКЗАЛУ','«Київ — електричка о 7:40. Але ви ж не поїдете? Відпустка тільки починається — море зараз тепле!»',[
      {t:'НІ! Ми залишаємось',f:()=>{IB.toast('Група хором: «НІ!» — вокзал сміється','fun');
        for(const h of IB.E.team)h.mood=IB.clamp(h.mood+4,0,100);closeDlg();}},
      {t:'Помріяти про Київ (настрій −)',f:()=>{for(const h of IB.E.team)h.mood=IB.clamp(h.mood-5,0,100);closeDlg();}},
    ]);
  }
  function openCafe(b){
    let h='<div class="prow head"><span class="nm">'+(b.label||'КАФЕ')+' — МЕНЮ</span><span class="ok">₴'+IB.G.money+'</span></div>';
    [['kava','Кава з турки',25],['lemon','Лимонад домашній',20],['juice','Сік свіжий',22],
     ['moroz','Морозиво з топінгом',30],['corn','Кукурудза на грилі',20],['hotdog','Хот-дог фірмовий',50],
     ['shav','Шаурма «як в Одесі»',75]].forEach(([k,n,p])=>{
      h+='<div class="prow click" data-buy="'+k+'|'+p+'"><span class="nm">'+n+'</span><span class="ds">₴'+p+'</span><span class="'+(IB.G.money>=p?'ok':'no')+'"></span></div>';
    });
    h+='<div class="prow click" data-buy="listen|0"><span class="nm">Послухати Едіка — пісні про море</span><span class="ds">настрій +8</span><span class="ok">🎸</span></div>';
    /* v18.7: ЇЖА-ДІЙСТВО — «сіли всією п'ятіркою на годину-півтори» */
    h+='<div class="prow click" data-meal="250"><span class="nm">🍚 СІСТИ ВСІЙ П\'ЯТІРЦІ — вечеря-дійство</span><span class="ds">₴250 на всіх • година-півтори • фази: замовлення → борщі → сміх → десерт → рахунок</span><span class="ok">▶</span></div>';
    openPanel('КАФЕ',h);
    IB.$('panel-body').querySelectorAll('[data-meal]').forEach(el=>{
      el.onclick=()=>{
        const pr=+el.dataset.meal;
        closePanel();
        IB.startMeal(pr,'КАФЕ');
      };
    });
    IB.$('panel-body').querySelectorAll('[data-buy]').forEach(el=>{
      el.onclick=()=>{
        const [k,p]=el.dataset.buy.split('|');const pr=+p;
        if(pr>0){
          if(IB.G.money<pr){IB.toast('Не вистачає ₴','red');return;}
          IB.G.money-=pr;IB.G.inv[k]=(IB.G.inv[k]||0)+1;
          IB.G.flags.cafeSpent=(IB.G.flags.cafeSpent||0)+pr;
          IB.SFX.coin();IB.toast('Замовлено: '+k+' • ₴'+pr);
          IB.questCheck();
        }else{
          for(const hh of IB.E.team)hh.mood=IB.clamp(hh.mood+8,0,100);
          IB.SFX.bird();IB.toast('Едік співає «А чого ти хотіла від моря?» — весь зал підспівує','fun');
        }
        openCafe(b);
      };
    });
  }
  function openHomeServices(b){
    const own=IB.G.home&&((IB.G.home.id==='bronx'&&b.type==='bronx')||(IB.G.home.id==='panel5'&&b.type==='panel5')||(IB.G.home.id==='hostel'&&b.type==='hostel'));
    if(!own){openDialog('ДВЕРІ','«Квартира здається через ріелтора. Офіс «БІЛЯ МОРЕ» — у центрі, агентка Віра.»',[{t:'Зрозуміло',f:closeDlg}]);return;}
  }

  /* ---------- NPC ДІАЛОГИ ---------- */
  function openNpc(n){
    if(n.name==='охоронець Іван'){
      /* v2.0: екскурсія на СЗ «Паллада» — прямо від воротаря */
      IB.friendMeet(n);
      if(!IB.G.flags.zavodTour){
        return openDialog('ОХОРОНЕЦЬ ІВАН (СЗ «ПАЛЛАДА»)','«Куди?! Це ж завод! А... легендарні?! Ох, той самий фургон бачив. Ладно — екскурсія ₴100, тільки руки при собі. Стапелі, сліпи, баржі на лимані — місто тримається на нас.»',[
          {t:'Беремо екскурсію (₴100)',f:()=>{
            if(IB.G.money<100){IB.toast('Екскурсія — ₴100','red');return;}
            IB.G.money-=100;IB.G.flags.zavodTour=true;timeSkip(2);
            for(const h of IB.E.team)h.mood=IB.clamp(h.mood+8,0,100);
            IB.banner('СУДНОБУДІВНИЙ ЗАВОД «ПАЛЛАДА»');
            IB.toast('Сліпи, стапелі, сварка в іскрах — Петро все це бачив у дитинстві','gold');
            IB.journalAdd('🏭','Екскурсія на суднобудівний завод: «Паллада» будує для всього Чорного моря.');
            IB.questCheck();closeDlg();}},
          {t:'Не зараз',f:closeDlg}]);
      }
      return openDialog('ОХОРОНЕЦЬ ІВАН','«Проходьте, легендарні. Тільки чоботи протріть — тут навіть вентилятори з солі.»',[{t:'Дякуємо!',f:closeDlg}]);
    }
    if(n.name==='агентка Віра'){
      IB.friendMeet(n);   /* v2.0: знайомства */
      return openDialog(n.name,'«Квартири — у мене. Заходьте в офіс на Сонячну і дивіться дошку оголошень. БРОНКС — преміум, далі — нові житлові будинки!»',[
        {t:'Одразу до квартир',f:()=>{closeDlg();IB.G.flags.realtorVisited=true;openRealtor();}},
        {t:'Глянемо офіс',f:()=>{closeDlg();IB.G.flags.realtorVisited=true;IB.questCheck();}},
      ]);
    }
    /* ===== i3-main-v31: ДІВЧАТА КУРОРТУ — знайомство і ГУЛЯННЯ ===== */
    if(n.role==='girl'){
      IB.friendMeet(n);IB.friendTalk(n);
      const busy=IB.G.dateAway&&IB.G.dateAway.find(d=>d.girl===n.name);
      const flirt=IB.GIRL_FLIRT?IB.GIRL_FLIRT[IB.ri(0,IB.GIRL_FLIRT.length-1)]:'';
      if(busy)return openDialog(n.name,'«Вибач, я зараз гуляю з '+busy.hid.toUpperCase()+'... до '+IB.clockStr(busy.endT)+'» (ну і гуляння! '+busy.hrs+' годин)',[{t:'Зрозуміло 💔',f:closeDlg}]);
      const f=IB.G.friends&&IB.G.friends[n.name];
      return openDialog(n.name,'«'+flirt+'»',[
        {t:'💃 ЗАПРОСИТИ ГУЛЯТИ (вона може забрати героя на 2..15 годин!)',f:()=>{
          if(IB.startDate(n)){closeDlg();}
          else closeDlg();
        }},
        {t:'💗 СВІДАННЯ (кафе/пляж/клуб/луна-парк — ЗАРОБИТИ ГРОШІ ВІД ДІВЧАТ ВІД ДІВЧАТ)',f:()=>{
          IB.phoneGirlChat&&IB.phoneGirlChat(n.name);
          if(IB.PHONE){IB.PHONE.chat='girl_'+n.name;IB.PHONE.chats['girl_'+n.name]=IB.PHONE.chats['girl_'+n.name]||{msgs:[],name:n.name,color:'#e05a8a'};}
          closeDlg();IB.openPhone('sms');
          IB.toast('Обери СВІДАННЯ у швидких кнопках чату','gold');
        }},
        {t:'🤝 Познайомитись'+(f?(' • дружба '+f.lvl+'/3'):''),f:()=>{
          const ff=IB.friendMeet(n);IB.friendTalk(n);
          IB.toast(ff?n.name+': рівень дружби '+ff.lvl+'/3':'','gold');
          IB.journalAdd('🤝','Знайомство: '+n.name+' ('+IB.W.zoneAt(n.x,n.y)+').');
          closeDlg();}},
        {t:'🎧 А що у клубі «Маяк»?',f:()=>{
          openDialog(n.name,'«Рейв — по П\'ЯТНИЦЯХ, радіо 103.2 оголошує. А ввечері у нас туси — діджей Іверо, бар Зази і танцпол до світанку. Приходь!»',[{t:'Обов\'язково!',f:closeDlg}]);}},
        {t:'Бувай!',f:closeDlg}]);
    }
    /* ===== i3-main-v31: ДЯДЯ СІ І ТІТКА НІ — то приходят, то уходят ===== */
    if(n.role==='sini'){
      const k=n.sini,S=IB.SI_NI[k];
      IB.G.flags[k==='si'?'siMet':'niMet']=true;
      IB.questCheck();
      if(k==='si'){
        return openDialog('ДЯДЯ СІ (у '+n.zone+')','«О, легендарні! Я тут недовго буду — потім у свої справи. То приходят, то уходят — як чайки. Що треба?»',[
          {t:'🍖 Шавуха від Сі (поїсти всією групою)',f:()=>{
            for(const h of IB.E.team){h.food=IB.clamp(h.food+IB.ri(18,30),0,100);h.mood=IB.clamp(h.mood+6,0,100);}
            IB.SFX.eat();IB.toast('Дядя Сі розрізає шавуху на п\'ять — «Куштуйте, я бачив Одесу!»','gold');
            IB.journalAdd('🍖','Дядя Сі прогодував групу шавухою ('+IB.clockStr()+'). Байка про порт — у бонус.');
            closeDlg();}},
          {t:'📖 Послухати історію з життя',f:()=>{
            const st=['«В 85-му я бачив, як у порт зайшов усього-на-всього суховоз. Моря, кажу, не буває малим»','«Тітука Ні знає, скільки років до маяка. Але не скаже, бо я перший спитав»','«Рейви — це добре. Але гулянка на піску — то душа. Пісок вечері не питає»'];
            for(const h of IB.E.team)h.mood=IB.clamp(h.mood+IB.ri(6,10),0,100);
            IB.toast('Дядя Сі: '+st[IB.ri(0,st.length-1)],'gold');
            IB.journalAdd('📖','Історія дяді Сі ('+IB.clockStr()+') — група слухала, чайки співали.');
            closeDlg();}},
          {t:'👩 Де тітка Ні?',f:()=>{
            const N=IB.SI_NI.ni;
            IB.toast(N.phase==='away'?'«Ні? Тоді вона у своїх справах. Прийде — ви побачите: то приходят, то уходят»':'«Ні зараз '+N.zone+' — там і шукайте»','gold');
            closeDlg();}},
          {t:'Бувай, дядю Сі!',f:closeDlg}]);
      }
      return openDialog('ТІТКА НІ (у '+n.zone+')','«Легендарні, ситі ви чи як? Дивіться — обидва щоки тонкі! Ось мій хід: лимонад, пампушки і настрій. Що беремо?»',[
        {t:'🥤 Лимонад з льоху (вода всій групі)',f:()=>{
          for(const h of IB.E.team)h.water=IB.clamp(h.water+IB.ri(20,34),0,100);
          IB.G.inv.lemon=(IB.G.inv.lemon||0)+1;
          IB.SFX.drink();IB.toast('Тітка Ні розливає лимонад — «Це з льоху, не з крамниці!»','gold');
          IB.journalAdd('🥤','Тітка Ні пригостила лимонадом з льоху ('+IB.clockStr()+').');
          closeDlg();}},
        {t:'🥯 Пампушки з часником (їжа всій групі)',f:()=>{
          for(const h of IB.E.team)h.food=IB.clamp(h.food+IB.ri(14,24),0,100);
          IB.SFX.eat();IB.toast('Пампушки гарячі! «Це я ще зранку спекла»','gold');
          IB.journalAdd('🥯','Тітка Ні пригощала пампушками з часником.');
          closeDlg();}},
        {t:'👨 Де дядько Сі?',f:()=>{
          const S2=IB.SI_NI.si;
          IB.toast(S2.phase==='away'?'«Сі? Пішов у свої справи. То приходят, то уходят»':'«Сі зараз у '+S2.zone+' — шукайте там»','gold');
          closeDlg();}},
        {t:'Дякую, тітко Ні!',f:closeDlg}]);
    }
    if(n.role==='molfar')return openMolfar(n);
    /* v6.0: лідери банд і професійні сюжети */
    if(n.gangLeader)return gangDlg(n);
    if(n.prof&&IB.PROFS[n.prof])return profDlg(n);
    const qk=n.quest;
    if(qk&&IB.SIDES[qk]){
      const sd=IB.SIDES[qk];
      const doneKey='side_'+qk+'_done';
      IB.friendMeet(n);   /* v2.0: квестові NPC теж знайомляться */
      if(IB.G.flags[doneKey])return npcChatter(n,true);
      if(!IB.G.quests.side[qk]){
        return openDialog(n.name,'«'+sd.d+'»',[
          {t:'Беруся! ('+sd.t+')',f:()=>{
            IB.G.quests.side[qk]=true;
            if(qk==='letter'){IB.G.flags.hasLetter=true;IB.toast('Отримано лист для пані Марічки','gold');}
            IB.journalAdd('📜','Доручення від '+n.name+': '+sd.t);
            closeDlg();
          }},
          {t:'Не зараз',f:closeDlg},
        ]);
      }
      if(sd.need()){
        return openDialog(n.name,'«Молодці! Тримай: '+sd.give()+'»',[
          {t:'Дякую!',f:()=>{
            IB.G.flags[doneKey]=true;
            IB.SFX.done();IB.banner('ДОРУЧЕННЯ ВИКОНАНО: '+sd.t);
            IB.journalAdd('✔','Доручення виконано: '+sd.t);
            for(const h of IB.E.team)h.mood=IB.clamp(h.mood+6,0,100);
            if(qk==='letter')IB.G.flags.letterDone=true;
            closeDlg();
          }},
        ]);
      }
      return openDialog(n.name,'«Ще не все зроблено. '+sd.d+'»',[{t:'Зрозуміло',f:closeDlg}]);
    }
    npcChatter(n,false);
  }
  const CHATTER=['«Море сьогодні +24. Заходь, поки рятувальник не дивиться.»',
    '«Хот-дог у Попутника — найкращий після портової зміни.»',
    '«Шторм прийде — усе місто пахне йодом. Літо живе.»',
    '«Бронкс? Хата-паровоз. Але двір — царський.»',
    '«Сміття з пляжу збирай — порт платить. Правда життя.»',
    '«Катамаран бери до обіду — море спокійніше.»',
    '«Колесо огляду влітку з\'являється на просп. Миру — звідси весь Чорноморськ видно.»',
    '«Лиман — не море, але риба там своя. Гриша на мосту знає.»',
    '«Пошта на Північному — Юра листи носить по всіх районах. Кажуть, ще жодного не загубив.»',
    '«На Палладі — зміна цілодобова. Завод наш живе.»'];
  function npcChatter(n,done){
    const line=IB.pick(CHATTER,(n.x*13+n.y*7)|0);
    const extra=done?' (Доручення виконано — дякуємо, легендарні!)':'';
    const f=IB.G.friends&&IB.G.friends[n.name];
    IB.friendMeet(n);           /* v2.0: розмова = знайомство */
    IB.friendTalk(n);
    const ftxt=f?(' • знайомий '+['','(знайомий)','(приятель)','(ДРУГ)'][f.lvl]):'';
    openDialog(n.name,'«'+line+'»'+extra,[
      {t:'Познайомитись 🤝'+ftxt,f:()=>{
        const ff=IB.friendMeet(n);IB.friendTalk(n);
        IB._bumpTalks&&IB._bumpTalks();
        IB.skillXP(IB.E.team[0],'charm',3);
        IB.toast(ff?n.name+': рівень дружби '+ff.lvl+'/3':'','gold');
        IB.journalAdd('🤝','Розмова з '+n.name+' ('+IB.W.zoneAt(n.x,n.y)+').');
        closeDlg();}},{t:'Бувай!',f:closeDlg}]);
  }

  /* ============ v6.0: ПРОФЕСІЇ — у кожного свій сюжет ============ */
  function profDlg(n){
    const P=IB.PROFS[n.prof]||null;
    if(!P)return npcChatter(n,false);
    IB.friendMeet(n);IB.friendTalk(n);
    IB._bumpTalks&&IB._bumpTalks();
    IB.ensureChat&&IB.ensureChat('prof_'+n.prof);
    const L=IB.E.team[0];
    const line=P.lines[IB.ri(0,P.lines.length-1)];
    const dayKey='profJob_'+n.prof+'_'+IB.G.day;
    const done=IB.G.flags[dayKey];
    const opts=[];
    opts.push({t:'💬 Розмова ('+P.n+')',f:()=>{
      IB.toast(P.n.toUpperCase()+': '+line,'gold');
      IB.journalAdd('💬',P.n+' ('+IB.W.zoneAt(n.x,n.y)+'): '+line);
      for(const h of IB.E.team)h.mood=IB.clamp(h.mood+2,0,100);
      IB.skillXP(L,'charm',2);
      closeDlg();}});
    /* підробітки/послуги за професією */
    if(n.prof==='doctor'){
      opts.push({t:'🩺 ЛІКУВАННЯ ГЕРОЯ (₴150)',f:()=>{
        if(!IB.payPocket(L.id,150)){IB.toast('Треба ₴150 у кишені','red');closeDlg();return;}
        IB.tx(L.name,-150,'лікар: прийом');
        L.hp=100;L.mood=IB.clamp(L.mood+8,0,100);
        for(const h of IB.E.team)if(h!==L)h.hp=IB.clamp(h.hp+15,0,100);
        IB.addRep('cops',1,'лікарська слава');
        IB.skillXP(L,'inst',4);
        IB.toast('🩺 '+n.name+': «Сонце — ліки, вода — рецепт. Будь здоров, легендо!»','gold');
        IB.journalAdd('🩺','Лікар вилікував '+L.name+' (₴150).');
        closeDlg();}});
    }else if(n.prof==='professor'){
      const QUIZ=[
        {q:'Скільки «Ліній» у вуличній сітці Чорноморська?',a:['20','27','35'],best:1},
        {q:'Як звався суднобудівний завод міста?',a:['«Паллада»','«Ілліч»','«Сервер»'],best:0},
        {q:'Море +24, лиман солоніший чи ні?',a:['солоніший','прісніший','однаково'],best:1},
        {q:'Скільки сходинок у Приморських сходах?',a:['125','155','185'],best:1},
      ];
      const qz=QUIZ[IB.G.day%QUIZ.length];
      opts.push({t:'🎓 ВІКТОРИНА (₴60 і репутація)',f:()=>{
        openDialog(n.name,'🎓 '+qz.q,qz.a.map((a,i)=>({t:a,f:()=>{
          if(i===qz.best){
            L.pocket=(L.pocket||0)+60;IB.tx(L.name,60,'вікторина професора');
            IB.addRep('city',2,'перемога у вікторині');
            IB.heroRep(L,2,'розумниця/розумник');
            IB.skillXP(L,'inst',6);
            IB.toast('🎓 Професор: «Точно! Тримай ₴60 і повагу»','gold');
          }else{
            IB.addRep('city',-1,'провал у вікторині — місто бачило');
            IB.heroRep(L,-2,'зганьбився у вікторині');
            IB.toast('📉 Професор: «Учився б...» — місто посміялося','red');
          }
          closeDlg();}})));
      }});
    }else if(n.prof==='elder'){
      opts.push({t:'🧓 ДОПОМОГТИ ДО ЛАВКИ (репутація міста)',f:()=>{
        IB.addRep('city',3,'допомога літній людині при всіх');
        IB.heroRep(L,3,'щирість');
        IB.skillXP(L,'charm',4);
        for(const h of IB.E.team)h.mood=IB.clamp(h.mood+3,0,100);
        IB.toast('🧓 '+n.name+': «Дякую, золото ти моє. Усе місто бачило!»','gold');
        IB.journalAdd('🧓','Допомогли літній людині — місто схвалило.');
        closeDlg();}});
    }else if(n.prof==='communal'){
      opts.push({t:'🧹 ЗДАТИ СМІТТЯ ('+(IB.G.inv.trash||0)+' пак.) — +₴70',f:()=>{
        if((IB.G.inv.trash||0)<1){IB.toast('Немає пакетів сміття — збери на пляжі','red');closeDlg();return;}
        IB.G.inv.trash--;L.pocket=(L.pocket||0)+70;IB.tx(L.name,70,'комунальник: пакети');
        IB.addRep('city',2,'чисті двори');
        IB.skillXP(L,'vit',3);
        IB.toast('🧹 Комунальник: «Двори — дзеркало району. Повага!»','gold');
        closeDlg();}});
    }else if(n.prof==='seller'){
      opts.push({t:'🍉 ТОРГОВИЙ ПІДКАЗ (вода +1 безкоштовно)',f:()=>{
        IB.G.inv.water=(IB.G.inv.water||0)+1;
        IB.skillXP(L,'charm',3);IB.skillXP(L,'luck',2);
        IB.toast('🍉 '+n.name+': «Тільки тобі за Garний апельсин — бонусом вода»','gold');
        IB.journalAdd('🍉','Продавець поділився водою.');
        closeDlg();}});
    }else{
      /* офісник / портовий / будівельник — разова підробітка */
      const JOB=P.job||{n:'ПІДМОГТИ',pay:100,rep:['work',1],sk:'tech'};
      opts.push({t:'🔧 '+JOB.n+' (₴'+JOB.pay+')'+(done?' — вже було':''),f:()=>{
        if(done){IB.toast(P.n+': «На сьогодні все. Завод зміна — зранку»','red');closeDlg();return;}
        const pay=IB.M.round(JOB.pay*(IB.bonusTech?IB.bonusTech(L):1));
        L.pocket=(L.pocket||0)+pay;IB.tx(L.name,pay,P.n+': підробітка');
        IB.addRep(JOB.rep[0],JOB.rep[1],P.n+': підробітка');
        IB.heroRep(L,1,P.n);
        IB.skillXP(L,JOB.sk,5);
        IB.G.flags[dayKey]=true;
        IB.toast('🔧 '+P.n+': «Гарної зміни!» +₴'+pay+' у кишеню','gold');
        IB.journalAdd('🔧',P.n+': підробітка ₴'+pay+'.');
        closeDlg();}});
    }
    opts.push({t:'Бувай!',f:closeDlg});
    openDialog(n.name,'«'+line+'»'+' ['+P.n.toUpperCase()+' • '+IB.W.zoneAt(n.x,n.y)+']',opts);
  }
  /* ============ v6.0: ЛІДЕРИ БАНД ============ */
  function gangDlg(n){
    const gid=n.gangLeader;
    const GNAME=gid==='port'?'ПОРТОВІ':'БРОНКОВІ';
    IB.friendMeet(n);IB._bumpTalks&&IB._bumpTalks();
    IB.ensureChat&&IB.ensureChat(gid);
    const L=IB.E.team[0];
    const rep=IB.G.rep[gid]||0;
    const mine=L.gang===gid;
    const opts=[];
    opts.push({t:'💬 Розмова по-вуличному',f:()=>{
      const lines=gid==='port'
        ?['«Порт — наша земля. Хто працює — поважаєм. Хто тупить — розмовляєм»','«Гопчик запамʼятай: контейнери не крадуть. Контейнери ведуть бізнес»']
        :['«Бронкс — це не двір. Це характер»','«Мурзик тут головний. Після мене — чайки»'];
      IB.toast(n.name+': '+lines[IB.ri(0,lines.length-1)],'gold');
      IB.skillXP(L,'str',2);
      closeDlg();}});
    if(mine){
      opts.push({t:'📋 Що за робота для банди?',f:()=>{
        IB.sms(gid,n.name,'Данина з крамниць і суперники у кварталі — все у вкладці КВЕСТИ, категорія ⚔ БАНДИ.');
        IB.toast('📋 Роботи банди — у телефона (КВЕСТИ → ⚔)','gold');
        closeDlg();}});
      opts.push({t:'✋ ВИЙТИ З БАНДИ',f:()=>{IB.gangLeave(L.id);closeDlg();}});
    }else{
      opts.push({t:'⚔ ВСТУПИТИ ДО «'+GNAME+'» (повага '+rep+'/20)',f:()=>{
        if(IB.gangJoin(L.id,gid))closePhone2();
        closeDlg();}});
    }
    opts.push({t:'⚔ А ЩО ЩОДО ВВ13?',f:()=>{
      IB.toast(IB.G.vv13.founded?'«ВВ13? Ваша банда — ваш бізнес. Але Бронкс — мій»':'«Своя банда? Повага 20+ в ОБОХ банд або 6 биток — тоді база ваша»','gold');
      closeDlg();}});
    opts.push({t:'Бувай!',f:closeDlg});
    openDialog(n.name+' — ЛІДЕР «'+GNAME+'»','«'+(mine?'О, свій! Район з тобой, '+L.name+'.':'Ти хто такий? '+L.name+'? Чуєв. Повага — '+rep+'. Хочеш до нас — зароби її на нашій землі.')+'»',opts);
  }
  function closePhone2(){if(IB.PHONE&&IB.PHONE.open)IB.closePhone();}

  function openMolfar(n){
    /* v15.0: МОЛЬФАР ПЕРЕПИСАНИЙ НА МОРЕ — тепер ЛОЦМАН МАРЕК (мол/маяк),
       «трави і ягоди» → водорості і мідії, «5 г» → коктейль «П'ять Хвиль» */
    const sd=IB.SIDES.molfar;
    if(!IB.artHas('a6')){
      if(!IB.G.quests.side.molfar){
        return openDialog('ЛОЦМАН МАРЕК','«Я чув про вас, легендо з міста. Принеси мені 5 водоростей і 5 мідій — дам тобі те, чого не купиш у жодній крамниці.»',[
          {t:'Беруся! (водорості ×'+IB.G.inv.herb+', мідії ×'+IB.G.inv.mush+')',f:()=>{
            IB.G.quests.side.molfar=true;
            IB.journalAdd('🌊','Доручення ЛОЦМАНА МАРЕКА: принести 5 водоростей і 5 мідій.');
            closeDlg();}},
          {t:'Не зараз',f:closeDlg}]);
      }
      if(sd&&sd.need()){
        return openDialog('ЛОЦМАН МАРЕК','«Молодці, легендарні. Тримай: мій амулет — він відводить спеку. І ось рецепт коктейля «П\'ять Хвиль»... поділите на п\'ять. Рівно.»',[
          {t:'Прийняти дари',f:()=>{
            IB.G.flags['side_molfar_done']=true;
            if(sd.give)sd.give();
            closeDlg();}}]);
      }
      return openDialog('ЛОЦМАН МАРЕК','«Водорості і мідії, я казав. Водорості ×'+IB.G.inv.herb+' з 5, мідії ×'+IB.G.inv.mush+' з 5. Море дає — тільки попроси.»',[{t:'Піду збирати',f:closeDlg}]);
    }
    if(!IB.G.flags.molfarKnown){
      return openDialog('ЛОЦМАН МАРЕК','«Амулет твій. А тепер слухай: під пірсом уночі світиться МЕДУЗА-СВІЧКА — з\'являється тільки для тих, хто випив «П\'ять Хвиль». Знайдеш — зрозумієш, де всі скарби порту.»',[{t:'Дякую, старий',f:()=>{
        IB.G.flags.molfarKnown=true;
        IB.toast('Амулет лоцмана: герої перегріваються вдвічі повільніше','gold');
        closeDlg();
      }}]);
    }
    /* v18 С4: після амулета — П'ЯТЬ РОЗМОВ МАРЕКА (лічильник етапів) */
    return marekTalks();
  }


  /* ==================== v18: НОВІ СЦЕНАРІЇ (С2/С4/С5/С7 + пляж) ==================== */
  /* ---------- С2: СТАПЕЛІ «ПАЛЛАДИ» ---------- */
  function openPalhull(){
    const stg=IB.palStage?IB.palStage():0;
    const names=['КІЛЬ ОПУЩЕНО','СЕКЦІЇ БОРТІВ','ПАЛУБА ЗБИРАЄТЬСЯ','НАДБУДОВА І ТРУБА','ФАРБА І ГАСЛО','ГОТОВА ДО СПУСКУ'];
    const launched=IB.G.flags.palLaunched;
    const opts=[];
    if(!launched){
      opts.push({t:'🔨 Працювати зміну на стапелях (2 год, ₴200 у кишеню)',f:()=>{
        timeSkip(2);
        const L=IB.E.team[0];
        L.hp=IB.clamp(L.hp-12,0,100);L.food=IB.clamp(L.food-10,0,100);
        L.pocket=(L.pocket||0)+200;IB.G.stats.palShift=(IB.G.stats.palShift||0)+1;
        IB.SFX.coin();IB.toast('Зміна на стапелях: +₴200 у кишеню. «Паллада» росте!','gold');
        IB.journalAdd('⚓','Зміна на стапелях «Паллади» (стадія '+IB.M.min(5,stg)+'/5).');
        IB.questCheck();closePanel();}});
      opts.push({t:'🎁 Принести деталі зі складу №1 (₴120 — прискорює будівництво)',f:()=>{
        if(IB.G.money<120){IB.toast('Не вистачає ₴120','red');return;}
        IB.G.money-=120;IB.G.flags.palBoost=(IB.G.flags.palBoost||0)+1;
        IB.SFX.build();IB.toast('Деталі доставлено — секції ростуть швидше!','gold');
        IB.journalAdd('⚓','Приніс деталі на стапелі «Паллади».');closePanel();}});
      opts.push({t:'📷 ФОТО: будівництво «Паллади»',f:()=>{
        IB.photoTaken({id:'sp_pal',name:'«ПАЛЛАДА» НА СТАПЕЛЯХ',kind:'city',x:IB.E.team[0].x,y:IB.E.team[0].y});
        closePanel();}});
    }else{
      opts.push({t:'📷 ФОТО: «Паллада» на воді',f:()=>{
        IB.photoTaken({id:'sp_pal2',name:'СПУСК «ПАЛЛАДИ»',kind:'city',x:IB.E.team[0].x,y:IB.E.team[0].y});
        closePanel();}});
    }
    openPanel('СТАПЕЛІ «ПАЛЛАДИ» — '+names[IB.M.min(5,stg)]+(launched?' • КОРАБЛЬ НА ВОДІ!':''),panelList(opts.length?opts:[{t:'…',f:closePanel}]));
  }

  /* ---------- С5: ЗАТОНУЛИЙ БАРЖ-СКЛАД «АЛЬБАТРОС» ---------- */
  function openWreck(){
    const storm=(IB.G.wx.type==='storm'||IB.G.wx.type==='thunder');
    if(!IB.G.flags.wreckKnown){
      openPanel('БАРЖ-СКЛАД «АЛЬБАТРОС»',panelList([
        {t:'❓ Звичайний буй у глибокій воді. (Про барж розповість лоцман Марек — хатка на молі)',f:closePanel}
      ]));return;
    }
    if(storm){
      openPanel('БАРЖ-СКЛАД «АЛЬБАТРОС»',panelList([
        {t:'⚠ Шторм — під воду ніхто не пускає. Чекай штилю.',f:closePanel}
      ]));return;
    }
    openPanel('БАРЖ-СКЛАД «АЛЬБАТРОС» — ШТИЛЬ, ВИДНО ДНО',panelList([
      {t:'🤿 ПІРНУТИ (3 кімнати баржі • повітря на 60 с • 3 знахідки)',f:()=>{closePanel();diveScene();}},
      {t:'↩ Ще не готовий',f:closePanel}
    ]));
  }

  function diveScene(){
    if(document.getElementById('mg'))return;
    const L=IB.E.team[0];
    const el=document.createElement('div');el.id='mg';
    el.innerHTML='<div class="mg-cap">🤿 БАРЖ «АЛЬБАТРОС» — 3 КІМНАТИ ПІД ВОДОЮ</div>'+
      '<canvas id="mgc" width="300" height="190"></canvas>'+
      '<div class="mg-hint">СТРІЛКИ/ДЖОЙСТИК — пливи • ЗБЕРИ 3 ЗНАХІДКИ • ВИХІД — драбина зверху</div>'+
      '<button id="mg-x">✖ СПЛИВАТИ</button>';
    const crt=document.getElementById('crt');
    (crt||document.body).appendChild(el);
    el.querySelector('#mg-x').onclick=()=>{el.remove();};
    const cv=el.querySelector('#mgc'),g2=cv.getContext('2d');
    const D={x:150,y:34,o2:60,got:[false,false,false],t:0};
    const rooms=[[20,70,80,90],[110,92,80,68],[200,70,80,90]];
    const items=[[60,122],[150,124],[240,122]];
    function finish(ok){
      el.remove();
      if(ok){
        IB.G.flags.wreckFound=true;
        IB.banner('СКАРБ МІДІЇ-ГІГАНТА — У ТВОЇХ РУКАХ!');
        IB.SFX.find&&IB.SFX.find();
        openDialog('СХОДИННЯ З БАРЖІ','У руках: перлина гігантської мідії, старовинний глечик і скринька з монетами. Жорстокий вибір: місто або кишеня?',[
          {t:'🏛 Здати до МУЗЕЮ ПОРТУ І МОРЕ (репутація міста +6, ₴100)',f:()=>{
            IB.G.flags.wreckChoice='museum';
            IB.addRep&&IB.addRep('city',6,'знахідка з баржі «Альбатрос» у музеї');
            IB.G.money+=100;IB.tx&&IB.tx('ЛЕГЕНДА',100,'нагорода музею за знахідку');
            IB.toast('Куратор музею в захваті: +₴100 і +6 репутації міста','gold');
            IB.journalAdd('🏛','Знахідку з затонулого баржі здано до музею.');
            IB.questCheck&&IB.questCheck();closeDlg();}},
          {t:'💼 Продати Гриші з «Паллада-Транзиту» (₴350 у кишеню, тихо)',f:()=>{
            IB.G.flags.wreckChoice='sold';
            const L2=IB.E.team[0];L2.pocket=(L2.pocket||0)+350;
            IB.SFX.coin();IB.toast('Гриша не запитував, звідки. +₴350 у кишеню','gold');
            IB.journalAdd('💼','Знахідку з баржі продано Гриші. Совість трохи муригає.');
            closeDlg();}}
        ]);
      }else{
        IB.toast('Повітря скінчилося — довелося спливти порожнім','red');
      }
    }
    let last=performance.now();
    (function loop(){
      const now=performance.now(),dt=IB.M.min(0.05,(now-last)/1000);last=now;
      if(!document.getElementById('mg'))return;
      let mx=0,my=0;
      if(typeof keys!=='undefined'&&keys){if(keys.a)mx-=1;if(keys.d)mx+=1;if(keys.w)my-=1;if(keys.s)my+=1;}
      const mv=moveVec();
      if(!mx&&!my&&moveVec&&(mv.x||mv.y)){mx=mv.x;my=mv.y;}
      D.x=IB.clamp(D.x+mx*72*dt,14,286);D.y=IB.clamp(D.y+my*72*dt,16,176);
      D.t+=dt;
      items.forEach((it,i)=>{
        if(!D.got[i]&&IB.M.abs(D.x-it[0])<13&&IB.M.abs(D.y-it[1])<13){D.got[i]=true;IB.SFX.pick&&IB.SFX.pick();IB.toast('Знахідка '+(i+1)+'/3: '+(i===0?'перлина мідії-гіганта':(i===1?'старовинний глечик':'скринька монет')),'gold');}
      });
      if(D.got.every(v=>v)){finish(true);return;}
      if(D.y<=20&&D.t>2){finish(false);return;}
      D.o2-=dt;
      if(D.o2<=0){finish(false);return;}
      /* рендер підводного світу */
      g2.fillStyle='#072433';g2.fillRect(0,0,300,190);
      for(let i=0;i<5;i++){
        const yy=(30+i*36+performance.now()*0.01)%(190+40)-20;
        g2.fillStyle='rgba(80,160,190,0.12)';g2.fillRect(0,yy,300,10);
      }
      g2.fillStyle='#12333f';
      rooms.forEach(r=>{g2.fillRect(r[0],r[1],r[2],r[3]);g2.strokeStyle='#1e4a58';g2.strokeRect(r[0]+0.5,r[1]+0.5,r[2]-1,r[3]-1);});
      g2.fillStyle='#0d2a34';g2.fillRect(0,178,300,12);
      items.forEach((it,i)=>{
        if(D.got[i])return;
        g2.fillStyle=i===0?'#e8e0f0':(i===1?'#b8703a':'#7a5a2a');
        g2.beginPath();g2.arc(it[0],it[1],6,0,6.283);g2.fill();
        g2.strokeStyle='rgba(240,248,250,0.7)';g2.stroke();
      });
      g2.fillStyle='#8a6a3a';g2.fillRect(D.x-3,16,6,10); /* драбина */
      g2.fillStyle='#f0d060';
      g2.beginPath();g2.arc(D.x,D.y,5,0,6.283);g2.fill();
      g2.fillStyle='#e8b890';g2.fillRect(D.x-3,D.y-9,6,5);
      for(let i=0;i<6;i++){
        const by=(D.t*30+i*23)%170;
        g2.strokeStyle='rgba(220,240,250,0.35)';g2.beginPath();g2.arc((i*47+D.t*8)%300,186-by,2.5,0,6.283);g2.stroke();
      }
      g2.fillStyle='#0a1a22';g2.fillRect(2,2,90,12);
      g2.fillStyle=D.o2<15?'#ff6060':'#7ad0f0';g2.fillRect(4,4,86*(D.o2/60),8);
      g2.fillStyle='#dfe8f0';g2.font='7px monospace';g2.fillText('ПОВІТРЯ',6,10);
      requestAnimationFrame(loop);
    })();
  }

  /* ---------- С7: КІНО НА ПІСКУ І ЯРМАРОК ---------- */
  function openCinemaNight(){
    if(IB.G.money<40){IB.toast('Кіно на піску — ₴40, а каса порожня','red');return;}
    timeSkip(1.5);
    IB.G.money-=40;
    for(const h of IB.E.team)h.mood=IB.clamp(h.mood+12,0,100);
    IB.toast('Кіно на піску: старе море-детектив під зорями. Настрій всім +12','gold');
    IB.journalAdd('🎬','Нічний кінопоказ на піску — ₴40, зорі, прибій.');
    closePanel();
  }
  function openStall(){
    const goods=[
      ['corn','🍯 Кукурудза — ₴15',15],
      ['melon','🍉 Арбуз долька — ₴18',18],
      ['brinza','🧀 Бринза — ₴45',45],
      ['bread','🥖 Пашот з ярмарку — ₴10',10],
    ];
    const opts=goods.map(gd=>({t:gd[1],f:()=>{
      if(IB.G.money<gd[2]){IB.toast('Не вистачає ₴'+gd[2],'red');return;}
      IB.G.money-=gd[2];IB.G.inv[gd[0]]=(IB.G.inv[gd[0]]||0)+1;
      IB.SFX.coin();IB.toast('Куплено на ярмарку: '+gd[1].split('—')[0].trim(),'gold');
      closePanel();
    }}));
    openPanel('ЯРМАРОК СЕЛ (сьогодні на набережній)',panelList(opts));
  }

  /* ---------- B3: БУДІВЛІ ПЛЯЖУ ---------- */
  function openBeachBld(b){
    const lab=(b.label||'');
    if(lab.indexOf('РЯТУВАЛЬНА')>=0||lab.indexOf('ПОСТ')>=0){
      openPanel(lab,panelList([
        {t:'🗣 Порозмовляти зі Степаном (поради щодо моря і приливів)',f:()=>{
          closePanel();
          openDialog('РЯТУВАЛЬНИК СТЕПАН','«Правило одне: шторм — не лізь, я тоді свишу весь пляж. Прилив: вода приходить на пісок двічі на день, відлив — риба ближче. А ще в шторм чайки сідають на пірс — бережіться.»',[
            {t:'Дякую, Степане',f:closeDlg}]);}},
        {t:'🩹 Аптечка станції (hp +6 всій п\'ятірці)',f:()=>{
          for(const h of IB.E.team)h.hp=IB.clamp(h.hp+6,0,100);
          IB.toast('Пластирі, вода, відпочинок — група трохи свіжа','gold');closePanel();}},
      ]));return;
    }
    if(lab.indexOf('ПРОКАТ')>=0){
      openPanel(lab,panelList([
        {t:'🏄 Серф-дошка на день (₴60 — лови хвилю)',f:()=>{
          if(IB.G.money<60){IB.toast('Не вистачає ₴60','red');return;}
          IB.G.money-=60;IB.G.flags.surfDay=IB.G.day;
          IB.toast('Дошка твоя на день — у спеку вода рятує','gold');closePanel();}},
        {t:'🤿 Маска і трубка (₴35 — риба у мілководді як на долоні)',f:()=>{
          if(IB.G.money<35){IB.toast('Не вистачає ₴35','red');return;}
          IB.G.money-=35;IB.G.flags.maskDay=IB.G.day;
          IB.toast('Маска на день: риба близько!','gold');closePanel();}},
      ]));return;
    }
    openPanel(lab,panelList([
      {t:'🍹 Лимонад «Хвиля» (₴18 — вода +15)',f:()=>{
        if(IB.G.money<18){IB.toast('Не вистачає ₴18','red');return;}
        IB.G.money-=18;const L=IB.E.team[0];L.water=IB.clamp(L.water+15,0,100);
        IB.SFX.drink();IB.toast('Холодок по горлу','gold');closePanel();}},
      {t:'🍟 Фрі з бару (₴35 — їжа +25%)',f:()=>{
        if(IB.G.money<35){IB.toast('Не вистачає ₴35','red');return;}
        IB.G.money-=35;const L=IB.E.team[0];L.food=IB.clamp(L.food+25,0,100);
        IB.SFX.eat();IB.toast('Смачно, як у дитинстві на набережній','gold');closePanel();}},
    ]));
  }

  /* ---------- С4: П\'ЯТЬ РОЗМОВ ЛОЦМАНА МАРЕКА (лічильник етапів) ----------
     Викликається після основного потоку амулета — Марек веде по мірі
     виконання квестів: море → шторм → дельфіни → «Паллада» → фінал. */
  function marekTalks(){
    const MS=IB.G.marek=IB.G.marek||{stage:0};
    const talks=[
      {need:()=>true,
       txt:'«Перша розмова, легендо з міста. Море годує і море забирає. Хто вміє чекати прилив — той вміє чекати удачу. Гуляйте місто, море підкаже.»',
       done:()=>{IB.G.flags.marek1=true;IB.addRep&&IB.addRep('city',2,'перша розмова з лоцманом');}},
      {need:()=>IB.G.flags.swum||IB.G.flags.limanSwim,
       txt:'«Ти вже пірнав — добре. Друга розмова: буй на схід, біля маяка, ховає барж «Альбатрос». Штиль — і море покаже підводні кімнати. Три знахідки чекають.»',
       done:()=>{IB.G.flags.marek2=true;IB.G.flags.wreckKnown=true;
         IB.banner('МАРЕК ВІДКРИВ ТАЄМНИЦЮ БАРЖІ 🤿');IB.journalAdd('🌊','Марек розповів про затонулий барж-склад «Альбатрос» біля маяка.');}},
      {need:()=>IB.G.flags.stormSurvived,
       txt:'«Ти пережив шторм! Третя розмова: світло маяка у шторм — не для моряків, для дельфінів. Вони підходять у затоку, коли хвилі сердиті.»',
       done:()=>{IB.G.flags.marek3=true;IB.addRep&&IB.addRep('city',2,'третя розмова з Мареком');}},
      {need:()=>IB.G.flags.dolphins,
       txt:'«Бачив дельфінів — четверта розмова, остання з простих. Море тобі довіряє. Залишився один вітер — «Паллада».»',
       done:()=>{IB.G.flags.marek4=true;IB.addRep&&IB.addRep('city',3,'четверта розмова з Мареком');}},
      {need:()=>IB.G.flags.palLaunched||IB.G.day>=28,
       txt:'««Паллада» на воді! П\'ята розмова — і найголовніша: місто, що будує кораблі, ніколи не вмирає. Тепер ти не гість — ти чорноморський.»',
       done:()=>{IB.G.flags.marek5=true;IB.addRep&&IB.addRep('city',6,'п\'ята розмова з Мареком');
         IB.cineStart&&IB.cineStart('МАРЕК: «ТИ — ЧОРНОМОРСЬКИЙ»',4);IB.questCheck&&IB.questCheck();}},
    ];
    if(MS.stage<talks.length){
      const tk=talks[MS.stage];
      if(tk.need()){
        return openDialog('ЛОЦМАН МАРЕК — РОЗМОВА '+(MS.stage+1)+'/5',tk.txt,[
          {t:'Слухаю, Мареку',f:()=>{tk.done();MS.stage++;IB.SFX.quest&&IB.SFX.quest();closeDlg();}},
          {t:'Пізніше',f:closeDlg}]);
      }
      return openDialog('ЛОЦМАН МАРЕК','«Приходь, коли виростеш: море пірнав → шторм пережив → дельфінів бачив → «Палладу» на воду провів. Тоді поговоримо по душах.»',[
        {t:'Бувай, Мареку',f:closeDlg}]);
    }
    return openDialog('ЛОЦМАН МАРЕК','«Усі п\'ять вітрів я тобі розказав. Шостий — на тугу, але з тобою він не дружить. Гуляй, легендо.»',[
      {t:'Бувай, Мареку',f:closeDlg}]);
  }

  /* ---------- С3: СУПЕРНИКИ «СХІДНІ» (Одеса) ---------- */
  const RIVAL_LINES=['«Ми з Одеси. Усе просто: хто виграв — той і правий.»','«Ваш пляж — нормальний. Але матч — наш.»','«ВВ-Схід завжди грає у повну.»','«Ставки? Без ножа. По-чесному.»'];
  function openRival(n){
    const R=IB.G.rivals=IB.G.rivals||{met:false,wins:{f:0,b:0,r:0},finale:0};
    R.met=true;
    const done=(R.wins.f&&R.wins.b&&R.wins.r);
    const opts=[
      {t:'⚽ МАТЧ 3×2 ПРОТИ «СХІДНИХ» (ставка ₴60, перемога — ₴150 і повага)',f:()=>{
        closeDlg();IB.rivalMatch=true;IB.startMatch&&IB.startMatch.foot();
      }},
      {t:'🤸 БАТУТ-ДУЕЛЬ (кто вище за 3 стрибки — ₴80)',f:()=>{
        closeDlg();rivalBatut(n);
      }},
    ];
    opts.push({t:'🎧 РЕЙВ-КОНТЕСТ (у клубі, п\'ятниця — ₴100)',f:()=>{
      closeDlg();rivalRave(n);
    }});
    if(IB.act()===3&&!R.finale){
      opts.push({t:'🔥 ФІНАЛЬНЕ РОЗМІРЕННЯ НА НАБЕРЕЖНІЙ (всі три битви за плечима)',f:()=>{
        closeDlg();rivalFinale(n);
      }});
    }
    opts.push({t:'↩ Піти собі',f:closeDlg});
    openDialog(n.name.toUpperCase()+' («СХІДНІ», ОДЕСА)'+(done?' — [ПЕРЕМОЖЕНІ]':''),RIVAL_LINES[(n.x|0)%RIVAL_LINES.length],opts);
  }

  /* ---------- С4: Марек — вхід у розмови (перехоплення) ---------- */
  window.__marekTalks=null;

  /* ==================== v18: МІНІ-ІГРИ І СИСТЕМНИЙ UX ==================== */
  /* ---------- С8: КРАН — МІНІ-ГРА ТОЧНОСТІ ---------- */
  function craneGame(pay){
    if(document.getElementById('mg'))return;
    const el=document.createElement('div');el.id='mg';
    el.innerHTML='<div class="mg-cap">🏗 КРАН — ЗМІНА КРАНІВНИКА</div>'+
      '<canvas id="mgc" width="300" height="170"></canvas>'+
      '<div class="mg-hint">E / ТАП — СКИНУТИ КОНТЕЙНЕР НА ПАЛЕТУ • 3 ВДАЛИХ (2 ПРОМАХИ = КІНЕЦЬ)</div>'+
      '<button id="mg-x">✖</button>';
    const crt=document.getElementById('crt');
    (crt||document.body).appendChild(el);
    el.querySelector('#mg-x').onclick=()=>el.remove();
    const cv=el.querySelector('#mgc'),g2=cv.getContext('2d');
    const K={x:150,dir:1,drop:null,ok:0,miss:0,t:0};
    const targets=[70,150,230];
    const dropNow=()=>{if(K.drop===null)K.drop=0;};
    cv.onclick=dropNow;
    cv.addEventListener('touchstart',(e)=>{e.preventDefault();dropNow();},{passive:false});
    function finish(win){
      el.remove();
      const L=IB.E.team[0];
      if(win){
        L.pocket=(L.pocket||0)+pay;IB.SFX.done&&IB.SFX.done();
        IB.banner('🏗 КРАНІВНИК — МАЙСТЕР ТОЧНОСТІ!');
        IB.toast('Зміна кранівника: +₴'+pay+' у кишеню','gold');
        IB.journalAdd('🏗','Зміна кранівника: три контейнери в ціль. Прораб аплодує.');
        IB.addRep&&IB.addRep('work',3,'зміна кранівника');
      }else{
        IB.toast('Контейнер впав на причал — зміна без заробітку (спробуй ще)','red');
        IB.journalAdd('🏗','Кранівник: контейнер впав. Прораб довго мовчав.');
      }
      IB.questCheck&&IB.questCheck();
    }
    let last=performance.now();
    (function loop(){
      const now=performance.now(),dt=IB.M.min(0.05,(now-last)/1000);last=now;
      if(!document.getElementById('mg'))return;
      K.t+=dt;
      if(K.drop===null){
        K.x+=K.dir*90*dt;
        if(K.x>280){K.x=280;K.dir=-1;}
        if(K.x<20){K.x=20;K.dir=1;}
        if(typeof keys!=='undefined'&&keys&&(keys.e||keys.enter)){dropNow();keys.e=false;keys.enter=false;}
      }
      let hookY=26;
      if(K.drop!==null){
        K.drop+=120*dt;hookY=26+K.drop;
        if(hookY>=118){
          const ti=targets[K.ok]||targets[0];
          if(IB.M.abs(K.x-ti)<22){
            K.ok++;IB.SFX.pick&&IB.SFX.pick();IB.toast('В ціль! '+K.ok+'/3','gold');
            if(K.ok>=3){finish(true);return;}
          }else{
            K.miss++;IB.SFX.alert&&IB.SFX.alert();IB.toast('Мимо! ('+K.miss+'/2 промахи)','red');
            if(K.miss>=2){finish(false);return;}
          }
          K.drop=null;
        }
      }
      g2.fillStyle='#26313a';g2.fillRect(0,0,300,170);
      g2.fillStyle='#3a4652';g2.fillRect(0,0,300,16);
      targets.forEach((tx,i)=>{
        g2.fillStyle=i<K.ok?'#2f8a4e':'#5a6470';
        g2.fillRect(tx-26,126,52,34);
        g2.fillStyle='#dfe8f0';g2.font='7px monospace';g2.fillText('ПАЛЕТА '+(i+1),tx-22,148);
      });
      g2.strokeStyle='#e8c050';g2.lineWidth=2;
      g2.beginPath();g2.moveTo(K.x,16);g2.lineTo(K.x,hookY);g2.stroke();
      g2.fillStyle='#e8c050';g2.fillRect(K.x-14,hookY,28,10);
      if(K.drop!==null){g2.fillStyle='#b84840';g2.fillRect(K.x-12,hookY+12,24,12);}
      requestAnimationFrame(loop);
    })();
  }

  /* ---------- С3: БАТУТ-ДУЕЛЬ І РЕЙВ-КОНТЕСТ ПРОТИ «СХІДНИХ» ---------- */
  function rivalBatut(n){
    if(document.getElementById('mg'))return;
    const el=document.createElement('div');el.id='mg';
    el.innerHTML='<div class="mg-cap">🤸 БАТУТ-ДУЕЛЬ: '+n.name.toUpperCase()+' («СХІДНІ»)</div>'+
      '<canvas id="mgc" width="300" height="150"></canvas>'+
      '<div class="mg-hint">E / ТАП — стрибок, КОЛИ МАРКЕР У ЖОВТІЙ ЗОНІ • 3 раунди • ₴80 переможцю</div>'+
      '<button id="mg-x">✖</button>';
    const crt=document.getElementById('crt');
    (crt||document.body).appendChild(el);
    el.querySelector('#mg-x').onclick=()=>el.remove();
    const cv=el.querySelector('#mgc'),g2=cv.getContext('2d');
    const B={pos:0,dir:1,round:0,me:0,he:0,lock:0};
    const jump=()=>{
      if(B.lock>0||B.round>=3)return;
      B.lock=0.35;
      const inZone=(B.pos>=55&&B.pos<=85);
      if(inZone){B.me++;IB.SFX.pick&&IB.SFX.pick();}else{IB.SFX.ui&&IB.SFX.ui();}
      B.he+=IB.ri(0,1);
      B.round++;
      if(B.round>=3)setTimeout(()=>{
        el.remove();
        const L=IB.E.team[0];
        if(B.me>B.he){
          L.pocket=(L.pocket||0)+80;IB.SFX.done&&IB.SFX.done();
          IB.toast('Батут за тобою: '+B.me+':'+B.he+' — +₴80 у кишеню','gold');
          IB.journalAdd('🤸','Батут-дуель проти «Східних»: перемога '+B.me+':'+B.he+'.');
        }else{
          IB.toast('«Східні» вище: '+B.me+':'+B.he+'. Реванш, легендо!','red');
          IB.journalAdd('🤸','Батут-дуель: поразка '+B.me+':'+B.he+'.');
        }
      },700);
    };
    cv.onclick=jump;
    cv.addEventListener('touchstart',(e)=>{e.preventDefault();jump();},{passive:false});
    let last=performance.now();
    (function loop(){
      const now=performance.now(),dt=IB.M.min(0.05,(now-last)/1000);last=now;
      if(!document.getElementById('mg'))return;
      if(B.lock>0)B.lock-=dt;
      B.pos+=B.dir*130*dt;
      if(B.pos>120){B.pos=120;B.dir=-1;}
      if(B.pos<0){B.pos=0;B.dir=1;}
      if(typeof keys!=='undefined'&&keys&&(keys.e||keys.enter)){jump();keys.e=false;keys.enter=false;}
      g2.fillStyle='#1a2836';g2.fillRect(0,0,300,150);
      g2.fillStyle='#0f1d29';g2.fillRect(20,110,260,18);
      g2.fillStyle='#f0d050';g2.fillRect(75,110,40,6);
      g2.fillStyle='#f070a0';g2.fillRect(B.pos+18,104,4,24);
      g2.font='8px monospace';g2.fillStyle='#dfe8f0';
      g2.fillText('ТИ: '+B.me+'   «СХІДНІ»: '+B.he+'   РАУНД '+(B.round+1)+'/3',70,30);
      g2.fillText('ТЯГНИ В ЗОНУ — ВИЩИЙ СТРИБОК',80,50);
      requestAnimationFrame(loop);
    })();
  }
  function rivalRave(n){
    if(document.getElementById('mg'))return;
    const seq=[];for(let i=0;i<6;i++)seq.push(['◀','▲','▶','▼'][IB.ri(0,3)]);
    const el=document.createElement('div');el.id='mg';
    el.innerHTML='<div class="mg-cap">🎧 РЕЙВ-КОНТЕСТ: '+n.name.toUpperCase()+' («СХІДНІ»)</div>'+
      '<div id="rv-seq" class="mg-seq"></div>'+
      '<div class="mg-arrows">'+
      '<button data-a="◀">◀</button><button data-a="▲">▲</button>'+
      '<button data-a="▼">▼</button><button data-a="▶">▶</button></div>'+
      '<div class="mg-hint">ПОВТОРИ ПОСЛІДОВНІСТЬ • ₴100 переможцю</div>'+
      '<button id="mg-x">✖</button>';
    const crt=document.getElementById('crt');
    (crt||document.body).appendChild(el);
    el.querySelector('#mg-x').onclick=()=>el.remove();
    const sq=el.querySelector('#rv-seq');
    sq.innerHTML=seq.map(x=>'<span>'+x+'</span>').join('');
    let idx=0,ok=0;
    el.querySelectorAll('.mg-arrows button').forEach(b=>{
      b.onclick=()=>{
        if(idx>=seq.length)return;
        if(b.dataset.a===seq[idx]){ok++;b.classList.add('hit');IB.SFX.pick&&IB.SFX.pick();}
        else{b.classList.add('miss');IB.SFX.alert&&IB.SFX.alert();}
        idx++;
        if(idx>=seq.length)setTimeout(()=>{
          el.remove();
          const L=IB.E.team[0];
          const rival=IB.ri(2,5);
          if(ok>rival){
            L.pocket=(L.pocket||0)+100;IB.SFX.done&&IB.SFX.done();
            IB.toast('Рейв-контест твій: '+ok+' проти '+rival+' — +₴100 у кишеню','gold');
            IB.journalAdd('🎧','Рейв-контест проти «Східних»: перемога '+ok+':'+rival+'.');
          }else{
            IB.toast('Діджей дав «Східнім» дожести: '+ok+' проти '+rival,'red');
            IB.journalAdd('🎧','Рейв-контест: поразка '+ok+':'+rival+'.');
          }
        },500);
      };
    });
  }
  function rivalFinale(n){
    const R=IB.G.rivals=IB.G.rivals||{met:false,wins:{f:0,b:0,r:0},finale:0};
    const wins=(R.wins.f?1:0)+(R.wins.b?1:0)+(R.wins.r?1:0);
    if(wins>=2){
      R.finale=1;
      IB.addRep&&IB.addRep('street',10,'«Східні» визнали першість');
      IB.cineStart&&IB.cineStart('«СХІДНІ»: «ПЛЯЖ ВАШ. МІСТО — ВАШЕ.»',4.5,'fireworks');
      openDialog('РІД («СХІДНІ», ОДЕСА)','«Гаразд, легендарні. Три битви — ваша взяла. Наступного літа приїдемо з новим складом. А зараз — гуляємо разом, бо ми з одного Чорного моря.»',[
        {t:'🤝 По рукам. Напій за наш рахунок',f:()=>{
          for(const h of IB.E.team)h.mood=IB.clamp(h.mood+10,0,100);
          IB.journalAdd('🔥','Фінальне розмірення з «Східними»: перемога. Рід і хлопці тепер друзья.');
          closeDlg();}}]);
    }else{
      openDialog('РІД («СХІДНІ», ОДЕСА)','«Розмірення? Спершу виграй хоча б дві битви: матч на майданчику, батут, рейв-контест. Зараз у тебе '+wins+' з 3.»',[
        {t:'Дамо тобі битву',f:closeDlg}]);
    }
  }

  /* ---------- С1: ФІНАЛЬНІ ТИТРИ (30-денне літо) ---------- */
  IB.finaleCredits=()=>{
    if(document.getElementById('credits'))return;
    const arts=Array.isArray(IB.G.arts)?IB.G.arts.length:0;
    const rep=IB.G.rep||{};
    const couples=Object.keys(IB.G.romance||{}).filter(k=>IB.G.romance[k]&&IB.G.romance[k].st>=3);
    const rows=[
      ['🏛 РЕПУТАЦІЯ МІСТА',IB.repLvl(rep.city||0)+' ('+(rep.city||0)+')'],
      ['🧱 РЕПУТАЦІЯ ВУЛИЦІ',IB.repLvl(rep.street||0)+' ('+(rep.street||0)+')'],
      ['💗 СЕРЦЯ',couples.length?('пари: '+couples.join(', ')):'романи попереду'],
      ['🏺 СУВЕНІРИ МОРЕ',arts+' з 8'],
      ['✉ ШТАМПИ МОРЕ-ТУР',Object.keys(IB.G.stamps||{}).length+' з '+IB.W.ROUTES.length],
      ['⚓ ЗМІНИ У ПОРТУ',(IB.G.stats.pshift||0)+' • кар\'єра: '+(IB.portCareer?IB.portCareer().name:'—')],
      ['🏠 ЖИТЛО',IB.G.home?(IB.G.home.name||IB.G.home.id):'гостинний двір'],
      ['💰 КАСА НА КІНЕЦЬ',IB.M.round(IB.G.money)+' ₴'],
    ];
    const el=document.createElement('div');el.id='credits';
    el.innerHTML='<div class="cr-cap">☀ ЛІТО ЗАВЕРШИЛОСЬ — 30 ДНІВ LEGEND 3 «МОРЕ МОРЕ»</div>'+
      '<div class="cr-sub">Чорноморськ • IBONARIUM GAMEWORKS • трилогія ІБОНАРІУМ</div>'+
      rows.map(r=>'<div class="cr-row"><span>'+r[0]+'</span><b>'+r[1]+'</b></div>').join('')+
      '<button id="cr-x">ЛІТО ТРИВАЄ → (безкінечний сезон)</button>';
    document.body.appendChild(el);
    el.querySelector('#cr-x').onclick=()=>{
      el.remove();
      IB.banner('ЛІТО ТРИВАЄ — безкінечний сезон Чорноморська');
      IB.journalAdd('☀','Титри літа показано. Сезон продовжується — Чорноморськ свій.');
    };
    IB.SFX.done&&IB.SFX.done();
  };

  /* ---------- М7: ЧІПИ ПЕРШОГО ДНЯ ---------- */
  IB.chipDone=(k)=>{
    const C=IB.G.chips=IB.G.chips||{e:1,p:1,q:1};
    if(!C[k])return;
    C[k]=0;
    IB.chipShow&&IB.chipShow();
  };
  IB.chipShow=()=>{
    const old=document.getElementById('chip');
    if(old)old.remove();
    const C=IB.G.chips=IB.G.chips||{e:1,p:1,q:1};
    if(IB.G.chips.off)return;
    const list=[['e','✋ E — усе поруч: дії, таксі, море'],['p','📱 P — телефон і GPS'],['q','🎉 Q — гулянка будь-де']];
    const nx=list.find(l=>C[l[0]]);
    if(!nx)return;
    const el=document.createElement('div');el.id='chip';
    el.textContent=nx[1];
    document.body.appendChild(el);
    setTimeout(()=>{if(el.parentNode)el.remove();},7000);
  };

  /* ---------- М4: «ЩО ДАЛІ?» — підказка за актом і часом ---------- */
  IB.whatNext=()=>{
    const h=IB.hStr();
    const act=IB.act?IB.act():1;
    const active=IB.QUESTS.find(q=>q.id===IB.G.quests.active);
    const loc=active&&active.loc?active.loc():null;
    if(h<11){
      if(IB.portCareer)IB.portCareer();
      return {txt:'ВРАНЦІ — ЗМІНА В ПОРТУ (кар\'єра, гроші)',pt:{x:353,y:399,name:'МОРЕВАКЗАЛ'}};
    }
    if(h<17){
      if(loc)return {txt:'ДЕНЬ — КВЕСТ: '+active.t,pt:{x:loc.x,y:loc.y,name:loc.name||'точка квесту'}};
      return {txt:'ДЕНЬ — ПЛЯЖ: прилив, козирки, серф (трап в районі прапора)',pt:{x:188,y:448,name:'ЦЕНТРАЛЬНИЙ ПЛЯЖ'}};
    }
    if(IB.FRIDAY&&IB.FRIDAY())return {txt:'ВЕЧІР П\'ЯТНИЦІ — РЕЙВ У КЛУБІ «МАЯК»',pt:{x:322,y:386,name:'КЛУБ «МАЯК»'}};
    if(act===3)return {txt:'АКТ III «СВЯТО» — набережна і салют',pt:{x:200,y:434,name:'НАБЕРЕЖНА'}};
    return {txt:'ВЕЧІР — гулянка з п\'ятіркою (Q у будь-який момент)',pt:{x:214,y:410,name:'ПЛОЩА + СХОДИ'}};
  };

  /* ---------- ДІАЛОГ ---------- */
  function openDialog(name,text,opts){
    mode='dialog';dlgIdx=0;
    IB.$('dlg').classList.remove('hidden');
    IB.$('dlg-name').textContent=name;
    IB.$('dlg-text').textContent=text;
    const box=IB.$('dlg-opts');box.innerHTML='';
    opts.forEach((o,i)=>{
      const d=document.createElement('div');
      d.className='dopt'+(i===0?' sel':'');
      d.textContent=(i+1)+'. '+o.t;
      d.onclick=()=>o.f();
      box.appendChild(d);
    });
    IB._dlgOpts=opts;
  }
  function closeDlg(){IB.$('dlg').classList.add('hidden');mode=(IB._inInterior&&IB.INT_CUR)?'interior':'game';IB._dlgOpts=null;}
  function dlgKey(){
    const n=(IB._dlgOpts||[]).length;
    for(let i=0;i<n;i++)if(consume(''+(i+1))){IB._dlgOpts[i].f();return;}
    if(consume('e')||consume('enter')||consume('space')){
      if(IB._dlgOpts)IB._dlgOpts[dlgIdx<IB._dlgOpts.length?dlgIdx:0].f();
    }
    if(consume('w')||consume('up')){dlgIdx=IB.M.max(0,dlgIdx-1);dlgSel();}
    if(consume('s')||consume('down')){dlgIdx=IB.M.min((IB._dlgOpts||[]).length-1,dlgIdx+1);dlgSel();}
    if(consume('esc'))closeDlg();
  }
  function dlgSel(){
    IB.$('dlg-opts').querySelectorAll('.dopt').forEach((el,i)=>el.classList.toggle('sel',i===dlgIdx));
  }

  /* ---------- ПАНЕЛІ ---------- */
  function openPanel(title,html){
    mode='panel';
    IB.$('panel').classList.remove('hidden');
    IB.$('panel-title').textContent=title;
    IB.$('panel-body').innerHTML=html;
    IB.$('panel-body').scrollTop=0;
  }
  /* v12: «ℹ ВСЯ ІНФА» — велика спливаюча СТОРІНКА інфи (секція about без h3-дубля:
     КЕРУВАННЯ + нове у v12 + уся інфа про місто/пляж/гроші + АСЕТИ + ТРИЛОГІЯ)
     поверх БУДЬ-ЯКОГО режиму: заставка (меню «ПРО ГРУ ТА АСЕТИ»), гра (кнопка ℹ),
     телефон (папка ℹ ІНФО через IB.APPVIEWS.info). */
  IB.openInfo=()=>{
    const ab=document.getElementById('about');
    if(!ab)return;
    IB._aboutMode=mode;
    mode='about';
    const clone=ab.cloneNode(true);
    const h3=clone.querySelector('h3');if(h3)h3.remove();
    IB.$('panel').classList.remove('hidden');
    IB.$('panel-title').textContent='ℹ ВСЯ ІНФА — LEGEND 3 «МОРЕ МОРЕ»';
    IB.$('panel-body').innerHTML=clone.innerHTML;
    IB.$('panel-body').scrollTop=0;
  };
  IB.openAboutPanel=IB.openInfo;
  /* v13: «КЕРУВАННЯ» — стартова сторінка як у частини 1 (legend_v5):
     повний список клавіш, сенсорного керування І УСІХ механіків гри 3
     (клон блоку #ab-controls зі сторінки інфи) — у тому ж вікні-сторінці */
  IB.openControls=()=>{
    const c=document.getElementById('ab-controls');
    if(!c)return;
    IB._aboutMode=mode;
    mode='about';
    IB.$('panel').classList.remove('hidden');
    IB.$('panel-title').textContent='⌨ КЕРУВАННЯ — LEGEND 3 «МОРЕ МОРЕ»';
    IB.$('panel-body').innerHTML=c.innerHTML;
    IB.$('panel-body').scrollTop=0;
  };
  /* v1.4: закриття ПОВЕРХ усього — з будь-якого режиму (хрестик, ESC, клік поза панеллю) */
  function closePanel(){IB.$('panel').classList.add('hidden');mode=(mode==='about')?(IB._aboutMode||'title'):((IB._inInterior&&IB.INT_CUR)?'interior':'game');IB._panelKey=null;}
  IB.PANEL_CLOSE=()=>{
    IB.$('panel').classList.add('hidden');
    IB.$('dlg').classList.add('hidden');IB._dlgOpts=null;
    mode=(mode==='about')?(IB._aboutMode||'title'):((IB._inInterior&&IB.INT_CUR)?'interior':'game');
    IB._panelKey=null;
    IB.SFX.ui&&IB.SFX.ui();
  };
  function panelList(opts){
    let html='';
    opts.forEach((o,i)=>{
      html+='<div class="prow click" data-oi="'+i+'"><span class="nm">'+o.t+'</span></div>';
    });
    setTimeout(()=>{
      IB.$('panel-body').querySelectorAll('[data-oi]').forEach(el=>{
        el.onclick=()=>{const o=opts[+el.dataset.oi];if(o.f)o.f();};
      });
    },0);
    return html;
  }

  /* ГРУПА: герої + доручення */
  function groupHtml(){
    let html='';
    IB.E.team.forEach((h,i)=>{
      const task=h.task==='leader'?'—':(IB.TASKS[h.task]?IB.TASKS[h.task].label:'слідує');
      html+='<div class="pcard"><b>'+(i+1)+'. '+h.name+'</b> <span class="ds">['+h.def.talent+' — '+h.def.tdesc+']</span>'+
        '<div class="ds">Сили '+IB.M.round(h.hp)+'% • Їжа '+IB.M.round(h.food)+'% • Вода '+IB.M.round(h.water)+'% • Настрій '+IB.M.round(h.mood)+'%'+(h.cold>30?' • ❄ ХОЛОД '+IB.M.round(h.cold)+'%':'')+(h.alc>=1?' • 🍺':'')+'</div>'+
        (i>0?'<div class="ds">Доручення: '+task+'</div>':'<div class="ds">Лідер — керуєш ти</div>')+
        (i>0?['follow','wood','water','fish','farm','cook','rest'].map(tk=>'<div class="prow click" data-task="'+i+'|'+tk+'"><span class="nm">'+(tk==='follow'?'Йти зі мною':(IB.TASKS[tk]?IB.TASKS[tk].label:'Відпочивати'))+'</span><span class="'+(h.task===tk?'ok':'no')+'">'+(h.task===tk?'✔ поточне':'')+'</span></div>').join('')+
          '<div class="prow click" data-lead="'+i+'"><span class="nm">👑 СТАТИ ЛІДЕРОМ — грати за '+h.name+'</span><span class="ds">він веде, решта слідує</span></div>':'')+
        '<div class="prow click" data-solo="1"><span class="nm">🌞 Я СКОРО ПОВЕРНУСЬ (СОЛО: інші на пляжі)</span><span class="ds"> або зніми: група знову разом</span></div>'+
        '<div class="prow click" data-allbeach="1"><span class="nm">🏖 ВІДПРАВИТИ ВСІХ НА ПЛЯЖ</span><span class="ds">сонце, пиво і гуляння — ти вільний</span></div>'+
        '<div class="ds">💰 Кишеня: ₴'+(h.pocket||0)+(h.flat?' • адреса: '+h.flat:'')+'</div>'+
        '</div>';
    });
    if(IB.G.dateAway&&IB.G.dateAway.length){
      html+='<div class="pcard"><b>💃 НА ГУЛЯНЦІ З ДІВЧАТАМИ:</b> '+IB.G.dateAway.map(d=>'<span class="ds"><b>'+d.hid.toUpperCase()+'</b> пішов з <b>'+d.girl+'</b> о '+d.start+', тривалість '+d.hrs+' год — повернеться о '+IB.clockStr(d.endT)+'</span>').join(' • ')+'</div>';
    }
    html+='<div class="pcard"><b>💃 ДІВЧАТА КУРОРТУ (v3.1):</b><span class="ds"> на пляжі, у центрі і біля клубу стоять Галя з клуба, Ірина, Марта, Аліна, Таня, Света, Діана, Настя, Юля і Ріта. Поговори (E) і ЗАПРОСИ ГУЛЯТИ — дівчина може ЗАБРАТИ героя на 2..15 годин (він вибуде з групи і повернеться щасливий). Квест «ХЛОПЕЦЬ ІЗ ДІВЧИНОЮ» — 3 побачення.</span></div>';
    html+='<div class="pcard"><b>📻 РАДІО 103.2 FM (v3.1):</b><span class="ds"> міське радіо передає новини Чорноморська щодві години (і о 9:00/19:00 — великі випуски). РЕЙВИ оголошує зранку: «У П\'ЯТНИЦЮ — РЕЙВ У КЛУБІ «МАЯК»». Радіо можна слухати удома (E на радіоприймачі).</span></div>';
    html+='<div class="pcard"><b>👨‍👩‍ ДЯДЯ СІ І ТІТКА НІ (v3.1):</b><span class="ds"> то приходят, то уходят: можуть бути У ТАБОРІ (шашлик/пампушки), можуть гуляти МІСТОМ (клуб, порт, ринок, луна-парк), а можуть взагалі не приходити. Сі — байки і шавуха; Ні — лимонад з льоху і турбота. Квест «СІ І НІ» — поговорити з обома.</span></div>';
    html+='<div class="pcard"><b>🎧 КЛУБ «МАЯК» (v3.1):</b><span class="ds"> неон за набережною: діджей Іверо, танцпол, бар Зази, хостес Марічка. Туси — щовечора (E на танцполі). РЕЙВ — У П\'ЯТНИЦЮ (E на пульті, ₴150). Запрошення від людей приходять самі — група може покликати на вечірку чи гулянку.</span></div>';
    html+='<div class="pcard"><b>ГУЛЯНКА (Q) — v17.0:</b><span class="ds"> КОЛИ ЗАВГОДНО І БУДЬ-ДЕ: п\'ятірка разом — і гулянка прямо на піску або тротуарі (музика з барів і клубу, гірлянди панельок). НІЯКОГО ТАБОРУ І ВОГНИЩ — це Чорноморськ! Напитки (≥6) і закуска (≥4) роблять дужчою. 8 фаз: РОЗГІН → ТАНЦІ → БАЙКИ → ТРІП → ПОПАДАЛИ → ЖАЛІБНИЙ ТРІП → РОЗГУЛ → ПОХМІЛЛЯ. Курортні сцени: чайки-злодії, краб-гість, колесо в ночі, таксист без пасажирів. А ПІСЛЯ 18:00 у центрі — НІЧНА ГУЛЯНКА ПО МІСТУ (T): 6 зупинок до світанку.</span></div>';
    html+='<div class="pcard"><b>✊ БИТКА (X):</b><span class="ds"> у Порту шабашать «ПОРТОВІ», біля Бронксу — «БРОНКОВІ». Йдуть на тебе у своєму кварталі — удар X. Перемога: +₴20..45, повага, квест «ВУЛИЧНІ БИТКИ». Сонячний удар — герої падають від спеки: лежать у тіні, друзі приносять воду, і вони невдовзі відходять. Перехожі ЗДОРОВАЮТЬСЯ бульбашками. ЧАЙКИ замість ворон: налітають на їжу — ганяй; ГОДІВНИЦІ на набережній — корми (хліб).</span></div>';
    
    html+='<div class="pcard"><b>✦ «П\'ЯТЬ ХВИЛЬ»:</b><span class="ds"> у тебе порцій: '+IB.G.inv.trip5+'. Ніч П\'яти Зірок — у темряві, зі всією групою.</span></div>';
    html+='<div class="prow click" data-torch="1"><span class="nm">🔦 ФОНАРИКИ: '+(IB.G.torch!==false?'УВІМКНЕНО (світять уночі, метелики злітаються)':'ВИМКНЕНО (темно, метелики розлетілись)')+'</span><span class="ds">кнопка ФОНАР / клавіша F</span><span class="'+(IB.G.torch!==false?'ok':'no')+'">'+'перемкнути'+'</span></div>';
    html+='<div class="prow click" data-srch="1"><span class="nm">🔊 ГУКАТИ (зібрати групу)</span><span class="ds">група кричить «АУ!» — загублені біжать на голос швидше, ніж самі дійшли б; пробивають хащі</span><span class="ok">R</span></div>';
    return html;
  }
  function bindGroup(body,rer){
    const re=()=>{(rer||openGroupPanel)();};
body.querySelectorAll('[data-task]').forEach(el=>{
      el.onclick=()=>{
        const [i,tk]=el.dataset.task.split('|');
        const h=IB.E.team[+i];
        h.task=tk;h.target=null;h.taskT=0;
        IB.toast(h.name+': '+((tk==='follow')?'йде за тобою':(IB.TASKS[tk]?IB.TASKS[tk].label:'відпочиває')));
        re();
      };
    });
    const tr=body.querySelector('[data-torch]');
    if(tr)tr.onclick=()=>{IB.toggleTorch();re();};
    const sr=body.querySelector('[data-srch]');
    if(sr)sr.onclick=()=>{closePanel();IB.startSearch();};
    const solob=body.querySelector('[data-solo]');
    if(solob)solob.onclick=()=>{const on=!IB.G.solo.active;IB.G.solo={active:on};IB.soloMode(on);re();};
    const ab=body.querySelector('[data-allbeach]');
    if(ab)ab.onclick=()=>{IB.G.solo={active:true};IB.soloMode(true);re();};
    /* v5.0: ЛІДЕР / СОЛО / ПЛЯЖ */
    body.querySelectorAll('[data-lead]').forEach(el=>{
      el.onclick=()=>{
        const i=+el.dataset.lead;const h=IB.E.team[i];if(!h)return;
        IB.E.team.forEach(x=>{x.task=x===h?'leader':'follow';x.field=null;});
        /* лідер перший у списку */
        const old=IB.E.team[0];
        IB.E.team[i]=old;IB.E.team[0]=h;
        IB.toast('👑 Тепер граєш за '+h.name+' («'+h.def.talent+'»),'+' інші слідують','gold');
        IB.journalAdd('👑','Тепер керуємо '+h.name+'.');
        IB.G.solo={active:false};
        re();
      };
    });
  }
  function openGroupPanel(){mode='panel';openPanel("ГРУПА — ЛЕГЕНДАРНА П'ЯТІРКА",groupHtml());bindGroup(IB.$('panel-body'));}
  IB.APPVIEWS=IB.APPVIEWS||{};
  IB.APPVIEWS.group=(body)=>{body.innerHTML=groupHtml();bindGroup(body,()=>IB.APPVIEWS.group(body));};

  /* ЖУРНАЛ: квести + події + артефакти */
  function journalHtml(){
    /* v18 М4: ВКЛАДКИ КВЕСТИ/ПОДІЇ/СМС/ШТАМПИ + кнопка «ЩО ДАЛІ?» */
    const TAB=(IB.G.jtab||'quests');
    let html='<div class="prow head jtabs">'+
      '<span class="jtab'+(TAB==='quests'?' on':'')+'" data-jt="quests">КВЕСТИ</span>'+
      '<span class="jtab'+(TAB==='events'?' on':'')+'" data-jt="events">ПОДІЇ</span>'+
      '<span class="jtab'+(TAB==='sms'?' on':'')+'" data-jt="sms">СМС</span>'+
      '<span class="jtab'+(TAB==='stamps'?' on':'')+'" data-jt="stamps">ШТАМПИ</span></div>';
    const wn=IB.whatNext?IB.whatNext():null;
    if(wn)html+='<div class="prow click jnext" data-wn="1"><span class="nm">❓ ЩО ДАЛІ?</span><span class="ds">'+wn.txt+'</span><span class="ok">▶</span></div>';
    if(TAB==='quests'){
      const active=IB.QUESTS.find(q=>q.id===IB.G.quests.active);
      if(active)html+='<div class="pcard"><b>► '+active.t+'</b><div class="ds">'+active.d+'</div></div>';
      IB.QUESTS.forEach(q=>{
        if(IB.G.quests.done.includes(q.id))html+='<div class="prow done"><span class="nm">✔ '+q.t+'</span></div>';
      });
      html+='<div class="prow head"><span class="nm">ДОРУЧЕННЯ СЕЛЯН</span></div>';
    for(const k in IB.SIDES){
      const sd=IB.SIDES[k];
      const st=IB.G.flags['side_'+k+'_done']?'✔ виконано':(IB.G.quests.side[k]?'► в роботі':'— не взято');
      html+='<div class="prow'+(IB.G.flags['side_'+k+'_done']?' done':'')+'"><span class="nm">'+sd.t+'</span><span class="ds">'+sd.npc+'</span><span class="'+(st.startsWith('✔')?'ok':'no')+'">'+st+'</span></div>';
    }
    }
    if(TAB==='quests'){
      html+='<div class="prow head"><span class="nm">СУВЕНІРИ МОРЕ ('+IB.G.arts.length+'/8)</span></div>';
      IB.ARTIFACTS.forEach(a=>{
        if(IB.artHas(a.id))html+='<div class="pcard"><b>🏺 '+a.name+'</b><div class="ds">'+a.lore+'</div></div>';
        else html+='<div class="prow"><span class="nm">??? </span><span class="ds">'+(a.world?'прихований у місті':'нагорода за квест')+'</span></div>';
      });
    }
    if(TAB==='events'){
      /* v18: події літа — акт, сьогоднішня подія, журнал сцени */
      const an=IB.actName?IB.actName():'';
      if(an)html+='<div class="pcard"><b>🎬 '+an+'</b><div class="ds">'+(IB.actDesc?IB.actDesc():'')+'</div></div>';
      const ev=IB.eventToday?IB.eventToday():null;
      const EVN={fish:'🐟 РИБНИЙ ФЕСТИВАЛЬ на набережній (вилов ×2)',basket:'🏀 ДЕНЬ БАСКЕТБОЛУ у дворах (приз ×2)',cinema:'🎬 КІНО НА ПІСКУ (вечір, екран на пляжі)',fair:'🏪 ЯРМАРОК СЕЛ на набережній'};
      if(ev&&EVN[ev])html+='<div class="pcard"><b>СЬОГОДНІ: '+EVN[ev]+'</b></div>';
      html+='<div class="prow head"><span class="nm">ЖУРНАЛ СЦЕН</span></div>';
      IB.G.journal.forEach(j=>{
        html+='<div class="prow"><span class="q">'+j.icon+'</span><span class="nm" style="font-size:7px">Д'+j.d+' '+j.t+' — '+j.txt+'</span></div>';
      });
    }
    if(TAB==='sms'){
      const chats=IB.PHONE&&IB.PHONE.chats?Object.values(IB.PHONE.chats):[];
      if(!chats.length)html+='<div class="prow"><span class="nm">СМС поки немає</span></div>';
      chats.slice(-12).forEach(c=>{
        const last=c.msgs&&c.msgs[c.msgs.length-1];
        html+='<div class="prow"><span class="q">✉</span><span class="nm">'+(c.name||c.id)+'</span><span class="ds" style="font-size:7px">'+(last?(last.who+': '+last.txt).slice(0,60):'')+'</span></div>';
      });
    }
    if(TAB==='stamps'){
      const st=IB.G.stamps||{};
      html+='<div class="prow head"><span class="nm">ШТАМПИ МОРЕ-ТУР ('+Object.keys(st).length+'/'+IB.W.ROUTES.length+')</span></div>';
      IB.W.ROUTES.forEach(r=>{
        const s2=st[r.id];
        html+='<div class="prow'+(s2?' done':'')+'"><span class="nm">'+(s2?'✔ ':'○ ')+r.name+'</span>'+(s2?'<span class="ok">Д'+s2.d+'</span>':'')+'</div>';
      });
    }
    return html;
  }
  function bindJournal(body){
    body.querySelectorAll('[data-jt]').forEach(el=>{
      el.onclick=()=>{IB.G.jtab=el.dataset.jt;IB.SFX.ui&&IB.SFX.ui();
        const inner=body.querySelector('#pv-body')||body;inner.innerHTML=journalHtml();bindJournal(body);};
    });
    const wn=body.querySelector('[data-wn]');
    if(wn)wn.onclick=()=>{
      const w=IB.whatNext?IB.whatNext():null;
      if(w&&IB.goWalk)IB.goWalk(w.pt);
    };
  }
  function openJournal(){mode='panel';openPanel('ЖУРНАЛ ПОХОДУ',journalHtml());
    const pb=IB.$('panel-body');if(pb)bindJournal(pb);}
  IB.APPVIEWS.journal=(body)=>{body.innerHTML='<div id="pv-body">'+journalHtml()+'</div>';bindJournal(body);};

  /* БАГАЖ */
  function bagHtml(){
    let html='<div class="prow head"><span class="nm">РЕСУРСИ</span><span class="ds"></span><span class="ok">₴'+IB.G.money+'</span></div>';
    const inv=IB.G.inv;
    const names={wood:'Дерево',berries:'Ягоди',mush:'Мідії',herb:'Водорості',fishraw:'Риба (сира)',potato:'Картопля',water:'Запас води',
      bread:'Хліб',brinza:'Бринза',canned:'Консерви',eggs:'Яйця',cookfish:'Смажена риба',yushka:'Юшка',banosh:'Плов портовий',kulesh:'Макарони з сиром',
      nalyva:'Наливка',beer:'Пиво',wine:'Вино',vodka:'Горілка',rozsol:'Розсіл',kava:'Кава',trip5:'✦ «П\'ять Хвиль»'};
    for(const k in names){
      if(!inv[k])continue;
      html+='<div class="prow"><span class="nm">'+names[k]+'</span><span class="q">×'+inv[k]+'</span></div>';
    }
    html+='<div class="prow head"><span class="nm">ЇСТИ (1)</span></div>';
    const foods=Object.keys(IB.FOODS).filter(k=>inv[k]>0);
    foods.forEach(k=>{
      html+='<div class="prow click" data-eat="'+k+'"><span class="nm">'+IB.FOODS[k].n+'</span><span class="ds">+'+IB.FOODS[k].food+' їжі</span><span class="q">×'+inv[k]+'</span></div>';
    });
    if(!foods.length)html+='<div class="prow"><span class="no">Немає їжі — збирай/купуй/готуй</span></div>';
    html+='<div class="prow head"><span class="nm">ПИТИ (2)</span></div>';
    const drinks=Object.keys(IB.DRINKS).filter(k=>k==='water'?inv.water>0:inv[k]>0);
    drinks.forEach(k=>{
      const nm=IB.DRINKS[k].n+(k==='water'?' (запас)':'');
      html+='<div class="prow click" data-drink="'+k+'"><span class="nm">'+nm+'</span><span class="ds">+'+IB.DRINKS[k].water+' води'+(IB.DRINKS[k].alc?' • алкоголь ×'+IB.DRINKS[k].alc:'')+'</span><span class="q">×'+(k==='water'?inv.water:inv[k])+'</span></div>';
    });
    html+='<div class="prow head"><span class="nm">ГОТУВАННЯ</span></div>';
    IB.RECIPES.forEach((r,i)=>{
      const need=Object.keys(r.need).map(k=>k+' ×'+r.need[k]).join(', ');
      html+='<div class="prow click" data-cook="'+i+'"><span class="nm">'+r.n+'</span><span class="ds">'+need+' (на плиті)</span></div>';
    });
    return html;
  }
  function bindBag(body,rer){
    const re=()=>{(rer||openBag)();};
    body.querySelectorAll('[data-eat]').forEach(el=>{el.onclick=()=>{if(IB.eat(IB.E.team[0],el.dataset.eat))re();};});
    body.querySelectorAll('[data-drink]').forEach(el=>{el.onclick=()=>{if(IB.drink(IB.E.team[0],el.dataset.drink))re();};});
    body.querySelectorAll('[data-cook]').forEach(el=>{el.onclick=()=>{IB.cook(+el.dataset.cook);re();};});
  }
  function openBag(){mode='panel';openPanel('БАГАЖ ГРУПИ',bagHtml());bindBag(IB.$('panel-body'));}
  IB.APPVIEWS=IB.APPVIEWS||{};
  IB.APPVIEWS.bag=(body)=>{body.innerHTML=bagHtml();bindBag(body,()=>IB.APPVIEWS.bag(body));};

  /* КАРТА */
  function mapHtml(){
    return '<div id="map-row"><canvas id="mapc" width="470" height="430"></canvas><div id="map-side"></div></div>';
  }
  function bindMap(body){
    const c=body.querySelector('#mapc');
    /* v18 М3: КАРТА З ШАРАМИ — ЗАВДАННЯ / ЛЮДИ / МІСТО / АДРЕСИ */
    IB.G.mapLy=IB.G.mapLy||{tasks:1,people:1,city:1,addr:1};
    if(IB.G.mapLy.addr===undefined)IB.G.mapLy.addr=1;
    let lyh='<div class="map-layers">'+
      '<button data-ly="tasks" class="'+(IB.G.mapLy.tasks?'on':'')+'">ЗАВДАННЯ</button>'+
      '<button data-ly="people" class="'+(IB.G.mapLy.people?'on':'')+'">ЛЮДИ</button>'+
      '<button data-ly="city" class="'+(IB.G.mapLy.city?'on':'')+'">МІСТО</button>'+
      '<button data-ly="addr" class="'+(IB.G.mapLy.addr?'on':'')+'">🏠 АДРЕСИ</button></div>';
    c.insertAdjacentHTML('beforebegin',lyh);
    const redrawMap=()=>{
      IB.drawBigMap(c);
      drawMapLayers(c);
    };
    redrawMap();
    body.querySelectorAll('[data-ly]').forEach(el=>{
      el.onclick=()=>{
        const k=el.dataset.ly;IB.G.mapLy[k]=IB.G.mapLy[k]?0:1;
        el.classList.toggle('on',!!IB.G.mapLy[k]);
        IB.SFX.ui&&IB.SFX.ui();redrawMap();
      };
    });
    /* список локацій */
    const side=body.querySelector('#map-side');
    let h='';
    /* v24.0: БАЗА П'ЯТІРКИ — ПЕРШИЙ ПУНКТ КАРТИ */
    const bw=IB.baseHome&&IB.baseHome();
    if(bw){
      const left=bw.expDay-IB.G.day;
      h+='<div class="map-it base" data-x="'+bw.door.x+'" data-y="'+bw.door.y+'"><b>🏠 НАША БАЗА — '+bw.addr+'</b><small>відпочинок • їжа • гулянка • ЗАРЯДКА ВСІХ • СКЛАД • '+(bw.mode==='own'?'ВЛАСНІСТЬ':'оренда до дня '+bw.expDay+(left<=3?' — ⚠ '+left+' дн!':''))+'</small></div>';
    }
    /* i3/v2.0: локації Чорноморська (координати v2 карти) */
    const MPS=[['ПЛЯЖ ЦЕНТРАЛЬНИЙ',160,455,'загоряти, плавати, футбол, волейбол'],
      ['ПІРС «ЗАХІД СОНЦЯ»',179,478,'фото, парашут, дельфіни'],
      ['БРОНКС',262,384,'крута хата з двором'],
      ['ЧОРНОМОРСЬКИЙ ПОРТ',380,396,'пором, зміна вантажника, крани'],
      ['ЯХТ-КЛУБ «ВІТЕР»',20,402,'рибалка в морі'],
      ['РИНОК «ЦЕНТРАЛЬНИЙ»',320,153,'арбузи, провізія, вода'],
      ['РИНОК «ПІВНІЧНИЙ»',98,62,'північний масив — все дешевше'],
      ['ПРИМОРСЬКИЙ ПАРК',96,370,'тінь, лавки, екстрим-парк'],
      ['ЛУНА-ПАРК',136,164,'колесо огляду, карусель, автодром, батут'],
      ['ПАРК ЯКОРІВ',212,164,'старовинні якорі'],
      ['УКРПОШТА',200,47,'листи по районах (квест Юри)'],
      ['ПЛОЩА + СХОДИ',214,410,'155 сходинок до пляжу, стела'],
      ['МІСТ — СУХИЙ ЛИМАН',390,293,'рибалка Гриші, риба лиману'],
      ['СЗ «ПАЛЛАДА»',362,307,'екскурсія на завод'],
      ['РІЕЛТОР «БІЛЯ МОРЕ»',88,153,'квартири! (і у телефона — ЖИТЛО)'],
      ['ЧОРНОМОРСЬКИЙ МАЯК',425,489,'вид на все місто'],
      ['МІСЬКА РАДА',170,133,'план районів'],
      ['МОРЕВАКЗАЛ',353,399,'пороми Варна/Стамбул/Поті'],
      ['КЛУБ «МАЯК»',322,386,'туси і РЕЙВ п\'ятниці'],
      ['СЕРФ-ШКОЛА «ХВИЛЯ»',308,412,'дошки, урок серфінгу'],
      ['СОВІНЬЙОН',268,22,'котеджі одеської пані'],
      ['КРИЖАНІВКА',60,22,'сади громади']];
    MPS.forEach(m=>{h+='<div class="map-it" data-x="'+m[1]+'" data-y="'+m[2]+'"><b>'+m[0]+'</b><small>'+m[3]+'</small></div>';});
    h+='<div class="map-it" data-trav="1"><b>МОРСЬКІ РОЗВАГИ</b><small>катамаран, парашут, пором, кіно (клавіша T)</small></div>';
    /* v1.4: колекція штампів на карті */
    const nst=Object.keys(IB.G.stamps||{}).length;
    h+='<div class="map-it" data-stamps="1"><b>ШТАМПИ: '+nst+'/'+IB.W.ROUTES.length+' ✉</b><small>пройдені маршрути «Море-Тур»</small></div>';
    /* v24.0: МОЇ АДРЕСИ у списку карти + підсказки */
    const vis=(IB.G.visited||[]).slice(-10).reverse();
    if(vis.length){
      h+='<div class="map-cap">📍 МОЇ АДРЕСИ (був / комунікував / зняв — тап → маршрут):</div>';
      for(const v of vis)h+='<div class="map-it vis" data-x="'+v.x+'" data-y="'+v.y+'"><b>📍 '+v.name+'</b><small>день '+v.day+' • тап → маршрут, адреса також у ТАКСІ/GPS</small></div>';
    }
    h+='<div class="map-cap">💡 ПІДСКАЗКИ: 🏠 БАЗА — сон/зарядка всіх, їжа, СКЛАД (все що знімаємо) • квартира орендується НА 30 ДНІВ, Віра нагадує за 3 дні • виїзд = склад пропадає • будинок, де ти був/спілкувався, зʼявляється у ТАКСІ і GPS («МОЇ АДРЕСИ») • тап по канві — маршрут у будь-яку точку.</div>';
    side.innerHTML=h;
    const stm=side.querySelector('.map-it[data-stamps]');
    if(stm)stm.onclick=()=>openTravels();
    const setRoute=(x,y)=>{if(!(x>=0)||!(y>=0))return;IB.G.route={x,y};IB.toast('Маршрут прокладено — стрілка веде','gold');IB.SFX.ui();};
    side.querySelectorAll('.map-it').forEach(el=>{el.onclick=()=>setRoute(+el.dataset.x,+el.dataset.y);});
    const trv=side.querySelector('.map-it[data-trav]');
    if(trv)trv.onclick=()=>goTrav();
    c.onclick=(ev)=>{
      const r=c.getBoundingClientRect();
      const x=(ev.clientX-r.left)/r.width*IB.W.W;
      const y=(ev.clientY-r.top)/r.height*IB.W.H;
      if(x<44&&y<30){goTrav();return;} /* i3 */
      setRoute(IB.M.round(x),IB.M.round(y));
      redrawMap();
    };
    }
  /* v18 М3: ОВЕРЛЕЇ ШАРІВ НА ВЕЛИКІЙ КАРТІ */
  function drawMapLayers(c){
    const g=c.getContext('2d');
    const sc=c.width/IB.W.W,scY=c.height/IB.W.H;
    const X=v=>v*sc,Y=v=>v*scY;
    const LY=IB.G.mapLy||{tasks:1,people:1,city:1};
    if(LY.tasks){
      const active=IB.QUESTS.find(q=>q.id===IB.G.quests.active);
      const loc=active&&active.loc?active.loc():null;
      if(loc){
        g.fillStyle='#f0d050';g.beginPath();
        g.moveTo(X(loc.x),Y(loc.y)-10);g.lineTo(X(loc.x)+7,Y(loc.y));g.lineTo(X(loc.x),Y(loc.y)+9);g.lineTo(X(loc.x)-7,Y(loc.y));g.closePath();g.fill();
        g.fillStyle='#20262c';g.font='7px monospace';g.textAlign='center';
        g.fillText('КВЕСТ',(X(loc.x)),Y(loc.y)+18);
        g.textAlign='left';
      }
    }
    if(LY.people){
      for(const h of IB.E.team){
        g.fillStyle='#f0d050';g.beginPath();g.arc(X(h.x),Y(h.y),3,0,6.283);g.fill();
        g.strokeStyle='#20262c';g.stroke();
      }
      const known=[['Сі',262,378],['Ні',352,434]];
      for(const k of known){
        g.fillStyle='#f070a0';g.beginPath();g.arc(X(k[1]),Y(k[2]),3,0,6.283);g.fill();
      }
      g.fillStyle='rgba(224,74,58,0.18)';g.fillRect(X(252),Y(370),X(286)-X(252),Y(400)-Y(370)); /* БРОНКС */
    }
    if(LY.city){
      let pois=null;
      try{pois=typeof IB.PHONE_DESTS==='function'?IB.PHONE_DESTS():IB.PHONE_DESTS;}catch(e){pois=null;}
      if(!Array.isArray(pois))pois=[];
      for(const p of pois){
        if(!(p&&p.x>0))continue;
        g.fillStyle='#3aa0e0';g.beginPath();g.arc(X(p.x),Y(p.y),2.2,0,6.283);g.fill();
      }
    }
    /* v24.0: ШАР «АДРЕСИ» — БАЗА (велика 🏠) + відвідані адреси (зелені) */
    if(LY.addr){
      const bw2=IB.baseHome&&IB.baseHome();
      if(bw2){
        g.fillStyle='#f0d050';g.beginPath();g.arc(X(bw2.door.x),Y(bw2.door.y),5,0,6.283);g.fill();
        g.strokeStyle='#20262c';g.lineWidth=1;g.stroke();
        g.fillStyle='#f0d050';g.font='7px monospace';g.fillText('🏠 БАЗА',X(bw2.door.x)+7,Y(bw2.door.y)+2);
      }
      g.fillStyle='#6ee04a';
      for(const v of (IB.G.visited||[]))g.fillRect(X(v.x)-2,Y(v.y)-2,4,4);
    }
  }
  const goTrav=()=>{(IB.PHONE&&IB.PHONE.open&&IB.PHONE.app==='map'&&IB.openPhoneApp)?IB.openPhoneApp('fun'):openTravels();};
  function openMap(){mode='map';openPanel('КАРТА ЧОРНОМОРСЬКА — КЛІК = МАРШРУТ','');const body=IB.$('panel-body');body.innerHTML=mapHtml();bindMap(body);}
  IB.APPVIEWS.map=(body)=>{body.innerHTML=mapHtml();bindMap(body);};

  /* ---------- ГОТ-БАР 1-4 ---------- */
  function hotbar(k){
    const L=IB.E.team[0];
    if(k==='1'){
      const foods=Object.keys(IB.FOODS).filter(x=>IB.G.inv[x]>0);
      if(!foods.length){IB.toast('Немає їжі! Збирай ягоди, рибаль, купуй','red');return;}
      foods.sort((a,b)=>IB.FOODS[b].food-IB.FOODS[a].food);
      IB.eat(L,foods[0]);
    }else if(k==='2'){
      if(IB.G.inv.water>0&&IB.DRINKS.water){IB.drink(L,'water');return;}
      const drinks=['rozsol','kava','beer','nalyva','wine','vodka'].filter(x=>IB.G.inv[x]>0);
      if(!drinks.length){IB.toast('Немає напиток — E біля води','red');return;}
      IB.drink(L,drinks[0]);
    }else if(k==='3'){
      /* i3: сон у своєму житлі — v24: БАЗА (квартира або дім ріелтора) */
      let atHome=false;
      const bw=IB.baseHome&&IB.baseHome();
      if(bw)atHome=IB.dist(L.x,L.y,bw.door.x,bw.door.y)<7;
      IB.sleepTillMorning(atHome);
      IB.saveGame();
    }else if(k==='4'){
      IB.G.t=(IB.G.t+1)%24;
      for(const h of IB.E.team){h.hp=IB.clamp(h.hp+8,0,100);h.mood=IB.clamp(h.mood+2,0,100);}
      IB.toast('Година відпочинку: сили відновлено трохи');
    }
  }

  /* ---------- КЛЮЧІ ---------- */
  function handleKeys(dt){
    if(mode==='boot'){
      if(bootReady&&(Object.keys(pressed).some(k=>pressed[k]))){clearP();toTitle();}
      return;
    }
    if(mode==='title'){
      if(consume('w')||consume('up')){menuIdx=(menuIdx-1+(IB._menuItems||[]).length)%(IB._menuItems||[]).length;buildMenu(IB._menuItems);}
      if(consume('s')||consume('down')){menuIdx=(menuIdx+1)%(IB._menuItems||[]).length;buildMenu(IB._menuItems);}
      if(consume('e')||consume('enter')||consume('space')){const it=(IB._menuItems||[])[menuIdx];if(it)it.f();}
      clearP();return;
    }
    if(IB._sceneOpen){
      if(consume('e')||consume('enter')||consume('space'))IB.closeScene();
      clearP();return;
    }
    if(mode==='dialog'){dlgKey();clearP();return;}
    if(mode==='summit'){
      /* v1.4: кіно-момент — будь-яка клавіша завершує */
      if(consume('e')||consume('enter')||consume('space')||consume('esc'))IB.SUMMIT_END();
      clearP();return;
    }
    if(mode==='phone'){
      if(consume('esc')||consume('ph')||consume('p'))IB.togglePhone?IB.togglePhone():IB.closePhone();
      clearP();return;
    }
    if(mode==='panel'||mode==='map'){
      if(consume('esc')||consume('tab')||consume('m'))closePanel();
      clearP();return;
    }
    if(mode==='about'){
      if(consume('esc')||consume('enter')||consume('e')||consume('space'))closePanel();
      clearP();return;
    }
    if(mode==='climb'){
      if(consume('esc')){IB.TRAVEL_ABORT();clearP();return;}
      if(consume('e')||consume('enter')||consume('space'))climbStep();
      clearP();return;
    }
    if(mode==='interior'){
      if(consume('esc')){exitInterior();clearP();return;}
      if(consume('e')||consume('enter'))interiorInteract();
      clearP();return;
    }
    /* v16: МАТЧІ (футбол/баскетбол 3×2) — E пас, ✊ удар/кидок */
    if(mode==='match'){
      IB.matchKeys&&IB.matchKeys(dt);
      clearP();return;
    }
    /* v23: ВОЛЕЙБОЛ 2×2 — E відбий/пас, ✊ подача/удар */
    if(mode==='vball'){
      IB.vballKeys&&IB.vballKeys(dt);
      clearP();return;
    }
    /* v16: ПОКЕР-ХОЛДЕМ */
    if(mode==='poker'){
      if(consume('esc'))IB.holdemStand&&IB.holdemStand(true);
      clearP();return;
    }
    /* v18.7: КЛУБ-ДІЙСТВО / ЇЖА-ДІЙСТВО — кіно на канві, ESC — достроково */
    if(mode==='clubshow'){
      IB.clubShowTick&&IB.clubShowTick(dt);
      if(consume('esc'))IB.clubShowEnd&&IB.clubShowEnd();
      clearP();return;
    }
    if(mode!=='game'){clearP();return;}
    /* game mode */
    if(IB.radialOpen&&IB.radialOpen()){
      for(let d=1;d<=6;d++)if(consume(''+d)){const it=(IB._radialItems||[])[d-1];if(it){closeRadial();it.f();}clearP();return;}
      if(consume('e')){closeRadial();clearP();return;}
    }
    if(IB.actMenuOpen&&IB.actMenuOpen()){
      for(let d=1;d<=9;d++)if(consume(''+d)){const it=(IB._actItems||[])[d-1];if(it){IB.closeActMenu();it.f();}clearP();return;}
    }
    if(consume('e')){
      if(IB.fishing.active){
        if(!IB.fishCatch()){IB.toast('Риба ще не клює...');}
      } else doInteract();
    }
    if(consume('m'))IB.openPhoneApp?IB.openPhoneApp('bag'):openBag();        /* v10: багаж — у телефона */
    if(consume('i'))IB.openPhoneApp?IB.openPhoneApp('bag'):openBag();
    if(consume('grp'))IB.heroPop?IB.heroPop(0):openGroupPanel();              /* v10: G — ІНФО І ВИБІР гравця (шапка) */
    if(consume('ph')){IB.chipDone&&IB.chipDone('p');IB.togglePhone?IB.togglePhone():IB.openPhone();}   /* v7.0: ТЕЛЕФОН */
    if(consume('jrnl'))IB.openPhoneApp?IB.openPhoneApp('journal'):openJournal(); /* v10: журнал — у телефона */
    if(consume('t'))IB.openPhoneApp?IB.openPhoneApp('fun'):openTravels();    /* v10: розваги — у телефона */
    if(consume('tab'))IB.openPhoneApp?IB.openPhoneApp('map'):openMap();      /* v10: карта — у телефона */
    if(consume('q')){IB.chipDone&&IB.chipDone('q');IB.startParty();}
    if(consume('srch'))IB.startSearch();
    if(consume('f'))IB.toggleTorch();
    if(consume('atk'))IB.punchNearest();  /* v3.0: X — битка */
    if(consume('1'))hotbar('1');
    if(consume('2'))hotbar('2');
    if(consume('3'))hotbar('3');
    if(consume('4'))hotbar('4');
    if(consume('fs'))toggleFullscreen();
    if(consume('esc')){IB.saveGame();IB.toast('Гру збережено (ESC)','gold');}
    clearP();
  }

  /* ---------- ФУЛЛСКРІН ---------- */
  function isFs(){return !!(document.fullscreenElement||document.webkitFullscreenElement||document.body.classList.contains('fakefs'));}
  /* v18.5: ⛶ ПОВЕРНУЛИ ВГОРІ (гравець з телефона: «поверни зверху іконку
     розвернути на весь екран»). Де requestFullscreen працює (Android/ПК) —
     справжній фулскрін; де НЕ працює (iOS Safari на div) — «фейковий» режим
     body.fakefs: #crt фіксується на всю сторінку. Стан кнопки — .on */
  function fsSync(){
    const bf=IB.$('btn-fs');
    if(bf)bf.classList.toggle('on',isFs());
    setTimeout(()=>{try{fitCanvas();}catch(e){}},60);
  }
  function fakeFs(){
    document.body.classList.toggle('fakefs',!document.body.classList.contains('fakefs'));
    fsSync();
  }
  function toggleFullscreen(){
    if(isFs()&&!document.body.classList.contains('fakefs')){
      (document.exitFullscreen||document.webkitExitFullscreen||function(){}).call(document);
      setTimeout(fsSync,100);return;
    }
    if(document.body.classList.contains('fakefs')){document.body.classList.remove('fakefs');fsSync();return;}
    const el=IB.$('crt');
    const rq=el.requestFullscreen||el.webkitRequestFullscreen;
    if(rq){try{const p=rq.call(el);if(p&&p.catch)p.catch(()=>fakeFs());setTimeout(fsSync,150);}catch(e){fakeFs();}}
    else fakeFs();
  }

  /* ---------- v11: КАПВА ПІД АСПЕКТ ЕКРАНА — НІЧОГО ЧОРНОГО НІЗУ/ЗБОКУ ----------
     Гравець з телефона: портрет/ландшафт/десктоп — канва сама підганяє роздільність
     під аспект вікна (рідний рендер малює бІльшу частину світу), CSS розтягує 1:1. */
  /* v16: розмір = РЕАЛЬНИЙ бокс #crt (фулскрін і консоль-режим) — канва завжди
     під аспект контейнера: ЖОДНОГО чорного знизу/збоку, карта завжди ціла */
  function fitCanvas(){
    const crt=IB.$('crt');
    const vw=(crt&&crt.clientWidth)||(window.innerWidth||480);
    const vh=(crt&&crt.clientHeight)||(window.innerHeight||336);
    let w=480, h=IB.M.round(480*IB.M.max(1,vh)/IB.M.max(1,vw));
    if(h>1000){h=1000;w=IB.M.round(1000*vw/vh);}   /* високий портрет — до 1000 рядів */
    else if(h<300){h=300;w=IB.M.round(300*vw/vh);} /* ландшафт — мінімум 300 рядів */
    w=IB.M.max(300,IB.M.min(1000,w));
    if(cv&&(cv.width!==w||cv.height!==h)){cv.width=w;cv.height=h;g.imageSmoothingEnabled=false;}
    IB.GFX.VW=w;IB.GFX.VH=h;
  }
  IB.fitCanvas=fitCanvas;

  /* ---------- v11: СПЛИВАЮЧІ ВІКНА — карта і телефон ---------- */
  IB.toggleMapPanel=(open)=>{
    const mp=IB.$('map-panel');if(!mp)return;
    const willOpen=(open===true)?true:(open===false)?false:mp.classList.contains('hidden');
    mp.classList.toggle('hidden',!willOpen);
    if(willOpen){
      const mc=IB.$('mp-canvas');
      if(mc&&IB.drawGpsAny)IB.drawGpsAny(mc);
      const mz=IB.$('mp-zone');if(mz&&IB.E.team[0])mz.textContent=IB.W.zoneAt(IB.E.team[0].x,IB.E.team[0].y);
      const sel=IB.$('mp-sel');if(sel)sel.classList.add('hidden');
      IB.SFX.ui&&IB.SFX.ui();
    }
  };

  /* ---------- ЦИКЛ ---------- */
  function loop(ts){
    requestAnimationFrame(loop);
    const dt=IB.M.min(0.05,(ts-last)/1000||0.016);last=ts;
    if(mode==='boot'||mode==='title'){
      if(mode==='title'){/* лого вже намальовано */}
      handleKeys(dt);
      return;
    }
    /* оновлення світу */
    if(IB.G.mode==='game'){
      handleKeys(dt);
      if(mode==='summit'){
        /* кіно-момент: світ завмер, панорама грає; автозавершення */
        IB.SUMMIT.t+=dt;
        if(IB.SUMMIT.t>3.6)IB.SUMMIT_END();
      }
      else if(mode==='climb'||mode==='interior'){
        /* світ на паузі: час іде кроками сходження, у інтер'єрі — живий рух */
        if(mode==='interior'&&IB._intMove)IB._intMove(dt);
      }else{
      updateLeader(dt);
      if(!IB.G.party.active&&!IB.G.trip.active){
        IB.updateNpcs(dt);IB.updateAnimals(dt);IB.updateTourist(dt);IB.updateTeam(dt);IB.updateCars(dt);
        IB.eventsTick(dt);IB.fishTick(dt);
        IB.updateBeasts(dt);IB.searchTick(dt); /* v1.5: звірі + пошук */
        IB.updateGangs(dt); /* v3.0: банди (v6.0: свої не бʼють) */
        IB.updateNav&&IB.updateNav(dt); /* v6.0: GPS-автохід */
        IB.updateSiNi&&IB.updateSiNi(dt);   /* v3.1: дядя Сі і тітка Ні */
        IB.dateTick&&IB.dateTick(dt);       /* v3.1: побачення — повернення героїв */
        IB.radioTick&&IB.radioTick(dt);     /* v3.1: радіо 103.2 FM */
        IB.sideTick&&IB.sideTick(dt);          /* v5.0: побічні квести */
        IB.updateTaxi&&IB.updateTaxi(dt);       /* v5.0: ТАКСІ */
        IB.updateBook&&IB.updateBook(dt);       /* v23.0: БУКМЕКЕР — розрахунок ставок */
        IB.updateMarsh&&IB.updateMarsh(dt);     /* v5.0: МАРШРУТКА №7 */
        IB.updateMarshRider&&IB.updateMarshRider(dt);
        IB.updateHeroTasks&&IB.updateHeroTasks(dt); /* v5.0: зустрічі/соло/пляж */
        IB.updatePhoneEvents&&IB.updatePhoneEvents(dt); /* v5.0: СМС-події */
        IB.sideTick&&IB.sideTick(dt);          /* v5.0: побічні квести */
      }
      if(IB.G.party.active)IB.updateTeam(dt); /* v2.3: герої танцюють, поки гулянка */
      IB.timeTick(dt);
      IB.survTick(dt);
      if(IB.G.party.active)IB.partyTick(dt);
      if(IB.G.sunShow&&IB.G.sunShow.active)IB.sunShowTick&&IB.sunShowTick(dt); /* v16: дійство-засмага */
      if(IB.G.trip.active)IB.tripTick(dt);
      IB.updateFx(dt);
      /* віза оновлення HUD */
      hudT+=dt;if(hudT>0.2){hudT=0;updateHUD();promptChannel();}
      autoT+=dt;if(autoT>120){autoT=0;IB.saveGame();}
      }
    }
    if(mode==='climb')((IB.TRAVEL_CUR&&(IB.TRAVEL_CUR.route.kind==='sea'||IB.TRAVEL_CUR.route.kind==='city'))?IB.drawVoyage(g,dt):IB.drawAscent(g,dt));
    else if(mode==='summit')IB.drawSummit(g,dt);
    else if(mode==='interior')IB.drawInterior(g,dt);
    else if(mode==='match')IB.drawMatch&&IB.drawMatch(g,dt);
    else if(mode==='vball')IB.drawVolley&&IB.drawVolley(g,dt); /* v23.0 */
    else if(mode==='poker')IB.drawHoldem&&IB.drawHoldem(g,dt);
    else if(mode==='clubshow')IB.drawClubShow&&IB.drawClubShow(g,dt); /* v18.7: дійства */
    else IB.renderWorld(g,dt);
    IB.syncPads&&IB.syncPads(); /* v18.6: показ/приховання великих кнопок матчів/покера */
    /* fps */
    acc+=dt;
    if(acc>1){const f=IB.$('fps');if(f)f.textContent=IB.M.round(1/dt)+' FPS';acc=0;}
  }

  /* ---------- КНОПКИ КОНСОЛІ ---------- */
  function bindConsole(){
    const bp=IB.$('btn-power');
    if(bp)bp.onclick=()=>{bp.classList.toggle('active');IB.toast(bp.classList.contains('active')?'ЖИВЛЕННЯ: УВІМКНЕНО':'ЖИВЛЕННЯ: ВИМКНЕНО (сумнівно)');};
    const br=IB.$('btn-reset');
    if(br)br.onclick=()=>location.reload();
    /* v18.5: ⛶ ПОВЕРНУЛИ ВГОРІ екрана — фулскрін одним тапом (V і подвійний
       клік теж працюють); ℹ лишається у заставці і у телефона */
    const bf=IB.$('btn-fs');
    if(bf)bf.addEventListener('click',ev=>{ev.stopPropagation();toggleFullscreen();});
    document.addEventListener('fullscreenchange',fsSync);
    document.addEventListener('webkitfullscreenchange',fsSync);
    /* v11: 🖥 — класична консоль (ПК, з картриджем і about) ↔ гра на весь екран */
    const bc=IB.$('btn-console');
    if(bc)bc.onclick=()=>{
      const on=document.body.classList.toggle('consolemode');
      try{localStorage.setItem('ib3mode',on?'console':'full');}catch(e){}
      IB.toast(on?'🖥 СТОРІНКА З ОПИСОМ І КОНСОЛЬ':'📺 ГРА НА ВЕСЬ ЕКРАН');
      fitCanvas();
    };
    cv.addEventListener('dblclick',toggleFullscreen);
    IB.$('scene').addEventListener('click',()=>IB.closeScene());
    /* v1.4: ХРЕСТИКИ І КНОПКИ ЗАКРИТТЯ — працюють мишкою і тапом на мобільному */
    const px2=IB.$('panel-x');
    if(px2)px2.addEventListener('click',ev=>{ev.stopPropagation();IB.PANEL_CLOSE();});
    const dx2=IB.$('dlg-x');
    if(dx2)dx2.addEventListener('click',ev=>{ev.stopPropagation();closeDlg();IB.SFX.ui();});
    const pnl=IB.$('panel');
    if(pnl)pnl.addEventListener('pointerdown',ev=>{if(ev.target===pnl)IB.PANEL_CLOSE();});
    const ca=IB.$('climb-abort');
    if(ca)ca.addEventListener('click',()=>{if(mode==='climb')IB.TRAVEL_ABORT();});
    const ie=IB.$('int-exit');
    if(ie)ie.addEventListener('click',()=>{if(mode==='interior')exitInterior();});
    /* v1.4: клік по канвасу — крок сходження / завершення кіно-моменту */
    cv.addEventListener('pointerdown',(ev)=>{
      if(mode==='climb')climbStep();
      else if(mode==='summit')IB.SUMMIT_END();
      else if(mode==='poker'&&IB.holdemTap){
        const r=cv.getBoundingClientRect();
        IB.holdemTap((ev.clientX-r.left)/r.width*IB.GFX.VW,(ev.clientY-r.top)/r.height*IB.GFX.VH);
      }
    });
    /* журнал — клік по панелі квесту в HUD */
    const hm=IB.$('hud-mission');
    if(hm){hm.style.pointerEvents='auto';hm.style.cursor='pointer';hm.title='ЖУРНАЛ (J)';
      hm.addEventListener('click',()=>{if(mode==='game')openJournal();});}
    const am=IB.$('act-map');
    /* v22 (гравець: «карта відкривається натисненням на кнопку і закривається»):
       кнопка 🧭 КАРТА тепер ПЕРЕМИКАЧ — відкриває і закриває вікно карти */
    if(am)am.addEventListener('click',ev=>{ev.stopPropagation();IB.toggleMapPanel();});
    /* v18.3: кнопка 📱 СПРАВА ВГОРІ — відкрити/згорнути телефон (замість пігулки над джойстиком) */
    const bp2=IB.$('btn-phone');
    if(bp2)bp2.addEventListener('click',ev=>{ev.stopPropagation();
      if(IB.PHONE&&IB.PHONE.visible&&!IB.PHONE.min)IB.togglePhone();
      else IB.openPhone&&IB.openPhone();
    });
    /* v24.0: 🔊/🔇 КНОПКА ЗВУКУ ВГОРІ біля телефона — вимкнути музику одним тапом */
    const bm=IB.$('btn-music');
    if(bm)bm.addEventListener('click',ev=>{ev.stopPropagation();
      if(!IB.AUDIO)return;
      const m=IB.AUDIO.toggleMute();
      bm.textContent=m?'🔇':'🔊';
      IB.toast(m?'🔇 ЗВУК ВИМКНЕНО (музика і ефекти)':'🔊 ЗВУК УВІМКНЕНО');
      try{localStorage.setItem('ib3mute',m?'1':'0');}catch(e){}
    });
    if(bm){try{if(localStorage.getItem('ib3mute')==='1'){IB.AUDIO.toggleMute();bm.textContent='🔇';}}catch(e){}}
    /* тест тріп-фільтра на канвасі (CSS) */
  }

  /* ============ v1.2: МАНДРІВКИ / СХОДЖЕННЯ / ІНТЕР'ЄРИ / АЛЬБОМ ============ */
  IB.canTravel=(r)=>{
    const L=IB.E.team[0];
    if(r.kind==='peak'&&L.hp<30)return {ok:false,why:'лідер знесилений'};
    if(r.kind==='peak'||r.kind==='lake'||r.kind==='border'){
      if(IB.G.wx.type==='storm')return {ok:false,why:'шторм на море'};
      if(IB.G.wx.type==='hail')return {ok:false,why:'град'};
    }
    if(r.kind==='expedition'&&IB.G.money<10)return {ok:false,why:'потрібно ₴10 на пальне'};
    const totFood=(IB.G.inv.bread||0)+(IB.G.inv.berries||0)+(IB.G.inv.canned||0)+(IB.G.inv.yushka||0)+(IB.G.inv.banosh||0);
    if(r.kind==='peak'&&totFood<2)return {ok:false,why:'жодної закуски в рюкзаках'};
    if((r.kind==='peak')&&!(IB.G.inv.water>0||IB.G.inv.beer>0))return {ok:false,why:'нема води в рюкзаках'};
    return {ok:true};
  };

  function placeTeam(x,y){
    /* v2.4b: точка десанту — ЗАВЖДИ на прохідному досяжному тайлі. Раніше групу
       кидало у геометричний центр села/табору: у Барабої (67,157), Грибівці
       (22,101) і Лиманці це середина забудови — тайл перекритий хатою, і група
       «застрягала посеред вулиці». snapToReach веде на гарантований досяжний
       тайл (BFS-аудит v2.2), кожен герой — на сусідній прохідний. */
    const p=IB.snapToReach(IB.M.round(x),IB.M.round(y));
    x=p.x;y=p.y;
    IB.E.team.forEach((h,i)=>{
      let hx=x+(i-2)*0.6,hy=y+0.4+i*0.12;
      if(i>0&&!IB.walkable(hx,hy)){
        const q=IB.snapToReach(IB.M.round(hx),IB.M.round(hy));
        hx=q.x;hy=q.y;
      }
      h.x=hx;h.y=hy;h.tx=hx;h.ty=hy;h.target=null;h.fr=0;
    });
    const L=IB.E.team[0];L.x=x;L.y=y;L.tx=x;L.ty=y;L.target=null;L.fr=0;
  }

  function travelsHtml(){
    /* i3: МОРСЬКІ РОЗВАГИ — екскурсії та активності Чорноморська */
    const rs=IB.W.ROUTES||[];
    let h='<div class="pcard"><div class="ds"><b>МОРСЬКІ РОЗВАГИ ЧОРНОМОРСЬКА:</b> катамаран, парашут, човен з рибалкою, пором, кіно і музей. За кожну розвагу — штамп «Море-Тур» і фотосерія в альбом.</div></div>';
    rs.forEach((r,i)=>{
      const st=(IB.G.stamps||{})[r.id];
      const rough=(IB.G.wx.type==='storm'||IB.G.wx.type==='thunder')&&r.kind==='sea';
      h+='<div class="prow click'+(rough?' cant':'')+'" data-rv="'+i+'"><span class="nm">'+(st?'✉ ':'')+r.name+'</span><span class="ds">'+r.hours+' год • ₴'+r.cost+' • '+r.diff+'</span><span class="'+(st?'ok':(rough?'no':'ok'))+'">'+(st?('ШТАМП Д'+st.d):(rough?'✖ ШТОРМ':'ВИРУШАЙТИ ▶'))+'</span></div>';
    });
    const nst=Object.keys(IB.G.stamps||{}).length;
    h+='<div class="prow head"><span class="nm">ШТАМПИ «МОРЕ-ТУР»: '+nst+'/'+rs.length+' ✉</span><span class="ds">колекція на великій карті (TAB)</span><span class="ok">✉</span></div>';
    h+='<div class="prow head"><span class="nm">ФОТОАЛЬБОМ</span><span class="ds">кадрів: '+(IB.G.album?IB.G.album.length:0)+'</span><span class="ok">📷</span></div>';
    h+='<div class="prow click" data-alb="1"><span class="nm">Відкрити ФОТОАЛЬБОМ</span><span class="ds">полароїди групи</span><span class="ok">📷</span></div>';
    return h;
  }
  function bindTravels(body){
    /* v15.0: rs був поза областю видимості — кліки по маршрутах падали
       («rs is not defined»). Тепер список беремо тут. */
    const rs=IB.W.ROUTES||[];
    body.querySelectorAll('[data-rv]').forEach(el=>{
      el.onclick=()=>{
        const r=rs[+el.dataset.rv];
        if(r)excursionGo(r);
      };
    });
    const alb=body.querySelector('[data-alb]');
    if(alb)alb.onclick=()=>openAlbum();
  }
  function openTravels(){mode='panel';openPanel('МОРСЬКІ РОЗВАГИ',travelsHtml());bindTravels(IB.$('panel-body'));}
  IB.APPVIEWS.fun=(body)=>{body.innerHTML=travelsHtml();bindTravels(body);};
  /* v12: додаток ℹ ІНФО — та сама ВСЯ ІНФА, що і на сторінці/попапі */
  IB.APPVIEWS.info=(body)=>{
    const ab=document.getElementById('about');
    if(!ab){body.innerHTML='<p>Інфа ще завантажується…</p>';return;}
    const clone=ab.cloneNode(true);
    const h3=clone.querySelector('h3');if(h3)h3.remove();
    body.innerHTML=clone.innerHTML;body.scrollTop=0;
  };
  function excursionGo(r){
    if(r.kind==='sea'&&r.id!=='r_cine'&&r.id!=='r_museum'){
      if(r.id==='r_catam')return startCatam();
      if(r.id==='r_par')return startParas();
      if(r.id==='r_boat'){openYacht(null);return;}
      if(r.id==='r_ferry'){openPort(null);return;}
    }
    if(r.id==='r_cine')return openCine(null);
    if(r.id==='r_museum')return openMuseum(null);
    /* v3.0: одеські і паркові маршрути — ставимо маркер і штампуємо при відвідуванні */
    if(r.id==='r_odesa'){
      if(IB.G.money<200){IB.toast('Маршрутка на Одесу — ₴200','red');return;}
      IB.G.money-=200;closePanel();
      IB.banner('МАРШРУТКА НА ОДЕСУ — ВИРУШАЄМО!');
      IB.toast('Аркадія, Потьомкінські сходи, Приморський бульвар. Пів дня в Одесі — і назад до свого моря','gold');
      timeSkip(5);
      for(const h of IB.E.team)h.mood=IB.clamp(h.mood+16,0,100);
      IB.journalAdd('🚌','Одеса одним днем: Потьомкінські сходи, порт, знаменитий глухий кут «Ппомаранчеве» на Гагаріна. Повернулись у Чорноморськ.');
      IB.photoTaken({id:'sp_odesa_trip',name:'ОДЕСА — ПОТЬОМКІНСЬКІ СХОДИ',kind:'odesa',x:IB.E.team[0].x,y:IB.E.team[0].y});
      addStamp(r);
      IB.questCheck();IB.saveGame();
      return;
    }
    /* v15.0: визначні місця — ВІЗИТ одразу (штамп+фото+час); справжні
       поїздки містом і морем — сцена ПОДОРОЖІ (drawVoyage) */
    IB.closePhone&&IB.closePhone();
    if(r.id==='r_liman'||r.id==='r_baraboy'){startTravel(r);return;}
    routeVisit(r);
  }
  function routeVisit(r){
    closePanel();
    IB.G.route=null;
    IB.G.stats.trips=(IB.G.stats.trips||0)+1;
    IB.G.t+=IB.M.max(1,r.hours*0.5);if(IB.G.t>=24){IB.G.t-=24;IB.G.day++;}
    for(const h of IB.E.team)h.mood=IB.clamp(h.mood+10,0,100);
    IB.banner('ВІЗИТ: '+r.name);
    IB.toast(r.name+' — квитки придбані, штамп у колекції «Море-Тур»','gold');
    IB.journalAdd('🎫','Візит: '+r.name+' — '+IB.clockStr()+'. Штамп у колекції (карта TAB).');
    IB.photoTaken({id:'sp_'+r.id,name:r.name,kind:r.id==='r_wheel'?'lunapark':'city',x:r.x,y:r.y});
    addStamp(r);
    IB.SFX.coin();
    IB.questCheck();
    IB.saveGame();
  }

  function startTravel(r){
    closePanel();
    if(r.kind==='expedition'){
      IB.G.money-=10;
      IB.toast('₴10 на пальне — білий ван гуде','gold');
    }
    IB.G.route={x:r.x,y:r.y};
    if(r.kind==='walk'){
      const hrs=r.hours;
      IB.G.t+=hrs;if(IB.G.t>=24){IB.G.t-=24;IB.G.day++;}
      placeTeam(r.x,r.y);
      IB.G.stats.trips=(IB.G.stats.trips||0)+1;
      IB.banner('ДОБРАЛИСЬ: '+r.name);
      IB.journalAdd('🚐','Автостопом до «'+r.name+'» — '+(r.hours)+' год дороги. Трясло, але весело.');
      for(const h of IB.E.team)h.mood=IB.clamp(h.mood+4,0,100);
      IB.SFX.coin();
      addStamp(r);
      IB.saveGame();
      return;
    }
    IB.TRAVEL_CUR={route:r,prog:0};
    IB.$('hud').classList.add('hidden');
    IB.$('climb-abort').classList.remove('hidden');
    mode='climb';
    IB.banner('МАРШРУТ: '+r.name);
    IB.toast('E / клік — гребок/крок маршруту • ✖ ПЕРЕРВАТИ — повернутись');
  }

  /* v1.4: ТУРИСТИЧНИЙ ШТАМП за пройдений маршрут — колекція на карті (TAB) */
  function addStamp(r){
    if(!r||!r.id)return;
    IB.G.stamps=IB.G.stamps||{};
    if(IB.G.stamps[r.id])return;
    IB.G.stamps[r.id]={d:IB.G.day,name:r.name};
    const n=Object.keys(IB.G.stamps).length;
    IB.banner('НОВИЙ ШТАМП ✉ '+n+'/'+IB.W.ROUTES.length+': '+r.name);
    IB.journalAdd('✉','Туристичний штамп «'+r.name+'» — у колекції. Дивись на карті (TAB).');
    IB.toast('Штамп у колекції — карта (TAB)','gold');
    IB.questCheck();
  }

  /* v1.4: КІНО-МОМЕНТ — пауза на вершині: панорама + віньєтка + полароїд-нагорода */
  /* v15.0: кіно-момент «вершини» знято — море не пік: фото ×3 і штамп одразу */
  function startSummit(spot,r){
    if(spot&&!IB.G.album.some(a=>a.spot===spot.id&&a.day===IB.G.day))IB.photoTaken(spot);
    if(r&&r.id)addStamp(r);
    IB.saveGame();
  }

  IB.SUMMIT_END=()=>{
    if(!IB.SUMMIT)return;
    IB.SUMMIT=null;mode='game';
    IB.$('hud').classList.remove('hidden');
    IB.saveGame();
  };

  function climbStep(){
    const C=IB.TRAVEL_CUR;if(!C)return;
    const r=C.route;
    C.prog=IB.clamp(C.prog+8+IB.rnd(0,6),0,100);
    IB.G.t+=0.8+IB.rnd(0,0.4);
    if(IB.G.t>=24){IB.G.t-=24;IB.G.day++;IB.banner('ДЕНЬ '+IB.G.day+' — на маршруті');}
    const hard=r.diff==='★★★'?1.2:1;
    const w=r.kind==='expedition'?0.4:1;
    for(const h of IB.E.team){
      h.hp=IB.clamp(h.hp-(h.id==='viktor'?1.3:1.8)*hard*w,0,100);
      h.food=IB.clamp(h.food-1.1*w,0,100);
      h.water=IB.clamp(h.water-1.4*w,0,100);
      const wxk=IB.G.wx.type;
      if((wxk==='snow'||wxk==='blizzard')&&r.kind!=='expedition')h.cold=IB.clamp(h.cold+7,0,100);
      else h.cold=IB.clamp(h.cold-3,0,100);
    }
    IB.SFX.step();
    if(IB.M.random()<0.22){
      /* v15.0: події в дорозі — МОРСЬКІ І МІСЬКІ (замість карпатських схилів) */
      const evts={
        sea:['Дельфіни стрибають за бортом — PABLO свистить від захвату. Настрій +4',
             'Компанія курортників з Полтави поділилась кавою прямо на причалі: вода +5',
             'Чайка націлилась на бутерброд! Сили −4, але сміх на всю хвилю',
             'Пахне солю і кавою з морвокзалу. Настрій +3'],
        city:['Луна-парк гуде — TOXIC розповідав про Київ. Настрій +4',
              'Бабуся з ринку поділилась кавою: вода +5',
              'Брускуватий тротуар! DIIN підсадив усіх. Сили −4, але сміх на весь проспект',
              'Мимо пливуть житлові будинки і кіоски — запах літа. Настрій +3'],
        expedition:['Ван хитає на одеських вибоїнах — ROCK співає зірками',
              'Придорожні черешні: купили кілограм. ₴−5, настрій +6'],
      };
      const pool=evts[r.kind]||evts.sea;
      const txt=pool[IB.ri(0,pool.length-1)];
      IB.toast(txt,'gold');
      for(const h of IB.E.team)h.mood=IB.clamp(h.mood+3,0,100);
      if(txt.indexOf('−4')>=0)for(const h of IB.E.team)h.hp=IB.clamp(h.hp-4,0,100);
      if(txt.indexOf('вода +5')>=0)for(const h of IB.E.team)h.water=IB.clamp(h.water+5,0,100);
      if(txt.indexOf('₴−5')>=0)IB.G.money=IB.M.max(0,IB.G.money-5);
    }
    if(C.prog>=100)finishTravel(false);
  }

  function finishTravel(){
    const C=IB.TRAVEL_CUR;if(!C)return;
    const r=C.route;
    IB.TRAVEL_CUR=null;
    IB.$('climb-abort').classList.add('hidden');
    mode='game';
    IB.$('hud').classList.remove('hidden');
    IB.G.stats.trips=(IB.G.stats.trips||0)+1;
    IB.G.t+=r.hours*0.35;
    if(IB.G.t>=24){IB.G.t-=24;IB.G.day++;}
    const campAt=n=>IB.W.CAMPS.find(c=>c.name===n);
    const vilAt=n=>IB.W.VILLAGES.find(v=>v.name===n);
    const f=campAt(r.from)||vilAt(r.from);
    if(f)placeTeam(f.x+(f.w?f.w/2:0),f.y+(f.h?f.h/2:0));
    else placeTeam(r.x,r.y); /* v15.0: поїздка повертає групу у точку маршруту */
    IB.banner(r.name+' — МАРШРУТ ПРОЙДЕНО!');
    IB.journalAdd('🥾','Мандрівка «'+r.name+'»: група повернулась у «'+r.from+'». '+
      (r.kind==='peak'?'Маршрут пройдено — фото в альбомі!':''));
    let spot=null;
    if(r.kind==='expedition'){
      spot=(IB.W.PHOTO_SPOTS||[]).find(s=>s.kind==='shatsk')||null;
      for(const h of IB.E.team){h.mood=IB.clamp(h.mood+15,0,100);h.cold=0;}
      IB.toast('Серф-школа «Хвиля»: дошки, бриз, шум прибою — море дарує спокій','gold');
    }else{
      spot=(IB.W.PHOTO_SPOTS||[]).find(s=>s.x>0&&IB.dist(s.x,s.y,r.x,r.y)<6)||null;
    }
    if(r.kind==='peak'){
      const a=IB.ARTIFACTS.find(q=>q.world&&!q.hidden&&!IB.artHas(q.id)&&IB.dist(q.x,q.y,r.x,r.y)<14);
      if(a)IB.toast('На вершині щось БЛИСКАЄ серед каміння — пошукай (E)','gold');
    }
    for(const h of IB.E.team)h.mood=IB.clamp(h.mood+12,0,100);
    IB.G.route=null;
    /* v1.4: кіно-момент (полароїд + штамп) — потім збереження у SUMMIT_END */
    startSummit(spot,r);
  }

  IB.TRAVEL_ABORT=()=>{
    const C=IB.TRAVEL_CUR;if(!C)return;
    const r=C.route;
    IB.TRAVEL_CUR=null;mode='game';
    IB.$('hud').classList.remove('hidden');
    IB.$('climb-abort').classList.add('hidden');
    IB.G.t+=r.hours*0.4*C.prog/100;
    if(IB.G.t>=24){IB.G.t-=24;IB.G.day++;}
    const campAt=n=>IB.W.CAMPS.find(c=>c.name===n);
    const vilAt=n=>IB.W.VILLAGES.find(v=>v.name===n);
    const f=campAt(r.from)||vilAt(r.from);
    if(f)placeTeam(f.x+(f.w?f.w/2:0),f.y+(f.h?f.h/2:0));
    IB.toast('Повернулись з маршруту «'+r.name+'» — пройдено '+IB.M.round(C.prog)+'%');
    IB.G.route=null;
    IB.saveGame();
  };

  /* ==================== v24.0: БАЗА П'ЯТІРКИ ====================
   Прив'язка до локації: заходим у дім — відпочинок, їжа, гулянка,
   зарядка всіх героїв, СКЛАД (все що знімаємо). */
  IB.isBaseBuilding=(b)=>{
    if(!b)return false;
    const bw=IB.baseHome&&IB.baseHome();
    if(bw&&bw.b===b)return true;
    /* legacy: дім ріелтора рахуємо базою ЛИШЕ коли у реєстрі немає записів
       (виселена база не лишається базою навіть якщо IB.G.home ще живий) */
    if(!(IB.G.homes||[]).length&&IB.G.home&&b.type===IB.G.home.id)return true;
    return false;
  };
  /* сон на базі: ПОВНЕ зарядження всіх героїв (сили 100%, настрій +20) */
  IB.baseSleep=()=>{
    const h=IB.M.floor(IB.G.t);
    let hrs=(24-h)+7;
    if(hrs<=0||hrs>18)hrs=8;
    IB.G.t=(IB.G.t+hrs)%24;
    if(IB.G.t<7)IB.G.day++;
    for(const m of IB.E.team){
      m.hp=100;m.mood=IB.clamp(m.mood+20,0,100);
      m.food=IB.M.max(0,m.food-hrs*2.2);m.water=IB.M.max(0,m.water-hrs*2.6);
      m.cold=0;m.heat=IB.M.max(0,(m.heat||0)-60);
    }
    IB.SYS.onNewHours(hrs);
    IB.banner('🏠 БАЗА: ВСІ ЗАРЯДЖЕНІ — ДЕНЬ '+IB.G.day+' • '+IB.clockStr());
    IB.toast('😴 Ніч на базі: сили 100% у всіх, настрій +20. Склад у скриньці.');
    IB.journalAdd('🏠','Ніч на базі — вся п\'ятірка повністю відновилась.');
    IB.saveGame&&IB.saveGame(undefined,true);
  };
  /* v24.0: СКЛАД БАЗИ — все, що знімаємо/збираємо; пропадає при виїзді */
  function openStash(){
    const names={wood:'Дерево',berries:'Ягоди',mush:'Мідії',herb:'Водорості',fishraw:'Риба (сира)',potato:'Картопля',water:'Запас води',
      bread:'Хліб',brinza:'Бринза',canned:'Консерви',eggs:'Яйця',cookfish:'Смажена риба',yushka:'Юшка',banosh:'Плов портовий',kulesh:'Макарони з сиром',
      nalyva:'Наливка',beer:'Пиво',wine:'Вино',vodka:'Горілка',rozsol:'Розсіл',kava:'Кава',trip5:'✦ «П\'ять Хвиль»',trash:'Сміття (здати — ₴8)',
      melon:'Арбуз',corn:'Кукурудза',hotdog:'Хот-дог',shav:'Шаурма',lemon:'Лимонад',moroz:'Морозиво',cream:'Крем від сонця',juice:'Сік'};
    let cnt=0;
    let h='<div class="prow head"><span class="nm">📦 СКЛАД БАЗИ — все що зняли/зібрали</span><span class="ok">₴'+IB.G.money+'</span></div>';
    for(const k in names){
      if(!(IB.G.inv[k]>0))continue;cnt++;
      h+='<div class="prow"><span class="nm">'+names[k]+'</span><span class="q">×'+IB.G.inv[k]+'</span></div>';
    }
    if(!cnt)h+='<div class="prow"><span class="no">Склад пустий — рибальте, збирайте, купуйте: все зберігається тут</span></div>';
    h+='<div class="prow head"><span class="nm">🏺 ТРОФЕЇ (зберігаються назавжди)</span></div>';
    for(const a of IB.ARTIFACTS)if(IB.artHas(a.id))h+='<div class="prow"><span class="nm">'+a.name+'</span><span class="ok">✓</span></div>';
    h+='<div class="pcard"><div class="ds">💡 Їжа, ресурси і здобич лежать У СКЛАДІ БАЗИ. ВИЇЗД або неоплачена оренда = ВЕСЬ СКЛАД ПРОПАДАЄ (трофеї лишаються). Продавайте на ринку вчасно!</div></div>';
    openPanel('📦 СКЛАД БАЗИ П\'ЯТІРКИ',h);
  }
  IB.openStash=openStash;

  /* ---------- ІНТЕР'ЄРИ ---------- */
  function enterInterior(b){
    const def=IB.INT_DEFS[b.type];
    if(!def)return;
    /* v24.0: РЕЄСТР АДРЕС — був у будинку → адреса у ТАКСІ/GPS/КАРТІ («МОЇ АДРЕСИ») */
    IB.visitPlace&&IB.visitPlace(def.title||b.name||'будинок',b.door.x,b.door.y);
    const isB=IB.isBaseBuilding&&IB.isBaseBuilding(b);
    if(isB&&!IB.G.flags.baseSeen){IB.G.flags.baseSeen=true;
      IB.banner('🏠 НАША БАЗА');
      IB.toast('🏠 БАЗА П\'ЯТІРКИ: ЛІЖКО — сон (зарядка всіх), КУХНЯ — їжа + СКЛАД, ГУЛЯНКА — патіо/гостина. На карті — жовта позначка 🏠','gold');
    }
    IB._inInterior=true;
    IB.INT_CUR={b:b,def:def,hero:{x:def.w/2,y:def.h-1.5,dir:'u',fr:0,frT:0},
      entry:{x:def.w/2,y:def.h-1.5},hi:null};
    mode='interior';
    IB.$('prompt').classList.add('hidden');
    IB.$('int-exit').classList.remove('hidden');
    IB.SFX.ui();
    IB.toast(def.title+' — WASD рух • E — об\'єкти, біля ЖОВТОЇ СТРІЛКИ (двері) — вийти • ✖ ВИХІД зверху');
  }
  function exitInterior(){
    if(!IB.INT_CUR)return;
    const b=IB.INT_CUR.b;
    IB.INT_CUR=null;IB._inInterior=false;
    mode='game';
    IB.$('int-exit').classList.add('hidden');
    const d=b.door;
    IB.E.team.forEach((h,i)=>{
      let ex=d.x+0.5+(i-2)*0.7,ey=d.y+1.2;
      if(!IB.walkable(ex,ey)){const q=IB.snapToReach(IB.M.round(ex),IB.M.round(ey));ex=q.x;ey=q.y;}
      h.x=ex;h.y=ey;h.tx=ex;h.ty=ey;h.target=null;h.fr=0;});
    IB.toast('Вийшли на вулицю');
  }
  function interiorMove(dt){
    const C=IB.INT_CUR;if(!C)return;
    const v=moveVec(),L=C.hero,D=C.def,sp=2.6;
    let nx=IB.clamp(L.x+v.x*sp*dt,0.8,D.w-0.8),ny=IB.clamp(L.y+v.y*sp*dt,0.9,D.h-0.6);
    for(const it of D.items){
      if(it.k==='host'||it.k==='priest'||it.k==='guard'||it.k==='farmw')continue;
      if(IB.dist(nx,ny,it.x,it.y)<1.05){nx=L.x;ny=L.y;break;}
    }
    if(v.x||v.y){
      L.x=nx;L.y=ny;
      L.dir=v.y>0.1?'d':(v.y<-0.1?'u':(v.x>0.1?'r':'l'));
      L.frT+=dt*8;L.fr=1+((L.frT|0)%2);
    }else L.fr=0;
    let best=null,bd=1.35;
    for(const it of D.items){const dd=IB.dist(L.x,L.y,it.x,it.y);if(dd<bd){bd=dd;best=it;}}
    C.hi=best;
    C.nearExit=IB.dist(L.x,L.y,C.entry.x,C.entry.y)<1.6; /* v2.4c: для підказки ВИХІД */
  }
  function interiorInteract(){
    const C=IB.INT_CUR;if(!C)return;
    /* v2.4c: E БІЛЯ ДВЕРЕЙ = ВИХІД (перевіряємо першим: поріг «безкоштовний»).
       Якщо до дверей ближче, ніж до найближчого предмета — виходимо на вулицю. */
    const dExit=IB.dist(C.hero.x,C.hero.y,C.entry.x,C.entry.y);
    if(dExit<1.6&&(!C.hi||dExit<IB.dist(C.hero.x,C.hero.y,C.hi.x,C.hi.y))){exitInterior();return;}
    if(!C.hi)return;
    const it=C.hi,b=C.b,L=IB.E.team[0];
    switch(it.k){
      case 'pech':
        for(const h of IB.E.team){h.cold=0;h.mood=IB.clamp(h.mood+5,0,100);}
        IB.SFX.fire();IB.toast('ПІЧ ГУДЕ — вся група відігрілась','gold');break;
      case 'table':{
        /* v24.0: КУХНЯ БАЗИ — їжа, готування і СКЛАД в одному місці */
        if(IB.isBaseBuilding&&IB.isBaseBuilding(b)){
          openDialog('🍳 КУХНЯ БАЗИ','«Тут наша кухня. Їмо, готуємо — а здобич і ресурси складаємо в СКРИНЬКУ (склад бази). Виїзд = склад пропадає!»',[
            {t:'🍽 ЇСТИ (меню рюкзака групи)',f:()=>{closeDlg();openBag();}},
            {t:'🍲 ГОТУВАТИ (рецепти на плиті)',f:()=>{closeDlg();openCookMenu();}},
            {t:'📦 СКЛАД БАЗИ (все що зняли)',f:()=>{closeDlg();openStash();}},
            {t:'Пізніше',f:closeDlg}]);
          break;
        }
        const foods=Object.keys(IB.FOODS).filter(k=>IB.G.inv[k]>0);
        if(!foods.length){IB.toast('На столі порожньо...','red');break;}
        const opts=foods.slice(0,6).map(k=>({t:IB.FOODS[k].n+' ×'+IB.G.inv[k],f:()=>{IB.eat(L,k);closeDlg();}}));
        opts.push({t:'Нічого, дякую',f:closeDlg});
        openDialog('СТІЛ','Що їмо?',opts);break;}
      case 'host':{
        /* v19.0: ГОСТЬОВІ РОЗМОВИ (talk.js) — питання → відповіді/підказки,
           сюжетні арки по актах; функціональні дії — як пункти меню */
        const ex19=[];
        if(b.type==='house')ex19.push({t:'🍅 Посмакувати помідори (+настрій)',f:()=>{
          for(const h of IB.E.team)h.mood=IB.clamp(h.mood+6,0,100);
          IB.toast('Помідори з підвіконня — благословення','gold');closeDlg();}});
        if(b.type==='gallery'){if(!IB.G.flags.gallery){IB.G.flags.gallery=true;IB.questCheck();}
          ex19.push({t:'🖼 ДИВИТИСЬ КАРТИНИ (настрій +8)',f:()=>{
            for(const h of IB.E.team)h.mood=IB.clamp(h.mood+8,0,100);
            IB.toast('Картини здаються вікнами у минуле літо','gold');closeDlg();}});}
        if(b.type==='poly')ex19.push({t:'🩺 ПРИЙОМ У ЛІКАРЯ (hp +8)',f:()=>{
          for(const h of IB.E.team)h.hp=IB.clamp(h.hp+8,0,100);
          IB.toast('Швидка допомога курорту: hp +8','gold');closeDlg();}});
        if(b.type==='medport')ex19.push({t:'🩹 ОГЛЯД ФЕЛЬШЕРА (hp +8)',f:()=>{
          for(const h of IB.E.team)h.hp=IB.clamp(h.hp+8,0,100);
          IB.toast('Медпункт порту: hp +8 усім','gold');closeDlg();}});
        if(b.type==='portadm')ex19.push({t:'💼 ВЗЯТИ ЗМІНУ ВАНТАЖНИКА (₴180)',f:()=>{
          if(IB.G.flags.portShift===IB.G.day){IB.toast('Зміна на сьогодні вже відпрацьована','red');closeDlg();return;}
          IB.G.flags.portShift=IB.G.day;
          const L2=IB.E.team[0];
          L2.pocket=IB.clamp((L2.pocket||0)+180,0,999999);
          IB.tx&&IB.tx(L2.name,180,'зміна вантажника в порту');
          timeSkip(3);
          for(const h of IB.E.team)h.hp=IB.clamp(h.hp-8,0,100);
          IB.toast('Зміна відпрацьована: +₴180 у кишеню '+L2.name,'gold');
          IB.journalAdd('💼','Зміна вантажника в порту: +₴180.');
          IB.questCheck();closeDlg();}});
        if(b.type==='post'){
          const nn=IB.E.npcs.find(n=>n.name==='листоноша Юра');
          if(nn)ex19.push({t:'📬 РОЗМОВИТИ З ЮРОЮ',f:()=>{openNpc(nn);}});
        }
        if(b.type==='bookmaker')ex19.push({t:'🎫 ДО ВІКНА СТАВОК (лінія АПЛ)',f:()=>{closeDlg();IB.openBookmaker();}});
        if(b.type==='fishplant')ex19.push({t:'🐟 ПРОДАТИ УЛОВ (ціна ринку)',f:()=>{
          IB.toast('Рибу можна продати тут — ціна як на ринку','gold');closeDlg();}});
        IB.houseTalk(b,ex19);
        break;}
      case 'pray':
        if(IB.G.flags['pray'+IB.G.day]){IB.toast('Ви вже молилися сьогодні — свічка тихо тріщить');break;}
        IB.G.flags['pray'+IB.G.day]=true;
        for(const h of IB.E.team)h.mood=IB.clamp(h.mood+10,0,100);
        IB.SFX.bell();IB.toast('МОЛЕБЕНЬ: настрій групи +10. Море чує.','gold');break;
      case 'icons':
        for(const h of IB.E.team)h.mood=IB.clamp(h.mood+3,0,100);
        IB.toast('Ікони дивляться тепло');break;
      case 'priest':
        openDialog('ОТЕЦЬ ПАВЛО','«Лоцман Марек на молу — не сатана, а подвижник. А ще над маяком лежить ЗІРКА: хто дивиться з любов\'ю — побачить.»',
          [{t:'Амінь',f:closeDlg},{t:'Добрити',f:()=>{for(const h of IB.E.team)h.mood=IB.clamp(h.mood+4,0,100);closeDlg();}}]);break;
      /* ===== i3-main-v31: КЛУБ «МАЯК» І РАДІО ===== */
      case 'dj':{
        const fri=IB.FRIDAY&&IB.FRIDAY();
        if(fri){
          openDialog('ПУЛЬТ ДІДЖЕЯ (П\'ЯТНИЦЯ!)','«Діджей Іверо: «РЕЙВ! Пульт гарячий, бас нагрітий. ₴150 — і у нас танці до світанку!»',[{t:'🎧 РЕЙВ! (₴150)',f:()=>{closeDlg();IB.startRave();}},{t:'Пізніше',f:closeDlg}]);
        }else{
          openDialog('ПУЛЬТ ДІДЖЕЯ','«Діджей Іверо: «Рейв — по п\'ятницях (радіо 103.2 оголошує). А зараз — звичайні туси: виходь на танцпол!»»',[{t:'Ок, на танцпол',f:closeDlg},{t:'Хочу рейв уже!',f:()=>{IB.toast('Терпіння! П\'ятниця — скоро. Радіо нагадає','gold');closeDlg();}}]);
        }
        break;}
      case 'dancefloor':{
        closeDlg();IB.clubDance();break;}
      case 'hostess':{
        IB.G.flags.clubVisit=true;IB.questCheck();
        const fri2=IB.FRIDAY&&IB.FRIDAY();
        openDialog('ХОСТЕС МАРІЧКА','«Легендарні у «МАЯКУ»! Правила прості: танцпол, бар Зази і повага до діджея. '+(fri2?'СЬОГОДНІ П\'ЯТНИЦЯ — РЕЙВ! Пульт уже гуде.':'Рейв — у п\'ятницю, радіо оголошує. А туси — щовечора.')+'»',[
          {t:'🎧 До пульта діджея',f:()=>{closeDlg();}},
          {t:'💃 На танцпол!',f:()=>{closeDlg();IB.clubDance();}},
          {t:'Бувай',f:closeDlg}]);
        break;}
      /* ===== v14: ПОКЕР І ДАРТС У БАРІ «ПІРАТ» ===== */
      case 'pokertable':closeDlg();startPoker();break;
      case 'bk-window':closeDlg();IB.openBookmaker();break; /* v23.0: БУКМЕКЕР */
      case 'darts':closeDlg();startDarts();break;
      case 'radio':{
        const bc=IB.radioBroadcast();
        openDialog('📻 РАДІО 103.2 FM','«'+bc+'»',[{t:'Слухати далі',f:()=>{closeDlg();IB.toast(IB.radioBroadcast(),'radio');}},{t:'Вимкнути',f:closeDlg}]);
        break;}
      case 'counter':openShop(b);break;
      case 'barkeep':openBar(b);break;
      case 'anvil':openForge(b);break;
      case 'farmw':openFarmstead(b);break;
      case 'guitar':
        /* v24.0: ГУЛЯНКА НА БАЗІ (патіо Бронксу / гостина у квартирі) */
        if(IB.isBaseBuilding&&IB.isBaseBuilding(b)){
          openDialog('🎉 ГОСТИНА НА БАЗІ','«Своя територія: музика, мангал, чайки на паркані. Гулянка заряджає настрій усій п\'ятірці.»',[
            {t:'🎉 ПОЧАТИ ГУЛЯНКУ (8 год)',f:()=>{closeDlg();IB.startParty&&IB.startParty();}},
            {t:'🎸 ПРОСТО ГРАТИ (настрій +10)',f:()=>{closeDlg();for(const h of IB.E.team)h.mood=IB.clamp(h.mood+10,0,100);IB.SFX.trip();IB.toast('ROCK підспівує — база гуде');}},
            {t:'Пізніше',f:closeDlg}]);
          break;
        }
        for(const h of IB.E.team)h.mood=IB.clamp(h.mood+10,0,100);
        IB.SFX.trip();IB.toast('БАНДУРА! ROCK підспівує — зал гуде','fun');break;
      case 'shelf':
        /* v24.0: СКРИНЬКА БАЗИ = СКЛАД (все що знімаємо) */
        if(IB.isBaseBuilding&&IB.isBaseBuilding(b)){closeDlg();openStash();break;}
        IB.toast('Полиця: бринза, чебуреки, помідори, хліб');break;
      case 'bed':
        /* v24.0: СПАЛЬНЯ БАЗИ — повне зарядження ВСІХ героїв до ранку */
        if(IB.isBaseBuilding&&IB.isBaseBuilding(b)){
          openDialog('😴 СПАЛЬНЯ БАЗИ','«Розкладнух, лежанки, вікно на море. Сон до ранку — ПОВНЕ зарядження: сили 100% і настрій +20 у всіх п\'ятьох.»',[
            {t:'😴 СПАТИ ДО РАНКУ (повне відновлення всіх)',f:()=>{closeDlg();IB.baseSleep();}},
            {t:'⏳ ГОДИНА ВІДПОЧИНКУ (сили +15, настрій +3)',f:()=>{closeDlg();IB.G.t=(IB.G.t+1)%24;for(const h of IB.E.team){h.hp=IB.clamp(h.hp+15,0,100);h.mood=IB.clamp(h.mood+3,0,100);}IB.toast('Година на дивані: сили +15, настрій +3');}},
            {t:'Пізніше',f:closeDlg}]);
          break;
        }
        IB.G.t=(IB.G.t+1)%24;
        for(const h of IB.E.team)h.hp=IB.clamp(h.hp+10,0,100);
        IB.toast('Годинка на лежанку: сили +10');break;
      case 'guard':
        if(b.type==='zavod'){
          /* v2.0: ЕКСКУРСІЯ НА СУДНОБУДІВНИЙ ЗАВОД «ПАЛЛАДА» */
          if(!IB.G.flags.zavodTour){
            openDialog('ОХОРОНЕЦЬ ІВАН (СЗ «ПАЛЛАДА»)','«Куди?! Це ж завод! А... легендарні?! Ох, той самий фургон бачив. Ладно — екскурсія ₴100, тільки руки при собі. Стапелі, сліпи, баржі на лимані — місто тримається на нас.»',[
              {t:'Беремо екскурсію (₴100)',f:()=>{
                if(IB.G.money<100){IB.toast('Екскурсія — ₴100','red');return;}
                IB.G.money-=100;IB.G.flags.zavodTour=true;timeSkip(2);
                for(const h of IB.E.team)h.mood=IB.clamp(h.mood+8,0,100);
                IB.banner('СУДНОБУДІВНИЙ ЗАВОД «ПАЛЛАДА»');
                IB.toast('Сліпи, стапелі, сварка у іскрах — Петро все це бачив у дитинстві','gold');
                IB.journalAdd('🏭','Екскурсія на суднобудівний завод: «Паллада» будує для всього Чорного моря.');
                IB.questCheck();closeDlg();}},
              {t:'Не зараз',f:closeDlg}]);
          }else openDialog('ОХОРОНЕЦЬ ІВАН','«Проходьте, легендарні. Тільки чоботи протри — тут навіть вентилятори з солі.»',[{t:'Дякуємо!',f:closeDlg}]);
          break;
        }
        if(!IB.G.flags.stamped){
          IB.G.flags.stamped=true;IB.G.money+=10;
          openDialog('ПОГРАНИЧНИК','«Легенди з Києва, кажете? Штамп поставив. Ось ₴10 — за гарний настрій. Молдова близько, але повертайтесь: у вас тут гулянка.»',
            [{t:'Слава Україні!',f:closeDlg}]);
        }else openDialog('ПОГРАНИЧНИК','«Порядок на кордоні. Легендам — завжди раді.»',[{t:'Дякуємо!',f:closeDlg}]);
        break;
      case 'stella':{
        const spot=(IB.W.PHOTO_SPOTS||[]).find(s=>s.kind==='border'&&IB.dist(s.x,s.y,b.door.x,b.door.y)<10)||(IB.W.PHOTO_SPOTS||[]).find(s=>s.kind==='border');
        if(spot)IB.photoTaken(spot);break;}
      /* ============ i3: СЕРВІСИ В ІНТЕР\'ЄРАХ ============ */
      case 'board':{
        if(b.type==='realtor'){IB.G.flags.realtorVisited=true;openRealtor();}
        else if(b.type==='port')IB.toast('Пороми: 08:40 • 12:10 • 16:30 — каса поруч');
        else if(b.type==='vokzal')IB.toast('Електричка на Київ: 07:40. Але хто поїде?!');
        else if(b.type==='cityhall'){
          IB.banner('ПЛАН РАЙОНІВ ЧОРНОМОРСЬКА');
          IB.toast('Північний масив • Центр (просп. Миру) • Південний масив • Приморський • Порт • Сухий лиман — усе на великій карті (M)','gold');
        }
        else if(b.type==='post')IB.toast('Листи чекають адресатів у районах — Юра покаже (E на Юрі)');
        else IB.toast('Оголошення: «Здам кімнату біля моря. ТІЛЬКИ спокійним».');break;}
      case 'recep':{
        if(b.type==='hotel')openHotel(b);
        else if(b.type==='port')openPort(b);
        else if(b.type==='yacht')openYacht(b);
        else if(b.type==='vokzal')openVokzal(b);
        else if(b.type==='poly'){
          IB.toast('Реєстратура: талонів на сьогодні більше немає. «З сонячним ударом — без черги!»','');
          for(const h of IB.E.team)h.hp=IB.clamp(h.hp+5,0,100);
        }
        else openShop(b);
        break;}
      case 'lunch':{
        if(b.type==='cine'){IB.G.inv.popcorn=(IB.G.inv.popcorn||0)+0;openCine(b);}
        else openCanteen(b);
        break;}
      case 'weights':openGym(b);break;
      case 'screen':openCine(b);break;
      case 'rows':{L.mood=IB.clamp(L.mood+2,0,100);IB.toast('М\'які крісла. Ще пару хвилин...');break;}
      case 'exhibit':{
        L.mood=IB.clamp(L.mood+3,0,100);
        if(b.type==='gallery'&&!IB.G.flags.gallery){IB.G.flags.gallery=true;IB.questCheck();}
        IB.toast('Експонат: '+it.label+' — історія шепоче','gold');break;}
      case 'window':{
        L.mood=IB.clamp(L.mood+5,0,100);
        IB.showScene('🌊','ВИД НА МОРЕ','П\'ятий поверх, вікно на південь: смуга піску, парасолки як цукерки, і море — до самого неба.');break;}
      case 'fire':
        for(const h of IB.E.team)h.cold=IB.clamp(h.cold-30,0,100);
        IB.toast('Горн пашить — тепла');break;
    }
  }
  IB._intMove=interiorMove;
  IB._intInteract=interiorInteract;   /* v14: тест-хук (E всередині інтер'єру) */

  /* ---------- ФОТОАЛЬБОМ ---------- */
  function openAlbum(){
    const alb=IB.G.album||[];
    let h='<div class="pcard"><div class="ds">ФОТОАЛЬБОМ «МОРЕ-ЛЕГЕНДА»: '+alb.length+' кадрів. Зберігається разом з грою (ESC/автосейв). Клік — збільшити.</div></div>';
    if(!alb.length){
      h+='<div class="prow"><span class="nm">Поки порожньо. МАНДРІВКИ (T) — пірс, маяк, порт, лиман, парк якорів — всюди група фотосесію влаштує.</span></div>';
    }else{
      h+='<div id="album-grid">';
      alb.forEach((p,i)=>{h+='<div class="alb-it" data-ai="'+i+'"><canvas width="96" height="76" data-ac="'+i+'"></canvas></div>';});
      h+='</div><div id="album-big"><canvas id="alb-big" width="240" height="190"></canvas></div>';
    }
    openPanel('ФОТОАЛЬБОМ — '+alb.length+' КАДРІВ',h);
    if(alb.length){
      IB.$('panel-body').querySelectorAll('canvas[data-ac]').forEach(cv=>{
        const idx=+cv.dataset.ac;
        IB.drawAlbumPhotoSmall(cv,alb[idx]);
        cv.parentNode.onclick=()=>{
          const big=IB.$('alb-big');
          if(big)IB.renderPhoto(big.getContext('2d'),alb[idx],0,0,240,190,false);
          IB.SFX.ui();
        };
      });
      const big=IB.$('alb-big');
      if(big)IB.renderPhoto(big.getContext('2d'),alb[alb.length-1],0,0,240,190,false);
    }
  }

  /* v14: ГРА СПОЧАТКУ ВІДКРИВАЄТЬСЯ У КОНСОЛІ-СТОРІНЦІ З ОПИСОМ — для ВСІХ
     (ПК і телефон), як у частинах 1-2: консоль-ТВ, картридж, ВСЯ ІНФА знизу.
     Гра запускається у консолі, і ЛИШЕ ПОТІМ її можна РОЗКРИТИ НА ВЕСЬ ЕКРАН
     кнопкою ⛶/🖥 (вибір запам'ятовується, ib3mode='full'). */
  function applyDefaultMode(){
    let saved=null;try{saved=localStorage.getItem('ib3mode');}catch(e){}
    if(saved==='full')return;                 /* свідомо вибраний фулскрін */
    document.body.classList.add('consolemode'); /* дефолт: консоль + опис */
  }
  IB.SETMODE=(m)=>{mode=m;clearP&&clearP();}; /* v18.7: модулі перемикають режим дійств */
  function start(){
    cv=IB.$('game');g=cv.getContext('2d');
    g.imageSmoothingEnabled=false;
    applyDefaultMode();
    bindTouch();bindConsole();bindPads(); /* v18.6: великі кнопки матчів/покера */
    /* v11: канва під аспект екрана одразу і на кожен resize/поворот */
    fitCanvas();
    window.addEventListener('resize',()=>{fitCanvas();});
    window.addEventListener('orientationchange',()=>setTimeout(fitCanvas,250));
    bootSeq();
    requestAnimationFrame(loop);
  }
  document.addEventListener('DOMContentLoaded',start);
  if(document.readyState==='loading'){}else start();
/* ================================================================
   v23.0 «ІЗО-МАТЧІ • БУКМЕКЕР» (raund 25)
   Гравець: «баскетбол, футбол і всі інші режими не играються — там
   2д вид зверху, нічого не зрозуміло — переписуй всі ігри на
   ІЗОМЕТРИЧНІ героями: кільце і біг героїв, ворота — удар, волейбол,
   покер» + «добав букмекера: зайти, вибрати матчі АПЛ, поставити і
   піти; через день результати — вгадав або програв».
   Тут: ІЗО-РЕНДЕР матчів (футбол/баскетбол), НОВА волейбольна
   міні-гра 2×2 через сітку, ІЗО-СТІЛ покеру, БУКМЕКЕР «КОЕФІЦІЄНТ».
   ================================================================ */

/* ---------- спільна ізо-проєкція поля ---------- */
function isoMap(W,H){
  const vw=IB.GFX.VW||480, vh=IB.GFX.VH||336;
  const k=IB.M.min((vw-28)/(W+H),(vh-124)/((W+H)*0.55));
  return {k:k, cx:vw/2, top:(vh-(W+H)*k*0.5)/2+4, vw:vw, vh:vh};
}
function isoLook(g,pl,dt){
  /* анімація героїв матчу: рух → кадр кроку і напрямок по ізо-дельті */
  const dx=pl.x-(pl._lx===undefined?pl.x:pl._lx), dy=pl.y-(pl._ly===undefined?pl.y:pl._ly);
  const moved=IB.M.abs(dx)+IB.M.abs(dy)>0.001;
  pl._lx=pl.x;pl._ly=pl.y;
  pl.aT=(pl.aT||0)+(moved?dt*9:0);
  pl.mv=moved;
  if(moved){
    const sx=dx-dy, sy=(dx+dy)*0.5;
    pl.isoDir=IB.M.abs(sx)>IB.M.abs(sy)?(sx>0?'r':'l'):(sy>0?'d':'u');
  }
}
function isoHeroLook(pl,seed){
  if(pl.hero&&pl.hero.look)return pl.hero.look;
  if(pl._lk)return pl._lk;
  const skin=IB.pick(['#e8b088','#e0a878','#d89868','#f0b48c'],seed);
  pl._lk={skin:skin,hair:'#241a10',hat:IB.pick(['none','cap','none','band'],seed+1),
    hatc:'#8a4a38',jacket:pl.team===0?'#f0d050':'#b84848',pants:'#3e4038',
    beard:IB.hsh(seed,3,9)<0.5,pack:false};
  return pl._lk;
}

/* ================= ФУТБОЛ 3×2 І БАСКЕТБОЛ 3×2 — ІЗО-РЕНДЕР =================
   Логіка (пас, удар, кидок, AI, рахунок, ставки) — без змін (matchKeys/
   matchTick/mtPass/mtShoot/mtGoal/mtBasket/mtEnd). Перемальовуємо ЛИШЕ
   картинку: ізометричне поле, справжні спрайти героїв, ворота/кільце. */
IB.drawMatch=(g,dt)=>{
  IB.matchTick&&IB.matchTick(dt);
  if(!MT){mode='game';return;}
  const VW2=IB.GFX.VW||480,VH2=IB.GFX.VH||336;
  g.fillStyle='#08101c';g.fillRect(0,0,VW2,VH2);
  const shake=MT.shake>0?IB.M.sin(performance.now()*0.07)*3:0;
  g.save();g.translate(shake,0);
  const W=MT.W,H=MT.H,foot=MT.type==='foot';
  const MP=isoMap(W,H),k=MP.k,cx=MP.cx,top=MP.top;
  const X=(u,v)=>cx+(u-v)*k, Y=(u,v)=>top+(u+v)*k*0.5;
  const quad=(u0,v0,u1,v1,fill,stroke,lw)=>{
    const p=[[X(u0,v0),Y(u0,v0)],[X(u1,v0),Y(u1,v0)],[X(u1,v1),Y(u1,v1)],[X(u0,v1),Y(u0,v1)]];
    if(fill){g.fillStyle=fill;g.beginPath();g.moveTo(p[0][0],p[0][1]);for(let i=1;i<4;i++)g.lineTo(p[i][0],p[i][1]);g.closePath();g.fill();}
    if(stroke){g.strokeStyle=stroke;g.lineWidth=lw||1;g.beginPath();g.moveTo(p[0][0],p[0][1]);for(let i=1;i<4;i++)g.lineTo(p[i][0],p[i][1]);g.closePath();g.stroke();}
    return p;
  };
  /* ---- ПОЛЕ ---- */
  const N=10;
  for(let i=0;i<N;i++){
    quad(i*W/N,0,(i+1)*W/N,H, foot?(i%2?'#2e7a3e':'#2f8142'):(i%2?'#c8843c':'#bd7c36'));
  }
  /* зовнішні межі */
  g.strokeStyle=foot?'#e8f0e8':'#f4ead8';g.lineWidth=1.6;
  g.beginPath();
  g.moveTo(X(0,0),Y(0,0));g.lineTo(X(W,0),Y(W,0));g.lineTo(X(W,H),Y(W,H));g.lineTo(X(0,H),Y(0,H));g.closePath();g.stroke();
  /* центральна лінія і круг */
  g.beginPath();g.moveTo(X(W/2,0),Y(W/2,0));g.lineTo(X(W/2,H),Y(W/2,H));g.stroke();
  g.beginPath();g.ellipse(X(W/2,H/2),Y(W/2,H/2),9*k,4.5*k,0,0,7);g.stroke();
  if(foot){
    /* штрафні */
    quad(0,14,16,50,null,'rgba(232,240,232,0.85)',1.2);
    quad(W-16,14,W,50,null,'rgba(232,240,232,0.85)',1.2);
    /* ВОРОТА — ізометричні, сітка (гравець: «ворота — удар») */
    for(const end of [0,1]){
      const gu=end?W:0, du=end?-3.4:3.4;
      const pA=[X(gu,24),Y(gu,24)],pB=[X(gu,40),Y(gu,40)];
      const bA=[X(gu+du,24),Y(gu+du,24)],bB=[X(gu+du,40),Y(gu+du,40)];
      const GH=11;
      g.strokeStyle='#f4f4ee';g.lineWidth=2.2;
      g.beginPath();g.moveTo(pA[0],pA[1]);g.lineTo(pA[0],pA[1]-GH);g.lineTo(bA[0],bA[1]-GH);g.stroke();
      g.beginPath();g.moveTo(pB[0],pB[1]);g.lineTo(pB[0],pB[1]-GH);g.lineTo(bB[0],bB[1]-GH);g.stroke();
      g.beginPath();g.moveTo(pA[0],pA[1]-GH);g.lineTo(pB[0],pB[1]-GH);g.stroke();
      /* сітка */
      g.strokeStyle='rgba(244,244,238,0.55)';g.lineWidth=0.8;
      for(let i=1;i<6;i++){
        const v=24+i*(16/6);
        const s0=[X(gu,v),Y(gu,v)],s1=[X(gu+du,v),Y(gu+du,v)];
        g.beginPath();g.moveTo(s0[0],s0[1]-GH*(0.4+i*0.1));g.lineTo(s1[0],s1[1]-GH*(0.4+i*0.1));g.stroke();
      }
      for(let i=1;i<4;i++){
        const du2=du*i/4;
        g.beginPath();g.moveTo(X(gu+du2,24),Y(gu+du2,24)-GH);g.lineTo(X(gu+du2,40),Y(gu+du2,40));g.stroke();
      }
    }
  }else{
    /* три секундна зона */
    quad(0,18,10,32,null,'rgba(244,234,216,0.85)',1.2);
    quad(W-10,18,W,32,null,'rgba(244,234,216,0.85)',1.2);
    /* КІЛЬЦЕ — щит, кільце, сітка (гравець: «кільце — і біг героїв») */
    const hx=X(25,3),hy=Y(25,3);
    g.fillStyle='rgba(0,0,0,0.3)';g.beginPath();g.ellipse(hx,hy,9,3.6,0,0,7);g.fill();
    g.strokeStyle='#9aa0a8';g.lineWidth=3;
    g.beginPath();g.moveTo(hx,hy);g.lineTo(hx,hy-20);g.stroke();
    /* щит — білий з червоним квадратом */
    g.save();g.translate(hx,hy-24);g.transform(1,0.5,0,1,0,0);
    g.fillStyle='#f0f0ea';g.fillRect(-13,-3,26,9);
    g.strokeStyle='#b03830';g.lineWidth=1.6;g.strokeRect(-13,-3,26,9);
    g.strokeRect(-4.5,0.5,9,3.5);
    g.restore();
    /* кільце — товсте оранжеве */
    g.strokeStyle='#ff8a30';g.lineWidth=3;
    g.beginPath();g.ellipse(hx,hy-15,7.5,3.6,0,0,7);g.stroke();
    g.strokeStyle='#c85a20';g.lineWidth=1.2;
    g.beginPath();g.ellipse(hx,hy-15,7.5,3.6,0,0,7);g.stroke();
    /* сітка кільця */
    g.strokeStyle='rgba(245,245,238,0.85)';g.lineWidth=1.1;
    for(const s of [-1,0,1]){
      g.beginPath();g.moveTo(hx+s*6.5,hy-15);g.lineTo(hx+s*1.8,hy-6);g.stroke();
    }
    g.beginPath();g.moveTo(hx-6.5,hy-15);g.lineTo(hx-1.8,hy-6);g.stroke();
  }
  /* ---- ГРАВЦІ (справжні ізометричні спрайти героїв) ---- */
  const ps=MT.ps.slice().sort((a,b)=>(a.x+a.y)-(b.x+b.y));
  for(const pl of ps){
    isoLook(g,pl,dt);
    const px=X(pl.x,pl.y),py=Y(pl.x,pl.y);
    g.fillStyle='rgba(0,0,0,0.30)';g.beginPath();g.ellipse(px,py-1,7,3,0,0,7);g.fill();
    const ring=pl.team===0?(pl.role==='gk'?'#3aa0e0':'#f0d050'):'#e05a5a';
    g.strokeStyle=ring;g.lineWidth=1.6;
    g.beginPath();g.ellipse(px,py-1,7.5,3.2,0,0,7);g.stroke();
    IB.drawPerson(g,px,py,pl.isoDir||'d',pl.mv?1+((pl.aT|0)%2):0,isoHeroLook(pl,pl.team*10+MT.ps.indexOf(pl)));
    g.font='bold 6px monospace';g.textAlign='center';
    g.fillStyle=pl.team===0?'#f0e8b0':'#f0c0c0';
    g.fillText(pl.nm.slice(0,10),px,py-34);
    if(pl===MT.ctrl){
      g.strokeStyle='#ffffff';
      g.beginPath();g.ellipse(px,py-1,9.5,4.2,0,0,7);g.stroke();
      g.fillStyle='#f0d050';g.fillText('▼',px,py-42);
    }
    g.textAlign='left';
  }
  /* ---- М'ЯЧ ---- */
  const b=MT.ball;
  const bx=X(b.x,b.y),byG=Y(b.x,b.y);
  const lift=b.arc?IB.M.sin(b.arc*IB.M.PI)*(k*15):(b.owner?5:4+IB.M.abs(IB.M.sin(performance.now()*0.004))*1.5);
  g.fillStyle='rgba(0,0,0,0.30)';g.beginPath();g.ellipse(bx,byG-1,3.4,1.5,0,0,7);g.fill();
  g.fillStyle=foot?'#f8f8f2':'#f8a048';g.beginPath();g.arc(bx,byG-lift-3,3.8,0,7);g.fill();
  g.strokeStyle=foot?'#3e4450':'#7a3a12';g.lineWidth=1;
  g.beginPath();g.arc(bx,byG-lift-3,3.8,0,7);g.stroke();
  g.fillStyle=foot?'#20242a':'#8a4a20';g.beginPath();g.arc(bx+1.1,byG-lift-4,1.1,0,7);g.fill();
  g.strokeStyle=foot?'#c8c8c0':'#b86428';g.lineWidth=0.8;
  g.beginPath();g.arc(bx,byG-lift-3,3.8,0.6,2.6);g.stroke();
  g.restore();
  /* ---- ТАБЛО ---- */
  const tw=IB.M.min(230,VW2-36);
  const ty0=44;   /* v23: табло ПІД іконками героїв HUD */
  g.fillStyle='#0a0e14ee';IB.P(g,VW2/2-tw/2,ty0,tw,26,'#0a0e14ee');g.strokeStyle='#3e5568';g.strokeRect(VW2/2-tw/2,ty0,tw,26);
  g.font='bold 10px monospace';g.textAlign='center';g.fillStyle='#f0d050';
  const tt=IB.M.max(0,IB.M.ceil(MT.t));
  g.fillText('ЛЕГЕНДАРНІ '+MT.score[0]+' : '+MT.score[1]+' МІСЦЕВІ   '+tt+'с',VW2/2,ty0+17);
  g.font='7px monospace';g.fillStyle='#c8d8d0';
  g.fillText(MT.msg.slice(0,64),VW2/2,VH2-30);
  g.fillStyle='#78908a';
  g.fillText('E — ПАС • ✊ — '+(foot?'УДАР':'КИДОК')+' • SHIFT — БІГ • ESC — ЗАВЕРШИТИ • НА ТЕЛЕФОНІ — КНОПКИ СПРАВА',VW2/2,VH2-16);
  if(MT.flash>0){g.fillStyle='rgba(255,240,180,'+(MT.flash*0.35)+')';g.fillRect(0,0,VW2,VH2);}
  g.textAlign='left';
};

/* ================= ВОЛЕЙБОЛ 2×2 ЧЕРЕЗ СІТКУ — ІЗО-МІНІГРА ================= */
let VB=null;
function startVolleyIso(){
  closePanel();closeDlg();IB.closeActMenu&&IB.closeActMenu();
  const L=IB.E.team[0];
  if(!IB.payPocket(L.id,60)){IB.toast('Нужна ₴60 на ставку місцевим','red');return;}
  const mates=IB.E.team.filter(h=>h!==L);
  VB={W:40,H:26,NET:13,score:[0,0],pts:7,stake:60,msg:'🏐 ПОДАЧА: ✊ бити через сітку',end:0,flash:0,serve:0,t:180,
    ball:{x:12,y:6,z:1.7,vx:0,vy:0,vz:0,hold:0,free:false,touch:0,last:0,cool:0,trail:0},
    ps:[
      {x:12,y:6,team:0,hero:L,sp:4.6,nm:L.name},
      {x:6,y:10,team:0,hero:mates[0]||null,sp:4.2,nm:mates[0]?mates[0].name:'TOXIC'},
      {x:26,y:19,team:1,sp:3.6,nm:'МЕСЦЕВИЙ 1'},
      {x:33,y:15,team:1,sp:3.6,nm:'МЕСЦЕВИЙ 2'}],
    aiT:0.8,rally:1};
  mode='vball';
  IB.toast('🏐 ВОЛЕЙБОЛ 2×2! Ставка ₴60 — перемога ₴120','gold');
  IB.SFX.done&&IB.SFX.done();
}
function vbSide(y){return y<VB.NET?0:1;}
function vbPoint(side,why){
  /* side — хто ВИГРАВ розіграш */
  VB.score[side]++;VB.flash=1;VB.rally=0;
  VB.msg=(side===0?'🏐 ОЧКО ЛЕГЕНДАРНИМ!':'🏐 Очко місцевим...')+' ('+VB.score[0]+':'+VB.score[1]+')'+(why?' — '+why:'');
  IB.SFX.done&&IB.SFX.done();
  const b=VB.ball;b.vx=0;b.vy=0;b.vz=0;
  if(VB.score[0]>=VB.pts||VB.score[1]>=VB.pts){
    setTimeout(()=>{if(VB)vbEnd(VB.score[0]>VB.score[1],VB.score[0]+':'+VB.score[1]);},800);
    VB.msg+=' — МАТЧ ЗАВЕРШЕНО!';return;
  }
  setTimeout(()=>{if(VB)vbServe(side);},900);
}
function vbServe(side){
  const b=VB.ball;
  const holder=VB.ps.filter(p=>p.team===side)[0];
  b.hold=side;b.free=false;b.touch=0;b.last=side;b.cool=0;
  b.x=holder.x;b.y=holder.y;b.z=1.7;b.vx=0;b.vy=0;b.vz=0;
  VB.serve=side;VB.rally=1;
  VB.msg=side===0?'🏐 ПОДАЧА: ✊ бити через сітку (E — на напарника)':'Місцеві подають...';
  if(side===1)VB.aiT=1.0;
}
function vbLaunch(from,to,arcZ){
  /* балістичний кидок: час польоту з гравітацією 22 */
  const b=VB.ball;
  const z0=b.z,T=IB.M.max(0.6,IB.M.hypot(to.x-b.x,to.y-b.y)/16);
  b.vz=arcZ!==undefined?arcZ:(11*T-(z0-0.2))/T;
  b.vx=(to.x-b.x)/T;b.vy=(to.y-b.y)/T;
  b.hold=null;b.free=true;b.cool=0.25;b.last=from;
  if(b.vy!==0&&IB.M.sign(b.y-VB.NET)!==IB.M.sign(b.y+b.vy*0.12-VB.NET))b.cross=1;
}
function vbHit(pl,to,attack){
  const b=VB.ball;
  b.z=IB.M.max(b.z,2.2);
  vbLaunch(pl.team,to,attack?13.5:11.5);
  b.touch++;
  VB.msg=attack?(pl.team===0?'🔥 УДАР ЧЕРЕЗ СІТКУ!':'Суперник атакує...'):'↔ відбий';
}
function vbFault(msg,side){
  /* side — винна сторона; очко супернику */
  VB.msg=msg;
  const b=VB.ball;
  b.free=true;b.vx=0;b.vy=0;if(b.z<1)b.z=1;
  setTimeout(()=>{if(VB)vbPoint(1-side,'');},350);
}
function vbAct(kind){
  if(!VB||VB.end)return;
  const b=VB.ball,L=VB.ps[0];
  if(b.hold===0){
    /* подача у руках лідера */
    if(kind==='kick'){
      const to={x:IB.rnd(6,34),y:IB.rnd(VB.NET+2.5,VB.H-1.5)};
      b.z=1.7;vbLaunch(0,to,14.5);VB.msg='🔥 ПОДАЧА!';
    }else{
      const mate=VB.ps.find(p=>p.team===0&&p!==L);
      b.z=1.7;vbLaunch(0,{x:mate.x,y:mate.y},11);
      VB.msg='↔ передача напарнику';
    }
    return;
  }
  if(b.free&&b.cool<=0&&vbSide(b.y)===0&&b.z<3.4&&IB.dist(L.x,L.y,b.x,b.y)<2.5){
    /* прийом/удар лідера */
    if(kind==='kick'){
      const sk=(IB.skillLv&&IB.skillLv(L,'str')||0)*0.04;
      const err=IB.rnd(-3.4,3.4)*(1-sk);
      vbHit(L,{x:IB.clamp(b.x+err,2,38),y:IB.rnd(VB.NET+2.5,VB.H-1.5)},true);
    }else{
      const mate=VB.ps.find(p=>p.team===0&&p!==L);
      vbHit(L,{x:mate.x,y:mate.y},false);
    }
  }else if(b.hold!==0&&b.free){
    IB.toast('М\'яч не в зоні — чекай прийому!');
  }
}
function vbEnd(win,sc){
  if(!VB)return;
  const L=IB.E.team[0],st=VB.stake;
  mode='game';
  IB.G.stats.volley=(IB.G.stats.volley||0)+1;
  if(win){L.pocket=(L.pocket||0)+st+120;L.mood=IB.clamp(L.mood+12,0,100);
    IB.tx&&IB.tx(L.name,120,'перемога у волейболі 2×2');
    IB.banner('🏐 ВОЛЕЙБОЛ — ВЗЯЛИ МАТЧ!');
    IB.showScene('🏐','ВОЛЕЙБОЛ — ВЗЯЛИ МАТЧ '+sc+'!','Місцеві віддають ставку і ₴120: «Сітка у вас — як шовк!» Пісок гуде, DIIN вже кличе на реванш.');
    IB.journalAdd('🏐','Волейбол 2×2 через сітку: '+sc+' — перемога, +₴120 у кишеню.');
  }else if(win===false){L.mood=IB.clamp(L.mood-4,0,100);
    IB.banner('🏐 ВОЛЕЙБОЛ — МАТЧ НЕ ТВІЙ');
    IB.showScene('😔','ВОЛЕЙБОЛ — '+sc,'Бронзові дядьки з качалки забрали ставку ₴60. «Реванш після засмаги!» Зате настрій і море — за тобою.');
    IB.journalAdd('🏐','Волейбол 2×2: '+sc+' — програш ставки ₴60.');
  }else{
    L.pocket=(L.pocket||0)+st;
    IB.showScene('🤝','ВОЛЕЙБОЛ — НІЧИЯ '+sc,'Рахунок рівний до самої темряви — ставку повернули. М\'яч до останнього висів над сіткою.');
    IB.journalAdd('🏐','Волейбол 2×2: нічия '+sc+'.');
  }
  L.hp=IB.clamp(L.hp-10,0,100);L.water=IB.clamp(L.water-10,0,100);
  for(const h of IB.E.team)h.mood=IB.clamp(h.mood+5,0,100);
  IB.skillXP&&IB.skillXP(L,'str',8);
  VB=null;IB.questCheck&&IB.questCheck();
}
IB.vballKeys=(dt)=>{
  if(!VB)return;
  if(consume('e')||consume('enter'))vbAct('pass');
  if(consume('atk')||consume('space'))vbAct('kick');
  if(consume('esc'))vbEnd(null,VB.score[0]+':'+VB.score[1]);
};
IB.vbAct=vbAct;
IB.drawVolley=(g,dt)=>{
  if(!VB){mode='game';return;}
  const VW2=IB.GFX.VW||480,VH2=IB.GFX.VH||336;
  g.fillStyle='#08101c';g.fillRect(0,0,VW2,VH2);
  const W=VB.W,H=VB.H,NET=VB.NET,b=VB.ball;
  /* --- рух лідера --- */
  const L=VB.ps[0],mv=moveVec();
  if(!b.hold){
    const sp=L.sp;
    L.x=IB.clamp(L.x+mv.x*sp*dt,1,W-1);
    L.y=IB.clamp(L.y+mv.y*sp*dt,1,NET-0.7);
  }
  /* --- AI --- */
  VB.aiT-=dt;
  for(let i=1;i<VB.ps.length;i++){
    const pl=VB.ps[i];
    const mine=vbSide(b.y)===pl.team&&(b.free||b.hold===pl.team);
    let tx=pl.x,ty=pl.y;
    if(b.hold===pl.team){/* тримає подачу */}
    else if(mine&&b.free){
      tx=b.x+b.vx*0.28;ty=IB.clamp(b.y+b.vy*0.28,pl.team===1?NET+0.7:1,pl.team===1?H-1:NET-0.7);
    }else{
      tx=pl.team===0?IB.clamp(W*0.3+b.touch*3,3,NET-3):IB.clamp(W*0.7,NET+3,W-3);
      ty=pl.team===0?H*0.35:IB.clamp(H*0.35+ (pl.x%5),NET+2,H-2);
    }
    const dx=tx-pl.x,dy=ty-pl.y,dd=IB.M.hypot(dx,dy);
    if(dd>0.3){pl.x=IB.clamp(pl.x+dx/dd*pl.sp*dt,1,W-1);pl.y=IB.clamp(pl.y+dy/dd*pl.sp*dt,1,H-1);pl.mvA=true;}
    else pl.mvA=false;
    /* AI-прийом */
    if(b.free&&b.cool<=0&&b.z<2.9&&b.vz<0.4&&IB.dist(pl.x,pl.y,b.x,b.y)<1.9&&vbSide(b.y)===pl.team){
      const myTouch=(b.last===pl.team);
      if(!myTouch&&b.touch<3){
        const mate=VB.ps.find(p=>p.team===pl.team&&p!==pl);
        const attack=b.touch>=1||IB.M.random()<0.3;
        if(pl.team===1){
          if(IB.M.random()<0.80){vbHit(pl,attack?{x:IB.rnd(6,34),y:IB.rnd(1.5,NET-1.5)}:{x:IB.rnd(NET+2,W-2),y:IB.rnd(NET+2.5,H-2)},attack);}
          else vbFault('Місцеві не змогли прийняти!',1);
        }else if(pl!==L){
          if(IB.M.random()<0.9){vbHit(pl,attack?{x:IB.rnd(6,34),y:IB.rnd(NET+2.5,H-1.5)}:{x:IB.clamp(L.x+IB.rnd(-2,2),2,W-2),y:IB.rnd(1.5,NET-1.5)},attack);}
          else vbFault('Напарник не дягнув...',0);
        }
      }
    }
    /* подача місцевих */
    if(pl.team===1&&b.hold===1&&VB.aiT<=0){
      vbLaunch(1,{x:IB.rnd(4,36),y:IB.rnd(1.5,NET-1.5)},14.2);
      VB.msg='🏐 Подача місцевих — приймай!';
    }
  }
  /* --- м'яч --- */
  if(b.hold!==null&&b.hold!==undefined){
    const holder=VB.ps.find(p=>p.team===b.hold);
    if(holder){b.x=holder.x;b.y=holder.y;b.z=1.7;}
  }else{
    const py0=b.y;
    b.x+=b.vx*dt;b.y+=b.vy*dt;b.z+=b.vz*dt;b.vz-=22*dt;
    /* сітка: перетин нижче верху сітки — фол */
    if(b.free&&(py0-NET)*(b.y-NET)<0&&b.z<3.0){
      vbFault(IB.M.sign(py0-NET)>0?'🏐 М\'яч у сітці!':'🏐 М\'яч у сітці!',b.last);
    }
    /* аут */
    if(b.free&&b.z<6&&(b.x<0.7||b.x>W-0.7||b.y<0.7||b.y>H-0.7)){
      vbFault('🏐 М\'яч в аут!',b.last);
    }
    /* земля — очко тому, хто НЕ на цій стороні */
    if(b.free&&b.z<=0.4&&b.vz<0){
      const s=vbSide(b.y);
      vbPoint(1-s,s===b.last?'в чисту площадку':'');
    }
    if(b.cool>0)b.cool-=dt;
  }
  /* --- рендер --- */
  const MP=isoMap(W,H),k=MP.k,cx=MP.cx,top=MP.top;
  const X=(u,v)=>cx+(u-v)*k, Y=(u,v)=>top+(u+v)*k*0.5;
  const quad=(u0,v0,u1,v1,fill,stroke,lw)=>{
    const p=[[X(u0,v0),Y(u0,v0)],[X(u1,v0),Y(u1,v0)],[X(u1,v1),Y(u1,v1)],[X(u0,v1),Y(u0,v1)]];
    if(fill){g.fillStyle=fill;g.beginPath();g.moveTo(p[0][0],p[0][1]);for(let i=1;i<4;i++)g.lineTo(p[i][0],p[i][1]);g.closePath();g.fill();}
    if(stroke){g.strokeStyle=stroke;g.lineWidth=lw||1;g.beginPath();g.moveTo(p[0][0],p[0][1]);for(let i=1;i<4;i++)g.lineTo(p[i][0],p[i][1]);g.closePath();g.stroke();}
  };
  for(let i=0;i<5;i++)quad(i*W/5,0,(i+1)*W/5,H,i%2?'#d9c48c':'#d1ba80');
  quad(NET-0.25,0,NET+0.25,H,'rgba(60,48,30,0.25)');
  quad(0,0,2,H,null,'rgba(244,240,224,0.8)',1.2);
  quad(W-2,0,W,H,null,'rgba(244,240,224,0.8)',1.2);
  /* СІТКА по ізо-осі v=NET */
  const nA=[X(0,NET),Y(0,NET)],nB=[X(W,NET),Y(W,NET)];
  const NH=15;
  g.strokeStyle='#3e3226';g.lineWidth=2.6;
  g.beginPath();g.moveTo(nA[0],nA[1]);g.lineTo(nA[0],nA[1]-NH);g.stroke();
  g.beginPath();g.moveTo(nB[0],nB[1]);g.lineTo(nB[0],nB[1]-NH);g.stroke();
  g.fillStyle='rgba(240,240,232,0.30)';
  g.beginPath();g.moveTo(nA[0],nA[1]-NH);g.lineTo(nB[0],nB[1]-NH);g.lineTo(nB[0],nB[1]-4);g.lineTo(nA[0],nA[1]-4);g.closePath();g.fill();
  g.strokeStyle='rgba(250,250,244,0.75)';g.lineWidth=1;
  g.beginPath();g.moveTo(nA[0],nA[1]-NH);g.lineTo(nB[0],nB[1]-NH);g.stroke();
  g.beginPath();g.moveTo(nA[0],nA[1]-4);g.lineTo(nB[0],nB[1]-4);g.stroke();
  for(let i=1;i<10;i++){
    const u=i*W/10;
    g.beginPath();g.moveTo(X(u,NET),Y(u,NET)-NH);g.lineTo(X(u,NET),Y(u,NET)-4);g.stroke();
  }
  /* герої */
  const ps=VB.ps.slice().sort((a,b2)=>(a.x+a.y)-(b2.x+b2.y));
  for(let pi=0;pi<ps.length;pi++){
    const pl=ps[pi];
    const dx2=pl.x-(pl._lx===undefined?pl.x:pl._lx),dy2=pl.y-(pl._ly===undefined?pl.y:pl._ly);
    const moved=IB.M.abs(dx2)+IB.M.abs(dy2)>0.001||(pl===L&&(mv.x||mv.y));
    pl._lx=pl.x;pl._ly=pl.y;
    pl.aT=(pl.aT||0)+(moved?dt*9:0);
    if(moved){
      const sx=dx2-dy2,sy=(dx2+dy2)*0.5;
      pl.isoDir=IB.M.abs(sx)>IB.M.abs(sy)?(sx>0?'r':'l'):(sy>0?'d':'u');
    }
    const px=X(pl.x,pl.y),py=Y(pl.x,pl.y);
    g.fillStyle='rgba(0,0,0,0.30)';g.beginPath();g.ellipse(px,py-1,7,3,0,0,7);g.fill();
    g.strokeStyle=pl.team===0?'#f0d050':'#e05a5a';g.lineWidth=1.6;
    g.beginPath();g.ellipse(px,py-1,7.5,3.2,0,0,7);g.stroke();
    if(!pl.hero&&pl.team===1&&!pl._lk){
      pl._lk={skin:'#e8b088',hair:'#241a10',hat:'cap',hatc:'#8a4a38',jacket:'#b84848',pants:'#3e4038',beard:pi===3,pack:false};
    }
    IB.drawPerson(g,px,py,pl.isoDir||'d',moved?1+((pl.aT|0)%2):0,pl.hero?pl.hero.look:pl._lk);
    g.font='bold 6px monospace';g.textAlign='center';
    g.fillStyle=pl.team===0?'#f0e8b0':'#f0c0c0';
    g.fillText(pl.nm.slice(0,10),px,py-34);
    if(pl===L&&pl.mv!==false){g.strokeStyle='#ffffff';g.beginPath();g.ellipse(px,py-1,9.5,4.2,0,0,7);g.stroke();}
    g.textAlign='left';
  }
  /* м'яч із висотою */
  const bx=X(b.x,b.y),byG=Y(b.x,b.y);
  g.fillStyle='rgba(0,0,0,0.28)';g.beginPath();g.ellipse(bx,byG-1,3,1.3,0,0,7);g.fill();
  g.fillStyle='#f2f2ec';g.beginPath();g.arc(bx,byG-b.z*7-3,3.2,0,7);g.fill();
  g.strokeStyle='#c8a858';g.lineWidth=0.9;
  g.beginPath();g.arc(bx,byG-b.z*7-3,3.2,0.7,2.7);g.stroke();
  g.beginPath();g.arc(bx,byG-b.z*7-3,3.2,3.6,5.6);g.stroke();
  /* підказка прийому */
  if(b.free&&b.cool<=0&&vbSide(b.y)===0&&b.z<3.4&&IB.dist(L.x,L.y,b.x,b.y)<2.5){
    g.font='bold 8px monospace';g.textAlign='center';g.fillStyle='#f0d050';
    g.fillText('✊ УДАР / E ВІДБИЙ',bx,byG-26);g.textAlign='left';
  }
  /* табло і підказки */
  const tw=IB.M.min(230,VW2-36);
  g.fillStyle='#0a0e14ee';IB.P(g,VW2/2-tw/2,44,tw,26,'#0a0e14ee');g.strokeStyle='#3e5568';g.strokeRect(VW2/2-tw/2,44,tw,26);
  g.font='bold 10px monospace';g.textAlign='center';g.fillStyle='#f0d050';
  g.fillText('ЛЕГЕНДАРНІ '+VB.score[0]+' : '+VB.score[1]+' МІСЦЕВІ   '+IB.M.max(0,IB.M.ceil(VB.t))+'с',VW2/2,61);
  g.font='7px monospace';g.fillStyle='#c8d8d0';
  g.fillText(VB.msg.slice(0,66),VW2/2,VH2-30);
  g.fillStyle='#78908a';
  g.fillText('E — ВІДБИЙ/ПАС • ✊ — ПОДАЧА/УДАР • ESC — ЗАВЕРШИТИ • НА ТЕЛЕФОНІ — КНОПКИ СПРАВА',VW2/2,VH2-16);
  if(VB.flash>0){VB.flash-=dt*1.4;g.fillStyle='rgba(255,240,180,'+(IB.M.max(0,VB.flash)*0.35)+')';g.fillRect(0,0,VW2,VH2);}
  VB.t-=dt;
  if(VB.t<=0&&VB.rally){setTimeout(()=>{if(VB)vbEnd(VB.score[0]>VB.score[1],VB.score[0]+':'+VB.score[1]);},300);VB.t=999;}
  g.textAlign='left';
};

/* ================= ПОКЕР — ІЗО-СТІЛ ІЗ ГЕРОЯМИ =================
   Логіка холдема без змін (holdemStart/Act/Step/NextStage...);
   картинка: стіл-еліпс в ізометрії, 5 гравців за столом, фішки. */
IB.drawHoldem=(g,dt)=>{
  IB.holdemKeys&&IB.holdemKeys(dt);
  if(!PKH){mode='game';return;}
  const VW2=IB.GFX.VW||480,VH2=IB.GFX.VH||336;
  /* прогін AI-ходів (та сама логіка) */
  PKH.t+=dt;
  if(PKH.stage!=='done'&&PKH.stage!=='deal'){
    const cur=PKH.players[PKH.turn];
    const heroTurn=cur&&cur.hero&&!cur.fold&&!cur.allin;
    if(!heroTurn){
      if(PKH.t>0.7){PKH.t=0;holdemStep();}
    }else{PKH.t=0;}
    if(holdemRoundDone()&&PKH.stage!=='done'&&PKH.stage!=='showdown'){
      if(PKH.t>0.45){PKH.t=0;holdemNextStage();}
    }
  }
  /* фон — задня кімната бару «Пірат» */
  g.fillStyle='#0b0f14';g.fillRect(0,0,VW2,VH2);
  g.fillStyle='#241a12';g.fillRect(0,VH2*0.42,VW2,VH2*0.58);
  g.fillStyle='#2e2013';
  for(let i=0;i<10;i++)g.fillRect(i*VW2/10+4,VH2*0.42+((i%2)*6),3,VH2*0.5);
  const cx=VW2/2,cy=VH2*0.44;
  const rx=IB.M.min(VW2*0.36,180),ry=rx*0.52;
  /* тінь */
  g.fillStyle='rgba(0,0,0,0.4)';g.beginPath();g.ellipse(cx+5,cy+ry+8,rx*1.04,ry*0.9,0,0,7);g.fill();
  /* дерев'яний обід */
  g.fillStyle='#7a5a34';g.beginPath();g.ellipse(cx,cy+6,rx+9,ry+6,0,0,7);g.fill();
  g.fillStyle='#8a6a42';g.beginPath();g.ellipse(cx,cy+4,rx+7,ry+5,0,0,7);g.fill();
  /* сукно */
  g.fillStyle='#184a34';g.beginPath();g.ellipse(cx,cy,rx,ry,0,0,7);g.fill();
  g.strokeStyle='#0e2c1e';g.lineWidth=2;g.beginPath();g.ellipse(cx,cy,rx-6,ry-4,0,0,7);g.stroke();
  g.fillStyle='#e8dcb0';g.font='6px monospace';g.textAlign='center';
  g.fillText('БАР «ПІРАТ» • ТЕХАСЬКИЙ ХОЛДЕМ ₴'+PKH.buy+' • БАНК: ₴'+PKH.pot,cx,cy-8);
  /* спільні карти в центрі столу */
  const cw=20,ch=28;
  for(let i=0;i<5;i++){
    const x=cx-((5*cw+16)/2)+i*(cw+4),y=cy-2;
    if(PKH.community[i])holdemDrawCard(g,x,y,PKH.community[i],false);
    else{IB.P(g,x,y,cw,ch,'#0e2c1e');g.strokeStyle='#24402e';g.strokeRect(x+0.5,y+0.5,cw-1,ch-1);}
  }
  /* місця — 5 гравців за столом (спрайти героїв) */
  const n=PKH.players.length;
  const seatAng=(i)=>Math.PI*0.5+i*(Math.PI*2/n)*(i===0?1:0.88)+(i===0?0:0.1);
  const seats=PKH.players.map((pl,i)=>{
    const a=seatAng(i);
    return {x:cx+IB.M.cos(a)*(rx+26),y:cy+IB.M.sin(a)*(ry+22),i:i};
  }).sort((a,b)=>a.y-b.y);
  const PKH_LOOKS=['#66723e','#5e6472','#b84878','#8a6a42'];
  const PKH_NAMES=['Мурзик','Гопчик','Оксана','Іверо'];
  PKH.btns=[];
  for(const s of seats){
    const pl=PKH.players[s.i];
    const isHero=!!pl.hero;
    const look=isHero?(IB.E.team[0].look||{}):{skin:'#e0a878',hair:'#241a10',hat:'none',
      jacket:PKH_LOOKS[(s.i-1)%4],pants:'#3e4038',beard:pl.nm==='Мурзик'||pl.nm==='Гопчик',pack:false};
    const dir=s.y<cy-8?'u':(s.x<cx-10?'r':(s.x>cx+10?'l':'d'));
    g.fillStyle='rgba(0,0,0,0.3)';g.beginPath();g.ellipse(s.x,s.y-1,7,3,0,0,7);g.fill();
    IB.drawPerson(g,s.x,s.y,dir,0,look);
    g.textAlign='center';
    g.fillStyle=pl.fold?'#5a6068':(isHero?'#f0d050':'#c8d8d0');
    g.font='bold 7px monospace';
    g.fillText(pl.nm+(PKH.dealer===s.i?' • D':''),s.x,s.y-(isHero?52:38));
    g.font='6px monospace';g.fillStyle='#9ab0a8';
    g.fillText('₴'+pl.chips+(pl.bet?' • ставка ₴'+pl.bet:''),s.x,s.y-(isHero?44:30));
    /* фішки-стопка на краю столу */
    const chipX=cx+IB.M.cos(seatAng(s.i))*(rx*0.82),chipY=cy+IB.M.sin(seatAng(s.i))*(ry*0.80);
    if(pl.bet>0){
      for(let ci=0;ci<3;ci++){
        g.fillStyle=ci===1?'#f0d050':'#e8e8e2';
        g.beginPath();g.ellipse(chipX,chipY-ci*2.2,5.5,2.2,0,0,7);g.fill();
        g.strokeStyle='#3e3226';g.lineWidth=0.7;g.stroke();
      }
    }
    /* карти гравців */
    if(pl.hole.length){
      const cdY=isHero?s.y-16:s.y-46;
      if(isHero||PKH.stage==='showdown'){
        holdemDrawCard(g,s.x-54,cdY,pl.hole[0],isHero);
        holdemDrawCard(g,s.x-30,cdY,pl.hole[1],isHero);
      }else{
        IB.P(g,s.x-cw-2,cdY+4,cw,ch-4,'#1a3a5a');IB.P(g,s.x+2,cdY+4,cw,ch-4,'#1a3a5a');
        g.strokeStyle='#3e5a78';g.strokeRect(s.x-cw-2+0.5,cdY+4.5,cw-1,ch-5);g.strokeRect(s.x+2+0.5,cdY+4.5,cw-1,ch-5);
        g.fillStyle='#3e5a78';g.font='7px monospace';g.fillText('★',s.x-cw/2,cdY+16);g.fillText('★',s.x+cw/2+2,cdY+16);
      }
      if(isHero&&pl.hole.length&&PKH.stage!=='preflop'&&pl.eval===undefined&&!pl.fold){
        pl.evalHint=holdemBest(pl.hole.concat(PKH.community));
      }
      if(isHero&&pl.evalHint&&!pl.fold){
        g.fillStyle='#e8d050';g.font='6px monospace';
        g.fillText('у тебе: '+(pokerName(pl.evalHint)||'—'),s.x,s.y+10);
      }
      if(pl.lastAct&&PKH.stage!=='done'){g.fillStyle=pl.fold?'#e07060':'#7ce0e8';g.fillText(pl.lastAct,s.x,s.y+(isHero?16:6));}
    }
    g.textAlign='left';
  }
  /* хід гравця — кнопки (великі сенсорні #pokerpad пріоритетні) */
  const hero=PKH.players[0];
  const heroTurn=PKH.stage!=='done'&&PKH.players[PKH.turn]===hero&&!hero.fold&&!hero.allin;
  const padEl=IB.$('pokerpad'),padShow=!!(padEl&&padEl.classList.contains('show'));
  if(PKH.stage==='done'){
    if(!padShow){
      holdemBtn(g,VW2/2-120,VH2-74,110,30,'▶ НОВА РОЗДАЧА (E)',()=>IB.holdemNextHand());
      holdemBtn(g,VW2/2+10,VH2-74,110,30,'🏁 ВСТАТИ (+фішки)',()=>IB.holdemStand());
    }
  }else if(heroTurn){
    const toCall=PKH.betNeed-hero.bet;
    if(!padShow){
      holdemBtn(g,VW2/2-176,VH2-74,84,30,'✖ ФОЛД (1)',()=>IB.holdemAct('fold'));
      holdemBtn(g,VW2/2-88,VH2-74,84,30,toCall>0?'✔ КОЛ ₴'+toCall+' (2)':'✔ ЧЕК (2)',()=>IB.holdemAct('call'));
      holdemBtn(g,VW2/2,VH2-74,84,30,'⬆ РАЙЗ ₴'+(toCall+PKH.bb*2)+' (3)',()=>IB.holdemAct('raise'));
      holdemBtn(g,VW2/2+88,VH2-74,88,30,'💥 ВА-БАНК (4)',()=>IB.holdemAct('allin'));
    }
  }else{
    g.fillStyle='#78908a';g.font='7px monospace';g.textAlign='center';
    g.fillText('Хід: '+((PKH.players[PKH.turn]||{}).nm||'—')+'...',cx,VH2-58);
    g.textAlign='left';
  }
  g.textAlign='center';g.font='6.5px monospace';g.fillStyle='#c8d8d0';
  const msg=PKH.msg||'';
  const mlen=IB.M.max(20,IB.M.floor(VW2/4.2));
  for(let i=0;i*mlen<msg.length;i++)g.fillText(msg.slice(i*mlen,(i+1)*mlen),cx,VH2-44+i*8);
  g.fillStyle='#78908a';g.fillText('ESC — встати з-за столу',cx,VH2-8);
  g.textAlign='left';
};

/* ================= БУКМЕКЕР «КОЕФІЦІЄНТ» — СТАВКИ НА АПЛ =================
   Гравець: «там можна зайти, вибрати матчі АПЛ, поставити і піти; через
   день будуть результати — або вгадав, або програв — так можна заробляти».
   Реальні клуби УПЛ; коефіцієнти з сили команд; розрахунок — на зміну дня. */
const BK_TEAMS=[['Шахтар',9.0],['Динамо',8.4],['Зоря',6.9],['Кривбас',6.2],['Полісся',5.8],
  ['Ворскла',5.5],['Чорноморець',5.0],['Верес',4.7],['Карпати',4.5],['Рух',4.3],
  ['Колос',4.1],['ЛНЗ',3.9],['Оболонь',3.7],['Епіцентр',3.5]];
function bkMatches(day){
  const off=day%BK_TEAMS.length;
  const rot=BK_TEAMS.slice(off).concat(BK_TEAMS.slice(0,off));
  const ms=[];
  for(let i=0;i<4;i++){
    const A=rot[(i*2)%rot.length],B=rot[(i*2+1)%rot.length];
    const sh=A[1]/(A[1]+B[1]);
    const pH=IB.clamp(sh*0.72+0.06,0.15,0.80),pD=0.27,pA=IB.M.max(0.08,1-pH-pD);
    const o=v=>IB.clamp(IB.M.round((0.92/v)*10)/10,1.15,13);
    ms.push({id:i,home:A[0],away:B[0],odds:[o(pH),o(pD),o(pA)],p:[pH,pD,pA]});
  }
  return ms;
}
function bkResult(day,id){
  const m=bkMatches(day)[id];if(!m)return 0;
  const r=IB.hsh(day*7+id*13,5,9);
  if(r<m.p[0])return 0;
  if(r<m.p[0]+m.p[1])return 1;
  return 2;
}
function bkScore(day,id){
  const res=bkResult(day,id);
  let h=1+IB.M.floor(IB.hsh(day,id,31)*3),a=1+IB.M.floor(IB.hsh(day,id,77)*3);
  if(res===0&&h<=a)h=a+1;
  if(res===1&&h!==a)h=a;
  if(res===2&&a<=h)a=h+1;
  return h+':'+a;
}
function bkPickName(p){return ['1','X','2'][p];}
function bkPlace(mid,pick,stake){
  const m=bkMatches(IB.G.day)[mid];
  if(!m)return;
  if(IB.G.money<stake){IB.toast('Мало ₴ у спільній касі','red');closeDlg();return;}
  IB.G.money-=stake;
  IB.G.bets=IB.G.bets||[];
  IB.G.bets.push({day:IB.G.day,mid,home:m.home,away:m.away,pick,stake,odds:m.odds[pick]});
  IB.SFX.coin&&IB.SFX.coin();
  IB.toast('🎫 Ставку прийнято: '+m.home+' — '+m.away+' → '+bkPickName(pick)+', ₴'+stake+' (кф '+m.odds[pick]+'). Результат — завтра!','gold');
  IB.journalAdd&&IB.journalAdd('🎟','Ставка в «КОЕФІЦІЄНТІ»: '+m.home+' — '+m.away+' → '+bkPickName(pick)+', ₴'+stake);
  closeDlg();IB.openBookmaker();
}
function bkPick(mid,pick){
  const m=bkMatches(IB.G.day)[mid];if(!m)return;
  const odds=m.odds[pick];
  const who=['ПЕРЕМОГА '+m.home,'НІЧИЯ','ПЕРЕМОГА '+m.away][pick];
  openDialog('🎫 СТАВКА — '+m.home+' — '+m.away,'Прогноз: '+who+', коефіцієнт '+odds+'. Скільки ставимо? (спільна каса: ₴'+IB.G.money+')',[
    {t:'₴100 (кф '+odds+' → ₴'+IB.M.round(100*odds)+')',f:()=>bkPlace(mid,pick,100)},
    {t:'₴500 (кф '+odds+' → ₴'+IB.M.round(500*odds)+')',f:()=>bkPlace(mid,pick,500)},
    {t:'₴1000 (кф '+odds+' → ₴'+IB.M.round(1000*odds)+')',f:()=>bkPlace(mid,pick,1000)},
    {t:'₴5000 (кф '+odds+' → ₴'+IB.M.round(5000*odds)+')',f:()=>bkPlace(mid,pick,5000)},
    {t:'Передумав',f:closeDlg}]);
}
IB.openBookmaker=()=>{
  const day=IB.G.day,ms=bkMatches(day);
  let html='<div class="pcard"><b>🎟 ЛІНІЯ АПЛ — ДЕНЬ '+day+'</b><div class="ds">Вибери матч і прогноз: 1 — господарі, X — нічия, 2 — гості. Результати — наступного дня ранком, виплата одразу на спільну касу. Ставив — і йди собі гуляй.</div></div>';
  ms.forEach(m=>{
    html+='<div class="pcard"><b>⚽ '+m.home+' — '+m.away+'</b>'+
      '<div class="prow click" data-bk="'+m.id+'|0"><span class="nm">1 — '+m.home+'</span><span class="ds">кф '+m.odds[0]+'</span><span class="ok">₴</span></div>'+
      '<div class="prow click" data-bk="'+m.id+'|1"><span class="nm">X — нічия</span><span class="ds">кф '+m.odds[1]+'</span><span class="ok">₴</span></div>'+
      '<div class="prow click" data-bk="'+m.id+'|2"><span class="nm">2 — '+m.away+'</span><span class="ds">кф '+m.odds[2]+'</span><span class="ok">₴</span></div></div>';
  });
  const bets=IB.G.bets||[];
  if(bets.length){
    html+='<div class="prow head"><span class="nm">ТВОЇ СТАВКИ — ЧЕКАЄМО РЕЗУЛЬТАТУ</span><span class="ds">день</span><span class="ok">ставка</span></div>';
    bets.forEach(bt=>{
      html+='<div class="prow"><span class="nm">⚽ '+bt.home+' — '+bt.away+' → '+bkPickName(bt.pick)+' (кф '+bt.odds+')</span><span class="ds">д.'+bt.day+'</span><span class="ok">₴'+bt.stake+'</span></div>';
    });
  }
  const log=IB.G.betLog||[];
  if(log.length){
    html+='<div class="prow head"><span class="nm">ОСТАННІ РОЗРАХУНКИ</span></div>';
    log.forEach(l=>{
      html+='<div class="prow"><span class="nm">'+l.m+' — '+l.resTxt+'</span><span class="'+(l.win?'ok':'no')+'">'+(l.win?'+₴'+l.ret:'−₴'+l.stake)+'</span></div>';
    });
  }
  openPanel('🎫 БУКМЕКЕР «КОЕФІЦІЄНТ» — СТАВКИ АПЛ',html);
  IB.$('panel-body').querySelectorAll('[data-bk]').forEach(el=>{
    el.onclick=()=>{const pp=el.dataset.bk.split('|');bkPick(+pp[0],+pp[1]);};
  });
};
IB.settleBets=()=>{
  const bets=IB.G.bets||[];
  for(let i=bets.length-1;i>=0;i--){
    const bt=bets[i];
    if(bt.day>=IB.G.day)continue;
    const res=bkResult(bt.day,bt.mid);
    const sc=bkScore(bt.day,bt.mid);
    const win=res===bt.pick;
    const ret=win?IB.M.round(bt.stake*bt.odds):0;
    if(win)IB.G.money+=ret;
    IB.G.betLog=IB.G.betLog||[];
    IB.G.betLog.unshift({d:bt.day,m:bt.home+' — '+bt.away,resTxt:sc+' ('+bkPickName(res)+')',win:win,ret:ret,stake:bt.stake});
    IB.G.betLog=IB.G.betLog.slice(0,8);
    bets.splice(i,1);
    IB.sms&&IB.sms('book','БУКМЕКЕР «КОЕФІЦІЄНТ»',win?('ВИГРАШ! '+bt.home+' — '+bt.away+' '+sc+': прогноз '+bkPickName(bt.pick)+' зіграв. Виплата ₴'+ret+' на спільний рахунок.'):('На жаль: '+bt.home+' — '+bt.away+' '+sc+' — прогноз '+bkPickName(bt.pick)+' не зіграв. Ставка ₴'+bt.stake+' втрачена. Заходь — лінія на сьогодні вже на дошці!'));
    IB.journalAdd&&IB.journalAdd(win?'🎟':'📉','Букмекер: '+(win?'+₴'+ret:'−₴'+bt.stake)+' — '+bt.home+' — '+bt.away+' '+sc);
  }
};
IB.updateBook=(dt)=>{
  const bets=IB.G.bets;
  if(!bets||!bets.length)return;
  IB.settleBets();
};
IB.BOOK={matches:bkMatches,result:bkResult,score:bkScore,place:bkPlace,pick:bkPick};

/* хуки режиму: клавіші/перемальовка волейболу + кнопки матчів */
IB.startVolleyIso=startVolleyIso;

  /* v19.0: експорт діалогового двигуна — talk.js малює меню питань поверх інтер'єру */
  IB.openDialog=(name,text,opts)=>openDialog(name,text,opts);
  IB.closeDlg=()=>closeDlg();
  return {start,getMode:()=>mode,setMode:(m)=>{mode=m;},debug:{openPanel,closePanel,openGroupPanel,openJournal,openBag,openMap,hotbar:(k)=>hotbar(k),
    openTravels:()=>openTravels(),climbStep:()=>climbStep(),finishTravel:()=>finishTravel(),
    interactList:()=>interactList(),openRadialTest:()=>{const l=interactList();if(l.length>1)openRadial(l);else if(l.length===1)l[0].f();},
    abort:()=>IB.TRAVEL_ABORT(),summitEnd:()=>IB.SUMMIT_END(),enterInt:(b)=>enterInterior(b),exitInt:()=>exitInterior()}};
})();

/* v3.0-main-patch */
