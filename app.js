(() => {
  'use strict';

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const rand = (a, b) => a + Math.random() * (b - a);
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

  const fx = $('#fx');

  const PALETTE = ['#FF4E1A', '#ECE7DE', '#A8E063', '#74C7EC', '#F19BD1'];
  const LABELS = { type: 'type', card: 'build', panel: 'frame' };
  const typed = new WeakMap();

  const PAINT_COLORS = {
    ink: '#ECE7DE',
    accent: '#FF4E1A',
    sky: '#74C7EC',
    lime: '#A8E063',
    pink: '#F19BD1',
  };

  const TOOL_ICONS = {
    pencil: '<path d="M2.5 11.5 9.7 4.3 11.1 5.7 3.9 12.9 1.8 13.1Z"/><path d="M8.9 5.1 10.3 6.5"/>',
    brush: '<path d="M3.2 10.8 C2.2 12 1.2 12.2 1.2 12.2 C1.2 12.2 2.6 12.1 3.5 13 C4.2 13.7 5.4 13.3 5.4 12.2 C5.4 11.4 4.2 10.4 3.2 10.8 Z"/><path d="M5.6 11.2 11.8 4.4"/>',
    line: '<line x1="2" y1="12" x2="12" y2="2"/>',
    rect: '<rect x="2.5" y="3.5" width="9" height="7"/>',
    ellipse: '<ellipse cx="7" cy="7" rx="4.5" ry="3.6"/>',
    fill: '<path d="M7 1.8 C7 1.8 3 6.4 3 8.8 A4 4 0 0 0 11 8.8 C11 6.4 7 1.8 7 1.8 Z"/>',
  };

  const artReady = new WeakMap();

  const CASE_ORDER = ['loom', 'halcyon', 'field-notes', 'sable', 'orbit', 'paper-trail', 'volume'];

  const CASES = {
    loom: {
      index: '01',
      title: 'Loom',
      summary: 'A spatial canvas for research teams: fragments in, a map out.',
      meta: [
        ['Role', 'Product design, front-end'],
        ['Year', '2025'],
        ['Stack', 'React, WebGL, Canvas'],
      ],
      body: [
        ['Brief', 'Research teams were drowning in fragments — quotes, PDFs, screenshots — that never became a shared map. Loom began as an internal tool for turning that debris into spatial memory.'],
        ['Move', 'We designed around one gesture: drop something anywhere and it becomes a node. The canvas stays quiet until you need it, while a custom WebGL renderer keeps ten thousand nodes at 60fps.'],
        ['Outcome', 'The beta opened to 1,200 researchers. A typical synthesis session fell from ninety minutes to twenty-eight, and the canvas became the default view for every new project.'],
      ],
      result: '3.2× faster synthesis — 10,000 nodes at 60fps.',
    },
    halcyon: {
      index: '02',
      title: 'Halcyon',
      summary: 'On-call tooling rebuilt for the person holding the phone.',
      meta: [
        ['Role', 'Product design'],
        ['Year', '2024'],
        ['Stack', 'SwiftUI, incident API'],
      ],
      body: [
        ['Brief', 'Incident tools optimize for notifications, not for the person receiving them. Halcyon started with a field study of fourteen engineers and one question: what should a tired person see at 3am?'],
        ['Move', 'We collapsed the alert firehose into a single incident focus. Severity, ownership, and the next action sit in one glance; everything else moves behind intent. The mobile app became the primary surface.'],
        ['Outcome', 'Mean time to acknowledge fell 41%. The one-screen rule survived four releases, and the team still uses it as a design constraint.'],
      ],
      result: '41% faster acknowledgement — 14 field interviews.',
    },
    'field-notes': {
      index: '03',
      title: 'Field Notes',
      summary: 'A newsroom CMS that works when the connection drops.',
      meta: [
        ['Role', 'Design and build'],
        ['Year', '2024'],
        ['Stack', 'Next.js, custom CMS'],
      ],
      body: [
        ['Brief', 'A nonprofit climate newsroom needed to publish from the field, with photographs, no laptop, and a connection that came and went. The old CMS assumed a desk.'],
        ['Move', 'The editor became a sequence of cards that could be filed offline and reconciled later. On the reader side, the site is type-led and image-sparing: the whole reading experience costs less than 80KB.'],
        ['Outcome', 'Reporters filed from eleven countries. First paint on 2G dropped to 2.4 seconds; the platform was renewed for three years.'],
      ],
      result: '2.4s first paint on 2G — reporters in 11 countries.',
    },
    sable: {
      index: '04',
      title: 'Sable',
      summary: 'Ninety years of caution, and a younger client base.',
      meta: [
        ['Role', 'Design lead'],
        ['Year', '2023'],
        ['Stack', 'iOS, design system'],
      ],
      body: [
        ['Brief', 'A private bank wanted a younger client base without losing the caution of a ninety-year-old institution. The answer was not a playful mascot.'],
        ['Move', 'We treated money as a system: accounts, goals, and risk share one visual grammar. Motion explains transfers; it never celebrates them. Every screen works with one thumb.'],
        ['Outcome', 'The app launched to 18,000 clients. Navigation-related support contacts dropped by a third, and the design system now covers sixty-two screens.'],
      ],
      result: '18,000 clients — 62 screens, one system.',
    },
    orbit: {
      index: '05',
      title: 'Orbit',
      summary: 'Eleven shades of blue, one shared language.',
      meta: [
        ['Role', 'Systems design'],
        ['Year', '2022'],
        ['Stack', 'TypeScript, Storybook, tokens'],
      ],
      body: [
        ['Brief', 'A fintech growing from forty to two hundred people had no shared language. Design was becoming a bottleneck for engineering.'],
        ['Move', 'Tokens first, components second, governance third. An RFC process and a weekly office hour kept the system honest; adoption was measured, never mandated.'],
        ['Outcome', 'Component duplication fell 68%, and new screens ship in days. The system survived two rebrands and one acquisition.'],
      ],
      result: '68% less duplication — 200 people aligned.',
    },
    'paper-trail': {
      index: '06',
      title: 'Paper Trail',
      summary: 'An independent press, designed at reading speed.',
      meta: [
        ['Role', 'Brand and web'],
        ['Year', '2021'],
        ['Stack', 'Astro, custom type'],
      ],
      body: [
        ['Brief', 'An independent press wanted a digital identity that felt like a printed object: slow, deliberate, unafraid of white space.'],
        ['Move', 'A commission-first type system and a reading interface with almost no chrome. The site has one interaction — turn the page — and it is enough.'],
        ['Outcome', 'Subscriptions doubled in six months, and the identity was shortlisted for a D&AD pencil. The press still uses the system.'],
      ],
      result: '2× subscriptions — D&AD shortlist.',
    },
    volume: {
      index: '07',
      title: 'Volume',
      summary: 'A festival mark that only works in three dimensions.',
      meta: [
        ['Role', 'Art direction, creative engineering'],
        ['Year', '2025'],
        ['Stack', 'Canvas, 3D math'],
      ],
      body: [
        ['Brief', 'A design festival needed a mark that could live as a poster, a screen, and a thing you turn in your hand. A flat logo would have been a compromise.'],
        ['Move', 'We modeled the mark as a wireframe torus with three accent bands, then built a small real-time renderer that treats depth as a material. The cursor can spin it; the mark never repeats an angle.'],
        ['Outcome', 'The identity ran across forty-two assets and a live stage. Visitors spent an average of thirty-eight seconds turning the mark — the only project on this site you can hold.'],
      ],
      result: '42 assets — 38s average interaction.',
    },
  };

  const painting = new WeakSet();
  const armedArt = new WeakSet();
  let painterSeq = 0;

  let started = false;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function updateClock() {
    const el = $('#local-time');
    if (!el) return;
    try {
      const time = new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/New_York',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }).format(new Date());
      el.textContent = `${time}`;
    } catch (e) {
      el.textContent = 'local';
    }
  }

  updateClock();
  setInterval(updateClock, 30000);

  /* ---------------------------------------------------------
     Text preparation: split into character spans while
     preserving emphasis and line breaks. The spans occupy
     their final layout immediately, so nothing shifts.
     --------------------------------------------------------- */

  function prepareChars(el) {
    let chars = typed.get(el);
    if (chars) return chars;

    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);

    chars = [];

    for (const node of nodes) {
      const text = node.nodeValue.replace(/\s+/g, ' ');
      if (!text.trim()) {
        node.remove();
        continue;
      }

      const frag = document.createDocumentFragment();
      for (const character of Array.from(text)) {
        const span = document.createElement('span');
        span.className = 'ch';
        span.textContent = character;
        frag.appendChild(span);
        chars.push(span);
      }
      node.replaceWith(frag);
    }

    el.classList.add('is-typed');
    typed.set(el, chars);
    return chars;
  }

  /* ---------------------------------------------------------
     Static UI: case studies and the seams overlay.
     These must work with or without motion.
     --------------------------------------------------------- */

  setupCases();
  setupSeams();

  /* ---------------------------------------------------------
     Reduced motion: reveal the finished page, no workers.
     --------------------------------------------------------- */

  if (reducedMotion) {
    document.body.classList.add('is-live');
    $$('[data-count]').forEach((el) => {
      el.textContent = el.dataset.count;
    });
    return;
  }

  $$('[data-build="type"], .type-title').forEach((el) => prepareChars(el));
  $$('.project__art').forEach((art) => prepareArt(art));

  /* ---------------------------------------------------------
     The cursor
     --------------------------------------------------------- */

  class Cursor {
    constructor(color, index) {
      this.color = color;
      this.index = index;
      this.x = 0;
      this.y = 0;
      this.marquee = null;
      this.side = [0, 2, 3, 1, 2][index % 5];

      this.el = document.createElement('div');
      this.el.className = 'cursor';
      this.el.style.setProperty('--c', color);
      this.el.innerHTML = `
        <div class="cursor__ripple"></div>
        <svg class="cursor__arrow" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M5.6 2.8 19.6 12.4 12.6 13.6 9.5 21.2Z"></path>
        </svg>
        <span class="cursor__label">type</span>
      `;
      this.labelEl = this.el.querySelector('.cursor__label');
      this.ripple = this.el.querySelector('.cursor__ripple');

      this.caret = document.createElement('div');
      this.caret.className = 'caret';
      this.caret.style.setProperty('--c', color);

      fx.append(this.caret, this.el);
    }

    setPos(x, y) {
      this.x = x;
      this.y = y;
      this.el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    }

    spawn() {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const sx = window.scrollX;
      const sy = window.scrollY;
      let x;
      let y;

      if (this.side === 0) {
        x = -54;
        y = sy + rand(vh * 0.18, vh * 0.82);
      } else if (this.side === 1) {
        x = vw + 54;
        y = sy + rand(vh * 0.18, vh * 0.82);
      } else if (this.side === 2) {
        x = rand(vw * 0.12, vw * 0.88);
        y = sy - 54;
      } else {
        x = rand(vw * 0.12, vw * 0.88);
        y = sy + vh + 54;
      }

      this.setPos(x, y);
      void this.el.getBoundingClientRect();
      this.el.classList.add('is-on');
    }

    setLabel(text) {
      if (this.labelEl.textContent !== text) this.labelEl.textContent = text;
    }

    setColor(color) {
      this.color = color;
      this.el.style.setProperty('--c', color);
      this.caret.style.setProperty('--c', color);
    }

    spawnAtArt(art) {
      const rect = art.getBoundingClientRect();
      const x = rect.right + window.scrollX + 18;
      const y = rect.top + window.scrollY + rand(rect.height * 0.4, rect.height * 0.8);
      this.setPos(x, y);
      void this.el.getBoundingClientRect();
      this.el.classList.add('is-on');
    }

    grab() {
      this.el.classList.add('is-down');
    }

    release() {
      this.el.classList.remove('is-down');
    }

    moveTo(tx, ty, duration) {
      const sx = this.x;
      const sy = this.y;
      const dx = tx - sx;
      const dy = ty - sy;
      const dist = Math.hypot(dx, dy);

      if (dist < 1.5) {
        this.setPos(tx, ty);
        return Promise.resolve();
      }

      const dur = duration || clamp(dist * 0.52, 280, 980);
      const bend = Math.min(dist * 0.09, 52) * (Math.random() < 0.5 ? -1 : 1);
      const nx = -dy / dist;
      const ny = dx / dist;
      const cx = (sx + tx) / 2 + nx * bend;
      const cy = (sy + ty) / 2 + ny * bend;

      return new Promise((resolve) => {
        const start = performance.now();
        const step = (now) => {
          const t = clamp((now - start) / dur, 0, 1);
          const e = easeInOutCubic(t);
          const mt = 1 - e;

          this.setPos(
            mt * mt * sx + 2 * mt * e * cx + e * e * tx,
            mt * mt * sy + 2 * mt * e * cy + e * e * ty
          );

          if (t < 1) requestAnimationFrame(step);
          else resolve();
        };
        requestAnimationFrame(step);
      });
    }

    press() {
      this.el.classList.add('is-down');
      setTimeout(() => this.el.classList.remove('is-down'), 120);

      if (this.ripple.animate) {
        this.ripple.animate(
          [
            { opacity: 0.85, transform: 'scale(0.6)' },
            { opacity: 0, transform: 'scale(5)' },
          ],
          { duration: 520, easing: 'cubic-bezier(.2,.7,.2,1)' }
        );
      }
    }

    dragTo(x0, y0, x1, y1) {
      this.setPos(x0, y0);

      const marquee = document.createElement('div');
      marquee.className = 'marquee';
      marquee.style.setProperty('--c', this.color);
      marquee.style.left = `${x0}px`;
      marquee.style.top = `${y0}px`;
      marquee.style.width = '0px';
      marquee.style.height = '0px';
      marquee.innerHTML = `
        <i class="marquee__h marquee__h--tl"></i>
        <i class="marquee__h marquee__h--tr"></i>
        <i class="marquee__h marquee__h--bl"></i>
        <i class="marquee__h marquee__h--br"></i>
        <span class="marquee__dim">0 × 0</span>
      `;
      fx.appendChild(marquee);
      this.marquee = marquee;

      const dim = marquee.querySelector('.marquee__dim');
      const dur = clamp(Math.hypot(x1 - x0, y1 - y0) * 0.32, 340, 860);

      return new Promise((resolve) => {
        const start = performance.now();
        const step = (now) => {
          const t = clamp((now - start) / dur, 0, 1);
          const e = easeInOutCubic(t);
          const cx = x0 + (x1 - x0) * e;
          const cy = y0 + (y1 - y0) * e;
          const w = Math.abs(cx - x0);
          const h = Math.abs(cy - y0);

          this.setPos(cx, cy);
          marquee.style.left = `${Math.min(x0, cx)}px`;
          marquee.style.top = `${Math.min(y0, cy)}px`;
          marquee.style.width = `${w}px`;
          marquee.style.height = `${h}px`;
          dim.textContent = `${Math.round(w)} × ${Math.round(h)}`;

          if (t < 1) requestAnimationFrame(step);
          else resolve();
        };
        requestAnimationFrame(step);
      });
    }

    endMarquee() {
      if (!this.marquee) return;
      const marquee = this.marquee;
      this.marquee = null;
      marquee.classList.add('is-done');
      setTimeout(() => marquee.remove(), 220);
    }

    async type(el) {
      const chars = prepareChars(el);
      if (!chars.length) return;

      const speed = Number.parseFloat(el.dataset.speed) || 9;
      const caret = this.caret;

      caret.classList.add('is-on');

      for (let i = 0; i < chars.length; i += 1) {
        const char = chars[i];
        char.classList.add('on');

        const rect = char.getBoundingClientRect();
        if (rect.width || rect.height) {
          caret.style.left = `${rect.right + window.scrollX}px`;
          caret.style.top = `${rect.top + window.scrollY}px`;
          caret.style.height = `${Math.max(11, rect.height * 0.84)}px`;
        }

        const c = char.textContent;
        let delay = speed * rand(0.68, 1.32);
        if (c === ' ' && Math.random() < 0.07) delay += 32;
        if (',;:'.includes(c)) delay += 55;
        if ('.!?'.includes(c)) delay += 140;

        await wait(delay);
      }

      await wait(160);
      caret.classList.remove('is-on');
      el.classList.add('is-done');
    }

    async leave() {
      this.caret.classList.remove('is-on');
      this.endMarquee();
      this.setLabel('done');
      await wait(rand(120, 280));
      this.el.classList.remove('is-on');
      await wait(460);
      this.el.remove();
      this.caret.remove();
    }
  }

  /* ---------------------------------------------------------
     Counter animation for the stats
     --------------------------------------------------------- */

  function startCounters(root) {
    $$('[data-count]', root).forEach((el, i) => {
      if (el.dataset.started) return;
      el.dataset.started = '1';

      const target = Number.parseInt(el.dataset.count, 10) || 0;
      const duration = 850;
      el.textContent = '0';

      setTimeout(() => {
        const start = performance.now();
        const step = (now) => {
          const t = clamp((now - start) / duration, 0, 1);
          el.textContent = String(Math.round(target * easeOutCubic(t)));
          if (t < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      }, 220 + i * 70);
    });
  }

  /* ---------------------------------------------------------
     Paint station: a toolbar, a palette, and real drawing.
     Each primitive is drawn by the painter cursor with the
     matching tool instead of appearing automatically.
     --------------------------------------------------------- */

  function paintNum(el, name) {
    return Number.parseFloat(el.getAttribute(name)) || 0;
  }

  function artPoint(svg, x, y) {
    const pt = svg.createSVGPoint();
    pt.x = x;
    pt.y = y;
    const screen = pt.matrixTransform(svg.getScreenCTM());
    return { x: screen.x + window.scrollX, y: screen.y + window.scrollY };
  }

  function runAnim(duration, frame, easing = easeInOutCubic) {
    return new Promise((resolve) => {
      const start = performance.now();
      const step = (now) => {
        const t = clamp((now - start) / duration, 0, 1);
        frame(easing(t), t);
        if (t < 1) requestAnimationFrame(step);
        else resolve();
      };
      requestAnimationFrame(step);
    });
  }

  function createPaintDock() {
    const dock = document.createElement('div');
    dock.className = 'paint-dock';

    const tools = Object.entries(TOOL_ICONS)
      .map(
        ([key, icon]) =>
          `<span class="paint-tool" data-tool="${key}"><svg viewBox="0 0 14 14" aria-hidden="true">${icon}</svg></span>`
      )
      .join('');

    const swatches = Object.entries(PAINT_COLORS)
      .map(
        ([key, color]) =>
          `<span class="paint-swatch" data-color="${key}" style="--sw:${color}"></span>`
      )
      .join('');

    dock.innerHTML = `<div class="paint-tools">${tools}</div><span class="paint-divider"></span><div class="paint-swatches">${swatches}</div>`;
    return dock;
  }

  function prepareArt(art) {
    if (artReady.has(art)) return;

    const svg = art.querySelector('svg');
    if (!svg) return;

    const steps = $$('[data-draw]', svg).map((el) => {
      const kind = el.dataset.draw;
      const color = el.dataset.color || 'ink';
      const meta = { el, kind, color };

      if (kind === 'pencil') {
        el.setAttribute('pathLength', '1');
        el.style.strokeDasharray = '1';
        el.style.strokeDashoffset = '1';
        meta.total = el.getTotalLength();
      } else if (kind === 'line') {
        meta.x1 = paintNum(el, 'x1');
        meta.y1 = paintNum(el, 'y1');
        meta.x2 = paintNum(el, 'x2');
        meta.y2 = paintNum(el, 'y2');
        el.style.opacity = '0';
        el.setAttribute('x2', meta.x1);
        el.setAttribute('y2', meta.y1);
      } else if (kind === 'rect') {
        meta.x = paintNum(el, 'x');
        meta.y = paintNum(el, 'y');
        meta.w = paintNum(el, 'width');
        meta.h = paintNum(el, 'height');
        el.style.opacity = '0';
        el.setAttribute('width', '0');
        el.setAttribute('height', '0');
      } else if (kind === 'circle') {
        meta.cx = paintNum(el, 'cx');
        meta.cy = paintNum(el, 'cy');
        meta.r = paintNum(el, 'r');
        el.style.opacity = '0';
        el.setAttribute('r', '0');
      } else if (kind === 'ellipse') {
        meta.cx = paintNum(el, 'cx');
        meta.cy = paintNum(el, 'cy');
        meta.rx = paintNum(el, 'rx');
        meta.ry = paintNum(el, 'ry');
        el.style.opacity = '0';
        el.setAttribute('rx', '0');
        el.setAttribute('ry', '0');
      } else {
        el.style.opacity = '0';
      }

      return meta;
    });

    const dock = createPaintDock();
    art.appendChild(dock);
    artReady.set(art, { svg, steps, dock });
  }

  async function clickDockItem(cursor, item, onPress) {
    if (!item) return;
    const rect = item.getBoundingClientRect();
    const x = rect.left + window.scrollX + rect.width / 2;
    const y = rect.top + window.scrollY + rect.height / 2;
    const dist = Math.hypot(x - cursor.x, y - cursor.y);
    await cursor.moveTo(x, y, clamp(dist * 0.4, 160, 360));
    if (onPress) onPress();
    cursor.press();
    await wait(55);
  }

  async function selectTool(cursor, dock, kind) {
    const tool = kind === 'dab' ? 'brush' : kind === 'circle' ? 'ellipse' : kind;
    const group = dock.querySelector('.paint-tools');
    const item = group.querySelector(`[data-tool="${tool}"]`);
    $$('.active', group).forEach((active) => active.classList.remove('active'));
    cursor.setLabel(tool);
    await clickDockItem(cursor, item, () => item.classList.add('active'));
  }

  async function selectSwatch(cursor, dock, key) {
    const group = dock.querySelector('.paint-swatches');
    const item = group.querySelector(`[data-color="${key}"]`);
    const color = PAINT_COLORS[key] || PAINT_COLORS.ink;
    $$('.active', group).forEach((active) => active.classList.remove('active'));
    await clickDockItem(cursor, item, () => {
      item.classList.add('active');
      cursor.setColor(color);
    });
  }

  async function drawArtStep(cursor, art, step) {
    const svg = artReady.get(art).svg;
    const el = step.el;

    if (step.kind === 'line') {
      const a = artPoint(svg, step.x1, step.y1);
      const b = artPoint(svg, step.x2, step.y2);
      el.style.opacity = '1';
      el.setAttribute('x2', step.x1);
      el.setAttribute('y2', step.y1);

      await cursor.moveTo(a.x, a.y, 250);
      cursor.press();
      await wait(30);

      await runAnim(clamp(Math.hypot(b.x - a.x, b.y - a.y) * 0.55, 220, 560), (e) => {
        cursor.setPos(a.x + (b.x - a.x) * e, a.y + (b.y - a.y) * e);
        el.setAttribute('x2', step.x1 + (step.x2 - step.x1) * e);
        el.setAttribute('y2', step.y1 + (step.y2 - step.y1) * e);
      });

      el.setAttribute('x2', step.x2);
      el.setAttribute('y2', step.y2);
      await wait(50);
      return;
    }

    if (step.kind === 'rect') {
      const tl = artPoint(svg, step.x, step.y);
      const br = artPoint(svg, step.x + step.w, step.y + step.h);
      el.style.opacity = '1';
      el.setAttribute('x', step.x);
      el.setAttribute('y', step.y);
      el.setAttribute('width', '0');
      el.setAttribute('height', '0');

      await cursor.moveTo(tl.x, tl.y, 250);
      cursor.press();
      await wait(30);

      await runAnim(clamp(Math.hypot(br.x - tl.x, br.y - tl.y) * 0.52, 250, 580), (e) => {
        cursor.setPos(tl.x + (br.x - tl.x) * e, tl.y + (br.y - tl.y) * e);
        el.setAttribute('width', step.w * e);
        el.setAttribute('height', step.h * e);
      });

      el.setAttribute('width', step.w);
      el.setAttribute('height', step.h);
      await wait(50);
      return;
    }

    if (step.kind === 'circle' || step.kind === 'ellipse') {
      const isCircle = step.kind === 'circle';
      const rx = isCircle ? step.r : step.rx;
      const ry = isCircle ? step.r : step.ry;
      const x = step.cx - rx;
      const y = step.cy - ry;
      const w = rx * 2;
      const h = ry * 2;
      const tl = artPoint(svg, x, y);
      const br = artPoint(svg, x + w, y + h);

      el.style.opacity = '1';
      if (isCircle) el.setAttribute('r', '0');
      else {
        el.setAttribute('rx', '0');
        el.setAttribute('ry', '0');
      }

      await cursor.moveTo(tl.x, tl.y, 250);
      cursor.press();
      await wait(30);

      await runAnim(clamp(Math.hypot(br.x - tl.x, br.y - tl.y) * 0.5, 270, 600), (e) => {
        const cw = w * e;
        const ch = h * e;
        cursor.setPos(tl.x + cw, tl.y + ch);
        if (isCircle) {
          el.setAttribute('cx', x + cw / 2);
          el.setAttribute('cy', y + ch / 2);
          el.setAttribute('r', Math.min(cw, ch) / 2);
        } else {
          el.setAttribute('cx', x + cw / 2);
          el.setAttribute('cy', y + ch / 2);
          el.setAttribute('rx', cw / 2);
          el.setAttribute('ry', ch / 2);
        }
      });

      el.setAttribute('cx', step.cx);
      el.setAttribute('cy', step.cy);
      if (isCircle) el.setAttribute('r', step.r);
      else {
        el.setAttribute('rx', step.rx);
        el.setAttribute('ry', step.ry);
      }
      await wait(50);
      return;
    }

    if (step.kind === 'pencil') {
      const total = step.total || el.getTotalLength();
      const start = el.getPointAtLength(0);
      const startScreen = artPoint(svg, start.x, start.y);

      await cursor.moveTo(startScreen.x, startScreen.y, 270);
      cursor.press();

      const pieces = clamp(Math.round(total * 0.5), 24, 64);
      const duration = clamp(total * 3.5, 440, 1000);

      for (let i = 1; i <= pieces; i += 1) {
        const p = i / pieces;
        const point = el.getPointAtLength(total * p);
        const screen = artPoint(svg, point.x, point.y);
        cursor.setPos(screen.x, screen.y);
        el.style.strokeDashoffset = String(1 - p);
        await wait(duration / pieces);
      }

      el.style.strokeDasharray = 'none';
      el.style.strokeDashoffset = '0';
      await wait(50);
      return;
    }

    // brush stamp or bucket fill
    const box = el.getBBox();
    const center = artPoint(svg, box.x + box.width / 2, box.y + box.height / 2);

    await cursor.moveTo(center.x - 6, center.y - 5, 240);
    cursor.press();

    el.style.opacity = '1';
    el.style.transformBox = 'fill-box';
    el.style.transformOrigin = 'center';

    if (el.animate) {
      const isFill = step.kind === 'fill';
      el.animate(
        [
          { opacity: 0, transform: 'scale(0.3)' },
          { opacity: 1, transform: `scale(${isFill ? 1.03 : 1.15})`, offset: 0.7 },
          { opacity: 1, transform: 'scale(1)' },
        ],
        { duration: isFill ? 320 : 260, easing: 'cubic-bezier(.2,.8,.2,1)' }
      );
    }

    await wait(step.kind === 'fill' ? 220 : 160);
  }

  async function paintArt(art) {
    const data = artReady.get(art);
    if (!data || !data.steps.length || painting.has(art)) return;
    painting.add(art);

    const painter = new Cursor(PAINT_COLORS.ink, 3 + painterSeq);
    painterSeq += 1;

    try {
      art.classList.add('is-painting');
      painter.spawnAtArt(art);
      await wait(160);

      let tool = null;
      let color = null;

      for (const step of data.steps) {
        if (step.kind !== tool) {
          await selectTool(painter, data.dock, step.kind);
          tool = step.kind;
        }
        if (step.color !== color) {
          await selectSwatch(painter, data.dock, step.color);
          color = step.color;
        }
        await drawArtStep(painter, art, step);
      }

      await wait(150);
      art.classList.remove('is-painting');
      await painter.leave();
    } finally {
      art.classList.remove('is-painting');
    }
  }

  function armArt(art) {
    if (armedArt.has(art)) return;
    armedArt.add(art);

    const trigger = () => {
      if (art.dataset.painted) return;
      art.dataset.painted = '1';
      paintArt(art);
    };

    if (!('IntersectionObserver' in window)) {
      trigger();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          observer.disconnect();
          trigger();
        });
      },
      { threshold: 0.25, rootMargin: '0px 0px -8% 0px' }
    );

    observer.observe(art);
  }

  /* ---------------------------------------------------------
     Volume: a live wireframe torus on canvas. It assembles
     ring by ring, then a cursor turns it over for the viewer.
     --------------------------------------------------------- */

  const TAU = Math.PI * 2;
  const VOL_MAJOR = 30;
  const VOL_MINOR = 12;
  const VOL_RADIUS = 1.12;
  const VOL_TUBE = 0.4;

  function createVolume(stage) {
    const canvas = stage.querySelector('.stage__canvas');
    const statusEl = stage.querySelector('.stage__status');
    const angleEl = stage.querySelector('.stage__angle');
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const geometry = [];
    for (let i = 0; i < VOL_MAJOR; i += 1) {
      const u = (i / VOL_MAJOR) * TAU;
      const row = [];
      for (let j = 0; j < VOL_MINOR; j += 1) {
        const v = (j / VOL_MINOR) * TAU;
        const r = VOL_RADIUS + VOL_TUBE * Math.cos(v);
        row.push({
          x: r * Math.cos(u),
          y: VOL_TUBE * Math.sin(v),
          z: r * Math.sin(u),
        });
      }
      geometry.push(row);
    }

    const state = {
      w: 0,
      h: 0,
      yaw: -0.55,
      tilt: 0.82,
      build: 0,
      building: false,
      buildStart: 0,
      started: false,
      auto: true,
      paused: false,
      lastDrag: -1e9,
      time: 0,
      last: 0,
      hudAt: 0,
      raf: 0,
      resolveBuild: null,
      visible: true,
      interactive: false,
    };

    function project(p, cosY, sinY, cosT, sinT, cx, cy, unit) {
      const y1 = p.y * cosT - p.z * sinT;
      const z1 = p.y * sinT + p.z * cosT;
      const x2 = p.x * cosY + z1 * sinY;
      const z2 = -p.x * sinY + z1 * cosY;
      const s = 5 / (5 + z2);
      return { x: cx + x2 * s * unit, y: cy - y1 * s * unit, z: z2, s };
    }

    function pushSegment(buckets, p1, p2) {
      const z = (p1.z + p2.z) / 2;
      const depth = clamp((1.7 - z) / 3.4, 0, 1);
      const index = clamp(Math.round(depth * (buckets.length - 1)), 0, buckets.length - 1);
      buckets[index].push(p1.x, p1.y, p2.x, p2.y);
    }

    function draw() {
      if (!state.w || !state.h) return;

      const { w, h } = state;
      const cx = w / 2;
      const cy = h * 0.52;
      const scaleIn = 0.74 + 0.26 * easeOutCubic(state.build);
      const unit = Math.min(w, h) * 0.26 * scaleIn;

      ctx.clearRect(0, 0, w, h);

      const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.min(w, h) * 0.62);
      glow.addColorStop(0, 'rgba(236,231,222,.05)');
      glow.addColorStop(0.5, 'rgba(255,78,26,.022)');
      glow.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, w, h);

      const cosY = Math.cos(state.yaw);
      const sinY = Math.sin(state.yaw);
      const cosT = Math.cos(state.tilt);
      const sinT = Math.sin(state.tilt);

      const proj = geometry.map((row) =>
        row.map((p) => project(p, cosY, sinY, cosT, sinT, cx, cy, unit))
      );

      const bone = [[], [], [], [], []];
      const accent = [[], [], []];
      const ringsBuilt = state.build * VOL_MAJOR;
      const minorBuilt = clamp((state.build - 0.35) / 0.65, 0, 1) * VOL_MINOR;

      for (let i = 0; i < VOL_MAJOR; i += 1) {
        if (state.build < 1 && i >= ringsBuilt) continue;
        const isAccent = i % 10 === 3;
        for (let j = 0; j < VOL_MINOR; j += 1) {
          pushSegment(
            isAccent ? accent : bone,
            proj[i][j],
            proj[i][(j + 1) % VOL_MINOR]
          );
        }
      }

      for (let j = 0; j < VOL_MINOR; j += 1) {
        if (state.build < 1 && j >= minorBuilt) continue;
        for (let i = 0; i < VOL_MAJOR; i += 1) {
          if (state.build < 1 && i >= ringsBuilt) continue;
          pushSegment(bone, proj[i][j], proj[(i + 1) % VOL_MAJOR][j]);
        }
      }

      const boneAlpha = [0.06, 0.12, 0.21, 0.36, 0.58];
      for (let b = 0; b < bone.length; b += 1) {
        const pts = bone[b];
        if (!pts.length) continue;
        ctx.strokeStyle = `rgba(236,231,222,${boneAlpha[b]})`;
        ctx.lineWidth = b >= 3 ? 1 : 0.75;
        ctx.beginPath();
        for (let k = 0; k < pts.length; k += 4) {
          ctx.moveTo(pts[k], pts[k + 1]);
          ctx.lineTo(pts[k + 2], pts[k + 3]);
        }
        ctx.stroke();
      }

      const accentAlpha = [0.25, 0.55, 0.9];
      for (let b = 0; b < accent.length; b += 1) {
        const pts = accent[b];
        if (!pts.length) continue;
        ctx.strokeStyle = `rgba(255,78,26,${accentAlpha[b]})`;
        ctx.lineWidth = 1.25;
        ctx.beginPath();
        for (let k = 0; k < pts.length; k += 4) {
          ctx.moveTo(pts[k], pts[k + 1]);
          ctx.lineTo(pts[k + 2], pts[k + 3]);
        }
        ctx.stroke();
      }

      if (state.build > 0.12) {
        const core = project({ x: 0, y: 0, z: 0 }, cosY, sinY, cosT, sinT, cx, cy, unit);
        ctx.fillStyle = 'rgba(255,78,26,.85)';
        ctx.beginPath();
        ctx.arc(core.x, core.y, 2.1, 0, TAU);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,78,26,.22)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(core.x, core.y, 6.5, 0, TAU);
        ctx.stroke();
      }

      if (state.build > 0.55) {
        const colors = ['#FF4E1A', '#74C7EC', '#ECE7DE'];
        for (let k = 0; k < 3; k += 1) {
          const a = state.time * 0.28 + (k / 3) * TAU;
          const p = project(
            { x: Math.cos(a) * 1.95, y: 0, z: Math.sin(a) * 1.95 },
            cosY, sinY, cosT, sinT, cx, cy, unit
          );
          ctx.globalAlpha = p.z < 0 ? 0.85 : 0.22;
          ctx.fillStyle = colors[k];
          ctx.beginPath();
          ctx.arc(p.x, p.y, clamp(1.4 * p.s, 1, 2.6), 0, TAU);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
      }
    }

    function updateHud(force) {
      const now = performance.now();
      if (!force && now - state.hudAt < 100) return;
      state.hudAt = now;

      const deg = Math.round((((state.yaw * 180) / Math.PI) % 360 + 360) % 360);
      if (angleEl) angleEl.textContent = `yaw ${String(deg).padStart(3, '0')}°`;
      if (statusEl && state.building) {
        statusEl.textContent = `constructing ${String(Math.round(state.build * 100)).padStart(2, '0')}%`;
      }
    }

    function loop(now) {
      const dt = state.last ? Math.min(0.05, (now - state.last) / 1000) : 0;
      state.last = now;
      state.time += dt;

      if (state.building) {
        const t = clamp((now - state.buildStart) / 1350, 0, 1);
        state.build = t;
        state.yaw = -1.3 + 0.78 * easeOutCubic(t);
        state.tilt = 0.52 + 0.1 * easeOutCubic(t);
        if (t >= 1) {
          state.building = false;
          state.build = 1;
          state.auto = true;
          state.lastDrag = performance.now();
          if (statusEl) statusEl.textContent = '360° live';
          if (state.resolveBuild) {
            const resolve = state.resolveBuild;
            state.resolveBuild = null;
            resolve();
          }
        }
      } else if (state.auto && !state.paused && now - state.lastDrag > 1500) {
        state.yaw += dt * 0.2;
      }

      if (state.visible) draw();
      updateHud();
      state.raf = requestAnimationFrame(loop);
    }

    function resize() {
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      state.w = rect.width;
      state.h = rect.height;
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw();
    }

    if ('ResizeObserver' in window) {
      new ResizeObserver(resize).observe(stage);
    } else {
      window.addEventListener('resize', resize);
    }

    resize();
    if (statusEl) statusEl.textContent = 'standby';
    if (angleEl) angleEl.textContent = '—';

    return {
      start() {
        if (state.started) return Promise.resolve();
        state.started = true;
        state.building = true;
        state.build = 0;
        state.buildStart = performance.now();
        state.yaw = -1.3;
        state.tilt = 0.52;
        state.auto = false;
        if (statusEl) statusEl.textContent = 'constructing 00%';
        if (angleEl) angleEl.textContent = 'yaw 000°';
        draw();
        state.raf = requestAnimationFrame(loop);

        if ('IntersectionObserver' in window) {
          new IntersectionObserver(
            ([entry]) => {
              state.visible = entry.isIntersecting;
            },
            { threshold: 0.01 }
          ).observe(stage);
        }

        return new Promise((resolve) => {
          state.resolveBuild = resolve;
        });
      },

      pauseAuto() {
        state.auto = false;
        state.paused = true;
        state.lastDrag = performance.now();
      },

      resumeAuto() {
        state.paused = false;
        state.auto = true;
        state.lastDrag = performance.now();
      },

      nudge(dx, dy) {
        state.paused = true;
        state.auto = false;
        state.yaw += dx * 0.0075;
        state.tilt = clamp(state.tilt + dy * 0.005, 0.3, 1.25);
        state.lastDrag = performance.now();
      },

      enableInteraction() {
        if (state.interactive) return;
        state.interactive = true;

        let dragging = false;
        let lastX = 0;
        let lastY = 0;

        stage.addEventListener('pointerdown', (event) => {
          if (!stage.classList.contains('is-live')) return;
          dragging = true;
          lastX = event.clientX;
          lastY = event.clientY;
          this.pauseAuto();
          stage.setPointerCapture?.(event.pointerId);
          if (event.pointerType === 'mouse') event.preventDefault();
        });

        stage.addEventListener('pointermove', (event) => {
          if (!dragging) return;
          const dx = event.clientX - lastX;
          const dy = event.clientY - lastY;
          lastX = event.clientX;
          lastY = event.clientY;
          this.nudge(dx, dy);
        });

        stage.addEventListener('pointerenter', (event) => {
          if (event.pointerType === 'mouse') this.pauseAuto();
        });

        const end = (event) => {
          if (!dragging) return;
          dragging = false;
          this.resumeAuto();
          try {
            stage.releasePointerCapture?.(event.pointerId);
          } catch (e) {
            /* ignore */
          }
        };

        stage.addEventListener('pointerup', end);
        stage.addEventListener('pointercancel', end);
        stage.addEventListener('pointerleave', end);
        stage.addEventListener('pointerleave', (event) => {
          if (event.pointerType === 'mouse' && !dragging) this.resumeAuto();
        });
      },
    };
  }

  async function volumeTour(stage, volume) {
    const rect = stage.getBoundingClientRect();
    if (!rect.width) return;

    const cursor = new Cursor('#74C7EC', 4);
    cursor.setLabel('orbit');
    cursor.spawnAtArt(stage);
    await wait(260);

    const scrollX = window.scrollX;
    const scrollY = window.scrollY;
    const y = rect.top + scrollY + rect.height * 0.54;
    const x0 = rect.left + scrollX + rect.width * 0.3;
    const x1 = rect.left + scrollX + rect.width * 0.73;

    await cursor.moveTo(x0, y, 520);
    cursor.setLabel('rotate');
    cursor.press();
    await wait(140);
    cursor.grab();
    volume.pauseAuto();

    let lastX = x0;
    let lastY = y;
    await runAnim(
      1150,
      (e) => {
        const x = x0 + (x1 - x0) * e;
        const yy = y + Math.sin(e * Math.PI) * -16;
        cursor.setPos(x, yy);
        volume.nudge(x - lastX, yy - lastY);
        lastX = x;
        lastY = yy;
      },
      (t) => t
    );

    cursor.release();
    await wait(200);

    const x2 = x1 - 24;
    const y2 = y - 66;
    await cursor.moveTo(x2, y2, 320);
    cursor.press();
    await wait(140);
    cursor.grab();
    volume.pauseAuto();

    let lastY2 = y2;
    await runAnim(
      650,
      (e) => {
        const yy = y2 + 74 * e;
        cursor.setPos(x2, yy);
        volume.nudge(0, yy - lastY2);
        lastY2 = yy;
      },
      (t) => t
    );

    cursor.release();
    await wait(200);

    const x3 = x2 - 130;
    const y3 = y2 + 74;
    await cursor.moveTo(x2, y3, 220);
    cursor.press();
    await wait(130);
    cursor.grab();
    volume.pauseAuto();

    let lastX3 = x2;
    await runAnim(
      580,
      (e) => {
        const x = x2 + (x3 - x2) * e;
        cursor.setPos(x, y3);
        volume.nudge(x - lastX3, 0);
        lastX3 = x;
      },
      (t) => t
    );

    cursor.release();
    await wait(320);
    await cursor.leave();
  }

  async function runVolume(stage, volume) {
    await volume.start();
    await wait(260);
    await volumeTour(stage, volume);
    stage.classList.add('is-live');
    volume.enableInteraction();
    volume.resumeAuto();
  }

  function armVolume(stage) {
    if (stage.dataset.armed) return;
    stage.dataset.armed = '1';
    stage.classList.add('is-armed');

    const volume = createVolume(stage);
    if (!volume) {
      stage.classList.remove('is-armed');
      return;
    }

    const trigger = () => {
      if (stage.dataset.started) return;
      stage.dataset.started = '1';
      runVolume(stage, volume);
    };

    if (!('IntersectionObserver' in window)) {
      trigger();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          observer.disconnect();
          trigger();
        });
      },
      { threshold: 0.35 }
    );

    observer.observe(stage);
  }

  /* ---------------------------------------------------------
     Build one target with one cursor
     --------------------------------------------------------- */

  async function buildTarget(cursor, el) {
    const type = el.dataset.build;
    cursor.setLabel(el.dataset.label || LABELS[type] || 'build');

    const rect = el.getBoundingClientRect();
    const pad = 5;

    if (rect.width < 4 || rect.height < 4) {
      el.classList.add('built');
      return;
    }

    const x0 = rect.left + window.scrollX - pad;
    const y0 = rect.top + window.scrollY - pad;
    const x1 = rect.left + window.scrollX + rect.width + pad;
    const y1 = rect.top + window.scrollY + rect.height + pad;

    await cursor.moveTo(x0 - rand(18, 44), y0 - rand(14, 36));
    cursor.press();
    await wait(70);
    await cursor.dragTo(x0, y0, x1, y1);
    cursor.endMarquee();

    if (type === 'type') {
      const targetRect = el.getBoundingClientRect();
      await cursor.moveTo(
        targetRect.left + window.scrollX + 2,
        targetRect.top + window.scrollY + Math.min(20, targetRect.height * 0.5),
        240
      );
      cursor.setLabel('type');
      await cursor.type(el);
    } else {
      el.classList.add('built');
      startCounters(el);

      if (type === 'card') {
        const art = el.querySelector('.project__art');
        if (art) armArt(art);

        const stage3d = el.querySelector('[data-3d]');
        if (stage3d) armVolume(stage3d);

        const title = el.querySelector('.type-title');
        if (title) {
          await wait(230);
          const titleRect = title.getBoundingClientRect();
          await cursor.moveTo(
            titleRect.left + window.scrollX + 4,
            titleRect.top + window.scrollY + Math.min(16, titleRect.height * 0.55),
            260
          );
          cursor.setLabel('type');
          await cursor.type(title);
        } else {
          await wait(420);
        }
      } else {
        await wait(300);
      }
    }

    await wait(60);
  }

  /* ---------------------------------------------------------
     Build one section with a team of cursors
     --------------------------------------------------------- */

  async function buildSection(section) {
    if (section.dataset.state) return;

    section.dataset.state = 'building';
    document.body.classList.add('is-live');

    const targets = $$('[data-build]', section).sort((a, b) => {
      const pa = Number.parseInt(a.dataset.priority ?? '50', 10);
      const pb = Number.parseInt(b.dataset.priority ?? '50', 10);
      if (pa !== pb) return pa - pb;
      return a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
    });

    if (!targets.length) {
      section.dataset.state = 'built';
      return;
    }

    let count = Math.min(Number.parseInt(section.dataset.cursors || '3', 10), targets.length, 6);
    if (window.innerWidth < 720) count = Math.min(count, 3);

    const cursors = Array.from({ length: count }, (_, i) => new Cursor(PALETTE[i % PALETTE.length], i));
    const queues = Array.from({ length: count }, () => []);
    targets.forEach((target, i) => queues[i % count].push(target));

    try {
      await Promise.allSettled(
        queues.map(async (queue, i) => {
          const cursor = cursors[i];
          await wait(i * 90);
          cursor.spawn();

          for (const target of queue) {
            if (!target.isConnected) continue;
            await buildTarget(cursor, target);
          }

          await cursor.leave();
        })
      );
    } finally {
      section.querySelectorAll('[data-build]').forEach((el) => {
        el.classList.add('built', 'is-done');
        el.querySelectorAll('.ch').forEach((ch) => ch.classList.add('on'));
      });
      section.querySelectorAll('.project__art').forEach((art) => armArt(art));
      section.querySelectorAll('[data-3d]').forEach((stage) => armVolume(stage));
      section.dataset.state = 'built';
    }
  }

  /* ---------------------------------------------------------
     Scroll triggers
     --------------------------------------------------------- */

  function startObservers() {
    if (started) return;
    started = true;

    const hero = $('[data-section="hero"]');
    if (hero) buildSection(hero);

    if (!('IntersectionObserver' in window)) {
      $$('[data-section]').forEach((section) => buildSection(section));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          observer.unobserve(entry.target);
          buildSection(entry.target);
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.01 }
    );

    $$('[data-section]').forEach((section) => {
      if (section.dataset.section !== 'hero') observer.observe(section);
    });

    let ticking = false;
    const catchUp = () => {
      ticking = false;
      const limit = window.innerHeight * 0.92;
      $$('[data-section]').forEach((section) => {
        if (section.dataset.state) return;
        if (section.getBoundingClientRect().top < limit) buildSection(section);
      });
    };

    window.addEventListener(
      'scroll',
      () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(catchUp);
      },
      { passive: true }
    );
    catchUp();
  }

  /* ---------------------------------------------------------
     Case studies
     --------------------------------------------------------- */

  function setupCases() {
    const dialog = $('#case-dialog');
    if (!dialog) return;

    const els = {
      index: $('#case-index'),
      kicker: $('#case-kicker-index'),
      title: $('#case-title'),
      summary: $('#case-summary'),
      meta: $('#case-meta'),
      body: $('#case-body'),
      result: $('#case-result'),
      scroll: $('#case-scroll'),
      next: $('#case-next'),
      close: $('#case-close'),
      sheet: dialog.querySelector('.case__sheet'),
    };

    let current = null;
    let lastFocus = null;
    let isOpen = false;

    function render(key) {
      const data = CASES[key];
      if (!data) return;
      current = key;

      if (els.index) els.index.textContent = data.index;
      if (els.kicker) els.kicker.textContent = data.index;
      if (els.title) els.title.textContent = data.title;
      if (els.summary) els.summary.textContent = data.summary;
      if (els.meta) {
        els.meta.innerHTML = data.meta
          .map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`)
          .join('');
      }
      if (els.body) {
        els.body.innerHTML = data.body
          .map(([k, v]) => `<section><h3>${k}</h3><p>${v}</p></section>`)
          .join('');
      }
      if (els.result) els.result.textContent = data.result;
      if (els.next) {
        const nextIndex = (CASE_ORDER.indexOf(key) + 1) % CASE_ORDER.length;
        const nextCase = CASES[CASE_ORDER[nextIndex]];
        els.next.innerHTML = `Next: ${nextCase.title} <span aria-hidden="true">→</span>`;
      }
      if (els.scroll) els.scroll.scrollTop = 0;
    }

    function open(key) {
      if (!CASES[key]) return;
      lastFocus = document.activeElement;
      render(key);

      if (!dialog.open) {
        if (typeof dialog.showModal === 'function') dialog.showModal();
        else dialog.setAttribute('open', '');
      }

      isOpen = true;
      document.documentElement.classList.add('has-case');
      setTimeout(() => {
        try {
          if (els.sheet) els.sheet.focus();
          else els.close.focus();
        } catch (e) {
          /* ignore */
        }
      }, 30);
    }

    function close() {
      if (!isOpen) return;
      isOpen = false;
      if (typeof dialog.close === 'function' && dialog.open) dialog.close();
      else dialog.removeAttribute('open');
      document.documentElement.classList.remove('has-case');
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }

    function next() {
      if (!current) return;
      const index = CASE_ORDER.indexOf(current);
      render(CASE_ORDER[(index + 1) % CASE_ORDER.length]);
    }

    $$('[data-case]').forEach((button) => {
      button.addEventListener('click', () => open(button.dataset.case));
    });

    if (els.close) els.close.addEventListener('click', close);
    if (els.next) els.next.addEventListener('click', next);

    dialog.addEventListener('close', () => {
      isOpen = false;
      document.documentElement.classList.remove('has-case');
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    });

    dialog.addEventListener('click', (event) => {
      if (event.target === dialog) close();
    });
  }

  /* ---------------------------------------------------------
     Seams: turn the page into its own working drawing.
     --------------------------------------------------------- */

  function setupSeams() {
    const toggle = $('#seams-toggle');
    const layer = $('#seams-layer');
    if (!toggle || !layer) return;

    const targets = [
      { sel: '.hero__title', label: 'H1 / DISPLAY' },
      { sel: '.hero__grid', label: 'HERO / GRID' },
      { sel: '#work .section__title', label: '01 / WORK' },
      { sel: '.projects', label: 'SEVEN PROJECTS' },
      { sel: '#about .section__title', label: '02 / ABOUT' },
      { sel: '.stats', label: 'DATA / STRIP' },
      { sel: '#experience .section__title', label: '03 / EXPERIENCE' },
      { sel: '#writing .section__title', label: '04 / WRITING' },
      { sel: '#quotes .section__title', label: '05 / KIND WORDS' },
      { sel: '.contact__cta', label: '06 / CONTACT' },
    ];

    let enabled = false;
    let resizeRaf = 0;
    const mobileSeams = window.matchMedia('(max-width: 720px)');

    function boxFor(el) {
      const rect = el.getBoundingClientRect();
      if (!rect.width || !rect.height) return null;
      return {
        left: rect.left + window.scrollX,
        top: rect.top + window.scrollY,
        width: rect.width,
        height: rect.height,
      };
    }

    function build() {
      layer.innerHTML = '';
      if (!enabled) return;

      const fragment = document.createDocumentFragment();

      targets.forEach(({ sel, label }) => {
        const el = document.querySelector(sel);
        if (!el) return;

        const box = boxFor(el);
        if (!box) return;

        const seam = document.createElement('div');
        seam.className = 'seam';
        seam.style.left = `${box.left - 3}px`;
        seam.style.top = `${box.top - 3}px`;
        seam.style.width = `${box.width + 6}px`;
        seam.style.height = `${box.height + 6}px`;

        const dot = document.createElement('span');
        dot.className = 'seam__dot';

        const tag = document.createElement('span');
        tag.className = 'seam__label';

        let detail = `${Math.round(box.width)} × ${Math.round(box.height)}`;
        if (sel === '.hero__title' || sel.endsWith('.section__title') || sel === '.contact__cta') {
          const cs = getComputedStyle(el);
          const family = cs.fontFamily.split(',')[0].replace(/["']/g, '');
          const size = Math.round(Number.parseFloat(cs.fontSize));
          detail += ` · ${family} ${size}`;
        }

        tag.innerHTML = `<b>${label}</b><br>${detail}`;
        seam.append(dot, tag);
        fragment.appendChild(seam);
      });

      layer.appendChild(fragment);
    }

    function setEnabled(nextState) {
      enabled = nextState;
      document.documentElement.classList.toggle('seams', enabled);
      toggle.setAttribute('aria-pressed', String(enabled));
      build();
    }

    toggle.addEventListener('click', () => setEnabled(!enabled));

    window.addEventListener('keydown', (event) => {
      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) return;
      if (event.key.toLowerCase() !== 's') return;
      if (mobileSeams.matches) return;
      const target = event.target;
      if (target && target.closest && target.closest('input, textarea, select, [contenteditable]')) return;
      if (document.querySelector('#case-dialog[open]')) return;
      setEnabled(!enabled);
    });

    const handleSeamsBreakpoint = (event) => {
      if (event.matches && enabled) setEnabled(false);
    };
    if (mobileSeams.addEventListener) mobileSeams.addEventListener('change', handleSeamsBreakpoint);
    else if (mobileSeams.addListener) mobileSeams.addListener(handleSeamsBreakpoint);

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        if (enabled) build();
      });
    }

    window.addEventListener('resize', () => {
      if (!enabled || resizeRaf) return;
      resizeRaf = requestAnimationFrame(() => {
        resizeRaf = 0;
        build();
      });
    });
  }

  /* ---------------------------------------------------------
     Boot: a beat of pure black, then work begins.
     --------------------------------------------------------- */

  async function boot() {
    const fontsReady = document.fonts ? document.fonts.ready : Promise.resolve();
    await Promise.race([fontsReady, wait(1300)]);
    await wait(480);
    startObservers();
  }

  boot();
})();
