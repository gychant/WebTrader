import React, { useState, useEffect } from 'react';
import { makeStyles } from '@mui/styles';
import axios from '../api';
import Button from '@mui/material/Button';
import Fab from '@mui/material/Fab';
import EditIcon from '@mui/icons-material/Edit';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import BottomNavigation from '@mui/material/BottomNavigation';
import NativeSelect from '@mui/material/NativeSelect';
import InputLabel from '@mui/material/InputLabel';
import Grid from '@mui/material/Grid';
import { connect } from 'react-redux';

import StockForm from '../components/StockForm'
import OptionTable from '../components/OptionTable'
import StockPositionTable from '../components/StockPositionTable'
import OptionPositionTable from '../components/OptionPositionTable'
import StockOrderTable from '../components/StockOrderTable'
import OptionOrderTable from '../components/OptionOrderTable'
import StockOrderHistoryTable from '../components/StockOrderHistoryTable'
import OptionOrderHistoryTable from '../components/OptionOrderHistoryTable'
import useInterval from '@use-it/interval';
import StockTradeDialog from '../components/StockTradeDialog'
import OptionTradeDialog from '../components/OptionTradeDialog'
import WatchList from '../components/WatchList'
import AccountProfileCard from '../components/AccountProfileCard'
import StockCard from '../components/StockCard'

import { userActions } from '../_actions';
import * as OptionUtils from '../utils/OptionUtils.js'
import * as TradingUtils from '../utils/TradingUtils.js'

var numeral = require('numeral');
var moment = require('moment-timezone');
var Scroll = require('react-scroll');
var scroll = Scroll.animateScroll;

const useStyles = makeStyles(theme => ({
  fab: {
    position: 'fixed',
    bottom: theme.spacing(2),
    right: theme.spacing(2),
  }
}));

