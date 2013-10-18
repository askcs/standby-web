define(
  ['controllers/controllers'],
  function (controllers)
  {
    'use strict';

    controllers.controller ('dashboard',
      [
        '$scope', '$rootScope', '$q', '$window', '$location', 'Dashboard', 'Slots', 'Dater', 'Storage', 'Settings', 'Profile', 'Groups',
        function ($scope, $rootScope, $q, $window, $location, Dashboard, Slots, Dater, Storage, Settings, Profile, Groups)
        {
          /**
           * Fix styles
           */
          $rootScope.fixStyles();


          /**
           * Defaults for loaders
           */
          $scope.loading = {
            pies:   true,
            alerts: true
          };


          /**
           * Defaults for toggle
           */
          $scope.more = {
            status: false,
            text:   $rootScope.ui.dashboard.showMore
          };


          /**
           * Default values for synced pointer values
           */
          $scope.synced = {
            alarms: new Date().getTime(),
            pies: 	new Date().getTime()
          };


          /**
           * TODO: Check somewhere that user-settings widget-groups are synced with the
           * real groups list and if a group is missing in settings-groups add by default!
           */
          var groups    = Storage.local.groups(),
            selection = {};

          angular.forEach(Storage.local.settings().app.widgets.groups, function (value, group)
          {
            selection[group] = value;
          });

          $scope.popover = {
            groups:     groups,
            selection:  selection,
            divisions:  !!($rootScope.config.timeline.config.divisions.length > 0)
          };

          $scope.checkAnyPies = function ()
          {
            var ret = true;

            $scope.loading.pies = false;

            angular.forEach(Storage.local.settings().app.widgets.groups, function (group)
            {
              if (group.status === true)
              {
                ret = false;
              }
            });

            return ret;
          };


          $scope.loadingPies = true;


          /**
           * Get group overviews
           */
          function getOverviews ()
          {
            $scope.loadingPies = true;

            if (!$scope.checkAnyPies())
            {
              Dashboard.pies()
                .then(function (pies)
                {
                  $scope.loadingPies = false;

                  if (pies.error)
                  {
                    $rootScope.notifier.error($rootScope.ui.errors.dashboard.getOverviews);
                    console.warn('error ->', pies.error);
                  }
                  else
                  {
                    $scope.shortageHolders = {};

                    $scope.loading.pies = false;

                    $scope.periods = {
                      start:  pies[0].weeks.current.start.date,
                      end:    pies[0].weeks.next.end.date
                    };

                    angular.forEach(pies, function (pie)
                    {
                      if (pie.weeks.current.state.diff === null) pie.weeks.current.state.diff = 0;
                      if (pie.weeks.current.state.wish === null) pie.weeks.current.state.wish = 0;

                      if (pie.weeks.current.state.diff > 0)
                      {
                        pie.weeks.current.state.cls = 'more';
                      }
                      else if (pie.weeks.current.state.diff === 0)
                      {
                        pie.weeks.current.state.cls = 'even';
                      }
                      else if (pie.weeks.current.state.diff < 0)
                      {
                        pie.weeks.current.state.cls = 'less';
                      }

                      pie.weeks.current.state.start = (pie.weeks.current.state.start !== undefined) ?
                        new Date(pie.weeks.current.state.start * 1000)
                          .toString($rootScope.config.formats.datetime) :
                        'undefined';

                      pie.weeks.current.state.end   = (pie.weeks.current.state.end !== undefined) ?
                        new Date(pie.weeks.current.state.end * 1000)
                          .toString($rootScope.config.formats.datetime) :
                        'undefined';

                      pie.shortages = {
                        current:  pie.weeks.current.shortages,
                        next:     pie.weeks.next.shortages,
                        total:    pie.weeks.current.shortages.length + pie.weeks.next.shortages.length
                      };

                      pie.state = pie.weeks.current.state;

                      delete(pie.weeks.current.shortages);
                      delete(pie.weeks.current.state);

                      $scope.shortageHolders['shortages-' + pie.id] = false;
                    });


                    // angular.forEach(pies, function (pie, index)
                    // {
                    // 	console.log('pie ->', pie);

                    // 	angular.forEach(pie.shortages.current, function (slot, index)
                    // 	{
                    // 		if (typeof slot.start == 'string') slot.start = Date.parse(slot.start, "dd-MM-yyyy HH:mm").getTime() / 1000;

                    // 		if (typeof slot.end == 'string') slot.end = Date.parse(slot.end, "dd-MM-yyyy HH:mm").getTime() / 1000;
                    // 	});

                    // 	angular.forEach(pie.shortages.next, function (slot, index)
                    // 	{
                    // 		if (typeof slot.start == 'string') slot.start = Date.parse(slot.start, "dd-MM-yyyy HH:mm").getTime() / 1000;

                    // 		if (typeof slot.end == 'string') slot.end = Date.parse(slot.end, "dd-MM-yyyy HH:mm").getTime() / 1000;
                    // 	});
                    // });

                    $scope.pies = pies;
                  }
                })
                .then( function ()
                {

                  angular.forEach($scope.pies, function (pie)
                  {
                    pieMaker('weeklyPieCurrent-', pie.id + '-' + pie.division, pie.weeks.current.ratios);
                    pieMaker('weeklyPieNext-', pie.id + '-' + pie.division, pie.weeks.next.ratios);
                  });

                  function pieMaker ($id, id, _ratios)
                  {
                    setTimeout( function ()
                    {
                      if ($.browser.msie && $.browser.version == '8.0')
                      {
                        $('#' + $id + id).html('');
                      }
                      else
                      {
                        if (document.getElementById($id + id))
                        {
                          document.getElementById($id + id).innerHTML = '';
                        }
                      }

                      var ratios    = [],
                        colorMap  = {
                          more: '#415e6b',
                          even: '#ba6a24',
                          less: '#a0a0a0'
                        },
                        colors    = [],
                        xratios   = [];

                      angular.forEach(_ratios, function (ratio, index)
                      {
                        if (ratio !== 0)
                        {
                          ratios.push({
                            ratio: ratio,
                            color: colorMap[index]
                          });
                        }
                      });

                      ratios = ratios.sort(function (a, b) { return b.ratio - a.ratio; } );

                      angular.forEach(ratios, function (ratio)
                      {
                        colors.push(ratio.color);
                        xratios.push(ratio.ratio);
                      });

                      var r   = new Raphael($id + id),
                        pie = r.piechart(40, 40, 40, xratios, { colors: colors, stroke: 'white' });

                    }, 100);
                  }

                });
            }
            else
            {
              $rootScope.statusBar.off();
            }

          }


          /**
           * Get pie overviews
           */
          getOverviews();


          /**
           * TODO: DEPRECIATED! Get guard role
           */
          /*
           if ($rootScope.config.profile.smartAlarm)
           {
           Groups.guardRole();
           }
           */


          /**
           * Save widget settings
           */
          $scope.saveOverviewWidget = function (selection)
          {
            $rootScope.statusBar.display($rootScope.ui.settings.saving);

            // console.log('selection ->', selection);

            angular.forEach(selection, function (selected)
            {
              if (!selected.status)
              {
                selected.divisions = false;
              }
            });

            Settings.save($rootScope.app.resources.uuid, {
              user: Storage.local.settings().user,
              app: {
                group: Storage.local.settings().app.group,
                widgets: {
                  groups: selection
                }
              }
            })
              .then(function ()
              {
                $rootScope.statusBar.display($rootScope.ui.dashboard.refreshGroupOverviews);

                Profile.get($rootScope.app.resources.uuid, true)
                  .then(function ()
                  {
                    getOverviews();
                  });
              });
          };


          /**
           * Fetcher for p2000 alarm messages
           */
          $scope.getP2000 = function  ()
          {
            /**
             * P2000 announcements
             */
            Dashboard.p2000().
              then(function (result)
              {
                // console.log('result ->', result);

                $scope.loading.alerts = false;

                // if (result.error)
                // {
                // 	$rootScope.notifier.error('Error with getting p2000 alarm messages.');
                // 	console.warn('error ->', result);
                // 	}
                // else
                // {
                $scope.alarms = result.alarms;

                $scope.alarms.list = $scope.alarms.short;

                $scope.synced.alarms = result.synced;
                // }
              });
          };


          /**
           * Get alarms
           */
          $scope.getP2000();


          /**
           * Alarm sync
           */
          $rootScope.alarmSync = {
            /**
             * Start planboard sync
             */
            start: function ()
            {
              $window.planboardSync = $window.setInterval(function ()
              {
                // console.log('syncing started for p2000 alerts..');

                /**
                 * Update planboard only in planboard is selected
                 */
                if ($location.path() == '/dashboard')
                {
                  // console.log('yes it is the dashboard');

                  $scope.$apply()
                  {
                    $scope.getP2000();

                    // console.log('working in the background');

                    if ($rootScope.config.profile.smartAlarm)
                    {
                      Groups.guardRole();
                    }

                    // $scope.getGuard.global();
                  }
                }
                // Sync periodically for a minute
              }, 60000); // one minute
            },
            /**
             * Clear planboard sync
             */
            clear: function ()
            {
              // console.log('syncing for p2000 alerts stopped..');

              $window.clearInterval($window.alarmSync);
            }
          };


          /**
           * Init the sync process
           */
          $rootScope.alarmSync.start();


          /**
           * Show more or less alarms
           */
          $scope.toggle = function (more)
          {
            $scope.alarms.list = (more) ? $scope.alarms.short :  $scope.alarms.long;

            $scope.more.text = (more) ? $rootScope.ui.dashboard.showMore : $rootScope.ui.dashboard.showLess;

            $scope.more.status = !$scope.more.status;
          };


          /**
           * Fix popover position
           */
          $scope.fixPopoverPos = function ()
          {
            setTimeout(function ()
            {
              var spanWidth = $('#dashboard .span9').css('width'),
                popWidth  = $('#dashboard .popover').css('width');

              $('.popover').css({
                top: $('#dashboardPopoverBtn').css('top'),
                left: ((spanWidth.substring(0, spanWidth.length - 2) - popWidth.substring(0, popWidth.length - 2) / 2) + 4)
                  + 'px'
              });
            }, 100);
          }
        }
      ]
    );
  }
);