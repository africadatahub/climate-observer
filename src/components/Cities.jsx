import React from 'react';
import axios from 'axios';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Table from 'react-bootstrap/Table';
import DataTable, { defaultThemes } from 'react-data-table-component';
import Form from 'react-bootstrap/Form';
import getCountryISO2 from 'country-iso-3-to-2';
import ReactCountryFlag from 'react-country-flag';

import { Map } from './Map.jsx';

import *  as cities from '../data/100-cities.json';

export class Cities extends React.Component {

    constructor() {
        super();
        this.state = {
            cities_dataset: '8f75449d-a4bd-4b3b-b536-13e3d876c02d',
            period: 10,
            columns: [],
            data: [],
            loading: true,
            update: 1,
            all_columns: []
        }
    }

    componentDidMount() {

        let self = this;

        axios.get('https://ckandev.africadatahub.org/api/3/action/datastore_search_sql?sql=SELECT%20*%20from%20"' + self.state.cities_dataset + '"%20',
                { headers: {
                    "Authorization": process.env.CKAN
                }
            }).then(function(response) {
                console.log(response);

                self.setState({
                    data: response.data.result.records,
                    columns: self.state.all_columns,
                    loading: false
                }, () => {
                    self.changePeriod();
                })

            })

    }

    customSort = (a, b, column) => {
        if (column.selector == 'city') {
            return a.city.localeCompare(b.city);
        } 
    }

   

    changePeriod = (e) => {

        let self = this;

        let columns = self.state.all_columns;
        
        let period = e == undefined ? '10' : e.target.value;

        columns.forEach(column => {
            if(!column.name.includes(period) && !column.name.includes('City') && !column.name.includes('Country') && !column.name.includes('Population')) {
                column.omit = true;
            } else {
                column.omit = false;
            }
        });


        self.setState({
            period: e == undefined ? '10' : e.target.value,
            columns: [...columns],
            update: self.state.update + 1
        })

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







        
    
    }


        

    render() {
        return (
            <Container>
                <Row className="mt-4">
                    <Col>
                        <Card>
                            <Card.Body>
                                <Map 
                                period={this.state.period}
                                data={this.state.data}
                                />

                            </Card.Body>
                        </Card>
                    </Col>
                    <Col>
                        <Card>
                            <Card.Body>

                                
                                <h5>
                                    <Row>
                                        <Col className="pt-1">100 Largest Cities in Africa</Col>
                                        <Col xs="auto">
                                            <Form.Select onChange={(e) => this.changePeriod(e)}>
                                                <option value="10">10 years</option>
                                                <option value="15">15 years</option>
                                                <option value="20">20 years</option>
                                                <option value="25">25 years</option>
                                                <option value="30">30 years</option>
                                            </Form.Select>
                                        </Col>
                                    </Row>
                                </h5>
                                <hr/>
                                <Table>
                                    <thead>
                                        <tr>
                                            <th>City</th>
                                            <th>Population</th>
                                            <th>Temp Change</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                {
                                    this.state.data.map((city, index) => {
                                        return (

                                            <tr key={index}>
                                                
                                                <td>
                                                    <strong><a className="text-decoration-none" href={'/?position=' + city.lat + ',' + city.lon }><ReactCountryFlag countryCode={getCountryISO2(city.iso_code)} svg /> {city.city}</a></strong>
                                                </td>
                                                <td>
                                                    {parseInt(city.Population).toLocaleString()}
                                                </td>
                                                <td className="text-end">
                                                    {city['avg_tmax_' + this.state.period]}°C
                                                </td>
                                            </tr>
                                                        
                                        )
                                    }
                                )
                                }
                                </tbody>
                                </Table>
                                


                            </Card.Body>
                        </Card>
                    </Col>
                </Row>                                
            </Container>
        )
    }

}