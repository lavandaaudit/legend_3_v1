/* VIKTOR LEGEND 2 — sprites.js: піксель-арт кодом. Герої, селяни, тварини, реквізит табору */
IB.bakeCache={};
IB.bake=(key,w,h,fn)=>{
  if(IB.bakeCache[key])return IB.bakeCache[key];
  const c=IB.mk(w,h);fn(c.g);IB.bakeCache[key]=c;return c;
};

/* ---------- ЛЮДИ: універсальний рендер — ПРОПОРЦІЇ ПЕРШОЇ ЧАСТИНИ (v5) ---------- */
/* v1.3: зріст 30px (ноги 10 + тулуб 11 + голова 7 + волосся 2), як mkPlayerFrame у v5.
   look: {skin,hair,hat,hatc,jacket,pants,beard,pack,scarf} */
IB.HATS={none:0,cap:1,straw:2,hat:3,band:4,molfar:5};
IB.drawPerson=(g,x,y,dir,fr,look,sc)=>{
  /* x,y — центр під ногами; dir: d/u/l/r; fr: 0 стоїть, 1/2 кроки; sc — масштаб (за замовч. 1) */
  if(sc&&sc!==1){g.save();g.translate(x,y);g.scale(sc,sc);g.translate(-x,-y);IB.drawPerson(g,x,y,dir,fr,look,1);g.restore();return;}
  const P=IB.P,PA=IB.PA,O=IB.O;
  const skin=look.skin||'#e8b088',hair=look.hair||'#241a10',hat=IB.HATS[look.hat||'none'],
        hatc=look.hatc||'#b84838',jk=look.jacket||'#5a6a3a',pn=look.pants||'#3a4030';
  const J=jk,Jd=IB.shade(jk,-0.3),Jl=IB.shade(jk,0.22),B=pn,Bd=IB.shade(pn,-0.2);
  /* тінь */
  g.fillStyle='#00000038';g.beginPath();g.ellipse(x,y-1,8,3,0,0,7);g.fill();
  const legH=10,torH=11;
  const legT=y-1-legH,chest=legT-torH,headY=chest-7;
  const step=fr===1?1:(fr===2?3:0);
  const bob=(step===1||step===3)?1:0;
  const bt=chest+bob;
  const d=dir==='u'?'back':(dir==='d'?'front':'side');
  /* ноги — штани + черевики, крок у 4 фазах */
  if(d==='side'){
    const str=step===1?-2:(step===3?2:0);
    P(g,x-3+str,legT,4,legH,Bd);
    P(g,x+1-str,legT,3,legH-(str?1:0),B);
    P(g,x-3+str,y-3,4,2,'#20242a');
    P(g,x+1-str,y-3,3,2,'#20242a');
  }else{
    P(g,x-4,legT+(step===1?2:0),4,legH-(step===1?2:0),B);
    P(g,x+1,legT+(step===3?2:0),4,legH-(step===3?2:0),Bd);
    P(g,x-4,y-3,4,2,'#20242a');P(g,x+1,y-3,4,2,'#20242a');
    P(g,x-4,y-3,4,1,IB.shade('#20242a',0.35));P(g,x+1,y-3,4,1,IB.shade('#20242a',0.35));
  }
  /* тулуб — куртка: тінь, блиск, блискавка, комір */
  P(g,x-5,bt,10,torH,J);
  P(g,x-5,bt,3,torH,Jd);
  P(g,x+2,bt+1,3,torH-2,Jl);
  P(g,x-1,bt,1,torH-1,Jd);
  P(g,x-5,bt,10,2,Jd);
  P(g,x-4,bt+8,3,1,'#3a3226');P(g,x+2,bt+6,2,1,'#3a3226');
  /* шкарпетка/хустка на шиї */
  if(look.scarf)P(g,x-4,bt+2,9,2,look.scarf);
  /* голова */
  O(g,x,headY+3,4,4,skin);
  P(g,x-4,headY-1,9,3,hair);
  P(g,x-4,headY-1,9,1,IB.shade(hair,0.22));
  P(g,x-4,headY+2,1,3,hair);P(g,x+3,headY+2,1,3,hair);
  if(d==='front'){P(g,x-2,headY+3,1,1,'#1a1418');P(g,x+2,headY+3,1,1,'#1a1418');P(g,x-1,headY+6,3,1,IB.shade(skin,-0.3));}
  if(d==='side'){P(g,x+1,headY+3,1,1,'#1a1418');P(g,x+3,headY+5,1,1,IB.shade(skin,-0.35));P(g,x,headY+6,3,1,IB.shade(skin,-0.3));}
  if(d==='back'){P(g,x-4,headY+1,9,5,hair);P(g,x-4,headY+1,9,1,IB.shade(hair,-0.2));}
  if(look.beard&&d!=='back'){P(g,(d==='side'?x:x-2)+(d==='side'?(dir==='l'?-3:1):0),headY+5,4,3,shadeBeard(hair));}
  /* рюкзак */
  if(look.pack){
    if(d==='back'){P(g,x-4,bt+1,9,10,'#4a3620');P(g,x-4,bt+1,9,2,'#3a2a18');P(g,x-2,bt+6,5,3,'#82928a');}
    else if(d==='side'){P(g,x-7,bt+1,3,9,'#4a3620');P(g,x-7,bt+1,3,2,'#3a2a18');
      P(g,x-2,bt+1,1,8,'#3a2a18');P(g,x+2,bt+1,1,8,'#3a2a18');}
    else{P(g,x-3,bt+1,2,8,'#3a2a18');P(g,x+2,bt+1,2,8,'#3a2a18');}
  }
  /* руки — махають у кроці */
  const armSw=step===1?1:(step===3?-1:0);
  if(d==='side'){
    P(g,x+3+armSw*2,bt+3,3,8,Jl);
    O(g,x+5+armSw*2,bt+11,1.5,1.5,skin);
    P(g,x-6,bt+3,3,8,Jd);
  }else{
    P(g,x-7,bt+2+IB.M.max(0,armSw),3,9-IB.M.max(0,armSw),Jd);
    P(g,x+5,bt+2+IB.M.max(0,-armSw),3,9-IB.M.max(0,-armSw),Jl);
    O(g,x-5,bt+11+IB.M.max(0,armSw),1.5,1.5,skin);
    O(g,x+7,bt+11+IB.M.max(0,-armSw),1.5,1.5,skin);
  }
  /* капелюхи (масштаб v5) */
  if(hat===1){P(g,x-5,headY-1,10,2,hatc);P(g,x-4,headY-3,8,2,hatc);}
  else if(hat===2){P(g,x-6,headY-1,12,1,'#c49a44');P(g,x-4,headY-3,8,2,'#d8b050');}
  else if(hat===3){P(g,x-5,headY-1,10,2,hatc);PA(g,[[x-6,headY-1],[x+6,headY-1],[x,headY-6]],hatc);}
  else if(hat===4){P(g,x-4,headY,9,2,hatc);P(g,x+3,headY+2,1,2,hatc);}
  else if(hat===5){P(g,x-6,headY-1,12,2,'#1a1628');P(g,x-4,headY-6,8,5,'#2a2438');P(g,x-5,headY-2,10,1,'#4a3e68');}
};
function shadeBeard(h){return h==='#1a120a'?'#3a3228':'#4a3e30';}

