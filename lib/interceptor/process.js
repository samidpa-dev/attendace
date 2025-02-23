const SAVE_RESPONSE_CODE = [200, 201];
const { 
  elasticSearch,
} = require(`${__base}lib/elasticsearch`);
const db = require(__base + 'app/models');
const {
  clockIn,
  clockOut,
} = require(__base + 'lib/redis');

const saveOther = (processName, type) => {
  return (req, res, next) => {
    console.log('STARTING PROCESS ELASTIC: '+processName);

    const oldResponderJson = res.json;
    res.json = async function (data) {
      res.json = oldResponderJson;
      
      if (!SAVE_RESPONSE_CODE.includes(res.statusCode)) {
        return res.json(data);
      }

      if (type === 'clockin') {
        clockIn(data.attend.userId);
      }

      if (type === 'clockout') {
        clockOut(data.attend.userId);
      }

      const user = await db.Users.findByPk(data.attend.userId);

      if (!user) {
        return res.json(data);
      }

      const params = { 
        userId: user.id,
        username: user.username,
        date: data.attend.createdAt,
        clockIn: data.attend.clockIn,
        clockOut: data.attend.clockOut
      };
      
      try {
        await elasticSearch.create(
          'attendances',
          data.attend.id,
          params
        ); 
      } catch (error) {
        console.log(error);
      }

      return res.json(data);
    };
    next();
  };
};

module.exports = {
  saveOther
};