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
})();
