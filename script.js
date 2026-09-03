/* =========================================================
   CELESTIA ✦ A COZY FANTASY WORLD
   FINAL SCRIPT
   ========================================================= */

"use strict";

/* =========================================================
   CANVAS
   ========================================================= */

const canvas = document.getElementById("world");
const ctx = canvas.getContext("2d");

const mini = document.getElementById("mini");
const miniCtx = mini.getContext("2d");

ctx.imageSmoothingEnabled = false;
miniCtx.imageSmoothingEnabled = false;


/* =========================================================
   UI
   ========================================================= */

const timeText = document.getElementById("timeText");
const locationText = document.getElementById("locationText");

const playerName = document.getElementById("playerName");
const profileName = document.getElementById("profileName");

const levelText = document.getElementById("level");
const xpBar = document.getElementById("xpBar");
const xpText = document.getElementById("xpText");

const interactBox = document.getElementById("interactBox");
const toast = document.getElementById("toast");

const dialog = document.getElementById("dialog");
const dialogName = document.getElementById("dialogName");
const dialogText = document.getElementById("dialogText");
const dialogAvatar = document.getElementById("dialogAvatar");

const outfitPanel = document.getElementById("outfitPanel");
const previewCanvas = document.getElementById("previewCharacter");

const inventoryPanel = document.getElementById("inventoryPanel");
const mapPanel = document.getElementById("mapPanel");
const questPanel = document.getElementById("questPanel");
const inventoryGrid = document.getElementById("inventoryGrid");


/* =========================================================
   GAME SIZE
   ========================================================= */

const WORLD_WIDTH = 3600;
const WORLD_HEIGHT = 2400;


/* =========================================================
   SAVE
   ========================================================= */

const SAVE_KEY = "celestia_final_save_v1";


/* =========================================================
   GAME STATE
   ========================================================= */

const DEFAULT_STATE = {

  name: "Eunseorin",

  level: 1,

  xp: 0,

  direction: "down",

  moving: false,

  player: {
    x: 1800,
    y: 1430
  },

  outfit: {
    hair: "brown",
    dress: "lavender",
    accessory: "flower"
  },

  inventory: {
    flower: 3,
    crystal: 1,
    star: 2,
    wood: 5,
    potion: 1
  },

  quests: {
    flowers: 0,
    luna: false,
    castle: false
  },

  day: 1,

  minutes: 10 * 60 + 24

};


function cloneDefault() {
  return JSON.parse(JSON.stringify(DEFAULT_STATE));
}


let state = loadGame();


function loadGame() {

  try {

    const saved =
      localStorage.getItem(SAVE_KEY);

    if (!saved) {
      return cloneDefault();
    }

    const parsed =
      JSON.parse(saved);

    return {
      ...cloneDefault(),
      ...parsed,

      player: {
        ...cloneDefault().player,
        ...(parsed.player || {})
      },

      outfit: {
        ...cloneDefault().outfit,
        ...(parsed.outfit || {})
      },

      inventory: {
        ...cloneDefault().inventory,
        ...(parsed.inventory || {})
      },

      quests: {
        ...cloneDefault().quests,
        ...(parsed.quests || {})
      }
    };

  } catch (error) {

    console.warn(
      "Save tidak dapat dibaca:",
      error
    );

    return cloneDefault();
  }
}


function saveGame() {

  localStorage.setItem(
    SAVE_KEY,
    JSON.stringify(state)
  );
}


/* =========================================================
   RESIZE
   ========================================================= */

let screenWidth = window.innerWidth;
let screenHeight = window.innerHeight;


function resizeCanvas() {

  screenWidth = window.innerWidth;
  screenHeight = window.innerHeight;

  const dpr =
    Math.min(window.devicePixelRatio || 1, 2);

  canvas.width =
    Math.floor(screenWidth * dpr);

  canvas.height =
    Math.floor(screenHeight * dpr);

  canvas.style.width =
    screenWidth + "px";

  canvas.style.height =
    screenHeight + "px";

  ctx.setTransform(
    dpr,
    0,
    0,
    dpr,
    0,
    0
  );

  ctx.imageSmoothingEnabled = false;
}


window.addEventListener(
  "resize",
  resizeCanvas
);

resizeCanvas();


/* =========================================================
   CAMERA
   ========================================================= */

const camera = {

  x: 0,

  y: 0,

  smooth: 0.10

};


function updateCamera() {

  const targetX =
    state.player.x -
    screenWidth / 2;

  const targetY =
    state.player.y -
    screenHeight / 2;

  camera.x +=
    (targetX - camera.x) *
    camera.smooth;

  camera.y +=
    (targetY - camera.y) *
    camera.smooth;

  camera.x =
    Math.max(
      0,
      Math.min(
        camera.x,
        WORLD_WIDTH - screenWidth
      )
    );

  camera.y =
    Math.max(
      0,
      Math.min(
        camera.y,
        WORLD_HEIGHT - screenHeight
      )
    );
}


/* =========================================================
   HELPERS
   ========================================================= */

function clamp(value, min, max) {

  return Math.max(
    min,
    Math.min(max, value)
  );
}


function distance(a, b) {

  return Math.hypot(
    a.x - b.x,
    a.y - b.y
  );
}


function random(min, max) {

  return Math.random() *
    (max - min) +
    min;
}


function randomInt(min, max) {

  return Math.floor(
    random(min, max + 1)
  );
}


/* =========================================================
   XP / LEVEL
   ========================================================= */

function addXP(amount) {

  state.xp += amount;

  while (state.xp >= 100) {

    state.xp -= 100;

    state.level++;

    showToast(
      "✨ Level Up! Kamu sekarang Lv. " +
      state.level
    );
  }

  updateProfile();

  saveGame();
}


function updateProfile() {

  if (playerName) {
    playerName.textContent =
      state.name;
  }

  if (profileName) {
    profileName.textContent =
      state.name;
  }

  if (levelText) {
    levelText.textContent =
      state.level;
  }

  if (xpBar) {

    xpBar.style.width =
      state.xp + "%";
  }

  if (xpText) {

    xpText.textContent =
      `${state.xp} / 100 XP`;
  }
}


/* =========================================================
   TIME
   ========================================================= */

