/**
 * 초경량 캔버스 컨페티(축하 폭죽) 애니메이션 효과
 */

class ConfettiEffect {
  constructor(canvasId = 'confetti-canvas') {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.animationId = null;
    this.colors = [
      '#FF6B8B', '#FF8E53', '#FFA07A', '#FFD166',
      '#06D6A0', '#118AB2', '#073B4C', '#A29BFE',
      '#FD79A8', '#6C5CE7', '#00CEC9', '#FDCB6E'
    ];

    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  createParticle(x, y) {
    const angle = Math.random() * Math.PI * 2;
    const velocity = Math.random() * 8 + 4;
    return {
      x: x || window.innerWidth / 2,
      y: y || window.innerHeight / 2,
      vx: Math.cos(angle) * velocity,
      vy: Math.sin(angle) * velocity - 4,
      size: Math.random() * 10 + 6,
      color: this.colors[Math.floor(Math.random() * this.colors.length)],
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 10,
      gravity: 0.18,
      opacity: 1,
      decay: Math.random() * 0.008 + 0.005,
      shape: Math.random() > 0.5 ? 'rect' : 'circle'
    };
  }

  start(count = 120) {
    this.stop();
    this.particles = [];

    // 좌우 및 중앙에서 폭죽 발사
    for (let i = 0; i < count; i++) {
      const startX = (i % 3 === 0) ? window.innerWidth * 0.2 :
                    (i % 3 === 1) ? window.innerWidth * 0.5 :
                                    window.innerWidth * 0.8;
      const startY = window.innerHeight * 0.45;
      this.particles.push(this.createParticle(startX, startY));
    }

    const animate = () => {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        p.vy += p.gravity;
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;
        p.opacity -= p.decay;

        if (p.opacity <= 0) {
          this.particles.splice(i, 1);
          continue;
        }

        this.ctx.save();
        this.ctx.translate(p.x, p.y);
        this.ctx.rotate((p.rotation * Math.PI) / 180);
        this.ctx.globalAlpha = Math.max(0, p.opacity);
        this.ctx.fillStyle = p.color;

        if (p.shape === 'rect') {
          this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        } else {
          this.ctx.beginPath();
          this.ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          this.ctx.fill();
        }

        this.ctx.restore();
      }

      if (this.particles.length > 0) {
        this.animationId = requestAnimationFrame(animate);
      } else {
        this.stop();
      }
    };

    this.animationId = requestAnimationFrame(animate);
  }

  stop() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    if (this.ctx && this.canvas) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }
}

window.ConfettiEffect = ConfettiEffect;
