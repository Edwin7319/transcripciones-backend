export default () => ({
  port: parseInt(process.env.PORT, 10) || 8080,
  database: {
    uri: process.env.DATABASE_URI,
    useFindAndModify: process.env.DATABASE_USE_FIND_AND_MODIFY === 'true',
    useNewUrlParser: process.env.DATABASE_USE_NEW_URL_PARSER === 'true',
    useUnifiedTopology: process.env.DATABASE_USE_UNIFIED_TOPOLOGY === 'true',
  },
  bucket: {
    audio: process.env.PATH_BUCKET_AUDIO,
    audioCopy: process.env.PATH_BUCKET_AUDIO_COPY,
  },
  file: {
    transcriptionPath: process.env.PATH_FILE_TRANSCRIPTION,
    transcriptionLocationPath: process.env.PATH_FILE_TRANSCRIPTION_LOCATION,
  },
  jwt: {
    secretKey: process.env.JWT_SECRET_KEY,
    expiration: process.env.JWT_EXPIRATION,
  },
  email: {
    sender: process.env.EMAIL_SENDER,
    password: process.env.EMAIL_PASSWORD,
    support: process.env.EMAIL_SUPPORT,
    appUrl: process.env.EMAIL_APP_URL,
    companyName: process.env.EMAIL_COMPANY_NAME,
  },
});
