/* ILEGEND 3 — MORE MORE (sys.js): виживання, погода, ГУЛЯНКА, коктейль «П'ять Хвиль», артефакти, квести, економіка, сейв */

/* ---------- DOM-хелпери ---------- */
const $=id=>document.getElementById(id);
IB.$=$;
IB.toast=(txt,cls)=>{const l=$('log');if(!l)return;const d=document.createElement('div');d.className='log-line '+(cls||'');d.textContent=txt;l.appendChild(d);while(l.children.length>5)l.removeChild(l.firstChild);setTimeout(()=>{if(d.parentNode)d.parentNode.removeChild(d);},4100);};
IB.logLine=(txt,cls)=>IB.toast(txt,cls);
IB.banner=(txt)=>{const b=$('banner');b.textContent=txt;b.classList.remove('hidden');clearTimeout(IB._bt);IB._bt=setTimeout(()=>b.classList.add('hidden'),2700);};
IB.alertBox=(txt,cls)=>{const a=$('hud-alert');if(!txt){a.classList.add('hidden');return;}a.textContent=txt;a.className=cls||'';a.classList.remove('hidden');};
IB.floatMsgs=[];
IB.floatMsg=(x,y,txt)=>{IB.floatMsgs.push({x,y,txt,t:0});};

/* ---------- СТАН ---------- */
/* i3-sea-patch */
IB.G={mode:'boot',t:6,day:1,money:100000,
  inv:{wood:2,berries:1,mush:0,herb:0,fishraw:0,potato:0,water:2,
       bread:1,brinza:0,canned:0,eggs:0,yushka:0,banosh:0,kulesh:0,cookfish:0,
       nalyva:0,beer:1,wine:0,vodka:0,rozsol:0,kava:0,trip5:0,
       hotdog:0,shav:0,melon:0,corn:0,lunch:0,popcorn:0,moroz:0,juice:0,lemon:0,
       trash:0,cream:0},
  quests:{done:[],active:'q1',side:{}},
  arts:[],journal:[],album:[],stamps:{},   /* v1.4: штампи маршрутів {routeId:{d,name}} */
  camps:{},   /* c1..c5 → {fire,fuel,tent,well,farm:{built,stage,planted,ready},table,dry} */
  wildCamps:[],   /* v2.1: походні табори будь-де → {id,name,x,y,r,wild} */
  wildCamps:[],   /* v2.1: походні табори будь-де → {id,name,x,y,r,wild} */
  party:{active:false,t:0,hour:0,scenes:0,at:null},
  trip:{active:false,t:0,hour:0,at:null},
  sunShow:{active:false,t:0,hour:0},   /* v16: дійство-засмага */
  hangover:0,vision:0,axetier:1,
  flags:{},stats:{fish:0,wood:0,berries:0,parties:0,arts:0,gulyankaStories:0,trips:0,photos:0,mail:0,wheel:0,carousel:0,tramp:0,surf:0,autodrom:0,train:0,limanFish:0},
  friends:{},   /* v2.0 «ЗНАЙОМИТИСЬ»: ім'я → {lvl,met,day} */
  dateAway:[],  /* v3.1 «СІ, НІ ТА РЕЙВ»: герої на гулянці з дівчатами {hid,girl,endT,endDay,start} */
  inviteT:150,  /* v3.1: таймер запрошень від людей */
  radioT:60,    /* v3.1: таймер радіо 103.2 FM */
  wx:{type:'sun',t:90},evT:40,freezeEvt:0,touristDone:false,storyT:0,
  torch:true,   /* v17.0: фонарики на ніч (метелики злітаються, якщо ввімкнені) */
  spawn:{x:14,y:16},slot:0,autoT:0,home:null,tan:0,
  /* v18: календар 30 днів, події, суперники, романтика, чіпи, шари карти */
  chips:{e:1,p:1,q:1},romance:{},rivals:null,marek:null,
  mapLy:{tasks:1,people:1,city:1},jtab:'quests',
  _dateGirls:[],_actSeen:1};

/* ==================== v18: СИСТЕМНІ ХЕЛПЕРИ ==================== */
/* ---------- С1: ТРИ АКТИ ЛІТА (30-денний календар) ---------- */
IB.act=()=>IB.G.day<=10?1:(IB.G.day<=20?2:3);
IB.actName=()=>['АКТ I «ПРИЇЗД»','АКТ II «РОЗКВІТ»','АКТ III «СВЯТО»'][IB.act()-1];
IB.actDesc=()=>{
  const a=IB.act();
  if(a===1)return 'Дні 1-10: облаштування, знайомство з містом, перший рейв. Кіль «Паллади» опущено у день 1.';
  if(a===2)return 'Дні 11-20: банди піднімають ставки, з Одеси приїхала ватага «Східні», економіка гарячішає.';
  return 'Дні 21-30: фестиваль моря, спуск «Паллади» у день 28, фінальна вечірка з салютом (день 30).';
};
/* ---------- ПРИЛИВ: море ходить на пісок (цикл ~6 ігр.год) ---------- */
IB.tideK=()=>0.5+0.5*IB.M.sin((IB.G.t/6)*IB.M.PI*2);
IB.tideLine=()=>472-IB.M.round(IB.tideK()*3);
/* ---------- С2: СТАДІЇ БУДІВНИЦТВА «ПАЛЛАДИ» (0..5, 6=спущена) ---------- */
IB.palStage=()=>{
  if(IB.G.flags.palLaunched)return 6;
  const d=IB.G.day+(IB.G.flags.palBoost||0)*0.5;
  return IB.M.min(5,IB.M.floor((d-1)/5.4));
};
IB.palLaunch=()=>{
  if(IB.G.flags.palLaunched)return;
  IB.G.flags.palLaunched=true;
  IB.cineStart&&IB.cineStart('СПУСК «ПАЛЛАДИ» НА ВОДУ — ГУДКИ ПОРТУ І САЛЮТ',6,'fireworks');
  IB.banner('⚓ «ПАЛЛАДА» НА ВОДІ!');
  IB.journalAdd('⚓','День 28: спуск «Паллади» зі стапелів. Гудки порту, натовп, салют — місто кричало.');
  IB.addRep&&IB.addRep('city',5,'свято спуску «Паллади»');
  try{IB.W.props.push({x:396,y:480,type:'pallada',seed:.5});}catch(e){}
  for(const h of IB.E.team)h.mood=IB.clamp(h.mood+15,0,100);
  IB.questCheck&&IB.questCheck();
};
/* ---------- С8: КАР'ЄРА ПОРТУ ---------- */
IB.portCareer=()=>{
  const sh=IB.G.stats.pshift||0;
  const lvl=sh>=9?3:(sh>=6?2:(sh>=3?1:0));
  const names=['ВАНТАЖНИК','ПРИЙМАЛЬНИК СКЛАДУ','ДОК-МАЙСТЕРНЯ','КРАНІВНИК'];
  const pays=[180,220,260,300];
  return {lvl,name:names[lvl],pay:pays[lvl],cranePay:400};
};
/* ---------- С7: ПОДІЯ ДНЯ (щотижневий календар) ---------- */
IB.eventToday=()=>{
  const wd=IB.G.day%7;
  return wd===2?'fish':(wd===4?'basket':(wd===5?'cinema':(wd===6?'fair':null)));
};
/* ---------- v18: КІНЕМАТОГРАФІЧНІ СЦЕНИ ---------- */
IB.cine={active:false,t:0,dur:0,cap:'',fx:null};
IB.cineStart=(cap,dur,fx)=>{IB.cine={active:true,t:0,dur:dur||3.5,cap:cap||'',fx:fx||null};};
/* ---------- v18 М5: НАЛАШТУВАННЯ ---------- */
IB.SET={vol:1,scan:true,shake:true,scheme:'classic',ui:100};
try{const _raw=localStorage.getItem('ilegend3_more_set');
  if(_raw){const _d=JSON.parse(_raw);Object.assign(IB.SET,_d);}}catch(e){}
IB.saveSet=()=>{try{localStorage.setItem('ilegend3_more_set',JSON.stringify(IB.SET));}catch(e){}};
/* ---------- С3: СПАВН «СХІДНИХ» (Одеса, акт II) ---------- */
IB.spawnRivals=()=>{
  if(IB.G.flags.rivalsSpawned)return;
  IB.G.flags.rivalsSpawned=true;
  const RR=[
    ['Рід («Східні»)',156,466,{skin:'#d89868',hair:'#1a1410',hat:'cap',hatc:'#e02838',jacket:'#e02838',pants:'#28303e'}],
    ['Дан («Східні»)',224,460,{skin:'#e0a878',hair:'#241a10',hat:'none',jacket:'#e0a030',pants:'#3a4048'}],
    ['Толя («Східні»)',318,414,{skin:'#d89868',hair:'#2a2018',hat:'none',jacket:'#7a50d0',pants:'#2e3238'}],
    ['Кім («Східні»)',200,436,{skin:'#f0b48c',hair:'#6a3a1a',hat:'none',jacket:'#3aa0e0',pants:'#28303e'}],
    ['Ян («Східні»)',322,388,{skin:'#e0a878',hair:'#1e1610',hat:'cap',hatc:'#2ab8a0',jacket:'#2ab8a0',pants:'#3a4048'}],
  ];
  for(const r of RR)IB.E.npcs.push({x:r[1],y:r[2],role:'static',name:r[0],quest:null,rival:true,look:r[3]});
};

IB.SYS={};
IB.G.nearCamp=IB.nearCamp;   /* аліас (ents.js визначає IB.nearCamp) */
for(const c of IB.W.CAMPS){IB.G.camps[c.id]={fire:false,fuel:0,tent:false,well:false,table:false,dry:false,
  farm:{built:false,stage:0,planted:false,ready:false,grow:0}};}

/* ---------- ПОГОДА: сонце/хмара/вітер/туман/дощ/град/сніг/ХУРТОВИНА ---------- */
IB.WX={type:'sun',t:90};
IB.WX_TYPES={
  sun:{label:'СОНЕЧКО',cls:'wxs',sight:1,spd:1,heat:0.2,fun:1.1},
  heat:{label:'СПЕКА',cls:'wxs',sight:1,spd:0.94,heat:1,fun:0.95},
  cloud:{label:'ХМАРНІСТЬ (не буває)',cls:'wxc',sight:1,spd:1,heat:0.05,fun:0.9},
  wind:{label:'БРИЗ',cls:'wxw',sight:1,spd:1,heat:0.1,fun:0.85},
  rain:{label:'ДОЩИК',cls:'wxr',sight:0.78,spd:0.92,heat:0,fun:0.7},
  thunder:{label:'ГРОЗА',cls:'wxh',sight:0.55,spd:0.8,heat:0,fun:0.5},
  storm:{label:'ШТОРМ НА МОРЕ',cls:'wxb',sight:0.5,spd:0.78,heat:0,fun:0.35},
};
IB.WX.next=function(){
  const r=IB.M.random();
  let nx='sun';
  /* v2.0: ХМАРНІСТЬ і ТУМАН ВИЛУЧЕНІ з пулу (відгук: «біла завіса вискакує») —
     небо курорту завжди ясне: сонце/спека/бриз, дощ рідко, гроза/шторм ще рідше */
  if(r<0.42)nx='sun';else if(r<0.60)nx='heat';else if(r<0.80)nx='wind';
  else if(r<0.92)nx='rain';else if(r<0.97)nx='thunder';
  else nx='storm';
  if(nx==='thunder'&&IB.G.wx.type==='thunder')nx='rain'; /* гроза не триває два цикли */
  if(nx==='storm'&&IB.G.wx.type==='storm')nx='wind';
  if(nx!==IB.G.wx.type){
    IB.G.wx.type=nx;
    /* v20.0: ІЗОХМАРИ — при зміні погоди небо ПЕРЕТОНУЄ: старі хмари розтають,
       нові приходять з новим тоном/щільністю/швидкістю вітру */
    try{IB.SKY&&IB.SKY.retone&&IB.SKY.retone();}catch(e){}
    const w=IB.WX_TYPES[nx];
    if(nx==='storm'){
      /* v18: ШТОРМОВИЙ ПАКЕТ — сирена, радіо-попередження, кінематографія */
      IB.banner('ШТОРМ! Море несе — з пляжу ГЕТЬ!');
      IB.SFX.alert();setTimeout(()=>{IB.SFX.alert&&IB.SFX.alert();},450);
      IB.cineStart&&IB.cineStart('ШТОРОВЕ ПОПЕРЕДЖЕННЯ — МОРЕ ЗАКРИТЕ',3);
      IB.radioBroadcast&&IB.radioBroadcast('⚠ Штормове попередження: вітри до 25 м/с. Купання заборонено, катамарани в порту, рибалки — до берега!');
      IB.logLine&&IB.logLine('Шторм: купання заборонено, катамарани в порт','red');
    }
    else if(nx==='thunder'){IB.banner('ГРОЗА! Сховалися під дахом?');IB.SFX.alert();}
    else if(nx==='heat'){IB.toast('СПЕКА! Вода, крем і тінь — твої друзі','gold');}
    else IB.toast('ПОГОДА: '+w.label,'gold');
  }
  IB.G.wx.t=IB.rnd(90,220);
};
IB.WX.cur=()=>IB.WX_TYPES[IB.G.wx.type];

/* ---------- ЖУРНАЛ ---------- */
IB.journalAdd=(icon,txt)=>{IB.G.journal.unshift({d:IB.G.day,t:IB.clockStr(),icon,txt});if(IB.G.journal.length>60)IB.G.journal.pop();};

/* ---------- ТЕМПЕРАТУРА/ХОЛОД ---------- */
IB.coldRate=(h)=>{
  const nf=IB.nightFactor();
  let r=0.25+nf*1.3;
  const t=IB.G.wx.type;
  if(t==='rain')r+=0.9;if(t==='thunder')r+=1.3;if(t==='storm')r+=1.9;
  if(t==='wind')r+=0.5;
  if(h.swim)r+=1.6;
  if(IB.artHas('a6'))r*=0.5; /* береговий амулет */
  return IB.M.max(0.05,r);
};

/* ---------- ОНОВЛЕННЯ ВИЖИВАННЯ (dt сек реального часу) ---------- */
IB.survTick=(dt)=>{
  const party=IB.G.party.active,trip=IB.G.trip.active;
  for(const h of IB.E.team){
    if(party||trip){
      /* під час гулянки/тріпу час йде швидко, стан теж */
      h.food=IB.clamp(h.food-dt*0.9,0,100);
      h.water=IB.clamp(h.water-dt*0.8,0,100);
      continue;
    }
    const slow=h.food<=0||h.water<=0;
    const thirsty=h.water<15&&!slow;
    const spd=slow?0.55:(thirsty?0.8:1);
    h.slowed=slow;h.thirsty=thirsty;
    const wcur=IB.WX.cur();
    const wet=(IB.G.wx.type==='rain'||IB.G.wx.type==='thunder'||IB.G.wx.type==='storm');
    h.food=IB.clamp(h.food-dt*0.85*IB.SURV*spd,0,100);
    h.water=IB.clamp(h.water-dt*1.05*IB.SURV*spd*(wet?0.7:(1+wcur.heat*0.55)),0,100);
    /* СПЕКА/СОНЯНИЙ УДАР: відкритий пісок і набережна вдень */
    h.heat=IB.clamp(h.heat||0,0,120);
    const exposed=(IB.G.wx.type==='sun'||IB.G.wx.type==='heat')&&IB.nightFactor()<0.25&&
      (IB.W.at(h.x,h.y)===1||IB.W.at(h.x,h.y)===13)&&!h.swim;
    const creamOn=IB.G.flags.creamDay===IB.G.day;
    if(exposed&&!creamOn)h.heat=IB.clamp(h.heat+dt*(IB.G.wx.type==='heat'?3.0:1.8)*(IB.artHas('a6')?0.5:1),0,120);
    else h.heat=IB.clamp(h.heat-dt*4,0,120);
    /* v18: МОКРЕ МОРЕ — щойно з моря (wetT) перегрів падає швидко;
       у плаванні тіло охолоджується само */
    if(h.wetT>0){h.wetT-=dt;h.heat=IB.clamp(h.heat-dt*6,0,120);}
    else if(h.swim)h.heat=IB.clamp(h.heat-dt*8,0,120);
    /* v18 С6: статус «пара» — постійний бонус настрою лідеру */
    if(h===IB.E.team[0]&&IB.G.romance){
      let _cp=false;for(const _k in IB.G.romance)if(IB.G.romance[_k]&&IB.G.romance[_k].st>=3){_cp=true;break;}
      if(_cp)h.mood=IB.clamp(h.mood+dt*0.3,0,100);
    }
    if(h.heat>=100&&!h.heatstroke){
      /* v17.0: СОНЯНИЙ УДАР — КОРОТКЕ ДІЙСТВО (не надовго): герой падає
         на піску, друзі збігаються з водою і тріпають, за 5-8 секунд
         відходить; у ТІНІ (козирок/парасолька) — вдвічі швидше */
      h.heatstroke=IB.rnd(5,8);IB.floatMsg(h.x,h.y,'🥵');IB.SFX.alert();
      h.lying=h.heatstroke;h.lieDir=IB.M.random()<0.5?-1.35:1.35;
      h.bubble={txt:['Пав від спеки...','Води-и!','Сонце зле'][IB.ri(0,2)],t:0,life:3};
      IB.toast(h.name+' — СОНЯНИЙ УДАР! Лежить у тіні — відійде за хвилинку','red');
      IB.logLine(h.name+' перегрівся: сонячний удар','red');
      IB.G.heatVictim={id:h.id,t:0};
      for(const o of IB.E.team){if(o===h)continue;
        if(IB.dist(o.x,o.y,h.x,h.y)<10){
          o.bubble={txt:['Тримайся, брате!','Воду приніс!','Йому у тінь треба!','Плесни йому водою!'][IB.ri(0,3)],t:0,life:3};
          if(IB.M.random()<0.5)IB.floatMsg(o.x,o.y,'💧');}}
    }
    if(h.heatstroke){
      h.heatstroke-=dt*(exposed?1:2);
      if(h.heatstroke<=0){h.heatstroke=0;h.heat=38;h.lying=0;
        if(IB.G.heatVictim)delete IB.G.heatVictim;
        IB.toast(h.name+' відійшов — тінь і трохи води зробили свою справу','gold');}
      else h.lying=h.heatstroke;
    }
    if(exposed)IB.G.tan=IB.clamp((IB.G.tan||0)+dt*0.3,0,100);
    const running=h.running&&h.id==='viktor';
    let hpD=0;
    if(h.food<=0)hpD+=dt*1.1*IB.SURV;
    if(h.water<=0)hpD+=dt*1.6*IB.SURV;
    /* холод */
    const cr=IB.coldRate(h);
    const fireProx=(()=>{const c=IB.G.nearCamp(h.x,h.y,4);return c&&IB.G.camps[c.id].fire&&IB.G.camps[c.id].fuel>0;})();
    if(cr>1.5&&!fireProx)h.cold=IB.clamp(h.cold+dt*cr*1.4*IB.SURV,0,100);
    else h.cold=IB.clamp(h.cold-dt*4*IB.SURV,0,100);
    if(h.cold>=100)hpD+=dt*1.5*IB.SURV;
    if(h.heatstroke)hpD+=dt*1.3*IB.SURV;
    h.hp=IB.clamp(h.hp-dt*hpD+(hpD===0?dt*0.6*IB.SURV:0),0,100);
    /* настрій */
    let mD=-dt*0.25*IB.SURV;
    if(IB.G.wx.type==='sun'&&IB.nightFactor()<0.2)mD+=dt*0.1;
    if(slow)mD-=dt*0.3;
    h.mood=IB.clamp(h.mood+mD,0,100);
    if(running)h.hp=IB.clamp(h.hp-dt*0.5,0,100);
    /* похмілля минає */
  }
  /* вогонь догорає */
  for(const cid in IB.G.camps){
    const c=IB.G.camps[cid];
    if(c.fire&&c.fuel>0){c.fuel-=dt*0.12*IB.SURV;if(c.fuel<=0){c.fuel=0;c.fire=false;
      const camp=IB.W.CAMPS.find(k=>k.id===cid);
      IB.toast('Вогнище в «'+camp.name+'» догоріло','red');}}
  }
  /* ферми ростуть */
  for(const cid in IB.G.camps){
    const f=IB.G.camps[cid].farm;
    if(f.built&&f.planted&&!f.ready){f.grow+=dt*0.02*IB.SURV; /* ~3 хв реального = 1 стадія */
      f.stage=IB.M.min(3,IB.M.floor(f.grow));
      if(f.grow>=4)f.ready=true;}
  }
};

