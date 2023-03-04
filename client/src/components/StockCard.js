import React from 'react';
import { makeStyles } from '@mui/styles';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';

var numeral = require('numeral');

const useStyles = makeStyles({
  root: {
    minWidth: 275,
  },
  bullet: {
    display: 'inline-block',
    margin: '0 2px',
    transform: 'scale(0.8)',
  },
  title: {
    fontSize: 22,
  },
  pos: {
    marginBottom: 12,
  },
  key: {
    fontSize: 25,
    marginBottom: 12,
  }
});

export default function StockCard(props) {
  const classes = useStyles();

  return (
    <Card className={classes.root}>
      <CardContent>
        <Typography className={classes.title} align="right" variant="h1" component="h2" gutterBottom>
        {props.stockData.symbol}
        </Typography>
        <Divider />
        <Typography className={classes.key} align="right" color="primary">
        {numeral(props.stockData.last_trade_price).format('0.000')}   ({(props.stockData.last_trade_price / props.stockData.previous_close) - 1 > 0? "+" : ""} {numeral(((props.stockData.last_trade_price / props.stockData.previous_close) - 1) * 100).format('0.00')} %)
        </Typography>
        {props.extendedHour && 
        <Typography className={classes.key} align="right" color="textPrimary">
        Ext. Hrs: {numeral(props.stockData.last_extended_hours_trade_price).format('0.000')}   ({(props.stockData.last_extended_hours_trade_price / props.stockData.last_trade_price) - 1 > 0? "+" : ""} {numeral(((props.stockData.last_extended_hours_trade_price / props.stockData.last_trade_price) - 1) * 100).format('0.00')} %)
        </Typography>
        }
        <Typography className={classes.pos} align="right" color="textPrimary">
        Open: {numeral(props.stockData.open).format('0.00')}
        </Typography>
        <Typography className={classes.pos} align="right" color="textPrimary">
        High: {numeral(props.stockData.high).format('0.00')}
        </Typography>
        <Typography className={classes.pos} align="right" color="textPrimary">
        Low: {numeral(props.stockData.low).format('0.00')}
        </Typography>
        <Typography className={classes.pos} align="right" color="textPrimary">
        Prev. Close: {numeral(props.stockData.previous_close).format('0.00')}
        </Typography>
        <Typography className={classes.pos} align="right" color="textPrimary">
        Industry: {props.stockData.industry}
        </Typography>
      </CardContent>
    </Card>
  );
}