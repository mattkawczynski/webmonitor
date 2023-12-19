const cron = require('node-cron');
const axios = require('axios');
const UrlEntry = require('../models/urlEntry');
const UrlHealth = require('../models/urlHealth');
const UrlAggregatedHealth = require('../models/urlAggregatedHealth');

const logger = require('../services/logger');
const sendEmail = require('../services/notification');

function addUrlHealth(urlEntry, status, statusText, responseTime) {
    const urlHealth = new UrlHealth({
        urlId: urlEntry.id,
        statusCode: status,
        statusText: statusText,
        fetchDate: new Date(),
        responseTime: responseTime
    });
    if (status !== 200) {
        sendEmail(
            `Issue with ${urlEntry.url}.`,
            `Reported status: ${status}, ${statusText}\nTime: ${urlEntry.updatedAt}`, 
             urlEntry.id
        );
    }
    return urlHealth;
}

async function aggregateData(urlEntry, responseTime, response) {
    const now = new Date();
    const hour = now.getHours();
    const minutes = now.getMinutes();
    const date = now.toLocaleDateString('en-US', { timeZone: 'UTC' });     
    
    const urlAggregatedHealth = await UrlAggregatedHealth.findOne({ urlId: urlEntry.id, dateHour: `${date} ${hour}:${minutes}` });
    
    if (!urlAggregatedHealth) {
        const newUrlAggregatedHealth = new UrlAggregatedHealth({
            urlId: urlEntry.id,
            dateHour: `${date} ${hour}:${minutes}`,
            avgResponseTime: responseTime,
            incidentCount: 0,
            successResponseCount: 0
        });

        if (response.status >= 200 && response.status < 300) {
            newUrlAggregatedHealth.successResponseCount = 1;
        } else {
            newUrlAggregatedHealth.incidentCount = 1;
        }

        await newUrlAggregatedHealth.save();
    } else {
        urlAggregatedHealth.avgResponseTime = Math.round((urlAggregatedHealth.avgResponseTime + responseTime) / 2);

        if (response.status >= 200 && response.status < 300) {
            urlAggregatedHealth.successResponseCount++;
        } else {
            urlAggregatedHealth.incidentCount++;
        }
        await urlAggregatedHealth.save();
    }
} 

async function cronSchedule(io) {
    cron.schedule('*/55 * * * * *', async () => {
        logger.info('Cron schedule started');
        logger.info('Fetching URLs and adding response codes to UrlHealth model...');
        const urlEntries = await UrlEntry.find();

        for (const urlEntry of urlEntries) {
            let hitCount = urlEntry.hitCount + 1;
            const startTime = new Date();
            try {
                process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;

                const response = await axios.get(urlEntry.url);
                const endTime = new Date();
                const responseTime = endTime - startTime;
                const urlHealth = addUrlHealth(urlEntry, response.status, response.statusText, responseTime);
                await urlHealth.save();
                await UrlEntry.findOneAndUpdate({_id: urlEntry.id}, {urlHealth: response.status, hitCount: hitCount, sendNotification: true, latestResponseTime: responseTime})
                logger.info(`Successfully added status code ${response.status} for URL ${urlEntry.url} with sendNotification flag set to true`);
                io.emit('update', `Status code ${responseTime} ms`);

                aggregateData(urlEntry, responseTime, response)
                
            } catch (error) {
                let incidentCount = urlEntry.incidentCount + 1;
                logger.error(error);
              
                const endTime = new Date();
                const responseTime = endTime - startTime;
              
                if (error.response) {
                  const urlHealth = addUrlHealth(urlEntry, error.response.status, error.response.statusText, responseTime);
                  await urlHealth.save();
                  await UrlEntry.findOneAndUpdate({_id: urlEntry.id}, {urlHealth: error.response.status, hitCount: hitCount, sendNotification: false, incidentCount: incidentCount, latestResponseTime: responseTime })
                  logger.info(`Successfully added status code ${error.response.status} for URL ${urlEntry.url}`);
                  io.emit('update', `Status code ${responseTime} ms`);
                  aggregateData(urlEntry, responseTime, error.response.status)
                } else {
                  const urlHealth = addUrlHealth(urlEntry, 404, "Not Found", responseTime);
                  await urlHealth.save();
                  await UrlEntry.findOneAndUpdate({_id: urlEntry.id}, {urlHealth: 404, hitCount: hitCount, sendNotification: false, incidentCount: incidentCount, latestResponseTime: responseTime })
                  logger.error(`Error fetching response code for URL ${urlEntry.url}: ${error}. This is probably 404 response.`);
                  io.emit('update', `Status code ${responseTime} ms`);
                  aggregateData(urlEntry, responseTime, 404)
                }
            }
        }
    });
}

module.exports = cronSchedule;