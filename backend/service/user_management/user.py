import sys
import os
from os.path import dirname, join, abspath
sys.path.insert(0, abspath(join(dirname(__file__), '../..')))
from data import database
from config.exception import AuthorizationError

''' Implementation for user management '''

def login(user_email, access_token):
    ''' add/update user information '''
    if database.exist_user(user_email):
        database.update_user(user_email, access_token)
    else:
        database.add_user(user_email, access_token)

def get_email_by_token(access_token):
    ''' find user's email with given access token '''
    if not access_token:
        raise AuthorizationError('Missing access token')
    email = database.find_email_by_token(access_token)
    if not email:
        raise AuthorizationError('Invalid access token')
    return email