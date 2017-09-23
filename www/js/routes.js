angular.module('app.routes', [])

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider
    
  

      .state('menu.slider', {
          cache:false,
    url: '/slider',
    views: {
      'side-menu21': {
        templateUrl: 'templates/slider.html',
        controller: 'sliderCtrl'
      }
    }
  })

  .state('menu.createProfile', {
      cache:false,
    url: '/signup',
    views: {
      'side-menu21': {
        templateUrl: 'templates/createProfile.html',
        controller: 'createProfileCtrl'
      }
    }
  })


  .state('menu.finalStep', {
    url: '/finalstep',
    views: {
      'side-menu21': {
        templateUrl: 'templates/finalStep.html',
        controller: 'finalStepCtrl'
      }
    }
  })

  .state('menu', {
      cache:false,
    url: '/side-menu21',
    templateUrl: 'templates/menu.html',
    controller: 'menuCtrl'
  })

  .state('menu.nearestRestaurants', {
     cache:false,
    url: '/nearestRestaurants/:lat/:long',
    views: {
      'side-menu21': {
        templateUrl: 'templates/nearestRestaurants.html',
        controller: 'nearestRestaurantsCtrl'
      }
    }
  })

  .state('menu.history', {
      cache:false,
    url: '/history',
    views: {
      'side-menu21': {
        templateUrl: 'templates/history.html',
        controller: 'historyCtrl'
      }
    }
  })
    .state('menu.favorites', {
      cache:false,
    url: '/favorites',
    views: {
      'side-menu21': {
        templateUrl: 'templates/favorites.html',
        controller: 'favoritesCtrl'
      }
    }
  })
 
  .state('menu.profile', {
    url: '/profile',
    views: {
      'side-menu21': {
        templateUrl: 'templates/profile.html',
        controller: 'profileCtrl'
      }
    }
  })
  .state('menu.map', {
    url: '/map',
    views: {
      'side-menu21': {
        templateUrl: 'templates/map.html',
        controller: 'mapCtrl'
      }
    }
  })

  .state('menu.restaurantDetails', {
      cache:false,
    url: '/restaurantDetails/:proid/:dist',
    views: {
      'side-menu21': {
        templateUrl: 'templates/restaurantDetails.html',
        controller: 'restaurantDetailsCtrl'
      }
    }
  })

  /*------------------*/
  .state('menu.allsavings', {
    url: '/allsavings',
    views: {
      'side-menu21': {
        templateUrl: 'templates/allsavings.html',
        controller: 'allsavingsCtrl'
      }
    }
  })
  .state('menu.editinfo', {
    url: '/editinfo',
    views: {
      'side-menu21': {
        templateUrl: 'templates/editinfo.html',
        controller: 'editinfoCtrl'
      }
    }
  })

  .state('menu.changepassword', {
      cache:false,
    url: '/changepassword',
    views: {
      'side-menu21': {
        templateUrl: 'templates/changepassword.html',
        controller: 'changepasswordCtrl'
      }
    }
  })
   .state('menu.forgetPassword', {
      cache:false,
    url: '/forgetPassword',
    views: {
      'side-menu21': {
        templateUrl: 'templates/forgetPassword.html',
        controller: 'forgetPasswordCtrl'
      }
    }
  })

   .state('menu.signin', {
       cache:false,
    url: '/signin',
    views: {
      'side-menu21': {
        templateUrl: 'templates/signin.html',
        controller: 'signinCtrl'
      }
    }
  })
    .state('menu.search', {
    url: '/search/:lat/:long',
    views: {
      'side-menu21': {
        templateUrl: 'templates/search.html',
        controller: 'searchCtrl'
      }
    }
  })
  .state('menu.restaurantpage', {
      cache:false,
    url: '/restaurantpage/:resid/:dist',
    views: {
      'side-menu21': {
        templateUrl: 'templates/restaurantpage.html',
        controller: 'restaurantpageCtrl'
      }
    }
  })
$urlRouterProvider.otherwise('/side-menu21/slider')

  

});