const profileLinks = [
  {
    id: "qq",
    label: "QQ",
    value: "3232612893",
    note: "QQ 号",
    icon: "message-circle",
    accent: "#70d7ff",
    action: "copy",
    command: "copy qq",
    qr: "assets/qq-qr.jpg",
    qrText: "扫码添加 QQ 好友",
  },
  {
    id: "wechat",
    label: "微信",
    value: "krkreewcr",
    note: "WeChat ID",
    icon: "scan-line",
    accent: "#7cffb2",
    action: "copy",
    command: "copy wechat",
    qr: "assets/wechat-qr.jpg",
    qrText: "扫码添加微信好友",
  },
  {
    id: "bilibili",
    label: "Bilibili",
    value: "https://space.bilibili.com/107947700",
    display: "space.bilibili.com/107947700",
    note: "视频主页",
    icon: "square-play",
    accent: "#ff6ad5",
    action: "link",
    command: "open bilibili",
  },
  {
    id: "bangumi",
    label: "Bangumi",
    value: "https://bangumi.tv/user/536096",
    display: "bangumi.tv/user/536096",
    note: "番组记录",
    icon: "star",
    accent: "#ffd166",
    action: "link",
    command: "open bangumi",
  },
];

const themeNames = {
  code: "CODE",
  aurora: "AURORA",
  minimal: "MINIMAL",
};

const grid = document.querySelector("#contactGrid");
const toast = document.querySelector("#toast");
const terminal = document.querySelector("#terminalOutput");
const commandRow = document.querySelector("#commandRow");
const modeLabel = document.querySelector("#modeLabel");
const avatarButton = document.querySelector("#avatarButton");
const qrModal = document.querySelector("#qrModal");
const qrImage = document.querySelector("#qrImage");
const qrTitle = document.querySelector("#qrTitle");
const qrText = document.querySelector("#qrText");
const qrClose = document.querySelector("#qrClose");
const pointer = { x: window.innerWidth / 2, y: window.innerHeight / 2, active: false };

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("is-visible");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => {
    toast.classList.remove("is-visible");
  }, 1800);
}

function createIcon(name) {
  const icon = document.createElement("i");
  icon.setAttribute("data-lucide", name);
  icon.setAttribute("aria-hidden", "true");
  return icon;
}

function typeTerminal(lines) {
  const text = lines.join("\n");
  terminal.textContent = "";
  window.clearInterval(typeTerminal.timer);

  let index = 0;
  typeTerminal.timer = window.setInterval(() => {
    terminal.textContent = text.slice(0, index);
    index += 1;
    if (index > text.length) {
      window.clearInterval(typeTerminal.timer);
      terminal.textContent = text;
    }
  }, 10);
}

function setTerminalFor(item, verb = "selected") {
  const command = item ? item.command : "whoami";
  const value = item ? item.value : "KRKREE";

  typeTerminal([
    `> ${command}`,
    `status: ${verb}`,
    `target: ${item ? item.label : "profile"}`,
    `value: ${value}`,
    "signal: ready",
  ]);
}

async function copyValue(item) {
  try {
    await navigator.clipboard.writeText(item.value);
    showToast(`${item.label} 已复制`);
    setTerminalFor(item, "copied");
  } catch {
    showToast(`${item.label}: ${item.value}`);
    setTerminalFor(item, "fallback");
  }
}

function addRipple(target, event) {
  const rect = target.getBoundingClientRect();
  const ripple = document.createElement("span");
  ripple.className = "ripple";
  ripple.style.left = `${event.clientX - rect.left}px`;
  ripple.style.top = `${event.clientY - rect.top}px`;
  target.append(ripple);
  ripple.addEventListener("animationend", () => ripple.remove(), { once: true });
}

function openQr(item) {
  qrTitle.textContent = `${item.label} 二维码`;
  qrImage.src = item.qr;
  qrImage.alt = item.qrText;
  qrText.textContent = item.qrText;
  qrModal.classList.add("is-visible");
  qrModal.setAttribute("aria-hidden", "false");
  setTerminalFor(item, "qr-ready");
}

function closeQr() {
  qrModal.classList.remove("is-visible");
  qrModal.setAttribute("aria-hidden", "true");
}

