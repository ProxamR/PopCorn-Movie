import { useState, useEffect } from "react";

const KEY = "495acb40";

export function useMovies(query, callback){
    const [movies, setMovies] = useState([]);
    const [isLoading,setIsLoading] = useState(false);
    const [error,setError] = useState("");

    useEffect(function (){
      callback();
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
        fetchMovies();
        return function (){   // it is cleanup functio for abort
          controller.abort();
        };
      }      // eslint-disable-next-line
      ,[query]
      );
      return { movies ,isLoading , error };
}