/* =========================================================
   CELESTIA
   A COZY FANTASY WORLD
   MAP 01 — CLOUDHAVEN

   FULL GAME SCRIPT
   Movement + Camera + Interaction
   NPC Dialogue + Outfit + Save System
========================================================= */

"use strict";


/* =========================================================
   DOM
========================================================= */

const canvas = document.getElementById("world");
const ctx = canvas.getContext("2d");

const mini = document.getElementById("mini");
const mctx = mini.getContext("2d");

const outfitPanel = document.getElementById("outfitPanel");
const previewCharacter = document.getElementById("previewCharacter");

const interactBox = document.getElementById("interactBox");

const dialog = document.getElementById("dialog");
const dialogName = document.getElementById("dialogName");
const dialogText = document.getElementById("dialogText");

const toast = document.getElementById("toast");

const openOutfitButton = document.querySelector(".openOutfit");
const closeOutfitButton = document.querySelector(".closeOutfit");
const saveOutfitButton = document.querySelector(".saveOutfit");

const hairOptions = document.getElementById("hairOptions");
const dressOptions = document.getElementById("dressOptions");
const accessoryOptions = document.getElementById("accessoryOptions");


/* =========================================================
   CANVAS SIZE
========================================================= */

let W = window.innerWidth;
let H = window.innerHeight;

function resizeCanvas(){

    W = Math.max(320, window.innerWidth);
    H = Math.max(240, window.innerHeight);

    canvas.width = W;
    canvas.height = H;

    mini.width = 164;
    mini.height = 109;

    updateCamera();
}

window.addEventListener("resize", resizeCanvas);

resizeCanvas();


/* =========================================================
   WORLD
========================================================= */

const WORLD = {
    width: 3600,
    height: 2400
};


/* =========================================================
   GAME STATE
========================================================= */

const SAVE_KEY = "celestiaGameSave_v2";

const DEFAULT_STATE = {

    player: {
        x: 1800,
        y: 1420,
        direction: "down"
    },

    outfit: {
        hair: "brown",
        dress: "lavender",
        accessory: "flower"
    },

    day: 1,
    time: 10.4,

    isNight: false

};


/* =========================================================
   GAME STATE LOAD
========================================================= */

let gameState = loadGame();


function loadGame(){

    try{

        const saved = localStorage.getItem(SAVE_KEY);

        if(!saved){
            return structuredClone(DEFAULT_STATE);
        }

        const parsed = JSON.parse(saved);

        return {

            ...structuredClone(DEFAULT_STATE),

            ...parsed,

            player: {
                ...DEFAULT_STATE.player,
                ...(parsed.player || {})
            },

            outfit: {
                ...DEFAULT_STATE.outfit,
                ...(parsed.outfit || {})
            }

        };

    }catch(error){

        console.warn("CELESTIA save could not be loaded.", error);

        return structuredClone(DEFAULT_STATE);
    }

}


/* =========================================================
   SAVE GAME
========================================================= */

function saveGame(){

    try{

        localStorage.setItem(
            SAVE_KEY,
            JSON.stringify(gameState)
        );

    }catch(error){

        console.warn("CELESTIA save failed.", error);
    }

}


/* =========================================================
   PLAYER
========================================================= */

const player = {

    x: gameState.player.x,
    y: gameState.player.y,

    speed: 210,

    direction: gameState.player.direction || "down",

    moving: false,

    animationTime: 0,

    walkFrame: 0

};


/* =========================================================
   CAMERA
========================================================= */

const camera = {

    x: 0,
    y: 0,

    smoothing: 0.12

};


function clamp(value, min, max){

    return Math.max(
        min,
        Math.min(max, value)
    );

}


function updateCamera(){

    const targetX =
        player.x - W / 2;

    const targetY =
        player.y - H / 2;

    const maxX =
        Math.max(0, WORLD.width - W);

    const maxY =
        Math.max(0, WORLD.height - H);

    camera.x +=
        (clamp(targetX, 0, maxX) - camera.x)
        * camera.smoothing;

    camera.y +=
        (clamp(targetY, 0, maxY) - camera.y)
        * camera.smoothing;

}


function screenX(worldX){

    return worldX - camera.x;

}


function screenY(worldY){

    return worldY - camera.y;

}


/* =========================================================
   INPUT
========================================================= */

const keys = {};

window.addEventListener("keydown", event => {

    const key = event.key.toLowerCase();

    keys[key] = true;

    /*
       Prevent page scrolling with movement keys.
    */

    if(
        [
            "w",
            "a",
            "s",
            "d",
            "arrowup",
            "arrowdown",
            "arrowleft",
            "arrowright",
            " "
        ].includes(key)
    ){

        event.preventDefault();

    }

    /*
       O = Outfit
    */

    if(
        key === "o" &&
        !isTyping()
    ){

        toggleOutfit();

    }

    /*
       E = interact
    */

    if(
        key === "e" &&
        !isTyping()
    ){

        interact();

    }

    /*
       ESC = close
    */

    if(key === "escape"){

        if(
            dialog &&
            dialog.classList.contains("show")
        ){

            closeDialog();

        }

        else if(
            outfitPanel &&
            !outfitPanel.classList.contains("closed")
        ){

            toggleOutfit();

        }

    }

});


window.addEventListener("keyup", event => {

    keys[event.key.toLowerCase()] = false;

});


window.addEventListener("blur", () => {

    for(const key in keys){

        keys[key] = false;

    }

});


function isTyping(){

    const active =
        document.activeElement;

    if(!active) return false;

    return (
        active.tagName === "INPUT" ||
        active.tagName === "TEXTAREA"
    );

}


/* =========================================================
   RANDOM
========================================================= */

function rand(min, max){

    return Math.random() *
        (max - min) +
        min;

}


function randInt(min, max){

    return Math.floor(
        rand(min, max + 1)
    );

}


/* =========================================================
   DECORATION DATA
========================================================= */

const trees = [];
const flowers = [];
const clouds = [];
const sparkles = [];


/* =========================================================
   FIXED WORLD DECORATIONS
========================================================= */

