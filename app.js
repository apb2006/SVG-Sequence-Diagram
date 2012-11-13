		var app = angular.module('MyApp', [])
		AppController.$inject = ['$location', '$window','$scope']
		function AppController( $location, $window,$scope){
			var _this=this;
			var rndseed=123;
			$scope.margin = 10
			$scope.user_width = 100
			$scope.user_height = 50
			$scope.note_width = 100
			$scope.note_height = 30
			$scope.height = 0
			$scope.width = 0
			$scope.lines = []
			$scope.users = []
			$scope.arrows = []
			$scope.notes = []
			$scope.wantHandDraw = true
			$scope.paperSizes = {
				A0: {width: 2384, height: 3370},
				A1: {width: 1684, height: 2384},
				A2: {width: 1191, height: 1684},
				A3:{width:  842, height: 1191},
				A4:{width:  595, height: 842},
			}
			$scope.pageSizes = Object.keys($scope.paperSizes)
			$scope.pageSize = 'A4'
			$scope.definition = 'participant: Alice as A\n\
participant: B\n\
\n\
User->A: DoWork\n\
A-->B: <<createRequest>>\n\
note right of B: what should I do?\n\
B-->C: DoWork\n\
note over C: processing...\n\
C->B: WorkDone\n\
note left of B: hmm.. it was fast\n\
B->A: RequestCreated\n\
A->User: Done'
			$scope.$watch('definition', function(){
				$scope.draw()
			})
			$scope.draw=function(){
				 
				$scope.height = $scope.user_height + $scope.margin
				$scope.width = -100
				$scope.users = []
				$scope.lines = []
				$scope.arrows = []
				$scope.notes = []
				var lines = $scope.definition.split('\n')
				for (var i in lines) {
					var line = lines[i].trim()
					if (/^([^-]*(-+[^-]+)*)(-->|->)(.*):(.*)$/.exec(line) != null) {
						var from = RegExp.$1.trim()
						var arrow = RegExp.$3.trim()
						var to = RegExp.$4.trim()
						var text = RegExp.$5.trim()
						// console.log(line+' => from: '+from+', to: '+to+', text: '+text)
						var ufrom = $scope.getUser(from)
						var uto = $scope.getUser(to)
						$scope.arrows.push({
							x: ufrom.x + $scope.user_width / 2,
							y: $scope.height + $scope.user_height / 2,
							length: Math.abs(ufrom.x - uto.x),
							direction: uto.x > ufrom.x ? 1 : -1,
							text: text,
							dashed: (arrow == '-->')
						})
						$scope.height += 50
					} else if (/^participant:(.*) as (.*)$/.exec(line) != null) {
						var who = RegExp.$1.trim()
						var alias = RegExp.$2.trim()
						$scope.getUser(who, alias)
					} else if (/^participant:(.*)$/.exec(line) != null) {
						var who = RegExp.$1.trim()
						$scope.getUser(who)
					} else if (/^note (left of|right of|over) (.*):(.*)$/.exec(line) != null) {
						var position = RegExp.$1.trim()
						var who = RegExp.$2.trim()
						var text = RegExp.$3.trim()
						var user = $scope.getUser(who)
						var dx
						if (position == 'right of') dx = $scope.margin
						else if (position == 'left of') dx = -$scope.margin - $scope.note_width
						else if (position == 'over') dx = -$scope.note_width / 2
						$scope.notes.push({
							x: user.x + $scope.user_width / 2 + dx,
							y: $scope.height,
							text: text
						})
						$scope.height += $scope.note_height
					}
				}
				//add height for margin and height for bottom user boxes
				$scope.$height += $scope.margin + $scope.user_height
				//add vertical lines
				for (var i in $scope.users) {
					var user = $scope.users[i]
					$scope.lines.push({
						x: user.x + $scope.user_width / 2, y: $scope.user_height,
				 		dx: 0, dy: $scope.height -  $scope.user_height
					})
				}
				//add bottom user boxes
				for (var i in $scope.users) {
					var user = $scope.users[i]
					$scope.users.push({
						x: user.x,
						y: $scope.height ,
						name: user.name
					})
				}
				// console.log(scope.users, scope.lines, scope.arrows)
			};
			$scope.getUser=function(name, alias){
				for (var i = 0; i < $scope.users.length; i++) {
					var user = $scope.users[i]
					if (user.name == name || user.alias == name) {
						return user
					}
				}
				$scope.width += 200
				var user = {
					x: $scope.width - $scope.user_width,
					y: 0,
					name: name,
					alias: alias
				}
				$scope.users.push(user)
				return user
			};
			$scope.byHand=function(x1, y1, x2, y2) {
				var points = x1+','+y1
				if ($scope.wantHandDraw) {
					$scope.rndseed = 123
					//number of segments (one segment for every 10 pixels)
					var seg = Math.ceil(Math.sqrt((x1-x2)*(x1-x2)+(y1-y2)*(y1-y2))/10)
					var inaccuracy = 2
					function mod(x){
						return x + $scope.rnd() * inaccuracy - inaccuracy / 2
					}
					var x = x1
					var y = y1
					var dx = (x2 - x1) / seg
					var dy = (y2 - y1) / seg
					for (var i = 1; i < seg; i++) {
						x += dx
						y += dy
						points += ' '+mod(x)+','+mod(y)
					}
				}
				return points+' '+x2+','+y2
			};
			$scope.rectByHand=function(x1, y1, x2, y2) {
				return [
					$scope.byHand(x1,y1, x2,y1),
					$scope.byHand(x2,y1, x2,y2),
					$scope.byHand(x2,y2, x1, y2),
					$scope.byHand(x1,y2, x1, y1)
					].join(" ")
			};
			$scope.rnd=function() {
			  _this.rndseed = ((_this.rndseed * 134775813) + 1) % 4294967296
			  return _this.rndseed / 4294967296
			}
		}
		AppController.prototype = {
			log: function(data){
				console && console.log && console.log(data)
				return data
			},
			Math: Math,
			rndseed: 123,
			rnd: function() {
			  this.rndseed = ((this.rndseed * 134775813) + 1) % 4294967296
			  return this.rndseed / 4294967296
			},
			download: function(text) {
				var scope = this
				$window.location.href =
					'data:application/x-download;charset=utf-8,' +
					encodeURIComponent(text)
			},
	



		}