"use strict";

// Theresa MachsLochuff — Protonen-Roundhouse V2
// 25-Panel-Katalog: Fokus -> gelbe Ladung -> lila Protonenaura ->
// Roundhouse/Abwärtstreffer -> gelb-lila Detonation -> Kusshand.
theresaProton.durations=[90,90,100,110,120,120,120,130,130,140,95,85,80,80,90,90,100,110,120,110,95,100,110,130,150];

MOVES.protonKick=[
  ["idleA",90,"Fokus"],["idleB",90,"Fokus"],["windHighR",100,"Kammer"],
  ["windHighR",110,"Protonenladung"],["windHighR",120,"Protonenladung"],["windHighR",120,"Protonenladung"],["windHighR",120,"Protonenladung"],["windHighR",130,"Ladungsspitze"],
  ["windHighR",130,"Lila Protonenaura"],["windHighR",140,"Maximalladung"],
  ["windHighR",95,"Ausholen"],["kickHighR",85,"Roundhouse"],["kickHighR",80,"Roundhouse"],["kickHighR",80,"Abwärtsschlag"],
  ["kickHighR",90,"Treffer"],["kickHighR",90,"Detonation"],["kickHighR",100,"Photonenkern"],["kickHighR",110,"Detonationsspitze"],
  ["windHighR",120,"Schockwelle"],["windHighR",110,"Explosionsnachhall"],
  ["sinkR",95,"Abklingen"],["idleB",100,"Pose"],["idleA",110,"Kusshand"],["idleA",130,"Kusshand"],["idleA",150,"Erholung"]
];
SPECIAL_COMBOS.nova={name:"PROTON ROUNDHOUSE",keys:["punchR","kickHighL","protonKick"]};

const theresaBaseHitbox=getAttackHitbox;
getAttackHitbox=function(f,foe){
  if(f.key==="protonKick"){
    if(f.moveStep<11||f.moveStep>14)return null;
    const h=f.cfg.displayH,reach=h*1.02,cx=f.x+f.face*h*.55,cy=GROUND-h*.53;
    return {x:cx-reach*.48,y:cy-h*.28,w:reach*.96,h:h*.56,type:"proton"};
  }
  return theresaBaseHitbox(f,foe);
};

const theresaBaseAttackInfo=attackInfo;
attackInfo=function(key){
  if(key==="protonKick")return {...ATTACKS.special,type:"special",reaction:"hitBeam",damage:30,range:330,knock:145};
  return theresaBaseAttackInfo(key);
};

decideBlock=function(defender,info){
  if(defender.ko||defender.move||defender.blockCool>0)return false;
  let chance=info.type==="special"?.08:.32;
  if(defender.health<40)chance+=.13;
  return Math.random()<chance;
};

function drawTheresaProtonFx(f,foe,time){
  const step=f.moveStep,h=f.cfg.displayH;
  const footX=f.x+f.face*h*.46,footY=GROUND-h*.50;
  ctx.save();
  if(step>=3&&step<=9){
    const p=clamp((step-3)/6,0,1),pulse=.75+.25*Math.sin(time*16);
    for(let r=0;r<3;r++){
      ctx.globalAlpha=(.18+.22*p)*(1-r*.18);
      ctx.strokeStyle=r===2?"#b845ff":"#ffe85b";
      ctx.lineWidth=2.5+3.5*p;
      ctx.beginPath();
      ctx.ellipse(footX,footY,20+18*r+22*p,10+10*r+12*p,time*(1.1+r*.22),0,Math.PI*2);
      ctx.stroke();
    }
    ctx.globalAlpha=.58+.28*pulse;
    ctx.fillStyle="#fff7a8";
    ctx.beginPath();ctx.arc(footX,footY,5+11*p,0,Math.PI*2);ctx.fill();
  }
  if(step>=10&&step<=14){
    const p=clamp((step-10)/4,0,1);
    ctx.globalAlpha=.24+.34*p;ctx.lineCap="round";
    ctx.strokeStyle="#c34cff";ctx.lineWidth=12-3*p;
    ctx.beginPath();ctx.arc(f.x,GROUND-h*.49,h*(.34+.12*p),-1.4,1.05);ctx.stroke();
    ctx.strokeStyle="#ffe65b";ctx.lineWidth=5+3*p;
    ctx.beginPath();ctx.arc(f.x,GROUND-h*.49,h*(.32+.11*p),-1.4,1.05);ctx.stroke();
  }
  if(step>=14&&step<=19&&foe){
    const hb=getHurtbox(foe),tx=hb.x+hb.w/2,ty=hb.y+hb.h*.56,p=clamp((step-14)/5,0,1);
    for(let r=0;r<3;r++){
      ctx.globalAlpha=(.48-.12*r)*(1-p*.35);
      ctx.strokeStyle=r%2?"#ffea61":"#bd4cff";
      ctx.lineWidth=8-1.5*r;
      ctx.beginPath();ctx.arc(tx,ty,32+r*30+p*(58+r*18),0,Math.PI*2);ctx.stroke();
    }
    ctx.globalAlpha=.22*(1-p);ctx.fillStyle="#fff4a6";
    ctx.beginPath();ctx.arc(tx,ty,44+120*p,0,Math.PI*2);ctx.fill();
  }
  ctx.restore();
}

const theresaBaseEffects=effects;
effects=function(f,foe,time){
  if(f&&f.key==="protonKick"){drawTheresaProtonFx(f,foe,time);return;}
  return theresaBaseEffects(f,foe,time);
};

// Die 25 URLs bleiben kompatibel mit game-boot.js. Im Repo teilen sich jeweils
// fünf URLs denselben Row-Atlas-Blob; hier wird die korrekte Zelle ausgeschnitten.
drawTheresaProtonKick=function(f){
  const idx=Math.max(0,Math.min(24,f.moveStep)),img=theresaProton.frames[idx];
  if(!img||!img.complete)return;
  const sx=(idx%5)*theresaProton.frameW;
  const dh=f.cfg.displayH*1.10,dw=dh*(theresaProton.frameW/theresaProton.frameH),flip=f.face<0;
  ctx.save();ctx.translate(Math.round(f.x),Math.round(GROUND+2));if(flip)ctx.scale(-1,1);
  ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality="high";
  ctx.drawImage(img,sx,0,theresaProton.frameW,theresaProton.frameH,-dw/2,-dh,dw,dh);
  if(f.hitFlash>0){
    const a=Math.min(1,f.hitFlash/200)*.8;
    drawTinted(img,sx,0,theresaProton.frameW,theresaProton.frameH,-dw/2,-dh,dw,dh,f.flashCol,a);
  }
  ctx.restore();
};
