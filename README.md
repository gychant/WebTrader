# WebTrader
This repository provides a personalized trading platform for Robinhood accounts. It aims to enable the trading of stocks and options in a single webpage and reduces the operating time of order submission and cancellation. It is containerized using docker thus easy to deploy to the cloud.

## About me
[LinkedIn](https://www.linkedin.com/in/zhicheng-liang-63941a120/)

## Motivation
The well-known [Robin-Stocks API](https://github.com/jmfernandes/robin_stocks) supports single user session only and uses console-based login. It is tempting to build a browser web app that provides UI-based login experience and can be hosted in a server accepting multi-user login.

## Tech stacks
- Front-end: 
    - [React](https://reactjs.org/)
    - [Redux](https://redux.js.org/)
    - [Material-UI](https://mui.com/)
- Back-end
    - [Flask](https://flask.palletsprojects.com/en/2.2.x/)
    - [Redis](https://redis.io/) (Currently for session management)

## Reference
- [Robin-Stocks API](https://github.com/jmfernandes/robin_stocks)
- [Redux-based user login state management](https://github.com/cornflourblue/react-redux-registration-login-example)

## Installation
### Ubuntu Linux
```
# pip and venv
sudo apt update
sudo apt install python3-venv python3-pip
python3 -m pip install --user --upgrade pip
python3 -m venv .venv
source .venv/bin/activate

# Dependencies
pip install -r server/requirements.txt

# node.js related
sudo apt install nodejs npm
```

## RSA key pair generation
RSA encryption is used to encrypt user credentials when they are sent to the Flask backend for authentication with Robinhood. Please generate your key pairs as follows.
```
cd server
export PYTHONPATH=.
python module/rsa.py \
    --output_dir ./auth \
    --public_key_file rsa_public.pem \
    --private_key_file rsa_private.pem 
```

## Devolopment
To start the containers for development,
```
docker-compose -f docker-compose.override.yml up -d --build
```

## Production
To start the containers for production,
```
docker-compose -f docker-compose.yml up -d --build
```