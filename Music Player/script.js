document.addEventListener("DOMContentLoaded", () => {
  // --- DOM Elements ---
  const getEl = (id) => document.getElementById(id);
  const player = document.querySelector(".player");
  const songTitle = getEl("song-title"),
    songArtist = getEl("song-artist"),
    audio = getEl("audio");
  const playPauseBtn = getEl("play-pause-btn"),
    prevBtn = getEl("prev-btn"),
    nextBtn = getEl("next-btn");
  const seekForwardBtn = getEl("seek-forward-btn"),
    seekBackwardBtn = getEl("seek-backward-btn");
  const progressContainer = getEl("progress-container"),
    progressBar = getEl("progress-bar");
  const currentTimeEl = getEl("current-time"),
    totalDurationEl = getEl("total-duration");
  const volumeSlider = getEl("volume-slider"),
    speedControl = getEl("speed-control"),
    shuffleBtn = getEl("shuffle-btn");
  const themeToggleBtn = getEl("theme-toggle-btn");
  const uploadSection = getEl("upload-section"),
    dropZone = getEl("drop-zone"),
    fileInput = getEl("file-input");
  const splashScreen = getEl("splash-screen"),
    toastNotification = getEl("toast-notification");
  const playlistModal = getEl("playlist-modal"),
    closeModalBtn = getEl("close-modal-btn");
  const playlistListContainer = getEl("playlist-list-container"),
    songListContainer = getEl("song-list-container");
  const showAddPlaylistFormBtn = getEl("show-add-playlist-form-btn"),
    addPlaylistForm = getEl("add-playlist-form");
  const createPlaylistBtn = getEl("create-playlist-btn"),
    cancelAddPlaylistBtn = getEl("cancel-add-playlist-btn");
  const newPlaylistNameInput = getEl("new-playlist-name"),
    deletePlaylistBtn = getEl("delete-playlist-btn");
  const currentPlaylistTitleEl = getEl("current-playlist-title");
  const managePlaylistsBtn = getEl("manage-playlists-btn"),
    createNewPlaylistBtn = getEl("create-new-playlist-btn");

  // --- State ---
  let playlists = {},
    activePlaylistName = "",
    currentSongIndex = 0;
  let isPlaying = false,
    isShuffle = false,
    toastTimeout;

  // --- Core Player Functions ---
  const getActivePlaylist = () => playlists[activePlaylistName] || [];

  function loadSong(song) {
    if (!song) {
      resetPlayerUI();
      return;
    }
    songTitle.textContent = song.name;
    songArtist.textContent = song.artist || "Unknown Artist";
    audio.src = song.url;
    renderAllSongs();
  }

  function playSong() {
    if (getActivePlaylist().length === 0) return;
    isPlaying = true;
    player.classList.add("playing");
    playPauseBtn
      .querySelector("i.fas")
      .classList.replace("fa-play", "fa-pause");
    audio.play().catch((e) => console.error("Audio Playback Error:", e));
  }

  function pauseSong() {
    isPlaying = false;
    player.classList.remove("playing");
    playPauseBtn
      .querySelector("i.fas")
      .classList.replace("fa-pause", "fa-play");
    audio.pause();
  }

  function changeTrack(direction) {
    const activePlaylist = getActivePlaylist();
    if (activePlaylist.length === 0) return;
    if (isShuffle) {
      let randomIndex;
      do {
        randomIndex = Math.floor(Math.random() * activePlaylist.length);
      } while (activePlaylist.length > 1 && randomIndex === currentSongIndex);
      currentSongIndex = randomIndex;
    } else {
      currentSongIndex =
        (currentSongIndex + direction + activePlaylist.length) %
        activePlaylist.length;
    }
    loadSong(activePlaylist[currentSongIndex]);
    playSong();
  }

  // --- UI & Rendering Functions ---
  function renderAll() {
    renderPlaylistList();
    renderAllSongs();
    updatePlayerAndModalTitles();
    updateUploadUI();
  }

  function renderPlaylistList() {
    playlistListContainer.innerHTML = "";
    const playlistNames = Object.keys(playlists);
    if (playlistNames.length === 0) {
      playlistListContainer.innerHTML = "<li>No playlists yet.</li>";
    } else {
      playlistNames.forEach((name) => {
        const li = document.createElement("li");
        li.textContent = name;
        li.dataset.playlistName = name;
        if (name === activePlaylistName) li.classList.add("selected");
        playlistListContainer.appendChild(li);
      });
    }
  }

  function renderAllSongs() {
    songListContainer.innerHTML = "";
    const activePlaylist = getActivePlaylist();
    if (!activePlaylistName) {
      songListContainer.innerHTML = "<li>Select or create a playlist.</li>";
    } else if (activePlaylist.length === 0) {
      songListContainer.innerHTML = "<li>Add songs using the upload area.</li>";
    } else {
      activePlaylist.forEach((song, index) => {
        const li = document.createElement("li");
        li.dataset.index = index;
        if (index === currentSongIndex) li.classList.add("active");
        li.innerHTML = `<span>${song.name}</span><button class="delete-song-btn" data-index="${index}"><i class="fas fa-trash"></i></button>`;
        songListContainer.appendChild(li);
      });
    }
  }

  function updatePlayerAndModalTitles() {
    if (activePlaylistName) {
      currentPlaylistTitleEl.textContent = `Current: ${activePlaylistName}`;
      deletePlaylistBtn.disabled = false;
    } else {
      currentPlaylistTitleEl.textContent = "Select a Playlist";
      deletePlaylistBtn.disabled = true;
    }
  }

  function resetPlayerUI() {
    pauseSong();
    audio.src = "";
    songTitle.textContent = "Create a playlist";
    songArtist.textContent = "& add some music!";
    currentTimeEl.textContent = "0:00";
    totalDurationEl.textContent = "0:00";
    progressBar.style.width = "0%";
  }

  function updateUploadUI() {
    const hasAnyPlaylists = Object.keys(playlists).length > 0;
    uploadSection.classList.toggle("has-content", hasAnyPlaylists);
  }

  function showToast(message) {
    if (toastTimeout) clearTimeout(toastTimeout);
    toastNotification.textContent = message;
    toastNotification.classList.add("show");
    toastTimeout = setTimeout(() => {
      toastNotification.classList.remove("show");
    }, 3000);
  }

  // --- Playlist & File Management ---
  function handleFiles(files) {
    if (!activePlaylistName) {
      showToast("Please create and select a playlist first!");
      return;
    }

    const audioFiles = Array.from(files).filter((f) =>
      f.type.startsWith("audio/")
    );
    if (audioFiles.length === 0) return;

    const wasPlaylistEmpty = getActivePlaylist().length === 0;

    const songs = audioFiles.map((file) => ({
      name: file.name.replace(/\.[^/.]+$/, ""),
      url: URL.createObjectURL(file),
      artist: "Local",
    }));

    playlists[activePlaylistName].push(...songs);
    showToast(`${songs.length} song(s) added to "${activePlaylistName}"!`);
    renderAllSongs();

    if (wasPlaylistEmpty) {
      currentSongIndex = 0;
      loadSong(getActivePlaylist()[0]);
      playSong();
    }
  }
  

  function createPlaylist() {
    const name = newPlaylistNameInput.value.trim();
    if (name && !playlists[name]) {
      playlists[name] = [];
      activePlaylistName = name;
      saveStateToLocalStorage();
      renderAll();
      newPlaylistNameInput.value = "";
      addPlaylistForm.classList.add("hidden");
      showAddPlaylistFormBtn.classList.remove("hidden");
      resetPlayerUI();
    } else if (playlists[name]) {
      showToast("A playlist with this name already exists.");
    }
  }

  function deleteActivePlaylist() {
    if (
      !activePlaylistName ||
      !confirm(`Delete "${activePlaylistName}"? This cannot be undone.`)
    )
      return;
    const songWasPlaying = isPlaying;
    delete playlists[activePlaylistName];
    activePlaylistName = Object.keys(playlists)[0] || "";
    currentSongIndex = 0;
    saveStateToLocalStorage();
    renderAll();
    loadSong(getActivePlaylist()[0]);
    if (!songWasPlaying || getActivePlaylist().length === 0) pauseSong();
  }

  function openModalAndAdd() {
    playlistModal.classList.add("show-modal");
    showAddPlaylistFormBtn.classList.add("hidden");
    addPlaylistForm.classList.remove("hidden");
    newPlaylistNameInput.focus();
  }

  // --- LocalStorage ---
  const LS_KEYS = {
    playlists: "musicPlaylists_v3",
    active: "activePlaylist_v3",
    theme: "theme_v3",
  };
  function saveStateToLocalStorage() {
    localStorage.setItem(LS_KEYS.active, activePlaylistName);
  }
  

  async function loadStateFromLocalStorage() {
    activePlaylistName = localStorage.getItem(LS_KEYS.active) || "";
    playlists = {}; // Start with empty playlists
  }
  

  // --- Event Handlers & Listeners Setup ---
  function setupEventListeners() {
    playPauseBtn.addEventListener("click", () =>
      isPlaying ? pauseSong() : playSong()
    );
    nextBtn.addEventListener("click", () => changeTrack(1));
    prevBtn.addEventListener("click", () => changeTrack(-1));
    seekForwardBtn.addEventListener("click", () => (audio.currentTime += 10));
    seekBackwardBtn.addEventListener("click", () => (audio.currentTime -= 10));
    audio.addEventListener("timeupdate", (e) => {
      const { duration, currentTime } = e.srcElement;
      if (duration) {
        progressBar.style.width = `${(currentTime / duration) * 100}%`;
        totalDurationEl.textContent = new Date(duration * 1000)
          .toISOString()
          .substr(14, 5);
        currentTimeEl.textContent = new Date(currentTime * 1000)
          .toISOString()
          .substr(14, 5);
      }
    });
    audio.addEventListener("ended", () => changeTrack(1));
    progressContainer.addEventListener("click", (e) => {
      const duration = audio.duration;
      if (duration)
        audio.currentTime =
          (e.offsetX / e.currentTarget.clientWidth) * duration;
    });
    volumeSlider.addEventListener(
      "input",
      () => (audio.volume = volumeSlider.value)
    );
    speedControl.addEventListener("click", (e) => {
      if (e.target.tagName === "LI") {
        audio.playbackRate = parseFloat(e.target.dataset.speed);
        speedControl
          .querySelectorAll("li")
          .forEach((li) => li.classList.remove("active"));
        e.target.classList.add("active");
      }
    });
    shuffleBtn.addEventListener("click", () => {
      isShuffle = !isShuffle;
      shuffleBtn.classList.toggle("active", isShuffle);
    });
    themeToggleBtn.addEventListener("click", () => {
      const newTheme =
        document.body.dataset.theme === "dark" ? "light" : "dark";
      document.body.dataset.theme = newTheme;
      localStorage.setItem(LS_KEYS.theme, newTheme);
    });
    managePlaylistsBtn.addEventListener("click", () =>
      playlistModal.classList.add("show-modal")
    );
    createNewPlaylistBtn.addEventListener("click", openModalAndAdd);
    closeModalBtn.addEventListener("click", () =>
      playlistModal.classList.remove("show-modal")
    );
    showAddPlaylistFormBtn.addEventListener("click", () => openModalAndAdd());
    cancelAddPlaylistBtn.addEventListener("click", () => {
      addPlaylistForm.classList.add("hidden");
      showAddPlaylistFormBtn.classList.remove("hidden");
    });
    createPlaylistBtn.addEventListener("click", createPlaylist);
    deletePlaylistBtn.addEventListener("click", deleteActivePlaylist);
    playlistListContainer.addEventListener("click", (e) => {
      if (e.target.tagName === "LI")
        switchActivePlaylist(e.target.dataset.playlistName);
    });
    songListContainer.addEventListener("click", (e) => {
      const li = e.target.closest("li[data-index]");
      if (!li) return;
      const index = parseInt(li.dataset.index);
      if (e.target.closest(".delete-song-btn")) {
        deleteSongFromPlaylist(index);
      } else if (index !== currentSongIndex) {
        currentSongIndex = index;
        loadSong(getActivePlaylist()[index]);
        playSong();
      } else {
        isPlaying ? pauseSong() : playSong();
      }
    });
    dropZone.addEventListener("click", () => fileInput.click());
    dropZone.addEventListener("dragover", (e) => {
      e.preventDefault();
      dropZone.classList.add("dragover");
    });
    dropZone.addEventListener("dragleave", (e) =>
      dropZone.classList.remove("dragover")
    );
    dropZone.addEventListener("drop", (e) => {
      e.preventDefault();
      dropZone.classList.remove("dragover");
      handleFiles(e.dataTransfer.files);
    });
    fileInput.addEventListener("change", (e) => handleFiles(e.target.files));
  }

  // --- Initialization ---
  async function init() {
    setTimeout(() => splashScreen.classList.add("fade-out"), 1500);
    document.body.dataset.theme =
      localStorage.getItem(LS_KEYS.theme) || "light";
    await loadStateFromLocalStorage();
    renderAll();
    loadSong(getActivePlaylist()[currentSongIndex]);
    setupEventListeners();
  }

  init();
});
