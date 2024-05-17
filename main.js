const PATH_MOVIE_SEARCH_1 = "http://localhost:8000/example_movie_search_1.json";
const PATH_MOVIE_SEARCH_2 = "http://localhost:8000/example_movie_search_2.json";
const PATH_MOVIE_CAST_1 = "http://localhost:8000/example_movie_cast_1.json";
const PATH_MOVIE_CAST_2 = "http://localhost:8000/example_movie_cast_2.json";

let castFirstMovie = [];
let castSecondMovie = [];

async function fetchMoviesJSON(pathAPI) {
  const response = await fetch(pathAPI);
  const movies = await response.json();
  return movies.results[0];
}

async function fetchCastJSON(pathAPI, movieId) {
  const response = await fetch(pathAPI);
  const cast = await response.json();
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

  let commonMembers = castFirstMovie
    .filter(castMember => intersectingIds.includes(castMember.id))
    .map(filteredCastMembers => filteredCastMembers.name);

  drawVennDiagram(commonMembers);
}

function drawVennDiagram(commonMembers) {
  var sets = [{ sets: [castFirstMovie.map(member => member.name)], size: castFirstMovie.length },
  { sets: [castSecondMovie.map(member => member.name)], size: castSecondMovie.length },
  { sets: [commonMembers], size: commonMembers.length }];

  console.log(sets);

  var chart = venn.VennDiagram()
  d3.select("#viz").datum(sets).call(chart);
}