if (window.location.port === '8080')
{
  document.getElementsByTagName('html')[0].setAttribute('ng-app');
}

require.config(
  {
    paths:
    {
      angular:            '../vendors/angular/angular.min',
      jquery:             '../vendors/jquery/jquery.min',
      domReady:           '../vendors/requirejs-domready/domReady',
      bootstrap:          '../vendors/bootstrap-sass/dist/js/bootstrap.min',
      'angular-resource': '../vendors/angular-resource/angular-resource.min'
    },
    shim:
    {
      angular:
      {
        deps:     ['jquery'],
        exports:  'angular'
      },
      'angular-resource':
      {
        deps:     ['angular']
      },
      bootstrap:
      {
        deps:     ['jquery'],
        exports:  'bootstrap'
      }
    }
  }
);

require(
  [
    'angular',
    'domReady',

    'angular-resource',

    'config',
    'app',
    'routes',
    'run',

//    'modals/user',
//    'modals/core',

//    'controllers/login',
//    'controllers/forgotPass',
//    'controllers/register',
//    'controllers/logout',
//    'controllers/core',
//    'controllers/purchaser',
//    'controllers/manager',
//    'controllers/notifier',
//    'controllers/reporter',
//    'controllers/guarder',
//    'controllers/profile',

//    'directives/appVersion',

//    'filters/interpolate',
//    'filters/all',

//    'services/version',
//    'services/user',

//    'services/session',
//    'services/md5',
//    'services/storage',
//    'services/strings',
//    'services/generators',

    'bootstrap'
  ],
  function (angular, domReady)
  {
    'use strict';

    domReady(function ()
      {
        angular.bootstrap(document, ['StandBy']);
      }
    );

  }
);