export let ALL_DETAILS = [
    {
        name: 'ID', 
        label: 'ID',
        icon: 'android', taxonomies: [
            {
                name: 'GENERALID',
                label: 'General ID',
                icon: 'phone',
                purposes: [
                    'User/device tracking for advertising',
                    'User/device tracking for data analytics',
                    'Signed-out user personalization',
                    'Anti-fraud (e.g. enforcing free content limits, identifying bots, etc.)',
                    'Authentication (e.g. cookie)'
                ],
                description: 'Refers to MAC address for phone, imei number etc.'
            }
        ],
        description: 'IMEI number, software version etc. '
    },
    {
        name: 'PHONE',
        label: 'Phone',
        description: 'battery status, screen size, WiFi etc.',
        icon: 'phone', taxonomies: [
            {
                name: 'BATTERY',
                label: 'Battery',
                icon: 'battery_full',
                purposes: [
                    'Battery-based event trigger (charging, low battery)',
                    'Power management',
                    'Data collection for analytics '
                ],
                description: 'Refers to current battery percentages or charging status'
            },
            {
                name: 'DEVICE',
                label: 'Device',
                icon: 'smartphone',
                purposes: [
                    'Interface customization',
                    'Data collection for advertising personalization',
                    'Data collection for analytics '
                ],
                description: 'Data may include phone model, screen size, manufacturer info etc.'
            },
            {
                name: 'RUNNINGSTATE',
                label: 'Running State',
                icon: 'phone',
                purposes: [
                    'Cross-app communication',
                    'Task management'
                ]
            },
            {
                name: 'NOTIFICATION',
                label: 'Notification',
                icon: 'notifications',
                purposes: [
                    'Notification interface personalization (e.g. lock screen)',
                    'Interruption management'
                ],
                description: 'Refers to data about specific notifications and notification history before it is cleared'
            },
            {
                name: 'NETWORK',
                label: 'Network',
                icon: 'network_wifi',
                purposes: [
                    'Network switch notification',
                    'Network optimization (e.g. image resolution adjustment)',
                    'Geo localization',
                    'Data collection for advertising personalization',
                    'Data collection for analytics'
                ],
                description: 'Data may include current network conncectivity details like WiFi, LTE, 3G, 4G or if there is no connection'
            }
        ]
    },
    {
        name: 'PERSONAL',
        label: 'Personal',
        description: 'contact names, emails and other calendar info',
        icon: 'person', taxonomies: [
            {
                name: 'ACCOUNT',
                label: 'Account',
                icon: 'account_circle',
                purposes: [
                    'Third-party login', 'Data collection for analytics',
                    'Data collection for advertising personalization'
                ],
                description:'Refers to phone account settings that are used by th phone to sync data from different services'
            },
            {
                name: 'CALENDAR',
                label: 'Calendar',
                icon: 'calendar_today',
                purposes: [
                    'Context prediction',
                    'Schedule',
                    'Alarm'
                ],
                description: 'Refers to calendar and time-related information and events from the phone'
            },
            {
                name: 'CONTACTS',
                label: 'Contacts',
                icon: 'contacts',
                purposes: [
                    'Backup and synchronization',
                    'Contact management',
                    'Blacklist, Fake calls and SMS',
                    'Call, SMS and Email',
                    'Contact-based customization',
                    'Find friends',
                    'Record'
                ],
                description: 'Data refers to name, phone number, email address etc. often requested by Social apps'
            },
            {
                name: 'SMS',
                label: 'Messaging',
                icon: 'textsms',
                purposes: [
                    'Send message',
                    'Organize message (clustering, delete, re-rank)',
                    'Extract message content',
                    'Block message',
                    'Schedule message',
                    'Backup/syncrhonize message'
                ],
                description: 'Refers to data used for writing/reading users\' text messaging history'
            },
            {
                name: 'STORAGE',
                label: 'Storage',
                icon: 'sd_storage',
                purposes: [
                    'Access photo album (uploading/editing)',
                    'Download',
                    'Persistent storage'
                ],
                description: 'Rerfers to information needed to read/write the files on the storage, including, but not limit to photos, data files, chat history, download folders.'
            }
        ]
    },
    {
        name: 'SENSOR',
        label: 'Sensor',
        description: 'Like GPS coordinates, camera settings etc.',
        icon: 'ac_unit', taxonomies: [
            {
                name: 'CAMERA',
                label: 'Camera',
                icon: 'photo_camera',
                purposes: [
                    'Flashlight',
                    'Video streaming',
                    'Code scanning',
                    'Document scanning',
                    'Augment reality',
                    'Text recognition',
                    'Photo taking'
                ],
                description: 'Hardware data may include about current camera settings for apps and websites usually managing and working with photos'
            },
            {
                name: 'PROXIMITY',
                label: 'Proximity',
                icon: 'tap_and_play',
                purposes: [
                    'Speaker/display activation'
                ],
                description: 'Data includes Proximity sensor info used to detect distance between phone and different body parts'
            },
            {
                name: 'LOCATION',
                label: 'Location',
                icon: 'location_on',
                purposes: [
                    'Search Nearby Places',
                    'Location-based Customization',
                    'Transportation Information',
                    'Recording',
                    'Map and Navigation',
                    'Geosocial Networking',
                    'Geotagging, Reverse geocoding',
                    'Location Spoofing',
                    'Alert and Remind',
                ],
                description: 'Refers to location related GPS data from the phone and other Geospatial data present in the phone'
            },
            {
                name: 'MICROPHONE',
                label: 'Microphone',
                icon: 'mic',
                purposes: [
                    'Voice Authentication',
                    'Audio streaming',
                    'Voice control',
                    'Speech recognition',
                    'Audio recording (e.g. voice message)',
                    'Acoustic event detection',
                    'Acoustic wireless communication',
                    'Music'
                ],
                description: 'Relates to the audio collected from the phone from audio and video recording or voice commands etc.'
            },
            {
                name: 'INERTIAL',
                label: 'Inertial',
                icon: 'blur_linear',
                purposes: [],
                description: 'Data from sensors such as the gyroscope, accelerometer etc. used in game apps and navigation apps'
            }
        ]
    }
    // ,
    // {
    //     name: 'NONPRIVACY', icon: 'https', taxonomies: [
    //         {
    //             name: 'NONPRIVACY',
    //             icon: 'lock_open',
    //             purposes: []
    //         }
    //     ]
    // }
];