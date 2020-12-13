const select = id => document.getElementById(id);

const colorDict = {
                    'Fast Food': '#f15c80',
                    'Bars': '#434348',
                    'Desserts': '#7cb5ec',
                    'Steakhouses': '#f7a35c',
                    'Buffets': '#8085e9',
                    'Food Trucks': '#90ed7d'
                  }

async function loadJSON(path) {
	let response = await fetch(path);
    let dataset = await response.json(); // Now available in global scope
	return dataset;
}

let readable = true
function toggleFont() {
    if (readable) {
        readable = false;
        let els = document.querySelectorAll("*")
        for (var i = 0; i < els.length; i++) {
            if (els[i].tagName == 'I') {
                continue
            }
            els[i].style.fontFamily = 'Papyrus';
        }
    } else {
        readable = true;
        let els = document.querySelectorAll("*")
        for (var i = 0; i < els.length; i++) {
            if (els[i].tagName == 'I') {
                continue
            }
            els[i].style.fontFamily = 'Montserrat, sans-serif';
        }
    }
}

function createColors(categories) {
    let colors = []
    for(category in categories) {
        colors.push(colorDict[categories[category]])
    }
    return colors
}

function plotPie(data) {

    function groupByCat(data) {
        let catCount = {}

        for(let key in data) {
            let row = data[key];

            cat = row.display_category
            if (cat in catCount) {
                catCount[cat]++;
            } else {
                catCount[cat] = 1;
            }
        }
        let slices = []
        for(let key in catCount) {
            slices.push({name: key, y: catCount[key]})
        }
        return slices
    }

    let slices = groupByCat(data)

    let pie = Highcharts.chart("pie-chart", {
        chart: {
            backgroundColor: 'transparent',
            height: 60 + '%',
            type: 'pie',
            events: {
				load: function() {
					let data = this.series[0].data,
						newData = [];
		
					data.forEach(function(point) {
						newData.push({
							y: point.y,
							name: point.name
						})
					});
		
					newData.sort(function(a, b) {
						return b.y - a.y;
					});
		
					this.series[0].setData(newData);
				}
			}
        },
        xAxis: {
            labels: {
                style: {fontSize: '150%'}
            }
        },
        title: {text: '% of Restaurants in Las Vegas by Category'},
        tooltip: {
            pointFormat: '{series.name}: <b>{point.y:.0f}</b>',
            style: {fontSize: '150%'}
        },
        plotOptions: {
            pie: {
              dataLabels: {
                enabled: true,
                format: '<b>{point.name}</b>:<br>{point.percentage:.0f} %',
                fontSize: '20px',
                style: {fontSize: '150%'}
              }
            }
        },
        colors: ['#f15c80',
            '#434348',
            '#7cb5ec',
            '#f7a35c',
            '#8085e9',
            '#90ed7d'],
        series: [{
            name: 'Number of Restaurants',
            colorByPoint: true,
            showInLegend: false,
            data: slices
        }]
    });
}

let colCategories = ['Food Trucks']
isPercent = false

function togglePercent() {
    if (isPercent) {
        isPercent = false;
    } else {
        isPercent = true;
    }
    plotCol(reviewData, isPercent);
}

function removeCategory() {
    category = select('category-dropdown').value
    console.log(colCategories.includes(category))
    if (colCategories.includes(category)) {
        const index = colCategories.indexOf(category);
        if (index > -1) {
            colCategories.splice(index, 1);
        }
    }
    plotCol(reviewData, isPercent);
}

function addCategory() {
    category = select('category-dropdown').value

    if (!(colCategories.includes(category)) && category != '') {
        colCategories.push(category)
    }
    plotCol(reviewData, isPercent);
}

