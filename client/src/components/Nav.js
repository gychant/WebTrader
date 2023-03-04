import React, { Component } from "react";
import { Link } from "react-router-dom";
import { AppBar, Toolbar, Button, Typography } from "@mui/material";
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { connect } from "react-redux";

import { userActions } from '../_actions';

class NavBar extends Component {
  render() {
    return (
      <AppBar position="static" style={{ display: "flex" }}>
        <Toolbar>
          <Typography variant="h6">Web Trader</Typography>
          <div style={{ marginLeft: "auto" }}>
            {this.props.user ? (
              <React.Fragment>
                {this.props.user.username.indexOf("@") > 0 && 
                <Typography variant="subtitle1">{this.props.user.username}<AccountCircleIcon fontSize='large'/></Typography>
                }
                <Button variant="secondary" color="info" component={Link} to="/logout">Logout</Button>
              </React.Fragment>
            ) : (<React.Fragment></React.Fragment>)
            }
          </div>
        </Toolbar>
      </AppBar>
    );
  }
}

function mapState(state) {
    return {
      user: state.authentication.user
    };
}

const actionCreators = {
    getUsers: userActions.getAll,
    deleteUser: userActions.delete
}

const connectedHomePage = connect(mapState, actionCreators)(NavBar);
export { connectedHomePage as NavBar };
