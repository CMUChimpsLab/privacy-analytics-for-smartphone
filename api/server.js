// server.js

// BASE SETUP
// =============================================================================

// call the packages we need
var express = require('express'); // call express
var cors = require('cors');
var fs = require('fs');
var app = express(); // define our app using express
var bodyParser = require('body-parser');
var MS = require('./search.js');
var Dashboard = require('./dashboard.js');
var _ = require('lodash');
var gplay = require('google-play-scraper');


// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.use(cors());

var port = process.env.PORT || 8080; // set our port

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router(); // get an instance of the express Router

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function (req, res) {
    res.json({
        message: 'hooray! welcome to our api!'
    });
});
router.get('/taxonomies/privacyDistribution/:id', function (req, res) {
    const id = req.params.id;
    MS.connectToDb(function (client) {
        MS.getPrivacyRatingDistribution(client, id, function (data) {
            res.json(data);
        });
    })
})
router.get('/taxonomies/jello/:id', function (req, res) {
    const id = req.params.id;
    MS.connectToDb(function (client) {
        Dashboard.GetDashboardData(client, id, function (data) {
            res.json(data);
        });
    })
})
router.post('/taxonomies/search', function (req, res) {
    // console.log(req.body);
    const params = {
        skip: 0,
        limit: 25,
        dataCategories: null,
        appCategories: null,
        subDataCategories: null,
        privacyGrades: null,
        metaInstalls: null,
        metaFrees: null,
        metaAdSupported: null,
        search: null
    };
    if (req.query) {
        if (req.query.skip) {
            params.skip = parseInt(req.query.skip) || 0;
        }
        if (req.query.limit) {
            params.limit = parseInt(req.query.limit) || 0;
        }
    }
    let ADV_SEARCH = false;
    if (req.body) {
        if (req.body.skip) {
            params.skip = parseInt(req.body.skip) || 0;
        }
        if (req.body.limit) {
            params.limit = parseInt(req.body.limit) || 0;
        }
        if (req.body.dataCategories) {
            // params.dataCategories = req.body.dataCategories;
            ADV_SEARCH = true;
        }
        if (req.body.search) {
            params.search = req.body.search;
            ADV_SEARCH = true;
        }
        if (req.body.appCategories) {
            params.appCategories = req.body.appCategories;
            ADV_SEARCH = true;
        }
        if (req.body.subDataCategories) {
            params.subDataCategories = req.body.subDataCategories;
            ADV_SEARCH = true;
        }
        if (req.body.privacyGrades) {
            params.privacyGrades = req.body.privacyGrades;
            ADV_SEARCH = true;
        }
        if (req.body.metaInstalls) {
            params.metaInstalls = req.body.metaInstalls;
            ADV_SEARCH = true;
        }
        if (req.body.metaFrees) {
            params.metaFrees = req.body.metaFrees;
            ADV_SEARCH = true;
        }
        if (req.body.metaAdSupported) {
            params.metaAdSupported = req.body.metaAdSupported;
            ADV_SEARCH = true;
        }
    }
    MS.connectToDb(function (client) {
        if (ADV_SEARCH === true) {
            MS.searchAppsQuery(client, 'ADV_SEARCH', params, function (apps) {
                res.json(apps);
            });
        } else {
            MS.searchAppsQuery(client, 'BASIC_SEARCH', params, function (apps) {
                res.json(apps);
            });
        }
    })
})
router.get('/taxonomies/searchMetaData', function(req, res) {
    MS.connectToDb(function (client) {
        MS.searchMetaDataQuery(client, function (data) {
            res.json(data);
        });
    })
});
router.get('/taxonomies/search/:id', function (req, res) {
    const params = {
        skip: 0,
        limit: 25,
    };
    if (req.query) {
        if (req.query.skip) {
            params.skip = parseInt(req.query.skip) || 0;
        }
        if (req.query.limit) {
            params.limit = parseInt(req.query.limit) || 25;
        }
        if (req.query.category) {
            params.category = req.query.category;
        }
        if (req.query.applyProject) {
            if (req.query.applyProject.toString() === 'false') {
                params.applyProject = false;
            }
            if (req.query.applyProject.toString() === 'true') {
                params.applyProject = true;
            }
        }
    }
    params.id = req.params.id;
    MS.connectToDb(function (client) {
        MS.searchAppsQuery(client, 'TAXONOMY_SEARCH', params, function (apps) {
            res.json(apps);
        });
    })
})
router.get('/taxonomies/dashboard/:id', (req, res) => {
    const id = req.params.id;
    const result = GetDashboarData(id);
    if (result) {
        res.status(200).send(result);
    } else {
        res.status(500).send('INTERNAL SERVER ERROR');
    }
});
router.get('/taxonomies/detail/:parent/:child', (req, res) => {
    const parent = req.params.parent;
    const child = req.params.child;
    const result = GetTaxonomyData(parent, child);
    if (result) {
        res.status(200).send(result);
    } else {
        res.status(500).send('INTERNAL SERVER ERROR');
    }
});
router.get('/taxonomies/snapshot/:id', (req, res) => {
    let id = req.params.id;
    if (!id) {
        id = 'dashboard';
    }
    const result = GetSnapshotForDashboard(id);
    if (result) {
        res.status(200).send(result);
    } else {
        res.status(500).send('INTERNAL SERVER ERROR');
    }
});
router.get('/taxonomies/collection/:id', (req, res) => {
    let id = req.params.id;
    if (!id) {
        id = 'TOP_FREE';
    }
    const result = GetSnapshotForCollection(id);
    result.then(function(data) {
        MS.connectToDb(function (client) {
            const params = {"meta.genreId" : "SOCIAL" };
            MS.searchAppsQuery(client, 'LIST_SEARCH', params, function (apps) {
                res.json(apps);
            });
        })
    }, function () {
        res.status(500).send('INTERNAL SERVER ERROR');
    });
});
router.get('/taxonomies/app/:id', (req, res) => {
    let id = req.params.id;
    if (id) {
        let result = GetSnapshotForApp(id);
        if (result) {
            MS.connectToDb(function (client) {
                MS.searchApp(client, id, function (data) {
                    if (data.length > 0) {
                        result = Object.assign({}, result, data[0]);
                    }
                    res.json(result);
                });
            });
        } else {
            res.status(500).send('INTERNAL SERVER ERROR');
        }
    } else {
        res.status(500).send('INTERNAL SERVER ERROR');
    }
});
// more routes for our API will happen here

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);

