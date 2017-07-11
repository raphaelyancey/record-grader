var app = angular.module('recordGrader', []);

app.controller('MainController', ['$scope', '$http', function($scope, $http) {

	$scope.answers = {};
	$scope.criterions = [];
	$scope.result = {
		record: null,
		sleeve: null
	};

	var orderedGrades = ['P', 'G', 'VG', 'VG+', 'NM', 'M'];

	$http.get('./grades.json').then(function(res) {
		$scope.criterions = res.data;
	}).catch(function() {
		throw new Error("Couldn't get the grades.");
	});

	function computeGrade(answers, criterions, orderedGrades, callback) {		
		var gradePosition = Object.keys(answers).reduce(function(prev, key) {	
			var criterion = _.findWhere(criterions, { prop: key });
			var gradeAnswer = criterion.rules[answers[key]];
			var gradeAnswerPos = orderedGrades.indexOf(gradeAnswer);
			if(gradeAnswerPos < prev) return gradeAnswerPos;
			else return prev;
		}, (orderedGrades.length - 1));
		callback(orderedGrades[gradePosition]);
	}

	$scope.$watchCollection('answers.record', function(n) {
		if(!n) return;
		var r_criterions = _.filter($scope.criterions, function(criterion) {
			return criterion.item == 'record';
		});
		computeGrade(n, r_criterions, orderedGrades, function(res) {
			$scope.result.record = res;
		});
	});

	$scope.$watchCollection('answers.sleeve', function(n) {
		if(!n) return;
		var s_criterions = _.filter($scope.criterions, function(criterion) {
			return criterion.item == 'sleeve';
		});
		computeGrade(n, s_criterions, orderedGrades, function(res) {
			$scope.result.sleeve = res;
		});
	});

}]);