function generateDecorations(){

    /*
       Trees
    */

    for(let i = 0; i < 125; i++){

        trees.push({

            x: rand(150, WORLD.width - 150),

            y: rand(180, WORLD.height - 150),

            size: rand(28, 54),

            variant: randInt(0, 2)

        });

    }


    /*
       Flowers
    */

    for(let i = 0; i < 190; i++){

        flowers.push({

            x: rand(100, WORLD.width - 100),

            y: rand(180, WORLD.height - 100),

            type: randInt(0, 3)

        });

    }


    /*
       Clouds
    */

    for(let i = 0; i < 28; i++){

        clouds.push({

            x: rand(-200, WORLD.width),

            y: rand(80, 720),

            size: rand(80, 210),

            speed: rand(8, 20)

        });

    }


    /*
       Sparkles
    */

    for(let i = 0; i < 80; i++){

        sparkles.push({

            x: rand(80, WORLD.width - 80),

            y: rand(80, WORLD.height - 80),

            size: rand(2, 6),

            phase: rand(0, Math.PI * 2)

        });

    }

}

generateDecorations();


/* =========================================================
   LANDMARKS
========================================================= */

const landmarks = [

    {
        x: 1800,
        y: 370,
        w: 600,
        h: 430,
        name: "Celestia Castle",
        type: "castle",
        icon: "🏰",
        dialogue:
            "The castle gates shimmer softly in the Cloudhaven sunlight."
    },

    {
        x: 700,
        y: 750,
        w: 750,
        h: 800,
        name: "Whispering Forest",
        type: "forest",
        icon: "🌲",
        dialogue:
            "You hear tiny whispers between the trees... the forest remembers everyone who visits."
    },

    {
        x: 1850,
        y: 1080,
        w: 500,
        h: 400,
        name: "Central Plaza",
        type: "plaza",
        icon: "⛲",
        dialogue:
            "Cloudhaven's Central Plaza is the heart of the island."
    },

    {
        x: 2700,
        y: 900,
        w: 720,
        h: 700,
        name: "Cloudhaven Village",
        type: "village",
        icon: "🏘️",
        dialogue:
            "Welcome to Cloudhaven Village! The little houses glow warmly beneath the clouds."
    },

    {
        x: 2860,
        y: 1750,
        w: 500,
        h: 400,
        name: "Your Home",
        type: "home",
        icon: "🏡",
        dialogue:
            "Your cozy home awaits. One day, you'll be able to decorate every little corner."
    },

    {
        x: 2050,
        y: 1900,
        w: 650,
        h: 300,
        name: "Pet Garden",
        type: "pet",
        icon: "🐇",
        dialogue:
            "The Pet Garden is full of tiny pawprints and magical flowers."
    },

    {
        x: 750,
        y: 1880,
        w: 600,
        h: 350,
        name: "Sky Dock",
        type: "dock",
        icon: "⛵",
        dialogue:
            "Floating ships come and go from the Sky Dock."
    },

    {
        x: 1750,
        y: 2210,
        w: 500,
        h: 180,
        name: "Starfall Bridge",
        type: "bridge",
        icon: "🌉",
        dialogue:
            "Starfall Bridge leads toward the quieter side of Cloudhaven."
    }

];


/* =========================================================
   HOUSES
========================================================= */

const houses = [

    {
        x: 2780,
        y: 980,
        color: "#8e72b9"
    },

    {
        x: 3060,
        y: 1050,
        color: "#d184a9"
    },

    {
        x: 3300,
        y: 950,
        color: "#6d91bb"
    },

    {
        x: 2860,
        y: 1760,
        color: "#7865a9"
    }

];


/* =========================================================
   FRIENDS / PLAYERS
========================================================= */

const players = [

    {
        x: 1600,
        y: 1250,
        name: "Luna",
        color: "#d6a5eb",
        icon: "⭐",
        dialogue:
            "Hey Eunseorin! Cloudhaven is so pretty today, isn't it?"
    },

    {
        x: 2050,
        y: 1310,
        name: "Alya",
        color: "#f0b0d1",
        icon: "⭐",
        dialogue:
            "I heard there are secret places hidden somewhere in the forest..."
    },

    {
        x: 2200,
        y: 1480,
        name: "Mika",
        color: "#9dc4e9",
        icon: "⭐",
        dialogue:
            "Let's explore Cloudhaven together someday!"
    }

];


/* =========================================================
   INTERACTION
========================================================= */

let nearbyObject = null;

const INTERACT_DISTANCE = 105;


/* =========================================================
   DISTANCE
========================================================= */

function distance(x1, y1, x2, y2){

    return Math.hypot(
        x2 - x1,
        y2 - y1
    );

}


/* =========================================================
   GET NEAREST INTERACTION
========================================================= */

function getNearbyObject(){

    let closest = null;
    let closestDistance = Infinity;


    /*
       Players
    */

    for(const friend of players){

        const d =
            distance(
                player.x,
                player.y,
                friend.x,
                friend.y
            );

        if(
            d < INTERACT_DISTANCE &&
            d < closestDistance
        ){

            closestDistance = d;

            closest = {

                kind: "player",

                data: friend,

                distance: d

            };

        }

    }


    /*
       Landmarks
    */

    for(const landmark of landmarks){

        const centerX =
            landmark.x +
            landmark.w / 2;

        const centerY =
            landmark.y +
            landmark.h / 2;

        const d =
            distance(
                player.x,
                player.y,
                centerX,
                centerY
            );

        const interactionDistance =
            Math.max(
                INTERACT_DISTANCE,
                Math.min(
                    landmark.w,
                    landmark.h
                ) * 0.32
            );

        if(
            d < interactionDistance &&
            d < closestDistance
        ){

            closestDistance = d;

            closest = {

                kind: "landmark",

                data: landmark,

                distance: d

            };

        }

    }


    return closest;

}


/* =========================================================
   UPDATE INTERACTION UI
========================================================= */

function updateInteraction(){

    nearbyObject = getNearbyObject();

    if(!interactBox) return;


    if(!nearbyObject){

        interactBox.classList.remove("show");

        return;
    }


    let label = "Interact";


    if(
        nearbyObject.kind === "player"
    ){

        label =
            `Talk to ${nearbyObject.data.name}`;

    }

    else if(
        nearbyObject.kind === "landmark"
    ){

        label =
            `Explore ${nearbyObject.data.name}`;

    }


    interactBox.innerHTML =
        `<b>E</b> ${label}`;

    interactBox.classList.add("show");

}


/* =========================================================
   INTERACT
========================================================= */

