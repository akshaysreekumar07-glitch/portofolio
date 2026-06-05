/* ==========================================================================
   PORTFOLIO SCRIPTS - AKSHAY SREE
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initBackgroundCanvas();
  initCSimulator();
  initCircuitCalculator();
  initContactForm();
});

/* ==========================================================================
   NAVIGATION & MOBILE TOGGLE
   ========================================================================== */
function initNavbar() {
  const navbar = document.querySelector('.navbar');
  const navToggle = document.getElementById('nav-toggle');
  const navLinks = document.getElementById('nav-links');
  const links = document.querySelectorAll('.nav-links a');

  // Change navbar appearance on scroll
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  // Mobile menu toggle
  navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('open');
    navLinks.classList.toggle('open');
  });

  // Close mobile menu when clicking link
  links.forEach(link => {
    link.addEventListener('click', () => {
      navToggle.classList.remove('open');
      navLinks.classList.remove('open');
    });
  });

  // Active section tracker on scroll
  const sections = document.querySelectorAll('section');
  const observerOptions = {
    root: null,
    rootMargin: '-30% 0px -60% 0px', // Trigger near screen middle
    threshold: 0
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        links.forEach(link => {
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    });
  }, observerOptions);

  sections.forEach(section => observer.observe(section));

  // Widget scroll focus triggers
  document.querySelectorAll('.widget-focus-trigger').forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = trigger.getAttribute('data-widget');
      const element = document.getElementById(targetId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Highlight border briefly to guide the user
        element.style.borderColor = 'var(--accent-copper)';
        element.style.boxShadow = '0 0 25px rgba(207, 138, 79, 0.4)';
        setTimeout(() => {
          element.style.borderColor = '';
          element.style.boxShadow = '';
        }, 1500);
      }
    });
  });
}

/* ==========================================================================
   CANVAS PARTICLE BACKGROUND (CIRCUIT GRID)
   ========================================================================== */
