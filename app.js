const SUPABASE_URL = 'https://upnfkakdcxminzeckiga.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_9e7m2npM4XnvnbmZqmj90w_p19Zpd0j';

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

let businesses = [];

function card(b) {
  const img = b.image_url ||
    'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=800&q=80';

  const phone = (b.whatsapp || b.phone || '').replace(/\D/g, '');

  return `
    <article class="card">
      <img src="${img}" alt="${b.name || 'Negocio'}">
      <div class="body">
        ${b.is_featured ? '<span class="tag">DESTACADO</span>' : ''}
        <h3>${b.name || 'Sin nombre'}</h3>
        <small>${b.category || 'Negocio'} · ${b.city || 'Esmeraldas'}</small>

        <div class="stars">
          ${b.rating || '★★★★★'}
          <span style="color:#777">(${b.reviews || 0})</span>

          ${
            phone
              ? `<a class="wa" href="https://wa.me/${phone}" target="_blank" rel="noopener">☏</a>`
              : ''
          }
        </div>
      </div>
    </article>
  `;
}

function render(list = businesses) {
  const container = document.getElementById('cards');

  if (!container) return;

  if (!list.length) {
    container.innerHTML =
      '<div class="empty">No encontramos negocios. Prueba otra búsqueda.</div>';
    return;
  }

  container.innerHTML = list.map(card).join('');
}

async function loadBusinesses() {
  const { data, error } = await supabaseClient
    .from('businesses')
    .select('*')
    .order('is_featured', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error cargando negocios:', error);
    businesses = [];
    render();
    return;
  }

  businesses = data || [];
  render();
}

function filterBusinesses() {
  const input = document.getElementById('search');

  if (!input) return;

  const q = input.value.trim().toLowerCase();

  if (!q) {
    render();
    return;
  }

  const results = businesses.filter(b => {
    const text = [
      b.name,
      b.category,
      b.description,
      b.city,
      b.address
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    return text.includes(q);
  });

  render(results);
}

function setSearch(q) {
  const input = document.getElementById('search');

  if (!input) return;

  input.value = q;
  filterBusinesses();

  const section = document.getElementById('negocios');

  if (section) {
    section.scrollIntoView({
      behavior: 'smooth'
    });
  }
}

function openModal() {
  const modal = document.getElementById('modal');

  if (modal) {
    modal.style.display = 'flex';
  }
}

function closeModal() {
  const modal = document.getElementById('modal');

  if (modal) {
    modal.style.display = 'none';
  }
}

async function saveBusiness() {
  const name = document.getElementById('bizName')?.value.trim();
  const category = document.getElementById('bizCat')?.value.trim();
  const phone = document.getElementById('bizPhone')?.value.trim();
  const city = document.getElementById('bizCity')?.value.trim();

  const message = document.getElementById('saved');

  if (!message) return;

  if (!name) {
    message.textContent = 'Escribe el nombre del negocio.';
    return;
  }

  const payload = {
    name: name,
    category: category || 'Negocio',
    whatsapp: phone || null,
    city: city || 'Esmeraldas'
  };

  const { error } = await supabaseClient
    .from('businesses')
    .insert(payload);

  if (error) {
    console.error('Error guardando negocio:', error);
    message.textContent =
      'No se pudo guardar el negocio. Intenta nuevamente.';
    return;
  }

  message.textContent =
    '¡Negocio registrado correctamente!';

  document.getElementById('bizName').value = '';
  document.getElementById('bizCat').value = '';
  document.getElementById('bizPhone').value = '';
  document.getElementById('bizCity').value = '';

  await loadBusinesses();
}

window.addEventListener('DOMContentLoaded', () => {
  loadBusinesses();

  const search = document.getElementById('search');

  if (search) {
    search.addEventListener('input', filterBusinesses);
  }
});