function interact(){

    /*
       If dialog is already open,
       E closes it.
    */

    if(
        dialog &&
        dialog.classList.contains("show")
    ){

        closeDialog();

        return;

    }


    if(!nearbyObject){

        showToast(
            "✨ Nothing nearby to interact with."
        );

        return;

    }


    if(
        nearbyObject.kind === "player"
    ){

        const friend =
            nearbyObject.data;

        openDialog(
            friend.name,
            friend.dialogue
        );

        return;

    }


    if(
        nearbyObject.kind === "landmark"
    ){

        const landmark =
            nearbyObject.data;

        openDialog(
            `${landmark.icon} ${landmark.name}`,
            landmark.dialogue
        );

    }

}


/* =========================================================
   DIALOG
========================================================= */

function openDialog(name, text){

    if(!dialog) return;

    dialogName.textContent = name;

    dialogText.textContent = text;

    dialog.classList.add("show");

}


function closeDialog(){

    if(!dialog) return;

    dialog.classList.remove("show");

}


/* =========================================================
   TOAST
========================================================= */

let toastTimer = null;


function showToast(message){

    if(!toast) return;

    toast.textContent = message;

    toast.classList.add("show");


    clearTimeout(toastTimer);


    toastTimer = setTimeout(() => {

        toast.classList.remove("show");

    }, 2600);

}


/* =========================================================
   COLLISION
========================================================= */

function circleRectCollision(
    cx,
    cy,
    radius,
    rect
){

    const nearestX =
        clamp(
            cx,
            rect.x,
            rect.x + rect.w
        );

    const nearestY =
        clamp(
            cy,
            rect.y,
            rect.y + rect.h
        );

    const dx =
        cx - nearestX;

    const dy =
        cy - nearestY;

    return (
        dx * dx +
        dy * dy
    ) < radius * radius;

}


/* =========================================================
   MOVEMENT COLLISION
========================================================= */

function blocked(x, y){

    const radius = 20;


    /*
       World boundaries
    */

    if(
        x < radius + 40 ||
        y < radius + 70 ||
        x > WORLD.width - radius - 40 ||
        y > WORLD.height - radius - 40
    ){

        return true;

    }


    /*
       Important landmarks
    */

    for(const landmark of landmarks){

        /*
           Don't block the paths through
           the plaza/bridge.
        */

        if(
            landmark.type === "plaza" ||
            landmark.type === "bridge"
        ){

            continue;

        }


        const rect = {

            x:
                landmark.x + 55,

            y:
                landmark.y + 55,

            w:
                Math.max(
                    40,
                    landmark.w - 110
                ),

            h:
                Math.max(
                    40,
                    landmark.h - 110
                )

        };


        if(
            circleRectCollision(
                x,
                y,
                radius,
                rect
            )
        ){

            return true;

        }

    }


    /*
       Houses
    */

    for(const house of houses){

        const rect = {

            x: house.x - 60,

            y: house.y - 55,

            w: 120,

            h: 105

        };


        if(
            circleRectCollision(
                x,
                y,
                radius,
                rect
            )
        ){

            return true;

        }

    }


    return false;

}


/* =========================================================
   UPDATE MOVEMENT
========================================================= */

function updateMovement(delta){

    let dx = 0;
    let dy = 0;


    if(
        keys["w"] ||
        keys["arrowup"]
    ){

        dy -= 1;

    }


    if(
        keys["s"] ||
        keys["arrowdown"]
    ){

        dy += 1;

    }


    if(
        keys["a"] ||
        keys["arrowleft"]
    ){

        dx -= 1;

    }


    if(
        keys["d"] ||
        keys["arrowright"]
    ){

        dx += 1;

    }


    player.moving =
        dx !== 0 ||
        dy !== 0;


    if(!player.moving){

        player.animationTime = 0;

        return;

    }


    /*
       Normalize diagonal movement.
    */

    const length =
        Math.hypot(dx, dy);

    dx /= length;
    dy /= length;


    /*
       Direction
    */

    if(
        Math.abs(dx) >
        Math.abs(dy)
    ){

        player.direction =
            dx > 0
                ? "right"
                : "left";

    }

    else{

        player.direction =
            dy > 0
                ? "down"
                : "up";

    }


    /*
       Delta time movement
    */

    const movement =
        player.speed * delta;


    const nextX =
        player.x +
        dx * movement;

    const nextY =
        player.y +
        dy * movement;


    /*
       X movement
    */

    if(
        !blocked(
            nextX,
            player.y
        )
    ){

        player.x = nextX;

    }


    /*
       Y movement
    */

    if(
        !blocked(
            player.x,
            nextY
        )
    ){

        player.y = nextY;

    }


    /*
       Walking animation
    */

    player.animationTime += delta;

    if(
        player.animationTime >
        0.11
    ){

        player.animationTime = 0;

        player.walkFrame =
            (player.walkFrame + 1) % 4;

    }


    /*
       Save position
    */

    gameState.player.x =
        player.x;

    gameState.player.y =
        player.y;

    gameState.player.direction =
        player.direction;

}


/* =========================================================
   UPDATE CLOUDS
========================================================= */

function updateClouds(delta){

    for(const cloud of clouds){

        cloud.x +=
            cloud.speed * delta;

        if(
            cloud.x >
            WORLD.width + 300
        ){

            cloud.x = -300;

        }

    }

}


/* =========================================================
   BACKGROUND
========================================================= */

function drawBackground(){

    const gradient =
        ctx.createLinearGradient(
            0,
            0,
            0,
            H
        );


    if(gameState.isNight){

        gradient.addColorStop(
            0,
            "#312a55"
        );

        gradient.addColorStop(
            0.55,
            "#65557f"
        );

        gradient.addColorStop(
            1,
            "#9b82a6"
        );

    }

    else{

        gradient.addColorStop(
            0,
            "#78a9c7"
        );

        gradient.addColorStop(
            0.55,
            "#a9cde0"
        );

        gradient.addColorStop(
            1,
            "#d9c4e6"
        );

    }


    ctx.fillStyle =
        gradient;

    ctx.fillRect(
        0,
        0,
        W,
        H
    );

}


/* =========================================================
   SUN / MOON
========================================================= */

