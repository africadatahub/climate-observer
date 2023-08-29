import React from 'react';
import axios from 'axios';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Table from 'react-bootstrap/Table';
import Form from 'react-bootstrap/Form';
import getCountryISO2 from 'country-iso-3-to-2';
import ReactCountryFlag from 'react-country-flag';

import * as cities from '../data/places.json';
import * as countries from '../data/countries.json';


export class Search extends React.Component {

    constructor(){
        super();
        this.state = {
            cities: cities,
            lat: undefined,
            lon: undefined,
            options: [],
            location: undefined
        }
        this.citySelectRef = React.createRef();
        this.searchRef = React.createRef();
        
    }

    componentDidMount() {

        let self = this;

        // Sort and map cities
        cities.sort((a, b) => {
            if(a.city < b.city) { return -1; }
            if(a.city > b.city) { return 1; }
            return 0;
        });


        this.setState({cities: cities}, () => {

            let searchTerms = document.location.search.split('&');
        
            if(document.location.search.includes('city=')){

                let citysearch = searchTerms.filter(term => term.includes('city='))[0];

                this.citySelectRef.current.value = citysearch.split('city=')[1];

                let citysearchParsed = citysearch.split('city=')[1];

                if(citysearch.split('city=')[1] == 'abomey-calavi') {
                    citysearchParsed = 'abomey-calavi';
                } else if(citysearch.split('city=')[1] == 'mbuji-mayi') {
                    citysearchParsed = 'mbuji-mayi';
                } else if(citysearch.split('city=')[1] == 'pointe-noire') {
                    citysearchParsed = 'pointe-noire';
                }

                let city = cities.filter(city => city.city.toLowerCase().replaceAll(' ','-').replaceAll("'",'') == citysearchParsed)[0];

                this.setState({lat: city.lat, lon: city.lon});


            } else if(document.location.search.includes('position=')){


                let positionsearch = searchTerms.filter(term => term.includes('position='))[0];

                this.citySelectRef.current.value = 'location';

                let place = positionsearch.split('position=')[1];

                this.setState({lat: place.split(',')[0], lon: place.split(',')[1]});

                axios.get(`https://nominatim.openstreetmap.org/search?q=${place}&format=json&polygon=1&addressdetails=1`)
                .then(function (response) {

                    self.searchRef.current.value = response.data[0].display_name;

                    self.props.updatePositionDetails(response.data[0].address);


                })

            }
        });


    }

    changeLocation = (type, value) => {
        let self = this;

        if(value != 'location') {
            if(type == 'city') {
                document.location.search = '?city=' + value;
            } else {
                document.location.search = '?position=' + value.join(',');
            }
        } else {
            self.setState({
                lat: undefined,
                lon: undefined,
                options: [],
                location: 'location'
            })
        }
    }

    addressLookup = (e) => {
        let self = this;

        if (e.length > 3) {
            // Throttle the number of requests sent
            if (this.timeout) clearTimeout(this.timeout);
            this.timeout = setTimeout(() => {
                this.timeout = null;

                axios.get(`https://nominatim.openstreetmap.org/search?q=${e}&format=json&polygon=1&addressdetails=1&countrycodes=${countries.map(country => getCountryISO2(country.iso_code)).join(',')}`)
                .then(function (response) {
                    
                    self.setState({options: response.data.map((item) => {
                        return {
                            value: item,
                            label: item.display_name
                        }
                    })})
                })
                
            }, 1000);
        }
    }

    useLocation = () => {
        if (window.navigator.geolocation) {
            window.navigator.geolocation.getCurrentPosition((position) => {
                this.changeLocation('position', [position.coords.latitude,position.coords.longitude]);
            })
        }
    }

    

    closeSearch = () => {
        let self = this;
        self.setState({options: []});
    }

    render() {
        return (<Card className="shadow-sm">
            <Card.Body>
            <Row>
                <Col>
                    <Form.Select size="lg" ref={this.citySelectRef} onChange={(e) => this.changeLocation('city', e.target.value)} className="bg-control-grey">
                        <option value="" disabled selected>Select a city</option>
                        <option value="location" disabled hidden>Custom Location</option>
                        {this.state.cities.map((city, index) => {
                            return <option key={'c'+index} value={city.city.toLowerCase().replaceAll(' ','-').replaceAll("'",'')}>{city.city}</option>
                        })}
                    </Form.Select>
                </Col>
                <Col md={8}>
                    <Form.Control size="lg" ref={this.searchRef} type="text" placeholder="Search for a specific place..." onChange={(e) => this.addressLookup(e.target.value)} className={this.state.loading ? 'loading bg-control-grey' : 'bg-control-grey'}/>
                    <div className="search-options">
                        {this.state.options.length > 0 &&
                            <ul>
                                {this.state.options.map((item, index) => {
                                    return <li as="li" key={index} onClick={() => {
                                        this.setState(
                                            {
                                                lat: item.value.lat, 
                                                lon: item.value.lon
                                            }, this.changeLocation('position', [item.value.lat,item.value.lon])
                                        )
                                    }}>{item.label.substring(0, 100) + '...'}</li>
                                })}
                            </ul>
                        }
                    </div>
                </Col>
                <Col>
                    <div className="d-grid gap-2">
                        <Button size="lg" className="geolocation-btn" onClick={() => this.useLocation()}>Use my location</Button>
                    </div>
                </Col>
            </Row>
            
            </Card.Body>
            </Card>
            

        );
    }

    
}