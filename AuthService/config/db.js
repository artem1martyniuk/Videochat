import mongoose from 'mongoose'

export const db = async () => {
    try{
        const mongoURI = process.env.MONGO_URI

        if(!mongoURI){
            throw new Error("No mongodb URI provided");
        }
        await mongoose.connect(mongoURI)
        console.log('Connected to MongoDB')
    }catch(err){
        console.error(`Cant connect to MongoDB, ${err}`)
        process.exit(1)
    }
}