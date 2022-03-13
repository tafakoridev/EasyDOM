let is_running = null;
let queue = [];
function $(selector) {
  const el = document.querySelector(selector);

  function queueFunc() {
    while (queue.length) {
      let func = queue.shift();
      setTimeout(() => {
        func.call.apply(null, func.params);
      }, 100);
    }
  }

  function isRunning(func, arguments = {}, callback) {
    if (is_running) {
      queue.push({ call: func, params: Object.values(arguments) });
    } else {
      if (arguments.sync) arguments.sync.call(arguments.sync.timer);
      callback();
    }
  }

  el.properties = {
    // (time( ms ))
    hide: function (time, sync) {
      isRunning(el.hide, { time, sync }, () => {
        is_running = "hide";
        if (time) {
          const intervalRate = time / 10;
          el.style.opacity = 1;
          const interval = setInterval(() => {
            if (el.style.opacity > 0)
              el.style.opacity = parseFloat(el.style.opacity) - 0.1;
            else {
              el.style.display = "none";
              clearInterval(interval);
              is_running = null;
              queueFunc();
            }
          }, intervalRate);
        } else {
          el.style.display = "none";
          is_running = null;
          queueFunc();
        }
      });
    },

    // (displayType, time( ms ))
    show: function (type, time, sync) {
      isRunning(el.show, { type, time, sync }, () => {
        is_running = "show";
        if (time) {
          const intervalRate = time / 10;
          el.style.opacity = 0;
          el.style.display = type ?? "block";
          const interval = setInterval(() => {
            if (el.style.opacity < 1)
              el.style.opacity = parseFloat(el.style.opacity) + 0.1;
            else {
              el.style.display = type ?? "block";
              clearInterval(interval);
              is_running = null;
              queueFunc();
            }
          }, intervalRate);
        } else {
          el.style.display = type ?? "block";
          el.style.opacity = 1;
          is_running = null;
          queueFunc();
        }
      });
    },

    moveTo: function (dir, value, time, sync) {
      isRunning(el.moveTo, { dir, value, time, sync }, () => {
        is_running = "moveTo";
        let direction = {
          vector: null,
          sign: null,
        };
        if (dir)
          switch (dir) {
            case "left":
              direction = {
                vector: "X",
                sign: -1,
              };
              break;
            case "right":
              direction = {
                vector: "X",
                sign: 1,
              };
              break;

            case "top":
              direction = {
                vector: "Y",
                sign: -1,
              };
              break;

            case "bottom":
              direction = {
                vector: "Y",
                sign: 1,
              };
              break;
          }

        const matrix = new DOMMatrixReadOnly(el.style.transform);
        let tX = matrix.m41;
        let tY = matrix.m42;

        if (time) {
          const moveRate = value / time;
          let gauging = 0;
          const interval = setInterval(() => {
            if (gauging <= value) {
              el.style.transform = `translateX(${
                direction.vector == "X" ? tX + direction.sign * gauging : tX
              }px) translateY(${
                direction.vector == "Y" ? tY + direction.sign * gauging : tY
              }px)`;
              gauging += moveRate * 10;
            } else {
              clearInterval(interval);
              is_running = null;
              queueFunc();
            }
          }, moveRate);
        } else {
          el.style.transform = `translateX(${
            direction.vector == "X" ? tX + direction.sign * value : tX
          }px) translateY(${
            direction.vector == "Y" ? tY + direction.sign * value : tY
          }px)`;
          is_running = null;
          queueFunc();
        }
      });
    },
  };
  Object.keys(el.properties).map((__proto__) => {
    el.__proto__[__proto__] = el.properties[__proto__];
  });
  delete el.properties;
  return el;
}
