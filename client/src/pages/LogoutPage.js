import React from 'react';
import { connect } from 'react-redux';
import { Link } from "react-router-dom";

import { Typography, Button } from "@mui/material";

import { userActions } from '../_actions';

class LogoutPage extends React.Component {
    constructor(props) {
        super(props);

        // reset login status
        this.props.logout();
    }
    
    render() {
        return (
            <div style={{
                position: 'absolute', left: '20%', top: '20%', right: '20%'
            }}>
                <Typography variant="h5" style={{ marginBottom: 8 }}>
                    You have logged out ...
                </Typography>
                <Button
                variant="contained"
                color="primary"
                className="form-input"
                size="large"
                component={Link} 
                to="/login"
                >
                Login
                </Button>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {};
}

const actionCreators = {
    logout: userActions.logout
};

const connectedLogoutPage = connect(mapStateToProps, actionCreators)(LogoutPage);
export { connectedLogoutPage as LogoutPage };