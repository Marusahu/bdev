angular.module('app.controllers', ['ui.router'])


.controller('loginCtrl', function($scope,$http,$state,$rootScope) {

      if( $rootScope.jessionid !== undefined){

        $state.go('home', { url: '/home'});
      }

      $rootScope.urlappend = "https://mybanquetbox.com";


      $scope.useremail = "";
      $scope.userpwd = "";
      $scope.loginsubmit = function (){
        console.log("opening");
        if($scope.useremail != "" && $scope.userpwd != undefined)
        {
          $http({
            method: "GET",
            url:$rootScope.urlappend+'/applogin/login',
            params: {

             email :$scope.useremail,
             password :$scope.userpwd
             // email :"dorothy@ginserv.in",
            //  password :"ginserv"

         //     email :$scope.useremail,
           //   password :$scope.userpwd


            }

          }).success(function(data, status, headers, config) {
            if(data.error == "false"){

              $rootScope.jessionid = data.JSESSIONID;
              $rootScope.hotelid = data.eanHotelId;

              $rootScope.userMasterId = data.userMasterId;
              //alert($rootScope.userMasterId);
              var pushNotification = cordova.require("pushwoosh-cordova-plugin.PushNotification");
              pushNotification.setTags({usermasterId:$rootScope.userMasterId, deviceId:10},
                function(status) {
                  console.warn('setTags success');
                },
                function(status) {
                  console.warn('setTags failed');
                }
              );


              console.log(data.eanHotelId);

              $state.go('home', { url: '/home'});}
            else{
              $scope.errormessage	= true;

            }
          }).error(function(data, status, headers, config) {

          });
        }
        else{
          $scope.errormessage	= true;

        }

      }


})


  .controller('homeCtrl', function($scope) {

  })

  .controller('leadsCtrl', function($scope,$http,$rootScope,$location,$state,$stateParams ) {

     // var sessionid = "jsessionid="+$rootScope.jessionid;
      var hotelid = $rootScope.hotelid;
      $scope.singleSelect = {
        availableOptions: [
          {id: '1', name: 'Yesterday Leads'},
          {id: '7', name: 'Last 7 days'},
          {id: '30', name: 'Last 30 days'},
          {id: '', name: 'All Leads'},
        ],
        selectedOption: {id: '', name: 'All Leads'} //This sets the default value of the select in the ui
      };

    $http({
      url: $rootScope.urlappend+'/leadsController/findAllActivity;jsessionid='+ $rootScope.jessionid,
      method: "GET",
    }).success(function (data, status, headers, config) {
      $scope.activityLi = data;
/*      $("#myActivityDrop").kendoDropDownList({
        dataTextField: "activityName",
        dataValueField: "activityId",
        dataSource: $scope.activityLi,
        optionLabel: "Select Activity",
        change: $scope.onChange,
      });

      $("#scheduledatepicker").kendoDatePicker({
        change:  $scope.onChange,

      });*/
    }).error(function (data, status, headers, config) {

    });
    $scope.onChange = function() {
      $scope.myEventStageId = "";
      if($("#myActivityDrop").val()!=null && $("#myActivityDrop").val()!=""){
        activityId = $("#myActivityDrop").val();
      }else{
        return
      }
      if($("#scheduledatepicker").val()!=null && $("#scheduledatepicker").val()!=""){
        activityDate = $("#scheduledatepicker").val();
      }else{
        return
      }
      if($scope.myServiceShortlist[0] != undefined){
        $scope.myShortlistId = $scope.myServiceShortlist[0][0];
      }else{
        alert("No shortlist available");
        return
      }


      $http({
        url: $rootScope.urlappend + '/leadsController/updateMyShortlistById;jsessionid=' + $rootScope.jessionid,
        method: "GET",
        params: {
          myEventStageId:$scope.myEventStageId,
          myShortlistId:$scope.myShortlistId,
          activityId: activityId,
          activityDate: activityDate
        }
      }).success(function (data, status, headers, config) {
        alert("Updated successfully");
      }).error(function (data, status, headers, config) {
      });
    }
    $scope.custom = true;
    // $scope.toggleCustom = function() {
    //    $scope.custom = $scope.custom === false ? true: false;
    //  };
    $scope.history = true;
    $scope.toggleHistory = function() {
      $scope.history = $scope.history === false ? true: false;
    };
    //alert($rootScope.jessionid);
    var sessionid = "jsessionid="+$rootScope.jessionid;
    var eanHotelId = $rootScope.hotelid;

    $scope.clickvenuevisit = function(){
      $http({
        url: $rootScope.urlappend+'/leadsController/changeStageOfMyShortlistAndMyEvent;'+sessionid,
        method: "GET",
        params:{
          myEventId :$scope.eventid,
        }

      }).success(function(data, status, headers, config) {
        $scope.clickgetleads($scope.eventid);
      }).error(function(data, status, headers, config) {
      });
    };
    $scope.expirelead = function(){
      if (confirm("Are you sure you want to expire?") == true) {

        $http({
          url: $rootScope.urlappend + '/leadsController/expireMyEventByEventId;' + sessionid,
          method: "GET",
          params: {
            myEventId: $scope.eventid,
          }

        }).success(function (data, status, headers, config) {
          $state.go('unactive', { url: '/unactive'});
        }).error(function (data, status, headers, config) {
        });
      } };

    $scope.dataForBooking = function(){
      $scope.myShortlistId = '';
      if( $scope.myServiceShortlist.length != 0) {
        $scope.myShortlistId = $scope.myServiceShortlist[0][0];
      }else{
        alert('No shortlist Available to book.');
        return;
      }
      $scope.showModal = true;
      $scope.arrowdisplay = true;
      $scope.showforbookingmodal = true;
      $("#eventStartDateFB").kendoDatePicker({
        value:new Date()
      });
      // $("#eventStartDateFB").bind("focus", function() {
      //   $(this).data("kendoDatePicker").open();
      // });        $scope.myShortlistId = $scope.myServiceShortlist[0][0];

      $http({
        method: "GET",
        url:$rootScope.urlappend+'/leadsController/findDataForBookingUsingMyShortlistId;'+sessionid,
        params: {
          myShortlistId :$scope.myShortlistId ,

        }

      }).success(function(data, status, headers, config) {
        var banquet = JSON.parse(data.banquetHallList);
        var vspkgServices = JSON.parse(data.vspkgServices);
        var myEvent = JSON.parse(data.myEvent);

        if(banquet != "" && banquet != null){
          $("#assetDropFB").kendoDropDownList({
            dataTextField: "name",
            dataValueField: "banquetHallId",
            dataSource: banquet,
            optionLabel: "Select Hall",
            change: $scope.checkAvailabilityForAsset,
          });
        }
        if(myEvent.myEventSessionId == "1"){
          $('#mrnFB').addClass("active");
        }else if(myEvent.myEventSessionId == "2"){
          $('#eveFB').addClass("active");
        }else if(myEvent.myEventSessionId == "3"){
          $('#fulFB').addClass("active");
        }


        $("#vspkgServiceId").val(vspkgServices.vspkgServicesId);
        $("#countFB").val(vspkgServices.publishedCount);
        $("#priceFB").val(vspkgServices.publishedPrice);
        $("#totalFB").val(vspkgServices.publishedTotal);
        $("#finalSettleFB").val(vspkgServices.publishedTotal);
        $("#propertyNameFB").html(data.propertyName);

        $("#eventNameFB").val(myEvent.eventName);


        $('#eventStartDateFB').val(new Date(myEvent.eventEndDate).toLocaleDateString());
        $("#userIdFB").val(myEvent.userMasterId.userMasterId);
        $("#userNameFB").val(myEvent.userMasterId.username);
        $("#userEmailAddressFB").val(myEvent.userMasterId.emailaddress);
        $("#mobileNumFB").val(myEvent.userMasterId.mobileNo);





      }).error(function(data, status, headers, config) {

      });
    }
    $scope.checkAvailabilityForAsset = function(){
      var assetId = "";
      if($("#assetDropFB").val()!=null && $("#assetDropFB").val()!=""){
        assetId = $("#assetDropFB").val();
      }
      var eventDate = $("#eventStartDateFB").val();

      if( $('#mrnFB').hasClass("active")){
        var session = 1;
      }else if($('#eveFB').hasClass("active")){
        var session = 2;
      }else if($('#fulFB').hasClass("active")){
        var session = 3;
      }
      $scope.hideBookingButton();
      if(assetId!=""){


        $http({
          method: "GET",
          url:$rootScope.urlappend+'/calendarController/checkAvailabilityForAsset;'+sessionid,
          params: {
            assetId:assetId,
            session:session,
            eventDate:eventDate,

          }

        }).success(function(data, status, headers, config) {
          if(data.error == "false"){

            $("#hallStatus").html("Hall Available");
            //  $scope.bookButton = false;
            $('#bookbutton').show();
          }else{
            $("#hallStatus").html(data.message);
          }


        }).error(function(data, status, headers, config) {
          alert("Error while checking availability");
        });



      }else{
        alert("Please select the asset!!!!");
      }

    };
    $scope.hideBookingButton = function(){

      $('#bookbutton').hide();

    }

    $scope.multiplyfn = function(){
      var count = $("#countFB").val();
      var price = $("#priceFB").val();

      var total = count*price;
      $("#totalFB").val(total);

      /*var advance = 0;
       if($("#advanceReceivedFB").val()!=null && $("#advanceReceivedFB").val()!=undefined){
       advance = $("#advanceReceivedFB").val();
       }

       $("#pendingPaymentFB").val(total-advance); */
      $scope.calculateFinalSettlement();
    }


    $scope.calculateFinalSettlement =  function(){
      var total = 0;
      var pending = 0;
      var advance = 0;
      if($("#advanceReceivedFB").val()!="" && $("#advanceReceivedFB").val()!=null && $("#advanceReceivedFB").val()!=undefined){
        advance = parseInt($("#advanceReceivedFB").val());
      }
      if($("#pendingPaymentFB").val()!="" && $("#pendingPaymentFB").val()!=null && $("#pendingPaymentFB").val()!=undefined){
        pending = parseInt($("#pendingPaymentFB").val());
      }
      if($("#totalFB").val()!="" && $("#totalFB").val()!=null && $("#totalFB").val()!=undefined){
        total = parseInt($("#totalFB").val());
      }
      $("#finalSettleFB").val(total-(advance+pending));
    }


    $scope.bookingLogic = function(bookingStatusFromAvenues){

      if( $('#mrnFB').hasClass("active")){
        var session = 1;
        var leadsession = 1;
      }else if($('#eveFB').hasClass("active")){
        var session = 2;
      }else if($('#fulFB').hasClass("active")){
        var session = 3;
      }

      //  var str =  $('input[type=radio][name=myRadioSelect]:checked').attr('id');
      $scope.myShortlistId = $scope.myServiceShortlist[0][0];
//var shorlll= $scope.leads[0][0];
      //  $scope.myEventId =$scope.myEvent.myEventId;
      if(($scope.myShortlistId == undefined)|| ($scope.myShortlistId==" ")){

        alert('please select any shortlists to book');
        return;
      }
      else{
        // myShortlistId);
      }
      // var ret = str.split("myRadioSelect");
      // var str2 = ret[1];
      // var myShortlistId = $("input:radio[name=myRadioSelect]:checked").val();
      var myShortlistId = $scope.myServiceShortlist[0][0];

      var email  = $("#userEmailAddressFB").val();
      var mobilenumber = $("#mobileNumFB").val();
      var eventDate = $("#eventStartDateFB").val();
      var eventDateTo= $("#eventStartDateFB").val();
      var primaryServiceId=3673;
      var otherServices= $scope.myServiceShortlist[0][11]+"+"+$("#guestCount1").val();
      var buyerComment="";
      var anyWhereBooking ="";
      var partnerid = 1;
      var modifiedStatus=0;
      var host=(window.location.hostname);
      var fromSpot = "Yes";
      var serviceId = $scope.myServiceShortlist[0][11]

      var bookingStatusFromAvenues=bookingStatusFromAvenues;
      var assetId = $("#assetDropFB").val();

      var singleDayEvent = "yes" ;

      var capacity = $("#countFB").val();

      $http({
        method: "GET",
        url:$rootScope.urlappend+'/leadsController/findSlotTimingsForSession;jsessionid=' + $rootScope.jessionid,
        params: {
          session:session,
          fromSpot:fromSpot,
          host:host,
          partnerid:partnerid,
          anyWhereBooking:anyWhereBooking,
          primaryServiceId:primaryServiceId,
          otherServices:otherServices,
          buyerComment:buyerComment,
          modifiedStatus:modifiedStatus,
          eventDate:eventDate,
          eventDateTo:eventDateTo,
          capacity:capacity,
          email:email,
          mobilenumber:mobilenumber,
          singleDayEvent:singleDayEvent,
          myShortlistId:myShortlistId,
          bookingStatusFromAvenues:bookingStatusFromAvenues,
          assetId:assetId,
        }

      }).success(function(data, status, headers, config) {
        if(data.error=="false"){
          // alert(data.bookingId);
          var myEventId = $("#myEventId").val();

          var eventName = $("#eventNameFB").val();
          var buyerName = $("#userNameFB").val();
          var bookingCount = $("#countFB").val();
          var bookingPrice = $("#priceFB").val();
          var bookingTotal = $("#totalFB").val();

          var advanceReceived = $("#advanceReceivedFB").val();
          var pendingPayment = $("#pendingPaymentFB").val();

          var bookingId = data.bookingId;


          $http({
            method: "GET",
            url:$rootScope.urlappend+'/leadsController/updateBookingDetails;jsessionid=' + $rootScope.jessionid,
            params: {
              myEventId:myEventId,
              eventName:eventName,
              buyerName:buyerName,
              bookingCount:bookingCount,
              bookingPrice:bookingPrice,
              bookingTotal:bookingTotal,
              advanceReceived:advanceReceived,
              eventDate:eventDate,
              session:session,
              bookingId:bookingId,
              pendingPayment:pendingPayment,
              bookingStatusFromAvenues:bookingStatusFromAvenues
            }

          }).success(function(data, status, headers, config) {
            if(data.error == "false"){
              $http({
                method: "GET",
                url:$rootScope.urlappend+'/leadsController/changeStatusOfEventShortlistAfterBooking;jsessionid=' + $rootScope.jessionid,
                params: {
                  myEventId:myEventId,
                  myShortlistId:myShortlistId,
                }

              }).success(function(data, status, headers, config) {
                if(bookingId!=null && bookingId!=undefined && bookingId!=""){


                  $scope.bookingId =bookingId;


                  $http({

                    url:$rootScope.urlappend+'/booking/findBookingForSellerResponse;'+sessionid,
                    method: "GET",
                    params: {
                      bookingId :$scope.bookingId,
                    }

                  }).success(function(data, status, headers, config) {
                    $scope.bookinglistavaible = true;
                    $scope.saravana = data;
                    $scope.book = JSON.parse(data.RESULT[0].booking);
                    $scope.booking = JSON.parse(data.RESULT[0].bookingVspackage);
                    $scope.bookingId = $scope.booking.bookingId.bookingId

                  }).error(function(data, status, headers, config) {

                  });




                  // alert(bookingId);
                  // $state.go('booking', { url: '/booking?id='+bookingId});
                  //   $rootScope.getbookingdetailslist(bookingId);
                  // var string_url = $rootScope.urlappend+"/booking;jsessionid="+$rootScope.jessionid+"?id="+bookingId;
                  // window.location.assign(string_url);
                }

              }).error(function(data, status, headers, config) {
                alert(data.message);
              });




            }else{
              alert(data.message);
            }
          }).error(function(data, status, headers, config) {
            alert(data.message);

          });




        }else{
          alert(data.message);
        }


      }).error(function(data, status, headers, config) {
        alert("Problem while getting slot timing");
      });



    }








//$scope.urlappend = "http://localhost:8080/avenues;"+$rootScope.jsessionid;

    $scope.allfunctionsingleeventype = function (){


      $http({
        method: "GET",
        url:$rootScope.urlappend+'/leadsController/findAllMyEventStage;'+sessionid,

      }).success(function(data, status, headers, config) {

        $scope.eventstageDataSource =  data;


      }).error(function(data, status, headers, config) {

      });
      $http({
        method: "GET",
        url:$rootScope.urlappend+'/leadsController/findAllSource;'+sessionid,

      }).success(function(data, status, headers, config) {

        $scope.eventsourceDataSource =  data;


      }).error(function(data, status, headers, config) {

      });

    };

    $rootScope.leadsfordays = function(input){
      if(input != undefined){
        $scope.sortByEventCreated = input;

      }

      else{
        //alert($scope.singleSelect.selectedOption.id);
        $scope.sortByEventCreated = $scope.singleSelect.selectedOption.id;
      }
      /*if(myEventStageDrop) {
       $scope.myEventStageDrop=3;
       }else{
       $scope.myEventStageDrop="";
       } */
      $scope.myEventStageDrop ="";

      $http({

        url: $rootScope.urlappend+'/leadsController/findAllLeadsForSellerByFilter;'+sessionid+'?EANHotelID='+hotelid+'&sortByEventCreated='+$scope.sortByEventCreated+'&myEventStageDrop='+$scope.myEventStageDrop,  /* +'&myEventStageDrop='+$scope.myEventStageDrop */
        method: "GET",
        /*	params:{
         myEventStageDrop=3
         } */

      }).success(function(data, status, headers, config) {
        //alert(data[0].myEventId);

        $scope.headers = ["Id", "Name", "Count"];
        $scope.listleadsdays = data;
        $scope.listleadsdays.sort(function(obj1, obj2) {
          // Ascending: first age less than the previous
          return obj2.myEventId - obj1.myEventId;
        });
        $rootScope.alleadprev = $scope.listleadsdays;


      }).error(function(data, status, headers, config) {
        // $scope.status = status;
      });


    };



    $scope.leadsfordays("");







/*  $scope.allleadslistcall = function(input){
 var date = new Date();
 var currentMonth = date.getMonth();
 var currentDate = date.getDate();
 var currentYear = date.getFullYear();
 $("#eventDatenew").kendoDatePicker({

 min: new Date(currentYear, currentMonth, currentDate)
 });

 $("#eventDate").bind("focus", function() {
 $(this).data("kendoDatePicker").open();
 });

 if(angular.isUndefined(input) || input === null){
 $scope.hotelid = eanHotelId;
 //alert(	$scope.hotelid)
 }
 else{
 //  alert($scope.hotelid);
 $scope.hotelid = eanHotelId;
 }
 $scope.myEventStatus = "2";
 $http({
 async : true,
 cache : false,
 url: $rootScope.urlappend+"/leadsController/findAllLeadsForSellerByFilter;"+sessionid,
 method: "GET",
 params:{
 EANHotelID :$scope.hotelid,
 myEventStatus: $scope.myEventStatus,
 }

 }).success(function(data, status, headers, config) {

 if (angular.isUndefined(data) || data == null || data == "") {
 alert("No Leads Available");


 }
 else{

 $scope.finallmarket = data;
 $scope.finallmarket.sort(function(obj1, obj2) {

 return obj2.myEventId - obj1.myEventId;
 });

 $scope.clickgetleads($scope.finallmarket[0].myEventId);
 $scope.count = 0;

 }


 }).error(function(data, status, headers, config) {

 });

 }; */

    $scope.clickgetleads = function(input){
      $scope.eventid =input;

      $scope.hotelid = "";
      $http({

        url:$rootScope.urlappend+'/leadsController/findMyEventByEventId;jsessionid='+$rootScope.jessionid,
        method: "GET",
        params: {
          myEventId :$scope.eventid,
          hotelId: $scope.eanHotelId
        }

      }).success(function(data, status, headers, config) {

        //$scope.leads = data;
        $rootScope.myEvent = JSON.parse(data.myEventInfo);
        $rootScope.myEventIdForImageUpload=$rootScope.myEvent.myEventId;
        $scope.myServiceShortlist = JSON.parse(data.myServiceShortlist);
        $scope.myPropertyShortlist = JSON.parse(data.myPropertyShortlist);
        $rootScope.myEventId = $scope.myEvent.myEventId;
        if($scope.myEvent.myEventSessionId == 1){
          $scope.sessiondisplay = "Morning"
        }else if ($scope.myEvent.myEventSessionId == 2){
          $scope.sessiondisplay = "Evening"
        }else if ($scope.myEvent.myEventSessionId == 3){
          $scope.sessiondisplay = "Full-day"
        }
        //  $("#1, #2, #3").removeClass("active")
        if($scope.myEvent.myEventStageId== 1){
          //  $("#1").addClass("active");
          $scope.displaystatus = "Unattended";
        }else if($scope.myEvent.myEventStageId== 2){
          // $("#2").addClass("active");
          $scope.displaystatus = "Connected";
        }else{
          //  $("#3").addClass("active");
          $scope.displaystatus = "Visited";
        }
        $scope.colorChange = [];
        if($scope.myEvent.myEventStageId == 1 ){
          $scope.colorChange.push('red');
        }
        else{
          $scope.colorChange.push('blue');
        }
        $scope.myEvent.eventEndDate = (new Date($scope.myEvent.eventEndDate).toLocaleDateString());

        //$("#myEventSource").val($scope.leads[0][17]);
        //$scope.myEventSourceData.value($scope.leads[0][17]);

      }).error(function(data, status, headers, config) {

      });
    };

    if($stateParams.id == undefined){
      $scope.allfunctionsingleeventype();

      // $scope.selectPropertyDrop = $('#selectPropertyDrop').val();
      // $scope.allleadslistcall($scope.selectPropertyDrop);
      $scope.prevnedddddd =true;
      $scope.progress = true;

      $scope.prevneddddddnew = false;

    }

    else{
      //alert($stateParams.id);
      $scope.clickgetleads($stateParams.id);
      $scope.prevnedddddd =false;



      $scope.prevneddddddnew = true;
      $scope.countnew = parseInt($stateParams.index)-1;
      // alert( $rootScope.alleadprev[2].myEventId);

      /*  $scope.allfunctionsingleeventype();

       $scope.selectPropertyDrop = $('#selectPropertyDrop').val();
       $scope.allleadslistcall($scope.selectPropertyDrop);
       $scope.prevnedddddd =true;
       $scope.progress = true; */

      $scope.prevclickbuttonnew = function(input){



        if(parseInt($scope.countnew) != 0){
          // $scope.allfunctionsingleeventype();
          // $rootScope.alleadprev[2].myEventId
          $scope.clickgetleads($rootScope.alleadprev[parseInt($scope.countnew)-1].myEventId);
          $scope.countnew = parseInt($scope.countnew)-1;
        }
        // $scope.allfunctionsingleeventype();

      };
      $scope.nextcliekbuttonnew = function(input){



        if(parseInt($scope.countnew) < $rootScope.alleadprev.length-1 ){
          // $scope.allfunctionsingleeventype();
          $scope.clickgetleads($rootScope.alleadprev[parseInt($scope.countnew)+1].myEventId);
          $scope.countnew = parseInt($scope.countnew)+1;

        }


      };
    }




    /*$scope.eventid = input;*/
    // $scope.allleadslistcall();





    // alert($scope.FullTotal);
    $scope.minmaxcheck = function (input){

      //var input1 = element(by.model('FullTotal'));

      if($scope.bookinglist.bookingId.bookingTotalPrice <= $scope.bookinglist.bookingId.publishedTotalPrice)
      {
        $scope.errormax = false;

      }
      else{

        $scope.errormax = true;
      }
      //alert($scope.newfulltotal);

    };


    $scope.histroy = function(input){

      $scope.myShortlistId = input;

      $http({

        url:$rootScope.urlappend+'/leadsController/viewExotelUrlForMyShortlist',
        method: "GET",
        params: {
          myShortlistId :$scope.myShortlistId,

        }

      }).success(function(data, status, headers, config) {

        $scope.recordlist = data;


      }).error(function(data, status, headers, config) {

      });




    }

    $scope.prevclickbutton = function(input){



      if(parseInt($scope.count) != 0){
        // $scope.allfunctionsingleeventype();
        $scope.clickgetleads($scope.finallmarket[parseInt($scope.count)-1].myEventId);
        $scope.count = parseInt($scope.count)-1;
      }
      // $scope.allfunctionsingleeventype();

    };
    $scope.nextcliekbutton = function(input){



      if(parseInt($scope.count) < $scope.finallmarket.length-1 ){
        // $scope.allfunctionsingleeventype();
        $scope.clickgetleads($scope.finallmarket[parseInt($scope.count)+1].myEventId);
        $scope.count = parseInt($scope.count)+1;

      }


    };

//david
    $scope.addSellerCallBuyer = function(myEventId){
//alert("phonenumber");
      $http({

        url:$rootScope.urlappend+'/leadsController/addServiceToMyShortlist;'+sessionid,
        method: "GET",
        params: {
          myEventId :myEventId ,

        }

      }).success(function(data, status, headers, config) {
        //alert();

      }).error(function(data, status, headers, config) {

      });

    }


    $scope.phoneCall = function(myEventId){
//alert(myEventId);
//alert("phonenumber");
      $http({

        url:$rootScope.urlappend+'/leadsController/setSellerCallingBuyerNumber;'+sessionid,
        method: "GET",
        params: {
          myEventId :myEventId ,

        }

      }).success(function(data, status, headers, config) {
        //alert();

      }).error(function(data, status, headers, config) {

      });

    }
    $scope.addServiceToMyShortlist = function(vspkgserviceId,myEventId){
      if (confirm("Do you want to send quote") == true) {
        $http({

          url:$rootScope.urlappend+'/leadsController/addServiceToMyShortlist;'+sessionid,
          method: "GET",
          params: {
            vspkgserviceId :vspkgserviceId,
            myEventId :myEventId ,

          }

        }).success(function(data, status, headers, config) {
          if(data!=null){
            $scope.clickgetleads(myEventId);
          }else{
            alert("failed to shortlist");
          }


        }).error(function(data, status, headers, config) {

        });

      }}
//$scope.addServiceToMyShortlist();
    $scope.addone = function(input){



      $http({

        url:$rootScope.urlappend+'/leadsController/findOriginalActiveMasterServiceForProperty;'+sessionid,
        method: "GET",
        params: {
          eanhotelId :$rootScope.hotelid ,

        }

      }).success(function(data, status, headers, config) {

        //alert(data);
        $scope.leadmsforprop = data;

      }).error(function(data, status, headers, config) {

      });





    }
    $scope.addone();
    $scope.sendbrochureformyevent = function(){
      if (confirm("Do you want to send brochure?") == true) {

        //$scope.myEventId =$scope.myEvent.myEventId;

        $http({

          url:$rootScope.urlappend+'/leadsController/sendBrochureForMyEvent;jsessionid='+$rootScope.jessionid,
          method: "GET",
          params: {
            //  eanhotelId: $rootScope.hotelid,
            myEventId :$rootScope.myEventId

          }

        }).success(function(data, status, headers, config) {
          if(data != null ){
            if(data.result == undefined){
              alert("Brochure sent successfully!!")
            }else{
              alert(data.result);
            }

          }else{
            alert("Brochure  not sent" );

          }

        }).error(function(data, status, headers, config) {
          // alert('failure');
        });

      }}
    $scope.sendAddressForMyEvent = function(){
      if (confirm("Do you want to send address?") == true) {
        $scope.eanhotelId ="";
        $scope.myEventId =$scope.myEvent.myEventId;

        $http({

          url:$rootScope.urlappend+'/leadsController/sendAddressForMyEvent;'+sessionid,
          method: "GET",
          params: {
            eanhotelId: $rootScope.hotelid,
            myEventId :$scope.myEventId ,

          }

        }).success(function(data, status, headers, config) {
          //alert('success');

        }).error(function(data, status, headers, config) {
          // alert('failure');
        });

      }}
    $scope.qualifier = function(){
      if (confirm("Do you want to send qualifier?") == true) {
        $scope.eanhotelId ="";
        $scope.myEventId =$scope.myEvent.myEventId;

        $http({

          url:$rootScope.urlappend+'/leadsController/sendQualifierForMyEvent;'+sessionid,
          method: "GET",
          params: {
            eanhotelId: $rootScope.hotelid,
            myEventId :$scope.myEventId ,

          }

        }).success(function(data, status, headers, config) {
          //alert('success');

        }).error(function(data, status, headers, config) {
          // alert('failure');
        });

      }}
    $scope.expireMyShortlist = function(){

      if (confirm("confirm regret?") == true) {
//alert($scope.leads[0][0]);
        $scope.myShortlistId = $scope.myServiceShortlist[0].myShortlistId;
//var shorlll= $scope.leads[0][0];
        $scope.myEventId =$scope.myEvent.myEventId;
        //  alert($scope.myEventId);
        $http({

          url:$rootScope.urlappend+'/leadsController/sendRegretForMyEvent;'+sessionid,
          method: "GET",
          params: {
            //   eanhotelId: $rootScope.hotelid,
            myEventId :$scope.myEventId ,
            //myShortlistId: $scope.myShortlistId,
          }

        }).success(function(data, status, headers, config) {
          $state.go('unactive', { url: '/unactive'});
          //$scope.clickgetleads($scope.myEventId);
          //alert('success');

        }).error(function(data, status, headers, config) {
          // alert('failure');
        });
        //	$scope.showmyShortlistBlockIdshorlll=true;
      }}

  })

