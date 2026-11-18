/* ILEGEND 3 — MORE MORE — world.js v10.0 «ДОРОГИ ЯК КИЇВ»
   КАРТА РОЗМІРУ КИЄВА (440×560 — як ІБОНАРІУМ: KYIV 440×520) — ЧОРНОМОРСЬК
   v10.0: ДОРОГИ ЯК У ПЕРШОЇ ЧАСТИНИ (legend_v5): вулиці 3 СМУГИ,
   просп. Миру — 5 СМУГ з роздільною, ВУЛИЦІ-ЛІНІЇ — 3 СМУГИ, квартали
   ЦІЛІШІ (правильні смуги між вулицями), ЖОДНОЇ ЗАБУДОВИ НА АСФАЛЬТІ,
   ТРОТУАРНІ КОРИДОРИ вільні від перешкод (не застрягнеш у дворах),
   щільна суцільна забудова БЕЗ ПУСТИХ МІСЦЬ, ДВОРИ з майданчиками,
   РЕАЛЬНІ РАЙОНИ: Північний масив • Ювілейний • Центр/просп. Миру •
   Південний масив • Суднобудівників • Приморський • Бронкс • Порт •
   Сухий лиман • СЗ «Паллада» • села громади: Крижанівка, Молодіжне,
   Совіньйон, Чорноморка (Люстдорф), Лиманка, Грибівка, Барабой.
   ТЕЛЕФОННА ЕПОХА: зупинки маршрутки №7, контейнери квартир з адресами. */
(function(){
const W=440,H=560;
IB.W={W,H,elev:null,terr:null,grid:new Map(),props:[],buildings:[],camps:[],pois:[],riverside:[],built:0};
const WA=IB.W;

function noise2(x,y,s){return IB.hsh(IB.M.floor(x),IB.M.floor(y),s);}

/* ---------- ПЛАН МІСТА ---------- */
/* v10.0 «ДОРОГИ ЯК КИЇВ»: вулиці РІДШІ І ШИРШІ — крок 14 (як квартал Києва),
   кожна вулиця = 3 СМУГИ (2 для руху + роздільна), просп. Миру = 5 СМУГ.
   Квартали цілі (11 рядів між вулицями) — щільна забудова без пустот. */
const H_STREETS=[30,44,58,72,86,100,114,132,146,160,174,188,202,216,230,244,258,272,286,300,314,328,342,356,370,384,398,412];
const V_STREETS=[8,24,40,56,72,88,104,120,136,152,168,184,200,216,232,248,264,280,296,312,328,344,360,376,392,408,424];
/* назви вулиць (для зупинок, таксі і смс) — як у реальному приморському місті */
const H_NAMES=['вул. Кобзарська','вул. Шкільна','вул. Поштова','вул. Молодіжна','вул. Сонячна','вул. Яблунева','вул. Одеська',
  'вул. Садова','вул. Вишнева','вул. Морська','вул. Каштанова','вул. 1 Травня','вул. Рибальська','вул. Будівельників',
  'вул. Заводська','вул. Лиманна','вул. Південна','вул. Весняна','вул. Паркова','вул. Курортна','вул. Якорна',
  'вул. Приморська','вул. Пляжна','вул. Генуезька','вул. Хвильова','вул. Флотська','вул. Причальна','вул. Пересипська'];
const V_NAMES=['1-ша Лінія','2-га Лінія','3-тя Лінія','4-та Лінія','5-та Лінія','6-та Лінія','7-ма Лінія','8-ма Лінія',
  '9-та Лінія','10-та Лінія','11-та Лінія','12-та Лінія','13-та Лінія','14-та Лінія','15-та Лінія','16-та Лінія',
  '17-та Лінія','18-та Лінія','19-та Лінія','20-та Лінія','21-ша Лінія','22-га Лінія','23-тя Лінія','24-та Лінія',
  '25-та Лінія','26-та Лінія','27-ма Лінія','28-ма Лінія','29-та Лінія'];
const PROSP_Y=118;               /* ПРОСПЕКТ МИРУ — широкий бульвар (4 смуги) */
/* ОДЕСЬКИЙ НАПРЯМ: тракта (y12,13), поля й дачі, СЕЛА ГРОМАДИ (0..29) */
const TRASA_Y=12;
/* смуги міста (південь — море) */
const PROM_Y0=430,PROM_Y1=439;        /* набережна (плитка) — 10 рядів */
const BEACH_Y0=440,BEACH_Y1=471;      /* ПЛЯЖ — 32 ряди піску (ВЕЛИКИЙ) */
const SHALLOW_Y0=472,SHALLOW_Y1=479;  /* мілководдя */
const DEEP_Y0=480;                    /* глибоке море — до H */
const CITY_Y0=30,CITY_Y1=427;         /* міська тканина */
/* райони (кордони по поясах) */
const D_NORTH={y0:30,y1:117,name:'ПІВНІЧНИЙ МАСИВ'};
const D_CENTER={y0:118,y1:213,name:'ЦЕНТР — ПРОСПЕКТ МИРУ'};
const D_SOUTH={y0:214,y1:329,name:'ПІВДЕННИЙ МАСИВ'};
const D_PRIM={y0:330,y1:429,name:'ПРИМОРСЬКИЙ РАЙОН'};
/* ключові зони */
const PARK={x:60,y:356,w:72,h:28,name:'ПРИМОРСЬКИЙ ПАРК'};
const YOUNG={x:36,y:88,w:36,h:14,name:'МОЛОДІЖНИЙ ПАРК'};
const LUNA={x:120,y:156,w:32,h:22,name:'ЛУНА-ПАРК «ПРОСПЕКТ МИРУ»'};
const ANCHP={x:200,y:156,w:26,h:16,name:'ПАРК ЯКОРІВ'};
const PLAZA={x:196,y:396,w:36,h:18,name:'ПЛОЩА ПРИМОРСЬКИХ СХОДІВ'};
const STAIRS={x:208,y:414,w:4,h:16,name:'ПРИМОРСЬКІ СХОДИ (155 СХОДИНКІВ)'};
const LIMAN={x:348,y:232,w:88,h:58,name:'СУХИЙ ЛИМАН'};
const BRIDGE={x:340,y:292,w:96,h:3,name:'МІСТ ЧЕРЕЗ СУХИЙ ЛИМАН'};
const ZAVOD={x:352,y:296,w:84,h:36,name:'СУДНОБУДІВНИЙ ЗАВОД «ПАЛЛАДА»'};
const PORT={x:332,y:356,w:104,h:74,name:'ЧОРНОМОРСЬКИЙ ПОРТ'};
const YACHT={x:8,y:396,w:32,h:32,name:'ЯХТ-КЛУБ «ВІТЕР»'};
const BRONX={x:248,y:372,w:34,h:24,name:'БРОНКС — КВАРТАЛ БІЛЯ ПЛЯЖУ'};
const PIER={x:176,y:430,w:8,h:62,name:'ПІРС «ЗАХІД СОНЦЯ»'};
/* села громади (одеський напрям + узбережжя) */
const VILLAGE_KRIZH={x:32,y:16,w:56,h:13,name:'КРИЖАНІВКА'};
const VILLAGE_MOL={x:140,y:16,w:56,h:13,name:'МОЛОДІЖНЕ'};
const VILLAGE_SOVIN={x:240,y:16,w:56,h:13,name:'СОВІНЬЙОН'};
const VILLAGE_CHM={x:336,y:16,w:88,h:13,name:'ЧОРНОМОРКА (ЛЮСТДОРФ)'};
const VILLAGE_LIM={x:8,y:206,w:32,h:26,name:'ЛИМАНКА'};
const VILLAGE_GRYB={x:8,y:336,w:32,h:28,name:'ГРИБІВКА'};
const VILLAGE_BARAB={x:288,y:398,w:42,h:30,name:'БАРАБОЙ — КЕМПІНГ'};
const VILLAGES=[VILLAGE_KRIZH,VILLAGE_MOL,VILLAGE_SOVIN,VILLAGE_CHM,VILLAGE_LIM,VILLAGE_GRYB,VILLAGE_BARAB];

/* ---------- ЛАНДМАРКИ: будівлі з дверима ---------- */
/* [x,y,w,h,type,label,img] — footprint, двері на південній стіні */
const CITY_BUILDINGS=[
  /* ===== ОДЕСЬКИЙ НАПРЯМ ===== */
  {x:203,y:22,w:13,h:6,type:'busstation',label:'АВТОСТАНЦІЯ «ЧОРНОМОРСЬК»',img:'hist3'},
  {x:176,y:20,w:8,h:4,type:'shop',label:'КАФЕ-МАГАЗИН «ПОПУТНИК» НА ТРАСІ',img:'bld_shop1_0'},
  {x:130,y:24,w:4,h:3,type:'hotdog',label:'ШАВУХА «ДАЛЬНОБОЙНИК»',img:'shop2'},
  /* ===== ПІВНІЧНИЙ МАСИВ ===== */
  {x:59,y:33,w:12,h:6,type:'vokzal',label:'ВОКЗАЛ «ЧОРНОМОРСЬК»',img:'hist3'},
  {x:76,y:47,w:11,h:6,type:'school',label:'ШКОЛА №3',img:'hist2'},
  {x:284,y:47,w:10,h:6,type:'poly',label:'ПОЛІКЛІНІКА №1',img:'hist3'},
  {x:92,y:61,w:10,h:5,type:'market',label:'РИНОК «ПІВНІЧНИЙ»',img:'bld_shop1_0'},
  {x:192,y:47,w:8,h:5,type:'post',label:'УКРПОШТА 68000',img:'bld_bhouse2_0'},
  {x:43,y:61,w:8,h:5,type:'shop',label:'ПРОДУКТИ 24 «ПІВНІЧ»',img:'bld_shop1_0'},
  {x:107,y:33,w:8,h:5,type:'cafe',label:'КАВ\'ЯРНЯ «РАНОК»',img:'bld_bhouse1_0'},
  {x:11,y:61,w:8,h:5,type:'shop',label:'ХЛІБ «ПАЛЛАДА»',img:'bld_shop1_0'},
  {x:155,y:47,w:8,h:4,type:'panel5',label:'ЖИТЛОВИЙ БУДИНОК «ПІВНІЧНИЙ»'},
  {x:171,y:47,w:8,h:4,type:'panel5',label:'ЖИТЛОВИЙ БУДИНОК «ПІВНІЧНИЙ-2»'},
  /* ===== ЦЕНТР ===== */
  {x:171,y:123,w:12,h:7,type:'cityhall',label:'МІСЬКА РАДА',img:'admin3'},
  {x:235,y:150,w:11,h:6,type:'cine',label:'КІНОТЕАТР «МОРЕ-ФІЛЬМ»',img:'hist2b'},
  {x:251,y:150,w:9,h:6,type:'gallery',label:'МУЗЕЙ ім. ОЛЕКСАНДРА БІЛОГО',img:'hist2'},
  {x:267,y:150,w:7,h:5,type:'second',label:'СЕКОНДХЕНД «АЛЬБАТРОС»',img:'bld_shop1_0'},
  {x:219,y:149,w:8,h:5,type:'cafe',label:'КАФЕ «ХВИЛЯ»',img:'bld_bhouse2_0'},
  {x:299,y:150,w:8,h:5,type:'pokerbar',label:'БАР «ПІРАТ» — ПОКЕР У ЗАДНІЙ КІМНАТІ',img:'bld_bhouse1_0'},
  {x:91,y:150,w:8,h:6,type:'realtor',label:'РІЕЛТОР «БІЛЯ МОРЕ»',img:'admin3'},
  {x:123,y:152,w:8,h:5,type:'shop',label:'ПРОДУКТИ 24',img:'bld_shop1_0'},
  {x:107,y:150,w:4,h:4,type:'voda',label:'ВОДА-КОМПЛЕКТ',img:'shop2'},
  {x:64,y:150,w:8,h:5,type:'cafe',label:'КАФЕ «АБРИКОС»',img:'bld_bhouse1_0'},
  {x:316,y:150,w:9,h:5,type:'market',label:'РИНОК «ЦЕНТРАЛЬНИЙ»',img:'bld_shop1_0'},
  {x:59,y:177,w:8,h:5,type:'shop',label:'МАГАЗИН «ДЖЕТ»',img:'bld_shop1_0'},
  {x:140,y:177,w:8,h:5,type:'cafe',label:'КАФЕ «ЛАГУНА»',img:'bld_bhouse1_0'},
  /* ===== ПІВДЕННИЙ МАСИВ ===== */
  {x:59,y:233,w:8,h:5,type:'hostel',label:'ХОСТЕЛ «ХВИЛЬКА»',img:'bld_bhouse2_1'},
  {x:76,y:234,w:7,h:5,type:'gym',label:'КАЧАЛКА «АТЛЕТ»',img:'bld_garage_0'},
  {x:123,y:238,w:9,h:5,type:'market',label:'РИНОК «ПІВДЕННИЙ»',img:'bld_shop1_0'},
  {x:299,y:233,w:8,h:5,type:'shop',label:'ПРОДУКТИ «СУДНОБУД»',img:'bld_shop1_0'},
  {x:315,y:244,w:6,h:4,type:'cafe',label:'КАФЕ «ПОРТОВЕ»',img:'bld_bhouse2_1'},
  {x:155,y:244,w:7,h:5,type:'shop',label:'ПРОДУКТИ «ПАЛЛАДА»',img:'bld_shop1_0'},
  {x:172,y:261,w:8,h:5,type:'bar',label:'ПИВНИЦЯ «БРОНКС-БАР»',img:'bld_bhouse2_0'},
  {x:11,y:246,w:6,h:4,type:'shop',label:'МАГАЗИН «ЛИМАНКА»',img:'bld_shop1_0'},
  /* ===== ПРИМОРСЬКИЙ ===== */
  {x:75,y:388,w:10,h:6,type:'hotel',label:'ГОТЕЛЬ «ЧОРНОМОРЕЦЬ»',img:'hist3'},
  {x:284,y:359,w:9,h:6,type:'hotel',label:'ГОТЕЛЬ «АБРИКОС»',img:'hist2c'},
  {x:64,y:392,w:8,h:5,type:'idalnya',label:'ЇДАЛЬНЯ «ХВИЛЯ»',img:'vill1'},
  {x:91,y:394,w:4,h:3,type:'hotdog',label:'ХОТ-ДОГ «ПОПУТНИК»',img:'shop2'},
  {x:140,y:394,w:4,h:3,type:'hotdog',label:'ХОТ-ДОГ «АЛЛІГАТОР»',img:'shop2'},
  {x:160,y:394,w:4,h:3,type:'voda',label:'ПЛЯЖНИЙ КІОСК',img:'shop2'},
  {x:11,y:336,w:8,h:5,type:'shop',label:'КАФЕ «ГРИБІВКА»',img:'bld_bhouse1_0'},
  {x:288,y:402,w:6,h:4,type:'cafe',label:'КАФЕ «БАРАБОЙ»',img:'bld_bhouse2_0'},
  /* БРОНКС — велика хата з двором */
  {x:251,y:376,w:12,h:6,type:'bronx',label:'БРОНКС — ХАТА З ДВОРОМ',img:'cottage_b'},
  /* ===== v5.0: КЛУБ «МАЯК» ===== */
  {x:331,y:374,w:13,h:7,type:'club',label:'КЛУБ «МАЯК» — ТУСИ І РЕЙВ',img:null},
  /* ===== ПОРТОВА ЗОНА — v14.0 «ЖИВИЙ ПОРТ»: БУДІВЛІ НЕ ГІРШЕ, НІЖ У МІСТІ =====
     (морвокзал пересунуто з y396 — там перетин вулиці y398-400 не давав йому стати!) */
  {x:347,y:388,w:11,h:6,type:'port',label:'МОРЕВАКЗАЛ — ПОРОМИ ВАРНА/СТАМБУЛ',img:'hist2b'},
  {x:347,y:360,w:12,h:6,type:'portadm',label:'АДМІНІСТРАЦІЯ ПОРТУ',img:'admin3'},
  {x:363,y:360,w:12,h:6,type:'warehouse',label:'СКЛАД №1 «ПАЛЛАДА-ТРАНЗИТ»',img:'bld_garage_0'},
  {x:379,y:360,w:12,h:6,type:'warehouse',label:'СКЛАД №2 «РЕФРИЖЕРАТОР»',img:'bld_garage_0'},
  {x:395,y:360,w:12,h:6,type:'fuelstore',label:'СКЛАД ПАЛЬНОГО «МАЗИТ»',img:'bld_bhouse2_1'},
  {x:347,y:374,w:9,h:5,type:'fishplant',label:'РИБНИЙ ЦЕХ «АЛЬБАТРОС»',img:'bld_bhouse2_0'},
  {x:363,y:374,w:8,h:5,type:'dockyard',label:'ДОК-МАЙСТЕРНЯ №7',img:'bld_garage_0'},
  {x:379,y:374,w:8,h:5,type:'medport',label:'МЕДЕПУНКТ ПОРТУ',img:'hist2'},
  {x:395,y:374,w:8,h:5,type:'warehouse',label:'СКЛАД №3 «КОНТЕЙНЕРНИЙ»',img:'bld_garage_0'},
  {x:395,y:388,w:11,h:6,type:'portcant',label:'ЇДАЛЬНЯ ПОРТОВИКІВ «ПРИЧАЛ»',img:'vill1'},
  {x:347,y:402,w:8,h:5,type:'gatehouse',label:'В\'ЇЗНА ВЕЖКА ПОРТУ — КПП',img:'shop2'},
  {x:363,y:402,w:9,h:5,type:'warehouse',label:'СКЛАД №4 «ТАРА»',img:'bld_garage_0'},
  {x:379,y:388,w:8,h:5,type:'museum',label:'МУЗЕЙ ПОРТУ І МОРЕ',img:'hist2'},
  {x:363,y:303,w:12,h:7,type:'zavod',label:'СУДНОБУДІВНИЙ ЗАВОД «ПАЛЛАДА»',img:'admin3'},
  /* ===== ЯХТ-КЛУБ ===== */
  {x:12,y:401,w:9,h:5,type:'yacht',label:'ЯХТ-КЛУБ «ВІТЕР»',img:'bld_dacha2_0'},
  /* ===== v5.0 НОВІ ВИЗНАЧНІ МІСЦЯ ===== */
  {x:364,y:136,w:9,h:6,type:'library',label:'МІСЬКА БІБЛІОТЕКА ім. ФРАНКА',img:'hist2'},
  /* v6.0: БАНК «ГРІВА» (центр) і БАЗА «ВВ13» (Бронкс) */
  {x:222,y:136,w:8,h:4,type:'shop',label:'БАНК «ГРІВА»',img:'hist2'},
  {x:270,y:374,w:6,h:3,type:'house',label:'БАЗА «ВВ13»',img:'bld_garage_0'},
  {x:203,y:303,w:8,h:5,type:'police',label:'ВІДДІЛ ПОЛІЦІЇ (ДЕТЕКТИВ ГАЛАГАН)',img:'admin3'},
  {x:11,y:126,w:8,h:5,type:'shop',label:'РИБОНИЙ МАГАЗИН «ЯКОРЬ»',img:'bld_shop1_0'},
  {x:384,y:388,w:5,h:4,type:'voda',label:'ПОРТОВИЙ КІОСК',img:'shop2'},
  /* v18: ПОРТ — ЩЕ ЩІЛЬНІШИЙ (новий ряд по y410 + капітанія справа) */
  {x:347,y:416,w:10,h:6,type:'cranehall',label:'КРАНОВИЙ ЦЕХ №2',img:'bld_garage_0'},
  {x:361,y:416,w:10,h:6,type:'terminal',label:'ВАНТАЖНИЙ ТЕРМІНАЛ «ПАЛЛАДА-ТРАНЗИТ»',img:'admin3'},
  {x:375,y:416,w:10,h:6,type:'warehouse',label:'ПАКГАУЗ №5 «БЕССАРАБІЯ»',img:'bld_garage_0'},
  {x:389,y:416,w:8,h:6,type:'portcant',label:'КОТЕЛЬНЯ ПОРТУ «МАЗИТ-2»',img:'bld_bhouse2_0'},
  {x:411,y:360,w:9,h:6,type:'portadm',label:'КАПІТАНІЯ ПОРТУ',img:'hist2'},
  {x:411,y:374,w:9,h:5,type:'fishplant',label:'ЦЕХ СІТОК І СНАСТІ',img:'bld_bhouse2_0'},
  /* v18: БУДІВЛІ ПЛЯЖУ — райони стають впізнаваними не тільки прапорами */
  {x:12,y:441,w:8,h:5,type:'beachbld',label:'РЯТУВАЛЬНА СТАНЦІЯ «МАЯК»',img:'bld_garage_0'},
  {x:64,y:441,w:8,h:5,type:'beachbld',label:'ПУНКТ ПРОКАТУ «ХВИЛЯ»',img:'bld_bhouse2_0'},
  {x:190,y:441,w:8,h:5,type:'beachbld',label:'ПЛЯЖНИЙ БАР «МІСІС НІ»',img:'vill1'},
  {x:252,y:441,w:8,h:5,type:'beachbld',label:'КАФЕ «ЗОЛОТА БУХТА»',img:'bld_bhouse2_1'},
  {x:316,y:441,w:6,h:5,type:'beachbld',label:'ПОСТ РЯТУВАЛЬНИКІВ «ПІРС»',img:'shop2'},
];
/* МАЯК на східному молу */
const EXTRA_BUILDINGS=[
  {x:422,y:486,w:6,h:5,type:'lighthouse',label:'ЧОРНОМОРСЬКИЙ МАЯК (1965)',img:null},
];

/* ---------- КВАРТИРИ v5.0 «МІСТО-ТЕЛЕФОН»: контейнери з адресами ----------
   Прив'язані до конкретних панельок; оренда НА МІСЯЦЬ або КУПІВЛЯ.
   Героїв розселяємо: 2 в одній, 3 в іншій — у кожної адреса. */
const APTS=[
  {bx:12,by:124,w:10,h:4,addr:'просп. Миру 30, кв. 5',rent:9000,price:320000,floors:2},
  {bx:204,by:124,w:10,h:4,addr:'просп. Миру 44, кв. 12',rent:8500,price:295000,floors:2},
  {bx:108,by:206,w:10,h:4,addr:'вул. Рибальська 7, кв. 21',rent:7000,price:230000,floors:2},
  {bx:220,by:206,w:10,h:4,addr:'вул. Рибальська 19, кв. 3',rent:7200,price:240000,floors:2},
  {bx:28,by:276,w:10,h:4,addr:'вул. Весняна 12, кв. 44',rent:6500,price:210000,floors:2},
  {bx:220,by:276,w:10,h:4,addr:'вул. Паркова 5, кв. 17',rent:6800,price:225000,floors:2},
  {bx:28,by:346,w:10,h:4,addr:'вул. Пляжна 3, кв. 8',rent:11000,price:410000,floors:2},
  {bx:332,by:124,w:10,h:4,addr:'вул. Садова 21, кв. 31',rent:8000,price:270000,floors:2},
  {bx:188,by:332,w:10,h:4,addr:'вул. Якорна 9, кв. 2',rent:9500,price:350000,floors:2},
  {bx:60,by:48,w:10,h:4,addr:'вул. Поштова 14, кв. 27',rent:7500,price:250000,floors:2},
];
/* v18.4: БАГАТОВЕРХІВКИ ПРИБРАНІ З КАРТИ ЗАВСАДИ (гравець: «ці будівлі
   прибрати зовсім з карти — перероби без цих будувель»).
   Ручні вежі 9-12 поверхів БІЛЬШЕ НЕ ГЕНЕРУЮТЬСЯ: масив ПОРОЖНІЙ, цикл
   у buildCity() нічого не ставить. Житло лишилось і стало НИЗЬКИМ:
   10 APTS-будинків (2 пов.) + «ПІВНІЧНИЙ»/«ПІВНІЧНИЙ-2» (2 пов.). */
const PANEL9=[];
/* ЗОНИ-ВИКЛЮЧЕННЯ: тут процедурна забудова не росте (парки, порти, пляж) */
const NOBUILD=[PARK,YOUNG,LUNA,ANCHP,PLAZA,STAIRS,LIMAN,BRIDGE,ZAVOD,PORT,YACHT,BRONX,PIER,
  VILLAGE_LIM,VILLAGE_GRYB,VILLAGE_BARAB,
  {x:0,y:PROM_Y0-2,w:W,h:H}];
const inNoBuild=(x,y)=>{for(const r of NOBUILD){if(x>=r.x-2&&x<r.x+r.w+2&&y>=r.y-2&&y<r.y+r.h+2)return true;}return false;};

/* точка BFS-старту і зони спавну */
const FLOW_SEED={x:220,y:434};   /* набережна в центрі — завжди проходима */
const SPAWNS=[
  {x:58,y:36,name:'ВОКЗАЛ'},
  {x:98,y:62,name:'РИНОК «ПІВНІЧНИЙ»'},
  {x:136,y:162,name:'ЛУНА-ПАРК, ЦЕНТР'},
  {x:210,y:242,name:'ПІВДЕННИЙ МАСИВ'},
  {x:112,y:390,name:'ПРИМОРСЬКИЙ'},
  {x:360,y:404,name:'ПОРТ'},
  {x:214,y:27,name:'АВТОСТАНЦІЯ'},
];

/* ---------- ГЕНЕРАЦІЯ РЕЛЬЄФУ І ТЕРЕНІВ ---------- */
function genElev(){
  const elev=new Float32Array(W*H);
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){
    let e=2.0;
    if(y>=SHALLOW_Y0&&y<=SHALLOW_Y1)e=0.1;
    else if(y>=DEEP_Y0)e=0.0;
    if(inRect(LIMAN,x,y))e=0.1;
    elev[y*W+x]=e;
  }
  return elev;
}
function isStreet(x,y){
  for(const sy of H_STREETS)if(y>=sy&&y<=sy+2)return true;      /* v10: 3 смуги */
  if(y>=PROSP_Y&&y<=PROSP_Y+4)return true;                      /* просп. Миру — 5 смуг */
  for(const sx of V_STREETS)if(x>=sx&&x<=sx+2)return true;      /* ЛІНІЇ — 3 смуги */
  if(y===TRASA_Y||y===TRASA_Y+1)return true;                    /* тракта на Одесу */
  return false;
}
/* v10: перешкода біля асфальту? (тротуарні коридори вздовж вулиць — вільні,
   щоб НЕ ЗАСТРЯГАТИ у дворах: вихід на вулицю завжди відкритий) */
function nearAsphalt(px,py,terr){
  for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){
    if(!dx&&!dy)continue;
    const ax=px+dx,ay=py+dy;
    if(ax<0||ay<0||ax>=W||ay>=H)continue;
    const t2=terr[ay*W+ax];
    if(t2===12||t2===19)return true;
  }
  return false;
}
/* v10: чи є перешкода впритул (не ставимо пропси «стінкою») */
function propAdjacent(px,py){
  for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){
    if(!dx&&!dy)continue;
    if(WA.grid.has((py+dy)*W+(px+dx)))return true;
  }
  return false;
}
function inRect(r,x,y){return x>=r.x&&x<r.x+r.w&&y>=r.y&&y<r.y+r.h;}
/* v10: розмітка пішохідних переходів — зебри через УСІ 3 смуги (і проспект —
   через всі 5); isCross — через Set (швидко на всій карті) */
