import React from 'react';
import { select, geoPath, geoMercator, min, max, scaleLinear, event } from 'd3';
import axios from 'axios';

const getCoronaData = () => {
  return axios.get('https://api.covid19india.org/data.json');
};

class GeoMap extends React.Component {
  constructor(props) {
    super(props);
    
    this.state = {
      coronaData : []
    };
    this.svgRef = React.createRef();
  }

  componentDidMount() {
    getCoronaData().then((response) => {
      this.setState({
        coronaData: response.data
      });
      this.generateMap();
    }).catch((error) => {
      console.log('Failed to fetch data', error);
    })
  }

  generateMap() {
    const width = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    const height = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
    const svg = select(this.svgRef.current);
   
    console.log(this.state.coronaData);
    let features = this.props.data.features;
    

    var coronoByState = {};

    this.state.coronaData.statewise.forEach(function (d) {
      coronoByState[d.state] = {
          cases: d.active,
          recovered: d.recovered,
          deaths: d.deaths
      }
    });

    features.forEach(function (d) {
        d.coronaData = coronoByState[d.properties.NAME_1] ? 
                          coronoByState[d.properties.NAME_1] : 
                          { cases: 0, recovered: 0, deaths: 0 };
    });

    const minProp = min(features, feature => feature.coronaData["cases"]);
    const maxProp = max(features, feature => feature.coronaData["cases"]);
    const colorScale = scaleLinear().domain([0, 10000, 20000, 30000, 40000, 50000]).range(["#FFF2EB", "#FFD0B6", "#FF9C70", "#FF6E3A", "#FF0F00", "#FF0000"]);

    const projection = geoMercator().fitSize([width, height], this.props.data).precision(100);
    const pathGenerator = geoPath().projection(projection);

    select('#tooltip').style("display", "block");
    svg.attr("viewBox", [0, 0, width, height])
    svg.selectAll(".state")
        .data(features)
        .join("path")
        .on("mouseover", (feature) => {
          select('#tooltip').transition()
                            .duration(200).style('opacity', 1);

          select('.state-name').text(feature.properties.NAME_1);
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
        })
        .attr("class", "state")
        .transition()
        .duration(1000)
        .attr("stroke", "#FFBAB1")
        .attr("fill", feature => {
            return colorScale(feature.coronaData["cases"])
        })
        .attr("d", feature => pathGenerator(feature));
  }

  render() {
    return (
      <div style={{ marginBottom: "2rem" }}>
        <svg ref={this.svgRef}></svg>
      </div>
    )
  }
}

export default GeoMap;