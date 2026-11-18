/* VIKTOR LEGEND 2 — ents.js: група 5 героїв, селяни, тварини, риба, подійні NPC, ЗВІРІ v1.5 */
IB.E={team:[],npcs:[],animals:[],fishes:[],beasts:[],tourist:null,fishesSpawnT:0};

/* ---------- ГЕРОЇ v1.3 — п'ятірка з ПЕРШОЇ ЧАСТИНИ ----------
   Той самий персонаж (спрайт v5), тільки по кольору різні; імена світяться над головами. */
IB.HERO_DEFS=[
  {id:'viktor',name:'ЛЕГЕНДА',full:'ЛЕГЕНДА — ЛІДЕР ГРУПИ',talent:'ЛІДЕР',tdesc:'йде першим, веде групу',
   nameColor:'#f0d050',
   look:{skin:'#f0a482',hair:'#3e3220',hat:'none',jacket:'#66723e',pants:'#2a3e5c',pack:true,scarf:'#c83828'}},
  {id:'andriy',name:'TOXIC',full:'TOXIC — КУХАР',talent:'КУХАР',tdesc:'готування дає +50% ситості',
   nameColor:'#6ee04a',
   look:{skin:'#e0a878',hair:'#241a10',hat:'none',jacket:'#3e8a2e',pants:'#2e323a',pack:true}},
  {id:'taras',name:'PABLO',full:'PABLO — РИБАЛКА',talent:'РИБАЛКА',tdesc:'риба клює вдвічі частіше',
   nameColor:'#58a0ff',
   look:{skin:'#d89868',hair:'#1a120a',hat:'none',jacket:'#2a6ac8',pants:'#3e4038',pack:true,beard:true}},
  {id:'petro',name:'DIIN',full:'DIIN — МАЙСТЕР',talent:'МАЙСТЕР',tdesc:'будівництво табору дешевше на 25%',
   nameColor:'#f0c050',
   look:{skin:'#f0b48c',hair:'#2a1e12',hat:'none',jacket:'#d8a028',pants:'#3a3e4c',pack:true}},
  {id:'maksym',name:'ROCK',full:'ROCK — ВЕСЕЛЬЧАК',talent:'ВЕСЕЛЬЧАК',tdesc:'гулянки дужчі, знаходить коктейлі частіше',
   nameColor:'#ff7a8a',
   look:{skin:'#e8ac80',hair:'#1e1610',hat:'none',jacket:'#b83848',pants:'#2e3238',pack:true}},
];
IB.mkHero=(def,x,y)=>{
  return {id:def.id,name:def.name,def,look:def.look,x,y,dir:'d',fr:0,frT:0,
    hp:100,food:80,water:80,mood:70,alc:0,cold:0,swim:false,
    task:'follow',taskT:0,target:null,speed:3.4,sayT:0,
    /* v6.0: скіли, репутація і банда кожного героя */
    skills:{str:{xp:0},vit:{xp:0},charm:{xp:0},tech:{xp:0},inst:{xp:0},luck:{xp:0}},
    skillPts:0,rep:0,gang:null};
};
IB.spawnTeam=(x,y)=>{
  IB.E.team=[];
  const offs=[[0,0],[-1,0.7],[1,0.8],[-1.6,-0.5],[1.7,-0.3]];
  IB.HERO_DEFS.forEach((d,i)=>{
    const h=IB.mkHero(d,x+offs[i][0],y+offs[i][1]);
    if(i===0){h.task='leader';}
    IB.E.team.push(h);
  });
};

/* ---------- СЕЛЯНИ ---------- */
/* i3-ents-patch */
const VIL_NAMES=['пан Свирид','пані Люба','кур'+'єр Денис','малий Владик','пані Рита','дядько Жора','студентка Юля','пані Тамара','дід Микола','малий Сьома'];
const BEACH_LINES=['Чудово!', 'Море — сила!', 'Тягни!', 'Гол-о-о!', 'Кукурудза?!', 'Де мій рушник?', 'Ах, це літо!', 'Засмагаю до 50!', 'Пива хочеш?', 'Вода 15 грн!', 'Дивись, дельфіни!', 'Зони все одно сонце!'];
IB.spawnCars=()=>{
  IB.E.cars=[];
  /* v14.0 «ТРАФІК ЯК У ЖИТТІ»: БІЛЬШЕ АВТО В УСІ СТОРОНИ ПО ДОРОЗІ —
     на кожній вулиці 4 машини в обидва боки + паркунок; на КОЖНІЙ ЛІНІЇ —
     2 машини + паркунок; МІСЬКІ АВТОБУСИ (спрайт bus) на просп. Миру і
     вул. Суднобудівників; ван у трафіку (iso-спрайт van); фури мають SW-спрайт
     (їдуть по лініях, а не «перпендикулярно»). Правосторонній рух:
     «на схід» — південна смуга, «на захід» — північна; повороти на
     перехрестях — updateCars (v14). */
  /* v17.0: ВЕСЬ АВТОПАРК У СПРАВІ — старі (vaz/lanos/suv/truck) і нові
     сучасні (tesla/audi/bmw/sport/ev/minivan); у drawCar кожному свій вид */
  /* v18: ТІЛЬКИ СТАРІ МОДЕЛІ З ПЕРШОЇ ЧАСТИНИ (відгук раунду 16: «авто -
     нові моделі приберай, старі авто з першої частини бери») —
     vaz/lanos/suv/truck/van, кожна з повною ізометрією (_sw + _se).
     Таксі — lanos з шашками (за викликом, phone.js), автобуси — bus. */
  const CAR_MODELS=['vaz','lanos','suv','truck','van','vaz','lanos','suv'];
  const HS=IB.W.H_STREETS||[30,44,58,72,86,100,114,132,146,160,174,188,202,216,230,244,258,272,286,300,314,328,342,356,370,384,398,412];
  const VS=IB.W.V_STREETS||[8,24,40,56,72,88,104,120,136,152,168,184,200,216,232,248,264,280,296,312,328,344,360,376,392,408,424];
  const CCOL=['#f4f5f2','#c9ccd0','#e02838','#27467e','#e8862a','#1ab880','#f0e030','#8a4ad8','#f070a0','#28c8e8'];
  let ci=0;
  for(const sy of HS){
    if(sy>=412)continue; /* прибережна — спокійніше */
    /* смуга «на захід» — північна (sy+0.4): 2 машини */
    IB.E.cars.push({type:'car',model:CAR_MODELS[ci%CAR_MODELS.length],x:16+(ci*53)%400,y:sy+0.4,dir:'l',v:1.3+IB.hsh(ci,1,3)*0.7,
      a:10,b:430,c:CCOL[ci%CCOL.length],honkT:0,turnT:0});
    ci++;
    IB.E.cars.push({type:'car',model:CAR_MODELS[(ci+6)%CAR_MODELS.length],x:150+(ci*97)%270,y:sy+0.4,dir:'l',v:1.1+IB.hsh(ci,5,2)*0.8,
      a:10,b:430,c:CCOL[(ci+7)%CCOL.length],honkT:0,turnT:0});
    ci++;
    /* смуга «на схід» — південна (sy+1.6): 2 машини */
    IB.E.cars.push({type:'car',model:CAR_MODELS[(ci+3)%CAR_MODELS.length],x:18+(ci*61)%392,y:sy+1.6,dir:'r',v:1.2+IB.hsh(ci,2,4)*0.7,
      a:10,b:430,c:CCOL[(ci+4)%CCOL.length],honkT:0,turnT:0});
    ci++;
    IB.E.cars.push({type:'car',model:'van',x:120+(ci*83)%300,y:sy+1.6,dir:'r',v:1.0+IB.hsh(ci,9,3)*0.7,
      a:10,b:430,c:'#e8e8e2',honkT:0,turnT:0});
    ci++;
    /* v18.7: щільніший трафік — ще авто в обидва боки */
    IB.E.cars.push({type:'car',model:CAR_MODELS[(ci+1)%CAR_MODELS.length],x:60+(ci*71)%360,y:sy+0.4,dir:'l',v:1.15+IB.hsh(ci,6,8)*0.7,
      a:10,b:430,c:CCOL[(ci+5)%CCOL.length],honkT:0,turnT:0});
    ci++;
    IB.E.cars.push({type:'car',model:CAR_MODELS[ci%CAR_MODELS.length],x:90+(ci*47)%340,y:sy+1.6,dir:'r',v:1.25+IB.hsh(ci,3,1)*0.6,
      a:10,b:430,c:CCOL[ci%CCOL.length],honkT:0,turnT:0});
    ci++;
    /* паркунок біля південного узбіччя (як у першій частині) */
    IB.E.cars.push({type:'car',model:CAR_MODELS[(ci+5)%CAR_MODELS.length],x:24+(ci*37)%384,y:sy+2.35,dir:IB.hsh(ci,7,9)<0.5?'r':'l',v:0,
      a:0,b:0,c:CCOL[(ci+2)%CCOL.length],honkT:0});
    ci++;
  }
  /* ВЕРТИКАЛЬНІ ЛІНІЇ: «на південь» — західна смуга (sx+0.4), «на північ» — східна (sx+1.6) */
  for(let vi=0;vi<VS.length;vi++){
    const sx=VS[vi];
    if(sx>=408)continue;
    IB.E.cars.push({type:'car',model:CAR_MODELS[vi%CAR_MODELS.length],x:sx+0.4,y:40+(vi*29)%370,dir:'d',v:1.1+IB.hsh(vi,3,5)*0.6,
      a:16,b:420,c:CCOL[vi%CCOL.length],honkT:0,vert:true,turnT:0});
    IB.E.cars.push({type:'car',model:CAR_MODELS[(vi+2)%CAR_MODELS.length],x:sx+1.6,y:60+(vi*17)%340,dir:'u',v:1.0+IB.hsh(vi,4,6)*0.6,
      a:16,b:420,c:CCOL[(vi+3)%CCOL.length],honkT:0,vert:true,turnT:0});
    /* v18.7: ще вертикальне авто */
    IB.E.cars.push({type:'car',model:CAR_MODELS[(vi+5)%CAR_MODELS.length],x:sx+0.4,y:120+(vi*23)%290,dir:'d',v:1.2+IB.hsh(vi,7,2)*0.6,
      a:16,b:420,c:CCOL[(vi+2)%CCOL.length],honkT:0,vert:true,turnT:0});
    /* паркунок біля східного узбіччя лінії */
    IB.E.cars.push({type:'car',model:CAR_MODELS[(vi+4)%CAR_MODELS.length],x:sx+2.35,y:50+(vi*41)%350,dir:IB.hsh(vi,8,10)<0.5?'d':'u',v:0,
      a:0,b:0,c:CCOL[(vi+1)%CCOL.length],honkT:0,vert:true});
  }
  /* МІСЬКІ АВТОБУСИ (v14) — синьо-білі, їдуть ТІЛЬКИ по своїх вулицях туди-сюди */
  const PROSP=IB.W.PROSP_Y||118;
  IB.E.cars.push({type:'car',model:'bus',x:30,y:PROSP+1.0,dir:'r',v:0.9,a:12,b:428,c:'#e8ecf0',honkT:0,bus:true,turnT:0});
  IB.E.cars.push({type:'car',model:'bus',x:400,y:PROSP+1.0,dir:'l',v:0.9,a:12,b:428,c:'#e8ecf0',honkT:0,bus:true,turnT:0});
  IB.E.cars.push({type:'car',model:'bus',x:60,y:244+1.0,dir:'r',v:0.85,a:12,b:428,c:'#e8ecf0',honkT:0,bus:true,turnT:0});
  IB.E.cars.push({type:'car',model:'bus',x:340,y:244+1.0,dir:'l',v:0.85,a:12,b:428,c:'#e8ecf0',honkT:0,bus:true,turnT:0});
  /* ОДЕСЬКА ТРАСА (y12): автобус на Одесу і фура — їдуть довгим маршрутом */
  IB.E.cars.push({type:'car',model:'bus',x:20,y:12.5,dir:'r',v:1.9,a:6,b:434,c:'#e8ecf0',honkT:0,bus:true,turnT:0});
  IB.E.cars.push({type:'car',model:'truck',x:390,y:13.6,dir:'l',v:1.6,a:6,b:434,c:'#5a5a62',honkT:0,turnT:0});
  /* v11: вільних таксі НЕМА (старі прибрані) — таксі тільки за викликом (phone.js);
     маршрутка №7 — окрема (phone.js). */
  /* білий ван групи — припаркований біля вокзалу (узбіччя) */
  IB.E.cars.push({type:'car',model:'van',x:36,y:32.4,dir:'r',v:0,a:0,b:0,c:'#e8e8e2',honkT:0});
  /* v18.7: КОЛЬОРОВІ ВАРІАНТИ (cars3.js) — трафік не одноманітний */
  for(const c of IB.E.cars){
    if(!c.model)continue;
    const pool=IB.CARVARS&&IB.CARVARS[c.model];
    if(pool&&pool.length)c.var=pool[(IB.hsh(c.x|0,c.y|0,71)*pool.length)|0];
  }
};