function drawCelestial(){

    const x = W * 0.82;
    const y = 110;

    ctx.save();

    if(gameState.isNight){

        ctx.fillStyle =
            "rgba(255,244,190,.95)";

        ctx.shadowColor =
            "rgba(255,240,190,.55)";

        ctx.shadowBlur = 30;

        ctx.beginPath();

        ctx.arc(
            x,
            y,
            27,
            0,
            Math.PI * 2
        );

        ctx.fill();

    }

    else{

        ctx.fillStyle =
            "rgba(255,230,150,.95)";

        ctx.shadowColor =
            "rgba(255,225,150,.55)";

        ctx.shadowBlur = 40;

        ctx.beginPath();

        ctx.arc(
            x,
            y,
            35,
            0,
            Math.PI * 2
        );

        ctx.fill();

    }

    ctx.restore();

}


/* =========================================================
   CLOUDS
========================================================= */

function drawClouds(){

    for(const cloud of clouds){

        const x =
            screenX(cloud.x);

        const y =
            screenY(cloud.y);


        if(
            x < -350 ||
            x > W + 350
        ){

            continue;

        }


        ctx.save();

        ctx.fillStyle =
            gameState.isNight
                ? "rgba(220,214,245,.18)"
                : "rgba(255,247,251,.75)";

        ctx.beginPath();

        ctx.arc(
            x,
            y,
            cloud.size * 0.28,
            0,
            Math.PI * 2
        );

        ctx.arc(
            x + cloud.size * 0.28,
            y - 15,
            cloud.size * 0.32,
            0,
            Math.PI * 2
        );

        ctx.arc(
            x + cloud.size * 0.55,
            y,
            cloud.size * 0.35,
            0,
            Math.PI * 2
        );

        ctx.fill();

        ctx.restore();

    }

}


/* =========================================================
   FLOATING ISLAND
========================================================= */

function drawIsland(){

    const x =
        screenX(1800);

    const y =
        screenY(1200);


    ctx.save();


    /*
       Shadow / underside
    */

    ctx.fillStyle =
        "#584362";

    ctx.beginPath();

    ctx.moveTo(
        x - 1710,
        y - 1010
    );

    ctx.lineTo(
        x + 1660,
        y - 1010
    );

    ctx.lineTo(
        x + 1760,
        y + 850
    );

    ctx.lineTo(
        x + 1280,
        y + 1100
    );

    ctx.lineTo(
        x - 1200,
        y + 1110
    );

    ctx.lineTo(
        x - 1760,
        y + 850
    );

    ctx.closePath();

    ctx.fill();


    /*
       Grass top
    */

    ctx.fillStyle =
        "#78a66e";

    ctx.beginPath();

    ctx.roundRect(
        x - 1720,
        y - 1080,
        3440,
        1920,
        80
    );

    ctx.fill();


    /*
       Grass patches
       FIXED — not random every frame
    */

    for(
        let i = 0;
        i < 35;
        i++
    ){

        const px =
            x - 1650 +
            ((i * 283) % 3300);

        const py =
            y - 980 +
            ((i * 173) % 1700);

        ctx.fillStyle =
            i % 2 === 0
                ? "#92bc79"
                : "#87b574";

        ctx.fillRect(
            px,
            py,
            50 + (i % 4) * 12,
            12 + (i % 3) * 4
        );

    }


    ctx.restore();

}


/* =========================================================
   PATHS
========================================================= */

function drawPaths(){

    ctx.save();

    ctx.fillStyle =
        "#d9c6a8";


    /*
       Castle path
    */

    ctx.fillRect(
        screenX(1750),
        screenY(700),
        100,
        850
    );


    /*
       Village path
    */

    ctx.fillRect(
        screenX(1850),
        screenY(1200),
        1150,
        90
    );


    /*
       Home path
    */

    ctx.fillRect(
        screenX(2350),
        screenY(1300),
        650,
        75
    );


    /*
       Forest path
    */

    ctx.fillRect(
        screenX(1250),
        screenY(1350),
        700,
        75
    );


    /*
       Dock path
    */

    ctx.fillRect(
        screenX(1050),
        screenY(1400),
        100,
        550
    );


    /*
       Bridge path
    */

    ctx.fillRect(
        screenX(1750),
        screenY(1450),
        90,
        800
    );


    ctx.restore();

}


/* =========================================================
   DRAW WATER
========================================================= */

function drawWater(){

    ctx.save();

    const waterX =
        screenX(850);

    const waterY =
        screenY(500);


    ctx.fillStyle =
        "rgba(126,190,220,.55)";


    ctx.beginPath();

    ctx.roundRect(
        waterX,
        waterY,
        520,
        170,
        70
    );

    ctx.fill();


    /*
       little water lines
    */

    ctx.strokeStyle =
        "rgba(255,255,255,.3)";

    ctx.lineWidth = 3;


    for(let i = 0; i < 5; i++){

        ctx.beginPath();

        ctx.moveTo(
            waterX + 50,
            waterY + 30 + i * 27
        );

        ctx.lineTo(
            waterX + 190,
            waterY + 30 + i * 27
        );

        ctx.stroke();

    }


    ctx.restore();

}


/* =========================================================
   FLOWERS
========================================================= */

function drawFlowers(){

    for(const flower of flowers){

        const x =
            screenX(flower.x);

        const y =
            screenY(flower.y);


        if(
            x < -20 ||
            x > W + 20 ||
            y < -20 ||
            y > H + 20
        ){

            continue;

        }


        ctx.save();

        const petals = [
            "#f5b9d7",
            "#d8c2f1",
            "#f7df9d",
            "#b8d9e8"
        ];

        ctx.fillStyle =
            petals[flower.type];


        ctx.beginPath();

        ctx.arc(
            x - 4,
            y,
            3,
            0,
            Math.PI * 2
        );

        ctx.arc(
            x + 4,
            y,
            3,
            0,
            Math.PI * 2
        );

        ctx.arc(
            x,
            y - 4,
            3,
            0,
            Math.PI * 2
        );

        ctx.arc(
            x,
            y + 4,
            3,
            0,
            Math.PI * 2
        );

        ctx.fill();


        ctx.fillStyle =
            "#f4d889";

        ctx.beginPath();

        ctx.arc(
            x,
            y,
            2.2,
            0,
            Math.PI * 2
        );

        ctx.fill();


        ctx.restore();

    }

}


/* =========================================================
   TREES
========================================================= */

