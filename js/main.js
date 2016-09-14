// Load the Visualization API and the corechart package.
google.charts.load('current', {'packages':['corechart']});

// Set a callback to run when the Google Visualization API is loaded.
google.charts.setOnLoadCallback(main);


function main() {

    acquireData()
        .then(function(data){

            document.getElementById("title").innerText = data.problemStatement;

            unique(data.requirements, "category").forEach(function(categoryName){

                var element = document.body.appendChild(document.createElement('div'));
                element.id = categoryName + "_chart";

                // convert the data from human interpretable to graph consumable
                var table = simpleTable(data, categoryName);

                var options_stacked = {
                    title: categoryName,
                    isStacked: true,
                    height: 500,
                    legend: {position: 'top', maxLines: 3},
                    vAxis: {minValue: 0}
                };

                drawChart(
                    'ColumnChart',
                    element.id,
                    options_stacked,
                    table
                );
            });
        })
        .catch(console.error);


    //next up draw out a summary of all the categories, where each category gets a a single score based on the each category/strata

}

function simpleTable(json, category){
    /*
        expecting a problem_solution.json document
        {
            problemStatement: string,
            requirements: [{category: string, name: string, importance: percent}],
            solutions: [{name: string, grades: [...]}]
        }
    */

    var requirements = json.requirements
        .filter(function(req){
            return req.category === category || !category;
        })
        .sort()
        .map(function(req){
            return req.name;
    });

    var table = [requirements.unshift("requirements") && requirements];

    var extract = extractPropertyFrom("importance", json.requirements);

    json.solutions.forEach(function(solution){
        table.push([solution.name].concat(
            solution.grades.filter(function(requirement){
                    return requirement.category === category || !category;
                })
                .sort()
                .map(function(requirement){
                    return Math.min(requirement.grade / extract(requirement.name), 1);
        })));
    });

    return table;
}



function acquireData(){
    return getJson('../data/ecm.json')
        .then(function(data){
            return Promise.resolve(data);
        })
        .catch(console.error);
}



function extractPropertyFrom(property, objArray){
    return function(value, key){
        return objArray.find(function(obj){
            return obj[key || "name"] === value;
        })[property];
    };
}

function unique(array, property){
    var flags = [], output = [], l = array.length, i;
    for( i=0; i<l; i++) {
        if( flags[array[i][property]]) continue;
        flags[array[i][property]] = true;
        output.push(array[i][property]);
    }
    return output;
}

function drawChart(chartType, divId, options, dataArray){
    var dataTable = google.visualization.arrayToDataTable(dataArray);
    var chart = new google.visualization[chartType](document.getElementById(divId));
    chart.draw(dataTable, options);
}


// Callback that creates and populates a data table,
// instantiates the pie chart, passes in the data and
// draws it.
function drawDemoChart(divId){

    // Create the data table.
    var data = new google.visualization.DataTable();
    data.addColumn('string', 'Topping');
    data.addColumn('number', 'Slices');
    data.addRows([
        ['Mushrooms', 3],
        ['Onions', 1],
        ['Olives', 1],
        ['Zucchini', 1],
        ['Pepperoni', 2]
    ]);

    // Set chart options
    var options = {'title':'How Much Pizza I Ate Last Night',
        'width':400,
        'height':300};

    // Instantiate and draw our chart, passing in some options.
    var chart = new google.visualization.BarChart(document.getElementById(divId || 'chart_div'));
    chart.draw(data, options);
}