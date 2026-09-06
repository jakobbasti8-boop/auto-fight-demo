"use strict";

    const canvas = document.getElementById("arena");
    const ctx = canvas.getContext("2d");
    const W = canvas.width, H = canvas.height, GROUND = 744;
    const GAME_SPEED = 1.5;

    /* Die Spiellogik rechnet weiter in 1536x864. Auf hochaufloesenden
       Bildschirmen wird die Zeichenflaeche dahinter vergroessert, damit die
       Figuren nicht als hochskaliertes Canvas-Bild verwaschen ankommen.
       Begrenzt auf Faktor 2 - darueber kostet es nur noch Fuellrate. */
    const RENDER_SCALE = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    if (RENDER_SCALE > 1) {
      canvas.width = Math.round(W * RENDER_SCALE);
      canvas.height = Math.round(H * RENDER_SCALE);
    }
    const bg = new Image();
    bg.src = "assets/background.webp";

    /* Die Blaetter kommen aus dem Katalog (assets/catalog.js + game-catalog.js).
       spriteAssets bleibt als schmale Bruecke bestehen, damit Portraits und
       aeltere Zeichenwege unveraendert weiterlaufen. */
    const spriteAssets={
      bob:{catalog:"bob",defaultFacing:1,image:null,sheet:null,portrait:null},
      kurz:{catalog:"kurz",defaultFacing:-1,image:null,sheet:null,portrait:null},
      nova:{catalog:"theresa",defaultFacing:1,image:null,sheet:null,portrait:null},
      kame:{catalog:"kame",defaultFacing:1,image:null,sheet:null,portrait:null}
    };
    let spritesLoaded=0;

    function bindSpriteAsset(name){
      const shim=spriteAssets[name],entry=SPRITES.get(shim.catalog);
      if(!entry||!entry.ok)return false;
      shim.image=entry.img;shim.sheet=entry.img;shim.entry=entry;
      shim.defaultFacing=entry.defaultFacing;
      if(!shim.portrait)shim.portrait=portraitRect(entry);
      return true;
    }

    function maybeEnableStart(){
      const b=document.getElementById("demo-start");
      if(!b)return;
      if(SPRITES.missing()){
        b.disabled=true;b.textContent="Katalog unvollständig";
        return;
      }
      if(SPRITES.isReady()){b.disabled=false;b.textContent="Demo starten"}
    }
    // Bleibt fuer aeltere Aufrufer erhalten, hat aber keine Aufgabe mehr.
    function noteSpecialRowLoaded(){maybeEnableStart();}
    function rawSheet(image){return image;}

    SPRITES.ready(function(){
      ["bob","kurz","nova","kame"].forEach(name=>{if(bindSpriteAsset(name))spritesLoaded++});
      applyCatalogMetrics();
      renderPortrait("portrait-bob",spriteAssets.bob);
      renderPortrait("portrait-kurz",spriteAssets.kurz);
      renderPortrait("portrait-neu",spriteAssets.nova);
      maybeEnableStart();
    });
    const KAME_FRAMES={"1": {"w": 161, "h": 208, "x": 146, "y": 234}, "2": {"w": 165, "h": 201, "x": 146, "y": 241}, "3": {"w": 167, "h": 200, "x": 144, "y": 242}, "4": {"w": 176, "h": 201, "x": 140, "y": 241}, "5": {"w": 186, "h": 200, "x": 142, "y": 242}, "6": {"w": 185, "h": 205, "x": 138, "y": 237}, "7": {"w": 198, "h": 216, "x": 132, "y": 226}, "8": {"w": 197, "h": 216, "x": 132, "y": 226}, "9": {"w": 202, "h": 216, "x": 129, "y": 226}, "10": {"w": 208, "h": 207, "x": 139, "y": 235}, "11": {"w": 240, "h": 188, "x": 142, "y": 254}, "12": {"w": 238, "h": 96, "x": 111, "y": 182}, "13": {"w": 233, "h": 103, "x": 114, "y": 178}, "14": {"w": 235, "h": 171, "x": 112, "y": 144}, "15": {"w": 235, "h": 217, "x": 112, "y": 122}, "16": {"w": 235, "h": 180, "x": 134, "y": 262}, "17": {"w": 207, "h": 179, "x": 134, "y": 263}, "18": {"w": 184, "h": 181, "x": 144, "y": 261}, "19": {"w": 168, "h": 181, "x": 147, "y": 261}, "20": {"w": 170, "h": 201, "x": 142, "y": 241}, "21": {"w": 184, "h": 209, "x": 134, "y": 233}, "22": {"w": 182, "h": 199, "x": 130, "y": 243}, "23": {"w": 182, "h": 221, "x": 130, "y": 221}, "24": {"w": 176, "h": 219, "x": 137, "y": 223}, "25": {"w": 176, "h": 220, "x": 137, "y": 222}},KAME_ZOOM=0.4522,KAME_BASE=0.0391,KAME_BEAM={"x": 151.0, "y": 322.5};

    // Integer cell boundaries prevent 1px sprite bleeding because the source sheets
    // are not perfectly divisible by 5 in width/height.
    function frameRect(asset,row,col){
      const src=asset.sheet||asset.image;
      const w=src.naturalWidth||src.width,h=src.naturalHeight||src.height;
      const x0=Math.round(col*w/5),x1=Math.round((col+1)*w/5);
      const y0=Math.round(row*h/5),y1=Math.round((row+1)*h/5);
      return {sx:x0,sy:y0,sw:x1-x0,sh:y1-y0};
    }

    const P = {
      idleA:{rx:178,ry:228,spine:-82,fR:[146,352],fL:[212,352],hR:[194,190],hL:[209,196],head:-84},
      idleB:{rx:182,ry:223,spine:-85,fR:[146,352],fL:[212,352],hR:[196,184],hL:[211,189],head:-87},
      chamberR:{rx:172,ry:224,spine:-95,fR:[142,352],fL:[206,352],hR:[150,214],hL:[200,188],head:-90},
      punchR:{rx:200,ry:234,spine:-74,fR:[152,352],fL:[254,352],hR:[268,180],hL:[188,206],head:-72},
      chamberL:{rx:172,ry:224,spine:-93,fR:[144,352],fL:[204,352],hR:[196,192],hL:[152,210],head:-90},
      punchL:{rx:198,ry:234,spine:-76,fR:[150,352],fL:[256,352],hR:[186,208],hL:[266,182],head:-74},
      windHighR:{rx:176,ry:230,spine:-98,fR:[184,286],fL:[168,352],hR:[146,216],hL:[176,200],head:-96},
      kickHighR:{rx:176,ry:236,spine:-108,fR:[268,178],fL:[168,352],hR:[130,206],hL:[148,224],head:-104},
      windHighL:{rx:176,ry:230,spine:-96,fR:[166,352],fL:[186,286],hR:[178,202],hL:[146,214],head:-96},
      kickHighL:{rx:176,ry:236,spine:-106,fR:[166,352],fL:[270,180],hR:[132,204],hL:[150,226],head:-104},
      sinkR:{rx:178,ry:246,spine:-90,fR:[160,352],fL:[206,352],hR:[198,206],hL:[210,212],head:-88},
      windLowR:{rx:178,ry:250,spine:-93,fR:[198,286],fL:[170,352],hR:[204,208],hL:[213,215],head:-90},
      kickLowR:{rx:176,ry:258,spine:-97,fR:[290,298],fL:[168,352],hR:[198,220],hL:[207,227],head:-94},
      sinkL:{rx:178,ry:246,spine:-89,fR:[206,352],fL:[160,352],hR:[210,212],hL:[198,206],head:-88},
      windLowL:{rx:178,ry:250,spine:-91,fR:[170,352],fL:[198,286],hR:[213,215],hL:[204,208],head:-90},
      kickLowL:{rx:176,ry:258,spine:-95,fR:[168,352],fL:[290,300],hR:[207,227],hL:[198,220],head:-93},
      jkCrouch:{rx:178,ry:268,spine:-86,fR:[152,352],fL:[208,352],hR:[196,232],hL:[208,238],head:-84},
      jkRise:{rx:178,ry:195,spine:-84,fR:[164,262],fL:[192,258],hR:[192,158],hL:[204,164],head:-84},
      jkStrike:{rx:186,ry:180,spine:-96,fR:[280,232],fL:[158,220],hR:[150,168],hL:[164,182],head:-90},
      jkLand:{rx:180,ry:262,spine:-84,fR:[148,352],fL:[214,352],hR:[196,228],hL:[208,234],head:-82},
      hbWind:{rx:176,ry:230,spine:-100,fR:[148,352],fL:[210,352],hR:[186,208],hL:[198,214],head:-114},
      hbHit:{rx:198,ry:236,spine:-64,fR:[152,352],fL:[250,352],hR:[186,214],hL:[196,220],head:-50},
      kmSink:{rx:178,ry:246,spine:-88,fR:[152,352],fL:[206,352],hR:[180,214],hL:[190,218],head:-86},
      kmChargeA:{rx:178,ry:252,spine:-92,fR:[152,352],fL:[206,352],hR:[146,246],hL:[152,240],head:-88},
      kmChargeB:{rx:178,ry:256,spine:-95,fR:[150,352],fL:[206,352],hR:[140,250],hL:[146,244],head:-90},
      kmFire:{rx:182,ry:228,spine:-84,fR:[150,352],fL:[216,352],hR:[240,178],hL:[246,182],head:-84},
      cmRaiseA:{rx:178,ry:236,spine:-88,fR:[152,352],fL:[206,352],hR:[186,142],hL:[196,148],head:-96},
      cmRaiseB:{rx:178,ry:232,spine:-90,fR:[152,352],fL:[206,352],hR:[182,134],hL:[192,140],head:-98},
      cmThrow:{rx:186,ry:234,spine:-76,fR:[150,352],fL:[222,352],hR:[244,190],hL:[250,196],head:-74},
      cmAfter:{rx:182,ry:236,spine:-80,fR:[150,352],fL:[214,352],hR:[236,206],hL:[242,212],head:-80},
      hitHigh:{rx:172,ry:230,spine:-98,fR:[140,352],fL:[204,352],hR:[142,206],hL:[152,196],head:-118},
      hitHigh2:{rx:174,ry:228,spine:-92,fR:[142,352],fL:[206,352],hR:[160,204],hL:[172,198],head:-100},
      hitBody:{rx:176,ry:240,spine:-72,fR:[146,352],fL:[206,352],hR:[196,224],hL:[204,230],head:-56},
      hitLeg:{rx:170,ry:256,spine:-84,fR:[136,352],fL:[196,352],hR:[186,232],hL:[196,238],head:-80},
      stagger:{rx:160,ry:232,spine:-90,fR:[124,352],fL:[186,352],hR:[168,204],hL:[180,210],head:-92},
      kdAir:{rx:150,ry:250,spine:-160,fR:[190,206],fL:[204,220],hR:[86,214],hL:[80,240],head:-165},
      kdGround:{rx:190,ry:338,spine:-178,fR:[248,344],fL:[252,332],hR:[112,326],hL:[116,342],head:-178},
      getUp1:{rx:178,ry:300,spine:-72,fR:[152,352],fL:[212,352],hR:[200,306],hL:[208,288],head:-66},
      getUp2:{rx:178,ry:262,spine:-80,fR:[150,352],fL:[210,352],hR:[196,266],hL:[206,258],head:-78},
      flailA:{rx:186,ry:200,spine:-70,fR:[164,262],fL:[196,272],hR:[214,168],hL:[224,180],head:-60},
      flailB:{rx:182,ry:186,spine:-96,fR:[152,248],fL:[190,256],hR:[150,166],hL:[162,152],head:-104},
      flailC:{rx:188,ry:208,spine:-64,fR:[172,270],fL:[204,262],hR:[222,196],hL:[210,206],head:-52},
      flailD:{rx:180,ry:192,spine:-104,fR:[148,252],fL:[188,262],hR:[146,180],hL:[158,168],head:-112},
      ko:{rx:190,ry:338,spine:-178,fR:[248,344],fL:[252,332],hR:[112,326],hL:[116,342],head:-178},
      guardHigh:{rx:172,ry:230,spine:-88,fR:[142,352],fL:[202,352],hR:[150,198],hL:[164,188],head:-94},
      guardPush:{rx:164,ry:232,spine:-94,fR:[128,352],fL:[190,352],hR:[138,202],hL:[152,192],head:-98},
      guardLow:{rx:174,ry:246,spine:-84,fR:[144,352],fL:[202,352],hR:[158,226],hL:[172,216],head:-86},
      guardLowP:{rx:168,ry:250,spine:-88,fR:[136,352],fL:[194,352],hR:[150,230],hL:[164,220],head:-90},
      chokeA:{rx:180,ry:230,spine:-86,fR:[146,352],fL:[210,352],hR:[192,190],hL:[208,198],head:-84},
      chokeB:{rx:178,ry:210,spine:-78,fR:[160,330],fL:[200,330],hR:[210,170],hL:[230,180],head:-74},
      chokeC:{rx:180,ry:190,spine:-70,fR:[150,300],fL:[210,300],hR:[218,170],hL:[236,184],head:-66}
    };

