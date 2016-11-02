'use strict';

var apiHost = 'http://10.235.65.42:8080/';
var cmsHost = 'http://10.235.65.42:3000';

module.exports = {
    apiHost: apiHost,
    cmsHost: cmsHost,
    api: {
        covers: apiHost + 'covers',
        recommends: apiHost + 'recommends',
        categorys: apiHost + 'categories',
        contents: apiHost + 'contents'
    }
};


