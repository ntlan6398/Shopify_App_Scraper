import { MongoClient, Db } from "mongodb";
import "dotenv/config";
const DATABASE_URL = process.env.DATABASE_URL;
console.log("🚀 ~ DATABASE_URL:", DATABASE_URL);

if (!DATABASE_URL) {
  throw new Error(
    "Please define the DATABASE_URL environment variable inside .env.local"
  );
}

/** @type {Db | null} */
let cachedDb = null;

/**
 * Connects to the MongoDB database
 * @returns {Db}
 */
export function connectToDatabase() {
  if (!DATABASE_URL) {
    throw new Error(
      "Unable to connect to MongoDb no connection string was provided"
    );
  }

  if (cachedDb) {
    return cachedDb;
  }

  // Connect to our MongoDB database hosted on MongoDB Atlas
  const client = new MongoClient(DATABASE_URL);

  // Specify which database we want to use
  const db = client.db("db");

  cachedDb = db;

  return db;
}

connectToDatabase();
