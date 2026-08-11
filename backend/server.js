const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb'); // Le vrai outil officiel !
const bcrypt = require('bcrypt'); // Toujours là pour la sécurité
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const messagesRoutes = require('./routes/messages');
const userRoutes = require('./routes/users');

app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
// Branchement du Forum / Frigo intelligent
app.use('/api/messages', messagesRoutes);

// Initialisation du client MongoDB Natif
const client = new MongoClient(MONGO_URI);

async function startServer() {
    try {
        // 1. On se connecte à la base de données
        await client.connect();
        console.log('✅ Connexion à MongoDB réussie (Pilote Natif) !');
        
        // On sélectionne la base "fbmr" (elle se crée toute seule si elle n'existe pas)
        const db = client.db('fbmr');
        const usersCollection = db.collection('users');

        // --- 2. VÉRIFICATION ET INITIALISATION (Exigence du TD) ---
        const userCount = await usersCollection.countDocuments();
        
        if (userCount === 0) {
            console.log('⚠️ Base de données vide. Initialisation avec la liste de comptes exigée...');
            
            const salt = await bcrypt.genSalt(10);
            
            // Mots de passe par défaut cryptés
            const hashedAdminPwd = await bcrypt.hash('admin123', salt);
            const hashedUserPwd = await bcrypt.hash('user123', salt);
            
            // Insertion de la liste de comptes exigée (dont l'admin)
            await usersCollection.insertMany([
                {
                    nom: "Admin",
                    prenom: "Super",
                    pseudo: "SuperAdmin",
                    email: "admin@cookalgo.com",
                    password: hashedAdminPwd,
                    isAdmin: true,
                    isMember: true,
                    dateInscription: new Date()
                },
                {
                    nom: "Rabehi",
                    prenom: "Mehdi",
                    pseudo: "Mehdi",
                    email: "mehdi@cookalgo.com",
                    password: hashedUserPwd,
                    isAdmin: false,
                    isMember: true,
                    dateInscription: new Date()
                },
                {
                    nom: "Belaidouni",
                    prenom: "Farah",
                    pseudo: "Fifi",
                    email: "belaidounifarah06@gmail.com",
                    password: hashedUserPwd,
                    isAdmin: false,
                    isMember: true,
                    dateInscription: new Date()
                }
            ]);
            console.log('👑 Comptes initiaux (1 Admin, 2 Membres) créés avec succès !');
        } else {
            console.log(`ℹ️ La base contient déjà ${userCount} utilisateur(s).`);
        }

        // 3. On rend la base de données accessible pour nos futures routes
        app.locals.db = db;

        // 4. On démarre le serveur web
        app.listen(PORT, () => {
            console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
        });

    } catch (error) {
        console.error('❌ Erreur de connexion MongoDB :', error);
        process.exit(1);
    }
}

// Lancement de la procédure
startServer();