/* ---------- v18.2: ПЛАВЕЦЬ — герой ПЛАВАЄ у воді (не стоїть!) ----------
   Горизонтальне тіло по пояс у воді, ГОЛОВА над водою (мокре волосся),
   РУКИ ПЛАВУТЬ: 3 фази кролю/брасу — руки по поясу розмітають воду,
   піна і бризки навколо. dir: 'r'/'u' — вправо, 'l'/'d' — вліво. */
IB.drawSwimmer=(g,x,y,dir,fr,look)=>{
  const P=IB.P,PA=IB.PA,O=IB.O;
  const skin=look.skin||'#e8b088',hair=look.hair||'#241a10',jk=look.jacket||'#5a6a3a';
  const Jl=IB.shade(jk,0.15),Jd=IB.shade(jk,-0.25);
  const flip=(dir==='l'||dir==='d');
  const ph=(fr|0)%3;                      /* фаза гребка: 0 — руки вперед, 1 — розмітає, 2 — біля пояса */
  const bob=IB.M.sin(performance.now()*0.006+x)*1.1;
  const yy=y+bob;
  g.save();
  if(flip){g.translate(x,yy);g.scale(-1,1);g.translate(-x,-yy);}
  /* слід-хвиля позаду + піна навколо (вода малюється світом — ми додаємо рух) */
  g.fillStyle='rgba(255,255,255,0.35)';
  g.beginPath();g.ellipse(x-12,yy+1,10,2.4,0,0,7);g.fill();
  g.beginPath();g.ellipse(x+2,yy+2.5,14,3,0,0,7);g.fill();
  g.fillStyle='rgba(255,255,255,0.6)';
  g.beginPath();g.ellipse(x-6,yy+1.5,6,1.8,0,0,7);g.fill();
  /* тіло по пояс: плечі і спина над водою (куртка), решта під водою */
  P(g,x-8,yy-5,16,5,jk);                  /* верх тулуба над водою */
  P(g,x-8,yy-5,16,1.6,Jl);               /* блиск мокрої спини */
  P(g,x-8,yy-1,16,2,'rgba(10,40,60,0.45)');   /* тіло під водою — тіні */
  /* голова над водою, повернута за напрямком */
  const hx=x+9;
  O(g,hx,yy-6,4.6,4,skin);
  P(g,hx-2.6,yy-8.4,6.4,2.6,hair);       /* мокре волосся */
  P(g,hx-2.6,yy-8.4,6.4,1,hair);
  P(g,hx+1.4,yy-5,1.2,1.2,'#1a1418');    /* око */
  P(g,hx-0.4,yy-2.6,3,1,IB.shade(skin,-0.32));   /* рот */
  /* капелюх плаває поруч, якщо є */
  if(look.hat&&look.hat!=='none'){O(g,x-16,yy-1,3.4,1.8,look.hatc||'#b84838');}
  /* РУКИ ПО ПОЯС — гребок у 3 фазах */
  if(ph===0){          /* руки винесені вперед по воді */
    P(g,x+2,yy-3,7,2.4,Jl);O(g,x+9,yy-2.6,2,1.8,skin);
    P(g,x+2,yy+0.6,7,2.4,Jl);O(g,x+9,yy+1,2,1.8,skin);
  }else if(ph===1){    /* розмітає воду — руки в сторонах */
    PA(g,[[x+1,yy-4],[x+6,yy-7],[x+8,yy-4],[x+3,yy-2]],Jl);O(g,x+7,yy-7,2,1.8,skin);
    PA(g,[[x+1,yy-1],[x+6,yy+2.6],[x+8,yy-0.6],[x+3,yy+1.6]],Jl);O(g,x+7,yy+2.6,2,1.8,skin);
    g.fillStyle='rgba(255,255,255,0.5)';
    g.beginPath();g.ellipse(x+8,yy-8,3,1.4,0,0,7);g.fill();
  }else{               /* руки біля пояса — проштрихували воду */
    P(g,x-2,yy-3.4,5,2.4,Jd);O(g,x+3,yy-3,2,1.8,skin);
    P(g,x-2,yy-0.2,5,2.4,Jd);O(g,x+3,yy+0.6,2,1.8,skin);
  }
  /* ноги під водою — легкі коливання (тіні) */
  P(g,x-13,yy-1.6+((ph===1)?1:0),7,2,'rgba(10,40,60,0.35)');
  g.restore();
};

