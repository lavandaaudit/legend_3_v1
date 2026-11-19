/* carown.js — LEGEND 3 «МОРЕ МОРЕ» v28.0 «МОЄ АВТО»
   Гравець: «треба добавити купівлю авто — можна купити авто і переміщатись
   на авто по місту; ще заправку зробити 3-4 штуки в місті щоб раз в 4 дні
   десь заправлятись; пропиши по всіх меню нові локації — заправки, ринок
   авто і тюнінг гараж де колір міняти можна; авто як купив стає нашим —
   можемо залишати або їздити, до нього треба повертатись; виходити —
   зачиняти, приходити — відчиняти».

   ЩО ВНУТРІ:
   • КАТАЛОГ авторинку «АВТОМОРЕ»: 5 машин з цінами і описами;
   • ПАЛІТРА тюнінгу «КЕРМ»: 10 кольорів з назвами, фарбування ₴600;
   • СТАН: бензин (45 л бак = 100%), витрата 0.55%/тайл (≈ бак на 3-4 дні
     активної їзди), замок (виходиш — ЗАЧИНЯЄШ, приходиш — ВІДЧИНЯЄШ),
     номерний знак «ЛЕ» (ЛЕГЕНДА), пробіг, каністри;
   • ЇЗДА ВУЛИЦЯМИ: кермуєш сам (джойстик/WASD), їздо по асфальту і
     бетонних майданчиках, уся п'ятірка в салоні, камера за авто;
   • ЗАПРАВКИ ×4: до заловка / на ₴200 / на ₴500 — ціна за літр своя у
     кожної мережі; каністра ₴300 (+25%); евакуатор ₴400 до заправки;
   • СПРАЙТИ ПЕРЕКРАШУЮТЬСЯ «НА ЖИВУ» — cars3-канвас з власним кольором;
   • СЕЙВ: авто, колір, паливо, замок, стоянка — у слот (v28-обгортка). */
