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

import StockOrderTable from './StockOrderTable'
import * as TradingUtils from '../utils/TradingUtils.js'

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

class StockTradeDialog extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
          price: 0.0,
          stopPrice: 0.0,
          quantity: 0
        }
        this.handleLimitOrder = this.handleLimitOrder.bind(this);
        this.handleBidAskLimitOrder = this.handleBidAskLimitOrder.bind(this);
        this.handleSellStopLimitOrder = this.handleSellStopLimitOrder.bind(this);
        this.handleMarketOrder = this.handleMarketOrder.bind(this);
        this.handleSyncPrice = this.handleSyncPrice.bind(this);
        this.handleSyncLimitPrice = this.handleSyncLimitPrice.bind(this);
        this.handleAssignPrice = this.handleAssignPrice.bind(this);
        this.handlePriceChange = this.handlePriceChange.bind(this);
        this.handleQuantityChange = this.handleQuantityChange.bind(this);
        this.handleQuantityAddTen = this.handleQuantityAddTen.bind(this);
        this.handleQuantityAddFifty = this.handleQuantityAddFifty.bind(this);
        this.handleQuantityAddOneHundred = this.handleQuantityAddOneHundred.bind(this);
        this.handleQuantityAddAll = this.handleQuantityAddAll.bind(this);
        this.handleQuantityClear = this.handleQuantityClear.bind(this);
        this.handleOnEntered = this.handleOnEntered.bind(this);
        this.priceRef = React.createRef();
        this.quantityRef = React.createRef();
        this.stopPriceRef = React.createRef();
        this.timeInForceRef = React.createRef();
    }
    
    handleLimitOrder(event) {
        let url = "";
        if (this.props.data.action === "Buy") {
            url = "order_buy_limit";
        } 
        else if (this.props.data.action === "Sell") {
            url = "order_sell_limit";
        }
        axios.get('/' + url + '/' + this.props.data.name 
        + '/' + this.quantityRef.current.value 
        + '/' + this.priceRef.current.value
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

    handleBidAskLimitOrder(event) {
        let price = "";
        let url = "";

        price = this.props.data.action === "Buy" ? numeral(this.props.stockData.ask_price).format('0.000') : numeral(this.props.stockData.bid_price).format('0.000');
        if (this.props.data.action === "Buy") {
            url = "order_buy_limit";
        } else if (this.props.data.action === "Sell") {
            url = "order_sell_limit";
        }
        axios.get('/' + url + '/' + this.props.data.name 
        + '/' + this.quantityRef.current.value 
        + '/' + price
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

    handleSellStopLimitOrder(event) {
        let url = "order_sell_stop_limit";
        axios.get('/' + url + '/' + this.props.data.name 
        + '/' + this.quantityRef.current.value 
        + '/' + this.priceRef.current.value
        + '/' + this.stopPriceRef.current.value
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

    handleMarketOrder(event) {
        // Robinhood Market Order
        let url = "";
        if (this.props.data.action === "Buy") {
            url = "order_buy_market";
        } else if (this.props.data.action === "Sell") {
            url = "order_sell_market";
        }
        axios.get('/' + url + '/' + this.props.data.name + '/' + this.quantityRef.current.value)
        .then(res => res.data)
        .then(data => {
          window.alert(JSON.stringify(data));
        });
        event.preventDefault();
    }

    handleSyncPrice(event) {
        event.preventDefault();
        this.priceRef.current.value = this.props.data.action === "Buy" ? 
        numeral(this.props.stockData.ask_price).format('0.000') : 
        numeral(this.props.stockData.bid_price).format('0.000');
    }

    handleSyncLimitPrice(event) {
      event.preventDefault();
      this.stopPriceRef.current.value = numeral(this.priceRef.current.value).format('0.000');
    }

    handleAssignPrice(event) {
      event.preventDefault();
      this.priceRef.current.value = numeral(this.props.stockData[event.currentTarget.name]).format('0.000');
      this.setState({
        price: this.priceRef.current.value,
        quantity: this.quantityRef.current.value
      });
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

    handleQuantityAddTen(event) {
      event.preventDefault();
      this.quantityRef.current.value = numeral(numeral(this.quantityRef.current.value).value() + 10).format('0');
      this.setState({
        price: this.priceRef.current.value,
        quantity: this.quantityRef.current.value
      });
    }

    handleQuantityAddFifty(event) {
      event.preventDefault();
      this.quantityRef.current.value = numeral(numeral(this.quantityRef.current.value).value() + 50).format('0');
      this.setState({
        price: this.priceRef.current.value,
        quantity: this.quantityRef.current.value
      });
    }

    handleQuantityAddOneHundred(event) {
      event.preventDefault();
      this.quantityRef.current.value = numeral(numeral(this.quantityRef.current.value).value() + 100).format('0');
      this.setState({
        price: this.priceRef.current.value,
        quantity: this.quantityRef.current.value
      });
    }

    handleQuantityAddAll(event) {
      event.preventDefault();
      this.quantityRef.current.value = numeral(this.props.data.quantity).format('0');
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
        stopPrice: this.priceRef.current.value,
        quantity: this.quantityRef.current.value
      });
    }

    render() {
        const { classes } = this.props;

        let quantity = 0;
        if ("quantity" in this.props.data) {
            quantity = this.props.data.quantity;
        }
        let bid_ask = "Bid";
        if (this.props.data.action === "Buy") {
          bid_ask = "Ask";
        }
        return (
            <div>
              <Dialog 
              open={this.props.open} 
              onClose={this.props.handleClose} 
              onEntered={this.handleOnEntered}
              PaperComponent={PaperComponent}
              aria-labelledby="form-dialog-title" >
                <DialogTitle id="form-dialog-title">{this.props.data.action} {this.props.data.name}</DialogTitle>
                <DialogContent>
                  <DialogContentText>
                    Current Price:
                    <Button name="last_trade_price" onClick={this.handleAssignPrice} color="primary">
                    {numeral(this.props.stockData.last_trade_price).format('0.000')}
                    </Button>
                  </DialogContentText>
                  <DialogContentText>
                    Open: 
                    <Button name="open" onClick={this.handleAssignPrice} color="primary">
                    {numeral(this.props.stockData.open).format('0.000')}
                    </Button>
                  </DialogContentText>
                  <DialogContentText>
                    High:
                    <Button name="high" onClick={this.handleAssignPrice} color="primary">
                    {numeral(this.props.stockData.high).format('0.000')}
                    </Button>
                  </DialogContentText>
                  <DialogContentText>
                    Low: 
                    <Button name="low" onClick={this.handleAssignPrice} color="primary">
                    {numeral(this.props.stockData.low).format('0.000')}
                    </Button>
                  </DialogContentText>
                  <DialogContentText>
                    Bid / Size:
                    <Button name="bid_price" onClick={this.handleAssignPrice} color="primary">
                    {numeral(this.props.stockData.bid_price).format('0.000')} / {numeral(this.props.stockData.bid_size).format('0')}
                    </Button>
                  </DialogContentText>
                  <DialogContentText>
                    Ask / Size:
                    <Button name="ask_price" onClick={this.handleAssignPrice} color="primary">
                    {numeral(this.props.stockData.ask_price).format('0.000')} / {numeral(this.props.stockData.ask_size).format('0')}
                    </Button>
                  </DialogContentText>
                  {this.props.data.action === "Buy" &&
                  <React.Fragment>
                  <DialogContentText>
                    Buying Power: {numeral(this.props.accountProfile.buying_power).format('0.00')}
                  </DialogContentText>
                  <DialogContentText>
                    Margin Buying Power: {numeral(this.props.accountProfile.margin_buying_power).format('0.00')}
                  </DialogContentText>
                  </React.Fragment>
                  }
                  {(this.props.data.action === "Sell" || this.props.data.action === "Sell_Stop_Limit") &&
                  <React.Fragment>
                  <DialogContentText>
                    Sellable: {numeral(this.props.data.quantity).format('0')}
                  </DialogContentText>
                  <DialogContentText>
                    Avg Buy Price: {numeral(this.props.data.average_buy_price).format('0.000')}
                  </DialogContentText>
                  </React.Fragment>
                  }
                  <React.Fragment>
                  <TextField
                    id="price"
                    label="Limit Price"
                    autoComplete="off"
                    defaultValue={this.props.data.action === "Buy" ? numeral(this.props.stockData.ask_price).format('0.000') : numeral(this.props.stockData.bid_price).format('0.000')}
                    inputRef={this.priceRef}
                    onChange={this.handlePriceChange}
                  />
                  {this.props.data.action !== "Buy" &&
                    <Button variant="outlined" 
                    size="small" 
                    color="primary" 
                    className={classes.margin} 
                    onClick={this.handleQuantityAddAll}>
                      Sell All
                    </Button>
                  }
                  </React.Fragment>
                  {this.props.data.action === "Sell_Stop_Limit" &&
                  <React.Fragment>
                  <br/>
                  <TextField
                    id="stop_price"
                    label="Stop Price"
                    autoComplete="off"
                    defaultValue={numeral(this.props.stockData.bid_price).format('0.000')}
                    inputRef={this.stopPriceRef}
                  />
                  <Button variant="outlined" 
                  size="small" 
                  color="primary" 
                  className={classes.margin} 
                  onClick={this.handleSyncLimitPrice}>
                    Set to Limit Price
                  </Button>
                  </React.Fragment>
                  }
                  <br/>
                  <TextField
                    id="amount"
                    label="Quantity"
                    autoComplete="off"
                    defaultValue={numeral(quantity).format('0')}
                    inputRef={this.quantityRef}
                    onChange={this.handleQuantityChange}
                  />
                  <Button variant="outlined" 
                  size="small" 
                  color="primary" 
                  className={classes.margin} 
                  onClick={this.handleQuantityAddTen} >
                    +10
                  </Button>
                  <Button variant="outlined" 
                  size="small" color="primary" 
                  className={classes.margin} 
                  onClick={this.handleQuantityAddFifty}>
                    +50
                  </Button>
                  <Button variant="outlined" 
                  size="small" 
                  color="primary" 
                  className={classes.margin} 
                  onClick={this.handleQuantityAddOneHundred}>
                    +100
                  </Button>
                  <Button variant="outlined" 
                  size="small" 
                  color="primary" 
                  className={classes.margin} 
                  onClick={this.handleQuantityClear}>
                    Clear
                  </Button>
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
                    Estimated {this.props.data.action === "Buy" ? "Cost" : "Value"}: $ {numeral(this.state.price * this.state.quantity).format('0.00')}
                  </DialogContentText>
                </DialogContent>
                {this.props.orderData.length > 0 && 
                <StockOrderTable 
                  orders={this.props.orderData} 
                  actionHandlers={{
                    Cancel: TradingUtils.handleCancelStockOrder
                  }}
                />
                }
                <DialogActions>
                  <Button onClick={this.props.handleClose} color="primary">
                    Cancel
                  </Button>
                  {this.props.data.action !== "Sell_Stop_Limit" && 
                  <Button onClick={this.handleSyncPrice} color="primary">
                    Update
                  </Button>
                  }
                  {(this.props.data.action === "Buy" || this.props.data.action === "Sell") && 
                  <React.Fragment>
                  <Button onClick={this.handleLimitOrder} color="primary">
                    Limit {this.props.data.action}
                  </Button>
                  <Button onClick={this.handleBidAskLimitOrder} color="primary">
                    {bid_ask} Limit {this.props.data.action}
                  </Button>
                  </React.Fragment>
                  }
                  {this.props.data.action === "Sell_Stop_Limit" && 
                  <Button onClick={this.handleSellStopLimitOrder} color="primary">
                    Sell_Stop_Limit
                  </Button>
                  }
                </DialogActions>
              </Dialog>
            </div>
        );
    }
}

export default withStyles(useStyles)(StockTradeDialog);
