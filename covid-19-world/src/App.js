import React from 'react';
import './App.css';
import GeoMap from './components/GeoMap';
import data from './data/world.geo.json';

const App = () => {
  return (
    <div>
      <h4>COVID-19 - Confirmed Cases by Country</h4>
      <GeoMap data={data}/>
    </div>
  );
}

export default App;