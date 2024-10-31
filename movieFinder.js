import { allMovies } from "./assets/imdbData.js";
import { selectedGenres, selectedStars, ratingFrom, ratingTo, sortOption } from "./mainIndex.js";
import { drawPaginationButtonsAndMovies } from "./userMovies.js";
export {findMovies}

const movieFinds = [];
function findMovies() {
  movieFinds.length = 0;
  for (const [idx, movie] of Object.entries(allMovies)) {
    if (movie.vote_average < ratingFrom || movie.vote_average > ratingTo) continue;
    if (selectedGenres.size > 0) {
      let countGenres = 0;
      for (const genre of selectedGenres) {
        if (movie.genres_list.includes(genre)) {
          countGenres++;
          break;
        }
      }
      if (countGenres == 0) continue;
    }
    if (selectedStars.size > 0) {
      if (!selectedStars.has(movie.Star1) && !selectedStars.has(movie.Star2) &&
          !selectedStars.has(movie.Star3)) continue;
    }
    movieFinds.push(movie);
  }

  if (sortOption == 1) {
    movieFinds.sort(function(m1, m2) {
      if (m1.title < m2.title) return -1;
      if (m1.title > m2.title) return 1;
      return 0;
    })
  }
  else if (sortOption == 2) {
    movieFinds.sort(function(m1, m2) {
      if (m1.vote_average > m2.vote_average) return -1;
      if (m1.vote_average < m2.vote_average) return 1;
      return 0;
    })
  }
  else if (sortOption == 4) {
    movieFinds.sort(function(m1, m2) {
      if (m1.vote_count > m2.vote_count) return -1;
      if (m1.vote_count < m2.vote_count) return 1;
      return 0;
    })
  }
  drawPaginationButtonsAndMovies("movieFinds", movieFinds, movieFinds.length);
}