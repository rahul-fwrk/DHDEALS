angular.module('app.controllers', [])

        .controller('sliderCtrl', function ($scope, $stateParams, $state, $ionicSlideBoxDelegate, $rootScope, $window, $ionicLoading, Base_Url, $http, $cordovaGeolocation, $ionicModal, $ionicPopup) {
            $http.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;';
            $rootScope.userid = $window.localStorage.getItem('CurrentUserInfo');

            $scope.autocompleteOptions = {
                componentRestrictions: {country: 'kw'},
                types: ['geocode']
            };

            $scope.$on('g-places-autocomplete:select', function (event, param) {
                delete $rootScope.apl;
                console.log(event.targetScope.model.formatted_address);
                $rootScope.addr = event.targetScope.model.formatted_address;
                var res = event.targetScope.model.formatted_address.replace(" ", "");
                console.log(res);
                $http.post('https://maps.googleapis.com/maps/api/geocode/json?address=(' + res + ')').success(function (rest)
                {
                    console.log(rest);
                    if (rest.status != "ZERO_RESULTS")
                    {
                        delete $rootScope.Restaurants;
                        $rootScope.lat = rest.results[0].geometry.location.lat;
                        $rootScope.long = rest.results[0].geometry.location.lng;
                        console.log(rest.results[0].geometry.location.lat);
                        console.log(rest.results[0].geometry.location.lng);

                        /////////////////////////////////////
                        var link = Base_Url + "restaurants/search?lat=" + $rootScope.lat + "&long=" + $rootScope.long;
                        $http.post(link).then(function (res) {
                            $ionicLoading.hide();
                            $scope.response = res.data;
                            console.log($scope.response);
                            if ($scope.response.isSuccess == true) {
                                $rootScope.products = $scope.response.data;
                                var catlink = Base_Url + "cats/catlist";
                                $http.post(catlink).then(function (response) {
                                    console.log(response);
                                    $rootScope.slidertype = response.data.data;
                                });
                                console.log($rootScope.products);
                            } else {
                                $ionicLoading.hide();

                            }
                        });

                        /////////////////////////////
                    }
                    else
                    {
                        alert("Unable to find your location");
                    }

                })
            });

            if ($rootScope.userid) {
                $scope.user_id = JSON.parse($window.localStorage.getItem('CurrentUserInfo')).User.id;
                $ionicLoading.show();
                var restdata = {user: {
                        id: $scope.user_id
                    }
                }
                //console.log(restdata);
                var link = Base_Url + 'users/user'
                $http.post(link, restdata).then(function (res) {
                    $ionicLoading.hide();
                    //console.log(res);
                    if (res.data.msg === "Success")
                    {
                        console.log(res);
                        $rootScope.profile = res.data.data[0].User;
                        console.log($rootScope.profile);
                        $window.localStorage.setItem('profileData', JSON.stringify($rootScope.profile));
                        console.log(JSON.parse($window.localStorage.getItem('profileData')).image);
                        $rootScope.name = JSON.parse($window.localStorage.getItem('CurrentUserInfo')).User.name;
                        $rootScope.image = JSON.parse($window.localStorage.getItem('CurrentUserInfo')).User.image;

                    }
                });

            }

            $scope.rest = function () {
                delete $rootScope.addr;
                delete $rootScope.lat;
                delete $rootScope.long;
                $ionicLoading.show();
                var posOptions = {timeout: 10000, enableHighAccuracy: false};
                //alert('position');
                $cordovaGeolocation.getCurrentPosition(posOptions).then(function (position) {
                    //alert('geolocation');
                    $rootScope.lat = position.coords.latitude;
                    $rootScope.long = position.coords.longitude;
                    console.log($rootScope.lat + " " + $rootScope.long);

                    var link = Base_Url + "restaurants/restaurantslist?lat=" + $rootScope.lat + "&long=" + $rootScope.long;
                    $http.post(link).then(function (res) {
                        $ionicLoading.hide();
                        $scope.response = res.data;
                        console.log($scope.response);
                        if ($scope.response.isSuccess == true) {

                            $rootScope.products = $scope.response.data;
                            console.log($rootScope.products);

//////////////////////////////
                            var catlink = Base_Url + "cats/catlist";
                            $http.post(catlink).then(function (response) {
                                console.log(response);
                                $rootScope.slidertype = response.data.data;
                            });

                            console.log($rootScope.products);
                        } else {
                            $ionicLoading.hide();

                        }
                    });
                }, function (err) {
                    $ionicLoading.hide();
                    var confirmPopup = $ionicPopup.show({
                        title: 'Location',
                        template: "Unable to find your location",
                        buttons: [
                            {text: 'Okay',
                                type: 'button button-login'}
                        ]
                    });
                })

            }
            $scope.rest();

            $scope.category1 = function (value, $event) {
                // alert('clicked');
                $ionicLoading.show();
                var link = Base_Url + "restaurants/filterby_category?lat=" + $rootScope.lat + "&long=" + $rootScope.long + "&catid=" + value;
                console.log(link);
                $http.post(link).then(function (res) {
                    $ionicLoading.hide();
                    $scope.response = res.data;
                    if ($scope.response.isSuccess == true) {
                        console.log(res.data);
                        $rootScope.products = $scope.response.data;
                        angular.forEach($scope.response.data, function (value, key) {
                            $scope.datediffrence = new Date(value.Restaurant.created.replace(/-/g, '/'));
                            $scope.currentdate = new Date();
                            $scope.difference = parseInt($scope.currentdate - $scope.datediffrence);
                            $scope.secondsDiff = $scope.difference / (1000 * 60 * 60 * 24);
                            value.Restaurant.days = $scope.secondsDiff;
                        });

                        console.log($rootScope.products);
                        $scope.closeModal1();
                    } else {
                        $ionicLoading.hide();
                        //alert('rahul');
                        $rootScope.products = null;

                    }
                });
            }

            $rootScope.resetcat = function () {

                delete $rootScope.addr;
                $ionicLoading.show();
                $scope.rest();

            }
            $rootScope.sliderrestdetail = function (rest_id, distance) {
                $rootScope.dist = distance;
                //alert(distance);
                $ionicLoading.show();
                $scope.userid = $window.localStorage.getItem('CurrentUserInfo');
                if ($scope.userid) {
                    $scope.user_id = JSON.parse($window.localStorage.getItem('CurrentUserInfo')).User.id;
                    console.log($rootScope.userid);
                    console.log($scope.user_id);

                    var postData = {
                        Restaurant: {
                            id: rest_id
                        },
                        user_id: $scope.user_id
                    }
                    console.log(postData);
                } else {
                    var postData = {
                        Restaurant: {
                            id: rest_id
                        }
                    }
                    console.log(postData);
                }
                var link = Base_Url + "restaurants/restaurantbyid";
                $http.post(link, postData).then(function (res) {
                    $ionicLoading.hide();
                    $scope.response = res.data;
                    console.log($scope.response);
                    if ($scope.response.isSucess == "true") {
                        $ionicLoading.hide();
                        //$scope.data.id = rest_id;
                        var postD = {id: rest_id}
                        $http.post("http://rajdeep.crystalbiltech.com/dhdeals2/api/Times/times", postD).then(function (res) {
                            console.log(res);
                            $rootScope.openTiming = res.data.data.Time;
                            $rootScope.RestaurantDetail = $scope.response.data;
                            console.log($rootScope.RestaurantDetail.logo);
                            $state.go('menu.restaurantDetails');
                        })

                    } else {
                        $ionicLoading.hide();

                    }
                });

            }

            $scope.mapalert = function (abc, maprestid, name, addr, deals, days, logo, distance) {
                $rootScope.restname = name;
                $rootScope.address = addr;
                $rootScope.deal = deals;
                $rootScope.day = days;
                $rootScope.logo = logo;
                //  alert(days);
                $scope.confirmPopup = $ionicPopup.show({
                    template: '<h3 class="newdeals" ng-if="day == 1">New</h3><i class="close ion-close" ng-click="popclose()"></i><h4>{{restname}}</h4><img src="{{logo}}"/><div class="location1"><span>{{address}} </span><p><span>{{deal}}</span></p></div>',
                    cssClass: 'custombutton3 custombutton13 custombutton1334',
                    buttons: [
                        {text: 'Show Deal',
                            type: 'button button-login',
                            onTap: function (e) {
                                $state.go('menu.restaurantpage', {resid: maprestid, dist: distance});
                                //$rootScope.sliderrestdetail(maprestid, distance);
                            }
                        }
                    ]
                });

            }

            $rootScope.popclose = function () {
                $scope.confirmPopup.close();
            }

            $ionicModal.fromTemplateUrl('templates/search.html', {
                scope: $scope,
                animation: 'slide-in-up',
            }).then(function (modal) {
                $scope.modal = modal;
            });

            $scope.openModal = function () {
                $scope.modal.show();
            };

            $scope.closeModal = function () {
                $scope.modal.hide();
            };

            //Cleanup the modal when we're done with it!
            $scope.$on('$destroy', function () {
                $scope.modal.remove();
            });

            // Execute action on hide modal
            $scope.$on('modal.hidden', function () {
                // Execute action
            });

            // Execute action on remove modal
            $scope.$on('modal.removed', function () {
                // Execute action
            });

            // For Filtr Tab
            $ionicModal.fromTemplateUrl('templates/filter.html', {
                scope: $scope,
                animation: 'slide-in-up',
            }).then(function (modal) {
                $scope.modal1 = modal;
            });

            $scope.closeModal1 = function () {
                $scope.modal1.hide();
            };

// Called to navigate to the main app
            $scope.startApp = function () {
                $state.go('main');
            };
            $scope.next = function () {
                $ionicSlideBoxDelegate.next();
            };
            $scope.previous = function () {
                $ionicSlideBoxDelegate.previous();
            };

            // Called each time the slide changes
            $scope.slideChanged = function (index) {
                $scope.slideIndex = index;
            };



        })

        .controller('createProfileCtrl', function ($scope, $stateParams, Base_Url, $http, $ionicLoading, $state, $window, $ionicPopup) {
            $http.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;';
            $scope.data = {}
            // Setup the loader
            $scope.registerUser = function () {
                $ionicLoading.show();
                console.log($scope.data);
                var link = Base_Url + "users/registration";
                $scope.loading = true;
                if ($scope.data.email != '') {
                    console.log($scope.data.email);
                    $http.post(link, {
                        name: $scope.data.name,
                        phone: $scope.data.phone,
                        email: $scope.data.email,
                        password: $scope.data.password
                    }).then(function (res) {
                        console.log(res);
                        $ionicLoading.hide();
                        $scope.response = res.data;
                        console.log($scope.response.email);
                        if ($scope.response.status === true) {
                            $window.localStorage.setItem('user_email', $scope.response.email);
                            console.log($window.localStorage.getItem('user_email'));
                            $scope.Popup = $ionicPopup.show({
                                template: 'Sign up Successful',
                                scope: $scope,
                                buttons: [
                                    {text: 'Okay',
                                        onTap: function (e) {
                                            $scope.Popup.close();
                                            $state.go('menu.signin', {reload: true});
                                        }}
                                ]
                            });
                        } else {
                            var myPopup = $ionicPopup.show({
                                template: $scope.response.msg,
                                scope: $scope,
                                buttons: [
                                    {text: 'Okay',
                                        onTap: function (e) {
                                            myPopup.close();
                                        }}
                                ]
                            });

                        }
                    });
                }
            }

        })

        .controller('signinCtrl', function ($scope, $stateParams, Base_Url, $http, $ionicLoading, $window, $state, $rootScope, $cordovaGeolocation, $ionicPopup) {
            $http.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;';
            $scope.data = {}

            $scope.userprofile = function () {
                $rootScope.userid = $window.localStorage.getItem('CurrentUserInfo');
                if ($rootScope.userid) {

                    $scope.user_id = JSON.parse($window.localStorage.getItem('CurrentUserInfo')).User.id;
                    $ionicLoading.show();
                    var restdata = {user: {
                            id: $scope.user_id
                        }
                    }
                    //console.log(restdata);
                    var link = Base_Url + 'users/user'
                    $http.post(link, restdata).then(function (res) {
                        $ionicLoading.hide();
                        //console.log(res);
                        if (res.data.msg === "Success")
                        {
                            $rootScope.profile = res.data.data[0].User;
                            console.log($rootScope.profile);
                            $window.localStorage.setItem('profileData', JSON.stringify($rootScope.profile));
                            console.log(JSON.parse($window.localStorage.getItem('profileData')).image);

                            $rootScope.name = JSON.parse($window.localStorage.getItem('CurrentUserInfo')).User.name;
                            $rootScope.image = JSON.parse($window.localStorage.getItem('CurrentUserInfo')).User.image;

                        } else {
                            $ionicLoading.hide();
                        }
                    });
                }
            }
            $scope.loginrest = function () {
                $scope.userid = $window.localStorage.getItem('CurrentUserInfo');
                if ($scope.userid) {
                    $scope.user_id = JSON.parse($window.localStorage.getItem('CurrentUserInfo')).User.id;
                    console.log($rootScope.userid);
                    console.log($scope.user_id);
                    var posOptions = {timeout: 10000, enableHighAccuracy: false};
                    $cordovaGeolocation.getCurrentPosition(posOptions).then(function (position) {
                        $scope.lat = position.coords.latitude;
                        $scope.long = position.coords.longitude;
                        console.log($scope.lat + " " + $scope.long);
                        $ionicLoading.show();
                        var postData = {data: {
                                Restaurant: {
                                    latitude: $scope.lat,
                                    longitude: $scope.long
                                }
                            },
                            user_id: $scope.user_id
                        }
                        var link = Base_Url + "restaurants/restaurantslist"
                        $http.post(link, postData).then(function (res) {
                            $scope.response = res.data;
                            console.log($scope.response);
                            if ($scope.response.isSuccess == "true") {
                                $ionicLoading.hide();

                                $rootScope.Restaurants = $scope.response.data.Restaurant;

                            } else {
                                $ionicLoading.hide();

                            }
                        });
                    })
                }
            }
            $scope.LoginUser = function () {
                $ionicLoading.show();
                console.log($scope.data);
                var link = Base_Url + "users/loginwork";
                $scope.loading = true;
                if ($scope.data.email != '') {
                    var loginData = {
                        user: {
                            username: $scope.data.email,
                            password: $scope.data.password
                        }
                    }
                    console.log(loginData);
                    $http.post(link, loginData).then(function (res) {
                        console.log(res);
                        $ionicLoading.hide();
                        $scope.response = res.data;
                        if ($scope.response.status == true) {
                            $scope.loginrest();
                            $window.localStorage.setItem('CurrentUserInfo', JSON.stringify($scope.response.name));
                            $scope.retrieved = $window.localStorage.getItem('CurrentUserInfo');
                            console.log(JSON.parse($scope.retrieved));
                            $scope.userprofile();
                            var myPopup = $ionicPopup.show({
                                template: $scope.response.msg,
                                scope: $scope,
                                buttons: [
                                    {text: 'Okay',
                                        onTap: function (e) {
                                            $state.go('menu.slider', {reload: true});
                                        }}
                                ]
                            });
                        } else {
                            $ionicLoading.hide();
                            var myPopup = $ionicPopup.show({
                                template: $scope.response.msg,
                                scope: $scope,
                                buttons: [
                                    {text: 'Okay',
                                        onTap: function (e) {
                                            myPopup.close();
                                        }}
                                ]
                            });
                        }

                    });
                }
            }


        })


        .controller('finalStepCtrl', function ($scope, $stateParams, $window, $ionicLoading, Base_Url, $http, $state, $ionicPopup) {
            $http.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;';
            $scope.data = {};

            $scope.email_verification = function () {
                console.log($window.localStorage.getItem('user_email'));
                $scope.data.email = $window.localStorage.getItem('user_email')
                console.log($scope.data);
                $ionicLoading.show();

                $http.post(Base_Url + 'users/verifyEmail', $scope.data).success(function (response) {
                    $ionicLoading.hide();
                    console.log(response);
                    if (response.isSuccess == true) {
                        var myPopup = $ionicPopup.show({
                            template: response.msg,
                            scope: $scope,
                            buttons: [
                                {text: 'Okay',
                                    onTap: function (e) {
                                        $state.go("menu.signin");
                                    }}
                            ]
                        });

                    } else {
                        var myPopup = $ionicPopup.show({
                            template: response.msg,
                            scope: $scope,
                            buttons: [
                                {text: 'Okay',
                                    onTap: function (e) {
                                        myPopup.close();
                                    }}
                            ]
                        });
                    }
                });
            }

        })

        .controller('menuCtrl', ['$scope', '$stateParams', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
            function ($scope, $stateParams) {


            }])

        .controller('nearestRestaurantsCtrl', function ($scope, $stateParams, $ionicModal, Base_Url, $ionicLoading, $http, $window, $cordovaGeolocation, $rootScope, $ionicPopup, $state, $ionicPlatform, $filter, $ionicPopover) {
            $http.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;';

            $scope.data = {}

            var myEl = angular.element(document.querySelector('.pac-container'));
            myEl.remove();
            console.log(myEl);

            $rootScope.userid = $window.localStorage.getItem('CurrentUserInfo');
            $scope.lattitude = $stateParams.lat;
            $scope.longitude = $stateParams.long;

            $ionicModal.fromTemplateUrl('templates/filter.html', {
                scope: $scope,
                animation: 'slide-in-up',
            }).then(function (modal) {
                $rootScope.modal1 = modal;
            });

            $rootScope.closeModal1 = function () {
                $rootScope.modal1.hide();
            };

            $scope.restlist = function () {
                var distan = []
                var newcount = []
                var days = []
                delete $rootScope.Restaurants;
                delete $rootScope.apl;
                delete $rootScope.apl2;
                delete $rootScope.restype;
//     delete $rootScope.filterby;
                delete $rootScope.typeid;
                delete $rootScope.catename;
                delete $rootScope.catg;
                delete $rootScope.fill;
                delete $scope.popover;
                localStorage.removeItem('catid');
                localStorage.removeItem('catname');
//                alert($scope.lattitude);
//                alert($scope.longitude);
                $ionicLoading.show();
                if ($window.localStorage.getItem('CurrentUserInfo')) {
                    $scope.user_id = JSON.parse($window.localStorage.getItem('CurrentUserInfo')).User.id;
                    var link = Base_Url + "products/productlist?lat=" + $scope.lattitude + "&long=" + $scope.longitude + "&userid=" + $scope.user_id;
                }
                else {
                    var link = Base_Url + "products/productlist?lat=" + $scope.lattitude + "&long=" + $scope.longitude;
                }
                $http.post(link).then(function (res) {
                    $ionicLoading.hide();
                    console.log(res);
                    $scope.response = res.data;
                    //console.log($scope.response);
                    if ($scope.response.isSuccess == true) {
                        $scope.products = $scope.response.data;
                        console.log($scope.products);
                        var catlink = Base_Url + "cats/catlist";
                        $http.post(catlink).then(function (response) {
                            console.log(response);
                            $rootScope.type = response.data.data;
                            console.log($rootScope.type);
                        });
                    } else {
                        $ionicLoading.hide();
                        $scope.products = null;
                    }
                });

            };

            $scope.restlist();

            $scope.favorite = function (prodid, floc) {
//                alert('fav');
                var details = []
                $scope.flog = floc;
                console.log($rootScope.typeid);

                if ($window.localStorage.getItem('CurrentUserInfo')) {
                    $scope.user_id = JSON.parse($window.localStorage.getItem('CurrentUserInfo')).User.id;
                    var postData = {
                        User: {
                            id: $scope.user_id
                        },
                        Product: {
                            prodid: prodid
                        }
                    }
                    console.log(postData);
                    $ionicLoading.show();
                    var link = Base_Url + "products/likeit";
                    $http.post(link, postData).then(function (res) {

                        console.log(res);
                        if (res.data.error == 1) {
                            console.log($rootScope.apl);
                            if ($rootScope.apl == 1) {
                                delete $rootScope.catename;
                                delete $rootScope.typeid;
                                $scope.cat = $window.localStorage.getItem('catid');
                                $scope.name = $window.localStorage.getItem('catname');
                                $scope.categorize($scope.cat, $scope.name);
                            }
                            else if ($rootScope.typeid != null) {
                                $ionicLoading.show();
                                var postData = {data: {
                                        Restaurant: {
                                            latitude: $scope.lattitude, //52.379189
                                            longitude: $scope.longitude, //4.899431
                                            cuisineid: $rootScope.typeid
                                        }
                                    },
                                    user_id: $scope.user_id
                                }
                                console.log(postData);
                                var link = Base_Url + "restaurants/restaurantslistallwork";
                                $http.post(link, postData).then(function (res) {
                                    $ionicLoading.hide();
                                    console.log(res);
                                    $scope.response = res.data;
                                    //console.log($scope.response);
                                    if ($scope.response.isSuccess == "true") {
                                        $scope.products = $scope.response.data;
                                        var catlink = Base_Url + "cats/catlist";
                                        $http.post(catlink).then(function (response) {
                                            console.log(response);
                                            $rootScope.type = response.data.data;
                                        });

                                    } else {
                                        $ionicLoading.hide();

                                    }
                                });
                            } else {
                                delete $rootScope.typeid;
                                $ionicLoading.show();
                                $scope.restlist();
                            }


                        } else {
                            if ($rootScope.apl == 1) {
                                delete $rootScope.typeid;
                                $rootScope.catename = "Filter";
                                $scope.cat = $window.localStorage.getItem('catid');
                                $scope.name = $window.localStorage.getItem('catname');
                                $scope.categorize($scope.cat, $scope.name);
                            } else {
                                delete $rootScope.typeid;
                                $ionicLoading.show();
                                $scope.restlist();
                            }
                        }

                    })
                } else {
                    var myPopup = $ionicPopup.show({
                        template: 'Login first to Favorite',
                        scope: $scope,
                        title: 'Favorite',
                        cssClass: 'favoritepopup',
                        buttons: [
                            {text: 'Login',
                                onTap: function (e) {
                                    $state.go('menu.signin');
                                }},
                            {text: 'Cancel',
                                onTap: function (e) {
                                    myPopup.close();
                                }}
                        ]
                    });

                }
            };


            $rootScope.filterbyname = function () {
                delete $rootScope.catename;
                delete $rootScope.apl;
                delete $rootScope.apl2;
                delete $rootScope.floc;
                $scope.data.category_Name = null;
                delete $rootScope.restype;
                delete $rootScope.typeid;
                delete $rootScope.catg;
                delete $rootScope.fil;
                delete $scope.popover;
                $scope.restlist();
                $rootScope.floc = "Product.name";
                $scope.closeModal1();
            };

            //function for reset filters
            $rootScope.reset = function () {
                delete $rootScope.catename;
                delete $rootScope.typeid;
                delete $rootScope.fill;
                delete $rootScope.fil;
                var reset = []
                delete $rootScope.floc;
                delete $rootScope.apl;
                delete $scope.popover;
                $scope.data.category_Name = null;
                $scope.restlist();
                $scope.closeModal1();
            }

            /***************** function for calculate distance *******************/
            $rootScope.distance = function () {
                $rootScope.fil = "distance";
                delete $rootScope.apl;
                delete $rootScope.apl2;
                delete $rootScope.restype;
                delete $rootScope.typeid;
                delete $rootScope.catename;
                delete $rootScope.catg;
                delete $rootScope.fill;
                delete $scope.popover;
                $scope.data.category_Name = null;
                $scope.restlist();
                $rootScope.floc = "[0].distance";
                $scope.closeModal1();
            };


            $rootScope.apply = function () {
                delete $rootScope.catename;
                $rootScope.catename = "Filter";
                delete $rootScope.typeid;
                delete $rootScope.fill;
                delete $rootScope.fil;
                delete $scope.popover;
                console.log($rootScope.apl);
                console.log(categories);
                console.log($scope.data.category_Name);
                console.log($scope.data.category_type);
                var categories = []
                var val = []
                var appl = []
                var retype = []
                var typeres = []
                $ionicLoading.show();

                angular.forEach($scope.data.category_Name, function (value, key) {
                    console.log(value);
                    console.log(key);
                    if (value === true) {
                        categories.push(key);
                        val.push(value);
                    }
                }, categories, val);
                console.log(categories);
                $rootScope.catg = categories;

                /*********forEach for category **************/
                /********************************************/
                if (categories != null) {
                    delete $rootScope.apl2;
                    $rootScope.apl = 1;
                    $window.localStorage.setItem('catid', categories);

                    if ($scope.userid) {
                        $scope.user_id = JSON.parse($window.localStorage.getItem('CurrentUserInfo')).User.id;
                        console.log($rootScope.userid);
                        console.log($scope.user_id);
                        var postData = {
                            lat: $scope.lattitude, //52.379189,
                            long: $scope.longitude, //4.899431,
                            catid: categories,
                            userid: $scope.user_id
                        }
                    }
                    else {
                        var postData = {
                            lat: $scope.lattitude, //52.379189,
                            long: $scope.longitude, //4.899431,
                            catid: categories
                        }
                    }
                    console.log(postData);
                    var link = Base_Url + "products/filterproduct";
                    $http.post(link, postData).then(function (res) {
                        $ionicLoading.hide();
                        $scope.response = res.data;
                        $scope.closeModal1();
                        console.log(res);
                        if ($scope.response.isSuccess == true) {
                            $scope.products = $scope.response.data;
                            console.log($scope.products);

                        } else {
                            $ionicLoading.hide();
                            $scope.products = null;
                        }
                    });

                } else {

                }

            };

            $scope.categorize = function (cat, name, $event) {
                var categ = []
                delete $rootScope.restype;
                delete $rootScope.filterby;
                delete $rootScope.typeid;
                delete $rootScope.fill;
                delete $rootScope.fil;
                delete $scope.popover;
                $window.localStorage.setItem('catid', cat);
                $window.localStorage.setItem('catname', name);
                $rootScope.catename = name;
                $rootScope.apl = 1;
                console.log($rootScope.apl);
                var catego = [];
                catego.push(cat);
                console.log(cat);
                console.log(catego);
                $ionicLoading.show();
                if ($window.localStorage.getItem('CurrentUserInfo')) {
                    $scope.user_id = JSON.parse($window.localStorage.getItem('CurrentUserInfo')).User.id;
                    console.log($rootScope.userid);
                    console.log($scope.user_id);
                    var postData = {
                        lat: $scope.lattitude, //52.379189,
                        long: $scope.longitude, //4.899431,
                        catid: catego,
                        userid: $scope.user_id
                    }
                } else {
                    var postData = {
                        lat: $scope.lattitude, //52.379189,
                        long: $scope.longitude, //4.899431,
                        catid: catego
                    }
                }
                var link = Base_Url + "products/filterproduct";
                $http.post(link, postData).then(function (res) {
                    $ionicLoading.hide();
                    $scope.response = res.data;
                    console.log($scope.response);
                    console.log(typeof (res.data.data));
                    if ($scope.response.isSuccess == true) {
                        $scope.products = $scope.response.data;
                        console.log($scope.response.data);
                        // angular.each loop for getting time
                        if (cat == 4) {
                            /**********Get all category(indian,chinese etc).***************/
                            var catlink = Base_Url + "restaurants/getalltype";
                            $http.post(catlink).then(function (response) {
                                console.log(response);
                                if (response.data.isSuccess == "true") {
                                    $rootScope.filterby = "Filter by Cuisines";
                                    $rootScope.restype = response.data.data;
                                    //console.log($rootScope.restype);
                                }
                            });
                            $rootScope.popup = $ionicPopover.fromTemplateUrl('templates/popover.html', {
                                scope: $scope,
                            }).then(function (popover) {
                                $scope.popover = popover;
                            });

                        } else {

                        }
                        console.log($scope.products);
                        $scope.closeModal1();
                    } else {
                        $ionicLoading.hide();
                        $scope.products = null;
                    }
                });

            }

            $ionicModal.fromTemplateUrl('templates/search.html', {
                scope: $scope,
                animation: 'slide-in-up',
            }).then(function (modal) {
                $scope.modal = modal;
            });

            $scope.openModal = function () {
                $scope.modal.show();
            };

            $scope.closeModal = function () {
                $scope.modal.hide();
            };

            //Cleanup the modal when we're done with it!
            $scope.$on('$destroy', function () {
                $scope.modal.remove();
            });

            // Execute action on hide modal
            $scope.$on('modal.hidden', function () {
                // Execute action
            });

            // Execute action on remove modal
            $scope.$on('modal.removed', function () {
                // Execute action
            });

            // For Filtr Tab



        })

        .controller('favoritesCtrl', function ($scope, $stateParams, $window, $ionicLoading, Base_Url, $rootScope, $cordovaGeolocation, $ionicPopup, $state, $http, $ionicModal) {
            $http.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';

            $rootScope.favoritelist3 = function () {

                if ($window.localStorage.getItem('CurrentUserInfo')) {
                    $scope.user_id = JSON.parse($window.localStorage.getItem('CurrentUserInfo')).User.id;
                    console.log($scope.user_id);
                    var postData = {id: $scope.user_id}
                    console.log(postData);
                    $ionicLoading.show();
                    var link = Base_Url + "products/favproductlist";
                    $http.post(link, postData).then(function (res) {
                        $ionicLoading.hide();
                        console.log(res.data);

                        if (res.data.error == 0) {
                            $rootScope.favoritelist = res.data.data;
                            console.log(res.data.data);

                        } else {
                            $rootScope.favoritelist = null;
                        }
                    })
                } else {
                    var myPopup = $ionicPopup.show({
                        template: 'Login first to See Favorite list',
                        scope: $scope,
                        title: 'Favorite List',
                        cssClass: 'favoritepopup',
                        buttons: [
                            {text: 'Login',
                                onTap: function (e) {
                                    $state.go('menu.signin');
                                }},
                            {text: 'Cancel',
                                onTap: function (e) {
                                    myPopup.close();
                                }},
                        ]
                    });
                }
            }
            $rootScope.favoritelist3();

            $scope.favoritelisting = function (prodid) {

                if ($window.localStorage.getItem('CurrentUserInfo')) {
                    $scope.user_id = JSON.parse($window.localStorage.getItem('CurrentUserInfo')).User.id;
                    console.log(prodid);
                    console.log($scope.user_id);
                    var postData = {
                        User: {
                            id: $scope.user_id
                        },
                        Product: {
                            prodid: prodid
                        }
                    }
                    console.log(postData);
                    $ionicLoading.show();
                    var link = Base_Url + "products/likeit"
                    $http.post(link, postData).then(function (res) {
                        $ionicLoading.hide();
                        console.log(res);
                        if (res.data.error == 0) {
                            $rootScope.favoritelist3();
                            var myPopup = $ionicPopup.show({
                                template: 'Removed from favorite',
                                scope: $scope,
                                title: 'Favorite',
                                cssClass: 'favoritepopup',
                                buttons: [
                                    {text: 'Okay',
                                        onTap: function (e) {
                                            myPopup.close();
                                        }}
                                ]
                            });
                        }
                    });
                } else {
                    var myPopup = $ionicPopup.show({
                        template: 'Login first to favorite',
                        scope: $scope,
                        title: 'Favorite',
                        cssClass: 'favoritepopup',
                        buttons: [
                            {text: 'Login',
                                onTap: function (e) {
                                    $state.go('menu.createProfile');
                                }},
                            {text: 'Cancel',
                                onTap: function (e) {
                                    myPopup.close();
                                }},
                        ]
                    });
                }
            }

            $scope.restdetail1 = function (rest_id) {
                //alert(rest_id);
                $scope.data = {}
                $scope.time = rest_id;
                $ionicLoading.show();
                $scope.userid = $window.localStorage.getItem('CurrentUserInfo');
                if ($scope.userid) {
                    $scope.user_id = JSON.parse($window.localStorage.getItem('CurrentUserInfo')).User.id;
                    console.log($rootScope.userid);
                    console.log($scope.user_id);

                    var postData = {
                        Restaurant: {
                            id: rest_id
                        },
                        user_id: $scope.user_id
                    }
                    var link = Base_Url + "restaurants/restaurantbyid";
                    $http.post(link, postData).then(function (res) {
                        $ionicLoading.hide();
                        $scope.response = res.data;
                        console.log($scope.response.data);
                        if ($scope.response.isSucess == "true") {
                            $ionicLoading.hide();

                            $rootScope.RestaurantDetail = $scope.response.data;
                            $scope.dist = $rootScope.findDistance($rootScope.lat, $rootScope.long, $scope.response.data.latitude, $scope.response.data.longitude);
                            $rootScope.dist = $scope.dist / 1000;
                            $scope.data.id = rest_id;
                            $http.post("http://rajdeep.crystalbiltech.com/dhdeals2/api/Times/times", $scope.data).then(function (res) {
                                console.log(res.data.data.Time);
                                $rootScope.openTiming = res.data.data.Time;
                                console.log($rootScope.dist);
                                console.log($rootScope.RestaurantDetail.logo);
                                $state.go('menu.restaurantDetails');
                            })

                        } else {
                            $ionicLoading.hide();

                        }
                    });
                }
            }


            $ionicModal.fromTemplateUrl('templates/search.html', {
                scope: $scope,
                animation: 'slide-in-up',
            }).then(function (modal) {
                $scope.modal = modal;
            });

            $scope.openModal = function () {
                $scope.modal.show();
            };

            $scope.closeModal = function () {
                $scope.modal.hide();
            };

            //Cleanup the modal when we're done with it!
            $scope.$on('$destroy', function () {
                $scope.modal.remove();
            });

            // Execute action on hide modal
            $scope.$on('modal.hidden', function () {
                // Execute action
            });

            // Execute action on remove modal
            $scope.$on('modal.removed', function () {
                // Execute action
            });

            // For Filtr Tab
            $ionicModal.fromTemplateUrl('templates/filter.html', {
                scope: $scope,
                animation: 'slide-in-up',
            }).then(function (modal) {
                $scope.modal1 = modal;
            });

            $scope.closeModal1 = function () {
                $scope.modal1.hide();
            };


        })


        .controller('restaurantDetailsCtrl', function ($scope, $stateParams, $ionicScrollDelegate, $state, $ionicSlideBoxDelegate, Base_Url, $http, $ionicLoading, $window, $rootScope, $ionicPopup, $ionicModal, $cordovaSocialSharing) {
            $http.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
            $scope.prodid = $stateParams.proid;
            $scope.dist = $stateParams.dist;
            // alert($scope.prodid);
            if ($window.localStorage.getItem('CurrentUserInfo')) {
                $scope.user_id = JSON.parse($window.localStorage.getItem('CurrentUserInfo')).User.id;

                var postData = {
                    Product: {
                        id: $scope.prodid
                    },
                    user_id: $scope.user_id
                }

                var link = Base_Url + "products/getproductbyid";
                $http.post(link, postData).then(function (res) {
                    $ionicLoading.hide();
                    $scope.response = res.data;
                    console.log($scope.response.list);
                    if ($scope.response.error == 0) {

                        $ionicLoading.hide();
                        $scope.productdetail = $scope.response.list;
                        console.log($scope.productdetail);
                    } else {
                        $ionicLoading.hide();

                    }
                });
            } else {
                var myPopup = $ionicPopup.show({
                                template: 'Login first to see deal',
                                scope: $scope,
                                cssClass: 'favoritepopup',
                                buttons: [
                                    {text: 'Okay',
                                        onTap: function (e) {
                                            $state.go('menu.signin');
                                        }}
                                ]
                            });
            }


            $scope.favoriterest = function (restid) {

                if ($window.localStorage.getItem('CurrentUserInfo')) {
                    $scope.user_id = JSON.parse($window.localStorage.getItem('CurrentUserInfo')).User.id;
                    console.log(restid);
                    console.log($scope.user_id);
                    var postData = {
                        User: {
                            id: $scope.user_id
                        },
                        Product: {
                            prodid: $scope.prodid
                        }
                    }
                    console.log(postData);
                    $ionicLoading.show();
                    var link = Base_Url + "products/likeit"
                    $http.post(link, postData).then(function (res) {
                        $ionicLoading.hide();
                        console.log(res);
                        if (res.data.error == 1) {
                            $ionicLoading.show();
                            if ($window.localStorage.getItem('CurrentUserInfo')) {
                                $scope.user_id = JSON.parse($window.localStorage.getItem('CurrentUserInfo')).User.id;

                                var postData = {
                                    Product: {
                                        id: $scope.prodid
                                    },
                                    user_id: $scope.user_id
                                }
                            } else {
                                var postData = {
                                    Product: {
                                        id: $scope.prodid
                                    }
                                }
                            }
                            var link = Base_Url + "products/getproductbyid";
                            $http.post(link, postData).then(function (res) {
                                $ionicLoading.hide();
                                $scope.response = res.data;
                                console.log($scope.response.list);
                                if ($scope.response.error == 0) {

                                    $ionicLoading.hide();
                                    $scope.productdetail = $scope.response.list;
                                    console.log($scope.productdetail);
                                } else {
                                    $ionicLoading.hide();

                                }
                            });
                            var myPopup = $ionicPopup.show({
                                template: 'Added to Favorites',
                                scope: $scope,
                                cssClass: 'favoritepopup',
                                buttons: [
                                    {text: 'Okay',
                                        onTap: function (e) {

                                        }}
                                ]
                            });
                        } else {
                            $ionicLoading.show();
                            if ($window.localStorage.getItem('CurrentUserInfo')) {
                                $scope.user_id = JSON.parse($window.localStorage.getItem('CurrentUserInfo')).User.id;

                                var postData = {
                                    Product: {
                                        id: $scope.prodid
                                    },
                                    user_id: $scope.user_id
                                }
                            } else {
                                var postData = {
                                    Product: {
                                        id: $scope.prodid
                                    }
                                }
                            }
                            var link = Base_Url + "products/getproductbyid";
                            $http.post(link, postData).then(function (res) {
                                $ionicLoading.hide();
                                $scope.response = res.data;
                                console.log($scope.response.list);
                                if ($scope.response.error == 0) {

                                    $ionicLoading.hide();
                                    $scope.productdetail = $scope.response.list;
                                    console.log($scope.productdetail);
                                } else {
                                    $ionicLoading.hide();

                                }
                            });
                            var myPopup = $ionicPopup.show({
                                template: 'Removed from favorites',
                                scope: $scope,
                                cssClass: 'favoritepopup',
                                buttons: [
                                    {text: 'Okay',
                                        onTap: function (e) {
                                        }}
                                ]
                            });
                        }
                    });
                } else {
                    var myPopup = $ionicPopup.show({
                        template: 'Login first to favorite',
                        scope: $scope,
                        title: 'favorite',
                        cssClass: 'favoritepopup',
                        buttons: [
                            {text: 'Login',
                                onTap: function (e) {
                                    $state.go('menu.signin');
                                }},
                            {text: 'Cancel',
                                onTap: function (e) {
                                    myPopup.close();
                                }},
                        ]
                    });
                }
            }


            $scope.invitefriends = function (name, link) {
                $cordovaSocialSharing.share("Deal of the day : ", name, "", link) // Share via native share sheet
                        .then(function (result) {
                            // Success!
                        }, function (err) {
                            // An error occured. Show a message to the user
                        });
            }

            var el = document.getElementById("div1");
            $scope.scrollEvent = function () {

                $scope.scrollamount = $ionicScrollDelegate.$getByHandle('scrollHandle').getScrollPosition().top;
                if ($scope.scrollamount > 180) {
                    $scope.$apply(function () {
                        el.classList.remove("map_header");

                    });
                } else {
                    $scope.$apply(function () {
                        el.className += " map_header";

                    });
                }
            };



// Called to navigate to the main app
            $scope.startApp = function () {
                $state.go('main');
            };
            $scope.next = function () {
                $ionicSlideBoxDelegate.next();
            };
            $scope.previous = function () {
                $ionicSlideBoxDelegate.previous();
            };

            // Called each time the slide changes
            $scope.slideChanged = function (index) {
                $scope.slideIndex = index;
            };


            $scope.groups = [];
            for (var i = 0; i < 1; i++) {
                $scope.groups[i] = {
                    name: i,
                    items: [],
                    show: false
                };
                for (var j = 0; j < 3; j++) {
                    $scope.groups[i].items.push(i + '-' + j);
                }
            }

            /*
             * if given group is the selected group, deselect it
             * else, select the given group
             */
            $scope.toggleGroup = function (group) {
                group.show = !group.show;
            };
            $scope.isGroupShown = function (group) {
                return group.show;
            };

        })

        .controller('historyCtrl', function ($scope, $stateParams, $http, $rootScope, $window, $ionicLoading, Base_Url, $state, $ionicPopup, $cordovaGeolocation) {
            $http.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;';
            $rootScope.desc = "desc";
            $scope.data = {}

            $ionicLoading.show();
            if ($window.localStorage.getItem('CurrentUserInfo')) {
                $scope.user_id = JSON.parse($window.localStorage.getItem('CurrentUserInfo')).User.id;
                console.log($rootScope.userid);
                console.log($scope.user_id);
                var postData = {user_id: $scope.user_id};
                var link = Base_Url + "products/deals";
                $http.post(link, postData).then(function (res) {
                    $ionicLoading.hide();
                    $scope.response = res.data;
                    console.log($scope.response);
                    if ($scope.response.isSuccess == "true") {
                        $ionicLoading.hide();
                        $scope.Recentviewed = $scope.response.data;
                    } else {
                        $ionicLoading.hide();
                        $scope.Recentviewed = null;
                    }
                });
            } else {
                $ionicLoading.hide();
                var myPopup = $ionicPopup.show({
                    template: 'Login first to See Recent Viewed Deals',
                    scope: $scope,
                    title: 'Recent Viewed Deals',
                    cssClass: 'favoritepopup',
                    buttons: [
                        {text: 'Login',
                            onTap: function (e) {
                                $state.go('menu.signin');
                            }},
                        {text: 'Cancel',
                            onTap: function (e) {
                                myPopup.close();
                            }},
                    ]
                });
            }
            $rootScope.recentview = function (rest_id, distance) {
                $rootScope.dist = distance;
                $ionicLoading.show();
                $scope.userinfo = $window.localStorage.getItem('CurrentUserInfo');
                if ($scope.userinfo) {
                    $scope.user_id = JSON.parse($window.localStorage.getItem('CurrentUserInfo')).User.id;
                    console.log($scope.userinfo);
                    console.log($scope.user_id);
                    var postData = {
                        Restaurant: {
                            id: rest_id
                        },
                        user_id: $scope.user_id
                    }
                    var link = Base_Url + "restaurants/restaurantbyid";
                    $http.post(link, postData).then(function (res) {
                        $ionicLoading.hide();
                        $scope.response = res.data;
                        console.log($scope.response);
                        if ($scope.response.isSucess == "true") {
                            $ionicLoading.hide();
                            $scope.data.id = rest_id;
                            $http.post("http://rajdeep.crystalbiltech.com/dhdeals2/api/Times/times", $scope.data).then(function (res) {
                                console.log(res.data.data.Time);
                                $rootScope.openTiming = res.data.data.Time;
                                $rootScope.RestaurantDetail = $scope.response.data;
                                console.log($rootScope.RestaurantDetail);
                                $state.go('menu.restaurantDetails');
                            })

                        } else {
                            $ionicLoading.hide();

                        }
                    });
                } else {
                    $ionicLoading.hide();
                    var myPopup = $ionicPopup.show({
                        template: 'Login first to See the description',
                        scope: $scope,
                        buttons: [
                            {text: 'Login',
                                onTap: function (e) {
                                    $state.go('menu.signin');
                                }},
                            {text: 'Cancel',
                                onTap: function (e) {
                                    myPopup.close();
                                }},
                        ]
                    });
                }
            }

        })

        .controller('profileCtrl', function ($scope, $stateParams, $window, $rootScope, $ionicLoading, $http, $state, $ionicPopup, Base_Url) {
            $http.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;';
            $scope.retrieved = $window.localStorage.getItem('CurrentUserInfo');
            $scope.CurrentUser = JSON.parse($scope.retrieved);
            if ($scope.retrieved) {

                $scope.user_id = JSON.parse($window.localStorage.getItem('CurrentUserInfo')).User.id;
                $ionicLoading.show();
                var restdata = {user: {
                        id: $scope.user_id
                    }
                }
                //console.log(restdata);
                var link = Base_Url + 'users/user'
                $http.post(link, restdata).then(function (res) {
                    $ionicLoading.hide();
                    //console.log(res);
                    if (res.data.msg === "Success")
                    {
                        $rootScope.profile = res.data.data[0].User;
                        //console.log($rootScope.profile);
                        $window.localStorage.setItem('profileData', JSON.stringify($rootScope.profile));
                        console.log($window.localStorage.getItem('profileData'));
                    } else {
                        var myPopup = $ionicPopup.show({
                            template: 'No Data available',
                            scope: $scope,
                            buttons: [
                                {text: 'Okay',
                                    onTap: function (e) {
                                        myPopup.close();
                                    }}
                            ]
                        });
                    }
                });
            } else {
                var myPopup = $ionicPopup.show({
                    template: 'Login first to see profile',
                    scope: $scope,
                    buttons: [
                        {text: 'Okay',
                            onTap: function (e) {
                                myPopup.close();
                            }}
                    ]
                });
            }


        })


        .controller('searchCtrl', function ($scope, $stateParams, $http, $rootScope, $window, $ionicLoading, Base_Url, $state, $ionicPopup, $ionicModal, $ionicPlatform) {
            $http.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;';
            /***************** search by city name ***********************/
            $ionicPlatform.registerBackButtonAction(function (event) {
                if (true) { // your check here
//          $state.go('menu.nearestRestaurants', {reload: true});
                    //.pac-item-query
                    var myEl = angular.element(document.querySelector('.pac-item-query'));
                    myEl.hide();
                    $state.go('menu.nearestRestaurants', {reload: true});
                }
            }, 1000);
            $scope.lattitude = $stateParams.lat;
            $scope.longitude = $stateParams.long;
            $scope.autocompleteOptions = {
                componentRestrictions: {country: 'kw'},
                types: ['geocode']

            };

            $scope.$on('g-places-autocomplete:select', function (event, param) {
                delete $rootScope.apl;
                console.log(event.targetScope.model.formatted_address);
                var res = event.targetScope.model.formatted_address.replace(" ", "");
                console.log(res);
                $http.post('https://maps.googleapis.com/maps/api/geocode/json?address=(' + res + ')').success(function (rest)
                {
                    console.log(rest);
                    if (rest.status != "ZERO_RESULTS")
                    {
                        var lat = rest.results[0].geometry.location.lat;
                        var lng = rest.results[0].geometry.location.lng;
                        $state.go("menu.nearestRestaurants", {lat: lat, long: lng});
                    }
                    else
                    {
                        var confirmPopup = $ionicPopup.show({
                            title: 'Location',
                            template: "Unable to find your location",
                            buttons: [
                                {text: 'Okay',
                                    type: 'button button-login'}
                            ]
                        });
                    }

                })
            });


        })

        .controller('allsavingsCtrl', function ($scope, $stateParams, $http, $ionicLoading, Base_Url, $rootScope, $ionicPopup) {
            $http.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;';
//    $rootScope.faq = function(){
            $ionicLoading.show();
            var link = Base_Url + 'restaurants/faq';
            $http.get(link).then(function (res) {
                $ionicLoading.hide();
                console.log(res);
                $scope.response = res.data;
                if (res.data.isSuccess == "true")
                {
                    $scope.faq = $scope.response.data;

                } else {
                    var myPopup = $ionicPopup.show({
                        template: "No faq's found",
                        scope: $scope,
                        buttons: [
                            {text: 'Okay',
                                onTap: function (e) {
                                    myPopup.close();
                                }}
                        ]
                    });
                }
            });
            // }

        })

        .controller('editinfoCtrl', function ($scope, $stateParams, $http, $ionicLoading, $rootScope, $state, $ionicPopup, $window, Base_Url, $cordovaCamera) {
            $http.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;';
            $scope.data = {}
            $scope.retrieved = $window.localStorage.getItem('CurrentUserInfo');
            $scope.userid = $window.localStorage.getItem('CurrentUserInfo');
            $scope.CurrentUser = JSON.parse($scope.retrieved);
            $rootScope.profiledata = function () {

                if ($scope.retrieved) {
                    $scope.user_id = JSON.parse($window.localStorage.getItem('CurrentUserInfo')).User.id;
                    $ionicLoading.show();
                    var restdata = {user: {
                            id: $scope.user_id
                        }
                    }
                    var link = Base_Url + 'users/user'
                    $http.post(link, restdata).then(function (res) {
                        $ionicLoading.hide();
                        console.log(res);
                        if (res.data.msg === "Success")
                        {
                            console.log(res.data.data[0].User);
                            $rootScope.profile = res.data.data[0].User;
                            $scope.data.name = $rootScope.profile.name;
                            $scope.data.phone = $rootScope.profile.phone;
                        } else {
                            var myPopup = $ionicPopup.show({
                                template: 'User not found with this id',
                                scope: $scope,
                                buttons: [
                                    {text: 'Okay',
                                        onTap: function (e) {
                                            myPopup.close();
                                        }}
                                ]
                            });
                        }
                    });
                }
            }
            $rootScope.profiledata();

            /******************function for save edited value ***********************/
            $scope.editprofile = function () {

                if ($scope.retrieved) {
                    console.log($scope.data.name);
                    console.log($scope.data.phone);
                    $scope.user_id = JSON.parse($window.localStorage.getItem('CurrentUserInfo')).User.id;
                    $ionicLoading.show();
                    var restdata = {user: {
                            id: $scope.user_id,
                            name: $scope.data.name,
                            phone: $scope.data.phone
                        }
                    }
                    var link = Base_Url + 'users/editprofile';
                    $http.post(link, restdata).then(function (res) {
                        $ionicLoading.hide();
                        console.log(res);
                        if (res.data.error === 0)
                        {
                            $rootScope.profile = res.data.data.user;
                            $rootScope.profiledata();
                            var myPopup = $ionicPopup.show({
                                template: 'Profile Updated Successfully',
                                scope: $scope,
                                buttons: [
                                    {text: 'Okay',
                                        onTap: function (e) {
                                            myPopup.close();
                                        }}
                                ]
                            });
                            //$state.go('menu.profile');
                        } else {
                            var myPopup = $ionicPopup.show({
                                template: 'No Data available',
                                scope: $scope,
                                buttons: [
                                    {text: 'Okay',
                                        onTap: function (e) {
                                            myPopup.close();
                                        }}
                                ]
                            });
                        }
                    });
                } else {
                    var myPopup = $ionicPopup.show({
                        template: 'Login first to edit profile',
                        scope: $scope,
                        buttons: [
                            {text: 'Okay',
                                onTap: function (e) {
                                    myPopup.close();
                                }}
                        ]
                    });
                }
            }


            $scope.picture = function (options) {
                $rootScope.myPopup = $ionicPopup.show({
                    scope: $scope,
                    template: '<div ng-controller="editinfoCtrl" class="pop_profile"><button class="button-full icon-left ion-camera button-small" ng-click="takePicture()" style="margin-bottom:8px; background: #0F75BC; color: #fff; border:none; display:block;"> Take Picture</button><button class="button-full icon-left ion-images button-small" ng-click = "getPicture()" style="background: #0F75BC; color: #fff; border:none; display:block;"> Open Gallery</button></div>',
                    title: 'Picture',
                    buttons: [
                        {text: 'Cancel',
                            type: 'button button-login'}
                    ]
                });
            };

            $scope.takePicture = function (options) {
                $rootScope.myPopup.close();
                $scope.retrieved = $window.localStorage.getItem('CurrentUserInfo');
                $scope.CurrentUser = JSON.parse($scope.retrieved);
                if ($scope.retrieved) {
                    $scope.user_id = JSON.parse($window.localStorage.getItem('CurrentUserInfo')).User.id;
                    var options = {
                        quality: 70,
                        destinationType: Camera.DestinationType.DATA_URL,
                        sourceType: Camera.PictureSourceType.CAMERA,
                        allowEdit: true,
                        encodingType: Camera.EncodingType.JPEG,
                        targetWidth: 100,
                        targetHeight: 100,
                        popoverOptions: CameraPopoverOptions,
                        saveToPhotoAlbum: false,
                        correctOrientation: true
                    };

                    $cordovaCamera.getPicture(options).then(function (imageData) {

                        $scope.dataImg = imageData; // <--- this is your Base64 string 
                        $scope.imgUrl = imageData;
                        $scope.profiledata = {
                            user: {
                                id: $scope.user_id,
                                img: $scope.dataImg
                            }
                        };
                        $ionicLoading.show();
                        $http.post(Base_Url + 'users/saveimage', $scope.profiledata).success(function (response) {
                            $ionicLoading.hide();
                            //alert(JSON.stringify(response));
                            $rootScope.profile = response.data.User;
                            $window.localStorage.setItem('profileData', JSON.stringify(response.data[0].User));
                            $rootScope.profile_data = JSON.parse($window.localStorage.getItem('profileData'));
                            var profile_data1 = JSON.parse($window.localStorage.getItem('profileData'));
                            $rootScope.pro_image = $rootScope.profile_data.image;
                            if (response.data == true) {
                                $rootScope.myPopup = $ionicPopup.show({
                                    scope: $scope,
                                    template: 'Image uploaded successfully',
                                    buttons: [
                                        {text: 'Okay',
                                            onTap: function (e) {
                                                $rootScope.myPopup.close();
                                                $rootScope.Popup.close();
                                                //$window.location.reload();
                                            }}
                                    ]
                                });
                            }
                        })
                    }, function (err) {
                        $ionicLoading.hide();
                    });
                } else {
                    $rootScope.myPopup = $ionicPopup.show({
                        scope: $scope,
                        template: 'Login first to change profile Pic',
                        buttons: [{
                                text: 'Cancel',
                                onTap: function (e) {
                                    $rootScope.myPopup.close();
                                }
                            }]
                    });
                }
            }

            $scope.getPicture = function (options) {
                $rootScope.myPopup.close();
                $scope.retrieve = $window.localStorage.getItem('CurrentUserInfo');
                if ($scope.retrieve) {
                    $ionicLoading.show();
                    $scope.user_id = JSON.parse($window.localStorage.getItem('CurrentUserInfo')).User.id;
                    var options = {
                        quality: 70,
                        destinationType: Camera.DestinationType.DATA_URL,
                        sourceType: 0,
                        allowEdit: true,
                        encodingType: Camera.EncodingType.JPEG,
                        popoverOptions: CameraPopoverOptions,
                        saveToPhotoAlbum: false,
                        correctOrientation: true
                    };
                    $cordovaCamera.getPicture(options).then(function (imageData) {

                        $rootScope.dataImg = imageData; // <--- this is your Base64 string 
                        $rootScope.imgUrl = imageData;
                        $scope.id = JSON.parse($window.localStorage.getItem("user_id"));

                        $scope.profiledata = {
                            user: {
                                id: $scope.user_id,
                                img: $rootScope.dataImg
                            }
                        };
                        $http.post(Base_Url + 'users/saveimage', $scope.profiledata).success(function (response) {
                            $ionicLoading.hide();
                            //alert(JSON.stringify(response));
                            $rootScope.profile = response.data.User;
                            $window.localStorage.setItem('profileData', JSON.stringify(response.data[0].User));
                            $rootScope.profile_data = JSON.parse($window.localStorage.getItem('profileData'));
                            var profile_data1 = JSON.parse($window.localStorage.getItem('profileData'));
                            $rootScope.pro_image = $rootScope.profile_data.image;
                            if (response.data == true) {
                                $rootScope.myPopup = $ionicPopup.show({
                                    scope: $scope,
                                    template: 'Image uploaded successfully',
                                    buttons: [
                                        {text: 'Okay',
                                            onTap: function (e) {
                                                $rootScope.myPopup.close();
                                                $rootScope.Popup.close();
                                            }}
                                    ]
                                });

                            }
                            //$window.location.reload();
                        })
                    }, function (err) {
                        $ionicLoading.hide();
                    });
                } else {
                    $rootScope.myPopup = $ionicPopup.show({
                        scope: $scope,
                        template: 'Login first to change profile Pic',
                        buttons: [{
                                text: 'Cancel',
                                onTap: function (e) {
                                    $rootScope.myPopup.close();
                                }
                            }]
                    });
                }
            }


        })

        .controller('forgetPasswordCtrl', function ($scope, $stateParams, Base_Url, $http, $ionicLoading, $state, $ionicPopup, $window) {
            $http.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;';
            $scope.data = {}
            $scope.forgot_password = function () {
                $ionicLoading.show();
                var link = Base_Url + "users/forgetpwd";
                var postData = {User: {username: $scope.data.email}};
                $http.post(link, postData).then(function (res) {
                    $scope.response = res.data;
                    console.log($scope.response);
                    $ionicLoading.hide();
                    if ($scope.response.isSucess === "true") {
                        $window.localStorage.clear();
                        var confirmPopup = $ionicPopup.show({
                            title: 'Forgot Password',
                            template: "Check your mail to reset password",
                            cssClass: 'custombutton3 custombutton13',
                            buttons: [
                                {text: 'Okay',
                                    type: 'button button-login',
                                    onTap: function (e) {
                                        $state.go('menu.signin');
                                    }
                                }
                            ]
                        });
                    } else {
                        var confirmPopup = $ionicPopup.show({
                            title: 'Forgot Password',
                            template: "Password Not Reset",
                            cssClass: 'custombutton3 custombutton13',
                            buttons: [
                                {text: 'Okay',
                                    type: 'button button-login',
                                    onTap: function (e) {
                                        confirmPopup.close();
                                    }
                                }
                            ]
                        });
                    }
                });
            }

        })
        .controller('changepasswordCtrl', ['$scope', '$stateParams', '$window', '$rootScope', 'Base_Url', '$http', '$ionicLoading', '$state', '$ionicPopup', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
            function ($scope, $stateParams, $window, $rootScope, Base_Url, $http, $ionicLoading, $state, $ionicPopup) {
                $http.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;';
                $scope.data = {}
//    console.log($scope.data);
                $scope.userid = $window.localStorage.getItem('CurrentUserInfo');
                $scope.username = JSON.parse($window.localStorage.getItem('CurrentUserInfo')).User.username;
                console.log($scope.username);
                if ($scope.userid) {
                    $scope.changePassword = function () {
                        $ionicLoading.show();
                        var postData = {
                            User: {
                                username: $scope.username,
                                old_password: $scope.data.oldpassword,
                                new_password: $scope.data.newpassword
                            }
                        }
                        var link = Base_Url + "users/changepasswordwork";
                        $http.post(link, postData).then(function (res) {
                            $ionicLoading.hide();
                            $scope.response = res.data;
                            console.log($scope.response);
                            if ($scope.response.isSucess == "true") {
                                $ionicLoading.hide();

                                $window.localStorage.clear();
                                $window.localStorage.removeItem('CurrentUserInfo');
                                var myPopup = $ionicPopup.show({
                                    template: '<span style="text-align:center;">Password Updated Successfully</span>',
                                    scope: $scope,
                                    buttons: [
                                        {text: 'Okay',
                                            onTap: function (e) {
                                                $state.go('menu.signin');
                                            }}
                                    ]
                                });
                            } else {
                                $ionicLoading.hide();
                                var myPopup = $ionicPopup.show({
                                    template: 'Old password incorrect',
                                    scope: $scope,
                                    buttons: [
                                        {text: 'Okay',
                                            onTap: function (e) {
                                                myPopup.close();
                                            }}
                                    ]
                                });
                            }
                        });

                    }
                }

            }])
        .controller('restaurantpageCtrl', function ($scope, $stateParams, $http, $ionicLoading, $rootScope, $state, $ionicPopup, $window, Base_Url, $cordovaCamera, $cordovaSocialSharing) {
            $http.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
            $scope.resid = $stateParams.resid;
            $scope.dist = $stateParams.dist;
            $ionicLoading.show();
            if ($window.localStorage.getItem('CurrentUserInfo')) {
                $scope.user_id = JSON.parse($window.localStorage.getItem('CurrentUserInfo')).User.id;
                console.log($rootScope.userid);
                console.log($scope.user_id);

                var postData = {
                    Restaurant: {
                        id: $scope.resid
                    },
                    user_id: $scope.user_id
                }
                console.log(postData);
            } else {
                var postData = {
                    Restaurant: {
                        id: $scope.resid
                    }
                }
                console.log(postData);
            }
            var link = Base_Url + "restaurants/restaurantbyid";
            $http.post(link, postData).then(function (res) {
                $ionicLoading.hide();
                $scope.response = res.data;
                console.log($scope.response);
                if ($scope.response.isSucess == "true") {
                    $rootScope.RestaurantDetail = $scope.response.data;
                    $ionicLoading.hide();
//                        $http.post("https://www.dhdeals.nl/api/Times/times", $scope.data).then(function (res) {
//                            console.log(res.data.data.Time);
//                            $rootScope.openTiming = res.data.data.Time;
//                            $rootScope.RestaurantDetail = $scope.response.data;
//                            console.log($rootScope.RestaurantDetail.logo);
//                            $state.go('menu.restaurantDetails');
//                        })

                } else {
                    $ionicLoading.hide();

                }
            });
            $scope.invitefriends = function (name, link) {
                $cordovaSocialSharing.share("Deal of the day : ", name, "", link) // Share via native share sheet
                        .then(function (result) {
                            // Success!
                        }, function (err) {
                            // An error occured. Show a message to the user
                        });
            }

        })
