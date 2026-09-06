"use strict";
    function beamLine(x1,y1,x2,y2,w){
      ctx.save();ctx.lineCap="round";
      ctx.globalAlpha=.22;ctx.strokeStyle="#2f7be0";ctx.lineWidth=w*1.8;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();
      ctx.globalAlpha=.72;ctx.strokeStyle="#3a8bff";ctx.lineWidth=w;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();
      ctx.globalAlpha=1;ctx.strokeStyle="#e8f5ff";ctx.lineWidth=w*.38;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();ctx.restore();
    }
    function effects(f,foe,time){
      if(!f.key)return;
      if(f.cfg.key==="drslop"&&typeof drawDrSlopEffects==="function"){
        drawDrSlopEffects(f,foe,time);
      }
      if(f.key==="comet"){
        const hb=getHurtbox(foe),tx=hb.x+hb.w/2,ty=hb.y+hb.h*.46;
        if(f.moveElapsed>1250&&f.moveElapsed<2160){
          const cp=clamp((f.moveElapsed-1250)/910,0,1),sx=f.x-f.face*210,sy=-80;
          const x=lerp(sx,tx,cp),y=lerp(sy,ty,cp*cp*.58+cp*.42);
          ctx.save();
          for(let j=1;j<=10;j++){
            const q=Math.max(0,cp-j*.03),xx=lerp(sx,tx,q),yy=lerp(sy,ty,q*q*.58+q*.42);
            ctx.globalAlpha=.5*(1-j/11);ctx.fillStyle=j<4?"#ffdc70":"#e64f24";ctx.beginPath();ctx.arc(xx,yy,30-j*2,0,Math.PI*2);ctx.fill();
          }
          ctx.globalAlpha=.95;ctx.fillStyle="#fff0bd";ctx.beginPath();ctx.arc(x,y,14,0,Math.PI*2);ctx.fill();ctx.restore();
        }else if(f.moveElapsed>=2160&&f.moveElapsed<2600){
          const ip=(f.moveElapsed-2160)/440;
          ctx.save();ctx.globalAlpha=.75*(1-ip);ctx.fillStyle="#ffc24d";ctx.beginPath();ctx.arc(tx,ty+24,40+105*ip,0,Math.PI*2);ctx.fill();
          ctx.globalAlpha=.9*(1-ip);ctx.strokeStyle="#fff1c4";ctx.lineWidth=7;ctx.beginPath();ctx.ellipse(tx,GROUND-5,55+170*ip,13+22*ip,0,0,Math.PI*2);ctx.stroke();ctx.restore();
        }
      }
      if(f.key==="kapitalCrash"&&foe){
        const hb=getHurtbox(foe),tx=hb.x+hb.w/2,ty=hb.y+hb.h*.46;
        if(f.moveElapsed>900&&f.moveElapsed<2250){
          const p=(f.moveElapsed-900)/1350;
          const micX=f.x+f.face*f.cfg.displayH*.24,micY=GROUND-f.cfg.displayH*.58;
          ctx.save();
          // Expanding sonic soundwaves in purple and gold
          for(let i=0;i<4;i++){
            const rProg=(p*3.4+i*0.25)%1;
            const rx=lerp(micX,tx,rProg),ry=lerp(micY,ty,rProg);
            const rSize=20+110*rProg;
            ctx.globalAlpha=(1-rProg)*0.75;
            ctx.strokeStyle=i%2===0?"#ffd700":"#9333ea";
            ctx.lineWidth=4*(1-rProg)+1.5;
            ctx.beginPath();
            ctx.ellipse(rx,ry,rSize*.65,rSize,0,0,Math.PI*2);
            ctx.stroke();
          }
          // Glowing financial candlestick spikes bursting at opponent location
          if(f.moveElapsed>1200&&f.moveElapsed<2150){
            const cProg=(f.moveElapsed-1200)/950;
            ctx.globalAlpha=Math.sin(cProg*Math.PI)*0.85;
            for(let c=-2;c<=2;c++){
              const cx=tx+c*38,cy=GROUND-10;
              const ch=65+Math.abs(c*26)+Math.sin(f.moveElapsed*.018+c)*30;
              ctx.fillStyle=c>=0?"#22c55e":"#eab308";
              ctx.fillRect(cx-7,cy-ch,14,ch);
              ctx.strokeStyle=c>=0?"#4ade80":"#fef08a";
              ctx.lineWidth=2;
              ctx.beginPath();ctx.moveTo(cx,cy-ch-16);ctx.lineTo(cx,cy+6);ctx.stroke();
            }
          }
          ctx.restore();
        }
      }
    }

    function drawFighter(f,time){
      const foe=fighters.find(x=>x!==f&&!x.ko)||null;
      if(f.cfg.key==="drslop"&&typeof drawDrSlopAura==="function"){
        drawDrSlopAura(f,time,false);
      }
      if(typeof drawFighterCatalog==="function"&&drawFighterCatalog(f,foe)){
        if(f.cfg.key==="drslop"&&typeof drawDrSlopAura==="function"){
          drawDrSlopAura(f,time,true);
        }
        return;
      }

      const asset=spriteAssets[f.cfg.asset];if(!asset||!asset.sheet)return;
      const r=frameRect(asset,0,0);
      const dh=f.cfg.displayH/(f.cfg.spriteZoom||1),dw=dh*(r.sw/r.sh),flip=f.face!==asset.defaultFacing;
      ctx.save();ctx.translate(Math.round(f.x),Math.round(GROUND));if(flip)ctx.scale(-1,1);
      ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality="high";
      ctx.drawImage(asset.sheet,r.sx,r.sy,r.sw,r.sh,-dw/2,-dh,dw,dh);
      ctx.restore();
      if(f.cfg.key==="drslop"&&typeof drawDrSlopAura==="function"){
        drawDrSlopAura(f,time,true);
      }
    }
    function drawHitboxes(){
      fighters.forEach(a=>{
        const hurt=getHurtbox(a);
        const foe=fighters.find(d=>d!==a);
        const hit=foe?activeHitbox(a,foe):null;
        ctx.save();ctx.lineWidth=3;ctx.strokeStyle="rgba(70,195,255,.95)";ctx.fillStyle="rgba(70,195,255,.16)";ctx.fillRect(hurt.x,hurt.y,hurt.w,hurt.h);ctx.strokeRect(hurt.x,hurt.y,hurt.w,hurt.h);
        if(hit){ctx.strokeStyle="rgba(255,72,76,.98)";ctx.fillStyle="rgba(255,72,76,.2)";ctx.fillRect(hit.x,hit.y,hit.w,hit.h);ctx.strokeRect(hit.x,hit.y,hit.w,hit.h)}
        ctx.restore();
      });
    }
    function koZoom(t){
      if(t<0)return 1;
      if(t<260)return 1+.42*ease(t/260);
      if(t<900)return 1.42;
      if(t<1320)return 1.42-.42*ease((t-900)/420);
      return 1;
    }
    function drawScene(time){
      ctx.setTransform(RENDER_SCALE,0,0,RENDER_SCALE,0,0);
      ctx.save();
      const z=koZoom(koTime);
      if(z>1.001){
        ctx.translate(koFocus.x,koFocus.y);ctx.scale(z,z);ctx.translate(-koFocus.x,-koFocus.y);
      }
      if(shake>0){
        ctx.translate((Math.random()-.5)*shake,(Math.random()-.5)*shake*.55);
        shake*=.84;if(shake<.2)shake=0;
      }
      if(bg.complete&&bg.naturalWidth){
        const sc=Math.max(W/bg.naturalWidth,H/bg.naturalHeight);
        const bw=bg.naturalWidth*sc,bh=bg.naturalHeight*sc;
        ctx.drawImage(bg,(W-bw)/2,H-bh,bw,bh);
      }
      else{const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,"#091027");g.addColorStop(1,"#24160f");ctx.fillStyle=g;ctx.fillRect(0,0,W,H)}
      ctx.fillStyle="rgba(0,0,8,.14)";ctx.fillRect(0,0,W,H);
      const order=fighters.filter(f=>!f.ko).sort((a,b)=>a.x-b.x);
      order.forEach(f=>drawFighter(f,time));
      fighters.forEach(f=>{const foe=fighters.filter(x=>x!==f&&!x.ko).sort((a,b)=>Math.abs(a.x-f.x)-Math.abs(b.x-f.x))[0]; if(foe)effects(f,foe,time)});
      drawFx();
      if(showHitboxes)drawHitboxes();
      ctx.restore();
    }

    function updateUI(){
      const left=fighters[0]||bob,right=fighters[1]||kurz;
      const l=clamp(left.displayHealth,0,100),r=clamp(right.displayHealth,0,100);
      if(ui.lifeLeft)ui.lifeLeft.style.width=left.health+"%";
      if(ui.lifeRight)ui.lifeRight.style.width=right.health+"%";
      if(ui.damageLeft)ui.damageLeft.style.width=l+"%";
      if(ui.damageRight)ui.damageRight.style.width=r+"%";
      if(ui.hpLeft)ui.hpLeft.textContent=Math.ceil(left.health)+" / 100";
      if(ui.hpRight)ui.hpRight.textContent=Math.ceil(right.health)+" / 100";
      if(ui.leftName)ui.leftName.textContent=left.cfg.short||left.cfg.name;
      if(ui.rightName)ui.rightName.textContent=right.cfg.short||right.cfg.name;
    }

    function renderPortrait(id,asset){
      const c=document.getElementById(id);if(!c)return;
      const g=c.getContext("2d");
      const grad=g.createLinearGradient(0,0,160,160);grad.addColorStop(0,"#35142f");grad.addColorStop(1,"#080a18");g.fillStyle=grad;g.fillRect(0,0,160,160);
      if(asset&&asset.portraitImage&&asset.portraitImage.complete){
        g.save();g.imageSmoothingEnabled=true;g.imageSmoothingQuality="high";
        g.drawImage(asset.portraitImage,0,0,160,160);
        g.restore();
      }else if(asset&&asset.sheet){
        const r=frameRect(asset,0,0),pt=asset.portrait;
        g.save();g.imageSmoothingEnabled=true;g.imageSmoothingQuality="high";
        if(pt)g.drawImage(asset.sheet,r.sx+r.sw*pt.x,r.sy+r.sh*pt.y,r.sw*pt.w,r.sh*pt.h,0,0,160,160);
        else g.drawImage(asset.sheet,r.sx+r.sw*.08,r.sy,r.sw*.84,r.sh*.63,0,0,160,160);
        g.restore();
      }
      g.strokeStyle="rgba(255,255,255,.12)";g.lineWidth=4;g.strokeRect(4,4,152,152);
    }

    function updateMatchup(){
      if(ui.matchup)ui.matchup.innerHTML=(fighterLabel[selectedLeft]||selectedLeft)+' <span style="color:#ff4052">VS.</span> '+(fighterLabel[selectedRight]||selectedRight);
    }
    function selectTeam(side,key){
      if(side==='left'&&key===selectedRight || side==='right'&&key===selectedLeft){
        if(ui.selectionNote)ui.selectionNote.textContent='Bitte zwei unterschiedliche Kämpfer auswählen.';
        return;
      }
      if(side==='left')selectedLeft=key;else selectedRight=key;
      document.querySelectorAll('.pick-row[data-side="'+side+'"] .pick').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.fighter===key)));
      if(ui.selectionNote)ui.selectionNote.textContent='Je Seite genau einen Kämpfer auswählen · dieselbe Figur kann nicht zweimal antreten.';
      updateMatchup();
    }
    document.querySelectorAll('.pick').forEach(btn=>btn.addEventListener('click',()=>selectTeam(btn.closest('.pick-row').dataset.side,btn.dataset.fighter)));
    updateMatchup();

    function resetFight(){
      if(spritesLoaded<3)return;
      fighters=[fighterByKey[selectedLeft],fighterByKey[selectedRight]];
      const left=fighters[0],right=fighters[1];
      renderPortrait("portrait-left",spriteAssets[left.cfg.asset]);
      renderPortrait("portrait-right",spriteAssets[right.cfg.asset]);
      round++;left.reset(370+Math.random()*70);right.reset(1030+Math.random()*70);
      left.face=1;right.face=-1;roundTime=0;directorState="idle";directorDelay=500+Math.random()*450;
      activePlan=null;resultQueued=false;shake=0;hitStop=0;running=true;
      counterPending=null;koTime=-1;clearFx();
      ui.round.textContent=String(round).padStart(2,"0");ui.status.textContent="FIGHT";
      ui.result.hidden=true;ui.start.hidden=true;updateUI();
    }

    window.__probeFight=()=>fighters.map(f=>({id:f.cfg.key,key:f.key,t:Math.round(f.moveElapsed),ph:f.move?(f.move[f.moveStep]||[])[2]:null,x:Math.round(f.x)}));
    window.__forceSpecial=(side)=>{
      const a=fighters[side==="right"?1:0],d=fighters[side==="right"?0:1];
      if(!a||!d||a.ko||d.ko)return false;
      a.face=a.x<d.x?1:-1;a.moveTarget=null;d.moveTarget=null;
      directorState="attack";activePlan=null;a.start(a.cfg.specialKey);return true;
    };
    document.getElementById("demo-start").addEventListener("click",resetFight);
    document.getElementById("new-fight").addEventListener("click",resetFight);
    document.getElementById("hitbox-toggle").addEventListener("click",e=>{
      showHitboxes=!showHitboxes;e.currentTarget.setAttribute("aria-pressed",String(showHitboxes));
    });

    function frame(now){
      const raw=Math.min(45,now-last);last=now;
      if(koTime>=0)koTime+=raw;
      let dt=((koTime>=0&&koTime<820)?raw*.42:raw)*GAME_SPEED;
      if(hitStop>0)hitStop-=dt;
      else{
        updateFx(dt);
        fighters.forEach(f=>f.update(dt));
        for(let i=0;i<fighters.length;i++)for(let j=i+1;j<fighters.length;j++){
          const a=fighters[i],d=fighters[j]; if(!a.ko&&!d.ko&&Math.abs(a.x-d.x)<78){const mid=(a.x+d.x)/2;a.x=mid-39;d.x=mid+39;}
        }
        updateCollisions();director(dt);
      }
      updateUI();drawScene(now/1000);requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