function drawTrees(){

    for(const tree of trees){

        const x =
            screenX(tree.x);

        const y =
            screenY(tree.y);


        if(
            x < -100 ||
            x > W + 100 ||
            y < -120 ||
            y > H + 120
        ){

            continue;

        }


        ctx.save();


        /*
           Shadow
        */

        ctx.fillStyle =
            "rgba(50,45,55,.14)";

        ctx.beginPath();

        ctx.ellipse(
            x,
            y + tree.size * .5,
            tree.size * .75,
            tree.size * .22,
            0,
            0,
            Math.PI * 2
        );

        ctx.fill();


        /*
           Trunk
        */

        ctx.fillStyle =
            "#8a624f";

        ctx.fillRect(
            x - 5,
            y - 2,
            10,
            tree.size * .8
        );


        /*
           Leaves
        */

        const leafColors = [
            "#79aa73",
            "#88b67d",
            "#6e9d6a"
        ];


        ctx.fillStyle =
            leafColors[tree.variant];


        ctx.beginPath();

        ctx.arc(
            x,
            y - tree.size * .35,
            tree.size * .65,
            0,
            Math.PI * 2
        );

        ctx.arc(
            x - tree.size * .35,
            y - tree.size * .1,
            tree.size * .45,
            0,
            Math.PI * 2
        );

        ctx.arc(
            x + tree.size * .35,
            y - tree.size * .1,
            tree.size * .45,
            0,
            Math.PI * 2
        );

        ctx.fill();


        ctx.restore();

    }

}


/* =========================================================
   HOUSES
========================================================= */

function drawHouses(){

    for(const house of houses){

        const x =
            screenX(house.x);

        const y =
            screenY(house.y);


        /*
           Shadow
        */

        ctx.fillStyle =
            "rgba(40,30,50,.15)";

        ctx.beginPath();

        ctx.ellipse(
            x,
            y + 60,
            78,
            18,
            0,
            0,
            Math.PI * 2
        );

        ctx.fill();


        /*
           House body
        */

        ctx.fillStyle =
            "#fff0df";

        ctx.fillRect(
            x - 58,
            y - 15,
            116,
            76
        );


        /*
           Roof
        */

        ctx.fillStyle =
            house.color;

        ctx.beginPath();

        ctx.moveTo(
            x - 72,
            y - 15
        );

        ctx.lineTo(
            x,
            y - 70
        );

        ctx.lineTo(
            x + 72,
            y - 15
        );

        ctx.closePath();

        ctx.fill();


        /*
           Door
        */

        ctx.fillStyle =
            "#70526c";

        ctx.fillRect(
            x - 12,
            y + 18,
            24,
            43
        );


        /*
           Window
        */

        ctx.fillStyle =
            "#a9d8e8";

        ctx.fillRect(
            x - 43,
            y + 2,
            22,
            22
        );

        ctx.fillRect(
            x + 21,
            y + 2,
            22,
            22
        );

    }

}


/* =========================================================
   LANDMARKS
========================================================= */

function drawLandmarks(){

    for(const landmark of landmarks){

        const x =
            screenX(
                landmark.x +
                landmark.w / 2
            );

        const y =
            screenY(
                landmark.y +
                landmark.h / 2
            );


        /*
           Only draw custom marker,
           not full rectangle walls.
        */

        drawLandmarkIcon(
            x,
            y,
            landmark
        );

    }

}


/* =========================================================
   LANDMARK ICON
========================================================= */

function drawLandmarkIcon(
    x,
    y,
    landmark
){

    ctx.save();

    ctx.textAlign =
        "center";

    ctx.textBaseline =
        "middle";


    let size = 50;


    switch(landmark.type){

        case "castle":
            size = 90;
            break;

        case "forest":
            size = 65;
            break;

        case "village":
            size = 65;
            break;

        case "home":
            size = 60;
            break;

        case "pet":
            size = 52;
            break;

        case "dock":
            size = 58;
            break;

        case "bridge":
            size = 50;
            break;

        default:
            size = 50;

    }


    /*
       soft shadow
    */

    ctx.fillStyle =
        "rgba(40,30,50,.15)";

    ctx.beginPath();

    ctx.ellipse(
        x,
        y + size * .5,
        size,
        size * .23,
        0,
        0,
        Math.PI * 2
    );

    ctx.fill();


    /*
       Icon
    */

    ctx.font =
        `${size}px "Segoe UI Emoji", sans-serif`;

    ctx.fillText(
        landmark.icon,
        x,
        y
    );


    /*
       Name
    */

    ctx.font =
        "700 13px DM Sans, sans-serif";

    ctx.fillStyle =
        "rgba(55,42,72,.78)";

    ctx.fillText(
        landmark.name,
        x,
        y + size * .7
    );


    ctx.restore();

}


/* =========================================================
   PLAYERS
========================================================= */

function drawPlayers(){

    for(const friend of players){

        const x =
            screenX(friend.x);

        const y =
            screenY(friend.y);


        if(
            x < -80 ||
            x > W + 80 ||
            y < -100 ||
            y > H + 100
        ){

            continue;

        }


        ctx.save();


        /*
           Shadow
        */

        ctx.fillStyle =
            "rgba(40,30,50,.16)";

        ctx.beginPath();

        ctx.ellipse(
            x,
            y + 25,
            23,
            8,
            0,
            0,
            Math.PI * 2
        );

        ctx.fill();


        /*
           Body
        */

        ctx.fillStyle =
            friend.color;

        ctx.beginPath();

        ctx.arc(
            x,
            y + 4,
            17,
            0,
            Math.PI * 2
        );

        ctx.fill();


        /*
           Head
        */

        ctx.fillStyle =
            "#f7d5bd";

        ctx.beginPath();

        ctx.arc(
            x,
            y - 13,
            11,
            0,
            Math.PI * 2
        );

        ctx.fill();


        /*
           Hair
        */

        ctx.fillStyle =
            "#754f4d";

        ctx.beginPath();

        ctx.arc(
            x,
            y - 17,
            12,
            Math.PI,
            Math.PI * 2
        );

        ctx.fill();


        /*
           Player icon
        */

        ctx.font =
            "16px sans-serif";

        ctx.textAlign =
            "center";

        ctx.fillText(
            friend.icon,
            x,
            y - 35
        );


        /*
           Name
        */

        ctx.font =
            "700 10px DM Sans, sans-serif";

        ctx.fillStyle =
            "#fff";

        ctx.shadowColor =
            "rgba(40,20,50,.5)";

        ctx.shadowBlur = 4;

        ctx.fillText(
            friend.name,
            x,
            y + 42
        );


        ctx.restore();

    }

}


/* =========================================================
   OUTFIT SYSTEM
========================================================= */

