import React from 'react';
import ReactDOM from 'react-dom/client';
// import StarRating from './StarRating';
import './index.css';
import App from './App';


// function Test (){
//   const [movieRating, setMovieRating] = useState(0);
//   return (
//   <div>
//     <StarRating setMovieRating={setMovieRating} />
//     <p>Total rating of movie is {movieRating}</p>
//   </div>)
// }

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
    {/* <StarRating  message={["Terrible", "Bad", "Okay", "Good", "Amazing"]} />
    <StarRating StarCount={10} />
    <StarRating defaultRating={1} color ="blue" size={24} className="test" /> */}
    {/* <Test/> */}
  </React.StrictMode>
);