const CROSS=[];
const CROSSSET=new Set();
(function(){
  for(const sy of H_STREETS){
    if(sy+2>=CITY_Y1)continue;
    for(let i=0;i<V_STREETS.length;i+=2){
      const sx=V_STREETS[i];
      if(sy>PROSP_Y-8&&sy<PROSP_Y+8)continue;
      for(let r=0;r<3;r++){
        CROSS.push({x:sx-1,y:sy+r},{x:sx+3,y:sy+r});
        CROSSSET.add((sy+r)*W+(sx-1));CROSSSET.add((sy+r)*W+(sx+3));
      }
    }
  }
  for(let i=0;i<V_STREETS.length;i+=3){
    const sx=V_STREETS[i];
    for(let r=0;r<5;r++){
      CROSS.push({x:sx-1,y:PROSP_Y+r},{x:sx+3,y:PROSP_Y+r});
      CROSSSET.add((PROSP_Y+r)*W+(sx-1));CROSSSET.add((PROSP_Y+r)*W+(sx+3));
    }
  }
})();
const isCross=(x,y)=>CROSSSET.has(y*W+x);

function assignTerr(terr){
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){
    const i=y*W+x;
    if(y>=SHALLOW_Y0)continue;                       /* море */
    if(inRect(LIMAN,x,y)){terr[i]=16;continue;}      /* лиман */
    if(y===TRASA_Y||y===TRASA_Y+1){terr[i]=12;continue;}
    if(y<CITY_Y0){terr[i]=2;continue;}               /* поля/дачі/села напрямку */
    if(y>=PROM_Y0&&y<=PROM_Y1){terr[i]=13;continue;} /* набережна */
    else if(y>=BEACH_Y0){terr[i]=1;continue;}        /* пляж */
    if(inRect(PORT,x,y)){terr[i]=12;continue;}       /* порт — бетон */
    if(inRect(ZAVOD,x,y)){terr[i]=12;continue;}
    if(inRect(YACHT,x,y)){terr[i]=2;continue;}
    if(inRect(BRONX,x,y)){terr[i]=2;continue;}
    if(inRect(PARK,x,y)||inRect(YOUNG,x,y)||inRect(ANCHP,x,y))
      {terr[i]=(IB.hsh(x,y,9)<0.14?3:2);continue;}   /* парки */
    if(inRect(PLAZA,x,y)){terr[i]=13;continue;}
    if(inRect(VILLAGE_LIM,x,y)||inRect(VILLAGE_GRYB,x,y)||inRect(VILLAGE_BARAB,x,y))
      {terr[i]=2;continue;}                          /* села — газони */
    if(isStreet(x,y)){terr[i]=isCross(x,y)?19:12;continue;}  /* асфальт/зебра */
    /* v10: ПОДВІЙНЕ ТРОТУАРНЕ КІЛЬЦЕ (стиль Києва): 1-й ряд біля вулиці —
       ГАРАНТОВАНІ плити (пішохідний коридор), 2-й ряд — плити з вірогідністю */
    let ring=9;
    for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++){
      const ax=x+dx,ay=y+dy;
      if(ax<0||ay<0||ax>=W||ay>=H)continue;
      if(isStreet(ax,ay)){const cd=IB.M.max(IB.M.abs(dx),IB.M.abs(dy));if(cd<ring)ring=cd;}
    }
    terr[i]=ring<=1?17:(ring===2&&IB.hsh(x,y,88)<0.62?17:2);   /* 17 = плити, 2 = газон */
  }
  /* алея від автостанції до міста */
  for(let y=14;y<CITY_Y0;y++){const i=y*W+214;if(terr[i]!==12)terr[i]=7;}
  for(let y=14;y<CITY_Y0;y++){const i=y*W+216;if(terr[i]!==12)terr[i]=7;}
}

/* ---------- ПРОЦЕДУРНЕ ЗАПОВНЕННЯ КВАРТАЛІВ (щільність 90% як у Києві) ---------- */
/* тип кварталу за шумом (v18.4 БЕЗ панельок/п'ятиповерхів): житлові ряди /
   котеджна сітка / квартал-цегла / мікс / комерція / зелений двір */
function blockType(bx,by){
  const h=IB.hsh(bx,by,77);
  if(h<0.34)return 'p9';
  if(h<0.58)return 'p5';
  if(h<0.74)return 'kvartal';
  if(h<0.84)return 'mix';
  if(h<0.96)return 'comm';
  return 'green';
}

/* v7.0: ЗАХИЩЕНІ ТОЧКИ — не забудовувати (артефакти a1-a14, дівчата, спавни,
   лідери банд + база ВВ13, фіксовані квест-точки детектива) */
