import {AfterViewInit, ChangeDetectorRef, Component, HostListener} from '@angular/core';
import { all, create } from 'mathjs';
import { FormsModule } from '@angular/forms';
import {CommonModule} from '@angular/common';
import {fractalsModel} from './fractalsModel';

@Component({
  selector: 'app-fraktale',
  imports: [FormsModule, CommonModule],
  templateUrl: './fraktale.component.html',
  styleUrls: ['./fraktale.component.css']
})
export class FraktaleComponent implements AfterViewInit {

  zoomFactor: number = 1;
  depth: number = 10000;
  canvas!: HTMLCanvasElement;
  ctx!: CanvasRenderingContext2D;
  userFunction: string = "x + y, y - x";
  private math = create(all);

  // Auswahl des Algorithmus, standardmäßig z. B. "koch"
  selectedAlgorithm: string = 'circle';

  // Koch-Kurve: z. B. Tiefe oder Länge
  kochParam: number = 10;

  // Circle: z. B. Start-Radius
  circleRadius: number = 500;

  // Ellipse:
  ellipseHeight: number = 400;
  ellipseWidth: number = 300;

  // Barnsley-Farn: eventuell andere Parameter
  barnsleyParam: number = 1;

  offsetX: number = 0;
  offsetY: number = 0;
  isDragging: boolean = false;
  lastMouseX: number = 0;
  lastMouseY: number = 0;

  fractals: fractalsModel[] = [];

  ngAfterViewInit() {
    setTimeout(() => {  // Warten, bis das HTML geladen ist
      this.canvas = document.getElementById('fractalsCanvas') as HTMLCanvasElement;
      if (!this.canvas) {
        console.error("Canvas element not found!");
        return;
      }

      this.ctx = this.canvas.getContext('2d')!;
      if (!this.ctx) {
        console.error("Canvas context not initialized!");
        return;
      }

      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;

      this.canvas.addEventListener('mousedown', this.startDrag.bind(this));
      this.canvas.addEventListener('mousemove', this.drag.bind(this));
      this.canvas.addEventListener('mouseup', this.endDrag.bind(this));
      this.canvas.addEventListener('mouseleave', this.endDrag.bind(this));

      this.drawFractal();
    });
  }


  startDrag(event: MouseEvent) {
    this.isDragging = true;
    this.lastMouseX = event.clientX;
    this.lastMouseY = event.clientY;
  }

  drag(event: MouseEvent) {
    if (!this.isDragging) return;
    this.offsetX += event.clientX - this.lastMouseX;
    this.offsetY += event.clientY - this.lastMouseY;
    this.lastMouseX = event.clientX;
    this.lastMouseY = event.clientY;
    this.drawFractal();
  }

  endDrag() {
    this.isDragging = false;
  }

  @HostListener('wheel', ['$event'])
  onWheel(event: WheelEvent) {
    this.zoomFactor *= event.deltaY < 0 ? 1.1 : 0.9;
    this.drawFractal();
    event.preventDefault();
  }

  constructor(private cdr: ChangeDetectorRef) {}

  onAlgorithmChange(event: Event): void {
    // Hier kannst du zusätzliche Logik einfügen,
    // beispielsweise Parameter zurücksetzen oder andere Aktionen ausführen.
    console.log('Ausgewählt:', this.selectedAlgorithm);

    // Den ChangeDetector explizit anstoßen, damit Angular die Änderung sofort erkennt.
    this.cdr.detectChanges();
  }
  applyUserFunction() {
    const fractal: fractalsModel = new fractalsModel();
    fractal.algorithm = this.selectedAlgorithm;
    fractal.iterations = 5000 // Default
    switch (this.selectedAlgorithm){
      case "circle":
        fractal.params = {
          radius: this.circleRadius
        }
        break;
      case "ellipse":
        fractal.params = {
          height: this.ellipseHeight,
          width: this.ellipseWidth
        }
        break;
      case "koch":
        fractal.params = {
          iterations: this.kochParam
        }
        break;
    }
    // color: string
    fractal.params["color"] = "black";
    this.fractals.push(fractal);
    this.drawFractal();
    //this.drawCircles(this.canvas.width/2,this.canvas.height/2,750)
  }

  drawCircles(x: number, y: number, radius: number) {
    // Dynamische Anpassung der Strichstärke basierend auf dem Zoom
    const lineWidth = Math.max(1, 5 / this.zoomFactor);  // Stellt sicher, dass die Linie nicht zu dünn wird

    // Überprüfen, ob der Radius noch groß genug ist, um weitere Kreise zu zeichnen
    if (radius > 4) {
      // Rekursive Aufrufe zum Zeichnen der kleineren Kreise
      this.drawCircles(x + radius / 2, y, radius / 2);
      this.drawCircles(x - radius / 2, y, radius / 2);
    }

    // Zufällige Farbe für den Füllbereich generieren
    const randomColor = `rgb(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)})`;

    // Setze die zufällige Füllfarbe
    this.ctx.fillStyle = randomColor;

    // Setze die Strichstärke
    this.ctx.lineWidth = lineWidth;

    // Beginne einen neuen Pfad
    this.ctx.beginPath();

    // Zeichne die erste Ellipse
    this.ctx.ellipse(x + radius / 2, y, radius, radius, 0, 0, 2 * Math.PI);

    // Zeichne die zweite Ellipse
    this.ctx.ellipse(x - radius / 2, y, radius, radius, 0, 0, 2 * Math.PI);

    // Wende die Linie an
    this.ctx.stroke();


  }

