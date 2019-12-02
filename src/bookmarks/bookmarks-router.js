const express = require('express')
const xss = require('xss')
const BookmarksService = require('./bookmarks-service')
const logger = require('../logger')

const bookmarksRouter = express.Router()
const jsonParser = express.json()

const serializeBookmark = bookmark => ({
    id: bookmark.id,
    title: xss(bookmark.title),
    url: bookmark.url,
    description: xss(bookmark.description),
    rating: bookmark.rating,
})


bookmarksRouter
    .route('/')
    .get((req, res, next) => {
        BookmarksService.getAllBookmarks(
            req.app.get('db')
        )
            .then(bookmarks => {
                res.json(bookmarks.map(serializeBookmark))
            })
            .catch(next)
    })
    .post(jsonParser, (req, res, next) => {
         const { title, url, description, rating } = req.body
         const newBookmark = { title, url, description, rating }


        for (const [key, value] of Object.entries(newBookmark)) {
            if (value == null) {
                return res.status(400).json({
                    error: { message: `Missing '${key}' in request body` }
                })
            }
        }

        const ratingInt = parseInt(rating) // or Number(rating)

        if(Number.isNaN(ratingInt) || ratingInt < 1 || ratingInt > 5) {
            logger.error(`Invalid rating '${rating}' supplied`)
            return res.status(400).json({
                error: { message: `'rating' must be a number between 1 and 5` }
            })
        }


         BookmarksService.insertBookmark(
             req.app.get('db'),
             newBookmark
             )
                 .then(bookmark => {
                     res.status(201)
                         .location(`/bookmarks/${bookmark.id}`)
                         .json(serializeBookmark(bookmark))
            })
            .catch(next)
        })

bookmarksRouter
    .route('/:bookmark_id')
    .all((req, res, next) => {
        BookmarksService.getById(
            req.app.get('db'),
            req.params.bookmark_id
        )
            .then(bookmark => {
                if(!bookmark) {
                    res.status(404).json({
                        error: { message: `Bookmark doesn't exist`}
                    }) 
                }
                res.bookmark = bookmark
                next()
            })
            .catch(next)
    })
    .get((req, res, next) => {
                res.json(serializeBookmark(res.bookmark))
    })
    .delete((req, res, next) => {
        BookmarksService.deleteBookmark(
            req.app.get('db'),
            req.params.bookmark_id
        )
        .then(() => {
            res.status(204).end()
        })
        .catch(next)
    })

module.exports = bookmarksRouter