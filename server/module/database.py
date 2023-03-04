"""
Module for interacting with MongoDB
"""
from pymongo import MongoClient
from utils.logging import logger

class MongoDB(object):
    def __new__(cls):
        if not hasattr(cls, "instance"):
            cls.instance = super(MongoDB, cls).__new__(cls)
            cls.instance.client = MongoClient("mongodb://root:example@mongo:27017/")
        return cls.instance

    @classmethod
    def get_client(cls):
        return cls.instance.client
    
    @classmethod
    def get_collection(cls):
        pass

class UserSessionDB(MongoDB):
    def __new__(cls):
        return super(UserSessionDB, cls).__new__(cls)
    
    @classmethod
    def get_collection(cls):
        return cls.get_client()["web-trader-db"]["user_sessions"]
    
    @classmethod
    def get_session(cls, user_id):
        return cls.get_collection().find_one({
            "username": user_id
        })
    
    @classmethod
    def get_session_by_access_token(cls, access_token):
        return cls.get_collection().find_one({
            "access_token": access_token
        })

    @classmethod
    def update_session(cls, user_id, session):
        cls.get_collection().update_one({
            "username": user_id
        }, {
            "$set": session
        })

    @classmethod
    def add_session(cls, session):
        cls.get_collection().insert_one(session)

    @classmethod
    def remove_session(cls, user_id):
        cls.get_collection().delete_one({
            "username": user_id
        })