function initBackgroundCanvas() {
  const canvas = document.getElementById('bg-canvas');
  const ctx = canvas.getContext('2d');

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  let particles = [];
  const maxDistance = 120; // Connections limit
  
  // Responsive particle density
  const particleCount = width < 768 ? 25 : 60;

  class Particle {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      // Circuit speed: slower and more grid-aligned near-static drift
      this.vx = (Math.random() - 0.5) * 0.05;
      this.vy = (Math.random() - 0.5) * 0.05;
      this.size = Math.random() * 2 + 1;
    }

    draw() {
      // Outer copper contact pad
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size + 1.5, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(207, 138, 79, 0.35)';
      ctx.fill();

      // Inner gold center pin
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = '#cfa054';
      ctx.fill();
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;

      // Bounce off boundaries
      if (this.x < 0 || this.x > width) this.vx *= -1;
      if (this.y < 0 || this.y > height) this.vy *= -1;
    }
  }

  // Setup loop
  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);

    // Render & link
    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw();

      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < maxDistance) {
          ctx.beginPath();
          // Circuit-style lines: draw L-shaped path occasionally
          ctx.moveTo(particles[i].x, particles[i].y);
          
          if (dist > maxDistance * 0.7) {
            // Straight connector
            ctx.lineTo(particles[j].x, particles[j].y);
          } else {
            // L-shape logic simulating PCB trace routing
            ctx.lineTo(particles[j].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
          }
          
          const alpha = (1 - dist / maxDistance) * 0.15;
          ctx.strokeStyle = `rgba(170, 91, 40, ${alpha})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(animate);
  }

  animate();

  // Resize handler
  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });
}

/* ==========================================================================
   C CONSOLE SIMULATOR
   ========================================================================== */
function initCSimulator() {
  const codeDisplay = document.getElementById('code-display');
  const simInputs = document.getElementById('sim-inputs');
  const terminalOut = document.getElementById('terminal-out');
  const btnRun = document.getElementById('btn-run-c');
  const codeBtns = document.querySelectorAll('.code-btn');

  // Programs dictionary
  const programs = {
    evenOdd: {
      code: `#include <stdio.h>\n\nint main() {\n    int number = [VAL];\n\n    if (number % 2 == 0) {\n        printf("%d is even.\\n", number);\n    } else {\n        printf("%d is odd.\\n", number);\n    }\n    return 0;\n}`,
      label: "Enter a number to check Even/Odd:",
      defaultValue: 14,
      inputType: "number",
      run: (val) => {
        const num = parseInt(val);
        if (isNaN(num)) return "Error: Invalid number.";
        return `> compiling source...\n> running target...\n\nOutput:\n${num} is ${num % 2 === 0 ? 'even' : 'odd'}.`;
      }
    },
    prime: {
      code: `#include <stdio.h>\n\nint main() {\n    int n = [VAL], i, flag = 0;\n\n    for (i = 2; i <= n / 2; ++i) {\n        if (n % i == 0) {\n            flag = 1;\n            break;\n        }\n    }\n    if (n <= 1) {\n        printf("%d is neither prime nor composite.\\n", n);\n    } else if (flag == 0) {\n        printf("%d is a prime number.\\n", n);\n    } else {\n        printf("%d is not a prime number.\\n", n);\n    }\n    return 0;\n}`,
      label: "Enter an integer:",
      defaultValue: 17,
      inputType: "number",
      run: (val) => {
        const n = parseInt(val);
        if (isNaN(n)) return "Error: Invalid number.";
        if (n <= 1) {
          return `> compiling source...\n> running target...\n\nOutput:\n${n} is neither prime nor composite.`;
        }
        let flag = 0;
        for (let i = 2; i <= Math.floor(n / 2); i++) {
          if (n % i === 0) {
            flag = 1;
            break;
          }
        }
        return `> compiling source...\n> running target...\n\nOutput:\n${n} is ${flag === 0 ? 'a prime number' : 'NOT a prime number'}.`;
      }
    },
    compare: {
      code: `#include <stdio.h>\n\nint main() {\n    int a = [VAL1], b = [VAL2];\n\n    if (a > b) {\n        printf("%d is greater than %d.\\n", a, b);\n    } else if (b > a) {\n        printf("%d is greater than %d.\\n", b, a);\n    } else {\n        printf("Both numbers are equal.\\n");\n    }\n    return 0;\n}`,
      label: "Enter values for A and B:",
      defaultValue: [45, 23],
      inputType: "dual-number",
      run: (val1, val2) => {
        const a = parseInt(val1);
        const b = parseInt(val2);
        if (isNaN(a) || isNaN(b)) return "Error: Invalid input values.";
        let resText = "";
        if (a > b) resText = `${a} is greater than ${b}.`;
        else if (b > a) resText = `${b} is greater than ${a}.`;
        else resText = `Both numbers are equal.`;
        return `> compiling source...\n> running target...\n\nOutput:\n${resText}`;
      }
    }
  };

  let currentProgram = 'evenOdd';

  function updateSimulatorUI() {
    const prog = programs[currentProgram];
    
    // Set code block text
    if (prog.inputType === 'dual-number') {
      codeDisplay.textContent = prog.code.replace('[VAL1]', prog.defaultValue[0]).replace('[VAL2]', prog.defaultValue[1]);
      simInputs.innerHTML = `
        <label>${prog.label}</label>
        <input type="number" id="c-val-1" value="${prog.defaultValue[0]}">
        <input type="number" id="c-val-2" value="${prog.defaultValue[1]}">
      `;
    } else {
      codeDisplay.textContent = prog.code.replace('[VAL]', prog.defaultValue);
      simInputs.innerHTML = `
        <label>${prog.label}</label>
        <input type="number" id="c-val-1" value="${prog.defaultValue}">
      `;
    }

    // Bind change listeners to input elements to update code window in real time
    const input1 = document.getElementById('c-val-1');
    const input2 = document.getElementById('c-val-2');

    const updateCodeText = () => {
      let codeText = prog.code;
      if (prog.inputType === 'dual-number') {
        const v1 = input1.value || '0';
        const v2 = input2.value || '0';
        codeText = codeText.replace('[VAL1]', v1).replace('[VAL2]', v2);
      } else {
        const v1 = input1.value || '0';
        codeText = codeText.replace('[VAL]', v1);
      }
      codeDisplay.textContent = codeText;
    };

    input1.addEventListener('input', updateCodeText);
    if (input2) input2.addEventListener('input', updateCodeText);

    terminalOut.textContent = `Console ready. Select input variables and click "Run Code" above.`;
    document.querySelector('.terminal-status').textContent = 'Process status: IDLE';
  }

  // Bind selector tabs
  codeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      codeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentProgram = btn.getAttribute('data-program');
      updateSimulatorUI();
    });
  });

  // Execute click
  btnRun.addEventListener('click', () => {
    const statusText = document.querySelector('.terminal-status');
    statusText.textContent = 'Process status: COMPILING...';
    terminalOut.textContent = '> initializing gcc compiler...\n> checking headers...\n> linkage matches...';
    
    setTimeout(() => {
      const prog = programs[currentProgram];
      const val1 = document.getElementById('c-val-1').value;
      const val2 = document.getElementById('c-val-2') ? document.getElementById('c-val-2').value : null;

      let resultText = "";
      if (prog.inputType === 'dual-number') {
        resultText = prog.run(val1, val2);
      } else {
        resultText = prog.run(val1);
      }
      
      terminalOut.textContent = resultText;
      statusText.textContent = 'Process status: SUCCESS (0)';
    }, 600);
  });

  // Init default load
  updateSimulatorUI();
}

