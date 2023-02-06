import React from 'react';
import axios from 'axios';
import { ResponsiveContainer, ComposedChart, Bar, Brush, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, Legend } from 'recharts';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';


import *  as cities from '../data/100-cities.json';

export class Climate extends React.Component {


    constructor(){
        super();
        this.state = {
            datasets: {
                climatology_max: 'd70ef6de-1eda-42c9-bde1-23c6c177db23',
                temperature_max: 'c585164d-15f4-49e5-9be8-176f11f818bc',
                climatology_avg: 'c290ed98-5cf4-4ecf-abaa-4d4f212c28b2',
                temperature_avg: '00820415-edd5-41a1-9ad1-657b6c117f90',
            },
            current_dataset: 'max',
            lat: 30.0444196,
            long: 31.2357116,
            rounded_lat: undefined,
            rounded_long: undefined,
            selected_year: 2010,
            data: [],
            data_work: {
                climatology_max: [],
                temperature_max: [],
                climatology_avg: [],
                temperature_avg: []
            },
            loading: true,
            show_climatology: true,
            show_calculated_temp: true,
        }
        this.citySelectRef = React.createRef();
        
    }
    useLocation = () => {
        if (window.navigator.geolocation) {
            window.navigator.geolocation.getCurrentPosition((position) => {
                this.setState({lat: position.coords.latitude, long: position.coords.longitude}, () => {
                    this.getLocationData();
                    this.citySelectRef.current.value = 'location';
                })
            })
        } 
    }

    componentDidMount() {

        this.getLocationData();
        
    }

    

    fromDecimalYear = (num) => {
        let year = parseInt(num);
        let yearStart = new Date(year, 0, 1);
        let daysInYear = Math.round((new Date(year + 1, 0, 1) - yearStart) / 8.64e7);
        let dayNum = Math.round((num - year) * daysInYear)
        yearStart.setDate(1 + dayNum);
        return yearStart;
    }
    
    changeLocation = (lat, long) => {
        this.setState({lat: lat, long: long, loading: true}, () => {
            this.getLocationData();
        })
    }

    changeDataset = (dataset) => {
        this.setState({current_dataset: dataset}, () => {
            this.getLocationData();
        })
    }

    legendClick = (e) => {
        if (e.dataKey === 'climatology') {
            this.setState({show_climatology: !this.state.show_climatology})
        } else if (e.dataKey === 'calculated_temp') {
            this.setState({show_calculated_temp: !this.state.show_calculated_temp})
        }
    }




