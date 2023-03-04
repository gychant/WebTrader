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
});

export default function AccountProfileCard(props) {
  const classes = useStyles();

  return (
    <Card className={classes.root}>
      <CardContent>
        <Typography className={classes.title} align="right" variant="h1" component="h2" gutterBottom>
        Account Profile
        </Typography>
        <Divider />
        <Typography className={classes.pos} align="right" color="primary">
        Equity {props.extendedHour? "(extended hour): $ " + numeral(props.profile.extended_hours_equity).format('0.00') : ": $ " + numeral(props.profile.equity).format('0.00')}
        </Typography>
        <Typography className={classes.pos} align="right" color="primary">
        Today's Change {props.extendedHour? "(extended hour): $ " + numeral(numeral(props.profile.extended_hours_equity).value() - numeral(props.profile.equity_previous_close).value()).format('0.00') : ": $ " + numeral(numeral(props.profile.equity).value() - numeral(props.profile.equity_previous_close).value()).format('0.00')}
        </Typography>
        <Typography className={classes.pos} align="right" color="secondary">
        Margin Buying Power: $ {numeral(props.profile.margin_buying_power).format('0.00')}
        </Typography>
        <Typography className={classes.pos} align="right" color="textPrimary">
        Cash Buying Power: $ {numeral(props.profile.buying_power).format('0.00')}
        </Typography>
        <Typography className={classes.pos} align="right" color="textSecondary">
        Cash Held for Orders: $ {numeral(props.profile.cash_held_for_orders).format('0.00')}
        </Typography>
        <Typography className={classes.pos} align="right" color="textSecondary">
        Cash Held for Collateral: $ {numeral(props.profile.cash_held_for_options_collateral).format('0.00')}
        </Typography> 
        <Typography className={classes.pos} align="right" color="textSecondary">
        Market Value {props.extendedHour? "(extended hour): $ " + numeral(props.profile.market_value).format('0.00') : ": $ " + numeral(props.profile.extended_hours_market_value).format('0.00')}
        </Typography>
        <Typography className={classes.pos} align="right" color="secondary">
        Stock Day Trades: {props.profile.num_of_equity_day_trades}
        </Typography>
        <Typography className={classes.pos} align="right" color="secondary">
        Option Day Trades: {props.profile.num_of_option_day_trades}
        </Typography> 
      </CardContent>
    </Card>
  );
}