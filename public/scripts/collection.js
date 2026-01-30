async function loadCollection() {
  const container = document.getElementById('collection-list');
  container.innerHTML = '';

  try {
    const { items } = await apiRequest('/collection');

    if (!items || items.length === 0) {
      container.innerHTML = '<p>No cards in your collection yet.</p>';
      return;
    }

    // bulk lookup for name/images
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
        <small>Condition: ${it.condition} · Qty: ${it.quantity}</small>
        <div style="display:flex; gap:.5rem; margin-top:.75rem; flex-wrap: wrap;">
          <input type="number" min="1" value="${it.quantity}" style="width:90px;" />
          <select>
            ${['NM','LP','MP','HP','DMG'].map(c => `<option value="${c}" ${c===it.condition?'selected':''}>${c}</option>`).join('')}
          </select>
          <button class="btn-small">Save</button>
          <button class="btn-small danger">Delete</button>
        </div>
      `;

      const qtyInput = el.querySelector('input');
      const condSelect = el.querySelector('select');
      const saveBtn = el.querySelectorAll('button')[0];
      const delBtn = el.querySelectorAll('button')[1];

      saveBtn.addEventListener('click', async () => {
        try {
          await apiRequest(`/collection/${it.id}`, 'PUT', {
            quantity: Number(qtyInput.value),
            condition: condSelect.value
          });
          showToast('Saved', 'success');
          loadCollection();
        } catch (e) {
          showToast(e.message, 'error');
        }
      });

      delBtn.addEventListener('click', async () => {
        if (!confirm('Delete this item?')) return;
        try {
          await apiRequest(`/collection/${it.id}`, 'DELETE');
          showToast('Deleted', 'success');
          loadCollection();
        } catch (e) {
          showToast(e.message, 'error');
        }
      });

      container.appendChild(el);
      requestAnimationFrame(() => el.classList.add('loaded'));
    });
  } catch (e) {
    container.innerHTML = `<p>Failed to load collection: ${e.message}</p>`;
  }
}

document.addEventListener('DOMContentLoaded', loadCollection);
