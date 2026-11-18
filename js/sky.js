/* sky.js — v20.0 «ІЗОХМАРИ • СВІТЛО НІЧНОГО МІСТА • ПОРТ-ІНДУСТРІЯ» (14-й модуль).
   Гравець (раунд 22): «давай добавимо в погоду ізометричні хмари — це повинно
   врятувати гру в плані візуального новшества; пропрацюй гарну картинку хмар;
   в різну погоду різні під різним кутом; темні, прозорі; пливуть; вітер —
   швидке; сонце немає або ледь-ледь; дощ — блискавки, мигає небо; ізометричне
   небо — хмари в русі додадуть динаміку і змінять трилогію по дизайну,
   добавлять атмосферу; інтенсивність хмарності від погодніх умов; вітер рух —
   швидкість; великий блок — дуже різноманітний і деталізований — малюй хмари
   круті».

   Що всередині:
   1) ВОКСЕЛЬНІ ІЗОХМАРИ — спрайти будуються з ізо-кубів (референс-арт гравця:
      стоси білих кубиків у ізометрії). 4 архетипи × 3 тони (яскраві/сірі/
      штормові) = 12 спрайтів: wisp (перисті), puff (пухнасті середні),
      cumulus (великі масиви), tower (штормові вежі з «наковальнею»).
      Кожен куб — верхня грань світла, ліва — середня, права — тінь + кромка;
      куби РІЗНОГО розміру (мультирозмір, як на референсі).
   2) ПОГОДА → ХМАРНІСТЬ: sun (мало, білі, повільно) / heat (рідкі перисті) /
      wind (швидкі, сильні пориви) / rain (сірі, щільно) /
      thunder (темні вежі) / storm (дуже темні, великі, швидкі + вітрило).
      Перехід плавний: хмари долітають/розтають, при зміні погоди — перетон.
   3) ВІТЕР: базова швидкість по погоді + синус-коливання + ПОРИВИ (gust):
      випадкові 0.8-2.5 с розгони ×1.8-3.2. windMul доступний для пальм.
   4) СОНЦЕ У ГОЛОВНОМУ ВИГЛЯДІ: диск з променями і ореолом, ховається
      по погоді (sun/heat повне, wind м'яке, rain — ледь-ледь крізь хмари,
      thunder/storm — немає) і заходить уночі; на золотій годині — тепле.
   5) БЛИСКАВКИ: thunder — часто (4-11 с), storm — 3.5-9 с + тряска, rain —
      рідкі далекі (20-40 с, слабкі). Зигзаг з гілками, двопульсне миготіння
      неба, ГРІМ (IB.SFX.thunder) із затримкою «по далечіні».
   6) ТІНІ ХМАР НА ЗЕМЛІ — м'які ромби-плями їдуть за хмарами.
   Хмари малюються в ОКРЕМИЙ шар-канвас (тонування ночі/золотої години через
   source-atop не чіпає світ), потім бліт на головний канвас. */