function renderLinks() {
  const fragment = document.createDocumentFragment();

  profileLinks.forEach((item, index) => {
    const card = document.createElement("article");
    card.className = "link-card";
    card.style.setProperty("--card-accent", item.accent);
    card.style.animationDelay = `${index * 80}ms`;
    card.dataset.linkId = item.id;

    const content = document.createElement("div");
    content.className = "card-content";

    const top = document.createElement("div");
    top.className = "card-top";

    const heading = document.createElement("div");
    const kicker = document.createElement("p");
    kicker.className = "card-kicker";
    kicker.textContent = item.note;

    const title = document.createElement("h2");
    title.className = "card-title";
    title.textContent = item.label;

    heading.append(kicker, title);

    const iconBox = document.createElement("div");
    iconBox.className = "icon-box";
    iconBox.append(createIcon(item.icon));
    top.append(heading, iconBox);

    const bottom = document.createElement("div");
    const value = document.createElement("p");
    value.className = "card-value";
    value.textContent = item.display || item.value;

    const actions = document.createElement("div");
    actions.className = "actions";
    actions.style.setProperty("--action-count", item.qr ? 2 : 1);

    const action =
      item.action === "link" ? document.createElement("a") : document.createElement("button");
    action.className = "action";

    if (item.action === "link") {
      action.href = item.value;
      action.target = "_blank";
      action.rel = "noreferrer";
      action.append(createIcon("external-link"), document.createTextNode("打开"));
      action.addEventListener("click", () => setTerminalFor(item, "opening"));
    } else {
      action.type = "button";
      action.append(createIcon("copy"), document.createTextNode("复制"));
      action.addEventListener("click", () => copyValue(item));
    }

    actions.append(action);

    if (item.qr) {
      const qrButton = document.createElement("button");
      qrButton.className = "action";
      qrButton.type = "button";
      qrButton.append(createIcon("qr-code"), document.createTextNode("扫码"));
      qrButton.addEventListener("click", () => openQr(item));
      actions.append(qrButton);
    }

    card.addEventListener("pointerenter", () => setTerminalFor(item));
    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;
      card.style.setProperty("--px", `${x * 100}%`);
      card.style.setProperty("--py", `${y * 100}%`);
      card.style.setProperty("--rx", `${(y - 0.5) * -8}deg`);
      card.style.setProperty("--ry", `${(x - 0.5) * 10}deg`);
    });

    card.addEventListener("pointerleave", () => {
      card.style.setProperty("--rx", "0deg");
      card.style.setProperty("--ry", "0deg");
    });

    card.addEventListener("pointerdown", (event) => addRipple(card, event));

    bottom.append(value, actions);
    content.append(top, bottom);
    card.append(content);
    fragment.append(card);
  });

  grid.append(fragment);
}

function renderCommands() {
  profileLinks.forEach((item) => {
    const button = document.createElement("button");
    button.className = "command-button";
    button.type = "button";
    button.textContent = item.command;
    button.addEventListener("click", () => {
      setTerminalFor(item, item.action === "copy" ? "copied" : "ready");
      if (item.action === "copy") copyValue(item);
      if (item.action === "link") window.open(item.value, "_blank", "noreferrer");
    });
    commandRow.append(button);
  });
}

function bindThemeButtons() {
  document.querySelectorAll("[data-theme-choice]").forEach((button) => {
    button.addEventListener("click", () => {
      const theme = button.dataset.themeChoice;
      document.body.dataset.theme = theme;
      modeLabel.textContent = themeNames[theme];
      document.querySelectorAll("[data-theme-choice]").forEach((item) => {
        item.classList.toggle("is-active", item === button);
      });
      showToast(`${themeNames[theme]} 模式`);
      setTerminalFor(null, `theme:${theme}`);
      triggerGlitch();
    });
  });
}

function bindPointer() {
  window.addEventListener("pointermove", (event) => {
    pointer.x = event.clientX;
    pointer.y = event.clientY;
    pointer.active = true;
    document.body.classList.add("has-pointer");
    document.body.style.setProperty("--mx", `${event.clientX}px`);
    document.body.style.setProperty("--my", `${event.clientY}px`);
  });

  window.addEventListener("pointerdown", () => document.body.classList.add("is-pressing"));
  window.addEventListener("pointerup", () => document.body.classList.remove("is-pressing"));
}

