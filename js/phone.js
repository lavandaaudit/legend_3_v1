/* LEGEND 3 «МОРЕ МОРЕ» — phone.js v7.0 «ТЕЛЕФОН V7 • МІСТО ×3»
   ТЕЛЕФОН ПРАВОРУЧ — ЗАВЖДИ ВІДКРИТИЙ (згортається в панель, P):
   ЕКРАН телефона = КАРТА (GPS) + МЕНЮ з 20 ДОДАТКІВ. Старе екранне меню
   переїхало СЮДИ: РЮКЗАК (M), КАРТА (TAB), ГРУПА (G), ЖУРНАЛ (J),
   РОЗВАГИ (T), ЖИТТЄЗАБЕЗПЕЧЕННЯ (1-4) — через IB.APPVIEWS з main.js.
   Додатки: СМС, GPS, КАРТА, БАНК (рахунки+журнал), КАМЕРА, БАНДИ, СКІЛИ,
   РЕПУТАЦІЯ, РЕЖИМ, КВЕСТИ, РЮКЗАК, ЖИТЛО, ТАКСІ, №7, ЖИТТЯ, РОЗВАГИ,
   РАДІО, ЛЮДИ, ГРУПА, ЖУРНАЛ. Швидкі дії (E/БІГ/Гукати/Фонар/Битка/
   Гулянка) — кнопки в телефона (bindTouch у main.js). */
(function(){

/* ---------- СТАН ---------- */
IB.PHONE={open:false,visible:false,min:true,app:'home',chat:'team',unread:0,ready:false,
  chats:{},radioLog:['103.2 FM: Доброго ранку, Чорноморськ! Море +24, хвилі спокійні.']};
const PH=IB.PHONE;

IB.radioLog=(txt)=>{PH.radioLog.push(txt);if(PH.radioLog.length>60)PH.radioLog.shift();if(PH.visible&&!PH.min&&PH.app==='radio')renderApp();};

/* ---------- РЕЄСТР ДОДАТКІВ (20) ---------- */
const APPS=[
  {id:'sms',    icon:'✉',n:'СМС'},
  {id:'gps',    icon:'🗺',n:'GPS'},
  {id:'map',    icon:'🧭',n:'КАРТА'},
  {id:'bank',   icon:'🏦',n:'БАНК'},
  {id:'camera', icon:'📷',n:'КАМЕРА'},
  {id:'gangs',  icon:'⚔',n:'БАНДИ'},
  {id:'skills', icon:'💪',n:'СКІЛИ'},
  {id:'rep',    icon:'🏆',n:'РЕПА'},
  {id:'mode',   icon:'🎮',n:'РЕЖИМ'},
  {id:'quests', icon:'📋',n:'КВЕСТИ'},
  {id:'bag',    icon:'🎒',n:'РЮКЗАК'},
  {id:'flat',   icon:'🏘',n:'ЖИТЛО'},
  {id:'taxi',   icon:'🚕',n:'ТАКСІ'},
  {id:'car',    icon:'🚗',n:'АВТО'},
  {id:'marsh',  icon:'🚌',n:'№7'},
  {id:'life',   icon:'🍔',n:'ЖИТТЯ'},
  {id:'fun',    icon:'🎡',n:'РОЗВАГИ'},
  {id:'radio',  icon:'📻',n:'РАДІО'},
  {id:'contacts',icon:'👥',n:'ЛЮДИ'},
  {id:'group',  icon:'👑',n:'ГРУПА'},
  {id:'journal',icon:'📖',n:'ЖУРНАЛ'},
  {id:'calendar',icon:'📅',n:'КАЛЕНДАР'},
  {id:'settings',icon:'⚙',n:'НАЛАШТУВАННЯ'},
  {id:'info',   icon:'ℹ',n:'ІНФО'},
];
const APP_TITLE={sms:'✉ СМС',gps:'🗺 GPS — МІСТО',map:'🧭 КАРТА ЧОРНОМОРСЬКА',bank:'🏦 БАНК «ГРІВА»',
  camera:'📷 КАМЕРА',gangs:'⚔ БАНДИ',skills:'💪 СКІЛИ',rep:'🏆 РЕПУТАЦІЯ',mode:'🎮 РЕЖИМ ГРИ',
  quests:'📋 КВЕСТИ',bag:'🎒 РЮКЗАК ГРУПИ',flat:'🏘 ЖИТЛО',taxi:'🚕 ТАКСІ',car:'🚗 МОЄ АВТО',marsh:'🚌 МАРШРУТКА №7',
  life:'🍔 ЖИТТЄЗАБЕЗПЕЧЕННЯ',fun:'🎡 МОРСЬКІ І МІСЬКІ РОЗВАГИ',radio:'📻 РАДІО 103.2 FM',
  contacts:'👥 ЛЮДИ',group:'👑 ГРУПА',journal:'📖 ЖУРНАЛ',
  calendar:'📅 КАЛЕНДАР ЛІТА — 30 ДНІВ',settings:'⚙ НАЛАШТУВАННЯ',info:'ℹ ВСЯ ІНФА ПРО ГРУ'};

/* v9.0: ПАПКИ І ПІДПАПКИ ПО ДІЯХ — компактне меню, що влізает у екран телефона.
   v10.0: БІЛЬШЕ ПЕРЕХОДІВ — папки можуть містити ВЛАСНІ підпапки (subs):
   МІСТО І ЇЗДА → 🚗 ПОЇЗДКИ (таксі, №7) / 🗺 МІСТО (GPS, карта, житло). */
const FOLDERS=[
  {id:'fcity', icon:'🚕',n:'МІСТО І ЇЗДА',  d:'GPS, карта, таксі, №7, житло',
   subs:[{id:'scity_ride',icon:'🚗',n:'ПОЇЗДКИ',d:'своє авто, таксі і маршрутка',apps:['car','taxi','marsh']},
         {id:'scity_map',icon:'🗺',n:'МІСТО',d:'gps, карта, житло',apps:['gps','map','flat']}],
   apps:[]},
  {id:'fchat', icon:'✉',n:'СПІЛКУВАННЯ',   d:'СМС, люди, група', apps:['sms','contacts','group']},
  {id:'fmoney',icon:'💰',n:'ГРОШІ І СПРАВИ',d:'банк, квести, режим, журнал', apps:['bank','quests','mode','journal','calendar']},
  {id:'fhero', icon:'💪',n:'ГЕРОЇ',        d:'скіли, репа, банди, рюкзак, життя', apps:['skills','rep','gangs','bag','life']},
  {id:'ffun',  icon:'🎉',n:'ВІДПОЧИНОК',   d:'розваги, радіо, камера', apps:['fun','radio','camera']},
  {id:'finfo', icon:'ℹ',n:'ІНФО',          d:'все про гру і керування', apps:['settings','info']},
];
PH.folder=null;   /* поточна папка (null = головний екран з папками) */
const folderById=(fid)=>{
  for(const f of FOLDERS){
    if(f.id===fid)return f;
    if(f.subs)for(const s of f.subs)if(s.id===fid)return s;
  }
  return null;
};
const folderOfApp=(appId)=>{
  for(const f of FOLDERS){
    if(f.apps&&f.apps.indexOf(appId)>=0)return f;
    if(f.subs)for(const s of f.subs)if(s.apps.indexOf(appId)>=0)return s;
  }
  return null;
};
/* v10: батьківська папка для вкладеної (для повного шляху в крихтах) */
const parentOf=(fid)=>{
  for(const f of FOLDERS){
    if(f.subs)for(const s of f.subs)if(s.id===fid)return f;
  }
  return null;
};
const APP_HINT={sms:'чати: група, дівчата, Сі і Ні',gps:'прокласти шлях, таксі',map:'велика карта районів',
  bank:'рахунки + журнал розрахунків',camera:'фото міста, скріншоти',gangs:'Портові, Бронкові, ВВ13',
  skills:'6 навичок + артефакти',rep:'репутація міста і героїв',mode:'за всіх / за одного',
  quests:'робота, відпочинок, детектив',bag:'речі п\'ятірки',flat:'оренда і купівля квартир',
  taxi:'виклик таксі ₴2.2/кв',car:'твоє авто: паливо, замок, заправки',marsh:'маршрутка №7, ₴12',life:'їсти, пити, спати, відпочити',
  fun:'море, клуб, гулянки',radio:'103.2 FM — новини і рейви',contacts:'знайомі міста',
  group:'п\'ятірка, лідер, розселення',journal:'що сталося у місті',info:'все про гру, керування, трилогія'};

/* ---------- КОНТАКТИ ---------- */
const CONTACTS={
  team:{name:'П\'ЯТЕРКА (група)',color:'#f0d050'},
  taxi:{name:'ТАКСІ «ЧОРНОМОРЕЦЬ» 680-0',color:'#f0c040'},
  carmkt:{name:'Джим (авторинок «АВТОМОРЕ»)',color:'#c85048'},
  book:{name:'БУКМЕКЕР «КОЕФІЦІЄНТ»',color:'#c8a028'},
  vera:{name:'Віра (ріелтор)',color:'#e05a8a'},
  si:{name:'дядя Сі',color:'#8a5a3a'},
  ni:{name:'тітка Ні',color:'#c85878'},
  yura:{name:'Юра (пошта)',color:'#2255aa'},
  petro:{name:'Петро (порт, вантажі)',color:'#3a5a8a'},
  galagan:{name:'детектив Галаган',color:'#2a2e38'},
  zina:{name:'Зіна (ринок)',color:'#4e9440'},
  oxana:{name:'Оксана (бармен)',color:'#4ee06a'},
  ivero:{name:'діджей Іверо (клуб)',color:'#b040e0'},
  port:{name:'Капітан Гопчик (Портові)',color:'#e04a3a'},
  bronx:{name:'Мурзик (Бронкові)',color:'#b040e0'},
  vv13:{name:'БАНДА «ВВ13»',color:'#8888a0'},
  poly:{name:'ЛІКАР Ольга (поліклініка)',color:'#8ad0e0'},
  prof:{name:'професор Іванюк (бібліотека)',color:'#b040e0'},
  bank:{name:'БАНК «ГРІВА»',color:'#4ee06a'},
};
const REPLY_POOL={
  walk:['Ага!','Чуєш, чесно — як по-нашому!','Ми на районі, лови!','Добре, добре))','Море чекає!','Тримайся!'],
  girl:['Привіт)) Я вільна після 14:00','Куди запрошуєш?','Кафе або пляж — вирішуй','Ха, ти ж легенда!','За мною заїде подруга, можна?'],
  si:['Шашлик готовий, легендарні!','Чайок нагодуй і приходь','Шавуха сама себе не з\'їсть'],
  ni:'Лимонад у льоху, пампушки на тарілці!|Не забудь поїсти!|Крем взяв? СПЕКА!',
  vera:'Є варіанти — дивись у вкладці ЖИТЛО|Квартири з видом на море не стоять!|Тільки сьогодні — торг',
  taxi:'Приймаємо замову! Такси вже їде|Два хвилини і ми на місці|Водій Богдан, білий транспорт',
  yura:'Листи чекають на тобі!|Пакет забери до 18:00',
  petro:'Зміна вантажників з 9:00|Приходь, робота шукає легенд',
  galagan:'В депо є цікава справа...|Місто повне таємниць, п\'ятірка|Дзвони, якщо побачиш щось дивне',
  zina:'Кавуни свіжі!|Сьогодні скумбрія прямо з порту',
  oxana:'Мохито або компот?|Увечері — білий танок!|Пива хочеш? У нас холодне',
  ivero:'П\'ЯТНИЦЯ = РЕЙВ! не пропусти|Діджей Іверо тримає бас|Танцпол розігрітий',
  port:'Квартал на нас. Хочеш у банду — треба авторитет 20+|Данина з крамниць — у вкладці КВЕСТИ|Порт — наша земля',
  bronx:'Бронкс не прощає слабких|Покажи характер — поговоримо|Хто не з нами — той під нами',
  vv13:'Ти у ВВ13 — свої не бʼють|База — Бронкс, підходь|Двір наш, море теж',
  poly:'Чергування — у вкладці КВЕСТИ|Вода, тінь і крем — це теж ліки|Приходь на огляд, ₴150',
  prof:'Вікторина — приходь у читальню|Знання не тонуть|Книжки зникли — детектив у КВЕСТАХ',
  bank:'ГРІВА: рахунки у вкладці БАНК|Оренда списується автоматично 1-го числа|Кредит на квартиру? Ха!',
};
const rep=(id)=>{const p=REPLY_POOL[id]||REPLY_POOL.walk;const arr=Array.isArray(p)?p:String(p).split('|');return arr[IB.ri(0,arr.length-1)];};

/* ініціалізація чатів (v10: чати героїв — з іменем і кольором героя) */
function ensureChat(id){
  if(PH.chats[id])return PH.chats[id];
  const hero=(IB.E&&IB.E.team)?IB.E.team.find(x=>x.id===id):null;
  const c=hero?{name:hero.name,color:hero.def.nameColor||'#c8d8c8'}:(CONTACTS[id]||{name:id,color:'#c8d8c8'});
  PH.chats[id]={msgs:[],name:c.name,color:c.color};
  return PH.chats[id];
}
IB.sms=(id,from,txt)=>{const c=ensureChat(id);c.msgs.push({who:from||c.name,txt,me:false,t:Date.now()});
  if(!(PH.visible&&!PH.min&&PH.app==='sms'&&PH.chat===id)){PH.unread++;}
  IB.toast('✉ '+c.name+': '+txt,'sms');IB.SFX&&IB.SFX.ui&&IB.SFX.ui();
  /* v24.0: СПЛИВАЮЧЕ ВІКНО ПОВІДОМЛЕННЯ — гравець точно бачить, що прийшло
     (toast був маленький і зникав швидко; тепер + велике вікно з ім'ям, текстом
     і тапом-переходом у чат). Не показуємо, коли цей чат уже відкритий. */
  if(!(PH.visible&&!PH.min&&PH.app==='sms'&&PH.chat===id))IB.smsPop(id,c.name,txt);
  if(PH.visible&&!PH.min&&PH.app==='sms')renderApp();updateBadge();};

/* ==================== v24.0: СПЛИВАЮЧІ ВІКНА СМС ====================
   Гравець: «всі повідомлення які надходят роби спливаючими вікнами,
   щоб я знав що щось прийшло». Черга повідомлень, автозакриття 6.5с,
   тап по вікні — відкрити чат, ✖ — закрити. */
IB.smsPopQueue=[];
let popT=null;
IB.smsPop=(id,name,txt)=>{
  if(!document.getElementById('sms-pop'))return;
  IB.smsPopQueue.push({id:id,name:name,txt:txt});
  if(IB.smsPopQueue.length>3)IB.smsPopQueue.shift();
  showSmsPop();
};
function showSmsPop(){
  const el=document.getElementById('sms-pop');
  if(!el)return;
  const it=IB.smsPopQueue[IB.smsPopQueue.length-1];
  if(!it){el.classList.add('hidden');return;}
  el.innerHTML='<div class="sp-av">✉</div><div class="sp-b"><b>'+esc(it.name)+'</b><span>'+esc(it.txt)+'</span><i>тап — відкрити чат</i></div><button class="sp-x" title="Закрити">✖</button>';
  el.classList.remove('hidden');
  el.onclick=(ev)=>{
    if(ev.target&&ev.target.classList&&ev.target.classList.contains('sp-x')){ev.stopPropagation();IB.smsPopQueue.pop();showSmsPop();return;}
    ev.stopPropagation();
    const it2=IB.smsPopQueue.pop();
    if(it2&&IB.openPhoneApp){IB.openPhoneApp('sms');PH.chat=it2.id;PH.unread=0;updateBadge();}
    showSmsPop();
  };
  clearTimeout(popT);
  popT=setTimeout(()=>{IB.smsPopQueue.shift();showSmsPop();},6500);
}
IB.smsMe=(id,txt)=>{const c=ensureChat(id);c.msgs.push({who:'Я',txt,me:true,t:Date.now()});
  if(PH.visible&&!PH.min&&PH.app==='sms')renderApp();};
IB.smsReply=(id,delay)=>{setTimeout(()=>{if(!IB.PHONE)return;IB.sms(id,CONTACTS[id]?CONTACTS[id].name:id,rep(id));},(delay||2)*1000);};
IB.smsHero=(hid,txt)=>{const h=IB.E.team&&IB.E.team.find(x=>x.id===hid);const nm=h?h.name:(CONTACTS[hid]?CONTACTS[hid].name:hid);IB.sms(hid,nm,txt);};
IB.ensureChat=ensureChat;

/* ---------- ШВИДКІ ВІДПОВІДІ (кнопки у чаті) ---------- */
const QUICK={
  team:[
    {t:'Я СКОРО ПОВЕРНУСЬ (соло-режим)',f:()=>IB.soloMode(true)},
    {t:'ЗУСТРІЧ НА ПЛЯЖІ',f:()=>IB.teamMeet(IB.beachPoint())},
    {t:'ЗУСТРІЧ У КЛУБІ «МАЯК»',f:()=>IB.teamMeet({x:322,y:386,name:'клуб «Маяк»'})},
    {t:'ЗУСТРІЧ НА РИНКУ «ЦЕНТРАЛЬНИЙ»',f:()=>IB.teamMeet({x:320,y:153,name:'ринок «Центральний»'})},
    {t:'ВСІ ДОДОМУ (в квартиру)',f:()=>IB.teamHome()},
    {t:'ЯК СПРАВИ?',f:()=>{heroChatStats();}},
  ],
  taxi:[{t:'📋 ВИКЛИК ТАКСІ (додаток ТАКСІ)',f:()=>{IB.openPhoneApp('taxi');}}],
  vera:[{t:'🏘 ПОКАЗАТИ КВАРТИРИ',f:()=>{IB.openPhoneApp('flat');}}],
  si:[{t:'ДЯКУЄМО, СІ!',f:()=>IB.smsReply('si',1.5)}],
  ni:[{t:'ДЯКУЄМО, ТІТКО НІ!',f:()=>IB.smsReply('ni',1.5)}],
};
QUICK.petro=[{t:'ВЗЯТИ ЗМІНУ ВАНТАЖНИКА',f:()=>IB.jobPort()}];
QUICK.yura=[{t:'ВЗЯТИ ЛИСТИ (курʼєрські пакети)',f:()=>IB.jobCourier()}];
/* v18: ФІКС — IB.jobPort/IB.jobCourier викликалися зі СМС, але НІДЕ були
   визначені (TypeError на тапі). Тепер: СМС + маршрут до місця роботи. */
IB.jobPort=()=>{
  const pay=IB.portCareer?IB.portCareer().pay:180;
  IB.sms('petro','Петро','Зміна на тебе чекає у МОРЕВАКЗАЛІ (порт). Дійде — зміна ₴'+pay+'.');
  IB.toast('📦 Зміна в порту: маршрут до МОРЕВАКЗАЛУ прокладено','gold');
  IB.goWalk&&IB.goWalk({x:353,y:399,name:'МОРЕВАКЗАЛ — зміна'});
};
IB.jobCourier=()=>{
  IB.sms('yura','Юра','Листи чекають на УКРПОШТІ — центр міста. Доставка ₴25 за лист.');
  IB.toast('✉ Листи: маршрут до УКРПОШТИ прокладено','gold');
  IB.goWalk&&IB.goWalk({x:200,y:47,name:'УКРПОШТА — листи'});
};
QUICK.galagan=[{t:'ЩО ЗА СПРАВА?',f:()=>IB.smsReply('galagan',1.5)}];
QUICK.ivero=[{t:'КОЛИ РЕЙВ?',f:()=>IB.sms('ivero','діджей Іверо','У П\'ЯТНИЦІ о 22:00! ₴150. Радіо 103.2 підтвердить.')}];
QUICK.port=[{t:'⚔ ХОЧУ У «ПОРТОВІ» (репутація 20+)',f:()=>{IB.gangJoin&&IB.gangJoin(IB.E.team[0].id,'port');renderApp();}},
  {t:'📋 РОБОТА ДЛЯ БАНДИ',f:()=>{IB.openPhoneApp('quests');}}];
QUICK.bronx=[{t:'⚔ ХОЧУ У «БРОНКОВІ» (репутація 20+)',f:()=>{IB.gangJoin&&IB.gangJoin(IB.E.team[0].id,'bronx');renderApp();}},
  {t:'📋 РОБОТА ДЛЯ БАНДИ',f:()=>{IB.openPhoneApp('quests');}}];
QUICK.vv13=[{t:'⚔ ЗАСНУВАТИ ВВ13',f:()=>{IB.vv13Found&&IB.vv13Found();renderApp();}},
  {t:'💪 ХТО В БАНДІ (додаток БАНДИ)',f:()=>{IB.openPhoneApp('gangs');}}];
function heroChatStats(){
  const h=IB.E.team.find(x=>x.id===PH.chat);
  if(!h){IB.smsReply(PH.chat,1.5);return;}
  IB.sms(PH.chat,h.name,h.name+': сили '+IB.M.round(h.hp)+'%, їжа '+IB.M.round(h.food)+'%, вода '+IB.M.round(h.water)+'%, настрій '+IB.M.round(h.mood)+'. Кишеня: ₴'+(h.pocket||0));
}

/* ---------- КИШЕНІ ГРОШІ + ПЕРЕКАЗИ ---------- */
IB.initPockets=()=>{for(const h of IB.E.team){if(h.pocket===undefined)h.pocket=20000;}};
IB.payShared=(n)=>{if(IB.G.money>=n){IB.G.money-=n;return true;}return false;};
IB.payPocket=(hid,n)=>{const h=IB.E.team.find(x=>x.id===hid);if(h&&h.pocket>=n){h.pocket-=n;return true;}
  /* соло-лідер платить із спільних, якщо кишені мало */
  if(IB.payShared(n))return true;return false;};
IB.transfer=(hid)=>{const h=IB.E.team.find(x=>x.id===hid);if(!h)return;
  if(h.pocket>0){IB.G.money+=h.pocket;IB.toast(h.name+' скинув у спільне: ₴'+h.pocket,'gold');h.pocket=0;}
  else IB.toast('У '+h.name+' кишеня пуста','red');};

/* ==================== v24.0: РЕЄСТР АДРЕС (БАЗА + БУВ) ====================
   Гравець: «якщо був — комунікував, або зняв — появляється в меню всі адреси,
   привязка до таксі, щоб я знав всі адреси де як і міг туди на таксі доїхати».
   IB.visitPlace — додає адресу до реєстру (викликається: вхід у будь-який
   будинок, оренда/купівля квартири, свідання). Адреси зʼявляються у ТАКСІ,
   GPS і на карті. */
IB.visitPlace=(name,x,y)=>{
  if(!name||!(x>0))return;
  IB.G.visited=IB.G.visited||[];
  const nm=String(name).toUpperCase().slice(0,44);
  const f=IB.G.visited.find(v=>v.name===nm);
  if(f){f.x=x;f.y=y;f.day=IB.G.day;return;}
  IB.G.visited.push({name:nm,x:x,y:y,day:IB.G.day});
  if(IB.G.visited.length>24)IB.G.visited.shift();
};
/* АКТИВНА БАЗА П'ЯТІРКИ: квартира (нова система) або будинок ріелтора (стара) */
IB.baseHome=()=>{
  const hm=(IB.G.homes||[]).find(h=>h.b&&h.door);
  if(hm)return {addr:hm.addr,door:hm.door,b:hm.b,mode:hm.mode,expDay:hm.expDay,rec:hm,
    rent:hm.rent||(hm.b.apt&&hm.b.apt.rent)||0};
  if(IB.G.home){const b=(IB.W.buildings||[]).find(bb=>bb.type===IB.G.home.id);
    if(b)return {addr:IB.G.home.label||'наш дім',door:b.door,b:b,mode:'rent',expDay:IB.G.home.expDay,rec:null,legacy:true,
      rent:IB.G.home.rent||0};}
  return null;
};
/* ---------- ПУНКТИ ПРИЗНАЧЕННЯ (таксі / зустрічі) ---------- */
IB.PHONE_DESTS=()=>{
  const L=[
    {id:'d_beach',name:'ПЛЯЖ ЦЕНТРАЛЬНИЙ',x:160,y:452},
    {id:'d_club',name:'КЛУБ «МАЯК»',x:322,y:386},
    {id:'d_mir',name:'ПРОСП. МИРУ (Центр)',x:220,y:160},
    {id:'d_museum',name:'МУЗЕЙ ім. БІЛОГО',x:252,y:153},
    {id:'d_cine',name:'КІНО «МОРЕ-ФІЛЬМ»',x:233,y:157},
    {id:'d_market',name:'РИНОК «ЦЕНТРАЛЬНИЙ»',x:320,y:153},
    {id:'d_north',name:'РИНОК «ПІВНІЧНИЙ»',x:98,y:62},
    {id:'d_vokzal',name:'ВОКЗАЛ',x:58,y:36},
    {id:'d_bus',name:'АВТОСТАНЦІЯ',x:210,y:26},
    {id:'d_port',name:'ПОРТ / МОРЕВАКЗАЛ',x:356,y:399},
    {id:'d_luna',name:'ЛУНА-ПАРК',x:136,y:164},
    {id:'d_yacht',name:'ЯХТ-КЛУБ «ВІТЕР»',x:20,y:402},
    {id:'d_lim',name:'МІСТ — СУХИЙ ЛИМАН',x:390,y:293},
    {id:'d_gym',name:'КАЧАЛКА «АТЛЕТ»',x:80,y:237},
    {id:'d_bronx',name:'БРОНКС',x:262,y:384},
    {id:'d_stairs',name:'ПЛОЩА + СХОДИ',x:214,y:410},
    {id:'d_lighthouse',name:'МАЯК (мол)',x:418,y:470},
    {id:'d_gryb',name:'ГРИБІВКА',x:24,y:350},
    {id:'d_sovin',name:'СОВІНЬЙОН',x:268,y:22},
    {id:'d_baraboy',name:'СЕРФ-ШКОЛА «ХВИЛЯ»',x:308,y:412},
    {id:'d_bank',name:'БАНК «ГРІВА»',x:226,y:139},
    {id:'d_vv13',name:'БАЗА «ВВ13» (Бронкс)',x:273,y:378},
    /* v22: гравець «офіс ріелтора не можу знайти — залиш адресу в телефоні
       таксі» — РІЕЛТОР тепер пункт таксі/GPS/карти */
    {id:'d_realtor',name:'РІЕЛТОР «БІЛЯ МОРЕ» — просп. Миру (центр)',x:91,y:153},
    {id:'d_poly',name:'ПОЛІКЛІНІКА №1',x:289,y:51},
    {id:'d_library',name:'МІСЬКА БІБЛІОТЕКА',x:368,y:137},
    /* v28.0 «МОЄ АВТО»: авторинок, тюнінг, заправки — таксі і GPS знають адреси */
    {id:'d_carmkt',name:'АВТОРИНОК «АВТОМОРЕ» — КУПИТИ АВТО',x:225,y:266},
    {id:'d_tuning',name:'ТЮНІНГ-ГАРАЖ «КЕРМ» — КОЛІР АВТО',x:206,y:265},
    {id:'d_azs_n',name:'⛽ ЗАПРАВКА «ПАЛЛАДА-НАФТА» ПІВНІЧ',x:127,y:38},
    {id:'d_azs_c',name:'⛽ ЗАПРАВКА «ПАЛЛАДА-НАФТА» ЦЕНТР',x:84,y:128},
    {id:'d_azs_s',name:'⛽ ЗАПРАВКА «МАЗИТ» ПІВДЕНЬ',x:164,y:351},
    {id:'d_azs_p',name:'⛽ ЗАПРАВКА «ПОРТ-СЕРВІС»',x:303,y:393},
  ];
  /* v28.0: власне авто — динамічний пункт GPS/таксі (де залишили) */
  const CS=IB.CAR_OWN;
  if(CS&&CS.owned&&CS.car)L.push({id:'d_mycar',name:'🚗 МОЄ АВТО — '+CS.plate+(CS.locked?' (🔒 зачинене)':' (відчинене)'),x:CS.car.x,y:CS.car.y,mycar:true});
  /* власні квартири теж пункти */
  for(const h of (IB.G.homes||[])){
    L.push({id:'d_flat_'+h.id,name:(h===((IB.baseHome()||{}).rec)?'🏠 БАЗА: ':'КВАРТИРА: ')+h.addr,x:h.door.x,y:h.door.y,flat:true,base:h===((IB.baseHome()||{}).rec)});
  }
  /* v24.0: старий дім від ріелтора (без apt) теж пункт */
  const bb=IB.baseHome();
  if(bb&&bb.legacy)L.push({id:'d_base_old',name:'🏠 БАЗА: '+bb.addr,x:bb.door.x,y:bb.door.y,base:true});
  /* v24.0: відвідані адреси — «був / комунікував / зняв» → адреса у меню
     (дублікати по координатах і назві пропускаємо — база/квартири вже є) */
  const statNames={};for(const d of L)statNames[d.name.toUpperCase()]=1;
  const vis=(IB.G.visited||[]).slice(-10).reverse();
  for(const v of vis){
    const nm='📍 '+v.name;
    if(statNames[v.name]||statNames[nm])continue;
    if(L.some(d=>IB.dist(d.x,d.y,v.x,v.y)<3))continue;
    L.push({id:'d_v'+(L.length),name:nm,x:v.x,y:v.y,visited:true});
  }
  return L;
};
IB.beachPoint=()=>({x:160+IB.rnd(-60,60),y:452+IB.rnd(-8,14),name:'пляж'});

/* ---------- АВТО-ХОДЬБА (BFS-поля) ---------- */
IB._pfCache=new Map();
IB.pathField=(tx,ty)=>{
  const W=IB.W,key=(tx|0)+','+(ty|0);
  if(IB._pfCache.has(key))return IB._pfCache.get(key);
  const F=new Int32Array(W.W*W.H).fill(-1);
  const seed=IB.snapToReach(tx,ty);
  const si=(seed.y|0)*W.W+(seed.x|0);
  if(!IB.walkable(seed.x,seed.y))return F;
  const q=new Int32Array(W.W*W.H);let qh=0,qt=0;
  F[si]=0;q[qt++]=si;
  while(qh<qt){
    const i=q[qh++],x=i%W.W,y=(i/W.W)|0;
    for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){
      if(!dx&&!dy)continue;
      const ax=x+dx,ay=y+dy;
      if(ax<1||ay<1||ax>=W.W-1||ay>=W.H-1)continue;
      const j=ay*W.W+ax;
      if(F[j]>=0)continue;
      if(!IB.walkable(ax,ay))continue;
      if(IB.M.abs(IB.W.elevAt(ax,ay)-IB.W.elevAt(x,y))>1.01)continue;
      F[j]=F[i]+1;q[qt++]=j;
    }
  }
  if(IB._pfCache.size>6)IB._pfCache.clear();
  IB._pfCache.set(key,F);
  return F;
};
/* крок по полю: повертає true коли дійшли */
IB.walkField=(h,field,dt,speed)=>{
  const x=h.x|0,y=h.y|0,here=field[y*IB.W.W+x];
  if(here<0){/* не на полі — снап і повтор */
    const s=IB.snapToReach(h.x,h.y);h.x=s.x;h.y=s.y;return false;
  }
  if(here<=1)return true;
  let best=-1,bv=here;
  for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){
    if(!dx&&!dy)continue;
    const ax=x+dx,ay=y+dy;
    if(ax<1||ay<1||ax>=IB.W.W-1||ay>=IB.W.H-1)continue;
    const fv=field[ay*IB.W.W+ax];
    if(fv>=0&&fv<bv){bv=fv;best=ay*IB.W.W+ax;}
  }
  if(best>=0){
    const nx=best%IB.W.W,ny=(best/IB.W.W)|0;
    const prevx=h.x,prevy=h.y;
    h.tx=nx+0.5;h.ty=ny+0.5;
    const done=IB.E.stepTo?IB.E.stepTo(h,dt,speed):false;
    if(!done&&(h.x===prevx&&h.y===prevy)){/* застряг — мікро-стрибок */
      h.x=nx+0.5;h.y=ny+0.5;
    }
    return false;
  }
  return false;
};

