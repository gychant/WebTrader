import React, { Component } from 'react';
import AppBar from '@mui/material/AppBar';
import SearchIcon from '@material-ui/icons/Search';
import InputBase from '@mui/material/InputBase';
import { fade, makeStyles } from '@mui/styles';


const useStyles = makeStyles((theme) => ({
    appBar: {
        top: 'auto',
        bottom: 0,
    },
    inputRoot: {
        color: 'inherit',
    },
    inputInput: {
        padding: theme.spacing(1, 1, 1, 0),
        // vertical padding + font size from searchIcon
        paddingLeft: `calc(1em + ${theme.spacing(4)}px)`,
        transition: theme.transitions.create('width'),
        width: '100%',
        [theme.breakpoints.up('md')]: {
        width: '20ch',
        },
    },
    search: {
        position: 'relative',
        borderRadius: theme.shape.borderRadius,
        backgroundColor: fade(theme.palette.common.white, 0.15),
        '&:hover': {
        backgroundColor: fade(theme.palette.common.white, 0.25),
        },
        marginRight: theme.spacing(2),
        marginLeft: 0,
        width: '100%',
        [theme.breakpoints.up('sm')]: {
        marginLeft: theme.spacing(3),
        width: 'auto',
        },
    },
    searchIcon: {
        padding: theme.spacing(0, 2),
        height: '100%',
        position: 'absolute',
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
}));

const classes = useStyles();
  
class SearchBar extends Component {
    constructor(props) {
      super(props);
      this.state = {
        symbol: props.symbol,
      };
      this.handleChange = this.handleChange.bind(this);
    }
  
    handleChange(event) {
      this.props.onSubmit(this.state.symbol);
      event.preventDefault();
    }

    handleSetSymbol(newSymbol) {
      this.setState({ symbol: newSymbol });
    }
  
    render() {
      return (
        <div>
          <AppBar position="fixed" className={classes.appBar} >
            <div className={classes.search}>
            <div className={classes.searchIcon}>
                <SearchIcon />
            </div>
            <InputBase
                placeholder={stockSymbol}
                classes={{
                root: classes.inputRoot,
                input: classes.inputInput,
                }}
                inputProps={{ 'aria-label': 'search' }}
            />
            </div>
          </AppBar>
        </div>
      );
    }
}

export default SearchBar;