/* вигляди героїв v1.3 — персонаж з ПЕРШОЇ ЧАСТИНИ, тільки по кольору різні */
IB.LOOKS={
  viktor:{skin:'#f0a482',hair:'#3e3220',hat:'none',jacket:'#66723e',pants:'#2a3e5c',pack:true,scarf:'#c83828'},
  andriy:{skin:'#e0a878',hair:'#241a10',hat:'none',jacket:'#3e8a2e',pants:'#2e323a',pack:true},
  taras: {skin:'#d89868',hair:'#1a120a',hat:'none',jacket:'#2a6ac8',pants:'#3e4038',pack:true,beard:true},
  petro: {skin:'#f0b48c',hair:'#2a1e12',hat:'none',jacket:'#d8a028',pants:'#3a3e4c',pack:true},
  maksym:{skin:'#e8ac80',hair:'#1e1610',hat:'none',jacket:'#b83848',pants:'#2e3238',pack:true},
};
IB.lookBySeed=(seed)=>{
  const jk=[IB.PAL.b4,IB.PAL.u2,IB.PAL.rd2,IB.PAL.g5,IB.PAL.w2][IB.ri(0,4)%5];
  const hat=['none','cap','straw','hat'][IB.ri(0,3)%4];
  const hc=['#b84838','#3a4a5a','#d8b050','#5a4a68'][IB.ri(0,3)%4];
  return {skin:IB.pick(['#e8b088','#e0a878','#d89868','#f0b48c'],seed),hair:'#241a10',
    hat,jacka:0,jacket:jk,pants:'#3e4038',beard:IB.hsh(seed,3,9)<0.5,hatc:hc};
};

