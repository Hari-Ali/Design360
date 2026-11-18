import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import {createAtmosphere, createDust, setDrawing} from './cinematic-effects';

export function createSculpture() {
  const group = new THREE.Group();
  const material = new THREE.MeshPhysicalMaterial({
    color: 0x444d60, metalness: .91, roughness: .31, envMapIntensity: .86,
    anisotropy: .62, anisotropyRotation: Math.PI * .5, clearcoat: .17, clearcoatRoughness: .38,
  });
  const edge = new THREE.LineBasicMaterial({color: 0x76869a, transparent: true, opacity: .39});
  const shape = new THREE.Shape([
    [-.22, -1.4], [.20, -1.35], [.23, 1.17], [.02, 1.43], [-.25, 1.18],
  ].map(([x, y]) => new THREE.Vector2(x, y)));
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: .37, steps: 1, bevelEnabled: true, bevelSize: .047, bevelThickness: .04, bevelSegments: 2,
  });
  geometry.translate(0, 0, -.18);
  const edges = new THREE.EdgesGeometry(geometry, 27);
  const sliver = new THREE.BoxGeometry(.025, 1.1, .025);
  const pieces = Array.from({length: 9}, (_, index) => {
    const arm = index % 3;
    const angle = arm * Math.PI * 2 / 3 + .28;
    const radial = new THREE.Vector3(Math.cos(angle), Math.sin(angle), 0);
    const tangent = new THREE.Vector3(-radial.y, radial.x, 0);
    const pivot = new THREE.Group();
    pivot.position.copy(radial).multiplyScalar(index < 3 ? .85 : 1.2 + index * .07);
    pivot.position.z = index < 3 ? .06 * arm : -.34 - index * .035;
    pivot.rotation.z = angle + .18;
    const mesh = new THREE.Mesh(index < 3 ? geometry : sliver, material);
    mesh.castShadow = mesh.receiveShadow = index < 3;
    pivot.add(mesh);
    if (index < 3) pivot.add(new THREE.LineSegments(edges, edge));
    group.add(pivot);
    return {
      pivot, origin: pivot.position.clone(), assembled: pivot.quaternion.clone(),
      separated: new THREE.Quaternion().setFromEuler(new THREE.Euler(
        Math.sin(index * 2.3) * .8, .32, pivot.rotation.z + Math.cos(index * 1.7) * .68,
      )),
      travel: radial.multiplyScalar(index < 3 ? 1.2 : 1.9)
        .addScaledVector(tangent, index % 2 ? .68 : -.45)
        .setZ(index % 2 ? -.7 : 1.15),
    };
  });
  return {group, pieces, dispose() {
    [geometry, edges, sliver, material, edge].forEach(asset => asset.dispose());
  }};
}