/* ==========================================================================
   RESISTOR & NETWORK CALCULATOR
   ========================================================================== */
function initCircuitCalculator() {
  // Tabs solver toggle
  const tabs = document.querySelectorAll('.calc-tab');
  const panels = document.querySelectorAll('.calc-content');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));
      
      tab.classList.add('active');
      const calcType = tab.getAttribute('data-calc');
      document.getElementById(`calc-${calcType}-panel`).classList.add('active');
    });
  });

  // RESISTOR BAND LOGIC
  const colorsHex = {
    "0": "#000000", // Black
    "1": "#8B5A2B", // Brown
    "2": "#FF0000", // Red
    "3": "#FF8C00", // Orange
    "4": "#FFD700", // Yellow
    "5": "#008000", // Green
    "6": "#0000FF", // Blue
    "7": "#EE82EE", // Violet
    "8": "#808080", // Gray
    "9": "#FFFFFF", // White
    "5%": "#D4AF37", // Gold
    "10%": "#C0C0C0" // Silver
  };

  const band1 = document.getElementById('band1');
  const band2 = document.getElementById('band2');
  const band3 = document.getElementById('band3');
  const band4 = document.getElementById('band4');

  const vis1 = document.getElementById('vis-band-1');
  const vis2 = document.getElementById('vis-band-2');
  const vis3 = document.getElementById('vis-band-3');
  const vis4 = document.getElementById('vis-band-4');
  const resultDisplay = document.getElementById('resistor-result');

  function calculateResistorValue() {
    const d1 = parseInt(band1.value);
    const d2 = parseInt(band2.value);
    const mult = parseInt(band3.value);
    const tol = band4.options[band4.selectedIndex].text.split('(')[1].replace(')', '');

    // Color bands display adjustment
    vis1.style.backgroundColor = colorsHex[d1];
    vis2.style.backgroundColor = colorsHex[d2];
    
    // Band 3 Color matching multiplier index
    const mValue = band3.value;
    let b3Color = '#000';
    if (mValue == "1") b3Color = colorsHex["0"];
    else if (mValue == "10") b3Color = colorsHex["1"];
    else if (mValue == "100") b3Color = colorsHex["2"];
    else if (mValue == "1000") b3Color = colorsHex["3"];
    else if (mValue == "10000") b3Color = colorsHex["4"];
    else if (mValue == "100000") b3Color = colorsHex["5"];
    else if (mValue == "1000000") b3Color = colorsHex["6"];
    vis3.style.backgroundColor = b3Color;

    // Tolerance band color
    const tVal = band4.value;
    let b4Color = '#d4af37';
    if (tVal == "5") b4Color = colorsHex["5%"];
    else if (tVal == "10") b4Color = colorsHex["10%"];
    else if (tVal == "1") b4Color = colorsHex["1"];
    else if (tVal == "2") b4Color = colorsHex["2"];
    vis4.style.backgroundColor = b4Color;

    const baseVal = (d1 * 10) + d2;
    const finalVal = baseVal * mult;

    let textVal = "";
    if (finalVal >= 1000000) {
      textVal = `${(finalVal / 1000000).toFixed(1)} MΩ`;
    } else if (finalVal >= 1000) {
      textVal = `${(finalVal / 1000).toFixed(1)} kΩ`;
    } else {
      textVal = `${finalVal} Ω`;
    }

    resultDisplay.textContent = `${textVal}`;
    document.querySelector('.calc-result-lbl').textContent = `Calculated Value (${band4.options[band4.selectedIndex].text} Tolerance)`;
  }

  [band1, band2, band3, band4].forEach(select => {
    select.addEventListener('change', calculateResistorValue);
  });

  // Calculate default values
  calculateResistorValue();

  // NETWORK SOLVER LOGIC
  const typeRadios = document.querySelectorAll('input[name="net-type"]');
  const compRadios = document.querySelectorAll('input[name="comp-type"]');
  const val1Input = document.getElementById('net-val1');
  const val2Input = document.getElementById('net-val2');
  const labelVal1 = document.getElementById('val1-label');
  const labelVal2 = document.getElementById('val2-label');
  const solverResult = document.getElementById('network-result');
  const solverResultLabel = document.getElementById('network-result-label');

  function calculateNetwork() {
    const isSeries = document.querySelector('input[name="net-type"]:checked').value === 'series';
    const isResistors = document.querySelector('input[name="comp-type"]:checked').value === 'resistors';
    const val1 = parseFloat(val1Input.value) || 0;
    const val2 = parseFloat(val2Input.value) || 0;

    let ans = 0;
    let unit = isResistors ? 'Ω' : 'µF';
    let label = isResistors ? 'Equivalent Resistance (Req)' : 'Equivalent Capacitance (Ceq)';

    // Label adjustments
    if (isResistors) {
      labelVal1.textContent = "Value 1 (R1 in Ω)";
      labelVal2.textContent = "Value 2 (R2 in Ω)";
    } else {
      labelVal1.textContent = "Value 1 (C1 in µF)";
      labelVal2.textContent = "Value 2 (C2 in µF)";
    }

    if (isSeries) {
      if (isResistors) {
        // Resistors in series: R1 + R2
        ans = val1 + val2;
      } else {
        // Capacitors in series: 1/(1/C1 + 1/C2)
        if (val1 + val2 === 0) ans = 0;
        else ans = (val1 * val2) / (val1 + val2);
      }
    } else {
      if (isResistors) {
        // Resistors in parallel: 1/(1/R1 + 1/R2)
        if (val1 + val2 === 0) ans = 0;
        else ans = (val1 * val2) / (val1 + val2);
      } else {
        // Capacitors in parallel: C1 + C2
        ans = val1 + val2;
      }
    }

    // Formatting unit multipliers for resistors
    if (isResistors) {
      if (ans >= 1000000) {
        solverResult.textContent = `${(ans / 1000000).toFixed(2)} MΩ`;
      } else if (ans >= 1000) {
        solverResult.textContent = `${(ans / 1000).toFixed(2)} kΩ`;
      } else {
        solverResult.textContent = `${ans.toFixed(2)} Ω`;
      }
    } else {
      solverResult.textContent = `${ans.toFixed(2)} µF`;
    }
    
    solverResultLabel.textContent = label;
  }

  [val1Input, val2Input].forEach(inp => inp.addEventListener('input', calculateNetwork));
  typeRadios.forEach(rad => rad.addEventListener('change', calculateNetwork));
  compRadios.forEach(rad => rad.addEventListener('change', calculateNetwork));

  calculateNetwork();
}

