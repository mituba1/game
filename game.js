"use strict";

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const WORLD = { width: 960, height: 640 };
const player = { x: 480, y: 510, radius: 11, speed: 160, facing: "down", walking: false };

// 入力と移動処理を分離。将来の画面ボタンも input.setDirection() を呼べます。
const input = {
  directions: new Set(),
  setDirection(direction, pressed) {
    if (pressed) this.directions.add(direction);
    else this.directions.delete(direction);
  },
  reset() { this.directions.clear(); },
  getVector() {
    let x = Number(this.directions.has("right")) - Number(this.directions.has("left"));
    let y = Number(this.directions.has("down")) - Number(this.directions.has("up"));
    const length = Math.hypot(x, y);
    if (length) { x /= length; y /= length; }
    return { x, y };
  }
};
const keyDirections = { ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right" };
for (const eventName of ["keydown", "keyup"]) {
  window.addEventListener(eventName, (event) => {
    const direction = keyDirections[event.key];
    if (!direction) return;
    event.preventDefault();
    input.setDirection(direction, eventName === "keydown");
  });
}
window.addEventListener("blur", () => input.reset());
document.addEventListener("visibilitychange", () => input.reset());

const trees = [
  [82, 91, 43], [175, 68, 39], [280, 67, 35], [678, 67, 36], [787, 74, 44], [885, 110, 41],
  [62, 227, 40], [155, 202, 36], [814, 211, 37], [912, 259, 44],
  [68, 378, 44], [176, 350, 40], [800, 368, 45], [906, 416, 38],
  [82, 557, 42], [207, 582, 39], [752, 583, 42], [878, 563, 45]
];
const obstacles = [
  { x: 330, y: 82, w: 300, h: 156 }, // 拝殿
  { x: 375, y: 526, w: 18, h: 46 }, { x: 567, y: 526, w: 18, h: 46 }, // 鳥居の柱
  { x: 311, y: 301, w: 30, h: 34 }, { x: 619, y: 301, w: 30, h: 34 }, // 石灯籠
  ...trees.map(([x, y]) => ({ x: x - 20, y: y - 16, w: 40, h: 38 }))
];

function canStand(x, y) {
  const r = player.radius;
  if (x < 28 + r || x > WORLD.width - 28 - r || y < 28 + r || y > WORLD.height - 28 - r) return false;
  return !obstacles.some(o => x + r > o.x && x - r < o.x + o.w && y + r > o.y && y - r < o.y + o.h);
}

function update(dt) {
  const direction = input.getVector();
  player.walking = direction.x !== 0 || direction.y !== 0;
  if (direction.y) player.facing = direction.y > 0 ? "down" : "up";
  else if (direction.x) player.facing = direction.x > 0 ? "right" : "left";
  const nextX = player.x + direction.x * player.speed * dt;
  if (canStand(nextX, player.y)) player.x = nextX;
  const nextY = player.y + direction.y * player.speed * dt;
  if (canStand(player.x, nextY)) player.y = nextY;
}

function rect(x, y, w, h, color) { ctx.fillStyle = color; ctx.fillRect(x, y, w, h); }
function circle(x, y, radius, color) { ctx.fillStyle = color; ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI * 2); ctx.fill(); }

function drawMap() {
  rect(0, 0, 960, 640, "#26382d");
  // 固定の模様を使い、毎フレーム地面がちらつかないようにする。
  for (let i = 0; i < 250; i++) {
    const x = (i * 137 + 31) % 960, y = (i * 83 + 19) % 640;
    rect(x, y, 3 + i % 5, 2, i % 2 ? "#304331" : "#203228");
  }
  rect(26, 26, 908, 7, "#4b5143");
  rect(26, 26, 7, 588, "#4b5143"); rect(927, 26, 7, 588, "#4b5143");
  rect(26, 607, 379, 7, "#4b5143"); rect(555, 607, 379, 7, "#4b5143");
  rect(403, 236, 154, 404, "#535b4e");
  rect(275, 350, 410, 78, "#475343");
  for (let row = 0; row < 11; row++) {
    for (let col = 0; col < 3; col++) rect(408 + col * 49, 241 + row * 38, 45, 34, (row + col) % 3 ? "#62685a" : "#555e51");
  }
  rect(341, 94, 300, 154, "#15251e");
  rect(330, 92, 300, 146, "#51473a");
  for (let x = 344; x < 630; x += 24) rect(x, 135, 3, 93, "#383b30");
  rect(407, 145, 146, 82, "#232c25");
  rect(476, 145, 8, 82, "#655740");
  rect(316, 82, 328, 56, "#273333");
  for (let x = 319; x < 644; x += 19) rect(x, 83, 2, 52, "#40504a");
  rect(309, 129, 342, 10, "#617064");
  rect(354, 233, 252, 10, "#797766"); rect(365, 245, 230, 9, "#606455");
  rect(346, 158, 268, 3, "#a39363");
  for (const x of [386, 445, 507, 566]) { rect(x, 161, 5, 13, "#c5c4a9"); rect(x + 3, 171, 5, 8, "#c5c4a9"); }
  for (const x of [326, 634]) {
    rect(x - 18, 331, 36, 7, "#697365"); rect(x - 6, 299, 12, 33, "#788071");
    rect(x - 13, 290, 26, 21, "#444f44"); rect(x - 6, 295, 12, 10, "#b7aa75");
    rect(x - 20, 284, 40, 7, "#7f8777"); rect(x - 11, 279, 22, 6, "#687564");
  }
  for (const [x, y, r] of trees) {
    circle(x + 7, y + 13, r, "#1b2b23"); rect(x - 6, y, 12, 31, "#514936");
    circle(x, y - 7, r, "#1c3026"); circle(x - 10, y - 17, r * .65, "#263e2e");
  }
  // 鳥居は上から見た簡略図。中央の通路は通行可能。
  rect(375, 526, 18, 46, "#795348"); rect(567, 526, 18, 46, "#795348");
  rect(360, 534, 240, 9, "#573c34"); rect(354, 518, 252, 13, "#885c4d");
  rect(348, 514, 264, 5, "#333e34");
}

function render(time) {
  drawMap();
  const { x, y } = player;
  const step = player.walking ? Math.sin(time / 90) * 2 : 0;
  ctx.fillStyle = "#09181180"; ctx.beginPath(); ctx.ellipse(x, y + 10, 13, 6, 0, 0, Math.PI * 2); ctx.fill();
  rect(x - 7, y + 4 + step, 5, 8, "#252f31"); rect(x + 2, y + 4 - step, 5, 8, "#252f31");
  rect(x - 9, y - 8, 18, 16, "#d5d6bc");
  circle(x, y - 13, 7, "#c5b9a0");
  rect(x - 7, y - 20, 14, player.facing === "up" ? 12 : 6, "#303936");
  if (player.facing === "left") rect(x - 10, y - 6, 3, 8, "#e9e6ce");
  if (player.facing === "right") rect(x + 7, y - 6, 3, 8, "#e9e6ce");
  const shade = ctx.createRadialGradient(480, 330, 150, 480, 330, 590);
  shade.addColorStop(0, "#05110b00"); shade.addColorStop(1, "#05110b99");
  ctx.fillStyle = shade; ctx.fillRect(0, 0, 960, 640);
}

let previousTime = null;
function frame(time) {
  const dt = previousTime === null ? 0 : Math.min((time - previousTime) / 1000, 0.05);
  previousTime = time;
  update(dt);
  render(time);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
