"""
Module for processing Flask routes.
"""
import json
import requests
import redis

from flask import Flask, app, request, session
from flask.json import jsonify
from flaskrun import flaskrun
from flask_session import Session

import module.robinhood as rs
from module.robinhood_auth import RobinhoodAuth
from module.auth import login_required
from module.crypto import rsa_decrypt
from utils.logging import logger

URL_PREFIX = "/api"

app = Flask(__name__, static_url_path='', static_folder='../client/build')
app.secret_key = 'WEB_TRADER_SECRET_KEY'

# Configure Redis for storing the session data on the server-side
app.config['SESSION_TYPE'] = 'redis'
app.config['SESSION_PERMANENT'] = False
app.config['SESSION_USE_SIGNER'] = True
app.config['SESSION_REDIS'] = redis.from_url('redis://redis:6379')

sess = Session()
sess.init_app(app)

rh = RobinhoodAuth()

@app.errorhandler(Exception)
def handle_exception(e):
    """Return JSON instead of HTML for HTTP errors."""
    # start with the correct headers and status code from the error
    import traceback
    traceback.print_exc()
    logger.error(str(e))
    return json.dumps({'message': str(e)}), 500

@app.route('/')
def root():
    return app.send_static_file('index.html')

@app.route(URL_PREFIX + '/api_key')
def get_api_key():
    # Get public key
    with open("auth/rsa_public.pem") as f:
        api_key = f.read()

    return jsonify({
        "api": api_key
    })

@app.route(URL_PREFIX + '/users/authenticate', methods=['POST'])
def authenticate_user():
    if request.method == 'POST':
        if request.content_type == 'application/json':
            username = request.json.get('username')
            password = request.json.get('password')
        else:
            username = request.form.get('username')
            password = request.form.get('password')

    try:
        key_file_path = "auth/rsa_private.pem"
        username = rsa_decrypt(username, key_file_path).decode()
        password = rsa_decrypt(password, key_file_path).decode()

        data = rh.login_server(username, password)
        if data is not None and "access_token" in data:
            session.update(data)
        return json.dumps(data), 200
    except Exception as e:
        import traceback
        traceback.print_exc()
        logger.error(str(e))
        return json.dumps({'message': str(e)}), 401

@app.route(URL_PREFIX + '/users/authenticate/challenge', methods=['POST'])
def user_challenge_response():
    if request.method == 'POST':
        if request.content_type == 'application/json':
            username = request.json.get('username')
            password = request.json.get('password')
            challenge_id = request.json.get('challenge_id')
            sms_code = request.json.get('sms_code')
            device_token = request.json.get('device_token')
        else:
            username = request.form.get('username')
            password = request.form.get('password')
            challenge_id = request.form.get('challenge_id')
            sms_code = request.form.get('sms_code')
            device_token = request.form.get('device_token')

    try:
        key_file_path = "auth/rsa_private.pem"
        username = rsa_decrypt(username, key_file_path).decode()
        password = rsa_decrypt(password, key_file_path).decode()

        data = rh.login_server(
            username, password, 
            device_token=device_token, 
            challenge_id=challenge_id, 
            sms_code=sms_code)
        if data is not None and "access_token" in data:
            session.update(data)
        return json.dumps(data)
    except Exception as e:
        logger.error(str(e))
        return json.dumps({'message': str(e)}), 401

@app.route(URL_PREFIX + '/logout', methods=['POST'])
@login_required
def logout_user():
    if not rh.logout():
        return json.dumps({"response": "Unauthorized action!"}), 404
    session.clear()
    return json.dumps({"response": "User has been logged out!"})

@app.route(URL_PREFIX + '/stock_price/<symbol>')
@login_required
def get_stock_price(symbol):
    data = rs.stocks.get_stock_quote_by_symbol(symbol)
    fundamentals = rs.stocks.get_fundamentals(symbol)[0]
    data["open"] = fundamentals["open"]
    data["high"] = fundamentals["high"]
    data["low"] = fundamentals["low"]
    data["volume"] = fundamentals["volume"]
    data["industry"] = fundamentals["industry"]
    return jsonify(data)

@app.route(URL_PREFIX + '/query_symbol/<query>/<top_k>')
def query_symbol(query, top_k):
    url = 'https://query1.finance.yahoo.com/v1/finance/search?q=' + query + '&lang=en-US&region=US&quotesCount={}&newsCount=0'.format(top_k)
    headers = {'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/50.0.2661.102 Safari/537.36'}
    r = requests.get(url, headers=headers)
    return jsonify(r.json())

@app.route(URL_PREFIX + '/instrument')
@login_required
def get_instrument():
    url = request.args.get('url')
    data = rs.stocks.get_instrument_by_url(url)
    return jsonify(data)

@app.route(URL_PREFIX + '/market_hours/<market>/<date>')
@login_required
def get_market_hours(market, date):
    data = rs.markets.get_market_hours(market, date)
    return jsonify(data)

