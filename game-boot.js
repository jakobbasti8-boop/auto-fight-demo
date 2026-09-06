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
      brainbug:{catalog:"brainbug",defaultFacing:1,image:null,sheet:null,portrait:null},
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

    SPRITES.ready(function(){
      ["bob","kurz","nova","brainbug","kame"].forEach(name=>{if(bindSpriteAsset(name))spritesLoaded++});
      applyCatalogMetrics();
      if(typeof renderPortrait==="function"){
        renderPortrait("portrait-left",spriteAssets.bob);
        renderPortrait("portrait-right",spriteAssets.kurz);
      }
      maybeEnableStart();
    });

    // Integer cell boundaries prevent 1px sprite bleeding because the source sheets
    // are not perfectly divisible by 5 in width/height.
    function frameRect(asset,row,col){
      const src=asset.sheet||asset.image;
      if(!src) return {sx:0,sy:0,sw:0,sh:0};
      const w=src.naturalWidth||src.width,h=src.naturalHeight||src.height;
      const x0=Math.round(col*w/5),x1=Math.round((col+1)*w/5);
      const y0=Math.round(row*h/5),y1=Math.round((row+1)*h/5);
      return {sx:x0,sy:y0,sw:x1-x0,sh:y1-y0};
    }