/* зменшена голова для HUD-портрета */
IB.drawFace=(g,look,size=46)=>{
  g.clearRect(0,0,size,size);
  P2(g,0,0,size,size,'#0e1410');
  const cx=size/2,cy=size/2+6;
  /* голова крупно */
  g.fillStyle=look.skin||'#e8b088';g.fillRect(cx-10,cy-16,20,22);
  g.fillStyle=look.hair||'#241a10';g.fillRect(cx-10,cy-20,20,7);
  g.fillRect(cx-11,cy-16,2,8);g.fillRect(cx+9,cy-16,2,8);
  g.fillStyle='#1a1418';g.fillRect(cx-6,cy-8,3,3);g.fillRect(cx+3,cy-8,3,3);
  g.fillStyle='#a86848';g.fillRect(cx-2,cy-2,5,2);
  const hat=IB.HATS[look.hat||'none'],hc=look.hatc||'#b84838';
  if(hat===1){g.fillStyle=hc;g.fillRect(cx-12,cy-22,24,4);g.fillRect(cx-10,cy-27,20,5);}
  else if(hat===2){g.fillStyle='#c49a44';g.fillRect(cx-14,cy-22,28,3);g.fillStyle='#d8b050';g.fillRect(cx-10,cy-28,20,6);}
  else if(hat===3){g.fillStyle=hc;g.fillRect(cx-12,cy-22,24,3);g.beginPath();g.moveTo(cx-14,cy-19);g.lineTo(cx,cy-31);g.lineTo(cx+14,cy-19);g.fill();}
  else if(hat===4){g.fillStyle=hc;g.fillRect(cx-10,cy-21,20,5);}
  else if(hat===5){g.fillStyle='#1a1628';g.fillRect(cx-14,cy-24,28,4);g.fillStyle='#2a2438';g.fillRect(cx-9,cy-30,18,7);}
  if(look.beard){g.fillStyle=shadeBeard(look.hair||'#241a10');g.fillRect(cx-8,cy+4,16,6);}
  if(look.scarf){g.fillStyle=look.scarf;g.fillRect(cx-12,cy+6,24,7);}
  else{g.fillStyle=look.jacket||'#5a6a3a';g.fillRect(cx-12,cy+6,24,10);}
  if(look.pack){g.fillStyle='#4a3620';g.fillRect(cx-2,cy+7,5,9);}
};
function P2(g,x,y,w,h,c){g.fillStyle=c;g.fillRect(x|0,y|0,w|0,h|0);}

