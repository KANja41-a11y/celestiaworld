(() => {

"use strict";


// ======================================================
// CELESTIA V3
// Cozy Fantasy Pixel RPG
// ======================================================


// ================= CANVAS =================

const canvas = document.getElementById("world");
const ctx = canvas.getContext("2d");

const mini = document.getElementById("mini");
const mctx = mini.getContext("2d");


// ================= WORLD =================

const WORLD_WIDTH = 3600;
const WORLD_HEIGHT = 2400;


// ================= SAVE =================

const SAVE_KEY = "CELESTIA_V3_SAVE";


// ================= DEFAULT STATE =================

const DEFAULT_STATE = {

  name: "Eunseorin",

  x: 1800,
  y: 1390,

  level: 1,
  xp: 0,

  day: 1,

  outfit: {

    hair: "brown",

    dress: "lavender",

    accessory: "flower"

  },

  inventory: {

    flower: 3,

    gem: 1,

    potion: 1,

    book: 1

  }

};


// ================= LOAD =================

let state;

try {

  const saved =
    localStorage.getItem(SAVE_KEY);

  state = saved
    ? {
        ...structuredClone(DEFAULT_STATE),
        ...JSON.parse(saved)
      }
    : structuredClone(DEFAULT_STATE);

} catch {

  state = structuredClone(DEFAULT_STATE);

}


// ================= PLAYER =================

const player = {

  x: state.x,

  y: state.y,

  direction: "down",

  moving: false,

  walkFrame: 0

};


// ================= CAMERA =================

const camera = {

  x: 0,

  y: 0

};


// ================= INPUT =================

const keys = new Set();


// ================= COLORS =================

const COLORS = {

  hair: {

    brown: "#5a3b36",

    black: "#28252d",

    purple: "#604d72",

    pink: "#704452"

  },

  dress: {

    lavender: "#b99bd3",

    pink: "#e6a4bd",

    blue: "#9dbfe2",

    cream: "#ead8c0"

  },

  skin: "#ffd9c8",

  shoe: "#75628e",

  white: "#fff5eb"

};


// ======================================================
// LANDMARKS
// ======================================================

const landmarks = [

  {
    name: "Celestia Castle",
    x: 1800,
    y: 380,
    radius: 190,
    type: "castle"
  },

  {
    name: "Central Plaza",
    x: 1800,
    y: 940,
    radius: 140,
    type: "plaza"
  },

  {
    name: "Cloudhaven Village",
    x: 2700,
    y: 1100,
    radius: 190,
    type: "village"
  },

  {
    name: "Your Home",
    x: 900,
    y: 1500,
    radius: 120,
    type: "home"
  },

  {
    name: "Pet Garden",
    x: 1220,
    y: 720,
    radius: 130,
    type: "garden"
  },

  {
    name: "Sky Dock",
    x: 2950,
    y: 1740,
    radius: 150,
    type: "dock"
  },

  {
    name: "Starfall Bridge",
    x: 1800,
    y: 1830,
    radius: 90,
    type: "bridge"
  }

];


// ======================================================
// NPC
// ======================================================

const npcs = [

  {
    name: "Luna",
    x: 2030,
    y: 1050,
    avatar: "🧙🏻‍♀️",

    text:
      "Oh! You found your way to Cloudhaven. Let's explore together, Eunseorin!"
  },

  {
    name: "Alya",
    x: 2480,
    y: 1190,
    avatar: "👒",

    text:
      "The flowers here bloom brighter when someone is happy."
  },

  {
    name: "Mika",
    x: 1510,
    y: 820,
    avatar: "🦋",

    text:
      "I heard the castle keeps a secret passage to the sky."
  }

];


// ======================================================
// DECORATIONS
// ======================================================

const trees = [];
const flowers = [];
const clouds = [];
const sparkles = [];


// deterministic random

let seed = 918273;

function random() {

  seed =
    (seed * 1664525 + 1013904223)
    >>> 0;

  return seed / 4294967296;

}


// trees

for (
  let i = 0;
  i < 160;
  i++
) {

  trees.push({

    x: 100 + random() * (WORLD_WIDTH - 200),

    y: 500 + random() * 1600,

    scale:
      .75 + random() * .5

  });

}


// flowers

for (
  let i = 0;
  i < 260;
  i++
) {

  flowers.push({

    x: 100 + random() * (WORLD_WIDTH - 200),

    y: 480 + random() * 1650,

    scale:
      .6 + random() * .8,

    type:
      ["🌸", "🌷", "🌼", "💐"]
      [Math.floor(random() * 4)]

  });

}


// clouds

for (
  let i = 0;
  i < 40;
  i++
) {

  clouds.push({

    x: random() * WORLD_WIDTH,

    y: 80 + random() * 450,

    scale:
      .6 + random()

  });

}


// sparkles

for (
  let i = 0;
  i < 70;
  i++
) {

  sparkles.push({

    x: random() * WORLD_WIDTH,

    y: random() * WORLD_HEIGHT,

    phase: random() * Math.PI * 2

  });

}


// ======================================================
// RESIZE
// ======================================================

function resize() {

  const dpr =
    window.devicePixelRatio || 1;

  canvas.width =
    innerWidth * dpr;

  canvas.height =
    innerHeight * dpr;

  canvas.style.width =
    innerWidth + "px";

  canvas.style.height =
    innerHeight + "px";

  ctx.setTransform(
    dpr,
    0,
    0,
    dpr,
    0,
    0
  );

}


window.addEventListener(
  "resize",
  resize
);

resize();


// ======================================================
// SAVE
// ======================================================

function saveGame() {

  state.x = player.x;

  state.y = player.y;

  localStorage.setItem(
    SAVE_KEY,
    JSON.stringify(state)
  );

}


// ======================================================
// TOAST
// ======================================================

function toast(message) {

  const element =
    document.getElementById("toast");

  element.textContent =
    message;

  element.classList.add("show");

  clearTimeout(
    toast.timer
  );

  toast.timer =
    setTimeout(() => {

      element.classList.remove("show");

    }, 1800);

}


// ======================================================
// XP
// ======================================================

function addXP(amount) {

  state.xp += amount;

  while (
    state.xp >= 100
  ) {

    state.xp -= 100;

    state.level++;

    toast(
      `✨ Level Up! Lv.${state.level}`
    );

  }

  updateUI();

}


// ======================================================
// UI
// ======================================================

function updateUI() {

  document.getElementById(
    "playerName"
  ).textContent =
    state.name;

  document.getElementById(
    "profileName"
  ).textContent =
    state.name;

  document.getElementById(
    "level"
  ).textContent =
    state.level;

  document.getElementById(
    "xpBar"
  ).style.width =
    state.xp + "%";

  document.getElementById(
    "xpText"
  ).textContent =
    `${state.xp} / 100 XP`;

  renderInventory();

}


// ======================================================
// INVENTORY
// ======================================================

const itemIcons = {

  flower: "🌸",

  gem: "💎",

  potion: "🧪",

  book: "📖"

};


function renderInventory() {

  const grid =
    document.getElementById(
      "inventoryGrid"
    );

  if (!grid) return;

  grid.innerHTML = "";

  for (
    const [name, amount]
    of Object.entries(state.inventory)
  ) {

    const item =
      document.createElement("div");

    item.className =
      "item";

    item.innerHTML = `

      <div>
        ${itemIcons[name] || "📦"}
      </div>

      <small>
        ${name} ×${amount}
      </small>

    `;

    grid.appendChild(item);

  }

}


// ======================================================
// COLLISION
// ======================================================

function isBlocked(x, y) {

  const margin = 100;

  if (
    x < margin ||
    y < 300 ||
    x > WORLD_WIDTH - margin ||
    y > WORLD_HEIGHT - 180
  ) {

    return true;

  }


  // landmarks

  for (
    const landmark of landmarks
  ) {

    const distance =
      Math.hypot(
        x - landmark.x,
        y - landmark.y
      );

    if (
      distance <
      landmark.radius * .55
    ) {

      return true;

    }

  }


  // trees

  for (
    let i = 0;
    i < trees.length;
    i += 3
  ) {

    const tree =
      trees[i];

    if (
      Math.hypot(
        x - tree.x,
        y - tree.y
      ) <
      35 * tree.scale
    ) {

      return true;

    }

  }


  return false;

}


// ======================================================
// MOVEMENT
// ======================================================

function updateMovement(dt) {

  let dx = 0;

  let dy = 0;


  if (
    keys.has("w") ||
    keys.has("arrowup")
  ) {

    dy--;

  }

  if (
    keys.has("s") ||
    keys.has("arrowdown")
  ) {

    dy++;

  }

  if (
    keys.has("a") ||
    keys.has("arrowleft")
  ) {

    dx--;

  }

  if (
    keys.has("d") ||
    keys.has("arrowright")
  ) {

    dx++;

  }


  if (
    dx === 0 &&
    dy === 0
  ) {

    player.moving =
      false;

    return;

  }


  const length =
    Math.hypot(dx, dy);

  dx /= length;
  dy /= length;


  const speed = 230;


  const nextX =
    player.x +
    dx * speed * dt;

  const nextY =
    player.y +
    dy * speed * dt;


  if (
    !isBlocked(
      nextX,
      player.y
    )
  ) {

    player.x =
      nextX;

  }


  if (
    !isBlocked(
      player.x,
      nextY
    )
  ) {

    player.y =
      nextY;

  }


  player.moving =
    true;


  player.walkFrame +=
    dt * 9;


  if (
    Math.abs(dx) >
    Math.abs(dy)
  ) {

    player.direction =
      dx > 0
        ? "right"
        : "left";

  } else {

    player.direction =
      dy > 0
        ? "down"
        : "up";

  }

}


// ======================================================
// WORLD
// ======================================================

function drawWorld(time) {

  const width =
    innerWidth;

  const height =
    innerHeight;


  ctx.clearRect(
    0,
    0,
    width,
    height
  );


  // camera

  camera.x +=
    (
      player.x -
      width / 2 -
      camera.x
    ) * .09;

  camera.y +=
    (
      player.y -
      height / 2 -
      camera.y
    ) * .09;


  camera.x =
    Math.max(
      0,
      Math.min(
        WORLD_WIDTH - width,
        camera.x
      )
    );


  camera.y =
    Math.max(
      0,
      Math.min(
        WORLD_HEIGHT - height,
        camera.y
      )
    );


  ctx.save();

  ctx.translate(
    -camera.x,
    -camera.y
  );


  // grass

  ctx.fillStyle =
    "#9dcc91";

  ctx.fillRect(
    0,
    0,
    WORLD_WIDTH,
    WORLD_HEIGHT
  );


  // darker grass

  ctx.fillStyle =
    "#86b77d";

  ctx.fillRect(
    0,
    340,
    WORLD_WIDTH,
    WORLD_HEIGHT - 340
  );


  // main road

  ctx.fillStyle =
    "#ead2b3";

  ctx.beginPath();

  ctx.roundRect(
    1650,
    250,
    300,
    1750,
    90
  );

  ctx.fill();


  // horizontal road

  ctx.beginPath();

  ctx.roundRect(
    350,
    1330,
    2850,
    190,
    90
  );

  ctx.fill();


  // river

  ctx.fillStyle =
    "#78bddd";

  ctx.beginPath();

  ctx.moveTo(
    0,
    1940
  );

  ctx.quadraticCurveTo(
    900,
    1730,
    1800,
    1980
  );

  ctx.quadraticCurveTo(
    2700,
    2200,
    3600,
    1890
  );

  ctx.lineTo(
    3600,
    2400
  );

  ctx.lineTo(
    0,
    2400
  );

  ctx.closePath();

  ctx.fill();


  // river shine

  ctx.strokeStyle =
    "rgba(255,255,255,.35)";

  ctx.lineWidth = 4;

  for (
    let i = 0;
    i < 12;
    i++
  ) {

    ctx.beginPath();

    ctx.moveTo(
      200 + i * 260,
      2020 + Math.sin(time*.001+i)*8
    );

    ctx.lineTo(
      320 + i * 260,
      2020 + Math.sin(time*.001+i)*8
    );

    ctx.stroke();

  }


  // flowers

  flowers.forEach(
    flower =>
      drawFlower(
        flower.x,
        flower.y,
        flower.scale,
        flower.type
      )
  );


  // trees

  trees.forEach(
    tree =>
      drawTree(
        tree.x,
        tree.y,
        tree.scale
      )
  );


  // clouds

  clouds.forEach(
    cloud =>
      drawCloud(
        cloud.x,
        cloud.y,
        cloud.scale
      )
  );


  // landmarks

  landmarks.forEach(
    drawLandmark
  );


  // NPCs

  npcs.forEach(
    drawNPC
  );


  // player

  drawPlayer(
    player.x,
    player.y,
    player.direction,
    player.moving
      ? player.walkFrame
      : 0,
    time
  );


  // sparkle particles

  sparkles.forEach(
    sparkle => {

      const alpha =
        .25 +
        Math.abs(
          Math.sin(
            time * .002 +
            sparkle.phase
          )
        ) * .7;

      ctx.globalAlpha =
        alpha;

      ctx.fillStyle =
        "#fff8ff";

      ctx.fillRect(
        sparkle.x,
        sparkle.y,
        4,
        4
      );

    }
  );


  ctx.globalAlpha = 1;

  ctx.restore();

}


// ======================================================
// FLOWER
// ======================================================

function drawFlower(
  x,
  y,
  scale,
  type
) {

  ctx.save();

  ctx.translate(
    x,
    y
  );

  ctx.scale(
    scale,
    scale
  );

  ctx.font =
    "20px serif";

  ctx.textAlign =
    "center";

  ctx.fillText(
    type,
    0,
    0
  );

  ctx.restore();

}


// ======================================================
// TREE
// ======================================================

function drawTree(
  x,
  y,
  scale
) {

  ctx.save();

  ctx.translate(
    x,
    y
  );

  ctx.scale(
    scale,
    scale
  );


  // trunk

  ctx.fillStyle =
    "#76533f";

  ctx.fillRect(
    -8,
    0,
    16,
    42
  );


  // leaves

  ctx.fillStyle =
    "#518657";

  ctx.beginPath();

  ctx.arc(
    -22,
    -22,
    32,
    0,
    Math.PI * 2
  );

  ctx.arc(
    20,
    -25,
    34,
    0,
    Math.PI * 2
  );

  ctx.arc(
    0,
    -48,
    42,
    0,
    Math.PI * 2
  );

  ctx.fill();


  // tiny highlights

  ctx.fillStyle =
    "#78a96f";

  ctx.fillRect(
    -18,
    -55,
    10,
    8
  );

  ctx.fillRect(
    14,
    -35,
    8,
    7
  );


  ctx.restore();

}


// ======================================================
// CLOUD
// ======================================================

function drawCloud(
  x,
  y,
  scale
) {

  ctx.save();

  ctx.translate(
    x,
    y
  );

  ctx.scale(
    scale,
    scale
  );

  ctx.fillStyle =
    "rgba(255,255,255,.7)";

  ctx.beginPath();

  ctx.arc(
    0,
    0,
    32,
    0,
    Math.PI * 2
  );

  ctx.arc(
    35,
    -10,
    40,
    0,
    Math.PI * 2
  );

  ctx.arc(
    72,
    0,
    28,
    0,
    Math.PI * 2
  );

  ctx.fill();

  ctx.restore();

}


// ======================================================
// LANDMARK
// ======================================================

function drawLandmark(
  landmark
) {

  const x =
    landmark.x;

  const y =
    landmark.y;


  if (
    landmark.type ===
    "castle"
  ) {

    drawCastle(
      x,
      y
    );

    return;

  }


  if (
    landmark.type ===
    "home"
  ) {

    drawHouse(
      x,
      y
    );

    return;

  }


  ctx.fillStyle =
    "rgba(255,246,255,.45)";

  ctx.beginPath();

  ctx.arc(
    x,
    y,
    landmark.radius * .65,
    0,
    Math.PI * 2
  );

  ctx.fill();


  ctx.fillStyle =
    "#74528e";

  ctx.font =
    "bold 17px Georgia";

  ctx.textAlign =
    "center";

  ctx.fillText(
    landmark.name,
    x,
    y + 5
  );

}


// ======================================================
// CASTLE
// ======================================================

function drawCastle(
  x,
  y
) {

  // main

  ctx.fillStyle =
    "#dfc7e8";

  ctx.fillRect(
    x - 145,
    y - 65,
    290,
    160
  );


  // towers

  ctx.fillStyle =
    "#a779b8";

  ctx.fillRect(
    x - 135,
    y - 170,
    65,
    260
  );

  ctx.fillRect(
    x + 70,
    y - 170,
    65,
    260
  );


  // roofs

  ctx.fillStyle =
    "#76518e";

  ctx.beginPath();

  ctx.moveTo(
    x - 150,
    y - 170
  );

  ctx.lineTo(
    x - 102,
    y - 220
  );

  ctx.lineTo(
    x - 55,
    y - 170
  );

  ctx.fill();


  ctx.beginPath();

  ctx.moveTo(
    x + 55,
    y - 170
  );

  ctx.lineTo(
    x + 102,
    y - 220
  );

  ctx.lineTo(
    x + 150,
    y - 170
  );

  ctx.fill();


  // center roof

  ctx.beginPath();

  ctx.moveTo(
    x - 70,
    y - 65
  );

  ctx.lineTo(
    x,
    y - 145
  );

  ctx.lineTo(
    x + 70,
    y - 65
  );

  ctx.fill();


  // door

  ctx.fillStyle =
    "#775284";

  ctx.fillRect(
    x - 28,
    y + 20,
    56,
    75
  );


  ctx.fillStyle =
    "#f6df9a";

  ctx.beginPath();

  ctx.arc(
    x + 14,
    y + 55,
    4,
    0,
    Math.PI * 2
  );

  ctx.fill();


  ctx.fillStyle =
    "#70518a";

  ctx.font =
    "bold 22px Georgia";

  ctx.textAlign =
    "center";

  ctx.fillText(
    "Celestia Castle",
    x,
    y + 140
  );

}


// ======================================================
// HOUSE
// ======================================================

function drawHouse(
  x,
  y
) {

  ctx.fillStyle =
    "#f3dacd";

  ctx.fillRect(
    x - 78,
    y - 45,
    156,
    105
  );


  ctx.fillStyle =
    "#b56d83";

  ctx.beginPath();

  ctx.moveTo(
    x - 95,
    y - 45
  );

  ctx.lineTo(
    x,
    y - 130
  );

  ctx.lineTo(
    x + 95,
    y - 45
  );

  ctx.closePath();

  ctx.fill();


  ctx.fillStyle =
    "#80618b";

  ctx.fillRect(
    x - 23,
    y + 10,
    46,
    50
  );

}


// ======================================================
// NPC
// ======================================================

function drawNPC(
  npc
) {

  ctx.textAlign =
    "center";


  ctx.font =
    "27px serif";

  ctx.fillText(
    npc.avatar,
    npc.x,
    npc.y
  );


  ctx.font =
    "bold 11px system-ui";

  ctx.fillStyle =
    "#ffffff";

  ctx.strokeStyle =
    "#72548a";

  ctx.lineWidth =
    3;

  ctx.strokeText(
    "💬 " + npc.name,
    npc.x,
    npc.y - 34
  );

  ctx.fillText(
    "💬 " + npc.name,
    npc.x,
    npc.y - 34
  );

}


// ======================================================
// CHARACTER
// ======================================================

function drawPlayer(
  x,
  y,
  direction,
  frame,
  time
) {

  ctx.save();

  ctx.translate(
    x,
    y
  );


  // walking bounce

  const moving =
    player.moving;

  const walk =
    moving
      ? Math.sin(
          frame * Math.PI
        ) * 3
      : Math.sin(
          time * .003
        ) * 1.3;

  ctx.translate(
    0,
    walk
  );


  // shadow

  ctx.fillStyle =
    "rgba(85,50,85,.2)";

  ctx.beginPath();

  ctx.ellipse(
    0,
    57,
    43,
    11,
    0,
    0,
    Math.PI * 2
  );

  ctx.fill();


  // ====================================================
  // LONG HAIR BACK
  // ====================================================

  ctx.fillStyle =
    COLORS.hair[
      state.outfit.hair
    ];


  ctx.beginPath();

  ctx.ellipse(
    0,
    -4,
    43,
    64,
    0,
    0,
    Math.PI * 2
  );

  ctx.fill();


  // side hair

  ctx.fillRect(
    -41,
    -20,
    20,
    68
  );

  ctx.fillRect(
    21,
    -20,
    20,
    68
  );


  // ====================================================
  // LEGS
  // ====================================================

  ctx.fillStyle =
    COLORS.skin;

  ctx.fillRect(
    -20,
    28,
    14,
    25
  );

  ctx.fillRect(
    7,
    28,
    14,
    25
  );


  // shoes

  ctx.fillStyle =
    COLORS.shoe;

  const shoeOffset =
    moving
      ? Math.sin(
          frame * Math.PI
        ) * 3
      : 0;


  ctx.fillRect(
    -25,
    48 + shoeOffset,
    24,
    12
  );

  ctx.fillRect(
    2,
    48 - shoeOffset,
    24,
    12
  );


  // shoe highlights

  ctx.fillStyle =
    "#f7efff";

  ctx.fillRect(
    -22,
    49 + shoeOffset,
    16,
    4
  );

  ctx.fillRect(
    5,
    49 - shoeOffset,
    16,
    4
  );


  // ====================================================
  // DRESS
  // ====================================================

  ctx.fillStyle =
    COLORS.dress[
      state.outfit.dress
    ];


  ctx.beginPath();

  ctx.moveTo(
    -28,
    -8
  );

  ctx.lineTo(
    28,
    -8
  );

  ctx.lineTo(
    43,
    40
  );

  ctx.lineTo(
    -43,
    40
  );

  ctx.closePath();

  ctx.fill();


  // dress skirt pixels

  ctx.fillStyle =
    "rgba(255,255,255,.42)";

  for (
    let i = -30;
    i <= 30;
    i += 12
  ) {

    ctx.fillRect(
      i,
      13,
      6,
      5
    );

    ctx.fillRect(
      i + 4,
      27,
      6,
      5
    );

  }


  // ====================================================
  // CARDIGAN
  // ====================================================

  ctx.fillStyle =
    "#b99bd1";


  ctx.fillRect(
    -34,
    -10,
    17,
    48
  );

  ctx.fillRect(
    17,
    -10,
    17,
    48
  );


  // cardigan buttons

  ctx.fillStyle =
    "#765783";

  ctx.fillRect(
    19,
    5,
    4,
    4
  );

  ctx.fillRect(
    19,
    18,
    4,
    4
  );


  // ====================================================
  // ARMS
  // ====================================================

  ctx.fillStyle =
    COLORS.skin;


  const armSwing =
    moving
      ? Math.sin(
          frame * Math.PI
        ) * 5
      : 0;


  ctx.fillRect(
    -42,
    2 + armSwing,
    11,
    30
  );

  ctx.fillRect(
    31,
    2 - armSwing,
    11,
    30
  );


  // ====================================================
  // FACE
  // ====================================================

  ctx.fillStyle =
    COLORS.skin;


  ctx.beginPath();

  ctx.ellipse(
    0,
    -30,
    31,
    29,
    0,
    0,
    Math.PI * 2
  );

  ctx.fill();


  // ====================================================
  // HAIR FRONT
  // ====================================================

  ctx.fillStyle =
    COLORS.hair[
      state.outfit.hair
    ];


  ctx.beginPath();

  ctx.arc(
    -14,
    -40,
    20,
    0,
    Math.PI * 2
  );

  ctx.arc(
    14,
    -40,
    20,
    0,
    Math.PI * 2
  );

  ctx.fill();


  ctx.fillRect(
    -29,
    -48,
    58,
    17
  );


  // hair side strands

  ctx.fillRect(
    -32,
    -34,
    11,
    48
  );

  ctx.fillRect(
    21,
    -34,
    11,
    48
  );


  // ====================================================
  // EYES
  // ====================================================

  ctx.fillStyle =
    "#493037";


  ctx.beginPath();

  ctx.ellipse(
    -11,
    -26,
    6,
    9,
    0,
    0,
    Math.PI * 2
  );

  ctx.ellipse(
    11,
    -26,
    6,
    9,
    0,
    0,
    Math.PI * 2
  );

  ctx.fill();


  // eye shine

  ctx.fillStyle =
    "#ffffff";

  ctx.fillRect(
    -13,
    -30,
    3,
    4
  );

  ctx.fillRect(
    9,
    -30,
    3,
    4
  );


  // ====================================================
  // BLUSH
  // ====================================================

  ctx.fillStyle =
    "#ee9cad";

  ctx.globalAlpha =
    .55;

  ctx.fillRect(
    -23,
    -15,
    8,
    4
  );

  ctx.fillRect(
    15,
    -15,
    8,
    4
  );

  ctx.globalAlpha =
    1;


  // ====================================================
  // MOUTH
  // ====================================================

  ctx.fillStyle =
    "#b85e70";

  ctx.fillRect(
    -4,
    -10,
    8,
    4
  );


  // ====================================================
  // HAIR ACCESSORY
  // ====================================================

  ctx.font =
    "17px serif";

  ctx.textAlign =
    "center";


  const accessory =
    state.outfit.accessory;


  if (
    accessory ===
    "flower"
  ) {

    ctx.fillText(
      "🌸",
      25,
      -51
    );

  }


  if (
    accessory ===
    "bow"
  ) {

    ctx.fillText(
      "🎀",
      25,
      -51
    );

  }


  if (
    accessory ===
    "crown"
  ) {

    ctx.fillText(
      "👑",
      0,
      -64
    );

  }


  if (
    accessory ===
    "star"
  ) {

    ctx.fillText(
      "⭐",
      25,
      -51
    );

  }


  // ====================================================
  // NJA BAG
  // ====================================================

  ctx.fillStyle =
    "#fff1dc";

  ctx.fillRect(
    -50,
    0,
    20,
    31
  );


  ctx.strokeStyle =
    "#c6a6c8";

  ctx.lineWidth =
    2;

  ctx.strokeRect(
    -50,
    0,
    20,
    31
  );


  ctx.fillStyle =
    "#9270a8";

  ctx.font =
    "7px system-ui";

  ctx.fillText(
    "NJA",
    -40,
    18
  );


  // ====================================================
  // CREATOR CROWN
  // ====================================================

  ctx.font =
    "14px serif";

  ctx.fillText(
    "👑",
    0,
    -79
  );


  // name

  ctx.font =
    "bold 10px system-ui";

  ctx.fillStyle =
    "#ffffff";

  ctx.strokeStyle =
    "#704f88";

  ctx.lineWidth =
    3;

  ctx.strokeText(
    state.name,
    0,
    -94
  );

  ctx.fillText(
    state.name,
    0,
    -94
  );


  ctx.restore();

}


// ======================================================
// TARGET
// ======================================================

function getNearestTarget() {

  let closest =
    null;

  let distance =
    Infinity;


  for (
    const npc of npcs
  ) {

    const d =
      Math.hypot(
        player.x - npc.x,
        player.y - npc.y
      );

    if (
      d < 120 &&
      d < distance
    ) {

      closest =
        npc;

      distance =
        d;

    }

  }


  for (
    const landmark of landmarks
  ) {

    const d =
      Math.hypot(
        player.x - landmark.x,
        player.y - landmark.y
      );

    if (
      d < 130 &&
      d < distance
    ) {

      closest =
        landmark;

      distance =
        d;

    }

  }


  return closest;

}


// ======================================================
// INTERACTION
// ======================================================

function interact() {

  const target =
    getNearestTarget();


  if (!target) {

    toast(
      "Nothing to interact with here ✦"
    );

    return;

  }


  if (
    target.avatar
  ) {

    openDialog(
      target.name,
      target.avatar,
      target.text
    );

    addXP(5);

    return;

  }


  openDialog(
    target.name,
    "✨",
    `Welcome to ${target.name}! Keep exploring Cloudhaven, Eunseorin.`
  );

  addXP(8);

}


// ======================================================
// DIALOG
// ======================================================

function openDialog(
  name,
  avatar,
  text
) {

  document.getElementById(
    "dialogName"
  ).textContent =
    name;

  document.getElementById(
    "dialogAvatar"
  ).textContent =
    avatar;

  document.getElementById(
    "dialogText"
  ).textContent =
    text;

  document.getElementById(
    "dialog"
  ).classList.add("show");

}


function closeDialog() {

  document.getElementById(
    "dialog"
  ).classList.remove("show");

}


// ======================================================
// OUTFIT
// ======================================================

function toggleOutfit() {

  const panel =
    document.getElementById(
      "outfitPanel"
    );

  const button =
    document.querySelector(
      ".openOutfit"
    );


  const closed =
    panel.classList.contains(
      "closed"
    );


  if (closed) {

    panel.classList.remove(
      "closed"
    );

    button.style.display =
      "none";

  } else {

    panel.classList.add(
      "closed"
    );

    button.style.display =
      "block";

  }

}


window.toggleOutfit =
  toggleOutfit;


// ======================================================
// OUTFIT OPTIONS
// ======================================================

document
  .querySelectorAll(
    ".options"
  )
  .forEach(group => {

    group.addEventListener(
      "click",
      event => {

        const button =
          event.target.closest(
            ".option"
          );

        if (!button)
          return;


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


        const type =
          group.dataset.group;


        state.outfit[type] =
          button.dataset.value;


        drawPreview();

      }

    );

  });


// ======================================================
// PREVIEW
// ======================================================

const preview =
  document.getElementById(
    "previewCharacter"
  );

const previewCtx =
  preview.getContext("2d");


function drawPreview() {

  previewCtx.clearRect(
    0,
    0,
    180,
    190
  );


  previewCtx.save();

  previewCtx.translate(
    90,
    110
  );


  // bigger character

  previewCtx.scale(
    1.65,
    1.65
  );


  // use same character renderer

  drawPreviewCharacter();


  previewCtx.restore();

}


function drawPreviewCharacter() {

  const hair =
    COLORS.hair[
      state.outfit.hair
    ];

  const dress =
    COLORS.dress[
      state.outfit.dress
    ];


  // shadow

  previewCtx.fillStyle =
    "rgba(80,50,90,.15)";

  previewCtx.beginPath();

  previewCtx.ellipse(
    0,
    48,
    30,
    7,
    0,
    0,
    Math.PI * 2
  );

  previewCtx.fill();


  // hair

  previewCtx.fillStyle =
    hair;

  previewCtx.beginPath();

  previewCtx.ellipse(
    0,
    -7,
    30,
    48,
    0,
    0,
    Math.PI * 2
  );

  previewCtx.fill();


  // legs

  previewCtx.fillStyle =
    COLORS.skin;

  previewCtx.fillRect(
    -13,
    25,
    9,
    23
  );

  previewCtx.fillRect(
    4,
    25,
    9,
    23
  );


  // shoes

  previewCtx.fillStyle =
    COLORS.shoe;

  previewCtx.fillRect(
    -16,
    44,
    17,
    8
  );

  previewCtx.fillRect(
    0,
    44,
    17,
    8
  );


  // dress

  previewCtx.fillStyle =
    dress;

  previewCtx.beginPath();

  previewCtx.moveTo(
    -20,
    -8
  );

  previewCtx.lineTo(
    20,
    -8
  );

  previewCtx.lineTo(
    30,
    32
  );

  previewCtx.lineTo(
    -30,
    32
  );

  previewCtx.closePath();

  previewCtx.fill();


  // cardigan

  previewCtx.fillStyle =
    "#b99bd1";

  previewCtx.fillRect(
    -24,
    -8,
    11,
    38
  );

  previewCtx.fillRect(
    13,
    -8,
    11,
    38
  );


  // face

  previewCtx.fillStyle =
    COLORS.skin;

  previewCtx.beginPath();

  previewCtx.ellipse(
    0,
    -27,
    22,
    22,
    0,
    0,
    Math.PI * 2
  );

  previewCtx.fill();


  // front hair

  previewCtx.fillStyle =
    hair;

  previewCtx.fillRect(
    -22,
    -42,
    44,
    15
  );


  previewCtx.beginPath();

  previewCtx.arc(
    -12,
    -37,
    14,
    0,
    Math.PI * 2
  );

  previewCtx.arc(
    12,
    -37,
    14,
    0,
    Math.PI * 2
  );

  previewCtx.fill();


  // eyes

  previewCtx.fillStyle =
    "#473037";

  previewCtx.beginPath();

  previewCtx.ellipse(
    -8,
    -25,
    4,
    7,
    0,
    0,
    Math.PI * 2
  );

  previewCtx.ellipse(
    8,
    -25,
    4,
    7,
    0,
    0,
    Math.PI * 2
  );

  previewCtx.fill();


  // eyes shine

  previewCtx.fillStyle =
    "#fff";

  previewCtx.fillRect(
    -9,
    -28,
    2,
    3
  );

  previewCtx.fillRect(
    7,
    -28,
    2,
    3
  );


  // accessory

  previewCtx.font =
    "13px serif";

  previewCtx.textAlign =
    "center";


  const accessory =
    state.outfit.accessory;


  previewCtx.fillText(

    accessory === "flower"
      ? "🌸"
      : accessory === "bow"
      ? "🎀"
      : accessory === "crown"
      ? "👑"
      : "⭐",

    18,
    -44

  );

}


// ======================================================
// SAVE OUTFIT
// ======================================================

function saveOutfit() {

  saveGame();

  toast(
    "✨ Outfit saved!"
  );

}


window.saveOutfit =
  saveOutfit;


// ======================================================
// MENU
// ======================================================

document
  .querySelectorAll(
    ".menuBtn"
  )
  .forEach(button => {

    button.addEventListener(
      "click",
      () => {

        const panel =
          button.dataset.panel;


        document
          .querySelectorAll(
            ".panel"
          )
          .forEach(
            p =>
              p.classList.add(
                "hidden"
              )
          );


        if (
          panel ===
          "outfit"
        ) {

          document
            .getElementById(
              "outfitPanel"
            )
            .classList.remove(
              "closed"
            );

          document
            .querySelector(
              ".openOutfit"
            )
            .style.display =
            "none";

        } else {

          const target =
            document.getElementById(
              panel +
              "Panel"
            );

          if (target) {

            target.classList.remove(
              "hidden"
            );

          }

        }


        document
          .querySelectorAll(
            ".menuBtn"
          )
          .forEach(
            btn =>
              btn.classList.toggle(
                "active",
                btn === button
              )
          );

      }

    );

  });


// ======================================================
// KEYBOARD
// ======================================================

window.addEventListener(
  "keydown",
  event => {

    const key =
      event.key.toLowerCase();


    keys.add(key);


    if (
      [
        "w",
        "a",
        "s",
        "d",
        "arrowup",
        "arrowdown",
        "arrowleft",
        "arrowright"
      ].includes(key)
    ) {

      event.preventDefault();

    }


    // interaction

    if (
      key === "e" ||
      key === "enter"
    ) {

      const dialog =
        document.getElementById(
          "dialog"
        );


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


    // outfit

    if (
      key === "o"
    ) {

      toggleOutfit();

    }


    // inventory

    if (
      key === "i"
    ) {

      document
        .querySelector(
          '[data-panel="inventory"]'
        )
        .click();

    }


    // map

    if (
      key === "m"
    ) {

      document
        .querySelector(
          '[data-panel="map"]'
        )
        .click();

    }


    // quest

    if (
      key === "q"
    ) {

      document
        .querySelector(
          '[data-panel="quest"]'
        )
        .click();

    }


    // escape

    if (
      key === "escape"
    ) {

      closeDialog();

      document
        .getElementById(
          "outfitPanel"
        )
        .classList.add(
          "closed"
        );

      document
        .querySelector(
          ".openOutfit"
        )
        .style.display =
        "block";

    }

  });


window.addEventListener(
  "keyup",
  event => {

    keys.delete(
      event.key.toLowerCase()
    );

  });


// ======================================================
// MINIMAP
// ======================================================

function drawMinimap() {

  mctx.clearRect(
    0,
    0,
    360,
    240
  );


  // grass

  mctx.fillStyle =
    "#91bd82";

  mctx.fillRect(
    0,
    0,
    360,
    240
  );


  // roads

  mctx.fillStyle =
    "#e7cba8";

  mctx.fillRect(
    145,
    0,
    70,
    240
  );

  mctx.fillRect(
    0,
    125,
    360,
    40
  );


  // river

  mctx.fillStyle =
    "#73b9d9";

  mctx.beginPath();

  mctx.moveTo(
    0,
    205
  );

  mctx.quadraticCurveTo(
    140,
    175,
    360,
    205
  );

  mctx.lineTo(
    360,
    240
  );

  mctx.lineTo(
    0,
    240
  );

  mctx.fill();


  // castle

  mctx.fillStyle =
    "#9b72b0";

  mctx.fillRect(
    145,
    25,
    70,
    35
  );


  // player

  const px =
    player.x /
    WORLD_WIDTH *
    360;

  const py =
    player.y /
    WORLD_HEIGHT *
    240;


  mctx.fillStyle =
    "#ffffff";

  mctx.beginPath();

  mctx.arc(
    px,
    py,
    6,
    0,
    Math.PI * 2
  );

  mctx.fill();


  mctx.fillStyle =
    "#8b63ae";

  mctx.beginPath();

  mctx.arc(
    px,
    py,
    3,
    0,
    Math.PI * 2
  );

  mctx.fill();

}


// ======================================================
// UPDATE INTERACTION UI
// ======================================================

function updateInteraction() {

  const box =
    document.getElementById(
      "interactBox"
    );

  const target =
    getNearestTarget();


  if (target) {

    box.classList.add(
      "show"
    );

    box.innerHTML =
      `<b>E</b> ${
        target.avatar
          ? "Talk to " + target.name
          : "Explore " + target.name
      }`;

  } else {

    box.classList.remove(
      "show"
    );

  }

}


// ======================================================
// GAME LOOP
// ======================================================

let lastTime =
  performance.now();


function gameLoop(
  currentTime
) {

  const dt =
    Math.min(
      0.033,
      (
        currentTime -
        lastTime
      ) / 1000
    );


  lastTime =
    currentTime;


  updateMovement(
    dt
  );


  drawWorld(
    currentTime
  );


  drawMinimap();


  updateInteraction();


  requestAnimationFrame(
    gameLoop
  );

}


// ======================================================
// INITIALIZE
// ======================================================

updateUI();

drawPreview();

setInterval(
  saveGame,
  5000
);

requestAnimationFrame(
  gameLoop
);


})();
