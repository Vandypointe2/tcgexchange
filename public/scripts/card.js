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

	} catch (err) {
		console.error("Failed to fetch card:", err);
	}
});
