const express = require('express')
const uuid = require('uuid/v4')
const logger = require('../logger')
const { bookmarks } = require('../store')

const bookmarkRouter = express.Router()
const bodyParser = express.json()

bookmarkRouter
    .route('/bookmarks')
    .get((req, res) => {    
        res.status(200).json(bookmarks)
    })
    .post(bodyParser, (req, res) => {   
        const { title, url, desc, rating } = req.body;
        if (!title) {
            logger.error(`Title is required`);
            return res.status(400).send('Invalid data');
        }
        if (!url) {
            logger.error(`URL is required`);
            return res.status(400).send('Invalid data');
        }
        if (!desc) {
            logger.error(`Description is required`);
            return res.status(400).send('Invalid data');
        }
        if (!rating) {
            logger.error(`Rating is required`);
        }
        const ratingInt = parseInt(rating);
        if (Number.isNaN(ratingInt)) {
            logger.error(`Rating must be a number`);
            return res.status(400).send('Invalid data');
        }

        const id = uuid();
        const bookmark = {
            id,
            title,
            url,
            desc,
            rating
        };

        bookmarks.push(bookmark);
        logger.info(`Bookmark with id ${id} created`);
        return res
            .status(201)
            .location(`http://localhost:8000/bookmarks/${id}`)
            .json(bookmark)
    })

bookmarkRouter
    .route('/bookmarks/:id')
    .get((req, res) => {    
        const { id } = req.params;

        const bookmark = bookmarks.find(b => b.id === id);

        if(!bookmark) {
            logger.error(`A bookmark with id ${id} does not exist`);
            return res
                .status(404)
                .send('Bookmark not found');
        }

        return res.status(200).json(bookmark)
    })
    .delete((req, res) => { 
        const { id } = req.params;

        const bookmarkIndex = bookmarks.findIndex(bi => bi.id === id);

        if(bookmarkIndex === -1) {
            logger.error(`Bookmark with id ${id} did not exist`);
            return res.status(404).send('Bookmark not found')
        }

        bookmarks.splice(bookmarkIndex, 1);

        logger.info(`Bookmark with id ${id} deleted`);

        return res
            .status(204)
            .end();
    })

module.exports = bookmarkRouter