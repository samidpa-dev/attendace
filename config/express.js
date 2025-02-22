const helmet = require('helmet');
const cors = require('cors');
const bodyParser = require('body-parser');


module.exports = app => {
  app.use(helmet());
  app.use(cors());
  
  require('body-parser-xml')(bodyParser);

  app.use(bodyParser.json({ limit: '10mb' }));
  app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));


  require('../app/controllers')(app);

  app.use((req, res, next) => {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
  });
}