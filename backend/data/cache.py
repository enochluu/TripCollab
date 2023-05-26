from config.exception import ServerError
import redis
import sys
import os
from os.path import dirname, join, abspath
sys.path.insert(0, abspath(join(dirname(__file__), '..')))

''' store nominated activities of all recent groups in Redis '''

activity_key_prefix = 'activity:'
name_field = 'name'
rating_field = 'rating'
photo_field = 'photo'
category_field = 'category'
redis_cache = None
try:
    redis_cache = redis.Redis(host=os.environ['REDIS_HOST'],
                              port=os.environ['REDIS_PORT'], password=os.environ['REDIS_PASS'])
except Exception as err:
    raise ServerError(f'Redis Error: {err}')


def add_activity(group_id, activity_id, activity_name, rating, photo_reference, category):
    ''' add basic information of nominated activity to redis '''
    key = activity_key_prefix + group_id + ':' + str(activity_id)
    redis_cache.hset(key, name_field, activity_name)
    redis_cache.hset(key, rating_field, rating)
    redis_cache.hset(key, photo_field, photo_reference)
    redis_cache.hset(key, category_field, category)
    redis_cache.expire(key, 48*60*60)


def get_activities(group_id):
    ''' get basic information of all nominated activities of a group in redis '''
    activities = []
    key_pattern = activity_key_prefix + group_id + ':'
    cached_activities = redis_cache.keys(key_pattern + '*')
    if not cached_activities:
        return None
    for key in cached_activities:
        activity_key = key.decode('utf8')
        activities.append(
            {
                'activity_id': int(activity_key.replace(key_pattern, '', 1)),
                'activity_name': redis_cache.hget(activity_key, name_field).decode('utf8'),
                'rating': int(redis_cache.hget(activity_key, rating_field)),
                'photo_reference': redis_cache.hget(activity_key, photo_field).decode('utf8'),
                'category': redis_cache.hget(activity_key, category_field).decode('utf8')
            }
        )
    return activities
