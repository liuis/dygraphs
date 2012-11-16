/** 
 * @fileoverview Tests involving multiple y-axes.
 *
 * @author danvdk@gmail.com (Dan Vanderkam)
 */

var MultipleAxesTestCase = TestCase("multiple-axes-tests");

MultipleAxesTestCase.prototype.setUp = function() {
  document.body.innerHTML = "<div id='graph'></div>";
};

function getYLabelsForAxis(axis_num) {
  var y_labels = document.getElementsByClassName("dygraph-axis-label-y" + axis_num);
  var ary = [];
  for (var i = 0; i < y_labels.length; i++) {
    ary.push(y_labels[i].innerHTML);
  }
  return ary;
}

function getLegend() {
  var legend = document.getElementsByClassName("dygraph-legend")[0];
  return legend.textContent;
}

// returns all text in tags w/ a given css class, sorted.
function getClassTexts(css_class) {
  var texts = [];
  var els = document.getElementsByClassName(css_class);
  for (var i = 0; i < els.length; i++) {
    texts[i] = els[i].textContent;
  }
  texts.sort();
  return texts;
}

MultipleAxesTestCase.getData = function() {
  var data = [];
  for (var i = 1; i <= 100; i++) {
    var m = "01", d = i;
    if (d > 31) { m = "02"; d -= 31; }
    if (m == "02" && d > 28) { m = "03"; d -= 28; }
    if (m == "03" && d > 31) { m = "04"; d -= 31; }
    if (d < 10) d = "0" + d;
    // two series, one with range 1-100, one with range 1-2M
    data.push([new Date("2010/" + m + "/" + d),
               i,
               100 - i,
               1e6 * (1 + i * (100 - i) / (50 * 50)),
               1e6 * (2 - i * (100 - i) / (50 * 50))]);
  }
  return data;
};

MultipleAxesTestCase.prototype.testBasicMultipleAxes = function() {
  var data = MultipleAxesTestCase.getData();

  var g = new Dygraph(
    document.getElementById("graph"),
    data,
    {
      labels: [ 'Date', 'Y1', 'Y2', 'Y3', 'Y4' ],
      width: 640,
      height: 350,
      'Y3': {
        axis: {
          // set axis-related properties here
          labelsKMB: true
        }
      },
      'Y4': {
        axis: 'Y3'  // use the same y-axis as series Y3
      }
    }
  );

  assertEquals(["0", "10", "20", "30", "40", "50", "60", "70", "80", "90", "100"], getYLabelsForAxis("1"));
  assertEquals(["900K", "1.01M", "1.12M", "1.23M", "1.34M", "1.45M", "1.55M", "1.66M", "1.77M", "1.88M", "1.99M"], getYLabelsForAxis("2"));
};

MultipleAxesTestCase.prototype.testNewStylePerAxisOptions = function() {
  var data = MultipleAxesTestCase.getData();

  var g = new Dygraph(
    document.getElementById("graph"),
    data,
    {
      labels: [ 'Date', 'Y1', 'Y2', 'Y3', 'Y4' ],
      width: 640,
      height: 350,
      'Y3': {
        axis: { }
      },
      'Y4': {
        axis: 'Y3'  // use the same y-axis as series Y3
      },
      axes: {
        y2: {
          labelsKMB: true
        }
      }
    }
  );

  assertEquals(["0", "10", "20", "30", "40", "50", "60", "70", "80", "90", "100"], getYLabelsForAxis("1"));
  assertEquals(["900K", "1.01M", "1.12M", "1.23M", "1.34M", "1.45M", "1.55M", "1.66M", "1.77M", "1.88M", "1.99M"], getYLabelsForAxis("2"));
};