function plotCol(data, isPercent) {

    function getColData(categories, data, isPercent) {
        let colData = []
        let catCount = {}

        for(let key in data) {
            let row = data[key];

            cat = row.display_category
            if (!(cat in catCount)) {
                catCount[cat] = [0, 0, 0, 0, 0]
            }
            for (review in row.review_ratings) {
                catCount[cat][row.review_ratings[review] - 1]++;
            }
        }
        
        if (isPercent) {
            for (cat in catCount) {
                total = catCount[cat].reduce(function sum(total, num) {
                    return total + num;
                })
                for (i in catCount[cat]) {
                    catCount[cat][i] = Math.round(catCount[cat][i] * 10000 / total) / 100
                }
            }
        }

        for(let c in categories) {
            colData.push({name: colCategories[c], data: catCount[colCategories[c]]})
        }
        return colData
    }

    if (isPercent) {
        ptFormat = '{series.name}: <b>{point.y:.2f}%</b>'
        ytitle = '% of rating'
    } else {
        ptFormat = '{series.name}: <b>{point.y:.0f}</b>'
        ytitle = 'Number of ratings'
    }

    categoryData = getColData(colCategories, data, isPercent)

    colChart = Highcharts.chart('col-chart', {
		chart: {
            height: 35 + '%',
            type: 'column',
            backgroundColor: 'transparent'
		},
		title: {
            text: 'Distribution of Ratings by Category',
            style: {fontSize: '200%'}
        },
        tooltip: {
            pointFormat: ptFormat,
            style: {fontSize: '150%'}
        },
		xAxis: {
            labels: { style: {fontSize: '150%'} },
			categories: ['1', '2', '3', '4', '5'],
			title: {
                text: 'Stars',
                style: {fontSize: '150%'}
			}
		},
		yAxis: {
			min: 0,
			title: {
                text: ytitle,
                style: {fontSize: '150%'}
			},
			labels: {
                overflow: 'justify',
                style: {fontSize: '150%'}
			}
        },
        legend: {
            itemStyle: {fontSize: '150%'}
        },
        colors: createColors(colCategories),
		series: categoryData
    });
}

function plotPic() {
    //create svg element
    var svgDoc=d3.select("#picto-chart").append("svg").attr("viewBox","0 0 100 115").attr('id', 'picto-svg').attr('style', "height:80%;width:80%;overflow:hidden");
            
    //define an icon store it in svg <defs> elements as a reusable component - this geometry can be generated from Inkscape, Illustrator or similar
   svgDoc.append("defs")
       .append("g")
       .attr("id","iconCustom")
       .append("path")
               .attr("d","M3.5,2H2.7C3,1.8,3.3,1.5,3.3,1.1c0-0.6-0.4-1-1-1c-0.6,0-1,0.4-1,1c0,0.4,0.2,0.7,0.6,0.9H1.1C0.7,2,0.4,2.3,0.4,2.6v1.9c0,0.3,0.3,0.6,0.6,0.6h0.2c0,0,0,0.1,0,0.1v1.9c0,0.3,0.2,0.6,0.3,0.6h1.3c0.2,0,0.3-0.3,0.3-0.6V5.3c0,0,0-0.1,0-0.1h0.2c0.3,0,0.6-0.3,0.6-0.6V2.6C4.1,2.3,3.8,2,3.5,2z");
   
    //background rectangle
    svgDoc.append("rect").attr("width",100).attr("height",115).attr("id", 'pict-rect');

   //specify the number of columns and rows for pictogram layout
   var numCols = 10;
   var numRows = 10;
   
   //padding for the grid
   var xPadding = 10;
   var yPadding = 15;
   
   //horizontal and vertical spacing between the icons
   var hBuffer = 8;
   var wBuffer = 8;
   
   //generate a d3 range for the total number of required elements
   var myIndex=d3.range(numCols*numRows);
   
   //text element to display number of icons highlighted
   svgDoc.append("text")
       .attr("id","txtValue")
       .attr("x",xPadding)
       .attr("y",yPadding + 2)
       .attr("dy",0)
       .text("0");

    svgDoc.append("text")
       .attr("id","subTxtValue")
       .attr("x",xPadding)
       .attr("y",yPadding + 8)
       .attr("dy",0)
       .attr('font-size', 4)
       .text("0");

    svgDoc.append("text")
       .attr("id","subTxtValue2")
       .attr("x",xPadding)
       .attr("y",yPadding + 12)
       .attr("dy",0)
       .attr('font-size', 4)
       .text("0");

   //create group element and create an svg <use> element for each icon
   svgDoc.append("g")
       .attr("id","pictoLayer")
       .attr('transform', "translate(" + 0 + "," + 15 + ")")
       .selectAll("use")
       .data(myIndex)
       .enter()
       .append("use")
           .attr("xlink:href","#iconCustom")
           .attr("id",function(d)    {
               return "icon"+d;
           })
           .attr("x",function(d) {
               var remainder=d % numCols;//calculates the x position (column number) using modulus
               return xPadding+(remainder*wBuffer);//apply the buffer and return value
           })
             .attr("y",function(d) {
               var whole=Math.floor(d/numCols)//calculates the y position (row number)
               return yPadding+(whole*hBuffer);//apply the buffer and return the value
           })
           .classed("iconPlain",true);

    let value = 81
    d3.select("#txtValue").text(value + '%');
    d3.select("#subTxtValue").text('of reviewers had a positive experience');
    d3.select("#subTxtValue2").text('with food trucks');
    d3.selectAll("use").attr("class",function(d,i) {
        if (d<value)  {
            return "iconSelected";
        }    else    {
            return "iconPlain";
        }
    })
}


