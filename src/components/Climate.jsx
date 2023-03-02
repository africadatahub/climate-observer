import React from 'react';
import axios from 'axios';
import { ResponsiveContainer, ComposedChart, Area, Brush, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, Legend } from 'recharts';

import '../../node_modules/react-vis/dist/style.css';
import { XYPlot, XAxis, YAxis, VerticalGridLines, HorizontalGridLines, LineMarkSeries, LineSeries, AreaSeries, Hint, GradientDefs, HeatmapSeries, LabelSeries, } from 'react-vis';

import { interpolateYlGnBu } from 'd3-scale-chromatic';

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import Table from 'react-bootstrap/Table';

import getCountryISO2 from 'country-iso-3-to-2';
import ReactCountryFlag from 'react-country-flag';

import { Icon } from '@mdi/react';
import { mdiThermometer, mdiWeatherPouring } from '@mdi/js';

import { MultiSelect } from 'react-multi-select-component';




// import { Temperature } from './Temperature';

// import CalHeatmap from 'cal-heatmap/dist/cal-heatmap.js';
// import Tooltip from 'cal-heatmap/dist/plugins/Tooltip.min.esm.js';
// import 'cal-heatmap/dist/cal-heatmap.css';



import * as cities from '../data/places.json';



export class Climate extends React.Component {


    constructor(){
        super();
        this.state = {
            datasets: [
                {
                    label: 'Berkeley Max',
                    value: 'max',
                    climatology: '45a41685-5be5-4da1-ac97-1c9bb74eacf1',
                    temperature: 'c13119ab-750a-4c18-a146-8e9a477088fc',
                    data: [],
                    climatology_color: '#ccc',
                    temperature_color: '#f43f5e'

                },
                {
                    label: 'Berkeley Avg',
                    value: 'avg',
                    climatology: 'bae363f7-1318-43d8-9d96-dc4aac27fc7b',
                    temperature: '66da171e-be57-4f16-aee2-0d86a6b69dd5',
                    data: [],
                    climatology_color: '#666',
                    temperature_color: '#F57F17'
                },
                {
                    label: 'Berkeley Min',
                    value: 'min',
                    climatology: '1aba7d74-20a5-4d95-9d09-795fa0f6bf41',
                    temperature: '036d381a-911d-4f6a-8964-920646bbe557',
                    data: [],
                    climatology_color: '#ccc',
                    temperature_color: '#2196f3'
                },
                {
                    label: 'GPCC Precipitation',
                    value: 'precip',
                    precipitation: '40034efe-ffa7-4094-9c33-991e2b5f6ce0',
                    data: [],
                    precipitation_color: '#ccc'
                }   
            ],
            selected_datasets: [
                {
                    label: 'Berkeley Avg',
                    value: 'avg',
                },
                {
                    label: 'Berkeley Max',
                    value: 'max',
                },
                {
                    label: 'Berkeley Min',
                    value: 'min',
                },
                
            ],
            position_details: {},
            data: [],
            precip_data: [],
            climate_data: [],
            lat: 30.0444196,
            lon: 31.2357116,
            rounded_lat: undefined,
            rounded_lon: undefined,
            loading: true,
            center: [-6.559482, 22.937506],
            modal: false,
            options: {},
            hint_value: null

            
        }
        this.citySelectRef = React.createRef();
        
    }
    

    componentDidMount() {

        let self = this;

        if(window.location.search.includes('position=')) {

            let position = window.location.search;
            position = position.replace('?position=', '');

            if(position.includes(',')) {
                let lat = parseFloat(position.split(',')[0]);
                let lon = parseFloat(position.split(',')[1]);
                self.setState({lat: lat, lon: lon}, () => 
                {
                    self.getData();
                    self.getPrecipData();
                })
            }
        } else if(window.location.search.includes('city=')) {
            
            let city = window.location.search;
            city = city.replace('?city=', '').replace('-',' ');

            let city_data = cities.find(c => c.city.toLowerCase() === city.toLowerCase());

            if(city_data) {

                let positions_details = {
                    place: city_data.city,
                    country: city_data.country,
                    iso_code: city_data.iso_code,
                }

                self.setState({lat: city_data.lat, lon: city_data.lon, position_details: positions_details}, () => 
                {
                    self.getData();
                    self.getPrecipData();
                })
            }
            
        }

        
    }

