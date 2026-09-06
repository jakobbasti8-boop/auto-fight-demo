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
    ["idleB",130,"Aufrichten"],            // 23
    ["idleA",120,"Deckung"],              // 24
    ["idleA",160,"Erholung"]              // 25
  ];

  // Exact semantic mapping for the supplied normal-animation sheet:
  // row 1 idle, row 2 walk/run, row 3 crouch/punch/guard,
  // row 4 kick sequence, row 5 hit/knockdown/KO.
  function bobBaseFrame(f){
    if(f.ko)return {row:4,col:4};
    if(!f.move){
      if(Math.abs(f.vx)>.01){
        let col=Math.floor(f.walkCycle)%5;
        if(f.vx*f.face<0)col=4-col;
        return {row:1,col};
      }
      return {row:0,col:Math.floor(f.idleTime*4.2)%5};
    }

    const key=f.key||"",step=f.moveStep|0,phase=f.move?.[step]?.[2]||"";

    if(key.startsWith("block"))return {row:2,col:4};

    if(key.startsWith("hit")){
      if(phase==="Aufstehen"){
        const k=clamp(f.stepElapsed/(f.move?.[step]?.[1]||1),0,.999);
        return k<.34?{row:4,col:3}:k<.68?{row:4,col:2}:{row:4,col:1};
      }
      if(phase==="Am Boden"||phase==="Aufschlag")return {row:4,col:4};
      if(phase==="Wegfliegen")return {row:4,col:2};
      if(phase==="Taumeln"||phase==="Getroffen")return {row:4,col:1};
      return {row:4,col:0};
    }

    if(key.startsWith("punch")){
      if(phase==="Ausholen")return {row:2,col:1};
      if(phase==="Treffer")return {row:2,col:step%2?3:2};
      return {row:2,col:4};
    }

    if(key==="headbutt"){
      if(phase==="Ausholen")return {row:2,col:0};
      if(phase==="Treffer")return {row:2,col:3};
      return {row:2,col:4};
    }

    if(key.startsWith("kickHigh")){
      if(phase==="Ausholen"||phase==="Zurück")return {row:3,col:step%2?1:0};
      if(phase==="Treffer")return {row:3,col:step%2?3:2};
      return {row:3,col:4};
    }

    if(key.startsWith("kickLow")){
      if(phase==="Absenken")return {row:2,col:0};
      if(phase==="Ausholen"||phase==="Zurück")return {row:3,col:1};
      if(phase==="Treffer")return {row:3,col:2};
      return {row:3,col:4};
    }

    if(key==="jumpKick"){
      if(phase==="Absprung")return {row:2,col:0};
      if(phase==="Aufstieg")return {row:3,col:0};
      if(phase==="Treffer")return {row:3,col:3};
      if(phase==="Fallen")return {row:3,col:1};
      if(phase==="Landung")return {row:3,col:4};
    }

    return f.spriteFrame();
  }

  function bobNormalFrame(f){
    const asset=spriteAssets.bob;
    if(!asset.sheet)return false;
    const frame=bobBaseFrame(f),r=frameRect(asset,frame.row,frame.col);
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

    beamPiece(0,-size*.48,-size*.5,size,size);
    let x=size*.42,n=0;
    while(x<len-size*.58){
      beamPiece(1+(n&1),x,-size*.5,size,size);
      x+=size-overlap;
      n++;
    }
    beamPiece(3,len-size*.48,-size*.5,size,size);
    ctx.restore();

    if(f.hitResolved&&step<=19){
      const impact=h*.96;
      const cy=hb.y+hb.h*.48;
      const pulse=.90+.10*Math.sin(f.moveElapsed/34);
      const s=impact*pulse;
      beamPiece(4,targetX-s*.5,cy-s*.5,s,s,step>=18?.72:1);
    }
  }

  const baseBobDrawFighter=drawFighter;
  drawFighter=function(f,time){
    if(f?.cfg?.key==="bob"){
      if(f.key==="kame"&&drawKameCharacterHD(f))return;
      if(bobNormalFrame(f))return;
    }
    return baseBobDrawFighter(f,time);
  };

  const baseBobEffects=effects;
  effects=function(f,foe,time){
    if(f?.cfg?.key==="bob"&&f.key==="kame"){
      drawBobKameBeam(f,foe);
      return;
    }
    return baseBobEffects(f,foe,time);
  };

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
