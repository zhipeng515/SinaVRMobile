'use strict';

import React from 'react';
import Config from './Config';
import _ from 'lodash';

import {
    AsyncStorage
} from 'react-native';

var KEY_COVER = '@Cover';
var KEY_CATEGORY_LIST = '@CategoryList:';
var KEY_VIDEO_LIST = '@VideoList:';
var KEY_RECOMMEND_LIST = '@RecommendList:';

export default function DataRepository() { // Singleton pattern
    if (typeof DataRepository.instance === 'object') {
        return DataRepository.instance;
    }

    DataRepository.instance = this;
}

DataRepository.prototype._safeStorage = function (key: string) {
    return new Promise((resolve, reject) => {
        AsyncStorage.getItem(key, (error, result) => {
            var retData = JSON.parse(result);
            if (error) {
                console.error(error);
                resolve(null);
            } else {
                resolve(retData);
            }
        });
    });
};

DataRepository.prototype._safeFetch = function (reqUrl: string, method ? : string, body ? : object
)
{
    console.log('reqUrl', reqUrl);
    return new Promise((resolve, reject) => {
        fetch(reqUrl, {
            method: method || 'GET',
            body: body || ''
        }).then((response) => response.json()).then((responseData) => {
            //console.log(responseData);
            resolve(responseData);
        }).catch((error) => {
            console.error(error);
            resolve(null);
        });
    });
}
;

DataRepository.prototype.getCover = function () {
    return this._safeStorage(KEY_COVER);
};

DataRepository.prototype.updateCover = function () {
    fetch(Config.api.covers)
        .then((response) => response.json())
        .then((responseData) => {
            AsyncStorage.setItem(KEY_COVER, JSON.stringify(responseData));
        })
        .catch((error) => {
            console.error(error);
        })
        .done();
}

DataRepository.prototype.fetchVideos = function (categoryId ? : String, lastId ? : String,
    callback ? : ? (error: ?Error, result: ?Object) => void
)
{
    var reqUrl = Config.api.contents + '?categorie=' + categoryId  + (lastId ? '&lastId=' + lastId : '');
    var networking = this._safeFetch(reqUrl);
    var isRefresh = !lastId;
    var localStorage = isRefresh ? this._safeStorage(KEY_VIDEO_LIST + categoryId) : null;

    var merged = new Promise((resolve, reject) => {
        Promise.all([localStorage, networking])
            .then((values) => {
                var error, result;
                result = this._mergeReadState(values[0], values[1]);
                if (!result) {
                    error = new Error('Load video error');
                }
                callback && callback(error, result);
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            });
    });
    return merged;
};

DataRepository.prototype.fetchRecommends = function (categoryId ? : String,
    callback ? : ? (error: ?Error, result: ?Object) => void
)
{
    var reqUrl = Config.api.recommends + categoryId
    var merged = new Promise((resolve, reject) => {
        this._safeFetch(reqUrl)
            .then((result) => {
                var error;
                if (!result) {
                    error = new Error('Load video error');
                }
                callback && callback(error, result);
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            });
    });
    return merged;
};

DataRepository.prototype.getCategory = function (callback ? : ? (error: ?Error, result: ?Object) => void)
{
    var reqUrl = Config.api.categorys;
    var networking = this._safeFetch(reqUrl);
    var localStorage = this._safeStorage(KEY_CATEGORY_LIST);

    var merged = new Promise((resolve, reject) => {
        Promise.all([localStorage, networking])
            .then((values) => {
                var error, result;
                result = this._mergeCategory(values[0], values[1]);
                if (!result) {
                    error = new Error('Load category error');
                }
                callback && callback(error, result);
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            });
    });

    return merged;
};

DataRepository.prototype.saveVideos = function (categoryId: string, videoList: object,
                                                callback ? : ? (error: ?Error, result: ?Object) => void
)
{
    var keyValuePairs = [];
    keyValuePairs.push([KEY_VIDEO_LIST + categoryId, JSON.stringify(videoList)]);
    AsyncStorage.multiSet(keyValuePairs, callback);
}
;

DataRepository.prototype._mergeReadState = function (src, dst) {

    if (!src) {
        return dst;
    }

    if (!dst) {
        return src;
    }

    var reads = {};
    var video;
    for (var i = src.length - 1; i >= 0; i--) {
        video = src[i];
        reads[video._id] = video.read;
    }

    for (var i = dst.length - 1; i >= 0; i--) {
        video = dst[i];
        if (reads[video.id]) {
            video.read = true;
        }
    }

    return dst;
};

DataRepository.prototype._mergeCategory = function (src, dst) {

    if (!src) {
        return dst;
    }

    if (!dst) {
        return src;
    }

    return _.union(src, dst);
};