    getPositionInformation = () => {
        let self = this;

        let lat = self.state.lat;
        let lon = self.state.lon;

        axios.get('http://localhost:3000/')
        .then(response => {
            console.log(response);
        })


        // find the closest city or town to the lat/lon from wikidata
        axios.get('http://localhost:3000/wikidata', {
            params: {
              query: `
              SELECT DISTINCT ?iso_code WHERE {
                SERVICE wikibase:around {
                  ?place wdt:P625 ?location .
                  bd:serviceParam wikibase:center "Point(${lon} ${lat})"^^geo:wktLiteral .
                  bd:serviceParam wikibase:radius "100" .
                }
                ?place wdt:P17 ?country .
                ?country wdt:P298 ?iso_code .
              } LIMIT 1
              `
            },
            headers: {
              'Accept': 'application/sparql-results+json'
            }
          })
          .then(response => {
            console.log(response.data.results.bindings[0].iso_code);
            })







        // axios.get('http://localhost:3000/wikidata', {
        //     params: {
        //         action: 'query',
        //         format: 'json',
        //         list: 'geosearch',
        //         gscoord: `${lat}|${lon}`,
        //         gsradius: 10000,
        //         gslimit: 1,
        //         utf8: 1,
        //         formatversion: 2
        //     }
        //     })
        //     .then(response => {
        //         console.log(response);
        //         const title = response.data.query.geosearch[0].title;
        //         const lat = response.data.query.geosearch[0].lat;
        //         const lon = response.data.query.geosearch[0].lon;
        //         console.log(`The city at (${lat}, ${lon}) is ${title}`);

                


        //     })
        //     .catch(error => {
        //         console.log(error);
        //     });
    
    }

   

    selectDatasets = (selected_datasets) => {
        this.setState({selected_datasets: selected_datasets}, () => {
            this.getData();
        })
    }


    

   
    
    changeLocation = (city) => {

        if(city == 'location') return this.useLocation();

        let lat = cities[city].atitude;
        let lon = cities[city].Longitude;

        this.setState({lat: lat, lon: lon, loading: true}, () => {
            this.getData();
        })
    }

    

    legendClick = (e) => {
        if (e.dataKey === 'climatology') {
            this.setState({show_climatology: !this.state.show_climatology})
        } else if (e.dataKey === 'calculated_temp') {
            this.setState({show_calculated_temp: !this.state.show_calculated_temp})
        }
    }

    getPositionDetails = (type) => {
    
        let self = this;

        if(type == 'country_code') {
            if(self.state.position_details.place) {
                return getCountryISO2(self.state.position_details.iso_code);
            } else {
                return self.props.positionDetails.country_code;
            }
        }

        if(type) {
            if(self.state.position_details.place) {
                return self.state.position_details[type];
            } else {
                return self.props.positionDetails[type];
            }


        } else {

            if(self.state.position_details.place) {
                return self.state.position_details.place + ', ' + self.state.position_details.country;
            } else {
                return self.props.positionDetails.county + ', ' + self.props.positionDetails.country;
            }
        }
    
    }

    


    getData = () => {

        let self = this;

        self.setState({data: [], loading: true}, () => {

            let data = [];

            let finalData = [];

            let promises = [];

            self.state.selected_datasets.forEach((dataset) => {
                if(dataset.value == 'max' || dataset.value == 'avg' || dataset.value == 'min') {
                    promises.push(self.getBerkeleyData(dataset));
                }
            })

            Promise.all(promises).then((results) => {

                results.forEach((result) => {
                    data = data.concat(result);
                })

                data.forEach((entry) => {
                    let existing_entry = finalData.find((e) => e.latitude == entry.latitude && e.longitude == entry.longitude && e.date == entry.date);
                    if(existing_entry) {
                        Object.assign(existing_entry, entry);
                    } else {
                        finalData.push(entry);
                    }
                
                })

                finalData = finalData.filter((entry) => entry.x && entry.y && entry.y0);


                let avgData = [];

                finalData.forEach((entry) => {
                    avgData.push(Object.assign({}, entry));
                })

                avgData.forEach((entry) => {
                    entry.y = entry.calculated_temp_avg;
                })
                

                self.setState(
                    {
                        data2: avgData,
                        data: finalData, 
                        rounded_lat: data[0].latitude,
                        rounded_lon: data[0].longitude,
                        loading: false
                    }, () => {

 
                })



            })
        
        })
        
    
    }