MultipleAxesTestCase.prototype.testMultiAxisLayout = function() {
  var data = MultipleAxesTestCase.getData();

  var el = document.getElementById("graph");

  var g = new Dygraph(
    el,
    data,
    {
      labels: [ 'Date', 'Y1', 'Y2', 'Y3', 'Y4' ],
      width: 640,
      height: 350,
      'Y3': {
        axis: { }
      },
      'Y4': {
        axis: 'Y3'  // use the same y-axis as series Y3
      },
      axes: {
        y2: {
          labelsKMB: true
        }
      }
    }
  );

  // Test that all elements are inside the bounds of the graph, set above
  var innerDiv = el.firstChild;
  for (var child = innerDiv.firstChild; child != null; child = child.nextSibling) {
    assertTrue(child.offsetLeft >= 0);
    assertTrue((child.offsetLeft + child.offsetWidth) <= 640);
    assertTrue(child.offsetTop >= 0);
    // TODO(flooey@google.com): Text sometimes linebreaks,
    // causing the labels to appear outside the allocated area.
    // assertTrue((child.offsetTop + child.offsetHeight) <= 350);
  }
};

MultipleAxesTestCase.prototype.testTwoAxisVisibility = function() {
  var data = [];
  data.push([0,0,0]);
  data.push([1,2,2000]);
  data.push([2,4,1000]);

  var g = new Dygraph(
    document.getElementById("graph"),
    data,
    {
      labels: [ 'X', 'bar', 'zot' ],
      'zot': {
        axis: {
          labelsKMB: true
        }
      }
    }
  );

  assertTrue(document.getElementsByClassName("dygraph-axis-label-y").length > 0);
  assertTrue(document.getElementsByClassName("dygraph-axis-label-y2").length > 0);

  g.setVisibility(0, false);

  assertTrue(document.getElementsByClassName("dygraph-axis-label-y").length > 0);
  assertTrue(document.getElementsByClassName("dygraph-axis-label-y2").length > 0);

  g.setVisibility(0, true);
  g.setVisibility(1, false);

  assertTrue(document.getElementsByClassName("dygraph-axis-label-y").length > 0);
  assertTrue(document.getElementsByClassName("dygraph-axis-label-y2").length > 0);
};

// verifies that all four chart labels (title, x-, y-, y2-axis label) can be
// used simultaneously.
MultipleAxesTestCase.prototype.testMultiChartLabels = function() {
  var data = MultipleAxesTestCase.getData();

  var el = document.getElementById("graph");
  el.style.border = '1px solid black';
  el.style.marginLeft = '200px';
  el.style.marginTop = '200px';

  var g = new Dygraph(
    el,
    data,
    {
      labels: [ 'Date', 'Y1', 'Y2', 'Y3', 'Y4' ],
      width: 640,
      height: 350,
      'Y3': {
        axis: { }
      },
      'Y4': {
        axis: 'Y3'  // use the same y-axis as series Y3
      },
      xlabel: 'x-axis',
      ylabel: 'y-axis',
      y2label: 'y2-axis',
      title: 'Chart title'
    }
  );

  assertEquals(["Chart title", "x-axis", "y-axis", "y2-axis"],
               getClassTexts("dygraph-label"));
  assertEquals(["Chart title"], getClassTexts("dygraph-title"));
  assertEquals(["x-axis"], getClassTexts("dygraph-xlabel"));
  assertEquals(["y-axis"], getClassTexts("dygraph-ylabel"));
  assertEquals(["y2-axis"], getClassTexts("dygraph-y2label"));

  // TODO(danvk): check relative positioning here: title on top, y left of y2.
};

// Check that a chart w/o a secondary y-axis will not get a y2label, even if one
// is specified.
MultipleAxesTestCase.prototype.testNoY2LabelWithoutSecondaryAxis = function() {
  var g = new Dygraph(
    document.getElementById("graph"),
    MultipleAxesTestCase.getData(),
    {
      labels: [ 'Date', 'Y1', 'Y2', 'Y3', 'Y4' ],
      width: 640,
      height: 350,
      xlabel: 'x-axis',
      ylabel: 'y-axis',
      y2label: 'y2-axis',
      title: 'Chart title'
    }
  );

  assertEquals(["Chart title", "x-axis", "y-axis"],
               getClassTexts("dygraph-label"));
  assertEquals(["Chart title"], getClassTexts("dygraph-title"));
  assertEquals(["x-axis"], getClassTexts("dygraph-xlabel"));
  assertEquals(["y-axis"], getClassTexts("dygraph-ylabel"));
  assertEquals([], getClassTexts("dygraph-y2label"));
};

