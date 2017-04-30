const AUTH0_DOMAIN = "ehoops.auth0.com";
const AUTH0_CLIENT_ID = "ytG4VWMp0T1cfQsddWr3WhqHdJq2eBtO";
const AUTH0_SECRET = "3TjyA2TivOeWJcVX3JfgL_2FQCxvAloc-7OYZGjv4A71ieL7xVk_VYZVmPz2lOrr";
const token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJlbWFpbCI6ImVlaG9vcHMrYnAxQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJpc3MiOiJodHRwczovL2Vob29wcy5hdXRoMC5jb20vIiwic3ViIjoiYXV0aDB8NTkwMDIwODNkZGI2YTQwZjI3NGI1OTQyIiwiYXVkIjoieXRHNFZXTXAwVDFjZlFzZGRXcjNXaHFIZEpxMmVCdE8iLCJleHAiOjE0OTM2MDI4ODUsImlhdCI6MTQ5MzU2Njg4NX0.iNn1fwtJppbQ8O2Xrr7GmGG95i5C9i5tGled7hsVcTE";


function chartBPs(data) {


  let all_systolic = _.map(data, (entry) => {
      return entry.systolic;
  });

  let all_diastolic = _.map(data, (entry) => {
    return entry.diastolic;
  });
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

  createChart(all_systolic, all_diastolic, months);
};

function createChart(systolic, diastolic, months) {
  let canvas = document.getElementById('canvas');
  let ctx = canvas.getContext('2d');
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

  // X spacing = total X pixels (rightX - 0) over number of points
  const pxPerDataPointX = rightX / (systolic.length - 1);
  const pxPerUnitY      = (topMarginPx - bottomY) / (yMax - yMin);

  // Plot blood pressure data
  plotData('#552DB9', systolic, ctx, pxPerDataPointX, pxPerUnitY, bottomY, yMin)
  plotData('#777FAF', diastolic, ctx, pxPerDataPointX, pxPerUnitY, bottomY, yMin)
}

function plotData(color, data, ctx, pxPerDataPointX, pxPerUnitY, bottomY, yMin) {
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

function onSubmitPressure() {
  let newSystolic = parseInt($('#newSystolic').val());
  let newDiastolic = parseInt($('#newDiastolic').val());
  $('#newSystolic').val('');
  $('#newDiastolic').val('');
  $.ajax({
    type: 'POST',
    url: '/api/submitPressure',
    data: {
      systolic: newSystolic,
      diastolic: newDiastolic
    },
    beforeSend: function(xhr) {
      xhr.setRequestHeader('Authorization', 'Bearer ' + token);
    },
    success: fetchAndDraw,
    error: console.log,
  });

}

function fetchAndDraw() {
  $.ajax({
    type: 'GET',
    url: '/api/getPressures',
    beforeSend: function(xhr) {
      xhr.setRequestHeader('Authorization', 'Bearer ' + token);
    },
    success: chartBPs,
    error: console.log,
  });
}

$(document).ready(function(){
  $('.submitPressure').on('click', onSubmitPressure);
  fetchAndDraw();
});
