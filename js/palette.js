/* VIKTOR LEGEND 2: KARPATY — palette + pixel-bake helpers (continuation of IBONARIUM engine) */
window.IB = {};
IB.M = Math;
IB.rnd = (a,b)=>a+IB.M.random()*(b-a);
IB.ri  = (a,b)=>IB.M.floor(a+IB.M.random()*(b-a+1));
IB.clamp=(v,a,b)=>v<a?a:(v>b?b:v);
IB.lerp=(a,b,t)=>a+(b-a)*t;
IB.dist=(ax,ay,bx,by)=>IB.M.hypot(bx-ax,by-ay);
IB.hsh=(x,y,s=0)=>{let h=(x*374761393+y*668265263+s*1274126177)|0;h=((h^(h>>13))*1274126177)|0;h=(h^(h>>>16))>>>0;return h/4294967296;};
IB.pick=(arr,seed)=>arr[IB.M.floor((seed!==undefined?IB.hsh(seed,7,3):IB.M.random())*arr.length)%arr.length];

IB.mk = (w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');g.imageSmoothingEnabled=false;c.g=g;return c;};

/* КУРОРТНА палітра: море, пісок, пальми, газони, лиман */
IB.PAL = {
  blk:'#000000', d01:'#0e120e', d02:'#1a201a', d03:'#28302a',
  gr1:'#5e6a5e', gr2:'#82928a', gr3:'#9aa8a0', gr4:'#b8c4bc', gr5:'#d4dcd6', wht:'#eceff0',
  sk1:'#f0a482', sk2:'#d88c66', sk3:'#b87050',
  /* трава/газон — соковита, курортна */
  g1:'#2a3a22', g2:'#384c2c', g3:'#486036', g4:'#58723e', g5:'#6a8448', g6:'#7e9454',
  ol1:'#4c6232', ol2:'#667a3e',
  /* лісова підстилка */
  f1:'#243018', f2:'#32402a', f3:'#3e4e34',
  /* смуга — хвоя */
  p1:'#16321e', p2:'#1e4228', p3:'#265232', p4:'#2e623c',
  /* скеля/камінь */
  c1:'#3e4440', c2:'#58605a', c3:'#6e7872', c4:'#88928c',
  /* сніг */
  sn1:'#c8d8e4', sn2:'#dce8f0', sn3:'#f0f6f8',
  /* стежки/ґрунт */
  r1:'#6a4a2c', r2:'#8a6038', r3:'#a87848', r4:'#c49058',
  /* дерево-будівля: дерево, гонт, стіни */
  b1:'#4e3a20', b2:'#6e5230', b3:'#8a6a42', b4:'#a68754',
  w1:'#5e4628', w2:'#7a5e38', w3:'#96784e',
  /* дахи — гон т/ бляха */
  rf1:'#5a3420', rf2:'#7a4630', rf3:'#9a5c3e', rf4:'#b87452',
  /* вода — гірська, прозора бірюза */
  a1:'#16323a', a2:'#1e4450', a3:'#28565f', a4:'#3a6c74',
  y1:'#7a5e18', y2:'#b08624', y3:'#d8a834', y4:'#f0bc42',
  u1:'#2a3e5c', u2:'#5c78a4', u3:'#708cb8',
  /* вода річки */
  rd1:'#7c2820', rd2:'#b84840', rd3:'#cc6252',
  zd:'#5cb878', zd2:'#489a60', zd3:'#7ccc8e',
  t1:'#4c4e56', t2:'#5e6068', t3:'#8a8c94',
  m1:'#44484f', m2:'#5c6068', m3:'#848892', m4:'#b4b8c0',
  n1:'#101422', n2:'#1a2030', n3:'#263044',
  sa1:'#9e8c62', sa2:'#b4a074', sa3:'#c8b888',
  mn1:'#8a8c94', mn2:'#9a9ca4',
  or1:'#e07038',
  /* ягоди/квіти */
  be1:'#b82840', be2:'#d84058', be3:'#2a3a8c', be4:'#4050b8',
  fl1:'#e8d050', fl2:'#c85078', fl3:'#9a70d0',
  /* магія/артефакти/тріп */
  mg1:'#40e0d0', mg2:'#70f0e0', mg3:'#b06ae0', mg4:'#e0a0f0',
  trip1:'#ff5a9e', trip2:'#50e8b0', trip3:'#5aa0ff', trip4:'#ffe14e',
  /* sea colors i3 — Чорне море, пісок, асфальт, пальми */
  sea1:'#163a4c', sea2:'#1e5464', sea3:'#2a6a78', sea4:'#3a8494',
  foam:'#eef7f8', sand1:'#c8b078', sand2:'#d4c088', sand3:'#e0cc98',
  asp1:'#3e4244', asp2:'#4a4e50', asp3:'#54585a',
  prom1:'#b8a880', prom2:'#c4b48c', prom3:'#a89870',
  palm1:'#3e7a34', palm2:'#4e9440', trunk1:'#8a6a48',
};

IB.P = (g,x,y,w,h,c)=>{g.fillStyle=c;g.fillRect(x|0,y|0,w|0,h|0);};
IB.PA = (g,pts,c)=>{g.fillStyle=c;g.beginPath();g.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length;i++)g.lineTo(pts[i][0],pts[i][1]);g.closePath();g.fill();};
IB.O = (g,x,y,rx,ry,c)=>{g.fillStyle=c;g.beginPath();g.ellipse(x,y,rx,ry,0,0,7);g.fill();};
IB.speck=(g,x,y,w,h,c,n,seed=0)=>{for(let i=0;i<n;i++){const px=x+IB.hsh(i,seed,1)*w,py=y+IB.hsh(i,seed,2)*h;g.fillStyle=c;g.fillRect(px|0,py|0,1,1);}};
IB.shade=(hex,f)=>{
  const n=parseInt(hex.slice(1),16),r=(n>>16)&255,g=(n>>8)&255,b=n&255;
  const t=f>0?255:0,p=IB.M.abs(f);
  const m=v=>IB.M.round(IB.lerp(v,t,p));
  return '#'+((IB.clamp(m(r),0,255)<<16)|(IB.clamp(m(g),0,255)<<8)|IB.clamp(m(b),0,255)).toString(16).padStart(6,'0');
};
IB.rhomb=(g,x,y,w,h,c)=>{IB.PA(g,[[x,y+h/2],[x+w/2,y],[x+w,y+h/2],[x+w/2,y+h]],c);};
IB.isoBox=(g,x,y,w,d,hh,ct,cl,cr)=>{
  IB.PA(g,[[x,y+d/2],[x+w/2,y],[x+w,y+d/2],[x+w/2,y+d]],ct);
  IB.PA(g,[[x,y+d/2],[x+w/2,y+d],[x+w/2,y+d+hh],[x,y+d/2+hh]],cl);
  IB.PA(g,[[x+w/2,y+d],[x+w,y+d/2],[x+w,y+d/2+hh],[x+w/2,y+d+hh]],cr);
};

