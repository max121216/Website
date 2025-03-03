import { AfterViewInit, Component, HostListener } from '@angular/core';
import { all, create } from 'mathjs';
import { FormsModule } from '@angular/forms';
import {ConsoleLogger} from '@angular/compiler-cli';

@Component({
  selector: 'app-fraktale',
  imports: [FormsModule],
  templateUrl: './fraktale.component.html',
  styleUrls: ['./fraktale.component.css']
})
export class FraktaleComponent implements AfterViewInit {

  zoomFactor: number = 1;  // Initialer Zoomfaktor
  depth: number = 4;       // Rekursionstiefe
  canvas!: HTMLCanvasElement;
  ctx!: CanvasRenderingContext2D;
  userFunction: string = "x + y, y - x"; // Standardwert
  private math = create(all); // Math.js Instanz

  // Offset für das Verschieben
  offsetX: number = 0;
  offsetY: number = 0;

  // Dragging-Status
  isDragging: boolean = false;
  lastMouseX: number = 0;
  lastMouseY: number = 0;

  //TODO:
  // Make Model so that we can save the fractals currently drawn.
  // also make the GUI responsive and show every function etc, with all options there
  // fix the Labels on the axis and make sure you can choose algorithm for each equation separately.
  // For example f1 = x + 1, y + 1 using Koch
  // f2 = x * sin(x), y * cos(y) using barnsley
  // Both should be drawn correctly in their respective algorithms
  ngAfterViewInit() {
    this.canvas = document.getElementById('fractalsCanvas') as HTMLCanvasElement;
    this.zoomFactor = 0.9;
    this.ctx = this.canvas?.getContext('2d')!;
    if (!this.canvas || !this.ctx) return;

    // Canvas-Größe setzen
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;

    // Event-Listener für Dragging
    this.canvas.addEventListener('mousedown', this.startDrag.bind(this));
    this.canvas.addEventListener('mousemove', this.drag.bind(this));
    this.canvas.addEventListener('mouseup', this.endDrag.bind(this));
    this.canvas.addEventListener('mouseleave', this.endDrag.bind(this));

    // Initiales Fraktal zeichnen
    this.drawAxes();
    alert("Drawing coordinate System");
    this.ctx.restore();

    // Canvas zurücksetzen
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.save();

    // Ursprung in die Mitte des Canvas setzen
    this.ctx.translate(this.canvas.width / 2 + this.offsetX, this.canvas.height / 2 + this.offsetY);
    this.ctx.scale(this.zoomFactor, this.zoomFactor);

    // Achsen zeichnen
    this.drawAxes();

    this.ctx.restore();

  }

  /** Startet das Dragging */
  startDrag(event: MouseEvent) {
    this.isDragging = true;
    this.lastMouseX = event.clientX;
    this.lastMouseY = event.clientY;
  }

  /** Bewegt das Canvas basierend auf der Maus */
  drag(event: MouseEvent) {
    if (!this.isDragging) return;

    // Berechnung der Bewegung
    const dx = event.clientX - this.lastMouseX;
    const dy = event.clientY - this.lastMouseY;

    this.offsetX += dx;
    this.offsetY += dy;

    this.lastMouseX = event.clientX;
    this.lastMouseY = event.clientY;

    this.drawFractal();
  }

  /** Beendet das Dragging */
  endDrag() {
    this.isDragging = false;
  }

  applyUserFunction() {
    try {
      console.log("Eingegebene Funktion:", this.userFunction);

      // Parsing und Überprüfung der Benutzerfunktion
      const compiledFunction = this.math.compile(`f(x, y) = [${this.userFunction}]`);
      const userFn = compiledFunction.evaluate(); // Funktion extrahieren!

      let testResult = userFn(1, 1);

      if (testResult?.toArray) {
        testResult = testResult.toArray();
      }

      console.log("Test-Output der Funktion:", testResult);

      if (!Array.isArray(testResult) || testResult.length !== 2 || isNaN(testResult[0]) || isNaN(testResult[1])) {
        throw new Error("Ungültige Rückgabewerte");
      }

      // Fraktal zeichnen
      this.generateFractal(this.kochFunction,0,0,5000)

    } catch (error) {
      console.error("Fehler beim Parsen der Funktion:", error);
      alert("Fehlerhafte Funktion! Bitte überprüfe deine Eingabe.");
    }
  }

