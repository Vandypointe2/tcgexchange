function el(tag, attrs = {}, children = []) {
  const e = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => {
    if (k === 'class') e.className = v;
    else if (k === 'text') e.textContent = v;
    else e.setAttribute(k, v);
  });
  children.forEach((c) => e.appendChild(c));
  return e;
}

function fmtCard(card) {
  if (!card) return '';
  const set = card.setName ? ` — ${card.setName}` : '';
  const num = card.number ? ` #${card.number}` : '';
  return `${card.name || card.id}${set}${num}`;
}

async function loadRecommendations() {
  const slot = document.getElementById('recommendations');
  slot.innerHTML = '';

  const resp = await apiRequest('/trades/recommendations?limit=25');
  const recs = resp?.recommendations || [];

  if (!recs.length) {
    slot.appendChild(el('p', { text: 'No strong trade matches found yet. Add more cards to your collection/wishlist.' }));
    return;
  }

  recs.forEach((r) => {
    const row = el('div', { class: 'user-card' });

    const leftWrap = el('div', { class: 'user-left' });
    const avatar = el('img', { class: 'user-avatar', alt: 'avatar' });
    avatar.src = r.user.avatarUrl || 'https://www.gravatar.com/avatar/?d=mp&f=y';

    const left = el('div');
    left.appendChild(el('div', { class: 'match-title', text: r.user.username }));
    const meta = el('div', { class: 'meta' });
    meta.appendChild(el('span', { class: 'score-pill', text: `Score ${r.score}` }));
    meta.appendChild(document.createTextNode(` · ${r.swapCount} swap ideas`));
    left.appendChild(meta);

    leftWrap.appendChild(avatar);
    leftWrap.appendChild(left);

    const btn = el('button', { class: 'button', text: 'View Matches' });
    btn.addEventListener('click', () => {
      findMatches(r.user.id).catch((e) => showToast(e.message || 'Failed to load matches', 'error'));
    });

    row.appendChild(leftWrap);
    row.appendChild(btn);
    slot.appendChild(row);
  });
}

function renderMatches(data) {
  const matches = document.getElementById('matches');
  const propose = document.getElementById('propose');

  matches.innerHTML = '';
  propose.style.display = 'none';

  if (!data) return;

  const { otherUser, iGive, theyGive, suggestedSwaps } = data;

  matches.appendChild(el('h3', { text: `Matches with ${otherUser.username}` }));

  const giveList = el('div');
  giveList.appendChild(el('h4', { text: 'You have cards they want' }));
  if (!iGive.length) {
    giveList.appendChild(el('p', { text: 'No direct matches (your collection vs their wishlist).' }));
  } else {
    const grid = el('div', { class: 'matches-grid' });
    iGive.slice(0, 12).forEach((m) => {
      const img = el('img', { alt: 'card' });
      if (m.card?.imageSmall) img.src = m.card.imageSmall;
      const info = el('div');
      info.appendChild(el('div', { class: 'match-title', text: m.card?.name || m.cardId }));
      info.appendChild(el('div', { class: 'match-sub', text: `${m.card?.setName || ''} #${m.card?.number || ''} · up to ${m.qty}`.trim() }));
      const row = el('div', { class: 'match-card' }, [img, info]);
      grid.appendChild(row);
    });
    if (iGive.length > 12) grid.appendChild(el('p', { class: 'meta', text: `…and ${iGive.length - 12} more` }));
    giveList.appendChild(grid);
  }

  const receiveList = el('div');
  receiveList.appendChild(el('h4', { text: 'They have cards you want' }));
  if (!theyGive.length) {
    receiveList.appendChild(el('p', { text: 'No direct matches (their collection vs your wishlist).' }));
  } else {
    const grid = el('div', { class: 'matches-grid' });
    theyGive.slice(0, 12).forEach((m) => {
      const img = el('img', { alt: 'card' });
      if (m.card?.imageSmall) img.src = m.card.imageSmall;
      const info = el('div');
      info.appendChild(el('div', { class: 'match-title', text: m.card?.name || m.cardId }));
      info.appendChild(el('div', { class: 'match-sub', text: `${m.card?.setName || ''} #${m.card?.number || ''} · up to ${m.qty}`.trim() }));
      const row = el('div', { class: 'match-card' }, [img, info]);
      grid.appendChild(row);
    });
    if (theyGive.length > 12) grid.appendChild(el('p', { class: 'meta', text: `…and ${theyGive.length - 12} more` }));
    receiveList.appendChild(grid);
  }

  matches.appendChild(giveList);
  matches.appendChild(receiveList);

  matches.appendChild(el('h4', { text: 'Suggested 1:1 swaps (select to propose)' }));
  if (!suggestedSwaps.length) {
    matches.appendChild(el('p', { text: 'No 1:1 swaps available yet. Add more cards to both collections/wishlists.' }));
    return;
  }

  const list = el('div', { id: 'suggested-swaps', style: 'display:flex; flex-direction:column; gap:0.6rem;' });
  suggestedSwaps.forEach((s, idx) => {
    const row = el('label', { class: 'swap-row' });
    const cb = el('input', {
      type: 'checkbox',
      'data-give': s.give.id,
      'data-receive': s.receive.id,
      'data-qty': s.quantity || 1,
      id: `swap-${idx}`
    });
    row.appendChild(cb);

    const text = el('div');
    text.appendChild(el('div', { class: 'match-title', text: `You give: ${fmtCard(s.give)}` }));
    text.appendChild(el('div', { class: 'match-sub', text: `You receive: ${fmtCard(s.receive)} · x${s.quantity || 1}` }));
    row.appendChild(text);

    list.appendChild(row);
  });

  matches.appendChild(list);
  propose.style.display = 'block';
}