@app.route(URL_PREFIX + '/watchlist/<name>')
@login_required
def get_watchlist(name):
    data = rs.account.get_watchlist_by_name(name)
    return jsonify(data)

@app.route(URL_PREFIX + '/watchlist_add/<symbol>/<list_name>')
@login_required
def watchlist_add(symbol, list_name):
    data = rs.account.post_symbols_to_watchlist(symbol)
    return jsonify(data)

@app.route(URL_PREFIX + '/watchlist_remove/<symbol>/<list_name>')
@login_required
def watchlist_remove(symbol, list_name):
    data = rs.account.delete_symbols_from_watchlist(symbol, list_name)
    return jsonify(data)

@app.route(URL_PREFIX + '/option/<option_id>')
@login_required
def get_option_data(option_id):
    data = rs.options.get_option_market_data_by_id(option_id)
    return jsonify(data[0])

@app.route(URL_PREFIX + '/stock_option/<symbol>/<exp_date>/<option_type>/<strike_price>')
@login_required
def get_stock_options(symbol, exp_date, option_type, strike_price):
    strike_price = float(strike_price)
    data = rs.options.find_options_by_expiration_and_strike(
        inputSymbols=symbol, 
        expirationDate=exp_date, 
        optionType=option_type,
        strikePrice=strike_price)
    return jsonify(data[0])

@app.route(URL_PREFIX + '/stock_option_quote/<id>')
@login_required
def get_stock_option_by_id(id):
    data = rs.options.get_option_instrument_data_by_id(id)
    return jsonify(data)

@app.route(URL_PREFIX + '/stock_option_strikes/<symbol>/<exp_date>/<option_type>')
@login_required
def get_stock_option_strikes(symbol, exp_date, option_type):
    data = rs.options.find_options_by_expiration(
        inputSymbols=symbol, 
        expirationDate=exp_date, 
        optionType=option_type)
    strikes = [d["strike_price"] for d in data]
    return jsonify(strikes)

@app.route(URL_PREFIX + '/stock_option_exp_dates/<symbol>')
@login_required
def get_stock_option_exp_dates(symbol):
    data = rs.options.get_chains(symbol)
    return jsonify(data["expiration_dates"])

@app.route(URL_PREFIX + '/account_profile')
@login_required
def get_account_profile():
    account_profile = rs.profiles.load_account_profile()
    portfolio_profile = rs.profiles.load_portfolio_profile()
    day_trades = rs.account.get_day_trades()
    return jsonify({
        "buying_power": account_profile["buying_power"],
        "margin_buying_power": float(account_profile["buying_power"]) * 2,
        "portfolio_cash": account_profile["portfolio_cash"],
        "cash_held_for_options_collateral": account_profile["cash_held_for_options_collateral"],
        "cash_held_for_orders": account_profile["cash_held_for_orders"],
        "market_value": portfolio_profile["market_value"],
        "equity": portfolio_profile["equity"],
        "equity_previous_close": portfolio_profile["equity_previous_close"],
        "extended_hours_market_value": portfolio_profile["extended_hours_market_value"],
        "extended_hours_equity": portfolio_profile["extended_hours_equity"],
        "last_core_market_value": portfolio_profile["last_core_market_value"],
        "num_of_equity_day_trades": len(day_trades["equity_day_trades"]),
        "num_of_option_day_trades": len(day_trades["option_day_trades"])
    })

@app.route(URL_PREFIX + '/day_trades')
@login_required
def get_day_trades():
    data = rs.account.get_day_trades()
    return jsonify(data)

@app.route(URL_PREFIX + '/position')
@login_required
def get_account_positions():
    data = rs.account.build_holdings()
    res = []
    id2name = {}
    for k, v in data.items():
        v["name"] = k
        res.append(v)
        id2name[v["id"]] = v["name"]
    return jsonify({
        "data": res,
        "id2name": id2name
    })

@app.route(URL_PREFIX + '/open_stock_positions')
@login_required
def get_open_stock_positions():
    data = rs.account.get_open_stock_positions()
    return jsonify(data)

@app.route(URL_PREFIX + '/open_stock_positions_by_symbol/<symbol>')
@login_required
def get_open_stock_positions_by_symbol(symbol):
    results = {}
    data = rs.account.get_open_stock_positions()
    for d in data:
        inst = requests.get(d["instrument"]).json()
        if inst["symbol"] == symbol:
            results[inst["symbol"]] = d
    return jsonify(results)

@app.route(URL_PREFIX + '/open_option_position')
@login_required
def get_open_option_positions():
    data = rs.options.get_open_option_positions()
    return jsonify(data)

