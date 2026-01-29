function setupInventoryModal() {
  const modal = document.getElementById('inv-modal');
  const form = document.getElementById('inv-form');

  const title = document.getElementById('inv-title');
  const cardIdEl = document.getElementById('inv-cardId');
  const kindEl = document.getElementById('inv-kind');

  const qtyEl = document.getElementById('inv-qty');
  const condWrap = document.getElementById('inv-condition-wrap');
  const condLabel = document.getElementById('inv-condition-label');
  const condEl = document.getElementById('inv-condition');

  const priWrap = document.getElementById('inv-priority-wrap');
  const priEl = document.getElementById('inv-priority');

  const close = () => modal.setAttribute('aria-hidden', 'true');
  const open = () => modal.setAttribute('aria-hidden', 'false');

  modal.addEventListener('click', (e) => {
    const t = e.target;
    if (t?.dataset?.close === 'true') close();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const cardId = cardIdEl.value;
    const kind = kindEl.value;
    const qty = Number(qtyEl.value || 1);

    try {
      if (kind === 'collection') {
        await apiRequest('/collection', 'POST', {
          cardId,
          quantity: qty,
          condition: condEl.value
        });
        showToast('Added to collection', 'success');
      } else {
        await apiRequest('/wishlist', 'POST', {
          cardId,
          quantityDesired: qty,
          minCondition: condEl.value,
          priority: Number(priEl.value)
        });
        showToast('Added to wishlist', 'success');
      }
      close();
    } catch (err) {
      showToast(err.message || 'Failed', 'error');
    }
  });

  window.openInventoryModal = ({ kind, cardId }) => {
    title.textContent = kind === 'wishlist' ? 'Add to Wishlist' : 'Add to Collection';
    cardIdEl.value = cardId;
    kindEl.value = kind;
    qtyEl.value = 1;

    if (kind === 'wishlist') {
      priWrap.style.display = '';
      condLabel.textContent = 'Minimum Condition';
      // default wishlist min condition to LP
      condEl.value = 'LP';
    } else {
      priWrap.style.display = 'none';
      condLabel.textContent = 'Condition';
      condEl.value = 'NM';
    }

    open();
    setTimeout(() => qtyEl.focus(), 30);
  };
}