const PROTECT_PTS=[
  [380,396],[181,480],[40,458],[424,490],[250,460],[212,164],
  [273,377],[214,406],[322,388],[252,155],[58,38],[368,136],
  [322,388],[52,432],[210,28],[110,452],[94,168],[88,150],[64,124],[128,66],[20,50],[101,432],
  [58,36],[98,62],[136,162],[210,242],[112,390],[360,404],[214,27],
  [376,398],[262,388],[273,378],[262,384],
  [33,64],[100,64],[120,435]
];
function addBld(terr,x,y,w,h,type,label,img,extra){
  /* v7.0: ЗАХИЩЕНІ ТОЧКИ (артефакти/дівчата/спавни/лідери банд/квест-точки) — не забудовуємо */
  for(const p of PROTECT_PTS){
    if(p[0]>=x-1&&p[0]<x+w+1&&p[1]>=y-1&&p[1]<y+h+1)return null;
  }
  /* v10: до 3 спроб зі зсувом вниз — щільність лишається, двері живі */
  for(let dyTry=0;dyTry<3;dyTry++){
    const yy0=y+dyTry,yy1=yy0+h;
    let bad=false;
    /* впритул: без перетинів футпринтів */
    for(const b of WA.buildings){
      if(x<b.x+b.w&&x+w>b.x&&yy0<b.y+b.h&&yy1>b.y){bad=true;break;}
    }
    if(bad)continue;
    /* жодної забудови на вулицях/піску/воді/площах — асфальт суцільний */
    for(let yy=yy0;yy<yy1&&!bad;yy++)for(let xx=x;xx<x+w;xx++){
      if(xx<1||yy<1||xx>=W-1||yy>=H-1){bad=true;break;}
      if(isStreet(xx,yy)){bad=true;break;}
      const t0=terr[yy*W+xx];
      if(t0!==2&&t0!==17&&t0!==7){bad=true;break;}
    }
    if(bad)continue;
    /* двері — на вільному тайлі південної сторони */
    const ddy=yy1;
    let spot=null;
    if(!isStreet(x+(w>>1),ddy)&&terr[ddy*W+(x+(w>>1))]!==10)spot={x:x+(w>>1),y:ddy};
    else for(const off of [-1,1,-2,2]){
      const ax=x+(w>>1)+off;
      if(ax<x||ax>=x+w)continue;
      if(!isStreet(ax,ddy)&&terr[ddy*W+ax]!==10){spot={x:ax,y:ddy};break;}
    }
    if(!spot)continue;
    /* не накривати двері вже поставлених будівель */
    for(const b of WA.buildings){
      if(b.door.x>=x&&b.door.x<x+w&&b.door.y>=yy0&&b.door.y<yy1){bad=true;break;}
    }
    if(bad)continue;
    for(let yy=yy0;yy<yy1;yy++)for(let xx=x;xx<x+w;xx++)terr[yy*W+xx]=10;
    const b={x,y:yy0,w,h,type,label:label||'',name:label||'БУДИНОК',img:img||null,
      door:spot};
    if(extra)Object.assign(b,extra);
    WA.buildings.push(b);
    WA.built=(WA.built||0)+1;
    return b;
  }
  return null;
}
function fillBlock(terr,bx0,by0,bx1,by1,kind,bx,by){
  const bw=bx1-bx0,bh=by1-by0;
  if(bw<5||bh<4)return;
  /* ДВОРИ у кожному кварталі — майданчики, лавки, дерева (Kyiv-style).
     v10: рідші і НІКОЛИ на тротуарному коридорі біля асфальту, без «стінок»
     з перешкод впритул — двір завжди має вихід на вулицю */
  const yard=(yy,xx,seed)=>{
    const pr=[[xx,yy,'swing'],[xx+3,yy,'slide'],[xx+6,yy,'sandbox'],[xx,yy+3,'bball'],
      [xx+4,yy+3,'bench'],[xx+2,yy+1,'tree2'],[xx+7,yy+2,'bench'],[xx+6,yy,'hbar']];
    let k=0;
    for(const p of pr){
      const hsh=IB.hsh(p[0],p[1],seed+k);
      if(hsh<0.45)continue;
      const px=p[0],py=p[1];
      if(px<bx0||px>=bx1||py<by0||py>=by1)continue;
      if(terr[py*W+px]!==2&&terr[py*W+px]!==17)continue;
      if(WA.grid.has(py*W+px))continue;
      if(nearAsphalt(px,py,terr))continue;
      if(propAdjacent(px,py))continue;
      WA.props.push({x:px,y:py,type:p[2],seed:IB.hsh(px,py,seed+k)});
      k++;
    }
  };
  /* v7.0: ГАРАЖНІ РЯДИ — смуга гаражів/кіосків уздовж краю (упритул) */
  const garageRow=(yy,xx0,xx1,seed)=>{
    let gx=xx0;
    while(gx+3<=xx1){
      const hsh=IB.hsh(gx,yy,seed);
      if(hsh<0.72){
        addBld(terr,gx,yy,3,2,hsh<0.55?'garage':'kiosk','',
          hsh<0.55?'bld_garage_0':'shop2');
      }
      gx+=3;
    }
  };
  /* v7.0: ЗАЛИВКА КИШЕНЬ — 3×3 хатки в усіх пустинах крім двору з пропсами */
  const voidFill=(yy0,yy1,seed,avoid)=>{
    for(let yy=yy0;yy<=yy1;yy++)for(let xx=bx0+1;xx+3<=bx1;xx++){
      if(IB.hsh(xx,yy,seed)>=0.52)continue;
      if(avoid&&xx>=avoid[0]&&xx<avoid[0]+avoid[2]&&yy>=avoid[1]&&yy<avoid[1]+avoid[3])continue;
      let free=true;
      for(let dy2=0;dy2<3&&free;dy2++)for(let dx2=0;dx2<3;dx2++){
        const t2=terr[(yy+dy2)*W+(xx+dx2)];
        if((t2!==2&&t2!==17)||WA.grid.has((yy+dy2)*W+(xx+dx2))){free=false;break;}
      }
      if(free){addBld(terr,xx,yy,3,3,'house','',IB.hsh(xx,yy,seed+7)<0.35?'cottage_b':null);continue;}
      /* 2-рядова кишеня → гараж/кіоск */
      let g2=true;
      for(let dx2=0;dx2<3;dx2++){
        const t2=terr[yy*W+(xx+dx2)],t3=terr[(yy+1)*W+(xx+dx2)];
        if((t2!==2&&t2!==17)||(t3!==2&&t3!==17)||WA.grid.has(yy*W+(xx+dx2))||WA.grid.has((yy+1)*W+(xx+dx2))){g2=false;break;}
      }
      if(g2&&yy+1<=yy1&&IB.hsh(xx,yy,seed+13)<0.55)
        addBld(terr,xx,yy,3,2,IB.hsh(xx,yy,seed+17)<0.5?'garage':'kiosk','',
          IB.hsh(xx,yy,seed+17)<0.5?'bld_garage_0':'shop2');
    }
  };
  /* v7.0: РЯД ЗІ СКИПОМ ДВЕРНИХ КОЛОНОК — малі будівлі впритул, двері сусідів вільні */
  const rowFill=(yy,h,doorCols,seed,wide)=>{
    let rx=bx0+1;
    while(rx<=bx1){
      let covers=false;
      for(const dc of doorCols){if(rx<=dc&&dc<=rx+2){covers=true;break;}}
      const avail=bx1-rx+1;
      if(!covers){
        if(avail>=3&&IB.hsh(rx,yy,seed)<0.85){
          addBld(terr,rx,yy,3,h,'house','',IB.hsh(rx,yy,seed+3)<0.35?'cottage_b':null);
          rx+=3;continue;
        }
        if(avail>=2&&IB.hsh(rx,yy,seed+5)<(wide?0.85:0.75)){
          addBld(terr,rx,yy,Math.min(2,avail),Math.min(2,h),
            IB.hsh(rx,yy,seed+9)<0.5?'garage':'kiosk','',
            IB.hsh(rx,yy,seed+9)<0.5?'bld_garage_0':'shop2');
        }
      }
      rx+=(covers?1:2);
    }
  };
  /* v7.0: ВЕРТИКАЛЬНА КОЛОНКА КІОСКІВ/ГАРАЖІВ на краї кварталу */
  const sideCol=(xx,yy0,yy1,seed)=>{
    let sy=yy0;
    while(sy+2<=yy1+1){
      if(IB.hsh(xx,sy,seed)<0.8)
        addBld(terr,xx,sy,Math.min(2,bx1-xx+1),2,
          IB.hsh(xx,sy,seed+3)<0.5?'garage':'kiosk','',
          IB.hsh(xx,sy,seed+3)<0.5?'bld_garage_0':'shop2');
      sy+=3;
    }
  };
  /* v7.0: ТОНКА СМУГА — фасад хат (3-wide) + малий ряд у дверних зазорах */
  if(bh<=6){
    const doorCols=[];
    let rx0=bx0+1;
    while(rx0+4<=bx1+1){
      addBld(terr,rx0,by0,4,3,'house','', IB.hsh(rx0,by0,15)<0.4?'cottage_b':null);
      doorCols.push(rx0+2);
      rx0+=4;
    }
    /* малий ряд: скіп дверних колонок фасаду */
    const y2=by0+3;
    if(y2+1<=by1){
      const h2=Math.min(3,by1-y2+1);
      rowFill(y2,h2,doorCols,(bx*11+by*23)|0,false);
    }
    yard(by0+1,bx0+1,(bx*7+by*29)|0);
    return;
  }
  if(kind==='p9'){
    /* v18.4: БЕЗ БАГАТОВЕРХІВОК (гравець: «прибрати зовсім — перероби без
       цих будувель») — житлові ряди дач з дворами + крамниця/кафе + гаражі */
    const ty=by0+1;
    let hx=bx0+1;
    while(hx+4<=bx1+1){
      addBld(terr,hx,ty,4,3,'house','',null); hx+=4;
    }
    if(bh>=10){
      let hx2=bx0+3;
      while(hx2+4<=bx1+1){
        addBld(terr,hx2,ty+4,4,3,'house','',null); hx2+=4;
      }
    }
    if(bh>=14){
      let hx3=bx0+1;
      while(hx3+4<=bx1+1){
        addBld(terr,hx3,ty+8,4,3,'house','',null); hx3+=4;
      }
    }
    if(bw>=9&&bh>=12)addBld(terr,bx0+2,by1-4,6,4,IB.hsh(bx,by,3)<0.5?'shop':'cafe','',
      IB.hsh(bx,by,4)<0.5?'bld_shop1_0':'bld_bhouse1_0');
    if(bw>=13)sideCol(bx1-1,ty+1,by1,(bx*53+by*9)|0);
    if(bw>=14&&bh>=12)garageRow(by1-2,bx0+1,bx1,(bx*13+by*3)|0);
    yard(ty+7,bx0+1,(bx*13+by*7)|0);
    voidFill(ty+1,by1-2,(bx*5+by*13)|0,[bx0+1,ty+7,9,5]);
  }else if(kind==='p5'){
    /* v18.4: БЕЗ ХРУЩОВОК — котеджна сітка крок 4×3 зі зсувом рядів,
       крамниця/кафе в кутку, кіоски/гаражі по краю, зелені двори */
    let ry=by0+1;
    let row=0;
    while(ry+3<=by1+1){
      const off=(row%2)?2:0;
      let rx=bx0+1+off;
      while(rx+4<=bx1+1){
        if(IB.hsh(rx,ry,5)<0.9)
          addBld(terr,rx,ry,4,3,'house','',null);
        rx+=4;
        if(bw>=12&&IB.hsh(rx,ry,25)<0.75)
          addBld(terr,rx,ry,3,2,IB.hsh(rx,ry,31)<0.5?'kiosk':'garage','',
            IB.hsh(rx,ry,31)<0.5?'shop2':'bld_garage_0');
      }
      ry+=3;row++;
    }
    if(bw>=13)sideCol(bx1-1,by0+2,by1-4,(bx*57+by*13)|0);
    if(bw>=9&&bh>=12)addBld(terr,bx0+2,by1-4,6,4,IB.hsh(bx,by,19)<0.5?'shop':'cafe','',
      IB.hsh(bx,by,20)<0.5?'bld_shop1_0':'bld_bhouse1_0');
    yard(by0+2,bx0+1,(bx*31+by*11)|0);
    voidFill(by0+1,by1-2,(bx*19+by*29)|0,[bx0+1,by0+2,9,5]);
    }else if(kind==='kvartal'){
    /* v10: КОТЕДЖНА СІТКА — крок 3 по горизонталі, крок 4 по вертикалі:
       між рядами хат — прохідні дворові смуги (двері кожної хати живі) */
    let ry=by0+1;
    while(ry+3<=by1+1){
      let rx=bx0+1;
      while(rx+3<=bx1+1){
        if(IB.hsh(rx,ry,15)<0.95)
          addBld(terr,rx,ry,3,3,'house','', IB.hsh(rx,ry,16)<0.4?'cottage_b':null);
        rx+=3;
      }
      ry+=4;
    }
    if(bw>=12)garageRow(by1-1,bx0+1,bx1,(bx*9+by*17)|0);
    if(bw>=12)sideCol(bx1-1,by0+1,by1-3,(bx*61+by*19)|0);
    yard(by0+1,bx0+1,(bx*7+by*29)|0);
    voidFill(by0+1,by1-1,(bx*23+by*7)|0,[bx0+1,by0+1,8,5]);
  }else if(kind==='mix'){
    /* v18.4: мікс без багатоповерхівки — дача + крамниця + 2 ряди котеджів */
    addBld(terr,bx0+1,by0+1,IB.M.min(6,bw-2),3,'house','',null);
    if(bw>=13)addBld(terr,bx0+8,by0+1,5,3,IB.hsh(bx,by,45)<0.5?'shop':'cafe','',
      IB.hsh(bx,by,46)<0.5?'bld_shop1_0':'bld_bhouse1_0');
    let rx=bx0+2;
    if(bh>=10)while(rx+4<=bx1+1){
      addBld(terr,rx,by0+6,4,3,'house','',null);
      rx+=4;
    }
    if(bh>=12){
      let rx2=bx0+1;
      while(rx2+3<=bx1+1){
        addBld(terr,rx2,by0+9,3,3,'house','', IB.hsh(rx2,by0,24)<0.4?'cottage_b':null);
        rx2+=3;
      }
    }
    if(bh>=14){
      let rx2=bx0+1;
      while(rx2+4<=bx1){
        addBld(terr,rx2,by0+11,4,3,'house','', IB.hsh(rx2,by0,23)<0.4?'cottage_b':null);
        rx2+=4;
      }
    }
    if(bw>=9&&bh>=12)addBld(terr,bx0+2,by1-4,6,4,IB.hsh(bx,by,3)<0.5?'shop':'cafe','',
      IB.hsh(bx,by,4)<0.5?'bld_shop1_0':'bld_bhouse1_0');
    if(bw>=16&&bh>=14)garageRow(by1-2,bx0+9,bx1,(bx*17+by*5)|0);
    yard(by0+6,bx0+12,(bx*17+by*5)|0);
    voidFill(by0+1,by1-3,(bx*29+by*31)|0,[bx0+12,by0+6,9,5]);
  }else if(kind==='comm'){
    /* v7.0: комерційний — ряди крамниць/кафе впритул (крок 4) + кіоски */
    let rx=bx0+1;
    while(rx+5<=bx1+1){
      const t=['shop','cafe','bar','hotdog','voda','shop','second'][IB.ri(0,6)%7];
      if(IB.hsh(rx,by0,14)<0.95)
        addBld(terr,rx,by0+1,5,4,t,'',
          t==='hotdog'||t==='voda'?'shop2':(t==='cafe'||t==='bar'?'bld_bhouse1_0':'bld_shop1_0'));
      rx+=4;
      if(bh>=8&&IB.hsh(rx,by0,18)<0.8)addBld(terr,rx,by0+1,3,3,'kiosk','',null);
    }
    if(bx1-rx>=1)addBld(terr,rx,by0+1,Math.min(2,bx1-rx+1),2,'kiosk','',null);
    /* другий ряд зі зсувом 2 */
    if(bh>=9){
      let rx2=bx0+3;
      while(rx2+5<=bx1+1){
        addBld(terr,rx2,by0+5,5,4,IB.hsh(rx2,by,8)<0.5?'shop':'cafe','','bld_bhouse2_0');
        rx2+=4;
      }
    }
    /* третій ряд — малий, біля нижнього краю */
    if(bh>=11){
      let rx3=bx0+1;
      while(rx3+4<=bx1+1){
        addBld(terr,rx3,by1-2,4,3,IB.hsh(rx3,by,44)<0.5?'shop':'kiosk','',
          IB.hsh(rx3,by,45)<0.5?'bld_shop1_0':'shop2');
        rx3+=4;
      }
    }
    yard(by0+6,bx0+1,(bx*41+by*3)|0);
    voidFill(by0+6,by1-2,(bx*37+by*41)|0,[bx0+1,by0+6,8,5]);
  }else{
    /* v7.0: зелений двір — дачні ряди по краях + зелені пропси */
    for(let yy=by0+1;yy<by1;yy++)for(let xx=bx0+1;xx<bx1;xx++){
      const t=terr[yy*W+xx];
      if(t!==2&&t!==17)continue;
      if(WA.grid.has(yy*W+xx))continue;
      const h=IB.hsh(xx,yy,44);
      if(h<0.18)WA.props.push({x:xx,y:yy,type:'oak',seed:h});
      else if(h<0.30)WA.props.push({x:xx,y:yy,type:'tree2',seed:h});
      else if(h<0.36)WA.props.push({x:xx,y:yy,type:'flower',seed:h});
      else if(h<0.40)WA.props.push({x:xx,y:yy,type:'bench',seed:h});
      else if(h<0.47)WA.props.push({x:xx,y:yy,type:'bush',seed:h});
    }
    /* v7.0: дачі по верхньому і нижньому краях зеленого кварталу */
    let dx=bx0+1;
    while(dx+3<=bx1+1){
      addBld(terr,dx,by0+1,3,3,'dacha','',IB.hsh(dx,by0,71)<0.5?'bld_dacha1_0':'bld_dacha2_0');
      dx+=3;
    }
    if(bh>=10){
      dx=bx0+2;
      while(dx+3<=bx1+1){
        addBld(terr,dx,by1-3,3,3,'dacha','',IB.hsh(dx,by1,73)<0.5?'bld_dacha3_0':'bld_dacha1_1');
        dx+=3;
      }
    }
    voidFill(by0+1,by1-2,(bx*43+by*47)|0,[bx0+1,by0+3,10,6]);
    if(bw>=10&&bh>=10&&IB.hsh(bx,by,55)<0.5&&!WA.grid.has((by0+3)*W+(bx0+4)))
      WA.props.push({x:bx0+4,y:by0+3,type:'fountain',seed:.4});
    if(bw>=8&&IB.hsh(bx,by,56)<0.6){
      const kx=bx0+1,ky=by1-5;
      addBld(terr,kx,ky,IB.M.min(7,bw-2),4,IB.hsh(bx,by,57)<0.5?'shop':'kiosk','',
        IB.hsh(bx,by,58)<0.5?'bld_shop1_0':'shop2');
    }
  }
}