/* ---------- ЇСТЬ/ПИТИ ---------- */
IB.FOODS={
  hotdog:{n:'Хот-дог',food:30,water:0,fun:7},
  shav:{n:'Шаурма',food:45,water:0,fun:9},
  melon:{n:'Арбуз (долька)',food:14,water:22,fun:7},
  corn:{n:'Кукурудза',food:18,water:4,fun:5},
  lunch:{n:'Комплексний обід',food:55,water:12,fun:10},
  popcorn:{n:'Попкорн',food:10,water:0,fun:8},
  moroz:{n:'Морозиво',food:10,water:8,fun:14},
  berries:{n:'Ягоди',food:12,water:6,fun:3},
  mush:{n:'Мідії (свіжі)',food:10,water:2,fun:0},
  cookfish:{n:'Смажена риба',food:24,water:0,fun:6},
  yushka:{n:'Юшка',food:36,water:24,fun:8},
  banosh:{n:'Плов портовий',food:42,water:4,fun:10},
  kulesh:{n:'Макарони з сиром',food:34,water:16,fun:7},
  bread:{n:'Хліб',food:26,water:0,fun:2},
  brinza:{n:'Бринза',food:20,water:0,fun:5},
  eggs:{n:'Яйця',food:14,water:0,fun:2},
  canned:{n:'Консерви',food:30,water:0,fun:1},
  potato:{n:'Картопля',food:16,water:0,fun:2},
  fishraw:{n:'Сира риба',food:8,water:2,fun:-3},
};
IB.DRINKS={
  juice:{n:'Сік «Яблуня»',water:30,alc:0,fun:6},
  lemon:{n:'Лимонад «Хвиля»',water:26,alc:0,fun:11},
  water:{n:'Вода',water:35,alc:0,fun:0},
  beer:{n:'Пиво',water:14,alc:1,fun:8,food:4},
  wine:{n:'Вино',water:10,alc:2,fun:12,food:3},
  vodka:{n:'Горілка',water:6,alc:3,fun:16,food:0},
  nalyva:{n:'Наливка',water:9,alc:2,fun:14,food:4},
  rozsol:{n:'Розсіл',water:26,alc:0,fun:8,cure:true},
  kava:{n:'Кава',water:8,alc:0,fun:6,energy:22},
};
IB.eat=(h,kind)=>{
  const f=IB.FOODS[kind];
  if(!f||!IB.G.inv[kind])return false;
  IB.G.inv[kind]--;
  let mult=1;
  if(h.id==='andriy')mult=1.3;
  h.food=IB.clamp(h.food+f.food*mult,0,100);
  h.water=IB.clamp(h.water+(f.water||0),0,100);
  h.mood=IB.clamp(h.mood+(f.fun||0),0,100);
  IB.SFX.eat();
  IB.floatMsg(h.x,h.y,'+'+IB.M.round(f.food*mult)+'🍲');
  IB.toast(h.name+' їсть '+f.n.toLowerCase()+': їжа +'+IB.M.round(f.food*mult)+'%','gold');
  return true;
};
IB.drink=(h,kind)=>{
  const d=IB.DRINKS[kind];
  if(!d)return false;
  const stock=IB.G.inv[kind]||0;
  if(stock<=0){IB.toast('Питва нема — купуй у крамниці/на ринку або E біля кіоска води','red');return false;}
  /* v17.0 ФІКС «пити — і нічого не відбувається»: запас (і «вода 6-pack»)
     СПИСУЄТЬСЯ, на екрані — бульбашка + повідомлення; вода ще й збиває спеку */
  IB.G.inv[kind]--;
  h.water=IB.clamp(h.water+d.water,0,100);
  if(d.food)h.food=IB.clamp(h.food+d.food,0,100);
  if(d.energy)h.hp=IB.clamp(h.hp+d.energy,0,100);
  h.mood=IB.clamp(h.mood+(d.fun||0),0,100);
  h.heat=IB.clamp((h.heat||0)-(d.water>=25?20:(d.alc?0:6)),0,120);
  if(h.heatstroke&&d.water>=20){h.heatstroke=IB.M.max(0.8,h.heatstroke*0.45);IB.floatMsg(h.x,h.y,'🥤');}
  IB.floatMsg(h.x,h.y,'+'+d.water+'💧');
  IB.toast(h.name+' п’є '+d.n.toLowerCase()+': вода +'+d.water+(d.alc?', алкоголь ×'+d.alc:''),'gold');
  if(d.alc){h.alc=IB.clamp(h.alc+d.alc,0,6);}
  if(d.cure&&IB.G.hangover>0){IB.G.hangover=0;IB.toast('Розсіл врятував! Похмілля минулося','gold');}
  IB.SFX.drink();
  return true;
};

/* ---------- СПАТИ/ВІДПОЧИТИ ---------- */
IB.sleepTillMorning=(inTent)=>{
  const h=IB.M.floor(IB.G.t);
  let hrs=(24-h)+7;
  if(hrs<=0||hrs>18)hrs=8;
  IB.G.t=(IB.G.t+hrs)%24;
  if(IB.G.t<7)IB.G.day++;
  const L=IB.E.team[0];
  for(const m of IB.E.team){
    m.hp=inTent?IB.M.min(100,m.hp+55):IB.M.min(100,m.hp+30);
    m.food=IB.M.max(0,m.food-hrs*2.4);
    m.water=IB.M.max(0,m.water-hrs*2.8);
    m.cold=IB.M.max(0,m.cold-40);
    if(IB.G.hangover>0){IB.G.hangover-=IB.M.floor(hrs*0.5);}
  }
  IB.SYS.onNewHours(hrs);
  IB.banner('РАНОК. ДЕНЬ '+IB.G.day+' • '+IB.clockStr());
  IB.journalAdd('🌙','Ніч у Чорноморську'+(inTent?' (у своєму житлі)':' (під зорями над морем)')+'. Відпочили'+(inTent?' як слід':'.'));
};

/* ---------- v2.1: ТАБІР БУДЬ-ДЕ (кнопка ⛺ ТАБІР / клавіша B) ---------- */
IB.makeCamp=()=>{
  if(IB.G.mode!=='game')return;
  const L=IB.E.team[0];
  /* вся група має бути поруч */
  const far=IB.E.team.filter(m=>IB.dist(m.x,m.y,L.x,L.y)>9);
  if(far.length){IB.toast('Хтось відбився ('+far.map(m=>m.name).join(', ')+') — натисни 🔊 ГУКАТИ (R)','red');IB.SFX.alert();return;}
  const x=L.x,y=L.y;
  const terr=IB.W.at(x,y);
  if(terr===0){IB.toast('У воді табір не поставиш — вийди на берег','red');return;}
  if(terr===9||terr===10){IB.toast('Скелі й урвища — не місце для намету','red');return;}
  /* не в селі: там хати і господарі */
  const vil=(IB.W.VILLAGES||[]).find(v=>x>=v.x-1&&x<v.x+v.w+1&&y>=v.y-1&&y<v.y+v.h+1);
  if(vil){IB.toast('У селі ночуй у хаті під дахом — табір став на полі або біля лиману','red');return;}
  /* не дублюємо кемпінги і свої табори */
  for(const c of IB.W.CAMPS)if(IB.dist(x,y,c.x,c.y)<c.r+4){IB.toast('Тут уже кемпінг «'+c.name+'» — натисни E біля вогнища','red');return;}
  if((IB.G.wildCamps||[]).some(c=>IB.dist(x,y,c.x,c.y)<10)){IB.toast('Походний табір уже поруч — шукай жовтий намет','red');return;}
  if(!IB.G.wildCamps)IB.G.wildCamps=[];
  /* розчищення майданчика: прибрати дерева/кущі/пеньки в радіусі 2 (мідії й «П'ять Хвиль» лишається) */
  for(let i=IB.W.props.length-1;i>=0;i--){
    const p=IB.W.props[i];
    if(p.type==='mush'||p.type==='triph'||p.type==='flower'||p.type==='herb')continue;
    if(IB.M.abs(p.x-x)<=3&&IB.M.abs(p.y-y)<=3){IB.W.props.splice(i,1);IB.W.grid.delete(p.y*IB.W.W+p.x);}
  }
  const n=IB.G.wildCamps.length+1;
  const zone=IB.W.zoneAt?IB.W.zoneAt(x,y):'ЧОРНОМОРСЬК';
  const name='ПОХІДНИЙ ТАБІР №'+n+' — '+zone;
  const id='w'+n;
  IB.G.wildCamps.push({id:id,name:name,x:x,y:y,r:4.5,wild:true});
  IB.G.camps[id]={fire:false,fuel:0,tent:true,well:false,table:false,dry:false,farm:{built:false,stage:0,planted:false,ready:false,grow:0}};
  IB.SFX.build();
  IB.banner('⛺ ТАБІР ПОСТАВЛЕНО');
  IB.journalAdd('⛺','Табір будь-де: група розклала «'+name+'». Вогнище — E біля табору.');
  IB.toast('Намет стоїть! Вогнище: E біля табору → «Збудувати: Вогнище»');
  IB.saveGame();
};

/* ---------- ГУЛЯНКА (8 ігрових годин) ---------- */
IB.PARTY_SCENES=[
  {i:'🍻',t:'ТОСТ ЛЕГЕНДИ',x:'Лєгенда підняв кружку: «За тих, хто в морі! І за тих, хто на піску!» Група гуркнула кружками так, що чайки знялись з рятувальної вишки.'},
  {i:'🎸',t:'ПІСНЯ PABLO',x:'PABLO заспівав «Одесу-маму» так, що в барі «Шейкер» підхопили всі. ROCK падав зі сміху на другому куплеті.'},
  {i:'🎵',t:'СПІВАНКИ НА ПІСКУ',x:'ROCK стрибав через рушники-«вогонь». DIIN крикнув «Пісок загориться!» — і стрибнув першим. Пісок не загорівся.'},
  {i:'🌯',t:'ШАУРМА TOXIC',x:'TOXIC сварився, що шаурма «як в Одесі» — не та шаурма. Виявилась навіть краща. Навіть пес з пляжу залишився на десерт.'},
  {i:'🃏',t:'КАРТИ ПІД ПАРАСОЛКОЮ',x:'Грали в «дурня» на арбузні дольки. PABLO програв три дольки і два арбуза. DIIN чихав у рушник.'},
  {i:'💃',t:'ТАНЦІ ДО ХВИЛЬ',x:'ROCK танцював гопака по кромці води, поки хвиля не зняла його капелюх. Море не віддало.'},
  {i:'👻',t:'СТРАШНИКИ DIIN',x:'DIIN розповідав про привид складу №4 у порту. Вітер з моря раптом затих. ROCK запропонував ще лимонаду — від страху.'},
  {i:'⭐',t:'ЗОРІ НАД МОРЕМ',x:'Лягли на пісок дивитися зорі. Лєгенда показав Великий Воз. PABLO сказав, що з порома він виглядав навіть краще.'},
  {i:'🦀',t:'КРАБИ-ГОСТІ',x:'Краб вибрався з піску прямо у тарілку. «Гість!» — оголосив TOXIC. Краб гостем не став, а стравою.'},
  {i:'🎻',t:'ГУТАРИ НА АЛЕЇ',x:'Хтось з Приморського парку заграв на гітарі. Едік прийшов на звук — і грав до ранку. Пальми аплодували.'},
  {i:'🌭',t:'РОЗІГРАШ З ХОТ-ДОГОМ',x:'ROCK підклав гострий гірчичний хот-дог DIIN-у. DIIN пів години пив лимонад. Помста була солона, як море.'},
  {i:'🎒',t:'БАГАЖ НАОБОРОТ',x:'Грали «правду чи дію». Віктор вибрав правду і розповів, як у Києві прийняв останній сигнал. Стало тихо. Потім хвиля ударила об берег — і стало весело.'},
  {i:'🛥️',t:'ПОРТОВИЙ ГУДОК',x:"О 2-й ночі пором дав гудок. «Рейсу немає», — сказав PABLO. «Це Лєгенда сигналить», — сказав DIIN. Гудок повторився."},
  {i:'🍺',t:'КОНКУРС «ХТО БІЛЬШЕ»',x:'Дворник Митя виявився несподівано тримким. Пішов додому на своїх, а група ще довго свистіла йому вслід.'},
  {i:'🐦',t:'ЧАЙКИ-ЗЛОДІЇ',x:'Чайки вирвали у PABLO шматок хліба прямо з рук. ROCK запевняв, що це дельфіни. Дельфіни мовчали.'},
  {i:'🌅',t:'СВІТАНКОВА ТИША',x:'До самого світу говорили про все. Про Київ. Про море. Про те, що найкраща дорога — та, що веде до хвиль.'},
  {i:'🎡',t:'КОЛЕСО В НОЧІ',x:'Хтось лишив колесо огляду ввімкнене — воно оберталось порожнє над просп. Миру. Група дивилась, як воно світиться, і мріяла про завтра.'},
  {i:'🧀',t:'БРИНЗА-ГРІЛЬ',x:'TOXIC смажив бринзу на складаному грилі «як на Приморському». PABLO сказав, що так не роблять. Потім всі так робили.'},
  {i:'🎣',t:'РИБАЦЬКА БАЙКА',x:'PABLO розповів, як витягнув камбалу «розміром з пірс». Пірс при вимірюванні дивом став коротшим. DIIN заміряв: «відлив».'},
  {i:'🌴',t:'ПАЛЬМОВІ ДРОВА',x:'DIIN спробував рубати пальму. Пальма перемогла. Підріс у повазі.'},
  {i:'🥤',t:'ЛИМОНАДНА БИТВА',x:'ROCK і PABLO соломинками сперечались, чий лимонад кисліший. Суддя (пес) випив обидва.'},
  {i:'🚕',t:'ТАКСИСТ НІЧНИЙ',x:'Таксі вийшло на набережну без пасажирів. «Кому маршрутка?!» — кричав водій піску. Ніхто не пішов. Всі залишились.'},
  {i:'📡',t:'ОСТАННІЙ СИГНАЛ',x:'Віктор зізнався, що вночі іноді сумує за Києвом. PABLO підсунув йому каву з бару: «У Києві немає Чорного моря». Віктор погодився і випив.'},
  {i:'🌽',t:'КУКУРУДЗЯНИЙ ЗАГАД',x:'ROCK кинув качан на гриль — «на попкорн». Стріляло так, що краб утік, а DIIN клявся, що це був постріл портового крана.'},
  {i:'🪗',t:'АКОРДЕОН З КАФЕ',x:'З кафе «Абрикос» винесли акордеон. Гра «поки не прийде господар» тривала до світанку. Господар прийшов і грав разом з ними.'},
  {i:'🥔',t:'КАРТОПЛЯНИЙ ДУЕЛЬ',x:"Знайшли у піску «золоту картоплю». TOXIC і ROCK крили її навпіл. Суддя (пес) з'їв усі улики."},
  {i:'🌧️',t:'ДОЩ НА ХВИЛИНУ',x:'Дощ почався і скінчився рівно на час однієї пісні. «Ми такій любимо», — сказав дворник Митя і не пояснив, що саме «такій».'},
  {i:'🐦',t:'ЧАЙКА-КРИТИК',x:'Чайка над гулянкою повторювала «кря-кря» точно в ритм. PABLO запевняв, що вона підспівувала. ROCK сказав, що чайка — єдиний чесний критик курорту.'},
  {i:'🧦',t:'ШКАРПИНКИ РОЗХОДЯТЬСЯ',x:'ROCK втратив одну шкарпинку. Знайшлась на пальмі — «сушиться». DIIN поклявся, що не брав. Пальма мовчала, але виглядало винувато.'},
  {i:'🗺️',t:'КАРТА ДО СКАРБУ',x:'DIIN «нарисував» карту до скарбу порту на серветці. Карта показувала прямо в казан. «Скарб і є казан», — філософсько підсумував TOXIC.'},
  {i:'😵',t:'ХТО ПЕРШИЙ ЛІГ',x:'Спір «хто перший ляже» виграв... пес. Він просто ліг перший у пісок, і спір скінчився. ROCK вимагав перегляду.'},
  {i:'🌄',t:'РАНОК-АНЕКДОТ',x:'— Слухай, чому сонце сходить з моря? — Бо з порту воно сходило вчора. Розповів дід з яхт-клубу, і він досі вважає це найкращим анекдотом.'},
  {i:'🐈',t:'КІТ-ГОСТЬ',x:'Кіт з парку пройшов крізь гулянку, як господар. Всі розступились. «Повага до курортників», — значуще сказав DIIN і подивився на TOXIC.'},
  {i:'💤',t:'ХТО ХРЯПОТЬ',x:'Хтось хрипів у темряві. Смішно і рівно. Рятувальник Степан зазначив: «Це не хропе. Це хвиля дихає». Більше питань не було.'},
  {i:'🪵',t:'КОЛОДА-ФІЛОСОФ',x:'ROCK розповідав колоді свої секрети. Колода слухала краще за всіх. «Бо не перебиває», — пояснив PABLO.'}
];
/* ---------- v2.3: ДІЙСТВО ВЕЧІРКИ — 8 фаз, глічі, діалоги ---------- */
IB.PARTY_PHASES=[
  {n:'РОЗГІН',bpm:150,fx:0.40,mode:'warm',fall:0.02,dance:1},
  {n:'ТАНЦІ — КОЛОМИЙКА',bpm:172,fx:0.50,mode:'warm',fall:0.03,dance:1},
  {n:'БАЙКИ ТА АНЕКДОТИ',bpm:132,fx:0.55,mode:'warm',fall:0.02,dance:0.6},
  {n:'ГРИБНИЙ ТРІП',bpm:160,fx:1.00,mode:'psy',fall:0.06,dance:0.8},
  {n:'ПОПАДАЛИ',bpm:176,fx:0.70,mode:'warm',fall:0.13,dance:1},
  {n:'ЖАЛІБНИЙ ТРІП',bpm:88,fx:0.80,mode:'blue',fall:0.09,dance:0.4},
  {n:'РОЗГУЛ',bpm:184,fx:1.00,mode:'psy2',fall:0.11,dance:1},
  {n:'ПОХМІЛЛЯ',bpm:60,fx:0.45,mode:'grey',fall:0.02,dance:0}
];
IB.PARTY_BUBBLES=[
  'Пісню! Пісню!','Про Одесу-маму!','Про бринзу!','Про ту, що в місті...','Тихо! Лєгенда співає!',
  'Він не співає, він ДУШИТЬ гітару!','КРЯ-КРЯ!','Чайки на хліб!','Хто підвісив казан криво?!','Це пес!',
  'Хтось бачив мою шкарпинку?','Вона на пальмі сушиться!','Хто підспівує хвилі?','Це не хвиля, це PABLO!',
  'Ще кружку — і гопака!','Ти вже танцюєш гопака...','Оце ТАК гопак!','Упав! Хе-хе!','Хх-х...','Та все нормально!',
  'Хто поклав краба в казан?!','Це спеція від моря!','Шаурма — це любов.','Бринза — це сім\'я.',
  'Море гучне, а душа спокійна!','Спіймаю бичка — осягає пірс!','Вчора спіймав. Сьогодні — черевик.',
  'Дід з яхт-клубу, а причал справді хитає?','Хитає. Але не вночі!','Чому не вночі?!','Бо вночі це вже не причал!',
  'Місто сьогодні веселі!','Зорі сміються!','Дивіться — Великий Воз!','Він пливе на поромі!',
  'Пісню про порт!','А про маяк — два!','Хто там лізе у нашу колонку?!','Ти сам, ROCK!','Тоді я хтось!',
  'Гулянка на піску — легально!','Оксана казала: не більше трьох!','А вона сама скільки?','Тому вона і Оксана!',
  'Хропе хтось рівно, як прибій!','Це не хропе. Це прибій дихає.','Краб танцює краще за нас!','Судді — пес. Він за краба.',
  'Ще один тост — за море!','А за порт — два!','Хто там ходить по пляжу?!','Рятувальник!','Тоді я спасений!'
];
IB.partyFx={lvl:0,mode:'warm',bT:2,wT:20};
IB.campById=(id)=>{
  for(const c of IB.W.CAMPS)if(c.id===id)return c;
  return (IB.G.wildCamps||[]).find(c=>c.id===id)||null;
};
IB.partyPsy=()=>IB.G.party.active&&IB.partyFx&&(IB.partyFx.mode==='psy'||IB.partyFx.mode==='psy2');
IB.partyFxTick=(dt)=>{
  const f=IB.partyFx,p=IB.G.party;
  if(!p.active){f.lvl=IB.M.max(0,f.lvl-dt*0.4);return;}
  const ph=IB.PARTY_PHASES[IB.M.min(p.hour,7)];
  let alc=0;for(const h of IB.E.team)alc+=(h.alc||0);alc/=IB.E.team.length;
  const tgt=ph.fx*(p.dry?0.55:1)*(0.55+IB.M.min(alc/3.5,1)*0.5);
  f.lvl+=(tgt-f.lvl)*IB.M.min(1,dt*0.7);f.mode=ph.mode;
  /* діалоги — бульбашки над героями (байки, анекдоти, п'яні репліки) */
  f.bT-=dt;
  if(f.bT<=0){f.bT=IB.rnd(2.4,4.8);
    const h=IB.E.team[IB.ri(0,IB.E.team.length-1)];
    if(h&&!h.lying)h.bubble={txt:IB.PARTY_BUBBLES[IB.ri(0,IB.PARTY_BUBBLES.length-1)],t:0,life:IB.rnd(2.8,4.2)};
  }
  for(const h of IB.E.team)if(h.bubble){h.bubble.t+=dt;if(h.bubble.t>h.bubble.life)h.bubble=null;}
  /* «попадали» — боротьба: обидва падають і лежать */
  f.wT-=dt;
  if(f.wT<=0){f.wT=IB.rnd(16,28);
    const cands=IB.E.team.slice(1).filter(h=>!h.lying&&IB.dist(h.x,h.y,IB.E.team[0].x,IB.E.team[0].y)<14);
    if(cands.length>=2){const a=cands[IB.ri(0,cands.length-1)];
      const b=cands.find(x=>x!==a);
      if(b){a.lying=IB.rnd(6,9);b.lying=IB.rnd(6,9);a.lieDir=-1.35;b.lieDir=1.35;
        a.bubble={txt:'Попадали!',t:0,life:3};b.bubble={txt:'Хе-хе... хто переміг?',t:0,life:3};
        IB.floatMsg(a.x,a.y,'🤼');IB.SFX.step();}
    }
  }
};