IB.updateCars=(dt)=>{
  if(!IB.E.cars)return;
  const L=IB.E.team[0];
  const HS=IB.W.H_STREETS||[], VS=IB.W.V_STREETS||[];
  for(const c of IB.E.cars){
    if(c.honkT>0)c.honkT-=dt;
    if(c.turnT>0)c.turnT-=dt;
    if(c.v<=0)continue;
    /* v14: ПОВОРОТИ НА ПЕРЕХРЕСТЯХ — авто їде ЛИШЕ ДОРОГАМИ: перетинаючи
       центр перехрестя, може повернути на перпендикулярну вулицю
       (правосторонній рух — смуга залежить від нового напрямку).
       Таксі/маршрутка/автобуси мають свої маршрути — не повертають тут. */
    if(c.turn){
      /* v14: ПЛАВНИЙ ПОВОРОТ — коротка дуга по куту перехрестя (0.35с) */
      c.turn.t+=dt;
      const k=IB.M.min(1,c.turn.t/c.turn.dur);
      c.x=IB.lerp(c.turn.fx,c.turn.tx,k);
      c.y=IB.lerp(c.turn.fy,c.turn.ty,k);
      if(k>=1){c.turn=null;}
    }else if(!c.marsh&&!c.taxiCall&&!c.bus&&c.turnT<=0){
      if(!c.vert){
        for(const sx of VS){
          const cx2=sx+1.2;
          const px=c.x+(c.dir==='r'?c.v*dt:-c.v*dt);
          if((c.x<cx2)!==(px<cx2)){
            if(IB.M.random()<0.34){
              const lane=(IB.M.random()<0.5)?sx+0.4:sx+1.6;
              c.turn={fx:c.x,fy:c.y,tx:lane,ty:hLaneCenter(c.y),t:0,dur:0.35};
              c.dir=lane<sx+1?'d':'u';
              c.vert=true;c.a=16;c.b=420;c.turnT=7;
            }else c.turnT=3;
            break;
          }
        }
      }else{
        for(const sy of HS){
          const cy2=sy+1.2;
          const py=c.y+(c.dir==='d'?c.v*dt:-c.v*dt);
          if((c.y<cy2)!==(py<cy2)){
            if(IB.M.random()<0.34){
              const lane=(IB.M.random()<0.5)?sy+1.6:sy+0.4;
              c.turn={fx:c.x,fy:c.y,tx:vLaneCenter(c.x),ty:lane,t:0,dur:0.35};
              c.dir=lane>sy+1?'r':'l';
              c.vert=false;c.a=10;c.b=430;c.turnT=7;
            }else c.turnT=3;
            break;
          }
        }
      }
    }
    if(!c.turn){
      if(c.dir==='r'||c.dir==='l'){
        c.x+=c.dir==='r'?c.v*dt:-c.v*dt;
        if(c.x>c.b){c.x=c.b;c.dir='l';}
        if(c.x<c.a){c.x=c.a;c.dir='r';}
      }else{
        /* v10: вертикальні ЛІНІЇ — рух по осі y */
        c.y+=c.dir==='d'?c.v*dt:-c.v*dt;
        if(c.y>c.b){c.y=c.b;c.dir='u';}
        if(c.y<c.a){c.y=c.a;c.dir='d';}
      }
    }
    if(L&&IB.dist(c.x,c.y,L.x,L.y)<2.2&&c.honkT<=0){
      c.honkT=7;IB.toast('БІП-БІП!','fun');
    }
  }
};
/* центри смуг при повороті: на горизонтальній вулиці лишаємо y-смугу,
   на вертикальній — x-смугу (v14) */
function vLaneCenter(x){
  for(const sx of VS_SAFE()){if(x>=sx&&x<=sx+2)return sx+1.2;}
  return x;
}
function hLaneCenter(y){
  for(const sy of HS_SAFE()){if(y>=sy&&y<=sy+2)return sy+1.2;}
  return y;
}
function VS_SAFE(){return IB.W.V_STREETS||[];}
function HS_SAFE(){return IB.W.H_STREETS||[];}
/* v18: ДУБЛЬОВАНИЙ ПРОСТИЙ updateCars ВИДАЛЕНО — він оголошувався ПІЗНІШЕ
   і перекривав повну версію з ПОВОРОТАМИ НА ПЕРЕХРЕСТЯХ (дуги 0.35с,
   правосторонні смуги, прив'язка до сітки вулиць). Тепер активна саме
   повна версія вище: авто ПОВЕРТАЮТЬ і змінюють вид _sw↔_se у drawCar. */