/* v10: БУЛЬВАРНІ ДЕРЕВА — тільки В ГЛИБИНІ тротуару/двору: коридор біля
   асфальту лишається вільним (не застрягнеш), біля дороги — тільки кущі */
function streetTrees(terr){
  let added=0;
  for(let y=CITY_Y0;y<CITY_Y1;y++)for(let x=2;x<W-2;x++){
    const i=y*W+x;
    if(terr[i]!==17)continue;                       /* тільки тротуарні плити */
    const h=IB.hsh(x,y,66);
    if(h>=0.16)continue;
    if(isCross(x,y))continue;
    if(WA.grid.has(i))continue;
    const near=nearAsphalt(x,y,terr);
    if(near&&h>0.09)continue;                        /* біля асфальту — тільки кущ (прохідний) */
    if(!near&&propAdjacent(x,y))continue;
    const t2=near?'bush':(h<0.045?'oak':(h<0.09?'tree2':'bush'));
    WA.props.push({x,y,type:t2,seed:h});
    added++;
  }
  return added;
}

function fillCityBlocks(terr){
  /* v10.0: КОРЕКТНІ КВАРТАЛИ — смуги МІЖ вулицями (вулиця = 3 ряди,
     проспект = 5). Вулиці обробляються як смуги — забудова НІКОЛИ не
     накриває асфальт (виправлено мега-діапазон старих версій) */
  const SEG=[];
  for(const sy of H_STREETS)SEG.push([sy,sy+3]);
  SEG.push([PROSP_Y,PROSP_Y+5]);
  SEG.sort((a,b)=>a[0]-b[0]);
  const bands=[];
  let cur=CITY_Y0;
  for(const [s0,s1] of SEG){
    if(s0>cur)bands.push([cur,s0-1]);
    cur=Math.max(cur,s1);
  }
  if(cur<CITY_Y1-1)bands.push([cur,CITY_Y1-1]);
  let bi=0;
  for(const [by0,by1] of bands){
    if(by1-by0<4)continue;
    let xcur=8;
    for(const sx of V_STREETS){
      const bx0=xcur,bx1=sx-1;
      xcur=sx+3;                                     /* v10: вулиця 3 смуги */
      if(bx1-bx0<4)continue;
      /* пропускаємо зони-виключення (перетин хоч би тайлом) */
      let skip=false;
      for(let yy=by0;yy<=by1&&!skip;yy++)for(let xx=bx0;xx<=bx1;xx++){
        if(inNoBuild(xx,yy)){skip=true;break;}
      }
      if(skip)continue;
      const kind=blockType(bi,(by0/3)|0);
      fillBlock(terr,bx0,by0,bx1,by1,kind,bi,(by0/3)|0);
      bi++;
    }
  }
}
/* КОНТЕЙНЕРИ КВАРТИР — ставляться поверх процедурних кварталів */
function placeApartments(terr){
  for(const a of APTS){
    /* прибрати те, що процедурка поставила на цьому місці */
    for(let i=WA.buildings.length-1;i>=0;i--){
      const b=WA.buildings[i];
      if(a.bx<b.x+b.w+1&&a.bx+a.w+1>b.x&&a.by<b.y+b.h+1&&a.by+a.h+1>b.y){
        for(let yy=b.y;yy<b.y+b.h;yy++)for(let xx=b.x;xx<b.x+b.w;xx++)
          if(terr[yy*W+xx]===10)terr[yy*W+xx]=2;
        WA.buildings.splice(i,1);
      }
    }
    for(let yy=a.by;yy<a.by+a.h;yy++)for(let xx=a.bx;xx<a.bx+a.w;xx++)terr[yy*W+xx]=10;
    WA.buildings.push({x:a.bx,y:a.by,w:a.w,h:a.h,type:'panel9',label:'КВАРТИРИ — '+a.addr,
      name:'ЖИТЛОВИЙ БУДИНОК',img:null,door:{x:a.bx+5,y:a.by+a.h},floors:2,
      apt:{addr:a.addr,rent:a.rent,price:a.price}});
    WA.built++;
  }
}

/* ---------- РУЧНІ БУДІВЛІ, ПІРСИ, МОСТИ ---------- */
function buildCity(elev,terr){
  /* ПОРТ: бетон до самого моря */
  for(let y=PORT.y;y<PORT.y+PORT.h;y++)for(let x=PORT.x;x<PORT.x+PORT.w;x++){
    const i=y*W+x;if(y>=SHALLOW_Y0)continue;if(terr[i]!==16)terr[i]=12;
  }
  /* ЗАВОД і лиманні баржі */
  for(let y=ZAVOD.y;y<ZAVOD.y+ZAVOD.h;y++)for(let x=ZAVOD.x;x<ZAVOD.x+ZAVOD.w;x++){
    const i=y*W+x;if(terr[i]!==16&&terr[i]!==10)terr[i]=12;
  }
  /* АВТОСТАНЦІЯ: бетонний майданчик */
  for(let y=20;y<30;y++)for(let x=194;x<236;x++){
    const i=y*W+x;if(y>=CITY_Y0)break;if(terr[i]!==12)terr[i]=13;
  }
  /* будівлі (v10: захист від потрапляння на асфальт — зсув вниз до 4 разів) */
  for(const hs of CITY_BUILDINGS){
    let bx=hs.x,by=hs.y,ok=false;
    for(let tries=0;tries<4&&!ok;tries++){
      ok=true;
      for(let y=by;y<by+hs.h&&ok;y++)for(let x=bx;x<bx+hs.w;x++){
        if(x<1||y<1||x>=W-1||y>=H-1||isStreet(x,y)){ok=false;break;}
      }
      if(!ok)by++;
    }
    if(!ok)continue;
    for(let y=by;y<by+hs.h;y++)for(let x=bx;x<bx+hs.w;x++)terr[y*W+x]=10;
    const b={x:bx,y:by,w:hs.w,h:hs.h,type:hs.type,label:hs.label||'',name:hs.label||'БУДИНОК',
      img:hs.img||null,door:{x:bx+(hs.w>>1),y:by+hs.h}};
    WA.buildings.push(b);
    WA.built++;
  }
  /* ПАНЕЛЬКИ 9-ПОВЕРХОВІ ручні */
  for(const p9 of PANEL9){
    if(inNoBuild(p9.x+6,p9.y+3))continue;
    const w=10,h=4;   /* v18.2: вежа, не «млинець» */
    let clear=true;
    for(let y=p9.y-1;y<p9.y+h+1&&clear;y++)for(let x=p9.x-1;x<p9.x+w+1;x++){
      if(x<1||y<1||x>=W-1||y>=H-1){clear=false;break;}
      const t=terr[y*W+x];
      if(t===10||t===12||t===16||t===14||t===15||t===0){clear=false;break;}
    }
    if(!clear)continue;
    for(let y=p9.y;y<p9.y+h;y++)for(let x=p9.x;x<p9.x+w;x++)terr[y*W+x]=10;
    WA.buildings.push({x:p9.x,y:p9.y,w:w,h:h,type:'panel9',label:'ЖИТЛОВИЙ БУДИНОК 2-ПОВ.',name:'ЖИТЛОВИЙ БУДИНОК',
      img:null,door:{x:p9.x+5,y:p9.y+h},floors:2});   /* v18.4: вежі більше не генеруються (PANEL9 порожній) */
    WA.built++;
  }
  /* МАЯК на молу */
  for(const hs of EXTRA_BUILDINGS){
    for(let y=hs.y;y<hs.y+hs.h;y++)for(let x=hs.x;x<hs.x+hs.w;x++){
      terr[y*W+x]=10;elev[y*W+x]=2.0;
      if(y>=SHALLOW_Y0)terr[y*W+x]=10;
    }
    WA.buildings.push({x:hs.x,y:hs.y,w:hs.w,h:hs.h,type:hs.type,label:hs.label,name:hs.label,img:null,
      door:{x:hs.x+1,y:hs.y+hs.h}});
  }
  /* ПІРС «ЗАХІД СОНЦЯ»: настил від набережної в море */
  for(let y=PIER.y;y<=PIER.y+PIER.h;y++)for(let x=PIER.x;x<PIER.x+PIER.w;x++){
    const i=y*W+x;
    terr[i]=14;elev[i]=2.0;
  }
  /* майданчик пірса — кінець ширший */
  for(let y=PIER.y+PIER.h-4;y<=PIER.y+PIER.h;y++)for(let x=PIER.x-2;x<PIER.x+PIER.w+2;x++){
    if(x<1||y<1||x>=W-1||y>=H-1)continue;
    terr[y*W+x]=14;elev[y*W+x]=2.0;
  }
  /* хвилеріз від порту дугою */
  for(let t=0;t<=40;t++){
    const x=328+t*2.0,y=452+IB.M.sin(t*0.2)*4+t*0.5;
    const px=IB.M.round(x),py=IB.M.round(y);
    if(px<1||py<1||px>=W-1||py>=H-1)continue;
    if(py>=SHALLOW_Y0-20){terr[py*W+px]=14;elev[py*W+px]=2.0;}
    if(t%3===0){const qx=px+1,qy=py;terr[qy*W+qx]=14;elev[qy*W+qx]=2.0;}
  }
  /* МОЛ МАЯКА: настил від пляжу (схід) до вежі */
  for(let y=466;y<=492;y++)for(let x=416;x<=430;x++){
    if(y>=BEACH_Y0){terr[y*W+x]=14;elev[y*W+x]=2.0;}
  }
  /* причал яхт-клубу */
  for(let y=PROM_Y1;y<=452;y++)for(let x=12;x<=15;x++){terr[y*W+x]=14;elev[y*W+x]=2.0;}
  /* портовий пірс для порому */
  for(let y=PROM_Y1;y<=478;y++)for(let x=396;x<=402;x++){terr[y*W+x]=14;elev[y*W+x]=2.0;}
  /* МІСТ через Сухий лиман */
  for(let y=BRIDGE.y;y<BRIDGE.y+BRIDGE.h;y++)for(let x=BRIDGE.x;x<BRIDGE.x+BRIDGE.w;x++){
    const i=y*W+x;
    if(terr[i]===16||terr[i]===12||terr[i]===2||terr[i]===17){terr[i]=14;elev[i]=2.0;}
  }
  /* ПРИМОРСЬКІ СХОДИ (155 сходинок) */
  for(let y=STAIRS.y;y<STAIRS.y+STAIRS.h;y++)for(let x=STAIRS.x;x<STAIRS.x+STAIRS.w;x++){
    terr[y*W+x]=15;elev[y*W+x]=2.0;
  }
  /* ПРОСПЕКТ МИРУ — бульвар з газонами між смугами */
  for(let x=0;x<W;x++){
    const i2=(PROSP_Y+1)*W+x;
    /* центральний газон шириною 1: чергування */
    if(isStreet(x,PROSP_Y)&&!isCross(x,PROSP_Y)&&IB.hsh(x,1,66)<0.22&&x%24>2&&x%24<10){}
  }
  /* СЕЛА: парканчики і сади — котеджі */
  const VILL_BLD={
    krizh:[[36,18],[44,18],[52,18],[60,18],[68,18],[76,18],[36,23],[44,23],[52,23],[60,23],[68,23],[76,23]],
    mol:[[144,18],[152,18],[160,18],[168,18],[176,18],[184,18],[144,23],[152,23],[160,23],[168,23],[176,23],[184,23]],
    sovin:[[244,18],[252,18],[260,18],[268,18],[276,18],[284,18],[244,23],[252,23],[260,23],[268,23],[276,23],[284,23]],
    chm:[[340,18],[350,18],[360,18],[370,18],[380,18],[390,18],[400,18],[410,18],[340,23],[350,23],[360,23],[370,23],[380,23],[390,23]],
    lim:[[12,210],[20,210],[28,210],[12,216],[20,216],[28,216],[12,222],[20,222]],
    gryb:[[12,340],[20,340],[28,340],[12,346],[20,346],[28,346],[12,352],[20,352]],
    barab:[[292,402],[300,402],[308,402],[316,402],[292,408],[300,408],[308,408],[292,414],[300,414]],
  };
  const VILL_TYPE={krizh:'house',mol:'house',sovin:'dacha',chm:'dacha',lim:'house',gryb:'dacha',barab:'dacha'};
  const VILL_IMG={dacha:['bld_dacha1_0','bld_dacha2_0','bld_dacha3_0','bld_dacha1_1','bld_dacha2_1','bld_dacha3_0']};
  let vi=0;
  for(const key in VILL_BLD){
    for(const [vx,vy] of VILL_BLD[key]){
      const img=VILL_TYPE[key]==='dacha'?VILL_IMG.dacha[vi%6]:null;
      addBld(terr,vx,vy,5,3,VILL_TYPE[key],'',img);
      /* v7.0: заповнюємо зазори хатками — щільні села громади */
      if(IB.hsh(vx,vy,91)<0.75)addBld(terr,vx+5,vy,3,3,'house','',
        VILL_TYPE[key]==='dacha'?VILL_IMG.dacha[(vi+3)%6]:null);
      vi++;
    }
    /* v7.0: третій ряд дач у кожному селі */
    for(const [vx,vy] of VILL_BLD[key].slice(0,4)){
      const y3=vy+8;
      if(IB.hsh(vx,y3,93)<0.8)addBld(terr,vx,y3,5,3,'dacha','',VILL_IMG.dacha[vi%6]);
    }
    /* v7.0: четвертий ряд у Чорноморці/Совіньйоні (широкі села) */
    if(key==='chm'||key==='sovin'){
      for(const [vx,vy] of VILL_BLD[key].slice(0,6)){
        const y4=vy-5;
        if(y4>16&&IB.hsh(vx,y4,97)<0.8)addBld(terr,vx,y4,5,3,'dacha','',VILL_IMG.dacha[(vi+2)%6]);
      }
    }
  }
  /* v7.0: дачі по полях одеського напрямку — 70, рядами вздовж траси */
  for(let i=0;i<140;i++){
    const h1=IB.hsh(i,1,63),h2=IB.hsh(i,2,64);
    const x=6+IB.M.floor(h1*(W-14)),y=2+IB.M.floor(h2*9);
    if(y===TRASA_Y-1||y===TRASA_Y||y===TRASA_Y+1)continue;
    if(terr[y*W+x]!==2&&terr[y*W+x]!==7)continue;
    /* v5.0: без перетинів — перевірка всього footprint (двері дач мають бути вільні) */
    let free=true;
    for(let yy=y;yy<y+3&&free;yy++)for(let xx=x;xx<x+5;xx++)
      if(terr[yy*W+xx]===10||terr[(y+3)*W+(xx)]===10){free=false;break;}
    if(!free)continue;
    addBld(terr,x,y,5,3,'dacha','',VILL_IMG.dacha[i%6]);
  }
}