(function(){
const M=IB.M;

/* ==================== КАТАЛОГ АВТОРИНКУ ==================== */
const CAR_CATALOG=[
  {id:'vaz',  name:'ВАЗ-2101 «КОПІЙКА»',   price:38000, col:'#d8d2c4', colN:'БЕЖЕВИЙ «ДІДУСЬ»',
   desc:'класика з Автобази №1 — заводиться завжди, багажник великий'},
  {id:'lanos',name:'LANOS HB',              price:52000, col:'#5c86c8', colN:'СИНІЙ «ХВИЛЯ»',
   desc:'міський хетч — скромно жере і легко паркується біля пляжу'},
  {id:'van',  name:'ФУРГОН «БУЛЬКА»',       price:68000, col:'#c8b890', colN:'ПІСОЧНИЙ «КУРОРТ»',
   desc:'уся п\'ятірка + парасолі + кавун — влізе все і одразу'},
  {id:'truck',name:'ПІКАП «ЛИМАН»',         price:74000, col:'#5e6472', colN:'СІРИЙ «ШТОРМ»',
   desc:'кава у кузові — для виїздів на рибалку і по воду в Барабой'},
  {id:'suv',  name:'ПОЗАШЛЯХОВИК «БУЙВОЛ»', price:96000, col:'#5e6e50', colN:'ЗЕЛЕНИЙ «МАК»',
   desc:'повний привід — до мола доїде і в спеку, і в шторм'},
];
IB.CAR_CATALOG=CAR_CATALOG;

/* ==================== ПАЛІТРА ТЮНІНГУ ==================== */
const CAR_PALETTE=[
  {c:'#e8e8e2',n:'БІЛИЙ «ПІНА»'},
  {c:'#d8d2c4',n:'БЕЖЕВИЙ «ПІСОК»'},
  {c:'#5c86c8',n:'СИНІЙ «ХВИЛЯ»'},
  {c:'#3fa97b',n:'ЗЕЛЕНИЙ «ЛИМАН»'},
  {c:'#ee6444',n:'ЧЕРВОНИЙ «КАВУН»'},
  {c:'#e8b23a',n:'ЖОВТИЙ «СОНЦЕ»'},
  {c:'#e07038',n:'ОРАНЖ «МАНДАРИН»'},
  {c:'#f4a8c0',n:'РОЖЕВИЙ «ДІВЧАЧИЙ»'},
  {c:'#8a5a9a',n:'ФІОЛЕТ «РЕЙВ»'},
  {c:'#2a2e38',n:'ЧОРНИЙ «АКУЛА»'},
];
IB.CAR_PALETTE=CAR_PALETTE;
const REPAINT_PRICE=600, TANK=45, USE_PER_TILE=0.55;

/* ==================== СТАН «МОЄ АВТО» ==================== */
IB.CAR_OWN={owned:false,model:null,color:null,colorN:'',fuel:0,locked:true,
  car:null,driving:false,riders:null,parkX:0,parkY:0,dir:'d',
  plate:'AE '+M.round(IB.rnd(1000,9999))+' ЛЕ',dist:0,refuels:0,washes:0,
  warn25:false,warn10:false,warn0:false,hud:null};

const S=IB.CAR_OWN;
const carName=()=>{const m=CAR_CATALOG.find(c=>c.id===S.model);return m?m.name:'АВТО';};

/* ==================== СПРАЙТИ ВЛАСНОГО КОЛЬОРУ ====================
   Ключі car_<модель>_own_<напрям> — drawCar підхоплює через c.var='own'
   (m2=модель+'_'+варіант), CARPAD береться за БАЗОВОЮ моделлю — колесо
   точно на лінії смуги, як у всього трафіку. */
function mirrorCanvas(src){
  const c=IB.mk(src.width,src.height),g=c.g;
  g.save();g.translate(src.width,0);g.scale(-1,1);g.drawImage(src,0,0);g.restore();
  return c;
}
IB.carBuildSprites=()=>{
  if(!S.owned||!IB._carCanvas)return;
  const mdl=S.model,col=S.color;
  try{
    const se=IB._carCanvas(mdl,false,false,col,IB.shade(col,0.16));
    const ne=IB._carCanvas(mdl,true,false,col,IB.shade(col,0.16));
    IB.IMG['car_'+mdl+'_own_se']=se;
    IB.IMG['car_'+mdl+'_own_sw']=mirrorCanvas(se);
    IB.IMG['car_'+mdl+'_own_ne']=ne;
    IB.IMG['car_'+mdl+'_own_nw']=mirrorCanvas(ne);
  }catch(e){console.warn('carBuildSprites',e);}
};

/* ==================== ПОЯВА АВТО НА КАРТІ ==================== */
function spawnOwnEntity(){
  if(!S.owned)return;
  if(S.parkX<=0){const lot=IB.W.CARMKT_LOT||{x:219,y:266};S.parkX=lot.x+6;S.parkY=lot.y+2.5;}
  const c={type:'car',model:S.model,var:'own',x:S.parkX,y:S.parkY,dir:S.dir||'d',
    v:0,a:0,b:0,c:S.color,honkT:0,own:true};
  IB.E.cars.push(c);S.car=c;S.driving=false;
}
/* виклик з ents.spawnVillagers() ПІСЛЯ spawnCars() (очищає E.cars) */
IB.spawnOwnCars=()=>{
  if(!IB.E||!IB.E.cars)return;
  /* власне авто — щоразу наново (трапік wiped) */
  if(S.owned){S.car=null;spawnOwnEntity();}
  /* виставкові машини авторинку — 4 моделі на бетоні перед дверима */
  const lot=IB.W.CARMKT;
  if(lot&&!IB.E.cars.some(c=>c.lot)){
    const put=(mdl,vr,x,y,dir,col)=>IB.E.cars.push({type:'car',model:mdl,var:vr||'',x,y,dir,v:0,a:0,b:0,
      c:col||'#c8c8c8',honkT:0,lot:true});
    put('vaz',   '',   lot.x+1,  lot.y+1, 'd');
    put('lanos', 'a',  lot.x+4,  lot.y+1, 'd');
    put('suv',   'a',  lot.x+7,  lot.y+1, 'd');
    put('truck', 'a',  lot.x+10, lot.y+1, 'd');
  }
};

/* ==================== КУПІВЛЯ ==================== */
IB.carBuy=(mid)=>{
  const m=CAR_CATALOG.find(c=>c.id===mid);if(!m)return false;
  if(S.owned){IB.toast('У п\'ятірки вже є авто — '+carName()+' («АВТОМОРЕ» приймає б/у у обмін на похвалу)','red');return false;}
  if(!IB.payShared(m.price)){IB.toast('Не вистачає ₴ у спільній касі ('+m.name+' — ₴'+m.price+')','red');return false;}
  S.owned=true;S.model=m.id;S.color=m.col;S.colorN=m.colN;
  S.fuel=85;S.locked=false;S.dist=0;S.refuels=0;
  S.warn25=S.warn10=S.warn0=false;
  const lot=IB.W.CARMKT_LOT||{x:219,y:266};
  S.parkX=lot.x+6;S.parkY=lot.y+2.5;S.dir='d';
  IB.carBuildSprites();
  spawnOwnEntity();
  IB.G.flags.carBought=true;
  IB.banner('ПЕРША МАШИНА П\'ЯТІРКИ!');
  IB.toast('🚗 '+m.name+' — НАШЕ АВТО! Ключі і номер '+S.plate+'. E біля машини — сісти за кермо','gold');
  IB.journalAdd('🚗','Купили '+m.name+' на «АВТОМОРЕ» за ₴'+m.price+'. Номер '+S.plate+'.');
  IB.sms&&IB.sms('team','П\'ЯТЕРКА','ВСЕ, МИ НА АВТО! '+m.name+', номер '+S.plate+'. Хто за кермо — тому нюхати кавун на наступний день!');
  IB.sms&&IB.sms('carmkt','Джим (авторинок)','Дякую за покупку! Бензу 85%. ЗАПРАВКИ у місті 4: «Паллада-Нафта» Північ і Центр, «Мазит» Південь, «Порт-Сервіс» у порту. Тюнінг «КЕРМ» поруч пофарбує.');
  IB.questCheck&&IB.questCheck();
  IB.SFX.coin&&IB.SFX.coin();
  return true;
};

/* ==================== HUD ПОЇЗДКИ ==================== */
function hudEl(){
  if(S.hud&&S.hud.parentNode)return S.hud;
  let el=document.getElementById('car-hud');
  if(!el){
    el=document.createElement('div');el.id='car-hud';
    el.style.cssText='position:fixed;top:calc(54px + env(safe-area-inset-top,0px));left:50%;transform:translateX(-50%);'+
      'background:rgba(8,14,10,.85);border:1px solid #4a7a3a;border-radius:9px;color:#d8ecd0;'+
      'font:700 12px monospace;padding:6px 12px;z-index:34;white-space:nowrap;pointer-events:none;';
    document.body.appendChild(el);
  }
  S.hud=el;return el;
}
function hudUpdate(){
  const el=hudEl();if(!el)return;
  const f=M.max(0,M.round(S.fuel));
  const fc=f<=10?'#e05a5a':(f<=25?'#e0a030':'#7ce08a');
  el.innerHTML='🚗 '+carName().toUpperCase()+' • <span style="color:'+fc+'">⛽ '+f+'%</span> • <span style="opacity:.75">E — ВИЙТИ/ЗАЧИНИТИ</span>';
  el.classList.remove('hidden');
}
function hudHide(){if(S.hud){S.hud.classList.add('hidden');}}

/* ==================== ЇЗДА ==================== */
const drivable=(x,y)=>{
  const W=IB.W;
  if(x<2||y<2||x>=W.W-2||y>=W.H-2)return false;
  const t=W.at(x,y);
  return t===12||t===19||t===13;   /* асфальт, зебра, бетон/плитка */
};
IB.carOwnDrive=(dt)=>{
  if(!S.driving||!S.car)return;
  const c=S.car;
  const v=(IB.moveVec&&IB.moveVec())||{x:0,y:0};
  const spd=5.4;
  let moved=false;
  if((v.x||v.y)&&S.fuel>0){
    const px=c.x,py=c.y;
    let nx=c.x,ny=c.y;
    if(v.x){const tx=c.x+v.x*spd*dt;if(drivable(tx,c.y))nx=tx;}
    if(v.y){const ty=c.y+v.y*spd*dt;if(drivable(nx,ty))ny=ty;}
    if((v.x&&nx!==c.x)||(v.y&&ny!==c.y)){
      c.x=IB.clamp(nx,2,IB.W.W-2.2);c.y=IB.clamp(ny,2,IB.W.H-2.2);
      moved=true;
      const dx=c.x-px,dy=c.y-py;
      if(M.abs(dx)>M.abs(dy)*1.15)c.dir=dx>0?'r':'l';
      else if(M.abs(dy)>M.abs(dx)*1.15)c.dir=dy>0?'d':'u';
      /* паливо: за пройдений шлях */
      const d=M.abs(dx)+M.abs(dy);
      S.fuel=IB.clamp(S.fuel-d*USE_PER_TILE,0,100);
      S.dist+=d;
      c.frT=(c.frT||0)+dt*10;c.fr=1+((c.frT|0)%2);
    }
  }
  if(!moved)c.fr=0;
  /* уся п'ятірка — у салоні (приховано, як у таксі v23) */
  if(S.riders)for(const h of S.riders){h.x=c.x;h.y=c.y+0.6;h.dir=c.dir;h._inCar=true;}
  /* попередження про бензин */
  if(S.fuel<=25&&!S.warn25){S.warn25=true;IB.toast('⛽ Паливо 25% — час на заправку (найближча — у телефона, GPS)','red');}
  if(S.fuel<=10&&!S.warn10){S.warn10=true;IB.toast('⛽ Паливо 10%! До заправки — на голоді сторожі','red');}
  if(S.fuel<=0&&!S.warn0){S.warn0=true;S.fuel=0;
    IB.banner('БАК ПУСТИЙ — АВТО СТАЛО');
    IB.toast('⛽ Бензин скінчився! Заправка/каністра/евакуатор — або гуляй пішки','red');
    IB.sms&&IB.sms('team','П\'ЯТЕРКА','Бак пустий! Хтось казав «доїдемо»... Каністра ₴300 на заправці або евакуатор ₴400.');}
  hudUpdate();
};

/* ==================== СІСТИ / ВИЙТИ ==================== */
IB.carBoard=()=>{
  if(!S.owned||!S.car||S.driving)return false;
  if(S.fuel<=0){IB.toast('Бак ПУСТИЙ — двигун мовчить. Заправка, каністра або евакуатор','red');return true;}
  const L=IB.E.team[0];if(!L)return false;
  S.riders=IB.E.team.filter(h=>h.task!=='date'&&h.task!=='gone');
  S.riders.forEach(h=>{h._inCar=true;h.target=null;});
  S.locked=false;S.driving=true;
  S.warn25=S.warn10=S.warn0=false;
  IB.toast('🚗 ЗАВЕЛИ ('+S.riders.length+' у салоні)! Вулицями — джойстик/WASD. E — вийти і ЗАЧИНИТИ','gold');
  IB.SFX.ui&&IB.SFX.ui();
  hudUpdate();
  return true;
};
IB.carExit=(lock)=>{
  if(!S.driving||!S.car)return;
  const c=S.car;
  S.driving=false;
  const s=IB.snapToReach(M.round(c.x),M.round(c.y));
  const rd=S.riders&&S.riders.length?S.riders:[IB.E.team[0]];
  rd.forEach((h,i)=>{h.x=s.x+(i-rd.length/2)*0.62;h.y=s.y+0.85+i*0.25;
    h._inCar=false;h.fr=0;h.target=null;h.tx=h.x;h.ty=h.y;
    if(!IB.walkable(h.x,h.y)){const q=IB.snapToReach(M.round(h.x),M.round(h.y));h.x=q.x;h.y=q.y;}});
  S.riders=null;
  S.parkX=c.x;S.parkY=c.y;S.dir=c.dir;
  S.locked=lock!==false;
  hudHide();
  IB.toast(S.locked?'🔒 Вийшли і ЗАЧИНИЛИ '+carName()+' (⛽ '+M.round(S.fuel)+'%) — E біля авто, щоб відчинити'
                   :'🔓 Вийшли, авто відчинене (⛽ '+M.round(S.fuel)+'%)','gold');
  IB.journalAdd('🚗',S.locked?'Зачинили авто на '+M.round(c.x)+','+M.round(c.y)+' (бензин '+M.round(S.fuel)+'%)':'Вийшли з авто');
  IB.SFX.ui&&IB.SFX.ui();
};
/* E-меню поїздки: вийти і зачинити / лишити відчиненим / продовжити */
IB.carExitMenu=()=>{
  const S2=IB.CAR_OWN;
  IB.openDialog('🚗 '+carName().toUpperCase()+' — ЗА КЕРМОМ',
    '«Припаркуємось тут? Вийдеш — авто ЗАЧИНИТЬСЯ (прийдеш — відчиниш). Паливо: ⛽ '+M.round(S2.fuel)+'%. Пробіг: '+M.round(S2.dist)+' тайлів.»',[
    {t:'🚪 ВИЙТИ І ЗАЧИНИТИ (замок)',f:()=>{IB.closeDlg();IB.carExit(true);}},
    {t:'🔓 ВИЙТИ, ЛИШИТИ ВІДЧИНЕНИМ',f:()=>{IB.closeDlg();IB.carExit(false);}},
    {t:'⛽ ПАЛИВО: '+M.round(S2.fuel)+'% (інфо)',f:()=>{IB.closeDlg();
      IB.openDialog('⛽ ПАЛИВО','Бак '+TANK+' л. У баку '+M.round(S2.fuel/100*TANK)+' л ('+M.round(S2.fuel)+'%). '+
        'Витрата — за кілометраж: повного бака вистачає на кілька днів активної їзди. '+
        'Заправки: «Паллада-Нафта» (Північ, Центр), «Мазит» (Південь), «Порт-Сервіс» (порт). Далі — у телефона, додаток АВТО.',[
        {t:'Поїхали далі',f:IB.closeDlg},{t:'🚪 Вийти і зачинити',f:()=>{IB.closeDlg();IB.carExit(true);}}]);}},
    {t:'🚗 Ні, поїхали далі',f:IB.closeDlg}]);
};

/* ==================== КАНІСТРА ==================== */
IB.carCanUse=()=>{
  if(!S.owned||S.fuel>=95){IB.toast(S.owned?'Бак майже повний — каністра не потрібна':'Спершу купи авто на «АВТОМОРЕ»','red');return;}
  if((IB.G.inv.can||0)<=0){IB.toast('Каністри немає — купи на заправці (₴300)','red');return;}
  IB.G.inv.can--;S.fuel=IB.clamp(S.fuel+25,0,100);
  IB.toast('⛽ Каністру вилили в бак: +25% ('+M.round(S.fuel)+'%)','gold');
  S.warn0=false;
  IB.journalAdd('⛽','Каністра: паливо '+M.round(S.fuel)+'%.');
};

/* ==================== ЗАПРАВКА ==================== */
/* azsIdx — індекс у WA.AZS; ціна за літр у кожної мережі своя */
IB.carRefuelMenu=(azsIdx)=>{
  if(!S.owned){IB.toast('Спершу купи авто — авторинок «АВТОМОРЕ» у центрі (GPS)','red');return;}
  const azs=(IB.W.AZS||[])[azsIdx||0];
  const L=IB.E.team[0];if(!L)return;
  /* авто має стояти поблизу заправки (або ти приїхав на ньому) */
  const near=S.car&&(IB.dist(S.car.x,S.car.y,azs.x+azs.w/2,azs.y+azs.h/2)<9||S.driving);
  if(!near){IB.toast('Авто має стояти біля заправки (або їдь на ньому)','red');return;}
  const price=IB.AZS_PRICE(azsIdx);
  const need=(100-S.fuel)/100*TANK;
  const full=M.ceil(need*price);
  const opts=[];
  if(S.fuel>=99.5){
    IB.toast('Бак і так повний ⛽','gold');return;
  }
  if(full>0)opts.push({t:'⛽ ДО ЗАЛОВКА ('+M.round(need)+' л — ₴'+full+')',f:()=>{
    if(!IB.payShared(full)){IB.toast('Не вистачає ₴ у спільній касі','red');return;}
    S.fuel=100;afterRefuel(azs,full);}});
  if(full>200)opts.push({t:'⛽ НА ₴200 ('+M.round(200/price)+' л, +' +M.round(200/price/TANK*100)+'%)',f:()=>{
    if(!IB.payShared(200)){IB.toast('Не вистачає ₴','red');return;}
    S.fuel=IB.clamp(S.fuel+200/price/TANK*100,0,100);afterRefuel(azs,200);}});
  if(full>500)opts.push({t:'⛽ НА ₴500 (+'+M.round(500/price/TANK*100)+'%)',f:()=>{
    if(!IB.payShared(500)){IB.toast('Не вистачає ₴','red');return;}
    S.fuel=IB.clamp(S.fuel+500/price/TANK*100,0,100);afterRefuel(azs,500);}});
  opts.push({t:'Пізніше',f:IB.closeDlg});
  IB.openDialog('⛽ '+(azs.name||'ЗАПРАВКА'),
    '«Обсяг баку '+TANK+' л, у баку '+M.round(S.fuel/100*TANK)+' л ('+M.round(S.fuel)+'%). '+
    'Ціна: ₴'+price+'/л. Гасимо зі спільної каси (₴'+IB.G.money+').»',opts);
};
function afterRefuel(azs,amount){
  S.warn25=S.warn10=S.warn0=false;S.refuels++;
  IB.G.flags.refuelDay=IB.G.day;
  IB.G.flags.fullTankDay=S.fuel>=99.5?IB.G.day:(IB.G.flags.fullTankDay||0);
  IB.toast('⛽ Заправились: '+M.round(S.fuel)+'% (−₴'+amount+', '+azs.name+')','gold');
  IB.journalAdd('⛽',azs.name+': бак до '+M.round(S.fuel)+'% — ₴'+amount);
  IB.SFX.coin&&IB.SFX.coin();
  IB.questCheck&&IB.questCheck();
}
IB.AZS_PRICE=(idx)=>[57,56,55,58][idx%4];
IB.carEvacuate=(azsIdx)=>{
  if(!S.owned){IB.toast('Авто немає','red');return;}
  const azs=(IB.W.AZS||[])[azsIdx||0];
  if(!IB.payShared(400)){IB.toast('Евакуатор — ₴400','red');return;}
  if(S.driving)IB.carExit(true);
  const f=(IB.W.AZS_PUMPS&&IB.W.AZS_PUMPS[azsIdx])?IB.W.AZS_PUMPS[azsIdx][0]:[azs.x+azs.w/2,azs.y+azs.h];
  S.parkX=f[0];S.parkY=f[1]+0.9;S.dir='d';S.locked=true;
  if(S.car){S.car.x=S.parkX;S.car.y=S.parkY;S.car.dir='d';}
  IB.toast('🚛 Евакуатор доправив авто до '+azs.name+' (−₴400). Зачинене — відчини E','gold');
  IB.journalAdd('🚛','Евакуатор: авто на '+azs.name+' — ₴400');
  IB.SFX.coin&&IB.SFX.coin();
};

/* ==================== ТЮНІНГ ==================== */
IB.carRepaint=(ci)=>{
  if(!S.owned){IB.toast('Фарбувати нічого — спершу купи авто','red');return;}
  const p=CAR_PALETTE[ci];if(!p)return;
  if(p.c===S.color){IB.toast('Авто вже у кольорі «'+p.n+'»','gold');return;}
  if(!IB.payShared(REPAINT_PRICE)){IB.toast('Фарбування — ₴'+REPAINT_PRICE,'red');return;}
  S.color=p.c;S.colorN=p.n;
  IB.carBuildSprites();
  for(const h of IB.E.team)h.mood=IB.clamp(h.mood+6,0,100);
  IB.banner('НОВИЙ КОЛІР: '+p.n);
  IB.toast('🎨 '+carName()+' пофарбовано: «'+p.n+'» (−₴'+REPAINT_PRICE+') — настрій +6','gold');
  IB.journalAdd('🎨','Тюнінг «КЕРМ»: колір «'+p.n+'» — ₴'+REPAINT_PRICE);
  IB.sms&&IB.sms('team','П\'ЯТЕРКА','Видели новий колір?? «'+p.n+'»! Гена чарівник.');
  IB.SFX.coin&&IB.SFX.coin();
};
IB.carWash=()=>{
  if(!S.owned){IB.toast('Мити нічого — авто ще немає','red');return;}
  if(!IB.payShared(120)){IB.toast('Мийка — ₴120','red');return;}
  S.washes++;
  for(const h of IB.E.team)h.mood=IB.clamp(h.mood+4,0,100);
  IB.toast('🧽 '+carName()+' сяє! (−₴120, настрій +4)','gold');
  IB.journalAdd('🧽','Мийка «КЕРМ»: авто пофарбовано водою і поетом — ₴120');
  IB.SFX.coin&&IB.SFX.coin();
};

/* ==================== ІНФО ==================== */
function infoDlg(){
  const azs=IB.W.AZS||[];
  IB.openDialog('📋 '+carName().toUpperCase()+' ('+S.plate+')',
    '«Колір: '+S.colorN+'. Паливо: ⛽ '+M.round(S.fuel)+'% з '+TANK+' л. Пробіг: '+M.round(S.dist)+' тайлів. '+
    'Замок: '+(S.locked?'🔒 ЗАЧИНЕНО':'🔓 відчинено')+'. Заправок у місті: '+azs.length+' (GPS → заправки). '+
    'Стоянка: там, де вийшли — до авто треба ПОВЕРТАТИСЬ.»',[
    {t:'🚗 Кермо (якщо поруч)',f:()=>{IB.closeDlg();IB.carBoard();}},
    {t:'Зрозуміло',f:IB.closeDlg}]);
}
IB.carInfo=infoDlg;

/* ==================== ІНТЕГРАЦІЯ У МЕНЮ E ====================
   Виклик з main.interactList: IB.carInteract(L,push) */
IB.carInteract=(L,push)=>{
  if(!S.owned||S.driving||!S.car)return;
  if(IB.dist(L.x,L.y,S.car.x,S.car.y)>2.9)return;
  const first=!IB.G.flags.carTouched;
  push('mycar',(S.locked?'🔑 ВІДЧИНИТИ І СІСТИ ЗА КЕРМО':'🚗 СІСТИ ЗА КЕРМО')+' (⛽ '+M.round(S.fuel)+'%)',()=>{
    if(first){IB.G.flags.carTouched=true;}
    IB.carBoard();});
  if((IB.G.inv.can||0)>0&&S.fuel<95)push('mycan','⛽ ЛИТИ КАНІСТРУ (+25%)',()=>IB.carCanUse());
  push('mycarinfo','📋 ПРО АВТО — '+carName()+' '+S.plate,infoDlg);
};

/* ==================== ТІК (у головному циклі) ==================== */
IB.carOwnTick=()=>{
  if(!S.owned)return;
  if(S.driving){hudUpdate();}
  else hudHide();
  /* промо-СМС від авторинку на 2-й день */
  if(!IB.G.flags.carPromo&&IB.G.day>=2){
    IB.G.flags.carPromo=true;
    IB.sms&&IB.sms('carmkt','Джим (авторинок)','АВТОМОРЕ вітає курортників! ВАЗ ₴38 тис, Lanos ₴52 тис, фургон ₴68 тис, пікап ₴74 тис, буйвол ₴96 тис. Зандан: тюнінг «КЕРМ» пофарбує у колір моря.');
  }
  /* паливо має сенс лише з авто */
  if(!S.car&&IB.E.cars){S.car=IB.E.cars.find(c=>c.own)||null;}
};

/* ==================== СЕЙВ / ЛОАД (v28-обгортка) ==================== */
const _save28=IB.saveGame;
IB.saveGame=function(slot,silent){
  const r=_save28(slot,silent);
  try{
    const sl=(slot===undefined)?(IB.G.slot||0):slot;
    const KEY=sl===0?'ilegend3_more':('ilegend3_more_s'+sl);
    const raw=localStorage.getItem(KEY);
    if(raw){
      const d=JSON.parse(raw);
      if(S.owned)d.car={model:S.model,color:S.color,colorN:S.colorN,fuel:M.round(S.fuel*10)/10,
        locked:S.locked,parkX:M.round(S.parkX*10)/10,parkY:M.round(S.parkY*10)/10,dir:S.dir,
        dist:M.round(S.dist),refuels:S.refuels,washes:S.washes,plate:S.plate};
      localStorage.setItem(KEY,JSON.stringify(d));
    }
  }catch(e){}
  return r;
};
const _load28=IB.loadGame;
IB.loadGame=function(slot){
  const ok=_load28(slot);
  if(ok){
    try{
      const sl=(slot===undefined)?(IB.G.slot||0):slot;
      const KEY=sl===0?'ilegend3_more':('ilegend3_more_s'+sl);
      const d=JSON.parse(localStorage.getItem(KEY)||'{}');
      if(d.car&&d.car.model){
        S.owned=true;S.model=d.car.model;S.color=d.car.color;S.colorN=d.car.colorN||'';
        S.fuel=d.car.fuel!=null?d.car.fuel:50;S.locked=d.car.locked!==false;
        S.parkX=d.car.parkX||0;S.parkY=d.car.parkY||0;S.dir=d.car.dir||'d';
        S.dist=d.car.dist||0;S.refuels=d.car.refuels||0;S.washes=d.car.washes||0;
        S.plate=d.car.plate||S.plate;
        /* дольот спавн після лоаду: прибираємо старі копії власного авто */
        S.car=null;S.driving=false;S.riders=null;
        if(IB.E.cars)IB.E.cars=IB.E.cars.filter(c=>!c.own);
        IB.carBuildSprites();spawnOwnEntity();
      }else{
        S.owned=false;S.model=null;S.car=null;S.driving=false;
      }
    }catch(e){}
  }
  return ok;
};
})();