function updateTime(dt) {

  state.minutes += dt * 0.6;

  if (state.minutes >= 1440) {

    state.minutes -= 1440;

    state.day++;

    state.quests.flowers = 0;
    state.quests.luna = false;
    state.quests.castle = false;

    saveGame();
  }

  const totalMinutes =
    Math.floor(state.minutes);

  const hour24 =
    Math.floor(totalMinutes / 60);

  const minute =
    totalMinutes % 60;

  const isPM =
    hour24 >= 12;

  let hour =
    hour24 % 12;

  if (hour === 0) {
    hour = 12;
  }

  const suffix =
    isPM ? "PM" : "AM";

  if (timeText) {

    timeText.textContent =
      `Day ${state.day} · ${hour}:${String(minute).padStart(2, "0")} ${suffix}`;
  }
}


/* =========================================================
   WORLD DATA
   ========================================================= */

const landmarks = [

  {
    id: "castle",

    name: "Celestia Castle",

    icon: "🏰",

    x: 1800,

    y: 480,

    w: 520,

    h: 360,

    color: "#c8b5ed"
  },

  {
    id: "forest",

    name: "Whispering Forest",

    icon: "🌲",

    x: 530,

    y: 700,

    w: 900,

    h: 700,

    color: "#a9cda9"
  },

  {
    id: "plaza",

    name: "Central Plaza",

    icon: "🌸",

    x: 1450,

    y: 1080,

    w: 700,

    h: 500,

    color: "#e8c9df"
  },

  {
    id: "village",

    name: "Cloudhaven Village",

    icon: "🏡",

    x: 2350,

    y: 980,

    w: 750,

    h: 620,

    color: "#e8d0ae"
  },

  {
    id: "home",

    name: "Your Home",

    icon: "🏠",

    x: 2720,

    y: 1760,

    w: 420,

    h: 300,

    color: "#e4b6c8"
  },

  {
    id: "garden",

    name: "Pet Garden",

    icon: "🐇",

    x: 980,

    y: 1720,

    w: 600,

    h: 360,

    color: "#b7d7b1"
  },

  {
    id: "dock",

    name: "Sky Dock",

    icon: "☁️",

    x: 2750,

    y: 450,

    w: 500,

    h: 260,

    color: "#b8d7ed"
  },

  {
    id: "bridge",

    name: "Starfall Bridge",

    icon: "🌉",

    x: 1900,

    y: 1700,

    w: 450,

    h: 160,

    color: "#c7a8df"
  }

];


/* =========================================================
   HOUSES
   ========================================================= */

const houses = [

  {
    x: 2520,
    y: 1150,
    w: 220,
    h: 170
  },

  {
    x: 2850,
    y: 1250,
    w: 220,
    h: 170
  },

  {
    x: 2550,
    y: 1780,
    w: 240,
    h: 180
  },

  {
    x: 2880,
    y: 1840,
    w: 240,
    h: 180
  }

];


/* =========================================================
   NPCs
   ⭐ IS ONLY FOR REAL PLAYERS
   NPC = 💬
   ========================================================= */

const npcs = [

  {
    id: "luna",

    name: "Luna",

    icon: "💬",

    x: 1580,

    y: 1120,

    color: "#f0b5d2",

    lines: [

      "Hai Eunseorin! Selamat datang di Cloudhaven ✨",

      "Langit di sini selalu menyimpan sedikit keajaiban.",

      "Kalau kamu tersesat, ikuti cahaya bintang.",

      "Semoga harimu menyenangkan di Celestia!"

    ],

    line: 0
  },

  {
    id: "alya",

    name: "Alya",

    icon: "💬",

    x: 2670,

    y: 1120,

    color: "#a9c8ed",

    lines: [

      "Psst... kamu sudah melihat Sky Dock?",

      "Katanya ada kapal yang bisa membawa kita ke pulau lain.",

      "Tapi jalurnya belum dibuka.",

      "Mungkin suatu hari nanti..."

    ],

    line: 0
  },

  {
    id: "mika",

    name: "Mika",

    icon: "💬",

    x: 1110,

    y: 1900,

    color: "#f2d18f",

    lines: [

      "Aku suka tempat ini.",

      "Bunga-bunganya mekar bahkan saat malam.",

      "Kalau kamu punya waktu, bantu aku merawat taman ya 🌸"

    ],

    line: 0
  }

];


/* =========================================================
   DECORATIONS
   ========================================================= */

const trees = [];
const flowers = [];
const clouds = [];
const sparkles = [];


/*
  Generate deterministic-ish decoration.
*/

function generateDecorations() {

  trees.length = 0;
  flowers.length = 0;
  clouds.length = 0;
  sparkles.length = 0;

  for (let i = 0; i < 125; i++) {

    trees.push({

      x: randomInt(180, WORLD_WIDTH - 180),

      y: randomInt(300, WORLD_HEIGHT - 220),

      size: random(0.75, 1.35),

      variant: randomInt(0, 2)
    });
  }


  for (let i = 0; i < 190; i++) {

    flowers.push({

      x: randomInt(150, WORLD_WIDTH - 150),

      y: randomInt(300, WORLD_HEIGHT - 160),

      size: random(0.7, 1.2),

      type: randomInt(0, 3)
    });
  }


  for (let i = 0; i < 30; i++) {

    clouds.push({

      x: random(
        0,
        WORLD_WIDTH
      ),

      y: random(
        120,
        600
      ),

      size: random(
        0.7,
        1.6
      ),

      speed: random(
        4,
        10
      )
    });
  }


  for (let i = 0; i < 55; i++) {

    sparkles.push({

      x: random(
        100,
        WORLD_WIDTH - 100
      ),

      y: random(
        100,
        WORLD_HEIGHT - 100
      ),

      phase: random(
        0,
        Math.PI * 2
      ),

      size: random(
        1,
        3
      )
    });
  }
}


generateDecorations();


/* =========================================================
   DRAW BACKGROUND
   ========================================================= */

function drawBackground() {

  const gradient =
    ctx.createLinearGradient(
      0,
      0,
      0,
      screenHeight
    );

  gradient.addColorStop(
    0,
    "#d9c8f5"
  );

  gradient.addColorStop(
    0.55,
    "#e9d9ef"
  );

  gradient.addColorStop(
    1,
    "#b8d7c0"
  );

  ctx.fillStyle =
    gradient;

  ctx.fillRect(
    0,
    0,
    screenWidth,
    screenHeight
  );
}


/* =========================================================
   WORLD ISLAND
   ========================================================= */