.controller('leadDetailCtrl', function($scope,$http,$rootScope,$location,$state, $stateParams) {

      $http({
        url: $rootScope.urlappend + '/leadsController/findAllActivity;jsessionid=' + $rootScope.jessionid,
        method: "GET",
      }).success(function (data, status, headers, config) {
        $scope.activityLi = data;


       /* commented out on 25mar. trying to avoid kendo usage in this app. James

       $("#myActivityDrop").kendoDropDownList({
          dataTextField: "activityName",
          dataValueField: "activityId",
          dataSource: $scope.activityLi,
          optionLabel: "Select Activity",
          change: $scope.onChange,
        });

        $("#scheduledatepicker").kendoDatePicker({
          change:  $scope.onChange,

        });*/
      }).error(function (data, status, headers, config) {

      });
      $scope.onChange = function() {
        $scope.myEventStageId = "";
        if($("#myActivityDrop").val()!=null && $("#myActivityDrop").val()!=""){
          activityId = $("#myActivityDrop").val();
        }else{
          return
        }
        if($("#scheduledatepicker").val()!=null && $("#scheduledatepicker").val()!=""){
          activityDate = $("#scheduledatepicker").val();
        }else{
          return
        }
        if($scope.myServiceShortlist[0] != undefined){
          $scope.myShortlistId = $scope.myServiceShortlist[0][0];
        }else{
          alert("No shortlist available");
          return
        }


        $http({
          url: $rootScope.urlappend + '/leadsController/updateMyShortlistById;jsessionid=' + $rootScope.jessionid,
          method: "GET",
          params: {
            myEventStageId:$scope.myEventStageId,
            myShortlistId:$scope.myShortlistId,
            activityId: activityId,
            activityDate: activityDate
          }
        }).success(function (data, status, headers, config) {
          alert("Updated successfully");
        }).error(function (data, status, headers, config) {
        });
      }
      $scope.custom = true;
      // $scope.toggleCustom = function() {
      //    $scope.custom = $scope.custom === false ? true: false;
      //  };
      $scope.history = true;
      $scope.toggleHistory = function() {
        $scope.history = $scope.history === false ? true: false;
      };
      //alert($rootScope.jessionid);
      var sessionid = "jsessionid="+$rootScope.jessionid;
      var eanHotelId = $rootScope.hotelid;

      $scope.clickvenuevisit = function(){
        $http({
          url: $rootScope.urlappend+'/leadsController/changeStageOfMyShortlistAndMyEvent;'+sessionid,
          method: "GET",
          params:{
            myEventId :$scope.eventid,
          }

        }).success(function(data, status, headers, config) {
          $scope.clickgetleads($scope.eventid);
        }).error(function(data, status, headers, config) {
        });
      };
      $scope.expirelead = function(){
        if (confirm("Are you sure you want to expire?") == true) {

          $http({
            url: $rootScope.urlappend + '/leadsController/expireMyEventByEventId;' + sessionid,
            method: "GET",
            params: {
              myEventId: $scope.eventid,
            }

          }).success(function (data, status, headers, config) {
            $state.go('unactive', { url: '/unactive'});
          }).error(function (data, status, headers, config) {
          });
        } };

      $scope.dataForBooking = function(){
        $scope.myShortlistId = '';
        if( $scope.myServiceShortlist.length != 0) {
          $scope.myShortlistId = $scope.myServiceShortlist[0][0];
        }else{
          alert('No shortlist Available to book.');
          return;
        }
        $scope.showModal = true;
        $scope.arrowdisplay = true;
        $scope.showforbookingmodal = true;
        $("#eventStartDateFB").kendoDatePicker({
          value:new Date()
        });
        // $("#eventStartDateFB").bind("focus", function() {
        //   $(this).data("kendoDatePicker").open();
        // });        $scope.myShortlistId = $scope.myServiceShortlist[0][0];

        $http({
          method: "GET",
          url:$rootScope.urlappend+'/leadsController/findDataForBookingUsingMyShortlistId;'+sessionid,
          params: {
            myShortlistId :$scope.myShortlistId ,

          }

        }).success(function(data, status, headers, config) {
          var banquet = JSON.parse(data.banquetHallList);
          var vspkgServices = JSON.parse(data.vspkgServices);
          var myEvent = JSON.parse(data.myEvent);

          if(banquet != "" && banquet != null){
            $("#assetDropFB").kendoDropDownList({
              dataTextField: "name",
              dataValueField: "banquetHallId",
              dataSource: banquet,
              optionLabel: "Select Hall",
              change: $scope.checkAvailabilityForAsset,
            });
          }
          if(myEvent.myEventSessionId == "1"){
            $('#mrnFB').addClass("active");
          }else if(myEvent.myEventSessionId == "2"){
            $('#eveFB').addClass("active");
          }else if(myEvent.myEventSessionId == "3"){
            $('#fulFB').addClass("active");
          }


          $("#vspkgServiceId").val(vspkgServices.vspkgServicesId);
          $("#countFB").val(vspkgServices.publishedCount);
          $("#priceFB").val(vspkgServices.publishedPrice);
          $("#totalFB").val(vspkgServices.publishedTotal);
          $("#finalSettleFB").val(vspkgServices.publishedTotal);
          $("#propertyNameFB").html(data.propertyName);

          $("#eventNameFB").val(myEvent.eventName);


          $('#eventStartDateFB').val(new Date(myEvent.eventEndDate).toLocaleDateString());
          $("#userIdFB").val(myEvent.userMasterId.userMasterId);
          $("#userNameFB").val(myEvent.userMasterId.username);
          $("#userEmailAddressFB").val(myEvent.userMasterId.emailaddress);
          $("#mobileNumFB").val(myEvent.userMasterId.mobileNo);





        }).error(function(data, status, headers, config) {

        });
      }
      $scope.checkAvailabilityForAsset = function(){
        var assetId = "";
        if($("#assetDropFB").val()!=null && $("#assetDropFB").val()!=""){
          assetId = $("#assetDropFB").val();
        }
        var eventDate = $("#eventStartDateFB").val();

        if( $('#mrnFB').hasClass("active")){
          var session = 1;
        }else if($('#eveFB').hasClass("active")){
          var session = 2;
        }else if($('#fulFB').hasClass("active")){
          var session = 3;
        }
        $scope.hideBookingButton();
        if(assetId!=""){


          $http({
            method: "GET",
            url:$rootScope.urlappend+'/calendarController/checkAvailabilityForAsset;'+sessionid,
            params: {
              assetId:assetId,
              session:session,
              eventDate:eventDate,

            }

          }).success(function(data, status, headers, config) {
            if(data.error == "false"){

              $("#hallStatus").html("Hall Available");
              //  $scope.bookButton = false;
              $('#bookbutton').show();
            }else{
              $("#hallStatus").html(data.message);
            }


          }).error(function(data, status, headers, config) {
            alert("Error while checking availability");
          });



        }else{
          alert("Please select the asset!!!!");
        }

      };
      $scope.hideBookingButton = function(){

        $('#bookbutton').hide();

      }

      $scope.multiplyfn = function(){
        var count = $("#countFB").val();
        var price = $("#priceFB").val();

        var total = count*price;
        $("#totalFB").val(total);

        /*var advance = 0;
         if($("#advanceReceivedFB").val()!=null && $("#advanceReceivedFB").val()!=undefined){
         advance = $("#advanceReceivedFB").val();
         }

         $("#pendingPaymentFB").val(total-advance); */
        $scope.calculateFinalSettlement();
      }


      $scope.calculateFinalSettlement =  function(){
        var total = 0;
        var pending = 0;
        var advance = 0;
        if($("#advanceReceivedFB").val()!="" && $("#advanceReceivedFB").val()!=null && $("#advanceReceivedFB").val()!=undefined){
          advance = parseInt($("#advanceReceivedFB").val());
        }
        if($("#pendingPaymentFB").val()!="" && $("#pendingPaymentFB").val()!=null && $("#pendingPaymentFB").val()!=undefined){
          pending = parseInt($("#pendingPaymentFB").val());
        }
        if($("#totalFB").val()!="" && $("#totalFB").val()!=null && $("#totalFB").val()!=undefined){
          total = parseInt($("#totalFB").val());
        }
        $("#finalSettleFB").val(total-(advance+pending));
      }


      $scope.bookingLogic = function(bookingStatusFromAvenues){

        if( $('#mrnFB').hasClass("active")){
          var session = 1;
        }else if($('#eveFB').hasClass("active")){
          var session = 2;
        }else if($('#fulFB').hasClass("active")){
          var session = 3;
        }

        //  var str =  $('input[type=radio][name=myRadioSelect]:checked').attr('id');
        $scope.myShortlistId = $scope.myServiceShortlist[0][0];
//var shorlll= $scope.leads[0][0];
        //  $scope.myEventId =$scope.myEvent.myEventId;
        if(($scope.myShortlistId == undefined)|| ($scope.myShortlistId==" ")){

          alert('please select any shortlists to book');
          return;
        }
        else{
          // myShortlistId);
        }
        // var ret = str.split("myRadioSelect");
        // var str2 = ret[1];
        // var myShortlistId = $("input:radio[name=myRadioSelect]:checked").val();
        var myShortlistId = $scope.myServiceShortlist[0][0];

        var email  = $("#userEmailAddressFB").val();
        var mobilenumber = $("#mobileNumFB").val();
        var eventDate = $("#eventStartDateFB").val();
        var eventDateTo= $("#eventStartDateFB").val();
        var primaryServiceId=3673;
        var otherServices= $scope.myServiceShortlist[0][11]+"+"+$("#guestCount1").val();
        var buyerComment="";
        var anyWhereBooking ="";
        var partnerid = 1;
        var modifiedStatus=0;
        var host=(window.location.hostname);
        var fromSpot = "Yes";
        var serviceId = $scope.myServiceShortlist[0][11]

        var bookingStatusFromAvenues=bookingStatusFromAvenues;
        var assetId = $("#assetDropFB").val();

        var singleDayEvent = "yes" ;

        var capacity = $("#countFB").val();

        $http({
          method: "GET",
          url:$rootScope.urlappend+'/leadsController/findSlotTimingsForSession;jsessionid=' + $rootScope.jessionid,
          params: {
            session:session,
            fromSpot:fromSpot,
            host:host,
            partnerid:partnerid,
            anyWhereBooking:anyWhereBooking,
            primaryServiceId:primaryServiceId,
            otherServices:otherServices,
            buyerComment:buyerComment,
            modifiedStatus:modifiedStatus,
            eventDate:eventDate,
            eventDateTo:eventDateTo,
            capacity:capacity,
            email:email,
            mobilenumber:mobilenumber,
            singleDayEvent:singleDayEvent,
            myShortlistId:myShortlistId,
            bookingStatusFromAvenues:bookingStatusFromAvenues,
            assetId:assetId,
          }

        }).success(function(data, status, headers, config) {
          if(data.error=="false"){
            // alert(data.bookingId);
            var myEventId = $("#myEventId").val();

            var eventName = $("#eventNameFB").val();
            var buyerName = $("#userNameFB").val();
            var bookingCount = $("#countFB").val();
            var bookingPrice = $("#priceFB").val();
            var bookingTotal = $("#totalFB").val();

            var advanceReceived = $("#advanceReceivedFB").val();
            var pendingPayment = $("#pendingPaymentFB").val();

            var bookingId = data.bookingId;


            $http({
              method: "GET",
              url:$rootScope.urlappend+'/leadsController/updateBookingDetails;jsessionid=' + $rootScope.jessionid,
              params: {
                myEventId:myEventId,
                eventName:eventName,
                buyerName:buyerName,
                bookingCount:bookingCount,
                bookingPrice:bookingPrice,
                bookingTotal:bookingTotal,
                advanceReceived:advanceReceived,
                eventDate:eventDate,
                session:session,
                bookingId:bookingId,
                pendingPayment:pendingPayment,
                bookingStatusFromAvenues:bookingStatusFromAvenues
              }

            }).success(function(data, status, headers, config) {
              if(data.error == "false"){
                $http({
                  method: "GET",
                  url:$rootScope.urlappend+'/leadsController/changeStatusOfEventShortlistAfterBooking;jsessionid=' + $rootScope.jessionid,
                  params: {
                    myEventId:myEventId,
                    myShortlistId:myShortlistId,
                  }

                }).success(function(data, status, headers, config) {
                  if(bookingId!=null && bookingId!=undefined && bookingId!=""){


                    $scope.bookingId =bookingId;


                    $http({

                      url:$rootScope.urlappend+'/booking/findBookingForSellerResponse;'+sessionid,
                      method: "GET",
                      params: {
                        bookingId :$scope.bookingId,
                      }

                    }).success(function(data, status, headers, config) {
                      $scope.bookinglistavaible = true;
                      $scope.saravana = data;
                      $scope.book = JSON.parse(data.RESULT[0].booking);
                      $scope.booking = JSON.parse(data.RESULT[0].bookingVspackage);
                      $scope.bookingId = $scope.booking.bookingId.bookingId

                    }).error(function(data, status, headers, config) {

                    });




                    // alert(bookingId);
                    // $state.go('booking', { url: '/booking?id='+bookingId});
                    //   $rootScope.getbookingdetailslist(bookingId);
                    // var string_url = $rootScope.urlappend+"/booking;jsessionid="+$rootScope.jessionid+"?id="+bookingId;
                    // window.location.assign(string_url);
                  }

                }).error(function(data, status, headers, config) {
                  alert(data.message);
                });




              }else{
                alert(data.message);
              }
            }).error(function(data, status, headers, config) {
              alert(data.message);

            });




          }else{
            alert(data.message);
          }


        }).error(function(data, status, headers, config) {
          alert("Problem while getting slot timing");
        });



      }








//$scope.urlappend = "http://localhost:8080/avenues;"+$rootScope.jsessionid;

      $scope.allfunctionsingleeventype = function (){


        $http({
          method: "GET",
          url:$rootScope.urlappend+'/leadsController/findAllMyEventStage;'+sessionid,

        }).success(function(data, status, headers, config) {

          $scope.eventstageDataSource =  data;


        }).error(function(data, status, headers, config) {

        });
        $http({
          method: "GET",
          url:$rootScope.urlappend+'/leadsController/findAllSource;'+sessionid,

        }).success(function(data, status, headers, config) {

          $scope.eventsourceDataSource =  data;


        }).error(function(data, status, headers, config) {

        });

      };
      /*  $scope.allleadslistcall = function(input){
       var date = new Date();
       var currentMonth = date.getMonth();
       var currentDate = date.getDate();
       var currentYear = date.getFullYear();
       $("#eventDatenew").kendoDatePicker({

       min: new Date(currentYear, currentMonth, currentDate)
       });

       $("#eventDate").bind("focus", function() {
       $(this).data("kendoDatePicker").open();
       });

       if(angular.isUndefined(input) || input === null){
       $scope.hotelid = eanHotelId;
       //alert(	$scope.hotelid)
       }
       else{
       //  alert($scope.hotelid);
       $scope.hotelid = eanHotelId;
       }
       $scope.myEventStatus = "2";
       $http({
       async : true,
       cache : false,
       url: $rootScope.urlappend+"/leadsController/findAllLeadsForSellerByFilter;"+sessionid,
       method: "GET",
       params:{
       EANHotelID :$scope.hotelid,
       myEventStatus: $scope.myEventStatus,
       }

       }).success(function(data, status, headers, config) {

       if (angular.isUndefined(data) || data == null || data == "") {
       alert("No Leads Available");


       }
       else{

       $scope.finallmarket = data;
       $scope.finallmarket.sort(function(obj1, obj2) {

       return obj2.myEventId - obj1.myEventId;
       });

       $scope.clickgetleads($scope.finallmarket[0].myEventId);
       $scope.count = 0;

       }


       }).error(function(data, status, headers, config) {

       });

       }; */
      $scope.clickgetleads = function(input){
        $scope.eventid =input;

        $scope.hotelid = "";
        $http({

          url:$rootScope.urlappend+'/leadsController/findMyEventByEventId;jsessionid='+$rootScope.jessionid,
          method: "GET",
          params: {
            myEventId :$scope.eventid,
            hotelId: eanHotelId,
          }

        }).success(function(data, status, headers, config) {

          //$scope.leads = data;
          $rootScope.myEvent = JSON.parse(data.myEventInfo);
          $rootScope.myEventIdForImageUpload=$rootScope.myEvent.myEventId;
          $scope.myServiceShortlist = JSON.parse(data.myServiceShortlist);
          $scope.myPropertyShortlist = JSON.parse(data.myPropertyShortlist);
          $rootScope.myEventId = $scope.myEvent.myEventId;
          if($scope.myEvent.myEventSessionId == 1){
            $scope.sessiondisplay = "Morning"
          }else if ($scope.myEvent.myEventSessionId == 2){
            $scope.sessiondisplay = "Evening"
          }else if ($scope.myEvent.myEventSessionId == 3){
            $scope.sessiondisplay = "Full-day"
          }
          //  $("#1, #2, #3").removeClass("active")
          if($scope.myEvent.myEventStageId== 1){
            //  $("#1").addClass("active");
            $scope.displaystatus = "Unattended";
          }else if($scope.myEvent.myEventStageId== 2){
            // $("#2").addClass("active");
            $scope.displaystatus = "Connected";
          }else{
            //  $("#3").addClass("active");
            $scope.displaystatus = "Visited";
          }
          $scope.colorChange = [];
          if($scope.myEvent.myEventStageId == 1 ){
            $scope.colorChange.push('red');
          }
          else{
            $scope.colorChange.push('blue');
          }
          $scope.myEvent.eventEndDate = (new Date($scope.myEvent.eventEndDate).toLocaleDateString());

          //$("#myEventSource").val($scope.leads[0][17]);
          //$scope.myEventSourceData.value($scope.leads[0][17]);

        }).error(function(data, status, headers, config) {

        });
      };

      if($stateParams.id == undefined){
        $scope.allfunctionsingleeventype();

       // $scope.selectPropertyDrop = $('#selectPropertyDrop').val();
        // $scope.allleadslistcall($scope.selectPropertyDrop);
        $scope.prevnedddddd =true;
        $scope.progress = true;

        $scope.prevneddddddnew = false;

      }

      else{
        //alert($stateParams.id);
        $scope.clickgetleads($stateParams.id);
        $scope.prevnedddddd =false;



        $scope.prevneddddddnew = true;
        $scope.countnew = parseInt($stateParams.index)-1;
        // alert( $rootScope.alleadprev[2].myEventId);

        /*  $scope.allfunctionsingleeventype();

         $scope.selectPropertyDrop = $('#selectPropertyDrop').val();
         $scope.allleadslistcall($scope.selectPropertyDrop);
         $scope.prevnedddddd =true;
         $scope.progress = true; */

        $scope.prevclickbuttonnew = function(input){



          if(parseInt($scope.countnew) != 0){
            // $scope.allfunctionsingleeventype();
            // $rootScope.alleadprev[2].myEventId
            $scope.clickgetleads($rootScope.alleadprev[parseInt($scope.countnew)-1].myEventId);
            $scope.countnew = parseInt($scope.countnew)-1;
          }
          // $scope.allfunctionsingleeventype();

        };
        $scope.nextcliekbuttonnew = function(input){



          if(parseInt($scope.countnew) < $rootScope.alleadprev.length-1 ){
            // $scope.allfunctionsingleeventype();
            $scope.clickgetleads($rootScope.alleadprev[parseInt($scope.countnew)+1].myEventId);
            $scope.countnew = parseInt($scope.countnew)+1;

          }


        };
      }




      /*$scope.eventid = input;*/
      // $scope.allleadslistcall();





      // alert($scope.FullTotal);
      $scope.minmaxcheck = function (input){

        //var input1 = element(by.model('FullTotal'));

        if($scope.bookinglist.bookingId.bookingTotalPrice <= $scope.bookinglist.bookingId.publishedTotalPrice)
        {
          $scope.errormax = false;

        }
        else{

          $scope.errormax = true;
        }
        //alert($scope.newfulltotal);

      };


      $scope.histroy = function(input){

        $scope.myShortlistId = input;

        $http({

          url:$rootScope.urlappend+'/leadsController/viewExotelUrlForMyShortlist',
          method: "GET",
          params: {
            myShortlistId :$scope.myShortlistId,

          }

        }).success(function(data, status, headers, config) {

          $scope.recordlist = data;


        }).error(function(data, status, headers, config) {

        });




      }

      $scope.prevclickbutton = function(input){



        if(parseInt($scope.count) != 0){
          // $scope.allfunctionsingleeventype();
          $scope.clickgetleads($scope.finallmarket[parseInt($scope.count)-1].myEventId);
          $scope.count = parseInt($scope.count)-1;
        }
        // $scope.allfunctionsingleeventype();

      };
      $scope.nextcliekbutton = function(input){



        if(parseInt($scope.count) < $scope.finallmarket.length-1 ){
          // $scope.allfunctionsingleeventype();
          $scope.clickgetleads($scope.finallmarket[parseInt($scope.count)+1].myEventId);
          $scope.count = parseInt($scope.count)+1;

        }


      };

//david
      $scope.addSellerCallBuyer = function(myEventId){
//alert("phonenumber");
        $http({

          url:$rootScope.urlappend+'/leadsController/addServiceToMyShortlist;'+sessionid,
          method: "GET",
          params: {
            myEventId :myEventId ,

          }

        }).success(function(data, status, headers, config) {
          //alert();

        }).error(function(data, status, headers, config) {

        });

      }


      $scope.phoneCall = function(myEventId){
//alert(myEventId);
//alert("phonenumber");
        $http({

          url:$rootScope.urlappend+'/leadsController/setSellerCallingBuyerNumber;'+sessionid,
          method: "GET",
          params: {
            myEventId :myEventId ,

          }

        }).success(function(data, status, headers, config) {
          //alert();

        }).error(function(data, status, headers, config) {

        });

      }
      $scope.addServiceToMyShortlist = function(vspkgserviceId,myEventId){
        if (confirm("Do you want to send quote") == true) {
          $http({

            url:$rootScope.urlappend+'/leadsController/addServiceToMyShortlist;'+sessionid,
            method: "GET",
            params: {
              vspkgserviceId :vspkgserviceId,
              myEventId :myEventId ,

            }

          }).success(function(data, status, headers, config) {
            if(data!=null){
              $scope.clickgetleads(myEventId);
            }else{
              alert("failed to shortlist");
            }


          }).error(function(data, status, headers, config) {

          });

        }}
//$scope.addServiceToMyShortlist();
      $scope.addone = function(input){



        $http({

          url:$rootScope.urlappend+'/leadsController/findOriginalActiveMasterServiceForProperty;'+sessionid,
          method: "GET",
          params: {
            eanhotelId :$rootScope.hotelid ,

          }

        }).success(function(data, status, headers, config) {

          //alert(data);
          $scope.leadmsforprop = data;

        }).error(function(data, status, headers, config) {

        });





      }
      $scope.addone();
      $scope.sendbrochureformyevent = function(){
        if (confirm("Do you want to send brochure?") == true) {

          //$scope.myEventId =$scope.myEvent.myEventId;

          $http({

            url:$rootScope.urlappend+'/leadsController/sendBrochureForMyEvent;jsessionid='+$rootScope.jessionid,
            method: "GET",
            params: {
              //  eanhotelId: $rootScope.hotelid,
              myEventId :$rootScope.myEventId

            }

          }).success(function(data, status, headers, config) {
            if(data != null ){
              if(data.result == undefined){
                alert("Brochure sent successfully!!")
              }else{
                alert(data.result);
              }

            }else{
              alert("Brochure  not sent" );

            }

          }).error(function(data, status, headers, config) {
            // alert('failure');
          });

        }}
      $scope.sendAddressForMyEvent = function(){
        if (confirm("Do you want to send address?") == true) {
          $scope.eanhotelId ="";
          $scope.myEventId =$scope.myEvent.myEventId;

          $http({

            url:$rootScope.urlappend+'/leadsController/sendAddressForMyEvent;'+sessionid,
            method: "GET",
            params: {
              eanhotelId: $rootScope.hotelid,
              myEventId :$scope.myEventId ,

            }

          }).success(function(data, status, headers, config) {
            //alert('success');

          }).error(function(data, status, headers, config) {
            // alert('failure');
          });

        }}
      $scope.qualifier = function(){
        if (confirm("Do you want to send qualifier?") == true) {
          $scope.eanhotelId ="";
          $scope.myEventId =$scope.myEvent.myEventId;

          $http({

            url:$rootScope.urlappend+'/leadsController/sendQualifierForMyEvent;'+sessionid,
            method: "GET",
            params: {
              eanhotelId: $rootScope.hotelid,
              myEventId :$scope.myEventId ,

            }

          }).success(function(data, status, headers, config) {
            //alert('success');

          }).error(function(data, status, headers, config) {
            // alert('failure');
          });

        }}
      $scope.expireMyShortlist = function(){

        if (confirm("confirm regret?") == true) {
//alert($scope.leads[0][0]);
          $scope.myShortlistId = $scope.myServiceShortlist[0].myShortlistId;
//var shorlll= $scope.leads[0][0];
          $scope.myEventId =$scope.myEvent.myEventId;
          //  alert($scope.myEventId);
          $http({

            url:$rootScope.urlappend+'/leadsController/sendRegretForMyEvent;'+sessionid,
            method: "GET",
            params: {
              //   eanhotelId: $rootScope.hotelid,
              myEventId :$scope.myEventId ,
              //myShortlistId: $scope.myShortlistId,
            }

          }).success(function(data, status, headers, config) {
            $state.go('unactive', { url: '/unactive'});
            //$scope.clickgetleads($scope.myEventId);
            //alert('success');

          }).error(function(data, status, headers, config) {
            // alert('failure');
          });
          //	$scope.showmyShortlistBlockIdshorlll=true;
        }}




    })



