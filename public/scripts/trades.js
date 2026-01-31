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

async function loadUsers() {
  const select = document.getElementById('other-user-select');
  select.innerHTML = '';

  const { users } = await apiRequest('/trades/users');
  if (!users || users.length === 0) {
    select.appendChild(el('option', { value: '', text: 'No other users found' }));
    return;
  }

  users.forEach((u) => {
    select.appendChild(el('option', { value: u.id, text: u.username }));
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
    const ul = el('ul');
    iGive.forEach((m) => {
      ul.appendChild(el('li', { text: `${fmtCard(m.card)} (up to ${m.qty})` }));
    });
    giveList.appendChild(ul);
  }

  const receiveList = el('div');
  receiveList.appendChild(el('h4', { text: 'They have cards you want' }));
  if (!theyGive.length) {
    receiveList.appendChild(el('p', { text: 'No direct matches (their collection vs your wishlist).' }));
  } else {
    const ul = el('ul');
    theyGive.forEach((m) => {
      ul.appendChild(el('li', { text: `${fmtCard(m.card)} (up to ${m.qty})` }));
    });
    receiveList.appendChild(ul);
  }

  matches.appendChild(giveList);
  matches.appendChild(receiveList);

  matches.appendChild(el('h4', { text: 'Suggested 1:1 swaps (select to propose)' }));
  if (!suggestedSwaps.length) {
    matches.appendChild(el('p', { text: 'No 1:1 swaps available yet. Add more cards to both collections/wishlists.' }));
    return;
  }

  const list = el('div', { id: 'suggested-swaps', style: 'display:flex; flex-direction:column; gap:0.5rem;' });
  suggestedSwaps.forEach((s, idx) => {
    const row = el('label', { style: 'display:flex; gap:0.5rem; align-items:center;' });
    const cb = el('input', {
      type: 'checkbox',
      'data-give': s.give.id,
      'data-receive': s.receive.id,
      'data-qty': s.quantity || 1,
      id: `swap-${idx}`
    });
    row.appendChild(cb);
    row.appendChild(el('span', { text: `You give: ${fmtCard(s.give)}  ⇄  You receive: ${fmtCard(s.receive)} (x${s.quantity || 1})` }));
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
    const a = el('a', { href: `/trade_detail.html?id=${t.id}`, text: `Trade #${t.id} — ${other} — ${t.status}` });
    const li = el('li');
    li.appendChild(a);
    ul.appendChild(li);
  });
  slot.appendChild(ul);
}

async function findMatches() {
  const otherUserId = document.getElementById('other-user-select').value;
  if (!otherUserId) return;
  const data = await apiRequest(`/trades/matches/${otherUserId}`);
  window.__lastMatchData = data;
  renderMatches(data);
}

async function proposeTrade() {
  const otherUserId = document.getElementById('other-user-select').value;
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
    await loadUsers();
    await loadMyTrades();

    document.getElementById('find-matches-btn').addEventListener('click', () => {
      findMatches().catch((e) => showToast(e.message || 'Failed to load matches', 'error'));
    });

    document.getElementById('propose-trade-btn').addEventListener('click', () => {
      proposeTrade().catch((e) => showToast(e.message || 'Failed to propose trade', 'error'));
    });
  } catch (e) {
    showToast(e.message || 'Failed to initialize trades', 'error');
  }
});
