var _ = require('underscore'),
    utils = require('kujua-utils');

(function () {

  'use strict';

  var inboxServices = angular.module('inboxServices');
  
  inboxServices.factory('UserDistrict', ['db', 'UserCtxService',
    function(db, UserCtxService) {
      return function(callback) {
        var userCtx = UserCtxService();
        if (!userCtx.name) {
          return callback('Not logged in');
        }
        if (utils.isUserAdmin(userCtx)) {
          return callback();
        }
        if (utils.isUserDistrictAdmin(userCtx)) {
          return utils.checkDistrictConstraint(userCtx, db, callback);
        }
        callback('The administrator needs to give you additional privileges to use this site.');
      };
    }
  ]);

  var getUserResourceUrl = function(userCtx) {
    return '/_users/org.couchdb.user%3A' + userCtx.name;
  };

  inboxServices.factory('User', ['$http', 'UserCtxService',
    function($http, UserCtxService) {
      return function(callback) {
        $http.get(getUserResourceUrl(UserCtxService()), { cache:true })
          .success(function(data) {
            callback(null, data);
          })
          .error(function(data, status) {
            callback('Error getting user: ' + status);
          });
      };
    }
  ]);

  inboxServices.factory('UpdateUser', ['$cacheFactory', 'db', 'User', 'UserCtxService',
    function($cacheFactory, db, User, UserCtxService) {
      return function(updates, callback) {
        User(function(err, user) {
          if (err) {
            return callback(err);
          }
          var updated = _.extend(user, updates);
          db.use('_users').saveDoc(updated, function(err) {
            var cachename = getUserResourceUrl(UserCtxService());
            $cacheFactory.get('$http').remove(cachename);
            callback(err, updated);
          });
        });
      };
    }
  ]);

  inboxServices.factory('Language', ['$q', 'User', 'Settings',
    function($q, User, Settings) {
      return function() {
        var deferred = $q.defer();
        User(function(err, res) {
          if (err) {
            return deferred.reject(err);
          }
          if (res && res.language) {
            deferred.resolve(res.language);
          } else {
            Settings(function(err, res) {
              if (err) {
                return deferred.reject(err);
              }
              deferred.resolve(res.locale || 'en');
            });
          }
        });
        return deferred.promise;
      };
    }
  ]);

}());