(function(){
  const M=IB.M;

  /* ---------- 1. ГЕНЕРАЦІЯ СПРАЙТІВ ХМАР (ізо-куби) ---------- */
  const TONES=[
    {top:'#ffffff', lt:'#eef2f6', rt:'#cfd9e4', edge:'#ffffff'},
    {top:'#dfe4ea', lt:'#c2c9d2', rt:'#9aa3af', edge:'#e8edf2'},
    {top:'#8d94a2', lt:'#6e7684', rt:'#4e5562', edge:'#9aa2b0'},
  ];
  function cube(g,x,y,w,d,h,t){
    IB.PA(g,[[x,y+d/2],[x+w/2,y],[x+w,y+d/2],[x+w/2,y+d]],t.top);
    IB.PA(g,[[x,y+d/2],[x+w/2,y+d],[x+w/2,y+d+h],[x,y+d/2+h]],t.lt);
    IB.PA(g,[[x+w/2,y+d],[x+w,y+d/2],[x+w,y+d/2+h],[x+w/2,y+d+h]],t.rt);
    g.strokeStyle=t.edge;g.globalAlpha=0.5;g.lineWidth=1;
    g.beginPath();g.moveTo(x,y+d/2);g.lineTo(x+w/2,y);g.lineTo(x+w,y+d/2);g.stroke();
    g.globalAlpha=1;
  }
  function buildCloud(seed,arch,tone){
    const t=TONES[tone];
    const rows=arch===0?2:(arch===1?3:(arch===2?4:5));
    const span=arch===0?4:(arch===1?5:(arch===2?7:6));
    const cells=[[0,0,0.9,1]];                   /* гарантія непорожнечі */
    for(let gy=0;gy<rows;gy++){
      const wRow=span-Math.abs(gy-(rows-1)/2)*1.6-(arch===3?gy*0.4:0);
      const n=Math.max(1,Math.round(wRow));
      for(let gx=0;gx<n;gx++){
        const h1=IB.hsh(gx*3+1,gy*7+2,seed*97);
        if(h1<(arch===0?0.42:0.14))continue;
        const lift=arch===3?(gy>=rows-2?IB.hsh(gx,gy,seed+5)*2:IB.hsh(gx,gy,seed+6)*1.2)
                           :IB.hsh(gx,gy,seed+5)*1.6;
        const sm=0.72+IB.hsh(gx,gy,seed+9)*0.5;
        cells.push([gx-(n-1)/2,gy,lift,sm]);
      }
    }
    const nTop=arch===0?1:(arch===1?2:(arch===2?3:2));
    for(let k=0;k<nTop;k++){
      const hx=(IB.hsh(k,1,seed+21)-0.5)*(arch===2?4:2);
      cells.push([hx,-0.9-IB.hsh(k,3,seed+22)*0.8,1.6+IB.hsh(k,4,seed+23)*1.4,0.6+IB.hsh(k,5,seed+24)*0.3]);
    }
    const CW=13,CD=6.5,CH=8;
    let minX=1e9,maxX=-1e9,minY=1e9,maxY=-1e9;
    for(const c of cells){
      const px=c[0]*CW,py=c[1]*CD*0.5-c[2]*CH;
      minX=Math.min(minX,px-CW);maxX=Math.max(maxX,px+CW*2);
      minY=Math.min(minY,py-CD);maxY=Math.max(maxY,py+CD+CH*2);
    }
    const W=Math.ceil(maxX-minX)+4,H=Math.ceil(maxY-minY)+6;
    const cnv=IB.mk(W,H),g=cnv.g;
    g.translate(-minX+2,-minY+3);
    cells.sort((a,b)=>(a[0]+a[1]*2)-(b[0]+b[1]*2));
    for(const c of cells){
      const px=c[0]*CW,py=c[1]*CD*0.5-c[2]*CH*0.9;
      cube(g,px,py,CW*c[2],CD*c[2],(CH*0.8*c[2]+CH*0.2)*(arch===3?1.15:1),t);
    }
    return cnv;
  }
  const SPR=[];
  for(let tone=0;tone<3;tone++)for(let arch=0;arch<4;arch++)SPR.push(buildCloud(3+tone*4+arch,arch,tone));
  const IDX=(tone,arch)=>tone*4+arch;

  /* ---------- 2. ПОЛЕ ХМАР (3 шари) ---------- */
  const SKY={
    clouds:[],
    _cur:{n:6,tone:0,spd:6,al:0.88},
    wind:{gust:0,gustT:2,mul:1,osc:0},
    flash:0,bolt:null,boltDura:0,boltNext:5,
    sun:{vis:1},
  };
  IB.SKY=SKY;

  function VW(){return (IB.GFX&&IB.GFX.VW)||480;}
  function VH(){return (IB.GFX&&IB.GFX.VH)||336;}

  function spawnCloud(init){
    const ly=IB.ri(0,2);
    const sc=[0.55,0.82,1.12][ly]*(0.72+IB.rnd(0,0.5));
    const tone=SKY._cur.tone;
    let arch=IB.ri(0,3);
    /* у негоду більше веж і масивів */
    if(tone>0&&arch===0&&IB.M.random()<0.5)arch=IB.ri(1,3);
    const spr=SPR[IDX(tone,arch)];
    const c={x:IB.rnd(-120,VW()+40),ly,spr,sc,
      /* v20: смуга хмар широка — пливуть і НАД МІСТОМ (не тільки над краєм
         мапи), близький шар — нижче і більший (динаміка на весь екран) */
      ty:IB.rnd(20,[80,140,205][ly]),
      sp:0.7+IB.rnd(0,0.6)+ly*0.2,
      al:init?SKY._cur.al:0,bob:IB.rnd(0,6.28),bobA:0.6+IB.rnd(0,1.2),
      dead:false,dx:0};
    c.y=c.ty+IB.rnd(-20,20);
    SKY.clouds.push(c);
  }

  /* ---------- 3. ПОГОДА → КОНФІГ ---------- */
  const WX_CFG={
    sun:   {n:6, tone:0, spd:6,  al:0.88, sun:1,    shadow:0.15},
    heat:  {n:3, tone:0, spd:4,  al:0.55, sun:1.08, shadow:0.10},
    wind:  {n:9, tone:0, spd:18, al:0.80, sun:0.80, shadow:0.14, gust:1},
    rain:  {n:13,tone:1, spd:12, al:0.82, sun:0.22, shadow:0.22},
    thunder:{n:15,tone:2,spd:10, al:0.90, sun:0,    shadow:0.30},
    storm: {n:17,tone:2, spd:21, al:0.95, sun:0,    shadow:0.36, gust:1},
  };
  SKY.cfg=()=>WX_CFG[IB.G.wx.type]||WX_CFG.sun;
  /* при зміні погоди — старий тон розтає, нові хмари приходять новим тоном */
  SKY.retone=function(){for(const cl of SKY.clouds)cl.dead=true;};

  /* ---------- 4. ТІК: вітер, дрейф, блискавки ---------- */
  SKY.tick=function(dt){
    const W=VW();
    const cfg=SKY.cfg();
    const c=SKY._cur,k=IB.M.min(1,dt*0.5);
    c.n+=(cfg.n-c.n)*k;c.al+=(cfg.al-c.al)*k;c.spd+=(cfg.spd-c.spd)*k;
    c.tone=cfg.tone;
    /* ВІТЕР */
    const w=SKY.wind;
    w.osc=IB.M.sin(performance.now()*0.0004)*0.35+IB.M.sin(performance.now()*0.0011)*0.15;
    w.gustT-=dt;
    if(w.gustT<=0){
      if(w.gust>0){w.gust=0;w.gustT=IB.rnd(2.5,7)/(cfg.gust?1.6:1);}
      else{w.gust=IB.rnd(1.8,3.2);w.gustT=IB.rnd(0.8,2.5);}
    }
    if(w.gust>0)w.gust=IB.M.max(0,w.gust-dt*0.25);
    w.mul=1+w.osc*(cfg.gust?0.5:0.2)+w.gust*(cfg.gust?0.85:0.35);
    const spd=c.spd*w.mul;
    /* популяція */
    const want=Math.round(c.n);
    let live=0;for(const cl of SKY.clouds)if(!cl.dead)live++;
    if(live<want&&SKY.clouds.length<want+2)spawnCloud(false);
    else if(live>want){
      const cand=SKY.clouds.filter(cl=>!cl.dead);
      if(cand.length)cand[(IB.M.random()*cand.length)|0].dead=true;
    }
    /* дрейф */
    for(let i=SKY.clouds.length-1;i>=0;i--){
      const cl=SKY.clouds[i];
      cl.x+=spd*cl.sp*dt*(0.85+cl.sc*0.3);
      cl.y=cl.ty+IB.M.sin(performance.now()*0.0006*cl.bobA+cl.bob)*4+IB.M.sin(performance.now()*0.0016+cl.bob*2)*1.5;
      cl.dx+=spd*cl.sp*dt*0.55;
      if(cl.al<c.al&&!cl.dead)cl.al=IB.M.min(c.al,cl.al+dt*0.35);
      if(cl.dead){cl.al-=dt*0.3;if(cl.al<=0){SKY.clouds.splice(i,1);continue;}}
      if(cl.x>VW()+150){cl.x=-cl.spr.width*cl.sc-IB.rnd(30,120);cl.y=cl.ty+IB.rnd(-14,14);}
    }
    /* СОНЦЕ */
    const nf=IB.nightFactor();
    const sunDay=IB.clamp(1-nf*1.9,0,1);
    SKY.sun.vis+=((cfg.sun||0)*sunDay-SKY.sun.vis)*IB.M.min(1,dt*0.7);

    /* БЛИСКАВКИ */
    const wt=IB.G.wx.type;
    const litOn=(wt==='thunder'||wt==='storm'||wt==='rain');
    SKY.boltNext-=dt;
    if(SKY.flash>0)SKY.flash=IB.M.max(0,SKY.flash-dt*2.6);
    if(SKY.boltDura>0){SKY.boltDura-=dt;if(SKY.boltDura<=0)SKY.bolt=null;}
    if(litOn&&SKY.boltNext<=0){
      const dist=IB.rnd(0,1);
      const strong=wt==='thunder'?0.85:(wt==='storm'?1:0.42);
      const inten=IB.clamp(strong*(1-dist*0.45),0,1);
      SKY.flash=inten;
      if(inten>0.3){
        const bx=IB.rnd(VW()*0.12,VW()*0.88);
        const pts=[];let px=bx,py=IB.rnd(6,26);
        const steps=4+(IB.M.random()*3|0);
        const endY=IB.rnd(VH()*0.30,VH()*0.52);
        for(let s2=0;s2<=steps;s2++){
          pts.push([px,py]);
          px+=(IB.M.random()-0.5)*46;py+=(endY-py)/(steps-s2+1);
        }
        const brs=[];
        for(let b2=0;b2<IB.ri(1,2);b2++){
          const st=pts[1+((IB.M.random()*(pts.length-2))|0)];
          brs.push([[st[0],st[1]],[st[0]+IB.rnd(-34,34),st[1]+IB.rnd(14,30)]]);
        }
        SKY.bolt={pts,brs};SKY.boltDura=0.26+IB.M.random()*0.12;
      }
      const thD=(dist*1.6+0.25)*1000;
      setTimeout(()=>{try{IB.SFX.thunder&&IB.SFX.thunder(1-dist*0.55);}catch(e){}},thD);
      if(wt==='storm'&&inten>0.55)IB.GFX.shake=IB.M.max(IB.GFX.shake||0,0.4*inten);
      SKY.boltNext=wt==='thunder'?IB.rnd(4,11):(wt==='storm'?IB.rnd(3.5,9):IB.rnd(20,40));
    }
    if(!litOn)SKY.boltNext=IB.rnd(3,7);
  };

  /* ---------- 5. ШАР ХМАР (окремий канвас → бліт) ---------- */
  SKY._layer=null;
  SKY.draw=function(g){
    const W=VW(),H=VH();
    if(!SKY._layer||SKY._layer.width!==W||SKY._layer.height!==H){
      SKY._layer=IB.mk(W,H);
    }
    const nf=IB.nightFactor();
    const gh=IB.goldenHour();
    const nightK=IB.clamp(nf*1.15,0,1);
    /* ---- СОНЦЕ (за хмарами, прямо на канвасі) ---- */
    if(SKY.sun.vis>0.02){
      const sx=W*0.80,sy=H*0.15;
      const vis=SKY.sun.vis;
      const warm=gh>0.15;
      const r=13+vis*3;
      const halo=g.createRadialGradient(sx,sy,r*0.5,sx,sy,r*4.2);
      const hcol=warm?'255,190,90':'255,244,200';
      halo.addColorStop(0,'rgba('+hcol+','+(0.30*vis).toFixed(3)+')');
      halo.addColorStop(0.5,'rgba('+hcol+','+(0.10*vis).toFixed(3)+')');
      halo.addColorStop(1,'rgba(0,0,0,0)');
      g.fillStyle=halo;g.beginPath();g.arc(sx,sy,r*4.2,0,7);g.fill();
      g.fillStyle=warm?'rgba(255,214,120,'+(0.85*vis).toFixed(3)+')':'rgba(255,248,214,'+(0.9*vis).toFixed(3)+')';
      g.beginPath();g.arc(sx,sy,r,0,7);g.fill();
      g.fillStyle=warm?'rgba(255,238,170,'+(0.9*vis).toFixed(3)+')':'rgba(255,255,238,'+(0.92*vis).toFixed(3)+')';
      g.beginPath();g.arc(sx,sy,r*0.66,0,7);g.fill();
      g.strokeStyle='rgba('+hcol+','+(0.28*vis).toFixed(3)+')';g.lineWidth=1.4;
      const rot=performance.now()*0.00012;
      for(let i=0;i<10;i++){
        const a=rot+i*0.628;
        g.beginPath();g.moveTo(sx+Math.cos(a)*(r+3),sy+Math.sin(a)*(r+3));
        g.lineTo(sx+Math.cos(a)*(r+8+vis*3),sy+Math.sin(a)*(r+8+vis*3));g.stroke();
      }
    }
    /* ---- ХМАРИ → шар ---- */
    const L=SKY._layer,lg=L.g;
    lg.clearRect(0,0,W,H);
    let any=false;
    for(const cl of SKY.clouds){
      if(cl.al<=0.01)continue;
      any=true;
      const spr=cl.spr,dw=spr.width*cl.sc,dh=spr.height*cl.sc;
      lg.globalAlpha=IB.clamp(cl.al,0,1);
      lg.drawImage(spr,cl.x,cl.y,dw,dh);
    }
    lg.globalAlpha=1;
    if(any){
      /* тонування шару (тільки хмари, світ не чіпається) */
      if(nightK>0.45){
        lg.globalCompositeOperation='source-atop';
        lg.fillStyle='rgba(10,16,34,'+(0.52*nightK).toFixed(3)+')';
        lg.fillRect(0,0,W,H);
        /* місячні кромки — верх кожної хмари трохи підсвічений */
        for(const cl of SKY.clouds){
          if(cl.al<=0.01)continue;
          const spr=cl.spr,dw=spr.width*cl.sc;
          lg.fillStyle='rgba(150,170,215,'+(0.14*nightK*cl.al).toFixed(3)+')';
          lg.fillRect(cl.x,cl.y,dw,Math.max(3,spr.height*cl.sc*0.13));
        }
        lg.globalCompositeOperation='source-over';
      }else if(gh>0.12){
        lg.globalCompositeOperation='source-atop';
        lg.fillStyle='rgba(255,180,110,'+(0.34*gh).toFixed(3)+')';
        lg.fillRect(0,0,W,H);
        lg.globalCompositeOperation='source-over';
      }
      g.drawImage(L,0,0);
    }
    /* ---- БЛИСКАВКА (над хмарами) ---- */
    if(SKY.bolt){
      const b=SKY.bolt;
      g.save();
      g.strokeStyle='rgba(190,215,255,0.5)';g.lineWidth=4.5;
      g.beginPath();g.moveTo(b.pts[0][0],b.pts[0][1]);for(let i=1;i<b.pts.length;i++)g.lineTo(b.pts[i][0],b.pts[i][1]);g.stroke();
      g.strokeStyle='rgba(255,255,255,0.95)';g.lineWidth=1.6;
      g.beginPath();g.moveTo(b.pts[0][0],b.pts[0][1]);for(let i=1;i<b.pts.length;i++)g.lineTo(b.pts[i][0],b.pts[i][1]);g.stroke();
      for(const br of b.brs){
        g.strokeStyle='rgba(220,235,255,0.7)';g.lineWidth=1.2;
        g.beginPath();g.moveTo(br[0][0],br[0][1]);g.lineTo(br[1][0],br[1][1]);g.stroke();
      }
      g.restore();
    }
    /* ---- МИГОТІННЯ НЕБА ---- */
    if(SKY.flash>0.02){
      const f=SKY.flash;
      g.fillStyle='rgba(210,225,255,'+(0.34*f).toFixed(3)+')';g.fillRect(0,0,W,H);
      g.fillStyle='rgba(255,255,255,'+(0.22*f).toFixed(3)+')';g.fillRect(0,0,W,H*0.6);
    }
  };

  /* ---------- 6. ТІНІ ХМАР НА ЗЕМЛІ ---------- */
  SKY.drawShadows=function(g){
    const cfg=SKY.cfg();
    const W=VW(),H=VH();
    for(const cl of SKY.clouds){
      if(cl.al<=0.05)continue;
      const sc=cl.sc*(0.7+cl.ly*0.25);
      const rw=46*sc,rh=16*sc;
      const sxp=cl.x-cl.dx*0.6, syp=(cl.ty*2.4+30)%H;
      for(let rep=-1;rep<=1;rep++){
        const cx2=sxp+rep*W;
        if(cx2<-rw*2||cx2>W+rw*2)continue;
        g.fillStyle='rgba(12,22,34,'+(cl.al*(cfg.shadow||0.15)*(0.5+cl.ly*0.3)).toFixed(3)+')';
        g.beginPath();g.ellipse(cx2,syp,rw,rh,0,0,7);g.fill();
        g.fillStyle='rgba(12,22,34,'+(cl.al*(cfg.shadow||0.15)*0.5).toFixed(3)+')';
        g.beginPath();g.ellipse(cx2+rw*0.4,syp+rh*0.5,rw*0.7,rh*0.6,0,0,7);g.fill();
      }
    }
  };

  for(let i=0;i<6;i++)spawnCloud(true);
})();
