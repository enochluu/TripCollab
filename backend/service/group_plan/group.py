import sys
import os
from os.path import dirname, join, abspath
sys.path.insert(0, abspath(join(dirname(__file__), '../..')))
from data import database
from config.exception import ValueError
from service.user_management import user

''' Implementation for group management '''

def create_group(group_name, leader_token, trip_date, location):
    ''' create a group '''
    group_id = group_name + '_' + trip_date
    if database.exist_group(group_id):
        raise ValueError('Group id not unique')
    leader_email = database.find_email_by_token(leader_token)
    if not leader_email:
        raise AuthorizationError('Invalid access token')
    database.add_group(leader_email, group_id, location)

def get_location(group_id):
    ''' get trip location of the group '''
    result = {}
    if not database.exist_group(group_id):
        raise ValueError(f"Group '{group_id}' does not exist")
    result['location'] = database.get_group_location(group_id)
    return result

def is_leader_of_group(group_id, access_token):
    ''' check if the user with given token is the leader of this group '''
    email = user.get_email_by_token(access_token)
    leader_email = database.find_group_leader(group_id)
    if not leader_email:
        raise ValueError(f"Group '{group_id}' does not exist")
    return email == leader_email