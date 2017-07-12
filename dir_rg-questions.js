var app = angular.module('recordGrader');

app.directive('rgQuestions', [function() {
  return {
    restrict: 'E',
    templateUrl: 'dir_rg-questions.html',
    scope: {
      criterions: '=',
      answers: '='
    },
    link: function($scope) {

      function customAnswer(criterion) {

      }
    }
  }
}]);