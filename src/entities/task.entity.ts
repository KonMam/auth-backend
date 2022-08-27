import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'

@Entity()
export class Task {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    userId: number

    @Column()
    text: string

    @Column()
    status: boolean
}