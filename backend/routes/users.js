const express = require('express');
const router = express.Router();

// Route pour consulter un profil via son pseudo
router.get('/:pseudo', async (req, res) => {
    try {
        const db = req.app.locals.db;
        const user = await db.collection('users').findOne({ pseudo: req.params.pseudo });
        
        if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });
        
        // Sécurité : on ne renvoie jamais le mot de passe !
        const { password, ...userPublicInfo } = user;
        res.json(userPublicInfo);
    } catch (err) {
        res.status(500).json({ message: "Erreur serveur" });
    }
});

module.exports = router;
