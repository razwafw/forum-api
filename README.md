# forum-api
A RESTful API made using Hapi.js framework which implements TDD and clean architecture that simulates simple functionalities of a forum application.

This project was made in order to complete the requirements of the first and second project of 'Menjadi Back-End Developer Expert' class in Dicoding Academy.

*Note: This project was developed and tested using Node.js v18.12.1 and PostgreSQL v15.3*

## Setting Up Locally
In order to run the API server successfuly, several things need to be set up first:

### Database Setup (PostgreSQL)
1. Create two new databases as postgres user: ```CREATE TABLE forumapi; CREATE TABLE forumapi_test```
2. Grant privileges to <psql_user>: ```GRANT ALL PRIVILEGES ON DATABASE forumapi, forumapi_test TO <psql_user>;```
3. Alter database owner to <psql_user>: ```ALTER DATABASE forumapi OWNER TO <psql_user>; ALTER DATABASE forumapi_test OWNER TO <psql_user>;```

*Note: ```<psql_user>``` will be the user that accesses the database from the API server*

### Environment Variables Setup
1. Create ```.env``` file in the project's root directory (follow instructions in ```CREATE .env HERE```)
2. Create ```test.json``` in ```./config/database``` (follow instructions in ```CREATE test.json HERE```)

### Project Setup
1. Run ```npm install``` in the project's root directory to install necessary npm modules
2. Run ```npm run migrate up``` and ```npm run migrate:test up``` to setup tables in the database

## Starting the API Server Locally
If the setup process is correct, running the code ```npm run test:watch``` in the console (which runs the unit testing suites) will show that all tests are passed.

To run the API server, enter ```npm run start``` or ```npm run start:dev``` (uses nodemon to automatically restart server if it stops abruptly). This will show where the server is currently running.

## Interacting with the API Server
After the server has been successfuly started, you should be able to interact with the server.

To view all of the possible interactions with the server, you can import the Postman testing and environment files in the ```postman_testing``` folder and then run the tests.

Another way is through the curl command using the command prompt. Below are the complete documentation of possible curl commands with the API server.

*Note: Since the output is JSON based, it can be tidied up using libraries such as jq*

### Adding a User
To add a new user, use the command:
```
curl -X POST -H "Content-Type: application/json" -d "{\"username\": \"<username>\", \"password\": \"<password>\", \"fullname\": \"<fullname>\"}" <HOST>:<PORT>/users
```
This command should return the following response:
```
{
    "status": "success",
    "data": {
        "addedUser": {
            "id": "<user_id>",
            "username": "<username>",
            "fullname": "<fullname>"
        }
    }
}
```

### Logging In
To log in with an added user, use the command:
```
curl -X POST -H "Content-Type: application/json" -d "{\"username\": \"<username>\", \"password\": \"<password>\"}" <HOST>:<PORT>/authentications
```
This command should return the following response:
```
{
    "status": "success",
    "data": {
        "accessToken": "<access_token>",
        "refreshToken": "<refresh_token>"
    }
}
```

### Refreshing Access Token
By default, the access token is set to expire after a set amount of time. To renew the access token, use the command:
```
curl -X POST -H "Content-Type: application/json" -d "{\"refreshToken\": \"<refresh_token>\"}" <HOST>:<PORT>/authentications
```
This command should return the following response:
```
{
    "status": "success",
    "data": {
        "accessToken": "<access_token>"
    }
}
```

### Logging Out
To logout (remove the ability to refresh the access token), use the command:
```
curl -X DELETE -H "Content-Type: application/json" -d "{\"refreshToken\": \"<refresh_token>\"}" <HOST>:<PORT>/authentications
```
This command should return the following response:
```
{
    "status": "success"
}
```

### Adding a Thread
To add a new thread, use the command:
```
curl -X POST -H "Content-Type: application/json" -H "Authorization: Bearer <access_token>" -d "{\"title\": \"<title>\", \"body\": \"<body>\"}" <HOST>:<PORT>/threads
```
This command should return the following response:
```
{
    "status": "success",
    "data": {
        "addedThread": {
            "id": "<thread_id>",
            "title": "<thread_title>",
            "owner": "<thread_owner>"
        }
    }
}
```

### Adding a Comment to a Thread
To add a new comment to a thread, use the command:
```
curl -X POST -H "Content-Type: application/json" -H "Authorization: Bearer <access_token>" -d "{\"content\": \"<content>\"}" <HOST>:<PORT>/threads/<thread_id>/comments
```
This command should return the following response:
```
{
    "status": "success",
    "data": {
        "addedComment": {
            "id": "<comment_id>",
            "content": "<comment_content>",
            "owner": "<owner>"
        }
    }
}
```

### Removing a Comment to a Thread
To remove a comment to a thread, use the command:
```
curl -X DELETE -H "Authorization: Bearer <access_token>" <HOST>:<PORT>/threads/<thread_id>/comments/<comment_id>
```
This command should return the following response:
```
{
    "status": "success",
    "message": "komentar berhasil dihapus"
}
```

### Adding a Reply to a Thread Comment
To add a new reply to a thread comment, use the command:
```
curl -X POST -H "Content-Type: application/json" -H "Authorization: Bearer <access_token>" -d "{\"content\": \"<content>\"}" <HOST>:<PORT>/threads/<thread_id>/comments/<comment_id>/replies
```
This command should return the following response:
```
{
    "status": "success",
    "data": {
        "addedReply": {
            "id": "<comment_id>",
            "content": "<comment_content>",
            "owner": "<owner>"
        }
    }
}
```

### Removing a Reply to a Thread Comment
To remove a reply to a thread comment, use the command:
```
curl -X DELETE -H "Authorization: Bearer <access_token>" <HOST>:<PORT>/threads/<thread_id>/comments/<comment_id>/replies/<reply_id>
```
This command should return the following response:
```
{
    "status": "success",
    "message": "balasan berhasil dihapus"
}
```

### Adding and Removing a Like to a Thread Comment
To add/remove a reply to a thread comment, use the command:
```
curl -X PUT -H "Authorization: Bearer <access_token>" <HOST>:<PORT>/threads/<thread_id>/comments/<comment_id>/likes
```
This command should return the following response:
```
{
    "status": "success",
    "message": "berhasil menyukai komentar" OR "berhasil membatalkan aksi menyukai komentar"
}
```

### Getting Thread Details
To get the details of a thread, use the command:
```
curl <HOST>:<PORT>/threads/<thread_id>
```
This command should return the following response:
```
{
    "status": "success",
    "data": {
        "thread": {
            "id": "<thread_id>",
            "title": "<thread_title>",
            "body": "<thread_body>",
            "date": "<thread_date>",
            "username": "<thread_username>",
            "comments": [
                {
                    "id": "<comment_id>",
                    "username": "<comment_username>",
                    "date": "<comment_date>",
                    "replies": [
                        {
                            "id": "<reply_id>",
                            "content": "<reply_content>",
                            "date": "<reply_date>",
                            "username": "<reply_username>"
                        },
                        ...
                    ],
                    "content": "<comment_content>"
                    "likeCount": <comment_like_count>
                },
                ...
            ]
        }
    }
}
```
