/* cars3.js — v23.0 «АВТО-РЕФЕРЕНС» поверх v22:
   гравець (раунд 25, скріншот «танка»): «авто ну шо це за авто — не те
   порендерив, кидаю референс, зроби нормальні автівки». Референси —
   пласко-векторні ізометричні машини (синій/жовтий седан, вантажівка):
   чисті ЗАОКРУГЛЕНІ форми без «рваних» граней, ТРИ пласкі тони (верх
   світлий / видимий бік основний / видимий торець темніший), ВЕЛИКЕ
   похиле лобове скло з відблиском, бічні вікна зі стійкою, чорні колеса
   з дисками під кузовом, м'яка тінь-ромб. Жодних 3-band тіней, куполів,
   бруду на чистих машинах — той самий стиль, що на референсах.
   Всі 4 напрями (se/sw/ne/nw — sw/nw дзеркала) + биті паркунки (_d).
   Ключі/розміри канви НЕ змінено — drawCar і pads працюють як було. */
(function(){
  const CAR_ASH='#54503f', CAR_RU='#9c5234';

  const CARS={
    /* ТТХ і пропорції; кольори — курортний парк Чорноморська */
    vaz:  {name:'ВАЗ-2101',  body:'#d8d2c4', roof:'#efece2', lt:2.75, wt:1.15, cab:[-0.30,0.42], trunk:[-1.0,-0.30], bodyH:9,  cabH:10, chrome:1},
    lanos:{name:'Lanos HB',  body:'#5c86c8', roof:'#7ba0dc', lt:2.7,  wt:1.15, cab:[-0.46,0.44], trunk:null,         bodyH:9,  cabH:10.5,hatch:1},
    suv:  {name:'Позашляховик',body:'#5e6e50',roof:'#7c8c6c',lt:2.9, wt:1.28, cab:[-0.62,0.26], trunk:null,         bodyH:12, cabH:10,  suv:1},
    truck:{name:'Пікап',     body:'#5e6472', roof:'#8a90a0', lt:3.4,  wt:1.2,  cab:[-0.05,0.40], trunk:null,         bodyH:10, cabH:8,   truck:1},
    van:  {name:'Фургон',    body:'#c8b890', roof:'#d8caa4', lt:3.1,  wt:1.3,  cab:[-0.75,1.0],  trunk:null,         bodyH:11, cabH:10,  van:1},
    /* МІСЬКИЙ АВТОБУС: довгий (3 осі), високий, смуга вікон */
    bus:  {name:'АВТОБУС МІСЬКИЙ', body:'#e8ecf0', roof:'#f4f6f8', lt:4.55, wt:1.34, cab:[0,0], trunk:null,
      bodyH:11, cabH:8, winH:7.5, boardC:'#e07038', stripeC:'#2a5aa0', bus:1},
    /* ТАКСІ «ЧОРНОМОРЕЦЬ» — жовтий седан з шашками і знаком на даху */
    taxi: {name:'Таксі «Чорноморець»', body:'#e2b23a', roof:'#f0c454', lt:2.75, wt:1.15, cab:[-0.30,0.42], trunk:[-1.0,-0.30], bodyH:9, cabH:10, taxi:1},
  };

  const P=IB.PAL;
  const CAR_CW=112, CAR_CH=76, CAR_GY=46;    /* центр, лінія землі (НЕ змінювати) */
  IB.CAR_ANCH=CAR_GY;

  /* ---- пласко-векторні помічники ---- */
  function rPath(g,pts,r){
    r=r===undefined?2.4:r;
    g.beginPath();
    const n=pts.length;
    for(let i=0;i<n;i++){
      const p0=pts[(i-1+n)%n],p1=pts[i],p2=pts[(i+1)%n];
      const v1x=p1[0]-p0[0],v1y=p1[1]-p0[1],l1=IB.M.hypot(v1x,v1y)||1;
      const v2x=p2[0]-p1[0],v2y=p2[1]-p1[1],l2=IB.M.hypot(v2x,v2y)||1;
      const rr=IB.M.min(r,l1*0.4,l2*0.4);
      const a=[p1[0]-v1x/l1*rr,p1[1]-v1y/l1*rr];
      const b=[p1[0]+v2x/l2*rr,p1[1]+v2y/l2*rr];
      if(i===0)g.moveTo(a[0],a[1]);else g.lineTo(a[0],a[1]);
      g.quadraticCurveTo(p1[0],p1[1],b[0],b[1]);
    }
    g.closePath();
  }
  function fp(g,pts,r,c){g.fillStyle=c;rPath(g,pts,r);g.fill();}
  function mixGray(hex,k){
    const n=parseInt(hex.slice(1),16),r=(n>>16)&255,gg=(n>>8)&255,b=n&255;
    const t=158,m=v=>IB.M.round(IB.lerp(v,t,k));
    return '#'+((IB.clamp(m(r),0,255)<<16)|(IB.clamp(m(gg),0,255)<<8)|IB.clamp(m(b),0,255)).toString(16).padStart(6,'0');
  }
  function mirrorC(src){
    const c=IB.mk(src.width,src.height),g=c.g;
    g.save();g.translate(src.width,0);g.scale(-1,1);g.drawImage(src,0,0);g.restore();
    return c;
  }

  function carCanvas(model,ne,damaged,bodyC,roofCP){
    const T=CARS[model];
    const c=IB.mk(CAR_CW,CAR_CH),g=c.g;
    const lt=T.lt,wt=T.wt;
    /* пів-вектори: A — уздовж (носом у +), B — поперек (видимий бік = +1) */
    const A=[8*lt,ne?-4*lt:4*lt], B=ne?[8*wt,4*wt]:[-8*wt,4*wt];
    const C=[CAR_CW/2,CAR_GY];
    const pt=(sa,sb,z)=>[C[0]+sa*A[0]+sb*B[0],C[1]+sa*A[1]+sb*B[1]-(z||0)];
    const vis=1, eEnd=ne?-1:1;      /* видимий торець: SE — ніс, NE — тил */
    let body=bodyC||T.body;
    if(damaged)body=mixGray(IB.shade(body,-0.14),0.55);
    const roofC=roofCP?(damaged?IB.shade(roofCP,-0.16):roofCP):(damaged?IB.shade(T.roof,-0.16):T.roof);
    const GL=damaged?'#20242e':'#3a455c';
    const GLd=damaged?'#161a22':'#2b3448';
    const GLhi=damaged?'#2e3644':'#5c6c88';
    const Sd=IB.shade(body,-0.13), Sl=IB.shade(body,0.17), Sk=IB.shade(body,-0.30);

    /* ---- 1. м'яка тінь-ромб ---- */
    fp(g,[pt(1.07,-1.12),pt(1.07,1.12),pt(-1.07,1.12),pt(-1.07,-1.12)],7,'rgba(8,12,18,0.28)');

    /* ---- 2. колеса видимого боку (чорні, з дисками, під кузовом) ---- */
    const ws=T.suv?5.2:4.7, hub=T.suv?2.8:2.5;
    const wb=T.bus?0.60:0.62;
    const axles=T.bus?[wb,0,-wb]:[wb,-wb];
    for(const ax of axles){
      const p=pt(ax,vis*0.94);
      g.fillStyle='#1e2228';g.beginPath();g.ellipse(p[0],p[1]-3.2,ws,3.4,0,0,7);g.fill();
      g.fillStyle='#c9d0d8';g.beginPath();g.ellipse(p[0],p[1]-3.2,hub,2.0,0,0,7);g.fill();
      g.fillStyle='#6e7884';g.beginPath();g.ellipse(p[0],p[1]-3.2,0.9,0.7,0,0,7);g.fill();
    }

    /* ---- 3. КУЗОВ за типами ---- */
    const bh=T.bodyH;
    if(T.truck){
      /* ПІКАП: капот → кабіна з похилим склом → вантажний кузов */
      fp(g,[pt(-1,vis,3),pt(1,vis,3),pt(1,vis,bh),pt(-1,vis,bh)],2.4,body);          /* бік бази */
      fp(g,[pt(eEnd,-1,3),pt(eEnd,1,3),pt(eEnd,1,bh),pt(eEnd,-1,bh)],2.4,Sd);        /* торець */
      fp(g,[pt(-1,-1,bh),pt(1,-1,bh),pt(1,1,bh),pt(-1,1,bh)],2.4,Sl);                /* верх бази */
      /* високий перед (капот) */
      fp(g,[pt(0.42,vis,3),pt(1,vis,3),pt(1,vis,bh*0.62),pt(0.42,vis,bh*0.62)],2.2,body);
      fp(g,[pt(1,-0.94,3),pt(1,0.94,3),pt(1,0.94,bh*0.62),pt(1,-0.94,bh*0.62)],2.2,Sd);
      fp(g,[pt(0.42,-0.94,bh*0.62),pt(1,-0.94,bh*0.62),pt(1,0.94,bh*0.62),pt(0.42,0.94,bh*0.62)],2.2,Sl);
      /* кабіна */
      const c0=-0.05,c1=0.40,zt=bh+T.cabH;
      fp(g,[pt(c0,vis,bh),pt(c1,vis,bh),pt(c1,vis,zt),pt(c0,vis,zt)],2.4,IB.shade(body,0.04));
      fp(g,[pt(c0,-0.86,bh),pt(c1,-0.86,bh),pt(c1,-0.86,zt),pt(c0,-0.86,zt)],2.4,IB.shade(body,-0.10));
      fp(g,[pt(c0,-0.86,zt),pt(c1,-0.86,zt),pt(c1,0.86,zt),pt(c0,0.86,zt)],2.6,roofC);
      if(!ne){ /* лобове скло — похиле, з відблиском */
        fp(g,[pt(c1,-0.74,zt),pt(c1,0.74,zt),pt(c1+0.30,0.66,bh+0.6),pt(c1+0.30,-0.66,bh+0.6)],1.6,GL);
        fp(g,[pt(c1,0.05,zt),pt(c1,0.62,zt),pt(c1+0.30,0.55,bh+0.6),pt(c1+0.30,0.02,bh+0.6)],1,GLhi);
      }
      fp(g,[pt(c1-0.34,vis,zt-1.2),pt(c0+0.10,vis,zt-1.2),pt(c0+0.06,vis,bh+1.6),pt(c1-0.06,vis,bh+1.6)],1.4,GL);
      /* борт кузова + темний вантаж */
      fp(g,[pt(-1,vis,3),pt(-0.10,vis,3),pt(-0.10,vis,bh*0.92),pt(-1,vis,bh*0.92)],2.2,body);
      fp(g,[pt(-1,-0.94,bh*0.92),pt(-0.10,-0.94,bh*0.92),pt(-0.10,0.94,bh*0.92),pt(-1,0.94,bh*0.92)],2.2,Sl);
      fp(g,[pt(-0.94,-0.74,bh*0.92),pt(-0.94,0.74,bh*0.92),pt(-0.16,0.74,bh*0.92),pt(-0.16,-0.74,bh*0.92)],1.6,'#2e2a22');
      fp(g,[pt(-0.94,vis,bh*0.92),pt(-0.16,vis,bh*0.92),pt(-0.16,vis,bh*0.92+1.6),pt(-0.94,vis,bh*0.92+1.6)],0.8,Sk);
      /* фари (SE) / ліхтарі (NE) */
      if(!ne){
        const h0=pt(0.995,-0.62,bh*0.62-1.6),h1=pt(0.995,0.62,bh*0.62-1.6);
        g.fillStyle='#f6ecc0';g.fillRect(h0[0]-1.5,h0[1]-1,3,2);g.fillRect(h1[0]-1.5,h1[1]-1,3,2);
        g.fillStyle=Sk;const gr=pt(1,0,bh*0.62-1.4);g.fillRect(gr[0]-2.5,gr[1]-0.5,5,1.4);
      }else{
        const r0=pt(-0.995,-0.60,bh*0.92-1.6),r1=pt(-0.995,0.60,bh*0.92-1.6);
        g.fillStyle='#d0453e';g.fillRect(r0[0]-1.5,r0[1]-1,3,2);g.fillRect(r1[0]-1.5,r1[1]-1,3,2);
      }
    } else if(T.bus){
      /* АВТОБУС: високий довгий бокс, смуга вікон, двері, смуга-оранж */
      const BH=bh+T.cabH;
      fp(g,[pt(-1,vis,3),pt(1,vis,3),pt(1,vis,BH),pt(-1,vis,BH)],3,body);
      fp(g,[pt(eEnd,-1,3),pt(eEnd,1,3),pt(eEnd,1,BH),pt(eEnd,-1,BH)],3,Sd);
      fp(g,[pt(-1,-1,BH),pt(1,-1,BH),pt(1,1,BH),pt(-1,1,BH)],3,roofC);
      /* смуга вікон видимого боку */
      fp(g,[pt(-0.92,vis,BH-2.5),pt(0.92,vis,BH-2.5),pt(0.92,vis,BH-8.5),pt(-0.92,vis,BH-8.5)],1.6,GL);
      for(let i=1;i<7;i++){
        const sa=-0.92+i*(1.84/7);
        const p0=pt(sa,vis,BH-2.5),p1=pt(sa,vis,BH-8.5);
        g.fillStyle=IB.shade(body,-0.28);g.fillRect(p0[0]-0.5,p1[1],1.1,p0[1]-p1[1]);
      }
      fp(g,[pt(-0.3,vis,BH-7.6),pt(0.92,vis,BH-6.4),pt(0.92,vis,BH-3.4),pt(-0.3,vis,BH-4.4)],1,GLhi);
      /* двері (передня і середня) */
      for(const ds of [0.52,-0.24]){
        fp(g,[pt(ds-0.10,vis,3),pt(ds+0.10,vis,3),pt(ds+0.10,vis,BH-2.5),pt(ds-0.10,vis,BH-2.5)],1,IB.shade(body,-0.18));
        fp(g,[pt(ds-0.06,vis,BH-3.6),pt(ds+0.06,vis,BH-3.6),pt(ds+0.06,vis,BH-7.6),pt(ds-0.06,vis,BH-7.6)],0.8,GL);
      }
      /* оранжева смуга по борту */
      fp(g,[pt(-0.92,vis,BH-10),pt(0.92,vis,BH-10),pt(0.92,vis,BH-12),pt(-0.92,vis,BH-12)],1,T.stripeC||'#2a5aa0');
      /* торці: лобове + маршрутна дошка (SE) / заднє вікно (NE) */
      if(!ne){
        fp(g,[pt(1,-0.80,BH-2.5),pt(1,0.80,BH-2.5),pt(1,0.80,BH-8.5),pt(1,-0.80,BH-8.5)],2,GL);
        fp(g,[pt(1,-0.3,BH-2.8),pt(1,0.8,BH-2.8),pt(1,0.8,BH-6.2),pt(1,-0.3,BH-5.4)],1,GLhi);
        fp(g,[pt(1,-0.85,BH-0.6),pt(1,0.85,BH-0.6),pt(1,0.85,BH-2.2),pt(1,-0.85,BH-2.2)],0.8,T.boardC||'#e07038');
        const h0=pt(1,-0.62,3.6),h1=pt(1,0.62,3.6);
        g.fillStyle='#f6ecc0';g.fillRect(h0[0]-1.4,h0[1]-1,2.6,2);g.fillRect(h1[0]-1.4,h1[1]-1,2.6,2);
      }else{
        fp(g,[pt(-1,-0.72,BH-3),pt(-1,0.72,BH-3),pt(-1,0.72,BH-7.6),pt(-1,-0.72,BH-7.6)],2,GL);
        const r0=pt(-1,-0.62,3.6),r1=pt(-1,0.62,3.6);
        g.fillStyle='#d0453e';g.fillRect(r0[0]-1.4,r0[1]-1,2.6,2);g.fillRect(r1[0]-1.4,r1[1]-1,2.6,2);
      }
    } else {
      /* ЛЕГКОВІ (vaz/lanos/suv/van/taxi): багажник → база → похиле скло */
      const trunkS=T.trunk;
      if(trunkS){
        fp(g,[pt(trunkS[0],vis,3),pt(trunkS[1],vis,3),pt(trunkS[1],vis,bh*0.82),pt(trunkS[0],vis,bh*0.82)],2.2,body);
        fp(g,[pt(trunkS[0],-1,3),pt(trunkS[1],-1,3),pt(trunkS[1],-1,bh*0.82),pt(trunkS[0],-1,bh*0.82)],2.2,Sd);
        fp(g,[pt(trunkS[0],-1,bh*0.82),pt(trunkS[1],-1,bh*0.82),pt(trunkS[1],1,bh*0.82),pt(trunkS[0],1,bh*0.82)],2.2,Sl);
      }
      const midS=trunkS?trunkS[1]:-1.0;
      fp(g,[pt(midS,vis,3),pt(T.cab[1],vis,3),pt(T.cab[1],vis,bh),pt(midS,vis,bh)],2.4,body);
      fp(g,[pt(midS,-1,3),pt(T.cab[1],-1,3),pt(T.cab[1],-1,bh),pt(midS,-1,bh)],2.4,Sd);
      fp(g,[pt(midS,-1,bh),pt(T.cab[1],-1,bh),pt(T.cab[1],1,bh),pt(midS,1,bh)],2.4,Sl);
      /* низький капот */
      fp(g,[pt(T.cab[1],vis,3),pt(0.985,vis,3),pt(0.985,vis,bh*0.66),pt(T.cab[1],vis,bh*0.66)],2.2,body);
      fp(g,[pt(T.cab[1],-1,3),pt(0.985,-1,3),pt(0.985,-1,bh*0.66),pt(T.cab[1],-1,bh*0.66)],2.2,Sd);
      fp(g,[pt(T.cab[1],-1,bh*0.66),pt(0.985,-1,bh*0.66),pt(0.985,1,bh*0.66),pt(T.cab[1],1,bh*0.66)],2.2,Sl);
      /* скід-лінія по видиому борту */
      fp(g,[pt(midS,vis,3),pt(0.985,vis,3),pt(0.985,vis,4.4),pt(midS,vis,4.4)],0.8,Sk);
      /* ---- САЛОН + СКЛО ---- */
      const c0=T.cab[0],c1=T.cab[1],zt=bh+T.cabH;
      const cabW=T.van?0.88:0.80;
      fp(g,[pt(c0,vis,bh),pt(c1,vis,bh),pt(c1,vis,zt),pt(c0,vis,zt)],2.6,IB.shade(body,0.04));
      fp(g,[pt(c0,-cabW,bh),pt(c1,-cabW,bh),pt(c1,-cabW,zt),pt(c0,-cabW,zt)],2.6,IB.shade(body,-0.10));
      if(!ne){
        /* лобове — ВЕЛИКЕ похиле з відблиском (референс) */
        fp(g,[pt(c1,-0.74,zt),pt(c1,0.74,zt),pt(c1+0.46,0.62,bh+0.6),pt(c1+0.46,-0.62,bh+0.6)],1.8,GL);
        fp(g,[pt(c1,-0.12,zt),pt(c1,0.62,zt),pt(c1+0.46,0.52,bh+0.6),pt(c1+0.46,-0.05,bh+0.6)],1,GLhi);
      }
      if(ne){
        /* заднє скло — видно тил */
        if(T.hatch){
          fp(g,[pt(c0,-0.72,zt),pt(c0,0.72,zt),pt(c0-0.10,0.66,bh+0.6),pt(c0-0.10,-0.66,bh+0.6)],1.8,GL);
        }else{
          fp(g,[pt(c0,-0.70,zt),pt(c0,0.70,zt),pt(c0-0.40,0.62,bh+0.6),pt(c0-0.40,-0.62,bh+0.6)],1.8,GL);
        }
      }
      /* бічні вікна + стійка */
      fp(g,[pt(c1-0.30,vis,zt-1.2),pt(c0+0.12,vis,zt-1.2),pt(c0+0.06,vis,bh+1.6),pt(c1-0.02,vis,bh+1.6)],1.4,GL);
      fp(g,[pt(c0+0.18,vis,zt-1.4),pt(c1-0.30,vis,zt-1.4),pt(c1-0.30,vis,zt-3.0),pt(c0+0.18,vis,bh+2.2)],1,GLhi);
      const pb=pt((c0+c1)/2,vis);
      g.fillStyle=IB.shade(body,-0.22);g.fillRect(pb[0]-0.5,pt((c0+c1)/2,vis,zt-1.4)[1],1,(T.cabH-2.8));
      /* дах */
      fp(g,[pt(c0,-cabW,zt),pt(c1,-cabW,zt),pt(c1,cabW,zt),pt(c0,cabW,zt)],3,roofC);
      /* фари (SE) / ліхтарі (NE) */
      if(!ne){
        const h0=pt(0.985,-0.55,bh*0.66-1.6),h1=pt(0.985,0.55,bh*0.66-1.6);
        g.fillStyle='#f6ecc0';g.fillRect(h0[0]-1.5,h0[1]-1,3,2);g.fillRect(h1[0]-1.5,h1[1]-1,3,2);
        const gr=pt(0.99,0,bh*0.66-1.4);g.fillStyle=Sk;g.fillRect(gr[0]-2.2,gr[1]-0.5,4.4,1.4);
        const bp=pt(0.99,0,3.8);g.fillStyle='#dde1e6';g.fillRect(bp[0]-3,bp[1]-0.7,6,1.6);
      }else{
        const r0=pt(-0.985,-0.55,bh*0.82-1.6),r1=pt(-0.985,0.55,bh*0.82-1.6);
        g.fillStyle='#d0453e';g.fillRect(r0[0]-1.5,r0[1]-1,3,2);g.fillRect(r1[0]-1.5,r1[1]-1,3,2);
        const bp=pt(-0.99,0,3.8);g.fillStyle='#dde1e6';g.fillRect(bp[0]-3,bp[1]-0.7,6,1.6);
      }
      /* дзеркало, ручка, дверна лінія */
      const m0=pt(c1,vis*0.92,zt-2.6);
      g.fillStyle=body;g.fillRect(m0[0]+(ne?1.5:-2.5),m0[1],2,2);
      const hd=pt(c0+0.30,vis,bh+3.4);g.fillStyle='#e8e8e2';g.fillRect(hd[0]-1,hd[1],2,1);
      const dl=pt(c0+0.04,vis);
      g.strokeStyle=IB.shade(body,-0.24);g.lineWidth=0.8;
      g.beginPath();g.moveTo(dl[0],dl[1]-bh-1);g.lineTo(dl[0],dl[1]-2);g.stroke();
      /* ТАКСІ: шашки по борту + знак на даху */
      if(T.taxi){
        for(let i=0;i<9;i++){
          const p=pt(0.82-i*0.20,vis*1.01,bh*0.42);
          g.fillStyle=i%2?'#16181e':'#f4f4f8';
          g.fillRect(p[0]-1,p[1]-1,2.2,2.2);
        }
        const ts=pt((c0+c1)/2,0,zt+0.6);
        IB.isoBox(g,ts[0]-4,ts[1]-1,8,4,4,'#f0bc42','#d8a834','#e07038');
        g.fillStyle='#1a201a';g.fillRect(ts[0]-2,ts[1]-5,4,1);
      }
      /* ПОЗАШЛЯХОВИК: багажник на даху + запаска */
      if(T.suv){
        fp(g,[pt(c0+0.06,-0.58,zt+0.8),pt(c1-0.06,-0.58,zt+0.8),pt(c1-0.06,-0.40,zt+0.8),pt(c0+0.06,-0.40,zt+0.8)],0.6,'#4e4438');
        fp(g,[pt(c0+0.06,0.40,zt+0.8),pt(c1-0.06,0.40,zt+0.8),pt(c1-0.06,0.58,zt+0.8),pt(c0+0.06,0.58,zt+0.8)],0.6,'#4e4438');
        for(let i=0;i<3;i++){
          const sa=c0+0.16+i*((c1-c0-0.32)/2);
          fp(g,[pt(sa,-0.58,zt+0.8),pt(sa,0.58,zt+0.8),pt(sa,0.58,zt+1.6),pt(sa,-0.58,zt+1.6)],0.5,'#3e362c');
        }
        if(ne){
          const sp=pt(eEnd,0,bh*0.62);
          g.fillStyle='#1e2228';g.beginPath();g.ellipse(sp[0],sp[1],3.4,3,0,0,7);g.fill();
          g.fillStyle='#c9d0d8';g.beginPath();g.ellipse(sp[0],sp[1],1.7,1.4,0,0,7);g.fill();
        }
      }
      /* хром-молдинг ВАЗ / Lanos-спойлер */
      if(T.chrome){
        fp(g,[pt(0.9,vis*1.02,bh*0.5),pt(-0.9,vis*1.02,bh*0.5),pt(-0.9,vis*1.02,bh*0.5+1),pt(0.9,vis*1.02,bh*0.5+1)],0.4,'#d8dce2');
      }
    }
    /* ---- бруд/іржа — тільки для битих паркунків ---- */
    if(damaged){
      IB.speck(g,C[0]-A[0]-B[0],C[1]-bh-2,IB.M.abs(A[0])*2+IB.M.abs(B[0])*2,bh+6,CAR_RU,12,7);
      IB.speck(g,C[0]-A[0]-B[0],C[1]-4,IB.M.abs(A[0])*2+IB.M.abs(B[0])*2,8,CAR_ASH,8,3);
      IB.P(g,C[0]-3,C[1]-bh-3,6,2,P.a1);
      IB.P(g,C[0]+7,C[1]-bh+2,4,2,P.gr1);
    }
    return c;
  }

  IB._carCanvas=carCanvas;   /* v23 debug: прямий доступ */
  /* ---------- РЕЄСТРАЦІЯ: 7 моделей × варіанти × 4 напрями × биті ----------
     Ключі car_<модель>[_<варіант>]_<напрям>[_d] — як у v21/v22. */
  const VARS={
    vaz:['#d8d2c4','#ee6444','#e8e8e2','#4a7ab8'],
    lanos:['#5c86c8','#3fa97b','#e8b23a'],
    suv:['#5e6e50','#ffb74b','#e0d8c8'],
    truck:['#5e6472','#3ca679','#8a4a38'],
    van:['#c8b890','#e9edf2','#9ab0c8'],
    bus:['#e8ecf0','#bcd8e8'],
    taxi:['#e2b23a'],
  };
  const VSUF=['','a','b','c'];
  IB.CARVARS={};
  IB.CARCOUNT=0;
  for(const mdl in CARS){
    const list=VARS[mdl]||[CARS[mdl].body];
    IB.CARVARS[mdl]=list.map((bc,vi)=>VSUF[vi]);
    list.forEach((bc,vi)=>{
      const key='car_'+mdl+(VSUF[vi]?'_'+VSUF[vi]:'');
      const rc=vi===0?null:IB.shade(bc,0.16);
      const se=carCanvas(mdl,false,false,bc,rc), ne=carCanvas(mdl,true,false,bc,rc);
      const seD=carCanvas(mdl,false,true,bc,rc), neD=carCanvas(mdl,true,true,bc,rc);
      IB.IMG[key+'_se']=se; IB.IMG[key+'_sw']=mirrorC(se);
      IB.IMG[key+'_ne']=ne; IB.IMG[key+'_nw']=mirrorC(ne);
      IB.IMG[key+'_se_d']=seD; IB.IMG[key+'_sw_d']=mirrorC(seD);
      IB.IMG[key+'_ne_d']=neD; IB.IMG[key+'_nw_d']=mirrorC(neD);
      IB.CARCOUNT+=8;
    });
  }
})();
