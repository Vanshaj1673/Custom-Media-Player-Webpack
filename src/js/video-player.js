import playIcon from '../assets/icons/play.svg';
import pauseIcon from '../assets/icons/pause.svg';
import volumeOffIcon from '../assets/icons/volume-off.svg';
import volumeOnIcon from '../assets/icons/volume-on.svg';
import fullscreenIcon from '../assets/icons/fullscreen.svg';

export function initVideoPlayer(cfg) {
  const video = document.querySelector(cfg.videoElement);
  const box = document.querySelector(cfg.container);

  if (!video || !box) {
    console.error("Missing video or container");
    return;
  }

  video.controls = false;

  const ui = document.createElement("div");
  ui.className = "vp__controls"; 

  ui.innerHTML = `
    <button class="vp__btn vp__btn--play">
      <span class="vp__icon vp__icon--play">${playIcon}</span>
      <span class="vp__icon vp__icon--pause hidden">${pauseIcon}</span>
    </button>

    <input type="range" class="vp__progress" min="0" max="100" value="0" />

    <span class="vp__time">00:00 / 00:00</span>

    <div class="vp__volume-wrapper">
      <button class="vp__btn vp__btn--mute">
        <span class="vp__icon vp__icon--volume-off">${volumeOffIcon}</span>
        <span class="vp__icon vp__icon--volume-on hidden">${volumeOnIcon}</span>
      </button>

      <input type="range" class="vp__volume" min="0" max="1" step="0.01" />
    </div>

    ${cfg.controls?.playbackSpeed !== false ? `
    <select class="vp__speed">
      <option value="0.5">0.5x</option>
      <option value="1">1x</option>
      <option value="1.25">1.25x</option>
      <option value="1.5">1.5x</option>
      <option value="2">2x</option>
    </select>
    ` : ''}

    ${cfg.controls?.fullscreen !== false ? `
    <button class="vp__btn vp__btn--fs">
      <span class="vp__icon">${fullscreenIcon}</span>
    </button>
    ` : ''}
  `;

  const overlay = document.createElement("div");
  overlay.className = "vp__overlay";
  overlay.innerHTML = `<span class="vp__icon"></span>`;
  box.appendChild(overlay);

  box.appendChild(ui);
  video.muted = true;
  video.volume = cfg.defaults?.volume || 0.8;
  video.playbackRate = cfg.defaults?.speed || 1;

  let lastVol = video.volume;
  let hideT = null;

  const playBtn = ui.querySelector(".vp__btn--play");
  const playI = playBtn.querySelector(".vp__icon--play");
  const pauseI = playBtn.querySelector(".vp__icon--pause");

  const bar = ui.querySelector(".vp__progress");
  const time = ui.querySelector(".vp__time");

  const muteBtn = ui.querySelector(".vp__btn--mute");
  const volOn = muteBtn?.querySelector(".vp__icon--volume-on");
  const volOff = muteBtn?.querySelector(".vp__icon--volume-off");
  const vol = ui.querySelector(".vp__volume");

  const speed = ui.querySelector(".vp__speed");
  const fsBtn = ui.querySelector(".vp__btn--fs");

  if (vol) vol.value = video.volume;
  if (speed) speed.value = video.playbackRate;


  function showUi() {
    ui.classList.remove("vp__controls--hide");

    if (document.fullscreenElement) {
      clearTimeout(hideT);
      return;
    }

    clearTimeout(hideT);
    hideT = setTimeout(() => {
      if (!video.paused) ui.classList.add("vp__controls--hide");
    }, 3000); 
  }

  function fmt(t) {
    if (isNaN(t)) return "00:00";
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }

  function triggerOverlay(icon) {
    overlay.querySelector(".vp__icon").innerHTML = icon;
    overlay.classList.remove("vp__overlay--active");
    void overlay.offsetWidth; 
    overlay.classList.add("vp__overlay--active");
  }

  function togglePlay() {
    if (video.paused) {
      video.play();
      triggerOverlay(playIcon);
    } else {
      video.pause();
      triggerOverlay(pauseIcon);
    }
  }

  function toggleMute() {
    if (video.muted) {
      video.muted = false;
      video.volume = lastVol;
      if (vol) vol.value = video.volume;
      if (volOff) volOff.classList.add("hidden");
      if (volOn) volOn.classList.remove("hidden");
      triggerOverlay(volumeOnIcon);
    } else {
      video.muted = true;
      if (volOn) volOn.classList.add("hidden");
      if (volOff) volOff.classList.remove("hidden");
      triggerOverlay(volumeOffIcon);
    }
  }

  function toggleFullscreen() {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      box.requestFullscreen({ navigationUI: "hide" });
    }
  }

  playBtn.addEventListener("click", togglePlay);
  video.addEventListener("click", togglePlay);

  video.addEventListener("play", () => {
    playI.classList.add("hidden");
    pauseI.classList.remove("hidden");
    showUi();
  });

  video.addEventListener("pause", () => {
    pauseI.classList.add("hidden");
    playI.classList.remove("hidden");
    ui.classList.remove("vp__controls--hide");
  });

  video.addEventListener("dblclick", toggleFullscreen);

  video.addEventListener("loadedmetadata", () => {
    time.textContent = `00:00 / ${fmt(video.duration)}`;
  });

  video.addEventListener("timeupdate", () => {
    bar.value = (video.currentTime / video.duration) * 100;
    time.textContent = `${fmt(video.currentTime)} / ${fmt(video.duration)}`;
  });

  bar.addEventListener("input", () => {
    video.currentTime = (bar.value / 100) * video.duration;
  });

  if (vol) {
    vol.addEventListener("input", () => {
      video.muted = false;
      video.volume = vol.value;
      lastVol = video.volume;

      if (volOff) volOff.classList.add("hidden");
      if (volOn) volOn.classList.remove("hidden");
    });
  }

  if (muteBtn) {
    muteBtn.addEventListener("click", toggleMute);
  }

  if (speed) {
    speed.addEventListener("change", () => {
      video.playbackRate = speed.value;
    });
  }

  if (fsBtn) {
    fsBtn.addEventListener("click", toggleFullscreen);
  }

  document.addEventListener("keydown", (e) => {
    if (document.activeElement.tagName === "INPUT" || document.activeElement.tagName === "SELECT") return;

    const key = e.key.toLowerCase();

    if (key === " " || key === "k") {
      e.preventDefault();
      togglePlay();
    } else if (key === "m") {
      toggleMute();
    } else if (key === "f") {
      toggleFullscreen();
    } else if (key === "j" || key === "arrowleft") {
      video.currentTime = Math.max(0, video.currentTime - (key === "j" ? 10 : 5));
    } else if (key === "l" || key === "arrowright") {
      video.currentTime = Math.min(video.duration, video.currentTime + (key === "l" ? 10 : 5));
    }
  });

  document.addEventListener("fullscreenchange", () => {
    ui.classList.remove("vp__controls--hide");
  });

  box.addEventListener("mousemove", showUi);
  box.addEventListener("touchstart", showUi, { passive: true });
}
