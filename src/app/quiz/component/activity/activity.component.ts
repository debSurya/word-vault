import { Component, OnInit, ViewChild, ViewChildren, ElementRef, AfterViewInit } from '@angular/core';
import { VaultComponent } from "./vault/vault.component";
import { McqComponent } from "./mcq/mcq.component";

@Component({
  selector: 'app-activity',
  templateUrl: './activity.component.html',
  styleUrls: ['./activity.component.scss']
})
export class ActivityComponent implements OnInit {

  constructor() { }

  roundVal: number;
  footerElements: any;
  animDataObj: {
    start: number,
    stop: number
  }
  @ViewChild('footerRounds') footerRounds: ElementRef;
  @ViewChild(VaultComponent) vault: VaultComponent;
  @ViewChild(McqComponent) mcq: McqComponent;

  ngOnInit() {
    this.footerElements = this.footerRounds.nativeElement.childNodes;
  }
  /** 
   * change background color on each round completion
  */
  footerRoundCompletion() {

    this.footerElements[this.roundVal - 1].style = 'background-color: #fabf0f';
    for (var i = 0; i < this.footerElements.length; i++) {
      if (i !== (this.roundVal - 1)) {
        this.footerElements[i].style = 'background-color: #fff';
      }
    }
  }

  /**
   * 
   * @param  $event to check for round completion and trigger mcq component
   */
  rotationStatus($event) {
    if ($event) {
      this.mcq.checkForRepeat();
    }
  }

  /**
   * 
   * @param  $event to check for round completion
   */
  receiveMessage($event) {
    this.roundVal = $event;
    this.footerRoundCompletion()
  }

  /**
   * 
   * @param  $event vault opening animation object stating start and stop of the vault images to trigger child vault component src
   */
  receiveAnimData($event) {
    this.vault.srcValue = $event.start;
    this.vault.stopRange = $event.stop;
    this.vault.changeSrc();
  }

  /**
   * 
   * @param  $event initialize vault image
   */
  initVault($event){
    this.vault.initVaultImage();
  }

}
