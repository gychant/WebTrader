import React, { Component } from 'react';
import SimpleTable from "./MaterialTable";
var numeral = require('numeral');

const width_value = 150;
const columns = [
  { field: 'name', headerName: 'name', width: width_value },
  { field: 'expiration_date', headerName: 'expiration_date', width: width_value },
  { field: 'option_type', headerName: 'option_type', width: width_value },
  { field: 'strike_price', headerName: 'strike_price', width: width_value },
  { field: 'average_price', headerName: 'average_price', width: width_value },
  { field: 'type', headerName: 'type', width: width_value },
  { field: 'quantity', headerName: 'quantity', width: width_value },
  { field: 'adjusted_mark_price', headerName: 'mark_price', width: width_value },
  { field: 'previous_close_price', headerName: 'prev_close_price', width: width_value },
  { field: 'last_trade_size', headerName: 'last_trade_size', width: width_value },
  { field: 'volume', headerName: 'volume', width: width_value },
  { field: 'open_interest', headerName: 'open_interest', width: width_value },
  { field: 'bid_price', headerName: 'bid_price', width: width_value },
  { field: 'bid_size', headerName: 'bid_size', width: width_value },
  { field: 'ask_price', headerName: 'ask_price', width: width_value },
  { field: 'ask_size', headerName: 'ask_size', width: width_value }
];

class OptionPositionTable extends Component {
  
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

export default OptionPositionTable;