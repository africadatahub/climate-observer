import React from 'react';
import axios from 'axios';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';

import Icon from '@mdi/react';
import { mdiArrowUpThick, mdiArrowDownThick, mdiMinusThick } from '@mdi/js';


export class Temperature extends React.Component {


    constructor(){
        super();
        this.state = {
            temp_avg: undefined,
            
        }
    }
    

    componentDidMount() {

    }

    
    componentDidUpdate(prevProps) {
        if (this.props.data !== prevProps.data) {
            this.calculations();
        }
    }


    

    calculations = () => {
        let self = this;

        let data = this.props.data;

        
        let temp = [];
        data.forEach((data) => {
            temp.push(data['temperature_' + this.props.type]);
        })
        temp = temp.filter((temp) => {
            return temp != undefined && !isNaN(temp);
        })
        let temp_avg = temp.reduce((a, b) => a + b, 0) / temp.length;


        self.setState({
            temp_avg: temp_avg,
        })


    }






   
        

    render() {
        return (<Card className={'temperature-card card-' + this.props.type}>
            <Card.Body>
                <Card.Title>{this.props.type.toUpperCase()} TEMPERATURE</Card.Title>
                <Icon path={this.state.temp_avg > 0 ? mdiArrowUpThick : this.state.temp_avg < 0 ? mdiArrowDownThick : mdiMinusThick} size={2} style={{marginTop: "-5px", marginRight: "0.6em"}}/>
                {Math.round(this.state.temp_avg * 100) / 100}°
                <div className="fs-6 text-uppercase">AVG temp anomaly</div>
            </Card.Body>                        
        </Card>)
    }

}