/* v17.0: ГУЛЯНКА КОЛИ ЗАВГОДНО І БУДЬ-ДЕ — НІЯКОГО ТАБОРУ І ВОГНИЩА:
   музику дає бар/рейв-колонка, світло — гірлянди панельок і ліхтарі,
   пісок або асфальт під ногами. Головне — зібрати всю п'ятірку. */
IB.canParty=()=>{
  const L=IB.E.team[0];
  for(const m of IB.E.team)if(IB.dist(m.x,m.y,L.x,L.y)>8)return {ok:false,why:'Не вся група зібрана ('+m.name+' десь далеко) — натисни 🔊 ГУКАТИ (R)'};
  const t=IB.W.at(L.x,L.y);
  if(t===0)return {ok:false,why:'У морі гулянку не проведеш — вийди на берег'};
  const zone=IB.W.zoneAt?IB.W.zoneAt(L.x,L.y):'ЧОРНОМОРСЬК';
  const name=(t===1||t===13)?('ПЛЯЖ — '+zone):('МІСТО — '+zone);
  return {ok:true,spot:{id:'street',name:name,x:L.x,y:L.y}};
};
IB.partyStock=()=>{
  const drinks=(IB.G.inv.beer||0)+(IB.G.inv.wine||0)+(IB.G.inv.vodka||0)+(IB.G.inv.nalyva||0);
  const food=(IB.G.inv.yushka||0)+(IB.G.inv.banosh||0)+(IB.G.inv.kulesh||0)+(IB.G.inv.cookfish||0)+(IB.G.inv.berries||0)*2+(IB.G.inv.bread||0)+(IB.G.inv.brinza||0);
  return {drinks,food};
};
IB.startParty=()=>{
  const chk=IB.canParty();
  if(!chk.ok){IB.toast(chk.why,'red');IB.SFX.alert();return;}
  const st=IB.partyStock();
  const p=IB.G.party;
  /* v17.0: місце гулянки — просто точка на піску/тротуарі, без табору */
  IB.G.partySpot={x:chk.spot.x,y:chk.spot.y,name:chk.spot.name};
  p.active=true;p.t=0;p.hour=0;p.at=chk.spot.id;p.scenes=[];p.dry=(st.drinks<6||st.food<4);
  const L=IB.E.team[0];
  /* витрати */
  let d=0;
  const order=['vodka','wine','nalyva','beer'];
  for(const k of order){while(IB.G.inv[k]>0&&d<8){IB.G.inv[k]--;d++;}}
  while(d<8&&(IB.G.inv.berries>0)){IB.G.inv.berries--;d++;}
  let f=0;
  const foods=['yushka','banosh','kulesh','cookfish','bread','brinza','canned','eggs','potato'];
  for(const k of foods){while(IB.G.inv[k]>0&&f<6){IB.G.inv[k]--;f++;}}
  /* v2.3: танцювальні параметри героїв + фаза 0 */
  for(let i2=1;i2<IB.E.team.length;i2++){const h2=IB.E.team[i2];
    h2.pAng=IB.rnd(0,6.28);h2.pR=IB.rnd(1.6,3.0);h2.pW=IB.rnd(0.5,1.1)*(IB.M.random()<0.5?-1:1);
    h2.pSty=IB.rnd(0,1);h2.lying=0;h2.bubble=null;h2.lieDir=1.35;}
  IB.partyFx={lvl:0.35,mode:'warm',bT:1.5,wT:IB.rnd(16,26)};
  IB.MUSIC.partyPhase(0);
  IB.banner('🎉 ГУЛЯНКА ПОЧАЛАСЬ! '+IB.PARTY_PHASES[0].n+' 🎉');
  if(p.dry)IB.toast('Мало напиток/закуски — гулянка буде тихішою. Наступного разу закупіться у крамниці!','gold');
  IB.journalAdd('🎉','ГУЛЯНКА №'+(IB.G.stats.parties+1)+' — «'+chk.spot.name+'», почалася о '+IB.clockStr()+(p.dry?' (суха, без напиток).':'.') );
  IB.alertBox('ГУЛЯНКА: '+p.t.toFixed(0)+' / 8 ГОД','al-fun');
  IB.G.stats.parties++;
};
IB.partyTick=(dt)=>{
  const p=IB.G.party;
  p.t+=dt*0.05; /* 1 ігрова година = 20 c → 8 год = 160 c реального */
  const hourN=IB.M.floor(p.t);
  /* v2.3-fix: перехід фази тільки для годин 1..8 (hourN<8) — інакше «ГОДИНА 9/8» у журналі */
  if(hourN>p.hour&&hourN<8){
    p.hour=hourN;
    /* v2.3: фаза години — назва, музика, світло, глічі */
    const ph=IB.PARTY_PHASES[IB.M.min(hourN,7)];
    IB.MUSIC.partyPhase(hourN);
    IB.partyFx.mode=ph.mode;
    IB.banner('🔥 ГОДИНА '+(hourN+1)+'/8: '+ph.n);
    IB.journalAdd('🔥','ГОДИНА '+(hourN+1)+' — '+ph.n);
    const sc=IB.PARTY_SCENES[IB.ri(0,IB.PARTY_SCENES.length-1)];
    p.scenes.push(sc);
    IB.journalAdd(sc.i,sc.t+' — '+sc.x);
    IB.showScene(sc.i,sc.t,sc.x,true);
    IB.SFX.toast();
    const mb=p.dry?4:8; /* v1.5: суха гулянка гріє менше */
    for(const h of IB.E.team){
      h.mood=IB.clamp(h.mood+mb,0,100);
      h.alc=IB.clamp(h.alc+0.6,0,6);
      h.food=IB.clamp(h.food+6,0,100);
      h.water=IB.clamp(h.water-2,0,100);
    }
    /* бонус веселунця */
    const mx=IB.E.team.find(h=>h.id==='maksym');
    if(mx&&IB.M.random()<0.4){mx.mood=100;IB.toast('ROCK розганяє гулянку! Настрій групи — 100','fun');}
  }
  IB.partyFxTick(dt); /* v2.3: глічі, бульбашки-діалоги, «попадали» */
  if(p.t>=8){
    p.active=false;p.t=0;
    IB.partyFx.lvl=0;for(const h of IB.E.team){h.lying=0;h.bubble=null;}
    IB.G.hangover=6; /* до 12:00 */
    IB.MUSIC.day();
    IB.banner('ГУЛЯНКА ЗАВЕРШИЛАСЯ. ПОХМІЛЛЯ ДО 12:00...');
    IB.journalAdd('😵','Гулянка скінчилася о '+IB.clockStr()+'. Зранку — похмілля: вода, їжа або розсіл.');
    IB.alertBox('');
    IB.questCheck();
    /* сон групи трохи */
    for(const h of IB.E.team){h.hp=IB.clamp(h.hp-10,0,100);h.cold=0;}
  }
};

/* ---------- КОКТЕЙЛЬ «П'ЯТЬ ХВИЛЬ» — ТРІП-НІЧЬ (6 год) ---------- */
IB.TRIP_EFFECTS={
  /* v15.0: сни тріпу — МОРСЬКІ (замість баношу, Черемоша і смерек) */
  viktor:'Лєгенда бачить ЗОЛОТИЙ РЕЙД — пором махає йому з моря і кличе до скарбів морського дна',
  andriy:'TOXIC: небо стало АРБУЗОМ. З хмар капає сік. Він сміється і плаче одночасно',
  taras:'PABLO: дельфіни в морі співають шансон. Він упевнений, що вивчив їхні імена',
  petro:'DIIN: світ склався в ГЕОМЕТРІЮ — лінії хвиль сходяться до артефактів, він «бачить» карту скарбів порту',
  maksym:'ROCK: тіні пальм сміються з його жартів, а потім показують, де схований «той самий» краб',

};
/* v3.0: тріп перероблений на НІЧНУ ГУЛЯНКУ ПО МІСТУ — без коктейля і табору:
   після 18:00, вся група разом, у місті (набережна/центр/площа) */
IB.WALK_STOPS={
  viktor:'Лєгенда виводить групу на НАБЕРЕЖНУ — пальми, бриз і гудок порому. Київ здається далеким',
  andriy:'TOXIC знайшов у центрі шаурму «як в Одесі» — він плакав і куштував одночасно',
  taras:'PABLO торкався води з пірса «на удачу» — риба обіцяла клюнути завтра',
  petro:'DIIN зчитував ліхтарі набережної — «це ж пунктова геометрія міста», говорив і мив руки',
  maksym:'ROCK проводив екскурсію по пам\'ятнику Данченку — екскурсовод слухав і нотував',
};
IB.canTrip=()=>{
  const L=IB.E.team[0];
  const hour=IB.hStr();
  if(hour<18&&hour>4)return {ok:false,why:'Нічна гулянка починається після 18:00 (у темноті місто веселіше)'};
  const t=IB.W.at(L.x,L.y);
  if(t===0||t===16)return {ok:false,why:'Спершу вийди з води — гулянка по місту, не по дну'};
  for(const m of IB.E.team)if(IB.dist(m.x,m.y,L.x,L.y)>10)return {ok:false,why:'Не вся група поруч — натисни 🔊 ГУКАТИ (R)'};
  return {ok:true};
};
IB.startTrip=()=>{
  const chk=IB.canTrip();
  if(!chk.ok){IB.toast(chk.why,'red');IB.SFX.alert();return;}
  const p=IB.G.trip;
  p.active=true;p.t=0;p.hour=0;p.at='city';
  IB.MUSIC.trip();
  IB.banner('🌙 НІЧНА ГУЛЯНКА ПО МІСТУ — 6 ЗУПИНОК');
  IB.journalAdd('🌙','НІЧНА ГУЛЯНКА ПО МІСТУ: вся п\'ятірка вийшла на набережну о '+IB.clockStr()+'. Пальми, ліхтарі і шаурма — маршрути відкриті.');
  IB.alertBox('ГУЛЯНКА: '+p.t.toFixed(0)+' / 6 ГОД','al-fun');
  IB.G.stats.walks=(IB.G.stats.walks||0)+1;
  IB.G.flags.cityWalk=true;
  IB.questCheck();
};
IB.tripTick=(dt)=>{
  const p=IB.G.trip;
  p.t+=dt*0.05;
  const hourN=IB.M.floor(p.t);
  if(hourN>p.hour){
    p.hour=hourN;
    const idx=(p.hour-1)%5;
    const h=IB.E.team[idx];
    const txt=IB.WALK_STOPS[h.id];
    const stops=['НАБЕРЕЖНА — ПАЛЬМИ І БРИЗ','ЦЕНТР — ШАУРМА «ЯК В ОДЕСІ»','ПІРС — ВОДА НА УДАЧУ',
      'ПРОСП. МИРУ — ЛІХТАРІ І ВІКНА','ПЛОЩА — ЕКСКУРСІЯ РОКА','ПІРС — ЗУСТРІЛИ СВІТАНОК'];
    IB.journalAdd('🌙','ЗУПИНКА '+p.hour+'/6 — '+stops[(p.hour-1)%6]+': '+txt);
    IB.showScene('🌙','НІЧНА ГУЛЯНКА • ЗУПИНКА '+p.hour,txt);
    IB.SFX.trip();
    h.mood=100;
    for(const o of IB.E.team)if(o!==h)o.mood=IB.clamp(o.mood+14,0,100);
  }
  if(p.t>=6){
    p.active=false;
    IB.G.vision=IB.DAY_LEN;
    IB.MUSIC.day();
    IB.banner('СВІТАНОК НА ПІРСІ • НАТХНЕННЯ: АРТЕФАКТИ СВІТЯТЬСЯ (1 ДЕНЬ)');
    IB.journalAdd('🌅','Гулянка дійшла до світанку на пірсі. Море сміялося, чайки теж. Артефакти курорту світяться цілий день.');
    IB.alertBox('');
    IB.G.money+=100;
    IB.toast('+₴100 — нічна гулянка варта того (сувенірний ранок)','gold');
    IB.questCheck();
  }
};

/* ---------- АРТЕФАКТИ ---------- */
IB.ARTIFACTS=[
  {id:'a1',name:'ЯКОРЬ ПОРТУ',x:380,y:396,world:true,
   lore:'Якорь зі старого Іллічівського рейду. Моряки кажуть: він сам вибирає, кого тримати за берег.'},
  {id:'a2',name:'СКЛЯНКА МОРСЬКОГО СКЛА',x:181,y:480,world:true,
   lore:'Зелене скло, обточене морем за десятки років. З нього видно не майбутнє — минуле море.'},
  {id:'a3',name:'РАКУШКА СИРЕНИ',x:40,y:458,world:true,
   lore:'Кажуть, уночі вона співає голосом того, кого ти чекаєш на березі.'},
  {id:'a4',name:'ФІКЕЛЬ МАЯКА',x:424,y:490,world:true,
   lore:'Скло зі старого маяка. Світить не для кораблів — для тих, хто загубився в житті.'},
  {id:'a5',name:'МАЙКА «ПОРТ-ЧЕМПІОН»',x:250,y:460,world:true,hidden:true,
   lore:'Легендарна майка вантажника порту. Носиться тільки з сіллю на шкірі.'},
  {id:'a6',name:'БЕРЕГОВИЙ АМУЛЕТ',world:false,
   lore:'Нагорода рятувальника. У спеку і шторм герої втомлюються й перегріваються вдвічі повільніше.'},
  {id:'a7',name:'ПЛЯЖНА ГІТАРА',world:false,
   lore:'Гітара співака Едіка з кафе «Абрикос». Вечорами збирає всіх навколо. Музика з неї — як цілий день на пляжі.'},
  {id:'a8',name:'СТАРОВИННИЙ ЯКОРЬ ПАРКУ',x:212,y:164,world:true,
   lore:'Якорь з експозиції Парку якорів на вул. Парковій. Кажуть, він від барка «Паллада» — і тримає удачу тих, хто не боїться шторму.'},
];
IB.artHas=(id)=>IB.G.arts.includes(id);
IB.pickArtifact=(a)=>{
  if(IB.artHas(a.id))return;
  IB.G.arts.push(a.id);
  IB.G.stats.arts++;
  IB.SFX.find();
  IB.banner('АРТЕФАКТ: '+a.name);
  IB.journalAdd('🏺',a.name+' — '+a.lore);
  IB.toast('АРТЕФАКТ ЗНАЙДЕНО: '+a.name,'gold');
  if(a.id==='a6')IB.G.flags.amulet=true;
  if(a.id==='a7')IB.G.flags.violin=true;
  IB.questCheck();
};