.controller('walkInCtrl', function($scope,$http,$rootScope,$state,$stateParams) {
    $scope.eventid = $stateParams.id;
//   alert( $scope.eventid);
    if($stateParams.id != undefined) {
      $scope.createnewlead = function (input) {
        $http({
          url: $rootScope.urlappend + '/leadsController/findMyEventByEventId;jsessionid=' + $rootScope.jessionid,
          method: "GET",
          params: {
            myEventId: $scope.eventid,
            // hotelId: eanHotelId,
          }
        }).success(function (data, status, headers, config) {
          //$scope.editleads = data;
          $scope.myEvent = JSON.parse(response.myEventInfo);
          $scope.myServiceShortlist = JSON.parse(response.myServiceShortlist);
          $scope.myPropertyShortlist = JSON.parse(response.myPropertyShortlist);

          // $scope.datevalue = $scope.editleads[0][3];
        }).error(function (data, status, headers, config) {
        });
      };
      $scope.createnewlead();
    }
    else{

      $scope.eventid = false;
      $scope.editleads = null;
    }
    $scope.newsessionvalue;
    $scope.sessioncreatebtn = function(input){
      $rootScope.newsessionvalue = input;
      $('#sessioncreatebtn button').removeClass('active');
      $("#"+input+"").addClass('active');
      //alert($scope.newsessionvalue);

    }
    //$scope.createnewlead();
    $scope.savenewlead = function(input){
      //alert('ddwss');
      //alert($scope.newsessionvalue);
      /* alert( $scope.myEvent.myEventId); */
      /*if($("#eventId").val()!=null && $("#eventId").val()!=""){
       myEventId =  $("#eventId").val();
       } */
      $("#eventDate").bind("focus", function() {
        $(this).data("kendoDatePicker").open();
      });

      if($scope.eventid != false) {
        if ($scope.myEvent.myEventId != null && $scope.myEvent.myEventId != "") {

          myEventId = $scope.myEvent.myEventId;
        }
        if ($scope.myEvent.userMasterId.userMasterId != null && $scope.myEvent.userMasterId.userMasterId != "") {

          userId = $scope.myEvent.userMasterId.userMasterId;
        }
        if ($scope.myEvent.eventName != null && $scope.myEvent.eventName != "") {

          eventName = $scope.myEvent.eventName;
        }
        if ($scope.myEvent.eventEndDate != null && $scope.myEvent.eventEndDate != "") {
          // eventDate =  $scope.editleads[0][3].toLocaleDateString();
          eventDate = new Date($scope.myEvent.eventEndDate).toLocaleDateString()
        }

        if ($scope.myEvent.guestCount != null && $scope.myEvent.guestCount != "") {
          guestCount = $scope.myEvent.guestCount;
        }
        if ($scope.myEvent.userMasterId.username != null && $scope.myEvent.userMasterId.username != "") {
          userName = $scope.myEvent.userMasterId.username;
        }

        if ($scope.myEvent.userMasterId.emailaddress != null && $scope.myEvent.userMasterId.emailaddress != "") {
          userEmailAddress = $scope.myEvent.userMasterId.emailaddress;
        }
        if ($scope.myEvent.userMasterId.mobileNo != null && $scope.myEvent.userMasterId.mobileNo != "") {
          mobileNum = $scope.myEvent.userMasterId.mobileNo;
        }
      }
      else {
        myEventId = "";
        userId = "";

        if ($('#eventname').val() != undefined && $('#eventname').val()) {
          eventName = $scope.eventname;
        } else {
          alert('Enter event name');
          return
        }
        if ($('#eventDate').val() != undefined && $('#eventDate').val()) {
          eventDate = new Date($scope.eventdate).toLocaleDateString();
        } else {
          alert('Enter event date');
          return
        }
        if ($('#eventcount').val() != undefined && $('#eventcount').val()) {
          guestCount = $scope.eventcount;
        } else {
          alert('Enter guest count');
          return
        }
        if ($('#eventuser').val() != undefined && $('#eventuser').val()) {
          userName = $scope.eventusername;
        } else {
          alert('Enter user name');
          return
        }
        if ($('#eventemail').val() != undefined && $('#eventemail').val()) {
          var filter = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
          if (!filter.test($("#eventemail").val())) {
            alert("Please enter the correct Email address.");
            return;
          } else {
            userEmailAddress = $scope.eventemailaddress;
          }
        } else {
          alert('Enter an Email address');
          return
        }
        if ($("#eventmobile").val() != null && $("#eventmobile").val() != "") {
          var filtermob = /^[789]\d{9}$/;
          if (!filtermob.test($("#eventmobile").val())) {
            alert("Please enter the correct Mobile number.");
            return;
          } else {
            mobileNum = $("#eventmobile").val();
          }
        } else {
          alert('Enter a mobile number');
          return
        }
        session = $rootScope.newsessionvalue;
      }
      $http({
        url:$rootScope.urlappend+'/leadsController/createMyEventForRespectiveUserMobileApp;jsessionid='+$rootScope.jessionid,
        method: "POST",

        params: {
          myEventId:myEventId,eventName:eventName,eventDate:eventDate,userId:userId,userEmailAddress:userEmailAddress,userName:userName,mobileNum:mobileNum,guestCount:guestCount,session:session}
      }).success(function(data, status, headers, config) {
        $rootScope.myEventId = data.myEventId
        $scope.sendbrochureformyevent();
        $state.go('unactive', { url: '/unactive'});

      }).error(function(data, status, headers, config) {
        alert('Failed! Enter valid informations');
      });


      /* $.ajax({
       async: true,
       url: newURL+'/leadsController/createMyEventForRespectiveUser',
       type: 'POST',
       data:{"myEventId":myEventId,"eventName":eventName,"eventDate":eventDate,"eventTypeClassificationForMyEventDrop":eventTypeClassificationForMyEventDrop,"userEmailAddress":userEmailAddress,"userId":userId,"mobileNum":mobileNum,"userName":userName,"vsPkgServiceJson":vsPkgServiceJson,"vsPkgServiceJsonText":vsPkgServiceJsonText,"sendSellerContactJson":sendSellerContactJson,"sendBuyerContactJson":sendBuyerContactJson,
       "buyerCorporateName":buyerCorporateName,"myEventStatus":myEventStatus,
       "guestCount":guestCount,"myEventStage":myEventStage,"myEventSource":myEventSource,"internalNote":internalNote,"followUpDate":followUpDate},
       dataType: 'json',
       success: function(response){

       },error: function(response){
       }
       }); */
    }



  })

