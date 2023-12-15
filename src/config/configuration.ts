export default () => ({
  port: parseInt(process.env.PORT, 10) || 8080,
  database: {
    uri: process.env.DATABASE_URI,
    useFindAndModify: process.env.DATABASE_USE_FIND_AND_MODIFY === 'true',
    useNewUrlParser: process.env.DATABASE_USE_NEW_URL_PARSER === 'true',
    useUnifiedTopology: process.env.DATABASE_USE_UNIFIED_TOPOLOGY === 'true',
  },
  bucket: {
    audio: process.env.BUCKET_AUDIO,
    audioCopy: process.env.BUCKET_AUDIO_COPY,
  },
});
