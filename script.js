function setLanguage(language){
 const lang=language==='ko'?'ko':'en';document.documentElement.lang=lang;
 document.querySelectorAll('[data-language]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.language===lang)));
 try{localStorage.setItem('euna-language',lang)}catch{}
 const url=new URL(location.href);url.searchParams.set('lang',lang);history.replaceState(null,'',url);
 document.querySelectorAll('a[href]').forEach(a=>{const raw=a.getAttribute('href');if(raw.startsWith('#'))return;const target=new URL(raw,location.href);if(target.origin!==location.origin||!/(index|personal|projects)\.html$/.test(target.pathname))return;target.searchParams.set('lang',lang);a.href=target.pathname+target.search+target.hash;});
 document.querySelector('nav')?.setAttribute('aria-label',lang==='ko'?'주요 메뉴':'Main navigation');
}
let saved;try{saved=localStorage.getItem('euna-language')}catch{}
setLanguage(new URL(location.href).searchParams.get('lang')||saved||'en');
document.querySelectorAll('[data-language]').forEach(b=>b.addEventListener('click',()=>setLanguage(b.dataset.language)));
function filterPapers(category){let count=0;document.querySelectorAll('.publication').forEach(p=>{const show=category==='all'||p.dataset.category===category;p.hidden=!show;if(show)count++;});document.querySelectorAll('[data-filter]').forEach(b=>{const selected=b.dataset.filter===category;b.classList.toggle('active',selected);b.setAttribute('aria-pressed',String(selected));});const output=document.getElementById('pub-count');if(output)output.textContent=count;}
document.querySelectorAll('[data-filter]').forEach(b=>b.addEventListener('click',()=>filterPapers(b.dataset.filter)));
document.querySelectorAll('[data-shortcut]').forEach(b=>b.addEventListener('click',()=>{filterPapers(b.dataset.shortcut);document.getElementById('publications')?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});}));
const dialog=document.getElementById('image-dialog');let imageTrigger;
document.querySelectorAll('[data-open-image]').forEach(b=>b.addEventListener('click',()=>{if(!dialog)return;imageTrigger=b;dialog.showModal();document.body.classList.add('modal-open');}));
if(dialog){dialog.querySelector('.dialog-close').addEventListener('click',()=>dialog.close());dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});dialog.addEventListener('close',()=>{document.body.classList.remove('modal-open');imageTrigger?.focus();});}
const progress=document.querySelector('.reading-progress');let ticking=false;
function updateProgress(){const range=document.documentElement.scrollHeight-innerHeight;if(progress)progress.style.transform=`scaleX(${range>0?Math.min(1,Math.max(0,scrollY/range)):0})`;ticking=false;}
addEventListener('scroll',()=>{if(!ticking){requestAnimationFrame(updateProgress);ticking=true;}},{passive:true});addEventListener('resize',updateProgress);updateProgress();

const photoDialog=document.getElementById('photo-dialog');const photos=[...document.querySelectorAll('[data-photo]')];let photoIndex=0,photoOrigin;
function showPhoto(index){photoIndex=(index+photos.length)%photos.length;const item=photos[photoIndex];const img=photoDialog.querySelector('img');img.src=item.dataset.photo;img.alt=item.querySelector('img').alt;document.getElementById('photo-position').textContent=`${photoIndex+1} / ${photos.length}`;}
if(photoDialog){photos.forEach((button,index)=>button.addEventListener('click',()=>{photoOrigin=button;showPhoto(index);photoDialog.showModal();document.body.classList.add('modal-open')}));photoDialog.querySelector('.photo-close').addEventListener('click',()=>photoDialog.close());photoDialog.querySelector('.photo-prev').addEventListener('click',()=>showPhoto(photoIndex-1));photoDialog.querySelector('.photo-next').addEventListener('click',()=>showPhoto(photoIndex+1));photoDialog.addEventListener('keydown',e=>{if(e.key==='ArrowRight'){e.preventDefault();showPhoto(photoIndex+1)}if(e.key==='ArrowLeft'){e.preventDefault();showPhoto(photoIndex-1)}});photoDialog.addEventListener('close',()=>{document.body.classList.remove('modal-open');photoOrigin?.focus()});photoDialog.addEventListener('click',e=>{if(e.target===photoDialog){const r=photoDialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)photoDialog.close()}});}
