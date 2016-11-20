import React from 'react';
import Rx from 'rxjs';
import {mount, shallow} from 'enzyme';
import {compose, mapObs} from '../';

describe('mapObs', () => {
  it('should provide observables and map props', () => {
    const baseFoo$ = Rx.Observable.of('foo');
    const Div = compose(
      mapObs(() => ({foo$: baseFoo$})),
      mapObs(({foo$, props$}) => ({
        props$: props$.combineLatest(foo$, (_, foo) => ({className: foo})),
      })),
    )('div');

    const wrapper = mount(<Div />);
    expect(wrapper.find('div').prop('className')).toBe('foo');
  });

  it('should not merge observables', () => {
    const baseFoo$ = Rx.Observable.of({className: 'foo'});
    const Div = compose(
      mapObs(() => ({foo$: baseFoo$})),
      mapObs(() => ({})),
      mapObs(({foo$}) => {
        expect(foo$).toBe(undefined);
        return {};
      }),
    )('div');

    mount(<Div />);
  });

  it('should be merged with other hoc', () => {
    const Div = compose(
      mapObs(() => ({})),
      mapObs(() => ({})),
      mapObs(() => ({})),
    )('div');

    const wrapper = shallow(<Div />);
    expect(wrapper.instance().constructor.displayName).toBe('mapObs(mapObs(mapObs(div)))');
    expect(wrapper.equals(<div />)).toBeTruthy();
  });
});