IB.spawnVillagers=()=>{
  IB.spawnCars();
  IB.spawnMarsh&&IB.spawnMarsh();   /* v5.0: маршрутка №7 у петлі */
  IB.E.npcs=[];
  IB.E.dolphins=[];
  const spots=[];
  const put=(x,y,o)=>spots.push(Object.assign({x,y,role:'walk'},o||{}));
  /* v3.0: ПЕРЕХОЖІ ПО РАЙОНАХ — місто ЖИВЕ ЩІЛЬНІШЕ (37 осіб) */
  /* ОДЕСЬКИЙ НАПРЯМ: дачники, трактові і СЕЛА ГРОМАДИ */
  put(80,20);put(150,20);put(250,22);put(120,8);put(60,22);put(170,22);put(270,22);put(380,22);
  /* Північний масив */
  put(18,62);put(70,62);put(130,46);put(180,64);put(206,46);put(66,68,{name:'продавчиня Зіна',role:'walk'});
  put(148,46);put(38,62);put(112,64);put(214,64);put(300,64);put(360,64);put(410,46);put(90,102);
  /* Центр — просп. Миру */
  put(30,124);put(90,150);put(120,168);put(160,124);put(200,150);put(90,146,{name:'туристка Міла'});
  put(174,150);put(58,170);put(126,64);put(206,160);put(280,124);put(340,150);put(400,124);put(230,168);
  /* Південний масив + Суднобудівників */
  put(20,222);put(60,222);put(100,224);put(196,224);put(38,224);put(112,224);
  put(300,232);put(340,246);put(250,262);put(160,276);put(60,294);put(200,308);
  /* Приморський + набережна */
  put(50,380);put(90,378);put(130,384);put(170,430);put(196,432);
  put(136,446);put(166,446);put(96,444);put(230,432);put(300,430);put(60,352);
  /* Села узбережжя */
  put(24,344);put(20,408);put(300,410);
  /* Порт */
  put(360,380);put(380,384);put(360,420);put(400,398);
  /* Пляж */
  put(80,452);put(140,452);put(46,432,{name:'малий Артём'});put(180,124);put(250,456);put(300,450);put(190,460);put(120,466);
  /* ===== v6.0: ПРОФЕСІЙНІ МІСЦЯ — живий персонал міста ===== */
  for(let i=0;i<4;i++)put(282+i*4,50,{name:'лікар '+['Ольга','Ігор','Марта','Сергій'][i],prof:'doctor',role:'walk'});
  put(290,46,{name:'медсестра Оксана',prof:'doctor',role:'walk'});
  for(let i=0;i<3;i++)put(366+i*4,132+i*3,{name:'професор '+['Іванюк','Франкова','Ковтун'][i],prof:'professor',role:'walk'});
  for(let i=0;i<4;i++)put(96+i*5,60,{name:'продавець '+['Митя','Зоя','Валя','Гриша'][i],prof:'seller',role:'walk'});
  for(let i=0;i<4;i++)put(316+i*5,152,{name:'продавчиня '+['Рита','Люся','Соня','Емма'][i],prof:'seller',role:'walk'});
  for(let i=0;i<5;i++)put(196+i*8,124,{name:'офісник '+['Андрій','Костя','Юрко','Марина','Денис'][i],prof:'office',role:'walk'});
  for(let i=0;i<3;i++)put(210+i*7,140,{name:'офісниця '+['Іра','Настя','Тамara'.replace('ara','ара')][i],prof:'office',role:'walk'});
  for(let i=0;i<4;i++)put(60+i*14,70+i*6,{name:'комунальник '+['Толик','Слава','Боря','Коля'][i],prof:'communal',role:'walk'});
  for(let i=0;i<3;i++)put(120+i*10,240,{name:'будівельник '+['Петро','Вова','Жора'][i],prof:'builder',role:'walk'});
  for(let i=0;i<3;i++)put(350+i*6,398,{name:'портовий '+['Колян','Митя','Стива'][i],prof:'dock',role:'walk'});
  /* ===== КВЕСТОВІ NPC (районні доручення) ===== */
  put(70,430,{role:'static',name:'прибиральник Тарас',quest:'trash',
    look:{skin:'#d89868',hair:'#2a2018',hat:'cap',hatc:'#e07038',jacket:'#e07038',pants:'#3a4048'}});
  put(69,430,{role:'static',name:'рятувальник Степан',quest:'rescue',
    look:{skin:'#e0a878',hair:'#1e1610',hat:'none',jacket:'#d82838',pants:'#e8e8e2'}});
  put(64,168,{role:'static',name:'бабуся Оля',quest:'fish',
    look:{skin:'#e0b090',hair:'#c8c4b8',hat:'kerchief',jacket:'#8a4a3a',pants:'#3a3a44'}});
  put(360,398,{role:'static',name:'вантажник Петро',quest:'port',
    look:{skin:'#d89868',hair:'#241a10',hat:'cap',hatc:'#3a3a44',jacket:'#3a3a44',pants:'#2e3238'}});
  put(30,64,{role:'static',name:'співак Едік',quest:'singer',
    look:{skin:'#e0a878',hair:'#3a2a1a',hat:'none',jacket:'#2a6ac8',pants:'#e8e8e2',beard:true}});
  put(88,158,{role:'static',name:'агентка Віра',quest:null,
    look:{skin:'#f0b48c',hair:'#6a3a1a',hat:'none',jacket:'#28303e',pants:'#28303e'}});
  /* v2.0: районні NPC */
  put(204,47,{role:'static',name:'листоноша Юра',quest:'mail',
    look:{skin:'#e0a878',hair:'#2a2018',hat:'cap',hatc:'#2255aa',jacket:'#2255aa',pants:'#2a3038'}});
  put(146,447,{role:'static',name:'бармен Оксана',quest:'oxana',
    look:{skin:'#f0b48c',hair:'#8a4a2a',hat:'none',jacket:'#4ee06a',pants:'#e8e8e2'}});
  put(33,64,{role:'static',name:'дворник Митя',quest:'mitia',
    look:{skin:'#d89868',hair:'#241a10',hat:'cap',hatc:'#e07038',jacket:'#8a7a3a',pants:'#3a4048'}});
  put(380,264,{role:'static',name:'рибалка Гриша',quest:'grisha',
    look:{skin:'#d89868',hair:'#3a2a1a',hat:'cap',hatc:'#3e6a34',jacket:'#3e6a34',pants:'#2e3238'}});
  put(236,158,{role:'static',name:'касирка Тамара',quest:'tamara',
    look:{skin:'#f0b48c',hair:'#6a3a1a',hat:'none',jacket:'#b82840',pants:'#2a2e38'}});
  put(14,402,{role:'static',name:'капітан Костя',quest:'kostia',
    look:{skin:'#e0a878',hair:'#1e1610',hat:'cap',hatc:'#e8e8e2',jacket:'#2a3e5c',pants:'#e8e8e2',beard:true}});
  put(100,64,{role:'static',name:'продавчиня Зіна (рядок)',quest:'zina',
    look:{skin:'#e0b090',hair:'#c8c4b8',hat:'kerchief',jacket:'#4e9440',pants:'#3a3a44'}});
  put(74,398,{role:'static',name:'офіціантка Люда',quest:'liuda',
    look:{skin:'#f0b48c',hair:'#8a4a2a',hat:'none',jacket:'#e8e8e2',pants:'#2a2e38'}});
  put(44,95,{role:'static',name:'машиніст Дорофеïч',quest:'doro',
    look:{skin:'#e0a878',hair:'#c8c4b8',hat:'cap',hatc:'#2255aa',jacket:'#2255aa',pants:'#2a2e38',beard:true}});
  put(146,163,{role:'static',name:'автодромник Женя',quest:'zhenia',
    look:{skin:'#d89868',hair:'#241a10',hat:'cap',hatc:'#e05a5a',jacket:'#e05a5a',pants:'#2e3238'}});
  put(364,308,{role:'static',name:'охоронець Іван',quest:null,
    look:{skin:'#e0a878',hair:'#241a10',hat:'cap',hatc:'#3a3e4c',jacket:'#3a3e4c',pants:'#2e3238'}});
  /* ===== v3.0 «ПАНЕЛІ І ЧАЙКИ»: нові NPC ===== */
  put(120,435,{role:'static',name:'стара Галя з хлібом',quest:'gulls',
    look:{skin:'#e0b090',hair:'#c8c4b8',hat:'kerchief',jacket:'#8a6a48',pants:'#3a3a44'}});
  put(269,158,{role:'static',name:'Коля з «Альбатроса»',quest:'second',
    look:{skin:'#e0a878',hair:'#3a2a1a',hat:'none',jacket:'#e8d050',pants:'#28303e'}});
  /* ===== i3-ents-v31: ДІВЧАТА КУРОРТУ — «ходиш говориш з дівчатами» =====
     E → «Познайомитись» / «ЗАПРОСИТИ ГУЛЯТИ» — вона може ЗАБРАТИ героя
     на декілька годин (до 15!) — TOXIC пішов гуляти з Галею на 15 годин... */
  const GIRLS=[
    {name:'Галя з клуба',x:322,y:388,look:{skin:'#f0b48c',hair:'#2a1a10',hat:'none',jacket:'#e05a8a',pants:'#e8e8e2'}},
    {name:'Ірина',x:52,y:432,look:{skin:'#f0a482',hair:'#4a2a14',hat:'none',jacket:'#c83868',pants:'#2a3e5c'}},
    {name:'Марта',x:210,y:28,look:{skin:'#e8a878',hair:'#6a3a1a',hat:'none',jacket:'#4aa0d8',pants:'#e8e8e2'}},
    {name:'Аліна',x:110,y:452,look:{skin:'#f0b48c',hair:'#1e1610',hat:'none',jacket:'#e8a030',pants:'#e05a8a'}},
    {name:'Таня',x:94,y:168,look:{skin:'#e0a878',hair:'#3a2a1a',hat:'none',jacket:'#7a5ac8',pants:'#e8e8e2'}},
    {name:'Света',x:88,y:150,look:{skin:'#f0a482',hair:'#8a4a2a',hat:'none',jacket:'#3ac8a0',pants:'#3a3a44'}},
    {name:'Діана',x:64,y:124,look:{skin:'#e8ac80',hair:'#2a1e12',hat:'none',jacket:'#d85868',pants:'#e8d050'}},
    {name:'Настя',x:128,y:66,look:{skin:'#f0b48c',hair:'#5a2a1a',hat:'none',jacket:'#2a9ad8',pants:'#2a2e38'}},
    {name:'Юля',x:20,y:50,look:{skin:'#e0a878',hair:'#1a120a',hat:'none',jacket:'#e07098',pants:'#3a3a44'}},
    {name:'Ріта',x:101,y:432,look:{skin:'#f0a482',hair:'#6a3a2a',hat:'none',jacket:'#50c878',pants:'#e8e8e2'}},
  ];
  for(const g of GIRLS)put(g.x,g.y,{role:'girl',name:g.name,look:g.look});
  /* туристи на пляжі */
  for(let i=0;i<20;i++){
    const tx=14+IB.hsh(i,3,71)*300,ty=442+IB.hsh(i,4,72)*26;
    spots.push({x:IB.M.round(tx),y:IB.M.round(ty),role:'tourist2',
      look:{skin:['#f0a482','#e0a878','#d89868','#c88a5a'][i%4],hair:'#241a10',
        hat:i%3===0?'cap':'none',hatc:['#e07038','#3aa0e0','#4ee06a'][i%3],
        jacket:['#e07038','#3aa0e0','#e8d050','#e07ab8'][i%4],pants:['#3a3a44','#e8e8e2','#2a3e5c'][i%3]}});
  }
  let si=0;
  for(const s of spots){
    const seed=si*17+3;si++;
    const rc=IB.snapToReach?IB.snapToReach(s.x,s.y):{x:s.x,y:s.y};
    s.x=rc.x;s.y=rc.y;
    /* v6.0: ПРОФЕСІЇ — у кожного мешканця своя робота, сюжет і квест */
    const prof=s.prof||IB.profFor(s.x,s.y);
    IB.E.npcs.push({
      x:s.x,y:s.y,dir:'d',fr:0,frT:0,
      look:s.look||((prof&&IB.PROFS[prof])?Object.assign({},IB.PROFS[prof].look):IB.lookBySeed(seed)),
      name:s.name||VIL_NAMES[si%VIL_NAMES.length],
      role:s.role||'walk',quest:s.quest||null,
      prof:s.role==='girl'?null:prof,
      hx:s.x,hy:s.y,wt:IB.rnd(0,2),tx:s.x,ty:s.y,talked:0
    });
  }
  /* i3-ents-v31: ДЯДЯ СІ І ТІТКА НІ — «то приходять, то уходять» */
  if(IB.spawnSiNi)IB.spawnSiNi();
  /* дівчата, які зараз гуляють з героями, у місті не стоять */
  if(IB.G.dateAway)for(const d of IB.G.dateAway){
    const g=IB.E.npcs.find(n=>n.name===d.girl);
    if(g)IB.E.npcs.splice(IB.E.npcs.indexOf(g),1);
  }
};

/* ================= i3-ents-v31: ДЯДЯ СІ І ТІТКА НІ =================
   Двоє родичів групи: то приходять, то уходять. Можуть бути ЯК У ТАБОРІ,
   так і в місті; можуть гуляти, можуть не приходити взагалі.
   Сі — шашлик, байки, шавуха; Ні — лимонад, пампушки, турбота. */