/* ---------- ТАКСІ ---------- */
IB.TAXI={car:null,state:'idle',dest:null,cost:0,waitT:0,all:false,riders:[],wp:[],wpI:0};
/* ---------- v14: ТАКСІ ЇДЕ ЛИШЕ ДОРОГАМИ ----------
   Сітка вулиць (перехрестя H_STREETS×V_STREETS) → найближчі вузли →
   L-маршрут (спочатку по вулиці, потім по лінії) — жодного руху
   «наскрізь будинків» і жодного перпендикулярного зрізу. */
IB.taxiNodes=()=>{
  const HS=IB.W.H_STREETS||[], VS=IB.W.V_STREETS||[], nodes=[];
  for(const sx of VS)for(const sy of HS)nodes.push({x:sx+1.2,y:sy+1.2});
  return nodes;
};
IB.taxiNodeNear=(x,y,minD)=>{
  let best=null,bd=1e9;
  for(const n of IB.taxiNodes()){
    const d=IB.dist(x,y,n.x,n.y);
    if(minD!=null&&d<minD)continue;
    if(d<bd){bd=d;best=n;}
  }
  return best;
};
/* v18.7: ПІД'ЇЗД ТІЛЬКИ ВУЛИЦЯМИ — гравець: «авто прив'яжи до сітки доріг».
   Фінальний відрізок дозволяється ЛИШЕ коли ціль стоїть на вуличному
   коридорі: тоді таксі доїжджає по осі вулиці до проєкції цілі. Якщо ціль
   у дворі/на тротуарі/пляжі — таксі зупиняється на перехресті, герой
   підходить пішки (жодних зрізів через будинки). */
