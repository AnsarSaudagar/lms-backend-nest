export default () => ({
  database: {
    mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/nest_db',
  },
});
