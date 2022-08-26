import express from 'express'
import { appDataSource } from '../data-source';
import { Pokemon } from '../entities/pokemon.entity';
import { verify } from 'jsonwebtoken'
import { User } from '../entities/user.entity';

const router = express.Router()

router.route('/').get(async (req, res, next) => {

    let token;
    try {
        token = req.headers.authorization!.split(' ')[1];
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

    // If user is registered and loged in (has token) - return pokemon data.
    const pokemons = await appDataSource.getRepository(Pokemon).find()

    res.status(200).json({
        success:true,
        data: {
            pokemons
        }
    });
})

router.route('/').post(async (req, res, next) => {

    const { name, hp, str } = req.body

    let token;
    try {
        token = req.headers.authorization!.split(' ')[1];
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
    const newPokemon = new Pokemon()

    newPokemon.name = name
    newPokemon.hp = hp
    newPokemon.str = str

    try {
        await appDataSource.getRepository(Pokemon).save(newPokemon)
    } catch {
        const error = new Error("Error! Something went wrong.");
        return next(error);
    };

    res.status(200).json({
        success:true,
        data: {
            id: newPokemon.id,
            name: newPokemon.name,
            hp: newPokemon.hp,
            str: newPokemon.str
        }
    });
})

module.exports = router