IB.SI_NI={
  si:{key:'si',name:'дядя Сі',phase:'away',t:IB.rnd(30,80),
    look:{skin:'#d89868',hair:'#3a2a1a',hat:'cap',hatc:'#6a4a2a',jacket:'#8a5a3a',pants:'#3a3a44',beard:true}},
  ni:{key:'ni',name:'тітка Ні',phase:'away',t:IB.rnd(50,120),
    look:{skin:'#e0b090',hair:'#c8b090',hat:'kerchief',hatc:'#e07098',jacket:'#c85878',pants:'#4a3e5c'}},
};
/* якорі «де Сі/Ні можуть гуляти» — по всьому живому місту */
const SINI_SPOTS=[
  {x:120,y:433,z:'набережна'},{x:214,y:404,z:'Площа східців'},{x:212,y:164,z:'Парк якорів'},
  {x:136,y:160,z:'Луна-парк'},{x:128,y:66,z:'Ринок «Північний»'},{x:58,y:36,z:'Вокзал'},
  {x:322,y:386,z:'Клуб «Маяк»'},{x:210,y:26,z:'Автостанція'},{x:262,y:384,z:'Бронкс'},
  {x:96,y:370,z:'Приморський парк'},{x:380,y:380,z:'Порт'},{x:100,y:64,z:'Центр, ринок'},
];
IB.spawnSiNi=()=>{
  for(const k of ['si','ni']){
    const S=IB.SI_NI[k];
    /* прибрати стару точку */
    if(S.npc){const i=IB.E.npcs.indexOf(S.npc);if(i>=0)IB.E.npcs.splice(i,1);S.npc=null;}
    if(S.phase==='away')continue;
    let sx,sy,zone;
    if(S.phase==='camp'){
      const c=(IB.G.wildCamps&&IB.G.wildCamps.length)?IB.G.wildCamps[IB.G.wildCamps.length-1]:
        (IB.G.home?IB.W.buildings.find(b=>b.type===IB.G.home.id):null);
      if(!c){S.phase='city';}
      else{sx=c.x+2+(k==='ni'?1:0);sy=(c.y+(c.h||4)+2);zone='біля '+(c.name||'вашої хати');}
    }
    if(S.phase==='city'){
      const sp=SINI_SPOTS[IB.ri(0,SINI_SPOTS.length-1)];
      sx=sp.x;sy=sp.y;zone=sp.z;
    }
    if(sx===undefined)continue;
    const rc=IB.snapToReach?IB.snapToReach(sx,sy):{x:sx,y:sy};
    S.npc={x:rc.x,y:rc.y,dir:'d',fr:0,frT:0,look:S.look,name:S.name,role:'sini',sini:k,
      quest:null,hx:rc.x,hy:rc.y,wt:IB.rnd(0,2),tx:rc.x,ty:rc.y,zone:zone,sayT:IB.rnd(6,20)};
    IB.E.npcs.push(S.npc);
    S.zone=zone;
  }
};
IB.SINI_LINES={
  si:['Чайок годував? Молодці. Вони тут розумніші за порт.','Я вашу ГАЛЕЧУНЮ бачив — з Іриною гуляє. Каже, морський бриз найліпший.','Шашлик — це математика: вогонь, сіль, терпіння. І трохи щастя.','В Іллічівську я ще моряком ходив. Тепер тут море — як родич.','Рейв? У мої часи був тапок і дворик. Але ви — танцюйте!'],
  ni:['Їли взагалі?! Ось вам пампушки, і не сперечайтеся.','Лимонад холодний, у льоху стояв. Тільки не перед Сі!','Засмагли, як раки... крем! КРЕМ! Хто в мене крем узяв?','Тітка Ні бачила чайок — так до хліба й лізуть, зухвалі.','Спекою дує — сидіть у тіні до вечора, легендарні мої.'],
};
IB.updateSiNi=(dt)=>{
  if(!IB.E.npcs)return;
  for(const k of ['si','ni']){
    const S=IB.SI_NI[k];
    if(S.phase==='away'){
      S.t-=dt;
      if(S.t<=0){
        /* прийти: 45% у табір (якщо є), решта — гуляти містом */
        const hasCamp=IB.G.wildCamps&&IB.G.wildCamps.length;
        S.phase=(hasCamp&&IB.M.random()<0.45)?'camp':'city';
        S.stay=IB.rnd(90,220);
        IB.spawnSiNi();
        if(S.npc){
          IB.toast(S.name+' ПРИЙШОВ: '+S.zone+' (E — поговорити)','radio');
          IB.journalAdd('👨‍🌾',S.name+' з\'явився у '+S.zone+'. Тепер у місті на одного свого більше.');
          if(k==='si')IB.G.flags.siMet=true;else IB.G.flags.niMet=true;
          IB.questCheck();
        }
      }
      continue;
    }
    /* активний: гуляє поблизу своєї точки */
    if(!S.npc){S.phase='away';S.t=IB.rnd(40,90);continue;}
    S.stay-=dt;
    const n=S.npc;
    n.sayT-=dt;
    if(n.bubble){n.bubble.t+=dt;if(n.bubble.t>n.bubble.life)n.bubble=null;}
    const L=IB.E.team[0];
    if(L&&n.sayT<=0&&IB.dist(n.x,n.y,L.x,L.y)<3.4){
      n.sayT=IB.rnd(14,30);
      n.bubble={txt:IB.SINI_LINES[k][IB.ri(0,IB.SINI_LINES[k].length-1)],t:0,life:3.4};
    }
    n.wt-=dt;
    if(n.tx!==n.x||n.ty!==n.y){moveEnt(n,dt,0.7);if(n.x===n.tx&&n.y===n.ty)n.wt=IB.rnd(3,8);}
    else if(n.wt<=0){
      if(!pickWander(n,2.5)){n.wt=2;}
      else n.wt=IB.rnd(3,8);
    } else idleAnim(n,dt);
    if(S.stay<=0){
      /* пішли — «то приходят, то уходят» */
      const i=IB.E.npcs.indexOf(n);if(i>=0)IB.E.npcs.splice(i,1);
      S.npc=null;S.phase='away';S.t=IB.rnd(60,180);
      IB.toast(S.name+' пішов(шла) у свої справи — «то приходят, то уходят»','radio');
      IB.journalAdd('👨‍🌾',S.name+' пішов(шла). Кажуть, з\'явиться знову — вони ж родичі.');
    }
  }
};

/* ---------- ТВАРИНИ ---------- */
IB.spawnAnimals=()=>{
  IB.E.animals=[];
  /* i3/v3.0: ЧАЙКИ (більше, замість ворон) — над пляжем, морем і містом */
  for(let i=0;i<20;i++){
    IB.E.animals.push({type:'gull',x:10+IB.rnd(0,414),y:60+IB.rnd(0,430),dir:'d',fr:0,frT:0,wt:0,tx:0,ty:0,fx:IB.rnd(0,60),feedT:0});
  }
  /* краби на піску */
  for(let i=0;i<12;i++){
    IB.E.animals.push({type:'crab',x:8+IB.rnd(4,310),y:442+IB.rnd(0,26),dir:'d',fr:0,frT:0,wt:0,tx:0,ty:0});
  }
  /* пси на пляжі */
  IB.E.animals.push({type:'dog',x:60,y:452,dir:'d',fr:0,frT:0,wt:0,tx:0,ty:0});
  IB.E.animals.push({type:'dog',x:120,y:456,dir:'d',fr:0,frT:0,wt:0,tx:0,ty:0});
  /* кіт у парку */
  IB.E.animals.push({type:'cat',x:90,y:92,dir:'d',fr:0,frT:0,wt:0,tx:0,ty:0});
};
IB.spawnFishes=()=>{
  IB.E.fishes=[];
  const L=IB.W.LAKE;
  /* i3/v3.0: риба в Чорному морі — мілководдя (146..165) і глибина (166..194) */
  for(let i=0;i<20;i++)IB.E.fishes.push({x:IB.rnd(8,240),y:IB.rnd(167,192),t:IB.rnd(0,3)});
  for(let i=0;i<10;i++)IB.E.fishes.push({x:IB.rnd(8,240),y:IB.rnd(148,164),t:IB.rnd(0,3)});
  /* v2.0: риба Сухого лиману */
  for(let i=0;i<6;i++)IB.E.fishes.push({x:IB.rnd(228,246),y:IB.rnd(54,77),t:IB.rnd(0,3)});
};

/* ---------- ЗАГУБЛЕНИЙ ТУРИСТ (подія) ---------- */
IB.spawnTourist=()=>{
  if(IB.E.tourist)return;
  let tx,ty,tries=0;
  do{tx=IB.rnd(10,236);ty=IB.rnd(147,163);tries++;}
  while(tries<40&&(IB.W.at(tx,ty)!==1||IB.W.propAt(IB.M.round(tx),IB.M.round(ty))));
  const rc=IB.snapToReach?IB.snapToReach(tx,ty):{x:tx,y:ty};tx=rc.x;ty=rc.y;
  IB.E.tourist={x:tx,y:ty,dir:'d',fr:0,frT:0,
    look:{skin:'#f0b48c',hair:'#4a2a10',hat:'none',jacket:'#e8d050',pants:'#e07ab8'},
    name:'ЗАГУБЛЕНА ДИТИНА',found:false,follow:false,small:true};
  IB.logLine('СЛУХ: десь на пляжі хтось плаче — «МАМО-О!»','gold');
};

/* ---------- v2.2: антизалипання — тихо перенести героя до лідера ---------- */
IB.unstickTo=(leader,h)=>{
  for(let k=0;k<14;k++){
    const a=IB.rnd(0,6.28),r=IB.rnd(0.6,2.2);
    const nx=leader.x+IB.M.cos(a)*r,ny=leader.y+IB.M.sin(a)*r;
    if(IB.walkable(nx,ny)&&IB.M.abs(IB.W.elevAt(nx,ny)-IB.W.elevAt(leader.x,leader.y))<=1.01){
      h.x=nx;h.y=ny;h.tx=nx;h.ty=ny;return true;
    }
  }
  h.x=leader.x+0.8;h.y=leader.y;h.tx=h.x;h.ty=h.y;
  return true;
};
IB.unstickSay=(txt)=>{
  const now=performance.now();
  if(!IB._unstickT||now-IB._unstickT>12000){IB._unstickT=now;IB.toast(txt,'gold');}
};

/* ---------- РУХ/ШІ ---------- */
function walkable(x,y){
  const t=IB.W.at(x,y);
  if(t===0)return false;
  if(IB.W.block[(y|0)*IB.W.W+(x|0)])return false;
  const p=IB.W.propAt(x,y);
  if(p&&(p.type==='spruce'||p.type==='spruce2'||p.type==='spruce3'||p.type==='birch'||p.type==='pine'||p.type==='oak'||p.type==='tree2'||p.type==='tower'||p.type==='rock'||p.type==='mrock'||p.type==='deadtree'||p.type==='bench'||p.type==='barrels'||p.type==='crate'||p.type==='busstop'||p.type==='swing'||p.type==='slide'
    ||p.type==='palm'||p.type==='umb'||p.type==='lounger'||p.type==='bin'||p.type==='net'||p.type==='goal'
    ||p.type==='crane'||p.type==='container'||p.type==='catam'||p.type==='paras'||p.type==='ferry'||p.type==='yacht2'
    /* v2.0: нові пропси — непрохідні */
    ||p.type==='wheel'||p.type==='carousel'||p.type==='autodrom'||p.type==='tramp'||p.type==='train'
    ||p.type==='anchor'||p.type==='statue'||p.type==='dsign'||p.type==='beachbar'
    ||p.type==='cabin'||p.type==='tent'||p.type==='surf'||p.type==='jetski'||p.type==='barge'
    ||p.type==='lamp'
    /* v18.7: портові пропси — непрохідні */
    ||p.type==='contstack'||p.type==='cranebig'||p.type==='portoffice'||p.type==='tank'||p.type==='pallets'))return false;
  return true;
}
IB.walkable=walkable;
IB.E.stepTo=(e,dt,speed)=>moveEnt(e,dt,speed);   /* v5.0: авто-хід */

function moveEnt(e,dt,speed){
  if(e.tx===undefined)return false;
  const dx=e.tx-e.x,dy=e.ty-e.y,d=IB.M.hypot(dx,dy);
  if(d<0.15){e.x=e.tx;e.y=e.ty;return true;}
  const st=Math.min(d,speed*dt);
  let nx=e.x+dx/d*st,ny=e.y+dy/d*st;
  /* висота: не стрибаємо >1 */
  const de=IB.W.elevAt(nx,ny)-IB.W.elevAt(e.x,e.y);
  if(IB.M.abs(de)<=1.01&&walkable(nx,ny)){e.x=nx;e.y=ny;}
  else if(walkable(nx,e.y)&&IB.M.abs(IB.W.elevAt(nx,e.y)-IB.W.elevAt(e.x,e.y))<=1.01){e.x=nx;}
  else if(walkable(e.x,ny)&&IB.M.abs(IB.W.elevAt(e.x,ny)-IB.W.elevAt(e.x,e.y))<=1.01){e.y=ny;}
  if(IB.M.abs(dx)>0.1)e.dir=dx>0?'r':'l';else if(IB.M.abs(dy)>0.1)e.dir=dy>0?'d':'u';
  e.frT+=dt*8;e.fr=1+((e.frT|0)%2);
  return false;
}
function idleAnim(e,dt){e.fr=0;e.frT=0;}

