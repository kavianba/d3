import React, { useState, useEffect, useRef } from 'react';
import { select, geoPath, geoMercator, min, max, scaleLinear, event } from 'd3';
import axios from 'axios';

const getCoronaData = () => {
  return axios.get('https://corona.lmao.ninja/v2/countries');
};

const GeoMap = ({ data }) => {
  const svgRef = useRef();
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [coronaData, setCoronaData] = useState(null);
  
  getCoronaData().then((response) => {
    setCoronaData(response.data);
  }).catch((error) => {
    console.log('Failed to fetch data', error);
  })

  useEffect(() => {
    const width = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    const height = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
    const svg = select(svgRef.current);
   
    if (coronaData) {
      let features = data.features;

      var coronoByCountry = {};

      coronaData.forEach(function (d) {
        coronoByCountry[d.countryInfo.iso3] = {
           cases: d.cases,
           recovered: d.recovered,
           deaths: d.deaths,
           countryFlag: d.countryInfo.flag
        }
      });

      features.forEach(function (d) {
          d.coronaData = coronoByCountry[d.properties.ISO_A3] ? 
                              coronoByCountry[d.properties.ISO_A3] : 
                              { cases: 0, recovered: 0, deaths: 0, countryFlag: "" };
      });

      const minProp = min(features, feature => feature.coronaData["cases"]);
      const maxProp = max(features, feature => feature.coronaData["cases"]);
      const colorScale = scaleLinear().domain([minProp, maxProp]).range(["#cccccc", "#ff0000"]);
      
      const projection = geoMercator().fitSize([width, height], selectedCountry || data).precision(100);
      const pathGenerator = geoPath().projection(projection);

      select('#tooltip').style("display", "block");
      svg.selectAll(".country")
          .data(features)
          .join("path")
          .on("click", feature => {
            setSelectedCountry(selectedCountry === feature ? null : feature);
          })
          .on("mouseover", (feature) => {
            select('#tooltip').transition()
                              .duration(200).style('opacity', 1);

            select('.country-flag').attr("src", feature.coronaData.countryFlag);          
            select('.country-name').text(feature.properties.SOVEREIGNT);
            select('.cases').text(new Intl.NumberFormat('en-IN', { maximumSignificantDigits: 3 }).format(feature.coronaData.cases));
            select('.recovered').text(new Intl.NumberFormat('en-IN', { maximumSignificantDigits: 3 }).format(feature.coronaData.recovered));
            select('.deaths').text(new Intl.NumberFormat('en-IN', { maximumSignificantDigits: 3 }).format(feature.coronaData.deaths));
          })
          .on("mousemove", () => {
            select('#tooltip').style('left', (event.pageX + 10) + 'px')
                              .style('top', (event.pageY + 10) + 'px')
                                   
          })
          .on("mouseout", () => {
            select('#tooltip').style('opacity', 0);
            select('.country-flag').attr("src", "");  
          })
          .attr("class", "country")
          .transition()
          .duration(1000)
          .attr("fill", feature => {
            return colorScale(feature.coronaData["cases"])
          })
          .attr("d", feature => pathGenerator(feature));

      svg.selectAll('.label')
          .data([selectedCountry])
          .join("text")
          .attr("class", "label")
          .text(feature => feature && feature.properties.SOVEREIGNT + ":" + feature.coronaData["cases"])
          .attr("x", 10)
          .attr("y", 25);
    }
    
  }, [data, selectedCountry, coronaData]);

  return (
    <div style={{ marginBottom: "2rem" }}>
      <svg ref={svgRef}></svg>
    </div>
  )
}

export default GeoMap;