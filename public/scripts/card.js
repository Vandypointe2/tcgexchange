document.addEventListener("DOMContentLoaded", async () => {
	const urlParams = new URLSearchParams(window.location.search);
	const cardId = urlParams.get("id");
	if (!cardId) return;

	try {
		let card;
		try {
			({ card } = await apiRequest(`/cards/local/${cardId}`));
		} catch (e) {
			// optional external fallback (uses the same toggle as search)
			const allowApiFallback = localStorage.getItem('allowApiFallback') === 'true';
			if (!allowApiFallback) throw e;
			({ card } = await apiRequest(`/cards/${cardId}`));
		}

		document.getElementById("card-image").src = card.images?.large || card.images?.small || '';
		document.getElementById("card-name").textContent = card.name || 'Unknown';
		document.getElementById("card-hp").textContent = card.hp || "N/A";
		document.getElementById("card-types").textContent = card.types?.join(", ") || "N/A";
		document.getElementById("card-supertype").textContent = card.supertype || 'N/A';
		document.getElementById("card-subtypes").textContent = card.subtypes?.join(", ") || "N/A";
		document.getElementById("card-rarity").textContent = card.rarity || "N/A";

		const set = card.set || {};
		document.getElementById("card-number").textContent = `${card.number || "?"}/${set.printedTotal || "?"}`;
		document.getElementById("set-name").textContent = set.name || "N/A";
		document.getElementById("set-series").textContent = set.series || "N/A";
		document.getElementById("set-release-date").textContent = set.releaseDate || "N/A";

		// Market prices: only available from external API. If missing, show a hint.
		const market = card.tcgplayer?.prices || {};
		const marketHtml = Object.entries(market).map(([rarity, data]) => {
			if (!data || data.market == null) return '';
			return `<p><strong>${rarity}:</strong> $${Number(data.market).toFixed(2)}</p>`;
		}).filter(Boolean).join("");
		document.getElementById("market-data").innerHTML = marketHtml || '<p>Market prices unavailable (local cache).</p>';

		// TCGplayer query link
		const qName = card.name || '';
		const qNum = card.number || '';
		const qTot = set.printedTotal || '';
		const q = `${qName} - ${qNum}/${qTot}`.trim();
		const collectr = document.getElementById('collectr-link');
		if (collectr) {
			const q2 = `${qNum}/${qTot}`.trim();
			collectr.href = `https://app.getcollectr.com/?query=${encodeURIComponent(q2)}&category=3`;
		}

		// Inline add UI: temporarily replace the two buttons with fields + submit
		const actionsEl = document.getElementById('card-actions');
		if (actionsEl) {
			const originalHtml = actionsEl.innerHTML;

			const renderBaseButtons = () => {
				actionsEl.innerHTML = originalHtml;
				wireButtons();
			};

			const condOptions = ['NM', 'LP', 'MP', 'HP', 'DMG']
				.map((c) => `<option value="${c}">${c}</option>`)
				.join('');

			const renderCollectionForm = () => {
				actionsEl.innerHTML = `
				  <div style="display:flex; flex-wrap:wrap; gap:.5rem; width:100%; align-items:center; justify-content:center;">
				    <select id="inline-condition">${condOptions}</select>
				    <input id="inline-qty" type="number" min="1" value="1" style="width:90px;" />
				    <button id="inline-submit" class="btn-small">Add</button>
				    <button id="inline-cancel" class="btn-small danger" type="button">Cancel</button>
				  </div>
				`;

				document.getElementById('inline-cancel')?.addEventListener('click', renderBaseButtons);
				document.getElementById('inline-submit')?.addEventListener('click', async (e) => {
					e.preventDefault();
					try {
						const condition = document.getElementById('inline-condition')?.value || 'NM';
						const quantity = Number(document.getElementById('inline-qty')?.value || 1);
						await apiRequest('/collection', 'POST', { cardId, condition, quantity });
						showToast('Added to collection', 'success');
						renderBaseButtons();
					} catch (err) {
						showToast(err.message || 'Failed to add to collection', 'error');
					}
				});
			};

			const renderWishlistForm = () => {
				actionsEl.innerHTML = `
				  <div style="display:flex; flex-wrap:wrap; gap:.5rem; width:100%; align-items:center; justify-content:center;">
				    <select id="inline-min-condition">${condOptions.replace('value="NM"', 'value="NM" selected')}</select>
				    <input id="inline-qty" type="number" min="1" value="1" style="width:90px;" />
				    <select id="inline-priority">${[1,2,3,4,5].map(p=>`<option value="${p}" ${p===3?'selected':''}>P${p}</option>`).join('')}</select>
				    <button id="inline-submit" class="btn-small">Add</button>
				    <button id="inline-cancel" class="btn-small danger" type="button">Cancel</button>
				  </div>
				`;

				document.getElementById('inline-cancel')?.addEventListener('click', renderBaseButtons);
				document.getElementById('inline-submit')?.addEventListener('click', async (e) => {
					e.preventDefault();
					try {
						const minCondition = document.getElementById('inline-min-condition')?.value || 'LP';
						const quantityDesired = Number(document.getElementById('inline-qty')?.value || 1);
						const priority = Number(document.getElementById('inline-priority')?.value || 3);
						await apiRequest('/wishlist', 'POST', { cardId, minCondition, quantityDesired, priority });
						showToast('Added to wishlist', 'success');
						renderBaseButtons();
					} catch (err) {
						showToast(err.message || 'Failed to add to wishlist', 'error');
					}
				});
			};

			const wireButtons = () => {
				const addCollectionBtn = document.getElementById('add-to-collection');
				const addWishlistBtn = document.getElementById('add-to-wishlist');
				addCollectionBtn?.addEventListener('click', (e) => {
					e.preventDefault();
					renderCollectionForm();
				});
				addWishlistBtn?.addEventListener('click', (e) => {
					e.preventDefault();
					renderWishlistForm();
				});
			};

			wireButtons();
		}

	} catch (err) {
		console.error("Failed to fetch card:", err);
	}
});
