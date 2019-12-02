function makeBookmarksArray() {
    return [
        {
            "id": 1,
            "title": "Bookmark 1",
            "url": "www.bookmark1.com",
            "description": "first bookmark",
            "rating": 1
        },
        {
            "id": 2,
            "title": "Bookmark 2",
            "url": "www.bookmark2.com",
            "description": "second bookmark",
            "rating": 2
        },
        {
            "id": 3,
            "title": "Bookmark 3",
            "url": "www.bookmark3.com",
            "description": "third bookmark",
            "rating": 3
        },
        {
            "id": 4,
            "title": "Bookmark 4",
            "url": "www.bookmark4.com",
            "description": "fourth bookmark",
            "rating": 4
        },
        {
            "id": 5,
            "title": "Bookmark 5",
            "url": "www.bookmark5.com",
            "description": "fifth bookmark",
            "rating": 5
        },
        {
            "id": 6,
            "title": "Bookmark 6",
            "url": "www.bookmark6.com",
            "description": "sixth bookmark",
            "rating": 1
        },
        {
            "id": 7,
            "title": "Bookmark 7",
            "url": "www.bookmark7.com",
            "description": "seventh bookmark",
            "rating": 2
        },
        {
            "id": 8,
            "title": "Bookmark 8",
            "url": "www.bookmark8.com",
            "description": "eighth bookmark",
            "rating": 3
        },
        {
            "id": 9,
            "title": "Bookmark 9",
            "url": "www.bookmark9.com",
            "description": "ninth bookmarek",
            "rating": 4
        },
        {
            "id": 10,
            "title": "Bookmark 10",
            "url": "www.bookmark10.com",
            "description": "tenth bookmark",
            "rating": 5
        }
    ]
}

function makeMaliciousBookmark() {
    const maliciousBookmark = {
        id: 911, 
        title: 'Naughty naughty very naughty <script>alert("xss");</script>',
        url: 'yougotxssd.com',
        description: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookies);">. But not <strong>all</strong> bad.`,
        rating: 5
    }
    const expectedBookmark = {
        ...maliciousBookmark,
        title: 'Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
        description: `Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`

    }

    return {
        maliciousBookmark,
        expectedBookmark,
    }
}
    
module.exports = { 
    makeBookmarksArray,
    makeMaliciousBookmark
}