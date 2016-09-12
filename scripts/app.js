console.log('intra');
var app = angular.module('myApp', ['ngAnimate', 'ui.bootstrap']);
app.controller('customersCtrl', ['$scope', '$uibModal', '$http', function ($scope, $uibModal, $http) {
    $scope.test = 'merge';
    $scope.exampleDate = {
        value: new Date(2013, 9, 22)
    };

    $scope.startRaportDate = new Date();

    $scope.state = {
        workers: false,
        jobs: false,
        wages: false
    };

    $scope.animationsEnabled = true;

    $scope.openEditWorker = function (worker) {

        var modalInstance = $uibModal.open({
            animation: $scope.animationsEnabled,
            templateUrl: 'workerModal.html',
            controller: 'WorkerModalInstanceCtrl',
            size: null,
            resolve: {
                worker: function () {
                    return worker;
                }
            }
        });

        modalInstance.result.then(function (worker) {
            $scope.editWorker(worker);
        }, function () {
            console.log('Edit worker modal dismissed at: ' + new Date());
        });
    };

    $scope.getWages = function () {
        $scope.state.wages = true;
        $http.get("http://jcdrylining.co.uk/test/getWages.php")
            .success(function (response) {
                $scope.wages = response.wages;
                $scope.state.wages = false;
                console.log('wages', $scope.wages);
            });
    };

    $scope.getWorkers = function () {
        $scope.state.workers = true;
        $http.get("http://jcdrylining.co.uk/test/db.php")
            .success(function (response) {
                $scope.users = response.users;
                console.log('users', $scope.users);
                $scope.state.workers = false;
            });
    }
    $scope.getJobs = function () {
        $scope.state.jobs = true;
        $http.get("http://jcdrylining.co.uk/test/getJobs.php")
            .success(function (re) {
                $scope.jobs = re.jobs;
                console.log('jobs', $scope.jobs);
                $scope.state.jobs = false;
            });
    }

    $scope.getWorkers();
    $scope.getJobs();
    $scope.getWages();
    console.log('nu crapa la get-uri');

    $scope.setWorker = function (name, wage) {
        if (name == undefined || name == '') {
            alert('No name entered');
            return;
        }

        $http.post("http://jcdrylining.co.uk/test/setWorker.php", {
                'id': null, 'name': name, 'wage': wage
            })
            .success(function (data, status, headers, config) {
                console.log("inserted Successfully", name);
                $scope.getWorkers();
            })
            .error(function (data, status, headers, config) {
                console.log("add worker failed");
            });
    };
    $scope.setJob = function (job) {
        var startD, endD, monthS, monthE, dayS, dayE;
        if (job == undefined || job.location == undefined || job.location == ''){
            alert('Location not entered');
            return;
        }
        job.id = 0;
        angular.forEach($scope.jobs, function (value) {
            if (value.id >= job.id) {

                job.id = parseInt(value.id) + 1;
            }

        });
        console.log('id of the job added is:', job.id);
        monthS = job.startDate.getMonth() + 1;
        dayS = job.startDate.getDate();
        startD = job.startDate.getFullYear() + '-' + monthS  + '-' + dayS;
        dayE = job.endDate.getDate();
        monthE = job.endDate.getMonth() + 1;
        endD = job.endDate.getFullYear() + '-' + monthE + '-' + dayE;
        console.log('job submitted: ', job);
        console.log('startD : ', startD);
        console.log('endD : ', endD);
        $http.post("http://jcdrylining.co.uk/test/setJob.php", {
                'location': job.location, 'startDate': startD ,
                'endDate': endD , 'id': job.id, 'income': job.income
            })
            .success(function (data, status, headers, config) {
                console.log("inserted Successfully", data);
                $scope.getJobs();
            })
            .error(function (data, status, headers, config) {
                console.log("add job failed");
            });
    };

    $scope.setWage = function (jobId, startDate, selectedWorker, wage, hours, details) {
        var workDate,
            monthS,
            dayS;
        monthS = startDate.getMonth() + 1;
        dayS = startDate.getDate();
        workDate = startDate.getFullYear() + '-' + monthS  + '-' + dayS;
        if (wage == undefined || wage == ''){
            for(x of $scope.users){
                if (x.id == selectedWorker)
                    wage = x.wage;
            }
        }
        $http.post("http://jcdrylining.co.uk/test/setWage.php", {
                'idJob': jobId, 'idWorker': selectedWorker ,
                'workDate': workDate , 'wage': wage, 'hours': hours,
                'details': details
            })
            .success(function (data, status, headers, config) {
                console.log("inserted wage successfully", data);
                $scope.getWages();
            })
            .error(function (data, status, headers, config) {
                console.log("add wage failed");
            });
    };

    $scope.getWorkerStatus = function (id, startDate, endDate, jobSelected) {
        console.log('intra in get worker status id', id);
        var aux = {}, jobs = [], workDate,  totalPay = 0;
        for(job of $scope.wages) {
            workDate = new Date(job.workDate)
            if(job.idWorker == id && (job.idJob == jobSelected || jobSelected == 'all' || jobSelected == undefined) && ((startDate <= workDate && endDate > workDate) || (startDate == undefined) || (endDate == undefined))){
                for (loc of $scope.jobs) {
                    if (loc.id == job.idJob) {
                        aux.location = loc.location;
                    }
                }
                aux.workDate = job.workDate;
                aux.wage = job.wage;
                aux.hours = job.hours;
                totalPay += Number(job.wage) * Number(job.hours);
                aux.details = job.details;
                jobs.push(aux);
                aux = {};
            }
        }
        jobs.totalPay = totalPay;
        console.log('intra in return', jobs);
        return(jobs);
    };

    $scope.getJobStatus = function (id, startDate, endDate, selectedWorker) {
        console.log('intra in getJobStatus id=', id);
        var jobWages = [], workDate, aux = {}, totalPayed = 0;
        for(job of $scope.wages) {
            workDate = new Date(job.workDate)
            if(job.idJob == id && (selectedWorker == job.idWorker || selectedWorker == undefined || selectedWorker == 'all') && ((startDate <= workDate && endDate > workDate) || (startDate == undefined) || (endDate == undefined))) {
                for (worker of $scope.users) {
                    if (worker.id == job.idWorker) {
                        aux.idWage = job.idWage;
                        aux.name = worker.name;
                        aux.workDate = job.workDate;
                        aux.wage = job.wage;
                        aux.hours = job.hours;
                        aux.details = job.details;
                        aux.dayPay = Number((Number(job.wage) * Number(job.hours)).toFixed(2));
                        totalPayed += aux.dayPay;
                        jobWages.push(aux);
                        aux = {};
                    }
                }

            }

        }
        jobWages.totalPayed = totalPayed.toFixed(2);
        console.log('job wages', jobWages);
        return(jobWages);
    };

    $scope.deleteWorker = function (id) {
        console.log('delete worker ', id);
        $http.post("http://jcdrylining.co.uk/test/deleteWorker.php", {
                'id': id
            })
            .success(function (data, status, headers, config) {
                console.log("deleted worker Successfully", id);
                $scope.getWorkers();
            })
            .error(function (data, status, headers, config) {
                console.log("delete worker failed");
            });

    };

    $scope.deleteJob = function (id) {
        console.log('delete job ', id);
        $http.post("http://jcdrylining.co.uk/test/deleteJob.php", {
                'id': id
            })
            .success(function (data, status, headers, config) {
                console.log("deleted job Successfully", id);
                $scope.getJobs();
            })
            .error(function (data, status, headers, config) {
                console.log("delete job failed");
            });
    };

    $scope.deleteWage = function (id) {
        console.log('delete wage ', id);
        $http.post("http://jcdrylining.co.uk/test/deleteWage.php", {
                'id': id
            })
            .success(function (data, status, headers, config) {
                console.log("deleted wage Successfully", id);
                $scope.getJobs();
                $scope.getWages();
            })
            .error(function (data, status, headers, config) {
                console.log("delete wage failed");
            });
    };

    $scope.editWorker = function (worker) {
        console.log('edit worker', worker.id);
        $http.post("http://jcdrylining.co.uk/test/updateWorker.php", {
                'id': worker.id, 'wage':worker.wage, 'name':worker.name
            })
            .success(function (data, status, headers, config) {
                console.log("edited worker successfully", worker.id);
                $scope.getWorkers();
            })
            .error(function (data, status, headers, config) {
                console.log("edit worker failed");
            });
    };

    $scope.getWorkerWage = function (id) {
        if(id){
            var result;
            angular.forEach($scope.users, function (value) {
                if (value.id === id) {
                    result = value.wage;
                }
            });
            return parseFloat(result).toFixed(2);
        }
    };

    //raports

    $scope.generateSimpleRapport = function (startDate) {
        console.log($scope.wages);

        var endDate = new Date(startDate - 14*1000*60*60*24);
        var referenceDate;
        $scope.rapportFinal = [];
        var totalWage;
        var selectedWorker;
        startDate.setHours(23);
        startDate.setMinutes(59);
        startDate.setSeconds(59);

        angular.forEach($scope.users, function (worker) {
            totalWage = 0;
            selectedWorker = worker;
            angular.forEach($scope.wages, function (wage) {
                referenceDate = new Date(wage.workDate);
                if (wage.idWorker == selectedWorker.id)  {
                    if (referenceDate > endDate && referenceDate <= startDate) {
                        // console.log(wage.idWorker, wage.wage, wage.hours, wage.workDate);
                        totalWage += Number(wage.wage) * Number(wage.hours);
                    }
                }
            });
            $scope.rapportFinal.push({name: selectedWorker.name, total: totalWage.toFixed(2)});
        });
        console.log($scope.rapportFinal);
    };

    $scope.generateComplexRapport = function (startDate) {

    };

}]);

angular.module('myApp').controller('WorkerModalInstanceCtrl', function ($scope, $uibModalInstance, worker) {
    worker.id = parseFloat(worker.id);
    worker.wage = parseFloat(worker.wage);

    $scope.workerModal = worker;


    $scope.ok = function () {
        $uibModalInstance.close($scope.workerModal);
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
});