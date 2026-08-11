const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Route d'inscription
router.post('/register', async (req, res) => {
    try {
        // On récupère les champs exigés par le sujet (nom, prenom, confirmation)
        const { email, password, passwordConfirm, nom, prenom, pseudo } = req.body;
        const db = req.app.locals.db;
        const usersCollection = db.collection('users');

        // Vérification obligatoire : les deux mots de passe doivent être identiques
        if (password !== passwordConfirm) {
            return res.status(400).json({ message: "Les mots de passe ne correspondent pas." });
        }

        // Vérifier si l'utilisateur existe déjà
        const existingUser = await usersCollection.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Cet email est déjà utilisé." });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // On enregistre le profil complet avec nom et prénom
        const newUser = {
            nom,
            prenom,
            email,
            password: hashedPassword,
            pseudo: pseudo || prenom,
            isAdmin: false,
            dateInscription: new Date()
        };

        await usersCollection.insertOne(newUser);
        res.status(201).json({ message: "Utilisateur créé avec succès" });
    } catch (error) {
        console.error("Erreur Inscription:", error);
        res.status(500).json({ message: "Erreur serveur lors de l'inscription" });
    }
});

// Route de connexion
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const db = req.app.locals.db;
        const usersCollection = db.collection('users');

        // Vérifier si l'utilisateur existe
        const user = await usersCollection.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Identifiants incorrects" });
        }

        // Vérifier la correspondance du mot de passe
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Identifiants incorrects" });
        }

        // Création du badge d'accès (Token JWT)
        const token = jwt.sign(
            { userId: user._id, isAdmin: user.isAdmin, pseudo: user.pseudo },
            process.env.JWT_SECRET || 'super_secret_key_cookalgo',
            { expiresIn: '24h' }
        );

        res.status(200).json({ token, message: "Connexion réussie" });
    } catch (error) {
        console.error("Erreur Connexion:", error);
        res.status(500).json({ message: "Erreur serveur lors de la connexion" });
    }
});

module.exports = router;
