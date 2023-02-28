import React from 'react';
import { createRoot } from 'react-dom/client';
import axios from 'axios';
import './app.scss';

import { Cities } from './components/Cities';
import { Climate } from './components/Climate';


export class App extends React.Component {


    constructor(){
        super();
        this.state = {
        }
        
    }

    componentDidMount() {}

    componentDidUpdate() {}

    render() {
        return (
            <>
                {
                    window.location.search == "" ? <Cities /> : <Climate />
                }
            </>
        )
    }

}


const container = document.getElementsByClassName('app')[0];
const root = createRoot(container);
root.render(<App />);