import { useEffect, useRef } from 'react';

const Snowfall = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    // Determine theme based on day (Snow on ODD days, Feathers on EVEN days)
    // Today is the 18th (even), so this will show FEATHERS now.
    const today = new Date().getDate();
    const isSnowDay = today % 2 !== 0;

    let particles = [];
    const particleCount = window.innerWidth < 768 ? 60 : 120;
    let wind = 0;
    let time = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', resize);
    resize();

    class Particle {
      constructor(firstRun = false) {
        this.init(firstRun);
      }

      init(firstRun = false) {
        // Depth layers
        const r = Math.random();
        if (r < 0.5) this.layer = 0;      
        else if (r < 0.8) this.layer = 1; 
        else if (r < 0.95) this.layer = 2; 
        else this.layer = 3;              

        this.x = Math.random() * canvas.width;
        this.y = firstRun ? Math.random() * canvas.height : -100;
        
        // Base properties based on theme
        if (isSnowDay) {
          // Snow Properties
          const baseSizes = [0.8, 1.5, 3, 6];
          this.size = Math.random() * baseSizes[this.layer] + (baseSizes[this.layer] * 0.5);
          this.speed = [0.3, 0.7, 1.2, 2.5][this.layer] * (0.8 + Math.random() * 0.4);
          this.opacity = [0.05, 0.2, 0.4, 0.6][this.layer] + Math.random() * 0.1;
          this.swingSpeed = [0.005, 0.01, 0.02, 0.03][this.layer];
          this.flapSpeed = Math.random() * 0.06 + 0.02;
        } else {
          // Feather Properties (Lighter, Slower, more floating)
          const baseSizes = [4, 8, 12, 20];
          this.size = Math.random() * baseSizes[this.layer] + baseSizes[this.layer];
          this.speed = [0.2, 0.4, 0.6, 1.0][this.layer] * (0.7 + Math.random() * 0.3);
          this.opacity = [0.03, 0.1, 0.2, 0.3][this.layer] + Math.random() * 0.1;
          this.swingSpeed = [0.002, 0.005, 0.01, 0.015][this.layer];
          this.flapSpeed = Math.random() * 0.03 + 0.01;
        }
        
        this.swing = Math.random() * Math.PI * 2;
        this.horizontalDrift = (Math.random() - 0.5) * 0.2;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.02;
        this.flap = Math.random() * Math.PI * 2;
        this.glint = Math.random() * Math.PI * 2;
        this.glintSpeed = Math.random() * 0.03;
        
        this.isSpecial = Math.random() > 0.95;
        this.colorHue = this.isSpecial ? (Math.random() > 0.5 ? 280 : 40) : (isSnowDay ? 210 : 0); // Snow blueish, Feather whiteish/warm
      }

      update() {
        const windEffect = Math.sin(time * 0.001) * (isSnowDay ? 0.5 : 1.2) + wind;
        
        this.y += this.speed;
        this.x += this.horizontalDrift + Math.sin(this.swing) * (this.layer + 1) * (isSnowDay ? 0.3 : 0.8) + windEffect;
        this.swing += this.swingSpeed;
        this.rotation += this.rotationSpeed;
        this.flap += this.flapSpeed;
        this.glint += this.glintSpeed;

        if (this.y > canvas.height + 100) {
          this.init(false);
        }
        if (this.x > canvas.width + 100) this.x = -100;
        else if (this.x < -100) this.x = canvas.width + 100;
      }

      draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        const flapScale = Math.abs(Math.cos(this.flap));
        ctx.scale(1, flapScale);
        
        const shimmer = Math.sin(this.glint) * 0.5 + 0.5;
        const currentOpacity = this.opacity * (0.6 + flapScale * 0.4) * (0.8 + shimmer * 0.2);
        
        if (isSnowDay) {
          // --- DRAW SNOW CRYSTAL ---
          ctx.beginPath();
          const points = 6;
          for (let i = 0; i < points * 2; i++) {
            const radius = i % 2 === 0 ? this.size : this.size * 0.45;
            const angle = (Math.PI * i) / points;
            ctx.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
          }
          ctx.closePath();
          
          const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, this.size);
          const colorBase = this.isSpecial ? `hsla(${this.colorHue}, 100%, 90%,` : `rgba(255, 255, 255,`;
          grad.addColorStop(0, `${colorBase} ${currentOpacity})`);
          grad.addColorStop(0.3, `hsla(${this.colorHue}, 80%, 95%, ${currentOpacity * 0.8})`);
          grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
          ctx.fillStyle = grad;
          ctx.fill();

          if (this.layer >= 2 && shimmer > 0.85) {
            const sparkSize = this.size * (1.5 + shimmer);
            const sparkGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, sparkSize);
            sparkGrad.addColorStop(0, `rgba(255, 255, 255, ${shimmer * 0.5})`);
            sparkGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
            ctx.fillStyle = sparkGrad;
            ctx.beginPath();
            ctx.arc(0, 0, sparkSize, 0, Math.PI * 2);
            ctx.fill();
          }
        } else {
          // --- DRAW REAL FEATHER ---
          const length = this.size * 2;
          const width = this.size * 0.5;
          
          // Feather spine (quill) - slightly curved
          ctx.beginPath();
          ctx.moveTo(0, -length / 2);
          ctx.quadraticCurveTo(width * 0.2, 0, 0, length / 2);
          ctx.strokeStyle = `rgba(255, 255, 255, ${currentOpacity * 0.7})`;
          ctx.lineWidth = 1;
          ctx.stroke();

          // Draw barbs (the soft parts)
          ctx.beginPath();
          for (let i = 0; i < 40; i++) {
            const pos = (i / 40) - 0.5; // -0.5 to 0.5
            const y = pos * length;
            
            // Taper the width based on position (thinner at ends)
            const taper = Math.sin(Math.acos(pos * 2));
            const barbWidth = width * taper;
            
            // Left side barb
            ctx.moveTo(0, y);
            ctx.quadraticCurveTo(
              -barbWidth, y + length * 0.1, // Curve control point
              -barbWidth * 1.2, y + length * 0.2 // Barb end point
            );
            
            // Right side barb
            ctx.moveTo(0, y);
            ctx.quadraticCurveTo(
              barbWidth, y + length * 0.1, 
              barbWidth * 1.2, y + length * 0.2
            );
          }
          
          // Add a soft glow to the feather
          const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, length / 2);
          grad.addColorStop(0, `rgba(255, 255, 255, ${currentOpacity * 0.4})`);
          grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
          ctx.fillStyle = grad;
          ctx.fill();

          ctx.strokeStyle = `rgba(255, 255, 255, ${currentOpacity * 0.3})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
        
        ctx.restore();
      }
    }

    const createParticles = () => {
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle(true));
      }
    };

    const animate = () => {
      time++;
      // Subtle wind variation
      if (time % 200 === 0) {
        wind = (Math.random() - 0.5) * 0.5;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.update();
        p.draw();
      });
      animationFrameId = requestAnimationFrame(animate);
    };

    createParticles();
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 1500, // Place over content but below Navbar (2000)
        pointerEvents: 'none',
        opacity: 0.7
      }}
    />
  );
};

export default Snowfall;
