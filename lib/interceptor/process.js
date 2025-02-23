const SAVE_RESPONSE_CODE = [200, 201];
const { 
  elasticSearch,
} = require(`${__base}lib/elasticsearch`);
const db = require(__base + 'app/models');

const saveElastic = (processName, type) => {
  return (req, res, next) => {
    console.log('STARTING PROCESS ELASTIC');

    const oldResponderJson = res.json;
    res.json = async function (data) {
      res.json = oldResponderJson;
      
      if (!SAVE_RESPONSE_CODE.includes(res.statusCode)) {
        return res.json(data);
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
          processName+'-'+data.attend.userId+'-'+data.attend.id,
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
  saveElastic
};