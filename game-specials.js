"use strict";

// 25-Frame-Spezialkataloge: Theresa Proton Roundhouse + KurzDurch Microwave Meteor.
function loadSpecialCatalog(prefix){
  return Array.from({length:5},(_,row)=>{
    const img=new Image();
    img.onload=noteSpecialRowLoaded;
    img.src=`assets/${prefix}-row-${row+1}.webp`;
    return img;
  });
}
const theresaCatalogRows=loadSpecialCatalog("theresa-proton");
const kurzCometCatalogRows=loadSpecialCatalog("kurz-comet");

function specialCatalogCell(rows,idx){
  idx=clamp(idx|0,0,24);
  const row=(idx/5)|0,col=idx%5,img=rows[row];
  const sw=img&&img.naturalWidth?img.naturalWidth/5:100;
  const sh=img&&img.naturalHeight?img.naturalHeight:100;
  return {img,sx:col*sw,sy:0,sw,sh};
}
function drawSpecialCatalogFrame(rows,f,idx,opts={}){
  const cell=specialCatalogCell(rows,idx),img=cell.img;
  if(!img||!img.complete||!img.naturalWidth)return false;
  const target=opts.target||f;
  const dh=f.cfg.displayH*(opts.scale||1.16),dw=dh;
  const baseY=opts.baseY==null?GROUND+4:opts.baseY;
  const flip=opts.flip===false?false:f.face<0;
  ctx.save();ctx.translate(Math.round(target.x),Math.round(baseY));
  if(flip)ctx.scale(-1,1);
  ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality="high";
  ctx.drawImage(img,cell.sx,cell.sy,cell.sw,cell.sh,-dw/2,-dh,dw,dh);
  ctx.restore();return true;
}
function nearestSpecialFoe(f){
  return fighters.filter(x=>x!==f&&!x.ko).sort((a,b)=>Math.abs(a.x-f.x)-Math.abs(b.x-f.x))[0]||null;
}

// Theresa: gelbe Protonenladung -> lila Aura -> Roundhouse/Abwärtstreffer -> Explosion -> Kusshand.
MOVES.protonKick=[
  ["idleA",90,"Fokus"],["idleB",90,"Fokus"],["windHighR",100,"Kammer"],
  ["windHighR",110,"Protonenladung"],["windHighR",120,"Protonenladung"],
  ["windHighR",120,"Protonenladung"],["windHighR",120,"Protonenladung"],
  ["windHighR",130,"Ladungsspitze"],["windHighR",130,"Lila Protonenaura"],
  ["windHighR",140,"Maximalladung"],["windHighR",95,"Ausholen"],
  ["kickHighR",85,"Roundhouse"],["kickHighR",80,"Roundhouse"],
  ["kickHighR",80,"Abwärtsschlag"],["kickHighR",90,"Treffer"],
  ["kickHighR",90,"Detonation"],["kickHighR",100,"Photonenkern"],
  ["kickHighR",110,"Detonationsspitze"],["windHighR",120,"Schockwelle"],
  ["windHighR",110,"Explosionsnachhall"],["sinkR",95,"Abklingen"],
  ["idleB",100,"Pose"],["idleA",110,"Kusshand"],["idleA",130,"Kusshand"],["idleA",150,"Erholung"]
];
nova.cfg.specialKey="protonKick";
SPECIAL_COMBOS.nova={name:"PROTON ROUNDHOUSE",keys:["punchR","kickHighL","protonKick"]};