function drawIsland() {

  ctx.save();

  ctx.translate(
    -camera.x,
    -camera.y
  );


  /*
    Giant floating island shadow
  */

  ctx.fillStyle =
    "rgba(71,56,100,.18)";

  ctx.beginPath();

  ctx.ellipse(
    WORLD_WIDTH / 2,
    WORLD_HEIGHT / 2 + 120,
    1680,
    1030,
    0,
    0,
    Math.PI * 2
  );

  ctx.fill();


  /*
    Water / sky void
  */

  ctx.fillStyle =
    "#b9d7e7";

  ctx.fillRect(
    0,
    0,
    WORLD_WIDTH,
    WORLD_HEIGHT
  );


  /*
    Island body
  */

  ctx.fillStyle =
    "#b99b76";

  ctx.beginPath();

  ctx.ellipse(
    WORLD_WIDTH / 2,
    WORLD_HEIGHT / 2,
    1650,
    1000,
    0,
    0,
    Math.PI * 2
  );

  ctx.fill();


  /*
    Grass top
  */

  ctx.fillStyle =
    "#a9c99a";

  ctx.beginPath();

  ctx.ellipse(
    WORLD_WIDTH / 2,
    WORLD_HEIGHT / 2 - 30,
    1620,
    950,
    0,
    0,
    Math.PI * 2
  );

  ctx.fill();


  /*
    soft inner grass
  */

  ctx.fillStyle =
    "#b7d6a5";

  ctx.beginPath();

  ctx.ellipse(
    WORLD_WIDTH / 2,
    WORLD_HEIGHT / 2 - 70,
    1480,
    820,
    0,
    0,
    Math.PI * 2
  );

  ctx.fill();


  /*
    little edge rocks
  */

  for (let i = 0; i < 55; i++) {

    const angle =
      (i / 55) *
      Math.PI *
      2;

    const rx =
      1540 +
      Math.sin(i * 5) * 60;

    const ry =
      900 +
      Math.cos(i * 3) * 50;

    const x =
      WORLD_WIDTH / 2 +
      Math.cos(angle) * rx;

    const y =
      WORLD_HEIGHT / 2 +
      Math.sin(angle) * ry;

    ctx.fillStyle =
      "#92775f";

    ctx.beginPath();

    ctx.arc(
      x,
      y,
      random(7, 16),
      0,
      Math.PI * 2
    );

    ctx.fill();
  }


  ctx.restore();
}


/* =========================================================
   PATHS
   ========================================================= */

function drawPaths() {

  ctx.save();

  ctx.translate(
    -camera.x,
    -camera.y
  );

  ctx.strokeStyle =
    "#e8d4b2";

  ctx.lineWidth =
    92;

  ctx.lineCap =
    "round";


  /*
    Castle → Plaza
  */

  ctx.beginPath();

  ctx.moveTo(
    2060,
    820
  );

  ctx.lineTo(
    1800,
    1120
  );

  ctx.stroke();


  /*
    Plaza → Village
  */

  ctx.beginPath();

  ctx.moveTo(
    2100,
    1320
  );

  ctx.lineTo(
    2540,
    1280
  );

  ctx.stroke();


  /*
    Plaza → Home
  */

  ctx.beginPath();

  ctx.moveTo(
    1880,
    1480
  );

  ctx.lineTo(
    2800,
    1850
  );

  ctx.stroke();


  /*
    Plaza → Forest
  */

  ctx.beginPath();

  ctx.moveTo(
    1510,
    1220
  );

  ctx.lineTo(
    1050,
    1030
  );

  ctx.stroke();


  ctx.restore();
}


/* =========================================================
   RIVER
   ========================================================= */

function drawRiver() {

  ctx.save();

  ctx.translate(
    -camera.x,
    -camera.y
  );

  ctx.strokeStyle =
    "#8fc5e5";

  ctx.lineWidth =
    150;

  ctx.lineCap =
    "round";

  ctx.beginPath();

  ctx.moveTo(
    450,
    1510
  );

  ctx.bezierCurveTo(
    1100,
    1400,
    1250,
    1700,
    1750,
    1600
  );

  ctx.bezierCurveTo(
    2200,
    1490,
    2450,
    1500,
    3220,
    1180
  );

  ctx.stroke();


  ctx.strokeStyle =
    "#bfe3f1";

  ctx.lineWidth =
    9;

  ctx.beginPath();

  ctx.moveTo(
    470,
    1495
  );

  ctx.bezierCurveTo(
    1100,
    1390,
    1250,
    1680,
    1740,
    1580
  );

  ctx.bezierCurveTo(
    2200,
    1470,
    2460,
    1480,
    3200,
    1160
  );

  ctx.stroke();

  ctx.restore();
}


/* =========================================================
   DRAW TREES
   ========================================================= */

function drawTree(tree) {

  const x = tree.x;
  const y = tree.y;
  const s = tree.size;

  ctx.save();

  ctx.translate(
    x,
    y
  );

  ctx.scale(
    s,
    s
  );


  /*
    shadow
  */

  ctx.fillStyle =
    "rgba(72,80,73,.18)";

  ctx.beginPath();

  ctx.ellipse(
    0,
    32,
    34,
    12,
    0,
    0,
    Math.PI * 2
  );

  ctx.fill();


  /*
    trunk
  */

  ctx.fillStyle =
    "#8b644c";

  ctx.fillRect(
    -8,
    0,
    16,
    40
  );


  /*
    leaves
  */

  const colors = [
    "#7cae83",
    "#8ebd8e",
    "#6fa27a"
  ];

  ctx.fillStyle =
    colors[
      tree.variant
    ];

  ctx.beginPath();

  ctx.arc(
    -17,
    -10,
    27,
    0,
    Math.PI * 2
  );

  ctx.arc(
    16,
    -12,
    29,
    0,
    Math.PI * 2
  );

  ctx.arc(
    0,
    -34,
    34,
    0,
    Math.PI * 2
  );

  ctx.fill();


  ctx.restore();
}


/* =========================================================
   DRAW FLOWERS
   ========================================================= */

function drawFlower(flower) {

  const colors = [
    "#ef9fc2",
    "#c7b0ed",
    "#f2d47d",
    "#9dc9e9"
  ];

  const x = flower.x;
  const y = flower.y;
  const s = flower.size;

  ctx.save();

  ctx.translate(
    x,
    y
  );

  ctx.scale(
    s,
    s
  );


  ctx.fillStyle =
    "#75a879";

  ctx.fillRect(
    -1,
    0,
    3,
    12
  );


  ctx.fillStyle =
    colors[
      flower.type
    ];


  for (
    let i = 0;
    i < 5;
    i++
  ) {

    const angle =
      i *
      Math.PI *
      2 /
      5;

    ctx.beginPath();

    ctx.arc(
      Math.cos(angle) * 5,
      Math.sin(angle) * 5,
      4,
      0,
      Math.PI * 2
    );

    ctx.fill();
  }


  ctx.fillStyle =
    "#f5d678";

  ctx.beginPath();

  ctx.arc(
    0,
    0,
    3,
    0,
    Math.PI * 2
  );

  ctx.fill();


  ctx.restore();
}


