
require('./services/index');
require('./controllers/inbox');
require('./filters/index');
require('../dist/reporting-views');

(function () {

  'use strict';

  var app = angular.module('inboxApp', [
    'ngRoute',
    'ngAnimate',
    'ui.router',
    'inboxFilters',
    'inboxControllers',
    'inboxServices',
    'pascalprecht.translate',
    'nvd3ChartDirectives'
  ]);

  app.config(['$stateProvider', '$urlRouterProvider', '$translateProvider',
    function($stateProvider, $urlRouterProvider, $translateProvider) {

      $stateProvider
        // messages
        .state('messages', {
          url: '/messages?tour',
          controller: 'MessagesCtrl',
          templateUrl: '/partials/messages.html'
        })
        .state('messages.detail', {
          url: '/:id',
          views: {
            content: {
              controller: 'MessagesContentCtrl',
              templateUrl: '/partials/messages_content.html'
            }
          }
        })

        // reports
        .state('reports', {
          url: '/reports?tour&query',
          controller: 'ReportsCtrl',
          templateUrl: '/partials/reports.html'
        })
        .state('reports.detail', {
          url: '/:id',
          views: {
            content: {
              controller: 'ReportsContentCtrl',
              templateUrl: '/partials/reports_content.html'
            }
          }
        })

        // analytics
        .state('analytics', {
          url: '/analytics/:module?tour',
          controller: 'AnalyticsCtrl',
          templateUrl: '/partials/analytics.html'
        })

        // configuration
        .state('configuration', {
          url: '/configuration',
          controller: 'ConfigurationCtrl',
          templateUrl: '/partials/configuration.html'
        })
        .state('configuration.settings', {
          url: '/settings',
          views: {
            content: {
              templateUrl: '/partials/configuration_settings.html'
            }
          }
        })
        .state('configuration.settings.basic', {
          url: '/basic',
          views: {
            tab: {
              controller: 'ConfigurationSettingsBasicCtrl',
              templateUrl: '/partials/configuration_settings_basic.html'
            }
          }
        })
        .state('configuration.settings.advanced', {
          url: '/advanced',
          views: {
            tab: {
              controller: 'ConfigurationSettingsAdvancedCtrl',
              templateUrl: '/partials/configuration_settings_advanced.html'
            }
          }
        })
        .state('configuration.translation', {
          url: '/translation',
          views: {
            content: {
              templateUrl: '/partials/configuration_translation.html'
            }
          }
        })
        .state('configuration.translation.languages', {
          url: '/languages',
          views: {
            tab: {
              controller: 'ConfigurationTranslationLanguagesCtrl',
              templateUrl: '/partials/configuration_translation_languages.html'
            }
          }
        })
        .state('configuration.translation.application', {
          url: '/application',
          views: {
            tab: {
              controller: 'ConfigurationTranslationApplicationCtrl',
              templateUrl: '/partials/configuration_translation_application.html'
            }
          }
        });

      $urlRouterProvider.when('', '/messages');
      $translateProvider.useLoader('SettingsLoader', {});

    }
  ]);

  app.factory('SettingsLoader', ['$q', 'Settings', function ($q, Settings) {
    return function (options) {

      var deferred = $q.defer();

      Settings(function(err, res) {
        if (err) {
          return deferred.reject(err);
        }

        options.key = options.key || res.locale || 'en';

        var test = false;
        if (options.key === 'test') {
          options.key = 'en';
          test = true;
        }

        var data = {};
        if (res.translations) {
          res.translations.forEach(function(translation) {
            var key = translation.key;
            var value = translation.default || key;
            translation.translations.forEach(function(val) {
              if (val.locale === options.key) {
                value = val.content;
              }
            });
            if (test) {
              value = '-' + value + '-';
            }
            data[key] = value;
          });
        }
        deferred.resolve(data);
      });
      
      return deferred.promise;
    };
  }]);
  
}());

