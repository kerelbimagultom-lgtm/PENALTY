const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const WIDTH = canvas.width, HEIGHT = canvas.height;

const messageEl = document.getElementById("message");
const shootBtn = document.getElementById("shootBtn");
const restartBtn = document.getElementById("restartBtn");

let gameState = "aim";       // aim, shoot, goal, fail
let arrow = { x: WIDTH/2 - 50, y: HEIGHT - 60, dx: 0, dy: -1.2 };   // arah shoot
let ball = {
  x: WIDTH/2,
  y: HEIGHT-45,
  r: 13,
  vx: 0,
  vy: 0,
  flying: false,
};

const player = {
  x: WIDTH/2-18, y: HEIGHT-90, w:36, h:36
}

// GAWANG DAN KIPER BARCA
const goal = {
  x: WIDTH/2 - 70,
  y: 24,
  w: 140,
  h: 28
};

const keeper = {
  x: WIDTH/2-28,
  y: goal.y + 8,
  w:56,
  h:20,
  vx:2.3 * (Math.random()>0.5?1:-1),
  color:"#3491e2"
};

function resetGame(){
  gameState = "aim";
  keeper.x = WIDTH/2-28;
  keeper.vx = 2.3 * (Math.random()>0.5?1:-1);
  ball.x = WIDTH/2; ball.y = HEIGHT-45;
  ball.vx = 0; ball.vy=0; ball.flying = false;
  arrow.x = WIDTH/2 -50;
  arrow.y = HEIGHT-60;
  arrow.dx = 0; arrow.dy = -1.2;
  messageEl.textContent = "Tentukan arah dengan panah ← ↑ → ↓, dan tekan SPACE untuk menendang!";
  shootBtn.disabled = false;
  shootBtn.style.display = "inline-block";
  restartBtn.style.display = "none";
}

// Arahan tombol  
window.addEventListener("keydown",function(e){
  if(gameState === "aim"){
    if(e.key === "ArrowLeft") { arrow.dx -= 0.22; }
    if(e.key === "ArrowRight") { arrow.dx += 0.22; }
    if(e.key === "ArrowUp") { arrow.dy -= 0.13; }
    if(e.key === "ArrowDown") { arrow.dy += 0.13; }
    // Normalkan panjang arah tembak
    const len = Math.sqrt(arrow.dx*arrow.dx+arrow.dy*arrow.dy);
    if(len>1.2){
      arrow.dx*=1.2/len;
      arrow.dy*=1.2/len;
    }
  }
  if(e.key === " " && gameState==="aim"){
    shootBtn.click();
  }
  if(gameState!=="aim" && (e.key === "Enter" || e.key===" ")){
    resetGame();
  }
});
shootBtn.onclick = function(){
  if(gameState==="aim"){
    // Gunakan arrow arah, Lacak kecepatan bola dengan arah arrow
    ball.vx = arrow.dx * 11;
    ball.vy = arrow.dy * 11;
    ball.flying = true;
    gameState="shoot";
    shootBtn.disabled = true;
    shootBtn.style.display = "none";
    messageEl.textContent="Menendang bola...";
  }
};
restartBtn.onclick = resetGame;

//--- UTILITY --//
function drawField(){
  // Gawang belakang
  ctx.fillStyle = "#fff";
  ctx.fillRect(goal.x, goal.y, goal.w, goal.h);

  ctx.strokeStyle="#3491e2";
  ctx.lineWidth=3;
  ctx.beginPath();
  ctx.rect(goal.x, goal.y, goal.w, goal.h);
  ctx.stroke();

  // Titik penalti
  ctx.beginPath();
  ctx.arc(WIDTH/2, HEIGHT-90, 5, 0, 2*Math.PI);
  ctx.fillStyle = "#ffe";
  ctx.fill();

  // Garis area penalti
  ctx.strokeStyle="#fff";
  ctx.beginPath();
  ctx.rect(WIDTH/2-80,goal.y+goal.h-5,160,92);
  ctx.stroke();
}

function drawPlayer(){
  // Gambar pemain
  ctx.save();
  ctx.fillStyle = "#ffee55";
  ctx.beginPath();
  ctx.arc(player.x+player.w/2, player.y+player.h/2, player.w/2, 0,2*Math.PI);
  ctx.shadowColor="#333";
  ctx.shadowBlur=15;
  ctx.fill();
  ctx.restore();
}

