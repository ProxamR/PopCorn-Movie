import { useEffect, useState } from "react";
import StarRating from './StarRating';

const KEY = "495acb40";

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);
 
export default function App() {
  const [movies, setMovies] = useState([]);
  const [watched, setWatched] = useState([]);
  const [isLoading,setIsLoading] = useState(false);
  const [error,setError] = useState("");
  const [query, setQuery] = useState("");
  const [selectedId,setSelectedId] = useState("");

  function handleSelectMovie (id){
    setSelectedId((selectedId)=> selectedId===id? null:id);
  }

  function handleCloseMovie (){
    setSelectedId(null);
  }

  function handleWatchMovie(movie){
    setWatched((watched)=>[...watched,movie]);
    
  }

  function handleDeleteWatched(id){
    setWatched((watched)=>watched.filter((movie)=> movie.imdbID!== id))
  }

  useEffect(function (){
    const controller = new AbortController();  //it is browser function to stop hp request, when new request is generated
    async function fetchMovies(){
      try{
        setIsLoading(true);
        setError("");
        const res = await fetch(`http://www.omdbapi.com/?i=tt3896198&apikey=${KEY}&s=${query}`,
        {signal:controller.signal});  // we are sending it along api request
        if(!res.ok)
          throw new Error("Something is wrong with moving fetching");
        const data = await res.json();
        if (data.Response === "False")
         throw new Error("Movie not found");
        setMovies(data.Search);
        setError("");
      }
      catch (err){
        if(err.name !=="AbortError"){
          setError(err.message)
        } 
      }finally{
        setIsLoading(false);
      }
    }
    handleCloseMovie();
    fetchMovies();
    return function (){   // it is cleanup functio for abort
      controller.abort();
    }
  }
  ,[query])


  return (
    <>
    <NavBar >
      <Search query={query} setQuery={setQuery}/>
      <NumResults movies={movies}/>
    </NavBar>
    <Main >
      <Box >
        {isLoading&&<Loader/>}
        {!isLoading && !error && <MovieList
      movies={movies} onSelectMovie={handleSelectMovie}  />}
      {error && <ErrorMessage message={error}/>}
      </Box>
      
      <Box>
        {selectedId ?
         <MovieDetals
          selectedId={selectedId}
          closeSelectedMovie={handleCloseMovie}
          onAddWatched={handleWatchMovie} 
          watched={watched}/>:
        <>
        <WatchedSummary watched={watched}/>
        <WatchedList watched={watched} deleteWatchedMovie={handleDeleteWatched}/>
        </>}
      </Box>
    </Main>
    </>
  );
}

function ErrorMessage({message}){
  return <p className="error">
    <span>⛔</span>{message}</p>
}

function Loader(){
  return <p className="loader">Loading.... </p>;
}

function NavBar({children}){
  return(
    <nav className="nav-bar">
      <Logo/>
     {children}
    </nav>
  )
}

function Logo(){
  return(
    <div className="logo">
    <span role="img">🍿</span>
    <h1>usePopcorn</h1>
  </div>
  )
}

function Search({query, setQuery}){
  return(
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
    />
  )
}

function NumResults({movies}){
  return(
    <p className="num-results">
    Found <strong>{movies?.length}</strong> results
  </p>
  )
}
//Main tag
function Main({ children}){
  return (
    <main className="main">
      {children}
    </main>
  )
}

function Box({children}){
  const [isOpen, setIsOpen] = useState(true);

  return(
    <div className="box">
    <Button setIsOpen={setIsOpen} isOpen={isOpen}/>
    {isOpen &&  children}
  </div>
  )
}


function MovieList({ movies, onSelectMovie}){
  return(
    <ul className="list list-movies">
    {movies?.map((movie) => (
      <Movie  movie={movie} key={movie.imdbID} onSelectMovie={onSelectMovie}/>
    ))}
  </ul>
  )
}

function Movie({movie, onSelectMovie}){
  return(
    <li onClick={()=>onSelectMovie(movie.imdbID) }>
    <img src={movie.Poster} alt={`${movie.Title} poster`} />
    <h3>{movie.Title}</h3>
    <div>
      <ParagraphTag emoji={"🗓"} movie={movie.Year} />
    </div>
  </li>
  )
}

