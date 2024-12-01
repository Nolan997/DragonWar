// Variables globales
let gold = 0;
let autoClick = 0; // Dégâts automatiques par seconde
let maxDragonHealth = 500; // Points de vie max du dragon
let dragonHealth = 500; // Points de vie initial du dragon
let purchaseQuantity = 1; // Quantité par défaut pour l'achat
let dragonLevel = 1; // Niveau du dragon
let goldReward = 150; // Récompense d'or pour chaque dragon vaincu
let baseClickDamage = 1; // Dégâts de base par clic

// Stockage des boosts achetés
const boostsPurchased = {
    Nid: 0,
    Grotte: 0,
    Feu: 0,
    Tour: 0,
    Volcan: 0
};

// Coût des boosts
const boostCosts = {
    Nid: 50,
    Grotte: 450,
    Feu: 4050,
    Tour: 36450,
    Volcan: 328050
};

// Dégâts infligés par chaque boost
const boostDamage = {
    Nid: 1,
    Grotte: 3,
    Feu: 9,
    Tour: 27,
    Volcan: 81
};

// Mise à jour de l'affichage des boosts
function updateBoosts() {
    updateGoldDisplay();
    updateBoostButtons();
    updateDpsDisplay();
}

function updateGoldDisplay() {
    const goldValueElement = document.getElementById("gold-value");
    goldValueElement.textContent = gold;
}

function updateBoostButtons() {
    Object.entries(boostsPurchased).forEach(([boostId, count]) => {
        const cost = boostCosts[boostId];
        const canAfford = gold >= cost * purchaseQuantity;
        const boostButton = document.getElementById(`buy-${boostId}`);
        boostButton.disabled = !canAfford;
        document.querySelector(`#${boostId} .cost-value`).style.color = canAfford ? 'black' : 'red';
    });
}

function updateDpsDisplay() {
    const dpsElement = document.getElementById("dps-value");
    dpsElement.textContent = autoClick;
}

// Fonction pour acheter un boost
function buyBoost(boostId) {
    const cost = boostCosts[boostId] * purchaseQuantity;
    if (gold >= cost) {
        boostsPurchased[boostId] += purchaseQuantity;
        gold -= cost;
        playSound("purchase-sound");
        boostCosts[boostId] = Math.round(boostCosts[boostId] * 1.15);
        document.getElementById(`${boostId}-count`).textContent = `x${boostsPurchased[boostId]}`;
        calculateAutoClickDamage();
        updateBoosts();
    } else {
        playSound("error-sound");
        showNotification("Pas assez d'or pour acheter ce boost !");
    }
}

// Définir la quantité d'achat
function setQuantity(quantity) {
    purchaseQuantity = quantity;
    document.querySelectorAll(".quantity-button").forEach(btn => btn.classList.remove("active"));
    document.querySelector(`.quantity-button:nth-child(${quantity === 1 ? 1 : quantity === 10 ? 2 : 3})`).classList.add("active");
    updateBoosts();
}

// Dégâts infligés par clic
function clickDragon() {
    playSound("click-sound");
    if (dragonHealth > 0) {
        let totalClickDamage = calculateClickDamage();
        showDamagePopup(totalClickDamage);
        dragonHealth = Math.max(0, dragonHealth - totalClickDamage);
        gold += totalClickDamage;
        updateBoosts();
        updateHealthBar();
        if (dragonHealth === 0) nextDragon();
    }
}

function calculateClickDamage() {
    let totalClickDamage = baseClickDamage;
    Object.values(boostsPurchased).forEach((count, index) => {
        totalClickDamage += count * Object.values(boostDamage)[index];
    });
    if (Math.random() < 0.1) {
        totalClickDamage *= 2;
        showNotification("Coup critique !", "success");
    }
    return totalClickDamage;
}

// Mise à jour de la barre de santé du dragon
function updateHealthBar() {
    const healthPercentage = Math.round((dragonHealth / maxDragonHealth) * 100);
    const healthBarFill = document.getElementById("health-bar-fill");
    healthBarFill.style.width = `${healthPercentage}%`;
    healthBarFill.style.backgroundColor = `rgb(${255 - healthPercentage * 2.55}, ${healthPercentage * 2.55}, 0)`;
    document.getElementById("health-percentage").textContent = `${healthPercentage}%`;
}

// Récompense en or après avoir vaincu un dragon
function rewardGold() {
    const bonus = dragonLevel > 10 ? dragonLevel * 2 : 1;
    gold += Math.round((goldReward + dragonLevel * 100) * Math.log2(dragonLevel + 1) * bonus);
    updateBoosts();
}

// Calcul des dégâts automatiques
function calculateAutoClickDamage() {
    autoClick = Object.keys(boostsPurchased).reduce((acc, boostId) => {
        return acc + (boostsPurchased[boostId] * boostDamage[boostId]);
    }, 0);
}

// Dégâts automatiques par seconde
setInterval(() => {
    if (dragonHealth > 0) {
        dragonHealth = Math.max(0, dragonHealth - autoClick);
        updateHealthBar();
        if (dragonHealth === 0) nextDragon();
    }
}, 1000);

// Jouer le son
function playSound(soundId) {
    const sound = document.getElementById(soundId);
    sound.play();
}

// Initialisation du jeu
document.getElementById("dragon-image").addEventListener("click", clickDragon);
updateBoosts();
calculateAutoClickDamage();

// Sauvegarde du jeu
function saveGame() {
    const gameState = { gold, autoClick, dragonHealth, maxDragonHealth, dragonLevel, boostsPurchased };
    localStorage.setItem('dragonWarSave', JSON.stringify(gameState));
}

