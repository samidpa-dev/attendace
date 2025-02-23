'use strict'

const db = require(__base + 'app/models');
const moment = require('moment');
const { 
  elasticSearch,
} = require(`${__base}lib/elasticsearch`);

module.exports = async (req, res, next) => {
  async function getReportFromSql(filter={}, page=1, perPage=100) {
    let where = {};

    if (filter.dateStart && filter.dateEnd) {
      where.createdAt = { 
        [db.Sequelize.Op.gte]: moment(filter.date).tz('Asia/Jakarta').startOf('day'), 
        [db.Sequelize.Op.lte]: moment(filter.date).tz('Asia/Jakarta').endOf('day') 
      };
    }

    if (filter.userId) {
      where.userId = filter.userId;
    }

    const attend = await db.Attendances.findAndCountAll({ 
      where,  
      include: [
        {
          model: db.Users
        }
      ],
      limit: perPage,
      offset: (page - 1) * perPage
    });

    return {
      count: attend.count,
      data: attend.rows.map(item => {
        return {
          id: item.id,
          userId: item.userId,
          username: item.User.username,
          clockIn: item.clockIn,
          clockOut: item.clockOut,
          createdAt: item.createdAt
        }
      })
    };
  }

  async function getReportFromElastic(filter={}, page=1, perPage=100) {
    let conditions = {
      filter: [
        
      ]
    };

    if (filter.userId) {
      conditions.filter.push({
        term: {
          userId: filter.userId
        }
      });
    }

    if (filter.dateEnd && filter.dateStart) {
      conditions.filter.push({      
        range: {
          date: {
            gte: filter.dateStart,
            lte: filter.dateEnd
          }
        }
      });
    }

    console.log(conditions);
    

    const attend = await elasticSearch.findAndCountAll({
      index: 'attendances',
      where: conditions,
      offset: (page - 1) * perPage,
      limit: perPage
    });

    return attend;
  }

  try {
    let filter = {
      dateStart: req.body.dateStart ? moment(req.body.dateStart).tz('Asia/Jakarta').startOf('day') : moment().tz('Asia/Jakarta').startOf('day'),
      dateEnd: req.body.dateEnd ? moment(req.body.dateEnd).tz('Asia/Jakarta').endOf('day') : moment().tz('Asia/Jakarta').endOf('day')
    };
    let page =  req.body.page || 1; 
    let perPage = req.body.perPage || 100;

    if (req.body.userId) {
      filter.userId = req.body.userId;
    }

    let attend;

    if(req.body.source === 'sql') {
      attend = await getReportFromSql(filter, page, perPage);
    } else if(req.body.source === 'es') {
      attend = await getReportFromElastic(filter, page, perPage);
    }

    res.status(201).json(attend);
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: error.message||error.error });
  }
};