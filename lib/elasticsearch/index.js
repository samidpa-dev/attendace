'use strict';

const { get, isObject, isEmpty, merge } = require('lodash');
const { Client } = require('@elastic/elasticsearch');

const esConfig = { 
  node: process.env.ELASTICSEARCH_URL,
  requestTimeout: 90000 
};

if (process.env.ELASTICSEARCH_USER && process.env.ELASTICSEARCH_PASS) {
  esConfig.auth = {
    username: process.env.ELASTICSEARCH_USER,
    password: process.env.ELASTICSEARCH_PASS,
  };
}

const client = new Client(esConfig);

class ElasticSearch {
  constructor() {
    this.limit = 10000; // size per pull
  }

  async create(index, key, data) {
    try {
      const exist = await this.findByPk(index, key);
      
      if (exist && exist.data) {
        console.log(`[ES-CREATE] Data already exists ${index}:${key}`);
        const currData = get(exist, 'data');
        const newData = get(data, 'dataValues', data);
        /**
         * currData = current/exist data
         * newData = new data
         */
        await this.update(index, key, merge(currData, newData));
      } else {
        await client.index({
          index,
          id: key,
          body: data,
          refresh: 'wait_for'
        });
        console.log(`[ES-CREATE] successfully saved data in elasticsearch ${index}:${key}`);
      }
      return;
    } catch(err) {
      console.log(`[ES-CREATE] failed to save data ${index}:${key}`, err);
      return;
    }
  }

  async update(index, key, data, options = {}) {
    try {
      await client.update({
        index,
        id: key,
        retry_on_conflict: 10,
        body: {
          doc: data
        },
        refresh: 'wait_for'
      });
  
      console.log(`[es-bridge] successfully update data in elasticsearch ${index}:${key}`);
      return;
    } catch (err) {
      console.log(`[es-bridge] failed to update data ${index}:${key}`, err);

      let retryCount = options.retryCount || 0;
      retryCount++;

      // set flag isConflict = true
      if (err.meta && err.meta.statusCode === 409 && key) {
        await this.setConflictUpdate({ index, key, data }, retryCount);
      }

      return;
    }
  }

  async setConflictUpdate(data, retryCount = 0) {
    try {
      const maxRetry = 5;
      const delay = Math.pow(2, retryCount) * 100; // delay with exponential backoff
  
      if (retryCount > maxRetry) {
        console.log(`[ES-CONFLICT-UPDATE] set conflict data exceeds max retry on ${data.index} with id : ${data.id}`);
        return;
      }
  
      await new Promise(resolve => setTimeout(resolve, delay));
      
      const exist = await this.findByPk(data.index, data.key);
  
      if (exist && exist.data) {
        const existData = get(data, 'data');
        const params = Object.assign(existData, {
          isConflict: true
        });
  
        console.log(`[ES-CONFLICT-UPDATE] set conflict data on ${data.index} with id : ${data.key}`);
  
        await this.update(data.index, data.key, params, { retryCount });
      }
      return;
    } catch (err) {
      console.log(`[ES-CONFLICT-UPDATE] failed set conflict data on ${data.index}: ${JSON.stringify(err)}`);
      return;
    }
  }

  async findAndCountAll({ index, where, offset, limit, order }, opts = {}) {
    try {
      let body;
      if (isObject(where) && !isEmpty(where)) {
        body = {
          query: {
            bool: where
          }
        };
      }
      
      const [data, count] = await Promise.all([
        this._getAll({ index, where, offset, limit, order }, opts),
        client.count({ index, body, ...opts })
      ]);
            
      return {
        rows: this._parseData(data),
        count: count.count
      };
    } catch (err) {
      console.log(`[ESClient] findAndCountAll error on ${index}: ${err}`);
      return {
        rows: [],
        count: 0
      };
    }
  }

  async findByPk(index, id) {
    console.log(index);
    console.log(id);
    
    try {
      const data = await client.search({
        index,
        body: {
          query: {
            bool: {
              filter: [
                { match: { id, } },
              ],
            },
          },
          size: 1,
        }
      });

      const dataRes = get(data, 'hits.hits[0]._source', null);
      const docId = get(data, 'hits.hits[0]._id');

      console.log(data);
      

      return { 
        data: dataRes, 
        docId 
      };
    } catch (err) {
      console.log(`[es-bridge] failed to findByPk data ${index}:${id}`, err);
      return {};
    }
  }

  async _getAll({ index, where, offset, limit, order, unlimited }, opts = {}) {
    try {
      let size, from, body = {};
      if (isNumber(offset)) {
        from = offset;        
      }
      if (isNumber(limit)) {
        size = limit;
      }
      if ((isObject(order) || isArray(order)) && !isEmpty(order)) {
        Object.assign(body, {
          sort: order
        });
      }
      if ((isObject(where) || isArray(where)) && !isEmpty(where)) {
        Object.assign(body, {
          query: {
            bool: where
          }
        });
      }

      if (unlimited) {
        const chunkSize = this.limit;
        const totalData = await this.getCount({ index, where });
        const totalChunks = Math.ceil(totalData / chunkSize);

        let searchAfterId = 0;
        const result = [];

        for (let i = 0; i < totalChunks; i++) {
          Object.assign(body, {
            size: chunkSize,
            search_after: searchAfterId ? [searchAfterId] : undefined
          });
          
          const data = await client.search({ index, body, ...opts });
          const hits = get(data, 'hits.hits', []);
          
          if (hits.length === 0) {
            break;
          }

          result.push(...hits);
          
          const lastLoop = hits[chunkSize - 1];
          searchAfterId = get(lastLoop, 'sort[0]') || get(lastLoop, '_id');
        }
        
        return this._parseData(result);
      }
      
      this.log.info(`[ESClient] getAll payload: ${JSON.stringify({ index, from, size, body, ...opts })}`);

      const data = await client.search({ index, from, size, body, ...opts });

      return get(data, 'hits.hits', []);
    } catch (err) {
      this.log.error(`[ESClient] getAll error on ${index}: ${err}`);
      throw err;
    }    
  }

  _parseData(data) {
    const sources = [];
    if (data.length) {
      data.forEach(item => {
        sources.push(item._source);
      });
    }

    return sources;
  }

  async createIndex(index) {
    const indexInit = `${index}-0000001`;
    try {
      await client.indices.create({
        index: indexInit,
        body: {
          aliases: { [index]: { is_write_index: true } }
        }
      });

      console.log(`[Elasticsearch] Created index ${indexInit}`);
    } catch (error) {
      console.log(`[Elasticsearch] An error occurred while creating the index ${indexInit}`, error);
    }
  }
}

const elasticSearch = new ElasticSearch();

module.exports = {
  esClient: client,
  elasticSearch
};