import React from 'react';
import './App.css';



function keskiarvo(max, min){
  return(
    ((max+min)/2).toFixed(1)
  )
}

function fastestMoFo(items){
  var asteroids = []

  for (let index = 0; index < items.length; index++) {
    asteroids.push(
      [items[index].close_approach_data[0].relative_velocity.kilometers_per_second,
      items[index].name
      ]
      )
    asteroids.sort((a, b) => a[0] - b[0])
  }
  asteroids.reverse()
  return(
    asteroids[0]
  )
}

function formatDate(date) {
  var d = new Date(date),
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear();

  if (month.length < 2) 
      month = '0' + month;
  if (day.length < 2) 
      day = '0' + day;

  return( [year, month, day].join('-'));
}


var pvm = formatDate(new Date())
var address = "https://api.nasa.gov/neo/rest/v1/feed?start_date=" + pvm + "&api_key=" + process.env.REACT_APP_API_KEY

class App extends React.Component {

  constructor(){
    super();
    this.state = {
      error: null,
      isLoaded: false,
      items: []
    };
  }



  componentDidMount() {
    fetch(address)
      .then(res => res.json())
      .then(
        (result) => {
          this.setState({
            isLoaded: true,
            items: result.near_earth_objects[pvm].sort((a, b) => a.close_approach_data[0].epoch_date_close_approach - b.close_approach_data[0].epoch_date_close_approach)
          });
        },
        (error) => {
          this.setState({
            isLoaded: true,
            error
          });
        }
      )
  }
  


render(){
  const { error, isLoaded, items } = this.state;
  if (error) {
    return <div>Error: {error.message}</div>;
  } else if (!isLoaded) {
    return <div>Loading...</div>;
  } else {
    return (
    <>
      <h1>ASTEROIDIUUTISET {new Date().toLocaleDateString()}</h1>
      <h2>Päivän nopein asteroidi: {fastestMoFo(items)[1].substr(1).slice(0, -1)}, nopeus {parseFloat(fastestMoFo(items)[0]).toFixed(0)} km/s</h2>
      <table>
        <thead>
          <tr>
          <th>Nimi</th>
          <th>Halkaisija (m)</th>
          <th>Ohitusetäisyys (km)</th>
          <th>Ohitusetäisyys (kuun etäisyyttä maasta)</th>
          <th>Ohitusaika</th>
          </tr>
        </thead>
        <tbody>
          {items.map(item => (
            <tr key={item.name}>
              <td><b>{item.name.substr(1).slice(0, -1)}</b></td>
              <td>{keskiarvo(item.estimated_diameter.meters.estimated_diameter_min, item.estimated_diameter.meters.estimated_diameter_max)}</td>
              <td>{parseFloat(item.close_approach_data[0].miss_distance.kilometers).toFixed(0)}</td>
              <td>{parseFloat(item.close_approach_data[0].miss_distance.lunar).toFixed(1)}</td>
              <td>{String(new Date(item.close_approach_data[0].epoch_date_close_approach).toLocaleDateString())} klo: {String(new Date(item.close_approach_data[0].epoch_date_close_approach).toLocaleTimeString())}</td>
            </tr>
          ))}
          </tbody>
      </table>
      </>
    );
  }
}
}

export default App;
