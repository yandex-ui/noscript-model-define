/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _require = __webpack_require__(1);

	var clone = _require.clone;
	var concat = _require.concat;
	var defaults = _require.defaults;
	var get = _require.get;
	var invoke = _require.invoke;
	var isFunction = _require.isFunction;
	var isString = _require.isString;
	var isUndefined = _require.isUndefined;
	var last = _require.last;
	var map = _require.map;
	var mergeWith = _require.mergeWith;
	var pick = _require.pick;
	var reverse = _require.reverse;
	var spread = _require.spread;
	var wrap = _require.wrap;


	var ns = __webpack_require__(2);

	/**
	 * Свойства, которые будут учтены при объединении миксинов.
	 * Порядок важен: первым должны объединить методы.
	 * @type {array}
	 */
	var PATH_EXTENDS = ['methods', 'ctor', 'events'];

	/**
	 * Свойства, которые будут учтены при объединении предка.
	 * @type {array}
	 */
	var PATH_PARENT_EXTENDS = ['ctor', 'events'];

	/**
	 * Объединение объектов, переданных в виде массива.
	 * @type {function}
	 */
	var spreadMergeWith = spread(mergeWith);

	/**
	 * Вывод предупреждения в консоль
	 * @type {function}
	 */
	var warn = wrap(invoke, function (func) {
	    for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
	        args[_key - 1] = arguments[_key];
	    }

	    var text = args.shift();
	    func.apply(undefined, [window, 'console.warn', '[ns.Model.define] ' + text].concat(args));
	});

	/**
	 * Вывод лога в консоль
	 * @type {function}
	 */
	var log = wrap(invoke, function (func) {
	    for (var _len2 = arguments.length, args = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
	        args[_key2 - 1] = arguments[_key2];
	    }

	    var text = args.shift();
	    func.apply(undefined, [window, 'console.log', '[ns.Model.define] ' + text].concat(args));
	});

	function wrapperEvents(srcFunc, objFunc) {
	    for (var _len3 = arguments.length, args = Array(_len3 > 2 ? _len3 - 2 : 0), _key3 = 2; _key3 < _len3; _key3++) {
	        args[_key3 - 2] = arguments[_key3];
	    }

	    var resultSrc = srcFunc && (isFunction(srcFunc) ? srcFunc.apply(this, args) : invoke.apply(undefined, [this, srcFunc].concat(args)));
	    var resultObj = objFunc && (isFunction(objFunc) ? objFunc.apply(this, args) : invoke.apply(undefined, [this, objFunc].concat(args)));

	    if (ns.DEBUG && !(isUndefined(resultSrc) && isUndefined(resultObj))) {
	        warn('Обработчик события не должен возвращать результат');
	    }
	}

	/**
	 * Объединение колбеков одинаковых событий
	 * @param {string|function} objValue
	 * @param {string|function} srcValue
	 * @returns {string|function}
	 */
	function eventsCustomizer(objValue, srcValue) {
	    if (checkIgnoreMerge(objValue, srcValue)) {
	        return srcValue;
	    }

	    return wrap(objValue, wrap(srcValue, wrapperEvents));
	}

	/**
	 * Объединение объектов событий
	 * @param {Object} objValue
	 * @param {Object} srcValue
	 * @returns {Object}
	 */
	function groupEventsCustomizer(objValue, srcValue) {
	    if (checkIgnoreMerge(objValue, srcValue)) {
	        return srcValue;
	    }

	    return mergeWith(objValue, srcValue, eventsCustomizer);
	}

	/**
	 * Объединение методов и свойств.
	 * Методы и свойства переопределяются в порядке перечисления миксинов.
	 * Дитё переопределяет любой метод и свойство.
	 * @param {*} objValue
	 * @param {*} srcValue
	 * @returns {*}
	 */
	function methodsCustomizer(objValue, srcValue) {
	    if (checkIgnoreMerge(objValue, srcValue)) {
	        return srcValue;
	    }

	    return objValue;
	}

	/**
	 * Объединения данных при наследовании
	 * @param {*} objValue
	 * @param {*} srcValue
	 * @param {string} key
	 * @returns {*}
	 */
	function mergeCustomizer(objValue, srcValue, key) {
	    if (checkIgnoreMerge(objValue, srcValue)) {
	        return srcValue;
	    }

	    if (key === 'methods') {
	        return mergeWith(objValue, srcValue, methodsCustomizer);
	    }

	    if (key === 'events') {
	        return groupEventsCustomizer(objValue, srcValue);
	    }

	    if (key === 'ctor') {
	        return function () {
	            srcValue && srcValue.call(this);
	            objValue && objValue.call(this);
	        };
	    }
	}

	/**
	 * Получение информации по виду
	 * @param {Object|string} info
	 * @returns {Object}
	 */
	function modelInfo(info) {
	    return isString(info) && ns.Model.infoLite(info) || info;
	}

	/**
	 * Проверка необходимости выполнения слияния
	 * @param {*} objValue
	 * @param {*} srcValue
	 * @returns {boolean}
	 */
	function checkIgnoreMerge(objValue, srcValue) {
	    return isUndefined(objValue) || objValue === srcValue;
	}

	/**
	 * Хелпер для наследования событийных привязок и методов
	 * @param {Object} classExtend Расширяемый объект
	 * @param {Object} child Объект-информация о сущности
	 * @param {array} mixins Массив имен предков
	 * @returns {Object} Модифицированный объект-информация
	 */
	function inheritInfo(classExtend, child, mixins) {
	    mixins = clone(mixins);
	    var parent = modelInfo(mixins.pop());
	    var customizer = mergeCustomizer.bind(classExtend);

	    var info = get(child, 'mixins', []);
	    info = concat(info, mixins);
	    info = reverse(info);
	    info.unshift(child);
	    info = map(info, function (mixin) {
	        return pick(modelInfo(mixin), PATH_EXTENDS);
	    });
	    info.push(customizer);
	    info = spreadMergeWith(info);
	    info = mergeWith(info, pick(parent, PATH_PARENT_EXTENDS), customizer);
	    info = defaults(info, child);

	    return info;
	}

	[ns.Model].forEach(function (classExtend) {

	    /**
	     * Декларация модели
	     * @param {string} id идентификатор модели
	     * @param {Object} info параметры модели
	     * @param {...string|Object} mixins набор миксинов, последним указывается предок
	     * @returns {function} конструктор
	     */
	    classExtend.edefine = function (id, info) {
	        for (var _len4 = arguments.length, mixins = Array(_len4 > 2 ? _len4 - 2 : 0), _key4 = 2; _key4 < _len4; _key4++) {
	            mixins[_key4 - 2] = arguments[_key4];
	        }

	        ns.DEBUG && log('Определение модели %s, mixins: %o, %o', id, mixins, get(info, 'mixins', []));
	        return classExtend.define(id, inheritInfo(classExtend, info, mixins), last(mixins));
	    };
	});

/***/ },
/* 1 */
/***/ function(module, exports) {

	module.exports = _;

/***/ },
/* 2 */
/***/ function(module, exports) {

	module.exports = ns;

/***/ }
/******/ ]);