"use strict";

/* Lt.BrainBug fighter module.
   Main 5x5 atlas: idle / confused gestures / punches / kicks / hit+dizzy.
   Sour-milk special: dedicated 25-frame atlas plus a 4-cell modular beam atlas. */
(function(){
  const asset={
    image:new Image(),sheet:null,defaultFacing:1,raw:true,
    portrait:{x:.285,y:.025,w:.43,h:.43}
  };
  const sourAsset={image:new Image(),sheet:null};
  const beamAsset={image:new Image(),sheet:null};
  spriteAssets.brainbug=asset;

  let brainbugReadyCount=0;
  let brainbugLoadFailed=false;
  const startBtn=document.getElementById("demo-start");
  const originalMaybeEnableStart=maybeEnableStart;
  maybeEnableStart=function(){
    if(brainbugLoadFailed){
      startBtn.disabled=true;
      startBtn.textContent="Lt.BrainBug-Assets fehlen";
      return;
    }
    if(brainbugReadyCount<3){
      startBtn.disabled=true;
      startBtn.textContent="Lt.BrainBug wird geladen …";
      return;
    }
    originalMaybeEnableStart();
  };
  startBtn.disabled=true;
  startBtn.textContent="Lt.BrainBug wird geladen …";

  function brainAssetLoaded(target){
    target.sheet=rawSheet(target.image);
    brainbugReadyCount++;
    maybeEnableStart();
  }
  function brainAssetFailed(){
    brainbugLoadFailed=true;
    startBtn.disabled=true;
    startBtn.textContent="Lt.BrainBug-Asset fehlt";
    ui.selectionNote.textContent="Lt.BrainBug oder sein Spezialkatalog konnte nicht geladen werden.";
  }
  asset.image.onload=()=>brainAssetLoaded(asset);
  sourAsset.image.onload=()=>brainAssetLoaded(sourAsset);
  beamAsset.image.onload=()=>brainAssetLoaded(beamAsset);
  asset.image.onerror=sourAsset.image.onerror=beamAsset.image.onerror=brainAssetFailed;
  asset.image.src="assets/brainbug.webp";
  sourAsset.image.src="assets/brainbug-sourmilk-special.webp";
  beamAsset.image.src="assets/brainbug-sourmilk-beam.webp";

  MOVES.brainFlail=[
    ["idleB",180,"Orientierung"],
    ["chamberR",150,"Ausholen"],
    ["punchR",95,"Treffer"],
    ["windLowR",130,"Ausholen"],
    ["kickLowR",105,"Treffer"],
    ["stagger",250,"Taumeln"],
    ["idleA",240,"Erholung"]
  ];

  // 25 catalog frames, one move step per source image.
  MOVES.sourMilkBurst=[
    ["idleA",105,"Start"],
    ["idleB",110,"Ausrüstung greifen"],
    ["idleA",120,"Schüssel"],
    ["idleB",125,"Cornflakes"],
    ["idleA",150,"Cornflakes eingießen"],
    ["idleB",120,"Milch"],
    ["idleA",155,"Milch eingießen"],
    ["idleB",105,"Löffel"],
    ["idleA",110,"Löffel nehmen"],
    ["idleB",145,"Probieren"],
    ["stagger",140,"Sauer!"],
    ["stagger",160,"Übelkeit"],
    ["stagger",180,"Backen aufblasen"],
    ["kmChargeA",215,"Aufladen"],
    ["kmChargeB",245,"Maximalladung"],
    ["kmFire",95,"Erbrechen startet"],
    ["kmFire",105,"Säurestrahl"],
    ["kmFire",110,"Säurestrahl"],
    ["kmFire",125,"Treffer"],
    ["stagger",150,"Rückstoß"],
    ["getUp1",230,"Auf die Knie"],
    ["kdGround",300,"Falsch gedreht"],
    ["getUp2",190,"Orientieren"],
    ["idleB",220,"Kopf kratzen"],
    ["idleA",240,"Benommen zurück"]
  ];
  MOVES.hitSourMilk=[
    ["flailA",110,"Getroffen"],
    ["flailB",190,"Betäubt"],
    ["stagger",260,"Taumeln"],
    ["idleA",180,"Erholung"]
  ];

  COMBOS.brainbug=[
    {name:"WRONG WAY",keys:["punchR","kickLowL","punchL"]},
    {name:"LOST FORMATION",keys:["kickHighR","punchR","jumpKick"]}
  ];
  SPECIAL_COMBOS.brainbug={name:"SOUR MILK SURGE",keys:["punchL","kickLowR","sourMilkBurst"]};

  const brainbug=new Fighter({
    name:"LT.BRAINBUG",short:"LT.BRAINBUG",key:"brainbug",specialKey:"sourMilkBurst",asset:"brainbug",
    displayH:330,spriteZoom:.94,baseline:.052,hurtW:.43,startX:760,face:1,
    scale:1.16,girth:.94,walkSpeed:.175,hair:"helmet",doctor:false,
    col:{skin:"#d9a279",skinD:"#9f684c",hair:"#4a2e20",hairD:"#24150f",shirt:"#7c7449",shirtD:"#4d492e",
      pants:"#69623e",pantsD:"#403c27",boot:"#3a2b1f",bootD:"#1d1712"}
  });
  allFighters.push(brainbug);
  fighterByKey.brainbug=brainbug;
  fighterLabel.brainbug="LT.BRAINBUG";

  const baseSpriteFrame=Fighter.prototype.spriteFrame;
  Fighter.prototype.spriteFrame=function(){
    if(this.cfg.key!=="brainbug")return baseSpriteFrame.call(this);
    if(this.ko)return {row:4,col:4};
    if(this.move){
      const total=this.move.reduce((sum,f)=>sum+f[1],0);
      const progress=clamp(this.moveElapsed/total,0,.999);
      const phase=this.move[this.moveStep]?.[2];
      if(this.key==="sourMilkBurst")return {row:0,col:0};
      if(this.key==="brainFlail"){
        if(phase==="Orientierung")return {row:1,col:Math.min(4,Math.floor((this.stepElapsed/180)*5))};
        if(phase==="Ausholen")return this.moveStep<3?{row:2,col:1}:{row:3,col:0};
        if(phase==="Treffer")return this.moveStep<4?{row:2,col:3}:{row:3,col:3};
        if(phase==="Taumeln")return {row:4,col:1};
        return {row:0,col:4};
      }
      if(this.key.startsWith("block"))return {row:2,col:0};
      if(this.key.startsWith("hit")){
        if(phase==="Aufstehen")return {row:4,col:Math.max(0,3-Math.floor((this.stepElapsed/(this.move[this.moveStep][1]||1))*3))};
        return {row:4,col:Math.min(4,Math.floor(progress*5))};
      }
      if(this.key.startsWith("kick")||this.key==="jumpKick")return {row:3,col:Math.min(4,Math.floor(progress*5))};
      if(this.key.startsWith("punch")||this.key==="headbutt")return {row:2,col:Math.min(4,Math.floor(progress*5))};
      return {row:1,col:Math.min(4,Math.floor(progress*5))};
    }
    if(Math.abs(this.vx)>.01){
      let col=Math.floor(this.walkCycle)%5;
      if(this.vx*this.face<0)col=4-col;
      return {row:0,col};
    }
    const col=Math.floor(this.idleTime*2.15)%5;
    return Math.floor(this.idleTime/3.6)%3===2?{row:1,col}:{row:0,col};
  };

  const baseBrainUpdate=Fighter.prototype.update;
  Fighter.prototype.update=function(dt){
    baseBrainUpdate.call(this,dt);
    if(this.cfg.key!=="brainbug")return;
    const wrong=this.key==="sourMilkBurst"&&this.move?.[this.moveStep]?.[2]==="Falsch gedreht";
    if(wrong&&!this._brainWrongWay){
      this.face*=-1;
      this._brainWrongWay=true;
    }else if(!wrong&&this._brainWrongWay){
      this.face*=-1;
      this._brainWrongWay=false;
    }
  };

  const baseAttackInfo=attackInfo;
  attackInfo=function(key){
    if(key==="sourMilkBurst"){
      return {...ATTACKS.special,type:"special",reaction:"hitSourMilk",damage:24,range:9999,knock:54,blockChance:.06};
    }
    if(key==="brainFlail")return {keys:["brainFlail"],reaction:"hitKickHigh",damage:17,range:270,knock:58,type:"brainFlail"};
    return baseAttackInfo(key);
  };

  const baseActiveHitbox=activeHitbox;
  activeHitbox=function(f,foe){
    if(f.key==="sourMilkBurst"&&!f.hitResolved&&f.moveStep>=16&&f.moveStep<=19&&foe){
      const h=f.cfg.displayH,hb=getHurtbox(foe);
      const mouthX=f.x+f.face*h*.11;
      const mouthY=GROUND-h*.57;
      const targetX=hb.x+hb.w/2;
      const left=Math.min(mouthX,targetX),right=Math.max(mouthX,targetX);
      return {x:left,y:mouthY-h*.12,w:Math.max(28,right-left),h:h*.24,type:"sourMilk"};
    }
    if(f.key==="brainFlail"&&!f.hitResolved&&f.move?.[f.moveStep]?.[2]==="Treffer"){
      const h=f.cfg.displayH;
      const second=f.moveStep>=4;
      const r=h*(second?.095:.085);
      const cx=f.x+f.face*h*(second?.43:.38);
      const cy=GROUND-h*(second?.31:.56);
      return {x:cx-r,y:cy-r,w:r*2,h:r*2,type:"melee"};
    }
    return baseActiveHitbox(f,foe);
  };

  function specialCell(idx){
    idx=clamp(idx|0,0,24);
    const sw=sourAsset.sheet.width/5,sh=sourAsset.sheet.height/5;
    return {sx:(idx%5)*sw,sy:((idx/5)|0)*sh,sw,sh};
  }
  function beamCell(idx){
    idx=clamp(idx|0,0,3);
    const sw=beamAsset.sheet.width/4,sh=beamAsset.sheet.height;
    return {sx:idx*sw,sy:0,sw,sh};
  }
  function drawSourMilkFrame(f){
    if(!sourAsset.sheet)return false;
    const idx=clamp(f.moveStep|0,0,24),r=specialCell(idx);
    const dh=f.cfg.displayH/(f.cfg.spriteZoom||1),dw=dh;
    ctx.save();
    ctx.translate(Math.round(f.x),Math.round(GROUND+dh*(f.cfg.baseline||0)));
    if(f.face<0)ctx.scale(-1,1);
    ctx.imageSmoothingEnabled=true;
    ctx.imageSmoothingQuality="high";
    ctx.drawImage(sourAsset.sheet,r.sx,r.sy,r.sw,r.sh,-dw/2,-dh,dw,dh);
    ctx.restore();
    return true;
  }
  function drawBeamPiece(cellIdx,x,y,w,h){
    const r=beamCell(cellIdx);
    ctx.drawImage(beamAsset.sheet,r.sx,r.sy,r.sw,r.sh,x,y,w,h);
  }
  function drawSourMilkBeam(f,foe){
    if(!beamAsset.sheet||!foe)return;
    const h=f.cfg.displayH,hb=getHurtbox(foe);
    const mouthX=f.x+f.face*h*.11;
    const mouthY=GROUND-h*.57;
    const targetX=hb.x+hb.w/2;
    const dist=Math.max(40,Math.abs(targetX-mouthX));
    const beamH=h*.82;
    const segW=h*.63;
    const step=segW*.68;
    const impact=f.moveStep>=18||f.hitResolved;

    ctx.save();
    ctx.translate(mouthX,mouthY);
    if(f.face<0)ctx.scale(-1,1);
    ctx.imageSmoothingEnabled=true;
    ctx.imageSmoothingQuality="high";
    ctx.beginPath();
    ctx.rect(-14,-beamH/2,dist+24,beamH);
    ctx.clip();
    drawBeamPiece(0,-24,-beamH/2,segW,beamH);
    let x=step*.72,i=0;
    while(x<dist-segW*.26){
      drawBeamPiece(1+(i%2),x,-beamH/2,segW,beamH);
      x+=step;
      i++;
    }
    ctx.restore();

    if(impact){
      const r=beamCell(3);
      const size=h*1.26;
      const cy=hb.y+hb.h*.47;
      ctx.save();
      ctx.imageSmoothingEnabled=true;
      ctx.imageSmoothingQuality="high";
      ctx.globalAlpha=f.moveStep===19?.76:1;
      ctx.drawImage(beamAsset.sheet,r.sx,r.sy,r.sw,r.sh,targetX-size*.5,cy-size*.62,size,size*1.24);
      ctx.restore();
    }
  }

  const baseBrainDrawFighter=drawFighter;
  drawFighter=function(f,time){
    if(f?.cfg?.key==="brainbug"&&f.key==="sourMilkBurst"&&drawSourMilkFrame(f))return;
    return baseBrainDrawFighter(f,time);
  };

  const baseBrainEffects=effects;
  effects=function(f,foe,time){
    if(f?.cfg?.key==="brainbug"&&f.key==="sourMilkBurst"){
      if(f.moveStep>=15&&f.moveStep<=19)drawSourMilkBeam(f,foe);
      return;
    }
    return baseBrainEffects(f,foe,time);
  };

  const baseDecideBlock=decideBlock;
  decideBlock=function(defender,info){
    if(defender?.cfg?.key==="brainbug"&&Math.random()<.48)return false;
    return baseDecideBlock(defender,info);
  };

  const baseSetPlan=setPlan;
  setPlan=function(){
    baseSetPlan();
    if(!activePlan||activePlan.attacker?.cfg?.key!=="brainbug")return;
    if(Math.random()<.38){
      const a=activePlan.attacker;
      activePlan.prestep=true;
      a.moveTarget=clamp(a.x-a.face*(70+Math.random()*95),160,W-160);
      directorState="feint";
      if(Math.random()<.55)spawnPopup(a.x,GROUND-a.cfg.displayH*.95,choose(["WO BIN ICH?","FALSCHE RICHTUNG","HM?"]),"#d7d9a0");
    }
  };

  const baseLaunchPlan=launchPlan;
  launchPlan=function(){
    const sourSpecial=activePlan?.key==="sourMilkBurst";
    const brainSpecial=activePlan?.key==="brainFlail";
    baseLaunchPlan();
    if(sourSpecial)ui.status.textContent="SAURE-MILCH-STRAHL";
    else if(brainSpecial)ui.status.textContent="LOST PATROL";
  };

  drawHitboxes=function(){
    fighters.flatMap(a=>fighters.filter(d=>d!==a).map(d=>[a,d])).forEach(([a,d])=>{
      const hurt=getHurtbox(a),hit=activeHitbox(a,d);
      ctx.save();ctx.lineWidth=3;ctx.strokeStyle="rgba(70,195,255,.95)";ctx.fillStyle="rgba(70,195,255,.16)";
      ctx.fillRect(hurt.x,hurt.y,hurt.w,hurt.h);ctx.strokeRect(hurt.x,hurt.y,hurt.w,hurt.h);
      if(hit){ctx.strokeStyle="rgba(255,72,76,.98)";ctx.fillStyle="rgba(255,72,76,.2)";ctx.fillRect(hit.x,hit.y,hit.w,hit.h);ctx.strokeRect(hit.x,hit.y,hit.w,hit.h)}
      ctx.restore();
    });
  };

  document.querySelectorAll(".pick-row").forEach(row=>{
    if(row.querySelector('[data-fighter="brainbug"]'))return;
    const b=document.createElement("button");
    b.className="pick";b.type="button";b.dataset.fighter="brainbug";b.setAttribute("aria-pressed","false");
    b.textContent="Lt.BrainBug";
    b.addEventListener("click",()=>selectTeam(row.dataset.side,"brainbug"));
    row.appendChild(b);
  });
})();
