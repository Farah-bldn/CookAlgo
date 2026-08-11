const express = require('express');
const { ObjectId } = require('mongodb'); 
const router = express.Router();

router.post('/', async (req, res) => {
    try {
        const db = req.app.locals.db;
        const { title, content, ingredients, author } = req.body;
        const newMessage = { title, content, author: author || "Anonyme", ingredients: ingredients || "", date: new Date() };
        await db.collection('messages').insertOne(newMessage);
        res.status(201).json({ message: "Recette postée avec succès !" });
    } catch (error) {
        res.status(500).json({ error: "Erreur lors de la création de la recette" });
    }
});

router.get('/', async (req, res) => {
    try {
        const db = req.app.locals.db;
        
        // On récupère tous les filtres possibles depuis l'URL
        const { ingredient, author, dateDebut, dateFin } = req.query;
        let query = {};

        // 1. Filtre par ingrédient (le code que tu avais déjà)
        if (ingredient) {
            query.ingredients = { $regex: ingredient, $options: 'i' };
        } 

        // 2. Point 3 du sujet : Filtre par auteur (insensible à la casse)
        if (author) {
            query.author = { $regex: author, $options: 'i' };
        }

        // 3. Point 3 du sujet : Filtre par plage de dates
        if (dateDebut || dateFin) {
            query.date = {};
            if (dateDebut) {
                query.date.$gte = new Date(dateDebut); // Supérieur ou égal à la date de début
            }
            if (dateFin) {
                const fin = new Date(dateFin);
                fin.setHours(23, 59, 59, 999); // Inclure toute la journée de fin
                query.date.$lte = fin; // Inférieur ou égal à la date de fin
            }
        }

        // On récupère les recettes triées de la plus récente à la plus ancienne
        const messages = await db.collection('messages').find(query).sort({ date: -1 }).toArray();
        res.status(200).json(messages);
    } catch (error) {
        console.error("Erreur recherche:", error);
        res.status(500).json({ error: "Erreur de récupération des recettes" });
    }
});

// ❌ NOUVEAU : La route pour supprimer
router.delete('/:id', async (req, res) => {
    try {
        const db = req.app.locals.db;
        const messageId = req.params.id;
        const result = await db.collection('messages').deleteOne({ _id: new ObjectId(messageId) });
        if (result.deletedCount === 1) res.status(200).json({ message: "Recette supprimée" });
        else res.status(404).json({ error: "Introuvable" });
    } catch (error) {
        res.status(500).json({ error: "Erreur serveur" });
    }
});
// ==========================================
// ⭐ SYSTÈME DE FAVORIS (LIKES PAR UTILISATEUR)
// ==========================================
router.put('/:id/like', async (req, res) => {
    try {
        const db = req.app.locals.db;
        const { ObjectId } = require('mongodb');
        const { pseudo } = req.body; // On récupère le pseudo de celui qui a cliqué

        if (!pseudo) {
            return res.status(400).json({ error: "Connectez-vous pour aimer." });
        }

        const messageId = new ObjectId(req.params.id);
        const recipe = await db.collection('messages').findOne({ _id: messageId });

        if (!recipe) {
            return res.status(404).json({ error: "Recette introuvable." });
        }

        // On vérifie si l'utilisateur a déjà liké (si son pseudo est dans la liste)
        const alreadyLiked = recipe.likedBy && recipe.likedBy.includes(pseudo);

        if (alreadyLiked) {
            // S'il a déjà liké, on retire son pseudo avec $pull (Dislike)
            await db.collection('messages').updateOne(
                { _id: messageId },
                { $pull: { likedBy: pseudo } }
            );
            res.status(200).json({ message: "Recette retirée des favoris !" });
        } else {
            // S'il n'a pas liké, on ajoute son pseudo avec $push (Like)
            await db.collection('messages').updateOne(
                { _id: messageId },
                { $push: { likedBy: pseudo } }
            );
            res.status(200).json({ message: "Recette ajoutée aux favoris !" });
        }
    } catch (error) {
        res.status(500).json({ error: "Erreur serveur" });
    }
});
// ==========================================
// 💬 AJOUTER UN COMMENTAIRE À UNE RECETTE
// ==========================================
router.post('/:id/comments', async (req, res) => {
    try {
        const db = req.app.locals.db;
        const { ObjectId } = require('mongodb');
        const { author, content } = req.body;

        const newComment = {
            author: author || "Anonyme",
            content: content,
            date: new Date()
        };

        await db.collection('messages').updateOne(
            { _id: new ObjectId(req.params.id) },
            { $push: { comments: newComment } } // Pousse le commentaire dans la recette
        );
        res.status(201).json({ message: "Commentaire publié !" });
    } catch (error) {
        res.status(500).json({ error: "Erreur serveur" });
    }
});
module.exports = router;
