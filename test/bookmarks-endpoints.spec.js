const { expect } = require('chai')
const { makeBookmarksArray, makeMaliciousBookmark } = require('./bookmarks.fixtures')
const knex = require('knex')
const app = require('../src/app')
const supertest = require('supertest')

describe(`Bookmarks Endpoints`, function() {    
    let db 

    before(`make knex instance`, () => {
        db = knex({ 
            client: 'pg',
            connection: process.env.TEST_DB_URL,
        })
        app.set('db', db)
    })

    after(`disconnect from db`, () => db.destroy())

    before(`clean the table`, () => db('bookmarks').truncate())

    afterEach( `cleanup`, () => db('bookmarks').truncate())

    describe(`GET /api/bookmarks endpoint`, () => {
        context(`Given there are bookmarks in the DB`, () => {
            const testBookmarks = makeBookmarksArray()

            beforeEach(`insert bookmarks`, () => {
                return db
                    .into('bookmarks')
                    .insert(testBookmarks)
            })
            
            it(`returns status 200 and all bookmarks from bookmarks table`, () => { 
                return supertest(app)
                    .get('/api/bookmarks')
                    .expect(200, testBookmarks)
            })
        })

        context(`Given an XSS attack bookmark`, () => {
            const { maliciousBookmark, expectedBookmark } = makeMaliciousBookmark()

            beforeEach(`insert malicious bookmark`, () => {
                return db   
                    .into('bookmarks')
                    .insert([maliciousBookmark])  // can make this row an array or no, still passes
            })

            it(`removes XSS attack content`, () => {
                return supertest(app)
                    .get('/api/bookmarks')
                    .expect(200)
                    .expect(res => {
                        expect(res.body[0].title).to.eql(expectedBookmark.title)
                        expect(res.body[0].description).to.eql(expectedBookmark.description)        
                    })
            })

        })

        context(`Given no articles`, () => {
            it(`responds with 200 and empty list`, () => {
                return supertest(app)
                .get('/api/bookmarks')
                .expect(200, [])
                })
            })
        })
    
    describe(`POST /api/bookmarks endpoint`, () => {
            it('creates an article responding with 201 and the article', () => {
                this.retries(3)
                newBookmark = {
                    title: 'test bookmark',
                    url: 'test url',
                    description: 'test description',
                    rating: 5,
                }
                return supertest(app)
                .post('/api/bookmarks')
                .send(newBookmark) 
                .expect(201)
                
                .expect(res => {
                    expect(res.body.title).to.eql(newBookmark.title)
                    expect(res.body.url).to.eql(newBookmark.url)
                    expect(res.body.description).to.eql(newBookmark.description)
                    expect(res.body.rating).to.eql(newBookmark.rating)
                    expect(res.body).to.have.property('id')
                    expect(res.headers.location).to.eql(`/api/bookmarks/${res.body.id}`)
                })
                .then(postRes => 
                    supertest(app)
                    .get(`/api/bookmarks/${postRes.body.id}`)
                    .expect(postRes.body)
                ) 
            })

            it(`responds with 400 and error message if rating is less than 1 or greater than 5`, () => {
                newBookmark = {
                    title: 'test bookmark',
                    url: 'test url',
                    description: 'test description',
                    rating: 'invalid',
                }

                return supertest(app)
                .post('/api/bookmarks')
                .send(newBookmark)
                .expect(400, { error: { message: `'rating' must be a number between 1 and 5`} })
            })
        

            const requiredFields = ['title', 'url', 'description', 'rating']

            requiredFields.forEach(field => {
                const newArticle = {
                    title: 'Test new bookmark',
                    url: 'www.newbookmark.com',
                    description: 'A rad bookmark',
                    rating: 5
                }

                it(`responds with 400 and an error message when the ${field} is missing`, () => {
                    delete newArticle[field]

                    return supertest(app)
                    .post('/api/bookmarks')
                    .send(newArticle)
                    .expect(400, { error: { message: `Missing '${field}' in request body` } })
                })
            })

            context(`Given an XSS attack article`, () => {
                it(`removes XSS content from POST /articles endpoint`, () => {
                    const { maliciousBookmark, expectedBookmark } = makeMaliciousBookmark()
                    return supertest(app)
                    .post('/api/bookmarks')
                    .send(maliciousBookmark)
                    .expect(201)
                    .expect(res => {
                        expect(res.body.title).to.eql(expectedBookmark.title)
                        expect(res.body.description).to.eql(expectedBookmark.description)
                    })
                })
            })
        })
    
   

    describe(`GET /api/bookmarks/:bookmark_id endpoint`, () => {
        context(`Given there are bookmarks in the DB`, () => {
            const testBookmarks = makeBookmarksArray()

            beforeEach(`insert bookmarks`, () => {
                return db
                    .into('bookmarks')
                    .insert(testBookmarks)
            })

            it(`responds with 200 and the specified bookmark`, () => {
                const bookmarkId = 2
                const expectedBookmark = testBookmarks[bookmarkId - 1]

                return supertest(app)
                    .get(`/api/bookmarks/${bookmarkId}`)
                    .expect(200, expectedBookmark)
                })
            })

        context(`Given  an XSS attack bookmark`, () => {
            const { maliciousBookmark, expectedBookmark } = makeMaliciousBookmark()
            beforeEach(`insert malicious bookmark`, () => {
                return db
                    .into('bookmarks')
                    .insert([maliciousBookmark])
            })

            it(`removes XSS attack content`, () => {
            return supertest(app)
                .get(`/api/bookmarks/${maliciousBookmark.id}`)
                .expect(200)
                .expect(res => {
                    expect(res.body.title).to.eql(expectedBookmark.title)
                    expect(res.body.description).to.eql(expectedBookmark.description)
                })
            })
        }) 
        

        context(`Given no articles`, () => { 
            it(`responds with status 404`, () => {  
                const bookmarkId = 123456
                return supertest(app)
                .get(`/api/bookmarks/${bookmarkId}`)
                .expect(404, { error: { message: `Bookmark doesn't exist`} })
            })
        })
    })

    describe(`DELETE /api/bookmarks/:bookmark_id`, () => {
        context('Given no bookmarks', () => {
            it(`responds with 404`, () => {
                const bookmarkId = 1234
                return supertest(app)
                    .delete(`/api/bookmarks/${bookmarkId}`)
                    .expect(404, { error: { message: `Bookmark doesn't exist` } })
            })
        })
        context('Given there are bookmarks in the database', () => {
            const testBookmarks = makeBookmarksArray()

            beforeEach('insert bookmarks', () => {
                return db
                    .into('bookmarks')
                    .insert(testBookmarks)
            })

            it('responds with 204 and removes the article', () => {
                const idToRemove = 2
                const expectedBookmarks = testBookmarks.filter(bookmark => bookmark.id !== idToRemove)
                return supertest(app)
                    .delete(`/api/bookmarks/${idToRemove}`)
                    .expect(204)
                    .then(res => 
                        supertest(app)
                        .get('/api/bookmarks')
                        .expect(expectedBookmarks)
                    )
            })
        })
    })

    describe.only(`PATCH /api/bookmarks/:bookmark_id`, () => {
        context(`Given no bookmarks`, () => {
            it(`responds with 404`, () => {
                const bookmarkId = 12345
                return supertest(app)
                .patch(`/api/bookmarks/${bookmarkId}`)
                .expect(404, { error: { message:  `Bookmark doesn't exist` } })
            })
        })

        context(`Given bookmarks exist`, () => {
            const testBookmarks = makeBookmarksArray()
            beforeEach(`insert bookmarks`, () => {
                return db
                    .into('bookmarks')
                    .insert(testBookmarks)
            })
            it(`responds with 204 and updates the bookmark`, () => {
                const idToUpdate = 2
                const updatedBookmark = {
                    title: 'updated title',
                    url: 'updated url',
                    description: 'updated description'
                }
                const expectedBookmark = {
                    ...testBookmarks[idToUpdate - 1],
                    ...updatedBookmark,
                }
                return supertest(app)
                .patch(`/api/bookmarks/${idToUpdate}`)
                .send(updatedBookmark)
                .expect(204)
                .then(res => 
                    supertest(app)
                        .get(`/api/bookmarks/${idToUpdate}`)
                        .expect(expectedBookmark)
                )
            })

            it(`responds with 400 when title, url, or description are not present in the body`, () => {
                const idToUpdate = 2
                return supertest(app)
                .patch(`/api/bookmarks/${idToUpdate}`)
                .send({ irreleventField: 'foo' })
                .expect(400, {
                    error: {
                        message: `Request body must contain either 'title', 'url' or 'description'`
                    }
                })
            })

            it(`responds with 204 when updating only a subset of fields`, () => {
                const idToUpdate = 2
                const updateBookmark = {
                    title: 'updated bookmark title'
                }
                const expectedBookmark = {
                    ...testBookmarks[idToUpdate -1],
                    ...updateBookmark
                }

                return supertest(app)
                .patch(`/api/bookmarks/${idToUpdate}`)
                .send({
                    ...updateBookmark,
                    fieldToIgnore: 'should not be in GET response'
                })
                .then(res =>
                    supertest(app)
                    .get(`/api/bookmarks/${idToUpdate}`)
                    .expect(expectedBookmark)
                )
            })
        })
    })
})