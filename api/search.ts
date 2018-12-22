import * as fs from 'fs';
import * as MongoClientRequest from 'mongodb';
import * as _ from 'lodash';
const MongoClient = MongoClientRequest.MongoClient;
// const url = 'mongodb://localhost:27017';
// const dbName = 'privacy-grade-analytics';
const url = 'mongodb://admin:super-admin-1234@cmu-projects-cluster-shard-00-00-ylevo.mongodb.net:27017,cmu-projects-cluster-shard-00-01-ylevo.mongodb.net:27017,cmu-projects-cluster-shard-00-02-ylevo.mongodb.net:27017/test?ssl=true&replicaSet=CMU-PROJECTS-CLUSTER-shard-0&authSource=admin&retryWrites=true';
const dbName = 'pg-analytics';

const appsfile = "data/classified/uniqued/apps.json";
const appsfileContents: any = fs.readFileSync(appsfile);
const apps = JSON.parse(appsfileContents);
apps.data = apps.data.sort((a, b) => b.requestsCount - a.requestsCount);
apps.data = apps.data.filter(x => x.app !== 'com.android.providers.downloads,com.android.providers.downloads.ui,com.android.providers.media');

const DEFAULT_TAXONOMIES = [{ "key": "ID", "value": ["GENERALID"] }, { "key": "PHONE", "value": ["BATTERY", "DEVICE", "RUNNINGSTATE", "NOTIFICATION", "NETWORK"] }, { "key": "PERSONAL", "value": ["ACCOUNT", "CALENDAR", "CONTACTS", "SMS", "STORAGE"] }, { "key": "SENSOR", "value": ["CAMERA", "PROXIMITY", "LOCATION", "MICROPHONE", "INERTIAL"] }];

const packageTransform = {
    _id: 0,
    package: 1,
    iconUrl: 1,
    name: 1,
    privacyRating: 1,
    taxonomiesCount: 1,
    meta: 1
};

function GetQuery(skip = 0, limit = 25) {
    const aggregateQuery = [{
        $project: {
            catgeory: 1,
            rating: 1,
            desc: 1,
            rating_count: 1,
            package: 1,
            taxonomies: 1,
            requestsCount: 1,
            iconUrl: 1,
            name: 1,
            meta: 1,
            privacyRating: 1,
            taxonomiesLength: {
                $size: "$taxonomies"
            }
        }
    },
    {
        $sort: {
            taxonomiesLength: -1,
            package: 1
        }
    },
    {
        $skip: skip
    },
    {
        $limit: limit
    },
    {
        $project: {
            catgeory: 1,
            rating: 1,
            desc: 1,
            rating_count: 1,
            package: 1,
            taxonomies: 1,
            requestsCount: 1,
            iconUrl: 1,
            name: 1,
            meta: 1,
            privacyRating: 1,
        }
    }
    ];
    return aggregateQuery;
}

function GetFindOrQuery(params) {
    return {
        "meta.genreId": "SOCIAL"
    }
}


function cleanup(client) {
    client.close();
    console.log('CLIENT CLOSED');
}

export async function searchAppsQuery(client, searchQueryType, searchQueryParameters, callback) {
    const db = client.db(dbName);
    const appsCollection = db.collection('apps');
    const nodes = [];
    let cursor;
    switch (searchQueryType) {
        case 'BASIC_SEARCH': {
            cursor = appsCollection.aggregate(GetQuery(searchQueryParameters.skip, searchQueryParameters.limit));
            break;
        }
        case 'ADV_SEARCH': {
            const findParams: any = {};
            const _taxonomies = searchQueryParameters.subDataCategories;
            if (_taxonomies && _taxonomies.length > 0) {
                const tempTaxonomies = [];
                DEFAULT_TAXONOMIES.forEach(x => {
                    x.value.forEach(y => {
                        const tax = `${x.key}.${y}`;
                        if (_taxonomies.indexOf(tax) !== -1) {
                            tempTaxonomies.push(tax);
                        }
                    })
                })
                if (tempTaxonomies.length > 0) {
                    findParams.taxonomies =  { $in: tempTaxonomies };
                }
            }
            const applyProject = searchQueryParameters.applyProject || false;
            const appCategories = searchQueryParameters.appCategories;
            if (appCategories && appCategories.length > 0) {
                findParams.category = { $in: appCategories };
            }
            const privacyGradeRatings = searchQueryParameters.privacyGrades;
            if (privacyGradeRatings && privacyGradeRatings.length > 0) {
                findParams.privacyRating = { $in: privacyGradeRatings };
            }
            const metaInstalls = searchQueryParameters.metaInstalls;
            if (metaInstalls && metaInstalls.length > 0) {
                findParams['meta.installs'] = { $in: metaInstalls };
            }
            //metaFrees
            const metaFrees = searchQueryParameters.metaFrees;
            if (metaFrees && metaFrees.length > 0) {
                var mapped = metaFrees.map(x => Boolean(x));
                findParams['meta.free'] = { $in: mapped };
            }
            //metaAdSupported
            const metaAdSupported = searchQueryParameters.metaAdSupported;
            if (metaAdSupported && metaAdSupported.length > 0) {
                var mapped = metaAdSupported.map(x => Boolean(x));
                findParams['meta.adSupported'] = { $in: mapped };
            }
            if (searchQueryParameters.search) {
                findParams['$text'] =  { $search: searchQueryParameters.search };
            }
            console.log(findParams);
            cursor = appsCollection.find(findParams).skip(searchQueryParameters.skip || 0).limit(searchQueryParameters.limit || 25);
            if (applyProject) {
                cursor = cursor.project(packageTransform);
            }
            break;
        }
        case 'LIST_SEARCH': {
            cursor = appsCollection.find({
                skip: searchQueryParameters.skip,
                limit: searchQueryParameters.limit,
            }).sort();
            break;
        }
        case 'TAXONOMY_SEARCH': {
            const tempTaxonomies = [];
            const taxonomy = searchQueryParameters.id;
            if (taxonomy.indexOf('.') !== -1) {
                tempTaxonomies.push(taxonomy);
            } else {
                const tax = DEFAULT_TAXONOMIES.find(x => x.key === taxonomy);
                if (tax) {
                    tax.value.forEach(x => tempTaxonomies.push(`${tax.key}.${x}`));
                }
            }
            const applyProject = searchQueryParameters.applyProject || false;
            const category = searchQueryParameters.category;
            const findParams: any = { taxonomies: { $in: tempTaxonomies } };
            if (category) {
                findParams.category = category;
            }
            cursor = appsCollection.find(findParams).sort({ 'avgRating': -1 }).skip(searchQueryParameters.skip || 0).limit(searchQueryParameters.limit || 25);
            if (applyProject) {
                cursor = cursor.project(packageTransform);
            }
            break;
        }
    }
    let i = 0;
    for (let doc = await cursor.next(); doc != null; doc = await cursor.next()) {
        nodes.push(doc);
    }
    cleanup(client);
    callback(nodes)
}

