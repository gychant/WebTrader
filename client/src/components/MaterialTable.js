import React from "react";

import { makeStyles } from '@mui/styles';
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";

var numeral = require('numeral');
var moment = require('moment-timezone');

const useStyles = makeStyles({
  table: {
    minWidth: 550
  },
  container: {
    maxHeight: 600
  }
});

export default function SimpleTable({ rows, columns, actionHandlers}) {
  const classes = useStyles();

  return (
    <TableContainer component={Paper} className={classes.container} >
      <Table stickyHeader className={classes.table} aria-label="simple table">
        <TableHead>          
          <TableRow>
            {columns.map(col => (
              <TableCell align="left" key={col.headerName}>{col.headerName}</TableCell>
            ))}
            {Object.keys(actionHandlers).length > 0 && 
              <TableCell align="left" key="Actions">Actions</TableCell>
            }
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow hover key={row.id}>
              {columns.map(col => (
                (col.headerName === "timestamp") ? 
                <TableCell align="left" key={col.field}>{moment.utc(row[col.field]).tz('America/New_York').format('YYYY-MM-DD hh:mm:ss a')}</TableCell> :
                <TableCell align="left" key={col.field}>{row[col.field] == null ? "" : (isNaN(row[col.field]) ? row[col.field] : ((Number.isInteger(numeral(row[col.field]).value()))? numeral(row[col.field]).format('0') : numeral(row[col.field]).format('0.000'))) }</TableCell>
              ))}
              <TableCell align="left" component="th" scope="row">
                {Object.keys(actionHandlers).map(action => (
                  <Button key={action} onClick={() => (actionHandlers[action])(row)}>
                  {action}
                  </Button>
                ))}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
