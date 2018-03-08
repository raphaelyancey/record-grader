var app = angular.module('recordGrader', []);

app.controller('MainController', ['$scope', '$http', function($scope, $http) {

	$scope.answers = {};
	$scope.criterions = [];
	$scope.r_criterions = [];
	$scope.rv_criterions = [];
	$scope.rp_criterions = [];
	$scope.s_criterions = [];
	$scope.limitingCriterions = {};
	$scope.result = {
		record: null,
		sleeve: null
	};
	$scope.showExplanations = {
		record: false,
		sleeve: false
	};
	$scope.isMint = function(rules) {
		console.log('••• rules', rules);
		return _.reduce(rules, function(prev, rule, prop) {
			return rule.maxGrade == "M" && prev;
		}, true);
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

		limitingCriterions = {};

		answeredCriterions = _.filter(criterions, function(criterion) {
			return answers[criterion.prop] !== undefined;
		});

		_.each(answeredCriterions, function(criterion) {
			criterionAnswer = answers[criterion.prop];
			_.each(criterion.rules, function(rule) {
				if(criterionAnswer == rule.answerValue && orderedGrades[gradePosition] == rule.maxGrade)
					limitingCriterions[criterion.prop] = rule;
			});
		});

		callback(orderedGrades[gradePosition], limitingCriterions);
	}

	$scope.$watchCollection('answers.record', function(n) {
		if(!n) return;
		computeGrade(n, $scope.all_r_criterions, orderedGrades, function(maxGrade, limitingCriterions) {
			$scope.result.record = maxGrade;
			$scope.limitingCriterions.record = limitingCriterions;
			console.log('••• $scope.limitingCriterions', $scope.limitingCriterions)
		});
	});

	$scope.$watchCollection('answers.sleeve', function(n) {
		if(!n) return;
		computeGrade(n, $scope.s_criterions, orderedGrades, function(maxGrade, limitingCriterions) {
			$scope.result.sleeve = maxGrade;
			$scope.limitingCriterions.sleeve = limitingCriterions;
			console.log('••• $scope.limitingCriterions', $scope.limitingCriterions)
		});
	});

	$scope.toggleExplanations = function(ns) {
		$scope.showExplanations[ns] = !$scope.showExplanations[ns];
	};

}]);