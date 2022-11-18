(function (React$1, ReactDOM, ReactDropdown, d3, topojson) {
  'use strict';

  var React$1__default = 'default' in React$1 ? React$1['default'] : React$1;
  ReactDOM = ReactDOM && Object.prototype.hasOwnProperty.call(ReactDOM, 'default') ? ReactDOM['default'] : ReactDOM;
  ReactDropdown = ReactDropdown && Object.prototype.hasOwnProperty.call(ReactDropdown, 'default') ? ReactDropdown['default'] : ReactDropdown;

  const csvUrl =
    'https://gist.githubusercontent.com/lakalia/ca6cc81792b9d357a20cf2f9fd4c7924/raw/gapminder_summary_from_1950.csv';

  const useData = () => {
    const [data, setData] = React$1.useState(null);
    React$1.useEffect(() => {
      const row = (d) => {
        d.year = +d.year;
        d.income_per_cap = +d.income_per_cap;
        d.total_population = +d.total_population;
        d.life_expectancy = +d.life_expectancy;
        d.fertility_rate = +d.fertility_rate;

        //console.log(d); 
        
        //need to filter out rows with 0's
        if (
          d.income_per_cap > 0 &&
          d.total_population > 0 &&
          d.life_expectancy > 0 &&
          d.fertility_rate > 0
        ) {
          return d;
        }
      };
      d3.csv(csvUrl, row).then(setData);
    }, []);
  	//console.log(data);
    return data;
  };

  const jsonUrl = 'https://unpkg.com/world-atlas@2.0.2/countries-50m.json';

  const useWorldAtlas = () => {
    const [data, setData] = React$1.useState(null);

    React$1.useEffect(() => {
      d3.json(jsonUrl).then(topology => {
       // console.log(topology);
        
        const { countries, land } = topology.objects;
        setData({
          land: topojson.feature(topology, land),
          countries: topojson.feature(topology, countries),
          interiors: topojson.mesh(topology, countries, (a, b) => a !== b)
        });
      });
    }, []);
    //console.log(data);
    return data;
  };

  const csvUrl$1 =
    'https://raw.githubusercontent.com/lukes/ISO-3166-Countries-with-Regional-Codes/master/slim-3/slim-3.csv';

  const useCodes = () => {
    const [data, setData] = React$1.useState(null);
    
    React$1.useEffect(() => {
      d3.csv(csvUrl$1).then(setData);
    }, []);
  //console.log(data);
    return data;
  };

  const AxisBottom = ({ xScale, innerHeight, tickFormat, tickOffset = 3 }) =>
    xScale.ticks().map(tickValue => (
      React.createElement( 'g', {
        className: "tick", key: tickValue, transform: `translate(${xScale(tickValue)},0)` },
        React.createElement( 'line', { y2: innerHeight }),
        React.createElement( 'text', { style: { textAnchor: 'middle' }, dy: ".71em", y: innerHeight + tickOffset },
          tickFormat(tickValue)
        )
      )
    ));

  const AxisLeft = ({ yScale, innerWidth, tickFormat, tickOffset = 3 }) =>
    yScale.ticks().map(tickValue => (
      React.createElement( 'g', { className: "tick", transform: `translate(0,${yScale(tickValue)})` },
        React.createElement( 'line', { x2: innerWidth }),
        React.createElement( 'text', {
          key: tickValue, style: { textAnchor: 'end' }, x: -tickOffset, dy: ".32em" },
          tickFormat(tickValue)
        )
      )
    ));

  const ColorLegend = ({
    //NOTE: changes must be made to both True and False sections
    colorScale,
    hoverColor,
    onHover,
    selectedColors,
    onSelectColor,
    offset = 15,
    fadeOp = 0.25,
    visibleOp = 1,
  }) =>
    colorScale.domain().map((domainValue, i) =>
      !domainValue.indexOf('&') ? (
        React.createElement( 'g', {
          transform: `translate(0,${2 * offset + 2 * i * offset})`, onMouseEnter: () => {
            onHover(colorScale(domainValue));
          }, onMouseOut: () => {
            onHover(null);
          }, onClick: () => {
            if (!selectedColors.includes(colorScale(domainValue))) {
              selectedColors.push(colorScale(domainValue));
            } else {
              selectedColors.splice(
                selectedColors.indexOf(colorScale(domainValue)),
                1
              );
            }
            //console.log(SelectedColors);
            return onSelectColor(selectedColors);
          }, opacity: (!hoverColor && selectedColors.length == 0) ||
            hoverColor == colorScale(domainValue) ||
            selectedColors.includes(colorScale(domainValue))
              ? visibleOp
              : fadeOp },
          React.createElement( 'rect', {
            x: "0", y: "0", width: offset, height: 2 * offset, fill: colorScale(domainValue) }),
          React.createElement( 'text', { className: "axis-label", x: 1.5 * offset, dy: offset },
            domainValue.substring(0, domainValue.length)
          )
        )
      ) : (
        React.createElement( 'g', {
          transform: `translate(0,${2 * offset + 2 * i * offset})`, onMouseEnter: () => {
            onHover(colorScale(domainValue));
          }, onMouseOut: () => {
            onHover(null);
          }, onClick: () => {
            if (!selectedColors.includes(colorScale(domainValue))) {
              selectedColors.push(colorScale(domainValue));
            } else {
              selectedColors.splice(
                selectedColors.indexOf(colorScale(domainValue)),
                1
              );
            }
            //console.log(SelectedColors);
            return onSelectColor(selectedColors);
          }, opacity: (!hoverColor && selectedColors.length == 0) ||
            hoverColor == colorScale(domainValue) ||
            selectedColors.includes(colorScale(domainValue))
              ? visibleOp
              : fadeOp },
          React.createElement( 'rect', {
            x: "0", y: "0", width: offset, height: 2 * offset, fill: colorScale(domainValue) }),
          React.createElement( 'text', { className: "axis-label", x: 1.5 * offset, dy: offset },
            domainValue.substring(0, domainValue.indexOf('&') + 1)
          ),
          React.createElement( 'text', { className: "axis-label", x: 1.5 * offset, dy: offset + 13 },
            domainValue.substring(
              domainValue.indexOf('&') + 1,
              domainValue.length
            )
          )
        )
      )
    );

  const Marks = ({
    data,
    xScale,
    yScale,
    xValue,
    yValue,
    sizeScale,
    colorScale,
    colorCategory,
    xAttribute,
    yAttribute
  }) =>
    data.map((d) => {
      const tooltipValue = (d) =>
      d.country.concat(
        xAttribute == 'year' ? ', ' : ' '.concat(d.year, ', '),
        xAttribute,
        ': ',
        d[xAttribute],
        ', ',
        yAttribute,
        ': ',
        d[yAttribute]
      );

      return (
        React.createElement( 'circle', {
          className: "mark", cx: xScale(xValue(d)), cy: yScale(yValue(d)), r: sizeScale(yValue(d)), fill: colorScale(colorCategory(d)) },
          React.createElement( 'title', null, tooltipValue(d) )
        )
      );
    });

  //const projection = geoMercator();
  const projection = d3.geoNaturalEarth1();
  const path = d3.geoPath(projection);

  const Background = ({
    bgdata: { countries, interiors },
    countryColors,
    hoverColor,
    selectedColors,
  }) => {
    const countryColor = (country) => {
      for (let c of countryColors) {
        if (
          country == c.country
            .replace('United States', 'United States of America')
            .replace('Dominican Republic', 'Dominican Rep.')
            .replace('Lao', 'Laos')
            .replace('Central African Republic', 'Central African Rep.')
            .replace('Equatorial Guinea', 'Eq. Guinea')
          //.replace('\u00F4','o')
        ) {
          return hoverColor == c.color || selectedColors.includes(c.color)
            ? c.color
            : '#C0C0BB';
          //return c.color;
        }
      }
    };

    return (
      React.createElement( 'g', { className: "atlas" },
        countries.features.map((feature) => (
          React.createElement( 'path', {
            d: path(feature), fill: countryColor(feature.properties.name)
                ? countryColor(feature.properties.name)
                : '#C0C0BB' })
        )),
        React.createElement( 'path', { className: "interiors", d: path(interiors) })
      )
    );
  };

  const CountryColorsList = (data, colorList, countryCodes) => {
    if (data && countryCodes) {
      //const colorCategory = (d) => d.world_bank_region;
      const colorScale = d3.scaleOrdinal()
        .domain(data.map((d) => d.world_bank_region))
        //.domain(data.map(colorCategory))
        //.range(d3.schemeSet1);
        .range(colorList);

      const countryCode = (d) => {
        for (let i = 0; i < countryCodes.length; i++) {
          if (countryCodes[i]['name'] === d.country) {
            return countryCodes[i]['country-code'];
          }
        }
      };

      const countryColors = [];
      const map = new Map();
      for (const c of data.map((d) => {
        return { country: d.country, region: d.world_bank_region };
      })) {
        if (!map.has(c.country)) {
          map.set(c.country, true);
          countryColors.push({
            country: c.country,
            countryCode: countryCode(c),
            color: colorScale(c.region),
          });
        }
      }
      // add missing countries
         countryColors.push(
        {
          country: 'S. Sudan',
          countryCode: countryCode('S. Sudan'),
          color: '#FEE08B',
        },
        {
          country: 'Congo',
          countryCode: countryCode('Congo'),
          color: '#FEE08B',
        },
        {
          country: 'Dem. Rep. Congo',
          countryCode: countryCode('Dem. Rep. Congo'),
          color: '#FEE08B',
        },
        {
          country: 'Greenland',
          countryCode: countryCode('Greenland'),
          color: '#E6F598',
        }
      );

      //console.log(countryColors);

      return countryColors;
    } else {
      return [];
    }
  };

  const Slider = ({ minYr, maxYr, yrStep, yr, onSlide, sliderHidden }) => (
    sliderHidden == 'visible' ?
    React.createElement( React.Fragment, null,
      React.createElement( 'text', null, "1950" ),
      React.createElement( 'input', {
        class: "slider", list: "tickmarks", type: "range", min: minYr, max: maxYr, step: yrStep, value: yr, onChange: (e) => onSlide(e.target.value) }),
      React.createElement( 'datalist', { id: "tickmarks" },
        React.createElement( 'option', { value: "1950" }),
        React.createElement( 'option', { value: "1975" }),
        React.createElement( 'option', { value: "2000" }),
        React.createElement( 'option', { value: "2015" })
      ),
      React.createElement( 'text', null,
        ' ', "2015 ", React.createElement( 'br', null ), ' '
      ),
      React.createElement( 'label', null, "Year: " ),
      React.createElement( 'text', null, yr )
    ) : React.createElement( React.Fragment, null, " " )
  );

  const width = 960;
  const height = 425;
  const margin = { top: 20, right: 225, bottom: 17, left: 100 };

  const yAttributes = [
    { value: 'income_per_cap', label: 'Income per capita' },
    { value: 'total_population', label: 'Total Population' },
    { value: 'life_expectancy', label: 'Life Expectancy' },
    { value: 'fertility_rate', label: 'Fertility Rate' },
  ];
  const initialYAttribute = 'total_population';

  const xAttributes = [
    { value: 'income_per_cap', label: 'Income per capita' },
    { value: 'total_population', label: 'Total Population' },
    { value: 'life_expectancy', label: 'Life Expectancy' },
    { value: 'fertility_rate', label: 'Fertility Rate' },
    { value: 'year', label: 'Year' },
  ];
  //

  const initialXAttribute = 'income_per_cap';
  //const initialXAttribute = 'year';

  const minYr = 1950;
  const maxYr = 2015;
  const yrStep = 1;
  const initialYr = 1950;

  const colorList = [
    '#FDAE61',
    '#E6F598',
    '#3288BD',
    '#FEE08B',
    '#66C2A5',
    '#D53E4F',
    '#F46D43',
  ];

  const colorLegendLabel1 = 'World Bank';
  const colorLegendLabel2 = 'Global Regions:';

  const titleText1 = 'Gapminder';
  const titleText2 = 'Data';
  const titleText3 = 'by Country';

  // React ftn
  const App = () => {
    const data = useData();
    const bgData = useWorldAtlas();
    const countryCodes = useCodes();

    const countryColors = React$1.useMemo(
      () => CountryColorsList(data, colorList, countryCodes),
      [data, colorList, countryCodes]
    );
    //console.log('just passed countryColors');

    //const hoverColor = null; //= '#FEE08B';
    const [hoverColor, setHoverColor] = React$1.useState(null);
    const [selectedColors, setSelectedColors] = React$1.useState([]); //'#FEE08B','#3288BD'
    /*  console.log(selectedColors);
    console.log("length:");
    console.log(selectedColors.length);
  */
    const [yAttribute, setYAttribute] = React$1.useState(initialYAttribute);
    //const yAttribute = initialYAttribute;
    const yValue = (d) => d[yAttribute];

    const [xAttribute, setXAttribute] = React$1.useState(initialXAttribute);
    //const yAttribute = initialYAttribute;
    const xValue = (d) => d[xAttribute];
    const sliderHidden = xAttribute == 'year' ? 'hidden' : 'visible';
    //console.log(sliderHidden);

    const [yr, setYr] = React$1.useState(initialYr);
    //console.log(yr);

    const innerHeight = height - margin.top - margin.bottom;
    const innerWidth = width - margin.left - margin.right;

    const xScale = React$1.useMemo(
      () =>
        data
          ? d3.scaleLinear()
              .domain(d3.extent(data, xValue))
              .range([0, innerWidth])
              .nice()
          : d3.scaleLinear(),
      [data, xValue, innerWidth]
    );

    const yScale = React$1.useMemo(
      () =>
        !data
          ? d3.scaleLinear()
          : d3.scaleLinear().domain(d3.extent(data, yValue)).range([innerHeight, 0]),
      [data, yValue, innerHeight]
    );

    const maxRadius =
      xAttribute != 'year' &&
      (yAttribute == 'income_per_cap' || yAttribute == 'total_population')
        ? 20
        : 2;

    const sizeScale = React$1.useMemo(
      () =>
        !data
          ? d3.scaleSqrt()
          : maxRadius == 20
          ? d3.scaleSqrt()
              .domain([0, d3.max(data, yValue)])
              .range([0, maxRadius])
          : d3.scaleSqrt()
              .domain([0, d3.max(data, yValue)])
              .range([maxRadius, maxRadius]),
      [data, yValue, maxRadius]
    );

    const colorCategory = (d) => d.world_bank_region;

    const colorScale = React$1.useMemo(
      () =>
        data
          ? d3.scaleOrdinal()
              .domain(data.map(colorCategory))
              //.range(d3.schemeSet1);
              .range(colorList)
          : d3.scaleOrdinal(),
      [data, colorCategory, colorList]
    );

    const filteredData = React$1.useMemo(
      () =>
        data
          ? data.filter((d) => {
              if (selectedColors.length > 0 || hoverColor) {
                if (
                  selectedColors.includes(colorScale(colorCategory(d))) ||
                  hoverColor == colorScale(colorCategory(d))
                ) {
                  if (xAttribute == 'year' || d.year == yr) {
                    return d;
                  }
                }
              } else {
                if (xAttribute == 'year' || d.year == yr) {
                  return d;
                }
              }
            })
          : null,
      [data, selectedColors, hoverColor, colorScale, colorCategory, xAttribute]
    );

    if (!data || !countryCodes || !bgData) {
      return React$1__default.createElement( 'pre', null, "Loading..." );
    }

    const siFormat = d3.format('.2s');
    const yAxisTickFormat = (tickValue) => siFormat(tickValue).replace('G', 'B');
    const xAxisTickFormat = (tickValue) =>
      xAttribute == 'year' ? tickValue : siFormat(tickValue).replace('G', 'B');

    // return svg
    return (
      React$1__default.createElement( React$1__default.Fragment, null,
        React$1__default.createElement( 'div', { class: "dropdown rotated" },
          React$1__default.createElement( ReactDropdown, {
            options: yAttributes, value: yAttribute, onChange: ({ value }) => setYAttribute(value) })
        ),
        React$1__default.createElement( 'svg', { width: width, height: height }, "// Background ", React$1__default.createElement( 'g', { transform: `scale(0.82)`, opacity: "0.75" },
            React$1__default.createElement( Background, {
              bgdata: bgData, countryColors: countryColors, hoverColor: hoverColor, selectedColors: selectedColors })
          ), "// Scatterplot ", React$1__default.createElement( 'g', { transform: `translate(${margin.left},${margin.top})` },
            React$1__default.createElement( AxisBottom, {
              xScale: xScale, innerHeight: innerHeight, tickFormat: xAxisTickFormat, tickOffset: 5 }),
            React$1__default.createElement( AxisLeft, {
              yScale: yScale, innerWidth: innerWidth, tickFormat: yAxisTickFormat, tickOffset: 5 }),
            React$1__default.createElement( 'g', { opacity: "0.75" },
              React$1__default.createElement( Marks, {
                data: filteredData, xScale: xScale, yScale: yScale, xValue: xValue, yValue: yValue, sizeScale: sizeScale, colorScale: colorScale, colorCategory: colorCategory, xAttribute: xAttribute, yAttribute: yAttribute })
            )
          ), "// Title: ", React$1__default.createElement( 'g', {
            className: "title-text", transform: `translate(${innerWidth + margin.right / 2 + 10},${
            innerHeight / 8
          })` },
            React$1__default.createElement( 'text', { x: "0", dy: "0" },
              titleText1
            ),
            React$1__default.createElement( 'text', { x: "0", dy: "25" },
              titleText2
            ),
            React$1__default.createElement( 'text', { x: "0", dy: "50" },
              titleText3
            )
          ), "// Legend: ", React$1__default.createElement( 'g', {
            transform: `translate(${innerWidth + margin.right / 2 + 10},${
            innerHeight / 3
          })` },
            React$1__default.createElement( 'text', { x: "0", dy: "0" },
              colorLegendLabel1
            ),
            React$1__default.createElement( 'text', { x: "0", dy: "15" },
              colorLegendLabel2
            ),
            React$1__default.createElement( ColorLegend, {
              colorScale: colorScale, hoverColor: hoverColor, onHover: setHoverColor, selectedColors: selectedColors, onSelectColor: setSelectedColors })
          )
        ),
        React$1__default.createElement( 'div', { class: "slider-container" },
          React$1__default.createElement( Slider, {
            minYr: minYr, maxYr: maxYr, yrStep: yrStep, yr: yr, onSlide: setYr, sliderHidden: sliderHidden })
        ),
        React$1__default.createElement( 'div', { class: "dropdown bottom" },
          React$1__default.createElement( ReactDropdown, {
            options: xAttributes, value: xAttribute, onChange: ({ value }) => setXAttribute(value) })
        )
      )
    );
  };

  const rootElement = document.getElementById('root');
  ReactDOM.render(React$1__default.createElement( App, null ), rootElement);

}(React, ReactDOM, ReactDropdown, d3, topojson));

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbInVzZURhdGEuanMiLCJ1c2VXb3JsZEF0bGFzLmpzIiwidXNlQ29kZXMuanMiLCJBeGlzQm90dG9tLmpzIiwiQXhpc0xlZnQuanMiLCJDb2xvckxlZ2VuZC5qcyIsIk1hcmtzLmpzIiwiQmFja2dyb3VuZC5qcyIsIkNvdW50cnlDb2xvcnNMaXN0LmpzIiwiU2xpZGVyLmpzIiwiaW5kZXguanMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgdXNlU3RhdGUsIHVzZUVmZmVjdCB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IGNzdiB9IGZyb20gJ2QzJztcblxuY29uc3QgY3N2VXJsID1cbiAgJ2h0dHBzOi8vZ2lzdC5naXRodWJ1c2VyY29udGVudC5jb20vbGFrYWxpYS9jYTZjYzgxNzkyYjlkMzU3YTIwY2YyZjlmZDRjNzkyNC9yYXcvZ2FwbWluZGVyX3N1bW1hcnlfZnJvbV8xOTUwLmNzdic7XG5cbmV4cG9ydCBjb25zdCB1c2VEYXRhID0gKCkgPT4ge1xuICBjb25zdCBbZGF0YSwgc2V0RGF0YV0gPSB1c2VTdGF0ZShudWxsKTtcbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBjb25zdCByb3cgPSAoZCkgPT4ge1xuICAgICAgZC55ZWFyID0gK2QueWVhcjtcbiAgICAgIGQuaW5jb21lX3Blcl9jYXAgPSArZC5pbmNvbWVfcGVyX2NhcDtcbiAgICAgIGQudG90YWxfcG9wdWxhdGlvbiA9ICtkLnRvdGFsX3BvcHVsYXRpb247XG4gICAgICBkLmxpZmVfZXhwZWN0YW5jeSA9ICtkLmxpZmVfZXhwZWN0YW5jeTtcbiAgICAgIGQuZmVydGlsaXR5X3JhdGUgPSArZC5mZXJ0aWxpdHlfcmF0ZTtcblxuICAgICAgLy9jb25zb2xlLmxvZyhkKTsgXG4gICAgICBcbiAgICAgIC8vbmVlZCB0byBmaWx0ZXIgb3V0IHJvd3Mgd2l0aCAwJ3NcbiAgICAgIGlmIChcbiAgICAgICAgZC5pbmNvbWVfcGVyX2NhcCA+IDAgJiZcbiAgICAgICAgZC50b3RhbF9wb3B1bGF0aW9uID4gMCAmJlxuICAgICAgICBkLmxpZmVfZXhwZWN0YW5jeSA+IDAgJiZcbiAgICAgICAgZC5mZXJ0aWxpdHlfcmF0ZSA+IDBcbiAgICAgICkge1xuICAgICAgICByZXR1cm4gZDtcbiAgICAgIH1cbiAgICB9O1xuICAgIGNzdihjc3ZVcmwsIHJvdykudGhlbihzZXREYXRhKTtcbiAgfSwgW10pO1xuXHQvL2NvbnNvbGUubG9nKGRhdGEpO1xuICByZXR1cm4gZGF0YTtcbn07XG4iLCJpbXBvcnQgeyB1c2VTdGF0ZSwgdXNlRWZmZWN0IH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsganNvbiB9IGZyb20gJ2QzJztcbmltcG9ydCB7IGZlYXR1cmUsIG1lc2ggfSBmcm9tICd0b3BvanNvbic7XG5cbmNvbnN0IGpzb25VcmwgPSAnaHR0cHM6Ly91bnBrZy5jb20vd29ybGQtYXRsYXNAMi4wLjIvY291bnRyaWVzLTUwbS5qc29uJztcblxuZXhwb3J0IGNvbnN0IHVzZVdvcmxkQXRsYXMgPSAoKSA9PiB7XG4gIGNvbnN0IFtkYXRhLCBzZXREYXRhXSA9IHVzZVN0YXRlKG51bGwpO1xuXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAganNvbihqc29uVXJsKS50aGVuKHRvcG9sb2d5ID0+IHtcbiAgICAgLy8gY29uc29sZS5sb2codG9wb2xvZ3kpO1xuICAgICAgXG4gICAgICBjb25zdCB7IGNvdW50cmllcywgbGFuZCB9ID0gdG9wb2xvZ3kub2JqZWN0cztcbiAgICAgIHNldERhdGEoe1xuICAgICAgICBsYW5kOiBmZWF0dXJlKHRvcG9sb2d5LCBsYW5kKSxcbiAgICAgICAgY291bnRyaWVzOiBmZWF0dXJlKHRvcG9sb2d5LCBjb3VudHJpZXMpLFxuICAgICAgICBpbnRlcmlvcnM6IG1lc2godG9wb2xvZ3ksIGNvdW50cmllcywgKGEsIGIpID0+IGEgIT09IGIpXG4gICAgICB9KTtcbiAgICB9KTtcbiAgfSwgW10pO1xuICAvL2NvbnNvbGUubG9nKGRhdGEpO1xuICByZXR1cm4gZGF0YTtcbn07XG4iLCJpbXBvcnQgeyB1c2VTdGF0ZSwgdXNlRWZmZWN0IH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgY3N2IH0gZnJvbSAnZDMnO1xuXG5jb25zdCBjc3ZVcmwgPVxuICAnaHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tL2x1a2VzL0lTTy0zMTY2LUNvdW50cmllcy13aXRoLVJlZ2lvbmFsLUNvZGVzL21hc3Rlci9zbGltLTMvc2xpbS0zLmNzdic7XG5cbmV4cG9ydCBjb25zdCB1c2VDb2RlcyA9ICgpID0+IHtcbiAgY29uc3QgW2RhdGEsIHNldERhdGFdID0gdXNlU3RhdGUobnVsbCk7XG4gIFxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGNzdihjc3ZVcmwpLnRoZW4oc2V0RGF0YSk7XG4gIH0sIFtdKTtcbi8vY29uc29sZS5sb2coZGF0YSk7XG4gIHJldHVybiBkYXRhO1xufTtcbiIsImV4cG9ydCBjb25zdCBBeGlzQm90dG9tID0gKHsgeFNjYWxlLCBpbm5lckhlaWdodCwgdGlja0Zvcm1hdCwgdGlja09mZnNldCA9IDMgfSkgPT5cbiAgeFNjYWxlLnRpY2tzKCkubWFwKHRpY2tWYWx1ZSA9PiAoXG4gICAgPGdcbiAgICAgIGNsYXNzTmFtZT1cInRpY2tcIlxuICAgICAga2V5PXt0aWNrVmFsdWV9XG4gICAgICB0cmFuc2Zvcm09e2B0cmFuc2xhdGUoJHt4U2NhbGUodGlja1ZhbHVlKX0sMClgfVxuICAgID5cbiAgICAgIDxsaW5lIHkyPXtpbm5lckhlaWdodH0gLz5cbiAgICAgIDx0ZXh0IHN0eWxlPXt7IHRleHRBbmNob3I6ICdtaWRkbGUnIH19IGR5PVwiLjcxZW1cIiB5PXtpbm5lckhlaWdodCArIHRpY2tPZmZzZXR9PlxuICAgICAgICB7dGlja0Zvcm1hdCh0aWNrVmFsdWUpfVxuICAgICAgPC90ZXh0PlxuICAgIDwvZz5cbiAgKSk7XG4iLCJleHBvcnQgY29uc3QgQXhpc0xlZnQgPSAoeyB5U2NhbGUsIGlubmVyV2lkdGgsIHRpY2tGb3JtYXQsIHRpY2tPZmZzZXQgPSAzIH0pID0+XG4gIHlTY2FsZS50aWNrcygpLm1hcCh0aWNrVmFsdWUgPT4gKFxuICAgIDxnIGNsYXNzTmFtZT1cInRpY2tcIiB0cmFuc2Zvcm09e2B0cmFuc2xhdGUoMCwke3lTY2FsZSh0aWNrVmFsdWUpfSlgfT5cbiAgICAgIDxsaW5lIHgyPXtpbm5lcldpZHRofSAvPlxuICAgICAgPHRleHRcbiAgICAgICAga2V5PXt0aWNrVmFsdWV9XG4gICAgICAgIHN0eWxlPXt7IHRleHRBbmNob3I6ICdlbmQnIH19XG4gICAgICAgIHg9ey10aWNrT2Zmc2V0fVxuICAgICAgICBkeT1cIi4zMmVtXCJcbiAgICAgID5cbiAgICAgICAge3RpY2tGb3JtYXQodGlja1ZhbHVlKX1cbiAgICAgIDwvdGV4dD5cbiAgICA8L2c+XG4gICkpO1xuIiwiZXhwb3J0IGNvbnN0IENvbG9yTGVnZW5kID0gKHtcbiAgLy9OT1RFOiBjaGFuZ2VzIG11c3QgYmUgbWFkZSB0byBib3RoIFRydWUgYW5kIEZhbHNlIHNlY3Rpb25zXG4gIGNvbG9yU2NhbGUsXG4gIGhvdmVyQ29sb3IsXG4gIG9uSG92ZXIsXG4gIHNlbGVjdGVkQ29sb3JzLFxuICBvblNlbGVjdENvbG9yLFxuICBvZmZzZXQgPSAxNSxcbiAgZmFkZU9wID0gMC4yNSxcbiAgdmlzaWJsZU9wID0gMSxcbn0pID0+XG4gIGNvbG9yU2NhbGUuZG9tYWluKCkubWFwKChkb21haW5WYWx1ZSwgaSkgPT5cbiAgICAhZG9tYWluVmFsdWUuaW5kZXhPZignJicpID8gKFxuICAgICAgPGdcbiAgICAgICAgdHJhbnNmb3JtPXtgdHJhbnNsYXRlKDAsJHsyICogb2Zmc2V0ICsgMiAqIGkgKiBvZmZzZXR9KWB9XG4gICAgICAgIG9uTW91c2VFbnRlcj17KCkgPT4ge1xuICAgICAgICAgIG9uSG92ZXIoY29sb3JTY2FsZShkb21haW5WYWx1ZSkpO1xuICAgICAgICB9fSBcbiAgLyogICAgICBvbk1vdXNlT3Zlcj17KCkgPT4ge1xuICAgICAgICAgIG9uSG92ZXIoY29sb3JTY2FsZShkb21haW5WYWx1ZSkpO1xuICAgICAgICB9fSAqL1xuICAgICAgICBvbk1vdXNlT3V0PXsoKSA9PiB7XG4gICAgICAgICAgb25Ib3ZlcihudWxsKTtcbiAgICAgICAgfX1cbiAgICAgICAgb25DbGljaz17KCkgPT4ge1xuICAgICAgICAgIGlmICghc2VsZWN0ZWRDb2xvcnMuaW5jbHVkZXMoY29sb3JTY2FsZShkb21haW5WYWx1ZSkpKSB7XG4gICAgICAgICAgICBzZWxlY3RlZENvbG9ycy5wdXNoKGNvbG9yU2NhbGUoZG9tYWluVmFsdWUpKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc2VsZWN0ZWRDb2xvcnMuc3BsaWNlKFxuICAgICAgICAgICAgICBzZWxlY3RlZENvbG9ycy5pbmRleE9mKGNvbG9yU2NhbGUoZG9tYWluVmFsdWUpKSxcbiAgICAgICAgICAgICAgMVxuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgLy9jb25zb2xlLmxvZyhTZWxlY3RlZENvbG9ycyk7XG4gICAgICAgICAgcmV0dXJuIG9uU2VsZWN0Q29sb3Ioc2VsZWN0ZWRDb2xvcnMpO1xuICAgICAgICB9fVxuICAgICAgICBvcGFjaXR5PXtcbiAgICAgICAgICAoIWhvdmVyQ29sb3IgJiYgc2VsZWN0ZWRDb2xvcnMubGVuZ3RoID09IDApIHx8XG4gICAgICAgICAgaG92ZXJDb2xvciA9PSBjb2xvclNjYWxlKGRvbWFpblZhbHVlKSB8fFxuICAgICAgICAgIHNlbGVjdGVkQ29sb3JzLmluY2x1ZGVzKGNvbG9yU2NhbGUoZG9tYWluVmFsdWUpKVxuICAgICAgICAgICAgPyB2aXNpYmxlT3BcbiAgICAgICAgICAgIDogZmFkZU9wXG4gICAgICAgIH1cbiAgICAgID5cbiAgICAgICAgPHJlY3RcbiAgICAgICAgICB4PVwiMFwiXG4gICAgICAgICAgeT1cIjBcIlxuICAgICAgICAgIHdpZHRoPXtvZmZzZXR9XG4gICAgICAgICAgaGVpZ2h0PXsyICogb2Zmc2V0fVxuICAgICAgICAgIGZpbGw9e2NvbG9yU2NhbGUoZG9tYWluVmFsdWUpfVxuICAgICAgICAvPlxuICAgICAgICA8dGV4dCBjbGFzc05hbWU9XCJheGlzLWxhYmVsXCIgeD17MS41ICogb2Zmc2V0fSBkeT17b2Zmc2V0fT5cbiAgICAgICAgICB7ZG9tYWluVmFsdWUuc3Vic3RyaW5nKDAsIGRvbWFpblZhbHVlLmxlbmd0aCl9XG4gICAgICAgIDwvdGV4dD5cbiAgICAgIDwvZz5cbiAgICApIDogKFxuICAgICAgPGdcbiAgICAgICAgdHJhbnNmb3JtPXtgdHJhbnNsYXRlKDAsJHsyICogb2Zmc2V0ICsgMiAqIGkgKiBvZmZzZXR9KWB9XG4gICAgICAgIG9uTW91c2VFbnRlcj17KCkgPT4ge1xuICAgICAgICAgIG9uSG92ZXIoY29sb3JTY2FsZShkb21haW5WYWx1ZSkpO1xuICAgICAgICB9fSBcbiAgLyogICAgICBvbk1vdXNlT3Zlcj17KCkgPT4ge1xuICAgICAgICAgIG9uSG92ZXIoY29sb3JTY2FsZShkb21haW5WYWx1ZSkpO1xuICAgICAgICB9fSAqL1xuICAgICAgICBvbk1vdXNlT3V0PXsoKSA9PiB7XG4gICAgICAgICAgb25Ib3ZlcihudWxsKTtcbiAgICAgICAgfX1cbiAgICAgICAgb25DbGljaz17KCkgPT4ge1xuICAgICAgICAgIGlmICghc2VsZWN0ZWRDb2xvcnMuaW5jbHVkZXMoY29sb3JTY2FsZShkb21haW5WYWx1ZSkpKSB7XG4gICAgICAgICAgICBzZWxlY3RlZENvbG9ycy5wdXNoKGNvbG9yU2NhbGUoZG9tYWluVmFsdWUpKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc2VsZWN0ZWRDb2xvcnMuc3BsaWNlKFxuICAgICAgICAgICAgICBzZWxlY3RlZENvbG9ycy5pbmRleE9mKGNvbG9yU2NhbGUoZG9tYWluVmFsdWUpKSxcbiAgICAgICAgICAgICAgMVxuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgLy9jb25zb2xlLmxvZyhTZWxlY3RlZENvbG9ycyk7XG4gICAgICAgICAgcmV0dXJuIG9uU2VsZWN0Q29sb3Ioc2VsZWN0ZWRDb2xvcnMpO1xuICAgICAgICB9fVxuICAgICAgICBvcGFjaXR5PXtcbiAgICAgICAgICAoIWhvdmVyQ29sb3IgJiYgc2VsZWN0ZWRDb2xvcnMubGVuZ3RoID09IDApIHx8XG4gICAgICAgICAgaG92ZXJDb2xvciA9PSBjb2xvclNjYWxlKGRvbWFpblZhbHVlKSB8fFxuICAgICAgICAgIHNlbGVjdGVkQ29sb3JzLmluY2x1ZGVzKGNvbG9yU2NhbGUoZG9tYWluVmFsdWUpKVxuICAgICAgICAgICAgPyB2aXNpYmxlT3BcbiAgICAgICAgICAgIDogZmFkZU9wXG4gICAgICAgIH1cbiAgICAgID5cbiAgICAgICAgPHJlY3RcbiAgICAgICAgICB4PVwiMFwiXG4gICAgICAgICAgeT1cIjBcIlxuICAgICAgICAgIHdpZHRoPXtvZmZzZXR9XG4gICAgICAgICAgaGVpZ2h0PXsyICogb2Zmc2V0fVxuICAgICAgICAgIGZpbGw9e2NvbG9yU2NhbGUoZG9tYWluVmFsdWUpfVxuICAgICAgICAvPlxuICAgICAgICA8dGV4dCBjbGFzc05hbWU9XCJheGlzLWxhYmVsXCIgeD17MS41ICogb2Zmc2V0fSBkeT17b2Zmc2V0fT5cbiAgICAgICAgICB7ZG9tYWluVmFsdWUuc3Vic3RyaW5nKDAsIGRvbWFpblZhbHVlLmluZGV4T2YoJyYnKSArIDEpfVxuICAgICAgICA8L3RleHQ+XG4gICAgICAgIDx0ZXh0IGNsYXNzTmFtZT1cImF4aXMtbGFiZWxcIiB4PXsxLjUgKiBvZmZzZXR9IGR5PXtvZmZzZXQgKyAxM30+XG4gICAgICAgICAge2RvbWFpblZhbHVlLnN1YnN0cmluZyhcbiAgICAgICAgICAgIGRvbWFpblZhbHVlLmluZGV4T2YoJyYnKSArIDEsXG4gICAgICAgICAgICBkb21haW5WYWx1ZS5sZW5ndGhcbiAgICAgICAgICApfVxuICAgICAgICA8L3RleHQ+XG4gICAgICA8L2c+XG4gICAgKVxuICApO1xuIiwiZXhwb3J0IGNvbnN0IE1hcmtzID0gKHtcbiAgZGF0YSxcbiAgeFNjYWxlLFxuICB5U2NhbGUsXG4gIHhWYWx1ZSxcbiAgeVZhbHVlLFxuICBzaXplU2NhbGUsXG4gIGNvbG9yU2NhbGUsXG4gIGNvbG9yQ2F0ZWdvcnksXG4gIHhBdHRyaWJ1dGUsXG4gIHlBdHRyaWJ1dGVcbn0pID0+XG4gIGRhdGEubWFwKChkKSA9PiB7XG4gICAgY29uc3QgdG9vbHRpcFZhbHVlID0gKGQpID0+XG4gICAgZC5jb3VudHJ5LmNvbmNhdChcbiAgICAgIHhBdHRyaWJ1dGUgPT0gJ3llYXInID8gJywgJyA6ICcgJy5jb25jYXQoZC55ZWFyLCAnLCAnKSxcbiAgICAgIHhBdHRyaWJ1dGUsXG4gICAgICAnOiAnLFxuICAgICAgZFt4QXR0cmlidXRlXSxcbiAgICAgICcsICcsXG4gICAgICB5QXR0cmlidXRlLFxuICAgICAgJzogJyxcbiAgICAgIGRbeUF0dHJpYnV0ZV1cbiAgICApO1xuXG4gICAgcmV0dXJuIChcbiAgICAgIDxjaXJjbGVcbiAgICAgICAgY2xhc3NOYW1lPVwibWFya1wiXG4gICAgICAgIGN4PXt4U2NhbGUoeFZhbHVlKGQpKX1cbiAgICAgICAgY3k9e3lTY2FsZSh5VmFsdWUoZCkpfVxuICAgICAgICByPXtzaXplU2NhbGUoeVZhbHVlKGQpKX1cbiAgICAgICAgZmlsbD17Y29sb3JTY2FsZShjb2xvckNhdGVnb3J5KGQpKX1cbiAgICAgID5cbiAgICAgICAgPHRpdGxlPnt0b29sdGlwVmFsdWUoZCl9PC90aXRsZT5cbiAgICAgIDwvY2lyY2xlPlxuICAgICk7XG4gIH0pO1xuIiwiaW1wb3J0IHsgZ2VvTmF0dXJhbEVhcnRoMSwgZ2VvUGF0aCB9IGZyb20gJ2QzJztcblxuLy9jb25zdCBwcm9qZWN0aW9uID0gZ2VvTWVyY2F0b3IoKTtcbmNvbnN0IHByb2plY3Rpb24gPSBnZW9OYXR1cmFsRWFydGgxKCk7XG5jb25zdCBwYXRoID0gZ2VvUGF0aChwcm9qZWN0aW9uKTtcblxuZXhwb3J0IGNvbnN0IEJhY2tncm91bmQgPSAoe1xuICBiZ2RhdGE6IHsgY291bnRyaWVzLCBpbnRlcmlvcnMgfSxcbiAgY291bnRyeUNvbG9ycyxcbiAgaG92ZXJDb2xvcixcbiAgc2VsZWN0ZWRDb2xvcnMsXG59KSA9PiB7XG4gIGNvbnN0IGNvdW50cnlDb2xvciA9IChjb3VudHJ5KSA9PiB7XG4gICAgZm9yIChsZXQgYyBvZiBjb3VudHJ5Q29sb3JzKSB7XG4gICAgICBpZiAoXG4gICAgICAgIGNvdW50cnkgPT0gYy5jb3VudHJ5XG4gICAgICAgICAgLnJlcGxhY2UoJ1VuaXRlZCBTdGF0ZXMnLCAnVW5pdGVkIFN0YXRlcyBvZiBBbWVyaWNhJylcbiAgICAgICAgICAucmVwbGFjZSgnRG9taW5pY2FuIFJlcHVibGljJywgJ0RvbWluaWNhbiBSZXAuJylcbiAgICAgICAgICAucmVwbGFjZSgnTGFvJywgJ0xhb3MnKVxuICAgICAgICAgIC5yZXBsYWNlKCdDZW50cmFsIEFmcmljYW4gUmVwdWJsaWMnLCAnQ2VudHJhbCBBZnJpY2FuIFJlcC4nKVxuICAgICAgICAgIC5yZXBsYWNlKCdFcXVhdG9yaWFsIEd1aW5lYScsICdFcS4gR3VpbmVhJylcbiAgICAgICAgLy8ucmVwbGFjZSgnXFx1MDBGNCcsJ28nKVxuICAgICAgKSB7XG4gICAgICAgIHJldHVybiBob3ZlckNvbG9yID09IGMuY29sb3IgfHwgc2VsZWN0ZWRDb2xvcnMuaW5jbHVkZXMoYy5jb2xvcilcbiAgICAgICAgICA/IGMuY29sb3JcbiAgICAgICAgICA6ICcjQzBDMEJCJztcbiAgICAgICAgLy9yZXR1cm4gYy5jb2xvcjtcbiAgICAgIH1cbiAgICB9XG4gIH07XG5cbiAgcmV0dXJuIChcbiAgICA8ZyBjbGFzc05hbWU9XCJhdGxhc1wiPlxuICAgICAge2NvdW50cmllcy5mZWF0dXJlcy5tYXAoKGZlYXR1cmUpID0+IChcbiAgICAgICAgPHBhdGhcbiAgICAgICAgICBkPXtwYXRoKGZlYXR1cmUpfVxuICAgICAgICAgIGZpbGw9e1xuICAgICAgICAgICAgY291bnRyeUNvbG9yKGZlYXR1cmUucHJvcGVydGllcy5uYW1lKVxuICAgICAgICAgICAgICA/IGNvdW50cnlDb2xvcihmZWF0dXJlLnByb3BlcnRpZXMubmFtZSlcbiAgICAgICAgICAgICAgOiAnI0MwQzBCQidcbiAgICAgICAgICB9XG4gICAgICAgIC8+XG4gICAgICApKX1cbiAgICAgIDxwYXRoIGNsYXNzTmFtZT1cImludGVyaW9yc1wiIGQ9e3BhdGgoaW50ZXJpb3JzKX0gLz5cbiAgICA8L2c+XG4gICk7XG59O1xuIiwiaW1wb3J0IHsgc2NhbGVMaW5lYXIsIHNjYWxlT3JkaW5hbCB9IGZyb20gJ2QzJztcblxuZXhwb3J0IGNvbnN0IENvdW50cnlDb2xvcnNMaXN0ID0gKGRhdGEsIGNvbG9yTGlzdCwgY291bnRyeUNvZGVzKSA9PiB7XG4gIGlmIChkYXRhICYmIGNvdW50cnlDb2Rlcykge1xuICAgIC8vY29uc3QgY29sb3JDYXRlZ29yeSA9IChkKSA9PiBkLndvcmxkX2JhbmtfcmVnaW9uO1xuICAgIGNvbnN0IGNvbG9yU2NhbGUgPSBzY2FsZU9yZGluYWwoKVxuICAgICAgLmRvbWFpbihkYXRhLm1hcCgoZCkgPT4gZC53b3JsZF9iYW5rX3JlZ2lvbikpXG4gICAgICAvLy5kb21haW4oZGF0YS5tYXAoY29sb3JDYXRlZ29yeSkpXG4gICAgICAvLy5yYW5nZShkMy5zY2hlbWVTZXQxKTtcbiAgICAgIC5yYW5nZShjb2xvckxpc3QpO1xuXG4gICAgY29uc3QgY291bnRyeUNvZGUgPSAoZCkgPT4ge1xuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjb3VudHJ5Q29kZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKGNvdW50cnlDb2Rlc1tpXVsnbmFtZSddID09PSBkLmNvdW50cnkpIHtcbiAgICAgICAgICByZXR1cm4gY291bnRyeUNvZGVzW2ldWydjb3VudHJ5LWNvZGUnXTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG5cbiAgICBjb25zdCBjb3VudHJ5Q29sb3JzID0gW107XG4gICAgY29uc3QgbWFwID0gbmV3IE1hcCgpO1xuICAgIGZvciAoY29uc3QgYyBvZiBkYXRhLm1hcCgoZCkgPT4ge1xuICAgICAgcmV0dXJuIHsgY291bnRyeTogZC5jb3VudHJ5LCByZWdpb246IGQud29ybGRfYmFua19yZWdpb24gfTtcbiAgICB9KSkge1xuICAgICAgaWYgKCFtYXAuaGFzKGMuY291bnRyeSkpIHtcbiAgICAgICAgbWFwLnNldChjLmNvdW50cnksIHRydWUpO1xuICAgICAgICBjb3VudHJ5Q29sb3JzLnB1c2goe1xuICAgICAgICAgIGNvdW50cnk6IGMuY291bnRyeSxcbiAgICAgICAgICBjb3VudHJ5Q29kZTogY291bnRyeUNvZGUoYyksXG4gICAgICAgICAgY29sb3I6IGNvbG9yU2NhbGUoYy5yZWdpb24pLFxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG4gICAgLy8gYWRkIG1pc3NpbmcgY291bnRyaWVzXG4gICAgICAgY291bnRyeUNvbG9ycy5wdXNoKFxuICAgICAge1xuICAgICAgICBjb3VudHJ5OiAnUy4gU3VkYW4nLFxuICAgICAgICBjb3VudHJ5Q29kZTogY291bnRyeUNvZGUoJ1MuIFN1ZGFuJyksXG4gICAgICAgIGNvbG9yOiAnI0ZFRTA4QicsXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBjb3VudHJ5OiAnQ29uZ28nLFxuICAgICAgICBjb3VudHJ5Q29kZTogY291bnRyeUNvZGUoJ0NvbmdvJyksXG4gICAgICAgIGNvbG9yOiAnI0ZFRTA4QicsXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBjb3VudHJ5OiAnRGVtLiBSZXAuIENvbmdvJyxcbiAgICAgICAgY291bnRyeUNvZGU6IGNvdW50cnlDb2RlKCdEZW0uIFJlcC4gQ29uZ28nKSxcbiAgICAgICAgY29sb3I6ICcjRkVFMDhCJyxcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIGNvdW50cnk6ICdHcmVlbmxhbmQnLFxuICAgICAgICBjb3VudHJ5Q29kZTogY291bnRyeUNvZGUoJ0dyZWVubGFuZCcpLFxuICAgICAgICBjb2xvcjogJyNFNkY1OTgnLFxuICAgICAgfVxuICAgICk7XG5cbiAgICAvL2NvbnNvbGUubG9nKGNvdW50cnlDb2xvcnMpO1xuXG4gICAgcmV0dXJuIGNvdW50cnlDb2xvcnM7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIFtdO1xuICB9XG59O1xuIiwiZXhwb3J0IGNvbnN0IFNsaWRlciA9ICh7IG1pbllyLCBtYXhZciwgeXJTdGVwLCB5ciwgb25TbGlkZSwgc2xpZGVySGlkZGVuIH0pID0+IChcbiAgc2xpZGVySGlkZGVuID09ICd2aXNpYmxlJyA/XG4gIDw+XG4gICAgPHRleHQ+MTk1MDwvdGV4dD5cbiAgICA8aW5wdXRcbiAgICAgIGNsYXNzPVwic2xpZGVyXCJcbiAgICAgIGxpc3Q9XCJ0aWNrbWFya3NcIlxuICAgICAgdHlwZT1cInJhbmdlXCJcbiAgICAgIG1pbj17bWluWXJ9XG4gICAgICBtYXg9e21heFlyfVxuICAgICAgc3RlcD17eXJTdGVwfVxuICAgICAgdmFsdWU9e3lyfVxuICAgICAgb25DaGFuZ2U9eyhlKSA9PiBvblNsaWRlKGUudGFyZ2V0LnZhbHVlKX1cbiAgICAvPlxuICAgIDxkYXRhbGlzdCBpZD1cInRpY2ttYXJrc1wiPlxuICAgICAgPG9wdGlvbiB2YWx1ZT1cIjE5NTBcIj48L29wdGlvbj5cbiAgICAgIDxvcHRpb24gdmFsdWU9XCIxOTc1XCI+PC9vcHRpb24+XG4gICAgICA8b3B0aW9uIHZhbHVlPVwiMjAwMFwiPjwvb3B0aW9uPlxuICAgICAgPG9wdGlvbiB2YWx1ZT1cIjIwMTVcIj48L29wdGlvbj5cbiAgICA8L2RhdGFsaXN0PlxuICAgIDx0ZXh0PlxuICAgICAgeycgJ31cbiAgICAgIDIwMTUgPGJyIC8+eycgJ31cbiAgICA8L3RleHQ+XG4gICAgPGxhYmVsPlllYXI6IDwvbGFiZWw+XG4gICAgPHRleHQ+e3lyfTwvdGV4dD5cbiAgPC8+IDogPD4gPC8+XG4pO1xuIiwiaW1wb3J0IFJlYWN0LCB7IHVzZVN0YXRlLCB1c2VNZW1vIH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IFJlYWN0RE9NIGZyb20gJ3JlYWN0LWRvbSc7XG5pbXBvcnQgUmVhY3REcm9wZG93biBmcm9tICdyZWFjdC1kcm9wZG93bic7XG4vL2ltcG9ydCBTbGlkZXIgZnJvbSAncmVhY3QtcmFuZ2VzbGlkZXInO1xuaW1wb3J0IHtcbiAgc2NhbGVMaW5lYXIsXG4gIHNjYWxlTG9nLFxuICBzY2FsZU9yZGluYWwsXG4gIHNjYWxlU3FydCxcbiAgZm9ybWF0LFxuICBleHRlbnQsXG4gIG1heCxcbn0gZnJvbSAnZDMnO1xuaW1wb3J0IHsgdXNlRGF0YSB9IGZyb20gJy4vdXNlRGF0YSc7XG5pbXBvcnQgeyB1c2VXb3JsZEF0bGFzIH0gZnJvbSAnLi91c2VXb3JsZEF0bGFzJztcbmltcG9ydCB7IHVzZUNvZGVzIH0gZnJvbSAnLi91c2VDb2Rlcyc7XG5pbXBvcnQgeyBBeGlzQm90dG9tIH0gZnJvbSAnLi9BeGlzQm90dG9tJztcbmltcG9ydCB7IEF4aXNMZWZ0IH0gZnJvbSAnLi9BeGlzTGVmdCc7XG5pbXBvcnQgeyBDb2xvckxlZ2VuZCB9IGZyb20gJy4vQ29sb3JMZWdlbmQnO1xuaW1wb3J0IHsgTWFya3MgfSBmcm9tICcuL01hcmtzJztcbmltcG9ydCB7IEJhY2tncm91bmQgfSBmcm9tICcuL0JhY2tncm91bmQuanMnO1xuaW1wb3J0IHsgQ291bnRyeUNvbG9yc0xpc3QgfSBmcm9tICcuL0NvdW50cnlDb2xvcnNMaXN0LmpzJztcbmltcG9ydCB7IFNsaWRlciB9IGZyb20gJy4vU2xpZGVyLmpzJztcblxuY29uc3Qgd2lkdGggPSA5NjA7XG5jb25zdCBoZWlnaHQgPSA0MjU7XG5jb25zdCBtYXJnaW4gPSB7IHRvcDogMjAsIHJpZ2h0OiAyMjUsIGJvdHRvbTogMTcsIGxlZnQ6IDEwMCB9O1xuXG5jb25zdCB5QXR0cmlidXRlcyA9IFtcbiAgeyB2YWx1ZTogJ2luY29tZV9wZXJfY2FwJywgbGFiZWw6ICdJbmNvbWUgcGVyIGNhcGl0YScgfSxcbiAgeyB2YWx1ZTogJ3RvdGFsX3BvcHVsYXRpb24nLCBsYWJlbDogJ1RvdGFsIFBvcHVsYXRpb24nIH0sXG4gIHsgdmFsdWU6ICdsaWZlX2V4cGVjdGFuY3knLCBsYWJlbDogJ0xpZmUgRXhwZWN0YW5jeScgfSxcbiAgeyB2YWx1ZTogJ2ZlcnRpbGl0eV9yYXRlJywgbGFiZWw6ICdGZXJ0aWxpdHkgUmF0ZScgfSxcbl07XG5jb25zdCBpbml0aWFsWUF0dHJpYnV0ZSA9ICd0b3RhbF9wb3B1bGF0aW9uJztcblxuY29uc3QgeEF0dHJpYnV0ZXMgPSBbXG4gIHsgdmFsdWU6ICdpbmNvbWVfcGVyX2NhcCcsIGxhYmVsOiAnSW5jb21lIHBlciBjYXBpdGEnIH0sXG4gIHsgdmFsdWU6ICd0b3RhbF9wb3B1bGF0aW9uJywgbGFiZWw6ICdUb3RhbCBQb3B1bGF0aW9uJyB9LFxuICB7IHZhbHVlOiAnbGlmZV9leHBlY3RhbmN5JywgbGFiZWw6ICdMaWZlIEV4cGVjdGFuY3knIH0sXG4gIHsgdmFsdWU6ICdmZXJ0aWxpdHlfcmF0ZScsIGxhYmVsOiAnRmVydGlsaXR5IFJhdGUnIH0sXG4gIHsgdmFsdWU6ICd5ZWFyJywgbGFiZWw6ICdZZWFyJyB9LFxuXTtcbi8vXG5cbmNvbnN0IGluaXRpYWxYQXR0cmlidXRlID0gJ2luY29tZV9wZXJfY2FwJztcbi8vY29uc3QgaW5pdGlhbFhBdHRyaWJ1dGUgPSAneWVhcic7XG5cbmNvbnN0IG1pbllyID0gMTk1MDtcbmNvbnN0IG1heFlyID0gMjAxNTtcbmNvbnN0IHlyU3RlcCA9IDE7XG5jb25zdCBpbml0aWFsWXIgPSAxOTUwO1xuXG5jb25zdCBjb2xvckxpc3QgPSBbXG4gICcjRkRBRTYxJyxcbiAgJyNFNkY1OTgnLFxuICAnIzMyODhCRCcsXG4gICcjRkVFMDhCJyxcbiAgJyM2NkMyQTUnLFxuICAnI0Q1M0U0RicsXG4gICcjRjQ2RDQzJyxcbl07XG5cbmNvbnN0IGNvbG9yTGVnZW5kTGFiZWwxID0gJ1dvcmxkIEJhbmsnO1xuY29uc3QgY29sb3JMZWdlbmRMYWJlbDIgPSAnR2xvYmFsIFJlZ2lvbnM6JztcblxuY29uc3QgdGl0bGVUZXh0MSA9ICdHYXBtaW5kZXInO1xuY29uc3QgdGl0bGVUZXh0MiA9ICdEYXRhJztcbmNvbnN0IHRpdGxlVGV4dDMgPSAnYnkgQ291bnRyeSc7XG5cbi8vIFJlYWN0IGZ0blxuY29uc3QgQXBwID0gKCkgPT4ge1xuICBjb25zdCBkYXRhID0gdXNlRGF0YSgpO1xuICBjb25zdCBiZ0RhdGEgPSB1c2VXb3JsZEF0bGFzKCk7XG4gIGNvbnN0IGNvdW50cnlDb2RlcyA9IHVzZUNvZGVzKCk7XG5cbiAgY29uc3QgY291bnRyeUNvbG9ycyA9IHVzZU1lbW8oXG4gICAgKCkgPT4gQ291bnRyeUNvbG9yc0xpc3QoZGF0YSwgY29sb3JMaXN0LCBjb3VudHJ5Q29kZXMpLFxuICAgIFtkYXRhLCBjb2xvckxpc3QsIGNvdW50cnlDb2Rlc11cbiAgKTtcbiAgLy9jb25zb2xlLmxvZygnanVzdCBwYXNzZWQgY291bnRyeUNvbG9ycycpO1xuXG4gIC8vY29uc3QgaG92ZXJDb2xvciA9IG51bGw7IC8vPSAnI0ZFRTA4Qic7XG4gIGNvbnN0IFtob3ZlckNvbG9yLCBzZXRIb3ZlckNvbG9yXSA9IHVzZVN0YXRlKG51bGwpO1xuICBjb25zdCBbc2VsZWN0ZWRDb2xvcnMsIHNldFNlbGVjdGVkQ29sb3JzXSA9IHVzZVN0YXRlKFtdKTsgLy8nI0ZFRTA4QicsJyMzMjg4QkQnXG4gIC8qICBjb25zb2xlLmxvZyhzZWxlY3RlZENvbG9ycyk7XG4gIGNvbnNvbGUubG9nKFwibGVuZ3RoOlwiKTtcbiAgY29uc29sZS5sb2coc2VsZWN0ZWRDb2xvcnMubGVuZ3RoKTtcbiovXG4gIGNvbnN0IFt5QXR0cmlidXRlLCBzZXRZQXR0cmlidXRlXSA9IHVzZVN0YXRlKGluaXRpYWxZQXR0cmlidXRlKTtcbiAgLy9jb25zdCB5QXR0cmlidXRlID0gaW5pdGlhbFlBdHRyaWJ1dGU7XG4gIGNvbnN0IHlWYWx1ZSA9IChkKSA9PiBkW3lBdHRyaWJ1dGVdO1xuXG4gIGNvbnN0IFt4QXR0cmlidXRlLCBzZXRYQXR0cmlidXRlXSA9IHVzZVN0YXRlKGluaXRpYWxYQXR0cmlidXRlKTtcbiAgLy9jb25zdCB5QXR0cmlidXRlID0gaW5pdGlhbFlBdHRyaWJ1dGU7XG4gIGNvbnN0IHhWYWx1ZSA9IChkKSA9PiBkW3hBdHRyaWJ1dGVdO1xuICBjb25zdCBzbGlkZXJIaWRkZW4gPSB4QXR0cmlidXRlID09ICd5ZWFyJyA/ICdoaWRkZW4nIDogJ3Zpc2libGUnO1xuICAvL2NvbnNvbGUubG9nKHNsaWRlckhpZGRlbik7XG5cbiAgY29uc3QgW3lyLCBzZXRZcl0gPSB1c2VTdGF0ZShpbml0aWFsWXIpO1xuICAvL2NvbnNvbGUubG9nKHlyKTtcblxuICBjb25zdCBpbm5lckhlaWdodCA9IGhlaWdodCAtIG1hcmdpbi50b3AgLSBtYXJnaW4uYm90dG9tO1xuICBjb25zdCBpbm5lcldpZHRoID0gd2lkdGggLSBtYXJnaW4ubGVmdCAtIG1hcmdpbi5yaWdodDtcblxuICBjb25zdCB4U2NhbGUgPSB1c2VNZW1vKFxuICAgICgpID0+XG4gICAgICBkYXRhXG4gICAgICAgID8gc2NhbGVMaW5lYXIoKVxuICAgICAgICAgICAgLmRvbWFpbihleHRlbnQoZGF0YSwgeFZhbHVlKSlcbiAgICAgICAgICAgIC5yYW5nZShbMCwgaW5uZXJXaWR0aF0pXG4gICAgICAgICAgICAubmljZSgpXG4gICAgICAgIDogc2NhbGVMaW5lYXIoKSxcbiAgICBbZGF0YSwgeFZhbHVlLCBpbm5lcldpZHRoXVxuICApO1xuXG4gIGNvbnN0IHlTY2FsZSA9IHVzZU1lbW8oXG4gICAgKCkgPT5cbiAgICAgICFkYXRhXG4gICAgICAgID8gc2NhbGVMaW5lYXIoKVxuICAgICAgICA6IHNjYWxlTGluZWFyKCkuZG9tYWluKGV4dGVudChkYXRhLCB5VmFsdWUpKS5yYW5nZShbaW5uZXJIZWlnaHQsIDBdKSxcbiAgICBbZGF0YSwgeVZhbHVlLCBpbm5lckhlaWdodF1cbiAgKTtcblxuICBjb25zdCBtYXhSYWRpdXMgPVxuICAgIHhBdHRyaWJ1dGUgIT0gJ3llYXInICYmXG4gICAgKHlBdHRyaWJ1dGUgPT0gJ2luY29tZV9wZXJfY2FwJyB8fCB5QXR0cmlidXRlID09ICd0b3RhbF9wb3B1bGF0aW9uJylcbiAgICAgID8gMjBcbiAgICAgIDogMjtcblxuICBjb25zdCBzaXplU2NhbGUgPSB1c2VNZW1vKFxuICAgICgpID0+XG4gICAgICAhZGF0YVxuICAgICAgICA/IHNjYWxlU3FydCgpXG4gICAgICAgIDogbWF4UmFkaXVzID09IDIwXG4gICAgICAgID8gc2NhbGVTcXJ0KClcbiAgICAgICAgICAgIC5kb21haW4oWzAsIG1heChkYXRhLCB5VmFsdWUpXSlcbiAgICAgICAgICAgIC5yYW5nZShbMCwgbWF4UmFkaXVzXSlcbiAgICAgICAgOiBzY2FsZVNxcnQoKVxuICAgICAgICAgICAgLmRvbWFpbihbMCwgbWF4KGRhdGEsIHlWYWx1ZSldKVxuICAgICAgICAgICAgLnJhbmdlKFttYXhSYWRpdXMsIG1heFJhZGl1c10pLFxuICAgIFtkYXRhLCB5VmFsdWUsIG1heFJhZGl1c11cbiAgKTtcblxuICBjb25zdCBjb2xvckNhdGVnb3J5ID0gKGQpID0+IGQud29ybGRfYmFua19yZWdpb247XG5cbiAgY29uc3QgY29sb3JTY2FsZSA9IHVzZU1lbW8oXG4gICAgKCkgPT5cbiAgICAgIGRhdGFcbiAgICAgICAgPyBzY2FsZU9yZGluYWwoKVxuICAgICAgICAgICAgLmRvbWFpbihkYXRhLm1hcChjb2xvckNhdGVnb3J5KSlcbiAgICAgICAgICAgIC8vLnJhbmdlKGQzLnNjaGVtZVNldDEpO1xuICAgICAgICAgICAgLnJhbmdlKGNvbG9yTGlzdClcbiAgICAgICAgOiBzY2FsZU9yZGluYWwoKSxcbiAgICBbZGF0YSwgY29sb3JDYXRlZ29yeSwgY29sb3JMaXN0XVxuICApO1xuXG4gIGNvbnN0IGZpbHRlcmVkRGF0YSA9IHVzZU1lbW8oXG4gICAgKCkgPT5cbiAgICAgIGRhdGFcbiAgICAgICAgPyBkYXRhLmZpbHRlcigoZCkgPT4ge1xuICAgICAgICAgICAgaWYgKHNlbGVjdGVkQ29sb3JzLmxlbmd0aCA+IDAgfHwgaG92ZXJDb2xvcikge1xuICAgICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgc2VsZWN0ZWRDb2xvcnMuaW5jbHVkZXMoY29sb3JTY2FsZShjb2xvckNhdGVnb3J5KGQpKSkgfHxcbiAgICAgICAgICAgICAgICBob3ZlckNvbG9yID09IGNvbG9yU2NhbGUoY29sb3JDYXRlZ29yeShkKSlcbiAgICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgaWYgKHhBdHRyaWJ1dGUgPT0gJ3llYXInIHx8IGQueWVhciA9PSB5cikge1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIGQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBpZiAoeEF0dHJpYnV0ZSA9PSAneWVhcicgfHwgZC55ZWFyID09IHlyKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGQ7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KVxuICAgICAgICA6IG51bGwsXG4gICAgW2RhdGEsIHNlbGVjdGVkQ29sb3JzLCBob3ZlckNvbG9yLCBjb2xvclNjYWxlLCBjb2xvckNhdGVnb3J5LCB4QXR0cmlidXRlXVxuICApO1xuXG4gIGlmICghZGF0YSB8fCAhY291bnRyeUNvZGVzIHx8ICFiZ0RhdGEpIHtcbiAgICByZXR1cm4gPHByZT5Mb2FkaW5nLi4uPC9wcmU+O1xuICB9XG5cbiAgY29uc3Qgc2lGb3JtYXQgPSBmb3JtYXQoJy4ycycpO1xuICBjb25zdCB5QXhpc1RpY2tGb3JtYXQgPSAodGlja1ZhbHVlKSA9PiBzaUZvcm1hdCh0aWNrVmFsdWUpLnJlcGxhY2UoJ0cnLCAnQicpO1xuICBjb25zdCB4QXhpc1RpY2tGb3JtYXQgPSAodGlja1ZhbHVlKSA9PlxuICAgIHhBdHRyaWJ1dGUgPT0gJ3llYXInID8gdGlja1ZhbHVlIDogc2lGb3JtYXQodGlja1ZhbHVlKS5yZXBsYWNlKCdHJywgJ0InKTtcblxuICAvLyByZXR1cm4gc3ZnXG4gIHJldHVybiAoXG4gICAgPD5cbiAgICAgIDxkaXYgY2xhc3M9XCJkcm9wZG93biByb3RhdGVkXCI+XG4gICAgICAgIDxSZWFjdERyb3Bkb3duXG4gICAgICAgICAgb3B0aW9ucz17eUF0dHJpYnV0ZXN9XG4gICAgICAgICAgdmFsdWU9e3lBdHRyaWJ1dGV9XG4gICAgICAgICAgb25DaGFuZ2U9eyh7IHZhbHVlIH0pID0+IHNldFlBdHRyaWJ1dGUodmFsdWUpfVxuICAgICAgICAvPlxuICAgICAgPC9kaXY+XG4gICAgICA8c3ZnIHdpZHRoPXt3aWR0aH0gaGVpZ2h0PXtoZWlnaHR9PlxuICAgICAgICAvLyBCYWNrZ3JvdW5kXG4gICAgICAgIDxnIHRyYW5zZm9ybT17YHNjYWxlKDAuODIpYH0gb3BhY2l0eT1cIjAuNzVcIj5cbiAgICAgICAgICA8QmFja2dyb3VuZFxuICAgICAgICAgICAgYmdkYXRhPXtiZ0RhdGF9XG4gICAgICAgICAgICBjb3VudHJ5Q29sb3JzPXtjb3VudHJ5Q29sb3JzfVxuICAgICAgICAgICAgaG92ZXJDb2xvcj17aG92ZXJDb2xvcn1cbiAgICAgICAgICAgIHNlbGVjdGVkQ29sb3JzPXtzZWxlY3RlZENvbG9yc31cbiAgICAgICAgICAvPlxuICAgICAgICA8L2c+XG4gICAgICAgIC8vIFNjYXR0ZXJwbG90XG4gICAgICAgIDxnIHRyYW5zZm9ybT17YHRyYW5zbGF0ZSgke21hcmdpbi5sZWZ0fSwke21hcmdpbi50b3B9KWB9PlxuICAgICAgICAgIDxBeGlzQm90dG9tXG4gICAgICAgICAgICB4U2NhbGU9e3hTY2FsZX1cbiAgICAgICAgICAgIGlubmVySGVpZ2h0PXtpbm5lckhlaWdodH1cbiAgICAgICAgICAgIHRpY2tGb3JtYXQ9e3hBeGlzVGlja0Zvcm1hdH1cbiAgICAgICAgICAgIHRpY2tPZmZzZXQ9ezV9XG4gICAgICAgICAgLz5cbiAgICAgICAgICA8QXhpc0xlZnRcbiAgICAgICAgICAgIHlTY2FsZT17eVNjYWxlfVxuICAgICAgICAgICAgaW5uZXJXaWR0aD17aW5uZXJXaWR0aH1cbiAgICAgICAgICAgIHRpY2tGb3JtYXQ9e3lBeGlzVGlja0Zvcm1hdH1cbiAgICAgICAgICAgIHRpY2tPZmZzZXQ9ezV9XG4gICAgICAgICAgLz5cbiAgICAgICAgICA8ZyBvcGFjaXR5PVwiMC43NVwiPlxuICAgICAgICAgICAgPE1hcmtzXG4gICAgICAgICAgICAgIGRhdGE9e2ZpbHRlcmVkRGF0YX1cbiAgICAgICAgICAgICAgeFNjYWxlPXt4U2NhbGV9XG4gICAgICAgICAgICAgIHlTY2FsZT17eVNjYWxlfVxuICAgICAgICAgICAgICB4VmFsdWU9e3hWYWx1ZX1cbiAgICAgICAgICAgICAgeVZhbHVlPXt5VmFsdWV9XG4gICAgICAgICAgICAgIHNpemVTY2FsZT17c2l6ZVNjYWxlfVxuICAgICAgICAgICAgICBjb2xvclNjYWxlPXtjb2xvclNjYWxlfVxuICAgICAgICAgICAgICBjb2xvckNhdGVnb3J5PXtjb2xvckNhdGVnb3J5fVxuICAgICAgICAgICAgICB4QXR0cmlidXRlPXt4QXR0cmlidXRlfVxuICAgICAgICAgICAgICB5QXR0cmlidXRlPXt5QXR0cmlidXRlfVxuICAgICAgICAgICAgLz5cbiAgICAgICAgICA8L2c+XG4gICAgICAgIDwvZz5cbiAgICAgICAgLy8gVGl0bGU6XG4gICAgICAgIDxnXG4gICAgICAgICAgY2xhc3NOYW1lPVwidGl0bGUtdGV4dFwiXG4gICAgICAgICAgdHJhbnNmb3JtPXtgdHJhbnNsYXRlKCR7aW5uZXJXaWR0aCArIG1hcmdpbi5yaWdodCAvIDIgKyAxMH0sJHtcbiAgICAgICAgICAgIGlubmVySGVpZ2h0IC8gOFxuICAgICAgICAgIH0pYH1cbiAgICAgICAgPlxuICAgICAgICAgIDx0ZXh0IHg9XCIwXCIgZHk9XCIwXCI+XG4gICAgICAgICAgICB7dGl0bGVUZXh0MX1cbiAgICAgICAgICA8L3RleHQ+XG4gICAgICAgICAgPHRleHQgeD1cIjBcIiBkeT1cIjI1XCI+XG4gICAgICAgICAgICB7dGl0bGVUZXh0Mn1cbiAgICAgICAgICA8L3RleHQ+XG4gICAgICAgICAgPHRleHQgeD1cIjBcIiBkeT1cIjUwXCI+XG4gICAgICAgICAgICB7dGl0bGVUZXh0M31cbiAgICAgICAgICA8L3RleHQ+XG4gICAgICAgIDwvZz5cbiAgICAgICAgLy8gTGVnZW5kOlxuICAgICAgICA8Z1xuICAgICAgICAgIHRyYW5zZm9ybT17YHRyYW5zbGF0ZSgke2lubmVyV2lkdGggKyBtYXJnaW4ucmlnaHQgLyAyICsgMTB9LCR7XG4gICAgICAgICAgICBpbm5lckhlaWdodCAvIDNcbiAgICAgICAgICB9KWB9XG4gICAgICAgID5cbiAgICAgICAgICA8dGV4dCB4PVwiMFwiIGR5PVwiMFwiPlxuICAgICAgICAgICAge2NvbG9yTGVnZW5kTGFiZWwxfVxuICAgICAgICAgIDwvdGV4dD5cbiAgICAgICAgICA8dGV4dCB4PVwiMFwiIGR5PVwiMTVcIj5cbiAgICAgICAgICAgIHtjb2xvckxlZ2VuZExhYmVsMn1cbiAgICAgICAgICA8L3RleHQ+XG4gICAgICAgICAgPENvbG9yTGVnZW5kXG4gICAgICAgICAgICBjb2xvclNjYWxlPXtjb2xvclNjYWxlfVxuICAgICAgICAgICAgaG92ZXJDb2xvcj17aG92ZXJDb2xvcn1cbiAgICAgICAgICAgIG9uSG92ZXI9e3NldEhvdmVyQ29sb3J9XG4gICAgICAgICAgICBzZWxlY3RlZENvbG9ycz17c2VsZWN0ZWRDb2xvcnN9XG4gICAgICAgICAgICBvblNlbGVjdENvbG9yPXtzZXRTZWxlY3RlZENvbG9yc31cbiAgICAgICAgICAvPlxuICAgICAgICA8L2c+XG4gICAgICA8L3N2Zz5cbiAgICAgIDxkaXYgY2xhc3M9XCJzbGlkZXItY29udGFpbmVyXCI+XG4gICAgICAgIDxTbGlkZXJcbiAgICAgICAgICBtaW5Zcj17bWluWXJ9XG4gICAgICAgICAgbWF4WXI9e21heFlyfVxuICAgICAgICAgIHlyU3RlcD17eXJTdGVwfVxuICAgICAgICAgIHlyPXt5cn1cbiAgICAgICAgICBvblNsaWRlPXtzZXRZcn1cbiAgICAgICAgICBzbGlkZXJIaWRkZW49e3NsaWRlckhpZGRlbn1cbiAgICAgICAgLz5cbiAgICAgIDwvZGl2PlxuICAgICAgPGRpdiBjbGFzcz1cImRyb3Bkb3duIGJvdHRvbVwiPlxuICAgICAgICA8UmVhY3REcm9wZG93blxuICAgICAgICAgIG9wdGlvbnM9e3hBdHRyaWJ1dGVzfVxuICAgICAgICAgIHZhbHVlPXt4QXR0cmlidXRlfVxuICAgICAgICAgIG9uQ2hhbmdlPXsoeyB2YWx1ZSB9KSA9PiBzZXRYQXR0cmlidXRlKHZhbHVlKX1cbiAgICAgICAgLz5cbiAgICAgIDwvZGl2PlxuICAgIDwvPlxuICApO1xufTtcblxuY29uc3Qgcm9vdEVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncm9vdCcpO1xuUmVhY3RET00ucmVuZGVyKDxBcHAgLz4sIHJvb3RFbGVtZW50KTtcbiJdLCJuYW1lcyI6WyJ1c2VTdGF0ZSIsInVzZUVmZmVjdCIsImNzdiIsImpzb24iLCJmZWF0dXJlIiwibWVzaCIsImNzdlVybCIsImdlb05hdHVyYWxFYXJ0aDEiLCJnZW9QYXRoIiwic2NhbGVPcmRpbmFsIiwidXNlTWVtbyIsInNjYWxlTGluZWFyIiwiZXh0ZW50Iiwic2NhbGVTcXJ0IiwibWF4IiwiUmVhY3QiLCJmb3JtYXQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7RUFHQSxNQUFNLE1BQU07RUFDWixFQUFFLGlIQUFpSCxDQUFDO0FBQ3BIO0VBQ08sTUFBTSxPQUFPLEdBQUcsTUFBTTtFQUM3QixFQUFFLE1BQU0sQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLEdBQUdBLGdCQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7RUFDekMsRUFBRUMsaUJBQVMsQ0FBQyxNQUFNO0VBQ2xCLElBQUksTUFBTSxHQUFHLEdBQUcsQ0FBQyxDQUFDLEtBQUs7RUFDdkIsTUFBTSxDQUFDLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztFQUN2QixNQUFNLENBQUMsQ0FBQyxjQUFjLEdBQUcsQ0FBQyxDQUFDLENBQUMsY0FB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