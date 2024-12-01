let gold = 0;
let autoClick = 0; // D�g�ts automatiques par seconde
let maxDragonHealth = 500; // Points de vie max du dragon
let dragonHealth = 500; // Points de vie initial du dragon
let purchaseQuantity = 1; // Quantit� par d�faut pour l'achat
let dragonLevel = 1; // Niveau du dragon
let goldReward = 150; // R�compense d'or pour chaque dragon vaincu
let baseClickDamage = 1; // D�g�ts de base par clic

// Stockage des boosts achet�s
const boostsPurchased = {
    Nid: 0,
    Grotte: 0,
    Feu: 0,
    Tour: 0,
    Volcan: 0
};

// Co�t des boosts
const boostCosts = {
    Nid: 50,
    Grotte: 450,
    Feu: 4050,
    Tour: 36450,
    Volcan: 328050
};

// D�g�ts inflig�s par chaque boost
const boostDamage = {
    Nid: 1,
    Grotte: 3,
    Feu: 9,
    Tour: 27,
    Volcan: 81
};

// Mettre � jour l'affichage des boosts
function updateBoosts() {
    const goldValueElement = document.getElementById("gold-value");
    goldValueElement.textContent = gold;

Object.entries(boostsPurchased).forEach(([boostId, count]) => {
    const cost = boostCosts[boostId];
    const canAfford = gold >= cost * purchaseQuantity;

    document.getElementById(`buy-${boostId}`).disabled = !canAfford;
    document.querySelector(`#${boostId} .cost-value`).style.color = canAfford ? 'black' : 'red';
});


    // Mettre � jour les DPS (d�g�ts par seconde)
    document.getElementById("dps-value").textContent = autoClick;
}

// Fonction pour acheter un boost
function buyBoost(boostId) {
    const cost = boostCosts[boostId] * purchaseQuantity;

    if (gold >= cost) {
        boostsPurchased[boostId] += purchaseQuantity;
        gold -= cost;

        // Jouer un son d'achat r�ussi
        playPurchaseSound();

        // Augmenter le co�t du boost de mani�re personnalis�e
        boostCosts[boostId] = Math.round(boostCosts[boostId] * 1.15); // Facteur d'augmentation de 1.15

        document.getElementById(`${boostId}-count`).textContent = `x${boostsPurchased[boostId]}`;
        calculateAutoClickDamage();
        updateBoosts();
    } else {
        // Jouer un son d'erreur si le joueur n'a pas assez d'or
        playErrorSound();
        showNotification("Pas assez d'or pour acheter ce boost !");
    }
}


// D�finir la quantit� d'achat
function setQuantity(quantity) {
    purchaseQuantity = quantity;
    document.querySelectorAll(".quantity-button").forEach(btn => btn.classList.remove("active"));
    document.querySelector(`.quantity-button:nth-child(${quantity === 1 ? 1 : quantity === 10 ? 2 : 3})`).classList.add("active");
    updateBoosts();
}

// D�g�ts inflig�s par clic
function clickDragon() {
	
	const ClickSound = document.getElementById("click-sound");
    ClickSound.play();

    if (dragonHealth > 0) {
        let totalClickDamage = baseClickDamage;

        // Ajout des d�g�ts des boosts achet�s
        Object.keys(boostsPurchased).forEach(boostId => {
            totalClickDamage += boostsPurchased[boostId] * boostDamage[boostId];
        });

        // Coup critique (10% de chance)
        if (Math.random() < 0.1) {
            totalClickDamage *= 2; // Double les d�g�ts en cas de critique
            showNotification("Coup critique !", "success");
        }

        showDamagePopup(totalClickDamage);

        dragonHealth -= totalClickDamage;
        if (dragonHealth < 0) dragonHealth = 0;

        // Ajouter de l'or en fonction des d�g�ts inflig�s
        gold += totalClickDamage;
        updateBoosts();
        updateHealthBar();

        if (dragonHealth <= 0) {
            nextDragon();
        }
    }
}


// Mise � jour de la barre de sant� du dragon
function updateHealthBar() {
    const healthPercentage = Math.round((dragonHealth / maxDragonHealth) * 100);
    const healthBarFill = document.getElementById("health-bar-fill");

    // Couleur de la barre de vie (de vert � rouge)
    let red = Math.round((100 - healthPercentage) * 2.55);
    let green = Math.round(healthPercentage * 2.55);

    healthBarFill.style.width = `${healthPercentage}%`;
    healthBarFill.style.backgroundColor = `rgb(${red}, ${green}, 0)`;
    document.getElementById("health-percentage").textContent = `${healthPercentage}%`;
}


