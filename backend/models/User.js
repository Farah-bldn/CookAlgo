const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: { 
        type: String, 
        required: true, 
        unique: true // Interdit d'avoir deux comptes avec la même adresse
    },
    password: { 
        type: String, 
        required: true 
    },
    pseudo: { 
        type: String, 
        required: true 
    },
    // 	L'administration :
    isAdmin: { 
        type: Boolean, 
        default: false // Par défaut, un nouvel inscrit n'est pas un administrateur
    },
    dateInscription: { 
        type: Date, 
        default: Date.now 
    }
});

module.exports = mongoose.model('User', userSchema);
