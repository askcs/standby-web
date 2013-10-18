define(
  ['app'],
  function (app)
  {
    'use strict';

    app.config(
      [
        '$locationProvider', '$routeProvider', '$httpProvider',
        function ($locationProvider, $routeProvider, $httpProvider)
        {
          $routeProvider
            .when('/login',
            {
              templateUrl: 'dist/views/login.html',
              controller: 'login'
            })
            .when('/logout',
            {
              templateUrl: 'dist/views/logout.html',
              controller: 'logout'
            })
            .when('/dashboard',
            {
              templateUrl: 'dist/views/dashboard.html',
              controller: 'dashboard'
            })
            .when('/planboard',
            {
              templateUrl: 'dist/views/planboard.html',
              controller: 'planboard',
              resolve: {
                data:
                  [
                    '$route', 'Slots', 'Storage', 'Dater',
                    function ($route, Slots, Storage, Dater)
                    {
                      var periods  = Storage.local.periods();
                      var settings = Storage.local.settings();

                      return  Slots.all({
                        groupId:  settings.app.group,
                        stamps: {
                          start:  periods.days[Dater.current.today()].last.timeStamp,
                          end:    periods.days[Dater.current.today() + 7].last.timeStamp
                        },
                        month: Dater.current.month(),
                        layouts: {
                          user:     true,
                          group:    true,
                          members:  false
                        }
                      });
                    }
                  ]
              },
              reloadOnSearch: false
            })
            .when('/messages',
            {
              templateUrl: 'dist/views/messages.html',
              controller: 'messages',
              resolve: {
                data: [
                  '$route', 'Messages',
                  function ($route, Messages)
                  {
                    return Messages.query();
                  }
                ]
              },
              reloadOnSearch: false
            })
            .when('/groups',
            {
              templateUrl: 'dist/views/groups.html',
              controller: 'groups',
              resolve: {
                data: [
                  'Groups',
                  function (Groups)
                  {
                    return Groups.query();
                  }
                ]
              },
              reloadOnSearch: false
            })
            .when('/profile/:userId',
            {
              templateUrl: 'dist/views/profile.html',
              controller: 'profile',
              resolve: {
                data: [
                  '$rootScope', 'Profile', '$route', '$location',
                  function ($rootScope, Profile, $route, $location)
                  {
                    if ($route.current.params.userId.toLowerCase() != $rootScope.app.resources.uuid)
                    {
                      // IE route fix
                      var onejan = new Date(new Date().getFullYear(),0,1);

                      // var periods = Dater.getPeriods(),
                      var periods = angular.fromJson(localStorage.getItem('WebPaige.periods')),
                      // current = Dater.current.week(),
                      // current = new Date().getWeek(),
                        current = Math.ceil((((new Date() - onejan) / 86400000) + onejan.getDay()+1)/7);

                      var ranges  = {
                        start:  periods.weeks[current].first.timeStamp / 1000,
                        end:    periods.weeks[current].last.timeStamp / 1000
                      };

                      return Profile.getWithSlots($route.current.params.userId.toLowerCase(), false, ranges);
                    }
                    else
                    {
                      return Profile.get($route.current.params.userId.toLowerCase(), false);
                    }
                  }
                ]
              },
              reloadOnSearch: false
            })
            .when('/profile',
            {
              templateUrl: 'dist/views/profile.html',
              controller: 'profile',
              resolve: {
                data: [
                  '$rootScope', '$route', '$location',
                  function ($rootScope, $route, $location)
                  {
                    if (!$route.current.params.userId || !$location.hash())
                      $location.path('/profile/' + $rootScope.app.resources.uuid).hash('profile');
                  }
                ]
              }
            })
            .when('/settings',
            {
              templateUrl: 'dist/views/settings.html',
              controller: 'settings',
              resolve: {
                data: [
                  'Settings',
                  function (Settings)
                  {
                    return angular.fromJson(Settings.get());
                  }
                ]
              }
            })
            .when('/help',
            {
              templateUrl: 'dist/views/help.html',
              controller: 'help'
            })
            .otherwise({
              redirectTo: '/login'
            });

          $httpProvider.responseInterceptors.push('Interceptor');

        }
      ]
    );
  }
);