/* ---------- КВЕСТИ ---------- */
IB.QUESTS=[
  {id:'q1',t:'ДО ПЛЯЖА!',d:'Ранок 6-го. Дійди з міста до МІСЬКОГО ПЛЯЖУ (південніше набережної — золотий пісок; ще зручніше — Приморськими сходами!).',
   chk:()=>IB.E.team[0]&&IB.E.team[0].y>=146,loc:()=>({x:160,y:455,name:'ПЛЯЖ'})},
  {id:'q2',t:'РІЕЛТОР «БІЛЯ МОРЕ»',d:'Квартири шукають через ріелтора: знайди офіс «БІЛЯ МОРЕ» у центрі (Сонячна, 1) і поговори з агенткою Вірою.',
   chk:()=>!!IB.G.flags.realtorVisited,loc:()=>({x:88,y:153,name:'РІЕЛТОР'})},
  {id:'q3',t:'ВСЕЛИТИСЯ!',d:'Обери житло в ріелтора і засели: ХОСТЕЛ / КВАРТИРА / ГОТЕЛЬ / БРОНКС. Оселя → дім групи.',
   chk:()=>!!IB.G.home,loc:()=>({x:262,y:384,name:'БРОНКС'})},
  {id:'q4',t:'ЗАПАСИ КУРОРТНИКА',d:'Купи на РИНКУ провізію: воду ×4 і арбуз. Мало води — ходиш повільно!',
   chk:()=>(IB.G.inv.water||0)>=4&&(IB.G.inv.melon||0)>=1,loc:()=>({x:98,y:62,name:'РИНОК'})},
  {id:'q5',t:'ПЕРШІ ХВИЛИ',d:'Зайди в МОРЕ і поплавай (шторм чекає — тоді ніякого моря).',
   chk:()=>!!IB.G.flags.swum,loc:()=>({x:160,y:460,name:'ПЛЯЖ'})},
  {id:'q6',t:'ШКИРКА ШОКОЛАДУ',d:'Загоряй на рушнику/шезлонгу, поки засмага не стане 40+.',
   chk:()=>(IB.G.tan||0)>=40,loc:()=>({x:160,y:455,name:'ПЛЯЖ'})},
  {id:'q7',t:'ФУТБОЛ 2×3',d:'Грай ФУТБОЛ 2×3 з місцевими на пляжних воротах (E біля воріт).',
   chk:()=>(IB.G.stats.football||0)>=1,loc:()=>({x:150,y:468,name:'ВОРОТА'})},
  {id:'q8',t:'ВОЛЕЙБОЛ НА ПІСКУ',d:'Грай ВОЛЕЙБОЛ через сітку (E біля сітки).',
   chk:()=>(IB.G.stats.volley||0)>=1,loc:()=>({x:64,y:452,name:'СІТКА'})},
  {id:'q9',t:'ГЕРОЙ ПЛЯЖУ',d:'Збери 10 пакетів СМІТТЯ з пляжу (E на купках) і здай у бак — порти за це платять.',
   chk:()=>(IB.G.stats.trash||0)>=10,loc:()=>({x:160,y:455,name:'ПЛЯЖ'})},
  {id:'q10',t:'ДЕЛЬФІНИ!',d:'Вийди в море на КАТАМАРАНІ чи ПОРОМІ — і дочекайся, коли поруч стрибнуть дельфіни.',
   chk:()=>!!IB.G.flags.dolphins,loc:()=>({x:130,y:473,name:'КАТАМАРАН'})},
  {id:'q11',t:'ПАРАШЮТ!',d:'Політи на ПАРАШЮТІ за катером (пірс, ₴600). 100 метрів над хвилями!',
   chk:()=>!!IB.G.flags.paras,loc:()=>({x:182,y:498,name:'ПІРС'})},
  {id:'q12',t:'ШТОРМ ЗА ВІКНОМ',d:'Переживи ШТОРМ у приміщенні (кафе/квартира/готель/кіно) — і море ошаліє.',
   chk:()=>!!IB.G.flags.stormSurvived,loc:()=>({x:160,y:455,name:'ПЛЯЖ'})},
  {id:'q13',t:'ФТО ЛЕТО — ФОТО ЛІТО',d:'Сфотографуй групу на ТРЬОХ точках курорту: пірс, порт, парк, Бронкс, маяк… (E біля точок).',
   chk:()=>{let n=0;for(const p of IB.G.album){if(p.kind==='pier'||p.kind==='port'||p.kind==='park'||p.kind==='bronx'||p.kind==='lighthouse'||p.kind==='beach'||p.kind==='market'||p.kind==='yacht')n++;}return n>=9;},
   loc:()=>({x:179,y:478,name:'ПІРС'})},
  {id:'q14',t:'КАЧОК ПЛЯЖУ',d:'Три тренування в КАЧАЛЦІ «Атлет» (E на дверях).',
   chk:()=>(IB.G.stats.gym||0)>=3,loc:()=>({x:80,y:237,name:'КАЧАЛКА'})},
  /* ===== v2.0 «РАЙОНИ І ЛЮДИ» — квести нових районів ===== */
  {id:'q15',t:'ПРИМОРСЬКІ СХОДИ',d:'155 сходинок, як у реальному Чорноморську: пройди ПРИМОРСЬКИМИ СХОДАМИ з Площі до міського пляжу (E на сходах).',
   chk:()=>!!IB.G.flags.stairsDone,loc:()=>({x:210,y:422,name:'СХОДИ'})},
  {id:'q16',t:'ЛУНА-ПАРК',d:'Центр міста: прокатайся на КОЛЕСІ ОГЛЯДУ і КАРУСЕЛІ луна-парку «Проспект Миру».',
   chk:()=>(IB.G.stats.wheel||0)>=1&&(IB.G.stats.carousel||0)>=1,loc:()=>({x:128,y:162,name:'КОЛЕСО'})},
  {id:'q17',t:'БАТУТ — 50 ГРН',d:'Стрибки на батуті (лун-парк, Молодіжний парк або пляж) — карма стрибунця.',
   chk:()=>(IB.G.stats.tramp||0)>=1,loc:()=>({x:136,y:171,name:'БАТУТ'})},
  {id:'q18',t:'ПАРК ЯКОРІВ',d:'Знайди на вул. Парковій СТАРОВИННИЙ ЯКОРЬ (артефакт) і сфотографуй парк якорів.',
   chk:()=>IB.artHas('a8')&&IB.G.album.some(p=>p.kind==='anchors'),loc:()=>({x:212,y:164,name:'ПАРК ЯКОРІВ'})},
  {id:'q19',t:'ГАЛЕРЕЯ БІЛОГО',d:'Музей образотворчих мистецтв ім. Олександра Білого (центр): подивись картини моря (E на дверях).',
   chk:()=>!!IB.G.flags.gallery,loc:()=>({x:252,y:153,name:'МУЗЕЙ БІЛОГО'})},
  {id:'q20',t:'СВОЇ НА КУРОРТІ',d:'Місто живе — знайомься! Поговори з 8 ЧОРНОМОРЦЯМИ (E на перехожих → «Познайомитись»).',
   chk:()=>Object.keys(IB.G.friends||{}).length>=8,loc:()=>({x:200,y:434,name:'НАБЕРЕЖНА'})},
  {id:'q21',t:'НЕДОСТАВЛЕНІ ЛИСТИ',d:'Пошта 68000: листоноша Юра віддає 6 листів по районах. Достав 3 ЛИСТИ (E на конвертах на карті).',
   chk:()=>(IB.G.stats.mail||0)>=3,loc:()=>({x:200,y:47,name:'ПОШТА'})},
  {id:'q22',t:'ЛОВИ ХВИЛЮ',d:'СЕРФ-прокат на Центральному пляжі: встигни на хвилю (E на дошках).',
   chk:()=>(IB.G.stats.surf||0)>=1,loc:()=>({x:200,y:466,name:'СЕРФ'})},
  {id:'q23',t:'ЛИМАН — ТИХА ВОДА',d:'Сухий лиман через міст: порибаль або купіться у лимані — вода каламутна і своя.',
   chk:()=>(IB.G.stats.limanFish||0)>=1||!!IB.G.flags.limanSwim,loc:()=>({x:390,y:293,name:'МІСТ'})},
  {id:'q24',t:'ПАЛЛАДА',d:'Екскурсія на СУДНОБУДІВНИЙ ЗАВОД за мостом: охоронець Іван проведе (E на воротах заводу).',
   chk:()=>!!IB.G.flags.zavodTour,loc:()=>({x:362,y:307,name:'ЗАВОД'})},
  {id:'q25',t:'РАЙОНИ — 5 ФОТО',d:'Чорноморськ по районах: фото в ПІВНІЧНОМУ, ЦЕНТРІ, ПІВДЕННОМУ, ПРИМОРСЬКОМУ і ПОРТУ.',
   chk:()=>{const s=new Set();for(const p of IB.G.album){if(p.districts)for(const d of p.districts)s.add(d);}return s.size>=5;},loc:()=>({x:220,y:160,name:'ЦЕНТР'})},
  {id:'q26',t:'ЛЕГЕНДА КУРОРТУ',d:'Фінал літа: 12 знайомих, 12 фотосерій, засмага 80+ і якорь-артефакт. Море запам’ятає вас.',
   chk:()=>Object.keys(IB.G.friends||{}).length>=12&&IB.G.album.length>=12&&(IB.G.tan||0)>=80&&IB.artHas('a8'),loc:()=>({x:179,y:478,name:'ПІРС'})},
  /* ===== v3.0 «ПАНЕЛІ І ЧАЙКИ» ===== */
  {id:'q27',t:'ЧАЙКИ — НАШІ ДРУЗІ',d:'На набережній стоять ГОДІВНИЦІ ЧАЙОК. Купи хліба і погодуй чайок 5 разів (E на лотку з хлібом).',
   chk:()=>(IB.G.stats.gullFeed||0)>=5,loc:()=>({x:120,y:433,name:'ГОДІВНИЦЯ'})},
  {id:'q28',t:'ВУЛИЧНІ БИТКИ',d:'У Порту і біля Бронксу шабашать БАНДИ — «ПОРТОВІ» і «БРОНКОВІ». Виграй 3 битки (X — удар).',
   chk:()=>(IB.G.stats.fightWin||0)>=3,loc:()=>({x:380,y:396,name:'ПОРТ'})},
  {id:'q29',t:'ОДЕСА — 25 КМ',d:'На півночі — ТРАСА ОДЕСА — ЧОРНОМОРСЬК. Дійди до знака «ОДЕСА 25 КМ» і сфотографуй групу (довго йти — як справжнім!).',
   chk:()=>!!IB.G.flags.odesaWalk,loc:()=>({x:80,y:14,name:'ТРАСА'})},
  {id:'q30',t:'СЕКОНД-ЛУК',d:'СЕКОНДХЕНД «АЛЬБАТРОС» у центрі: купи 2 речі (E на дверях) — модний курортний лук за копійки.',
   chk:()=>(IB.G.stats.second||0)>=2,loc:()=>({x:267,y:156,name:'СЕКОНДХЕНД'})},
  {id:'q31',t:'НОЧНА ГУЛЯНКА',d:'Після 18:00 запусти НІЧНУ ГУЛЯНКУ ПО МІСТУ (панель T або Q у центрі/набережній) — 6 зупинок до світанку.',
   chk:()=>!!IB.G.flags.cityWalk,loc:()=>({x:180,y:436,name:'НАБЕРЕЖНА'})},
  {id:'q32',t:'ЖИТЛО — ДІМ',d:'Північний масив — НОВІ ЖИТЛОВІ БУДИНИ з дворами і синіми козирками. Сфотографуй їх (E біля точки).',
   chk:()=>IB.G.album.some(p=>p.kind==='panel'),loc:()=>({x:70,y:104,name:'ЖИТЛОВІ БУДИНИ'})},
  /* ===== v3.1 «СІ, НІ ТА РЕЙВ» ===== */
  {id:'q33',t:'ХЛОПЕЦЬ ІЗ ДІВЧИНОЮ',d:'На пляжі, в центрі і біля клубу стоять ДІВЧАТА. Поговори (E) і ЗАПРОСИ ГУЛЯТИ — вона може забрати героя на 2..15 годин. Три побачення — легенда флірту.',
   chk:()=>(IB.G.stats.dates||0)>=3,loc:()=>({x:322,y:386,name:'КЛУБ «МАЯК»'})},
  {id:'q34',t:'КЛУБ «МАЯК»',d:'На набережній світиться НЕОН — КЛУБ «МАЯК». Зайди всередину: діджей, танцпол, бар і хостес Марічка. Туси щовечора.',
   chk:()=>!!IB.G.flags.clubVisit,loc:()=>({x:322,y:386,name:'КЛУБ'})},
  {id:'q35',t:'РЕЙВ П\'ЯТНИЦІ',d:'У П\'ЯТНИЦЮ радіо 103.2 FM оголошує РЕЙВ у клубі «Маяк». Прийди і натисни на пульт діджея (₴150) — танці до світанку.',
   chk:()=>(IB.G.stats.rave||0)>=1,loc:()=>({x:322,y:386,name:'КЛУБ'})},
  {id:'q36',t:'СІ І НІ',d:'ДЯДЯ СІ і ТІТКА НІ то приходять, то уходять: можуть бути у таборі, можуть гуляти містом. Поговори з ОБОМА (E) — і чекай, поки знову з\'являться.',
   chk:()=>!!IB.G.flags.siMet&&!!IB.G.flags.niMet,loc:()=>({x:60,y:142,name:'НАБЕРЕЖНА'})},
];
IB.SYS_Q=IB.QUESTS;
IB.questCheck=()=>{
  const q=IB.QUESTS.find(q=>q.id===IB.G.quests.active);
  if(!q)return;
  if(q.chk()){
    IB.G.quests.done.push(q.id);
    IB.SFX.done();
    IB.banner('КВЕСТ ВИКОНАНО: '+q.t);
    IB.journalAdd('✔','Квест виконано: '+q.t);
    IB.G.money+=50;
    IB.toast('+₴50 винагорода','gold');
    const next=IB.QUESTS.find(x=>!IB.G.quests.done.includes(x.id)&&x.id!==q.id);
    if(next){IB.G.quests.active=next.id;}
    else {IB.G.quests.active=null;IB.G.flags.seasonDone=true;
      IB.journalAdd('🏆','ЛЕГЕНДА ЛІТА: група з\'їла весь Чорноморськ — море пам\'ятатиме їх надовго.');}
  }
};
/* v1.2: фото на вершині — бонус і журнал */
IB.photoTaken=(spot)=>{
  /* v2.4: фотосерія — ТРИ КАДРИ з різними позами групи */
  const base=IB.G.day*17+IB.G.album.length;
  /* v2.0: район фото — для квесту «РАЙОНИ — 5 ФОТО» */
  let dkey='ІНШЕ';
  try{
    const zn=IB.W.zoneAt(spot.x,spot.y)||'';
    if(zn.indexOf('ПІВНІЧНИЙ')>=0)dkey='ПІВНІЧНИЙ';
    else if(zn.indexOf('ЦЕНТР')>=0)dkey='ЦЕНТР';
    else if(zn.indexOf('ПІВДЕННИЙ')>=0)dkey='ПІВДЕННИЙ';
    else if(zn.indexOf('ПРИМОРСЬКИЙ')>=0)dkey='ПРИМОРСЬКИЙ';
    else if(zn.indexOf('ПОРТ')>=0)dkey='ПОРТ';
  }catch(e){}
  for(let v=0;v<3;v++)IB.G.album.push({spot:spot.id,name:spot.name,kind:spot.kind,alt:spot.alt||0,
    day:IB.G.day,time:IB.clockStr(),wx:IB.G.wx.type,seed:base+v*13,var:v,districts:[dkey]});
  IB.G.stats.photos+=3;
  IB.SFX.find();
  IB.banner('ФОТО ×3 КАДРИ: '+spot.name);
  IB.journalAdd('📷','Фотосерія «'+spot.name+'» — три кадри: УСІ РАЗОМ, СТРИБОК!, ПРАПОРЕЦЬ. '+
    IB.clockStr()+', день '+IB.G.day+'. Найбільше всіх м\'явся TOXIC.');
  {IB.G.money+=25;IB.toast('+₴25 — редактор «Чорноморського Тижня» купує серію','gold');}
  IB.toast('3 кадри в альбомі (група → ФОТОАЛЬБОМ)','gold');
  IB.saveGame();
  IB.questCheck();
};


IB.questT=()=>{const q=IB.QUESTS.find(q=>q.id===IB.G.quests.active);return q?q.t:'ВСЕ ЗРОБЛЕНО — ЛЕГЕНДА ЖИВЕ';};

/* ---------- v2.0 «ЗНАЙОМИТИСЬ» — соціальна мережа курорту ---------- */
IB.friendMeet=(n)=>{
  if(!n||!n.name)return null;
  if(!IB.G.friends)IB.G.friends={};
  if(IB.G.friends[n.name])return IB.G.friends[n.name];
  const f={lvl:1,met:IB.G.day,district:IB.W.zoneAt?IB.W.zoneAt(n.x,n.y):''};
  IB.G.friends[n.name]=f;
  IB.G.stats.met=(IB.G.stats.met||0)+1;
  IB.toast('ЗНАЙОМСТВО: '+n.name+' ('+f.district+')','fun');
  IB.journalAdd('🤝','Знайомство: '+n.name+' — '+f.district+'. Місто стає ближнім.');
  IB.questCheck();
  return f;
};
IB.friendTalk=(n)=>{
  /* повторна розмова: дружба росте, на lvl2 — подарунок, lvl3 — підказка */
  const f=n&&IB.G.friends&&IB.G.friends[n.name];
  if(!f)return null;
  if(f.lvl<3&&IB.M.random()<0.5){
    f.lvl++;
    if(f.lvl===2){
      const gift=[['beer',1],['moroz',1],['lemon',1],['corn',1]][IB.ri(0,3)];
      const GN={beer:'локальне пиво',moroz:'морозиво',lemon:'лимонад',corn:'кукурудзу'};
      IB.G.inv[gift[0]]=(IB.G.inv[gift[0]]||0)+gift[1];
      IB.toast(n.name+' тепер ПРИЯТЕЛЬ: подарував '+GN[gift[0]],'gold');
      IB.G.money+=15;
    }else{
      IB.toast(n.name+' тепер ДРУГ: у кафе для вас — знижка 20%','gold');
    }
  }
  return f;
};
IB.friendDiscount=()=>{
  /* якщо поруч із героєм стоїть друг lvl3 — знижка в кафе/крамниці */
  const L=IB.E.team[0];if(!L)return 0;
  for(const n of IB.E.npcs){
    if(IB.G.friends&&IB.G.friends[n.name]&&IB.G.friends[n.name].lvl>=3&&IB.dist(n.x,n.y,L.x,L.y)<6)return 0.2;
  }
  return 0;
};
IB.friendCount=()=>Object.keys(IB.G.friends||{}).length;

/* ---------- v2.0 УКРПОШТА — листи по районах ---------- */
IB.mailDeliver=(p)=>{
  IB.G.stats.mail=(IB.G.stats.mail||0)+1;
  IB.G.money+=25;
  const P=IB.W.props,pi=P.indexOf(p);
  if(pi>=0){P.splice(pi,1);IB.W.grid.delete(p.y*IB.W.W+p.x);}
  IB.SFX.find();
  IB.toast('ЛИСТ ДОСТАВЛЕНО ('+p.district+'): +₴25 від пошти','gold');
  IB.journalAdd('✉','Лист у '+p.district+' доставлено. Юра з пошти святкує.');
  IB.questCheck();
};

/* ---------- ДОРОУЧЕННЯ СЕЛЯН (side) ---------- */
IB.SIDES={
  trash:{npc:'прибиральник Тарас',t:'ЧИСТИЙ ПЛЯЖ',d:'Принести прибиральнику Тарасу 5 пакетів сміття (E на купках на піску).',need:()=>IB.G.inv.trash>=5,
    give(){IB.G.inv.trash-=5;IB.G.money+=80;return '₴80 + повага порту';}},
  fish:{npc:'бабуся Оля',t:'РИБА ДЛЯ БАБУСІ',d:'Принести бабусі Олі (Ринок) 3 свіжі риби — вийде юшка на всіх.',need:()=>IB.G.stats.fish>=3,
    give(){IB.G.stats.fish-=3;IB.G.inv.melon+=2;IB.G.money+=30;return 'арбуз ×2 + ₴30';}},
  cream:{npc:'рятувальник Степан',t:'БЕЗПЕКА НА ВОДІ',d:'Рятувальник Степан просить: збери 3 пакети сміття біля його вишки — видасть КРЕМ від сонця на цілий день.',
    need:()=>IB.G.flags.creamEarned,give(){IB.G.flags.creamEarned=false;IB.G.flags.creamDay=IB.G.day;IB.G.money+=30;return 'крем від сонця (день)';}},
  port:{npc:'вантажник Петро',t:'ЗМІНА В ПОРТУ',d:'Працювати з вантажником Петром у порту (E в морвокзалі → «Зміна в порту»).',need:()=>IB.G.flags.portShift,
    give(){IB.G.flags.portShift=false;IB.G.money+=40;return 'бонус ₴40';}},
  singer:{npc:'співак Едік',t:'ПІСНЯ ЗА ГІТАРУ',d:'Купити в Едіка в кафе «Абрикос» напиток на 10 монет загалом — віддасть ПЛЯЖНУ ГІТАРУ.',need:()=>(IB.G.flags.cafeSpent||0)>=10,
    give(){IB.pickArtifact(IB.ARTIFACTS[6]);return 'Пляжна гітара';}},
  rescue:{npc:'рятувальник Степан',t:'ЗАГУБЛЕНА ДИТИНА',d:'Дитину загубили на пляжі! Знайди (блакитний маркер) і приведи до рятувальної вишки.',
    need:()=>IB.G.touristDone,give(){IB.G.money+=60;return '₴60 від батьків';}},
  /* ===== v2.0: ДОРУЧЕННЯ ПО РАЙОНАХ ===== */
  mail:{npc:'листоноша Юра',t:'ПАКЕТ ЛИСТІВ',d:'Взяти в Юри (пошта) пакет листів — достав 3 листи по районах (E на конвертах).',
    need:()=>(IB.G.stats.mail||0)>=3,give(){IB.G.money+=80;return '₴80 від пошти';}},
  oxana:{npc:'бармен Оксана',t:'ВОДА ДЛЯ БАРУ',d:'Бар «Шейкер» на пляжі: принести бармену Оксани 3 упаковки води (riнок/крамниця).',
    need:()=>IB.G.flags.oxanaDone,give(){IB.G.flags.oxanaDone=false;IB.G.inv.water=IB.M.max(0,(IB.G.inv.water||0)-3);IB.G.money+=45;IB.G.inv.lemon=(IB.G.inv.lemon||0)+2;return '₴45 + лимонад ×2';}},
  mitia:{npc:'дворник Митя',t:'ЧИСТИЙ ПІВНІЧНИЙ',d:'Дворник Митя (Північний масив): 5 пакетів сміття — район сяє.',
    need:()=>IB.G.inv.trash>=5,give(){IB.G.inv.trash-=5;IB.G.money+=70;return '₴70 від комунальних';}},
  grisha:{npc:'рибалка Гриша',t:'РИБА З ЛИМАНУ',d:'Рибалка Гриша (міст через лиман): принести 3 риби саме з лиману.',
    need:()=>IB.G.stats.limanFish>=3,give(){IB.G.stats.limanFish-=3;IB.G.money+=60;return '₴60 + новий секрет місця';}},
  tamara:{npc:'касирка Тамара',t:'СЕАНС ДЛЯ СВОЇХ',d:'Касирка кіно «Море-фільм»: подивитись вечірній сеанс (E на екрані кіно).',
    need:()=>IB.G.flags.cineSeen,give(){IB.G.flags.cineSeen=false;IB.G.money+=30;IB.G.inv.popcorn=(IB.G.inv.popcorn||0)+1;return '₴30 + попкорн';}},
  kostia:{npc:'капітан Костя',t:'ВИХІД У МОРЕ',d:'Капітан Костя (яхт-клуб «Вітер»): сходити в море на човні — рибалка в морі (T).',
    need:()=>IB.G.stamps.r_boat,give(){IB.G.money+=50;return '₴50 + повага клубу';}},
  zina:{npc:'продавчиня Зіна',t:'АРБУЗИ ДЛЯ РЯДКИ',d:'Зіна з Приморського ринку: принести 2 арбуза з ринку «Північний» — солодші там.',
    need:()=>IB.G.flags.zinaDone,give(){IB.G.flags.zinaDone=false;IB.G.inv.melon=IB.M.max(0,(IB.G.inv.melon||0)-2);IB.G.money+=50;return '₴50 + сніданок';}},
  liuda:{npc:'офіціантка Люда',t:'КОМПЛЕКСИ ОБІДІВ',d:'Люда з їдальні «Хвиля»: пообідати комплексом ×3 (E на роздачі).',
    need:()=>IB.G.flags.lunchCount>=3,give(){IB.G.flags.lunchCount=0;IB.G.money+=40;return '₴40 + компот безкоштовно';}},
  doro:{npc:'машиніст Дорофеïч',t:'ПАРОВОЗИК КРУТИТЬСЯ',d:'Машиніст Дорофеïч (Молодіжний парк): покататись на паровозику — сміх малечі в нагороду.',
    need:()=>IB.G.stats.train>=1,give(){IB.G.money+=25;return '₴25 + льодяник';}},
  zhenia:{npc:'автодромник Женя',t:'ГАЗ ДО ПІДЛОГИ',d:'Женя з луна-парку: прокат на АВТОВДРОМІ — побий свій рекорд кола.',
    need:()=>IB.G.stats.autodrom>=1,give(){IB.G.money+=35;return '₴35 + значок «Пілот»';}},
  /* ===== v3.0 «ПАНЕЛІ І ЧАЙКИ» ===== */
  gulls:{npc:'стара Галя з хлібом',t:'ХЛІБ ДЛЯ ЧАЙОК',d:'Галя з набережної: погодуй чайок 5 разів (E на годівниці) — вона платить за добре серце.',
    need:()=>(IB.G.stats.gullFeed||0)>=5,give(){IB.G.money+=60;IB.G.inv.bread=(IB.G.inv.bread||0)+2;return '₴60 + хліб ×2';}},
  second:{npc:'Коля з «Альбатроса»',t:'МОДНИК КУРОРТУ',d:'Коля з секондхенду «Альбатрос»: купи 2 речі — і станеш легендою стилю за 40 гривень.',
    need:()=>(IB.G.stats.second||0)>=2,give(){IB.G.money+=40;return '₴40 + повага стилю';}},
};

