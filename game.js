
'use strict';
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const palette=['#ff63bd','#70e8ff','#e5ff79','#ffa35d'].map(hex=>[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)));
function compute(p) {
  const {width:w,cx,cy,span,iterations:max,palette:colors,seed,edgeOutside}=p;
  const pixels=new Uint8ClampedArray(w*w*4),unit=span/w,phase=(seed%997)*.001;
  // Saturated hue bands gradually replace RGB blends as the camera dives.
  const depth=clamp(Math.log10(3.2/span)/9,0,1),colorMix=clamp((depth-.22)/.62,0,1);
  const hueStops=[.91,.53,.20,.07];
  for(let y=0;y<w;y++)for(let x=0;x<w;x++){
    const cr=cx+(x+.5-w/2)*unit,ci=cy-(y+.5-w/2)*unit;
    // Transparent where the newest complete render already provides pixels.
    // Every opaque edge pixel is calculated from the fractal equation.
    // Calculate beneath the join as well, so feathering cannot reveal the
    // dark canvas between a complete frame and its calculated edge ring.
    if(edgeOutside&&Math.abs(cr-edgeOutside.cx)<edgeOutside.span/2-16*unit&&
       Math.abs(ci-edgeOutside.cy)<edgeOutside.span/2-16*unit)continue;
    const xr=cr-.25,q=xr*xr+ci*ci,inside=q*(q+xr)<=.25*ci*ci||(cr+1)*(cr+1)+ci*ci<=.0625;
    let zr=0,zi=0,n=0,mag=0;
    if(!inside)for(;n<max;n++){
      const zr2=zr*zr,zi2=zi*zi;mag=zr2+zi2;if(mag>256)break;
      zi=2*zr*zi+ci;zr=zr2-zi2+cr;
    }else n=max;
    const k=(y*w+x)*4;
    if(n===max){pixels[k]=5;pixels[k+1]=7;pixels[k+2]=17}
    else {
      const smooth=n+1-Math.log2(Math.max(1,Math.log2(Math.sqrt(mag))));
      const v=smooth*.042+phase,base=Math.floor(v),fraction=v-base;
      const a=colors[((base%4)+4)%4],b=colors[(((base+1)%4)+4)%4];
      const f=fraction*fraction*(3-2*fraction),shade=.66+.34*Math.min(1,n/30);
      let r=a[0]*(1-f)+b[0]*f,g=a[1]*(1-f)+b[1]*f,bl=a[2]*(1-f)+b[2]*f;
      const mid=(Math.max(r,g,bl)+Math.min(r,g,bl))/2-18*.9,boost=1+1.8*.9;
      r=clamp(mid+(r-mid)*boost,0,255);g=clamp(mid+(g-mid)*boost,0,255);bl=clamp(mid+(bl-mid)*boost,0,255);
      if(colorMix){
        const first=hueStops[((base%4)+4)%4],last=hueStops[(((base+1)%4)+4)%4];
        const hue=(first+(((last-first+1.5)%1)-.5)*f+1)%1;
        const wheel=hue*6,sector=Math.floor(wheel),part=wheel-sector;
        const value=.72+.28*(.5+.5*Math.cos(smooth*.18)),low=value*.03;
        const falling=value*(1-.97*part),rising=value*(.03+.97*part);
        const bright=value*255,dim=low*255,fall=falling*255,rise=rising*255;
        let rr,gg,bb;
        switch(sector%6){
          case 0: rr=bright;gg=rise;bb=dim;break;
          case 1: rr=fall;gg=bright;bb=dim;break;
          case 2: rr=dim;gg=bright;bb=rise;break;
          case 3: rr=dim;gg=fall;bb=bright;break;
          case 4: rr=rise;gg=dim;bb=bright;break;
          default: rr=bright;gg=dim;bb=fall;
        }
        r+=colorMix*(rr-r);g+=colorMix*(gg-g);bl+=colorMix*(bb-bl);
      }
      pixels[k]=shade*r;pixels[k+1]=shade*g;pixels[k+2]=shade*bl;
    }
    pixels[k+3]=255;
  }
  return pixels;
}

