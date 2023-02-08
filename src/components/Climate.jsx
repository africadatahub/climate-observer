import React from 'react';
import axios from 'axios';
import { ResponsiveContainer, ComposedChart, Bar, Brush, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, Legend } from 'recharts';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';

import { MultiSelect } from 'react-multi-select-component';

// import { MapContainer, TileLayer, useMap, Marker, Popup, Tooltip, ZoomControl, Circle } from 'react-leaflet';
// import '../../node_modules/leaflet/dist/leaflet.css';

import *  as cities from '../data/100-cities.json';
// import * as locations from '../data/locations.json';

export class Climate extends React.Component {


    constructor(){
        super();
        this.state = {
            datasets: [
                {
                    label: 'Berkeley Max',
                    value: 'max',
                    climatology: 'd70ef6de-1eda-42c9-bde1-23c6c177db23',
                    temperature: 'c585164d-15f4-49e5-9be8-176f11f818bc',
                    data: [],
                    climatology_color: '#f36c60',
                    temperature_color: '#e51c23'

                },
                {
                    label: 'Berkeley Avg',
                    value: 'avg',
                    climatology: 'c290ed98-5cf4-4ecf-abaa-4d4f212c28b2',
                    temperature: '00820415-edd5-41a1-9ad1-657b6c117f90',
                    data: [],
                    climatology_color: '#FBC02D',
                    temperature_color: '#F57F17'
                },
                {
                    label: 'Berkeley Min',
                    value: 'min',
                    climatology: 'ee6fa004-3ad7-466f-82dc-51ad341e9b49',
                    temperature: '879fb06b-691a-4825-b1fb-33d0d09e430c',
                    data: [],
                    climatology_color: '#90caf9',
                    temperature_color: '#2196f3'
                },
                {
                    label: 'GPCC Precipitation',
                    value: 'precip',
                    precipitation: '2f0d9cbc-f53a-41d1-8f93-67c339fd9068',
                    data: [],
                    precipitation_color: '#ccc'
                }   
            ],
            selected_datasets: [
                {
                    label: 'Berkeley Max',
                    value: 'max',
                },
                {
                    label: 'Berkeley Avg',
                    value: 'avg',
                },
                {
                    label: 'Berkeley Min',
                    value: 'min',
                },
            ],
            data: [],
            lat: 30.0444196,
            long: 31.2357116,
            rounded_lat: undefined,
            rounded_long: undefined,
            loading: true,
            center: [-6.559482, 22.937506],
            modal: false,
            
        }
        this.citySelectRef = React.createRef();
        
    }
    

    componentDidMount() {

        this.getData();
        
    }

    useLocation = () => {
        if (window.navigator.geolocation) {
            window.navigator.geolocation.getCurrentPosition((position) => {
                this.setState({lat: position.coords.latitude, long: position.coords.longitude}, () => {
                    this.getData();
                    this.citySelectRef.current.value = 'location';
                })
            })
        } 
    }

    selectDatasets = (selected_datasets) => {
        this.setState({selected_datasets: selected_datasets}, () => {
            this.getData();
        })
    }


    

   
    