/* =========================================================
   DRAW CLOUDS
   ========================================================= */

function updateClouds(dt) {

  for (const cloud of clouds) {

    cloud.x +=
      cloud.speed * dt;

    if (
      cloud.x >
      WORLD_WIDTH + 250
    ) {

      cloud.x = -250;
    }
  }
}


function drawCloud(cloud) {

  ctx.save();

  ctx.translate(
    cloud.x,
    cloud.y
  );

  ctx.scale(
    cloud.size,
    cloud.size
  );

  ctx.fillStyle =
    "rgba(255,255,255,.58)";

  ctx.beginPath();

  ctx.arc(
    -35,
    0,
    28,
    0,
    Math.PI * 2
  );

  ctx.arc(
    0,
    -15,
    36,
    0,
    Math.PI * 2
  );

  ctx.arc(
    38,
    2,
    26,
    0,
    Math.PI * 2
  );

  ctx.fill();

  ctx.restore();
}


/* =========================================================
   LANDMARKS
   ========================================================= */

function drawLandmark(place) {

  const x =
    place.x;

  const y =
    place.y;

  const w =
    place.w;

  const h =
    place.h;


  ctx.save();


  /*
    Area
  */

  ctx.fillStyle =
    place.color;

  ctx.globalAlpha =
    0.24;

  ctx.beginPath();

  ctx.roundRect(
    x,
    y,
    w,
    h,
    50
  );

  ctx.fill();

  ctx.globalAlpha =
    1;


  /*
    Label
  */

  ctx.fillStyle =
    "rgba(255,255,255,.88)";

  ctx.font =
    "bold 22px system-ui";

  ctx.textAlign =
    "center";

  ctx.fillText(
    place.icon +
    " " +
    place.name,
    x + w / 2,
    y + 45
  );


  /*
    Castle
  */

  if (place.id === "castle") {

    ctx.fillStyle =
      "#d8c7ef";

    ctx.fillRect(
      x + 90,
      y + 110,
      w - 180,
      h - 120
    );


    ctx.fillStyle =
      "#9d83c8";

    for (
      let i = 0;
      i < 3;
      i++
    ) {

      const tx =
        x + 125 +
        i * 135;

      ctx.beginPath();

      ctx.moveTo(
        tx,
        y + 110
      );

      ctx.lineTo(
        tx + 45,
        y + 45
      );

      ctx.lineTo(
        tx + 90,
        y + 110
      );

      ctx.closePath();

      ctx.fill();

    }


    ctx.fillStyle =
      "#8062ae";

    ctx.fillRect(
      x + w / 2 - 38,
      y + h - 110,
      76,
      110
    );
  }


  /*
    Village houses
  */

  if (
    place.id === "village"
  ) {

    for (
      let i = 0;
      i < 4;
      i++
    ) {

      const hx =
        x + 90 +
        (i % 2) * 280;

      const hy =
        y + 150 +
        Math.floor(i / 2) * 210;

      drawHouse(
        hx,
        hy,
        180,
        140
      );
    }
  }


  /*
    Pet garden
  */

  if (
    place.id === "garden"
  ) {

    ctx.fillStyle =
      "#86b77e";

    ctx.beginPath();

    ctx.arc(
      x + w / 2,
      y + h / 2 + 25,
      90,
      0,
      Math.PI * 2
    );

    ctx.fill();

    ctx.font =
      "55px system-ui";

    ctx.fillText(
      "🐇",
      x + w / 2,
      y + h / 2 + 45
    );
  }


  /*
    Sky Dock
  */

  if (
    place.id === "dock"
  ) {

    ctx.fillStyle =
      "#c8dff0";

    ctx.fillRect(
      x + 60,
      y + 100,
      w - 120,
      50
    );

    ctx.font =
      "52px system-ui";

    ctx.fillText(
      "⛵",
      x + w / 2,
      y + 90
    );
  }


  ctx.restore();
}


/* =========================================================
   HOUSE
   ========================================================= */

function drawHouse(
  x,
  y,
  w,
  h
) {

  ctx.save();

  ctx.fillStyle =
    "#f2d5b3";

  ctx.fillRect(
    x,
    y,
    w,
    h
  );


  ctx.fillStyle =
    "#b97c87";

  ctx.beginPath();

  ctx.moveTo(
    x - 20,
    y
  );

  ctx.lineTo(
    x + w / 2,
    y - 85
  );

  ctx.lineTo(
    x + w + 20,
    y
  );

  ctx.closePath();

  ctx.fill();


  ctx.fillStyle =
    "#8d6b91";

  ctx.fillRect(
    x + w / 2 - 25,
    y + h - 65,
    50,
    65
  );


  ctx.fillStyle =
    "#b6d8e7";

  ctx.fillRect(
    x + 28,
    y + 38,
    42,
    38
  );

  ctx.fillRect(
    x + w - 70,
    y + 38,
    42,
    38
  );

  ctx.restore();
}


/* =========================================================
   BRIDGE
   ========================================================= */

function drawBridge() {

  const x = 1910;
  const y = 1740;

  ctx.save();

  ctx.fillStyle =
    "#9d78bf";

  ctx.fillRect(
    x,
    y,
    430,
    90
  );


  for (
    let i = 0;
    i < 9;
    i++
  ) {

    ctx.fillStyle =
      "#c4a3dc";

    ctx.fillRect(
      x + i * 48,
      y,
      38,
      90
    );
  }

  ctx.restore();
}


/* =========================================================
   SPARKLES
   ========================================================= */

function drawSparkles(time) {

  ctx.save();

  ctx.translate(
    -camera.x,
    -camera.y
  );

  for (
    const sparkle of sparkles
  ) {

    const alpha =
      0.25 +
      Math.sin(
        time * 2 +
        sparkle.phase
      ) *
      0.25;

    ctx.globalAlpha =
      alpha;

    ctx.fillStyle =
      "#fff";

    const s =
      sparkle.size;

    ctx.fillRect(
      sparkle.x - s / 2,
      sparkle.y - s / 2,
      s,
      s
    );
  }

  ctx.globalAlpha =
    1;

  ctx.restore();
}


