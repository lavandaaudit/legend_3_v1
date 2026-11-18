/* ILEGEND 3 — MORE MORE — quests5.js v5.0 «МІСТО-ТЕЛЕФОН»
   БОЧКА КВЕСТІВ У ТЕЛЕФОНІ: РОБОТА (курʼєр, вантажник, водій таксі,
   будівник, мийник), ВІДПОЧИНОК (волейбол, перегони, караоке, пікнік,
   чистий пляж, серцеїд), ДЕТЕКТИВ (кот, скутер, контейнер ночрю,
   фальшиве пиво), ЖАХ (маяк о 3:00, корабель-примара, підвал Бронксу,
   дзвінок 3:33, сирени зі моря). Соло-квести — інші відпочивають на
   пляжі; нагороди — у КИШЕНЮ лідера. СМС ведуть квест. */
(function(){
const M=IB.M;

IB.G.side=IB.G.side||{};
IB.G.horror=IB.G.horror||{t:0,chase:null};

function side(id){return IB.G.side[id];}
function setSide(id,dat){IB.G.side[id]=Object.assign({t:0,step:0},dat||{});}

/* ---------- ЦІЛІ (ходьба до точки = прогрес) ---------- */
IB._sideTargets=[];
function target(x,y,name,cb){return {x,y,name,cb};}

IB.SIDEQ=[
/* ============================ РОБОТА ============================ */
{id:'w_courier',cat:'work',name:'КУРʼЄР — 5 ПАКЕТІВ ПО МІСТУ',pay:320,solo:false,
 desc:'Юра з Укрпошти: розвезти 5 пакетів по місту. Кожен — адреса у СМС. Ходи пішки або маршруткою №7!',
 stage:st=>st.left>0?('Пакетів лишилось: '+st.left+'. Адреса: '+(st.tgt?st.tgt.name:'—')+' (дійди і зачекай близько)'):'УСІ ДОСТАВЛЕНІ — здай роботу Юрі (телефон)',
 doneState:st=>st.left<=0,
 take(){const t=this.nextTarget();setSide('w_courier',{left:5,tgt:t});
   IB.sms('yura','Юра (пошта)','Пакетів 5. Перший: '+t.name+'. Дійди туди — віддаш адресату. Маршрутка №7 у телефона!');},
 nextTarget(){const ds=IB.PHONE_DESTS();const d=ds[IB.ri(0,ds.length-1)];return {x:d.x,y:d.y,name:d.name};},
 tick(dt){const st=side('w_courier');if(!st||st.left<=0||!st.tgt)return;
   const L=IB.E.team[0];
   if(IB.dist(L.x,L.y,st.tgt.x,st.tgt.y)<2.5){
     st.left--;IB.toast('📦 Пакет доставлено! (лишилось '+st.left+')','gold');
     IB.sms('yura','Юра (пошта)','Чудово! Наступний: '+(st.left>0?(st.tgt=this.nextTarget()).name:'усі! Заходь за оплатою'));
     st.tgt=st.left>0?this.nextTarget():null;}}
},
{id:'w_loader',cat:'work',name:'ВАНТАЖНИК ПОРТУ — ЗМІНА',pay:180,solo:false,
 desc:'Петро з порту: зміна на контейнерах. Стій у порту 60 ігрових хвилин — платня одразу.',
 stage:st=>'Зміна: '+IB.M.round(st.t*10)+'% ( будь у ПОРТІ — крани і контейнери )',
 doneState:st=>st.t>=10,
 take(){setSide('w_loader',{t:0});IB.sms('petro','Петро (порт)','Зміна прийнята! Контейнери — східне плечу. ₴180 в кінці.');},
 tick(dt){const st=side('w_loader');if(!st)return;const L=IB.E.team[0];
   const z=IB.W.PORT;
   if(L.x>=z.x&&L.x<z.x+z.w&&L.y>=z.y&&L.y<z.y+z.h)st.t+=dt;
   else st.t=IB.M.max(0,st.t-dt*0.5);}
},
{id:'w_taxi',cat:'work',name:'ВОДІЙ ТАКСІ — 3 ЗАМОВЛЕННЯ',pay:270,solo:true,
 desc:'Соло. Богдан пішов у відпустку — тебе просять поганяти клієнтів. 3 замовлення по місту.',
 stage:st=>st.left>0?('Клієнтів: '+st.left+'. Йди до: '+(st.tgt?st.tgt.name:'—')):'УСІ КЛІЄНТИ — здай зміну у вкладці КВЕСТИ',
 doneState:st=>st.left<=0,
 take(){setSide('w_taxi',{left:3,tgt:this.next()});
   IB.sms('taxi','ТАКСІ «ЧОРНОМОРЕЦЬ»','Ти сьогодні за водія! Клієнт чекає: '+(side('w_taxi').tgt?side('w_taxi').tgt.name:''));},
 next(){const ds=IB.PHONE_DESTS();const d=ds[IB.ri(0,ds.length-1)];return {x:d.x,y:d.y,name:d.name};},
 tick(dt){const st=side('w_taxi');if(!st||st.left<=0||!st.tgt)return;
   const L=IB.E.team[0];
   if(IB.dist(L.x,L.y,st.tgt.x,st.tgt.y)<2.5){
     st.left--;L.pocket=(L.pocket||0)+90;IB.toast('🚕 Клієнт довезений: +₴90 у кишеню','gold');
     st.tgt=st.left>0?this.next():null;
     if(st.tgt)IB.sms('taxi','ТАКСІ «ЧОРНОМОРЕЦЬ»','Нове замовлення: '+st.tgt.name);}}
},
{id:'w_builder',cat:'work',name:'БУДІВНИК — ДОСТАВКА ДОСОК',pay:220,solo:false,
 desc:'Клуб «Маяк» добудовує літню терасу: принеси 3 деревини у клуб.',
 stage:st=>st.built?('Тераса майже готова — здай у клубі'):'Принеси 3 деревини (wood ×'+(IB.G.inv.wood||0)+'/3) в КЛУБ «МАЯК»',
 doneState:st=>st.built,
 take(){setSide('w_builder',{built:false});IB.sms('ivero','діджей Іверо','Тераса сама себе не побудує! 3 доси — і ти легенда танцполу.');},
 tick(dt){const st=side('w_builder');if(!st||st.built)return;const L=IB.E.team[0];
   if(IB.dist(L.x,L.y,322,386)<3&&(IB.G.inv.wood||0)>=3){IB.G.inv.wood-=3;st.built=true;
     IB.toast('🔨 Доси здані — тераса клуба готова!','gold');
     IB.sms('ivero','діджей Іверо','Ти красень! Заходь на безкоштовний кокос');}}
},
{id:'w_wash',cat:'work',name:'МИЙНИК АВТО — 3 МАШИНИ',pay:150,solo:false,
 desc:'На автостанції миють машини по 50. Постій 3 рази біля автобази.',
 stage:st=>'Машин вимито: '+(3-(st.left||3))+'/3 (будь біля АВТОСТАНЦІЇ 8 сек кожна)',
 doneState:st=>st.left<=0,
 take(){setSide('w_wash',{left:3,t:0});IB.sms('taxi','ТАКСІ «ЧОРНОМОРЕЦЬ»','Богдан заказав мийку для 3 машин. База — автостанція.');},
 tick(dt){const st=side('w_wash');if(!st||st.left<=0)return;const L=IB.E.team[0];
   if(IB.dist(L.x,L.y,210,26)<4){st.t+=dt;
     if(st.t>8){st.t=0;st.left--;IB.toast('🧼 Машина сяє! (лишилось '+st.left+')','gold');}}
   else st.t=0;}
},
/* ========================== ВІДПОЧИНОК ========================== */
{id:'r_volley',cat:'rest',name:'ВОЛЕЙБОЛЬНИЙ ТУРНІР ПЛЯЖУ',pay:300,solo:false,
 desc:'Перемоги у волейболі ×3 (сітки на пляжі). Команда — це ти і хлопці.',
 stage:st=>'Перемог: '+IB.M.min(3,IB.G.stats.volley||0)+'/3 (грай у волейбол на сітках)',
 doneState:()=>(IB.G.stats.volley||0)>=3,
 take(){setSide('r_volley',{start:IB.G.stats.volley||0});IB.sms('team','П\'ЯТЕРКА','Турнір! Сітки на пляжі — п\'ятірка проти місцевих.');},
 tick(){}},
{id:'r_catam',cat:'rest',name:'ПЕРЕГОНИ КАТАМАРАНІВ ДО БУЯ',pay:250,solo:false,
 desc:'Катамаран напрокат і рандеву зі східним буєм. Дельфіни супроводжують.',
 stage:st=>st.hit?'ФІНІШ — здавай':'Допливи до східного буя на катамарані (T — морські розваги)',
 doneState:st=>st.hit,
 take(){setSide('r_catam',{hit:false});IB.sms('team','П\'ЯТЕРКА','Перегони! Хто перший до буя — той король пляжу.');},
 tick(dt){const st=side('r_catam');if(!st||st.hit)return;const L=IB.E.team[0];
   if(IB.W.at(L.x,L.y)===0&&IB.dist(L.x,L.y,318,473)<6){st.hit=true;IB.toast('⛵ ФІНІШ! Перегони пройдені','gold');}}},
{id:'r_karaoke',cat:'rest',name:'КАРАОКЕ У КЛУБІ «МАЯК»',pay:150,solo:false,
 desc:'Танцпол ×3 за вечір — діджей Іверо передає привіт.',
 stage:st=>'Танцювальних сетів: '+IB.M.min(3,IB.G.stats.dances||0)+'/3 (танцпол у клубі)',
 doneState:()=>(IB.G.stats.dances||0)>=3,
 take(){setSide('r_karaoke',{});IB.sms('ivero','діджей Іверо','Мікрофон твій. Три сети — і ти гість вечора.');},
 tick(){}},
{id:'r_picnic',cat:'rest',name:'ПІКНІК НА СУХОМУ ЛИМАНІ',pay:200,solo:false,
 desc:'Збери щонайменше 2х друзів на мосту через лиман — гулянка з видом на баржі.',
 stage:st=>st.done?'ПІКНІК ВДАВСЯ — здавай':'Приведи 3 героїв на МІСТ через лиман (СМС: ЗУСТРІЧ)',
 doneState:st=>st.done,
 take(){setSide('r_picnic',{done:false});
   IB.teamMeet({x:390,y:293,name:'міст через лиман'});
   IB.sms('si','дядя Сі','На лимані вітер свіжий. Шашлик брать? Каже — брать!');},
 tick(dt){const st=side('r_picnic');if(!st||st.done)return;const L=IB.E.team[0];
   let n=0;for(const h of IB.E.team)if(IB.dist(h.x,h.y,390,293)<5)n++;
   if(n>=3){st.done=true;IB.toast('🧺 Пікнік на лимані! Уся п\'ятірка зібралась','gold');}}},
{id:'r_beachclean',cat:'rest',name:'ЧИСТИЙ ПЛЯЖ — 10 ПАКЕТІВ',pay:120,solo:false,
 desc:'Сміття з піску → бак. Еко-дубай відпочиваючих.',
 stage:st=>'Зібрано: '+IB.M.min(10,(IB.G.stats.trash||0)-(st.start||0))+'/10',
 doneState:st=>((IB.G.stats.trash||0)-(st.start||0))>=10,
 take(){setSide('r_beachclean',{start:IB.G.stats.trash||0});
   IB.sms('ni','тітка Ні','Пляж — наш дім. Прибери, легендарний, і лимонад за мій рахунок.');},
 tick(){}},
{id:'r_dates',cat:'rest',name:'СЕРЦЕЇД — 3 СВІДАННЯ',pay:500,solo:true,
 desc:'Соло. Три вдалі свідання з дівчатами курорту — і балакучий друг порта заздрить.',
 stage:st=>'Свідань: '+IB.M.min(3,IB.G.stats.dates||0)+'/3 (чат дівчини → 💗 СВІДАННЯ)',
 doneState:()=>(IB.G.stats.dates||0)>=3,
 take(){setSide('r_dates',{});IB.sms('taxi','ТАКСІ «ЧОРНОМОРЕЦЬ»','Для свідань — знижка 10%. Ну, майже знижка.');},
 tick(){}},
/* ========================== ДЕТЕКТИВ ========================== */
{id:'d_cat',cat:'det',name:'ДЕТЕКТИВ: КОТ БАРСИК ЗНИК',pay:400,solo:true,
 desc:'Соло. У дворника Миті зник рудий кот. Три підказки по місту — і барсик знайдеться.',
 stage:st=>{
   if(st.found)return 'БАРСИК ЗНАЙДЕНИЙ! Здай справу';
   if(st.clues>=3)return 'Усі свідчення є! Кіт — у МОЛОДІЖНОМУ ПАРКУ (стежка паровозика)';
   return 'Свідчення: '+st.clues+'/3 (Митя на Північному → Зіна на ринку → Галя на годівниці)';},
 doneState:st=>st.found,
 take(){setSide('d_cat',{clues:0,found:false,idx:0,tgt:{x:33,y:64,name:'дворник Митя'}});
   IB.sms('galagan','детектив Галаган','Справа №12: зник кот Барсик. Свідки: дворник Митя, продавчиня Зіна, стара Галя. Починай з Миті.');},
 tick(dt){const st=side('d_cat');if(!st||st.found)return;const L=IB.E.team[0];
   if(st.idx===0&&IB.dist(L.x,L.y,33,64)<3){st.idx=1;st.clues=1;st.tgt={x:100,y:64,name:'Зіна (ринок)'};
     IB.sms('galagan','детектив Галаган','Митя: «Барсик біг до РИНКУ, там ковбаски»');}
   else if(st.idx===1&&IB.dist(L.x,L.y,100,64)<3){st.idx=2;st.clues=2;st.tgt={x:120,y:435,name:'Галя (годівниця чайок)'};
     IB.sms('galagan','детектив Галаган','Зіна: «Він біг на НАБЕРЕЖНУ, годувальниця його підгодовувала»');}
   else if(st.idx===2&&IB.dist(L.x,L.y,120,435)<3){st.clues=3;
     IB.sms('galagan','детектив Галаган','Галя: «Він живе в МОЛОДІЖНОМУ ПАРКУ, біля паровозика. Він домашній!»');
     IB.toast('🐾 Слід веде до Молодіжного парку!','gold');st.idx=3;}
   else if(st.idx===3&&IB.dist(L.x,L.y,44,95)<4){st.found=true;
     IB.G.horror={t:0};IB.toast('🐱 БАРСИК ЗНАЙДЕНИЙ! Мурчить і їде додому в кошику','gold');
     IB.sms('galagan','детектив Галаган','Справа №12 закрита. Місто спить спокійно.');}}},
{id:'d_scooter',cat:'det',name:'ДЕТЕКТИВ: ХТО УКРАВ СКУТЕР',pay:600,solo:true,
 desc:'Соло. У касирки Тамари поцупили скутер. Три допроси — і звинувати справжнього.',
 stage:st=>st.accused?(st.right?'СКУТЕР ЗНАЙДЕНО — здавай':'Звинувачення помилкове... спробуй здати і перевірити ще'):'Допроси: Тамара (кінотеатр) → механік (Качалка «Атлет») → охоронець (порт). Потім звинувать через СМС детективу',
 doneState:st=>st.accused&&st.right,
 take(){setSide('d_scooter',{idx:0,accused:false,right:false});IB.sms('galagan','детектив Галаган','Скутер зник біля «МОРЕ-ФІЛЬМ». Допроси Тамару, механіка з качалки і портового охоронця.');},
 tick(dt){const st=side('d_scooter');if(!st||st.accused)return;const L=IB.E.team[0];
   if(st.idx===0&&IB.dist(L.x,L.y,236,158)<3){st.idx=1;IB.sms('galagan','детектив Галаган','Тамара: «Бачила банду Бронксових біля качалки»');}
   else if(st.idx===1&&IB.dist(L.x,L.y,80,237)<3){st.idx=2;IB.sms('galagan','детектив Галаган','Механік: «Скутер уже у ПОРТОВИХ — Гопник Толя катався на молі»');}
   else if(st.idx===2&&IB.dist(L.x,L.y,364,308)<3){st.idx=3;
     IB.toast('🕵 Усі свідчення зібрано. Здай справу і звинувать ГОПНИКА ТОЛЮ','gold');}}},
{id:'d_port',cat:'det',name:'ДЕТЕКТИВ: КОНТЕЙНЕР ПОРТУ (НИЧ)',pay:800,solo:true,
 desc:'Соло. Нічний порт: контейнери завантажують у темряві без документів. Зроби фото з пронумерованих коробок.',
 stage:st=>st.done?'ФОТО В ДЕТЕКТИВА — здавай':'Вночі (22:00–05:00) будь біля контейнерних стійок ПОРТУ',
 doneState:st=>st.done,
 take(){setSide('d_port',{done:false});IB.sms('galagan','детектив Галаган','Нічне завантаження без паперів — тільки з понеділка по п\'ятницю. Акт — на тебя.');},
 tick(dt){const st=side('d_port');if(!st||st.done)return;const L=IB.E.team[0];const h=IB.hStr();
   if(h>=22||h<5){if(IB.dist(L.x,L.y,376,372)<5){st.done=true;
     IB.G.horror={t:1.2};IB.toast('📸 ЗНЯТО: контейнери без пломб. Хтось свиснув у темряві...','gold');
     IB.sms('galagan','детектив Галаган','Кадри — золоті. Дякую, п\'ятірка.');}}}},
{id:'d_beer',cat:'det',name:'ДЕТЕКТИВ: ФАЛЬШИВЕ ПИВО',pay:500,solo:false,
 desc:'Дядько Сі каже: у місті фальшиве пиво. Перевір 3 бари: Бронкс-бар, «Пірат», кіоск порту.',
 stage:st=>'Перевірено барів: '+st.checked+'/3 (Бронкс-бар → «Пірат» → ПОРТОВИЙ КІОСК). Потім здай',
 doneState:st=>st.checked>=3,
 take(){setSide('d_beer',{checked:0});
   IB.sms('si','дядя Сі','Смак у фальшивки — як у лиману після дощу. Перевір усі три точки, не хмелій одразу!');},
 tick(dt){const st=side('d_beer');if(!st)return;const L=IB.E.team[0];
   const bars=[[172,258],[300,150],[388,388]];
   for(const b of bars){
     if(IB.dist(L.x,L.y,b[0],b[1])<2.5&&!st['b'+b.join('_')]){st['b'+b.join('_')]=true;st.checked++;
       IB.toast('🍺 Проба взята ('+st.checked+'/3)','gold');
       if(st.checked>=3)IB.sms('si','дядя Сі','Привози проби! Відчую носом, де сурогат.');}}}},
/* ============================ ЖАХ ============================ */
{id:'h_lighthouse',cat:'horror',name:'ЖАХ: МАЯК О 3:00',pay:700,solo:true,
 desc:'Соло. О 3:00 ночі на маяку хтось СВІТИТЬ, хоча маяк закритий 30 років. Йди на мол.',
 stage:st=>st.done?(st.brave?'Ти дивився у світло... і вижив. Здай':'Ти втік — розумно. Здай'):'Вночі (02:00–04:00) будь на МОЛІ біля МАЯКА',
 doneState:st=>st.done,
 take(){setSide('h_lighthouse',{done:false,brave:false});IB.sms('galagan','детектив Галаган','Про маяк говорять рибалки. О 3:00 — промінь. Ніхто не повертався... самоти до розслідування.');},
 tick(dt){const st=side('h_lighthouse');if(!st||st.done)return;const L=IB.E.team[0];const h=IB.hStr();
   if((h>=2&&h<4)&&IB.dist(L.x,L.y,422,486)<5){
     IB.G.horror={t:3};IB.GFX.shake=0.6;
     IB.showScene('🗼','МАЯК О 3:00','Промінь миттєво гасне. Двері вежі скриплять НАЗАВЕНЬ, хоч вітру немає. На сходах — мокрі відбитки БОСИХ НІГ, що ведуть ВГОРУ. Щось бризнуло у фікель...');
     st.done=true;st.brave=true;L.mood=IB.clamp(L.mood-IB.ri(10,20),0,100);
     IB.sms('galagan','детектив Галаган','Ти повернувся?! У майстрові з 1977-го теж був фікель... Приходь за оплатою — і не повертайся туди один.');}}},
{id:'h_ghost',cat:'horror',name:'ЖАХ: КОРАБЛЬ-ПРИМАРА ЛИМАНУ',pay:800,solo:true,
 desc:'Соло. О півночі над Сухим лиманом виринає силует суховоза «Ленінград»-1983. Йди на міст і НЕ ВТІКАЙ занадто рано...',
 stage:st=>st.done?(st.survived?'ВИЖИВ І ЗНЯВ ПРИМАРУ — здавай':'ВОНА ТЕБЕ ДІСТАЛА... але ти живий. Здай'):'О 00:00–02:00 будь на МІСТІ через СУХИЙ ЛИМАН',
 doneState:st=>st.done,
 take(){setSide('h_ghost',{done:false,survived:false});IB.sms('si','дядя Сі','Коли я ходив моряком, «Ленінград» затонув на рейді. Чув, він ХОДИТЬ по лиману в тихі ночі. Не вер тому, що бачиш.');},
 tick(dt){const st=side('h_ghost');if(!st||st.done)return;const L=IB.E.team[0];const h=IB.hStr();
   if(!st.active&&(h>=0&&h<2)&&IB.dist(L.x,L.y,390,293)<6){
     st.active=true;st.t=12;IB.G.horror={t:4};IB.GFX.shake=0.8;
     IB.showScene('👻','ПРИМАРА «ЛЕНІНГРАДА»','З води лиману піднімається силует суховоза. Вранги — без екіпажу. Хтось на містку махає тобою РУКОЮ. У тебя 12 секунд — відійди від моста АБО залишись і дивись до кінця.');
   }
   if(st.active){st.t-=dt;
     if(IB.dist(L.x,L.y,390,293)>10){st.done=true;st.survived=true;st.active=false;
       IB.toast('🏃 Ти відійшов. Примара розтанула у тумані лиману','gold');}
     else if(st.t<=0){st.done=true;st.survived=true;st.active=false;L.pocket=(L.pocket||0)+150;
       IB.toast('👁 Ти ДИВИВСЯ до кінця. У кишені — старий рубль з борта... (+₴150)','gold');}}}},
{id:'h_bronx',cat:'horror',name:'ЖАХ: ПІДВАЛ БРОНКСУ',pay:600,solo:true,
 desc:'Соло. У дворі Бронксу люк, який відкривається САМ. Знизу чують покидьки печені картоплі... і НЕ кроки.',
 stage:st=>st.done?'Ти знав, що не треба було. Здавай':'Вночі (01:00–04:00) будь у дворі БРОНКСУ біля люка',
 doneState:st=>st.done,
 take(){setSide('h_bronx',{done:false});IB.sms('ni','тітка Ні','Мій двоюрідний жив у Бронксі. Каже, в підвалі ЗАПАХНЕ картоплею — то ВОН ВИХОДИТЬ. Тікай одразу!');},
 tick(dt){const st=side('h_bronx');if(!st||st.done)return;const L=IB.E.team[0];const h=IB.hStr();
   if((h>=1&&h<4)&&IB.dist(L.x,L.y,262,384)<4){
     IB.G.horror={t:2.5};IB.GFX.shake=0.7;
     IB.showScene('🕳','ПІДВАЛ БРОНКСУ','Люк відкрився сам. Знизу — запах печеної картоплі... і ДИХАННЯ. Щось ПОВЗЕ ВГОРУ. Біжи, ЛЕГЕНДА!');
     st.done=true;L.mood=IB.clamp(L.mood-IB.ri(12,22),0,100);
     IB.sms('ni','тітка Ні','Я ЖЕ КАЗАЛА! Підвал закрили бетоном у 2009-му. Тримайся подалі.');}}},
{id:'h_call',cat:'horror',name:'ЖАХ: ДЗВІНОК О 3:33',pay:500,solo:true,
 desc:'Соло. О 3:33 телефонує номер без цифр. Голос: «СТАРА ДЕПО. ВОКЗАЛ. ПРИХОДИ ОДИН». Йди, якщо наважишся.',
 stage:st=>st.done?(st.went?'Ти був у депо. Вижив. Здавай':'Ти не пішов — премудро. Здавай'):st.called?'Йди до СТАРОГО ДЕПО (схід вокзалу) ніч':'ЧЕКАЙ ДЗВІНКА О 3:33 (будь просто у місті ніч)',
 doneState:st=>st.done,
 take(){setSide('h_call',{done:false,called:false,went:false});IB.sms('galagan','детектив Галаган','Рятувальники згадують дзвінки о 3:33. Номер — НУЛЬ цифр. Приймай виклик, якщо насмілишся.');},
 tick(dt){const st=side('h_call');if(!st||st.done)return;const L=IB.E.team[0];const h=IB.hStr();
   if(!st.called&&h===3&&IB.M.floor(IB.G.t%1*60)===33&&IB.M.floor(IB.G.t)%24===3){
     st.called=true;IB.G.horror={t:1.5};
     IB.sms('galagan','детектив Галаган','⚠ ТЕБЕ ВИКЛИКАЮТЬ: «СТАРА ДЕПО. ВОКЗАЛ. ОДИН.» — 3:33');
     IB.toast('📞 ДЗВІНОК О 3:33... голос без номера: «СТАРА ДЕПО»','red');}
   if(st.called&&!(IB.hStr()>=6&&IB.hStr()<22)&&IB.dist(L.x,L.y,50,40)<5){
     st.went=true;st.done=true;IB.G.horror={t:3};IB.GFX.shake=0.8;
     IB.showScene('🚂','СТАРЕ ДЕПО','Вагон без коліс. Всередині — П\'ЯТЬ гасових ліхтарів. Хтось залишив на лавці НОВУ КУРТКУ З ТВОИМ ІМ\'ЯМ. Вітраж у стіні: «ВОНИ НЕ ПОВЕРНУЛИСЯ З ОДЕСИ».');
     L.mood=IB.clamp(L.mood-IB.ri(15,25),0,100);}}},
{id:'h_sirens',cat:'horror',name:'ЖАХ: СИРЕНИ З МОРЯ',pay:700,solo:true,
 desc:'Соло. У ШТОРМ з глибини чують сирени — спів матросів «Паллади». Вийди на кінець ПІРСА під грозу.',
 stage:st=>st.done?'Ти слухав сирен і залишився. Здавай':'Під ШТОРМ будь на КІНЦІ ПІРСА «ЗАХІД СОНЦЯ»',
 doneState:st=>st.done,
 take(){setSide('h_sirens',{done:false});IB.sms('si','дядя Сі','В шторм не ходи на пірс! А якщо ходиш — слухай. І не підспівуй. НІКОЛИ не підспівуй.');},
 tick(dt){const st=side('h_sirens');if(!st||st.done)return;const L=IB.E.team[0];
   const wx=IB.WX&&IB.WX.type;
   if((wx==='storm'||wx==='thunder')&&IB.dist(L.x,L.y,179,478)<5){
     st.done=true;IB.G.horror={t:3.5};IB.GFX.shake=0.9;
     IB.showScene('🌊','СИРЕНИ З МОРЯ','Хвиля ПІДНІМАЄТЬСЯ вертикально. У піні — голоси: «Паллада» везла моряків і НЕ ДОВЕЗЛА. Спів наближається... Ти НЕ ПІДСПІВАЄШ — і море опускається.');
     L.mood=IB.clamp(L.mood-IB.ri(8,18),0,100);L.hp=IB.clamp(L.hp+5,0,100);}}},
/* ================= v6.0: БАНДИ / НОВІ РОБОТИ / ДЕТЕКТИВ ================= */
{id:'g_tribute',cat:'gang',name:'⚔ ДАНИНА З КРАМНИЦЬ (для своєї банди)',pay:260,solo:false,
 desc:'Лідер банди: обійди 3 крамниці міста — забери «за стоянку». Банди платять за повагу.',
 stage:st=>st.left>0?('Крамниць лишилось: '+st.left+'. Йди до: '+(st.tgt?st.tgt.name:'—')):'УСІ КРАМНИЦІ — здай данину лідеру (телефон → КВЕСТИ)',
 doneState:st=>st.left<=0,
 take(){const t=this.next();setSide('g_tribute',{left:3,tgt:t});
   IB.sms('team','БАНДА','Три крамниці — три «спасибі». Перша: '+t.name+'. І щоб без мороки!');},
 next(){const ds=IB.PHONE_DESTS().filter(d=>/КРАМНИЦ|РИНОК|КАФЕ|МАГАЗИН/i.test(d.name));const d=ds.length?ds[IB.ri(0,ds.length-1)]:IB.PHONE_DESTS()[0];return {x:d.x,y:d.y,name:d.name};},
 tick(dt){const st=side('g_tribute');if(!st||st.left<=0||!st.tgt)return;const L=IB.E.team[0];
   if(IB.dist(L.x,L.y,st.tgt.x,st.tgt.y)<2.5){
     st.left--;L.pocket=(L.pocket||0)+40;IB.toast('⚔ Данина зібрана: +₴40 у кишеню (лишилось '+st.left+')','gold');
     IB.addRep(IB.E.team[0].gang||'street',1,'данина з крамниці');IB.skillXP(L,'str',3);
     st.tgt=st.left>0?this.next():null;}}
},
{id:'g_rivals',cat:'gang',name:'⚔ ВИБИТИ СУПЕРНИКІВ (2 битки)',pay:220,solo:false,
 desc:'Лідер банди: суперники шабашать у СВОЄМУ кварталі. Виграй 2 битки на чужій території — авторитет.',
 stage:st=>st.left>0?('Биток лишилось: '+st.left+' (вигравай у чужому кварталі — Порт/Бронкс)'):'УСЕ ЗРОБЛЕНО — здай у вкладці КВЕСТИ',
 doneState:st=>st.left<=0,
 take(){setSide('g_rivals',{left:2,startWin:IB.G.stats.fightWin||0,counted:0});
   IB.sms('team','БАНДА','Два битки — і район наш. Портові/Бронкові самі приймуть виклик.');},
 tick(dt){const st=side('g_rivals');if(!st||st.left<=0)return;const L=IB.E.team[0];
   const w=(IB.G.stats.fightWin||0)-st.startWin;
   const turf=(L.x>=332&&L.y>=356)?'port':((L.x>=246&&L.x<=284&&L.y>=370)?'bronx':null);
   if(w>st.counted){st.counted=w;if(turf)st.left--;
     IB.toast('⚔ Суперник вибитий на його території! (лишилось '+st.left+')','gold');
     IB.addRep('street',2,'розмова по-нашому');IB.skillXP(L,'str',5);}}
},
{id:'g_recruit',cat:'gang',name:'⚔ ВЕРБУВАННЯ У ВВ13 (3 знайомства)',pay:180,solo:false,
 desc:'Поговори з 3 людьми міста — поклич у ВВ13. Коли репутація у ОБОХ банд ≥20 — база твоя.',
 stage:st=>st.left>0?('Поговори з мешканцями: '+st.left+' (E у будь-якого перехожого)'):'ВСЕ ЗБІГЛОСЬ — здай у вкладці КВЕСТИ',
 doneState:st=>st.left<=0,
 take(){setSide('g_recruit',{left:3,talked:IB.G.stats.talks||0});IB.sms('team','ВВ13','Слово за слово — вербуєм. Три розмови, три долі.');},
 tick(dt){const st=side('g_recruit');if(!st||st.left<=0)return;
   if((IB.G.stats.talks||0)>st.talked){st.talked=IB.G.stats.talks;st.left--;
     IB.toast('⚔ Новий кент слухав про ВВ13! (лишилось '+st.left+')','gold');IB.skillXP(IB.E.team[0],'charm',4);}}
},
{id:'w_poly',cat:'work',name:'🩺 ЧЕРГУВАННЯ В ПОЛІКЛІНІЦІ',pay:200,solo:false,
 desc:'Поліклініка №1: чергування на прийомі. Стій біля поліклініки 40 ігрових хвилин — і допомагай людям.',
 stage:st=>st.done?'Чергування скінчилось — здай у вкладці КВЕСТИ':'Зміна: '+IB.M.round(st.t*10)+'% (будь біля ПОЛІКЛІНІКИ №1, Північний масив)',
 doneState:st=>st.t>=4,
 take(){setSide('w_poly',{t:0});IB.sms('team','ПОЛІКЛІНІКА №1','Чергування прийнято. Термометр — в тебе, нерви — тримай.');},
 tick(dt){const st=side('w_poly');if(!st||st.t>=4)return;const L=IB.E.team[0];
   if(IB.dist(L.x,L.y,289,50)<7){st.t+=dt;
     if(IB.M.random()<0.02){IB.heroRep(L,1,'допомога у поліклініці');IB.addRep('cops',1,'добра слава');IB.skillXP(L,'inst',3);}}
   else st.t=IB.M.max(0,st.t-dt*0.5);}
},
{id:'d_prof',cat:'det',name:'📚 СТОРІЖКА ПРОФЕСОРА (детектив)',pay:190,solo:false,
 desc:'Професор з бібліотеки: 3 рідкісні книжки «зникли» з читальні. Знайди всі 3 на полицях міста.',
 stage:st=>st.left>0?('Книжок знайдено: '+(3-st.left)+'/3. Йди до: '+(st.tgt?st.tgt.name:'—')):'УСІ КНИЖКИ — здай професору (телефон → КВЕСТИ)',
 doneState:st=>st.left<=0,
 take(){const t=this.next();setSide('d_prof',{left:3,tgt:t});
   IB.sms('team','БІБЛІОТЕКА','«Три томи зникли: «Море і лиман», «Стела і місто», «Паллада». Шукай...» Перше місце: '+t.name);},
 next(){const ds=IB.PHONE_DESTS().filter(d=>/МУЗЕЙ|БІБЛІОТЕКА|ПАРК|ПЛОЩА|ВОКЗАЛ|ЛУНА/i.test(d.name));const d=ds.length?ds[IB.ri(0,ds.length-1)]:IB.PHONE_DESTS()[5];return {x:d.x,y:d.y,name:d.name};},
 tick(dt){const st=side('d_prof');if(!st||st.left<=0||!st.tgt)return;const L=IB.E.team[0];
   if(IB.dist(L.x,L.y,st.tgt.x,st.tgt.y)<2.6){
     st.left--;IB.skillXP(L,'inst',6);IB.addRep('cops',1,'детективна спостережливість');
     IB.toast('📚 Книжка знайдена! (лишилось '+st.left+')','gold');
     st.tgt=st.left>0?this.next():null;}}
},
];

/* ---------- ВЗЯТИ / ЗДАТИ / ТІК ---------- */
const _npcTalkCount=(IB._npcTalkCount||0);
IB._bumpTalks=()=>{IB.G.stats.talks=(IB.G.stats.talks||0)+1;};
IB.sideTake=(id)=>{
  const q=IB.SIDEQ.find(x=>x.id===id);if(!q)return;
  if(IB.G.side[id]&&IB.G.side[id].done){IB.toast('Квест вже виконаний','red');return;}
  if(q.solo){
    const L=IB.E.team[0];
    const near=IB.E.team.some(h=>h!==L&&IB.dist(h.x,h.y,L.x,L.y)<10);
    if(near){IB.soloMode(true);IB.toast('🌞 Соло-квест: п\'ятірка поїхала на пляж','gold');}
  }
  q.take();IB.toast('📋 Квест: '+q.name,'gold');
  IB.journalAdd('📋','Взято: '+q.name+' (нагорода ₴'+q.pay+' у кишеню)');
};
IB.sideFinish=(id)=>{
  const q=IB.SIDEQ.find(x=>x.id===id);if(!q)return;
  const st=IB.G.side[id];if(!st)return;
  if(q.doneState&&!q.doneState(st)){IB.toast('Ще не виконано...','red');return;}
  const L=IB.E.team[0];
  const realPay=IB.M.round(q.pay*(IB.bonusTech?IB.bonusTech(L):1));
  L.pocket=(L.pocket||0)+realPay;
  IB.tx&&IB.tx(L.name,realPay,'квест: '+q.name);
  IB.G.side[id]=Object.assign(st,{done:true});
  /* v6.0: РЕПУТАЦІЯ І СКІЛИ за категорію квесту */
  const repMap={work:['work',3],rest:['girls',1],det:['cops',3],horror:['inst',0],gang:['street',4]};
  const rm=repMap[q.cat]||['work',2];
  IB.addRep(rm[0],rm[1],q.name);
  IB.heroRep(L,3,q.name);
  const skMap={work:'tech',rest:'charm',det:'inst',horror:'inst',gang:'str'};
  IB.skillXP(L,skMap[q.cat]||'tech',10);
  if(q.cat==='gang'&&L.gang&&L.gang!=='vv13')IB.addRep(L.gang,3,'робота на банду');
  IB.toast('✅ '+q.name+': +₴'+realPay+' у кишеню '+L.name,'gold');
  IB.journalAdd('✅',q.name+' — ₴'+realPay);
  IB.sms('galagan','детектив Галаган','Справа «'+q.name+'» закрита. Оплата — кишеню. Місто трохи спокійніше.');
};
IB.sideTick=(dt)=>{
  /* жах-вінʼєтка */
  if(IB.G.horror&&IB.G.horror.t>0)IB.G.horror.t-=0;
  for(const q of IB.SIDEQ){
    const st=IB.G.side[q.id];
    if(!st||st.done)continue;
    if(q.tick)q.tick(dt);
  }
};
/* категорії у вкладці КВЕСТИ вже читають IB.SIDEQ */

})();
