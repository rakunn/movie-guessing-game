/* global $ */

const MOVIEDB_API_KEY = "7a83d1b0105f6834e22c4bc43ae61645";
const GIPHY_API_KEY = "7ihJ5iusJ7DQpH3tCW5MnLsIYfugkOya";
let moves = 0;
let moviesArray;

async function getMoviesPage(pageNum) {
	$.get(`https://api.themoviedb.org/3/movie/top_rated?api_key=${MOVIEDB_API_KEY}&page=${pageNum}`, response => {
		const movieTitles = response.results.map(movie => movie.title);
		moviesArray.push(...movieTitles);
	});
}

async function getAllMovies() {
	moviesArray = []; //restore moviesArray each time getAllMovies is invoked (reset game);
	for (let i = 1; i <= 5; i++) {
		await getMoviesPage(i);
	}
}

function randomElement (array) {
	const length = array.length;
	const randomIndex = Math.floor(Math.random() * length);
	return array[randomIndex];
}

function getRandomMovies(array, movieAmount) {
	let newArray = [];
	for (let i = 0; i<movieAmount; i++) {
		newArray.push(randomElement(array));
	}
	return newArray;
}

function prepareMoviesAndGifData (array) {
	const randomMovies = getRandomMovies(array, 10); //10 movies per set
	const randomMovie  = getRandomMovies(randomMovies, 1); //1 movie out of 10 selected - goes also to GIF request
	return [randomMovies, randomMovie[0]];
}

async function getAndRenderGif(movieTitle) {
	$.get(`https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_API_KEY}&q=${movieTitle}&limit=20&offset=0&rating=G&lang=en`, response => {
		return response.data;
	})
	.then(gifs => {
		const gif = $('#giphy');
		gif.data('title', movieTitle);
		gif.attr('src', randomElement(gifs.data).images['original'].url);
	});
}

function filterAndShuffleMovies(array, movie) {
	let movieList = [movie];
	for (let i = 0; i < 3; i++ ) {
		const movie = randomElement(array);
	  !movieList.includes(movie) ?movieList.push(movie) : i--; //push unique title, otherwise count again
	}
	return movieList.sort(() => Math.random() - 0.5); // returns randomly sorted movieList array
}

function renderMovieTitles(array) {
	const movieList = $('#movies');
	for (let i = 0; i < 4; i++ ) {
		movieList.append(`<button class="movie ui button yellow">${array[i]}</button>`);
	}
}

function checkAnswer(htmlElement) {
	const correntAnswer = $('#giphy').data('title');
	const result = htmlElement.innerText === correntAnswer;
	const answers = Number($('#answers').text());

	moves ++;

	if (moves === 10) {
		if (result) { $('#answers').text(answers + 1) }
		$('#final-score').text($('#answers').text());
		$('.ui.modal.end-game').modal('setting', 'closable', false).modal('show');
	} else {
		if (result) {
			$('#answers').text(answers + 1);
			$('.ui.modal.correct').modal('show');
		} else {
			$('.ui.modal.incorrect').modal('show');
		}
	}
	return result;
}

function renderAllComponents(array) {
	const moviesData = prepareMoviesAndGifData(moviesArray);
	const [ tenMovies, oneMovie ] = moviesData;
	const filteredMovies = filterAndShuffleMovies(tenMovies, oneMovie);
	renderMovieTitles(filteredMovies);
	getAndRenderGif(oneMovie);
}

function updateComponents() {
	$('.movie').remove();
}

function startGame() {
	getAllMovies();
	setTimeout(() => {
		renderAllComponents(moviesArray);
		$('#giphy').css('opacity', '1');
	}, 1000);
}

function restartGame() {
	moves = 0;
	moviesArray = [];
	$('#answers').text(moves);
	updateComponents();
	startGame();
}

//
// Initialize event listeners
//

$('#giphy').on('click', (event) => {
	console.log($(event.target).data('title'));
});

$('#movies').on('click', '.movie', (event) => {
	$('#giphy').css('opacity','0');
	const answer = checkAnswer(event.target);
	updateComponents(answer);
	renderAllComponents();
});

$('.actions').on('click', '.next', () => {
	$('#giphy').css('opacity','1');
});

$('#restart').on('click', restartGame);
//////////

//
// Start the game
//
startGame();

