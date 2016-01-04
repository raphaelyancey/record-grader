var app = angular.module('recordGrader', []);

app.controller('MainController', ['$scope', function($scope) {

	$scope.record = {

		type: null,
		sealed: null,

		grade: null,

		cover: {
			ringWorn: null,
			worn: null,
			violenced: null,

			grade: null
		},

		disc: {
			played: null,
			skipping: null,
			warped: null,
			noisy: null,
			scratched: null,

			grade: null
		}
	};

	var reset = angular.copy($scope.record);

	$scope.$watch('record.sealed', function(sealed) {
		if(sealed) {
			$scope.record.disc.played = false;
			$scope.record.disc.skipping = false;
			$scope.record.disc.noisy = false;
			$scope.record.disc.warped = false;
			$scope.record.disc.scratched = false;
		}
	});

	$scope.$watchCollection('record.cover', function(cover) {

		var grades = [
			{ code: 'M', total: 0 },
			{ code: 'NM', total: 0 },
			{ code: 'VG+', total: 1 },
			{ code: 'VG', total: 2 },
			{ code: 'G+', total: 3 },
			{ code: 'G', total: 4 },
			{ code: 'F', total: 5 },
			{ code: 'P', total: 6 }
		];

		if(!_.isNull(cover.ringWorn) && !_.isNull(cover.worn) && !_.isNull(cover.violenced)) {
			
			var total = cover.ringWorn + cover.worn + cover.violenced;
			var grade;

			// Record is `Mint` only if the total is 0 and the record is sealed
			if(total == 0)
				grade = $scope.record.sealed ? _.findWhere(grades, { code: 'M' }) : _.findWhere(grades, { code: 'NM' });
			else				
				grade = _.findWhere(grades, { total: total });
			
			cover.grade = grade.code;
		}
	});

	$scope.$watchCollection('record.disc', function(disc) {

		var grades = [
			{ code: 'M', total: 0 },
			{ code: 'NM', total: 0 },
			{ code: 'VG+', total: 1 },
			{ code: 'VG', total: 2 },
			{ code: 'VG', total: 3 },
			{ code: 'G+', total: 4 },
			{ code: 'G+', total: 5 },
			{ code: 'G', total: 6 },
			{ code: 'G', total: 7 },
			{ code: 'F', total: 8 },
			{ code: 'F', total: 9 },
			{ code: 'P', total: 10 }
		];

		// If the disc hasn't been played, it can't skip or be noisy (can it?)
		if(disc.played == 0) {
			disc.noisy = 0;
			disc.skipping = 0;
		}

		if(!_.isNull(disc.played) && !_.isNull(disc.warped) && !_.isNull(disc.noisy) && !_.isNull(disc.scratched) && !_.isNull(disc.skipping)) {
			
			var total = disc.played + disc.warped + disc.noisy + disc.scratched + disc.skipping;
			var grade;

			// Record is `Mint` only if the total is 0 and the record is sealed
			if(total == 0)
				grade = $scope.record.sealed ? _.findWhere(grades, { code: 'M' }) : _.findWhere(grades, { code: 'NM' });
			else				
				grade = _.findWhere(grades, { total: total });
			
			disc.grade = grade.code;
		}
	});
}]);