export function createHeroScene(host: HTMLElement): () => void {
  const canvas = host.querySelector('canvas')!;
  const button = host.querySelector<HTMLButtonElement>('button')!;
  const compact = matchMedia('(max-width: 767px)');
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  const renderer = new THREE.WebGLRenderer({
    canvas, alpha: true, antialias: !compact.matches, powerPreference: 'low-power',
  });
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = .95;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, .1, 40);
  const { group, pieces, dispose } = createSculpture();
  group.rotation.set(.12, -.41, -.1);
  const sky = createAtmosphere('space');
  const dust = createDust('space', compact.matches);
  const trails = new THREE.BufferGeometry();
  const tailPositions = new THREE.BufferAttribute(new Float32Array(pieces.length * 6), 3);
  tailPositions.setUsage(THREE.DynamicDrawUsage);
  trails.setAttribute('position', tailPositions);
  const trailMaterial = new THREE.LineBasicMaterial({
    color: 0x8ebcfd, transparent: true, depthWrite: false,
    blending: THREE.AdditiveBlending, opacity: 0,
  });
  const streaks = new THREE.LineSegments(trails, trailMaterial);
  streaks.frustumCulled = false;
  group.add(streaks);
  scene.add(group, sky.mesh, dust.points);
  function makeEnvironment() {
    const room = new RoomEnvironment();
    const generator = new THREE.PMREMGenerator(renderer);
    const reflection = generator.fromScene(room, .06);
    room.dispose();
    generator.dispose();
    return reflection;
  }
  let environment = makeEnvironment();
  scene.environment = environment.texture;
  const key = new THREE.DirectionalLight(0xd7e4ff, 2.1);
  key.position.set(-3, 5, 4);
  renderer.shadowMap.enabled = !compact.matches;
  key.castShadow = !compact.matches;
  key.shadow.mapSize.set(512,512);
  key.shadow.bias = -.0003;
  key.shadow.normalBias = .035;
  const rim = new THREE.PointLight(0x69cfff, 19, 14, 2);
  const violet = new THREE.DirectionalLight(0x8c78ff, 1.75);
  violet.position.set(3, -2, -4);
  scene.add(key, rim, violet);

  const events = new AbortController();
  const signal = events.signal;
  let visible = true, contextLost = false, suspended = false;
  let previous = 0, elapsed = 0;
  let held = false, heldFor = 0;
  let pointerX = 0, pointerY = 0;
  const section = host.closest<HTMLElement>('.hero')!;
  const low = () => document.documentElement.classList.contains('low-motion');
  const active = () => !suspended && !contextLost && visible && !document.hidden && !low();
  function setHeld(value: boolean) {
    held = value;
    host.dataset.holding = String(value);
    if (!value) heldFor = 0;
  }

  function render(now: number) {
    if (!active()) return;
    const delta = previous ? Math.min((now - previous) / 1000, .05) : 0;
    previous = now;
    elapsed += delta;
    const scroll = Number(section.style.getPropertyValue('--hero-progress'));
    heldFor = held ? heldFor + delta : 0;
    if (heldFor >= .24 && scroll < .55) {
      const target = Math.min(window.scrollY + delta * innerHeight * .66,
        Number(section.dataset.holdTarget));
      if (Number.isFinite(target) && target > window.scrollY) {
        window.scrollTo({top: target, behavior: 'instant'});
      }
    }
    host.style.setProperty('--charge', String(Math.min(heldFor / .24, 1)));
    const smooth = THREE.MathUtils.smoothstep;
    const separation = smooth(scroll, .20, .55) * (1 - smooth(scroll, .70, 1));
    const float = smooth(scroll, .49, .58) * (1 - smooth(scroll, .68, .79));
    const pulse = Math.exp(-Math.pow((scroll-.96)*37,2))*.34 + float*(.09+.08*Math.sin(elapsed*2));
    group.rotation.x = THREE.MathUtils.damp(group.rotation.x, .12 + pointerY * .16 + scroll * .13, 5, delta);
    group.rotation.y = THREE.MathUtils.damp(group.rotation.y, -.41 + pointerX * .23 + Math.sin(elapsed * .49) * .10, 5, delta);
    group.rotation.z = -.1 + Math.sin(elapsed * .26) * .075;
    const compactFraming = 1 + .18 * (1 - smooth(camera.aspect, .44, .72));
    camera.position.z = (8.95 - smooth(scroll, 0, .2)*.48 + separation*2.8) *
      compactFraming / Math.min(1, camera.aspect);
    camera.position.x = Math.sin(float * Math.PI * .5) * .27;
    camera.lookAt(0,0,0);
    group.position.y = Math.sin(elapsed * 1.05) * .055;
    const charge = smooth(scroll, .20, .31) * (1 - smooth(scroll, .52, .62));
    const join = smooth(scroll, .85, .94) * (1 - smooth(scroll, .96, 1));
    trailMaterial.opacity = charge*.26 + join*.20;
    for (const [index, {pivot, origin, travel, assembled, separated}] of pieces.entries()) {
      const amount = smooth(separation, index * .013, .9 + index * .011);
      pivot.position.copy(origin).addScaledVector(travel, amount);
      pivot.position.z += Math.sin(scroll*20+index*1.91)*.115*float;
      pivot.position.y += Math.cos(scroll*18+index*1.21)*.089*float;
      pivot.quaternion.slerpQuaternions(assembled, separated, amount);
      const tip = pivot.position;
      const length = (charge + join) * (.12 + index*.019);
      tailPositions.setXYZ(index*2, tip.x, tip.y, tip.z);
      tailPositions.setXYZ(index*2+1, tip.x - travel.x*length, tip.y - travel.y*length, tip.z - travel.z*length);
    }
    tailPositions.needsUpdate = trailMaterial.opacity > 0;
    rim.position.set(Math.sin(elapsed * .62)*3, Math.cos(elapsed * .55)*2, 2.6);
    rim.intensity = 10 + charge * 10 + pulse * 18;
    sky.uniforms.time.value = dust.uniforms.time.value = elapsed;
    sky.uniforms.energy.value = pulse + charge*.18;
    sky.uniforms.blast.value = scroll < .70
      ? smooth(scroll, .20, .55)
      : smooth(scroll, .79, 1);
    sky.uniforms.drift.value.set(pointerX + scroll*.24, pointerY);
    dust.uniforms.energy.value = charge*.9 + pulse;
    renderer.render(scene, camera);
    if (!host.classList.contains('ready')) {
      host.classList.add('ready');
      host.dispatchEvent(new Event('sceneready'));
    }
  }

  function sync() {
    previous = 0;
    setDrawing(render, active());
    if (!active()) setHeld(false);
    if (low() || contextLost) host.classList.remove('ready');
  }

  const resize = new ResizeObserver(([entry]) => {
    const {width, height} = entry.contentRect;
    if (!width || !height) return;
    renderer.setPixelRatio(Math.min(devicePixelRatio, compact.matches ? 1 : 1.5));
    renderer.setSize(width, height, false);
    camera.aspect = sky.uniforms.aspect.value = width / height;
    camera.updateProjectionMatrix();
  });
  resize.observe(canvas);
  const intersection = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    sync();
  });
  intersection.observe(host);
  canvas.addEventListener('pointermove', event => {
    if (!fine.matches) return;
    const bounds = canvas.getBoundingClientRect();
    pointerX = (event.clientX - bounds.left) / bounds.width * 2 - 1;
    pointerY = (event.clientY - bounds.top) / bounds.height * 2 - 1;
  }, {signal, passive: true});
  canvas.addEventListener('pointerleave', () => { pointerX = pointerY = 0; }, {signal});
  const holdTargets: HTMLElement[] = [button, canvas];
  for (const target of holdTargets) {
    target.addEventListener('pointerdown', (event: PointerEvent) => {
      if (!event.isPrimary || event.button !== 0) return;
      target.setPointerCapture(event.pointerId);
      setHeld(true);
    }, {signal});
    for (const name of ['pointerup', 'pointercancel', 'lostpointercapture', 'blur'] as const) {
      target.addEventListener(name, () => setHeld(false), {signal});
    }
  }
  for (const name of ['keydown', 'keyup'] as const) {
    button.addEventListener(name, event => {
      if (event.key !== ' ' && event.key !== 'Enter') return;
      event.preventDefault();
      setHeld(name === 'keydown');
    }, {signal});
  }
  window.addEventListener('blur', () => setHeld(false), {signal});
  document.addEventListener('visibilitychange', sync, {signal});
  window.addEventListener('motionchange', sync, {signal});
  canvas.addEventListener('webglcontextlost', event => {
    event.preventDefault();
    contextLost = true;
    sync();
  }, {signal});
  canvas.addEventListener('webglcontextrestored', () => {
    environment.dispose();
    environment = makeEnvironment();
    scene.environment = environment.texture;
    contextLost = false;
    sync();
  }, {signal});
  window.addEventListener('pagehide', event => {
    if (!event.persisted) return destroy();
    suspended = true;
    sync();
  }, {signal});
  window.addEventListener('pageshow', () => {
    suspended = false;
    sync();
  }, {signal});

  function destroy() {
    suspended = true;
    sync();
    events.abort();
    resize.disconnect();
    intersection.disconnect();
    dispose();
    environment.dispose();
    key.shadow.dispose();
    trailMaterial.dispose();
    trails.dispose();
    sky.dispose();
    dust.dispose();
    renderer.dispose();
    host.classList.remove('ready');
  }

  sync();
  return destroy;
}