function pickWander(e,r){
  const R=IB.W.reach,WW=IB.W.W;
  for(let i=0;i<8;i++){
    const nx=e.hx+IB.rnd(-r,r),ny=e.hy+IB.rnd(-r,r);
    /* v2.2: ціль має бути досяжною (не кишеня за деревами/скелями) */
    if(walkable(nx,ny)&&(!R||R[(ny|0)*WW+(nx|0)]>=0)){e.tx=nx;e.ty=ny;return true;}
  }
  return false;
}

/* оновлення NPC-селян */
IB.updateNpcs=(dt)=>{
  const L=IB.E.team[0];
  for(const n of IB.E.npcs){
    /* v3.0: ЗДОРОВЕННЯ — перехожі вітаються, коли ти поруч */
    if(n.grT===undefined)n.grT=IB.rnd(0,10);
    n.grT-=dt;
    if(n.bubble){n.bubble.t+=dt;if(n.bubble.t>n.bubble.life)n.bubble=null;}
    if(L&&n.grT<=0&&IB.dist(n.x,n.y,L.x,L.y)<3.4&&!IB.G.party.active){
      n.grT=IB.rnd(16,34);
      n.bubble={txt:IB.GREETINGS[IB.ri(0,IB.GREETINGS.length-1)],t:0,life:2.4};
      if(IB.M.random()<0.25)IB.SFX.bird();
    }
    if(n.role==='molfar'||n.role==='static'||n.role==='sini'){if(n.role==='sini')idleAnim(n,dt);else idleAnim(n,dt);continue;}
    if(n.role==='tourist2'){
      n.wt-=dt;
      if(n.tx!==n.x||n.ty!==n.y){moveEnt(n,dt,0.8);if(n.x===n.tx&&n.y===n.ty)n.wt=IB.rnd(4,10);}
      else if(n.wt<=0){
        /* v3.0: У СПЕКУ — «падають» від сонця: більше лежать і «плавяться» */
        const heat=IB.G.wx.type==='heat'||IB.G.wx.type==='sun';
        if(IB.M.random()<(heat?0.55:0.35)){n.lieT=IB.rnd(4,9);
          if(heat&&IB.M.random()<0.4)n.bubble={txt:['Води-и-и...','Сонце зле!','Тінь! ТІНЬ!'][IB.ri(0,2)],t:0,life:2.6};}
        else pickWander(n,3);
        n.wt=IB.rnd(3,6);
      }
      else if(n.lieT>0){n.lieT-=dt;idleAnim(n,dt);}
      else idleAnim(n,dt);
      continue;
    }
    n.wt-=dt;
    if(n.tx!==n.x||n.ty!==n.y){
      moveEnt(n,dt,1.1);
      if(n.x===n.tx&&n.y===n.ty)n.wt=IB.rnd(2,6);
      /* v2.2: NPC застряг у лабіринті 3с — повертається на своє місце */
      if(n.nx===undefined){n.nx=n.x;n.ny=n.y;n.nT=0;}
      if(IB.dist(n.x,n.y,n.nx,n.ny)>0.2){n.nx=n.x;n.ny=n.y;n.nT=0;}
      else{
        n.nT=(n.nT||0)+dt;
        if(n.nT>3){n.x=n.hx;n.y=n.hy;n.tx=n.hx;n.ty=n.hy;n.wt=IB.rnd(1,3);n.nT=0;n.nx=undefined;}
      }
    }
    else if(n.wt<=0){if(!pickWander(n,4))n.wt=2;}
    else idleAnim(n,dt);
  }
};
IB.updateAnimals=(dt)=>{
  const L=IB.E.team[0];
  for(const a of IB.E.animals){
    if(a.type==='gull'){
      /* v3.0: КОРМІННЯ — чайки зльотуються до того, хто годує */
      if(a.feedT>0){
        a.feedT-=dt;
        a.fx=(a.fx||0)+dt*2.4;
        a.x=L.x+IB.M.cos(a.fx)*2.2;
        a.y=L.y+IB.M.sin(a.fx*0.8)*2.0;
        a.frT+=dt*10;a.fr=1+((a.frT|0)%2);
        if(IB.M.random()<dt*0.5)IB.floatMsg(a.x,a.y,'🍞');
        continue;
      }
      /* чайка кружляє над узбережжям */
      a.fx=(a.fx||0)+dt*0.35;
      a.x=IB.clamp(a.x0||(a.x0=a.x)+IB.M.cos(a.fx)*0+0,4,IB.W.W-4);
      a.x=IB.clamp((a.x0)+IB.M.sin(a.fx*0.7)*14,4,IB.W.W-4);
      a.y=IB.clamp((a.y0||(a.y0=a.y))+IB.M.cos(a.fx*0.53)*10,118,IB.W.H-6);
      a.frT+=dt*6;a.fr=1+((a.frT|0)%2);continue;
    }
    a.wt-=dt;
    if(a.tx!==a.x||a.ty!==a.y){moveEnt(a,dt,1.2);if(a.x===a.tx&&a.y===a.ty)a.wt=IB.rnd(3,8);}
    else if(a.wt<=0){if(!pickWander(a,3))a.wt=3;}
    else idleAnim(a,dt);
  }
  /* риби кружляють */
  for(const f of IB.E.fishes){
    f.t+=dt;
    const s=IB.M.sin(f.t*0.7)*0.35,c=IB.M.cos(f.t*0.5)*0.3;
    if(IB.W.at(f.x+s,f.y+c)===0){f.x+=s*dt*0.6;f.y+=c*dt*0.6;}
  }
};
IB.updateTourist=(dt)=>{
  const t=IB.E.tourist;
  if(!t)return;
  if(t.follow){
    const h=IB.E.team[0];
    const d=IB.dist(t.x,t.y,h.x,h.y);
    if(d>2){t.tx=h.x;t.ty=h.y;moveEnt(t,dt,3.2);}
    else{idleAnim(t,dt);
      /* привів до рятувальника Степана? */
      const st=IB.E.npcs.find(n=>n.quest==='rescue');
      if(st&&IB.dist(h.x,h.y,st.x,st.y)<4){IB.SYS.touristRescued({name:'рятувальника Степана'});}}
  }else{
    idleAnim(t,dt);
    t.frT+=dt*2;t.fr=(t.frT|0)%2?1:0;
  }
};

/* ---------- ЗАВДАННЯ ГЕРОЇВ (дерева/вода/риба/готування/ферма) ---------- */
IB.findNode=(type,ax,ay,r)=>{
  let best=null,bd=1e9;
  for(const p of IB.W.props){
    if(p.type!==type)continue;
    if(type==='bush'&&!p.berries)continue;
    if(type==='mush'&&p.taken)continue;
    if(type==='herb'&&p.taken)continue;
    const d=IB.dist(p.x,p.y,ax,ay);
    if(d<r&&d<bd){bd=d;best=p;}
  }
  return best;
};
IB.nodeUsed=new Set();