// getting the three dropdowns by using get element by id
categorySelect = document.getElementById('categoryselect')
sorting = document.getElementById('sortingselect')
sortby = document.getElementById('sortbyselect')

// adds row based on one in a json file
function AddRows (data) {
    // getting table red
    var tableref = document.getElementsByTagName('tbody')[0];
    // used to sort ratings
    var index_dic = {'1': 0,'1.5':0, '2' : 0, '2.5':0 ,'3': 0,'3.5': 0, '4':0,'4.5':0,'5': 0}
    // resets html
    tableref.innerHTML = ''
    // iterating over each data
    for (let key in data) { 
        // making sure to add only target category
        if (data[key]['display_category'] == categorySelect.value) {
            // this part will run for ratings
            if (sortby.value != 'reviewcount') {
                // if ascending case index increment index dic
                if (sorting.value == 'ascending') {
                    for (let k in index_dic) {
                        if (data[key]['stars'] <= parseFloat(k)) {
                            index_dic[k] +=1 
                        }
                        if (data[key]['stars'] == parseFloat(k)) {
                            indx = index_dic[k] - 1
                        }
                    }
                }
            // if descending case index increment index dic
               else {
                   for (let k in index_dic) {
                        if (data[key]['stars'] >= parseFloat(k)) {
                            index_dic[k] +=1 
                        }
                        if (data[key]['stars'] == parseFloat(k)) {
                            indx = index_dic[k] - 1
                        }
                    }
               }
            }
            // this part runs for review count case
            else {
                indx = 0
            }
            var row = tableref.insertRow(indx);
	        var cell1 = row.insertCell(0);
	        var cell2 = row.insertCell(1);
            var cell3 = row.insertCell(2);
            cell1.innerHTML = data[key]['name']
            cell2.innerHTML = data[key]['stars']
            cell3.innerHTML = data[key]['review_count']
        }
    } 
}
 
// adding event listener to sortby different
categorySelect.addEventListener("change", function () {
    if (sortby.value == 'reviewcount' && sorting.value == 'descending') {
        console.log(5)
        reviews = loadJSON('./data/review_countASC.json')
    }
    if (sortby.value == 'reviewcount' && sorting.value == 'ascending') {
        reviews = loadJSON('./data/review_countDSC.json')
    }
    if (sortby.value != 'reviewcount') {
        reviews = loadJSON('./data/reviews.json')
    }
    reviews.then(function(data) {
        reviewsdata = data
        AddRows(reviewsdata)
    })
})

// adding event listener to sortby ascending/descending
sorting.addEventListener("change", function (){
    if (sortby.value == 'reviewcount' && sorting.value == 'descending') {
        console.log(5)
        reviews = loadJSON('./data/review_countASC.json')
    }
    if (sortby.value == 'reviewcount' && sorting.value == 'ascending') {
        reviews = loadJSON('./data/review_countDSC.json')
    }
    if (sortby.value != 'reviewcount') {
        reviews = loadJSON('./data/reviews.json')
    }
    reviews.then(function(data) {
        reviewsdata = data
        AddRows(reviewsdata)
    })
})
// adding event listener to sortby column
sortby.addEventListener("change", function (){
    if (sortby.value == 'reviewcount' && sorting.value == 'descending') {
        console.log(5)
        reviews = loadJSON('./data/review_countASC.json')
    }
    if (sortby.value == 'reviewcount' && sorting.value == 'ascending') {
        reviews = loadJSON('./data/review_countDSC.json')
    }
    if (sortby.value != 'reviewcount') {
        reviews = loadJSON('./data/reviews.json')
    }
   
    reviews.then(function(data) {
        reviewsdata = data
        AddRows(reviewsdata)
    })
})

function init() {
    dataset = loadJSON('./data/reviews.json');
    dataset.then(function (data) {
        // Make data available globally
	    reviewData = data;

        plotPie(data);
        plotCol(data, false);
        plotPic();
        AddRows(data)
	});
}

document.addEventListener('DOMContentLoaded', init, false);