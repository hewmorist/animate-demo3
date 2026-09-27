// Render a short, silent, deterministic patch from the embedded player recipe.
// Usage: node render-patch.mjs startSeconds durationSeconds output.mp4 [trackDurationSeconds]
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {spawn} from 'node:child_process';
import {once} from 'node:events';

const [startArg,lengthArg,output,trackArg='259'] = process.argv.slice(2);
const start=Number(startArg),length=Number(lengthArg),trackDuration=Number(trackArg);
if(!output||![start,length,trackDuration].every(Number.isFinite)||start<0||length<=0||start+length>trackDuration)
  throw new Error('Usage: node render-patch.mjs startSeconds durationSeconds output.mp4 [trackDurationSeconds]');

const html=readFileSync(new URL('./index.html',import.meta.url),'utf8');
const source=html.slice(html.indexOf('const recipe='),html.indexOf('const options='))+
  html.slice(html.indexOf('const clamp='),html.indexOf('function cameraAt('))+
  html.slice(html.indexOf('function cameraAt('),html.indexOf('function finish('))+
  '\nglobalThis.exported={recipe,cameraAt,compute};';
const {recipe,cameraAt,compute}=vm.runInNewContext(source+'\nglobalThis.exported;',{}, {timeout:1000});
const palette=['#ff63bd','#70e8ff','#e5ff79','#ffa35d'].map(hex=>[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)));
const fps=24,width=384,count=Math.ceil(length*fps);
const encoder=spawn('ffmpeg',['-hide_banner','-loglevel','error','-y',
  '-f','rawvideo','-pixel_format','rgba','-video_size',`${width}x${width}`,
  '-framerate',String(fps),'-i','pipe:0','-an','-vf','scale=800:800:flags=lanczos',
  '-c:v','libx264','-preset','medium','-crf','20','-pix_fmt','yuv420p',
  '-movflags','+faststart',output],{stdio:['pipe','inherit','inherit']});
for(let i=0;i<count;i++){
  const trackTime=start+i/fps;
  const p=cameraAt(trackTime*recipe.duration/trackDuration);
  const pixels=compute({...p,width,palette});
  if(!encoder.stdin.write(Buffer.from(pixels)))await once(encoder.stdin,'drain');
  if(i%fps===0)process.stderr.write(`Rendered ${i/fps}/${length}s\n`);
}
encoder.stdin.end();
const [code]=await once(encoder,'close');
if(code!==0)throw new Error(`ffmpeg exited ${code}`);
