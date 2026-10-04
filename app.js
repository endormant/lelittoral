const S=window.SITE,$=s=>document.querySelector(s),app=$('#app');
let posts=[],site={banner:{on:false,text:'',link:''},about:''};
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const user=()=>JSON.parse(sessionStorage.u||'null');
const sha=async t=>[...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(t)))].map(b=>b.toString(16).padStart(2,'0')).join('');
const dt=d=>new Date(d).toLocaleDateString(undefined,{year:'numeric',month:'long',day:'numeric'});
const loc=d=>{const x=new Date(d);return new Date(x-x.getTimezoneOffset()*6e4).toISOString().slice(0,16)};
document.title=S.name;

// tiny markdown: # to ####, **bold**, *italic*, [link](url), ![img](url), - lists
function md(t){const inl=s=>esc(s).replace(/!\[([^\]]*)\]\(([^)]+)\)/g,'<img alt="$1" src="$2">').replace(/\[([^\]]+)\]\(([^)]+)\)/g,'<a href="$2" target="_blank" rel="noopener" style="color:var(--acc)">$1</a>').replace(/\*\*(.+?)\*\*/g,'<b>$1</b>').replace(/\*(.+?)\*/g,'<i>$1</i>');
 return (t||'').replace(/^(#{1,4} .*|-{3,})$/gm,'\n\n$1\n\n').split(/\n{2,}/).map(b=>{b=b.trim();let m;if(!b)return'';if(/^-{3,}$/.test(b))return'<hr>';
  if(m=b.match(/^(#{1,4}) (.*)/))return`<h${m[1].length}>${inl(m[2])}</h${m[1].length}>`;
  if(/^- /.test(b))return'<ul>'+b.split('\n').map(l=>`<li>${inl(l.replace(/^- /,''))}</li>`).join('')+'</ul>';
  return`<p>${inl(b).replace(/\n/g,'<br>')}</p>`}).join('')}

// GitHub API (publishing)
const api=p=>`https://api.github.com/repos/${S.repo.owner}/${S.repo.name}/contents/${p}`;
const H=()=>({Authorization:'Bearer '+localStorage.gh,Accept:'application/vnd.github+json'});
function token(){if(!localStorage.gh){const t=prompt('Paste your GitHub token (kept only in this browser):');if(!t)throw Error('A GitHub token is needed to publish');localStorage.gh=t.trim()}}
async function ghGet(p){const r=await fetch(api(p)+'?ref='+S.repo.branch+'&t='+Date.now(),{headers:H()});if(!r.ok)return null;const j=await r.json();return{sha:j.sha,text:new TextDecoder().decode(Uint8Array.from(atob(j.content.replace(/\n/g,'')),c=>c.charCodeAt(0)))}}
async function ghPut(p,b64,msg){token();const r0=await fetch(api(p)+'?ref='+S.repo.branch,{headers:H()});const sha=r0.ok?(await r0.json()).sha:undefined;
 const r=await fetch(api(p),{method:'PUT',headers:H(),body:JSON.stringify({message:msg,content:b64,branch:S.repo.branch,sha})});
 if(!r.ok){if(r.status==401)delete localStorage.gh;throw Error('GitHub: '+(await r.json()).message)}}
const b64=s=>btoa(unescape(encodeURIComponent(s)));
const saveData=()=>ghPut('data/posts.json',b64(JSON.stringify(posts,null,1)),'Update posts');
const saveSite=()=>ghPut('data/site.json',b64(JSON.stringify(site,null,1)),'Update site settings');
async function up(f){const d=await new Promise(r=>{const x=new FileReader();x.onload=()=>r(x.result.split(',')[1]);x.readAsDataURL(f)});const p='images/'+Date.now()+'-'+f.name.replace(/[^\w.]/g,'_');await ghPut(p,d,'Upload image');return p}
async function sync(){if(!localStorage.gh)return;for(const[k,p]of[['posts','data/posts.json'],['site','data/site.json']]){const g=await ghGet(p);if(g)k=='posts'?posts=JSON.parse(g.text):site=JSON.parse(g.text)}}

let RM;
const NU=[id=>`https://users.roproxy.com/v1/users/${id}`,id=>`https://corsproxy.io/?url=${encodeURIComponent('https://users.roblox.com/v1/users/'+id)}`,id=>`https://api.allorigins.win/raw?url=${encodeURIComponent('https://users.roblox.com/v1/users/'+id)}`];
const sig=()=>AbortSignal.timeout?AbortSignal.timeout(6000):undefined;
async function nameOf(id){for(const f of NU){try{const j=await(await fetch(f(id),{signal:sig()})).json();if(j.name)return j.name}catch{}}}
function rbxAll(){return RM??=(async()=>{const ids=[...new Set(S.accounts.map(x=>x.id))],m={};let c={};try{c=JSON.parse(localStorage.rn||'{}')}catch{}
 ids.forEach(i=>{if(c[i])m[i]={name:c[i]}});
 try{const u=await fetch('https://users.roproxy.com/v1/users',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({userIds:ids,excludeBannedUsers:false}),signal:sig()}).then(r=>r.json());u.data.forEach(x=>(m[x.id]??={}).name=x.name)}catch{}
 await Promise.all(ids.filter(i=>!m[i]?.name).map(async i=>{const n=await nameOf(i);if(n)(m[i]??={}).name=n}));
 try{localStorage.rn=JSON.stringify(Object.fromEntries(ids.filter(i=>m[i]?.name).map(i=>[i,m[i].name])))}catch{}
 try{const t=await fetch(`https://thumbnails.roproxy.com/v1/users/avatar-headshot?userIds=${ids.join(',')}&size=420x420&format=Png`,{signal:sig()}).then(r=>r.json());t.data.forEach(x=>(m[x.targetId]??={}).img=x.imageUrl)}catch{}return m})()}

const card=p=>`<a class=card href="#/post/${p.id}">${p.image?`<img src="${esc(p.image)}" alt="">`:''}<div class=cb><span class=cat>${esc(p.category)}</span><h3>${esc(p.title)}</h3>${p.summary?`<p>${esc(p.summary)}</p>`:''}<small>${dt(p.date)} by ${nm(p.author)}</small></div></a>`;
const sorted=()=>[...posts].sort((a,b)=>new Date(b.date)-new Date(a.date));

const isId=a=>/^\d+$/.test(String(a)),nm=a=>isId(a)?`<span data-u="${a}"></span>`:esc(a);
async function fill(){document.querySelectorAll('[data-a]').forEach(e=>{const id=e.dataset.a;let st=0;e.hidden=false;
  e.onerror=async()=>{const s=(await rbxAll())[id]?.img;if(st++==0&&s)e.src=s;else e.hidden=true};
  e.src=`https://www.roblox.com/headshot-thumbnail/image?userId=${id}&width=420&height=420&format=png`});
 const m=await rbxAll();document.querySelectorAll('[data-u]').forEach(e=>e.textContent=m[e.dataset.u]?.name||e.dataset.f||'User '+e.dataset.u)}
function moveInd(){const on=$('.links a.on'),i=$('.ind');if(!i)return;if(!on){i.style.opacity=0;return}
 if(!i.dataset.p){i.style.transition='none';i.dataset.p=1}
 i.style.opacity=1;i.style.width=on.offsetWidth+'px';i.style.transform=`translateX(${on.offsetLeft}px)`;
 if(i.style.transition=='none'){void i.offsetWidth;i.style.transition=''}on.scrollIntoView({inline:'center',block:'nearest',behavior:'smooth'})}
addEventListener('resize',moveInd);document.fonts?.ready.then(moveInd);

function shell(h,route){const u=user(),b=site.banner,sig=JSON.stringify([!!u,b]);
 if(!$('#main')||app.dataset.sig!=sig){app.dataset.sig=sig;
  const cats=S.categories.map(c=>`<a href="#/c/${encodeURIComponent(c)}" data-r="/c/${esc(c)}">${esc(c)}</a>`).join(''),brand=`<a class=brand href="#/"><img src="${esc(S.logo)}" alt=""><b>${esc(S.name)}</b></a>`;
  app.innerHTML=`${b.on&&b.text?`<div id=banner>${b.link?`<a href="${esc(b.link)}">${esc(b.text)}</a>`:esc(b.text)}</div>`:''}
 <nav class=pill>${brand}<div class=links><span class=ind></span><a href="#/" data-r="/">Home</a>${cats}<a href="#/about" data-r="/about">About</a></div>
 <div class=tools>${u?`<a href="#/admin">Dashboard</a><a href="#/logout">Log out</a>`:`<a href="#/login">Staff login</a>`}</div></nav>
 <main class=w id=main></main>
 <footer><div class=w><div class=fgrid><div>${brand}<p>${esc(S.footer)}</p></div><div><h4>Navigation</h4><a href="#/">Home</a>${S.categories.map(c=>`<a href="#/c/${encodeURIComponent(c)}">${esc(c)}</a>`).join('')}<a href="#/about">About</a></div>${S.discord?`<div><h4>Connect</h4><a href="${esc(S.discord)}">Discord</a></div>`:'<div></div>'}</div><p class=legal>&copy; ${new Date().getFullYear()} ${esc(S.name)}. ${esc(S.legal)}</p></div></footer>`;
  }
 const m=$('#main');m.innerHTML=h;m.classList.remove('in');void m.offsetWidth;m.classList.add('in');
 if(app.dataset.h!=location.hash){app.dataset.h=location.hash;scrollTo(0,0)}
 document.querySelectorAll('.links a').forEach(x=>x.classList.toggle('on',x.dataset.r==route));moveInd();fill()}

async function render(){
 const h=location.hash.slice(1)||'/',[,r,a]=h.split('/'),u=user();
 if(['admin','edit'].includes(r)){if(!u){location.hash='#/login';return}await sync().catch(()=>{})}
 if(r=='logout'){sessionStorage.removeItem('u');location.hash='#/';return}
 if(r=='hash'){shell(`<div class=box><label>Password to hash (SHA-256)</label><input id=hp><button onclick="sha($('#hp').value).then(x=>$('#ho').textContent=x)">Make hash</button><p id=ho style="word-break:break-all"></p></div>`);return}
 if(r=='login'){shell(`<form class=f id=lf><h2>Staff login</h2><label>Roblox username</label><input id=lu required><label>Password</label><input id=lp type=password required><button>Log in</button><p id=le style=color:#c00></p></form>`);
  $('#lf').onsubmit=async e=>{e.preventDefault();const n=$('#lu').value.trim(),p=$('#lp').value,h=await sha(p);
   const m=await rbxAll(),ac=S.accounts.find(x=>[m[x.id]?.name,x.username,String(x.id)].some(v=>String(v||'').toLowerCase()==n.toLowerCase())&&(x.passwordHash?x.passwordHash==h:x.password==p));
   if(!ac)return $('#le').textContent='Wrong username or password.';sessionStorage.u=JSON.stringify({id:String(ac.id),username:m[ac.id]?.name||ac.username,position:ac.position});location.hash='#/admin'};return}
 if(r=='c'){const c=decodeURIComponent(a),l=sorted().filter(p=>p.category==c);shell(`<h2>${esc(c)}</h2><div class=grid>${l.map(card).join('')||'<p>No stories in this category yet.</p>'}</div>`,'/c/'+c);return}
 if(r=='post'){const p=posts.find(x=>x.id==a);if(!p){shell('<p>Story not found.</p>');return}
  shell(`<article class=art><a class=back href="#/">&larr; Back to all articles</a><div class=meta><a class=cat href="#/c/${encodeURIComponent(p.category)}">${esc(p.category)}</a> &middot; ${dt(p.date)}</div><h1>${esc(p.title)}</h1>${p.summary?`<p class=sum>${esc(p.summary)}</p>`:''}<div class=by>${isId(p.author)?`<img data-a="${p.author}" alt="">`:''}<b>${nm(p.author)}</b>${u?`<a class="btn g" href="#/edit/${p.id}">Edit</a>`:''}</div>${p.image?`<img class=cover src="${esc(p.image)}" alt="">`:''}<hr><div class=body>${md(p.body)}</div></article>${S.discord?`<div class=cta><h3>Enjoyed this article?</h3><p>Join our Discord to discuss and connect with other readers.</p><a class=btn href="${esc(S.discord)}">Join Discord</a></div>`:''}`);
  return}
 if(r=='about'){const P=S.parent;
  shell(`<section class="sec mission"><div class=in>${md(site.about)}</div></section>
  <section class="sec center"><div class=in><h2>${esc(S.teamTitle||'Leadership')}</h2><p class=mut>${esc(S.teamSub||'The people behind the newsroom.')}</p></div><div class=staff>${S.accounts.map(x=>`<div><img data-a="${x.id}" alt=""><b data-u="${x.id}" data-f="${esc(x.username||'')}"></b><span class=pos>${esc(x.position)}</span><a target=_blank rel=noopener href="https://www.roblox.com/users/${x.id}/profile">Roblox Profile &#8599;</a></div>`).join('')}</div></section>
  ${P?`<section class="sec parent"><div class=in><h2>${esc(P.title)}</h2><p>${esc(P.text)}</p>${P.link?`<a class="btn g" target=_blank rel=noopener href="${esc(P.link)}">${esc(P.label||'Learn more')} &#8599;</a>`:''}</div></section>`:''}`,'/about');return}
 if(r=='admin'){const b=site.banner;
  shell(`<h2>Dashboard</h2><p>Signed in as ${esc(u.username)} (${esc(u.position)}).</p><a class=btn href="#/edit/new">New story</a>
  <div class=box style="margin:14px 0">${sorted().map(p=>`<div class=row><span><b>${esc(p.title)}</b>${p.featured?' (top story)':''}<br><small>${esc(p.category)}, ${dt(p.date)}</small></span><span><a class="btn" href="#/edit/${p.id}">Edit</a><button class=d data-del="${p.id}">Delete</button></span></div>`).join('')||'No stories yet.'}</div>
  <form class=f id=sf><h3>Site settings</h3><label><input type=checkbox id=bo ${b.on?'checked':''}> Show banner on every page</label><label>Banner text</label><input id=bt value="${esc(b.text)}"><label>Banner link (optional)</label><input id=bl value="${esc(b.link)}">
  <label>About page text</label><textarea id=ab style="min-height:140px">${esc(site.about)}</textarea><button>Save settings</button></form>`);
  document.querySelectorAll('[data-del]').forEach(x=>x.onclick=async()=>{if(!confirm('Delete this story?'))return;try{posts=posts.filter(p=>p.id!=x.dataset.del);await saveData();render()}catch(e){alert(e.message)}});
  $('#sf').onsubmit=async e=>{e.preventDefault();site={banner:{on:$('#bo').checked,text:$('#bt').value,link:$('#bl').value},about:$('#ab').value};try{await saveSite();alert('Saved. The live site updates in about a minute.');render()}catch(e){alert(e.message)}};return}
 if(r=='edit'){const old=posts.find(x=>x.id==a)||{},p={category:S.categories[0],date:new Date().toISOString(),author:String(u.id),image:'',featured:false,body:'',title:'',...old};
  shell(`<form class=f id=pf><h2>${old.id?'Edit':'New'} story</h2><label>Title</label><input id=t value="${esc(p.title)}" required>
  <label>Summary (one line, optional)</label><input id=s value="${esc(p.summary||'')}"><label>Category</label><select id=c>${S.categories.map(c=>`<option ${c==p.category?'selected':''}>${esc(c)}</option>`).join('')}</select>
  <label>Date and time</label><input id=d type=datetime-local value="${loc(p.date)}" required><label>Author</label><select id=a>${[...new Set([...S.accounts.map(x=>String(x.id)),String(p.author)])].map(v=>`<option value="${esc(v)}" ${v==p.author?'selected':''} ${isId(v)?`data-u="${v}"`:''}>${isId(v)?'':esc(v)}</option>`).join('')}</select>
  <label>Cover image (URL or upload)</label><input id=i value="${esc(p.image)}"><input type=file id=cf accept="image/*">
  <label><input type=checkbox id=f ${p.featured?'checked':''}> Top story (large banner on Home)</label>
  <label>Story</label><div class=tb>${[['H1','# '],['H2','## '],['H3','### '],['H4','#### ']].map(([l,s])=>`<button type=button class=g data-i="${s}">${l}</button>`).join('')}<button type=button class=g data-w="**">Bold</button><button type=button class=g data-w="*">Italic</button><button type=button class=g id=lk>Link</button><button type=button class=g id=im>Image</button><button type=button class=g id=sp>Separator</button><input type=file id=bf accept="image/*" hidden></div>
  <textarea id=body>${esc(p.body)}</textarea><div id=pv class=body></div><button>Publish</button><a class="btn g" href="#/admin">Cancel</a></form>`);
  const pv=()=>$('#pv').innerHTML=md($('#body').value),T=$('#body');
  const ins=(a,b='')=>{const s=T.selectionStart,e=T.selectionEnd;T.value=T.value.slice(0,s)+a+T.value.slice(s,e)+b+T.value.slice(e);T.focus();T.selectionStart=s+a.length;T.selectionEnd=e+a.length;pv()};
  T.oninput=pv;pv();$('#sp').onclick=()=>ins('\n\n---\n\n');
  document.querySelectorAll('[data-i]').forEach(x=>x.onclick=()=>ins('\n'+x.dataset.i));document.querySelectorAll('[data-w]').forEach(x=>x.onclick=()=>ins(x.dataset.w,x.dataset.w));
  $('#lk').onclick=()=>{const l=prompt('Link URL');if(l)ins('[',`](${l})`)};$('#im').onclick=()=>{const l=prompt('Image URL (leave blank to upload a file)');l?ins(`\n\n![](${l})\n\n`):$('#bf').click()};
  $('#bf').onchange=async e=>{try{ins(`\n\n![](${await up(e.target.files[0])})\n\n`)}catch(x){alert(x.message)}};
  $('#cf').onchange=async e=>{try{$('#i').value=await up(e.target.files[0])}catch(x){alert(x.message)}};
  $('#pf').onsubmit=async e=>{e.preventDefault();const n={id:old.id||Date.now().toString(36),title:$('#t').value,category:$('#c').value,date:new Date($('#d').value).toISOString(),author:$('#a').value,summary:$('#s').value,image:$('#i').value,featured:$('#f').checked,body:T.value};
   try{if(n.featured)posts.forEach(x=>x.featured=false);const i=posts.findIndex(x=>x.id==n.id);i<0?posts.push(n):posts[i]=n;await saveData();location.hash='#/post/'+n.id}catch(x){alert(x.message)}};return}
 // home
 const l=sorted(),top=l.find(p=>p.featured)||l[0],rest=l.filter(p=>p!=top);
 shell(`${top?`<a class=hero href="#/post/${top.id}" style="${top.image?`background-image:url('${esc(top.image)}')`:''}"><div><span class=tag>${esc(top.category)}</span><h2>${esc(top.title)}</h2><small style=color:#fff>${dt(top.date)} by ${nm(top.author)}</small></div></a>`:'<p>No stories yet.</p>'}<div class=grid>${rest.map(card).join('')}</div>`,'/');
}
(async()=>{shell('<div class=grid>'+'<div class="card sk"></div>'.repeat(6)+'</div>','');const g=u=>fetch(u+'?t='+Date.now()).then(r=>r.json());try{[posts,site]=await Promise.all([g('data/posts.json'),g('data/site.json')])}catch{}render();addEventListener('hashchange',render)})();
