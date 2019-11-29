# Bookmarks API Server & PostgreSQL DB

This project includes an Express API server to handle http requests for major CRUD methods including 'GET', 'POST', 'DELETE'. 
These methods are requests are handled by Express request handling middleware on the app object created from the top-level express function, aka express().  

The request handlers implement knex instances to communicate with the local and test DBs based on unique environmental variables for their respective databases. These request handlers utilize knex instances and other arguments passed to the (BookmarksService) service object to retrieve data stored in the tables and return 'promise-like' objects. 

Authorization is handled via middleware, as is error handling. 


##Testing CRUD methods

Integration testing is performed using the Mocha test structure with the Chai assertion library and Supertest. A separate test database (bookmarks-test) was created through PSQL and data migrated from the local DB using Postgrator-cli migration tool. 

