import React from 'react';
import { createRoot } from 'react-dom/client';
import pym from 'pym.js';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import getCountryISO2 from 'country-iso-3-to-2';
import ReactCountryFlag from 'react-country-flag';


import axios from 'axios';
import './app.scss';

// import { Cities } from './components/Cities';
import { Search } from './components/Search';
import { Climate } from './components/Climate';



export class App extends React.Component {


    constructor(){
        super();
        this.state = {
            position_details: {}
        }
        
    }

    componentDidMount() {
        const pymChild = new pym.Child({ polling: 500 });

        // pymChild.sendHeight();

        // window.addEventListener('resize', () => {
        //     pymChild.sendHeight();
        // });
    }

    componentDidUpdate() {
    }

    handleSendHeight() {
        // const pymChild = new pym.Child();

        // pymChild.sendHeight();
        
    }
    


    render() {
        return (
            <>  <Container className="my-5">
                    { (!document.location.search.includes('city=') && !document.location.search.includes('position=')) && 
                        <Row className="my-4">
                            <Col md={5}>
                                <Card className="h-100 shadow-sm">
                                    <Card.Body className="p-4">
                                        <Row>
                                            <Col>
                                                <p className="fs-4 mb-0"><strong className="text-adh-orange">The Africa Data Hub Climate Observer</strong> is designed to help journalists and academics reporting and researching climate change in Africa.</p>
                                            </Col>
                                        </Row>
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col>
                                <Card className="shadow-sm">
                                    <Card.Body className="p-4 fs-5">
                                        <Row>
                                            <Col>
                                                <p>Choose a location from the 100 biggest African cities dropdown or search for a specific place below.</p>
                                                <p style={{fontWeight: '300'}}>Location data is mapped to grid squares which measure <strong>1x1 degree latitude and longitude</strong> and all positions are rounded to the nearest 1x1 square.</p>
                                            </Col>
                                            
                                        </Row>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                    }
                    <Search updatePositionDetails={details => this.setState({position_details: details})} />

                    
                    { (document.location.search.includes('city=') || document.location.search.includes('position=')) && <Climate positionDetails={this.state.position_details} handleSendHeight={() => this.handleSendHeight()}/> }
                </Container>
                
            </>
        )
    }

}


const container = document.getElementsByClassName('app')[0];
const root = createRoot(container);
root.render(<App />);