IB.onStreet=(x,y)=>{
  const HS=IB.W.H_STREETS||[],VS=IB.W.V_STREETS||[];
  for(const sy of HS)if(IB.M.abs(y-(sy+1.2))<1.45)return {ax:'h',v:sy+1.2};
  for(const sx of VS)if(IB.M.abs(x-(sx+1.2))<1.45)return {ax:'v',v:sx+1.2};
  return null;
};
IB.taxiPath=(from,to,final)=>{
  /* L-маршрут по сітці: спочатку по рядку вулиці, потім по колонці лінії */
  const wp=[{x:to.x,y:from.y},{x:to.x,y:to.y}];
  if(final&&IB.dist(to.x,to.y,final.x,final.y)<=5){
    const st=IB.onStreet(final.x,final.y);
    if(st){
      /* ціль на вулиці — доїжджаємо по осі вулиці до проєкції */
      wp.push(st.ax==='h'?{x:final.x,y:st.v}:{x:st.v,y:final.y});
    }
    /* інакше — зупинка на перехресті (wp без прямого зрізу) */
  }
  return wp;
};
IB.taxiCall=(dest)=>{
  if(IB.TAXI.car&&IB.TAXI.state!=='idle'){IB.toast('Таксі вже в дорозі!','red');return;}
  const L=IB.E.team[0];if(!L)return;
  const dist=IB.dist(L.x,L.y,dest.x,dest.y);
  const cost=IB.M.max(60,IB.M.round(dist*2.2));
  IB.TAXI.dest=dest;IB.TAXI.cost=cost;
  /* v14: виїжджає від найближчого ПЕРЕХРЕСТЯ (≥6 кварталів від тебе) і їде
     вулицями (L-маршрут) до перехрестя біля тебе */
  const nearNode=IB.taxiNodeNear(L.x,L.y,null);
  const spawn=IB.taxiNodeNear(L.x,L.y,6)||nearNode;
  const path=IB.taxiPath(spawn,nearNode,{x:L.x,y:L.y});
  /* v11: ТАКСІ — жовтий Lanos з ШАШКАМИ; шашки і шапку малює drawCar по c.taxiCall */
  const c={type:'car',model:'lanos',x:spawn.x,y:spawn.y+1.2,dir:path[0].x<spawn.x?'l':'r',v:0,a:0,b:0,c:'#f0c040',honkT:0,taxiCall:true};
  IB.E.cars.push(c);IB.TAXI.car=c;IB.TAXI.state='toPlayer';IB.TAXI.waitT=0;
  IB.TAXI.wp=path;IB.TAXI.wpI=0;
  IB.toast('🚕 Таксі виїхало вулицями. Ціна ≈ ₴'+cost+' ('+dest.name+')','gold');
  IB.sms('taxi','ТАКСІ «ЧОРНОМОРЕЦЬ»','Замовлення прийнято: '+dest.name+'. Очікуйте, водій Богдан.');
};
IB.taxiDrive=(c,wp,dt,speed)=>{
  /* рух по waypoint-ах: строго по осях (вулицями), з поворотом на куті */
  if(!wp||IB.TAXI.wpI>=wp.length)return true;
  const t=wp[IB.TAXI.wpI];
  const dx=t.x-c.x,dy=t.y-c.y,d=IB.M.abs(dx)+IB.M.abs(dy);
  if(d<0.18){IB.TAXI.wpI++;return IB.TAXI.wpI>=wp.length;}
  const st=IB.M.min(d,speed*dt);
  if(IB.M.abs(dx)>0.1){c.x+=IB.M.sign(dx)*st;c.dir=dx>0?'r':'l';}
  else{c.y+=IB.M.sign(dy)*st;c.dir=dy>0?'d':'u';}
  c.frT=(c.frT||0)+dt*8;c.fr=1+((c.frT|0)%2);
  return false;
};
IB.taxiRiders=(all)=>{
  /* хто сідає: «всі» — вся присутня п'ятірка (без тих, хто на побаченні/гуляє);
     «один» — тільки лідер */
  const L=IB.E.team[0];
  if(!all)return [L];
  return IB.E.team.filter(h=>h.task!=='date'&&h.task!=='gone');
};
IB.updateTaxi=(dt)=>{
  const T=IB.TAXI,L=IB.E.team[0];if(!T.car||!L)return;
  const c=T.car;
  if(T.state==='toPlayer'){
    const done=IB.taxiDrive(c,T.wp,dt,3.4);
    for(const h of T.riders||[]){h.x=c.x;h.y=c.y+0.6;h.dir=c.dir;}
    if(done){T.state='wait';T.waitT=30;T.riders=[];for(const h of IB.E.team)h._inCar=false;
      IB.toast('🚕 Таксі на місці (на році) — натисни E біля машини','gold');
      IB.sms('taxi','ТАКСІ «ЧОРНОМОРЕЦЬ»','Водій на місці! Кінець: '+T.dest.name);}
  }else if(T.state==='wait'){
    T.waitT-=dt;
    if(IB.dist(c.x,c.y,L.x,L.y)>6){T.waitT-=dt*2;}
    if(T.waitT<=0){T.state='idle';const i=IB.E.cars.indexOf(c);if(i>=0)IB.E.cars.splice(i,1);T.car=null;
      IB.sms('taxi','ТАКСІ «ЧОРНОМОРЕЦЬ»','Водій не дочекався і поїхав. Замова скасована.');}
  }else if(T.state==='riding'){
    /* v14: поїздка вулицями до пункту */
    if(!T.wp2){
      const from=IB.taxiNodeNear(c.x,c.y,null);
      const to=IB.taxiNodeNear(T.dest.x,T.dest.y,null);
      T.wp2=IB.taxiPath(from,to,{x:T.dest.x,y:T.dest.y});T.wpI=0;
    }
    const done=IB.taxiDrive(c,T.wp2,dt,3.8);
    /* v23: пасажири В САЛОНІ — героїв не видно біля авто («всі сіли — авто поїхало») */
    for(const h of T.riders||[]){h.x=c.x;h.y=c.y+0.6;h.dir=c.dir;h._inCar=true;}
    if(done){
      /* висадка: всі, хто їхав — біля машини/пункту */
      const s=IB.snapToReach(T.dest.x,T.dest.y);
      const riders=T.riders&&T.riders.length?T.riders:[L];
      riders.forEach((h,i)=>{h.x=s.x+(i-riders.length/2)*0.6;h.y=s.y+0.8+i*0.25;h.fr=0;h._inCar=false;});
      const price=T.cost;
      /* v23-фікс: раніше payShared/payPocket викликались ДВІЧІ (у тернарнику
         для напису і ще раз у if) — поїздка «всі» списувала плату подвійно */
      const payer=T.all?'спільна каса':(IB.payPocket(L.id,price)?'кишеня '+L.name:'спільна каса');
      if(T.all){if(!IB.payShared(price))IB.G.money=IB.M.max(0,IB.G.money-price);}
      else{if(!IB.payPocket(L.id,price))IB.G.money=IB.M.max(0,IB.G.money-price);}
      IB.TAXI.state='idle';T.wp2=null;T.riders=[];
      const i=IB.E.cars.indexOf(c);if(i>=0)IB.E.cars.splice(i,1);T.car=null;
      IB.toast('🚕 Ви на місці: '+T.dest.name+' (−₴'+price+', '+payer+')','gold');
      IB.sms('taxi','ТАКСІ «ЧОРНОМОРЕЦЬ»','Дякуємо за поїздку! Оцініть водія: 5 ★');
      IB.journalAdd&&IB.journalAdd('🚕','Таксі до '+T.dest.name+' — ₴'+price);
    }
  }
};
/* E біля викликаного таксі — ВИБІР: СІДАЮТЬ ВСІ АБО ОДИН (v14) */
IB.taxiBoard=()=>{
  const T=IB.TAXI,L=IB.E.team[0];
  if(T.state!=='wait'||!T.car)return false;
  if(IB.dist(T.car.x,T.car.y,L.x,L.y)>3.2)return false;
  const others=IB.E.team.filter(h=>h!==L&&h.task!=='date'&&h.task!=='gone');
  const go=(all)=>{
    T.all=all;T.riders=IB.taxiRiders(all);T.wp2=null;
    T.state='riding';
    IB.toast(all?'🚕 Вся команда у салоні! Поїхали → '+T.dest.name:'🚕 Поїхали один → '+T.dest.name,'gold');
    IB.sms('team','ТАКСІ',all?'Вся присутня команда сіла у таксі → '+T.dest.name:L.name+' поїхав таксі → '+T.dest.name+'. Ми гуляємо далі!');
    IB.SFX.ui&&IB.SFX.ui();
  };
  /* модальне вікно вибору (#ph-dlg — як у свіданнях) */
  const el=document.getElementById('ph-dlg');
  if(!el){go(false);return true;}
  el.classList.remove('hidden');
  el.innerHTML='<div class="pd-q">🚕 ВОДІЙ БОГДАН: «Поїздка до «'+T.dest.name+'» — ≈₴'+T.cost+
    '. Хто сідає у салон?»</div><div class="pd-a">'+
    '<button class="phq" data-tx="all">👥 ВСІ СІДАЮТЬ ('+(1+others.length)+' у салоні)</button>'+
    '<button class="phq" data-tx="one">🚶 ЛИШЕ Я (один)</button></div>';
  el.querySelectorAll('[data-tx]').forEach(b=>{b.onclick=()=>{el.classList.add('hidden');go(b.dataset.tx==='all');};});
  return true;
};

/* ---------- МАРШРУТКА №7 ---------- */
IB.MARSH={car:null,state:'idle',seg:0,t:0,atStop:-1,stopT:0,rider:null,rideTo:-1};
(function(){
  /* петля: пр. Миру (y118.6) → 12-та Лінія (x200.6) → вул. Курортна (y300.6) → 1-ша Лінія (x8.6) */
  const corners=[[8.6,118.6],[200.6,118.6],[200.6,120.6],[8.6,120.6],
    [8.6,300.6],[200.6,300.6],[200.6,302.6],[8.6,302.6]];
  IB.MARSH.corners=corners;
  IB.MARSH.routeStops=[];
  const inSeg=(x,y)=>x>=4&&x<=206&&y>=112&&y<=308;
const onLoop=(x,y)=>inSeg(x,y)&&(
  (Math.abs(y-118.6)<4.2||Math.abs(y-120.6)<4.2||Math.abs(y-300.6)<4.2||Math.abs(y-302.6)<4.2)||
  (Math.abs(x-8.6)<4.2||Math.abs(x-200.6)<4.2));
  IB.MARSH.buildStops=()=>{
    IB.MARSH.routeStops=(IB.W.BSTOPS||[]).filter(s=>onLoop(s.x+0.5,s.y+0.5))
      .map(s=>({x:s.x+0.5,y:s.y+0.5,name:s.name}));
  };
})();
IB.spawnMarsh=()=>{
  IB.MARSH.car={type:'car',model:'van',x:8.6,y:118.6,dir:'r',v:0,a:0,b:0,c:'#e8e8e2',marsh:true,honkT:0};
  IB.E.cars.push(IB.MARSH.car);
  IB.MARSH.state='run';IB.MARSH.seg=0;IB.MARSH.t=0;IB.MARSH.atStop=-1;IB.MARSH.rider=null;
  IB.MARSH.buildStops();
};
IB.marshNearestStop=()=>{
  const L=IB.E.team[0];if(!L||!IB.MARSH.routeStops.length)return null;
  let best=null,bd=1e9;
  for(const s of IB.MARSH.routeStops){const d=IB.dist(L.x,L.y,s.x,s.y);if(d<bd){bd=d;best=s;}}
  return best?Object.assign({d:bd},best):null;
};
IB.marshRide=(stop)=>{
  const L=IB.E.team[0];if(!L)return;
  if(!IB.MARSH.car)IB.spawnMarsh();
  IB.MARSH.rider={hero:L,to:stop,state:'walk'};
  IB.toast('🚌 Йдеш до зупинки «'+stop.name+'»...','gold');
  IB.sms('team','МАРШРУТКА №7','Їдемо з '+IB.marshNearestStop().name+' → '+stop.name+'. ₴12/пасажир.');
};
IB.updateMarsh=(dt)=>{
  const M=IB.MARSH,L=IB.E.team[0];if(!M.car)return;
  const c=M.car;
  if(M.state==='run'){
    /* рух петлею */
    if(M.atStop>=0){
      M.stopT-=dt;
      if(M.stopT<=0){M.atStop=-1;}   /* cool лишається — поки не проїдемо кут */
    }else{
      const a=M.corners[M.seg],b=M.corners[(M.seg+1)%M.corners.length];
      const d=IB.dist(c.x,c.y,b[0],b[1]);
      if(d<0.6){
        M.seg=(M.seg+1)%M.corners.length;
        M.stopCool=null;   /* кут пройдено — зупинки наступного кола знову активні */
        /* зупинка на куті */
        const st=M.routeStops.find(s=>IB.dist(s.x,s.y,c.x,c.y)<2.6);
        if(st){M.atStop=0;M.stopT=4;}
      }else{
        const st=2.2*dt/d;
        c.x+=(b[0]-c.x)*IB.M.min(1,st);c.y+=(b[1]-c.y)*IB.M.min(1,st);
        c.dir=(b[0]-c.x)>0.2?'r':((b[0]-c.x)<-0.2?'l':((b[1]-c.y)>0?'d':'u'));
        c.frT=(c.frT||0)+dt*8;c.fr=1+((c.frT|0)%2);
        /* зупинки посеред сторін — ПРИЛИПАЄМО до зупинки по колії */
        const st2=M.routeStops.find(s=>IB.dist(s.x,s.y,c.x,c.y)<2.6);
        if(st2&&M.stopCool!==st2){
          M.stopCool=st2;M.atStop=0;M.stopT=4;
          if(a[1]===b[1])c.x=st2.x;else c.y=st2.y;   /* горизонталь/вертикаль */
        }
      }
    }
    /* пасажир-герой */
    if(M.rider&&M.rider.state==='riding'){
      L.x=c.x;L.y=c.y+0.7;L.dir=c.dir;
      if(M.atStop>=0&&M.rideTo>=0){
        const target=M.routeStops[M.rideTo];
        if(target&&IB.dist(c.x,c.y,target.x,target.y)<2.5){
          /* виходи */
          const s=IB.snapToReach(target.x,target.y+2);
          L.x=s.x;L.y=s.y;
          if(IB.G.money>=12)IB.G.money-=12;
          M.rider=null;M.rideTo=-1;
          IB.toast('🚌 Ви на зупинці «'+target.name+'» (−₴12)','gold');
          IB.journalAdd&&IB.journalAdd('🚌','Маршрутка №7 → '+target.name);
        }
      }
    }
  }
};
/* викликається з телефона: сісти на маршрутку до зупинки */
IB.marshGo=(stop)=>{
  const L=IB.E.team[0];if(!L)return;
  IB.MARSH.rideTo=IB.MARSH.routeStops.indexOf(stop);
  IB.marshRide(stop);
};
IB.updateMarshRider=(dt)=>{
  const M=IB.MARSH,L=IB.E.team[0];if(!M.rider||!L)return;
  const r=M.rider;
  if(r.state==='walk'){
    if(!r.field){const ns=IB.marshNearestStop();if(!ns)return;r.field=IB.pathField(ns.x,ns.y);r.stop=ns;}
    if(!r.stop){const ns=IB.marshNearestStop();if(!ns)return;r.stop=ns;}
    const done=IB.walkField(L,r.field,dt,3.2);
    if(done){
      /* чекаємо маршрутку на зупинці */
      if(M.car&&IB.dist(M.car.x,M.car.y,r.stop.x,r.stop.y)<2.5&&M.atStop>=0){
        r.state='riding';IB.toast('🚌 Сів у маршрутку №7','gold');
      }
    }
  }
};

/* ---------- ГРУПА: ЗУСТРІЧІ / СОЛО / ПЛЯЖ ---------- */
IB.teamMeet=(pt)=>{
  const L=IB.E.team[0];if(!L)return;
  let n=0;
  for(const h of IB.E.team){
    if(h===L)continue;
    h.task='meet';h.meetPt={x:pt.x,y:pt.y,name:pt.name||'місце'};
    h.field=IB.pathField(pt.x,pt.y);
    n++;
    IB.sms(h.id,h.name,'Прийняв! Йду на «'+(pt.name||'місце')+'». Трохи маршруткою качну)');
  }
  IB.toast('✉ Група йде на «'+(pt.name||'місце')+'» ('+n+' героїв)','gold');
};
IB.teamHome=()=>{
  const L=IB.E.team[0];if(!L)return;
  const home=(IB.G.homes&&IB.G.homes[0])?IB.G.homes[0]:null;
  if(!home){IB.toast('Квартири ще немає — зніми через ЖИТЛО у телефоні','red');return;}
  let n=0;
  for(const h of IB.E.team){
    if(h===L)continue;
    h.task='meet';h.meetPt={x:home.door.x,y:home.door.y,name:home.addr};
    h.field=IB.pathField(home.door.x,home.door.y);n++;
  }
  IB.toast('✉ Група їде додому: '+home.addr,'gold');
};
IB.soloMode=(on)=>{
  const L=IB.E.team[0];
  if(on){
    for(const h of IB.E.team){
      if(h===L)continue;
      h.task='beach';
      const bp=IB.beachPoint();
      h.field=IB.pathField(bp.x,bp.y);
      h.beachPt=bp;h.sayT=0;
      IB.sms(h.id,h.name,'Ок, відпочиваємо на пляжі! Ти сам — квест, побачення, таксі. Пиши «ПОВЕРТАЙСЯ».');
    }
    IB.toast('🌞 СОЛО-РЕЖИМ: інші поїхали на пляж. Дія!','gold');
    IB.sms('team','П\'ЯТЕРКА','Легенда пішов у справи. Ми на пляжі — смс-имось!');
  }else{
    for(const h of IB.E.team){if(h!==L){h.task='follow';h.field=null;}}
    IB.toast('👥 Група знову разом','gold');
  }
};
IB.updateHeroTasks=(dt)=>{
  const L=IB.E.team[0];if(!L)return;
  for(const h of IB.E.team){
    if(h===L)continue;
    if(h.task==='meet'&&h.field){
      const pt=h.meetPt;
      const done=IB.walkField(h,h.field,dt,3.0);
      if(done||IB.dist(h.x,h.y,pt.x,pt.y)<2.4){
        h.field=null;
        if(IB.dist(h.x,h.y,pt.x,pt.y)>2.4){const s=IB.snapToReach(pt.x,pt.y);h.x=s.x;h.y=s.y;}
        h.task='wait';h.sayT=IB.rnd(3,6);
        IB.sms(h.id,h.name,'Я на «'+(pt.name||'місці')+'». Чекаю!');
      }
    }else if(h.task==='wait'){
      h.wt-=dt;
      if(h.wt===undefined||h.wt<=0){h.wt=IB.rnd(2,5);
        /* невелике місцеве блукання навколо точки */
        const pt=h.meetPt||{x:h.x,y:h.y};
        const a=IB.rnd(0,6.28),r2=IB.rnd(0.5,1.8);
        const nx=pt.x+IB.M.cos(a)*r2,ny=pt.y+IB.M.sin(a)*r2;
        if(IB.walkable(nx,ny)){h.tx=nx;h.ty=ny;}}
      if(h.sayT>0)h.sayT-=dt;
    }else if(h.task==='beach'){
      if(h.field){
        const done=IB.walkField(h,h.field,dt,3.0);
        if(done){h.field=null;h.sayT=IB.rnd(4,9);}
      }else{
        /* відпочинок на пляжі: блукання по піску + репліки */
        h.sayT-=dt;
        if(h.sayT<=0){
          h.sayT=IB.rnd(5,12);
          const bp=h.beachPt||IB.beachPoint();
          const a=IB.rnd(0,6.28),r2=IB.rnd(1,4);
          const nx=IB.clamp(bp.x+IB.M.cos(a)*r2,10,320),ny=IB.clamp(bp.y+IB.M.sin(a)*r2,IB.W.BEACH_Y0+2,IB.W.BEACH_Y1-4);
          if(IB.walkable(nx,ny)){h.tx=nx;h.ty=ny;}
          if(IB.M.random()<0.4){
            const lines=['Сонце — сила!','Хто за пивом?','Вода клас!','Засмагаю до 50','Футбол?','Дивись, дельфін!'];
            h.bubble={txt:lines[IB.ri(0,lines.length-1)],t:0,life:3};
            if(h.sayT&&IB.M.random()<0.25)IB.sms(h.id,h.name,lines[IB.ri(0,lines.length-1)]);
          }
        }
      }
    }
    /* рух не через поле — звичайний крок до tx/ty */
    if((h.task==='wait'||h.task==='beach')&&h.tx!==undefined&&(h.tx!==h.x||h.ty!==h.y)){
      const mv=IB.E.stepTo?IB.E.stepTo(h,dt,2.2):false;
    }
  }
};

/* ---------- СМС-ПОДІЇ (дівчата, Сі/Ні, запрошення) ---------- */
IB.updatePhoneEvents=(dt)=>{
  PH.invT=(PH.invT===undefined?240:PH.invT)-dt;
  if(PH.invT<=0){
    PH.invT=IB.rnd(220,420);
    const r=IB.M.random();
    if(r<0.34){
      /* дівчина запрошує на свідання */
      const girls=['Галя з клуба','Ірина','Марта','Аліна','Таня','Света','Діана','Настя','Юля','Ріта'];
      const g=girls[IB.ri(0,9)];
      IB.sms('girl_'+g,g,'Привіт)) Вільний сьогодні? Можем зустрітись — кафе «Хвиля» або пляж. СВІДАННЯ;)');
    }else if(r<0.55){
      IB.sms('si','дядя Сі',IB.M.random()<0.5?'Я з Ні на набережній. Хто за шашликом?':'Рейв у п\'ятницю? Я тоді на дачу, море мені вистачає');
    }else if(r<0.72){
      IB.sms('ni','тітка Ні','Пампушки свіжі! Заходьте на лимонад, поки не випили сусіди');
    }else if(r<0.86){
      IB.sms('petro','Петро (порт)','Зміна вантажників завтра з 9:00. ₴180+бонус. Пиши — запишу.');
    }else{
      IB.sms('taxi','ТАКСІ «ЧОРНОМОРЕЦЬ»','Промо: перша поїздка по центру — ₴60. Тапай додаток ТАКСІ.');
    }
  }
};

/* ---------- ЖИТЛО: КВАРТИРИ ---------- */
IB.initHomes=()=>{
  if(IB.G.homes)return;
  IB.G.homes=[];
};
IB.flatList=()=>{
  const out=[];
  for(const b of IB.W.buildings){
    if(b.apt)out.push(b);
  }
  return out;
};
/* ==================== v24.0: ОРЕНДА — ЗА МІСЯЦЬ (30 ДНІВ) ====================
   Гравець: «ВАРТІСТЬ — не в день а за місяць, ми знімаємо на 30 днів,
   ріелтор нагадує через 30 днів — можна оплатити далі або виїхати,
   якщо виїжджаєш — склад весь пропадає».
   • за 3 дні до кінця — СМС-нагадування від Віри;
   • після кінця — 2 дні грації з СМС-нагадуванням;
   • не оплатив — ВИСЕЛЕННЯ і СКЛАД (весь рюкзак групи) ПРОПАДАЄ;
   • у чаті Віри — кнопки «ОПЛАТИТИ ЩЕ МІСЯЦЬ» / «ВИЇХАТИ». */
