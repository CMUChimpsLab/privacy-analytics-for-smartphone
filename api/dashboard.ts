import * as fs from 'fs';
import * as MongoClientRequest from 'mongodb';
import * as _ from 'lodash';
const MongoClient = MongoClientRequest.MongoClient;
// const url = 'mongodb://localhost:27017';
// const dbName = 'privacy-grade-analytics';
const url = 'mongodb://admin:super-admin-1234@cmu-projects-cluster-shard-00-00-ylevo.mongodb.net:27017,cmu-projects-cluster-shard-00-01-ylevo.mongodb.net:27017,cmu-projects-cluster-shard-00-02-ylevo.mongodb.net:27017/test?ssl=true&replicaSet=CMU-PROJECTS-CLUSTER-shard-0&authSource=admin&retryWrites=true';
const dbName = 'pg-analytics';


// const appsfile = "data/classified/uniqued/apps.json";
// const appsfileContents: any = fs.readFileSync(appsfile);
// const apps = JSON.parse(appsfileContents);
// apps.data = apps.data.sort((a, b) => b.requestsCount - a.requestsCount);
// apps.data = apps.data.filter(x => x.app !== 'com.android.providers.downloads,com.android.providers.downloads.ui,com.android.providers.media');

// Array.prototype.forEachAsync = async function (fn) {
//     for (let t of this) { await fn(t) }
// }

const DEFAULT_TAXONOMIES = [{ "key": "ID", "value": ["GENERALID"] }, { "key": "PHONE", "value": ["BATTERY", "DEVICE", "RUNNINGSTATE", "NOTIFICATION", "NETWORK"] }, { "key": "PERSONAL", "value": ["ACCOUNT", "CALENDAR", "CONTACTS", "SMS", "STORAGE"] }, { "key": "SENSOR", "value": ["CAMERA", "PROXIMITY", "LOCATION", "MICROPHONE", "INERTIAL"] }];

const ratings = [
    { key: 'A+', value: 'A+' },
    { key: 'A', value: 'A' },
    { key: 'B', value: 'B' },
    { key: 'C', value: 'C' },
    { key: 'D', value: 'D' },
    { key: 'UNKNOWN', value: '' }
];


function cleanup(client) {
    client.close();
    console.log('CLIENT CLOSED');
}

const packageTransform: any = {
    _id: 0,
    package: 1,
    iconUrl: 1,
    name: 1,
    privacyRating: 1,
    avgRating: 1,
    meta: 1,
    desc: 1
};

export async function GetDashboardData(client, taxonomy, callback) {
    const db = client.db(dbName);
    const appsCollection = db.collection('apps');
    const ratingDistribution = [];
    const tempTaxonomies = [];
    const tax = DEFAULT_TAXONOMIES.find(x => x.key === taxonomy);
    if (tax) {
        tax.value.forEach(x => tempTaxonomies.push(`${tax.key}.${x}`));
    }
    for (const rating of ratings) {
        appsCollection.find({ taxonomies: { $in: tempTaxonomies }, privacyRating: rating.value }).count().then((data) => {
            console.log(data);
        }, (data) => {
            console.log(data);
        })
        ratingDistribution.push({
            key: rating.key,
            value: await appsCollection.find({ taxonomies: { $in: tempTaxonomies }, privacyRating: rating.value }).count()
        });
    }
    const categories = await appsCollection.distinct('category');
    categories.push('UNKNOWN');
    const categoryDistribution = [];
    for (const category of categories) {
        const value = category === 'UNKNOWN' ? '' : category;
        categoryDistribution.push({
            key: category,
            value: await appsCollection.find({ taxonomies: { $in: tempTaxonomies }, category: value }).count()
        });
    }
    const topInstalledApps = await appsCollection.find({
        taxonomies: {
            $in: tempTaxonomies
        },
        meta: {
            $ne: null
        }
    }).sort({ 'meta.minInstalls': -1 }).project(packageTransform).limit(12).toArray();
    if (topInstalledApps.length > 0) {
        topInstalledApps.forEach(x => {
            x.installs = x.meta.installs;
            if (x.meta && x.meta.summary) {
                x.summary = x.meta.summary;
            } else {
                x.summary = x.desc;
            }
            delete x.meta;
        });
    }
    const topRatedApps = await appsCollection.find({
        taxonomies: {
            $in: tempTaxonomies
        }
    }).sort({ 'avgRating': -1 }).project(packageTransform).limit(12).toArray();
    if (topRatedApps.length > 0) {
        topRatedApps.forEach(x => {
            x.installs = x.meta.installs;
            if (x.meta && x.meta.summary) {
                x.summary = x.meta.summary;
            } else {
                x.summary = x.desc;
            }
            delete x.meta;
        });
    }
    const distribution = [];
    const combinations = [];
    if (tax.value.length > 1) {
        const childTaxonomies = tax.value;
        for (let i = 0; i < childTaxonomies.length; i++) {
            const first = childTaxonomies[i];
            const item = {
                key: first,
                value: await appsCollection.find({ taxonomies: { $in: [`${tax.key}.${first}`] } }).count()
            };
            if (item.value > 0) {
                distribution.push(item);
            }
            for (let j = 0; j < childTaxonomies.length; j++) {
                if (i < j) {
                    const second = childTaxonomies[j];
                    const obj = [
                        {
                            key: first,
                            value: await appsCollection.find({ taxonomies: { $in: [`${tax.key}.${first}`] } }).count()
                        },
                        {
                            key: second,
                            value: await appsCollection.find({ taxonomies: { $in: [`${tax.key}.${second}`] } }).count()
                        }
                    ];
                    if (obj[0].value > 0 && obj[1].value > 0) {
                        combinations.push(obj);
                    }
                }
            }
        }
    }
    cleanup(client);
    callback({
        ratingDistribution: ratingDistribution,
        categoryDistribution: categoryDistribution,
        topInstalledApps: topInstalledApps,
        topRatedApps: topRatedApps,
        combinations: combinations,
        distribution: distribution
    });
}