const stage=document.getElementById('stage'),canvas=document.getElementById('view'),ctx=canvas.getContext('2d'),overlay=document.getElementById('overlay'),heading=document.getElementById('heading'),copy=document.getElementById('copy'),action=document.getElementById('action'),pause=document.getElementById('pause'),reticle=document.getElementById('reticle');
const depthEl=document.getElementById('depth'),regionEl=document.getElementById('region'),progressEl=document.getElementById('progress');
const render=document.createElement('canvas'),rctx=render.getContext('2d');
let playing=false,started=false,last=0,elapsed=0,leg=0,legTime=0,aimX=0,aimY=0,camX=0,camY=0,work=false,worker=null,frameSerial=0,fade=0,oldFrame=null,keys=new Set();
const anchors=[[-.743643887037151,.13182590420533],[-.1011,.9563],[-.74543,.11301],[-1.25066,.02012],[-.15652,1.03225],[-.748,.102]];
const LEG_SECONDS=32, START_SPAN=3.2,END_SPAN=.000006;
function anchor(){return anchors[leg%anchors.length]}
function camera(){let f=clamp(legTime/LEG_SECONDS,0,1),span=START_SPAN*Math.pow(END_SPAN/START_SPAN,f),a=anchor();
// Steering is in viewport coordinates, measured as a fraction of current span.
// Because the offsets shrink with span, doubles always subtract quantities in range.
return {cx:a[0]+camX*span*.36,cy:a[1]-camY*span*.36,span,iterations:Math.round(110+f*480),width:Math.round(Math.min(300,stage.clientWidth*.62)),seed:219+leg*11,palette}}
function show(head,body,label){heading.textContent=head;copy.textContent=body;action.textContent=label;overlay.classList.remove('hide')}
function toggle(){if(!started){started=true;playing=true;overlay.classList.add('hide')}else{playing=!playing;overlay.classList.toggle('hide',playing);if(!playing)show('PAUSED','Choose a new direction when you resume.','RESUME')}pause.textContent=playing?'PAUSE':'RESUME'}
action.onclick=toggle;pause.onclick=toggle;
function point(e){let b=stage.getBoundingClientRect();aimX=clamp((e.clientX-b.left)/b.width*2-1,-1,1);aimY=clamp((e.clientY-b.top)/b.height*2-1,-1,1);reticle.style.left=((aimX+1)*50)+'%';reticle.style.top=((aimY+1)*50)+'%'}
stage.onpointerdown=e=>{if(e.target.closest(".overlay,button"))return;stage.setPointerCapture(e.pointerId);point(e)};stage.onpointermove=e=>{if(e.buttons||e.pointerType==='touch')point(e)};
window.onkeydown=e=>{if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Space'].includes(e.code))e.preventDefault();keys.add(e.code);if(e.code==='Space'&&!e.repeat)toggle()};
window.onkeyup=e=>keys.delete(e.code);window.onblur=()=>{if(playing)toggle()};
try{let source='const clamp='+clamp.toString()+';const compute='+compute.toString()+';self.onmessage=e=>{let pixels=compute(e.data);self.postMessage({serial:e.data.serial,width:e.data.width,pixels:pixels.buffer},[pixels.buffer])}';let url=URL.createObjectURL(new Blob([source],{type:'text/javascript'}));worker=new Worker(url);URL.revokeObjectURL(url);worker.onmessage=e=>receive(e.data);worker.onerror=()=>{worker.terminate();worker=null;work=false}}catch(e){worker=null}
function receive({serial,width,pixels}){if(serial!==frameSerial)return;work=false;render.width=width;render.height=width;let im=rctx.createImageData(width,width);im.data.set(new Uint8ClampedArray(pixels));rctx.putImageData(im,0,0)}
function request(){if(work)return;let p=camera(),serial=++frameSerial;work=true;if(worker)worker.postMessage({...p,serial});else setTimeout(()=>receive({serial,width:p.width,pixels:compute(p).buffer}),0)}
function frame(t){let dt=Math.min(.05,(t-last)/1000||0);last=t;if(playing){elapsed+=dt;legTime+=dt;let keySpeed=1.3*dt;if(keys.has('ArrowLeft')||keys.has('KeyA'))aimX-=keySpeed;if(keys.has('ArrowRight')||keys.has('KeyD'))aimX+=keySpeed;if(keys.has('ArrowUp')||keys.has('KeyW'))aimY-=keySpeed;if(keys.has('ArrowDown')||keys.has('KeyS'))aimY+=keySpeed;aimX=clamp(aimX,-1,1);aimY=clamp(aimY,-1,1);camX+=(aimX-camX)*Math.min(1,dt*1.8);camY+=(aimY-camY)*Math.min(1,dt*1.8);reticle.style.left=((aimX+1)*50)+'%';reticle.style.top=((aimY+1)*50)+'%';
if(legTime>=LEG_SECONDS){oldFrame=document.createElement('canvas');oldFrame.width=canvas.width;oldFrame.height=canvas.height;oldFrame.getContext('2d').drawImage(canvas,0,0);legTime-=LEG_SECONDS;leg++;fade=1;camX=aimX=0;camY=aimY=0;frameSerial++;work=false}
depthEl.textContent='DEPTH '+Math.floor(elapsed*5.7).toLocaleString();regionEl.textContent='REGION '+(leg+1);progressEl.style.width=(legTime/LEG_SECONDS*100)+'%';
if(!work)request();fade=Math.max(0,fade-dt/1.25)}
ctx.fillStyle='#050711';ctx.fillRect(0,0,800,800);if(render.width)ctx.drawImage(render,0,0,800,800);if(fade&&oldFrame){ctx.globalAlpha=fade;ctx.drawImage(oldFrame,0,0);ctx.globalAlpha=1}
requestAnimationFrame(frame)}requestAnimationFrame(frame);