IB.flatRent=(b)=>{
  if(IB.payShared(b.apt.rent)){IB.ownFlat(b,'rent');IB.toast('🔑 ОРЕНДА НА 30 ДНІВ: '+b.apt.addr+' (−₴'+b.apt.rent+'/міс)','gold');
    IB.sms('vera','Віра (ріелтор)','Ключі від '+b.apt.addr+' ваші НА 30 ДНІВ. Оплата першого місяця пройшла. За 3 дні до кінця нагадаю. ТЕПЕР ПОЇХАЛИ ЗАСЕЛЯТИСЬ: квартира вже на КАРТІ (🏠 БАЗА) і у ТАКСІ.');
    IB.visitPlace('БАЗА: '+b.apt.addr,b.door.x,b.door.y);
    IB.banner('🏠 БАЗА П\'ЯТІРКИ: '+b.apt.addr);
    /* після аренди — одразу їдемо заселятись: GPS веде до дверей */
    if(IB.goWalk)IB.goWalk({x:b.door.x,y:b.door.y,name:'ЗАСЕЛЕННЯ: '+b.apt.addr});
    IB.sms('team','П\'ЯТЕРКА','Це наша БАЗА! Там відпочинок, їжа, гулянка, склад — всі відновлюються. На карті позначено 🏠');
    IB.chipShow&&IB.chipShow();
    return true;}
  IB.toast('Не хватає ₴'+b.apt.rent+' у спільній касі','red');return false;
};
IB.flatBuy=(b)=>{
  if(IB.payShared(b.apt.price)){IB.ownFlat(b,'own');IB.toast('🏠 КУПЛЕНО: '+b.apt.addr+' (−₴'+b.apt.price+')','gold');
    IB.sms('vera','Віра (ріелтор)','Вітаю з покупкою! '+b.apt.addr+' — тепер ваша назавжди. Документи у мера.');
    IB.journalAdd&&IB.journalAdd('🏠','Купили квартиру: '+b.apt.addr);return true;}
  IB.toast('Не хватає ₴'+b.apt.price,'red');return false;
};
IB.ownFlat=(b,mode)=>{
  /* зняти попередні оренди на цей будинок */
  IB.G.homes=(IB.G.homes||[]).filter(h=>h.b!==b);
  const rec={id:'flat'+(IB.G.homes.length+1),b,addr:b.apt.addr,mode,expDay:IB.G.day+30,
    door:{x:b.door.x,y:b.door.y},occupants:[]};
  IB.G.homes.push(rec);
};
IB.flatSettle=()=>{
  /* РОЗСЕЛЕННЯ: героїв по квартирах — 2 в одній, 3 в іншій */
  const homes=IB.G.homes||[];
  if(!homes.length){IB.toast('Спершу орендуйте або купіть квартиру','red');return;}
  const hs=[...IB.E.team];
  let hi=0,cnt=0;
  for(const h of hs){
    h.flat=homes[hi].id;homes[hi].occupants.push(h.id);
    cnt++;if(cnt>=2+((hi%2))){hi=(hi+1)%homes.length;cnt=0;}
    IB.sms(h.id,h.name,'Моя адреса: '+homes[hi].addr+'. Ключі у кишені!');
  }
  IB.toast('👥 Розселили п\'ятірку по '+homes.length+' адресах','gold');
};
IB.flatDueTick=()=>{
  /* v24.0: щоденна перевірка оренди — нагадування, грація, виселення */
  for(const h of (IB.G.homes||[])){
    if(h.mode!=='rent')continue;
    const rent=h.rent||(h.b.apt&&h.b.apt.rent)||0;
    const left=h.expDay-IB.G.day;
    if(left===3&&!h._warn){h._warn=true;
      IB.sms('vera','Віра (ріелтор)','Нагадування: оренда '+h.addr+' закінчується ЧЕРЕЗ 3 ДНІ (день '+h.expDay+'). Можеш оплатити ще місяць (₴'+rent+') — кнопка у цьому чаті або у вкладці ЖИТЛО. Або повідом про виїзд.');
      IB.toast('🏠 Віра нагадує: оренда до дня '+h.expDay+' (залишилось 3 дн.)','gold');}
    if(IB.G.day>h.expDay){
      const over=IB.G.day-h.expDay;
      if(over<=2){
        if(!h._due){h._due=true;
          IB.sms('vera','Віра (ріелтор)','Оренда '+h.addr+' вже ЗАВЕРШИЛАСЬ! Даю 2 дні грації: оплати ₴'+rent+' (кнопка в чаті) — або виїжджайте, і СКЛАД у квартирі ПРОПАДЕ.');
          IB.toast('❌ '+h.addr+': оренда закінчилась! Оплати або виїдь (2 дн. грації)','red');}
      }else{
        IB.G.homes=IB.G.homes.filter(x=>x!==h);
        IB.flatEvict('Оренду не продовжили — ВИСЕЛЕННЯ з '+h.addr);
      }
    }
  }
  /* v24.0: старі сейви — дім ріелтора тільки в IB.G.home (без homes):
     ті самі правила — грація 2 дні, потім виселення і склад пропадає */
  if(IB.G.home&&!(IB.G.homes||[]).length){
    const left=IB.G.home.expDay-IB.G.day;
    if(left===3&&!IB.G.home._warn){IB.G.home._warn=true;
      IB.sms('vera','Віра (ріелтор)','Нагадування: оренда '+IB.G.home.label+' закінчується через 3 дні (день '+IB.G.home.expDay+'). Оплати далі (₴'+IB.G.home.rent+') або виїжджайте.');}
    if(IB.G.day>IB.G.home.expDay+2){
      IB.G.home=null;
      IB.flatEvict('Оренду не продовжили — ВИСЕЛЕННЯ зі старої бази');
    }else if(IB.G.day>IB.G.home.expDay&&!IB.G.home._due){
      IB.G.home._due=true;
      IB.sms('vera','Віра (ріелтор)','Оренда '+IB.G.home.label+' завершилась! 2 дні грації: оплати ₴'+IB.G.home.rent+' — або виїдь, і СКЛАД пропаде.');
      IB.toast('❌ Оренда завершилась — оплати або виїдь!','red');
    }
  }
};
/* v24.0: ВИСЕЛЕННЯ — увесь СКЛАД п'ятірки пропадає */
IB.flatEvict=(why)=>{
  let lost=0;for(const k in IB.G.inv){lost+=(IB.G.inv[k]||0);IB.G.inv[k]=0;}
  /* синхронізація старого дому: баз більше немає — дім ріелтора теж скасовується */
  if(!(IB.G.homes||[]).length)IB.G.home=null;
  IB.toast('❌ '+why+'. СКЛАД ПРОПАВ ('+lost+' одиниць у рюкзаках і схові)','red');
  IB.sms('vera','Віра (ріелтор)','Ключі повернуто, склад вивезено на склад порту... Отже, якщо знову захочете оселитись — я на місці;)');
  IB.journalAdd&&IB.journalAdd('🏠',why+'. Склад п\'ятірки (річ: '+lost+') пропав.');
  IB.banner('📦 СКЛАД ПРОПАВ — ВИСЕЛЕННЯ');
  IB.SFX&&IB.SFX.alert&&IB.SFX.alert();
};
/* v24.0: ОПЛАТА ЩЕ ОДНОГО МІСЯЦЯ (кнопка у чаті Віри / ЖИТЛО) */
IB.flatPay=(h)=>{
  if(!h||h.mode!=='rent')return;
  const rent=h.rent||(h.b.apt&&h.b.apt.rent)||0;
  if(IB.payShared(rent)){h.expDay+=30;h._warn=false;h._due=false;
    IB.toast('🔑 '+h.addr+': оренда продовжена на 30 днів (до дня '+h.expDay+') — −₴'+rent,'gold');
    IB.sms('vera','Віра (ріелтор)','Дякую за оплату! '+h.addr+' — ваші ще 30 днів (до дня '+h.expDay+'). Склад у квартирі у безпеці.');
    IB.journalAdd&&IB.journalAdd('🏠','Оренда продовжена: '+h.addr+' — ₴'+rent+' до дня '+h.expDay+'.');
  }else{IB.toast('Не хватає ₴'+rent+' у спільній касі','red');
    IB.sms('vera','Віра (ріелтор)','На рахунку не вистачає ₴'+rent+'. Заробіть і повертайтесь — або, на жаль, доведеться виїхати.');}
};
/* v24.0: ВИЇЗД (кнопка у чаті Віри / ЖИТЛО) — підтвердження + склад пропадає */
IB.flatLeave=(h)=>{
  if(!h)return;
  const el=document.getElementById('ph-dlg');
  const doLeave=()=>{
    IB.G.homes=(IB.G.homes||[]).filter(x=>x!==h);
    IB.flatEvict('ВИЇЗД з '+h.addr+' — склад пропав');
    IB.sms('team','П\'ЯТЕРКА','Ми з\'їхали з '+h.addr+'. Речі довелося залишити... Шукаємо нову базу!');
    if(IB.G.homes&&!IB.G.homes.length)IB.G.home=null;
    if(IB.APPVIEWS&&IB.PHONE&&IB.PHONE.app==='flat'&&IB.PHONE.visible){IB.openPhoneApp('flat');}
  };
  if(el){
    el.classList.remove('hidden');
    el.innerHTML='<div class="pd-q">📦 ВИЇЗД З '+esc(h.addr)+': УВЕСЬ СКЛАД (їжа, риба, ресурси) ПРОПАДЕ. Виїжджаємо?</div><div class="pd-a">'+
      '<button class="phq" data-tx="yes">📦 ТАК, ВИЇЖДАЄМ (склад пропадає)</button>'+
      '<button class="phq" data-tx="no">✖ НІ, ЛИШАЄМСЯ</button></div>';
    el.querySelectorAll('[data-tx]').forEach(b=>{b.onclick=()=>{el.classList.add('hidden');if(b.dataset.tx==='yes')doLeave();renderApp&&renderApp();};});
  }else doLeave();
};
/* v24.0: ДИНАМІЧНІ ШВИДКІ КНОПКИ В ЧАТІ ВІРИ — оплата/виїзд по кожній оренді */
function veraQuick(){
  const out=[{t:'🏘 ПОКАЗАТИ КВАРТИРИ (ЖИТЛО)',f:()=>{IB.openPhoneApp('flat');}}];
  for(const h of (IB.G.homes||[])){
    if(h.mode!=='rent')continue;
    const rent=h.rent||(h.b.apt&&h.b.apt.rent)||0;
    const left=h.expDay-IB.G.day;
    const urg=left<0?' — ЗАВЕРШИЛАСЬ! (2 дн. грації)':(left<=3?' — ЗАЛИШИЛОСЬ '+left+' дн!':'');
    out.push({t:'🔑 ОПЛАТИТИ ЩЕ МІСЯЦЬ: '+h.addr+' (₴'+rent+', до дня '+h.expDay+urg+')',f:()=>{IB.flatPay(h);renderApp();}});
    out.push({t:'📦 ВИЇХАТИ З '+h.addr+' (СКЛАД ПРОПАДЕ)',f:()=>{IB.flatLeave(h);}});
  }
  return out;
}

/* ---------- UI РЕНДЕР ---------- */
function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
function updateBadge(){
  const show=()=>{
    for(const id of ['ph-badge','ph-badge2','ph-badge3','bp-badge']){
      const b=document.getElementById(id);if(!b)continue;
      if(PH.unread>0){b.textContent=PH.unread;b.classList.remove('hidden');}
      else b.classList.add('hidden');
    }
  };
  show();
  /* v9.0: бейдж непрочитаних — і на плиті папки «СПІЛКУВАННЯ» */
  if(PH.visible&&!PH.min&&PH.app==='home'&&!PH.folder)renderHome();
}
IB.updatePhoneBadge=updateBadge;

