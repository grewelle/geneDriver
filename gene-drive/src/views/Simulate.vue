<template>
  <div>
      <!-- <div style="height: 94px;"></div> -->
      <div style="display: flex;">
        <div style="flex: 1; max-width: 350px;">
          <div style="padding: 10px;">
            <div style="height: 100px;"></div>
            <div style="box-shadow: 0 2px 2px 0 rgba(0,0,0,.14), 0 3px 1px -2px rgba(0,0,0,.12), 0 1px 5px 0 rgba(0,0,0,.2); padding: 16px; border-radius: 6px;">
              <h1>Controls</h1>
              <button @click="download">Download results as CSV</button>
              <button @click="edit">Edit data</button>
            </div>
          </div>
        </div>
        <div style="flex: 3;">
          <canvas ref="allPlot"></canvas>
          <canvas ref="geneDrivePlot"></canvas>
          <canvas ref="susceptiblePlot"></canvas>
          <canvas ref="heterozygousResistantPlot"></canvas>
          <canvas ref="homozygousResistantPlot"></canvas>
          <canvas ref="ABgPlot"></canvas>
          <canvas ref="BBgPlot"></canvas>
          <canvas ref="popSizePlot"></canvas>
        </div>
      </div>
    </div>
</template>

<script>
import Chart from 'chart.js';
import runSimulation from '../runSimulation';
const tf = require('@tensorflow/tfjs');

export default {
  data() {
    return {
      chart: null,
      sim: null
    }
  },
  async mounted() {
    this.init();
  },
  methods: {
    download() {
      let csv = 'data:text/csv;charset=utf-8,Generation,Pop Size,Susceptible,Heterozygous Resistant,Homozygous Resistant,ABg,BBg,Gene Drive';
      let { sAA, sAB, sBB, sABg, sBBg, sBgBg, gens, popSize } = this.sim;
      console.log(this.sim);

      for (let i = 0; i < sAA.length; i++) {
        csv += `\n${i},${popSize[i]},${sAA[i]},${sAB[i]},${sBB[i]},${sABg[i]},${sBBg[i]},${sBgBg[i]}`;
      }

      let encodedUri = encodeURI(csv);
      window.open(encodedUri);
    },
    edit() {
      this.$router.push({
        path: '/edit?data=' + this.$route.query.data
      });
    },
    async init() {
      let data = JSON.parse(this.$route.query.data);
      this.sim = await runSimulation(data);
      let { sAA, sAB, sBB, sABg, sBBg, sBgBg, gens, popSize } = this.sim;
      let t = tf.linspace(0, gens, gens + 1).arraySync();

      let allPlot = this.$refs.allPlot;

      function divide(arr, by) {
        return tf.tidy(() => {
          return tf.tensor1d(arr).div(by).arraySync();
        });
      }

      function plot(chart, data) {
        if (chart.chartjs_obj) {
          chart.chartjs_obj.data.labels = t;
          chart.chartjs_obj.data.datasets[0] = data;

          chart.chartjs_obj.update();
        } else {
          chart.chartjs_obj = new Chart(chart.getContext('2d'), {
            type: 'line',
            data: {
              labels: t,
              datasets: [ data ]
            },
            options: {
              scales: {
                yAxes: [{
                  ticks: {
                    beginAtZero: true
                  },
                  scaleLabel: {
                    display: true,
                    labelString: 'Frequency'
                  }
                }],
                xAxes: [{
                ticks: {
                  beginAtZero: true
                },
                scaleLabel: {
                  display: true,
                  labelString: 'Generations'
                }
              }]
              }
            }
          });
        }

        if (data.label !== 'Pop Size') allPlot.chartjs_obj.data.datasets.push(data);
      }

      if (allPlot.chartjs_obj) {
        allPlot.chartjs_obj.data.labels = t;
        allPlot.chartjs_obj.data.datasets = [];
      } else {
        allPlot.chartjs_obj = new Chart(allPlot.getContext('2d'), {
          type: 'line',
          data: {
            labels: t,
            datasets: []
          },
          options: {
            scales: {
              yAxes: [{
                ticks: {
                  beginAtZero: true
                },
                scaleLabel: {
                  display: true,
                  labelString: 'Frequency'
                }
              }],
              xAxes: [{
                ticks: {
                  beginAtZero: true
                },
                scaleLabel: {
                  display: true,
                  labelString: 'Generations'
                }
              }]
            }
          }
        });
      }

      plot(this.$refs.susceptiblePlot, {
        label: 'Susceptible',
        fill: true,
        data: divide(sAA, popSize),
        backgroundColor: 'rgba(0, 0, 241, .4)',
        borderColor: 'rgba(0, 0, 241, 1)'
      });

      plot(this.$refs.heterozygousResistantPlot, {
        label: 'Heterozygous Resistant',
        fill: true,
        data: divide(sAB, popSize),
        backgroundColor: 'rgba(241, 0, 0, .4)',
        borderColor: 'rgba(241, 0, 0, 1)'
      });

      plot(this.$refs.homozygousResistantPlot, {
        label: 'Homozygous Resistant',
        fill: true,
        data: divide(sBB, popSize),
        backgroundColor: 'rgba(0, 241, 0, .4)',
        borderColor: 'rgba(0, 241, 0, 1)'
      });

      plot(this.$refs.ABgPlot, {
        label: 'ABg',
        fill: true,
        data: divide(sABg, popSize),
        backgroundColor: 'rgba(200, 120, 0, .4)',
        borderColor: 'rgba(200, 120, 0, 1)'
      });

      plot(this.$refs.BBgPlot, {
        label: 'BBg',
        fill: true,
        data: divide(sBBg, popSize),
        backgroundColor: 'rgba(90, 200, 200, .4)',
        borderColor: 'rgba(90, 200, 200, 1)'
      });

      plot(this.$refs.geneDrivePlot, {
        label: 'Gene Drive',
        fill: true,
        data: divide(sBgBg, popSize),
        backgroundColor: 'rgba(220, 50, 220, .4)',
        borderColor: 'rgba(220, 50, 220, 1)'
      });

      plot(this.$refs.popSizePlot, {
        label: 'Pop Size',
        fill: true,
        data: popSize,
        backgroundColor: 'rgba(220, 50, 220, .4)',
        borderColor: 'rgba(220, 50, 220, 1)'
      });

      allPlot.chartjs_obj.update();
    }
  }
}
</script>


<style scoped>
button {
  padding: 10px 0;
  border-radius: 4px;
  background: rgb(99, 200, 217);
  color: black;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
  display: block;
  margin-top: 18px;
  width: 100%;
}
</style>