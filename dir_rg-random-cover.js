var app = angular.module('recordGrader');
var rrs = require('random-record-sleeve');
rrs.setCredentials('CXDjOnwBOBrUIPVjpbMh', 'NyFFxQoZSxbmiqWQYwZTKDGQQMJwuUtX');

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

      var FALLBACK_URI = 'dj_krush_milight.jpg';
      var FALLBACK_TITLE = 'MiLight (1996)';

      $scope.discogsListId = $scope.discogsListId || 2056; // Defaults to "Most Popular Albums" list

      function updateImage(src, title, alt) {
        if(!src) throw new Error('Empty source.');
        $elem.attr('src', src);
        if(title) $elem.attr('title', title);
        if(alt) $elem.attr('alt', alt);
      }

      var sleeve = rrs.getSleeve({
        size150: true
      }).then(function(res) {
        console.log('••• res', res);
        updateImage(res);
      }).catch(function(err) {
        console.log('••• err', err);
      });
      
      //updateImage(sleeve, res.data.title+' ('+res.data.year+')');
    }
  }
}]);