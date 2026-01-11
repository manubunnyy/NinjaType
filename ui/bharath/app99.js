const W = "the be to of and a in that have it for not on with as you do at this but by from they we say or an will my one all would there what so up out if about who get which go when make can like time no just know take people into year good some could them see other than then now look only come its think also back after use two how our work first well way even want".split(' ');

let dur = 30, target, typed, timer, on, t0;
const $ = s => document.querySelector(s);
const el = {
  btns: $('#btns'),
  timer: $('#timer'),
  typing: $('#typing'),
  text: $('#text'),
  wpm: $('#wpm'),
  acc: $('#acc'),
  results: $('#results')
};

const init = () => {
  typed = '';
  on = false;
  target = gen();
  el.timer.textContent = dur;
  el.btns.classList.remove('hide');
  el.timer.classList.add('hide');
  el.typing.classList.remove('hide');
  el.results.classList.add('hide');
  render();
};

const gen = () => [...W].sort(() => Math.random() - 0.5).slice(0, 36).join(' ');

const render = () => {
  el.text.innerHTML = target.split('').map((c, i) => {
    let cls = 'char';
    if (i < typed.length) cls += typed[i] === c ? ' ok' : ' err';
    if (i === typed.length) cls += ' cur';
    return `<span class="${cls}">${c}</span>`;
  }).join('');
};

const begin = () => {
  on = true;
  t0 = Date.now();
  el.btns.classList.add('hide');
  el.timer.classList.remove('hide');
  tick();
};

const tick = () => {
  if (!on) return;
  const left = dur - ~~((Date.now() - t0) / 1000);
  el.timer.textContent = Math.max(0, left);
  if (left <= 0) return end();
  timer = setTimeout(tick, 200);
};

const end = () => {
  on = false;
  clearTimeout(timer);
  let ok = 0;
  for (let i = 0; i < typed.length && i < target.length; i++) if (typed[i] === target[i]) ok++;
  el.wpm.textContent = ~~((ok / 5) / (dur / 60));
  el.acc.textContent = typed.length ? ~~((ok / typed.length) * 100) + '%' : '0%';
  el.typing.classList.add('hide');
  el.timer.classList.add('hide');
  el.results.classList.remove('hide');
};

document.onkeydown = e => {
  if (e.key === 'Escape') return init();
  if (e.key === 'Backspace') { typed = typed.slice(0, -1); render(); return; }
  if (e.key.length !== 1) return;
  if (!on) begin();
  typed += e.key;
  render();
  if (typed.length >= target.length) end();
};

document.querySelectorAll('.time').forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll('.time').forEach(b => b.classList.remove('sel'));
    btn.classList.add('sel');
    dur = +btn.dataset.t;
    el.timer.textContent = dur;
  };
});

$('#again').onclick = init;
init();
