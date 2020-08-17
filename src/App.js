import React,{ useState, useEffect } from 'react';
import {
  MenuItem,
  FormControl,
  Select,
  Card,
  CardContent
} from '@material-ui/core'
import './App.css';
import 'leaflet/dist/leaflet.css'
import { sortData, prettyPrintStat } from "./util";
import numeral from "numeral";
import InfoBox from './infobBox'
import Map from './map'
import Table from './table'
import LineGraph from './linegraph'
 
function App() {
  const [country, setInputCountry] = useState("worldwide");
  const [countries, setCountries] = useState([]);
  const [countryInfo, setCountryInfo] = useState({});
  const [tableData, setTableData] = useState([]);
  const [mapCenter, setMapCenter] = useState({ lat: 34.80746, lng: -40.4796 });
  const [mapZoom, setMapZoom] = useState(1);
  const [casesType, setCasesType] = useState("cases");
  const [mapCountries, setMapCountries] = useState([]);

  useEffect(() => {
    fetch("https://disease.sh/v3/covid-19/all")
    .then(response => response.json())
    .then(data=>{
      setCountryInfo(data);
    })
  }, [])

  useEffect(() => {
   const getCountriesData = async () =>{
     await fetch("https://disease.sh/v3/covid-19/countries")
     .then((response)=> response.json())
     .then((data)=>{
       const countries = data.map((country)=>(
         {
           name: country.country,
           value: country.countryInfo.iso2
         }
       ))

       const sortedData = sortData(data)
       setTableData(sortedData);
       setCountries(countries);
       setMapCountries(data);
       setTableData(sortedData);
     })
   }
   getCountriesData();
  }, []);

  const onCountryChange = async (event) =>{
    const countryCode = event.target.value


    const url = countryCode === 'worldwide' ? 'https://disease.sh/v3/covid-19/all' : `https://disease.sh/v3/covid-19/countries/${countryCode}`;

    await fetch(url)
    .then(response => response.json())
    .then(data => {
      setInputCountry(countryCode);
      setCountryInfo(data);
      setMapCenter([data.countryInfo.lat, data.countryInfo.long]);
      setMapZoom(4);
    })

  }

  console.log('country info', countryInfo);

  return (
    <div className="app">

      <div className="app_left">

          <div className="app_header">
            <h1>Covid 19 Tacker App</h1>
              <FormControl className="app_dropdown">
                  <Select  variant="outlined" onChange={onCountryChange}  value={country}>       
                  <MenuItem value="worldwide">Worldwide</MenuItem>
                    {countries.map((country) =>(
                      <MenuItem value={country.value}>{country.name}</MenuItem>
                    ))}
                    {/* <MenuItem value="worldwide">Worldwide</MenuItem>
                    <MenuItem value="worldwide">Option 1</MenuItem>
                    <MenuItem value="worldwide">Option 2</MenuItem>
                    <MenuItem value="worldwide">Option 3</MenuItem> */}
                  </Select>
              </FormControl>
            </div>

            <div className="app_status">
                    <InfoBox
                    onClick={(e) => setCasesType("cases")}
                    title="Coronavirus Cases"
                    isRed
                    active={casesType === "cases"}
                    cases={prettyPrintStat(countryInfo.todayCases)}
                    total={numeral(countryInfo.cases).format("0.0a")}
                  />
                  <InfoBox
                    onClick={(e) => setCasesType("recovered")}
                    title="Recovered"
                    active={casesType === "recovered"}
                    cases={prettyPrintStat(countryInfo.todayRecovered)}
                    total={numeral(countryInfo.recovered).format("0.0a")}
                  />
                  <InfoBox
                    onClick={(e) => setCasesType("deaths")}
                    title="Deaths"
                    isRed
                    active={casesType === "deaths"}
                    cases={prettyPrintStat(countryInfo.todayDeaths)}
                    total={numeral(countryInfo.deaths).format("0.0a")}
                  />
            </div>

            <div className="app_map">
                <Map
                    countries={mapCountries}
                    casesType={casesType}
                    center={mapCenter}
                    zoom={mapZoom}
                />
             </div>
      </div>
      
      <Card className="app_right">
      <CardContent>
          <div className="app__information">
            <h3>Live Cases by Country</h3>
            <Table countries={tableData} />
            <h3>Worldwide new {casesType}</h3>
            <LineGraph casesType={casesType} />
          </div>
        </CardContent>
      </Card>
      
    </div>
  );
}

export default App;
