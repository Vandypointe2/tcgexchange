function qs(name) {
  return new URLSearchParams(window.location.search).get(name);
}

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

async function loadTrade() {
  const id = qs('id');
  if (!id) throw new Error('Missing trade id');
  const { trade } = await apiRequest(`/trades/${id}`);
  return trade;
}

function renderTradeMeta(trade, me) {
  const slot = document.getElementById('trade-meta');
  slot.innerHTML = '';

  const otherUser = trade.proposerId === me.id ? trade.recipient : trade.proposer;
  const statusLine = el('p');
  statusLine.appendChild(el('span', { text: 'Status: ' }));
  statusLine.appendChild(el('span', { class: `status ${trade.status}`, text: trade.status }));
  slot.appendChild(statusLine);

  slot.appendChild(el('p', { text: `With: ${otherUser?.username || 'Unknown'}` }));
  slot.appendChild(el('p', { class: 'muted', text: `Created: ${new Date(trade.createdAt).toLocaleString()}` }));
}

function renderItems(trade, me) {
  const slot = document.getElementById('trade-items');
  slot.innerHTML = '';

  const youGive = trade.items.filter((i) => i.fromUserId === me.id);
  const youReceive = trade.items.filter((i) => i.toUserId === me.id);

  const giveDiv = el('div');
  giveDiv.appendChild(el('h3', { text: 'You give' }));
  if (youGive.length === 0) giveDiv.appendChild(el('p', { text: '—' }));
  else {
    const ul = el('ul');
    youGive.forEach((i) => {
      ul.appendChild(el('li', { text: `${fmtCard(i.card)} (x${i.quantity})` }));
    });
    giveDiv.appendChild(ul);
  }

  const recvDiv = el('div');
  recvDiv.appendChild(el('h3', { text: 'You receive' }));
  if (youReceive.length === 0) recvDiv.appendChild(el('p', { text: '—' }));
  else {
    const ul = el('ul');
    youReceive.forEach((i) => {
      ul.appendChild(el('li', { text: `${fmtCard(i.card)} (x${i.quantity})` }));
    });
    recvDiv.appendChild(ul);
  }

  slot.appendChild(giveDiv);
  slot.appendChild(recvDiv);
}

function renderActions(trade, me) {
  const slot = document.getElementById('trade-actions');
  slot.innerHTML = '';

  if (trade.status !== 'PROPOSED') {
    slot.appendChild(el('p', { text: 'No actions available.' }));
    return;
  }

  if (trade.recipientId === me.id) {
    const accept = el('button', { text: 'Accept' });
    accept.addEventListener('click', async () => {
      await apiRequest(`/trades/${trade.id}/respond`, 'POST', { action: 'accept' });
      showToast('Trade accepted.', 'success');
      init();
    });

    const decline = el('button', { text: 'Decline' });
    decline.addEventListener('click', async () => {
      await apiRequest(`/trades/${trade.id}/respond`, 'POST', { action: 'decline' });
      showToast('Trade declined.', 'info');
      init();
    });

    slot.appendChild(accept);
    slot.appendChild(decline);
    return;
  }

  if (trade.proposerId === me.id) {
    const cancel = el('button', { text: 'Cancel' });
    cancel.addEventListener('click', async () => {
      await apiRequest(`/trades/${trade.id}/respond`, 'POST', { action: 'cancel' });
      showToast('Trade cancelled.', 'info');
      init();
    });

    slot.appendChild(cancel);
    return;
  }

  slot.appendChild(el('p', { text: 'No actions available.' }));
}

function renderMessages(trade) {
  const slot = document.getElementById('trade-messages');
  slot.innerHTML = '';

  if (!trade.messages || trade.messages.length === 0) {
    slot.appendChild(el('p', { text: 'No messages yet.' }));
    return;
  }

  trade.messages
    .slice()
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    .forEach((m) => {
      const who = m.sender?.username || `User ${m.senderId}`;
      const when = new Date(m.createdAt).toLocaleString();
      const bubble = el('div', { style: 'padding:0.5rem; border:1px solid var(--highlight); border-radius:8px;' });
      bubble.appendChild(el('div', { text: `${who} — ${when}`, style: 'font-size:0.85rem; opacity:0.8; margin-bottom:0.25rem;' }));
      bubble.appendChild(el('div', { text: m.message }));
      slot.appendChild(bubble);
    });
}

async function sendMessage(tradeId) {
  const input = document.getElementById('message-input');
  const msg = input.value.trim();
  if (!msg) return;
  await apiRequest(`/trades/${tradeId}/messages`, 'POST', { message: msg });
  input.value = '';
  await init();
}

async function init() {
  const me = await apiRequest('/auth/me');
  const trade = await loadTrade();

  renderTradeMeta(trade, me);
  renderItems(trade, me);
  renderActions(trade, me);
  renderMessages(trade);

  const btn = document.getElementById('send-message-btn');
  btn.onclick = () => {
    sendMessage(trade.id).catch((e) => showToast(e.message || 'Failed to send message', 'error'));
  };

  const hideBtn = document.getElementById('hide-trade-btn');
  if (hideBtn) {
    hideBtn.onclick = async () => {
      try {
        await apiRequest(`/trades/${trade.id}/hide`, 'POST');
        showToast('Trade hidden.', 'success');
        window.location.href = '/trades.html';
      } catch (e) {
        showToast(e.message || 'Failed to hide trade', 'error');
      }
    };
  }
}

document.addEventListener('DOMContentLoaded', () => {
  init().catch((e) => showToast(e.message || 'Failed to load trade', 'error'));
});
