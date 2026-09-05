"use strict";
    class Fighter{
      constructor(cfg){
        this.cfg=cfg;this.baseScale=cfg.scale;this.reset(cfg.startX);
      }
      reset(x){
        this.x=x;this.face=this.cfg.face;this.health=100;this.displayHealth=100;
        this.move=null;this.key=null;this.moveStep=0;this.stepElapsed=0;this.moveElapsed=0;
        this.from=null;this.idleTime=Math.random()*10;this.walkCycle=Math.random()*6;
        this.moveTarget=null;this.queued=null;this.hitResolved=false;this.ko=false;this.vx=0;
        this.hitFlash=0;this.flashCol="#ff3b30";this.dustAcc=0;this.blockCool=0;
        this.comboQueue=[];this.comboHits=0;this.comboLabel="";this.comboTarget=null;this.comboActive=false;
      }
      isBusy(){return !!this.move||this.ko}
      pose(){
        if(this.ko)return P.ko;
        if(this.move){
          const frame=this.move[this.moveStep];
          if(!frame)return P.idleA;
          return blend(this.from||P[frame[0]],P[frame[0]],ease(clamp(this.stepElapsed/frame[1],0,1)));
        }
        let p=blend(P.idleA,P.idleB,(Math.sin(this.idleTime*2.5)+1)/2);
        if(Math.abs(this.vx)>.01){
          const wave=Math.sin(this.walkCycle);
          p={...p,fR:[p.fR[0]+wave*23,p.fR[1]],fL:[p.fL[0]-wave*23,p.fL[1]],
            hR:[p.hR[0]-wave*10,p.hR[1]],hL:[p.hL[0]+wave*10,p.hL[1]]};
        }
        return p;
      }
      start(key){
        this.from=this.pose();this.move=MOVES[key];this.key=key;this.moveStep=0;
        this.stepElapsed=0;this.moveElapsed=0;this.hitResolved=false;this.moveTarget=null;this.vx=0;
      }
      beginCombo(keys,label,target){
        this.comboQueue=keys.slice(1);this.comboHits=0;this.comboLabel=label||"COMBO";
        this.comboTarget=target||null;this.comboActive=true;
        this.start(keys[0]);
        spawnPopup(this.x,GROUND-this.cfg.displayH*.98,this.comboLabel,"#ffd24d",true);
      }
      update(dt){
        this.displayHealth=lerp(this.displayHealth,this.health,Math.min(1,dt*.008));
        if(this.hitFlash>0)this.hitFlash=Math.max(0,this.hitFlash-dt);
        if(this.blockCool>0)this.blockCool=Math.max(0,this.blockCool-dt);
        if(this.ko)return;
        if(this.move){
          this.stepElapsed+=dt;this.moveElapsed+=dt;
          let frame=this.move[this.moveStep];
          while(frame&&this.stepElapsed>=frame[1]){
            this.stepElapsed-=frame[1];this.from=P[frame[0]];this.moveStep++;
            if(this.moveStep>=this.move.length){
              const done=this.key;
              this.move=null;this.key=null;this.from=null;
              this.onMoveEnd(done);
              break;
            }
            frame=this.move[this.moveStep];
            if(frame){
              const ph=frame[2];
              if(ph==="Landung"||ph==="Aufschlag"){spawnDust(this.x,this.face,10);shake=Math.max(shake,7)}
              else if(ph==="Treffer"&&!this.key.startsWith("hit")&&!this.key.startsWith("block")){
                spawnWhoosh(this.x+this.face*this.cfg.displayH*.22,GROUND-this.cfg.displayH*.55,this.face);
              }
              else if(ph==="Abschuss"||ph==="Wurf"){
                spawnRing(this.x+this.face*this.cfg.displayH*.22,GROUND-this.cfg.displayH*.57,
                  this.key==="kame"?"rgba(90,170,255,.55)":"rgba(255,180,60,.55)",20,150,420);
              }
            }
          }
        }else{
          this.idleTime+=dt/1000;
          if(this.moveTarget!==null){
            const delta=this.moveTarget-this.x;
            if(Math.abs(delta)<5){this.x=this.moveTarget;this.moveTarget=null;this.vx=0}
            else{
              this.vx=Math.sign(delta)*this.cfg.walkSpeed;
              this.x+=this.vx*dt;this.walkCycle+=dt*.016;
              this.dustAcc+=dt;
              if(this.dustAcc>110){this.dustAcc=0;spawnDust(this.x,Math.sign(this.vx),1)}
            }
          }else this.vx=0;
        }
        this.x=clamp(this.x,160,W-160);
      }
      onMoveEnd(done){
        if(!done)return;
        if(done.startsWith("hit")||done.startsWith("block"))return;

        if(this.comboActive&&this.comboQueue.length&&this.comboTarget&&!this.comboTarget.ko){
          const next=this.comboQueue.shift();
          this.face=this.x<this.comboTarget.x?1:-1;
          const info=attackInfo(next);
          if(info.type!=="special"){
            const desired=Math.max(110,info.range-34);
            const targetX=this.comboTarget.x-this.face*desired;
            // Small forward cancel between combo links keeps the sequence connected
            // without teleporting through the opponent.
            this.x=lerp(this.x,clamp(targetX,160,W-160),.42);
          }
          this.start(next);
          return;
        }

        if(this.comboActive){
          if(this.comboHits>=2)spawnPopup(this.x,GROUND-this.cfg.displayH*1.08,this.comboHits+" HIT COMBO","#ffe066",true);
          this.comboQueue=[];this.comboActive=false;this.comboTarget=null;this.comboLabel="";this.comboHits=0;
        }
        if(!this.hitResolved)spawnPopup(this.x,GROUND-this.cfg.displayH*1.02,"DANEBEN","#a8b6dd");
      }
      spriteFrame(){
        if(this.ko)return {row:4,col:4};
        if(this.move){
          const total=this.move.reduce((sum,f)=>sum+f[1],0),progress=clamp(this.moveElapsed/total,0,.999);
          if(this.key==="choke"){
            const ph=this.move[this.moveStep]?.[2];
            if(ph==="Ansprung")return {row:3,col:0};
            if(ph==="Sprung")return {row:3,col:1};
            if(ph==="Neck Lock")return {row:3,col:2};
            if(ph==="Würgegriff"||ph==="Lösen")return {row:3,col:3};
            return {row:3,col:4};
          }
          if(this.key.startsWith("block"))return {row:0,col:1};
          if(this.key.startsWith("hit")){
            const phase=this.move[this.moveStep]?.[2];
            if(phase==="Aufstehen")return {row:4,col:Math.max(0,3-Math.floor((this.stepElapsed/(this.move[this.moveStep][1]||1))*3))};
            return {row:4,col:Math.min(4,Math.floor(progress*5))};
          }
          if(this.key.startsWith("kick")||this.key==="jumpKick")return {row:3,col:Math.min(4,Math.floor(progress*5))};
          return {row:2,col:Math.min(4,Math.floor(progress*5))};
        }
        if(Math.abs(this.vx)>.01){
          let col=Math.floor(this.walkCycle)%5;if(this.vx*this.face<0)col=4-col;
          return {row:1,col};
        }
        return {row:0,col:Math.floor(this.idleTime*5)%5};
      }
      phase(){return this.ko?"K. o.":this.move?this.move[this.moveStep]?.[2]||"Bereit":Math.abs(this.vx)>.01?"Bewegung":"Bereit"}
      toScreen(lx,ly){return [this.x+this.face*this.baseScale*(lx-178),GROUND+this.baseScale*(ly-352)]}
    }

    const bob=new Fighter({
      name:"DR. BOB",key:"bob",specialKey:"kame",asset:"bob",displayH:344,spriteZoom:0.463,baseline:0.0391,hurtW:.40,startX:430,face:1,scale:1.5,girth:1.02,walkSpeed:.22,hair:"spikes",doctor:true,
      col:{skin:"#e8b08a",skinD:"#b87859",hair:"#e12620",hairD:"#7e0b0b",shirt:"#d9dfe6",shirtD:"#a9b2bd",
        coat:"#f4f5f2",coatD:"#cbd1d5",pants:"#262936",pantsD:"#171923",boot:"#11131b",bootD:"#080910"}
    });
    const kurz=new Fighter({
      name:"KURZDURCH",key:"kurz",specialKey:"comet",asset:"kurz",displayH:322,spriteZoom:0.4804,baseline:0.0391,hurtW:.48,startX:1095,face:-1,scale:1.18,girth:.92,walkSpeed:.245,hair:"ponytail",doctor:false,
      col:{skin:"#d9a279",skinD:"#a96f50",hair:"#181821",hairD:"#08090d",shirt:"#39485b",shirtD:"#253041",
        pants:"#222b38",pantsD:"#131924",boot:"#10131a",bootD:"#07090d"}
    });

    const nova=new Fighter({
      name:"THERESA MACHSLOCHUFF",short:"THERESA",key:"nova",asset:"nova",specialKey:"choke",displayH:318,spriteZoom:0.5761,baseline:0.0391,hurtW:.36,startX:770,face:1,scale:1.18,girth:.95,walkSpeed:.23,hair:"ponytail",doctor:false,
      col:{skin:"#f1c4a6",skinD:"#c78e78",hair:"#e8a92f",hairD:"#9d5a18",shirt:"#dbe4f5",shirtD:"#aab8d2",pants:"#dbe4f5",pantsD:"#aab8d2",boot:"#edf2ff",bootD:"#8d9bb4"}
    });
    const allFighters=[bob,kurz,nova];
    let fighters=[bob,kurz];
    let selectedLeft="bob",selectedRight="kurz";
    const fighterByKey={bob,kurz,nova};
    const fighterLabel={bob:"DR. BOB",kurz:"KURZDURCH",nova:"THERESA MACHSLOCHUFF"};

    const ui={
      lifeBob:document.getElementById("life-bob"),lifeKurz:document.getElementById("life-kurz"),lifeNova:document.getElementById("life-neu"),
      damageBob:document.getElementById("damage-bob"),damageKurz:document.getElementById("damage-kurz"),damageNova:document.getElementById("damage-neu"),
      hpBob:document.getElementById("hp-bob"),hpKurz:document.getElementById("hp-kurz"),hpNova:document.getElementById("hp-neu"),
      leftName:document.getElementById("hud-left-name"),rightName:document.getElementById("hud-right-name"),
      newHud:document.querySelector(".fighter-hud.newcomer"),
      status:document.getElementById("fight-status"),round:document.getElementById("round-no"),
      start:document.getElementById("start-overlay"),result:document.getElementById("result-overlay"),
      winner:document.getElementById("winner-name"),flash:document.getElementById("flash"),
      matchup:document.getElementById("matchup"),selectionNote:document.getElementById("selection-note")
    };

    let running=false,round=0,directorDelay=0,directorState="idle",activePlan=null,last=performance.now();
    let showHitboxes=false,shake=0,hitStop=0,resultQueued=false,roundTime=0;
    let counterPending=null,koTime=-1,koFocus={x:W/2,y:GROUND-200};

