var app = angular.module('recordGrader');

app.directive('rgRandomCover', ['$http', function($http) {
  return {
    restrict: 'A',
    scope: {
      discogsCredentials: '=',
      discogsListId: '=?',
      fallback: '=?'
    },
    link: function($scope, $elem, $attr) {

      if($elem[0].nodeName !== 'IMG') throw new Error('This directive can only be used on a <img> tag.');

      function random(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min)) + min;
      }

      if(!$scope.discogsCredentials || !$scope.discogsCredentials.key || !$scope.discogsCredentials.secret)
        throw new Error('You must provide Discogs credentials.'); // TODO: default to self-hosted cover

      var DISCOGS_API = 'https://api.discogs.com';
      var DISCOGS_CREDENTIALS = '?key='+$scope.discogsCredentials.key+'&secret='+$scope.discogsCredentials.secret;
      var FALLBACK_URI = 'dj_krush_milight'

      $scope.discogsListId = $scope.discogsListId || 2056; // Defaults to "Most Popular Albums" list

      function getList(listId) {
        return $http.get(DISCOGS_API + '/lists/' + listId + DISCOGS_CREDENTIALS).catch(function(err) {
          throw new Error(err);
        });
      }

      function getItem(itemId) {
        return $http.get(DISCOGS_API + '/masters/' + itemId + DISCOGS_CREDENTIALS).catch(function(err) {
          throw new Error(err);
        });
      }

      function updateImage(src, title, alt) {
        if(!src) throw new Error('Empty source.');
        $elem.attr('src', src);
        if(title) $elem.attr('title', title);
        if(alt) $elem.attr('alt', alt);
      }

      getList($scope.discogsListId).then(function(res) {
        var rand = random(0, res.data.items.length);
        return getItem(res.data.items[rand].id).then(function(res) {
          updateImage(res.data.images[0].uri150, res.data.title+' ('+res.data.year+')');
        });
      }).catch(function() {
        if($scope.fallback) updateImage($scope.fallback.url, $scope.fallback.title, $scope.fallback.alt);
      });
    }
  }
}]);