/* ---------- ПРОПСИ: двори, вулиці, зупинки, пляж ---------- */
function scatterCity(terr){
  const P=WA.props;
  /* ОДЕСЬКИЙ НАПРЯМ: соняшники, стоги, дачні паркани */
  for(let i=0;i<130;i++){
    const h1=IB.hsh(i,21,81),h2=IB.hsh(i,22,82);
    const x=4+IB.M.floor(h1*(W-8)),y=2+IB.M.floor(h2*10);
    if(WA.grid.has(y*W+x))continue;
    if(terr[y*W+x]!==2)continue;
    const kind=h1<0.5?'sunfl':(h1<0.62?'hay':(h1<0.78?'bush':'flower'));
    P.push({x,y,type:kind,seed:h2});
  }
  /* v18.2: ПУСТІ ГАЛЯВИНИ МІСТА — заповнювач: дерева/кущі/квіти на вільних
     газонах (не на асфальті, не біля доріг, без дублювання пропсів) */
  for(let y=CITY_Y0;y<CITY_Y1;y++)for(let x=4;x<W-4;x++){
    const ti=y*W+x;
    if(terr[ti]!==2&&terr[ti]!==17)continue;
    if(WA.grid.has(ti))continue;
    const h=IB.hsh(x,y,91);
    if(h>=0.075)continue;
    if(nearAsphalt(x,y,terr))continue;
    if(propAdjacent(x,y))continue;
    P.push({x,y,type:h<0.03?'tree2':(h<0.05?'oak':(h<0.062?'bush':'flower')),seed:h});
  }
  /* знаки на траксі */
  P.push({x:80,y:14,type:'dsign',name:'ОДЕСА 25 КМ →',seed:.4});
  P.push({x:340,y:14,type:'dsign',name:'ЧОРНОМОРСЬК →',seed:.45});
  P.push({x:194,y:22,type:'dsign',name:'АВТОСТАНЦІЯ',seed:.46});
  P.push({x:52,y:15,type:'dsign',name:'КРИЖАНІВКА',seed:.47});
  P.push({x:160,y:15,type:'dsign',name:'МОЛОДІЖНЕ',seed:.48});
  P.push({x:260,y:15,type:'dsign',name:'СОВІНЬЙОН',seed:.49});
  P.push({x:352,y:15,type:'dsign',name:'ЧОРНОМОРКА (ЛЮСТДОРФ)',seed:.5});
  /* v18.2: ПРИМОРСЬКИЙ ПАРК — НАСИЧЕНИЙ (відгук «пусті галявини розбавляй
     парками: дерева, стежки»): густі дерева, 3 стежки, лавки і ліхтарі
     вздовж алей, квітники, гойдалки */
  for(let y=PARK.y;y<PARK.y+PARK.h;y++)for(let x=PARK.x;x<PARK.x+PARK.w;x++){
    const t=terr[y*W+x],h=IB.hsh(x,y,5);
    if(t!==2&&t!==3)continue;
    if(WA.grid.has(y*W+x))continue;
    if(h<0.20)P.push({x,y,type:'oak',seed:IB.hsh(x,y,8)});
    else if(h<0.30)P.push({x,y,type:'tree2',seed:IB.hsh(x,y,8)});
    else if(h<0.40)P.push({x,y,type:'bush',seed:IB.hsh(x,y,8),berries:true});
    else if(h<0.48)P.push({x,y,type:'flower',seed:IB.hsh(x,y,8)});
    else if(h<0.52)P.push({x,y,type:'palm',seed:IB.hsh(x,y,8)});
    else if(h<0.545)P.push({x,y,type:'pine',seed:IB.hsh(x,y,8)});
  }
  /* v18.2: СТІЖКИ ПАРКУ — сітка з 3 алей (крива + 2 прямі) */
  for(let t=0;t<=60;t++){
    const x=PARK.x+2+t*1.1,y=PARK.y+14+IB.M.sin(t*0.5)*3;
    const i=IB.M.round(y)*W+IB.M.round(x);
    if(i>0&&i<W*H&&(terr[i]===2||terr[i]===3))terr[i]=7;
  }
  for(let x=PARK.x+2;x<PARK.x+PARK.w-2;x++){
    const i1=(PARK.y+6)*W+x, i2=(PARK.y+22)*W+x;
    if(terr[i1]===2||terr[i1]===3)terr[i1]=7;
    if(terr[i2]===2||terr[i2]===3)terr[i2]=7;
  }
  for(let y=PARK.y+2;y<PARK.y+PARK.h-2;y++){
    const i1=y*W+(PARK.x+18), i2=y*W+(PARK.x+50);
    if(terr[i1]===2||terr[i1]===3)terr[i1]=7;
    if(terr[i2]===2||terr[i2]===3)terr[i2]=7;
  }
  /* v18.2: лавки і ліхтарі вздовж алей + квітники */
  for(let x=PARK.x+4;x<PARK.x+PARK.w-4;x+=5){
    for(const ay of [PARK.y+5,PARK.y+13,PARK.y+21]){
      const bx=x+((x*7+ay*3)%3),by=ay+((x%2)?1:-1);
      const ti=by*W+bx;
      if((terr[ti]===2||terr[ti]===3)&&!WA.grid.has(ti)&&!propAdjacent(bx,by)&&!nearAsphalt(bx,by,terr)){
        P.push({x:bx,y:by,type:(x%10<5)?'bench':'lamp',seed:IB.hsh(x,ay,6)});
      }
    }
  }
  for(let k=0;k<14;k++){
    const fx=PARK.x+4+IB.M.floor(IB.hsh(k,3,61)*(PARK.w-8)),
          fy=PARK.y+3+IB.M.floor(IB.hsh(k,4,62)*(PARK.h-6));
    for(let dy2=0;dy2<2;dy2++)for(let dx2=0;dx2<3;dx2++){
      const ti=(fy+dy2)*W+(fx+dx2);
      if(ti>0&&ti<W*H&&(terr[ti]===2))terr[ti]=3;   /* квітник */
    }
  }
  /* гойдалка і пісочниця в парку (сімейна зона) */
  P.push({x:PARK.x+30,y:PARK.y+9,type:'swing',seed:.3});
  P.push({x:PARK.x+34,y:PARK.y+9,type:'sandbox',seed:.4});
  /* МОЛОДІЖНИЙ ПАРК (v18.2: + дерева і кущі по полю) */
  for(let k=0;k<10;k++){
    const tx9=YOUNG.x+2+IB.M.floor(IB.hsh(k,7,81)*(YOUNG.w-4)),
          ty9=YOUNG.y+2+IB.M.floor(IB.hsh(k,8,82)*(YOUNG.h-4));
    const ti=ty9*W+tx9;
    if((terr[ti]===2||terr[ti]===3)&&!WA.grid.has(ti)&&!propAdjacent(tx9,ty9)&&!nearAsphalt(tx9,ty9,terr))
      P.push({x:tx9,y:ty9,type:['oak','tree2','bush','flower'][k%4],seed:IB.hsh(tx9,ty9,83)});
  }
  P.push({x:44,y:94,type:'train',seed:.1},{x:52,y:97,type:'tramp',seed:.2});
  P.push({x:42,y:99,type:'swing',seed:.3},{x:48,y:99,type:'slide',seed:.4});
  P.push({x:40,y:91,type:'oak',seed:.5},{x:62,y:91,type:'oak',seed:.6});
  P.push({x:56,y:96,type:'bench',seed:.7},{x:50,y:99,type:'flower',seed:.8});
  /* ЛУНА-ПАРК (v10: з нової сітки вулиць) */
  P.push({x:128,y:163,type:'wheel',seed:.1},{x:140,y:170,type:'carousel',seed:.2});
  P.push({x:144,y:163,type:'autodrom',seed:.3},{x:139,y:171,type:'tramp',seed:.4});
  P.push({x:124,y:163,type:'carousel',seed:.5},{x:149,y:166,type:'train',seed:.6});
  P.push({x:132,y:167,type:'bench',seed:.7},{x:142,y:175,type:'flower',seed:.8});
  /* ПАРК ЯКОРІВ (v10) */
  P.push({x:206,y:163,type:'anchor',seed:.1},{x:214,y:163,type:'anchor',seed:.2},
         {x:220,y:166,type:'anchor',seed:.3},{x:208,y:168,type:'anchor',seed:.4});
  P.push({x:212,y:165,type:'statue',seed:.5});
  P.push({x:204,y:165,type:'bench',seed:.6},{x:218,y:169,type:'bench',seed:.7});
  /* ПЛОЩА: стела ЧОРНОМОРСЬК + пам'ятник + фонтан + лавки */
  P.push({x:214,y:404,type:'stella',name:'ЧОРНОМОРСЬК',seed:.8});
  P.push({x:206,y:406,type:'statue',seed:.85});
  P.push({x:222,y:404,type:'fountain',seed:.86});
  P.push({x:202,y:410,type:'bench',seed:.9},{x:226,y:410,type:'bench',seed:.95});
  P.push({x:210,y:412,type:'flower',seed:.96},{x:218,y:412,type:'flower',seed:.97});
  /* v18.2: ПЛОЩА НАСИЧЕНА — ряди дерев по краях, ліхтарі, лавки, квітники,
     друга фонтанна група і вітальна арка */
  for(const [px9,py9] of [[198,399],[206,399],[214,399],[222,399],[228,399],
                            [198,412],[228,412],[202,402],[224,402]]){
    const ti=py9*W+px9;
    if(terr[ti]===13&&!WA.grid.has(ti)&&!propAdjacent(px9,py9))
      P.push({x:px9,y:py9,type:(px9%2)?'palm':'tree2',seed:IB.hsh(px9,py9,71)});
  }
  for(const [px9,py9] of [[200,404],[208,408],[220,408],[226,404],[204,414],[216,414]]){
    const ti=py9*W+px9;
    if(terr[ti]===13&&!WA.grid.has(ti)&&!propAdjacent(px9,py9))
      P.push({x:px9,y:py9,type:'lamp',seed:IB.hsh(px9,py9,72)});
  }
  for(const [px9,py9] of [[205,399],[213,399],[221,399],[203,407],[219,407]]){
    const ti=py9*W+px9;
    if(terr[ti]===13&&!WA.grid.has(ti)&&!propAdjacent(px9,py9))
      P.push({x:px9,y:py9,type:'flower',seed:IB.hsh(px9,py9,73)});
  }
  P.push({x:212,y:410,type:'bench',seed:.77},{x:199,y:407,type:'bench',seed:.78});
  /* ПРИМОРСЬКІ СХОДИ — насичені: ліхтарі і кущі обабіч, лавки на прогонах */
  for(let y=STAIRS.y+1;y<STAIRS.y+STAIRS.h-1;y+=3){
    for(const sx2 of [STAIRS.x-1,STAIRS.x+STAIRS.w]){
      const ti=y*W+sx2;
      if((terr[ti]===2||terr[ti]===13||terr[ti]===17)&&!WA.grid.has(ti)&&!propAdjacent(sx2,y))
        P.push({x:sx2,y,type:(y%2)?'lamp':'bush',seed:IB.hsh(sx2,y,74)});
    }
  }
  P.push({x:STAIRS.x-2,y:STAIRS.y+6,type:'bench',seed:.79});
  P.push({x:STAIRS.x+STAIRS.w+1,y:STAIRS.y+11,type:'bench',seed:.8});
  /* ЗУПИНКИ МАРШРУТКИ №7 (v10: координати поза 3-смуговим асфальтом) */
  const LOOP={hx:[118,300],vx:[8,200]};
  WA.BSTOPS=[];
  const addStop=(x,y,nm)=>{
    const t=terr[y*W+x];
    if(t!==17&&t!==2&&t!==13)return;
    if(WA.grid.has(y*W+x))return;
    P.push({x,y,type:'bstop',seed:.5});
    WA.BSTOPS.push({x,y,name:nm});
  };
  /* просп. Миру (верхня і нижна сторона) */
  addStop(14,117,'пр. Миру — 1-ша Лінія');
  addStop(70,117,'пр. Миру — 5-та Лінія');
  addStop(126,117,'пр. Миру — 8-ма Лінія');
  addStop(182,117,'пр. Миру — 12-та Лінія (РИНОК «ПІВНІЧНИЙ»)');
  addStop(236,117,'пр. Миру — 15-та Лінія');
  addStop(14,123,'пр. Миру — 1-ша Лінія (низ)');
  addStop(70,123,'пр. Миру — 5-та Лінія (низ)');
  addStop(91,123,'пр. Миру — РІЕЛТОР «БІЛЯ МОРЕ»');
  addStop(126,123,'пр. Миру — 8-ма Лінія (низ)');
  addStop(182,123,'пр. Миру — 12-та Лінія (низ)');
  addStop(236,123,'пр. Миру — 15-та Лінія (низ)');
  /* вул. Курортна (300..302) */
  addStop(14,298,'вул. Курортна — 1-ша Лінія');
  addStop(70,298,'вул. Курортна — 5-та Лінія');
  addStop(126,298,'вул. Курортна — 8-ма Лінія');
  addStop(182,298,'вул. Курортна — 12-та Лінія');
  addStop(14,303,'вул. Курортна — 1-ша Лінія (низ)');
  addStop(70,303,'вул. Курортна — 5-та Лінія (низ)');
  addStop(126,303,'вул. Курортна — 8-ма Лінія (низ)');
  addStop(182,303,'вул. Курортна — 12-та Лінія (низ)');
  /* поперечні зупинки + вокзал/автостанція/пляж/порт */
  addStop(11,33,'вул. Кобзарська — ВОКЗАЛ');
  addStop(194,26,'АВТОСТАНЦІЯ');
  addStop(170,428,'НАБЕРЕЖНА — ПІРС');
  addStop(212,412,'ПЛОЩА — СХОДИ');
  addStop(252,409,'БРОНКС');
  addStop(331,411,'КЛУБ «МАЯК»');
  addStop(68,397,'ЇДАЛЬНЯ «ХВИЛЯ»');
  addStop(326,394,'МОРЕВАКЗАЛ');
  addStop(98,67,'РИНОК «ПІВНІЧНИЙ»');
  /* вертикальні коліна петлі: 1-ша (x8..10) і 12-та (x200..202) Лінії */
  addStop(11,146,'1-ша Лінія — пр. Миру (низ)');
  addStop(11,180,'1-ша Лінія — вул. Морська');
  addStop(11,260,'1-ша Лінія — вул. Південна');
  addStop(11,340,'1-ша Лінія — Приморський');
  addStop(203,146,'12-та Лінія — пр. Миру (низ)');
  addStop(203,180,'12-та Лінія — вул. Морська');
  addStop(203,260,'12-та Лінія — вул. Південна');
  addStop(203,340,'12-та Лінія — Приморський');
  /* таблички РАЙОНІВ */
  const SIGNS=[[20,70,'ПІВНІЧНИЙ МАСИВ'],[156,70,'ПІВНІЧНИЙ МАСИВ'],[300,70,'ЮВІЛЕЙНИЙ'],
    [76,124,'ЦЕНТР — ПРОСП. МИРУ'],[260,124,'ЦЕНТР'],[380,124,'ЦЕНТР'],
    [60,222,'ПІВДЕННИЙ МАСИВ'],[240,222,'СУДНОБУДІВНИКІВ'],[380,222,'СУДНОБУДІВНИКІВ'],
    [60,340,'ПРИМОРСЬКИЙ'],[200,340,'ПРИМОРСЬКИЙ'],[352,352,'ПОРТ'],
    [356,238,'СУХИЙ ЛИМАН'],[40,26,'ОДЕСЬКИЙ НАПРЯМ'],
    [12,392,'ГРИБІВКА'],[300,396,'БАРАБОЙ'],[14,212,'ЛИМАНКА'],
    [104,52,'ВУЛ. ПОШТОВА'],[420,452,'МАЯК →']];
  for(const s of SIGNS)P.push({x:s[0],y:s[1],type:'dsign',name:s[2],seed:.5});
  /* ЛІХТАРІ ПО ВУЛИЦЯХ — вся сітка освітлена (щільність Києва) */
  for(const sy of H_STREETS){
    for(let lx=10;lx<W-10;lx+=18){
      const ly=sy+3;
      if(ly>=CITY_Y1||ly<PROM_Y0-10)continue;
      const i2=ly*W+lx;
      if(terr[i2]!==2&&terr[i2]!==17)continue;
      if(WA.grid.has(i2))continue;
      P.push({x:lx,y:ly,type:'lamp',seed:IB.hsh(lx,ly,17)});
    }
  }
  /* ПРОСПЕКТ МИРУ: пальми і лавки в бульварі */
  for(let x=8;x<W-8;x+=9){
    const y=PROSP_Y;
    const i=y*W+x;
    if((terr[i]===12||terr[i]===19)&&!WA.grid.has(i)&&IB.hsh(x,4,18)<0.4)
      P.push({x,y,type:'palm',seed:IB.hsh(x,5,19)});
    const i2=(PROSP_Y+3)*W+x;
    if((terr[i2]===12||terr[i2]===19)&&!WA.grid.has(i2)&&IB.hsh(x,6,20)<0.3)
      P.push({x,y:PROSP_Y+3,type:'bench',seed:IB.hsh(x,7,21)});
  }
  /* набережна: пальми, лавки, ліхтарі, ГОДІВНИЦІ ЧАЙОК */
  for(let x=4;x<W-4;x+=6){
    if(x>=PORT.x-6)continue;
    const y=PROM_Y0+(IB.hsh(x,1,11)<0.5?1:3);
    const i=y*W+x;
    if(terr[i]===13&&!WA.grid.has(i))P.push({x,y,type:'palm',seed:IB.hsh(x,y,12)});
    const y2=PROM_Y0+5;
    if(IB.hsh(x,2,13)<0.42&&terr[y2*W+x]===13&&!WA.grid.has(y2*W+x))P.push({x,y:y2,type:'bench',seed:IB.hsh(x,y2,14)});
    if(IB.hsh(x,3,15)<0.3&&terr[(PROM_Y0+7)*W+x]===13&&!WA.grid.has((PROM_Y0+7)*W+x))P.push({x,y:PROM_Y0+7,type:'lamp',seed:IB.hsh(x,3,16)});
  }
  /* ГОДІВНИЦІ ЧАЙОК */
  P.push({x:120,y:433,type:'gullfeed',seed:.2});
  P.push({x:280,y:435,type:'gullfeed',seed:.25});
  P.push({x:60,y:436,type:'gullfeed',seed:.3});
  P.push({x:200,y:438,type:'gullfeed',seed:.35});
  /* пляж: парасолки + шезлонги + рушники + тенти + кабінки (ЩІЛЬНО, великий пляж) */
  for(let i=0;i<240;i++){ /* v16: заповнений простір */
    const h1=IB.hsh(i,7,21),h2=IB.hsh(i,8,22),h3=IB.hsh(i,9,23);
    const x=8+IB.M.floor(h1*318),y=BEACH_Y0+2+IB.M.floor(h2*(BEACH_Y1-BEACH_Y0-6));
    if(WA.grid.has(y*W+x))continue;
    if(terr[y*W+x]!==1)continue; /* v18: не класти парасолки на будівлі пляжу */
    /* v14: лежаків і тіні БІЛЬШЕ (пляж не порожній) */
    const kind=h3<0.24?'umb':(h3<0.62?'lounger':(h3<0.70?'towel':(h3<0.77?'tent':
      (h3<0.82?'cabin':(h3<0.88?'sandcastle':(h3<0.94?'bin':'ball'))))));
    P.push({x,y,type:kind,seed:h3});
  }
  /* v14: КОЗИРКИ (тіньові навіси) з рядами ШЕЗЛОНГІВ — пляж як у життя */
  const CANOPY_X=[30,86,178,236,296,342,110,260,56,140,210,310,25,330,390];
  CANOPY_X.forEach((cx0,i)=>{
    const cy0=BEACH_Y0+5+(i%4)*8;
    P.push({x:cx0,y:cy0,type:'canopy',seed:.4+i*0.01});
    for(let k=0;k<4;k++){
      const lx=cx0-9+k*6,ly=cy0+2+(k%2); /* v16: ×3 лежаки — ширші ряди */
      if(!WA.grid.has(ly*W+lx))P.push({x:lx,y:ly,type:'lounger',seed:.5+i*0.02+k});
    }
  });
  /* v14: СТОЛИ ПІНГ-ПОНГУ на пляжі (активності) */
  P.push({x:196,y:452,type:'pingpong',seed:.31});
  P.push({x:320,y:462,type:'pingpong',seed:.32});
  /* волейбольні сітки ×4 */
  for(let x=64;x<=80;x++)P.push({x,y:452,type:'net',seed:.5});
  for(let x=220;x<=236;x++)P.push({x,y:458,type:'net',seed:.6});
  for(let x=290;x<=300;x++)P.push({x,y:450,type:'net',seed:.65});
  for(let x=120;x<=132;x++)P.push({x,y:464,type:'net',seed:.66});
  /* футбольні ворота 2х3 ×4 пари */
  P.push({x:150,y:468,type:'goal',seed:.7},{x:168,y:468,type:'goal',seed:.8});
  P.push({x:92,y:460,type:'goal',seed:.75},{x:106,y:460,type:'goal',seed:.85});
  P.push({x:250,y:468,type:'goal',seed:.76},{x:264,y:468,type:'goal',seed:.86});
  P.push({x:40,y:456,type:'goal',seed:.77},{x:52,y:456,type:'goal',seed:.87});
  /* v16: ПАЛЬМИ НА ПЛЯЖІ — тінь і південний настрій */
  for(let px2=14;px2<330;px2+=9){
    const py2=BEACH_Y0+4+IB.hsh(px2,5,41)*(BEACH_Y1-BEACH_Y0-10);
    const ii=IB.M.round(py2)*W+px2;
    if(!WA.grid.has(ii)&&terr[ii]===1)P.push({x:px2,y:IB.M.round(py2),type:'palm',seed:IB.hsh(px2,9,42)});
  }
  /* v16: ШАУРМНИЦІ — набережна і пляж */
  P.push({x:60,y:BEACH_Y0,type:'shawarma',seed:.61});
  P.push({x:170,y:BEACH_Y0,type:'shawarma',seed:.62});
  P.push({x:286,y:BEACH_Y0,type:'shawarma',seed:.63});
  P.push({x:118,y:BEACH_Y0+16,type:'shawarma',seed:.64});
  /* v16: КОРОБКИ/ЯЩИКИ — купки вздовж пляжу */
  for(let i=0;i<9;i++){
    const bx=20+IB.ri(0,300),by=BEACH_Y0+3+IB.ri(0,24);
    if(WA.grid.has(by*W+bx))continue;
    P.push({x:bx,y:by,type:'crate',seed:.71},{x:bx+1,y:by,type:'crate',seed:.72},{x:bx,y:by+1,type:'crate',seed:.73});
  }
  /* рятувальні вишки ×4 */
  P.push({x:130,y:448,type:'tower',seed:.9},{x:240,y:456,type:'tower',seed:.95},{x:320,y:452,type:'tower',seed:.91},{x:60,y:454,type:'tower',seed:.92});
  /* батут і бар на пляжі */
  P.push({x:210,y:456,type:'tramp',seed:.55});
  P.push({x:140,y:446,type:'beachbar',seed:.56},{x:270,y:450,type:'beachbar',seed:.57});
  /* серф-дошки і гідроцикли біля води */
  P.push({x:100,y:468,type:'surf',seed:.3},{x:220,y:470,type:'surf',seed:.4},{x:310,y:468,type:'surf',seed:.5});
  P.push({x:160,y:471,type:'jetski',seed:.6},{x:260,y:471,type:'jetski',seed:.7},{x:70,y:470,type:'jetski',seed:.8});
  /* катамарани біля води */
  P.push({x:130,y:473,type:'catam',seed:.2},{x:190,y:474,type:'catam',seed:.3},{x:90,y:473,type:'catam',seed:.4},{x:290,y:473,type:'catam',seed:.45});
  /* парашут-катер в глибокому морі біля пірса */
  P.push({x:182,y:498,type:'paras',seed:.5});
  /* буї */
  for(let x=10;x<326;x+=8)P.push({x,y:SHALLOW_Y1+1,type:'buoy',seed:.1});
  /* v18: ПРАПОРИ РАЙОНІВ ПЛЯЖУ — у кожного району СВІЙ колір */
  P.push({x:20,y:443,type:'zflag',col:'#5ac8d8',seed:.01});
  P.push({x:70,y:443,type:'zflag',col:'#2ab8a0',seed:.02});
  P.push({x:150,y:443,type:'zflag',col:'#e02838',seed:.03});
  P.push({x:230,y:443,type:'zflag',col:'#f0d030',seed:.04});
  P.push({x:300,y:443,type:'zflag',col:'#a050d0',seed:.05});
  /* v18: ДИКА ДІЛЯНКА «ПЛЯЖ МАЯКА» — каміння, буни, ні козирків */
  for(const rk of [[12,447],[24,452],[38,449],[52,455],[18,458],[44,463],[62,450],[30,467],[58,468]]){
    if(!WA.grid.has(rk[1]*W+rk[0]))P.push({x:rk[0],y:rk[1],type:'rock',seed:.5});
  }
  /* v18: СТАПЕЛІ «ПАЛЛАДИ» у порту — двір заводу, секції ростуть по днях (С2) */
  P.push({x:412,y:414,type:'palhull',seed:.1});
  P.push({x:404,y:416,type:'container',seed:.11},{x:424,y:411,type:'container',seed:.12});
  P.push({x:400,y:412,type:'crane',seed:.13});
  P.push({x:418,y:417,type:'crate',seed:.14},{x:419,y:417,type:'crate',seed:.15});
  /* v18: БУЙ ЗАТОНУЛОГО БАРЖ-СКЛАДУ біля маяка (С5) — точка підводного квесту */
  P.push({x:416,y:502,type:'wreckbuoy',seed:.5});
  /* портові крани і контейнери */
  for(const c of [[340,366],[356,366],[372,366],[388,366],[404,366],[420,366],
    [340,376],[356,376],[372,376],[388,376],[404,376],[420,376],
    [344,408],[368,408],[392,408],[416,408],[344,418],[368,418]]){
    /* v14: кран не малюється на будівлі порту */
    if(terr[c[1]*W+c[0]]===10)continue;
    P.push({x:c[0],y:c[1],type:'crane',seed:IB.hsh(c[0],c[1],31)});
  }
  for(let i=0;i<26;i++){
    const cx2=338+(i%13)*7,cy2=426-((i/13)|0)*4;
    if(terr[cy2*W+cx2]===10)continue;
    P.push({x:cx2,y:cy2,type:'container',seed:IB.hsh(i,4,32)});
  }
  /* баржі заводу в лимані */
  P.push({x:380,y:250,type:'barge',seed:.3},{x:400,y:262,type:'barge',seed:.4},{x:364,y:274,type:'barge',seed:.41});
  /* пором — в мілководді біля портового пірса */
  P.push({x:406,y:474,type:'ferry',seed:.5});
  /* яхти біля яхт-клубу */
  P.push({x:20,y:456,type:'yacht2',seed:.2},{x:28,y:462,type:'yacht2',seed:.3},{x:16,y:466,type:'yacht2',seed:.4},{x:34,y:452,type:'yacht2',seed:.35});
  /* сміття на пляжі (робота) */
  for(let i=0;i<26;i++){
    const h1=IB.hsh(i,11,41),h2=IB.hsh(i,12,42);
    const x=6+IB.M.floor(h1*320),y=BEACH_Y0+1+IB.M.floor(h2*(BEACH_Y1-BEACH_Y0-2));
    if(!WA.grid.has(y*W+x))P.push({x,y,type:'trash',seed:h1});
  }
  /* УКРПОШТА: листи по районах (v10: поза асфальтом) */
  const MAIL_SPOTS=[[124,103,'Північному масиві'],[180,168,'Центрі'],[280,246,'Південному масиву'],
    [100,374,'Приморському'],[356,408,'Порті'],[262,381,'Бронксі'],[46,276,'Лиманці']];
  for(let i=0;i<MAIL_SPOTS.length;i++){
    const m=MAIL_SPOTS[i];
    if(!WA.grid.has(m[1]*W+m[0]))P.push({x:m[0],y:m[1],type:'mail',district:m[2],seed:i*0.1});
  }
  /* каміння на піску біля східного краю */
  for(let i=0;i<10;i++){const x=290+i*3,y=BEACH_Y0+4+(i%3);if(!WA.grid.has(y*W+x))P.push({x,y,type:'rock',seed:IB.hsh(x,y,51)});}
  /* місток через лиманну протоку + кемпінг Барабой */
  for(let i=0;i<10;i++){
    const x=294+i*3,y=396+((i*7)%26);
    if(!WA.grid.has(y*W+x)&&terr[y*W+x]===2)P.push({x,y,type:'tent',seed:IB.hsh(x,y,61)});
  }
}
function gridProps(){
  WA.grid.clear();
  for(const p of WA.props)WA.grid.set(p.y*W+p.x,p);
}
function pois(){
  const P=[
    {x:220,y:160,name:'ЦЕНТР — ПРОСПЕКТ МИРУ',kind:'village'},
    {x:136,y:164,name:'ЛУНА-ПАРК',kind:'village'},
    {x:212,y:164,name:'ПАРК ЯКОРІВ',kind:'village'},
    {x:252,y:153,name:'МУЗЕЙ ім. БІЛОГО',kind:'village'},
    {x:200,y:47,name:'УКРПОШТА',kind:'village'},
    {x:268,y:153,name:'СЕКОНДХЕНД «АЛЬБАТРОС»',kind:'village'},
    {x:214,y:404,name:'ПЛОЩА ПРИМОРСЬКИХ СХОДІВ',kind:'village'},
    {x:210,y:422,name:'ПРИМОРСЬКІ СХОДИ',kind:'pier'},
    {x:96,y:370,name:'ПРИМОРСЬКИЙ ПАРК',kind:'park'},
    {x:54,y:95,name:'МОЛОДІЖНИЙ ПАРК',kind:'park'},
    {x:160,y:455,name:'ПЛЯЖ ЦЕНТРАЛЬНИЙ',kind:'beach'},
    {x:179,y:486,name:'ПІРС «ЗАХІД СОНЦЯ»',kind:'pier'},
    {x:262,y:384,name:'БРОНКС',kind:'village'},
    {x:384,y:396,name:'ЧОРНОМОРСЬКИЙ ПОРТ',kind:'port'},
    {x:398,y:316,name:'СУДНОБУДІВНИЙ ЗАВОД «ПАЛЛАДА»',kind:'port'},
    {x:390,y:293,name:'СУХИЙ ЛИМАН — МІСТ',kind:'pier'},
    {x:20,y:402,name:'ЯХТ-КЛУБ «ВІТЕР»',kind:'yacht'},
    {x:58,y:36,name:'ВОКЗАЛ',kind:'vokzal'},
    {x:98,y:62,name:'РИНОК «ПІВНІЧНИЙ»',kind:'market'},
    {x:320,y:153,name:'РИНОК «ЦЕНТРАЛЬНИЙ»',kind:'market'},
    {x:124,y:240,name:'РИНОК «ПІВДЕННИЙ»',kind:'market'},
    {x:424,y:489,name:'ЧОРНОМОРСЬКИЙ МАЯК',kind:'lighthouse'},
    {x:368,y:133,name:'МІСЬКА БІБЛІОТЕКА',kind:'village'},
    {x:204,y:301,name:'ВІДДІЛ ПОЛІЦІЇ',kind:'village'},
    {x:214,y:26,name:'АВТОСТАНЦІЯ «ЧОРНОМОРСЬК»',kind:'vokzal'},
    {x:60,y:24,name:'КРИЖАНІВКА',kind:'village'},
    {x:168,y:24,name:'МОЛОДІЖНЕ',kind:'village'},
    {x:268,y:24,name:'СОВІНЬЙОН',kind:'village'},
    {x:380,y:24,name:'ЧОРНОМОРКА (ЛЮСТДОРФ)',kind:'village'},
    {x:24,y:218,name:'ЛИМАНКА',kind:'village'},
    {x:24,y:348,name:'ГРИБІВКА',kind:'village'},
    {x:308,y:412,name:'БАРАБОЙ — КЕМПІНГ',kind:'village'},
    {x:14,y:14,name:'ОДЕСЬКІ ДАЧІ',kind:'park'},
    {x:322,y:386,name:'КЛУБ «МАЯК» — ТУСИ І РЕЙВ',kind:'village'},
    {x:12,y:12,name:'ТРАСА ОДЕСА — ЧОРНОМОРСЬК',kind:'village'},
    {x:180,y:22,name:'КАФЕ-МАГАЗИН «ПОПУТНИК»',kind:'village'},
  ];
  WA.pois=P;
  /* v5.0: POI не всередині будівель — двері або сусідній вільний тайл */
  const poiFree=(x,y)=>{
    const t=WA.terr?WA.terr[y*W+x]:0;
    return t!==10&&t!==0&&t!==16&&t!==12&&!WA.block[y*W+x]&&!WA.grid.has(y*W+x)&&IB.walkable(x,y);
  };
  for(const p of P){
    const b=WA.buildings.find(bb=>p.x>=bb.x&&p.x<bb.x+bb.w&&p.y>=bb.y&&p.y<bb.y+bb.h);
    if(b&&poiFree(b.door.x,b.door.y+1)){p.x=b.door.x;p.y=b.door.y+1;continue;}
    if(!IB.walkable(p.x,p.y)||WA.block[p.y*W+p.x]||!poiFree(p.x,p.y)){
      let done=false;
      for(let r=1;r<=8&&!done;r++)for(let dy=-r;dy<=r&&!done;dy++)for(let dx=-r;dx<=r&&!done;dx++){
        const nx=p.x+dx,ny=p.y+dy;
        if(nx<2||ny<2||nx>=W-2||ny>=H-2)continue;
        const t=terrAt(nx,ny);
        if(t!==10&&t!==0&&t!==16&&!WA.block[ny*W+nx]&&!WA.grid.has(ny*W+nx)){p.x=nx;p.y=ny;done=true;}
      }
    }
  }
}
function terrAt(x,y){return WA.terr?WA.terr[y*W+x]:0;}
/* підписи районів на великій карті */
const DISTRICTS=[
  {name:'ОДЕСЬКИЙ НАПРЯМ',x:110,y:6},
  {name:'КРИЖАНІВКА',x:60,y:22},
  {name:'МОЛОДІЖНЕ',x:168,y:22},
  {name:'СОВІНЬЙОН',x:268,y:22},
  {name:'ЧОРНОМОРКА',x:380,y:22},
  {name:'ПІВНІЧНИЙ МАСИВ',x:110,y:80},
  {name:'ЮВІЛЕЙНИЙ',x:330,y:80},
  {name:'ЦЕНТР',x:220,y:150},
  {name:'ПІВДЕННИЙ МАСИВ',x:110,y:260},
  {name:'СУДНОБУДІВНИКІВ',x:300,y:260},
  {name:'ЛИМАНКА',x:24,y:220},
  {name:'ПРИМОРСЬКИЙ',x:110,y:372},
  {name:'БРОНКС',x:265,y:384},
  {name:'ГРИБІВКА',x:24,y:350},
  {name:'БАРАБОЙ',x:308,y:412},
  {name:'ПОРТ',x:384,y:400},
  {name:'СУХИЙ ЛИМАН',x:392,y:262},
  {name:'НАБЕРЕЖНА',x:180,y:434},
  /* v18: ПЛЯЖ — РАЙОНИ (упізнавані зони) + стапелі заводу */
  {name:'ПЛЯЖ МАЯКА (ДИКИЙ)',x:36,y:456},
  {name:'СЕРФ-ЗОНА «ХВИЛЯ»',x:110,y:448},
  {name:'ЦЕНТРАЛЬНИЙ ПЛЯЖ',x:188,y:448},
  {name:'СІМЕЙНИЙ «ЗОЛОТА БУХТА»',x:264,y:456},
  {name:'ПІРСОВИЙ КІНЕЦЬ',x:318,y:456},
  {name:'СТАПЕЛІ «ПАЛЛАДА»',x:414,y:412},
  {name:'ЧОРНЕ МОРЕ',x:200,y:510},
];
WA.DISTRICTS=DISTRICTS;
function zoneAt(x,y){
  if(y>=SHALLOW_Y0){
    if(x>=PIER.x-3&&x<=PIER.x+PIER.w+3&&y<=PIER.y+PIER.h+2)return PIER.name;
    if(y>=DEEP_Y0)return 'ЧОРНЕ МОРЕ';
    return 'МІЛКОВОДДЯ — ПЛАВАТИ МОЖНА';
  }
  if(inRect(LIMAN,x,y))return LIMAN.name;
  if(inRect(BRIDGE,x,y)&&terrIs(x,y,14))return BRIDGE.name;
  if(inRect(ZAVOD,x,y))return ZAVOD.name;
  for(const v of VILLAGES)if(inRect(v,x,y))return v.name;
  if(y<CITY_Y0)return 'ОДЕСЬКИЙ НАПРЯМ';
  if(y>=BEACH_Y0){
    /* v18: РАЙОНИ ПЛЯЖУ — кожен упізнаваний (прапор свого кольору,
       камені дикої ділянки, серф-зона, сімейна бухта з кабінками) */
    if(x<70)return 'ПЛЯЖ МАЯКА (ДИКИЙ)';
    if(x<150)return 'СЕРФ-ЗОНА «ХВИЛЯ»';
    if(x<230)return 'ЦЕНТРАЛЬНИЙ ПЛЯЖ';
    if(x<300)return 'СІМЕЙНИЙ «ЗОЛОТА БУХТА»';
    return 'ПІРСОВИЙ КІНЕЦЬ';
  }
  if(y>=PROM_Y0)return 'НАБЕРЕЖНА';
  if(inRect(PORT,x,y))return PORT.name;
  if(inRect(YACHT,x,y))return YACHT.name;
  if(inRect(BRONX,x,y))return BRONX.name;
  if(inRect(PARK,x,y))return PARK.name;
  if(inRect(YOUNG,x,y))return YOUNG.name;
  if(inRect(LUNA,x,y))return LUNA.name;
  if(inRect(ANCHP,x,y))return ANCHP.name;
  if(inRect(PLAZA,x,y))return PLAZA.name;
  if(inRect(STAIRS,x,y))return STAIRS.name;
  for(const s of SPAWNS)if(IB.dist(x,y,s.x,s.y)<=9)return s.name;
  for(const b of WA.buildings){
    if(x>=b.x-2&&x<b.x+b.w+2&&y>=b.y-2&&y<b.y+b.h+2&&b.label)return b.label;
  }
  if(y<D_NORTH.y1)return (x>300?'ЮВІЛЕЙНИЙ (ПІВНІЧНИЙ МАСИВ)':D_NORTH.name);
  if(y<D_CENTER.y1)return D_CENTER.name;
  if(y<D_SOUTH.y1)return (x>280?'МІКРОРАЙОН СУДНОБУДІВНИКІВ':D_SOUTH.name);
  if(y<D_PRIM.y1)return D_PRIM.name;
  return 'ЧОРНОМОРСЬК';
}
function terrIs(x,y,t){return WA.terr[y*W+x]===t;}
WA.zoneAt=zoneAt;
WA.PARK=PARK;WA.PORT=PORT;WA.YACHT=YACHT;WA.BRONX=BRONX;WA.PIER=PIER;
WA.LUNA=LUNA;WA.ANCHP=ANCHP;WA.LIMAN=LIMAN;WA.BRIDGE=BRIDGE;WA.ZAVOD=ZAVOD;WA.PLAZA=PLAZA;
WA.isStreet=isStreet;WA.isStreetH=(x,y)=>isStreet(x,y)&&H_STREETS.some(s=>(y===s||y===s+1||(y>=PROSP_Y&&y<=PROSP_Y+3))&&x>=0&&x<W);WA.isStreetV=(x,y)=>V_STREETS.some(s=>x===s||x===s+1);WA.H_NAMES=H_NAMES;WA.V_NAMES=V_NAMES;WA.H_STREETS=H_STREETS;WA.V_STREETS=V_STREETS;
WA.PROSP_Y=PROSP_Y;WA.BEACH_Y0=BEACH_Y0;WA.BEACH_Y1=BEACH_Y1;
WA.PROM_Y0=PROM_Y0;WA.PROM_Y1=PROM_Y1;WA.SHALLOW_Y0=SHALLOW_Y0;WA.DEEP_Y0=DEEP_Y0;
WA.VILLAGES=VILLAGES;WA.CAMPS=[];WA.PEAKS=[]; /* v17.0: таборів не існує */WA.LAKE={x:220,y:510,r:24,name:'ЧОРНЕ МОРЕ'};
WA.SPAWNS=SPAWNS;
WA.CROSS=isCross;

