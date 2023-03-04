import React from 'react';
import { Component } from 'react';
import axios from '../api';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';

class StockForm extends Component {
    constructor(props) {
      super(props);
      this.state = {
        symbol: props.symbol,
        open: false,
        results: []
      };
    }
  
    render() {
      return (
        <div>
          <form noValidate autoComplete="off">
          <Autocomplete
            value={this.state.symbol}
            onInputChange={(event, newValue) => {
              if (newValue) {
                this.setState({symbol: newValue});
                axios.get('/query_symbol/' + newValue + '/10')
                  .then(res => res.data)
                  .then(data => {
                    this.setState({results: data.quotes.map(q => q.symbol)});
                    this.setState({open: true});
                  });
              }
            }}
            options={this.state.results}
            getOptionLabel={(option) => {
              // e.g value selected with enter, right from the input
              if (typeof option === 'string') {
                return option;
              }
              if (option.inputValue) {
                return option.inputValue;
              }
              return option.symbol;
            }}
            selectOnFocus
            clearOnBlur
            style={{ width: 300 }}
            freeSolo
            renderInput={(params) => (
              <TextField {...params} label="Stock Symbol" variant="outlined" />
            )}
          />
          </form>
        </div>
      );
    }
}

export default StockForm;