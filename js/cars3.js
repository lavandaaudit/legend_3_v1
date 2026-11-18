/* cars3.js — v19.0 «АВТО ЧИСТІ» — батч 12 поверх v18.7 «ПЕРЕРЕНДЕР АВТО»:
   гравець: «авто рендерятся — перевір, бо якісь дивні». Аудит знайшов і
   ВИПРАВИВ: 1) автобус — смуга вікон була ГОРИЗОНТАЛЬНОЮ (не по ізоосі) і
   малювалась на обох боках (дальня просвічувала крізь дах) → тепер
   паралелограм строго на видиому борту; колісні осі ±0.62 виходили ЗА
   кузов (база ±0.5) → ТРИ ОСІ всередині бази (±0.34/0); маршрутна дошка
   не «плаває» над дахом; фари — на видиому торці (SE — ніс, NE — тил із
   задніми ліхтарями і заднім вікном); 2) легкові: лобове скло малювалось
   ПОНАД ДАХОМ у NE (скло дальнього торця «просвічувало» крізь дах — темні
   плями) і заднє — у SE; тепер скло/фари/ліхтарі/дзеркала — ЛИШЕ на
   ВИДИМИХ гранях (SE — ніс+лобове, NE — тил+заднє скло). Еталон ч.1:
   сегментний кузов, похиле скло, арки, бампери, опуклий дах; 4 напрями
   _se/_sw/_nw/_ne (se/ne малюються, nw/sw — дзеркала) + кольорові
   варіанти трафіку. Силуети і палітра без змін, сейви сумісні. */