/* МОРСЬКІ І МІСЬКІ РОЗВАГИ — панель T */
const ROUTES=[
 {id:'r_catam',kind:'sea',name:'КАТАМАРАН — ПРОГУЛЯНКА МОРЕМ',x:130,y:473,hours:2,diff:'★',cost:150,
  desc:'Педальний катамаран з гіркою. Катання вздовж берега: бризки, чайки і дельфіни часом стрибають поруч.'},
 {id:'r_par', kind:'sea',name:'ПАРАШЮТ ЗА КАТЕРОМ (ПАРАСЕЙЛІНГ)',x:182,y:498,hours:2,diff:'★★',cost:600,
  desc:'Піднімаєшся над морем на парашуті за катером. 100 метрів над хвилями — і фото групи з неба.'},
 {id:'r_boat',kind:'sea',name:'РИБАЛКА В МОРЕ (човен)',x:14,y:454,hours:3,diff:'★',cost:120,
  desc:'Вихід у море на моторному човні з яхт-клубу. Бичі, камбала, іноді пеламіда.'},
 {id:'r_liman',kind:'sea',name:'РИБАЛКА НА ЛИМАНІ',x:380,y:264,hours:2,diff:'★',cost:80,
  desc:'Лиман — тиха водойма: бички і пісочники з мосту, карась. Море сьогодні відпочиває.'},
 {id:'r_ferry',kind:'sea',name:'ПОРОМ — МОРСЬКА ПРОГУЛЯНКА',x:399,y:398,hours:4,diff:'★',cost:300,
  desc:'Екскурсійний вихід на поромі з морвокзалу: порт з води, маяк, дельфіни за бортом. Рейси — Варна, Стамбул, Поті.'},
 {id:'r_cine',kind:'city',name:'ВЕЧІРНІЙ СЕАНС У «МОРЕ-ФІЛЬМ»',x:233,y:157,hours:2,diff:'★',cost:120,
  desc:'Комедія про курорт у старому кінотеатрі центру. Попкорн, темнота і сміх на весь зал.'},
 {id:'r_museum',kind:'city',name:'МУЗЕЙ ПОРТУ І МОРЕ',x:376,y:393,hours:1,diff:'★',cost:60,
  desc:'Історія Іллічівська→Чорноморська: кораблі в пляшках, старі карти, штормові щоденники лоцманів.'},
 {id:'r_wheel',kind:'city',name:'КОЛЕСО ОГЛЯДУ — ЛУНА-ПАРК',x:128,y:162,hours:1,diff:'★',cost:80,
  desc:'Вишка панорами: з кабінки видно весь Чорноморськ — порт, пляж, лиман і море до горизонту.'},
 {id:'r_train',kind:'city',name:'ПАРОВОЗИК — МОЛОДІЖНИЙ ПАРК',x:44,y:94,hours:1,diff:'★',cost:30,
  desc:'Паровозик «Юний Данченко» катає усьим парком: свисток, дим, сміх малечі.'},
 {id:'r_zavod',kind:'city',name:'ЕКСКУРСІЯ НА СУДНОБУДІВНИЙ ЗАВОД',x:362,y:307,hours:2,diff:'★★',cost:100,
  desc:'Ворота «Паллади» з охоронцем Іваном: сліпі, стапелі, баржі на лимані. Місто тримається на них.'},
 {id:'r_club',kind:'city',name:'КЛУБ «МАЯК» — ТУСИ І РЕЙВ П\'ЯТНИЦІ',x:322,y:386,hours:3,diff:'★★',cost:150,
  desc:'Міський клуб за набережною: танцпол, діджей, хостес Марічка. У П\'ЯТНИЦІ — РЕЙВ до світанку (радіо 103.2 FM оголошує).'},
 {id:'r_odesa',kind:'city',name:'МАРШРУТКА НА ОДЕСУ (АВТОСТАНЦІЯ)',x:204,y:28,hours:5,diff:'★★',cost:200,
  desc:'Автостанція «Чорноморськ»: маршрутка в ОДЕСУ — Аркадія, Потьомкінські сходи, Приморський бульвар. Пів дня — і повернення до свого пляжу.'},
 /* v5.0 нові визначні місця */
 {id:'r_library',kind:'city',name:'МІСЬКА БІБЛІОТЕКА — ЧИТАЛЬНА ЗАЛА',x:368,y:136,hours:1,diff:'★',cost:20,
  desc:'Тиха зала з видом на парк. Морські словники, детективи, щоденники капітанів. Ідеально в спеку.'},
 {id:'r_baraboy',kind:'sea',name:'СЕРФ-ШКОЛА «ХВИЛЯ» — ПЕРШІ ХВИЛІ',x:308,y:412,hours:6,diff:'★★',cost:120,
  desc:'Урок серфінгу на Центральному пляжі: дошка, бриз, перші хвилі і падіння в пісок. Вечором — гулянка з новими серферами.'},
];
const PHOTO_SPOTS=[
 {id:'sp_pier',name:'ПІРС «ЗАХІД СОНЦЯ»',x:179,y:478,kind:'pier'},
 {id:'sp_beach',name:'ПЛЯЖ ЦЕНТРАЛЬНИЙ',x:160,y:455,kind:'beach'},
 {id:'sp_bronx',name:'БРОНКС — ДВІР',x:262,y:384,kind:'bronx'},
 {id:'sp_port',name:'ПОРТ — КРАНИ',x:376,y:372,kind:'port'},
 {id:'sp_park',name:'ПРИМОРСЬКИЙ ПАРК',x:96,y:370,kind:'park'},
 {id:'sp_lighthouse',name:'ЧОРНОМОРСЬКИЙ МАЯК',x:425,y:491,kind:'lighthouse'},
 {id:'sp_market',name:'РИНОК «ЦЕНТРАЛЬНИЙ»',x:320,y:153,kind:'market'},
 {id:'sp_yacht',name:'ЯХТ-КЛУБ — ПРИЧАЛ',x:13,y:450,kind:'yacht'},
 {id:'sp_luna',name:'ЛУНА-ПАРК — КОЛЕСО ОГЛЯДУ',x:128,y:162,kind:'lunapark'},
 {id:'sp_anchors',name:'ПАРК ЯКОРІВ',x:212,y:164,kind:'anchors'},
 {id:'sp_stairs',name:'ПРИМОРСЬКІ СХОДИ',x:210,y:422,kind:'stairs'},
 {id:'sp_liman',name:'МІСТ — СУХИЙ ЛИМАН',x:390,y:293,kind:'liman'},
 {id:'sp_zavod',name:'ЗАВОД «ПАЛЛАДА» — ВОРОТА',x:362,y:307,kind:'zavod'},
 {id:'sp_plaza',name:'ПЛОЩА — СТЕЛА «ЧОРНОМОРСЬК»',x:214,y:404,kind:'plaza'},
 {id:'sp_panel',name:'НОВІ ЖИТЛОВІ БУДИНИ ПІВНІЧНОГО МАСИВУ',x:70,y:104,kind:'panel'},
 {id:'sp_odesa',name:'ЗНАК «ОДЕСА 25 КМ»',x:80,y:14,kind:'odesa'},
 {id:'sp_bus',name:'АВТОСТАНЦІЯ «ЧОРНОМОРСЬК»',x:204,y:28,kind:'bus'},
 {id:'sp_second',name:'СЕКОНДХЕНД «АЛЬБАТРОС»',x:267,y:156,kind:'second'},
 {id:'sp_club',name:'КЛУБ «МАЯК» — НЕОН',x:322,y:386,kind:'club'},
 {id:'sp_lib',name:'МІСЬКА БІБЛІОТЕКА',x:368,y:136,kind:'village'},
 {id:'sp_gull',name:'ГОДІВНИЦЯ ЧАЙОК — НАБЕРЕЖНА',x:120,y:433,kind:'pier'},
 {id:'sp_krizh',name:'КРИЖАНІВКА — САДИ',x:60,y:22,kind:'village'},
 {id:'sp_sovin',name:'СОВІНЬЙОН — КОТЕДЖИ',x:268,y:22,kind:'village'},
];
WA.ROUTES=ROUTES;WA.PHOTO_SPOTS=PHOTO_SPOTS;
/* АДРЕСИ КВАРТИР — для телефона/ріелтора */
WA.APTS=APTS;
/* МАРШРУТКА №7 — петля по місту: пр. Миру → 12-та Лінія → вул. Курортна → 1-ша Лінія */
WA.MARSH_ROUTE={hx:[118,300],vx:[8,200]};

