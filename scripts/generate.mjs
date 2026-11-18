import {writeFileSync,mkdirSync} from 'node:fs';
import {site,projects,services} from '../src/data/site.mjs';
mkdirSync('public/assets',{recursive:true});
const sculpture = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800">
<defs><linearGradient id="metal" x2="1" y2=".75"><stop stop-color="#242c36"/><stop offset=".52" stop-color="#11161e"/><stop offset="1" stop-color="#090c10"/></linearGradient></defs>
<g fill="url(#metal)" stroke="#454d59" stroke-width="2" stroke-linejoin="round" transform="translate(72 57)">
<path d="M90 520 270 152l75 22-161 341-78 66Z"/><path d="m195 553 325-37 78 53-335 53Z"/><path d="m390 155 182 257-53 84-190-266Z"/>
</g></svg>`;
writeFileSync('public/assets/sculpture.svg',sculpture);
for(const p of projects){const shapes=p.kind==='aether'?`<g transform="translate(600 385) rotate(-22)"><path d="M-150 80v-140a150 150 0 01300 0V80" fill="none" stroke="#20332f" stroke-width="53"/><rect x="-195" y="5" width="88" height="174" rx="42" fill="#273d37"/><rect x="107" y="5" width="88" height="174" rx="42" fill="#273d37"/><path d="M-145 -65a145 145 0 01290 0" fill="none" stroke="#7c9b90" stroke-width="8"/></g>`:p.kind==='still'?`<ellipse cx="600" cy="650" rx="230" ry="28" fill="#5f372e" opacity=".16"/><path d="M460 620l38-285h204l38 285Z" fill="#703d2d"/><ellipse cx="600" cy="335" rx="102" ry="36" fill="#a56748"/><path d="M530 335l20-170h100l20 170Z" fill="#a16a4d"/><ellipse cx="600" cy="165" rx="50" ry="18" fill="#3d2923"/>`:`<g transform="translate(600 390)" fill="none" stroke="#302f73" stroke-width="32">${[0,45,90,135].map(r=>`<ellipse rx="240" ry="80" transform="rotate(${r})"/>`).join('')}</g>`;writeFileSync(`public/assets/${p.slug}.svg`,`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 850"><rect width="1200" height="850" fill="${p.color}"/><text x="55" y="78" font-family="Arial,sans-serif" font-size="29" letter-spacing="-1" fill="#222b29">${p.name.toUpperCase()}</text>${shapes}<text x="55" y="800" font-family="Arial,sans-serif" font-size="13" letter-spacing="3" fill="#222b29">FORM — CONCEPT STUDY / ${p.year}</text></svg>`)}
const destinations = ['Work', 'Services', 'About', 'Contact'];
const rollingText = text => {
  const characters = [...text].map((char, index) =>
    `<span style="--char:${index}">${char === ' ' ? '&nbsp;' : char}</span>`).join('');
  return `<span class="rolling-text"><span>${text}</span><span aria-hidden="true">${characters}</span><span aria-hidden="true">${characters}</span></span>`;
};
const nav = (active = '') => `<a class="skip" href="#main">Skip to content</a>
<header class="site-header" id="nav">
  <a class="wordmark" href="index.html" aria-label="Form studio home">form<span>®</span></a>
  <div class="header-actions"><a class="header-contact" href="contact.html">${rollingText('Let’s talk')}</a>
  <button type="button" class="menu-toggle" aria-haspopup="dialog" aria-expanded="false" aria-controls="mobile-menu">${rollingText('Menu')}<span class="menu-icon" aria-hidden="true"></span></button></div>
  <noscript><nav class="fallback-nav" aria-label="Site navigation">${destinations.map(name => `<a href="${name.toLowerCase()}.html">${name}</a>`).join('')}</nav></noscript>
  <dialog id="mobile-menu" aria-label="Site menu">
    <div class="menu-top"><button type="button" class="menu-close">${rollingText('Close')} <span class="menu-icon" aria-hidden="true"></span></button></div>
    <nav aria-label="Site navigation">${destinations.map(name => `<a${active === name ? ' aria-current="page"' : ''} href="${name.toLowerCase()}.html">${rollingText(name)}</a>`).join('')}</nav>
    <a class="menu-story" href="about.html">✦ The FORM story</a>
    <div class="menu-contact"><p class="eyebrow">Business enquiry</p><a href="mailto:${site.email}">${site.email}</a></div>
  </dialog>
</header>`;
const footer=()=>`<footer id="site-footer">
  <div class="footer-content"><div><p class="eyebrow">GOOD THINGS BEGIN WITH A CONVERSATION</p>
  <a class="big-link" href="contact.html">Let’s make<br>something matter.<span aria-hidden="true">↗</span></a></div>
  <div class="footer-enquiry"><a class="footer-action" href="contact.html">${rollingText('Discuss your project')} ↗</a><p class="eyebrow">Business enquiry</p>
  <a href="mailto:${site.email}">${site.email}</a></div></div>
  <div class="footer-outline" aria-hidden="true">FORM</div>
  <div class="footer-bottom"><span>© ${new Date().getFullYear()} Form Studio — concept website</span><button class="motion-toggle" aria-pressed="false">Reduce motion</button><a href="#top">Back to top ↑</a></div>
</footer>`;
const loader = `<div class="intro-loader" hidden aria-label="Studio introduction">
 <div class="loader-belts" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
 <div class="loader-center"><div class="loader-mark" aria-hidden="true"><svg viewBox="0 0 96 96" width="96" height="96"><path d="M25 75V23h51M25 47h36M38 75V35h38M38 58h23" fill="none" stroke="currentColor" stroke-width="3"/></svg><i>+</i><i>+</i><i>+</i><i>+</i></div>
 <p class="eyebrow">Independent creative studio</p><div class="loader-counter" aria-hidden="true">${Array.from({length:3},()=>`<span><span>${Array.from({length:10},(_,i)=>`<b>${i}</b>`).join('')}</span></span>`).join('')}</div><button type="button">Skip intro ↗</button></div>
</div>`;
const cards=(all=true)=>`<div class="projects">${projects.slice(0,all?3:2).map((p,i)=>`<article class="project reveal"><a href="project-${p.slug}.html" aria-label="View ${p.name} project"><div class="project-image"><img src="/assets/${p.slug}.svg" width="1200" height="850" alt="${p.name} original concept artwork" loading="lazy"><span class="project-open" aria-hidden="true"><span class="project-label">View project</span>↗</span></div><div class="project-info"><h3>${p.name}</h3><span>${p.type}</span><small>0${i+1} / ${p.year}</small></div></a></article>`).join('')}</div>`;
const serviceList=()=>`<div class="service-list">${services.map((s,i)=>`<details class="reveal"><summary><small>0${i+1}</small><h3>${s.name}</h3><span>＋</span></summary><div><p>${s.text}</p><span class="eyebrow">${s.items}</span></div></details>`).join('')}</div>`;
const intro=()=>`<section class="intro section home-about" id="studio-intro"><div class="section-label">01 / A DIFFERENT PERSPECTIVE</div><div><h2 class="reveal">Small by choice.<br><span class="muted">Ambitious by nature.</span></h2><p class="body-copy">We are an independent creative studio bringing strategy, design, and technology together. For people ready to move things forward.</p><a class="pill" href="about.html">Meet the studio <span>↗</span></a></div></section>`;
const vision = `<section class="vision" id="vision-section">
 <p class="vision-note eyebrow">Independent thinking.<br>Extraordinary possibilities.</p>
 <div class="marquee" aria-hidden="true">${Array.from({length:2},()=>`<div>${Array.from({length:3},()=>'<span>Clarity.</span><span>Character.</span><span>Connection.</span>').join('')}</div>`).join('')}</div>
 <div class="vision-stripes" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div>
</section>`;
const facts = `<section class="key-facts section" id="keyfacts-section" data-surface="light">
 <div><p class="eyebrow">THE STUDIO</p><h2>Key facts</h2></div>
 <div class="facts"><div><strong data-value="4">04</strong><span>Connected disciplines</span></div><div><strong data-value="1">01</strong><span>Shared creative vision</span></div><div><strong>∞</strong><span>Possible perspectives</span></div></div>
</section>`;
const serviceStage = `<section id="trionn-services" class="service-stage">
  <div class="service-screen"><p class="eyebrow">OUR SERVICES</p>
  <canvas aria-hidden="true" class="stone-canvas"></canvas>
  <h2>${services.map(service=>`<span>${service.name}</span>`).join('')}</h2>
  <div class="service-caption">${services.map(service=>`<p><strong>${service.name}</strong><br>${service.text}</p>`).join('')}</div>
  <a class="pill" href="services.html">View services ↗</a></div>
</section>`;
const gallery = `<section class="exploration" data-surface="light"><div class="exploration-stage">
  <h2><span>Design in</span><span>motion.</span></h2>
  <div class="exploration-panels">${projects.map(p=>`<a href="project-${p.slug}.html" aria-label="View ${p.name} project"><img src="/assets/${p.slug}.svg" width="1200" height="850" alt="${p.name} concept study" loading="lazy"></a>`).join('')}</div>
  <a class="pill" href="work.html">Explore work ↗</a>
</div></section>`;
const home = `<section class="hero main-banner">
  <h1><span class="hero-line"><span>Beyond</span></span><span class="hero-line"><span>the ordinary.</span></span></h1>
  <div class="scene" aria-label="Angular graphite sculpture"><img src="/assets/sculpture.svg" alt="Three graphite beams arranged in an open form" width="800" height="800" fetchpriority="high"><canvas aria-hidden="true"></canvas><button type="button" class="sculpture-toggle" aria-describedby="blast-instructions">Hold to blast</button><span id="blast-instructions" class="visually-hidden">Scroll to separate and reassemble the sculpture. Hold the button, Space, or Enter to advance to the separated state.</span></div>
  <div class="hero-bottom"><a class="round-link" href="#studio-intro" aria-label="Explore the studio">↓</a><div class="hero-contact"><p>We shape bold identities and digital experiences for a world in motion.</p><a href="contact.html">Discuss your project ↗</a></div></div>
</section>
${intro()}
${vision}
${facts}
<section id="selected" class="section work-section" data-surface="light"><div class="section-heading"><div><p class="eyebrow">CONCEPT STUDIES</p><h2>Selected work<br>&amp; explorations.</h2></div><a class="pill" href="work.html">View all projects ↗</a></div><div class="work-viewport">${cards()}</div></section>
${serviceStage}
<section class="section perspective" data-surface="light"><p class="eyebrow">OUR POINT OF VIEW</p><blockquote>“The most interesting work happens when curiosity meets the courage to do things differently.”</blockquote><p>THE FORM APPROACH / STUDIO MANIFESTO</p></section>
${gallery}`;
const pageHero=(label,title,text)=>`<section class="page-hero"><p class="eyebrow">${label}</p><h1>${title}</h1><p class="body-copy">${text}</p></section>`;
const pages={'index.html':{title:'Independent creative studio',content:home},'work.html':{title:'Work',content:pageHero('SELECTED CONCEPTS / 2025—2026','A different<br><em>kind of impact.</em>','Original concept studies across identity, digital, and experience. A place to explore what could be.')+`<section class="section">${cards()}</section>`},'services.html':{title:'Services',content:pageHero('OUR CAPABILITIES','Built to<br><em>move you forward.</em>','A connected practice. From the questions that shape a brand to the details that make it memorable.')+`<section class="section">${serviceList()}</section><section class="section process"><p class="eyebrow">HOW WE WORK</p><h2>Listen. Challenge.<br><em>Create. Refine.</em></h2><p class="body-copy">We begin with a conversation, build a shared direction, and work in the open. Each step brings more clarity. Every detail earns its place.</p></section>`},'about.html':{title:'About',content:pageHero('INDEPENDENT BY DESIGN','Curious minds.<br><em>Shared ambition.</em>','Form is a concept for an independent creative practice, built on the belief that thoughtful design can make everyday experiences more meaningful.')+intro()+`<section class="section"><p class="eyebrow">WHAT GUIDES US</p><div class="values">${[['Stay curious','Ask better questions. Look beyond the obvious.'],['Make it matter','Put purpose before decoration. Give every decision a reason.'],['Build together','Share ideas early. Make space for different perspectives.']].map(([h,p])=>`<div><h3>${h}</h3><p>${p}</p></div>`).join('')}</div></section>`},'contact.html':{title:'Contact',content:pageHero('THE NEXT CHAPTER STARTS HERE','Hello,<br><em>possibility.</em>','Have a project in mind? Tell us a little about it. We would love to hear where you want to go.')+`<section class="section contact-layout"><div><p class="eyebrow">BUSINESS ENQUIRIES</p><a class="email" href="mailto:${site.email}">${site.email} ↗</a><p class="demo-note">Demo contact address. Replace in src/data/site.mjs before launch.</p></div><form id="enquiry" data-email="${site.email}"><label>Your name<input name="name" required autocomplete="name" maxlength="120"></label><label>Email address<input name="email" type="email" required autocomplete="email" maxlength="180"></label><label>What are you thinking?<textarea name="message" required rows="4" maxlength="4000"></textarea></label><button class="pill" type="submit">Prepare email ↗</button><p class="demo-note">Opens your email application with a draft. Nothing is sent by this website.</p><p id="form-status" role="status"></p></form></section>`}};
for(const p of projects)pages[`project-${p.slug}.html`]={title:p.name,content:pageHero(`CONCEPT STUDY / ${p.year}`,`${p.name}<br><em>A new perspective.</em>`,p.description)+`<section class="section project-detail"><img src="/assets/${p.slug}.svg" width="1200" height="850" alt="${p.name} concept artwork"><div class="intro"><p class="eyebrow">THE IDEA</p><div><h2>Distinct by design.</h2><p class="body-copy">${p.description}</p><p class="eyebrow">SCOPE / ${p.type}</p><p class="demo-note">Self-initiated illustrative project. No client relationship or commercial result is claimed.</p><a class="pill" href="work.html">All projects ↗</a> <a class="pill" href="project-${projects[(projects.indexOf(p)+1)%projects.length].slug}.html">Next project ↗</a></div></div></section>`};
for(const [file,p] of Object.entries(pages))writeFileSync(file,`<!doctype html><html lang="en" id="top"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="description" content="Form — independent creative studio exploring strategy, identity and digital experiences."><meta name="theme-color" content="#171917"><title>${p.title} — FORM Studio</title><link rel="icon" href="/assets/sculpture.svg" type="image/svg+xml"><link rel="stylesheet" href="/src/styles/main.css"><script type="module" src="/src/scripts/app.ts"></script><noscript><style>.menu-toggle{display:none!important}@media(max-width:767px){header{height:auto;min-height:100px;flex-wrap:wrap;padding-block:20px;gap:20px}header>nav{display:flex;flex-wrap:wrap;gap:20px;margin-left:0;width:100%}.menu-toggle{display:none}}</style></noscript></head><body>${nav(p.title)}<main id="main">${p.content}</main>${footer()}<div class="route-overlay" aria-hidden="true"><i></i><i></i><i></i><i></i></div>${loader}</body></html>`);
console.log(`Generated ${Object.keys(pages).length} static pages and original SVG artwork.`);