async function loadMyTrades() {
  const slot = document.getElementById('my-trades');
  slot.innerHTML = '';

  const { trades } = await apiRequest('/trades');
  if (!trades || trades.length === 0) {
    slot.appendChild(el('p', { text: 'No trades yet.' }));
    return;
  }

  const ul = el('ul');
  trades.forEach((t) => {
    const other = (t.proposerId === t.recipientId) ? '' : (t.proposer?.username && t.recipient?.username ? `${t.proposer.username} ↔ ${t.recipient.username}` : '');
    const a = el('a', { class: 'trade-link', href: `/trade_detail.html?id=${t.id}`, text: `Trade #${t.id} — ${other} — ${t.status}` });
    const li = el('li');
    li.appendChild(a);
    ul.appendChild(li);
  });
  slot.appendChild(ul);
}

async function findMatches(otherUserId) {
  if (!otherUserId) return;
  const data = await apiRequest(`/trades/matches/${otherUserId}`);
  window.__lastMatchData = data;
  window.__lastOtherUserId = otherUserId;
  renderMatches(data);
}

async function proposeTrade() {
  const otherUserId = window.__lastOtherUserId;
  const note = document.getElementById('trade-note').value;

  const selected = Array.from(document.querySelectorAll('#suggested-swaps input[type="checkbox"]'))
    .filter((cb) => cb.checked)
    .map((cb) => ({
      giveCardId: cb.dataset.give,
      receiveCardId: cb.dataset.receive,
      quantity: parseInt(cb.dataset.qty || '1', 10)
    }));

  if (selected.length === 0) {
    showToast('Select at least one suggested swap.', 'error');
    return;
  }

  const { trade } = await apiRequest('/trades', 'POST', {
    recipientId: parseInt(otherUserId, 10),
    swaps: selected,
    note
  });

  showToast(`Trade #${trade.id} proposed.`, 'success');
  await loadMyTrades();
  window.location.href = `/trade_detail.html?id=${trade.id}`;
}

document.addEventListener('DOMContentLoaded', async () => {
  try {
    await loadRecommendations();
    await loadMyTrades();

    document.getElementById('refresh-recs-btn')?.addEventListener('click', () => {
      loadRecommendations().catch((e) => showToast(e.message || 'Failed to load recommendations', 'error'));
    });

    document.getElementById('propose-trade-btn').addEventListener('click', () => {
      proposeTrade().catch((e) => showToast(e.message || 'Failed to propose trade', 'error'));
    });
  } catch (e) {
    showToast(e.message || 'Failed to initialize trades', 'error');
  }
});
