"use strict";
    function beamLine(x1,y1,x2,y2,w){
      ctx.save();ctx.lineCap="round";
      ctx.globalAlpha=.22;ctx.strokeStyle="#2f7be0";ctx.lineWidth=w*1.8;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();
      ctx.globalAlpha=.72;ctx.strokeStyle="#3a8bff";ctx.lineWidth=w;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();
      ctx.globalAlpha=1;ctx.strokeStyle="#e8f5ff";ctx.lineWidth=w*.38;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();ctx.restore();
    }
    function effects(f,foe,time){
      if(!f.key)return;
      const unit=f.cfg.displayH/300,hands=[f.x+f.face*f.cfg.displayH*.22,GROUND-f.cfg.displayH*.57];
      if(f.key==="kame"&&spriteAssets.kame.sheet){
        drawKameBeam(f,foe);
      }else if(f.key==="kame"){
        if(f.moveElapsed<1600){
          const pr=clamp(f.moveElapsed/1600,0,1),r=(5+27*pr)*unit;
          ctx.save();
          for(let i=0;i<14;i++){
            const ang=i*.9+time*3,rad=(88-54*pr+9*Math.sin(time*5+i))*unit;
            ctx.globalAlpha=.24+.5*pr;ctx.strokeStyle="#65adff";ctx.lineWidth=3;
            ctx.beginPath();ctx.moveTo(hands[0]+Math.cos(ang)*rad,hands[1]+Math.sin(ang)*rad*.7);
            ctx.lineTo(hands[0]+Math.cos(ang)*(rad-22),hands[1]+Math.sin(ang)*(rad-22)*.7);ctx.stroke();
          }
          ctx.globalAlpha=.3;ctx.fillStyle="#2f7be0";ctx.beginPath();ctx.arc(hands[0],hands[1],r*2,0,Math.PI*2);ctx.fill();
          ctx.globalAlpha=.95;ctx.fillStyle="#ddecff";ctx.beginPath();ctx.arc(hands[0],hands[1],r*.7,0,Math.PI*2);ctx.fill();ctx.restore();
        }else if(f.moveElapsed<2330){
          const env=Math.sin(clamp((f.moveElapsed-1600)/730,0,1)*Math.PI),w=74*unit*Math.max(.08,env);
          beamLine(hands[0],hands[1],hands[0]+f.face*1500,hands[1]+4,w);
        }
      }
      if(f.key==="choke"){
        const hb=getHurtbox(foe),tx=hb.x+hb.w/2,ty=hb.y+hb.h*.35;
        const p=clamp((f.moveElapsed-360)/760,0,1);
        ctx.save();ctx.globalAlpha=.42+.35*Math.sin(time*8);ctx.strokeStyle="#ffcf66";ctx.lineWidth=7;ctx.beginPath();ctx.ellipse(tx,ty,70+20*p,86+18*p,0,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=.85;ctx.fillStyle="#fff0bd";ctx.font='bold 22px Impact';ctx.textAlign='center';ctx.fillText('NECK LOCK',tx,ty-105);ctx.restore();
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
    }

    /* ---- Dr. BOBs Kamehameha-Katalog (25 Bilder) ---- */
    function kameFrameIndex(f){
      const t=f.moveElapsed;
      if(t<1360)return 1+Math.min(8,Math.floor(t/1360*9));
      if(t<1495)return 10;
      if(t<2215)return 11;
      if(t<2330)return 16;
      if(t<2440)return 17;
      if(t<2560)return 18;
      return 20;
    }
    function kameCell(idx){const i=idx-1;return frameRect(spriteAssets.kame,(i/5)|0,i%5)}
    function kamePart(idx){
      const cell=kameCell(idx),b=KAME_FRAMES[idx],s=cell.sw/460;
      return {sx:cell.sx+b.x*s,sy:cell.sy+b.y*s,sw:b.w*s,sh:b.h*s,scale:s};
    }
    function kameActive(f){return f.key==="kame"&&spriteAssets.kame.sheet}
    function drawKame(f){
      const asset=spriteAssets.kame,idx=kameFrameIndex(f),cell=kameCell(idx);
      const dh=f.cfg.displayH/KAME_ZOOM,dw=dh*(cell.sw/cell.sh),flip=f.face!==asset.defaultFacing;
      ctx.save();
      ctx.translate(Math.round(f.x),Math.round(GROUND+dh*KAME_BASE));
      if(flip)ctx.scale(-1,1);
      ctx.imageSmoothingEnabled=false;
      ctx.drawImage(asset.sheet,cell.sx,cell.sy,cell.sw,cell.sh,-dw/2,-dh,dw,dh);
      ctx.restore();
    }
    function drawKameBeam(f,foe){
      const asset=spriteAssets.kame;if(!asset.sheet)return;
      const t=f.moveElapsed;if(t<1495||t>=2215)return;
      const dh=f.cfg.displayH/KAME_ZOOM,k=dh/460;
      const cellBottom=GROUND+dh*KAME_BASE;
      const bx=f.x+f.face*KAME_BEAM.x*k,by=cellBottom-(460-KAME_BEAM.y)*k;
      const grow=clamp((t-1495)/240,0,1),fade=clamp((2215-t)/130,0,1);
      const reach=(f.face>0?W+140-bx:bx+140);
      const len=reach*grow;
      const seg=KAME_FRAMES[12],head=KAME_FRAMES[14];
      const segW=seg.w*k,segH=seg.h*k,sq=Math.max(.6,fade);
      const r14=kameCell(14),sc=kameCell(12).sw/460;
      ctx.save();
      ctx.translate(bx,by);if(f.face<0)ctx.scale(-1,1);
      ctx.imageSmoothingEnabled=false;
      ctx.beginPath();ctx.rect(-4,-segH,len,segH*2);ctx.clip();
      for(let x=0,i=0;x<len;x+=segW*.46,i++){
        const id=(i%2)?13:12,rr=kameCell(id),bb=KAME_FRAMES[id];
        ctx.drawImage(asset.sheet,rr.sx+bb.x*sc,rr.sy+bb.y*sc,bb.w*sc,bb.h*sc,
          x,-bb.h*k*sq/2,bb.w*k,bb.h*k*sq);
      }
      ctx.restore();
      ctx.save();ctx.translate(bx,by);if(f.face<0)ctx.scale(-1,1);ctx.imageSmoothingEnabled=false;
      const hw=head.w*k,hh=head.h*k*Math.max(.6,fade);
      ctx.drawImage(asset.sheet,r14.sx+head.x*sc,r14.sy+head.y*sc,head.w*sc,head.h*sc,
        len-hw*.5,-hh/2,hw,hh);
      ctx.restore();
      if(grow>=1&&foe&&!foe.ko){
        const burst=KAME_FRAMES[15],r15=kameCell(15),hb=getHurtbox(foe);
        const bw=burst.w*k*1.05,bh=burst.h*k*1.05;
        ctx.save();ctx.globalAlpha=.6+.4*Math.sin(t/38);ctx.imageSmoothingEnabled=false;
        ctx.drawImage(asset.sheet,r15.sx+burst.x*sc,r15.sy+burst.y*sc,burst.w*sc,burst.h*sc,
          hb.x+hb.w/2-bw/2,by-bh/2,bw,bh);
        ctx.restore();
      }
    }

    function drawFighter(f,time){
      // Erster Weg ist der Katalog: er kennt Zoom, Bodenlinie und Spezialblatt
      // und zeichnet weich skaliert. Der alte Weg bleibt als Rueckfallebene.
      const foe=fighters.filter(x=>x!==f&&!x.ko)
        .sort((a,b)=>Math.abs(a.x-f.x)-Math.abs(b.x-f.x))[0]||null;
      if(typeof drawFighterCatalog==="function"&&drawFighterCatalog(f,foe))return;

      if(kameActive(f)){drawKame(f);return}
      const asset=spriteAssets[f.cfg.asset];if(!asset||!asset.sheet)return;
      const frame=f.spriteFrame(),r=frameRect(asset,frame.row,frame.col);
      const dh=f.cfg.displayH/(f.cfg.spriteZoom||1),dw=dh*(r.sw/r.sh),flip=f.face!==asset.defaultFacing;
      const groundFix=f.cfg.baseline!==undefined?dh*(f.cfg.baseline-.025):(f===bob?2:0);
      ctx.save();ctx.translate(Math.round(f.x),Math.round(GROUND+dh*.025+groundFix));if(flip)ctx.scale(-1,1);
      ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality="high";
      ctx.drawImage(asset.sheet,r.sx,r.sy,r.sw,r.sh,-dw/2,-dh,dw,dh);
      if(f.hitFlash>0){
        const a=Math.min(1,f.hitFlash/200)*.8;
        drawTinted(asset.sheet,r.sx,r.sy,r.sw,r.sh,-dw/2,-dh,dw,dh,f.flashCol,a);
      }
      ctx.restore();
    }
    function drawHitboxes(){
      [[bob,kurz],[kurz,bob]].forEach(([a,d])=>{
        const hurt=getHurtbox(a),hit=activeHitbox(a,d);
        ctx.save();ctx.lineWidth=3;ctx.strokeStyle="rgba(70,195,255,.95)";ctx.fillStyle="rgba(70,195,255,.16)";ctx.fillRect(hurt.x,hurt.y,hurt.w,hurt.h);ctx.strokeRect(hurt.x,hurt.y,hurt.w,hurt.h);
        if(hit){ctx.strokeStyle="rgba(255,72,76,.98)";ctx.fillStyle="rgba(255,72,76,.2)";ctx.fillRect(hit.x,hit.y,hit.w,hit.h);ctx.strokeRect(hit.x,hit.y,hit.w,hit.h)}ctx.restore();
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
      // Alles Weitere rechnet in logischen 1536x864; die Vergroesserung fuer
      // hochaufloesende Bildschirme steckt allein in dieser Matrix.
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
        // formatfüllend einpassen statt verzerren: die Vorlage ist breiter als 16:9
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
      ui.lifeBob.style.width=left.health+"%";ui.lifeKurz.style.width=right.health+"%";
      ui.damageBob.style.width=l+"%";ui.damageKurz.style.width=r+"%";
      ui.hpBob.textContent=Math.ceil(left.health)+" / 100";ui.hpKurz.textContent=Math.ceil(right.health)+" / 100";
      ui.leftName.textContent=left.cfg.short||left.cfg.name;
      ui.rightName.textContent=right.cfg.short||right.cfg.name;
    }

    function renderPortrait(id,asset){
      const c=document.getElementById(id),g=c.getContext("2d");
      const grad=g.createLinearGradient(0,0,160,160);grad.addColorStop(0,"#35142f");grad.addColorStop(1,"#080a18");g.fillStyle=grad;g.fillRect(0,0,160,160);
      if(asset&&asset.sheet){
        const r=frameRect(asset,0,0),pt=asset.portrait;
        g.save();g.imageSmoothingEnabled=true;g.imageSmoothingQuality="high";
        if(pt)g.drawImage(asset.sheet,r.sx+r.sw*pt.x,r.sy+r.sh*pt.y,r.sw*pt.w,r.sh*pt.h,0,0,160,160);
        else g.drawImage(asset.sheet,r.sx+r.sw*.08,r.sy,r.sw*.84,r.sh*.63,0,0,160,160);
        g.restore();
      }
      g.strokeStyle="rgba(255,255,255,.12)";g.lineWidth=4;g.strokeRect(4,4,152,152);
    }

    function updateMatchup(){
      ui.matchup.innerHTML=fighterLabel[selectedLeft]+' <span style="color:#ff4052">VS.</span> '+fighterLabel[selectedRight];
    }
    function selectTeam(side,key){
      if(side==='left'&&key===selectedRight || side==='right'&&key===selectedLeft){
        ui.selectionNote.textContent='Bitte zwei unterschiedliche Kämpfer auswählen.';
        return;
      }
      if(side==='left')selectedLeft=key;else selectedRight=key;
      document.querySelectorAll('.pick-row[data-side="'+side+'"] .pick').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.fighter===key)));
      ui.selectionNote.textContent='Je Seite genau einen Kämpfer auswählen · dieselbe Figur kann nicht zweimal antreten.';
      updateMatchup();
    }
    document.querySelectorAll('.pick').forEach(btn=>btn.addEventListener('click',()=>selectTeam(btn.closest('.pick-row').dataset.side,btn.dataset.fighter)));
    updateMatchup();

    function resetFight(){
      if(spritesLoaded<3)return;
      fighters=[fighterByKey[selectedLeft],fighterByKey[selectedRight]];
      const left=fighters[0],right=fighters[1];
      ui.newHud.style.display="none";
      renderPortrait("portrait-bob",spriteAssets[left.cfg.asset]);
      renderPortrait("portrait-kurz",spriteAssets[right.cfg.asset]);
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
