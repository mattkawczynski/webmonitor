const { Router } = require('express');
const moment = require('moment');
const mongoose = require('mongoose');
const UrlEntry = require('../models/urlEntry');
const UrlHealth = require('../models/urlHealth');
const UrlAggregatedHealth = require('../models/urlAggregatedHealth');
const router = Router();


router.get('/', async(req, res, next) => {
    try {
        const entries = await UrlEntry.find();
        res.json(entries);
    } catch (error) {
        next(error);
    }
});

router.get('/:id', async(req, res, next) => {
    try {
        const { id } = req.params;
        const entries = await UrlEntry.findOne({ _id: id });
        res.json(entries);
    } catch (error) {
        next(error);
    }
});

router.get('/:id/health', async(req, res, next) => {
    try {
        const { id } = req.params;
        const url = await UrlEntry.findOne({ _id: id });
        const health = await UrlHealth.find({ urlId: id });
        res.json({url, health});
    } catch (error) {
        next(error);
    }
});

router.get('/:id/aggregatedHealth', async(req, res, next) => {
    try {
        const { id } = req.params;
        const url = await UrlEntry.findOne({ _id: id });
        const aggregatedHealth = await UrlAggregatedHealth.find({ urlId: id });
        res.json({url, aggregatedHealth});
    } catch (error) {
        next(error);
    }
});

router.get('/:id/aggregatedHealthLast30Days', async (req, res, next) => {
    try {
      const { id } = req.params;
      const thirtyDaysAgo = moment().subtract(30, 'days').startOf('day').toDate();
      const oneDayAgo = moment().subtract(29, 'days').startOf('day').toDate(); // add one day to include documents from the current day

      const result = await UrlAggregatedHealth.aggregate([
        { 
            $match: {
                urlId: mongoose.Types.ObjectId(id),
                dateHour: { $gte: oneDayAgo, $lte: moment().toDate() } // add additional filter

            }
        },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m', date: '$dateHour' } },
            avgResponseTime: { $avg: '$avgResponseTime' },
            incidentCount: { $sum: '$incidentCount' },
            successResponseCount: { $sum: '$successResponseCount' },
          }
        },
        {
            $addFields: {
                uptime: {
                  $multiply: [
                    { $divide: ['$successResponseCount', { $add: ['$successResponseCount', '$incidentCount'] }] },
                    100
                  ]
                }
              }
        },
        {
          $project: {
            _id: 1,
            avgResponseTime: 1,
            incidentCount: 1,
            successResponseCount: 1,
            uptime: { $round: ['$uptime', 2] } // round to 2 decimal places

        }
        },
        { $sort: { _id: 1 } }
      ]);
  
      res.json(result);
    } catch (error) {
      next(error);
    }
});

router.get('/:id/status', async (req, res, next) => {
    try {
      const { id } = req.params;
      const thirtyDaysAgo = moment().subtract(30, 'days').startOf('day').toDate();
  
      const result = await UrlAggregatedHealth.aggregate([
        { 
            $match: {
                urlId: mongoose.Types.ObjectId(id),
                dateHour: { $gte: thirtyDaysAgo }
            }
        },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$dateHour' } },
            avgResponseTime: { $avg: '$avgResponseTime' },
            incidentCount: { $sum: '$incidentCount' },
            successResponseCount: { $sum: '$successResponseCount' },
          }
        },
        {
            $addFields: {
                uptime: {
                  $multiply: [
                    { $divide: ['$successResponseCount', { $add: ['$successResponseCount', '$incidentCount'] }] },
                    100
                  ]
                }
              }
        },
        {
          $project: {
            _id: 1,
            avgResponseTime: 1,
            incidentCount: 1,
            successResponseCount: 1,
            uptime: { $round: ['$uptime', 2] } // round to 2 decimal places

        }
        },
        { $sort: { _id: 1 } }
      ]);
  
      res.json(result);
    } catch (error) {
      next(error);
    }
});