IB.updateTeam=(dt)=>{
  const leader=IB.E.team[0];
  const fire=IB.G.fireNear?IB.G.fireNear:null;
  for(let i=1;i<IB.E.team.length;i++){
    const h=IB.E.team[i];
    if(IB.G.trip.active){idleAnim(h,dt);continue;}
    /* v2.3: ВЕЧІРКОВЕ ДІЙСТВО — танці навколо вогню, «упав — лежить», «попадали» */
    if(IB.G.party.active){
      if(h.lying>0){
        h.lying-=dt;idleAnim(h,dt);
        if(h.lying<=0){h.lying=0;h.pW=IB.rnd(0.5,1.1)*(IB.M.random()<0.5?-1:1);
          h.bubble={txt:['Ой... голова','Та я не спав!','Де це я?','Ще кружки три!'][IB.ri(0,3)],t:0,life:2.6};}
        continue;
      }
      const ph=IB.PARTY_PHASES[IB.M.min(IB.G.party.hour,7)];
      if(IB.M.random()<dt*ph.fall*(IB.G.party.dry?0.55:1)){
        h.lying=IB.rnd(7,16);h.lieDir=IB.M.random()<0.5?-1.35:1.35;
        h.bubble={txt:['Упав!','Хх-х...','Ой-ой-ой...','Та все нормально!'][IB.ri(0,3)],t:0,life:3};
        IB.floatMsg(h.x,h.y,'💥');IB.SFX.step();
        continue;
      }
      /* v17.0: танці навколо ТОЧКИ гулянки (без табору і вогню) */
      const spot=IB.G.partySpot||{x:leader.x,y:leader.y};
      if(ph.dance>0&&h.pSty<=ph.dance){
        h.pAng=(h.pAng||IB.rnd(0,6.28))+dt*(h.pW||0.7);
        const rr=h.pR||IB.rnd(1.6,3.0);
        h.tx=spot.x+IB.M.cos(h.pAng)*rr;h.ty=spot.y+IB.M.sin(h.pAng)*rr*0.8;
        if(!moveEnt(h,dt,2.7))h.pAng+=dt*0.9; /* вперся — кружляє далі */
        continue;
      }
      idleAnim(h,dt);continue;
    }
    /* v1.5: ПОШУК — пошуковці бігають навколо лідера і КРИЧАТЬ */
    if(h.searchT>0){
      h.searchT-=dt;h.shoutT=(h.shoutT||0)-dt;h.rwT=(h.rwT||0)-dt;
      if(h.shoutT<=0){h.shoutT=IB.rnd(0.8,1.5);
        IB.floatMsg(h.x,h.y-0.3,IB.SHOUTS[IB.ri(0,IB.SHOUTS.length-1)]);IB.SFX.shout();}
      if(h.rwT<=0||(h.tx!==undefined&&IB.dist(h.x,h.y,h.tx,h.ty)<0.3)){
        h.rwT=IB.rnd(0.6,1.2);
        const a=IB.rnd(0,6.28),r=IB.rnd(1.5,4.5);
        const nx=leader.x+IB.M.cos(a)*r,ny=leader.y+IB.M.sin(a)*r;
        if(IB.walkable(nx,ny)){h.tx=nx;h.ty=ny;}
      }
      if(h.tx!==undefined)moveEnt(h,dt,4.6);
      continue;
    }
    /* v1.5: загублений іде НА ГОЛОС — до лідера; це і «розліплює» застряглих */
    if(h.gotoSound){
      h.tx=leader.x;h.ty=leader.y;
      moveEnt(h,dt,4.4);
      if(IB.M.random()<dt*0.8)IB.floatMsg(h.x,h.y,'❓');
      const d=IB.dist(h.x,h.y,leader.x,leader.y);
      /* v2.2-fix: прогрес = плаваюча точка відліку (gBest-макс ніколи не спрацьовував) */
      if(h.gRef===undefined)h.gRef=d;
      if(d<h.gRef-0.3){h.gIdle=0;h.gRef=d;}
      else h.gIdle=(h.gIdle||0)+dt;
      if(h.gIdle>3.5){ /* 3.5с без зближення — «гук» пробиває хащі швидше */
        IB.unstickTo(leader,h);
        IB.unstickSay(h.name+' почав «АУ!» і пробрався несподіваною стежкою!');
        h.gRef=IB.dist(h.x,h.y,leader.x,leader.y);h.gIdle=0;
      }
      if(IB.dist(h.x,h.y,leader.x,leader.y)<3)IB.searchFound(h);
      continue;
    }
    if(h.task==='follow'){
      const ang=i*1.35+IB.M.sin(IB.G.t*0.5+i)*0.2;
      const tx=leader.x-IB.M.cos(ang)*1.6,ty=leader.y-IB.M.sin(ang)*1.6;
      const d=IB.dist(h.x,h.y,tx,ty);
      if(d>1.6){
        /* v2.2: застряг у хащах — 2с без прогресу → прямо до лідера, 4.5с → наздоганяє */
        if(h.fx===undefined){h.fx=h.x;h.fy=h.y;h.fT=0;h.fPh=0;}
        h.fT+=dt;
        if(IB.dist(h.x,h.y,h.fx,h.fy)>=0.3){h.fx=h.x;h.fy=h.y;h.fT=0;h.fPh=0;}
        else if(h.fT>2)h.fPh=1;
        if(h.fPh>=1){h.tx=leader.x;h.ty=leader.y;moveEnt(h,dt,leader.running?4.6:3.6);}
        else{h.tx=tx;h.ty=ty;moveEnt(h,dt,leader.running?4.6:3.4);}
        if(h.fT>4.5){
          IB.unstickTo(leader,h);
          IB.unstickSay(h.name+' пробрався крізь хащі і наздогнав групу!');
          h.fx=h.x;h.fy=h.y;h.fT=0;h.fPh=0;
        }
      }
      else{idleAnim(h,dt);h.fx=undefined;h.fT=0;h.fPh=0;}
      continue;
    }
    /* робота за дорученням */
    if(h.task==='rest'){idleAnim(h,dt);h.hp=IB.clamp(h.hp+dt*4,0,100);continue;}
    const need=IB.TASKS[h.task];
    if(!need)continue;
    if(!h.target){
      const n=IB.findNode(need.node,h.x,h.y,30);
      if(n&&!IB.nodeUsed.has(n)){h.target=n;IB.nodeUsed.add(n);}
      else if(need.at==='water'&&h.task==='water'){
        /* до води/колодязя */
        const w=IB.nearestWater(h.x,h.y,26);
        if(w){h.target={x:w.x,y:w.y,water:true};}
        else{h.task='follow';IB.logLine(h.name+' не знайшов воду поруч','red');continue;}
      }
      else{h.task='follow';continue;}
    }
    const tgt=h.target;
    const d=IB.dist(h.x,h.y,tgt.x,tgt.y);
    if(d>1.35){
      /* застряг біля перешкоди? — змінюємо ціль */
      if(h.lx===undefined){h.lx=h.x;h.ly=h.y;h.stuckT=0;}
      h.stuckT+=dt;
      if(IB.dist(h.x,h.y,h.lx,h.ly)<0.25){
        if(h.stuckT>2.5){IB.nodeUsed.delete(tgt);h.target=null;h.stuckT=0;h.lx=h.x;h.ly=h.y;continue;}
      }else{h.stuckT=0;h.lx=h.x;h.ly=h.y;}
      h.tx=tgt.x;h.ty=tgt.y;moveEnt(h,dt,2.8);
    }
    else{
      idleAnim(h,dt);
      h.taskT+=dt;
      if(h.taskT>=need.time){
        h.taskT=0;
        need.done(h,tgt);
        if(tgt.water){h.target=null;}
        else{
          /* вичерпаний ресурс? */
          if(tgt.type==='wood'&&tgt.amt<=0){IB.W.props.splice(IB.W.props.indexOf(tgt),1);IB.W.grid.delete(tgt.y*IB.W.W+tgt.x);IB.nodeUsed.delete(tgt);}
          if((tgt.type==='mush'||tgt.type==='herb')&&tgt.taken){IB.nodeUsed.delete(tgt);h.target=null;}
          if(tgt.type==='bush'&&!tgt.berries){IB.nodeUsed.delete(tgt);h.target=null;}
          if(h.target===tgt&&(tgt.type!=='wood'||tgt.amt<=0))h.target=null;
        }
      }
    }
  }
  IB.nodeUsedClearT=(IB.nodeUsedClearT||0)+dt;
  if(IB.nodeUsedClearT>30){IB.nodeUsedClearT=0;IB.nodeUsed.clear();}
};

IB.TASKS={
  wood:{node:'wood',time:6,at:'land',label:'рубати дрова',
    done(h,t){const n=Math.min(t.amt,1+IB.ri(0,1));t.amt-=n;IB.G.inv.wood+=n;IB.SFX.chop();
      IB.floatMsg(h.x,h.y,'+'+n+'🌲');IB.logLine(h.name+' наклав дров (+'+n+')');}},
  water:{node:null,time:4,at:'water',label:'носити воду',
    done(h,t){IB.G.inv.water=IB.M.min((IB.G.inv.water||0)+2,10);IB.SFX.drink();
      IB.floatMsg(h.x,h.y,'+2💧');IB.logLine(h.name+' приніс воду (+2)');}},
  fish:{node:null,time:9,at:'water',label:'рибалити',
    done(h,t){const lucky=h.id==='taras';const r=IB.M.random();
      if(r<(lucky?0.85:0.55)){IB.G.inv.fishraw+=1;IB.SFX.fish();IB.floatMsg(h.x,h.y,'+1🐟');
        IB.logLine(h.name+(lucky?' витягнув ЗОЛОТУ рибину!':' витягнув рибину!'));}
      else{IB.floatMsg(h.x,h.y,'мимо');}}},
  farm:{node:null,time:8,at:'camp',label:'доглядати грядку',
    done(h,t){IB.SYS.farmTick(h);}},
  cook:{node:null,time:10,at:'camp',label:'готувати їжу',
    done(h,t){IB.SYS.autoCook(h);}},
};
IB.nearestWater=(x,y,r)=>{
  let best=null,bd=1e9;
  for(let dy=-r;dy<=r;dy+=1)for(let dx=-r;dx<=r;dx+=1){
    if(IB.W.at(x+dx,y+dy)!==0)continue;
    const d=IB.M.hypot(dx,dy);
    if(d<bd){bd=d;best={x:x+dx,y:y+dy};}
  }
  return best;
};
/* v2.1: табір будь-де — nearCamp бачить і походні табори (найближчий перемагає) */
IB.nearCamp=(x,y,r=4)=>{
  let best=null,bd=1e9;
  for(const c of IB.W.CAMPS){const d=IB.dist(x,y,c.x,c.y);if(d<=IB.M.max(r,c.r)&&d<bd){bd=d;best=c;}}
  for(const c of (IB.G.wildCamps||[])){const d=IB.dist(x,y,c.x,c.y);if(d<=IB.M.max(r,c.r||4.5)&&d<bd){bd=d;best=c;}}
  return best;
};

/* ==================== v17.0: ЗВІРІ — БРОДЯЧИЙ ПЕС (загроза), ЧАЙКИ (налітають), НІЧНІ МЕТЕЛИКИ (на фонарики) ==================== */
IB.beastTimers=()=>{if(!IB.G.bt)IB.G.bt={lynx:IB.rnd(45,100),raven:IB.rnd(35,80),bat:IB.rnd(25,60)};return IB.G.bt;};

function beastSpot(minD,maxD,forestOnly){
  const L=IB.E.team[0];
  for(let i=0;i<24;i++){
    const a=IB.rnd(0,6.28),r=IB.rnd(minD,maxD);
    const x=L.x+IB.M.cos(a)*r,y=L.y+IB.M.sin(a)*r;
    if(x<3||y<3||x>IB.W.W-4||y>IB.W.H-4)continue;
    if(IB.W.at(x,y)===0)continue;
    if(IB.W.elevAt(x,y)>=6)continue;
    if(forestOnly){const t=IB.W.at(x,y);if(t!==2&&t!==3)continue;}
    if(IB.W.propAt(x,y))continue;
    return {x,y};
  }
  return null;
}

