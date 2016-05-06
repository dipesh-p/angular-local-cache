/**
 * @author Dipesh Patel <masterdipesh@gmail.com>
 * @file angular-local-cache-0.0.1.js
 * @version 0.0.1 - Homepage <https://github.com/masterdipesh/angular-local-cache/>
 * @copyright (c) 2014 Dipesh Patel <https://github.com/masterdipesh/angular-local-cache>
 * @license MIT <https://github.com/masterdipesh/angular-local-cache/wiki/LICENSE>
 *
 * @overview AngularJS Module to support local cache supporting the expiry of individual key.
 */
var AngularLocalCache=angular.module('$ngLocalCache',[]);

AngularLocalCache.provider('$ngLocalCache',function(){
	var options={
		'keyPrefix':'ngLC',
		'capacity':100, //Maximum items that can be hold by cache
		'defaultMaxAge': 900000, //Maximum time( milli seconds) for which each item will be cached, it will be overridden by passing at individual key, default is 15 mins
		'recycleFrequency': 60000 //Time after which expiry of each item in the cache will be checked, default: 60 seconds
	};
	
	this.setCacheOptions=function(option){
		for(key in option)
			if(options[key]!=undefined)
				options[key]=option[key];
	}
	var keys={};
	var keys_index=[];

	function init(){
		try{
			for(var i = 0; i < localStorage.length; i++){
				var key = localStorage.key(i);
				//localStorage.removeItem(key);
				if(key.indexOf(options.keyPrefix+"-")===0){
					keys_index.push(key.replace(options.keyPrefix + "-", ""));
					keys[key.replace(options.keyPrefix + "-", "")] = JSON.parse(localStorage.getItem(key));
				}else{
					keys[key] = localStorage.getItem(key);
				}
			}
		}catch(e){
		}
	}
	init();

	this.$get=['$timeout',function($timeout){

		//Function running at every recycleFrequency milliseconds to remove expired items from cache
		$timeout(expireCacheItem,options.recycleFrequency);
		var expireCacheItem=function(){
			var current_ts=(new Date().getTime());
			for(var ind in keys_index){
				if(keys[keys_index[ind]].expire_at<=current_ts){
					delete keys[keys_index[ind]];
					delete keys_index[ind];
					localStorage.removeItem(options.keyPrefix+"-"+keys_index[ind]);
				}
			}
			$timeout(expireCacheItem,options.recycleFrequency);
		}
		// Function to check whether browser supports local storage or not
		var browserSupportsLocalStorage = function () {
			try {
				var isSupported = ('localStorage' in window && window['localStorage'] !== null);
				/*
					In OS X or iOS in Private Browsing Mode, it seems to support localStorage, 
					but when setItem is called it throws QUOTA_EXCEEDED_ERR
				*/
				var key = options.keyPrefix + '__' + Math.round(Math.random() * 1e7);
				if (isSupported) {
				  localStorage.setItem(key, '');
				  localStorage.removeItem(key);
				}
				return isSupported;
		  	} catch (e) {
				return false;
		  	}
		};
		// Function to check whetther browser supports cookies or not
		var browserSupportsCookies = function() {
			try {
				return navigator.cookieEnabled ||
				("cookie" in document && (document.cookie.length > 0 ||
					(document.cookie = "test").indexOf.call(document.cookie, "test") > -1));
			} 
			catch (e) {
				return false;
			}
		};
		
		var put=function(key,data,expiry_ts){
			if(expiry_ts==undefined) expiry_ts=options.defaultMaxAge;
			if(keys.length>=options.capacity){
				delete keys[keys_index[0]];
				if(browserSupportsLocalStorage())
					localStorage.removeItem(options.keyPrefix+"-"+keys_index[0]);
				delete keys_index[0];
			}
			keys[key]={
				data:data,
				expire_at:(new Date().getTime()+expiry_ts),
			};
			keys_index.push(key);
			if(browserSupportsLocalStorage()){
				localStorage.setItem(options.keyPrefix+"-"+key,JSON.stringify(keys[key]));
			}
			return true;
		}
		var get=function(key){
			if(keys[key]!=undefined){
				if(keys[key].expire_at>(new Date().getTime()))
					return keys[key].data;
				else return null;
			}
			return null;
		}
		var remove=function(key){
			for(ind in keys_index){
				if(keys_index[ind]==key){
					delete keys_index[ind];
				}
			}
			delete keys[key];
			if(browserSupportsLocalStorage())
				localStorage.removeItem(options.keyPrefix+"-"+key);
			return true;
		}

		return{
			'get':get,
			'put':put,
			'delete':remove
		};
	}];
});