WA.at=(x,y)=>{if(x<0||y<0||x>=W||y>=H)return 9;return WA.terr[(y|0)*W+(x|0)];};
WA.elevAt=(x,y)=>{if(x<0||y<0||x>=W||y>=H)return 9;return WA.elev[(y|0)*W+(x|0)]||0;};
WA.propAt=(x,y)=>WA.grid.get((y|0)*W+(x|0));
WA.block=new Uint8Array(W*H);

function flowBFS(){
  const reach=new Int32Array(W*H).fill(-1);
  const sx=FLOW_SEED.x,sy=FLOW_SEED.y;
  if(!IB.walkable(sx,sy))return reach;
  const q=new Int32Array(W*H);let qh=0,qt=0;
  reach[sy*W+sx]=0;q[qt++]=sy*W+sx;
  while(qh<qt){
    const i=q[qh++],x=i%W,y=(i/W)|0,e0=WA.elev[i];
    for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){
      if(!dx&&!dy)continue;
      const ax=x+dx,ay=y+dy;
      if(ax<1||ay<1||ax>=W-1||ay>=H-1)continue;
      const j=ay*W+ax;
      if(reach[j]>=0)continue;
      if(!IB.walkable(ax,ay))continue;
      if(IB.M.abs(WA.elev[j]-e0)>1.01)continue;
      reach[j]=reach[i]+1;q[qt++]=j;
    }
  }
  return reach;
}
function flowPois(){
  const list=[];
  for(const b of WA.buildings)list.push({x:b.door.x,y:b.door.y,n:'door:'+b.type,kind:'door',rad:2,lim:1.6});
  for(const p of WA.pois)list.push({x:p.x,y:p.y,n:'poi:'+p.name,kind:'point',rad:2,lim:2.2});
  for(const s of (WA.PHOTO_SPOTS||[]))list.push({x:s.x,y:s.y,n:'photo:'+s.id,kind:'photo',rad:4,lim:3.4});
  for(const a of IB.ARTIFACTS)if(a.world)list.push({x:a.x,y:a.y,n:'art:'+a.id,kind:'point',rad:1,lim:1.6});
  return list;
}
function flowReach(reach,p){
  for(let dy=-p.rad;dy<=p.rad;dy++)for(let dx=-p.rad;dx<=p.rad;dx++){
    const x=p.x+dx,y=p.y+dy;
    if(x<1||y<1||x>=W-1||y>=H-1)continue;
    const j=y*W+x;
    if(reach[j]>=0&&IB.walkable(x,y)&&IB.dist(x,y,p.x,p.y)<=p.lim)return true;
  }
  return false;
}
function fixDoorsAndSpots(reach){
  let fixes=0;
  for(const b of WA.buildings){
    const px=b.door.x,py=b.door.y+0.5;
    let best=null,bd=1e9;
    for(let y=b.y-7;y<b.y+b.h+7;y++)for(let x=b.x-7;x<b.x+b.w+7;x++){
      if(x<1||y<1||x>=W-1||y>=H-1)continue;
      const j=y*W+x;
      if(!IB.walkable(x,y)||reach[j]<0)continue;
      const d=IB.dist(x,y,px,py);
      if(d<bd){bd=d;best={x,y};}
    }
    if(best&&bd>1.55){b.door={x:best.x,y:best.y};fixes++;}
  }
  for(const s of (WA.PHOTO_SPOTS||[])){
    if(!(s.x>0))continue;
    let best=null,bd=1e9;
    for(let dy=-6;dy<=6;dy++)for(let dx=-6;dx<=6;dx++){
      const x=s.x+dx,y=s.y+dy;
      if(x<1||y<1||x>=W-1||y>=H-1)continue;
      const j=y*W+x;
      if(!IB.walkable(x,y)||reach[j]<0)continue;
      const d=dx*dx+dy*dy;
      if(d<bd){bd=d;best={x,y};}
    }
    if(best&&bd>9){s.x=best.x;s.y=best.y;fixes++;}
  }
  return fixes;
}
function ensureMapFlow(elev,terr){
  for(let pass=0;pass<3;pass++){
    const reach=flowBFS();
    WA.reach=reach;
    fixDoorsAndSpots(reach);
    const bad=flowPois().filter(p=>{
      if(p.x<1||p.y<1||p.x>=W-1||p.y>=H-1)return false;
      return !flowReach(reach,p);
    });
    if(!bad.length){WA.flowOK=true;WA.flowBad=null;return;}
    WA.flowBad=bad.map(p=>p.n);
    for(const p of bad){
      let bt=-1,bd=1e9;
      for(let i=0;i<W*H;i+=2){
        if(reach[i]<0)continue;
        const d=IB.dist(i%W,(i/W)|0,p.x,p.y);
        if(d<bd){bd=d;bt=i;}
      }
      if(bt<0||bd>80)continue;
      const tx2=bt%W,ty2=(bt/W)|0;
      const steps=IB.M.ceil(IB.dist(p.x,p.y,tx2,ty2)*2);
      for(let i=0;i<=steps;i++){
        const t=i/steps;
        const x=IB.M.round(IB.lerp(p.x,tx2,t)),y=IB.M.round(IB.lerp(p.y,ty2,t));
        if(x<2||y<2||x>=W-2||y>=H-2)continue;
        if(terr[y*W+x]===0||terr[y*W+x]===16)continue;
        for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){
          const pr=WA.propAt(x+dx,y+dy);
          if(pr&&!['mush','flower','herb','bush','towel','lounger','trash','sandcastle','ball','sunfl','hay'].includes(pr.type)){
            const pi=WA.props.indexOf(pr);if(pi>=0)WA.props.splice(pi,1);
            WA.grid.delete((y+dy)*W+(x+dx));
          }
        }
        if(terr[y*W+x]===10){terr[y*W+x]=13;WA.block[y*W+x]=0;}
      }
    }
  }
  WA.reach=flowBFS();
  /* v5.0: фінальна верифікація — після прочисток усе досяжно? */
  const badFinal=flowPois().filter(p=>{
    if(p.x<1||p.y<1||p.x>=W-1||p.y>=H-1)return false;
    return !flowReach(WA.reach,p);
  });
  if(!badFinal.length){WA.flowOK=true;WA.flowBad=null;}
  else WA.flowBad=badFinal.map(p=>p.n);
}
IB.snapToReach=(x,y)=>{
  x=IB.M.round(x);y=IB.M.round(y);
  const R=WA.reach;
  if(!R||x<1||y<1||x>=W-1||y>=H-1)return {x:x,y:y};
  if(R[y*W+x]>=0&&IB.walkable(x,y))return {x:x,y:y};
  for(let r=1;r<=20;r++){
    let best=null,bd=1e9;
    for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++){
      if(IB.M.max(IB.M.abs(dx),IB.M.abs(dy))!==r)continue;
      const ax=x+dx,ay=y+dy;
      if(ax<1||ay<1||ax>=W-1||ay>=H-1)continue;
      const j=ay*W+ax;
      if(R[j]<0||!IB.walkable(ax,ay))continue;
      const d=dx*dx+dy*dy;
      if(d<bd){bd=d;best=j;}
    }
    if(best!==null)return {x:best%W,y:(best/W)|0};
  }
  return {x:x,y:y};
};

