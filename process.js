const glob = require('glob');
const fs = require('fs');
const jsonfile = require('jsonfile');
const chalk = require('chalk');
const log = console.log;
const _ = require('lodash');
const ignoreList = [
    'package-lock.json',
    'node_modules',
    'data',
    'data/**.json',
    'node_modules/**/*.json',
    'data/filenames.json',
    'resources/facebook_login.json'
];
const runTasks = {
    'TASK_1': false,
    'TASK_2': false,
    'TASK_3': false
};
const fileParent = 'data';
const classfiedFileParent = 'data/classified';
const dashboardFolder = 'data/classified/dashboard';
const taxonomySpecFolder = 'data/classified/taxonomies_based';

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

function GetDashboardStatisticsData() {
    let data = [];
    let file = `${dashboardFolder + '/' + 'all'}.json`;
    const contents = fs.readFileSync(file);
    const fileData = JSON.parse(contents);
    const items = [];
    fileData.data.forEach(taxonomy => {
        items.push(...taxonomy.taxonomies);
    });
    /* Network vs Location */
    const locationData = items.find(x => x.name === 'LOCATION');
    const networkData = items.find(x => x.name === 'NETWORK');
    data.push({
        id: 'network-location-comparison',
        label: 'NETWORK vs LOCATION',
        type: 'COMPARISON',
        data: [
            { key: 'NETWORK', value: networkData.appsCount },
            { key: 'LOCATION', value: locationData.appsCount }
        ]
    });
    /* Network vs Location */
    const accountData = items.find(x => x.name === 'ACCOUNT');
    const contactData = items.find(x => x.name === 'CONTACTS');
    data.push({
        id: 'account-contacts-comparison',
        label: 'ACCOUNT vs CONTACTS',
        type: 'COMPARISON',
        data: [
            { key: 'ACCOUNT', value: accountData.appsCount },
            { key: 'CONTACTS', value: contactData.appsCount }
        ]
    });
    /* Microphone vs Battery */
    const microphoneData = items.find(x => x.name === 'MICROPHONE');
    const batteryData = items.find(x => x.name === 'BATTERY');
    data.push({
        id: 'microphone-contacts-comparison',
        label: 'MICROPHONE vs BATTERY',
        type: 'COMPARISON',
        data: [
            { key: 'MICROPHONE', value: microphoneData.appsCount },
            { key: 'BATTERY', value: batteryData.appsCount }
        ]
    });
    /* Device */
    const deviceData = items.find(x => x.name === 'DEVICE');
    data.push({
        id: 'device-number',
        label: 'DEVICE',
        type: 'NUMBER',
        data: [
            { key: 'Apps', value: deviceData.appsCount },
            { key: 'Requests', value: deviceData.requestsCount }
        ]
    });
    /* Calendar */
    const calendarFile = `${taxonomySpecFolder}/PERSONAL.CALENDAR.json`
    const calendarFileContents = fs.readFileSync(calendarFile);
    const calendarFileData = JSON.parse(calendarFileContents);
    data.push({
        id: 'calendar-list',
        label: 'Calendar',
        type: 'LIST',
        data: calendarFileData.uniqueApps.data
    });
    /* Apps With Most Taxonomies */
    const appsFile = `${classfiedFileParent}/uniqued/apps.json`;
    const appsFileContents = fs.readFileSync(appsFile);
    const appsFileData = JSON.parse(appsFileContents);
    let uniqueApps = appsFileData.data;
    uniqueApps = uniqueApps.sort((x,y) => y.taxonomies.length - x.taxonomies.length);
    const topApp = _.take(uniqueApps, 1)[0]; 
    data.push({
        id: 'apps-with-most-permissions',
        label: 'App with most permissions',
        type: 'App',
        data: topApp
    });
    return data;
}

const result = GetDashboardStatisticsData();
console.log(JSON.stringify(result));

function GetFileName(file) {
    const splits = file.split('/');
    if (splits.length > 0) {
        return splits[splits.length - 1];
    }
    return '';
}

function RemoveJSON(fileName) {
    if (fileName.indexOf('.json') !== -1) {
        const splits = fileName.split('.');
        if (splits.length > 0) {
            splits.pop();
        }
        return splits.join('.');
    }
    return fileName;
}