(function(){
  const M=IB.M;
  const CAR_ASH='#54503f', CAR_RU='#9c5234';  /* палітра ч.1 (ash2/ru1) */

  const CARS={
    /* ТТХ і пропорції — еталон legend_v5; кольори під Чорноморськ */
    vaz:  {name:'ВАЗ-2101',  body:'#d8d2c4', roof:'#efece2', lt:2.75, wt:1.15, cab:[-0.30,0.42], trunk:[-1.0,-0.30], bodyH:9,   cabH:10,  chrome:1},
    lanos:{name:'Lanos HB',  body:'#5c86c8', roof:'#7ba0dc', lt:2.7,  wt:1.15, cab:[-0.46,0.44], trunk:null,         bodyH:9,   cabH:10.5,hatch:1},
    suv:  {name:'Позашляховик',body:'#5e6e50',roof:'#7c8c6c',lt:2.9,  wt:1.28, cab:[-0.62,0.26], trunk:null,         bodyH:11,  cabH:11,  suv:1},
    truck:{name:'Пікап',     body:'#5e6472', roof:'#8a90a0', lt:3.4,  wt:1.2,  cab:[0.0,0.0],    trunk:null,         bodyH:11,  cabH:10,  truck:1},
    van:  {name:'Фургон',    body:'#c8b890', roof:'#d8caa4', lt:3.1,  wt:1.3,  cab:[-0.58,0.28], trunk:null,         bodyH:11,  cabH:11,  van:1},
    /* МІСЬКИЙ АВТОБУС: довгий (3 осі), високий, смуга вікон */
    bus:  {name:'АВТОБУС МІСЬКИЙ', body:'#e8ecf0', roof:'#f4f6f8', lt:4.55, wt:1.34, cab:[0,0], trunk:null,
      bodyH:11, cabH:8, winH:7.5, boardC:'#e07038', stripeC:'#2a5aa0', bus:1},
  };

  const P=IB.PAL;
  const CAR_CW=112, CAR_CH=76, CAR_GY=46;    /* центр, лінія землі */
  IB.CAR_ANCH=CAR_GY;
  function slab(g,C,A,B,z0,h,cols){
    const cr=(sa,sb)=>[C[0]+sa*A[0]+sb*B[0],C[1]+sa*A[1]+sb*B[1]];
    const F1=cr(1,-1),F2=cr(1,1),R2=cr(-1,1),R1=cr(-1,-1);
    const up=p=>[p[0],p[1]-z0],dn=(p)=>[p[0],p[1]-z0+h];
    const faces=[
      {q:[up(F1),up(F2),dn(F2),dn(F1)],y:(F1[1]+F2[1])/2,c:cols[0]},   /* передня */
      {q:[up(F2),up(R2),dn(R2),dn(F2)],y:(F2[1]+R2[1])/2,c:cols[1]},   /* права */
      {q:[up(R2),up(R1),dn(R1),dn(R2)],y:(R2[1]+R1[1])/2,c:cols[2]},   /* задня */
      {q:[up(R1),up(F1),dn(F1),dn(R1)],y:(R1[1]+F1[1])/2,c:cols[3]},   /* ліва */
    ];
    faces.sort((a,b)=>a.y-b.y);
    for(const f of faces)IB.PA(g,f.q,f.c);
    IB.PA(g,[up(F1),up(F2),up(R2),up(R1)],cols[4]);
  }
  function mirrorC(src){
    const c=IB.mk(src.width,src.height),g=c.g;
    g.save();g.translate(src.width,0);g.scale(-1,1);g.drawImage(src,0,0);g.restore();
    return c;
  }
  /* СЕГМЕНТ кузова: slab у діапазоні s0..s1 (уздовж осі), висота h над z0 */
  function seg(g,C,A,B,s0,s1,z0,h,body,sh){
    const cc=[C[0]+A[0]*(s0+s1)/2,C[1]+A[1]*(s0+s1)/2];
    const aa=[A[0]*(s1-s0),A[1]*(s1-s0)];
    const bb=[B[0]*0.96,B[1]*0.96];
    slab(g,cc,aa,bb,z0,h,[sh[0],sh[1],sh[2],sh[1],IB.shade(body,0.14)]);
  }
  /* ---- ОПУКЛІСТЬ (батч 11): дах-купол, вигнуті борти, пояс, м'яка тінь ---- */
  function roofDome(g,cr,s0,s1,zTop,roofC,wS){
    const dn=p=>[p[0],p[1]-zTop];
    IB.PA(g,[dn(cr(s0,-wS)),dn(cr(s1,-wS)),dn(cr(s1,wS)),dn(cr(s0,wS))],IB.shade(roofC,-0.30));
    IB.PA(g,[dn(cr(s0+0.10,-wS*0.66)),dn(cr(s1-0.10,-wS*0.66)),dn(cr(s1-0.10,wS*0.66)),dn(cr(s0+0.10,wS*0.66))],IB.shade(roofC,0.13));
    const mx=(s0+s1)/2;
    IB.PA(g,[dn(cr(mx-0.12,-wS*0.44)),dn(cr(mx+0.16,-wS*0.44)),dn(cr(mx+0.16,wS*0.08)),dn(cr(mx-0.12,wS*0.08))],IB.shade(roofC,0.36));
  }
  function flankShade(g,cr,s0,s1,hTop,visSd,bodyC){
    const p0=cr(s0,visSd),p1=cr(s1,visSd);
    const band=(f0,f1,c)=>IB.PA(g,[[p0[0],p0[1]-hTop*f0],[p1[0],p1[1]-hTop*f0],[p1[0],p1[1]-hTop*f1],[p0[0],p0[1]-hTop*f1]],c);
    band(0.0,0.30,IB.shade(bodyC,-0.12));
    band(0.30,0.68,IB.shade(bodyC,-0.32));
    band(0.68,0.88,IB.shade(bodyC,-0.50));
    band(0.88,1.0,IB.shade(bodyC,-0.68));
    IB.PA(g,[[p0[0],p0[1]-hTop],[p1[0],p1[1]-hTop],[p1[0],p1[1]-hTop+1.4],[p0[0],p0[1]-hTop+1.4]],IB.shade(bodyC,0.34));
  }
  function roundShadow(g,cr){
    const q=[[1,-0.84],[0.92,-1],[-0.92,-1],[-1,-0.84],[-1,0.84],[-0.92,1],[0.92,1],[1,0.84]].map(s=>cr(s[0],s[1]));
    g.fillStyle='rgba(8,10,16,0.38)';
    g.beginPath();g.moveTo(q[0][0],q[0][1]);for(let i=1;i<8;i++)g.lineTo(q[i][0],q[i][1]);g.closePath();g.fill();
  }

  function carCanvas(model,ne,damaged,bodyC,roofCP){
    const T=CARS[model];
    const c=IB.mk(CAR_CW,CAR_CH),g=c.g;
    const C=[CAR_CW/2,CAR_GY];
    const lt=T.lt,wt=T.wt;
    /* пів-вектори осі (A) та попереку (B) у екранних пікселях.
       NE: вісь (0,-1) → (16,-8)/тайл; поперек — світовий ±x → (±16,8).
       SE: вісь (1,0) → (16,8); поперек — світовий ±y → (∓16,8) */
    const A=[8*lt,ne?-4*lt:4*lt], B=ne?[8*wt,4*wt]:[-8*wt,4*wt];
    const cr=(sa,sb)=>[C[0]+sa*A[0]+sb*B[0],C[1]+sa*A[1]+sb*B[1]];
    const body=damaged?IB.shade(bodyC||T.body,-0.12):(bodyC||T.body);
    const GL=damaged?'#141820':(T.glass||'#42485a');
    const GL2=damaged?'#141820':(T.glass||'#565e74');
    const roofC=roofCP||T.roof;
    /* v19: видимий бік — ДЛЯ ОБОХ напрямів sb=+1 (у SE дальній бік був
       «дзеркальний» −1 — скло/дзеркала/арки малювались на прихованій грані
       і просвічували крізь дах — ті самі «дивні» плями). Видимий торець
       (eEnd) не міняється: SE — ніс, NE — тил. */
    const visSd=1;
    const eEnd=ne?-1:1;                         /* видимий торець: для NE видно ТИЛ, для SE — НІС */
    /* закруглена тінь-ромб під авто (зрізані кути — м'який силует) */
    roundShadow(g,cr);
    /* колеса з дисками — v19: ОСІ В КОРПУСІ (у автобуса ±0.62 виходили за
       базу ±0.5 — «колеса за кормою»; тепер ТРИ ОСІ ±0.34/0 всередині) */
    const wb=T.bus?0.34:(T.suv?0.60:0.62),ws=1.0;
    const axles=T.bus?[0.34,0,-0.34]:[wb,-wb];
    const wheel=(sa,sb)=>{const p=cr(sa,sb);IB.O(g,p[0],p[1]-2,4.4,3,P.d01);IB.O(g,p[0],p[1]-2,2.4,1.6,P.gr1);IB.O(g,p[0],p[1]-2,1,0.7,P.m3);};
    for(const ax of axles){wheel(ax,-ws);wheel(ax,ws);}
    if(T.truck){wheel(-0.1,-ws);wheel(-0.1,ws);}
    /* ---- КУЗОВ ІЗ СЕГМЕНТІВ (силует!) ---- */
    const bh=T.bodyH;
    const s1d=IB.shade(body,-0.16),s2d=IB.shade(body,-0.34),s3d=IB.shade(body,-0.46),sh=[s1d,s2d,s3d];
    if(T.truck){
      /* ПІКАП: кабіна спереду (капот низький + салон) + вантажний кузов з ребрами */
      seg(g,C,A,B,0.28,1.0,0,bh*0.62,body,sh);                    /* капот */
      seg(g,C,A,B,-0.12,0.28,0,bh,body,sh);                        /* кабіна-база */
      const cabA=[A[0]*0.40,A[1]*0.40],cabC=[C[0]+A[0]*0.08,C[1]+A[1]*0.08],cabB=[B[0]*0.82,B[1]*0.82];
      slab(g,cabC,cabA,cabB,bh,T.cabH,[s1d,s2d,s3d,s2d,roofC]);
      const bedA=[A[0]*0.78,A[1]*0.78],bedC=[C[0]-A[0]*0.11,C[1]-A[1]*0.11],bedB=[B[0],B[1]];
      seg(g,C,A,B,-1.0,-0.12,0,bh*0.88,body,sh);                   /* дно кузова */
      const bw=3.4;
      slab(g,[bedC[0],bedC[1]],bedA,[bedB[0],bedB[1]],bh*0.88,bw,[s1d,s2d,s3d,s2d,IB.shade(body,-0.24)]);
      flankShade(g,cr,0.30,1.0,bh*0.62,visSd,body);
      flankShade(g,cr,-0.12,0.28,bh,visSd,body);
      flankShade(g,cr,-1.0,-0.12,bh*0.88,visSd,body);
      roofDome(g,cr,-0.10,0.24,bh+T.cabH,roofC,0.70);
      /* ребра на видимому борту */
      for(let i=0;i<3;i++){
        const p0=cr(-0.24-i*0.22,visSd*0.97),p1=cr(-0.24-i*0.22,visSd*0.45);
        IB.P(g,IB.M.min(p0[0],p1[0]),IB.M.min(p0[1],p1[1])-bh*0.88,1,bw+1,IB.shade(body,-0.4));
      }
      /* темний вантаж над бортом */
      IB.PA(g,[cr(-0.9,visSd*0.5).map((v,i)=>i?v-bh*0.88-bw:v),cr(-0.15,visSd*0.5).map((v,i)=>i?v-bh*0.88-bw:v)],'#2c2419');
      /* дуги тенту */
      for(let i=0;i<3;i++){const p=cr(-0.32-i*0.26,0);IB.P(g,p[0]-1,p[1]-bh*0.88-bw-4,2,4,P.gr1);}
      /* вітрове скло кабіни — v19: ТІЛЬКИ SE (у NE закрите дахом) */
      if(!ne){
        const w0=cr(0.28,visSd*0.62),w1=cr(0.28,-visSd*0.62);
        IB.PA(g,[[w0[0],w0[1]-bh-T.cabH+3],[w1[0],w1[1]-bh-T.cabH+3],[w1[0],w1[1]-bh-3],[w0[0],w0[1]-bh-3]],GL);
      }
      /* дзеркало видимого боку */
      const m0=cr(0.28,visSd*0.82);
      IB.P(g,m0[0]+(ne?2:-2),m0[1]-bh-T.cabH+3,2,2,body);IB.P(g,m0[0]+(ne?3:-3),m0[1]-bh-T.cabH+2,1,1,P.gr4);
      /* v19: решітка+фари — ТІЛЬКИ ніс (SE); задні ліхтарі — ТІЛЬКИ тил (NE) */
      if(!ne){
        const g0=cr(1.0,0);
        IB.P(g,g0[0]-3,g0[1]-bh*0.62+1,6,2,IB.shade(body,-0.5));
        const hl=cr(0.98,-0.5),hr=cr(0.98,0.5);
        IB.P(g,hl[0]-1,hl[1]-bh*0.62+2,3,2,P.y3);IB.P(g,hr[0]-1,hr[1]-bh*0.62+2,3,2,P.y3);
      }else{
        const rl=cr(-0.98,-0.55),rr=cr(-0.98,0.55);
        IB.P(g,rl[0]-1,rl[1]-bh*0.88+1,2,2,P.rd3);IB.P(g,rr[0]+1,rr[1]-bh*0.88+1,2,2,P.rd3);
      }
    } else if(T.bus){
      /* ===== МІСЬКИЙ АВТОБУС — високий довгий кузов, смуга вікон ТІЛЬКИ на
         видиому борту (паралелограм по ізоосі), ТРИ ОСІ всередині бази,
         двері, маршрутна дошка в площині торця ===== */
      const BH=T.bodyH+T.cabH;
      /* v19 КЛЮЧОВИЙ ФІКС: кузов малюється ВГОРУ від базової лінії (z0=BH),
         як кабіна легкових — раніше z0=0 «опускав» кузов ПІД лінію, а всі
         деталі (вікна/двері/дошка) рахувались над нею → смуга вікон
         «плавала» над дахом, колеса визирали зверху. Тепер усе на місці. */
      seg(g,C,A,B,-0.5,0.5,BH,BH,body,sh);   /* половинні межі дають повну довжину */
      /* смуга вікон: рамка + скло + стійки — ПАРАЛЕЛОГРАМ вздовж ізоосі */
      const busWin=(sb)=>{
        const p0=cr(-0.94,sb),p1=cr(0.94,sb);
        const off=2.5, winH=T.winH;
        const t0=[p0[0],p0[1]-BH+off], t1=[p1[0],p1[1]-BH+off];
        IB.PA(g,[[t0[0],t0[1]],[t1[0],t1[1]],[t1[0],t1[1]+winH],[t0[0],t0[1]+winH]],IB.shade(body,-0.42));
        const ins=t1[0]>t0[0]?1:-1;
        IB.PA(g,[[t0[0]+ins,t0[1]+1],[t1[0]-ins,t1[1]+1],[t1[0]-ins,t1[1]+winH-1],[t0[0]+ins,t0[1]+winH-1]],GL);
        for(let i=1;i<7;i++){
          const k=i/7;
          const sx=t0[0]+(t1[0]-t0[0])*k, sy=t0[1]+(t1[1]-t0[1])*k;
          IB.P(g,sx-0.6,sy+1,1.2,winH-2,IB.shade(body,-0.30));
        }
      };
      busWin(visSd);   /* v19: ТІЛЬКИ видимий бік — дальня смуга просвічувала крізь дах */
      /* торець: SE — лобове скло + маршрутна дошка; NE — заднє вікно */
      const gB=cr(eEnd*0.985,0);
      if(!ne){
        IB.PA(g,[[gB[0]-4,gB[1]-BH+2.5],[gB[0]+4,gB[1]-BH+2.5],[gB[0]+3.2,gB[1]-BH+2.5+T.winH],[gB[0]-3.2,gB[1]-BH+2.5+T.winH]],GL2);
        IB.P(g,gB[0]-4.5,gB[1]-BH+0.2,9,2.2,T.boardC||'#e07038');
      }else{
        IB.PA(g,[[gB[0]-3.6,gB[1]-BH+2.5],[gB[0]+3.6,gB[1]-BH+2.5],[gB[0]+2.9,gB[1]-BH+2.5+T.winH*0.72],[gB[0]-2.9,gB[1]-BH+2.5+T.winH*0.72]],GL);
      }
      /* двері (передня і середня) на видимому борту */
      for(const ds of [0.52,-0.28]){
        const dC=cr(ds,visSd);
        IB.P(g,dC[0]-2,dC[1]-BH+2,4.2,BH-4,IB.shade(body,-0.34));
        IB.P(g,dC[0]-1.5,dC[1]-BH+3.5,3.2,T.winH-1,GL);
      }
      /* синя декоративна смуга по борту — паралелограм уздовж ізоосі */
      {
        const sbA=cr(-0.95,visSd),sbB=cr(0.95,visSd);
        const y0=sbA[1]-4.5,y1=sbB[1]-4.5;
        IB.PA(g,[[sbA[0],y0],[sbB[0],y1],[sbB[0],y1+1.6],[sbA[0],y0+1.6]],T.stripeC||'#2a5aa0');
      }
      /* дзеркало біля видиого торця */
      const mb=cr(eEnd*0.97,visSd*0.85);
      IB.P(g,mb[0]+(ne?2:-2),mb[1]-BH+3,2,2,body);IB.P(g,mb[0]+(ne?3:-3),mb[1]-BH+2.4,1,1,P.gr4);
      /* фари (SE — ніс) / задні ліхтарі (NE — тил) */
      if(!ne){
        const hb0=cr(0.97,-0.6),hb1=cr(0.97,0.6);
        IB.P(g,hb0[0]-1,hb0[1]-BH+3,3,2,P.y3);IB.P(g,hb1[0]-1,hb1[1]-BH+3,3,2,P.y3);
      }else{
        const rb0=cr(-0.985,-0.6),rb1=cr(-0.985,0.6);
        IB.P(g,rb0[0]-1,rb0[1]-BH+3,2,2,P.rd3);IB.P(g,rb1[0]+1,rb1[1]-BH+3,2,2,P.rd3);
      }
    } else {
      /* ЛЕГКОВІ: багажник (низький) → база → капот (низький) → кабіна (висока) */
      const trunkS=T.trunk;
      if(trunkS)seg(g,C,A,B,trunkS[0],trunkS[1],0,bh*0.82,body,sh);
      const midS=trunkS?trunkS[1]:-1.0;
      seg(g,C,A,B,midS,T.cab[1],0,bh,body,sh);                     /* салонна база до лобового */
      seg(g,C,A,B,T.cab[1],1.0,0,bh*0.66,body,sh);                 /* низький капот */
      const c0=T.cab[0],c1=T.cab[1];
      const cabA=[A[0]*(c1-c0-0.04),A[1]*(c1-c0-0.04)];
      const cabC=[C[0]+A[0]*(c0+c1)/2+A[0]*0.02,C[1]+A[1]*(c0+c1)/2+A[1]*0.02];
      const cabB=[B[0]*0.8,B[1]*0.8];
      slab(g,cabC,cabA,cabB,bh,T.cabH,[s1d,s2d,s3d,s2d,roofC]);
      /* v19: ПОХИЛЕ ЛОБОВЕ СКЛО — ТІЛЬКИ SE (у NE «просвічувало» крізь дах — темні плями) */
      if(!ne){
        const sW=c1;
        const t0=cr(sW-0.01,visSd*0.66),t1=cr(sW-0.01,-visSd*0.66);
        const b0=cr(IB.M.min(1,sW+0.24),visSd*0.56),b1=cr(IB.M.min(1,sW+0.24),-visSd*0.56);
        IB.PA(g,[[t0[0],t0[1]-bh-T.cabH+2],[t1[0],t1[1]-bh-T.cabH+2],[b0[0],b0[1]-bh*0.66+1],[b1[0],b1[1]-bh*0.66+1]],GL2);
        IB.PA(g,[[t0[0]+(t1[0]-t0[0])*0.5,t0[1]-bh-T.cabH+2+(t1[1]-t0[1])*0.5],[t0[0]+(t1[0]-t0[0])*0.74,t0[1]-bh-T.cabH+2+(t1[1]-t0[1])*0.74],[b0[0],b0[1]-bh*0.66+1]],IB.shade(GL2,0.24));
      }
      /* v19: ЗАДНЄ СКЛО — ТІЛЬКИ NE (видно тил; у SE закрите дахом) */
      if(ne){
        if(T.hatch){
          const r0=cr(c0+0.01,visSd*0.64),r1=cr(c0+0.01,-visSd*0.64);
          IB.PA(g,[[r0[0],r0[1]-bh-T.cabH+2],[r1[0],r1[1]-bh-T.cabH+2],[r0[0],r0[1]-bh+1],[r1[0],r1[1]-bh+1]],GL);
          const sp0=cr(c0-0.10,visSd*0.85),sp1=cr(c0-0.10,-visSd*0.85);
          IB.PA(g,[[sp0[0],sp0[1]-bh-1],[sp1[0],sp1[1]-bh-1],[sp1[0],sp1[1]-bh+1],[sp0[0],sp0[1]-bh+1]],IB.shade(body,-0.3));
        } else {
          const r0=cr(c0-0.01,visSd*0.62),r1=cr(c0-0.01,-visSd*0.62);
          const r2=cr(c0-0.16,visSd*0.60),r3=cr(c0-0.16,-visSd*0.60);
          IB.PA(g,[[r0[0],r0[1]-bh-T.cabH+2],[r1[0],r1[1]-bh-T.cabH+2],[r2[0],r2[1]-bh*0.82+1],[r3[0],r3[1]-bh*0.82+1]],GL);
        }
      }
      /* БІЧНІ ВІКНА — висока смуга скла на ВИДИМОМУ борту
         (v19: дальній бік знято — смуга «виходила» за дах) */
      const wq=(sa0,sa1,sb)=>{
        const p0=cr(sa0,sb),p1=cr(sa1,sb);
        const wTop=p0[1]-bh-T.cabH+2.5, wBot=p0[1]-bh-2.5;
        IB.PA(g,[[p0[0],wTop],[p1[0],wTop],[p1[0],wBot],[p0[0],wBot]],IB.shade(body,-0.42));
        IB.PA(g,[[p0[0],wTop+1],[p1[0],wTop+1],[p1[0],wBot-0.5],[p0[0],wBot-0.5]],GL);
        IB.PA(g,[[p0[0]+(p1[0]-p0[0])*0.58,wTop+1],[p0[0]+(p1[0]-p0[0])*0.78,wTop+1],[p0[0]+(p1[0]-p0[0])*0.78,wBot-0.5],[p0[0]+(p1[0]-p0[0])*0.58,wBot-0.5]],IB.shade(GL,0.24));
      };
      wq(c0+0.06,c1-0.08,visSd);
      /* стійка B між вікнами видимого борту */
      const pb=cr((c0+c1)/2,visSd);
      IB.P(g,pb[0],pb[1]-bh-T.cabH+2.5,1,T.cabH-5,IB.shade(body,-0.30));
      /* опуклість: купол даху + вигнуті борти + світлий пояс */
      if(trunkS)flankShade(g,cr,trunkS[0],trunkS[1],bh*0.82,visSd,body);
      flankShade(g,cr,midS,T.cab[1],bh,visSd,body);
      flankShade(g,cr,T.cab[1],0.985,bh*0.66,visSd,body);
      roofDome(g,cr,c0+0.06,c1-0.06,bh+T.cabH,roofC,0.72);
      /* бампери: передній/задній (світлий пластик) */
      seg(g,C,A,B,0.94,1.02,0.6,2.8,P.gr3,[IB.shade(P.gr3,-0.2),IB.shade(P.gr3,-0.35),IB.shade(P.gr3,-0.45)]);
      seg(g,C,A,B,-1.02,-0.94,0.6,2.8,P.gr3,[IB.shade(P.gr3,-0.2),IB.shade(P.gr3,-0.35),IB.shade(P.gr3,-0.45)]);
      /* v19: фари/решітка — ніс (SE); задні ліхтарі/плата — тил (NE) */
      if(!ne){
        const g0=cr(0.985,0);
        IB.P(g,g0[0]-3,g0[1]-bh*0.66+1,6,2,IB.shade(body,-0.52));
        IB.P(g,g0[0]-2,g0[1]-bh*0.66+1,1,2,IB.shade(body,-0.6));
        const h0=cr(0.97,-0.52),h1=cr(0.97,0.52);
        IB.P(g,h0[0]-1,h0[1]-bh*0.66+1,3,2,P.y3);IB.P(g,h0[0],h0[1]-bh*0.66+1,1,1,P.y4);
        IB.P(g,h1[0]-1,h1[1]-bh*0.66+1,3,2,P.y3);IB.P(g,h1[0],h1[1]-bh*0.66+1,1,1,P.y4);
        IB.P(g,g0[0]-2,g0[1]-bh*0.66+4,5,2,P.wht);IB.P(g,g0[0]-1,g0[1]-bh*0.66+4,1,1,P.d02);IB.P(g,g0[0]+1,g0[1]-bh*0.66+4,1,1,P.d02);
      }else{
        const r0=cr(-0.985,-0.55),r1=cr(-0.985,0.55);
        IB.P(g,r0[0]-1,r0[1]-bh*0.82+1,2,2,P.rd3);IB.P(g,r1[0]+1,r1[1]-bh*0.82+1,2,2,P.rd3);
        IB.P(g,IB.M.min(r0[0],r1[0]),IB.M.min(r0[1],r1[1])-bh*0.82+4,3,2,P.wht);
      }
      /* дзеркало на видиому боці кабіни */
      const m0=cr(c1,visSd*0.8);
      IB.P(g,m0[0]+(ne?2:-2),m0[1]-bh-T.cabH+2,2,2,body);IB.P(g,m0[0]+(ne?3:-3),m0[1]-bh-T.cabH+1,1,1,P.gr4);
      /* ручки дверей (видимий бік) */
      const d0=cr(c0+0.16,visSd),d1=cr((c0+c1)/2+0.10,visSd);
      IB.P(g,d0[0],d0[1]-bh-2,2,1,P.gr4);IB.P(g,d1[0],d1[1]-bh-2,2,1,P.gr4);
      /* дверна лінія */
      const dl=cr(c0+0.04,visSd);
      IB.P(g,dl[0],dl[1]-bh-3,1,bh+1,IB.shade(body,-0.42));
      /* АРКИ КОЛІС над колесами видимого борту */
      for(const sa of[wb,-wb]){
        const p=cr(sa,visSd*ws);
        g.fillStyle=IB.shade(body,-0.5);
        g.beginPath();g.ellipse(p[0],p[1]-3,5,2.6,0,IB.M.PI,0);g.fill();
        g.strokeStyle=IB.shade(body,0.26);g.lineWidth=1;
        g.beginPath();g.ellipse(p[0],p[1]-3.4,4.5,2.0,0,IB.M.PI,IB.M.PI*1.85);g.stroke();
      }
      /* вихлоп + антенна */
      const ex=cr(-0.96,visSd*0.8);
      IB.P(g,ex[0]-1,ex[1]-1,3,1,P.gr1);
      const an=cr(-0.7,visSd*0.9);
      IB.P(g,an[0],an[1]-bh-6,1,6,P.m3);
      /* хром-молдинг (ВАЗ) */
      if(T.chrome){
        const cA=cr(0.9,visSd*0.99),cB=cr(-0.9,visSd*0.99);
        IB.P(g,IB.M.min(cA[0],cB[0]),IB.M.min(cA[1],cB[1])-bh*0.5,IB.M.abs(cA[0]-cB[0])+1,1,P.gr4);
      }
      /* ТАКСІ: шашлі по борту + знак на даху */
      if(T.taxi){
        for(let i=0;i<9;i++){
          const p=cr(0.85-i*0.22,visSd*0.99);
          IB.P(g,p[0]-1,p[1]-bh*0.5,2,2,i%2?'#1a1a20':'#f4f4f8');
        }
        const ts=cr((c0+c1)/2,0);
        IB.isoBox(g,ts[0]-3,ts[1]-bh-T.cabH-4,7,4,3,P.y3,P.y2,P.or1);
        IB.P(g,ts[0]-2,ts[1]-bh-T.cabH-3,5,1,P.d02);
      }
      /* ПОЗАШЛЯХОВИК: багажник на даху + запаска + силовий бампер */
      if(T.suv){
        const rk0=cr(c1-0.06,-0.5),rk1=cr(c0+0.06,-0.5),rk2=cr(c0+0.06,0.5),rk3=cr(c1-0.06,0.5);
        IB.PA(g,[[rk0[0],rk0[1]-bh-T.cabH],[rk1[0],rk1[1]-bh-T.cabH],[rk2[0],rk2[1]-bh-T.cabH],[rk3[0],rk3[1]-bh-T.cabH]],IB.shade(body,-0.4));
        IB.P(g,IB.M.min(rk0[0],rk1[0])-2,IB.M.min(rk0[1],rk1[1])-bh-T.cabH-1,IB.M.abs(rk0[0]-rk1[0])+5,1,P.m2);
        const spw=cr(-0.96,0);
        IB.O(g,spw[0],spw[1]-bh*0.6,3.4,3,P.d01);IB.O(g,spw[0],spw[1]-bh*0.6,1.8,1.6,P.gr2);IB.O(g,spw[0],spw[1]-bh*0.6,0.7,0.6,P.m3);
        const bb0=cr(1.0,-0.85),bb1=cr(1.0,0.85);
        IB.P(g,bb0[0]-1,bb0[1]-bh*0.66,2,3,P.m2);IB.P(g,bb1[0]-1,bb1[1]-bh*0.66,2,3,P.m2);
        IB.P(g,IB.M.min(bb0[0],bb1[0])-1,IB.M.min(bb0[1],bb1[1])-bh*0.66,IB.M.abs(bb0[0]-bb1[0])+3,1,P.m3);
      }
      /* відблиск даху */
      const rf0=cr(c1-0.08,-0.5),rf1=cr(c1-0.08,0.5),rb0=cr(c0+0.08,-0.5),rb1=cr(c0+0.08,0.5);
      IB.PA(g,[[rf0[0],rf0[1]-bh-T.cabH],[rf1[0],rf1[1]-bh-T.cabH],[rb1[0],rb1[1]-bh-T.cabH],[rb0[0],rb0[1]-bh-T.cabH]],IB.shade(roofC,0.16));
    }
    /* бруд/іржа по низу + більше для битих */
    IB.speck(g,C[0]-A[0]-B[0],C[1]-bh+2,IB.M.abs(A[0])*2+IB.M.abs(B[0])*2,bh-2,CAR_ASH,7,7);
    if(damaged){
      IB.speck(g,C[0]-A[0]-B[0],C[1]-bh-T.cabH-2,IB.M.abs(A[0])*2+IB.M.abs(B[0])*2,bh+T.cabH+6,CAR_RU,14,9);
      IB.P(g,C[0]-3,C[1]-bh-T.cabH-2,6,2,P.a1);
      IB.P(g,C[0]+7,C[1]-bh+3,4,2,P.gr1);
      IB.P(g,C[0]-10,C[1]-bh+5,3,2,P.a2);
    }
    return c;
  }

  /* ---------- РЕЄСТРАЦІЯ: 4 напрями для кожного варіанта кольору ----------
     Ключі як у PNG-колекції: car_<модель>_se/_sw/_nw/_ne (+ варіанти _a/_b/_c).
     drawCar підхоплює їх сам (IB.img). Кольори трафіку — як у CCOL ч.3. */
  /* v21: палітри синхронізовані з PNG-набором (Kenney se/sw + рендер ne/nw) */
  const VARS={
    vaz:['#ee6444','#d8d2c4','#e8e8e2','#4a7ab8'],
    lanos:['#3fa97b','#5c86c8','#e8b23a'],
    suv:['#ffb74b','#5e6e50','#e0d8c8'],
    truck:['#3ca679','#8a4a38'],
    van:['#e9edf2','#c8b890','#9ab0c8'],
    bus:['#eef1f4','#bcd8e8'],
  };
  const VSUF=['','a','b','c'];
  IB.CARVARS={};
  for(const mdl in CARS){
    const list=VARS[mdl]||[CARS[mdl].body];
    IB.CARVARS[mdl]=list.map((bc,vi)=>VSUF[vi]);
    list.forEach((bc,vi)=>{
      const key='car_'+mdl+(VSUF[vi]?'_'+VSUF[vi]:'');
      /* v21 «АВТО ЗНОВУ ГАРНІ»: PNG-спрайти з v5assets (Kenney se/sw + рендер
         ne/nw) — ПРІОРИТЕТНИЙ набір; канвас-рендер нижче — ЛИШЕ ФОЛБЕК для
         ключів, яких немає (щоб перезаписати менше — нічого). */
      if(IB.IMG[key+'_se']&&IB.IMG[key+'_sw']&&IB.IMG[key+'_ne']&&IB.IMG[key+'_nw'])return;
      const needSe=!IB.IMG[key+'_se'],needNe=!IB.IMG[key+'_ne'];
      const ne=needNe?carCanvas(mdl,true,false,bc):null;
      const se=needSe?carCanvas(mdl,false,false,bc):null;
      if(ne){IB.IMG[key+'_ne']=ne;if(!IB.IMG[key+'_nw'])IB.IMG[key+'_nw']=mirrorC(ne);}
      if(se){IB.IMG[key+'_se']=se;if(!IB.IMG[key+'_sw'])IB.IMG[key+'_sw']=mirrorC(se);}
    });
  }
})();
