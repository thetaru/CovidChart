import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import 'chartjs-plugin-zoom';
import axios from 'axios';

const fetched = async () => {
    try {
        const res = await axios.get("https://raw.githubusercontent.com/tokyo-metropolitan-gov/covid19/master/data/daily_positive_detail.json");
        const data = (res.data).data;
        //const dates = data.map(item => item.diagnosed_date);
        //const counts = data.map(item => item.count);
        //console.log(dates, counts);

        // https://stackoverflow.com/questions/63271287/chartjs-plugin-zoom-plugin-does-not-change-x-axis-labels
        // X: date, Y: count
        const dataXY = data.map(item => {
            return {
                x: item.diagnosed_date,
                y: item.count
            };
        });
        //console.log(dataXY)

        const graphData = {
            datasets: [
                {
                    label: "東京都の感染者数",
                    data: dataXY,
                    backgroundColor: 'rgba(255,100,100,0.6)',
                    bordorColor: 'rgba(255,100,100,1)',
                    bordorWidth: 1,
                    hoverBackgroundColor: 'rgba(255,100,100,0.9)',
                    hoverBordorColor: 'rgba(255,100,100,1)',
                },
            ]
        };
        return graphData;
    } catch (error) {
        console.error(error);
    }
}

const Graph = () => {
    // State
    const [fetchData, getData] = useState({});
    const [latestDate, getDate] = useState("");
    const [latestInfected, getInfected] = useState(0);
    const [currentChart, setChart] = useState({});

    useEffect(() => {
        fetched().then(graphData => {
            getData(graphData);
            getInfected((graphData.datasets[0].data.slice(-1)[0]).y);
            const splitDate = ((graphData.datasets[0].data.slice(-1)[0]).x).split('-');
            getDate((+splitDate[0]) + "年" + (+splitDate[1]) + "月" + (+splitDate[2]) + "日");
        }).catch(err => {
            console.log(err);
        });
    }, [ fetchData ]);
    
    const options = {
        responsive: true,
        maintainAspectRatio: false,
        legend: {
            display: false
        },
        scales: {
            yAxes: [{
                display: true,
                scaleLabel: {
                    display: true,
                    fontSize: 16
                },
            }],
            xAxes: [{
                type: 'time',
                time: {
                    unit: 'day'
                },
                distributions: 'series',
                display: true,
                scaleLabel: {
                    display: true,
                    fontSize: 1
                },
            }],
        },
        plugins: {
            zoom: {
                zoom: {
                    enabled: true,
                    drag: {
                        borderColor: 'rgba(255,255,255,0.3)',
                        borderWidth: 3,
                        backgroundColor: 'rgba(184,184,184,0.8)',
                        animationDuration: 0
                    },
                    mode: 'x',
                    rangeMin: {
                        x: null,
                        y: null
                    },
                    rangeMax: {
                        x: null,
                        y: null
                    },
                    speed: 0.1,
                    onZoom: function({chart}) {
                        setChart(chart);
                    }
                },
            },
        },
    };

    // CSS(めんどうなので...いつか移すこと)
    const style_infected = {
        fontWeight: "bold",
        color: "red",
        fontSize: "2vw",
    };
    const style_explain = {
        fontSize: "1vw",
    };

    const style_infected_person = {
        fontSize: "2vw",
        padding: "0.5vw",
    };

    const chart_container = {
        width: "90vw",
        height: "20vw",
        margin: "auto",
        padding: "5vw",
    }

    return (
        <div onDoubleClick={currentChart.resetZoom}>
            <header style={style_infected_person}>{latestDate} の 感染者 は <span style={style_infected}>{latestInfected}</span> 人です</header>
            <div style={style_explain}>ドラッグして範囲選択をすることで範囲を狭めることができます</div>
            <div style={style_explain}>ダブルクリックで元の倍率のグラフに戻すことができます</div>
            <div style={chart_container}>
                <Bar data={fetchData} options={options}></Bar>
            </div>
        </div>
    );
};

export default Graph;