function triggerGlitch() {
  document.body.classList.remove("is-glitching");
  window.requestAnimationFrame(() => {
    document.body.classList.add("is-glitching");
    window.setTimeout(() => document.body.classList.remove("is-glitching"), 520);
  });
}

function bindAvatar() {
  avatarButton.addEventListener("click", (event) => {
    addRipple(avatarButton, event);
    showToast("pong");
    typeTerminal([
      "> ping krkree.local",
      "64 bytes from KRKREE",
      "latency: 7ms",
      "mood: interactive",
      "signal: online",
    ]);
    triggerGlitch();
  });
}

function bindQrModal() {
  qrClose.addEventListener("click", closeQr);
  qrModal.addEventListener("click", (event) => {
    if (event.target === qrModal) closeQr();
  });
  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeQr();
  });
}

function runNetworkField() {
  const canvas = document.querySelector(".network-field");
  const context = canvas.getContext("2d");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) return;

  let width = 0;
  let height = 0;
  let nodes = [];

  function themePalette() {
    const styles = getComputedStyle(document.body);
    return [
      styles.getPropertyValue("--accent").trim(),
      styles.getPropertyValue("--accent-2").trim(),
      styles.getPropertyValue("--accent-3").trim(),
    ];
  }

  function resize() {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * ratio);
    canvas.height = Math.floor(height * ratio);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);

    const count = Math.max(48, Math.min(110, Math.floor(width / 16)));
    nodes = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.42,
      vy: (Math.random() - 0.5) * 0.42,
      size: 1 + Math.random() * 2.2,
    }));
  }

  function draw() {
    const palette = themePalette();
    context.clearRect(0, 0, width, height);

    nodes.forEach((node, index) => {
      const dx = pointer.x - node.x;
      const dy = pointer.y - node.y;
      const distance = Math.hypot(dx, dy);

      if (pointer.active && distance < 190) {
        node.vx -= dx * 0.000018;
        node.vy -= dy * 0.000018;
      }

      node.x += node.vx;
      node.y += node.vy;
      node.vx *= 0.992;
      node.vy *= 0.992;

      if (node.x < -20) node.x = width + 20;
      if (node.x > width + 20) node.x = -20;
      if (node.y < -20) node.y = height + 20;
      if (node.y > height + 20) node.y = -20;

      context.beginPath();
      context.fillStyle = palette[index % palette.length];
      context.globalAlpha = 0.58;
      context.shadowBlur = 12;
      context.shadowColor = palette[index % palette.length];
      context.arc(node.x, node.y, node.size, 0, Math.PI * 2);
      context.fill();
    });

    context.shadowBlur = 0;

    for (let i = 0; i < nodes.length; i += 1) {
      for (let j = i + 1; j < nodes.length; j += 1) {
        const a = nodes[i];
        const b = nodes[j];
        const distance = Math.hypot(a.x - b.x, a.y - b.y);
        if (distance < 112) {
          context.globalAlpha = (1 - distance / 112) * 0.22;
          context.strokeStyle = palette[(i + j) % palette.length];
          context.beginPath();
          context.moveTo(a.x, a.y);
          context.lineTo(b.x, b.y);
          context.stroke();
        }
      }
    }

    if (pointer.active) {
      nodes.forEach((node, index) => {
        const distance = Math.hypot(pointer.x - node.x, pointer.y - node.y);
        if (distance < 170) {
          context.globalAlpha = (1 - distance / 170) * 0.5;
          context.strokeStyle = palette[index % palette.length];
          context.beginPath();
          context.moveTo(pointer.x, pointer.y);
          context.lineTo(node.x, node.y);
          context.stroke();
        }
      });
    }

    context.globalAlpha = 1;
    requestAnimationFrame(draw);
  }

  resize();
  window.addEventListener("resize", resize);
  requestAnimationFrame(draw);
}

renderLinks();
renderCommands();
bindThemeButtons();
bindPointer();
bindAvatar();
bindQrModal();
runNetworkField();
setTerminalFor(null);

window.addEventListener("load", () => {
  if (window.lucide) window.lucide.createIcons();
});
