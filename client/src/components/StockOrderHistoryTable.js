import React, { Component } from 'react';
import SimpleTable from "./MaterialTable";
var numeral = require('numeral');

const width_value = 150;
const columns = [
    { field: 'symbol', headerName: 'name', width: width_value },
    { field: 'type', headerName: 'type', width: width_value },
    { field: 'side', headerName: 'side', width: width_value },
    { field: 'price', headerName: 'price', width: width_value },
    { field: 'quantity', headerName: 'quantity', width: width_value },
    { field: 'time_in_force', headerName: 'time_in_force', width: width_value },
    { field: 'state', headerName: 'state', width: width_value },
    { field: 'updated_at', headerName: 'timestamp', width: width_value }
];

class StockOrderHistoryTable extends Component {  
    render() {
        columns.map(col => col["valueFormatter"] = ({ value }) => {
            if (isNaN(value)) {
              return value;
            } else {
              return numeral(value).format('0.000');
            }
        });
        
        return <SimpleTable 
        rows={this.props.orders} 
        columns={columns} 
        actionHandlers={this.props.actionHandlers} />
    }
}

export default StockOrderHistoryTable;