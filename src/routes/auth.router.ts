import express from 'express'

const router = express.Router()

router.route('/').get((req, res) => {
    res.status(200).send('This is the main auth page.')
})

router.route('/login').get((req, res) => {
    res.status(200).send('This is auth login page.')
})

module.exports = router