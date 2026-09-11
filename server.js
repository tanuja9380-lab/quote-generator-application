const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const dataDir = path.join(__dirname, "data");
const dataFile = path.join(dataDir, "favorites.json");

if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
}

if (!fs.existsSync(dataFile)) {
    fs.writeFileSync(dataFile, "[]");
}

function getFavorites() {
    try {
        return JSON.parse(fs.readFileSync(dataFile, "utf8"));
    } catch {
        return [];
    }
}

function saveFavorites(favorites) {
    fs.writeFileSync(dataFile, JSON.stringify(favorites, null, 2));
}

// Get a random quote
app.get("/api/quote", async (req, res) => {
    try {
        const response = await fetch("https://dummyjson.com/quotes/random");

        if (!response.ok) {
            throw new Error("Quote API failed");
        }

        const data = await response.json();

        res.json({
            id: data.id,
            quote: data.quote,
            author: data.author
        });
    } catch (error) {
        res.status(500).json({
            error: "Unable to fetch quote"
        });
    }
});

// Get favorite quotes
app.get("/api/favorites", (req, res) => {
    res.json(getFavorites());
});

// Save favorite quote
app.post("/api/favorites", (req, res) => {
    const { quote, author } = req.body;

    if (!quote || !author) {
        return res.status(400).json({
            error: "Quote and author are required"
        });
    }

    const favorites = getFavorites();

    const alreadyExists = favorites.some(
        item => item.quote === quote && item.author === author
    );

    if (alreadyExists) {
        return res.status(409).json({
            error: "Quote already saved"
        });
    }

    const newFavorite = {
        id: Date.now(),
        quote,
        author,
        savedAt: new Date().toISOString()
    };

    favorites.unshift(newFavorite);
    saveFavorites(favorites);

    res.status(201).json(newFavorite);
});

// Delete favorite quote
app.delete("/api/favorites/:id", (req, res) => {
    const id = Number(req.params.id);

    const favorites = getFavorites();
    const updatedFavorites = favorites.filter(item => item.id !== id);

    saveFavorites(updatedFavorites);

    res.json({
        message: "Favorite removed"
    });
});

app.use((req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
    console.log(`Quote Generator running at http://localhost:${PORT}`);
});