// R�compense en or apr�s avoir vaincu un dragon
function rewardGold() {
    const bonus = dragonLevel > 10 ? dragonLevel * 2 : 1; // Bonus pour les niveaux �lev�s
    gold += Math.round((goldReward + dragonLevel * 100) * Math.log2(dragonLevel + 1) * bonus);
    updateBoosts();
}



// Calcul des d�g�ts automatiques
function calculateAutoClickDamage() {
    autoClick = Object.keys(boostsPurchased).reduce((acc, boostId) => {
        return acc + (boostsPurchased[boostId] * boostDamage[boostId]);
    }, 0);
}

// D�g�ts automatiques par seconde
setInterval(() => {
    if (dragonHealth > 0) {
        dragonHealth -= autoClick;
        if (dragonHealth < 0) dragonHealth = 0;
        updateHealthBar();

        if (dragonHealth <= 0) {
            nextDragon();
        }
    }
}, 1000);

// Jouer le son d'achat
function playPurchaseSound() {
    const purchaseSound = document.getElementById("purchase-sound");
    purchaseSound.play();
}



// Initialisation du jeu
document.getElementById("dragon-image").addEventListener("click", clickDragon);
updateBoosts();
calculateAutoClickDamage();

if (dragonHealth < 0) dragonHealth = 0;


function saveGame() {
    const gameState = {
        gold,
        autoClick,
        dragonHealth,
        maxDragonHealth,
        dragonLevel,
        boostsPurchased
    };
    localStorage.setItem('dragonWarSave', JSON.stringify(gameState));
}

function loadGame() {
    if (typeof(Storage) !== "undefined") {
        const savedGame = JSON.parse(localStorage.getItem('dragonWarSave'));
        
        if (savedGame) {
            // Demander confirmation au joueur
            const wantsToLoad = confirm("Voulez-vous reprendre votre partie sauvegard�e ?");
            
            if (wantsToLoad) {
                // Charger la sauvegarde
                gold = savedGame.gold;
                autoClick = savedGame.autoClick;
                dragonHealth = savedGame.dragonHealth;
                maxDragonHealth = savedGame.maxDragonHealth;
                dragonLevel = savedGame.dragonLevel;
                Object.assign(boostsPurchased, savedGame.boostsPurchased);
                
                updateBoosts();
                calculateAutoClickDamage();
                updateHealthBar();
                showNotification("Partie sauvegard�e charg�e avec succ�s !");
            } else {
                // Ne pas charger la sauvegarde (d�marrer une nouvelle partie)
                localStorage.removeItem('dragonWarSave');
                resetGame();
                showNotification("Nouvelle partie commenc�e !");
            }
        }
    } else {
        showNotification("Votre navigateur ne supporte pas la sauvegarde automatique.", "error");
    }
}

// Sauvegarde du jeu avant fermeture de la fen�tre
window.addEventListener('beforeunload', (e) => {
    const confirmationMessage = "�tes-vous s�r de vouloir quitter ? Votre progression sera sauvegard�e automatiquement.";
    e.returnValue = confirmationMessage;
    return confirmationMessage;
});

// Chargement du jeu au d�marrage
window.onload = loadGame;





function preloadAudio(audioElementId) {
    const audio = document.getElementById(audioElementId);
    audio.load();
}

preloadAudio("click-sound");
preloadAudio("purchase-sound");
preloadAudio("dragon-defeat-sound");
preloadAudio("achievement-sound");
preloadAudio("error-sound")
preloadAudio("click-sound")
preloadAudio("click-X-boost")


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


function showDamagePopup(damage) {
    const popup = document.createElement("div");
    popup.className = "damage-popup";
    popup.textContent = `-${damage}`;

    // Positionner autour du dragon
    const dragon = document.getElementById("dragon-image");
    const rect = dragon.getBoundingClientRect();
    popup.style.position = "absolute";
    popup.style.left = `${rect.left + Math.random() * rect.width}px`;
    popup.style.top = `${rect.top + Math.random() * rect.height}px`;
    popup.style.color = "red";
    popup.style.fontSize = "18px";
    popup.style.fontWeight = "bold";
    popup.style.zIndex = "10";

    document.body.appendChild(popup);

    // Animation de rebond et variation de taille
    popup.style.transition = "all 0.5s ease-out";
    popup.style.transform = "translateY(-20px) scale(1.2)";
    setTimeout(() => {
        popup.style.transform = "translateY(-40px) scale(0.8)";
        popup.style.opacity = "0";
    }, 300);

    // Suppression apr�s animation
    setTimeout(() => popup.remove(), 600);
}