// Chargement du jeu
function loadGame() {
    const savedGame = JSON.parse(localStorage.getItem('dragonWarSave'));
    if (savedGame) {
        gold = savedGame.gold;
        autoClick = savedGame.autoClick;
        dragonHealth = savedGame.dragonHealth;
        maxDragonHealth = savedGame.maxDragonHealth;
        dragonLevel = savedGame.dragonLevel;
        Object.assign(boostsPurchased, savedGame.boostsPurchased);
        updateBoosts();
        calculateAutoClickDamage();
        updateHealthBar();
        showNotification("Partie sauvegardée chargée avec succès !");
    } else {
        showNotification("Aucune sauvegarde trouvée.", "error");
    }
}

// Sauvegarde du jeu avant fermeture de la fenêtre
window.addEventListener('beforeunload', saveGame);

// Chargement du jeu au démarrage
window.onload = loadGame;

function showNotification(message, type = "info") {
    const notificationElement = document.getElementById('notification');
    notificationElement.textContent = message;
    notificationElement.className = `notification ${type}`;
    notificationElement.style.display = 'block';
    setTimeout(() => {
        notificationElement.style.display = 'none';
    }, 2000);
}

function showDamagePopup(damage) {
    const popup = document.createElement("div");
    popup.className = "damage-popup";
    popup.textContent = `-${damage}`;
    const dragon = document.getElementById("dragon-image");
    const rect = dragon.getBoundingClientRect();
    popup.style.left = `${rect.left + Math.random() * rect.width}px`;
    popup.style.top = `${rect.top + Math.random() * rect.height}px`;
    document.body.appendChild(popup);
    setTimeout(() => popup.remove(), 600);
}

function nextDragon() {
    const dragonImage = document.getElementById("dragon-image");
    dragonImage.classList.add("dragon-defeated");
    playSound("dragon-defeat-sound");
    setTimeout(() => {
        dragonLevel++;
        maxDragonHealth = 500 * Math.pow(1.2, dragonLevel - 1);
        dragonHealth = maxDragonHealth;
        updateHealthBar();
        rewardGold();
        dragonImage.style.opacity = "0";
        setTimeout(() => {
            updateDragonAppearance();
            dragonImage.style.opacity = "1";
        }, 500);
        document.getElementById("dragon-level-value").textContent = dragonLevel;
        dragonImage.classList.remove("dragon-defeated");
        updateBoosts();
    }, 1000);
    checkAchievements();
    const playerName = prompt("Entrez votre nom pour enregistrer votre score");
    updateLeaderboard(playerName, dragonLevel);
    displayLeaderboard();
}

function animateBoost(boostId) {
    const boostElement = document.getElementById(`buy-${boostId}`);
    boostElement.classList.add("purchased");
    setTimeout(() => boostElement.classList.remove("purchased"), 500);
}

function updateDragonAppearance() {
    const dragonImage = document.getElementById("dragon-image");
    const healthRatio = dragonHealth / maxDragonHealth;
    dragonImage.style.filter = `brightness(${healthRatio})`;
}

function checkAchievements() {
    achievements.forEach(achievement => {
        if (!achievement.unlocked && achievement.condition()) {
            achievement.unlocked = true;
            showNotification(`Réalisé : ${achievement.name} - ${achievement.description}`);
            displayAchievement(achievement);
            playSound("achievement-sound");
        }
    });
}

function displayAchievement(achievement) {
    const achievementPopup = document.createElement('div');
    achievementPopup.className = 'achievement-popup';
    achievementPopup.textContent = `Réalisé : ${achievement.name}`;
    document.body.appendChild(achievementPopup);
    setTimeout(() => {
        achievementPopup.style.opacity = '0';
        setTimeout(() => achievementPopup.remove(), 500);
    }, 3000);
}

function updateLeaderboard(name, score) {
    if (typeof score === 'number' && score >= 0) {
        playerScores.push({ name, score });
        playerScores.sort((a, b) => b.score - a.score);
        if (playerScores.length > 10) playerScores.pop();
        localStorage.setItem('playerScores', JSON.stringify(playerScores));
    } else {
        showNotification("Score invalide. Impossible d'ajouter au classement.", "error");
    }
}

function displayLeaderboard() {
    const leaderboardElement = document.getElementById("leaderboard");
    leaderboardElement.innerHTML = "";
    playerScores.forEach((player, index) => {
        const playerElement = document.createElement("div");
        playerElement.textContent = `${index + 1}. ${player.name} - ${player.score} points`;
        leaderboardElement.appendChild(playerElement);
    });
}

function resetGame() {
    gold = 0;
    autoClick = 0;
    maxDragonHealth = 500;
    dragonHealth = maxDragonHealth;
    purchaseQuantity = 1;
    dragonLevel = 1;
    goldReward = 200;
    baseClickDamage = 1;
    Object.keys(boostsPurchased).forEach(key => boostsPurchased[key] = 0);
    boostCosts.Nid = 50;
    boostCosts.Grotte = 450;
    boostCosts.Feu = 4050;
    boostCosts.Tour = 36450;
    boostCosts.Volcan = 328050;
    updateBoosts();
    calculateAutoClickDamage();
    updateHealthBar();
    document.getElementById("dragon-level-value").textContent = dragonLevel;
    showNotification("Nouvelle partie commencée !");
}

function clearSave() {
    if (confirm("Êtes-vous sûr de vouloir supprimer votre sauvegarde ? Cette action est irréversible.")) {
        localStorage.removeItem('dragonWarSave');
        resetGame();
        showNotification("Votre sauvegarde a été supprimée. Nouvelle partie commencée !");
    }
}