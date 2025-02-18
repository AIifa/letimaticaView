import mongoose from 'mongoose';

export default defineNitroPlugin(async () => {
  try {
    const URL = useRuntimeConfig().MONGODB_URL;
    await mongoose.connect(URL);
    console.log('MongoDB connection: ' + mongoose.connection.readyState)
  } catch (error) {
    console.error(error);
  }
});