IB.updateBeasts=(dt)=>{
  if(IB.G.mode!=='game')return;
  const L=IB.E.team[0];
  if(!L)return;
  const nf=IB.nightFactor();
  const bt=IB.beastTimers();
  const torch=IB.G.torch!==false;

  /* ---------- ПЕС: крадеться дворами, може ЦЬОПНУТИ; тікає від бігуна ---------- */
  bt.lynx-=dt;
  if(bt.lynx<=0){
    bt.lynx=IB.rnd(90,200);
    if(!IB.E.beasts.find(b=>b.type==='lynx')&&IB.M.random()<0.6){
      const s=beastSpot(10,16,true);
      if(s){IB.E.beasts.push({type:'lynx',x:s.x,y:s.y,dir:'d',fr:0,frT:0,state:'stalk',t:0});
        IB.toast('Дворовий ПЕС крадеться до групи... Не біжи повільно!','red');IB.SFX.growl();
        IB.journalAdd('🐾','Біля групи крадеться бродячий пес. Відігнати: бігти на нього (SHIFT) або триматись разом.');}
    }
  }
  /* ---------- v3.0: ЧАЙКИ замість ворон — зграя налітає на ЇЖУ на піску ---------- */
  bt.raven-=dt;
  if(bt.raven<=0){
    bt.raven=IB.rnd(110,240);
    if(!IB.E.beasts.find(b=>b.type==='ravens')&&nf<0.8&&IB.M.random()<0.55){
      const s=beastSpot(12,18,false);
      if(s){
        const birds=[];
        for(let i=0;i<5+IB.ri(0,2);i++)birds.push({ox:IB.rnd(-2.4,2.4),oy:IB.rnd(-2.4,2.4),ph:IB.rnd(0,6.28),z:IB.rnd(22,40),dive:false});
        IB.E.beasts.push({type:'ravens',gull:true,x:s.x,y:s.y,tx:L.x,ty:L.y,birds:birds,state:'fly',t:0});
        IB.banner('ЧАЙКИ НАЛІТАЮТЬ НА ХОТ-ДОГ!');IB.SFX.gull();
      }
    }
  }
  /* ---------- МЕТЕЛИКИ: тільки вночі і ТІЛЬЬКИ якщо фонарики увімкнені ---------- */
  bt.bat-=dt;
  if(bt.bat<=0){
    bt.bat=IB.rnd(50,110);
    if(torch&&nf>0.6&&!IB.E.beasts.find(b=>b.type==='bats')){
      const anchor=IB.E.team[IB.ri(0,IB.E.team.length-1)];
      const bats=[];
      for(let i=0;i<6+IB.ri(0,3);i++)bats.push({a:IB.rnd(0,6.28),r:IB.rnd(0.8,2.6),z:IB.rnd(16,34),sp:IB.rnd(1.5,3)*(IB.M.random()<0.5?-1:1)});
      IB.E.beasts.push({type:'bats',x:anchor.x,y:anchor.y,anchor:anchor,bats:bats,state:'orbit',t:0,sq:1.2});
      IB.banner('МЕТЕЛИКИ ЗЛЕТІЛИСЬ НА ФОНАРИКИ!');IB.SFX.bat();
      IB.journalAdd('🦋','Нічні метелики кружляють на світлі фонариків. Вимкни ФОНАР — розлетяться.');
    }
  }

  /* ---------- поведінка звірів ---------- */
  for(let i=IB.E.beasts.length-1;i>=0;i--){
    const b=IB.E.beasts[i];b.t+=dt;
    if(b.type==='lynx'){
      let best=null,bd=1e9;
      for(const h of IB.E.team){const d=IB.dist(b.x,b.y,h.x,h.y);if(d<bd){bd=d;best=h;}}
      const camp=IB.G.nearCamp(b.x,b.y,6);
      const fireOn=camp&&IB.G.camps[camp.id].fire&&IB.G.camps[camp.id].fuel>0;
      if(b.state==='flee'){
        moveEnt(b,dt,4.2);
        if(b.x===b.tx&&b.y===b.ty){b.tx=b.x+IB.rnd(-10,10);b.ty=b.y+IB.rnd(-10,10);}
        if(b.t>6||IB.dist(b.x,b.y,L.x,L.y)>22)IB.E.beasts.splice(i,1);
        continue;
      }
      if(fireOn||L.running&&IB.dist(b.x,b.y,L.x,L.y)<4.2){
        b.state='flee';b.tx=b.x+IB.rnd(-16,16);b.ty=b.y+IB.rnd(-16,16);b.t=0;
        if(L.running)IB.toast('Пес гавкнув і побіг геть у двори!','gold');
        continue;
      }
      if(b.state==='stalk'){
        if(bd<7)b.state='lunge';
        else{b.tx=best.x;b.ty=best.y;moveEnt(b,dt,1.35);}
      }
      if(b.state==='lunge'){
        b.tx=best.x;b.ty=best.y;
        moveEnt(b,dt,3.4);
        if(IB.dist(b.x,b.y,best.x,best.y)<1.35){
          best.hp=IB.clamp(best.hp-8,0,100);best.mood=IB.clamp(best.mood-14,0,100);
          IB.floatMsg(best.x,best.y,'РЯВ!');
          IB.toast('ПЕС ЦЬОПНУВ '+best.name+'! Сили −8. Відігнати — бігти на нього (SHIFT)','red');
          IB.SFX.growl();
          b.state='flee';b.tx=b.x+IB.rnd(-18,18);b.ty=b.y+IB.rnd(-18,18);b.t=0;
        }
        else if(b.t>5){b.state='stalk';b.t=0;}
      }
    }
    else if(b.type==='ravens'){
      if(b.state==='fly'){
        const d=IB.dist(b.x,b.y,b.tx,b.ty);
        if(d>0.8){b.x+=(b.tx-b.x)/IB.M.max(0.1,d)*3.2*dt;b.y+=(b.ty-b.y)/IB.M.max(0.1,d)*3.2*dt;}
        for(const bird of b.birds){bird.ph+=dt*7;bird.z=26+IB.M.sin(bird.ph*0.6)*6;}
        if(IB.dist(b.x,b.y,L.x,L.y)<9){
          b.state='dive';b.t=0;
          for(const bird of b.birds)bird.dive=IB.M.random()<0.42;
          if(!b.birds.some(x=>x.dive))b.birds[0].dive=true;
          IB.toast('ЧАЙКИ ПІКІРУЮТЬ! Ганяй їх (бігай поруч)!','red');IB.SFX.gull();
        }
        if(b.t>14)b.state='leave';
      }
      else if(b.state==='dive'){
        let hit=false;
        const victim=IB.E.team[IB.ri(0,IB.E.team.length-1)];
        const d0=IB.dist(b.x,b.y,victim.x,victim.y);
        if(d0>0.4){b.x+=(victim.x-b.x)/IB.M.max(0.1,d0)*2.6*dt;b.y+=(victim.y-b.y)/IB.M.max(0.1,d0)*2.6*dt;}
        for(const bird of b.birds){
          if(bird.dive){
            bird.z-=dt*26;
            if(bird.z<=0&&!hit){
              hit=true;bird.dive=false;bird.z=28;
              victim.mood=IB.clamp(victim.mood-6,0,100);
              const steals=['berries','bread','eggs'].filter(k=>(IB.G.inv[k]||0)>0);
              if(steals.length&&IB.M.random()<0.6){
                const k=steals[IB.ri(0,steals.length-1)];IB.G.inv[k]--;
                const nm=(IB.FOODS[k]||{}).n||'їжу';
                IB.floatMsg(victim.x,victim.y,'ЧАЙКА ВТЯГ ЇЖУ!');
                IB.toast('Чайка втяг '+nm+'! Ганяй зграю (бігай поруч), поки не влетіли!','red');
              }
              else IB.floatMsg(victim.x,victim.y,'КРЯ-Я!');
              IB.SFX.gull();
            }
          }else{bird.ph+=dt*7;bird.z=26+IB.M.sin(bird.ph*0.6)*6;}
        }
        if(b.t>5){b.state='leave';b.t=0;}
      }
      else if(b.state==='leave'){
        b.x+=dt*5;b.y-=dt*2;
        for(const bird of b.birds){bird.ph+=dt*8;bird.z=30+IB.M.sin(bird.ph*0.6)*6;}
        if(b.t>7||b.x>IB.W.W-2)IB.E.beasts.splice(i,1);
      }
    }
    else if(b.type==='bats'){
      const anchor=b.anchor||L;
      b.x=anchor.x;b.y=anchor.y;
      const off=torch&&nf>0.45;
      for(const bt2 of b.bats){
        bt2.a+=dt*bt2.sp;
        if(off)bt2.z+=(20-bt2.z)*dt*2;
        else bt2.z+=dt*34;
      }
      b.sq-=dt;
      if(b.sq<=0){
        b.sq=IB.rnd(2,5);IB.SFX.bat();
        if(off){anchor.mood=IB.clamp(anchor.mood-2,0,100);}
        IB.floatMsg(anchor.x+IB.rnd(-1,1),anchor.y,'🦇');
      }
      if(!off){
        b.scT=(b.scT||0)+dt;
        if(b.scT>2.2){IB.E.beasts.splice(i,1);IB.toast('Метелики розлетілись — фонарики вимкнено','');}
      }
      else if(nf<0.35)IB.E.beasts.splice(i,1);
    }
  }
};

/* v1.5: ФОНАРИКИ — перемикач (кнопка ФОНАР / клавіша F) */
IB.toggleTorch=()=>{
  IB.G.torch=!(IB.G.torch!==false);
  IB.toast(IB.G.torch?'🔦 ФОНАРИКИ УВІМКНЕНО — світять уночі (метелики злітаються!)':'🔦 ФОНАРИКИ ВИМКНЕНО — темно, метелики розлетілись','gold');
  IB.SFX.ui();
  IB.saveGame();
};

/* ==================== v3.0 «ПАНЕЛІ І ЧАЙКИ» ==================== */

/* ---------- ЗДОРОВЕННЯ ПЕРЕХОЖИХ (бульбашки при проході) ---------- */
IB.GREETINGS=['Привіт!','Морського вітерця!','Легендарні прийшли!','Сонячного дня!',
  'Курортний день сьогодні!','Чао, земляки!','Доброго ранку!','Слава морю!',
  'Пива хочеш?','Загоряй, поки сонце є!','Порт працює, все гуде!','Чайок бачив?',
  'На пляж — через сходи!','Шаурма сьогодні — вогонь!'];

/* ---------- КОРМІННЯ ЧАЙОК (годівниці на набережній і пляжі) ---------- */
IB.feedGulls=()=>{
  const L=IB.E.team[0];
  if(!(IB.G.inv.bread>0)){
    IB.toast('Хліба немає — купи в крамниці/на ринку, чайки чекають','red');
    IB.SFX.alert();return false;
  }
  IB.G.inv.bread--;
  IB.G.stats.gullFeed=(IB.G.stats.gullFeed||0)+1;
  let n=0;
  for(const a of IB.E.animals){
    if(a.type!=='gull')continue;
    if(IB.dist(a.x,a.y,L.x,L.y)<20){a.feedT=22;n++;}
  }
  if(!n){ /* якщо поруч нікого — злітаються 6 найближчих */
    IB.E.animals.filter(a=>a.type==='gull').slice(0,6).forEach(a=>{a.feedT=22;n++;});
  }
  for(const h of IB.E.team)h.mood=IB.clamp(h.mood+8,0,100);
  IB.SFX.gull();
  IB.floatMsg(L.x,L.y,'🍞');
  IB.toast('ЧАЙКИ ЗЛІТАЮТЬСЯ НА ХЛІБ! ('+n+' шт) • нагодовано: '+IB.G.stats.gullFeed,'gold');
  IB.journalAdd('🐦','Погодували чайок біля годівниці — сім\'я мурчить небом.');
  IB.questCheck();
  IB.saveGame();
  return true;
};

