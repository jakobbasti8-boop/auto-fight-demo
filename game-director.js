"use strict";
    function getHurtbox(f){
      const h=f.cfg.displayH,w=h*(f.cfg.hurtW||(f===bob?.30:.36));
      return {x:f.x-w/2,y:GROUND-h*.88,w,h:h*.84};
    }
    function activeHitbox(f,foe){
      if(!f||!f.key||f.hitResolved)return null;
      const phase=f.move?.[f.moveStep]?.[2],h=f.cfg.displayH;
      if(["punchR","punchL"].includes(f.key)&&phase==="Treffer"){
        const r=h*.075,cx=f.x+f.face*h*.34,cy=GROUND-h*.57;
        return {x:cx-r,y:cy-r,w:r*2,h:r*2,type:"melee"};
      }
      if((f.key.startsWith("kickHigh")||f.key==="jumpKick")&&phase==="Treffer"){
        const r=h*.09,cx=f.x+f.face*h*.45,cy=GROUND-h*.60;
        return {x:cx-r,y:cy-r,w:r*2,h:r*2,type:"melee"};
      }
      if(f.key.startsWith("kickLow")&&phase==="Treffer"){
        const r=h*.09,cx=f.x+f.face*h*.43,cy=GROUND-h*.27;
        return {x:cx-r,y:cy-r,w:r*2,h:r*2,type:"melee"};
      }
      if(f.key==="headbutt"&&phase==="Treffer"){
        const r=h*.08,cx=f.x+f.face*h*.25,cy=GROUND-h*.72;
        return {x:cx-r,y:cy-r,w:r*2,h:r*2,type:"melee"};
      }
      if(f.key==="brainFlail"&&phase==="Treffer"){
        const second=f.moveStep>=4;
        const r=h*(second?.095:.085);
        const cx=f.x+f.face*h*(second?.43:.38);
        const cy=GROUND-h*(second?.31:.56);
        return {x:cx-r,y:cy-r,w:r*2,h:r*2,type:"melee"};
      }
      if(f.key==="kame"&&f.moveStep>=11&&f.moveStep<=18&&foe){
        const hb=getHurtbox(foe);
        const ox=f.x+f.face*h*0.28,tx=hb.x+hb.w*0.5;
        const left=Math.min(ox,tx),right=Math.max(ox,tx);
        const cy=GROUND-h*0.49;
        return {x:left,y:cy-h*0.22,w:Math.max(32,right-left+40),h:h*0.44,type:"beam"};
      }
      if(f.key==="comet"&&f.moveStep>=18&&f.moveStep<=20&&foe){
        const hb=getHurtbox(foe);
        return {x:hb.x-74,y:hb.y-92,w:hb.w+148,h:hb.h+150,type:"comet"};
      }
      if(f.key==="protonKick"&&f.moveStep>=14&&f.moveStep<=19&&foe){
        const hb=getHurtbox(foe);
        return {x:hb.x-54,y:hb.y-70,w:hb.w+108,h:hb.h+118,type:"proton"};
      }
      if(f.key==="sourMilkBurst"&&f.moveStep>=18&&f.moveStep<=19&&foe){
        const hb=getHurtbox(foe);
        const mouthX=f.x+f.face*h*0.11;
        const mouthY=GROUND-h*0.57;
        const targetX=hb.x+hb.w/2;
        const left=Math.min(mouthX,targetX),right=Math.max(mouthX,targetX);
        return {x:left,y:mouthY-h*0.12,w:Math.max(28,right-left),h:h*0.24,type:"sourMilk"};
      }
      return null;
    }
    function intersects(a,b){return a&&b&&a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y}

    function attackTypeFromKey(key){
      if(key.startsWith("punch"))return "punch";
      if(key.startsWith("kickHigh"))return "kickHigh";
      if(key.startsWith("kickLow"))return "kickLow";
      if(key==="jumpKick")return "jumpKick";
      if(key==="headbutt")return "headbutt";
      if(key==="brainFlail")return "brainFlail";
      return "special";
    }
    function attackInfo(key){
      if(key==="kame"){
        return {...ATTACKS.special,type:"special",reaction:"hitBeam",damage:32,range:9999,knock:160,blockChance:0.05};
      }
      if(key==="comet"){
        return {...ATTACKS.special,type:"special",reaction:"hitComet",damage:34,range:9999,knock:168,blockChance:0.04};
      }
      if(key==="protonKick"){
        return {...ATTACKS.special,type:"special",reaction:"hitBeam",damage:30,range:9999,knock:145,blockChance:0.08};
      }
      if(key==="sourMilkBurst"){
        return {...ATTACKS.special,type:"special",reaction:"hitSourMilk",damage:24,range:9999,knock:54,blockChance:0.06};
      }
      const type=attackTypeFromKey(key),base=ATTACKS[type]||ATTACKS.punch;
      return {...base,type};
    }

    const STARTUP=["Ausholen","Absenken","Absprung","Aufstieg","Aufladen","Arme hoch","Zurück"];

    function contactPoint(hit,hurt){
      const x1=Math.max(hit.x,hurt.x),x2=Math.min(hit.x+hit.w,hurt.x+hurt.w);
      const y1=Math.max(hit.y,hurt.y),y2=Math.min(hit.y+hit.h,hurt.y+hurt.h);
      return [(x1+x2)/2,(y1+y2)/2];
    }
    function decideBlock(defender,info){
      if(defender.ko||defender.move||defender.blockCool>0)return false;
      let chance=info&&info.blockChance!=null?info.blockChance:(info.type==="special"?.16:.32);
      if(defender.health<40)chance+=.08;
      if(defender.cfg.key==="brainbug")chance*=.65;
      return Math.random()<chance;
    }

    function dealHit(attacker,defender,key,cp){
      if(attacker.hitResolved||defender.ko)return;
      const info=attackInfo(key);
      attacker.hitResolved=true;
      const dir=attacker.face,cx=cp[0],cy=cp[1];

      /* --- BLOCK --- */
      if(decideBlock(defender,info)){
        const chip=Math.max(1,Math.round(info.damage*.18));
        defender.health=Math.max(0,defender.health-chip);
        defender.x=clamp(defender.x+dir*info.knock*.38,160,W-160);
        attacker.x=clamp(attacker.x-dir*info.knock*.14,160,W-160);
        defender.start(info.type==="kickLow"?"blockLow":"blockHigh");
        defender.blockCool=900;
        defender.hitFlash=110;defender.flashCol="#a9dcff";
        shake=Math.min(9,3+info.damage*.2);hitStop=32;
        spawnSparks(cx,cy,dir,9,COL_BLOCK);
        spawnRing(cx,cy,"rgba(90,175,255,.5)",14,95,300);
        spawnDust(defender.x,dir,4);
        spawnPopup(cx,cy-72,"BLOCK","#8fd0ff");
        if(chip>0)spawnPopup(cx+dir*46,cy-24,"-"+chip,"#bcd8ee");
        ui.status.textContent="GEBLOCKT";
        return;
      }

      /* --- COUNTER-HIT: Gegner wurde im Anlauf erwischt --- */
      const defPhase=defender.move?(defender.move[defender.moveStep]||[])[2]:null;
      const counter=!!defender.move&&!defender.key.startsWith("hit")&&
                    !defender.key.startsWith("block")&&STARTUP.includes(defPhase);

      const dmg=Math.round(info.damage*(counter?1.6:1));
      const comboLink=attacker.comboActive&&attacker.comboQueue.length>0;
      const knock=info.knock*(counter?1.3:1)*(comboLink ? .38 : 1);
      defender.health=Math.max(0,defender.health-dmg);
      if(attacker.comboActive){
        attacker.comboHits++;
        if(attacker.comboHits>=2)spawnPopup(cx,cy-130,attacker.comboHits+" HIT COMBO","#ffe066",attacker.comboHits>=3);
      }
      defender.x=clamp(defender.x+dir*knock,160,W-160);
      defender.hitFlash=counter?280:190;
      defender.flashCol=counter?"#ffec9e":"#ff3b30";
      shake=Math.min(26,6+dmg*.75);
      hitStop=counter?125:(dmg>=15?86:48);
      ui.flash.classList.remove("hit");void ui.flash.offsetWidth;ui.flash.classList.add("hit");

      const spec=info.type==="special";
      spawnSparks(cx,cy,dir,dmg*(counter?1.5:1),spec?COL_SPEC:COL_HIT);
      if(spec)spawnRing(cx,cy,"rgba(255,190,80,.55)",30,260,520);
      if(counter||dmg>=11)spawnSpeedlines(cx,cy,dir,dmg);
      spawnDust(defender.x,dir,Math.min(14,4+dmg));
      spawnPopup(cx,cy-74,"-"+dmg,counter?"#ffe066":"#ffffff",counter||dmg>=15);
      if(counter)spawnPopup(cx,cy-142,"COUNTER!","#ff7a3d",true);

      if(defender.health<=0){
        defender.move=null;defender.key=null;defender.ko=true;defender.from=null;
        attacker.comboQueue=[];attacker.comboActive=false;attacker.comboTarget=null;
        resultQueued=true;directorState="ko";directorDelay=1050;counterPending=null;
        koTime=0;koFocus={x:defender.x,y:GROUND-defender.cfg.displayH*.5};
        spawnSparks(cx,cy,dir,34,COL_SPEC);
        spawnRing(cx,cy,"rgba(255,255,255,.6)",20,340,700);
        spawnPopup(defender.x,GROUND-defender.cfg.displayH*.85,"K.O.","#ffd24d",true);
        ui.status.textContent="K. O.";
      }else{
        defender.start(info.reaction);
        ui.status.textContent=counter?"COUNTER!":(dmg>=18?"SPEZIALTREFFER!":choose(["TREFFER!","SAUBERER HIT!","VOLLTREFFER!"]));
      }
    }

    function updateCollisions(){
      fighters.flatMap(a=>fighters.filter(d=>d!==a).map(d=>[a,d])).forEach(([a,d])=>{
        const hb=activeHitbox(a,d);
        const hurt=getHurtbox(d);
        if(intersects(hb,hurt))dealHit(a,d,a.key,contactPoint(hb,hurt));
      });
    }

    function setPlan(){
      const active=fighters.filter(f=>!f.ko);
      const attacker=choose(active),defender=choose(active.filter(f=>f!==attacker));
      const roll=Math.random();
      const fighterKey=attacker.cfg.key;

      // Roughly one third of exchanges are chained attacks; a smaller share ends
      // in a cinematic special finisher.
      if(roll<.13){
        const c=SPECIAL_COMBOS[fighterKey];
        const first=c.keys[0],info=attackInfo(first);
        activePlan={attacker,defender,key:first,info,combo:c.keys,comboName:c.name,specialCombo:true,
                    evade:false,prestep:Math.random()<.28,counter:false};
      }else if(roll<.34){
        const c=choose(COMBOS[fighterKey]);
        const first=c.keys[0],info=attackInfo(first);
        activePlan={attacker,defender,key:first,info,combo:c.keys,comboName:c.name,specialCombo:false,
                    evade:Math.random()<.10,prestep:Math.random()<.28,counter:false};
      }else{
        const r=Math.random();
        let type=r<.28?"punch":r<.52?"kickLow":r<.76?"kickHigh":r<.90?"jumpKick":"special";
        if((active.some(f=>f.health<35))&&Math.random()<.32)type="special";
        let key=type==="special"?attacker.cfg.specialKey:choose(ATTACKS[type].keys);
        const info=attackInfo(key);
        activePlan={attacker,defender,key,info,combo:null,comboName:"",specialCombo:false,
                    evade:Math.random()<.22&&type!=="special",prestep:Math.random()<.36,
                    counter:Math.random()<.24&&type!=="special"};
      }

      attacker.face=attacker.x<defender.x?1:-1;defender.face=-attacker.face;
      if(activePlan.prestep){
        attacker.moveTarget=clamp(attacker.x-attacker.face*(50+Math.random()*75),160,W-160);
        directorState="feint";
      }else beginApproach();
    }
    function beginApproach(){
      if(!activePlan)return;
      const {attacker,defender,info}=activePlan;
      attacker.face=attacker.x<defender.x?1:-1;defender.face=-attacker.face;
      const desired=info.type==="special"?Math.max(360,Math.abs(defender.x-attacker.x)):info.range-22;
      const target=defender.x-attacker.face*desired;
      attacker.moveTarget=clamp(target,160,W-160);
      if(Math.random()<.34&&info.type!=="special"){
        defender.moveTarget=clamp(defender.x+attacker.face*(35+Math.random()*55),160,W-160);
      }
      directorState="approach";
    }
    function launchPlan(){
      const {attacker,defender,key,evade,info,combo,comboName,specialCombo}=activePlan;
      attacker.face=attacker.x<defender.x?1:-1;defender.face=-attacker.face;
      if(combo)attacker.beginCombo(combo,comboName,defender);
      else attacker.start(key);
      if(evade&&info.type!=="special"){
        defender.moveTarget=clamp(defender.x-attacker.face*(info.range*.72+Math.random()*55),160,W-160);
      }
      directorState="attack";
      if(activePlan.counter&&info.type!=="special"&&!evade){
        counterPending={f:defender,foe:attacker,delay:80+Math.random()*170};
      }
      ui.status.textContent=specialCombo?"SPEZIAL-KOMBO":combo?"KAMPF-KOMBO":key==="kame"?"ENERGIESTRAHL":key==="comet"?"MICROWAVE METEOR":key==="protonKick"?"PROTON ROUNDHOUSE":key==="sourMilkBurst"?"SOUR MILK SURGE":key==="brainFlail"?"PANIK-FLAIL":choose(["ANGRIFF","DUELL","ACTION"]);
    }

    function director(dt){
      if(!running)return;
      roundTime+=dt;
      if(counterPending){
        counterPending.delay-=dt;
        if(counterPending.delay<=0){
          const d=counterPending.f,foe=counterPending.foe;
          if(!d.isBusy()&&!d.ko&&!foe.ko){
            const ck=choose(ATTACKS[Math.random()<.55?"punch":"kickHigh"].keys);
            if(Math.abs(d.x-foe.x)<=attackInfo(ck).range+30){
              d.face=d.x<foe.x?1:-1;d.moveTarget=null;d.start(ck);
              ui.status.textContent="GEGENANGRIFF";
            }
          }
          counterPending=null;
        }
      }
      if(directorState==="ko"){
        directorDelay-=dt;
        if(directorDelay<=0&&resultQueued){
          resultQueued=false;running=false;
          const winner=fighters.find(f=>!f.ko)||bob;
          ui.winner.textContent=winner.cfg.name;
          ui.result.hidden=false;
        }
        return;
      }
      if(directorState==="idle"){
        directorDelay-=dt;
        if(directorDelay<=0&&fighters.every(f=>!f.isBusy()&&!f.ko))setPlan();
      }else if(directorState==="feint"){
        if(activePlan.attacker.moveTarget===null)beginApproach();
      }else if(directorState==="approach"){
        const {attacker,defender,info}=activePlan;
        const dist=Math.abs(attacker.x-defender.x);
        if((attacker.moveTarget===null||dist<=info.range+12)&&!attacker.isBusy()&&!defender.isBusy())launchPlan();
      }else if(directorState==="attack"){
        if(fighters.every(f=>!f.isBusy())){
          if(Math.random()<.47)fighters.filter(f=>!f.ko).forEach(f=>f.moveTarget=clamp(f.x+(Math.random()-.5)*150,160,W-160));
          activePlan=null;directorState="idle";directorDelay=220+Math.random()*520;
          ui.status.textContent="FIGHT";
        }
      }
    }

