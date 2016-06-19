// (function() {
// 'use strict';

//     angular
//         .module('app.config')
//         .factory('Modal', Modal);

//     Modal.$inject = ['$uibModal'];
//     function Modal($uibModal) {
//         var service = {
//             open:open
//         };
        
//         return service;

//         ////////////////
//         function open(size, title, content) { 
//           return $uibModal.open({
//             animation: true,
//             templateUrl: '/config/modal/modal.html',
//             controller: 'ModalController',
//             controllerAs: 'vm',
//             size: size,
//             resolve: {
//               title: function () {
//                 return title;
//               },
//               content: function() {
//                 return content;
//               }
//             }
//           });
//         }
//     }
// })();