import React from 'react';

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import getCountryISO2 from 'country-iso-3-to-2';
import ReactCountryFlag from 'react-country-flag';

import { MapContainer, GeoJSON, Tooltip, CircleMarker } from 'react-leaflet';
// import { Circle } from 'react-leaflet/Circle'
import 'leaflet/dist/leaflet.css';

import { countriesData } from '../data/africa.js';


export class Map extends React.Component {
    constructor() {
        super();
        this.state = {
            period: 10,
            max_min: 'max'
        }
    }

  



    style = (feature) => {

        let self = this;
        let color = 0;

        return {
            fillColor: '#DFE6E8',
            weight: 0.5,
            opacity: 1,
            color: '#fff',
            dashArray: '0',
            fillOpacity: 1
        };
        
    }

    componentDidMount() {
        let self = this;
        self.setState({
            period: self.props.period
        })
    }

    getCountryColor = (city) => {
        let self = this;
        console.log(city);
        if(city['avg_tmax_' + self.props.period] > 0) {
            return {color: '#FF0000'}
        }
        
    }

    render() {
        let self = this;
        return (
            <>
                <Card className="border-0 rounded">
                    <Card.Body>
                        <h5>
                            <Row>
                                <Col xs="auto">
                                    <Form.Select>
                                        <option value="max">MAX</option> 
                                        <option value="min">MIN</option>
                                    </Form.Select>
                                </Col>
                                <Col xs="auto pt-1">Temperature Change in last</Col>
                                <Col xs="auto">
                                    <Form.Select>
                                        <option value="10">10</option> 
                                        <option value="15">15</option>
                                    </Form.Select> 
                                </Col>
                                <Col className="pt-1">years</Col>
                            </Row>
                        </h5>
                        <hr/>
                        
                        <MapContainer 
                        center={[-0, 20]}
                        zoom={2.5}
                        scrollWheelZoom={false}
                        zoomControl={false}
                        attributionControl={false}
                        doubleClickZoom={false}
                        touchZoom={false}
                        style={{background: '#fff', height: '500px'}}
                        dragging={false}>

                            <GeoJSON data={countriesData} style={this.style} />

                            {this.props.data.map((city, index) => {
                                return (
                                    <CircleMarker 
                                    key={index}
                                    pathOptions={this.getCountryColor(city)}
                                    radius={1}
                                    center={[city.lat, city.lon]}>
                                        <Tooltip>
                                            <div>
                                                <h5>
                                                    <div style={{width: '2em', height: '2em', borderRadius: '50%', overflow: 'hidden', position: 'relative'}} className="border">
                                                        <ReactCountryFlag
                                                        svg
                                                        countryCode={getCountryISO2(city.iso_code)}
                                                        style={{
                                                            position: 'absolute', 
                                                            top: '30%',
                                                            left: '30%',
                                                            marginTop: '-50%',
                                                            marginLeft: '-50%',
                                                            fontSize: '2.8em',
                                                            lineHeight: '2.8em',
                                                        }}/>
                                                    </div>
                                                    {city.city}</h5>
                                                <p>{city.country}</p>
                                                <p>{city.population}</p>
                                            </div>
                                        </Tooltip>
                                    </CircleMarker>
                                )
                            })}

                        </MapContainer>
                       
                    </Card.Body>
                </Card>
            </>
        );
    }
}