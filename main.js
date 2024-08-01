const PATH_MOVIE_SEARCH_1 = "http://localhost:8000/example_movie_search_1.json";
const PATH_MOVIE_SEARCH_2 = "http://localhost:8000/example_movie_search_2.json";
const PATH_MOVIE_CAST_1 = "http://localhost:8000/example_movie_cast_1.json";
const PATH_MOVIE_CAST_2 = "http://localhost:8000/example_movie_cast_2.json";

let castFirstMovie = [];
let castSecondMovie = [];
let movieTitles = [];

async function fetchMoviesJSON(pathAPI) {
  const response = await fetch(pathAPI);
  const movies = await response.json();
  movieTitles.push(movies.results[0].title);
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
  var sets = [{ sets: [movieTitles[0]], size: castFirstMovie.length },
  { sets: [movieTitles[1]], size: castSecondMovie.length },
  { sets: [[movieTitles[0]], movieTitles[1]], size: commonMembers.length }];

  var div = d3.select("#viz")
  div.datum(sets).call(venn.VennDiagram());

  var tooltip = d3.select("body").append("div")
    .attr("class", "venntooltip");

  div.selectAll(".venn-intersection")
    .on("mouseover", function (d, i) {
      venn.sortAreas(div, d);

      tooltip.transition().duration(400).style("opacity", .9);
      tooltip.text(commonMembers.join(', '));

      var selection = d3.select(this).transition("tooltip").duration(400);
      selection.select("path")
        .style("stroke-width", 3)
        .style("fill-opacity", d.sets.length == 1 ? .4 : .1)
        .style("stroke-opacity", 1);
    })

    .on("mousemove", function () {
      tooltip.style("left", (d3.event.pageX) + "px")
        .style("top", (d3.event.pageY - 28) + "px");
    })

    .on("mouseout", function (d, i) {
      tooltip.transition().duration(400).style("opacity", 0);
      var selection = d3.select(this).transition("tooltip").duration(400);
      selection.select("path")
        .style("stroke-width", 0)
        .style("fill-opacity", d.sets.length == 1 ? .25 : .0)
        .style("stroke-opacity", 0);
    });
}
