import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const target = resolve('sales-site/public/realframe-videos');
const temp = '/private/tmp/realframe-media';
mkdirSync(target, { recursive: true });
const films = [
  ['peaky', '1LemhpmtXMJO9C_jk4tScAEUbkPotFPc-'],
  ['doggy', '1GzsPUXKqVphTQ2Yzv50kojUonTtt-tk3'],
  ['odisseya', '1cfwbgOZqmRl8WUdgozVwTQuvnii5NpJ4'],
  ['one-hour', '1Pi1uFoWaIBvUYLN8PSC9iaWZCElbMcqY'],
  ['kauanzinho', '1XxscZclc67CXPTibdpbyiLtu1ubHb8nl'],
];
for (const [name, id] of films) {
  const output = `${target}/${name}.mp4`;
  if (existsSync(output)) continue;
  const source = `${temp}/${name}-source.mp4`;
  console.log(`Preparing ${name}`);
  if (!existsSync(source)) execFileSync('curl', ['-fL', '--retry', '2', '--max-time', '180', `https://drive.usercontent.google.com/download?id=${id}&export=download&confirm=t`, '-o', source], { stdio: 'inherit' });
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', source, '-map', '0:v:0', '-map', '0:a?', '-vf', "scale=w='if(gt(iw,ih),min(1280,iw),min(720,iw))':h=-2", '-c:v', 'libx264', '-preset', 'fast', '-crf', '24', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart', output], { stdio: 'inherit' });
}
