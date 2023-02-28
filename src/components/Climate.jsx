import React from 'react';
import axios from 'axios';
import { ResponsiveContainer, ComposedChart, Bar, Cell, Brush, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, Legend } from 'recharts';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';

import { MultiSelect } from 'react-multi-select-component';

import { Temperature } from './Temperature';



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
                    climatology: '45a41685-5be5-4da1-ac97-1c9bb74eacf1',
                    temperature: 'c13119ab-750a-4c18-a146-8e9a477088fc',
                    data: [],
                    climatology_color: '#ccc',
                    temperature_color: '#999'

                },
                {
                    label: 'Berkeley Avg',
                    value: 'avg',
                    climatology: 'bae363f7-1318-43d8-9d96-dc4aac27fc7b',
                    temperature: '66da171e-be57-4f16-aee2-0d86a6b69dd5',
                    data: [],
                    climatology_color: '#666',
                    temperature_color: '#f43f5e'
                },
                {
                    label: 'Berkeley Min',
                    value: 'min',
                    climatology: '1aba7d74-20a5-4d95-9d09-795fa0f6bf41',
                    temperature: '036d381a-911d-4f6a-8964-920646bbe557',
                    data: [],
                    climatology_color: '#ccc',
                    temperature_color: '#999'
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
            ],
            data: [],
            precip_data: [],
            lat: 30.0444196,
            lon: 31.2357116,
            rounded_lat: undefined,
            rounded_lon: undefined,
            loading: true,
            center: [-6.559482, 22.937506],
            modal: false,
            precip_gradient: [
                'rgb(254,254,216)', // 0
                'rgb(193,232,183)', // 1
                'rgb(112,200,190)', // 2
                'rgb(49,170,195)', // 3
                'rgb(25,117,179)', // 4
                'rgb(27,97,171)', // 5
                'rgb(21,40,130)', // 6
                'rgb(2,21,86)', // 7
                'rgb(0,0,0)' // 8
            ]

            
        }
        this.citySelectRef = React.createRef();
        
    }
    

    componentDidMount() {

        let self = this;

        let position = window.location.search;
        position = position.replace('?position=', '');

        if(position.includes(',')) {
            let lat = parseFloat(position.split(',')[0]);
            let lon = parseFloat(position.split(',')[1]);
            self.setState({lat: lat, lon: lon}, () => 
            {
                console.log(self.state.lat, self.state.lon)

                self.getData();
                self.getPrecipData();
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

               
                

                self.setState(
                    {
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
                // get the maximum precipitation value
                let max_precip = 0;
                data.forEach((entry) => {
                    if(entry.precip > max_precip) max_precip = entry.precip;
                }
                )
                console.log(max_precip);
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

    getBarColor(entry) {

        let self = this;

        return self.state.precip_gradient[Math.floor(entry.precip)];
        
    
    }


    

    






   
        

    render() {
        return (<>

            

        <Container>

            <Row className="mt-4">
                <Col md={6}>
                    <Card className="h-100">
                        <Card.Body>
                            <Card.Title>{window.location.search.replace('?position=','')}</Card.Title>
                        </Card.Body>
                    </Card>    
                </Col>
                
                <Col>
                    <Temperature data={this.state.data} type="avg" />
                </Col>
                
                
            </Row>

            <Row className="my-4">
                <Col>
                   
                    <MultiSelect
                        options={this.state.datasets.filter((dataset) => {return dataset.value != 'precip'}).map((dataset) => { return {label: dataset.label, value: dataset.value} })}
                        value={this.state.selected_datasets}
                        onChange={this.selectDatasets}
                        labelledBy="Select"
                    />
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

                                        {/* domain = min of  */}

                                        <YAxis yAxisId="left" orientation="left" stroke="#99b3bb" domain={[0,25]}/>
                                        
                                        
                                        <CartesianGrid strokeDasharray="1 1"/>
                                        {/* <Legend onClick={this.legendClick} /> */}

                                        <Tooltip/>

                                        
                                        {this.state.selected_datasets.length > 0 && this.state.selected_datasets.map((dataset, index) =>
                                                
                                                <>
                                                    <Line isAnimationActive={false} key={'cli-' + index + '-' + dataset.value} type="monotone" yAxisId="left" dot={false} dataKey={'climatology_' + dataset.value} strokeWidth={2} stroke={this.state.datasets.find(d => d.value == dataset.value).climatology_color}/>
                                                    <Line isAnimationActive={false} key={'temp-' + index + '-' + dataset.value} type="monotone" yAxisId="left" dot={false} dataKey={'calculated_temp_' + dataset.value} dashArray={4} strokeWidth={2} stroke={this.state.datasets.find(d => d.value == dataset.value).temperature_color}/>
                                                </>
                                        )}   
                                            
                                        {this.state.selected_datasets.length > 0 &&
                                            <Brush data={this.state.datasets.find((d) => d.value == this.state.selected_datasets[0].value).data} dataKey="date" height={30} stroke="#8eb4bf"/>
                                        }
                                    </ComposedChart>
                                </ResponsiveContainer>
                            }
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Row className="my-4">
                <Col>
                    <Card>
                        <Card.Body>
                        
                            <table className="precip-table">
                                <tbody>
                                    <tr>
                                    {
                                        this.state.precip_data.map((record, index) => {
                                            return (<td key={index} style={{backgroundColor: this.getBarColor(record)}}>
                                                
                                                <OverlayTrigger
                                                    key={'tooltip-' + index}
                                                    placement="top"
                                                    overlay={
                                                        <Tooltip>{record.precip}</Tooltip>
                                                    }
                                                    >
                                                    <div className="h-100"></div>
                                                </OverlayTrigger>

                                            </td>)
                                        })
                                    }
                                    </tr>
                                    <tr>
                                    {
                                        this.state.precip_data.map((record, index) => {
                                            return (<td key={index} className="position-relative p-0">
                                                
                                                { record.time % 2 && record.month_number == '1' ?
                                                    <div className="position-absolute precip-label">{record.month_number + '/' + record.time.slice(-2)}</div> : ''
                                                }
                                                

                                            </td>)
                                        })
                                    }
                                    </tr>
                                </tbody>
                            </table>
                            


                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            

            

            


        </Container>
        
        

       
        
        </>)
    }

}