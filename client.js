// Private Home destination. Uses Engine gallery reads and a dedicated synced storage record.
export const STORAGE_ID = 'ytr0E6h7vB7zDiiMA3eJO';
const COPY = {
  en: {title:'Sorr Gallery',subtitle:'Your saved moments, all in one place.',all:'All',favorites:'Favorites',refresh:'Refresh',loading:'Loading photos…',empty:'No photos yet.',noFavorites:'Tap a heart on a photo to save it here.',loadMore:'Show more',add:'Add to favorites',remove:'Remove from favorites',close:'Close photo',open:'Open photo',failed:'Photos could not be loaded. Please try again.',partial:'Some galleries could not be loaded. Refresh to try again.',saveFailed:'Could not save the heart. Please try again.',storageFailed:'Favorites are unavailable. Refresh to try again.',photo:'Photo',saved:'Saved',global:'Library',chat:'Chat',character:'Character',persona:'Persona',retry:'Retry',filter:'Filter by',allSources:'All photos',chatFilter:'Chat room',ownerFilter:'Choose',allOwners:'All',resetFilter:'Clear filters',noMatch:'No photos match these filters.',original:'Original',branch:'Branch',count:n=>`${n} photos`},
  ko: {title:'소르 갤러리',subtitle:'소중한 장면들을 한곳에 모아 보세요.',all:'전체',favorites:'즐겨찾기',refresh:'새로고침',loading:'사진을 불러오는 중…',empty:'아직 저장된 사진이 없어요.',noFavorites:'사진의 하트를 누르면 여기에 모여요.',loadMore:'더 보기',add:'즐겨찾기에 추가',remove:'즐겨찾기에서 해제',close:'사진 닫기',open:'사진 크게 보기',failed:'사진을 불러오지 못했어요. 다시 시도해 주세요.',partial:'일부 갤러리를 불러오지 못했어요. 새로고침해 주세요.',saveFailed:'하트를 저장하지 못했어요. 다시 눌러 주세요.',storageFailed:'즐겨찾기를 불러오지 못했어요. 새로고침해 주세요.',photo:'사진',saved:'저장됨',global:'라이브러리',chat:'채팅',character:'캐릭터',persona:'페르소나',retry:'다시 시도',filter:'분류',allSources:'모든 사진',chatFilter:'채팅방',ownerFilter:'선택',allOwners:'전체',resetFilter:'필터 초기화',noMatch:'이 조건에 맞는 사진이 없어요.',original:'원본',branch:'분기',count:n=>`사진 ${n}장`},
};
const ICON = {
  heart:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/></svg>',
  gallery:'<img class="sorr-portrait" alt="" src="/api/capability-packages/home-gallery/assets/sorr-portrait.png?v=1.1.1">',
  refresh:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 7v5h-5M4 17v-5h5M19 12a7 7 0 0 0-12-5L4 10m16 4-3 3A7 7 0 0 1 5 12"/></svg>',
};
export function photoKey(row) {
  // The same file can be referenced by a chat and an entity gallery.
  const path = String(row.filePath || '').replaceAll('\\','/').replace(/^\/+/, '');
  return 'favorite:' + (path || row.url);
}
export function mergePhotos(groups) {
  const map = new Map();
  for (const group of groups) for (const image of group.images) {
    if (!image.url?.startsWith('/api/') || !image.id) continue;
    const key = photoKey(image);
    const ownerId=String(group.source==='chat'&&image.chatId?image.chatId:group.ownerId||group.owner||'global');
    const membership={source:group.source,ownerId,owner:group.ownerNames?.[ownerId]||group.owner,url:image.url};
    if (!map.has(key)) map.set(key, {...image,key,source:group.source,owner:membership.owner,memberships:[]});
    const photo=map.get(key);
    if(!photo.memberships.some(m=>m.source===membership.source&&m.ownerId===ownerId))photo.memberships.push(membership);
  }
  return [...map.values()].sort((a,b)=>String(b.createdAt||'').localeCompare(String(a.createdAt||'')) || a.key.localeCompare(b.key));
}
export function filterPhotos(photos,source='all',ownerId='all') {
  return source==='all'?photos:photos.filter(photo=>photo.memberships.some(m=>m.source===source&&(ownerId==='all'||m.ownerId===ownerId)));
}
export function filterOwners(photos,source) {
  const owners=new Map();
  for(const photo of photos)for(const m of photo.memberships)if(m.source===source){
    const owner=owners.get(m.ownerId)||{id:m.ownerId,name:m.owner,count:0};owner.count++;owners.set(m.ownerId,owner);
  }
  return [...owners.values()].sort((a,b)=>a.name.localeCompare(b.name)||a.id.localeCompare(b.id));
}
export function chatDisplayName(chat,chats,labels) {
  const siblings=chat.groupId?chats.filter(c=>c.groupId===chat.groupId):[];
  if(siblings.length<2)return chat.name;
  const branchName=c=>{let m=c.metadata;if(typeof m==='string'){try{m=JSON.parse(m);}catch{m={};}}return typeof m?.branchName==='string'?m.branchName.trim():'';};
  const ordered=[...siblings].sort((a,b)=>String(a.createdAt||'').localeCompare(String(b.createdAt||''))||a.id.localeCompare(b.id));
  const name=branchName(chat);if(name&&name!=='New Branch')return chat.name+' · '+name;
  const peers=ordered.filter(c=>Boolean(branchName(c))===Boolean(name));
  return chat.name+' · '+(name?labels.branch:labels.original)+(name||peers.length>1?' '+(peers.findIndex(c=>c.id===chat.id)+1):'');
}
const CSS = `
.mark{overflow:hidden}.mark .sorr-portrait{display:block;width:100%;height:100%;object-fit:cover;object-position:50% 15%;border-radius:inherit}
:host{display:block;height:100%;min-height:0;color:var(--foreground,#29272d);font-family:var(--font-family,system-ui,sans-serif);font-size:14px}
*{box-sizing:border-box}button{font:inherit;cursor:pointer;color:inherit}button:disabled{cursor:wait;opacity:.5}button:focus-visible{outline:3px solid #d56991;outline-offset:3px}svg{width:20px;height:20px;fill:none;stroke:currentColor;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round}
.shell{height:100%;min-height:300px;overflow-y:auto;overscroll-behavior:contain;scrollbar-gutter:stable;background:var(--background,#faf8f8);padding:clamp(16px,3vw,36px);border-radius:0 0 14px 14px}.content{max-width:1280px;margin:0 auto}.heading{display:flex;align-items:center;gap:12px}.mark{display:grid;place-items:center;width:48px;height:48px;border-radius:16px;background:#f7dfe8;color:#ad4c6e;flex:none}.mark svg{width:25px;height:25px}h1{margin:0;font-size:clamp(22px,3vw,30px);letter-spacing:-.04em;line-height:1.25}.subtitle{margin:6px 0 0;color:var(--muted-foreground,#82767e);font-size:13px}.refresh{margin-left:auto;width:44px;height:44px;border:1px solid var(--border,#e8e0e3);border-radius:50%;display:grid;place-items:center;background:var(--card,#fff);flex:none}
.toolbar{display:flex;align-items:center;justify-content:space-between;gap:10px;margin:26px 0 20px;flex-wrap:wrap}.tabs{display:flex;padding:5px;border:1px solid var(--border,#e9e1e5);border-radius:999px;background:var(--card,#fff);gap:4px}.tab{border:0;border-radius:999px;min-height:44px;padding:0 18px;display:flex;align-items:center;gap:8px;background:transparent;color:var(--muted-foreground,#82767e);font-weight:600;font-size:13px}.tab[aria-selected=true]{background:#f5dce5;color:#8f3d5b}.tab svg{width:17px;height:17px}.badge{font-size:11px;opacity:.85}.count{font-size:12px;color:var(--muted-foreground,#82767e)}.notice{font-size:13px;color:#b34b64;margin:8px 0 18px;line-height:1.6}.notice:empty{display:none}.status{text-align:center;padding:70px 16px;line-height:1.8;color:var(--muted-foreground,#82767e)}.grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:20px}.card{position:relative;min-width:0}.photo{position:relative;display:block;padding:0;width:100%;border:1px solid var(--border,#e8e0e3);border-radius:18px;overflow:hidden;background:var(--muted,#efe9eb);aspect-ratio:4/5}.photo img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .25s}.photo:hover img{transform:scale(1.025)}.heart{position:absolute;top:10px;right:10px;width:44px;height:44px;border-radius:50%;border:1px solid #ffffff80;background:#ffffffec;color:#8b7882;display:grid;place-items:center;box-shadow:0 3px 12px #0002}.heart[aria-pressed=true]{background:#fff1f6;color:#c9567d}.heart[aria-pressed=true] svg{fill:currentColor}.label{margin:10px 2px 0;font-size:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--muted-foreground,#82767e)}.more{display:block;margin:28px auto 0;border:1px solid var(--border,#e9e1e5);background:var(--card,#fff);border-radius:999px;padding:11px 28px;min-height:44px;font-size:13px}
.filters{display:flex;align-items:end;gap:12px;flex-wrap:wrap;margin:-4px 0 20px}.filter-field{display:flex;flex-direction:column;gap:6px;min-width:0}.filter-field span{font-size:11px;color:var(--muted-foreground,#82767e)}.filter-field select{font:inherit;font-size:13px;color:inherit;background:var(--card,#fff);border:1px solid var(--border,#e9e1e5);border-radius:12px;padding:0 32px 0 12px;height:44px;min-width:160px;max-width:100%}.owner-field{flex:1;max-width:420px}.filter-field select:focus-visible{outline:3px solid #d56991;outline-offset:2px}.filter-reset{border:0;background:transparent;color:var(--muted-foreground,#82767e);font-size:12px;min-height:44px;padding:0 8px}.filters [hidden]{display:none}@media(max-width:600px){.filters{gap:10px}.filter-field{flex:1;min-width:120px}.owner-field{max-width:none}.filter-field select{min-width:0;width:100%;font-size:16px}.filter-reset{font-size:11px}}
dialog{max-width:96vw;max-height:94dvh;border:1px solid var(--border,#ddd);border-radius:18px;padding:12px;background:var(--card,#fff);color:var(--foreground,#29272d)}dialog::backdrop{background:#09070bd9}dialog .viewer-top{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:0 0 10px}dialog .viewer-top span{font-size:13px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}dialog .close{width:44px;height:44px;border:0;border-radius:50%;background:var(--muted,#f5edf0);font-size:24px;flex:none}dialog img{display:block;max-width:85vw;max-height:74dvh;object-fit:contain;margin:auto;border-radius:8px}.viewer-bottom{display:flex;justify-content:flex-end;padding-top:10px}.viewer-heart{position:static;border-color:#ead9e0;box-shadow:none}
@media(min-width:1500px){.grid{grid-template-columns:repeat(5,minmax(0,1fr))}}@media(max-width:900px){.grid{grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}}@media(max-width:600px){.grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:16px 12px}.shell{padding:18px 12px}.mark{width:40px;height:40px;border-radius:13px}.subtitle{font-size:12px}.heading{gap:10px}.toolbar{margin:22px 0 16px;gap:10px}.tab{padding:0 13px}.photo{border-radius:14px}.heart{top:6px;right:6px}.count{font-size:11px}.label{font-size:11px}.tabs{padding:3px}.tab{font-size:12px}.refresh{width:44px;height:44px}}@media(prefers-reduced-motion:reduce){.photo img{transition:none}}
`;
let photoCache = null;
let viewFilter={source:'all',ownerId:'all'};
export class GalleryHome extends HTMLElement {
  constructor(){super();this.attachShadow({mode:'open'});this.photos=[];this.favorites={};this.pending=new Set();this.mode='all';this.loaded=false;this.source=viewFilter.source;this.ownerId=viewFilter.ownerId;this.limit=60;this.loading=false;this.storageReady=false;}
  set capabilityProps(value){this.props=value;const lang=value?.localization?.locale?.startsWith('ko')?'ko':'en';if(this.lang!==lang){this.lang=lang;if(this.isConnected){this.build();this.render();}}}
  connectedCallback(){this.lang=this.lang||(document.documentElement.lang.startsWith('ko')?'ko':'en');this.build();this.load();this.onFocus=()=>this.syncFavorites();window.addEventListener('focus',this.onFocus);}
  disconnectedCallback(){this.abort?.abort();window.removeEventListener('focus',this.onFocus);this.shadowRoot.querySelector('dialog')?.close();}
  get t(){return COPY[this.lang];}
  get storagePath(){return '/api/personal-extensions/'+STORAGE_ID+'/storage';}
  async api(path,options={}){const r=await fetch(path,{credentials:'same-origin',cache:'no-store',signal:this.abort?.signal,...options,headers:{'Content-Type':'application/json','x-marinara-csrf':'1',...options.headers}});if(!r.ok)throw Error('HTTP '+r.status);return r.json();}
  build(){
    const s=this.shadowRoot;s.innerHTML='<style>'+CSS+'</style><section class="shell"><div class="content"><header class="heading"><div class="mark">'+ICON.gallery+'</div><div><h1></h1><p class="subtitle"></p></div><button type="button" class="refresh">'+ICON.refresh+'</button></header><div class="toolbar"><div class="tabs" role="tablist"><button type="button" class="tab" role="tab" id="all-tab" aria-controls="photo-panel" data-mode="all"><span></span><span class="badge"></span></button><button type="button" class="tab" role="tab" id="favorites-tab" aria-controls="photo-panel" data-mode="favorites">'+ICON.heart+'<span></span><span class="badge"></span></button></div><span class="count" role="status"></span></div><div class="filters"><label class="filter-field"><span class="source-caption"></span><select class="source-filter"></select></label><label class="filter-field owner-field" hidden><span class="owner-caption"></span><select class="owner-filter"></select></label><button type="button" class="filter-reset" hidden></button></div><p class="notice" role="alert"></p><section id="photo-panel" role="tabpanel"><div class="status" role="status"></div><div class="grid"></div><button type="button" class="more" hidden></button></section></div></section><dialog aria-modal="true"><div class="viewer-top"><span></span><button type="button" class="close">×</button></div><img alt=""><div class="viewer-bottom"></div></dialog>';
    s.querySelector('h1').textContent=this.t.title;s.querySelector('.subtitle').textContent=this.t.subtitle;
    s.querySelector('.refresh').title=this.t.refresh;s.querySelector('.refresh').setAttribute('aria-label',this.t.refresh);s.querySelector('.refresh').onclick=()=>this.load(true);
    s.querySelector('.tabs').setAttribute('aria-label',this.t.title);
    s.querySelector('.source-filter').onchange=e=>{this.source=e.target.value;this.ownerId='all';this.limit=60;viewFilter={source:this.source,ownerId:this.ownerId};this.render();};
    s.querySelector('.owner-filter').onchange=e=>{this.ownerId=e.target.value;this.limit=60;viewFilter={source:this.source,ownerId:this.ownerId};this.render();};
    s.querySelector('.filter-reset').onclick=()=>{this.source='all';this.ownerId='all';this.limit=60;viewFilter={source:'all',ownerId:'all'};this.render();};
    for(const tab of s.querySelectorAll('.tab')){tab.querySelector('span').textContent=this.t[tab.dataset.mode];tab.onclick=()=>{this.mode=tab.dataset.mode;this.limit=60;this.render();};tab.onkeydown=e=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();const next=e.key==='Home'?'all':e.key==='End'?'favorites':this.mode==='all'?'favorites':'all';s.querySelector('[data-mode="'+next+'"]').click();s.querySelector('[data-mode="'+next+'"]').focus();}};}
    s.querySelector('.more').textContent=this.t.loadMore;s.querySelector('.more').onclick=()=>{this.limit+=60;this.render();};
    const dialog=s.querySelector('dialog');dialog.setAttribute('aria-label',this.t.open);s.querySelector('.close').setAttribute('aria-label',this.t.close);s.querySelector('.close').onclick=()=>dialog.close();dialog.onclick=e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}};
  }
  async syncFavorites(){if(this.loading||this.pending.size||!this.isConnected)return;try{this.favorites=(await this.api(this.storagePath)).value??{};this.storageReady=true;this.message='';this.render();}catch{this.storageReady=false;this.message=this.t.storageFailed;this.render();}}
  async load(force=false){
    if(this.loading||this.pending.size)return;this.abort?.abort();this.abort=new AbortController();this.loading=true;this.message='';this.render();
    try{
      if(!force&&photoCache&&Date.now()-photoCache.at<300000){this.photos=photoCache.photos;this.loaded=true;try{this.favorites=(await this.api(this.storagePath)).value??{};this.storageReady=true;}catch{this.storageReady=false;this.message=this.t.storageFailed;}return;}
      const [global,chats,characters,personas,stored]=await Promise.allSettled([this.api('/api/global-gallery'),this.api('/api/chats'),this.api('/api/characters'),this.api('/api/characters/personas/list'),this.api(this.storagePath)]);
      if(!this.isConnected)return;
      this.storageReady=stored.status==='fulfilled';if(this.storageReady)this.favorites=stored.value.value??{};
      let failures=[global,chats,characters,personas].filter(r=>r.status==='rejected').length;
      const groups=global.status==='fulfilled'?[{images:global.value,source:'global',ownerId:'global',owner:this.t.global}]:[];
      const requests=[];
      const chatNames=chats.status==='fulfilled'?Object.fromEntries(chats.value.map(c=>[c.id,chatDisplayName(c,chats.value,this.t)])):{};
      for(const [result,source,prefix] of [[chats,'chat','/api/gallery/'],[characters,'character','/api/characters/'],[personas,'persona','/api/characters/personas/']])if(result.status==='fulfilled')for(const row of result.value){requests.push({path:prefix+encodeURIComponent(row.id)+(source==='chat'?'':'/gallery'),source,ownerId:row.id,ownerNames:source==='chat'?chatNames:undefined,owner:source==='chat'?chatNames[row.id]:row.name||row.data?.name||this.t[source]});}
      let next=0;await Promise.all(Array.from({length:4},async()=>{while(next<requests.length){const request=requests[next++];try{const images=await this.api(request.path);groups.push({...request,images});}catch(e){if(e.name==='AbortError')throw e;failures++;}}}));
      if(!this.isConnected)return;this.photos=mergePhotos(groups);this.loaded=true;if(!failures)photoCache={photos:this.photos,at:Date.now()};this.message=(!this.storageReady?this.t.storageFailed:failures?this.t.partial:'');
    }catch(e){if(e.name!=='AbortError')this.message=this.t.failed;}
    finally{this.loading=false;if(this.isConnected)this.render();}
  }
  heart(photo,extraClass=''){
    const b=document.createElement('button');b.type='button';b.className='heart '+extraClass;b.dataset.key=photo.key;b.innerHTML=ICON.heart;this.updateHeart(b,photo);b.onclick=()=>this.toggle(photo);return b;
  }
  updateHeart(button,photo){const saved=this.favorites[photo.key]===true;button.setAttribute('aria-pressed',String(saved));button.setAttribute('aria-label',this.t[saved?'remove':'add']);button.title=this.t[saved?'remove':'add'];button.disabled=!this.storageReady||this.pending.has(photo.key);}
  async toggle(photo){
    if(!this.storageReady||this.pending.has(photo.key))return;
    const desired=this.favorites[photo.key]!==true;const previous=this.writeQueue||Promise.resolve();let release;this.writeQueue=new Promise(resolve=>{release=resolve;});this.pending.add(photo.key);this.renderHearts();await previous;
    try{const result=await this.api(this.storagePath,{method:'PATCH',body:JSON.stringify({[photo.key]:desired})});if(result.value?.[photo.key]!==desired)throw Error('Favorite was not persisted');this.favorites={...this.favorites,[photo.key]:desired};this.message='';}
    catch{this.message=this.t.saveFailed;}
    finally{release();this.pending.delete(photo.key);if(this.isConnected){const focusKey=photo.key;this.render();this.renderHearts();const candidate=[...this.shadowRoot.querySelectorAll('.grid .heart')].find(b=>b.dataset.key===focusKey);if(!this.shadowRoot.querySelector('dialog').open)(candidate||this.shadowRoot.querySelector('[data-mode="'+this.mode+'"]')).focus({preventScroll:true});}}
  }
  renderHearts(){for(const b of this.shadowRoot.querySelectorAll('.heart')){const photo=this.photos.find(p=>p.key===b.dataset.key);if(photo)this.updateHeart(b,photo);}}
  openPhoto(photo){const d=this.shadowRoot.querySelector('dialog');d.querySelector('img').src=photo.url;d.querySelector('img').alt=this.t.photo;d.querySelector('.viewer-top span').textContent=photo.owner||this.t.photo;d.querySelector('.viewer-bottom').replaceChildren(this.heart(photo,'viewer-heart'));d.showModal();}
  render(){
    if(!this.shadowRoot.querySelector('.shell'))return;const s=this.shadowRoot;
    s.querySelector('h1').textContent=this.t.title;s.querySelector('.subtitle').textContent=this.t.subtitle;s.querySelector('.more').textContent=this.t.loadMore;
    for(const tab of s.querySelectorAll('.tab'))tab.querySelector('span').textContent=this.t[tab.dataset.mode];
    s.querySelector('.refresh').setAttribute('aria-label',this.t.refresh);s.querySelector('.refresh').title=this.t.refresh;s.querySelector('.close').setAttribute('aria-label',this.t.close);s.querySelector('dialog').setAttribute('aria-label',this.t.open);
    s.querySelector('.source-caption').textContent=this.t.filter;
    const sourceSelect=s.querySelector('.source-filter');sourceSelect.replaceChildren();
    for(const value of ['all','chat','global','character','persona']){const o=document.createElement('option');o.value=value;o.textContent=value==='all'?this.t.allSources:value==='chat'?this.t.chatFilter:this.t[value];sourceSelect.append(o);}sourceSelect.value=this.source;
    const showOwners=['chat','character','persona'].includes(this.source),ownerSelect=s.querySelector('.owner-filter');s.querySelector('.owner-field').hidden=!showOwners;
    s.querySelector('.owner-caption').textContent=this.source==='chat'?this.t.chatFilter:this.t[this.source]||this.t.ownerFilter;
    const owners=filterOwners(this.photos,this.source);if(this.loaded&&this.ownerId!=='all'&&!owners.some(o=>o.id===this.ownerId))this.ownerId='all';
    ownerSelect.replaceChildren();const all=document.createElement('option');all.value='all';all.textContent=this.t.allOwners;ownerSelect.append(all);
    const duplicates=new Map();for(const owner of owners)duplicates.set(owner.name,(duplicates.get(owner.name)||0)+1);
    for(const owner of owners){const o=document.createElement('option');o.value=owner.id;o.textContent=owner.name+(duplicates.get(owner.name)>1?' · '+owner.id.slice(0,5):'')+' ('+owner.count+')';ownerSelect.append(o);}ownerSelect.value=this.ownerId;
    const reset=s.querySelector('.filter-reset');reset.textContent=this.t.resetFilter;reset.hidden=this.source==='all';
    const filtered=filterPhotos(this.photos,this.source,this.ownerId),favorites=filtered.filter(p=>this.favorites[p.key]===true),visible=this.mode==='favorites'?favorites:filtered;
    for(const tab of s.querySelectorAll('.tab')){const active=tab.dataset.mode===this.mode;tab.setAttribute('aria-selected',String(active));tab.tabIndex=active?0:-1;tab.querySelector('.badge').textContent=tab.dataset.mode==='all'?filtered.length:favorites.length;}
    s.querySelector('#photo-panel').setAttribute('aria-labelledby',this.mode+'-tab');s.querySelector('#photo-panel').setAttribute('aria-busy',String(this.loading));
    s.querySelector('.refresh').disabled=this.loading||this.pending.size>0;s.querySelector('.count').textContent=this.loading?this.t.loading:this.t.count(visible.length);s.querySelector('.notice').textContent=this.message||'';
    const status=s.querySelector('.status');status.hidden=!this.loading&&visible.length>0;status.textContent=this.loading?this.t.loading:this.source!=='all'?this.t.noMatch:this.t[this.mode==='favorites'?'noFavorites':'empty'];
    const grid=s.querySelector('.grid');const fragment=document.createDocumentFragment();
    for(const original of visible.slice(0,this.limit)){
      const membership=original.memberships.find(m=>this.source==='all'||m.source===this.source&&(this.ownerId==='all'||m.ownerId===this.ownerId));
      const photo={...original,owner:membership?.owner||original.owner,url:membership?.url||original.url};
      const card=document.createElement('article');card.className='card';card.dataset.key=photo.key;
      const open=document.createElement('button');open.type='button';open.className='photo';open.setAttribute('aria-label',this.t.open+' · '+photo.owner);open.onclick=()=>this.openPhoto(photo);
      const img=document.createElement('img');img.src=photo.url.startsWith('/api/gallery/file/')?photo.url+(photo.url.includes('?')?'&':'?')+'w=480':photo.url;img.alt=this.t.photo;img.loading='lazy';img.decoding='async';open.append(img);
      const label=document.createElement('p');label.className='label';label.textContent=photo.owner||this.t[photo.source];label.title=label.textContent;
      card.append(open,this.heart(photo),label);fragment.append(card);
    }
    grid.replaceChildren(fragment);s.querySelector('.more').hidden=visible.length<=this.limit;this.renderHearts();
  }
}
if(!customElements.get('marinara-capability-home-gallery'))customElements.define('marinara-capability-home-gallery',GalleryHome);

// Frame the user's original portrait in CSS; keep the supplied PNG byte-for-byte unchanged.
if(typeof document!=='undefined'&&!document.getElementById('sorr-gallery-portrait-style')){
 const style=document.createElement('style');style.id='sorr-gallery-portrait-style';
 style.textContent='#marinara-home-tab-home-gallery img[src*="/home-gallery/assets/sorr-portrait.png"]{width:24px!important;height:24px!important;object-fit:cover!important;object-position:50% 15%!important;border-radius:8px;box-shadow:0 0 0 1px rgba(150,125,140,.16)}';
 document.head.append(style);
}
