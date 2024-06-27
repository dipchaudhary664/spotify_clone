let currentSong = new Audio();
let songs = [];
let currfolder = [];

const playButton = document.getElementById("play");
const previous = document.getElementById("previous");
const next = document.getElementById("next");

function secondsToMinutesSeconds(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "00:00";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(remainingSeconds).padStart(2, "0");

  return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
  currfolder = folder;
  let a = await fetch(`http://127.0.0.1:3000/${folder}/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.getElementsByTagName("a");

  let songList = [];

  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(".mp3")) {
      songList.push(element.href.split(`/${folder}/`)[1]);
    }
  }
  return songList;
}

const playmusic = (track, pause = false) => {
  currentSong.src = `/${currfolder}/` + track;
  if (!pause) {
    currentSong.play();
    playButton.src = "img/pause.svg";
  } else {
    currentSong.pause();
    playButton.src = "img/play.svg";
  }

  document.querySelector(".songinfo").innerHTML = decodeURI(track);
  document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
};

const updatePlaylist = () => {
  let songUl = document.querySelector(".songlists ul");
  songUl.innerHTML = "";
  for (const song of songs) {
    let songName = decodeURIComponent(song);
    let li = document.createElement("li");
    li.className = "songlists small-font";
    li.innerHTML = `
      <img class="inverted" src="img/music.svg" alt="music" />
      <div class="info">
        <h4 class="song-name">${songName}</h4>
        <p>Chaudhary</p>
      </div>
      <div class="playnow">
        <span>Play Now</span>
        <img class="inverted" src="img/play.svg" alt="play" />
      </div>
    `;
    songUl.appendChild(li);
  }

  // attach listeners to each song
  Array.from(
    document.querySelector(".songlists").getElementsByTagName("li")
  ).forEach((e) => {
    e.addEventListener("click", () => {
      playmusic(e.querySelector(".info").firstElementChild.innerHTML);
    });
  });
};

async function main() {
  // get all the songs
  songs = await getSongs("songs/sad");
  if (songs.length > 0) {
    playmusic(songs[0], true);
    updatePlaylist();
  }

  // attach listener to the play, next and previous button
  playButton.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      playButton.src = "img/pause.svg";
    } else {
      currentSong.pause();
      playButton.src = "img/play.svg";
    }
  });

  // listen for timeupdate events
  currentSong.addEventListener("timeupdate", () => {
    document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(
      currentSong.currentTime
    )} / ${secondsToMinutesSeconds(currentSong.duration)}`;
    document.querySelector(".circle").style.left =
      (currentSong.currentTime / currentSong.duration) * 100 + "%";
  });

  // add event listeners to seekbar
  document.querySelector(".seekbar").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.offsetWidth) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currentSong.currentTime = (currentSong.duration * percent) / 100;
  });

  // Add event listener for hamburger menu
  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0";
  });

  // Add event listener for close button
  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-120%";
  });

  // add event listener to previous
  previous.addEventListener("click", () => {
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index - 1 >= 0) {
      playmusic(songs[index - 1]);
    }
  });

  // add event listener to next
  next.addEventListener("click", () => {
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index + 1 < songs.length) {
      playmusic(songs[index + 1]);
    }
  });

  //add event listener to volume
  document
    .querySelector(".range")
    .getElementsByTagName("input")[0]
    .addEventListener("change", (e) => {
      currentSong.volume = parseInt(e.target.value) / 100;
    });

  // add event listener to muted track
  document.querySelector(".volume>img").addEventListener("click", (e) => {
    if (e.target.src.includes("volume.svg")) {
      e.target.src = e.target.src.replace("volume.svg", "mute.svg");
      currentSong.volume = 0;
      document
        .querySelector(".range")
        .getElementsByTagName("input")[0].value = 0;
    } else {
      e.target.src = e.target.src.replace("mute.svg", "volume.svg");
      currentSong.volume = 0.1;
      document
        .querySelector(".range")
        .getElementsByTagName("input")[0].value = 10;
    }
  });

  // load the playlist whenever card is clicked
  Array.from(document.getElementsByClassName("card")).forEach((e) => {
    e.addEventListener("click", async (item) => {
      songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
      if (songs.length > 0) {
        playmusic(songs[0]);
        updatePlaylist();
      }
    });
  });
}

main();
