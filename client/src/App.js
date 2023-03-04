import React from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';

import { PrivateRoute } from './_components';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { LogoutPage } from './pages/LogoutPage';
import { NavBar } from "./components/Nav";

class App extends React.Component {
    render() {
        const theme = createTheme();
        return (
            <ThemeProvider theme={theme}>
            <div className="jumbotron">
                <div className="container">
                    <div className="col-sm-8 col-sm-offset-2">
                        <BrowserRouter basename="/">
                            {<NavBar />}
                            <div className="container">
                            <Routes>
                                <Route exact path='/' element={<PrivateRoute />}>
                                    <Route exact path='/' element={<HomePage />}/>
                                </Route>
                                <Route path="/login" element={<LoginPage />} />
                                <Route path="/logout" element={<LogoutPage />} />
                                <Route path="/auth" element={<Navigate from="*" to="/" />} />
                            </Routes>
                            </div>
                        </BrowserRouter>
                    </div>
                </div>
            </div>
            </ThemeProvider>
        );
    }
}

export { App };