    getPrecipData = () => {
        let self= this;

        self.getGPCCData(self.state.datasets.find(dataset => dataset.value == 'precip')).then((data) => {

            self.setState({precip_data: data}, () => {


                // console.log(data);
                // console.log(data.map((d) => [d.precip]));
                
                // const cal = new CalHeatmap();
                // cal.paint(
                //     {
                //         date: { start: new Date('1993-01-01') },
                //         range: 30,
                //         domain: {
                //             type: 'year',	
                //         },
                //         subDomain: {
                //             type: 'month',
                //             width: 3,
                //             height: 50,
                //             gutter: 0
                //         },
                //         scale: { color: { type: 'linear', scheme: 'GnBu', domain: [0, 10] } },
                //         data: {
                //             source: data,
                //             x: datum => {
                //                 return +new Date(datum['time'], datum['month_number'] - 1, 1);
                //             },
                //             y: datum => {
                //                 return datum['precip'];
                //             },
                //         },
                //     },
                //     [
                //         [
                //           Tooltip,
                //           {
                //             text: function (date, value, dayjsDate) {
                //                 return (
                //                   (value ? value + 'mm' : 'No data') + ' on ' + dayjsDate.format('MMM YYYY')
                //                 );
                //               },
                //           },
                //         ]
                //     ]
                    
                // );
                
            })

        })
    }

            



    getGPCCData = (dataset) => {

        let self = this;

        return new Promise(function(resolve, reject) {

            let current_dataset = self.state.datasets.find((d) => d.value == dataset.value);

            let current_precipitation_dataset = current_dataset.precipitation;

            axios.get('https://ckandev.africadatahub.org/api/3/action/datastore_search_sql?sql=SELECT%20*%20from%20"' + current_precipitation_dataset + '"%20WHERE%20latitude%20%3E%20' + (self.state.lat - 0.5) + '%20AND%20latitude%20%3C%20' + (self.state.lat + 0.5) + '%20AND%20longitude%20%3E%20' + (self.state.lon - 0.5) + '%20AND%20longitude%20%3C%20' + (self.state.lon + 0.5) + '%20',
                { headers: {
                    "Authorization": process.env.CKAN
                }
            }).then(function(response) {

                response.data.result.records.forEach((record) => {
                    record.date = record.month_number + '/' + record.time;
                    record.precip = Math.round(record.precip * 100) / 100;
                })

                let datasets = self.state.datasets;

                datasets[datasets.indexOf(current_dataset)].data = response.data.result.records;

                self.setState({datasets: datasets}, () => {
                    resolve(response.data.result.records);
                })



            })
        

        })

    }


    getBerkeleyData = (dataset) => {

        let self = this;

        return new Promise(function(resolve, reject) {

            let current_dataset = self.state.datasets.find((d) => d.value == dataset.value);

            let current_climatology_dataset = current_dataset.climatology;

            

            axios.get('https://ckandev.africadatahub.org/api/3/action/datastore_search_sql?sql=SELECT%20*%20from%20"' + current_climatology_dataset + '"%20WHERE%20latitude%20%3E%3D%20' + (self.state.lat - 0.5) + '%20AND%20latitude%20%3C%3D%20' + (self.state.lat + 0.5) + '%20AND%20longitude%20%3E%3D%20' + (self.state.lon - 0.5) + '%20AND%20longitude%20%3C%3D%20' + (self.state.lon + 0.5) + '%20',
                { headers: {
                    "Authorization": process.env.CKAN
                }
            }).then(function(response) {

                let datasets = self.state.datasets;

                datasets[datasets.indexOf(current_dataset)].data = response.data.result.records;
            
                self.setState({
                    datasets: datasets
                }, () => {

                    let current_temperature_dataset = current_dataset.temperature;

                    axios.get('https://ckandev.africadatahub.org/api/3/action/datastore_search_sql?sql=SELECT%20*%20from%20"' + current_temperature_dataset + '"%20WHERE%20latitude%20%3E%3D%20' + (self.state.lat - 0.5) + '%20AND%20latitude%20%3C%3D%20' + (self.state.lat + 0.5) + '%20AND%20longitude%20%3E%3D%20' + (self.state.lon - 0.5) + '%20AND%20longitude%20%3C%3D%20' + (self.state.lon + 0.5) + '%20',
                        { headers: {
                            "Authorization": process.env.CKAN
                        }
                    }).then(function(response) {

                        let this_data = response.data.result.records;

                        this_data.forEach((record,index) => {

                            // sort records by time
                            this_data.sort((a, b) => {
                                return a.time - b.time;
                            })

                            // split date at first .
                            let date = record.time.split('.');
                            if(date[1] == '0416666666663') {
                                date[1] = 0;
                            } else if(date[1] == '125') {
                                date[1] = 1;
                            } else if(date[1] == '2083333333333') {
                                date[1] = 2;
                            } else if(date[1] == '2916666666663') {
                                date[1] = 3;
                            } else if(date[1] == '375') {
                                date[1] = 4;
                            } else if(date[1] == '4583333333333') {
                                date[1] = 5;
                            } else if(date[1] == '5416666666663') {
                                date[1] = 6;
                            } else if(date[1] == '625') {
                                date[1] = 7;
                            } else if(date[1] == '7083333333333') {
                                date[1] = 8;
                            } else if(date[1] == '7916666666663') {
                                date[1] = 9;
                            } else if(date[1] == '875') {
                                date[1] = 10;
                            } else if(date[1] == '9583333333333') {
                                date[1] = 11;
                            }

                            record.date = (date[1] + 1) + '/' + date[0];
                            record.month_number = date[1];

                            let climatology = datasets[datasets.indexOf(current_dataset)].data.filter((clim) => {
                                return clim.month_number == record.month_number;
                            })

                            record['climatology_' + dataset.value] = Math.round(climatology[0].climatology * 100) / 100;

                            record['temperature_' + dataset.value] = Math.round(record.temperature * 100) / 100;

                            record['calculated_temp_' + dataset.value] = parseFloat(record['climatology_' + dataset.value]) + parseFloat(record.temperature);

                            record['calculated_temp_' + dataset.value] = Math.round(record['calculated_temp_' + dataset.value] * 100) / 100;
                        
                            if(dataset.value == 'max') {
                                record.y = record['calculated_temp_' + dataset.value];
                            } else if(dataset.value == 'min') {
                                record.y0 = record['calculated_temp_' + dataset.value];
                            }

                            record.x = index
                            

                        })

                        datasets = self.state.datasets;

                        datasets[datasets.indexOf(current_dataset)].data = this_data;

                        
                        resolve(this_data);
                    
                    })
                
                })

            })

        })

       

    }

