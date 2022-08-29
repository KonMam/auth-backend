import express from 'express'
import { verify } from 'jsonwebtoken'

import { appDataSource } from '../data-source';
import { Task } from '../entities/task.entity';
import { User } from '../entities/user.entity';

const router = express.Router()

router.route('/').get(async (req, res, next) => {

    let token;
    try {
        token = req.cookies.token;
    } catch {
        const error = new Error("Error! Token was not provided.");
        return next(error)
    }

    // Decoding the token
    interface JwtPayload {
        id: number,
        email: string
    }

    const { id, email } = verify(token, "kuibnbsfgsadgps" ) as JwtPayload
    
    
    // Checking if user exists in DB.
    let existingUser;
    try {
        existingUser = await appDataSource.getRepository(User).findOneBy({ email: email })
    } catch {
        const error = new Error("Error! Something went wrong.");
        return next(error)
    };

    // If user is registered and loged in (has token) - return note data.
    const todos = await appDataSource.getRepository(Task).findBy({ userId: existingUser!.id})

    res.status(200).json(todos);
})

router.route('/').post(async (req, res, next) => {

    const { text } = req.body

    let token;
    try {
        token = req.cookies.token;
    } catch {
        const error = new Error("Error! Token was not provided.");
        return next(error)
    }

    // Decoding the token
    interface JwtPayload {
        id: number,
        email: string
    }

    const { id, email } = verify(token, "kuibnbsfgsadgps" ) as JwtPayload
    
    
    // Checking if user exists in DB.
    let existingUser;
    try {
        existingUser = await appDataSource.getRepository(User).findOneBy({ email: email })
    } catch {
        const error = new Error("Error! Something went wrong.");
        return next(error)
    };

    // If user is registered and loged in (has token) - add pokemon to db.
    const newTask = new Task()

    
    newTask.userId = existingUser!.id
    newTask.text = text
    newTask.status = false

    try {
        await appDataSource.getRepository(Task).save(newTask)
    } catch {
        const error = new Error("Error! Something went wrong.");
        return next(error);
    };

    res.status(200).json({
        success:true,
        data: {
            id: newTask.id,
            userId: newTask.userId,
            text: newTask.text,
            status: newTask.status
        }
    });
})

module.exports = router