const router = require('express').Router();
//making posts route private
const verify = require('./verifytoken');

router.get('/', verify, verify, (req,res) => {
    res.send({user: req.user, posts: {posts: {title: 'my first post', description: 'random data you should\'nt access'}}})
    res.json({posts: {title: 'my first post', description: 'random data you should\'nt access'}})
})

module.exports = router;