/* ================= i3-phone-v6.0: GPS, КАМЕРА, БАНК ================= */
/* ---------- 🗺 GPS: карта міста + маршрут ---------- */
IB.G.nav=null;
IB.goWalk=(pt)=>{
  const L=IB.E.team[0];if(!L)return false;
  IB.G.nav={x:pt.x,y:pt.y,name:pt.name||'точка',field:IB.pathField(pt.x,pt.y)};
  IB.toast('🗺 Маршрут прокладено: '+(pt.name||'точка')+' — іди, веду сам');
  IB.closePhone();
  return true;
};
IB.updateNav=(dt)=>{
  const n=IB.G.nav;if(!n)return;
  const L=IB.E.team[0];if(!L){IB.G.nav=null;return;}
  const done=IB.walkField(L,n.field,dt,3.0);
  if(done||IB.dist(L.x,L.y,n.x,n.y)<2.2){
    IB.G.nav=null;IB.toast('🗺 Прибув: '+(n.name||'точка'),'gold');
    IB.sms('team','GPS','Ти на місці: '+(n.name||'точка'));
  }
};
const GPS_COL={0:'#153f60',16:'#1e5580',1:'#d8c08a',2:'#4e8a3e',3:'#3a6e30',12:'#3a3f4a',13:'#585e68',17:'#6a6f76',19:'#8a8f96',10:'#6e3f38',15:'#9a8f7a',7:'#a08a5a',14:'#7a9ab0'};
function gpsPrerender(){
  if(PH._mapCv)return PH._mapCv;
  const W=IB.W;const off=document.createElement('canvas');
  off.width=W.W;off.height=W.H;
  const g=off.getContext('2d');
  try{
    const img=g.createImageData(W.W,W.H);
    const d=img.data;
    const cm={};
    for(const k in GPS_COL){const c=GPS_COL[k];cm[k]=[parseInt(c.slice(1,3),16),parseInt(c.slice(3,5),16),parseInt(c.slice(5,7),16)];}
    for(let y=0;y<W.H;y++)for(let x=0;x<W.W;x++){
      const t=W.terr[y*W.W+x];
      const c=cm[t]||cm[2];
      const i=(y*W.W+x)*4;
      d[i]=c[0];d[i+1]=c[1];d[i+2]=c[2];d[i+3]=255;
    }
    g.putImageData(img,0,0);
  }catch(e){/* headless: без картинки */}
  PH._mapCv=off;
  return off;
}
function gpsInvalidate(){PH._mapCv=null;}
IB.gpsInvalidate=gpsInvalidate;
function drawGps(cv){
  if(!cv||!cv.getContext)return;
  const W=IB.W,L=IB.E.team&&IB.E.team[0];
  if(!L)return;
  const g=cv.getContext('2d');
  try{
  g.imageSmoothingEnabled=false;
  g.clearRect(0,0,cv.width,cv.height);
  g.drawImage(gpsPrerender(),0,0,W.W,W.H,0,0,cv.width,cv.height);
  const sx=cv.width/W.W,sy=cv.height/W.H;
  /* банні території */
  const gangs=[{x0:332,y0:356,x1:436,y1:430,c:'rgba(224,74,58,0.30)'},{x0:246,y0:370,x1:284,y1:398,c:'rgba(176,64,224,0.30)'}];
  for(const t of gangs){g.fillStyle=t.c;g.fillRect(t.x0*sx,t.y0*sy,(t.x1-t.x0)*sx,(t.y1-t.y0)*sy);}
  /* маршрут */
  if(IB.G.nav){
    g.strokeStyle='#f0d050';g.lineWidth=2;g.setLineDash([3,3]);
    g.beginPath();g.moveTo(L.x*sx,L.y*sy);g.lineTo(IB.G.nav.x*sx,IB.G.nav.y*sy);g.stroke();g.setLineDash([]);
  }
  /* герої */
  for(const h of IB.E.team){
    if(h===L)continue;
    g.fillStyle=h.def.nameColor||'#6ee04a';
    g.fillRect(h.x*sx-1.5,h.y*sy-1.5,4,4);
  }
  /* POI */
  g.fillStyle='#f0d050';
  for(const d of IB.PHONE_DESTS()){g.fillRect(d.x*sx-1,d.y*sy-1,3,3);}
  /* v24.0: БАЗА — ВЕЛИКА ЖОВТА ПОЗНАЧКА + підпис; ключові POI — мітки на карті */
  const bb=(typeof IB.baseHome==='function')?IB.baseHome():null;
  const LBL={"ПЛЯЖ ЦЕНТРАЛЬНИЙ":"ПЛЯЖ","ПОРТ / МОРЕВАКЗАЛ":"ПОРТ","КЛУБ «МАЯК»":"КЛУБ","РИНОК «ЦЕНТРАЛЬНИЙ»":"РИНОК","ВОКЗАЛ":"ВОКЗАЛ","ЛУНА-ПАРК":"ЛУНА-ПАРК"};
  g.font='bold 7px monospace';g.textAlign='center';
  for(const d of IB.PHONE_DESTS()){
    if(!d.base&&LBL[d.name]&&cv.width>200){
      g.fillStyle='rgba(10,18,24,0.55)';
      g.fillRect(d.x*sx-g.measureText(LBL[d.name]).width/2-2,d.y*sy-9,g.measureText(LBL[d.name]).width+4,8);
      g.fillStyle='#9fd8f0';g.fillText(LBL[d.name],d.x*sx,d.y*sy-2);
    }
  }
  if(bb){
    g.fillStyle='#f0d050';g.beginPath();g.arc(bb.door.x*sx,bb.door.y*sy,4.6,0,6.29);g.fill();
    g.strokeStyle='#20262c';g.lineWidth=1;g.stroke();
    g.fillStyle='#20262c';g.fillRect(bb.door.x*sx-1,bb.door.y*sy-1,2,2);
    if(cv.width>200){
      g.fillStyle='rgba(240,208,80,0.85)';
      g.fillText('🏠 БАЗА',bb.door.x*sx,bb.door.y*sy-6);
    }
  }
  g.textAlign='left';
  /* артефакти — видно з лампою радіо (a13) */
  if(IB.artHas('a13')){
    g.fillStyle='#ff8a2a';
    for(const a of IB.ARTIFACTS){
      if(!a.world||IB.artHas(a.id))continue;
      g.fillRect(a.x*sx-2,a.y*sy-2,5,5);
    }
  }
  /* гравець */
  if(L){
    g.fillStyle='#ffffff';
    g.beginPath();g.arc(L.x*sx,L.y*sy,3.4,0,6.29);g.fill();
    g.fillStyle='#e04a3a';
    g.fillRect(L.x*sx-1,L.y*sy-1,2,2);
  }
  }catch(e){/* headless/старі переглядачі */}
}
/* v8.0: панель КАРТА праворуч (зверху, над телефоном) малює тим самим рендером */
IB.drawGpsAny=drawGps;
function renderGps(body){
  let h='<div class="ph-listtitle">🗺 GPS — ЧОРНОМОРСЬК</div>';
  const L=IB.E.team[0];
  if(IB.G.nav)h+='<div class="ph-note big">Маршрут: '+(IB.G.nav.name||'точка')+' • <button class="phq" id="gps-cancel">СКАСУВАТИ</button></div>';
  const bb0=(typeof IB.baseHome==='function')?IB.baseHome():null;
  if(bb0)h+='<div class="ph-note big">🏠 БАЗА П\'ЯТІРКИ: '+esc(bb0.addr)+' — там відпочинок, їжа, гулянка і СКЛАД. На карті — велика жовта позначка 🏠</div>';
  if(L)h+='<div class="ph-note">Ти тут: '+IB.W.zoneAt(L.x,L.y)+' ('+(L.x|0)+','+(L.y|0)+') • зона ВВ13 — Бронкс</div>';
  h+='<canvas id="ph-gps" width="264" height="336" style="width:100%;image-rendering:pixelated;background:#0a1218;border:2px solid #2a3a44;border-radius:8px;cursor:pointer"></canvas>';
  h+='<div class="ph-note">🟡 пункти — усі місця міста (тап по карті або списком нижче): пошлях/таксі. ⚪ ти, 🟦 група, 🟧 артефакти (з лампою радіо). Підписи на карті: ПЛЯЖ • ПОРТ • КЛУБ • РИНОК • 🏠 БАЗА.</div>';
  h+='<div class="ph-listtitle">📍 МОЇ АДРЕСИ (був • комунікував • зняв)</div>';
  const mine=[];
  if(bb0)mine.push({name:'🏠 '+bb0.addr,x:bb0.door.x,y:bb0.door.y});
  for(const v of (IB.G.visited||[]).slice(-12).reverse())mine.push({name:v.name,x:v.x,y:v.y});
  if(mine.length){
    h+='<div class="ph-dests">';
    for(const d of mine){
      h+='<div class="ph-dest" data-mine="1" data-mx="'+d.x+'" data-my="'+d.y+'"><b>'+esc(d.name)+'</b><span>'+(L?((IB.dist(L.x,L.y,d.x,d.y)|0)+' кварт. • тап → шлях/таксі'):'')+'</span></div>';
    }
    h+='</div>';
  }else h+='<div class="ph-note">Поки пусто. Заходь у будинки, знайомся, знімай квартиру — усі адреси запишуться сюди.</div>';
  h+='<div class="ph-dests">';
  const ds=IB.PHONE_DESTS();
  for(const d of ds){
    h+='<div class="ph-dest" data-gps="'+d.id+'"><b>'+d.name+'</b><span>'+(L?IB.dist(L.x,L.y,d.x,d.y)|0:0)+' кварт.</span></div>';
  }
  h+='</div>';
  body.innerHTML=h;
  const cv=document.getElementById('ph-gps');
  drawGps(cv);
  if(cv){
    cv.onclick=(ev)=>{
      const r=cv.getBoundingClientRect();
      const mx=(ev.clientX-r.left)/r.width*IB.W.W,my=(ev.clientY-r.top)/r.height*IB.W.H;
      let best=null,bd=1e9;
      for(const d of IB.PHONE_DESTS()){const dd=IB.dist(mx,my,d.x,d.y);if(dd<bd){bd=dd;best=d;}}
      if(best&&bd<22){
        IB.toast('🗺 GPS: '+best.name+' — ШЛЯХ або ТАКСІ','gold');
        PH._gpsSel=best;
        body.querySelectorAll('[data-gps]').forEach(el=>{el.classList.toggle('sel',el.dataset.gps===best.id);});
      }
    };
  }
  if(!IB.W._gpsTick){IB.W._gpsTick=setInterval(()=>{if(PH.visible&&!PH.min&&PH.app==='gps')drawGps(document.getElementById('ph-gps'));},1000);}
  const cn=document.getElementById('gps-cancel');
  if(cn)cn.onclick=()=>{IB.G.nav=null;renderGps(body);};
  const byId={};for(const d of IB.PHONE_DESTS())byId[d.id]=d;
  body.querySelectorAll('[data-gps]').forEach(el=>{
    el.onclick=()=>{
      const d=byId[el.dataset.gps];PH._gpsSel=d;
      body.innerHTML='<div class="ph-listtitle">'+d.name+'</div>'+
        '<div class="ph-note big">Що робимо з цим місцем?</div>'+
        '<button class="phq wide" id="gps-walk">🚶 ПРОКЛАСТИ ШЛЯХ (пішки, GPS веде)</button>'+
        '<button class="phq wide" id="gps-taxi">🚕 ВИКЛИКАТИ ТАКСІ СЮДИ (≈₴'+IB.M.max(60,IB.M.round(IB.dist(IB.E.team[0].x,IB.E.team[0].y,d.x,d.y)*2.2))+')</button>'+
        '<div class="ph-back" data-back="1">◄ ДО КАРТИ</div>';
      document.getElementById('gps-walk').onclick=()=>IB.goWalk(d);
      document.getElementById('gps-taxi').onclick=()=>{IB.taxiCall(d);renderApp();};
      const back=body.querySelector('[data-back]');if(back)back.onclick=()=>{PH._gpsSel=null;renderApp();};
    };
  });
  /* v24.0: МОЇ АДРЕСИ — тап → шлях/таксі (прив'язка адрес до таксі) */
  body.querySelectorAll('[data-mine]').forEach(el=>{
    el.onclick=()=>{
      const d={id:'mine',name:el.querySelector('b').textContent,x:+el.dataset.mx,y:+el.dataset.my};
      body.innerHTML='<div class="ph-listtitle">'+esc(d.name)+'</div>'+
        '<div class="ph-note big">Моя адреса — куди їдемо?</div>'+
        '<button class="phq wide" id="gps-walk">🚶 ПРОКЛАСТИ ШЛЯХ (GPS веде)</button>'+
        '<button class="phq wide" id="gps-taxi">🚕 ТАКСІ СЮДИ (≈₴'+IB.M.max(60,IB.M.round(IB.dist(IB.E.team[0].x,IB.E.team[0].y,d.x,d.y)*2.2))+')</button>'+
        '<div class="ph-back" data-back="1">◄ ДО КАРТИ</div>';
      document.getElementById('gps-walk').onclick=()=>IB.goWalk(d);
      document.getElementById('gps-taxi').onclick=()=>{IB.taxiCall(d);renderApp();};
      const back=body.querySelector('[data-back]');if(back)back.onclick=()=>{renderApp();};
    };
  });
}
/* ---------- 📷 КАМЕРА ---------- */
IB.photoShot=()=>{
  try{
    const src=document.getElementById('game');
    if(!src)return null;
    const off=document.createElement('canvas');
    off.width=220;off.height=154;
    const g=off.getContext('2d');
    g.drawImage(src,0,0,src.width,src.height,0,0,off.width,off.height);
    const img=off.toDataURL('image/jpeg',0.7);
    const L=IB.E.team[0];
    const cap='Д'+IB.G.day+' '+IB.clockStr()+' • '+(L?IB.W.zoneAt(L.x,L.y):'місто');
    IB.G.album.push({kind:'photo',img,cap,t:Date.now()});
    if(IB.G.album.length>24)IB.G.album.splice(0,IB.G.album.length-24);
    IB.toast('📷 Фото у галереї телефона: '+cap,'gold');
    IB.skillXP(L,'luck',2);
    IB.sms&&IB.sms('team','КАМЕРА','📸 Знімок: '+cap);
    return {img,cap};
  }catch(e){IB.toast('Камера недоступна тут','red');return null;}
};
function renderCamera(body){
  let h='<div class="ph-listtitle">📷 КАМЕРА — ГАЛЕРЕЯ ('+IB.G.album.length+'/24)</div>';
  h+='<button class="phq wide" id="ph-shot">📸 ЗРОБИТИ ФОТО (скрін міста)</button>';
  h+='<div class="ph-note">Фото видно у СВІДАННЯХ-сценах і зберігається у сейві. За кожне фото — краплина УДАЧІ.</div><div class="ph-photos">';
  const ph=IB.G.album.filter(p=>p.kind==='photo');
  for(let i=ph.length-1;i>=0;i--){
    h+='<div class="ph-photo" data-ph="'+i+'"><img src="'+ph[i].img+'" alt=""><span>'+esc(ph[i].cap)+'</span></div>';
  }
  if(!ph.length)h+='<div class="ph-note">Галерея пуста — натисни 📸</div>';
  h+='</div>';
  body.innerHTML=h;
  const shot=document.getElementById('ph-shot');
  if(shot)shot.onclick=()=>{IB.photoShot();renderCamera(body);};
  body.querySelectorAll('[data-ph]').forEach(el=>{
    el.onclick=()=>{
      const p=IB.G.album.filter(x=>x.kind==='photo')[+el.dataset.ph];
      body.innerHTML='<div class="ph-back" data-back="1">◄ ГАЛЕРЕЯ</div><div class="ph-photo big"><img src="'+p.img+'" alt=""><span>'+esc(p.cap)+'</span></div>'+
        '<button class="phq wide" id="ph-del">🗑 ВИДАЛИТИ ФОТО</button>';
      const back=body.querySelector('[data-back]');if(back)back.onclick=()=>renderCamera(body);
      document.getElementById('ph-del').onclick=()=>{
        const ix=IB.G.album.indexOf(p);if(ix>=0)IB.G.album.splice(ix,1);renderCamera(body);};
    };
  });
}
/* ---------- 🏦 БАНК «ГРІВА» (рахунки + кишені + ЖУРНАЛ РОЗРАХУНКІВ) ---------- */
function renderBank(body){
  IB.initPockets&&IB.initPockets();
  const tx=(IB.G.bank&&IB.G.bank.log)||[];
  let dayIn=0,dayOut=0;
  for(const t of tx){if(t.d===IB.G.day){if(t.amt>0)dayIn+=t.amt;else dayOut-=t.amt;}}
  let h='<div class="ph-listtitle">🏦 БАНК «ГРІВА» — РАХУНКИ</div>';
  h+='<div class="ph-flat acc"><b>СПІЛЬНА КАСА П\'ЯТІРКИ</b><span>₴'+IB.G.money+' • оренда/таксі/їжа групи</span></div>';
  for(const hh of IB.E.team){
    h+='<div class="ph-flat acc"><b>'+esc(hh.name)+(hh.gang?' ⚔'+hh.gang.toUpperCase():'')+'</b><span>кишеня ₴'+(hh.pocket||0)+' • репутація '+(hh.rep||0)+' • адреса: '+(hh.flat?esc(hh.flat):'—')+'</span><button class="phq" data-tr="'+hh.id+'">СПІЛЬНЕ</button></div>';
  }
  h+='<div class="ph-note big">Сьогодні: зароблено ₴'+dayIn+' • витрачено ₴'+dayOut+'</div>';
  h+='<div class="ph-listtitle">ЖУРНАЛ РОЗРАХУНКІВ</div><div class="ph-msgs" style="max-height:26vh">';
  if(!tx.length)h+='<div class="ph-note">Пока тихо. Роботи, битки і свідання пишуться сюди автоматично.</div>';
  for(const t of tx.slice(-18).reverse()){
    h+='<div class="ph-msg '+(t.amt>0?'':'me')+'"><b>Д'+t.d+' '+t.t+' • '+esc(t.who)+'</b><span>'+(t.amt>0?'+':'−')+'₴'+IB.M.abs(t.amt)+(t.note?' • '+esc(t.note):'')+'</span></div>';
  }
  h+='</div><div class="ph-note">💳 Заробітки пишуться у КИШЕНЮ героя, спільне — на квартири/таксі. Оренда списується щомісяця автоматично.</div>';
  body.innerHTML=h;
  body.querySelectorAll('[data-tr]').forEach(el=>{el.onclick=()=>{IB.transfer(el.dataset.tr);renderBank(body);};});
}
/* ---------- ⚔ БАНДИ ---------- */
function gangCard(id,name,leader,turf,desc){
  const rep=IB.G.rep[id]||0;
  const founded=id==='vv13'?IB.G.vv13.founded:true;
  return '<div class="ph-flat gang"><b>'+name+(id==='vv13'?(founded?' (твоя)':''):'')+'</b>'+
    '<span>лідер: '+leader+' • територія: '+turf+'</span>'+
    '<div class="rep-bar"><i style="width:'+IB.M.max(0,IB.M.min(100,(rep+100)/2))+'%;background:'+(id==='vv13'?'#8888a0':'#e04a3a')+'"></i></div>'+
    '<span>повага до п\'ятірки: '+rep+' • '+desc+'</span></div>';
}
function renderGangs(body){
  const L=IB.E.team[0];
  let h='<div class="ph-listtitle">⚔ БАНДИ ЧОРНОМОРСЬКА</div>';
  h+='<div class="ph-note">У місті ДВІ банди. Кожен герой вільний: можна вступити до Портових, до Бронкових — або заснувати СВОЮ «ВВ13». Свої не бʼють своїх. Суперники реагують швидше.</div>';
  h+=gangCard('port','⚔ «ПОРТОВІ»','Капітан Гопчик','Порт/Морвокзал','битки, данина, контейнери');
  h+=gangCard('bronx','⚔ «БРОНКОВІ»','Мурзик','Бронкс','район біля пляжу, дворики');
  h+=gangCard('vv13','⚔ «ВВ13» — СВОЯ БАНДА','Ти (атаман)','Бронкс — база','4+ бійців, свої не бʼють');
  h+='<div class="ph-listtitle">СКЛАД П\'ЯТІРКИ</div>';
  for(const hh of IB.E.team){
    h+='<div class="ph-flat"><b>'+esc(hh.name)+'</b><span>банда: '+(hh.gang?hh.gang.toUpperCase():'свободний')+'</span>'+
      (hh===L?'<span class="ok">граєш за нього</span>':'')+'</div>';
  }
  h+='<div class="ph-note big">ВСТУПИТИ: репутація банди ≥20 (битки на їхній землі, роботи для банди). ВВ13: повага 20+ в ОБОХ АБО 6 биток.</div>';
  h+='<div class="ph-quick">'+
    '<button class="phq" id="g-join-port">⚔ Я → «ПОРТОВІ»</button>'+
    '<button class="phq" id="g-join-bronx">⚔ Я → «БРОНКОВІ»</button>'+
    '<button class="phq" id="g-found">⚔ ЗАСНУВАТИ ВВ13</button>'+
    '<button class="phq" id="g-leave">✋ ВИЙТИ З БАНДИ</button></div>';
  h+='<div class="ph-note">Роботи для банд — у додатку КВЕСТИ (⚔ категорія). Лідери у СМС: Капітан Гопчик і Мурзик.</div>';
  body.innerHTML=h;
  const bind=(id,fn)=>{const el=document.getElementById(id);if(el)el.onclick=()=>{fn();renderGangs(body);};};
  bind('g-join-port',()=>IB.gangJoin(L.id,'port'));
  bind('g-join-bronx',()=>IB.gangJoin(L.id,'bronx'));
  bind('g-found',()=>IB.vv13Found());
  bind('g-leave',()=>IB.gangLeave(L.id));
}
/* ---------- 💪 СКІЛИ ---------- */
function renderSkills(body){
  IB.initPockets&&IB.initPockets();
  const hero=PH._skHero||IB.E.team[0].id;
  const h=IB.E.team.find(x=>x.id===hero)||IB.E.team[0];
  IB.initSkills(h);
  let tabs='<div class="ph-tabs">';
  for(const x of IB.E.team)tabs+='<button class="phq'+(x.id===h.id?' on':'')+'" data-shero="'+x.id+'">'+esc(x.name)+'</button>';
  tabs+='</div>';
  let hh='<div class="ph-listtitle">💪 СКІЛИ — '+esc(h.name)+' (очок: '+h.skillPts+')</div>'+tabs;
  hh+='<div class="ph-note">XP качається від ЖИТТЯ: битки → СИЛА, свідання → ШАРМ, роботи → ТЕХНІКА, детектив → ІНСТИНКТ. Кожні 100 XP — рівень + ОЧКО. Розподіляй тут!</div>';
  for(const sk of IB.SKILLS){
    const lv=IB.skillLv(h,sk.k);
    const cur=h.skills[sk.k].xp%100;
    hh+='<div class="ph-flat skill"><b>'+sk.n+' <i class="lv">'+lv+'</i></b><span>'+sk.d+'</span>'+
      '<div class="rep-bar"><i style="width:'+cur+'%;background:#3ec8e0"></i></div>'+
      (h.skillPts>0?'<button class="phq" data-spend="'+sk.k+'">+</button>':'<i class="prog">'+cur+'/100</i>')+'</div>';
  }
  hh+='<div class="ph-listtitle">🏺 АРТЕФАКТИ ('+IB.G.arts.length+'/'+IB.ARTIFACTS.length+')</div>';
  for(const a of IB.ARTIFACTS){
    if(IB.artHas(a.id))hh+='<div class="ph-flat"><b>🏺 '+esc(a.name)+'</b><span>'+esc(a.lore)+'</span></div>';
    else hh+='<div class="ph-flat"><b>??? </b><span>'+(a.world?'прихований у місті (ІНСТИНКТ/лампа радіо показує на GPS)':'нагорода за квест')+'</span></div>';
  }
  body.innerHTML=hh;
  body.querySelectorAll('[data-shero]').forEach(el=>{el.onclick=()=>{PH._skHero=el.dataset.shero;renderSkills(body);};});
  body.querySelectorAll('[data-spend]').forEach(el=>{el.onclick=()=>{IB.skillSpend(h,el.dataset.spend);renderSkills(body);};});
}
/* ---------- 🏆 РЕПУТАЦІЯ ---------- */
function renderRep(body){
  const R=IB.G.rep;
  let h='<div class="ph-listtitle">🏆 РЕПУТАЦІЯ У МІСТІ</div>';
  h+='<div class="ph-note">Репутацію можна ПОКРАЩИТИ (квести, добрі справи, битки, свідання) і ЗГАНЬБИТИ (втечі, відмови, скандали). Все впливає на оплату, банди і дружбу.</div>';
  for(const k in IB.REP_CATS){
    const c=IB.REP_CATS[k];
    const v=R[k]||0;
    h+='<div class="ph-flat rep"><b>'+c.n+'</b><span>'+IB.repLvl(v)+' ('+v+')</span>'+
      '<div class="rep-bar"><i style="width:'+IB.M.max(0,IB.M.min(100,(v+100)/2))+'%;background:'+c.c+'"></i></div></div>';
  }
  h+='<div class="ph-listtitle">ПЕРСОНАЛЬНО</div>';
  for(const hh of IB.E.team){
    h+='<div class="ph-flat rep"><b>'+esc(hh.name)+(hh.gang?' ⚔'+hh.gang.toUpperCase():'')+'</b><span>'+IB.repLvl(hh.rep||0)+' ('+(hh.rep||0)+')</span>'+
      '<div class="rep-bar"><i style="width:'+IB.M.max(0,IB.M.min(100,((hh.rep||0)+100)/2))+'%;background:'+(hh.def.nameColor||'#f0d050')+'"></i></div></div>';
  }
  h+='<div class="ph-listtitle">ІСТОРІЯ</div><div class="ph-msgs" style="max-height:24vh">';
  const lg=(R.log||[]).slice(-14).reverse();
  if(!lg.length)h+='<div class="ph-note">Пока тихо. Живи — місто все записує.</div>';
  for(const e of lg){
    h+='<div class="ph-msg '+(e.n>0?'':'me')+'"><b>Д'+e.d+' '+e.t+' • '+e.n+'</b><span>'+esc(e.why)+'</span></div>';
  }
  h+='</div>';
  body.innerHTML=h;
}
/* ---------- 🎮 РЕЖИМ: ЗА ВСІХ / ЗА ОДНОГО (як GTA) ---------- */
function renderMode(body){
  const mode=IB.G.gmode||'all';
  let h='<div class="ph-listtitle">🎮 РЕЖИМ ГРИ — НАША ФІШКА</div>';
  h+='<div class="ph-note">«GTA КОЛЕКТИВНЕ І ОДИНОЧНЕ»: граєш ЗА ВСІХ (пʼятірка разом) або ЗА ОДНОГО (решта живе своє життя і пише СМС).</div>';
  h+='<div class="ph-flat mode'+(mode==='all'?' on':'')+'"><b>👥 ЗА ВСІХ (КОЛЕКТИВНЕ)</b><span>усі 5 разом: лідер веде, доручення з ГРУПА, битки всією ватагою</span></div>';
  h+='<div class="ph-flat mode'+(mode==='one'?' on':'')+'"><b>🌞 ЗА ОДНОГО (ОДИНОЧНЕ)</b><span>ти — один герой: квести, свідання, таксі; решта — на пляжі/по квартирах, СМС-звʼязок</span></div>';
  h+='<div class="ph-quick"><button class="phq" id="m-all">👥 ГРАТИ ЗА ВСІХ</button><button class="phq" id="m-one">🌞 ГРАТИ ЗА ОДНОГО</button></div>';
  /* v10.0: вибір «за кого грати» перенесено НА ІКОНКИ ГЕРОЇВ (шапка зліва) —
     тап по іконці героя → поповер з кнопкою «ГРАТИ ЗА НЬОГО» */
  h+='<div class="ph-note big">👑 ЗА КОГО ГРАТИ: тапни ІКОНКУ героя у шапці зверху зліва — інфо і кнопка «ГРАТИ ЗА НЬОГО» прямо там.</div>';
  h+='<div class="ph-listtitle">ШВИДКІ КОМАНДИ</div><div class="ph-quick">'+
    '<button class="phq" id="m-beach">🏖 ВСІ НА ПЛЯЖ (ти вільний)</button>'+
    '<button class="phq" id="m-gather">👥 ЗІБРАТИ ВСІХ РАЗОМ</button>'+
    '<button class="phq" id="m-club">🎧 ЗУСТРІЧ У КЛУБІ «МАЯК»</button></div>';
  body.innerHTML=h;
  const b1=document.getElementById('m-all');
  if(b1)b1.onclick=()=>{IB.G.gmode='all';IB.soloMode(false);IB.toast('👥 РЕЖИМ: ЗА ВСІХ — пʼятірка разом','gold');renderMode(body);};
  const b2=document.getElementById('m-one');
  if(b2)b2.onclick=()=>{IB.G.gmode='one';IB.soloMode(true);IB.toast('🌞 РЕЖИМ: ЗА ОДНОГО — решта на пляжі, СМС-звʼязок','gold');renderMode(body);};
  const mb=document.getElementById('m-beach');
  if(mb)mb.onclick=()=>{IB.G.gmode='one';IB.soloMode(true);renderMode(body);};
  const mg=document.getElementById('m-gather');
  if(mg)mg.onclick=()=>{IB.G.gmode='all';IB.soloMode(false);IB.closePhone();};
  const mc=document.getElementById('m-club');
  if(mc)mc.onclick=()=>{IB.teamMeet({x:322,y:386,name:'клуб «Маяк»'});IB.G.gmode='all';IB.soloMode(false);IB.closePhone();};
}
/* ---------- 🍔 ЖИТТЄЗАБЕЗПЕЧЕННЯ (старий хот-бар 1-4 у телефона) ---------- */
function renderLife(body){
  const L=IB.E.team[0];
  let h='<div class="ph-listtitle">🍔 ЖИТТЄЗАБЕЗПЕЧЕННЯ</div>';
  h+='<div class="ph-note">Старі кнопки 1-4 тепер тут. Працюють ті самі клавіші 1-4.</div>';
  h+='<div class="ph-quick">'+
    '<button class="phq wide" id="lf-1">🍽 ЇСТИ (1) — найситніше з рюкзака</button>'+
    '<button class="phq wide" id="lf-2">🥤 ПИТИ (2) — вода/розсіл/пиво</button>'+
    '<button class="phq wide" id="lf-3">😴 СПАТИ ДО РАНКУ (3) — у квартирі безкоштовно</button>'+
    '<button class="phq wide" id="lf-4">⏳ ГОДИНА ВІДПОЧИНКУ (4) — сили +8</button>'+
    '<button class="phq wide" id="lf-torch">🔦 ФОНАРИКИ: '+(IB.G.torch!==false?'УВІМКНЕНО':'ВИМКНЕНО')+' (F)</button>'+
    '<button class="phq wide" id="lf-srch">🔊 ГУКАТИ ГРУПУ (R)</button></div>';
  h+='<div class="ph-flat"><b>'+esc(L.name)+'</b><span>сили '+IB.M.round(L.hp)+'% • їжа '+IB.M.round(L.food)+'% • вода '+IB.M.round(L.water)+'% • настрій '+IB.M.round(L.mood)+'%</span></div>';
  h+='<div class="ph-note">Рюкзак і повне меню їжі/пиття — у ДОДАТКУ РЮКЗАК.</div>';
  body.innerHTML=h;
  const hot=(k)=>{try{IB.MAIN.debug.hotbar(k);}catch(e){IB.toast('Дія недоступна','red');}renderLife(body);};
  const bind=(id,fn)=>{const el=document.getElementById(id);if(el)el.onclick=fn;};
  bind('lf-1',()=>hot('1'));
  bind('lf-2',()=>hot('2'));
  bind('lf-3',()=>hot('3'));
  bind('lf-4',()=>hot('4'));
  bind('lf-torch',()=>{IB.toggleTorch();renderLife(body);});
  bind('lf-srch',()=>{IB.startSearch();IB.closePhone();});
}

