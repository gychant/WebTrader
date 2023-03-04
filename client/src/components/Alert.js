import React from 'react';
import Alert from "@mui/material/Alert";

function AlertComponent(props) {
    return <Alert elevation={6} variant="filled" {...props} />;
}

export { AlertComponent as Alert };
