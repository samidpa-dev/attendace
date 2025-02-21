const express = require('express');
const helmet = require('helmet');
const cors = require('cors');

const app = express();

app.use(helmet());
app.use(cors());

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});