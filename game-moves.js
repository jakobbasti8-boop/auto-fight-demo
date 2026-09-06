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
      brainFlail:[
        ["idleB",180,"Orientierung"],
        ["chamberR",150,"Ausholen"],
        ["punchR",95,"Treffer"],
        ["windLowR",130,"Ausholen"],
        ["kickLowR",105,"Treffer"],
        ["stagger",250,"Taumeln"],
        ["idleA",240,"Erholung"]
      ],

      // Dr. BOB: 25-stufiges DBZ Kamehameha
      kame:[
        ["idleA",     110, "Fokus"],                 // 01: Kampfhaltung senken
        ["kmSink",    120, "Hände sammeln"],        // 02: Hände an die Hüfte
        ["kmChargeA", 130, "KA..."],                // 03: Erster Ki-Funke
        ["kmChargeA", 140, "KA..."],                // 04: Ki-Kugel bildet sich
        ["kmChargeB", 140, "...ME..."],             // 05: Energie dehnt sich aus
        ["kmChargeB", 150, "...ME..."],             // 06: Aura flackert auf
        ["kmChargeB", 150, "...HA..."],             // 07: Konzentrische Druckwellen
        ["kmChargeB", 160, "...HA..."],             // 08: Elektrische Blitze zucken
        ["kmChargeB", 170, "...ME..."],             // 09: Kern wird gleißend weiß
        ["kmChargeB", 190, "MAXIMALLADUNG!"],       // 10: Maximale Kompression & Erschütterung
        ["kmFire",    110, "Abschuss vorbereiten"], // 11: Arme schnellen nach vorn
        ["kmFire",     95, "...HAAAA!"],            // 12: Strahl bricht hervor!
        ["kmFire",     90, "KAMEHAMEHA!"],          // 13: Voller Plasmastrom
        ["kmFire",     90, "KAMEHAMEHA!"],          // 14: Turbulenter Energiestrom
        ["kmFire",     90, "KAMEHAMEHA!"],          // 15: Maximale Strahlkraft
        ["kmFire",     90, "KAMEHAMEHA!"],          // 16: Schockwellen am Ziel
        ["kmFire",     95, "KAMEHAMEHA!"],          // 17: Dauerfeuer
        ["kmFire",    105, "KAMEHAMEHA!"],          // 18: Letzter Entladungsstoß
        ["kmFire",    115, "Nachhall"],             // 19: Strahl trennt sich von Händen
        ["kmFire",    125, "Verwehen"],             // 20: Plasma löst sich auf
        ["kmSink",    140, "Rückstoß"],             // 21: Bob sackt zurück, Hitzedampf
        ["kmSink",    160, "Erschöpft"],            // 22: Schweres Atmen, Abkühlen
        ["idleB",     130, "Aufrichten"],            // 23: Körper streckt sich
        ["idleA",     120, "Deckung"],               // 24: Abwehrhaltung
        ["idleA",     150, "Bereit"]                 // 25: Kampfbereit
      ],

      // Theresa: 25-stufiger Proton Roundhouse Kick
      protonKick:[
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
      ],

      // KurzDurch: 25-stufiger Microwave Meteor
      comet:[
        ["idleA",105,"Fokus"],["idleB",105,"Ausholen"],["cmRaiseA",115,"Mikrowelle greifen"],
        ["cmRaiseA",115,"Mikrowelle öffnen"],["cmRaiseA",120,"Helm aufsetzen"],
        ["cmRaiseB",120,"Mikrowellenhelm"],["cmRaiseB",125,"Aura startet"],
        ["cmRaiseB",125,"Rote Blitze"],["cmRaiseB",130,"Rote Blitze"],["cmRaiseB",135,"Maximalladung"],
        ["cmRaiseA",135,"Arme hoch"],["cmRaiseB",140,"Himmel laden"],["cmRaiseB",140,"Komet erfassen"],
        ["cmRaiseB",145,"Komet heranziehen"],["cmRaiseB",155,"Riesenkomet"],
        ["cmThrow",110,"Wurf vorbereiten"],["cmThrow",120,"Blitzwurf"],["cmThrow",135,"Komet fliegt"],
        ["cmAfter",110,"Einschlag"],["cmAfter",120,"Blitzexplosion"],["cmAfter",135,"Explosionsnachhall"],
        ["idleB",120,"Mikrowelle abnehmen"],["idleA",125,"Triumph"],["idleA",135,"Lachen"],["idleA",160,"Erholung"]
      ],

      // Lt. BrainBug: 25-stufiger Sour Milk Burst
      sourMilkBurst:[
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
      ],

      // Trefferreaktionen
      hitPunch:[["hitHigh",70,"Treffer"],["hitHigh2",130,"Erholung"],["idleA",160,"Erholung"]],
      hitKickHigh:[["hitHigh",80,"Treffer"],["stagger",180,"Taumeln"],["idleA",180,"Erholung"]],
      hitKickLow:[["hitLeg",80,"Treffer"],["stagger",155,"Taumeln"],["idleA",180,"Erholung"]],
      hitHeadbutt:[["hitHigh",75,"Treffer"],["stagger",190,"Taumeln"],["idleA",180,"Erholung"]],
      hitJumpKick:[["hitHigh",60,"Treffer"],["kdAir",190,"Wegfliegen"],["kdGround",150,"Aufschlag"],["kdGround",410,"Am Boden"],["getUp1",230,"Aufstehen"],["getUp2",180,"Aufstehen"],["idleA",170,"Erholung"]],
      hitBeam:[["flailA",130,"Getroffen"],["flailB",130,"Getroffen"],["flailC",130,"Getroffen"],["flailD",130,"Getroffen"],["kdAir",190,"Wegfliegen"],["kdGround",140,"Aufschlag"],["kdGround",420,"Am Boden"],["getUp1",230,"Aufstehen"],["getUp2",180,"Aufstehen"]],
      hitComet:[["hitHigh",70,"Treffer"],["kdAir",160,"Wegfliegen"],["kdGround",145,"Aufschlag"],["kdGround",450,"Am Boden"],["getUp1",230,"Aufstehen"],["getUp2",180,"Aufstehen"]],
      hitSourMilk:[["flailA",110,"Getroffen"],["flailB",190,"Betäubt"],["stagger",260,"Taumeln"],["idleA",180,"Erholung"]],
      blockHigh:[["guardHigh",60,"Block"],["guardPush",110,"Block"],["guardHigh",140,"Deckung"],["idleA",160,"Erholung"]],
      blockLow:[["guardLow",60,"Block"],["guardLowP",110,"Block"],["guardLow",140,"Deckung"],["idleA",160,"Erholung"]]
    };

    const ATTACKS = {
      punch:{keys:["punchR","punchL"],reaction:"hitPunch",damage:7,range:220,knock:24},
      kickHigh:{keys:["kickHighR","kickHighL"],reaction:"hitKickHigh",damage:11,range:282,knock:42},
      kickLow:{keys:["kickLowR","kickLowL"],reaction:"hitKickLow",damage:9,range:268,knock:30},
      jumpKick:{keys:["jumpKick"],reaction:"hitJumpKick",damage:15,range:310,knock:72},
      headbutt:{keys:["headbutt"],reaction:"hitHeadbutt",damage:13,range:185,knock:48},
      brainFlail:{keys:["brainFlail"],reaction:"hitKickHigh",damage:17,range:270,knock:58},
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
      ],
      brainbug:[
        {name:"WRONG WAY",keys:["punchR","kickLowL","punchL"]},
        {name:"LOST FORMATION",keys:["kickHighR","punchR","jumpKick"]}
      ],
      mcmoney:[
        {name:"RHYME RUSH",keys:["punchR","punchL","kickHighR"]},
        {name:"CASH OUT",keys:["kickLowR","punchR","jumpKick"]},
        {name:"BULL RUN",keys:["punchL","kickHighR","kickLowL"]}
      ]
    };
    const SPECIAL_COMBOS = {
      bob:{name:"DOC OVERDRIVE",keys:["punchR","kickLowL","kickHighR","kame"]},
      kurz:{name:"MICROWAVE METEOR",keys:["kickLowR","punchL","jumpKick","comet"]},
      nova:{name:"PROTON ROUNDHOUSE",keys:["punchR","kickHighL","protonKick"]},
      brainbug:{name:"SOUR MILK SURGE",keys:["punchL","kickLowR","sourMilkBurst"]},
      mcmoney:{name:"KAPITAL-CRASH",keys:["punchR","kickHighR","punchL","kapitalCrash"]}
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


