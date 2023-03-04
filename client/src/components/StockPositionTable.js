import React, { Component } from 'react';
import SimpleTable from "./MaterialTable";
var numeral = require('numeral');

const width_value = 150;
const columns = [
  { field: 'name', headerName: 'name', width: width_value },
  { field: 'price', headerName: 'price', width: width_value },
  { field: 'quantity', headerName: 'quantity', width: width_value },
  { field: 'average_buy_price', headerName: 'average_buy_price', width: width_value },
  { field: 'equity', headerName: 'equity', width: width_value },
  { field: 'percent_change', headerName: 'percent_change', width: width_value },
  { field: 'equity_change', headerName: 'equity_change', width: width_value },
  { field: 'percentage', headerName: 'percentage', width: width_value }
];

class StockPositionTable extends Component {  
    render() {
        columns.map(col => col["valueFormatter"] = ({ value }) => {
            if (isNaN(value)) {
              return value;
            } else {
              return numeral(value).format('0.000');
            }
        });
        
        return <SimpleTable 
        rows={this.props.positions} 
        columns={columns} 
        actionHandlers={this.props.actionHandlers} />
    }
}

export default StockPositionTable;