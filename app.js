const SUPABASE_URL = 'https://upnfkakdcxminzeckiga.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_9e7m2npM4XnvnbmZqmj90w_p19Zpd0j';

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const demoBusinesses = [
{name:'ElectroRapid ES',category:'Servicio Eléctrico',image_url:'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=800&q=80',whatsapp:'593999000001',rating:'★★★★★',reviews:24,is_featured:true},
{name:'La Costa Restaurante',category:'Restaurante',image_url:'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',whatsapp:'593999000002',rating:'★★★★★',reviews:57,is_featured:true},
{name:'Mecánica Total ES',category:'Taller Mecánico',image_url:'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=800&q=80',whatsapp:'593999000003',rating:'★★★★★',reviews:31,is_featured:true},
{name:'Belleza & Estilo',category:'Salón de Belleza',image_url:'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80',whatsapp:'593999000004',rating:'★★★★☆',reviews:18,is_featured:true}
];

let businesses = [];

function card(b){
  const img=b.image_url || 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=800&q=80';
  const phone=(b.whatsapp||b.phone||'').replace(/\D/g,'');
  return `<article class="card"><img src="${img}" alt="${b.name}"><div class="body">${b.is_featured ? '<span class="tag">DESTACADO</span>':''}<h3>${b.name}</h3><small>${b.category||'Negocio'} · ${b.city||'Esmeraldas'}</small><div class="stars">${b.rating||'★★★★★'} <span style="color:#777">(${b.reviews||0})</span>${phone?`<a class="wa" href="https://wa.me/${phone}" target="_blank">☏</a>`:''}</div></div></article>`;
}

function render(list=businesses){
  const c=document.getElementById('cards');
  c.innerHTML=list.length?list.map(card).join(''):'<div class="empty">No encontramos resultados. Prueba otra búsqueda.</div>';
}

async function loadBusinesses(){
  if(SUPABASE_ANON_KEY === 'PEGA_AQUI_TU_ANON_KEY'){
    businesses = demoBusinesses;
    render();
    return;
  }
  const {data,error}=await supabaseClient.from('businesses').select('*').order('is_featured',{ascending:false}).order('created_at',{ascending:false});
  if(error){ console.error(error); businesses=demoBusinesses; render(); return; }
  businesses=data && data.length ? data : demoBusinesses;
  render();
}

function filterBusinesses(){const q=document.getElementById('search').value.toLowerCase();render(businesses.filter(b=>(b.name+' '+(b.category||'')+' '+(b.description||'')).toLowerCase().includes(q)))}
function setSearch(q){document.getElementById('search').value=q;filterBusinesses();document.getElementById('negocios').scrollIntoView({behavior:'smooth'})}
function openModal(){document.getElementById('modal').style.display='flex'}
function closeModal(){document.getElementById('modal').style.display='none'}

async function saveBusiness(){
  const n=document.getElementById('bizName').value.trim();
  const msg=document.getElementById('saved');
  if(!n){msg.textContent='Escribe el nombre del negocio.';return;}
  if(SUPABASE_ANON_KEY === 'PEGA_AQUI_TU_ANON_KEY'){
    msg.textContent='Primero conecta la ANON KEY de Supabase en app.js.';
    return;
  }
  const payload={
    name:n,
    category:document.getElementById('bizCat').value.trim()||'Negocio',
    whatsapp:document.getElementById('bizPhone').value.trim(),
    city:document.getElementById('bizCity').value.trim()||'Esmeraldas'
  };
  const {error}=await supabaseClient.from('businesses').insert(payload);
  if(error){msg.textContent='No se pudo guardar: '+error.message;return;}
  msg.textContent='¡Negocio registrado correctamente!';
  document.getElementById('bizName').value='';
  document.getElementById('bizCat').value='';
  document.getElementById('bizPhone').value='';
  await loadBusinesses();
}

window.addEventListener('DOMContentLoaded',loadBusinesses);
