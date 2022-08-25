import express from 'express'
import { appDataSource } from '../data-source';
import { User } from '../entities/user.entity';
import { sign } from 'jsonwebtoken'

const router = express.Router()

router.route('/login').post(async (req, res, next) => {
    const { email, password } = req.body;

    let existingUser;
    try {
        // Checking if user exists in DB.
        existingUser = await appDataSource.getRepository(User).findOneBy({ email: email })
    } catch {
        const error = new Error("Error! Something went wrong.");
    };

    if (!existingUser || existingUser.password != password) {
        // Checking if password matches to DB.
        const error = Error("Wrong details provided.");
        return next(error);
    };

    let token;
    try {
        // Creating jwt token
        token = sign(
          { userId: existingUser.id, email: existingUser.email },
          "kuibnbsfgsadgps", // TODO: Move secret key to .env
          { expiresIn: "30m" }
        );
    } catch (err) {
        console.log(err);
        const error = new Error("Error! Something went wrong.");
        return next(error);
    };

    res.status(200).json({
        success: true,
        data: {
          userId: existingUser.id,
          email: existingUser.email,
          token: token,
        },
    });
})

router.route('/signup').get((req, res) => {
    res.status(200).send('This is auth login page.')
})

module.exports = router