/* =========================================================
   PLAYER
   ========================================================= */

const player = {

  radius: 25,

  speed: 260,

  bob: 0

};


/* =========================================================
   KEYBOARD
   ========================================================= */

const keys = {};

window.addEventListener(
  "keydown",
  event => {

    keys[event.key.toLowerCase()] =
      true;


    if (
      [
        "arrowup",
        "arrowdown",
        "arrowleft",
        "arrowright",
        " "
      ].includes(
        event.key.toLowerCase()
      )
    ) {

      event.preventDefault();
    }


    if (
      event.key.toLowerCase() === "o"
    ) {

      toggleOutfit();
    }


    if (
      event.key.toLowerCase() === "i"
    ) {

      showPanel(
        "inventory"
      );
    }


    if (
      event.key.toLowerCase() === "m"
    ) {

      showPanel(
        "map"
      );
    }


    if (
      event.key.toLowerCase() === "q"
    ) {

      showPanel(
        "quest"
      );
    }


    if (
      event.key.toLowerCase() === "escape"
    ) {

      closeDialog();

      closeOutfit();
    }


    if (
      event.key.toLowerCase() === "e" ||
      event.key === "Enter"
    ) {

      if (
        dialog.classList.contains(
          "show"
        )
      ) {

        closeDialog();

      } else {

        interact();
      }
    }

  }
);


window.addEventListener(
  "keyup",
  event => {

    keys[event.key.toLowerCase()] =
      false;
  }
);


/* =========================================================
   MOVEMENT
   ========================================================= */

function updatePlayer(dt) {

  let dx = 0;
  let dy = 0;


  if (
    keys["w"] ||
    keys["arrowup"]
  ) {

    dy -= 1;

    state.direction =
      "up";
  }


  if (
    keys["s"] ||
    keys["arrowdown"]
  ) {

    dy += 1;

    state.direction =
      "down";
  }


  if (
    keys["a"] ||
    keys["arrowleft"]
  ) {

    dx -= 1;

    state.direction =
      "left";
  }


  if (
    keys["d"] ||
    keys["arrowright"]
  ) {

    dx += 1;

    state.direction =
      "right";
  }


  const moving =
    dx !== 0 ||
    dy !== 0;

  state.moving =
    moving;


  if (!moving) {

    player.bob *=
      0.8;

    return;
  }


  /*
    Normalize diagonal movement.
  */

  const length =
    Math.hypot(
      dx,
      dy
    );

  dx /= length;
  dy /= length;


  const speed =
    player.speed * dt;


  const nextX =
    state.player.x +
    dx * speed;

  const nextY =
    state.player.y +
    dy * speed;


  if (
    canMoveTo(
      nextX,
      state.player.y
    )
  ) {

    state.player.x =
      nextX;
  }


  if (
    canMoveTo(
      state.player.x,
      nextY
    )
  ) {

    state.player.y =
      nextY;
  }


  player.bob +=
    dt * 12;
}


/* =========================================================
   COLLISION
   ========================================================= */

function canMoveTo(
  x,
  y
) {

  /*
    World bounds
  */

  if (
    x < 100 ||
    y < 100 ||
    x > WORLD_WIDTH - 100 ||
    y > WORLD_HEIGHT - 100
  ) {

    return false;
  }


  /*
    Landmark collision
  */

  for (
    const place of landmarks
  ) {

    /*
      Castle, houses, etc.
      Area itself remains walkable,
      so only certain structures
      inside it are blocked.
    */

    if (
      place.id === "castle"
    ) {

      const wall = {

        x:
          place.x + 80,

        y:
          place.y + 95,

        w:
          place.w - 160,

        h:
          place.h - 120
      };

      if (
        circleRectCollision(
          x,
          y,
          player.radius,
          wall
        )
      ) {

        return false;
      }
    }
  }


  /*
    Houses
  */

  for (
    const house of houses
  ) {

    if (
      circleRectCollision(
        x,
        y,
        player.radius,
        {
          x: house.x,
          y: house.y,
          w: house.w,
          h: house.h
        }
      )
    ) {

      return false;
    }
  }


  /*
    Trees
  */

  for (
    let i = 0;
    i < trees.length;
    i += 2
  ) {

    const tree =
      trees[i];

    if (
      Math.hypot(
        x - tree.x,
        y - tree.y
      ) <
      35
    ) {

      return false;
    }
  }


  return true;
}


function circleRectCollision(
  cx,
  cy,
  radius,
  rect
) {

  const closestX =
    clamp(
      cx,
      rect.x,
      rect.x + rect.w
    );

  const closestY =
    clamp(
      cy,
      rect.y,
      rect.y + rect.h
    );

  const dx =
    cx - closestX;

  const dy =
    cy - closestY;

  return (
    dx * dx +
    dy * dy
  ) <
    radius * radius;
}


/* =========================================================
   DRAW EUNSEORIN
   ========================================================= */

/*
  IMPORTANT:
  Your current GitHub folder has a space in its name:

  assets/ characters/eunseorin.png

  Therefore the URL-encoded path is:

  ./assets/%20characters/eunseorin.png
*/

const eunseorinSprite =
  new Image();

let eunseorinLoaded =
  false;


eunseorinSprite.src =
  "./assets/%20characters/eunseorin.png";


eunseorinSprite.onload =
  () => {

    eunseorinLoaded =
      true;

    drawPreview();

  };


eunseorinSprite.onerror =
  () => {

    console.error(
      "❌ Eunseorin PNG tidak ditemukan."
    );

    console.log(
      "Cek path: ./assets/%20characters/eunseorin.png"
    );
  };


function drawEunseorin(
  context,
  x,
  y
) {

  if (
    !eunseorinLoaded
  ) {

    drawFallbackCharacter(
      context,
      x,
      y
    );

    return;
  }


  const width =
    78;

  const height =
    105;


  /*
    Slight walking bounce.
  */

  const bounce =
    state.moving
      ? Math.sin(
          performance.now() / 90
        ) * 2
      : Math.sin(
          performance.now() / 500
        ) * 1;


  context.save();

  context.imageSmoothingEnabled =
    false;


  /*
    Character shadow
  */

  context.fillStyle =
    "rgba(65,45,80,.20)";

  context.beginPath();

  context.ellipse(
    x,
    y + 4,
    28,
    9,
    0,
    0,
    Math.PI * 2
  );

  context.fill();


  /*
    Pixel image
  */

  context.drawImage(
    eunseorinSprite,

    x - width / 2,

    y -
      height +
      bounce,

    width,
    height
  );


  /*
    Creator badge
  */

  context.font =
    "18px Arial";

  context.textAlign =
    "center";

  context.textBaseline =
    "middle";

  context.fillStyle =
    "rgba(255,255,255,.92)";

  context.beginPath();

  context.roundRect(
    x - 14,
    y - height - 28,
    28,
    23,
    8
  );

  context.fill();

  context.fillText(
    "👑",
    x,
    y - height - 17
  );


  context.restore();
}


