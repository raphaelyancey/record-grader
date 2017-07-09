var app = angular.module('recordGrader', []);

app.controller('MainController', ['$scope', '$http', function($scope, $http) {

	$scope.answers = {};

	var orderedGrades = ['P', 'G', 'VG', 'VG+', 'NM', 'M'];

	$http.get('./grades.json').then(function(res) {
		$scope.criterions = res.data;
	}).catch(function() {
		throw new Error("Couldn't get the grades.");
	});

	function computeGrade(answers, criterions, orderedGrades, callback) {
		
		var gradePosition = Object.keys(answers).reduce(function(prev, key) {	
			console.group();
			console.log('— key', key);
			var criterion = _.findWhere(criterions, { prop: key });
			console.log('— criterion', criterion);
			var gradeAnswer = criterion.rules[answers[key]];
			console.log('— gradeAnswer', gradeAnswer);
			var gradeAnswerPos = orderedGrades.indexOf(gradeAnswer);
			console.log('— gradeAnswerPos', gradeAnswerPos);
			if(gradeAnswerPos < prev) return gradeAnswerPos;
			else return prev;
			console.groupEnd();
		}, (orderedGrades.length - 1));

		console.log('— gradePosition', gradePosition);

		callback(orderedGrades[gradePosition]);
	}

	$scope.$watchCollection('answers', function(n) {
		console.log('— n', n);
		computeGrade(n, $scope.criterions, orderedGrades, function(res) {
			$scope.result = res;
		});
	});

}]);