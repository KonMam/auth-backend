import express, { Request, Response } from 'express'
import { appDataSource } from '../data-source'
import { User } from '../entities/user.entity'

const router = express.Router()

router.route('/').get(async (req: Request, res: Response) => {
    const users = await appDataSource.getRepository(User).find()
    return res.status(200).json(users)
})

router.route('/').post(async (req: Request, res: Response) => {

    console.log(req.body)
    const { email, password } = req.body

    const user = new User()
    user.email = email
    user.password = password

    const userRepository = appDataSource.getRepository(User)

    const results = await userRepository.save(user)

    return res.status(200).send(results)
})

module.exports = router