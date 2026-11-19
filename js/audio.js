/* LEGEND 3 «МОРЕ МОРЕ» — audio.js v3.0 «ПАНЕЛІ І ЧАЙКИ»: НОВА МУЗИКА МОРЕ
   (курортний діджеріду-бриз, нічна гулянка, вечіркові фази) + SFX: ЧАЙКА, УДАР */
IB.AUDIO=(function(){
  let ctx=null,master=null,muted=false,musicOn=true;
  let cur=null,curName='';

  function init(){
    if(ctx)return;
    try{
      ctx=new (window.AudioContext||window.webkitAudioContext)();
      master=ctx.createGain();master.gain.value=0.5;master.connect(ctx.destination);
    }catch(e){}
  }
  function vol(v){if(master)master.gain.value=muted?0:v;}
  function setMuted(m){muted=m;if(master)master.gain.value=m?0:0.5;}

  /* --- примітиви --- */
  function beep(f,dur,type='square',v=0.16,slide=0){
    if(!ctx||muted)return;
    const o=ctx.createOscillator(),g=ctx.createGain();
    o.type=type;o.frequency.value=f;
    if(slide)o.frequency.exponentialRampToValueAtTime(IB.M.max(20,f+slide),ctx.currentTime+dur);
    g.gain.setValueAtTime(v,ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+dur);
    o.connect(g);g.connect(master);
    o.start();o.stop(ctx.currentTime+dur);
  }
  function noise(dur,v=0.14,fLow=400){
    if(!ctx||muted)return;
    const n=ctx.sampleRate*dur,buf=ctx.createBuffer(1,n,ctx.sampleRate),d=buf.getChannelData(0);
    for(let i=0;i<n;i++)d[i]=(IB.M.random()*2-1)*(1-i/n);
    const s=ctx.createBufferSource();s.buffer=buf;
    const fl=ctx.createBiquadFilter();fl.type='lowpass';fl.frequency.value=fLow;
    const g=ctx.createGain();g.gain.value=v;
    s.connect(fl);fl.connect(g);g.connect(master);s.start();
  }

  const SFX={
    step(){noise(0.05,0.03,300);},
    chop(){noise(0.12,0.2,900);beep(140,0.08,'square',0.08);},
    pick(){beep(660,0.07,'square',0.12);beep(880,0.09,'square',0.1);},
    berry(){beep(520,0.06,'square',0.1);beep(780,0.08,'square',0.08);},
    eat(){noise(0.09,0.1,500);beep(300,0.06,'triangle',0.08);},
    drink(){beep(400,0.05,'sine',0.1,-120);beep(520,0.08,'sine',0.08,-160);},
    coin(){beep(880,0.06,'square',0.12);beep(1320,0.1,'square',0.1);},
    build(){noise(0.15,0.16,700);beep(180,0.15,'square',0.1);},
    splash(){noise(0.25,0.18,1200);},
    fire(){noise(0.4,0.12,600);beep(90,0.3,'triangle',0.06);},
    bell(){beep(1180,0.5,'sine',0.12,-30);beep(1770,0.4,'sine',0.06);},
    bird(){beep(1400,0.07,'sine',0.05,300);setTimeout(()=>beep(1700,0.06,'sine',0.04,-200),90);},
    dog(){beep(200,0.09,'square',0.1,-80);setTimeout(()=>beep(230,0.08,'square',0.09,-90),120);},
    fish(){noise(0.15,0.14,900);beep(700,0.1,'sine',0.08,200);},
    toast(){beep(520,0.08,'square',0.1);setTimeout(()=>beep(660,0.1,'square',0.1),110);},
    quest(){beep(523,0.1,'square',0.1);setTimeout(()=>beep(659,0.1,'square',0.1),110);setTimeout(()=>beep(784,0.16,'square',0.12),220);},
    done(){beep(659,0.09,'square',0.1);setTimeout(()=>beep(784,0.09,'square',0.1),100);setTimeout(()=>beep(1046,0.2,'square',0.12),200);},
    alert(){beep(440,0.15,'square',0.1,-60);setTimeout(()=>beep(330,0.2,'square',0.1,-60),180);},
    trip(){beep(220,0.5,'sine',0.1,120);beep(330,0.6,'sine',0.07,160);beep(440,0.7,'sine',0.05,220);},
    freeze(){noise(0.5,0.12,300);},
    find(){beep(523,0.08,'sine',0.1);setTimeout(()=>beep(659,0.08,'sine',0.1),90);setTimeout(()=>beep(880,0.14,'sine',0.12),180);},
    ui(){beep(700,0.04,'square',0.07);},
    shout(){beep(660,0.1,'square',0.09,140);setTimeout(()=>beep(540,0.12,'square',0.08,-110),120);},
    caw(){beep(540,0.13,'sawtooth',0.09,-280);setTimeout(()=>beep(500,0.11,'sawtooth',0.08,-260),150);},
    bat(){beep(1900,0.05,'sine',0.05,-700);},
    growl(){noise(0.35,0.14,240);beep(95,0.32,'sawtooth',0.1,-35);},
    /* ===== v3.0 «ПАНЕЛІ І ЧАЙКИ»: нові звуки ===== */
    gull(){ /* крик чайки — «кря-а-а» з падінням */
      beep(1650,0.16,'sawtooth',0.07,-450);
      setTimeout(()=>beep(1350,0.12,'sawtooth',0.05,-320),130);
      setTimeout(()=>beep(1750,0.10,'sawtooth',0.045,-380),280);},
    punch(){ /* удар — глухий «бум» + швидкий хвіст */
      noise(0.09,0.22,260);beep(90,0.12,'square',0.14,-40);
      setTimeout(()=>beep(60,0.08,'sine',0.1,-20),40);},
    hello(){ /* здоровання — дві сонячні ноти */
      beep(740,0.07,'triangle',0.07);
      setTimeout(()=>beep(988,0.09,'triangle',0.06),90);},
    /* v20.0: ГРІМ — рокіт блискавки (sky.js); near 0..1 — далекий/над головою */
    thunder(near){
      near=near===undefined?0.7:near;
      const dur=0.7+ (1-near)*0.8;
      noise(dur,0.10+near*0.16,90+near*130);
      setTimeout(()=>noise(dur*0.7,0.06+near*0.10,70+near*90),(dur*300)|0);
      if(near>0.55)beep(52,0.5,'sine',0.10+near*0.05,-18);},
  };

  /* --- музика: секвенсор --- */
  const NOTE={C4:262,D4:294,E4:330,F4:349,G4:392,A4:440,B4:494,C5:523,D5:587,E5:659,F5:698,G5:784,A5:880,B5:988,C6:1046,A3:220,B3:247,G3:196,F3:175,E3:165,D3:147,C3:131,Ab4:415,Bb4:466,Eb5:622,Db5:554,Ab5:831,Bb5:932};
  /* v3.0: НОВІ МЕЛОДІЇ МОРЕ (замість карпатських) */
  /* меню — сонячна набережна */
  const MENU=[['C5',1],['E5',1],['G5',2],['B4',1],['D5',1],['G5',2],['A4',1],['C5',1],['E5',2],['D5',1],['C5',1],['B4',3],0];
  /* день — курортний бриз (м'який мажор з хвилею) */
  const SEA=[['C5',2],['E5',1],['G5',1],['A5',2],['G5',1],['E5',1],['F5',2],['E5',1],['D5',1],['C5',3],0,
    ['E4',1],['G4',1],['C5',2],['D4',1],['F4',1],['A4',2],['G4',1],['E4',1],['C4',3],0];
  /* ніч — тиха вода (мінор, медлено) */
  const NIGHT=[['A4',3],['C5',2],['B4',1],['A4',2],['E4',3],0,['F4',2],['E4',1],['D4',2],['C4',3],0];
  /* фази гулянки — 8 нових (дансе-бемоль, одеський флесер, хвиля…) */
  const DANCE=[['C5',1],['C5',1],['E5',1],['G5',1],['A5',1],['G5',1],['E5',2],['F5',1],['E5',1],['D5',1],['C5',1],['B4',1],['C5',2],0];
  const FLESH=[['G5',1],['B4',1],['D5',1],['G5',1],['F5',1],['D5',1],['B4',2],['C5',1],['E5',1],['D5',1],['B4',1],['G4',1],['C5',2],0];
  const TALE=[['E5',2],['C5',1],['D5',1],['E5',2],['C5',2],0,['A4',1],['B4',1],['C5',2],['B4',1],['A4',1],['E4',3],0];
  const WAVE=[['C5',1],['E5',1],['Ab4',1],['B4',1],['C5',1],['Eb5',1],['D5',1],['B4',1],['C5',1],['E5',1],['Ab5',1],['G5',1],['C6',2],0];
  const BLUE=[['A4',2],['G4',1],['F4',2],['E4',3],0,['D4',2],['E4',1],['F4',1],['E4',2],['D4',2],['C4',3],0];
  const PSY=[['Db5',1],['F5',1],['Ab5',1],['Db5',1],['F5',1],['Ab5',1],['Db5',1],['Eb5',1],['F5',1],['Eb5',1],['Db5',1],['Ab4',1],['Db5',2],0];
  const HANG=[['C4',3],0,0,['G3',3],0,0,['E4',2],['D4',2],['C4',4],0,0,0];

  /* барабани гулянки */
  let drumIv=null;
  function drums(bpm){stopDrums();if(!ctx||muted)return;drumIv=setInterval(()=>{noise(0.045,0.075,260);},60000/bpm);}
  function stopDrums(){if(drumIv){clearInterval(drumIv);drumIv=null;}}
  function playSeq(seq,bpm,wave,loop){
    stopDrums();stop();
    if(!ctx||muted)return;
    const beat=60/bpm;let t=ctx.currentTime+0.05;
    const g=ctx.createGain();g.gain.value=0.5;g.connect(master);
    function schedule(){
      for(const item of seq){
        if(!item){t+=beat;continue;}
        const n=item[0],len=item[1]||1;
        const o=ctx.createOscillator(),gg=ctx.createGain();
        o.type=wave;o.frequency.value=NOTE[n]||440;
        gg.gain.setValueAtTime(0.14,t);
        gg.gain.setValueAtTime(0.14,t+beat*len*0.7);
        gg.gain.exponentialRampToValueAtTime(0.001,t+beat*len*0.95);
        o.connect(gg);gg.connect(g);
        o.start(t);o.stop(t+beat*len);
        t+=beat*len;
      }
      return t-ctx.currentTime;
    }
    let dur=schedule();
    const iv=setInterval(()=>{
      if(loop){t=ctx.currentTime+0.05;dur=schedule();}
    },(dur)*1000);
    cur={stop:stop,gain:g,iv:iv};
    curName=loop?'loop':'once';
    function stop(){if(cur&&cur.iv)clearInterval(cur.iv);}
    return cur;
  }
  function stop(){if(cur){if(cur.iv)clearInterval(cur.iv);try{cur.gain.disconnect();}catch(e){}cur=null;curName='';}}

  /* фази вечірки → (мелодія, темп, хвиля, барабани) — v3.0 курортні */
  const PH=[
    {s:SEA,b:126,w:'triangle',d:0},{s:DANCE,b:158,w:'square',d:1},
    {s:TALE,b:112,w:'triangle',d:0},{s:WAVE,b:150,w:'sine',d:1},
    {s:DANCE,b:168,w:'square',d:1},{s:BLUE,b:86,w:'sine',d:0},
    {s:PSY,b:176,w:'sawtooth',d:1},{s:HANG,b:60,w:'sine',d:0}];
  const MUSIC={
    menu(){playSeq(MENU,124,'square',true);},
    day(){playSeq(SEA,108,'triangle',true);},
    night(){playSeq(NIGHT,84,'sine',true);},
    gulyanka(){playSeq(DANCE,164,'square',true);},
    trip(){stopDrums();stop();beep(110,2,'sine',0.08,40);},
    /* музика i-ї години гулянки (v3.0 нові фази) */
    partyPhase(i){const p=PH[(i|0)%8];stop();playSeq(p.s,p.b,p.w,true);if(p.d)drums(p.b);},
    stop(){stopDrums();stop();},
  };

IB.MUSIC=MUSIC;
  return {init,beep,noise,SFX,MUSIC,setMuted,isMuted:()=>muted,toggleMute(){setMuted(!muted);return muted;},vol,ready:()=>!!ctx};
})();
IB.SFX=IB.AUDIO.SFX;