export function createStoneScene(host: HTMLElement) {
  const canvas = host.querySelector<HTMLCanvasElement>('canvas')!;
  const renderer = new THREE.WebGLRenderer({canvas, alpha: true, powerPreference: 'low-power'});
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, .1, 30);
  const sky = createAtmosphere('storm');
  const dust = createDust('storm', true);
  scene.add(sky.mesh, dust.points);
  const geometry = new THREE.BoxGeometry(2, 1.85, 1.7, 42, 42, 42);
  const positions = geometry.getAttribute('position');
  const point = new THREE.Vector3();
  function noise(x: number, y: number, z: number) {
    const ix = Math.floor(x), iy = Math.floor(y), iz = Math.floor(z);
    const smooth = (t: number) => t * t * (3 - 2 * t);
    const u = smooth(x - ix), v = smooth(y - iy), w = smooth(z - iz);
    const lerp = THREE.MathUtils.lerp;
    function cell(dx: number, dy: number, dz: number) {
      const seed = Math.sin((ix + dx) * 127.1 + (iy + dy) * 311.7 + (iz + dz) * 74.7) * 43758.5453;
      return seed - Math.floor(seed);
    }
    return lerp(
      lerp(lerp(cell(0,0,0), cell(1,0,0), u), lerp(cell(0,1,0), cell(1,1,0), u), v),
      lerp(lerp(cell(0,0,1), cell(1,0,1), u), lerp(cell(0,1,1), cell(1,1,1), u), v), w) - .5;
  }
  const colors = [];
  const direction = new THREE.Vector3();
  for (let i = 0; i < positions.count; i++) {
    point.fromBufferAttribute(positions, i);
    const {x,y,z} = point;
    const coarse = noise(x * 4.3,y * 4.3,z * 4.3);
    const grit = noise(x * 16.5,y * 16.5,z * 16.5);
    const micro = noise(x * 43,y * 43,z * 43);
    const rough = .18 * coarse + .106 * grit + .035 * micro;
    direction.copy(point).normalize();
    point.multiplyScalar(.68).addScaledVector(direction, .44 + rough);
    positions.setXYZ(i, point.x, point.y, point.z);
    const shade = .25 + coarse * .16 + grit * .10 + micro * .09;
    colors.push(shade * .95, shade * .96, shade);
  }
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geometry.computeVertexNormals();
  const material = new THREE.MeshStandardMaterial({vertexColors: true, roughness: .95, metalness: .04});
  const stone = new THREE.Mesh(geometry, material);
  scene.add(stone, new THREE.HemisphereLight(0xcad4dc, 0x202329, 1.1));
  const key = new THREE.DirectionalLight(0xfff5e8, 3.2);
  key.position.set(-2, 4, 3);
  const fill = new THREE.DirectionalLight(0x939fae, 1.6);
  fill.position.set(3, 0, -3);
  const lightning = new THREE.DirectionalLight(0xa9ceff, 0);
  lightning.position.set(1, 3, -2);
  renderer.shadowMap.enabled = matchMedia('(min-width: 768px)').matches;
  lightning.castShadow = renderer.shadowMap.enabled;
  lightning.shadow.mapSize.set(512,512);
  lightning.shadow.normalBias = .025;
  lightning.shadow.autoUpdate = false;
  stone.castShadow = stone.receiveShadow = true;
  scene.add(key, fill, lightning);
  const events = new AbortController();
  const {signal} = events;
  let previous = 0, elapsed = 0;
  let visible = false;
  let paused = false;
  let lost = false;
  const resize = new ResizeObserver(([entry]) => {
    const {width,height} = entry.contentRect;
    if (!width || !height) return;
    renderer.setPixelRatio(Math.min(devicePixelRatio, width < 800 ? 1 : 1.35));
    renderer.setSize(width,height,false);
    camera.aspect = sky.uniforms.aspect.value = width / height;
    camera.updateProjectionMatrix();
  });
  resize.observe(canvas);
  function sync() {
    previous = 0;
    const active = visible && !paused && !lost && !document.hidden &&
      !document.documentElement.classList.contains('low-motion');
    setDrawing(draw, active);
    if (lost || !active) canvas.classList.remove('storm-ready');
  }
  function draw(now: number) {
    elapsed += previous ? Math.min((now - previous) / 1000, .05) : 0;
    previous = now;
    const progress = Number(host.style.getPropertyValue('--scene-progress'));
    const entrance = THREE.MathUtils.smoothstep(progress, .08, .46);
    const strike = elapsed % 10.5 - 3.8;
    const flash = strike < 0 ? 0 : Math.exp(-strike * 13) * .68 +
      .31 * Math.exp(-Math.pow((strike - .16) * 25, 2)) + .11 * Math.exp(-strike * 2.7);
    lightning.intensity = flash * 7.5;
    lightning.shadow.needsUpdate = flash > .075;
    fill.intensity = 1.6 + flash * 1.6;
    sky.uniforms.time.value = dust.uniforms.time.value = elapsed;
    sky.uniforms.energy.value = dust.uniforms.energy.value = flash;
    const stormBlast = THREE.MathUtils.smoothstep(progress, .17, .55);
    sky.uniforms.blast.value = stormBlast > 0 && stormBlast < 1
      ? stormBlast
      : THREE.MathUtils.clamp(strike / .94, 0, 1);
    stone.rotation.set(.63 - entrance * .45 + Math.sin(elapsed*.48)*.034,
      -.72 + entrance * .83 + Math.sin(elapsed*.33)*.075, -.29 + entrance * .25);
    stone.position.set(.26 * (1 - entrance), 1.85 * (1 - entrance) + Math.sin(elapsed*.79)*.067, 0);
    stone.scale.setScalar(.53 + entrance * .47);
    camera.position.z = (6.8 - .61 * entrance) / Math.min(1, camera.aspect);
    renderer.render(scene, camera);
    canvas.classList.add('storm-ready');
  }
  const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); });
  observer.observe(host);
  window.addEventListener('motionchange', sync, {signal});
  document.addEventListener('visibilitychange', sync, {signal});
  canvas.addEventListener('webglcontextlost', event => { event.preventDefault(); lost = true; sync(); }, {signal});
  canvas.addEventListener('webglcontextrestored', () => { lost = false; sync(); }, {signal});
  window.addEventListener('pagehide', event => {
    paused = true;
    sync();
    if (event.persisted) return;
    observer.disconnect();
    resize.disconnect();
    geometry.dispose();
    material.dispose();
    lightning.shadow.dispose();
    sky.dispose();
    dust.dispose();
    renderer.dispose();
    events.abort();
  }, {signal});
  window.addEventListener('pageshow', () => { paused = false; sync(); }, {signal});
}

