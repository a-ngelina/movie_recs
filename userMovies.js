import { clearList } from "./mainIndex.js";
import { userUID, addMovie, removeMovie, hasMovie } from "./firebase.js";
import { allMovies } from "./assets/imdbData.js";
export {drawPaginationButtonsAndMovies};


function drawPaginationButtonsAndMovies(pageName, moviesList, moviesListLength) {
  function changeHeader() {
    const pageHeader = document.getElementById(pageName + "Header");
    if (pageName != "movieFinds" && !userUID) {
      pageHeader.textContent = `Log in to mark ${pageName} movies.`;
    }
    else if (moviesListLength == 0) {
      pageHeader.textContent = (pageName == "movieFinds" ? 
                                "Based on your choices no movies were found" :
                                `You do not have any ${pageName} movies yet.`);
      return;
    }
    else if (pageName == "movieFinds") {
      pageHeader.textContent = `Based on your choices ${moviesListLength} movie` + (moviesListLength == 1 ? " was" : "s were") + " found.";
    }
    else {
      pageHeader.textContent = `You have ${moviesListLength} ${pageName} movie` + (moviesListLength == 1 ? "." : "s.");
    }
  }

  function addEllipsis() {
    const ellipsis = document.createElement("span");
    ellipsis.textContent = "...";
    ellipsis.classList.add("ellipsis");
    paginationButtons.appendChild(ellipsis);
  }

  function drawPaginationButton(pageNumber) {
    const paginationButton = document.createElement("button");
    const paginationLabel = document.createTextNode(pageNumber);
    paginationButton.appendChild(paginationLabel);
    if (pageNumber == selectedPage) paginationButton.classList.add("selectedPaginationButton");
    else paginationButton.classList.add("paginationButton");
    paginationButtons.appendChild(paginationButton);
    paginationButton.addEventListener("click", (event) => {
      event.preventDefault();
      selectedPage = pageNumber;
      displayResults(movieButtons);
      layOutPagination();
    });
  }

  function layOutPagination() {
    pagesToShow.clear();
    clearList(paginationButtons);
    for (let i = 1; i <= Math.min(3, numPages); i++) {
      pagesToShow.add(i);
    }
    if (selectedPage) {
      for (let i = Math.max(1, selectedPage - 2); i <= Math.min(numPages, selectedPage + 2); i++) {
        pagesToShow.add(i);
      }
    }
    for (let i = Math.max(numPages - 2, 1); i <= numPages; i++) {
      pagesToShow.add(i);
    }
    
    let prev = null;
    for (const i of pagesToShow) {
      if (prev && prev < i - 1) {
        addEllipsis();
      }
      prev = i;
      drawPaginationButton(i);
    }
  }



  async function displayResults() {
    async function drawButton(movieName) {
      function createElement(type, content = "", classNames = "") {
        const newElement = document.createElement(type);
        if (type != "i" && type != "br") newElement.textContent = content;

        if (classNames != "") {
          if (!Array.isArray(classNames)) {
            newElement.classList.add(classNames);
          }
          else {
            for (const className of classNames.values()) {
              newElement.classList.add(className);
            }
          }
        }
        return newElement;
      }

      function findMovie(movieName) {
        for (const i of Object.values(allMovies)) {
          if (i.title == movieName) return i;
        }
        return null;
      }

      const movie = (pageName == "movieFinds" ? movieName : findMovie(movieName));
      const movieButton = document.createElement("button");
      const eyeLabel = document.createElement("i");
      const heartLabel = document.createElement("i");
      const bookmarkLabel = document.createElement("i");
      const [hasSaved, hasFavourites, hasWatched] = await Promise.all([
             hasMovie("saved", movie.title),
             hasMovie("favourite", movie.title),
             hasMovie("watched", movie.title)
      ]);
      for (const [icon, class1, class2, listName, has] of [[eyeLabel, "fa-eye-slash", "fa-eye", "watched", hasWatched],
                                                 [heartLabel, "fa-heart-o", "fa-heart", "favourite", hasFavourites],
                                                 [bookmarkLabel, "fa-bookmark-o", "fa-bookmark", "saved", hasSaved]].values()) {
        if (userUID && has) icon.classList.add("fa", class2, "upperLabel");
        else icon.classList.add("fa", class1, "upperLabel");
        icon.addEventListener("click", () => {
          if (icon.classList.contains(class1)) {
            if (userUID) addMovie(listName, movie.title);
            icon.classList.replace(class1, class2);
          }
          else {
            if (userUID) removeMovie(listName, movie.title);
            icon.classList.replace(class2, class1);
          }
        })
      }
      const starsTotalLabel = createElement("span", movie.Star1 == "" && movie.Star2 == "" && movie.Star3 == "" ? "" : "Starring ", "starsTotalLabel");
      const starsLabel = createElement("span", movie.Star1 == "" && movie.Star2 == "" && movie.Star3 == "" ? "" : " " + movie.Star1 + ", " + 
                                       movie.Star2 + ", " + movie.Star3, "starsLabel");
      const brElement = createElement("br");
      const keywordTotalLabel = createElement("span", "Keywords: ", "keywordTotalLabel");
      let newKeywords = movie.keywords;
      newKeywords= newKeywords.replaceAll(" \\\\", "`");
      for (const char of ["[", "]", "\'"].values()) {
        newKeywords = newKeywords.replaceAll(char, "");
      }
      const keywordLabel = createElement("span", newKeywords, "keywordLabel");
      const keywordContainer = document.createElement("span");
      keywordContainer.appendChild(keywordTotalLabel);
      keywordContainer.appendChild(keywordLabel);
      movieButton.classList.add("resultMovieButton");
      for (const element of [createElement("span", movie.title, "titleLabel"), createElement("span", movie.runtime + " min", "runtimeLabel"),
                             bookmarkLabel, heartLabel, eyeLabel, createElement("br"),
                             createElement("i", "", ["fa", "fa-star", "voteIcon"]), createElement("span", " " + movie.vote_average, "voteAvgLabel"),
                             createElement("span", " (" + movie.vote_count + ")", "voteCountLabel"), createElement("br"),
                             createElement("span", "Genres: ", "genresTotalLabel"), createElement("span", movie.genres_list.join(", "), "genresLabel"), createElement("br"),
                             starsTotalLabel, starsLabel, brElement, keywordContainer].values()) {
        movieButton.appendChild(element);
      }
      const elementsToToggle = [starsTotalLabel, starsLabel, brElement, keywordContainer];
      for (const element of elementsToToggle.values()) {
        element.style.display = "none";
      }
      movieButton.addEventListener("click", (event) => {
        event.preventDefault();
        if (!event.target.closest(".upperLabel")) {
          if (starsLabel.style.display === "none") {
            for (const element of elementsToToggle.values()) {
              element.style.display = "inline-block";
            }
          }
          else {
            for (const element of elementsToToggle.values()) {
              element.style.display = "none";
            }
          }
        }
      });
      return movieButton;
    }

    clearList(movieButtons);
    const moviePromises = [];
    for (let i = (selectedPage - 1) * 10; i < Math.min(moviesListLength, (selectedPage * 10)); i++) {
      const movieName = moviesList[i];
      moviePromises.push(drawButton(movieName));
    }
    const moviesToAppend = await Promise.all(moviePromises);
    for (const movieButton of moviesToAppend.values()) {
      movieButtons.appendChild(movieButton);
    }
  }

  let selectedPage = 1;
  let pagesToShow = new Set();
  changeHeader();
  const paginationButtons = document.getElementById(pageName + "PageButtons");
  const movieButtons = document.getElementById(pageName + "Movies");
  let numPages = (moviesListLength - moviesListLength % 10) / 10 + (moviesListLength != 0);
  layOutPagination();
  displayResults();
}
