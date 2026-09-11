const quoteText = document.getElementById("quote-text");
const quoteAuthor = document.getElementById("quote-author");
const loading = document.getElementById("loading");
const quoteContent = document.getElementById("quote-content");

const newQuoteBtn = document.getElementById("new-quote-btn");
const favoriteBtn = document.getElementById("favorite-btn");
const copyBtn = document.getElementById("copy-btn");

const favoritesList = document.getElementById("favorites-list");
const favoriteCount = document.getElementById("favorite-count");

let currentQuote = null;

// Load random quote
async function loadQuote() {
    loading.classList.remove("hidden");
    quoteContent.classList.add("hidden");

    try {
        const response = await fetch("/api/quote");

        if (!response.ok) {
            throw new Error("Failed to fetch quote");
        }

        const data = await response.json();

        currentQuote = data;

        quoteText.textContent = data.quote;
        quoteAuthor.textContent = `— ${data.author}`;

        loading.classList.add("hidden");
        quoteContent.classList.remove("hidden");

        favoriteBtn.textContent = "❤️ Favorite";

    } catch (error) {
        loading.textContent = "Unable to load quote. Please try again.";
    }
}

// Save favorite
async function saveFavorite() {
    if (!currentQuote) return;

    try {
        const response = await fetch("/api/favorites", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                quote: currentQuote.quote,
                author: currentQuote.author
            })
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.error);
            return;
        }

        favoriteBtn.textContent = "❤️ Saved!";
        loadFavorites();

    } catch (error) {
        alert("Unable to save favorite.");
    }
}

// Copy current quote
async function copyQuote() {
    if (!currentQuote) return;

    const text = `"${currentQuote.quote}" — ${currentQuote.author}`;

    try {
        await navigator.clipboard.writeText(text);

        copyBtn.textContent = "✅ Copied!";

        setTimeout(() => {
            copyBtn.textContent = "📋 Copy";
        }, 1500);

    } catch (error) {
        alert("Unable to copy quote.");
    }
}

// Load favorites
async function loadFavorites() {
    try {
        const response = await fetch("/api/favorites");
        const favorites = await response.json();

        favoriteCount.textContent = favorites.length;

        if (favorites.length === 0) {
            favoritesList.innerHTML =
                '<div class="empty">No favorite quotes yet. Save one above ❤️</div>';
            return;
        }

        favoritesList.innerHTML = favorites.map(item => `
            <div class="favorite-item">
                <p>“${escapeHtml(item.quote)}”</p>
                <p class="favorite-author">— ${escapeHtml(item.author)}</p>

                <div class="favorite-actions">
                    <button
                        class="copy-favorite-btn"
                        onclick="copyFavorite('${escapeHtml(item.quote)}', '${escapeHtml(item.author)}')">
                        📋 Copy
                    </button>

                    <button
                        class="delete-btn"
                        onclick="deleteFavorite(${item.id})">
                        🗑️ Delete
                    </button>
                </div>
            </div>
        `).join("");

    } catch (error) {
        favoritesList.innerHTML =
            '<div class="empty">Unable to load favorites.</div>';
    }
}

// Delete favorite
async function deleteFavorite(id) {
    try {
        await fetch(`/api/favorites/${id}`, {
            method: "DELETE"
        });

        loadFavorites();

    } catch (error) {
        alert("Unable to delete favorite.");
    }
}

// Copy favorite
async function copyFavorite(quote, author) {
    try {
        await navigator.clipboard.writeText(`"${quote}" — ${author}`);
        alert("Quote copied!");
    } catch (error) {
        alert("Unable to copy quote.");
    }
}

// Basic HTML escaping
function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}

newQuoteBtn.addEventListener("click", loadQuote);
favoriteBtn.addEventListener("click", saveFavorite);
copyBtn.addEventListener("click", copyQuote);

// Start app
loadQuote();
loadFavorites();