/* =========================================================
   FALLBACK CHARACTER
   ========================================================= */

function drawFallbackCharacter(
  context,
  x,
  y
) {

  context.save();

  context.imageSmoothingEnabled =
    false;


  /*
    shadow
  */

  context.fillStyle =
    "rgba(70,50,90,.2)";

  context.beginPath();

  context.ellipse(
    x,
    y + 3,
    25,
    8,
    0,
    0,
    Math.PI * 2
  );

  context.fill();


  /*
    hair
  */

  context.fillStyle =
    "#68443a";

  context.beginPath();

  context.arc(
    x,
    y - 55,
    25,
    0,
    Math.PI * 2
  );

  context.fill();


  /*
    face
  */

  context.fillStyle =
    "#ffd2b8";

  context.beginPath();

  context.arc(
    x,
    y - 54,
    18,
    0,
    Math.PI * 2
  );

  context.fill();


  /*
    eyes
  */

  context.fillStyle =
    "#3b3040";

  context.fillRect(
    x - 9,
    y - 57,
    4,
    6
  );

  context.fillRect(
    x + 5,
    y - 57,
    4,
    6
  );


  /*
    dress
  */

  context.fillStyle =
    "#c9b2ef";

  context.beginPath();

  context.moveTo(
    x - 23,
    y - 33
  );

  context.lineTo(
    x + 23,
    y - 33
  );

  context.lineTo(
    x + 29,
    y
  );

  context.lineTo(
    x - 29,
    y
  );

  context.closePath();

  context.fill();


  context.restore();
}


/* =========================================================
   INTERACTION
   ========================================================= */

let currentInteraction =
  null;


function findInteraction() {

  const range =
    110;


  let nearest =
    null;

  let nearestDistance =
    Infinity;


  /*
    NPCs
  */

  for (
    const npc of npcs
  ) {

    const d =
      distance(
        state.player,
        npc
      );

    if (
      d < range &&
      d < nearestDistance
    ) {

      nearest =
        {
          type: "npc",
          target: npc
        };

      nearestDistance =
        d;
    }
  }


  /*
    Landmarks
  */

  for (
    const place of landmarks
  ) {

    const center = {

      x:
        place.x +
        place.w / 2,

      y:
        place.y +
        place.h / 2
    };

    const d =
      distance(
        state.player,
        center
      );

    if (
      d < range + 100 &&
      d < nearestDistance
    ) {

      nearest =
        {
          type: "landmark",
          target: place
        };

      nearestDistance =
        d;
    }
  }


  return nearest;
}


function updateInteraction() {

  currentInteraction =
    findInteraction();


  if (
    !interactBox
  ) {

    return;
  }


  if (
    currentInteraction
  ) {

    interactBox.classList.add(
      "show"
    );

    if (
      currentInteraction.type ===
      "npc"
    ) {

      interactBox.innerHTML =
        `Press <b>E</b> to talk to ${currentInteraction.target.name}`;

    } else {

      interactBox.innerHTML =
        `Press <b>E</b> to explore ${currentInteraction.target.name}`;
    }

  } else {

    interactBox.classList.remove(
      "show"
    );
  }
}


/* =========================================================
   INTERACT
   ========================================================= */

function interact() {

  const interaction =
    findInteraction();


  if (!interaction) {

    showToast(
      "✨ Tidak ada yang bisa diajak berinteraksi di dekat sini."
    );

    return;
  }


  if (
    interaction.type ===
    "npc"
  ) {

    talkToNPC(
      interaction.target
    );

    return;
  }


  if (
    interaction.type ===
    "landmark"
  ) {

    visitLandmark(
      interaction.target
    );
  }
}


/* =========================================================
   NPC DIALOGUE
   ========================================================= */

function talkToNPC(npc) {

  state.quests.luna =
    npc.id === "luna"
    ? true
    : state.quests.luna;


  const line =
    npc.lines[
      npc.line %
      npc.lines.length
    ];


  npc.line++;


  openDialog(
    npc.name,
    line,
    npc.icon
  );


  if (
    npc.id === "luna" &&
    !state.quests.luna
  ) {

    addXP(10);
  }


  saveGame();

  updateQuestPanel();
}


function openDialog(
  name,
  text,
  avatar = "💬"
) {

  dialogName.textContent =
    name;

  dialogText.textContent =
    text;

  dialogAvatar.textContent =
    avatar;

  dialog.classList.add(
    "show"
  );
}


function closeDialog() {

  dialog.classList.remove(
    "show"
  );
}


/* =========================================================
   LANDMARK INTERACTION
   ========================================================= */

function visitLandmark(place) {

  showToast(
    `${place.icon} Kamu berada di ${place.name}`
  );


  if (
    place.id === "castle"
  ) {

    if (
      !state.quests.castle
    ) {

      state.quests.castle =
        true;

      addXP(25);

      showToast(
        "🏰 Quest selesai: Visit Celestia Castle!"
      );
    }
  }


  saveGame();

  updateQuestPanel();
}


/* =========================================================
   TOAST
   ========================================================= */

let toastTimer =
  null;


function showToast(message) {

  if (!toast) return;

  toast.textContent =
    message;

  toast.classList.add(
    "show"
  );


  clearTimeout(
    toastTimer
  );


  toastTimer =
    setTimeout(
      () => {

        toast.classList.remove(
          "show"
        );

      },
      2600
    );
}


/* =========================================================
   PANELS
   ========================================================= */

function hideAllPanels() {

  [
    inventoryPanel,
    mapPanel,
    questPanel
  ].forEach(
    panel => {

      if (panel) {

        panel.classList.add(
          "hidden"
        );
      }
    }
  );

  document
    .querySelectorAll(
      ".menuBtn"
    )
    .forEach(
      btn =>
        btn.classList.remove(
          "active"
        )
    );
}