/* ---------- DISPATCH ДОДАТКІВ ---------- */
function renderAppContent(body){
  const AV=IB.APPVIEWS||{};
  const A=PH.app;
  if(A==='sms')renderSms(body);
  else if(A==='taxi')renderTaxi(body);
  else if(A==='car')renderCar(body);
  else if(A==='marsh')renderMarsh(body);
  else if(A==='flat')renderFlat(body);
  else if(A==='quests')renderQuests(body);
  else if(A==='radio')renderRadio(body);
  else if(A==='bank')renderBank(body);
  else if(A==='gps')renderGps(body);
  else if(A==='camera')renderCamera(body);
  else if(A==='gangs')renderGangs(body);
  else if(A==='skills')renderSkills(body);
  else if(A==='rep')renderRep(body);
  else if(A==='mode')renderMode(body);
  else if(A==='life')renderLife(body);
  else if(A==='bag'&&AV.bag)AV.bag(body);
  else if(A==='group'&&AV.group)AV.group(body);
  else if(A==='journal'&&AV.journal)AV.journal(body);
  else if(A==='map'&&AV.map)AV.map(body);
  else if(A==='fun'&&AV.fun)AV.fun(body);
  else if(A==='calendar')renderCalendar(body);
  else if(A==='settings')renderSettings(body);
  else if(A==='info'&&AV.info)AV.info(body);
  else renderContacts(body);
}
/* v9.0: головний екран = ПАПКИ; у папці = її підпапки і додатки.
   v10: вкладені папки (subs) — більше переходів по діях */
/* v18 М1: ВІДЖЕТИ ГОЛОВНОГО ЕКРАНА — погода з порадою, каса/кишеня,
   наступна справа, день/акт/рейв. Папки лишаються нижче одним скролом. */
