/*
 * DRINK STOP content loader.
 *
 * Storage abstraction: everything reads/writes through loadContent()/saveContent().
 * Right now these use localStorage + admin-content.json as the shipped fallback.
 * TODO(supabase): once Supabase is wired up, replace the bodies of loadContent()
 * and saveContent() with Supabase queries — nothing else in this file, the admin
 * panel, or the pages using data-ck attributes needs to change.
 */
(function () {
  const STORAGE_KEY = 'drinkstop_content_v1';

  async function loadContent() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fall through to defaults */ }
    }
    try {
      const base = window.CONTENT_JSON_PATH || 'admin-content.json';
      const res = await fetch(base);
      if (res.ok) return await res.json();
    } catch (e) { /* offline or missing file — use null, pages keep static defaults */ }
    return null;
  }

  function saveContent(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  function resetContent() {
    localStorage.removeItem(STORAGE_KEY);
  }

  function setField(root, key, value) {
    root.querySelectorAll(`[data-ck="${key}"]`).forEach(el => {
      if (el.tagName === 'IMG' || el.tagName === 'SOURCE') el.src = value;
      else if (el.tagName === 'VIDEO') el.src = value;
      else el.innerHTML = value;
    });
  }

  function cloneTemplateCard(templateEl, id) {
    const clone = templateEl.cloneNode(true);
    clone.id = id;
    clone.querySelectorAll('[data-ck]').forEach(el => {
      el.setAttribute('data-ck', el.getAttribute('data-ck').replace(templateEl.id, id));
    });
    return clone;
  }

  function applyProducts(data) {
    if (!data || !data.products) return;
    const { items, order, extra } = data.products;
    (order || Object.keys(items)).forEach(id => {
      const item = items[id]; if (!item) return;
      const card = document.getElementById(id); if (!card) return;
      card.style.display = item.hidden ? 'none' : '';
      setField(card, `products.${id}.name`, item.name);
      setField(card, `products.${id}.subtitle`, item.subtitle);
      setField(card, `products.${id}.description`, item.description);
      setField(card, `products.${id}.chip`, item.chip);
      if (item.color) {
        card.style.backgroundColor = item.color;
        const view = card.querySelector('.product-view'); if (view) view.style.backgroundColor = item.color;
      }
    });
    if (extra && extra.length && order && order.length) {
      const lastCard = document.getElementById(order[order.length - 1]);
      if (lastCard) {
        extra.forEach(item => {
          if (document.getElementById(item.id)) return; // already added
          const clone = cloneTemplateCard(lastCard, item.id);
          lastCard.parentNode.insertBefore(clone, lastCard.nextSibling);
          setField(clone, `products.${item.id}.name`, item.name);
          setField(clone, `products.${item.id}.subtitle`, item.subtitle);
          setField(clone, `products.${item.id}.description`, item.description);
          setField(clone, `products.${item.id}.chip`, item.chip);
          if (item.color) clone.style.backgroundColor = item.color;
        });
      }
    }
  }

  function applyCoolWall(data) {
    if (!data || !data.coolWall) return;
    const grid = document.querySelector('.cool-wall__grid');
    if (!grid) return;
    setField(document, 'coolwall.title', data.coolWall.title);
    const tileEls = grid.querySelectorAll('.cool-wall__tile');
    (data.coolWall.tiles || []).forEach((tile, i) => {
      const tileEl = tileEls[i]; if (!tileEl) return;
      tileEl.style.display = tile.hidden ? 'none' : '';
      const media = tileEl.querySelector('.cool-wall__media');
      if (media && tile.src) { media.src = tile.src; if (media.tagName === 'VIDEO') media.load(); }
    });
    (data.coolWall.extra || []).forEach(tile => {
      if (document.getElementById('coolwall-' + tile.id)) return;
      const templateTile = tileEls[tileEls.length - 1];
      if (!templateTile) return;
      const clone = templateTile.cloneNode(true);
      clone.id = 'coolwall-' + tile.id;
      const media = clone.querySelector('.cool-wall__media');
      if (media) { media.src = tile.src; if (media.tagName === 'VIDEO') media.load(); }
      grid.appendChild(clone);
    });
  }

  function applyHero(data) {
    if (!data || !data.hero) return;
    setField(document, 'hero.eyebrow', data.hero.eyebrow);
    setField(document, 'hero.titleFirst', data.hero.titleFirst);
    setField(document, 'hero.titleSecond', data.hero.titleSecond);
    setField(document, 'hero.ctaText', data.hero.ctaText);
  }

  function applyContact(data) {
    if (!data || !data.contact) return;
    setField(document, 'contact.email', data.contact.email);
    document.querySelectorAll('a[data-ck="contact.email.href"]').forEach(a => {
      a.href = 'mailto:' + data.contact.email;
    });
  }

  async function applyAll() {
    const data = await loadContent();
    if (!data) return;
    window.__drinkstopContent = data;
    applyHero(data);
    applyProducts(data);
    applyCoolWall(data);
    applyContact(data);
    document.dispatchEvent(new CustomEvent('drinkstop:content-applied', { detail: data }));
  }

  window.DrinkStopContent = { loadContent, saveContent, resetContent, applyAll };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyAll);
  } else {
    applyAll();
  }
})();