  drawEllipse(x: number, y: number, width: number, height: number) {
    // Dynamische Anpassung der Strichstärke basierend auf dem Zoom
    const lineWidth = Math.max(1, 5 / this.zoomFactor);  // Stellt sicher, dass die Linie nicht zu dünn wird

    // Überprüfen, ob die Ellipse noch groß genug ist, um weitere zu zeichnen
    if (width > 4 && height > 4) {
      // Rekursive Aufrufe zum Zeichnen der kleineren Ellipsen
      this.drawEllipse(x + width / 2, y, width / 2, height / 2);
      this.drawEllipse(x - width / 2, y, width / 2, height / 2);
    }

    // Zufällige Farbe für den Füllbereich generieren
    // const randomColor = `rgb(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)})`;

    // Setze die zufällige Füllfarbe
    // this.ctx.fillStyle = randomColor;

    // Setze die Strichstärke
    this.ctx.lineWidth = lineWidth;

    // Beginne einen neuen Pfad
    this.ctx.beginPath();

    // Zeichne die erste Ellipse
    this.ctx.ellipse(x + width / 2, y, width / 2, height / 2, 0, 0, 2 * Math.PI);
    //this.ctx.fill();
    this.ctx.stroke();

    // Zeichne die zweite Ellipse
    this.ctx.beginPath();
    this.ctx.ellipse(x - width / 2, y, width / 2, height / 2, 0, 0, 2 * Math.PI);
    //this.ctx.fill();
    this.ctx.stroke();
  }



  generateFractal(fn: (x: number, y: number, iteration: number) => [number, number][], startX: number, startY: number, depth: number) {
    const maxPoints = 5000;
    let points: [number, number][] = [[startX, startY]];

    // Berechne neue Punkte basierend auf dem Zoom-Faktor
    for (let i = 0; i < depth; i++) {
      let newPoints: [number, number][] = [];
      for (let [x, y] of points) {
        newPoints.push(...fn(x, y, i));
        if (newPoints.length >= maxPoints) break;
      }
      points = newPoints;
      for (let [x, y] of points) {
        this.ctx.beginPath();
        this.ctx.arc(x, y, 1, 0, 2 * Math.PI);
        this.ctx.fill();
      }
      if (points.length >= maxPoints) break;
    }
  }
  kochFunction(x: number, y: number, iteration: number): [number, number][] {
    const length = 10 / (iteration + 1);
    return [[x, y], [x + length, y], [x + length / 2, y - length * Math.sqrt(3) / 2]];
  }

  barnsleyFunction(x: number, y: number, iteration: number): [number, number][] {
    const r = Math.random();
    if (r < 0.01) return [[0, 0.16 * y]];
    if (r < 0.86) return [[0.85 * x + 0.04 * y, -0.04 * x + 0.85 * y + 1.6]];
    if (r < 0.93) return [[0.2 * x - 0.26 * y, 0.23 * x + 0.22 * y + 1.6]];
    return [[-0.15 * x + 0.28 * y, 0.26 * x + 0.24 * y + 0.44]];
  }

  drawFractal() {
    if (!this.ctx) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.save();

    // Korrigiere die Position, damit das Fraktal bei Zoom und Verschiebung nicht verschoben wird
    this.ctx.translate(this.canvas.width / 2 + this.offsetX, this.canvas.height / 2 + this.offsetY);
    this.ctx.scale(this.zoomFactor, this.zoomFactor);

    this.drawAxes();  // Zeichne die Achsen mit Zoom

    // Zeichne das Fraktal
    for (const fractal of this.fractals) {
      switch (fractal.algorithm){
        case "circle":
          this.drawCircles(0,0,fractal.params["radius"])
          break;
        case "ellipse":
          this.drawEllipse(0,0,fractal.params["width"],fractal.params["height"])
      }


    }

    this.ctx.restore();
  }

  // Method to get Dropdown Options in the html
  getDropdownOptions(): Array<{ value: string; label: string }> {
    console.log
    return [
      { value: 'circle', label: 'Circle Recursion' },
      { value: 'ellipse', label: 'Ellipse Recursion' },
      { value: 'koch', label: 'Koch-Curve' }
    ];
  }

  drawAxes() {
    // Dynamische Anpassung der Achsen-Strichstärke basierend auf dem Zoom
    const axisLineWidth = Math.max(1, 3 / this.zoomFactor);  // Setze die minimale Strichstärke auf 1, damit die Achsen sichtbar bleiben

    // Setze die Strichstärke für die Achsen
    this.ctx.lineWidth = axisLineWidth;

    // Achsen zeichnen
    this.ctx.strokeStyle = 'black';
    this.ctx.beginPath();

    // Horizontale Achse
    this.ctx.moveTo(-this.canvas.width / 2, 0);
    this.ctx.lineTo(this.canvas.width / 2, 0);

    // Vertikale Achse
    this.ctx.moveTo(0, -this.canvas.height / 2);
    this.ctx.lineTo(0, this.canvas.height / 2);

    // Zeichne die Achsen
    this.ctx.stroke();
  }

}
