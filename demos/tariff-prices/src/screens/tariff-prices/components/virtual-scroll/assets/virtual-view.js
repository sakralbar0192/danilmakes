let uid = 0;

function setStyleValue(style, key, value) {
  if (style[key] !== value) {
    style[key] = value;
  }
}

export default class VirtualView {
  constructor({
    // Данные виртуального представления
    item,
    // Тип представления
    type,
    // Индекс элемента
    index,
    // Уникальный ключ виртуального представления
    key,
  }) {
    this.item = item;
    this.position = 0;
    this.styleStamp = 0;
    this.visibilityStamp = 0;
    this.style = {
      top: "0px",
      transform: "translateY(0px)",
      visibility: "visible",
      pointerEvents: null,
      willChange: "transform",
    };

    // Для предотвращения триггера системы реактивности vue при изменении данных параметров фризим объект для конфигурации
    this.raw = Object.seal({
      type,
      index,
      key,
      used: true,
      id: uid++,
    });
  }

  setPosition(position) {
    if (this.position === position) {
      return;
    }

    this.position = position;
    this.styleStamp++;
  }

  setItemState({
    item, index, key,
  }) {
    let styleChanged = false;
    const prevItem = this.item;

    if (prevItem !== item) {
      this.item = item;
      if (prevItem?.height !== item?.height || prevItem?.type !== item?.type) {
        styleChanged = true;
      }
    }

    if (item?.type != null && this.raw.type !== item.type) {
      this.raw.type = item.type;
      styleChanged = true;
    }

    if (this.raw.index !== index) {
      this.raw.index = index;
      styleChanged = true;
    }

    if (this.raw.key !== key) {
      this.raw.key = key;
      styleChanged = true;
    }

    if (styleChanged) {
      this.styleStamp++;
    }
  }

  deactivate(hiddenPosition = -9999) {
    let styleChanged = false;

    if (this.raw.used) {
      this.raw.used = false;
      this.visibilityStamp++;
      styleChanged = true;
    }

    if (this.position !== hiddenPosition) {
      this.position = hiddenPosition;
      styleChanged = true;
    }

    if (styleChanged) {
      this.styleStamp++;
    }
  }

  activate() {
    if (!this.raw.used) {
      this.raw.used = true;
      this.visibilityStamp++;
      this.styleStamp++;
    }
  }

  updateStyle(disableTransform) {
    if (disableTransform) {
      setStyleValue(this.style, "top", `${this.position}px`);
      setStyleValue(this.style, "transform", "none");
      setStyleValue(this.style, "willChange", "unset");
    } else {
      setStyleValue(this.style, "top", "0px");
      setStyleValue(this.style, "transform", `translateY(${this.position}px)`);
      setStyleValue(this.style, "willChange", "transform");
    }

    setStyleValue(this.style, "visibility", this.raw.used ? "visible" : "hidden");
    setStyleValue(this.style, "pointerEvents", this.raw.used ? null : "none");
  }

  inHalfRange(start, end) {
    return this.raw.index >= start && this.raw.index < end;
  }
}