// KurzDurch: Mikrowelle aufsetzen -> rote Blitzladung -> Komet heranziehen -> Wurf -> Explosion -> Lachen.
MOVES.comet=[
  ["idleA",105,"Fokus"],["idleB",105,"Ausholen"],["cmRaiseA",115,"Mikrowelle greifen"],
  ["cmRaiseA",115,"Mikrowelle öffnen"],["cmRaiseA",120,"Helm aufsetzen"],
  ["cmRaiseB",120,"Mikrowellenhelm"],["cmRaiseB",125,"Aura startet"],
  ["cmRaiseB",125,"Rote Blitze"],["cmRaiseB",130,"Rote Blitze"],["cmRaiseB",135,"Maximalladung"],
  ["cmRaiseA",135,"Arme hoch"],["cmRaiseB",140,"Himmel laden"],["cmRaiseB",140,"Komet erfassen"],
  ["cmRaiseB",145,"Komet heranziehen"],["cmRaiseB",155,"Riesenkomet"],
  ["cmThrow",110,"Wurf vorbereiten"],["cmThrow",120,"Blitzwurf"],["cmThrow",135,"Komet fliegt"],
  ["cmAfter",110,"Einschlag"],["cmAfter",120,"Blitzexplosion"],["cmAfter",135,"Explosionsnachhall"],
  ["idleB",120,"Mikrowelle abnehmen"],["idleA",125,"Triumph"],["idleA",135,"Lachen"],["idleA",160,"Erholung"]
];
SPECIAL_COMBOS.kurz={name:"MICROWAVE METEOR",keys:["kickLowR","punchL","jumpKick","comet"]};

const baseSpecialHitbox=activeHitbox;
activeHitbox=function(f,foe){
  if(f.key==="protonKick"){
    if(f.hitResolved||f.moveStep<14||f.moveStep>19)return null;
    const hb=getHurtbox(foe);return {x:hb.x-54,y:hb.y-70,w:hb.w+108,h:hb.h+118,type:"proton"};
  }
  if(f.key==="comet"){
    if(f.hitResolved||f.moveStep<18||f.moveStep>20)return null;
    const hb=getHurtbox(foe);return {x:hb.x-74,y:hb.y-92,w:hb.w+148,h:hb.h+150,type:"comet"};
  }
  return baseSpecialHitbox(f,foe);
};

const baseSpecialAttackInfo=attackInfo;
attackInfo=function(key){
  if(key==="protonKick")return {...ATTACKS.special,type:"special",reaction:"hitBeam",damage:30,range:9999,knock:145,blockChance:.08};
  if(key==="comet")return {...ATTACKS.special,type:"special",reaction:"hitComet",damage:34,range:9999,knock:168,blockChance:.04};
  return baseSpecialAttackInfo(key);
};
const baseSpecialBlock=decideBlock;
decideBlock=function(defender,info){
  if(info&&info.blockChance!=null){
    if(defender.ko||defender.move||defender.blockCool>0)return false;
    let chance=info.blockChance;if(defender.health<40)chance+=.04;return Math.random()<chance;
  }
  return baseSpecialBlock(defender,info);
};

const baseSpecialDrawFighter=drawFighter;
drawFighter=function(f,time){
  if(f&&f.cfg.key==="nova"&&f.key==="protonKick"){
    const idx=clamp(f.moveStep|0,0,24);
    if(idx>=15&&idx<=19)return;
    if(drawSpecialCatalogFrame(theresaCatalogRows,f,idx,{scale:1.13}))return;
  }
  if(f&&f.cfg.key==="kurz"&&f.key==="comet"){
    const idx=clamp(f.moveStep|0,0,24);
    if(idx>=18&&idx<=20)return;
    if(drawSpecialCatalogFrame(kurzCometCatalogRows,f,idx,{scale:1.18}))return;
  }
  return baseSpecialDrawFighter(f,time);
};

const baseSpecialEffects=effects;
effects=function(f,foe,time){
  if(f&&f.cfg.key==="nova"&&f.key==="protonKick"){
    const idx=clamp(f.moveStep|0,0,24);
    if(idx>=15&&idx<=19){const target=foe||nearestSpecialFoe(f);if(target)drawSpecialCatalogFrame(theresaCatalogRows,f,idx,{target,scale:1.48,flip:false,baseY:GROUND+18});}
    return;
  }
  if(f&&f.cfg.key==="kurz"&&f.key==="comet"){
    const idx=clamp(f.moveStep|0,0,24);
    if(idx>=18&&idx<=20){const target=foe||nearestSpecialFoe(f);if(target)drawSpecialCatalogFrame(kurzCometCatalogRows,f,idx,{target,scale:1.52,flip:false,baseY:GROUND+22});}
    return;
  }
  return baseSpecialEffects(f,foe,time);
};
