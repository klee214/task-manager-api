const mongoose = require('mongoose');
mongoose.connect(process.env.DB_MONGO_CONNECTION, {useNewUrlParser: true,useCreateIndex: true, useUnifiedTopology: true});
