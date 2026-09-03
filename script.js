/* =========================================================
   CELESTIA ✦ A Cozy Fantasy World
   GAME SCRIPT V2
   ========================================================= */

const canvas = document.getElementById("world");
const ctx = canvas.getContext("2d");

const mini = document.getElementById("mini");
const mctx = mini ? mini.getContext("2d") : null;

let W = 0;
let H = 0;

function resize() {
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;

  if (mini) {
    mini.width = 164;
    mini.height = 109;
  }
}

resize();
window.addEventListener("resize", resize);


/* =========================================================
   WORLD
   ========================================================= */

const WORLD = {
  width: 3600,
  height: 2400
};

const player = {
  x: 1800,
  y: 1420,
  speed: 190,
  radius: 18,
  direction: "down"
};

let camera = {
  x: 0,
  y: 0
};


/* =========================================================
   SAVE DATA
   ========================================================= */

const SAVE_KEY = "celestiaSaveV2";

const DEFAULT_SAVE = {
  name: "Eunseorin",
  nickname: "Kanja",
  outfit: {
    hair: "brown",
    dress: "lavender",
    accessory: "flower"
  },
  player: {
    x: 1800,
    y: 1420,
    direction: "down"
  }
};

let saveData = loadGame();

function loadGame() {
  try {
    const saved = localStorage.getItem(SAVE_KEY);

    if (!saved) {
      return structuredClone(DEFAULT_SAVE);
    }

    const parsed = JSON.parse(saved);

    return {
      ...structuredClone(DEFAULT_SAVE),
      ...parsed,
      outfit: {
        ...DEFAULT_SAVE.outfit,
        ...(parsed.outfit || {})
      },
      player: {
        ...DEFAULT_SAVE.player,
        ...(parsed.player || {})
      }
    };
  } catch (error) {
    console.warn("Save data could not be loaded.", error);
    return structuredClone(DEFAULT_SAVE);
  }
}

function saveGame() {
  saveData.player.x = player.x;
  saveData.player.y = player.y;
  saveData.player.direction = player.direction;

  localStorage.setItem(
    SAVE_KEY,
    JSON.stringify(saveData)
  );
}


/* =========================================================
   APPLY SAVED PLAYER
   ========================================================= */

player.x = saveData.player.x;
player.y = saveData.player.y;
player.direction = saveData.player.direction;

let outfit = {
  ...saveData.outfit
};


/* =========================================================
   KEYBOARD
   ========================================================= */

const keys = {};

window.addEventListener("keydown", function (event) {

  const key = event.key.toLowerCase();

  keys[key] = true;

  if (
    key === "arrowup" ||
    key === "arrowdown" ||
    key === "arrowleft" ||
    key === "arrowright" ||
    key === " "
  ) {
    event.preventDefault();
  }

  if (key === "o") {
    toggleOutfit();
  }

  if (key === "e") {
    interact();
  }

});

window.addEventListener("keyup", function (event) {
  keys[event.key.toLowerCase()] = false;
});


/* =========================================================
   LANDMARKS
   ========================================================= */

const landmarks = [

  {
    name: "Celestia Castle",
    x: 1700,
    y: 360,
    w: 650,
    h: 420,
    type: "castle",
    color: "#cdb8f0"
  },

  {
    name: "Whispering Forest",
    x: 350,
    y: 500,
    w: 850,
    h: 850,
    type: "forest",
    color: "#a9d4ad"
  },

  {
    name: "Central Plaza",
    x: 1450,
    y: 1050,
    w: 700,
    h: 500,
    type: "plaza",
    color: "#ead7b0"
  },

  {
    name: "Cloudhaven Village",
    x: 2450,
    y: 850,
    w: 800,
    h: 700,
    type: "village",
    color: "#f0c9d9"
  },

  {
    name: "Your Home",
    x: 2550,
    y: 1650,
    w: 420,
    h: 330,
    type: "home",
    color: "#dfb9d5"
  },

  {
    name: "Pet Garden",
    x: 950,
    y: 1650,
    w: 480,
    h: 350,
    type: "garden",
    color: "#b8d9ad"
  },

  {
    name: "Sky Dock",
    x: 3000,
    y: 350,
    w: 430,
    h: 300,
    type: "dock",
    color: "#b9d7ed"
  },

  {
    name: "Starfall Bridge",
    x: 1550,
    y: 1850,
    w: 700,
    h: 150,
    type: "bridge",
    color: "#c7a7df"
  }

];


/* =========================================================
   HOUSES
   ========================================================= */

const houses = [

  {
    x: 2580,
    y: 950,
    w: 230,
    h: 190,
    color: "#e8b6c8"
  },

  {
    x: 2910,
    y: 1010,
    w: 230,
    h: 190,
    color: "#b7c9ea"
  },

  {
    x: 2700,
    y: 1280,
    w: 230,
    h: 190,
    color: "#d8c1ec"
  },

  {
    x: 3060,
    y: 1310,
    w: 230,
    h: 190,
    color: "#f0d59d"
  }

];


/* =========================================================
   NPCs
   IMPORTANT:
   These are NPCs, NOT real multiplayer players.
   ⭐ is reserved for real players later.
   ========================================================= */

