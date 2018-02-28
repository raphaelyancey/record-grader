var app = angular.module('recordGrader', []);

app.controller('MainController', ['$scope', '$http', function($scope, $http) {

	$scope.answers = {};
	$scope.criterions = [];
	$scope.r_criterions = [];
	$scope.rv_criterions = [];
	$scope.rp_criterions = [];
	$scope.s_criterions = [];
	$scope.result = {
		record: null,
		sleeve: null
	};

	var orderedGrades = ['P', 'G', 'VG', 'VG+', 'NM', 'M'];

	$http.get('./grades.json').then(function(res) {
		$scope.criterions = res.data;
		computeFilteredCriterions($scope.criterions);
	}).catch(function() {
		throw new Error("Couldn't get the grades.");
	});

	function computeFilteredCriterions(all_criterions) {
		$scope.all_r_criterions = _.filter(all_criterions, function(criterion) {
			return criterion.item.indexOf('record') > -1;
		});
		$scope.rv_criterions = _.filter(all_criterions, function(criterion) {
			return criterion.item.indexOf('record') > -1 && criterion.item.indexOf('visual') > -1;
		});
		$scope.rp_criterions = _.filter(all_criterions, function(criterion) {
			return criterion.item.indexOf('record') > -1 && criterion.item.indexOf('playback') > -1;
		});
		$scope.outliers_r_criterions = _.difference($scope.all_r_criterions, $scope.rp_criterions, $scope.rv_criterions);
		$scope.s_criterions = _.filter(all_criterions, function(criterion) {
			return criterion.item.indexOf('sleeve') > -1;
		});
	}

	function computeGrade(answers, criterions, orderedGrades, callback) {

		function computeGradePosition(answers, criterions, orderedGrades, criterionProp) {
			// Find the criterion details of the current criterion prop
			var criterion = _.findWhere(criterions, { prop: criterionProp });

			// Find the grade of the current criterion
			var answerRule = _.findWhere(criterion.rules, { answerValue: answers[criterionProp] });
			var answerGrade = answerRule.maxGrade;

			// Get the position of this grade in the ordered grade array
			var answerGradePos = orderedGrades.indexOf(answerGrade);
			return answerGradePos;
		}

		var maxGradePerAnswer = Object.keys(answers).map(function(criterionProp) {
			answerGradePos = computeGradePosition(answers, criterions, orderedGrades, criterionProp);
			return orderedGrades[answerGradePos];
		}, (orderedGrades.length - 1));

		var gradePosition = Object.keys(answers).reduce(function(prev, criterionProp) {
			answerGradePos = computeGradePosition(answers, criterions, orderedGrades, criterionProp);
			// Returns the grade if it's below the worst grade encountered during the reduction
			if(answerGradePos < prev)
				return answerGradePos;
			else
				return prev;
		}, (orderedGrades.length - 1));

		$scope.limitingCriterions = _.filter(maxGradePerAnswer, function(answer) {
			return answer == orderedGrades[gradePosition];
		}).length;

		console.log('••• maxGradePerAnswer', maxGradePerAnswer)
		console.log('••• gradePosition', gradePosition)
		console.log('••• orderedGrades[gradePosition]', orderedGrades[gradePosition]);
		console.log('••• $scope.limitingCriterions', $scope.limitingCriterions);

		callback(orderedGrades[gradePosition]);
	}

	$scope.$watchCollection('answers.record', function(n) {
		if(!n) return;
		computeGrade(n, $scope.all_r_criterions, orderedGrades, function(res) {
			$scope.result.record = res;
		});
	});

	$scope.$watchCollection('answers.sleeve', function(n) {
		if(!n) return;
		computeGrade(n, $scope.s_criterions, orderedGrades, function(res) {
			$scope.result.sleeve = res;
		});
	});

}]);