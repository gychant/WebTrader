import React from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { connect } from 'react-redux';

import { TextField, Typography, Button, Grid } from "@mui/material";
import { Alert } from "../components/Alert";
import Collapse from '@mui/material/Collapse';

import { userActions } from '../_actions';
import { alertActions } from '../_actions';
import axios from '../api';

import JSEncrypt from 'jsencrypt';

class LoginPage extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            username: '',
            password: '',
            sms_code: '',
            error: '',
            submitted: false,
            loggedIn: false
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChange(e) {
        const { name, value } = e.target;
        this.setState({ [name]: value });
    }

    handleSubmit(e) {
        e.preventDefault();

        axios.get('/api_key')
        .then(res => res.data)
        .then(data => {
            this.setState({ submitted: true });
            const { username, password, sms_code } = this.state;
    
            // Encrytion
            let key = data["api"];
            let encrypt = new JSEncrypt();
            encrypt.setPublicKey(key);

            let encryted_username = encrypt.encrypt(username);
            let encryted_password = encrypt.encrypt(password);

            if (this.props.challenge_id && username && password && sms_code) {
                this.props.respondToChallenge(encryted_username, encryted_password, 
                    this.props.challenge_id, sms_code, this.props.device_token);
            }
            else if (username && password) {
                this.props.login(encryted_username, encryted_password);
            }
        });
    }

    render() {
        const { username, password, submitted, sms_code } = this.state;
        let display_sms = this.props.challenge_id ? 'inline' : 'none';
        
        if (this.props.loggedIn) {
            return (<Navigate to="/" />);
        }

        return (
            <div style={{
                position: 'absolute', left: '20%', top: '20%', right: '20%'
            }}>
                <form>
                    <Grid container direction={"column"} spacing={3}>
                    <Grid item>
                    <Typography variant="h5" style={{ marginBottom: 8 }}>
                        Robinhood Login
                    </Typography>
                    </Grid>
                    
                    <Grid item>
                    <TextField
                    required
                    focused
                    label="Email"
                    className="form-input"
                    name="username"
                    value={username}
                    onChange={this.handleChange}
                    fullWidth
                    />
                    {submitted && !username &&
                        <div className="help-block">Username is required</div>
                    }
                    </Grid>

                    <Grid item>
                    <TextField
                    required
                    label="Password"
                    className="form-input"
                    name="password"
                    type="password"
                    value={password}
                    onChange={this.handleChange}
                    fullWidth
                    />
                    {submitted && !password &&
                        <div className="help-block">Password is required</div>
                    }
                    </Grid>

                    <Grid item>
                    <TextField
                    disabled={!this.props.challenge_id}
                    label="SMS Code"
                    className="form-input"
                    name="sms_code"
                    onChange={this.handleChange}
                    fullWidth
                    inputProps={{ style: { 
                        display: display_sms === 'none'
                    }}}
                    />
                    {this.props.challenge_id && submitted && !sms_code &&
                        <div className="help-block">SMS code is required</div>
                    }
                    </Grid>

                    <Grid item>
                    <Button
                    variant="contained"
                    color="primary"
                    className="form-input"
                    size="large"
                    onClick={this.handleSubmit} >
                    Login
                    </Button>
                    </Grid>

                    <Collapse in={this.props.alert.message !== undefined}>
                        <Alert severity="error">
                        {this.props.alert.message}
                        </Alert>
                    </Collapse>
                    </Grid>
                </form>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        loggingIn: state.authentication.loggingIn,
        challenge_id: state.authentication.challenge_id,
        device_token: state.authentication.device_token,
        alert: state.alert,
        loggedIn: state.authentication.loggedIn
    };
}

const actionCreators = {
    login: userActions.login,
    logout: userActions.logout,
    respondToChallenge: userActions.respondToChallenge,
    clearAlerts: alertActions.clear
};

const connectedLoginPage = connect(mapStateToProps, actionCreators)(LoginPage);
export { connectedLoginPage as LoginPage };
