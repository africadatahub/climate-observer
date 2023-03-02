import React from 'react';
import { createRoot } from 'react-dom/client';

import Container from 'react-bootstrap/Container';


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

    componentDidMount() {}

    componentDidUpdate() {}



    render() {
        return (
            <>  <Container>
                    <Search updatePositionDetails={details => this.setState({position_details: details})} />
                    { window.location.search != '' && <Climate positionDetails={this.state.position_details}/> }
                </Container>
                
            </>
        )
    }

}


const container = document.getElementsByClassName('app')[0];
const root = createRoot(container);
root.render(<App />);