'use strict'
const _      = require('underscore');
const moment = require('moment');

function chartBP(data) {
  // Separate systolic and diastolic data
  let all_systolic = _.map(data, (entry) => {
      return entry.systolic;
  });
  let all_diastolic = _.map(data, (entry) => {
    return entry.diastolic;
  });

  // Get dates and then get months
  let all_dates = _.map(data, (entry) => {
    return moment.unix(entry.date / 1000);
  });
  let all_months = _.map(all_dates, (date) =>{
    return date.get('month');
  });
  let months = _.reject(all_months, (val, index, array) => {
    if (index === 0) {
      return false;
    }
    return array[index - 1] === val;
  })

  // Create chart and plot data
  createChart(all_systolic, all_diastolic, months);
};

function createChart(systolic, diastolic, months) {
  let canvas = document.getElementById('canvas');
  let ctx = canvas.getContext('2d');

  let chartDiv = document.getElementById('chartDiv');
	canvas.width = chartDiv.clientWidth;
	canvas.height = chartDiv.clientHeight;

  let devicePixelRatio = window.devicePixelRatio || 1;
  let backingStoreRatio = ctx.webkitBackingStorePixelRatio ||
                      ctx.mozBackingStorePixelRatio ||
                      ctx.msBackingStorePixelRatio ||
                      ctx.oBackingStorePixelRatio ||
                      ctx.backingStorePixelRatio || 1;

  let ratio = devicePixelRatio / backingStoreRatio;

  // upscale the canvas if the two ratios don't match
  if (devicePixelRatio !== backingStoreRatio) {

      var oldWidth = canvas.width;
      var oldHeight = canvas.height;

      canvas.width = oldWidth * ratio;
      canvas.height = oldHeight * ratio;
  }
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Chart margins
  const topMarginPx = 15;      // Space for the top y-axis label
  const bottomMarginPx = 50;   // Space for the x-axis labels
  const rightMarginPx = 50;    // Space for the y-axis labels

  // Chart data boundaries
  // X = 0 to rightX, Y = 0 to bottomY
  const bottomY = canvas.height - bottomMarginPx;
  const rightX  = canvas.width - rightMarginPx;

  // Y-axis spacing
  const yMin = 60;
  const yMax = 180;
  const yGridStep = 20;
  const nSections = (yMax - yMin) / yGridStep;
  const pxPerSection = (topMarginPx - bottomY) / nSections;

  // Draw horizontal grid lines and y-axis labels
  for (let i = 0; i <= nSections; i++) {
    const lineHeight = bottomY + (i * pxPerSection);
    const lineLabel  = yMin + (i * yGridStep);

    // Dashed grid line
    ctx.strokeStyle = '#D9D8D7'; // color of grid lines
    ctx.setLineDash([2, 2]);   // 2px dash, 2px space
    ctx.beginPath();
    ctx.moveTo(0, lineHeight);
    ctx.lineTo(rightX, lineHeight);
    ctx.stroke();

    // Y-axis label
    ctx.strokeStyle = '#5B5655';
    ctx.setLineDash([]);   // 2px dash, 2px space
    ctx.font = '16px Arial Regular';
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'left';
    ctx.fillText(lineLabel, rightX + 10, lineHeight);
  }

  // X-axis labels - Months are evenly spaced - prettier but less accurate
  const monthLabels = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
                       'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  const nMonths = months.length;
  const pxPerMonth = rightX / nMonths;
  ctx.strokeStyle = '#9E9D9D';
  ctx.font = '13px Arial Bold';
  for (let i = 0; i < nMonths; i++) {
    const labelX = i * pxPerMonth;
    ctx.fillText(monthLabels[months[i]], labelX, bottomY + 25);
  }

  // X spacing for data = total X pixels (rightX - 0) over number of points
  const pxPerDataPointX = rightX / (systolic.length - 1);
  const pxPerUnitY      = (topMarginPx - bottomY) / (yMax - yMin);

  // Plot blood pressure data
  plotData('#552DB9', systolic, ctx, pxPerDataPointX, pxPerUnitY, bottomY, yMin)
  plotData('#777FAF', diastolic, ctx, pxPerDataPointX, pxPerUnitY, bottomY, yMin)
}

function plotData(color, data, ctx, pxPerDataPointX, pxPerUnitY, bottomY, yMin) {
  // Helper function for adding data to the canvas
  ctx.strokeStyle = color;
  for (let i = 0; i < data.length; i++) {
    const xStart = i * pxPerDataPointX;
    const yStart = bottomY + (data[i] - yMin) * pxPerUnitY;
    const xEnd   = (i + 1) * pxPerDataPointX;
    const yEnd   = bottomY + (data[i + 1] - yMin) * pxPerUnitY;

    ctx.beginPath();
    ctx.moveTo(xStart, yStart);
    ctx.lineTo(xEnd, yEnd);
    ctx.stroke();
  }
}

module.exports = chartBP;
