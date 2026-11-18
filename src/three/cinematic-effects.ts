import * as THREE from 'three';

const noise = /* glsl */ `
float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f*f*(3.0-2.0*f);
  return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),
             mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);
}
float clouds(vec2 p) {
  mat2 turn = mat2(.8,.6,-.6,.8);
  return .52*noise(p) + .26*noise(turn*p*2.11)
    + .13*noise(p*4.41) + .065*noise(turn*p*9.02);
}
`;

const pressureWave = /* glsl */ `
vec3 backgroundBlast(vec2 p, float phase, vec3 tint) {
  float strength = smoothstep(0.,.16,phase)*(1.-smoothstep(.45,1.,phase));
  float angle = atan(p.y,p.x);
  float grain = noise(vec2(angle*7.,phase*.7));
  float r = length(p);
  float front = .055+phase*.88;
  float wave = exp(-abs(r-front-(grain-.5)*.075)*25.);
  float shards = pow(noise(vec2(angle*22.,4.)),5.);
  float wake = exp(-abs(r-front*.66)*8.)*shards*.8;
  return tint * strength * (wave*(.24+shards*1.7)+wake);
}
`;

const space = /* glsl */ `
vec2 p = (vUv-.5)*vec2(aspect,1.);
p += drift*.042;
float haze = clouds(p*3.7+vec2(time*.017,0.));
float plume = smoothstep(.38,.77,haze);
float distanceToCenter = length(p*vec2(1.05,1.55));
float halo = exp(-distanceToCenter*5.8);
float angle = atan(p.y,p.x);
float rays = pow(.5+.5*sin(angle*11.+haze*4.),7.) * halo;
vec3 color = vec3(.004,.007,.016);
color += mix(vec3(.014,.029,.075),vec3(.044,.017,.079),noise(p*4.)) * plume;
color += (halo*.5+rays*.19) * vec3(.023,.045,.092);
color += halo * energy * vec3(.050,.103,.20);
color += backgroundBlast(p,blast,vec3(.038,.10,.23));
`;

const storm = /* glsl */ `
vec2 p = (vUv-.5)*vec2(aspect,1.);
vec2 breeze = vec2(time*.048,-time*.014);
float warp = clouds(p*3.2-breeze*.5);
float ceiling = clouds(p*4.4+breeze+vec2(warp,warp*.36));
float foreground = clouds(p*7.6-breeze*1.43+vec2(7.4,2.0));
float density = smoothstep(.29,.79,ceiling*.72+foreground*.28);
float diffuse = smoothstep(.3,.64,ceiling+vUv.y*.11);
float y = (vUv.y-.27)/.78;
float seed = floor(time/10.5);
float boltX = .37 + .28*hash(vec2(seed,5.));
float forkHeight = .68;
float jitter = (noise(vec2(y*15.,seed+8.))- .5)*.075;
jitter += (noise(vec2(y*44.,seed+11.))-.5)*.023;
float mainBolt = abs(vUv.x-boltX-(1.-y)*.14-jitter);
float branchX = boltX+(1.-forkHeight)*.14+(forkHeight-y)*.45;
branchX += (noise(vec2(y*21.,seed+12.))-.5)*.032;
float fork = abs(vUv.x-branchX);
float core = exp(-mainBolt*720.)*smoothstep(.04,.24,y);
core += exp(-fork*940.)*smoothstep(.29,.47,y)*(1.-smoothstep(.66,.72,y))*.57;
float bloom = exp(-mainBolt*22.)*smoothstep(.02,.45,y);
vec3 color = vec3(.008,.011,.017) + vec3(.065,.075,.087)*density*diffuse;
color *= mix(.41,1.,smoothstep(.02,.62,vUv.y));
color += energy * (vec3(.17,.23,.34)*density*bloom + vec3(.53,.70,.93)*core);
color += backgroundBlast(p,blast,vec3(.045,.075,.12)) * (.33+density);
`;

export function createAtmosphere(mode: 'space' | 'storm') {
  const geometry = new THREE.PlaneGeometry(2, 2);
  const uniforms = {
    time: {value: 0},
    energy: {value: 0},
    blast: {value: 0},
    aspect: {value: 1},
    drift: {value: new THREE.Vector2()},
  };
  const material = new THREE.ShaderMaterial({
    uniforms, depthTest: false, depthWrite: false,
    vertexShader: `varying vec2 vUv;
      void main() { vUv = uv; gl_Position = vec4(position.xy,0.,1.); }`,
    fragmentShader: `varying vec2 vUv;
      uniform float time,energy,aspect,blast;
      uniform vec2 drift;
      ${noise}
      ${pressureWave}
      void main() {
        ${mode === 'space' ? space : storm}
        gl_FragColor = vec4(color,1.);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.frustumCulled = false;
  mesh.renderOrder = -20;
  return {mesh, uniforms, dispose() { geometry.dispose(); material.dispose(); }};
}

export function createDust(mode: 'space' | 'storm', compact: boolean) {
  const count = mode === 'space' ? (compact ? 1150 : 2900) : 160;
  const positions = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  let seed = 37519;
  const random = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  for (let i = 0; i < count; i++) {
    positions[i*3] = (random()-.5)*30;
    positions[i*3+1] = (random()-.5)*20;
    positions[i*3+2] = -random()*20-2.4;
    sizes[i] = random();
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions,3));
  geometry.setAttribute('spark', new THREE.BufferAttribute(sizes,1));
  const uniforms = {time:{value:0}, energy:{value:0}, space:{value:mode==='space'?1:0}};
  const material = new THREE.ShaderMaterial({
    uniforms, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: `attribute float spark;
      uniform float time,energy,space;
      varying float shade;
      void main() {
        vec3 p=position;
        p.x += sin(time*.24+p.z)*(.10+.29*spark);
        p.y += cos(time*.17+p.x)*.23;
        p.xy += normalize(p.xy+vec2(.0001))*energy*spark*.27;
        vec4 view=modelViewMatrix*vec4(p,1.);
        gl_Position=projectionMatrix*view;
        gl_PointSize=clamp((8.+18.*spark)/-view.z,.85,2.25+energy);
        shade = (.09+.58*pow(spark,8.))*(.40+.60*space)+energy*.15*spark;
      }`,
    fragmentShader: `varying float shade;
      void main() {
        float d=length(gl_PointCoord-.5)*2.;
        gl_FragColor=vec4(vec3(.53,.68,.94),shade*exp(-d*d*3.5)*(1.-smoothstep(.75,1.,d)));
      }`,
  });
  const points = new THREE.Points(geometry,material);
  points.frustumCulled = false;
  return {points, uniforms, dispose() { geometry.dispose(); material.dispose(); }};
}

// The two canvases share one scheduler. Offscreen scenes unregister their draws.
type Draw = (now: number) => void;
const draws = new Set<Draw>();
let frame = 0;
function tick(now: number) {
  frame = 0;
  for (const draw of draws) draw(now);
  if (draws.size) frame = requestAnimationFrame(tick);
}
export function setDrawing(draw: Draw, active: boolean) {
  if (active) draws.add(draw);
  else draws.delete(draw);
  if (draws.size && !frame) frame = requestAnimationFrame(tick);
  if (!draws.size && frame) {
    cancelAnimationFrame(frame);
    frame = 0;
  }
}
