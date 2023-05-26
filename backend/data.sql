-- PostgreSQL database

-- Types
create type ActivityType as enum ('main', 'side');

-- Tables

create table Users (
	email           text not null unique,
    access_token    text,
    primary key (email)
);

create table Groups (
	id          text not null unique,
    leader      text not null,
    location    text not null,
    primary key (id),
    foreign key (leader) references Users(email)
);

create table Photos (
    reference     text not null,
    content       text not null,
    primary key (reference)
);

create table Activities (
	id                  serial,
    activity_name       text not null,
    group_id            text not null,
    google_places_id    text not null,
    activity_type       ActivityType not null default 'main',
    rating              integer not null,
    photo_reference     text not null,
    category            text not null,
    is_chosen	        boolean not null default False,
    start_time          time,
    end_time            time,
    primary key (id),
    foreign key (group_id) references Groups(id),
    foreign key (photo_reference) references Photos(reference)
);


create table Votes (
	user_email      text not null,
    activity_id     integer not null,
    primary key (user_email, activity_id),
    foreign key (user_email) references Users(email),
    foreign key (activity_id) references Activities(id)
);