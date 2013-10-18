'use strict';

define(
  [
    'angular',
    'modals/modals',
    'controllers/controllers',
    'services/services',
    'filters/filters',
    'directives/directives',
    'angular-resource'
  ],
  function (angular)
  {
    return angular.module('StandBy',
      [
        'modals',
        'controllers',
        'services',
        'filters',
        'directives',
        'ngResource'
      ]);
  }
);