/* час/доба */
IB.DAY_LEN=480;              /* 480 c = 24 ігрові години (1 год = 20 с) */
/* v19.0: ФАЗИ НОЧІ — гравець: «ніч роби фази; дуже темна ніч; більш
   світліші; зараз як вечір — не відчувається атмосфери і переходу ніч/день».
   Багатоступенева крива: вечір м'яко темніє → захід → сутінки → НІЧ
   наростає → ГЛИБОКА НІЧ (пік 23:00-03:30, найтемніше) → передранок
   трохи світлішає → світанок. Кожна фаза має свій колір/банер (gfx/sys). */
IB.nightFactor=function(t){
  const h=(t===undefined?IB.G.t:t)%24;
  if(h<3.5)return 1;                          /* глибока ніч — пік темряви */
  if(h<5.5)return 1-(h-3.5)/2*0.12;           /* передранок — трохи світлішає */
  if(h<8)return 0.88-(h-5.5)/2.5*0.88;        /* світанок 5:30-8:00 */
  if(h<17)return 0;                           /* день */
  if(h<18.5)return (h-17)/1.5*0.22;           /* вечір — м'яко темніє */
  if(h<20)return 0.22+(h-18.5)/1.5*0.33;      /* захід сонця */
  if(h<21.5)return 0.55+(h-20)/1.5*0.30;      /* сутінки */
  return IB.M.min(1,0.85+(h-21.5)/1.5*0.15);  /* ніч наростає до піку */
};
/* v19.0: ГЛИБОКА НІЧ — окремий множник темряви 0..1: наростає 23:00-24:00,
   пік до 02:30, спадає до 03:50. Поверх nf додає синьо-чорну темряву,
   яскравіші зорі і ореол місяця (gfx.js). */
IB.deepNight=function(t){
  const h=(t===undefined?IB.G.t:t)%24;
  if(h>=23)return IB.M.min(1,h-23);
  if(h<2.5)return 1;
  if(h<3.8)return 1-(h-2.5)/1.3;
  return 0;
};
/* v19.0: ФАЗА ДОБИ — назва + іконка (HUD-чип, банери на зміні фази) */
IB.dayPhase=function(t){
  const h=(t===undefined?IB.G.t:t)%24;
  if(h<3.8)return {id:'deep',icon:'🌚',name:'ГЛИБОКА НІЧ'};
  if(h<5.5)return {id:'predawn',icon:'🌫️',name:'ПЕРЕДРАНОК'};
  if(h<8)return {id:'dawn',icon:'🌅',name:'СВІТАНОК'};
  if(h<11)return {id:'morning',icon:'🌤️',name:'РАНОК'};
  if(h<16)return {id:'noon',icon:'☀️',name:'ПОЛУДЕНЬ'};
  if(h<18.5)return {id:'late',icon:'🌞',name:'ПІЗНИЙ ДЕНЬ'};
  if(h<20)return {id:'sunset',icon:'🌇',name:'ЗАХІД СОНЦЯ'};
  if(h<21.5)return {id:'dusk',icon:'🌆',name:'СУМЕРКИ'};
  return {id:'night',icon:'🌙',name:'НІЧ'};
};
/* v1.4: ЗОЛОТА ГОДИНА — 0..1, пік о 6:25 ранку і 19:45 вечора (тепле світло) */
IB.goldenHour=function(t){
  const h=(t===undefined?IB.G.t:t)%24;
  const m=IB.M.max(0,1-Math.abs(h-6.25)/1.15);
  const e=IB.M.max(0,1-Math.abs(h-19.75)/1.6);
  return IB.M.max(m,e);
};
IB.clockStr=function(t){
  const h=(t===undefined?IB.G.t:t)%24;
  const hh=IB.M.floor(h),mm=IB.M.floor((h-hh)*60);
  return (hh<10?'0':'')+hh+':'+(mm<10?'0':'')+mm;
};
IB.hStr=function(){const h=IB.G.t%24;return IB.M.floor(h);};
