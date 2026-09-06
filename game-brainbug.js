"use strict";

/* Lt.BrainBug fighter module.
   Main 5x5 atlas: idle / confused gestures / punches / kicks / hit+dizzy.
   Sour-milk special: dedicated 25-frame atlas plus a 4-cell modular beam atlas. */
(function(){
  // Blaetter kommen aus dem Katalog; hier stehen nur noch schmale Bruecken.
  const asset={catalog:"brainbug",defaultFacing:1,image:null,sheet:null,portrait:null};
  const sourAsset={catalog:"brainbug-sourmilk",image:null,sheet:null};
  const beamAsset={catalog:"brainbug-sourmilk-beam",image:null,sheet:null};
  spriteAssets.brainbug=asset;

  SPRITES.ready(function(missing){
    [asset,sourAsset,beamAsset].forEach(shim=>{
      const entry=SPRITES.get(shim.catalog);
      if(!entry||!entry.ok)return;
      shim.entry=entry;shim.image=entry.img;shim.sheet=entry.img;
      shim.defaultFacing=entry.defaultFacing;
      if(!shim.portrait&&typeof portraitRect==="function")shim.portrait=portraitRect(entry);
    });
    if(typeof applyCatalogMetrics==="function")applyCatalogMetrics();
    if(asset.sheet&&document.getElementById("portrait-brainbug"))
      renderPortrait("portrait-brainbug",asset);
    maybeEnableStart();
  });

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
    ["idleA",105,"Start"],                  // 01
    ["idleB",110,"Ausrüstung greifen"],     // 02
    ["idleA",120,"Schüssel"],               // 03
    ["idleB",125,"Cornflakes"],             // 04
    ["idleA",150,"Cornflakes eingießen"],   // 05
    ["idleB",120,"Milch"],                  // 06
    ["idleA",155,"Milch eingießen"],        // 07
    ["idleB",105,"Löffel"],                 // 08
    ["idleA",110,"Löffel nehmen"],          // 09
    ["idleB",145,"Probieren"],               // 10
    ["stagger",140,"Sauer!"],               // 11
    ["stagger",160,"Übelkeit"],              // 12
    ["stagger",180,"Backen aufblasen"],     // 13
    ["kmChargeA",215,"Aufladen"],           // 14
    ["kmChargeB",245,"Maximalladung"],      // 15
    ["kmFire",95,"Erbrechen startet"],      // 16
    ["kmFire",105,"Säurestrahl"],           // 17
    ["kmFire",110,"Säurestrahl"],           // 18
    ["kmFire",125,"Treffer"],               // 19
    ["stagger",150,"Rückstoß"],             // 20
    ["getUp1",230,"Auf die Knie"],          // 21
    ["kdGround",300,"Falsch gedreht"],      // 22
    ["getUp2",190,"Orientieren"],            // 23
    ["idleB",220,"Kopf kratzen"],           // 24
    ["idleA",240,"Benommen zurück"]          // 25
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

  // Die Bildauswahl steht jetzt im Bewegungskatalog (game-catalog.js,
  // MOVEMENT.brainbug) - hier ist keine eigene Zeilenrechnerei mehr noetig.

  // During cooldown frame 22 he physically turns away from the opponent for 300 ms,
  // then restores the original facing before scratching his head.
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
    if(f.key==="sourMilkBurst"&&!f.hitResolved&&f.moveStep>=18&&f.moveStep<=19&&foe){
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

  function beamCell(idx){
    const entry=beamAsset.entry;
    return spriteRect(entry,clamp(idx|0,0,entry.cols-1));
  }
  function drawBeamPiece(cellIdx,x,y,w,h){
    const r=beamCell(cellIdx);
    ctx.drawImage(beamAsset.sheet,r.sx,r.sy,r.sw,r.sh,x,y,w,h);
  }
  function drawSourMilkBeam(f,foe){
    if(!beamAsset.sheet||!beamAsset.entry||!foe)return;
    const h=f.cfg.displayH,hb=getHurtbox(foe);
    const mouthX=f.x+f.face*h*.11;
    const mouthY=GROUND-h*.57;
    const targetX=hb.x+hb.w/2;
    const dist=Math.max(40,Math.abs(targetX-mouthX));
    const beamH=h*.82;
    const segW=h*.63;
    const step=segW*.68;
    const impact=f.moveStep>=18;

    ctx.save();
    ctx.translate(mouthX,mouthY);
    if(f.face<0)ctx.scale(-1,1);
    ctx.imageSmoothingEnabled=true;
    ctx.imageSmoothingQuality="high";
    ctx.beginPath();
    ctx.rect(-14,-beamH/2,dist+24,beamH);
    ctx.clip();

    // First cell is the mouth/start module; cells 2/3 are repeatable middle modules.
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
