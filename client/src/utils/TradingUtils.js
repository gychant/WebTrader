import axios from '../api';

export function handleCancelStockOrder(row) {
    axios.get('/cancel_stock_order/' + row.id)
    .then(res => res.data).then(data => {
        window.alert("The stock order " + row.id + " has been canceled!");
    });
}
  
export function handleCancelOptionOrder(row) {
    axios.get('/cancel_option_order/' + row.id)
    .then(res => res.data).then(data => {
        window.alert("The option order " + row.id + " has been canceled!");
    });
}