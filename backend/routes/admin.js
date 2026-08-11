const express = require('express');
const router = express.Router();
const { ObjectId } = require('mongodb');

// 1. Route pour récupérer TOUS les utilisateurs (réservé aux admins)
router.get('/users', async (req, res) => {
    try {
        const db = req.app.locals.db;
        // On récupère tous les utilisateurs sauf les mots de passe pour la sécurité
        const users = await db.collection('users').find({}, { projection: { password: 0 } }).toArray();
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la récupération des utilisateurs" });
    }
});

// 2. Route pour modifier le statut d'un utilisateur (Admin / Membre)[cite: 11]
router.put('/users/:id/status', async (req, res) => {
    try {
        const db = req.app.locals.db;
        const { isAdmin, isMember } = req.body;
        const userId = req.params.id;

        // Mise à jour des droits dans MongoDB
        await db.collection('users').updateOne(
            { _id: new ObjectId(userId) },
            { $set: { isAdmin, isMember } }
        );

        res.json({ message: "Statut mis à jour avec succès !" });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la mise à jour du statut" });
    }
});

module.exports = router;
