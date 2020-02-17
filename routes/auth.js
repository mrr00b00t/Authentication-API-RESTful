const router = require('express').Router();
const User = require('../model/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const {registerValidation, loginValidation} = require('../validation');


router.post('/register', async (req,res) => {
    
    //VALIDATE DATA BEFORE SENDS TO DB
    const { error } = registerValidation(req.body);
    if (error) return res.status(400).send(error.details[0].message)

    //CHECK IF EMAIL ALREDY EXISTS
    const emailExist = await User.findOne({email: req.body.email});
    if (emailExist) return res.status(400).send('Email alredy exists')

    //HASH PASSWORD
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    //CREATE NEW USER
    const user = new User({
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword
    });

    try {
        const savedUser = await user.save()
        res.send({user: savedUser._id})
    } catch(err) {
        res.status(400).send(err)
    }
});

//LOGIN
router.post('/login', async (req,res) => {
    //VALIDATE DATA BEFORE SENDS TO DB
    const { error } = loginValidation(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    //CHECK IF EMAIL EXISTS
    const user = await User.findOne({email: req.body.email});
    if (!user) return res.status(400).send('Email is wrong');

    //CHECK IF PASSWORD IS CORRECT
    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if (!validPassword) return res.status(400).send("Password is wrong");

    //CREATE JWT FOR USER
    const token = jwt.sign({_id: user._id}, process.env.TOKEN_SECRET, {expiresIn: '1min'});
    res.header('auth-token', token).send(token);
});

module.exports = router;