    changeLocation = (city) => {

        if(city == 'location') return this.useLocation();

        let lat = cities[city].Latitude;
        let long = cities[city].Longitude;

        this.setState({lat: lat, long: long, loading: true}, () => {
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

    numberToWord = (number) => {
    
        // array of 1 to a hundred in words ['first','second','third',...]

        let number_words = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth', 'eleventh', 'twelfth', 'thirteenth', 'fourteenth', 'fifteenth', 'sixteenth', 'seventeenth', 'eighteenth', 'nineteenth', 'twentieth', 'twenty first', 'twenty second', 'twenty third', 'twenty fourth', 'twenty fifth', 'twenty sixth', 'twenty seventh', 'twenty eighth', 'twenty ninth', 'thirtieth', 'thirty first', 'thirty second', 'thirty third', 'thirty fourth', 'thirty fifth', 'thirty sixth', 'thirty seventh', 'thirty eighth', 'thirty ninth', 'fortieth', 'forty first', 'forty second', 'forty third', 'forty fourth', 'forty fifth', 'forty sixth', 'forty seventh', 'forty eighth', 'forty ninth', 'fiftieth', 'fifty first', 'fifty second', 'fifty third', 'fifty fourth', 'fifty fifth', 'fifty sixth', 'fifty seventh', 'fifty eighth', 'fifty ninth', 'sixtieth', 'sixty first', 'sixty second', 'sixty third', 'sixty fourth', 'sixty fifth', 'sixty sixth', 'sixty seventh', 'sixty eighth', 'sixty ninth', 'seventieth', 'seventy first', 'seventy second', 'seventy third', 'seventy fourth', 'seventy fifth', 'seventy sixth', 'seventy seventh', 'seventy eighth', 'seventy ninth', 'eightieth', 'eighty first', 'eighty second', 'eighty third', 'eighty fourth', 'eighty fifth', 'eighty sixth', 'eighty seventh', 'eighty eighth', 'eighty ninth', 'ninetieth', 'ninety first', 'ninety second', 'ninety third', 'ninety fourth', 'ninety fifth', 'ninety sixth', 'ninety seventh', 'ninety eighth', 'ninety ninth', 'hundredth'];

        return number_words[number - 1];
        

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
                } else if(dataset.value == 'precip') {
                    promises.push(self.getGPCCData(dataset));
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

                self.setState(
                    {
                        data: finalData, 
                        rounded_lat: data[0].latitude,
                        rounded_long: data[0].longitude,
                        loading: false
                    }, () => {
                    console.log(self.state.data);
                })



            })
        
        })
        
    
    }

    getGPCCData = (dataset) => {

        let self = this;

        return new Promise(function(resolve, reject) {

            let current_dataset = self.state.datasets.find((d) => d.value == dataset.value);

            let current_precipitation_dataset = current_dataset.precipitation;

            axios.get('https://ckandev.africadatahub.org/api/3/action/datastore_search_sql?sql=SELECT%20*%20from%20"' + current_precipitation_dataset + '"%20WHERE%20latitude%20%3E%20' + (self.state.lat - 0.5) + '%20AND%20latitude%20%3C%20' + (self.state.lat + 0.5) + '%20AND%20longitude%20%3E%20' + (self.state.long - 0.5) + '%20AND%20longitude%20%3C%20' + (self.state.long + 0.5) + '%20',
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

            axios.get('https://ckandev.africadatahub.org/api/3/action/datastore_search_sql?sql=SELECT%20*%20from%20"' + current_climatology_dataset + '"%20WHERE%20latitude%20%3E%20' + (self.state.lat - 0.5) + '%20AND%20latitude%20%3C%20' + (self.state.lat + 0.5) + '%20AND%20longitude%20%3E%20' + (self.state.long - 0.5) + '%20AND%20longitude%20%3C%20' + (self.state.long + 0.5) + '%20',
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

                    axios.get('https://ckandev.africadatahub.org/api/3/action/datastore_search_sql?sql=SELECT%20*%20from%20"' + current_temperature_dataset + '"%20WHERE%20latitude%20%3E%20' + (self.state.lat - 0.5) + '%20AND%20latitude%20%3C%20' + (self.state.lat + 0.5) + '%20AND%20longitude%20%3E%20' + (self.state.long - 0.5) + '%20AND%20longitude%20%3C%20' + (self.state.long + 0.5) + '%20',
                        { headers: {
                            "Authorization": process.env.CKAN
                        }
                    }).then(function(response) {

                        let this_data = response.data.result.records;

                        this_data.forEach((record) => {

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
                        
                        })

                        datasets = self.state.datasets;

                        datasets[datasets.indexOf(current_dataset)].data = this_data;

                        resolve(this_data);
                    
                    })
                
                })

            })

        })

       

    }





   
        

    render() {
        return (<>

            <Modal show={this.state.modal} onHide={() => this.setState({modal: !this.state.modal})}>
                <Modal.Header closeButton>
                    <Modal.Title>Use Custom Location</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Row>
                        <Col>
                            <Form.Control type="text" value={this.state.lat} onChange={(e) => this.changeLocation(e.target.value, this.state.long)} className="h-100"/>
                        </Col>
                        <Col>
                            <Form.Control type="text" value={this.state.long} onChange={(e) => this.changeLocation(this.state.lat, e.target.value)} className="h-100"/>
                        </Col>
                    </Row>
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={() => this.useLocation()}>Use My Location</Button>
                </Modal.Footer>
            </Modal>

        <Container>

            <Row className="my-4">
                <Col>
                   
                    <MultiSelect
                        options={this.state.datasets.map((dataset) => { return {label: dataset.label, value: dataset.value} })}
                        value={this.state.selected_datasets}
                        onChange={this.selectDatasets}
                        labelledBy="Select"
                    />
                </Col>
                <Col xs={2}>
                    <Form.Select ref={this.citySelectRef} onChange={(e) => this.changeLocation(e.target.value)} className="h-100">
                        {cities.map((city, index) => {
                            return <option key={'c'+index} value={index}>{index + 1 + '. ' + city.City}</option>
                        })}
                        <option value="location">Your Location</option>
                    </Form.Select>
                </Col>
                    
                <Col>
                </Col>
                
                <Col xs={2}>
                    <div className="d-grid gap-2 h-100">
                        <Button onClick={() => this.setState({modal: !this.state.modal})}>Use Custom Location</Button>
                    </div>
                </Col>
            </Row>                            


            <Row>
                <Col>
                    <Card>
                        <Card.Body>
                            {this.state.loading ? <p>Loading...</p> :
                                <ResponsiveContainer width="100%" height={400}>
                                    <ComposedChart data={this.state.data} margin={{top: 20, right: 0, bottom: 0, left: 0}}>
                                        
                                        <XAxis dataKey="date"/>

                                        <YAxis yAxisId="left" orientation="left" stroke="#99b3bb" domain={[0,40]}/>
                                        <YAxis yAxisId="right" orientation="right" stroke="#99b3bb" domain={[0,5]}/>
                                        
                                        {/* <ReferenceLine y={0} yAxisId="left" stroke="red" label="0%" strokeDasharray="3 3" /> */}
                                        
                                        <CartesianGrid strokeDasharray="1 1"/>
                                        {/* <Legend onClick={this.legendClick} /> */}

                                        <Tooltip/>

                                        
                                        {this.state.selected_datasets.map((dataset, index) =>
                                            dataset.value == 'precip' ?
                                                <Bar isAnimationActive={false} key={'precip-' + index} yAxisId="right" dataKey='precip' fill={this.state.datasets.find(d => d.value == dataset.value).precipitation_color}/>
                                            :
                                                <>
                                                    <Line isAnimationActive={false} strokeDasharray="4" key={'cli-' + index + '-' + dataset.value} type="monotone" yAxisId="left" dot={false} dataKey={'climatology_' + dataset.value} strokeWidth={2} stroke={this.state.datasets.find(d => d.value == dataset.value).climatology_color}/>
                                                    <Line isAnimationActive={false} key={'temp-' + index + '-' + dataset.value} type="monotone" yAxisId="left" dot={false} dataKey={'calculated_temp_' + dataset.value} strokeWidth={2} stroke={this.state.datasets.find(d => d.value == dataset.value).temperature_color}/>
                                                </>
                                        )}   
                                            

                                        <Brush data={this.state.datasets.find((d) => d.value == this.state.selected_datasets[0].value).data} dataKey="date" height={30} stroke="#8eb4bf" />
                                    </ComposedChart>
                                </ResponsiveContainer>
                            }
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Row className="mt-4">
                <Col>
                    <Card className="p-4">
                        <Card.Body>
                            {(this.citySelectRef.current != undefined && this.citySelectRef.current.value != 'location') &&
                            <>
                                <h3><strong>{cities.find((city,index) => index == this.citySelectRef.current.value).City}</strong>, <span className="fs-5">{cities.find((city,index) => index == this.citySelectRef.current.value).Country}</span></h3>
                                <h5>It is the <strong>{this.numberToWord(cities.find((city,index) => index == this.citySelectRef.current.value).Rank)}</strong> most populous city in Africa with <strong>{cities.find((city,index) => index == this.citySelectRef.current.value).Population.toLocaleString()}</strong> people.</h5>
                                <p>{cities.find((city,index) => index == this.citySelectRef.current.value)["Date of estimate"].split('[')[0]} estimate</p>
                            </>}
                            {(this.citySelectRef.current != undefined && this.citySelectRef.current.value == 'location') &&
                            <>
                                <h3>Your Location</h3>
                                <h5>Closest data point is: {this.state.rounded_lat} and {this.state.rounded_long}</h5>
                            </>
                            }
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            


        </Container>
        
        

       
        
        </>)
    }

}