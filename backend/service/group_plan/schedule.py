from datetime import datetime, timedelta
import sys
import os
from os.path import dirname, join, abspath
sys.path.insert(0, abspath(join(dirname(__file__), '../..')))
from data import database
from config.exception import ValueError, AccessError
from service.group_plan import group

''' Implementation for schedule '''

def get_schedule(group_id):
    ''' get group activity schedule '''
    data = database.get_schedule(group_id)
    output=[]
    for lines in data:        
        a_id=lines[0]
        name = lines[1]
        start=lines[2].strftime("%H:%M")
        end=lines[3].strftime("%H:%M")
        activity_type = lines[4]
        output.append(
            {
                "activity_id":a_id, 
                "activity_name":name, 
                "start_time":start, 
                "end_time":end,
                "type": activity_type
            }
        )
    return output

def convert_str_to_datetime(string):
    return datetime.strptime(string, '%H:%M:%S')

def convert_datetime_to_str(time):
    return time.strftime('%H:%M:%S')

def convert_time_to_datetime(time):
    return convert_str_to_datetime(time.strftime('%H:%M:%S'))

def add_schedule(group_id, activity_id, authoriser_token):
    ''' add activity to schedule '''
    if not group.is_leader_of_group(group_id, authoriser_token):
        raise AccessError('Only group owner can add activity to schedule.')
    data = database.get_schedule(group_id)
    if len(data) == 0:
        database.add_schedule(activity_id, '07:00:00', '08:00:00')
        return
    (a_id, a_name, earliest, end_time, a_type) = data[0]
    (a_id, a_name, start_time, latest, a_type) = data[-1]
    earliest_time = convert_time_to_datetime(earliest)
    latest_time = convert_time_to_datetime(latest)
    start_time = None
    end_time = None
    if latest_time <= convert_str_to_datetime('19:00:00'):
        start_time = convert_datetime_to_str(latest_time + timedelta(hours=1))
        end_time = convert_datetime_to_str(latest_time + timedelta(hours=2))
    elif earliest_time >= convert_str_to_datetime('09:00:00'):
        start_time = convert_datetime_to_str(latest_time - timedelta(hours=2))
        end_time = convert_datetime_to_str(latest_time - timedelta(hours=1))
    elif earliest_time >= convert_str_to_datetime('07:30:00'):
        start_time = '07:00:00'
        if earliest_time < convert_str_to_datetime('08:00:00'):
            end_time = '08:00:00'
        else:
            end_time = convert_datetime_to_str(earliest_time)
    elif latest_time <= convert_str_to_datetime('20:30:00'):
        if latest_time <= convert_str_to_datetime('20:00:00'):
            start_time = '20:00:00'
        else:
            start_time = convert_datetime_to_str(latest_time)
        end_time = '21:00:00'
    else:
        for i in range(0, len(data)-1):
            (a_id, a_name, curr_start, curr_end, a_type) = data[i]
            (a_id, a_name, next_start, next_end, a_type) = data[i+1]
            curr_end_time = convert_time_to_datetime(curr_end)
            next_start_time = convert_time_to_datetime(next_start)
            if curr_end_time + timedelta(hours==1) <= next_start_time:
                start_time = convert_datetime_to_str(curr_end_time)
                end_time = convert_datetime_to_str(curr_end_time + timedelta(hours==1))
                break
            elif curr_end_time + timedelta(minutes=15) <= next_start_time:
                start_time = convert_datetime_to_str(curr_end_time)
                end_time = convert_datetime_to_str(next_start_time)
                break
    if not start_time or not end_time:
        raise ValueError('Failed to add activity to a full schedule')
    database.add_schedule(activity_id, start_time, end_time)
    return

def change_schedule(group_id, activity_id, start_time, end_time, authoriser_token):
    ''' change scheduled time of an activity '''
    if not group.is_leader_of_group(group_id, authoriser_token):
        raise AccessError('Only group owner can change schedule.')
    data = database.get_schedule(group_id)
    new_start = convert_str_to_datetime(start_time)
    new_end = convert_str_to_datetime(end_time)
    if new_end - timedelta(minutes=15) < new_start:
        raise ValueError("Each activity must be at least 15 minutes")
    for line in data:
        (a_id, a_name, a_start, a_end, a_type) = line
        curr_start = convert_time_to_datetime(a_start)
        curr_end = convert_time_to_datetime(a_end)
        if a_id == activity_id:
            continue
        if (new_start >= curr_start) and (new_start < curr_end):
            raise ValueError("Chosen time is conflict with other activities in the schedule")
        elif (new_end > curr_start) and (new_end <= curr_end):
            raise ValueError("Chosen time is conflict with other activities in the schedule") 
    database.change_schedule(activity_id, start_time, end_time)        

def remove_schedule(group_id, activity_id, authoriser_token):
    ''' remove an activity from schedule '''
    if not group.is_leader_of_group(group_id, authoriser_token):
        raise AccessError('Only group owner can remove schedule.')
    database.remove_schedule(activity_id)
