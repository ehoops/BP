const AUTH0_DOMAIN = "ehoops.auth0.com";
const AUTH0_CLIENT_ID = "ytG4VWMp0T1cfQsddWr3WhqHdJq2eBtO";
const AUTH0_SECRET = "3TjyA2TivOeWJcVX3JfgL_2FQCxvAloc-7OYZGjv4A71ieL7xVk_VYZVmPz2lOrr";
const token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJlbWFpbCI6ImVlaG9vcHMrYnAxQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJpc3MiOiJodHRwczovL2Vob29wcy5hdXRoMC5jb20vIiwic3ViIjoiYXV0aDB8NTkwMDIwODNkZGI2YTQwZjI3NGI1OTQyIiwiYXVkIjoieXRHNFZXTXAwVDFjZlFzZGRXcjNXaHFIZEpxMmVCdE8iLCJleHAiOjE0OTM1MzUyMjcsImlhdCI6MTQ5MzQ5OTIyN30.kWW9pEm6fm1E7ZKPyCp7AoTnZf57EMwEhrp9JRIATf0";


function chartBPs(data) {
  console.log(data[data.length-1]);

  data = data.slice(data.length-11, data.length-1);
  let all_systolic = _.map(data, (entry) => {
      return entry.systolic;
  });

  let all_diastolic = _.map(data, (entry) => {
    return entry.diastolic;
  });
  let all_dates = _.map(data, (entry) => {
    return moment.unix(entry.date);;
  });

  let all_months = _.map(all_dates, (date) =>{
    return date.get('month');
  });

  createChart(all_systolic, all_diastolic, all_months);

};

function createChart(systolic, diastolic, dates) {
  let sections = 12;
  let Val_max = 180;
  let Val_min = 60;
  let stepSize = 20;
  let columnSize = 50;
  let rowSize = 50;
  let margin = 10;
  let xAxis = dates;

  let canvas = document.getElementById("canvas");
  let context = canvas.getContext("2d");
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "#9E9E9D";
  context.font = "16 pt Arial"

  yScale = (canvas.height - columnSize - margin) / (Val_max - Val_min);
  xScale = (canvas.width - rowSize) / sections;

  context.strokeStyle="#D9D8D7"; // color of grid lines
  context.beginPath();
    // print Parameters on X axis, and grid lines on the graph
  for (i=1;i<=sections;i++) {
    var x = i * xScale;
    context.fillText(xAxis[i], x, canvas.height);
  }
    // print row header and draw horizontal grid lines
  var count =  0;
  for (scale=Val_max;scale>=Val_min;scale = scale - stepSize) {
    var y = columnSize + (yScale * count * stepSize);
    context.fillText(scale, canvas.width - 2 * margin, y + margin);
    context.setLineDash([3, 3]); // Dashes are 3px, spaces are 3px
    context.moveTo(rowSize,y)
    context.lineTo(canvas.width - 2 * margin,y)
    count++;
  }
  context.stroke();

  context.translate(rowSize,canvas.height + Val_min * yScale);
  context.scale(1,-1 * yScale);

    // Color of each dataplot items
  context.strokeStyle="#552DB9";
  plotData(systolic, context, sections);
  context.strokeStyle="#777FAF";
  plotData(diastolic, context, sections);

}

function plotData(dataSet, context, sections) {
  context.setLineDash([]);
	context.beginPath();
	context.moveTo(0, dataSet[0]);
	for (i=1;i<sections;i++) {
		context.lineTo(i * xScale, dataSet[i]);
	}
	context.stroke();
}

function itWorks(res) {
  console.log('got res');
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