const npcs = [

  {
    x: 1580,
    y: 1240,
    name: "Luna",
    icon: "💬",
    color: "#d6a5eb",
    dialogue: [
      "Oh! You're finally here, Eunseorin.",
      "Welcome to Cloudhaven.",
      "The castle has been glowing strangely lately...",
      "Maybe there's a secret waiting for you."
    ],
    line: 0
  },

  {
    x: 2050,
    y: 1300,
    name: "Alya",
    icon: "💬",
    color: "#f0b0d1",
    dialogue: [
      "The plaza is always so peaceful.",
      "I love watching the clouds from here.",
      "You should visit the Pet Garden sometime!"
    ],
    line: 0
  },

  {
    x: 2210,
    y: 1480,
    name: "Mika",
    icon: "💬",
    color: "#9dc4e9",
    dialogue: [
      "Hey, Eunseorin!",
      "Have you explored the Whispering Forest?",
      "People say the trees remember old stories."
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


/* deterministic random generator */

let seed = 123456;

function random() {
  seed = (seed * 9301 + 49297) % 233280;
  return seed / 233280;
}


/* =========================================================
   GENERATE TREES
   ========================================================= */

for (let i = 0; i < 120; i++) {

  const x = 120 + random() * (WORLD.width - 240);
  const y = 160 + random() * (WORLD.height - 320);

  if (isInsideAnyLandmark(x, y, 100)) {
    continue;
  }

  trees.push({
    x,
    y,
    size: 0.8 + random() * 0.5
  });
}


/* =========================================================
   GENERATE FLOWERS
   ========================================================= */

for (let i = 0; i < 180; i++) {

  const x = 100 + random() * (WORLD.width - 200);
  const y = 130 + random() * (WORLD.height - 260);

  flowers.push({
    x,
    y,
    size: 0.7 + random() * 0.7,
    type: Math.floor(random() * 4)
  });
}


/* =========================================================
   GENERATE CLOUDS
   ========================================================= */

for (let i = 0; i < 35; i++) {

  clouds.push({
    x: random() * WORLD.width,
    y: 80 + random() * 500,
    size: 0.7 + random() * 1.2,
    speed: 5 + random() * 10
  });

}


/* =========================================================
   UTILS
   ========================================================= */

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function distance(x1, y1, x2, y2) {
  return Math.hypot(
    x1 - x2,
    y1 - y2
  );
}

function isInsideAnyLandmark(x, y, padding = 0) {

  return landmarks.some(item => {

    return (
      x > item.x - padding &&
      x < item.x + item.w + padding &&
      y > item.y - padding &&
      y < item.y + item.h + padding
    );

  });

}


/* =========================================================
   COLLISION
   ========================================================= */

function circleRectCollision(
  cx,
  cy,
  radius,
  rect
) {

  const closestX = clamp(
    cx,
    rect.x,
    rect.x + rect.w
  );

  const closestY = clamp(
    cy,
    rect.y,
    rect.y + rect.h
  );

  const dx = cx - closestX;
  const dy = cy - closestY;

  return (
    dx * dx +
    dy * dy
  ) < radius * radius;
}


function blocked(x, y) {

  const radius = player.radius;

  /* world boundary */

  if (
    x < 90 ||
    y < 110 ||
    x > WORLD.width - 90 ||
    y > WORLD.height - 90
  ) {
    return true;
  }


  /* landmarks */

  for (const landmark of landmarks) {

    if (
      landmark.type === "forest" ||
      landmark.type === "plaza" ||
      landmark.type === "bridge"
    ) {
      continue;
    }

    if (
      circleRectCollision(
        x,
        y,
        radius,
        {
          x: landmark.x + 30,
          y: landmark.y + 30,
          w: landmark.w - 60,
          h: landmark.h - 60
        }
      )
    ) {
      return true;
    }

  }


  /* houses */

  for (const house of houses) {

    if (
      circleRectCollision(
        x,
        y,
        radius,
        {
          x: house.x,
          y: house.y,
          w: house.w,
          h: house.h
        }
      )
    ) {
      return true;
    }

  }


  /* selected trees */

  for (let i = 0; i < trees.length; i += 2) {

    const tree = trees[i];

    if (
      distance(
        x,
        y,
        tree.x,
        tree.y
      ) < 38
    ) {
      return true;
    }

  }

  return false;
}


/* =========================================================
   MOVEMENT
   ========================================================= */

function updateMovement(dt) {

  let dx = 0;
  let dy = 0;

  if (
    keys["w"] ||
    keys["arrowup"]
  ) {
    dy -= 1;
  }

  if (
    keys["s"] ||
    keys["arrowdown"]
  ) {
    dy += 1;
  }

  if (
    keys["a"] ||
    keys["arrowleft"]
  ) {
    dx -= 1;
  }

  if (
    keys["d"] ||
    keys["arrowright"]
  ) {
    dx += 1;
  }


  if (dx === 0 && dy === 0) {
    return;
  }


  const length = Math.hypot(dx, dy);

  dx /= length;
  dy /= length;


  if (Math.abs(dx) > Math.abs(dy)) {

    player.direction =
      dx > 0 ? "right" : "left";

  } else {

    player.direction =
      dy > 0 ? "down" : "up";

  }


  const moveX =
    dx * player.speed * dt;

  const moveY =
    dy * player.speed * dt;


  /* X collision */

  if (!blocked(player.x + moveX, player.y)) {
    player.x += moveX;
  }


  /* Y collision */

  if (!blocked(player.x, player.y + moveY)) {
    player.y += moveY;
  }

}


/* =========================================================
   CAMERA
   ========================================================= */

function updateCamera(dt) {

  const targetX =
    player.x - W / 2;

  const targetY =
    player.y - H / 2;


  const smoothing =
    1 - Math.pow(0.0001, dt);


  camera.x +=
    (targetX - camera.x) *
    smoothing;

  camera.y +=
    (targetY - camera.y) *
    smoothing;


  camera.x = clamp(
    camera.x,
    0,
    Math.max(0, WORLD.width - W)
  );

  camera.y = clamp(
    camera.y,
    0,
    Math.max(0, WORLD.height - H)
  );

}


/* =========================================================
   BACKGROUND
   ========================================================= */

function drawBackground() {

  const gradient =
    ctx.createLinearGradient(
      0,
      0,
      0,
      H
    );

  gradient.addColorStop(
    0,
    "#d9c5ef"
  );

  gradient.addColorStop(
    0.45,
    "#f2c7d9"
  );

  gradient.addColorStop(
    1,
    "#b9d7d2"
  );

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, W, H);

}


/* =========================================================
   CLOUDS
   ========================================================= */

function drawClouds(time) {

  for (const cloud of clouds) {

    const x =
      cloud.x -
      camera.x * 0.25 +
      Math.sin(time * 0.00005 + cloud.y) * 15;

    const y =
      cloud.y -
      camera.y * 0.15;

    if (
      x < -250 ||
      x > W + 250
    ) {
      continue;
    }

    drawCloud(
      x,
      y,
      cloud.size
    );

  }

}


function drawCloud(x, y, scale) {

  ctx.save();

  ctx.translate(x, y);
  ctx.scale(scale, scale);

  ctx.fillStyle =
    "rgba(255,255,255,.72)";

  ctx.beginPath();

  ctx.arc(-45, 8, 30, 0, Math.PI * 2);
  ctx.arc(-10, -10, 42, 0, Math.PI * 2);
  ctx.arc(35, 8, 32, 0, Math.PI * 2);

  ctx.fillRect(
    -65,
    8,
    130,
    30
  );

  ctx.fill();

  ctx.restore();

}


/* =========================================================
   ISLAND
   ========================================================= */

function drawIsland() {

  ctx.save();

  ctx.translate(
    -camera.x,
    -camera.y
  );


  /* shadow */

  ctx.fillStyle =
    "rgba(70,50,90,.15)";

  ctx.beginPath();

  ctx.ellipse(
    WORLD.width / 2,
    WORLD.height / 2 + 100,
    1650,
    1000,
    0,
    0,
    Math.PI * 2
  );

  ctx.fill();


  /* main island */

  ctx.fillStyle =
    "#82ae7c";

  ctx.beginPath();

  ctx.ellipse(
    WORLD.width / 2,
    WORLD.height / 2,
    1620,
    980,
    0,
    0,
    Math.PI * 2
  );

  ctx.fill();


  /* inner grass */

  ctx.fillStyle =
    "#92bc88";

  ctx.beginPath();

  ctx.ellipse(
    WORLD.width / 2,
    WORLD.height / 2 - 15,
    1530,
    900,
    0,
    0,
    Math.PI * 2
  );

  ctx.fill();


  /* island bottom clouds */

  ctx.fillStyle =
    "rgba(255,255,255,.75)";

  for (let i = 0; i < 12; i++) {

    const x =
      500 + i * 260;

    const y =
      WORLD.height - 100;

    ctx.beginPath();

    ctx.arc(
      x,
      y,
      90,
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

  ctx.lineCap = "round";


  /* castle path */

  ctx.strokeStyle =
    "#e7d5ad";

  ctx.lineWidth = 100;

  ctx.beginPath();

  ctx.moveTo(
    1800,
    1100
  );

  ctx.lineTo(
    2000,
    760
  );

  ctx.stroke();


  /* village path */

  ctx.beginPath();

  ctx.moveTo(
    2100,
    1300
  );

  ctx.lineTo(
    2600,
    1150
  );

  ctx.stroke();


  /* home path */

  ctx.beginPath();

  ctx.moveTo(
    1900,
    1500
  );

  ctx.lineTo(
    2700,
    1750
  );

  ctx.stroke();


  /* garden path */

  ctx.beginPath();

  ctx.moveTo(
    1600,
    1500
  );

  ctx.lineTo(
    1200,
    1750
  );

  ctx.stroke();


  ctx.restore();

}


/* =========================================================
   LANDMARKS
   ========================================================= */

function drawLandmarks() {

  ctx.save();

  ctx.translate(
    -camera.x,
    -camera.y
  );


  for (const landmark of landmarks) {

    drawLandmark(
      landmark
    );

  }


  ctx.restore();

}


function drawLandmark(item) {

  const {
    x,
    y,
    w,
    h,
    type,
    name
  } = item;


  if (type === "castle") {

    drawCastle(
      x + w / 2,
      y + h / 2
    );

  }

  else if (type === "forest") {

    /* forest label only */

    drawLabel(
      name,
      x + w / 2,
      y + 40
    );

  }

  else if (type === "plaza") {

    ctx.fillStyle =
      "#e9d4a8";

    ctx.beginPath();

    ctx.ellipse(
      x + w / 2,
      y + h / 2,
      w / 2,
      h / 2,
      0,
      0,
      Math.PI * 2
    );

    ctx.fill();

    drawLabel(
      name,
      x + w / 2,
      y + 40
    );

  }

  else if (type === "village") {

    drawLabel(
      name,
      x + w / 2,
      y + 40
    );

  }

  else if (type === "home") {

    drawHouse(
      x + w / 2,
      y + h / 2,
      "#dcb2cf"
    );

    drawLabel(
      name,
      x + w / 2,
      y + 35
    );

  }

  else if (type === "garden") {

    ctx.fillStyle =
      "#a8c994";

    ctx.beginPath();

    ctx.roundRect(
      x,
      y,
      w,
      h,
      50
    );

    ctx.fill();

    drawLabel(
      name,
      x + w / 2,
      y + 35
    );

  }

  else if (type === "dock") {

    ctx.fillStyle =
      "#d9b884";

    ctx.fillRect(
      x,
      y + 90,
      w,
      80
    );

    drawLabel(
      name,
      x + w / 2,
      y + 45
    );

  }

  else if (type === "bridge") {

    ctx.fillStyle =
      "#bd93d3";

    ctx.fillRect(
      x,
      y,
      w,
      h
    );

    drawLabel(
      name,
      x + w / 2,
      y - 20
    );

  }

}


/* =========================================================
   CASTLE
   ========================================================= */

function drawCastle(x, y) {

  ctx.save();

  ctx.translate(x, y);

  /* main building */

  ctx.fillStyle =
    "#eee4fa";

  ctx.fillRect(
    -220,
    -90,
    440,
    260
  );


  /* towers */

  const towers = [
    -180,
    0,
    180
  ];

  for (const tx of towers) {

    ctx.fillStyle =
      "#d5bced";

    ctx.fillRect(
      tx - 45,
      -180,
      90,
      270
    );

    ctx.fillStyle =
      "#9b78ca";

    ctx.beginPath();

    ctx.moveTo(
      tx - 60,
      -180
    );

    ctx.lineTo(
      tx,
      -250
    );

    ctx.lineTo(
      tx + 60,
      -180
    );

    ctx.closePath();

    ctx.fill();

  }


  /* door */

  ctx.fillStyle =
    "#80609e";

  ctx.beginPath();

  ctx.arc(
    0,
    100,
    55,
    Math.PI,
    0
  );

  ctx.fillRect(
    -55,
    100,
    110,
    70
  );

  ctx.fill();


  ctx.restore();

}


/* =========================================================
   HOUSE
   ========================================================= */

function drawHouse(
  x,
  y,
  roofColor
) {

  ctx.save();

  ctx.translate(x, y);

  ctx.fillStyle =
    "#fff3dc";

  ctx.fillRect(
    -100,
    -20,
    200,
    130
  );


  ctx.fillStyle =
    roofColor;

  ctx.beginPath();

  ctx.moveTo(
    -130,
    -20
  );

  ctx.lineTo(
    0,
    -130
  );

  ctx.lineTo(
    130,
    -20
  );

  ctx.closePath();

  ctx.fill();


  ctx.fillStyle =
    "#8b668d";

  ctx.fillRect(
    -25,
    45,
    50,
    65
  );


  ctx.fillStyle =
    "#b9d9ee";

  ctx.fillRect(
    -75,
    20,
    45,
    45
  );

  ctx.fillRect(
    30,
    20,
    45,
    45
  );


  ctx.restore();

}


/* =========================================================
   TREES
   ========================================================= */

function drawTrees() {

  ctx.save();

  ctx.translate(
    -camera.x,
    -camera.y
  );


  for (const tree of trees) {

    drawTree(
      tree.x,
      tree.y,
      tree.size
    );

  }


  ctx.restore();

}


function drawTree(
  x,
  y,
  scale
) {

  ctx.save();

  ctx.translate(x, y);
  ctx.scale(scale, scale);


  ctx.fillStyle =
    "#765b4c";

  ctx.fillRect(
    -12,
    10,
    24,
    65
  );


  ctx.fillStyle =
    "#4f8d69";

  ctx.beginPath();

  ctx.arc(
    -25,
    5,
    42,
    0,
    Math.PI * 2
  );

  ctx.arc(
    25,
    5,
    42,
    0,
    Math.PI * 2
  );

  ctx.arc(
    0,
    -28,
    48,
    0,
    Math.PI * 2
  );

  ctx.fill();


  ctx.fillStyle =
    "rgba(255,255,255,.15)";

  ctx.beginPath();

  ctx.arc(
    -14,
    -35,
    13,
    0,
    Math.PI * 2
  );

  ctx.fill();


  ctx.restore();

}


/* =========================================================
   FLOWERS
   ========================================================= */

function drawFlowers() {

  ctx.save();

  ctx.translate(
    -camera.x,
    -camera.y
  );


  const colors = [
    "#f29bc1",
    "#c9a5ef",
    "#f7d57e",
    "#8cc8e8"
  ];


  for (const flower of flowers) {

    const color =
      colors[flower.type];


    ctx.save();

    ctx.translate(
      flower.x,
      flower.y
    );

    ctx.scale(
      flower.size,
      flower.size
    );


    ctx.fillStyle =
      color;

    for (let i = 0; i < 5; i++) {

      const angle =
        i * Math.PI * 2 / 5;

      ctx.beginPath();

      ctx.arc(
        Math.cos(angle) * 7,
        Math.sin(angle) * 7,
        5,
        0,
        Math.PI * 2
      );

      ctx.fill();

    }


    ctx.fillStyle =
      "#f5d875";

    ctx.beginPath();

    ctx.arc(
      0,
      0,
      4,
      0,
      Math.PI * 2
    );

    ctx.fill();


    ctx.restore();

  }


  ctx.restore();

}


/* =========================================================
   LABEL
   ========================================================= */

function drawLabel(
  text,
  x,
  y
) {

  ctx.save();

  ctx.font =
    "bold 15px Arial";

  ctx.textAlign =
    "center";

  const width =
    ctx.measureText(text).width + 28;


  ctx.fillStyle =
    "rgba(55,42,70,.75)";

  ctx.beginPath();

  ctx.roundRect(
    x - width / 2,
    y - 18,
    width,
    30,
    15
  );

  ctx.fill();


  ctx.fillStyle =
    "#ffffff";

  ctx.fillText(
    text,
    x,
    y + 2
  );


  ctx.restore();

}


/* =========================================================
   NPC
   ========================================================= */

function drawNPCs() {

  ctx.save();

  ctx.translate(
    -camera.x,
    -camera.y
  );


  for (const npc of npcs) {

    drawNPC(
      npc
    );

  }


  ctx.restore();

}


function drawNPC(npc) {

  const bob =
    Math.sin(
      performance.now() * 0.003 +
      npc.x
    ) * 2;


  ctx.save();

  ctx.translate(
    npc.x,
    npc.y + bob
  );


  /* shadow */

  ctx.fillStyle =
    "rgba(50,40,60,.15)";

  ctx.beginPath();

  ctx.ellipse(
    0,
    30,
    22,
    8,
    0,
    0,
    Math.PI * 2
  );

  ctx.fill();


  /* body */

  ctx.fillStyle =
    npc.color;

  ctx.beginPath();

  ctx.roundRect(
    -20,
    -5,
    40,
    55,
    12
  );

  ctx.fill();


  /* head */

  ctx.fillStyle =
    "#ffe1cc";

  ctx.beginPath();

  ctx.arc(
    0,
    -22,
    21,
    0,
    Math.PI * 2
  );

  ctx.fill();


  /* hair */

  ctx.fillStyle =
    "#513d4e";

  ctx.beginPath();

  ctx.arc(
    0,
    -29,
    22,
    Math.PI,
    Math.PI * 2
  );

  ctx.fill();


  /* eyes */

  ctx.fillStyle =
    "#403344";

  ctx.beginPath();

  ctx.arc(
    -7,
    -20,
    2.5,
    0,
    Math.PI * 2
  );

  ctx.arc(
    7,
    -20,
    2.5,
    0,
    Math.PI * 2
  );

  ctx.fill();


  /* NPC icon */

  ctx.font =
    "16px Arial";

  ctx.textAlign =
    "center";

  ctx.fillText(
    npc.icon,
    0,
    -62
  );


  /* name */

  ctx.font =
    "bold 12px Arial";

  ctx.fillStyle =
    "#ffffff";

  ctx.fillText(
    npc.name,
    0,
    70
  );


  ctx.restore();

}


/* =========================================================
   PLAYER
   ========================================================= */

function drawPlayer() {

  ctx.save();

  ctx.translate(
    player.x - camera.x,
    player.y - camera.y
  );


  const walking =
    keys["w"] ||
    keys["a"] ||
    keys["s"] ||
    keys["d"] ||
    keys["arrowup"] ||
    keys["arrowdown"] ||
    keys["arrowleft"] ||
    keys["arrowright"];


  const bounce =
    walking
      ? Math.sin(
          performance.now() * 0.015
        ) * 3
      : 0;


  ctx.translate(
    0,
    bounce
  );


  /* creator marker */

  ctx.font =
    "18px Arial";

  ctx.textAlign =
    "center";

  ctx.fillText(
    "👑",
    0,
    -76
  );


  /* name */

  ctx.font =
    "bold 12px Arial";

  ctx.fillStyle =
    "#ffffff";

  ctx.fillText(
    "Eunseorin",
    0,
    -58
  );


  /* shadow */

  ctx.fillStyle =
    "rgba(50,40,60,.2)";

  ctx.beginPath();

  ctx.ellipse(
    0,
    34,
    23,
    8,
    0,
    0,
    Math.PI * 2
  );

  ctx.fill();


  /* dress */

  const dressColors = {
    lavender: "#c7a9ed",
    pink: "#efabc9",
    blue: "#a8cceb",
    cream: "#f1d8a6"
  };


  ctx.fillStyle =
    dressColors[outfit.dress] ||
    dressColors.lavender;


  ctx.beginPath();

  ctx.roundRect(
    -27,
    -2,
    54,
    55,
    14
  );

  ctx.fill();


  /* sleeves */

  ctx.fillStyle =
    dressColors[outfit.dress] ||
    dressColors.lavender;

  ctx.beginPath();

  ctx.arc(
    -27,
    12,
    10,
    0,
    Math.PI * 2
  );

  ctx.arc(
    27,
    12,
    10,
    0,
    Math.PI * 2
  );

  ctx.fill();


  /* neck */

  ctx.fillStyle =
    "#ffdcca";

  ctx.fillRect(
    -7,
    -8,
    14,
    13
  );


  /* face */

  ctx.beginPath();

  ctx.arc(
    0,
    -27,
    25,
    0,
    Math.PI * 2
  );

  ctx.fill();


  /* hair */

  const hairColors = {
    brown: "#654958",
    black: "#282536",
    purple: "#7c5a9e",
    pink: "#d77ca6"
  };


  ctx.fillStyle =
    hairColors[outfit.hair] ||
    hairColors.brown;


  ctx.beginPath();

  ctx.arc(
    0,
    -34,
    27,
    Math.PI,
    Math.PI * 2
  );

  ctx.fill();


  /* side hair */

  ctx.fillRect(
    -26,
    -36,
    9,
    35
  );

  ctx.fillRect(
    17,
    -36,
    9,
    35
  );


  /* eyes */

  ctx.fillStyle =
    "#403445";

  ctx.beginPath();

  ctx.arc(
    -9,
    -25,
    4,
    0,
    Math.PI * 2
  );

  ctx.arc(
    9,
    -25,
    4,
    0,
    Math.PI * 2
  );

  ctx.fill();


  /* eye highlights */

  ctx.fillStyle =
    "#ffffff";

  ctx.beginPath();

  ctx.arc(
    -8,
    -26,
    1.5,
    0,
    Math.PI * 2
  );

  ctx.arc(
    10,
    -26,
    1.5,
    0,
    Math.PI * 2
  );

  ctx.fill();


  /* mouth */

  ctx.strokeStyle =
    "#a76b7e";

  ctx.lineWidth = 2;

  ctx.beginPath();

  ctx.arc(
    0,
    -17,
    5,
    0,
    Math.PI
  );

  ctx.stroke();


  /* accessory */

  drawPlayerAccessory();


  ctx.restore();

}


/* =========================================================
   PLAYER ACCESSORIES
   ========================================================= */

function drawPlayerAccessory() {

  if (outfit.accessory === "flower") {

    ctx.fillStyle =
      "#f28eb5";

    for (let i = 0; i < 5; i++) {

      const angle =
        i * Math.PI * 2 / 5;

      ctx.beginPath();

      ctx.arc(
        Math.cos(angle) * 7 - 18,
        Math.sin(angle) * 7 - 40,
        5,
        0,
        Math.PI * 2
      );

      ctx.fill();

    }

    ctx.fillStyle =
      "#f5d86d";

    ctx.beginPath();

    ctx.arc(
      -18,
      -40,
      3,
      0,
      Math.PI * 2
    );

    ctx.fill();

  }


  if (outfit.accessory === "bow") {

    ctx.fillStyle =
      "#e96b9e";

    ctx.beginPath();

    ctx.moveTo(
      -15,
      -42
    );

    ctx.lineTo(
      -2,
      -50
    );

    ctx.lineTo(
      -3,
      -35
    );

    ctx.closePath();

    ctx.fill();


    ctx.beginPath();

    ctx.moveTo(
      -2,
      -50
    );

    ctx.lineTo(
      12,
      -42
    );

    ctx.lineTo(
      0,
      -35
    );

    ctx.closePath();

    ctx.fill();

  }


  if (outfit.accessory === "crown") {

    ctx.fillStyle =
      "#f2cc67";

    ctx.beginPath();

    ctx.moveTo(
      -18,
      -50
    );

    ctx.lineTo(
      -12,
      -35
    );

    ctx.lineTo(
      0,
      -45
    );

    ctx.lineTo(
      12,
      -35
    );

    ctx.lineTo(
      18,
      -50
    );

    ctx.closePath();

    ctx.fill();

  }


  if (outfit.accessory === "star") {

    ctx.fillStyle =
      "#f7d86d";

    drawStar(
      20,
      -47,
      8
    );

  }

}


function drawStar(
  x,
  y,
  radius
) {

  ctx.beginPath();

  for (let i = 0; i < 10; i++) {

    const angle =
      -Math.PI / 2 +
      i * Math.PI / 5;

    const r =
      i % 2 === 0
        ? radius
        : radius * 0.45;

    const px =
      x + Math.cos(angle) * r;

    const py =
      y + Math.sin(angle) * r;

    if (i === 0) {
      ctx.moveTo(px, py);
    } else {
      ctx.lineTo(px, py);
    }

  }

  ctx.closePath();
  ctx.fill();

}


/* =========================================================
   OUTFIT SYSTEM
   ========================================================= */

function toggleOutfit() {

  const panel =
    document.getElementById(
      "outfitPanel"
    );

  if (!panel) {
    return;
  }


  const isOpen =
    panel.classList.contains("show") ||
    getComputedStyle(panel).display !== "none";


  if (isOpen) {

    panel.classList.remove("show");

    /*
      Existing CELESTIA CSS normally hides
      the panel when .show is absent.
    */

    panel.style.display = "none";

  } else {

    panel.style.display = "block";

    panel.classList.add("show");

    updateOutfitButtons();

  }

}


function updateOutfitButtons() {

  const groups = [
    {
      id: "hairOptions",
      value: outfit.hair
    },
    {
      id: "dressOptions",
      value: outfit.dress
    },
    {
      id: "accessoryOptions",
      value: outfit.accessory
    }
  ];


  for (const group of groups) {

    const container =
      document.getElementById(
        group.id
      );

    if (!container) {
      continue;
    }


    const buttons =
      container.querySelectorAll(
        ".option"
      );


    buttons.forEach(button => {

      const active =
        button.dataset.value ===
        group.value;

      button.classList.toggle(
        "active",
        active
      );

    });

  }


  renderOutfitPreview();

}


function setupOutfitButtons() {

  const containers = [
    "hairOptions",
    "dressOptions",
    "accessoryOptions"
  ];


  containers.forEach(id => {

    const container =
      document.getElementById(id);

    if (!container) {
      return;
    }


    container
      .querySelectorAll(".option")
      .forEach(button => {

        button.addEventListener(
          "click",
          function () {

            const value =
              this.dataset.value;

            if (!value) {
              return;
            }


            if (id === "hairOptions") {
              outfit.hair = value;
            }

            if (id === "dressOptions") {
              outfit.dress = value;
            }

            if (id === "accessoryOptions") {
              outfit.accessory = value;
            }


            updateOutfitButtons();

          }
        );

      });

  });

}


function saveOutfit() {

  saveData.outfit = {
    ...outfit
  };

  saveGame();

  showToast(
    "Outfit saved ✦"
  );

}


/* =========================================================
   OUTFIT PREVIEW
   ========================================================= */

function renderOutfitPreview() {

  const preview =
    document.getElementById(
      "previewCharacter"
    );

  if (!preview) {
    return;
  }


  const hair = {
    brown: "🤎",
    black: "🖤",
    purple: "💜",
    pink: "🩷"
  }[outfit.hair] || "🤎";


  const dress = {
    lavender: "💜",
    pink: "🩷",
    blue: "💙",
    cream: "🤍"
  }[outfit.dress] || "💜";


  const accessory = {
    flower: "🌸",
    bow: "🎀",
    crown: "👑",
    star: "⭐"
  }[outfit.accessory] || "🌸";


  preview.innerHTML = `
    <div style="
      position:relative;
      font-size:54px;
      line-height:1;
      text-align:center;
    ">
      ${hair}
      <div style="
        font-size:42px;
        margin-top:-8px;
      ">👧🏻</div>
      <div style="
        font-size:30px;
        margin-top:-7px;
      ">${dress}</div>
      <div style="
        position:absolute;
        top:-16px;
        right:15px;
        font-size:20px;
      ">${accessory}</div>
    </div>
  `;

}


/* =========================================================
   INTERACTION
   ========================================================= */

let currentInteraction = null;

function getNearestNPC() {

  let nearest = null;
  let nearestDistance = Infinity;


  for (const npc of npcs) {

    const d =
      distance(
        player.x,
        player.y,
        npc.x,
        npc.y
      );


    if (
      d < nearestDistance &&
      d < 100
    ) {

      nearest = npc;
      nearestDistance = d;

    }

  }

  return nearest;

}


function getNearestLandmark() {

  let nearest = null;
  let nearestDistance = Infinity;


  for (const landmark of landmarks) {

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


    if (
      d < nearestDistance &&
      d < 150
    ) {

      nearest = landmark;
      nearestDistance = d;

    }

  }

  return nearest;

}


function updateInteraction() {

  const box =
    document.getElementById(
      "interactBox"
    );

  if (!box) {
    return;
  }


  const npc =
    getNearestNPC();


  if (npc) {

    currentInteraction = {
      type: "npc",
      target: npc
    };


    box.innerHTML = `
      <b>💬 ${npc.name}</b>
      <span>Press <strong>E</strong> to talk</span>
    `;

    box.classList.add("show");

    return;

  }


  const landmark =
    getNearestLandmark();


  if (landmark) {

    currentInteraction = {
      type: "landmark",
      target: landmark
    };


    box.innerHTML = `
      <b>✨ ${landmark.name}</b>
      <span>Press <strong>E</strong> to explore</span>
    `;

    box.classList.add("show");

    return;

  }


  currentInteraction = null;

  box.classList.remove("show");

}


/* =========================================================
   INTERACT
   ========================================================= */

function interact() {

  if (!currentInteraction) {
    return;
  }


  if (
    currentInteraction.type === "npc"
  ) {

    talkToNPC(
      currentInteraction.target
    );

  }


  if (
    currentInteraction.type === "landmark"
  ) {

    exploreLandmark(
      currentInteraction.target
    );

  }

}


window.interact = interact;


/* =========================================================
   NPC DIALOGUE
   ========================================================= */

function talkToNPC(npc) {

  const dialog =
    document.getElementById(
      "dialog"
    );

  const dialogName =
    document.getElementById(
      "dialogName"
    );

  const dialogText =
    document.getElementById(
      "dialogText"
    );


  if (!dialog) {
    return;
  }


  dialogName.textContent =
    npc.name;


  dialogText.textContent =
    npc.dialogue[npc.line];


  npc.line =
    (npc.line + 1) %
    npc.dialogue.length;


  dialog.classList.add(
    "show"
  );

}


/* =========================================================
   CLOSE DIALOGUE
   ========================================================= */

function closeDialog() {

  const dialog =
    document.getElementById(
      "dialog"
    );

  if (dialog) {
    dialog.classList.remove(
      "show"
    );
  }

}


/* click dialogue to close */

const dialogElement =
  document.getElementById("dialog");

if (dialogElement) {

  dialogElement.addEventListener(
    "click",
    closeDialog
  );

}


/* =========================================================
   LANDMARK EXPLORATION
   ========================================================= */

function exploreLandmark(
  landmark
) {

  const messages = {

    "Celestia Castle":
      "The castle doors shimmer with mysterious magic...",

    "Whispering Forest":
      "You hear the trees whispering an ancient melody...",

    "Central Plaza":
      "The heart of Cloudhaven feels peaceful and warm.",

    "Cloudhaven Village":
      "Tiny homes, cozy lights, and friendly faces surround you.",

    "Your Home":
      "Home sweet home. You can make this place yours someday. ♡",

    "Pet Garden":
      "You hear a tiny bunny hopping through the flowers.",

    "Sky Dock":
      "Airships travel between the floating islands from here.",

    "Starfall Bridge":
      "Stars seem to sparkle beneath the bridge..."
  };


  showToast(
    messages[landmark.name] ||
    `You discovered ${landmark.name}!`
  );

}


/* =========================================================
   TOAST
   ========================================================= */

let toastTimer = null;

function showToast(message) {

  const toast =
    document.getElementById(
      "toast"
    );

  if (!toast) {
    return;
  }


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
      2200
    );

}


/* =========================================================
   MINIMAP
   ========================================================= */

function drawMinimap() {

  if (!mctx || !mini) {
    return;
  }


  mctx.clearRect(
    0,
    0,
    mini.width,
    mini.height
  );


  const sx =
    mini.width /
    WORLD.width;

  const sy =
    mini.height /
    WORLD.height;


  /* world */

  mctx.fillStyle =
    "#9dc18f";

  mctx.fillRect(
    0,
    0,
    mini.width,
    mini.height
  );


  /* water / edge */

  mctx.strokeStyle =
    "rgba(255,255,255,.7)";

  mctx.lineWidth = 3;

  mctx.strokeRect(
    3,
    3,
    mini.width - 6,
    mini.height - 6
  );


  /* landmarks */

  for (const landmark of landmarks) {

    mctx.fillStyle =
      landmark.type === "castle"
        ? "#b48dd8"
        : "#e3c6a1";


    mctx.fillRect(
      landmark.x * sx,
      landmark.y * sy,
      landmark.w * sx,
      landmark.h * sy
    );

  }


  /* NPCs */

  mctx.fillStyle =
    "#ffffff";

  for (const npc of npcs) {

    mctx.beginPath();

    mctx.arc(
      npc.x * sx,
      npc.y * sy,
      2,
      0,
      Math.PI * 2
    );

    mctx.fill();

  }


  /* player */

  mctx.fillStyle =
    "#ffffff";

  mctx.beginPath();

  mctx.arc(
    player.x * sx,
    player.y * sy,
    4,
    0,
    Math.PI * 2
  );

  mctx.fill();


  mctx.strokeStyle =
    "#6c4d8c";

  mctx.lineWidth = 1;

  mctx.stroke();

}


/* =========================================================
   RANDOM SPARKLES
   ========================================================= */

function createSparkle() {

  sparkles.push({

    x:
      player.x +
      (Math.random() - 0.5) *
      500,

    y:
      player.y +
      (Math.random() - 0.5) *
      350,

    life: 1,

    size:
      2 +
      Math.random() * 4

  });

}


function updateSparkles(dt) {

  for (
    let i = sparkles.length - 1;
    i >= 0;
    i--
  ) {

    const sparkle =
      sparkles[i];

    sparkle.life -=
      dt * 0.7;


    sparkle.y -=
      12 * dt;


    if (
      sparkle.life <= 0
    ) {

      sparkles.splice(
        i,
        1
      );

    }

  }

}


function drawSparkles() {

  ctx.save();

  for (const sparkle of sparkles) {

    const x =
      sparkle.x -
      camera.x;

    const y =
      sparkle.y -
      camera.y;


    ctx.globalAlpha =
      sparkle.life;

    ctx.fillStyle =
      "#ffffff";


    ctx.beginPath();

    ctx.arc(
      x,
      y,
      sparkle.size,
      0,
      Math.PI * 2
    );

    ctx.fill();

  }

  ctx.restore();

}


/* =========================================================
   GAME LOOP
   ========================================================= */

let lastTime =
  performance.now();

let sparkleTimer = 0;
let saveTimer = 0;

function gameLoop(time) {

  let dt =
    (time - lastTime) / 1000;

  lastTime = time;


  /* prevent huge movement after tab switching */

  dt =
    Math.min(
      dt,
      0.033
    );


  /* movement */

  updateMovement(
    dt
  );


  /* camera */

  updateCamera(
    dt
  );


  /* interaction */

  updateInteraction();


  /* sparkles */

  sparkleTimer += dt;

  if (
    sparkleTimer > 0.7
  ) {

    createSparkle();

    sparkleTimer = 0;

  }

  updateSparkles(dt);


  /* autosave */

  saveTimer += dt;

  if (
    saveTimer > 5
  ) {

    saveGame();

    saveTimer = 0;

  }


  /* =========================
     DRAW
     ========================= */

  drawBackground();

  drawClouds(time);

  drawIsland();

  drawPaths();

  drawLandmarks();

  drawTrees();

  drawFlowers();

  drawNPCs();

  drawSparkles();

  drawPlayer();

  drawMinimap();


  requestAnimationFrame(
    gameLoop
  );

}


/* =========================================================
   SAVE BUTTON
   ========================================================= */

const saveButton =
  document.querySelector(
    ".save"
  );

if (saveButton) {

  saveButton.addEventListener(
    "click",
    function () {

      saveGame();

      showToast(
        "Game saved ✦"
      );

    }
  );

}


/* =========================================================
   CHARACTER NAME
   ========================================================= */

const nameInput =
  document.getElementById(
    "characterName"
  );

if (nameInput) {

  nameInput.value =
    saveData.name;

  nameInput.addEventListener(
    "input",
    function () {

      saveData.name =
        this.value ||
        "Eunseorin";

      updatePlayerName();

      saveGame();

    }
  );

}


function updatePlayerName() {

  const name =
    saveData.name ||
    "Eunseorin";


  const elements =
    document.querySelectorAll(
      "#playerName"
    );


  elements.forEach(
    element => {

      element.textContent =
        name;

    }
  );

}


/* =========================================================
   INITIALIZE
   ========================================================= */

setupOutfitButtons();

updateOutfitButtons();

updatePlayerName();


/* =========================================================
   RESET GAME
   ========================================================= */

const resetButton =
  document.querySelector(
    ".resetGame"
  );


if (resetButton) {

  resetButton.addEventListener(
    "click",
    function () {

      const confirmed =
        confirm(
          "Reset your CELESTIA save?"
        );


      if (!confirmed) {
        return;
      }


      localStorage.removeItem(
        SAVE_KEY
      );


      location.reload();

    }
  );

}


/* =========================================================
   EXPOSE FUNCTIONS FOR HTML
   ========================================================= */

window.toggleOutfit =
  toggleOutfit;

window.saveOutfit =
  saveOutfit;


/* =========================================================
   START
   ========================================================= */

requestAnimationFrame(
  gameLoop
);