export async function searchMetaDataQuery(client, callback) {
    const metaData = [];
    const db = client.db(dbName);
    const appsCollection = db.collection('apps');
    let privacyRatings = await appsCollection.distinct('privacyRating');
    if (privacyRatings) {
        privacyRatings = privacyRatings.sort((a, b) => {
            if (!a || !b) {
                return -1;
            } else {
                return a.localeCompare(b);
            }
        });
        metaData.push({
            id: 'privacyRating',
            name: 'Privacy Rating',
            values: [
                { key: 'A+', value: 'A+ - Best', color: '#000', percentage: 0 },
                { key: 'A', value: 'A - Excellent', color: '#000', percentage: 0 },
                { key: 'B', value: 'B - Good', color: '#000', percentage: 0 },
                { key: 'C', value: 'C - Fair', color: '#000', percentage: 0 },
                { key: 'D', value: 'D - Poor', color: '#000', percentage: 0 },
                { key: '-', value: 'Unknown', color: '#000', percentage: 0 }
            ]
        });
    }
    let categories = await appsCollection.distinct('category');
    if (categories) {
        categories = categories.sort((a, b) => {
            if (!a || !b) {
                return -1;
            } else {
                return a.localeCompare(b);
            }
        });
        metaData.push({
            id: 'category',
            name: 'App Category',
            values: categories.map( x => {
                return { value: x === '' ? 'UNKNOWN' : x, key: x};
            })
        });
    }
    let installs = await appsCollection.distinct('meta.installs');
    if (installs) {
        installs = installs.sort((a, b) => {
            if (!a || !b) {
                return -1;
            } else {
                return a.localeCompare(b);
            }
        });
        metaData.push({
            id: 'meta.installs',
            name: 'App Installs',
            values: installs.map( x => {
                return { value: x === '' ? 'UNKNOWN' : x, key: x};
            })
        });
    }
    let freeApps = await appsCollection.distinct('meta.free');
    if (freeApps) {
        metaData.push({
            id: 'meta.free',
            name: 'Free Apps',
            values: freeApps.map( x => {
                if (x === true) {
                    return { key: true, value: 'Free'}
                }
                return { value: x === '' ? 'UNKNOWN' : x, key: x};
            })
        });
    }
    let developers = await appsCollection.distinct('meta.developer');
    if (developers) {
        developers = developers.sort((a, b) => {
            if (!a || !b) {
                return -1;
            } else {
                return a.localeCompare(b);
            }
        });
        metaData.push({
            id: 'meta.developer',
            name: 'Developers',
            values: developers.map( x => {
                return { value: x === '' ? 'UNKNOWN' : x, key: x};
            })
        });
    }
    let adSupportedData = await appsCollection.distinct('meta.adSupported');
    if (adSupportedData) {
        metaData.push({
            id: 'meta.adSupported',
            name: 'Whether ads supported ?',
            values: adSupportedData.map( x => {
                if (x === true) {
                    return { key: true, value: 'Supported'}
                }
                if (x === false) {
                    return { key: true, value: 'Not Supported'}
                }
                return { value: x === '' ? 'UNKNOWN' : x, key: x};
            })
        });
    }
    cleanup(client);
    callback(metaData);
}

export async function getPrivacyRatingDistribution(client, taxonomy, callback) {
    const db = client.db(dbName);
    const appsCollection = db.collection('apps');
    const ratingDistribution = {
        'A': await appsCollection.find({ taxonomies: { $in: [taxonomy] }, privacyRating: 'A' }).count(),
        'B': await appsCollection.find({ taxonomies: { $in: [taxonomy] }, privacyRating: 'B' }).count(),
        'C': await appsCollection.find({ taxonomies: { $in: [taxonomy] }, privacyRating: 'C' }).count(),
        'D': await appsCollection.find({ taxonomies: { $in: [taxonomy] }, privacyRating: 'D' }).count(),
        'UNKNOWN': await appsCollection.find({ taxonomies: { $in: [taxonomy] }, privacyRating: '' }).count()
    };
    cleanup(client);
    callback(ratingDistribution);
}

export async function searchApp(client, packageId, callback) {
    console.log('srearch app called');
    const db = client.db(dbName);
    const appsCollection = db.collection('apps');
    const query = {
        package: packageId
    };
    let data = await appsCollection.find(query).toArray();
    cleanup(client);
    callback(data);
}

export function connectToDb (callback) {
    console.log('CLIENT CONNECTION CREATED');
    const client = new MongoClient(url);
    client.connect(function (err) {
        callback(client);
    });
}