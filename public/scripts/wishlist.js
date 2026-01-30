async function loadWishlist() {
  const container = document.getElementById('wishlist-list');
  container.innerHTML = '';

  try {
    const { items } = await apiRequest('/wishlist');

    if (!items || items.length === 0) {
      container.innerHTML = '<p>No cards in your wishlist yet.</p>';
      return;
    }

    const ids = Array.from(new Set(items.map((x) => x.cardId)));
    let cardMap = {};
    try {
      const resp = await apiRequest('/cards/bulk', 'POST', { ids });
      cardMap = resp?.cards || {};
    } catch (e) {
      cardMap = {};
    }

    items.forEach((it) => {
      const card = cardMap[it.cardId];
      const title = card ? `${card.name} (${it.cardId})` : it.cardId;
      const setLabel = card?.set || 'SET';
      const numberLabel = card?.number || '';
      const img = card?.images?.large || card?.images?.small;

      const el = document.createElement('div');
      el.className = 'card';
      el.innerHTML = `
        <a href="/card.html?id=${it.cardId}" class="card-link">
          ${img ? `<img src="${img}" alt="${title}" />` : ''}
        </a>
        <h3>${title}</h3>
        <small>${setLabel}${numberLabel ? `: ${numberLabel}` : ''}</small>
        <small>Min Condition: ${it.minCondition} · Qty: ${it.quantityDesired} · Priority: ${it.priority}</small>
        <div style="display:flex; flex-wrap: wrap; gap:.5rem; margin-top:.75rem;">
          <input type="number" min="1" value="${it.quantityDesired}" style="width:90px;" />
          <select class="cond">
            ${['NM','LP','MP','HP','DMG'].map(c => `<option value="${c}" ${c===it.minCondition?'selected':''}>${c}</option>`).join('')}
          </select>
          <select class="pri">
            ${[1,2,3,4,5].map(p => `<option value="${p}" ${p===it.priority?'selected':''}>P${p}</option>`).join('')}
          </select>
          <button class="btn-small">Save</button>
          <button class="btn-small danger">Delete</button>
        </div>
      `;

      const qtyInput = el.querySelector('input');
      const condSelect = el.querySelector('.cond');
      const priSelect = el.querySelector('.pri');
      const saveBtn = el.querySelectorAll('button')[0];
      const delBtn = el.querySelectorAll('button')[1];

      saveBtn.addEventListener('click', async () => {
        try {
          await apiRequest(`/wishlist/${it.id}`, 'PUT', {
            quantityDesired: Number(qtyInput.value),
            minCondition: condSelect.value,
            priority: Number(priSelect.value)
          });
          showToast('Saved', 'success');
          loadWishlist();
        } catch (e) {
          showToast(e.message, 'error');
        }
      });

      delBtn.addEventListener('click', async () => {
        if (!confirm('Delete this item?')) return;
        try {
          await apiRequest(`/wishlist/${it.id}`, 'DELETE');
          showToast('Deleted', 'success');
          loadWishlist();
        } catch (e) {
          showToast(e.message, 'error');
        }
      });

      container.appendChild(el);
      requestAnimationFrame(() => el.classList.add('loaded'));
    });
  } catch (e) {
    container.innerHTML = `<p>Failed to load wishlist: ${e.message}</p>`;
  }
}

document.addEventListener('DOMContentLoaded', loadWishlist);