/* ---------- БАНДИ: «ПОРТОВІ» і «БРОНКОВІ» — бійки (X) ---------- */
IB.E.gangs=[];
const GANG_DEFS=[
  {id:'port',name:'ПОРТОВІ',turf:{x0:332,y0:356,x1:436,y1:430},
   members:[{n:'Гопник Толя',x:352,y:380},{n:'Кабан',x:360,y:384},{n:'Сіний',x:368,y:378},{n:'Шрам',x:376,y:384}],
   look:{skin:'#d89868',hair:'#1a120a',hat:'cap',hatc:'#2e3238',jacket:'#2a2e38',pants:'#2a2e38'}},
  {id:'bronx',name:'БРОНКОВІ',turf:{x0:246,y0:370,x1:284,y1:398},
   members:[{n:'Могол',x:254,y:382},{n:'Кльовий',x:260,y:380},{n:'Дід',x:266,y:383},{n:'Шкет',x:258,y:384}],
   look:{skin:'#e0a878',hair:'#241a10',hat:'band',hatc:'#b82840',jacket:'#3e2a48',pants:'#28303e'}},
];
IB.spawnGangs=()=>{
  IB.E.gangs=[];
  for(const g of GANG_DEFS){
    for(const m of g.members){
      const rc=IB.snapToReach?IB.snapToReach(m.x,m.y):{x:m.x,y:m.y};
      IB.E.gangs.push({gang:g.id,gangName:g.name,name:m.n,x:rc.x,y:rc.y,hx:rc.x,hy:rc.y,
        dir:'d',fr:0,frT:0,look:Object.assign({},g.look),
        hp:26,maxhp:26,state:'idle',atkT:0,downT:0,wt:IB.rnd(0,2),tx:rc.x,ty:rc.y,lootPaid:false});
    }
  }
  /* v6.0: ЛІДЕРИ БАНД — можна говорити (E) і вступати до банди */
  const LEADERS=[
    {id:'port', name:'Капітан Гопчик',x:376,y:398,hat:'cap',hatc:'#2e3238',jacket:'#2a2e38'},
    {id:'bronx',name:'Мурзик',        x:262,y:388,hat:'band',hatc:'#b82840',jacket:'#3e2a48'},
  ];
  for(const l of LEADERS){
    const rc=IB.snapToReach?IB.snapToReach(l.x,l.y):{x:l.x,y:l.y};
    IB.E.npcs.push({x:rc.x,y:rc.y,dir:'d',fr:0,frT:0,
      look:{skin:'#e0a878',hair:'#1a120a',hat:l.hat,hatc:l.hatc,jacket:l.jacket,pants:'#2a2e38'},
      name:l.name,role:'walk',quest:null,prof:null,gangLeader:l.id,
      hx:rc.x,hy:rc.y,wt:1,tx:rc.x,ty:rc.y,talked:0});
  }
  /* ВВ13 — своя банда: якщо заснована, бійці стоять на базі */
  IB.spawnVV13();
};
/* v6.0: СВОЯ БАНДА «ВВ13» */
IB.spawnVV13=()=>{
  IB.G.vv13=IB.G.vv13||{founded:false,members:0};
  if(!IB.G.vv13.founded)return;
  const BASE={x:273,y:378};
  const N=4+IB.M.min(4,IB.G.vv13.members|0);
  for(let i=0;i<N;i++){
    const rc=IB.snapToReach?IB.snapToReach(BASE.x+(i%3)*2,BASE.y+((i/3)|0)*2):BASE;
    IB.E.gangs.push({gang:'vv13',gangName:'ВВ13',name:'ВВ13 '+['Кент','Малий','Скіф','Кабанчик','Дядько','Рома','Феня','Гріша'][i%8],
      x:rc.x,y:rc.y,hx:rc.x,hy:rc.y,dir:'d',fr:0,frT:0,
      look:{skin:'#e0a878',hair:'#241a10',hat:'band',hatc:'#111114',jacket:'#16161a',pants:'#22222a'},
      hp:26,maxhp:26,state:'idle',atkT:0,downT:0,wt:IB.rnd(0,2),tx:rc.x,ty:rc.y,lootPaid:true});
  }
};
IB.gangOf=(h)=>h?(h.gang||null):null;
IB.gangJoin=(hid,gid)=>{
  const h=IB.E.team.find(x=>x.id===hid);if(!h)return false;
  IB.G.rep=IB.G.rep||{city:0,street:0,girls:0,work:0,cops:0,log:[]};
  IB.G.vv13=IB.G.vv13||{founded:false,members:0};
  if(gid!=='port'&&gid!=='bronx'&&gid!=='vv13')return false;
  if(gid!=='vv13'&&IB.G.rep[gid]<20){IB.toast('«'+(gid==='port'?'ПОРТОВІ':'БРОНКОВІ')+'»: ти ще не на нашому авторитеті (репутація '+IB.G.rep[gid]+'/20)','red');return false;}
  if(gid==='vv13'&&!IB.G.vv13.founded){IB.toast('ВВ13 ще не заснована — поговори з обома лідерами','red');return false;}
  const old=h.gang;
  h.gang=gid;
  IB.heroRep(h,4,'вступив у банду');
  IB.addRep(gid==='vv13'?'street':gid,6,h.name+' приєднався');
  if(old&&old!==gid)IB.addRep(old,-4,h.name+' пішов до інших');
  IB.sms(gid==='vv13'?'team':gid,'БАНДА',h.name+' тепер у «'+(gid==='vv13'?'ВВ13':(gid==='port'?'ПОРТОВІ':'БРОНКОВІ'))+'»! Родовід у нашому районі!');
  IB.toast('⚔ '+h.name+' тепер у «'+(gid==='vv13'?'ВВ13':(gid==='port'?'ПОРТОВІ':'БРОНКОВІ'))+'»','gold');
  IB.journalAdd('⚔',h.name+' вступив у банду «'+gid.toUpperCase()+'».');
  return true;
};
IB.gangLeave=(hid)=>{
  const h=IB.E.team.find(x=>x.id===hid);if(!h||!h.gang)return false;
  const old=h.gang;h.gang=null;
  IB.addRep(old,-6,h.name+' вийшов з банди (не по-нашому)');
  IB.heroRep(h,-2,'вийшов з банди');
  IB.toast('⚔ '+h.name+' вийшов з «'+old.toUpperCase()+'». Авторитет підсів','red');
  return true;
};
IB.vv13Found=()=>{
  IB.G.vv13=IB.G.vv13||{founded:false,members:0};
  if(IB.G.vv13.founded)return false;
  const L=IB.E.team[0];
  const both=IB.G.rep.port>=20&&IB.G.rep.bronx>=20;
  const beat=(IB.G.stats.fightWin||0)>=6;
  if(!both&&!beat){IB.toast('Заснувати ВВ13: потрібна повага 20+ у ОБОХ банд АБО 6 виграних биток','red');return false;}
  IB.G.vv13.founded=true;
  IB.spawnVV13();
  IB.addRep('street',10,'заснували свою банду ВВ13');
  IB.heroRep(L,8,'атаман ВВ13');
  IB.banner('⚔ БАНДА «ВВ13» ЗАСНОВАНА! База — БРОНКС');
  IB.sms('team','ВВ13','Тепер МИ — банда! База в Бронксі. Хто в ВВ13 — свої не бʼють.');
  IB.radioLog&&IB.radioLog('103.2 FM: у Бронксі зʼявилась нова банда «ВВ13» — місто обговорює...');
  IB.journalAdd('⚔','Засновано свою банду «ВВ13». База — Бронкс.');
  return true;
};
/* удар лідаером (X): по найближчому бандиту */
IB.punchNearest=()=>{
  const L=IB.E.team[0];
  if(!L||IB.G.mode!=='game')return false;
  let best=null,bd=1.9;
  for(const g of IB.E.gangs){
    if(g.state==='down')continue;
    const d=IB.dist(L.x,L.y,g.x,g.y);
    if(d<bd){bd=d;best=g;}
  }
  L.attackT=0.28;
  IB.SFX.punch();
  if(!best)return false;
  const dmg=9+IB.ri(0,4);
  best.hp-=dmg;
  best.state='hurt';best.hurtT=0.25;
  IB.floatMsg(best.x,best.y,'👊 -'+dmg);
  IB.GFX.shake=IB.M.max(IB.GFX.shake||0,0.3);
  if(best.hp<=0){
    best.state='down';best.downT=26;best.hp=0;
    const loot=20+IB.ri(0,25);
    IB.G.money+=loot;IB.tx&&IB.tx('вулиця',loot,'виграна битка');IB.G.stats.fightWin=(IB.G.stats.fightWin||0)+1;
    IB.SFX.done();
    IB.banner('БИТКУ ВИГРАНО: '+best.name+' НА ПІСКУ (всередині — на асфальті)');
    IB.toast('«'+best.name+'» здався! Гаманець: +₴'+loot+' • перемог: '+IB.G.stats.fightWin,'gold');
    IB.journalAdd('👊','Битка з «'+best.gangName+'»: '+best.name+' піднявся з цифрою. ₴'+loot+' у кишені.');
    /* v6.0: битки качають СИЛУ і вулицю */
    IB.skillXP(L,'str',6);
    IB.heroRep(L,2,'виграна битка');
    IB.addRep('street',1,'перемога у битці');
    if(best.gang==='port')IB.addRep('port',2,'бій на їхній території');
    if(best.gang==='bronx')IB.addRep('bronx',2,'бій на їхній території');
    IB.questCheck();
  }else{
    IB.floatMsg(L.x,L.y-0.5,'ХА!');
  }
  return true;
};
IB.updateGangs=(dt)=>{
  const L=IB.E.team[0];
  if(!L)return;
  for(const g of IB.E.gangs){
    /* лежить після програшу — піднімається зранку */
    if(g.state==='down'){
      g.downT-=dt;
      if(g.downT<=0){g.hp=g.maxhp;g.state='idle';g.lootPaid=false;g.x=g.hx;g.y=g.hy;}
      continue;
    }
    if(g.hurtT>0){g.hurtT-=dt;if(g.hurtT<=0)g.state='aggro';continue;}
    const turf=g.gang==='port'?GANG_DEFS[0]:GANG_DEFS[1];
    const inTurf=L.x>=turf.turf.x0&&L.x<=turf.turf.x1&&L.y>=turf.turf.y0&&L.y<=turf.turf.y1;
    const d=IB.dist(g.x,g.y,L.x,L.y);
    if(g.state==='idle'){
      g.wt-=dt;
      if(g.tx!==g.x||g.ty!==g.y){moveEnt(g,dt,0.9);if(g.x===g.tx&&g.y===g.ty)g.wt=IB.rnd(2,6);}
      else if(g.wt<=0){if(!pickWander(g,3))g.wt=2;}
      else idleAnim(g,dt);
      /* агресія: герой у їх кварталі і близько (v6.0: СВОЇ НЕ БʼЮТЬ) */
      const myGang=L.gang||null;
      const friendly=(myGang===g.gang)||((myGang==='vv13')&&(g.gang==='vv13'))||(g.gang==='vv13'&&myGang==='vv13');
      if(friendly){
        if(IB.M.random()<0.008)IB.floatMsg(g.x,g.y,'Свої!');
        continue;
      }
      const rivalBoost=(myGang&&myGang!==g.gang&&g.gang!=='vv13')?2:1;  /* суперники реагують швидше */
      if(inTurf&&d<6*rivalBoost&&L.hp>22){
        g.state='aggro';
        IB.toast('«'+g.gangName+'» відреагували: '+g.name+' іде на тебе! (X — битка)','red');
        IB.SFX.alert();
      }
      continue;
    }
    /* AGGRO: наздоганяє і б\'є; відступає, якщо ти показуєш силу */
    if(L.hp<=20||!inTurf&&d>10){
      if(g.state==='aggro'&&IB.M.random()<0.02){
        g.state='idle';g.tx=g.hx;g.ty=g.hy;
        IB.toast('«'+g.gangName+'» відступили — ти показав характер','gold');
      }
    }
    if(d>1.15){
      g.tx=L.x;g.ty=L.y;moveEnt(g,dt,1.9);
    }else{
      g.atkT-=dt;
      idleAnim(g,dt);
      if(g.atkT<=0){
        g.atkT=1.6;
        L.hp=IB.clamp(L.hp-5,0,100);
        IB.floatMsg(L.x,L.y,'💥 -5');
        IB.SFX.punch();
        IB.GFX.shake=IB.M.max(IB.GFX.shake||0,0.4);
        IB.toast(g.name+' («'+g.gangName+'») ПРОПИСАВ! Сили −5 • відповісь X!','red');
        if(IB.M.random()<0.3){IB.floatMsg(g.x,g.y,'Містьо не для чайок!');}
      }
    }
  }
};
