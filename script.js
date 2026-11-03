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
const dialog=document.getElementById('image-dialog');let imageTrigger;
document.querySelectorAll('[data-open-image]').forEach(b=>b.addEventListener('click',()=>{if(!dialog)return;imageTrigger=b;dialog.showModal();document.body.classList.add('modal-open');}));
if(dialog){dialog.querySelector('.dialog-close').addEventListener('click',()=>dialog.close());dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});dialog.addEventListener('close',()=>{document.body.classList.remove('modal-open');imageTrigger?.focus();});}
const progress=document.querySelector('.reading-progress');let ticking=false;
function updateProgress(){const range=document.documentElement.scrollHeight-innerHeight;if(progress)progress.style.transform=`scaleX(${range>0?Math.min(1,Math.max(0,scrollY/range)):0})`;ticking=false;}
addEventListener('scroll',()=>{if(!ticking){requestAnimationFrame(updateProgress);ticking=true;}},{passive:true});addEventListener('resize',updateProgress);updateProgress();

const photoDialog=document.getElementById('photo-dialog');
const photos=[...document.querySelectorAll('[data-photo]')];
let photoIndex=0,photoOrigin,currentPhotos=[];
function showPhoto(index){
 if(!currentPhotos.length)return;
 photoIndex=(index+currentPhotos.length)%currentPhotos.length;
 const item=currentPhotos[photoIndex],img=photoDialog.querySelector('img');
 const label=item.closest('figure')?.querySelector(`figcaption [lang="${document.documentElement.lang}"]`)?.textContent;
 img.src=item.dataset.photo;img.alt=label||item.querySelector('img').alt;
 const caption=photoDialog.querySelector('.photo-caption');
 if(caption)caption.textContent=img.alt;
 document.getElementById('photo-position').textContent=`${photoIndex+1} / ${currentPhotos.length}`;
 photoDialog.querySelector('.photo-controls').hidden=currentPhotos.length<2;
 /* Keep the card on the enlarged slide, so closing returns focus to a visible button. */
 const gallery=item.closest('.research-gallery');
 if(gallery)selectSlide(gallery,photoIndex);
 photoOrigin=item;
}
if(photoDialog){
 photos.forEach(button=>button.addEventListener('click',()=>{
  photoOrigin=button;
  currentPhotos=photos.filter(p=>(p.dataset.gallery||'photography')===(button.dataset.gallery||'photography'));
  showPhoto(currentPhotos.indexOf(button));photoDialog.showModal();document.body.classList.add('modal-open');
 }));
 photoDialog.querySelector('.photo-close').addEventListener('click',()=>photoDialog.close());
 photoDialog.querySelector('.photo-prev').addEventListener('click',()=>showPhoto(photoIndex-1));
 photoDialog.querySelector('.photo-next').addEventListener('click',()=>showPhoto(photoIndex+1));
 photoDialog.addEventListener('keydown',e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();showPhoto(photoIndex+(e.key==='ArrowRight'?1:-1));}});
 photoDialog.addEventListener('close',()=>{document.body.classList.remove('modal-open');photoOrigin?.focus({preventScroll:true});});
 photoDialog.addEventListener('click',e=>{if(e.target===photoDialog){const r=photoDialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)photoDialog.close();}});
}

/* Each research card keeps one image slot; enlargement uses the same slides. */
function selectSlide(gallery,next){
 const slides=[...gallery.querySelectorAll('.research-figure')];
 const index=(next+slides.length)%slides.length;
 slides.forEach((slide,i)=>{slide.hidden=i!==index;});
 const count=gallery.querySelector('.research-position');
 if(count)count.textContent=`${index+1} / ${slides.length}`;
 return slides[index];
}
document.querySelectorAll('.research-gallery').forEach(gallery=>{
 const current=()=>[...gallery.querySelectorAll('.research-figure')].findIndex(slide=>!slide.hidden);
 /* Hidden slides never trigger lazy loading, which left a blank frame on the first click. */
 gallery.querySelectorAll('img').forEach(img=>{img.loading='eager';});
 gallery.querySelector('.research-prev')?.addEventListener('click',()=>selectSlide(gallery,current()-1));
 gallery.querySelector('.research-next')?.addEventListener('click',()=>selectSlide(gallery,current()+1));
 gallery.addEventListener('keydown',event=>{
  if(event.key==='ArrowLeft'||event.key==='ArrowRight'){
   event.preventDefault();
   const fromSlide=event.target.closest('.research-figure');
   const slide=selectSlide(gallery,current()+(event.key==='ArrowRight'?1:-1));
   if(fromSlide)slide.querySelector('button')?.focus({preventScroll:true});
  }
 });
 selectSlide(gallery,0);
});


/* A small green blot trails the mouse behind the text; touch screens never see it. */
if(matchMedia('(hover: hover) and (pointer: fine)').matches){
 const blot=document.createElement('div');blot.className='cursor-blot';blot.setAttribute('aria-hidden','true');document.body.append(blot);
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let x=0,y=0,targetX=0,targetY=0,scale=1,targetScale=1,frame=0;
 function moveBlot(){
  const ease=reduced.matches?1:.16,dx=targetX-x,dy=targetY-y;
  x+=dx*ease;y+=dy*ease;scale+=(targetScale-scale)*(reduced.matches?1:.14);
  const stretch=reduced.matches?0:Math.min(Math.hypot(dx,dy)/160,.4);
  blot.style.transform=`translate(${x}px,${y}px) rotate(${Math.atan2(dy,dx)}rad) scale(${scale*(1+stretch)},${scale*(1-stretch*.55)})`;
  frame=Math.abs(dx)+Math.abs(dy)+Math.abs(targetScale-scale)>.05?requestAnimationFrame(moveBlot):0;
 }
 addEventListener('pointermove',e=>{
  if(e.pointerType!=='mouse')return;
  if(!blot.classList.contains('visible')){x=e.clientX;y=e.clientY;blot.classList.add('visible');}
  targetX=e.clientX;targetY=e.clientY;targetScale=e.target.closest?.('a,button,summary')?1.5:1;
  if(!frame)frame=requestAnimationFrame(moveBlot);
 },{passive:true});
 document.documentElement.addEventListener('mouseleave',()=>blot.classList.remove('visible'));
}
