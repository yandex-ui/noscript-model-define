# noscript-model-define

[![Code Climate](https://codeclimate.com/github/yandex-ui/noscript-model-define/badges/gpa.svg)](https://codeclimate.com/github/yandex-ui/noscript-model-define)
[![Test Coverage](https://codeclimate.com/github/yandex-ui/noscript-model-define/badges/coverage.svg)](https://codeclimate.com/github/yandex-ui/noscript-model-define/coverage)

Плагин для noscript, улучшающий наследование Model.
Доблавляет новые возможности:
 * множественное наследование (через миксины)
 * наследование деклараций событий
 * сохранение цепочки вызова конструкторов
 * сохранение цепочки вызова колбеков событий

## Множественное наследование
```js
ns.Model.edefine('my-child', {
}, 'myMixinModel1', 'myMixinModel2', 'myParentModel');
```

Либо указание миксинов в свойстве `mixins`.
```js
ns.Model.edefine('my-child', {
    mixins: [ 'myMixinModel1' ]
}, 'myMixinModel2', 'myParentModel');
```

Т.к. в JavaScript нельзя реализовать множественное наследование, не изменив цепочку прототипов родителей,
то наследование реализовано следующий образом:
 * миксинами являются все виды, объявленные в свойстве `mixins` и виды, переданные в аргументы, кроме последнего
 * последний вид в аргументах является предком
 * методы миксинов микшируются в прототип наследника
 * предок становится родителем в прототип
 * одноименные методы переопределяются миксинами в порядке их перечисления, потомок переопределяет любой метод
 * события, модели и конструкторы объединяются в потомке со всех миксинов и предка

## Наследование деклараций событий

Все событий из декларации `events` у `parent` и миксинов будут переданы в декларацию `child`.
```js
ns.Model.define('parent', {
    events: {
        'event': 'callback-parent',
        'event1': 'callback-parent1'
    }
});

ns.Model.define('mixin1', {
    events: {
        'event': 'callback-mixin1'
    }
});

ns.Model.define('mixin2', {
    events: {
        'event': 'callback-mixin2'
    }
});

ns.Model.edefine('child', {
    mixins: [ 'mixin1' ],
    events: {
        'event': 'callback-child'
    }
}, 'mixin2', 'parent');
```

В результате декларация событий `child` будет иметь вид:
```js
events: {
    'event': function wrapper() { /* ... */ },
    'event1': 'callback-parent1'
}
```

Колбеки на одинаковое событие будут объединены в один метод.

## Цепочка вызовов

Последовательность вызовов конструкторов и колбеков на одинаковое событие общая - всегда от предка через миксины к потомку:
```
... ->
callback-parent-mixinN ->
callback-parent ->
callback-child-mixin1 ->
... ->
callback-child-mixinN ->
callback-child
```

Вначале вызываются колбеки миксинов, объявленных в свойстве `mixins`, а потом миксины в аргументах.
Вызов выполняется в порядке перечисления.
