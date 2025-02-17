import mongoose from 'mongoose';

export default defineNitroPlugin(async () => {
  try {
    const URL = useRuntimeConfig().MONGODB_URL;
    await mongoose.connect(URL);
    console.log(`MongoDB: connection successful! `)
  } catch (error) {
    handleError(error);
  }
});