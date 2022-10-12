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
    "BaseBOOL": [],
    "BaseREAL": []
  };
  currentIndex = 0;
  boolNum: number = 0;
  realNum: number = 0;


  constructor() {

    invoke("init_plc").then(r => console.log("plc initialized"));

    setInterval(() => {
      this.generateData()
    }, 1000)

    setInterval(() => {
      this.getBool()
    }, 1000)

    setInterval(() => {
      this.getReal()
    }, 1000)
  }

  public datasets: ChartDataset[] = [{
    label: 'BaseBOOL',
    backgroundColor: 'rgba(255, 99, 132, 0.5)',
    borderColor: 'rgb(255, 99, 132)',
    borderDash: [8, 4],
    fill: false,
    data: []
  }, {
    label: 'BaseREAL',
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

    // this.generatedData['Dataset 1'].push({"x": Date.now(), "y": Math.random() * 5});
    // this.generatedData['Dataset 2'].push({"x": Date.now(), "y": (Math.random() * 10) + 5});

    this.generatedData['BaseBOOL'].push({"x": Date.now(), "y": this.boolNum });
    this.generatedData['BaseREAL'].push({"x": Date.now(), "y": this.realNum });

    //console.log(this.generatedData)
  }

  getBool(): void {
    let tag_name: string = "BaseBOOL";
    invoke<boolean>("read_bool", { tag: tag_name }).then((value:boolean) => {
       this.boolNum = Number(value);
    });
  }

  getReal(): void {
    let tag_name: string = "BaseREAL";
    invoke<number>("read_real", { tag: tag_name }).then((value:number) => {
      this.realNum = value;
    });
  }


  greet(name: string): void {
    invoke<string>("greet", { name }).then((text:string) => {
      this.greetingMessage = text;
    });
  }
}