function HomePage(props) {
  const classes = useStyles();
  const defaultStock = "MSFT";
  const [stockData, setStockData] = useState({});
  const [tradingStockData, setTradingStockData] = useState({});
  const [extendedHour, setExtendedHour] = useState(false);
  const [tradingOptionData, setTradingOptionData] = useState({});
  const [tradingOptionStockSymbol, setTradingOptionStockSymbol] = useState(defaultStock);
  const [tradingOptionExpDate, setTradingOptionExpDate] = useState("");
  const [tradingOptionType, setTradingOptionType] = useState("");
  const [tradingOptionStrike, setTradingOptionStrike] = useState(0.0);
  const [stockSymbol, setStockSymbol] = useState(defaultStock);
  const [tradingStockSymbol, setTradingStockSymbol] = useState("");
  const [optionStockSymbol, setOptionStockSymbol] = useState(defaultStock);
  const [callOptions, setCallOptions] = useState([]);
  const [putOptions, setPutOptions] = useState([]);
  const [optionExpDate, setOptionExpDate] = useState("");
  const [availableOptionExpDates, setAvailableOptionExpDates] = useState([]);
  const [callOptionStrikes, setCallOptionStrikes] = useState({});
  const [putOptionStrikes, setPutOptionStrikes] = useState({});
  const [stockPositions, setStockPositions] = useState([]);
  const [optionPositions, setOptionPositions] = useState([]);
  const [stockOrders, setStockOrders] = useState([]);
  const [optionOrders, setOptionOrders] = useState([]);
  const [stockOrderHistory, setStockOrderHistory] = useState([]);
  const [optionOrderHistory, setOptionOrderHistory] = useState([]);
  const [openStockTrade, setOpenStockTrade] = useState(false);
  const [openOptionTrade, setOpenOptionTrade] = useState(false);
  const [openIframe, setOpenIframe] = useState(false);
  const [tradeData, setTradeData] = useState({});
  const [accountProfile, setAccountProfile] = useState({});
  const [id2Name, setId2Name] = useState({});
  const [callExpanded, setCallExpanded] = useState(false);
  const [putExpanded, setPutExpanded] = useState(false);
  const [watchlistExpanded, setWatchlistExpanded] = useState(false);
  const [watchlist, setWatchlist] = useState([]);
  const [refreshOptions, setRefreshOptions] = useState(false);
  const [marketOpen, setMarketOpen] = useState(false);
  const [stockOrderHistorySize, setStockOrderHistorySize] = useState(5);
  const [optionOrderHistorySize, setOptionOrderHistorySize] = useState(5);

  let stockFormRef = React.createRef();
  let optionStockFormRef = React.createRef();

  function isInRange(value, range) {
    return value >= range[0] && value <= range[1];
  }

  // Get next nearest Friday as default option expiration day
  let now = moment();
  /*
  if (optionExpDate === "") {
    if (moment(now.tz('America/New_York')).isBefore(now.day(5).tz('America/New_York').format('YYYY-MM-DD'))) {
      setOptionExpDate(now.day(5).tz('America/New_York').format('YYYY-MM-DD'));
    } else {
      setOptionExpDate(now.day(12).tz('America/New_York').format('YYYY-MM-DD'));
    }
  }
  */

  // Check if market open
  useEffect(() => {
    let today = now.tz('America/New_York').format('YYYY-MM-DD');
    axios.get('/market_hours/XNAS/' + today)
    .then(res => res.data)
    .then(data => {
      if (data !== null) {
        setMarketOpen(data.is_open);
      }
    })
    .catch(err => {
      console.log(err);
    });
  }, []);

  useInterval(() => {
    !(openStockTrade || openOptionTrade) && axios.get('/stock_price/' + stockSymbol)
    .then(res => res.data)
    .then(data => {
      if (data !== null) {
        setStockData(data);
      }

      // Market hour range
      let range = ['09:30', '16:00'];
      let now = moment();
      let cur_time = now.tz('America/New_York').format('HH:mm');
      setExtendedHour(!marketOpen || !isInRange(cur_time, range));
    })
    .catch(err => {
      console.log(err);
    });
  }, 1000);

  useInterval(() => {
    (openStockTrade || openOptionTrade) && axios.get('/stock_price/' + tradingStockSymbol)
    .then(res => res.data)
    .then(data => {
      if (data !== null) {
        setTradingStockData(data);
      }
    });
  }, 300);

  useInterval(() => {
    axios.get('/account_profile')
        .then(res => res.data)
        .then(data => {
          setAccountProfile(data);
        })
        .catch(err => {
          console.log(err);
        });
  }, 1500);

  useInterval(() => {
    if (!openOptionTrade) {
      return;
    }
    axios.get('/stock_option/' + tradingOptionStockSymbol + '/' + tradingOptionExpDate + '/' + tradingOptionType + '/' + tradingOptionStrike)
        .then(res => res.data)
        .then(data => {
          if (data !== null) {
            setTradingOptionData(data);
          }
        })
        .catch(err => {
          console.log(err);
        });
  }, 1000);

  useEffect(() => {
    axios.get('/stock_option_exp_dates/' + optionStockSymbol)
      .then(res => res.data)
      .then(data => {
        setOptionExpDate(data[0]);
        setAvailableOptionExpDates(data);
      })
      .catch(err => {
        console.log(err);
      });
  }, [optionStockSymbol]);

  useEffect(() => {
    fetchCallOptionStrikes();
  }, [optionStockSymbol, optionExpDate]);

  useEffect(() => {
    fetchPutOptionStrikes();
  }, [optionStockSymbol, optionExpDate]);

  /*
  useInterval(fetchCallOptions, 3000);
  useInterval(fetchPutOptions, 3000);
  */

  useEffect(() => {
    setOptionStockSymbol(optionStockFormRef.current.state.symbol);
    fetchCallOptions();
  }, [refreshOptions, callExpanded]);

  useEffect(() => {
    setOptionStockSymbol(optionStockFormRef.current.state.symbol);
    fetchPutOptions();
  }, [refreshOptions, putExpanded]);

  useEffect(() => {
    if (!watchlistExpanded) {
      return;
    }
    axios.get('/watchlist/My%20First%20List')
    .then(res => res.data)
    .then(data => {
      setWatchlist(data.results);
    })
    .catch(err => {
      console.log(err);
    });
  }, [watchlistExpanded]);

  useInterval(() => {
    !(openOptionTrade || openStockTrade) && axios.get('/position').then(res => res.data).then(data => {
      setStockPositions(data["data"]);
      setId2Name(data["id2name"]);
      /*
      if (data["data"].length > 0 && stockFormRef.current != null) {
        stockFormRef.current.handleSetSymbol(data["data"][0]["name"]);
        handleSymbolChange(data["data"][0]["name"]);
      }*/
    })
    .catch(err => {
      console.log(err);
    });
  }, 3000);

  useInterval(() => {
    !(openOptionTrade || openStockTrade) && axios.get('/open_option_position').then(res => res.data).then(position => {
      Promise.all(position.map(p => 
        axios.get('/option/' + p.option_id)
        .then(res => res.data)
        .then(data => ({
          ...p, 
          ...data,
          "name": OptionUtils.get_symbol(data["occ_symbol"]),
          "expiration_date": OptionUtils.get_exp_date(data["occ_symbol"]),
          "option_type": OptionUtils.get_option_type(data["occ_symbol"]),
          "strike_price": OptionUtils.get_strike(data["occ_symbol"]),
          "average_price": numeral(p["average_price"]).value() / 100.0
        })))).then(data => {
          setOptionPositions(data);
        });
      })
      .catch(err => {
        console.log(err);
      });
  }, 3000);

  useInterval(() => {
    !openOptionTrade && axios.get('/open_stock_order')
    .then(res => res.data)
    .then(data => {
      setStockOrders(data);
    })
    .catch(err => {
      console.log(err);
    });
  }, 2000);

  useInterval(() => {
    !openStockTrade && axios.get('/open_option_order').then(res => res.data).then(data => {
      for (let i = 0; i < data.length; ++i) {
        let tokens = data[i]["chain_symbol"].split("/");
        data[i]["name"] = id2Name[tokens[tokens.length - 2]];
      }
      setOptionOrders(data);
    })
    .catch(err => {
      console.log(err);
    });
  }, 2000);

  useInterval(() => {
    !(openOptionTrade || openStockTrade) && axios.get('/stock_order_history/' + stockOrderHistorySize)
    .then(res => res.data)
    .then(data => {
      setStockOrderHistory(data);
    })
    .catch(err => {
      console.log(err);
    });
  }, 3000);

  useInterval(() => {
    !(openOptionTrade || openStockTrade) && axios.get('/option_order_history/' + optionOrderHistorySize)
    .then(res => res.data)
    .then(data => {
      setOptionOrderHistory(data);
    })
    .catch(err => {
      console.log(err);
    });
  }, 3000);

  const handleWatchlistPanelChange = (panel) => (event, isExpanded) => {
    setWatchlistExpanded(isExpanded);
  };

  const handleCallPanelChange = (panel) => (event, isExpanded) => {
    setCallExpanded(isExpanded);
  };

  const handlePutPanelChange = (panel) => (event, isExpanded) => {
    setPutExpanded(isExpanded);
  };

  function handleStockHistorySizeChange(event) {
    setStockOrderHistorySize(event.target.value);
  }

  function handleOptionHistorySizeChange(event) {
    setOptionOrderHistorySize(event.target.value);
  }

  function handleSymbolChange(newSymbol) {
    setStockSymbol(newSymbol);
  }

  function handleQuoteStock(event) {
    let symbol = stockFormRef.current.state.symbol;
    setStockSymbol(symbol);
  }

  function handleTradingSymbolChange(newSymbol) {
    setTradingStockSymbol(newSymbol);
  }

  function handleOptionSymbolChange(newSymbol) {
    setOptionStockSymbol(newSymbol);
  }

  function handleExpDateChange(event) {
    setOptionExpDate(event.target.value);
  }

  function handleDirectBuyStock(event) {
    let symbol = stockFormRef.current.state.symbol;
    let row = {
      "name": symbol,
      "action": "Buy",
      "quantity": 0
    };
    handleTradingSymbolChange(symbol);
    setTradeData(row);
    setOpenStockTrade(true);
  }

  function handleDirectSellStock(event) {
    let symbol = stockFormRef.current.state.symbol.toUpperCase();
    axios.get('/open_stock_positions_by_symbol/' + symbol)
    .then(res => res.data)
    .then(data => {
      if (!data.hasOwnProperty(symbol)) {
        window.alert("You do not have open positions for this stock!");
        return;
      }

      let row = {
        ...data[symbol],
        "name": symbol,
        "action": "Sell"
      };
      handleTradingSymbolChange(symbol);
      setTradeData(row);
      setOpenStockTrade(true);
    })
    .catch(err => {
      console.log(err);
    });
  }

  function handleDirectSellStockStopLimit(event) {
    let symbol = stockFormRef.current.state.symbol.toUpperCase();
    let row = {
      "name": symbol,
      "action": "Sell_Stop_Limit"
    };
    handleTradingSymbolChange(symbol);
    setTradeData(row);
    setOpenStockTrade(true);
  }

  function handleReplaceStockOrder(row) {
    let symbol = "";
    if (row.chain_symbol) {
      symbol = row.chain_symbol;
    } else if (row.symbol) {
      symbol = row.symbol;
    } else if (row.name) {
      symbol = row.name;
    }

    row["name"] = symbol;
    row["action"] = row["side"].charAt(0).toUpperCase() + row["side"].substr(1).toLowerCase();
    handleTradingSymbolChange(symbol);
    setTradeData(row);
    setOpenStockTrade(true);
  }

  function handleBuyStock(row) {
    let symbol = "";
    if (row.chain_symbol) {
      symbol = row.chain_symbol;
    } else if (row.symbol) {
      symbol = row.symbol;
    } else if (row.name) {
      symbol = row.name;
    }

    row["name"] = symbol;
    row["action"] = "Buy";
    row["quantity"] = 0;
    handleTradingSymbolChange(symbol);
    setTradeData(row);
    setOpenStockTrade(true);
  }

  function handleSellStock(row) {
    let symbol = "";
    if (row.chain_symbol) {
      symbol = row.chain_symbol;
    } else if (row.symbol) {
      symbol = row.symbol;
    } else if (row.name) {
      symbol = row.name;
    }

    symbol = symbol.toUpperCase();
    axios.get('/open_stock_positions_by_symbol/' + symbol)
    .then(res => res.data)
    .then(data => {
      if (!data.hasOwnProperty(symbol)) {
        window.alert("You do not have open positions for this stock!");
        return;
      }

      let row = {
        ...data[symbol],
        "name": symbol,
        "action": "Sell"
      };
      handleTradingSymbolChange(symbol);
      setTradeData(row);
      setOpenStockTrade(true);
    })
    .catch(err => {
      console.log(err);
    });
  }

  function handleSellStockStopLimit(row) {
    let symbol = "";
    if (row.chain_symbol) {
      symbol = row.chain_symbol;
    } else if (row.symbol) {
      symbol = row.symbol;
    } else if (row.name) {
      symbol = row.name;
    }

    symbol = symbol.toUpperCase();
    axios.get('/open_stock_positions_by_symbol/' + symbol)
    .then(res => res.data)
    .then(data => {
      if (!data.hasOwnProperty(symbol)) {
        window.alert("You do not have open positions for this stock!");
        return;
      }

      let row = {
        ...data[symbol],
        "name": symbol,
        "action": "Sell_Stop_Limit"
      };
      handleTradingSymbolChange(symbol);
      setTradeData(row);
      setOpenStockTrade(true);
    })
    .catch(err => {
      console.log(err);
    });
  }

  function handleViewStock(row) {
    let symbol = "";
    if (row.chain_symbol) {
      symbol = row.chain_symbol;
    } else if (row.symbol) {
      symbol = row.symbol;
    } else if (row.name) {
      symbol = row.name;
    }
    stockFormRef.current.handleSetSymbol(symbol);
    handleSymbolChange(symbol);
    scroll.scrollToTop();
  }

  function handleViewOption(row) {
    let symbol = stockFormRef.current.state.symbol;
    if (row) {
      if (row.chain_symbol) {
        symbol = row.chain_symbol;
      } else if (row.symbol) {
        symbol = row.symbol;
      } else if (row.name) {
        symbol = row.name;
      }
    }
    optionStockFormRef.current.handleSetSymbol(symbol);
    handleOptionSymbolChange(symbol);
    scroll.scrollToBottom();
  }

  function handleWatchlistBuy(row) {
    let symbol = "";
    if (row.symbol) {
      symbol = row.symbol;
    } else if (row.name) {
      symbol = row.name;
    }

    handleTradingSymbolChange(symbol);
    setTradeData({
      "name": symbol,
      "action": "Buy"
    });
    setOpenStockTrade(true);
  }

  function handleWatchStock(event) {
    let symbol = stockFormRef.current.state.symbol;
    axios.get('/watchlist_add/' + symbol + '/My%20First%20List')
    .then(res => res.data)
    .then(data => {
      window.alert(symbol + " added to watchlist!");
    })
    .catch(error => {
      window.alert(JSON.stringify(error));
    });
  }

  function handleToggleIframe(event) {
    setOpenIframe(!openIframe);
  }

  function handleUnwatchStock(row) {
    axios.get('/watchlist_remove/' + row.symbol + '/My%20First%20List')
    .then(res => res.data)
    .then(data => {
      window.alert(row.symbol + " deleted from watchlist!");
    })
    .catch(error => {
      window.alert(JSON.stringify(error));
    });
  }

  function handleBuyToOpenOption(row) {
    let symbol = "";
    if (row.symbol) {
      symbol = row.symbol;
    } else if (row.name) {
      symbol = row.name;
    } else if (row.occ_symbol) {
      symbol = row.occ_symbol;
    }

    let exp_date = "";
    if (row.expiration_date) {
      exp_date = row.expiration_date;
    } else {
      exp_date = optionExpDate;
    } 

    row["action"] = "Buy";
    row["position_effect"] = "open";
    setTradingStockSymbol(symbol);
    setTradingOptionStockSymbol(symbol);
    setTradingOptionType(row.option_type);
    setTradingOptionExpDate(exp_date);
    setTradingOptionStrike(row.strike_price);
    setTradeData(row);
    setOpenOptionTrade(true);
  }

  function handleBuyToCloseOption(row) {
    let symbol = "";
    if (row.symbol) {
      symbol = row.symbol;
    } else if (row.name) {
      symbol = row.name;
    } else if (row.occ_symbol) {
      symbol = row.occ_symbol;
    }

    let exp_date = "";
    if (row.expiration_date) {
      exp_date = row.expiration_date;
    } else {
      exp_date = optionExpDate;
    }

    row["action"] = "Buy";
    row["position_effect"] = "close";
    setTradingStockSymbol(symbol);
    setTradingOptionStockSymbol(symbol);
    setTradingOptionType(row.option_type);
    setTradingOptionExpDate(exp_date);
    setTradingOptionStrike(row.strike_price);
    setTradeData(row);
    setOpenOptionTrade(true);
  }

  function handleSellToOpenOption(row) {
    let symbol = "";
    if (row.symbol) {
      symbol = row.symbol;
    } else if (row.name) {
      symbol = row.name;
    } else if (row.occ_symbol) {
      symbol = row.occ_symbol;
    }

    let exp_date = "";
    if (row.expiration_date) {
      exp_date = row.expiration_date;
    } else {
      exp_date = optionExpDate;
    } 

    row["action"] = "Sell";
    row["position_effect"] = "open";
    setTradingStockSymbol(symbol);
    setTradingOptionStockSymbol(symbol);
    setTradingOptionType(row.option_type);
    setTradingOptionExpDate(exp_date);
    setTradingOptionStrike(row.strike_price);
    setTradeData(row);
    setOpenOptionTrade(true);
  }

  function handleSellToCloseOption(row) {
    let symbol = "";
    if (row.symbol) {
      symbol = row.symbol;
    } else if (row.name) {
      symbol = row.name;
    } else if (row.occ_symbol) {
      symbol = row.occ_symbol;
    }

    let exp_date = "";
    if (row.expiration_date) {
      exp_date = row.expiration_date;
    } else {
      exp_date = optionExpDate;
    } 

    row["action"] = "Sell";
    row["position_effect"] = "close";
    setTradingStockSymbol(symbol);
    setTradingOptionStockSymbol(symbol);
    setTradingOptionType(row.option_type);
    setTradingOptionExpDate(exp_date);
    setTradingOptionStrike(row.strike_price);
    setTradeData(row);
    setOpenOptionTrade(true);
  }

  function handleCloseStockTrade() {
    setOpenStockTrade(false);
  }

  function handleCloseOptionTrade() {
    setOpenOptionTrade(false);
  }

  function handleRefreshOptions() {
    setOptionStockSymbol(optionStockFormRef.current.state.symbol);
    setRefreshOptions(!refreshOptions);
  }

  function handleViewOptionStock() {
    let symbol = optionStockFormRef.current.state.symbol;
    stockFormRef.current.handleSetSymbol(symbol);
    handleSymbolChange(symbol);
  }

  function fetchCallOptionStrikes() {
    if (optionExpDate === "") {
      return;
    }
    
    let newKey = optionStockSymbol + ' ' + optionExpDate;
    setCallOptionStrikes({...callOptionStrikes, 
      [newKey]: []
    });
    axios.get('/stock_option_strikes/' + optionStockSymbol + '/' + optionExpDate + '/Call')
      .then(res => res.data)
      .then(data => {
        let newKey = optionStockSymbol + ' ' + optionExpDate;
        setCallOptionStrikes({...callOptionStrikes, 
          [newKey]: data
        });
      })
      .catch(err => {
        console.log(err);
      });
  }

  function fetchPutOptionStrikes() {
    if (optionExpDate === "") {
      return;
    }

    let newKey = optionStockSymbol + ' ' + optionExpDate;
    setPutOptionStrikes({...putOptionStrikes, 
      [newKey]: []
    });
    axios.get('/stock_option_strikes/' + optionStockSymbol + '/' + optionExpDate + '/Put')
      .then(res => res.data)
      .then(data => {
        let newKey = optionStockSymbol + ' ' + optionExpDate;
        setPutOptionStrikes({...putOptionStrikes, 
          [newKey]: data
        });
      })
      .catch(err => {
        console.log(err);
      });
  }

  function fetchCallOptions() {
    if (!callExpanded) {
      return;
    }

    let optionType = "Call";
    let key = optionStockSymbol + ' ' + optionExpDate;
    if (!callOptionStrikes.hasOwnProperty(key)) {
      fetchCallOptionStrikes();
    }

    if (callOptionStrikes[key] === undefined) {
      return;
    }

    Promise.all(callOptionStrikes[key].map(price =>
      axios.get('/stock_option/' + optionStockSymbol + '/' + optionExpDate + '/' + optionType + '/' + price)
        .then(res => res.data)))
        .then(data => {
          data.map(option => {
            option["symbol"] = optionStockSymbol;
            option["option_type"] = optionType;
            option["break_even"] = numeral(option["strike_price"]).value() + numeral(option["mark_price"]).value();
            return option;
          });
          return data;
        })
        .then(data => {
          data.sort((a, b) => { return numeral(b.strike_price).value() - numeral(a.strike_price).value(); });
          setCallOptions(data);
        })
        .catch(err => {
          console.log(err);
        });
  }

  function fetchPutOptions() {
    if (!putExpanded) {
      return;
    }

    let optionType = "Put";
    let key = optionStockSymbol + ' ' + optionExpDate;
    if (!putOptionStrikes.hasOwnProperty(key)) {
      fetchPutOptionStrikes();
    }

    if (putOptionStrikes[key] === undefined) {
      return;
    }

    Promise.all(putOptionStrikes[key].map(price =>
      axios.get('/stock_option/' + optionStockSymbol + '/' + optionExpDate + '/' + optionType + '/' + price)
        .then(res => res.data)))
        .then(data => {
          data.map(option => {
            option["symbol"] = optionStockSymbol;
            option["option_type"] = optionType;
            option["break_even"] = numeral(option["strike_price"]).value() - numeral(option["mark_price"]).value();
            return option;
          });
          return data;
        })
        .then(data => {
          data.sort((a, b) => { return numeral(b.strike_price).value() - numeral(a.strike_price).value(); });
          setPutOptions(data);
        })
        .catch(err => {
          console.log(err);
        });
  }

  return (
    <div className="App" style={{ 
      height: 600, 
      width: "95%",
      paddingTop: "50px",
      paddingLeft: "50px",
      paddingRight: "50px"
      }}>
      <header className="App-header">
      </header>
      
      <Grid container direction="row" alignItems="center" spacing={10} >
      <Grid item >
      <div>
      <StockForm symbol={stockSymbol} onSubmit={handleSymbolChange} ref={stockFormRef} />
      <h2> </h2>
      <Button variant="contained" color="primary" onClick={handleQuoteStock} >
        Quote
      </Button><React.Fragment> </React.Fragment>
      <Button variant="contained" color="primary" onClick={handleDirectBuyStock} >
        Buy
      </Button><React.Fragment> </React.Fragment>
      <Button variant="contained" color="primary" onClick={handleDirectSellStock} >
        Sell
      </Button><React.Fragment> </React.Fragment>
      <Button variant="contained" color="primary" onClick={handleDirectSellStockStopLimit} >
        Sell Stop LIMIT
      </Button><React.Fragment> </React.Fragment>
      <Button variant="contained" color="primary" onClick={handleViewOption} >
        Option
      </Button><React.Fragment> </React.Fragment>
      <h2> </h2>
      <Button variant="contained" color="primary" onClick={handleWatchStock} >
        Watch
      </Button><React.Fragment> </React.Fragment>
      <Button variant="contained" color="primary" onClick={handleToggleIframe} >
        Toggle IFrame
      </Button>
      </div>
      </Grid>
      <Grid item >
      <StockCard stockData={stockData} extendedHour={extendedHour} />
      </Grid>
      <Grid item >
      <AccountProfileCard profile={accountProfile} extendedHour={extendedHour} />
      </Grid>
      </Grid>

      <h2> </h2>
      {openIframe && 
      <iframe 
        title="Eastmoney Viewer"
        src={`http://quote.eastmoney.com/us/${stockSymbol}.html#fullScreenChart`}
        loading="lazy"
        width="80%"
        height="800px"
        id="myId"
        className="myClassname"
        display="initial"
        position="relative"/>
      }

      <h2>Watchlist</h2>
      <Accordion square 
      expanded={watchlistExpanded} 
      onChange={handleWatchlistPanelChange('watchlistPanel')}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <h3>My First List</h3>
      </AccordionSummary>
      <AccordionDetails>
      <WatchList 
      items={watchlist} 
      actionHandlers={{
        Buy: handleWatchlistBuy,
        Stock: handleViewStock,
        Option: handleViewOption,
        Unwatch: handleUnwatchStock
      }}/>
      </AccordionDetails>
      </Accordion>

      <h2>Stock Orders</h2>
      <StockOrderTable 
      orders={stockOrders} 
      actionHandlers={{
        Cancel: TradingUtils.handleCancelStockOrder,
        Stock: handleViewStock,
        Option: handleViewOption
      }}/>

      <h2>Option Orders</h2>
      <OptionOrderTable 
      orders={optionOrders} 
      actionHandlers={{
        Cancel: TradingUtils.handleCancelOptionOrder,
        Stock: handleViewStock,
        Option: handleViewOption
      }}/>

      <h2>Stock Positions</h2>
      <StockPositionTable 
      positions={stockPositions} 
      actionHandlers={{
        Buy: handleBuyStock,
        Sell: handleSellStock,
        Sell_Stop_Limit: handleSellStockStopLimit,
        Stock: handleViewStock,
        Option: handleViewOption
      }}/>

      <h2>Option Positions</h2>
      <OptionPositionTable 
      positions={optionPositions} 
      actionHandlers={{
        "Buy/Open": handleBuyToOpenOption,
        "Buy/Close": handleBuyToCloseOption,
        "Sell/Open": handleSellToOpenOption,
        "Sell/Close": handleSellToCloseOption,
        "Buy Stock": handleBuyStock,
        "Sell Stock": handleSellStock,
        "View Stock": handleViewStock,
        "View Option": handleViewOption
      }}/>

      <h2>Stock Order History</h2>
      <form noValidate>
        <InputLabel htmlFor="stock-order-history-id">Most Recent</InputLabel>
        <NativeSelect
          defaultValue={stockOrderHistorySize}
          onChange={handleStockHistorySizeChange}
          inputProps={{
            id: 'stock-order-history-id'
          }}>
          <option key="5" value={5}>5</option>
          <option key="10" value={10}>10</option>
          <option key="20" value={20}>20</option>
          <option key="50" value={50}>50</option>
          <option key="100" value={100}>100</option>
        </NativeSelect>
      </form>
      <StockOrderHistoryTable 
      orders={stockOrderHistory} 
      actionHandlers={{
        "Buy": handleBuyStock,
        "Sell": handleSellStock,
        "Sell Stop Limit": handleSellStockStopLimit,
        "Replace Order": handleReplaceStockOrder,
        "View Stock": handleViewStock,
        "View Option": handleViewOption
      }}/>

      <h2>Option Order History</h2>
      <form noValidate>
        <InputLabel htmlFor="option-order-history-id">Most Recent</InputLabel>
        <NativeSelect
          defaultValue={optionOrderHistorySize}
          onChange={handleOptionHistorySizeChange}
          inputProps={{
            id: 'option-order-history-id'
          }}>
          <option key="5" value={5}>5</option>
          <option key="10" value={10}>10</option>
          <option key="20" value={20}>20</option>
          <option key="50" value={50}>50</option>
          <option key="100" value={100}>100</option>
        </NativeSelect>
      </form>
      <OptionOrderHistoryTable 
      orders={optionOrderHistory} 
      actionHandlers={{
        "Buy Stock": handleBuyStock,
        "Sell Stock": handleSellStock,
        "View Stock": handleViewStock,
        "View Option": handleViewOption
      }}
      />

      <h2>Options</h2>
      <StockForm 
        symbol={optionStockSymbol} 
        onSubmit={handleOptionSymbolChange} 
        ref={optionStockFormRef}
      />
      <h2> </h2>
      <form noValidate>
        <InputLabel htmlFor="exp-date">Expiration Date</InputLabel>
        <NativeSelect
          defaultValue={availableOptionExpDates[0]}
          onChange={handleExpDateChange}
          inputProps={{
            id: 'exp-date'
          }}
        >
          {availableOptionExpDates.map(date => (
            <option key={date} value={date}>{date}</option>
          ))}
        </NativeSelect>
      </form>
      
      <br/>
      <Button variant="contained" color="primary" onClick={handleRefreshOptions} >
        Refresh
      </Button><React.Fragment> </React.Fragment>
      <Button variant="contained" color="primary" onClick={handleViewOptionStock} >
        View Stock
      </Button>

      <h2> </h2>
      <Accordion square 
      expanded={callExpanded} 
      onChange={handleCallPanelChange('callPanel')}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <h3>Call</h3>
      </AccordionSummary>
      <AccordionDetails>
      <OptionTable 
      options={callOptions} 
      actionHandlers={{
        "Buy/Open": handleBuyToOpenOption,
        "Sell/Open": handleSellToOpenOption
      }}/>
      </AccordionDetails>
      </Accordion>

      <Accordion square 
      expanded={putExpanded} 
      onChange={handlePutPanelChange('putPanel')}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <h3>Put</h3>
      </AccordionSummary>
      <AccordionDetails>
      <OptionTable 
      options={putOptions} 
      actionHandlers={{
        "Buy/Open": handleBuyToOpenOption,
        "Sell/Open": handleSellToOpenOption
      }}/>
      </AccordionDetails>
      </Accordion>
      <BottomNavigation>
      </BottomNavigation>
      <StockTradeDialog 
      open={openStockTrade} 
      data={tradeData} 
      stockData={tradingStockData} 
      accountProfile={accountProfile}
      orderData={stockOrders}
      handleClose={handleCloseStockTrade} />
      <OptionTradeDialog 
      open={openOptionTrade} 
      data={tradeData} 
      stockData={tradingStockData} 
      optionData={tradingOptionData} 
      orderData={optionOrders}
      accountProfile={accountProfile}
      handleClose={handleCloseOptionTrade} />

      <div className={classes.fab}>
      {!openStockTrade && 
      <Fab variant="extended" 
      color="primary" aria-label="edit"
      onClick={() => setOpenStockTrade(true)}>
        <EditIcon />
        Stock Order
      </Fab>
      }
      {!openOptionTrade && 
      <Fab variant="extended" 
      color="primary" aria-label="edit"
      onClick={() => setOpenOptionTrade(true)}>
        <EditIcon />
        Option Order
      </Fab>
      }
      </div>
    </div>
  );
}

function mapStateToProps(state) {
  const { users, authentication } = state;
  const { user } = authentication;
  return { 
    user,
    users,
    loggedIn: state.authentication.loggedIn
  };
}

const actionCreators = {
  getUsers: userActions.getAll,
  deleteUser: userActions.delete
}

const connectedHomePage = connect(mapStateToProps, actionCreators)(HomePage);
export { connectedHomePage as HomePage };
