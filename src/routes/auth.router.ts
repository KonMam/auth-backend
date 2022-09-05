import express from 'express'
import { appDataSource } from '../data-source';
import { User } from '../entities/user.entity';
import { Secret, sign, verify } from 'jsonwebtoken'
import dotenv from 'dotenv'
import { hash, compare } from 'bcrypt'

const router = express.Router()

dotenv.config()
const accessSecret = process.env.ACCESS_TOKEN_SECRET as Secret
const refreshSecret = process.env.REFRESH_TOKEN_SECRET as Secret

router.route('/login').post(async (req, res, next) => {
    const { email, password } = req.body;


    const existingUser = await appDataSource.getRepository(User).findOneBy({ email: email })

    if (!existingUser) {
        const error = Error("Wrong details provided.");
            return next(error);
    }

    compare(password, existingUser.password, function(err, result) {
        if (!result) {
            const error = Error("Wrong details provided.");
            return next(error);
        };
    });
    
    const accessToken = sign({ userId: existingUser.id, email: existingUser.email }, accessSecret, { expiresIn: "30m" });

    const refreshToken = sign({  userId: existingUser.id, email: existingUser.email }, refreshSecret, { expiresIn: '15d' });

    res.cookie("accessToken", accessToken, { httpOnly: true, 
        sameSite: 'none', secure: true, 
        maxAge: 30 * 60 * 1000
    });

    res.cookie("refreshToken", refreshToken, { httpOnly: true, 
      sameSite: 'none', secure: true, 
      maxAge: 24 * 60 * 60 * 1000 * 15
    });


    res.status(200).json({"message": "Success"})
})

router.route('/refresh').post(async (req, res) => {
    if (req.cookies?.refreshToken) {

        const refreshToken = req.cookies.refreshToken;

        // Verifying refresh token
        interface JwtPayload {
            id: number,
            email: string
        }

       const { id, email } = verify(refreshToken, refreshSecret) as JwtPayload

        // Correct token we send a new access token
        const accessToken = sign(
            { userId: id, email: email },
            accessSecret, // TODO: Move secret key to .env
            { expiresIn: "30m" }
        );

        res.cookie("accessToken", accessToken, { httpOnly: true, 
            sameSite: 'none', secure: true, 
            maxAge: 30 * 60 * 1000
        });

        return res.status(200).json({"message": "Success"});
    }
    else {
        return res.status(406).json({ message: 'Unauthorized' });
    }
});


router.route('/signup').post(async (req, res, next) => {
    const { email, password } = req.body;

    const newUser = new User()

    newUser.email = email
    hash(password, 10, async function(err, hash) {
        newUser.password = hash
        try {
            // Creating the new user in DB.
            await appDataSource.getRepository(User).save(newUser)
        } catch {
            const error = new Error("Error! Something went wrong.");
            return next(error);
        };
    });



    let accessToken;
    try {
        // Creating jwt token
        accessToken = sign(
          { userId: newUser.id, email: newUser.email },
          accessSecret, // TODO: Move secret key to .env
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
            refreshSecret, 
            { expiresIn: '15d' }
        );
    } catch (err) {
            const error = new Error("Error! Something went wrong.");
            return next(error);
    };

    // Assigning refresh token in http-only cookie 
    res.cookie("refreshToken", refreshToken, { httpOnly: true, 
        sameSite: 'none', secure: true, 
        maxAge: 24 * 60 * 60 * 1000 * 15
    });
  
      res.cookie("accessToken", accessToken, { httpOnly: true, 
          sameSite: 'none', secure: true, 
          maxAge: 30 * 60 * 1000
    });

    res.status(200).json({"message": "Success"});
})

module.exports = router