const outfit = {

    hair:
        gameState.outfit.hair || "brown",

    dress:
        gameState.outfit.dress || "lavender",

    accessory:
        gameState.outfit.accessory || "flower"

};


/* =========================================================
   OUTFIT DATA
========================================================= */

const outfitData = {

    hair: {

        brown: {
            color: "#704b42"
        },

        black: {
            color: "#292530"
        },

        purple: {
            color: "#745184"
        },

        pink: {
            color: "#d58cae"
        }

    },


    dress: {

        lavender: {
            color: "#b9a1df"
        },

        pink: {
            color: "#efaed0"
        },

        blue: {
            color: "#a9cde6"
        },

        cream: {
            color: "#f5e5c7"
        }

    },


    accessory: {

        flower: {
            icon: "🌸"
        },

        bow: {
            icon: "🎀"
        },

        crown: {
            icon: "👑"
        },

        star: {
            icon: "⭐"
        }

    }

};


/* =========================================================
   OUTFIT OPTIONS
========================================================= */

function setupOutfitOptions(){

    setupOptionGroup(
        hairOptions,
        "hair"
    );

    setupOptionGroup(
        dressOptions,
        "dress"
    );

    setupOptionGroup(
        accessoryOptions,
        "accessory"
    );

}


function setupOptionGroup(
    container,
    type
){

    if(!container) return;


    const buttons =
        container.querySelectorAll(
            ".option"
        );


    buttons.forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const value =
                    button.dataset.value;

                if(!value) return;

                outfit[type] =
                    value;

                gameState.outfit[type] =
                    value;

                updateOutfitButtons();

                updatePreview();

            }
        );

    });

}


/* =========================================================
   UPDATE OUTFIT BUTTONS
========================================================= */

function updateOutfitButtons(){

    updateGroupActive(
        hairOptions,
        outfit.hair
    );

    updateGroupActive(
        dressOptions,
        outfit.dress
    );

    updateGroupActive(
        accessoryOptions,
        outfit.accessory
    );

}


function updateGroupActive(
    container,
    value
){

    if(!container) return;


    container
        .querySelectorAll(".option")
        .forEach(button => {

            button.classList.toggle(
                "active",
                button.dataset.value === value
            );

        });

}


/* =========================================================
   CHARACTER PREVIEW
========================================================= */

function updatePreview(){

    if(!previewCharacter) return;


    /*
       We build a small chibi
       using HTML characters.

       Later this can be replaced
       with the real pixel sprite.
    */

    const hair =
        outfitData.hair[
            outfit.hair
        ];


    const dress =
        outfitData.dress[
            outfit.dress
        ];


    const accessory =
        outfitData.accessory[
            outfit.accessory
        ];


    previewCharacter.innerHTML = `

        <div
            style="
                position:relative;
                width:70px;
                height:110px;
            "
        >

            <!-- accessory -->

            <div
                style="
                    position:absolute;
                    top:-14px;
                    left:50%;
                    transform:translateX(-50%);
                    font-size:18px;
                    z-index:5;
                "
            >
                ${accessory.icon}
            </div>


            <!-- hair -->

            <div
                style="
                    position:absolute;
                    top:10px;
                    left:50%;
                    transform:translateX(-50%);
                    width:55px;
                    height:60px;
                    border-radius:50% 50% 45% 45%;
                    background:${hair.color};
                    z-index:1;
                "
            ></div>


            <!-- face -->

            <div
                style="
                    position:absolute;
                    top:18px;
                    left:50%;
                    transform:translateX(-50%);
                    width:39px;
                    height:39px;
                    border-radius:50%;
                    background:#f6d2ba;
                    z-index:2;
                    box-shadow:
                        inset 0 -2px 0 rgba(100,50,50,.05);
                "
            >

                <span
                    style="
                        position:absolute;
                        left:8px;
                        top:17px;
                        font-size:7px;
                    "
                >●</span>

                <span
                    style="
                        position:absolute;
                        right:8px;
                        top:17px;
                        font-size:7px;
                    "
                >●</span>

            </div>


            <!-- dress -->

            <div
                style="
                    position:absolute;
                    top:53px;
                    left:50%;
                    transform:translateX(-50%);
                    width:55px;
                    height:52px;
                    border-radius:18px 18px 10px 10px;
                    background:${dress.color};
                    z-index:2;
                    box-shadow:
                        inset 0 -5px 0 rgba(90,60,100,.08);
                "
            ></div>


            <!-- arms -->

            <div
                style="
                    position:absolute;
                    top:61px;
                    left:2px;
                    width:14px;
                    height:30px;
                    border-radius:10px;
                    background:#f6d2ba;
                    transform:rotate(12deg);
                    z-index:1;
                "
            ></div>

            <div
                style="
                    position:absolute;
                    top:61px;
                    right:2px;
                    width:14px;
                    height:30px;
                    border-radius:10px;
                    background:#f6d2ba;
                    transform:rotate(-12deg);
                    z-index:1;
                "
            ></div>


            <!-- shoes -->

            <div
                style="
                    position:absolute;
                    bottom:0;
                    left:15px;
                    width:16px;
                    height:10px;
                    border-radius:8px;
                    background:#725873;
                "
            ></div>

            <div
                style="
                    position:absolute;
                    bottom:0;
                    right:15px;
                    width:16px;
                    height:10px;
                    border-radius:8px;
                    background:#725873;
                "
            ></div>

        </div>

    `;

}


/* =========================================================
   SAVE OUTFIT
========================================================= */

function saveOutfit(){

    gameState.outfit = {

        hair:
            outfit.hair,

        dress:
            outfit.dress,

        accessory:
            outfit.accessory

    };


    gameState.player = {

        x: player.x,

        y: player.y,

        direction:
            player.direction

    };


    saveGame();


    showToast(
        "✨ Eunseorin's outfit has been saved!"
    );

}


/* =========================================================
   OUTFIT PANEL
========================================================= */

function toggleOutfit(){

    if(!outfitPanel) return;


    outfitPanel.classList.toggle(
        "closed"
    );


    const isClosed =
        outfitPanel.classList.contains(
            "closed"
        );


    if(openOutfitButton){

        openOutfitButton.style.display =
            isClosed
                ? "block"
                : "none";

    }

}


/* =========================================================
   INITIAL OUTFIT STATE
========================================================= */

