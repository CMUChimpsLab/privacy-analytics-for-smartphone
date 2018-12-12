// These are important and needed before anything else
import 'zone.js/dist/zone-node';
import 'reflect-metadata';

import { enableProdMode } from '@angular/core';

import * as express from 'express';
import { join } from 'path';
import * as fs from 'fs';
import * as _ from 'lodash';

// Faster server renders w/ Prod mode (dev mode never needed)
enableProdMode();

// Express server
const app = express();

const PORT = process.env.PORT || 4000;
const DIST_FOLDER = join(process.cwd(), 'dist');

// * NOTE :: leave this as require() since this file is built Dynamically from webpack
const { AppServerModuleNgFactory, LAZY_MODULE_MAP } = require('./dist/server/main');

// Express Engine
import { ngExpressEngine } from '@nguniversal/express-engine';
// Import module map for lazy loading
import { provideModuleMap } from '@nguniversal/module-map-ngfactory-loader';
import { query } from '@angular/core/src/render3/query';

app.engine('html', ngExpressEngine({
	bootstrap: AppServerModuleNgFactory,
	providers: [
		provideModuleMap(LAZY_MODULE_MAP)
	]
}));

app.set('view engine', 'html');
app.set('views', join(DIST_FOLDER, 'browser'));

// TODO: implement data requests securely
app.get('/api/heroes', (req, res) => {
	var contents = fs.readFileSync('sample.json', 'utf8');
	var data = JSON.parse(contents);
	res.status(200).send(data.data);
});

app.get('/api/hosts', (req, res) => {
	const param = req.query.parameter;
	if (param) {
		const file = fs.readFileSync('data/hosts.json', 'utf8');
		const data = JSON.parse(file);
		let result = {};
		let count = 100;
		let sort = 'Descending';
		if (req.query.count) {
			count = Number(req.query.count);
		}
		if (req.query.sort) {
			sort = req.query.sort;
		}
		switch(param) {
			case 'list': {
				const hosts = data.hosts.sort((a, b) => {
					if (sort === 'Descending') {
						return b.count - a.count;
					} else {
						return a.count - b.count;
					}
				});		
				const apps = _.take(hosts, count);
				result = {
					length: count,
					hosts: apps.map((item: any) => {
						return {
							name: item.name,
							count: item.count
						};
					})
				};
				break;
			}
			default: break;
		}
		res.status(200).send(result);
	} else {
		res.status(200).send({});
	}
});
app.get('/api/host/:id', (req, res) => {
	const id = req.params.id;
	if (id) {
		const file = fs.readFileSync('data/hosts.json', 'utf8');
		const data = JSON.parse(file);
		const host = _.find(data.hosts, x => x.name === id);
		if (host) {
			res.status(200).send(host);
		} else {
			res.status(400).send('NOT FOUND');
		}
	} else {
		res.status(500).send('INTERNAL SERVER ERROR');
	}
});

app.get('/api/taxonomies/dashboard/:id', (req, res) => {
	const id = req.params.id;
	const result = GetDashboarData(id);
	if (result) {
		res.status(200).send(result);
	} else {
		res.status(500).send('INTERNAL SERVER ERROR');
	}
});

app.get('/api/taxonomies/detail/:parent/:child', (req, res) => {
	const parent = req.params.parent;
	const child = req.params.child;
	const result = GetTaxonomyData(parent, child);
	if (result) {
		res.status(200).send(result);
	} else {
		res.status(500).send('INTERNAL SERVER ERROR');
	}
});

// TODO: implement data requests securely
app.get('/api/*', (req, res) => {
	res.status(404).send('data requests are not supported');
});

// Server static files from /browser
app.get('*.*', express.static(join(DIST_FOLDER, 'browser')));

// All regular routes use the Universal engine
app.get('*', (req, res) => {
	res.render('index', { req });
});

// Start up the Node server
app.listen(PORT, () => {
	console.log(`Node server listening on http://localhost:${PORT}`);
});


const fileParent = 'data';
const classfiedFileParent = 'data/classified';
const dashboardFolder = 'data/classified/dashboard';

function GetDashboarData(dataCategory) {
    let file = `${dashboardFolder + '/' + 'all'}.json`;
    if (dataCategory) {
        file = `${dashboardFolder + '/' + dataCategory}.json`;
    }
    const contents: any = fs.readFileSync(file);
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
        const contents: any = fs.readFileSync(file);
        data = JSON.parse(contents);
    }
    return data;
}