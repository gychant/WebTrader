import React, { Component } from 'react';
import SimpleTable from "./MaterialTable";
var numeral = require('numeral');

const width_value = 150;
const columns = [
  { field: 'expiration_date', headerName: 'expiration_date', width: width_value, type: "date" },
  { field: 'strike_price', headerName: 'strike_price', width: width_value, type: "number"},
  { field: 'type', headerName: 'type', width: width_value, type: "string"},
  { field: 'break_even', headerName: 'break_even', width: width_value, type: "string"},
  { field: 'bid_price', headerName: 'bid_price', width: width_value, type: "number" },
  { field: 'bid_size', headerName: 'bid_size', width: width_value, type: "number" },
  { field: 'ask_price', headerName: 'ask_price', width: width_value, type: "number" },
  { field: 'ask_size', headerName: 'ask_size', width: width_value, type: "number" },
  { field: 'last_trade_price', headerName: 'last_trade_price', width: width_value, type: "number" },
  { field: 'last_trade_size', headerName: 'last_trade_size', width: width_value, type: "number" },
  { field: 'high_price', headerName: 'high_price', width: width_value, type: "number" },
  { field: 'low_price', headerName: 'low_price', width: width_value, type: "number" },
  { field: 'mark_price', headerName: 'mark_price', width: width_value, type: "number" },
  { field: 'previous_close_price', headerName: 'previous_close_price', width: width_value, type: "number" },
  { field: 'volume', headerName: 'volume', width: width_value, type: "number" },
  { field: 'open_interest', headerName: 'open_interest', width: width_value, type: "number" }
];

class OptionTable extends Component {
    construct_columns() {
      var columns = [];
      for (let key in this.state.options[0]) {
        columns.push({ field: key, headerName: key, width: width_value });
      }
      return columns;
    }
  
    render() {
      columns.map(col => col["valueFormatter"] = ({ value }) => {
          if (isNaN(value)) {
            return value;
          } else {
            return numeral(value).format('0.000');
          }
      });
      return <SimpleTable 
      rows={this.props.options} 
      columns={columns} 
      actionHandlers={this.props.actionHandlers}/>
    }
}

export default OptionTable;