function homeWidgets(){
  const L=IB.E.team[0];
  const wx=IB.WX.cur();
  const wxI={sun:'☀',heat:'🥵',wind:'💨',rain:'🌧',thunder:'⚡',storm:'🌊',cloud:'☁'}[IB.G.wx.type]||'☀';
  const advice=IB.G.wx.type==='heat'?'жара — ВЗЯТИ ВОДУ і крем':(IB.G.wx.type==='storm'?'шторм — море закрите':'погода для гулянки');
  const wn=IB.whatNext?IB.whatNext():null;
  const nextRave=((5-IB.G.day%7)+7)%7||7;
  const act=IB.actName?IB.actName():'';
  const ev=IB.eventToday?IB.eventToday():null;
  const EVI={fish:'🐟 рибний фестиваль',basket:'🏀 день баскетболу',cinema:'🎬 кіно на піску (увечері)',fair:'🏪 ярмарок сел'};
  let h='';
  h+='<div class="wrow wwx"><span class="wi">'+wxI+'</span><span class="wt">'+wx.label+' • '+IB.clockStr()+'<i>'+advice+'</i></span></div>';
  h+='<div class="wrow wmon"><span>💰 КАСА ₴'+IB.M.round(IB.G.money)+'</span><span>👖 КИШЕНЯ ₴'+IB.M.round((L&&L.pocket)||0)+'</span></div>';
  if(ev&&EVI[ev])h+='<div class="wrow wev"><b>СЬОГОДНІ: '+EVI[ev]+'</b></div>';
  /* v24.0: ВІДЖЕТ БАЗИ — прив'язка до локації, тап → маршрут до дому */
  const bw=(typeof IB.baseHome==='function')?IB.baseHome():null;
  if(bw){
    const left=bw.expDay-IB.G.day;
    const warn=(bw.mode!=='own'&&left<=3)?(left<0?' — ⚠ ОРЕНДА ЗАВЕРШИЛАСЬ!':' — ⚠ '+left+' дн. до кінця оренди'):'';
    h+='<div class="wrow wtask" data-w="base"><b>🏠 БАЗА: '+esc(bw.addr)+warn+'</b><i>тап — поїхати заселятись/до дому • відпочинок, їжа, склад</i></div>';
  }
  else h+='<div class="wrow wtask" data-w="flat"><b>🏠 БАЗИ ЩЕ НЕМАЄ — зніми квартиру (ріелтор «БІЛЯ МОРЕ»)</b><i>тап — ЖИТЛО у телефона</i></div>';
  if(wn)h+='<div class="wrow wtask" data-w="next"><b>▶ '+wn.txt+'</b><i>тап — прокласти шлях</i></div>';
  h+='<div class="wrow wday"><span>📅 ДЕНЬ '+IB.G.day+'/30 • '+act+'</span><span>🎉 РЕЙВ через '+nextRave+' дн.</span></div>';
  return h;
}
function renderHome(){
  const home=document.getElementById('ph-home');
  if(!home)return;
  const cap=document.getElementById('ph-homecap');
  const grid=document.getElementById('ph-appgrid');
  const f=PH.folder?folderById(PH.folder):null;
  if(f){
    /* ===== ПІДПАПКИ ПАПКИ ===== */
    if(cap)cap.innerHTML='<span class="ph-crumb" id="ph-tohome">◄ МЕНЮ</span> ▸ '+f.icon+' '+f.n;
    let g='';
    if(f.subs)for(const s of f.subs){
      g+='<div class="phfolder sub" data-folder="'+s.id+'"><span class="fi">'+s.icon+'</span><span class="ft">'+s.n+'<i>'+s.d+' • '+s.apps.length+' дод.</i></span><span class="pa">▸</span></div>';
    }
    for(const id of f.apps){
      const a=APPS.find(x=>x.id===id);if(!a)continue;
      const badge=(a.id==='sms'&&PH.unread>0)?'<b class="ph-badge">'+PH.unread+'</b>':'';
      g+='<div class="phappl" data-app="'+a.id+'"><span class="pi">'+a.icon+badge+'</span><span class="pt">'+a.n+'<i>'+(APP_HINT[a.id]||'')+'</i></span><span class="pa">▸</span></div>';
    }
    if(grid)grid.innerHTML=g;
  }else{
    /* ===== v18 М1: ГОЛОВНИЙ ЕКРАН — ВІДЖЕТИ + ПАПКИ НИЖЧЕ ОДНИМ СКРОЛОМ ===== */
    if(cap)cap.textContent='📱 ВІДЖЕТИ ДНЯ • ПАПКИ НИЖЧЕ';
    let g=homeWidgets();
    for(const fo of FOLDERS){
      const badge=(fo.id==='fchat'&&PH.unread>0)?'<b class="ph-badge">'+PH.unread+'</b>':'';
      const nAll=(fo.apps?fo.apps.length:0)+(fo.subs?fo.subs.length:0);
      g+='<div class="phfolder" data-folder="'+fo.id+'"><span class="fi">'+fo.icon+badge+'</span><span class="ft">'+fo.n+'<i>'+fo.d+' • '+nAll+' розд.</i></span><span class="pa">▸</span></div>';
    }
    if(grid)grid.innerHTML=g;
  }
  grid&&grid.querySelectorAll('[data-folder]').forEach(el=>{
    el.onclick=()=>{PH.folder=el.dataset.folder;renderHome();IB.SFX&&IB.SFX.ui&&IB.SFX.ui();};
  });
  grid&&grid.querySelectorAll('[data-app]').forEach(el=>{
    el.onclick=()=>{IB.openPhoneApp(el.dataset.app);};
  });
  /* v18 М1: кнопка віджета «ЩО ДАЛІ» — прокласти шлях одним тапом */
  grid&&grid.querySelectorAll('[data-w]').forEach(el=>{
    el.onclick=()=>{
      if(el.dataset.w==='base'){
        const bw=(typeof IB.baseHome==='function')?IB.baseHome():null;
        if(bw&&IB.goWalk)IB.goWalk({x:bw.door.x,y:bw.door.y,name:'БАЗА: '+bw.addr});
        return;
      }
      if(el.dataset.w==='flat'){IB.openPhoneApp('flat');return;}
      const wn=IB.whatNext?IB.whatNext():null;
      if(wn&&IB.goWalk)IB.goWalk(wn.pt);
    };
  });
  const th=document.getElementById('ph-tohome');
  if(th)th.onclick=()=>{PH.folder=null;renderHome();};
}
function renderApp(){
  const home=document.getElementById('ph-home');
  const app=document.getElementById('ph-app');
  const body=document.getElementById('ph-body');
  const title=document.getElementById('ph-apptitle');
  const back=document.getElementById('ph-back');
  if(!body)return;
  if(PH.app==='home'){
    home&&home.classList.remove('hidden');
    app&&app.classList.add('hidden');
    renderHome();
    return;
  }
  home&&home.classList.add('hidden');
  app&&app.classList.remove('hidden');
  if(title)title.textContent=APP_TITLE[PH.app]||PH.app.toUpperCase();
  /* v10.0: ХЛІБНІ КРИХТИ — ⌂ МЕНЮ ▸ ПАПКА ▸ (ПІДПАПКА) ▸ ДОДАТОК
     (повний шлях, тап по крихті — перехід; «◄ ПАПКА» — назад у свою папку) */
  if(back){
    const f=folderOfApp(PH.app);
    const pf=f?parentOf(f.id):null;
    back.textContent='◄ '+(f?f.n:'МЕНЮ');
    const head=document.getElementById('ph-apphead');
    let crumb=document.getElementById('ph-crumbs');
    if(head&&!crumb){
      crumb=document.createElement('div');
      crumb.id='ph-crumbs';
      head.insertBefore(crumb,head.firstChild);
    }
    if(crumb)crumb.innerHTML='<span class="ph-crumb" id="ph-cr-home">⌂ МЕНЮ</span>'
      +(pf?' ▸ <span class="ph-crumb" id="ph-cr-par">'+pf.icon+' '+pf.n+'</span>':'')
      +(f?' ▸ <span class="ph-crumb" id="ph-cr-fold">'+f.icon+' '+f.n+'</span>':'')
      +' ▸ <b>'+(APP_TITLE[PH.app]||PH.app)+'</b>';
    const ch=document.getElementById('ph-cr-home');
    if(ch)ch.onclick=()=>{PH.app='home';PH.folder=null;renderApp();};
    const cp=document.getElementById('ph-cr-par');
    if(cp)cp.onclick=()=>{PH.app='home';PH.folder=(f?parentOf(f.id):null)?parentOf(f.id).id:null;renderApp();};
    const cf=document.getElementById('ph-cr-fold');
    if(cf)cf.onclick=()=>{PH.app='home';renderApp();};
  }
  renderAppContent(body);
}
function renderSms(body){
  const chat=PH.chat;
  if(chat&&PH.chats[chat]){
    const c=PH.chats[chat];
    let h='<div class="ph-back" data-back="1">◄ ЧАТИ</div><div class="ph-chatname" style="color:'+c.color+'">'+esc(c.name)+'</div><div class="ph-msgs">';
    for(const m of c.msgs.slice(-30)){
      h+='<div class="ph-msg '+(m.me?'me':'')+'"><b>'+esc(m.who)+'</b><span>'+esc(m.txt)+'</span></div>';
    }
    h+='</div>';
    const qk=(chat==='vera')?veraQuick():(QUICK[chat]||[]);
    if(qk.length){
      h+='<div class="ph-quick">';
      for(let i=0;i<qk.length;i++)h+='<button class="phq" data-qk="'+i+'">'+esc(qk[i].t)+'</button>';
      h+='</div>';
    }
    h+='<div class="ph-inputrow"><input id="ph-inp" placeholder="Вільне СМС..." maxlength="60"><button id="ph-send">➤</button></div>';
    body.innerHTML=h;
    const inp=document.getElementById('ph-inp');
    const send=()=>{
      const v=inp.value.trim();if(!v)return;
      IB.smsMe(chat,v);inp.value='';
      IB.smsReply(chat,IB.rnd(2,5));
    };
    const btn=document.getElementById('ph-send');
    if(btn)btn.onclick=send;
    if(inp)inp.onkeydown=(e)=>{if(e.key==='Enter')send();e.stopPropagation();};
    body.querySelectorAll('[data-qk]').forEach(el=>{
      el.onclick=()=>{const k=qk[+el.dataset.qk];IB.smsMe(chat,k.t);k.f();};
    });
    const back=body.querySelector('[data-back]');
    if(back)back.onclick=()=>{PH.chat=null;renderApp();};
    const box=body.querySelector('.ph-msgs');
    if(box)box.scrollTop=99999;
    return;
  }
  /* список чатів */
  let h='<div class="ph-listtitle">СМС — ЧАТИ</div><div class="ph-chats">';
  for(const id in PH.chats){
    const c=PH.chats[id];
    const last=c.msgs.length?c.msgs[c.msgs.length-1]:null;
    h+='<div class="ph-chatrow" data-chat="'+id+'"><span class="ph-av" style="background:'+c.color+'">'+esc(c.name[0])+'</span>'+
      '<span class="ph-cn">'+esc(c.name)+'</span><span class="ph-cl">'+(last?esc(last.txt.slice(0,26)):'...')+'</span></div>';
  }
  /* контакти без чатів — створюємо за запитом */
  h+='<div class="ph-note">Дівчата з\'являться у чатах після знайомства на вулиці.</div></div>';
  body.innerHTML=h;
  body.querySelectorAll('[data-chat]').forEach(el=>{el.onclick=()=>{PH.chat=el.dataset.chat;renderApp();};});
}
function renderTaxi(body){
  const L=IB.E.team[0];
  let h='<div class="ph-listtitle">🚕 ТАКСІ «ЧОРНОМОРЕЦЬ»</div>';
  if(IB.TAXI.car){
    h+='<div class="ph-note big">Таксі '+(IB.TAXI.state==='toPlayer'?'ВИЇХАЛО до вас':(IB.TAXI.state==='wait'?'НА МІСЦІ (E — сісти)':'ВИ ВЇЗЖАЄТЕ → '+IB.TAXI.dest.name))+'</div>';
  }
  h+='<div class="ph-note">Тариф: ₴2.2/квартал, мін. ₴60. '+(IB.TAXI.solo?'Платить кишеня лідера.':'Платить спільна каса.')+'</div>';
  /* v24.0: МОЇ АДРЕСИ — база + відвідані (був/комунікував/зняв) вгорі списку */
  const bb=(typeof IB.baseHome==='function')?IB.baseHome():null;
  h+='<div class="ph-note">🏠 Адреса ріелтора Віри: офіс «БІЛЯ МОРЕ», просп. Миру (центр) — пункт у списку нижче, таксі довезе.</div>';
  const mine=[];
  if(bb)mine.push({name:'🏠 БАЗА: '+bb.addr,x:bb.door.x,y:bb.door.y});
  for(const v of (IB.G.visited||[]).slice(-8).reverse())mine.push({name:'📍 '+v.name,x:v.x,y:v.y});
  if(mine.length){
    h+='<div class="ph-listtitle">📍 МОЇ АДРЕСИ (як був — таксі знає)</div><div class="ph-dests">';
    for(const d of mine){
      const dd=L?IB.M.round(IB.dist(L.x,L.y,d.x,d.y)):0;
      h+='<div class="ph-dest" data-mtd="1" data-mx="'+d.x+'" data-my="'+d.y+'" data-mn="'+esc(d.name)+'"><b>'+esc(d.name)+'</b><span>≈₴'+IB.M.max(60,IB.M.round(dd*2.2))+' • '+dd+' кварт.</span></div>';
    }
    h+='</div><div class="ph-note">Всі адреси, де ти був/спілкувався/зняв квартиру, — зберігаються тут і у GPS.</div>';
  }
  h+='<div class="ph-dests">';
  for(const d of IB.PHONE_DESTS()){
    const dd=L?IB.M.round(IB.dist(L.x,L.y,d.x,d.y)):0;
    h+='<div class="ph-dest" data-dest="'+d.id+'"><b>'+esc(d.name)+'</b><span>≈₴'+IB.M.max(60,IB.M.round(dd*2.2))+' • '+dd+' кварт.</span></div>';
  }
  h+='</div>';
  body.innerHTML=h;
  const byId={};for(const d of IB.PHONE_DESTS())byId[d.id]=d;
  body.querySelectorAll('[data-dest]').forEach(el=>{
    el.onclick=()=>{const d=byId[el.dataset.dest];IB.taxiCall(d);renderApp();};
  });
  body.querySelectorAll('[data-mtd]').forEach(el=>{
    el.onclick=()=>{IB.taxiCall({id:'mine',name:el.dataset.mn,x:+el.dataset.mx,y:+el.dataset.my});renderApp();};
  });
}
function renderMarsh(body){
  const stops=IB.MARSH.routeStops||[];
  const ns=IB.marshNearestStop();
  let h='<div class="ph-listtitle">🚌 МАРШРУТКА №7</div><div class="ph-note">Петля: пр. Миру → 12-та Лінія → вул. Курортна → 1-ша Лінія. ₴12/пасажир.</div>';
  if(ns)h+='<div class="ph-note big">Найближча зупинка: «'+esc(ns.name)+'» ('+IB.M.round(ns.d)+' кварт.)</div>';
  h+='<div class="ph-dests">';
  for(const s of stops){
    h+='<div class="ph-dest" data-ms="'+stops.indexOf(s)+'"><b>🚏 '+esc(s.name)+'</b></div>';
  }
  h+='</div>';
  body.innerHTML=h;
  body.querySelectorAll('[data-ms]').forEach(el=>{
    el.onclick=()=>{const s=stops[+el.dataset.ms];IB.marshGo(s);renderApp();};
  });
}
/* ==================== v28.0 «МОЄ АВТО»: ДОДАТОК АВТО ==================== */
function renderCar(body){
  const S2=IB.CAR_OWN,L=IB.E.team[0];
  let h='<div class="ph-listtitle">🚗 МОЄ АВТО — «АВТОМОРЕ» • «КЕРМ»</div>';
  if(!S2.owned){
    h+='<div class="ph-note big">Машини ще немає</div>'+
      '<div class="ph-note">АВТОРИНОК «АВТОМОРЕ» — центр (за просп. Миру, GPS у списку): ВАЗ ₴38 тис • Lanos ₴52 тис • фургон ₴68 тис • пікап ₴74 тис • «Буйвол» ₴96 тис. Гасимо зі спільної каси (₴'+IB.G.money+'). Авто стає НАШИМ: залишаємо, зачиняємо, повертаємось.</div>';
  }else{
    const f=IB.M.max(0,IB.M.round(S2.fuel));
    const fc=f<=10?'#e05a5a':(f<=25?'#e0a030':'#4ee06a');
    h+='<div class="ph-flat"><b>🚗 '+esc(S2.model.toUpperCase())+' — '+esc(S2.colorN)+' ('+esc(S2.plate)+')</b>'+
      '<span>⛽ паливо: <b style="color:'+fc+'">'+f+'%</b> з 45 л • пробіг '+IB.M.round(S2.dist)+' • заправок: '+S2.refuels+' • '+(S2.locked?'🔒 ЗАЧИНЕНЕ':'🔓 відчинене')+'</span></div>';
    h+='<div class="ph-note big">Машина стоїть там, де її залишили: '+IB.M.round(S2.car?S2.car.x:S2.parkX)+','+IB.M.round(S2.car?S2.car.y:S2.parkY)+' — E біля неї: сісти (відчиниться).</div>';
    if(f<=25)h+='<div class="ph-note big" style="color:#e0a030">⚠ ПАЛИВО '+f+'% — час на ЗАПРАВКУ (список нижче)</div>';
    h+='<div class="ph-note">Кермо: E біля авто → СІСТИ. Їзда — джойстик/WASD вулицями, п\'ятірка в салоні. Вихід з авто = ЗАМОК (прийдеш — відчиниш).</div>';
    h+='<div class="ph-note">🎨 Кольори (₴600) і 🧽 мийка (₴120) — ТЮНІНГ-ГАРАЖ «КЕРМ», поруч з авторинком.</div>';
    if((IB.G.inv.can||0)>0)h+='<div class="ph-note big">⛽ Каністр у багажнику: '+(IB.G.inv.can||0)+' — лиється через E біля авто (+25%)</div>';
  }
  h+='<div class="ph-listtitle">⛽ ЗАПРАВКИ ЧОРНОМОРСЬКА (таксі довезе)</div><div class="ph-dests">';
  for(const d of IB.PHONE_DESTS()){
    if(!/^⛽/.test(d.name))continue;
    const dd=L?IB.M.round(IB.dist(L.x,L.y,d.x,d.y)):0;
    const pr={d_azs_n:0,d_azs_c:1,d_azs_s:2,d_azs_p:3}[d.id]!=null?{d_azs_n:0,d_azs_c:1,d_azs_s:2,d_azs_p:3}[d.id]:0;
    h+='<div class="ph-dest" data-dest="'+d.id+'"><b>'+esc(d.name)+'</b><span>₴'+IB.AZS_PRICE(pr)+'/л • '+dd+' кварт.</span></div>';
  }
  h+='</div>';
  /* нетранспортні адреси авторинку/тюнінгу */
  h+='<div class="ph-listtitle">🚗 АВТО-ЛОКАЦІЇ</div><div class="ph-dests">';
  for(const d of IB.PHONE_DESTS()){
    if(!/^АВТОРИНОК|^ТЮНІНГ/.test(d.name))continue;
    const dd=L?IB.M.round(IB.dist(L.x,L.y,d.x,d.y)):0;
    h+='<div class="ph-dest" data-dest="'+d.id+'"><b>'+esc(d.name)+'</b><span>'+dd+' кварт.</span></div>';
  }
  if(S2.owned&&S2.car){
    const dd=L?IB.M.round(IB.dist(L.x,L.y,S2.car.x,S2.car.y)):0;
    h+='<div class="ph-dest" data-dest="d_mycar"><b>🚗 МОЄ АВТО ('+esc(S2.plate)+')</b><span>'+dd+' кварт. • ⛽ '+IB.M.max(0,IB.M.round(S2.fuel))+'%</span></div>';
  }
  h+='</div><div class="ph-note">Ціни: «Паллада-Нафта» Північ ₴57, Центр ₴56 • «Мазит» Південь ₴55 • «Порт-Сервіс» ₴58. Гасимо зі спільної каси.</div>';
  body.innerHTML=h;
  const byId={};for(const d of IB.PHONE_DESTS())byId[d.id]=d;
  body.querySelectorAll('[data-dest]').forEach(el=>{
    el.onclick=()=>{const d=byId[el.dataset.dest];IB.taxiCall(d);renderApp();};
  });
}
function renderFlat(body){
  IB.initHomes();
  let h='<div class="ph-listtitle">🏘 ЖИТЛО — ЧОРНОМОРСЬК (Віра)</div>';
  if((IB.G.homes||[]).length){
    h+='<div class="ph-note big">ВАШЕ ЖИТЛО (БАЗА):</div>';
    for(const hm of IB.G.homes){
      const rent=hm.rent||(hm.b.apt&&hm.b.apt.rent)||0;
      const left=hm.expDay-IB.G.day;
      const st=hm.mode==='own'?'ВЛАСНІСТЬ':(left<0?'⚠ ПРОСТРОЧЕНА ('+(2+(left))+' дн. грації)':(left<=3?'⚠ до кінця '+left+' дн!':'оренда до дня '+hm.expDay+' (лишилось '+left+' дн.)'));
      h+='<div class="ph-flat own"><b>🏠 '+esc(hm.addr)+(left<=3&&hm.mode==='rent'?' — ПЛАТИ/ВЇЗДЖАЙ':'')+'</b><span>'+st+' • оренда ₴'+rent+'/міс • живуть: '+(hm.occupants.length?hm.occupants.join(', '):'нікого')+'</span>'+
        (hm.mode==='rent'?'<button class="phq" data-fpay="'+IB.G.homes.indexOf(hm)+'">🔑 ОПЛАТИТИ ЩЕ 30 ДН (₴'+rent+')</button><button class="phq" data-fleave="'+IB.G.homes.indexOf(hm)+'">📦 ВИЇХАТИ (склад пропаде)</button>':'')+'</div>';
    }
    h+='<div class="ph-note">🏠 БАЗА = прив’язка до локації: заходим у дім — там ВІДПОЧИНОК, ЇЖА, ГУЛЯНКА, всі герої ЗАРЯДЖАЮТЬСЯ, і там СКЛАД (все що зняли/зібрали). ВИЇЗД = склад пропадає!</div>';
    h+='<button class="phq wide" id="ph-settle">👥 РОЗСЕЛИТИ П\'ЯТЕРКУ (2 в одній, 3 в іншій)</button>';
  }
  h+='<div class="ph-note">Оренда — НА МІСЯЦЬ (30 днів), купівля — назавжди. Ріелтор Віра НАГАДУЄ за 3 дні до кінця. Не оплатив — виселення і склад пропадає.</div><div class="ph-flats">';
  for(const b of IB.flatList()){
    const owned=(IB.G.homes||[]).some(hm=>hm.b===b);
    h+='<div class="ph-flat"><b>📍 '+esc(b.apt.addr)+'</b><span>9 пов. • оренда ₴'+b.apt.rent+'/міс • купити ₴'+b.apt.price+'</span>'+
      (owned?'<i class="ok">Ваше</i>':'<button class="phq" data-rent="'+IB.flatList().indexOf(b)+'">ОРЕНДУВАТИ</button><button class="phq" data-buy="'+IB.flatList().indexOf(b)+'">КУПИТИ</button>')+'</div>';
  }
  h+='</div>';
  body.innerHTML=h;
  const fl=IB.flatList();
  body.querySelectorAll('[data-rent]').forEach(el=>{el.onclick=()=>{IB.flatRent(fl[+el.dataset.rent]);renderApp();};});
  body.querySelectorAll('[data-buy]').forEach(el=>{el.onclick=()=>{IB.flatBuy(fl[+el.dataset.buy]);renderApp();};});
  const st=document.getElementById('ph-settle');
  if(st)st.onclick=()=>{IB.flatSettle();renderApp();};
  body.querySelectorAll('[data-fpay]').forEach(el=>{el.onclick=()=>{IB.flatPay((IB.G.homes||[])[+el.dataset.fpay]);renderApp();};});
  body.querySelectorAll('[data-fleave]').forEach(el=>{el.onclick=()=>{IB.flatLeave((IB.G.homes||[])[+el.dataset.fleave]);};});
}
function renderQuests(body){
  let h='<div class="ph-listtitle">📋 КВЕСТИ ЧОРНОМОРСЬКА</div>';
  const S=IB.SIDEQ||[];
  const cats={work:'🔧 РОБОТА',rest:'🌞 ВІДПОЧИНОК',det:'🕵 ДЕТЕКТИВ',horror:'👻 ЖАХ',gang:'⚔ БАНДИ'};
  /* v9.0: категорії — ПІДПАПКИ, що розкриваються тапом */
  if(!PH._qopen)PH._qopen={work:true};
  let anyCat=false;
  for(const cat in cats){
    const list=S.filter(q=>q.cat===cat);
    if(!list.length)continue;
    anyCat=true;
    const open=!!PH._qopen[cat];
    const doneN=list.filter(q=>{const st=(IB.G.side&&IB.G.side[q.id]);return st&&q.doneState&&q.doneState(st);}).length;
    h+='<div class="ph-qcat'+(open?' on':'')+'" data-qcat="'+cat+'"><b>'+cats[cat]+' — '+list.length+(doneN?' • здано '+doneN:'')+'</b><span class="qc-op">'+(open?'▾':'▸')+'</span></div>';
    if(!open)continue;
    for(const q of list){
      const st=(IB.G.side&&IB.G.side[q.id])||null;
      const solo=q.solo&&IB.E.team&&IB.E.team.length&&!IB.E.team.some(x=>x!==IB.E.team[0]&&x.task!=='beach'&&IB.dist(x.x,x.y,IB.E.team[0].x,IB.E.team[0].y)<12);
      h+='<div class="ph-q '+(st?'on':'')+'"><b>'+esc(q.name)+'</b>'+(q.solo?'<i class="solo">СОЛО</i>':'')+
        '<span>'+esc(st?q.stage(st):(q.desc))+'</span>'+
        (st?(q.doneState&&q.doneState(st)?'<button class="phq" data-qdone="'+q.id+'">ЗДАТИ (₴'+q.pay+')</button>':'<i class="prog">в процесі</i>'):'<button class="phq" data-qtake="'+q.id+'">ВЗЯТИ</button>')+
        '</div>';
    }
  }
  if(!anyCat)h+='<div class="ph-note">Дошка оголошень порожня... поговори з людьми міста!</div>';
  h+='<div class="ph-note">Тапни категорію — розкриєш/згорнеш підпапку.</div>';
  body.innerHTML=h;
  body.querySelectorAll('[data-qcat]').forEach(el=>{el.onclick=()=>{const c=el.dataset.qcat;PH._qopen[c]=!PH._qopen[c];renderQuests(body);};});
  body.querySelectorAll('[data-qtake]').forEach(el=>{el.onclick=()=>{IB.sideTake(el.dataset.qtake);renderApp();};});
  body.querySelectorAll('[data-qdone]').forEach(el=>{el.onclick=()=>{IB.sideFinish(el.dataset.qdone);renderApp();};});
}
/* v18 С1: КАЛЕНДАР ЛІТА — 30 днів, три акти, події тижня */
function renderCalendar(body){
  let h='<div class="ph-listtitle">📅 ЛІТО — 30 ДНІВ • '+IB.actName()+'</div>';
  h+='<div class="cal-desc">'+(IB.actDesc?IB.actDesc():'')+'</div>';
  h+='<div class="cal-grid">';
  for(let d=1;d<=30;d++){
    const a=d<=10?1:(d<=20?2:3);
    const cur=d===IB.G.day?' cur':(d<IB.G.day?' past':'');
    let mark=(d%7===2?'🐟':(d%7===4?'🏀':(d%7===5?'🎬':(d%7===6?'🏪':''))));
    if(d===28)mark='⚓';
    if(d===30)mark='🎆';
    h+='<div class="cal-d a'+a+cur+'">'+d+'<i>'+mark+'</i></div>';
  }
  h+='</div>';
  h+='<div class="ph-hint">⚓ день 28 — СПУСК «ПАЛЛАДИ» • 🎆 день 30 — фінальна вечірка з титрами • 🐟🐟🏀🎬🏪 — події тижня (радіо о 9:00)</div>';
  body.innerHTML=h;
}
/* v18 М5: НАЛАШТУВАННЯ + М6 СЛОТИ ЗБЕРЕЖЕНЬ */
function renderSettings(body){
  const S=IB.SET;
  let h='<div class="ph-listtitle">⚙ НАЛАШТУВАННЯ</div>';
  h+='<div class="prow click" data-set="vol"><span class="nm">🔊 ГУЧНІСТЬ</span><span class="ds">'+Math.round(S.vol*100)+'%</span><span class="ok">±</span></div>';
  h+='<div class="prow click" data-set="scan"><span class="nm">📺 СКАНЛАЙНИ (16-bit)</span><span class="ds">'+(S.scan?'увімк':'вимк')+'</span></div>';
  h+='<div class="prow click" data-set="shake"><span class="nm">📳 ТРЯСІННЯ КАМЕРИ</span><span class="ds">'+(S.shake?'увімк':'вимк')+'</span></div>';
  h+='<div class="prow click" data-set="scheme"><span class="nm">🎨 КОЛІРНА СХЕМА КАНВИ</span><span class="ds">'+S.scheme+'</span></div>';
  h+='<div class="prow click" data-set="chips"><span class="nm">💡 ЧІПИ-ПІДКАЗКИ 1-ГО ДНЯ</span><span class="ds">'+(IB.G.chips&&IB.G.chips.off?'вимк':'увімк')+'</span></div>';
  h+='<div class="ph-listtitle">💾 СЛОТИ ЗБЕРЕЖЕНЬ (автосейв — на зміну дня)</div>';
  for(let i=0;i<3;i++){
    const inf=IB.saveInfo(i);
    h+='<div class="prow click" data-slot="'+i+'"><span class="nm">СЛОТ '+(i+1)+(IB.G.slot===i?' • АКТИВНИЙ':'')+'</span><span class="ds">'+(inf?('день '+inf.day+' • ₴'+inf.money):'порожній — тапнути = ЗБЕРЕГТИ')+'</span><span class="ok">💾</span></div>';
  }
  body.innerHTML=h;
  body.querySelectorAll('[data-set]').forEach(el=>{
    el.onclick=()=>{
      const k=el.dataset.set;
      if(k==='vol'){
        const seq=[1,0.75,0.5,0.25,0];
        S.vol=seq[(seq.indexOf(S.vol)+1)%seq.length];
        IB.AUDIO&&IB.AUDIO.vol&&IB.AUDIO.vol(S.vol*0.5);
        IB.toast('🔊 Гучність: '+Math.round(S.vol*100)+'%','gold');
      }
      if(k==='scan'){S.scan=!S.scan;document.body.classList.toggle('noscan',!S.scan);}
      if(k==='shake'){S.shake=!S.shake;}
      if(k==='chips'){IB.G.chips=IB.G.chips||{};IB.G.chips.off=!IB.G.chips.off;if(!IB.G.chips.off)IB.chipShow&&IB.chipShow();}
      if(k==='scheme'){
        S.scheme=S.scheme==='classic'?'тепла':(S.scheme==='тепла'?'холодна':'classic');
        const cv=document.getElementById('game');
        if(cv){cv.classList.remove('f-warm','f-cold');
          if(S.scheme==='тепла')cv.classList.add('f-warm');
          if(S.scheme==='холодна')cv.classList.add('f-cold');}
      }
      IB.saveSet&&IB.saveSet();
      renderSettings(body);
    };
  });
  body.querySelectorAll('[data-slot]').forEach(el=>{
    el.onclick=()=>{IB.saveGame(+el.dataset.slot);renderSettings(body);};
  });
}
function renderRadio(body){
  let h='<div class="ph-listtitle">📻 РАДІО 103.2 FM — ЧОРНОМОРСЬК</div><div class="ph-radio">';
  for(const r of PH.radioLog.slice(-24).reverse())h+='<div class="ph-msg"><span>'+esc(r)+'</span></div>';
  h+='</div>';
  body.innerHTML=h;
}
function renderContacts(body){
  let h='<div class="ph-listtitle">👥 ЛЮДИ (знайомі)</div><div class="ph-chats">';
  const fr=IB.G.friends||{};
  let any=false;
  for(const nm in fr){
    any=true;
    const f=fr[nm];
    h+='<div class="ph-chatrow" data-fr="'+esc(nm)+'"><span class="ph-av" style="background:#'+((f.lvl||1)*50+100).toString(16).slice(0,2)+'aa60">'+esc(nm[0])+'</span><span class="ph-cn">'+esc(nm)+'</span><span class="ph-cl">дружба '+(f.lvl||1)+'/3 • день '+(f.day||1)+'</span></div>';
  }
  if(!any)h+='<div class="ph-note">Ти ще ні з ким не познайомився. Йди в місто — всі можна контактувати!</div>';
  h+='</div>';
  body.innerHTML=h;
  body.querySelectorAll('[data-fr]').forEach(el=>{el.onclick=()=>{
    const nm=el.dataset.fr;IB.ensureChat('girl_'+nm);PH.chat='girl_'+nm;renderApp();};});
}
/* чат дівчини: швидка кнопка СВІДАННЯ */
IB.phoneGirlChat=(nm)=>{
  IB.ensureChat('girl_'+nm);
  if(!QUICK['girl_'+nm]){
    QUICK['girl_'+nm]=[
      {t:'💗 СВІДАННЯ В КАФЕ «ХВИЛЯ» (₴250)',f:()=>IB.dateStart&&IB.dateStart(nm,'cafe')},
      {t:'🌊 СВІДАННЯ НА ПЛЯЖІ (₴150)',f:()=>IB.dateStart&&IB.dateStart(nm,'beach')},
      {t:'🎧 СВІДАННЯ В КЛУБІ «МАЯК» (₴450)',f:()=>IB.dateStart&&IB.dateStart(nm,'club')},
      {t:'🎡 СВІДАННЯ В ЛУНА-ПАРКУ (₴300)',f:()=>IB.dateStart&&IB.dateStart(nm,'luna')},
    ];
  }
};