function MovieDetals({selectedId, closeSelectedMovie, onAddWatched, watched}){
  const [movie,setMovie] = useState({});
  const [isLoading,setIsLoading] = useState(false);
  const [userRating,setUserRating] = useState("");
  const {
    Title: title,
    Year: year,
    Poster: poster,
    Runtime: runtime,
    imdbRating,
    Plot: plot,
    Released: released,
    Actors: actors,
    Director: director,
    Genre: genre,
  } = movie;


  useEffect(function(){
    async function getMovieDetails (){
      setIsLoading(true);
      const res = await fetch(`http://www.omdbapi.com/?apikey=${KEY}&i=${selectedId}`);
      const data = await res.json();
      setMovie(data);
      setIsLoading(false);
    }

    getMovieDetails();

  },[selectedId]);

  useEffect(function (){
    if(title)
      document.title = `Movie | ${title}`;
    return (function(){
      document.title = "UsePopcorn";
    })
  },[title])

  useEffect( function(){
    function callback(e){
      if(e.code==="Escape"){
        closeSelectedMovie();
      }
     };

     document.addEventListener("keydown",callback)
     return function(){
      document.removeEventListener('keydown',callback)
     }
  },[closeSelectedMovie])

const watchedOrNot = watched.map((movie)=>movie.imdbID).includes(selectedId);
const watchedUserRating = watched.find((movie)=> movie.imdbID===selectedId)?.userRating;


function handleAdd(){
  const newWatchedMovie = {
    imdbID: selectedId,
    title,
    year,
    poster,
    imdbRating: Number(imdbRating),
    runtime: Number(runtime.split(" ").at(0)),
    userRating,
   };

  onAddWatched(newWatchedMovie);
  closeSelectedMovie();

}



  return(
    <div className="details">
      {isLoading?<Loader/>:
      <>
        <header>
        <button onClick={closeSelectedMovie} className="btn-back">
          &larr;
        </button>
        <img src={poster} alt={`Poster of ${movie}movie`} />
        <div className="details-overview">
          <h2>{title}</h2>
          <p>
            {released} &bull; {runtime} 
          </p>
          <p>{genre}</p>
          <span>⭐</span>{imdbRating} IMDB rating
        </div>
      </header>
      <section> 
        <div className="rating">
        {!watchedOrNot?(
          <>
          <StarRating StarCount={10} size={24} setMovieRating={setUserRating}/>
          {userRating>0 && <button className="btn-add" onClick={handleAdd}>+ Add to List</button> }
          </>
        ): <p>You already rate this movie: {watchedUserRating}
          <span>⭐</span></p>}
        </div>
        <p><em>{plot}</em></p>
        <p>Starring {actors}</p>
        <p>Directed by {director}</p>
      </section>
      </>}

    </div>)
}

function WatchedSummary({watched}){

  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched.map((movie) => movie.runtime));

  return(
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <ParagraphTag emoji={"#️⃣"} movie={watched.length} >movies</ParagraphTag>
        <ParagraphTag emoji={"⭐️"} movie={avgImdbRating.toFixed(2)} />
        <ParagraphTag emoji={"🌟"} movie={avgUserRating.toFixed(2)} />
        <ParagraphTag emoji={"⏳"} movie={avgRuntime.toFixed(2)} />
      </div>
    </div>

  )
}

function WatchedList({watched, deleteWatchedMovie}){
  return(
    <ul className="list">
    {watched.map((movie) => (
      <WatchedMovie movie={movie} key={movie.imdbID} deleteWatched={deleteWatchedMovie}/>
    ))}
  </ul>
  )
}

function WatchedMovie({movie, deleteWatched}){

  return(
    <li >
      <img src={movie.poster} alt={`${movie.title} poster`} />
      <h3>{movie.title}</h3>
      <div>
        <ParagraphTag emoji={"⭐️"} movie={movie.imdbRating} />
        <ParagraphTag emoji={"🌟"} movie={movie.userRating} />
        <ParagraphTag emoji={"⏳"} movie={movie.runtime} />
      </div>
      <button className="btn-delete" onClick={()=>deleteWatched(movie.imdbID)}>X</button>
  </li>
  )
}


function Button({setIsOpen,isOpen}){
  return(
    <button
    className="btn-toggle"
    onClick={() => setIsOpen((open) => !open)}
  >
    {isOpen ? "–" : "+"}
  </button>
  )

}

function ParagraphTag({emoji,movie,children}){
  return(
    <p>
    <span>{emoji}</span>
    <span>{movie}{children}</span>
  </p>
  )
}