import mongoose from "mongoose";

// Function to connect to the mongodb database
export const connectDB = async () => {
    try {
        mongoose.connection.on('connected', () => console.log('Database Connected'));
        mongoose.connection.on('error', (err) => console.error('Database connection error:', err));

        if (!process.env.MONGODB_URI) {
            throw new Error("MONGODB_URI is not defined in .env");
        }

        await mongoose.connect(process.env.MONGODB_URI);
    } catch (error) {
        console.error("Critical: Could not connect to MongoDB", error);
        process.exit(1);
    }
}