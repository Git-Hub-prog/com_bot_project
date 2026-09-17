(() => {
  const script = document.currentScript;
  const space = script?.dataset.space;
  const target = document.getElementById('testimonialhub-widget');
  if (!space || !target) return;

  const apiOrigin = new URL(script.src).origin;
  const theme = script.dataset.theme || 'light';
  const layout = script.dataset.layout || 'grid';
  const showRatings = script.dataset.showRatings !== 'false';
  const showAvatars = script.dataset.showAvatars !== 'false';
  const featuredOnly = script.dataset.featuredOnly === 'true';
  const count = Math.min(24, Math.max(1, Number(script.dataset.count || 6)));
  const escapeHtml = (value) => String(value || '').replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character]));
  const card = (item) => {
    const rating = Math.min(5, Math.max(0, Number(item.rating) || 0));
    return `<article class="testimonialhub-card"><div class="testimonialhub-stars" aria-label="${rating} out of 5 stars">${showRatings ? `${'★'.repeat(rating)}${'☆'.repeat(5 - rating)}` : ''}</div><p>${escapeHtml(item.review)}</p><footer>${showAvatars && item.avatar ? `<img src="${escapeHtml(item.avatar)}" alt="" width="36" height="36">` : ''}<span><strong>${escapeHtml(item.name)}</strong><small>${escapeHtml(item.role || '')}${item.company ? ` · ${escapeHtml(item.company)}` : ''}</small></span></footer></article>`;
  };
  const style = document.createElement('style');
  style.textContent = `.testimonialhub-widget{box-sizing:border-box;width:100%;font:14px/1.5 Arial,sans-serif;color:#263238}.testimonialhub-widget *{box-sizing:border-box}.testimonialhub-widget.testimonialhub-dark{color:#f4f7f2;background:#263238}.testimonialhub-widget.testimonialhub-auto{color:#263238}@media(prefers-color-scheme:dark){.testimonialhub-widget.testimonialhub-auto{color:#f4f7f2;background:#263238}}.testimonialhub-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}.testimonialhub-carousel{display:flex;gap:16px;overflow-x:auto;scroll-snap-type:x mandatory;padding-bottom:8px}.testimonialhub-carousel .testimonialhub-card{min-width:min(320px,82vw);scroll-snap-align:start}.testimonialhub-badge{display:inline-block}.testimonialhub-badge .testimonialhub-card{max-width:360px}.testimonialhub-card{border:1px solid #dfe7df;border-radius:10px;padding:18px;background:#fff;box-shadow:0 6px 18px rgba(38,50,56,.08)}.testimonialhub-dark .testimonialhub-card,.testimonialhub-auto .testimonialhub-card{background:#33434a;border-color:#53636a}.testimonialhub-stars{min-height:18px;color:#dcae38;letter-spacing:1px}.testimonialhub-card p{margin:12px 0 20px}.testimonialhub-card footer{display:flex;align-items:center;gap:9px}.testimonialhub-card footer img{border-radius:50%;object-fit:cover}.testimonialhub-card footer span{display:grid;gap:2px}.testimonialhub-card small{opacity:.7}@media(max-width:700px){.testimonialhub-grid{grid-template-columns:1fr}}`;
  document.head.appendChild(style);
  const render = (testimonials) => {
    const visible = testimonials.filter((item) => !featuredOnly || item.featured).slice(0, count);
    target.innerHTML = `<div class="testimonialhub-widget testimonialhub-${escapeHtml(theme)} testimonialhub-${escapeHtml(layout)}">${visible.map(card).join('')}</div>`;
  };

  fetch(`${apiOrigin}/api/public/spaces/${encodeURIComponent(space)}/testimonials/approved`)
    .then((response) => response.json())
    .then((data) => render(data.testimonials || []))
    .catch(() => { target.textContent = ''; });
})();