    getBarColor(entry) {

        let self = this;

        return self.state.precip_gradient[Math.floor(entry.precip)];
        
    
    }

    
    toPercent = (decimal, fixed = 0) => `${(decimal * 100).toFixed(fixed)}%`;

    getPercent = (value, total) => {
        const ratio = total > 0 ? value / total : 0;
         return toPercent(ratio, 2);
    };

   
        

    render() {
        return (<>

            <Row className="mt-4">
                <Col md={5}>
                    <Card className="h-100">
                        <Card.Body className="p-4">
                            <Row>
                                <Col>
                                    <p className="fs-4 mb-0"><strong>The Africa Data Hub Climate Observer</strong> is designed to help journalists and academics reporting and researching the impact of the climate crisis in <span className="text-adh-orange"><ReactCountryFlag style={{position: 'relative', top: '-1px'}} countryCode={this.getPositionDetails('country_code')} svg /> {this.getPositionDetails('country')}</span> and Africa.</p>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                </Col>
                <Col>
                    <Card>
                        <Card.Body className="p-4">
                            <Row>
                                <Col style={{fontWeight: '300'}}>
                                    <p>Data used is taken from <a href="https://berkeleyearth.org/data/" target="_blank">Berkeley Earth</a> and Global <a href="https://www.dwd.de/EN/ourservices/gpcc/gpcc.html" target="_blank">Precipitation Climatology Centre</a>. It is based on both observations made (eg. weather stations) and modelled data based on observations (for areas where there are no monitoring stations).</p>
                                </Col>
                                <Col style={{fontWeight: '300'}}>
                                    <p>Location data is mapped to grid squares which measure <strong>1x1 degree latitude and longitude</strong>. All positions are rounded to the nearest 1x1 square.</p>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
           

            {/* <Row className="my-4">
                <Col>
                   
                    <MultiSelect
                        options={this.state.datasets.filter((dataset) => {return dataset.value != 'precip'}).map((dataset) => { return {label: dataset.label, value: dataset.value} })}
                        value={this.state.selected_datasets}
                        onChange={this.selectDatasets}
                        labelledBy="Select"
                    />
                </Col>
               
            </Row>                             */}

            
            <Row className="mt-4">
                <Col>
                    <Card>
                        <Card.Header className="py-4">
                            <Row>
                                <Col xs="auto">
                                    <Icon path={mdiThermometer} size={2} />
                                </Col>
                                <Col>
                                    <h5>Monthly Temperature for <span className="text-adh-orange">{this.getPositionDetails() }</span></h5>
                                    <p style={{fontWeight: '300'}} className="mb-0">This chart shows minimum, maximum and average temperature per month for the last 30 years. The dotted lines show the average monthly temperature for the period 1950-1980.</p>
                                </Col>
                            </Row>
                        </Card.Header>
                        <Card.Body id="chartContainer">
                            {this.state.loading ? <p>Loading...</p> :
                                <XYPlot width={document.getElementById('chartContainer').getBoundingClientRect().width - 20} height={300} onMouseLeave={() => this.setState({hint_value: null})}>
                                   <GradientDefs>
                                        <linearGradient id="CoolGradient" x1="0" x2="0" y1="0" y2="1">
                                        <stop offset="0%" stopColor="#fee2e2" stopOpacity={1}/>
                                        <stop offset="100%" stopColor="#e0f2fe" stopOpacity={1} />
                                        </linearGradient>
                                    </GradientDefs>
                                    <VerticalGridLines />
                                    <HorizontalGridLines />
                                    <XAxis />
                                    <YAxis />
                                    <AreaSeries
                                        className="area-elevated-series-1"
                                        color={'url(#CoolGradient)'}
                                        data={this.state.data}
                                        onNearestX={(value) => this.setState({hint_value: value})}
                                    />

                                    <LineSeries
                                        className="area-elevated-line-series"
                                        data={this.state.data2}
                                        color={'#155e75'}
                                    />
                                    
                                    
                                    
                                    { this.state.hint_value && (
                                        <Hint value={this.state.hint_value}>
                                            <div className="hintBox">
                                                <h6>{this.state.hint_value.date}</h6>
                                                <span style={{color: "#ef4444"}}><strong>MAX TEMP:</strong> {this.state.hint_value.y}</span><br/>
                                                <span style={{color: "#155e75"}}><strong>AVG TEMP:</strong> {this.state.hint_value.calculated_temp_avg}</span><br/>
                                                <span style={{color: "#93c5fd"}}><strong>MIN TEMP:</strong> {this.state.hint_value.y0}</span>
                                            </div>
                                                
                                        </Hint>
                                    )}
                                    
                                </XYPlot>
                                
                            }
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Row className="my-4">
                <Col>
                    <Card>
                        <Card.Header className="py-4">
                            <Row>
                                <Col xs="auto">
                                    <Icon path={mdiThermometer} size={2} />
                                </Col>
                                <Col>
                                    <h5>Average monthly temperature versus last 12 months</h5>
                                    <p style={{fontWeight: '300'}} className="mb-0">This table shows the...</p>
                                </Col>
                            </Row>
                        </Card.Header>
                        <Card.Body>
                            <Table>
                                <thead>
                                    <tr>
                                        <th>Month</th>
                                        <th>Avg</th>
                                        <th>Recent</th>
                                    </tr>
                                </thead>
                                <tbody>
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>
                </Col>
                <Col>
                    <Card>
                        <Card.Header className="py-4">
                            <Row>
                                <Col xs="auto">
                                    <Icon path={mdiWeatherPouring} size={2} />
                                </Col>
                                <Col>
                                <h5>Average monthly precipitation versus last twelve months</h5>
                                    <p style={{fontWeight: '300'}} className="mb-0">This table shows the...</p>
                                </Col>
                            </Row>
                        </Card.Header>
                        <Card.Body>
                            <Table>
                                <thead>
                                    <tr>
                                        <th>Month</th>
                                        <th>Avg</th>
                                        <th>Recent</th>
                                    </tr>
                                </thead>
                                <tbody>
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            
            <Row>
                <Col>
                    <Card>
                        <Card.Header className="py-4">
                            <Row>
                                <Col xs="auto">
                                    <Icon path={mdiWeatherPouring} size={2} />
                                </Col>
                                <Col>
                                    <h5>Monthly Precipitation for <span className="text-adh-orange">{this.getPositionDetails() }</span></h5>
                                    <p style={{fontWeight: '300'}} className="mb-0">This chart shows the...</p>
                                </Col>
                            </Row>
                            
                        </Card.Header>
                        <Card.Body>
                            {this.state.loading ? <p>Loading...</p> :
                            <XYPlot
                            width={document.getElementById('chartContainer').getBoundingClientRect().width - 20}
                            height={300}>
                                <XAxis />
                                <YAxis />
                                <HeatmapSeries
                                    colorType="literal"
                                    data={
                                        this.state.precip_data.map((d,index) => {
                                            return {x: parseInt(d.month_number), y: parseInt(d.time) , color: isNaN(d.precip) ? 0 : interpolateYlGnBu(d.precip)}
                                        })
                                    }/>
                            </XYPlot>
                            }
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        
        
        

       
        
        </>)
    }

}