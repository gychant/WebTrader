"""
Module for defining authentication.
"""
from flask import request, jsonify, make_response, session
from functools import wraps
from utils.logging import logger


def login_required(f):
    @wraps(f)
    def decorator(*args, **kwargs):
        token = request.headers.get("Authorization", None)
        if not token: # throw error if no token provided
            return make_response(jsonify({"message": "A valid token is missing!"}), 401)
        
        if "access_token" not in session or token != session["access_token"]:
            return make_response(jsonify({"message": "Invalid token!"}), 401)
        
        return f(*args, **kwargs)
    return decorator