function drawKeeper(){
  // Gambar kiper Barca
  ctx.save();
  ctx.fillStyle = keeper.color;
  ctx.fillRect(keeper.x, keeper.y, keeper.w, keeper.h);
  ctx.strokeStyle="#0f0a4a";
  ctx.strokeRect(keeper.x, keeper.y, keeper.w, keeper.h);
  ctx.fillStyle="#f4314c";
  ctx.font="13px Arial";
  ctx.fillText('FCB',keeper.x+12, keeper.y+15);
  ctx.restore();
}

function drawBall(){
  ctx.save();
  ctx.beginPath();
  ctx.arc(ball.x,ball.y,ball.r, 0,2*Math.PI);
  ctx.fillStyle = "#fff";
  ctx.shadowColor="#606";
  ctx.shadowBlur = 14;
  ctx.fill();
  ctx.strokeStyle="#222";
  ctx.stroke();
  ctx.restore();
}

function drawArrowAimer(){
  if(gameState==="aim"){
    ctx.save();
    ctx.strokeStyle="red";
    ctx.lineWidth=5;
    ctx.beginPath();
    ctx.moveTo(ball.x, ball.y);
    ctx.lineTo(ball.x + arrow.dx*45, ball.y + arrow.dy*45 );
    ctx.stroke();
    ctx.restore();
    // Ujung panah
    ctx.save();
    ctx.fillStyle="red";
    ctx.beginPath();
    ctx.arc(ball.x + arrow.dx*45, ball.y + arrow.dy*45, 5,0,2*Math.PI);
    ctx.fill();
    ctx.restore();
  }
}

// --- GAME ANIMATION LOOP --- //
function update(){
  // Animasi bola & cek WIN/LOSE setelah ditendang
  if(ball.flying){
    ball.x += ball.vx;
    ball.y += ball.vy;
    // Sedikit "gesekan bola" biar berhenti
    ball.vx *= 0.98;
    ball.vy *= 0.98;

    // Keeper bergerak setelah bola ditembak
    if(gameState==="shoot"){
      keeper.x += keeper.vx;
      // Ubah arah kalau dekat ujung
      if(keeper.x < goal.x) keeper.vx *= -1;
      if(keeper.x + keeper.w > goal.x+goal.w) keeper.vx *= -1;
    }
    
    // CEK GOAL  
    if(
      ball.y < goal.y+goal.h-8 &&
      ball.x > goal.x+8 &&
      ball.x < goal.x+goal.w-8
    ){
      // Cek tabrakan keeper
      if(ball.x + ball.r > keeper.x &&
         ball.x - ball.r < keeper.x + keeper.w &&
         ball.y + ball.r > keeper.y &&
         ball.y - ball.r < keeper.y + keeper.h){
        // DITAHAN keeper
        gameState="fail";
        messageEl.textContent="Ditangkap kiper Barca! Coba lagi.";
        restartBtn.style.display="inline-block";
      } else {
        // GOL
        gameState="goal";
        messageEl.textContent="GOOOLLL! Bola berhasil lolos ke gawang 🎉";
        restartBtn.style.display="inline-block";
      }
      ball.flying = false;
    }
    // Gagal jika keluar lapangan
    if(ball.x < 0 || ball.x > WIDTH || ball.y < 0){
      if(gameState==="shoot"){
        gameState="fail";
        messageEl.textContent="Gagal! Bola keluar dari gawang?";
        restartBtn.style.display="inline-block";
        ball.flying=false;
      }
    }
  } else if(gameState==="aim"){
    // Keeper idle bergerak perlahan
    keeper.x += keeper.vx*0.43;
    if(keeper.x < goal.x || keeper.x + keeper.w > goal.x+goal.w) keeper.vx *= -1;
  }
}

function draw(){
  ctx.clearRect(0,0,WIDTH,HEIGHT);
  drawField();
  drawPlayer();
  drawKeeper();
  drawBall();
  drawArrowAimer();
}

function gameLoop(){
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

resetGame();
gameLoop();
