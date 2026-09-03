/* =========================================
   EUNSEORIN PIXEL CHARACTER
   ========================================= */

const eunseorinSprite = new Image();

/*
  Path mengikuti folder GitHub kamu:
  assets/ characters/eunseorin.png
*/
eunseorinSprite.src =
  "./assets/%20characters/eunseorin.png";

let eunseorinLoaded = false;

eunseorinSprite.onload = () => {
  eunseorinLoaded = true;
  console.log("✨ Eunseorin pixel character loaded!");
};


/* =========================================
   DRAW EUNSEORIN
   ========================================= */

function drawEunseorin(ctx, x, y) {

  if (!eunseorinLoaded) return;

  const characterWidth = 72;
  const characterHeight = 96;

  ctx.save();

  // Pixel art tetap tajam
  ctx.imageSmoothingEnabled = false;

  ctx.drawImage(
    eunseorinSprite,

    x - characterWidth / 2,
    y - characterHeight,

    characterWidth,
    characterHeight
  );

  ctx.restore();
}
  // ====================================================
  // SHADOW
  // ====================================================

  ctx.fillStyle = "rgba(55,40,70,.20)";

  ctx.beginPath();

  ctx.ellipse(
    0,
    59,
    30,
    8,
    0,
    0,
    Math.PI * 2
  );

  ctx.fill();


  // ====================================================
  // LONG HAIR BACK
  // ====================================================

  const hairColor =
    COLORS.hair[state.outfit.hair];

  ctx.fillStyle = hairColor;


  // large hair silhouette

  ctx.beginPath();

  ctx.roundRect(
    -27,
    -62,
    54,
    92,
    20
  );

  ctx.fill();


  // left long strand

  ctx.beginPath();

  ctx.roundRect(
    -38,
    -35,
    19,
    72,
    9
  );

  ctx.fill();


  // right long strand

  ctx.beginPath();

  ctx.roundRect(
    19,
    -35,
    19,
    72,
    9
  );

  ctx.fill();


  // hair highlights

  ctx.fillStyle =
    "rgba(255,255,255,.10)";

  ctx.fillRect(
    -30,
    -32,
    5,
    43
  );

  ctx.fillRect(
    25,
    -24,
    5,
    35
  );


  // ====================================================
  // LEGS
  // ====================================================

  ctx.fillStyle =
    COLORS.skin;


  ctx.fillRect(
    -12,
    31 + step,
    9,
    23
  );

  ctx.fillRect(
    3,
    31 - step,
    9,
    23
  );


  // ====================================================
  // SHOES
  // ====================================================

  ctx.fillStyle =
    "#76608d";


  ctx.fillRect(
    -17,
    50 + step,
    19,
    9
  );

  ctx.fillRect(
    0,
    50 - step,
    19,
    9
  );


  // shoe ribbon

  ctx.fillStyle =
    "#f6eafa";

  ctx.fillRect(
    -12,
    51 + step,
    8,
    3
  );

  ctx.fillRect(
    5,
    51 - step,
    8,
    3
  );


  // ====================================================
  // DRESS
  // ====================================================

  const dressColor =
    COLORS.dress[state.outfit.dress];

  ctx.fillStyle =
    dressColor;


  ctx.beginPath();

  ctx.moveTo(
    -20,
    -5
  );

  ctx.lineTo(
    20,
    -5
  );

  ctx.lineTo(
    34,
    38
  );

  ctx.lineTo(
    -34,
    38
  );

  ctx.closePath();

  ctx.fill();


  // skirt pixel details

  ctx.fillStyle =
    "rgba(255,255,255,.35)";

  ctx.fillRect(
    -26,
    13,
    8,
    5
  );

  ctx.fillRect(
    -6,
    21,
    8,
    5
  );

  ctx.fillRect(
    14,
    12,
    8,
    5
  );

  ctx.fillRect(
    -17,
    30,
    9,
    5
  );

  ctx.fillRect(
    8,
    29,
    9,
    5
  );


  // ====================================================
  // CARDIGAN
  // ====================================================

  ctx.fillStyle =
    "#b99bd1";


  ctx.fillRect(
    -25,
    -8,
    12,
    43
  );

  ctx.fillRect(
    13,
    -8,
    12,
    43
  );


  // cardigan cuffs

  ctx.fillStyle =
    "#e9d8f2";

  ctx.fillRect(
    -27,
    28,
    15,
    7
  );

  ctx.fillRect(
    12,
    28,
    15,
    7
  );


  // buttons

  ctx.fillStyle =
    "#805f91";

  ctx.fillRect(
    15,
    1,
    4,
    4
  );

  ctx.fillRect(
    15,
    13,
    4,
    4

  );


  // ====================================================
  // ARMS
  // ====================================================

  const armMove =
    walking
      ? Math.sin(frame * Math.PI) * 4
      : 0;


  ctx.fillStyle =
    COLORS.skin;


  ctx.fillRect(
    -34,
    -2 + armMove,
    10,
    27
  );

  ctx.fillRect(
    24,
    -2 - armMove,
    10,
    27
  );


  // ====================================================
  // NECK
  // ====================================================

  ctx.fillStyle =
    COLORS.skin;

  ctx.fillRect(
    -6,
    -10,
    12,
    9
  );


  // ====================================================
  // FACE
  // ====================================================

  ctx.beginPath();

  ctx.ellipse(
    0,
    -31,
    23,
    24,
    0,
    0,
    Math.PI * 2
  );

  ctx.fill();


  // ====================================================
  // FRONT HAIR
  // ====================================================

  ctx.fillStyle =
    hairColor;


  ctx.beginPath();

  ctx.arc(
    -12,
    -46,
    15,
    0,
    Math.PI * 2
  );

  ctx.arc(
    12,
    -46,
    15,
    0,
    Math.PI * 2
  );

  ctx.fill();


  ctx.fillRect(
    -23,
    -50,
    46,
    15
  );


  // bangs

  ctx.fillRect(
    -19,
    -38,
    8,
    12
  );

  ctx.fillRect(
    11,
    -38,
    8,
    12
  );


  // ====================================================
  // EYES
  // ====================================================

  ctx.fillStyle =
    "#49333b";


  ctx.beginPath();

  ctx.ellipse(
    -8,
    -29,
    4,
    7,
    0,
    0,
    Math.PI * 2
  );

  ctx.ellipse(
    8,
    -29,
    4,
    7,
    0,
    0,
    Math.PI * 2
  );

  ctx.fill();


  // eye sparkle

  ctx.fillStyle =
    "#ffffff";

  ctx.fillRect(
    -10,
    -32,
    2,
    3
  );

  ctx.fillRect(
    6,
    -32,
    2,
    3
  );


  // ====================================================
  // BLUSH
  // ====================================================

  ctx.fillStyle =
    "#ef9cad";

  ctx.globalAlpha =
    .55;

  ctx.fillRect(
    -18,
    -19,
    7,
    3
  );

  ctx.fillRect(
    11,
    -19,
    7,
    3
  );

  ctx.globalAlpha =
    1;


  // ====================================================
  // MOUTH
  // ====================================================

  ctx.fillStyle =
    "#b96273";

  ctx.fillRect(
    -3,
    -11,
    6,
    3
  );


  // ====================================================
  // HAIR ACCESSORY
  // ====================================================

  ctx.font =
    "15px serif";

  ctx.textAlign =
    "center";


  const accessory =
    state.outfit.accessory;


  if (
    accessory === "flower"
  ) {

    ctx.fillText(
      "🌸",
      22,
      -48
    );

  }

  else if (
    accessory === "bow"
  ) {

    ctx.fillText(
      "🎀",
      23,
      -48
    );

  }

  else if (
    accessory === "crown"
  ) {

    ctx.fillText(
      "👑",
      0,
      -59
    );

  }

  else if (
    accessory === "star"
  ) {

    ctx.fillText(
      "⭐",
      23,
      -48
    );

  }


  // ====================================================
  // LITTLE BAG
  // ====================================================

  ctx.fillStyle =
    "#f8eadb";

  ctx.fillRect(
    -45,
    0,
    17,
    27
  );


  ctx.strokeStyle =
    "#bd99bf";

  ctx.lineWidth =
    2;

  ctx.strokeRect(
    -45,
    0,
    17,
    27
  );


  // bag strap

  ctx.beginPath();

  ctx.moveTo(
    -43,
    1
  );

  ctx.quadraticCurveTo(
    -36,
    -10,
    -29,
    1
  );

  ctx.stroke();


  // ====================================================
  // CREATOR CROWN
  // ====================================================

  ctx.font =
    "13px serif";

  ctx.fillText(
    "👑",
    0,
    -72
  );


  // ====================================================
  // NAME
  // ====================================================

  ctx.font =
    "bold 9px system-ui";

  ctx.fillStyle =
    "#ffffff";

  ctx.strokeStyle =
    "#705287";

  ctx.lineWidth =
    3;


  ctx.strokeText(
    state.name,
    0,
    -87
  );

  ctx.fillText(
    state.name,
    0,
    -87
  );


  ctx.restore();

}