/* ==========================================================================
   CONTACT FORM SUBMISSION W/ PREVIEW STATE
   ========================================================================== */
function initContactForm() {
  const form = document.getElementById('contact-form');
  const toast = document.getElementById('success-toast');

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('form-name').value;
    const email = document.getElementById('form-email').value;
    const subject = document.getElementById('form-subject').value;
    const msg = document.getElementById('form-message').value;

    // Check data validity
    if (!name || !email || !subject || !msg) return;

    // LocalStorage storage simulator
    const messages = JSON.parse(localStorage.getItem('portfolio_messages') || '[]');
    messages.push({
      name, email, subject, msg, timestamp: new Date().toISOString()
    });
    localStorage.setItem('portfolio_messages', JSON.stringify(messages));

    // Show simulated success toast
    toast.classList.add('show');
    
    setTimeout(() => {
      toast.classList.remove('show');
    }, 4000);

    // Open native client using formatted values
    const bodyText = `Hi Akshay,\n\n${msg}\n\nFrom,\n${name} (${email})`;
    const mailtoLink = `mailto:akshaysreekumar07@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyText)}`;
    
    // Clear elements
    form.reset();
    
    // Launch client
    setTimeout(() => {
      window.location.href = mailtoLink;
    }, 1000);
  });
}
