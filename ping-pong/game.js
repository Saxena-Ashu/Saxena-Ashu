/* Manual Ping Pong — Ashu Saxena profile.
 * The player ALWAYS controls the left paddle manually (W/S or Arrow Up/Down,
 * or by moving the mouse over the court). The right paddle is a simple AI.
 * First to WIN_SCORE points wins. No auto-demo, no auto paddle movement. */

(function () {
  'use strict';

  const WIN_SCORE = 7;
  const PADDLE_W = 12;
  const PADDLE_H = 86;
  const BALL_R = 9;
  const BALL_SPEED0 = 5.2;
  const BALL_MAX = 11;
  const AI_SPEED = 4.6;
  const AI_ERROR = 34;          // how far from perfect the AI aims
  const AI_REACT = 0.35;        // seconds the AI "waits" before chasing

  const canvas = document.getElementById('court');
  const ctx = canvas.getContext('2d');
  const scoreYou = document.getElementById('score-you');
  const scoreCpu = document.getElementById('score-cpu');
  const btnStart = document.getElementById('btn-start');
  const btnPause = document.getElementById('btn-pause');
  const btnRestart = document.getElementById('btn-restart');
  const overlay = document.getElementById('overlay');
  const overlayTitle = document.getElementById('overlay-title');
  const overlaySub = document.getElementById('overlay-sub');
  const btnAgain = document.getElementById('btn-again');

  const W = canvas.width;
  const H = canvas.height;
  const MID = H / 2;

  const state = {
    running: false,       // ball in motion
    paused: false,
    over: false,
    you: WIN_SCORE,
    cpu: 0,
    playerY: MID - PADDLE_H / 2,
    aiY: MID - PADDLE_H / 2,
    ball: { x: W / 2, y: MID, vx: 0, vy: 0 },
    speed: BALL_SPEED0,
    aiTarget: MID,
    aiTimer: 0,
    hits: 0,
  };

  // ------------------------------------------------------------- input
  let up = false;
  let down = false;

  window.addEventListener('keydown', (e) => {
    if (e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp') { up = true; e.preventDefault(); }
    if (e.key === 's' || e.key === 'S' || e.key === 'ArrowDown') { down = true; e.preventDefault(); }
    if ((e.key === ' ' || e.key === 'Enter') && !state.over) {
      e.preventDefault();
      if (!state.running && !state.paused) start();
      else if (state.running) pause();
      else if (state.paused) resume();
    }
    if (e.key === 'r' || e.key === 'R') restart();
  });
  window.addEventListener('keyup', (e) => {
    if (e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp') up = false;
    if (e.key === 's' || e.key === 'S' || e.key === 'ArrowDown') down = false;
  });

  // Mouse control: paddle follows the pointer over the court.
  canvas.addEventListener('mousemove', (e) => {
    if (state.over) return;
    const rect = canvas.getBoundingClientRect();
    const y = ((e.clientY - rect.top) / rect.height) * H;
    state.playerY = clamp(y - PADDLE_H / 2, 0, H - PADDLE_H);
  });
  canvas.addEventListener('touchmove', (e) => {
    if (state.over) return;
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const y = ((e.touches[0].clientY - rect.top) / rect.height) * H;
    state.playerY = clamp(y - PADDLE_H / 2, 0, H - PADDLE_H);
  }, { passive: false });

  // ------------------------------------------------------------- buttons
  btnStart.addEventListener('click', start);
  btnPause.addEventListener('click', () => (state.running ? pause() : resume()));
  btnRestart.addEventListener('click', restart);
  btnAgain.addEventListener('click', () => { overlay.classList.add('hidden'); restart(); });

  function start() {
    if (state.over) return;
    state.running = true;
    state.paused = false;
    serve();
    btnStart.disabled = true;
    btnPause.disabled = false;
    btnPause.textContent = 'PAUSE';
  }
  function pause() {
    state.paused = true;
    btnPause.textContent = 'RESUME';
  }
  function resume() {
    if (!state.running || state.over) return;
    state.paused = false;
    btnPause.textContent = 'PAUSE';
  }
  function restart() {
    state.running = false;
    state.paused = false;
    state.over = false;
    state.you = 0;
    state.cpu = 0;
    state.hits = 0;
    state.speed = BALL_SPEED0;
    state.playerY = MID - PADDLE_H / 2;
    state.aiY = MID - PADDLE_H / 2;
    state.ball = { x: W / 2, y: MID, vx: 0, vy: 0 };
    render();
    btnStart.disabled = false;
    btnPause.disabled = true;
    btnPause.textContent = 'PAUSE';
  }

  function serve() {
    const dir = Math.random() < 0.5 ? -1 : 1;
    state.speed = BALL_SPEED0 + Math.min(state.hits * 0.12, BALL_MAX - BALL_SPEED0);
    state.ball = {
      x: W / 2,
      y: MID + (Math.random() * 80 - 40),
      vx: dir * state.speed,
      vy: (Math.random() * 2 - 1) * state.speed * 0.6,
    };
    // AI picks a target with a deliberate error margin so it is beatable.
    state.aiTarget = clamp(state.ball.y + (Math.random() * 2 - 1) * AI_ERROR, 0, H);
    state.aiTimer = AI_REACT;
  }

  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

  // ------------------------------------------------------------- update
  function update(dt) {
    if (!state.running || state.paused || state.over) return;

    // Manual player movement.
    const speed = 7.5;
    if (up) state.playerY = clamp(state.playerY - speed * dt * 60, 0, H - PADDLE_H);
    if (down) state.playerY = clamp(state.playerY + speed * dt * 60, 0, H - PADDLE_H);

    updateAI(dt);

    // Ball movement.
    state.ball.x += state.ball.vx * dt * 60;
    state.ball.y += state.ball.vy * dt * 60;

    // Wall bounce.
    if (state.ball.y - BALL_R < 0) { state.ball.y = BALL_R; state.ball.vy = Math.abs(state.ball.vy); }
    if (state.ball.y + BALL_R > H) { state.ball.y = H - BALL_R; state.ball.vy = -Math.abs(state.ball.vy); }

    // Paddle collisions.
    const ballLeft = state.ball.x - BALL_R;
    const ballRight = state.ball.x + BALL_R;

    if (state.ball.vx < 0 &&
        ballLeft <= PADDLE_W + 6 && ballLeft >= 0 &&
        state.ball.y > state.playerY - BALL_R && state.ball.y < state.playerY + PADDLE_H + BALL_R) {
      state.ball.x = PADDLE_W + 6 + BALL_R;
      reflect(offset(state.playerY));
      state.hits++;
    }
    if (state.ball.vx > 0 &&
        ballRight >= W - PADDLE_W - 6 && ballRight <= W &&
        state.ball.y > state.aiY - BALL_R && state.ball.y < state.aiY + PADDLE_H + BALL_R) {
      state.ball.x = W - PADDLE_W - 6 - BALL_R;
      reflect(offset(state.aiY));
      state.hits++;
    }

    // Score.
    if (state.ball.x < -20) point('cpu');
    else if (state.ball.x > W + 20) point('you');
  }

  function offset(paddleY) {
    // Where on the paddle the ball hit: -1 (top) .. 1 (bottom).
    return (state.ball.y - (paddleY + PADDLE_H / 2)) / (PADDLE_H / 2);
  }

  function reflect(off) {
    state.speed = Math.min(state.speed + 0.25, BALL_MAX);
    state.ball.vx = Math.sign(state.ball.vx) * -1 * state.speed;
    state.ball.vy = off * state.speed * 0.9 + (Math.random() * 0.6 - 0.3);
    // Keep the ball from stalling horizontally.
    if (Math.abs(state.ball.vy) < 0.8) state.ball.vy = 0.8 * Math.sign(state.ball.vy || 1);
  }

  function updateAI(dt) {
    // The AI only chases once the ball is headed toward it, and it aims at
    // its (imperfect) target. Simple, beatable, never automatic for the user.
    if (state.ball.vx > 0) {
      if (state.aiTimer > 0) {
        state.aiTimer -= dt;
      } else {
        const target = clamp(state.aiTarget - PADDLE_H / 2, 0, H - PADDLE_H);
        const diff = target - state.aiY;
        const step = AI_SPEED * dt * 60;
        state.aiY += clamp(diff, -step, step);
      }
    }
  }

  function point(who) {
    if (who === 'you') state.you++;
    else state.cpu++;
    scoreYou.textContent = state.you;
    scoreCpu.textContent = state.cpu;

    if (state.you >= WIN_SCORE || state.cpu >= WIN_SCORE) {
      state.over = true;
      state.running = false;
      const won = state.you > state.cpu;
      overlayTitle.textContent = won ? 'YOU WIN 🏆' : 'CPU WINS';
      overlaySub.textContent = `Final score — You ${state.you} : ${state.cpu} CPU`;
      overlay.classList.remove('hidden');
      btnPause.disabled = true;
    } else {
      serve();
    }
  }

  // ------------------------------------------------------------- render
  function render() {
    ctx.clearRect(0, 0, W, H);

    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const col = {
      track: isDark ? '#21262D' : '#E2E8F0',
      line: isDark ? '#30363D' : '#CBD5E1',
      player: isDark ? '#00D4FF' : '#0369A1',
      ai: isDark ? '#8B5CF6' : '#7C3AED',
      ball: isDark ? '#22D3EE' : '#0891B2',
      glow: isDark ? 'rgba(0,212,255,0.28)' : 'rgba(3,105,161,0.22)',
    };

    // Court.
    ctx.fillStyle = col.track;
    ctx.fillRect(0, 0, W, H);

    // Center net.
    ctx.strokeStyle = col.line;
    ctx.lineWidth = 3;
    ctx.setLineDash([12, 10]);
    ctx.beginPath();
    ctx.moveTo(W / 2, 0);
    ctx.lineTo(W / 2, H);
    ctx.stroke();
    ctx.setLineDash([]);

    // Paddles.
    ctx.fillStyle = col.player;
    ctx.shadowColor = col.glow;
    ctx.shadowBlur = 16;
    ctx.fillRect(6, state.playerY, PADDLE_W, PADDLE_H);
    ctx.shadowBlur = 0;

    ctx.fillStyle = col.ai;
    ctx.shadowColor = col.glow;
    ctx.shadowBlur = 16;
    ctx.fillRect(W - 6 - PADDLE_W, state.aiY, PADDLE_W, PADDLE_H);
    ctx.shadowBlur = 0;

    // Ball (only drawn during play).
    if (state.running) {
      ctx.shadowColor = col.glow;
      ctx.shadowBlur = 22;
      ctx.fillStyle = col.ball;
      ctx.beginPath();
      ctx.arc(state.ball.x, state.ball.y, BALL_R, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  // ------------------------------------------------------------- loop
  let last = performance.now();
  function loop(now) {
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    update(dt);
    render();
    requestAnimationFrame(loop);
  }

  // Restart on theme change so the canvas colors match immediately.
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', render);

  render();
  requestAnimationFrame(loop);
})();
