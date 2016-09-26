var ns = require('ns');

describe('ns-model-edefine', function() {
    beforeEach(function() {
        this.tested = ns.Model.edefine;
    });

    describe('наследование событий', function() {
        it('ребенок должен отнаследовать события', function() {
            ns.Model.define('base', {
                events: { 'event1': 'method1' }
            });

            ns.Model.define('mixin', {
                events: { 'event2': 'method2' }
            });

            this.tested('child-events-inherit1', {
                events: { 'event3': 'method3' }
            }, 'mixin', 'base');

            var info = ns.Model.info('child-events-inherit1');
            expect(info.events).to.be.eql({
                'event3': 'method3',
                'event2': 'method2',
                'event1': 'method1'
            });
        });

        it('колбеки одинаковых событий объединяются', function() {
            var spy1 = this.sinon.spy();
            var spy2 = this.sinon.spy();

            ns.Model.define('base', {
                events: { 'event': spy1 }
            });

            this.tested('child-events-inherit2', {
                events: { 'event': spy2 }
            }, 'base');

            var info = ns.Model.info('child-events-inherit2');
            info.events[ 'event' ]();

            expect(spy1.callCount).to.be.equal(1);
            expect(spy2.callCount).to.be.equal(1);
            expect(spy2.calledAfter(spy1)).to.be.ok;
        });

        it('колбек миксина дитя должен быть вызван после колбека предка и до колбека дитя', function() {
            var spy1 = this.sinon.spy();
            var spy2 = this.sinon.spy();
            var spy3 = this.sinon.spy();

            ns.Model.define('base', {
                events: { 'event': spy1 }
            });

            ns.Model.define('mixin', {
                events: { 'event': spy2 }
            });

            this.tested('child-events-inherit3', {
                events: { 'event': spy3 }
            }, 'mixin', 'base');

            var info = ns.Model.info('child-events-inherit3');
            info.events[ 'event' ]();

            expect(spy1.callCount).to.be.equal(1);
            expect(spy2.callCount).to.be.equal(1);
            expect(spy3.callCount).to.be.equal(1);
            expect(spy2.calledAfter(spy1)).to.be.ok;
            expect(spy3.calledAfter(spy2)).to.be.ok;
        });

        it('колбеки вызываются в контексте создаваемого объекта модели', function() {
            var spy1 = this.sinon.spy();
            var spy2 = this.sinon.spy();
            var spy3 = this.sinon.spy();
            var spy4 = this.sinon.spy();

            ns.Model.define('sbase');
            ns.Model.define('bmixin', { events: { 'ns-model-init': spy1 } });
            this.tested('base', { events: { 'ns-model-init': spy2 } }, 'bmixin', 'sbase');
            ns.Model.define('mixin', { events: { 'ns-model-init': spy3 } });
            this.tested('child-events-inherit4', { events: { 'ns-model-init': spy4 } }, 'mixin', 'base');

            var model = ns.Model.get('child-events-inherit4');

            expect(spy1.calledOn(model)).to.be.ok;
            expect(spy2.calledOn(model)).to.be.ok;
            expect(spy3.calledOn(model)).to.be.ok;
            expect(spy4.calledOn(model)).to.be.ok;
        });
    });

    describe('конструктор', function() {
        it('конструктор предка должен быть вызван перед конструктором вида', function() {
            var spy1 = this.sinon.spy();
            var spy2 = this.sinon.spy();

            ns.Model.define('base', { ctor: spy1 });
            this.tested('child-ctor-inherit1', { ctor: spy2 }, 'base');

            var info = ns.Model.info('child-ctor-inherit1');
            info.ctor();

            expect(spy1.callCount).to.be.equal(1);
            expect(spy2.callCount).to.be.equal(1);
            expect(spy2.calledAfter(spy1)).to.be.ok;
        });

        it('конструктор миксина дитя должен быть вызван после конструктора предка и до конструктора дитя', function() {
            var spy1 = this.sinon.spy();
            var spy2 = this.sinon.spy();
            var spy3 = this.sinon.spy();

            ns.Model.define('base', { ctor: spy1 });
            ns.Model.define('mixin', { ctor: spy2 });
            this.tested('child-ctor-inherit2', { ctor: spy3 }, 'mixin', 'base');

            var info = ns.Model.info('child-ctor-inherit2');
            info.ctor();

            expect(spy1.callCount).to.be.equal(1);
            expect(spy2.callCount).to.be.equal(1);
            expect(spy3.callCount).to.be.equal(1);
            expect(spy2.calledAfter(spy1)).to.be.ok;
            expect(spy3.calledAfter(spy2)).to.be.ok;
        });

        it('конструктор миксина предка должен быть вызван до конструктора предка', function() {
            var spy1 = this.sinon.spy();
            var spy2 = this.sinon.spy();
            var spy3 = this.sinon.spy();
            var spy4 = this.sinon.spy();

            ns.Model.define('sbase');
            ns.Model.define('bmixin', { ctor: spy1 });
            this.tested('base', { ctor: spy2 }, 'bmixin', 'sbase');
            ns.Model.define('mixin', { ctor: spy3 });
            this.tested('child-ctor-inherit3', { ctor: spy4 }, 'mixin', 'base');

            var info = ns.Model.info('child-ctor-inherit3');
            info.ctor();

            expect(spy1.callCount).to.be.equal(1);
            expect(spy2.callCount).to.be.equal(1);
            expect(spy3.callCount).to.be.equal(1);
            expect(spy4.callCount).to.be.equal(1);
            expect(spy2.calledAfter(spy1)).to.be.ok;
            expect(spy3.calledAfter(spy2)).to.be.ok;
            expect(spy4.calledAfter(spy3)).to.be.ok;
        });

        it('конструктор вызывается в контексте создаваемого объекта вида', function() {
            var spy1 = this.sinon.spy();
            var spy2 = this.sinon.spy();
            var spy3 = this.sinon.spy();
            var spy4 = this.sinon.spy();

            ns.Model.define('sbase');
            ns.Model.define('bmixin', { ctor: spy1 });
            this.tested('base', { ctor: spy2 }, 'bmixin', 'sbase');
            ns.Model.define('mixin', { ctor: spy3 });
            this.tested('child-ctor-inherit4', { ctor: spy4 }, 'mixin', 'base');

            var model = ns.Model.get('child-ctor-inherit4');

            expect(spy1.calledOn(model)).to.be.ok;
            expect(spy2.calledOn(model)).to.be.ok;
            expect(spy3.calledOn(model)).to.be.ok;
            expect(spy4.calledOn(model)).to.be.ok;
        });
    });

    describe('наследование методов', function() {
        it('методы миксинов и потомка объединяются', function() {
            ns.Model.define('sbase');
            ns.Model.define('bmixin', { methods: { fn1: function() {} } });
            this.tested('base', { methods: { fn2: function() {} } }, 'bmixin', 'sbase');
            ns.Model.define('mixin', { methods: { fn3: function() {} } });
            this.tested('child-methods-inherit1', { methods: { fn4: function() {} } }, 'mixin', 'base');

            var model = ns.Model.get('child-methods-inherit1');

            expect(model).to.respondTo('fn1');
            expect(model).to.respondTo('fn2');
            expect(model).to.respondTo('fn3');
            expect(model).to.respondTo('fn4');
        });

        it('метод потомка должен переопределить метод миксина', function() {
            var spy2 = this.sinon.spy();
            var spy3 = this.sinon.spy();

            ns.Model.define('mixin', { methods: { fn: spy2 } });
            this.tested('child-methods-inherit2', { mixins: [ 'mixin' ], methods: { fn: spy3 } });

            var model = ns.Model.get('child-methods-inherit2');
            model.fn();

            expect(spy2.callCount).to.be.equal(0);
            expect(spy3.callCount).to.be.equal(1);
        });

        it('метод потомка должен переопределить метод предка', function() {
            var spy1 = this.sinon.spy();
            var spy2 = this.sinon.spy();

            ns.Model.define('base', { methods: { fn: spy1 } });
            this.tested('child-methods-inherit3', { methods: { fn: spy2 } }, 'base');

            var model = ns.Model.get('child-methods-inherit3');
            model.fn();

            expect(spy1.callCount).to.be.equal(0);
            expect(spy2.callCount).to.be.equal(1);
        });

        it('миксины перебивают методы других миксинов в порядке перечисления', function() {
            var spy1 = this.sinon.spy();
            var spy2 = this.sinon.spy();

            ns.Model.define('mixin1', { methods: { fn: spy1 } });
            ns.Model.define('mixin2', { methods: { fn: spy2 } });
            this.tested('child-methods-inherit4', { mixins: [ 'mixin1', 'mixin2' ] });

            var model = ns.Model.get('child-methods-inherit4');
            model.fn();

            expect(spy1.callCount).to.be.equal(0);
            expect(spy2.callCount).to.be.equal(1);
        });
    });

    describe('миксины через свойство mixins', function() {
        it('события миксинов, указанных в mixins, вызываются перед событиями, указанными в аргументах, но до событий дитя', function() {
            var spy1 = this.sinon.spy();
            var spy2 = this.sinon.spy();
            var spy3 = this.sinon.spy();

            ns.Model.define('base');
            ns.Model.define('mixin1', { ctor: spy1 });
            ns.Model.define('mixin2', { ctor: spy2 });
            this.tested('child-mixins-inherit1', {
                mixins: [ 'mixin1' ],
                ctor: spy3
            }, 'mixin2', 'base');

            var info = ns.Model.info('child-mixins-inherit1');
            info.ctor();

            expect(spy1.callCount).to.be.equal(1);
            expect(spy2.callCount).to.be.equal(1);
            expect(spy3.callCount).to.be.equal(1);
            expect(spy2.calledAfter(spy1)).to.be.ok;
            expect(spy3.calledAfter(spy2)).to.be.ok;
        });

        it('колбеки вызываются в порядке перечисления', function() {
            var spy1 = this.sinon.spy();
            var spy2 = this.sinon.spy();
            var spy3 = this.sinon.spy();

            ns.Model.define('mixin1', { ctor: spy1 });
            ns.Model.define('mixin2', { ctor: spy2 });
            this.tested('child-mixins-inherit2', {
                mixins: [ 'mixin1', 'mixin2' ],
                ctor: spy3
            });

            var info = ns.Model.info('child-mixins-inherit2');
            info.ctor();

            expect(spy1.callCount).to.be.equal(1);
            expect(spy2.callCount).to.be.equal(1);
            expect(spy3.callCount).to.be.equal(1);
            expect(spy2.calledAfter(spy1)).to.be.ok;
            expect(spy3.calledAfter(spy2)).to.be.ok;
        });

        it('для миксинов в аргументах колбеки вызываются в порядке перечисления', function() {
            var spy1 = this.sinon.spy();
            var spy2 = this.sinon.spy();
            var spy3 = this.sinon.spy();

            ns.Model.define('mixin1', { ctor: spy1 });
            ns.Model.define('mixin2', { ctor: spy2 });
            this.tested('child-mixins-inherit2', {
                ctor: spy3
            }, 'mixin1', 'mixin2', ns.Model);

            var info = ns.Model.info('child-mixins-inherit2');
            info.ctor();

            expect(spy1.callCount).to.be.equal(1);
            expect(spy2.callCount).to.be.equal(1);
            expect(spy3.callCount).to.be.equal(1);
            expect(spy2.calledAfter(spy1)).to.be.ok;
            expect(spy3.calledAfter(spy2)).to.be.ok;
        });
    });
});
