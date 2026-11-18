import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync,existsSync} from 'node:fs';
const pages=readdirSync('.').filter(f=>f.endsWith('.html'));
test('all eight pages have accessible static structure and local destinations',()=>{
 assert.equal(pages.length,8);
 for(const file of pages){const html=readFileSync(file,'utf8');assert.match(html,/<main id="main">/);assert.equal((html.match(/<h1>/g)||[]).length,1);assert.match(html,/Skip to content/);
 for(const [,url] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {if(url.startsWith('#')||url.startsWith('mailto:'))continue; assert.ok(existsSync(url.replace(/^\//,''))||existsSync('public/'+url.replace(/^\//,'')),`${file}: missing ${url}`);}}
});
test('hero has static fallback and form honestly describes email behavior',()=>{assert.match(readFileSync('index.html','utf8'),/sculpture.svg/);assert.match(readFileSync('contact.html','utf8'),/Nothing is sent by this website/);});