function nextDragon() {
    const dragonImage = document.getElementById("dragon-image");
    dragonImage.classList.add("dragon-defeated");

    const defeatSound = document.getElementById("dragon-defeat-sound");
    defeatSound.play();

    setTimeout(() => {
        dragonLevel++;
    maxDragonHealth = 500 * Math.pow(1.2, dragonLevel - 1); // augmenter la difficult�
    dragonHealth = maxDragonHealth;
    updateHealthBar();
    rewardGold();

        dragonImage.style.opacity = "0";
        setTimeout(() => {
            updateDragonAppearance();
            dragonImage.style.opacity = "1";
        }, 500);

        document.getElementById("health-bar-fill").style.width = '100%';
        document.getElementById("health-percentage").textContent = '100%';
        document.getElementById("health-bar-fill").style.backgroundColor = 'rgb(0, 255, 0)';

        document.getElementById("dragon-level-value").textContent = dragonLevel;
        rewardGold();

        dragonImage.classList.remove("dragon-defeated");
        updateBoosts();
    }, 1000);
	
checkAchievements();

    // Mettre � jour le classement apr�s avoir vaincu un dragon
    const playerName = prompt("Entrez votre nom pour enregistrer votre score");
    const playerScore = dragonLevel; // ou un autre crit�re comme l'or total
    updateLeaderboard(playerName, playerScore);

    // Afficher le classement
    displayLeaderboard();
}

function animateBoost(boostId) {
    const boostElement = document.getElementById(`buy-${boostId}`);
    boostElement.classList.add("purchased");

    // Ajouter une lueur
    boostElement.style.boxShadow = "0 0 15px rgba(255, 215, 0, 0.8)";
    setTimeout(() => {
        boostElement.style.boxShadow = "none";
    }, 500);

    // Particules anim�es
    for (let i = 0; i < 10; i++) {
        const particle = document.createElement("div");
        particle.className = "particle";
        particle.style.left = `${boostElement.offsetLeft + Math.random() * boostElement.offsetWidth}px`;
        particle.style.top = `${boostElement.offsetTop + Math.random() * boostElement.offsetHeight}px`;
        document.body.appendChild(particle);

        setTimeout(() => {
            particle.style.transition = "all 0.7s ease-out";
            particle.style.transform = `translateY(-100px) scale(0)`;
            particle.style.opacity = "0";
        }, 50);

        setTimeout(() => particle.remove(), 750);
    }

    setTimeout(() => boostElement.classList.remove("purchased"), 500);
}

// Inflammation des d�g�ts automatiques par seconde (existant d�j�)
setInterval(() => {
    if (dragonHealth > 0) {
        dragonHealth -= autoClick;
        if (dragonHealth < 0) dragonHealth = 0;
        updateHealthBar();

        if (dragonHealth <= 0) {
            nextDragon();
        }
    }
}, 1000);

function resetGame() {
    gold = 0;
    autoClick = 0;
    maxDragonHealth = 500;
    dragonHealth = maxDragonHealth;
    purchaseQuantity = 1;
    dragonLevel = 1;
    goldReward = 200;
    baseClickDamage = 1;

    // Remettre � z�ro les boosts achet�s
    Object.keys(boostsPurchased).forEach(key => boostsPurchased[key] = 0);
	
	

    // R�initialiser les co�ts des boosts
    boostCosts.Nid = 50;
    boostCosts.Grotte = 450;
    boostCosts.Feu = 4050;
    boostCosts.Tour = 36450;
    boostCosts.Volcan = 328050;

    // Mise � jour imm�diate de l'affichage des boosts
    updateBoosts();

    // Mise � jour de l'affichage du reste du jeu
    calculateAutoClickDamage();
    updateHealthBar();
    document.getElementById("dragon-level-value").textContent = dragonLevel;

    showNotification("Nouvelle partie commenc�e !");
}