.controller('bookingsCtrl', function($scope,$http,$rootScope,$location,$state,$stateParams) {


    var sessionid = "jsessionid="+$rootScope.jessionid;
    var eanHotelId = $rootScope.hotelid;
    $scope.singleSelect = {
      availableOptions: [
        {id: '1', name: 'Yesterday Bookings'},
        {id: '7', name: 'Last 7 days '},
        {id: '30', name: 'Last 30 days '},
        {id: '', name: 'All Bookings'},
      ],
      selectedOption: {id: '30', name: 'Last 30 days '} //This sets the default value of the select in the ui
    };

    $scope.sortByBookingCreated = "";
    $scope.allbooklistcall = function(){
      //alert($scope.singleSelect.selectedOption.id);
      $scope.sortByBookingCreated = $scope.singleSelect.selectedOption.id;
      $http({

        url: $rootScope.urlappend+'/booking/findBookingForApp;'+sessionid,
        method: "GET",
        params:{
          eanHotelId : eanHotelId,
          sortByBookingCreated : $scope.sortByBookingCreated
        }

      }).success(function(data, status, headers, config) {
        $scope.headers = ["Id", "Date", "Name"];
        $scope.listleadsdays = data;
        $scope.finalbookinglist = data;
        //alert($scope.finalbookinglist);

        if($scope.finalbookinglist.bookingId != "NO_BOOKINGS_FOUND"){
          $scope.bookinglistavaible = true;
          $scope.finalbookinglist.sort(function(obj1, obj2) {
            // Ascending: first age less than the previous
            return obj2.bookingId - obj1.bookingId;
          });
//david commented
          //$scope.getbookingdetailslist($scope.finalbookinglist[0].bookingId);

          $scope.countbooking = 0;
        }
        else{
          $scope.bookinglistavaible = false;

        }


      }).error(function(data, status, headers, config) {
        // $scope.status = status;
      });
    };

    $scope.allbooklistcall();
  })


  .controller('bookingDetailCtrl', function($scope,$http,$rootScope,$location,$state,$stateParams) {

var sessionid = "jsessionid="+$rootScope.jessionid;
var hotelid = $rootScope.hotelid;
/*single result display for booking click*/
$scope.checkboxModel = {
  value1 : true,

};
$scope.checkboxvalue = function (input){
  if($scope.checkboxModel.value1 == true){
    $scope.diplayhidebasedcheck = true;
  }
  else{

    $scope.diplayhidebasedcheck = false;
  }

}
$scope.getbookingdetailslist = function(input){
  $scope.bookingId =input;


  $http({

    url:$rootScope.urlappend+'/booking/findBookingForSellerResponse;'+sessionid,
    method: "GET",
    params: {
      bookingId :$scope.bookingId,
    }

  }).success(function(data, status, headers, config) {
    $scope.bookinglistavaible = true;
    $scope.saravana = data;
    $scope.book = JSON.parse(data.RESULT[0].booking);
    $scope.booking = JSON.parse(data.RESULT[0].bookingVspackage);
    $scope.bookingId = $scope.booking.bookingId.bookingId
    // alert($scope.bookingId);
    /*		$scope.booking.bookingId.bookingId
     $scope.book.myEvent.eventName
     $scope.booking.eventDate
     $scope.booking.bookingId.paxCount
     $scope.booking.bookingId.userMasterId.username
     $scope.booking.bookingId.userMasterId.emailaddress
     $scope.book.userMasterId.buyerExtension
     $scope.booking.bookingId.bookingTotalPrice
     $scope.book.bookingStatusId.bookingStatus*/

    //	alert($scope.booking.bookingId.bookingTotalPrice);
//alert($scope.bookinglist.eventDate)	;
  }).error(function(data, status, headers, config) {

  });
};

$scope.getbookingdetailslist($stateParams.id);

/*add sent mail accept or reject function*/
$scope.acceptreject = function (input){
  $scope.statusId = input;
  $scope.sellerComment = "test";
  $http({

    url:$rootScope.urlappend+'/booking/responseFromPrimarySeller;'+sessionid,
    method: "POST",
    params: {
      bookingId :$scope.bookingId,
      statusId :$scope.statusId,
      sellerComment:$scope.sellerComment

    }

  }).success(function(data, status, headers, config) {
    console.log("add sent mail accept or reject function"+data);
    if(data.response == "SUCCESS"){
      console.log("dddd");
      $scope.modifiedStatus = 0;
      $http({

        url:$rootScope.urlappend+'/booking/findRemainingSellerResponseTimeForGivenBooking;'+sessionid,
        method: "GET",
        params: {
          bookingId :$scope.bookingId,
          modifiedStatus :$scope.modifiedStatus,


        }

      }).success(function(data, status, headers, config) {
        console.log("add sent mail accept or reject function"+data);
        if(data != "" ){
          $scope.diplayhide = true;
          console.log(data)
          var data=data;
          var count = data;

          var counter = setInterval(timer, 1000);

          function timer() {
            count = count - 1;
            if (count == -1) {
              clearInterval(counter);
              return;
            }
            var seconds = count % 60;
            var minutes = Math.floor(count / 60);
            var hours = Math.floor(minutes / 60);
            minutes %= 60;
            hours %= 60;
            $scope.timerprint = minutes + ":" + seconds;
            document.getElementById("timer").innerHTML =minutes + ":" + seconds;
            console.log( $scope.timerprint);

          }
        }

      }).error(function(data, status, headers, config) {

      });
    }

  }).error(function(data, status, headers, config) {

  });
}

})



.controller('dealHuntersCtrl', function($scope) {

})

.controller('calenderCtrl', function($scope) {})


.controller('followUpsCtrl', function($scope) {

})