  @HostListener('wheel', ['$event'])
  onWheel(event: WheelEvent) {
    if (event.deltaY < 0) {
      this.zoomFactor *= 1.1;  // Vergrößern
    } else {
      this.zoomFactor /= 1.1;  // Verkleinern
    }

    this.drawFractal();  // Alles neu zeichnen
    event.preventDefault();
  }

  generateFractal(fn: (x: number, y: number, iteration: number) => [number, number][], startX: number, startY: number, depth: number) {
    const maxPoints = 5000;
    let points: [number, number][] = [[startX, startY]]; // Startpunkt

    for (let i = 0; i < depth; i++) {
      let newPoints: [number, number][] = [];

      for (let [x, y] of points) {
        const results = fn(x, y, i);
        newPoints.push(...results);

        // Begrenze die Anzahl der Punkte auf maxPoints
        if (newPoints.length >= maxPoints) {
          newPoints = newPoints.slice(0, maxPoints);
          break;
        }
      }

      points = newPoints;

      // Zeichne die Punkte
      for (let [x, y] of points) {
        this.ctx.beginPath();
        this.ctx.arc(x, y, 1, 0, 2 * Math.PI);
        this.ctx.fill();
      }

      // Falls wir das Maximum erreicht haben, abbrechen
      if (points.length >= maxPoints) break;
    }
  }



  kochFunction(x: number, y: number, iteration: number): [number, number][] {
    const length = 10 / (iteration + 1);
    return [
      [x, y], // Originalpunkt beibehalten
      [x + length, y],
      [x + length / 2, y - length * Math.sqrt(3) / 2]
    ];
  }



  barnsleyFunction(x: number, y: number, iteration: number): [number, number][] {
    const r = Math.random();
    let newX = 0, newY = 0;

    if (r < 0.01) {
      newX = 0;
      newY = 0.16 * y;
    } else if (r < 0.86) {
      newX = 0.85 * x + 0.04 * y;
      newY = -0.04 * x + 0.85 * y + 1.6;
    } else if (r < 0.93) {
      newX = 0.2 * x - 0.26 * y;
      newY = 0.23 * x + 0.22 * y + 1.6;
    } else {
      newX = -0.15 * x + 0.28 * y;
      newY = 0.26 * x + 0.24 * y + 0.44;
    }

    return [[newX, newY]];
  }

  drawFractal() {
    if (!this.ctx) return;

    // Canvas zurücksetzen
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.save();

    // Ursprung in die Mitte des Canvas setzen
    this.ctx.translate(this.canvas.width / 2 + this.offsetX, this.canvas.height / 2 + this.offsetY);
    this.ctx.scale(this.zoomFactor, this.zoomFactor);

    // Achsen zeichnen
    this.drawAxes();

    //TODO:
    // Dynamically choose algorithm and actually save the Fractals so that the fractal depicted actually
    // changes lol

    // Fraktal generieren (z.B. Kochkurve oder benutzerdefinierte Funktion)
    this.generateFractal(this.kochFunction, 100, 100, this.depth);

    this.ctx.restore();
  }

  drawKochCurve(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, depth: number) {
    if (depth === 0) {
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
      return;
    }

    // Berechne die Zwischenpunkte
    const dx = (x2 - x1) / 3;
    const dy = (y2 - y1) / 3;
    const xA = x1 + dx;
    const yA = y1 + dy;
    const xB = x2 - dx;
    const yB = y2 - dy;
    const xC = (xA + xB) / 2 - (yB - yA) * Math.sqrt(3) / 2;
    const yC = (yA + yB) / 2 + (xB - xA) * Math.sqrt(3) / 2;

    this.drawKochCurve(ctx, x1, y1, xA, yA, depth - 1);
    this.drawKochCurve(ctx, xA, yA, xC, yC, depth - 1);
    this.drawKochCurve(ctx, xC, yC, xB, yB, depth - 1);
    this.drawKochCurve(ctx, xB, yB, x2, y2, depth - 1);
  }

  drawAxes() {
    this.ctx.strokeStyle = 'black';
    this.ctx.beginPath();
    this.ctx.moveTo(-this.canvas.width / 2, 0);
    this.ctx.lineTo(this.canvas.width / 2, 0);
    this.ctx.moveTo(0, -this.canvas.height / 2);
    this.ctx.lineTo(0, this.canvas.height / 2);
    this.ctx.stroke();
  }

}