/* ---------- СВІДАННЯ (v16: ВИТРАЧАЄШ кошти — не заробляєш) ---------- */
IB.dateStart=(girl,place)=>{
  const cost={cafe:250,beach:150,club:450,luna:300}[place]||200;
  const L=IB.E.team[0];
  if(!IB.payPocket(L.id,cost)){IB.toast('Не хватає ₴'+cost+' на свідання','red');return;}
  const venues={cafe:'кафе «Хвиля»',beach:'пляжі',club:'клубі «Маяк»',luna:'луна-парку'};
  const pts={cafe:{x:216,y:150},beach:IB.beachPoint(),club:{x:322,y:386},luna:{x:136,y:164}};
  IB.toast('💗 Свідання з '+girl+' у '+venues[place]+' (−₴'+cost+')','gold');
  IB.sms('girl_'+girl,girl,'Я на місці! Кажеш, у '+venues[place]+'? Біжу!');
  /* міні-сценарій: 3 вибори → подарунок грошима */
  const qs=[
    {q:'Перше, що кажеш '+girl+'?',a:['Ти сьогодні як сонце','Пішли їсти!','Якість морського бризу — 100%'],best:0},
    {q:'Що замовляєш?',a:['Лимонад для двох','Кавуни і креветки','Все меню'],best:1},
    {q:'Прогулянка — куди?',a:['Сходити поспати','Набережна і маяк','Засмагати мовчки'],best:1},
  ];
  let step=0,score=0;
  /* v16.0: на побаченні НЕ ЗАРОБЛЯЄШ — ВИТРАЧАЄШ КОШТИ.
     Базова витрата вже сплачена (₴'+cost'); сценарій додає витрат:
     гарні відповіді (best) — «ти оплатив тільки своє», слабкі — квітки/
     каруселі/кава, щоб врятувати вечір. Дружба/скіли/репутація — як було. */
  const EXTRA=[[60,50],[140,110],[260,180]]; /* бал 3 → найменше витрат; бал 0 → квітки/каруселі */
  const next=()=>{
    if(step>=qs.length){
      const band=EXTRA[IB.M.max(0,IB.M.min(2,3-score))];   /* 3 бали → дешево */
      const extra=IB.ri(band[1],band[0]);
      if(!IB.payPocket(L.id,extra))IB.payShared(extra); /* v16: додаткові витрати реально списуються */
      const spent=cost+extra;
      IB.tx&&IB.tx(L.name,-extra,'витрати на свіданні ('+girl+')');
      IB.addRep&&IB.addRep('girls',2,'свідання з '+girl);
      IB.heroRep(L,2,'свідання');
      IB.skillXP&&IB.skillXP(L,'charm',8);
      IB.G.stats.dates=(IB.G.stats.dates||0)+1;
      IB.G.stats.dateSpend=(IB.G.stats.dateSpend||0)+spent;
      const f=IB.G.friends[girl]||(IB.G.friends[girl]={lvl:1,met:IB.G.day,day:IB.G.day});
      f.lvl=IB.M.min(3,(f.lvl||1)+1);f.day=IB.G.day;
      /* v18 С6: РОМАНТИЧНА АРКА — три зустрічі → статус «ПАРА».
         Вірне місце за характером дівчини — бонус у арці. */
      const RM=IB.G.romance=IB.G.romance||{};
      const liked=['cafe','beach','club','luna'][girl.length%4];
      const RMG=RM[girl]=RM[girl]||{st:0,lastDay:0};
      RMG.st=Math.min(3,RMG.st+1+((place===liked)?1:0));
      RMG.lastDay=IB.G.day;
      IB.G._dateGirls=(IB.G._dateGirls||[]);
      if(!IB.G._dateGirls.includes(girl))IB.G._dateGirls.push(girl);
      if(RMG.st>=3&&!RMG.sms3){RMG.sms3=true;
        IB.sms('girl_'+girl,girl,'Ми тепер ПАРА 💗 Кожен ранок на морі тепер легший з тобою.');
        IB.toast('💗 '+girl+': статус «ПАРА» — настрій лідера росте сам','gold');
        IB.journalAdd('💗','Романтична арка: '+girl+' — статус «пара» (три зустрічі).');}
      IB.sms('girl_'+girl,girl,'Це було чудово, дякую! Наступного разу мої м\'які вафлі з лиманського кафе — за мій рахунок))');
      IB.toast('💗 Свідання вдалося: разом витрачено ₴'+spent+' (вхід ₴'+cost+' + ₴'+extra+')','gold');
      IB.journalAdd&&IB.journalAdd('💗','Свідання з '+girl+' — витрати ₴'+spent+'.');
      IB.closePhone();
      return;
    }
    const q=qs[step];
    IB.PHONE._dlg={q,step,score,girl,place,next};
    showDateDlg(q,step,(i)=>{if(i===q.best)score++;step++;next();});
  };
  next();
};
function showDateDlg(q,step,cb){
  const el=document.getElementById('ph-dlg');
  if(!el){IB.toast(q.q,'gold');cb(q.best);return;}
  el.classList.remove('hidden');
  el.innerHTML='<div class="pd-q">💗 '+esc(q.q)+'</div><div class="pd-a">'+
    q.a.map((a,i)=>'<button class="phq" data-di="'+i+'">'+esc(a)+'</button>').join('')+'</div>';
  const bs=el.querySelectorAll('[data-di]');
  bs.forEach(b=>{b.onclick=()=>{el.classList.add('hidden');cb(+b.dataset.di);};});
  if(!bs.length)cb(q.best);   /* авто-фолбек (headless/старі переглядачі) */
}

/* ---------- ВІДКРИТТЯ/ЗГОРТАННЯ (v7: смартфон ПРАВОРУЧ) ---------- */
function refreshUI(){
  const pu=document.getElementById('phone-ui');
  if(!pu)return;
  pu.classList.toggle('hidden',!PH.visible);
  pu.classList.toggle('min',!!PH.min);
  const home=document.getElementById('ph-home');
  const app=document.getElementById('ph-app');
  if(PH.app==='home'){home&&home.classList.remove('hidden');app&&app.classList.add('hidden');}
  else{home&&home.classList.add('hidden');app&&app.classList.remove('hidden');}
  updateBadge();
}
/* показати/сховати ВЕСЬ смартфон (старт гри / меню / інтер'єр) */
IB.phoneShow=(v)=>{
  PH.visible=!!v;
  if(v){PH.min=false;PH.open=true;}   /* v7.0: на старті гри смартфон РОЗГОРТУЄТЬСЯ */
  refreshUI();
};
/* P / ☎ — згорнути ↔ розгорнути */
IB.togglePhone=()=>{
  if(!PH.visible)return;
  if(PH.min){PH.min=false;PH.open=true;IB.toast('📱 ТЕЛЕФОН: карта і 20 додатків','gold');}
  else{PH.min=true;PH.open=false;IB.toast('📱 Телефон згорнуто — кнопка 📱 справа вгорі / P','gold');}
  refreshUI();
  IB.SFX&&IB.SFX.ui&&IB.SFX.ui();
};
/* відкрити телефон (можна одразу на додатку) */
IB.openPhone=(app)=>{
  PH.visible=true;PH.min=false;PH.open=true;
  PH.app=app||'home';
  PH.folder=PH.app==='home'?null:(folderOfApp(PH.app)||{}).id||null;
  if(app==='sms'){PH.unread=0;}
  refreshUI();renderApp();
};
/* перейти на додаток у відкритому телефони (назад веде у його папку) */
IB.openPhoneApp=(app)=>{
  PH.visible=true;PH.min=false;PH.open=true;
  PH.app=APPS.some(a=>a.id===app)?app:'home';
  PH.folder=PH.app==='home'?null:(folderOfApp(PH.app)||{}).id||null;
  if(app==='sms')PH.unread=0;
  refreshUI();renderApp();
};
/* «закрити» = згорнути у панель справа (дії типу goWalk/dateStart) */
IB.closePhone=()=>{
  PH.min=true;PH.open=false;
  refreshUI();
};
IB.phoneTickUI=()=>{
  if(!IB.G||IB.G.mode!=='game')return;
  const c=document.getElementById('ph-clock');
  if(c){
    const hh=IB.M.floor(IB.G.t)%24,mm=IB.M.floor((IB.G.t%1)*60);
    c.textContent=(hh<10?'0':'')+hh+':'+(mm<10?'0':'')+mm;
  }
  const bat=document.getElementById('ph-bat');
  if(bat){
    const lvl=IB.M.max(12,IB.M.round(100-(IB.G.t/24)*85));
    bat.textContent='🔋'+lvl+'%';
  }
};

/* ---------- КНОПКИ ПАНЕЛІ ---------- */
IB.bindPhoneUI=()=>{
  /* швидка карта у дії */
  const am=document.getElementById('ph-act-map');
  if(am)am.onclick=()=>IB.openPhoneApp('map');
  /* v8.0: іконки героїв у шапці (зліва) → v10: ПОПОВЕР героя — ІНФО І ВИБІР
     (грати за нього / скіли / СМС) прямо на іконці, без телефона */
  if(document.querySelectorAll)document.querySelectorAll('#hud-strip .hchip').forEach(el=>{
    el.onclick=(e)=>{e.stopPropagation();IB.heroPop&&IB.heroPop(+el.dataset.h||0);};
  });
  /* клік поза поповером — закрити */
  document.addEventListener('pointerdown',(e)=>{
    const pop=document.getElementById('hero-pop');
    if(!pop||pop.classList.contains('hidden'))return;
    if(e.target.closest&&e.target.closest('#hero-pop'))return;
    if(e.target.closest&&e.target.closest('#hud-strip .hchip'))return;
    pop.classList.add('hidden');
  });
  /* v9.0: ДОК і будь-які [data-app] у телефона — клік = додаток (раніше док не біндився) */
  const pu=document.getElementById('phone-ui');
  if(pu)pu.querySelectorAll('#ph-dock .phapp[data-app]').forEach(el=>{
    el.onclick=(e)=>{e.stopPropagation();IB.openPhoneApp(el.dataset.app);};
  });
  /* v9.0: кнопка «◄ ПАПКА» у шапці додатка — назад у свою папку */
  const bk=document.getElementById('ph-back');
  if(bk)bk.onclick=()=>{PH.app='home';renderApp();};
  /* v8.0: панель 🗺 КАРТА — v11: СПЛИВАЮЧЕ ВІКНО по центру екрана —
     тап по пункту → ПІШКИ / ТАКСІ; ✖ у шапці закриває вікно */
  const mpc=document.getElementById('mp-canvas');
  if(mpc)mpc.onclick=(ev)=>{
    const r=mpc.getBoundingClientRect();
    const mx=(ev.clientX-r.left)/r.width*IB.W.W,my=(ev.clientY-r.top)/r.height*IB.W.H;
    let best=null,bd=1e9;
    for(const d of IB.PHONE_DESTS()){const dd=IB.dist(mx,my,d.x,d.y);if(dd<bd){bd=dd;best=d;}}
    if(best&&bd<20){
      const sel=document.getElementById('mp-sel'),nm=document.getElementById('mp-sname');
      if(nm)nm.textContent='📍 '+best.name+' — '+IB.M.max(60,IB.M.round(IB.dist(IB.E.team[0].x,IB.E.team[0].y,best.x,best.y)*2.2))+'₴ таксі';
      if(sel){sel.classList.remove('hidden');
        const w=document.getElementById('mp-walk'),t=document.getElementById('mp-taxi'),x=document.getElementById('mp-sel-x');
        if(w)w.onclick=()=>{IB.goWalk(best);sel.classList.add('hidden');};
        if(t)t.onclick=()=>{IB.taxiCall(best);sel.classList.add('hidden');};
        if(x)x.onclick=()=>sel.classList.add('hidden');
      }
      IB.toast&&IB.toast('🗺 '+best.name+' — ПІШКИ або ТАКСІ','gold');
    }
  };
  /* v11: ✖ у шапці карти-вікна — закрити; v17.0: мінімапу прибрано (є кнопка 🧭 КАРТА) */
  const mpx=document.getElementById('mp-x');
  if(mpx)mpx.onclick=()=>IB.toggleMapPanel&&IB.toggleMapPanel(false);
  /* навбар */
  const hb=document.getElementById('ph-homebtn');
  if(hb)hb.onclick=()=>{PH.app='home';PH.folder=null;renderApp();refreshUI();};
  const xb=document.getElementById('ph-x');
  if(xb)xb.onclick=()=>IB.togglePhone();
  const mn=document.getElementById('ph-min');
  if(mn)mn.onclick=()=>IB.togglePhone();
  /* v11-фІКС: клік по ▾ ЗГОРН (#ph-x) бульбашками доходив до #phone-ui і
     розгортав телефон назад (подвійний togglePhone) — пігулка ☎ ніколи не
     з'являлась. Тепер клік з дока/топбара НЕ обробляється контейнером. */
  if(pu)pu.onclick=(e)=>{
    if(e.target.closest&&(e.target.closest('#ph-dock')||e.target.closest('#ph-topbar')))return;
    if(!PH.min)return;
    if(e.target.closest&&e.target.closest('#ph-tab')){IB.togglePhone();return;}
    IB.togglePhone();
  };
  const tab=document.getElementById('ph-tab');
  if(tab)tab.onclick=(e)=>{e.stopPropagation();IB.togglePhone();};
  /* (v8.0: міні-карту домашнього екрана прибрано — мапа живе панеллю вище) */
  PH.ready=true;
  /* чат групи за замовчуванням (v10: + чати всіх героїв) */
  ensureChat('team');
  ensureChat('taxi');
  ensureChat('vera');
  ensureChat('si');
  ensureChat('ni');
  for(const h of (IB.E&&IB.E.team?IB.E.team:[]))ensureChat(h.id);
  refreshUI();
  renderApp();   /* v7.0: домашній екран (карта + сітка додатків) одразу */
};

})();

/* ==================== v18 М5: ЗАСТОСУВАТИ НАЛАШТУВАННЯ НА СТАРТІ ==================== */
(function(){
  const S=IB.SET||{};
  if(S.scan===false)document.body.classList.add('noscan');
  const cv=document.getElementById('game');
  if(cv){
    if(S.scheme==='тепла')cv.classList.add('f-warm');
    if(S.scheme==='холодна')cv.classList.add('f-cold');
  }
  if(IB.AUDIO&&IB.AUDIO.vol&&typeof S.vol==='number'&&S.vol!==1)IB.AUDIO.vol(S.vol*0.5);
})();