function initializeOutfit(){

    updateOutfitButtons();

    updatePreview();


    /*
       If outfit panel doesn't have
       "closed", close it first.
    */

    if(outfitPanel){

        if(
            !outfitPanel.classList.contains(
                "closed"
            )
        ){

            outfitPanel.classList.add(
                "closed"
            );

        }

    }


    if(openOutfitButton){

        openOutfitButton.style.display =
            "block";

    }

}


setupOutfitOptions();

initializeOutfit();


/* =========================================================
   BUTTON EVENTS
========================================================= */

if(saveOutfitButton){

    /*
       HTML currently uses onclick,
       but this is safe too.
    */

    saveOutfitButton.addEventListener(
        "click",
        saveOutfit
    );

}


if(closeOutfitButton){

    closeOutfitButton.addEventListener(
        "click",
        toggleOutfit
    );

}


if(openOutfitButton){

    openOutfitButton.addEventListener(
        "click",
        toggleOutfit
    );

}


/* =========================================================
   MAKE INLINE HTML EVENTS WORK
========================================================= */

window.toggleOutfit =
    toggleOutfit;

window.saveOutfit =
    saveOutfit;

window.interact =
    interact;


/* =========================================================
   DRAW PLAYER
========================================================= */

function drawPlayer(){

    const x =
        screenX(player.x);

    const y =
        screenY(player.y);


    /*
       Walking bounce
    */

    let bounce = 0;

    if(player.moving){

        bounce =
            Math.sin(
                performance.now() / 90
            ) * 2.5;

    }


    ctx.save();

    ctx.translate(
        x,
        y + bounce
    );


    /*
       Shadow
    */

    ctx.fillStyle =
        "rgba(42,28,55,.18)";

    ctx.beginPath();

    ctx.ellipse(
        0,
        27,
        24,
        8,
        0,
        0,
        Math.PI * 2
    );

    ctx.fill();


    /*
       Outfit color
    */

    const dress =
        outfitData.dress[
            outfit.dress
        ]?.color ||
        "#b9a1df";


    const hair =
        outfitData.hair[
            outfit.hair
        ]?.color ||
        "#704b42";


    /*
       Hair back
    */

    ctx.fillStyle =
        hair;

    ctx.beginPath();

    ctx.arc(
        0,
        -17,
        19,
        0,
        Math.PI * 2
    );

    ctx.fill();


    /*
       Hair side locks
    */

    ctx.fillRect(
        -17,
        -17,
        9,
        35
    );

    ctx.fillRect(
        8,
        -17,
        9,
        35
    );


    /*
       Face
    */

    ctx.fillStyle =
        "#f6d2ba";

    ctx.beginPath();

    ctx.arc(
        0,
        -13,
        13,
        0,
        Math.PI * 2
    );

    ctx.fill();


    /*
       Hair fringe
    */

    ctx.fillStyle =
        hair;

    ctx.beginPath();

    ctx.arc(
        0,
        -20,
        14,
        Math.PI,
        Math.PI * 2
    );

    ctx.fill();


    /*
       Eyes
    */

    ctx.fillStyle =
        "#3b3043";


    ctx.beginPath();

    ctx.arc(
        -5,
        -12,
        1.8,
        0,
        Math.PI * 2
    );

    ctx.arc(
        5,
        -12,
        1.8,
        0,
        Math.PI * 2
    );

    ctx.fill();


    /*
       Body / dress
    */

    ctx.fillStyle =
        dress;

    ctx.beginPath();

    ctx.roundRect(
        -15,
        0,
        30,
        34,
        10
    );

    ctx.fill();


    /*
       Dress detail
    */

    ctx.fillStyle =
        "rgba(255,255,255,.38)";

    ctx.fillRect(
        -3,
        3,
        6,
        27
    );


    /*
       Arms
    */

    ctx.fillStyle =
        "#f6d2ba";


    ctx.beginPath();

    ctx.roundRect(
        -22,
        4,
        8,
        23,
        5
    );

    ctx.roundRect(
        14,
        4,
        8,
        23,
        5
    );

    ctx.fill();


    /*
       Legs
    */

    ctx.fillStyle =
        "#6f5877";


    ctx.fillRect(
        -10,
        29,
        7,
        12
    );

    ctx.fillRect(
        3,
        29,
        7,
        12
    );


    /*
       Shoes
    */

    ctx.fillStyle =
        "#4f3e57";


    ctx.beginPath();

    ctx.roundRect(
        -13,
        38,
        10,
        6,
        4
    );

    ctx.roundRect(
        3,
        38,
        10,
        6,
        4
    );

    ctx.fill();


    /*
       Accessory
    */

    const accessory =
        outfitData.accessory[
            outfit.accessory
        ]?.icon;


    if(accessory){

        ctx.font =
            "15px sans-serif";

        ctx.textAlign =
            "center";

        ctx.textBaseline =
            "middle";

        ctx.fillText(
            accessory,
            0,
            -39
        );

    }


    /*
       Creator badge
    */

    ctx.font =
        "13px sans-serif";

    ctx.fillText(
        "👑",
        0,
        -55
    );


    /*
       Name
    */

    ctx.font =
        "700 10px DM Sans, sans-serif";

    ctx.fillStyle =
        "#ffffff";

    ctx.shadowColor =
        "rgba(40,25,50,.55)";

    ctx.shadowBlur = 5;

    ctx.fillText(
        "Eunseorin",
        0,
        59
    );


    ctx.restore();

}


/* =========================================================
   SPARKLES
========================================================= */

function drawSparkles(){

    const time =
        performance.now() / 1000;


    for(const sparkle of sparkles){

        const alpha =
            (
                Math.sin(
                    time * 2 +
                    sparkle.phase
                ) + 1
            ) / 2;


        const x =
            screenX(sparkle.x);

        const y =
            screenY(sparkle.y);


        if(
            x < -20 ||
            x > W + 20 ||
            y < -20 ||
            y > H + 20
        ){

            continue;

        }


        ctx.save();

        ctx.globalAlpha =
            alpha * .6;

        ctx.fillStyle =
            "#fff6ff";

        ctx.font =
            `${sparkle.size * 3}px serif`;

        ctx.textAlign =
            "center";

        ctx.fillText(
            "✦",
            x,
            y
        );

        ctx.restore();

    }

}


/* =========================================================
   MINIMAP
========================================================= */

