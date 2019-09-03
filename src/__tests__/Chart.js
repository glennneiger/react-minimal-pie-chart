import React from 'react';
import { shallow, mount } from 'enzyme';
import PieChart from '../../src/index';

const dataMock = [
  { value: 10, color: 'blue' },
  { value: 15, color: 'orange' },
  { value: 20, color: 'green' },
];

const expectedNormalizedDataMock = {
  x: expect.any(Number),
  y: expect.any(Number),
  dx: expect.any(Number),
  dy: expect.any(Number),
  textAnchor: expect.any(String),
  data: dataMock.map(entry => ({
    ...entry,
    degrees: expect.any(Number),
    startOffset: expect.any(Number),
    percentage: expect.any(Number),
  })),
  dataIndex: expect.any(Number),
  color: expect.any(String),
};

const styleMock = {
  color: 'green',
};

jest.useFakeTimers();

beforeAll(() => {
  global.requestAnimationFrame = callback => {
    callback();
    return 'id';
  };
});

function render(props, renderer = shallow) {
  const defaultProps = { data: dataMock };
  return renderer(<PieChart {...defaultProps} {...props} />);
}

describe('ReactMinimalPieChart', () => {
  it('returns null if props.data is undefined', () => {
    const wrapper = render({
      data: undefined,
    });
    expect(wrapper.getElement()).toEqual(null);
  });

  it('returns a Path component for each entry in props.data', () => {
    const wrapper = render();
    const pathElements = wrapper.find('ReactMinimalPieChartPath');
    expect(pathElements.length).toEqual(dataMock.length);
  });

  it('passes down className and style props to the wrapping div', () => {
    const wrapper = render({
      className: 'foo',
      style: styleMock,
    });
    expect(wrapper.prop('className')).toBe('foo');
    expect(wrapper.prop('style')).toEqual(styleMock);
  });

  describe('<svg> element', () => {
    it('is horizontal when "ratio" > 1', () => {
      const wrapper = render({
        ratio: 4,
      });
      const svg = wrapper.find('svg').first();
      expect(svg.prop('viewBox')).toBe('0 0 100 25');
    });

    it('is certical when "ratio" < 1', () => {
      const wrapper = render({
        ratio: 1 / 10,
      });
      const svg = wrapper.find('svg').first();
      expect(svg.prop('viewBox')).toBe('0 0 10 100');
    });
  });

  describe('Partial circle', () => {
    it('renders a set of arc paths having total lengthAngle === 270°', () => {
      const pieLengthAngle = 270;
      let pathsTotalLengthAngle = 0;

      const wrapper = render({
        lengthAngle: pieLengthAngle,
      });
      const paths = wrapper.find('ReactMinimalPieChartPath');
      paths.forEach(path => {
        pathsTotalLengthAngle += path.prop('lengthAngle');
      });

      expect(pieLengthAngle).toEqual(pathsTotalLengthAngle);
    });

    it('renders a set of arc paths having total negative lengthAngle === -270°', () => {
      const pieLengthAngle = -270;
      let pathsTotalLengthAngle = 0;

      const wrapper = render({
        lengthAngle: pieLengthAngle,
      });
      const paths = wrapper.find('ReactMinimalPieChartPath');
      paths.forEach(path => {
        pathsTotalLengthAngle += path.prop('lengthAngle');
      });

      expect(pieLengthAngle).toEqual(pathsTotalLengthAngle);
    });
  });

  describe('Rendered Paths', () => {
    it('receives the custom "reveal" prop', () => {
      const wrapper = render({
        reveal: 22,
      });
      wrapper.find('ReactMinimalPieChartPath').forEach(path => {
        expect(path.prop('reveal')).toBe(22);
      });
    });

    it('receives "segmentsStyle" and "data.style" props', () => {
      const segmentsStyle = {
        foo: 'bar',
      };
      const dataStyle = {
        bar: 'foo',
      };
      const dataMockWithStyle = dataMock.map(entry => ({
        ...entry,
        ...{ style: dataStyle },
      }));

      const wrapper = render({
        data: dataMockWithStyle,
        segmentsStyle: segmentsStyle,
      });
      wrapper.find('ReactMinimalPieChartPath').forEach(path => {
        expect(path.prop('style')).toEqual(
          expect.objectContaining(segmentsStyle)
        );
        expect(path.prop('style')).toEqual(expect.objectContaining(dataStyle));
      });
    });
  });

  describe('"paddingAngle"', () => {
    it('renders a set of arc paths + paddings with total length === "lengthAngle"', () => {
      const pieLengthAngle = 300;
      let pathsTotalLengthAngle = 0;
      const totalPaddingDegrees = 10 * (dataMock.length - 1);

      const wrapper = render({
        lengthAngle: pieLengthAngle,
        paddingAngle: 10,
      });
      const paths = wrapper.find('ReactMinimalPieChartPath');
      paths.forEach(path => {
        pathsTotalLengthAngle += path.prop('lengthAngle');
      });

      expect(pieLengthAngle).toEqual(
        pathsTotalLengthAngle + totalPaddingDegrees
      );
    });
  });

  describe('"background"', () => {
    describe('Renders a background segment as long as the whole chart', () => {
      const wrapper = render({
        startAngle: 0,
        lengthAngle: 200,
        background: 'green',
      });
      const backgroundPath = wrapper.find('ReactMinimalPieChartPath').at(0);
      const segmentsPath = wrapper.find('ReactMinimalPieChartPath').at(1);
      const expectedProps = {
        cx: segmentsPath.prop('cx'),
        cy: segmentsPath.prop('cy'),
        startAngle: 0,
        lengthAngle: 200,
        radius: segmentsPath.prop('radius'),
        lineWidth: segmentsPath.prop('lineWidth'),
        stroke: 'green',
        strokeLinecap: undefined,
        fill: 'none',
      };

      expect(backgroundPath.key()).toBe('bg');
      expect(backgroundPath.props()).toEqual(expectedProps);
    });
  });

  describe('"animate"', () => {
    describe('Segments "style.transition" prop', () => {
      it('receives "stroke-dashoffset" transition prop with custom duration/easing', () => {
        const wrapper = render({
          animate: true,
          animationDuration: 100,
          animationEasing: 'ease',
        });
        const firstPath = wrapper.find('ReactMinimalPieChartPath').first();
        const expected = 'stroke-dashoffset 100ms ease';
        const actual = firstPath.prop('style').transition;

        expect(actual).toEqual(expected);
      });

      it('merges autogenerated CSS transition prop with the one optionally provided by "segmentsStyle"', () => {
        const wrapper = render({
          segmentsStyle: {
            transition: 'custom-transition',
          },
          animate: true,
          animationDuration: 100,
          animationEasing: 'ease',
        });
        const firstPath = wrapper.find('ReactMinimalPieChartPath').first();

        const expected = 'stroke-dashoffset 100ms ease,custom-transition';
        const actual = firstPath.prop('style').transition;
        expect(actual).toEqual(expected);
      });
    });

    describe('Initial animation cycle', () => {
      it(`- 1st render: force segments' "reveal" to 0
          - 2nd render (didMount): (didMount) force segments\' "reveal" to 100
          - 3nd render (after initial animation - onTransitionEnd): reset "reveal" to undefined'
        `, () => {
        const wrapper = render({
          animate: true,
        });
        let firstPath = wrapper.find('ReactMinimalPieChartPath').first();
        expect(firstPath.prop('reveal')).toEqual(0);

        jest.runAllTimers();

        firstPath = wrapper.find('ReactMinimalPieChartPath').first();
        expect(firstPath.prop('reveal')).toEqual(100);

        firstPath.simulate('transitionEnd');
        firstPath = wrapper.find('ReactMinimalPieChartPath').first();
        expect(firstPath.prop('reveal')).toBe(undefined);
      });

      describe('with reveal', () => {
        it(`
        - 1st render: force segments' "reveal" to 0
        - 2nd render (didMount): render segments\' with provided reveal prop
        - 3nd render (after initial animation - onTransitionEnd): no changes'
      `, () => {
          const wrapper = render({
            animate: true,
            reveal: 50,
          });
          let firstPath = wrapper.find('ReactMinimalPieChartPath').first();
          expect(firstPath.prop('reveal')).toEqual(0);

          jest.runAllTimers();

          firstPath = wrapper.find('ReactMinimalPieChartPath').first();
          expect(firstPath.prop('reveal')).toEqual(50);

          firstPath.simulate('transitionEnd');
          firstPath = wrapper.find('ReactMinimalPieChartPath').first();
          expect(firstPath.prop('reveal')).toEqual(50);
        });
      });
    });

    it('does not re-render when component is unmounted', () => {
      // Simulate edge case of animation fired after component was unmounted
      // See: https://github.com/toomuchdesign/react-minimal-pie-chart/issues/8
      const wrapper = render({
        animate: true,
      });
      const chartInstance = wrapper.instance();
      chartInstance.startAnimation = jest.fn();

      wrapper.unmount();
      jest.runAllTimers();

      expect(chartInstance.startAnimation).not.toHaveBeenCalled();
    });
  });

  describe('"data.title"', () => {
    it('renders a <Title> element in its Path', () => {
      const wrapper = render(
        { data: [{ title: 'title-value', value: 10, color: 'blue' }] },
        mount
      );

      const title = wrapper.find('title');
      expect(title.length).toEqual(1);
      expect(title.text()).toEqual('title-value');
    });
  });

  describe('"label"', () => {
    describe('true', () => {
      it('renders 3 <text> elements with expected text and "fill" attribute', () => {
        const wrapper = render({ label: true }, mount);
        const labels = wrapper.find('text');
        expect(labels.length).toBe(dataMock.length);

        labels.forEach((label, index) => {
          expect(label.text()).toBe(`${dataMock[index].value}`);
          expect(label.prop('fill')).toBe(dataMock[index].color);
        });
      });
    });

    describe('provided as function returning a value', () => {
      it('renders 3 <text> elements with custom content', () => {
        const wrapper = render({
          label: props => props.dataIndex,
        });
        const labels = wrapper.find('text');
        labels.forEach((label, index) => {
          expect(label.text()).toBe(`${index}`);
        });
      });

      it('provided function receive expected "props" object', () => {
        const labelMock = jest.fn();
        render(
          {
            label: labelMock,
          },
          mount
        );

        const actual = labelMock.mock.calls[0][0];
        const expected = {
          key: expect.any(String),
          ...expectedNormalizedDataMock,
        };

        expect(actual).toEqual(expected);
      });
    });

    describe('provided as function returning an element', () => {
      it('renders returned elements', () => {
        const wrapper = render(
          {
            label: props => (
              <text key={props.dataIndex}>{props.dataIndex}</text>
            ),
          },
          mount
        );

        const labels = wrapper.find('text');
        labels.forEach((label, index) => {
          expect(label.text()).toBe(`${index}`);
        });
      });
    });

    describe('provided as component', () => {
      it('renders with expected props', () => {
        const ComponentMock = jest.fn();
        const wrapper = render({
          label: <ComponentMock />,
        });

        const actual = wrapper
          .find(ComponentMock)
          .first()
          .props();
        const expected = expectedNormalizedDataMock;
        expect(actual).toEqual(expected);
      });
    });
  });

  describe('"labelStyle"', () => {
    it('assign provided value to each label as className', () => {
      const styleMock = { foo: 'bar' };
      const wrapper = render(
        {
          label: true,
          labelStyle: styleMock,
        },
        mount
      );

      const labels = wrapper.find('text');
      labels.forEach(label => {
        expect(label.prop('style')).toEqual(styleMock);
      });
    });
  });

  describe('"injectSvg"', () => {
    it('injects anything into rendered <svg>', () => {
      const wrapper = render({
        injectSvg: () => <defs />,
      });

      const svg = wrapper.find('svg').first();
      const injectedElement = svg.find('defs');
      expect(injectedElement.length).toEqual(1);
    });
  });

  describe('Mouse interactions', () => {
    [
      { eventName: 'onClick', enzymeAction: 'click' },
      { eventName: 'onMouseOver', enzymeAction: 'mouseover' },
      { eventName: 'onMouseOut', enzymeAction: 'mouseout' },
    ].forEach(test => {
      describe(test.eventName, () => {
        it('its interaction callback with expected arguments', () => {
          const eventMock = jest.fn();
          const eventCallbackMock = jest.fn();
          const wrapper = render({
            onClick: eventCallbackMock,
            onMouseOver: eventCallbackMock,
            onMouseOut: eventCallbackMock,
          });
          const segment = wrapper.find('ReactMinimalPieChartPath').first();
          segment.simulate(test.enzymeAction, eventMock);

          expect(eventCallbackMock).toHaveBeenCalledTimes(1);
          expect(eventCallbackMock).toHaveBeenLastCalledWith(
            eventMock,
            dataMock,
            0
          );
        });
      });
    });
  });
});
