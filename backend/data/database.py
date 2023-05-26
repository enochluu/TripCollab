import psycopg2
import sys
import os
from os.path import dirname, join, abspath
sys.path.insert(0, abspath(join(dirname(__file__), '..')))
from config.exception import ServerError

''' Perform database operations '''

conn = None
cursor = None
try:
    conn = psycopg2.connect("dbname=trip_collab")
    cursor = conn.cursor()
except psycopg2.Error as err:
    raise ServerError(f'DB Error: {err}')

def find_email_by_token(access_token):
    query = f"select email from Users where access_token = %s"
    cursor.execute(query, (access_token,))
    if cursor.rowcount == 0:
        return None
    (email,) = cursor.fetchone()
    return email

def exist_user(email):
    query = f"select * from Users where email = %s"
    cursor.execute(query, (email,))
    return cursor.rowcount == 1

def add_user(email, token):
    query = f"insert into Users(email, access_token) values (%s, %s)"
    try:
        cursor.execute(query, (email, token))
        conn.commit()
    except:
        # prevent InSQLFailedTransaction
        conn.rollback()

def update_user(email, token):
    query = f"update Users set access_token = %s where email = %s"
    cursor.execute(query, (token, email))
    conn.commit()

def exist_group(group_id):
    query = f"select * from Groups where id = %s"
    cursor.execute(query, (group_id,))
    return cursor.rowcount == 1

def add_group(email, group_id, location):
    query = f"insert into Groups(id, leader, location) values (%s, %s, %s)"
    cursor.execute(query, (group_id, email, location))
    conn.commit()

def get_group_location(group_id):
    query = 'select location from Groups where id = %s'
    cursor.execute(query, (group_id,))
    (location, ) = cursor.fetchone()
    return location

def exist_activity(group_id, google_places_id):
    query = f"select * from Activities where group_id = %s and google_places_id = %s"
    cursor.execute(query, (group_id, google_places_id))
    return cursor.rowcount == 1

def get_schedule(group_id):
    query = '''
        select id, activity_name, start_time, end_time, activity_type 
        from Activities 
        where group_id = %s and is_chosen = True
        order by start_time
    '''
    cursor.execute(query, (group_id,))
    output = cursor.fetchall()
    return output

def add_schedule(activity_id, start_time, end_time):
    query = '''
        update activities
        set is_chosen = True, start_time = %s, end_time = %s
        where id = %s
    '''
    cursor.execute(query, (start_time, end_time, activity_id))
    conn.commit()
    return

def change_schedule(activity_id, start_time, end_time):
    query = '''
        update activities
        set start_time = %s, end_time = %s
        where id = %s
    '''
    cursor.execute(query, (start_time, end_time, activity_id))
    conn.commit()

def remove_schedule(activity_id):
    query = '''
        update activities
        set start_time = null, end_time = null, is_chosen = False
        where id = %s
    '''
    cursor.execute(query, (activity_id,))
    conn.commit()

def find_group_leader(group_id):
    query = 'select leader from Groups where id = %s'
    cursor.execute(query, (group_id,))
    if cursor.rowcount == 0:
        return None
    (leader,) = cursor.fetchone()
    return leader

def add_activity(group_id, google_places_id, activity_name, rating, photo_reference, category, activity_type):
    query = '''
        insert into Activities(activity_name, group_id, google_places_id, activity_type,
            rating, photo_reference, category)
        values (%s, %s, %s, %s, %s, %s, %s) returning id
    '''
    values = (activity_name, group_id, google_places_id, activity_type, rating, photo_reference, category)
    cursor.execute(query, values)
    activity_id = cursor.fetchone()[0]
    conn.commit()
    return activity_id

def get_nominations(group_id):
    query = '''
        select id, activity_name, rating, photo_reference, category
        from Activities
        where group_id = %s and activity_type = 'main'
        order by rating
    '''
    cursor.execute(query, (group_id,))
    output = cursor.fetchall()
    return output

def get_main_activity_names(group_id):
    query = '''
        select activity_name
        from Activities
        where group_id = %s and is_chosen = True and activity_type = 'main'
    '''
    cursor.execute(query, (group_id,))
    output = cursor.fetchall()
    return output

def exist_vote(activity_id, email):
    query = f"select * from Votes where activity_id = %s and user_email = %s"
    cursor.execute(query, (activity_id, email))
    return cursor.rowcount == 1

def add_vote(activity_id, email):
    query = f"insert into Votes values (%s, %s)"
    cursor.execute(query, (email, activity_id))
    conn.commit()

def remove_vote(activity_id, email):
    query = f"delete from Votes where user_email = %s and activity_id = %s"
    cursor.execute(query, (email, activity_id))
    conn.commit()

def get_activity_vote_count(activity_id):
    query = '''
            select count(*)
            from Votes
            where activity_id = %s
        '''
    cursor.execute(query, (activity_id,))
    (vote_count,) = cursor.fetchone()
    return vote_count

def get_active_user_count(group_id):
    query = '''
        select distinct(v.user_email)
        from Votes v
            join Activities a on v.activity_id = a.id
        where a.group_id = %s
    '''
    cursor.execute(query, (group_id,))
    active_user = cursor.rowcount
    return active_user

def get_photo(photo_reference):
    query = 'select content from Photos where reference = %s'
    cursor.execute(query, (photo_reference,))
    if cursor.rowcount == 0:
        return None
    (photo_content,) = cursor.fetchone()
    return photo_content

def add_photo(photo_reference, photo_content):
    query = 'insert into Photos(reference, content) values (%s, %s)'
    cursor.execute(query, (photo_reference, photo_content))
    conn.commit()
    