MultipleAxesTestCase.prototype.testValueRangePerAxisOptions = function() {
  var data = MultipleAxesTestCase.getData();

  g = new Dygraph(
    document.getElementById("graph"),
    data,
    {
      labels: [ 'Date', 'Y1', 'Y2', 'Y3', 'Y4' ],
      'Y3': {
        axis: {
        }
      },
      'Y4': {
        axis: 'Y3'  // use the same y-axis as series Y3
      },
      axes: {
        y: {
          valueRange: [40, 70]
        },
        y2: {
          // set axis-related properties here
          labelsKMB: true
        }
      },
      ylabel: 'Primary y-axis',
      y2label: 'Secondary y-axis',
      yAxisLabelWidth: 60
    }
  );
  assertEquals(["40", "45", "50", "55", "60", "65"], getYLabelsForAxis("1"));
  assertEquals(["900K","1.1M","1.3M","1.5M","1.7M","1.9M"], getYLabelsForAxis("2"));
  
  g.updateOptions(
    {
      axes: {
        y: {
          valueRange: [40, 80]
        },
        y2: {
          valueRange: [1e6, 1.2e6]
        }
     }
    }
  );
  assertEquals(["40", "45", "50", "55", "60", "65", "70", "75"], getYLabelsForAxis("1"));
  assertEquals(["1M", "1.02M", "1.05M", "1.08M", "1.1M", "1.13M", "1.15M", "1.18M"], getYLabelsForAxis("2"));
};

MultipleAxesTestCase.prototype.testDrawPointCallback = function() {
  var data = MultipleAxesTestCase.getData();

  var results = { y : {}, y2 : {}};
  var firstCallback = function(g, seriesName) {
    results.y[seriesName] = 1; 
  };
  var secondCallback = function(g, seriesName) {
    results.y2[seriesName] = 1; 
  };

  g = new Dygraph(
    document.getElementById("graph"),
    data,
    {
      labels: [ 'Date', 'Y1', 'Y2', 'Y3', 'Y4' ],
      drawPoints : true,
      'Y3': {
        axis: {
        }
      },
      'Y4': {
        axis: 'Y3'  // use the same y-axis as series Y3
      },
      axes: {
        y2: {
          drawPointCallback: secondCallback
        }
      },
      drawPointCallback: firstCallback
    }
  );

  assertEquals(1, results.y["Y1"]);
  assertEquals(1, results.y["Y2"]);
  assertEquals(1, results.y2["Y3"]);
  assertEquals(1, results.y2["Y4"]);
};

MultipleAxesTestCase.prototype.testDrawHighlightPointCallback = function() {
  var data = MultipleAxesTestCase.getData();

  var results = { y : {}, y2 : {}};
  var firstCallback = function(g, seriesName) {
    results.y[seriesName] = 1; 
  };
  var secondCallback = function(g, seriesName) {
    results.y2[seriesName] = 1; 
  };

  g = new Dygraph(
    document.getElementById("graph"),
    data,
    {
      labels: [ 'Date', 'Y1', 'Y2', 'Y3', 'Y4' ],
      drawPoints : true,
      'Y3': {
        axis: {
        }
      },
      'Y4': {
        axis: 'Y3'  // use the same y-axis as series Y3
      },
      axes: {
        y2: {
          drawHighlightPointCallback: secondCallback
        }
      },
      drawHighlightPointCallback: firstCallback
    }
  );

  assertEquals(1, results.y["Y1"]);
  assertEquals(1, results.y["Y2"]);
  assertEquals(1, results.y2["Y3"]);
  assertEquals(1, results.y2["Y4"]);
};