router.get('/:id/incidents', async (req, res, next) => {
  try {
    const { id } = req.params;
    const thirtyDaysAgo = moment().subtract(30, 'days').startOf('day').toDate();
    const result = await UrlAggregatedHealth.aggregate([
      { 
        $match: {
            urlId: mongoose.Types.ObjectId(id),
            dateHour: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d %H:00:00', date: '$dateHour' } },
          incidentCount: { $sum: '$incidentCount' },
          successResponseCount: { $sum: '$successResponseCount' },
        }
      },
      {
        $addFields: {
          uptime: {
            $multiply: [
              { $divide: ['$successResponseCount', { $add: ['$successResponseCount', '$incidentCount'] }] },
              100
            ]
          }
        }
      },
      {
        $project: {
          _id: 1,
          uptime: { $round: ['$uptime', 2] }, // round to 2 decimal places
          incidentCount: '$incidentCount'
        }
      },
      {
        $match: {
          uptime: { $lt: 100 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const detailedResult = await UrlAggregatedHealth.aggregate([
      { 
        $match: {
            urlId: mongoose.Types.ObjectId(id),
            dateHour: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d %H:%M', date: '$dateHour' } },
          incidentCount: { $sum: '$incidentCount' },
          successResponseCount: { $sum: '$successResponseCount' },
        }
      },
      {
        $addFields: {
          uptime: {
            $multiply: [
              { $divide: ['$successResponseCount', { $add: ['$successResponseCount', '$incidentCount'] }] },
              100
            ]
          }
        }
      },
      {
        $project: {
          _id: 1,
          uptime: { $round: ['$uptime', 2] } // round to 2 decimal places
        }
      },
      {
        $match: {
          uptime: { $lt: 100 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json([result, detailedResult]);
  } catch (error) {
    next(error);
  }
});

router.get('/:id/allincidents', async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await UrlAggregatedHealth.aggregate([
      { 
        $match: {
          urlId: mongoose.Types.ObjectId(id),
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d %H:00:00', date: '$dateHour' } },
          incidentCount: { $sum: '$incidentCount' },
          successResponseCount: { $sum: '$successResponseCount' },
        }
      },
      {
        $addFields: {
          uptime: {
            $multiply: [
              { $divide: ['$successResponseCount', { $add: ['$successResponseCount', '$incidentCount'] }] },
              100
            ]
          }
        }
      },
      {
        $project: {
          _id: 1,
          uptime: { $round: ['$uptime', 2] }, // round to 2 decimal places
          incidentCount: '$incidentCount',
          urlId: mongoose.Types.ObjectId(id)
        }
      },
      {
        $match: {
          uptime: { $lt: 100 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.get('/:id/uptime', async (req, res, next) => {
    try {
      const { id } = req.params;
      const thirtyDaysAgo = moment().subtract(30, 'days').startOf('day').toDate();
  
      const result = await UrlAggregatedHealth.aggregate([
        { 
          $match: {
              urlId: mongoose.Types.ObjectId(id),
              dateHour: { $gte: thirtyDaysAgo }
          }
        },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m', date: '$dateHour' } },
            avgResponseTime: { $avg: '$avgResponseTime' },
            incidentCount: { $sum: '$incidentCount' },
            successResponseCount: { $sum: '$successResponseCount' },
          }
        },
        {
          $addFields: {
            uptime: {
              $multiply: [
                { $divide: ['$successResponseCount', { $add: ['$successResponseCount', '$incidentCount'] }] },
                100
              ]
            }
          }
        },
        {
        $project: {
          _id: 1,
          uptime: { $round: ['$uptime', 2] } // round to 2 decimal places
        }
        },
        { $sort: { _id: 1 } }
      ]);
  
      res.json(result);
    } catch (error) {
      next(error);
    }
});

router.post('/', async(req, res, next) => {
    const urlOrigin = new URL(req.body.url).origin;
    const existingUrl = await UrlEntry.findOne({ url: urlOrigin });
    req.body.url = urlOrigin;
    if(!existingUrl) {
        try {
            const urlEntry = new UrlEntry(req.body);
            const createdUrlEntry = await urlEntry.save();
            res.json({ createdUrlEntry });
        } catch (error) {
            if (error.name === 'ValidationError') {
                res.status(422);
            }
            next(error);
        }
    } else {
        res.status(409);
        res.json({
            error: `The following url ${req.body.url} seems to be already monitored.`,
        });
    }
});

router.delete('/:id/', async(req, res, next) => {
    try {
        const id = req.params.id;
        const foundListing = await UrlEntry.findOneAndRemove({_id: id}).exec();
        if (foundListing === null) {
            res.status(404);
            res.json({
                error: `Couldn't find the URL with the following id ${req.params.id}`,
            });
        } else {
            await UrlHealth.deleteMany({urlId: id}).exec();
            await UrlAggregatedHealth.deleteMany({urlId: id}).exec();
            res.status(200).send({ message: `Listing ${req.params.id} deleted` });
        }
    } catch (error) {
        if (error instanceof ReferenceError) {
            res.status(422);
        }
        next(error);
    }
});

module.exports = router;