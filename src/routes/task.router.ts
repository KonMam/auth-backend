import express from 'express'
import { Secret, verify } from 'jsonwebtoken'

import { appDataSource } from '../data-source';
import { Task } from '../entities/task.entity';
import { User } from '../entities/user.entity';
import dotenv from 'dotenv'

const router = express.Router()

dotenv.config()
const accessSecret = process.env.ACCESS_TOKEN_SECRET as Secret

interface JwtPayload {
        id: number,
        email: string,
        exp: number
}

router.route('/').get(async (req, res, next) => {
    let token;
    try {
        token = req.cookies.accessToken;
    } catch {
        const error = new Error("Error! Token was not provided.");
        return next(error)
    }

    let id, email, exp;
    try {
        ({ id, email, exp } = verify(token, accessSecret) as JwtPayload)
    } catch (err) {
        return res.status(401).send('Invalid Token');
    }

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
        token = req.cookies.accessToken;
    } catch {
        const error = new Error("Error! Token was not provided.");
        return next(error)
    }

    let id, email, exp;
    try {
        ({ id, email, exp } = verify(token, accessSecret) as JwtPayload)
    } catch (err) {
        return res.status(401).send('Invalid Token');
    }
    
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


router.route('/:taskId').put(async (req, res, next) => {

    const taskId: number = parseInt(req.params.taskId)
    const status: boolean = req.body.status

    let token;
    try {
        token = req.cookies.accessToken;
    } catch {
        const error = new Error("Error! Token was not provided.");
        return next(error)
    }

    let id, email, exp;
    try {
        ({ id, email, exp } = verify(token, accessSecret) as JwtPayload)
    } catch (err) {
        return res.status(401).send('Invalid Token');
    }

    // Checking if user exists in DB.
    let existingUser;
    try {
        existingUser = await appDataSource.getRepository(User).findOneBy({ email: email })
    } catch {
        const error = new Error("Error! Something went wrong.");
        return next(error)
    };

    // If user is registered and loged in (has token) - return note data.
    const todos = await appDataSource.getRepository(Task).findOneBy({ id: taskId })
    if (todos) {
        todos.status = status

        try {
            await appDataSource.getRepository(Task).save(todos)
        } catch {
            const error = new Error("Error! Something went wrong.");
            return next(error);
        };
    } 
    
    
    

    res.status(200).json(todos);
})

module.exports = router