function showPanel(name) {

  hideAllPanels();


  if (
    name === "inventory" &&
    inventoryPanel
  ) {

    inventoryPanel.classList.remove(
      "hidden"
    );

    renderInventory();

  }


  if (
    name === "map" &&
    mapPanel
  ) {

    mapPanel.classList.remove(
      "hidden"
    );

  }


  if (
    name === "quest" &&
    questPanel
  ) {

    questPanel.classList.remove(
      "hidden"
    );

    updateQuestPanel();

  }


  const button =
    document.querySelector(
      `.menuBtn[data-panel="${name}"]`
    );


  if (button) {

    button.classList.add(
      "active"
    );
  }
}


document
  .querySelectorAll(
    ".menuBtn"
  )
  .forEach(
    button => {

      button.addEventListener(
        "click",
        () => {

          showPanel(
            button.dataset.panel
          );
        }
      );

    }
  );


/* =========================================================
   INVENTORY
   ========================================================= */

const ITEM_INFO = {

  flower: {
    icon: "🌸",
    name: "Moon Flower"
  },

  crystal: {
    icon: "💎",
    name: "Sky Crystal"
  },

  star: {
    icon: "⭐",
    name: "Star Fragment"
  },

  wood: {
    icon: "🪵",
    name: "Wood"
  },

  potion: {
    icon: "🧪",
    name: "Dream Potion"
  }

};


function renderInventory() {

  if (!inventoryGrid) {
    return;
  }


  inventoryGrid.innerHTML =
    "";


  for (
    const [item, amount]
    of Object.entries(
      state.inventory
    )
  ) {

    const info =
      ITEM_INFO[item];


    if (!info) continue;


    const card =
      document.createElement(
        "div"
      );


    card.className =
      "inventoryItem";


    card.innerHTML = `

      <div class="inventoryIcon">
        ${info.icon}
      </div>

      <div>
        <b>${info.name}</b>
        <small>x${amount}</small>
      </div>

    `;


    inventoryGrid.appendChild(
      card
    );
  }
}


/* =========================================================
   QUEST
   ========================================================= */

function updateQuestPanel() {

  if (!questPanel) {
    return;
  }


  const paragraphs =
    questPanel.querySelectorAll(
      "p"
    );


  if (
    paragraphs[0]
  ) {

    paragraphs[0].textContent =
      `🌸 Collect 3 flowers (${Math.min(state.quests.flowers, 3)}/3)`;
  }


  if (
    paragraphs[1]
  ) {

    paragraphs[1].textContent =
      state.quests.luna
        ? "💬 Talk to Luna ✓"
        : "💬 Talk to Luna";
  }


  if (
    paragraphs[2]
  ) {

    paragraphs[2].textContent =
      state.quests.castle
        ? "🏰 Visit Celestia Castle ✓"
        : "🏰 Visit Celestia Castle";
  }
}


/* =========================================================
   OUTFIT
   ========================================================= */

function toggleOutfit() {

  if (!outfitPanel) {
    return;
  }


  const closed =
    outfitPanel.classList.contains(
      "closed"
    );


  if (closed) {

    openOutfit();

  } else {

    closeOutfit();
  }
}


function openOutfit() {

  if (!outfitPanel) {
    return;
  }

  outfitPanel.classList.remove(
    "closed"
  );

  drawPreview();
}


function closeOutfit() {

  if (!outfitPanel) {
    return;
  }

  outfitPanel.classList.add(
    "closed"
  );
}


window.toggleOutfit =
  toggleOutfit;


/* =========================================================
   OUTFIT OPTIONS
   ========================================================= */

document
  .querySelectorAll(
    ".options"
  )
  .forEach(
    group => {

      const groupName =
        group.dataset.group;


      group
        .querySelectorAll(
          ".option"
        )
        .forEach(
          button => {

            button.addEventListener(
              "click",
              () => {

                group
                  .querySelectorAll(
                    ".option"
                  )
                  .forEach(
                    option =>
                      option.classList.remove(
                        "selected"
                      )
                  );


                button.classList.add(
                  "selected"
                );


                state.outfit[
                  groupName
                ] =
                  button.dataset.value;


                drawPreview();

              }
            );

          }
        );
    }
);


/* =========================================================
   SAVE OUTFIT
   ========================================================= */

function saveOutfit() {

  saveGame();

  showToast(
    "✨ Outfit Eunseorin berhasil disimpan!"
  );
}


window.saveOutfit =
  saveOutfit;


/* =========================================================
   PREVIEW
   ========================================================= */

function drawPreview() {

  if (
    !previewCanvas
  ) {

    return;
  }


  const previewCtx =
    previewCanvas.getContext(
      "2d"
    );


  previewCtx.clearRect(
    0,
    0,
    previewCanvas.width,
    previewCanvas.height
  );


  previewCtx.imageSmoothingEnabled =
    false;


  if (
    !eunseorinLoaded
  ) {

    return;
  }


  /*
    Use full PNG as preview.
  */

  const w =
    82;

  const h =
    108;


  previewCtx.drawImage(
    eunseorinSprite,

    previewCanvas.width / 2 -
      w / 2,

    previewCanvas.height -
      h -
      8,

    w,
    h
  );
}


/* =========================================================
   MINIMAP
   ========================================================= */

function drawMinimap() {

  const width =
    mini.width;

  const height =
    mini.height;


  miniCtx.clearRect(
    0,
    0,
    width,
    height
  );


  /*
    water
  */

  miniCtx.fillStyle =
    "#9fc9df";

  miniCtx.fillRect(
    0,
    0,
    width,
    height
  );


  /*
    island
  */

  miniCtx.fillStyle =
    "#9fbe8f";

  miniCtx.beginPath();

  miniCtx.ellipse(
    width / 2,
    height / 2,
    width * .44,
    height * .42,
    0,
    0,
    Math.PI * 2
  );

  miniCtx.fill();


  /*
    landmarks
  */

  for (
    const place of landmarks
  ) {

    const x =
      place.x /
      WORLD_WIDTH *
      width;

    const y =
      place.y /
      WORLD_HEIGHT *
      height;

    miniCtx.fillStyle =
      "#fff";

    miniCtx.beginPath();

    miniCtx.arc(
      x,
      y,
      4,
      0,
      Math.PI * 2
    );

    miniCtx.fill();
  }


  /*
    player
  */

  const px =
    state.player.x /
    WORLD_WIDTH *
    width;

  const py =
    state.player.y /
    WORLD_HEIGHT *
    height;


  miniCtx.fillStyle =
    "#7b5fc1";

  miniCtx.beginPath();

  miniCtx.arc(
    px,
    py,
    6,
    0,
    Math.PI * 2
  );

  miniCtx.fill();


  /*
    direction line
  */

  miniCtx.strokeStyle =
    "#fff";

  miniCtx.lineWidth =
    2;

  miniCtx.beginPath();

  miniCtx.moveTo(
    px,
    py
  );

  if (
    state.direction ===
    "up"
  ) {

    miniCtx.lineTo(
      px,
      py - 12
    );

  } else if (
    state.direction ===
    "down"
  ) {

    miniCtx.lineTo(
      px,
      py + 12
    );

  } else if (
    state.direction ===
    "left"
  ) {

    miniCtx.lineTo(
      px - 12,
      py
    );

  } else {

    miniCtx.lineTo(
      px + 12,
      py
    );
  }

  miniCtx.stroke();
}