function drawMinimap(){

    if(!mctx) return;


    const mw = mini.width;
    const mh = mini.height;


    /*
       Background
    */

    mctx.clearRect(
        0,
        0,
        mw,
        mh
    );


    mctx.fillStyle =
        "#7ea77a";

    mctx.fillRect(
        0,
        0,
        mw,
        mh
    );


    /*
       Paths
    */

    mctx.fillStyle =
        "#d9c6a8";

    mctx.fillRect(
        mw * .49,
        mh * .20,
        5,
        mh * .58
    );

    mctx.fillRect(
        mw * .48,
        mh * .48,
        mw * .36,
        5
    );


    /*
       Landmarks
    */

    for(const landmark of landmarks){

        const x =
            (
                landmark.x +
                landmark.w / 2
            ) /
            WORLD.width *
            mw;

        const y =
            (
                landmark.y +
                landmark.h / 2
            ) /
            WORLD.height *
            mh;


        mctx.fillStyle =
            "#c6a8df";


        mctx.beginPath();

        mctx.arc(
            x,
            y,
            4,
            0,
            Math.PI * 2
        );

        mctx.fill();

    }


    /*
       Friends
    */

    for(const friend of players){

        const x =
            friend.x /
            WORLD.width *
            mw;

        const y =
            friend.y /
            WORLD.height *
            mh;


        mctx.fillStyle =
            "#f8d36e";


        mctx.beginPath();

        mctx.arc(
            x,
            y,
            3,
            0,
            Math.PI * 2
        );

        mctx.fill();

    }


    /*
       Player
    */

    const px =
        player.x /
        WORLD.width *
        mw;

    const py =
        player.y /
        WORLD.height *
        mh;


    mctx.fillStyle =
        "#ffffff";

    mctx.beginPath();

    mctx.arc(
        px,
        py,
        5,
        0,
        Math.PI * 2
    );

    mctx.fill();


    mctx.strokeStyle =
        "#70539b";

    mctx.lineWidth = 2;

    mctx.stroke();

}


/* =========================================================
   DAY / NIGHT
========================================================= */

function updateTime(delta){

    /*
       Very slow world clock.
    */

    gameState.time +=
        delta * 0.015;


    if(
        gameState.time >= 24
    ){

        gameState.time = 0;

        gameState.day += 1;

    }


    gameState.isNight =
        gameState.time >= 19 ||
        gameState.time < 6;

}


/* =========================================================
   TOP STATUS UPDATE
========================================================= */

function updateStatus(){

    const pills =
        document.querySelectorAll(
            ".status .pill"
        );


    if(pills.length >= 2){

        const hour =
            Math.floor(
                gameState.time
            );

        const minutes =
            Math.floor(
                (
                    gameState.time -
                    hour
                ) * 60
            );


        const formattedHour =
            (
                hour % 12 ||
                12
            )
            .toString()
            .padStart(2, "0");


        const formattedMinutes =
            minutes
                .toString()
                .padStart(2, "0");


        const suffix =
            hour >= 12
                ? "PM"
                : "AM";


        pills[0].textContent =
            `${gameState.isNight ? "🌙" : "☀️"} Day ${gameState.day} · ${formattedHour}:${formattedMinutes} ${suffix}`;


        pills[1].textContent =
            gameState.isNight
                ? "🌙 Cloudhaven"
                : "☁️ Cloudhaven";

    }

}


/* =========================================================
   MAIN DRAW
========================================================= */

function draw(){

    ctx.clearRect(
        0,
        0,
        W,
        H
    );


    /*
       Background
    */

    drawBackground();

    drawCelestial();

    drawClouds();


    /*
       World
    */

    drawIsland();

    drawPaths();

    drawWater();

    drawFlowers();

    drawTrees();

    drawHouses();

    drawLandmarks();

    drawPlayers();

    drawSparkles();

    drawPlayer();


    /*
       Minimap
    */

    drawMinimap();

}


/* =========================================================
   NIGHT OVERLAY
========================================================= */

function drawNightOverlay(){

    if(!gameState.isNight) return;


    ctx.save();

    ctx.fillStyle =
        "rgba(37,29,67,.24)";

    ctx.fillRect(
        0,
        0,
        W,
        H
    );


    /*
       stars
    */

    ctx.fillStyle =
        "rgba(255,255,255,.75)";

    for(let i = 0; i < 35; i++){

        const x =
            (
                i * 137
            ) % W;

        const y =
            (
                i * 71
            ) % Math.min(
                H * .45,
                350
            );


        ctx.fillRect(
            x,
            y,
            2,
            2
        );

    }


    ctx.restore();

}


/* =========================================================
   FINAL RENDER
========================================================= */

function render(){

    draw();

    drawNightOverlay();

}


/* =========================================================
   GAME LOOP
========================================================= */

let lastTime =
    performance.now();


function gameLoop(currentTime){

    /*
       Delta time in seconds
    */

    let delta =
        (
            currentTime -
            lastTime
        ) / 1000;


    lastTime =
        currentTime;


    /*
       Protect against tab switching
    */

    delta =
        Math.min(
            delta,
            0.05
        );


    updateMovement(delta);

    updateClouds(delta);

    updateTime(delta);

    updateCamera();

    updateInteraction();

    updateStatus();

    render();


    requestAnimationFrame(
        gameLoop
    );

}


requestAnimationFrame(
    gameLoop
);


/* =========================================================
   AUTOSAVE
========================================================= */

setInterval(() => {

    gameState.player = {

        x: player.x,

        y: player.y,

        direction:
            player.direction

    };


    gameState.outfit = {

        hair:
            outfit.hair,

        dress:
            outfit.dress,

        accessory:
            outfit.accessory

    };


    saveGame();

}, 5000);


/* =========================================================
   INITIAL CAMERA
========================================================= */

camera.x =
    clamp(
        player.x - W / 2,
        0,
        Math.max(
            0,
            WORLD.width - W
        )
    );


camera.y =
    clamp(
        player.y - H / 2,
        0,
        Math.max(
            0,
            WORLD.height - H
        )
    );


/* =========================================================
   START MESSAGE
========================================================= */

setTimeout(() => {

    showToast(
        "✦ Welcome back to Cloudhaven, Eunseorin!"
    );

}, 700);


/* =========================================================
   DEBUG HELPER
========================================================= */

window.CELESTIA = {

    player,

    camera,

    outfit,

    gameState,

    saveGame,

    resetGame(){

        localStorage.removeItem(
            SAVE_KEY
        );

        location.reload();

    }

};