/* ---------- ТВАРИНИ ---------- */
IB.drawDog=(g,x,y,dir,fr,tint)=>{
  g.fillStyle='#00000030';g.beginPath();g.ellipse(x,y-1,6,2,0,0,7);g.fill();
  const c=tint||'#a87848',cd=IB.shade(c,-0.25);
  const lw=fr===1?-1:(fr===2?1:0);
  IB.P(g,x-6,y-4,2,4,cd);IB.P(g,x+4,y-4,2,4,cd);
  IB.P(g,x-5,y-7,10,4,c);
  if(dir==='r'){IB.P(g,x+3,y-10,4,4,c);IB.P(g,x+5,y-8,1,1,'#1a1418');IB.P(g,x+6,y-11,1,2,cd);}
  else if(dir==='l'){IB.P(g,x-7,y-10,4,4,c);IB.P(g,x-6,y-8,1,1,'#1a1418');IB.P(g,x-7,y-11,1,2,cd);}
  else{IB.P(g,x-3,y-10,6,4,c);IB.P(g,x-2,y-8,1,1,'#1a1418');IB.P(g,x+1,y-8,1,1,'#1a1418');}
  IB.P(g,x-8+lw,y-8,2,3,c); /* хвіст */
};
IB.drawSheep=(g,x,y,fr,dark)=>{
  const w=dark?'#c8ccd4':'#e8e8e0',wd=IB.shade(w,-0.15);
  g.fillStyle='#00000030';g.beginPath();g.ellipse(x,y-1,7,2.5,0,0,7);g.fill();
  IB.P(g,x-4,y-3,2,3,'#3a3830');IB.P(g,x+2,y-3,2,3,'#3a3830');
  IB.O(g,x,y-6,6,4,w);IB.O(g,x-1,y-7,4,3,wd);
  IB.O(g,x+5,y-8,3,2.5,'#3a3830');
  IB.P(g,x+6,y-9,1,1,'#1a1418');
};
IB.drawGoat=(g,x,y,fr)=>{
  const c='#9aa0a8';
  g.fillStyle='#00000030';g.beginPath();g.ellipse(x,y-1,7,2.5,0,0,7);g.fill();
  IB.P(g,x-4,y-4,2,4,'#7a8088');IB.P(g,x+2,y-4,2,4,'#7a8088');
  IB.O(g,x,y-7,6,3.5,c);
  IB.O(g,x+5,y-10,3,2.5,'#8a9098');
  IB.PA(g,[[x+5,y-12],[x+4,y-15],[x+7,y-12]],'#d8d0c0');
  IB.P(g,x+6,y-10,1,1,'#1a1418');
};
IB.drawBear=(g,x,y,fr,dir)=>{
  const c='#5a4428',cd=IB.shade(c,-0.2);
  g.fillStyle='#00000038';g.beginPath();g.ellipse(x,y-1,10,3,0,0,7);g.fill();
  const lw=fr===1?-1:1;
  IB.P(g,x-8,y-6,3,6,cd);IB.P(g,x+5,y-6,3,6,cd);
  IB.O(g,x,y-11,10,7,c);
  IB.O(g,x+(dir==='l'?-8:8),y-16,5,4.5,cd);
  IB.O(g,x+(dir==='l'?-10:10),y-18,2,2,'#3a2c18'); /* вухо */
  IB.P(g,x+(dir==='l'?-12:9),y-17,2,2,'#1a1418');
  IB.P(g,x+(dir==='l'?-13:9),y-13,3,2,'#2a2018');
};

