import React from 'react';
import axios from '../api';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import NativeSelect from '@mui/material/NativeSelect';
import InputLabel from '@mui/material/InputLabel';
import Paper from '@mui/material/Paper';
import Draggable from 'react-draggable';
import { withStyles } from '@mui/styles';

import OptionOrderTable from './OptionOrderTable'
import * as TradingUtils from '../utils/TradingUtils.js'
import * as OptionUtils from '../utils/OptionUtils.js'

var numeral = require('numeral');

const useStyles = (theme) => ({
  margin: {
    margin: theme.spacing(1),
  },
  extendedIcon: {
    marginRight: theme.spacing(1),
  },
});

function PaperComponent(props) {
  return (
    <Draggable handle="#form-dialog-title" cancel={'[class*="MuiDialogContent-root"]'}>
      <Paper {...props} />
    </Draggable>
  );
}

class OptionTradeDialog extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
          price: 0.0,
          quantity: 1
        }
        this.handleLimitOrder = this.handleLimitOrder.bind(this);
        this.handlePriceChange = this.handlePriceChange.bind(this);
        this.handleQuantityChange = this.handleQuantityChange.bind(this);
        this.handleAssignPrice = this.handleAssignPrice.bind(this);
        this.handleSyncBid = this.handleSyncBid.bind(this);
        this.handleSyncAsk = this.handleSyncAsk.bind(this);
        this.handleSyncMark = this.handleSyncMark.bind(this);
        this.handleSyncCost = this.handleSyncCost.bind(this);
        this.handleQuantityAddOne = this.handleQuantityAddOne.bind(this);
        this.handleQuantityAddTwo = this.handleQuantityAddTwo.bind(this);
        this.handleQuantityAddFive = this.handleQuantityAddFive.bind(this);
        this.handleQuantityClear = this.handleQuantityClear.bind(this);
        this.handleOnEntered = this.handleOnEntered.bind(this);
        this.priceRef = React.createRef();
        this.quantityRef = React.createRef();
        this.timeInForceRef = React.createRef();
    }
    
    handleLimitOrder(event) {
        let positionEffect = this.props.data.position_effect;
        let creditOrDebit = "";
        let symbol = OptionUtils.get_symbol(this.props.data.occ_symbol);
        let expirationDate = OptionUtils.get_exp_date(this.props.data.occ_symbol);
        let strike = OptionUtils.get_strike(this.props.data.occ_symbol);
        let optionType = OptionUtils.get_option_type(this.props.data.occ_symbol);
        let url = "";
        if (this.props.data.action === "Buy") {
            url = "order_buy_option_limit";
            creditOrDebit = "debit";
        } 
        else if (this.props.data.action === "Sell") {
            url = "order_sell_option_limit";
            creditOrDebit = "credit";
        }

        axios.get('/' + url 
            + '/' + positionEffect 
            + '/' + creditOrDebit 
            + '/' + this.priceRef.current.value
            + '/' + symbol
            + '/' + this.quantityRef.current.value
            + '/' + expirationDate 
            + '/' + strike
            + '/' + optionType
            + '/' + this.timeInForceRef.current.value)
        .then(res => res.data)
        .then(data => {
            if ("id" in data) {
                window.alert("Order submitted!");
            } else {
                window.alert(JSON.stringify(data));
            }
        });
        event.preventDefault();
    }

    handlePriceChange(event) {
      event.preventDefault();
      this.setState({
        price: this.priceRef.current.value,
        quantity: this.quantityRef.current.value
      });
    }

    handleQuantityChange(event) {
      event.preventDefault();
      this.setState({
        price: this.priceRef.current.value,
        quantity: this.quantityRef.current.value
      });
    }

    handleAssignPrice(event) {
      event.preventDefault();
      if (this.props.optionData.type === "put") {
        this.priceRef.current.value = numeral(numeral(this.props.optionData.strike_price).value() - numeral(this.props.stockData[event.currentTarget.name]).value()).format('0.000');
        this.setState({
          price: this.priceRef.current.value,
          quantity: this.quantityRef.current.value
        });
      }
    }

    handleSyncBid(event) {
      event.preventDefault();
      this.priceRef.current.value = numeral(this.props.optionData.bid_price).format('0.000');
      this.setState({
        price: this.props.optionData.bid_price,
        quantity: this.quantityRef.current.value
      });
    }

    handleSyncAsk(event) {
      event.preventDefault();
      this.priceRef.current.value = numeral(this.props.optionData.ask_price).format('0.000');
      this.setState({
        price: this.props.optionData.ask_price,
        quantity: this.quantityRef.current.value
      });
    }

    handleSyncMark(event) {
      event.preventDefault();
      this.priceRef.current.value = numeral(this.props.optionData.adjusted_mark_price).format('0.000');
      this.setState({
        price: this.props.optionData.adjusted_mark_price,
        quantity: this.quantityRef.current.value
      });
    }

    handleSyncCost(event) {
      event.preventDefault();
      this.priceRef.current.value = numeral(this.props.data.average_price).format('0.000');
      this.setState({
        price: this.props.data.average_price,
        quantity: this.quantityRef.current.value
      });
    }

    handleQuantityAddOne(event) {
      event.preventDefault();
      this.quantityRef.current.value = numeral(numeral(this.quantityRef.current.value).value() + 1).format('0');
      this.setState({
        price: this.priceRef.current.value,
        quantity: this.quantityRef.current.value
      });
    }

    handleQuantityAddTwo(event) {
      event.preventDefault();
      this.quantityRef.current.value = numeral(numeral(this.quantityRef.current.value).value() + 2).format('0');
      this.setState({
        price: this.priceRef.current.value,
        quantity: this.quantityRef.current.value
      });
    }

    handleQuantityAddFive(event) {
      event.preventDefault();
      this.quantityRef.current.value = numeral(numeral(this.quantityRef.current.value).value() + 5).format('0');
      this.setState({
        price: this.priceRef.current.value,
        quantity: this.quantityRef.current.value
      });
    }

    handleQuantityClear(event) {
      event.preventDefault();
      this.quantityRef.current.value = 0;
      this.setState({
        price: this.priceRef.current.value,
        quantity: 0
      });
    }

    handleOnEntered() {
      this.setState({
        price: this.priceRef.current.value,
        quantity: this.quantityRef.current.value
      });
    }

    render() {
        const { classes } = this.props;
        return (
            <div>
              <Dialog 
              open={this.props.open} 
              onClose={this.props.handleClose} 
              onEntered={this.handleOnEntered}
              PaperComponent={PaperComponent}
              aria-labelledby="form-dialog-title" >
                <DialogTitle id="form-dialog-title">{this.props.data.action} {this.props.stockData.symbol} {numeral(this.props.optionData.strike_price).format('0.0')} {this.props.optionData.type} {this.props.optionData.expiration_date}</DialogTitle>
                <DialogContent>
                  <DialogContentText>
                    Stock Price: 
                    <Button name="last_trade_price" onClick={this.handleAssignPrice} color="primary">
                    {numeral(this.props.stockData.last_trade_price).format('0.000')}
                    </Button>
                    Stock Open: 
                    <Button name="open" onClick={this.handleAssignPrice} color="primary">
                    {numeral(this.props.stockData.open).format('0.000')}
                    </Button>
                  </DialogContentText>
                  <DialogContentText>
                    Stock High: 
                    <Button name="high" onClick={this.handleAssignPrice} color="primary">
                    {numeral(this.props.stockData.high).format('0.000')}
                    </Button>
                    Stock Low: 
                    <Button name="low" onClick={this.handleAssignPrice} color="primary">
                    {numeral(this.props.stockData.low).format('0.000')}
                    </Button>
                  </DialogContentText>
                  <DialogContentText>
                    Adjusted Mark Price: {numeral(this.props.optionData.adjusted_mark_price).format('0.000')}
                  </DialogContentText>
                  <DialogContentText>
                    Break Even Price: {this.props.optionData.type === "call"? numeral(numeral(this.props.optionData.strike_price).value() + numeral(this.props.optionData.adjusted_mark_price).value()).format('0.000') : numeral(numeral(this.props.optionData.strike_price).value() - numeral(this.props.optionData.adjusted_mark_price).value()).format('0.000')}
                    <Button></Button>
                    Exp. Break Even: {this.props.optionData.type === "call"? numeral(numeral(this.props.optionData.strike_price).value() + numeral(this.state.price).value()).format('0.000') : numeral(numeral(this.props.optionData.strike_price).value() - numeral(this.state.price).value()).format('0.000')}
                  </DialogContentText>
                  { this.props.data.action === "Buy" &&
                  <React.Fragment>
                  <DialogContentText>
                    Buying Power: {numeral(this.props.accountProfile.buying_power).format('0.00')}
                    <Button></Button>
                    Margin Buying Power: {numeral(this.props.accountProfile.margin_buying_power).format('0.00')}
                  </DialogContentText>
                  </React.Fragment>
                  }
                  <DialogContentText>
                    Bid Price / Size: {numeral(this.props.optionData.bid_price).format('0.000')} / {this.props.optionData.bid_size}
                    <Button></Button>
                    Ask Price / Size: {numeral(this.props.optionData.ask_price).format('0.000')} / {this.props.optionData.ask_size}
                  </DialogContentText>
                  <DialogContentText>
                    High: {numeral(this.props.optionData.high_price).format('0.000')}
                    <Button></Button>
                    Low: {numeral(this.props.optionData.high_price).format('0.000')}
                  </DialogContentText>
                  <DialogContentText>
                    Last Price / Size: {numeral(this.props.optionData.last_trade_price).format('0.000')} / {this.props.optionData.last_trade_size}
                  </DialogContentText>
                  <DialogContentText>
                    Volume / Open Interest: {this.props.optionData.volume} / {this.props.optionData.open_interest}
                    <Button></Button>
                    Tradable: {numeral(this.props.data.quantity).format('0')}
                  </DialogContentText>
                  {this.props.data.quantity && 
                  <DialogContentText>
                    Avg Cost/Credit: {numeral(this.props.data.average_price).format('0.000')}
                  </DialogContentText>
                  }
                  <div>
                  <TextField
                    autoFocus
                    id="price"
                    label="Price"
                    autoComplete="off"
                    defaultValue={(this.props.data.action === "Sell") ? numeral(this.props.data.ask_price).format('0.000') : numeral(this.props.data.bid_price).format('0.000')}
                    inputRef={this.priceRef}
                    onChange={this.handlePriceChange}
                  />
                  <Button variant="outlined" 
                  size="small" 
                  color="primary" 
                  className={classes.margin} 
                  onClick={this.handleSyncBid} >
                    Bid
                  </Button>
                  <Button variant="outlined" 
                  size="small" color="primary" 
                  className={classes.margin} 
                  onClick={this.handleSyncAsk}>
                    Ask
                  </Button>
                  <Button variant="outlined" 
                  size="small" 
                  color="primary" 
                  className={classes.margin} 
                  onClick={this.handleSyncMark}>
                    Mark
                  </Button>
                  <Button variant="outlined" 
                  size="small" 
                  color="primary" 
                  className={classes.margin} 
                  onClick={this.handleSyncCost}>
                    Cost
                  </Button>
                  </div>
                  <br/>
                  <div>
                  <TextField
                    id="amount"
                    label="Quantity"
                    autoComplete="off"
                    defaultValue={(this.props.data.action === "Sell") ? numeral(this.props.data.quantity).format('0') : 1 }
                    inputRef={this.quantityRef}
                    onChange={this.handleQuantityChange}
                  />
                  <Button variant="outlined" 
                  size="small" 
                  color="primary" 
                  className={classes.margin} 
                  onClick={this.handleQuantityAddOne} >
                    +1
                  </Button>
                  <Button variant="outlined" 
                  size="small" color="primary" 
                  className={classes.margin} 
                  onClick={this.handleQuantityAddTwo}>
                    +2
                  </Button>
                  <Button variant="outlined" 
                  size="small" 
                  color="primary" 
                  className={classes.margin} 
                  onClick={this.handleQuantityAddFive}>
                    +5
                  </Button>
                  <Button variant="outlined" 
                  size="small" 
                  color="primary" 
                  className={classes.margin} 
                  onClick={this.handleQuantityClear}>
                    Clear
                  </Button>
                  </div>
                  <form noValidate>
                    <InputLabel htmlFor="time-in-force">Time in force</InputLabel>
                    <NativeSelect
                      defaultValue="gfd"
                      inputProps={{
                        id: 'time-in-force'
                      }}
                      inputRef={this.timeInForceRef}
                    >
                      <option key="gfd" value="gfd">Good for day</option>
                      <option key="gtc" value="gtc">Good till canceled</option>
                    </NativeSelect>
                  </form>
                  <DialogContentText>
                    Estimated {this.props.data.action === "Buy"? "Cost" : "Credit"}: $ {numeral(this.state.price * this.state.quantity * 100).format('0.00')}
                  </DialogContentText>
                </DialogContent>
                {this.props.orderData.length > 0 && 
                <OptionOrderTable 
                  orders={this.props.orderData} 
                  actionHandlers={{
                    Cancel: TradingUtils.handleCancelOptionOrder
                  }}
                />
                }
                <DialogActions>
                  <Button onClick={this.props.handleClose} color="primary">
                    Cancel
                  </Button>
                  <Button onClick={this.handleLimitOrder} color="primary">
                    Limit {this.props.data.action}
                  </Button>
                </DialogActions>
              </Dialog>
            </div>
        );
    }
}

export default withStyles(useStyles)(OptionTradeDialog);
