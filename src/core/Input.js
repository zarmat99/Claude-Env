export class Input {
  constructor(target = window) {
    this.keys = new Set();
    this.pressed = new Set();
    this.pointer = { x: 0, y: 0, down: false };

    target.addEventListener("keydown", event => {
      const key = normalizeKey(event.key);
      if (!this.keys.has(key)) this.pressed.add(key);
      this.keys.add(key);
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(event.key)) event.preventDefault();
    });

    target.addEventListener("keyup", event => {
      this.keys.delete(normalizeKey(event.key));
    });

    window.addEventListener("blur", () => {
      this.keys.clear();
      this.pressed.clear();
    });
  }

  down(key) {
    return this.keys.has(normalizeKey(key));
  }

  consume(key) {
    key = normalizeKey(key);
    if (!this.pressed.has(key)) return false;
    this.pressed.delete(key);
    return true;
  }

  endFrame() {
    this.pressed.clear();
  }

  axis() {
    let x = 0;
    let y = 0;
    if (this.down("a") || this.down("arrowleft")) x -= 1;
    if (this.down("d") || this.down("arrowright")) x += 1;
    if (this.down("w") || this.down("arrowup")) y -= 1;
    if (this.down("s") || this.down("arrowdown")) y += 1;
    const len = Math.hypot(x, y) || 1;
    return { x: x / len, y: y / len };
  }
}

function normalizeKey(key) {
  return String(key).toLowerCase();
}
