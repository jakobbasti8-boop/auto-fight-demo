"use strict";

// Dr. BOB HD integration.
// Uses a dedicated 5x5 base atlas, a 25-frame Kamehameha character atlas,
// and a separate five-part modular beam strip.
(function(){
  const BOB_BASE_ZOOM=.873;
  const KAME_HD_ZOOM=.845;
  const KAME_HD_BASE=.0391;

  bob.cfg.spriteZoom=BOB_BASE_ZOOM;
  bob.cfg.baseline=.0391;
  spriteAssets.bob.portrait={x:.28,y:.08,w:.44,h:.44};
  if(spriteAssets.bob.sheet)renderPortrait("portrait-bob",spriteAssets.bob);

  const bobKameBeam={image:new Image(),sheet:null};
  bobKameBeam.image.onload=()=>{bobKameBeam.sheet=rawSheet(bobKameBeam.image);};
  bobKameBeam.image.onerror=()=>console.warn("Dr. BOB Kamehameha beam atlas failed to load");
  bobKameBeam.image.src="assets/kame-beam.webp";

  // Exactly one move step per source frame. Nothing is skipped.
  MOVES.kame=[
    ["idleA",100,"Fokus"],                 // 01
    ["kmSink",100,"Hände sammeln"],       // 02
    ["kmChargeA",105,"Aufladen"],         // 03
    ["kmChargeA",110,"Aufladen"],         // 04
    ["kmChargeB",115,"Aufladen"],         // 05
    ["kmChargeB",120,"Aufladen"],         // 06
    ["kmChargeB",125,"Aufladen"],         // 07
    ["kmChargeB",130,"Aufladen"],         // 08
    ["kmChargeB",135,"Maximalladung"],    // 09
    ["kmFire",120,"Abschuss vorbereiten"],// 10
    ["kmFire",95,"Abschuss"],             // 11
    ["kmFire",90,"Strahl"],               // 12
    ["kmFire",90,"Strahl"],               // 13
    ["kmFire",90,"Strahl"],               // 14
    ["kmFire",90,"Strahl"],               // 15
    ["kmFire",90,"Strahl"],               // 16
    ["kmFire",100,"Strahl"],              // 17
    ["kmFire",110,"Strahl"],              // 18
    ["kmFire",120,"Nachhall"],            // 19
    ["kmFire",130,"Nachhall"],            // 20
    ["kmSink",130,"Rückstoß"],            // 21
    ["kmSink",150,"Erschöpft"],           // 22
    ["idleB",130,"Aufrichten"],           // 23
    ["idleA",120,"Deckung"],              // 24
    ["idleA",160,"Erholung"]              // 25
  ];

  function bobNormalFrame(f){
    const asset=spriteAssets.bob;
    if(!asset.sheet)return false;
    const frame=f.spriteFrame(),r=frameRect(asset,frame.row,frame.col);
    const dh=f.cfg.displayH/(f.cfg.spriteZoom||1),dw=dh*(r.sw/r.sh);
    const flip=f.face!==asset.defaultFacing;
    ctx.save();
    ctx.translate(Math.round(f.x),Math.round(GROUND+dh*(f.cfg.baseline||0)));
    if(flip)ctx.scale(-1,1);
    ctx.imageSmoothingEnabled=true;
    ctx.imageSmoothingQuality="high";
    ctx.drawImage(asset.sheet,r.sx,r.sy,r.sw,r.sh,-dw/2,-dh,dw,dh);
    if(f.hitFlash>0){
      const a=Math.min(1,f.hitFlash/200)*.8;
      drawTinted(asset.sheet,r.sx,r.sy,r.sw,r.sh,-dw/2,-dh,dw,dh,f.flashCol,a);
    }
    ctx.restore();
    return true;
  }

  function drawKameCharacterHD(f){
    const asset=spriteAssets.kame;
    if(!asset.sheet)return false;
    const idx=clamp(f.moveStep|0,0,24),r=frameRect(asset,(idx/5)|0,idx%5);
    const dh=f.cfg.displayH/KAME_HD_ZOOM,dw=dh*(r.sw/r.sh);
    const flip=f.face!==asset.defaultFacing;
    ctx.save();
    ctx.translate(Math.round(f.x),Math.round(GROUND+dh*KAME_HD_BASE));
    if(flip)ctx.scale(-1,1);
    ctx.imageSmoothingEnabled=true;
    ctx.imageSmoothingQuality="high";
    ctx.drawImage(asset.sheet,r.sx,r.sy,r.sw,r.sh,-dw/2,-dh,dw,dh);
    ctx.restore();
    return true;
  }

  function beamRect(i){
    const sheet=bobKameBeam.sheet,w=sheet.width/5;
    return {sx:i*w,sy:0,sw:w,sh:sheet.height};
  }
  function beamPiece(i,x,y,w,h,alpha=1){
    const r=beamRect(i);
    ctx.save();
    ctx.globalAlpha=alpha;
    ctx.imageSmoothingEnabled=true;
    ctx.imageSmoothingQuality="high";
    ctx.drawImage(bobKameBeam.sheet,r.sx,r.sy,r.sw,r.sh,x,y,w,h);
    ctx.restore();
  }

  function drawBobKameBeam(f,foe){
    if(!bobKameBeam.sheet||!foe||f.key!=="kame")return;
    const step=f.moveStep|0;
    if(step<10||step>19)return;

    const h=f.cfg.displayH,hb=getHurtbox(foe);
    const originX=f.x+f.face*h*.27;
    const originY=GROUND-h*.56;
    const targetX=hb.x+hb.w/2;
    const dist=Math.max(70,Math.abs(targetX-originX));
    const dur=f.move?.[f.moveStep]?.[1]||1;
    const local=clamp(f.stepElapsed/dur,0,1);
    let grow=1;
    if(step===10)grow=.22+.30*local;
    else if(step===11)grow=.52+.48*local;
    const len=dist*grow;
    const size=h*.48;
    const overlap=size*.08;

    ctx.save();
    ctx.translate(originX,originY);
    if(f.face<0)ctx.scale(-1,1);
    ctx.beginPath();
    ctx.rect(-size*.52,-size*.58,len+size*1.12,size*1.16);
    ctx.clip();

    // START module is centered on the palms; LOOP A/B repeat to any opponent distance.
    beamPiece(0,-size*.48,-size*.5,size,size);
    let x=size*.42,n=0;
    while(x<len-size*.58){
      beamPiece(1+(n&1),x,-size*.5,size,size);
      x+=size-overlap;
      n++;
    }
    // Rounded beam head always sits at the current end of the growing beam.
    beamPiece(3,len-size*.48,-size*.5,size,size);
    ctx.restore();

    // Separate impact sprite is overlaid on the opponent after the collision resolves.
    if(f.hitResolved&&step<=19){
      const impact=h*.96;
      const cy=hb.y+hb.h*.48;
      const pulse=.90+.10*Math.sin(f.moveElapsed/34);
      const s=impact*pulse;
      beamPiece(4,targetX-s*.5,cy-s*.5,s,s,step>=18?.72:1);
    }
  }

  // Use the HD base atlas for every ordinary Dr. BOB pose and the dedicated
  // 25-frame atlas only while Kamehameha is active.
  const baseBobDrawFighter=drawFighter;
  drawFighter=function(f,time){
    if(f?.cfg?.key==="bob"){
      if(f.key==="kame"&&drawKameCharacterHD(f))return;
      if(bobNormalFrame(f))return;
    }
    return baseBobDrawFighter(f,time);
  };

  // Replace only Dr. BOB's legacy beam renderer; all other fighter effects keep
  // the existing chain (Theresa, KurzDurch, BrainBug, generic FX).
  const baseBobEffects=effects;
  effects=function(f,foe,time){
    if(f?.cfg?.key==="bob"&&f.key==="kame"){
      drawBobKameBeam(f,foe);
      return;
    }
    return baseBobEffects(f,foe,time);
  };

  // Synchronise collision with the visible modular beam. Hit becomes active only
  // on the sustained firing frames 12-18.
  const baseBobHitbox=activeHitbox;
  activeHitbox=function(f,foe){
    if(f?.cfg?.key==="bob"&&f.key==="kame"){
      if(f.hitResolved||!foe||f.moveStep<11||f.moveStep>17)return null;
      const h=f.cfg.displayH,hb=getHurtbox(foe);
      const ox=f.x+f.face*h*.27,tx=hb.x+hb.w/2;
      const left=Math.min(ox,tx),right=Math.max(ox,tx);
      const cy=GROUND-h*.56;
      return {x:left,y:cy-h*.13,w:Math.max(28,right-left),h:h*.26,type:"beam"};
    }
    return baseBobHitbox(f,foe);
  };
})();