/* v10.0: КАРВУВАННЯ ЗАКРИТИХ ДВОРІВ — «застряг у дворі» неможливе:
   BFS від набережної; кожна прохідна кишеня, не досяжна вулицями,
   прорізається 1-смуговим ходом (прибрати пропси / прохід через двір) */
function carveSealed(terr){
  let total=0;
  for(let pass=0;pass<2;pass++){
    const reach=flowBFS();
    const bad=[];
    for(let i=0;i<W*H;i+=5){
      if(reach[i]>=0)continue;
      const x=i%W,y=(i/W)|0;
      if(!IB.walkable(x,y))continue;
      bad.push([x,y]);
    }
    if(!bad.length){break;}
    for(const [x,y] of bad){
      /* найближчий досяжний тайл (кільцями, як snapToReach) */
      let bt=null;
      for(let r=1;r<=42&&!bt;r++){
        for(let dy=-r;dy<=r&&!bt;dy++)for(let dx=-r;dx<=r;dx++){
          if(IB.M.max(IB.M.abs(dx),IB.M.abs(dy))!==r)continue;
          const ax=x+dx,ay=y+dy;
          if(ax<1||ay<1||ax>=W-1||ay>=H-1)continue;
          if(reach[ay*W+ax]>=0){bt={x:ax,y:ay};break;}
        }
      }
      if(!bt)continue;
      const steps=IB.M.ceil(IB.dist(x,y,bt.x,bt.y)*2);
      for(let s=0;s<=steps;s++){
        const t=s/steps,px=IB.M.round(IB.lerp(x,bt.x,t)),py=IB.M.round(IB.lerp(y,bt.y,t));
        if(px<2||py<2||px>=W-2||py>=H-2)continue;
        const ti=py*W+px;
        if(terr[ti]===0||terr[ti]===16)continue;
        for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){
          const pr=WA.propAt(px+dx,py+dy);
          if(pr&&!['mush','flower','herb','bush','towel','trash','sandcastle','ball','sunfl','hay'].includes(pr.type)){
            const pi=WA.props.indexOf(pr);if(pi>=0)WA.props.splice(pi,1);
            WA.grid.delete((py+dy)*W+(px+dx));
          }
        }
        if(terr[ti]===10){terr[ti]=13;WA.block[ti]=0;}
      }
      total++;
    }
  }
  WA.carved=(WA.carved||0)+total;
  return total;
}

/* щоранкове поповнення сміття на пляжі */
IB.W.spawnBeachTrash=()=>{
  const P=WA.props;
  let added=0;
  for(let i=0;i<18;i++){
    const h1=IB.hsh(i,IB.G.day,61),h2=IB.hsh(i,IB.G.day,62);
    const x=6+IB.M.floor(h1*320),y=BEACH_Y0+1+IB.M.floor(h2*(BEACH_Y1-BEACH_Y0-2));
    if(WA.at(x,y)!==1||WA.grid.has(y*W+x))continue;
    P.push({x,y,type:'trash',seed:h1});added++;
  }
  return added;
};

/* ---------- ЗАПУСК ГЕНЕРАЦЇ ---------- */
IB.genWorld=function(){
  WA.props.length=0;WA.buildings.length=0;WA.pois.length=0;
  WA.grid.clear();WA.block.fill(0);WA.built=0;
  const elev=genElev();
  const terr=new Uint8Array(W*H);
  assignTerr(terr);
  buildCity(elev,terr);
  placeApartments(terr);
  WA.elev=elev;WA.terr=terr;
  fillCityBlocks(terr);
  streetTrees(terr);   /* v6.0: бульварні дерева вздовж усіх вулиць */
  /* v5.0: ДВОРИ-ПЛИТИ — газон у місті біля будівель (±2) стає дворовим бетоном;
     чисті газони лишаються у парках, селах і зелених ядрах */
  (function(){
    const cityLawn=[];
    for(let y=CITY_Y0;y<CITY_Y1;y++)for(let x=2;x<W-2;x++){
      const i=y*W+x;
      if(terr[i]!==2)continue;
      let near=false;
      for(let dy=-2;dy<=2&&!near;dy++)for(let dx=-2;dx<=2;dx++){
        const j=(y+dy)*W+(x+dx);
        if(j>=0&&j<W*H&&terr[j]===10){near=true;break;}
      }
      if(near)cityLawn.push(i);
    }
    for(const i of cityLawn)terr[i]=17;
  })();
  scatterCity(terr);
  gridProps();
  /* v10.0: КОЛІЗІЯ ЯК У ПЕРШОЇ ЧАСТИНИ — блокуємо ТІЛЬКИ футпринт будівлі
     (без +1-кільця): двері і стіни завжди досяжні, місто прохідне */
  for(const b of WA.buildings){
    for(let y=b.y;y<b.y+b.h;y++)for(let x=b.x;x<b.x+b.w;x++){
      if(y<0||x<0||y>=H||x>=W)continue;
      WA.block[y*W+x]=1;
    }
  }
  /* v10: прибрати перешкоди з дверних тайлів (пропси могли стати на двері) */
  for(const b of WA.buildings){
    for(let dy2=0;dy2<=1;dy2++){
      const dx2=b.door.x,dy3=b.door.y+dy2;
      const p=WA.propAt(dx2,dy3);
      if(p&&['oak','tree2','pine','bench','lamp','swing','slide','bball','hbar','sandbox','busstop','dsign','mail','umb','lounger','bin','cabin','tent','beachbar'].indexOf(p.type)>=0){
        const pi=WA.props.indexOf(p);if(pi>=0)WA.props.splice(pi,1);
        WA.grid.delete(dy3*W+dx2);
      }
    }
  }
  /* v10.0: прорізати закриті двори — досяжність усього міста вулицями */
  carveSealed(terr);
  gridProps();
  pois();
  for(const a of IB.ARTIFACTS){
    if(!a.world)continue;
    let best=null,bd=1e9;
    for(let r=0;r<14&&!best;r++)for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++){
      const x=a.x+dx,y=a.y+dy;
      if(x<2||y<2||x>=W-2||y>=H-2)continue;
      const t=terr[y*W+x];
      if(t===0||t===10||t===12||t===16)continue;
      if(WA.block[y*W+x])continue;
      if(WA.propAt(x,y))continue;
      const dd=dx*dx+dy*dy;
      if(dd<bd){bd=dd;best={x,y};}
    }
    if(best){a.x=best.x;a.y=best.y;}
  }
  ensureMapFlow(elev,terr);
  WA.built=(WA.built||0)+1;
};
})();