function clearSave() {
    const confirmReset = confirm("�tes-vous s�r de vouloir supprimer votre sauvegarde ? Cette action est irr�versible.");
    if (confirmReset) {
        localStorage.removeItem('dragonWarSave');
        resetGame();  // Appeler la fonction pour r�initialiser les valeurs du jeu
        showNotification("Votre sauvegarde a �t� supprim�e. Nouvelle partie commenc�e !");
    }
}


// Liste des r�alisations
const achievements = [
    { id: 1, name: "Premi�re victoire", description: "Vaincre votre premier dragon", unlocked: false, condition: () => dragonLevel >= 1 },
    { id: 2, name: "Millionnaire", description: "Atteindre 1 000 000 d'or", unlocked: false, condition: () => gold >= 1000000 },
    { id: 3, name: "Roi des dragons", description: "Vaincre 10 dragons", unlocked: false, condition: () => dragonLevel >= 10 },
    { id: 4, name: "Damage Dealer", description: "Effectuer 1000 clic", unlocked: false, condition: () => dps >= 1000"}
    // Ajoutez d'autres r�alisations ici
];

// V�rifier si des r�alisations sont d�bloqu�es
function checkAchievements() {
    achievements.forEach(achievement => {
        if (!achievement.unlocked && achievement.condition()) {
            achievement.unlocked = true;
            showNotification(`R�alis� : ${achievement.name} - ${achievement.description}`);
            displayAchievement(achievement);

            // Jouer le son de r�ussite
            const achievementSound = document.getElementById("achievement-sound");
            achievementSound.play();
        }
    });
}

// Fonction pour afficher une r�alisation
function displayAchievement(achievement) {
    const achievementPopup = document.createElement('div');
    achievementPopup.className = 'achievement-popup';
    achievementPopup.textContent = `R�alis� : ${achievement.name}`;

    document.body.appendChild(achievementPopup);

    setTimeout(() => {
        achievementPopup.style.opacity = '0';
        setTimeout(() => achievementPopup.remove(), 500);
    }, 3000);
}


let playerScores = JSON.parse(localStorage.getItem('playerScores')) || [];

// Ajouter un nouveau score dans le classement
function updateLeaderboard(name, score) {
    if (typeof score === 'number' && score >= 0) {  // V�rification que le score est un nombre valide et non n�gatif
        playerScores.push({ name, score });
        playerScores.sort((a, b) => b.score - a.score); // Trier par score d�croissant
        if (playerScores.length > 10) playerScores.pop(); // Garder uniquement les 10 meilleurs
        localStorage.setItem('playerScores', JSON.stringify(playerScores));
    } else {
        showNotification("Score invalide. Impossible d'ajouter au classement.", "error");
    }
}


// Afficher le classement
function displayLeaderboard() {
    const leaderboardElement = document.getElementById("leaderboard");
    leaderboardElement.innerHTML = ""; // R�initialiser

    playerScores.forEach((player, index) => {
        const playerElement = document.createElement("div");
        playerElement.textContent = `${index + 1}. ${player.name} - ${player.score} points`;
        leaderboardElement.appendChild(playerElement);
    });
}

function toggleAchievements() {
    const achievementsSection = document.getElementById("achievements-section");
    if (achievementsSection.style.display === "none") {
        achievementsSection.style.display = "block";
        displayAchievements(); // Afficher les r�alisations
    } else {
        achievementsSection.style.display = "none";
    }
}

// Fonction pour afficher la liste des r�alisations
function displayAchievements() {
    const achievementsList = document.getElementById("achievements-list");
    achievementsList.innerHTML = ""; // Vider la liste avant de la remplir

    achievements.forEach(achievement => {
        const achievementItem = document.createElement("li");

        // Afficher l'achievement si d�bloqu�, sinon indiquer qu'elle est verrouill�e
        if (achievement.unlocked) {
            achievementItem.textContent = `${achievement.name} - ${achievement.description}`;
            achievementItem.style.color = "green"; // Couleur verte pour les d�bloqu�s
        } else {
            achievementItem.textContent = `${achievement.name} - ???`; // Masquer la description si non d�bloqu�
            achievementItem.style.color = "gray"; // Couleur grise pour les non d�bloqu�s
        }

        achievementsList.appendChild(achievementItem);
    });
}


function checkAchievements() {
    achievements.forEach(achievement => {
        if (!achievement.unlocked && achievement.condition()) {
            achievement.unlocked = true;
            showNotification(`R�alis� : ${achievement.name} - ${achievement.description}`);
            displayAchievement(achievement);
			const AchievementSound = document.getElementById("achievement-sound");
    AchievementSound.play();


            // Ajout d'un bonus lorsqu'un achievement est d�bloqu�
            if (achievement.id === 1) {
                gold += 1000; // Bonus d'or pour la premi�re r�alisation
                showNotification("Bonus : +1000 or pour la r�alisation !");
            } else if (achievement.id === 2) {
                autoClick += 10; // Bonus de DPS pour le deuxi�me achievement
                showNotification("Bonus : +10 DPS pour la r�alisation !");
            }
        }
    });
}

// Exemple de fonction pour afficher une notification
function showNotification(message) {
    const notificationElement = document.getElementById('notification');
    notificationElement.textContent = message;
    notificationElement.style.display = 'block';
    
    // Masquer la notification apr�s 2 secondes
    setTimeout(() => {
        notificationElement.style.display = 'none';
    }, 2000);
}

function deleteSave() {
    localStorage.removeItem('boostsPurchased');
    localStorage.removeItem('dragonLevel');
    localStorage.removeItem('gold');

    // R�initialiser les valeurs dans le jeu
    resetGame();

    showNotification("Sauvegarde supprim�e !");
}


function saveGame(data) {
    const dataString = JSON.stringify(data);
    const hash = btoa(dataString); // Cr�e un hash basique (base64)
    localStorage.setItem('gameData', dataString);
    localStorage.setItem('dataHash', hash);
}

function loadGame() {
    const savedData = localStorage.getItem('gameData');
    const savedHash = localStorage.getItem('dataHash');

    if (savedData && savedHash) {
        const currentHash = btoa(savedData);
        if (currentHash === savedHash) {
            return JSON.parse(savedData);
        } else {
            console.warn("Donn�es corrompues, chargement d'une sauvegarde par d�faut.");
        }
    }
    return getDefaultGameData(); // Fonction qui retourne un �tat initial
}


function showNotification(message, icon) {
    const notification = document.getElementById('notification');
    const notificationText = notification.querySelector('p');
    const notificationIcon = notification.querySelector('img');
    
    notificationText.textContent = message;
    if (icon) notificationIcon.src = icon;

    notification.classList.add('show');
    setTimeout(() => notification.classList.remove('show'), 3000);
}

// Exemple d'utilisation
showNotification("Boost achet� : +10 d�g�ts !", "boost-icon.png");


function animateBoost(boostElement) {
    boostElement.classList.add('purchased');
    setTimeout(() => boostElement.classList.remove('purchased'), 300);
}

// Exemple : Animation lorsqu'un boost est achet�
const boost = document.querySelector('.boost');
boost.addEventListener('click', () => {
    animateBoost(boost);
});

function calculateDragonHealth(level) {
    return Math.floor(150 * Math.pow(1.2, level - 1)); // Augmentation de 20% par niveau
}

// Exemple : Niveau 1 = 150, Niveau 2 = 180, Niveau 3 = 216, etc.


function updateLeaderboard(playerName, score) {
    if (playerName.trim() === '' || playerName.length > 20) {
        alert('Nom invalide');
        return;
    }
    // code pour mettre � jour le classement
}


function canAffordPurchase(price, quantity) {
    if (gold >= price * quantity) {
        return true;
    } else {
        alert("Or insuffisant !");
        return false;
    }
}


function animateDragonDamage(dragon) {
    dragon.style.transition = 'all 0.5s';
    dragon.style.filter = 'saturate(50%)'; // R�duit la saturation pour un effet visuel
}


function showTutorial() {
    if (!localStorage.getItem('tutorialSeen')) {
        alert("Bienvenue dans Dragon War ! Cliquez sur les dragons pour les tuer et gagner de l'or. Utilisez l'or pour am�liorer vos pouvoirs !");
        localStorage.setItem('tutorialSeen', 'true');
    }
}


function onPlayerAction() {
    updateGold(); // met � jour l'or
    checkAchievements(); // v�rifie les succ�s
    updateUI(); // met � jour les �l�ments visuels
}
// Appelle cette fonction apr�s chaque interaction du joueur.



let sounds = {};

function preloadAudio() {
    sounds.click = new Audio('click-sound.mp3');
    sounds.achievement = new Audio('achievement-sound.mp3');
    sounds.error = new Audio('error-sound.mp3');
}

// Pour jouer un son, utilise simplement :
function playSound(soundName) {
    if (sounds[soundName]) {
        sounds[soundName].currentTime = 0; // remet au d�but si d�j� jou�
        sounds[soundName].play();
    }
}


const maxPopups = 10;
const popupQueue = [];

function showDamagePopup(damage, x, y) {
    if (popupQueue.length >= maxPopups) {
        const oldPopup = popupQueue.shift(); // supprime le plus ancien
        oldPopup.remove(); // enl�ve du DOM
    }

    const popup = document.createElement('div');
    popup.className = 'damage-popup';
    popup.innerText = `-${damage}`;
    popup.style.left = `${x}px`;
    popup.style.top = `${y}px`;
    document.body.appendChild(popup);

    popupQueue.push(popup);

    setTimeout(() => {
        popup.remove(); // supprime apr�s animation
        popupQueue.shift();
    }, 1000); // dur�e de l'animation
}



function getPlayerName() {
    const name = prompt("Entrez votre nom :");
    return name && name.trim() !== "" ? name : "Joueur Anonyme";
}



function saveGame(data) {
    localStorage.setItem('gameSave', JSON.stringify(data));
}

function loadGame() {
    try {
        const data = JSON.parse(localStorage.getItem('gameSave'));
        if (data && typeof data === 'object') {
            return data;
        }
    } catch (e) {
        console.error("Donn�es corrompues, r�initialisation.");
    }
    return null; // donn�es invalides
}


function animateBoost(element, boostValue, duration = 1000) {
    element.innerText = `+${boostValue}`;
    element.style.transition = `opacity ${duration}ms`;
    element.style.opacity = 1;

    setTimeout(() => {
        element.style.opacity = 0;
    }, duration);
}


function buyBoost(boostPrice, quantity) {
    const totalCost = boostPrice * quantity;

    if (player.gold >= totalCost) {
        player.gold -= totalCost;
        player.boosts += quantity;
    } else {
        alert("Or insuffisant pour cet achat.");
    }
}


function updateGold(amount) {
    player.gold = Math.max(0, player.gold + amount); // emp�che l'or n�gatif
    updateUI();
}


function showInteractiveTutorial() {
    const steps = [
        "Cliquez sur le dragon pour infliger des d�g�ts.",
        "Utilisez l'or pour acheter des boosts dans la boutique.",
        "Progressez en battant des dragons de plus en plus forts !"
    ];

    let currentStep = 0;
    const tutorialBox = document.createElement('div');
    tutorialBox.id = 'tutorial-box';
    tutorialBox.textContent = steps[currentStep];
    document.body.appendChild(tutorialBox);

    const nextButton = document.createElement('button');
    nextButton.textContent = "Suivant";
    nextButton.onclick = () => {
        currentStep++;
        if (currentStep < steps.length) {
            tutorialBox.textContent = steps[currentStep];
        } else {
            tutorialBox.remove();
            localStorage.setItem('tutorialSeen', true);
        }
    };

    tutorialBox.appendChild(nextButton);
}


let lastClickTime = 0;
const minClickDelay = 50; // 20 clics/s max

function onDragonClick() {
    const now = Date.now();
    if (now - lastClickTime < minClickDelay) return;
    lastClickTime = now;
    // Logic des d�g�ts ici
}


function createDamagePopup(damage) {
    const popup = document.createElement("div");
    popup.textContent = `-${damage}`;
    popup.style.color = damage > 100 ? "red" : "white";
    popup.style.fontSize = `${Math.min(damage / 10, 30)}px`;
    // Animation CSS ici
    document.body.appendChild(popup);
}


const notificationQueue = [];

function showNextNotification() {
    if (notificationQueue.length === 0) return;
    const notification = notificationQueue.shift();
    // Afficher la notification
    setTimeout(showNextNotification, 2000);
}

function addNotification(message) {
    notificationQueue.push(message);
    if (notificationQueue.length === 1) showNextNotification();
}


localStorage.setItem("lastOnline", Date.now());


const lastOnline = localStorage.getItem("lastOnline");
if (lastOnline) {
    const elapsedTime = (Date.now() - lastOnline) / 1000;
    gold += dps * elapsedTime;
}



