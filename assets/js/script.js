/* ===== WatchAndPlay.one — Client Script ===== */

/** Small in-memory "database" so pages can be dynamic */
const MOVIES = [
  {
    id: "inception",
    title: "Inception",
    year: 2010,
    poster: "../assets/img/inception.jpg",
    posterRoot: "assets/img/inception.jpg",
    genres: ["Sci-fi","Thriller"],
    duration: "2h 28m",
    imdb: "https://www.imdb.com/title/tt1375666/",
    trailer: "https://www.youtube.com/embed/YoHD9XEInc0",
    synopsis:
      "A mind-bending sci-fi thriller by Christopher Nolan about dreams within dreams, starring Leonardo DiCaprio."
  },
  {
    id: "interstellar",
    title: "Interstellar",
    year: 2014,
    poster: "../assets/img/interstellar.jpg",
    posterRoot: "assets/img/interstellar.jpg",
    genres: ["Sci-fi","Drama"],
    duration: "2h 49m",
    imdb: "https://www.imdb.com/title/tt0816692/",
    trailer: "https://www.youtube.com/embed/zSWdZVtXT7E",
    synopsis:
      "A team of explorers travels beyond our galaxy to discover whether humanity has a future among the stars."
  },
  {
    id: "oppenheimer",
    title: "Oppenheimer",
    year: 2023,
    poster: "../assets/img/oppenheimer.jpg",
    posterRoot: "assets/img/oppenheimer.jpg",
    genres: ["Biography","Drama"],
    duration: "3h 0m",
    imdb: "https://www.imdb.com/title/tt15398776/",
    trailer: "https://www.youtube.com/embed/uYPbbksJxIg",
    synopsis:
      "The story of J. Robert Oppenheimer and the creation of the atomic bomb, directed by Christopher Nolan."
  }
];

/* ---------- helpers ---------- */
const $ = (sel, root=document) => root.querySelector(sel);
const $$ = (sel, root=document) => [...root.querySelectorAll(sel)];
const byId = id => document.getElementById(id);
const getParam = name => new URLSearchParams(location.search).get(name);

/* ---------- mark active nav link ---------- */
(function highlightActiveNav(){
  const here = location.pathname.replace(/\/$/, "");
  $$("nav a").forEach(a=>{
    const href = a.getAttribute("href");
    if(!href) return;
    const abs = new URL(href, location.origin).pathname.replace(/\/$/, "");
    if (abs === here) a.classList.add("active");
  });
})();

/* ---------- simple search on Home + Movies ---------- */
(function wireSearch(){
  // Home
  const homeInput = byId("search");
  if (homeInput) {
    homeInput.addEventListener("input", () => filterCards(homeInput.value, $("#featured")));
  }
  // Movies page
  const moviesInput = byId("movieSearch");
  if (moviesInput) {
    moviesInput.addEventListener("input", () => filterCards(moviesInput.value, document));
  }
  function filterCards(q, scope){
    const val = (q||"").toLowerCase().trim();
    $$(".card", scope).forEach(card=>{
      const text = card.textContent.toLowerCase();
      card.style.display = text.includes(val) ? "" : "none";
    });
  }
})();

/* ---------- dynamic Movie Detail from ?id= ---------- */
(function movieDetail(){
  const id = getParam("id");
  const detailWrap = $(".movie-detail");
  const trailerFrame = $("iframe[title], iframe[src*='youtube']");
  if(!detailWrap || !id) return;

  const m = MOVIES.find(x=>x.id===id);
  if(!m) return;

  // Update poster path depending on depth (detail is in /movie/)
  const img = $("img", detailWrap);
  if (img) img.src = m.poster;
  const h2 = $("h2", detailWrap);
  if (h2) h2.textContent = `${m.title} (${m.year})`;
  const metaContainer = $(".movie-meta", detailWrap) || document.createElement("p");
  metaContainer.className = "movie-meta";
  metaContainer.textContent = `${m.genres.join(" • ")} • ${m.duration}`;
  const descP = $("p[data-role='synopsis']", detailWrap) || document.createElement("p");
  descP.setAttribute("data-role","synopsis");
  descP.textContent = m.synopsis;

  // Ensure CTA buttons exist
  let ctas = $(".cta", detailWrap);
  if(!ctas){
    ctas = document.createElement("div"); ctas.className = "cta"; ctas.style.display="flex"; ctas.style.gap="10px";
    detailWrap.appendChild(ctas);
  } else { ctas.innerHTML=""; }
  const imdbBtn = document.createElement("a");
  imdbBtn.href = m.imdb; imdbBtn.target = "_blank";
  imdbBtn.className = "btn"; imdbBtn.textContent = "View on IMDb";
  const discBtn = document.createElement("a");
  discBtn.href = "https://discord.gg/UMj8ndGHMB"; discBtn.target="_blank";
  discBtn.className = "btn"; discBtn.textContent = "🎥 Watch with Discord";
  ctas.append(imdbBtn, discBtn);

  // Insert/attach meta + synopsis neatly
  const rightCol = detailWrap.children[1] || detailWrap;
  if (rightCol && !$(".movie-meta", rightCol)) rightCol.prepend(metaContainer);
  if (rightCol && !$("p[data-role='synopsis']", rightCol)) rightCol.appendChild(descP);

  if(trailerFrame) trailerFrame.src = m.trailer;
})();

