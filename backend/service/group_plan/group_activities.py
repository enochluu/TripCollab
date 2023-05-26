import sys
import os
from os.path import dirname, join, abspath
sys.path.insert(0, abspath(join(dirname(__file__), '../..')))
from data import database, cache
from config.exception import ValueError
from service.group_plan import group
from service.user_management import user
from utils import place

''' Implementation for activity nomination, vote and poll '''

def get_nominations_from_database(group_id):
    ''' get basic information of nominated activities of given group from database '''
    if not database.exist_group(group_id):
        raise ValueError(f"Group '{group_id}' does not exist")
    activities = []
    for activity_info in database.get_nominations(group_id):
        (activity_id, activity_name, rating, photo_reference, category) = activity_info
        activities.append(
            {
                'activity_id': activity_id,
                'activity_name': activity_name,
                'rating': rating,
                'photo_reference': photo_reference,
                'category': category
            }
        )
    return activities

def add_activity_to_database(group_id, google_places_id, activity_name, rating, photo_reference, category, activity_type):
    if database.exist_activity(group_id, google_places_id):
        raise ValueError('Activity has been nominated')
    photo_content = database.get_photo(photo_reference)
    if not photo_content:
        photo_content = place.get_photo_content(photo_reference, 500)
        database.add_photo(photo_reference, photo_content)
    activity_id = database.add_activity(group_id, google_places_id, activity_name, rating, photo_reference, category, activity_type)
    return activity_id

def get_nominations(group_id):
    ''' 
    get information of all nominated activities of the given group,
    including basic information, photo data and user's vote status
    '''
    activities = cache.get_activities(group_id)
    if not activities:
        activities = get_nominations_from_database(group_id)
    for activity in activities:
        photo_reference = activity['photo_reference']
        photo_content = database.get_photo(photo_reference)
        if not photo_content:
            photo_content = place.get_photo_content(photo_reference, 500)
            database.add_photo(photo_reference, photo_content)
        activity['photo_content'] = photo_content
    return activities

def nominate(group_id, google_places_id, activity_name, rating, photo_reference, category):
    ''' nominate an activity '''
    if not database.exist_group(group_id):
        raise ValueError(f"Group '{group_id}' does not exist")
    activity_id = add_activity_to_database(group_id, google_places_id, activity_name, rating, photo_reference, category, 'main')
    cache.add_activity(group_id, activity_id, activity_name, rating, photo_reference, category)

def get_main_activity_names(group_id):
    ''' get activity names of all nominated activities '''
    if not database.exist_group(group_id):
        raise ValueError(f"Group '{group_id}' does not exist")
    main_activities = []
    data = database.get_main_activity_names(group_id)
    for line in data:
        (activity_name,) = line
        main_activities.append(activity_name)
    return main_activities

def vote(activity_id, access_token):
    ''' add user's vote to an activity '''
    email = user.get_email_by_token(access_token)
    if database.exist_vote(activity_id, email):
        raise ValueError('User has voted for this activity')
    else:
        database.add_vote(activity_id, email)

def unvote(activity_id, access_token):
    ''' remove user's vote to an activity '''
    email = user.get_email_by_token(access_token)
    if database.exist_vote(activity_id, email):
        database.remove_vote(activity_id, email)
    else:
        raise ValueError('User has not voted for this activity')

def sort_poll(data):
    ''' return key for sorting poll '''
    return data['vote_count']

def get_poll(group_id):
    ''' get poll result for the given group '''
    activities = cache.get_activities(group_id)
    if not activities:
        activities = get_nominations_from_database(group_id)
    poll_result = {}
    activity_poll = []
    for activity in activities:
        activity_id = activity.get('activity_id')
        activity_name = activity.get('activity_name')
        vote_count = database.get_activity_vote_count(activity_id)
        activity_poll.append(
            {
                'activity_id': activity_id,
                'activity_name': activity_name,
                'vote_count': vote_count
            }
        )
    poll_result['activity_poll'] = sorted(activity_poll, key=sort_poll, reverse=True)
    poll_result['active_user'] = database.get_active_user_count(group_id)
    return poll_result

def add_side_activity(authoriser_token, group_id, google_places_id, activity_name, rating, photo_reference, category):
    ''' add side activity to a group '''
    if not group.is_leader_of_group(group_id, authoriser_token):
        raise AccessError('Only group owner can choose side activities.')
    activity_id = add_activity_to_database(group_id, google_places_id, activity_name, rating, photo_reference, category, 'side')
    return activity_id