/* ---------- ФЕРМА ---------- */
IB.SYS.farmTick=(h)=>{
  for(const cid in IB.G.camps){
    const f=IB.G.camps[cid].farm;
    if(f.built&&f.planted&&!f.ready){f.grow+=0.5;f.stage=IB.M.min(3,IB.M.floor(f.grow));
      IB.floatMsg(h.x,h.y,'🌱');IB.logLine(h.name+' доглядає грядку');}
    else IB.floatMsg(h.x,h.y,'🌱');
  }
};
IB.SYS.autoCook=(h)=>{
  const inv=IB.G.inv;
  /* v17.0: кухар TOXIC готує де завгодно (плитка в квартирі/походна плитка) */
  if(inv.fishraw>=1){inv.fishraw--;inv.cookfish++;IB.floatMsg(h.x,h.y,'🍲');IB.logLine(h.name+' готує смажену рибу');}
};
/* v17.0: рецепти БЕЗ вогню (плитка у квартирі) і БЕЗ карпатської кухні */
IB.RECIPES=[
  {id:'cookfish',n:'Смажена риба',need:{fishraw:1},out:1},
  {id:'yushka',n:'Юшка',need:{fishraw:2,herb:1},out:1},
  {id:'banosh',n:'Плов портовий',need:{brinza:1,canned:1},out:1},
  {id:'kulesh',n:'Макарони з сиром',need:{potato:2,brinza:1},out:1},
  {id:'nalyva',n:'Наливка (2 шт)',need:{berries:3},out:2},
];
IB.cook=(idx)=>{
  const r=IB.RECIPES[idx];if(!r)return false;
  const L=IB.E.team[0];
  /* v17.0: готуємо БЕЗ ВОГНИЩА — плитка в квартирі або походна плитка */
  for(const k in r.need)if((IB.G.inv[k]||0)<r.need[k]){IB.toast('Не вистачає: '+k,'red');return false;}
  for(const k in r.need)IB.G.inv[k]-=r.need[k];
  IB.G.inv[r.id]=(IB.G.inv[r.id]||0)+r.out;
  IB.SFX.eat();
  IB.toast('ПРИГОТОВАНО: '+r.n+(L&&IB.E.team.find(h=>h.id==='andriy'&&IB.dist(h.x,h.y,L.x,L.y)<12)?' (+TOXIC додав смаку)':''),'gold');
  IB.journalAdd('🍲','Приготовано: '+r.n);
  return true;
};

/* ---------- ПОДІЇ ---------- */
IB.eventsTick=(dt)=>{
  /* v3.1: ЗАПРОШЕННЯ від людей — група може покликати на вечірку/гулянку */
  IB.G.inviteT-=dt;
  if(IB.G.inviteT<=0){
    IB.G.inviteT=IB.rnd(200,380);
    const m=IB.MAIN&&IB.MAIN.getMode?IB.MAIN.getMode():'game';
    if(m==='game'&&!IB.G.party.active&&!IB.G.trip.active)IB.groupInvite();
  }
  IB.G.evT-=dt;
  if(IB.G.evT<=0){
    IB.G.evT=IB.rnd(140,240);
    const r=IB.M.random();
    const L=IB.E.team[0];
    if(r<0.30&&!IB.E.tourist&&!IB.G.touristDone){IB.spawnTourist();}
    else if(r<0.48){
      /* дельфіни пропливли */
      if(!IB.E.dolphins)IB.E.dolphins=[];
      const bx=IB.clamp(L.x+IB.rnd(-14,14),8,IB.W.W-8),by=IB.clamp(IB.M.max(L.y+6,159),159,IB.W.H-4);
      for(let i=0;i<3;i++)IB.E.dolphins.push({x:bx+i*2.2,y:by+IB.rnd(-1.5,1.5),t:IB.rnd(0,3),life:IB.rnd(14,22)});
      IB.toast('ДЕЛЬФІНИ! Стрибають поруч — встигни сфотографувати!','fun');IB.SFX.bird();
    }
    else if(r<0.62){
      /* музика з кафе / вуличний співак */
      IB.toast('З кафе «Абрикос» доноситься «Одеса-мама» — літо живе','');IB.SFX.bird();
      for(const h of IB.E.team)h.mood=IB.clamp(h.mood+3,0,100);
    }
    else if(r<0.74){
      if(IB.G.wx.type==='thunder'){
        IB.G.flashT=0.22;IB.SFX.alert();
        IB.toast('БЛИСКАВКА! Грім котиться над морем','red');
      }else if(IB.G.wx.type==='storm'){
        IB.GFX.shake=IB.M.max(IB.GFX.shake||0,0.6);
        IB.toast('Хвиля б\'ється об хвилеріз — берег заливає','red');
      }
      else IB.toast('Чайки ділять у когось хот-дог','fun');
    }
    else if(r<0.86){
      /* знайшли щось на піску */
      if(IB.M.random()<0.5){IB.G.money+=IB.ri(5,15);IB.toast('Знайшли монети на піску: +₴','gold');}
      else {IB.G.inv.corn=(IB.G.inv.corn||0)+1;IB.toast('Хтось забув кукурудзу — ваша!','fun');}
    }
    else {
      /* сміття прибилоє хвилею */
      if(IB.W.spawnBeachTrash)IB.W.spawnBeachTrash();
      IB.toast('Прибій викинув на берег сміття — прибиральники радіють','');
    }
  }
  /* дельфіни живуть і пливають */
  if(IB.E.dolphins){
    for(let i=IB.E.dolphins.length-1;i>=0;i--){
      const d=IB.E.dolphins[i];
      d.t+=dt;d.life-=dt;d.x+=dt*0.7;
      if(d.life<=0||d.x>IB.W.W-4)IB.E.dolphins.splice(i,1);
    }
    /* фото дельфінів — якщо лідер у морі чи на пірсі поруч */
    const L=IB.E.team[0];
    if(!IB.G.flags.dolphins&&IB.E.dolphins.length){
      const d0=IB.E.dolphins[0];
      if(IB.dist(L.x,L.y,d0.x,d0.y)<10&&(L.swim||IB.W.at(L.x,L.y)===14)){
        IB.G.flags.dolphins=true;IB.banner('ДЕЛЬФІНИ ПОРЯД!');
        IB.journalAdd('🐬','Дельфіни стрибали поруч з групою. Море привітало легенду.');
        IB.questCheck();
      }
    }
  }
  /* шторм: пережитий у приміщенні */
  if(IB.G.wx.type==='storm'){
    if(modeIndoor())IB.G.stormT=(IB.G.stormT||0)+dt;else IB.G.stormT=0;
    if(IB.G.stormT>20&&!IB.G.flags.stormSurvived){
      IB.G.flags.stormSurvived=true;
      IB.banner('ШТОРМ ПЕРЕЖИТО ЗА ВІКНОМ');
      IB.journalAdd('🌊','Пережили шторм у приміщенні. Море ошаліло, а група п\'є каву.');
      IB.questCheck();
    }
    /* гроза не дає загинути: під час шторму ніхто не відбивається */
  }
  /* блискавка-таймер */
  if(IB.G.flashT){IB.G.flashT-=dt;if(IB.G.flashT<=0)IB.G.flashT=0;}
};
function modeIndoor(){
  const M=IB.MAIN&&IB.MAIN.getMode?IB.MAIN.getMode():'game';
  return M==='interior'||M==='panel'||M==='dialog';
}

/* ---------- v1.5/v2.2: ГУКАТИ — група кричить, загублені біжать на голос ---------- */
IB.SHOUTS=['АУ-У-У!','ГЕ-ЕЙ!','ЛЕГЕНДО!','ВІКТОРЕ!','ТИ ДЕ?!','ВІДКЛИКАЙСЯ!','ЛЮ-У-ДИ!'];
IB.startSearch=()=>{
  if(IB.G.party.active||IB.G.trip.active){IB.toast('Зараз не до пошуку — гулянка триває!','red');return;}
  if(modeSearchBlock())return;
  const L=IB.E.team[0];
  /* загублений = далеко від лідера І далеко від усіх інших */
  const lost=IB.E.team.slice(1).filter(h=>IB.dist(h.x,h.y,L.x,L.y)>12&&
    IB.E.team.every(o=>o===h||IB.dist(h.x,h.y,o.x,o.y)>8));
  if(!lost.length){
    IB.toast('Уся група тут! Ніхто не загубився','fun');
    return;
  }
  /* ті, хто поруч — бігають і кричать 8 секунд */
  for(const h of IB.E.team){
    if(h!==L&&IB.dist(h.x,h.y,L.x,L.y)<=12){h.searchT=8;h.shoutT=0;}
  }
  /* загублені: кидають доручення і йуть на голоси (до лідера) */
  for(const m of lost){
    if(m.target)IB.nodeUsed.delete(m.target);
    m.gotoSound=true;m.target=null;m.taskT=0;
  }
  IB.G.search={t:0,lost:lost.map(h=>h.name)};
  IB.banner('🔊 ГУКАЄМО: '+lost.map(h=>h.name).join(', ')+' — «АУ-У-У!»');
  IB.journalAdd('🔊','Гук: '+lost.map(h=>h.name).join(', ')+'. Група кричить — загублені біжать на голос.');
  IB.SFX.alert();
};
function modeSearchBlock(){
  const m=IB.MAIN&&IB.MAIN.getMode?IB.MAIN.getMode():'game';
  if(m!=='game'){IB.toast('Спочатку закрий панель/діалог — потім шукай','red');return true;}
  return false;
}
IB.searchFound=(h)=>{
  h.gotoSound=false;h.task='follow';h.target=null;
  IB.banner('✓ '+h.name+' ЗНАЙШОВ ГРУПУ НА ГОЛОС!');
  IB.journalAdd('✓',h.name+' ішов на голоси — і знайшов групу.');
  for(const o of IB.E.team)o.mood=IB.clamp(o.mood+6,0,100);
  IB.SFX.done();
  if(IB.G.search){
    IB.G.search.lost=IB.G.search.lost.filter(n=>n!==h.name);
    if(!IB.G.search.lost.length){IB.G.search=null;IB.toast('ВСІХ ЗНАЙШЛИ!','gold');}
  }
};
IB.searchTick=(dt)=>{
  if(!IB.G.search)return;
  IB.G.search.t+=dt;
  if(IB.G.search.t>30){
    IB.G.search=null;
    IB.toast('Гук відлунав — хто загубився, все одно біжить на голоси','gold');
  }
};

/* туриста (дитину) врятовано */
IB.SYS.touristRescued=(camp)=>{
  camp=camp||{name:'рятувальної вишки'};
  const t=IB.E.tourist;
  IB.E.tourist=null;
  IB.G.money+=50;
  IB.G.touristDone=true;
  IB.SFX.done();
  IB.banner('ДИТИНУ ВРЯТОВАНО! +₴60');
  IB.journalAdd('🎒','Врятували загублену на пляжі дитину і привели до «'+camp.name+'».');
  IB.toast('+₴60 за порятунок','gold');IB.G.flags.rescueDone=true;IB.questCheck();
  for(const h of IB.E.team)h.mood=IB.clamp(h.mood+10,0,100);
};

/* ---------- ЧАС/ДНІ ---------- */
IB.SYS.onNewHours=(hrs)=>{
  /* по нових годинах: зміна погоди, події, зростання */
  for(let i=0;i<IB.M.ceil(hrs/3);i++)if(IB.M.random()<0.5)IB.WX.next();
};

/* v1.5: ТЕМП ЧАСУ — користувач: «день проходить надто швидко». 0.05 → 0.036:
   1 ігрова година ≈ 28 сек реального часу, доба ≈ 11.2 хв (було 8 хв).
   Швидкості виживання масштабовані IB.SURV, щоб тиск на добу не зріс. */
IB.CLOCK_RATE=0.02;   /* v18.2: час у 1.8 раза повільніший — 1 ігр.година ≈ 50 с, доба ≈ 20 хв */
IB.SURV=0.72; /* 0.05/0.036 — їжа/вода/холод/паливо за секунду реального часу */

IB.timeTick=(dt)=>{
  const prevH=IB.hStr();
  IB.G.t+=dt*IB.CLOCK_RATE;
  if(IB.G.t>=24){IB.G.t-=24;IB.G.day++;
    /* i3-rent-patch: оренда житла за нову добу + ранкове сміття на пляжі */
    if(IB.G.home){
      if(IB.G.day>IB.G.home.expDay){
        if(IB.G.money>=IB.G.home.rent){IB.G.money-=IB.G.home.rent;IB.G.home.expDay=IB.G.day+1;
          IB.toast('Оренда «'+IB.G.home.label+'» оплачена: −₴'+IB.G.home.rent,'gold');}
        else{IB.toast('Не вистачає на оренду! Виселяємось → ХОСТЕЛ','red');
          IB.G.home={id:'hostel',label:'ХОСТЕЛ «ХВИЛЬКА» — КІМНАТА',rent:300,expDay:IB.G.day+1};}
      }
    }
    IB.flatDueTick&&IB.flatDueTick();   /* v5.0: оренда квартир (місяць) */
    if(IB.W.spawnBeachTrash)IB.W.spawnBeachTrash();
    IB.banner('ДЕНЬ '+IB.G.day+' • '+IB.WX.cur().label);
    IB.journalAdd('☀','Настав день '+IB.G.day+'. Погода: '+IB.WX.cur().label+'.');
    /* ---------- v18 С1: зміна акта літа ---------- */
    const actNow=IB.act();
    if(IB.G._actSeen!==actNow){
      IB.G._actSeen=actNow;
      IB.banner('🎬 '+IB.actName());
      IB.journalAdd('🎬','Починається '+IB.actName()+'. '+IB.actDesc());
      IB.cineStart&&IB.cineStart(IB.actName(),4);
    }
    /* ---------- v18 С3: «Східні» приїжджають з Одеси (акт II) ---------- */
    if(actNow>=2&&!IB.G.flags.rivalsIn){
      IB.G.flags.rivalsIn=true;
      IB.spawnRivals&&IB.spawnRivals();
      IB.radioBroadcast&&IB.radioBroadcast('На пляжі з\'явилася ватага «Східні» з Одеси — п\'ять хлопців з власними майданчиками. Хтось шепче бандам про ставки...');
      IB.journalAdd('🏁','Акт II: з Одеси приїхали «Східні» — матч, батут, рейв-контест. Фінальне розмірення — у акті III.');
    }
    /* ---------- v18 С6: «розборки на набережній» (два свідання за день) ---------- */
    if((IB.G._dateGirls||[]).length>=2){
      IB.addRep&&IB.addRep('girls',-6,'побачення з двома за один день — «розборки на набережній»');
      IB.toast('💗 Розборки на набережній! Дві дівчини дізналися одна про одну. Репутація дівчат −6','red');
      IB.journalAdd('💔','Розборки на набережній: два свідання за один день дорого коштували.');
      IB.cineStart&&IB.cineStart('РОЗБОРКИ НА НАБЕРЕЖНІЙ',3.5);
    }
    IB.G._dateGirls=[];
    /* ---------- v18 М6: автосейв на зміну дня ---------- */
    try{IB.saveGame(IB.G.slot||0,true);}catch(e){}
    /* ---------- v18 С7: пропси подій дня ---------- */
    try{
      IB.W.props=IB.W.props.filter(pr=>pr.type!=='screen'&&pr.type!=='stall');
      if(IB.eventToday()==='fair'){
        for(let i=0;i<6;i++)IB.W.props.push({x:150+i*16,y:434,type:'stall',seed:.9});
        IB.journalAdd('🏪','Ярмарок сел розгорнув намети на набережній.');
      }
    }catch(e){}
  }
  if(IB.hStr()!==prevH){
    if(IB.M.random()<0.4)IB.WX.next();
    IB.questCheck();
    /* ---------- v19.0: ФАЗИ ДОБИ — банер на зміні фази (атмосфера ніч/день) ---------- */
    {
      const ph9=IB.dayPhase?IB.dayPhase():null;
      if(ph9&&IB._lastPhase!==undefined&&IB._lastPhase!==ph9.id){
        const PH_LINES={deep:'🌚 ГЛИБОКА НІЧ — місто засинає, ліхтарі і фонарики...',
          predawn:'🌫️ ПЕРЕДРАНОК — найтихіша година, трохи світлішає',
          dawn:'🌅 СВІТАНОК — перше світло над морем',
          morning:'🌤️ РАНОК — місто прокидається',
          noon:'☀️ ПОЛУДЕНЬ — спека, ховайся у тінь козирків',
          late:'🌞 ПІЗНИЙ ДЕНЬ — золото на воді',
          sunset:'🌇 ЗАХІД СОНЦЯ — золота година курорту',
          dusk:'🌆 СУМЕРКИ — вмикаються вогні панельок і клубу',
          night:'🌙 НІЧ — темніє; фонарики (F) світять шлях'};
        IB.banner(PH_LINES[ph9.id]||(ph9.icon+' '+ph9.name));
        IB.journalAdd(ph9.icon,'Фаза доби: '+ph9.name+' ('+IB.clockStr()+').');
      }
      if(ph9)IB._lastPhase=ph9.id;
    }
    /* ---------- v18 С2: спуск «Паллади» — день 28, 12:00 ---------- */
    if(IB.G.day===28&&IB.hStr()===12&&!IB.G.flags.palLaunched)IB.palLaunch();
    /* ---------- v18 С1: фінальна вечірка і титри — день 30, 20:00 ---------- */
    /* v18 С7: кіно на піску — екран на пляжі о 20:00 */
    if(IB.hStr()===20&&IB.eventToday()==='cinema'){
      try{
        IB.W.props=IB.W.props.filter(pr=>pr.type!=='screen');
        IB.W.props.push({x:196,y:452,type:'screen',seed:.9});
        IB.banner('🎬 КІНО НА ПІСКУ — ЕКРАН ВСТАНОВЛЕНО');
      }catch(e){}
    }
    if(IB.G.day===30&&IB.hStr()===20&&!IB.G.flags.finaleShown){
      IB.G.flags.finaleShown=true;
      IB.cineStart&&IB.cineStart('ФІНАЛЬНА ВЕЧІРКА ЛІТА — САЛЮТ НАД МОРЕМ',5,'fireworks');
      IB.G.party.active=true;IB.G.party.t=0;
      setTimeout(()=>{IB.finaleCredits&&IB.finaleCredits();},6500);
    }
    /* ---------- v18 С7: подія дня — анонс на радіо о 9:00 ---------- */
    if(IB.hStr()===9){
      const ev=IB.eventToday();
      const EVN={fish:'СЬОГОДНІ — РИБНИЙ ФЕСТИВАЛЬ на набережній: улов подвійний!',
        basket:'СЬОГОДНІ — ДЕНЬ БАСКЕТБОЛУ у дворах: призи подвійні!',
        cinema:'УВЕЧЕРІ — КІНО НА ПІСКУ: екран на пляжі, початок по темряві.',
        fair:'СЬОГОДНІ — ЯРМАРОК СЕЛ на набережній: кукурудза, кавуни, бринза.'};
      if(ev&&EVN[ev])IB.radioBroadcast&&IB.radioBroadcast(EVN[ev]);
    }
    /* ---------- v18 С2: анонс спуску за день ---------- */
    if(IB.G.day===27&&IB.hStr()===9)IB.radioBroadcast&&IB.radioBroadcast('ЗАВТРА о 12:00 — СПУСК НА ВОДУ СУДНА «ПАЛЛАДА»! Гудки порту о 11:30. Запрошується все місто!');
    if(IB.G.hangover>0){IB.G.hangover--;
      if(IB.G.hangover===0){IB.toast('Похмілля минулося!','gold');IB.journalAdd('🌞','Похмілля минулося.');}}
    if(IB.G.vision>0){IB.G.vision-=IB.DAY_LEN/24*1;if(IB.G.vision<=0){IB.G.vision=0;IB.toast('Зоряне бачення згасло');}}
  }
};

