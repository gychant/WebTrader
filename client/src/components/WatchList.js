import React, { Component } from 'react';
import SimpleTable from "./MaterialTable";
var numeral = require('numeral');

const width_value = 150;
const columns = [
  { field: 'symbol', headerName: 'symbol', width: width_value },
  { field: 'price', headerName: 'price', width: width_value },
  { field: 'one_day_dollar_change', headerName: 'dollar_change', width: width_value },
  { field: 'one_day_percent_change', headerName: 'percent_change', width: width_value }
];

class WatchList extends Component {  
    render() {
        columns.map(col => col["valueFormatter"] = ({ value }) => {
            if (isNaN(value)) {
              return value;
            } else {
              return numeral(value).format('0.000');
            }
        });
        
        return <SimpleTable 
        rows={this.props.items} 
        columns={columns} 
        actionHandlers={this.props.actionHandlers} />
    }
}

export default WatchList;