/* =========================================================
   PLAYER NAME / PROFILE
   ========================================================= */

updateProfile();


/* =========================================================
   CHARACTER NAME
   ========================================================= */

if (
  playerName
) {

  playerName.textContent =
    state.name;
}


if (
  profileName
) {

  profileName.textContent =
    state.name;
}


/* =========================================================
   INITIAL PANEL
   ========================================================= */

hideAllPanels();


/*
  Don't cover the map at startup.
*/

if (
  inventoryPanel
) {

  inventoryPanel.classList.add(
    "hidden"
  );
}


/* =========================================================
   WORLD DRAW
   ========================================================= */

function drawWorld(time) {

  drawBackground();


  /*
    World layer
  */

  ctx.save();

  ctx.translate(
    -camera.x,
    -camera.y
  );


  /*
    world sky area
  */

  ctx.fillStyle =
    "#b9d7e7";

  ctx.fillRect(
    0,
    0,
    WORLD_WIDTH,
    WORLD_HEIGHT
  );

  ctx.restore();


  drawIsland();

  drawPaths();

  drawRiver();


  /*
    Decorations
  */

  ctx.save();

  ctx.translate(
    -camera.x,
    -camera.y
  );


  for (
    const flower of flowers
  ) {

    drawFlower(
      flower
    );
  }


  for (
    const tree of trees
  ) {

    drawTree(
      tree
    );
  }


  ctx.restore();


  /*
    Landmarks
  */

  ctx.save();

  ctx.translate(
    -camera.x,
    -camera.y
  );


  for (
    const place of landmarks
  ) {

    drawLandmark(
      place
    );
  }


  drawBridge();


  /*
    Houses
  */

  for (
    const house of houses
  ) {

    drawHouse(
      house.x,
      house.y,
      house.w,
      house.h
    );
  }


  /*
    NPCs
  */

  for (
    const npc of npcs
  ) {

    drawNPC(
      npc,
      time
    );
  }


  /*
    Clouds
  */

  for (
    const cloud of clouds
  ) {

    drawCloud(
      cloud
    );
  }


  ctx.restore();


  /*
    Sparkles
  */

  drawSparkles(
    time
  );


  /*
    Player
  */

  ctx.save();

  ctx.translate(
    -camera.x,
    -camera.y
  );


  drawEunseorin(
    ctx,
    state.player.x,
    state.player.y
  );


  ctx.restore();


  /*
    Minimap
  */

  drawMinimap();
}


/* =========================================================
   NPC DRAW
   ========================================================= */

function drawNPC(
  npc,
  time
) {

  const bob =
    Math.sin(
      time * 2 +
      npc.x
    ) * 2;


  /*
    shadow
  */

  ctx.fillStyle =
    "rgba(70,50,90,.18)";

  ctx.beginPath();

  ctx.ellipse(
    npc.x,
    npc.y + 5,
    23,
    7,
    0,
    0,
    Math.PI * 2
  );

  ctx.fill();


  /*
    simple NPC body
  */

  ctx.fillStyle =
    npc.color;

  ctx.beginPath();

  ctx.roundRect(
    npc.x - 17,
    npc.y - 40 + bob,
    34,
    42,
    12
  );

  ctx.fill();


  /*
    face
  */

  ctx.fillStyle =
    "#ffd2b8";

  ctx.beginPath();

  ctx.arc(
    npc.x,
    npc.y - 50 + bob,
    15,
    0,
    Math.PI * 2
  );

  ctx.fill();


  /*
    hair
  */

  ctx.fillStyle =
    "#6a463b";

  ctx.beginPath();

  ctx.arc(
    npc.x,
    npc.y - 56 + bob,
    16,
    Math.PI,
    Math.PI * 2
  );

  ctx.fill();


  /*
    dialogue marker
  */

  ctx.font =
    "17px Arial";

  ctx.textAlign =
    "center";

  ctx.fillStyle =
    "#fff";

  ctx.fillText(
    "💬",
    npc.x,
    npc.y - 78 + bob
  );


  /*
    name
  */

  ctx.font =
    "bold 13px system-ui";

  ctx.fillStyle =
    "rgba(70,50,80,.8)";

  ctx.fillText(
    npc.name,
    npc.x,
    npc.y + 30
  );
}


/* =========================================================
   CLOUD UPDATE
   ========================================================= */


/* =========================================================
   GAME LOOP
   ========================================================= */

let lastTime =
  performance.now();


function gameLoop(now) {

  const dt =
    Math.min(
      (now - lastTime) /
      1000,
      0.05
    );

  lastTime =
    now;


  updatePlayer(
    dt
  );

  updateCamera();

  updateClouds(
    dt
  );

  updateTime(
    dt
  );

  updateInteraction();


  drawWorld(
    now / 1000
  );


  requestAnimationFrame(
    gameLoop
  );
}


/* =========================================================
   AUTOSAVE
   ========================================================= */

setInterval(
  () => {

    saveGame();

  },
  10000
);


/* =========================================================
   START
   ========================================================= */

saveGame();

updateProfile();

renderInventory();

updateQuestPanel();

requestAnimationFrame(
  gameLoop
);


/* =========================================================
   DEBUG
   ========================================================= */

console.log(
  "✨ CELESTIA loaded successfully!"
);

console.log(
  "👑 Creator:",
  state.name
);

console.log(
  "🗺️ World:",
  WORLD_WIDTH,
  "x",
  WORLD_HEIGHT
);

console.log(
  "👧🏻 Eunseorin:",
  "./assets/%20characters/eunseorin.png"
);