/* ---------- ШВИДКІСТЬ ГЕРОЯ ---------- */
IB.heroSpeed=(h)=>{
  let s=h.swim?1.8:3.4;
  if(h.id==='viktor'&&h.running)s=h.swim?2.5:5.0;
  if(h.slowed)s*=0.55;
  if(h.thirsty)s*=0.78;          /* мало води — повільний */
  if(h.heatstroke)s*=0.6;        /* сонячний удар */
  if(IB.G.hangover>0&&IB.hStr()<12)s*=0.8;
  s*=IB.WX.cur().spd;
  if(IB.G.wx.type==='storm')s*=0.85;
  if(h.swim&&(IB.G.wx.type==='storm'||IB.G.wx.type==='thunder'))s*=0.6;
  return s;
};

/* ---------- ЗБЕРЕЖЕННЯ ---------- */
/* v18 М6: СЛОТИ — слот 0 = старий ключ (сумісність), слоти 1-2 — нові */
IB.saveGame=(slot,silent)=>{
  if(slot===undefined)slot=IB.G.slot||0;
  IB.G.slot=slot;
  try{
    const team=IB.E.team.map(h=>({id:h.id,x:h.x,y:h.y,hp:h.hp,food:h.food,water:h.water,mood:h.mood,alc:h.alc,pocket:h.pocket||0,rep:h.rep||0,gang:h.gang||null,skillPts:h.skillPts||0,skills:h.skills||null}));
    const data={v:1,day:IB.G.day,t:IB.G.t,money:IB.G.money,inv:IB.G.inv,quests:IB.G.quests,arts:IB.G.arts,
      camps:IB.G.camps,wildCamps:IB.G.wildCamps||[],journal:IB.G.journal.slice(0,40),flags:IB.G.flags,stats:IB.G.stats,
      friends:IB.G.friends||{},
      wx:IB.G.wx,hangover:IB.G.hangover,vision:IB.G.vision,axetier:IB.G.axetier,album:IB.G.album,team,
      stamps:IB.G.stamps||{},torch:IB.G.torch!==false,
      spawn:{x:IB.E.team[0].x,y:IB.E.team[0].y},touristDone:IB.G.touristDone};
    data.home=IB.G.home;data.tan=IB.G.tan;
    /* v6.0: репутація, банк, режим, банди */
    data.rep=IB.G.rep||null;data.bank=IB.G.bank||null;data.gmode=IB.G.gmode||'all';data.vv13=IB.G.vv13||null;
    /* v5.0: квартири/квести/соло */
    data.homes=(IB.G.homes||[]).map(hm=>({addr:hm.addr,mode:hm.mode,expDay:hm.expDay,bx:hm.b.x,by:hm.b.y,occupants:hm.occupants||[]}));
    data.side=IB.G.side||{};data.solo=IB.G.solo||{active:false};
    const KEY=slot===0?'ilegend3_more':('ilegend3_more_s'+slot);
    localStorage.setItem(KEY,JSON.stringify(data));
    if(!silent)IB.toast('ГРУ ЗБЕРЕЖЕНО У СЛОТ '+(slot+1),'gold');
  }catch(e){IB.toast('Помилка збереження','red');}
};
IB.loadGame=(slot)=>{
  if(slot===undefined)slot=IB.G.slot||0;
  IB.G.slot=slot;
  try{
    const KEY=slot===0?'ilegend3_more':('ilegend3_more_s'+slot);
    const raw=localStorage.getItem(KEY);
    if(!raw)return false;
    const d=JSON.parse(raw);
    Object.assign(IB.G,{day:d.day,t:d.t,money:d.money,inv:d.inv,quests:d.quests,arts:d.arts,camps:d.camps,wildCamps:d.wildCamps||[],
      journal:d.journal||[],flags:d.flags,stats:d.stats,wx:d.wx,album:d.album||[],hangover:d.hangover||0,vision:d.vision||0,
      axetier:d.axetier||1,touristDone:d.touristDone||false,stamps:d.stamps||{},torch:d.torch!==false,
      friends:d.friends||{}});
    IB.G.home=d.home||null;IB.G.tan=d.tan||0;
    IB.G.rep=d.rep||null;IB.G.bank=d.bank||null;IB.G.gmode=d.gmode||'all';IB.G.vv13=d.vv13||null;
    /* v2.0: сейви попередніх версій з туманом/хмарністю — небо читаємо */
    if(IB.G.wx&&(IB.G.wx.type==='cloud'||IB.G.wx.type==='fog'))IB.G.wx.type='sun';
    IB.spawnTeam(d.spawn.x,d.spawn.y);
    for(const s of d.team||[]){const h=IB.E.team.find(x=>x.id===s.id);if(h){h.x=s.x;h.y=s.y;h.hp=s.hp;h.food=s.food;h.water=s.water;h.mood=s.mood;h.alc=s.alc;h.rep=s.rep||0;h.gang=s.gang||null;h.skillPts=s.skillPts||0;if(s.skills)h.skills=s.skills;}}
    /* v2.4b: РЯТУНОК старих сейвів — героя, збереженого на перекритому тайлі
       (баг «застряв у Барабої посеред вулиці»), витягуємо на досяжний тайл. */
    for(const h of IB.E.team){
      if(!IB.walkable(h.x,h.y)){const q=IB.snapToReach(IB.M.round(h.x),IB.M.round(h.y));
        h.x=q.x;h.y=q.y;h.tx=q.x;h.ty=q.y;h.target=null;}
    }
    IB.spawnVillagers();IB.spawnAnimals();IB.spawnFishes();IB.spawnGangs();
    /* v5.0: квартири, кишені, сайд-квести, маршрутка */
    IB.G.homes=((d.homes)||[]).map(hm=>{
      const b=IB.W.buildings.find(bb=>bb.apt&&bb.x===hm.bx&&bb.y===hm.by);
      return b?{id:'flat'+hm.bx,b,addr:hm.addr,mode:hm.mode,expDay:hm.expDay,door:{x:b.door.x,y:b.door.y},occupants:hm.occupants||[]}:null;
    }).filter(Boolean);
    IB.G.side=d.side||{};IB.G.solo=d.solo||{active:false};
    for(const s of d.team||[]){const h=IB.E.team.find(x=>x.id===s.id);if(h)h.pocket=s.pocket||0;}
    IB.initPockets&&IB.initPockets();
    IB.spawnMarsh&&IB.spawnMarsh();
    IB.G.mode='game'; /* v1.2 fix: продовження запускало цикл гри */
    return true;
  }catch(e){return false;}
};
IB.hasSave=(slot)=>{try{
  if(slot===undefined)return !!localStorage.getItem('ilegend3_more')||!!localStorage.getItem('ilegend3_more_s1')||!!localStorage.getItem('ilegend3_more_s2');
  const KEY=slot===0?'ilegend3_more':('ilegend3_more_s'+slot);
  return !!localStorage.getItem(KEY);
}catch(e){return false;}};
/* v18 М6: коротка інформація про слот для заставки і телефона */
IB.saveInfo=(slot)=>{try{
  const KEY=slot===0?'ilegend3_more':('ilegend3_more_s'+slot);
  const raw=localStorage.getItem(KEY);
  if(!raw)return null;
  const d=JSON.parse(raw);
  return {day:d.day,money:d.money,city:(d.rep&&d.rep.city)||0};
}catch(e){return null;}};

/* ---------- РИБАЛКА ---------- */
IB.fishing={active:false,t:0,window:0,state:'idle'};
IB.startFishing=()=>{
  const f=IB.fishing;
  if(f.active)return;
  f.active=true;f.state='wait';f.t=0;
  f.window=IB.rnd(1.2,3.5);
  IB.toast('Кинули вудку... чекай на клювання (E у момент «!»)');
};
IB.fishTick=(dt)=>{
  const f=IB.fishing;
  if(!f.active)return;
  const lucky=IB.M.random();
  f.t+=dt;
  if(f.state==='wait'){
    const taras=IB.E.team.find(h=>h.id==='taras');
    const tarasNear=taras&&IB.dist(taras.x,taras.y,IB.E.team[0].x,IB.E.team[0].y)<8;
    const prob=tarasNear?0.75:0.45;
    if(f.t>f.window&&IB.M.random()<dt*prob){f.state='bite';f.t=0;IB.toast('КЛЮВАЄ! Жми E!','gold');IB.SFX.fish();}
    if(f.t>9){f.active=false;IB.toast('Риба не клює — спробуй інше місце','red');}
  }else if(f.state==='bite'){
    if(f.t>1.4){f.state='wait';f.t=0;f.window=IB.rnd(1.5,3.5);IB.toast('Проспав момент...','red');}
  }
};
IB.fishCatch=()=>{
  const f=IB.fishing;
  if(!f.active||f.state!=='bite')return false;
  f.active=false;f.state='idle';
  IB.G.inv.fishraw++;IB.G.stats.fish++;
  /* v18 С7: РИБНИЙ ФЕСТИВАЛЬ — улов подвійний */
  if(IB.eventToday&&IB.eventToday()==='fish'){
    IB.G.inv.fishraw++;IB.G.stats.fish++;
    IB.toast('🐟 ФЕСТИВАЛЬ: друга риба в мешок — безкоштовно!','gold');
  }
  /* v2.0: лиман — своя риба і свій статист */
  const L=IB.E.team[0];
  const inLiman=L&&IB.W.at(L.x,L.y+1)===16||L&&IB.W.at(L.x,L.y)===16;
  if(inLiman)IB.G.stats.limanFish=(IB.G.stats.limanFish||0)+1;
  IB.SFX.fish();
  const kind=inLiman?IB.pick(['карася','пісочника','тараню','бичка-кругляка']):IB.pick(['бичка','камбалу','ставриду','барабулю','пеламіду']);
  IB.floatMsg(L.x,L.y,'+1🐟');
  IB.toast('ВЛОВЛЕНО: '+kind+(inLiman?' (лиман)!':'!')+' (усього риб: '+IB.G.stats.fish+')','gold');
  IB.questCheck();
  return true;
};

/* ---------- СИНІ МАРКЕРИ (врятовано/замерз/вівця) ---------- */
IB.blip=()=>{
  if(IB.G.frozenMate)return {x:IB.G.frozenMate.x,y:IB.G.frozenMate.y,kind:'frozen'};
  if(IB.E.tourist&&IB.E.tourist.found)return {x:IB.E.tourist.x,y:IB.E.tourist.y,kind:'tourist'};
  return null;
};

/* ==================== v3.1 «СІ, НІ ТА РЕЙВ» ==================== */

/* ---------- ПОБАЧЕННЯ: дівчина забирає героя на N годин ----------
   «Тохіс пішов гуляти з Галею на 15 годин» — герой ПОВНІСТЮ вибуває з
   групи на час гулянки, повертається щасливий. Лідер не вибуває. */
IB.GIRL_FLIRT=['«Ти з тих легендарних? З Києва?»','«Після рейву на Маяку я в рожевому. Не сплутай»','«Мій улюблений кут — Приморські сходи на заході»','«Хот-доги — на набережній, кава — в «Лагуні»»','«Обіцяй: якщо шторм — сидимо у кіно»','«Я живу у панельці на Сонячній. 9-й поверх, море видно»'];
IB.startDate=(girl)=>{
  if(!girl||!girl.name)return false;
  if(IB.G.dateAway.some(d=>d.girl===girl.name)){IB.toast(girl.name+' вже гуляє з одним із нас...','red');return false;}
  const cands=IB.E.team.slice(1);
  if(!cands.length){IB.toast('Всі, крім тебе, вже на гулянках — група розійшлась!','red');return false;}
  /* TOXIC фліртує найчастіше (кухар-серцеїд) */
  const h=(IB.M.random()<0.4&&IB.E.team.find(x=>x.id==='andriy'))?IB.E.team.find(x=>x.id==='andriy'):cands[IB.ri(0,cands.length-1)];
  const hrs=IB.ri(2,15);
  const endAbs=IB.G.t+hrs;
  const rec={hid:h.id,girl:girl.name,hrs:hrs,start:IB.clockStr(),
    endT:endAbs%24,endDay:IB.G.day+IB.M.floor(endAbs/24)};
  IB.G.dateAway.push(rec);
  IB.E.team.splice(IB.E.team.indexOf(h),1);
  const gi=IB.E.npcs.indexOf(girl);
  if(gi>=0)IB.E.npcs.splice(gi,1);
  h.task='follow';h.target=null;
  IB.G.stats.dates=(IB.G.stats.dates||0)+1;
  IB.banner('💃 '+h.name+' ПІШОВ ГУЛЯТИ З '+girl.name.toUpperCase()+' — '+hrs+' ГОДИН!');
  IB.toast(h.name+' пішов з '+girl.name+' — повернеться о '+IB.clockStr(rec.endT)+'. Решта — за мене!','fun');
  IB.journalAdd('💃',h.name+' пішов гуляти з '+girl.name+' на '+hrs+' годин ('+rec.start+'). Кажуть, ще й на рейв збирались.');
  IB.SFX.bird();
  IB.saveGame();
  IB.questCheck();
  return true;
};
IB.dateTick=(dt)=>{
  if(!IB.G.dateAway||!IB.G.dateAway.length)return;
  const L=IB.E.team[0];
  for(let i=IB.G.dateAway.length-1;i>=0;i--){
    const d=IB.G.dateAway[i];
    const done=IB.G.day>d.endDay||(IB.G.day===d.endDay&&IB.G.t>=d.endT);
    if(!done)continue;
    const h=IB.HERO_DEFS.find(x=>x.id===d.hid);
    IB.G.dateAway.splice(i,1);
    /* дівчина «доходила» — на вулиці її вже нема */
    const g=IB.E.npcs?IB.E.npcs.find(n=>n.name===d.girl):null;
    if(g)IB.E.npcs.splice(IB.E.npcs.indexOf(g),1);
    if(h&&L){
      const nx=IB.clamp(L.x+IB.rnd(-2,2),2,IB.W.W-3),ny=IB.clamp(L.y+IB.rnd(-1.5,1.5),2,IB.W.H-3);
      const rc=IB.snapToReach?IB.snapToReach(nx,ny):{x:nx,y:ny};
      const hero=IB.mkHero(h,rc.x,rc.y);
      hero.mood=100;hero.food=IB.M.max(hero.food,55);hero.water=IB.M.max(hero.water,50);
      IB.E.team.push(hero);
      IB.banner('💙 '+hero.name+' ПОВЕРНУВСЯ З '+d.girl.toUpperCase()+'!');
      IB.toast(hero.name+' гуляв з '+d.girl+' '+d.hrs+' годин — настрій 100! «Найкращий день літа»','gold');
      IB.journalAdd('💙',hero.name+' повернувся з '+d.girl+' (гулянка '+d.hrs+' годин, '+d.start+' → '+IB.clockStr()+'). Настрій — море.');
      IB.floatMsg(hero.x,hero.y,'💃+');
      for(const o of IB.E.team)if(o!==hero)o.mood=IB.clamp(o.mood+5,0,100);
    }
    IB.questCheck();
    IB.saveGame();
  }
};

/* ---------- МІСЬКЕ РАДІО 103.2 FM — новини і рейви ---------- */
IB.FRIDAY=()=>IB.G.day%7===3;   /* день 3, 10, 17... — П'ЯТНИЦЯ */
IB.radioBroadcast=()=>{
  const h=IB.hStr();
  const wx=IB.WX.cur().label;
  const pool=[];
  if(h>=6&&h<11)pool.push('Доброго ранку, Чорноморську! День '+IB.G.day+', на пляжі '+wx+'. Сніданок у їдальні «Хвиля» — комплекс за 80');
  if(IB.FRIDAY())pool.push('УВАГА, П\'ЯТНИЦЯ! КЛУБ «МАЯК» запрошує на РЕЙВ — пульт діджея гріється з вечора. Дрес-код: гарний настрій');
  if(h>=17&&h<23)pool.push('Сьогодні на Центральному пляжі — музика з барів, гітара і гулянка до світанку. Чайок просимо не пригощати хот-догами');
  pool.push('Море +24, хвиля '+wx.toLowerCase()+'. Рятувальник Степан: «Крем, вода і тінь — три кити літа»');
  pool.push('Портові новини: пором на Варну — за розкладом, екскурсія на «Палладу» — щодня крім неділі');
  pool.push('СЕКОНДХЕНД «Альбатрос» знизив ціни: модний лук за копійки — Коля чекає гостей');
  pool.push('Автостанція: рейс на Одесу о 07:15 і 12:40, маршрутка №7 ходить просп. Миру');
  pool.push('Північний масив: у дворах панельок — гойдалки, пісочниці і баскетбол. Вечорами світяться всі вікна');
  if((IB.G.stats.dates||0)>0)pool.push('Курс флірту на курорті: '+IB.G.stats.dates+' гулянень за літо. Дівчата передають: «наступного разу — з квітами»');
  if((IB.SI_NI&&IB.SI_NI.si&&IB.SI_NI.si.phase!=='away'))pool.push('Дядя Сі живий-здоровий, '+IB.SI_NI.si.zone+' — зустрічайте. Шашлик обіцяв');
  if((IB.SI_NI&&IB.SI_NI.ni&&IB.SI_NI.ni.phase!=='away'))pool.push('Тітка Ні у місті: '+IB.SI_NI.ni.zone+'. Пампушки з часником — безкоштовно для своїх');
  pool.push('Південні банди шабашать біля Бронкса — ходіть компанією, легендарні');
  return '📻 103.2 FM: '+pool[IB.ri(0,pool.length-1)];
};
IB.radioTick=(dt)=>{
  IB.G.radioT-=dt;
  const h=IB.hStr();
  /* гучні випуски о 9:00 і 19:00 — незалежно від таймера */
  if(h!==IB._radioLastH&&(h===9||h===19)){
    IB._radioLastH=h;
    IB.toast(IB.radioBroadcast(),'radio');
    IB.radioLog&&IB.radioLog(IB.clockStr()+': '+IB.radioBroadcast());
    IB.journalAdd('📻','Радіо 103.2 FM, '+IB.clockStr()+': '+(IB.FRIDAY()?'У П\'ЯТНИЦЮ — РЕЙВ У КЛУБІ «МАЯК»!':'новини міста.'));
    IB.G.radioT=IB.rnd(120,240);
    return;
  }
  if(IB.G.radioT>0)return;
  IB.G.radioT=IB.rnd(110,220);
  IB.toast(IB.radioBroadcast(),'radio');
  IB.radioLog&&IB.radioLog(IB.clockStr()+': '+IB.radioBroadcast());
  if(IB.M.random()<0.3)IB.journalAdd('📻','Радіо 103.2 FM, '+IB.clockStr()+': '+(IB.FRIDAY()?'«Маяк» гріє пульт — П\'ЯТНИЦЯ, РЕЙВ!':'новини курорту.'));
};

