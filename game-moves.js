"use strict";
    const MOVES = {
      punchR:[["chamberR",105,"Ausholen"],["punchR",82,"Treffer"],["punchR",84,"Treffer"],["idleA",205,"Erholung"]],
      punchL:[["chamberL",105,"Ausholen"],["punchL",82,"Treffer"],["punchL",84,"Treffer"],["idleA",205,"Erholung"]],
      kickHighR:[["windHighR",140,"Ausholen"],["kickHighR",95,"Treffer"],["kickHighR",100,"Treffer"],["windHighR",120,"Zurück"],["idleA",190,"Erholung"]],
      kickHighL:[["windHighL",140,"Ausholen"],["kickHighL",95,"Treffer"],["kickHighL",100,"Treffer"],["windHighL",120,"Zurück"],["idleA",190,"Erholung"]],
      kickLowR:[["sinkR",85,"Absenken"],["windLowR",90,"Ausholen"],["kickLowR",78,"Treffer"],["kickLowR",86,"Treffer"],["windLowR",105,"Zurück"],["idleA",190,"Erholung"]],
      kickLowL:[["sinkL",85,"Absenken"],["windLowL",90,"Ausholen"],["kickLowL",78,"Treffer"],["kickLowL",86,"Treffer"],["windLowL",105,"Zurück"],["idleA",190,"Erholung"]],
      jumpKick:[["jkCrouch",120,"Absprung"],["jkRise",135,"Aufstieg"],["jkStrike",100,"Treffer"],["jkStrike",110,"Treffer"],["jkRise",105,"Fallen"],["jkLand",120,"Landung"],["idleA",205,"Erholung"]],
      headbutt:[["hbWind",135,"Ausholen"],["hbHit",78,"Treffer"],["hbHit",96,"Treffer"],["idleA",220,"Erholung"]],
      kame:[["kmSink",190,"Absenken"],["kmChargeA",410,"Aufladen"],["kmChargeB",410,"Aufladen"],["kmChargeA",350,"Aufladen"],["kmFire",135,"Abschuss"],["kmFire",720,"Strahl"],["kmFire",260,"Nachhall"],["idleA",220,"Erholung"]],
      choke:[["idleA",170,"Ansprung"],["chokeA",260,"Sprung"],["chokeB",360,"Neck Lock"],["chokeC",520,"Würgegriff"],["chokeB",300,"Lösen"],["idleA",240,"Erholung"]],
      protonKick:[
        ["idleA",90,"Fokus"],["windHighR",105,"Kammer"],["idleB",105,"Fokus"],
        ["windHighR",110,"Protonenladung"],["windHighR",110,"Protonenladung"],["windHighR",110,"Protonenladung"],["windHighR",110,"Protonenladung"],["windHighR",120,"Maximalladung"],
        ["windHighR",95,"Roundhouse"],["kickHighR",85,"Roundhouse"],["kickHighR",80,"Roundhouse"],["kickHighR",80,"Roundhouse"],["kickHighR",85,"Roundhouse"],["kickHighR",90,"Roundhouse"],
        ["kickHighR",95,"Treffer"],["kickHighR",105,"Photonenkern"],["kickHighR",110,"Photonenkern"],["kickHighR",115,"Schockwelle"],["windHighR",120,"Schockwelle"],
        ["windHighR",115,"Rückstoß"],["sinkR",110,"Abklingen"],["windHighR",105,"Abklingen"],["idleB",100,"Deckung"],["idleA",100,"Reset"],["idleA",110,"Erholung"]
      ],
      comet:[["cmRaiseA",180,"Arme hoch"],["cmRaiseB",430,"Aufladen"],["cmRaiseA",400,"Aufladen"],["cmRaiseB",260,"Komet"],["cmThrow",260,"Wurf"],["cmThrow",680,"Komet"],["cmAfter",310,"Einschlag"],["idleA",260,"Erholung"]],
      hitPunch:[["hitHigh",70,"Treffer"],["hitHigh2",130,"Erholung"],["idleA",160,"Erholung"]],
      hitKickHigh:[["hitHigh",80,"Treffer"],["stagger",180,"Taumeln"],["idleA",180,"Erholung"]],
      hitKickLow:[["hitLeg",80,"Treffer"],["stagger",155,"Taumeln"],["idleA",180,"Erholung"]],
      hitHeadbutt:[["hitHigh",75,"Treffer"],["stagger",190,"Taumeln"],["idleA",180,"Erholung"]],
      hitJumpKick:[["hitHigh",60,"Treffer"],["kdAir",190,"Wegfliegen"],["kdGround",150,"Aufschlag"],["kdGround",410,"Am Boden"],["getUp1",230,"Aufstehen"],["getUp2",180,"Aufstehen"],["idleA",170,"Erholung"]],
      hitBeam:[["flailA",130,"Getroffen"],["flailB",130,"Getroffen"],["flailC",130,"Getroffen"],["flailD",130,"Getroffen"],["kdAir",190,"Wegfliegen"],["kdGround",140,"Aufschlag"],["kdGround",420,"Am Boden"],["getUp1",230,"Aufstehen"],["getUp2",180,"Aufstehen"]],
      hitComet:[["hitHigh",70,"Treffer"],["kdAir",160,"Wegfliegen"],["kdGround",145,"Aufschlag"],["kdGround",450,"Am Boden"],["getUp1",230,"Aufstehen"],["getUp2",180,"Aufstehen"]],
      blockHigh:[["guardHigh",60,"Block"],["guardPush",110,"Block"],["guardHigh",140,"Deckung"],["idleA",160,"Erholung"]],
      blockLow:[["guardLow",60,"Block"],["guardLowP",110,"Block"],["guardLow",140,"Deckung"],["idleA",160,"Erholung"]]
    };

    const ATTACKS = {
      punch:{keys:["punchR","punchL"],reaction:"hitPunch",damage:7,range:220,knock:24},
      kickHigh:{keys:["kickHighR","kickHighL"],reaction:"hitKickHigh",damage:11,range:282,knock:42},
      kickLow:{keys:["kickLowR","kickLowL"],reaction:"hitKickLow",damage:9,range:268,knock:30},
      jumpKick:{keys:["jumpKick"],reaction:"hitJumpKick",damage:15,range:310,knock:72},
      headbutt:{keys:["headbutt"],reaction:"hitHeadbutt",damage:13,range:185,knock:48},
      special:{keys:[],reaction:"hitBeam",damage:20,range:9999,knock:92}
    };

    const COMBOS = {
      bob:[
        {name:"DOC RUSH",keys:["punchR","punchL","kickHighR"]},
        {name:"REDLINE",keys:["kickLowR","punchR","jumpKick"]}
      ],
      kurz:[
        {name:"BRAID BLITZ",keys:["punchL","kickLowR","kickHighL"]},
        {name:"GROUND BREAK",keys:["kickLowL","punchR","jumpKick"]}
      ],
      nova:[
        {name:"WHITE FANG",keys:["punchL","kickHighR","kickLowL"]},
        {name:"AIR STING",keys:["kickLowR","punchR","jumpKick"]}
      ]
    };
    const SPECIAL_COMBOS = {
      bob:{name:"DOC OVERDRIVE",keys:["punchR","kickLowL","kickHighR","kame"]},
      kurz:{name:"COMET BREAKER",keys:["kickLowR","punchL","jumpKick","comet"]},
      nova:{name:"PROTON CRESCENT",keys:["punchR","kickHighL","protonKick"]}
    };

    const lerp = (a,b,t) => a+(b-a)*t;
    const clamp = (v,a,b) => Math.max(a,Math.min(b,v));
    const ease = t => t<.5 ? 2*t*t : 1-Math.pow(-2*t+2,2)/2;
    const choose = a => a[(Math.random()*a.length)|0];

    const PIX = 6;
    const fx = [];
    const COL_HIT   = ["#ffffff","#fff6c2","#ffcc3d","#ff8b21","#e0330f"];
    const COL_BLOCK = ["#ffffff","#dbeeff","#7bc0ff","#2f7be0"];
    const COL_SPEC  = ["#ffffff","#ffe9a8","#ffb03a","#ff5d2e","#b81d6e"];
    const snap = v => Math.round(v/PIX)*PIX;

    function addFx(o){o.age=0;fx.push(o);return o}
    function clearFx(){fx.length=0}
    function spawnSparks(x,y,dir,power,cols){
      cols=cols||COL_HIT; const n=Math.min(34,Math.round(9+power*1.1));
      for(let i=0;i<n;i++){ const ang=-Math.PI/2+(Math.random()-.5)*2.5; const sp=(1.5+Math.random()*3.6)*(.55+power/20);
        addFx({t:"spark",x,y,vx:Math.cos(ang)*sp+dir*(.6+Math.random()*2.2)*(Math.random()<.25?-.5:1),vy:Math.sin(ang)*sp,g:.021+Math.random()*.02,size:PIX*(Math.random()<.32?2:1),col:cols[(Math.random()*cols.length)|0],life:250+Math.random()*340}); }
      addFx({t:"star",x,y,r:18+power*1.5,life:170});
    }
    function spawnDust(x,dir,amount){for(let i=0;i<amount;i++)addFx({t:"dust",x:x+(Math.random()-.5)*34,y:GROUND-2-Math.random()*10,vx:-dir*(.35+Math.random()*1.6),vy:-(.12+Math.random()*.5),size:PIX*(1+((Math.random()*2)|0)),life:360+Math.random()*380});}
    function spawnPopup(x,y,text,col,big){addFx({t:"text",x,y,text,col:col||"#fff",big:!!big,vy:-.055,life:820});}
    function spawnRing(x,y,col,r0,r1,life){addFx({t:"ring",x,y,col,r0,r1,life:life||340});}
    function spawnSpeedlines(x,y,dir,power){const n=4+((power/6)|0);for(let i=0;i<n;i++)addFx({t:"line",x:x-dir*(40+Math.random()*280),y:y+(Math.random()-.5)*170,len:80+Math.random()*180,dir,w:2+Math.random()*4,life:120+Math.random()*110});}
    function spawnWhoosh(x,y,dir){for(let i=0;i<3;i++)addFx({t:"line",x:x+dir*(20+i*36),y:y+(Math.random()-.5)*70,len:50+Math.random()*70,dir,w:1.5+Math.random()*2,life:110+Math.random()*70,soft:true});}

    function updateFx(dt){
      for(let i=fx.length-1;i>=0;i--){const p=fx[i];p.age+=dt;if(p.age>=p.life){fx.splice(i,1);continue}
        if(p.t==="spark"){p.x+=p.vx*dt*.06;p.y+=p.vy*dt*.06;p.vy+=p.g*dt*.06;if(p.y>GROUND){p.y=GROUND;p.vy*=-.34;p.vx*=.6}}
        else if(p.t==="dust"){p.x+=p.vx*dt*.05;p.y+=p.vy*dt*.05;p.vy+=.0045*dt*.05;p.vx*=.985}
        else if(p.t==="text"){p.y+=p.vy*dt}}
    }
    function drawFx(){
      ctx.save();ctx.textAlign="center";
      for(const p of fx){const k=p.age/p.life,a=1-k;
        if(p.t==="spark"){ctx.globalAlpha=k>.7?(1-k)/.3:1;ctx.fillStyle=p.col;const s=k>.72?p.size*.5:p.size;ctx.fillRect(snap(p.x),snap(p.y),s,s)}
        else if(p.t==="star"){const r=p.r*(.45+k*1.05);ctx.globalAlpha=(1-k)*.95;ctx.fillStyle="#fffbe4";for(const d of [[1,0],[-1,0],[0,1],[0,-1],[.72,.72],[-.72,.72],[.72,-.72],[-.72,-.72]])for(let q=PIX;q<r;q+=PIX)ctx.fillRect(snap(p.x+d[0]*q),snap(p.y+d[1]*q),PIX,PIX);ctx.fillStyle="#fff";ctx.fillRect(snap(p.x-PIX),snap(p.y-PIX),PIX*2,PIX*2)}
        else if(p.t==="dust"){ctx.globalAlpha=a*.45;ctx.fillStyle="#c9bfae";ctx.fillRect(snap(p.x),snap(p.y),p.size,p.size)}
        else if(p.t==="ring"){const r=p.r0+(p.r1-p.r0)*ease(k);ctx.globalCompositeOperation="lighter";ctx.globalAlpha=a;const g=ctx.createRadialGradient(p.x,p.y,Math.max(1,r*.5),p.x,p.y,r);g.addColorStop(0,"rgba(0,0,0,0)");g.addColorStop(.72,p.col);g.addColorStop(1,"rgba(0,0,0,0)");ctx.fillStyle=g;ctx.beginPath();ctx.arc(p.x,p.y,r,0,Math.PI*2);ctx.fill();ctx.globalCompositeOperation="source-over"}
        else if(p.t==="line"){ctx.globalAlpha=a*(p.soft?.35:.8);ctx.strokeStyle="#ffffff";ctx.lineWidth=p.w;ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(p.x-p.dir*p.len,p.y);ctx.stroke()}
        else if(p.t==="text"){ctx.globalAlpha=k<.1?k/.1:(k>.7?(1-k)/.3:1);ctx.font=(p.big?"bold 62px":"bold 42px")+' Impact,"Arial Black",sans-serif';ctx.lineWidth=9;ctx.lineJoin="round";ctx.strokeStyle="#170800";ctx.strokeText(p.text,p.x,p.y);ctx.fillStyle=p.col;ctx.fillText(p.text,p.x,p.y)}}ctx.restore();
    }

    const tintCv=document.createElement("canvas"),tintCtx=tintCv.getContext("2d",{willReadFrequently:false});
    function drawTinted(img,sx,sy,sw,sh,dx,dy,dw,dh,col,alpha){
      if(tintCv.width!==sw||tintCv.height!==sh){tintCv.width=sw;tintCv.height=sh} tintCtx.globalCompositeOperation="source-over";tintCtx.clearRect(0,0,sw,sh);tintCtx.drawImage(img,sx,sy,sw,sh,0,0,sw,sh);tintCtx.globalCompositeOperation="source-atop";tintCtx.fillStyle=col;tintCtx.fillRect(0,0,sw,sh);tintCtx.globalCompositeOperation="source-over";ctx.save();ctx.globalAlpha=alpha;ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality="high";ctx.drawImage(tintCv,0,0,sw,sh,dx,dy,dw,dh);ctx.restore();
    }
    function blend(p,q,t){return {rx:lerp(p.rx,q.rx,t),ry:lerp(p.ry,q.ry,t),spine:lerp(p.spine,q.spine,t),head:lerp(p.head,q.head,t),fR:[lerp(p.fR[0],q.fR[0],t),lerp(p.fR[1],q.fR[1],t)],fL:[lerp(p.fL[0],q.fL[0],t),lerp(p.fL[1],q.fL[1],t)],hR:[lerp(p.hR[0],q.hR[0],t),lerp(p.hR[1],q.hR[1],t)],hL:[lerp(p.hL[0],q.hL[0],t),lerp(p.hL[1],q.hL[1],t)]};}
    function ik(ax,ay,bx,by,l1,l2,bend){let dx=bx-ax,dy=by-ay,d=Math.hypot(dx,dy),max=l1+l2-.01;if(d>max){dx*=max/d;dy*=max/d;d=max;bx=ax+dx;by=ay+dy}d=Math.max(.01,d);const a=(l1*l1-l2*l2+d*d)/(2*d),h=Math.sqrt(Math.max(0,l1*l1-a*a));const mx=ax+a*dx/d,my=ay+a*dy/d;return [mx-bend*h*dy/d,my+bend*h*dx/d,bx,by];}
    function limb(g,x1,y1,x2,y2,col,w,edge=true){g.lineCap="round";if(edge){g.strokeStyle="#11131c";g.lineWidth=w+4;g.beginPath();g.moveTo(x1,y1);g.lineTo(x2,y2);g.stroke()}g.strokeStyle=col;g.lineWidth=w;g.beginPath();g.moveTo(x1,y1);g.lineTo(x2,y2);g.stroke();}
    function poly(g,pts,fill,stroke="#11131c"){g.beginPath();g.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length;i++)g.lineTo(pts[i][0],pts[i][1]);g.closePath();g.strokeStyle=stroke;g.lineWidth=3;g.stroke();g.fillStyle=fill;g.fill();}
    function blob(g,x,y,r,col,edge=true){if(edge){g.fillStyle="#11131c";g.beginPath();g.arc(x,y,r+2,0,Math.PI*2);g.fill()}g.fillStyle=col;g.beginPath();g.arc(x,y,r,0,Math.PI*2);g.fill();}
    function headPoint(p){const sr=p.spine*Math.PI/180,cx=p.rx+Math.cos(sr)*54,cy=p.ry+Math.sin(sr)*54;const hr=p.head*Math.PI/180,nx=cx+Math.cos(hr)*15,ny=cy+Math.sin(hr)*15;return [nx+Math.cos(hr)*15.7,ny+Math.sin(hr)*15.7,hr,cx,cy];}

    function drawHead(g,p,cfg,time){
      const [hx,hy,hr]=headPoint(p),K=cfg.col;g.save();g.translate(hx,hy);g.rotate(hr+Math.PI/2);g.fillStyle="#11131c";g.beginPath();g.ellipse(0,0,16,18,0,0,Math.PI*2);g.fill();g.fillStyle=K.skin;g.beginPath();g.ellipse(0,0,13.5,15.7,0,0,Math.PI*2);g.fill();g.fillStyle=K.skinD;g.beginPath();g.ellipse(-5,4,7,10,0,0,Math.PI*2);g.fill();g.fillStyle=K.skin;g.beginPath();g.moveTo(9,-3);g.lineTo(16,1);g.lineTo(9,4);g.closePath();g.fill();g.strokeStyle="#2a1510";g.lineWidth=1.8;g.beginPath();g.moveTo(2,-4);g.lineTo(8,-4);g.stroke();g.fillStyle="#090a0f";g.beginPath();g.arc(6,-2,1.5,0,Math.PI*2);g.fill();
      if(cfg.hair==="spikes"){g.fillStyle="#160508";g.beginPath();g.moveTo(-12,-7);g.lineTo(13,-7);g.lineTo(12,2);g.lineTo(-11,0);g.closePath();g.fill();g.fillStyle=K.hairD;g.beginPath();g.moveTo(13,-8);g.lineTo(21,-31);g.lineTo(8,-14);g.lineTo(4,-43);g.lineTo(-2,-14);g.lineTo(-14,-39);g.lineTo(-9,-11);g.lineTo(-25,-26);g.lineTo(-14,-3);g.lineTo(-13,7);g.lineTo(-6,-6);g.lineTo(6,-8);g.closePath();g.fill();g.fillStyle=K.hair;g.beginPath();g.moveTo(11,-9);g.lineTo(17,-28);g.lineTo(6,-14);g.lineTo(3,-39);g.lineTo(-2,-14);g.lineTo(-12,-35);g.lineTo(-8,-11);g.lineTo(-22,-23);g.lineTo(-12,-4);g.lineTo(-6,-7);g.lineTo(5,-9);g.closePath();g.fill();g.strokeStyle="#181820";g.lineWidth=3;g.beginPath();g.moveTo(0,-1);g.lineTo(12,-1);g.stroke();}
      else{const wob=Math.sin(time*3)*5;g.fillStyle=K.hairD;g.beginPath();g.moveTo(-12,-6);g.quadraticCurveTo(-30,2,-36+wob,30);g.quadraticCurveTo(-33+wob,38,-26+wob,36);g.quadraticCurveTo(-22,10,-6,2);g.closePath();g.fill();g.fillStyle=K.hair;g.beginPath();g.ellipse(-1,-6,14,12,0,0,Math.PI*2);g.fill();g.beginPath();g.ellipse(-12,2,7,8,0,0,Math.PI*2);g.fill();g.fillStyle="#8a6a2a";g.beginPath();g.ellipse(-15,2,3.5,5,0,0,Math.PI*2);g.fill();}g.restore();
    }

    function drawBody(g,p,cfg,time){
      const girth=cfg.girth,K=cfg.col,sr=p.spine*Math.PI/180;const cx=p.rx+Math.cos(sr)*54,cy=p.ry+Math.sin(sr)*54;const px=-Math.sin(sr),py=Math.cos(sr);const lR=ik(p.rx-5,p.ry,p.fR[0],p.fR[1],60,60,-1);const lL=ik(p.rx+5,p.ry,p.fL[0],p.fL[1],60,60,-1);const shRx=cx-px*5,shRy=cy-py*5,shLx=cx+px*5,shLy=cy+py*5;const aR=ik(shRx,shRy+2,p.hR[0],p.hR[1],32,31,1);const aL=ik(shLx,shLy+2,p.hL[0],p.hL[1],32,31,1);
      const boot=(kx,ky,ax,ay,far)=>{let dx=ax-kx,dy=ay-ky,l=Math.hypot(dx,dy)||1,fx=-dy/l,fy=dx/l;if(fx<0){fx=-fx;fy=-fy}limb(g,ax-fx*3,ay-fy*3,ax+fx*13,ay+fy*13,far?K.bootD:K.boot,13*girth);};
      const arm=(sx,sy,ex,ey,ax,ay,far)=>{limb(g,sx,sy,ex,ey,far?K.skinD:K.skin,13*girth);limb(g,ex,ey,ax,ay,far?K.skinD:K.skin,11*girth);limb(g,sx,sy,sx+(ex-sx)*.34,sy+(ey-sy)*.34,far?K.shirtD:K.shirt,15*girth,false);blob(g,ax,ay,7.5*girth,far?K.skinD:K.skin);};
      limb(g,p.rx-5,p.ry,lR[0],lR[1],K.pantsD,17*girth);limb(g,lR[0],lR[1],lR[2],lR[3],K.pantsD,14*girth);boot(lR[0],lR[1],lR[2],lR[3],true);arm(shRx,shRy+2,aR[0],aR[1],aR[2],aR[3],true);limb(g,p.rx+5,p.ry,lL[0],lL[1],K.pants,18*girth);limb(g,lL[0],lL[1],lL[2],lL[3],K.pants,15*girth);boot(lL[0],lL[1],lL[2],lL[3],false);const tw=15*girth;poly(g,[[cx-px*tw,cy-py*tw],[cx+px*tw,cy+py*tw],[p.rx+px*12*girth,p.ry+py*12*girth],[p.rx-px*12*girth,p.ry-py*12*girth]],K.shirt);
      if(cfg.doctor){poly(g,[[cx-px*tw,cy-py*tw],[cx+px*tw,cy+py*tw],[p.rx+px*16,p.ry+py*15+22],[p.rx,p.ry+30]],K.coat);poly(g,[[cx-px*tw,cy-py*tw],[p.rx,p.ry+30],[p.rx-px*16,p.ry-py*15+22]],K.coatD);g.strokeStyle="#9ea8b6";g.lineWidth=3;g.beginPath();g.moveTo(cx-px*7,cy-py*7);g.quadraticCurveTo(cx-px*13,cy+18,cx-px*4,cy+31);g.moveTo(cx+px*7,cy+py*7);g.quadraticCurveTo(cx+px*13,cy+20,cx+px*4,cy+32);g.stroke();blob(g,cx-px*4,cy+31,4,"#d9e2eb",false);}
      limb(g,p.rx-px*11*girth,p.ry-py*11*girth,p.rx+px*11*girth,p.ry+py*11*girth,"#70451f",7);arm(shLx,shLy+2,aL[0],aL[1],aL[2],aL[3],false);const hp=headPoint(p);limb(g,cx,cy,hp[0]-Math.cos(hp[2])*15.7,hp[1]-Math.sin(hp[2])*15.7,K.skin,11*girth);drawHead(g,p,cfg,time);
    }

