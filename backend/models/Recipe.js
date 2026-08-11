const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({
    titre: { 
        type: String, 
        required: true 
    },
    description: { 
        type: String, 
        required: true 
    },
    // On lie la recette à son auteur (via son identifiant Utilisateur)
    auteur: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    // Un tableau de mots-clés pour que le SmartFridge puisse filtrer facilement
    ingredients: [{ 
        type: String 
    }],
    etapes: { 
        type: String,
        required: true
    },
    imageURL: { 
        type: String, 
        default: "" //par défaut c'est vide
    },
    datePublication: { 
        type: Date, 
        default: Date.now 
    }
});

module.exports = mongoose.model('Recipe', recipeSchema);
