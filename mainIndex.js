import { allMovies } from "./assets/imdbData.js";
import { findMovies } from "./movieFinder.js";
import { getDataFromDatabase, getDataLength } from "./firebase.js";
import { drawPaginationButtonsAndMovies } from "./userMovies.js";
export { clearList, selectedGenres, selectedStars, ratingFrom, ratingTo, sortOption };
const allStars = new Set();
const allGenres = new Set();
const selectedGenres = new Set();
const selectedStars = new Set();
let ratingFrom = 0.0, ratingTo = 10.0, sortOption = 0;

for (const movie of Object.values(allMovies)) {
    if (movie.Star1 != null) allStars.add(movie.Star1);
    if (movie.Star2 != null) allStars.add(movie.Star2);
    if (movie.Star3 != null) allStars.add(movie.Star3);
    let genreList = movie.genres_list;
    for (let character of ['\'', '[', ']']) {
        genreList = genreList.replaceAll(character, '');
    }
    genreList = genreList.split(", ");
    movie.genres_list = genreList;
    for (const genre of genreList) {
        allGenres.add(genre);
    }
}
allGenres.delete('Unknown');


window.addEventListener("DOMContentLoaded", () => {
    const pageContent = document.getElementById("pageContent");
    async function changePage(pageId) {
        const template = document.getElementById(pageId + "Template");
        pageContent.innerHTML = "";
        pageContent.appendChild(template.content.cloneNode(true));
       if (pageId != "homePage") drawPaginationButtonsAndMovies(pageId, await getDataFromDatabase(pageId), await getDataLength(pageId));
       else {
        drawGenreButtons();
        readingRatingRequirements();
        getStars();
        const searchButton = document.getElementById("searchButton");
        searchButton.addEventListener("click", (event) => {
            event.preventDefault();
            findMovies();
        });
       }

   }
   changePage("homePage");
   document.querySelectorAll("nav a").forEach(link => {
    link.addEventListener("click", (e) => {
        e.preventDefault();
        changePage(link.id.substring(0, link.id.length - 9));
    });
   });

    const loginButton = document.getElementById("loginButton");
    const closeIconLogin = document.getElementById("closeIconLogin");
    const closeIconSignup = document.getElementById("closeIconSignup");
    const loginPopup = document.getElementById("loginPopup");
    const signupPopup = document.getElementById("signupPopup");
    const loginRef = document.getElementById("loginRef");
    const signupRef = document.getElementById("signupRef");
    loginPopup.style.display = "none";
    signupPopup.style.display = "none";
    loginButton.addEventListener("click", () => {
        loginPopup.style.display = "block";
    });
    closeIconLogin.addEventListener("click", () => {
        loginPopup.style.display = "none";
    });
    closeIconSignup.addEventListener("click", () => {
        signupPopup.style.display = "none";
    });
    signupRef.addEventListener("click", () => {
        loginPopup.style.display = "none";
        signupPopup.style.display = "block";
    });
    loginRef.addEventListener("click", () => {
        signupPopup.style.display = "none";
        loginPopup.style.display = "block";
    });


    function drawGenreButtons () {
        const genreButtons = document.getElementById("genreButtons");
        for (const genre of allGenres) {
            const genreButton = document.createElement("button");
            const genreIcon = document.createElement("i");
            const genreLabel = document.createTextNode(genre);
            genreIcon.classList.add("fa", "fa-plus", "genreIcon");
            genreIcon.id = genre;
            genreButton.classList.add("genreButtonNotSel");
            genreButton.appendChild(genreIcon);
            genreButton.appendChild(genreLabel);
            genreButtons.appendChild(genreButton);
            genreButton.addEventListener("click", (event) => {
                event.preventDefault();
                if (selectedGenres.has(genre)) {
                    selectedGenres.delete(genre);
                    genreIcon.className = "fa fa-plus genreIcon";
                    genreButton.className = "genreButtonNotSel";
                }
                else {
                    selectedGenres.add(genre);
                    genreIcon.className = "fa fa-close genreIcon";
                    genreButton.className = "genreButtonSel";
                }
            });
        }
    }

    function readingRatingRequirements() {
        const ratingInputFrom = document.getElementById("ratingFrom");
        const ratingInputTo = document.getElementById("ratingTo");
        ratingInputFrom.addEventListener("input", (e) => {
            let num = ratingInputFrom.value;
            ratingFrom = (num ? num : 0.0);
        });
        ratingInputTo.addEventListener("input", (e) => {
            let num = ratingInputTo.value;
            ratingTo = (num ? num : 10.0);
        });
    }
    
    function getStars() {
        const starInput = document.getElementById("starSearch");
        const starResID = document.getElementById("starResID");
        const selectedStarsID = document.getElementById("selectedStarsID");

    
        starInput.addEventListener("input", () => {
            let str = starInput.value;
            const result = new Set();
            if (str && str.trim().length > 0) {
                str = str.trim().toLowerCase();
                for (const star of allStars) {
                    if (star.toLowerCase().includes(str)) result.add(star);
                }
            }
            setList(result, starResID, selectedStarsID);
        });

        function setList(result, listRes, listSel) {
            clearList(listRes);
            clearList(listSel);
            document.getElementById("starringLabel").textContent = (selectedStars.size > 0 ? "Starring" : "");
            for (const star of selectedStars) {
                const starLI = document.createElement("li");
                const starLabel = document.createTextNode(star);
                const selStarIcon = document.createElement("i");
                selStarIcon.classList.add("fa", "fa-close", "selStarIcon");
                starLI.classList.add("selStarLI");
                starLI.appendChild(starLabel);
                starLI.appendChild(selStarIcon);
                listSel.appendChild(starLI);
                selStarIcon.addEventListener("click", () => {
                    selectedStars.delete(star);
                    allStars.add(star);
                    setList(result, listRes, listSel);
                });
            }
            for (const star of result) {
                const resultLI = document.createElement("li");
                const resultButton = document.createElement("button");
                const resultIcon = document.createElement("i");
                const resultLabel = document.createTextNode(star);
                resultIcon.classList.add("fa", "fa-plus", "starIcon");
                resultButton.classList.add("starButton");
                resultLI.classList.add("starLI");
                resultButton.appendChild(resultIcon);
                resultButton.appendChild(resultLabel);
                resultLI.appendChild(resultButton);
                listRes.appendChild(resultLI);
                resultButton.addEventListener("click", () => {
                    selectedStars.add(star);
                    allStars.delete(star);
                    result.clear();
                    starInput.value = "";
                    setList(result, listRes, listSel);
                });
            }
        }
    }

    const sortOptionSelector = document.getElementById("selectSortOption");
    sortOptionSelector.addEventListener("click", () => {
        const val = sortOptionSelector.value;
        switch(val) {
            case "alphabetically":
                sortOption = 1;
                break;
            case "by rating (descending)":
                sortOption = 2;
                break;
            case "by review count (descending)":
                sortOption = 3;
                break;
            default:
                sortOption = 0;
        }
    });
});

function clearList(list) {
    while(list.firstChild) list.removeChild(list.firstChild);
};
