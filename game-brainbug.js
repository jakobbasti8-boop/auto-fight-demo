"use strict";

/* Lt.BrainBug fighter module.
   The source art is a normalized 5x5 lossless atlas with transparent cells.
   Row map: 0 idle/shuffle, 1 confused gestures, 2 punches, 3 kicks, 4 hit/dizzy. */
(function(){
  const asset={
    image:new Image(),sheet:null,defaultFacing:1,raw:true,
    portrait:{x:.285,y:.025,w:.43,h:.43}
  };
  spriteAssets.brainbug=asset;

  let brainbugReady=false;
  const startBtn=document.getElementById("demo-start");
  const originalMaybeEnableStart=maybeEnableStart;
  maybeEnableStart=function(){
    if(!brainbugReady){
      startBtn.disabled=true;
      startBtn.textContent="Lt.BrainBug wird geladen …";
      return;
    }
    originalMaybeEnableStart();
  };
  startBtn.disabled=true;
  startBtn.textContent="Lt.BrainBug wird geladen …";
  asset.image.onload=()=>{
    asset.sheet=rawSheet(asset.image);
    brainbugReady=true;
    maybeEnableStart();
  };
  asset.image.onerror=()=>{
    startBtn.disabled=true;
    startBtn.textContent="Lt.BrainBug-Asset fehlt";
    ui.selectionNote.textContent="Lt.BrainBug konnte nicht geladen werden.";
  };
  asset.image.src="assets/brainbug.webp";

  MOVES.brainFlail=[
    ["idleB",180,"Orientierung"],
    ["chamberR",150,"Ausholen"],
    ["punchR",95,"Treffer"],
    ["windLowR",130,"Ausholen"],
    ["kickLowR",105,"Treffer"],
    ["stagger",250,"Taumeln"],
    ["idleA",240,"Erholung"]
  ];

  COMBOS.brainbug=[
    {name:"WRONG WAY",keys:["punchR","kickLowL","punchL"]},
    {name:"LOST FORMATION",keys:["kickHighR","punchR","jumpKick"]}
  ];
  SPECIAL_COMBOS.brainbug={name:"MISFIRE DRILL",keys:["punchL","kickLowR","brainFlail"]};

  const brainbug=new Fighter({
    name:"LT.BRAINBUG",short:"LT.BRAINBUG",key:"brainbug",specialKey:"brainFlail",asset:"brainbug",
    displayH:330,spriteZoom:.94,baseline:.052,hurtW:.43,startX:760,face:1,
    scale:1.16,girth:.94,walkSpeed:.175,hair:"helmet",doctor:false,
    col:{skin:"#d9a279",skinD:"#9f684c",hair:"#4a2e20",hairD:"#24150f",shirt:"#7c7449",shirtD:"#4d492e",
      pants:"#69623e",pantsD:"#403c27",boot:"#3a2b1f",bootD:"#1d1712"}
  });
  allFighters.push(brainbug);
  fighterByKey.brainbug=brainbug;
  fighterLabel.brainbug="LT.BRAINBUG";

  // Exact atlas routing keeps every attack on the matching catalog row rather than
  // reusing unrelated generic frames.
  const baseSpriteFrame=Fighter.prototype.spriteFrame;
  Fighter.prototype.spriteFrame=function(){
    if(this.cfg.key!=="brainbug")return baseSpriteFrame.call(this);
    if(this.ko)return {row:4,col:4};
    if(this.move){
      const total=this.move.reduce((sum,f)=>sum+f[1],0);
      const progress=clamp(this.moveElapsed/total,0,.999);
      const phase=this.move[this.moveStep]?.[2];
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
    // Periodically loses the thread and cycles through the confused gesture row.
    return Math.floor(this.idleTime/3.6)%3===2?{row:1,col}:{row:0,col};
  };

  const baseAttackInfo=attackInfo;
  attackInfo=function(key){
    if(key==="brainFlail")return {keys:["brainFlail"],reaction:"hitKickHigh",damage:17,range:270,knock:58,type:"brainFlail"};
    return baseAttackInfo(key);
  };

  const baseActiveHitbox=activeHitbox;
  activeHitbox=function(f,foe){
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

  const baseDecideBlock=decideBlock;
  decideBlock=function(defender,info){
    // His delayed awareness makes defensive reads substantially less reliable.
    if(defender?.cfg?.key==="brainbug"&&Math.random()<.48)return false;
    return baseDecideBlock(defender,info);
  };

  const baseSetPlan=setPlan;
  setPlan=function(){
    baseSetPlan();
    if(!activePlan||activePlan.attacker?.cfg?.key!=="brainbug")return;
    // Wrong-way pre-step: he occasionally backs off before remembering where the opponent is.
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
    const brainSpecial=activePlan?.key==="brainFlail";
    baseLaunchPlan();
    if(brainSpecial)ui.status.textContent="LOST PATROL";
  };

  // Debug hitboxes now follow whichever two fighters are actually selected.
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