@app.route(URL_PREFIX + '/stock_order_history/<size>')
@login_required
def get_all_stock_orders(size):
    data = rs.orders.get_all_stock_orders()[:int(size)]
    for order in data:
        instrument = rs.stocks.get_instrument_by_url(order["instrument"])
        order["symbol"] = instrument["symbol"]
    return jsonify(data)

@app.route(URL_PREFIX + '/stock_order_info/<id>')
@login_required
def get_stock_order_info(id):
    data = rs.orders.get_stock_order_info(id)
    return jsonify(data)

@app.route(URL_PREFIX + '/option_order_history/<size>')
@login_required
def get_all_option_orders(size):
    data = rs.orders.get_all_option_orders()[:int(size)]
    return jsonify(data)

@app.route(URL_PREFIX + '/option_order_info/<id>')
@login_required
def get_option_order_info(id):
    data = rs.orders.get_option_order_info(id)
    return jsonify(data)

@app.route(URL_PREFIX + '/buying_power')
@login_required
def get_buying_power():
    data = rs.profiles.load_account_profile()
    return jsonify({"buying_power": data["buying_power"]})

@app.route(URL_PREFIX + '/order_buy_limit/<symbol>/<quantity>/<price>/<timeInForce>')
@login_required
def order_buy_limit(symbol, quantity, price, timeInForce):
    data = rs.orders.order_buy_limit(
        symbol=symbol, quantity=float(quantity), limitPrice=float(price), 
        timeInForce=timeInForce, extendedHours=True)
    return jsonify(data)

@app.route(URL_PREFIX + '/order_sell_limit/<symbol>/<quantity>/<price>/<timeInForce>')
@login_required
def order_sell_limit(symbol, quantity, price, timeInForce):
    data = rs.orders.order_sell_limit(
        symbol=symbol, quantity=float(quantity), limitPrice=float(price), 
        timeInForce=timeInForce, extendedHours=True)
    return jsonify(data)

@app.route(URL_PREFIX + '/order_buy_market/<symbol>/<quantity>')
@login_required
def order_buy_market(symbol, quantity):
    data = rs.orders.order_buy_market(
        symbol=symbol, quantity=float(quantity),
        timeInForce='gfd', extendedHours=True)
    return jsonify(data)

@app.route(URL_PREFIX + '/order_sell_stop_limit/<symbol>/<quantity>/<limitPrice>/<stopPrice>/<timeInForce>')
@login_required
def order_sell_stop_limit(symbol, quantity, limitPrice, stopPrice, timeInForce):
    """
    Extended hours orders cannot have stop price.
    """
    data = rs.orders.order_sell_stop_limit(
        symbol=symbol, quantity=float(quantity),
        limitPrice=float(limitPrice), stopPrice=float(stopPrice),
        timeInForce=timeInForce, extendedHours=False)
    return jsonify(data)

@app.route(URL_PREFIX + '/order_buy_option_limit/<position_effect>/<credit_or_debit>/<price>/<symbol>/<quantity>/<expiration_date>/<strike>/<option_type>/<timeInForce>')
@login_required
def order_buy_option_limit(position_effect, credit_or_debit, price, symbol, quantity, expiration_date, strike, option_type, timeInForce):
    data = rs.orders.order_buy_option_limit(
        position_effect, credit_or_debit, float(price), symbol, 
        float(quantity), expiration_date, float(strike), option_type, 
        timeInForce=timeInForce)
    return jsonify(data)

@app.route(URL_PREFIX + '/order_sell_option_limit/<position_effect>/<credit_or_debit>/<price>/<symbol>/<quantity>/<expiration_date>/<strike>/<option_type>/<timeInForce>')
@login_required
def order_sell_option_limit(position_effect, credit_or_debit, price, symbol, quantity, expiration_date, strike, option_type, timeInForce):
    data = rs.orders.order_sell_option_limit(
        position_effect, credit_or_debit, float(price), symbol, 
        float(quantity), expiration_date, float(strike), option_type, 
        timeInForce=timeInForce)
    return jsonify(data)

@app.route(URL_PREFIX + '/open_stock_order')
@login_required
def get_open_stock_orders():
    data = rs.orders.get_all_open_stock_orders()
    for d in data:
        inst = requests.get(d["instrument"]).json()
        d["name"] = inst["symbol"]
    return jsonify(data)

@app.route(URL_PREFIX + '/open_option_order')
@login_required
def get_open_option_orders():
    data = rs.orders.get_all_open_option_orders()
    return jsonify(data)

@app.route(URL_PREFIX + '/cancel_stock_order/<order_id>')
@login_required
def cancel_stock_order(order_id):
    data = rs.orders.cancel_stock_order(order_id)
    return jsonify(data)

@app.route(URL_PREFIX + '/cancel_option_order/<order_id>')
@login_required
def cancel_option_order(order_id):
    data = rs.orders.cancel_option_order(order_id)
    return jsonify(data)


if __name__ == "__main__": 
    flaskrun(app)