    getLocationData = () => {

        let self = this;

        self.setState({
            data: [],
            data_work: {
                climatology_max: [],
                temperature_max: [],
                climatology_avg: [],
                temperature_avg: []
            }
        }, () => {

            let current_climatology_dataset = 'climatology_' + self.state.current_dataset;

            axios.get('https://ckandev.africadatahub.org/api/3/action/datastore_search_sql?sql=SELECT%20*%20from%20"' + self.state.datasets[current_climatology_dataset] + '"%20WHERE%20latitude%20%3E%20' + (self.state.lat - 0.5) + '%20AND%20latitude%20%3C%20' + (self.state.lat + 0.5) + '%20AND%20longitude%20%3E%20' + (self.state.long - 0.5) + '%20AND%20longitude%20%3C%20' + (self.state.long + 0.5) + '%20',
                { headers: {
                    "Authorization": process.env.CKAN
                }
            }).then(function(response) {

                let data_work = self.state.data_work;

                data_work[current_climatology_dataset] = response.data.result.records;

                self.setState({
                    data_work: data_work,
                    rounded_lat: response.data.result.records[0].latitude,
                    rounded_long: response.data.result.records[0].longitude
                }, () => {

                    let current_temperature_dataset = 'temperature_' + self.state.current_dataset;

                    axios.get('https://ckandev.africadatahub.org/api/3/action/datastore_search_sql?sql=SELECT%20*%20from%20"' + self.state.datasets[current_temperature_dataset] + '"%20WHERE%20latitude%20%3E%20' + (self.state.lat - 0.5) + '%20AND%20latitude%20%3C%20' + (self.state.lat + 0.5) + '%20AND%20longitude%20%3E%20' + (self.state.long - 0.5) + '%20AND%20longitude%20%3C%20' + (self.state.long + 0.5) + '%20',
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

                            let climatology = data_work[current_climatology_dataset].filter((clim) => {
                                return clim.month_number == record.month_number;
                            })

                            record.climatology = Math.round(climatology[0].climatology * 100) / 100;

                            record.temperature = Math.round(record.temperature * 100) / 100;

                            record.calculated_temp = parseFloat(record.climatology) + parseFloat(record.temperature);

                            record.calculated_temp = Math.round(record.calculated_temp * 100) / 100;
                        
                        })

                        self.setState({
                            data: this_data,
                            loading: false
                        })


                        
                    })
                    
                })

                
            }).catch(function(error) {
                console.log(error);
            })

        })

        
    }
        

    render() {
        return (<>

        <Container>
            <Row className="my-4">
                <Col>
                    <Form.Select onChange={(e) => this.changeDataset(e.target.value)}>
                        <option value="max">Berkeley TMAX</option>
                        <option value="avg">Berkeley TAVG</option>
                    </Form.Select>
                </Col>
                <Col>
                    <Form.Select ref={this.citySelectRef} onChange={(e) => this.changeLocation(cities[e.target.value].Latitude, cities[e.target.value].Longitude)}>
                        {cities.map((city, index) => {
                            return <option key={'c'+index} value={index}>{city.City}</option>
                        })}
                        <option value="location">Your Location</option>
                    </Form.Select>
                </Col>
                <Col>
                    <Form.Control type="text" value={this.state.lat} onChange={(e) => this.changeLocation(e.target.value,this.state.long)} />
                </Col>
                <Col>
                    <Form.Control type="text" value={this.state.long} onChange={(e) => this.changeLocation(this.state.lat,e.target.value,)} />
                </Col>
                <Col>
                    <div className="d-grid gap-2">
                        <Button onClick={() => this.useLocation()}>Use my location</Button>
                    </div>
                </Col>
            </Row>                            


            <Row>
                <Col>
                    <Card>
                        <Card.Body>
                            <p>Looking at data between: {this.state.rounded_lat} and {this.state.rounded_long}</p>

                            {this.state.loading ? <p>Loading...</p> :
                                <ResponsiveContainer width="100%" height={400}>
                                    <ComposedChart data={this.state.data} margin={{top: 20, right: 0, bottom: 0, left: 0}}>
                                        <XAxis dataKey="date"/>

                                        <YAxis yAxisId="left" orientation="left" stroke="#99b3bb" domain={[0,40]}/>
                                        
                                        {/* <ReferenceLine y={0} yAxisId="left" stroke="red" label="0%" strokeDasharray="3 3" /> */}
                                        
                                        <CartesianGrid strokeDasharray="1 1"/>
                                        <Legend onClick={this.legendClick} />

                                        <Tooltip/>
                                        
                                            <Line strokeOpacity={this.state.show_climatology ? 1 : 0} strokeDasharray="4" type="monotone" yAxisId="left" dot={false} dataKey="climatology" strokeWidth={2} stroke="#089fd1" />
                                        
                                        
                                            <Line strokeOpacity={this.state.show_calculated_temp ? 1 : 0} type="monotone" yAxisId="left" dot={false} dataKey="calculated_temp" strokeWidth={2}  stroke="#f00" />
                                        
                                        <Brush dataKey="date" height={30} stroke="#8eb4bf" />
                                    </ComposedChart>
                                </ResponsiveContainer>
                            }
                        </Card.Body>
                    </Card>
                </Col>
            </Row>


        </Container>
        
        

       
        
        </>)
    }

}