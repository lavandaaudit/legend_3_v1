/* VIKTOR LEGEND 2 — gfx.js: ізо-рендер світу, погода, ніч/вогонь, тріп-фх, мінімапа і велика карта */
IB.GFX={cam:{x:66,y:118},shake:0};
IB.tripFx=[];
IB.weatherP=[];

const T_COL={};
function terrCols(){
  const P=IB.PAL;
  T_COL[0]=[P.a2,P.a3,P.a4];           /* вода */
  T_COL[1]=[P.sa1,P.sa2,P.sa3];        /* берег */
  T_COL[2]=[P.g4,P.g5,P.g3];           /* луга */
  T_COL[3]=[P.f2,P.f3,P.f1];           /* ліс */
  T_COL[4]=[P.c2,P.c3,P.c1];           /* скеля */
  T_COL[5]=[P.sn1,P.sn2,P.sn3];        /* сніг */
  T_COL[7]=[P.r2,P.r3,P.r1];           /* стежка */
  T_COL[8]=[P.g2,P.g3,P.g4];           /* загін */
  T_COL[9]=[P.r3,P.r4,P.r2];           /* вулиця */
  T_COL[10]=[P.g3,P.g4,P.g2];          /* під забудовою */
  /* i3-gfx-patch: курорт */
  T_COL[12]=['#4a4e50','#54585a','#3e4244']; /* асфальт */
  T_COL[13]=['#b8a880','#c4b48c','#a89870']; /* набережна — плитка */
  T_COL[14]=[P.b3,P.b4,P.w2];                /* настил пірса/мосту */
  /* v2.0: Приморські сходи і Сухий лиман */
  T_COL[15]=['#c4b090','#cdbc9c','#b8a488']; /* сходи */
  T_COL[16]=['#3e7a5e','#488868','#356a52']; /* лиман — тиха вода */
}
terrCols();

/* ================= i3-gfx5: ПЕЧЕНІ ТАЙЛИ В СТИЛІ КИЄВА (пер. 1) =================
   Багаті тайли як у ПЕРШІЙ ЧАСТИНІ: асфальт з розміткою і латками, тротуарні
   плити, дворовий бетон, газон з конюшиною, пісок з мушлями, плитка
   набережної, сходи, настил пірса, ЗЕБРА переходів. Асети — у 2 рази більше. */
IB.TILES={};
IB.tileFor=(t,tx,ty)=>{
  const T=IB.TILES;if(!T.ready)return null;
  let set=null;
  if(t===12){
    /* v10: розмітка тільки по ЦЕНТРОВІЙ смузі кожної вулиці (як у ч.1):
       вулиця 3 смуги → пунктир на середній; проспект 5 смуг → два проїзди
       (смуги +1 і +3) з пунктиром, роздільна (+2) — чистий асфальт */
    let mid=false;
    if(IB.W.isStreetV&&IB.W.isStreetV(tx,ty)){
      const VS=IB.W.V_STREETS||[];
      for(const sx of VS)if(tx>=sx&&tx<=sx+2){mid=(tx===sx+1);break;}
      set=mid?T.av:T.a;
    }
    else if(ty>=IB.W.PROSP_Y&&ty<=IB.W.PROSP_Y+4){
      set=(ty===IB.W.PROSP_Y+1||ty===IB.W.PROSP_Y+3)?T.ah:T.a;
    }
    else{
      const HS=IB.W.H_STREETS||[];
      for(const sy of HS)if(ty>=sy&&ty<=sy+2){mid=(ty===sy+1);break;}
      set=mid?T.ah:T.a;
    }
  }
  else if(t===19)set=T.z;
  else if(t===17)set=T.cw;
  else if(t===13)set=T.pl;
  else if(t===15)set=T.st;
  else if(t===14)set=T.pd;
  else if(t===1)set=T.sa;
  else if(t===2)set=T.gr;
  else if(t===3)set=T.pk;
  else if(t===7)set=T.pt;
  else if(t===16)set=T.lm;
  if(!set)return null;
  /* v10-фікс: індекс варіанта тайла — ЦІЛИЙ (hsh%len давав дріб — усі
     печені тайли валилися у фолбек-клітку, тому «дизайн доріг не ок») */
  return set[IB.M.floor(IB.hsh(tx,ty,91)*set.length)%set.length];
};
(function(){
  function tile(fn,n){const out=[];for(let v=0;v<(n||1);v++){const c=IB.mk(32,16),g=c.g;g.save();g.beginPath();g.moveTo(16,0);g.lineTo(32,8);g.lineTo(16,16);g.lineTo(0,8);g.closePath();g.clip();fn(g,v);g.restore();out.push(c);}return out;}
  const G=(g,base,base2,seed,s2)=>{IB.rhomb(g,0,0,32,16,base);IB.speck(g,0,0,32,16,base2,30,seed);if(s2)IB.speck(g,0,0,32,16,s2,10,seed+3);};
  /* АСФАЛЬТ в стилі ПЕРШОЇ ЧАСТИНИ (legend_v5): суцільна поздовжня смуга
     з ЖОВТИМ штрих-пунктиром, крайові лінії, латки, тріщини */
  IB.TILES.ah=tile((g,v)=>{G(g,'#46484a','#54565a',v,3);
    IB.P(g,0,7,32,1,'rgba(225,225,210,0.45)');
    IB.P(g,3,7,5,1,'#d8b838');IB.P(g,13,7,5,1,'#d8b838');IB.P(g,23,7,5,1,'#d8b838');
    IB.P(g,0,1,32,1,'rgba(205,205,195,0.25)');IB.P(g,0,14,32,1,'rgba(205,205,195,0.25)');
    g.strokeStyle='#34363a';g.beginPath();g.moveTo(5+v*4,3);g.lineTo(9+v*4,7);g.lineTo(7+v*4,12);g.stroke();
    IB.P(g,12+v*6,10,6,2,'#3e4042');IB.speck(g,0,0,32,16,'#3a3c3e',9,v+7);
    if(v%2)IB.P(g,18,2,7,2,'#4a4c4e');},4);
  /* поперечна ЛІНІЯ — розмітка впоперек (жовтий пунктир по вертикалі) */
  IB.TILES.av=tile((g,v)=>{G(g,'#46484a','#54565a',v+11,3);
    IB.P(g,15,0,1,16,'rgba(225,225,210,0.45)');
    IB.P(g,15,1,1,5,'#d8b838');IB.P(g,15,9,1,5,'#d8b838');
    IB.P(g,1,0,1,16,'rgba(205,205,195,0.22)');IB.P(g,30,0,1,16,'rgba(205,205,195,0.22)');
    g.strokeStyle='#34363a';g.beginPath();g.moveTo(4,3+v);g.lineTo(20,7+v);g.stroke();
    IB.speck(g,0,0,32,16,'#3a3c3e',8,v+9);},3);
  IB.TILES.a=tile((g,v)=>{G(g,'#46484a','#54565a',v+21,3);
    g.strokeStyle='#3a3c3e';g.beginPath();g.moveTo(8,4);g.lineTo(14,9);g.lineTo(11,13);g.stroke();
    IB.P(g,20,3,5,2,'#4a4c4e');IB.speck(g,0,0,32,16,'#3a3c3e',9,v+13);},3);
  /* ЗЕБРА пішохідного переходу */
  IB.TILES.z=tile(g=>{IB.rhomb(g,0,0,32,16,'#4a4c4e');
    for(let i=0;i<5;i++){const xx=2+i*6;
      IB.PA(g,[[xx,8],[xx+7,4.5],[xx+7,11.5],[xx,8]],'rgba(238,238,230,0.8)');
      IB.PA(g,[[xx+1.5,8],[xx+5.5,5.6],[xx+5.5,10.4],[xx+1.5,8]],'rgba(238,238,230,0.8)');}
    IB.speck(g,0,0,32,16,'#3a3c3e',7,5);},1);
  /* ТРОТУАР/ДВІР — бетонні плити зі швами */
  IB.TILES.cw=tile((g,v)=>{G(g,'#9a9a92','#a8a8a0',v+31);
    IB.P(g,0,8,32,1,'#8a8a82');IB.P(g,16,0,1,8,'#8a8a82');IB.P(g,8,8,1,8,'#8a8a82');IB.P(g,24,8,1,8,'#8a8a82');
    IB.P(g,4+v*5,3,3,1,'#8f8f88');IB.P(g,19,11+v,4,1,'#909088');
    IB.speck(g,0,0,32,16,'#8a8a82',10,v+17);
    if(v%2)IB.P(g,10,4,2,2,'#7e7e76');},3);
  /* ГАЗОН міський — конюшина, купки */
  IB.TILES.gr=tile((g,v)=>{G(g,'#4e7032','#5c803e',v+41,'#6a9048');
    for(let i=0;i<4;i++){const x=3+(IB.hsh(i,v,43)*26)|0,y=2+(IB.hsh(i,v,44)*11)|0;IB.P(g,x,y,2,1,'#6a9048');IB.P(g,x+1,y+1,1,1,'#7aa05a');}
    if(v%2){IB.P(g,9,5,2,2,'#5c9048');IB.P(g,22,9,2,2,'#5c9048');}},3);
  IB.TILES.pk=tile((g,v)=>{G(g,'#4e7032','#5c803e',v+51,'#6a9048');
    const fl=['#e8c050','#e07a9a','#f0f0e0'][v%3];
    for(let i=0;i<5;i++){IB.P(g,4+(IB.hsh(i,v,45)*24)|0,3+(IB.hsh(i,v,46)*9)|0,1,1,fl);}},3);
  /* ПІСОК — мушлі, сліди */
  IB.TILES.sa=tile((g,v)=>{G(g,'#c8b488','#d4c494',v+61,'#dccca0');
    if(v%2){IB.O(g,8,6,3,2,'#e0d0a8');IB.O(g,20,10,2.5,2,'#e0d0a8');}
    IB.P(g,12+v*3,4,4,1,'#bca878');
    for(let i=0;i<3;i++){IB.P(g,6+i*9,11-(i%2),1,1,'#a89468');}},3);
  /* ПЛИТКА НАБЕРЕЖНОЇ */
  IB.TILES.pl=tile((g,v)=>{G(g,'#b8a880','#c4b48c',v+71);
    IB.P(g,0,8,32,1,'#a89870');IB.P(g,11,0,1,16,'#a89870');IB.P(g,22,8,1,8,'#a89870');
    IB.P(g,5,3,4,1,'#aca084');IB.speck(g,0,0,32,16,'#a89870',8,v+19);},2);
  /* СХОДИ */
  IB.TILES.st=tile(g=>{IB.rhomb(g,0,0,32,16,'#c4b090');
    for(let i=0;i<4;i++){IB.P(g,0,3+i*3,32,1,'#a89874');IB.P(g,0,4+i*3,32,1,'#d4c4a4');}
    IB.speck(g,0,0,32,16,'#a89874',6,3);},1);
  /* НАСТИЛ — дошки */
  IB.TILES.pd=tile((g,v)=>{G(g,'#a68754','#b29460',v+81);
    for(let i=0;i<4;i++){IB.P(g,0,2+i*4,32,1,'#8a7044');}
    IB.P(g,6+v*8,0,1,16,'#8a7044');IB.speck(g,0,0,32,16,'#8a7044',6,v+23);},2);
  IB.TILES.pt=tile((g,v)=>{G(g,'#8a7044','#98805a',v+91);
    IB.speck(g,0,0,32,16,'#7a6438',10,v+29);},1);
  IB.TILES.lm=tile((g,v)=>{IB.rhomb(g,0,0,32,16,'#3e7a5e');
    IB.P(g,4+v*4,6,7,1,'#4e8a6e');IB.P(g,14,10,6,1,'#549274');
    IB.speck(g,0,0,32,16,'#356a52',8,v+31);},2);
  IB.TILES.ready=true;
})();

function tileScreen(tx,ty){
  return {x:(tx-ty)*16, y:(tx+ty)*8};
}
/* v11: розміри екрану гри (канва сама розгортається під аспект екрана — fitCanvas у main.js) */
function VW(){return (IB.GFX&&IB.GFX.VW)||480;}
function VH(){return (IB.GFX&&IB.GFX.VH)||336;}

/* ---------- ГОЛОВНИЙ РЕНДЕР СВІТУ ---------- */
IB.renderWorld=(g,dt)=>{
  const W=IB.W,cam=IB.GFX.cam;
  const L=IB.E.team[0];
  const CVW=VW(),CVH=VH();
  if(!L){g.fillStyle='#0a1420';g.fillRect(0,0,CVW,CVH);return;} /* v3.0: guard */
  /* камера за лідером */
  cam.x=IB.lerp(cam.x,L.x,IB.M.min(1,dt*4));
  cam.y=IB.lerp(cam.y,L.y,IB.M.min(1,dt*4));
  const cx=(cam.x-cam.y)*16, cy=(cam.x+cam.y)*8-(cam.h||0)*10;
  /* v18: ТРЯСІННЯ КАМЕРИ тепер РЕАЛЬНЕ (шторм/битки/жахи ставлять
     IB.GFX.shake — раніше змінна була write-only) + пан-свінг
     кінематографічних сцен (IB.cine) */
  if(IB.GFX.shake>0)IB.GFX.shake=IB.M.max(0,IB.GFX.shake-dt*1.5);
  const _shk=(IB.GFX.shake||0)*((IB.SET&&IB.SET.shake===false)?0:1);
  const _pnx=(IB.cine&&IB.cine.active)?IB.M.sin(performance.now()*0.0006)*10:0;
  const _pny=(IB.cine&&IB.cine.active)?IB.M.cos(performance.now()*0.0004)*4:0;
  const ox=CVW/2-cx+(_shk>0?IB.rnd(-_shk*7,_shk*7):0)+_pnx;
  const oy=CVH/2-cy-20+(_shk>0?IB.rnd(-_shk*5,_shk*5):0)+_pny;

  g.fillStyle='#0a0f0a';g.fillRect(0,0,CVW,CVH);

  /* видимий діапазон тайлів — v11: масштабується з розміром канви
     (та сам запас на висоту будівель, що й у 480×336) */
  const txr=IB.M.ceil(CVW/32)+12, tyr=IB.M.ceil(CVH/32)+16;
  const tx0=IB.M.floor(cam.x-txr),tx1=IB.M.ceil(cam.x+txr);
  const ty0=IB.M.floor(cam.y-tyr),ty1=IB.M.ceil(cam.y+tyr);

  const nf=IB.nightFactor();
  const snowCap=false; /* i3: на курорті снігу не буває */

  /* v18: ПРИЛИВ — рівень моря циклічно ходить на пісок (цикл ~6 ігр.год).
     tideY — поточний край води: при повному приливі море займає 3 ряди
     пляжу, при відливі — звична межа; смуга мокрого піску слідує за ним. */
  const tideY=IB.tideLine?IB.tideLine():472;

  /* земля */
  for(let ty=ty0;ty<=ty1;ty++)for(let tx=tx0;tx<=tx1;tx++){
    /* v11: за межами карти — МОРЕ знизу і луга з інших боків (щоб на високих
       екранах не було чорноти за краями світу) */
    const oob=tx<0||ty<0||tx>=W.W||ty>=W.H;
    let t=W.at(tx,ty);if(oob)t=(ty>=W.H)?0:2;
    const h=oob?0:W.elevAt(tx,ty);
    const s=tileScreen(tx,ty);
    const sx=s.x+ox, sy=s.y+oy-h*10;
    if(sx<-40||sx>CVW+40||sy<-80||sy>CVH+40)continue;
    const v=IB.hsh(tx,ty,3);
    const tl=IB.tileFor?IB.tileFor(t,tx,ty):null;
    let col=null;
    if(tl){
      /* i3-gfx5: багатий тайл Києва */
      g.drawImage(tl,sx,sy);
      /* v14-fx: базовий колір і для печених тайлів — кліфи/пірс/сходи
         нижче використовують col (раніше тут був ReferenceError на межі
         порту/пляжу з водою) */
      const cc0=T_COL[t]||T_COL[2];
      col=cc0[v<0.4?0:(v<0.75?1:2)];
      /* БОРДЮР: вулиця межує з газоном згори — світлий камінь */
      if((t===12||t===19)&&IB.W.isStreet&&!IB.W.isStreet(tx,ty-1)){
        IB.P(g,sx+6,sy+1,20,1,'#a6a69e');
        IB.P(g,sx+3,sy+3,12,1,'#9c9c94');
        IB.P(g,sx+18,sy+3,10,1,'#a2a29a');
      }
    }else{
      const cc=T_COL[t]||T_COL[2];
      col=cc[v<0.4?0:(v<0.75?1:2)];
      IB.rhomb(g,sx,sy,32,16,col);
      /* дрібні деталі */
      if(t===2||t===3){if(v>0.9)IB.P(g,sx+14+IB.hsh(tx,ty,4)*6,sy+6+IB.hsh(ty,tx,5)*4,2,1,IB.PAL.g6);}
      if(t===5&&v>0.8)IB.P(g,sx+10,sy+7,3,1,'#ffffff88');
      if(t===7){IB.P(g,sx+12,sy+6,8,2,IB.shade(col,-0.15));}
    }
    /* i3-gfx-patch: МОРЕ — хвилі, мілководдя, піна, ШТОРМ */
    if(t===0){
      const deep=W.elevAt(tx,ty)<0.05;
      const wxT=IB.G.wx.type;
      const rough=(wxT==='storm'||wxT==='thunder'||wxT==='rain');
      const ph=performance.now()*0.0016*(rough?2.3:1);
      const wv=IB.M.sin(ph+tx*0.8+ty*0.5);
      const wave=rough?'#9ab8c455':'#7ac8d866';
      if(wv>0.45)IB.P(g,sx+6+IB.hsh(tx,ty,6)*14,sy+6,8,1,wave);
      if(wv<-0.5)IB.P(g,sx+12,sy+9,7,1,rough?'#c8d8e055':'#a8e0ec55');
      /* мілководдя — світле бірюзове + піна біля берега */
      if(!deep){
        IB.rhomb(g,sx,sy,32,16,'rgba(70,160,170,'+(rough?0.25:0.38)+')');
        const near=W.at(tx-1,ty)===1||W.at(tx,ty-1)===1||W.at(tx-2,ty)===1||W.at(tx,ty-2)===1;
        const fo=IB.M.sin(performance.now()*0.0021+tx*1.3+ty*0.9);
        if(near&&fo>0.4)IB.PA(g,[[sx+4,sy+8],[sx+16,sy+2],[sx+28,sy+8],[sx+16,sy+13]],rough?'#e8f0f288':'#eef7f877');
        else if(fo>0.75)IB.P(g,sx+10,sy+7,10,2,'rgba(238,247,248,0.45)');
      }
      if(rough&&wv>0.8){IB.P(g,sx+4,sy+4,20,2,'#ffffff66');IB.GFX.shake=IB.M.max(IB.GFX.shake||0,wxT==='storm'?0.35:0);}
      /* сонячні блики */
      if(wxT==='sun'&&IB.nightFactor()<0.25&&IB.hsh(tx,ty,17)>0.93)IB.P(g,sx+12,sy+6,4,2,'#ffffffaa');
    }
    /* ПІСОК: зернятка, черепашки, мокра смуга біля води */
    if(t===1){
      if(v>0.72)IB.P(g,sx+10+IB.hsh(tx,ty,18)*12,sy+6+IB.hsh(ty,tx,19)*6,1,1,'#8a7048');
      if(IB.hsh(tx,ty,20)>0.965)IB.P(g,sx+12,sy+8,3,2,'#d8ccb0');
      /* v18: МОКРЕ МОРЕ — смуга мокрого піску їде за приливом */
      const wetN=ty>=tideY-2||W.at(tx,ty+1)===0||W.at(tx,ty+2)===0;
      if(wetN)IB.rhomb(g,sx,sy,32,16,ty>=tideY-2?'#7c6c50':'#a89068');
      if(ty>=tideY-2&&ty<tideY&&IB.hsh(tx,ty,28)>0.55)IB.P(g,sx+8+IB.hsh(tx,ty,29)*10,sy+7,9,1,'rgba(240,248,250,0.4)');
      if(IB.G.wx.type==='storm'&&IB.hsh(tx,ty,27)>0.5)IB.rhomb(g,sx,sy,32,16,'#8a7a58');
      /* v18: ПРИЛИВ — вода малюється ПОВЕРХ піску у смузі приливу */
      if(ty>=tideY){
        IB.rhomb(g,sx,sy,32,16,'rgba(70,170,180,0.45)');
        if(ty===tideY){
          const fo2=IB.M.sin(performance.now()*0.0023+tx*1.1);
          if(fo2>0.05)IB.PA(g,[[sx+3,sy+9],[sx+16,sy+3],[sx+29,sy+9],[sx+16,sy+14]],'rgba(240,248,250,0.85)');
        }
      }
    }
    if(t===12&&IB.hsh(tx,ty,25)>0.97)IB.P(g,sx+14,sy+7,4,2,'#c8c8c8'); /* розмітка */
    if(t===13){
      IB.P(g,sx+15,sy+7,2,1,'#988860');
      if(IB.hsh(tx,ty,26)>0.94)IB.P(g,sx+8,sy+6,6,3,'#c0b088');
    }
    if(t===14)IB.P(g,sx+2,sy+7,28,1,IB.shade(col,-0.2)); /* дошки пірса/мосту */
    /* v2.0: ПРИМОРСЬКІ СХОДИ — сходинки вниз */
    if(t===15){
      IB.P(g,sx+4,sy+5,24,2,IB.shade(col,-0.22));
      IB.P(g,sx+4,sy+9,24,2,IB.shade(col,-0.12));
      if(IB.hsh(tx,ty,28)>0.8)IB.P(g,sx+6,sy+7,20,1,'#e8e0d0aa');
    }
    /* v2.0: СУХИЙ ЛИМАН — тиха каламутна вода */
    if(t===16){
      const lw=IB.M.sin(performance.now()*0.001+tx*0.9+ty*0.6);
      if(lw>0.55)IB.P(g,sx+6+IB.hsh(tx,ty,6)*14,sy+6,9,1,'#6a9a7866');
      if(IB.hsh(tx,ty,29)>0.93)IB.P(g,sx+12,sy+8,5,3,'#4e7a5aaa');
    }
    /* кліфи: сусід нижче */
    const eL=W.elevAt(tx-1,ty),eR=W.elevAt(tx,ty+1);
    const hh=10;
    if(eL<h-0.01){
      const dh=IB.M.round((h-eL)*10);
      IB.PA(g,[[sx,sy+8],[sx+16,sy+16],[sx+16,sy+16+dh],[sx,sy+8+dh]],IB.shade(IB.shade(col,-0.28),0));
    }
    if(eR<h-0.01){
      const dh=IB.M.round((h-eR)*10);
      IB.PA(g,[[sx+16,sy+16],[sx+32,sy+8],[sx+32,sy+8+dh],[sx+16,sy+16+dh]],IB.shade(IB.shade(col,-0.16),0));
    }
    /* сніг на вершинах при погоді */
    if(snowCap&&h>4&&v>0.3){IB.PA(g,[[sx,sy+8],[sx+16,sy],[sx+32,sy+8],[sx+16,sy+16]],'#dce8f055');}
  }

  /* v20.0: ТІНІ ІЗОХМАР НА ЗЕМЛІ — м'які плями їдуть за хмарами (до будівель) */
  if(IB.SKY&&IB.SKY.drawShadows)IB.SKY.drawShadows(g);

  /* ---------- об'єкти+будівлі+сутності: сортування за глибиною ---------- */
  const draws=[];
  for(let ty=ty0;ty<=ty1;ty++)for(let tx=tx0;tx<=tx1;tx++){
    const p=W.propAt(tx,ty);
    if(p)draws.push({d:p.x+p.y,f:drawProp,a:p});
  }
  for(const b of W.buildings){
    if(b.x+b.w<tx0||b.x>tx1||b.y+b.h<ty0||b.y>ty1)continue;
    draws.push({d:(b.x+b.w/2)+(b.y+b.h/2),f:drawBuilding,a:b});
  }
  /* структури кемпінгів */
  for(const c of W.CAMPS){
    const cc=IB.G.camps[c.id];
    if(!cc)continue;
    if(IB.dist(c.x,c.y,cam.x,cam.y)>30)continue;
    if(cc.fire)draws.push({d:c.x+c.y-0.6,f:drawFire,a:{x:c.x,y:c.y,fuel:cc.fuel}});
    if(cc.tent)draws.push({d:c.x+c.y+1.5,f:drawTent,a:{x:c.x-3,y:c.y-2}});
    if(cc.well)draws.push({d:c.x+c.y+1.6,f:drawCampWell,a:{x:c.x+3,y:c.y-2}});
    if(cc.table)draws.push({d:c.x+c.y+1.8,f:drawTable,a:{x:c.x-2,y:c.y+3}});
    if(cc.dry)draws.push({d:c.x+c.y+2,f:drawDry,a:{x:c.x+2.5,y:c.y+3}});
    if(cc.farm.built)draws.push({d:c.x+c.y+2.2,f:drawFarm,a:{x:c.x+3,y:c.y+2,stage:cc.farm.stage,ready:cc.farm.ready,planted:cc.farm.planted}});
  }
  /* v2.1: похідні табори (табір будь-де) */
  for(const c of (IB.G.wildCamps||[])){
    const cc=IB.G.camps[c.id];
    if(!cc)continue;
    if(IB.dist(c.x,c.y,cam.x,cam.y)>30)continue;
    if(cc.fire)draws.push({d:c.x+c.y-0.6,f:drawFire,a:{x:c.x,y:c.y,fuel:cc.fuel}});
    if(cc.tent)draws.push({d:c.x+c.y+1.5,f:drawTent,a:{x:c.x-2.5,y:c.y-1.5}});
    if(cc.well)draws.push({d:c.x+c.y+1.6,f:drawCampWell,a:{x:c.x+2.5,y:c.y-1.5}});
    if(cc.table)draws.push({d:c.x+c.y+1.8,f:drawTable,a:{x:c.x-1.5,y:c.y+2}});
    if(cc.dry)draws.push({d:c.x+c.y+2,f:drawDry,a:{x:c.x+2,y:c.y+2.5}});
    if(cc.farm&&cc.farm.built)draws.push({d:c.x+c.y+2.2,f:drawFarm,a:{x:c.x+2.5,y:c.y+1.5,stage:cc.farm.stage,ready:cc.farm.ready,planted:cc.farm.planted}});
  }
  for(const e of IB.E.team){if(e._inCar)continue;draws.push({d:e.x+e.y+0.3,f:drawHero,a:e});}
  for(const n of IB.E.npcs)draws.push({d:n.x+n.y,f:drawNpc,a:n});
  for(const sa of (IB.SUN_ACTORS||[]))draws.push({d:sa.x+sa.y+0.45,f:drawSunActor,a:sa}); /* v16: дійство */
  for(const a of IB.E.animals)draws.push({d:a.x+a.y,f:drawAnimal,a});
  /* v17.0: звірі — пес (земля), чайки/метелики (літають, трохи вище за глибиною) */
  for(const b of (IB.E.beasts||[]))draws.push({d:b.x+b.y+(b.type==='lynx'?0.2:4.2),f:drawBeast,a:b});
  if(IB.E.tourist)draws.push({d:IB.E.tourist.x+IB.E.tourist.y,f:drawTourist,a:IB.E.tourist});
  for(const f of IB.E.fishes)draws.push({d:f.x+f.y,f:drawFishShadow,a:f});
  for(const c of (IB.E.cars||[]))draws.push({d:c.x+c.y+0.25,f:drawCar,a:c});
  for(const fx of IB.tripFx)draws.push({d:fx.x+fx.y,f:drawTripFx,a:fx});
  draws.sort((a,b)=>a.d-b.d);
  for(const dr of draws)dr.f(g,dr.a,ox,oy,dt);

  /* ---------- плаваючі повідомлення ---------- */
  for(const m of IB.floatMsgs){
    const s=tileScreen(m.x,m.y);
    g.font='8px monospace';g.fillStyle='#ffffffcc';
    g.fillText(m.txt,s.x+ox-4,s.y+oy-26-m.t*12);
    m.t+=dt;
  }
  for(let i=IB.floatMsgs.length-1;i>=0;i--)if(IB.floatMsgs[i].t>1.2)IB.floatMsgs.splice(i,1);

  /* ---------- тріп-хвилі ---------- */
  if(IB.G.trip.active){
    const hue=(IB.G.t*137+performance.now()*0.03)%360;
    g.fillStyle='hsla('+hue+',70%,50%,0.14)';g.fillRect(0,0,CVW,CVH);
    g.fillStyle='hsla('+((hue+120)%360)+',80%,60%,0.08)';g.fillRect(0,0,CVW,CVH);
    for(let i=0;i<5;i++){
      const ph=performance.now()*0.001+i;
      g.strokeStyle='hsla('+((hue+i*60)%360)+',85%,70%,0.35)';g.lineWidth=1.5;
      g.beginPath();
      for(let x=0;x<=CVW;x+=12)g.lineTo(x,CVH/2+IB.M.sin(x*0.02+ph*2+i)*60);
      g.stroke();
    }
  }

  /* ---------- v18: ДЕЛЬФІНИ У ВІДКРИТОМУ МОРІ (система була — рендера не було) ---------- */
  if(IB.E.dolphins&&IB.E.dolphins.length){
    const tt9=performance.now()*0.003;
    for(const d of IB.E.dolphins){
      if(d.life<=0)continue;
      const s9=tileScreen(d.x,d.y);
      const px9=s9.x+ox, py9=s9.y+oy-4+IB.M.sin(tt9+d.t*2)*3;
      const jf=IB.M.sin(tt9*1.7+d.t)>0.25;
      if(jf){
        g.fillStyle='#3a6a88';
        g.beginPath();g.ellipse(px9+8,py9,7,3.4,-0.5,0,6.283);g.fill();
        g.beginPath();g.moveTo(px9+13,py9-1);g.quadraticCurveTo(px9+17,py9-9,px9+15,py9-2);g.closePath();g.fill();
        if(IB.M.random()<0.25)IB.P(g,px9+2,py9+3,2,2,'rgba(240,248,250,0.75)');
      }else{
        g.fillStyle='rgba(58,106,136,0.45)';
        g.beginPath();g.ellipse(px9+8,py9+2,7,2.2,0,0,6.283);g.fill();
      }
    }
  }

  /* ---------- ніч/вогонь світло — v19.0: ФАЗИ НОЧІ ---------- */
  if(nf>0.05){
    /* v2.3: мерехтіння ночі на вечірці */
    const nfF=nf*(IB.G.party.active?(0.93+0.07*IB.M.sin(performance.now()*0.02)):1);
    /* v19: базове нічне затемнення глибше (було 0.55 — «як вечір») */
    g.fillStyle='rgba(9,14,30,'+(nfF*0.52).toFixed(3)+')';g.fillRect(0,0,CVW,CVH);
    /* v19: ГЛИБОКА НІЧ (23:00-03:50) — додаткова синьо-чорна темрява поверх;
       на вечірці (клуб/гулянка) темрява м'якша — там своє світло */
    const dn9=(IB.deepNight?IB.deepNight():0)*(IB.G.party.active?0.45:1);
    if(dn9>0.02){
      g.fillStyle='rgba(3,6,16,'+(0.34*dn9).toFixed(3)+')';g.fillRect(0,0,CVW,CVH);
      g.fillStyle='rgba(12,20,46,'+(0.13*dn9).toFixed(3)+')';g.fillRect(0,0,CVW,CVH);
    }
    /* світло вогнів */
    for(const c of W.CAMPS.concat(IB.G.wildCamps||[])){
      const cc=IB.G.camps[c.id];
      if(cc&&cc.fire&&cc.fuel>0){
        const s=tileScreen(c.x,c.y);
        const fx=s.x+ox,fy=s.y+oy-6;
        /* v2.3: вогонь пульсує в такт вечірці — світло міняється */
        const pk=IB.G.party.active?(1.32+IB.M.sin(performance.now()*0.017)*0.16):1;
        const fl=(0.75+IB.M.sin(performance.now()*0.01)*0.15)*pk;
        const gr=g.createRadialGradient(fx,fy,4,fx,fy,80*fl);
        gr.addColorStop(0,'rgba(240,180,60,'+IB.M.min(0.85,0.5*nf*pk).toFixed(3)+')');
        gr.addColorStop(0.5,'rgba(220,120,40,'+IB.M.min(0.5,0.22*nf*pk).toFixed(3)+')');
        gr.addColorStop(1,'rgba(0,0,0,0)');
        g.fillStyle=gr;g.beginPath();g.arc(fx,fy,80*fl,0,7);g.fill();
      }
    }
    /* v19: місяць/зорі — БІЛЬШЕ і ЯСКРАВІШІ у глибоку ніч + МІСЯЦЬ з ореолом */
    if(nf>0.6){
      const dn2=IB.deepNight?IB.deepNight():0;
      const stA=0.42+0.5*dn2;                       /* яскравість зір */
      const stN=40+Math.round(55*dn2);              /* у глибоку ніч — зоряне небо */
      for(let i=0;i<stN;i++){
        const sx=IB.hsh(i,1,50)*CVW,sy=IB.hsh(i,2,51)*140;
        const tw=0.62+0.38*IB.M.sin(performance.now()*0.002+i*2.1);
        if(IB.hsh(i,3,52)>0.5){g.fillStyle='rgba(255,255,255,'+(stA*tw).toFixed(2)+')';g.fillRect(sx,sy,1,1);}
      }
      /* МІСЯЦЬ — диск з кратерами і м'яким ореолом (у глибоку ніч — вище і виразніший) */
      {
        const mx9=CVW*0.78,my9=30+10*(1-dn2),mr9=9;
        const mg9=g.createRadialGradient(mx9,my9,mr9*0.4,mx9,my9,mr9*3.4);
        mg9.addColorStop(0,'rgba(214,226,255,'+(0.20+0.24*dn2).toFixed(2)+')');
        mg9.addColorStop(1,'rgba(0,0,0,0)');
        g.fillStyle=mg9;g.beginPath();g.arc(mx9,my9,mr9*3.4,0,7);g.fill();
        g.fillStyle='#e9edf5';g.beginPath();g.arc(mx9,my9,mr9,0,7);g.fill();
        g.fillStyle='#c6cfdd';g.beginPath();g.arc(mx9-mr9*0.32,my9-mr9*0.18,mr9*0.3,0,7);g.fill();
        g.beginPath();g.arc(mx9+mr9*0.26,my9+mr9*0.3,mr9*0.22,0,7);g.fill();
      }
    }
    /* v1.5: СВІТЛО ФОНАРИКІВ — кожен герой несе фонарик уночі (якщо увімкнені);
       v19: у глибоку ніч промінь трохи довший — видно куди йдеш */
    if(IB.G.torch!==false){
      const tm=performance.now()*0.011;
      const dn3=IB.deepNight?IB.deepNight():0;
      const tr9=54*(1+0.3*dn3);
      for(const h of IB.E.team){
        const s=tileScreen(h.x,h.y);
        const fx=s.x+ox+16,fy=s.y+oy+4-h.swim*4;
        const fl=0.92+IB.M.sin(tm+h.x*3.1)*0.08;
        const gr=g.createRadialGradient(fx,fy-6,3,fx,fy-6,tr9*fl);
        gr.addColorStop(0,'rgba(255,238,178,'+(0.5*nf)+')');
        gr.addColorStop(0.45,'rgba(255,222,140,'+(0.24*nf)+')');
        gr.addColorStop(1,'rgba(0,0,0,0)');
        g.fillStyle=gr;g.beginPath();g.arc(fx,fy-6,tr9*fl,0,7);g.fill();
        /* яскраве ядро променя */
        const gr2=g.createRadialGradient(fx,fy-8,1,fx,fy-8,16*fl);
        gr2.addColorStop(0,'rgba(255,248,210,'+(0.55*nf)+')');
        gr2.addColorStop(1,'rgba(0,0,0,0)');
        g.fillStyle=gr2;g.beginPath();g.arc(fx,fy-8,16*fl,0,7);g.fill();
      }
    }

    /* ---------- v20.0 «СВІТЛО НІЧНОГО МІСТА» — ПОВЕРХ нічного оверлея:
       фонарі (конус+велика тепла пляма, старі мигають), прожектори порту
       (холодні промені), ФАРИ АВТО (конус вперед, розсіювання на асфальті,
       задні червоні). Пул позицій — IB.W.lamps / IB.W.plights (world.js). ---------- */
    if(nf>0.25){
      const dn4=IB.deepNight?IB.deepNight():0;
      const nfL=IB.clamp(nf*(1+0.30*dn4),0,1);
      /* ФОНАРІ */
      const lampImg=IB.img('lamp');
      const lampH=lampImg?lampImg.height*0.9-8:28;
      for(const lp of (IB.W.lamps||[])){
        const s=tileScreen(lp.x,lp.y);
        const x=s.x+ox+16,y=s.y+oy+8;
        if(x<-60||x>CVW+60||y<-40||y>CVH+40)continue;
        const ly=y-lampH;
        let int2=1;
        if(lp.old){const tL=performance.now()*0.001;
          int2=0.55+0.45*IB.M.sin(tL*7+lp.x);
          if(IB.hsh((tL*3+lp.x)|0,0,91)>0.9)int2*=0.15;}
        IB.O(g,x,ly,3,2.5,'rgba(248,232,160,'+(0.9*int2).toFixed(2)+')');
        const cone=g.createLinearGradient(0,ly,0,y+6);
        cone.addColorStop(0,'rgba(255,224,140,'+(0.22*nfL*int2).toFixed(3)+')');
        cone.addColorStop(1,'rgba(255,216,130,0)');
        g.fillStyle=cone;
        g.beginPath();g.moveTo(x-4,ly);g.lineTo(x+4,ly);g.lineTo(x+16,y+5);g.lineTo(x-16,y+5);g.closePath();g.fill();
        const pool=g.createRadialGradient(x,y+3,2,x,y+3,36*nfL);
        pool.addColorStop(0,'rgba(255,220,130,'+(0.36*nfL*int2).toFixed(3)+')');
        pool.addColorStop(0.5,'rgba(255,208,110,'+(0.17*nfL*int2).toFixed(3)+')');
        pool.addColorStop(1,'rgba(255,200,100,0)');
        g.fillStyle=pool;g.beginPath();g.arc(x,y+3,36*nfL,0,7);g.fill();
        g.fillStyle='rgba(255,222,140,'+(0.13*nfL*int2).toFixed(3)+')';
        g.beginPath();g.ellipse(x,y+3,27*nfL,13*nfL,0,0,7);g.fill();
      }
      /* ПРОЖЕКТОРИ ПОРТУ — холодні біло-блакитні промені */
      const swG=IB.M.sin(performance.now()*0.0008)*0.6;
      for(const pl of (IB.W.plights||[])){
        const s=tileScreen(pl.x,pl.y);
        const x=s.x+ox+16,y=s.y+oy+8;
        if(x<-80||x>CVW+80||y<-80||y>CVH+40)continue;
        const top2=y-36;
        const pA=(0.34+0.26*dn4)*nfL;
        IB.O(g,x-8,top2+2.6,3.4,2.4,'rgba(220,236,255,0.95)');
        IB.O(g,x+8,top2+2.6,3.4,2.4,'rgba(220,236,255,0.95)');
        for(const hx2 of [x-8,x+8]){
          const beam=g.createRadialGradient(hx2,top2+3,2,hx2,top2+3,50);
          beam.addColorStop(0,'rgba(205,228,255,'+(pA*0.85).toFixed(3)+')');
          beam.addColorStop(0.55,'rgba(190,216,250,'+(pA*0.32).toFixed(3)+')');
          beam.addColorStop(1,'rgba(180,210,250,0)');
          g.fillStyle=beam;g.beginPath();g.arc(hx2,top2+3,50,0,7);g.fill();
          const gy2=y+2;
          const beam2=g.createRadialGradient(hx2+swG*3,gy2,3,hx2+swG*3,gy2,34*nfL);
          beam2.addColorStop(0,'rgba(200,224,252,'+(pA*0.55).toFixed(3)+')');
          beam2.addColorStop(1,'rgba(190,216,250,0)');
          g.fillStyle=beam2;g.beginPath();g.arc(hx2+swG*3,gy2,34*nfL,0,7);g.fill();
          g.fillStyle='rgba(205,228,255,'+(pA*0.42).toFixed(3)+')';
          g.beginPath();g.ellipse(hx2+swG*3,gy2,26*nfL,11*nfL,0,0,7);g.fill();
        }
      }
      /* ФАРИ АВТО — конус вперед по ізо-ходу + розсіювання на асфальті */
      for(const c of (IB.E.cars||[])){
        if(!c.v||c.v<=0)continue;
        const s=tileScreen(c.x,c.y);
        const x=s.x+ox+16,y=s.y+oy+6;
        if(x<-70||x>CVW+70||y<-50||y>CVH+50)continue;
        const vx=c.dir==='r'?1:(c.dir==='l'?-1:(c.dir==='d'?-1:1));
        const vy=(c.dir==='r'||c.dir==='d')?0.5:-0.5;
        const noseHi=(c.dir==='l'||c.dir==='u');
        const nx2=x+vx*11, ny2=noseHi?y-13:y-2;
        const tx2=x-vx*11, ty2=noseHi?y-2:y-13;
        const L2=27+dn4*11;
        const glowA=(0.32+0.20*dn4)*nfL;
        for(let st=0;st<3;st++){
          const ddd=L2*(0.35+st*0.38);
          const cx3=nx2+vx*ddd,cy3=ny2+vy*ddd*0.7;
          const rr=9+st*10;
          const gr=g.createRadialGradient(cx3,cy3,1,cx3,cy3,rr);
          gr.addColorStop(0,'rgba(255,240,190,'+(glowA*(1-st*0.28)).toFixed(3)+')');
          gr.addColorStop(1,'rgba(255,230,160,0)');
          g.fillStyle=gr;g.beginPath();g.arc(cx3,cy3,rr,0,7);g.fill();
        }
        const pxx=nx2+vx*L2*0.9,pyy=y+2+vy*L2*0.45;
        g.fillStyle='rgba(255,232,170,'+(0.15*nfL).toFixed(3)+')';
        g.beginPath();g.ellipse(pxx,pyy,L2*0.55,L2*0.26,0,0,7);g.fill();
        IB.O(g,nx2-vy*2.4,ny2+vx*1.2,1.9,1.9,'rgba(255,250,214,0.95)');
        IB.O(g,nx2+vy*2.4,ny2-vx*1.2,1.9,1.9,'rgba(255,250,214,0.95)');
        g.fillStyle='rgba(255,60,50,0.9)';g.fillRect(tx2-1.2,ty2-1,2.4,2);
        const rg=g.createRadialGradient(tx2,ty2,0.5,tx2,ty2,10);
        rg.addColorStop(0,'rgba(255,70,55,'+(0.32*nfL).toFixed(3)+')');
        rg.addColorStop(1,'rgba(255,70,55,0)');
        g.fillStyle=rg;g.beginPath();g.arc(tx2,ty2,10,0,7);g.fill();
      }
    }
  }

  /* ---------- погода ---------- */
  drawWeather(g,dt);

  /* ---------- v18/v19: ЧАС ДОБИ У КОЛЬОРІ — ранок/полудень/сумерки ----------
     (ніч — блок вище, золота година — блок нижче; тут тільки їхні сусіди).
     v19: пороги підняті під ФАЗОВУ криву nf (світанок тепер nf<0.92 —
     рожево-блакитний подих видно з 5:30, сумерки — до nf 0.75). */
  {
    const hh9=IB.G.t%24;
    if(nf<0.92){
      /* СВІТАНОК ~5:00-9:00 — свіжа блакить + рожевий подих сходу */
      if(hh9>=5&&hh9<9){
        const k9=1-IB.M.abs(hh9-7)/2;
        if(k9>0){
          g.fillStyle='rgba(255,190,150,'+(0.11*k9).toFixed(3)+')';g.fillRect(0,0,CVW,CVH);
          g.fillStyle='rgba(150,200,255,'+(0.09*k9).toFixed(3)+')';g.fillRect(0,0,CVW,CVH*0.5);
        }
      }
      /* ПОЛУДЕНЬ 11-15 — яскрава жара: теплий відблиск на горизонті */
      else if(hh9>=11&&hh9<15&&nf<0.35){
        g.fillStyle='rgba(255,240,190,0.05)';g.fillRect(0,0,CVW,CVH*0.4);
      }
      /* СУМЕРКИ 17:30-21 — бузково-синій градієнт поверх нічного затемнення */
      if(hh9>=17.5&&hh9<21&&nf<0.78){
        const k9=IB.M.min(1,nf*1.8);
        const sg9=g.createLinearGradient(0,0,0,CVH);
        sg9.addColorStop(0,'rgba(90,60,140,'+(0.15*k9).toFixed(3)+')');
        sg9.addColorStop(0.5,'rgba(220,90,60,'+(0.09*k9).toFixed(3)+')');
        sg9.addColorStop(1,'rgba(30,40,80,'+(0.11*k9).toFixed(3)+')');
        g.fillStyle=sg9;g.fillRect(0,0,CVW,CVH);
      }
    }
  }

  /* ---------- v1.4: ЗОЛОТА ГОДИНА — тепле світло ранку/вечора ---------- */
  {
    const gh=IB.goldenHour();
    if(gh>0.02){
      g.fillStyle='rgba(255,166,60,'+(0.16*gh)+')';g.fillRect(0,0,CVW,CVH);
      g.fillStyle='rgba(255,110,40,'+(0.08*gh)+')';g.fillRect(0,0,CVW,CVH*0.36);
      const sg=g.createLinearGradient(0,0,0,CVH);
      sg.addColorStop(0,'rgba(120,40,90,'+(0.10*gh)+')');sg.addColorStop(1,'rgba(255,180,80,0)');
      g.fillStyle=sg;g.fillRect(0,0,CVW,CVH);
    }
  }

  /* ---------- v18: КІНЕМАТОГРАФІЧНІ СЦЕНИ — літрбокс + титр + феєрверк ----------
     IB.cineStart('ТИТР', тривалість, 'fireworks') — шторм, спуск «Паллади»,
     зміна акту, фінал літа. */
  if(IB.cine&&IB.cine.active){
    const c9=IB.cine;c9.t+=dt;
    const k9=IB.M.min(1,c9.t*2)*(c9.t>c9.dur?IB.M.max(0,1-(c9.t-c9.dur)*1.5):1);
    if(k9>0){
      const bar9=44*k9;
      g.fillStyle='#000';g.fillRect(0,0,CVW,bar9);g.fillRect(0,CVH-bar9,CVW,bar9);
      if(c9.cap){
        g.font='bold 11px "Press Start 2P",monospace';g.textAlign='center';
        g.fillStyle='rgba(240,230,200,'+(0.95*k9).toFixed(2)+')';
        g.fillText(c9.cap,CVW/2,CVH-14);
        g.textAlign='left';g.font='8px monospace';
      }
      if(c9.fx==='fireworks'){
        for(let i9=0;i9<3;i9++){
          if(IB.M.random()<dt*0.8){
            const fx9=CVW*(0.15+IB.M.random()*0.7),fy9=CVH*(0.10+IB.M.random()*0.30);
            const col9=['#f8d060','#f070a0','#7ad0f0','#a0f070'][IB.M.floor(IB.M.random()*4)];
            for(let j9=0;j9<14;j9++){const a9=j9/14*6.283,r9=6+IB.M.random()*16;
              g.fillStyle=col9;g.fillRect(fx9+IB.M.cos(a9)*r9,fy9+IB.M.sin(a9)*r9,2,2);}
          }
        }
      }
      if(c9.t>c9.dur+0.8)c9.active=false;
    }
  }

  /* v2.0: туман і хуртовину ЗНЯТО — курорт бачить ясно (відгук гравця) */

  /* v20.0: ІЗОХМАРИ + СОНЦЕ + БЛИСКАВКИ — верхній «небесний» шар; тік — тут же
     (renderWorld викликається тільки в режимі гри — небо живе разом зі світом) */
  if(IB.SKY&&IB.SKY.tick)IB.SKY.tick(dt);
  if(IB.SKY&&IB.SKY.draw)IB.SKY.draw(g);

  /* GPS-маркер */
  if(IB.G.route){
    const s=tileScreen(IB.G.route.x,IB.G.route.y);
    const fx=s.x+ox,fy=s.y+oy-14;
    const bob=IB.M.sin(performance.now()*0.004)*3;
    IB.PA(g,[[fx,fy-14+bob],[fx-5,fy-6+bob],[fx+5,fy-6+bob]],'#e05a8a');
    IB.P(g,fx-1,fy-6+bob,2,4,'#c84870');
    const d=IB.dist(IB.E.team[0].x,IB.E.team[0].y,IB.G.route.x,IB.G.route.y);
    g.font='7px monospace';g.fillStyle='#e05a8a';g.fillText(IB.M.round(d*3)+' м',fx-8,fy-18+bob);
  }

  /* сповіщення про тріп-бачення артефактів у світі */
  if(IB.G.vision>0||IB.G.trip.active){
    for(const a of IB.ARTIFACTS){
      if(!a.world||IB.artHas(a.id))continue;
      const s=tileScreen(a.x,a.y);
      const fx=s.x+ox,fy=s.y+oy-8;
      const pl=0.5+IB.M.sin(performance.now()*0.005)*0.3;
      g.strokeStyle='rgba(176,106,224,'+pl+')';g.lineWidth=2;
      g.beginPath();g.arc(fx,fy,8,0,7);g.stroke();
      g.fillStyle='rgba(176,106,224,'+pl+')';g.fillRect(fx-2,fy-10,4,4);
    }
  }

  /* ---------- v2.3: ВЕЧІРКОВІ ГЛІЧІ — п'яні кольори, мерехтіння, зсув смуг ---------- */
  if(IB.partyFx&&IB.partyFx.lvl>0.02&&IB.G.party.active){
    const F=IB.partyFx,t=performance.now()*0.001,lvl=F.lvl*(0.85+0.15*IB.M.sin(t*2.2));
    if(F.mode==='psy'||F.mode==='psy2'){
      const hue=(t*(F.mode==='psy2'?85:50))%360;
      g.fillStyle='hsla('+hue.toFixed(0)+',80%,55%,'+(0.10+0.08*lvl).toFixed(3)+')';g.fillRect(0,0,CVW,CVH);
      g.fillStyle='hsla('+((hue+140)%360).toFixed(0)+',85%,60%,'+(0.07*lvl).toFixed(3)+')';g.fillRect(0,0,CVW,CVH);
    }else if(F.mode==='blue'){
      g.fillStyle='rgba(70,100,170,'+(0.16+0.06*lvl).toFixed(3)+')';g.fillRect(0,0,CVW,CVH);
      g.fillStyle='rgba(24,34,64,'+(0.12*lvl).toFixed(3)+')';g.fillRect(0,0,CVW,CVH);
    }else if(F.mode==='grey'){
      g.fillStyle='rgba(118,124,130,'+(0.20+0.05*lvl).toFixed(3)+')';g.fillRect(0,0,CVW,CVH);
    }else{
      g.fillStyle='rgba(255,150,60,'+(0.08*lvl).toFixed(3)+')';g.fillRect(0,0,CVW,CVH);
    }
    /* мерехтіння */
    if(IB.M.random()<0.12*lvl){g.fillStyle='rgba(255,242,205,'+(0.05+IB.M.random()*0.10).toFixed(3)+')';g.fillRect(0,0,CVW,CVH);}
    /* гліч-смуги: зсув горизонтальних шматків кадру */
    if(IB.M.random()<0.14*lvl){
      const n=1+IB.ri(0,3);
      for(let i=0;i<n;i++){
        const sy=IB.ri(0,CVH-18),hh=2+IB.ri(0,7),dx=IB.rnd(-12,12);
        g.drawImage(g.canvas,0,sy,CVW,hh,dx,sy,CVW,hh);
      }
    }
    /* подвійний зір на розгулі */
    if(lvl>0.55){g.globalAlpha=0.12+0.06*(lvl-0.55);g.drawImage(g.canvas,IB.M.sin(t*3.1)*4,IB.M.cos(t*2.3)*2.5);g.globalAlpha=1;}
    /* CSS-фільтр канваса — GPU, міняється з фазою */
    const cv=g.canvas;let flt='';
    if(F.mode==='psy')flt='saturate(1.7) hue-rotate('+(IB.M.sin(t*1.3)*40*lvl).toFixed(0)+'deg)';
    else if(F.mode==='psy2')flt='saturate(1.9) contrast(1.06) hue-rotate('+(IB.M.sin(t*2.1)*60*lvl).toFixed(0)+'deg)';
    else if(F.mode==='blue')flt='saturate(0.72) hue-rotate(-12deg) brightness(0.9)';
    else if(F.mode==='grey')flt='grayscale(0.6) brightness(0.95)';
    else flt='saturate('+(1+0.3*lvl).toFixed(2)+')';
    if(cv._pf!==flt){cv.style.filter=flt;cv._pf=flt;}
  }else{
    const cv=g.canvas;
    if(cv._pf){cv.style.filter='';cv._pf='';}
  }
};

/* ---------- v20.0: МАЛЮВАЛЬНИК КОНТЕЙНЕРА — рифлені стінки, двері з штангами,
   фитинги, код, іржа. axis 'h' — довга сторона по ізо-x (двері на SE-торці),
   'v' — по ізо-y (двері на SW-борту). small — міні-контейнер штабелера. ---------- */
const CONT_PAL=['#c03a2e','#2e62b0','#3e8a4a','#e08a28','#ecece4','#2a8a8a','#8a4a9e','#b84840'];
function paintContainer(g,x,y,seed,lift,small,axis){
  axis=axis||'h';
  const y0=y+(lift||0);
  const sz=small?{w:16,d:9,h:8}:{w:IB.hsh(seed,1,41)<0.4?30:22,d:IB.hsh(seed,1,41)<0.4?13:12,h:IB.hsh(seed,1,41)<0.4?12:11};
  const w=axis==='h'?sz.w:sz.d, d=axis==='h'?sz.d:sz.w, h=sz.h;
  const cc=CONT_PAL[(IB.hsh(seed,2,42)*CONT_PAL.length)|0];
  const x0=x-w/2;
  IB.O(g,x+4,y0+1,w*0.72,d*0.6,'#00000033');
  IB.isoBox(g,x0,y0,w,d,h,IB.shade(cc,0.10),IB.shade(cc,-0.16),IB.shade(cc,-0.34));
  const ridge=IB.shade(cc,-0.30),ridgeHi=IB.shade(cc,0.02),seam=IB.shade(cc,-0.45);
  if(axis==='h'){
    /* рифлення на видимому ДОВГОМУ борту (ліва грань, нахил по ізоосі) */
    const n=Math.max(4,IB.M.round(w/4));
    for(let i=1;i<n;i++){
      const t2=i/n;
      IB.P(g,x0+w/2*t2,y0+d/2+d/2*t2,1.3,h,ridge);
      IB.P(g,x0+w/2*t2+1.3,y0+d/2+d/2*t2,0.8,h,ridgeHi);
    }
    /* торець-ДВЕРІ (права грань): центральний шов + 4 штанги-замки
       (верхній край грані спадає: sy=y0+d−(d/2)·t) */
    IB.P(g,x0+w/2+w/4,y0+d-d/4,1.2,h,seam);
    for(const t3 of [0.14,0.32,0.68,0.86]){
      IB.P(g,x0+w/2+w/2*t3-0.6,y0+d-d/2*t3,1.2,h,IB.shade(cc,-0.5));
    }
  }else{
    /* довга сторона — права (SE) грань, двері — ліва (SW) */
    const n=Math.max(4,IB.M.round(w/4));
    for(let i=1;i<n;i++){
      const t2=i/n;
      IB.P(g,x0+w/2+w/2*t2-1.3,y0+d-d/2*t2,1.3,h,ridge);
    }
    IB.P(g,x0+w/4,y0+d/2+d/4,1.2,h,seam);
    for(const t3 of [0.14,0.32,0.68,0.86]){
      IB.P(g,x0+w/2*t3-0.6,y0+d/2+d/2*t3,1.2,h,IB.shade(cc,-0.5));
    }
  }
  /* верхня обв'язка + шов по довжині */
  g.strokeStyle=IB.shade(cc,-0.42);g.lineWidth=1;
  g.beginPath();
  g.moveTo(x0,y0+d/2);g.lineTo(x0+w/2,y0);g.lineTo(x+w,y0+d/2);g.lineTo(x0+w/2,y0+d);g.closePath();g.stroke();
  IB.P(g,x0+2,y0+d/2-1,w-4,1.2,IB.shade(cc,-0.28));
  /* кутові фитинги — темні кубики по кутах */
  g.fillStyle='#262a30';
  g.fillRect(x0-1,y0+d/2-1,2.4,2.4);g.fillRect(x0+w/2-1,y0-1,2.4,2.4);
  g.fillRect(x+w-1.4,y0+d/2-1,2.4,2.4);g.fillRect(x0+w/2-1,y0+d-1,2.4,2.4);
  /* КОД на борту (по нахилу грані) + іржа
     'h': код на лівій (довгій) грані — нахил вниз; 'v': на правій — вгору */
  const rust=IB.hsh(seed,3,43)<0.5;
  if(!small){
    g.save();
    const ang=axis==='h'?IB.M.atan2(d/2,w/2):-IB.M.atan2(d/2,w/2);
    const midX=x0+w/4+(axis==='h'?0:w/2), midY=(axis==='h'?y0+d/2+d/4:y0+d-d/4)+h*0.55;
    g.translate(midX,midY);g.rotate(ang);
    g.font='5px monospace';g.fillStyle='rgba(238,240,236,0.78)';g.textAlign='center';
    g.fillText('IBU '+((1000+IB.hsh(seed,4,44)*8999)|0)+' '+(IB.hsh(seed,5,46)<0.5?'22G1':'42G1'),0,0);
    g.textAlign='left';
    g.restore();
    if(rust){
      g.fillStyle='rgba(122,62,26,0.42)';
      const rr2=(IB.hsh(seed,6,47)*4|0)+2;
      for(let i=0;i<rr2;i++){
        const t4=0.1+IB.hsh(i,7,48)*0.8;
        const rx2=x0+w/2*t4,ry2=y0+d/2+d/2*t4;
        g.fillRect(rx2,ry2,1.2,3+IB.hsh(i,8,49)*4);
        g.fillRect(rx2-0.6,ry2+IB.hsh(i,9,50)*h*0.5,2.6,1);
      }
    }
  }
}
/* контейнер поперек — це paintContainer з axis='v' */
function paintContainerV(g,x,y,seed,lift){paintContainer(g,x,y,seed,lift,false,'v');}

/* ---------- ПРОПСИ (v1.3: дерева ВИЩІ й РІЗНІ — пальма/тополька/мішані/PNG з v5) ---------- */
function drawProp(g,p,ox,oy,dt){
  const s=tileScreen(p.x,p.y);
  const x=s.x+ox+16,y=s.y+oy+8;
  const P=IB.PAL,v=IB.hsh(p.x,p.y,p.seed*100|0);
  /* v16: ПРЕДМЕТИ ПЛЯЖУ ×3 (лежаки, парасолки, козирки, коробки) і ×1.8
     (ворота, сітки, пінг-понг, кошик, бари) — заповнений великий пляж */
  const B3X3={lounger:1,towel:1,umb:1,canopy:1,bin:1,ball:1,sandcastle:1,crate:1,shawarma:1};
  const B18={goal:1,net:1,pingpong:1,bball:1,tent:1,cabin:1,tower:1,surf:1,jetski:1,tramp:1,gullfeed:1,beachbar:1};
  const s3=B3X3[p.type]?3:(B18[p.type]?1.8:1);
  if(s3!==1){g.save();g.translate(x,y);g.scale(s3,s3);g.translate(-x,-y);}
  switch(p.type){
    case 'spruce':case 'spruce2':case 'spruce3':case 'pine':{
      /* v17.0: КАРПАТИ ВИПИСАНІ — замість смерек/сосни з шишками тут
         листяні дерева і КАТАЛПА (морське місто): круглі крони, ні снігу */
      const sc2=(p.type==='pine'?0.9:1)+(v*0.35);
      IB.O(g,x+5,y,11,4,'#00000030');
      IB.P(g,x-2.5,y-16*sc2,5,16*sc2,'#5e4628');
      IB.P(g,x-4,y-10*sc2,3,10*sc2,IB.shade('#5e4628',-0.15));
      const cy=y-28*sc2;
      IB.O(g,x,cy,15*sc2,11*sc2,'#3e6a2e');
      IB.O(g,x-7*sc2,cy-5*sc2,9*sc2,8*sc2,'#4e7a38');
      IB.O(g,x+7*sc2,cy-4*sc2,8*sc2,7*sc2,'#548640');
      IB.O(g,x-2*sc2,cy-9*sc2,7*sc2,6*sc2,'#5f9248');
      if(v>0.6){IB.O(g,x+3*sc2,cy-2*sc2,2.2,2.2,'#e8b050');IB.O(g,x-4*sc2,cy+1*sc2,2.2,2.2,'#e8b050');}
      break;}
    case 'oak':{
      /* v17.0: широколисте дерево — ПРОЦЕДУРНЕ (смерекові PNG з Першої
         частини більше не використовуємо — це карпатський вид) */
      const sc=1.25+v*0.55;
      IB.O(g,x+5,y,11,4,'#00000030');
      IB.P(g,x-2.5,y-16*sc,5,16*sc,'#5e4628');
      IB.P(g,x-4.5,y-9*sc,3,9*sc,'#4e3a20');
      const cy=y-30*sc;
      IB.O(g,x,cy,17*sc,12*sc,'#3e6a2e');
      IB.O(g,x-8*sc,cy-5*sc,10*sc,8*sc,'#4e7a38');
      IB.O(g,x+8*sc,cy-4*sc,9*sc,7*sc,'#548640');
      IB.O(g,x-2*sc,cy-10*sc,8*sc,6*sc,'#5f9248');
      if(v>0.5){IB.O(g,x+4*sc,cy-1*sc,2.4,2.4,'#e8b050');IB.O(g,x-5*sc,cy+2*sc,2.4,2.4,'#e8b050');}
      break;}
    case 'tree2':{
      /* v17.0: ТОПОЛЯ — висока, вузька, листяна (процедурна) */
      const sc=1.15+v*0.45;
      IB.O(g,x+4,y,8,3,'#00000028');
      IB.P(g,x-2,y-14*sc,4,14*sc,'#6a5a3a');
      const cy=y-30*sc;
      IB.O(g,x,cy-6*sc,7.5*sc,13*sc,'#4e7a38');
      IB.O(g,x,cy-13*sc,5.5*sc,9*sc,'#5f9248');
      IB.O(g,x,cy+3*sc,8.5*sc,8*sc,'#3e6a2e');
      IB.O(g,x-1.5*sc,cy-16*sc,3.5*sc,4*sc,'#6a9a48');
      break;}
    case 'pine':{
      /* альпійська сосна (PNG з v5), масштаб 1.1-1.6 */
      const im=IB.img('pine');
      const sc=1.1+v*0.5;
      IB.O(g,x+3,y,7,2.5,'#00000028');
      if(im)g.drawImage(im,x-im.width*sc/2,y-im.height*sc+3,im.width*sc,im.height*sc);
      else{IB.P(g,x-1,y-4,2,5,P.b2);IB.PA(g,[[x-7,y-8],[x+7,y-8],[x,y-20]],'#1e4228');IB.PA(g,[[x-5,y-14],[x+5,y-14],[x,y-24]],'#265232');}
      break;}
    case 'birch':{
      IB.O(g,x+3,y,6,2.5,'#00000028');
      IB.P(g,x-1,y-16,2,17,'#d8d8cc');
      IB.P(g,x-1,y-10,2,1,'#2a2a24');IB.P(g,x-1,y-6,2,1,'#2a2a24');
      IB.O(g,x,y-20,7,6,'#5a8a3a');IB.O(g,x-3,y-23,4,3.5,'#6a9a46');IB.O(g,x+4,y-21,4,3,'#6a9a46');
      break;}
    case 'mrock':{
      /* гірський валун (PNG з першої частини), масштаб 1.2-1.8 */
      const im=IB.img(v>0.66?'mtn_rock':(v>0.33?'mtn_rock2':'mtn_rock3'));
      const sc=1.2+v*0.6;
      IB.O(g,x+4,y,10,3.5,'#00000030');
      if(im)g.drawImage(im,x-im.width*sc/2,y-im.height*sc+3,im.width*sc,im.height*sc);
      else{IB.PA(g,[[x-8,y],[x-3,y-8],[x+4,y-9],[x+9,y-1]],'#58605a');}
      break;}
    case 'fence':{
      /* дерев'яний паркан (PNG з v5) — не блокує */
      const im=IB.img('fence');
      if(im)g.drawImage(im,x-im.width*0.9/2,y-im.height*0.9+2,im.width*0.9,im.height*0.9);
      else{IB.P(g,x-8,y-6,16,1,'#7a5e38');IB.P(g,x-6,y-6,2,6,'#5e4628');IB.P(g,x+4,y-6,2,6,'#5e4628');}
      break;}
    case 'lamp':{
      /* вуличний ліхтар (PNG з v5) — v20.0: сам стовп і головка тут;
         СВІТЛО (конус + пляма на землі) малюється у нічному проході ПОВЕРХ
         оверлея — темрява не з'їдає світло (див. renderWorld) */
      const im=IB.img('lamp');
      if(im)g.drawImage(im,x-im.width*0.9/2,y-im.height*0.9+3,im.width*0.9,im.height*0.9);
      else{IB.P(g,x-1,y-26,2,26,'#3a4048');IB.P(g,x-4,y-30,8,5,'#2a2e36');}
      break;}
    case 'bush':{
      IB.O(g,x+2,y,6,2.5,'#00000025');
      IB.O(g,x,y-4,6,5,'#38502c');IB.O(g,x-3,y-5,4,3,'#446035');IB.O(g,x+3,y-6,3.5,3,'#405a32');
      if(p.berries){IB.O(g,x-2,y-5,1.5,1.5,PALbe());IB.O(g,x+2,y-4,1.5,1.5,'#d84058');IB.O(g,x,y-7,1.4,1.4,PALbe());}
      break;}
    /* ---------- v1.4: ВУЛИЧНИЙ РЕКВІЗИТ СІЛ — PNG З ПЕРШОЇ ЧАСТИНИ ---------- */
    case 'bench':case 'barrels':case 'crate':case 'busstop':case 'swing':case 'slide':{
      const im=IB.img(p.type);
      IB.O(g,x+4,y,10,3.2,'#00000026');
      if(im){const an=IB.V5_ANCH[p.type];
        if(an)g.drawImage(im,x-an.ax,y-an.ay);else g.drawImage(im,x-im.width/2,y-im.height+4);}
      else{
        if(p.type==='bench'){IB.P(g,x-9,y-6,18,3,'#7a5e38');IB.P(g,x-9,y-10,18,2,'#96784e');IB.P(g,x-8,y-4,2,4,'#5e4628');IB.P(g,x+6,y-4,2,4,'#5e4628');}
        else if(p.type==='barrels'){IB.O(g,x-4,y-6,5,4,'#8a5a3a');IB.O(g,x+3,y-6,5,4,'#6a4a30');IB.P(g,x-4,y-8,10,1,'#9a6a44');}
        else if(p.type==='crate'){IB.P(g,x-6,y-8,12,8,'#a88048');IB.P(g,x-6,y-8,12,1,'#c0a060');IB.P(g,x-1,y-8,1,8,'#7a5e38');}
        else if(p.type==='busstop'){IB.P(g,x-11,y-14,2,14,'#5e4628');IB.P(g,x+9,y-14,2,14,'#5e4628');IB.P(g,x-13,y-16,26,3,'#3a6a8a');IB.P(g,x-11,y-6,20,3,'#d8d0c0');}
        else if(p.type==='swing'){IB.P(g,x-9,y-16,2,16,'#7a5e38');IB.P(g,x+7,y-16,2,16,'#7a5e38');IB.P(g,x-10,y-17,18,2,'#96784e');IB.P(g,x-3,y-15,1,7,'#4e3a20');IB.P(g,x+2,y-15,1,7,'#4e3a20');IB.P(g,x-4,y-9,7,2,'#8a5a3a');}
        else if(p.type==='slide'){IB.PA(g,[[x-8,y-16],[x-6,y-16],[x-2,y],[x-4,y]],'#96784e');IB.PA(g,[[x-6,y-16],[x+8,y-6],[x+10,y-4],[x-2,y-4]],'#6a9ac8');IB.P(g,x-8,y-18,4,2,'#7a5e38');}
      }
      break;}
    case 'deadtree':{
      /* сухостій (PNG з першої частини) — у глибині лісу */
      const im=IB.img('dead');
      IB.O(g,x+2,y,6,2.2,'#00000020');
      if(im){const an=IB.V5_ANCH['dead']||{ax:11,ay:33};g.drawImage(im,x-an.ax,y-an.ay);}
      else{IB.P(g,x-1,y-16,2,16,'#4e4238');IB.P(g,x-4,y-12,4,1,'#4e4238');IB.P(g,x+1,y-10,4,1,'#4e4238');}
      break;}
    /* ==================== v28.0 «МОЄ АВТО»: АЗС І АВТОРИНОК ==================== */
    case 'pump':{
      /* паливна колонка: білий корпус з екраном, шланг, плита-фундамент.
         p.azs — індекс заправки (E → меню заправки) */
      IB.O(g,x+3,y,12,3.5,'#00000030');
      IB.P(g,x-7,y-2,15,3,'#8a8a84');                    /* бетонна плита */
      IB.isoBox(g,x-5,y-3,11,7,17,'#e8e8e2','#d0d0ca','#b8b8b0');
      IB.P(g,x-3,y-16,7,4,'#2a4a68');                    /* екран ціни */
      IB.P(g,x-2,y-15,5,2,'#f0d050');                    /* цифри світяться */
      IB.P(g,x-1,y-10,3,6,'#3a455c');                    /* шланг-кронштейн */
      IB.P(g,x+1,y-9,4,1,'#262a30');IB.P(g,x+4,y-8,1,5,'#262a30'); /* шланг */
      if(p.azs===undefined||p.azs<2)IB.P(g,x-4,y-2,9,1,'#e07038');   /* смуга мережі */
      else IB.P(g,x-4,y-2,9,1,'#3aa0e0');
      break;}
    case 'azssign':{
      /* щит цін заправки (референс гравця: стела біля дороги) */
      IB.O(g,x+2,y,10,3,'#00000028');
      IB.P(g,x-1,y-14,3,14,'#8a9098');                   /* стійка */
      IB.isoBox(g,x-8,y-20,17,9,10,'#e8e8e2','#d4d4cc','#bcbcb4');
      IB.P(g,x-6,y-19,13,3,'#2a4a68');
      const pr=['57','56','55','58'][p.azs||0];
      g.font='bold 6px monospace';g.fillStyle='#f0d050';g.fillText(pr+'95',x-4,y-14.5);
      IB.P(g,x-6,y-13,13,1,'#c85048');
      break;}
    case 'carnew':{
      /* вертикальний банер «НОВІ АВТО» — як на референсі авторинку */
      IB.O(g,x+2,y,9,3,'#00000028');
      IB.P(g,x-1,y-26,2,26,'#5e4628');                   /* щогла */
      IB.PA(g,[[x-1,y-26],[x-1,y-1],[x+10,y-4],[x+10,y-23]],'#c82838');
      g.save();g.translate(x+4.5,y-14);g.rotate(1.5708);
      g.font='bold 7px monospace';g.fillStyle='#f4f4f8';g.textAlign='center';
      g.fillText('НОВІ',0,-2);g.fillText('АВТО',0,6);
      g.restore();g.textAlign='left';
      IB.P(g,x-1,y-27,11,2,'#e8e8e2');
      break;}
    case 'mush':{
      IB.O(g,x,y-2,3.5,2,'#e8dcc8');IB.O(g,x-3,y-2,2.5,1.5,'#d8c8a8');
      IB.O(g,x-1,y-5,4,2.5,'#c85048');IB.O(g,x-4,y-4,2.5,1.5,'#b84038');
      IB.P(g,x-2,y-5,1,1,'#f0e8e0');IB.P(g,x+0,y-4,1,1,'#f0e8e0');
      break;}
    case 'triph':{
      const pl=0.5+IB.M.sin(performance.now()*0.006)*0.3;
      IB.O(g,x,y-2,3,2,'#e8d8f0');
      IB.O(g,x-1,y-6,4,3,'rgba(176,106,224,'+pl+')');
      IB.O(g,x-1,y-6,2,1.5,'rgba(240,200,255,'+pl+')');
      g.strokeStyle='rgba(176,106,224,'+pl*0.7+')';g.beginPath();g.arc(x,y-4,7,0,7);g.stroke();
      break;}
    case 'herb':{
      IB.P(g,x-1,y-4,1,4,'#3a6a3a');IB.P(g,x,y-6,1,3,'#3a6a3a');
      IB.O(g,x-2,y-5,1.5,1.5,'#e8d050');IB.O(g,x+1,y-6,1.5,1.5,'#e8d050');
      break;}
    /* ===== v3.0 «ПАНЕЛІ І ЧАЙКИ»: нові пропси ===== */
    case 'sunfl':{
      /* соняшники одеських полів */
      const sw=IB.M.sin(performance.now()*0.0012+p.x)*1.4;
      IB.P(g,x-1,y-14,2,14,'#3e7a34');
      IB.P(g,x-1,y-8,3,2,'#4e9440');
      IB.O(g,x+sw,y-17,4.4,4.4,'#e8c028');
      IB.O(g,x+sw,y-17,2.6,2.6,'#8a5a20');
      IB.PA(g,[[x-4,y-14],[x-2,y-17],[x,y-13]],'#3e7a34');
      IB.PA(g,[[x+3,y-13],[x+5,y-16],[x+6,y-12]],'#4e9440');
      break;}
    case 'hay':{
      /* стіг сіна */
      IB.O(g,x+2,y,10,3.5,'#00000028');
      IB.O(g,x,y-6,8,6,'#c8a850');
      IB.O(g,x,y-9,6,4,'#d8b860');
      IB.P(g,x-6,y-4,12,2,'#a89040');
      break;}
    case 'sandbox':{
      /* пісочниця двору — бортик і пісок */
      IB.rhomb(g,x-9,y,20,11,'#a87848');
      IB.rhomb(g,x-7,y+1,15,8,'#e0cc98');
      IB.P(g,x-3,y+2,4,2,'#c85078');
      IB.O(g,x+4,y+3,2,1.6,'#3aa0e0');
      break;}
    case 'bball':{
      /* баскетбольна стійка двору */
      IB.P(g,x-2,y-24,3,24,'#5a6068');
      IB.P(g,x-2,y-2,10,3,'#5a6068');
      IB.P(g,x+6,y-24,1.6,10,'#e8e8e2');
      IB.rhomb(g,x+7,y-14,10,6,'#e07038');
      g.strokeStyle='#e8e8e2';g.lineWidth=1;
      g.beginPath();g.moveTo(x+13,y-10);g.lineTo(x+13,y-5);g.stroke();
      IB.O(g,x+2,y+2,8,3,'#00000022');
      break;}
    case 'gullfeed':{
      /* ГОДІВНИЦЯ ЧАЙОК — стійка з лотком хліба */
      IB.O(g,x+2,y,8,2.6,'#00000028');
      IB.P(g,x-1,y-16,2,16,'#8a6a48');
      IB.P(g,x-7,y-18,14,3,'#a68754');
      for(let i=0;i<4;i++)IB.O(g,x-5+i*3.4,y-20,2.4,1.6,'#d8b060');
      const bob2=IB.M.sin(performance.now()*0.004+p.x)*1.2;
      g.font='8px monospace';g.fillStyle='#f0d050';
      g.fillText('🐦',x-3,y-26+bob2);
      break;}
    case 'flower':{
      IB.P(g,x,y-3,1,3,'#3e5a32');
      IB.O(g,x,y-4,1.6,1.3,v<0.5?'#c85078':'#e8d050');
      break;}
    case 'rock':{
      IB.O(g,x+2,y,6,2.5,'#00000028');
      IB.PA(g,[[x-5,y],[x-2,y-5],[x+3,y-6],[x+6,y-1]],'#58605a');
      IB.PA(g,[[x-2,y-5],[x+3,y-6],[x+4,y-2],[x-1,y-1]],'#6e7872');
      break;}
    case 'tower':{
      IB.O(g,x+3,y,8,3,'#00000030');
      IB.PA(g,[[x-7,y],[x-3,y-16],[x+2,y-18],[x+7,y-2]],'#58605a');
      IB.PA(g,[[x-3,y-16],[x+2,y-18],[x+4,y-10],[x-1,y-9]],'#6e7872');
      IB.P(g,x-2,y-8,3,1,'#3e4440');
      break;}
    case 'wood':{
      if(p.amt>0){IB.P(g,x-6,y-2,12,3,'#7a5e38');IB.P(g,x-6,y-2,12,1,'#96784e');IB.O(g,x-6,y-1,1.5,1.5,'#5e4628');
        if(p.amt>1){IB.P(g,x-4,y-5,10,3,'#6a5230');IB.O(g,x+6,y-3.5,1.5,1.5,'#4e3a20');}}
      break;}
    /* ================= i3-gfx-patch: ПРОПСИ КУРОРТУ ================= */
    case 'palm':{
      IB.O(g,x+4,y,8,3,'#00000030');
      /* v20.0: пальми хитаються ВІТРОМ (пориви з sky.js) */
      const wMul=(IB.SKY&&IB.SKY.wind)?IB.M.min(2.2,IB.SKY.wind.mul):1;
      const sway=IB.M.sin(performance.now()*0.0012*(0.7+wMul*0.6)+p.x)*(1+wMul*0.9);
      IB.PA(g,[[x-2,y],[x-1,y-22],[x+2,y-22],[x+3,y]],'#8a6a48');
      IB.P(g,x-2,y-8,4,2,'#6a5238');
      const cy=y-22;
      const fr=[[0,-9],[7,-6],[-7,-6],[4,-10],[-4,-9],[9,-2],[-9,-2]];
      for(const f of fr){
        IB.PA(g,[[x,cy],[x+fr[0]*1.6+sway,cy+fr[1]-2],[x+fr[0]*0.6+sway,cy+fr[1]*0.4]],'#3e7a34');
      }
      for(const f of fr){IB.PA(g,[[x,cy+1],[x+fr[0]*1.4+sway,cy+fr[1]+1],[x,cy+2]],'#4e9440');}
      if(IB.hsh(p.x,p.y,33)>0.8){IB.O(g,x+2,cy+3,2,1.5,'#8a6a48');}
      break;}
    case 'umb':{
      /* парасолка від сонця */
      const uc=['#e05a5a','#3aa0e0','#e8d050','#4ee06a','#e07ab8'][IB.hsh(p.x,p.y,34)*5|0];
      IB.O(g,x+3,y,10,3.5,'#00000030');
      IB.P(g,x-1,y-14,1.6,14,'#d8d0c0');
      for(let i=0;i<6;i++){
        IB.PA(g,[[x-16+i*5.4,y-14],[x-13+i*5.4,y-22],[x-8+i*5.4,y-14]],i%2?uc:IB.shade(uc,-0.25));
      }
      IB.P(g,x-2,y-23,4,2,'#e8e8e0');
      break;}
    case 'lounger':{
      IB.O(g,x+3,y,10,3,'#00000026');
      IB.P(g,x-9,y-5,18,3,'#3aa0e0');
      IB.PA(g,[[x+6,y-5],[x+11,y-11],[x+13,y-10],[x+9,y-4]],'#3aa0e0');
      IB.P(g,x-7,y-2,2,3,'#c8c8c8');IB.P(g,x+6,y-2,2,3,'#c8c8c8');
      break;}
    case 'towel':{
      const tc=['#e05a5a','#4ee06a','#e07ab8','#3aa0e0'][IB.hsh(p.x,p.y,35)*4|0];
      IB.rhomb(g,x-2,y+2,22,12,tc);
      IB.P(g,x-2,y,22,2,IB.shade(tc,0.2));
      break;}
    case 'canopy':{
      /* v14: КОЗИРОК — тіньовий навіс на стовпчиках (пляж) */
      IB.O(g,x+2,y+1,20,7,'#00000028');
      const cc=['#e05a5a','#3aa0e0','#e8d050'][IB.hsh(p.x,p.y,44)*3|0];
      IB.P(g,x-14,y-16,2.4,16,'#c8c8c8');IB.P(g,x+12,y-16,2.4,16,'#c8c8c8');
      IB.PA(g,[[x-18,y-14],[x,y-24],[x+18,y-14],[x,y-9]],cc);
      IB.PA(g,[[x-18,y-14],[x,y-9],[x+18,y-14],[x,y-11]],IB.shade(cc,-0.28));
      IB.P(g,x-1,y-25,2,3,'#e8e8e0');
      break;}
    case 'pingpong':{
      /* v14: стіл пінг-понгу (пляж) */
      IB.O(g,x+2,y,14,5,'#00000026');
      IB.P(g,x-13,y-8,26,10,'#2a6ac8');
      IB.P(g,x-13,y-8,26,2,'#4e94e8');
      IB.P(g,x-1,y-8,2,10,'#e8e8e2');
      IB.P(g,x-11,y+2,2,3,'#8a6a48');IB.P(g,x+9,y+2,2,3,'#8a6a48');
      break;}
    case 'bin':{
      IB.isoBox(g,x-5,y,12,8,10,'#3e4e44','#324038','#2a362e');
      IB.P(g,x-6,y-12,14,2,'#4e9440');
      IB.P(g,x-1,y-9,4,3,'#e8d050');
      break;}
    case 'trash':{
      /* купка сміття — робота «збирати сміття» */
      IB.O(g,x+1,y+1,8,3,'#00000022');
      IB.O(g,x-2,y-2,5,2.5,'#6a7a58');IB.O(g,x+3,y-1,4,2,'#8a8c94');IB.O(g,x-1,y-4,3,1.6,'#e8d050');
      IB.P(g,x+1,y-5,3,1.6,'#e05a5a');
      if(IB.hsh(p.x,IB.G.day,36)>0.7){IB.P(g,x-3,y-6,2,2,'#c8d8e4');}
      break;}
    case 'net':{
      /* волейбольна сітка */
      IB.P(g,x-16,y-14,1.6,14,'#c8c8c8');IB.P(g,x+14,y-14,1.6,14,'#c8c8c8');
      for(let i=0;i<9;i++)IB.P(g,x-16+i*3.7,y-12,2,1.2,'#e8e8e2aa');
      for(let j=0;j<3;j++)IB.P(g,x-16,y-12+j*3,32,1,'#e8e8e2aa');
      IB.P(g,x-17,y-15,34,1.4,'#e8d050');
      break;}
    case 'goal':{
      /* футбольні ворота (3м) */
      g.strokeStyle='#e8e8e2';g.lineWidth=1.5;
      g.strokeRect(x-14,y-13,28,13);
      for(let i=0;i<5;i++)IB.P(g,x-13+i*5.6,y-12,1,11,'#e8e8e277');
      IB.P(g,x-15,y-14,30,1.6,'#e8e8e2');
      break;}
    case 'tower':{
      if(p.lg){break;}
      /* скельний стовп — не використовується на пляжі */
      IB.PA(g,[[x-5,y],[x-2,y-5],[x+3,y-6],[x+6,y-1]],'#58605a');
      break;}
    case 'lg':
    case 'lifeguard':{
      /* рятувальна вишка */
      IB.P(g,x-6,y-2,2,6,'#8a6a48');IB.P(g,x+5,y-2,2,6,'#8a6a48');
      IB.isoBox(g,x-8,y-8,18,10,8,'#e05a5a','#c84848','#a83a3a');
      IB.PA(g,[[x-10,y-16],[x+10,y-16],[x,y-22]],'#e8d050');
      IB.P(g,x-3,y-11,7,3,'#2a3e5c');
      break;}
    case 'buoy':{
      const bob=IB.M.sin(performance.now()*0.003+p.x)*1.4;
      IB.O(g,x,y+bob,3.5,2,'#e05a5a');
      IB.P(g,x-1,y+bob-4,2,3,'#e8d050');
      break;}
    /* ---------- v18: НОВІ ПРОПСИ ---------- */
    case 'zflag':{ /* прапор-орієнтир району пляжу (кожен район — свій колір) */
      const fl9=IB.M.sin(performance.now()*0.004+p.x)*1.6;
      IB.P(g,x-1,y-18,1.6,20,'#8a8078');
      g.fillStyle=p.col||'#e02838';
      g.beginPath();g.moveTo(x,y-17);g.lineTo(x+11,y-14+fl9);g.lineTo(x,y-10);g.closePath();g.fill();
      break;}
    case 'rock':{ /* камені дикої ділянки пляжу */
      IB.PA(g,[[x-6,y+4],[x+2,y-3],[x+12,y+1],[x+6,y+8],[x-4,y+8]],'#8a8878');
      IB.PA(g,[[x+2,y-3],[x+12,y+1],[x+6,y-2]],'#a8a698');
      break;}
    case 'palhull':{ /* «ПАЛЛАДА» НА СТАПЕЛЯХ — секції ростуть по днях (С2) */
      const stg9=IB.palStage?IB.palStage():0;
      if(stg9>0){
        IB.P(g,x-14,y+6,62,3,'#6a5a48');
        if(stg9>=1)IB.PA(g,[[x-12,y+4],[x+46,y+4],[x+40,y-6],[x-6,y-6]],'#5a4638');
        if(stg9>=2)IB.PA(g,[[x-8,y-6],[x+42,y-6],[x+36,y-14],[x-2,y-14]],'#8a6a50');
        if(stg9>=3)IB.P(g,x-2,y-20,38,6,'#a88868');
        if(stg9>=4){IB.P(g,x+6,y-27,12,7,'#c8b898');IB.P(g,x+20,y-26,5,6,'#b8a888');}
        if(stg9>=5)IB.P(g,x+16,y-34,4,8,'#d04828');
        if(IB.hsh(p.x,p.y,91)>0.4)IB.P(g,x+30,y-8,3,3,'#e8c050'); /* зварювальний іскрлястий */
      }
      break;}
    case 'pallada':{ /* після спуску — корабель на воді біля портового пірса */
      const bb9=IB.M.sin(performance.now()*0.002+p.x)*1.2;
      IB.O(g,x+20,y+6,30,4,'#0e2a3488');
      IB.PA(g,[[x-6,y+2+bb9],[x+52,y+2+bb9],[x+44,y-10+bb9],[x+2,y-10+bb9]],'#2a3038');
      IB.PA(g,[[x-6,y+2+bb9],[x+52,y+2+bb9],[x+50,y+6+bb9],[x-4,y+6+bb9]],'#d04828');
      IB.P(g,x+8,y-18+bb9,12,8,'#e8e8e0');IB.P(g,x+22,y-17+bb9,3,7,'#d04828');
      break;}
    case 'wreckbuoy':{ /* буй над затонулим барж-складом (С5) */
      const bw9=IB.M.sin(performance.now()*0.0035+p.x)*1.8;
      IB.O(g,x+16,y+8,12,4,'#0e2a3488');
      IB.O(g,x+16,y-2+bw9,5,3.4,'#e8ecf0');IB.O(g,x+16,y-6+bw9,3,2.4,'#f0d060');
      IB.P(g,x+16,y-14+bw9,1.4,7,'#8a8078');
      g.fillStyle='#20262c';g.beginPath();g.arc(x+16,y-15+bw9,2,0,6.283);g.fill();
      break;}
    case 'screen':{ /* кіноекран на піску — нічний кінопоказ (С7) */
      IB.P(g,x-2,y-6,2,14,'#5a5048');IB.P(g,x+30,y-6,2,14,'#5a5048');
      IB.P(g,x-2,y-19,36,1.6,'#5a5048');
      IB.P(g,x,y-17,32,10,'#18202a');
      if(IB.nightFactor()>0.3){
        IB.P(g,x+2,y-15,28,6,'rgba(160,200,255,0.25)');
        IB.P(g,x+8,y-13,6,3,'#dfe8f0aa');IB.P(g,x+18,y-12,7,2,'#dfe8f088');
      }
      break;}
    case 'stall':{ /* ярмарковий намет — «ЯРМАРОК СЕЛ» (С7) */
      IB.PA(g,[[x+2,y-10],[x+16,y-16],[x+30,y-10],[x+16,y-6]],'#d04838');
      IB.PA(g,[[x+2,y-10],[x+16,y-6],[x+16,y+2],[x+2,y+2]],'#c8b898');
      IB.PA(g,[[x+16,y-6],[x+30,y-10],[x+30,y+2],[x+16,y+2]],'#b8a888');
      IB.P(g,x+8,y-4,3,2,'#e8c030');IB.P(g,x+16,y-3,3,2,'#e07830');
      break;}
    case 'catam':{
      /* педальний катамаран з гіркою */
      const bob=IB.M.sin(performance.now()*0.0025+p.x)*1.2;
      IB.O(g,x-10,y+bob,10,3,'#1a3a44');IB.O(g,x+10,y+bob,10,3,'#1a3a44');
      IB.P(g,x-11,y+bob-3,9,3,'#e05a5a');IB.P(g,x+3,y+bob-3,9,3,'#e05a5a');
      IB.isoBox(g,x-8,y+bob-8,16,9,6,'#e8e8e2','#d8d0c0','#c8c0b8');
      IB.P(g,x-2,y+bob-14,8,3,'#3aa0e0');
      IB.PA(g,[[x+6,y+bob-10],[x+12,y+bob-2],[x+8,y+bob-2]],'#e8d050');
      break;}
    case 'paras':{
      /* катер парасейлінгу + парашут у небі */
      const bob=IB.M.sin(performance.now()*0.003)*1.5;
      IB.PA(g,[[x-13,y+bob],[x+13,y+bob],[x+9,y+bob+5],[x-9,y+bob+5]],'#e8e8e2');
      IB.P(g,x-6,y+bob-3,12,3,'#e05a5a');
      const kx=x-20,ky=y-58;
      g.strokeStyle='#c8c8c8';g.beginPath();g.moveTo(x+4,y+bob-3);g.lineTo(kx+6,ky+8);g.stroke();
      IB.PA(g,[[kx-16,ky],[kx-8,ky-9],[kx+6,ky-11],[kx+18,ky-8],[kx+22,ky],[kx+12,ky+4],[kx-6,ky+4]],'#e8d050');
      IB.PA(g,[[kx-14,ky+1],[kx,ky+9],[kx+16,ky+1]],'#3aa0e0aa');
      break;}
    case 'crane':{
      /* портовий кран */
      IB.P(g,x-2,y-3,4,4,'#e0a030');IB.P(g,x-2,y-26,4,24,'#e8c050');
      IB.P(g,x-2,y-26,22,3,'#e8c050');
      g.strokeStyle='#c8a030';g.beginPath();g.moveTo(x+20,y-25);g.lineTo(x+20,y-10);g.stroke();
      IB.P(g,x+18,y-10,4,3,'#b84840');
      IB.P(g,x-3,y-3,6,3,'#3a3e4c');
      break;}
    case 'contstack':{
      /* v20.0: СТЕК КОНТЕЙНЕРІВ 2-3 яруси — різні кольори/довжини, зсув,
         рифлені стінки, двері з штангами, коди, іржа — ІНДУСТРІАЛЬНИЙ ПОРТ */
      const n2=2+(IB.hsh(p.x,p.y,61)*2|0);
      let sx2=0;
      for(let i=0;i<n2;i++){
        const lift2=-i*13;
        sx2+=(IB.hsh(p.x,p.y,i+63)-0.5)*3.2;
        paintContainer(g,x+sx2,y+lift2,p.x*3.1+p.y*7.7+i*13.7,0);
      }
      break;}
    case 'cranebig':{
      /* v18.7: ВЕЛИКИЙ ПОРТАЛЬНИЙ КРАН (гантрі) — 64px, на рейках */
      g.fillStyle='#2a2f3a';g.fillRect(x-26,y+6,52,3); /* рейки */
      IB.P(g,x-20,y-14,5,20,'#e0a030');IB.P(g,x+15,y-14,5,20,'#e0a030'); /* ноги */
      IB.P(g,x-24,y-16,48,4,'#e8c050'); /* портал */
      IB.P(g,x-3,y-46,6,32,'#e8c050');  /* башта */
      IB.P(g,x-30,y-46,60,4,'#f0d050'); /* стріла */
      g.strokeStyle='#c8a030';g.lineWidth=1;
      g.beginPath();g.moveTo(x+22,y-44);g.lineTo(x+30,y-14);g.stroke();
      IB.P(g,x+26,y-14,4,4,'#b84840');  /* вантаж */
      g.strokeStyle='#c8a030';g.beginPath();g.moveTo(x+28,y-42);g.lineTo(x+28,y-16);g.stroke();
      IB.P(g,x-6,y-52,10,6,'#e8c050');  /* кабіна */
      IB.P(g,x-4,y-51,3,3,'#3aa0e0');   /* вікно кабіни */
      IB.P(g,x-24,y-16,48,1.6,'#f8e8a0');
      break;}
    case 'portoffice':{
      /* v18.7: ОФІСНИЙ МОДУЛЬ ПОРТУ — 2 поверхи, вікна, вивіска */
      IB.isoBox(g,x-11,y,24,12,16,'#8a94a4','#6e7888','#5a6472');
      for(let r2=0;r2<2;r2++)for(let i=0;i<3;i++){
        IB.P(g,x-8+i*6,y-11-r2*6,4,3.4,'#bfe0f0');
      }
      IB.P(g,x-8,y-17,16,1.4,'#4e5a68');
      IB.P(g,x-2,y-4,10,3,'#2a3440'); /* двері */
      IB.P(g,x-10,y-2,20,2,'#e07038'); /* вивіска-смуга */
      break;}
    case 'tank':{
      /* v18.7: СИЛОС/ЦИСТЕРНА — циліндр з драбиною */
      IB.O(g,x,y-10,10,10,'#9aa4b0');IB.O(g,x,y-10,10,10,'#8a94a0');
      g.fillStyle='#8a94a0';g.fillRect(x-10,y-10,20,14);
      g.fillStyle='#a8b2be';g.fillRect(x-10,y-10,20,2);
      IB.O(g,x,y-24,10,5,'#b8c2cc');
      g.strokeStyle='#5a6472';g.beginPath();g.moveTo(x+11,y+2);g.lineTo(x+11,y-26);g.stroke();
      for(let i=0;i<5;i++)IB.P(g,x+10,y-24+i*5,3,1,'#5a6472');
      break;}
    case 'pallets':{
      /* v18.7: ТАРА/ПАЛЕТИ */
      IB.isoBox(g,x-6,y,12,7,5,'#b09060','#967a4e','#7c6440');
      IB.isoBox(g,x+2,y-4,9,6,4,'#a88850','#8e7444','#746040');
      IB.P(g,x-8,y-6,16,1,'#c8a870');
      break;}
    case 'container':{
      /* v20.0: СПРАВЖНІЙ МОРСЬКИЙ КОНТЕЙНЕР (гравець: «це ж контейнери — там
         таке можна скласти гарне, збільшуй») — 20/40 футів: рифлені стінки,
         двері з 4 штангами, кутові фитинги, кодова маркування, іржа;
         лежить поперек/вздовж за seed */
      const rot2=IB.hsh(p.x,p.y,39)<0.3;
      if(rot2)paintContainerV(g,x,y,p.x*2.3+p.y*5.1,0);
      else paintContainer(g,x,y,p.x*2.3+p.y*5.1,0);
      break;}
    case 'reachstacker':{
      /* v20.0: ШТАБЕЛЕР — жовто-чорний навантажувач тримає контейнер */
      IB.O(g,x+4,y,24,8,'#00000033');
      IB.P(g,x-10,y+2,22,2,'#2a2f3a');IB.P(g,x-6,y+4,14,2,'#2a2f3a'); /* колісна база */
      IB.O(g,x-8,y+3,3.4,2,'#1a1e26');IB.O(g,x+2,y+3,3.4,2,'#1a1e26');IB.O(g,x+9,y+3,3.4,2,'#1a1e26');
      IB.isoBox(g,x-11,y-4,22,10,7,'#e08a28','#c87418','#a86010');   /* кузов */
      IB.isoBox(g,x-10,y-11,9,7,6,'#e8e8e2','#c8c8b8','#b0b0a0');    /* кабіна */
      IB.P(g,x-8,y-9,4,3,'#3aa0e0');
      /* вилочна рама + контейнер у захваті */
      IB.P(g,x+11,y-2,2,12,'#e0a030');IB.P(g,x+15,y-2,2,12,'#e0a030');
      paintContainer(g,x+9,y-11,7.7,0,true);
      /* проблісковий маяк */
      if(IB.M.sin(performance.now()*0.006)>0)IB.O(g,x-4,y-19,2,1.6,'#ffb028');
      break;}
    case 'portlight':{
      /* v20.0: ЩОГЛА-ПРОЖЕКТОР ПОРТУ — стовп, перекладина, корпуси головок;
         ПОТУЖНЕ холодне світло вночі малюється у нічному проході поверх
         оверлея (див. renderWorld) */
      IB.P(g,x-2,y-36,4,36,'#4a5058');
      IB.P(g,x-5,y-2,10,4,'#3a4048');IB.P(g,x-4,y-6,8,4,'#444a52');
      const top2=y-36;
      IB.P(g,x-14,top2,28,2.4,'#5a6068');
      IB.P(g,x-12,top2+1,7,3,'#2a2e36');IB.P(g,x+5,top2+1,7,3,'#2a2e36');
      break;}
    case 'yardmark':{
      /* v20.0: РОЗМІТКА КОНТЕЙНЕРНОГО ЯРДУ — жовтий слот з кутниками і номером */
      const yn=IB.hsh(p.x,p.y,45);
      g.strokeStyle='rgba(232,190,60,0.55)';g.lineWidth=1.4;
      g.beginPath();g.moveTo(x-13,y);g.lineTo(x,y-6.5);g.lineTo(x+13,y);g.lineTo(x,y+6.5);g.closePath();g.stroke();
      g.strokeStyle='rgba(232,190,60,0.35)';g.lineWidth=1;
      g.beginPath();g.moveTo(x-13,y);g.lineTo(x,y+6.5);g.stroke();
      /* кутники-заходи */
      g.fillStyle='rgba(232,190,60,0.5)';
      g.fillRect(x-13,y-1,4,1.4);g.fillRect(x+9,y+0.2,4,1.4);
      if(yn>0.6){g.font='6px monospace';g.fillStyle='rgba(232,190,60,0.6)';g.fillText('A'+((yn*90)|0),x-8,y+5);}
      break;}
    case 'ferry':{
      /* пором — білий, з червоною смугою */
      const bob=IB.M.sin(performance.now()*0.0016)*1.6;
      IB.PA(g,[[x-26,y+bob],[x+26,y+bob],[x+20,y+bob+9],[x-20,y+bob+9]],'#2a3e50');
      IB.PA(g,[[x-24,y+bob-4],[x+24,y+bob-4],[x+26,y+bob],[x-26,y+bob]],'#e8e8e2');
      IB.P(g,x-24,y+bob-1,48,3,'#c83828');
      IB.isoBox(g,x-10,y+bob-14,22,10,8,'#e8e8e2','#d8d0c0','#c8c0b8');
      for(let i=0;i<4;i++)IB.P(g,x-7+i*5,y+bob-10,3,2,'#2a3e5c');
      IB.P(g,x+8,y+bob-18,2,5,'#e8d050');
      if(IB.M.sin(performance.now()*0.004)>0)IB.P(g,x-30,y+bob+3,6,1,'#c8d8e055');
      break;}
    case 'yacht2':{
      /* яхта клубна */
      const bob=IB.M.sin(performance.now()*0.002+p.y)*1.3;
      IB.PA(g,[[x-9,y+bob],[x+9,y+bob],[x+6,y+bob+4],[x-6,y+bob+4]],'#e8e8e2');
      IB.isoBox(g,x-5,y+bob-7,11,6,5,'#e8e8e2','#d8d0c0','#c8c0b8');
      IB.P(g,x-1,y+bob-14,1.6,7,'#8a8c94');
      IB.PA(g,[[x+1,y+bob-14],[x+9,y+bob-10],[x+1,y+bob-9]],'#e8e8e2');
      break;}
    /* ============ v2.0 «РАЙОНИ І ЛЮДИ»: нові пропси ============ */
    case 'wheel':{
      /* колесо огляду луна-парку — обертається */
      const ang=performance.now()*0.0005;
      IB.O(g,x+2,y,16,4,'#00000030');
      IB.P(g,x-3,y-2,6,3,'#3e4244');IB.P(g,x-2,y-5,4,4,'#54585a');
      g.strokeStyle='#c8c8c8';g.lineWidth=1.5;
      g.beginPath();g.arc(x,y-30,22,0,7);g.stroke();
      for(let i=0;i<8;i++){
        const a=ang+i*0.785;
        const px2=x+IB.M.cos(a)*22,py2=y-30+IB.M.sin(a)*22;
        g.beginPath();g.moveTo(x,y-30);g.lineTo(px2,py2);g.stroke();
        const cc=['#e05a5a','#3aa0e0','#e8d050','#4ee06a'][i%4];
        IB.PA(g,[[px2-3,py2],[px2+3,py2],[px2+3,py2+4],[px2-3,py2+4]],cc);
        IB.P(g,px2-1,py2+1,2,2,'#2a3e5c');
      }
      IB.P(g,x-16,y-32,32,2,'#e8d050');
      break;}
    case 'carousel':{
      /* карусель з кониками — обертається */
      const ang=performance.now()*0.0012;
      IB.O(g,x+2,y,12,3,'#00000030');
      IB.P(g,x-8,y-14,16,1.6,'#e8d050');IB.P(g,x-8,y-8,16,1.2,'#e0a030');
      IB.P(g,x-1,y-8,2,8,'#8a8c94');
      for(let i=0;i<4;i++){
        const a=ang+i*1.57;
        const px2=x+IB.M.cos(a)*7,py2=y-10+IB.M.sin(a)*2.4;
        IB.P(g,px2-0.5,py2-4,1,7,'#c8c8c8');
        IB.O(g,px2,py2+3,4,3,['#e05a5a','#e8d050','#3aa0e0','#4ee06a'][i]);
        IB.P(g,px2-1,py2-1,1,4,'#5e4628');
      }
      IB.PA(g,[[x-10,y-16],[x,y-21],[x+10,y-16]],'#e05a5a');
      IB.P(g,x-10,y-17,20,1.4,'#e8d050');
      break;}
    case 'autodrom':{
      /* автодром — дві машинкі на майданчику */
      IB.rhomb(g,x-4,y+2,34,16,'#8a6a3c');
      const bob=IB.M.sin(performance.now()*0.003)*1.2;
      IB.isoBox(g,x-12,y-4+bob,12,6,4,'#e05a5a','#c84848','#a83a3a');
      IB.isoBox(g,x+2,y-2-bob,12,6,4,'#3aa0e0','#3488c8','#2a6aa8');
      IB.P(g,x-9,y-7+bob,7,2,'#a8d8e8');
      IB.P(g,x+5,y-5-bob,7,2,'#a8d8e8');
      break;}
    case 'tramp':{
      /* батут — 50 грн за 10 хвилин стрибків */
      IB.O(g,x+3,y+1,12,3,'#00000030');
      IB.P(g,x-11,y-4,2,5,'#3e4244');IB.P(g,x+9,y-4,2,5,'#3e4244');
      IB.rhomb(g,x-2,y,26,12,'#2a3e5c');
      IB.rhomb(g,x-1,y-1,22,10,'#4a6a9c');
      IB.P(g,x-10,y-6,20,1.4,'#e8d050');
      IB.P(g,x-8,y-9,3,4,'#e05a5a');IB.P(g,x+5,y-9,3,4,'#e8d050');
      break;}
    case 'train':{
      /* паровозик Молодіжного парку */
      IB.O(g,x+2,y,14,3,'#00000030');
      IB.isoBox(g,x-12,y-6,18,9,7,'#e05a5a','#c84848','#a83a3a');
      IB.P(g,x-6,y-16,5,10,'#3e4244');
      IB.O(g,x-4,y-18,3,3,'#2a2a2a');
      IB.P(g,x-2,y-19,1.5,4,'#c8c8c8');
      IB.isoBox(g,x+6,y-3,12,7,5,'#e8d050','#d0b840','#b8a030');
      if(IB.M.sin(performance.now()*0.006)>0.4){IB.O(g,x-4,y-22,3,3,'#c8d8e088');}
      break;}
    case 'anchor':{
      /* старовинний якорь — парк якорів (вул. Паркова) */
      IB.O(g,x+2,y+1,10,3,'#00000030');
      IB.P(g,x-1,y-14,2,14,'#6a6e78');
      IB.PA(g,[[x-7,y-9],[x-1,y-16],[x+5,y-9],[x-1,y-12]],'#7a808a');
      IB.P(g,x-6,y-5,2,4,'#6a6e78');IB.P(g,x+4,y-5,2,4,'#6a6e78');
      IB.PA(g,[[x-7,y-2],[x-3,y-3],[x-3,y+1],[x-7,y]],'#5a5e68');
      IB.PA(g,[[x+7,y-2],[x+3,y-3],[x+3,y+1],[x+7,y]],'#5a5e68');
      IB.P(g,x-4,y-16,8,2,'#8a5528');
      break;}
    case 'statue':{
      /* пам'ятник О. Данченку — засновнику порту */
      IB.isoBox(g,x-8,y,16,10,8,'#8a8c94','#7a7c84','#6a6c74');
      IB.P(g,x-2,y-18,4,12,'#a8b0bc');
      IB.O(g,x,y-20,3.5,3.5,'#c8b090');
      IB.P(g,x-2,y-22,4,3,'#2a3038');
      IB.P(g,x-3,y-16,2,7,'#2a3038');IB.P(g,x+1,y-16,2,7,'#2a3038');
      if(IB.G.wx.type==='sun'&&IB.nightFactor()<0.2)IB.P(g,x+6,y-6,4,2,'#e8d050aa');
      break;}
    case 'dsign':{
      /* синя табличка району — E: прочитати */
      IB.P(g,x-1,y-10,2,10,'#8a8c94');
      IB.P(g,x-13,y-18,26,9,'#2255aa');
      IB.P(g,x-13,y-18,26,1,'#5588dd');IB.P(g,x-13,y-10,26,1,'#1a4488');
      g.font='6px monospace';g.fillStyle='#e8f0f8';
      const nm=(p.name||'ЧОРНОМОРСЬК').slice(0,15);
      g.fillText(nm,x+13-g.measureText(nm).width/2,y-12);
      break;}
    case 'surf':{
      /* прокат серфів — дошки стіймою */
      IB.P(g,x-6,y-14,2.4,14,'#e8d050');
      IB.PA(g,[[x-7,y-16],[x-4,y-16],[x-4.5,y-13],[x-6.5,y-13]],'#e05a5a');
      IB.P(g,x+1,y-12,2.4,12,'#3aa0e0');
      IB.PA(g,[[x+0.5,y-14],[x+4,y-14],[x+3.5,y-11],[x+1.5,y-11]],'#e8e8e2');
      IB.P(g,x-9,y-1,18,2,'#c8c0b8');
      break;}
    case 'jetski':{
      /* гідроцикл на мілководді */
      const bob=IB.M.sin(performance.now()*0.003+p.x)*1.4;
      IB.PA(g,[[x-10,y+bob],[x+8,y+bob],[x+6,y+bob+4],[x-8,y+bob+4]],'#e05a5a');
      IB.isoBox(g,x-4,y+bob-6,9,5,4,'#e8e8e2','#d8d0c0','#c8c0b8');
      IB.P(g,x-1,y+bob-9,3,3,'#2a3e5c');
      IB.P(g,x-12,y+bob+2,6,1.5,'#eef7f866');
      break;}
    case 'cabin':{
      /* роздягальна кабінка на пляжі */
      IB.P(g,x-8,y,2,12,'#8a6a48');IB.P(g,x+6,y,2,12,'#8a6a48');
      IB.PA(g,[[x-10,y-12],[x+9,y-12],[x+1,y-18]],'#e07038');
      IB.P(g,x-8,y-12,16,1.6,'#c85828');
      IB.P(g,x+1,y-6,4,6,'#3e6a34');
      break;}
    case 'tent':{
      /* великий тент-зонт від сонця */
      IB.O(g,x+3,y,12,3,'#00000030');
      IB.P(g,x-1,y-16,1.6,16,'#d8d0c0');
      IB.PA(g,[[x-13,y-14],[x,y-20],[x+13,y-14],[x,y-11]],'#e07ab8');
      IB.PA(g,[[x-13,y-14],[x,y-11],[x+13,y-14],[x,y-16]],IB.shade('#e07ab8',-0.25));
      IB.P(g,x-2,y-21,4,2,'#e8e8e0');
      break;}
    case 'beachbar':{
      /* пляжний бар «Шейкер» — стійка з зонтиком */
      IB.isoBox(g,x-10,y-4,22,10,7,'#a8763e','#8a6034','#7a5228');
      IB.P(g,x-6,y-10,14,1.6,'#e8d050');
      IB.P(g,x-1,y-20,1.6,10,'#c8c8c8');
      IB.PA(g,[[x-11,y-18],[x,y-24],[x+11,y-18]],'#4ee06a');
      IB.O(g,x-3,y-6,3,2,'#e8e8e2');IB.O(g,x+3,y-6,3,2,'#3aa0e0');
      break;}
    case 'sandcastle':{
      /* замок з піску — декор */
      IB.isoBox(g,x-5,y-2,10,8,4,'#d8c494','#c8b484','#b8a474');
      IB.isoBox(g,x-2,y-6,5,4,5,'#d8c494','#c8b484','#b8a474');
      IB.P(g,x-1,y-10,1,3,'#e05a5a');
      break;}
    case 'ball':{
      /* м'яч на піску */
      IB.O(g,x,y,3.5,2.5,'#00000022');
      IB.O(g,x,y-2,4,3.5,'#e8e8e2');
      IB.P(g,x-1.5,y-3,3,1,'#2a3e5c');
      break;}
    case 'barge':{
      /* баржа суднобудівного заводу на лимані */
      const bob=IB.M.sin(performance.now()*0.002+p.y)*1;
      IB.PA(g,[[x-14,y+bob],[x+14,y+bob],[x+11,y+bob+5],[x-11,y+bob+5]],'#5a5e68');
      IB.P(g,x-13,y+bob-1,26,2,'#3e4244');
      IB.isoBox(g,x-8,y+bob-8,10,6,6,'#e0a030','#c89028','#a87820');
      IB.P(g,x+4,y+bob-11,2,8,'#8a8c94');
      break;}
    /* ===== v5.0 «МІСТО-ТЕЛЕФОН»: СТЕЛА «ЧОРНОМОРСЬК» ===== */
    case 'stella':{
      g.fillStyle='#00000030';g.beginPath();g.ellipse(x,y-1,8,2.8,0,0,7);g.fill();
      IB.isoBox(g,x-7,y-2,14,8,13,'#b8b0a0','#a8a08e','#c0b8a8');
      IB.P(g,x-6,y-17,12,10,'#c8c0b0');
      IB.P(g,x-5,y-15,10,2,'#2a5aa8');IB.P(g,x-5,y-12,10,2,'#f0d050');IB.P(g,x-5,y-9,10,2,'#e8e8e0');
      IB.P(g,x-1,y-23,2,7,'#8a8274');
      IB.P(g,x-2,y-25,4,3,'#f0d050');
      break;}
    /* ===== v5.0: ФОНТАН (зелені двори, площа) ===== */
    case 'fountain':{
      g.fillStyle='#00000030';g.beginPath();g.ellipse(x,y-1,11,3.8,0,0,7);g.fill();
      IB.O(g,x,y-3,20,10,'#9a9a92');IB.O(g,x,y-4,17,8,'#8a8a82');
      IB.O(g,x,y-5,13,7,'#5a86b8');IB.O(g,x,y-6,10,5,'#4a76a8');
      const fph=performance.now()*0.004;
      const fhgt=5+IB.M.sin(fph)*2;
      IB.P(g,x-1,y-10-fhgt,2,fhgt+4,'#7ab2d8');
      IB.O(g,x,y-10-fhgt,4.5,2.5,'rgba(122,178,216,0.5)');
      IB.O(g,x-6,y-6,4,2,'rgba(122,178,216,0.4)');
      IB.O(g,x+5,y-6,4,2,'rgba(122,178,216,0.4)');
      IB.P(g,x-8,y-4,16,1,'rgba(122,178,216,0.28)');
      break;}
    /* ===== v5.0: ТУРНИК У ДВОРІ ===== */
    case 'hbar':{
      g.fillStyle='#00000030';g.beginPath();g.ellipse(x,y-1,6,2,0,0,7);g.fill();
      IB.P(g,x-7,y-15,14,2,'#4a8ac8');
      IB.P(g,x-7,y-13,2,13,'#3a6aa8');IB.P(g,x+5,y-13,2,13,'#3a6aa8');
      IB.P(g,x-5,y-15,10,1,'#6aaad8');
      break;}
    /* ===== v5.0: ЗУПИНКА МАРШРУТКИ №7 ===== */
    case 'bstop':{
      g.fillStyle='#00000032';g.beginPath();g.ellipse(x,y-1,11,3.2,0,0,7);g.fill();
      IB.isoBox(g,x-10,y-3,18,9,4,'#3a6aa8','#2e5a9a','#427ac0');
      IB.P(g,x-9,y-13,16,2,'#4a7ab8');
      IB.P(g,x-9,y-13,2,11,'#3a5a8a');IB.P(g,x+6,y-13,2,11,'#3a5a8a');
      IB.P(g,x-7,y-11,12,7,'#d8e4ee');
      IB.P(g,x-6,y-10,10,5,'#f0d050');
      g.font='5px monospace';g.fillStyle='#2a3a5a';
      g.fillText('№7',x-4,y-6);
      const mAr=IB.M.sin(performance.now()*0.002+p.x)>0.55;
      if(mAr){g.font='7px monospace';g.fillStyle='#f0d050';g.fillText('◄',x+12,y-16);}
      break;}
    case 'mail':{
      /* лист УКРПОШТИ — квест листоноші */
      const bob=IB.M.sin(performance.now()*0.004)*1.2;
      IB.O(g,x,y+bob-1,7,2,'#00000022');
      IB.PA(g,[[x-5,y+bob-6],[x+5,y+bob-6],[x+5,y+bob+2],[x-5,y+bob+2]],'#e8e8e2');
      IB.PA(g,[[x-5,y+bob-6],[x,y+bob-2],[x+5,y+bob-6]],'#c84848');
      IB.P(g,x-3,y+bob,6,1,'#2a3e5c');
      break;}
    case 'shawarma':{
      /* v16: ШАУРМНИЦЯ — стійка з вертелом і знаком */
      IB.O(g,x+3,y,12,4,'#00000030');
      IB.P(g,x-9,y-4,20,4,'#c8a850');
      IB.P(g,x-7,y-2,16,2,'#8a6a48');
      IB.P(g,x-6,y-20,2,18,'#8a6a48');
      IB.PA(g,[[x-15,y-30],[x+15,y-30],[x+11,y-22],[x-11,y-22]],'#e05a5a');
      IB.PA(g,[[x-15,y-30],[x+15,y-30],[x+11,y-26],[x-11,y-26]],'#c84848');
      g.font='6px monospace';g.fillStyle='#fff2d8';
      g.fillText('ШАУРМА',x-12,y-27);
      IB.P(g,x-2,y-19,4,10,'#c8c8c8');
      IB.PA(g,[[x-3,y-16],[x+1,y-16],[x-1,y-9]],'#a8703c');
      IB.PA(g,[[x-3,y-14],[x+1,y-14],[x-1,y-10]],'#8a5a2c');
      const sh=IB.M.sin(performance.now()*0.003)*0.8;
      IB.O(g,x-1+sh,y-20,2,1,'#e8e0d0');
      IB.P(g,x-10,y-6,22,2,'#e8d050');
      break;}
    case 'dolphin':{
      break;}
    default:break;
  }
  if(s3!==1)g.restore();
}
function PALbe(){return IB.M.sin(performance.now()*0.001)>0?'#b82840':'#d84058';}

/* ---------- БУДІВЛІ (v1.4: ще БІЛЬШЕ активів з ПЕРШОЇ ЧАСТИНИ — дачі,
   цегляні, сільські котеджі wood/vill/cottage, старі хати hist, крамниця,
   лісництво admin3, сільрада khrus; пропорції v5 1:1; процедурний фолбек) ---------- */
const BLD_IMG={
  /* v18.3: wood1/wood2/vill2/cottage_b — «смугасті плити» з діагональними
     смугами і синіми вікнами-колонами (саме їх було БАГАТО на карті) —
     ВИДАЛЕНІ З РОТАЦІЇ. Будинки тепер = дачі з двосхилими дахами і
     сучасний сірий будинок. cottage_b лишається тільки у БРОНС-будинку. */
  house:['bld_dacha1_0','bld_dacha1_1','bld_dacha2_0','bld_dacha2_1','bld_dacha3_0'],
  brick:['bld_bhouse2_0','bld_bhouse2_1'],
  bar:['bld_bhouse1_0'],
  shop:['bld_shop1_0'],
  barn:['bld_garage_0'],
};
/* v1.4: якорі PNG-котеджів v5 (ax,ay — південний кут footprint у пікселях PNG);
   для них малюємо drawImage(px-ax, py-ay), для старих (без якоря) — центр-низ */
IB.V5_ANCH={
  wood1:{ax:34,ay:100},wood2:{ax:34,ay:96},vill1:{ax:50,ay:136},vill2:{ax:34,ay:114},
  cottage_b:{ax:34,ay:124},hist2:{ax:18,ay:62},hist2b:{ax:18,ay:62},hist2c:{ax:18,ay:62},
  hist3:{ax:34,ay:78},shop2:{ax:18,ay:64},admin3:{ax:50,ay:128},khrus:{ax:18,ay:76},
  bench:{ax:11,ay:12},barrels:{ax:10,ay:13},crate:{ax:10,ay:9},busstop:{ax:13,ay:13},
  swing:{ax:12,ay:16},slide:{ax:10,ay:18},dead:{ax:11,ay:33},
};
/* v2.4b: дрібні будІвлі бІльші (відгук «є малі будІвлі — збільшуй»): старі
   хати-курени, стодола, сільрада, гараж, ларьок і крамниця малюються у
   масштабі села; якорі масштабуються разом, колізії footprint не чіпаємо. */
IB.V5_SCL={hist2:1.5,hist2b:1.5,hist2c:1.5,hist3:1.5,khrus:1.75,cottage_b:1.9,
  bld_garage_0:1.4,shop2:1.25,bld_shop1_0:1.15};
function bldPick(b){
  /* v18.4: БЕЗ БАГАТОВЕРХІВОК — panel5/panel9 не малюються ні PNG
     (khrus/vill1), ні вежами: типи лишились як ЯКОРІ житла і рендеряться
     НИЗЬКИМИ 2-пов. житловими будинками (спільна гілка в drawBuilding) */
  /* v18.3: у 365 будинків генератор ставив ЯВНИЙ img='cottage_b' — «смугаста
     плита» з синіми вікнами-колонами і діагональними смугами (саме її гравець
     просив прибрати: «її багато на карті»). Тепер cottage_b для звичайних
     будинків ІГНОРУЄТЬСЯ — вони малюються дачами з двосхилими дахами.
     cottage_b лишається ЛИШЕ у БРОНС-будинку (орієнтир банди). */
  if(b.img&&b.type!=='panel5'&&!(b.type==='house'&&b.img==='cottage_b'))return b.img;
  if(b.type==='shop')return 'bld_shop1_0';
  if(b.type==='kiosk')return 'shop2';
  if(b.type==='bar')return 'bld_bhouse1_0';
  if(b.type==='barn')return b.w<=3?'hist3':'bld_garage_0';
  if(b.type==='forge')return 'bld_bhouse2_0';
  if(b.type==='farm')return 'vill1';
  if(b.type==='hut')return ['hist2','hist2b','hist2c'][(b.x*5+b.y*3)%3];
  if(b.type==='house')return BLD_IMG.house[(b.x*3+b.y*7)%BLD_IMG.house.length];
  /* i3-gfx-patch: будівлі Чорноморська */
  if(b.type==='bronx')return 'cottage_b';
  /* v18.3: panel5 → null → цегляний рендер (PNG 'khrus' більше не використовується) */
  if(b.type==='hotel'||b.type==='port'||b.type==='vokzal')return 'hist3';
  if(b.type==='cine')return 'hist2b';
  if(b.type==='museum')return 'hist2';
  if(b.type==='realtor')return 'admin3';
  if(b.type==='idalnya')return 'vill1';
  if(b.type==='gym')return 'bld_garage_0';
  if(b.type==='market')return 'bld_shop1_0';
  if(b.type==='yacht')return 'bld_dacha2_0';
  if(b.type==='hotdog'||b.type==='voda')return 'shop2';
  if(b.type==='cafe'||b.type==='bar')return 'bld_bhouse1_0';
  return null;
}

/* ==================== v22.0 «РАЙОНИ КОЛЬОРОМ» ====================
   гравець: «місто виглядає чудово, але однотипно по районам — зміни
   кольори будівель і дахів по районам, щоб різноманітніше було».
   Кожен район отримує СВІЙ колір ДАХІВ і СВІЙ відтінок СТІН: спрайти
   будівель перекрашуються один раз (canvas-recolor з кешем) — зелені
   дахи дач і терракотова цегла набувають кольору району, кремові/сірі
   стіни — відтінку; скло, дерево, тіні, вікна — без змін. */
const BLD_ZONES=[
  {id:'north',  y1:117, roof:'#5f7f9e', roof2:'#7a4a3c', wall:'#d9e2ea', tint:'#c9d6e0'}, /* ПІВНІЧНИЙ МАСИВ — сланцеві дахи, прохолодні стіни */
  {id:'center', y1:213, roof:'#c05c42', roof2:'#8a4638', wall:'#f2dfc0', tint:'#eedcbe'}, /* ЦЕНТР — терракотові дахи, крем */
  {id:'south',  y1:329, roof:'#5e9a66', roof2:'#a8743e', wall:'#e9d3a8', tint:'#e8d4a8'}, /* ПІВДЕННИЙ МАСИВ — зелені дахи, пісок */
  {id:'prim',   y1:429, roof:'#3a96a2', roof2:'#4a78a0', wall:'#f2eee0', tint:'#eceada'}, /* ПРИМОРСЬКИЙ — бірюзові дахи, біла штукатурка */
];
const BLD_ZONE_EXTRA=[
  {id:'bronx', rect:{x:248,y:372,w:34,h:24}, roof:'#6a6a6e', roof2:'#7a4638', wall:'#c4a894', tint:'#c0a898'}, /* БРОНКС — сірі дахи, цегла */
  {id:'port',  rect:{x:332,y:356,w:104,h:74}, roof:'#54626e', roof2:'#3e5666', wall:'#b6bab6', tint:'#b2b8b4'}, /* ПОРТ — індустріальні дахи */
  {id:'zavod', rect:{x:352,y:296,w:84,h:36}, roof:'#5e6e7c', roof2:'#44586a', wall:'#b0b6ba', tint:'#b0b8bc'}, /* ЗАВОД «ПАЛЛАДА» */
];
function bldZonePal(x,y){
  for(const z of BLD_ZONE_EXTRA)
    if(x>=z.rect.x&&x<z.rect.x+z.rect.w&&y>=z.rect.y&&y<z.rect.y+z.rect.h)return z;
  if(y<30)return {id:'village', roof:'#a85c44', roof2:'#8a6a3a', wall:'#f0dcc0', tint:'#ecd8bc'}; /* одеський напрям/села — черепиця */
  for(const z of BLD_ZONES)if(y<z.y1)return z;
  return BLD_ZONES[3];
}
function bldHexRgb(h){return [parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];}
function bldRgbHsv(r,g,b){ /* r,g,b у 0..255 → [h 0..360, s 0..1, v 0..1] */
  r/=255;g/=255;b/=255;
  const mx=IB.M.max(r,g,b),mn=IB.M.min(r,g,b),d=mx-mn;
  let h=0;
  if(d>0){
    if(mx===r)h=((g-b)/d)%6;else if(mx===g)h=(b-r)/d+2;else h=(r-g)/d+4;
    h*=60;if(h<0)h+=360;
  }
  return [h,mx?d/mx:0,mx];
}
function bldHsvRgb(h,s,v){
  const c=v*s,x=c*(1-IB.M.abs((h/60)%2-1)),m=v-c;
  let r=0,g=0,b=0;
  if(h<60){r=c;g=x;}else if(h<120){r=x;g=c;}else if(h<180){g=c;b=x;}
  else if(h<240){g=x;b=c;}else if(h<300){r=x;b=c;}else{r=c;b=x;}
  return [(r+m)*255,(g+m)*255,(b+m)*255];
}
IB._bldRecolor={};
IB.bldImg=(name,b)=>{
  const base=IB.img(name);
  if(!base||!b||!bldZonePal)return base;
  const pal=bldZonePal(b.x,b.y);
  const key=name+'|'+pal.id;
  const got=IB._bldRecolor[key];
  if(got)return got;
  const cv=IB.mk(base.width,base.height);
  cv.g.drawImage(base,0,0);
  try{
    const [rH,rS]=bldRgbHsv.apply(null,bldHexRgb(pal.roof));
    const [r2H,r2S]=bldRgbHsv.apply(null,bldHexRgb(pal.roof2));
    const [wR,wG,wB]=bldHexRgb(pal.wall);
    const id=cv.g.getImageData(0,0,base.width,base.height);
    const d=id.data;
    for(let i=0;i<d.length;i+=4){
      if(d[i+3]<16)continue;
      const [h,s,v]=bldRgbHsv(d[i],d[i+1],d[i+2]);
      if(h>=60&&h<=175&&s>0.22&&v>0.15){
        /* ДАХ зелений (дачі ч.1) → колір району, тіні/ребра зберігаємо */
        const q=bldHsvRgb(rH,s*0.5+rS*0.5,v);
        d[i]=q[0];d[i+1]=q[1];d[i+2]=q[2];
      }else if((h<45||h>330)&&s>0.28&&v>0.18&&v<0.92){
        /* ДАХ/цегла терракотова → другий колір району */
        const q=bldHsvRgb(r2H,s*0.55+r2S*0.45,v);
        d[i]=q[0];d[i+1]=q[1];d[i+2]=q[2];
      }else if(h>=12&&h<=70&&s>0.05&&s<=0.5&&v>0.5){
        /* тепла штукатурка (крем/пісок) → відтінок стін району */
        d[i]=d[i]*(1-0.35)+wR*0.35; d[i+1]=d[i+1]*(1-0.35)+wG*0.35; d[i+2]=d[i+2]*(1-0.35)+wB*0.35;
      }else if(s<0.13&&v>0.5){
        /* світло-сірі стіни (адмін/дачі) → м'який відтінок району */
        d[i]=d[i]*(1-0.22)+wR*0.22; d[i+1]=d[i+1]*(1-0.22)+wG*0.22; d[i+2]=d[i+2]*(1-0.22)+wB*0.22;
      }
    }
    cv.g.putImageData(id,0,0);
  }catch(e){return base;}
  IB._bldRecolor[key]=cv;
  return cv;
};
/* v22: цегляні палітри «панельок» (panel5/panel9) — ВІД РАЙОНУ */
const BLD_BRICK={
  north:['#8a98a8','#9aa8b8','#6e7c8c','#e8e8e0'],
  center:['#a86850','#b87858','#8a523e','#e8d8c0'],
  south:['#7e8e68','#8e9e78','#647a64','#e8e0c8'],
  prim:['#c8a878','#d8b888','#a8885e','#f0e4cc'],
  bronx:['#9a5a48','#aa6a55','#7a4636','#e0d0b8'],
  port:['#8a98a8','#9aa8b8','#6e7c8c','#e8e8e0'],
  zavod:['#8a929c','#9aa2ac','#6e7680','#e4e4dc'],
  village:['#c8a878','#d8b888','#a8885e','#f0e4cc'],
};

function drawBuilding(g,b,ox,oy,dt){
  const s=tileScreen(b.x+b.w/2,b.y+b.h/2);
  const x=s.x+ox-16*b.w/2, y=s.y+oy-8*b.h/2;
  const P=IB.PAL;
  const wpx=b.w*16,dpx=b.h*16;
  const nf=IB.nightFactor();
  const lit=nf>0.4;
  const px=x+wpx/2, py=y+dpx;           /* південний кут footprint — анкер PNG */
  const name=bldPick(b);
  /* v22: спрайт будівлі ПЕРЕКРАШУЄТЬСЯ під район (стіни + дахи) */
  const im=name?IB.bldImg(name,b):null;
  /* тінь */
  IB.O(g,px+6,py+2,wpx*0.62,dpx*0.5,'#00000030');
  if(b.type==='well'){
    IB.isoBox(g,x,y,20,14,8,P.c2,P.c1,P.c1);
    IB.PA(g,[[x+4,y+7],[x+10,y+2],[x+16,y+7],[x+10,y+12]],'#1a1418');
    IB.P(g,x+9,y-8,2,10,P.b2);IB.P(g,x+14,y-8,2,10,P.b2);
    IB.PA(g,[[x+6,y-8],[x+18,y-8],[x+12,y-13]],P.rf2);
    return;
  }
  if(b.type==='ruin'){
    IB.isoBox(g,x,y,wpx,dpx,5,P.c1,IB.shade(P.c1,-0.2),P.c2);
    IB.P(g,x+6,y-8,3,8,P.c2);IB.P(g,x+wpx-14,y-6,4,6,P.c1);
    IB.P(g,x+10,y+dpx/2-4,8,2,P.c2);
    return;
  }
  if(b.type==='church'){
    /* старовинна дерев'яна церква: ВИЩА вежа + хрест (масштаб v5) */
    const cw=Math.max(wpx,36);
    IB.isoBox(g,x,y,cw,dpx,12,P.b2,P.w2,P.w3);
    IB.isoBox(g,x+cw/2-10,y-8,20,dpx*0.6,20,P.rf2,P.rf3,P.rf4);
    IB.PA(g,[[x+cw/2-8,y-26],[x+cw/2,y-40],[x+cw/2+8,y-26]],P.rf3);
    IB.P(g,x+cw/2-1,y-52,2,12,P.y2);IB.P(g,x+cw/2-5,y-48,10,2,P.y2);IB.P(g,x+cw/2-3,y-44,6,2,P.y2);
    IB.P(g,x+4,y+dpx/2-2,4,5,'#3a2a1a');
    /* вікна-свічки уночі */
    if(lit){IB.P(g,x+cw/2-8,y-14,3,4,'#f0c060');IB.P(g,x+cw/2+5,y-14,3,4,'#f0c060');
      IB.O(g,x+cw/2-6,y-12,6,7,'rgba(240,180,60,0.22)');IB.O(g,x+cw/2+7,y-12,6,7,'rgba(240,180,60,0.22)');}
    drawSign(g,b,px,py);
    return;
  }
  if(b.type==='border'){
    /* прикордонний КПП: стовпчик-смуга + шлагбаум + стела */
    IB.isoBox(g,x,y,26,dpx,10,P.w2,P.w3,P.b3);
    IB.P(g,x+2,y-18,3,16,P.be1);IB.P(g,x+5,y-18,3,16,P.wht);
    IB.P(g,x+8,y-18,3,16,P.be1);
    IB.P(g,x+2,y-20,12,2,P.y3);
    IB.P(g,x+15,y-11,12,2,P.y2); /* шлагбаум */
    IB.P(g,x+14,y-11,2,3,P.blk);
    drawSign(g,b,px,py);
    return;
  }
  /* ---------- i3-gfx-v31: КЛУБ «МАЯК» — неон, вежа, гірлянда ---------- */
  if(b.type==='club'){
    const fw=wpx, fd=dpx, hgt=50;
    IB.O(g,px+10,py+2,wpx*0.7,dpx*0.5,'#00000042');
    /* корпус: темна сучасна коробка */
    IB.PA(g,[[x,y+fd/2],[x+fw/2,y+fd],[x+fw/2,y+fd+hgt],[x,y+fd/2+hgt]],'#241f2e');
    IB.PA(g,[[x+fw/2,y+fd],[x+fw,y+fd/2],[x+fw,y+fd/2+hgt],[x+fw/2,y+fd+hgt]],'#332c42');
    IB.PA(g,[[x,y+fd/2],[x+fw/2,y],[x+fw,y+fd/2],[x+fw/2,y+fd]],'#443c56');
    /* стрічкове вікно + двері */
    IB.P(g,x+fw/2+4,y+fd/2+hgt-26,fw/2-10,9,'#16131e');
    const gat=IB.M.sin(performance.now()*0.006)*0.5+0.5;
    IB.P(g,x+6,y+fd/2+hgt-24,fw/2-14,7,'rgba(90,220,255,'+(0.25+gat*0.25)+')');
    IB.P(g,x+fw/2-7,y+fd-7,10,10,'#0e0c14');
    /* світло з дверей уночі */
    if(lit){IB.O(g,x+fw/2-2,y+fd+1,16,7,'rgba(255,80,220,0.18)');
      IB.O(g,x+fw/2-2,y+fd+1,9,4,'rgba(120,240,255,0.20)');}
    /* НЕОН-СМУГИ (пульсують) */
    const pu=0.55+IB.M.sin(performance.now()*0.004)*0.45;
    IB.P(g,x+4,y+fd/2+hgt-12,fw-8,2.6,'rgba(255,70,210,'+(0.5+pu*0.5)+')');
    IB.P(g,x+4,y+fd/2+hgt-8,fw-8,1.8,'rgba(90,230,255,'+(0.4+pu*0.6)+')');
    IB.O(g,x+fw/2,y+fd/2+hgt-10,fw*0.6,6,'rgba(255,70,210,'+(0.10+pu*0.12)+')');
    /* вежа-МАЯК на даху — назва клубу */
    IB.P(g,x+fw/2-3,y-16,6,17,'#3a3244');
    IB.P(g,x+fw/2-4,y-19,8,4,'#2a2532');
    const beam=IB.M.sin(performance.now()*0.003)>0;
    IB.P(g,x+fw/2-2.6,y-23,5.2,5,beam?'#ffd86a':'#6a6258');
    if(beam){const gr=g.createRadialGradient(x+fw/2,y-20,1,x+fw/2,y-20,26);
      gr.addColorStop(0,'rgba(255,216,106,0.45)');gr.addColorStop(1,'rgba(255,216,106,0)');
      g.fillStyle=gr;g.beginPath();g.arc(x+fw/2,y-20,26,0,7);g.fill();}
    /* гірлянда лампочок */
    for(let i=0;i<6;i++){
      const bl=x+8+i*(fw-16)/5, on=(Math.floor(performance.now()*0.003)+i)%3!==0;
      IB.O(g,bl,y+fd/2+hgt-16,2.6,2.6,on?'rgba(120,240,255,0.9)':'rgba(60,60,70,0.7)');
    }
    /* колонки біля входу */
    IB.isoBox(g,x+fw/2-18,y+fd-6,9,7,14,'#16131e','#0e0c14','#0a090f');
    IB.isoBox(g,x+fw/2+10,y+fd-6,9,7,14,'#16131e','#0e0c14','#0a090f');
    drawSign(g,b,px,py);
    return;
  }
  /* ---------- v22: МІСЬКА РАДА і РІЕЛТОР — ЧИСТИЙ адмін-фасад ----------
     PNG admin3 ч.1 має темні «розводи» на стінах (виглядає як патьоки) —
     а офіс ріелтора (туди тепер їде таксі) і Міськрада — обличчя міста.
     Малюємо охайно: рівні стіни кольору району, карниз, сітка вікон
     (теплі вночі), плоский дах-плита, у Міськради — прапор. */
  if(b.type==='cityhall'||b.type==='realtor'){
    const fw=wpx, fd=dpx;
    const tall=b.type==='cityhall';
    const hgt=tall?30:20;
    const pal=bldZonePal(b.x,b.y);
    const wallL=IB.shade(pal.wall,0.04), wallS=IB.shade(pal.wall,-0.17), trim=IB.shade(pal.wall,0.24);
    /* корпус: пд-зх фасад світліший, пд-сх — тінь */
    IB.PA(g,[[x,y+fd/2],[x+fw/2,y+fd],[x+fw/2,y+fd+hgt],[x,y+fd/2+hgt]],wallL);
    IB.PA(g,[[x+fw/2,y+fd],[x+fw,y+fd/2],[x+fw,y+fd/2+hgt],[x+fw/2,y+fd+hgt]],wallS);
    /* карниз по верху стін */
    IB.P(g,x-1,y+fd/2-2.2,fw+2,2.6,trim);
    /* плоский дах-плита кольору району */
    IB.isoBox(g,x,y+fd/2-8,fw,fd,8,IB.shade(pal.roof,0.12),IB.shade(pal.roof,-0.18),IB.shade(pal.roof,-0.34));
    /* парапет-кромка даху */
    IB.P(g,x+2,y+fd/2-8.4,fw-4,1.4,IB.shade(pal.roof,0.3));
    /* двері + ґанк */
    const dxc=x+fw/2, dyc=y+fd;
    IB.P(g,dxc-6,dyc-10,12,10,'#3a2e22');
    IB.P(g,dxc-5,dyc-9,10,8,'#4c3c2c');
    IB.P(g,dxc-8,dyc+0,16,2,trim);
    /* вікна: 3 на фасад × 1-2 ряди, теплі вночі */
    const lit2=nf>0.42;
    const rows=tall?2:1;
    for(let r2=0;r2<rows;r2++){
      const wy=y+fd/2+hgt-16-r2*13;
      for(let wi=0;wi<3;wi++){
        const wx1=x+5+wi*((fw/2-14)/3);
        IB.P(g,wx1-0.8,wy-0.8,7.8,6.8,trim);
        IB.P(g,wx1,wy,6.2,5.2,lit2?'#f0c060':'#2e3e50');
        if(lit2)IB.O(g,wx1+3,wy+2.6,7,6,'rgba(240,180,60,0.14)');
        const wx2=x+fw/2+3+wi*((fw/2-10)/3);
        IB.P(g,wx2-0.8,wy-0.6,7.8,6.8,trim);
        IB.P(g,wx2,wy,6.2,5.2,lit2?'#e0b050':'#26343f');
        if(lit2)IB.O(g,wx2+3,wy+2.6,7,6,'rgba(224,160,60,0.12)');
      }
    }
    /* колони по кутах ганка */
    IB.P(g,x+2,y+fd/2+hgt-6,2.4,6,trim);IB.P(g,x+fw-4.4,y+fd/2+hgt-6,2.4,6,IB.shade(pal.wall,-0.3));
    /* Міськрада — прапор над дахом */
    if(tall){
      const fx=x+fw/2, fy=y+fd/2-8;
      IB.P(g,fx-0.8,fy-13,1.6,13,'#8a8274');
      const wv=IB.M.sin(performance.now()*0.003)*1.2;
      IB.PA(g,[[fx+0.8,fy-13],[fx+9+wv,fy-11.5],[fx+9+wv,fy-7.5],[fx+0.8,fy-9]],IB.hsh(b.x,b.y,5)<0.5?'#2a5aa8':'#e8b23a');
    }
    drawSign(g,b,px,py);
    return;
  }
  /* ---------- v18.4 «МІСТО БЕЗ БАГАТОВЕРХІВОК» ----------
     Раунд 19: «ці будівлі прибрати зовсім з карти — перероби без цих будувель».
     Вежі/хрущовки зникли з генерації; типи panel9/panel5 лишились як ЯКОРІ
     житла (двері, квартири, «ПІВНІЧНИЙ»). НОВИЙ ВИГЛЯД: НИЗЬКИЙ 2-ПОВЕРХОВИЙ
     цегляний житловий будинок — білі рами, карниз, парапет, сині козирки
     першого поверху. Жодних 9/12-поверхових плит. */
  if(b.type==='panel9'||b.type==='panel5'){
    const fw=wpx, fd=dpx;
    const floors=2;
    /* v22: палітра цегли — ВІД РАЙОНУ (сіро-блакитна північ, терракота центр,
       зелений південь, пісок приморський, темна цегла Бронкс, сірий порт) */
    const wc3=BLD_BRICK[(bldZonePal(b.x,b.y)||{}).id]||BLD_BRICK.center;
    const wallC=wc3[0], wallL=wc3[1], wallD=wc3[2], mortar='rgba(0,0,0,0.13)', trim=wc3[3];
    const hgt=30+((b.x*7)%3)*3;
    /* тінь будинку */
    IB.O(g,px+10,py+2,wpx*0.66,dpx*0.5,'#00000038');
    /* корпус: пд-зх і пд-сх грані + дах-грань */
    IB.PA(g,[[x,y+fd/2],[x+fw/2,y+fd],[x+fw/2,y+fd+hgt],[x,y+fd/2+hgt]],wallD);
    IB.PA(g,[[x+fw/2,y+fd],[x+fw,y+fd/2],[x+fw,y+fd/2+hgt],[x+fw/2,y+fd+hgt]],wallC);
    IB.PA(g,[[x,y+fd/2],[x+fw/2,y],[x+fw,y+fd/2],[x+fw/2,y+fd]],wallL);
    /* ЦЕГЛЯ: шви кладки — горизонтальні ряди зі зміщенням стиків */
    for(let ry2=2;ry2<floors*3;ry2+=2){
      const byy=y+fd/2+hgt*ry2/(floors*3);
      IB.P(g,x,byy,fw,0.7,mortar);
      for(let cx2=0;cx2<6;cx2++){
        const bx8=x+((cx2*fw/6)+((ry2%4)?fw/12:0))%fw;
        IB.P(g,bx8,byy-2.4,0.8,2.4,mortar);
      }
    }
    /* БІЛИЙ КАРНИЗ під дахом + парапет */
    IB.P(g,x,y+fd/2-1.6,fw,2.4,trim);
    /* дах-надбудова: вентблоки + антена (низькі) */
    IB.PA(g,[[x+fw/2-5,y-5],[x+fw/2,y-8],[x+fw/2+5,y-5],[x+fw/2,y-2]],'#9a9286');
    IB.P(g,x+fw/2-3,y-13,2,8,'#6e6862');
    if(IB.hsh(b.x,b.y,66)>0.5)IB.P(g,x+fw/2-11,y-10,1.6,6,'#8a847c');
    /* міжповерховий пояс — над рядами вікон */
    IB.P(g,x,y+fd/2+hgt/2-0.7,fw,1,trim);
    /* перший поверх — СИНІ козирки (житлово-комерційний) */
    if(IB.hsh(b.x,b.y,69)<0.55){
      const gy=y+fd/2+hgt-12;
      for(let s2=0;s2<3;s2++){
        const sx=x+4+s2*(fw-10)/3;
        IB.P(g,sx,gy,(fw-14)/3,7,'#1e2a36');
        IB.P(g,sx+1.4,gy+1.4,(fw-14)/3-2.8,4.2,lit?'#f0c06040':'#3a4a5c');
        IB.P(g,sx-1,gy-3,(fw-14)/3+2,2.4,'#3a6ea8');
      }
    }
    /* МЕШКАНЦІ НА БАЛКОНАХ — виходять вранці і ввечері */
    {
      const hh8=IB.hStr();
      const home8=(hh8>=6.5&&hh8<10)||(hh8>=17.5&&hh8<22.5);
      const lit8=IB.nightFactor()>0.42;
      if(home8){
        const balc=[[x+8,y+fd/2+hgt*0.5],[x+fw-16,y+fd/2+hgt*0.62],[x+fw/2-4,y+fd/2+hgt*0.34]];
        for(let bi=0;bi<3;bi++){
          if(IB.hsh(b.x,b.y,90+bi)<0.42)continue;
          const bx9=balc[bi][0],by9=balc[bi][1];
          IB.P(g,bx9-3,by9+5,11,1.6,'#5a5048');
          IB.P(g,bx9-3,by9-4,1.4,9,'#5a5048');IB.P(g,bx9+7,by9-4,1.4,9,'#5a5048');
          g.fillStyle=lit8?'#202830':'#3a3430';
          g.fillRect(bx9,by9-6,4.5,6);
          g.fillStyle='#c89878';g.fillRect(bx9+1,by9-8,2.4,2.4);
          if(IB.hsh(b.x,b.y,95+bi)>0.7)IB.P(g,bx9+1.2,by9-10.5,2.4,2.4,lit8?'#f0e0c0':'#8a8078');
        }
      }
    }
    /* ВІКНА: БІЛІ РАМИ + підвіконня + скло, тепле світло вночі */
    const nf2=IB.nightFactor();
    const lit2=nf2>0.42;
    const nSE=IB.M.max(4,Math.round(fw/22)), nSW=IB.M.max(3,Math.round(fw/26));
    for(let f=0;f<floors;f++){
      const fy=y+fd/2+hgt*f/floors;
      /* пд-сх фасад (світліша грань) */
      for(let wI=0;wI<nSE;wI++){
        const wx=x+fw/2+3.4+wI*(fw/2-8)/nSE, wy=fy+1.6;
        const on=lit2&&IB.hsh(b.x*13+wI,b.y*7+f,67)<0.55;
        IB.P(g,wx-0.7,wy-0.7,5.9,5.6,trim);
        IB.P(g,wx,wy,4.5,4.2,on?'#f0c060':'#2e3e50');
        if(on)IB.O(g,wx+2.2,wy+2.1,4.5,4.2,'rgba(240,180,60,0.12)');
        else{IB.P(g,wx,wy,4.5,1.7,'#4a607a');IB.P(g,wx+2,wy,0.7,4.2,trim);}
        IB.P(g,wx-1.2,wy+4.9,6.9,0.8,trim);
      }
      /* пд-зх фасад (темніша грань) */
      for(let wI=0;wI<nSW;wI++){
        const wx=x+2.4+wI*(fw/2-8)/nSW, wy=fy+1.8;
        const on=lit2&&IB.hsh(b.x*11+wI,b.y*5+f,68)<0.45;
        IB.P(g,wx-0.7,wy-0.7,5.9,5.6,trim);
        IB.P(g,wx,wy,4.5,4.2,on?'#e0b050':'#26343f');
        if(on)IB.O(g,wx+2.2,wy+2.1,4.5,4.2,'rgba(224,160,60,0.10)');
        else{IB.P(g,wx,wy,4.5,1.7,'#3e5268');IB.P(g,wx+2,wy,0.7,4.2,trim);}
        IB.P(g,wx-1.2,wy+4.9,6.9,0.8,trim);
      }
    }
    /* балкон-смуга на пд-сх фасаді */
    {
      const by=y+fd/2+hgt*0.5;
      IB.P(g,x+fw/2+8,by-1,(fw/2-18),2.2,'#8ab8d8');
    }
    /* під'їзди: 3 арки рівномірно по фасаду */
    for(let e=0;e<3;e++){
      const ex=x+fw*0.22+e*fw*0.22;
      IB.P(g,ex,y+fd-6,7,8,'#3a3026');
      IB.P(g,ex-1,y+fd-8,9,2,trim);
    }
    drawSign(g,b,px,py);
    return;
  }
/* ---------- i3-gfx-patch: СПЕЦ-БУДІВЛІ КУРОРТУ ---------- */
  if(b.type==='lighthouse'){
    IB.isoBox(g,x+wpx/2-8,y-10,16,dpx,34,'#e8e8e2','#d8d0c0','#c8c0b8');
    for(let i=0;i<3;i++)IB.P(g,x+wpx/2-8,y-10-i*11,16,4,'#c83828');
    IB.isoBox(g,x+wpx/2-6,y-46,12,8,6,'#2a3e5c','#1e3040','#16242e');
    const fl=IB.M.sin(performance.now()*0.003)>0;
    IB.O(g,x+wpx/2,y-50,3,3,fl?'#f8e8a0':'#8a8c94');
    if(fl){const gr=g.createRadialGradient(x+wpx/2,y-50,2,x+wpx/2,y-50,50);
      gr.addColorStop(0,'rgba(248,232,160,0.5)');gr.addColorStop(1,'rgba(0,0,0,0)');
      g.fillStyle=gr;g.beginPath();g.arc(x+wpx/2,y-50,50,0,7);g.fill();}
    drawSign(g,b,px,py);
    return;
  }
  if(b.type==='bronx'){
    /* двір з парканом навколо (будівля далі — PNG) */
    for(const f of [[-2,-1],[b.w*16+14,-1],[-2,b.h*16+16],[b.w*16+14,b.h*16+16]]){
      IB.P(g,x+f[0],y+f[1]-8,2,9,'#8a6a48');
    }
    for(let i=0;i<=b.w*16+16;i+=8){
      IB.P(g,x-2+i,y-9,7,1.6,'#a68754');
      IB.P(g,x-2+i,y+b.h*16+7,7,1.6,'#a68754');
    }
  }
  if(b.type==='cine'&&im){
    /* робимо після PNG — але додамо маркізу нижче через прапорець */
    b._marq=true;
  }
  /* ---------- ДАЧІ/ХАТИ/КРАМНИЦЯ/КОРЧМА — PNG ПЕРШОЇ ЧАСТИНИ ---------- */
  if(im){
    const an=IB.V5_ANCH[name];                 /* v1.4: точний якір котеджів v5 */
    const scl=(IB.V5_SCL&&IB.V5_SCL[name])||1; /* v2.4b: дрібні будІвлі бІльші */
    if(an)g.drawImage(im,px-an.ax*scl,py-an.ay*scl,im.width*scl,im.height*scl);
    else g.drawImage(im,px-im.width*scl/2,py-im.height*scl+6,im.width*scl,im.height*scl);
    /* вікна світяться уночі — теплі плями на фасаді */
    if(lit){
      const wh=im.height*scl;
      IB.P(g,px-20,py-wh*0.44,6,7,'#f0c060');
      IB.P(g,px+13,py-wh*0.44,6,7,'#f0c060');
      IB.O(g,px-17,py-wh*0.44+3,8,9,'rgba(240,180,60,0.20)');
      IB.O(g,px+16,py-wh*0.44+3,8,9,'rgba(240,180,60,0.20)');
    }
    /* димар з димом для хат */
    if(b.type==='house'&&IB.M.sin(performance.now()*0.0011+b.x)>0){
      const chy=py-(an?an.ay*scl:im.height*scl-6)+10;
      g.fillStyle='rgba(200,205,210,0.25)';
      IB.O(g,px+20,chy-4-((performance.now()*0.008)%8),3,3,'rgba(200,205,210,0.22)');
      IB.O(g,px+22,chy-10-((performance.now()*0.006)%10),2.4,2.4,'rgba(200,205,210,0.16)');
    }
    /* тент крамниці + бочки біля рибного цеху */
    if(b.type==='shop'&&!b.img){for(let i=0;i<7;i++)IB.P(g,px-24+i*7,py+2,7,4,i%2?'#c84838':'#e8e8e0');}
    if(b.type==='bar'&&!b.img){IB.O(g,px+26,py+4,4,3,'#6a5230');IB.O(g,px+18,py+5,4,3,'#5e4628');IB.O(g,px+34,py+5,3.5,2.6,'#5e4628');}
    /* i3: маркіза кіно з вогнями, тент кафе, рожевий кіоск */
    if(b.type==='cine'){
      IB.P(g,px-22,py-30,44,10,'#2a2438');
      const on=IB.nightFactor()>0.3;
      g.font='7px monospace';g.fillStyle=on?'#f8e8a0':'#8a8c94';g.textAlign='center';
      g.fillText('К I Н О',px,py-22);g.textAlign='left';
      for(let i=0;i<6;i++){const bb=on&&IB.M.sin(performance.now()*0.006+i)>0;
        IB.O(g,px-18+i*7,py-32,2,2,bb?'#f8e8a0':'#4a4060');}
      IB.PA(g,[[px-24,py],[px+24,py],[px+20,py+8],[px-20,py+8]],'#c84838');
      IB.P(g,px-20,py+3,40,2,'#e8e8e0');
    }
    if(b.type==='hotel'){
      IB.P(g,px-14,py-34,28,8,'#1e3a2a');
      g.font='6px monospace';g.fillStyle='#f0d050';g.textAlign='center';
      g.fillText('ГОТЕЛЬ',px,py-27);g.textAlign='left';
      IB.PA(g,[[px-18,py+1],[px+18,py+1],[px+15,py+9],[px-15,py+9]],'#2a4a5c');
    }
    if(b.type==='hotdog'||b.type==='voda'){
      IB.P(g,px-10,py-22,20,7,'#e8d050');
      g.font='6px monospace';g.fillStyle='#241a0e';g.textAlign='center';
      g.fillText(b.type==='hotdog'?'ХОТ-ДОГ':'ВОДА',px,py-16);g.textAlign='left';
    }
    if(b.type==='realtor'){
      IB.P(g,px-16,py-28,32,8,'#28303e');
      g.font='6px monospace';g.fillStyle='#e8e8e2';g.textAlign='center';
      g.fillText('БІЛЯ МОРЕ',px,py-21);g.textAlign='left';
    }
    drawSign(g,b,px,py);
    return;
  }
  /* ---------- ПРОЦЕДУРНИЙ ФОЛБЕК (якщо PNG не завантажився) ---------- */
  const hgt=b.type==='chapel'?26:16+(b.w>5?6:0);
  const wall=P.w1,wallD=P.w2;
  IB.isoBox(g,x,y,wpx,dpx,hgt,wallD,IB.shade(wall,-0.25),wall);
  const rh=hgt+7;
  IB.PA(g,[[x-2,y+dpx/2-4],[x+wpx/2,y+dpx/2-4-dpx/2-rh+6],[x+wpx+2,y+dpx/2-4],[x+wpx/2,y+dpx/2-4+rh]],P.rf2);
  IB.PA(g,[[x+wpx/2,y+dpx/2-4-rh],[x+wpx+2,y+dpx/2-4],[x+wpx/2,y+dpx/2-4+rh]],P.rf1);
  for(let i=1;i<4;i++){
    IB.P(g,x+2,y+dpx/2-4-rh+i*2, wpx-4, 1, IB.shade(P.rf2,-0.12));
  }
  const dx0=x+wpx/2-4,dy0=y+dpx-2;
  IB.P(g,dx0,dy0-9,8,9,'#3a2818');
  IB.P(g,dx0+1,dy0-8,6,7,'#4e3a20');
  IB.P(g,dx0+5,dy0-5,1,1,'#d8b050');
  IB.P(g,x+5,y+dpx/2-2,5,5,lit?'#f0c060':'#1a2430');IB.P(g,x+wpx-10,y+dpx/2-2,5,5,lit?'#f0c060':'#1a2430');
  IB.P(g,x+6,y+dpx/2-1,3,3,lit?'#f8e0a0':'#0e1620');
  drawSign(g,b,px,py);
  if(b.type==='chapel'){
    IB.P(g,x+wpx/2-1,y+dpx/2-4-hgt-8,2,8,'#d8d8cc');IB.P(g,x+wpx/2-3,y+dpx/2-4-hgt-6,6,1,'#d8d8cc');
  }
  if(b.type==='forge'){
    IB.O(g,x+wpx/2,y-6,3,2,'#3a4038');
  }
  if(b.type==='molfar'){
    const pl=0.5+IB.M.sin(performance.now()*0.004)*0.3;
    g.strokeStyle='rgba(112,240,224,'+pl+')';g.beginPath();g.arc(x+wpx/2,y+dpx/2-6,22,0,7);g.stroke();
    IB.O(g,x+wpx/2+14,y+dpx+6,2,3,'rgba(112,240,224,'+pl+')');
  }
}
/* вивіска будівлі — дошка з назвою над південним кутом */
function drawSign(g,b,px,py){
  if(!b.label)return;
  const w=b.label.length*4+10;
  IB.P(g,px-w/2,py+2,w,9,'#1a1a22');
  IB.P(g,px-w/2+1,py+3,w-2,7,'#2e3038');
  g.font='6px monospace';g.textAlign='center';
  g.fillStyle='#f0d050';g.fillText(b.label,px,py+8);
  g.textAlign='left';
}

/* ---------- СТРУКТУРИ ТАБОРУ ---------- */
function drawFire(g,f,ox,oy,dt){
  const s=tileScreen(f.x,f.y);
  const x=s.x+ox+16,y=s.y+oy+8;
  IB.O(g,x,y,8,4,'#2a2a28');
  /* каміння по колу */
  for(let i=0;i<7;i++){const a=i/7*6.28;IB.O(g,x+IB.M.cos(a)*8,y+IB.M.sin(a)*4,2,1.5,'#58605a');}
  if(f.fuel>0){
    const fl=IB.M.sin(performance.now()*0.02)*0.3+1;
    IB.PA(g,[[x-3,y-2],[x,y-2-10*fl],[x+3,y-2]],'#e07038');
    IB.PA(g,[[x-2,y-2],[x,y-2-16*fl],[x+2,y-2]],'rgba(240,190,80,0.9)');
    IB.PA(g,[[x-1,y-2],[x,y-2-7*fl],[x+1,y-2]],'#f8e8a0');
    if(IB.M.random()<0.15)IB.floatMsgs.push({x:f.x+IB.rnd(-0.3,0.3),y:f.y,txt:'✦',t:0.9});
  }else{
    IB.P(g,x-2,y-4,4,4,'#1a1a18');
  }
  /* казан на вогні */
  if(IB.G.camps&&IB.G.camps[IB.G.nearCamp(f.x,f.y,1)?.id||'']?.table&&false){}
}
function drawTent(g,t,ox,oy){
  const s=tileScreen(t.x,t.y);
  const x=s.x+ox+16,y=s.y+oy+8;
  IB.O(g,x,y+1,10,4,'#00000030');
  IB.PA(g,[[x-11,y],[x,y-14],[x+11,y]],'#3a6a4a');
  IB.PA(g,[[x-11,y],[x,y-14],[x-3,y]],IB.shade('#3a6a4a',-0.2));
  IB.PA(g,[[x-3,y],[x,y-7],[x+3,y]],'#1e4228');
  IB.P(g,x+9,y-13,1,3,'#b84838');
}
function drawCampWell(g,w,ox,oy){
  const s=tileScreen(w.x,w.y);
  const x=s.x+ox+16,y=s.y+oy+8;
  IB.isoBox(g,x-8,y-6,16,10,7,IB.PAL.c2,IB.PAL.c1,IB.PAL.c1);
  IB.P(g,x-2,y-16,2,12,IB.PAL.b2);IB.P(g,x+4,y-16,2,12,IB.PAL.b2);
  IB.PA(g,[[x-5,y-16],[x+7,y-16],[x+1,y-21]],IB.PAL.rf2);
  IB.O(g,x+1,y-8,4,2,'#28565f');
}
function drawTable(g,t,ox,oy){
  const s=tileScreen(t.x,t.y);
  const x=s.x+ox+16,y=s.y+oy+8;
  IB.P(g,x-7,y-4,14,3,'#8a6a42');IB.P(g,x-6,y-1,2,2,'#5e4628');IB.P(g,x+4,y-1,2,2,'#5e4628');
  IB.O(g,x-3,y-6,3,2,'#3a4038');IB.O(g,x+3,y-6,2.5,2,'#6a5230');
}
function drawDry(g,d,ox,oy){
  const s=tileScreen(d.x,d.y);
  const x=s.x+ox+16,y=s.y+oy+8;
  IB.P(g,x-6,y-12,1,12,'#5e4628');IB.P(g,x+5,y-12,1,12,'#5e4628');IB.P(g,x-6,y-12,12,1,'#5e4628');
  for(let i=0;i<3;i++)IB.P(g,x-4+i*4,y-10,2,5,'#c85048');
}
function drawFarm(g,f,ox,oy){
  const s=tileScreen(f.x,f.y);
  const x=s.x+ox, y=s.y+oy;
  IB.P(g,x+4,y+2,26,12,'#5e4628');
  IB.P(g,x+6,y+4,22,8,'#4e3a20');
  for(let i=0;i<3;i++)IB.P(g,x+7+i*7,y+5,4,6,'#3a2c18');
  if(f.planted){
    for(let i=0;i<3;i++){
      const gh=f.stage*2+2;
      IB.P(g,x+8+i*7,y+8-gh,2,gh,'#486036');
      if(f.ready){IB.O(g,x+9+i*7,y+7,2,2,'#b89058');}
    }
  }
}

/* ---------- СУТНОСТІ ---------- */
/* v16: актор ЗАСМАГА-ДІЙСТВА — лежить/біжить/плаває/танцює */
function drawSunActor(g,a,ox,oy,dt){
  const s=tileScreen(a.x,a.y);
  const x=s.x+ox+16,y=s.y+oy+10;
  if(a.mode==='swim'){
    const bob=IB.M.sin(performance.now()*0.005+a.bob)*1.6;
    IB.O(g,x,y-1,10,4,'rgba(255,255,255,0.5)');
    IB.O(g,x,y-2,7,3,'rgba(255,255,255,0.75)');
    IB.P(g,x-1.5,y-7+bob,3,3,a.look.skin);
    IB.P(g,x-2,y-8+bob,4,2,a.look.hair);
    IB.P(g,x-4.5,y-6+bob,2,1.4,a.look.skin);IB.P(g,x+2.5,y-6+bob,2,1.4,a.look.skin);
    if(IB.M.random()<0.1)IB.floatMsg(a.x,a.y,'💦');
  }else if(a.mode==='lie'){
    g.save();g.translate(x,y-2);g.rotate(1.35);IB.drawPerson(g,0,0,'d',0,a.look);g.restore();
    g.font='8px monospace';g.fillText('😎',x+8,y-8);
  }else{
    const hop=a.mode==='dance'?IB.M.abs(IB.M.sin(performance.now()*0.009+a.bob))*2.4:0;
    IB.drawPerson(g,x,y-hop,a.dir,a.fr,a.look);
    if(a.mode==='dance'){
      g.font='10px monospace';g.fillText(['🎵','🎶'][IB.ri(0,1)],x-6,y-30+IB.M.sin(performance.now()*0.006)*2);
    }
  }
}
function drawHero(g,h,ox,oy,dt){
  const s=tileScreen(h.x,h.y);
  const x=s.x+ox+16,y=s.y+oy+10-h.swim*4;
  if(h.lying>0){
    /* v2.3/v3.0: «упав» — гулянка або СОНЯНИЙ УДАР (загорявся) */
    g.save();g.translate(x,y-2);g.rotate(h.lieDir||1.35);IB.drawPerson(g,0,0,'d',0,h.look);g.restore();
    if(!IB.G.party.active){g.font='9px monospace';g.fillText('🥵',x+7,y-12);}
  }else if(h.swim){
    /* v18.2: герой ПЛАВАЄ у воді (відгук «просто стою на воді») —
       поза плавця: тіло по пояс, голова над водою, руки розмітають воду */
    IB.drawSwimmer(g,x,y-4,h.dir,h.fr,h.look);
    if(IB.M.random()<0.02)IB.floatMsg(h.x,h.y,'💦');
  }else{
    const hop=((IB.G.party.active||(IB.G.sunShow&&IB.G.sunShow.active))&&!h.swim)?IB.M.abs(IB.M.sin(performance.now()*0.009+h.x*3.1))*2.2:0;
    IB.drawPerson(g,x,y-hop,h.dir,h.fr,h.look);
  }
  /* v1.3: ІМ'Я, ЩО СВІТИТЬСЯ над головою */
  const nc=h.def&&h.def.nameColor?h.def.nameColor:'#f0d050';
  const ny=y-36+IB.M.sin(performance.now()*0.003+h.x*1.7)*1.6;
  g.font='bold 7px monospace';g.textAlign='center';
  g.shadowColor=nc;g.shadowBlur=6;
  g.fillStyle=nc;g.fillText(h.name,x,ny);
  g.fillText(h.name,x,ny);
  g.shadowBlur=0;
  g.fillStyle='#ffffffcc';g.font='7px monospace';g.fillText(h.name,x,ny);
  g.textAlign='left';
  /* лідер — золотий шеврон над іменем */
  if(h.id==='viktor'){
    const bob2=IB.M.sin(performance.now()*0.004)*2;
    IB.PA(g,[[x,y-46+bob2],[x-4,y-40+bob2],[x+4,y-40+bob2]],'#f0d050');
  }
  if(h.frozen){
    g.fillStyle='#28565f';IB.O(g,x,y-14,9,14,'rgba(90,140,200,0.5)');
    g.font='11px monospace';g.fillStyle='#8ad0e0';g.fillText('❄',x-4,y-40);
  }
  if(h.alc>=3){
    const wob=IB.M.sin(performance.now()*0.008)*1.5;
    g.font='10px monospace';g.fillText('🥴',x+7+wob,y-32);
  }
  /* v1.5: фонарик у руці — уночі, якщо увімкнені */
  if(IB.nightFactor()>0.15&&IB.G.torch!==false){
    IB.P(g,x+6,y-9,3,2,'#2e3440');
    IB.P(g,x+9,y-8.5,1.6,1,'rgba(255,240,180,0.95)');
  }
  if(h.lying>0){
    g.font='9px monospace';g.fillText('💤',x+6,y-12);
  }else if(IB.G.party.active||(IB.G.sunShow&&IB.G.sunShow.active)){
    const bob=IB.M.sin(performance.now()*0.006+h.x)*3;
    g.font='11px monospace';g.fillText(['🎵','🎶','💃','🍻'][IB.ri(0,3)],x-7,y-34+bob);
  }
  /* v2.3: бульбашки-діалоги над героями */
  if(h.bubble){
    const b=h.bubble;g.font='7px monospace';
    const w=IB.M.min(IB.M.max(g.measureText(b.txt).width+10,26),150);
    const bx=IB.M.max(3,IB.M.min(480-w-3,x-w/2)),by=IB.M.max(18,y-56);
    g.globalAlpha=0.93;
    IB.P(g,bx,by-9,w,12,'#f2efe4');
    g.strokeStyle=(h.def&&h.def.nameColor)||'#f0d050';g.lineWidth=1;g.strokeRect(bx+0.5,by-8.5,w-1,11);
    IB.PA(g,[[x-3,by+3.5],[x+3,by+3.5],[x,by+7]],'#f2efe4');
    g.fillStyle='#22262e';g.textAlign='center';g.fillText(b.txt,bx+w/2,by);g.textAlign='left';
    g.globalAlpha=1;
  }
}
function drawNpc(g,n,ox,oy){
  const s=tileScreen(n.x,n.y);
  const x=s.x+ox+16,y=s.y+oy+10;
  /* v3.0: «падають від спеки» — лежать на рушнику/піску */
  if(n.lieT>0){
    g.save();g.translate(x,y-2);g.rotate(1.35);IB.drawPerson(g,0,0,'d',0,n.look);g.restore();
    g.font='9px monospace';g.fillText('💤',x+7,y-10);
  }else{
    IB.drawPerson(g,x,y,n.dir,n.fr,n.look);
  }
  /* v3.0: ЗДОРОВЕННЯ — бульбашки над перехожими */
  if(n.bubble){
    const bb=n.bubble;g.font='7px monospace';
    const w2=IB.M.min(IB.M.max(g.measureText(bb.txt).width+10,26),140);
    const bx2=IB.M.max(3,IB.M.min(480-w2-3,x-w2/2)),by2=IB.M.max(14,y-52);
    g.globalAlpha=0.92;
    IB.P(g,bx2,by2-9,w2,12,'#f2efe4');
    g.strokeStyle='#7ce0e8';g.lineWidth=1;g.strokeRect(bx2+0.5,by2-8.5,w2-1,11);
    IB.PA(g,[[x-3,by2+3.5],[x+3,by2+3.5],[x,by2+7]],'#f2efe4');
    g.fillStyle='#22262e';g.textAlign='center';g.fillText(bb.txt,bx2+w2/2,by2);g.textAlign='left';
    g.globalAlpha=1;
  }
  if(n.quest&&!IB.G.flags['side_'+n.quest+'_done']){
    const bob=IB.M.sin(performance.now()*0.005)*2;
    g.font='10px monospace';g.fillStyle='#f0d050';g.fillText('!',x-1,y-36+bob);
  }
  if(n.role==='molfar'){
    const pl=0.4+IB.M.sin(performance.now()*0.005)*0.25;
    g.strokeStyle='rgba(112,240,224,'+pl+')';g.beginPath();g.arc(x,y-12,15,0,7);g.stroke();
  }
}
function drawTourist(g,t,ox,oy){
  const s=tileScreen(t.x,t.y);
  const x=s.x+ox+16,y=s.y+oy+10;
  IB.drawPerson(g,x,y,t.dir,t.fr,t.look);
  g.font='9px monospace';g.fillStyle='#e07038';
  g.fillText(t.follow?'...':'HELP',x-10,y-38);
}
function drawAnimal(g,a,ox,oy){
  const s=tileScreen(a.x,a.y);
  const x=s.x+ox+16,y=s.y+oy+8;
  if(a.type==='gull'){
    /* чайка в небі (v3.0: при годуванні знижується до рук) */
    const low=a.feedT>0;
    const fy=y-(low?11:38)-IB.M.sin(performance.now()*(low?0.006:0.001)+a.fx)*(low?2:6);
    const fl=IB.M.sin(performance.now()*0.02+a.fx*3);
    g.fillStyle='rgba(0,0,0,0.12)';IB.O(g,x,y+2,3,1.4,'rgba(0,0,0,0.12)');
    g.fillStyle='#e8ecf0';
    if(fl>0){IB.PA(g,[[x-6,fy],[x,fy-3],[x+6,fy]],'#e8ecf0');}
    else{IB.PA(g,[[x-6,fy-3],[x,fy],[x+6,fy-2.6]],'#d8dce2');}
    IB.O(g,x,fy-0.5,3,2,'#f0f2f4');
    IB.P(g,x+2.6,fy-1.6,2,0.9,'#e0a030');
    return;}
  if(a.type==='crab'){
    IB.O(g,x,y,5,2.5,'#e07038');
    IB.P(g,x-5,y-1,2,1,'#c85828');IB.P(g,x+3,y-1,2,1,'#c85828');
    IB.P(g,x-1.6,y-2,1.2,1.2,'#1a1418');IB.P(g,x+0.8,y-2,1.2,1.2,'#1a1418');
    return;}
  if(a.type==='cat'){
    IB.O(g,x,y,5,2.6,'#3a3e4c');
    IB.O(g,x+4,y-3,2.6,2.4,'#3a3e4c');
    IB.P(g,x-4,y-4,1.6,3,'#3a3e4c');
    IB.P(g,x+3.4,y-4.6,1,1.6,'#2a2e38');
    IB.P(g,x-5,y+1,1.6,0.8,'#3a3e4c');
    return;}
  if(a.type==='sheep')IB.drawSheep(g,x,y,a.fr,a.dark);
  else if(a.type==='goat')IB.drawGoat(g,x,y,a.fr);
  else if(a.type==='dog')IB.drawDog(g,x,y,a.dir,a.fr);
  else if(a.type==='bear')IB.drawBear(g,x,y,a.fr,a.dir);
  if(a.lost){g.font='9px monospace';g.fillStyle='#e8a0d0';g.fillText('!',x,y-14);}
}

/* ==================== v17.0: ЗВІРІ — бродячий пес / чайки / нічні метелики ==================== */
function drawBeast(g,b,ox,oy,dt){
  const s=tileScreen(b.x,b.y);
  if(b.type==='lynx'){
    /* v17.0: БРОДЯЧИЙ ПЕС (карпатська рись/лисиця виписана) — сіро-рудий,
       вушка-лопатки, хвіст-бублик; гавкає, якщо наблизити */
    const x=s.x+ox+16,y=s.y+oy+8;
    const c='#9a9288',cd=IB.shade(c,-0.3),cm='#b8ab9c';
    g.fillStyle='#00000030';g.beginPath();g.ellipse(x,y-1,8,2.8,0,0,7);g.fill();
    const lw=b.state==='flee'?-2:(b.fr===1?-1:1);
    IB.P(g,x-6,y-4,2,4,cd);IB.P(g,x+3,y-4,2,4,cd);
    IB.O(g,x,y-8,7.5,4.2,c);
    IB.O(g,x+6,y-10,4.2,3.6,cm);
    /* вушка-лопатки */
    IB.PA(g,[[x+4,y-12],[x+5,y-15],[x+7,y-12]],cd);
    IB.PA(g,[[x+7,y-12],[x+8.5,y-14.5],[x+9.5,y-11]],cd);
    IB.P(g,x+8,y-10,1.2,1.2,'#1a1418');
    /* нашийник зі обривком мотузки — бродячий */
    IB.P(g,x+3.4,y-6.4,3,1.2,'#c85048');IB.P(g,x+6,y-5.6,2.4,0.8,'#8a7a68');
    /* хвіст */
    IB.P(g,x-7+lw,y-9,3.4,2.4,c);IB.P(g,x-9+lw,y-9.4,2.2,2,cm);
    IB.P(g,x+9,y-8,3,0.8,'#e8e0d0aa');
    if(b.state==='stalk'&&IB.M.random()<dt*2)IB.floatMsg(b.x,b.y,'🐾');
    if(b.state==='lunge'){g.font='8px monospace';g.fillStyle='#ff5040';g.fillText('!',x-1,y-20);}
    return;
  }
  if(b.type==='ravens'){
    for(const bird of b.birds){
      const bx=s.x+ox+16+bird.ox*16,by=s.y+oy+8+bird.oy*8-bird.z;
      /* тінь на землі */
      g.fillStyle='rgba(0,0,0,0.22)';
      g.beginPath();g.ellipse(s.x+ox+16+bird.ox*16,s.y+oy+8+bird.oy*8,3,1.4,0,0,7);g.fill();
      const fl=Math.sin(bird.ph*2.4);
      /* v3.0: ЧАЙКИ (білі з сірими крилами) замість ворон */
      const gc=b.gull?'#e8ecf0':'#14161c', gcD=b.gull?'#c8ced6':'#0e1016';
      if(fl>0){IB.PA(g,[[bx-5,by],[bx,by-2.5],[bx+5,by-1]],gc);}
      else{IB.PA(g,[[bx-5,by-3],[bx,by-1],[bx+5,by-2.5]],gcD);}
      IB.O(g,bx,by-1,3,2,b.gull?'#f0f2f4':'#1a1d24');
      if(b.gull)IB.PA(g,[[bx-4,by-1],[bx-1,by-2.5],[bx-1,by]],gcD);
      IB.P(g,bx+3,by-2.5,2.4,1,b.gull?'#e0a030':'#38404c'); /* дзьоб */
      IB.P(g,bx+2.6,by-3,1,1,'#68707c'); /* око */
    }
    if(b.state==='dive'&&IB.M.random()<dt*6){const v=b.birds[0];IB.floatMsg(b.x+v.ox,b.y+v.oy,'КРЯ!');}
    return;
  }
  if(b.type==='bats'){
    /* v17.0: НІЧНІ МЕТЕЛИКИ (кажани виписані на користь метеликів) — світлі, м'яко
       тріпочуть навколо фонариків, морський літній вечір */
    const t=performance.now()*0.001;
    for(const bt of b.bats){
      const bx=s.x+ox+16+IB.M.cos(bt.a)*bt.r*16;
      const by=s.y+oy+8+IB.M.sin(bt.a)*bt.r*8-bt.z;
      const fl=Math.sin(t*12+bt.a*5);
      IB.O(g,bx-2,by-fl*1.2,3,2,'rgba(232,222,180,0.8)');
      IB.O(g,bx+2,by-fl*1.2,3,2,'rgba(232,222,180,0.8)');
      IB.O(g,bx,by,1.8,2.2,'rgba(212,196,150,0.92)');
    }
    return;
  }
}
function drawFishShadow(g,f,ox,oy){
  if(IB.W.at(f.x,f.y)!==0)return;
  const s=tileScreen(f.x,f.y);
  const x=s.x+ox+16,y=s.y+oy+8;
  g.fillStyle='rgba(10,30,36,0.5)';
  IB.O(g,x,y,4,1.6,'rgba(8,26,32,0.55)');
  IB.PA(g,[[x+3,y],[x+6,y-1.5],[x+6,y+1.5]],'rgba(8,26,32,0.45)');
}
function drawTripFx(g,fx,ox,oy,dt){
  const s=tileScreen(fx.x,fx.y);
  const x=s.x+ox+16,y=s.y+oy+8-fx.z;
  g.save();g.globalAlpha=fx.a;
  if(fx.kind==='ghost'){IB.drawPerson(g,x,y,'d',0,{skin:'#f0d050',hair:'#f0d050',jacket:'#e0a830',pants:'#b87038',hat:'hat',hatc:'#e0a830'});}
  else if(fx.kind==='food'){g.font='12px monospace';g.fillText('🍲',x-6,y);}
  else if(fx.kind==='note'){g.font='12px monospace';g.fillText(['🎵','🎶'][fx.v%2],x-6,y);}
  else if(fx.kind==='eye'){g.strokeStyle=IB.PAL.mg1;g.beginPath();g.arc(x,y,6,0,7);g.stroke();IB.O(g,x,y,2.5,2.5,IB.PAL.mg3);}
  else if(fx.kind==='line'){g.strokeStyle='rgba(90,160,255,0.6)';g.beginPath();g.moveTo(x-10,y);g.lineTo(x+10,y-8);g.lineTo(x+16,y+4);g.stroke();}
  else if(fx.kind==='shadow'){IB.O(g,x,y,7,9,'rgba(20,16,40,0.7)');g.font='10px monospace';g.fillText('😈',x-5,y-10);}
  else if(fx.kind==='star'){g.font='12px monospace';g.fillText('✦',x-5,y);g.fillStyle='#ffe14e';}
  g.restore();
}

/* ---------- ПОГОДА-ЧАСТИНКИ ---------- */
function drawWeather(g,dt){
  const type=IB.G.wx.type;
  if(type==='sun'||type==='cloud'&&false)return;
  /* керування пулом частинок */
  const want={rain:90,thunder:120,storm:170,wind:30}[type]||0; /* i3 */
  const WV=VW(),WVH=VH();
  while(IB.weatherP.length<want)IB.weatherP.push({x:IB.rnd(0,WV),y:IB.rnd(-WVH,WVH),v:IB.rnd(60,140),d:IB.rnd(0.6,1.4)});
  if(!want)IB.weatherP.length=0;
  g.save();
  for(const p of IB.weatherP){
    if(type==='rain'){
      p.y+=p.v*2.2*dt;p.x-=p.v*0.3*dt;
      g.strokeStyle='rgba(120,170,220,0.5)';g.beginPath();g.moveTo(p.x,p.y);g.lineTo(p.x+1.5,p.y+7);g.stroke();
    }else if(type==='hail'){
      p.y+=p.v*3*dt;
      g.fillStyle='rgba(200,230,245,0.75)';g.fillRect(p.x,p.y,2,2);
    }else if(type==='storm'){
      p.y+=p.v*3.1*dt;p.x-=p.v*1.7*dt;
      g.strokeStyle='rgba(140,180,210,0.65)';g.beginPath();g.moveTo(p.x,p.y);g.lineTo(p.x+4,p.y+14);g.stroke();
    }else if(type==='thunder'){
      p.y+=p.v*2.6*dt;p.x-=p.v*0.9*dt;
      g.strokeStyle='rgba(120,160,210,0.55)';g.beginPath();g.moveTo(p.x,p.y);g.lineTo(p.x+2,p.y+9);g.stroke();
    }else if(type==='wind'){
      p.x+=p.v*2.4*dt;p.y+=IB.M.sin(p.x*0.01)*0.4;
      g.strokeStyle='rgba(200,220,230,0.13)';g.beginPath();g.moveTo(p.x,p.y);g.lineTo(p.x+9,p.y+1);g.stroke();
    }
    if(p.y>WVH+4){p.y=IB.rnd(-20,0);p.x=IB.rnd(0,WV);}
    if(p.x<-10)p.x=WV+10;if(p.x>WV+10)p.x=-10;
  }
  g.restore();
  /* v2.0: сіру завісу хмарності ЗНЯТО — небо чисте (відгук гравця) */
  /* i3: ШТОРМ — темний тиск + тремор; ГРОЗА — блискавки */
  if(type==='storm'){
    g.fillStyle='rgba(30,42,55,0.35)';g.fillRect(0,0,WV,WVH);
    if(IB.M.random()<0.02)IB.GFX.shake=IB.M.max(IB.GFX.shake||0,0.55);
    /* i3-gfx5: ЖАХ-КВЕСТИ — червона вінʼєтка й пульсація */
    if(IB.G.horror&&IB.G.horror.t>0){IB.G.horror.t-=dt;const hl=IB.M.min(1,IB.G.horror.t/2)*(0.5+IB.M.sin(performance.now()*0.008)*0.2);g.fillStyle='rgba(120,10,20,'+(hl*0.30).toFixed(3)+')';g.fillRect(0,0,WV,WVH);}
  }
  if(type==='thunder'&&IB.G.flashT>0){
    g.fillStyle='rgba(240,248,255,'+IB.M.min(0.85,IB.G.flashT*2.4)+')';g.fillRect(0,0,WV,WVH);
  }
}

/* ---------- МІНІКАРТА (v17.0: не використовується — прибрано з HUD) ---------- */
IB.drawMinimap=(g)=>{
  const W=IB.W,sc=120/W.W;
  g.fillStyle='#070d0a';g.fillRect(0,0,120,120);
  const step=2;
  for(let y=0;y<W.H;y+=step)for(let x=0;x<W.W;x+=step){
    const t=W.at(x,y),h=W.elevAt(x,y);
    let c='#101810';
    if(t===0)c=W.elevAt(x,y)<0.05?'#163a4c':'#2a6a78';
    else if(t===1)c='#d4c088';else if(t===5)c='#d8e4ee';
    else if(t===4)c='#5e6a62';else if(t===3)c='#28512e';else if(t===2)c='#3f6a38';
    else if(t===9)c='#8a6038';else if(t===7)c='#6a5030';else if(t===10)c='#5e4628';
    else if(t===12)c='#4a4e50';else if(t===13)c='#c4b48c';else if(t===14)c='#a68754'; /* i3 */
    else if(t===15)c='#c4b090';else if(t===16)c='#3e7a5e'; /* v2.0 */
    else if(t===17)c='#9a9a92';else if(t===19)c='#c8c8c0'; /* v5.0 двори/зебра */
    if(h>5&&t!==0)c=IB.lerpCol?c:'#a8c0d0';
    g.fillStyle=c;g.fillRect(x*sc,y*sc*(120/W.H),step*sc+1,step*(120/W.H)+1);
  }
  /* артефакти при баченні */
  if(IB.G.vision>0||IB.G.trip.active){
    for(const a of IB.ARTIFACTS){
      if(!a.world||IB.artHas(a.id))continue;
      g.fillStyle='#b06ae0';g.fillRect(a.x*sc-1.5,a.y*sc*(120/W.H)-1.5,3,3);
    }
  }
  /* POI */
  for(const p of W.pois){
    g.fillStyle=p.kind==='village'?'#f0d050':(p.kind==='beach'?'#f8e8a0':(p.kind==='pier'||p.kind==='port'?'#5aa0ff':'#c8d0d8'));
    g.fillRect(p.x*sc-1,p.y*sc*(120/W.H)-1,2,2);
  }
  /* група */
  for(const h of IB.E.team){
    g.fillStyle=h.id==='viktor'?'#ffffff':'#c8d8c8';
    g.fillRect(h.x*sc-1,h.y*sc*(120/W.H)-1,h.id==='viktor'?3:2,h.id==='viktor'?3:2);
  }
  /* бліп порятунку */
  const bl=IB.blip();
  if(bl){g.fillStyle='#5aa0ff';g.fillRect(bl.x*sc-2,bl.y*sc*(120/W.H)-2,4,4);}
  /* маршрут */
  if(IB.G.route){
    const L=IB.E.team[0];
    g.strokeStyle='#e05a8a';g.setLineDash([2,2]);
    g.beginPath();g.moveTo(L.x*sc,L.y*sc*(120/W.H));g.lineTo(IB.G.route.x*sc,IB.G.route.y*sc*(120/W.H));g.stroke();
    g.setLineDash([]);
  }
};

/* ---------- ВЕЛИКА КАРТА (панель) ---------- */
IB.drawBigMapBase=(canvas)=>{
  const g=canvas.getContext('2d');
  const sc=canvas.width/IB.W.W, scY=canvas.height/IB.W.H;
  g.fillStyle='#070d0a';g.fillRect(0,0,canvas.width,canvas.height);
  const step=2;
  for(let y=0;y<IB.W.H;y+=step)for(let x=0;x<IB.W.W;x+=step){
    const t=IB.W.at(x,y),h=IB.W.elevAt(x,y);
    let c;
    if(t===0)c=IB.W.elevAt(x,y)<0.05?'#163a4c':'#2a6a78';
    else if(t===1)c='#d4c088';else if(t===5)c='#d8e4ee';
    else if(t===4)c='#5e6a62';else if(t===3)c='#28512e';else if(t===2)c='#3f6a38';
    else if(t===9)c='#9a7044';else if(t===7)c='#6a5030';else if(t===10)c='#5e4628';else if(t===8)c='#3e6a34';
    else if(t===12)c='#4a4e50';else if(t===13)c='#c4b48c';else if(t===14)c='#a68754'; /* i3 */
    else if(t===15)c='#c4b090';else if(t===16)c='#3e7a5e'; /* v2.0 */
    else if(t===17)c='#9a9a92';else if(t===19)c='#c8c8c0'; /* v5.0 */
    else c='#31502c';
    if(h>6&&t!==0)c='#a8c0d0';else if(h>4&&t!==0)c=IB.shade(c,0.1);
    g.fillStyle=c;g.fillRect(x*sc,y*scY,step*sc+0.5,step*scY+0.5);
  }
  g.font='7px monospace';
  for(const p of IB.W.pois){
    const px=p.x*sc,py=p.y*scY;
    g.fillStyle=p.kind==='village'?'#f0d050':(p.kind==='camp'?'#5cb878':(p.kind==='molfar'||p.kind==='ruin'?'#b06ae0':'#e8e8e8'));
    g.fillRect(px-2,py-2,4,4);
    g.fillStyle='#ffffffcc';g.fillText(p.name,px+4,py+2);
  }
  /* v2.0: ПІДПИСИ РАЙОНІВ — план міста з назвами (як у Києва) */
  if(IB.W.DISTRICTS){
    g.font='bold 9px monospace';
    for(const d of IB.W.DISTRICTS){
      const px=d.x*sc,py=d.y*scY;
      g.fillStyle='rgba(240,208,80,0.95)';
      g.fillText(d.name,px+1,py-1);
      g.strokeStyle='rgba(240,208,80,0.4)';g.setLineDash([3,3]);
      g.strokeRect(d.x*sc-1,d.y*scY-9,g.measureText(d.name).width+8,14);
      g.setLineDash([]);
      g.font='7px monospace';
    }
    g.font='7px monospace';
  }
  /* артефакти */
  for(const a of IB.ARTIFACTS){
    if(!a.world)continue;
    const found=IB.artHas(a.id);
    const show=found||(IB.G.vision>0&&!a.hidden)||(IB.G.trip.active)||(IB.G.flags.molfarKnown&&a.id==='a5');
    if(!show)continue;
    const px=a.x*sc,py=a.y*scY;
    g.fillStyle=found?'#8a8c94':'#b06ae0';
    g.beginPath();g.arc(px,py,4,0,7);g.fill();
    g.fillStyle='#ffffffcc';g.fillText(found?a.name:(IB.G.vision>0?a.name:'? ? ?'),px+5,py+3);
  }
  /* група + герої */
  for(const h of IB.E.team){
    const px=h.x*sc,py=h.y*scY;
    g.fillStyle=h.id==='viktor'?'#ffffff':'#b8c8ba';
    g.fillRect(px-1.5,py-1.5,3,3);
  }
  /* бліп */
  const bl=IB.blip();
  if(bl){g.fillStyle='#5aa0ff';g.beginPath();g.arc(bl.x*sc,bl.y*scY,5,0,7);g.stroke();}
  /* маршрут */
  if(IB.G.route){
    const L=IB.E.team[0];
    g.strokeStyle='#e05a8a';g.setLineDash([4,3]);g.lineWidth=1.5;
    g.beginPath();g.moveTo(L.x*sc,L.y*scY);g.lineTo(IB.G.route.x*sc,IB.G.route.y*scY);g.stroke();
    g.setLineDash([]);
  }
  /* вівця Івася */
  if(IB.G.quests.side.sheep&&!IB.G.flags.sheepFound){
    const a=IB.E.animals.find(a=>a.lost);
    if(a){g.fillStyle='#e8a0d0';g.fillRect(a.x*sc-2,a.y*scY-2,4,4);g.fillStyle='#e8a0d0';g.fillText('ВІВЦЯ',a.x*sc+4,a.y*scY);}
  }
};

/* ---------- ТРІП-ФХ ОНОВЛЕННЯ ---------- */
IB.updateFx=(dt)=>{
  /* спавн галюцинацій: тріп «П'ять Хвиль» + КОКТЕЙЛЬНИЙ ТРІП/РОЗГУЛ на вечірці (v2.3) */
  const psy=IB.G.trip.active||IB.partyPsy();
  if(psy){
    const L=IB.E.team[0];
    if(IB.tripFx.length<26&&IB.M.random()<dt*(IB.G.trip.active?4:1.8)){
      const kinds={viktor:['ghost','star'],andriy:['food','star'],taras:['note','star'],petro:['line','eye'],maksym:['shadow','star']};
      const kk=kinds[L.id]||['star'];
      const a=IB.rnd(0,6.28),r=IB.rnd(3,12);
      IB.tripFx.push({x:L.x+IB.M.cos(a)*r,y:L.y+IB.M.sin(a)*r,z:IB.rnd(8,50),
        kind:kk[IB.ri(0,kk.length-1)],v:IB.ri(0,9),a:1,life:IB.rnd(3,7),t:0});
    }
  }
  for(let i=IB.tripFx.length-1;i>=0;i--){
    const fx=IB.tripFx[i];
    fx.t+=dt;fx.z+=IB.M.sin(fx.t*2)*dt*6;
    fx.x+=IB.M.sin(fx.t*0.8)*dt*0.7;fx.y+=IB.M.cos(fx.t*0.6)*dt*0.7;
    fx.a=IB.M.min(1,fx.life-fx.t);
    if(fx.t>=fx.life)IB.tripFx.splice(i,1);
  }
  if(!psy&&IB.tripFx.length)IB.tripFx.length=IB.M.max(0,IB.tripFx.length-1);
};


/* ==================== v1.3: АВТО — справжні машини з ПЕРШОЇ ЧАСТИНИ ==================== */
function drawCar(g,c,ox,oy,dt){
  const s=tileScreen(c.x,c.y);
  const x=s.x+ox+16,y=s.y+oy+6;
  if(c.type==='van'){
    /* білий фургон групи (спогад про Київ) — процедурний */
    IB.O(g,x+6,y,30,11,'#00000035');
    IB.isoBox(g,x,y,44,23,13,c.c,IB.shade(c.c,-0.18),IB.shade(c.c,-0.3));
    IB.P(g,x+9,y-6,27,7,'#2a3e5c');
    IB.P(g,x+11,y-5,6,4,'#8ab8d8');IB.P(g,x+20,y-5,6,4,'#8ab8d8');IB.P(g,x+29,y-5,6,4,'#8ab8d8');
    IB.P(g,x+6,y+5,3,4,IB.shade(c.c,-0.35));IB.P(g,x+36,y+5,3,4,IB.shade(c.c,-0.35));
    IB.P(g,x+12,y+2,21,4,'#c83828');            /* v2.4b: ван бІльший */
    return;
  }
  let m=c.model&&IB.img('car_'+c.model+'_se')?c.model:null;
  /* v21: викликне таксі — СПРАВЖНІЙ жовтий спрайт із шашками (усі 4 напрями) */
  if(c.taxiCall&&IB.img('car_taxi_se'))m='taxi';
  const im=m?IB.img('car_'+m+'_se'):null;
  if(im){
    /* PNG-машини v5 (ВАЗ, Lanos, SUV, Truck) — вид SE, для лівого напрямку дзеркало.
       v10: вертикальні ЛІНІЇ — вид SW (вниз-ліворуч по ізо-діагоналі),
       «на північ» — дзеркало SW (вгору-праворуч).
       v11.0 «ПРИЛИПЛИ ДО ДОРОГИ»: у спрайтів з-низу ПРОЗОРИЙ відступ (17-18px
       в ізо-машин) — раніше авто «літали» над асфальтом. Тепер спрайт
       піднято на pad*sc, і нижній НЕПРОЗОРИЙ піксель (колесо) стає точно
       на контактну лінію смуги = центр ромба дороги + 1px. Нові авто —
       ТРОХИ БІЛЬШІ (sc 0.62 → 0.70). */
    const sc=0.70;
    /* v18.1 ФІКС ПОВОРОТУ — ЗА ЕТАЛОНОМ ПЕРШОЇ ЧАСТИНИ (legend_v5 gfx.js:
       CARKEY=['se','nw','sw','ne'] → 0=SE(+x) 1=NW(−x) 2=SW(+y) 3=NE(−y)).
       Проєкція та сама (tileScreen=(x−y)*16,(x+y)*8): рух 'r' — на екрані
       ВНИЗ-ПРАВО (SE), 'l' — ВГОРУ-ЛІВО (NW), 'd' — ВНИЗ-ЛІВО (SW),
       'u' — ВГОРУ-ПРАВО (NE). Ніс ізо-спрайта = його назва: _se дивиться
       вниз-право, _sw — вниз-ліво, _nw — вгору-ліво, _ne — вгору-право.
       v17 «фікс» інвертував правильний мапінг — усе місто їздило БОКОМ.
       Тепер: r→_se, l→_nw, d→_sw, u→_ne — СПРАВЖНІ 4-напрямні Kenney-
       рендери з Першої частини (vaz/lanos/suv/truck/van) + процедурний
       bus; на повороті авто змінює вид (усі сторони ізометрії). Бічні
       спрайти (audi/bmw/tesla/sport/ev/minivan/taxi) — дзеркало за ходом. */
    /* v18.3: бокові моделі (audi/bmw/tesla/sport/ev/minivan/taxi) ВИДАЛЕНІ разом
       з ассетами — усьому трафіку СПРАЖНІ 4-напрямні рендери (_se/_sw/_nw/_ne),
       дзеркалень немає ЖОДНОГО — жодних «перевернутих» авто */
    /* v18.7: кольоровий варіант (cars3.js) — c.var 'a'/'b'/'c' з spawnCars */
    const m2=(c.var&&IB.img('car_'+m+'_'+c.var+'_se'))?m+'_'+c.var:m;
    let key='car_'+m2+'_se',flip=false;
    if(c.dir==='d'||c.dir==='u'){
      /* вертикальні вулиці: 'd' — екран SW → вид _sw; 'u' — екран NE → вид _ne */
      if(c.dir==='d'){key=IB.img('car_'+m2+'_sw')?'car_'+m2+'_sw':'car_'+m2+'_se';}
      else{
        key='car_'+m2+'_ne';
        if(!IB.img(key)){key=IB.img('car_'+m2+'_sw')?'car_'+m2+'_sw':'car_'+m2+'_se';flip=true;}
      }
    }else if(c.dir==='l'){
      /* рух на захід — ніс ВГОРУ-ЛІВО: окремий NW-рендер (як у ч.1);
         фолбек — дзеркало _se (лишається паралельно дорозі) */
      if(!IB.img('car_'+m2+'_nw'))flip=true;else key='car_'+m2+'_nw';
    }
    /* v21: биті паркунки — варіант _d (еталон ч.1: car_*_<dir>_d) */
    if(c.dmg&&IB.img(key+'_d'))key=key+'_d';
    const base=IB.img(key)||im;
    const src=flip?(IB._mir[key]||IB.mirror(key)||base):base;
    const pad=(IB.CARPAD&&IB.CARPAD[m]!=null)?IB.CARPAD[m]:8;
    const dw=base.width*sc,dh=base.height*sc;
    const contactY=s.y+oy+9;               /* лінія контакту колеса і смуги */
    /* тІнь під видимогою частиною машини */
    g.fillStyle='#00000030';g.beginPath();g.ellipse(x,contactY-1,dw*0.30,dh*0.09,0,0,7);g.fill();
    g.drawImage(src,x-dw/2,contactY-dh+pad*sc,dw,dh);
    /* ТАКСІ (викликне, жовтий Lanos) — шашки на боку і «ТАКСІ» на даху */
    if(c.taxiCall){
      const by=contactY-dh+pad*sc;
      /* v21: шашки і знак уже в спрайті taxi — малюємо тільки ліхтар на даху */
      if(m!=='taxi'){
        g.font='7px monospace';g.fillStyle='#101418';g.fillText('TAXI',x-9,by+dh*0.34);
        const chY=by+dh*0.44;
        for(let i=0;i<6;i++){g.fillStyle=i%2?'#101418':'#f4f4f0';g.fillRect(x-dw*0.24+i*dw*0.08,chY,dw*0.08,2.2);}
      }
      g.fillStyle='#f8e890';g.fillRect(x-6,by+1,12,3);  /* ліхтар на даху */
    }
    /* v20.0: НІЧНЕ СВІТЛО АВТО перенесене у ПОСЛЕДНІЙ прохід поверх нічного
       оверлея (див. кінець нічного блоку renderWorld) — темрява не з'їдає
       конуси фар. Тут лишається тільки БІП-БІП. */
    if(c.honkT>4.4){g.font='10px monospace';g.fillStyle='#f0d050';g.fillText('БІП!',x-9,contactY-dh-6);}
    return;
  }
  /* фолбек — процедурний бокс */
  const dark=IB.shade(c.c,-0.35);
  IB.isoBox(g,x,y,26,14,7,c.c,IB.shade(c.c,-0.18),IB.shade(c.c,-0.3));
  IB.P(g,x+5,y-3,15,4,'#2a3e5c');
  IB.P(g,x+6,y-2,4,3,'#9ac4e0');IB.P(g,x+12,y-2,4,3,'#9ac4e0');
  IB.P(g,x+3,y+3,2,3,dark);IB.P(g,x+21,y+3,2,3,dark);
}

/* ==================== v1.2: СХОДЖЕННЯ (мандрівка) ==================== */
/* ==================== v2.4 «ФІНАЛ»: СХОДЖЕННЯ — ІЗОМЕТРІЯ ====================
   Гора-піраміда з терасами (ліс смерек → полонина → скелі → сніжники),
   звивиста стежка-серпантин, вся група ЙДЕ по ній (анімація кроків) і
   штурмує вершину; хмари у ТРИ ШАРИ (за вершинами, море хмар під вершиною,
   перед камерою); ізо-вершини сусіди; прапорець+тур / озеро / стела на
   фініші; експедиція — ізо-траса з ваном, стовпами і пилом. */
IB.ASC_STAGES={
  peak:['ПІДНІЖЖЯ — СТАРА СТЕЖКА','ГРАВІЙ І СМЕРЕКИ','ПОЛОНИНА — ВІТЕР З ХРЕБТА','СКЕЛЬНІ ВИХОДИ','СНІЖНИК — ОСТАННІЙ РИВОК','ВЕРШИНА'],
  lake:['ПІДНІЖЖЯ','ЯЛИНОВИЙ ЛІС','ПОЛОНИНА','БЕРЕГ ОЗЕРА'],
  border:['ДОЛИНА ТИСУ','ГРУНТОВА ДОРОГА','ПРИКОРДОННА СТЕЛА'],
  expedition:['ЗАВАНТАЖЕННЯ В БІЛИЙ ВАН','ВОЛИНСЬКА ТРАСА','ЗАЛІСІННЯ','ПЛЯЖ СВІТЯЗЯ'],
};
/* v15.0: МОРЕ І МІСТО — стадії подорожей Частина 3 (замість карпатських сходжень) */
IB.ASC_STAGES.sea=['ПРИЧАЛ — ВІДХОДЖЕННЯ','БРЕЗ І ХВИЛІ','ВІДКРИТЕ МОРЕ','ЧАЙКИ І ДЕЛЬФІНИ','ПОВЕРТАННЯ ДО БЕРЕГА','ПРИЧАЛ — ПРИБИТТЯ'];
IB.ASC_STAGES.city=['ПОСАДКА В МАРШРУТКУ','ПРОСПЕКТ МИРУ','КВАРТАЛИ МІСТА','ЗУПИНКА-АНЕКДОТ','ФІНАЛЬНИЙ ПІДЇЗД','ВИХІД НА ЗУПИНЦІ'];
/* ==================== v15.0: МОРСЬКА/МІСЬКА ПОДОРОЖ (замість сходження) ====================
   Квести Частина 3 — всі морські й міські: катамаран, пором, рибалка, кіно,
   клуб, маршрутка на Одесу. Замість карпатської гори — ПРОГУЛЯНКА МОРЕМ
   (човен, хвилі, дельфіни, чайки, буї) і ПОЇЗДКА МІСТОМ (маршрутка,
   проспект, панельки, ліхтарі). Група на борту, репліки, погода. */
/* ==================== v18.7: ДІЙСТВА НА КАНВІ ====================
   КЛУБ-ДІЙСТВО (танці + пульт діджея) і ЇЖА-ДІЙСТВО («сіли поїсти»):
   6/5 фаз, 3 «родини» відвідувачів бігають-падають-танцюють, діджей
   Іверо за пультом, бар Зази, лазери, диско-куля, бас-спалахи,
   конфетті; у їдальні — стіл п'ятірки, офіціантка Люда, тарілки. */
IB.drawClubShow=(g,dt)=>{
  const S=IB.G.clubShow;if(!S)return;
  const _w=VW(),_h=VH();
  g.save();g.fillStyle='#070a12';g.fillRect(0,0,_w,_h);
  g.translate(IB.M.round((_w-480)/2),IB.M.round((_h-336)/2));
  g.beginPath();g.rect(0,0,480,336);g.clip();
  const T=performance.now()*0.001;
  const rave=!!S.rave;
  const meal=S.kind==='meal';
  const PH=meal?IB.MEAL_PHASES:IB.CLUB_PHASES;
  const ph=PH[IB.M.min(S.hour,PH.length-1)]||PH[0];
  const PHC=['#3aa0e0','#e05a5a','#f0d050','#4ee06a','#e07ab8','#e07038'];
  const pcol=PHC[IB.M.min(S.hour,PHC.length-1)];
  const beat=(IB.M.sin(T*(rave?9:6))+1)/2;
  if(meal){
    /* ---------- ЗАЛ КАФЕ/ЇДАЛЬНІ ---------- */
    const wall=g.createLinearGradient(0,0,0,200);
    wall.addColorStop(0,'#2e2a26');wall.addColorStop(1,'#3a332c');
    g.fillStyle=wall;g.fillRect(0,0,480,200);
    g.fillStyle='#54473a';g.fillRect(0,200,480,136);
    for(let i=0;i<7;i++){g.fillStyle=i%2?'#4e4236':'#54473a';g.fillRect(0,200+i*20,480,20);}
    /* вікно з видом на море */
    g.fillStyle='#1c2c3c';g.fillRect(28,26,150,96);
    const sea=g.createLinearGradient(0,40,0,120);
    sea.addColorStop(0,'#5a9ec8');sea.addColorStop(1,'#2a6a94');
    g.fillStyle=sea;g.fillRect(32,60,142,58);
    g.fillStyle='#3a5568';g.fillRect(32,30,142,30);
    g.fillStyle='#f8e8a0';g.beginPath();g.arc(146,48,9,0,7);g.fill();
    for(let i=0;i<4;i++){g.fillStyle='rgba(240,248,255,0.5)';g.fillRect(44+i*32,72+IB.M.sin(T*1.6+i)*3,22,2);}
    g.strokeStyle='#6a5a46';g.lineWidth=4;g.strokeRect(28,26,150,96);
    g.strokeStyle='#6a5a46';g.lineWidth=2;g.beginPath();g.moveTo(103,26);g.lineTo(103,122);g.stroke();
    /* меню-дошка */
    g.fillStyle='#3e3830';g.fillRect(216,30,110,72);
    g.fillStyle='#e8dcb0';g.font='7px monospace';g.textAlign='center';
    g.fillText(S.place||'КАФЕ',271,46);
    g.fillText('СЬОГОДНІ У МЕНЮ:',271,60);
    g.fillText('борщ • шаурма • компот',271,72);
    g.fillText('смачного, легендарні!',271,88);
    /* довгий стіл п'ятірки */
    IB.PA(g,[[150,232],[350,232],[342,262],[158,262]],'#7a5a38');
    IB.PA(g,[[150,232],[350,232],[344,240],[156,240]],'#94744c');
    const eat=IB.clamp(S.t/((IB.MEAL_PHASES.length-1)*9),0,1);
    const heroNames=['ЛЕГ','TOX','PAB','DII','ROC'];
    const heroC=['#e0a878','#c89878','#f0b48c','#a87858','#d8a888'];
    const heroJ=['#2a3e5c','#c8483c','#3aa06a','#5c86c8','#e07038'];
    for(let i=0;i<5;i++){
      const px2=166+i*40,py=218;
      IB.O(g,px2,262,13,4,'rgba(0,0,0,0.3)');
      IB.drawPerson(g,px2,py,i%2?'d':'u',((T*4+i)|0)%2,{skin:heroC[i],hair:'#2a1a10',hat:'none',jacket:heroJ[i],pants:'#2a3e5c'});
      const full=1-eat;
      IB.O(g,px2+16,240+IB.M.sin(i)*2,7,3.4,'#f2efe6');
      if(full>0.05){IB.O(g,px2+16,240+IB.M.sin(i)*2-1,5*full+1.6,2.4*full+0.8,i%2?'#e0b060':'#d08050');}
      g.fillStyle='#c8d8d0';g.font='6px monospace';g.textAlign='center';
      g.fillText(heroNames[i],px2,py-24);
    }
    /* офіціантка Люда */
    const wPh=S.hour;
    const wx2=wPh===0?(480-IB.M.min(1,S.t/9)*260):214;
    const wWob=wPh<=1?IB.M.abs(IB.M.sin(T*8))*2.4:0;
    IB.O(g,wx2,266,11,3.4,'rgba(0,0,0,0.28)');
    IB.drawPerson(g,wx2,238-wWob,'d',((T*6)|0)%2,{skin:'#f0b48c',hair:'#6a3a1a',hat:'none',jacket:'#e8e8e2',pants:'#3a3e4c'});
    if(wPh<=1){IB.P(g,wx2+8,228,10,6,'#f2efe6');IB.O(g,wx2+13,226,3,2,'#e0b060');}
    /* інші відвідувачі за бічними столиками */
    for(let i=0;i<IB.CLUB_ACTORS.length;i+=2){
      const a=IB.CLUB_ACTORS[i];
      const sx2=52+(i%3)*16,sy2=196+((i/3)|0)*30;
      IB.O(g,sx2,sy2+18,10,3,'rgba(0,0,0,0.25)');
      IB.drawPerson(g,sx2,sy2,'d',0,a.look);
    }
    /* репліки героїв — бульбашки над столом */
    if(IB.M.random()<0.03){
      const hb={x:166+IB.ri(0,4)*40,y:206,txt:['Смачно!','Ням!','Ще борщу!','Компот топ!','Ха-ха!'][IB.ri(0,4)],t:0,life:2.2};
      IB.MEAL_BUB=(IB.MEAL_BUB||[]).filter(b=>b.t<b.life);
      IB.MEAL_BUB.push(hb);
    }
    for(const b of (IB.MEAL_BUB||[])){
      b.t+=dt;
      g.font='8px monospace';
      const tw=g.measureText(b.txt).width;
      IB.P(g,b.x-tw/2-4,b.y-12,tw+8,11,'rgba(12,10,8,0.78)');
      g.fillStyle='#f0e8d8';g.textAlign='center';
      g.fillText(b.txt,b.x,b.y-4);
      g.textAlign='left';
    }
  }else{
    /* ---------- ЗАЛ КЛУБУ «МАЯК» ---------- */
    const wall=g.createLinearGradient(0,0,0,170);
    wall.addColorStop(0,'#10141f');wall.addColorStop(1,'#1a2233');
    g.fillStyle=wall;g.fillRect(0,0,480,170);
    g.strokeStyle=pcol;g.lineWidth=2;g.font='bold 16px monospace';g.textAlign='center';
    g.fillStyle=pcol;g.globalAlpha=0.55+0.45*beat;
    g.fillText('К Л У Б   « М А Я К »',240,26);
    g.globalAlpha=1;
    g.strokeStyle='rgba(58,160,224,0.5)';g.lineWidth=1.6;
    g.beginPath();g.arc(52,60,12,0,7);g.stroke();g.beginPath();g.moveTo(52,48);g.lineTo(52,76);g.stroke();
    g.beginPath();g.arc(428,60,12,0,7);g.stroke();g.beginPath();g.moveTo(428,48);g.lineTo(428,76);g.stroke();
    /* ТАНЦПОЛ: перспективна сітка */
    g.fillStyle='#0c1018';g.fillRect(0,168,480,168);
    for(let i=0;i<10;i++){
      const yy=172+i*i*1.9+i*8;
      if(yy>330)break;
      const pr=parseInt(pcol.slice(1),16);
      g.strokeStyle='rgba('+(pr>>16&255)+','+(pr>>8&255)+','+(pr&255)+','+(0.36-i*0.03).toFixed(2)+')';
      g.beginPath();g.moveTo(0,yy);g.lineTo(480,yy);g.stroke();
    }
    for(let i=-6;i<=6;i++){
      g.strokeStyle='rgba(58,160,224,0.14)';
      g.beginPath();g.moveTo(240+i*14,172);g.lineTo(240+i*74,336);g.stroke();
    }
    /* СЦЕНА + ПУЛЬТ ДІДЖЕЯ */
    IB.PA(g,[[168,150],[312,150],[322,172],[158,172]],'#232c3e');
    IB.PA(g,[[172,132],[308,132],[312,150],[168,150]],'#2c3852');
    const djBob=IB.M.sin(T*(rave?10:7))*2.4;
    IB.drawPerson(g,240,120+djBob,'d',((T*6)|0)%2,{skin:'#c89878',hair:'#1a1a1a',hat:'cap',jacket:'#f0d050',pants:'#2a3e5c'});
    IB.P(g,214,124,52,8,'#3e5568');IB.P(g,218,118,44,6,'#4e6880');
    for(let i=0;i<4;i++){
      g.fillStyle=IB.M.sin(T*8+i*1.6)>0?'#f0d050':'#3e5568';
      g.fillRect(222+i*10,120,6,3);
    }
    g.fillStyle='#c8d8d0';g.font='6px monospace';g.textAlign='center';
    g.fillText('ДІДЖЕЙ ІВЕРО',240,108);
    /* колонки */
    for(const sx of [150,330]){
      IB.PA(g,[[sx-16,128],[sx+16,128],[sx+16,172],[sx-16,172]],'#18202e');
      for(let i=0;i<3;i++){
        const pr2=4+i*4.4+(rave?beat*4:beat*2.4);
        g.strokeStyle='rgba(240,208,80,'+(0.8-i*0.24).toFixed(2)+')';
        g.beginPath();g.arc(sx,140+i*10,pr2,0,7);g.stroke();
      }
    }
    /* ДИСКО-КУЛЯ */
    const bx2=240,by2=66;
    g.strokeStyle='#3e5568';g.beginPath();g.moveTo(bx2,32);g.lineTo(bx2,by2-10);g.stroke();
    IB.O(g,bx2,by2,9,9,'#a8b4c4');
    for(let i=0;i<10;i++){
      const ga=T*1.4+i*0.63;
      g.fillStyle='rgba(255,255,255,'+(0.25+0.3*IB.M.sin(ga*2)).toFixed(2)+')';
      g.fillRect(bx2+IB.M.cos(ga)*7-1,by2+IB.M.sin(ga)*7-1,2,2);
    }
    for(let i=0;i<12;i++){
      const ga=T*0.9+i*0.53,r2=90+((i*37)%120);
      IB.O(g,bx2+IB.M.cos(ga)*r2*0.8,by2+IB.M.sin(ga)*r2*0.55,3,2.2,'rgba(200,220,255,0.12)');
    }
    /* ЛАЗЕРИ */
    const LCOL=['#3aa0e0','#e05a5a','#f0d050','#4ee06a','#e07ab8','#e07038'];
    const nL=rave?6:4;
    for(let i=0;i<nL;i++){
      const lc=LCOL[(i+(S.hour||0))%6];
      const x0=170+(i*140/nL),y0=118;
      const lx=x0+IB.M.sin(T*1.1+i*1.1)*70,ly=250+((i*53)%60);
      g.strokeStyle=lc;g.globalAlpha=0.5+0.4*beat;g.lineWidth=1.6;
      g.beginPath();g.moveTo(x0,y0);g.lineTo(lx,ly);g.stroke();
      g.globalAlpha=1;
    }
    /* БАР ЗАЗИ */
    IB.PA(g,[[408,196],[470,196],[470,268],[408,268]],'#2e3a2e');
    IB.PA(g,[[408,196],[470,196],[466,204],[412,204]],'#4a5a44');
    for(let i=0;i<5;i++){
      g.fillStyle=['#4ee06a','#e07038','#f0d050','#3aa0e0','#e05a5a'][i];
      g.fillRect(416+i*10,178,5,12);
    }
    IB.drawPerson(g,438,186,'d',0,{skin:'#e0a878',hair:'#8a5a28',hat:'none',jacket:'#e8e8e2',pants:'#2a3e5c'});
    g.fillStyle='#c8d8d0';g.font='6px monospace';g.fillText('ЗАЗА',420,182);
    /* БАС-СПАЛАХ */
    if(beat>0.82){g.fillStyle='rgba(255,255,255,'+(rave?0.10:0.06)+')';g.fillRect(0,0,480,336);}
    /* КОНФЕТТІ у фіналі */
    if(S.hour>=(rave?4:3)){
      for(let i=0;i<40;i++){
        const cy2=((T*40+i*29)%340)-10;
        const cx3=(i*83)%470;
        g.fillStyle=['#f0d050','#4ee06a','#e05a5a','#3aa0e0','#e07ab8'][i%5];
        g.fillRect(cx3,cy2,2.4,3.6);
      }
    }
    /* ---------- НАТУПЛЕННЯ: 3 «РОДИНИ» + ГЕРОЇ ---------- */
    const HEROJ=['#2a3e5c','#c8483c','#3aa06a','#5c86c8','#e07038'];
    for(let i=0;i<5;i++){
      const hx2=150+i*46+IB.M.sin(T*0.9+i*2)*10;
      const hy2=232+((i%2)*36);
      const hop=IB.M.abs(IB.M.sin(T*(rave?9:7)+i*1.3))*3.4;
      IB.O(g,hx2,hy2+6,12,3.4,'rgba(0,0,0,0.32)');
      IB.drawPerson(g,hx2,hy2-hop,i%2?'d':'u',((T*7+i)|0)%2,{skin:'#e0a878',hair:'#2a1a10',hat:i===3?'cap':'none',jacket:HEROJ[i],pants:'#2a3e5c'});
    }
    for(let ai=0;ai<IB.CLUB_ACTORS.length;ai++){
      const a=IB.CLUB_ACTORS[ai];
      const hop=a.mode==='dance'?IB.M.abs(IB.M.sin(T*(rave?9:7)+a.bob))*3.2:0;
      IB.O(g,a.x,a.y+5,11,3.2,'rgba(0,0,0,0.3)');
      if(a.mode==='fall'){
        g.save();g.translate(a.x,a.y-2);g.rotate(1.35);
        IB.drawPerson(g,0,0,'d',0,a.look);
        g.restore();
        g.font='10px monospace';g.fillText('😵',a.x+9,a.y-10);
      }else if(a.mode==='bar'){
        IB.drawPerson(g,a.x,a.y,'u',0,a.look);
        g.font='8px monospace';g.fillText('🍹',a.x+8,a.y-22);
      }else{
        IB.drawPerson(g,a.x,a.y-hop,a.dir,a.fr,a.look);
        if(a.mode==='dance'){g.font='9px monospace';g.fillText((ai%2)?'🎵':'🎶',a.x-8,a.y-30+IB.M.sin(T*5+a.bob)*2);}
      }
      if(a.bubble){
        g.font='8px monospace';
        const tw=g.measureText(a.bubble.txt).width;
        IB.P(g,a.x-tw/2-3,a.y-42,tw+6,10,'rgba(10,14,20,0.72)');
        g.fillStyle='#e8f0ea';g.textAlign='center';
        g.fillText(a.bubble.txt,a.x,a.y-34);
        g.textAlign='left';
      }
    }
  }
  /* ---------- СПІЛЬНЕ: шапка фази + прогрес ---------- */
  IB.P(g,0,0,480,18,'rgba(6,10,16,0.86)');
  g.fillStyle='#e8eef2';g.font='7px monospace';g.textAlign='center';
  g.fillText((meal?'🍚 ':'🎧 ')+(S.rave?'РЕЙВ-ДІЙСТВО • ':'')+'ФАЗА '+(S.hour+1)+'/'+PH.length+': '+ph.n,240,12);
  for(let i=0;i<PH.length;i++){
    g.fillStyle=i<=S.hour?pcol:'#2a3444';
    g.fillRect(240-PH.length*5+i*10,14,7,2);
  }
  g.textAlign='left';
  g.fillStyle='#7a8a98';g.font='6.5px monospace';
  g.fillText(meal?'Сіли всією п\'ятіркою — година-півтори':'ESC або ✖ — піти з дійства раніше',8,330);
  g.restore();
};

IB.drawVoyage=(g,dt)=>{
  const C=IB.TRAVEL_CUR;if(!C)return;
  /* сцена 480×336 центрується на канві будь-якого розміру (без чорних полос) */
  const _w=VW(),_h=VH();
  g.save();g.fillStyle='#0e1620';g.fillRect(0,0,_w,_h);
  g.translate(IB.M.round((_w-480)/2),IB.M.round((_h-336)/2));
  g.beginPath();g.rect(0,0,480,336);g.clip();
  const r=C.route;
  const isSea=r.kind==='sea';
  const stages=IB.ASC_STAGES[r.kind]||IB.ASC_STAGES.sea;
  const st=IB.M.min(stages.length-1,IB.M.floor(C.prog/100*stages.length));
  const wx=IB.G.wx.type,nf=IB.nightFactor(),gh=IB.goldenHour();
  const T=performance.now()*0.001;
  /* ---------- НЕБО ---------- */
  const sky=g.createLinearGradient(0,0,0,336);
  if(nf>0.5){sky.addColorStop(0,'#0a1226');sky.addColorStop(1,'#182338');}
  else if(wx==='sun'){sky.addColorStop(0,'#28598c');sky.addColorStop(1,gh>0.4?'#e8c8a0':'#a8c4d8');}
  else if(wx==='rain'||wx==='storm'){sky.addColorStop(0,'#3a4452');sky.addColorStop(1,'#7a8a98');}
  else {sky.addColorStop(0,'#5a7a94');sky.addColorStop(1,'#b8c8d4');}
  g.fillStyle=sky;g.fillRect(0,0,480,336);
  if(nf>0.5)for(let i=0;i<42;i++){
    const sx=IB.hsh(i,1,940)*480,sy=IB.hsh(i,2,941)*150;
    g.fillStyle='rgba(215,228,255,'+(0.35+0.45*IB.hsh(i,3,942))*(0.55+0.45*IB.M.sin(T*2+i))+')';
    g.fillRect(sx,sy,1.4,1.4);
  }
  /* сонце / місяць */
  g.fillStyle=nf>0.5?'#e8e8d8':(gh>0.4?'#f8c070':'#f8e8a0');
  g.beginPath();g.arc(398,62,11,0,7);g.fill();
  if(nf<=0.5){g.fillStyle='rgba(248,232,160,0.16)';g.beginPath();g.arc(398,62,20,0,7);g.fill();}
  /* чайки у небі */
  g.strokeStyle='rgba(30,40,50,0.5)';g.lineWidth=1.3;
  for(let i=0;i<3;i++){
    const bx=(T*24+i*150)%540-30,by=56+i*18+IB.M.sin(T*1.6+i*2)*5;
    const w2=IB.M.sin(T*7+i*2)*2.5;
    g.beginPath();g.moveTo(bx-4,by+w2);g.lineTo(bx,by);g.lineTo(bx+4,by+w2);g.stroke();
  }
  if(isSea){
    /* ---------- МОРЕ ---------- */
    const seaY=176;
    const wgr=g.createLinearGradient(0,seaY,0,336);
    wgr.addColorStop(0,nf>0.5?'#12203a':'#2a6a94');wgr.addColorStop(1,nf>0.5?'#0a1526':'#1a4468');
    g.fillStyle=wgr;g.fillRect(0,seaY,480,336-seaY);
    g.fillStyle=nf>0.5?'#2a3c5c':'#7ab6d4';g.fillRect(0,seaY,480,2);
    for(let i=0;i<14;i++){
      const wy=seaY+8+i*11,wx2=((i*97+T*26)%560)-40;
      g.fillStyle='rgba(190,232,244,'+(0.5-i*0.02)+')';
      g.fillRect(wx2,wy,26-i,1.6);
    }
    /* буй (етап 2+) */
    if(st>=1){
      const bx=64,by=250+IB.M.sin(T*1.4)*3;
      IB.P(g,bx-1,by-14,3,10,'#c83828');
      IB.O(g,bx,by-16,4,4,'#e07038');
    }
    /* ---------- ЧОВЕН/КАТАМАРАН + ГРУПА ---------- */
    const bob=IB.M.sin(T*1.5)*3,tilt=IB.M.sin(T*1.2)*0.04;
    g.save();g.translate(240,232+bob);g.rotate(tilt);
    IB.PA(g,[[-56,6],[56,6],[40,20],[-40,20]],'#8a4a22');
    IB.PA(g,[[-56,6],[56,6],[50,10],[-50,10]],'#a85c2c');
    IB.isoBox(g,-16,-22,30,16,14,'#e8e8e2','#c8ccc4','#9aa0a8');
    IB.P(g,-10,-16,6,5,nf>0.5?'#f0c060':'#7ab6d4');
    IB.P(g,4,-16,6,5,nf>0.5?'#f0c060':'#7ab6d4');
    IB.P(g,30,-34,2,28,'#5e4628');
    IB.PA(g,[[32,-34],[44,-30+IB.M.sin(T*3)*2],[32,-26]],'#c83828');
    for(let i=0;i<5;i++){
      const h=IB.E.team[i];if(!h)continue;
      const px=-46+i*23,fr=1+(IB.M.floor(T*5+i*0.7)&1);
      IB.drawPerson(g,px,6,i<2?'l':'r',fr,h.look,0.62);
    }
    g.restore();
    /* піна за кормою */
    g.fillStyle='rgba(240,248,252,0.5)';
    for(let i=0;i<8;i++)g.fillRect(196-((T*40+i*23)%120),250+((i&3)*7),IB.M.max(3,14-i),2);
    /* дельфіни (етап 3+) */
    if(st>=2){
      for(let d2=0;d2<2;d2++){
        const ph=(T*0.9+d2*0.5)%1;
        const dx2=120+d2*180+ph*60,dy2=300-IB.M.sin(ph*3.14)*38;
        g.strokeStyle=nf>0.5?'#38506e':'#3a5a74';g.lineWidth=2.4;g.lineCap='round';
        g.beginPath();g.moveTo(dx2-7,dy2+3);g.quadraticCurveTo(dx2,dy2-4,dx2+8,dy2+2);g.stroke();
      }
    }
  }else{
    /* ---------- МІСТО: ПРОСПЕКТ І МАРШРУТКА ---------- */
    for(let i=0;i<9;i++){
      const bx=((i*64+T*38)%560)-40;
      const bh=26+IB.hsh(i,1,930)*30;
      g.fillStyle=nf>0.5?'#1a2234':'#8aa294';
      g.fillRect(bx,136-bh,34,bh);
      g.fillStyle=nf>0.5?'#f0c060':'#c8d8e0';
      for(let wy=0;wy<3;wy++)for(let wx2=0;wx2<3;wx2++)
        if(IB.hsh(i*9+wy*3+wx2,2,931)<0.6)g.fillRect(bx+5+wx2*9,140-bh+wy*8,4,4);
    }
    g.fillStyle=nf>0.5?'#181e2c':'#5a6a72';g.fillRect(0,170,480,166);
    g.fillStyle=nf>0.5?'#232b3c':'#7e8c94';g.fillRect(0,170,480,10);g.fillRect(0,322,480,14);
    g.fillStyle='#e8d050';
    for(let i=0;i<8;i++)g.fillRect(((i*70+T*160)%560)-40,254,30,4);
    for(let i=0;i<4;i++){
      const lx=((i*140+T*70)%560)-60;
      g.fillStyle='#3a424e';g.fillRect(lx,186,3,80);
      IB.O(g,lx+1,184,4,3,nf>0.5?'#f0d050':'#6a7480');
    }
    const bob=IB.M.sin(T*7)*0.8;
    g.save();g.translate(240,228+bob);
    IB.isoBox(g,-52,-26,104,40,26,'#e8e8e2','#c8ccc4','#8a94a0');
    IB.PA(g,[[-52,-26],[52,-26],[52,-2],[-52,-2]],'#2a6ab0');
    for(let i=0;i<4;i++)IB.P(g,-42+i*22,-20,14,10,nf>0.5?'#f0c060':'#7ab6d4');
    IB.O(g,-30,22,9,9,'#242830');IB.O(g,30,22,9,9,'#242830');
    IB.O(g,-30,22,3,3,'#8a94a0');IB.O(g,30,22,3,3,'#8a94a0');
    g.restore();
    for(let i=0;i<5;i++){
      const h=IB.E.team[i];if(!h)continue;
      IB.P(g,206+i*17,212+bob,10,12,'rgba(20,28,40,0.55)');
    }
  }
  /* ---------- дощик ---------- */
  if(wx==='rain'||wx==='thunder'||wx==='storm'){g.strokeStyle='rgba(160,200,230,0.5)';g.beginPath();
    for(let i=0;i<40;i++){const xx=IB.hsh(i,1,920)*480,yy=(IB.hsh(i,2,921)*336+performance.now()*0.25)%336;
      g.moveTo(xx,yy);g.lineTo(xx-2,yy+8);}g.stroke();}
  /* золота година + темрява */
  if(gh>0.2&&nf<0.5){g.fillStyle='rgba(248,180,90,'+(gh*0.13)+')';g.fillRect(0,0,480,336);}
  if(nf>0.1){g.fillStyle='rgba(10,16,30,'+(nf*0.45)+')';g.fillRect(0,0,480,336);}
  /* ---------- HUD ПОДОРОЖІ ---------- */
  g.fillStyle='rgba(6,12,10,0.78)';g.fillRect(6,6,468,34);
  g.font='9px monospace';g.fillStyle='#f0d050';g.fillText(r.name,12,20);
  g.fillStyle='#c8d8cc';g.font='7px monospace';
  g.fillText('ВІДХІД: '+(r.from||'ЧОРНОМОРСЬК')+' • СКЛАДНІСТЬ '+r.diff+' • '+r.hours+' ГОД',12,33);
  g.fillStyle='rgba(6,12,10,0.78)';g.fillRect(6,44,468,16);
  g.font='8px monospace';g.fillStyle='#7ccc8e';
  g.fillText('ЕТАП '+(st+1)+'/'+stages.length+': '+stages[st],12,56);
  g.fillStyle='#1a241c';g.fillRect(6,64,468,10);
  g.fillStyle='#5cb878';g.fillRect(6,64,468*C.prog/100,10);
  g.font='7px monospace';g.fillStyle='#e8f0e8';
  g.fillText('ПРОЙДЕНО: '+IB.M.round(C.prog)+'% • ЗАЛИШИЛОСЬ ~'+IB.M.max(0,IB.M.round(r.hours*(100-C.prog)/100))+' ГОД',12,72);
  g.font='7px monospace';
  let sx=12;
  for(const h of IB.E.team){
    g.fillStyle=h.def&&h.def.nameColor?h.def.nameColor:'#c8d8cc';
    g.fillText(h.name+' '+IB.M.round(h.hp)+'%',sx,88);sx+=72;
  }
  /* репліки групи */
  if(C.bubT===undefined){C.bubT=2.5;C.bub=null;}
  C.bubT-=dt;
  if(C.bubT<=0){
    C.bubT=3.5+IB.rnd(0,3);
    const L=isSea?['Далі, за буями!','Ой, бриз!','Море кличе!','Красота!','Дельфіни праворуч!','Тричі «гей»!','Чайка близько!','Дихай морем…']
                 :['Куди їдемо?','Ой, ями!','Місто гуде!','Красота!','Шаурму б тут…','Тричі «гей»!','Ще зупинка!','Дихай, дихай…'];
    C.bub={i:IB.ri(0,4),t:2.4,txt:L[IB.ri(0,L.length-1)]};
  }
  if(C.bub){C.bub.t-=dt;if(C.bub.t<=0)C.bub=null;}
  if(C.bub){
    g.font='7px monospace';
    const w=C.bub.txt.length*4.4+10;
    g.fillStyle='rgba(250,248,238,0.94)';g.fillRect(240-w/2,120,w,11);
    g.fillStyle='#241a10';g.fillText(C.bub.txt,240-w/2+5,129);
  }
  g.fillStyle='rgba(6,12,10,0.78)';g.fillRect(110,306,260,22);
  g.font='9px monospace';g.fillStyle='#f0d050';
  g.fillText(isSea?'E / КЛІК — ГРЕБОК ВПЕРЕД • ESC — ПРИЧАЛИТИ':'E / КЛІК — КРОК МАРШРУТУ • ESC — ВИЙТИ',118,320);
  g.restore();
};
IB.TRAVEL_CUR=null;

IB._ascTrail=[[288,268],[196,256],[296,244],[204,232],[282,218],[208,204],[270,190],[214,176],[256,162],[222,148],[250,134],[232,120],[246,106],[240,98]];
IB._ascTrailTot=(()=>{
  let t=0;
  for(let i=1;i<IB._ascTrail.length;i++)
    t+=IB.dist(IB._ascTrail[i-1][0],IB._ascTrail[i-1][1],IB._ascTrail[i][0],IB._ascTrail[i][1]);
  return t;
})();
IB._ascPos=(s)=>{
  s=IB.clamp(s,0,1);
  const d=s*IB._ascTrailTot;let acc=0;
  for(let i=1;i<IB._ascTrail.length;i++){
    const a=IB._ascTrail[i-1],b=IB._ascTrail[i];
    const seg=IB.dist(a[0],a[1],b[0],b[1]);
    if(acc+seg>=d){
      const t2=IB.clamp((d-acc)/IB.M.max(1,seg),0,1),dx=b[0]-a[0];
      return {x:IB.lerp(a[0],b[0],t2),y:IB.lerp(a[1],b[1],t2),
        dir:dx>6?'r':(dx<-6?'l':(b[1]<a[1]?'u':'d'))};
    }
    acc+=seg;
  }
  const e=IB._ascTrail[IB._ascTrail.length-1];
  return {x:e[0],y:e[1],dir:'u'};
};
IB._ascCloud=(g,x,y,sc,al)=>{
  g.fillStyle='rgba(240,246,252,'+al+')';
  g.beginPath();g.ellipse(x,y,26*sc,9*sc,0,0,7);g.fill();
  g.beginPath();g.ellipse(x+15*sc,y-6*sc,17*sc,8*sc,0,0,7);g.fill();
  g.beginPath();g.ellipse(x-17*sc,y-4*sc,14*sc,7*sc,0,0,7);g.fill();
  g.beginPath();g.ellipse(x-2*sc,y-10*sc,12*sc,6*sc,0,0,7);g.fill();
};
IB._ascPine=(g,x,y,sc,c)=>{
  IB.P(g,x-1.5*sc,y-8*sc,3*sc,9*sc,'#3a2c18');
  IB.PA(g,[[x,y-20*sc],[x-6*sc,y-7*sc],[x+6*sc,y-7*sc]],c||'#1e4228');
  IB.PA(g,[[x,y-26*sc],[x-4.5*sc,y-13*sc],[x+4.5*sc,y-13*sc]],c||'#265232');
};
/* далека ізо-вершина зі сніжною шапкою */
IB._bgPeak=(g,ax,ay,bw,hgt,c1,c2)=>{
  IB.PA(g,[[ax,ay],[ax-bw,ay+hgt],[ax,ay+hgt]],c1);
  IB.PA(g,[[ax,ay],[ax,ay+hgt],[ax+bw,ay+hgt]],c2);
  IB.PA(g,[[ax,ay],[ax-bw*0.26,ay+hgt*0.26],[ax,ay+hgt*0.26]],'#e8f0f4');
  IB.PA(g,[[ax,ay],[ax,ay+hgt*0.26],[ax+bw*0.26,ay+hgt*0.26]],'#f0f6f8');
};
/* ГОРА — піраміда з терасами за висотою: сніг / скелі / полонина / ліс */
IB._ascMtn=(g,ax,ay,bw,hgt)=>{
  const bands=[[0,0.22,'#eef4f8','#dce8f0'],[0.22,0.42,'#88928c','#58605a'],
               [0.42,0.62,'#6a8448','#4c6232'],[0.62,1.02,'#2e5230','#1e4228']];
  for(const b of bands){
    const y1=ay+hgt*b[0],y2=ay+hgt*b[1];
    IB.PA(g,[[ax-bw*b[0],y1],[ax,y1],[ax,y2],[ax-bw*b[1],y2]],b[2]);
    IB.PA(g,[[ax,y1],[ax+bw*b[0],y1],[ax+bw*b[1],y2],[ax,y2]],b[3]);
  }
  /* піедмонт — темне лісове підніжжя (третя грань) */
  IB.PA(g,[[ax-bw,ay+hgt],[ax,ay+hgt+hgt*0.32],[ax+bw,ay+hgt]],'#16281a');
  /* фактура: сніг блищить, осип — каміння, полонина — квіти, ліс — хвоїнки */
  for(let i=0;i<110;i++){
    const t=0.03+IB.hsh(i,1,950)*0.97,y=ay+t*hgt;
    const side=IB.hsh(i,2,951)<0.5?-1:1;
    const lim=IB.M.max(8,bw*IB.M.min(t,1)-10);
    const x=ax+side*(6+IB.hsh(i,3,952)*lim);
    let c;
    if(t<0.22)c=IB.hsh(i,4,953)<0.5?'#ffffff':'#c8d8e4';
    else if(t<0.42)c=IB.hsh(i,4,953)<0.5?'#4e5a54':'#7a847e';
    else if(t<0.62)c=['#f0d050','#e86a8a','#9a70d0','#7e9454'][i&3];
    else c=IB.hsh(i,4,953)<0.6?'#16321e':'#3a5a30';
    g.fillStyle=c;g.fillRect(x|0,y|0,1.6,1.6);
  }
};
IB.drawAscent=(g,dt)=>{
  const C=IB.TRAVEL_CUR;if(!C)return;
  /* v11: сцена 480×336 центрується на канві будь-якого розміру (без чорних полос) */
  const _w=VW(),_h=VH();
  g.save();g.fillStyle='#0e1620';g.fillRect(0,0,_w,_h);
  g.translate(IB.M.round((_w-480)/2),IB.M.round((_h-336)/2));
  g.beginPath();g.rect(0,0,480,336);g.clip();
  const r=C.route;
  const stages=IB.ASC_STAGES[r.kind]||IB.ASC_STAGES.peak;
  const st=IB.M.min(stages.length-1,IB.M.floor(C.prog/100*stages.length));
  const wx=IB.G.wx.type,nf=IB.nightFactor(),gh=IB.goldenHour();
  const T=performance.now()*0.001;
  /* ---------- НЕБО ---------- */
  const sky=g.createLinearGradient(0,0,0,336);
  if(nf>0.5){sky.addColorStop(0,'#0a1226');sky.addColorStop(1,'#182338');}
  else if(wx==='sun'){sky.addColorStop(0,'#28598c');sky.addColorStop(1,gh>0.4?'#e8c8a0':'#a8c4d8');}
  else if(wx==='snow'||wx==='blizzard'){sky.addColorStop(0,'#8aa4b8');sky.addColorStop(1,'#d8e4ee');}
  else if(wx==='rain'||wx==='storm'){sky.addColorStop(0,'#3a4452');sky.addColorStop(1,'#7a8a98');}
  else {sky.addColorStop(0,'#5a7a94');sky.addColorStop(1,'#b8c8d4');}
  g.fillStyle=sky;g.fillRect(0,0,480,336);
  if(nf>0.5)for(let i=0;i<42;i++){
    const sx=IB.hsh(i,1,940)*480,sy=IB.hsh(i,2,941)*150;
    g.fillStyle='rgba(215,228,255,'+(0.35+0.45*IB.hsh(i,3,942))*(0.55+0.45*IB.M.sin(T*2+i))+')';
    g.fillRect(sx,sy,1.4,1.4);
  }
  /* сонце / місяць */
  g.fillStyle=nf>0.5?'#e8e8d8':(gh>0.4?'#f8c070':'#f8e8a0');
  g.beginPath();g.arc(398,62,11,0,7);g.fill();
  if(nf<=0.5){g.fillStyle='rgba(248,232,160,0.16)';g.beginPath();g.arc(398,62,20,0,7);g.fill();}
  /* птахи у небі */
  g.strokeStyle='rgba(30,40,50,0.5)';g.lineWidth=1.3;
  for(let i=0;i<3;i++){
    const bx=(T*24+i*150)%540-30,by=66+i*20+IB.M.sin(T*1.6+i*2)*5;
    const w2=IB.M.sin(T*7+i*2)*2.5;
    g.beginPath();g.moveTo(bx-4,by+w2);g.lineTo(bx,by);g.lineTo(bx+4,by+w2);g.stroke();
  }
  if(r.kind==='expedition'){IB._ascExpedition(g,C,st,T,nf);}
  else{
    /* ---------- ХМАРИ ЗА ВЕРШИНАМИ ---------- */
    for(let i=0;i<4;i++){
      const cx=((i*150+T*9)%620)-70,cy=96+IB.hsh(i,4,943)*58;
      IB._ascCloud(g,cx,cy,0.8+i*0.15,0.75);
    }
    /* ---------- ІЗО-ВЕРШИНИ-СУСІДИ ---------- */
    const pc1=nf>0.5?'#16283e':'#3a5a6c',pc2=nf>0.5?'#1e3450':'#4a7280';
    IB._bgPeak(g,60,196,56,52,pc1,pc2);
    IB._bgPeak(g,428,186,52,58,pc1,pc2);
    IB._bgPeak(g,118,224,34,28,pc1,pc2);
    /* ---------- ГОРА ---------- */
    IB._ascMtn(g,240,88,174,152);
    /* смереки підніжжям (за стежкою) */
    for(let i=0;i<11;i++){
      const px=74+i*34+IB.hsh(i,5,944)*16,py=252+IB.hsh(i,6,945)*30;
      if(IB.dist(px,py,288,268)>26)IB._ascPine(g,px,py,0.9+IB.hsh(i,7,946)*0.7);
    }
    /* ---------- МОРЕ ХМАР ПІД ВЕРШИНОЮ (з ~62% підйому) ---------- */
    if(C.prog>62){
      for(let i=0;i<12;i++){
        const cx=((i*46+T*11)%640)-80;
        g.fillStyle='rgba(236,244,250,0.55)';
        g.beginPath();g.ellipse(cx,160+IB.M.sin(i*1.7)*8,40,9,0,0,7);g.fill();
        g.beginPath();g.ellipse(cx+20,152+IB.M.sin(i*1.3)*6,24,7,0,0,7);g.fill();
      }
    }
    /* ---------- СТЕЖКА-СЕРПАНТИН ---------- */
    g.lineCap='round';g.lineJoin='round';
    g.beginPath();g.moveTo(IB._ascTrail[0][0],IB._ascTrail[0][1]);
    for(let i=1;i<IB._ascTrail.length;i++)g.lineTo(IB._ascTrail[i][0],IB._ascTrail[i][1]);
    g.globalAlpha=0.9;
    g.strokeStyle='#241a10';g.lineWidth=7;g.stroke();
    g.strokeStyle='#8a6a42';g.lineWidth=4;g.stroke();
    g.setLineDash([4,8]);g.strokeStyle='#a87848';g.lineWidth=1.6;g.stroke();g.setLineDash([]);
    g.globalAlpha=1;
    /* ---------- ФІНІШ СТЕЖКИ: ПРАПОРЕЦЬ+ТУР / ОЗЕРО / СТЕЛА ---------- */
    if(r.kind==='lake'){
      g.fillStyle='#28565f';g.beginPath();g.ellipse(240,90,46,13,0,0,7);g.fill();
      g.fillStyle='#3a6c74';g.beginPath();g.ellipse(240,88,34,8,0,0,7);g.fill();
      g.fillStyle='rgba(170,225,240,0.6)';g.fillRect(216,86,14,1.5);g.fillRect(240,90,18,1.5);
      for(let i=0;i<7;i++){const a=i/7*6.28;
        g.fillStyle='#58605a';g.beginPath();g.ellipse(240+IB.M.cos(a)*48,90+IB.M.sin(a)*13,4,2.4,0,0,7);g.fill();}
    }else if(r.kind==='border'){
      IB.isoBox(g,228,84,26,12,5,'#88928c','#58605a','#6e7872');
      IB.P(g,234,58,12,30,'#e8e8e2');
      IB.P(g,234,58,12,5,'#b82840');IB.P(g,234,74,12,6,'#2a3e5c');
    }else{
      IB.isoBox(g,233,96,14,7,4,'#58605a','#4e5a54','#6e7872'); /* тур з каміння */
      IB.P(g,239,80,2,17,'#5e4628');
    }
    /* ---------- ГРУПА ЙДЕ І ШТУРМУЄ (анімація кроків, ланцюжок) ---------- */
    if(C.bubT===undefined){C.bubT=2.5;C.bub=null;}
    C.bubT-=dt;
    if(C.bubT<=0){
      C.bubT=3.5+IB.rnd(0,3);
      const L=['Далі, хлопці!','Ой, вітєр!','Гора кличе!','Красота!','Смалина б тут…','Тричі «гей»!','Ще ривок!','Дихай, дихай…'];
      C.bub={i:IB.ri(0,4),t:2.4,txt:L[IB.ri(0,L.length-1)]};
    }
    if(C.bub){C.bub.t-=dt;if(C.bub.t<=0)C.bub=null;}
    const mem=[];
    for(let i=0;i<5;i++){
      const s=C.prog/100-i*0.05;
      mem.push({i:i,p:IB._ascPos(s)});
    }
    mem.sort((a,b)=>a.p.y-b.p.y);
    for(const m of mem){
      const h=IB.E.team[m.i];if(!h)continue;
      const fr=1+(IB.M.floor(T*6+m.i*0.8)&1);
      const sc=IB.lerp(0.68,0.95,IB.clamp((m.p.y-98)/180,0,1));
      IB.drawPerson(g,m.p.x,m.p.y,m.p.dir,fr,h.look,sc);
      if(C.bub&&C.bub.i===m.i){
        g.font='7px monospace';
        const w=C.bub.txt.length*4.4+10;
        g.fillStyle='rgba(250,248,238,0.94)';g.fillRect(m.p.x-w/2,m.p.y-30*sc-9,w,11);
        g.fillStyle='#241a10';g.fillText(C.bub.txt,m.p.x-w/2+5,m.p.y-30*sc);
      }
    }
    /* прапорець махає з вершини */
    if(r.kind==='peak'){
      const fw=IB.M.sin(T*3)*2.5;
      IB.PA(g,[[241,80],[251+fw,83],[241,87]],'#c83828');
    }
    /* пориви вітру на полонині (етап 3+) */
    if(st>=2&&nf<=0.5){
      g.strokeStyle='rgba(255,255,255,0.28)';g.lineWidth=1.4;
      for(let i=0;i<3;i++){
        const wy=186+i*9,wx2=((T*(46+i*14)+i*260)%600)-60;
        g.beginPath();g.moveTo(wx2,wy);g.quadraticCurveTo(wx2+30,wy-4,wx2+64,wy);g.stroke();
      }
    }
    /* ambient-сніжок на сніжниках (етап 5+) */
    if(r.kind==='peak'&&st>=4){
      g.fillStyle='rgba(240,248,255,0.8)';
      for(let i=0;i<26;i++){
        const xx=(IB.hsh(i,1,922)*480+T*14)%480,yy=(IB.hsh(i,2,923)*336+T*26)%336;
        g.fillRect(xx,yy,1.6,1.6);
      }
    }
  }
  /* ---------- погода-частинки ---------- */
  if(wx==='rain'||wx==='hail'){g.strokeStyle='rgba(160,200,230,0.5)';g.beginPath();
    for(let i=0;i<40;i++){const xx=IB.hsh(i,1,920)*480,yy=(IB.hsh(i,2,921)*336+performance.now()*0.25*(wx==='hail'?1.6:1))%336;
      g.moveTo(xx,yy);g.lineTo(xx-2,yy+8);}g.stroke();}
  if(wx==='snow'||wx==='blizzard'){g.fillStyle='rgba(240,248,255,0.8)';
    for(let i=0;i<60;i++){const xx=(IB.hsh(i,1,922)*480+performance.now()*0.02)%480,yy=(IB.hsh(i,2,923)*336+performance.now()*0.05)%336;
      g.fillRect(xx,yy,2,2);}}
  /* ---------- ХМАРИ ПЕРЕД КАМЕРОЮ (паралакс) ---------- */
  for(let i=0;i<4;i++){
    const cx=((i*170+T*17)%640)-80,cy=246+IB.hsh(i,8,947)*44;
    IB._ascCloud(g,cx,cy,1.25,0.42);
  }
  /* золота година + темрява */
  if(gh>0.2&&nf<0.5){g.fillStyle='rgba(248,180,90,'+(gh*0.13)+')';g.fillRect(0,0,480,336);}
  if(nf>0.1){g.fillStyle='rgba(10,16,30,'+(nf*0.45)+')';g.fillRect(0,0,480,336);}
  /* ---------- HUD СХОДЖЕННЯ ---------- */
  g.fillStyle='rgba(6,12,10,0.78)';g.fillRect(6,6,468,34);
  g.font='9px monospace';g.fillStyle='#f0d050';g.fillText(r.name,12,20);
  g.fillStyle='#c8d8cc';g.font='7px monospace';
  g.fillText('ЗРАЗУ: '+r.from+' • СКЛАДНІСТЬ '+r.diff+' • '+r.hours+' ГОД',12,33);
  /* стадія */
  g.fillStyle='rgba(6,12,10,0.78)';g.fillRect(6,44,468,16);
  g.font='8px monospace';g.fillStyle='#7ccc8e';
  g.fillText('ЕТАП '+(st+1)+'/'+stages.length+': '+stages[st],12,56);
  /* бар прогресу */
  g.fillStyle='#1a241c';g.fillRect(6,64,468,10);
  g.fillStyle='#5cb878';g.fillRect(6,64,468*C.prog/100,10);
  g.font='7px monospace';g.fillStyle='#e8f0e8';
  g.fillText('ВИСОТА: '+IB.M.round((r.alt||600)*C.prog/100+((r.alt||600)>800?380:120))+' М',12,72);
  /* статус групи компактно */
  g.font='7px monospace';
  let sx=12;
  for(const h of IB.E.team){
    g.fillStyle=h.def&&h.def.nameColor?h.def.nameColor:'#c8d8cc';
    g.fillText(h.name+' '+IB.M.round(h.hp)+'%',sx,88);sx+=72;
  }
  /* підказка */
  g.fillStyle='rgba(6,12,10,0.78)';g.fillRect(120,306,240,22);
  g.font='9px monospace';g.fillStyle='#f0d050';
  g.fillText('E / КЛІК — КРОК УГОРУ • ESC — НАЗАД',130,320);
  g.restore();
};
/* експедиція: ізо-траса, ван трясеться, стовпи, пил, пляж Світязя */
IB._ascExpedition=(g,C,st,T,nf)=>{
  /* земля: поля → залісіння → пісок і море */
  if(st>=3){
    g.fillStyle=nf>0.5?'#2a2418':'#c8b888';g.fillRect(0,150,480,186);
    g.fillStyle='#28565f';g.fillRect(0,296,480,40);
    g.fillStyle='rgba(170,225,240,0.5)';
    for(let i=0;i<8;i++)g.fillRect((i*61+T*12)%480,302+i%4*8,16,1.5);
    for(let i=0;i<6;i++)IB._ascPine(g,24+i*86,158+IB.hsh(i,5,962)*12,0.8+IB.hsh(i,6,963)*0.5,'#1e4228');
  }else{
    g.fillStyle=nf>0.5?'#16281a':(st>=2?'#2e5230':'#3a5a30');g.fillRect(0,150,480,186);
    for(let i=0;i<(st>=2?14:9);i++){
      const px=14+i*36+IB.hsh(i,5,960)*14,py=158+IB.hsh(i,6,961)*26;
      IB._ascPine(g,px,py,0.8+IB.hsh(i,7,961)*0.7);
    }
  }
  /* ізо-траса */
  IB.PA(g,[[0,224],[480,212],[480,252],[0,264]],'#5e4a30');
  IB.PA(g,[[0,230],[480,218],[480,226],[0,238]],'#6e5a3a');
  g.strokeStyle='#c8b888';g.lineWidth=2;g.setLineDash([10,12]);
  g.beginPath();g.moveTo(0,250);g.lineTo(480,238);g.stroke();g.setLineDash([]);
  /* стовпи з провісами */
  g.strokeStyle='#3a2c18';g.lineWidth=2;
  for(let i=0;i<6;i++){
    const px=44+i*88,py=196+IB.hsh(i,9,964)*4;
    IB.P(g,px-1,py-26,2,26,'#3a2c18');IB.P(g,px-6,py-24,12,2,'#3a2c18');
  }
  g.strokeStyle='rgba(40,40,40,0.4)';g.lineWidth=1;g.beginPath();
  for(let i=0;i<5;i++){
    const x1=44+i*88,x2=44+(i+1)*88,y1=172+IB.hsh(i,9,964)*4,y2=172+IB.hsh(i+1,9,964)*4;
    g.moveTo(x1,y1);g.quadraticCurveTo((x1+x2)/2,IB.M.min(y1,y2)-12,x2,y2);
  }
  g.stroke();
  /* БІЛИЙ ВАН — трясеться на волинських вибоїнах */
  const vx=IB.lerp(24,418,C.prog/100),bob=IB.M.sin(T*11)*1.3,vy=198+bob;
  IB.isoBox(g,vx,vy,56,24,14,'#eceae2','#b8b8b0','#d0cec6');
  IB.P(g,vx+6,vy+16,44,10,'#c8c4ba');
  IB.P(g,vx+8,vy+17,11,7,'#2a3e5c');IB.P(g,vx+23,vy+17,10,7,'#8ac4d8');IB.P(g,vx+36,vy+17,10,7,'#8ac4d8');
  IB.P(g,vx+9,vy+35,11,6,'#1a1a1a');IB.P(g,vx+36,vy+35,11,6,'#1a1a1a');
  /* пил з-під коліс */
  for(let i=0;i<3;i++){
    g.fillStyle='rgba(180,160,120,'+(0.3-i*0.09)+')';
    g.beginPath();g.ellipse(vx-12-i*13,236-i*4,7-i*2,4-i,0,0,7);g.fill();
  }
  /* бризки на пляжі */
  if(st>=3)for(let i=0;i<4;i++){
    g.fillStyle='rgba(220,245,250,0.5)';
    g.beginPath();g.ellipse(60+i*120,298+IB.M.sin(T*4+i)*3,5,2,0,0,7);g.fill();
  }
};

/* ==================== v1.2: ІНТЕР'ЄРИ ==================== *//* ==================== v1.2: ІНТЕР'ЄРИ ==================== */
IB.INT_CUR=null;
IB.INT_DEFS={
  house:{w:11,h:7,title:'ХАТА',owner:'ГОСПОДАР',
    items:[{k:'pech',x:2,y:1,label:'ПІЧ'},{k:'table',x:6,y:2,label:'СТІЛ'},{k:'host',x:8,y:4,label:'ГОСПОДАР'},{k:'bed',x:3,y:4,label:'ЛИЖКО'},{k:'radio',x:9,y:1,label:'РАДІО 103.2 FM — НОВИНИ'}]},
  church:{w:13,h:8,title:'ЦЕРКВА',owner:'ОТЕЦЬ ПАВЛО',
    items:[{k:'pray',x:5,y:1,label:'СВІЧКИ'},{k:'icons',x:9,y:1,label:'ІКОНОСТАС'},{k:'priest',x:7,y:4,label:'ОТЕЦЬ ПАВЛО'}]},
  shop:{w:12,h:7,title:'КРАМНИЦЯ',owner:'ПРОДАВЧИНЯ',
    items:[{k:'counter',x:5,y:2,label:'ПРИЛАВОК — ТОРГ'},{k:'host',x:8,y:4,label:'ПРОДАВЧИНЯ'},{k:'shelf',x:2,y:1,label:'ПОЛИЦІ'}]},
  bar:{w:13,h:8,title:'КОРЧМА',owner:'БАРМЕН',
    items:[{k:'barkeep',x:6,y:1,label:'БАРНА СТІЙКА — КУПИТИ (юшка ₴65, пиво ₴35)'},{k:'table',x:3,y:4,label:'СТОЛИК'},{k:'guitar',x:10,y:3,label:'БАНДУРА — співати (настрій +10)'},{k:'host',x:8,y:5,label:'ЛІКАРНІ ГОСТІ — розмова'}]},
  forge:{w:12,h:7,title:'КОВАЛЬНЯ',owner:'КОВАЛЬ',
    items:[{k:'anvil',x:5,y:2,label:'ГІРН — ТОРГ'},{k:'host',x:8,y:4,label:'КОВАЛЬ'},{k:'fire',x:2,y:1,label:'ГОРН'}]},
  farm:{w:12,h:7,title:'САДИБА',owner:'ГОСПОДИНЯ',
    items:[{k:'farmw',x:6,y:2,label:'ГОСПОДИНЯ — ТОРГ'},{k:'pech',x:2,y:1,label:'ПІЧ'},{k:'table',x:9,y:4,label:'СТІЛ'}]},
  border:{w:9,h:6,title:'ПРИКОРДОННИЙ КПП',owner:'ПОГРАНИЧНИК',
    items:[{k:'guard',x:4,y:2,label:'ПОГРАНИЧНИК'},{k:'stella',x:7,y:3,label:'СТЕЛА — ФОТО'}]},
  /* v1.4: старі хати-курени і сільські ларьки — нові типи з активами v5 */
  hut:{w:9,h:6,title:'КУРІНЬ',
    items:[{k:'pech',x:2,y:1,label:'ПІЧ'},{k:'table',x:5,y:2,label:'СТІЛ'},{k:'bed',x:7,y:4,label:'ЛИЖКО'}]},
  kiosk:{w:7,h:5,title:'СІЛЬСЬКИЙ ЛАРЬОК',owner:'ПРОДАВЧИНЯ',
    items:[{k:'counter',x:3,y:2,label:'ПРИЛАВОК — ТОРГ'},{k:'host',x:5,y:3,label:'ПРОДАВЧИНЯ'},{k:'shelf',x:1,y:1,label:'ПОЛИЦІ'}]},
  /* v25.0b: дачі і гаражі сіл — живі двері (були «мертві») */
  dacha:{w:9,h:6,title:'ДАЧА',owner:'ГОСПОДАР',
    items:[{k:'pech',x:2,y:1,label:'ПІЧ'},{k:'table',x:5,y:2,label:'СТІЛ'},{k:'bed',x:7,y:4,label:'ЛИЖКО'},{k:'host',x:3,y:4,label:'ГОСПОДАР'}]},
  garage:{w:9,h:6,title:'ГАРАЖ',owner:'МЕХАНІК',
    items:[{k:'shelf',x:2,y:1,label:'СТЕЛЯЖ — ІНСТРУМЕНТ'},{k:'host',x:6,y:3,label:'МЕХАНІК'},{k:'fire',x:1,y:4,label:'ЗВАРКА'}]},
  /* ===== v25.0: ІНТЕР'ЄРИ, ЯКИХ НЕ БУЛО (двері були «мертві») ===== */
  library:{w:10,h:6,title:'БІБЛІОТЕКА ім. ФРАНКА',owner:'БІБЛІОТЕКАР',
    items:[{k:'shelf',x:3,y:1,label:'СТЕЛЯЖ — КНИГИ МОРЯ'},{k:'host',x:6,y:3,label:'БІБЛІОТЕКАР'},{k:'table',x:8,y:4,label:'ЧИТАЛЬНИЙ ЗАЛ'}]},
  police:{w:10,h:6,title:'ВІДДІЛ ПОЛІЦІЇ',owner:'ДЕТЕКТИВ ГАЛАГАН',
    items:[{k:'recep',x:3,y:2,label:'ЧЕРГОВИЙ — ЗАЯВИ'},{k:'host',x:6,y:4,label:'ДЕТЕКТИВ ГАЛАГАН'},{k:'board',x:8,y:1,label:'ДОШКА РОЗШУКУ'}]},
  cranehall:{w:11,h:6,title:'КРАНОВИЙ ЦЕХ №2',owner:'КРАНІВЩИК',
    items:[{k:'board',x:3,y:1,label:'ПЛАН КРАНОВИХ РОБІТ'},{k:'host',x:7,y:3,label:'КРАНІВЩИК'},{k:'exhibit',x:10,y:2,label:'ВЕЛИКИЙ КРАН — ФОТО'}]},
  terminal:{w:12,h:7,title:'ВАНТАЖНИЙ ТЕРМІНАЛ «ПАЛЛАДА-ТРАНЗИТ»',owner:'ДИСПЕТЧЕР',
    items:[{k:'board',x:4,y:1,label:'ГРАФІК КОНТЕЙНЕРНИХ ПОЇЗДІВ'},{k:'host',x:8,y:3,label:'ДИСПЕТЧЕР'},{k:'shelf',x:2,y:3,label:'ПАКГАУЗ — ТАРА'}]},
  /* ============ i3: ІНТЕР'ЄРИ ЧОРНОМОРСЬКА ============ */
  realtor:{w:12,h:7,title:'РІЕЛТОР «БІЛЯ МОРЕ»',owner:'АГЕНТКА ВІРА',
    items:[{k:'board',x:5,y:2,label:'ДОШКА ОГОЛОШЕНЬ — КВАРТИРИ'},{k:'host',x:8,y:4,label:'ВІРА'},{k:'table',x:2,y:4,label:'СТІЛ'}]},
  cine:{w:13,h:9,title:'КІНОТЕАТР «МОРЕ-ФІЛЬМ»',
    items:[{k:'screen',x:6,y:1,label:'ЕКРАН — КВИТКИ'},{k:'rows',x:6,y:4,label:'КРІСЛА ЗАЛУ'},{k:'lunch',x:2,y:6,label:'БУФЕТ'}]},
  museum:{w:13,h:8,title:'МУЗЕЙ ПОРТУ І МОРЕ',owner:'ЕКСКУРСОВІД',
    items:[{k:'exhibit',x:3,y:2,label:'КОРАБЕЛЬ У ПЛЯШЦІ'},{k:'exhibit',x:7,y:1,label:'КАРТА МОРЯ 1893'},{k:'exhibit',x:10,y:3,label:'ЩОДЕННИКИ ЛОЦМАНА'},{k:'host',x:6,y:5,label:'ЕКСКУРСОВІД'}]},
  idalnya:{w:12,h:7,title:'ЇДАЛЬНЯ «ХВИЛЯ»',
    items:[{k:'lunch',x:5,y:2,label:'РОЗДАЧА — КОМПЛЕКС'},{k:'table',x:3,y:5,label:'СТОЛИК'},{k:'table',x:8,y:5,label:'СТОЛИК'}]},
  gym:{w:11,h:7,title:'КАЧАЛКА «АТЛЕТ»',
    items:[{k:'weights',x:4,y:2,label:'ШТАНГА'},{k:'weights',x:8,y:2,label:'ВЕЛОТРЕНАЖЕР'},{k:'table',x:2,y:5,label:'КУЛЄР'}]},
  hotel:{w:12,h:7,title:'ГОТЕЛЬ «ЧОРНОМОРЕЦЬ»',owner:'АДМІНІСТРАТОР',
    items:[{k:'recep',x:5,y:2,label:'РЕСЕПШН — НОМЕР/СНІДАНОК'},{k:'host',x:8,y:3,label:'АДМІНІСТРАТОР'},{k:'table',x:3,y:5,label:'СТОЛИК ЛОБІ'},{k:'radio',x:1,y:1,label:'РАДІО 103.2 FM — НОВИНИ'}]},
  port:{w:12,h:7,title:'МОРЕВАКЗАЛ',owner:'КАСИР',
    items:[{k:'recep',x:4,y:2,label:'КАСА — ПОРОМИ/ЗМІНА'},{k:'board',x:8,y:2,label:'РОЗКЛАД ПОРОМІВ'},{k:'rows',x:4,y:5,label:'ЗАЛ ОЧІКУВАННЯ'}]},
  yacht:{w:10,h:6,title:'ЯХТ-КЛУБ «ВІТЕР»',owner:'КАПІТАН',
    items:[{k:'recep',x:4,y:2,label:'КАПІТАН — ЧОВНИ/РИБАЛКА'},{k:'exhibit',x:7,y:3,label:'КУБКИ РИБАЛКІВ'}]},
  /* v25.0: РИНОК — покупки зрозумілі: прилавки з цінами + продавці-хости */
  market:{w:13,h:8,title:'ПРИМОРСЬКИЙ РИНОК',owner:'РЯДКИ',
    items:[{k:'counter',x:4,y:2,label:'ТОРГОВІ РЯДИ — КУПИТИ (вода ₴28, кавун ₴35)'},
      {k:'counter',x:9,y:1,label:'БАХЧА — КАВУНИ І ДИНІ — КУПИТИ'},
      {k:'host',x:2,y:3,label:'БАБУСЯ З АРБУЗАМИ — купити / поговорити'},
      {k:'host',x:11,y:4,label:'РЯДКИ — риба/сувеніри — купити / продати'},
      {k:'shelf',x:7,y:5,label:'ЛАВКИ З ПРОВІЗІЄЮ — КУПИТИ'}]},
  hotdog:{w:7,h:5,title:'ХОТ-ДОГ',owner:'ПРОДАВЕЦЬ',
    items:[{k:'counter',x:3,y:2,label:'ВІКНО — КУПИТИ (хот-дог ₴45, шаурма ₴75)'},{k:'host',x:5,y:3,label:'ПРОДАВЕЦЬ — купити / поговорити'}]},
  voda:{w:7,h:5,title:'КІОСК',owner:'ПРОДАВЧИНЯ',
    items:[{k:'counter',x:3,y:2,label:'ВІКНО — КУПИТИ (вода ₴30, сік, лимонад, морозиво, КРЕМ ₴90)'},{k:'host',x:5,y:3,label:'ПРОДАВЧИНЯ — купити / поговорити'}]},
  cafe:{w:12,h:7,title:'КАФЕ',owner:'БАРМЕН',
    items:[{k:'counter',x:5,y:2,label:'БАРНА СТІЙКА — КАФЕ'},{k:'table',x:3,y:4,label:'СТОЛИК'},{k:'guitar',x:9,y:3,label:'СЦЕНА ЕДІКА'}]},
  vokzal:{w:12,h:7,title:'ВОКЗАЛ «ЧОРНОМОРСЬК»',
    items:[{k:'board',x:6,y:1,label:'РОЗКЛАД'},{k:'recep',x:3,y:2,label:'КАСИ'},{k:'host',x:8,y:4,label:'ЧЕРГОВИЙ'}]},
  bronx:{w:13,h:8,title:'БРОНКС — ВАШ ДІМ',
    items:[{k:'bed',x:3,y:4,label:'ВЕЛИКЕ ЛІЖКО'},{k:'table',x:7,y:2,label:'КУХНЯ'},{k:'shelf',x:10,y:2,label:'СКРИНЬКА'},{k:'guitar',x:10,y:5,label:'ПАТІО'},{k:'radio',x:1,y:6,label:'РАДІО 103.2 FM — НОВИНИ'}]},
  panel5:{w:11,h:7,title:'ВАША КВАРТИРА (2-Й ПОВЕРХ)',
    items:[{k:'bed',x:3,y:3,label:'РОЗКЛАДНАХ'},{k:'table',x:6,y:2,label:'КУХНЯ'},{k:'shelf',x:9,y:2,label:'СКРИНЬКА'},{k:'window',x:8,y:4,label:'ВИД НА МОРЕ'},{k:'radio',x:1,y:5,label:'РАДІО 103.2 FM — НОВИНИ'}]},
  hostel:{w:9,h:6,title:'ХОСТЕЛ «ХВИЛЬКА» — КІМНАТА',
    items:[{k:'bed',x:2,y:2,label:'ЛІЖКО'},{k:'bed',x:5,y:2,label:'ЛІЖКО №2'},{k:'table',x:3,y:4,label:'СТІЛ'},{k:'radio',x:7,y:1,label:'РАДІО 103.2 FM — НОВИНИ'}]},
  /* ===== v24.0: КВАРТИРА (контейнер apt, 9 пов.) — БАЗА П'ЯТІРКИ ===== */
  panel9:{w:12,h:7,title:'НАША КВАРТИРА (9-ПОВ.) — БАЗА',
    items:[{k:'bed',x:3,y:3,label:'РОЗКЛАДНИК — СОН/ЗАРЯДКА ВСІХ'},{k:'table',x:6,y:2,label:'КУХНЯ — ЇЖА/ГОТУВАННЯ/СКЛАД'},
      {k:'shelf',x:9,y:2,label:'СКРИНЬКА — СКЛАД БАЗИ'},{k:'window',x:8,y:4,label:'ВИД НА МОРЕ'},
      {k:'guitar',x:2,y:5,label:'ГОСТИНА — ГУЛЯНКА'},{k:'radio',x:1,y:1,label:'РАДІО 103.2 FM — НОВИНИ'}]},
  /* ============ v2.0 «РАЙОНИ І ЛЮДИ»: інтер'єри нових будівель ============ */
  post:{w:11,h:6,title:'УКРПОШТА 68000',owner:'ЛИСТОНОША ЮРА',
    items:[{k:'counter',x:4,y:2,label:'ВІКНО — ЛИСТИ/КОМУНАЛЬНІ'},{k:'host',x:7,y:4,label:'ЮРА — ЛИСТОНОША'},{k:'shelf',x:2,y:1,label:'ПАКИ ЛИСТІВ'}]},
  gallery:{w:13,h:8,title:'МУЗЕЙ ім. О. БІЛОГО',owner:'ЕКСКУРСОВІД',
    items:[{k:'exhibit',x:3,y:2,label:'КАРТИНА «МОРЕ ЗВІЧНЕ»'},{k:'exhibit',x:6,y:1,label:'КАРТИНА «ПРИМОРСЬКІ СХОДИ»'},{k:'exhibit',x:9,y:2,label:'КАРТИНА «ПОРТ У ПОХМУ»'},{k:'host',x:6,y:5,label:'ЕКСКУРСОВІД'}]},
  cityhall:{w:12,h:7,title:'МІСЬКА РАДА ЧОРНОМОРСЬКА',owner:'СЕКРЕТАР',
    items:[{k:'board',x:5,y:2,label:'СТЕНД — ПЛАН РАЙОНІВ'},{k:'host',x:8,y:4,label:'СЕКРЕТАР'},{k:'stella',x:3,y:3,label:'ГЕРБ МІСТА (МАЯК) — ФОТО'}]},
  zavod:{w:12,h:7,title:'СЗ «ПАЛЛАДА» — АДМІНІСТРАЦІЯ',owner:'ОХОРОНЕЦЬ ІВАН',
    items:[{k:'guard',x:4,y:2,label:'ОХОРОНЕЦЬ — ПРОПУСК/ЕКСКУРСІЯ'},{k:'board',x:8,y:2,label:'ЗАВОДСЬКА ДОШКА'},{k:'stella',x:3,y:3,label:'ЯКОРЬ «ПАЛЛАДИ» — ФОТО'}]},
  school:{w:11,h:7,title:'ШКОЛА №3',owner:'ДИРЕКТОР',
    items:[{k:'rows',x:5,y:3,label:'КЛАС — ПАРТИ'},{k:'board',x:5,y:1,label:'ДОШКА «ДО ЗУСТРІЧІ 1 ВЕРЕСНЯ»'},{k:'host',x:8,y:5,label:'ДИРЕКТОР'}]},
  poly:{w:11,h:6,title:'ПОЛІКЛІНІКА №1',owner:'РЕЄСТРАТУРА',
    items:[{k:'recep',x:4,y:2,label:'РЕЄСТРАТУРА — ТАЛОНИ'},{k:'host',x:7,y:4,label:'ЛІКАР'},{k:'bed',x:2,y:3,label:'КАУЧЕТ'}]},
  /* ===== v3.0 «ПАНЕЛІ І ЧАЙКИ» ===== */
  second:{w:11,h:6,title:'СЕКОНДХЕНД «АЛЬБАТРОС»',owner:'КОЛЯ',
    items:[{k:'counter',x:4,y:2,label:'ПРИЛАВОК — РЕЧІ НА ВАГ (кг)'},{k:'host',x:7,y:4,label:'КОЛЯ'},{k:'shelf',x:1,y:1,label:'ШИФОНИ: КОФТИ, СУКНІ, КЕДИ'}]},
  busstation:{w:12,h:6,title:'АВТОСТАНЦІЯ «ЧОРНОМОРСЬК»',owner:'КАСИР',
    items:[{k:'recep',x:4,y:2,label:'КАСА — КВИТКИ ОДЕСА/КИЇВ'},{k:'board',x:8,y:2,label:'РОЗКЛАД: ОДЕСА 07:15 • 12:40 • КИЇВ 06:10'},{k:'rows',x:5,y:5,label:'ЗАЛ ОЧІКУВАННЯ'}]},
  /* ===== v3.1 «СІ, НІ ТА РЕЙВ»: КЛУБ «МАЯК» ===== */
  club:{w:13,h:9,title:'КЛУБ «МАЯК» — ТУСИ І РЕЙВ',owner:'ХОСТЕС МАРІЧКА',
    items:[{k:'dj',x:3,y:1,label:'ПУЛЬТ ДІДЖЕЯ — РЕЙВ П\'ЯТНИЦІ'},{k:'dancefloor',x:6,y:4,label:'ТАНЦПОЛ — ВИЙТИ (туси)'},
      {k:'barkeep',x:9,y:1,label:'БАР ЗАЗИ — напитки'},{k:'hostess',x:11,y:4,label:'ХОСТЕС МАРІЧКА'},
      {k:'speaker',x:11,y:1,label:'КОЛОНКИ — БАС'},{k:'table',x:2,y:6,label:'СТОЛИК'},
      {k:'radio',x:9,y:6,label:'РАДІО 103.2 FM — НОВИНИ МІСТА'}]},
  /* ===== v14.0 «ЖИВИЙ ПОРТ»: інтер'єри нових будівель порту ===== */
  portadm:{w:12,h:7,title:'АДМІНІСТРАЦІЯ ПОРТУ',owner:'НАЧАЛЬНИК ПОРТУ',
    items:[{k:'board',x:5,y:1,label:'СТЕНД — ВИДИ РОБІТ І ГРАФІК ПОРТУ'},{k:'host',x:8,y:4,label:'НАЧАЛЬНИК ПОРТУ — ЗМІНА ВАНТАЖНИКА'},{k:'window',x:3,y:4,label:'ПАНОРAMНЕ ВІКНО НА ПРИЧАЛИ'.replace('AM','ам')},{k:'radio',x:1,y:1,label:'РАДІО 103.2 FM — НОВИНИ'}]},
  warehouse:{w:12,h:7,title:'СКЛАД ПОРТУ',owner:'ВАНТАЖНИК',
    items:[{k:'shelf',x:2,y:1,label:'СТЕЛЯЖІ — КОНТЕЙНЕРИ І ТАРА'},{k:'host',x:8,y:4,label:'ВАНТАЖНИК — РОЗМОВА'},{k:'table',x:5,y:3,label:'СТІЛ ОБЛІКУ'},{k:'fire',x:10,y:1,label:'ОПАЛЮВАЛЬНИК (взимку)'}]},
  fishplant:{w:11,h:6,title:'РИБНИЙ ЦЕХ «АЛЬБАТРОС»',owner:'МАЙСТЕР ЦЕХУ',
    items:[{k:'counter',x:4,y:2,label:'РЯДОК РИБИ — КУПИТИ/ПРОДАТИ'},{k:'host',x:8,y:4,label:'МАЙСТЕР ЦЕХУ'},{k:'fire',x:1,y:1,label:'ЛЕДОВНЯ — КУСОК ЛЬОДУ'}]},
  dockyard:{w:11,h:6,title:'ДОК-МАЙСТЕРНЯ №7',owner:'МЕХАНІК',
    items:[{k:'table',x:5,y:2,label:'ВЕРСТАК — РЕМОНТ БУЙОК І КАТАМАРАНІВ'},{k:'host',x:8,y:4,label:'МЕХАНІК ДОКА'},{k:'radio',x:1,y:1,label:'РАДІО 103.2 FM'}]},
  medport:{w:11,h:6,title:'МЕДЕПУНКТ ПОРТУ',owner:'ФЕЛЬШЕР',
    items:[{k:'recep',x:4,y:2,label:'КАБІНЕТ — ОГЛЯД'},{k:'host',x:7,y:4,label:'ФЕЛЬШЕР ПОРТУ'},{k:'bed',x:2,y:3,label:'КАУЧЕТ'}]},
  portcant:{w:12,h:7,title:'ЇДАЛЬНЯ ПОРТОВИКІВ «ПРИЧАЛ»',
    items:[{k:'lunch',x:5,y:2,label:'РОЗДАЧА — КОМПЛЕКС ПОРТОВИКА'},{k:'table',x:3,y:5,label:'СТОЛИК'},{k:'table',x:8,y:5,label:'СТОЛИК У БАНКЕТНІЙ ЗОНІ'}]},
  fuelstore:{w:11,h:6,title:'СКЛАД ПАЛЬНОГО «МАЗИТ»',owner:'ОХОРОНЕЦЬ',
    items:[{k:'board',x:5,y:1,label:'ЖУРНАЛ ЗАПРАВОК — БУНКЕРИ МАЗУТУ'},{k:'host',x:8,y:4,label:'ОХОРОНЕЦЬ СКЛАДУ'},{k:'fire',x:1,y:3,label:'ПОЖЕЖНИЙ ЩИТ'}]},
  gatehouse:{w:9,h:6,title:'В\'ЇЗНА ВЕЖКА ПОРТУ — КПП',owner:'ВАХТЕР',
    items:[{k:'guard',x:4,y:2,label:'ВАХТЕР — ПРОПУСКА'},{k:'board',x:7,y:2,label:'ГРАФІК ЗМІН І ПОРОМІВ'}]},
  /* ===== v14: БАР «ПІРАТ» — ПОКЕР У ЗАДНІЙ КІМНАТІ + ДАРТС ===== */
  pokerbar:{w:13,h:8,title:'БАР «ПІРАТ» — ПОКЕР І ДАРТС',owner:'БАРМЕН',
    items:[{k:'barkeep',x:6,y:1,label:'БАРНА СТІЙКА'},{k:'pokertable',x:3,y:5,label:'🃏 ПОКЕРНИЙ СТІЛ — ГРА НА ГРОШІ'},
      {k:'darts',x:10,y:5,label:'🎯 ДАРТС — 3 КИДКИ'},{k:'host',x:11,y:2,label:'СІМКА С ТОГО ЗАВХОЗУ'},{k:'table',x:2,y:3,label:'СТОЛИК'}]},
  /* ===== v23.0: БУКМЕКЕР «КОЕФІЦІЄНТ» — СТАВКИ НА АПЛ ===== */
  bookmaker:{w:12,h:7,title:'БУКМЕКЕР «КОЕФІЦІЄНТ» — СТАВКИ НА ФУТБОЛ АПЛ',owner:'ПАНІ ОЛЯ',
    items:[{k:'bk-window',x:4,y:2,label:'🎫 ВІКНО СТАВОК — ЛІНІЯ АПЛ'},{k:'host',x:8,y:4,label:'ПАНІ ОЛЯ — БУКМЕКЕР'},{k:'tv',x:9,y:1,label:'📺 ЕКРАН — МАТЧІ І РЕЗУЛЬТАТИ'}]},
  /* ===== v28.0 «МОЄ АВТО»: авторинок • АЗС • тюнінг-гараж ===== */
  carmarket:{w:12,h:7,title:'АВТОРИНОК «АВТОМОРЕ» — САЛОН ПРОДАЖУ',owner:'ПРОДАВЕЦЬ ДЖИМ',
    items:[{k:'carlot',x:4,y:2,label:'🚗 ВІТРИНА — КУПИТИ АВТО (₴38-96 тис)'},{k:'host',x:8,y:4,label:'ДЖИМ — ПРОДАВЕЦЬ'},{k:'board',x:2,y:1,label:'⛽ ЦІНИ ПАЛЬНОГО І АДРЕСИ ЗАПРАВОК'}]},
  azs:{w:11,h:6,title:'ЗАПРАВКА — ОПЕРАТОРНА І МАГАЗИН',owner:'ОПЕРАТОР АЗС',
    items:[{k:'counter',x:4,y:2,label:'🛒 МАГАЗИН АЗС — вода ₴32, кава ₴30, КАНІСТРА ₴300'},{k:'host',x:7,y:4,label:'⛽ ОПЕРАТОР — ЗАПРАВКА АВТО'},{k:'board',x:2,y:1,label:'⛽ ЩИТ — ЦІНИ ПАЛЬНОГО'}]},
  tuning:{w:11,h:6,title:'ТЮНІНГ-ГАРАЖ «КЕРМ» — КОЛІР І МИЙКА',owner:'МАЙСТЕР ГЕНА',
    items:[{k:'paintbox',x:4,y:2,label:'🎨 ПАЛІТРА — 10 КОЛЬОРІВ КУРОРТУ (₴600)'},{k:'host',x:8,y:4,label:'ГЕНА — МАЙСТЕР'},{k:'shelf',x:2,y:1,label:'🔧 ІНСТРУМЕНТ І ФАРБА'}]},
  /* i3-gfx-v31: РАДІО 103.2 FM у оселях */
};
IB.drawInterior=(g,dt)=>{
  const C=IB.INT_CUR;if(!C)return;
  /* v11: інтер'єр 480×336 центрується на канві будь-якого розміру */
  const _w=VW(),_h=VH();
  g.save();g.fillStyle='#0b0d0b';g.fillRect(0,0,_w,_h);
  g.translate(IB.M.round((_w-480)/2),IB.M.round((_h-336)/2));
  g.beginPath();g.rect(0,0,480,336);g.clip();
  const D=C.def,P=IB.PAL;
  const rw=D.w,rh=D.h;
  const OX=240-(rw-rh)*8,OY=64;
  g.fillStyle='#0b0d0b';g.fillRect(0,0,480,336);
  /* світно з вікна */
  const nf=IB.nightFactor();
  const wl=IB.G.wx.type;
  g.fillStyle=nf>0.5?'#0a1226':(wl==='rain'||wl==='blizzard'||wl==='snow'?'#4a5866':'#8ab2cc');
  g.fillRect(0,0,480,336);
  if(nf<=0.5&&wl==='sun'){g.fillStyle='#f8e8a0';g.beginPath();g.arc(400,60,14,0,7);g.fill();}
  /* підлога */
  for(let ty=0;ty<rh;ty++)for(let tx=0;tx<rw;tx++){
    const sx=(tx-ty)*16+OX,sy=(tx+ty)*8+OY;
    const v=IB.hsh(tx,ty,60);
    IB.rhomb(g,sx,sy,32,16,v>0.85?'#8a6a42':(v>0.5?'#7a5e38':'#6e5230'));
  }
  /* стіни: північно-східна і північно-західна грані */
  for(let i=0;i<rw;i++){
    const sx=(i-0)*16+OX,sy=i*8+OY;
    IB.PA(g,[[sx,sy+8],[sx+16,sy],[sx+32,sy+8],[sx+32,sy+30],[sx+16,sy+22],[sx,sy+30]],'#4e3a20');
    IB.P(g,sx+4,sy+9,24,2,'#5e4628');
  }
  for(let i=0;i<rh;i++){
    const sx=(0-i)*16+OX-32+16,sy=i*8+OY;
    IB.PA(g,[[sx,sy+8],[sx+16,sy],[sx+32,sy+8],[sx+32,sy+30],[sx+16,sy+22],[sx,sy+30]],'#443218');
  }
  /* вікно на пн-східній стіні */
  {
    const wi=IB.M.floor(rw/2);
    const sx=(wi)*16+OX,sy=wi*8+OY;
    IB.P(g,sx+6,sy+4,14,12,'#2a3e5c');
    g.fillStyle=nf>0.5?'#0a1226':(wl==='sun'?'#a8d0e8':'#5a6a78');
    g.fillRect(sx+7,sy+5,12,10);
    if(wl==='sun'&&nf<=0.5){g.fillStyle='#f8e8a0';g.fillRect(sx+9,sy+7,3,3);}
    IB.P(g,sx+12,sy+5,2,10,'#5e4628');IB.P(g,sx+7,sy+9,12,2,'#5e4628');
  }
  /* меблі/об'єкти */
  for(const it of D.items){
    const sx=(it.x-it.y)*16+OX,sy=(it.x+it.y)*8+OY;
    const hl=(C.hi===it);
    if(it.k==='pech'){IB.isoBox(g,sx-14,sy,30,22,16,'#d8d0c8','#c8bcb0','#b8a898');
      IB.O(g,sx+1,sy+2,7,4,'#2a2a2a');
      const fl=IB.M.sin(performance.now()*0.008)>0;
      IB.P(g,sx-2,sy+2,4,fl?3:2,'#e07038');}
    else if(it.k==='table'||it.k==='counter'){IB.isoBox(g,sx-12,sy,26,16,8,'#8a6a42','#6e5230','#5e4628');
      IB.P(g,sx-4,sy-2,8,3,'#e8d8b8');}
    else if(it.k==='bed'){IB.isoBox(g,sx-12,sy,26,14,6,'#c8b088','#b09868','#9a8058');}
    else if(it.k==='shelf'){IB.isoBox(g,sx-10,sy,22,12,12,'#7a5e38','#6e5230','#5e4628');
      IB.P(g,sx-6,sy-8,14,3,'#c8a028');IB.P(g,sx-4,sy-3,10,3,'#3a62b8');}
    else if(it.k==='barkeep'||it.k==='anvil'){IB.isoBox(g,sx-14,sy,30,18,10,'#5a4630','#4e3a26','#443218');
      if(it.k==='anvil'){IB.P(g,sx-6,sy-14,14,6,'#3e4440');IB.P(g,sx-2,sy-8,4,6,'#2e3230');}}
    else if(it.k==='pray'){IB.P(g,sx-2,sy-12,3,10,'#f0e8d0');IB.P(g,sx-5,sy-8,3,7,'#f0e8d0');IB.P(g,sx+2,sy-9,3,6,'#f0e8d0');
      const fl=IB.M.sin(performance.now()*0.01)*0.5+0.5;
      g.fillStyle='rgba(240,180,60,'+(0.25+fl*0.2)+')';g.beginPath();g.arc(sx,sy-4,14,0,7);g.fill();}
    else if(it.k==='icons'){IB.isoBox(g,sx-14,sy,30,8,18,'#d8c898','#c8b888','#b8a878');
      IB.P(g,sx-8,sy-14,18,10,'#c8a028');IB.P(g,sx-4,sy-11,10,4,'#b82840');}
    else if(it.k==='guitar'){IB.P(g,sx-2,sy-10,3,14,'#8a6038');IB.O(g,sx-1,sy-14,6,7,'#c8a050');
      IB.P(g,sx-6,sy-16,10,4,'#5e4628');}
    else if(it.k==='stella'){IB.P(g,sx-6,sy-22,12,20,'#e8e8e2');IB.P(g,sx-5,sy-20,10,4,'#b82840');
      IB.P(g,sx-5,sy-14,10,2,'#2a3e5c');}
    /* ================= i3-gfx-patch: МЕБЛІ КУРОРТУ ================= */
    else if(it.k==='board'){
      IB.isoBox(g,sx-14,sy,30,8,20,'#6e5230','#5e4628','#4e3a20');
      IB.P(g,sx-11,sy-16,24,14,'#e8dcc0');
      IB.P(g,sx-9,sy-13,8,4,'#e0a030');IB.P(g,sx+1,sy-11,8,4,'#3aa0e0');
      IB.P(g,sx-7,sy-6,9,3,'#e05a5a');
    }
    else if(it.k==='bk-window'){  /* v23: вікно ставок букмекера */
      IB.isoBox(g,sx-15,sy,32,18,10,'#5a4630','#4e3a26','#443218');
      IB.isoBox(g,sx-14,sy-1,28,14,3,'#184a34','#0e2c1e','#0e2c1e');
      IB.P(g,sx-10,sy-8,20,5,'#e8dcc0');
      IB.P(g,sx-9,sy-7,4,3,'#3aa0e0');IB.P(g,sx-4,sy-7,4,3,'#f0d050');IB.P(g,sx+1,sy-7,4,3,'#e05a5a');
      IB.P(g,sx-9,sy-3,10,1,'#6e5230');
    }
    else if(it.k==='tv'){  /* v23: екран матчів */
      IB.isoBox(g,sx-8,sy-2,16,10,12,'#1a1620','#12101a','#0e0c14');
      IB.P(g,sx-6,sy-9,12,7,'#184a34');
      IB.P(g,sx-5,sy-8,4,2,'#f0d050');IB.P(g,sx,sy-8,5,2,'#3aa0e0');
      const fl=IB.M.sin(performance.now()*0.003)>0;
      IB.P(g,sx-5,sy-5,10,2,fl?'#2e623c':'#3a7a4a');
      IB.P(g,sx-1,sy+3,2,4,'#3e4440');
    }
    else if(it.k==='recep'){
      IB.isoBox(g,sx-14,sy,30,16,10,'#5a4630','#4e3a26','#443218');
      IB.O(g,sx+6,sy-4,3,2,'#f0d050');
      IB.P(g,sx-10,sy-12,8,5,'#2a3e5c');
    }
    else if(it.k==='lunch'){
      IB.isoBox(g,sx-14,sy,30,14,10,'#8a8c94','#7a7c84','#6a6c74');
      IB.O(g,sx-6,sy-6,5,2.5,'#e8d050');IB.O(g,sx+2,sy-5,5,2.5,'#c85048');
      IB.O(g,sx+8,sy-7,3,2,'#4e9440');
    }
    else if(it.k==='weights'){
      IB.isoBox(g,sx-14,sy,30,12,6,'#3a3e4c','#2e3238','#262a30');
      IB.P(g,sx-10,sy-12,22,2,'#8a8c94');
      IB.O(g,sx-9,sy-11,3,3,'#3e4440');IB.O(g,sx+9,sy-11,3,3,'#3e4440');
      IB.P(g,sx-4,sy-18,10,4,'#e05a5a');
    }
    else if(it.k==='screen'){
      IB.P(g,sx-20,sy-26,42,20,'#0e1420');
      const flick=0.75+IB.M.sin(performance.now()*0.01)*0.2;
      IB.P(g,sx-18,sy-24,38,16,'rgba(140,180,220,'+flick+')');
      IB.P(g,sx-14,sy-18,10,6,'rgba(240,240,240,0.6)');
    }
    else if(it.k==='rows'){
      for(let r2=0;r2<3;r2++){
        IB.P(g,sx-14+r2*2,sy-4+r2*5,26-r2*3,3,'#8a4a3a');
        IB.P(g,sx-14+r2*2,sy-6+r2*5,26-r2*3,2,'#a85a4a');
      }
    }
    else if(it.k==='exhibit'){
      IB.isoBox(g,sx-8,sy,18,10,8,'#28303e','#202834','#1a2028');
      IB.P(g,sx-6,sy-16,14,10,'rgba(160,200,230,0.35)');
      IB.O(g,sx+1,sy-11,4,3,'#e8d050');
      IB.P(g,sx-3,sy-8,3,5,'#8a6a48');
    }
    /* ===== v28.0 «МОЄ АВТО»: вітрина авторинку і палітра тюнінгу ===== */
    else if(it.k==='carlot'){
      /* подіум з машиною-експонатом (зал салону) */
      IB.isoBox(g,sx-16,sy,34,20,5,'#9a9a92','#8a8a82','#7a7a72');
      IB.isoBox(g,sx-10,sy-5,22,11,7,'#c85048','#a84038','#903830');   /* «кузов» */
      IB.isoBox(g,sx-6,sy-9,14,7,4,'#e07060','#c85a50','#b05048');     /* «дах» */
      IB.O(g,sx-4,sy-2,3,2,'#20262e');IB.O(g,sx+3,sy-2,3,2,'#20262e');
      IB.P(g,sx-8,sy-16,18,3,'#2a4a68');
      IB.P(g,sx-5,sy-15,12,2,'#f0d050');
      const fl=IB.M.sin(performance.now()*0.004)*0.5+0.5;
      g.fillStyle='rgba(240,220,140,'+(0.12+fl*0.08)+')';
      g.beginPath();g.arc(sx,sy-8,16,0,7);g.fill();
    }
    else if(it.k==='paintbox'){
      /* стелаж балончиків з кольорами курорту */
      IB.isoBox(g,sx-14,sy,30,10,14,'#7a5e38','#6e5230','#5e4628');
      const PC=['#e8e8e2','#d8d2c4','#5c86c8','#3fa97b','#ee6444','#e8b23a','#e07038','#f4a8c0','#8a5a9a','#2a2e38'];
      for(let i=0;i<5;i++){
        IB.P(g,sx-11+i*5,sy-16,4,4,PC[i]);
        IB.P(g,sx-11+i*5,sy-11,4,4,PC[i+5]);
      }
      IB.P(g,sx-12,sy-4,26,2,'#c8a028');
    }
    else if(it.k==='sunbed'){
      IB.P(g,x-9,y-5,18,3,'#e07ab8');
      IB.PA(g,[[x+6,y-5],[x+11,y-11],[x+13,y-10],[x+9,y-4]],'#e07ab8');
    }
    else if(it.k==='window'){
      IB.P(g,sx-10,sy-18,20,14,'#5e4628');
      g.fillStyle=nf>0.5?'#0a1226':'#a8d0e8';g.fillRect(sx-8,sy-16,16,11);
      if(IB.G.wx.type==='storm'){g.fillStyle='#2a4250';g.fillRect(sx-8,sy-16,16,11);}
      IB.P(g,sx-0.8,sy-16,1.6,11,'#5e4628');IB.P(g,sx-8,sy-11,16,1.6,'#5e4628');
      IB.P(g,sx-12,sy-22,24,2,'#8a6a42');
    }
    /* ===== i3-gfx-v31: КЛУБ «МАЯК» — DJ, танцпол, колонки, хостес, РАДІО ===== */
    else if(it.k==='dj'){
      IB.isoBox(g,sx-16,sy,34,16,12,'#1e2028','#171921','#111318');
      const spin=performance.now()*0.01;
      IB.O(g,sx-9,sy-3,7,7,'#0c0d11');
      IB.O(g,sx+5,sy-3,7,7,'#0c0d11');
      g.strokeStyle='rgba(255,220,120,0.8)';g.lineWidth=1.4;
      g.beginPath();g.moveTo(sx-9+IB.M.cos(spin)*3,sy+IB.M.sin(spin)*3);
      g.lineTo(sx-9-IB.M.cos(spin)*3,sy-IB.M.sin(spin)*3);g.stroke();
      g.beginPath();g.moveTo(sx+5+IB.M.cos(-spin)*3,sy+IB.M.sin(-spin)*3);
      g.lineTo(sx+5-IB.M.cos(-spin)*3,sy-IB.M.sin(-spin)*3);g.stroke();
      IB.P(g,sx+12,sy-14,10,6,'rgba(120,220,255,0.75)');
      /* лазерні промені */
      const lp=IB.M.sin(performance.now()*0.006);
      IB.PA(g,[[sx-6,sy-16],[sx-20+lp*8,sy-40],[sx-14+lp*8,sy-42],[sx-2,sy-16]],'rgba(255,80,210,0.20)');
      IB.PA(g,[[sx+6,sy-16],[sx+18-lp*8,sy-40],[sx+24-lp*8,sy-42],[sx+10,sy-16]],'rgba(90,230,255,0.20)');
    }
    else if(it.k==='dancefloor'){
      const ph=IB.M.floor(performance.now()*0.004);
      const cols=['#ff4fd8','#4fd8ff','#f0d050','#4ee06a','#c85878','#a070e0'];
      for(let ty2=0;ty2<3;ty2++)for(let tx2=0;tx2<3;tx2++){
        const c=cols[(ph+tx2+ty2*2)%cols.length];
        IB.rhomb(g,sx+(tx2-1)*16,sy+(ty2-1)*8-2,26,13,c);
      }
      IB.O(g,sx,sy-2,30,20,'rgba(255,140,230,0.10)');
    }
    else if(it.k==='speaker'){
      IB.isoBox(g,sx-8,sy,18,12,22,'#16131e','#0e0c14','#0a090f');
      const pp=IB.M.abs(IB.M.sin(performance.now()*0.008));
      IB.O(g,sx-1,sy-8,5,5,'rgba(80,200,255,'+(0.3+pp*0.4)+')');
      IB.O(g,sx-1,sy-2,6,6,'rgba(255,90,220,'+(0.25+pp*0.35)+')');
    }
    else if(it.k==='hostess'){
      IB.drawPerson(g,sx,sy-6,'d',0,{skin:'#f0b48c',hair:'#2a1a10',hat:'none',jacket:'#e05a8a',pants:'#e8e8e2'});
    }
    else if(it.k==='radio'){
      IB.isoBox(g,sx-10,sy,22,12,9,'#7a5e38','#6e5230','#5e4628');
      IB.P(g,sx-7,sy-10,12,5,'rgba(240,190,80,'+(0.55+IB.M.abs(IB.M.sin(performance.now()*0.005))*0.45)+')');
      IB.P(g,sx+6,sy-16,1.6,10,'#3a3228');
      const nt='♪';g.font='9px monospace';g.fillStyle='rgba(240,208,80,'+(0.5+IB.M.sin(performance.now()*0.006)*0.5)+')';
      g.fillText(nt,sx+2,sy-20);
    }
    else if(it.k==='pokertable'){  /* v25.0: стіл покеру — був невидимий */
      IB.isoBox(g,sx-22,sy,46,28,10,'#2a4a32','#1e3a26','#16301e');
      IB.rhomb(g,sx,sy-6,36,18,'#3a6a42');
      const pd=performance.now()*0.002;
      for(let ci=0;ci<5;ci++)IB.P(g,sx-10+ci*5,sy-8+IB.M.sin(pd+ci)*1.2,4,6,'#f0e8d0');
      IB.O(g,sx-8,sy+4,5,3,'#e8e8e2');IB.O(g,sx+3,sy+4,5,3,'#e8e8e2');
    }
    else if(it.k==='darts'){  /* v25.0: дартс — був невидимий */
      IB.P(g,sx-1,sy-26,2,10,'#5e4628');
      IB.O(g,sx,sy-30,8,8,'#1a2028');
      IB.O(g,sx,sy-30,5.5,5.5,'#2a4a32');
      IB.O(g,sx,sy-30,3.5,3.5,'#7a3a2a');
      IB.O(g,sx,sy-30,1.5,1.5,'#f0d050');
    }
    else if(it.k==='fire'){  /* v25.0: горн — був невидимий */
      IB.isoBox(g,sx-10,sy,20,10,8,'#5a4630','#4e3a26','#443218');
      const fl3=IB.M.sin(performance.now()*0.01);
      IB.PA(g,[[sx-4,sy-4],[sx-1,sy-12-IB.M.abs(fl3)*3],[sx+2,sy-4]],'#e07038');
      IB.PA(g,[[sx-2,sy-3],[sx,sy-8],[sx+2,sy-3]],'#f0d050');
    }
    else if(it.k==='guard'){IB.drawPerson(g,sx,sy-6,'d',0,{skin:'#e0a878',hair:'#241a10',hat:'cap',hatc:'#3a5a3a',jacket:'#3a5a3a',pants:'#2e3a2e'});}
    else if(it.k==='host'||it.k==='priest'||it.k==='farmw'){
      IB.drawPerson(g,sx,sy-6,'d',0,IB.lookBySeed(it.x*7+it.y));}
    if(hl&&it.k!=='host'){g.strokeStyle='#f0d050';g.lineWidth=1;g.strokeRect(sx-16,sy-16,34,22);}
  }
  /* група (v25.0): лідер керує — ВСЯ П'ЯТІРКА гуляє кімнатою, імена світяться */
  const leader=C.hero;
  IB.drawPerson(g,(leader.x-leader.y)*16+OX,(leader.x+leader.y)*8+OY-4,leader.dir,leader.fr,IB.E.team[0].look);
  g.font='bold 7px monospace';g.textAlign='center';
  for(const c of (C.crew||[])){
    const hh=c.h;if(!hh)continue;
    const px=(c.x-c.y)*16+OX,py=(c.x+c.y)*8+OY-4;
    IB.drawPerson(g,px,py,c.dir,c.fr,hh.look);
    const nc=hh.def&&hh.def.nameColor?hh.def.nameColor:'#f0d050';
    const ny=py-30+IB.M.sin(performance.now()*0.003+c.x*1.7)*1.4;
    g.shadowColor=nc;g.shadowBlur=5;g.fillStyle=nc;g.fillText(hh.name,px,ny);
    g.shadowBlur=0;g.fillStyle='#ffffffcc';g.fillText(hh.name,px,ny);
  }
  g.textAlign='left';
  /* v2.4c.1: маркер виходу ПОВЕРХ групи — двері, килимок, сяйво, жовта
     стрілка, що підстрибує, з обводкою і підписом «E — ВИХІД» */
  {
    const ex=(C.entry.x-C.entry.y)*16+OX,ey=(C.entry.x+C.entry.y)*8+OY;
    const bob=IB.M.round(IB.M.sin(performance.now()*0.005)*2.5);
    g.fillStyle='rgba(240,200,120,0.12)';g.beginPath();g.arc(ex,ey-4,22,0,7);g.fill();
    IB.rhomb(g,ex,ey+2,28,14,'#5e4628');
    IB.rhomb(g,ex,ey+2,18,9,'#8a6a42');
    IB.P(g,ex-9,ey-24,18,22,'#241a0e');
    IB.P(g,ex-6,ey-22,12,18,'#4a3a22');
    IB.P(g,ex+2,ey-15,2,3,'#c8a028');
    g.fillStyle='#f0d050';g.strokeStyle='#241a0e';g.lineWidth=1;
    g.beginPath();g.moveTo(ex,ey-37+bob);g.lineTo(ex-6,ey-30+bob);g.lineTo(ex+6,ey-30+bob);g.closePath();g.fill();g.stroke();
    g.font='bold 9px monospace';
    g.fillStyle='#241a0e';g.fillText('E — ВИХІД',ex-20,ey-45+bob);
    g.fillStyle='#f0d050';g.fillText('E — ВИХІД',ex-21,ey-46+bob);
  }
  /* затемнення від стін + тепле світло */
  g.fillStyle='rgba(40,24,10,0.10)';g.fillRect(0,0,480,336);
  /* назва + підказка */
  g.fillStyle='rgba(6,12,10,0.82)';g.fillRect(6,6,468,18);
  g.font='9px monospace';g.fillStyle='#f0d050';g.fillText(D.title+' • '+(C.b.name||''),12,19);
  const it2=C.hi;
  g.fillStyle='rgba(6,12,10,0.82)';g.fillRect(110,306,260,22);
  g.font='9px monospace';g.fillStyle='#f0d050';
  g.fillText(it2?('[E] '+it2.label):(C.nearExit?'[E] ВИХІД — НА ВУЛИЦЮ • ESC — ВИЙТИ':'РУХ — WASD • E — ДО ОБ\'ЄКТІВ • ESC — ВИЙТИ'),122,320);
  g.restore();
};

/* ==================== v1.2: ФОТО-ПОЛАРОЇДИ ==================== */
/* ==================== v2.4 «ФІНАЛ»: ФОТО-ПОЛАРОЇДИ — СЕРІЇ З 3 КАДРІВ ====================
   Кожен спуск затвора — три полароїди з різними позами групи:
   КАДР 1 «УСІ РАЗОМ», КАДР 2 «СТРИБОК!» (іскри), КАДР 3 «ПРАПОРЕЦЬ»
   (Легінь тримає прапор, теплий фільтр). У кадрі — горизонт моря,
   хмари, чайки, пальми по кутах, пісок на передньому плані,
   віньєтка, зерно плівки і помаранчевий штамп часу. */
IB.PHOTO_VARS=['УСІ РАЗОМ','СТРИБОК!','ПРАПОРЕЦЬ'];
IB.renderPhoto=(g,entry,X,Y,W,H,small)=>{
  const seed=entry.seed||1;
  /* рамка полароїда */
  g.fillStyle='#f4f0e6';g.fillRect(X-3,Y-3,W+6,H+6+(small?0:14));
  const wx=entry.wx||'sun';
  /* небо за погодою */
  const sky=g.createLinearGradient(0,Y,0,Y+H);
  if(wx==='sun'){sky.addColorStop(0,'#28598c');sky.addColorStop(1,'#a8c4d8');}
  else if(wx==='snow'||wx==='blizzard'){sky.addColorStop(0,'#8aa4b8');sky.addColorStop(1,'#d8e4ee');}
  else if(wx==='rain'){sky.addColorStop(0,'#4a5866');sky.addColorStop(1,'#8a9aa8');}
  else {sky.addColorStop(0,'#5a6a7c');sky.addColorStop(1,'#b8c4cc');}
  g.fillStyle=sky;g.fillRect(X,Y,W,H);
  /* сонце з ореолом */
  if(wx==='sun'){
    g.fillStyle='rgba(248,232,160,0.25)';g.beginPath();g.arc(X+W-14,Y+11,11,0,7);g.fill();
    g.fillStyle='#f8e8a0';g.beginPath();g.arc(X+W-14,Y+11,6,0,7);g.fill();
  }
  /* хмари у кадрі */
  for(let i=0;i<(small?3:4);i++){
    const cx=X+W*0.1+IB.hsh(i,seed,710)*W*0.78,cy=Y+H*(0.12+IB.hsh(i,1,711)*0.2);
    g.fillStyle='rgba(240,246,252,0.72)';
    g.beginPath();g.ellipse(cx,cy,W*0.15,H*0.05,0,0,7);g.fill();
    g.beginPath();g.ellipse(cx+W*0.1,cy-H*0.03,W*0.09,H*0.04,0,0,7);g.fill();
  }
  /* птахи */
  g.strokeStyle='rgba(30,40,50,0.5)';g.lineWidth=1;
  for(let i=0;i<2;i++){
    const bx=X+W*(0.18+i*0.3),by=Y+H*(0.18+IB.hsh(i,seed,712)*0.15);
    g.beginPath();g.moveTo(bx-3,by);g.lineTo(bx,by-2);g.lineTo(bx+3,by);g.stroke();
  }
  /* v15.0: МОРЕ за seed — горизонт, вода, далекий силует порту */
  const seaTop=Y+H*0.52;
  g.fillStyle='#28598c';g.fillRect(X,seaTop,W,Y+H-seaTop);
  g.fillStyle='#3a6a9c';g.fillRect(X,seaTop,W,H*0.05);
  g.fillStyle='rgba(190,232,244,0.5)';
  for(let i=0;i<6;i++)g.fillRect(X+4+IB.hsh(i,seed,705)*(W-18),seaTop+6+i*(H-seaTop)/8,14,1);
  /* далекий суховіз/кран на горизонті */
  g.fillStyle='rgba(20,32,48,0.55)';
  g.fillRect(X+W*0.62,seaTop-8,W*0.1,8);
  g.fillRect(X+W*0.66,seaTop-14,2,8);
  /* сюжети за типом точки */
  if(entry.kind==='peak'){
    /* ізо-піраміда вершини зі сніжною шапкою і прапорцем */
    const pkx=X+W*0.5,pky=Y+H*0.28;
    IB.PA(g,[[pkx-22,Y+H*0.72],[pkx,pky],[pkx+22,Y+H*0.72]],'#88928c');
    IB.PA(g,[[pkx-22,Y+H*0.72],[pkx,pky],[pkx,Y+H*0.72]],'#6e7872');
    IB.PA(g,[[pkx,pky],[pkx-8,pky+10],[pkx+8,pky+10]],'#f0f6f8');
    IB.P(g,pkx-1,pky-9,2,11,'#3a3a3a');
    IB.PA(g,[[pkx+1,pky-9],[pkx+11,pky-6],[pkx+1,pky-3]],'#c83828');
  }else if(entry.kind==='lake'||entry.kind==='shatsk'){
    g.fillStyle='#28565f';g.fillRect(X,Y+H*0.62,W,H*0.38);
    g.fillStyle='rgba(160,220,235,0.4)';
    for(let i=0;i<6;i++)g.fillRect(X+4+IB.hsh(i,seed,705)*(W-16),Y+H*0.64+i*3,10,1);
    if(entry.kind==='shatsk'){g.fillStyle='#c8b888';g.fillRect(X,Y+H-6,W,6);g.fillStyle='#2e5230';
      IB.PA(g,[[X+10,Y+H-6],[X+14,Y+H-20],[X+18,Y+H-6]],'#2e5230');IB.PA(g,[[X+W-20,Y+H-6],[X+W-16,Y+H-18],[X+W-12,Y+H-6]],'#2e5230');}
  }else if(entry.kind==='border'){
    IB.P(g,X+W/2-7,Y+H*0.3,14,H*0.5,'#e8e8e2');
    IB.P(g,X+W/2-6,Y+H*0.34,12,4,'#b82840');
    IB.P(g,X+W/2-6,Y+H*0.5,12,3,'#2a3e5c');
  }else if(entry.kind==='rocks'){
    for(let i=0;i<4;i++)IB.isoBox(g,X+10+i*22,Y+H*0.55,20,10,10+IB.hsh(i,seed,708)*8,'#5e6a62','#4e5a54','#6e7872');
  }else if(entry.kind==='ruin'){
    IB.isoBox(g,X+W/2-18,Y+H*0.5,36,16,8,'#5e6a62','#4e5a54','#6e7872');
    IB.P(g,X+W/2-12,Y+H*0.5-8,6,8,'#5e6a62');
  }
  /* v15.0: пальми по кутах кадру */
  const pnc=small?'#16321e':'#1e4228';
  const palm=(px,py,ph,dir)=>{
    IB.P(g,px-1,py-ph,2,ph,pnc);
    for(let f=0;f<4;f++){
      const fa=(dir?-1:1)*(0.45+f*0.55);
      g.strokeStyle=pnc;g.lineWidth=1.3;
      g.beginPath();g.moveTo(px,py-ph);
      g.quadraticCurveTo(px+IB.M.cos(fa)*7,py-ph-6,px+IB.M.cos(fa)*13,py-ph-2);
      g.stroke();
    }
  };
  for(let i=0;i<2;i++){
    const by=Y+H-1;
    palm(X+7+i*9,by,9+i*3,false);
    palm(X+W-7-i*9,by,12-i*3,true);
  }
  /* v15.0: передній план — пісок і черепашки */
  g.fillStyle='#d8c090';
  g.fillRect(X,Y+H-5,W,5);
  g.fillStyle='#e4d0a0';
  g.fillRect(X,Y+H-4,W,3);
  for(let i=0;i<8;i++){
    g.fillStyle=['#f4ede0','#e8b8a0','#c8d8e4'][i%3];
    g.fillRect(X+4+IB.hsh(i,seed,713)*(W-8),Y+H-4.5,1.5,1.5);
  }
  /* ГРУПА — 5 постатей, пози залежать від кадру */
  const vr=entry.var||0;
  for(let i=0;i<5;i++){
    const px=X+W*0.5+(i-2)*W*0.115;
    let py=Y+H*0.88,fr=0,dir='d';
    if(vr===1){py-=4+(i&1)*3;fr=1;if(i&1)dir='l';}
    if(vr===2&&i>0){fr=2;if(i&1)dir='r';}
    const look=IB.HERO_DEFS[i]?IB.HERO_DEFS[i].look:null;
    IB.drawPerson(g,px,py,dir,fr,look||{skin:'#e0a878',hair:'#241a10',jacket:'#5a6a3a',pants:'#3a4030'},small?0.62:0.82);
  }
  /* КАДР 3: Легінь тримає прапор */
  if(vr===2&&!small){
    const fx=X+W*0.5+W*0.33;
    IB.P(g,fx,Y+H*0.6,2,H*0.28,'#5e4628');
    IB.PA(g,[[fx+2,Y+H*0.6],[fx+13,Y+H*0.65],[fx+2,Y+H*0.7]],'#c83828');
  }
  /* КАДР 2: іскри над стрибком */
  if(vr===1){
    g.font='7px monospace';g.fillStyle='#f8e8a0';
    for(let i=0;i<5;i++)g.fillText('✦',X+W*0.12+IB.hsh(i,seed,716)*W*0.76,Y+H*0.34+IB.hsh(i,2,717)*H*0.22);
  }
  /* фільтри настрою кадру */
  if(vr===1){g.fillStyle='rgba(110,170,255,0.10)';g.fillRect(X,Y,W,H);}
  if(vr===2){g.fillStyle='rgba(248,180,90,0.13)';g.fillRect(X,Y,W,H);}
  /* віньєтка + зерно плівки */
  const vg=g.createRadialGradient(X+W/2,Y+H*0.45,W*0.3,X+W/2,Y+H*0.5,W*0.75);
  vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(0,0,0,0.28)');
  g.fillStyle=vg;g.fillRect(X,Y,W,H);
  for(let i=0;i<24;i++){
    g.fillStyle=IB.hsh(i,seed,718)<0.5?'rgba(255,255,255,0.05)':'rgba(0,0,0,0.06)';
    g.fillRect(X+IB.hsh(i,1,719)*W,Y+IB.hsh(i,2,719)*H,1.4,1.4);
  }
  /* штамп часу як на плівці */
  if(!small){
    g.fillStyle='rgba(248,150,60,0.85)';g.font='6px monospace';
    g.fillText('Д'+entry.day+' • '+entry.time,X+W-44,Y+12);
  }
  /* підпис */
  if(!small){
    g.fillStyle='#1a1a1a';g.font='7px monospace';g.textAlign='center';
    g.fillText(entry.name,X+W/2,Y+H+11);
    g.fillStyle='#5a5a5a';
    g.fillText('ДЕНЬ '+entry.day+' • '+entry.time+(entry.alt?' • '+entry.alt+' М':''),X+W/2,Y+H+19);
    if(entry.var!==undefined){
      g.fillStyle='#c83828';
      g.fillText('КАДР '+(entry.var+1)+'/3 — '+IB.PHOTO_VARS[entry.var],X+W/2,Y+H+26);
    }
    g.textAlign='left';
  }
};
IB.drawAlbumPhotoSmall=IB.drawAlbumPhotoSmall=(cv,entry)=>{
  const g=cv.getContext('2d');
  g.imageSmoothingEnabled=false;
  g.clearRect(0,0,cv.width,cv.height);
  IB.renderPhoto(g,entry,0,0,cv.width,cv.height-6,true);
  g.fillStyle='#1a1a1a';g.font='6px monospace';g.textAlign='center';
  g.fillText(entry.name,cv.width/2,cv.height-1);
  g.textAlign='left';
};

/* ==================== v1.2: ВЕЛИКА КАРТА v2 (зверху базової) ==================== */
IB.drawBigMap=(canvas)=>{
  IB.drawBigMapBase(canvas);
  const g=canvas.getContext('2d');
  const sc=canvas.width/IB.W.W,scY=canvas.height/IB.W.H;
  const X=v=>v*sc,Y=v=>v*scY;
  /* v5.0: МОРСЬКІ ПІДПИСИ — ЧОРНОМОРСЬК, ЛИМАН, ПОРТ, СЕЛА ГРОМАДИ */
  g.font='9px monospace';g.fillStyle='rgba(122,178,216,0.75)';
  g.fillText('Ч  О  Р  Н  Е     М  О  Р  Е',X(150),Y(530));
  g.font='7px monospace';g.fillStyle='rgba(122,178,216,0.5)';
  g.fillText('мілководдя — піна біля берега',X(150),Y(476));
  g.font='8px monospace';g.fillStyle='rgba(80,140,110,0.8)';
  g.fillText('СУХИЙ ЛИМАН',X(368),Y(262));
  g.font='7px monospace';g.fillStyle='rgba(240,208,80,0.6)';
  g.fillText('Т Р А С А   О Д Е С А — 2 5  К М',X(90),Y(13));
  g.fillText('МАРШРУТКА №7: пр. Миру — 12-та Лінія — Курортна — 1-ша Лінія',X(40),Y(112));
  g.fillStyle='rgba(200,200,190,0.55)';
  g.fillText('зупинки = жовті таблички • таксі з телефона • пороми: Варна, Стамбул',X(60),Y(516));
  /* підпис групи на маршруті */
  if(IB.G.route){
    const L=IB.E.team[0];
    g.fillStyle='#e05a8a';g.font='7px monospace';
    g.fillText('→ маршрут',X(L.x)+4,Y(L.y)-4);
  }
  /* ---------- v1.4: ТУРИСТИЧНІ ШТАМПИ — пройдені маршрути ---------- */
  const stamps=IB.G.stamps||{};
  let nst=0;
  for(const r of IB.W.ROUTES){
    const st=stamps[r.id];if(!st)continue;
    nst++;
    const sx=X(r.x),sy=Y(r.y);
    const ang=(-0.22+IB.hsh(r.id.length,4,730)*0.3);
    g.save();g.translate(sx+12,sy-10);g.rotate(ang);
    /* «гумовий» штамп: подвійне кільце + галочка + день */
    g.strokeStyle='rgba(210,70,70,0.85)';g.lineWidth=1.6;
    g.beginPath();g.arc(0,0,9,0,7);g.stroke();
    g.strokeStyle='rgba(210,70,70,0.5)';g.lineWidth=1;
    g.beginPath();g.arc(0,0,6.5,0,7);g.stroke();
    g.fillStyle='rgba(210,70,70,0.9)';g.font='8px monospace';g.textAlign='center';
    g.fillText('✓',0,3);
    g.font='5px monospace';g.fillText('Д'+st.d,0,15);
    g.textAlign='left';
    g.restore();
  }
  /* лічильник штампів */
  g.font='8px monospace';g.textAlign='right';
  g.fillStyle='rgba(240,240,220,0.85)';
  g.fillText('ШТАМПИ: '+nst+'/'+IB.W.ROUTES.length+' ✉',canvas.width-6,canvas.height-6);
  g.textAlign='left';
};

/* ==================== v1.4: КІНО-МОМЕНТ НА ВЕРШИНІ ====================
   Пауза 2.6с: панорама хребтів (повільний дрейф), віньєтка + літербокс,
   заголовок «ВЕРШИНА!», полароїд опускається зверху і «зhangає» на мотузці. */
IB.SUMMIT=null;
IB.drawSummit=(g,dt)=>{
  const S=IB.SUMMIT;if(!S)return;
  /* v11: кіно-момент центрується на канві будь-якого розміру */
  const _w=VW(),_h=VH();
  g.save();g.fillStyle='#141c26';g.fillRect(0,0,_w,_h);
  g.translate(IB.M.round((_w-480)/2),IB.M.round((_h-336)/2));
  g.beginPath();g.rect(0,0,480,336);g.clip();
  /* t збільшується у головному циклі (loop) */
  const spot=S.spot,r=S.route;
  const wx=IB.G.wx.type;
  /* небо за погодою (з золотою годиною) */
  const gh=IB.goldenHour();
  const sky=g.createLinearGradient(0,0,0,336);
  if(wx==='sun'){sky.addColorStop(0,'#28598c');sky.addColorStop(1,'#a8c4d8');}
  else if(wx==='snow'||wx==='blizzard'){sky.addColorStop(0,'#8aa4b8');sky.addColorStop(1,'#d8e4ee');}
  else if(wx==='rain'||wx==='storm'){sky.addColorStop(0,'#3a4452');sky.addColorStop(1,'#7a8a98');}
  else {sky.addColorStop(0,'#5a6a7c');sky.addColorStop(1,'#b8c4cc');}
  g.fillStyle=sky;g.fillRect(0,0,480,336);
  /* сонце/місяць */
  const nf=IB.nightFactor();
  const cy=90+IB.M.sin(S.t*0.25)*4;
  g.fillStyle=nf>0.5?'#e8e8d8':(gh>0.4?'#f8c070':'#f8e8a0');
  g.beginPath();g.arc(392,cy,13,0,7);g.fill();
  if(nf<=0.5){g.fillStyle='rgba(248,232,160,0.18)';g.beginPath();g.arc(392,cy,22,0,7);g.fill();}
  /* хмари під ногами (над хмарами) для вершин */
  if(r.kind==='peak'){
    g.fillStyle='rgba(235,240,246,0.5)';
    for(let i=0;i<6;i++){
      const cx=((i*97+S.t*9)%560)-40, cyy=250+Math.sin(i*2.1)*24;
      g.beginPath();g.ellipse(cx,cyy,52,10,0,0,7);g.fill();
      g.beginPath();g.ellipse(cx+18,cyy-6,30,8,0,0,7);g.fill();
    }
  }
  /* панорама хребтів — 4 шари, повільний дрейф у протилежні боки */
  const drift=(i)=>Math.sin(S.t*0.14+i*1.7)*10*(i%2?1:-1);
  const rcols=nf>0.5?['#0c1626','#101e30','#16283e','#1e3450']
                     :(gh>0.4?['#5a3a50','#6a4a58','#7a5a60','#8a6a68']
                             :['#22405c','#2a5068','#32606c','#3e7272']);
  for(let i=0;i<4;i++){
    g.fillStyle=rcols[i];
    g.beginPath();g.moveTo(0,336);
    for(let x=0;x<=480;x+=12){
      const p=IB.hsh(i*100+(x/12|0),3,930+i);
      const base=120+i*44-S.t*3*(0.4+i*0.2);
      g.lineTo(x+drift(i),base-p*46);
    }
    g.lineTo(480,336);g.fill();
  }
  /* група на піку по центру з прапорцем */
  const px0=228,py0=206;
  for(let i=0;i<5;i++){
    const look=IB.HERO_DEFS[i]?IB.HERO_DEFS[i].look:null;
    IB.drawPerson(g,px0-24+i*12,py0+(i%2?2:0),'u',0,look||{skin:'#e0a878',hair:'#241a10',jacket:'#5a6a3a',pants:'#3a4030'},0.8);
  }
  IB.P(g,px0+30,py0-22,2,16,'#d8d8cc');
  const fw=IB.M.sin(S.t*3)*2;
  IB.PA(g,[[px0+32,py0-22],[px0+40+fw,py0-19],[px0+32,py0-15]],'#c83828');
  /* птахи */
  for(let i=0;i<3;i++){
    const bx=(S.t*26+i*120)%540-30,by=80+i*22+Math.sin(S.t*2+i)*5;
    g.strokeStyle='rgba(30,40,50,0.55)';g.lineWidth=1.4;
    const w2=Math.sin(S.t*7+i*2)*3;
    g.beginPath();g.moveTo(bx-5,by+w2);g.lineTo(bx,by);g.lineTo(bx+5,by+w2);g.stroke();
  }
  /* літербокс (кінотеатр) */
  g.fillStyle='#050805';g.fillRect(0,0,480,30);g.fillRect(0,306,480,30);
  /* віньєтка */
  const vg=g.createRadialGradient(240,168,120,240,168,340);
  vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(0,0,0,0.55)');
  g.fillStyle=vg;g.fillRect(0,0,480,336);
  /* заголовок */
  const a1=IB.M.min(1,S.t/0.5)*(S.t>2.1?IB.M.max(0,1-(S.t-2.1)/0.4):1);
  g.globalAlpha=a1;
  g.font='14px monospace';g.textAlign='center';
  g.fillStyle='#f8e8a0';
  g.fillText('✦ '+spot.name+' ✦',240,64);
  g.font='8px monospace';g.fillStyle='#e8f0e8';
  g.fillText((spot.alt?('ВИСОТА '+spot.alt+' М • '):'')+'ДЕНЬ '+IB.G.day+' • '+IB.clockStr(),240,78);
  g.globalAlpha=1;g.textAlign='left';
  /* полароїд: опускається зверху (0.4–1.1с), потім гойдається на «мотузці» */
  const ease=S.t<0.4?0:(S.t<1.1?1-Math.pow(1-(S.t-0.4)/0.7,2):1);
  const hangY=(S.t>=1.1)?(Math.sin((S.t-1.1)*2.4)*2):0;
  const ang=(S.t>=1.1)?Math.sin((S.t-1.1)*2.4)*0.06:0.12*(1-ease);
  const tY=-8+ease*(142+hangY);
  /* мотузка від верхньої кромки до полароїда */
  g.strokeStyle='#d8d8cc99';g.lineWidth=1;
  g.beginPath();g.moveTo(240,30);g.lineTo(240,tY-66);g.stroke();
  g.save();g.translate(240,tY);g.rotate(ang);
  g.fillStyle='#c8b888';g.fillRect(-3,-71,6,8);   /* прищіпка */
  const shots=IB.G.album.filter(a=>a.spot===spot.id&&a.day===IB.G.day);
  const si=IB.M.min(shots.length-1,IB.M.floor(S.t/1.25));
  IB.renderPhoto(g,shots.length?shots[si]:{name:spot.name,kind:spot.kind,day:IB.G.day,time:IB.clockStr(),wx:wx,seed:1,var:0},-56,-64,112,88,false);
  g.restore();
  /* підказка */
  if(S.t>1.2){
    g.font='7px monospace';g.textAlign='center';
    g.fillStyle='rgba(232,240,232,'+(0.55+0.35*Math.sin(S.t*4))+')';
    g.fillText('клік / E — далі • КАДР '+(si+1)+'/'+shots.length+' — в альбомі ✉',240,296);
    g.textAlign='left';
  }
  g.restore();
};

/* v3.0-gfx-patch */
