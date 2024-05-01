import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  ViewChild
} from '@angular/core';

import { Random } from 'random-js';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  @ViewChild('btn') btn: ElementRef;
  @ViewChild('img') img: ElementRef;
  @ViewChild('text') text: ElementRef;

  random = new Random(); 

  
  steps = 4;
  populations = 5;

  vector = [];
  elementsCount = 0;
  crossed = [];
  fav = [];

  likes = 0;
  elements = [];

  mutation = 10;

  currentIndex = -1;
  firstGenerations = true;

  network_elements_count = 5;
  radius = 100;
  network = [];
  average = [];

  switchBorderBlock = true;
  borderColor = '#6495ed3d';

  max = { w: 0, h: 0, x: 0, y: 0 };
  min = { w: 2000, h: 2000, x: 2000, y: 2000 };

  constructor(private ref: ChangeDetectorRef) {}


  getRandomImage() {
    const randomIndex = this.random.integer(1, 6);
    return '../assets/toster_' + randomIndex + '.jpg';
  }

  borderBlock() {
    this.switchBorderBlock = !this.switchBorderBlock;
    this.borderColor = this.switchBorderBlock ? '#6495ed3d' : 'transparent';
  }

  clickOnElement(index, elem) {
    this.currentIndex = index;
    const { x, y } = this.getComputedTranslateXY(elem);
    this.elements[this.currentIndex].c.x = x;
    this.elements[this.currentIndex].c.y = y;
    this.elements[this.currentIndex].c.w = elem.clientWidth;
    this.elements[this.currentIndex].c.h = elem.clientHeight;
  }

  findMax(a, b) {
    return (a >= b) ? a : b;
  }

  findMin(a, b) {
    return (a <= b) ? a : b;
  }

  translateIntoVector() {
    const array = [];
    this.elements.forEach(e => {
      array.push(e.c.w, e.c.h, e.c.x, e.c.y); 
    });
    return array;
  }


  translateIntoObject(item) {
      const itm = item.slice(0);
      let i = 0;

      
      const elementsCopy = this.elements.slice(0);

      while (itm.length > 0) {
        elementsCopy[i].c.w = itm.shift();
        elementsCopy[i].c.h = itm.shift();
        elementsCopy[i].c.x = itm.shift();
        elementsCopy[i].c.y = itm.shift();

       
        this.max.w = this.findMax(elementsCopy[i].m2.w, this.max.w);
        this.max.h = this.findMax(elementsCopy[i].m2.h, this.max.h);
        this.max.x = this.findMax(elementsCopy[i].m2.x, this.max.x);
        this.max.y = this.findMax(elementsCopy[i].m2.y, this.max.y);

       
        this.min.w = this.findMin(elementsCopy[i].m1.w, this.min.w);
        this.min.h = this.findMin(elementsCopy[i].m1.h, this.min.h);
        this.min.x = this.findMin(elementsCopy[i].m1.x, this.min.x);
        this.min.y = this.findMin(elementsCopy[i].m1.y, this.min.y);

        i++;
      }

      return elementsCopy;

  }

  start(like?) {
    let intoVector = [];
    if (like) {
      this.likes++;
      intoVector = this.translateIntoVector();
      this.fav.push(intoVector);

      if (!this.firstGenerations) {
        this.vector.push(intoVector);
      }
    }

    if (this.likes >= this.steps) {
      this.firstGenerations = false;
      this.crossed = [];
      this.crossing();
      this.likes = 0;
    }

    if (this.firstGenerations) {
        this.elements.forEach(elem => {
          this.placement(elem);
        });
      }
  }

  render(item) {
    this.elements = this.translateIntoObject(item);
  }


  prediction() {
    this.network = [];

    let randW = 0;
    let randH = 0;
    let randX = 0;
    let randY = 0;

    const len = this.elementsCount;
    let i = 0;

    while (i < this.network_elements_count) {
      const buffer = [];
      for (let j = 0; j < len; j++) {
        randW = this.random.integer(this.min.w, this.max.w);
        randH = this.random.integer(this.min.h, this.max.h);

        randX = this.random.integer(this.min.x, this.max.x);
        randY = this.random.integer(this.min.y, this.max.y);
        buffer.push(randW, randH, randX, randY);
      }

      if ( this.compute_distance(buffer) ) {
          this.network.push(buffer);
          i++;
      }

    }

  }

  compute_distance(item) {

    let d = 0;
    const avg = this.compute_average();
    

    for (let i = 0; i < avg.length; i++) {
      d += Math.pow(item[i] - avg[i], 2);
    }

    const dist = Math.sqrt(d);
    console.log('radius', this.radius);
    return dist <= this.radius * this.elementsCount;
  }

  compute_average() {
    const v = this.vector.slice(0);
    const len = v.length;
    const elems = v[0].length;
    const avg = [elems];

    for (let j = 0; j < elems; j++) {
      avg[j] = 0;
      for (let i = 0; i < len; i++) {
        avg[j] += v[i][j];
      }
      avg[j] = Math.floor(avg[j] / len);
    }
    this.average = avg;
    return avg;
  }



  validate(elem) {
    let k = 0;
    elem.forEach(e => {
      if (e.c.w >= e.m1.w &&
        e.c.w <= e.m2.w &&
        e.c.h >= e.m1.h &&
        e.c.h <= e.m2.h &&
        e.c.x >= e.m1.x &&
        e.c.x <= e.m2.x &&
        e.c.y >= e.m1.y &&
        e.c.y <= e.m2.y) {
        k++;
      }
    });

    if (k === elem.length) {
      return true;
    }

  }

  placement(elem) {
    const randW = this.random.integer(elem.m1.w, elem.m2.w);
    const randH = this.random.integer(elem.m1.h, elem.m2.h);

    const randX = this.random.integer(elem.m1.x, elem.m2.x);
    const randY = this.random.integer(elem.m1.y, elem.m2.y);

    elem.border.x = elem.m1.x;
    elem.border.y = elem.m1.y;

    elem.border.width = elem.m2.x - elem.m1.x + elem.m2.w;
    elem.border.height = elem.m2.y - elem.m1.y + elem.m2.h;

    elem.c.w = randW;
    elem.c.h = randH;
    elem.c.x = randX;
    elem.c.y = randY;
  }

  doCrossing(elem1: number[], elem2: number[], mutation: number) {
    const len = elem1.length;
    const arr1 = elem1.slice(0);
    const arr2 = elem2.slice(0);

    const rand = this.random.integer(0, len - 1); 

    let mut = 0;
    if (mutation >= 0) {
      mut = this.random.integer(0, mutation); 
    } else {
      mut = this.random.integer(mutation, 0); 
    }

    
    let swap1 = arr1[rand];
    let swap2 = arr2[rand];

    swap1 += mut;
    swap2 += mut;

    arr1[rand] = swap2;
    arr2[rand] = swap1;

    

    if (
      this.validate(this.translateIntoObject(arr1)) &&
      this.validate(this.translateIntoObject(arr2))
    ) {
      return this.random.bool() ? arr1 : arr2;
    } else {
      

      mutation -= 1;

      return this.doCrossing(elem1, elem2, mutation);
    }
  }

  crossing() {
    const len = this.fav.length;
    let i = 0;
    while (i !== this.populations) {
      
      const first = this.random.integer(0, len - 1);
      const second = this.random.integer(0, len - 1);

      this.crossed.push(
        this.doCrossing(this.fav[first], this.fav[second], this.mutation)
      );

      
      i++;
    }

    this.fav = [];
  }

  getComputedTranslateXY(obj) {
    if (!window.getComputedStyle) {
      return;
    }
    const style = getComputedStyle(obj);
    const transform = style.transform;

    const mat = transform.match(/^matrix\((.+)\)$/);

    if (mat) {
      return {
        x: parseFloat(mat[1].split(", ")[4]),
        y: parseFloat(mat[1].split(", ")[5])
      };
    }
    return { x: 0, y: 0 };
  }

  addElement(outlet) {
    this.elements.push({
      border: {
        x: '',
        y: '',
        width: '',
        height: ''
      },
      outlet,
      imageSrc : this.getRandomImage(),
      c: { w: 200, h: 200, x: 0, y: 0 },
      m1: { w: 100, h: 100, x: 0, y: 0 },
      m2: { w: 200, h: 200, x: 0, y: 0 }
    });
    this.elementsCount++;
    this.ref.detectChanges();
  }

  fixTopLeft() {
    this.elements[this.currentIndex].m1.x = this.elements[this.currentIndex].c.x;
    this.elements[this.currentIndex].m1.y = this.elements[this.currentIndex].c.y;
  }

  fixRightDown() {
    this.elements[this.currentIndex].m2.x = this.elements[this.currentIndex].c.x;
    this.elements[this.currentIndex].m2.y = this.elements[this.currentIndex].c.y;
  }

  fixMinWidth() {
    this.elements[this.currentIndex].m1.w = this.elements[this.currentIndex].c.w;
  }

  fixMaxWidth() {
    this.elements[this.currentIndex].m2.w = this.elements[this.currentIndex].c.w;
  }

  fixMinHeight() {
    this.elements[this.currentIndex].m1.h = this.elements[this.currentIndex].c.h;
  }

  fixMaxHeight() {
    this.elements[this.currentIndex].m2.h = this.elements[this.currentIndex].c.h;
  }
}