/* ---------- build Movies grid automatically (optional) ---------- */
/* If you want to auto-build the grid on /movies/, give <section id="movieList"> an empty body.
   Below will fill it from MOVIES. Existing cards stay intact. */
(function autoBuildMovies(){
  const list = byId("movieList");
  if(!list) return;
  // If list already has cards, leave them; otherwise build
  if ($$(".card", list).length) return;

  const depthPrefix = "../"; // movies/ page
  MOVIES.forEach(m=>{
    const a = document.createElement("a");
    a.className = "card";
    a.href = `../movie/index.html?id=${m.id}`;
    const img = document.createElement("img");
    img.src = m.poster; img.alt = m.title;
    const h3 = document.createElement("h3");
    h3.textContent = `${m.title} (${m.year})`;
    a.append(img,h3);
    list.appendChild(a);
  });
})();

/* ---------- Requests form → (optional) Discord Webhook ---------- */
/* How to use:
   1) Create a Discord webhook in your server (for #requests channel).
   2) Paste the URL below into DISCORD_WEBHOOK_URL.
   If left empty, the form will just show a success toast and log to console. */
const DISCORD_WEBHOOK_URL = ""; // e.g. "https://discord.com/api/webhooks/XXXXXXXX/XXXXXXXX"

(function requestsForm(){
  const form = document.getElementById("movieRequestForm");
  if(!form) return;

  form.addEventListener("submit", async (e)=>{
    e.preventDefault();
    const fd = new FormData(form);
    const title = (fd.get("title")||"").toString().trim();
    const link  = (fd.get("link")||"").toString().trim();
    const reason= (fd.get("reason")||"").toString().trim();

    const content = [
      `🎟️ **New Movie Request**`,
      `**Title:** ${title || "—"}`,
      `**Link:** ${link || "—"}`,
      `**Reason:** ${reason || "—"}`
    ].join("\n");

    try{
      if(DISCORD_WEBHOOK_URL){
        await fetch(DISCORD_WEBHOOK_URL, {
          method:"POST",
          headers:{ "Content-Type":"application/json" },
          body: JSON.stringify({ content })
        });
      } else {
        console.log("[REQUEST]", {title, link, reason});
      }
      toast("Request sent. Thank you! 🍿");
      form.reset();
    }catch(err){
      console.error(err);
      toast("Couldn't send request. Try again later.", true);
    }
  });
})();

/* ---------- Tiny toast ---------- */
function toast(msg, isErr=false){
  let t = document.createElement("div");
  t.textContent = msg;
  t.style.position="fixed"; t.style.bottom="18px"; t.style.left="50%"; t.style.transform="translateX(-50%)";
  t.style.background = isErr ? "#b00020" : "linear-gradient(90deg, #d94b4b, #d9a441)";
  t.style.color = isErr ? "#fff" : "#111";
  t.style.padding="10px 14px"; t.style.borderRadius="10px"; t.style.boxShadow="0 10px 24px rgba(0,0,0,.4)";
  t.style.zIndex="9999"; t.style.fontWeight="700";
  document.body.appendChild(t);
  setTimeout(()=>{ t.style.opacity="0"; t.style.transition="opacity .3s"; }, 2200);
  setTimeout(()=> t.remove(), 2600);
}