const classfiedFileParent = 'data/classified';
const dashboardFolder = 'data/classified/dashboard';

function GetDashboarData(dataCategory) {
    let file = `${dashboardFolder + '/' + 'all'}.json`;
    if (dataCategory) {
        file = `${dashboardFolder + '/' + dataCategory}.json`;
    }
    const contents = fs.readFileSync(file);
    const data = JSON.parse(contents);
    return data;
}

function GetTaxonomyData(parent, child) {
    let data = null;
    if (parent) {
        parent = parent.toUpperCase();
    }
    if (child) {
        child = child.toUpperCase();
    }
    if (parent && child) {
        const file = `${classfiedFileParent}/taxonomies_based/${parent}.${child}.json`;
        const contents = fs.readFileSync(file);
        data = JSON.parse(contents);
    }
    return data;
}

function GetSnapshotForDashboard(id) {
    const file = `${classfiedFileParent}/api-samples/${id}.json`;
    const contents = fs.readFileSync(file);
    data = JSON.parse(contents);
    data.id = id;
    return data;
}

function GetSnapshotForCollection(id) {
    let promise = new Promise(function(resolve, reject) {
        gplay.list({
            collection: gplay.collection[id],
            num: 100
          })
          .then(function (data) {
            const mappedData = data.map(x => {
                return {
                    package: x.appId,
                    title: x.title,
                    icon: x.icon,
                    sumamry: x.summary,
                    developer: x.developer
                };
            });
            resolve(mappedData);
          }, function (error) {
            reject(error);
          });
      });
    return promise;
}

function GetSnapshotForApp(package) {
    const file = `${classfiedFileParent}/uniqued/apps.json`;
    const contents = fs.readFileSync(file);
    data = JSON.parse(contents);
    let app = null;
    if (data.data.length > 0) {
        app = data.data.find(x => x.app === package);
    }
    return app;
}