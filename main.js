import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

const PATH_MOVIE_SEARCH_1 = "http://localhost:8000/example_movie_search_1.json";
const PATH_MOVIE_SEARCH_2 = "http://localhost:8000/example_movie_search_2.json";
const PATH_MOVIE_CAST_1 = "http://localhost:8000/example_movie_cast_1.json";
const PATH_MOVIE_CAST_2 = "http://localhost:8000/example_movie_cast_2.json";

let castFirstMovie = [];
let castSecondMovie = [];
let commonMembers = [];

async function fetchMoviesJSON(pathAPI) {
  const response = await fetch(pathAPI);
  const movies = await response.json();
  console.log(movies.results[0]);
  return movies.results[0];
}

async function fetchCastJSON(pathAPI, movieId) {
  const response = await fetch(pathAPI);
  const cast = await response.json();
  console.log(cast);
  return cast;
}

Promise.all([
  Promise.all([fetchMoviesJSON(PATH_MOVIE_SEARCH_1)])
    .then(firstMatch => firstMatch)
    .then(res => fetchCastJSON(PATH_MOVIE_CAST_1, res.id))
    .then(membersFirstMovie => (castFirstMovie = membersFirstMovie.cast)),
  Promise.all([fetchMoviesJSON(PATH_MOVIE_SEARCH_2)])
    .then((res) => fetchCastJSON(PATH_MOVIE_CAST_2, res.id))
    .then(membersSecondMovie => (castSecondMovie = membersSecondMovie.cast))
])
  .then(() => getIntersectingCast());


function getIntersectingCast() {
  let idsCastFirstMovie = castFirstMovie.map(castMember => castMember.id);
  let idsCastSecondMovie = castSecondMovie.map(castMember => castMember.id);

  let intersectingIds = idsCastFirstMovie.filter(value => idsCastSecondMovie.includes(value));

  commonMembers = castFirstMovie
    .filter(castMember => intersectingIds.includes(castMember.id))
    .map(filteredCastMembers => filteredCastMembers.name);

  console.log(commonMembers);

  drawCircle(castFirstMovie);
  drawCircle(castSecondMovie);
}

function drawCircle(dataFromMovie) {
  var circleSvg = d3.select("#viz")
    .append("svg")
    .attr("width", dataFromMovie.length * 4)
    .attr("height", dataFromMovie.length * 4);

  console.log('drawing for ' + dataFromMovie.length);

  circleSvg.append('circle')
    .attr('cx', dataFromMovie.length * 2)
    .attr('cy', dataFromMovie.length * 2)
    .attr('r', dataFromMovie.length)
    .attr('stroke', 'black')
    .attr('fill', '#69a3b2');

  circleSvg.append("text")
    .attr("dy", 40)
    .text(() => dataFromMovie.map(castMember => castMember.name));
}