import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SoundService {

  constructor() { }

  playSound(src:string){
    var audio=new Audio(src);
    audio.play();
  }
}