/* ---------- ПРЕДМЕТИ-СПРАЙТИ (для панелей) ---------- */
IB.icon=(kind)=>{
  return IB.bake('ic_'+kind,26,22,(g)=>{
    const P=IB.P;
    switch(kind){
      case 'wood':P(g,4,10,18,5,'#7a5e38');P(g,4,10,18,2,'#96784e');P(g,5,15,2,2,'#5e4628');P(g,19,15,2,2,'#5e4628');break;
      case 'berry':P(g,8,8,5,5,'#b82840');P(g,13,11,5,5,'#d84058');P(g,10,4,2,4,'#3a6a3a');P(g,13,7,2,4,'#3a6a3a');break;
      case 'mushroom':P(g,7,7,10,4,'#c85048');P(g,8,5,8,3,'#d86058');P(g,11,11,4,7,'#e8dcc8');P(g,9,7,2,1,'#f0e8e0');P(g,14,8,2,1,'#f0e8e0');break;
      case 'trip':P(g,7,6,12,5,'#b06ae0');P(g,9,4,8,3,'#c88af0');P(g,11,11,4,8,'#e8d8f0');P(g,12,7,2,1,'#40e0d0');P(g,15,8,1,2,'#40e0d0');break;
      case 'fish':IB.PA(g,[[3,11],[12,6],[21,11],[12,16]],'#6a8a98');IB.PA(g,[[21,11],[25,7],[25,15]],'#5a7888');P(g,8,10,2,2,'#1a2028');break;
      case 'herb':P(g,12,8,2,10,'#3a6a3a');P(g,9,10,4,2,'#486036');P(g,14,12,4,2,'#486036');P(g,10,6,3,3,'#e8d050');break;
      case 'bread':IB.O(g,13,12,8,5,'#c89050');P(g,7,10,3,1,'#a87038');P(g,15,8,4,1,'#a87038');break;
      case 'brinza':IB.O(g,13,12,8,5,'#f0ecd8');P(g,9,10,2,1,'#d8d0b0');P(g,15,12,2,1,'#d8d0b0');break;
      case 'beer':P(g,9,6,8,12,'#d8a834');P(g,10,7,6,3,'#f0e0a0');P(g,9,6,8,2,'#8a8878');break;
      case 'vodka':P(g,11,5,4,13,'#c8dce0');P(g,11,4,4,2,'#8a9aa0');P(g,12,8,2,6,'#e8f4f8');break;
      case 'nalyva':P(g,9,7,8,10,'#a84868');P(g,10,8,6,8,'#c86080');P(g,11,4,4,4,'#8a9aa0');break;
      case 'potato':IB.O(g,10,12,5,4,'#b89058');IB.O(g,17,11,4,3,'#a88048');P(g,9,10,1,1,'#5e4628');break;
      case 'water':IB.PA(g,[[8,5],[16,5],[18,17],[6,17]],'#38b8d8');P(g,10,8,4,6,'#70d0e0');break;
      case 'egg':IB.O(g,13,12,5,6,'#f0e8d8');P(g,11,9,2,2,'#d8ccb0');break;
      case 'cheese':IB.PA(g,[[5,15],[13,8],[21,15]],'#e8c050');P(g,11,12,2,2,'#c8a030');break;
      case 'kvb':P(g,8,6,10,11,'#5e4628');P(g,9,7,8,9,'#7a5e38');P(g,11,4,4,3,'#4e3a20');break;
      case 'meat':IB.O(g,11,12,6,4,'#c85848');IB.P(g,16,10,6,3,'#e8d8c0');break;
      case 'soup':IB.PA(g,[[6,9],[20,9],[17,18],[9,18]],'#8a6a42');IB.O(g,13,9,7,2.5,'#e8dcc8');IB.O(g,12,9,1.5,1,'#486036');break;
      case 'art':P(g,12,4,3,3,'#f0d050');P(g,10,7,7,7,'#e0a830');P(g,12,9,3,3,'#f0d050');P(g,12,14,2,5,'#b87038');break;
      case 'tent':IB.PA(g,[[4,18],[13,4],[22,18]],'#3a6a4a');IB.PA(g,[[10,18],[13,10],[16,18]],'#1e4228');break;
      case 'axe':P(g,10,6,4,4,'#c8d0d8');IB.PA(g,[[9,5],[15,5],[13,10],[9,9]],'#9aa4ac');P(g,12,9,2,10,'#7a5e38');break;
      case 'rod':P(g,6,4,2,14,'#7a5e38');IB.PA(g,[[7,5],[18,10],[7,10]],'#c8d0d8');break;
      case 'salt':P(g,9,7,8,10,'#e8e8e0');P(g,10,8,6,8,'#f4f4f4');P(g,11,4,4,4,'#8a9aa0');break;
      case 'sf':IB.PA(g,[[8,4],[18,4],[20,18],[6,18]],'#e8d8a0');P(g,10,7,6,8,'#d8c888');P(g,11,9,1,4,'#6a5a20');P(g,14,9,1,4,'#6a5a20');P(g,12,15,3,1,'#6a5a20');break;
    }
  });
};
