var app = angular.module('recordGrader');

app.directive('rgQuestions', [function() {
  return {
    restrict: 'E',
    templateUrl: 'dir_rg-questions.html',
    scope: {
      criterions: '=',
      limitingCriterions: '=',
      answers: '='
    },
    link: function($scope) {

      $scope.getGradedEntity = function(criterion) {
        if(criterion.item.indexOf("sleeve") > -1 && criterion.item.indexOf("record") > -1) {
          console.err("Couldn't determine if criterion is for sleeve or record.", criterion);
          return 'unknown';
        }
        else if(criterion.item.indexOf("sleeve") > -1) return 'sleeve';
        else if(criterion.item.indexOf("record") > -1) return 'record';
      };
    }
  }
}]);