/* ---------- ЗАПРОШЕННЯ ВІД ЛЮДЕЙ: вечірка / гулянка / тусі ---------- */
IB.INVITES=[
  {k:'beach',n:'Гоп-стопа з пляжу',txt:'Компанія з пляжу махає вам: «ЛЕГЕНДАРНІ! Йдемо гулянку на піску до світанку — музика з бару вже пішла!»',opt:'ЙДЕМО! 🎉'},
  {k:'walk',n:'Гулянка містом',txt:'Хлопці з нових будинків: «У нас на дворі туси — йдіть гуляти по просп. Миру, покажемо місто!»',opt:'Гуляємо 🌃'},
  {k:'club',n:'Тусі у клубі',txt:'Хостес Марічка передала: «На вас чекають у «МАЯКУ» — столик броньований, діджей питає про вас!»',opt:'Мчимо 🎧'},
  {k:'gulls',n:'Годівниця чайок',txt:'Стара Галя з хлібом: «Хто погодує чайок зі мною? Вони сьогодні голодні!»',opt:'Кормимо 🐦'},
];
IB.groupInvite=()=>{
  if(IB.G.party.active||IB.G.trip.active)return;
  const L=IB.E.team[0];if(!L)return;
  const inv=IB.INVITES[IB.ri(0,IB.INVITES.length-1)];
  if(IB.showInvite)IB.showInvite(inv);
};
/* ==================== v18.7: КЛУБ-ДІЙСТВО І ЇЖА-ДІЙСТВО ====================
   Гравець: «режим танці і діджейський пульт — теж дійством; 3 родини всі
   бігають, падають, танцюють, розважаються; і так з усім; їжа — сіли
   1-2 години; добав дійств, які можуть бути по сюжетці». Повноцінне
   кінематографічне дійство (як засмага v16) на канві: 5-6 фаз, 3 «родини»
   відвідувачів (спільний одяг), діджей Іверо за пультом, бар Зази, падіння
   від басу, світло-шоу, конфетті; ЇЖА — п'ятірка сідає в кафе/їдальні:
   замовлення → перші страви → сміх і історії → десерт → рахунок. */
IB.CLUB_ACTORS=IB.CLUB_ACTORS||[];
IB.CLUB_PHASES=[
  {n:'ВХІД І БРАСЛЕТИ',b:'Марічка чіпляє неонові браслети — зал гуде!'},
  {n:'ПЕРШИЙ БАС',b:'Іверо опускає фейдер — бас качає підлогу!'},
  {n:'ДИСКО-КУЛЯ',b:'Зала в зірках — вся «Маяк-родина» танцює!'},
  {n:'ХТОСЬ ВПАВ!',b:'Хтось пішов у розтяг від басу — зал ридає!'},
  {n:'СВІТЛО-ШОУ',b:'Лазери якорями по стелі — пік вечора!'},
  {n:'СВІТАНОК НАД МОРЕМ',b:'Фінальний повільний трек і чайки за вікном!'},
];
IB.MEAL_PHASES=[
  {n:'РОЗМОВИ І ЗАМОВЛЕННЯ',b:'Офіціантка Люда записує замовлення п\'ятірки'},
  {n:'ПЕРШІ СТРАВИ',b:'Борщі, шаурма і компот летять на стіл!'},
  {n:'СМІХ І ІСТОРІЇ',b:'ROCK розказує про шторм — всі давляться від сміху'},
  {n:'ДОБІР І ДОЇДАННЯ',b:'Хто доїдає чужу порцію — конфлікт поколінь!'},
  {n:'РАХУНОК І ЧАЙОВІ',b:'«Хто платить?» — залишають чайові і йдуть'}
];
IB.clubFamilyLook=(fam)=>{
  /* 3 «родини» клубу — у кожної спільний стиль одягу */
  const FAMS=[
    {jc:'#e05a5a',pc:'#2a3e5c',skin:'#e0a878',hair:'#2a1a10'},   /* панельна молодь */
    {jc:'#3aa0e0',pc:'#e8e8e2',skin:'#c89878',hair:'#5a3a20'},   /* туристи */
    {jc:'#4ee06a',pc:'#c85078',skin:'#a87858',hair:'#1a1a1a'},   /* рибалки в кедах */
  ];
  const f=FAMS[fam%3];
  return {skin:f.skin,hair:f.hair,hat:'none',jacket:f.jc,pants:f.pc};
};
IB.spawnClubActors=()=>{
  const S=IB.CLUB_ACTORS;S.length=0;
  const modes=['dance','dance','run','dance','run','fall','dance','bar','run','dance','bar','dance'];
  for(let i=0;i<12;i++){
    const fam=i%3;
    const a={x:90+(i%6)*58+IB.rnd(-8,8),y:185+((i/6)|0)*46+IB.rnd(-8,8),
      mode:modes[i],t:IB.rnd(3,7),spd:IB.rnd(26,40),fam:fam,
      look:IB.clubFamilyLook(fam),tx:0,ty:0,dir:'d',fr:0,frT:0,bob:IB.rnd(0,6.28),
      fallT:0,bubble:null};
    IB.clubPickTarget(a);
    S.push(a);
  }
};
IB.clubPickTarget=(a)=>{
  /* сцена-простір: танцпол x 70..410, y 175..300; бар справа */
  if(a.mode==='bar'){a.tx=430+IB.rnd(-6,6);a.ty=205+IB.rnd(-18,28);a.t=IB.rnd(6,12);return;}
  if(a.mode==='dance'){a.tx=IB.clamp(a.x+IB.rnd(-34,34),76,406);a.ty=IB.clamp(a.y+IB.rnd(-20,20),180,298);a.t=IB.rnd(4,8);return;}
  /* run */
  a.tx=IB.clamp(a.x+IB.rnd(-120,120),76,406);a.ty=IB.clamp(a.y+IB.rnd(-60,60),180,298);a.t=IB.rnd(2.5,5);
};
IB.startClubShow=(rave)=>{
  if(IB.G.clubShow&&IB.G.clubShow.active){IB.toast('Дійство вже триває!','red');return;}
  if(rave){
    if(IB.G.money<150){IB.toast('Рейв — ₴150. Зароби на смітті або рибалці','red');return;}
    if(!IB.FRIDAY()){IB.toast('Рейв — по П\'ЯТНИЦЯХ (радіо 103.2 оголошує)','gold');return;}
    IB.G.money-=150;
  }
  IB.G.clubShow={active:true,t:0,hour:0,rave:!!rave,kind:'club'};
  IB.spawnClubActors();
  IB.MUSIC.partyPhase&&IB.MUSIC.partyPhase(rave?5:3);
  IB.SETMODE&&IB.SETMODE('clubshow');
  IB.banner((rave?'🎧 РЕЙВ-ДІЙСТВО: ':'🎧 ТУСИ-ДІЙСТВО: ')+IB.CLUB_PHASES[0].n+'!');
  IB.toast(rave?'Рейв у «Маяку»: ₴150, танці до світанку':'Танцпол «Маяка»: музика і родини залучені!','gold');
  IB.journalAdd&&IB.journalAdd('🎧',(rave?'РЕЙВ':'Туси')+'-дійство у клубі почалось о '+IB.clockStr()+'.');
  if(rave){IB.G.stats.rave=(IB.G.stats.rave||0)+1;IB.G.hangover=4;}
  else IB.G.stats.dances=(IB.G.stats.dances||0)+1;
  IB.G.flags.clubVisit=true;
};
IB.clubShowTick=(dt)=>{
  const S=IB.G.clubShow;
  if(!S||!S.active)return;
  const PH=S.kind==='meal'?IB.MEAL_PHASES:IB.CLUB_PHASES;
  const step=S.kind==='meal'?9:10; /* сек на фазу */
  S.t+=dt;
  const hourN=IB.M.floor(S.t/step);
  if(hourN>S.hour&&hourN<PH.length){
    S.hour=hourN;
    const ph=PH[hourN];
    IB.banner((S.kind==='meal'?'🍚 ':'🎧 ')+((S.kind==='meal'?'ФАЗА ':'ФАЗА ')+(hourN+1)+'/'+PH.length+': ')+ph.n);
    IB.toast(ph.b,'fun');
    IB.journalAdd&&IB.journalAdd(S.kind==='meal'?'🍚':'🎧','Фаза: '+ph.n+' — '+ph.b);
    if(S.kind==='club'){
      for(const h of IB.E.team){
        h.mood=IB.clamp(h.mood+IB.rnd(6,10),0,100);
        h.water=IB.clamp(h.water-(S.rave?5:3),0,100);
        h.food=IB.clamp(h.food-(S.rave?4:2),0,100);
        if(S.rave)h.alc=IB.clamp((h.alc||0)+0.5,0,6);
      }
      IB.MUSIC.partyPhase&&IB.MUSIC.partyPhase(S.rave?(hourN+2):2);
      /* актори змінюють забави; фаза «ХТОСЬ ВПАВ» — більше падінь */
      for(const a of IB.CLUB_ACTORS){
        const pool=hourN===3?['fall','fall','run','dance']:
          hourN===4?['dance','dance','run','fall']:
          hourN===2?['dance','dance','dance','run']:
          ['dance','run','bar','dance'];
        a.mode=pool[IB.ri(0,pool.length-1)];
        if(a.mode==='fall')a.fallT=IB.rnd(2.2,4.2);
        IB.clubPickTarget(a);
      }
    }
  }
  /* рух акторів (сцена-простір 480×336) */
  for(const a of IB.CLUB_ACTORS){
    if(a.bubble){a.bubble.t+=dt;if(a.bubble.t>a.bubble.life)a.bubble=null;}
    if(a.mode==='fall'){
      a.fallT-=dt;
      if(a.fallT<=0){a.mode='dance';IB.clubPickTarget(a);a.bubble={txt:'😅',t:0,life:2.0};}
      continue;
    }
    a.t-=dt;
    const dx=a.tx-a.x,dy=a.ty-a.y,d=IB.M.hypot(dx,dy);
    if(d>2){
      const sp=a.mode==='run'?a.spd*1.7:a.spd*0.7;
      a.x+=dx/d*sp*dt;a.y+=dy/d*sp*dt;
      a.dir=IB.M.abs(dx)>IB.M.abs(dy)?(dx>0?'r':'l'):(dy>0?'d':'u');
      a.frT+=dt*(a.mode==='run'?10:6);a.fr=1+((a.frT|0)%2);
    }
    if(a.t<=0||d<=2){
      const next={dance:['run','dance','bar'],run:['dance','dance','bar','fall'],
        bar:['dance','run'],fall:['dance']}[a.mode]||['dance'];
      a.mode=next[IB.ri(0,next.length-1)];
      if(a.mode==='fall')a.fallT=IB.rnd(1.8,3.4);
      IB.clubPickTarget(a);
      /* репліки від «родин» */
      if(IB.M.random()<0.4)a.bubble={txt:['🎵','🎶','🔥','!!!','😂','🍻'][IB.ri(0,5)],t:0,life:IB.rnd(1.6,2.8)};
    }
  }
  /* фінал */
  const dur=step*PH.length;
  if(S.t>=dur){
    S.active=false;S.t=0;S.hour=0;
    for(const h of IB.E.team){h.bubble=null;h.mood=IB.clamp(h.mood+8,0,100);}
    IB.CLUB_ACTORS.length=0;
    if(S.kind==='meal'){
      for(const h of IB.E.team){h.food=IB.clamp(h.food+42,0,100);h.water=IB.clamp(h.water+24,0,100);}
      IB.MUSIC.day&&IB.MUSIC.day();
      IB.banner('🍚 ПОЇЛИ ВСЮ П\'ЯТІРКУ — СИЛІ І НАСТРОЮ ДОДАНО!');
      IB.journalAdd&&IB.journalAdd('🍚','Сільна вечеря: сіли, поїли, посміялись — '+IB.clockStr()+'.');
    }else{
      IB.MUSIC.partyPhase&&IB.MUSIC.partyPhase(1);
      if(S.rave){
        IB.banner('🎧 РЕЙВ-ДІЙСТВО ЗАВЕРШЕНО — СВІТАНОК ЗУСТРІЛИ НА СХОДАХ!');
        IB.journalAdd&&IB.journalAdd('🎧','Рейв-дійство до світанку. Похмілля — воно того варте.');
        IB.addStamp&&IB.addStamp(IB.W.ROUTES.find(r=>r.id==='r_club'));
      }else{
        IB.banner('🎧 ТУСИ-ДІЙСТВО ЗАВЕРШЕНО — ВСІ В НАСТРОЇ!');
        IB.journalAdd&&IB.journalAdd('🎧','Танцювальне дійство у «Маяку» — '+IB.clockStr()+'.');
      }
    }
    IB.questCheck&&IB.questCheck();
    IB.SETMODE&&IB.SETMODE('game');
  }
};
IB.clubShowEnd=()=>{
  const S=IB.G.clubShow;
  if(!S||!S.active)return;
  /* дострокове завершення — фази застосовані, час піде пропорційно */
  S.t=1e9;
};
/* ---------- v18.7: ЇЖА-ДІЙСТВО — «сіли, поїли 1-2 години» ---------- */
IB.startMeal=(price,place)=>{
  if(IB.G.clubShow&&IB.G.clubShow.active){IB.toast('Дійство вже триває!','red');return;}
  if(IB.G.money<price){IB.toast(place+': на всіх треба ₴'+price,'red');return;}
  IB.G.money-=price;
  IB.G.flags.cafeSpent=(IB.G.flags.cafeSpent||0)+price;
  IB.G.clubShow={active:true,t:0,hour:0,kind:'meal',place:place||'КАФЕ',price:price};
  IB.spawnClubActors();
  IB.MUSIC.day&&IB.MUSIC.day();
  IB.SETMODE&&IB.SETMODE('clubshow');
  IB.banner('🍚 СІЛИ ПОЇСТИ ('+place+') — '+IB.MEAL_PHASES[0].n+'!');
  IB.toast('П\'ятірка за столом: ₴'+price+' на всіх, 1.5 години','gold');
  IB.journalAdd&&IB.journalAdd('🍚','Сільна вечеря у '+place+' — сіли всією п\'ятіркою.');
  IB.SFX.eat&&IB.SFX.eat();
};

IB.clubDance=()=>{
  /* v18.7: ТАНЦПОЛ — тепер ПОВНОЦІННЕ ДІЙСТВО (6 фаз, родини, падіння) */
  IB.startClubShow(false);
};
IB.startRave=()=>{
  /* v18.7: РЕЙВ — ПОВНОЦІННЕ ДІЙСТВО (₴150, п'ятниця, танці до світанку) */
  if(IB.G.party.active){IB.toast('Гулянка вже триває — доіграй її до кінця','red');return;}
  IB.startClubShow(true);
};
function timeSkipSafe(hrs){
  IB.G.t=(IB.G.t+hrs)%24;
  if(IB.G.t<hrs&&IB.G.day!==undefined)IB.G.day++; /* нічка перетнула північ */
  for(const h of IB.E.team){h.food=IB.clamp(h.food-hrs*3.4,0,100);h.water=IB.clamp(h.water-hrs*4.2,0,100);}
  IB.SYS.onNewHours(hrs);
}
IB.CLUB_SCENES=[
  {i:'🎧',t:'ДІДЖЕЙ ІВЕРО',x:'Діджей Іверо крутив «Хвиля-микс»: бас гуде у піску під клубом. TOXIC танцював так, що офіціанти аплодували.'},
  {i:'💃',t:'ТАНЦПОЛ — СВІТЛО',x:'Лазери малюють якорі на стелі. Марічка махає з бара. ROCK кричить: «ЦЕ Ж НАША ПІСНЯ!» — і вся зала підхоплює.'},
  {i:'🍸',t:'БАР «МІСТО-НЕ СПИТЬ»',x:'Бармен Заза змішав «Чорноморський бриз» — м\'ята, лимон і трохи таємниці. PABLO замовив такий же, тільки «без таємниці».'},
  {i:'🪩',t:'ДИСКО-КУЛЬ',x:'Диско-куля кружляє — видно весь клуб: панельні діти, туристи, рибалки в кедах. DIIN каже: «Геометрія свята».'},
  {i:'🌙',t:'ПІВНІЧ У «МАЯКУ»',x:'Опівночі Іверо дає гудок порту на дропі — все місто чує, що у «Маяку» усе добре. Чайки кричать у відповідь.'},
];

/* ---------- v3.1: сейв/лоад розширення ---------- */
const _save31=IB.saveGame;
IB.saveGame=()=>{
  const r=_save31();
  try{
    const raw=localStorage.getItem('ilegend3_more');
    if(raw){
      const d=JSON.parse(raw);
      d.dateAway=IB.G.dateAway||[];
      d.sini={si:{phase:IB.SI_NI.si.phase,t:IB.SI_NI.si.t},ni:{phase:IB.SI_NI.ni.phase,t:IB.SI_NI.ni.t}};
      localStorage.setItem('ilegend3_more',JSON.stringify(d));
    }
  }catch(e){}
  return r;
};
const _load31=IB.loadGame;
IB.loadGame=()=>{
  const ok=_load31();
  if(ok){
    try{
      const d=JSON.parse(localStorage.getItem('ilegend3_more'));
      IB.G.dateAway=d.dateAway||[];
      if(d.sini&&IB.SI_NI){IB.SI_NI.si.phase=d.sini.si.phase||'away';IB.SI_NI.si.t=d.sini.si.t||IB.rnd(30,90);
        IB.SI_NI.ni.phase=d.sini.ni.phase||'away';IB.SI_NI.ni.t=d.sini.ni.t||IB.rnd(50,120);}
      IB.spawnSiNi&&IB.spawnSiNi();
    }catch(e){}
  }
  return ok;
};

/* i3-sys-v31 */

/* ================= i3-sys-v6.0: РЕПУТАЦІЯ • БАНК • СКІЛИ • АРТЕФАКТИ =================
   РЕПУТАЦІЯ — великий блок: категорії міста (місто/вулиця/дівчата/робота/
   поліція) + ПЕРСОНАЛЬНА репутація кожного героя. Можна ПОКРАЩИТИ (квести,
   добрі справи, битки, свідання) і ЗГАНЬБИТИ (обсірани втечі, відмови,
   нетверезі скандали). Все впливає на оплату, знижки, дружбу і банди.
   БАНК — рахунки (спільна каса + кишені) і ЖУРНАЛ РОЗРАХУНКІВ.
   СКІЛИ — 6 навичок на героя, XP за діяльність у місті, очки налаштування. */
