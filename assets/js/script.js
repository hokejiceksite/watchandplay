// =============== MOVIE DATA ===============
const MOVIES = [
  {
    id: "inception",
    title: "Inception",
    year: 2010,
    image: "assets/img/inception.jpg",
    trailer: "https://www.youtube.com/embed/YoHD9XEInc0"
  },
  {
    id: "interstellar",
    title: "Interstellar",
    year: 2014,
    image: "assets/img/interstellar.jpg",
    trailer: "https://www.youtube.com/embed/zSWdZVtXT7E"
  },
  {
    id: "oppenheimer",
    title: "Oppenheimer",
    year: 2023,
    image: "assets/img/oppenheimer.jpg",
    trailer: "https://www.youtube.com/embed/uYPbbksJxIg"
  }
];

// =============== FEATURED MOVIES ===============
const featuredContainer = document.getElementById("featuredMovies");
if (featuredContainer) {
  MOVIES.forEach(m => {
    const a = document.createElement("a");
    a.className = "card";
    a.href = `movie/index.html?id=${m.id}`;
    a.innerHTML = `
      <img src="${m.image}" alt="${m.title}">
      <h3>${m.title} (${m.year})</h3>
    `;
    featuredContainer.appendChild(a);
  });
}

// =============== MOVIE SEARCH ===============
const searchInput = document.getElementById("search");
if (searchInput) {
  searchInput.addEventListener("input", e => {
    const q = e.target.value.toLowerCase();
    document.querySelectorAll(".card").forEach(c => {
      c.style.display = c.textContent.toLowerCase().includes(q) ? "" : "none";
    });
  });
}
