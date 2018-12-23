import 'zone.js/dist/zone-node';
import 'reflect-metadata';
import { enableProdMode } from '@angular/core';
import * as fs from 'fs';
import * as bodyParser from 'body-parser';
import * as MS from './api/search';
// import * as gplay from 'google-play-scraper';

// Express Engine
import { ngExpressEngine } from '@nguniversal/express-engine';
// Import module map for lazy loading
import { provideModuleMap } from '@nguniversal/module-map-ngfactory-loader';

import * as express from 'express';
import { join } from 'path';
import { Cacher } from './api/cacher';
import { GetDashboardData } from './api/dashboard';

// Faster server renders w/ Prod mode (dev mode never needed)
enableProdMode();

// Express server
const app = express();

const PORT = process.env.PORT || 8080;
const DIST_FOLDER = join(process.cwd(), 'dist');

// * NOTE :: leave this as require() since this file is built Dynamically from webpack
const { AppServerModuleNgFactory, LAZY_MODULE_MAP } = require('./dist/server/main');

// Our Universal express-engine (found @ https://github.com/angular/universal/tree/master/modules/express-engine)
app.engine('html', ngExpressEngine({
  bootstrap: AppServerModuleNgFactory,
  providers: [
    provideModuleMap(LAZY_MODULE_MAP),
    // In case you want to use an AppShell with SSR and Lazy loading
    // you'd need to uncomment the below. (see: https://github.com/angular/angular-cli/issues/9202)
    // {
    //   provide: NgModuleFactoryLoader,
    //   useClass: ModuleMapNgFactoryLoader,
    //   deps: [
    //     Compiler,
    //     MODULE_MAP
    //   ],
    // },
  ]
}));

app.set('view engine', 'html');
app.set('views', join(DIST_FOLDER, 'browser'));

var router = express.Router();
router.get('/', function (req, res) {
  res.json({
    message: 'hooray! welcome to our api!'
  });
});
router.get('/taxonomies/privacyDistribution/:id', Cacher(), function (req, res) {
  const id = req.params.id;
  MS.connectToDb(function (client) {
      MS.getPrivacyRatingDistribution(client, id, function (data) {
          res.json(data);
      });
  })
})
router.get('/taxonomies/jello/:id', Cacher(), function (req, res) {
  const id = req.params.id;
  MS.connectToDb(function (client) {
      GetDashboardData(client, id, function (data) {
          res.json(data);
      });
  })
})
router.post('/taxonomies/search', Cacher(), function (req, res) {
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

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());
// app.get('/api/*', router);
app.get('/api/taxonomies/jello/:id', Cacher(), function (req, res) {
    const id = req.params.id;
    MS.connectToDb(function (client) {
        GetDashboardData(client, id, function (data) {
            res.json(data);
        });
    })
  })

// Server static files from /browser
app.get('*.*', express.static(join(DIST_FOLDER, 'browser'), {
  maxAge: '1y'
}));

// All regular routes use the Universal engine
app.get('*', (req, res) => {
  res.render('index', { req });
});

// Start up the Node server
app.listen(PORT, () => {
  console.log(`Node Express server listening on http://localhost:${PORT}`);
});