(function(){
IB.G.rep=IB.G.rep||{city:0,street:0,girls:0,work:0,cops:0,log:[]};
IB.G.bank=IB.G.bank||{log:[]};
IB.G.gmode=IB.G.gmode||'all';

/* ---------- РЕПУТАЦІЯ ---------- */
const REP_CATS={
  city:{n:'МІСТО (добрі справи)',c:'#4ee06a'},
  street:{n:'ВУЛИЦЯ (повага)',c:'#f0d050'},
  girls:{n:'ДІВЧАТА (романтика)',c:'#e07ab8'},
  work:{n:'РОБОТОДАВЦІ (праця)',c:'#3aa0e0'},
  cops:{n:'ПОЛІЦІЯ (закон)',c:'#7ab0e0'},
  port:{n:'БАНДА «ПОРТОВІ»',c:'#e04a3a'},
  bronx:{n:'БАНДА «БРОНКОВІ»',c:'#b040e0'},
};
IB.REP_CATS=REP_CATS;
IB.addRep=(cat,n,why)=>{
  IB.G.rep=IB.G.rep||{city:0,street:0,girls:0,work:0,cops:0,log:[]};
  const R=IB.G.rep;
  if(!(cat in R))R[cat]=0;
  R[cat]=IB.clamp(R[cat]+n,-100,100);
  R.log=R.log||[];
  R.log.push({d:IB.G.day,t:IB.clockStr(),cat,n,why:why||''});
  if(R.log.length>40)R.log.shift();
  if(IB.M.abs(n)>=2)IB.toast((n>0?'📈 РЕПУТАЦІЯ +':'📉 РЕПУТАЦІЯ ')+n+' — '+(REP_CATS[cat]?REP_CATS[cat].n:cat)+(why?': '+why:''),n>0?'gold':'red');
};
IB.heroRep=(h,n,why)=>{
  if(!h)return;
  h.rep=IB.clamp((h.rep||0)+n,-100,100);
  if(IB.M.abs(n)>=2)IB.toast(h.name+': репутація '+(n>0?'+':'')+n+(why?' — '+why:''),n>0?'gold':'red');
};
IB.repLvl=(v)=>v>=60?'ЛЕГЕНДА':v>=35?'ШАНОВАНИЙ':v>=15?'ВІДОМИЙ':v>-15?'НЕЙТРАЛЬНИЙ':v>-35?'ПІД СУМНІВОМ':'ЗГАНЬБЛЕНИЙ';

/* ---------- БАНК: журнал розрахунків ---------- */
IB.tx=(who,amt,note)=>{
  IB.G.bank=IB.G.bank||{log:[]};
  IB.G.bank.log.push({d:IB.G.day,t:IB.clockStr(),who,amt,note:note||''});
  if(IB.G.bank.log.length>60)IB.G.bank.log.shift();
};

/* ---------- СКІЛИ ---------- */
IB.SKILLS=[
  {k:'str',   n:'СИЛА',        d:'битки, переноска вантажів, спорт'},
  {k:'vit',   n:'ВИТРИВАЛІСТЬ',d:'спека, шторм, довгі походи'},
  {k:'charm', n:'ШАРМ',        d:'свідання, дружба, торги'},
  {k:'tech',  n:'ТЕХНІКА',     d:'роботи, таксі, портові зміни'},
  {k:'inst',  n:'ІНСТИНКТ',    d:'детектив, жах, пошук артефактів'},
  {k:'luck',  n:'УДАЧА',       d:'знахідки, коктейлі, подарунки'},
];
IB.initSkills=(h)=>{
  if(!h.skills)h.skills={str:{xp:0},vit:{xp:0},charm:{xp:0},tech:{xp:0},inst:{xp:0},luck:{xp:0}};
  h.skillPts=h.skillPts||0;
};
IB.skillLv=(h,k)=>{IB.initSkills(h);return IB.M.floor(h.skills[k].xp/100);};
IB.skillSpend=(h,k)=>{
  IB.initSkills(h);
  if(h.skillPts<=0)return false;
  h.skillPts--;
  h.skills[k].xp=(IB.M.floor(h.skills[k].xp/100)+1)*100;   /* рівень +1 */
  IB.toast('💪 '+h.name+': '+k.toUpperCase()+' → рівень '+IB.M.floor(h.skills[k].xp/100)+'!','gold');
  IB.journalAdd('💪',h.name+' прокачав навичку '+k.toUpperCase()+'.');
  return true;
};
/* XP: за діяльність. Кожні 100 — рівень і ОЧКО налаштування. */
IB.skillXP=(h,k,n)=>{
  if(!h)return;
  IB.initSkills(h);
  const before=IB.M.floor(h.skills[k].xp/100);
  h.skills[k].xp+=n;
  const after=IB.M.floor(h.skills[k].xp/100);
  if(after>before){
    h.skillPts+=after-before;
    IB.banner('💪 '+h.name+' — НОВИЙ РІВЕНЬ '+IB.SKILLS.find(s=>s.k===k).n+': '+after+' (+'+(after-before)+' очк.)');
    IB.sms(h.id,h.name,'Я підняв навичку «'+IB.SKILLS.find(s=>s.k===k).n+'» до рівня '+after+'! Налаштуй у телефона (СКІЛИ).');
    IB.SFX.done&&IB.SFX.done();
  }
};
/* бонуси: множники (1.0 = база) */
IB.bonusStr =(h)=>1+IB.skillLv(h,'str')*0.08+(IB.artHas('a9')?0.15:0);
IB.bonusVit =(h)=>1+IB.skillLv(h,'vit')*0.06+(IB.artHas('a14')?0.10:0);
IB.bonusCharm=(h)=>1+IB.skillLv(h,'charm')*0.09+(IB.artHas('a11')?0.12:0);
IB.bonusTech=(h)=>1+IB.skillLv(h,'tech')*0.10+(IB.artHas('a12')?0.10:0);
IB.bonusInst=(h)=>1+IB.skillLv(h,'inst')*0.10+(IB.artHas('a13')?1:0);
IB.bonusLuck=(h)=>1+IB.skillLv(h,'luck')*0.07+(IB.artHas('a10')?0.15:0);

/* ---------- 6 МІСЬКИХ АРТЕФАКТІВ (a9..a14) ---------- */
const CITY_ARTS=[
  {id:'a9', name:'КАСКА «ВВ13»',x:273,y:377,world:true,
   lore:'Каска з бази ВВ13 у Бронксі. Той, хто її надягає, бʼє як цілий квартал (+СИЛА у битках).'},
  {id:'a10',name:'ЗІРКА ЗІ СТЕЛИ',x:214,y:406,world:true,
   lore:'Пʼятикутна зірка з міської стели «ЧОРНОМОРСЬК». Палка до долонь знахідників (+УДАЧА).'},
  {id:'a11',name:'ФІШКА КЛУБУ «МАЯК»',x:322,y:388,world:true,
   lore:'Вінілова фішка діджея Іверо. Гарантований вхід без черги — і погляд дівчат (+ШАРМ).'},
  {id:'a12',name:'МОНЕТА МУЗЕЮ',x:252,y:155,world:true,
   lore:'Візантійська монета з музею ім. Білого. Працівники містая платять більше тим, хто її має (+ТЕХНІКА/оплата).'},
  {id:'a13',name:'ЛАМПА РАДІО 103.2',x:58,y:38,world:true,
   lore:'Лампа з вузла міського радіо. У телефона видно ВСІ артефакти міста на GPS-карті (+ІНСТИНКТ).'},
  {id:'a14',name:'СТРІЧКА ПРОФЕСОРА',x:368,y:136,world:true,
   lore:'Стрічка з бібліотеки ім. Франка. Втома і спека не мають влади над начитаними (+ВИТРИВАЛІСТЬ).'},
];
for(const a of CITY_ARTS){
  if(!IB.ARTIFACTS.some(x=>x.id===a.id))IB.ARTIFACTS.push(a);
}
/* оплата праці з ТЕХНІКОЮ + монетою музею */
const _payPocket=IB.payPocket;
IB.payPocket=(hid,n)=>{
  const h=IB.E.team.find(x=>x.id===hid);
  if(h&&IB.M.abs(n)>60&&n>0){
    /* v6.0: бонус ТЕХНІКИ — заробіток на роботах більший */
    const bon=IB.M.round(n*(IB.bonusTech(h)-1)*0.5);
    if(bon>0){n=n-bon;IB.toast('💪 ТЕХНІКА '+h.name+': економія/бонус ₴'+bon,'gold');IB.skillXP(h,'tech',2);}
  }
  return _payPocket(hid,n);
};

/* професійні репліки-дані (використовує main.js) */
IB.PROFS={
  office:{n:'офісник',c:'#3aa0e0',
    look:{skin:'#f0a482',hair:'#241a10',hat:'none',jacket:'#3a62b8',pants:'#2e323a'},
    lines:['«Офіс на Курортній, 12 — ми тут тимчасово, поки не пофарбують фасад»','«Дедлайн! Тілом тут, душею на пляжі»','«Кава з автомата — як бонус до морського бризу»'],
    job:{n:'ДОСТАВИТИ ПАКЕТ ДОКУМЕНТІВ',pay:140,rep:['work',2],sk:'tech'}},
  seller:{n:'продавець',c:'#4e9440',
    look:{skin:'#e0a878',hair:'#2a1e12',hat:'cap',hatc:'#e07038',jacket:'#4e9440',pants:'#3a3a44'},
    lines:['«Кавуни — з Барабою, скумбрія — з порту. Усе свіже!»','«Торгуйся — матір так учила»','«На північному ринку дешевше, тут — швидше»'],
    job:{n:'ПІДТОРГНУТИСЯ ЗА ХАЗЯЇНА',pay:90,rep:['work',1],sk:'charm'}},
  elder:{n:'літня людина',c:'#c8c4b8',
    look:{skin:'#e0b090',hair:'#c8c4b8',hat:'kerchief',jacket:'#8a4a3a',pants:'#3a3a44'},
    lines:['«Я ще той Якір на пірсі руками тримала, ти недивись»','«Памʼятаю, як лиман обмілів. А море — не вигородиш»','«Онучка в Крижанівці, а я тут — з чайками дружу»'],
    job:{n:'ДОПОМОГТИ ДО ЛАВКИ',pay:0,rep:['city',3],sk:'charm'}},
  communal:{n:'комунальник',c:'#e07038',
    look:{skin:'#d89868',hair:'#241a10',hat:'cap',hatc:'#e07038',jacket:'#e07038',pants:'#3a4048'},
    lines:['«Сміття — окремо. Море — спільно. Порядок — обовʼязково»','«Пʼять дворів до обіду. Пʼятірка — лише одна»','«Кран на 12-й лінії заливає — але я вже йду»'],
    job:{n:'ПРИБРАТИ ДВІР (список)',pay:70,rep:['city',2],sk:'vit'}},
  doctor:{n:'лікар',c:'#e8f4ff',
    look:{skin:'#f0b48c',hair:'#3a2a1a',hat:'none',jacket:'#e8f0f0',pants:'#3a3e4c'},
    lines:['«Поліклініка №1: сонце — ліки, але з розумом»','«Тепловий удар не жартує. Вода і тінь — брати!»','«Після шторму завжди розтягнуті — на пірсі обережно»'],
    job:{n:'ЛІКУВАННЯ ГЕРОЯ (₴150)',pay:-150,rep:['cops',1],sk:'inst'}},
  professor:{n:'професор',c:'#b040e0',
    look:{skin:'#f0b48c',hair:'#c8c4b8',hat:'none',jacket:'#5a4a8a',pants:'#2e323a',beard:true},
    lines:['«Бібліотека ім. Франка: море знає більше, ніж усі книги. Але книги — точні»','«Питання на 5: скільки ліній у Чорноморську? Підказка — багато»','«Знання — єдиний артефакт, який не тонe»'],
    job:{n:'ВІКТОРИНА ПРОФЕСОРА',pay:60,rep:['city',2],sk:'inst'}},
  dock:{n:'портовий робітник',c:'#3a5a8a',
    look:{skin:'#d89868',hair:'#1a120a',hat:'cap',hatc:'#3a3a44',jacket:'#3a5a8a',pants:'#2e3238'},
    lines:['«Контейнери самі себе не розвантажать»','«Зміна з 9:00 — і легенди теж працюють»','«Паллада — наш завод, наше гроно»'],
    job:{n:'ПІДМОГТИ З КОНТЕЙНЕРОМ',pay:110,rep:['work',2],sk:'str'}},
  builder:{n:'будівельник',c:'#f0c050',
    look:{skin:'#e0a878',hair:'#241a10',hat:'helmet',hatc:'#f0c050',jacket:'#d8a028',pants:'#3a3e4c'},
    lines:['«Клуб «Маяк» — наша робота. Нічого, що дирок в одній стіні?»','«Розчин встигає до спеки — як і ми»','«Пʼять поверхів — і вид на лиман»'],
    job:{n:'ПІДСУПІТИ НА БУДОВІ',pay:100,rep:['work',1],sk:'str'}},
};
/* підбір професії за районом спавну */
IB.profFor=(x,y)=>{
  const z=y;
  if(x>=330&&z>=350)return 'dock';                       /* порт */
  if(x>=280&&z>=38&&x<=310&&z<=70)return 'doctor';       /* поліклініка */
  if(x>=360&&z>=120&&x<=380&&z<=145)return 'professor';  /* бібліотека */
  if(z>=118&&z<=146&&(x>=190&&x<=340))return 'office';   /* центр-офіси */
  if((x>=84&&x<=110&&z>=52&&z<=70)||(x>=310&&x<=340&&z>=145&&z<=165))return 'seller'; /* ринки */
  if(z>=430)return IB.hsh(x,y,91)<0.55?'elder':'office'; /* набережна */
  if(IB.hsh(x,y,92)<0.30)return 'communal';              /* двори */
  if(IB.hsh(x,y,93)<0.18)return 'builder';
  const pool=['office','seller','elder','communal','office','seller','elder','dock'];
  return pool[IB.hsh(x,y,94)*pool.length|0];
};

})();

/* ================= v16.0: ЗАСМАГА-ДІЙСТВО — ГУЛЯНКА НА ПЛЯЖІ =================
   «як гулянка, тільки засмага»: лежаки (лежать), бігають, хтось біжить у море
   і виходить, музика і танці. 6 фаз / 3 ігрові години, 60 секунд реального часу. */
IB.SUN_ACTORS=IB.SUN_ACTORS||[];
IB.SUN_PHASES=[
  {n:'РОЗКЛАДАЄМО ЛЕЖАКИ',b:'Рушники на піску, крем від спеки!'},
  {n:'ЗАСМАГА І КРЕМ',b:'Півгодини на животі — рівна засмага!'},
  {n:'ХТОСЬ В МОРЕ!',b:'Забіг у хвилі — і назад на лежак!'},
  {n:'МУЗИКА І ТАНЦІ',b:'Колонка на козирку — бас над водою!'},
  {n:'ВОДЯНІ БАГАТСТВА',b:'Бризки, обливання, сміх на все місто!'},
  {n:'ЗАХІД НА БЕРЕЗІ',b:'Золото на воді — найкращий фільтр для фото!'}
];
IB.sunLook=()=>({skin:['#e0a878','#c89878','#f0b48c','#a87858'][IB.ri(0,3)],
  hair:['#2a1a10','#5a3a20','#1a1a1a','#8a5a28'][IB.ri(0,3)],
  hat:IB.M.random()<0.5?'cap':'none',hatc:['#e05a5a','#3aa0e0','#e8d050'][IB.ri(0,2)],
  jacket:['#e05a5a','#3aa0e0','#4ee06a','#e8d050','#e07ab8','#ffffff'][IB.ri(0,5)],
  pants:['#2a3e5c','#e8e8e2','#3aa0e0','#c85078'][IB.ri(0,3)]});
IB.spawnSunActors=()=>{
  const L=IB.E.team[0];
  const S=IB.SUN_ACTORS;S.length=0;
  const modes=['lie','lie','run','run','dance','seain','lie','run','seain','lie','dance','run'];
  for(let i=0;i<12;i++){
    const a={x:L.x+IB.rnd(-14,14),y:L.y+IB.rnd(-6,8),mode:modes[i],t:IB.rnd(3,9),
      spd:IB.rnd(2.2,3.4),look:IB.sunLook(),tx:0,ty:0,dir:'d',fr:0,frT:0,swim:0,bob:IB.rnd(0,6.28)};
    if(a.mode==='lie'){const lg=IB.nearestLounger(L.x,L.y);if(lg){a.x=lg.x+IB.rnd(-1,1);a.y=lg.y+IB.rnd(0,1);}a.t=IB.rnd(14,26);}
    IB.sunPickTarget(a);
    S.push(a);
  }
};
IB.nearestLounger=(x,y)=>{
  let best=null,bd=1e9;
  for(const pr of IB.W.props){
    if(pr.type!=='lounger'&&pr.type!=='towel')continue;
    const d=IB.dist(x,y,pr.x,pr.y);
    if(d<bd&&d<26){bd=d;best=pr;}
  }
  return best;
};
IB.sunPickTarget=(a)=>{
  if(a.mode==='seain'){a.tx=IB.clamp(a.x+IB.rnd(-3,3),6,330);a.ty=477;a.t=14;return;}
  if(a.mode==='swim'){a.t=IB.rnd(6,12);return;}
  if(a.mode==='seaout'){a.tx=IB.clamp(a.x+IB.rnd(-6,6),6,330);a.ty=IB.clamp(a.y-IB.rnd(8,14),442,470);a.t=16;return;}
  if(a.mode==='lie'){const lg=IB.nearestLounger(a.x,a.y);a.tx=lg?lg.x+IB.rnd(-1,1):IB.clamp(a.x+IB.rnd(-4,4),6,330);a.ty=lg?lg.y+IB.rnd(0,1):IB.clamp(a.y,442,470);a.t=IB.rnd(14,26);return;}
  if(a.mode==='dance'){a.tx=IB.clamp(a.x+IB.rnd(-2,2),6,330);a.ty=IB.clamp(a.y+IB.rnd(-2,2),442,470);a.t=IB.rnd(6,10);return;}
  /* run */
  a.tx=IB.clamp(a.x+IB.rnd(-10,10),6,330);a.ty=IB.clamp(a.y+IB.rnd(-5,5),441,470);a.t=IB.rnd(4,8);
};
IB.startSunShow=()=>{
  const L=IB.E.team[0];
  const tt=IB.W.at(IB.M.floor(L.x),IB.M.floor(L.y));
  if(tt!==1&&tt!==13){IB.toast('Дійство-засмага роблять на піску або набережній','red');return;}
  if(IB.G.sunShow.active){IB.toast('Дійство вже триває — козирок, лежак, море!','red');return;}
  IB.G.sunShow={active:true,t:0,hour:0};
  IB.spawnSunActors();
  IB.MUSIC.day();
  IB.banner('🏖 ЗАСМАГА-ДІЙСТВО: '+IB.SUN_PHASES[0].n+'!');
  IB.toast('Гулянка на пляжі: лежаки, море, музика — 3 години','gold');
  IB.journalAdd&&IB.journalAdd('🏖','Засмага-дійство почалось о '+IB.clockStr()+'.');
  IB.G.stats.sunshow=(IB.G.stats.sunshow||0)+1;
};
IB.sunShowTick=(dt)=>{
  const S=IB.G.sunShow;
  if(!S||!S.active)return;
  S.t+=dt*0.1; /* 1 ігрова год = 10 с → 6 фаз = 3 год = 60 с */
  const hourN=IB.M.floor(S.t);
  if(hourN>S.hour&&hourN<6){
    S.hour=hourN;
    const ph=IB.SUN_PHASES[hourN];
    IB.banner('🏖 ФАЗА '+(hourN+1)+'/6: '+ph.n);
    IB.journalAdd&&IB.journalAdd('🏖','Фаза: '+ph.n+' — '+ph.b);
    IB.toast(ph.b,'fun');
    if(hourN===3)IB.MUSIC.partyPhase&&IB.MUSIC.partyPhase(2); /* танці */
    else IB.MUSIC.day&&IB.MUSIC.day();
    for(const h of IB.E.team){
      IB.G.tan=IB.clamp((IB.G.tan||0)+IB.rnd(5,8),0,100);
      h.mood=IB.clamp(h.mood+IB.rnd(7,11),0,100);
      h.water=IB.clamp(h.water-4,0,100);
      if((IB.G.wx.type==='sun'||IB.G.wx.type==='heat')&&IB.G.flags.creamDay!==IB.G.day)
        h.heat=IB.clamp((h.heat||0)+7,0,120);
      /* хтось із групи то лежить, то танцює */
      if(IB.M.random()<0.6)h.lying=IB.rnd(6,14),h.lieDir=1.35;
      else h.lying=0;
    }
    /* актори змінюють забави */
    for(const a of IB.SUN_ACTORS){
      const pool=hourN===2?['seain','seain','run','lie']:hourN===3?['dance','dance','run','lie']:
        hourN===4?['seain','run','dance','lie']:['lie','lie','run','dance'];
      a.mode=pool[IB.ri(0,pool.length-1)];
      IB.sunPickTarget(a);
    }
  }
  /* рух акторів */
  for(const a of IB.SUN_ACTORS){
    a.t-=dt;
    if(a.mode==='swim'){
      a.swim=1;
      if(a.t<=0){a.mode='seaout';a.swim=0;IB.sunPickTarget(a);}
      continue;
    }
    const dx=a.tx-a.x,dy=a.ty-a.y;
    const d=IB.M.hypot(dx,dy);
    const sp=a.mode==='run'?a.spd*1.6:a.spd;
    if(d>0.3){
      a.x+=dx/d*sp*dt;a.y+=dy/d*sp*dt;
      a.dir=dy>0?'d':(dy<0?'u':(dx>0?'r':'l'));
      a.frT+=dt*8;a.fr=1+((a.frT|0)%2);
    }
    if(a.mode==='seain'&&a.y>=472){a.mode='swim';a.swim=1;a.t=IB.rnd(6,12);a.y=IB.clamp(a.y,472,478);IB.floatMsg(a.x,a.y,'🌊');continue;}
    if(a.t<=0||d<=0.3){
      const next={lie:['run','seain','dance'],run:['lie','lie','seain'],dance:['lie','run'],
        seain:['swim'],seaout:['lie','run','dance']}[a.mode]||['lie'];
      a.mode=next[IB.ri(0,next.length-1)];
      IB.sunPickTarget(a);
    }
  }
  /* репліки-бульбашки (курортні) */
  if(IB.M.random()<dt*0.5){
    const h=IB.E.team[IB.ri(0,IB.E.team.length-1)];
    if(h&&!h.lying)h.bubble={txt:IB.PARTY_BUBBLES[IB.ri(0,IB.PARTY_BUBBLES.length-1)],t:0,life:IB.rnd(2.8,4.2)};
  }
  for(const h of IB.E.team)if(h.bubble){h.bubble.t+=dt;if(h.bubble.t>h.bubble.life)h.bubble=null;}
  /* фінал */
  if(S.t>=6){
    S.active=false;S.t=0;S.hour=0;
    for(const h of IB.E.team){h.lying=0;h.bubble=null;h.mood=IB.clamp(h.mood+8,0,100);}
    IB.G.tan=IB.clamp((IB.G.tan||0)+IB.rnd(8,12),0,100);
    IB.MUSIC.day&&IB.MUSIC.day();
    IB.banner('🏖 ДІЙСТВО ЗАВЕРШЕНО — ЗАСМАГА '+(IB.G.tan|0)+'/100!');
    IB.journalAdd&&IB.journalAdd('🏖','Дійство-засмага завершилось о '+IB.clockStr()+'. Засмага '+(IB.G.tan|0)+'/100.');
    IB.SUN_ACTORS.length=0;
    IB.questCheck&&IB.questCheck();
  }
};
