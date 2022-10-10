import { Component } from '@angular/core';
import { Chart, ChartDataset, ChartOptions } from 'chart.js';
import 'chartjs-adapter-luxon';
import StreamingPlugin from 'chartjs-plugin-streaming';
import { invoke } from "@tauri-apps/api/tauri";

Chart.register(StreamingPlugin);

interface Point {
  x: number,
  y: number
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  greetingMessage = "";
  booleanResult = "";
  generatedData: {[key: string]: Point[]} = {
    "Dataset 1": [],
    "Dataset 2": []
  };
  currentIndex = 0;


  constructor() {

    invoke("init_plc").then(r => console.log("plc initialized"));

    setInterval(() => {
      this.generateData()
    }, 1000)
  }

  public datasets: ChartDataset[] = [{
    label: 'Dataset 1',
    backgroundColor: 'rgba(255, 99, 132, 0.5)',
    borderColor: 'rgb(255, 99, 132)',
    borderDash: [8, 4],
    fill: false,
    data: []
  }, {
    label: 'Dataset 2',
    backgroundColor: 'rgba(54, 162, 235, 0.5)',
    borderColor: 'rgb(54, 162, 235)',
    cubicInterpolationMode: 'monotone',
    fill: false,
    data: []
  }];

  public options: ChartOptions = {
    scales: {
      x: {
        type: 'realtime',
        realtime: {
          delay: 2000,
          onRefresh: (chart: Chart) => {
            chart.data.datasets.forEach((dataset: ChartDataset) => {

              // grab correct data, if it exists
              if (this.generatedData[dataset.label!].length == 0) return;

              let currData = this.generatedData[dataset.label!]
              console.log(`Current index ${this.currentIndex}`)
              console.log(`Current label ${dataset.label}`)
              console.log(currData)
              console.log(currData[0])
              // console.log(`One item ${Object.values(currData)[this.currentIndex]}`)

              dataset.data.push({
                x: currData[this.currentIndex].x,
                y: currData[this.currentIndex].y
              });



              // dataset.data.push({
              //   x: Date.now(),
              //   y: Math.random()
              // });
              //
              // console.log(dataset.label);
            });

            this.currentIndex++;
          }
        }
      }
    }
  };


  generateData(): void {
    // let tag: string = "yo";
    // invoke<string>("read_bool", { tag }).then((text:string) => {
    //   this.booleanResult = text;
    // });

    this.generatedData['Dataset 1'].push({"x": Date.now(), "y": Math.random() * 5});
    this.generatedData['Dataset 2'].push({"x": Date.now(), "y": (Math.random() * 10) + 5});

    //console.log(this.generatedData)
  }


  greet(name: string): void {
    invoke<string>("greet", { name }).then((text:string) => {
      this.greetingMessage = text;
    });
  }
}
