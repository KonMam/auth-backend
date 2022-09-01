import express from 'express'
import { appDataSource } from '../data-source';
import { User } from '../entities/user.entity';
import { sign, verify } from 'jsonwebtoken'
import { stringify } from 'querystring';

const router = express.Router()

router.route('/login').post(async (req, res, next) => {
    const { email, password } = req.body;

    let existingUser;
    try {
        // Checking if user exists in DB.
        existingUser = await appDataSource.getRepository(User).findOneBy({ email: email })
    } catch {
        const error = new Error("Error! Something went wrong.");
        return next(error)
    };

    if (!existingUser || existingUser.password != password) {
        // Checking if password matches to DB.
        const error = Error("Wrong details provided.");
        return next(error);
    };

    let accessToken;
    try {
        // Creating jwt token
        accessToken = sign(
          { userId: existingUser.id, email: existingUser.email },
          "kuibnbsfgsadgps", // TODO: Move secret key to .env
          { expiresIn: "10m" }
        );
    } catch (err) {
        const error = new Error("Error! Something went wrong.");
        return next(error);
    };

    let refreshToken;
    try {
        refreshToken = sign(
            {  userId: existingUser.id, email: existingUser.email },
            "refreshtokensecret", 
            { expiresIn: '1d' }
        );
    } catch (err) {
            const error = new Error("Error! Something went wrong.");
            return next(error);
    };

    // Assigning refresh token in http-only cookie 
    res.cookie('jwt', refreshToken, 
    { httpOnly: true, 
        sameSite: 'none', secure: true, 
        maxAge: 24 * 60 * 60 * 1000
    }
    );

    res.status(200).json({ accessToken });
})

router.route('/refresh').post(async (req, res) => {
    if (req.cookies?.jwt) {

        const refreshToken = req.cookies.jwt;

        // Verifying refresh token
        interface JwtPayload {
            id: number,
            email: string
        }

       const { id, email } = verify(refreshToken, "refreshtokensecret" ) as JwtPayload

        // Correct token we send a new access token
        const accessToken = sign(
            { userId: id, email: email },
            "kuibnbsfgsadgps", // TODO: Move secret key to .env
            { expiresIn: "10m" }
        );

        return res.status(200).json({ accessToken });
    }
    else {
        return res.status(406).json({ message: 'Unauthorized' });
    }
});


router.route('/signup').post(async (req, res, next) => {
    const { email, password } = req.body;

    const newUser = new User()

    newUser.email = email
    newUser.password = password

    try {
        // Creating the new user in DB.
        await appDataSource.getRepository(User).save(newUser)
    } catch {
        const error = new Error("Error! Something went wrong.");
        return next(error);
    };

    let accessToken;
    try {
        // Creating jwt token
        accessToken = sign(
          { userId: newUser.id, email: newUser.email },
          "kuibnbsfgsadgps", // TODO: Move secret key to .env
          { expiresIn: "30m" }
        );
    } catch (err) {
        const error = new Error("Error! Something went wrong.");
        return next(error);
    };

    let refreshToken;
    try {
        refreshToken = sign(
            {  userId: newUser.id, email: newUser.email },
            "refreshtokensecret", 
            { expiresIn: '1d' }
        );
    } catch (err) {
            const error = new Error("Error! Something went wrong.");
            return next(error);
    };

    // Assigning refresh token in http-only cookie 
    res.cookie('jwt', refreshToken, 
    { httpOnly: true, 
        sameSite: 'none', secure: true, 
        maxAge: 24 * 60 * 60 * 1000
    }
    );

    res.status(200).json({ accessToken });
})

module.exports = router