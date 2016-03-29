angular.module('app.routes', [])

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider


    .state('login', {
      url: '/login',
      templateUrl: 'templates/login.html',
      controller: 'loginCtrl'
    })

      .state('home', {
    url: '/home',
    templateUrl: 'templates/home.html',
    controller: 'homeCtrl'
  })


  .state('leads', {
    url: '/leads',
    templateUrl: 'templates/leads.html',
    controller: 'leadsCtrl'
  })

  .state('walkIn', {
    url: '/walkin',
    templateUrl: 'templates/walkIn.html',
    controller: 'walkInCtrl'
  })

  .state('bookings', {
    url: '/bookings',
    templateUrl: 'templates/bookings.html',
    controller: 'bookingsCtrl'
  })

  .state('dealHunters', {
    url: '/dealhunters',
    templateUrl: 'templates/dealHunters.html',
    controller: 'dealHuntersCtrl'
  })

  .state('calender', {
    url: '/calender',
    templateUrl: 'templates/calender.html',
    controller: 'calenderCtrl'
  })

  .state('leadDetail', {
    url: '/leaddetail',
    templateUrl: 'templates/leadDetail.html',
    controller: 'leadDetailCtrl'
  })

  .state('bookingDetail', {
    url: '/bookingdetail',
    templateUrl: 'templates/bookingDetail.html',
    controller: 'bookingDetailCtrl'
  })

  .state('followUps', {
    url: '/followups',
    templateUrl: 'templates/followUps.html',
    controller: 'followUpsCtrl'
  })

$urlRouterProvider.otherwise('/login')



});
