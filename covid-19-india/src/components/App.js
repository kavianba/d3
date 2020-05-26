import React from 'react';
import GeoMap from './GeoMap';
import data from '../data/india-by-state.geo.json'; 
import '../styles/App.css';

class App extends React.Component{
  render () {
    return (
      <div>
        <h4>COVID-19 - By India</h4>
        <GeoMap data={data}/>
      </div>
    )
  }
}

export default App;